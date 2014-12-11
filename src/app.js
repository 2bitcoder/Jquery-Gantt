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
			model.set('sortindex', ++sortIndex);
			model.children.each(function(child) {
				child.set('sortindex', ++sortIndex);
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
					console.error('can not find parent with id ' + model.get('parentid'));
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
			rectoption: {
				strokeEnabled: false,
				fill: 'grey'
			},
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
var util = require('../utils/util');var params = util.getURLParams();var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,        action: '',        active : true,        sortindex: 0,        dependency:'',        resources: {},        status: 110,        health: 21,        start: '',        end: '',        ProjectRef : params.project,        WBS_ID : params.profile,        color:'#0090d3',        lightcolor: '#E6F0FF',        darkcolor: '#e88134',        aType: '',        reportable: '',        parentid: 0    },    initialize : function() {        "use strict";        this.children = new Backbone.Collection();        this.listenTo(this.children, 'change:parentid', function(child) {            this.children.remove(child);        });        this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);        this.listenTo(this, 'destroy', function() {            this.children.each(function(child) {                child.destroy();            });        });    },    parse: function(response) {        if(_.isString(response.start)){            response.start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            response.start = new Date();        }                if(_.isString(response.end)){            response.end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            response.end = new Date();        }        response.parentid = parseInt(response.parentid || '0', 10);        // remove null params        _.each(response, function(val, key) {            if (!val) {                response[key] = undefined;            }        });        return response;    },    _checkTime : function() {        if (this.children.length === 0) {            return;        }        var startTime = this.children.at(0).get('start');        var endTime = this.children.at(0).get('end');        this.children.each(function(child) {            var childStartTime = child.get('start');            var childEndTime = child.get('end');            if(childStartTime.compareTo(startTime) === -1) {                startTime = childStartTime;            }            if(childEndTime.compareTo(endTime) === 1){                endTime = childEndTime;            }        }.bind(this));        this.set('start', startTime);        this.set('end', endTime);    }});module.exports = TaskModel;
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
		//this.barid = _.uniqueId('b');
		this.subgroupoptions={
			showOnHover: true,
			hideOnHoverOut:true,
			hasSubGroup: false,
		};
		
		this.dependants=[];
		this.dependencies=[];
		
		/*var option={
			x : rectoptions.x,
			y: rectoptions.y
		}
		rectoptions.x=0;
		rectoptions.y=0;
		rectoptions.name='mainbar';*/

		// coloring section
		var parentModel = this.model.collection.get(this.model.get('parentid'));
		this.setting.rectoption.fill = parentModel.get('lightcolor');		
		this.group=new Kinetic.Group(this.getGroupParams());
		//remove the strokeEnabled if not provided in option
		//rectoptions.strokeEnabled=false;

		var rect = this.rect  =new Kinetic.Rect(this.getRectparams());
		this.group.add(rect);
		
		if(setting.subgroup){
			this.addSubgroup();
		}
		
		if(setting.draggable){
			this.makeDraggable();
		}
		
		if(setting.resizable){
			this.makeResizable();
		}

		var leftx=this.leftHandle.getX();
		var w=this.rightHandle.getX()-leftx+2;
		var width = ( ( w ) * (this.model.get('complete') / 100) );
		this.setting.rectoption.fill = parentModel.get('darkcolor');
		opt =  this.getRectparams();
		opt.x = 2;
		opt.width = width-4;
		var completeBar= this.completeBar = new Kinetic.Rect(opt);
		this.group.add(completeBar);
		if (width === 0) {
			completeBar.hide();
		}

		//addEvents
		this.bindEvents();
		//this.on('resize move',this.renderConnectors,this);;
	};

	Bar.prototype={
		_updateCompleteBar : function() {
			var leftx=this.leftHandle.getX();
			var w = this.rightHandle.getX() - leftx+2;
			var width = ( ( w ) * (this.model.get('complete') / 100) ) - 4;

			if(width > 0){
				this.completeBar.width(width);
				this.completeBar.show();
				this.completeBar.getLayer().batchDraw();
			}
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
				var width =( this.getWidth() * (this.model.get('complete') / 100) )-4;
				if(width > 0)
					this.completeBar.setWidth(width);
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
				var width =( this.getWidth() * (this.model.get('complete') / 100) )-4;
				if(width > 0)
					this.completeBar.setWidth(width);
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
				this.draw();
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
				that.trigger('resizeleft',that);
				that.trigger('resize',that);
				that.triggerParent('resize');
			}));
			this.rightHandle.on('dragmove',beforebind(function(){
				that.render();
				that.trigger('resizeright',that);
				that.trigger('resize',that);
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
		
		makeDraggable: function(option){
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
		changeResizeCursor:function(type){
			document.body.style.cursor = 'ew-resize';
		},
		changeDefaultCursor:function(type){
			document.body.style.cursor = 'default';
		},
		//renders the handle by its rect
		renderHandle:function(){
			if(!this.resizable) return false;
			var x=this.rect.getX();
			this.leftHandle.setX(x);
			this.rightHandle.setX(x+this.rect.getWidth()-2);
		},
		
		
		//renders the bar by the handles
		render: function(){
			var leftx=this.leftHandle.getX();
			var width=this.rightHandle.getX()-leftx+2;
			this.group.setX(this.group.getX()+leftx);
			this.leftHandle.setX(0);
			this.rightHandle.setX(width-2);
			this.rect.setWidth(width);
			var width2 = this.rect.getWidth()  * (this.model.get('complete') / 100);
			if(width2)
				this.completeBar.setWidth(width2 - 4);
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
			if(dx===0) return;
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
		calculateX:function(model){
			!model && (model=this.model);
			var attrs= this.settings.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			return {
				x1:(Date.daysdiff(boundaryMin,model.get('start')))*daysWidth,
				x2:Date.daysdiff(boundaryMin,model.get('end'))*daysWidth,
			};
		},
		calculateDates:function(){
			var attrs=this.settings.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			var days1=Math.round(this.getX1(true)/daysWidth),days2=Math.round(this.getX2(true)/daysWidth);
			
			return {
				start: boundaryMin.clone().addDays(days1),
				end:boundaryMin.clone().addDays(days2-1)
			}
			
		},
		getRectparams:function(){
			var setting=this.setting;
			var xs  =this.calculateX(this.model);
			// console.log(this.model.get('complete'));
			return _.extend({
				x:0,
				width:xs.x2-xs.x1,
				y: 0,
				name:'mainbar',
				height:setting.barheight
			},setting.rectoption);
		},
		getGroupParams:function(){
			var xs=this.calculateX(this.model);
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
//			this.group.getLayer().draw();
		},
		draw:function(){
			this.group.getLayer().draw();

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
			var x=bar.getX1(true);
			//make bar x relative to this group
			bar.setParent(this);
			bar.setX1(x,{absolute:true,silent:true});
			bar.setY(this.getHeight()+this.setting.gap);
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
			var days1 = Math.round(this.getX1(true)/daysWidth),days2=Math.round(this.getX2(true)/daysWidth);
			return {
				start: boundaryMin.clone().addDays(days1),
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
			this.model.set({
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
		
		this.listenTo( this.app.tasks, 'change:sortindex', this.renderRequest);

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
		console.log('render');
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
		if (name === 'duration') {
			var start = this.model.get('start');
			var end = start.clone().addDays(parseInt(value, 10) - 1);
//			this.model.set('end', end);
		}
		else{
			console.error(name);
			this.model.set(name, value);
			this.model.save();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9mYWtlXzY2OTBkZjYyLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9BZGRGb3JtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzL0Jhci5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzL0Jhckdyb3VwLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXMvS0NhbnZhc1ZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuYUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmwgOiAnYXBpL3Rhc2tzJyxcblx0bW9kZWw6IFRhc2tNb2RlbCxcblx0aW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3Vic2NyaWJlKCk7XG5cdH0sXG5cdGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xuXHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHR9LFxuXHRsaW5rQ2hpbGRyZW4gOiBmdW5jdGlvbigpIHtcblx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGFyZW50VGFzayA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChwYXJlbnRUYXNrKSB7XG5cdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcigndGFzayBoYXMgcGFyZW50IHdpdGggaWQgJyArIHRhc2suZ2V0KCdwYXJlbnRpZCcpICsgJyAtIGJ1dCB0aGVyZSBpcyBubyBzdWNoIHRhc2snKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdGNoZWNrU29ydGVkSW5kZXggOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gMDtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdG1vZGVsLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0bW9kZWwuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRjaGlsZC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHRoaXMudHJpZ2dlcigncmVzb3J0Jyk7XG5cdH0sXG5cdHJlc29ydCA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gMDtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmVudERhdGEpIHtcblx0XHRcdHZhciBwYXJlbnRNb2RlbCA9IHRoaXMuZ2V0KHBhcmVudERhdGEuaWQpO1xuXHRcdFx0dmFyIHByZXZTb3J0ID0gcGFyZW50TW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHRcdGlmIChwcmV2U29ydCAhPT0gKytzb3J0SW5kZXgpIHtcblx0XHRcdFx0cGFyZW50TW9kZWwuc2V0KCdzb3J0aW5kZXgnLCBzb3J0SW5kZXgpLnNhdmUoKTtcblx0XHRcdH1cblx0XHRcdGlmIChwYXJlbnRNb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cGFyZW50TW9kZWwuc2V0KCdwYXJlbnRpZCcsIDApLnNhdmUoKTtcblx0XHRcdH1cblx0XHRcdHBhcmVudERhdGEuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZERhdGEpIHtcblx0XHRcdFx0dmFyIGNoaWxkTW9kZWwgPSBzZWxmLmdldChjaGlsZERhdGEuaWQpO1xuXHRcdFx0XHR2YXIgcHJldlNvcnRJID0gY2hpbGRNb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdFx0XHRpZiAocHJldlNvcnRJICE9PSArK3NvcnRJbmRleCkge1xuXHRcdFx0XHRcdGNoaWxkTW9kZWwuc2V0KCdzb3J0aW5kZXgnLCBzb3J0SW5kZXgpLnNhdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoY2hpbGRNb2RlbC5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudE1vZGVsLmlkKSB7XG5cdFx0XHRcdFx0Y2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJywgcGFyZW50TW9kZWwuaWQpLnNhdmUoKTtcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gc2VsZi5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRcdHJldHVybiBtLmlkID09PSBwYXJlbnRNb2RlbC5pZDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKGNoaWxkTW9kZWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRzdWJzY3JpYmUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrQ29sbGVjdGlvbjtcblxuIiwiXG52YXIgVGFza0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uJyk7XG52YXIgU2V0dGluZ3MgPSByZXF1aXJlKCcuL21vZGVscy9TZXR0aW5nTW9kZWwnKTtcblxudmFyIEdhbnR0VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvR2FudHRWaWV3Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbCcpO1xuXG4kKGZ1bmN0aW9uICgpIHtcblx0dmFyIGFwcCA9IHt9O1xuXHRhcHAudGFza3MgPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcblxuXHQvLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xN1xuXHR2YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblx0aWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlKSB7XG5cdFx0YXBwLnRhc2tzLnVybCA9ICdhcGkvdGFza3MvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGU7XG5cdH1cblxuXHRhcHAudGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3MgOiBmdW5jdGlvbigpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdTdWNjZXNzIGxvYWRpbmcgdGFza3MuJyk7XG5cdFx0XHRhcHAuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3Moe30sIHthcHAgOiBhcHB9KTtcblx0XHRcdGFwcC50YXNrcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdG5ldyBHYW50dFZpZXcoe1xuXHRcdFx0XHRhcHAgOiBhcHAsXG5cdFx0XHRcdGNvbGxlY3Rpb24gOiBhcHAudGFza3Ncblx0XHRcdH0pLnJlbmRlcigpO1xuXHRcdFx0JCgnI2xvYWRlcicpLmZhZGVPdXQoKTtcblx0XHR9LFxuXHRcdGVycm9yIDogZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdlcnJvciBsb2FkaW5nJyk7XG5cdFx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0fVxuXHR9LCB7cGFyc2U6IHRydWV9KTtcbn0pO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XG5cbnZhciBhcHAgPSB7fTtcblxudmFyIGhmdW5jID0gZnVuY3Rpb24ocG9zLCBldnQpIHtcblx0dmFyIGRyYWdJbnRlcnZhbCA9IGFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJywgJ2RyYWdJbnRlcnZhbCcpO1xuXHR2YXIgbiA9IE1hdGgucm91bmQoKHBvcy54IC0gZXZ0LmluaXBvcy54KSAvIGRyYWdJbnRlcnZhbCk7XG5cdHJldHVybiB7XG5cdFx0eDogZXZ0LmluaXBvcy54ICsgbiAqIGRyYWdJbnRlcnZhbCxcblx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdH07XG59O1xuXG52YXIgU2V0dGluZ01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpbnRlcnZhbDogJ2ZpeCcsXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxuXHRcdGRwaTogMVxuXHR9LFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycywgcGFyYW1zKSB7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdGFwcCA9IHRoaXMuYXBwO1xuXHRcdHRoaXMuc2F0dHIgPSB7XG5cdFx0XHRoRGF0YToge30sXG5cdFx0XHRkcmFnSW50ZXJ2YWw6IDEsXG5cdFx0XHRkYXlzV2lkdGg6IDUsXG5cdFx0XHRjZWxsV2lkdGg6IDM1LFxuXHRcdFx0bWluRGF0ZTogbmV3IERhdGUoMjAyMCwxLDEpLFxuXHRcdFx0bWF4RGF0ZTogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNaW46IG5ldyBEYXRlKDAsMCwwKSxcblx0XHRcdGJvdW5kYXJ5TWF4OiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHQvL21vbnRocyBwZXIgY2VsbFxuXHRcdFx0bXBjOiAxXG5cdFx0fTtcblxuXHRcdHRoaXMuc2Rpc3BsYXkgPSB7XG5cdFx0XHRzY3JlZW5XaWR0aDogICQoJyNnYW50dC1jb250YWluZXInKS5pbm5lcldpZHRoKCkgKyA3ODYsXG5cdFx0XHR0SGlkZGVuV2lkdGg6IDMwNSxcblx0XHRcdHRhYmxlV2lkdGg6IDcxMFxuXHRcdH07XG5cblx0XHR0aGlzLnNncm91cCA9IHtcblx0XHRcdGN1cnJlbnRZOiAwLFxuXHRcdFx0aW5pWTogNjAsXG5cdFx0XHRhY3RpdmU6IGZhbHNlLFxuXHRcdFx0dG9wQmFyOiB7XG5cdFx0XHRcdGZpbGw6ICcjNjY2Jyxcblx0XHRcdFx0aGVpZ2h0OiAxMixcblx0XHRcdFx0c3Ryb2tlRW5hYmxlZDogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRnYXA6IDMsXG5cdFx0XHRyb3dIZWlnaHQ6IDIyLFxuXHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxuXHRcdFx0ZHJhZ0JvdW5kRnVuYzogaGZ1bmNcblx0XHR9O1xuXG5cdFx0dGhpcy5zYmFyID0ge1xuXHRcdFx0YmFyaGVpZ2h0OiAxMixcblx0XHRcdHJlY3RvcHRpb246IHtcblx0XHRcdFx0c3Ryb2tlRW5hYmxlZDogZmFsc2UsXG5cdFx0XHRcdGZpbGw6ICdncmV5J1xuXHRcdFx0fSxcblx0XHRcdGdhcDogMjAsXG5cdFx0XHRyb3doZWlnaHQ6ICA2MCxcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdFx0cmVzaXplQm91bmRGdW5jOiBoZnVuYyxcblx0XHRcdHN1Ymdyb3VwOiB0cnVlXG5cdFx0fTtcblx0XHR0aGlzLnNmb3JtPXtcblx0XHRcdCduYW1lJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnXG5cdFx0XHR9LFxuXHRcdFx0J3N0YXJ0Jzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ2RhdGUnLFxuXHRcdFx0XHRkMnQ6IGZ1bmN0aW9uKGQpe1xuXHRcdFx0XHRcdHJldHVybiBkLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHQyZDogZnVuY3Rpb24odCl7XG5cdFx0XHRcdFx0cmV0dXJuIERhdGUucGFyc2VFeGFjdCggdXRpbC5jb3JyZWN0ZGF0ZSh0KSwgJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdlbmQnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnZGF0ZScsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24oZCl7XG5cdFx0XHRcdFx0cmV0dXJuIGQudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dDJkOiBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5wYXJzZUV4YWN0KCB1dGlsLmNvcnJlY3RkYXRlKHQpLCAnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdzZWxlY3QnLFxuXHRcdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdFx0JzExMCc6ICdjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6ICdvcGVuJyxcblx0XHRcdFx0XHQnMTA4JyA6ICdyZWFkeSdcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdjb21wbGV0ZSc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICd0ZXh0J1xuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICd0ZXh0Jyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbih0LG1vZGVsKXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5nZXQoJ3N0YXJ0JyksbW9kZWwuZ2V0KCdlbmQnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcblx0XHR9O1xuXHRcdHRoaXMuZ2V0Rm9ybUVsZW0gPSB0aGlzLmNyZWF0ZUVsZW0oKTtcblx0XHR0aGlzLmNvbGxlY3Rpb24gPSB0aGlzLmFwcC50YXNrcztcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xuXHRcdHRoaXMub24oJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMpO1xuXHR9LFxuXHRnZXRTZXR0aW5nOiBmdW5jdGlvbihmcm9tLCBhdHRyKXtcblx0XHRpZihhdHRyKXtcblx0XHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dW2F0dHJdO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXTtcblx0fSxcblx0Y2FsY21pbm1heDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG1pbkRhdGUgPSBuZXcgRGF0ZSgyMDIwLDEsMSksIG1heERhdGUgPSBuZXcgRGF0ZSgwLDAsMCk7XG5cdFx0XG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3N0YXJ0JykuY29tcGFyZVRvKG1pbkRhdGUpID09PSAtMSkge1xuXHRcdFx0XHRtaW5EYXRlPW1vZGVsLmdldCgnc3RhcnQnKTtcblx0XHRcdH1cblx0XHRcdGlmIChtb2RlbC5nZXQoJ2VuZCcpLmNvbXBhcmVUbyhtYXhEYXRlKSA9PT0gMSkge1xuXHRcdFx0XHRtYXhEYXRlPW1vZGVsLmdldCgnZW5kJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5zYXR0ci5taW5EYXRlID0gbWluRGF0ZTtcblx0XHR0aGlzLnNhdHRyLm1heERhdGUgPSBtYXhEYXRlO1xuXHRcdFxuXHR9LFxuXHRzZXRBdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZW5kLHNhdHRyPXRoaXMuc2F0dHIsZGF0dHI9dGhpcy5zZGlzcGxheSxkdXJhdGlvbixzaXplLGNlbGxXaWR0aCxkcGkscmV0ZnVuYyxzdGFydCxsYXN0LGk9MCxqPTAsaUxlbj0wLG5leHQ9bnVsbDtcblx0XHRcblx0XHR2YXIgaW50ZXJ2YWwgPSB0aGlzLmdldCgnaW50ZXJ2YWwnKTtcblxuXHRcdGlmIChpbnRlcnZhbCA9PT0gJ2RhaWx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDEsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxMjtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDEpO1xuXHRcdFx0fTtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRcblx0XHR9IGVsc2UgaWYoaW50ZXJ2YWwgPT09ICd3ZWVrbHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgNywge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiA3KTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDcpLm1vdmVUb0RheU9mV2VlaygxLCAtMSk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSA1O1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoICogNztcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyg3KTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ21vbnRobHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogMzApLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMjtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDcgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygxKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbi5tb3ZlVG9GaXJzdERheU9mUXVhcnRlcigpO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDMwICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMztcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMyk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdmaXgnKSB7XG5cdFx0XHRjZWxsV2lkdGggPSAzMDtcblx0XHRcdGR1cmF0aW9uID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLCBzYXR0ci5tYXhEYXRlKTtcblx0XHRcdHNpemUgPSBkYXR0ci5zY3JlZW5XaWR0aCAtIGRhdHRyLnRIaWRkZW5XaWR0aCAtIDEwMDtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNpemUgLyBkdXJhdGlvbjtcblx0XHRcdGRwaSA9IE1hdGgucm91bmQoY2VsbFdpZHRoIC8gc2F0dHIuZGF5c1dpZHRoKTtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCBkcGksIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IGRwaSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIgKiBkcGkpO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsPT09J2F1dG8nKSB7XG5cdFx0XHRkcGkgPSB0aGlzLmdldCgnZHBpJyk7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAoMSArIE1hdGgubG9nKGRwaSkpICogMTI7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzYXR0ci5jZWxsV2lkdGggLyBkcGk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yMCAqIGRwaSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIGRwaSk7XG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcblx0XHRcdH07XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0fVxuXHRcdHZhciBoRGF0YSA9IHtcblx0XHRcdCcxJzogW10sXG5cdFx0XHQnMic6IFtdLFxuXHRcdFx0JzMnOiBbXVxuXHRcdH07XG5cdFx0dmFyIGhkYXRhMyA9IFtdO1xuXHRcdFxuXHRcdHN0YXJ0ID0gc2F0dHIuYm91bmRhcnlNaW47XG5cdFx0XG5cdFx0bGFzdCA9IHN0YXJ0O1xuXHRcdGlmIChpbnRlcnZhbCA9PT0gJ21vbnRobHknIHx8IGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xuXHRcdFx0dmFyIGR1cmZ1bmM7XG5cdFx0XHRpZiAoaW50ZXJ2YWw9PT0nbW9udGhseScpIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5Nb250aChkYXRlLmdldEZ1bGxZZWFyKCksZGF0ZS5nZXRNb250aCgpKTtcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luUXVhcnRlcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0UXVhcnRlcigpKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xuXHRcdFx0XHRcdGhkYXRhMy5wdXNoKHtcblx0XHRcdFx0XHRcdGR1cmF0aW9uOiBkdXJmdW5jKGxhc3QpLFxuXHRcdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcblx0XHRcdFx0XHRsYXN0ID0gbmV4dDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGludGVydmFsZGF5cyA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xuXHRcdFx0XHRoZGF0YTMucHVzaCh7XG5cdFx0XHRcdFx0ZHVyYXRpb246IGludGVydmFsZGF5cyxcblx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XG5cdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzYXR0ci5ib3VuZGFyeU1heCA9IGVuZCA9IGxhc3Q7XG5cdFx0aERhdGFbJzMnXSA9IGhkYXRhMztcblxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgZGF0ZSB0byBlbmQgb2YgeWVhclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xuXHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXG5cdFx0fSk7XG5cdFx0Zm9yKGkgPSBzdGFydC5nZXRGdWxsWWVhcigpICsgMSwgaUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpOyBpIDwgaUxlbjsgaSsrKXtcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xuXHRcdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxuXHRcdFx0XHR0ZXh0OiBpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxuXHRcdGlmIChzdGFydC5nZXRGdWxsWWVhcigpIT09ZW5kLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGludGVyID0gRGF0ZS5kYXlzZGlmZihuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwgMCwgMSksIGVuZCk7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGVuZC5nZXRGdWxsWWVhcigpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxuXHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihzdGFydCwgc3RhcnQuY2xvbmUoKS5tb3ZlVG9MYXN0RGF5T2ZNb250aCgpKSxcblx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCAnbScpXG5cdFx0fSk7XG5cdFx0XG5cdFx0aiA9IHN0YXJ0LmdldE1vbnRoKCkgKyAxO1xuXHRcdGkgPSBzdGFydC5nZXRGdWxsWWVhcigpO1xuXHRcdGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTtcblx0XHR2YXIgZW5kbW9udGggPSBlbmQuZ2V0TW9udGgoKTtcblxuXHRcdHdoaWxlIChpIDw9IGlMZW4pIHtcblx0XHRcdHdoaWxlKGogPCAxMikge1xuXHRcdFx0XHRpZiAoaSA9PT0gaUxlbiAmJiBqID09PSBlbmRtb250aCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRcdFx0ZHVyYXRpb246IERhdGUuZ2V0RGF5c0luTW9udGgoaSwgaiksXG5cdFx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGosICdtJylcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGogKz0gMTtcblx0XHRcdH1cblx0XHRcdGkgKz0gMTtcblx0XHRcdGogPSAwO1xuXHRcdH1cblx0XHRpZiAoZW5kLmdldE1vbnRoKCkgIT09IHN0YXJ0LmdldE1vbnRoICYmIGVuZC5nZXRGdWxsWWVhcigpICE9PSBzdGFydC5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihlbmQuY2xvbmUoKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKSwgZW5kKSxcblx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGVuZC5nZXRNb250aCgpLCAnbScpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0c2F0dHIuaERhdGEgPSBoRGF0YTtcblx0fSxcblx0Y2FsY3VsYXRlSW50ZXJ2YWxzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNhbGNtaW5tYXgoKTtcblx0XHR0aGlzLnNldEF0dHJpYnV0ZXMoKTtcblx0fSxcblx0Y3JlYXRlRWxlbTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVsZW1zID0ge30sIG9iaiwgY2FsbGJhY2sgPSBmYWxzZSwgY29udGV4dCA9IGZhbHNlO1xuXHRcdGZ1bmN0aW9uIGJpbmRUZXh0RXZlbnRzKGVsZW1lbnQsIG9iaiwgbmFtZSkge1xuXHRcdFx0ZWxlbWVudC5vbignYmx1cicsZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHRcdFx0dmFyIHZhbHVlID0gJHRoaXMudmFsKCk7XG5cdFx0XHRcdCR0aGlzLmRldGFjaCgpO1xuXHRcdFx0XHR2YXIgY2FsbGZ1bmMgPSBjYWxsYmFjaywgY3R4ID0gY29udGV4dDtcblx0XHRcdFx0Y2FsbGJhY2sgPSBmYWxzZTtcblx0XHRcdFx0Y29udGV4dCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAob2JqLnQyZCkge1xuXHRcdFx0XHRcdHZhbHVlPW9iai50MmQodmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhbGxmdW5jLmNhbGwoY3R4LG5hbWUsdmFsdWUpO1xuXHRcdFx0fSkub24oJ2tleXByZXNzJyxmdW5jdGlvbihlKXtcblx0XHRcdFx0aWYoZXZlbnQud2hpY2g9PT0xMyl7XG5cdFx0XHRcdFx0JCh0aGlzKS50cmlnZ2VyKCdibHVyJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHRmdW5jdGlvbiBiaW5kRGF0ZUV2ZW50cyhlbGVtZW50LG9iaixuYW1lKXtcblx0XHRcdGVsZW1lbnQuZGF0ZXBpY2tlcih7IGRhdGVGb3JtYXQ6IFwiZGQvbW0veXlcIixvbkNsb3NlOmZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdjbG9zZSBpdCcpO1xuXHRcdFx0XHR2YXIgJHRoaXM9JCh0aGlzKTtcblx0XHRcdFx0dmFyIHZhbHVlPSR0aGlzLnZhbCgpO1xuXHRcdFx0XHQkdGhpcy5kZXRhY2goKTtcblx0XHRcdFx0dmFyIGNhbGxmdW5jPWNhbGxiYWNrLGN0eD1jb250ZXh0O1xuXHRcdFx0XHRjYWxsYmFjaz1mYWxzZTtcblx0XHRcdFx0Y29udGV4dD1mYWxzZTtcblx0XHRcdFx0aWYob2JqWyd0MmQnXSkge1xuXHRcdFx0XHRcdHZhbHVlPW9ialsndDJkJ10odmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XCJ1c2Ugc3RyaWN0XCI7XG5cdFx0XHRcdFx0Y2FsbGZ1bmMuY2FsbChjdHgsbmFtZSx2YWx1ZSk7XG5cdFx0XHRcdH0sIDEwKTtcblx0XHRcdH19KTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yKHZhciBpIGluIHRoaXMuc2Zvcm0pe1xuXHRcdFx0b2JqPXRoaXMuc2Zvcm1baV07XG5cdFx0XHRpZihvYmouZWRpdGFibGUpe1xuXHRcdFx0XHRpZihvYmoudHlwZT09PSd0ZXh0Jyl7XG5cdFx0XHRcdFx0ZWxlbXNbaV09JCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJjb250ZW50LWVkaXRcIj4nKTtcblx0XHRcdFx0XHRiaW5kVGV4dEV2ZW50cyhlbGVtc1tpXSxvYmosaSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZihvYmoudHlwZT09PSdkYXRlJyl7XG5cdFx0XHRcdFx0ZWxlbXNbaV09JCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJjb250ZW50LWVkaXRcIj4nKTtcblx0XHRcdFx0XHRiaW5kRGF0ZUV2ZW50cyhlbGVtc1tpXSxvYmosaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcblx0XHR9XG5cblx0XHRvYmogPSBudWxsO1xuXHRcdHJldHVybiBmdW5jdGlvbihmaWVsZCwgbW9kZWwsIGNhbGxmdW5jLCBjdHgpe1xuXHRcdFx0Y2FsbGJhY2sgPSBjYWxsZnVuYztcblx0XHRcdGNvbnRleHQgPSBjdHg7XG5cdFx0XHR2YXIgZWxlbWVudD1lbGVtc1tmaWVsZF0sIHZhbHVlID0gbW9kZWwuZ2V0KGZpZWxkKTtcblx0XHRcdGlmICh0aGlzLnNmb3JtW2ZpZWxkXS5kMnQpIHtcblx0XHRcdFx0dmFsdWUgPSB0aGlzLnNmb3JtW2ZpZWxkXS5kMnQodmFsdWUsIG1vZGVsKTtcblx0XHRcdH1cblx0XHRcdGVsZW1lbnQudmFsKHZhbHVlKTtcblx0XHRcdHJldHVybiBlbGVtZW50O1xuXHRcdH07XG5cdFxuXHR9LFxuXHRjb25EVG9UOihmdW5jdGlvbigpe1xuXHRcdHZhciBkVG9UZXh0PXtcblx0XHRcdCdzdGFydCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxuXHRcdFx0fSxcblx0XHRcdCdlbmQnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jylcblx0XHRcdH0sXG5cdFx0XHQnZHVyYXRpb24nOmZ1bmN0aW9uKHZhbHVlLG1vZGVsKXtcblx0XHRcdFx0cmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuc3RhcnQsbW9kZWwuZW5kKSsnIGQnO1xuXHRcdFx0fSxcblx0XHRcdCdzdGF0dXMnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0dmFyIHN0YXR1c2VzPXtcblx0XHRcdFx0XHQnMTEwJzonY29tcGxldGUnLFxuXHRcdFx0XHRcdCcxMDknOidvcGVuJyxcblx0XHRcdFx0XHQnMTA4JyA6ICdyZWFkeSdcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHN0YXR1c2VzW3ZhbHVlXTtcblx0XHRcdH1cblx0XHRcblx0XHR9O1xuXHRcdHJldHVybiBmdW5jdGlvbihmaWVsZCx2YWx1ZSxtb2RlbCl7XG5cdFx0XHRyZXR1cm4gZFRvVGV4dFtmaWVsZF0/ZFRvVGV4dFtmaWVsZF0odmFsdWUsbW9kZWwpOnZhbHVlO1xuXHRcdH07XG5cdH0oKSlcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdNb2RlbDtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXHJ2YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxyXHJ2YXIgVGFza01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcciAgICBkZWZhdWx0czoge1xyICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyICAgICAgICBkZXNjcmlwdGlvbjogJycsXHIgICAgICAgIGNvbXBsZXRlOiAwLFxyICAgICAgICBhY3Rpb246ICcnLFxyICAgICAgICBhY3RpdmUgOiB0cnVlLFxyICAgICAgICBzb3J0aW5kZXg6IDAsXHIgICAgICAgIGRlcGVuZGVuY3k6JycsXHIgICAgICAgIHJlc291cmNlczoge30sXHIgICAgICAgIHN0YXR1czogMTEwLFxyICAgICAgICBoZWFsdGg6IDIxLFxyICAgICAgICBzdGFydDogJycsXHIgICAgICAgIGVuZDogJycsXHIgICAgICAgIFByb2plY3RSZWYgOiBwYXJhbXMucHJvamVjdCxcciAgICAgICAgV0JTX0lEIDogcGFyYW1zLnByb2ZpbGUsXHIgICAgICAgIGNvbG9yOicjMDA5MGQzJyxcciAgICAgICAgbGlnaHRjb2xvcjogJyNFNkYwRkYnLFxyICAgICAgICBkYXJrY29sb3I6ICcjZTg4MTM0JyxcciAgICAgICAgYVR5cGU6ICcnLFxyICAgICAgICByZXBvcnRhYmxlOiAnJyxcciAgICAgICAgcGFyZW50aWQ6IDBcciAgICB9LFxyICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcciAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHIgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5yZW1vdmUoY2hpbGQpO1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIHRoaXMuX2NoZWNrVGltZSk7XHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcciAgICAgICAgICAgIH0pO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLnN0YXJ0KSl7XHIgICAgICAgICAgICByZXNwb25zZS5zdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwnZGQvTU0veXl5eScpIHx8XHIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gbmV3IERhdGUoKTtcciAgICAgICAgfVxyICAgICAgICBcciAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcciAgICAgICAgICAgIHJlc3BvbnNlLmVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksJ2RkL01NL3l5eXknKSB8fFxyICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIHJlc3BvbnNlLmVuZCA9IG5ldyBEYXRlKCk7XHIgICAgICAgIH1cciAgICAgICAgcmVzcG9uc2UucGFyZW50aWQgPSBwYXJzZUludChyZXNwb25zZS5wYXJlbnRpZCB8fCAnMCcsIDEwKTtcclxyICAgICAgICAvLyByZW1vdmUgbnVsbCBwYXJhbXNcciAgICAgICAgXy5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbih2YWwsIGtleSkge1xyICAgICAgICAgICAgaWYgKCF2YWwpIHtcciAgICAgICAgICAgICAgICByZXNwb25zZVtrZXldID0gdW5kZWZpbmVkO1xyICAgICAgICAgICAgfVxyICAgICAgICB9KTtcciAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyICAgIH0sXHIgICAgX2NoZWNrVGltZSA6IGZ1bmN0aW9uKCkge1xyICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcciAgICAgICAgICAgIHJldHVybjtcciAgICAgICAgfVxyICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHIgICAgICAgIHZhciBlbmRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ2VuZCcpO1xyICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcciAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcciAgICAgICAgICAgIHZhciBjaGlsZEVuZFRpbWUgPSBjaGlsZC5nZXQoJ2VuZCcpO1xyICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUuY29tcGFyZVRvKHN0YXJ0VGltZSkgPT09IC0xKSB7XHIgICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gY2hpbGRTdGFydFRpbWU7XHIgICAgICAgICAgICB9XHIgICAgICAgICAgICBpZihjaGlsZEVuZFRpbWUuY29tcGFyZVRvKGVuZFRpbWUpID09PSAxKXtcciAgICAgICAgICAgICAgICBlbmRUaW1lID0gY2hpbGRFbmRUaW1lO1xyICAgICAgICAgICAgfVxyICAgICAgICB9LmJpbmQodGhpcykpO1xyICAgICAgICB0aGlzLnNldCgnc3RhcnQnLCBzdGFydFRpbWUpO1xyICAgICAgICB0aGlzLnNldCgnZW5kJywgZW5kVGltZSk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gVGFza01vZGVsO1xyIiwidmFyIG1vbnRoc0NvZGU9WydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcblxubW9kdWxlLmV4cG9ydHMuY29ycmVjdGRhdGUgPSBmdW5jdGlvbihzdHIpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiBzdHI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRkYXRhID0gZnVuY3Rpb24odmFsLCB0eXBlKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZiAodHlwZSA9PT0gJ20nKSB7XG5cdFx0cmV0dXJuIG1vbnRoc0NvZGVbdmFsXTtcblx0fVxuXHRyZXR1cm4gdmFsO1xufTtcblxubW9kdWxlLmV4cG9ydHMuaGZ1bmMgPSBmdW5jdGlvbihwb3MpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiB7XG5cdFx0eDogcG9zLngsXG5cdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHR9O1xufTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikge1xuXHR2YXIgcGFyYW1zID0ge307XG5cdHZhciBwcm1hcnIgPSBwcm1zdHIuc3BsaXQoJyYnKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm1hcnIubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdG1wYXJyID0gcHJtYXJyW2ldLnNwbGl0KCc9Jyk7XG5cdFx0cGFyYW1zW3RtcGFyclswXV0gPSB0bXBhcnJbMV07XG5cdH1cblx0cmV0dXJuIHBhcmFtcztcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0VVJMUGFyYW1zID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwcm1zdHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKTtcblx0cmV0dXJuIHBybXN0ciAhPT0gbnVsbCAmJiBwcm1zdHIgIT09ICcnID8gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikgOiB7fTtcbn07XG5cbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMDIuMTIuMjAxNC5cclxuICovXHJcblxyXG52YXIgdGVtcGxhdGUgPSBcIjxkaXYgY2xhc3M9XFxcInVpIHNtYWxsIG1vZGFsIGFkZC1uZXctdGFzayBmbGlwXFxcIj5cXHJcXG4gICAgPGkgY2xhc3M9XFxcImNsb3NlIGljb25cXFwiPjwvaT5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiaGVhZGVyXFxcIj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbnRlbnRcXFwiPlxcclxcbiAgICAgICAgPGZvcm0gaWQ9XFxcIm5ldy10YXNrLWZvcm1cXFwiIGFjdGlvbj1cXFwiL1xcXCIgdHlwZT1cXFwiUE9TVFxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidWkgZm9ybSBzZWdtZW50XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHA+TGV0J3MgZ28gYWhlYWQgYW5kIHNldCBhIG5ldyBnb2FsLjwvcD5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlRhc2sgbmFtZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgbmFtZT1cXFwibmFtZVxcXCIgcGxhY2Vob2xkZXI9XFxcIk5ldyB0YXNrIG5hbWVcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkRpc2NyaXB0aW9uPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBuYW1lPVxcXCJkZXNjcmlwdGlvblxcXCIgcGxhY2Vob2xkZXI9XFxcIlRoZSBkZXRhaWxlZCBkZXNjcmlwdGlvbiBvZiB5b3VyIHRhc2tcXFwiPjwvdGV4dGFyZWE+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U2VsZWN0IHBhcmVudDwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcInVpIGRyb3Bkb3duIHNlbGVjdGlvblxcXCI+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgbmFtZT1cXFwicGFyZW50aWRcXFwiIGNsYXNzPVxcXCJ1aSBkcm9wZG93blxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGQgcmVzb3VyY2VzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+QXNzaWduIFJlc291cmNlczwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5TdGFydCBEYXRlPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiZGF0ZVxcXCIgbmFtZT1cXFwic3RhcnRcXFwiIHBsYWNlaG9sZGVyPVxcXCJTdGFydCBEYXRlXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5FbmQgRGF0ZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiIG5hbWU9XFxcImVuZFxcXCIgcGxhY2Vob2xkZXI9XFxcIkVuZCBEYXRlXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiY29tcGxldGVcXFwiIHZhbHVlPVxcXCIwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiYWN0aW9uXFxcIiB2YWx1ZT1cXFwiYWRkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiZGVwZW5kZW5jeVxcXCIgdmFsdWU9XFxcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImFUeXBlXFxcIiB2YWx1ZT1cXFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaGVhbHRoXFxcIiB2YWx1ZT1cXFwiMjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJjb2xvclxcXCIgdmFsdWU9XFxcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcIm1pbGVzdG9uZVxcXCIgdmFsdWU9XFxcIjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJkZWxpdmVyYWJsZVxcXCIgdmFsdWU9XFxcIjBcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJyZXBvcnRhYmxlXFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInNvcnRpbmRleFxcXCIgdmFsdWU9XFxcIjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbnNlcnRQb3NcXFwiIHZhbHVlPVxcXCJzZXRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJyZWZlcmVuY2VfaWRcXFwiIHZhbHVlPVxcXCItMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5TdGF0dXM8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInVpIGZsdWlkIHNlbGVjdGlvbiBkcm9wZG93blxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInN0YXR1c1xcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImRlZmF1bHQgdGV4dFxcXCI+U3RhdHVzPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJkcm9wZG93biBpY29uXFxcIj48L2k+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm1lbnVcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTA4XFxcIj5SZWFkeTwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTA5XFxcIj5PcGVuPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMTBcXFwiPkNvbXBsZXRlZDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5EdXJhdGlvbjwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcIm51bWJlclxcXCIgbWluPVxcXCIwXFxcIiBuYW1lPVxcXCJkdXJhdGlvblxcXCIgcGxhY2Vob2xkZXI9XFxcIlByb2plY3QgRHVyYXRpb25cXFwiIHJlcXVpcmVkIHJlYWRvbmx5PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVxcXCJzdWJtaXRGb3JtXFxcIiBjbGFzcz1cXFwidWkgYmx1ZSBzdWJtaXQgcGFyZW50IGJ1dHRvblxcXCI+U3VibWl0PC9idXR0b24+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8L2Zvcm0+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlwiO1xyXG5cclxudmFyIGRlbW9SZXNvdXJjZXMgPSBbe1wid2JzaWRcIjoxLFwicmVzX2lkXCI6MSxcInJlc19uYW1lXCI6XCJKb2UgQmxhY2tcIixcInJlc19hbGxvY2F0aW9uXCI6NjB9LHtcIndic2lkXCI6MyxcInJlc19pZFwiOjIsXCJyZXNfbmFtZVwiOlwiSm9obiBCbGFja21vcmVcIixcInJlc19hbGxvY2F0aW9uXCI6NDB9XTtcclxuXHJcbnZhciBBZGRGb3JtVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiBkb2N1bWVudC5ib2R5LFxyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgICAgJ2NsaWNrIC5uZXctdGFzayc6ICdvcGVuRm9ybScsXHJcbiAgICAgICAgJ2NsaWNrICNzdWJtaXRGb3JtJzogJ3N1Ym1pdEZvcm0nXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZCh0aGlzLnRlbXBsYXRlKTtcclxuICAgICAgICB0aGlzLl9wcmVwYXJlRm9ybSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRSZXNvdXJjZXMoKTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIHRoaXMuX3NldHVwUGFyZW50U2VsZWN0b3IpO1xyXG4gICAgfSxcclxuICAgIF9pbml0UmVzb3VyY2VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gUmVzb3VyY2VzIGZyb20gYmFja2VuZFxyXG4gICAgICAgIHZhciAkcmVzb3VyY2VzID0gJzxzZWxlY3QgaWQ9XCJyZXNvdXJjZXNcIiAgbmFtZT1cInJlc291cmNlc1tdXCIgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPic7XHJcbiAgICAgICAgZGVtb1Jlc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAkcmVzb3VyY2VzICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIHJlc291cmNlLnJlc19pZCArICdcIj4nICsgcmVzb3VyY2UucmVzX25hbWUgKyAnPC9vcHRpb24+JztcclxuICAgICAgICB9KTtcclxuICAgICAgICAkcmVzb3VyY2VzICs9ICc8L3NlbGVjdD4nO1xyXG4gICAgICAgIC8vIGFkZCBiYWNrZW5kIHRvIHRoZSB0YXNrIGxpc3RcclxuICAgICAgICAkKCcucmVzb3VyY2VzJykuYXBwZW5kKCRyZXNvdXJjZXMpO1xyXG5cclxuICAgICAgICAvLyBpbml0aWFsaXplIG11bHRpcGxlIHNlbGVjdG9yc1xyXG4gICAgICAgICQoJyNyZXNvdXJjZXMnKS5jaG9zZW4oe3dpZHRoOiAnOTUlJ30pO1xyXG4gICAgfSxcclxuICAgIF9mb3JtVmFsaWRhdGlvblBhcmFtcyA6IHtcclxuICAgICAgICBuYW1lOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICduYW1lJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBlbnRlciBhIHRhc2sgbmFtZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29tcGxldGU6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2NvbXBsZXRlJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBlbnRlciBhbiBlc3RpbWF0ZSBkYXlzJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnc3RhcnQnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhIHN0YXJ0IGRhdGUnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnZW5kJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYW4gZW5kIGRhdGUnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGR1cmF0aW9uOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdkdXJhdGlvbicsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGEgdmFsaWQgZHVyYXRpb24nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXR1czoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnc3RhdHVzJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZWxlY3QgYSBzdGF0dXMnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVGb3JtIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLm1hc3RoZWFkIC5pbmZvcm1hdGlvbicpLnRyYW5zaXRpb24oJ3NjYWxlIGluJyk7XHJcbiAgICAgICAgJCgnLnVpLmZvcm0nKS5mb3JtKHRoaXMuX2Zvcm1WYWxpZGF0aW9uUGFyYW1zKTtcclxuICAgICAgICAvLyBhc3NpZ24gcmFuZG9tIHBhcmVudCBjb2xvclxyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJjb2xvclwiXScpLnZhbCgnIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNikpO1xyXG4gICAgfSxcclxuICAgIF9zZXR1cFBhcmVudFNlbGVjdG9yIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyICRzZWxlY3RvciA9ICQoJ1tuYW1lPVwicGFyZW50aWRcIl0nKTtcclxuICAgICAgICAkc2VsZWN0b3IuZW1wdHkoKTtcclxuICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiMFwiPk1haW4gUHJvamVjdDwvb3B0aW9uPicpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gcGFyc2VJbnQodGFzay5nZXQoJ3BhcmVudGlkJyksIDEwKTtcclxuICAgICAgICAgICAgaWYocGFyZW50SWQgPT09IDApe1xyXG4gICAgICAgICAgICAgICAgJHNlbGVjdG9yLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicgKyB0YXNrLmlkICsgJ1wiPicgKyB0YXNrLmdldCgnbmFtZScpICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnc2VsZWN0LmRyb3Bkb3duJykuZHJvcGRvd24oKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGRyb3Bkb3duXHJcbiAgICAgICAgdGhpcy5fc2V0dXBQYXJlbnRTZWxlY3RvcigpO1xyXG4gICAgfSxcclxuICAgIG9wZW5Gb3JtOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcudWkuYWRkLW5ldy10YXNrJykubW9kYWwoJ3NldHRpbmcnLCAndHJhbnNpdGlvbicsICd2ZXJ0aWNhbCBmbGlwJykubW9kYWwoJ3Nob3cnKTtcclxuICAgIH0sXHJcbiAgICBzdWJtaXRGb3JtOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIGZvcm0gPSAkKFwiI25ldy10YXNrLWZvcm1cIik7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0ge307XHJcbiAgICAgICAgJChmb3JtKS5zZXJpYWxpemVBcnJheSgpLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICAgICAgZGF0YVtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgICAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkYXRhLnJlZmVyZW5jZV9pZCk7XHJcbiAgICAgICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgICAgICB2YXIgaW5zZXJ0UG9zID0gZGF0YS5pbnNlcnRQb3M7XHJcbiAgICAgICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmNvbGxlY3Rpb24ubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcblxyXG4gICAgICAgIGlmIChmb3JtLmdldCgwKS5jaGVja1ZhbGlkaXR5KCkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgICAgICAgICB0YXNrLnNhdmUoKTtcclxuICAgICAgICAgICAgJCgnLnVpLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBZGRGb3JtVmlldzsiLCJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFRhc2tWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL1Rhc2tWaWV3Jyk7XHJ2YXIgS0NhbnZhc1ZpZXcgPSByZXF1aXJlKCcuL2NhbnZhcy9LQ2FudmFzVmlldycpO1xydmFyIEFkZEZvcm1WaWV3ID0gcmVxdWlyZSgnLi9BZGRGb3JtVmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51VmlldycpO1xyXHJ2YXIgR2FudHRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyICAgIGVsOiAnLkdhbnR0JyxcciAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcciAgICAgICAgdGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xyICAgICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcudGFzay1jb250YWluZXInKTtcclxyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyICAgICAgICB0aGlzLm1ha2VTb3J0YWJsZSgpO1xyXHIgICAgICAgIG5ldyBDb250ZXh0TWVudVZpZXcodGhpcy5hcHApLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBBZGRGb3JtVmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBUb3BNZW51Vmlldyh7XHIgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydGVkIGFkZCcsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLmVtcHR5KCk7XHIgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIG1ha2VTb3J0YWJsZTogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lci5zb3J0YWJsZSh7XHIgICAgICAgICAgICBncm91cDogJ3NvcnRhYmxlJyxcciAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yIDogJ29sJyxcciAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcciAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyIHNvcnQtcGxhY2Vob2xkZXJcIi8+JyxcciAgICAgICAgICAgIG9uRHJhZyA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyICAgICAgICAgICAgICAgIHZhciBpc1N1YlRhc2sgPSAhJCgkcGxhY2Vob2xkZXIucGFyZW50KCkpLmhhc0NsYXNzKCd0YXNrLWNvbnRhaW5lcicpO1xyICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xyICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyICAgICAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyICAgICAgICAgICAgb25Ecm9wIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHIgICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHIgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLiRjb250YWluZXIuc29ydGFibGUoXCJzZXJpYWxpemVcIikuZ2V0KClbMF07XHIgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmVudERhdGEpIHtcciAgICAgICAgICAgICAgICAgICAgcGFyZW50RGF0YS5jaGlsZHJlbiA9IHBhcmVudERhdGEuY2hpbGRyZW4gPyBwYXJlbnREYXRhLmNoaWxkcmVuWzBdIDogW107XHIgICAgICAgICAgICAgICAgfSk7XHIgICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnJlc29ydChkYXRhKTtcciAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyICAgICAgICB9KTtcciAgICB9LFxyICAgIGV2ZW50czoge1xyICAgICAgICAnY2xpY2sgI3RIYW5kbGUnOiAnZXhwYW5kJyxcciAgICAgICAgJ2RibGNsaWNrIC5zdWItdGFzayc6ICdoYW5kbGVyb3djbGljaycsXHIgICAgICAgICdkYmxjbGljayAudGFzayc6ICdoYW5kbGVyb3djbGljaycsXHIgICAgICAgICdob3ZlciAuc3ViLXRhc2snOiAnc2hvd01hc2snXHIgICAgfSxcciAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHIgICAgICAgICAgICBpZiAodGFzay5nZXQoJ3BhcmVudGlkJykudG9TdHJpbmcoKSA9PT0gJzAnKSB7XHIgICAgICAgICAgICAgICAgdGhpcy5hZGRUYXNrKHRhc2spO1xyICAgICAgICAgICAgfVxyICAgICAgICB9LCB0aGlzKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEtDYW52YXNWaWV3KHtcciAgICAgICAgICAgIGFwcCA6IHRoaXMuYXBwLFxyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KS5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5tYWtlU29ydGFibGUoKTtcciAgICB9LFxyICAgIGhhbmRsZXJvd2NsaWNrOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGlkID0gZXZ0LmN1cnJlbnRUYXJnZXQuaWQ7XHIgICAgICAgIHRoaXMuYXBwLnRhc2tzLmdldChpZCkudHJpZ2dlcignZWRpdHJvdycsIGV2dCk7XHIgICAgfSxcciAgICBjYWxjdWxhdGVEdXJhdGlvbjogZnVuY3Rpb24oKXtcclxyICAgICAgICAvLyBDYWxjdWxhdGluZyB0aGUgZHVyYXRpb24gZnJvbSBzdGFydCBhbmQgZW5kIGRhdGVcciAgICAgICAgdmFyIHN0YXJ0ZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJzdGFydFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyICAgICAgICBpZihzdGFydGRhdGUgIT09IFwiXCIgJiYgZW5kZGF0ZSAhPT0gXCJcIil7XHIgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcciAgICAgICAgfWVsc2V7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigwKSk7XHIgICAgICAgIH1cciAgICB9LFxyICAgIGV4cGFuZDogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciB0YXJnZXQgPSAkKGV2dC50YXJnZXQpO1xyICAgICAgICB2YXIgd2lkdGggPSAwO1xyICAgICAgICB2YXIgc2V0dGluZyA9IHRoaXMuYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2Rpc3BsYXknKTtcciAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygnY29udHJhY3QnKSkge1xyICAgICAgICAgICAgd2lkdGggPSBzZXR0aW5nLnRIaWRkZW5XaWR0aDtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHdpZHRoID0gc2V0dGluZy50YWJsZVdpZHRoO1xyICAgICAgICB9XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuY3NzKCd3aWR0aCcsIHdpZHRoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldFdpZHRoKHNldHRpbmcuc2NyZWVuV2lkdGggLSB3aWR0aCAtIDIwKTtcciAgICAgICAgdGFyZ2V0LnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmZpbmQoJy5tZW51LWhlYWRlcicpLnRvZ2dsZUNsYXNzKCdtZW51LWhlYWRlci1vcGVuZWQnKTtcclxyICAgIH0sXHIgICAgYWRkVGFzazogZnVuY3Rpb24odGFzaykge1xyICAgICAgICB2YXIgdGFza1ZpZXcgPSBuZXcgVGFza1ZpZXcoe21vZGVsOiB0YXNrLCBhcHAgOiB0aGlzLmFwcH0pO1xyICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRhc2tWaWV3LnJlbmRlcigpLmVsKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBHYW50dFZpZXc7XHIiLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDA4LjEyLjIwMTQuXHJcbiAqL1xyXG5cclxudmFyIFRvcE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnLmhlYWQtYmFyJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgYnV0dG9uJzogJ29uSW50ZXJ2YWxCdXR0b25DbGlja2VkJyxcclxuICAgICAgICAnY2xpY2sgYVtocmVmPVwiLyMhL2dlbmVyYXRlL1wiXSc6ICdnZW5lcmF0ZVBERidcclxuICAgIH0sXHJcbiAgICBvbkludGVydmFsQnV0dG9uQ2xpY2tlZCA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciBidXR0b24gPSAkKGV2dC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICB2YXIgYWN0aW9uID0gYnV0dG9uLmRhdGEoJ2FjdGlvbicpO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IGFjdGlvbi5zcGxpdCgnLScpWzFdO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KCdpbnRlcnZhbCcsIGludGVydmFsKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVBERiA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVG9wTWVudVZpZXc7XHJcbiIsInZhciBkZD1LaW5ldGljLkREO1xudmFyIGNhbGN1bGF0aW5nPWZhbHNlO1xuXG5mdW5jdGlvbiBjcmVhdGVIYW5kbGUob3B0aW9uKXtcblx0b3B0aW9uLmRyYWdnYWJsZT10cnVlO1xuXHRvcHRpb24ub3BhY2l0eT0xO1xuXHRvcHRpb24uc3Ryb2tlRW5hYmxlZD1mYWxzZTtcblx0b3B0aW9uLndpZHRoPTI7XG5cdG9wdGlvbi5maWxsPSdibGFjayc7XG5cdHJldHVybiBuZXcgS2luZXRpYy5SZWN0KG9wdGlvbik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1Ykdyb3VwKG9wdGlvbil7XG5cdHZhciBnciA9IG5ldyBLaW5ldGljLkdyb3VwKCk7XG5cdHZhciBpbWdyZWN0ID0gbmV3IEtpbmV0aWMuUmVjdCh7XG5cdFx0eDowLFxuXHRcdHk6MCxcblx0XHRoZWlnaHQ6IG9wdGlvbi5oZWlnaHQsXG5cdFx0d2lkdGg6IDIwLFxuXHRcdHN0cm9rZUVuYWJsZWQ6IGZhbHNlLFxuXHRcdGZpbGw6ICd5ZWxsb3cnLFxuXHRcdG9wYWNpdHk6IDAuNVxuXHR9KTtcblx0dmFyIGFuY2hvciA9IG5ldyBLaW5ldGljLkNpcmNsZSh7XG5cdFx0eDogMTAsXG5cdFx0eTogNSxcblx0XHRyYWRpdXM6IDMsXG5cdFx0c3Ryb2tlV2lkdGg6IDEsXG5cdFx0bmFtZTogJ2FuY2hvcicsXG5cdFx0c3Ryb2tlOidibGFjaycsXG5cdFx0ZmlsbDond2hpdGUnXG5cdH0pO1xuXG5cdHZhciBuYW1lcmVjdCA9IG5ldyBLaW5ldGljLlJlY3Qoe1xuXHRcdHg6IDIwLFxuXHRcdHk6IDAsXG5cdFx0aGVpZ2h0OiBvcHRpb24uaGVpZ2h0LFxuXHRcdHdpZHRoOiA0MCxcblx0XHRzdHJva2VFbmFibGVkOiBmYWxzZSxcblx0XHRmaWxsOidwaW5rJ1xuXHR9KTtcblx0Z3IuYWRkKGltZ3JlY3QpO1xuXHRnci5hZGQoYW5jaG9yKTtcblx0Z3IuYWRkKG5hbWVyZWN0KTtcblx0cmV0dXJuIGdyO1xufVxuXG52YXIgYmVmb3JlYmluZD1mdW5jdGlvbihmdW5jKXtcblx0cmV0dXJuIGZ1bmN0aW9uKCl7XG5cdFx0aWYoY2FsY3VsYXRpbmcpIHJldHVybiBmYWxzZTtcblx0XHRjYWxjdWxhdGluZz10cnVlO1xuXHRcdGZ1bmMuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuXHRcdGNhbGN1bGF0aW5nPWZhbHNlO1xuXHR9XG59XG5cblx0ZnVuY3Rpb24gZ2V0RHJhZ0RpcihzdGFnZSl7XG5cdFx0cmV0dXJuIChzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS54LWRkLnN0YXJ0UG9pbnRlclBvcy54PjApPydyaWdodCc6J2xlZnQnO1xuXHR9XG5cblx0dmFyIEJhcj1mdW5jdGlvbihvcHRpb25zKXtcblx0XHR0aGlzLm1vZGVsPW9wdGlvbnMubW9kZWw7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IG9wdGlvbnMuc2V0dGluZ3M7XG5cblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl91cGRhdGVDb21wbGV0ZUJhcik7XG5cdFx0XG5cdFx0dmFyIHNldHRpbmcgPSB0aGlzLnNldHRpbmcgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2JhcicpO1xuXHRcdC8vdGhpcy5iYXJpZCA9IF8udW5pcXVlSWQoJ2InKTtcblx0XHR0aGlzLnN1Ymdyb3Vwb3B0aW9ucz17XG5cdFx0XHRzaG93T25Ib3ZlcjogdHJ1ZSxcblx0XHRcdGhpZGVPbkhvdmVyT3V0OnRydWUsXG5cdFx0XHRoYXNTdWJHcm91cDogZmFsc2UsXG5cdFx0fTtcblx0XHRcblx0XHR0aGlzLmRlcGVuZGFudHM9W107XG5cdFx0dGhpcy5kZXBlbmRlbmNpZXM9W107XG5cdFx0XG5cdFx0Lyp2YXIgb3B0aW9uPXtcblx0XHRcdHggOiByZWN0b3B0aW9ucy54LFxuXHRcdFx0eTogcmVjdG9wdGlvbnMueVxuXHRcdH1cblx0XHRyZWN0b3B0aW9ucy54PTA7XG5cdFx0cmVjdG9wdGlvbnMueT0wO1xuXHRcdHJlY3RvcHRpb25zLm5hbWU9J21haW5iYXInOyovXG5cblx0XHQvLyBjb2xvcmluZyBzZWN0aW9uXG5cdFx0dmFyIHBhcmVudE1vZGVsID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmdldCh0aGlzLm1vZGVsLmdldCgncGFyZW50aWQnKSk7XG5cdFx0dGhpcy5zZXR0aW5nLnJlY3RvcHRpb24uZmlsbCA9IHBhcmVudE1vZGVsLmdldCgnbGlnaHRjb2xvcicpO1x0XHRcblx0XHR0aGlzLmdyb3VwPW5ldyBLaW5ldGljLkdyb3VwKHRoaXMuZ2V0R3JvdXBQYXJhbXMoKSk7XG5cdFx0Ly9yZW1vdmUgdGhlIHN0cm9rZUVuYWJsZWQgaWYgbm90IHByb3ZpZGVkIGluIG9wdGlvblxuXHRcdC8vcmVjdG9wdGlvbnMuc3Ryb2tlRW5hYmxlZD1mYWxzZTtcblxuXHRcdHZhciByZWN0ID0gdGhpcy5yZWN0ICA9bmV3IEtpbmV0aWMuUmVjdCh0aGlzLmdldFJlY3RwYXJhbXMoKSk7XG5cdFx0dGhpcy5ncm91cC5hZGQocmVjdCk7XG5cdFx0XG5cdFx0aWYoc2V0dGluZy5zdWJncm91cCl7XG5cdFx0XHR0aGlzLmFkZFN1Ymdyb3VwKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKHNldHRpbmcuZHJhZ2dhYmxlKXtcblx0XHRcdHRoaXMubWFrZURyYWdnYWJsZSgpO1xuXHRcdH1cblx0XHRcblx0XHRpZihzZXR0aW5nLnJlc2l6YWJsZSl7XG5cdFx0XHR0aGlzLm1ha2VSZXNpemFibGUoKTtcblx0XHR9XG5cblx0XHR2YXIgbGVmdHg9dGhpcy5sZWZ0SGFuZGxlLmdldFgoKTtcblx0XHR2YXIgdz10aGlzLnJpZ2h0SGFuZGxlLmdldFgoKS1sZWZ0eCsyO1xuXHRcdHZhciB3aWR0aCA9ICggKCB3ICkgKiAodGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDApICk7XG5cdFx0dGhpcy5zZXR0aW5nLnJlY3RvcHRpb24uZmlsbCA9IHBhcmVudE1vZGVsLmdldCgnZGFya2NvbG9yJyk7XG5cdFx0b3B0ID0gIHRoaXMuZ2V0UmVjdHBhcmFtcygpO1xuXHRcdG9wdC54ID0gMjtcblx0XHRvcHQud2lkdGggPSB3aWR0aC00O1xuXHRcdHZhciBjb21wbGV0ZUJhcj0gdGhpcy5jb21wbGV0ZUJhciA9IG5ldyBLaW5ldGljLlJlY3Qob3B0KTtcblx0XHR0aGlzLmdyb3VwLmFkZChjb21wbGV0ZUJhcik7XG5cdFx0aWYgKHdpZHRoID09PSAwKSB7XG5cdFx0XHRjb21wbGV0ZUJhci5oaWRlKCk7XG5cdFx0fVxuXG5cdFx0Ly9hZGRFdmVudHNcblx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0XHQvL3RoaXMub24oJ3Jlc2l6ZSBtb3ZlJyx0aGlzLnJlbmRlckNvbm5lY3RvcnMsdGhpcyk7O1xuXHR9O1xuXG5cdEJhci5wcm90b3R5cGU9e1xuXHRcdF91cGRhdGVDb21wbGV0ZUJhciA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGxlZnR4PXRoaXMubGVmdEhhbmRsZS5nZXRYKCk7XG5cdFx0XHR2YXIgdyA9IHRoaXMucmlnaHRIYW5kbGUuZ2V0WCgpIC0gbGVmdHgrMjtcblx0XHRcdHZhciB3aWR0aCA9ICggKCB3ICkgKiAodGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDApICkgLSA0O1xuXG5cdFx0XHRpZih3aWR0aCA+IDApe1xuXHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLndpZHRoKHdpZHRoKTtcblx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci5zaG93KCk7XG5cdFx0XHRcdHRoaXMuY29tcGxldGVCYXIuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdC8vcmV0cmlldmVzIG9ubHkgd2lkdGgsaGVpZ2h0LHgseSByZWxhdGl2ZSB0byBwb2ludCAwLDAgb24gY2FudmFzO1xuXHRcdGdldFgxOiBmdW5jdGlvbihhYnNvbHV0ZSl7XG5cdFx0XHR2YXIgcmV0dmFsPTA7XG5cdFx0XHRpZihhYnNvbHV0ZSAmJiB0aGlzLnBhcmVudCkgcmV0dmFsPXRoaXMucGFyZW50LmdldFgoKTtcblx0XHRcdHJldHVybiByZXR2YWwrdGhpcy5ncm91cC5nZXRYKCk7XG5cdFx0fSxcblx0XHRnZXRYMjogZnVuY3Rpb24oYWJzb2x1dGUpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0WDEoYWJzb2x1dGUpK3RoaXMuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdGdldFg6ZnVuY3Rpb24oYWJzb2x1dGUpe1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogdGhpcy5nZXRYMShhYnNvbHV0ZSksXG5cdFx0XHRcdHk6IHRoaXMuZ2V0WDIoYWJzb2x1dGUpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Z2V0WTogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFkoKTtcblx0XHR9LFxuXHRcdGdldEhlaWdodDogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLnJlY3QuZ2V0SGVpZ2h0KCk7XG5cdFx0fSxcblx0XHRnZXRXaWR0aDogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLnJlY3QuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdFxuXHRcdHNldFgxOmZ1bmN0aW9uKHZhbHVlLG9wdGlvbnMpe1xuXHRcdFx0IW9wdGlvbnMgJiYgKG9wdGlvbnM9e30pXG5cdFx0XHR2YXIgcHJldngsd2lkdGgsZHg7XG5cblx0XHRcdC8vaWYgdmFsdWUgaXMgaW4gYWJzb2x1dGUgc2Vuc2UgdGhlbiBtYWtlIGl0IHJlbGF0aXZlIHRvIHBhcmVudFxuXHRcdFx0aWYob3B0aW9ucy5hYnNvbHV0ZSAmJiB0aGlzLnBhcmVudCl7XG5cdFx0XHRcdHZhbHVlPXZhbHVlLXRoaXMucGFyZW50LmdldFgodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHRwcmV2eD10aGlzLmdldFgxKCk7XG5cdFx0XHQvL2R4ICt2ZSBtZWFucyBiYXIgbW92ZWQgbGVmdCBcblx0XHRcdGR4PXByZXZ4LXZhbHVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgc2lsZW50PW9wdGlvbnMuc2lsZW50IHx8IG9wdGlvbnMub3NhbWU7XG5cdFx0XHRcblx0XHRcdHRoaXMubW92ZSgtMSpkeCxzaWxlbnQpO1xuXHRcdFx0Ly9pZiB4MiBoYXMgdG8gcmVtYWluIHNhbWVcblx0XHRcdC8vIERyYXcgcGVyY2VudGFnZSBjb21wbGV0ZWRcblx0XHRcdGlmKG9wdGlvbnMub3NhbWUpe1xuXHRcdFx0XHR0aGlzLnJlY3Quc2V0V2lkdGgoZHgrdGhpcy5nZXRXaWR0aCgpKTtcblx0XHRcdFx0dmFyIHdpZHRoID0oIHRoaXMuZ2V0V2lkdGgoKSAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCkgKS00O1xuXHRcdFx0XHRpZih3aWR0aCA+IDApXG5cdFx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci5zZXRXaWR0aCh3aWR0aCk7XG5cdFx0XHRcdHRoaXMucmVuZGVySGFuZGxlKCk7XG5cdFx0XHRcdGlmKCFvcHRpb25zLnNpbGVudCl7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdyZXNpemVsZWZ0Jyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScsdGhpcyk7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyUGFyZW50KCdyZXNpemUnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5lbmFibGVTdWJncm91cCgpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRzZXRYMjpmdW5jdGlvbih2YWx1ZSxvcHRpb25zKXtcblx0XHRcdHZhciBwcmV2eCx3aWR0aCxkeDtcblx0XHRcdC8vaWYgdmFsdWUgaXMgaW4gYWJzb2x1dGUgc2Vuc2UgdGhlbiBtYWtlIGl0IHJlbGF0aXZlIHRvIHBhcmVudFxuXHRcdFx0aWYob3B0aW9ucy5hYnNvbHV0ZSAmJiB0aGlzLnBhcmVudCl7XG5cdFx0XHRcdHZhbHVlPXZhbHVlLXRoaXMucGFyZW50LmdldFgodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHRwcmV2eD10aGlzLmdldFgyKCk7XG5cdFx0XHQvL2R4IC12ZSBtZWFucyBiYXIgbW92ZWQgcmlnaHQgXG5cdFx0XHRkeD1wcmV2eC12YWx1ZTtcblx0XHRcdFxuXHRcdFx0dmFyIHNpbGVudD1vcHRpb25zLnNpbGVudCB8fCBvcHRpb25zLm9zYW1lO1xuXHRcdFx0Ly90aGlzLmdyb3VwLnNldFgodmFsdWUpO1xuXHRcdFx0Ly9pZiB4MiBoYXMgdG8gcmVtYWluIHNhbWVcblx0XHRcdGlmKG9wdGlvbnMub3NhbWUpe1xuXHRcdFx0XHR0aGlzLnJlY3Quc2V0V2lkdGgodGhpcy5nZXRXaWR0aCgpLWR4KTtcblx0XHRcdFx0dmFyIHdpZHRoID0oIHRoaXMuZ2V0V2lkdGgoKSAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCkgKS00O1xuXHRcdFx0XHRpZih3aWR0aCA+IDApXG5cdFx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci5zZXRXaWR0aCh3aWR0aCk7XG5cdFx0XHRcdHRoaXMucmVuZGVySGFuZGxlKCk7XG5cdFx0XHRcdGlmKCFvcHRpb25zLnNpbGVudCl7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdyZXNpemVyaWdodCcsdGhpcyk7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdyZXNpemUnLHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlclBhcmVudCgncmVzaXplJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHRoaXMubW92ZSgtMSpkeCxvcHRpb25zLnNpbGVudCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcblx0XHR9LFxuXHRcdHNldFk6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0dGhpcy5ncm91cC5zZXRZKHZhbHVlKTtcblx0XHR9LFxuXHRcdHNldFBhcmVudDpmdW5jdGlvbihwYXJlbnQpe1xuXHRcdFx0dGhpcy5wYXJlbnQ9cGFyZW50O1xuXG5cdFx0fSxcblx0XHR0cmlnZ2VyUGFyZW50OmZ1bmN0aW9uKGV2ZW50TmFtZSl7XG5cdFx0XHRpZih0aGlzLnBhcmVudCl7XG5cdFx0XHRcdHRoaXMucGFyZW50LnRyaWdnZXIoZXZlbnROYW1lLHRoaXMpO1xuXHRcdFx0fVx0XHRcdFxuXHRcdH0sXG5cdFx0YmluZEV2ZW50czpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHRoaXMuZ3JvdXAub24oJ2NsaWNrJyxfLmJpbmQodGhpcy5oYW5kbGVDbGlja2V2ZW50cyx0aGlzKSk7XG5cdFx0XHRcblx0XHRcdHRoaXMuZ3JvdXAub24oJ21vdXNlb3ZlcicsZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYoIXRoYXQuc3ViZ3JvdXBvcHRpb25zLnNob3dPbkhvdmVyKSByZXR1cm47XG5cdFx0XHRcdHRoYXQuc3ViZ3JvdXAuc2hvdygpO1xuXHRcdFx0XHR0aGlzLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdtb3VzZW91dCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYoIXRoYXQuc3ViZ3JvdXBvcHRpb25zLmhpZGVPbkhvdmVyT3V0KSByZXR1cm47XG5cdFx0XHRcdHRoYXQuc3ViZ3JvdXAuaGlkZSgpO1xuXHRcdFx0XHR0aGlzLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHRoaXMub24oJ3Jlc2l6ZSBtb3ZlJyx0aGlzLnJlbmRlckNvbm5lY3RvcnMsdGhpcyk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5kcmF3KCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMub24oJ2NoYW5nZScsIHRoaXMuaGFuZGxlQ2hhbmdlLCB0aGlzKTtcblxuXHRcdH0sXG5cdFx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5ncm91cC5kZXN0cm95KCk7XG5cdFx0XHR0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblx0XHR9LFxuXHRcdGhhbmRsZUNoYW5nZTpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIG1vZGVsID0gdGhpcy5tb2RlbDtcblx0XHRcdGlmKHRoaXMucGFyZW50LnN5bmNpbmcpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihtb2RlbC5jaGFuZ2VkLnN0YXJ0IHx8IG1vZGVsLmNoYW5nZWQuZW5kKXtcblx0XHRcdFx0dmFyIHg9dGhpcy5jYWxjdWxhdGVYKG1vZGVsKTtcblx0XHRcdFx0aWYobW9kZWwuY2hhbmdlZC5zdGFydCl7XG5cdFx0XHRcdFx0dGhpcy5zZXRYMSh4LngxLHtvc2FtZTp0cnVlLGFic29sdXRlOnRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRoaXMuc2V0WDIoeC54Mix7b3NhbWU6dHJ1ZSxhYnNvbHV0ZTp0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5wYXJlbnQuc3luYygpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc29sZS5sb2coJ2RyYXdpbmcnKTtcblx0XHRcdHRoaXMuZHJhdygpO1xuXHRcdH0sXG5cdFx0aGFuZGxlQ2xpY2tldmVudHM6ZnVuY3Rpb24oZXZ0KXtcblx0XHRcdHZhciB0YXJnZXQsdGFyZ2V0TmFtZSxzdGFydEJhcjtcblx0XHRcdHRhcmdldD1ldnQudGFyZ2V0O1xuXHRcdFx0dGFyZ2V0TmFtZT10YXJnZXQuZ2V0TmFtZSgpO1xuXHRcdFx0d2luZG93LnN0YXJ0QmFyO1xuXHRcdFx0aWYodGFyZ2V0TmFtZSE9PSdtYWluYmFyJyl7XG5cdFx0XHRcdEJhci5kaXNhYmxlQ29ubmVjdG9yKCk7XG5cdFx0XHRcdGlmKHRhcmdldE5hbWU9PSdhbmNob3InKXtcblx0XHRcdFx0XHR0YXJnZXQuc3Ryb2tlKCdyZWQnKTtcblx0XHRcdFx0XHRCYXIuZW5hYmxlQ29ubmVjdG9yKHRoaXMpO1xuXHRcdFx0XHRcdHZhciBkZXB0ID0gdGhpcy5tb2RlbC5nZXQoJ2RlcGVuZGVuY3knKTtcblx0XHRcdFx0XHRpZihkZXB0ICE9IFwiXCIpe1xuXHRcdFx0XHRcdFx0d2luZG93LmN1cnJlbnREcHQucHVzaCh0aGlzLm1vZGVsLmdldCgnZGVwZW5kZW5jeScpKTtcdFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zb2xlLmxvZyh3aW5kb3cuY3VycmVudERwdCk7XG5cdFx0XHRcdFx0d2luZG93LnN0YXJ0QmFyID0gdGhpcy5tb2RlbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0aWYoKHN0YXJ0QmFyPUJhci5pc0Nvbm5lY3RvckVuYWJsZWQoKSkpe1xuXHRcdFx0XHRcdEJhci5jcmVhdGVSZWxhdGlvbihzdGFydEJhcix0aGlzKTtcblx0XHRcdFx0XHR3aW5kb3cuY3VycmVudERwdC5wdXNoKHRoaXMubW9kZWwuZ2V0KCdpZCcpKTtcblx0XHRcdFx0XHR3aW5kb3cuc3RhcnRCYXIuc2V0KCdkZXBlbmRlbmN5JywgSlNPTi5zdHJpbmdpZnkod2luZG93LmN1cnJlbnREcHQpKTtcblx0XHRcdFx0XHR3aW5kb3cuc3RhcnRCYXIuc2F2ZSgpO1xuXHRcdFx0XHRcdEJhci5kaXNhYmxlQ29ubmVjdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGV2dC5jYW5jZWxCdWJibGU9dHJ1ZTtcblx0XHR9LFxuXHRcdG1ha2VSZXNpemFibGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dGhpcy5yZXNpemFibGU9dHJ1ZTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZT1jcmVhdGVIYW5kbGUoe1xuXHRcdFx0XHR4OiAwLFxuXHRcdFx0XHR5OiAwLFxuXHRcdFx0XHRoZWlnaHQ6IHRoaXMuZ2V0SGVpZ2h0KCksXG5cdFx0XHRcdGRyYWdCb3VuZEZ1bmM6IHRoaXMuc2V0dGluZy5yZXNpemVCb3VuZEZ1bmMsXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGU9Y3JlYXRlSGFuZGxlKHtcblx0XHRcdFx0eDogdGhpcy5nZXRXaWR0aCgpLTIsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHRcdGhlaWdodDogdGhpcy5nZXRIZWlnaHQoKSxcblx0XHRcdFx0ZHJhZ0JvdW5kRnVuYzogdGhpcy5zZXR0aW5nLnJlc2l6ZUJvdW5kRnVuYyxcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZGlzYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5kaXNhYmxlU3ViZ3JvdXAoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZW5hYmxlU3ViZ3JvdXAoKTtcblx0XHRcdFx0dGhhdC5wYXJlbnQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLm9uKCdkcmFnZW5kJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcdHRoYXQucGFyZW50LnN5bmMoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ2RyYWdtb3ZlJyxiZWZvcmViaW5kKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQucmVuZGVyKCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplbGVmdCcsdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplJyx0aGF0KTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyUGFyZW50KCdyZXNpemUnKTtcblx0XHRcdH0pKTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ2RyYWdtb3ZlJyxiZWZvcmViaW5kKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQucmVuZGVyKCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplcmlnaHQnLHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ3Jlc2l6ZScsdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlclBhcmVudCgncmVzaXplJyk7XG5cdFx0XHR9KSk7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ21vdXNlb3ZlcicsdGhpcy5jaGFuZ2VSZXNpemVDdXJzb3IpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignbW91c2VvdmVyJyx0aGlzLmNoYW5nZVJlc2l6ZUN1cnNvcik7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ21vdXNlb3V0Jyx0aGlzLmNoYW5nZURlZmF1bHRDdXJzb3IpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignbW91c2VvdXQnLHRoaXMuY2hhbmdlRGVmYXVsdEN1cnNvcik7XG5cdFx0XHRcblx0XHRcdHRoaXMuZ3JvdXAuYWRkKHRoaXMubGVmdEhhbmRsZSk7XG5cdFx0XHR0aGlzLmdyb3VwLmFkZCh0aGlzLnJpZ2h0SGFuZGxlKTtcblxuXG5cdFx0fSxcblx0XHRhZGRTdWJncm91cDpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5oYXNTdWJHcm91cD10cnVlO1xuXHRcdFx0dmFyIHN1Ymdyb3VwLHRoYXQ9dGhpcztcblx0XHRcdHN1Ymdyb3VwPXRoaXMuc3ViZ3JvdXA9Y3JlYXRlU3ViR3JvdXAoe2hlaWdodDp0aGlzLmdldEhlaWdodCgpfSk7XG5cdFx0XHRzdWJncm91cC5oaWRlKCk7XG5cdFx0XHRzdWJncm91cC5zZXRYKHRoaXMuZ2V0V2lkdGgoKSk7XG5cdFx0XHR0aGlzLmdyb3VwLmFkZChzdWJncm91cCk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0Ly90aGlzLmJpbmRBbmNob3IoKTtcblx0XHR9LFxuXHRcdGVuYWJsZVN1Ymdyb3VwOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnN1Ymdyb3Vwb3B0aW9ucy5zaG93T25Ib3Zlcj10cnVlO1xuXHRcdFx0dGhpcy5zdWJncm91cC5zZXRYKHRoaXMuZ2V0V2lkdGgoKSk7XG5cdFx0fSxcblx0XHRkaXNhYmxlU3ViZ3JvdXA6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuc3ViZ3JvdXBvcHRpb25zLnNob3dPbkhvdmVyPXRydWU7XG5cdFx0XHR0aGlzLnN1Ymdyb3VwLmhpZGUoKTtcblx0XHR9LFxuXHRcdFxuXHRcdGJpbmRBbmNob3I6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dmFyIGFuY2hvcj10aGlzLnN1Ymdyb3VwLmZpbmQoJy5hbmNob3InKTtcblx0XHRcdGFuY2hvci5vbignY2xpY2snLGZ1bmN0aW9uKGV2dCl7XG5cdFx0XHRcdGFuY2hvci5zdHJva2UoJ3JlZCcpO1xuXHRcdFx0XHR0aGF0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dD1mYWxzZTtcblx0XHRcdFx0S2luZXRpYy5Db25uZWN0LnN0YXJ0PXRoYXQ7XG5cdFx0XHRcdHRoaXMuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0XHRcdGV2dC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuXHRcdFx0fSk7XG5cblx0XHR9LFxuXHRcdFxuXHRcdG1ha2VEcmFnZ2FibGU6IGZ1bmN0aW9uKG9wdGlvbil7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dGhpcy5ncm91cC5kcmFnZ2FibGUodHJ1ZSk7XG5cdFx0XHRpZih0aGlzLnNldHRpbmcuZHJhZ0JvdW5kRnVuYyl7XG5cdFx0XHRcdHRoaXMuZ3JvdXAuZHJhZ0JvdW5kRnVuYyh0aGlzLnNldHRpbmcuZHJhZ0JvdW5kRnVuYyk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdkcmFnbW92ZScsYmVmb3JlYmluZChmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ21vdmUnK2dldERyYWdEaXIodGhpcy5nZXRTdGFnZSgpKSx0aGF0KTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdtb3ZlJyk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlclBhcmVudCgnbW92ZScpO1xuXHRcdFx0fSkpO1xuXHRcdFx0dGhpcy5ncm91cC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5wYXJlbnQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjaGFuZ2VSZXNpemVDdXJzb3I6ZnVuY3Rpb24odHlwZSl7XG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xuXHRcdH0sXG5cdFx0Y2hhbmdlRGVmYXVsdEN1cnNvcjpmdW5jdGlvbih0eXBlKXtcblx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuXHRcdH0sXG5cdFx0Ly9yZW5kZXJzIHRoZSBoYW5kbGUgYnkgaXRzIHJlY3Rcblx0XHRyZW5kZXJIYW5kbGU6ZnVuY3Rpb24oKXtcblx0XHRcdGlmKCF0aGlzLnJlc2l6YWJsZSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0dmFyIHg9dGhpcy5yZWN0LmdldFgoKTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5zZXRYKHgpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5zZXRYKHgrdGhpcy5yZWN0LmdldFdpZHRoKCktMik7XG5cdFx0fSxcblx0XHRcblx0XHRcblx0XHQvL3JlbmRlcnMgdGhlIGJhciBieSB0aGUgaGFuZGxlc1xuXHRcdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBsZWZ0eD10aGlzLmxlZnRIYW5kbGUuZ2V0WCgpO1xuXHRcdFx0dmFyIHdpZHRoPXRoaXMucmlnaHRIYW5kbGUuZ2V0WCgpLWxlZnR4KzI7XG5cdFx0XHR0aGlzLmdyb3VwLnNldFgodGhpcy5ncm91cC5nZXRYKCkrbGVmdHgpO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLnNldFgoMCk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLnNldFgod2lkdGgtMik7XG5cdFx0XHR0aGlzLnJlY3Quc2V0V2lkdGgod2lkdGgpO1xuXHRcdFx0dmFyIHdpZHRoMiA9IHRoaXMucmVjdC5nZXRXaWR0aCgpICAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCk7XG5cdFx0XHRpZih3aWR0aDIpXG5cdFx0XHRcdHRoaXMuY29tcGxldGVCYXIuc2V0V2lkdGgod2lkdGgyIC0gNCk7XG5cdFx0fSxcblx0XHQvKlxuXHRcdFx0ZGVwZW5kZW50T2JqOiB7J2VsZW0nOmRlcGVuZGFudCwnY29ubmVjdG9yJzpjb25uZWN0b3J9XG5cdFx0XHQqL1xuXHRcdFx0YWRkRGVwZW5kYW50OmZ1bmN0aW9uKGRlcGVuZGFudE9iail7XG5cdFx0XHRcdHRoaXMubGlzdGVuVG8oZGVwZW5kYW50T2JqLmVsZW0sJ21vdmVsZWZ0IHJlc2l6ZWxlZnQnLHRoaXMuYWRqdXN0bGVmdClcblx0XHRcdFx0dGhpcy5kZXBlbmRhbnRzLnB1c2goZGVwZW5kYW50T2JqKTtcblx0XHRcdH0sXG5cdFx0Ly9yZW5kZXJzIHRoZSBiYXIgYnkgaXRzIG1vZGVsIFxuXHRcdHJlbmRlckJhcjpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHggPSB0aGlzLmNhbGN1bGF0ZVgoKTtcblx0XHRcdHRoaXMuc2V0WDEoeC54MSx7YWJzb2x1dGU6dHJ1ZSwgc2lsZW50OnRydWV9KTtcblx0XHRcdHRoaXMuc2V0WDIoeC54Mix7YWJzb2x1dGU6dHJ1ZSwgc2lsZW50OnRydWUsIG9zYW1lOnRydWV9KTtcblx0XHRcdHRoaXMucmVuZGVyQ29ubmVjdG9ycygpO1xuXHRcdH0sXG5cdFx0XG5cdFx0YWRkRGVwZW5kYW5jeTogZnVuY3Rpb24oZGVwZW5kZW5jeU9iail7XG5cdFx0XHR0aGlzLmxpc3RlblRvKGRlcGVuZGVuY3lPYmouZWxlbSwnbW92ZXJpZ2h0IHJlc2l6ZXJpZ2h0Jyx0aGlzLmFkanVzdHJpZ2h0KTtcblx0XHRcdHRoaXMuZGVwZW5kZW5jaWVzLnB1c2goZGVwZW5kZW5jeU9iaik7XG5cdFx0XHR0aGlzLnJlbmRlckNvbm5lY3RvcihkZXBlbmRlbmN5T2JqLDIpO1xuXHRcdH0sXG5cdFx0Ly9jaGVja3MgaWYgdGhlIGJhciBuZWVkcyBtb3ZlbWVudCBpbiBsZWZ0IHNpZGUgb24gbGVmdCBtb3ZlbWVudCBvZiBkZXBlbmRlbnQgYW5kIG1ha2VzIGFkanVzdG1lbnRcblx0XHRhZGp1c3RsZWZ0OmZ1bmN0aW9uKGRlcGVuZGFudCl7XG5cdFx0XHRpZighdGhpcy5pc0RlcGVuZGFudChkZXBlbmRhbnQpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgZHg9dGhpcy5nZXRYMSgpK3RoaXMuZ2V0V2lkdGgoKS1kZXBlbmRhbnQuZ2V0WDEoKTtcblx0XHRcdC8vYW4gb3ZlcmxhcCBvY2N1cnMgaW4gdGhpcyBjYXNlXG5cdFx0XHRpZihkeD4wKXtcblx0XHRcdFx0Ly9ldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBpbiBtb3ZlIGZ1bmNcblx0XHRcdFx0dGhpcy5tb3ZlKC0xKmR4KTtcblx0XHRcdFx0Ly90aGlzLnRyaWdnZXIoJ21vdmVsZWZ0Jyx0aGlzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGFkanVzdHJpZ2h0OmZ1bmN0aW9uKGRlcGVuZGVuY3kpe1xuXHRcdFx0aWYoIXRoaXMuaXNEZXBlbmRlbmN5KGRlcGVuZGVuY3kpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgZHg9ZGVwZW5kZW5jeS5nZXRYMSgpK2RlcGVuZGVuY3kuZ2V0V2lkdGgoKS10aGlzLmdldFgxKCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGR4KTtcblx0XHRcdGlmKGR4PjApe1xuXHRcdFx0XHQvL2V2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGluIG1vdmUgZnVuY1xuXHRcdFx0XHR0aGlzLm1vdmUoZHgpO1xuXHRcdFx0XHQvL3RoaXMudHJpZ2dlcignbW92ZXJpZ2h0Jyx0aGlzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGlzRGVwZW5kYW50OmZ1bmN0aW9uKGRlcGVuZGFudCl7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZGVwZW5kYW50cy5sZW5ndGg7aSsrKXtcblx0XHRcdFx0aWYodGhpcy5kZXBlbmRhbnRzW2ldWydlbGVtJ11bJ2JhcmlkJ109PT1kZXBlbmRhbnRbJ2JhcmlkJ10pe1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXHRcdC8vQHR5cGUgRGVwZW5kYW50OjEsIERlcGVuZGVuY3k6MlxuXHRcdHJlbmRlckNvbm5lY3RvcjpmdW5jdGlvbihvYmosdHlwZSl7XG5cdFx0XHRpZih0eXBlPT0xKXtcblx0XHRcdFx0QmFyLnJlbmRlckNvbm5lY3Rvcih0aGlzLG9iai5lbGVtLG9iai5jb25uZWN0b3IpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0QmFyLnJlbmRlckNvbm5lY3RvcihvYmouZWxlbSx0aGlzLG9iai5jb25uZWN0b3IpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly9yZW5kZXJzIGFsbCBjb25uZWN0b3JzXG5cdFx0cmVuZGVyQ29ubmVjdG9yczpmdW5jdGlvbigpe1xuXHRcdFx0Zm9yKHZhciBpPTAsaUxlbj10aGlzLmRlcGVuZGFudHMubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHR0aGlzLnJlbmRlckNvbm5lY3Rvcih0aGlzLmRlcGVuZGFudHNbaV0sMSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IodmFyIGk9MCxpTGVuPXRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0dGhpcy5yZW5kZXJDb25uZWN0b3IodGhpcy5kZXBlbmRlbmNpZXNbaV0sMik7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpc0RlcGVuZGVuY3k6IGZ1bmN0aW9uKGRlcGVuZGVuY3kpe1xuXHRcdFx0XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRpZih0aGlzLmRlcGVuZGVuY2llc1tpXVsnZWxlbSddWydiYXJpZCddPT09ZGVwZW5kZW5jeVsnYmFyaWQnXSl7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdG1vdmU6IGZ1bmN0aW9uKGR4LHNpbGVudCl7XG5cdFx0XHRpZihkeD09PTApIHJldHVybjtcblx0XHRcdHRoaXMuZ3JvdXAubW92ZSh7eDpkeH0pO1xuXHRcdFx0aWYoIXNpbGVudCl7XG5cdFx0XHRcdHRoaXMudHJpZ2dlcignbW92ZScsdGhpcyk7XG5cdFx0XHRcdGlmKGR4PjApe1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcignbW92ZXJpZ2h0Jyx0aGlzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcignbW92ZWxlZnQnLHRoaXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMudHJpZ2dlclBhcmVudCgnbW92ZScpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2FsY3VsYXRlWDpmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHQhbW9kZWwgJiYgKG1vZGVsPXRoaXMubW9kZWwpO1xuXHRcdFx0dmFyIGF0dHJzPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxuXHRcdFx0ZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHgxOihEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLG1vZGVsLmdldCgnc3RhcnQnKSkpKmRheXNXaWR0aCxcblx0XHRcdFx0eDI6RGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbixtb2RlbC5nZXQoJ2VuZCcpKSpkYXlzV2lkdGgsXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Y2FsY3VsYXRlRGF0ZXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBhdHRycz10aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxuXHRcdFx0ZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcblx0XHRcdHZhciBkYXlzMT1NYXRoLnJvdW5kKHRoaXMuZ2V0WDEodHJ1ZSkvZGF5c1dpZHRoKSxkYXlzMj1NYXRoLnJvdW5kKHRoaXMuZ2V0WDIodHJ1ZSkvZGF5c1dpZHRoKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXG5cdFx0XHRcdGVuZDpib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czItMSlcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0sXG5cdFx0Z2V0UmVjdHBhcmFtczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHNldHRpbmc9dGhpcy5zZXR0aW5nO1xuXHRcdFx0dmFyIHhzICA9dGhpcy5jYWxjdWxhdGVYKHRoaXMubW9kZWwpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykpO1xuXHRcdFx0cmV0dXJuIF8uZXh0ZW5kKHtcblx0XHRcdFx0eDowLFxuXHRcdFx0XHR3aWR0aDp4cy54Mi14cy54MSxcblx0XHRcdFx0eTogMCxcblx0XHRcdFx0bmFtZTonbWFpbmJhcicsXG5cdFx0XHRcdGhlaWdodDpzZXR0aW5nLmJhcmhlaWdodFxuXHRcdFx0fSxzZXR0aW5nLnJlY3RvcHRpb24pO1xuXHRcdH0sXG5cdFx0Z2V0R3JvdXBQYXJhbXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciB4cz10aGlzLmNhbGN1bGF0ZVgodGhpcy5tb2RlbCk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4cy54MSxcblx0XHRcdFx0eTogMFxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHRvZ2dsZTpmdW5jdGlvbihzaG93KXtcblx0XHRcdHZhciBtZXRob2QgPSBzaG93ID8gJ3Nob3cnIDogJ2hpZGUnO1xuXHRcdFx0Y29uc29sZS5sb2coJ21ldGhvZCcsIG1ldGhvZCk7XG5cdFx0XHR0aGlzLmdyb3VwW21ldGhvZF0oKTtcblx0XHRcdGZvcih2YXIgaT0wLGlMZW49dGhpcy5kZXBlbmRlbmNpZXMubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHR0aGlzLmRlcGVuZGVuY2llc1tpXS5jb25uZWN0b3JbbWV0aG9kXSgpO1xuXHRcdFx0fVxuLy9cdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXHRcdH0sXG5cdFx0ZHJhdzpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5ncm91cC5nZXRMYXllcigpLmRyYXcoKTtcblxuXHRcdH0sXG5cdFx0c3luYzpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGRhdGVzID0gdGhpcy5jYWxjdWxhdGVEYXRlcygpO1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoe1xuXHRcdFx0XHRzdGFydDogZGF0ZXMuc3RhcnQsXG5cdFx0XHRcdGVuZDogZGF0ZXMuZW5kXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZSgpO1xuXHRcdH1cblx0fTtcblx0Ly9JdCBjcmVhdGVzIGEgcmVsYXRpb24gYmV0d2VlbiBkZXBlbmRhbnQgYW5kIGRlcGVuZGVuY3lcblx0Ly9EZXBlbmRhbnQgaXMgdGhlIHRhc2sgd2hpY2ggbmVlZHMgdG8gYmUgZG9uZSBhZnRlciBkZXBlbmRlbmN5XG5cdC8vU3VwcG9zZSB0YXNrIEIgcmVxdWlyZXMgdGFzayBBIHRvIGJlIGRvbmUgYmVmb3JlaGFuZC4gU28sIEEgaXMgZGVwZW5kYW5jeS9yZXF1aXJlbWVudCBmb3IgQiB3aGVyZWFzIEIgaXMgZGVwZW5kYW50IG9uIEEuXG5cdEJhci5jcmVhdGVSZWxhdGlvbj1mdW5jdGlvbihkZXBlbmRlbmN5LGRlcGVuZGFudCl7XG5cdFx0dmFyIGNvbm5lY3RvcixwYXJlbnQ7XG5cdFx0cGFyZW50PWRlcGVuZGFudC5ncm91cC5nZXRQYXJlbnQoKTtcblx0XHRjb25uZWN0b3I9dGhpcy5jcmVhdGVDb25uZWN0b3IoKTtcblx0XHRkZXBlbmRlbmN5LmFkZERlcGVuZGFudCh7XG5cdFx0XHQnZWxlbSc6ZGVwZW5kYW50LFxuXHRcdFx0J2Nvbm5lY3Rvcic6IGNvbm5lY3Rvcixcblx0XHR9KTtcblx0XHRkZXBlbmRhbnQuYWRkRGVwZW5kYW5jeSh7XG5cdFx0XHQnZWxlbSc6ZGVwZW5kZW5jeSxcblx0XHRcdCdjb25uZWN0b3InOiBjb25uZWN0b3IsXG5cdFx0fSk7XG5cdFx0XG5cdFx0cGFyZW50LmFkZChjb25uZWN0b3IpO1xuXHRcdFxuXHR9XG5cdFxuXHRCYXIuY3JlYXRlQ29ubmVjdG9yPWZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIG5ldyBLaW5ldGljLkxpbmUoe1xuXHRcdFx0c3Ryb2tlV2lkdGg6IDEsXG5cdFx0XHRzdHJva2U6ICdibGFjaycsXG5cdFx0XHRwb2ludHM6IFswLCAwXVxuXHRcdH0pO1xuXHRcdFxuXHR9LFxuXHRCYXIuZW5hYmxlQ29ubmVjdG9yPWZ1bmN0aW9uKHN0YXJ0KXtcblx0XHRLaW5ldGljLkNvbm5lY3Quc3RhcnQ9c3RhcnQ7XG5cdFx0c3RhcnQuc3ViZ3JvdXBvcHRpb25zLmhpZGVPbkhvdmVyT3V0PWZhbHNlO1xuXHR9XG5cdEJhci5kaXNhYmxlQ29ubmVjdG9yPWZ1bmN0aW9uKCl7XG5cdFx0aWYoIUtpbmV0aWMuQ29ubmVjdC5zdGFydCkgcmV0dXJuO1xuXHRcdHZhciBzdGFydD1LaW5ldGljLkNvbm5lY3Quc3RhcnQ7XG5cdFx0c3RhcnQuc3ViZ3JvdXBvcHRpb25zLmhpZGVPbkhvdmVyT3V0PXRydWU7XG5cdFx0S2luZXRpYy5Db25uZWN0LnN0YXJ0PW51bGw7XG5cdH1cblx0XG5cdEJhci5pc0Nvbm5lY3RvckVuYWJsZWQ9ZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gS2luZXRpYy5Db25uZWN0LnN0YXJ0O1xuXHR9XG5cdEJhci5yZW5kZXJDb25uZWN0b3I9ZnVuY3Rpb24oc3RhcnRCYXIsZW5kQmFyLGNvbm5lY3Rvcil7XG5cdFx0XG5cdFx0dmFyIHBvaW50MSxwb2ludDIsaGFsZmhlaWdodCxwb2ludHMsY29sb3I9JyMwMDAnO1xuXHRcdGhhbGZoZWlnaHQ9cGFyc2VJbnQoc3RhcnRCYXIuZ2V0SGVpZ2h0KCkvMik7XG5cdFx0cG9pbnQxPXtcblx0XHRcdHg6c3RhcnRCYXIuZ2V0WDIoKSxcblx0XHRcdHk6c3RhcnRCYXIuZ2V0WSgpK2hhbGZoZWlnaHQsXG5cdFx0fVxuXHRcdHBvaW50Mj17XG5cdFx0XHR4OmVuZEJhci5nZXRYMSgpLFxuXHRcdFx0eTplbmRCYXIuZ2V0WSgpK2hhbGZoZWlnaHQsXG5cdFx0fVxuXHRcdHZhciBvZmZzZXQ9NSxhcnJvd2ZsYW5rPTQsYXJyb3doZWlnaHQ9NSxib3R0b21vZmZzZXQ9NDtcblx0XHRcblxuXHRcdGlmKHBvaW50Mi54LXBvaW50MS54PDApe1xuXHRcdFx0aWYocG9pbnQyLnk8cG9pbnQxLnkpe1xuXHRcdFx0XHRoYWxmaGVpZ2h0PSAtMSpoYWxmaGVpZ2h0O1xuXHRcdFx0XHRib3R0b21vZmZzZXQ9LTEqYm90dG9tb2Zmc2V0O1xuXHRcdFx0XHQvL2Fycm93aGVpZ2h0PS0xKmFycm93aGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0cG9pbnRzPVtcblx0XHRcdHBvaW50MS54LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50MS55K2hhbGZoZWlnaHQrYm90dG9tb2Zmc2V0LFxuXHRcdFx0cG9pbnQyLngtb2Zmc2V0LHBvaW50MS55K2hhbGZoZWlnaHQrYm90dG9tb2Zmc2V0LFxuXHRcdFx0cG9pbnQyLngtb2Zmc2V0LHBvaW50Mi55LFxuXHRcdFx0cG9pbnQyLngscG9pbnQyLnksXG5cdFx0XHRwb2ludDIueC1hcnJvd2hlaWdodCxwb2ludDIueS1hcnJvd2ZsYW5rLFxuXHRcdFx0cG9pbnQyLngtYXJyb3doZWlnaHQscG9pbnQyLnkrYXJyb3dmbGFuayxcblx0XHRcdHBvaW50Mi54LHBvaW50Mi55XG5cdFx0XHRdO1xuXHRcdFx0Y29sb3I9J3JlZCc7XG5cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZSBpZihwb2ludDIueC1wb2ludDEueDw1KXtcblx0XHRcdGlmKHBvaW50Mi55PHBvaW50MS55KXtcblx0XHRcdFx0aGFsZmhlaWdodD0gLTEqaGFsZmhlaWdodDtcblx0XHRcdFx0Ym90dG9tb2Zmc2V0PS0xKmJvdHRvbW9mZnNldDtcblx0XHRcdFx0YXJyb3doZWlnaHQ9LTEqYXJyb3doZWlnaHQ7XG5cdFx0XHR9XG5cdFx0XHRwb2ludHM9W1xuXHRcdFx0cG9pbnQxLngscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQyLnktaGFsZmhlaWdodCxcblx0XHRcdHBvaW50MS54K29mZnNldC1hcnJvd2ZsYW5rLHBvaW50Mi55LWhhbGZoZWlnaHQtYXJyb3doZWlnaHQsXG5cdFx0XHRwb2ludDEueCtvZmZzZXQrYXJyb3dmbGFuayxwb2ludDIueS1oYWxmaGVpZ2h0LWFycm93aGVpZ2h0LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50Mi55LWhhbGZoZWlnaHRcblx0XHRcdF07XG5cblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHBvaW50cz1bXG5cdFx0XHRwb2ludDEueCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDIueSxcblx0XHRcdHBvaW50Mi54LHBvaW50Mi55LFxuXHRcdFx0cG9pbnQyLngtYXJyb3doZWlnaHQscG9pbnQyLnktYXJyb3dmbGFuayxcblx0XHRcdHBvaW50Mi54LWFycm93aGVpZ2h0LHBvaW50Mi55K2Fycm93ZmxhbmssXG5cdFx0XHRwb2ludDIueCxwb2ludDIueVxuXHRcdFx0XTtcblx0XHR9XG5cdFx0Y29ubmVjdG9yLnNldEF0dHIoJ3N0cm9rZScsY29sb3IpO1xuXHRcdGNvbm5lY3Rvci5zZXRQb2ludHMocG9pbnRzKTtcblx0fVxuXHRcblx0S2luZXRpYy5Db25uZWN0PXtcblx0XHRzdGFydDpmYWxzZSxcblx0XHRlbmQ6ZmFsc2Vcblx0fVxuXHRcblx0XG5cdFxuXHRfLmV4dGVuZChCYXIucHJvdG90eXBlLCBCYWNrYm9uZS5FdmVudHMpO1xuXG5cdG1vZHVsZS5leHBvcnRzID0gQmFyOyIsInZhciBCYXIgPSByZXF1aXJlKCcuL0JhcicpO1xuXG52YXIgQmFyR3JvdXAgPSBmdW5jdGlvbihvcHRpb25zKXtcblx0dGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCdiZycpO1xuXHR0aGlzLnNldHRpbmdzID0gb3B0aW9ucy5zZXR0aW5ncztcblx0dGhpcy5tb2RlbCA9IG9wdGlvbnMubW9kZWw7XG5cdHZhciBzZXR0aW5nID0gdGhpcy5zZXR0aW5nID0gb3B0aW9ucy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdncm91cCcpO1xuXHR0aGlzLmF0dHIgPSB7XG5cdFx0aGVpZ2h0OiAwXG5cdH07XG5cdHRoaXMuc3luY2luZyA9IGZhbHNlO1xuXHR0aGlzLmNoaWxkcmVuID0gW107XG5cblx0dGhpcy5ncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHRoaXMuZ2V0R3JvdXBQYXJhbXMoKSk7XG5cdHRoaXMudG9wYmFyID0gbmV3IEtpbmV0aWMuUmVjdCh0aGlzLmdldFJlY3RwYXJhbXMoKSk7XG5cdHRoaXMuZ3JvdXAuYWRkKHRoaXMudG9wYmFyKTtcblxuXHR0aGlzLmF0dHIuaGVpZ2h0ICs9ICBzZXR0aW5nLnJvd0hlaWdodDtcblxuXHRpZihzZXR0aW5nLmRyYWdnYWJsZSl7XG5cdFx0dGhpcy5tYWtlRHJhZ2dhYmxlKCk7XG5cdH1cblx0aWYoc2V0dGluZy5yZXNpemFibGUpe1xuXHRcdHRoaXMudG9wYmFyLm1ha2VSZXNpemFibGUoKTtcblx0fVxuXHR0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbkJhckdyb3VwLnByb3RvdHlwZT17XG5cdFx0aW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5tb2RlbC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJTb3J0ZWRDaGlsZHJlbih0cnVlKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHZhciB2aWV3Rm9yRGVsZXRlID0gXy5maW5kKHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5tb2RlbCA9PT0gY2hpbGQ7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0aGlzLmNoaWxkcmVuID0gXy53aXRob3V0KHRoaXMuY2hpbGRyZW4sIHZpZXdGb3JEZWxldGUpO1xuXHRcdFx0XHR2aWV3Rm9yRGVsZXRlLmRlc3Ryb3koKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJTb3J0ZWRDaGlsZHJlbih0cnVlKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKHRydWUpO1xuXHRcdFx0dGhpcy5yZW5kZXJEZXBlbmRlbmN5KCk7XG5cdFx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0XHR9LFxuXHRcdGRlc3Ryb3kgOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuZ3JvdXAuZGVzdHJveSgpO1xuXHRcdH0sXG5cdFx0cmVuZGVyU29ydGVkQ2hpbGRyZW46ZnVuY3Rpb24obm9kcmF3KXtcblx0XHRcdCFub2RyYXcgJiYgKG5vZHJhdz1mYWxzZSk7XG5cdFx0XHR2YXIgc29ydGVkPV8uc29ydEJ5KHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uKGl0ZW1iYXIpe1xuXHRcdFx0XHRyZXR1cm4gaXRlbWJhci5tb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmF0dHIuaGVpZ2h0PXRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHNvcnRlZC5sZW5ndGg7aSsrKXtcblx0XHRcdFx0c29ydGVkW2ldLnNldFkodGhpcy5nZXRIZWlnaHQoKSt0aGlzLnNldHRpbmcuZ2FwKTtcblx0XHRcdFx0c29ydGVkW2ldLnJlbmRlckNvbm5lY3RvcnMoKTtcblx0XHRcdFx0dGhpcy5hdHRyLmhlaWdodCArPSB0aGlzLnNldHRpbmcucm93SGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0aWYoIW5vZHJhdykge1xuXHRcdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZmluZEJ5SWQ6ZnVuY3Rpb24oaWQpe1xuXHRcdFx0dmFyIGNoaWxkcmVuPXRoaXMuY2hpbGRyZW47XG5cdFx0XHRmb3IodmFyIGk9MDtpPGNoaWxkcmVuLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRpZihjaGlsZHJlbltpXS5tb2RlbC5nZXQoJ2lkJyk9PT1pZClcblx0XHRcdFx0XHRyZXR1cm4gY2hpbGRyZW5baV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXHRcdHJlbmRlckRlcGVuZGVuY3k6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBjaGlsZHJlbj10aGlzLmNoaWxkcmVuLGRlcGVuZGVuY2llcz1bXSxiYXI7XG5cdFx0XHRmb3IodmFyIGk9MDtpPGNoaWxkcmVuLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRkZXBlbmRlbmNpZXM9Y2hpbGRyZW5baV0ubW9kZWwuZ2V0KCdkZXBlbmRlbmN5Jyk7XG5cdFx0XHRcdGZvcih2YXIgaj0wO2o8ZGVwZW5kZW5jaWVzLmxlbmd0aDtqKyspe1xuXHRcdFx0XHRcdGJhcj10aGlzLmZpbmRCeUlkKGRlcGVuZGVuY2llc1tqXVsnaWQnXSk7XG5cdFx0XHRcdFx0aWYoYmFyKXtcblx0XHRcdFx0XHRcdEJhci5jcmVhdGVSZWxhdGlvbihiYXIsY2hpbGRyZW5baV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0bWFrZURyYWdnYWJsZTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0XHR0aGlzLmdyb3VwLmRyYWdnYWJsZSh0cnVlKTtcblx0XHRcdGlmKHRoaXMuc2V0dGluZy5kcmFnQm91bmRGdW5jKXtcblx0XHRcdFx0dGhpcy5ncm91cC5kcmFnQm91bmRGdW5jKHRoaXMuc2V0dGluZy5kcmFnQm91bmRGdW5jKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JvdXAub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHQvL3JldHVybnMgdGhlIHggcG9zaXRpb24gb2YgdGhlIGdyb3VwXG5cdFx0Ly9UaGUgeCBwb3NpdGlvbiBvZiB0aGUgZ3JvdXAgaXMgc2V0IDAgaW5pdGlhbGx5LlRoZSB0b3BiYXIgeCBwb3NpdGlvbiBpcyBzZXQgcmVsYXRpdmUgdG8gZ3JvdXBzIDAgcG9zaXRpb24gaW5pdGlhbGx5LiB3aGVuIHRoZSBncm91cCBpcyBtb3ZlZCB0byBnZXQgdGhlIGFic29sdXRlIHggcG9zaXRpb24gb2YgdGhlIHRvcCBiYXIgdXNlIGdldFgxIG1ldGhvZC5cblx0XHQvL1RoZSBwcm9ibGVtIGlzIHdoZW4gYW55IGNoaWxkcmVuIGdldCBvdXRzaWRlIG9mIGJvdW5kIHRoZW4gdGhlIHBvc2l0aW9uIG9mIGVhY2ggY2hpbGRyZW4gaGFzIHRvIGJlIHVwZGF0ZWQuIFRoaXMgd2F5IHNvbHZlcyB0aGUgcHJvYmxlbVxuXHRcdGdldFg6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFgoKTtcblx0XHR9LFxuXHRcdC8vcmV0dXJucyB0aGUgYmJzb2x1dGUgeDEgcG9zaXRpb24gb2YgdG9wIGJhclxuXHRcdGdldFgxOmZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy5ncm91cC5nZXRYKCkrdGhpcy50b3BiYXIuZ2V0WCgpO1xuXHRcdH0sXG5cdFx0Ly9yZXR1cm5zIHRoZSBhYnNvbHV0ZSB4MSBwb3NpdGlvbiBvZiB0b3AgYmFyXG5cdFx0Z2V0WDI6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdldFgxKCkrdGhpcy50b3BiYXIuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdGdldFkxOmZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy5ncm91cC5nZXRZKCk7XG5cdFx0fSxcblx0XHRzZXRZOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdHRoaXMuZ3JvdXAuc2V0WSh2YWx1ZSk7XG5cdFx0fSxcblx0XHRnZXRXaWR0aDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMudG9wYmFyLmdldFdpZHRoKCk7XG5cdFx0fSxcblx0XHRnZXRIZWlnaHQ6ZnVuY3Rpb24oKXtcblx0XHRcdGlmKHRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKSlcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXR0ci5oZWlnaHQ7XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdncm91cCcsJ3Jvd0hlaWdodCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Z2V0Q3VycmVudEhlaWdodDpmdW5jdGlvbigpe1xuXHRcdFx0aWYodGhpcy5tb2RlbC5nZXQoJ2FjdGl2ZScpKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5hdHRyLmhlaWdodDtcblx0XHRcdGVsc2V7XG5cdFx0XHRcdHJldHVybiB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2dyb3VwJywncm93SGVpZ2h0Jyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRcblx0XHRhZGRDaGlsZDogZnVuY3Rpb24oYmFyKXtcblx0XHRcdHRoaXMuY2hpbGRyZW4ucHVzaChiYXIpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQoYmFyLmdyb3VwKTtcblx0XHRcdHZhciB4PWJhci5nZXRYMSh0cnVlKTtcblx0XHRcdC8vbWFrZSBiYXIgeCByZWxhdGl2ZSB0byB0aGlzIGdyb3VwXG5cdFx0XHRiYXIuc2V0UGFyZW50KHRoaXMpO1xuXHRcdFx0YmFyLnNldFgxKHgse2Fic29sdXRlOnRydWUsc2lsZW50OnRydWV9KTtcblx0XHRcdGJhci5zZXRZKHRoaXMuZ2V0SGVpZ2h0KCkrdGhpcy5zZXR0aW5nLmdhcCk7XG5cdFx0XHR0aGlzLmF0dHIuaGVpZ2h0ICs9IHRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHRiYXIuZ3JvdXAudmlzaWJsZSh0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpO1xuXHRcdH0sXG5cdFx0cmVuZGVyQ2hpbGRyZW46ZnVuY3Rpb24oKXtcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy5jaGlsZHJlbi5sZW5ndGg7aSsrKXtcblx0XHRcdFx0dGhpcy5jaGlsZHJlbltpXS5yZW5kZXJCYXIoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVuZGVyVG9wQmFyKCk7XG5cblx0XHR9LFxuXHRcdHJlbmRlclRvcEJhcjpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHBhcmVudD10aGlzLm1vZGVsO1xuXHRcdFx0dmFyIHg9dGhpcy5jYWxjdWxhdGVYKHBhcmVudCk7XG5cdFx0XHR0aGlzLnRvcGJhci5zZXRYKHgueDEtdGhpcy5ncm91cC5nZXRYKCkpO1xuXHRcdFx0dGhpcy50b3BiYXIuc2V0V2lkdGgoeC54Mi14LngxKTtcblx0XHR9LFxuXHRcdGJpbmRFdmVudHM6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMub24oJ3Jlc2l6ZSBtb3ZlJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgbWluWCxtYXhYO1xuXHRcdFx0XHRtaW5YPV8ubWluKHRoaXMuY2hpbGRyZW4sZnVuY3Rpb24oYmFyKXtcblx0XHRcdFx0XHRyZXR1cm4gYmFyLmdldFgxKCk7XG5cdFx0XHRcdH0pLmdldFgxKCk7XG5cdFx0XHRcdG1heFg9Xy5tYXgodGhpcy5jaGlsZHJlbixmdW5jdGlvbihiYXIpe1xuXHRcdFx0XHRcdHJldHVybiBiYXIuZ2V0WDIoKTtcblx0XHRcdFx0fSkuZ2V0WDIoKTtcblx0XHRcdFx0dGhpcy50b3BiYXIuc2V0WChtaW5YKTtcblx0XHRcdFx0dGhpcy50b3BiYXIuc2V0V2lkdGgobWF4WC1taW5YKTtcblxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6YWN0aXZlJywgdGhpcy50b2dnbGVDaGlsZHJlbik7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdvbnNvcnQnLCB0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dGhpcy50b3BiYXIuc2V0QXR0cnModGhpcy5nZXRSZWN0cGFyYW1zKCkpO1xuXHRcdFx0XHR0aGlzLnRvcGJhci5nZXRMYXllcigpLmRyYXcoKTtcblx0XHRcdH0pO1xuXG5cdFx0fSxcblx0XHRnZXRHcm91cFBhcmFtczogZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiBfLmV4dGVuZCh7XG5cdFx0XHRcdHg6IDAsXG5cdFx0XHRcdHk6IDBcblx0XHRcdH0sIHRoaXMuc2V0dGluZy50b3BCYXIpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVYOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXG5cdFx0XHRkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4MTogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSkgKiBkYXlzV2lkdGggLSB0aGlzLmdyb3VwLngoKSxcblx0XHRcdFx0eDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdlbmQnKSkgKiBkYXlzV2lkdGggLSB0aGlzLmdyb3VwLngoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGNhbGN1bGF0ZVBhcmVudERhdGVzOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdFx0Ym91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdFx0ZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xuXHRcdFx0dmFyIGRheXMxID0gTWF0aC5yb3VuZCh0aGlzLmdldFgxKHRydWUpL2RheXNXaWR0aCksZGF5czI9TWF0aC5yb3VuZCh0aGlzLmdldFgyKHRydWUpL2RheXNXaWR0aCk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcblx0XHRcdFx0ZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGdldFJlY3RwYXJhbXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciB4cz10aGlzLmNhbGN1bGF0ZVgodGhpcy5tb2RlbCk7XG5cdFx0XHR2YXIgc2V0dGluZyA9IHRoaXMuc2V0dGluZztcblx0XHRcdHJldHVybiBfLmV4dGVuZCh7XG5cdFx0XHRcdHg6IHhzLngxLFxuXHRcdFx0XHR3aWR0aDogeHMueDIgLSB4cy54MSxcblx0XHRcdFx0eTogc2V0dGluZy5nYXBcblx0XHRcdH0sIHNldHRpbmcudG9wQmFyKTtcblx0XHR9LFxuXHRcdHRvZ2dsZUNoaWxkcmVuOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHNob3cgPSB0aGlzLm1vZGVsLmdldCgnYWN0aXZlJyk7XG5cdFx0XHR0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdFx0Y2hpbGQudG9nZ2xlKHNob3cpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRzeW5jOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnN5bmNpbmcgPSB0cnVlO1xuXG5cdFx0XHR2YXIgcGRhdGVzID0gdGhpcy5jYWxjdWxhdGVQYXJlbnREYXRlcygpO1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoe1xuXHRcdFx0XHRzdGFydDogcGRhdGVzLnN0YXJ0LFxuXHRcdFx0XHRlbmQ6cGRhdGVzLmVuZFxuXHRcdFx0fSk7XG5cblxuXHRcdFx0dmFyIGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcblx0XHRcdGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdFx0Y2hpbGQuc3luYygpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuc3luY2luZyA9IGZhbHNlO1xuXHRcdH1cblx0fTtcblxuXy5leHRlbmQoQmFyR3JvdXAucHJvdG90eXBlLCBCYWNrYm9uZS5FdmVudHMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhckdyb3VwO1xuIiwidmFyIEJhckdyb3VwID0gcmVxdWlyZSgnLi9CYXJHcm91cCcpO1xudmFyIEJhciA9IHJlcXVpcmUoJy4vQmFyJyk7XG5cbnZhciB2aWV3T3B0aW9ucyA9IFsnbW9kZWwnLCAnY29sbGVjdGlvbiddO1xuXG52YXIgS2luZXRpY1ZpZXcgPSBCYWNrYm9uZS5LaW5ldGljVmlldyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCd2aWV3Jyk7XG5cdF8uZXh0ZW5kKHRoaXMsIF8ucGljayhvcHRpb25zLCB2aWV3T3B0aW9ucykpO1xuXHR0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5fLmV4dGVuZChLaW5ldGljVmlldy5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cywge1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5cbktpbmV0aWNWaWV3LmV4dGVuZD1CYWNrYm9uZS5Nb2RlbC5leHRlbmQ7XG5cbnZhciBLQ2FudmFzVmlldyA9IEtpbmV0aWNWaWV3LmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMuZ3JvdXBzPVtdO1xuXHRcdHRoaXMuc2V0dGluZ3MgPSB0aGlzLmFwcC5zZXR0aW5ncztcblx0XHR2YXIgc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdkaXNwbGF5Jyk7XG5cdFx0XG5cdFx0dGhpcy5zdGFnZSA9IG5ldyBLaW5ldGljLlN0YWdlKHtcblx0XHRcdGNvbnRhaW5lciA6ICdnYW50dC1jb250YWluZXInLFxuXHRcdFx0aGVpZ2h0OiA1ODAsXG5cdFx0XHR3aWR0aDogc2V0dGluZy5zY3JlZW5XaWR0aCAtIHNldHRpbmcudEhpZGRlbldpZHRoIC0gMjAsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0eDogcG9zLngsXG5cdFx0XHRcdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5GbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcih7fSk7XG5cdFx0dGhpcy5CbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcih7fSk7XG5cdFx0XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5hcHAudGFza3MsICdjaGFuZ2U6c29ydGluZGV4JywgdGhpcy5yZW5kZXJSZXF1ZXN0KTtcblxuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmICghcGFyc2VJbnQobW9kZWwuZ2V0KCdwYXJlbnRpZCcpLCAxMCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cHMucHVzaChuZXcgQmFyR3JvdXAoe1xuXHRcdFx0XHRtb2RlbDogbW9kZWwsXG5cdFx0XHRcdHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xuXHRcdFx0fSkpO1xuXG5cdFx0XHR2YXIgZ3NldHRpbmcgPSAgdGhpcy5hcHAuc2V0dGluZ3MuZ2V0U2V0dGluZygnZ3JvdXAnKTtcblx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZID0gZ3NldHRpbmcuaW5pWTtcblxuXHRcdFx0dGhpcy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbihncm91cGkpIHtcblx0XHRcdFx0Z3JvdXBpLnNldFkoZ3NldHRpbmcuY3VycmVudFkpO1xuXHRcdFx0XHRnc2V0dGluZy5jdXJyZW50WSArPSBncm91cGkuZ2V0SGVpZ2h0KCk7XG5cdFx0XHRcdHRoaXMuRmxheWVyLmFkZChncm91cGkuZ3JvdXApO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdHRoaXMucmVuZGVyZ3JvdXBzKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5pbml0aWFsaXplRnJvbnRMYXllcigpO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZUJhY2tMYXllcigpO1xuXHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHR9LFxuXHRyZW5kZXJSZXF1ZXN0IDogKGZ1bmN0aW9uKCkge1xuXHRcdHZhciB3YWl0aW5nID0gZmFsc2U7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKHdhaXRpbmcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0d2FpdGluZyA9IHRydWU7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLnJlbmRlcmdyb3VwcygpO1xuXHRcdFx0XHR3YWl0aW5nID0gZmFsc2U7XG5cdFx0XHR9LmJpbmQodGhpcyksIDEwKTtcblx0XHR9O1xuXHR9KSgpLFxuXHRpbml0aWFsaXplQmFja0xheWVyOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNoYXBlID0gbmV3IEtpbmV0aWMuU2hhcGUoe1xuXHRcdFx0c3Ryb2tlOiAnI2JiYicsXG5cdFx0XHRzdHJva2VXaWR0aDogMCxcblx0XHRcdHNjZW5lRnVuYzp0aGlzLmdldFNjZW5lRnVuYygpXG5cdFx0fSk7XG5cdFx0dGhpcy5CbGF5ZXIuYWRkKHNoYXBlKTtcblx0XHRcblx0fSxcblx0aW5pdGlhbGl6ZUZyb250TGF5ZXI6ZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dGhpcy5hZGRHcm91cCh0YXNrKTtcblx0XHRcdH1cblx0XHR9LCB0aGlzKTtcblx0fSxcblx0YmluZEV2ZW50czpmdW5jdGlvbigpe1xuXHRcdHZhciBjYWxjdWxhdGluZz1mYWxzZTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmNvbGxlY3Rpb24sICdjaGFuZ2U6YWN0aXZlJywgdGhpcy5yZW5kZXJncm91cHMpO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuYXBwLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLnJlbmRlckJhcnMpO1xuXHRcdCQoJyNnYW50dC1jb250YWluZXInKS5tb3VzZXdoZWVsKGZ1bmN0aW9uKGUpe1xuXHRcdFx0aWYoY2FsY3VsYXRpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNkcGkgPSAgdGhpcy5zZXR0aW5ncy5nZXQoJ2RwaScpLCBkcGk9MDtcblx0XHRcdGNhbGN1bGF0aW5nPXRydWU7XG5cdFx0XHRpZiAoZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgPiAwKXtcblx0XHRcdFx0ZHBpID0gTWF0aC5tYXgoMSwgY2RwaSAtIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHBpID0gY2RwaSArIDE7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZHBpID09PSAxKXtcblx0XHRcdFx0aWYgKCB0aGlzLmFwcC5zZXR0aW5ncy5nZXQoJ2ludGVydmFsJykgPT09ICdhdXRvJykge1xuXHRcdFx0XHRcdCB0aGlzLmFwcC5zZXR0aW5ncy5zZXQoe2ludGVydmFsOidkYWlseSd9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmdzLnNldCh7aW50ZXJ2YWw6ICdhdXRvJywgZHBpOiBkcGl9KTtcblx0XHRcdH1cblx0XHRcdGNhbGN1bGF0aW5nID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdGlmIChjYWxjdWxhdGluZykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHZhciBjZHBpID0gIHRoaXMuYXBwLnNldHRpbmdzLmdldCgnZHBpJyksIGRwaT0wO1xuXHRcdGNhbGN1bGF0aW5nICA9dHJ1ZTtcblx0XHRkcGkgPSBNYXRoLm1heCgwLCBjZHBpICsgMjUpO1xuXG5cdFx0aWYgKGRwaSA9PT0gMSkge1xuXHRcdFx0aWYoIHRoaXMuYXBwLnNldHRpbmdzLmdldCgnaW50ZXJ2YWwnKT09PSdhdXRvJykge1xuXHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZ3Muc2V0KHtpbnRlcnZhbDonZGFpbHknfSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdCB0aGlzLmFwcC5zZXR0aW5ncy5zZXQoe2ludGVydmFsOiAnYXV0bycsIGRwaTogZHBpfSk7XG5cdFx0fVxuXG5cdFx0Y2FsY3VsYXRpbmcgPSBmYWxzZTtcblx0XHQkKCcjZ2FudHQtY29udGFpbmVyJykub24oJ2RyYWdtb3ZlJywgZnVuY3Rpb24oKXtcblx0XHRcdGlmKGNhbGN1bGF0aW5nKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHZhciBjZHBpID0gIHRoaXMuYXBwLnNldHRpbmdzLmdldCgnZHBpJyksIGRwaT0wO1xuXHRcdFx0Y2FsY3VsYXRpbmcgPSB0cnVlO1xuXHRcdFx0ZHBpID0gY2RwaSArIDE7XG5cblx0XHRcdGlmKGRwaT09PTEpe1xuXHRcdFx0XHRpZiAoIHRoaXMuYXBwLnNldHRpbmdzLmdldCgnaW50ZXJ2YWwnKSA9PT0gJ2F1dG8nKSB7XG5cdFx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmdzLnNldCh7aW50ZXJ2YWw6ICdkYWlseSd9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmdzLnNldCh7aW50ZXJ2YWw6J2F1dG8nLGRwaTpkcGl9KTtcblx0XHRcdH1cblx0XHRcdGNhbGN1bGF0aW5nID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblxuXHRhZGRHcm91cDogZnVuY3Rpb24odGFza2dyb3VwKSB7XG5cdFx0dGhpcy5ncm91cHMucHVzaChuZXcgQmFyR3JvdXAoe1xuXHRcdFx0bW9kZWw6IHRhc2tncm91cCxcblx0XHRcdHNldHRpbmdzIDogdGhpcy5hcHAuc2V0dGluZ3Ncblx0XHR9KSk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBnc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdncm91cCcpO1xuXG5cdFx0Z3NldHRpbmcuY3VycmVudFkgPSBnc2V0dGluZy5pbmlZO1xuXHRcdFxuXHRcdHRoaXMuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRncm91cGkuc2V0WShnc2V0dGluZy5jdXJyZW50WSk7XG5cdFx0XHRnc2V0dGluZy5jdXJyZW50WSArPSBncm91cGkuZ2V0SGVpZ2h0KCk7XG5cdFx0XHR0aGlzLkZsYXllci5hZGQoZ3JvdXBpLmdyb3VwKTtcblx0XHR9LmJpbmQodGhpcykpO1xuXG5cblx0XHQvL2xvb3AgdGhyb3VnaCBncm91cHNcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5ncm91cHMubGVuZ3RoOyBpKyspe1xuXG5cdFx0XHQvL2xvb3AgdGhyb3VnaCB0YXNrc1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuLmxlbmd0aDsgaisrKXtcblxuXHRcdFx0XHQvL2lmIHRocmVyZSBpcyBkZXBlbmRlbmN5XG5cdFx0XHRcdGlmICh0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbltqXS5tb2RlbC5hdHRyaWJ1dGVzLmRlcGVuZGVuY3kgIT09ICcnKXtcblxuXHRcdFx0XHRcdC8vcGFyc2UgZGVwZW5kZW5jaWVzXG5cdFx0XHRcdFx0dmFyIGRlcGVuZGVuY3kgPSAkLnBhcnNlSlNPTih0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbltqXS5tb2RlbC5hdHRyaWJ1dGVzLmRlcGVuZGVuY3kpO1xuXG5cdFx0XHRcdFx0Zm9yKHZhciBsPTA7IGwgPCBkZXBlbmRlbmN5Lmxlbmd0aDsgbCsrKXtcblx0XHRcdFx0XHRcdGZvciggdmFyIGs9MDsgayA8IHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuLmxlbmd0aDsgaysrKXtcblx0XHRcdFx0XHRcdFx0aWYgKGRlcGVuZGVuY3lbbF0gPT0gdGhpcy5ncm91cHNbaV0uY2hpbGRyZW5ba10ubW9kZWwuYXR0cmlidXRlcy5pZCApe1xuXHRcdFx0XHRcdFx0XHRcdEJhci5jcmVhdGVSZWxhdGlvbih0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbltqXSwgdGhpcy5ncm91cHNbaV0uY2hpbGRyZW5ba10pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuc3RhZ2UuYWRkKHRoaXMuQmxheWVyKTtcblx0XHR0aGlzLnN0YWdlLmFkZCh0aGlzLkZsYXllcik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cmVuZGVyQmFyczpmdW5jdGlvbigpe1xuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5ncm91cHMubGVuZ3RoO2krKyl7XG5cdFx0XHR0aGlzLmdyb3Vwc1tpXS5yZW5kZXJDaGlsZHJlbigpO1xuXHRcdH0gXG5cdFx0dGhpcy5GbGF5ZXIuZHJhdygpO1xuXHRcdHRoaXMuQmxheWVyLmRyYXcoKTtcblx0fSxcblxuXHRyZW5kZXJncm91cHM6ZnVuY3Rpb24oKXtcblx0XHRjb25zb2xlLmxvZygncmVuZGVyJyk7XG5cdFx0dmFyIGdzZXR0aW5nID0gIHRoaXMuYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHRoaXMuZ3JvdXBzLCBmdW5jdGlvbihpdGVtdmlldyl7XG5cdFx0XHRyZXR1cm4gaXRlbXZpZXcubW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHR9KTtcblx0XHRnc2V0dGluZy5jdXJyZW50WSA9IGdzZXR0aW5nLmluaVk7XG5cdFx0c29ydGVkLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRncm91cGkuc2V0WShnc2V0dGluZy5jdXJyZW50WSk7XG5cdFx0XHRncm91cGkucmVuZGVyU29ydGVkQ2hpbGRyZW4oKTtcblx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZICs9IGdyb3VwaS5nZXRIZWlnaHQoKTtcblx0XHR9KTtcblx0XHR0aGlzLkZsYXllci5kcmF3KCk7XG5cdH0sXG5cdHNldFdpZHRoOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuc3RhZ2Uuc2V0V2lkdGgodmFsdWUpO1xuXHR9LFxuXHRnZXRTY2VuZUZ1bmM6ZnVuY3Rpb24oKXtcblx0XHR2YXIgc2V0dGluZyA9IHRoaXMuYXBwLnNldHRpbmdzO1xuXHRcdHZhciBzZGlzcGxheSA9IHNldHRpbmcuc2Rpc3BsYXk7XG5cdFx0dmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcblx0XHR2YXIgb2Zmc2V0ID0gYm9yZGVyV2lkdGgvMjtcblx0XHR2YXIgcm93SGVpZ2h0ID0gMjA7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XG5cdFx0XHR2YXIgc2F0dHIgPSBzZXR0aW5nLnNhdHRyO1xuXHRcdFx0dmFyIGksIHMgPSAwLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XG5cdFx0XHRcblx0XHRcdHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0Ly9kcmF3IHRocmVlIGxpbmVzXG5cdFx0XHRmb3IoaSA9IDE7IGkgPCA0IDsgaSsrKXtcblx0XHRcdFx0Y29udGV4dC5tb3ZlVG8ob2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcblx0XHRcdFx0Y29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcblx0XHRcdGZvciAocyA9IDE7IHMgPCAzOyBzKyspe1xuXHRcdFx0XHR4PTAsbGVuZ3RoPTA7XG5cdFx0XHRcdGZvcihpPTAsaUxlbj1oRGF0YVtzXS5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdFx0bGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uKmRheXNXaWR0aDtcblx0XHRcdFx0XHR4ID0geCtsZW5ndGg7XG5cdFx0XHRcdFx0eGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XG5cdFx0XHRcdFx0Y29udGV4dC5tb3ZlVG8oeGkseWkpO1xuXHRcdFx0XHRcdGNvbnRleHQubGluZVRvKHhpLHlmKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMTBwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeC1sZW5ndGgvMix5Zi1yb3dIZWlnaHQvMik7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0eWk9eWYseWY9IHlmK3Jvd0hlaWdodDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0eD0wLGxlbmd0aD0wLHM9Myx5Zj0xMjAwO1xuXHRcdFx0dmFyIGRyYWdJbnQgPSBwYXJzZUludChzYXR0ci5kcmFnSW50ZXJ2YWwpO1xuXHRcdFx0dmFyIGhpZGVEYXRlID0gZmFsc2U7XG5cdFx0XHRpZiggZHJhZ0ludCA9PSAxNCB8fCBkcmFnSW50ID09IDMwKXtcblx0XHRcdFx0aGlkZURhdGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKGk9MCxpTGVuPWhEYXRhW3NdLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0bGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uKmRheXNXaWR0aDtcblx0XHRcdFx0eCA9IHgrbGVuZ3RoO1xuXHRcdFx0XHR4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcblx0XHRcdFx0Y29udGV4dC5tb3ZlVG8oeGkseWkpO1xuXHRcdFx0XHRjb250ZXh0LmxpbmVUbyh4aSx5Zik7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2xlZnQnO1xuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuXHRcdFx0XHQvLyBkYXRlIGhpZGUgb24gc3BlY2lmaWMgdmlld3Ncblx0XHRcdFx0aWYgKGhpZGVEYXRlKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMXB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4LWxlbmd0aCs0MCx5aStyb3dIZWlnaHQvMik7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xuXG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LnN0cm9rZVNoYXBlKHRoaXMpO1xuXHRcdH07XG5cdH0sXG5cdHJlbmRlckJhY2tMYXllcjogZnVuY3Rpb24oKXtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gS0NhbnZhc1ZpZXc7IiwiZnVuY3Rpb24gQ29udGV4dE1lbnVWaWV3KGFwcCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLmFwcCA9IGFwcDtcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ2RpdicsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMucGFyZW50KCkpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuYXBwLnRhc2tzLmdldChpZCk7XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2RlbGV0ZScpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Byb3BlcnRpZXMnKXtcclxuICAgICAgICAgICAgICAgIHZhciAkcHJvcGVydHkgPSAnLnByb3BlcnR5LSc7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcxMDgnOiAnUmVhZHknLFxyXG4gICAgICAgICAgICAgICAgICAgICcxMDknOiAnT3BlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzExMCc6ICdDb21wbGV0ZSdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgJGVsID0gJChkb2N1bWVudCk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ25hbWUnKS5odG1sKG1vZGVsLmdldCgnbmFtZScpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZGVzY3JpcHRpb24nKS5odG1sKG1vZGVsLmdldCgnZGVzY3JpcHRpb24nKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXJ0JykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZW5kJykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXR1cycpLmh0bWwoc3RhdHVzW21vZGVsLmdldCgnc3RhdHVzJyldKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHJcbiAgICAgICAgICAgICAgICBpZihzdGFydGRhdGUgIT0gXCJcIiAmJiBlbmRkYXRlICE9IFwiXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydkdXJhdGlvbicpLmh0bWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJCgnLnVpLnByb3BlcnRpZXMnKS5tb2RhbCgnc2V0dGluZycsICd0cmFuc2l0aW9uJywgJ3ZlcnRpY2FsIGZsaXAnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tb2RhbCgnc2hvdycpXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY29udmVydERhdGUoaW5wdXRGb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBwYWQocykgeyByZXR1cm4gKHMgPCAxMCkgPyAnMCcgKyBzIDogczsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoaW5wdXRGb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbcGFkKGQuZ2V0RGF0ZSgpKSwgcGFkKGQuZ2V0TW9udGgoKSsxKSwgZC5nZXRGdWxsWWVhcigpXS5qb2luKCcvJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QWJvdmUnKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdpbmRlbnQnKXtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmV4cGFuZC1tZW51JykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsX2lkID0gJCh0aGlzKS5jbG9zZXN0KCdkaXYnKS5wcmV2KCkuZmluZCgnLnN1Yi10YXNrJykubGFzdCgpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldk1vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KHJlbF9pZCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50X2lkID0gcHJldk1vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgncGFyZW50aWQnLCBwYXJlbnRfaWQpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvYmVDaGlsZCA9ICQodGhpcykubmV4dCgpLmNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0b2JlQ2hpbGQsIGZ1bmN0aW9uKGluZGV4LCBkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRJZCA9ICQodGhpcykuYXR0cignaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLHBhcmVudF9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3Rhc2snKS5hZGRDbGFzcygnc3ViLXRhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMzBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdwYXJlbnRpZCcsMCk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9iZUNoaWxkID0gJCh0aGlzKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJJbmRleCA9ICQodGhpcykuaW5kZXgoKTtcclxuICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKHRvYmVDaGlsZCwgZnVuY3Rpb24oaW5kZXgsIGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID4gY3VyckluZGV4KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZE1vZGVsID0gc2VsZi5hcHAudGFza3MuZ2V0KGNoaWxkSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLG1vZGVsLmdldCgnaWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wcmVwZW5kKCc8bGkgY2xhc3M9XCJleHBhbmQtbWVudVwiPjxpIGNsYXNzPVwidHJpYW5nbGUgdXAgaWNvblwiPjwvaT4gPC9saT4nKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3N1Yi10YXNrJykuYWRkQ2xhc3MoJ3Rhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy5yZW5kZXJncm91cHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7bmFtZTogXCJOZXcgUm93IEFib3ZlXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHtuYW1lOiBcIk5ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHtuYW1lOiBcIkluZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7bmFtZTogXCJPdXRkZW50IFJvd1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7bmFtZTogXCJQcm9wZXJ0aWVzXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjoge25hbWU6IFwiRGVsZXRlIFJvd1wiLCBpY29uOiBcIlwifVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmFwcC50YXNrcy5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgfVxyXG4gICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcbiAgICBkYXRhLnBhcmVudGlkID0gcmVmX21vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgIHZhciB0YXNrID0gdGhpcy5hcHAudGFza3MuYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwiXG52YXIgdGVtcGxhdGUgPSBcIjxkaXY+XFxyXFxuICAgIDx1bD5cXHJcXG4gICAgICAgIDwlIHZhciBzZXR0aW5nPWFwcC5zZXR0aW5nczslPlxcclxcbiAgICAgICAgPCUgaWYoaXNQYXJlbnQpeyAlPiA8bGkgY2xhc3M9XFxcImV4cGFuZC1tZW51XFxcIj48aSBjbGFzcz1cXFwidHJpYW5nbGUgZG93biBpY29uXFxcIj48L2k+PC9saT48JSB9ICU+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1uYW1lXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcIm5hbWVcXFwiLG5hbWUpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtc3RhcnRcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhcnRcXFwiLHN0YXJ0KSk7JT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZW5kXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImVuZFxcXCIsZW5kKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWNvbXBsZXRlXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImNvbXBsZXRlXFxcIixjb21wbGV0ZSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1zdGF0dXNcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhdHVzXFxcIixzdGF0dXMpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZHVyYXRpb25cXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwiZHVyYXRpb25cXFwiLDAse1xcXCJzdGFydFxcXCI6c3RhcnQsXFxcImVuZFxcXCI6ZW5kfSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcInJlbW92ZS1pdGVtXFxcIj48YnV0dG9uIGNsYXNzPVxcXCJtaW5pIHJlZCB1aSBidXR0b25cXFwiPiA8aSBjbGFzcz1cXFwic21hbGwgdHJhc2ggaWNvblxcXCI+PC9pPjwvYnV0dG9uPjwvbGk+XFxyXFxuICAgIDwvdWw+XFxyXFxuPC9kaXY+XCI7XG5cbnZhciBUYXNrSXRlbVZpZXc9QmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lIDogJ2xpJyxcblx0dGVtcGxhdGU6IF8udGVtcGxhdGUodGVtcGxhdGUpLFxuXHRpc1BhcmVudDogZmFsc2UsXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2VkaXRyb3cnLCB0aGlzLmVkaXQpO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpuYW1lIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6c3RhdHVzJywgdGhpcy5yZW5kZXJSb3cpO1xuXHRcdHRoaXMuJGVsLmhvdmVyKGZ1bmN0aW9uKGUpe1xuXHRcdFx0JChkb2N1bWVudCkuZmluZCgnLml0ZW0tc2VsZWN0b3InKS5zdG9wKCkuY3NzKHtcblx0XHRcdFx0dG9wOiAoJChlLmN1cnJlbnRUYXJnZXQpLm9mZnNldCgpLnRvcCkrJ3B4J1xuXHRcdFx0fSkuZmFkZUluKCk7XG5cdFx0fSwgZnVuY3Rpb24oKXtcblx0XHRcdCQoZG9jdW1lbnQpLmZpbmQoJy5pdGVtLXNlbGVjdG9yJykuc3RvcCgpLmZhZGVPdXQoKTtcblx0XHR9KTtcblx0XHR0aGlzLiRlbC5vbignY2xpY2snLGZ1bmN0aW9uKCl7XG5cdFx0XHQkKGRvY3VtZW50KS5maW5kKCcuaXRlbS1zZWxlY3RvcicpLnN0b3AoKS5mYWRlT3V0KCk7XG5cdFx0fSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24ocGFyZW50KXtcblx0XHR2YXIgYWRkQ2xhc3M9J3N1Yi10YXNrIGRyYWctaXRlbSc7XG5cdFx0XG5cdFx0aWYocGFyZW50KXtcblx0XHRcdGFkZENsYXNzPVwidGFza1wiO1xuXHRcdFx0dGhpcy5pc1BhcmVudCA9IHRydWU7XG5cdFx0XHR0aGlzLnNldEVsZW1lbnQoJCgnPGRpdj4nKSk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLmlzUGFyZW50ID0gZmFsc2U7XG5cdFx0XHR0aGlzLnNldEVsZW1lbnQoJCgnPGxpPicpKTtcblx0XHRcdHRoaXMuJGVsLmRhdGEoe1xuXHRcdFx0XHRpZCA6IHRoaXMubW9kZWwuaWRcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLiRlbC5hZGRDbGFzcyhhZGRDbGFzcyk7XG5cdFx0dGhpcy4kZWwuYXR0cignaWQnLCB0aGlzLm1vZGVsLmNpZCk7XG5cdFx0cmV0dXJuIHRoaXMucmVuZGVyUm93KCk7XG5cdH0sXG5cdHJlbmRlclJvdzpmdW5jdGlvbigpe1xuXHRcdHZhciBkYXRhID0gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0XHRkYXRhLmlzUGFyZW50ID0gdGhpcy5pc1BhcmVudDtcblx0XHRkYXRhLmFwcCA9IHRoaXMuYXBwO1xuXHRcdHRoaXMuJGVsLmh0bWwodGhpcy50ZW1wbGF0ZShkYXRhKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGVkaXQ6ZnVuY3Rpb24oZXZ0KXtcblx0XHR2YXIgdGFyZ2V0ID0gJChldnQudGFyZ2V0KTtcblx0XHR2YXIgd2lkdGggID0gcGFyc2VJbnQodGFyZ2V0LmNzcygnd2lkdGgnKSwgMTApIC0gNTtcblx0XHR2YXIgZmllbGQgPSB0YXJnZXQuYXR0cignY2xhc3MnKS5zcGxpdCgnLScpWzFdO1xuXHRcdHZhciBmb3JtID0gdGhpcy5hcHAuc2V0dGluZ3MuZ2V0Rm9ybUVsZW0oZmllbGQsIHRoaXMubW9kZWwsIHRoaXMub25FZGl0LCB0aGlzKTtcblx0XHRmb3JtLmNzcyh7XG5cdFx0XHR3aWR0aDogd2lkdGggKyAncHgnXG5cdFx0fSk7XG5cblx0XHR0YXJnZXQuaHRtbChmb3JtKTtcblx0XHRmb3JtLmZvY3VzKCk7XG5cdH0sXG5cdG9uRWRpdDogZnVuY3Rpb24obmFtZSwgdmFsdWUpe1xuXHRcdGlmIChuYW1lID09PSAnZHVyYXRpb24nKSB7XG5cdFx0XHR2YXIgc3RhcnQgPSB0aGlzLm1vZGVsLmdldCgnc3RhcnQnKTtcblx0XHRcdHZhciBlbmQgPSBzdGFydC5jbG9uZSgpLmFkZERheXMocGFyc2VJbnQodmFsdWUsIDEwKSAtIDEpO1xuLy9cdFx0XHR0aGlzLm1vZGVsLnNldCgnZW5kJywgZW5kKTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGNvbnNvbGUuZXJyb3IobmFtZSk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldChuYW1lLCB2YWx1ZSk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmUoKTtcblx0XHR9XG5cdFx0dGhpcy5yZW5kZXJSb3coKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0l0ZW1WaWV3O1xuIiwidmFyIFRhc2tJdGVtVmlldyA9IHJlcXVpcmUoJy4vVGFza0l0ZW1WaWV3Jyk7XG5cbnZhciBUYXNrVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogJ2xpJyxcblx0Y2xhc3NOYW1lOiAndGFzay1saXN0LWNvbnRhaW5lciBkcmFnLWl0ZW0nLFxuXHRjb2xsYXBzZWQgOiBmYWxzZSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpe1xuXHRcdHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcblx0fSxcblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC50YXNrIC5leHBhbmQtbWVudSc6ICdjb2xsYXBzZU9yRXhwYW5kJyxcblx0XHQnY2xpY2sgLmFkZC1pdGVtIGJ1dHRvbic6ICdhZGRJdGVtJyxcblx0XHQnY2xpY2sgLnJlbW92ZS1pdGVtIGJ1dHRvbic6ICdyZW1vdmVJdGVtJ1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHBhcmVudCA9IHRoaXMubW9kZWw7XG5cdFx0dmFyIGl0ZW1WaWV3ID0gbmV3IFRhc2tJdGVtVmlldyh7XG5cdFx0XHRtb2RlbCA6IHBhcmVudCxcblx0XHRcdGFwcCA6IHRoaXMuYXBwXG5cdFx0fSk7XG5cblx0XHR0aGlzLiRwYXJlbnRlbCA9IGl0ZW1WaWV3LnJlbmRlcih0cnVlKS4kZWw7XG5cdFx0dGhpcy4kZWwuYXBwZW5kKHRoaXMuJHBhcmVudGVsKTtcblxuXHRcdHRoaXMuJGVsLmRhdGEoe1xuXHRcdFx0aWQgOiBwYXJlbnQuaWRcblx0XHR9KTtcblx0XHR0aGlzLiRjaGlsZGVsID0gJCgnPG9sIGNsYXNzPVwic3ViLXRhc2stbGlzdCBzb3J0YWJsZVwiPjwvb2w+Jyk7XG5cblx0XHR0aGlzLiRlbC5hcHBlbmQodGhpcy4kY2hpbGRlbCk7XG5cdFx0dmFyIGNoaWxkcmVuID0gXy5zb3J0QnkodGhpcy5tb2RlbC5jaGlsZHJlbi5tb2RlbHMsIGZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdH0pO1xuXHRcdGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdFwidXNlIHN0cmljdFwiO1xuXHRcdFx0aXRlbVZpZXc9bmV3IFRhc2tJdGVtVmlldyh7XG5cdFx0XHRcdG1vZGVsOiBjaGlsZCxcblx0XHRcdFx0YXBwOiB0aGlzLmFwcFxuXHRcdFx0fSk7XG5cdFx0XHRpdGVtVmlldy5yZW5kZXIoKTtcblx0XHRcdHRoaXMuJGNoaWxkZWwuYXBwZW5kKGl0ZW1WaWV3LmVsKTtcblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0dGhpcy50b2dnbGVQYXJlbnQoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0Y29sbGFwc2VPckV4cGFuZDogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbGxhcHNlZCA9ICF0aGlzLmNvbGxhcHNlZDtcblx0XHR0aGlzLm1vZGVsLnNldCgnYWN0aXZlJywgIXRoaXMuY29sbGFwc2VkKTtcblx0XHR0aGlzLnRvZ2dsZVBhcmVudCgpO1xuXHR9LFxuXHR0b2dnbGVQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzdHIgPSB0aGlzLmNvbGxhcHNlZCA/ICc8aSBjbGFzcz1cInRyaWFuZ2xlIHVwIGljb25cIj48L2k+ICcgOiAnPGkgY2xhc3M9XCJ0cmlhbmdsZSBkb3duIGljb25cIj48L2k+Jztcblx0XHR0aGlzLiRjaGlsZGVsLnNsaWRlVG9nZ2xlKCk7XG5cdFx0dGhpcy4kcGFyZW50ZWwuZmluZCgnLmV4cGFuZC1tZW51JykuaHRtbChzdHIpO1xuXHR9LFxuXHRhZGRJdGVtOiBmdW5jdGlvbihldnQpe1xuXHRcdCQoZXZ0LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3VsJykubmV4dCgpLmFwcGVuZCgnPHVsIGNsYXNzPVwic3ViLXRhc2tcIiBpZD1cImMnK01hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAxMDAwMCkgKyAxKSsnXCI+PGxpIGNsYXNzPVwiY29sLW5hbWVcIj48aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIk5ldyBwbGFuXCIgc2l6ZT1cIjM4XCI+PC9saT48bGkgY2xhc3M9XCJjb2wtc3RhcnRcIj48aW5wdXQgdHlwZT1cImRhdGVcIiBwbGFjZWhvbGRlcj1cIlN0YXJ0IERhdGVcIiBzdHlsZT1cIndpZHRoOjgwcHg7XCI+PC9saT48bGkgY2xhc3M9XCJjb2wtZW5kXCI+PGlucHV0IHR5cGU9XCJkYXRlXCIgcGxhY2Vob2xkZXI9XCJFbmQgRGF0ZVwiIHN0eWxlPVwid2lkdGg6ODBweDtcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1jb21wbGV0ZVwiPjxpbnB1dCB0eXBlPVwibnVtYmVyXCIgcGxhY2Vob2xkZXI9XCIyXCIgc3R5bGU9XCJ3aWR0aDogMzBweDttYXJnaW4tbGVmdDogLTE0cHg7XCIgbWluPVwiMFwiPjwvbGk+PGxpIGNsYXNzPVwiY29sLXN0YXR1c1wiPjxzZWxlY3Qgc3R5bGU9XCJ3aWR0aDogNzBweDtcIj48b3B0aW9uIHZhbHVlPVwiaW5jb21wbGV0ZVwiPklub21wbGV0ZWQ8L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiY29tcGxldGVkXCI+Q29tcGxldGVkPC9vcHRpb24+PC9zZWxlY3Q+PC9saT48bGkgY2xhc3M9XCJjb2wtZHVyYXRpb25cIj48aW5wdXQgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiMjRcIiBzdHlsZT1cIndpZHRoOiAzMnB4O21hcmdpbi1sZWZ0OiAtOHB4O1wiIG1pbj1cIjBcIj4gZDwvbGk+PGxpIGNsYXNzPVwicmVtb3ZlLWl0ZW1cIj48YnV0dG9uIGNsYXNzPVwibWluaSByZWQgdWkgYnV0dG9uXCI+IDxpIGNsYXNzPVwic21hbGwgdHJhc2ggaWNvblwiPjwvaT48L2J1dHRvbj48L2xpPjwvdWw+JykuaGlkZSgpLnNsaWRlRG93bigpO1xuXHR9LFxuXHRyZW1vdmVJdGVtOiBmdW5jdGlvbihldnQpe1xuXHRcdHZhciAkcGFyZW50VUwgPSAkKGV2dC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCdvbCB1bCcpLnBhcmVudCgpLnBhcmVudCgpO1xuXHRcdHZhciBpZCA9ICRwYXJlbnRVTC5hdHRyKCdpZCcpO1xuXHRcdHZhciB0YXNrTW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoaWQpO1xuXHRcdGlmKCRwYXJlbnRVTC5oYXNDbGFzcygndGFzaycpKXtcblx0XHRcdCRwYXJlbnRVTC5uZXh0KCdvbCcpLmZhZGVPdXQoMTAwMCwgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH1lbHNle1xuXHRcdFx0JChldnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndWwnKS5mYWRlT3V0KDEwMDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGFza01vZGVsLmRlc3Ryb3koKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza1ZpZXc7XG4iXX0=
