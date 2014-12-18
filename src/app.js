(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: TaskModel,
	initialize : function() {
		this.subscribe();
	},
	comparator : function(model) {
		return model.get('sortindex');
	},
	linkChildren : function() {
		this.each(function(task) {
			if (!task.get('parentid')) {
				return;
			}
			var parentTask = this.get(task.get('parentid'));
			if (parentTask) {
				if (parentTask === task) {
					task.set('parentid', 0);
				} else {
					parentTask.children.add(task);
				}
			} else {
				task.set('parentid', 0);
				console.error('task has parent with id ' + task.get('parentid') + ' - but there is no such task');
			}
		}.bind(this));
	},
	_sortChildren : function (task, sortIndex) {
		task.children.toArray().forEach(function(child) {
			child.set('sortindex', ++sortIndex);
			sortIndex = this._sortChildren(child, sortIndex);
		}.bind(this));
		return sortIndex;
	},
	checkSortedIndex : function() {
		var sortIndex = 0;
		this.toArray().forEach(function(task) {
			if (task.get('parentid')) {
				return;
			}
			task.set('sortindex', ++sortIndex);
			sortIndex = this._sortChildren(task, sortIndex);
		}.bind(this));
		this.sort();
	},
	resort : function(data) {
		var sortIndex = 0;
		var self = this;
		data.forEach(function(parentData) {
			var parentModel = this.get(parentData.id);
			var prevSort = parentModel.get('sortindex');
			if (prevSort !== ++sortIndex) {
				parentModel.set('sortindex', sortIndex).save();
			}
			if (parentModel.get('parentid')) {
				parentModel.set('parentid', 0).save();
			}
			parentData.children.forEach(function(childData) {
				var childModel = self.get(childData.id);
				var prevSortI = childModel.get('sortindex');
				if (prevSortI !== ++sortIndex) {
					childModel.set('sortindex', sortIndex).save();
				}
				if (childModel.get('parentid') !== parentModel.id) {
					childModel.set('parentid', parentModel.id).save();
					var parent = self.find(function(m) {
						return m.id === parentModel.id;
					});
					parent.children.add(childModel);
				}
			});
		}.bind(this));
		this.sort();
		this.checkSortedIndex();
	},
	subscribe : function() {
		this.listenTo(this, 'add', function(model) {
			if (model.get('parentid')) {
				var parent = this.find(function(m) {
					return m.id === model.get('parentid');
				});
				if (parent) {
					parent.children.add(model);
				} else {
					console.warn('can not find parent with id ' + model.get('parentid'));
					model.set('parentid', 0);
				}
			}
		});
	}
});

module.exports = TaskCollection;


},{"../models/TaskModel":4}],2:[function(require,module,exports){

var TaskCollection = require('./collections/taskCollection');
var Settings = require('./models/SettingModel');

var GanttView = require('./views/GanttView');
var util = require('./utils/util');

$(function () {
	var app = {};
	app.tasks = new TaskCollection();

	// detect API params from get, e.g. ?project=143&profile=17
	var params = util.getURLParams();
	if (params.project && params.profile) {
		app.tasks.url = 'api/tasks/' + params.project + '/' + params.profile;
	}

	app.tasks.fetch({
		success : function() {
			console.log('Success loading tasks.');
			app.settings = new Settings({}, {app : app});
			app.tasks.linkChildren();
			app.tasks.checkSortedIndex();
			new GanttView({
				app : app,
				collection : app.tasks
			}).render();
			$('#loader').fadeOut();
		},
		error : function(err) {
			console.error('error loading');
			console.error(err);
		}
	}, {parse: true});
});

},{"./collections/taskCollection":1,"./models/SettingModel":3,"./utils/util":5,"./views/GanttView":7}],3:[function(require,module,exports){
var util = require('../utils/util');

var app = {};

var hfunc = function(pos, evt) {
	var dragInterval = app.settings.getSetting('attr', 'dragInterval');
	var n = Math.round((pos.x - evt.inipos.x) / dragInterval);
	return {
		x: evt.inipos.x + n * dragInterval,
		y: this.getAbsolutePosition().y
	};
};

var SettingModel = Backbone.Model.extend({
	defaults: {
		interval: 'fix',
		//days per interval
		dpi: 1
	},
	initialize: function(attrs, params) {
		this.app = params.app;
		app = this.app;
		this.sattr = {
			hData: {},
			dragInterval: 1,
			daysWidth: 5,
			cellWidth: 35,
			minDate: new Date(2020,1,1),
			maxDate: new Date(0,0,0),
			boundaryMin: new Date(0,0,0),
			boundaryMax: new Date(2020,1,1),
			//months per cell
			mpc: 1
		};

		this.sdisplay = {
			screenWidth:  $('#gantt-container').innerWidth() + 786,
			tHiddenWidth: 305,
			tableWidth: 710
		};

		this.sgroup = {
			currentY: 0,
			iniY: 60,
			active: false,
			topBar: {
				fill: '#666',
				height: 12,
				strokeEnabled: false
			},
			gap: 3,
			rowHeight: 22,
			draggable: true,
			dragBoundFunc: hfunc
		};

		this.sbar = {
			barheight: 12,
			gap: 20,
			rowheight:  60,
			draggable: true,
			resizable: true,
			dragBoundFunc: hfunc,
			resizeBoundFunc: hfunc,
			subgroup: true
		};
		this.sform={
			'name': {
				editable: true,
				type: 'text'
			},
			'start': {
				editable: true,
				type: 'date',
				d2t: function(d){
					return d.toString('dd/MM/yyyy');
				},
				t2d: function(t){
					return Date.parseExact( util.correctdate(t), 'dd/MM/yyyy');
				}
			},
			'end': {
				editable: true,
				type: 'date',
				d2t: function(d){
					return d.toString('dd/MM/yyyy');
				},
				t2d: function(t){
					return Date.parseExact( util.correctdate(t), 'dd/MM/yyyy');
				}
			},
			'status': {
				editable: true,
				type: 'select',
				options: {
					'110': 'complete',
					'109': 'open',
					'108' : 'ready'
				}
			},
			'complete': {
				editable: true,
				type: 'text'
			},
			'duration': {
				editable: true,
				type: 'text',
				d2t: function(t,model){
					return Date.daysdiff(model.get('start'),model.get('end'));
				}
			}
		
		};
		this.getFormElem = this.createElem();
		this.collection = this.app.tasks;
		this.calculateIntervals();
		this.on('change:interval change:dpi', this.calculateIntervals);
	},
	getSetting: function(from, attr){
		if(attr){
			return this['s' + from][attr];
		}
		return this['s' + from];
	},
	calcminmax: function() {
		var minDate = new Date(2020,1,1), maxDate = new Date(0,0,0);
		
		this.collection.each(function(model) {
			if (model.get('start').compareTo(minDate) === -1) {
				minDate=model.get('start');
			}
			if (model.get('end').compareTo(maxDate) === 1) {
				maxDate=model.get('end');
			}
		});
		this.sattr.minDate = minDate;
		this.sattr.maxDate = maxDate;
		
	},
	setAttributes: function() {
		var end,sattr=this.sattr,dattr=this.sdisplay,duration,size,cellWidth,dpi,retfunc,start,last,i=0,j=0,iLen=0,next=null;
		
		var interval = this.get('interval');

		if (interval === 'daily') {
			this.set('dpi', 1, {silent: true});
			end = sattr.maxDate.clone().addDays(20);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20);
			sattr.daysWidth = 12;
			sattr.cellWidth = sattr.daysWidth;
			sattr.dragInterval = sattr.daysWidth;
			retfunc = function(date){
				return date.clone().addDays(1);
			};
			sattr.mpc = 1;
			
		} else if(interval === 'weekly') {
			this.set('dpi', 7, {silent: true});
			end = sattr.maxDate.clone().addDays(20 * 7);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20 * 7).moveToDayOfWeek(1, -1);
			sattr.daysWidth = 5;
			sattr.cellWidth = sattr.daysWidth * 7;
			sattr.dragInterval = sattr.daysWidth;
			sattr.mpc = 1;
			retfunc = function(date){
				return date.clone().addDays(7);
			};
		} else if (interval === 'monthly') {
			this.set('dpi', 30, {silent: true});
			end = sattr.maxDate.clone().addDays(20 * 30);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20 * 30).moveToFirstDayOfMonth();
			sattr.daysWidth = 2;
			sattr.cellWidth = 'auto';
			sattr.dragInterval = 7 * sattr.daysWidth;
			sattr.mpc = 1;
			retfunc = function(date){
				return date.clone().addMonths(1);
			};
		} else if (interval === 'quarterly') {
			this.set('dpi', 30, {silent: true});
			end = sattr.maxDate.clone().addDays(20 * 30);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20 * 30);
			sattr.boundaryMin.moveToFirstDayOfQuarter();
			sattr.daysWidth = 1;
			sattr.cellWidth = 'auto';
			sattr.dragInterval = 30 * sattr.daysWidth;
			sattr.mpc = 3;
			retfunc = function(date){
				return date.clone().addMonths(3);
			};
		} else if (interval === 'fix') {
			cellWidth = 30;
			duration = Date.daysdiff(sattr.minDate, sattr.maxDate);
			size = dattr.screenWidth - dattr.tHiddenWidth - 100;
			sattr.daysWidth = size / duration;
			dpi = Math.round(cellWidth / sattr.daysWidth);
			this.set('dpi', dpi, {silent: true});
			sattr.cellWidth = dpi * sattr.daysWidth;
			sattr.boundaryMin = sattr.minDate.clone().addDays(-2 * dpi);
			sattr.dragInterval = Math.round(0.3 * dpi) * sattr.daysWidth;
			end = sattr.maxDate.clone().addDays(2 * dpi);
			sattr.mpc = Math.max(1, Math.round(dpi / 30));
			retfunc = function(date){
				return date.clone().addDays(dpi);
			};
		} else if (interval==='auto') {
			dpi = this.get('dpi');
			sattr.cellWidth = (1 + Math.log(dpi)) * 12;
			sattr.daysWidth = sattr.cellWidth / dpi;
			sattr.boundaryMin = sattr.minDate.clone().addDays(-20 * dpi);
			end = sattr.maxDate.clone().addDays(20 * dpi);
			sattr.mpc = Math.max(1, Math.round(dpi / 30));
			retfunc = function(date) {
				return date.clone().addDays(dpi);
			};
			sattr.dragInterval = Math.round(0.3 * dpi) * sattr.daysWidth;
		}
		var hData = {
			'1': [],
			'2': [],
			'3': []
		};
		var hdata3 = [];
		
		start = sattr.boundaryMin;
		
		last = start;
		if (interval === 'monthly' || interval === 'quarterly') {
			var durfunc;
			if (interval==='monthly') {
				durfunc = function(date) {
					return Date.getDaysInMonth(date.getFullYear(),date.getMonth());
				};
			} else {
				durfunc = function(date) {
					return Date.getDaysInQuarter(date.getFullYear(), date.getQuarter());
				};
			}
			while (last.compareTo(end) === -1) {
					hdata3.push({
						duration: durfunc(last),
						text: last.getDate()
					});
					next = retfunc(last);
					last = next;
			}
		} else {
			var intervaldays = this.get('dpi');
			while (last.compareTo(end) === -1) {
				hdata3.push({
					duration: intervaldays,
					text: last.getDate()
				});
				next = retfunc(last);
				last = next;
			}
		}
		sattr.boundaryMax = end = last;
		hData['3'] = hdata3;

		//enter duration of first date to end of year
		var inter = Date.daysdiff(start, new Date(start.getFullYear(), 11, 31));
		hData['1'].push({
			duration: inter,
			text: start.getFullYear()
		});
		for(i = start.getFullYear() + 1, iLen = end.getFullYear(); i < iLen; i++){
			inter = Date.isLeapYear(i) ? 366 : 365;
			hData['1'].push({
				duration: inter,
				text: i
			});
		}
		//enter duration of last year upto end date
		if (start.getFullYear()!==end.getFullYear()) {
			inter = Date.daysdiff(new Date(end.getFullYear(), 0, 1), end);
			hData['1'].push({
				duration: inter,
				text: end.getFullYear()
			});
		}
		
		//enter duration of first month
		hData['2'].push({
			duration: Date.daysdiff(start, start.clone().moveToLastDayOfMonth()),
			text: util.formatdata(start.getMonth(), 'm')
		});
		
		j = start.getMonth() + 1;
		i = start.getFullYear();
		iLen = end.getFullYear();
		var endmonth = end.getMonth();

		while (i <= iLen) {
			while(j < 12) {
				if (i === iLen && j === endmonth) {
					break;
				}
				hData['2'].push({
					duration: Date.getDaysInMonth(i, j),
					text: util.formatdata(j, 'm')
				});
				j += 1;
			}
			i += 1;
			j = 0;
		}
		if (end.getMonth() !== start.getMonth && end.getFullYear() !== start.getFullYear()) {
			hData['2'].push({
				duration: Date.daysdiff(end.clone().moveToFirstDayOfMonth(), end),
				text: util.formatdata(end.getMonth(), 'm')
			});
		}
		sattr.hData = hData;
	},
	calculateIntervals: function() {
		this.calcminmax();
		this.setAttributes();
	},
	createElem: function() {
		var elems = {}, obj, callback = false, context = false;
		function bindTextEvents(element, obj, name) {
			element.on('blur',function(){
				var $this = $(this);
				var value = $this.val();
				$this.detach();
				var callfunc = callback, ctx = context;
				callback = false;
				context = false;
				if (obj.t2d) {
					value=obj.t2d(value);
				}
				callfunc.call(ctx,name,value);
			}).on('keypress',function(e){
				if(event.which===13){
					$(this).trigger('blur');
				}
			});
		}
		
		function bindDateEvents(element,obj,name){
			element.datepicker({ dateFormat: "dd/mm/yy",onClose:function(){
				console.log('close it');
				var $this=$(this);
				var value=$this.val();
				$this.detach();
				var callfunc=callback,ctx=context;
				callback=false;
				context=false;
				if(obj['t2d']) {
					value=obj['t2d'](value);
				}
				setTimeout(function() {
					"use strict";
					callfunc.call(ctx,name,value);
				}, 10);
			}});
		}
		
		for(var i in this.sform){
			obj=this.sform[i];
			if(obj.editable){
				if(obj.type==='text'){
					elems[i]=$('<input type="text" class="content-edit">');
					bindTextEvents(elems[i],obj,i);
				}
				else if(obj.type==='date'){
					elems[i]=$('<input type="text" class="content-edit">');
					bindDateEvents(elems[i],obj,i);
				}
			}
		
		}

		obj = null;
		return function(field, model, callfunc, ctx){
			callback = callfunc;
			context = ctx;
			var element=elems[field], value = model.get(field);
			if (this.sform[field].d2t) {
				value = this.sform[field].d2t(value, model);
			}
			element.val(value);
			return element;
		};
	
	},
	conDToT:(function(){
		var dToText={
			'start':function(value){
				return value.toString('dd/MM/yyyy')
			},
			'end':function(value){
				return value.toString('dd/MM/yyyy')
			},
			'duration':function(value,model){
				return Date.daysdiff(model.start,model.end)+' d';
			},
			'status':function(value){
				var statuses={
					'110':'complete',
					'109':'open',
					'108' : 'ready'
				};
				return statuses[value];
			}
		
		};
		return function(field,value,model){
			return dToText[field]?dToText[field](value,model):value;
		};
	}())
});

module.exports = SettingModel;

},{"../utils/util":5}],4:[function(require,module,exports){
"use strict";var util = require('../utils/util');var params = util.getURLParams();var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,        action: '',        active : true,        sortindex: 0,        dependency:'',        resources: {},        status: 110,        health: 21,        start: '',        end: '',        ProjectRef : params.project,        WBS_ID : params.profile,        color:'#0090d3',        lightcolor: '#E6F0FF',        darkcolor: '#e88134',        aType: '',        reportable: '',        parentid: 0,        hidden : false,        collapsed : false    },    initialize : function() {        this.children = new Backbone.Collection();        this.listenTo(this.children, 'change:parentid', function(child) {            this.children.remove(child);        });        this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);        this.listenTo(this, 'change:collapsed', function() {            this.children.each(function(child) {                if (this.get('collapsed')) {                    child.hide();                } else {                    child.show();                }            }.bind(this));        });        this.listenTo(this, 'destroy', function() {            this.children.each(function(child) {                child.destroy();            });        });    },    show : function() {        this.set('hidden', false);    },    hide : function() {        this.set('hidden', true);    },    parse: function(response) {        var start, end;        if(_.isString(response.start)){            start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            start = new Date();        }                if(_.isString(response.end)){            end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            end = new Date();        }        response.start = start < end ? start : end;        response.end = start < end ? end : start;        response.parentid = parseInt(response.parentid || '0', 10);        // remove null params        _.each(response, function(val, key) {            if (val === null) {                delete response[key];            }        });        return response;    },    _checkTime : function() {        if (this.children.length === 0) {            return;        }        var startTime = this.children.at(0).get('start');        var endTime = this.children.at(0).get('end');        this.children.each(function(child) {            var childStartTime = child.get('start');            var childEndTime = child.get('end');            if(childStartTime.compareTo(startTime) === -1) {                startTime = childStartTime;            }            if(childEndTime.compareTo(endTime) === 1){                endTime = childEndTime;            }        }.bind(this));        this.set('start', startTime);        this.set('end', endTime);    }});module.exports = TaskModel;
},{"../utils/util":5}],5:[function(require,module,exports){
var monthsCode=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

module.exports.correctdate = function(str) {
	"use strict";
	return str;
};

module.exports.formatdata = function(val, type) {
	"use strict";
	if (type === 'm') {
		return monthsCode[val];
	}
	return val;
};

module.exports.hfunc = function(pos) {
	"use strict";
	return {
		x: pos.x,
		y: this.getAbsolutePosition().y
	};
};

function transformToAssocArray(prmstr) {
	var params = {};
	var prmarr = prmstr.split('&');
	for (var i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split('=');
		params[tmparr[0]] = tmparr[1];
	}
	return params;
}

module.exports.getURLParams = function() {
	var prmstr = window.location.search.substr(1);
	return prmstr !== null && prmstr !== '' ? transformToAssocArray(prmstr) : {};
};


},{}],6:[function(require,module,exports){
/**
 * Created by lavrton on 02.12.2014.
 */

var template = "<div class=\"ui small modal add-new-task flip\">\r\n    <i class=\"close icon\"></i>\r\n    <div class=\"header\">\r\n    </div>\r\n    <div class=\"content\">\r\n        <form id=\"new-task-form\" action=\"/\" type=\"POST\">\r\n            <div class=\"ui form segment\">\r\n                <p>Let's go ahead and set a new goal.</p>\r\n                <div class=\"field\">\r\n                    <label>Task name</label>\r\n                    <input type=\"text\" name=\"name\" placeholder=\"New task name\" required>\r\n                </div>\r\n                <div class=\"field\">\r\n                    <label>Discription</label>\r\n                    <textarea name=\"description\" placeholder=\"The detailed description of your task\"></textarea>\r\n                </div>\r\n                <div class=\"two fields\">\r\n                    <div class=\"field\">\r\n                        <label>Select parent</label>\r\n                        <!--<div class=\"ui dropdown selection\">-->\r\n                            <select name=\"parentid\" class=\"ui dropdown\">\r\n                            </select>\r\n                        <!--</div>-->\r\n                    </div>\r\n                    <div class=\"field resources\">\r\n                        <label>Assign Resources</label>\r\n                    </div>\r\n                </div>\r\n                <div class=\"two fields\">\r\n                    <div class=\"field\">\r\n                        <label>Start Date</label>\r\n                        <input type=\"date\" name=\"start\" placeholder=\"Start Date\" required>\r\n                    </div>\r\n                    <div class=\"field\">\r\n                        <label>End Date</label>\r\n                        <input type=\"date\" name=\"end\" placeholder=\"End Date\" required>\r\n                    </div>\r\n                </div>\r\n                <input type=\"hidden\" name=\"complete\" value=\"0\">\r\n                <input type=\"hidden\" name=\"action\" value=\"add\">\r\n                <input type=\"hidden\" name=\"dependency\" value=\"\">\r\n                <input type=\"hidden\" name=\"aType\" value=\"\">\r\n                <input type=\"hidden\" name=\"health\" value=\"21\">\r\n                <input type=\"hidden\" name=\"color\" value=\"\">\r\n                <input type=\"hidden\" name=\"milestone\" value=\"1\">\r\n                <input type=\"hidden\" name=\"deliverable\" value=\"0\">\r\n                <input type=\"hidden\" name=\"reportable\" value=\"1\">\r\n                <input type=\"hidden\" name=\"sortindex\" value=\"1\">\r\n                <input type=\"hidden\" name=\"insertPos\" value=\"set\">\r\n                <input type=\"hidden\" name=\"reference_id\" value=\"-1\">\r\n                <div class=\"two fields\">\r\n                    <div class=\"field\">\r\n                        <label>Status</label>\r\n                        <div class=\"ui fluid selection dropdown\">\r\n                            <input type=\"hidden\" name=\"status\" required>\r\n                            <div class=\"default text\">Status</div>\r\n                            <i class=\"dropdown icon\"></i>\r\n                            <div class=\"menu\">\r\n                                <div class=\"item\" data-value=\"108\">Ready</div>\r\n                                <div class=\"item\" data-value=\"109\">Open</div>\r\n                                <div class=\"item\" data-value=\"110\">Completed</div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"field\">\r\n                        <label>Duration</label>\r\n                        <input type=\"number\" min=\"0\" name=\"duration\" placeholder=\"Project Duration\" required readonly>\r\n                    </div>\r\n                </div>\r\n                <button id=\"submitForm\" class=\"ui blue submit parent button\">Submit</button>\r\n            </div>\r\n        </form>\r\n    </div>\r\n</div>";

var demoResources = [{"wbsid":1,"res_id":1,"res_name":"Joe Black","res_allocation":60},{"wbsid":3,"res_id":2,"res_name":"John Blackmore","res_allocation":40}];

var AddFormView = Backbone.View.extend({
    el: document.body,
    template: template,
    events: {
        'click .new-task': 'openForm',
        'click #submitForm': 'submitForm'
    },
    initialize: function () {
        this.$el.append(this.template);
        this._prepareForm();
        this._initResources();
        this.listenTo(this.collection, 'add', this._setupParentSelector);
    },
    _initResources: function () {
        // Resources from backend
        var $resources = '<select id="resources"  name="resources[]" multiple="multiple">';
        demoResources.forEach(function (resource) {
            $resources += '<option value="' + resource.res_id + '">' + resource.res_name + '</option>';
        });
        $resources += '</select>';
        // add backend to the task list
        $('.resources').append($resources);

        // initialize multiple selectors
        $('#resources').chosen({width: '95%'});
    },
    _formValidationParams : {
        name: {
            identifier: 'name',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a task name'
                }
            ]
        },
        complete: {
            identifier: 'complete',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter an estimate days'
                }
            ]
        },
        start: {
            identifier: 'start',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please set a start date'
                }
            ]
        },
        end: {
            identifier: 'end',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please set an end date'
                }
            ]
        },
        duration: {
            identifier: 'duration',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please set a valid duration'
                }
            ]
        },
        status: {
            identifier: 'status',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please select a status'
                }
            ]
        }
    },
    _prepareForm : function() {
        $('.masthead .information').transition('scale in');
        $('.ui.form').form(this._formValidationParams);
        // assign random parent color
        $('input[name="color"]').val('#'+Math.floor(Math.random()*16777215).toString(16));
    },
    _setupParentSelector : function() {
        var $selector = $('[name="parentid"]');
        $selector.empty();
        $selector.append('<option value="0">Main Project</option>');
        this.collection.each(function(task) {
            var parentId = parseInt(task.get('parentid'), 10);
            if(parentId === 0){
                $selector.append('<option value="' + task.id + '">' + task.get('name') + '</option>');
            }
        });
        $('select.dropdown').dropdown();
    },
    render : function() {
        "use strict";
        // initialize dropdown
        this._setupParentSelector();
    },
    openForm: function() {
        $('.ui.add-new-task').modal('setting', 'transition', 'vertical flip').modal('show');
    },
    submitForm: function(e) {
        var form = $("#new-task-form");

        var data = {};
        $(form).serializeArray().forEach(function(input) {
            data[input.name] = input.value;
        });

        var sortindex = 0;
        var ref_model = this.collection.get(data.reference_id);
        if (ref_model) {
            var insertPos = data.insertPos;
            sortindex = ref_model.get('sortindex') + (insertPos === 'above' ? -0.5 : 0.5);
        } else {
            sortindex = (this.collection.last().get('sortindex') + 1);
        }
        data.sortindex = sortindex;

        if (form.get(0).checkValidity()) {
            e.preventDefault();
            var task = this.collection.add(data, {parse : true});
            task.save();
            $('.ui.modal').modal('hide');
        }
    }
});

module.exports = AddFormView;
},{}],7:[function(require,module,exports){
var ContextMenuView = require('./sideBar/ContextMenuView');var TaskView = require('./sideBar/TaskView');//var KCanvasView = require('./canvas/KCanvasView');var GanttChartView = require('./canvasChart/GanttChartView');var AddFormView = require('./AddFormView');var TopMenuView = require('./TopMenuView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$container = this.$el.find('.task-container');        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        this.makeSortable();        new ContextMenuView(this.app).render();        new AddFormView({            collection : this.collection        }).render();        new TopMenuView({            settings : this.app.settings        }).render();        this.canvasView = new GanttChartView({            app : this.app,            collection : this.collection,            settings: this.app.settings        });        this.canvasView.render();        this._moveCanvasView();        this.listenTo(this.collection, 'sorted add', function() {            this.$container.empty();            this.render();        });    },    makeSortable: function() {        this.$container.sortable({            group: 'sortable',            containerSelector : 'ol',            itemSelector : '.drag-item',            placeholder : '<li class="placeholder sort-placeholder"/>',            onDrag : function($item, position, _super, event) {                var $placeholder = $('.sort-placeholder');                var isSubTask = !$($placeholder.parent()).hasClass('task-container');                $placeholder.css({                    'padding-left' : isSubTask ? '30px' : '0'                });                _super($item, position, _super, event);            }.bind(this),            onDrop : function($item, position, _super, event) {                _super($item, position, _super, event);                var data = this.$container.sortable("serialize").get()[0];                data.forEach(function(parentData) {                    parentData.children = parentData.children ? parentData.children[0] : [];                });                this.collection.resort(data);            }.bind(this)        });    },    events: {        'click #tHandle': 'expand',        'dblclick .sub-task': 'handlerowclick',        'dblclick .task': 'handlerowclick',        'hover .sub-task': 'showMask'    },    render: function() {        this.collection.each(function(task) {            if (task.get('parentid').toString() === '0') {                this.addTask(task);            }        }, this);        this.makeSortable();    },    handlerowclick: function(evt) {        var id = evt.currentTarget.id;        this.app.tasks.get(id).trigger('editrow', evt);    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var target = $(evt.target);        var width = 0;        var setting = this.app.settings.getSetting('display');        if (target.hasClass('contract')) {            width = setting.tHiddenWidth;        }        else {            width = setting.tableWidth;        }        this.$menuContainer.css('width', width);        setTimeout(function() {            this._moveCanvasView();        }.bind(this), 600);        target.toggleClass('contract');        this.$menuContainer.find('.menu-header').toggleClass('menu-header-opened');    },    _moveCanvasView : function() {        var sideBarWidth = $('.menu-container').width();        this.canvasView.setLeftPadding(sideBarWidth);    },    addTask: function(task) {        var taskView = new TaskView({model: task, app : this.app});        this.$container.append(taskView.render().el);    }});module.exports = GanttView;
},{"./AddFormView":6,"./TopMenuView":8,"./canvasChart/GanttChartView":11,"./sideBar/ContextMenuView":13,"./sideBar/TaskView":15}],8:[function(require,module,exports){
/**
 * Created by lavrton on 08.12.2014.
 */

var TopMenuView = Backbone.View.extend({
    el : '.head-bar',
    initialize : function(params) {
        "use strict";
        this.settings = params.settings;
    },
    events : {
        'click button': 'onIntervalButtonClicked',
        'click a[href="/#!/generate/"]': 'generatePDF'
    },
    onIntervalButtonClicked : function(evt) {
        "use strict";
        var button = $(evt.currentTarget);
        var action = button.data('action');
        var interval = action.split('-')[1];
        this.settings.set('interval', interval);
    },
    generatePDF : function(evt) {
        "use strict";
        window.print();
        evt.preventDefault();
    }
});

module.exports = TopMenuView;

},{}],9:[function(require,module,exports){
/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require('./BasicTaskView');

var AloneTaskView = BasicTaskView.extend({
    _borderWidth : 3,
    events : function() {
        return _.extend(BasicTaskView.prototype.events(), {
            'dragmove .leftBorder' : '_changeSize',
            'dragmove .rightBorder' : '_changeSize',

            'dragend .leftBorder' : 'render',
            'dragend .rightBorder' : 'render',

            'mouseover .leftBorder' : '_pointerMouse',
            'mouseout .leftBorder' : '_defaultMouse',

            'mouseover .rightBorder' : '_pointerMouse',
            'mouseout .rightBorder' : '_defaultMouse'
        });
    },
    el : function() {
        var group = BasicTaskView.prototype.el.call(this);
        var leftBorder = new Kinetic.Rect({
            dragBoundFunc : function(pos) {
                return {
                    x : pos.x,
                    y : this._y + this.params.padding
                };
            }.bind(this),
            width : this._borderWidth,
            fill : 'black',
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            draggable : true,
            name : 'leftBorder'
        });
        group.add(leftBorder);
        var rightBorder = new Kinetic.Rect({
            dragBoundFunc : function(pos) {
                return {
                    x : pos.x,
                    y : this._y + this.params.padding
                };
            }.bind(this),
            width : this._borderWidth,
            fill : 'black',
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            draggable : true,
            name : 'rightBorder'
        });
        group.add(rightBorder);
        return group;
    },
    _pointerMouse : function() {
        document.body.style.cursor = 'pointer';
    },
    _defaultMouse : function() {
        document.body.style.cursor = 'default';
    },
    _changeSize : function() {
        var leftX = this.el.find('.leftBorder')[0].x();
        var rightX = this.el.find('.rightBorder')[0].x() + this._borderWidth;

        var rect = this.el.find('.mainRect')[0];
        rect.width(rightX - leftX);
        rect.x(leftX);
        this._updateDates();
    },
    render : function() {
        var x = this._calculateX();
        this.el.find('.leftBorder')[0].x(0);
        this.el.find('.rightBorder')[0].x(x.x2 - x.x1 - this._borderWidth);
        BasicTaskView.prototype.render.call(this);
        return this;
    }
});

module.exports = AloneTaskView;

},{"./BasicTaskView":10}],10:[function(require,module,exports){
"use strict";

var BasicTaskView = Backbone.KineticView.extend({
    params : {
        height : 21,
        padding : 2
    },
    initialize : function(params) {
        this.height = this.params.height;
        this.settings = params.settings;
        this._initModelEvents();
        this._initSettingsEvents();
    },
    events : function() {
        return {
            'dragmove' : '_updateDates',
            'dragend' : function() {
                this.model.save();
            }
        };
    },
    el : function() {
        var group = new Kinetic.Group({
            dragBoundFunc : function(pos) {
                return {
                    x : pos.x,
                    y : this._y
                };
            }.bind(this),
            draggable : true
        });
        var rect = new Kinetic.Rect({
            fill : this.model.get('lightcolor'),
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            name : 'mainRect'
        });
        var completeRect = new Kinetic.Rect({
            fill : this.model.get('darkcolor'),
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            name : 'completeRect'
        });
        group.add(rect, completeRect);
        return group;
    },
    _updateDates : function() {
        var attrs = this.settings.getSetting('attr'),
            boundaryMin=attrs.boundaryMin,
            daysWidth=attrs.daysWidth;

        var rect = this.el.find('.mainRect')[0];
        var length = rect.width();
        var x = this.el.x() + rect.x();
        var days1 = Math.floor(x / daysWidth), days2 = Math.floor((x + length) / daysWidth);

        this.model.set({
            start: boundaryMin.clone().addDays(days1),
            end: boundaryMin.clone().addDays(days2 - 1)
        });
    },
    _initSettingsEvents : function() {
        this.listenTo(this.settings, 'change:interval change:dpi', function() {
            this.render();
        });
    },
    _initModelEvents : function() {
        // don't update element while dragging
        this.listenTo(this.model, 'change', function() {
            var dragging = this.el.isDragging();
            this.el.getChildren().each(function(child) {
                dragging = dragging || child.isDragging();
            });
            if (dragging) {
                return;
            }
            this.render();
        });

        this.listenTo(this.model, 'change:hidden', function() {
            if (this.model.get('hidden')) {
                this.el.hide();
            } else {
                this.el.show();
            }
        });
    },
    _calculateX : function() {
        var attrs= this.settings.getSetting('attr'),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;
        return {
            x1: Date.daysdiff(boundaryMin, this.model.get('start')) * daysWidth,
            x2: Date.daysdiff(boundaryMin, this.model.get('end')) * daysWidth
        };
    },
    _calculateCompleteWidth : function() {
        var x = this._calculateX();
        return (x.x2 - x.x1) * this.model.get('complete') / 100;
    },
    render : function() {
        var x = this._calculateX();
        // move group
        this.el.x(x.x1);

        // update main rect params
        var rect = this.el.find('.mainRect')[0];
        rect.x(0);
        rect.width(x.x2 - x.x1);

        // update complete params
        this.el.find('.completeRect')[0].width(this._calculateCompleteWidth());
        this.el.getLayer().draw();
        return this;
    },
    setY : function(y) {
        this._y = y;
        this.el.y(y);
    }
});

module.exports = BasicTaskView;
},{}],11:[function(require,module,exports){
"use strict";

var NestedTaskView = require('./NestedTaskView');
var AloneTaskView = require('./AloneTaskView');

var GanttChartView = Backbone.View.extend({
    el: '#gantt-container',
    _topPadding : 70,
    initialize: function (params) {
        this.settings = params.settings;
        this._taskViews = [];
        this._initStage();
        this._initLayers();
        this._initBackground();
        this._initSettingsEvents();
        this._initTasksViews();
        this._initCollectionEvents();
    },
    setLeftPadding : function(offset) {
        this._leftPadding = offset;
        this._updateStageAttrs();
    },
    _initStage : function() {
        this.stage = new Kinetic.Stage({
            container : this.el
        });
        this._updateStageAttrs();
    },
    _initLayers : function() {
        this.Flayer = new Kinetic.Layer();
        this.Blayer = new Kinetic.Layer();
        this.stage.add(this.Blayer, this.Flayer);
    },
    _updateStageAttrs : function() {
        var sattr = this.settings.sattr;
        var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;

        this.stage.setAttrs({
            offsetX : - this._leftPadding,
            height: 580,
            width: this.$el.innerWidth(),
            draggable: true,
            dragBoundFunc:  function(pos) {
                var x;
                var minX = - (lineWidth - this.width());
                if (pos.x > 0) {
                    x = 0;
                } else if (pos.x < minX) {
                    x = minX;
                } else {
                    x = pos.x;
                }
                return {
                    x: x,
                    y: 0
                };
            }
        });
        this.stage.draw();
    },
    _initBackground : function() {
        var shape = new Kinetic.Shape({
            sceneFunc: this._getSceneFunction(),
            stroke: 'lightgray',
            strokeWidth : 0
        });
        var sattr = this.settings.sattr;
        var width = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;
        var back = new Kinetic.Rect({
            height : this.stage.height(),
            width : width
        });

        this.Blayer.add(back).add(shape);
        this.stage.draw();
    },
    _getSceneFunction : function() {
        var sdisplay = this.settings.sdisplay;
        var sattr = this.settings.sattr;
        var borderWidth = sdisplay.borderWidth || 1;
        var offset = 1;
        var rowHeight = 20;

        return function(context){
            var i, s, iLen = 0,	daysWidth = sattr.daysWidth, x,	length,	hData = sattr.hData;
            var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;

            context.beginPath();
            //draw three lines
            for(i = 1; i < 4 ; i++){
                context.moveTo(offset, i * rowHeight - offset);
                context.lineTo(lineWidth + offset, i * rowHeight - offset);
            }

            var yi = 0, yf = rowHeight, xi = 0;
            for (s = 1; s < 3; s++){
                x = 0; length = 0;
                for (i = 0, iLen = hData[s].length; i < iLen; i++){
                    length=hData[s][i].duration * daysWidth;
                    x = x + length;
                    xi = x - borderWidth + offset;
                    context.moveTo(xi, yi);
                    context.lineTo(xi, yf);

                    context._context.save();
                    context._context.font = '10pt Arial,Helvetica,sans-serif';
                    context._context.textAlign = 'center';
                    context._context.textBaseline = 'middle';
                    context._context.fillText(hData[s][i].text, x - length / 2, yf - rowHeight / 2);
                    context._context.restore();
                }
                yi = yf; yf = yf + rowHeight;
            }

            x = 0; length = 0; s = 3; yf = 1200;
            var dragInt = parseInt(sattr.dragInterval, 10);
            var hideDate = false;
            if( dragInt === 14 || dragInt === 30){
                hideDate = true;
            }
            for (i = 0, iLen = hData[s].length; i < iLen; i++) {
                length=hData[s][i].duration * daysWidth;
                x = x + length;
                xi = x - borderWidth + offset;
                context.moveTo(xi, yi);
                context.lineTo(xi, yf);

                context._context.save();
                context._context.font = '6pt Arial,Helvetica,sans-serif';
                context._context.textAlign = 'left';
                context._context.textBaseline = 'middle';
                // date hide on specific views
                if (hideDate) {
                    context._context.font = '1pt Arial,Helvetica,sans-serif';
                }
                context._context.fillText(hData[s][i].text, x-length+40,yi+rowHeight/2);
                context._context.restore();

            }
            context.fillStrokeShape(this);
        };
    },
    _initSettingsEvents : function() {
        this.listenTo(this.settings, 'change:interval change:dpi', function() {
            this._updateStageAttrs();
        });
    },
    _initCollectionEvents : function() {
        this.listenTo(this.collection, 'add', function(task) {
            this._addTaskView(task);
        });
        this.listenTo(this.collection, 'remove', function(task) {
            var view = _.find(this._taskViews, function(view) {
                return view.model === task;
            });
            view.remove();
            this._taskViews = _.without(this._taskViews, view);
            this._resortViews();
        });
        this.listenTo(this.collection, 'sort', function() {
            this._resortViews();
        });
        this.listenTo(this.collection, 'change:hidden', function() {
            this._resortViews();
        });
    },
    _initTasksViews : function() {
        this.collection.each(function(task) {
            this._addTaskView(task);
        }.bind(this));
        this._resortViews();
        this.Flayer.draw();
    },
    _addTaskView : function(task) {
        var view;
        if (task.children.length) {
            view = new NestedTaskView({
                model : task,
                settings : this.settings
            });
        } else {
            view = new AloneTaskView({
                model : task,
                settings : this.settings
            });
        }
        this.Flayer.add(view.el);
        view.render();
        this._taskViews.push(view);
    },
    _resortViews : function() {
        var lastY = this._topPadding;
        this.collection.each(function(task) {
            if (task.get('hidden')) {
                return;
            }
            var view = _.find(this._taskViews, function(view) {
                return view.model === task;
            });
            view.setY(lastY);
            lastY += view.height;
        }.bind(this));
        this.Flayer.draw();
    }
});

module.exports = GanttChartView;
},{"./AloneTaskView":9,"./NestedTaskView":12}],12:[function(require,module,exports){
/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require('./BasicTaskView');

var NestedTaskView = BasicTaskView.extend({
});

module.exports = NestedTaskView;
},{"./BasicTaskView":10}],13:[function(require,module,exports){
function ContextMenuView(app) {
    "use strict";
    this.app = app;
}

ContextMenuView.prototype.render = function() {
    var self = this;
    $('.task-container').contextMenu({
        selector: 'div',
        callback: function(key) {
            var id = $(this.parent()).attr('id');
            var model = self.app.tasks.get(id);
            if(key === 'delete'){
                model.destroy();
                model.save();
                $(this).fadeOut(function(){
                    $(this).remove();
                });
            }
            if(key === 'properties'){
                var $property = '.property-';
                var status = {
                    '108': 'Ready',
                    '109': 'Open',
                    '110': 'Complete'
                };
                var $el = $(document);
                $el.find($property+'name').html(model.get('name'));
                $el.find($property+'description').html(model.get('description'));
                $el.find($property+'start').html(convertDate(model.get('start')));
                $el.find($property+'end').html(convertDate(model.get('end')));
                $el.find($property+'status').html(status[model.get('status')]);
                var startdate = new Date(model.get('start'));
                var enddate = new Date(model.get('end'));
                var _MS_PER_DAY = 1000 * 60 * 60 * 24;
                if(startdate != "" && enddate != ""){
                    var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());
                    var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());
                    $el.find($property+'duration').html(Math.floor((utc2 - utc1) / _MS_PER_DAY));
                }else{
                    $el.find($property+'duration').html(Math.floor(0));
                }
                $('.ui.properties').modal('setting', 'transition', 'vertical flip')
                    .modal('show')
                ;

                function convertDate(inputFormat) {
                    function pad(s) { return (s < 10) ? '0' + s : s; }
                    var d = new Date(inputFormat);
                    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
                }
            }
            if(key === 'rowAbove'){
                var data = {
                    reference_id : id
                };
                self.addTask(data, 'above');
            }
            if(key === 'rowBelow'){
                self.addTask({
                    reference_id : id
                }, 'below');
            }
            if(key === 'indent'){
                $(this).find('.expand-menu').remove();
                var rel_id = $(this).closest('div').prev().find('.sub-task').last().attr('id');
                var prevModel = this.app.tasks.get(rel_id);
                var parent_id = prevModel.get('parentid');
                model.set('parentid', parent_id);
                model.save();
                var tobeChild = $(this).next().children();
                jQuery.each(tobeChild, function(index, data){
                    var childId = $(this).attr('id');
                    var childModel = this.app.tasks.get(childId);
                    childModel.set('parentid',parent_id);
                    childModel.save();
                });
                $(this).removeClass('task').addClass('sub-task').css({
                    'padding-left': '30px'
                });
                location.reload();
            }
            if(key === 'outdent'){
                model.set('parentid',0);
                model.save();
                var tobeChild = $(this).parent().children();
                var currIndex = $(this).index();
                jQuery.each(tobeChild, function(index, data){
                    if(index > currIndex){
                        var childId = $(this).attr('id');
                        var childModel = self.app.tasks.get(childId);
                        childModel.set('parentid',model.get('id'));
                        childModel.save();
                    }
                });
                $(this).prepend('<li class="expand-menu"><i class="triangle up icon"></i> </li>');
                $(this).removeClass('sub-task').addClass('task').css({
                    'padding-left': '0px'
                });
                location.reload();
                // this.canvasView.rendergroups();
            }
        },
        items: {
            "rowAbove": {name: "New Row Above", icon: ""},
            "rowBelow": {name: "New Row Below", icon: ""},
            "indent": {name: "Indent Row", icon: ""},
            "outdent": {name: "Outdent Row", icon: ""},
            "sep1": "---------",
            "properties": {name: "Properties", icon: ""},
            "sep2": "---------",
            "delete": {name: "Delete Row", icon: ""}
        }
    });
};

ContextMenuView.prototype.addTask = function(data, insertPos) {
    var sortindex = 0;
    var ref_model = this.app.tasks.get(data.reference_id);
    if (ref_model) {
        sortindex = ref_model.get('sortindex') + (insertPos === 'above' ? -0.5 : 0.5)
    } else {
        sortindex = (this.app.tasks.last().get('sortindex') + 1);
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get('parentid');
    var task = this.app.tasks.add(data, {parse : true});
    task.save();
};

module.exports = ContextMenuView;
},{}],14:[function(require,module,exports){

var template = "<div>\r\n    <ul>\r\n        <% var setting=app.settings;%>\r\n        <% if(isParent){ %> <li class=\"expand-menu\"><i class=\"triangle down icon\"></i></li><% } %>\r\n        <li class=\"col-name\"><% print(setting.conDToT(\"name\",name)); %></li>\r\n        <li class=\"col-start\"><% print(setting.conDToT(\"start\",start));%></li>\r\n        <li class=\"col-end\"><% print(setting.conDToT(\"end\",end)); %></li>\r\n        <li class=\"col-complete\"><% print(setting.conDToT(\"complete\",complete)); %></li>\r\n        <li class=\"col-status\"><% print(setting.conDToT(\"status\",status)); %></li>\r\n        <li class=\"col-duration\"><% print(setting.conDToT(\"duration\",0,{\"start\":start,\"end\":end})); %></li>\r\n        <li class=\"remove-item\"><button class=\"mini red ui button\"> <i class=\"small trash icon\"></i></button></li>\r\n    </ul>\r\n</div>";

var TaskItemView=Backbone.View.extend({
	tagName : 'li',
	template: _.template(template),
	isParent: false,
	initialize: function(params){
		this.app = params.app;
		this.listenTo(this.model, 'editrow', this.edit);
		this.listenTo(this.model, 'change:name change:start change:end change:complete change:status', this.renderRow);
		this.$el.hover(function(e){
			$(document).find('.item-selector').stop().css({
				top: ($(e.currentTarget).offset().top)+'px'
			}).fadeIn();
		}, function(){
			$(document).find('.item-selector').stop().fadeOut();
		});
		this.$el.on('click',function(){
			$(document).find('.item-selector').stop().fadeOut();
		});
	},
	render: function(parent){
		var addClass='sub-task drag-item';
		
		if(parent){
			addClass="task";
			this.isParent = true;
			this.setElement($('<div>'));
		}
		else{
			this.isParent = false;
			this.setElement($('<li>'));
			this.$el.data({
				id : this.model.id
			});
		}
		this.$el.addClass(addClass);
		this.$el.attr('id', this.model.cid);
		return this.renderRow();
	},
	renderRow:function(){
		var data = this.model.toJSON();
		data.isParent = this.isParent;
		data.app = this.app;
		this.$el.html(this.template(data));
		return this;
	},
	edit:function(evt){
		var target = $(evt.target);
		var width  = parseInt(target.css('width'), 10) - 5;
		var field = target.attr('class').split('-')[1];
		var form = this.app.settings.getFormElem(field, this.model, this.onEdit, this);
		form.css({
			width: width + 'px'
		});

		target.html(form);
		form.focus();
	},
	onEdit: function(name, value){
		console.log(name, value);
		if (name === 'duration') {
			var start = this.model.get('start');
			var end = start.clone().addDays(parseInt(value, 10) - 1);
			this.model.set('end', end).save();
		}
		else{
			this.model.set(name, value).save();
		}
		this.renderRow();
	}
});

module.exports = TaskItemView;

},{}],15:[function(require,module,exports){
var TaskItemView = require('./TaskItemView');

var TaskView = Backbone.View.extend({
	tagName: 'li',
	className: 'task-list-container drag-item',
	collapsed : false,

	initialize: function(params){
		this.app = params.app;
	},
	events: {
		'click .task .expand-menu': 'collapseOrExpand',
		'click .add-item button': 'addItem',
		'click .remove-item button': 'removeItem'
	},
	render: function(){
		var parent = this.model;
		var itemView = new TaskItemView({
			model : parent,
			app : this.app
		});

		this.$parentel = itemView.render(true).$el;
		this.$el.append(this.$parentel);

		this.$el.data({
			id : parent.id
		});
		this.$childel = $('<ol class="sub-task-list sortable"></ol>');

		this.$el.append(this.$childel);
		var children = _.sortBy(this.model.children.models, function(model){
			return model.get('sortindex');
		});
		children.forEach(function(child) {
			"use strict";
			itemView=new TaskItemView({
				model: child,
				app: this.app
			});
			itemView.render();
			this.$childel.append(itemView.el);
		}.bind(this));

		this.toggleParent();
		return this;
	},
	collapseOrExpand: function(){
		this.collapsed = !this.collapsed;
		this.model.set('collapsed', this.collapsed);
		this.toggleParent();
	},
	toggleParent: function() {
		var str = this.collapsed ? '<i class="triangle up icon"></i> ' : '<i class="triangle down icon"></i>';
		this.$childel.slideToggle();
		this.$parentel.find('.expand-menu').html(str);
	},
	addItem: function(evt){
		$(evt.currentTarget).closest('ul').next().append('<ul class="sub-task" id="c'+Math.floor((Math.random() * 10000) + 1)+'"><li class="col-name"><input type="text" placeholder="New plan" size="38"></li><li class="col-start"><input type="date" placeholder="Start Date" style="width:80px;"></li><li class="col-end"><input type="date" placeholder="End Date" style="width:80px;"></li><li class="col-complete"><input type="number" placeholder="2" style="width: 30px;margin-left: -14px;" min="0"></li><li class="col-status"><select style="width: 70px;"><option value="incomplete">Inompleted</option><option value="completed">Completed</option></select></li><li class="col-duration"><input type="number" placeholder="24" style="width: 32px;margin-left: -8px;" min="0"> d</li><li class="remove-item"><button class="mini red ui button"> <i class="small trash icon"></i></button></li></ul>').hide().slideDown();
	},
	removeItem: function(evt){
		var $parentUL = $(evt.currentTarget).closest('ol ul').parent().parent();
		var id = $parentUL.attr('id');
		var taskModel = this.app.tasks.get(id);
		if($parentUL.hasClass('task')){
			$parentUL.next('ol').fadeOut(1000, function(){
				$(this).remove();
			});
		}else{
			$(evt.currentTarget).closest('ul').fadeOut(1000, function(){
				$(this).remove();
			});
		}
		taskModel.destroy();
	}
});

module.exports = TaskView;

},{"./TaskItemView":14}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9mYWtlXzQ2NGRjYzJhLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9BZGRGb3JtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrSXRlbVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvVGFza1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYXNrTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGFza01vZGVsJyk7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0dXJsIDogJ2FwaS90YXNrcycsXG5cdG1vZGVsOiBUYXNrTW9kZWwsXG5cdGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xuXHR9LFxuXHRjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcblx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0bGlua0NoaWxkcmVuIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHBhcmVudFRhc2sgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50VGFzaykge1xuXHRcdFx0XHRpZiAocGFyZW50VGFzayA9PT0gdGFzaykge1xuXHRcdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0Y29uc29sZS5lcnJvcigndGFzayBoYXMgcGFyZW50IHdpdGggaWQgJyArIHRhc2suZ2V0KCdwYXJlbnRpZCcpICsgJyAtIGJ1dCB0aGVyZSBpcyBubyBzdWNoIHRhc2snKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRfc29ydENoaWxkcmVuIDogZnVuY3Rpb24gKHRhc2ssIHNvcnRJbmRleCkge1xuXHRcdHRhc2suY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKGNoaWxkLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRhc2suc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4odGFzaywgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRyZXNvcnQgOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IDA7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbihwYXJlbnREYXRhKSB7XG5cdFx0XHR2YXIgcGFyZW50TW9kZWwgPSB0aGlzLmdldChwYXJlbnREYXRhLmlkKTtcblx0XHRcdHZhciBwcmV2U29ydCA9IHBhcmVudE1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0XHRpZiAocHJldlNvcnQgIT09ICsrc29ydEluZGV4KSB7XG5cdFx0XHRcdHBhcmVudE1vZGVsLnNldCgnc29ydGluZGV4Jywgc29ydEluZGV4KS5zYXZlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGFyZW50TW9kZWwuZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHBhcmVudE1vZGVsLnNldCgncGFyZW50aWQnLCAwKS5zYXZlKCk7XG5cdFx0XHR9XG5cdFx0XHRwYXJlbnREYXRhLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGREYXRhKSB7XG5cdFx0XHRcdHZhciBjaGlsZE1vZGVsID0gc2VsZi5nZXQoY2hpbGREYXRhLmlkKTtcblx0XHRcdFx0dmFyIHByZXZTb3J0SSA9IGNoaWxkTW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHRcdFx0aWYgKHByZXZTb3J0SSAhPT0gKytzb3J0SW5kZXgpIHtcblx0XHRcdFx0XHRjaGlsZE1vZGVsLnNldCgnc29ydGluZGV4Jywgc29ydEluZGV4KS5zYXZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGNoaWxkTW9kZWwuZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRNb2RlbC5pZCkge1xuXHRcdFx0XHRcdGNoaWxkTW9kZWwuc2V0KCdwYXJlbnRpZCcsIHBhcmVudE1vZGVsLmlkKS5zYXZlKCk7XG5cdFx0XHRcdFx0dmFyIHBhcmVudCA9IHNlbGYuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gcGFyZW50TW9kZWwuaWQ7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cGFyZW50LmNoaWxkcmVuLmFkZChjaGlsZE1vZGVsKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnNvcnQoKTtcblx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0fSxcblx0c3Vic2NyaWJlIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IG1vZGVsLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0NvbGxlY3Rpb247XG5cbiIsIlxudmFyIFRhc2tDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9ucy90YXNrQ29sbGVjdGlvbicpO1xudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9tb2RlbHMvU2V0dGluZ01vZGVsJyk7XG5cbnZhciBHYW50dFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0dhbnR0VmlldycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL3V0aWwnKTtcblxuJChmdW5jdGlvbiAoKSB7XG5cdHZhciBhcHAgPSB7fTtcblx0YXBwLnRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cblx0Ly8gZGV0ZWN0IEFQSSBwYXJhbXMgZnJvbSBnZXQsIGUuZy4gP3Byb2plY3Q9MTQzJnByb2ZpbGU9MTdcblx0dmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cdGlmIChwYXJhbXMucHJvamVjdCAmJiBwYXJhbXMucHJvZmlsZSkge1xuXHRcdGFwcC50YXNrcy51cmwgPSAnYXBpL3Rhc2tzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5wcm9maWxlO1xuXHR9XG5cblx0YXBwLnRhc2tzLmZldGNoKHtcblx0XHRzdWNjZXNzIDogZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnU3VjY2VzcyBsb2FkaW5nIHRhc2tzLicpO1xuXHRcdFx0YXBwLnNldHRpbmdzID0gbmV3IFNldHRpbmdzKHt9LCB7YXBwIDogYXBwfSk7XG5cdFx0XHRhcHAudGFza3MubGlua0NoaWxkcmVuKCk7XG5cdFx0XHRhcHAudGFza3MuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcCxcblx0XHRcdFx0Y29sbGVjdGlvbiA6IGFwcC50YXNrc1xuXHRcdFx0fSkucmVuZGVyKCk7XG5cdFx0XHQkKCcjbG9hZGVyJykuZmFkZU91dCgpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9XG5cdH0sIHtwYXJzZTogdHJ1ZX0pO1xufSk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcblxudmFyIGFwcCA9IHt9O1xuXG52YXIgaGZ1bmMgPSBmdW5jdGlvbihwb3MsIGV2dCkge1xuXHR2YXIgZHJhZ0ludGVydmFsID0gYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInLCAnZHJhZ0ludGVydmFsJyk7XG5cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcblx0cmV0dXJuIHtcblx0XHR4OiBldnQuaW5pcG9zLnggKyBuICogZHJhZ0ludGVydmFsLFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGludGVydmFsOiAnZml4Jyxcblx0XHQvL2RheXMgcGVyIGludGVydmFsXG5cdFx0ZHBpOiAxXG5cdH0sXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0YXBwID0gdGhpcy5hcHA7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwXG5cdFx0fTtcblxuXHRcdHRoaXMuc2dyb3VwID0ge1xuXHRcdFx0Y3VycmVudFk6IDAsXG5cdFx0XHRpbmlZOiA2MCxcblx0XHRcdGFjdGl2ZTogZmFsc2UsXG5cdFx0XHR0b3BCYXI6IHtcblx0XHRcdFx0ZmlsbDogJyM2NjYnLFxuXHRcdFx0XHRoZWlnaHQ6IDEyLFxuXHRcdFx0XHRzdHJva2VFbmFibGVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdGdhcDogMyxcblx0XHRcdHJvd0hlaWdodDogMjIsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiBoZnVuY1xuXHRcdH07XG5cblx0XHR0aGlzLnNiYXIgPSB7XG5cdFx0XHRiYXJoZWlnaHQ6IDEyLFxuXHRcdFx0Z2FwOiAyMCxcblx0XHRcdHJvd2hlaWdodDogIDYwLFxuXHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxuXHRcdFx0cmVzaXphYmxlOiB0cnVlLFxuXHRcdFx0ZHJhZ0JvdW5kRnVuYzogaGZ1bmMsXG5cdFx0XHRyZXNpemVCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdFx0c3ViZ3JvdXA6IHRydWVcblx0XHR9O1xuXHRcdHRoaXMuc2Zvcm09e1xuXHRcdFx0J25hbWUnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAndGV4dCdcblx0XHRcdH0sXG5cdFx0XHQnc3RhcnQnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnZGF0ZScsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24oZCl7XG5cdFx0XHRcdFx0cmV0dXJuIGQudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dDJkOiBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5wYXJzZUV4YWN0KCB1dGlsLmNvcnJlY3RkYXRlKHQpLCAnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdkYXRlJyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRyZXR1cm4gZC50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0MmQ6IGZ1bmN0aW9uKHQpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLnBhcnNlRXhhY3QoIHV0aWwuY29ycmVjdGRhdGUodCksICdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3NlbGVjdCcsXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHQnMTEwJzogJ2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5JzogJ29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2NvbXBsZXRlJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnXG5cdFx0XHR9LFxuXHRcdFx0J2R1cmF0aW9uJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnLFxuXHRcdFx0XHRkMnQ6IGZ1bmN0aW9uKHQsbW9kZWwpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSxtb2RlbC5nZXQoJ2VuZCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0dGhpcy5nZXRGb3JtRWxlbSA9IHRoaXMuY3JlYXRlRWxlbSgpO1xuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuYXBwLnRhc2tzO1xuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XG5cdH0sXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xuXHRcdGlmKGF0dHIpe1xuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xuXHR9LFxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWluRGF0ZSA9IG5ldyBEYXRlKDIwMjAsMSwxKSwgbWF4RGF0ZSA9IG5ldyBEYXRlKDAsMCwwKTtcblx0XHRcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XG5cdFx0XHRcdG1pbkRhdGU9bW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGUgPSBtaW5EYXRlO1xuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XG5cdFx0XG5cdH0sXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xuXHRcdFxuXHRcdHZhciBpbnRlcnZhbCA9IHRoaXMuZ2V0KCdpbnRlcnZhbCcpO1xuXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDEyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdFxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCA3LCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogNykubW92ZVRvRGF5T2ZXZWVrKDEsIC0xKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDcpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiAzMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluLm1vdmVUb0ZpcnN0RGF5T2ZRdWFydGVyKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gMzAgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcblx0XHRcdGNlbGxXaWR0aCA9IDMwO1xuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2l6ZSAvIGR1cmF0aW9uO1xuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gZHBpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcblx0XHRcdGRwaSA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIwICogZHBpKTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xuXHRcdFx0fTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHR9XG5cdFx0dmFyIGhEYXRhID0ge1xuXHRcdFx0JzEnOiBbXSxcblx0XHRcdCcyJzogW10sXG5cdFx0XHQnMyc6IFtdXG5cdFx0fTtcblx0XHR2YXIgaGRhdGEzID0gW107XG5cdFx0XG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcblx0XHRcblx0XHRsYXN0ID0gc3RhcnQ7XG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR2YXIgZHVyZnVuYztcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGR1cmZ1bmMobGFzdCksXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogaW50ZXJ2YWxkYXlzLFxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcblx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHNhdHRyLmJvdW5kYXJ5TWF4ID0gZW5kID0gbGFzdDtcblx0XHRoRGF0YVsnMyddID0gaGRhdGEzO1xuXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBkYXRlIHRvIGVuZCBvZiB5ZWFyXG5cdFx0dmFyIGludGVyID0gRGF0ZS5kYXlzZGlmZihzdGFydCwgbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgMTEsIDMxKSk7XG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdHRleHQ6IHN0YXJ0LmdldEZ1bGxZZWFyKClcblx0XHR9KTtcblx0XHRmb3IoaSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCkgKyAxLCBpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7IGkgPCBpTGVuOyBpKyspe1xuXHRcdFx0aW50ZXIgPSBEYXRlLmlzTGVhcFllYXIoaSkgPyAzNjYgOiAzNjU7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGlcblx0XHRcdH0pO1xuXHRcdH1cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGxhc3QgeWVhciB1cHRvIGVuZCBkYXRlXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0aW50ZXIgPSBEYXRlLmRheXNkaWZmKG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCAwLCAxKSwgZW5kKTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdFx0dGV4dDogZW5kLmdldEZ1bGxZZWFyKClcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKHN0YXJ0LCBzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLFxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcblx0XHR9KTtcblx0XHRcblx0XHRqID0gc3RhcnQuZ2V0TW9udGgoKSArIDE7XG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG5cdFx0aUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpO1xuXHRcdHZhciBlbmRtb250aCA9IGVuZC5nZXRNb250aCgpO1xuXG5cdFx0d2hpbGUgKGkgPD0gaUxlbikge1xuXHRcdFx0d2hpbGUoaiA8IDEyKSB7XG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5nZXREYXlzSW5Nb250aChpLCBqKSxcblx0XHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoaiwgJ20nKVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aiArPSAxO1xuXHRcdFx0fVxuXHRcdFx0aSArPSAxO1xuXHRcdFx0aiA9IDA7XG5cdFx0fVxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGggJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xuXHR9LFxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xuXHR9LFxuXHRjcmVhdGVFbGVtOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWxlbXMgPSB7fSwgb2JqLCBjYWxsYmFjayA9IGZhbHNlLCBjb250ZXh0ID0gZmFsc2U7XG5cdFx0ZnVuY3Rpb24gYmluZFRleHRFdmVudHMoZWxlbWVudCwgb2JqLCBuYW1lKSB7XG5cdFx0XHRlbGVtZW50Lm9uKCdibHVyJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWUgPSAkdGhpcy52YWwoKTtcblx0XHRcdFx0JHRoaXMuZGV0YWNoKCk7XG5cdFx0XHRcdHZhciBjYWxsZnVuYyA9IGNhbGxiYWNrLCBjdHggPSBjb250ZXh0O1xuXHRcdFx0XHRjYWxsYmFjayA9IGZhbHNlO1xuXHRcdFx0XHRjb250ZXh0ID0gZmFsc2U7XG5cdFx0XHRcdGlmIChvYmoudDJkKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqLnQyZCh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FsbGZ1bmMuY2FsbChjdHgsbmFtZSx2YWx1ZSk7XG5cdFx0XHR9KS5vbigna2V5cHJlc3MnLGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRpZihldmVudC53aGljaD09PTEzKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdGZ1bmN0aW9uIGJpbmREYXRlRXZlbnRzKGVsZW1lbnQsb2JqLG5hbWUpe1xuXHRcdFx0ZWxlbWVudC5kYXRlcGlja2VyKHsgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLG9uQ2xvc2U6ZnVuY3Rpb24oKXtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2Nsb3NlIGl0Jyk7XG5cdFx0XHRcdHZhciAkdGhpcz0kKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWU9JHRoaXMudmFsKCk7XG5cdFx0XHRcdCR0aGlzLmRldGFjaCgpO1xuXHRcdFx0XHR2YXIgY2FsbGZ1bmM9Y2FsbGJhY2ssY3R4PWNvbnRleHQ7XG5cdFx0XHRcdGNhbGxiYWNrPWZhbHNlO1xuXHRcdFx0XHRjb250ZXh0PWZhbHNlO1xuXHRcdFx0XHRpZihvYmpbJ3QyZCddKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqWyd0MmQnXSh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdFx0XHRjYWxsZnVuYy5jYWxsKGN0eCxuYW1lLHZhbHVlKTtcblx0XHRcdFx0fSwgMTApO1xuXHRcdFx0fX0pO1xuXHRcdH1cblx0XHRcblx0XHRmb3IodmFyIGkgaW4gdGhpcy5zZm9ybSl7XG5cdFx0XHRvYmo9dGhpcy5zZm9ybVtpXTtcblx0XHRcdGlmKG9iai5lZGl0YWJsZSl7XG5cdFx0XHRcdGlmKG9iai50eXBlPT09J3RleHQnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmRUZXh0RXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKG9iai50eXBlPT09J2RhdGUnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmREYXRlRXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH1cblxuXHRcdG9iaiA9IG51bGw7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLCBtb2RlbCwgY2FsbGZ1bmMsIGN0eCl7XG5cdFx0XHRjYWxsYmFjayA9IGNhbGxmdW5jO1xuXHRcdFx0Y29udGV4dCA9IGN0eDtcblx0XHRcdHZhciBlbGVtZW50PWVsZW1zW2ZpZWxkXSwgdmFsdWUgPSBtb2RlbC5nZXQoZmllbGQpO1xuXHRcdFx0aWYgKHRoaXMuc2Zvcm1bZmllbGRdLmQydCkge1xuXHRcdFx0XHR2YWx1ZSA9IHRoaXMuc2Zvcm1bZmllbGRdLmQydCh2YWx1ZSwgbW9kZWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxlbWVudC52YWwodmFsdWUpO1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQ7XG5cdFx0fTtcblx0XG5cdH0sXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRUb1RleHQ9e1xuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XG5cdFx0fTtcblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJccnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXHJ2YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxydmFyIFRhc2tNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHIgICAgZGVmYXVsdHM6IHtcciAgICAgICAgbmFtZTogJ05ldyB0YXNrJyxcciAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyICAgICAgICBjb21wbGV0ZTogMCxcciAgICAgICAgYWN0aW9uOiAnJyxcciAgICAgICAgYWN0aXZlIDogdHJ1ZSxcciAgICAgICAgc29ydGluZGV4OiAwLFxyICAgICAgICBkZXBlbmRlbmN5OicnLFxyICAgICAgICByZXNvdXJjZXM6IHt9LFxyICAgICAgICBzdGF0dXM6IDExMCxcciAgICAgICAgaGVhbHRoOiAyMSxcciAgICAgICAgc3RhcnQ6ICcnLFxyICAgICAgICBlbmQ6ICcnLFxyICAgICAgICBQcm9qZWN0UmVmIDogcGFyYW1zLnByb2plY3QsXHIgICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyICAgICAgICBjb2xvcjonIzAwOTBkMycsXHIgICAgICAgIGxpZ2h0Y29sb3I6ICcjRTZGMEZGJyxcciAgICAgICAgZGFya2NvbG9yOiAnI2U4ODEzNCcsXHIgICAgICAgIGFUeXBlOiAnJyxcciAgICAgICAgcmVwb3J0YWJsZTogJycsXHIgICAgICAgIHBhcmVudGlkOiAwLFxyICAgICAgICBoaWRkZW4gOiBmYWxzZSxcciAgICAgICAgY29sbGFwc2VkIDogZmFsc2VcciAgICB9LFxyICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcciAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgdGhpcy5fY2hlY2tUaW1lKTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdjb2xsYXBzZWQnKSkge1xyICAgICAgICAgICAgICAgICAgICBjaGlsZC5oaWRlKCk7XHIgICAgICAgICAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgICAgICAgICAgY2hpbGQuc2hvdygpO1xyICAgICAgICAgICAgICAgIH1cciAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcciAgICAgICAgICAgICAgICBjaGlsZC5kZXN0cm95KCk7XHIgICAgICAgICAgICB9KTtcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBzaG93IDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XHIgICAgfSxcciAgICBoaWRlIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCB0cnVlKTtcciAgICB9LFxyICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyICAgICAgICB2YXIgc3RhcnQsIGVuZDtcciAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5zdGFydCkpe1xyICAgICAgICAgICAgc3RhcnQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5zdGFydCksJ2RkL01NL3l5eXknKSB8fFxyICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5zdGFydCk7XHIgICAgICAgIH0gZWxzZSB7XHIgICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XHIgICAgICAgIH1cciAgICAgICAgXHIgICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2UuZW5kKSl7XHIgICAgICAgICAgICBlbmQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5lbmQpLCdkZC9NTS95eXl5JykgfHxcciAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLmVuZCk7XHIgICAgICAgIH0gZWxzZSB7XHIgICAgICAgICAgICBlbmQgPSBuZXcgRGF0ZSgpO1xyICAgICAgICB9XHJcciAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSBzdGFydCA8IGVuZCA/IHN0YXJ0IDogZW5kO1xyICAgICAgICByZXNwb25zZS5lbmQgPSBzdGFydCA8IGVuZCA/IGVuZCA6IHN0YXJ0O1xyXHIgICAgICAgIHJlc3BvbnNlLnBhcmVudGlkID0gcGFyc2VJbnQocmVzcG9uc2UucGFyZW50aWQgfHwgJzAnLCAxMCk7XHJcciAgICAgICAgLy8gcmVtb3ZlIG51bGwgcGFyYW1zXHIgICAgICAgIF8uZWFjaChyZXNwb25zZSwgZnVuY3Rpb24odmFsLCBrZXkpIHtcciAgICAgICAgICAgIGlmICh2YWwgPT09IG51bGwpIHtcciAgICAgICAgICAgICAgICBkZWxldGUgcmVzcG9uc2Vba2V5XTtcciAgICAgICAgICAgIH1cciAgICAgICAgfSk7XHIgICAgICAgIHJldHVybiByZXNwb25zZTtcciAgICB9LFxyICAgIF9jaGVja1RpbWUgOiBmdW5jdGlvbigpIHtcciAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XHIgICAgICAgICAgICByZXR1cm47XHIgICAgICAgIH1cciAgICAgICAgdmFyIHN0YXJ0VGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdzdGFydCcpO1xyICAgICAgICB2YXIgZW5kVGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdlbmQnKTtcciAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICB2YXIgY2hpbGRTdGFydFRpbWUgPSBjaGlsZC5nZXQoJ3N0YXJ0Jyk7XHIgICAgICAgICAgICB2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcciAgICAgICAgICAgIGlmKGNoaWxkU3RhcnRUaW1lLmNvbXBhcmVUbyhzdGFydFRpbWUpID09PSAtMSkge1xyICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGNoaWxkU3RhcnRUaW1lO1xyICAgICAgICAgICAgfVxyICAgICAgICAgICAgaWYoY2hpbGRFbmRUaW1lLmNvbXBhcmVUbyhlbmRUaW1lKSA9PT0gMSl7XHIgICAgICAgICAgICAgICAgZW5kVGltZSA9IGNoaWxkRW5kVGltZTtcciAgICAgICAgICAgIH1cciAgICAgICAgfS5iaW5kKHRoaXMpKTtcciAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0Jywgc3RhcnRUaW1lKTtcciAgICAgICAgdGhpcy5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IFRhc2tNb2RlbDtcciIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHR2YXIgcHJtYXJyID0gcHJtc3RyLnNwbGl0KCcmJyk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcHJtYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHRtcGFyciA9IHBybWFycltpXS5zcGxpdCgnPScpO1xuXHRcdHBhcmFtc1t0bXBhcnJbMF1dID0gdG1wYXJyWzFdO1xuXHR9XG5cdHJldHVybiBwYXJhbXM7XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldFVSTFBhcmFtcyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcHJtc3RyID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSk7XG5cdHJldHVybiBwcm1zdHIgIT09IG51bGwgJiYgcHJtc3RyICE9PSAnJyA/IHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIDoge307XG59O1xuXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDAyLjEyLjIwMTQuXHJcbiAqL1xyXG5cclxudmFyIHRlbXBsYXRlID0gXCI8ZGl2IGNsYXNzPVxcXCJ1aSBzbWFsbCBtb2RhbCBhZGQtbmV3LXRhc2sgZmxpcFxcXCI+XFxyXFxuICAgIDxpIGNsYXNzPVxcXCJjbG9zZSBpY29uXFxcIj48L2k+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImhlYWRlclxcXCI+XFxyXFxuICAgIDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb250ZW50XFxcIj5cXHJcXG4gICAgICAgIDxmb3JtIGlkPVxcXCJuZXctdGFzay1mb3JtXFxcIiBhY3Rpb249XFxcIi9cXFwiIHR5cGU9XFxcIlBPU1RcXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInVpIGZvcm0gc2VnbWVudFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxwPkxldCdzIGdvIGFoZWFkIGFuZCBzZXQgYSBuZXcgZ29hbC48L3A+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbD5UYXNrIG5hbWU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcIm5hbWVcXFwiIHBsYWNlaG9sZGVyPVxcXCJOZXcgdGFzayBuYW1lXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbD5EaXNjcmlwdGlvbjwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgbmFtZT1cXFwiZGVzY3JpcHRpb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJUaGUgZGV0YWlsZWQgZGVzY3JpcHRpb24gb2YgeW91ciB0YXNrXFxcIj48L3RleHRhcmVhPlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlNlbGVjdCBwYXJlbnQ8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJ1aSBkcm9wZG93biBzZWxlY3Rpb25cXFwiPi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IG5hbWU9XFxcInBhcmVudGlkXFxcIiBjbGFzcz1cXFwidWkgZHJvcGRvd25cXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPC9kaXY+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkIHJlc291cmNlc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkFzc2lnbiBSZXNvdXJjZXM8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U3RhcnQgRGF0ZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiIG5hbWU9XFxcInN0YXJ0XFxcIiBwbGFjZWhvbGRlcj1cXFwiU3RhcnQgRGF0ZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+RW5kIERhdGU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJkYXRlXFxcIiBuYW1lPVxcXCJlbmRcXFwiIHBsYWNlaG9sZGVyPVxcXCJFbmQgRGF0ZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImNvbXBsZXRlXFxcIiB2YWx1ZT1cXFwiMFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImFjdGlvblxcXCIgdmFsdWU9XFxcImFkZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImRlcGVuZGVuY3lcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJhVHlwZVxcXCIgdmFsdWU9XFxcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImhlYWx0aFxcXCIgdmFsdWU9XFxcIjIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiY29sb3JcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJtaWxlc3RvbmVcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiZGVsaXZlcmFibGVcXFwiIHZhbHVlPVxcXCIwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwicmVwb3J0YWJsZVxcXCIgdmFsdWU9XFxcIjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJzb3J0aW5kZXhcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW5zZXJ0UG9zXFxcIiB2YWx1ZT1cXFwic2V0XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwicmVmZXJlbmNlX2lkXFxcIiB2YWx1ZT1cXFwiLTFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U3RhdHVzPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ1aSBmbHVpZCBzZWxlY3Rpb24gZHJvcGRvd25cXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJzdGF0dXNcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkZWZhdWx0IHRleHRcXFwiPlN0YXR1czwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwiZHJvcGRvd24gaWNvblxcXCI+PC9pPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZW51XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiIGRhdGEtdmFsdWU9XFxcIjEwOFxcXCI+UmVhZHk8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiIGRhdGEtdmFsdWU9XFxcIjEwOVxcXCI+T3BlbjwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTEwXFxcIj5Db21wbGV0ZWQ8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+RHVyYXRpb248L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJudW1iZXJcXFwiIG1pbj1cXFwiMFxcXCIgbmFtZT1cXFwiZHVyYXRpb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJQcm9qZWN0IER1cmF0aW9uXFxcIiByZXF1aXJlZCByZWFkb25seT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cXFwic3VibWl0Rm9ybVxcXCIgY2xhc3M9XFxcInVpIGJsdWUgc3VibWl0IHBhcmVudCBidXR0b25cXFwiPlN1Ym1pdDwvYnV0dG9uPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9mb3JtPlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cIjtcclxuXHJcbnZhciBkZW1vUmVzb3VyY2VzID0gW3tcIndic2lkXCI6MSxcInJlc19pZFwiOjEsXCJyZXNfbmFtZVwiOlwiSm9lIEJsYWNrXCIsXCJyZXNfYWxsb2NhdGlvblwiOjYwfSx7XCJ3YnNpZFwiOjMsXCJyZXNfaWRcIjoyLFwicmVzX25hbWVcIjpcIkpvaG4gQmxhY2ttb3JlXCIsXCJyZXNfYWxsb2NhdGlvblwiOjQwfV07XHJcblxyXG52YXIgQWRkRm9ybVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogZG9jdW1lbnQuYm9keSxcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcclxuICAgIGV2ZW50czoge1xyXG4gICAgICAgICdjbGljayAubmV3LXRhc2snOiAnb3BlbkZvcm0nLFxyXG4gICAgICAgICdjbGljayAjc3VibWl0Rm9ybSc6ICdzdWJtaXRGb3JtJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy50ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZUZvcm0oKTtcclxuICAgICAgICB0aGlzLl9pbml0UmVzb3VyY2VzKCk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQnLCB0aGlzLl9zZXR1cFBhcmVudFNlbGVjdG9yKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFJlc291cmNlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIFJlc291cmNlcyBmcm9tIGJhY2tlbmRcclxuICAgICAgICB2YXIgJHJlc291cmNlcyA9ICc8c2VsZWN0IGlkPVwicmVzb3VyY2VzXCIgIG5hbWU9XCJyZXNvdXJjZXNbXVwiIG11bHRpcGxlPVwibXVsdGlwbGVcIj4nO1xyXG4gICAgICAgIGRlbW9SZXNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgJHJlc291cmNlcyArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyByZXNvdXJjZS5yZXNfaWQgKyAnXCI+JyArIHJlc291cmNlLnJlc19uYW1lICsgJzwvb3B0aW9uPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHJlc291cmNlcyArPSAnPC9zZWxlY3Q+JztcclxuICAgICAgICAvLyBhZGQgYmFja2VuZCB0byB0aGUgdGFzayBsaXN0XHJcbiAgICAgICAgJCgnLnJlc291cmNlcycpLmFwcGVuZCgkcmVzb3VyY2VzKTtcclxuXHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBtdWx0aXBsZSBzZWxlY3RvcnNcclxuICAgICAgICAkKCcjcmVzb3VyY2VzJykuY2hvc2VuKHt3aWR0aDogJzk1JSd9KTtcclxuICAgIH0sXHJcbiAgICBfZm9ybVZhbGlkYXRpb25QYXJhbXMgOiB7XHJcbiAgICAgICAgbmFtZToge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnbmFtZScsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2UgZW50ZXIgYSB0YXNrIG5hbWUnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBsZXRlOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdjb21wbGV0ZScsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2UgZW50ZXIgYW4gZXN0aW1hdGUgZGF5cydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ3N0YXJ0JyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYSBzdGFydCBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2VuZCcsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGFuIGVuZCBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkdXJhdGlvbjoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhIHZhbGlkIGR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGF0dXM6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ3N0YXR1cycsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2VsZWN0IGEgc3RhdHVzJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlRm9ybSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy5tYXN0aGVhZCAuaW5mb3JtYXRpb24nKS50cmFuc2l0aW9uKCdzY2FsZSBpbicpO1xyXG4gICAgICAgICQoJy51aS5mb3JtJykuZm9ybSh0aGlzLl9mb3JtVmFsaWRhdGlvblBhcmFtcyk7XHJcbiAgICAgICAgLy8gYXNzaWduIHJhbmRvbSBwYXJlbnQgY29sb3JcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiY29sb3JcIl0nKS52YWwoJyMnK01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxNjc3NzIxNSkudG9TdHJpbmcoMTYpKTtcclxuICAgIH0sXHJcbiAgICBfc2V0dXBQYXJlbnRTZWxlY3RvciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkc2VsZWN0b3IgPSAkKCdbbmFtZT1cInBhcmVudGlkXCJdJyk7XHJcbiAgICAgICAgJHNlbGVjdG9yLmVtcHR5KCk7XHJcbiAgICAgICAgJHNlbGVjdG9yLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIjBcIj5NYWluIFByb2plY3Q8L29wdGlvbj4nKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHBhcnNlSW50KHRhc2suZ2V0KCdwYXJlbnRpZCcpLCAxMCk7XHJcbiAgICAgICAgICAgIGlmKHBhcmVudElkID09PSAwKXtcclxuICAgICAgICAgICAgICAgICRzZWxlY3Rvci5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgdGFzay5pZCArICdcIj4nICsgdGFzay5nZXQoJ25hbWUnKSArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJ3NlbGVjdC5kcm9wZG93bicpLmRyb3Bkb3duKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBkcm9wZG93blxyXG4gICAgICAgIHRoaXMuX3NldHVwUGFyZW50U2VsZWN0b3IoKTtcclxuICAgIH0sXHJcbiAgICBvcGVuRm9ybTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLnVpLmFkZC1uZXctdGFzaycpLm1vZGFsKCdzZXR0aW5nJywgJ3RyYW5zaXRpb24nLCAndmVydGljYWwgZmxpcCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9LFxyXG4gICAgc3VibWl0Rm9ybTogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBmb3JtID0gJChcIiNuZXctdGFzay1mb3JtXCIpO1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICQoZm9ybSkuc2VyaWFsaXplQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgICAgIGRhdGFbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICAgICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICAgICAgdmFyIGluc2VydFBvcyA9IGRhdGEuaW5zZXJ0UG9zO1xyXG4gICAgICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5jb2xsZWN0aW9uLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG5cclxuICAgICAgICBpZiAoZm9ybS5nZXQoMCkuY2hlY2tWYWxpZGl0eSgpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyIHRhc2sgPSB0aGlzLmNvbGxlY3Rpb24uYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgICAgICAgICAgdGFzay5zYXZlKCk7XHJcbiAgICAgICAgICAgICQoJy51aS5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWRkRm9ybVZpZXc7IiwidmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBUYXNrVmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9UYXNrVmlldycpO1xyLy92YXIgS0NhbnZhc1ZpZXcgPSByZXF1aXJlKCcuL2NhbnZhcy9LQ2FudmFzVmlldycpO1xydmFyIEdhbnR0Q2hhcnRWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXNDaGFydC9HYW50dENoYXJ0VmlldycpO1xydmFyIEFkZEZvcm1WaWV3ID0gcmVxdWlyZSgnLi9BZGRGb3JtVmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51VmlldycpO1xyXHJ2YXIgR2FudHRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyICAgIGVsOiAnLkdhbnR0JyxcciAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcciAgICAgICAgdGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xyICAgICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcudGFzay1jb250YWluZXInKTtcclxyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyICAgICAgICB0aGlzLm1ha2VTb3J0YWJsZSgpO1xyXHIgICAgICAgIG5ldyBDb250ZXh0TWVudVZpZXcodGhpcy5hcHApLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBBZGRGb3JtVmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBUb3BNZW51Vmlldyh7XHIgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMuY2FudmFzVmlldyA9IG5ldyBHYW50dENoYXJ0Vmlldyh7XHIgICAgICAgICAgICBhcHAgOiB0aGlzLmFwcCxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcclxyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnRlZCBhZGQnLCBmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5lbXB0eSgpO1xyICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBtYWtlU29ydGFibGU6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLiRjb250YWluZXIuc29ydGFibGUoe1xyICAgICAgICAgICAgZ3JvdXA6ICdzb3J0YWJsZScsXHIgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvciA6ICdvbCcsXHIgICAgICAgICAgICBpdGVtU2VsZWN0b3IgOiAnLmRyYWctaXRlbScsXHIgICAgICAgICAgICBwbGFjZWhvbGRlciA6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlciBzb3J0LXBsYWNlaG9sZGVyXCIvPicsXHIgICAgICAgICAgICBvbkRyYWcgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcciAgICAgICAgICAgICAgICB2YXIgJHBsYWNlaG9sZGVyID0gJCgnLnNvcnQtcGxhY2Vob2xkZXInKTtcciAgICAgICAgICAgICAgICB2YXIgaXNTdWJUYXNrID0gISQoJHBsYWNlaG9sZGVyLnBhcmVudCgpKS5oYXNDbGFzcygndGFzay1jb250YWluZXInKTtcciAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuY3NzKHtcciAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctbGVmdCcgOiBpc1N1YlRhc2sgPyAnMzBweCcgOiAnMCdcciAgICAgICAgICAgICAgICB9KTtcciAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcciAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcciAgICAgICAgICAgIG9uRHJvcCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyICAgICAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy4kY29udGFpbmVyLnNvcnRhYmxlKFwic2VyaWFsaXplXCIpLmdldCgpWzBdO1xyICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbihwYXJlbnREYXRhKSB7XHIgICAgICAgICAgICAgICAgICAgIHBhcmVudERhdGEuY2hpbGRyZW4gPSBwYXJlbnREYXRhLmNoaWxkcmVuID8gcGFyZW50RGF0YS5jaGlsZHJlblswXSA6IFtdO1xyICAgICAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNvcnQoZGF0YSk7XHIgICAgICAgICAgICB9LmJpbmQodGhpcylcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBldmVudHM6IHtcciAgICAgICAgJ2NsaWNrICN0SGFuZGxlJzogJ2V4cGFuZCcsXHIgICAgICAgICdkYmxjbGljayAuc3ViLXRhc2snOiAnaGFuZGxlcm93Y2xpY2snLFxyICAgICAgICAnZGJsY2xpY2sgLnRhc2snOiAnaGFuZGxlcm93Y2xpY2snLFxyICAgICAgICAnaG92ZXIgLnN1Yi10YXNrJzogJ3Nob3dNYXNrJ1xyICAgIH0sXHIgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcciAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpLnRvU3RyaW5nKCkgPT09ICcwJykge1xyICAgICAgICAgICAgICAgIHRoaXMuYWRkVGFzayh0YXNrKTtcciAgICAgICAgICAgIH1cciAgICAgICAgfSwgdGhpcyk7XHIgICAgICAgIHRoaXMubWFrZVNvcnRhYmxlKCk7XHIgICAgfSxcciAgICBoYW5kbGVyb3djbGljazogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciBpZCA9IGV2dC5jdXJyZW50VGFyZ2V0LmlkO1xyICAgICAgICB0aGlzLmFwcC50YXNrcy5nZXQoaWQpLnRyaWdnZXIoJ2VkaXRyb3cnLCBldnQpO1xyICAgIH0sXHIgICAgY2FsY3VsYXRlRHVyYXRpb246IGZ1bmN0aW9uKCl7XHJcciAgICAgICAgLy8gQ2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uIGZyb20gc3RhcnQgYW5kIGVuZCBkYXRlXHIgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIF9NU19QRVJfREFZID0gMTAwMCAqIDYwICogNjAgKiAyNDtcciAgICAgICAgaWYoc3RhcnRkYXRlICE9PSBcIlwiICYmIGVuZGRhdGUgIT09IFwiXCIpe1xyICAgICAgICAgICAgdmFyIHV0YzEgPSBEYXRlLlVUQyhzdGFydGRhdGUuZ2V0RnVsbFllYXIoKSwgc3RhcnRkYXRlLmdldE1vbnRoKCksIHN0YXJ0ZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHIgICAgICAgIH1lbHNle1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoMCkpO1xyICAgICAgICB9XHIgICAgfSxcciAgICBleHBhbmQ6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgdGFyZ2V0ID0gJChldnQudGFyZ2V0KTtcciAgICAgICAgdmFyIHdpZHRoID0gMDtcciAgICAgICAgdmFyIHNldHRpbmcgPSB0aGlzLmFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdkaXNwbGF5Jyk7XHIgICAgICAgIGlmICh0YXJnZXQuaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHdpZHRoID0gc2V0dGluZy50SGlkZGVuV2lkdGg7XHIgICAgICAgIH1cciAgICAgICAgZWxzZSB7XHIgICAgICAgICAgICB3aWR0aCA9IHNldHRpbmcudGFibGVXaWR0aDtcciAgICAgICAgfVxyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmNzcygnd2lkdGgnLCB3aWR0aCk7XHJcciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNjAwKTtcciAgICAgICAgdGFyZ2V0LnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmZpbmQoJy5tZW51LWhlYWRlcicpLnRvZ2dsZUNsYXNzKCdtZW51LWhlYWRlci1vcGVuZWQnKTtcciAgICB9LFxyICAgIF9tb3ZlQ2FudmFzVmlldyA6IGZ1bmN0aW9uKCkge1xyICAgICAgICB2YXIgc2lkZUJhcldpZHRoID0gJCgnLm1lbnUtY29udGFpbmVyJykud2lkdGgoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldExlZnRQYWRkaW5nKHNpZGVCYXJXaWR0aCk7XHIgICAgfSxcciAgICBhZGRUYXNrOiBmdW5jdGlvbih0YXNrKSB7XHIgICAgICAgIHZhciB0YXNrVmlldyA9IG5ldyBUYXNrVmlldyh7bW9kZWw6IHRhc2ssIGFwcCA6IHRoaXMuYXBwfSk7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGFza1ZpZXcucmVuZGVyKCkuZWwpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IEdhbnR0VmlldztcciIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMDguMTIuMjAxNC5cclxuICovXHJcblxyXG52YXIgVG9wTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcuaGVhZC1iYXInLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayBidXR0b24nOiAnb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQnLFxyXG4gICAgICAgICdjbGljayBhW2hyZWY9XCIvIyEvZ2VuZXJhdGUvXCJdJzogJ2dlbmVyYXRlUERGJ1xyXG4gICAgfSxcclxuICAgIG9uSW50ZXJ2YWxCdXR0b25DbGlja2VkIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIHZhciBhY3Rpb24gPSBidXR0b24uZGF0YSgnYWN0aW9uJyk7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gYWN0aW9uLnNwbGl0KCctJylbMV07XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUERGIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgd2luZG93LnByaW50KCk7XHJcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb3BNZW51VmlldztcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgQWxvbmVUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9ib3JkZXJXaWR0aCA6IDMsXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gXy5leHRlbmQoQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZXZlbnRzKCksIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5sZWZ0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAucmlnaHRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5sZWZ0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAucmlnaHRCb3JkZXInIDogJ3JlbmRlcicsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5sZWZ0Qm9yZGVyJyA6ICdfcG9pbnRlck1vdXNlJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5sZWZ0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLnJpZ2h0Qm9yZGVyJyA6ICdfcG9pbnRlck1vdXNlJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5yaWdodEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZSdcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLnBhcmFtcy5wYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5wYXJhbXMucGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5wYXJhbXMuaGVpZ2h0IC0gdGhpcy5wYXJhbXMucGFkZGluZyAqIDIsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IHBvcy54LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5wYXJhbXMucGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMucGFyYW1zLnBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMucGFyYW1zLmhlaWdodCAtIHRoaXMucGFyYW1zLnBhZGRpbmcgKiAyLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9wb2ludGVyTW91c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgIH0sXHJcbiAgICBfZGVmYXVsdE1vdXNlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XHJcbiAgICB9LFxyXG4gICAgX2NoYW5nZVNpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGVmdFggPSB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpO1xyXG4gICAgICAgIHZhciByaWdodFggPSB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSArIHRoaXMuX2JvcmRlcldpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC53aWR0aChyaWdodFggLSBsZWZ0WCk7XHJcbiAgICAgICAgcmVjdC54KGxlZnRYKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSAtIHRoaXMuX2JvcmRlcldpZHRoKTtcclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsb25lVGFza1ZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEJhc2ljVGFza1ZpZXcgPSBCYWNrYm9uZS5LaW5ldGljVmlldy5leHRlbmQoe1xyXG4gICAgcGFyYW1zIDoge1xyXG4gICAgICAgIGhlaWdodCA6IDIxLFxyXG4gICAgICAgIHBhZGRpbmcgOiAyXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5wYXJhbXMuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlJyA6ICdfdXBkYXRlRGF0ZXMnLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3lcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLm1vZGVsLmdldCgnbGlnaHRjb2xvcicpLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5wYXJhbXMucGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5wYXJhbXMuaGVpZ2h0IC0gdGhpcy5wYXJhbXMucGFkZGluZyAqIDIsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbWFpblJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5tb2RlbC5nZXQoJ2Rhcmtjb2xvcicpLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5wYXJhbXMucGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5wYXJhbXMuaGVpZ2h0IC0gdGhpcy5wYXJhbXMucGFkZGluZyAqIDIsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29tcGxldGVSZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyZWN0LCBjb21wbGV0ZVJlY3QpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLmZsb29yKHggLyBkYXlzV2lkdGgpLCBkYXlzMiA9IE1hdGguZmxvb3IoKHggKyBsZW5ndGgpIC8gZGF5c1dpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcclxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZHJhZ2dpbmcgPSB0aGlzLmVsLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5nZXRDaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZHJhZ2dpbmcgfHwgY2hpbGQuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdlbmQnKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICAvLyBtb3ZlIGdyb3VwXHJcbiAgICAgICAgdGhpcy5lbC54KHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgbWFpbiByZWN0IHBhcmFtc1xyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LngoMCk7XHJcbiAgICAgICAgcmVjdC53aWR0aCh4LngyIC0geC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc2V0WSA6IGZ1bmN0aW9uKHkpIHtcclxuICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB0aGlzLmVsLnkoeSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1Rhc2tWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrVmlldycpO1xyXG52YXIgQWxvbmVUYXNrVmlldyA9IHJlcXVpcmUoJy4vQWxvbmVUYXNrVmlldycpO1xyXG5cclxudmFyIEdhbnR0Q2hhcnRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjZ2FudHQtY29udGFpbmVyJyxcclxuICAgIF90b3BQYWRkaW5nIDogNzAsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9pbml0U3RhZ2UoKTtcclxuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdEJhY2tncm91bmQoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0VGFza3NWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRDb2xsZWN0aW9uRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0TGVmdFBhZGRpbmcgOiBmdW5jdGlvbihvZmZzZXQpIHtcclxuICAgICAgICB0aGlzLl9sZWZ0UGFkZGluZyA9IG9mZnNldDtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTdGFnZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc3RhZ2UgPSBuZXcgS2luZXRpYy5TdGFnZSh7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA6IHRoaXMuZWxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRMYXllcnMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLkZsYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5CbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcigpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkKHRoaXMuQmxheWVyLCB0aGlzLkZsYXllcik7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZVN0YWdlQXR0cnMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhZ2Uuc2V0QXR0cnMoe1xyXG4gICAgICAgICAgICBvZmZzZXRYIDogLSB0aGlzLl9sZWZ0UGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0OiA1ODAsXHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLiRlbC5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYzogIGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHg7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluWCA9IC0gKGxpbmVXaWR0aCAtIHRoaXMud2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9zLnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvcy54IDwgbWluWCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBtaW5YO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gcG9zLng7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0QmFja2dyb3VuZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IG5ldyBLaW5ldGljLlNoYXBlKHtcclxuICAgICAgICAgICAgc2NlbmVGdW5jOiB0aGlzLl9nZXRTY2VuZUZ1bmN0aW9uKCksXHJcbiAgICAgICAgICAgIHN0cm9rZTogJ2xpZ2h0Z3JheScsXHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoIDogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBiYWNrID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuc3RhZ2UuaGVpZ2h0KCksXHJcbiAgICAgICAgICAgIHdpZHRoIDogd2lkdGhcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5CbGF5ZXIuYWRkKGJhY2spLmFkZChzaGFwZSk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2dldFNjZW5lRnVuY3Rpb24gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2Rpc3BsYXkgPSB0aGlzLnNldHRpbmdzLnNkaXNwbGF5O1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gMTtcclxuICAgICAgICB2YXIgcm93SGVpZ2h0ID0gMjA7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0KXtcclxuICAgICAgICAgICAgdmFyIGksIHMsIGlMZW4gPSAwLFx0ZGF5c1dpZHRoID0gc2F0dHIuZGF5c1dpZHRoLCB4LFx0bGVuZ3RoLFx0aERhdGEgPSBzYXR0ci5oRGF0YTtcclxuICAgICAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIC8vZHJhdyB0aHJlZSBsaW5lc1xyXG4gICAgICAgICAgICBmb3IoaSA9IDE7IGkgPCA0IDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhsaW5lV2lkdGggKyBvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgeWkgPSAwLCB5ZiA9IHJvd0hlaWdodCwgeGkgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHMgPSAxOyBzIDwgMzsgcysrKXtcclxuICAgICAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzEwcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5ZiAtIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeWkgPSB5ZjsgeWYgPSB5ZiArIHJvd0hlaWdodDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7IHMgPSAzOyB5ZiA9IDEyMDA7XHJcbiAgICAgICAgICAgIHZhciBkcmFnSW50ID0gcGFyc2VJbnQoc2F0dHIuZHJhZ0ludGVydmFsLCAxMCk7XHJcbiAgICAgICAgICAgIHZhciBoaWRlRGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiggZHJhZ0ludCA9PT0gMTQgfHwgZHJhZ0ludCA9PT0gMzApe1xyXG4gICAgICAgICAgICAgICAgaGlkZURhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxlbmd0aD1oRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlmKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICc2cHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xyXG4gICAgICAgICAgICAgICAgLy8gZGF0ZSBoaWRlIG9uIHNwZWNpZmljIHZpZXdzXHJcbiAgICAgICAgICAgICAgICBpZiAoaGlkZURhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMXB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeC1sZW5ndGgrNDAseWkrcm93SGVpZ2h0LzIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdyZW1vdmUnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciB2aWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2aWV3LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBfLndpdGhvdXQodGhpcy5fdGFza1ZpZXdzLCB2aWV3KTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFRhc2tzVmlld3MgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB0aGlzLkZsYXllci5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFRhc2tWaWV3IDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciB2aWV3O1xyXG4gICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IE5lc3RlZFRhc2tWaWV3KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFsb25lVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MucHVzaCh2aWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVzb3J0Vmlld3MgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGFzdFkgPSB0aGlzLl90b3BQYWRkaW5nO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2aWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2aWV3LnNldFkobGFzdFkpO1xyXG4gICAgICAgICAgICBsYXN0WSArPSB2aWV3LmhlaWdodDtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFza1ZpZXc7IiwiZnVuY3Rpb24gQ29udGV4dE1lbnVWaWV3KGFwcCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLmFwcCA9IGFwcDtcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ2RpdicsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMucGFyZW50KCkpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuYXBwLnRhc2tzLmdldChpZCk7XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2RlbGV0ZScpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Byb3BlcnRpZXMnKXtcclxuICAgICAgICAgICAgICAgIHZhciAkcHJvcGVydHkgPSAnLnByb3BlcnR5LSc7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcxMDgnOiAnUmVhZHknLFxyXG4gICAgICAgICAgICAgICAgICAgICcxMDknOiAnT3BlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzExMCc6ICdDb21wbGV0ZSdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgJGVsID0gJChkb2N1bWVudCk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ25hbWUnKS5odG1sKG1vZGVsLmdldCgnbmFtZScpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZGVzY3JpcHRpb24nKS5odG1sKG1vZGVsLmdldCgnZGVzY3JpcHRpb24nKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXJ0JykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZW5kJykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXR1cycpLmh0bWwoc3RhdHVzW21vZGVsLmdldCgnc3RhdHVzJyldKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHJcbiAgICAgICAgICAgICAgICBpZihzdGFydGRhdGUgIT0gXCJcIiAmJiBlbmRkYXRlICE9IFwiXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydkdXJhdGlvbicpLmh0bWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJCgnLnVpLnByb3BlcnRpZXMnKS5tb2RhbCgnc2V0dGluZycsICd0cmFuc2l0aW9uJywgJ3ZlcnRpY2FsIGZsaXAnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tb2RhbCgnc2hvdycpXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY29udmVydERhdGUoaW5wdXRGb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBwYWQocykgeyByZXR1cm4gKHMgPCAxMCkgPyAnMCcgKyBzIDogczsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoaW5wdXRGb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbcGFkKGQuZ2V0RGF0ZSgpKSwgcGFkKGQuZ2V0TW9udGgoKSsxKSwgZC5nZXRGdWxsWWVhcigpXS5qb2luKCcvJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QWJvdmUnKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdpbmRlbnQnKXtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmV4cGFuZC1tZW51JykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsX2lkID0gJCh0aGlzKS5jbG9zZXN0KCdkaXYnKS5wcmV2KCkuZmluZCgnLnN1Yi10YXNrJykubGFzdCgpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldk1vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KHJlbF9pZCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50X2lkID0gcHJldk1vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgncGFyZW50aWQnLCBwYXJlbnRfaWQpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvYmVDaGlsZCA9ICQodGhpcykubmV4dCgpLmNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0b2JlQ2hpbGQsIGZ1bmN0aW9uKGluZGV4LCBkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRJZCA9ICQodGhpcykuYXR0cignaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLHBhcmVudF9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3Rhc2snKS5hZGRDbGFzcygnc3ViLXRhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMzBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdwYXJlbnRpZCcsMCk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9iZUNoaWxkID0gJCh0aGlzKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJJbmRleCA9ICQodGhpcykuaW5kZXgoKTtcclxuICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKHRvYmVDaGlsZCwgZnVuY3Rpb24oaW5kZXgsIGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID4gY3VyckluZGV4KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZE1vZGVsID0gc2VsZi5hcHAudGFza3MuZ2V0KGNoaWxkSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLG1vZGVsLmdldCgnaWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wcmVwZW5kKCc8bGkgY2xhc3M9XCJleHBhbmQtbWVudVwiPjxpIGNsYXNzPVwidHJpYW5nbGUgdXAgaWNvblwiPjwvaT4gPC9saT4nKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3N1Yi10YXNrJykuYWRkQ2xhc3MoJ3Rhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy5yZW5kZXJncm91cHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7bmFtZTogXCJOZXcgUm93IEFib3ZlXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHtuYW1lOiBcIk5ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHtuYW1lOiBcIkluZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7bmFtZTogXCJPdXRkZW50IFJvd1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7bmFtZTogXCJQcm9wZXJ0aWVzXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjoge25hbWU6IFwiRGVsZXRlIFJvd1wiLCBpY29uOiBcIlwifVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmFwcC50YXNrcy5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgfVxyXG4gICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcbiAgICBkYXRhLnBhcmVudGlkID0gcmVmX21vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgIHZhciB0YXNrID0gdGhpcy5hcHAudGFza3MuYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwiXG52YXIgdGVtcGxhdGUgPSBcIjxkaXY+XFxyXFxuICAgIDx1bD5cXHJcXG4gICAgICAgIDwlIHZhciBzZXR0aW5nPWFwcC5zZXR0aW5nczslPlxcclxcbiAgICAgICAgPCUgaWYoaXNQYXJlbnQpeyAlPiA8bGkgY2xhc3M9XFxcImV4cGFuZC1tZW51XFxcIj48aSBjbGFzcz1cXFwidHJpYW5nbGUgZG93biBpY29uXFxcIj48L2k+PC9saT48JSB9ICU+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1uYW1lXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcIm5hbWVcXFwiLG5hbWUpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtc3RhcnRcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhcnRcXFwiLHN0YXJ0KSk7JT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZW5kXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImVuZFxcXCIsZW5kKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWNvbXBsZXRlXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImNvbXBsZXRlXFxcIixjb21wbGV0ZSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1zdGF0dXNcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhdHVzXFxcIixzdGF0dXMpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZHVyYXRpb25cXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwiZHVyYXRpb25cXFwiLDAse1xcXCJzdGFydFxcXCI6c3RhcnQsXFxcImVuZFxcXCI6ZW5kfSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcInJlbW92ZS1pdGVtXFxcIj48YnV0dG9uIGNsYXNzPVxcXCJtaW5pIHJlZCB1aSBidXR0b25cXFwiPiA8aSBjbGFzcz1cXFwic21hbGwgdHJhc2ggaWNvblxcXCI+PC9pPjwvYnV0dG9uPjwvbGk+XFxyXFxuICAgIDwvdWw+XFxyXFxuPC9kaXY+XCI7XG5cbnZhciBUYXNrSXRlbVZpZXc9QmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lIDogJ2xpJyxcblx0dGVtcGxhdGU6IF8udGVtcGxhdGUodGVtcGxhdGUpLFxuXHRpc1BhcmVudDogZmFsc2UsXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2VkaXRyb3cnLCB0aGlzLmVkaXQpO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpuYW1lIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6c3RhdHVzJywgdGhpcy5yZW5kZXJSb3cpO1xuXHRcdHRoaXMuJGVsLmhvdmVyKGZ1bmN0aW9uKGUpe1xuXHRcdFx0JChkb2N1bWVudCkuZmluZCgnLml0ZW0tc2VsZWN0b3InKS5zdG9wKCkuY3NzKHtcblx0XHRcdFx0dG9wOiAoJChlLmN1cnJlbnRUYXJnZXQpLm9mZnNldCgpLnRvcCkrJ3B4J1xuXHRcdFx0fSkuZmFkZUluKCk7XG5cdFx0fSwgZnVuY3Rpb24oKXtcblx0XHRcdCQoZG9jdW1lbnQpLmZpbmQoJy5pdGVtLXNlbGVjdG9yJykuc3RvcCgpLmZhZGVPdXQoKTtcblx0XHR9KTtcblx0XHR0aGlzLiRlbC5vbignY2xpY2snLGZ1bmN0aW9uKCl7XG5cdFx0XHQkKGRvY3VtZW50KS5maW5kKCcuaXRlbS1zZWxlY3RvcicpLnN0b3AoKS5mYWRlT3V0KCk7XG5cdFx0fSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24ocGFyZW50KXtcblx0XHR2YXIgYWRkQ2xhc3M9J3N1Yi10YXNrIGRyYWctaXRlbSc7XG5cdFx0XG5cdFx0aWYocGFyZW50KXtcblx0XHRcdGFkZENsYXNzPVwidGFza1wiO1xuXHRcdFx0dGhpcy5pc1BhcmVudCA9IHRydWU7XG5cdFx0XHR0aGlzLnNldEVsZW1lbnQoJCgnPGRpdj4nKSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLmlzUGFyZW50ID0gZmFsc2U7XG5cdFx0XHR0aGlzLnNldEVsZW1lbnQoJCgnPGxpPicpKTtcblx0XHRcdHRoaXMuJGVsLmRhdGEoe1xuXHRcdFx0XHRpZCA6IHRoaXMubW9kZWwuaWRcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLiRlbC5hZGRDbGFzcyhhZGRDbGFzcyk7XG5cdFx0dGhpcy4kZWwuYXR0cignaWQnLCB0aGlzLm1vZGVsLmNpZCk7XG5cdFx0cmV0dXJuIHRoaXMucmVuZGVyUm93KCk7XG5cdH0sXG5cdHJlbmRlclJvdzpmdW5jdGlvbigpe1xuXHRcdHZhciBkYXRhID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmlzUGFyZW50ID0gdGhpcy5pc1BhcmVudDtcblx0XHRkYXRhLmFwcCA9IHRoaXMuYXBwO1xuXHRcdHRoaXMuJGVsLmh0bWwodGhpcy50ZW1wbGF0ZShkYXRhKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGVkaXQ6ZnVuY3Rpb24oZXZ0KXtcblx0XHR2YXIgdGFyZ2V0ID0gJChldnQudGFyZ2V0KTtcblx0XHR2YXIgd2lkdGggID0gcGFyc2VJbnQodGFyZ2V0LmNzcygnd2lkdGgnKSwgMTApIC0gNTtcblx0XHR2YXIgZmllbGQgPSB0YXJnZXQuYXR0cignY2xhc3MnKS5zcGxpdCgnLScpWzFdO1xuXHRcdHZhciBmb3JtID0gdGhpcy5hcHAuc2V0dGluZ3MuZ2V0Rm9ybUVsZW0oZmllbGQsIHRoaXMubW9kZWwsIHRoaXMub25FZGl0LCB0aGlzKTtcblx0XHRmb3JtLmNzcyh7XG5cdFx0XHR3aWR0aDogd2lkdGggKyAncHgnXG5cdFx0fSk7XG5cblx0XHR0YXJnZXQuaHRtbChmb3JtKTtcblx0XHRmb3JtLmZvY3VzKCk7XG5cdH0sXG5cdG9uRWRpdDogZnVuY3Rpb24obmFtZSwgdmFsdWUpe1xuXHRcdGNvbnNvbGUubG9nKG5hbWUsIHZhbHVlKTtcblx0XHRpZiAobmFtZSA9PT0gJ2R1cmF0aW9uJykge1xuXHRcdFx0dmFyIHN0YXJ0ID0gdGhpcy5tb2RlbC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR2YXIgZW5kID0gc3RhcnQuY2xvbmUoKS5hZGREYXlzKHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCdlbmQnLCBlbmQpLnNhdmUoKTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMubW9kZWwuc2V0KG5hbWUsIHZhbHVlKS5zYXZlKCk7XG5cdFx0fVxuXHRcdHRoaXMucmVuZGVyUm93KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tJdGVtVmlldztcbiIsInZhciBUYXNrSXRlbVZpZXcgPSByZXF1aXJlKCcuL1Rhc2tJdGVtVmlldycpO1xuXG52YXIgVGFza1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICdsaScsXG5cdGNsYXNzTmFtZTogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyxcblx0Y29sbGFwc2VkIDogZmFsc2UsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdH0sXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAudGFzayAuZXhwYW5kLW1lbnUnOiAnY29sbGFwc2VPckV4cGFuZCcsXG5cdFx0J2NsaWNrIC5hZGQtaXRlbSBidXR0b24nOiAnYWRkSXRlbScsXG5cdFx0J2NsaWNrIC5yZW1vdmUtaXRlbSBidXR0b24nOiAncmVtb3ZlSXRlbSdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzLm1vZGVsO1xuXHRcdHZhciBpdGVtVmlldyA9IG5ldyBUYXNrSXRlbVZpZXcoe1xuXHRcdFx0bW9kZWwgOiBwYXJlbnQsXG5cdFx0XHRhcHAgOiB0aGlzLmFwcFxuXHRcdH0pO1xuXG5cdFx0dGhpcy4kcGFyZW50ZWwgPSBpdGVtVmlldy5yZW5kZXIodHJ1ZSkuJGVsO1xuXHRcdHRoaXMuJGVsLmFwcGVuZCh0aGlzLiRwYXJlbnRlbCk7XG5cblx0XHR0aGlzLiRlbC5kYXRhKHtcblx0XHRcdGlkIDogcGFyZW50LmlkXG5cdFx0fSk7XG5cdFx0dGhpcy4kY2hpbGRlbCA9ICQoJzxvbCBjbGFzcz1cInN1Yi10YXNrLWxpc3Qgc29ydGFibGVcIj48L29sPicpO1xuXG5cdFx0dGhpcy4kZWwuYXBwZW5kKHRoaXMuJGNoaWxkZWwpO1xuXHRcdHZhciBjaGlsZHJlbiA9IF8uc29ydEJ5KHRoaXMubW9kZWwuY2hpbGRyZW4ubW9kZWxzLCBmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHR9KTtcblx0XHRjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdGl0ZW1WaWV3PW5ldyBUYXNrSXRlbVZpZXcoe1xuXHRcdFx0XHRtb2RlbDogY2hpbGQsXG5cdFx0XHRcdGFwcDogdGhpcy5hcHBcblx0XHRcdH0pO1xuXHRcdFx0aXRlbVZpZXcucmVuZGVyKCk7XG5cdFx0XHR0aGlzLiRjaGlsZGVsLmFwcGVuZChpdGVtVmlldy5lbCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdHRoaXMudG9nZ2xlUGFyZW50KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGNvbGxhcHNlT3JFeHBhbmQ6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsYXBzZWQgPSAhdGhpcy5jb2xsYXBzZWQ7XG5cdFx0dGhpcy5tb2RlbC5zZXQoJ2NvbGxhcHNlZCcsIHRoaXMuY29sbGFwc2VkKTtcblx0XHR0aGlzLnRvZ2dsZVBhcmVudCgpO1xuXHR9LFxuXHR0b2dnbGVQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzdHIgPSB0aGlzLmNvbGxhcHNlZCA/ICc8aSBjbGFzcz1cInRyaWFuZ2xlIHVwIGljb25cIj48L2k+ICcgOiAnPGkgY2xhc3M9XCJ0cmlhbmdsZSBkb3duIGljb25cIj48L2k+Jztcblx0XHR0aGlzLiRjaGlsZGVsLnNsaWRlVG9nZ2xlKCk7XG5cdFx0dGhpcy4kcGFyZW50ZWwuZmluZCgnLmV4cGFuZC1tZW51JykuaHRtbChzdHIpO1xuXHR9LFxuXHRhZGRJdGVtOiBmdW5jdGlvbihldnQpe1xuXHRcdCQoZXZ0LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3VsJykubmV4dCgpLmFwcGVuZCgnPHVsIGNsYXNzPVwic3ViLXRhc2tcIiBpZD1cImMnK01hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAxMDAwMCkgKyAxKSsnXCI+PGxpIGNsYXNzPVwiY29sLW5hbWVcIj48aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIk5ldyBwbGFuXCIgc2l6ZT1cIjM4XCI+PC9saT48bGkgY2xhc3M9XCJjb2wtc3RhcnRcIj48aW5wdXQgdHlwZT1cImRhdGVcIiBwbGFjZWhvbGRlcj1cIlN0YXJ0IERhdGVcIiBzdHlsZT1cIndpZHRoOjgwcHg7XCI+PC9saT48bGkgY2xhc3M9XCJjb2wtZW5kXCI+PGlucHV0IHR5cGU9XCJkYXRlXCIgcGxhY2Vob2xkZXI9XCJFbmQgRGF0ZVwiIHN0eWxlPVwid2lkdGg6ODBweDtcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1jb21wbGV0ZVwiPjxpbnB1dCB0eXBlPVwibnVtYmVyXCIgcGxhY2Vob2xkZXI9XCIyXCIgc3R5bGU9XCJ3aWR0aDogMzBweDttYXJnaW4tbGVmdDogLTE0cHg7XCIgbWluPVwiMFwiPjwvbGk+PGxpIGNsYXNzPVwiY29sLXN0YXR1c1wiPjxzZWxlY3Qgc3R5bGU9XCJ3aWR0aDogNzBweDtcIj48b3B0aW9uIHZhbHVlPVwiaW5jb21wbGV0ZVwiPklub21wbGV0ZWQ8L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiY29tcGxldGVkXCI+Q29tcGxldGVkPC9vcHRpb24+PC9zZWxlY3Q+PC9saT48bGkgY2xhc3M9XCJjb2wtZHVyYXRpb25cIj48aW5wdXQgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiMjRcIiBzdHlsZT1cIndpZHRoOiAzMnB4O21hcmdpbi1sZWZ0OiAtOHB4O1wiIG1pbj1cIjBcIj4gZDwvbGk+PGxpIGNsYXNzPVwicmVtb3ZlLWl0ZW1cIj48YnV0dG9uIGNsYXNzPVwibWluaSByZWQgdWkgYnV0dG9uXCI+IDxpIGNsYXNzPVwic21hbGwgdHJhc2ggaWNvblwiPjwvaT48L2J1dHRvbj48L2xpPjwvdWw+JykuaGlkZSgpLnNsaWRlRG93bigpO1xuXHR9LFxuXHRyZW1vdmVJdGVtOiBmdW5jdGlvbihldnQpe1xuXHRcdHZhciAkcGFyZW50VUwgPSAkKGV2dC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCdvbCB1bCcpLnBhcmVudCgpLnBhcmVudCgpO1xuXHRcdHZhciBpZCA9ICRwYXJlbnRVTC5hdHRyKCdpZCcpO1xuXHRcdHZhciB0YXNrTW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoaWQpO1xuXHRcdGlmKCRwYXJlbnRVTC5oYXNDbGFzcygndGFzaycpKXtcblx0XHRcdCRwYXJlbnRVTC5uZXh0KCdvbCcpLmZhZGVPdXQoMTAwMCwgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH1lbHNle1xuXHRcdFx0JChldnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndWwnKS5mYWRlT3V0KDEwMDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGFza01vZGVsLmRlc3Ryb3koKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza1ZpZXc7XG4iXX0=
