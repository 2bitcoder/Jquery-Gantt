(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		"use strict";
		this.each(function(task) {
			if (!task.get('parentid')) {
				return;
			}
			var parentTask = this.get(task.get('parentid'));
			if (parentTask) {
				parentTask.children.add(task);
			} else {
				console.error('task has parent with id ' + task.get('parentid') + ' - but there is no such task');
			}
			
		}.bind(this));
	},
	checkSortedIndex : function() {
		var sortIndex = 0;
		this.each(function(model) {
			model.set('sortindex', ++sortIndex).save();
			model.children.each(function(child) {
				child.set('sortindex', ++sortIndex).save();
			});
		});
		this.trigger('resort');
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
var util = require('../utils/util');var params = util.getURLParams();var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,        action: '',        active : true,        sortindex: 0,        dependency:'',        resources: {},        status: 110,        health: 21,        start: '',        end: '',        ProjectRef : params.project,        WBS_ID : params.profile,        color:'#0090d3',        lightcolor: '#E6F0FF',        darkcolor: '#e88134',        aType: '',        reportable: '',        parentid: 0    },    initialize : function() {        "use strict";        this.children = new Backbone.Collection();        this.listenTo(this.children, 'change:parentid', function(child) {            this.children.remove(child);        });        this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);        this.listenTo(this, 'destroy', function() {            this.children.each(function(child) {                child.destroy();            });        });    },    parse: function(response) {        var start, end;        if(_.isString(response.start)){            start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            start = new Date();        }                if(_.isString(response.end)){            end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            end = new Date();        }        response.start = start < end ? start : end;        response.end = start < end ? end : start;        response.parentid = parseInt(response.parentid || '0', 10);        // remove null params        _.each(response, function(val, key) {            if (val === null) {                delete response[key];            }        });        return response;    },    _checkTime : function() {        if (this.children.length === 0) {            return;        }        var startTime = this.children.at(0).get('start');        var endTime = this.children.at(0).get('end');        this.children.each(function(child) {            var childStartTime = child.get('start');            var childEndTime = child.get('end');            if(childStartTime.compareTo(startTime) === -1) {                startTime = childStartTime;            }            if(childEndTime.compareTo(endTime) === 1){                endTime = childEndTime;            }        }.bind(this));        this.set('start', startTime);        this.set('end', endTime);    }});module.exports = TaskModel;
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
var ContextMenuView = require('./sideBar/ContextMenuView');var TaskView = require('./sideBar/TaskView');var KCanvasView = require('./canvas/KCanvasView');var AddFormView = require('./AddFormView');var TopMenuView = require('./TopMenuView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$container = this.$el.find('.task-container');        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        this.makeSortable();        new ContextMenuView(this.app).render();        new AddFormView({            collection : this.collection        }).render();        new TopMenuView({            settings : this.app.settings        }).render();        this.listenTo(this.collection, 'sorted add', function() {            this.$container.empty();            this.render();        });    },    makeSortable: function() {        this.$container.sortable({            group: 'sortable',            containerSelector : 'ol',            itemSelector : '.drag-item',            placeholder : '<li class="placeholder sort-placeholder"/>',            onDrag : function($item, position, _super, event) {                var $placeholder = $('.sort-placeholder');                var isSubTask = !$($placeholder.parent()).hasClass('task-container');                $placeholder.css({                    'padding-left' : isSubTask ? '30px' : '0'                });                _super($item, position, _super, event);            }.bind(this),            onDrop : function($item, position, _super, event) {                _super($item, position, _super, event);                var data = this.$container.sortable("serialize").get()[0];                data.forEach(function(parentData) {                    parentData.children = parentData.children ? parentData.children[0] : [];                });                this.collection.resort(data);            }.bind(this)        });    },    events: {        'click #tHandle': 'expand',        'dblclick .sub-task': 'handlerowclick',        'dblclick .task': 'handlerowclick',        'hover .sub-task': 'showMask'    },    render: function() {        this.collection.each(function(task) {            if (task.get('parentid').toString() === '0') {                this.addTask(task);            }        }, this);        this.canvasView = new KCanvasView({            app : this.app,            collection : this.collection        }).render();        this.makeSortable();    },    handlerowclick: function(evt) {        var id = evt.currentTarget.id;        this.app.tasks.get(id).trigger('editrow', evt);    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var target = $(evt.target);        var width = 0;        var setting = this.app.settings.getSetting('display');        if (target.hasClass('contract')) {            width = setting.tHiddenWidth;        }        else {            width = setting.tableWidth;        }        this.$menuContainer.css('width', width);        this.canvasView.setWidth(setting.screenWidth - width - 20);        target.toggleClass('contract');        this.$menuContainer.find('.menu-header').toggleClass('menu-header-opened');    },    addTask: function(task) {        var taskView = new TaskView({model: task, app : this.app});        this.$container.append(taskView.render().el);    }});module.exports = GanttView;
},{"./AddFormView":6,"./TopMenuView":8,"./canvas/KCanvasView":11,"./sideBar/ContextMenuView":12,"./sideBar/TaskView":14}],8:[function(require,module,exports){
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
var dd=Kinetic.DD;
var calculating=false;

function createHandle(option){
	option.draggable=true;
	option.opacity=1;
	option.strokeEnabled=false;
	option.width=2;
	option.fill='black';
	return new Kinetic.Rect(option);
}

function createSubGroup(option){
	var gr = new Kinetic.Group();
	var imgrect = new Kinetic.Rect({
		x:0,
		y:0,
		height: option.height,
		width: 20,
		strokeEnabled: false,
		fill: 'yellow',
		opacity: 0.5
	});
	var anchor = new Kinetic.Circle({
		x: 10,
		y: 5,
		radius: 3,
		strokeWidth: 1,
		name: 'anchor',
		stroke:'black',
		fill:'white'
	});

	var namerect = new Kinetic.Rect({
		x: 20,
		y: 0,
		height: option.height,
		width: 40,
		strokeEnabled: false,
		fill:'pink'
	});
	gr.add(imgrect);
	gr.add(anchor);
	gr.add(namerect);
	return gr;
}

var beforebind=function(func){
	return function(){
		if(calculating) return false;
		calculating=true;
		func.apply(this,arguments);
		calculating=false;
	}
}

	function getDragDir(stage){
		return (stage.getPointerPosition().x-dd.startPointerPos.x>0)?'right':'left';
	}

	var Bar=function(options){
		this.model=options.model;
		this.settings = options.settings;

		this.listenTo(this.model, 'change:complete', this._updateCompleteBar);
		
		var setting = this.setting = this.settings.getSetting('bar');

		this.subgroupoptions = {
			showOnHover: true,
			hideOnHoverOut: true,
			hasSubGroup: false
		};
		
		this.dependants = [];
		this.dependencies = [];

		this.group = new Kinetic.Group(this.getGroupParams());
		this.rect  = new Kinetic.Rect(this.getRectparams());
		this.group.add(this.rect);
		
		if(setting.subgroup){
			this.addSubgroup();
		}
		
		if(setting.draggable){
			this.makeDraggable();
		}
		
		if(setting.resizable){
			this.makeResizable();
		}

		var opt =  this.getRectparams();
		opt.x = 2;
		var completeBar= this.completeBar = new Kinetic.Rect(opt);
		this.group.add(completeBar);
		this._updateCompleteBar();

		//addEvents
		this.bindEvents();
	};

	Bar.prototype={
		_updateCompleteBar : function() {
			var fullWidth = this.rightHandle.getX() - this.leftHandle.getX() +2;
			var completeWidth = ( ( fullWidth ) * (this.model.get('complete') / 100) ) - 4;
			console.log('full width', fullWidth, 'complete', completeWidth);
			if(completeWidth > 0){
				this.completeBar.width(completeWidth);
				this.completeBar.show();
			} else {
				this.completeBar.hide();
			}
			var layer = this.completeBar.getLayer();
//			if (layer) {
//				layer.batchDraw();
//			}
		},
		//retrieves only width,height,x,y relative to point 0,0 on canvas;
		getX1: function(absolute){
			var retval=0;
			if(absolute && this.parent) retval=this.parent.getX();
			return retval+this.group.getX();
		},
		getX2: function(absolute){
			return this.getX1(absolute)+this.getWidth();
		},
		getX:function(absolute){
			return {
				x: this.getX1(absolute),
				y: this.getX2(absolute)
			};
		},
		getY: function(){
			return this.group.getY();
		},
		getHeight: function(){
			return this.rect.getHeight();
		},
		getWidth: function(){
			return this.rect.getWidth();
		},
		
		setX1:function(value,options){
			!options && (options={})
			var prevx,width,dx;

			//if value is in absolute sense then make it relative to parent
			if(options.absolute && this.parent){
				value=value-this.parent.getX(true);
			}
			prevx=this.getX1();
			//dx +ve means bar moved left 
			dx=prevx-value;
			
			var silent=options.silent || options.osame;
			
			this.move(-1*dx,silent);
			//if x2 has to remain same
			// Draw percentage completed
			if(options.osame){
				this.rect.setWidth(dx+this.getWidth());
				this._updateCompleteBar();
				this.renderHandle();
				if(!options.silent){
					this.trigger('resizeleft',this);
					this.trigger('resize',this);
					this.triggerParent('resize');
				}
			}
			this.enableSubgroup();
			
		},
		setX2:function(value,options){
			var prevx,width,dx;
			//if value is in absolute sense then make it relative to parent
			if(options.absolute && this.parent){
				value=value-this.parent.getX(true);
			}
			prevx=this.getX2();
			//dx -ve means bar moved right 
			dx=prevx-value;
			
			var silent=options.silent || options.osame;
			//this.group.setX(value);
			//if x2 has to remain same
			if(options.osame){
				this.rect.setWidth(this.getWidth()-dx);
				this._updateCompleteBar();
				this.renderHandle();
				if(!options.silent){
					this.trigger('resizeright',this);
					this.trigger('resize',this);
					this.triggerParent('resize');
				}
			}
			else{
				this.move(-1*dx,options.silent);
			}
			this.enableSubgroup();
			
		},
		setY:function(value){
			this.group.setY(value);
		},
		setParent:function(parent){
			this.parent=parent;

		},
		triggerParent:function(eventName){
			if(this.parent){
				this.parent.trigger(eventName,this);
			}			
		},
		bindEvents:function(){
			var that=this;
			this.group.on('click',_.bind(this.handleClickevents,this));
			
			this.group.on('mouseover',function(){
				if(!that.subgroupoptions.showOnHover) return;
				that.subgroup.show();
				this.getLayer().draw();
			});
			this.group.on('mouseout',function(){
				if(!that.subgroupoptions.hideOnHoverOut) return;
				that.subgroup.hide();
				this.getLayer().draw();
			});
			
			this.on('resize move',this.renderConnectors,this);
			this.listenTo(this.model, 'change', function() {
				this.render();
			});
			this.on('change', this.handleChange, this);

		},
		destroy : function() {
			this.group.destroy();
			this.stopListening();
		},
		handleChange:function(){
			var model = this.model;
			if(this.parent.syncing){
				return;
			}
			if(model.changed.start || model.changed.end){
				var x=this.calculateX(model);
				if(model.changed.start){
					this.setX1(x.x1,{osame:true,absolute:true});
				}
				else{
					this.setX2(x.x2,{osame:true,absolute:true});
				}
				this.parent.sync();
			}
			console.log('drawing');
			this.draw();
		},
		handleClickevents:function(evt){
			var target,targetName,startBar;
			target=evt.target;
			targetName=target.getName();
			window.startBar;
			if(targetName!=='mainbar'){
				Bar.disableConnector();
				if(targetName=='anchor'){
					target.stroke('red');
					Bar.enableConnector(this);
					var dept = this.model.get('dependency');
					if(dept != ""){
						window.currentDpt.push(this.model.get('dependency'));	
					}
					console.log(window.currentDpt);
					window.startBar = this.model;
				}
			}
			else{
				if((startBar=Bar.isConnectorEnabled())){
					Bar.createRelation(startBar,this);
					window.currentDpt.push(this.model.get('id'));
					window.startBar.set('dependency', JSON.stringify(window.currentDpt));
					window.startBar.save();
					Bar.disableConnector();
				}
			}
			evt.cancelBubble=true;
		},
		makeResizable: function(){
			var that=this;
			this.resizable=true;
			this.leftHandle=createHandle({
				x: 0,
				y: 0,
				height: this.getHeight(),
				dragBoundFunc: this.setting.resizeBoundFunc,
			});
			this.rightHandle=createHandle({
				x: this.getWidth()-2,
				y: 0,
				height: this.getHeight(),
				dragBoundFunc: this.setting.resizeBoundFunc,
			});
			this.leftHandle.on('dragstart',function(){
				that.disableSubgroup();
			});
			this.rightHandle.on('dragstart',function(){
				that.disableSubgroup();
			});
			
			this.leftHandle.on('dragend',function(){
				that.enableSubgroup();
				that.parent.sync();
			});
			this.rightHandle.on('dragend',function(){
				that.enableSubgroup();
				that.parent.sync();
			});
			
			this.leftHandle.on('dragmove',beforebind(function(){
				that.render();
				that.trigger('resizeleft', that);
				that.trigger('resize', that);
				that.triggerParent('resize');
			}));
			this.rightHandle.on('dragmove',beforebind(function(){
				that.render();
				that.trigger('resizeright', that);
				that.trigger('resize', that);
				that.triggerParent('resize');
			}));
			this.leftHandle.on('mouseover',this.changeResizeCursor);
			this.rightHandle.on('mouseover',this.changeResizeCursor);
			this.leftHandle.on('mouseout',this.changeDefaultCursor);
			this.rightHandle.on('mouseout',this.changeDefaultCursor);
			
			this.group.add(this.leftHandle);
			this.group.add(this.rightHandle);


		},
		addSubgroup:function(){
			this.hasSubGroup=true;
			var subgroup,that=this;
			subgroup=this.subgroup=createSubGroup({height:this.getHeight()});
			subgroup.hide();
			subgroup.setX(this.getWidth());
			this.group.add(subgroup);
			
			
			//this.bindAnchor();
		},
		enableSubgroup:function(){
			this.subgroupoptions.showOnHover=true;
			this.subgroup.setX(this.getWidth());
		},
		disableSubgroup:function(){
			this.subgroupoptions.showOnHover=true;
			this.subgroup.hide();
		},
		
		bindAnchor: function(){
			var that=this;
			var anchor=this.subgroup.find('.anchor');
			anchor.on('click',function(evt){
				anchor.stroke('red');
				that.subgroupoptions.hideOnHoverOut=false;
				Kinetic.Connect.start=that;
				this.getLayer().draw();
				evt.cancelBubble = true;
			});

		},
		
		makeDraggable: function(){
			var that=this;
			this.group.draggable(true);
			if(this.setting.dragBoundFunc){
				this.group.dragBoundFunc(this.setting.dragBoundFunc);
			}
			this.group.on('dragmove',beforebind(function(){
				that.trigger('move'+getDragDir(this.getStage()),that);
				that.trigger('move');
				that.triggerParent('move');
			}));
			this.group.on('dragend',function(){
				that.parent.sync();
			});
		},
		changeResizeCursor:function(){
			document.body.style.cursor = 'ew-resize';
		},
		changeDefaultCursor:function(){
			document.body.style.cursor = 'default';
		},
		//renders the handle by its rect
		renderHandle:function(){
			if (!this.resizable) {
				return false;
			}
			var x = this.rect.getX();
			this.leftHandle.setX(x);
			this.rightHandle.setX(x + this.rect.getWidth() - 2);
		},
		
		
		//renders the bar by the handles
		render: function(){
			var x = this.calculateX();
			this.group.setX(x.x1);
			this.leftHandle.setX(0);
			this.rightHandle.setX(x.x2 - x.x1 - 2);
			this.rect.setWidth(x.x2 - x.x1);
			var opts = this.getRectparams();
			opts.fill = this.model.collection.get(this.model.get('parentid')).get('lightcolor');
			this.rect.setAttrs(opts);
			this._updateCompleteBar();
			this.group.getLayer().draw();
		},
		/*
		dependentObj: {'elem':dependant,'connector':connector}
		*/
		addDependant:function(dependantObj){
			this.listenTo(dependantObj.elem,'moveleft resizeleft',this.adjustleft)
			this.dependants.push(dependantObj);
		},
		//renders the bar by its model 
		renderBar:function(){
			var x = this.calculateX();
			this.setX1(x.x1,{absolute:true, silent:true});
			this.setX2(x.x2,{absolute:true, silent:true, osame:true});
			this.renderConnectors();
			console.error('render bar');
		},
		
		addDependancy: function(dependencyObj){
			this.listenTo(dependencyObj.elem,'moveright resizeright',this.adjustright);
			this.dependencies.push(dependencyObj);
			this.renderConnector(dependencyObj,2);
		},
		//checks if the bar needs movement in left side on left movement of dependent and makes adjustment
		adjustleft:function(dependant){
			if(!this.isDependant(dependant)) return false;
			var dx=this.getX1()+this.getWidth()-dependant.getX1();
			//an overlap occurs in this case
			if(dx>0){
				//event will be triggered in move func
				this.move(-1*dx);
				//this.trigger('moveleft',this);
			}
		},
		adjustright:function(dependency){
			if(!this.isDependency(dependency)) return false;
			var dx=dependency.getX1()+dependency.getWidth()-this.getX1();
			//console.log(dx);
			if(dx>0){
				//event will be triggered in move func
				this.move(dx);
				//this.trigger('moveright',this);
			}
		},
		isDependant:function(dependant){
			for(var i=0;i<this.dependants.length;i++){
				if(this.dependants[i]['elem']['barid']===dependant['barid']){
					return true;
					
				}
			}
			return false;

		},
		//@type Dependant:1, Dependency:2
		renderConnector:function(obj,type){
			if(type==1){
				Bar.renderConnector(this,obj.elem,obj.connector);
			}
			else{
				Bar.renderConnector(obj.elem,this,obj.connector);
			}
		},
		//renders all connectors
		renderConnectors:function(){
			for(var i=0,iLen=this.dependants.length;i<iLen;i++){
				this.renderConnector(this.dependants[i],1);
			}
			for(var i=0,iLen=this.dependencies.length;i<iLen;i++){
				this.renderConnector(this.dependencies[i],2);
			}
		},
		isDependency: function(dependency){
			
			for(var i=0;i<this.dependencies.length;i++){
				if(this.dependencies[i]['elem']['barid']===dependency['barid']){
					return true;
					
				}
			}
			return false;
		},
		move: function(dx,silent){
			if(dx===0) {
				return;
			}
			this.group.move({x:dx});
			if(!silent){
				this.trigger('move',this);
				if(dx>0){
					this.trigger('moveright',this);
				}
				else{
					this.trigger('moveleft',this);
				}
				this.triggerParent('move');
			}
		},
		calculateX:function(){
			var attrs = this.settings.getSetting('attr'),
				boundaryMin = attrs.boundaryMin,
				daysWidth = attrs.daysWidth;
			return {
				x1: Date.daysdiff(boundaryMin, this.model.get('start')) * daysWidth,
				x2: Date.daysdiff(boundaryMin, this.model.get('end')) * daysWidth
			};
		},
		calculateDates:function(){
			var attrs = this.settings.getSetting('attr'),
				boundaryMin = attrs.boundaryMin,
				daysWidth = attrs.daysWidth;
			var days1 = Math.round(this.getX1(true) / daysWidth);
			var days2 = Math.round(this.getX2(true) / daysWidth);
			
			return {
				start: boundaryMin.clone().addDays(days1 - 1),
				end: boundaryMin.clone().addDays(days2)
			};
			
		},
		getRectparams:function(){
			var xs  = this.calculateX(this.model);
			return {
				x: 0,
				width: xs.x2 - xs.x1,
				y: 0,
				name: 'mainbar',
				height: this.setting.barheight
			};
		},
		getGroupParams:function(){
			var xs = this.calculateX(this.model);
			return {
				x: xs.x1,
				y: 0
			};
		},
		toggle:function(show){
			var method = show ? 'show' : 'hide';
			console.log('method', method);
			this.group[method]();
			for(var i=0,iLen=this.dependencies.length;i<iLen;i++){
				this.dependencies[i].connector[method]();
			}
		},
		sync:function(){
			var dates = this.calculateDates();
			this.model.set({
				start: dates.start,
				end: dates.end
			});
			this.model.save();
		}
	};
	//It creates a relation between dependant and dependency
	//Dependant is the task which needs to be done after dependency
	//Suppose task B requires task A to be done beforehand. So, A is dependancy/requirement for B whereas B is dependant on A.
	Bar.createRelation=function(dependency,dependant){
		var connector,parent;
		parent=dependant.group.getParent();
		connector=this.createConnector();
		dependency.addDependant({
			'elem':dependant,
			'connector': connector,
		});
		dependant.addDependancy({
			'elem':dependency,
			'connector': connector,
		});
		
		parent.add(connector);
		
	}
	
	Bar.createConnector=function(){
		return new Kinetic.Line({
			strokeWidth: 1,
			stroke: 'black',
			points: [0, 0]
		});
		
	},
	Bar.enableConnector=function(start){
		Kinetic.Connect.start=start;
		start.subgroupoptions.hideOnHoverOut=false;
	}
	Bar.disableConnector=function(){
		if(!Kinetic.Connect.start) return;
		var start=Kinetic.Connect.start;
		start.subgroupoptions.hideOnHoverOut=true;
		Kinetic.Connect.start=null;
	}
	
	Bar.isConnectorEnabled=function(){
		return Kinetic.Connect.start;
	}
	Bar.renderConnector=function(startBar,endBar,connector){
		
		var point1,point2,halfheight,points,color='#000';
		halfheight=parseInt(startBar.getHeight()/2);
		point1={
			x:startBar.getX2(),
			y:startBar.getY()+halfheight,
		}
		point2={
			x:endBar.getX1(),
			y:endBar.getY()+halfheight,
		}
		var offset=5,arrowflank=4,arrowheight=5,bottomoffset=4;
		

		if(point2.x-point1.x<0){
			if(point2.y<point1.y){
				halfheight= -1*halfheight;
				bottomoffset=-1*bottomoffset;
				//arrowheight=-1*arrowheight;
			}
			points=[
			point1.x,point1.y,
			point1.x+offset,point1.y,
			point1.x+offset,point1.y+halfheight+bottomoffset,
			point2.x-offset,point1.y+halfheight+bottomoffset,
			point2.x-offset,point2.y,
			point2.x,point2.y,
			point2.x-arrowheight,point2.y-arrowflank,
			point2.x-arrowheight,point2.y+arrowflank,
			point2.x,point2.y
			];
			color='red';
			
		}
		else if(point2.x-point1.x<5){
			if(point2.y<point1.y){
				halfheight= -1*halfheight;
				bottomoffset=-1*bottomoffset;
				arrowheight=-1*arrowheight;
			}
			points=[
			point1.x,point1.y,
			point1.x+offset,point1.y,
			point1.x+offset,point2.y-halfheight,
			point1.x+offset-arrowflank,point2.y-halfheight-arrowheight,
			point1.x+offset+arrowflank,point2.y-halfheight-arrowheight,
			point1.x+offset,point2.y-halfheight
			];

		}
		else{
			points=[
			point1.x,point1.y,
			point1.x+offset,point1.y,
			point1.x+offset,point2.y,
			point2.x,point2.y,
			point2.x-arrowheight,point2.y-arrowflank,
			point2.x-arrowheight,point2.y+arrowflank,
			point2.x,point2.y
			];
		}
		connector.setAttr('stroke',color);
		connector.setPoints(points);
	}
	
	Kinetic.Connect={
		start:false,
		end:false
	}
	
	
	
	_.extend(Bar.prototype, Backbone.Events);

	module.exports = Bar;
},{}],10:[function(require,module,exports){
var Bar = require('./Bar');

var BarGroup = function(options){
	this.cid = _.uniqueId('bg');
	this.settings = options.settings;
	this.model = options.model;
	var setting = this.setting = options.settings.getSetting('group');
	this.attr = {
		height: 0
	};
	this.syncing = false;
	this.children = [];

	this.group = new Kinetic.Group(this.getGroupParams());
	this.topbar = new Kinetic.Rect(this.getRectparams());
	this.group.add(this.topbar);

	this.attr.height +=  setting.rowHeight;

	if(setting.draggable){
		this.makeDraggable();
	}
	if(setting.resizable){
		this.topbar.makeResizable();
	}
	this.initialize();
};

BarGroup.prototype={
		initialize:function(){
			this.model.children.each(function(child) {
				this.addChild(new Bar({
					model:child,
					settings : this.settings
				}));
			}.bind(this));

			this.listenTo(this.model.children, 'add', function(child) {
				this.addChild(new Bar({
					model:child,
					settings : this.settings
				}));
				this.renderSortedChildren(true);
			}.bind(this));

			this.listenTo(this.model.children, 'remove', function(child) {
				var viewForDelete = _.find(this.children, function(m) {
					return m.model === child;
				});
				this.children = _.without(this.children, viewForDelete);
				viewForDelete.destroy();
				this.renderSortedChildren(true);
			}.bind(this));
			this.renderSortedChildren(true);
			this.renderDependency();
			this.bindEvents();
		},
		destroy : function() {
			this.group.destroy();
		},
		renderSortedChildren:function(nodraw){
			!nodraw && (nodraw=false);
			var sorted=_.sortBy(this.children, function(itembar){
				return itembar.model.get('sortindex');
			});
			this.attr.height=this.setting.rowHeight;
			for(var i=0;i<sorted.length;i++){
				sorted[i].setY(this.getHeight()+this.setting.gap);
				sorted[i].renderConnectors();
				this.attr.height += this.setting.rowHeight;
			}
			if(!nodraw) {
				this.group.getLayer().draw();
			}
		},
		findById:function(id){
			var children=this.children;
			for(var i=0;i<children.length;i++){
				if(children[i].model.get('id')===id)
					return children[i];
			}
			return false;

		},
		renderDependency:function(){
			var children=this.children,dependencies=[],bar;
			for(var i=0;i<children.length;i++){
				dependencies=children[i].model.get('dependency');
				for(var j=0;j<dependencies.length;j++){
					bar=this.findById(dependencies[j]['id']);
					if(bar){
						Bar.createRelation(bar,children[i]);
					}
				}
				
			}
		},

		makeDraggable: function(){
			var that=this;
			this.group.draggable(true);
			if(this.setting.dragBoundFunc){
				this.group.dragBoundFunc(this.setting.dragBoundFunc);
			}
			this.group.on('dragend',function(){
				that.sync();
			});
		},
		//returns the x position of the group
		//The x position of the group is set 0 initially.The topbar x position is set relative to groups 0 position initially. when the group is moved to get the absolute x position of the top bar use getX1 method.
		//The problem is when any children get outside of bound then the position of each children has to be updated. This way solves the problem
		getX:function(){
			return this.group.getX();
		},
		//returns the bbsolute x1 position of top bar
		getX1:function(){
			return this.group.getX()+this.topbar.getX();
		},
		//returns the absolute x1 position of top bar
		getX2:function(){
			return this.getX1()+this.topbar.getWidth();
		},
		getY1:function(){
			return this.group.getY();
		},
		setY:function(value){
			this.group.setY(value);
		},
		getWidth:function(){
			return this.topbar.getWidth();
		},
		getHeight:function(){
			if(this.model.get('active'))
				return this.attr.height;
			else{
				return this.settings.getSetting('group','rowHeight');
			}
		},
		getCurrentHeight:function(){
			if(this.model.get('active'))
				return this.attr.height;
			else{
				return this.settings.getSetting('group','rowHeight');
			}
		},
		
		addChild: function(bar){
			this.children.push(bar);
			this.group.add(bar.group);
			var x = bar.getX1(true);
			//make bar x relative to this group
			bar.setParent(this);
			bar.setX1(x, {absolute:true, silent:true});
			bar.setY(this.getHeight() + this.setting.gap);
			this.attr.height += this.setting.rowHeight;
			bar.group.visible(this.model.get('active'));
		},
		renderChildren:function(){
			for(var i=0;i<this.children.length;i++){
				this.children[i].renderBar();
			}
			this.renderTopBar();

		},
		renderTopBar:function(){
			var parent=this.model;
			var x=this.calculateX(parent);
			this.topbar.setX(x.x1-this.group.getX());
			this.topbar.setWidth(x.x2-x.x1);
		},
		bindEvents:function(){
			this.on('resize move',function(){
				var minX,maxX;
				minX=_.min(this.children,function(bar){
					return bar.getX1();
				}).getX1();
				maxX=_.max(this.children,function(bar){
					return bar.getX2();
				}).getX2();
				this.topbar.setX(minX);
				this.topbar.setWidth(maxX-minX);

			});
			this.listenTo(this.model, 'change:active', this.toggleChildren);
			this.listenTo(this.model, 'onsort', this.renderSortedChildren);
			this.listenTo(this.model, 'change:start change:end', function() {

				this.topbar.setAttrs(this.getRectparams());
				this.topbar.getLayer().draw();
			});

		},
		getGroupParams: function(){
			return _.extend({
				x: 0,
				y: 0
			}, this.setting.topBar);
			
		},
		calculateX:function(){
			var attrs = this.settings.getSetting('attr'),
				boundaryMin = attrs.boundaryMin,
				daysWidth = attrs.daysWidth;
			return {
				x1: (Date.daysdiff(boundaryMin, this.model.get('start'))) * daysWidth - this.group.x(),
				x2: Date.daysdiff(boundaryMin, this.model.get('end')) * daysWidth - this.group.x()
			};
		},
		calculateParentDates:function(){
			var attrs = this.settings.getSetting('attr'),
				boundaryMin = attrs.boundaryMin,
				daysWidth = attrs.daysWidth;
			var days1 = Math.round(this.getX1(true) / daysWidth);
			var days2 = Math.round(this.getX2(true) / daysWidth);
			return {
				start: boundaryMin.clone().addDays(days1 - 1),
				end: boundaryMin.clone().addDays(days2 - 1)
			};
		},
		getRectparams:function(){
			var xs=this.calculateX(this.model);
			var setting = this.setting;
			return _.extend({
				x: xs.x1,
				width: xs.x2 - xs.x1,
				y: setting.gap
			}, setting.topBar);
		},
		toggleChildren: function(){
			var show = this.model.get('active');
			this.children.forEach(function(child) {
				child.toggle(show);
			});
		},
		sync:function(){
			this.syncing = true;

			var pdates = this.calculateParentDates();
			this.model.save({
				start: pdates.start,
				end:pdates.end
			});


			var children = this.children;
			children.forEach(function(child) {
				child.sync();
			});

			this.syncing = false;
		}
	};

_.extend(BarGroup.prototype, Backbone.Events);

module.exports = BarGroup;

},{"./Bar":9}],11:[function(require,module,exports){
var BarGroup = require('./BarGroup');
var Bar = require('./Bar');

var viewOptions = ['model', 'collection'];

var KineticView = Backbone.KineticView = function(options) {
	this.cid = _.uniqueId('view');
	_.extend(this, _.pick(options, viewOptions));
	this.initialize.apply(this, arguments);
};
_.extend(KineticView.prototype, Backbone.Events, {
	initialize: function(){},
	render: function() {
		return this;
	}
});


KineticView.extend=Backbone.Model.extend;

var KCanvasView = KineticView.extend({
	initialize: function(params){
		this.app = params.app;
		this.groups=[];
		this.settings = this.app.settings;
		var setting =  this.app.settings.getSetting('display');
		
		this.stage = new Kinetic.Stage({
			container : 'gantt-container',
			height: 580,
			width: setting.screenWidth - setting.tHiddenWidth - 20,
			draggable: true,
			dragBoundFunc:  function(pos) {
				return {
					x: pos.x,
					y: this.getAbsolutePosition().y
				};
			}
		});

		this.Flayer = new Kinetic.Layer({});
		this.Blayer = new Kinetic.Layer({});
		
		this.listenTo( this.app.tasks, 'change:sortindex', function() {
			this.renderRequest();
		});

		this.listenTo(this.collection, 'add', function(model) {
			if (!parseInt(model.get('parentid'), 10)) {
				return;
			}
			this.groups.push(new BarGroup({
				model: model,
				settings : this.settings
			}));

			var gsetting =  this.app.settings.getSetting('group');
			gsetting.currentY = gsetting.iniY;

			this.groups.forEach(function(groupi) {
				groupi.setY(gsetting.currentY);
				gsetting.currentY += groupi.getHeight();
				this.Flayer.add(groupi.group);
			}.bind(this));
			this.rendergroups();
		});
		this.initializeFrontLayer();
		this.initializeBackLayer();
		this.bindEvents();
	},
	renderRequest : (function() {
		var waiting = false;
		return function() {
			console.error('change sort');
			if (waiting) {
				return;
			}
			waiting = true;
			setTimeout(function() {
				this.rendergroups();
				waiting = false;
			}.bind(this), 10);
		};
	})(),
	initializeBackLayer:function(){
		var shape = new Kinetic.Shape({
			stroke: '#bbb',
			strokeWidth: 0,
			sceneFunc:this.getSceneFunc()
		});
		this.Blayer.add(shape);
		
	},
	initializeFrontLayer:function(){
		this.collection.each(function(task) {
			"use strict";
			if (!task.get('parentid')) {
				this.addGroup(task);
			}
		}, this);
	},
	bindEvents:function(){
		var calculating=false;
		this.listenTo( this.collection, 'change:active', this.rendergroups);
		this.listenTo( this.app.settings, 'change:interval change:dpi', this.renderBars);
		$('#gantt-container').mousewheel(function(e){
			if(calculating) {
				return false;
			}
			var cdpi =  this.settings.get('dpi'), dpi=0;
			calculating=true;
			if (e.originalEvent.wheelDelta > 0){
				dpi = Math.max(1, cdpi - 1);
			} else {
				dpi = cdpi + 1;
			}
			if (dpi === 1){
				if ( this.app.settings.get('interval') === 'auto') {
					 this.app.settings.set({interval:'daily'});
				}
			} else {
				 this.app.settings.set({interval: 'auto', dpi: dpi});
			}
			calculating = false;
			return false;
		}.bind(this));

		if (calculating) {
			return false;
		}

		var cdpi =  this.app.settings.get('dpi'), dpi=0;
		calculating  =true;
		dpi = Math.max(0, cdpi + 25);

		if (dpi === 1) {
			if( this.app.settings.get('interval')==='auto') {
				 this.app.settings.set({interval:'daily'});
			}
		} else {
			 this.app.settings.set({interval: 'auto', dpi: dpi});
		}

		calculating = false;
		$('#gantt-container').on('dragmove', function(){
			if(calculating) {
				return false;
			}
			var cdpi =  this.app.settings.get('dpi'), dpi=0;
			calculating = true;
			dpi = cdpi + 1;

			if(dpi===1){
				if ( this.app.settings.get('interval') === 'auto') {
					 this.app.settings.set({interval: 'daily'});
				}
			} else {
				 this.app.settings.set({interval:'auto',dpi:dpi});
			}
			calculating = false;
			return false;
		}.bind(this));
	},

	addGroup: function(taskgroup) {
		this.groups.push(new BarGroup({
			model: taskgroup,
			settings : this.app.settings
		}));
	},

	render: function(){
		var gsetting =  this.app.settings.getSetting('group');

		gsetting.currentY = gsetting.iniY;
		
		this.groups.forEach(function(groupi) {
			groupi.setY(gsetting.currentY);
			gsetting.currentY += groupi.getHeight();
			this.Flayer.add(groupi.group);
		}.bind(this));


		//loop through groups
		for(var i = 0; i < this.groups.length; i++){

			//loop through tasks
			for(var j = 0; j < this.groups[i].children.length; j++){

				//if threre is dependency
				if (this.groups[i].children[j].model.attributes.dependency !== ''){

					//parse dependencies
					var dependency = $.parseJSON(this.groups[i].children[j].model.attributes.dependency);

					for(var l=0; l < dependency.length; l++){
						for( var k=0; k < this.groups[i].children.length; k++){
							if (dependency[l] == this.groups[i].children[k].model.attributes.id ){
								Bar.createRelation(this.groups[i].children[j], this.groups[i].children[k]);
							}
						}
					}					
				}
			}
		}

		this.stage.add(this.Blayer);
		this.stage.add(this.Flayer);
		return this;
	},

	renderBars:function(){
		for(var i=0;i<this.groups.length;i++){
			this.groups[i].renderChildren();
		} 
		this.Flayer.draw();
		this.Blayer.draw();
	},

	rendergroups:function(){
		var gsetting =  this.app.settings.getSetting('group');
		var sorted = _.sortBy(this.groups, function(itemview){
			return itemview.model.get('sortindex');
		});
		gsetting.currentY = gsetting.iniY;
		sorted.forEach(function(groupi) {
			groupi.setY(gsetting.currentY);
			groupi.renderSortedChildren();
			gsetting.currentY += groupi.getHeight();
		});
		this.Flayer.draw();
	},
	setWidth: function(value) {
		this.stage.setWidth(value);
	},
	getSceneFunc:function(){
		var setting = this.app.settings;
		var sdisplay = setting.sdisplay;
		var borderWidth = sdisplay.borderWidth || 1;
		var offset = borderWidth/2;
		var rowHeight = 20;

		return function(context){
			var sattr = setting.sattr;
			var i, s = 0, iLen = 0,	daysWidth = sattr.daysWidth, x,	length,	hData = sattr.hData;
			
			var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;
			context.beginPath();
			//draw three lines
			for(i = 1; i < 4 ; i++){
				context.moveTo(offset, i * rowHeight - offset);
				context.lineTo(lineWidth + offset, i * rowHeight - offset);
			}

			var yi = 0, yf = rowHeight, xi = 0;
			for (s = 1; s < 3; s++){
				x=0,length=0;
				for(i=0,iLen=hData[s].length;i<iLen;i++){
					length=hData[s][i].duration*daysWidth;
					x = x+length;
					xi = x - borderWidth + offset;
					context.moveTo(xi,yi);
					context.lineTo(xi,yf);
					
					context._context.save();
					context._context.font = '10pt Arial,Helvetica,sans-serif';
					context._context.textAlign = 'center';
					context._context.textBaseline = 'middle';
					context._context.fillText(hData[s][i].text, x-length/2,yf-rowHeight/2);
					context._context.restore();
				}
				yi=yf,yf= yf+rowHeight;
			}
			
			x=0,length=0,s=3,yf=1200;
			var dragInt = parseInt(sattr.dragInterval);
			var hideDate = false;
			if( dragInt == 14 || dragInt == 30){
				hideDate = true;
			}
			for(i=0,iLen=hData[s].length;i<iLen;i++){
				length=hData[s][i].duration*daysWidth;
				x = x+length;
				xi = x - borderWidth + offset;
				context.moveTo(xi,yi);
				context.lineTo(xi,yf);
				
				context._context.save();
				context._context.font = '6pt Arial,Helvetica,sans-serif';
				context._context.textAlign = 'left';
				context._context.textBaseline = 'middle';
				// date hide on specific views
				if (hideDate) {
						context._context.font = '1pt Arial,Helvetica,sans-serif';
				};
				context._context.fillText(hData[s][i].text, x-length+40,yi+rowHeight/2);
				context._context.restore();

			}
			context.strokeShape(this);
		};
	},
	renderBackLayer: function(){
	}
});

module.exports = KCanvasView;
},{"./Bar":9,"./BarGroup":10}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){

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

},{}],14:[function(require,module,exports){
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
		this.model.set('active', !this.collapsed);
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

},{"./TaskItemView":13}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9mYWtlX2E1NzI4NGZkLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9BZGRGb3JtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzL0Jhci5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzL0Jhckdyb3VwLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXMvS0NhbnZhc1ZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9aQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVGFza01vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Rhc2tNb2RlbCcpO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdHVybCA6ICdhcGkvdGFza3MnLFxuXHRtb2RlbDogVGFza01vZGVsLFxuXHRpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdWJzY3JpYmUoKTtcblx0fSxcblx0Y29tcGFyYXRvciA6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdH0sXG5cdGxpbmtDaGlsZHJlbiA6IGZ1bmN0aW9uKCkge1xuXHRcdFwidXNlIHN0cmljdFwiO1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBwYXJlbnRUYXNrID0gdGhpcy5nZXQodGFzay5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0aWYgKHBhcmVudFRhc2spIHtcblx0XHRcdFx0cGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0bW9kZWwuc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCkuc2F2ZSgpO1xuXHRcdFx0bW9kZWwuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRjaGlsZC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KS5zYXZlKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHR0aGlzLnRyaWdnZXIoJ3Jlc29ydCcpO1xuXHR9LFxuXHRyZXNvcnQgOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IDA7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbihwYXJlbnREYXRhKSB7XG5cdFx0XHR2YXIgcGFyZW50TW9kZWwgPSB0aGlzLmdldChwYXJlbnREYXRhLmlkKTtcblx0XHRcdHZhciBwcmV2U29ydCA9IHBhcmVudE1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0XHRpZiAocHJldlNvcnQgIT09ICsrc29ydEluZGV4KSB7XG5cdFx0XHRcdHBhcmVudE1vZGVsLnNldCgnc29ydGluZGV4Jywgc29ydEluZGV4KS5zYXZlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGFyZW50TW9kZWwuZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHBhcmVudE1vZGVsLnNldCgncGFyZW50aWQnLCAwKS5zYXZlKCk7XG5cdFx0XHR9XG5cdFx0XHRwYXJlbnREYXRhLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGREYXRhKSB7XG5cdFx0XHRcdHZhciBjaGlsZE1vZGVsID0gc2VsZi5nZXQoY2hpbGREYXRhLmlkKTtcblx0XHRcdFx0dmFyIHByZXZTb3J0SSA9IGNoaWxkTW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHRcdFx0aWYgKHByZXZTb3J0SSAhPT0gKytzb3J0SW5kZXgpIHtcblx0XHRcdFx0XHRjaGlsZE1vZGVsLnNldCgnc29ydGluZGV4Jywgc29ydEluZGV4KS5zYXZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGNoaWxkTW9kZWwuZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRNb2RlbC5pZCkge1xuXHRcdFx0XHRcdGNoaWxkTW9kZWwuc2V0KCdwYXJlbnRpZCcsIHBhcmVudE1vZGVsLmlkKS5zYXZlKCk7XG5cdFx0XHRcdFx0dmFyIHBhcmVudCA9IHNlbGYuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gcGFyZW50TW9kZWwuaWQ7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cGFyZW50LmNoaWxkcmVuLmFkZChjaGlsZE1vZGVsKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0c3Vic2NyaWJlIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IG1vZGVsLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0NvbGxlY3Rpb247XG5cbiIsIlxudmFyIFRhc2tDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9ucy90YXNrQ29sbGVjdGlvbicpO1xudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9tb2RlbHMvU2V0dGluZ01vZGVsJyk7XG5cbnZhciBHYW50dFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0dhbnR0VmlldycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL3V0aWwnKTtcblxuJChmdW5jdGlvbiAoKSB7XG5cdHZhciBhcHAgPSB7fTtcblx0YXBwLnRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cblx0Ly8gZGV0ZWN0IEFQSSBwYXJhbXMgZnJvbSBnZXQsIGUuZy4gP3Byb2plY3Q9MTQzJnByb2ZpbGU9MTdcblx0dmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cdGlmIChwYXJhbXMucHJvamVjdCAmJiBwYXJhbXMucHJvZmlsZSkge1xuXHRcdGFwcC50YXNrcy51cmwgPSAnYXBpL3Rhc2tzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5wcm9maWxlO1xuXHR9XG5cblx0YXBwLnRhc2tzLmZldGNoKHtcblx0XHRzdWNjZXNzIDogZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnU3VjY2VzcyBsb2FkaW5nIHRhc2tzLicpO1xuXHRcdFx0YXBwLnNldHRpbmdzID0gbmV3IFNldHRpbmdzKHt9LCB7YXBwIDogYXBwfSk7XG5cdFx0XHRhcHAudGFza3MubGlua0NoaWxkcmVuKCk7XG5cdFx0XHRhcHAudGFza3MuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcCxcblx0XHRcdFx0Y29sbGVjdGlvbiA6IGFwcC50YXNrc1xuXHRcdFx0fSkucmVuZGVyKCk7XG5cdFx0XHQkKCcjbG9hZGVyJykuZmFkZU91dCgpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9XG5cdH0sIHtwYXJzZTogdHJ1ZX0pO1xufSk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcblxudmFyIGFwcCA9IHt9O1xuXG52YXIgaGZ1bmMgPSBmdW5jdGlvbihwb3MsIGV2dCkge1xuXHR2YXIgZHJhZ0ludGVydmFsID0gYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInLCAnZHJhZ0ludGVydmFsJyk7XG5cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcblx0cmV0dXJuIHtcblx0XHR4OiBldnQuaW5pcG9zLnggKyBuICogZHJhZ0ludGVydmFsLFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGludGVydmFsOiAnZml4Jyxcblx0XHQvL2RheXMgcGVyIGludGVydmFsXG5cdFx0ZHBpOiAxXG5cdH0sXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0YXBwID0gdGhpcy5hcHA7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwXG5cdFx0fTtcblxuXHRcdHRoaXMuc2dyb3VwID0ge1xuXHRcdFx0Y3VycmVudFk6IDAsXG5cdFx0XHRpbmlZOiA2MCxcblx0XHRcdGFjdGl2ZTogZmFsc2UsXG5cdFx0XHR0b3BCYXI6IHtcblx0XHRcdFx0ZmlsbDogJyM2NjYnLFxuXHRcdFx0XHRoZWlnaHQ6IDEyLFxuXHRcdFx0XHRzdHJva2VFbmFibGVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdGdhcDogMyxcblx0XHRcdHJvd0hlaWdodDogMjIsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiBoZnVuY1xuXHRcdH07XG5cblx0XHR0aGlzLnNiYXIgPSB7XG5cdFx0XHRiYXJoZWlnaHQ6IDEyLFxuXHRcdFx0Z2FwOiAyMCxcblx0XHRcdHJvd2hlaWdodDogIDYwLFxuXHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxuXHRcdFx0cmVzaXphYmxlOiB0cnVlLFxuXHRcdFx0ZHJhZ0JvdW5kRnVuYzogaGZ1bmMsXG5cdFx0XHRyZXNpemVCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdFx0c3ViZ3JvdXA6IHRydWVcblx0XHR9O1xuXHRcdHRoaXMuc2Zvcm09e1xuXHRcdFx0J25hbWUnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAndGV4dCdcblx0XHRcdH0sXG5cdFx0XHQnc3RhcnQnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnZGF0ZScsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24oZCl7XG5cdFx0XHRcdFx0cmV0dXJuIGQudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dDJkOiBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5wYXJzZUV4YWN0KCB1dGlsLmNvcnJlY3RkYXRlKHQpLCAnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdkYXRlJyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRyZXR1cm4gZC50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0MmQ6IGZ1bmN0aW9uKHQpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLnBhcnNlRXhhY3QoIHV0aWwuY29ycmVjdGRhdGUodCksICdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3NlbGVjdCcsXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHQnMTEwJzogJ2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5JzogJ29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2NvbXBsZXRlJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnXG5cdFx0XHR9LFxuXHRcdFx0J2R1cmF0aW9uJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnLFxuXHRcdFx0XHRkMnQ6IGZ1bmN0aW9uKHQsbW9kZWwpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSxtb2RlbC5nZXQoJ2VuZCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0dGhpcy5nZXRGb3JtRWxlbSA9IHRoaXMuY3JlYXRlRWxlbSgpO1xuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuYXBwLnRhc2tzO1xuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XG5cdH0sXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xuXHRcdGlmKGF0dHIpe1xuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xuXHR9LFxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWluRGF0ZSA9IG5ldyBEYXRlKDIwMjAsMSwxKSwgbWF4RGF0ZSA9IG5ldyBEYXRlKDAsMCwwKTtcblx0XHRcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XG5cdFx0XHRcdG1pbkRhdGU9bW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGUgPSBtaW5EYXRlO1xuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XG5cdFx0XG5cdH0sXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xuXHRcdFxuXHRcdHZhciBpbnRlcnZhbCA9IHRoaXMuZ2V0KCdpbnRlcnZhbCcpO1xuXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDEyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdFxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCA3LCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogNykubW92ZVRvRGF5T2ZXZWVrKDEsIC0xKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDcpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiAzMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluLm1vdmVUb0ZpcnN0RGF5T2ZRdWFydGVyKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gMzAgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcblx0XHRcdGNlbGxXaWR0aCA9IDMwO1xuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2l6ZSAvIGR1cmF0aW9uO1xuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gZHBpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcblx0XHRcdGRwaSA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIwICogZHBpKTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xuXHRcdFx0fTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHR9XG5cdFx0dmFyIGhEYXRhID0ge1xuXHRcdFx0JzEnOiBbXSxcblx0XHRcdCcyJzogW10sXG5cdFx0XHQnMyc6IFtdXG5cdFx0fTtcblx0XHR2YXIgaGRhdGEzID0gW107XG5cdFx0XG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcblx0XHRcblx0XHRsYXN0ID0gc3RhcnQ7XG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR2YXIgZHVyZnVuYztcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGR1cmZ1bmMobGFzdCksXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogaW50ZXJ2YWxkYXlzLFxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcblx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHNhdHRyLmJvdW5kYXJ5TWF4ID0gZW5kID0gbGFzdDtcblx0XHRoRGF0YVsnMyddID0gaGRhdGEzO1xuXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBkYXRlIHRvIGVuZCBvZiB5ZWFyXG5cdFx0dmFyIGludGVyID0gRGF0ZS5kYXlzZGlmZihzdGFydCwgbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgMTEsIDMxKSk7XG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdHRleHQ6IHN0YXJ0LmdldEZ1bGxZZWFyKClcblx0XHR9KTtcblx0XHRmb3IoaSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCkgKyAxLCBpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7IGkgPCBpTGVuOyBpKyspe1xuXHRcdFx0aW50ZXIgPSBEYXRlLmlzTGVhcFllYXIoaSkgPyAzNjYgOiAzNjU7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGlcblx0XHRcdH0pO1xuXHRcdH1cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGxhc3QgeWVhciB1cHRvIGVuZCBkYXRlXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0aW50ZXIgPSBEYXRlLmRheXNkaWZmKG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCAwLCAxKSwgZW5kKTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdFx0dGV4dDogZW5kLmdldEZ1bGxZZWFyKClcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKHN0YXJ0LCBzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLFxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcblx0XHR9KTtcblx0XHRcblx0XHRqID0gc3RhcnQuZ2V0TW9udGgoKSArIDE7XG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG5cdFx0aUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpO1xuXHRcdHZhciBlbmRtb250aCA9IGVuZC5nZXRNb250aCgpO1xuXG5cdFx0d2hpbGUgKGkgPD0gaUxlbikge1xuXHRcdFx0d2hpbGUoaiA8IDEyKSB7XG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5nZXREYXlzSW5Nb250aChpLCBqKSxcblx0XHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoaiwgJ20nKVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aiArPSAxO1xuXHRcdFx0fVxuXHRcdFx0aSArPSAxO1xuXHRcdFx0aiA9IDA7XG5cdFx0fVxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGggJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xuXHR9LFxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xuXHR9LFxuXHRjcmVhdGVFbGVtOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWxlbXMgPSB7fSwgb2JqLCBjYWxsYmFjayA9IGZhbHNlLCBjb250ZXh0ID0gZmFsc2U7XG5cdFx0ZnVuY3Rpb24gYmluZFRleHRFdmVudHMoZWxlbWVudCwgb2JqLCBuYW1lKSB7XG5cdFx0XHRlbGVtZW50Lm9uKCdibHVyJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWUgPSAkdGhpcy52YWwoKTtcblx0XHRcdFx0JHRoaXMuZGV0YWNoKCk7XG5cdFx0XHRcdHZhciBjYWxsZnVuYyA9IGNhbGxiYWNrLCBjdHggPSBjb250ZXh0O1xuXHRcdFx0XHRjYWxsYmFjayA9IGZhbHNlO1xuXHRcdFx0XHRjb250ZXh0ID0gZmFsc2U7XG5cdFx0XHRcdGlmIChvYmoudDJkKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqLnQyZCh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FsbGZ1bmMuY2FsbChjdHgsbmFtZSx2YWx1ZSk7XG5cdFx0XHR9KS5vbigna2V5cHJlc3MnLGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRpZihldmVudC53aGljaD09PTEzKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdGZ1bmN0aW9uIGJpbmREYXRlRXZlbnRzKGVsZW1lbnQsb2JqLG5hbWUpe1xuXHRcdFx0ZWxlbWVudC5kYXRlcGlja2VyKHsgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLG9uQ2xvc2U6ZnVuY3Rpb24oKXtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2Nsb3NlIGl0Jyk7XG5cdFx0XHRcdHZhciAkdGhpcz0kKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWU9JHRoaXMudmFsKCk7XG5cdFx0XHRcdCR0aGlzLmRldGFjaCgpO1xuXHRcdFx0XHR2YXIgY2FsbGZ1bmM9Y2FsbGJhY2ssY3R4PWNvbnRleHQ7XG5cdFx0XHRcdGNhbGxiYWNrPWZhbHNlO1xuXHRcdFx0XHRjb250ZXh0PWZhbHNlO1xuXHRcdFx0XHRpZihvYmpbJ3QyZCddKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqWyd0MmQnXSh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdFx0XHRjYWxsZnVuYy5jYWxsKGN0eCxuYW1lLHZhbHVlKTtcblx0XHRcdFx0fSwgMTApO1xuXHRcdFx0fX0pO1xuXHRcdH1cblx0XHRcblx0XHRmb3IodmFyIGkgaW4gdGhpcy5zZm9ybSl7XG5cdFx0XHRvYmo9dGhpcy5zZm9ybVtpXTtcblx0XHRcdGlmKG9iai5lZGl0YWJsZSl7XG5cdFx0XHRcdGlmKG9iai50eXBlPT09J3RleHQnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmRUZXh0RXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKG9iai50eXBlPT09J2RhdGUnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmREYXRlRXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH1cblxuXHRcdG9iaiA9IG51bGw7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLCBtb2RlbCwgY2FsbGZ1bmMsIGN0eCl7XG5cdFx0XHRjYWxsYmFjayA9IGNhbGxmdW5jO1xuXHRcdFx0Y29udGV4dCA9IGN0eDtcblx0XHRcdHZhciBlbGVtZW50PWVsZW1zW2ZpZWxkXSwgdmFsdWUgPSBtb2RlbC5nZXQoZmllbGQpO1xuXHRcdFx0aWYgKHRoaXMuc2Zvcm1bZmllbGRdLmQydCkge1xuXHRcdFx0XHR2YWx1ZSA9IHRoaXMuc2Zvcm1bZmllbGRdLmQydCh2YWx1ZSwgbW9kZWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxlbWVudC52YWwodmFsdWUpO1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQ7XG5cdFx0fTtcblx0XG5cdH0sXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRUb1RleHQ9e1xuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XG5cdFx0fTtcblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJccnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXHJccnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyICAgIGRlZmF1bHRzOiB7XHIgICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHIgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcciAgICAgICAgY29tcGxldGU6IDAsXHIgICAgICAgIGFjdGlvbjogJycsXHIgICAgICAgIGFjdGl2ZSA6IHRydWUsXHIgICAgICAgIHNvcnRpbmRleDogMCxcciAgICAgICAgZGVwZW5kZW5jeTonJyxcciAgICAgICAgcmVzb3VyY2VzOiB7fSxcciAgICAgICAgc3RhdHVzOiAxMTAsXHIgICAgICAgIGhlYWx0aDogMjEsXHIgICAgICAgIHN0YXJ0OiAnJyxcciAgICAgICAgZW5kOiAnJyxcciAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyICAgICAgICBXQlNfSUQgOiBwYXJhbXMucHJvZmlsZSxcciAgICAgICAgY29sb3I6JyMwMDkwZDMnLFxyICAgICAgICBsaWdodGNvbG9yOiAnI0U2RjBGRicsXHIgICAgICAgIGRhcmtjb2xvcjogJyNlODgxMzQnLFxyICAgICAgICBhVHlwZTogJycsXHIgICAgICAgIHJlcG9ydGFibGU6ICcnLFxyICAgICAgICBwYXJlbnRpZDogMFxyICAgIH0sXHIgICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyICAgICAgICBcInVzZSBzdHJpY3RcIjtcciAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgdGhpcy5fY2hlY2tUaW1lKTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHIgICAgICAgIHZhciBzdGFydCwgZW5kO1xyICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLnN0YXJ0KSl7XHIgICAgICAgICAgICBzdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwnZGQvTU0veXl5eScpIHx8XHIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoKTtcciAgICAgICAgfVxyICAgICAgICBcciAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcciAgICAgICAgICAgIGVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksJ2RkL01NL3l5eXknKSB8fFxyICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIGVuZCA9IG5ldyBEYXRlKCk7XHIgICAgICAgIH1cclxyICAgICAgICByZXNwb25zZS5zdGFydCA9IHN0YXJ0IDwgZW5kID8gc3RhcnQgOiBlbmQ7XHIgICAgICAgIHJlc3BvbnNlLmVuZCA9IHN0YXJ0IDwgZW5kID8gZW5kIDogc3RhcnQ7XHJcciAgICAgICAgcmVzcG9uc2UucGFyZW50aWQgPSBwYXJzZUludChyZXNwb25zZS5wYXJlbnRpZCB8fCAnMCcsIDEwKTtcclxyICAgICAgICAvLyByZW1vdmUgbnVsbCBwYXJhbXNcciAgICAgICAgXy5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbih2YWwsIGtleSkge1xyICAgICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xyICAgICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVtrZXldO1xyICAgICAgICAgICAgfVxyICAgICAgICB9KTtcciAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyICAgIH0sXHIgICAgX2NoZWNrVGltZSA6IGZ1bmN0aW9uKCkge1xyICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcciAgICAgICAgICAgIHJldHVybjtcciAgICAgICAgfVxyICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHIgICAgICAgIHZhciBlbmRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ2VuZCcpO1xyICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcciAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcciAgICAgICAgICAgIHZhciBjaGlsZEVuZFRpbWUgPSBjaGlsZC5nZXQoJ2VuZCcpO1xyICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUuY29tcGFyZVRvKHN0YXJ0VGltZSkgPT09IC0xKSB7XHIgICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gY2hpbGRTdGFydFRpbWU7XHIgICAgICAgICAgICB9XHIgICAgICAgICAgICBpZihjaGlsZEVuZFRpbWUuY29tcGFyZVRvKGVuZFRpbWUpID09PSAxKXtcciAgICAgICAgICAgICAgICBlbmRUaW1lID0gY2hpbGRFbmRUaW1lO1xyICAgICAgICAgICAgfVxyICAgICAgICB9LmJpbmQodGhpcykpO1xyICAgICAgICB0aGlzLnNldCgnc3RhcnQnLCBzdGFydFRpbWUpO1xyICAgICAgICB0aGlzLnNldCgnZW5kJywgZW5kVGltZSk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gVGFza01vZGVsO1xyIiwidmFyIG1vbnRoc0NvZGU9WydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcblxubW9kdWxlLmV4cG9ydHMuY29ycmVjdGRhdGUgPSBmdW5jdGlvbihzdHIpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiBzdHI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRkYXRhID0gZnVuY3Rpb24odmFsLCB0eXBlKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZiAodHlwZSA9PT0gJ20nKSB7XG5cdFx0cmV0dXJuIG1vbnRoc0NvZGVbdmFsXTtcblx0fVxuXHRyZXR1cm4gdmFsO1xufTtcblxubW9kdWxlLmV4cG9ydHMuaGZ1bmMgPSBmdW5jdGlvbihwb3MpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiB7XG5cdFx0eDogcG9zLngsXG5cdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHR9O1xufTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikge1xuXHR2YXIgcGFyYW1zID0ge307XG5cdHZhciBwcm1hcnIgPSBwcm1zdHIuc3BsaXQoJyYnKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm1hcnIubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdG1wYXJyID0gcHJtYXJyW2ldLnNwbGl0KCc9Jyk7XG5cdFx0cGFyYW1zW3RtcGFyclswXV0gPSB0bXBhcnJbMV07XG5cdH1cblx0cmV0dXJuIHBhcmFtcztcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0VVJMUGFyYW1zID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwcm1zdHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKTtcblx0cmV0dXJuIHBybXN0ciAhPT0gbnVsbCAmJiBwcm1zdHIgIT09ICcnID8gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikgOiB7fTtcbn07XG5cbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMDIuMTIuMjAxNC5cclxuICovXHJcblxyXG52YXIgdGVtcGxhdGUgPSBcIjxkaXYgY2xhc3M9XFxcInVpIHNtYWxsIG1vZGFsIGFkZC1uZXctdGFzayBmbGlwXFxcIj5cXHJcXG4gICAgPGkgY2xhc3M9XFxcImNsb3NlIGljb25cXFwiPjwvaT5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiaGVhZGVyXFxcIj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbnRlbnRcXFwiPlxcclxcbiAgICAgICAgPGZvcm0gaWQ9XFxcIm5ldy10YXNrLWZvcm1cXFwiIGFjdGlvbj1cXFwiL1xcXCIgdHlwZT1cXFwiUE9TVFxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidWkgZm9ybSBzZWdtZW50XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHA+TGV0J3MgZ28gYWhlYWQgYW5kIHNldCBhIG5ldyBnb2FsLjwvcD5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlRhc2sgbmFtZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgbmFtZT1cXFwibmFtZVxcXCIgcGxhY2Vob2xkZXI9XFxcIk5ldyB0YXNrIG5hbWVcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkRpc2NyaXB0aW9uPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBuYW1lPVxcXCJkZXNjcmlwdGlvblxcXCIgcGxhY2Vob2xkZXI9XFxcIlRoZSBkZXRhaWxlZCBkZXNjcmlwdGlvbiBvZiB5b3VyIHRhc2tcXFwiPjwvdGV4dGFyZWE+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U2VsZWN0IHBhcmVudDwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcInVpIGRyb3Bkb3duIHNlbGVjdGlvblxcXCI+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgbmFtZT1cXFwicGFyZW50aWRcXFwiIGNsYXNzPVxcXCJ1aSBkcm9wZG93blxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGQgcmVzb3VyY2VzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+QXNzaWduIFJlc291cmNlczwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5TdGFydCBEYXRlPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiZGF0ZVxcXCIgbmFtZT1cXFwic3RhcnRcXFwiIHBsYWNlaG9sZGVyPVxcXCJTdGFydCBEYXRlXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5FbmQgRGF0ZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiIG5hbWU9XFxcImVuZFxcXCIgcGxhY2Vob2xkZXI9XFxcIkVuZCBEYXRlXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiY29tcGxldGVcXFwiIHZhbHVlPVxcXCIwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiYWN0aW9uXFxcIiB2YWx1ZT1cXFwiYWRkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiZGVwZW5kZW5jeVxcXCIgdmFsdWU9XFxcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImFUeXBlXFxcIiB2YWx1ZT1cXFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaGVhbHRoXFxcIiB2YWx1ZT1cXFwiMjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJjb2xvclxcXCIgdmFsdWU9XFxcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcIm1pbGVzdG9uZVxcXCIgdmFsdWU9XFxcIjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJkZWxpdmVyYWJsZVxcXCIgdmFsdWU9XFxcIjBcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJyZXBvcnRhYmxlXFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInNvcnRpbmRleFxcXCIgdmFsdWU9XFxcIjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbnNlcnRQb3NcXFwiIHZhbHVlPVxcXCJzZXRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJyZWZlcmVuY2VfaWRcXFwiIHZhbHVlPVxcXCItMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5TdGF0dXM8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInVpIGZsdWlkIHNlbGVjdGlvbiBkcm9wZG93blxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInN0YXR1c1xcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImRlZmF1bHQgdGV4dFxcXCI+U3RhdHVzPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJkcm9wZG93biBpY29uXFxcIj48L2k+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm1lbnVcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTA4XFxcIj5SZWFkeTwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTA5XFxcIj5PcGVuPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMTBcXFwiPkNvbXBsZXRlZDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5EdXJhdGlvbjwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcIm51bWJlclxcXCIgbWluPVxcXCIwXFxcIiBuYW1lPVxcXCJkdXJhdGlvblxcXCIgcGxhY2Vob2xkZXI9XFxcIlByb2plY3QgRHVyYXRpb25cXFwiIHJlcXVpcmVkIHJlYWRvbmx5PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVxcXCJzdWJtaXRGb3JtXFxcIiBjbGFzcz1cXFwidWkgYmx1ZSBzdWJtaXQgcGFyZW50IGJ1dHRvblxcXCI+U3VibWl0PC9idXR0b24+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8L2Zvcm0+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlwiO1xyXG5cclxudmFyIGRlbW9SZXNvdXJjZXMgPSBbe1wid2JzaWRcIjoxLFwicmVzX2lkXCI6MSxcInJlc19uYW1lXCI6XCJKb2UgQmxhY2tcIixcInJlc19hbGxvY2F0aW9uXCI6NjB9LHtcIndic2lkXCI6MyxcInJlc19pZFwiOjIsXCJyZXNfbmFtZVwiOlwiSm9obiBCbGFja21vcmVcIixcInJlc19hbGxvY2F0aW9uXCI6NDB9XTtcclxuXHJcbnZhciBBZGRGb3JtVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiBkb2N1bWVudC5ib2R5LFxyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgICAgJ2NsaWNrIC5uZXctdGFzayc6ICdvcGVuRm9ybScsXHJcbiAgICAgICAgJ2NsaWNrICNzdWJtaXRGb3JtJzogJ3N1Ym1pdEZvcm0nXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZCh0aGlzLnRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLl9wcmVwYXJlRm9ybSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRSZXNvdXJjZXMoKTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIHRoaXMuX3NldHVwUGFyZW50U2VsZWN0b3IpO1xyXG4gICAgfSxcclxuICAgIF9pbml0UmVzb3VyY2VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gUmVzb3VyY2VzIGZyb20gYmFja2VuZFxyXG4gICAgICAgIHZhciAkcmVzb3VyY2VzID0gJzxzZWxlY3QgaWQ9XCJyZXNvdXJjZXNcIiAgbmFtZT1cInJlc291cmNlc1tdXCIgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPic7XHJcbiAgICAgICAgZGVtb1Jlc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAkcmVzb3VyY2VzICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHJlc291cmNlLnJlc19pZCArICdcIj4nICsgcmVzb3VyY2UucmVzX25hbWUgKyAnPC9vcHRpb24+JztcclxuICAgICAgICB9KTtcclxuICAgICAgICAkcmVzb3VyY2VzICs9ICc8L3NlbGVjdD4nO1xyXG4gICAgICAgIC8vIGFkZCBiYWNrZW5kIHRvIHRoZSB0YXNrIGxpc3RcclxuICAgICAgICAkKCcucmVzb3VyY2VzJykuYXBwZW5kKCRyZXNvdXJjZXMpO1xyXG5cclxuICAgICAgICAvLyBpbml0aWFsaXplIG11bHRpcGxlIHNlbGVjdG9yc1xyXG4gICAgICAgICQoJyNyZXNvdXJjZXMnKS5jaG9zZW4oe3dpZHRoOiAnOTUlJ30pO1xyXG4gICAgfSxcclxuICAgIF9mb3JtVmFsaWRhdGlvblBhcmFtcyA6IHtcclxuICAgICAgICBuYW1lOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICduYW1lJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBlbnRlciBhIHRhc2sgbmFtZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29tcGxldGU6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2NvbXBsZXRlJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBlbnRlciBhbiBlc3RpbWF0ZSBkYXlzJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnc3RhcnQnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhIHN0YXJ0IGRhdGUnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnZW5kJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYW4gZW5kIGRhdGUnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGR1cmF0aW9uOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdkdXJhdGlvbicsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGEgdmFsaWQgZHVyYXRpb24nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXR1czoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnc3RhdHVzJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZWxlY3QgYSBzdGF0dXMnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVGb3JtIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLm1hc3RoZWFkIC5pbmZvcm1hdGlvbicpLnRyYW5zaXRpb24oJ3NjYWxlIGluJyk7XHJcbiAgICAgICAgJCgnLnVpLmZvcm0nKS5mb3JtKHRoaXMuX2Zvcm1WYWxpZGF0aW9uUGFyYW1zKTtcclxuICAgICAgICAvLyBhc3NpZ24gcmFuZG9tIHBhcmVudCBjb2xvclxyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJjb2xvclwiXScpLnZhbCgnIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNikpO1xyXG4gICAgfSxcclxuICAgIF9zZXR1cFBhcmVudFNlbGVjdG9yIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyICRzZWxlY3RvciA9ICQoJ1tuYW1lPVwicGFyZW50aWRcIl0nKTtcclxuICAgICAgICAkc2VsZWN0b3IuZW1wdHkoKTtcclxuICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiMFwiPk1haW4gUHJvamVjdDwvb3B0aW9uPicpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gcGFyc2VJbnQodGFzay5nZXQoJ3BhcmVudGlkJyksIDEwKTtcclxuICAgICAgICAgICAgaWYocGFyZW50SWQgPT09IDApe1xyXG4gICAgICAgICAgICAgICAgJHNlbGVjdG9yLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicgKyB0YXNrLmlkICsgJ1wiPicgKyB0YXNrLmdldCgnbmFtZScpICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnc2VsZWN0LmRyb3Bkb3duJykuZHJvcGRvd24oKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGRyb3Bkb3duXHJcbiAgICAgICAgdGhpcy5fc2V0dXBQYXJlbnRTZWxlY3RvcigpO1xyXG4gICAgfSxcclxuICAgIG9wZW5Gb3JtOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcudWkuYWRkLW5ldy10YXNrJykubW9kYWwoJ3NldHRpbmcnLCAndHJhbnNpdGlvbicsICd2ZXJ0aWNhbCBmbGlwJykubW9kYWwoJ3Nob3cnKTtcclxuICAgIH0sXHJcbiAgICBzdWJtaXRGb3JtOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGZvcm0gPSAkKFwiI25ldy10YXNrLWZvcm1cIik7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0ge307XHJcbiAgICAgICAgJChmb3JtKS5zZXJpYWxpemVBcnJheSgpLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICAgICAgZGF0YVtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgICAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkYXRhLnJlZmVyZW5jZV9pZCk7XHJcbiAgICAgICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgICAgICB2YXIgaW5zZXJ0UG9zID0gZGF0YS5pbnNlcnRQb3M7XHJcbiAgICAgICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmNvbGxlY3Rpb24ubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcblxyXG4gICAgICAgIGlmIChmb3JtLmdldCgwKS5jaGVja1ZhbGlkaXR5KCkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgICAgICAgICB0YXNrLnNhdmUoKTtcclxuICAgICAgICAgICAgJCgnLnVpLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBZGRGb3JtVmlldzsiLCJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFRhc2tWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL1Rhc2tWaWV3Jyk7XHJ2YXIgS0NhbnZhc1ZpZXcgPSByZXF1aXJlKCcuL2NhbnZhcy9LQ2FudmFzVmlldycpO1xydmFyIEFkZEZvcm1WaWV3ID0gcmVxdWlyZSgnLi9BZGRGb3JtVmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51VmlldycpO1xyXHJ2YXIgR2FudHRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyICAgIGVsOiAnLkdhbnR0JyxcciAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcciAgICAgICAgdGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xyICAgICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcudGFzay1jb250YWluZXInKTtcclxyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyICAgICAgICB0aGlzLm1ha2VTb3J0YWJsZSgpO1xyXHIgICAgICAgIG5ldyBDb250ZXh0TWVudVZpZXcodGhpcy5hcHApLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBBZGRGb3JtVmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBUb3BNZW51Vmlldyh7XHIgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydGVkIGFkZCcsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLmVtcHR5KCk7XHIgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIG1ha2VTb3J0YWJsZTogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lci5zb3J0YWJsZSh7XHIgICAgICAgICAgICBncm91cDogJ3NvcnRhYmxlJyxcciAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yIDogJ29sJyxcciAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcciAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyIHNvcnQtcGxhY2Vob2xkZXJcIi8+JyxcciAgICAgICAgICAgIG9uRHJhZyA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyICAgICAgICAgICAgICAgIHZhciBpc1N1YlRhc2sgPSAhJCgkcGxhY2Vob2xkZXIucGFyZW50KCkpLmhhc0NsYXNzKCd0YXNrLWNvbnRhaW5lcicpO1xyICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xyICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyICAgICAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyICAgICAgICAgICAgb25Ecm9wIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHIgICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHIgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLiRjb250YWluZXIuc29ydGFibGUoXCJzZXJpYWxpemVcIikuZ2V0KClbMF07XHIgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmVudERhdGEpIHtcciAgICAgICAgICAgICAgICAgICAgcGFyZW50RGF0YS5jaGlsZHJlbiA9IHBhcmVudERhdGEuY2hpbGRyZW4gPyBwYXJlbnREYXRhLmNoaWxkcmVuWzBdIDogW107XHIgICAgICAgICAgICAgICAgfSk7XHIgICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnJlc29ydChkYXRhKTtcciAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyICAgICAgICB9KTtcciAgICB9LFxyICAgIGV2ZW50czoge1xyICAgICAgICAnY2xpY2sgI3RIYW5kbGUnOiAnZXhwYW5kJyxcciAgICAgICAgJ2RibGNsaWNrIC5zdWItdGFzayc6ICdoYW5kbGVyb3djbGljaycsXHIgICAgICAgICdkYmxjbGljayAudGFzayc6ICdoYW5kbGVyb3djbGljaycsXHIgICAgICAgICdob3ZlciAuc3ViLXRhc2snOiAnc2hvd01hc2snXHIgICAgfSxcciAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHIgICAgICAgICAgICBpZiAodGFzay5nZXQoJ3BhcmVudGlkJykudG9TdHJpbmcoKSA9PT0gJzAnKSB7XHIgICAgICAgICAgICAgICAgdGhpcy5hZGRUYXNrKHRhc2spO1xyICAgICAgICAgICAgfVxyICAgICAgICB9LCB0aGlzKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEtDYW52YXNWaWV3KHtcciAgICAgICAgICAgIGFwcCA6IHRoaXMuYXBwLFxyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KS5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5tYWtlU29ydGFibGUoKTtcciAgICB9LFxyICAgIGhhbmRsZXJvd2NsaWNrOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGlkID0gZXZ0LmN1cnJlbnRUYXJnZXQuaWQ7XHIgICAgICAgIHRoaXMuYXBwLnRhc2tzLmdldChpZCkudHJpZ2dlcignZWRpdHJvdycsIGV2dCk7XHIgICAgfSxcciAgICBjYWxjdWxhdGVEdXJhdGlvbjogZnVuY3Rpb24oKXtcclxyICAgICAgICAvLyBDYWxjdWxhdGluZyB0aGUgZHVyYXRpb24gZnJvbSBzdGFydCBhbmQgZW5kIGRhdGVcciAgICAgICAgdmFyIHN0YXJ0ZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJzdGFydFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyICAgICAgICBpZihzdGFydGRhdGUgIT09IFwiXCIgJiYgZW5kZGF0ZSAhPT0gXCJcIil7XHIgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcciAgICAgICAgfWVsc2V7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigwKSk7XHIgICAgICAgIH1cciAgICB9LFxyICAgIGV4cGFuZDogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciB0YXJnZXQgPSAkKGV2dC50YXJnZXQpO1xyICAgICAgICB2YXIgd2lkdGggPSAwO1xyICAgICAgICB2YXIgc2V0dGluZyA9IHRoaXMuYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2Rpc3BsYXknKTtcciAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygnY29udHJhY3QnKSkge1xyICAgICAgICAgICAgd2lkdGggPSBzZXR0aW5nLnRIaWRkZW5XaWR0aDtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHdpZHRoID0gc2V0dGluZy50YWJsZVdpZHRoO1xyICAgICAgICB9XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuY3NzKCd3aWR0aCcsIHdpZHRoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldFdpZHRoKHNldHRpbmcuc2NyZWVuV2lkdGggLSB3aWR0aCAtIDIwKTtcciAgICAgICAgdGFyZ2V0LnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmZpbmQoJy5tZW51LWhlYWRlcicpLnRvZ2dsZUNsYXNzKCdtZW51LWhlYWRlci1vcGVuZWQnKTtcclxyICAgIH0sXHIgICAgYWRkVGFzazogZnVuY3Rpb24odGFzaykge1xyICAgICAgICB2YXIgdGFza1ZpZXcgPSBuZXcgVGFza1ZpZXcoe21vZGVsOiB0YXNrLCBhcHAgOiB0aGlzLmFwcH0pO1xyICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRhc2tWaWV3LnJlbmRlcigpLmVsKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBHYW50dFZpZXc7XHIiLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDA4LjEyLjIwMTQuXHJcbiAqL1xyXG5cclxudmFyIFRvcE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnLmhlYWQtYmFyJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgYnV0dG9uJzogJ29uSW50ZXJ2YWxCdXR0b25DbGlja2VkJyxcclxuICAgICAgICAnY2xpY2sgYVtocmVmPVwiLyMhL2dlbmVyYXRlL1wiXSc6ICdnZW5lcmF0ZVBERidcclxuICAgIH0sXHJcbiAgICBvbkludGVydmFsQnV0dG9uQ2xpY2tlZCA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciBidXR0b24gPSAkKGV2dC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICB2YXIgYWN0aW9uID0gYnV0dG9uLmRhdGEoJ2FjdGlvbicpO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IGFjdGlvbi5zcGxpdCgnLScpWzFdO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KCdpbnRlcnZhbCcsIGludGVydmFsKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVBERiA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVG9wTWVudVZpZXc7XHJcbiIsInZhciBkZD1LaW5ldGljLkREO1xudmFyIGNhbGN1bGF0aW5nPWZhbHNlO1xuXG5mdW5jdGlvbiBjcmVhdGVIYW5kbGUob3B0aW9uKXtcblx0b3B0aW9uLmRyYWdnYWJsZT10cnVlO1xuXHRvcHRpb24ub3BhY2l0eT0xO1xuXHRvcHRpb24uc3Ryb2tlRW5hYmxlZD1mYWxzZTtcblx0b3B0aW9uLndpZHRoPTI7XG5cdG9wdGlvbi5maWxsPSdibGFjayc7XG5cdHJldHVybiBuZXcgS2luZXRpYy5SZWN0KG9wdGlvbik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1Ykdyb3VwKG9wdGlvbil7XG5cdHZhciBnciA9IG5ldyBLaW5ldGljLkdyb3VwKCk7XG5cdHZhciBpbWdyZWN0ID0gbmV3IEtpbmV0aWMuUmVjdCh7XG5cdFx0eDowLFxuXHRcdHk6MCxcblx0XHRoZWlnaHQ6IG9wdGlvbi5oZWlnaHQsXG5cdFx0d2lkdGg6IDIwLFxuXHRcdHN0cm9rZUVuYWJsZWQ6IGZhbHNlLFxuXHRcdGZpbGw6ICd5ZWxsb3cnLFxuXHRcdG9wYWNpdHk6IDAuNVxuXHR9KTtcblx0dmFyIGFuY2hvciA9IG5ldyBLaW5ldGljLkNpcmNsZSh7XG5cdFx0eDogMTAsXG5cdFx0eTogNSxcblx0XHRyYWRpdXM6IDMsXG5cdFx0c3Ryb2tlV2lkdGg6IDEsXG5cdFx0bmFtZTogJ2FuY2hvcicsXG5cdFx0c3Ryb2tlOidibGFjaycsXG5cdFx0ZmlsbDond2hpdGUnXG5cdH0pO1xuXG5cdHZhciBuYW1lcmVjdCA9IG5ldyBLaW5ldGljLlJlY3Qoe1xuXHRcdHg6IDIwLFxuXHRcdHk6IDAsXG5cdFx0aGVpZ2h0OiBvcHRpb24uaGVpZ2h0LFxuXHRcdHdpZHRoOiA0MCxcblx0XHRzdHJva2VFbmFibGVkOiBmYWxzZSxcblx0XHRmaWxsOidwaW5rJ1xuXHR9KTtcblx0Z3IuYWRkKGltZ3JlY3QpO1xuXHRnci5hZGQoYW5jaG9yKTtcblx0Z3IuYWRkKG5hbWVyZWN0KTtcblx0cmV0dXJuIGdyO1xufVxuXG52YXIgYmVmb3JlYmluZD1mdW5jdGlvbihmdW5jKXtcblx0cmV0dXJuIGZ1bmN0aW9uKCl7XG5cdFx0aWYoY2FsY3VsYXRpbmcpIHJldHVybiBmYWxzZTtcblx0XHRjYWxjdWxhdGluZz10cnVlO1xuXHRcdGZ1bmMuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuXHRcdGNhbGN1bGF0aW5nPWZhbHNlO1xuXHR9XG59XG5cblx0ZnVuY3Rpb24gZ2V0RHJhZ0RpcihzdGFnZSl7XG5cdFx0cmV0dXJuIChzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS54LWRkLnN0YXJ0UG9pbnRlclBvcy54PjApPydyaWdodCc6J2xlZnQnO1xuXHR9XG5cblx0dmFyIEJhcj1mdW5jdGlvbihvcHRpb25zKXtcblx0XHR0aGlzLm1vZGVsPW9wdGlvbnMubW9kZWw7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IG9wdGlvbnMuc2V0dGluZ3M7XG5cblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl91cGRhdGVDb21wbGV0ZUJhcik7XG5cdFx0XG5cdFx0dmFyIHNldHRpbmcgPSB0aGlzLnNldHRpbmcgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2JhcicpO1xuXG5cdFx0dGhpcy5zdWJncm91cG9wdGlvbnMgPSB7XG5cdFx0XHRzaG93T25Ib3ZlcjogdHJ1ZSxcblx0XHRcdGhpZGVPbkhvdmVyT3V0OiB0cnVlLFxuXHRcdFx0aGFzU3ViR3JvdXA6IGZhbHNlXG5cdFx0fTtcblx0XHRcblx0XHR0aGlzLmRlcGVuZGFudHMgPSBbXTtcblx0XHR0aGlzLmRlcGVuZGVuY2llcyA9IFtdO1xuXG5cdFx0dGhpcy5ncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHRoaXMuZ2V0R3JvdXBQYXJhbXMoKSk7XG5cdFx0dGhpcy5yZWN0ICA9IG5ldyBLaW5ldGljLlJlY3QodGhpcy5nZXRSZWN0cGFyYW1zKCkpO1xuXHRcdHRoaXMuZ3JvdXAuYWRkKHRoaXMucmVjdCk7XG5cdFx0XG5cdFx0aWYoc2V0dGluZy5zdWJncm91cCl7XG5cdFx0XHR0aGlzLmFkZFN1Ymdyb3VwKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKHNldHRpbmcuZHJhZ2dhYmxlKXtcblx0XHRcdHRoaXMubWFrZURyYWdnYWJsZSgpO1xuXHRcdH1cblx0XHRcblx0XHRpZihzZXR0aW5nLnJlc2l6YWJsZSl7XG5cdFx0XHR0aGlzLm1ha2VSZXNpemFibGUoKTtcblx0XHR9XG5cblx0XHR2YXIgb3B0ID0gIHRoaXMuZ2V0UmVjdHBhcmFtcygpO1xuXHRcdG9wdC54ID0gMjtcblx0XHR2YXIgY29tcGxldGVCYXI9IHRoaXMuY29tcGxldGVCYXIgPSBuZXcgS2luZXRpYy5SZWN0KG9wdCk7XG5cdFx0dGhpcy5ncm91cC5hZGQoY29tcGxldGVCYXIpO1xuXHRcdHRoaXMuX3VwZGF0ZUNvbXBsZXRlQmFyKCk7XG5cblx0XHQvL2FkZEV2ZW50c1xuXHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHR9O1xuXG5cdEJhci5wcm90b3R5cGU9e1xuXHRcdF91cGRhdGVDb21wbGV0ZUJhciA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGZ1bGxXaWR0aCA9IHRoaXMucmlnaHRIYW5kbGUuZ2V0WCgpIC0gdGhpcy5sZWZ0SGFuZGxlLmdldFgoKSArMjtcblx0XHRcdHZhciBjb21wbGV0ZVdpZHRoID0gKCAoIGZ1bGxXaWR0aCApICogKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwKSApIC0gNDtcblx0XHRcdGNvbnNvbGUubG9nKCdmdWxsIHdpZHRoJywgZnVsbFdpZHRoLCAnY29tcGxldGUnLCBjb21wbGV0ZVdpZHRoKTtcblx0XHRcdGlmKGNvbXBsZXRlV2lkdGggPiAwKXtcblx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci53aWR0aChjb21wbGV0ZVdpZHRoKTtcblx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci5zaG93KCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLmhpZGUoKTtcblx0XHRcdH1cblx0XHRcdHZhciBsYXllciA9IHRoaXMuY29tcGxldGVCYXIuZ2V0TGF5ZXIoKTtcbi8vXHRcdFx0aWYgKGxheWVyKSB7XG4vL1x0XHRcdFx0bGF5ZXIuYmF0Y2hEcmF3KCk7XG4vL1x0XHRcdH1cblx0XHR9LFxuXHRcdC8vcmV0cmlldmVzIG9ubHkgd2lkdGgsaGVpZ2h0LHgseSByZWxhdGl2ZSB0byBwb2ludCAwLDAgb24gY2FudmFzO1xuXHRcdGdldFgxOiBmdW5jdGlvbihhYnNvbHV0ZSl7XG5cdFx0XHR2YXIgcmV0dmFsPTA7XG5cdFx0XHRpZihhYnNvbHV0ZSAmJiB0aGlzLnBhcmVudCkgcmV0dmFsPXRoaXMucGFyZW50LmdldFgoKTtcblx0XHRcdHJldHVybiByZXR2YWwrdGhpcy5ncm91cC5nZXRYKCk7XG5cdFx0fSxcblx0XHRnZXRYMjogZnVuY3Rpb24oYWJzb2x1dGUpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0WDEoYWJzb2x1dGUpK3RoaXMuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdGdldFg6ZnVuY3Rpb24oYWJzb2x1dGUpe1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogdGhpcy5nZXRYMShhYnNvbHV0ZSksXG5cdFx0XHRcdHk6IHRoaXMuZ2V0WDIoYWJzb2x1dGUpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0WTogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFkoKTtcblx0XHR9LFxuXHRcdGdldEhlaWdodDogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLnJlY3QuZ2V0SGVpZ2h0KCk7XG5cdFx0fSxcblx0XHRnZXRXaWR0aDogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLnJlY3QuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdFxuXHRcdHNldFgxOmZ1bmN0aW9uKHZhbHVlLG9wdGlvbnMpe1xuXHRcdFx0IW9wdGlvbnMgJiYgKG9wdGlvbnM9e30pXG5cdFx0XHR2YXIgcHJldngsd2lkdGgsZHg7XG5cblx0XHRcdC8vaWYgdmFsdWUgaXMgaW4gYWJzb2x1dGUgc2Vuc2UgdGhlbiBtYWtlIGl0IHJlbGF0aXZlIHRvIHBhcmVudFxuXHRcdFx0aWYob3B0aW9ucy5hYnNvbHV0ZSAmJiB0aGlzLnBhcmVudCl7XG5cdFx0XHRcdHZhbHVlPXZhbHVlLXRoaXMucGFyZW50LmdldFgodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHRwcmV2eD10aGlzLmdldFgxKCk7XG5cdFx0XHQvL2R4ICt2ZSBtZWFucyBiYXIgbW92ZWQgbGVmdCBcblx0XHRcdGR4PXByZXZ4LXZhbHVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgc2lsZW50PW9wdGlvbnMuc2lsZW50IHx8IG9wdGlvbnMub3NhbWU7XG5cdFx0XHRcblx0XHRcdHRoaXMubW92ZSgtMSpkeCxzaWxlbnQpO1xuXHRcdFx0Ly9pZiB4MiBoYXMgdG8gcmVtYWluIHNhbWVcblx0XHRcdC8vIERyYXcgcGVyY2VudGFnZSBjb21wbGV0ZWRcblx0XHRcdGlmKG9wdGlvbnMub3NhbWUpe1xuXHRcdFx0XHR0aGlzLnJlY3Quc2V0V2lkdGgoZHgrdGhpcy5nZXRXaWR0aCgpKTtcblx0XHRcdFx0dGhpcy5fdXBkYXRlQ29tcGxldGVCYXIoKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJIYW5kbGUoKTtcblx0XHRcdFx0aWYoIW9wdGlvbnMuc2lsZW50KXtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZWxlZnQnLHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplJyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcblx0XHR9LFxuXHRcdHNldFgyOmZ1bmN0aW9uKHZhbHVlLG9wdGlvbnMpe1xuXHRcdFx0dmFyIHByZXZ4LHdpZHRoLGR4O1xuXHRcdFx0Ly9pZiB2YWx1ZSBpcyBpbiBhYnNvbHV0ZSBzZW5zZSB0aGVuIG1ha2UgaXQgcmVsYXRpdmUgdG8gcGFyZW50XG5cdFx0XHRpZihvcHRpb25zLmFic29sdXRlICYmIHRoaXMucGFyZW50KXtcblx0XHRcdFx0dmFsdWU9dmFsdWUtdGhpcy5wYXJlbnQuZ2V0WCh0cnVlKTtcblx0XHRcdH1cblx0XHRcdHByZXZ4PXRoaXMuZ2V0WDIoKTtcblx0XHRcdC8vZHggLXZlIG1lYW5zIGJhciBtb3ZlZCByaWdodCBcblx0XHRcdGR4PXByZXZ4LXZhbHVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgc2lsZW50PW9wdGlvbnMuc2lsZW50IHx8IG9wdGlvbnMub3NhbWU7XG5cdFx0XHQvL3RoaXMuZ3JvdXAuc2V0WCh2YWx1ZSk7XG5cdFx0XHQvL2lmIHgyIGhhcyB0byByZW1haW4gc2FtZVxuXHRcdFx0aWYob3B0aW9ucy5vc2FtZSl7XG5cdFx0XHRcdHRoaXMucmVjdC5zZXRXaWR0aCh0aGlzLmdldFdpZHRoKCktZHgpO1xuXHRcdFx0XHR0aGlzLl91cGRhdGVDb21wbGV0ZUJhcigpO1xuXHRcdFx0XHR0aGlzLnJlbmRlckhhbmRsZSgpO1xuXHRcdFx0XHRpZighb3B0aW9ucy5zaWxlbnQpe1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplcmlnaHQnLHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplJyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHR0aGlzLm1vdmUoLTEqZHgsb3B0aW9ucy5zaWxlbnQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lbmFibGVTdWJncm91cCgpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRzZXRZOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdHRoaXMuZ3JvdXAuc2V0WSh2YWx1ZSk7XG5cdFx0fSxcblx0XHRzZXRQYXJlbnQ6ZnVuY3Rpb24ocGFyZW50KXtcblx0XHRcdHRoaXMucGFyZW50PXBhcmVudDtcblxuXHRcdH0sXG5cdFx0dHJpZ2dlclBhcmVudDpmdW5jdGlvbihldmVudE5hbWUpe1xuXHRcdFx0aWYodGhpcy5wYXJlbnQpe1xuXHRcdFx0XHR0aGlzLnBhcmVudC50cmlnZ2VyKGV2ZW50TmFtZSx0aGlzKTtcblx0XHRcdH1cdFx0XHRcblx0XHR9LFxuXHRcdGJpbmRFdmVudHM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdjbGljaycsXy5iaW5kKHRoaXMuaGFuZGxlQ2xpY2tldmVudHMsdGhpcykpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdtb3VzZW92ZXInLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKCF0aGF0LnN1Ymdyb3Vwb3B0aW9ucy5zaG93T25Ib3ZlcikgcmV0dXJuO1xuXHRcdFx0XHR0aGF0LnN1Ymdyb3VwLnNob3coKTtcblx0XHRcdFx0dGhpcy5nZXRMYXllcigpLmRyYXcoKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5ncm91cC5vbignbW91c2VvdXQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKCF0aGF0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dCkgcmV0dXJuO1xuXHRcdFx0XHR0aGF0LnN1Ymdyb3VwLmhpZGUoKTtcblx0XHRcdFx0dGhpcy5nZXRMYXllcigpLmRyYXcoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm9uKCdyZXNpemUgbW92ZScsdGhpcy5yZW5kZXJDb25uZWN0b3JzLHRoaXMpO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMub24oJ2NoYW5nZScsIHRoaXMuaGFuZGxlQ2hhbmdlLCB0aGlzKTtcblxuXHRcdH0sXG5cdFx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5ncm91cC5kZXN0cm95KCk7XG5cdFx0XHR0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblx0XHR9LFxuXHRcdGhhbmRsZUNoYW5nZTpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIG1vZGVsID0gdGhpcy5tb2RlbDtcblx0XHRcdGlmKHRoaXMucGFyZW50LnN5bmNpbmcpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihtb2RlbC5jaGFuZ2VkLnN0YXJ0IHx8IG1vZGVsLmNoYW5nZWQuZW5kKXtcblx0XHRcdFx0dmFyIHg9dGhpcy5jYWxjdWxhdGVYKG1vZGVsKTtcblx0XHRcdFx0aWYobW9kZWwuY2hhbmdlZC5zdGFydCl7XG5cdFx0XHRcdFx0dGhpcy5zZXRYMSh4LngxLHtvc2FtZTp0cnVlLGFic29sdXRlOnRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRoaXMuc2V0WDIoeC54Mix7b3NhbWU6dHJ1ZSxhYnNvbHV0ZTp0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5wYXJlbnQuc3luYygpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc29sZS5sb2coJ2RyYXdpbmcnKTtcblx0XHRcdHRoaXMuZHJhdygpO1xuXHRcdH0sXG5cdFx0aGFuZGxlQ2xpY2tldmVudHM6ZnVuY3Rpb24oZXZ0KXtcblx0XHRcdHZhciB0YXJnZXQsdGFyZ2V0TmFtZSxzdGFydEJhcjtcblx0XHRcdHRhcmdldD1ldnQudGFyZ2V0O1xuXHRcdFx0dGFyZ2V0TmFtZT10YXJnZXQuZ2V0TmFtZSgpO1xuXHRcdFx0d2luZG93LnN0YXJ0QmFyO1xuXHRcdFx0aWYodGFyZ2V0TmFtZSE9PSdtYWluYmFyJyl7XG5cdFx0XHRcdEJhci5kaXNhYmxlQ29ubmVjdG9yKCk7XG5cdFx0XHRcdGlmKHRhcmdldE5hbWU9PSdhbmNob3InKXtcblx0XHRcdFx0XHR0YXJnZXQuc3Ryb2tlKCdyZWQnKTtcblx0XHRcdFx0XHRCYXIuZW5hYmxlQ29ubmVjdG9yKHRoaXMpO1xuXHRcdFx0XHRcdHZhciBkZXB0ID0gdGhpcy5tb2RlbC5nZXQoJ2RlcGVuZGVuY3knKTtcblx0XHRcdFx0XHRpZihkZXB0ICE9IFwiXCIpe1xuXHRcdFx0XHRcdFx0d2luZG93LmN1cnJlbnREcHQucHVzaCh0aGlzLm1vZGVsLmdldCgnZGVwZW5kZW5jeScpKTtcdFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zb2xlLmxvZyh3aW5kb3cuY3VycmVudERwdCk7XG5cdFx0XHRcdFx0d2luZG93LnN0YXJ0QmFyID0gdGhpcy5tb2RlbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0aWYoKHN0YXJ0QmFyPUJhci5pc0Nvbm5lY3RvckVuYWJsZWQoKSkpe1xuXHRcdFx0XHRcdEJhci5jcmVhdGVSZWxhdGlvbihzdGFydEJhcix0aGlzKTtcblx0XHRcdFx0XHR3aW5kb3cuY3VycmVudERwdC5wdXNoKHRoaXMubW9kZWwuZ2V0KCdpZCcpKTtcblx0XHRcdFx0XHR3aW5kb3cuc3RhcnRCYXIuc2V0KCdkZXBlbmRlbmN5JywgSlNPTi5zdHJpbmdpZnkod2luZG93LmN1cnJlbnREcHQpKTtcblx0XHRcdFx0XHR3aW5kb3cuc3RhcnRCYXIuc2F2ZSgpO1xuXHRcdFx0XHRcdEJhci5kaXNhYmxlQ29ubmVjdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGV2dC5jYW5jZWxCdWJibGU9dHJ1ZTtcblx0XHR9LFxuXHRcdG1ha2VSZXNpemFibGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dGhpcy5yZXNpemFibGU9dHJ1ZTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZT1jcmVhdGVIYW5kbGUoe1xuXHRcdFx0XHR4OiAwLFxuXHRcdFx0XHR5OiAwLFxuXHRcdFx0XHRoZWlnaHQ6IHRoaXMuZ2V0SGVpZ2h0KCksXG5cdFx0XHRcdGRyYWdCb3VuZEZ1bmM6IHRoaXMuc2V0dGluZy5yZXNpemVCb3VuZEZ1bmMsXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGU9Y3JlYXRlSGFuZGxlKHtcblx0XHRcdFx0eDogdGhpcy5nZXRXaWR0aCgpLTIsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHRcdGhlaWdodDogdGhpcy5nZXRIZWlnaHQoKSxcblx0XHRcdFx0ZHJhZ0JvdW5kRnVuYzogdGhpcy5zZXR0aW5nLnJlc2l6ZUJvdW5kRnVuYyxcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZGlzYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5kaXNhYmxlU3ViZ3JvdXAoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZW5hYmxlU3ViZ3JvdXAoKTtcblx0XHRcdFx0dGhhdC5wYXJlbnQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLm9uKCdkcmFnZW5kJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcdHRoYXQucGFyZW50LnN5bmMoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ2RyYWdtb3ZlJyxiZWZvcmViaW5kKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQucmVuZGVyKCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplbGVmdCcsIHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ3Jlc2l6ZScsIHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0fSkpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignZHJhZ21vdmUnLGJlZm9yZWJpbmQoZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5yZW5kZXIoKTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdyZXNpemVyaWdodCcsIHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ3Jlc2l6ZScsIHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0fSkpO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdtb3VzZW92ZXInLHRoaXMuY2hhbmdlUmVzaXplQ3Vyc29yKTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ21vdXNlb3ZlcicsdGhpcy5jaGFuZ2VSZXNpemVDdXJzb3IpO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdtb3VzZW91dCcsdGhpcy5jaGFuZ2VEZWZhdWx0Q3Vyc29yKTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ21vdXNlb3V0Jyx0aGlzLmNoYW5nZURlZmF1bHRDdXJzb3IpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmdyb3VwLmFkZCh0aGlzLmxlZnRIYW5kbGUpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQodGhpcy5yaWdodEhhbmRsZSk7XG5cblxuXHRcdH0sXG5cdFx0YWRkU3ViZ3JvdXA6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuaGFzU3ViR3JvdXA9dHJ1ZTtcblx0XHRcdHZhciBzdWJncm91cCx0aGF0PXRoaXM7XG5cdFx0XHRzdWJncm91cD10aGlzLnN1Ymdyb3VwPWNyZWF0ZVN1Ykdyb3VwKHtoZWlnaHQ6dGhpcy5nZXRIZWlnaHQoKX0pO1xuXHRcdFx0c3ViZ3JvdXAuaGlkZSgpO1xuXHRcdFx0c3ViZ3JvdXAuc2V0WCh0aGlzLmdldFdpZHRoKCkpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQoc3ViZ3JvdXApO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdC8vdGhpcy5iaW5kQW5jaG9yKCk7XG5cdFx0fSxcblx0XHRlbmFibGVTdWJncm91cDpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5zdWJncm91cG9wdGlvbnMuc2hvd09uSG92ZXI9dHJ1ZTtcblx0XHRcdHRoaXMuc3ViZ3JvdXAuc2V0WCh0aGlzLmdldFdpZHRoKCkpO1xuXHRcdH0sXG5cdFx0ZGlzYWJsZVN1Ymdyb3VwOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnN1Ymdyb3Vwb3B0aW9ucy5zaG93T25Ib3Zlcj10cnVlO1xuXHRcdFx0dGhpcy5zdWJncm91cC5oaWRlKCk7XG5cdFx0fSxcblx0XHRcblx0XHRiaW5kQW5jaG9yOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHZhciBhbmNob3I9dGhpcy5zdWJncm91cC5maW5kKCcuYW5jaG9yJyk7XG5cdFx0XHRhbmNob3Iub24oJ2NsaWNrJyxmdW5jdGlvbihldnQpe1xuXHRcdFx0XHRhbmNob3Iuc3Ryb2tlKCdyZWQnKTtcblx0XHRcdFx0dGhhdC5zdWJncm91cG9wdGlvbnMuaGlkZU9uSG92ZXJPdXQ9ZmFsc2U7XG5cdFx0XHRcdEtpbmV0aWMuQ29ubmVjdC5zdGFydD10aGF0O1xuXHRcdFx0XHR0aGlzLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0XHRldnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcblx0XHRcdH0pO1xuXG5cdFx0fSxcblx0XHRcblx0XHRtYWtlRHJhZ2dhYmxlOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHRoaXMuZ3JvdXAuZHJhZ2dhYmxlKHRydWUpO1xuXHRcdFx0aWYodGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpe1xuXHRcdFx0XHR0aGlzLmdyb3VwLmRyYWdCb3VuZEZ1bmModGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cC5vbignZHJhZ21vdmUnLGJlZm9yZWJpbmQoZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdtb3ZlJytnZXREcmFnRGlyKHRoaXMuZ2V0U3RhZ2UoKSksdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcignbW92ZScpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXJQYXJlbnQoJ21vdmUnKTtcblx0XHRcdH0pKTtcblx0XHRcdHRoaXMuZ3JvdXAub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQucGFyZW50LnN5bmMoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Y2hhbmdlUmVzaXplQ3Vyc29yOmZ1bmN0aW9uKCl7XG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xuXHRcdH0sXG5cdFx0Y2hhbmdlRGVmYXVsdEN1cnNvcjpmdW5jdGlvbigpe1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG5cdFx0fSxcblx0XHQvL3JlbmRlcnMgdGhlIGhhbmRsZSBieSBpdHMgcmVjdFxuXHRcdHJlbmRlckhhbmRsZTpmdW5jdGlvbigpe1xuXHRcdFx0aWYgKCF0aGlzLnJlc2l6YWJsZSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR2YXIgeCA9IHRoaXMucmVjdC5nZXRYKCk7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUuc2V0WCh4KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUuc2V0WCh4ICsgdGhpcy5yZWN0LmdldFdpZHRoKCkgLSAyKTtcblx0XHR9LFxuXHRcdFxuXHRcdFxuXHRcdC8vcmVuZGVycyB0aGUgYmFyIGJ5IHRoZSBoYW5kbGVzXG5cdFx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHggPSB0aGlzLmNhbGN1bGF0ZVgoKTtcblx0XHRcdHRoaXMuZ3JvdXAuc2V0WCh4LngxKTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5zZXRYKDApO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5zZXRYKHgueDIgLSB4LngxIC0gMik7XG5cdFx0XHR0aGlzLnJlY3Quc2V0V2lkdGgoeC54MiAtIHgueDEpO1xuXHRcdFx0dmFyIG9wdHMgPSB0aGlzLmdldFJlY3RwYXJhbXMoKTtcblx0XHRcdG9wdHMuZmlsbCA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5nZXQodGhpcy5tb2RlbC5nZXQoJ3BhcmVudGlkJykpLmdldCgnbGlnaHRjb2xvcicpO1xuXHRcdFx0dGhpcy5yZWN0LnNldEF0dHJzKG9wdHMpO1xuXHRcdFx0dGhpcy5fdXBkYXRlQ29tcGxldGVCYXIoKTtcblx0XHRcdHRoaXMuZ3JvdXAuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0fSxcblx0XHQvKlxuXHRcdGRlcGVuZGVudE9iajogeydlbGVtJzpkZXBlbmRhbnQsJ2Nvbm5lY3Rvcic6Y29ubmVjdG9yfVxuXHRcdCovXG5cdFx0YWRkRGVwZW5kYW50OmZ1bmN0aW9uKGRlcGVuZGFudE9iail7XG5cdFx0XHR0aGlzLmxpc3RlblRvKGRlcGVuZGFudE9iai5lbGVtLCdtb3ZlbGVmdCByZXNpemVsZWZ0Jyx0aGlzLmFkanVzdGxlZnQpXG5cdFx0XHR0aGlzLmRlcGVuZGFudHMucHVzaChkZXBlbmRhbnRPYmopO1xuXHRcdH0sXG5cdFx0Ly9yZW5kZXJzIHRoZSBiYXIgYnkgaXRzIG1vZGVsIFxuXHRcdHJlbmRlckJhcjpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHggPSB0aGlzLmNhbGN1bGF0ZVgoKTtcblx0XHRcdHRoaXMuc2V0WDEoeC54MSx7YWJzb2x1dGU6dHJ1ZSwgc2lsZW50OnRydWV9KTtcblx0XHRcdHRoaXMuc2V0WDIoeC54Mix7YWJzb2x1dGU6dHJ1ZSwgc2lsZW50OnRydWUsIG9zYW1lOnRydWV9KTtcblx0XHRcdHRoaXMucmVuZGVyQ29ubmVjdG9ycygpO1xuXHRcdFx0Y29uc29sZS5lcnJvcigncmVuZGVyIGJhcicpO1xuXHRcdH0sXG5cdFx0XG5cdFx0YWRkRGVwZW5kYW5jeTogZnVuY3Rpb24oZGVwZW5kZW5jeU9iail7XG5cdFx0XHR0aGlzLmxpc3RlblRvKGRlcGVuZGVuY3lPYmouZWxlbSwnbW92ZXJpZ2h0IHJlc2l6ZXJpZ2h0Jyx0aGlzLmFkanVzdHJpZ2h0KTtcblx0XHRcdHRoaXMuZGVwZW5kZW5jaWVzLnB1c2goZGVwZW5kZW5jeU9iaik7XG5cdFx0XHR0aGlzLnJlbmRlckNvbm5lY3RvcihkZXBlbmRlbmN5T2JqLDIpO1xuXHRcdH0sXG5cdFx0Ly9jaGVja3MgaWYgdGhlIGJhciBuZWVkcyBtb3ZlbWVudCBpbiBsZWZ0IHNpZGUgb24gbGVmdCBtb3ZlbWVudCBvZiBkZXBlbmRlbnQgYW5kIG1ha2VzIGFkanVzdG1lbnRcblx0XHRhZGp1c3RsZWZ0OmZ1bmN0aW9uKGRlcGVuZGFudCl7XG5cdFx0XHRpZighdGhpcy5pc0RlcGVuZGFudChkZXBlbmRhbnQpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgZHg9dGhpcy5nZXRYMSgpK3RoaXMuZ2V0V2lkdGgoKS1kZXBlbmRhbnQuZ2V0WDEoKTtcblx0XHRcdC8vYW4gb3ZlcmxhcCBvY2N1cnMgaW4gdGhpcyBjYXNlXG5cdFx0XHRpZihkeD4wKXtcblx0XHRcdFx0Ly9ldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBpbiBtb3ZlIGZ1bmNcblx0XHRcdFx0dGhpcy5tb3ZlKC0xKmR4KTtcblx0XHRcdFx0Ly90aGlzLnRyaWdnZXIoJ21vdmVsZWZ0Jyx0aGlzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGFkanVzdHJpZ2h0OmZ1bmN0aW9uKGRlcGVuZGVuY3kpe1xuXHRcdFx0aWYoIXRoaXMuaXNEZXBlbmRlbmN5KGRlcGVuZGVuY3kpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgZHg9ZGVwZW5kZW5jeS5nZXRYMSgpK2RlcGVuZGVuY3kuZ2V0V2lkdGgoKS10aGlzLmdldFgxKCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGR4KTtcblx0XHRcdGlmKGR4PjApe1xuXHRcdFx0XHQvL2V2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGluIG1vdmUgZnVuY1xuXHRcdFx0XHR0aGlzLm1vdmUoZHgpO1xuXHRcdFx0XHQvL3RoaXMudHJpZ2dlcignbW92ZXJpZ2h0Jyx0aGlzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGlzRGVwZW5kYW50OmZ1bmN0aW9uKGRlcGVuZGFudCl7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZGVwZW5kYW50cy5sZW5ndGg7aSsrKXtcblx0XHRcdFx0aWYodGhpcy5kZXBlbmRhbnRzW2ldWydlbGVtJ11bJ2JhcmlkJ109PT1kZXBlbmRhbnRbJ2JhcmlkJ10pe1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXHRcdC8vQHR5cGUgRGVwZW5kYW50OjEsIERlcGVuZGVuY3k6MlxuXHRcdHJlbmRlckNvbm5lY3RvcjpmdW5jdGlvbihvYmosdHlwZSl7XG5cdFx0XHRpZih0eXBlPT0xKXtcblx0XHRcdFx0QmFyLnJlbmRlckNvbm5lY3Rvcih0aGlzLG9iai5lbGVtLG9iai5jb25uZWN0b3IpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0QmFyLnJlbmRlckNvbm5lY3RvcihvYmouZWxlbSx0aGlzLG9iai5jb25uZWN0b3IpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly9yZW5kZXJzIGFsbCBjb25uZWN0b3JzXG5cdFx0cmVuZGVyQ29ubmVjdG9yczpmdW5jdGlvbigpe1xuXHRcdFx0Zm9yKHZhciBpPTAsaUxlbj10aGlzLmRlcGVuZGFudHMubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHR0aGlzLnJlbmRlckNvbm5lY3Rvcih0aGlzLmRlcGVuZGFudHNbaV0sMSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IodmFyIGk9MCxpTGVuPXRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0dGhpcy5yZW5kZXJDb25uZWN0b3IodGhpcy5kZXBlbmRlbmNpZXNbaV0sMik7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpc0RlcGVuZGVuY3k6IGZ1bmN0aW9uKGRlcGVuZGVuY3kpe1xuXHRcdFx0XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRpZih0aGlzLmRlcGVuZGVuY2llc1tpXVsnZWxlbSddWydiYXJpZCddPT09ZGVwZW5kZW5jeVsnYmFyaWQnXSl7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdG1vdmU6IGZ1bmN0aW9uKGR4LHNpbGVudCl7XG5cdFx0XHRpZihkeD09PTApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cC5tb3ZlKHt4OmR4fSk7XG5cdFx0XHRpZighc2lsZW50KXtcblx0XHRcdFx0dGhpcy50cmlnZ2VyKCdtb3ZlJyx0aGlzKTtcblx0XHRcdFx0aWYoZHg+MCl7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdtb3ZlcmlnaHQnLHRoaXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdtb3ZlbGVmdCcsdGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy50cmlnZ2VyUGFyZW50KCdtb3ZlJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVYOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdFx0Ym91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdFx0ZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDE6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSAqIGRheXNXaWR0aCxcblx0XHRcdFx0eDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdlbmQnKSkgKiBkYXlzV2lkdGhcblx0XHRcdH07XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVEYXRlczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRcdGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXG5cdFx0XHRcdGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcblx0XHRcdHZhciBkYXlzMSA9IE1hdGgucm91bmQodGhpcy5nZXRYMSh0cnVlKSAvIGRheXNXaWR0aCk7XG5cdFx0XHR2YXIgZGF5czIgPSBNYXRoLnJvdW5kKHRoaXMuZ2V0WDIodHJ1ZSkgLyBkYXlzV2lkdGgpO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxIC0gMSksXG5cdFx0XHRcdGVuZDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyKVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0Z2V0UmVjdHBhcmFtczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHhzICA9IHRoaXMuY2FsY3VsYXRlWCh0aGlzLm1vZGVsKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IDAsXG5cdFx0XHRcdHdpZHRoOiB4cy54MiAtIHhzLngxLFxuXHRcdFx0XHR5OiAwLFxuXHRcdFx0XHRuYW1lOiAnbWFpbmJhcicsXG5cdFx0XHRcdGhlaWdodDogdGhpcy5zZXR0aW5nLmJhcmhlaWdodFxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGdldEdyb3VwUGFyYW1zOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgeHMgPSB0aGlzLmNhbGN1bGF0ZVgodGhpcy5tb2RlbCk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4cy54MSxcblx0XHRcdFx0eTogMFxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHRvZ2dsZTpmdW5jdGlvbihzaG93KXtcblx0XHRcdHZhciBtZXRob2QgPSBzaG93ID8gJ3Nob3cnIDogJ2hpZGUnO1xuXHRcdFx0Y29uc29sZS5sb2coJ21ldGhvZCcsIG1ldGhvZCk7XG5cdFx0XHR0aGlzLmdyb3VwW21ldGhvZF0oKTtcblx0XHRcdGZvcih2YXIgaT0wLGlMZW49dGhpcy5kZXBlbmRlbmNpZXMubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHR0aGlzLmRlcGVuZGVuY2llc1tpXS5jb25uZWN0b3JbbWV0aG9kXSgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3luYzpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGRhdGVzID0gdGhpcy5jYWxjdWxhdGVEYXRlcygpO1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoe1xuXHRcdFx0XHRzdGFydDogZGF0ZXMuc3RhcnQsXG5cdFx0XHRcdGVuZDogZGF0ZXMuZW5kXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZSgpO1xuXHRcdH1cblx0fTtcblx0Ly9JdCBjcmVhdGVzIGEgcmVsYXRpb24gYmV0d2VlbiBkZXBlbmRhbnQgYW5kIGRlcGVuZGVuY3lcblx0Ly9EZXBlbmRhbnQgaXMgdGhlIHRhc2sgd2hpY2ggbmVlZHMgdG8gYmUgZG9uZSBhZnRlciBkZXBlbmRlbmN5XG5cdC8vU3VwcG9zZSB0YXNrIEIgcmVxdWlyZXMgdGFzayBBIHRvIGJlIGRvbmUgYmVmb3JlaGFuZC4gU28sIEEgaXMgZGVwZW5kYW5jeS9yZXF1aXJlbWVudCBmb3IgQiB3aGVyZWFzIEIgaXMgZGVwZW5kYW50IG9uIEEuXG5cdEJhci5jcmVhdGVSZWxhdGlvbj1mdW5jdGlvbihkZXBlbmRlbmN5LGRlcGVuZGFudCl7XG5cdFx0dmFyIGNvbm5lY3RvcixwYXJlbnQ7XG5cdFx0cGFyZW50PWRlcGVuZGFudC5ncm91cC5nZXRQYXJlbnQoKTtcblx0XHRjb25uZWN0b3I9dGhpcy5jcmVhdGVDb25uZWN0b3IoKTtcblx0XHRkZXBlbmRlbmN5LmFkZERlcGVuZGFudCh7XG5cdFx0XHQnZWxlbSc6ZGVwZW5kYW50LFxuXHRcdFx0J2Nvbm5lY3Rvcic6IGNvbm5lY3Rvcixcblx0XHR9KTtcblx0XHRkZXBlbmRhbnQuYWRkRGVwZW5kYW5jeSh7XG5cdFx0XHQnZWxlbSc6ZGVwZW5kZW5jeSxcblx0XHRcdCdjb25uZWN0b3InOiBjb25uZWN0b3IsXG5cdFx0fSk7XG5cdFx0XG5cdFx0cGFyZW50LmFkZChjb25uZWN0b3IpO1xuXHRcdFxuXHR9XG5cdFxuXHRCYXIuY3JlYXRlQ29ubmVjdG9yPWZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIG5ldyBLaW5ldGljLkxpbmUoe1xuXHRcdFx0c3Ryb2tlV2lkdGg6IDEsXG5cdFx0XHRzdHJva2U6ICdibGFjaycsXG5cdFx0XHRwb2ludHM6IFswLCAwXVxuXHRcdH0pO1xuXHRcdFxuXHR9LFxuXHRCYXIuZW5hYmxlQ29ubmVjdG9yPWZ1bmN0aW9uKHN0YXJ0KXtcblx0XHRLaW5ldGljLkNvbm5lY3Quc3RhcnQ9c3RhcnQ7XG5cdFx0c3RhcnQuc3ViZ3JvdXBvcHRpb25zLmhpZGVPbkhvdmVyT3V0PWZhbHNlO1xuXHR9XG5cdEJhci5kaXNhYmxlQ29ubmVjdG9yPWZ1bmN0aW9uKCl7XG5cdFx0aWYoIUtpbmV0aWMuQ29ubmVjdC5zdGFydCkgcmV0dXJuO1xuXHRcdHZhciBzdGFydD1LaW5ldGljLkNvbm5lY3Quc3RhcnQ7XG5cdFx0c3RhcnQuc3ViZ3JvdXBvcHRpb25zLmhpZGVPbkhvdmVyT3V0PXRydWU7XG5cdFx0S2luZXRpYy5Db25uZWN0LnN0YXJ0PW51bGw7XG5cdH1cblx0XG5cdEJhci5pc0Nvbm5lY3RvckVuYWJsZWQ9ZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gS2luZXRpYy5Db25uZWN0LnN0YXJ0O1xuXHR9XG5cdEJhci5yZW5kZXJDb25uZWN0b3I9ZnVuY3Rpb24oc3RhcnRCYXIsZW5kQmFyLGNvbm5lY3Rvcil7XG5cdFx0XG5cdFx0dmFyIHBvaW50MSxwb2ludDIsaGFsZmhlaWdodCxwb2ludHMsY29sb3I9JyMwMDAnO1xuXHRcdGhhbGZoZWlnaHQ9cGFyc2VJbnQoc3RhcnRCYXIuZ2V0SGVpZ2h0KCkvMik7XG5cdFx0cG9pbnQxPXtcblx0XHRcdHg6c3RhcnRCYXIuZ2V0WDIoKSxcblx0XHRcdHk6c3RhcnRCYXIuZ2V0WSgpK2hhbGZoZWlnaHQsXG5cdFx0fVxuXHRcdHBvaW50Mj17XG5cdFx0XHR4OmVuZEJhci5nZXRYMSgpLFxuXHRcdFx0eTplbmRCYXIuZ2V0WSgpK2hhbGZoZWlnaHQsXG5cdFx0fVxuXHRcdHZhciBvZmZzZXQ9NSxhcnJvd2ZsYW5rPTQsYXJyb3doZWlnaHQ9NSxib3R0b21vZmZzZXQ9NDtcblx0XHRcblxuXHRcdGlmKHBvaW50Mi54LXBvaW50MS54PDApe1xuXHRcdFx0aWYocG9pbnQyLnk8cG9pbnQxLnkpe1xuXHRcdFx0XHRoYWxmaGVpZ2h0PSAtMSpoYWxmaGVpZ2h0O1xuXHRcdFx0XHRib3R0b21vZmZzZXQ9LTEqYm90dG9tb2Zmc2V0O1xuXHRcdFx0XHQvL2Fycm93aGVpZ2h0PS0xKmFycm93aGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0cG9pbnRzPVtcblx0XHRcdHBvaW50MS54LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50MS55K2hhbGZoZWlnaHQrYm90dG9tb2Zmc2V0LFxuXHRcdFx0cG9pbnQyLngtb2Zmc2V0LHBvaW50MS55K2hhbGZoZWlnaHQrYm90dG9tb2Zmc2V0LFxuXHRcdFx0cG9pbnQyLngtb2Zmc2V0LHBvaW50Mi55LFxuXHRcdFx0cG9pbnQyLngscG9pbnQyLnksXG5cdFx0XHRwb2ludDIueC1hcnJvd2hlaWdodCxwb2ludDIueS1hcnJvd2ZsYW5rLFxuXHRcdFx0cG9pbnQyLngtYXJyb3doZWlnaHQscG9pbnQyLnkrYXJyb3dmbGFuayxcblx0XHRcdHBvaW50Mi54LHBvaW50Mi55XG5cdFx0XHRdO1xuXHRcdFx0Y29sb3I9J3JlZCc7XG5cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZSBpZihwb2ludDIueC1wb2ludDEueDw1KXtcblx0XHRcdGlmKHBvaW50Mi55PHBvaW50MS55KXtcblx0XHRcdFx0aGFsZmhlaWdodD0gLTEqaGFsZmhlaWdodDtcblx0XHRcdFx0Ym90dG9tb2Zmc2V0PS0xKmJvdHRvbW9mZnNldDtcblx0XHRcdFx0YXJyb3doZWlnaHQ9LTEqYXJyb3doZWlnaHQ7XG5cdFx0XHR9XG5cdFx0XHRwb2ludHM9W1xuXHRcdFx0cG9pbnQxLngscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQyLnktaGFsZmhlaWdodCxcblx0XHRcdHBvaW50MS54K29mZnNldC1hcnJvd2ZsYW5rLHBvaW50Mi55LWhhbGZoZWlnaHQtYXJyb3doZWlnaHQsXG5cdFx0XHRwb2ludDEueCtvZmZzZXQrYXJyb3dmbGFuayxwb2ludDIueS1oYWxmaGVpZ2h0LWFycm93aGVpZ2h0LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50Mi55LWhhbGZoZWlnaHRcblx0XHRcdF07XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHBvaW50cz1bXG5cdFx0XHRwb2ludDEueCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDIueSxcblx0XHRcdHBvaW50Mi54LHBvaW50Mi55LFxuXHRcdFx0cG9pbnQyLngtYXJyb3doZWlnaHQscG9pbnQyLnktYXJyb3dmbGFuayxcblx0XHRcdHBvaW50Mi54LWFycm93aGVpZ2h0LHBvaW50Mi55K2Fycm93ZmxhbmssXG5cdFx0XHRwb2ludDIueCxwb2ludDIueVxuXHRcdFx0XTtcblx0XHR9XG5cdFx0Y29ubmVjdG9yLnNldEF0dHIoJ3N0cm9rZScsY29sb3IpO1xuXHRcdGNvbm5lY3Rvci5zZXRQb2ludHMocG9pbnRzKTtcblx0fVxuXHRcblx0S2luZXRpYy5Db25uZWN0PXtcblx0XHRzdGFydDpmYWxzZSxcblx0XHRlbmQ6ZmFsc2Vcblx0fVxuXHRcblx0XG5cdFxuXHRfLmV4dGVuZChCYXIucHJvdG90eXBlLCBCYWNrYm9uZS5FdmVudHMpO1xuXG5cdG1vZHVsZS5leHBvcnRzID0gQmFyOyIsInZhciBCYXIgPSByZXF1aXJlKCcuL0JhcicpO1xuXG52YXIgQmFyR3JvdXAgPSBmdW5jdGlvbihvcHRpb25zKXtcblx0dGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCdiZycpO1xuXHR0aGlzLnNldHRpbmdzID0gb3B0aW9ucy5zZXR0aW5ncztcblx0dGhpcy5tb2RlbCA9IG9wdGlvbnMubW9kZWw7XG5cdHZhciBzZXR0aW5nID0gdGhpcy5zZXR0aW5nID0gb3B0aW9ucy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdncm91cCcpO1xuXHR0aGlzLmF0dHIgPSB7XG5cdFx0aGVpZ2h0OiAwXG5cdH07XG5cdHRoaXMuc3luY2luZyA9IGZhbHNlO1xuXHR0aGlzLmNoaWxkcmVuID0gW107XG5cblx0dGhpcy5ncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHRoaXMuZ2V0R3JvdXBQYXJhbXMoKSk7XG5cdHRoaXMudG9wYmFyID0gbmV3IEtpbmV0aWMuUmVjdCh0aGlzLmdldFJlY3RwYXJhbXMoKSk7XG5cdHRoaXMuZ3JvdXAuYWRkKHRoaXMudG9wYmFyKTtcblxuXHR0aGlzLmF0dHIuaGVpZ2h0ICs9ICBzZXR0aW5nLnJvd0hlaWdodDtcblxuXHRpZihzZXR0aW5nLmRyYWdnYWJsZSl7XG5cdFx0dGhpcy5tYWtlRHJhZ2dhYmxlKCk7XG5cdH1cblx0aWYoc2V0dGluZy5yZXNpemFibGUpe1xuXHRcdHRoaXMudG9wYmFyLm1ha2VSZXNpemFibGUoKTtcblx0fVxuXHR0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbkJhckdyb3VwLnByb3RvdHlwZT17XG5cdFx0aW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5tb2RlbC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJTb3J0ZWRDaGlsZHJlbih0cnVlKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHZhciB2aWV3Rm9yRGVsZXRlID0gXy5maW5kKHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5tb2RlbCA9PT0gY2hpbGQ7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0aGlzLmNoaWxkcmVuID0gXy53aXRob3V0KHRoaXMuY2hpbGRyZW4sIHZpZXdGb3JEZWxldGUpO1xuXHRcdFx0XHR2aWV3Rm9yRGVsZXRlLmRlc3Ryb3koKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJTb3J0ZWRDaGlsZHJlbih0cnVlKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKHRydWUpO1xuXHRcdFx0dGhpcy5yZW5kZXJEZXBlbmRlbmN5KCk7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0XHR9LFxuXHRcdGRlc3Ryb3kgOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuZ3JvdXAuZGVzdHJveSgpO1xuXHRcdH0sXG5cdFx0cmVuZGVyU29ydGVkQ2hpbGRyZW46ZnVuY3Rpb24obm9kcmF3KXtcblx0XHRcdCFub2RyYXcgJiYgKG5vZHJhdz1mYWxzZSk7XG5cdFx0XHR2YXIgc29ydGVkPV8uc29ydEJ5KHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uKGl0ZW1iYXIpe1xuXHRcdFx0XHRyZXR1cm4gaXRlbWJhci5tb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmF0dHIuaGVpZ2h0PXRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHNvcnRlZC5sZW5ndGg7aSsrKXtcblx0XHRcdFx0c29ydGVkW2ldLnNldFkodGhpcy5nZXRIZWlnaHQoKSt0aGlzLnNldHRpbmcuZ2FwKTtcblx0XHRcdFx0c29ydGVkW2ldLnJlbmRlckNvbm5lY3RvcnMoKTtcblx0XHRcdFx0dGhpcy5hdHRyLmhlaWdodCArPSB0aGlzLnNldHRpbmcucm93SGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0aWYoIW5vZHJhdykge1xuXHRcdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZmluZEJ5SWQ6ZnVuY3Rpb24oaWQpe1xuXHRcdFx0dmFyIGNoaWxkcmVuPXRoaXMuY2hpbGRyZW47XG5cdFx0XHRmb3IodmFyIGk9MDtpPGNoaWxkcmVuLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRpZihjaGlsZHJlbltpXS5tb2RlbC5nZXQoJ2lkJyk9PT1pZClcblx0XHRcdFx0XHRyZXR1cm4gY2hpbGRyZW5baV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXHRcdHJlbmRlckRlcGVuZGVuY3k6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBjaGlsZHJlbj10aGlzLmNoaWxkcmVuLGRlcGVuZGVuY2llcz1bXSxiYXI7XG5cdFx0XHRmb3IodmFyIGk9MDtpPGNoaWxkcmVuLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRkZXBlbmRlbmNpZXM9Y2hpbGRyZW5baV0ubW9kZWwuZ2V0KCdkZXBlbmRlbmN5Jyk7XG5cdFx0XHRcdGZvcih2YXIgaj0wO2o8ZGVwZW5kZW5jaWVzLmxlbmd0aDtqKyspe1xuXHRcdFx0XHRcdGJhcj10aGlzLmZpbmRCeUlkKGRlcGVuZGVuY2llc1tqXVsnaWQnXSk7XG5cdFx0XHRcdFx0aWYoYmFyKXtcblx0XHRcdFx0XHRcdEJhci5jcmVhdGVSZWxhdGlvbihiYXIsY2hpbGRyZW5baV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0bWFrZURyYWdnYWJsZTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0XHR0aGlzLmdyb3VwLmRyYWdnYWJsZSh0cnVlKTtcblx0XHRcdGlmKHRoaXMuc2V0dGluZy5kcmFnQm91bmRGdW5jKXtcblx0XHRcdFx0dGhpcy5ncm91cC5kcmFnQm91bmRGdW5jKHRoaXMuc2V0dGluZy5kcmFnQm91bmRGdW5jKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JvdXAub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHQvL3JldHVybnMgdGhlIHggcG9zaXRpb24gb2YgdGhlIGdyb3VwXG5cdFx0Ly9UaGUgeCBwb3NpdGlvbiBvZiB0aGUgZ3JvdXAgaXMgc2V0IDAgaW5pdGlhbGx5LlRoZSB0b3BiYXIgeCBwb3NpdGlvbiBpcyBzZXQgcmVsYXRpdmUgdG8gZ3JvdXBzIDAgcG9zaXRpb24gaW5pdGlhbGx5LiB3aGVuIHRoZSBncm91cCBpcyBtb3ZlZCB0byBnZXQgdGhlIGFic29sdXRlIHggcG9zaXRpb24gb2YgdGhlIHRvcCBiYXIgdXNlIGdldFgxIG1ldGhvZC5cblx0XHQvL1RoZSBwcm9ibGVtIGlzIHdoZW4gYW55IGNoaWxkcmVuIGdldCBvdXRzaWRlIG9mIGJvdW5kIHRoZW4gdGhlIHBvc2l0aW9uIG9mIGVhY2ggY2hpbGRyZW4gaGFzIHRvIGJlIHVwZGF0ZWQuIFRoaXMgd2F5IHNvbHZlcyB0aGUgcHJvYmxlbVxuXHRcdGdldFg6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFgoKTtcblx0XHR9LFxuXHRcdC8vcmV0dXJucyB0aGUgYmJzb2x1dGUgeDEgcG9zaXRpb24gb2YgdG9wIGJhclxuXHRcdGdldFgxOmZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy5ncm91cC5nZXRYKCkrdGhpcy50b3BiYXIuZ2V0WCgpO1xuXHRcdH0sXG5cdFx0Ly9yZXR1cm5zIHRoZSBhYnNvbHV0ZSB4MSBwb3NpdGlvbiBvZiB0b3AgYmFyXG5cdFx0Z2V0WDI6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdldFgxKCkrdGhpcy50b3BiYXIuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdGdldFkxOmZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy5ncm91cC5nZXRZKCk7XG5cdFx0fSxcblx0XHRzZXRZOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdHRoaXMuZ3JvdXAuc2V0WSh2YWx1ZSk7XG5cdFx0fSxcblx0XHRnZXRXaWR0aDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMudG9wYmFyLmdldFdpZHRoKCk7XG5cdFx0fSxcblx0XHRnZXRIZWlnaHQ6ZnVuY3Rpb24oKXtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKSlcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXR0ci5oZWlnaHQ7XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdncm91cCcsJ3Jvd0hlaWdodCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Z2V0Q3VycmVudEhlaWdodDpmdW5jdGlvbigpe1xuXHRcdFx0aWYodGhpcy5tb2RlbC5nZXQoJ2FjdGl2ZScpKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5hdHRyLmhlaWdodDtcblx0XHRcdGVsc2V7XG5cdFx0XHRcdHJldHVybiB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2dyb3VwJywncm93SGVpZ2h0Jyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRcblx0XHRhZGRDaGlsZDogZnVuY3Rpb24oYmFyKXtcblx0XHRcdHRoaXMuY2hpbGRyZW4ucHVzaChiYXIpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQoYmFyLmdyb3VwKTtcblx0XHRcdHZhciB4ID0gYmFyLmdldFgxKHRydWUpO1xuXHRcdFx0Ly9tYWtlIGJhciB4IHJlbGF0aXZlIHRvIHRoaXMgZ3JvdXBcblx0XHRcdGJhci5zZXRQYXJlbnQodGhpcyk7XG5cdFx0XHRiYXIuc2V0WDEoeCwge2Fic29sdXRlOnRydWUsIHNpbGVudDp0cnVlfSk7XG5cdFx0XHRiYXIuc2V0WSh0aGlzLmdldEhlaWdodCgpICsgdGhpcy5zZXR0aW5nLmdhcCk7XG5cdFx0XHR0aGlzLmF0dHIuaGVpZ2h0ICs9IHRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHRiYXIuZ3JvdXAudmlzaWJsZSh0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpO1xuXHRcdH0sXG5cdFx0cmVuZGVyQ2hpbGRyZW46ZnVuY3Rpb24oKXtcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy5jaGlsZHJlbi5sZW5ndGg7aSsrKXtcblx0XHRcdFx0dGhpcy5jaGlsZHJlbltpXS5yZW5kZXJCYXIoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVuZGVyVG9wQmFyKCk7XG5cblx0XHR9LFxuXHRcdHJlbmRlclRvcEJhcjpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHBhcmVudD10aGlzLm1vZGVsO1xuXHRcdFx0dmFyIHg9dGhpcy5jYWxjdWxhdGVYKHBhcmVudCk7XG5cdFx0XHR0aGlzLnRvcGJhci5zZXRYKHgueDEtdGhpcy5ncm91cC5nZXRYKCkpO1xuXHRcdFx0dGhpcy50b3BiYXIuc2V0V2lkdGgoeC54Mi14LngxKTtcblx0XHR9LFxuXHRcdGJpbmRFdmVudHM6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMub24oJ3Jlc2l6ZSBtb3ZlJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgbWluWCxtYXhYO1xuXHRcdFx0XHRtaW5YPV8ubWluKHRoaXMuY2hpbGRyZW4sZnVuY3Rpb24oYmFyKXtcblx0XHRcdFx0XHRyZXR1cm4gYmFyLmdldFgxKCk7XG5cdFx0XHRcdH0pLmdldFgxKCk7XG5cdFx0XHRcdG1heFg9Xy5tYXgodGhpcy5jaGlsZHJlbixmdW5jdGlvbihiYXIpe1xuXHRcdFx0XHRcdHJldHVybiBiYXIuZ2V0WDIoKTtcblx0XHRcdFx0fSkuZ2V0WDIoKTtcblx0XHRcdFx0dGhpcy50b3BiYXIuc2V0WChtaW5YKTtcblx0XHRcdFx0dGhpcy50b3BiYXIuc2V0V2lkdGgobWF4WC1taW5YKTtcblxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6YWN0aXZlJywgdGhpcy50b2dnbGVDaGlsZHJlbik7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdvbnNvcnQnLCB0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dGhpcy50b3BiYXIuc2V0QXR0cnModGhpcy5nZXRSZWN0cGFyYW1zKCkpO1xuXHRcdFx0XHR0aGlzLnRvcGJhci5nZXRMYXllcigpLmRyYXcoKTtcblx0XHRcdH0pO1xuXG5cdFx0fSxcblx0XHRnZXRHcm91cFBhcmFtczogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiBfLmV4dGVuZCh7XG5cdFx0XHRcdHg6IDAsXG5cdFx0XHRcdHk6IDBcblx0XHRcdH0sIHRoaXMuc2V0dGluZy50b3BCYXIpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVYOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdFx0Ym91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdFx0ZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDE6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSkpICogZGF5c1dpZHRoIC0gdGhpcy5ncm91cC54KCksXG5cdFx0XHRcdHgyOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnZW5kJykpICogZGF5c1dpZHRoIC0gdGhpcy5ncm91cC54KClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVQYXJlbnREYXRlczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRcdGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXG5cdFx0XHRcdGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcblx0XHRcdHZhciBkYXlzMSA9IE1hdGgucm91bmQodGhpcy5nZXRYMSh0cnVlKSAvIGRheXNXaWR0aCk7XG5cdFx0XHR2YXIgZGF5czIgPSBNYXRoLnJvdW5kKHRoaXMuZ2V0WDIodHJ1ZSkgLyBkYXlzV2lkdGgpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSAtIDEpLFxuXHRcdFx0XHRlbmQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMiAtIDEpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0UmVjdHBhcmFtczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHhzPXRoaXMuY2FsY3VsYXRlWCh0aGlzLm1vZGVsKTtcblx0XHRcdHZhciBzZXR0aW5nID0gdGhpcy5zZXR0aW5nO1xuXHRcdFx0cmV0dXJuIF8uZXh0ZW5kKHtcblx0XHRcdFx0eDogeHMueDEsXG5cdFx0XHRcdHdpZHRoOiB4cy54MiAtIHhzLngxLFxuXHRcdFx0XHR5OiBzZXR0aW5nLmdhcFxuXHRcdFx0fSwgc2V0dGluZy50b3BCYXIpO1xuXHRcdH0sXG5cdFx0dG9nZ2xlQ2hpbGRyZW46IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgc2hvdyA9IHRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKTtcblx0XHRcdHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRjaGlsZC50b2dnbGUoc2hvdyk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdHN5bmM6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuc3luY2luZyA9IHRydWU7XG5cblx0XHRcdHZhciBwZGF0ZXMgPSB0aGlzLmNhbGN1bGF0ZVBhcmVudERhdGVzKCk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmUoe1xuXHRcdFx0XHRzdGFydDogcGRhdGVzLnN0YXJ0LFxuXHRcdFx0XHRlbmQ6cGRhdGVzLmVuZFxuXHRcdFx0fSk7XG5cblxuXHRcdFx0dmFyIGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcblx0XHRcdGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdFx0Y2hpbGQuc3luYygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuc3luY2luZyA9IGZhbHNlO1xuXHRcdH1cblx0fTtcblxuXy5leHRlbmQoQmFyR3JvdXAucHJvdG90eXBlLCBCYWNrYm9uZS5FdmVudHMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhckdyb3VwO1xuIiwidmFyIEJhckdyb3VwID0gcmVxdWlyZSgnLi9CYXJHcm91cCcpO1xudmFyIEJhciA9IHJlcXVpcmUoJy4vQmFyJyk7XG5cbnZhciB2aWV3T3B0aW9ucyA9IFsnbW9kZWwnLCAnY29sbGVjdGlvbiddO1xuXG52YXIgS2luZXRpY1ZpZXcgPSBCYWNrYm9uZS5LaW5ldGljVmlldyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCd2aWV3Jyk7XG5cdF8uZXh0ZW5kKHRoaXMsIF8ucGljayhvcHRpb25zLCB2aWV3T3B0aW9ucykpO1xuXHR0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5fLmV4dGVuZChLaW5ldGljVmlldy5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cywge1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5cbktpbmV0aWNWaWV3LmV4dGVuZD1CYWNrYm9uZS5Nb2RlbC5leHRlbmQ7XG5cbnZhciBLQ2FudmFzVmlldyA9IEtpbmV0aWNWaWV3LmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMuZ3JvdXBzPVtdO1xuXHRcdHRoaXMuc2V0dGluZ3MgPSB0aGlzLmFwcC5zZXR0aW5ncztcblx0XHR2YXIgc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdkaXNwbGF5Jyk7XG5cdFx0XG5cdFx0dGhpcy5zdGFnZSA9IG5ldyBLaW5ldGljLlN0YWdlKHtcblx0XHRcdGNvbnRhaW5lciA6ICdnYW50dC1jb250YWluZXInLFxuXHRcdFx0aGVpZ2h0OiA1ODAsXG5cdFx0XHR3aWR0aDogc2V0dGluZy5zY3JlZW5XaWR0aCAtIHNldHRpbmcudEhpZGRlbldpZHRoIC0gMjAsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0eDogcG9zLngsXG5cdFx0XHRcdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5GbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcih7fSk7XG5cdFx0dGhpcy5CbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcih7fSk7XG5cdFx0XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5hcHAudGFza3MsICdjaGFuZ2U6c29ydGluZGV4JywgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnJlbmRlclJlcXVlc3QoKTtcblx0XHR9KTtcblxuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmICghcGFyc2VJbnQobW9kZWwuZ2V0KCdwYXJlbnRpZCcpLCAxMCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cHMucHVzaChuZXcgQmFyR3JvdXAoe1xuXHRcdFx0XHRtb2RlbDogbW9kZWwsXG5cdFx0XHRcdHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xuXHRcdFx0fSkpO1xuXG5cdFx0XHR2YXIgZ3NldHRpbmcgPSAgdGhpcy5hcHAuc2V0dGluZ3MuZ2V0U2V0dGluZygnZ3JvdXAnKTtcblx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZID0gZ3NldHRpbmcuaW5pWTtcblxuXHRcdFx0dGhpcy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbihncm91cGkpIHtcblx0XHRcdFx0Z3JvdXBpLnNldFkoZ3NldHRpbmcuY3VycmVudFkpO1xuXHRcdFx0XHRnc2V0dGluZy5jdXJyZW50WSArPSBncm91cGkuZ2V0SGVpZ2h0KCk7XG5cdFx0XHRcdHRoaXMuRmxheWVyLmFkZChncm91cGkuZ3JvdXApO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdHRoaXMucmVuZGVyZ3JvdXBzKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5pbml0aWFsaXplRnJvbnRMYXllcigpO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZUJhY2tMYXllcigpO1xuXHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHR9LFxuXHRyZW5kZXJSZXF1ZXN0IDogKGZ1bmN0aW9uKCkge1xuXHRcdHZhciB3YWl0aW5nID0gZmFsc2U7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0Y29uc29sZS5lcnJvcignY2hhbmdlIHNvcnQnKTtcblx0XHRcdGlmICh3YWl0aW5nKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHdhaXRpbmcgPSB0cnVlO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5yZW5kZXJncm91cHMoKTtcblx0XHRcdFx0d2FpdGluZyA9IGZhbHNlO1xuXHRcdFx0fS5iaW5kKHRoaXMpLCAxMCk7XG5cdFx0fTtcblx0fSkoKSxcblx0aW5pdGlhbGl6ZUJhY2tMYXllcjpmdW5jdGlvbigpe1xuXHRcdHZhciBzaGFwZSA9IG5ldyBLaW5ldGljLlNoYXBlKHtcblx0XHRcdHN0cm9rZTogJyNiYmInLFxuXHRcdFx0c3Ryb2tlV2lkdGg6IDAsXG5cdFx0XHRzY2VuZUZ1bmM6dGhpcy5nZXRTY2VuZUZ1bmMoKVxuXHRcdH0pO1xuXHRcdHRoaXMuQmxheWVyLmFkZChzaGFwZSk7XG5cdFx0XG5cdH0sXG5cdGluaXRpYWxpemVGcm9udExheWVyOmZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0XCJ1c2Ugc3RyaWN0XCI7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHRoaXMuYWRkR3JvdXAodGFzayk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdH0sXG5cdGJpbmRFdmVudHM6ZnVuY3Rpb24oKXtcblx0XHR2YXIgY2FsY3VsYXRpbmc9ZmFsc2U7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmFjdGl2ZScsIHRoaXMucmVuZGVyZ3JvdXBzKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmFwcC5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgdGhpcy5yZW5kZXJCYXJzKTtcblx0XHQkKCcjZ2FudHQtY29udGFpbmVyJykubW91c2V3aGVlbChmdW5jdGlvbihlKXtcblx0XHRcdGlmKGNhbGN1bGF0aW5nKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHZhciBjZHBpID0gIHRoaXMuc2V0dGluZ3MuZ2V0KCdkcGknKSwgZHBpPTA7XG5cdFx0XHRjYWxjdWxhdGluZz10cnVlO1xuXHRcdFx0aWYgKGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhID4gMCl7XG5cdFx0XHRcdGRwaSA9IE1hdGgubWF4KDEsIGNkcGkgLSAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRwaSA9IGNkcGkgKyAxO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGRwaSA9PT0gMSl7XG5cdFx0XHRcdGlmICggdGhpcy5hcHAuc2V0dGluZ3MuZ2V0KCdpbnRlcnZhbCcpID09PSAnYXV0bycpIHtcblx0XHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZ3Muc2V0KHtpbnRlcnZhbDonZGFpbHknfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCB0aGlzLmFwcC5zZXR0aW5ncy5zZXQoe2ludGVydmFsOiAnYXV0bycsIGRwaTogZHBpfSk7XG5cdFx0XHR9XG5cdFx0XHRjYWxjdWxhdGluZyA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRpZiAoY2FsY3VsYXRpbmcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR2YXIgY2RwaSA9ICB0aGlzLmFwcC5zZXR0aW5ncy5nZXQoJ2RwaScpLCBkcGk9MDtcblx0XHRjYWxjdWxhdGluZyAgPXRydWU7XG5cdFx0ZHBpID0gTWF0aC5tYXgoMCwgY2RwaSArIDI1KTtcblxuXHRcdGlmIChkcGkgPT09IDEpIHtcblx0XHRcdGlmKCB0aGlzLmFwcC5zZXR0aW5ncy5nZXQoJ2ludGVydmFsJyk9PT0nYXV0bycpIHtcblx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmdzLnNldCh7aW50ZXJ2YWw6J2RhaWx5J30pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQgdGhpcy5hcHAuc2V0dGluZ3Muc2V0KHtpbnRlcnZhbDogJ2F1dG8nLCBkcGk6IGRwaX0pO1xuXHRcdH1cblxuXHRcdGNhbGN1bGF0aW5nID0gZmFsc2U7XG5cdFx0JCgnI2dhbnR0LWNvbnRhaW5lcicpLm9uKCdkcmFnbW92ZScsIGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjYWxjdWxhdGluZykge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR2YXIgY2RwaSA9ICB0aGlzLmFwcC5zZXR0aW5ncy5nZXQoJ2RwaScpLCBkcGk9MDtcblx0XHRcdGNhbGN1bGF0aW5nID0gdHJ1ZTtcblx0XHRcdGRwaSA9IGNkcGkgKyAxO1xuXG5cdFx0XHRpZihkcGk9PT0xKXtcblx0XHRcdFx0aWYgKCB0aGlzLmFwcC5zZXR0aW5ncy5nZXQoJ2ludGVydmFsJykgPT09ICdhdXRvJykge1xuXHRcdFx0XHRcdCB0aGlzLmFwcC5zZXR0aW5ncy5zZXQoe2ludGVydmFsOiAnZGFpbHknfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCB0aGlzLmFwcC5zZXR0aW5ncy5zZXQoe2ludGVydmFsOidhdXRvJyxkcGk6ZHBpfSk7XG5cdFx0XHR9XG5cdFx0XHRjYWxjdWxhdGluZyA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cblx0YWRkR3JvdXA6IGZ1bmN0aW9uKHRhc2tncm91cCkge1xuXHRcdHRoaXMuZ3JvdXBzLnB1c2gobmV3IEJhckdyb3VwKHtcblx0XHRcdG1vZGVsOiB0YXNrZ3JvdXAsXG5cdFx0XHRzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdzXG5cdFx0fSkpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgZ3NldHRpbmcgPSAgdGhpcy5hcHAuc2V0dGluZ3MuZ2V0U2V0dGluZygnZ3JvdXAnKTtcblxuXHRcdGdzZXR0aW5nLmN1cnJlbnRZID0gZ3NldHRpbmcuaW5pWTtcblx0XHRcblx0XHR0aGlzLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uKGdyb3VwaSkge1xuXHRcdFx0Z3JvdXBpLnNldFkoZ3NldHRpbmcuY3VycmVudFkpO1xuXHRcdFx0Z3NldHRpbmcuY3VycmVudFkgKz0gZ3JvdXBpLmdldEhlaWdodCgpO1xuXHRcdFx0dGhpcy5GbGF5ZXIuYWRkKGdyb3VwaS5ncm91cCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXG5cdFx0Ly9sb29wIHRocm91Z2ggZ3JvdXBzXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZ3JvdXBzLmxlbmd0aDsgaSsrKXtcblxuXHRcdFx0Ly9sb29wIHRocm91Z2ggdGFza3Ncblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbi5sZW5ndGg7IGorKyl7XG5cblx0XHRcdFx0Ly9pZiB0aHJlcmUgaXMgZGVwZW5kZW5jeVxuXHRcdFx0XHRpZiAodGhpcy5ncm91cHNbaV0uY2hpbGRyZW5bal0ubW9kZWwuYXR0cmlidXRlcy5kZXBlbmRlbmN5ICE9PSAnJyl7XG5cblx0XHRcdFx0XHQvL3BhcnNlIGRlcGVuZGVuY2llc1xuXHRcdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gJC5wYXJzZUpTT04odGhpcy5ncm91cHNbaV0uY2hpbGRyZW5bal0ubW9kZWwuYXR0cmlidXRlcy5kZXBlbmRlbmN5KTtcblxuXHRcdFx0XHRcdGZvcih2YXIgbD0wOyBsIDwgZGVwZW5kZW5jeS5sZW5ndGg7IGwrKyl7XG5cdFx0XHRcdFx0XHRmb3IoIHZhciBrPTA7IGsgPCB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbi5sZW5ndGg7IGsrKyl7XG5cdFx0XHRcdFx0XHRcdGlmIChkZXBlbmRlbmN5W2xdID09IHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2tdLm1vZGVsLmF0dHJpYnV0ZXMuaWQgKXtcblx0XHRcdFx0XHRcdFx0XHRCYXIuY3JlYXRlUmVsYXRpb24odGhpcy5ncm91cHNbaV0uY2hpbGRyZW5bal0sIHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2tdKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnN0YWdlLmFkZCh0aGlzLkJsYXllcik7XG5cdFx0dGhpcy5zdGFnZS5hZGQodGhpcy5GbGF5ZXIpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHJlbmRlckJhcnM6ZnVuY3Rpb24oKXtcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZ3JvdXBzLmxlbmd0aDtpKyspe1xuXHRcdFx0dGhpcy5ncm91cHNbaV0ucmVuZGVyQ2hpbGRyZW4oKTtcblx0XHR9IFxuXHRcdHRoaXMuRmxheWVyLmRyYXcoKTtcblx0XHR0aGlzLkJsYXllci5kcmF3KCk7XG5cdH0sXG5cblx0cmVuZGVyZ3JvdXBzOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIGdzZXR0aW5nID0gIHRoaXMuYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHRoaXMuZ3JvdXBzLCBmdW5jdGlvbihpdGVtdmlldyl7XG5cdFx0XHRyZXR1cm4gaXRlbXZpZXcubW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHR9KTtcblx0XHRnc2V0dGluZy5jdXJyZW50WSA9IGdzZXR0aW5nLmluaVk7XG5cdFx0c29ydGVkLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRncm91cGkuc2V0WShnc2V0dGluZy5jdXJyZW50WSk7XG5cdFx0XHRncm91cGkucmVuZGVyU29ydGVkQ2hpbGRyZW4oKTtcblx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZICs9IGdyb3VwaS5nZXRIZWlnaHQoKTtcblx0XHR9KTtcblx0XHR0aGlzLkZsYXllci5kcmF3KCk7XG5cdH0sXG5cdHNldFdpZHRoOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuc3RhZ2Uuc2V0V2lkdGgodmFsdWUpO1xuXHR9LFxuXHRnZXRTY2VuZUZ1bmM6ZnVuY3Rpb24oKXtcblx0XHR2YXIgc2V0dGluZyA9IHRoaXMuYXBwLnNldHRpbmdzO1xuXHRcdHZhciBzZGlzcGxheSA9IHNldHRpbmcuc2Rpc3BsYXk7XG5cdFx0dmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcblx0XHR2YXIgb2Zmc2V0ID0gYm9yZGVyV2lkdGgvMjtcblx0XHR2YXIgcm93SGVpZ2h0ID0gMjA7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XG5cdFx0XHR2YXIgc2F0dHIgPSBzZXR0aW5nLnNhdHRyO1xuXHRcdFx0dmFyIGksIHMgPSAwLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XG5cdFx0XHRcblx0XHRcdHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0Ly9kcmF3IHRocmVlIGxpbmVzXG5cdFx0XHRmb3IoaSA9IDE7IGkgPCA0IDsgaSsrKXtcblx0XHRcdFx0Y29udGV4dC5tb3ZlVG8ob2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcblx0XHRcdFx0Y29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcblx0XHRcdGZvciAocyA9IDE7IHMgPCAzOyBzKyspe1xuXHRcdFx0XHR4PTAsbGVuZ3RoPTA7XG5cdFx0XHRcdGZvcihpPTAsaUxlbj1oRGF0YVtzXS5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdFx0bGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uKmRheXNXaWR0aDtcblx0XHRcdFx0XHR4ID0geCtsZW5ndGg7XG5cdFx0XHRcdFx0eGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XG5cdFx0XHRcdFx0Y29udGV4dC5tb3ZlVG8oeGkseWkpO1xuXHRcdFx0XHRcdGNvbnRleHQubGluZVRvKHhpLHlmKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMTBwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeC1sZW5ndGgvMix5Zi1yb3dIZWlnaHQvMik7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0eWk9eWYseWY9IHlmK3Jvd0hlaWdodDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0eD0wLGxlbmd0aD0wLHM9Myx5Zj0xMjAwO1xuXHRcdFx0dmFyIGRyYWdJbnQgPSBwYXJzZUludChzYXR0ci5kcmFnSW50ZXJ2YWwpO1xuXHRcdFx0dmFyIGhpZGVEYXRlID0gZmFsc2U7XG5cdFx0XHRpZiggZHJhZ0ludCA9PSAxNCB8fCBkcmFnSW50ID09IDMwKXtcblx0XHRcdFx0aGlkZURhdGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKGk9MCxpTGVuPWhEYXRhW3NdLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0bGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uKmRheXNXaWR0aDtcblx0XHRcdFx0eCA9IHgrbGVuZ3RoO1xuXHRcdFx0XHR4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcblx0XHRcdFx0Y29udGV4dC5tb3ZlVG8oeGkseWkpO1xuXHRcdFx0XHRjb250ZXh0LmxpbmVUbyh4aSx5Zik7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2xlZnQnO1xuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuXHRcdFx0XHQvLyBkYXRlIGhpZGUgb24gc3BlY2lmaWMgdmlld3Ncblx0XHRcdFx0aWYgKGhpZGVEYXRlKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMXB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4LWxlbmd0aCs0MCx5aStyb3dIZWlnaHQvMik7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xuXG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LnN0cm9rZVNoYXBlKHRoaXMpO1xuXHRcdH07XG5cdH0sXG5cdHJlbmRlckJhY2tMYXllcjogZnVuY3Rpb24oKXtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gS0NhbnZhc1ZpZXc7IiwiZnVuY3Rpb24gQ29udGV4dE1lbnVWaWV3KGFwcCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLmFwcCA9IGFwcDtcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ2RpdicsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMucGFyZW50KCkpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuYXBwLnRhc2tzLmdldChpZCk7XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2RlbGV0ZScpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Byb3BlcnRpZXMnKXtcclxuICAgICAgICAgICAgICAgIHZhciAkcHJvcGVydHkgPSAnLnByb3BlcnR5LSc7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcxMDgnOiAnUmVhZHknLFxyXG4gICAgICAgICAgICAgICAgICAgICcxMDknOiAnT3BlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzExMCc6ICdDb21wbGV0ZSdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgJGVsID0gJChkb2N1bWVudCk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ25hbWUnKS5odG1sKG1vZGVsLmdldCgnbmFtZScpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZGVzY3JpcHRpb24nKS5odG1sKG1vZGVsLmdldCgnZGVzY3JpcHRpb24nKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXJ0JykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZW5kJykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXR1cycpLmh0bWwoc3RhdHVzW21vZGVsLmdldCgnc3RhdHVzJyldKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHJcbiAgICAgICAgICAgICAgICBpZihzdGFydGRhdGUgIT0gXCJcIiAmJiBlbmRkYXRlICE9IFwiXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydkdXJhdGlvbicpLmh0bWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJCgnLnVpLnByb3BlcnRpZXMnKS5tb2RhbCgnc2V0dGluZycsICd0cmFuc2l0aW9uJywgJ3ZlcnRpY2FsIGZsaXAnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tb2RhbCgnc2hvdycpXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY29udmVydERhdGUoaW5wdXRGb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBwYWQocykgeyByZXR1cm4gKHMgPCAxMCkgPyAnMCcgKyBzIDogczsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoaW5wdXRGb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbcGFkKGQuZ2V0RGF0ZSgpKSwgcGFkKGQuZ2V0TW9udGgoKSsxKSwgZC5nZXRGdWxsWWVhcigpXS5qb2luKCcvJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QWJvdmUnKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdpbmRlbnQnKXtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmV4cGFuZC1tZW51JykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsX2lkID0gJCh0aGlzKS5jbG9zZXN0KCdkaXYnKS5wcmV2KCkuZmluZCgnLnN1Yi10YXNrJykubGFzdCgpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldk1vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KHJlbF9pZCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50X2lkID0gcHJldk1vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgncGFyZW50aWQnLCBwYXJlbnRfaWQpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvYmVDaGlsZCA9ICQodGhpcykubmV4dCgpLmNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0b2JlQ2hpbGQsIGZ1bmN0aW9uKGluZGV4LCBkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRJZCA9ICQodGhpcykuYXR0cignaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLHBhcmVudF9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3Rhc2snKS5hZGRDbGFzcygnc3ViLXRhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMzBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdwYXJlbnRpZCcsMCk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9iZUNoaWxkID0gJCh0aGlzKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJJbmRleCA9ICQodGhpcykuaW5kZXgoKTtcclxuICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKHRvYmVDaGlsZCwgZnVuY3Rpb24oaW5kZXgsIGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID4gY3VyckluZGV4KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZE1vZGVsID0gc2VsZi5hcHAudGFza3MuZ2V0KGNoaWxkSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLG1vZGVsLmdldCgnaWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wcmVwZW5kKCc8bGkgY2xhc3M9XCJleHBhbmQtbWVudVwiPjxpIGNsYXNzPVwidHJpYW5nbGUgdXAgaWNvblwiPjwvaT4gPC9saT4nKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3N1Yi10YXNrJykuYWRkQ2xhc3MoJ3Rhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy5yZW5kZXJncm91cHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7bmFtZTogXCJOZXcgUm93IEFib3ZlXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHtuYW1lOiBcIk5ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHtuYW1lOiBcIkluZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7bmFtZTogXCJPdXRkZW50IFJvd1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7bmFtZTogXCJQcm9wZXJ0aWVzXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjoge25hbWU6IFwiRGVsZXRlIFJvd1wiLCBpY29uOiBcIlwifVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmFwcC50YXNrcy5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgfVxyXG4gICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcbiAgICBkYXRhLnBhcmVudGlkID0gcmVmX21vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgIHZhciB0YXNrID0gdGhpcy5hcHAudGFza3MuYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwiXG52YXIgdGVtcGxhdGUgPSBcIjxkaXY+XFxyXFxuICAgIDx1bD5cXHJcXG4gICAgICAgIDwlIHZhciBzZXR0aW5nPWFwcC5zZXR0aW5nczslPlxcclxcbiAgICAgICAgPCUgaWYoaXNQYXJlbnQpeyAlPiA8bGkgY2xhc3M9XFxcImV4cGFuZC1tZW51XFxcIj48aSBjbGFzcz1cXFwidHJpYW5nbGUgZG93biBpY29uXFxcIj48L2k+PC9saT48JSB9ICU+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1uYW1lXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcIm5hbWVcXFwiLG5hbWUpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtc3RhcnRcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhcnRcXFwiLHN0YXJ0KSk7JT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZW5kXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImVuZFxcXCIsZW5kKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWNvbXBsZXRlXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImNvbXBsZXRlXFxcIixjb21wbGV0ZSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1zdGF0dXNcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhdHVzXFxcIixzdGF0dXMpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZHVyYXRpb25cXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwiZHVyYXRpb25cXFwiLDAse1xcXCJzdGFydFxcXCI6c3RhcnQsXFxcImVuZFxcXCI6ZW5kfSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcInJlbW92ZS1pdGVtXFxcIj48YnV0dG9uIGNsYXNzPVxcXCJtaW5pIHJlZCB1aSBidXR0b25cXFwiPiA8aSBjbGFzcz1cXFwic21hbGwgdHJhc2ggaWNvblxcXCI+PC9pPjwvYnV0dG9uPjwvbGk+XFxyXFxuICAgIDwvdWw+XFxyXFxuPC9kaXY+XCI7XG5cbnZhciBUYXNrSXRlbVZpZXc9QmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lIDogJ2xpJyxcblx0dGVtcGxhdGU6IF8udGVtcGxhdGUodGVtcGxhdGUpLFxuXHRpc1BhcmVudDogZmFsc2UsXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2VkaXRyb3cnLCB0aGlzLmVkaXQpO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpuYW1lIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6c3RhdHVzJywgdGhpcy5yZW5kZXJSb3cpO1xuXHRcdHRoaXMuJGVsLmhvdmVyKGZ1bmN0aW9uKGUpe1xuXHRcdFx0JChkb2N1bWVudCkuZmluZCgnLml0ZW0tc2VsZWN0b3InKS5zdG9wKCkuY3NzKHtcblx0XHRcdFx0dG9wOiAoJChlLmN1cnJlbnRUYXJnZXQpLm9mZnNldCgpLnRvcCkrJ3B4J1xuXHRcdFx0fSkuZmFkZUluKCk7XG5cdFx0fSwgZnVuY3Rpb24oKXtcblx0XHRcdCQoZG9jdW1lbnQpLmZpbmQoJy5pdGVtLXNlbGVjdG9yJykuc3RvcCgpLmZhZGVPdXQoKTtcblx0XHR9KTtcblx0XHR0aGlzLiRlbC5vbignY2xpY2snLGZ1bmN0aW9uKCl7XG5cdFx0XHQkKGRvY3VtZW50KS5maW5kKCcuaXRlbS1zZWxlY3RvcicpLnN0b3AoKS5mYWRlT3V0KCk7XG5cdFx0fSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24ocGFyZW50KXtcblx0XHR2YXIgYWRkQ2xhc3M9J3N1Yi10YXNrIGRyYWctaXRlbSc7XG5cdFx0XG5cdFx0aWYocGFyZW50KXtcblx0XHRcdGFkZENsYXNzPVwidGFza1wiO1xuXHRcdFx0dGhpcy5pc1BhcmVudCA9IHRydWU7XG5cdFx0XHR0aGlzLnNldEVsZW1lbnQoJCgnPGRpdj4nKSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLmlzUGFyZW50ID0gZmFsc2U7XG5cdFx0XHR0aGlzLnNldEVsZW1lbnQoJCgnPGxpPicpKTtcblx0XHRcdHRoaXMuJGVsLmRhdGEoe1xuXHRcdFx0XHRpZCA6IHRoaXMubW9kZWwuaWRcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLiRlbC5hZGRDbGFzcyhhZGRDbGFzcyk7XG5cdFx0dGhpcy4kZWwuYXR0cignaWQnLCB0aGlzLm1vZGVsLmNpZCk7XG5cdFx0cmV0dXJuIHRoaXMucmVuZGVyUm93KCk7XG5cdH0sXG5cdHJlbmRlclJvdzpmdW5jdGlvbigpe1xuXHRcdHZhciBkYXRhID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmlzUGFyZW50ID0gdGhpcy5pc1BhcmVudDtcblx0XHRkYXRhLmFwcCA9IHRoaXMuYXBwO1xuXHRcdHRoaXMuJGVsLmh0bWwodGhpcy50ZW1wbGF0ZShkYXRhKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGVkaXQ6ZnVuY3Rpb24oZXZ0KXtcblx0XHR2YXIgdGFyZ2V0ID0gJChldnQudGFyZ2V0KTtcblx0XHR2YXIgd2lkdGggID0gcGFyc2VJbnQodGFyZ2V0LmNzcygnd2lkdGgnKSwgMTApIC0gNTtcblx0XHR2YXIgZmllbGQgPSB0YXJnZXQuYXR0cignY2xhc3MnKS5zcGxpdCgnLScpWzFdO1xuXHRcdHZhciBmb3JtID0gdGhpcy5hcHAuc2V0dGluZ3MuZ2V0Rm9ybUVsZW0oZmllbGQsIHRoaXMubW9kZWwsIHRoaXMub25FZGl0LCB0aGlzKTtcblx0XHRmb3JtLmNzcyh7XG5cdFx0XHR3aWR0aDogd2lkdGggKyAncHgnXG5cdFx0fSk7XG5cblx0XHR0YXJnZXQuaHRtbChmb3JtKTtcblx0XHRmb3JtLmZvY3VzKCk7XG5cdH0sXG5cdG9uRWRpdDogZnVuY3Rpb24obmFtZSwgdmFsdWUpe1xuXHRcdGNvbnNvbGUubG9nKG5hbWUsIHZhbHVlKTtcblx0XHRpZiAobmFtZSA9PT0gJ2R1cmF0aW9uJykge1xuXHRcdFx0dmFyIHN0YXJ0ID0gdGhpcy5tb2RlbC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR2YXIgZW5kID0gc3RhcnQuY2xvbmUoKS5hZGREYXlzKHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCdlbmQnLCBlbmQpLnNhdmUoKTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMubW9kZWwuc2V0KG5hbWUsIHZhbHVlKS5zYXZlKCk7XG5cdFx0fVxuXHRcdHRoaXMucmVuZGVyUm93KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tJdGVtVmlldztcbiIsInZhciBUYXNrSXRlbVZpZXcgPSByZXF1aXJlKCcuL1Rhc2tJdGVtVmlldycpO1xuXG52YXIgVGFza1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICdsaScsXG5cdGNsYXNzTmFtZTogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyxcblx0Y29sbGFwc2VkIDogZmFsc2UsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdH0sXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAudGFzayAuZXhwYW5kLW1lbnUnOiAnY29sbGFwc2VPckV4cGFuZCcsXG5cdFx0J2NsaWNrIC5hZGQtaXRlbSBidXR0b24nOiAnYWRkSXRlbScsXG5cdFx0J2NsaWNrIC5yZW1vdmUtaXRlbSBidXR0b24nOiAncmVtb3ZlSXRlbSdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzLm1vZGVsO1xuXHRcdHZhciBpdGVtVmlldyA9IG5ldyBUYXNrSXRlbVZpZXcoe1xuXHRcdFx0bW9kZWwgOiBwYXJlbnQsXG5cdFx0XHRhcHAgOiB0aGlzLmFwcFxuXHRcdH0pO1xuXG5cdFx0dGhpcy4kcGFyZW50ZWwgPSBpdGVtVmlldy5yZW5kZXIodHJ1ZSkuJGVsO1xuXHRcdHRoaXMuJGVsLmFwcGVuZCh0aGlzLiRwYXJlbnRlbCk7XG5cblx0XHR0aGlzLiRlbC5kYXRhKHtcblx0XHRcdGlkIDogcGFyZW50LmlkXG5cdFx0fSk7XG5cdFx0dGhpcy4kY2hpbGRlbCA9ICQoJzxvbCBjbGFzcz1cInN1Yi10YXNrLWxpc3Qgc29ydGFibGVcIj48L29sPicpO1xuXG5cdFx0dGhpcy4kZWwuYXBwZW5kKHRoaXMuJGNoaWxkZWwpO1xuXHRcdHZhciBjaGlsZHJlbiA9IF8uc29ydEJ5KHRoaXMubW9kZWwuY2hpbGRyZW4ubW9kZWxzLCBmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHR9KTtcblx0XHRjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdGl0ZW1WaWV3PW5ldyBUYXNrSXRlbVZpZXcoe1xuXHRcdFx0XHRtb2RlbDogY2hpbGQsXG5cdFx0XHRcdGFwcDogdGhpcy5hcHBcblx0XHRcdH0pO1xuXHRcdFx0aXRlbVZpZXcucmVuZGVyKCk7XG5cdFx0XHR0aGlzLiRjaGlsZGVsLmFwcGVuZChpdGVtVmlldy5lbCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdHRoaXMudG9nZ2xlUGFyZW50KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGNvbGxhcHNlT3JFeHBhbmQ6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsYXBzZWQgPSAhdGhpcy5jb2xsYXBzZWQ7XG5cdFx0dGhpcy5tb2RlbC5zZXQoJ2FjdGl2ZScsICF0aGlzLmNvbGxhcHNlZCk7XG5cdFx0dGhpcy50b2dnbGVQYXJlbnQoKTtcblx0fSxcblx0dG9nZ2xlUGFyZW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RyID0gdGhpcy5jb2xsYXBzZWQgPyAnPGkgY2xhc3M9XCJ0cmlhbmdsZSB1cCBpY29uXCI+PC9pPiAnIDogJzxpIGNsYXNzPVwidHJpYW5nbGUgZG93biBpY29uXCI+PC9pPic7XG5cdFx0dGhpcy4kY2hpbGRlbC5zbGlkZVRvZ2dsZSgpO1xuXHRcdHRoaXMuJHBhcmVudGVsLmZpbmQoJy5leHBhbmQtbWVudScpLmh0bWwoc3RyKTtcblx0fSxcblx0YWRkSXRlbTogZnVuY3Rpb24oZXZ0KXtcblx0XHQkKGV2dC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd1bCcpLm5leHQoKS5hcHBlbmQoJzx1bCBjbGFzcz1cInN1Yi10YXNrXCIgaWQ9XCJjJytNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMTAwMDApICsgMSkrJ1wiPjxsaSBjbGFzcz1cImNvbC1uYW1lXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJOZXcgcGxhblwiIHNpemU9XCIzOFwiPjwvbGk+PGxpIGNsYXNzPVwiY29sLXN0YXJ0XCI+PGlucHV0IHR5cGU9XCJkYXRlXCIgcGxhY2Vob2xkZXI9XCJTdGFydCBEYXRlXCIgc3R5bGU9XCJ3aWR0aDo4MHB4O1wiPjwvbGk+PGxpIGNsYXNzPVwiY29sLWVuZFwiPjxpbnB1dCB0eXBlPVwiZGF0ZVwiIHBsYWNlaG9sZGVyPVwiRW5kIERhdGVcIiBzdHlsZT1cIndpZHRoOjgwcHg7XCI+PC9saT48bGkgY2xhc3M9XCJjb2wtY29tcGxldGVcIj48aW5wdXQgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiMlwiIHN0eWxlPVwid2lkdGg6IDMwcHg7bWFyZ2luLWxlZnQ6IC0xNHB4O1wiIG1pbj1cIjBcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1zdGF0dXNcIj48c2VsZWN0IHN0eWxlPVwid2lkdGg6IDcwcHg7XCI+PG9wdGlvbiB2YWx1ZT1cImluY29tcGxldGVcIj5Jbm9tcGxldGVkPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cImNvbXBsZXRlZFwiPkNvbXBsZXRlZDwvb3B0aW9uPjwvc2VsZWN0PjwvbGk+PGxpIGNsYXNzPVwiY29sLWR1cmF0aW9uXCI+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIjI0XCIgc3R5bGU9XCJ3aWR0aDogMzJweDttYXJnaW4tbGVmdDogLThweDtcIiBtaW49XCIwXCI+IGQ8L2xpPjxsaSBjbGFzcz1cInJlbW92ZS1pdGVtXCI+PGJ1dHRvbiBjbGFzcz1cIm1pbmkgcmVkIHVpIGJ1dHRvblwiPiA8aSBjbGFzcz1cInNtYWxsIHRyYXNoIGljb25cIj48L2k+PC9idXR0b24+PC9saT48L3VsPicpLmhpZGUoKS5zbGlkZURvd24oKTtcblx0fSxcblx0cmVtb3ZlSXRlbTogZnVuY3Rpb24oZXZ0KXtcblx0XHR2YXIgJHBhcmVudFVMID0gJChldnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnb2wgdWwnKS5wYXJlbnQoKS5wYXJlbnQoKTtcblx0XHR2YXIgaWQgPSAkcGFyZW50VUwuYXR0cignaWQnKTtcblx0XHR2YXIgdGFza01vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KGlkKTtcblx0XHRpZigkcGFyZW50VUwuaGFzQ2xhc3MoJ3Rhc2snKSl7XG5cdFx0XHQkcGFyZW50VUwubmV4dCgnb2wnKS5mYWRlT3V0KDEwMDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHR9KTtcblx0XHR9ZWxzZXtcblx0XHRcdCQoZXZ0LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3VsJykuZmFkZU91dCgxMDAwLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHRhc2tNb2RlbC5kZXN0cm95KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tWaWV3O1xuIl19
