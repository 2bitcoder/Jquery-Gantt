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
	_resortChildren : function(data, startIndex, parentID) {
		var sortIndex = startIndex;
		data.forEach(function(taskData) {
			var task = this.get(taskData.id);
			if (task.get('parentid') !== parentID) {
				var newParent = this.get(parentID);
				if (newParent) {
					newParent.children.add(task);
				}
			}
			task.save({
				sortindex: ++sortIndex,
				parentid: parentID
			});
			if (taskData.children && taskData.children.length) {
				sortIndex = this._resortChildren(taskData.children, sortIndex, task.id);
			}
		}.bind(this));
		return sortIndex;
	},
	resort : function(data) {
//		var sortIndex = 0;
		this._resortChildren(data, -1, 0);
		this.sort();
//		var self = this;
//		data.forEach(function(parentData) {
//			var parentModel = this.get(parentData.id);
//			var prevSort = parentModel.get('sortindex');
//			if (prevSort !== ++sortIndex) {
//				parentModel.set('sortindex', sortIndex).save();
//			}
//			if (parentModel.get('parentid')) {
//				parentModel.set('parentid', 0).save();
//			}
//			parentData.children.forEach(function(childData) {
//				var childModel = self.get(childData.id);
//				var prevSortI = childModel.get('sortindex');
//				if (prevSortI !== ++sortIndex) {
//					childModel.set('sortindex', sortIndex).save();
//				}
//				if (childModel.get('parentid') !== parentModel.id) {
//					childModel.set('parentid', parentModel.id).save();
//					var parent = self.find(function(m) {
//						return m.id === parentModel.id;
//					});
//					parent.children.add(childModel);
//				}
//			});
//		}.bind(this));
//		this.checkSortedIndex();
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
		this.listenTo(this, 'reset', function() {
			this.linkChildren();
		});
		this.listenTo(this, 'change:parentid', function(model) {
			var parent = this.get(model.get('parentid'));
			if (parent) {
				parent.children.add(model);
			}
		});
	},
	createDependency : function (beforeModel, afterModel) {
		afterModel.set('depend', beforeModel.id);
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
"use strict";var util = require('../utils/util');var params = util.getURLParams();var SubTasks = Backbone.Collection.extend({    comparator : function(model) {        return model.get('sortindex');    }});var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,  // in percents        action: '',        active : true,        sortindex: 0,        dependency: null,  // id of task        resources: {},        status: 110,        health: 21,        start: new Date(),        end: new Date(),        ProjectRef : params.project,        WBS_ID : params.profile,        color: '#0090d3',   // user color//        lightcolor: '#E6F0FF', ////        darkcolor: '#e88134',        aType: '',        reportable: '',        parentid: 0,        // app params        hidden : false,        collapsed : false    },    initialize : function() {        this.children = new SubTasks();        this.listenTo(this.children, 'change:parentid', function(child) {            if (child.get('parentid') === this.id) {                return;            }            child.parent = undefined;            this.children.remove(child);        });        this.listenTo(this.children, 'add', function(child) {            child.parent = this;        });        this.listenTo(this.children, 'change:sortindex', function() {            this.children.sort();        });        this.listenTo(this.children, 'add remove change:start change:end', function() {            this._checkTime();        });        this.listenTo(this, 'change:collapsed', function() {            this.children.each(function(child) {                if (this.get('collapsed')) {                    child.hide();                } else {                    child.show();                }            }.bind(this));        });        this.listenTo(this, 'destroy', function() {            this.children.each(function(child) {                child.destroy();            });        });        // checking nested state        this.listenTo(this.children, 'add remove', this._checkNested);        // time checking        this.listenTo(this.children, 'add remove change:complete', this._checkComplete);    },    isNested : function() {        return !!this.children.length;    },    show : function() {        this.set('hidden', false);    },    hide : function() {        this.set('hidden', true);    },    _checkNested : function() {        this.trigger('nestedStateChange', this);    },    parse: function(response) {        var start, end;        if(_.isString(response.start)){            start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            start = new Date();        }                if(_.isString(response.end)){            end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            end = new Date();        }        response.start = start < end ? start : end;        response.end = start < end ? end : start;        response.parentid = parseInt(response.parentid || '0', 10);        // remove null params        _.each(response, function(val, key) {            if (val === null) {                delete response[key];            }        });        return response;    },    _checkTime : function() {        if (this.children.length === 0) {            return;        }        var startTime = this.children.at(0).get('start');        var endTime = this.children.at(0).get('end');        this.children.each(function(child) {            var childStartTime = child.get('start');            var childEndTime = child.get('end');            if(childStartTime < startTime) {                startTime = childStartTime;            }            if(childEndTime > endTime){                endTime = childEndTime;            }        }.bind(this));        this.set('start', startTime);        this.set('end', endTime);    },    _checkComplete : function() {        var complete = 0;        var length = this.children.length;        if (length) {            this.children.each(function(child) {                complete += child.get('complete') / length;            });        }        this.set('complete', complete);    },    moveToStart : function(newStart) {        // do nothing if new start is the same as current        if (newStart.toDateString() === this.get('start').toDateString()) {            return;        }        // calculate offset//        var daysDiff = Math.floor((newStart.time() - this.get('start').time()) / 1000 / 60 / 60 / 24)        var daysDiff = Date.daysdiff(newStart, this.get('start')) - 1;        if (newStart < this.get('start')) {            daysDiff *= -1;        }        // change dates        this.set({            start : newStart.clone(),            end : this.get('end').clone().addDays(daysDiff)        });        // changes dates in all children        this._moveChildren(daysDiff);    },    _moveChildren : function(days) {        this.children.each(function(child) {            child.move(days);        });    },    move : function(days) {        this.save({            start: this.get('start').clone().addDays(days),            end: this.get('end').clone().addDays(days)        });        this._moveChildren(days);    }});module.exports = TaskModel;
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
	if (typeof window === "undefined") {
		return {};
	}
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
"use strict";var ContextMenuView = require('./sideBar/ContextMenuView');var SidePanel = require('./sideBar/SidePanel');var GanttChartView = require('./canvasChart/GanttChartView');var AddFormView = require('./AddFormView');var TopMenuView = require('./TopMenuView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        new ContextMenuView({            collection : this.collection        }).render();        new AddFormView({            collection : this.collection        }).render();        new TopMenuView({            settings : this.app.settings        }).render();        this.canvasView = new GanttChartView({            app : this.app,            collection : this.collection,            settings: this.app.settings        });        this.canvasView.render();        this._moveCanvasView();        setTimeout(function() {            this.canvasView._updateStageAttrs();        }.bind(this), 500);        var tasksContainer = $('.tasks').get(0);        React.render(            React.createElement(SidePanel, {                collection : this.collection            }),            tasksContainer        );        this.listenTo(this.collection, 'sort', function() {            React.unmountComponentAtNode(tasksContainer);            React.render(                React.createElement(SidePanel, {                    collection : this.collection                }),                tasksContainer            );        });    },    events: {        'click #tHandle': 'expand'//        'dblclick .sub-task': 'handlerowclick',//        'dblclick .task': 'handlerowclick',//        'hover .sub-task': 'showMask'    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var button = $(evt.target);        if (button.hasClass('contract')) {            this.$menuContainer.addClass('panel-collapsed');            this.$menuContainer.removeClass('panel-expanded');        }        else {            this.$menuContainer.addClass('panel-expanded');            this.$menuContainer.removeClass('panel-collapsed');        }        setTimeout(function() {            this._moveCanvasView();        }.bind(this), 600);        button.toggleClass('contract');        this.$menuContainer.find('.menu-header').toggleClass('menu-header-opened');    },    _moveCanvasView : function() {        var sideBarWidth = $('.menu-container').width();        this.canvasView.setLeftPadding(sideBarWidth);    }});module.exports = GanttView;
},{"./AddFormView":6,"./TopMenuView":8,"./canvasChart/GanttChartView":12,"./sideBar/ContextMenuView":14,"./sideBar/SidePanel":16}],8:[function(require,module,exports){
"use strict";

var TopMenuView = Backbone.View.extend({
    el : '.head-bar',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click button': 'onIntervalButtonClicked',
        'click a[href="/#!/generate/"]': 'generatePDF'
    },
    onIntervalButtonClicked : function(evt) {
        var button = $(evt.currentTarget);
        var action = button.data('action');
        var interval = action.split('-')[1];
        this.settings.set('interval', interval);
    },
    generatePDF : function(evt) {
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
    _color : '#E6F0FF',
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
        padding : 3
    },
    _completeColor : '#e88134',
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
                this.render();
            },
            'mouseover' : '_showDependencyTool',
            'mouseout' : '_hideDependencyTool',
            'dragstart .dependencyTool' : '_startConnecting',
            'dragmove .dependencyTool' : '_moveConnect',
            'dragend .dependencyTool' : '_createDependency'
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
            id : this.model.id,
            draggable : true
        });
        var rect = new Kinetic.Rect({
            fill : this._color,
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            name : 'mainRect'
        });
        var completeRect = new Kinetic.Rect({
            fill : this._completeColor,
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            name : 'completeRect'
        });
        var self = this;
        var arc = new Kinetic.Shape({
            y: this.params.padding,
            fill : 'green',
            drawFunc: function(context) {
                var height = self.params.height - self.params.padding * 2;
                context.beginPath();
                context.arc(0, height / 2, height / 2, - Math.PI / 2, Math.PI / 2);
                context.moveTo(0, 0);
                context.lineTo(0, height);
                context.fillStrokeShape(this);
            },
            name : 'dependencyTool',
            visible : false,
            draggable : true
        });

        group.add(rect, completeRect, arc);
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
            end: boundaryMin.clone().addDays(days2)
        });
    },
    _showDependencyTool : function() {
        this.el.find('.dependencyTool')[0].show();
        this.el.getLayer().draw();
    },
    _hideDependencyTool : function() {
        this.el.find('.dependencyTool')[0].hide();
        this.el.getLayer().draw();
    },
    _startConnecting : function() {
        var stage = this.el.getStage();
        var tool = this.el.find('.dependencyTool')[0];
        tool.hide();
        var pos = tool.getAbsolutePosition();
        var connector = new Kinetic.Line({
            stroke : 'black',
            strokeWidth : 1,
            points : [pos.x - stage.x(), pos.y, pos.x - stage.x(), pos.y],
            name : 'connector'
        });
        this.el.getLayer().add(connector);
        this.el.getLayer().batchDraw();
    },
    _moveConnect : function() {
        var connector = this.el.getLayer().find('.connector')[0];
        var stage = this.el.getStage();
        var points = connector.points();
        points[2] = stage.getPointerPosition().x - stage.x();
        points[3] = stage.getPointerPosition().y;
        connector.points(points);
    },
    _createDependency : function() {
        var connector = this.el.getLayer().find('.connector')[0];
        connector.destroy();
        this.render();
        var stage = this.el.getStage();
        var el = stage.getIntersection(stage.getPointerPosition());
        var group = el.getParent();
        var taskId = group.id();
        var beforeModel = this.model;
        var afterModel = this.model.collection.get(taskId);
        this.model.collection.createDependency(beforeModel, afterModel);
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

        // move tool position
        var tool = this.el.find('.dependencyTool')[0];
        tool.x(x.x2 - x.x1);
        tool.y(this.params.padding);

        this.el.getLayer().draw();
        return this;
    },
    setY : function(y) {
        this._y = y;
        this.el.y(y);
    },
    getY : function() {
        return this._y;
    }
});

module.exports = BasicTaskView;
},{}],11:[function(require,module,exports){
"use strict";

var ConnectorView = Backbone.KineticView.extend({
    initialize : function (params) {
        this.settings = params.settings;
        this.beforeModel = params.beforeModel;
        this.afterModel = params.afterModel;
        this._y1 = 0;
        this._y2 = 0;
        this._initSettingsEvents();
        this._initModelEvents();
    },
    el : function() {
        var line = new Kinetic.Line({
            strokeWidth : 2,
            stroke : 'black',
            points : [0,0,0,0]
        });
        return line;
    },
    setY1 : function(y1) {
        this._y1 = y1;
        this.render();
    },
    setY2 : function(y2) {
        this._y2 = y2;
        this.render();
    },
    render : function() {
        var x = this._calculateX();
        this.el.points([x.x1, this._y1, x.x2, this._y2]);
        this.el.getLayer().batchDraw();
        return this;
    },
    _initSettingsEvents : function() {
        this.listenTo(this.settings, 'change:interval change:dpi', function() {
            this.render();
        });
    },
    _initModelEvents : function() {
        this.listenTo(this.beforeModel, 'change', function() {
            this.render();
        });

        this.listenTo(this.beforeModel, 'change:hidden', function() {
            if (this.beforeModel.get('hidden')) {
                this.el.hide();
            } else {
                this.el.show();
            }
        });
        this.listenTo(this.afterModel, 'change', function() {
            this.render();
        });

        this.listenTo(this.afterModel, 'change:hidden', function() {
            if (this.beforeModel.get('hidden')) {
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
            x1: Date.daysdiff(boundaryMin, this.beforeModel.get('end')) * daysWidth,
            x2: Date.daysdiff(boundaryMin, this.afterModel.get('start')) * daysWidth
        };
    }
});

module.exports = ConnectorView;
},{}],12:[function(require,module,exports){
"use strict";

var NestedTaskView = require('./NestedTaskView');
var AloneTaskView = require('./AloneTaskView');
var ConnectorView = require('./ConnectorView');

var GanttChartView = Backbone.View.extend({
    el: '#gantt-container',
    _topPadding : 73,
    initialize: function (params) {
        this.settings = params.settings;
        this._taskViews = [];
        this._connectorViews = [];
        this._initStage();
        this._initLayers();
        this._initBackground();
        this._initSettingsEvents();
        this._initSubViews();
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
        var self = this;
        this.stage.setAttrs({
            x : this._leftPadding,
            height: Math.max($(".menu-container").innerHeight(), window.innerHeight - $(this.stage.getContainer()).offset().top),
            width: this.$el.innerWidth(),
            draggable: true,
            dragBoundFunc:  function(pos) {
                var x;
                var minX = - (lineWidth - this.width());
                if (pos.x > self._leftPadding) {
                    x = self._leftPadding;
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
            this._resortViews();
        });
        this.listenTo(this.collection, 'remove', function(task) {
            this._removeViewForModel(task);
            this._resortViews();
        });
        this.listenTo(this.collection, 'sort', function() {
            this._resortViews();
        });
        this.listenTo(this.collection, 'change:hidden', function() {
            this._resortViews();
        });
        this.listenTo(this.collection, 'change:depend', function(task) {
            this._addConnectorView(task);
            this._resortViews();
        });
        this.listenTo(this.collection, 'nestedStateChange', function(task) {
            this._removeViewForModel(task);
            this._addTaskView(task);
            this._resortViews();
        });
    },
    _removeViewForModel : function(model) {
        var taskView = _.find(this._taskViews, function(view) {
            return view.model === model;
        });
        this._removeView(taskView);
    },
    _removeView : function(taskView) {
        taskView.remove();
        this._taskViews = _.without(this._taskViews, taskView);
    },
    _initSubViews : function() {
        this.collection.each(function(task) {
            this._addTaskView(task);
        }.bind(this));
        this.collection.each(function(task) {
            this._addConnectorView(task);
        }.bind(this));
        this._resortViews();
        this.Flayer.draw();
    },
    _addTaskView : function(task) {
        var view;
        if (task.isNested()) {
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
    _addConnectorView : function(task) {
        var dependId = task.get('depend');
        if (!dependId) {
            return;
        }
        var view = new ConnectorView({
            beforeModel : this.collection.get(dependId),
            afterModel : task,
            settings : this.settings
        });
        this.Flayer.add(view.el);
        view.el.moveToBottom();
        view.render();
        this._connectorViews.push(view);
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
            if (!view) {
                return;
            }
            view.setY(lastY);
            lastY += view.height;
        }.bind(this));
        this.collection.each(function(task) {
            var dependId = task.get('depend');
            if (task.get('hidden') || !dependId) {
                return;
            }
            var beforeModel = this.collection.get(dependId);
            var beforeView = _.find(this._taskViews, function(view) {
                return view.model === beforeModel;
            });
            var afterView = _.find(this._taskViews, function(view) {
                return view.model === task;
            });
            var connectorView = _.find(this._connectorViews, function(view) {
                return view.beforeModel === beforeModel;
            });
            connectorView.setY1(beforeView.getY() + beforeView.params.height / 2);
            connectorView.setY2(afterView.getY()  + afterView.params.height / 2);
        }.bind(this));
        this.Flayer.draw();
    }
});

module.exports = GanttChartView;
},{"./AloneTaskView":9,"./ConnectorView":11,"./NestedTaskView":13}],13:[function(require,module,exports){
/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require('./BasicTaskView');

var NestedTaskView = BasicTaskView.extend({
    _color : '#b3d1fc',
    _updateDates : function() {
        // group is moved
        // so we need to detect interval
        var attrs = this.settings.getSetting('attr'),
            boundaryMin=attrs.boundaryMin,
            daysWidth=attrs.daysWidth;

        var rect = this.el.find('.mainRect')[0];
        var x = this.el.x() + rect.x();
        var days1 = Math.floor(x / daysWidth);
        var newStart = boundaryMin.clone().addDays(days1);
        this.model.moveToStart(newStart);
    }
});

module.exports = NestedTaskView;
},{"./BasicTaskView":10}],14:[function(require,module,exports){
"use strict";

function ContextMenuView(params) {
    this.collection = params.collection;
}

ContextMenuView.prototype.render = function() {
    var self = this;
    $('.task-container').contextMenu({
        selector: 'ul',
        callback: function(key) {
            var id = $(this).attr('id') || $(this).data('id');
            var model = self.collection.get(id);
            if(key === 'delete'){
                model.destroy();
                $(this).fadeOut(function(){
                    $(this).remove();
                });
            }
            if(key === 'properties'){
//                var $property = '.property-';
//                var status = {
//                    '108': 'Ready',
//                    '109': 'Open',
//                    '110': 'Complete'
//                };
//                var $el = $(document);
//                $el.find($property+'name').html(model.get('name'));
//                $el.find($property+'description').html(model.get('description'));
//                $el.find($property+'start').html(convertDate(model.get('start')));
//                $el.find($property+'end').html(convertDate(model.get('end')));
//                $el.find($property+'status').html(status[model.get('status')]);
//                var startdate = new Date(model.get('start'));
//                var enddate = new Date(model.get('end'));
//                var _MS_PER_DAY = 1000 * 60 * 60 * 24;
//                if(startdate != "" && enddate != ""){
//                    var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());
//                    var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());
//                    $el.find($property+'duration').html(Math.floor((utc2 - utc1) / _MS_PER_DAY));
//                }else{
//                    $el.find($property+'duration').html(Math.floor(0));
//                }
//                $('.ui.properties').modal('setting', 'transition', 'vertical flip')
//                    .modal('show')
//                ;
//
//                function convertDate(inputFormat) {
//                    function pad(s) { return (s < 10) ? '0' + s : s; }
//                    var d = new Date(inputFormat);
//                    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
//                }
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
            if (key === 'indent') {
                var prevTask = model.collection.find(function(task) {
                    return task.get('sortindex') === model.get('sortindex') - 1;
                });
                if (prevTask) {
                    model.save('parentid', prevTask.id);
                }
            }
            if (key === 'outdent'){
                if (model.parent && model.parent.parent) {
                    model.save('parentid', model.parent.parent.id);
                } else {
                    model.save('parentid', 0);
                }
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
    var ref_model = this.collection.get(data.reference_id);
    if (ref_model) {
        sortindex = ref_model.get('sortindex') + (insertPos === 'above' ? -0.5 : 0.5)
    } else {
        sortindex = (this.app.tasks.last().get('sortindex') + 1);
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get('parentid');
    var task = this.collection.add(data, {parse : true});
    task.save();
};

module.exports = ContextMenuView;
},{}],15:[function(require,module,exports){
"use strict";
var TaskItem = require('./TaskItem');

var NestedTask = React.createClass({
    displayName : 'NestedTask',
    render : function() {
        var subtasks = this.props.model.children.map(function(task) {
            if (task.children.length) {
                return React.createElement(NestedTask, {
                    model: task,
                    isSubTask : true,
                    key : task.cid
                });
            }
            return React.createElement('li', {
                            id : task.cid,
                            key: task.cid,
                            className : 'drag-item',
                            'data-id' : task.cid
                        },
                        React.createElement(TaskItem, {
                            model: task,
                            isSubTask : true
                        })
                    );
        });
        return React.createElement('li', {
                    className : 'task-list-container drag-item' + (this.props.isSubTask ? ' sub-task' : ''),
                    id : this.props.model.cid,
                    'data-id' : this.props.model.cid
                },
                React.createElement('div', {
                        id : this.props.model.cid,
                        'data-id' : this.props.model.cid
                    },
                    React.createElement(TaskItem, {
                        model : this.props.model
                    })
                ),
                React.createElement('ol', {
                        className : 'sub-task-list sortable'
                    },
                    subtasks
                )
            );
    }
});

module.exports = NestedTask;

},{"./TaskItem":17}],16:[function(require,module,exports){
"use strict";

var TaskItem = require('./TaskItem');
var NestedTask = require('./NestedTask');

function getData(container) {
    var data = [];
    var children = $('<ol>' + container.get(0).innerHTML + '</ol>').children();
    _.each(children, function(child) {
        var $child = $(child);
        var obj = {
            id : $child.data('id'),
            children : []
        };
        var sublist = $child.find('ol');
        if (sublist.length) {
            obj.children = getData(sublist);
        }
        data.push(obj);
    });
    return data;
}

var SidePanel = React.createClass({
    displayName: 'SidePanel',
    componentDidMount  : function() {
        this.props.collection.on('add remove', function() {
            this.forceUpdate();
        }, this);
        this._makeSortable();
    },
    _makeSortable : function() {
        var container = $('.task-container');
        container.sortable({
            group: 'sortable',
            containerSelector : 'ol',
            itemSelector : '.drag-item',
            placeholder : '<li class="placeholder sort-placeholder"/>',
            onDragStart : function($item, position, _super, event) {
                _super($item, position, _super, event);
                this.hightlighter.remove();
            }.bind(this),
            onDrag : function($item, position, _super, event) {
                var $placeholder = $('.sort-placeholder');
                var isSubTask = !$($placeholder.parent()).hasClass('task-container');
                $placeholder.css({
                    'padding-left' : isSubTask ? '30px' : '0'
                });
                _super($item, position, _super, event);
            }.bind(this),
            onDrop : function($item, position, _super, event) {
                _super($item, position, _super, event);
                setTimeout(function() {
                    var data = getData(container);
                    this.props.collection.resort(data);
                }.bind(this), 10);
            }.bind(this)
        });

        this.hightlighter = $('<div>');
        this.hightlighter.css({
            position : 'absolute',
            background : 'grey',
            opacity : '0.5',
            lift : '0'
        });
        container.mouseover(function(e) {
            var $el = $(e.target);
            var pos = $el.offset();
            this.hightlighter.appendTo(document.body);
            this.hightlighter.css({
                top : pos.top,
                height : $el.height(),
                width : window.innerWidth
            });
        }.bind(this));
        container.mouseout(function() {
            this.hightlighter.remove();
        }.bind(this));
    },
    componentWillUnmount  : function() {
//        $('.task-container').sortable("disable");
        $('.task-container').sortable("destroy");
        this.props.collection.off(null, null, this);
        this.hightlighter.remove();
    },
    render: function() {
        var tasks = [];
        this.props.collection.each(function(task) {
            if (task.parent) {
                return;
            }
            if (task.children.length) {
                tasks.push(React.createElement(NestedTask, {
                    model: task,
                    key : task.cid
                }));
            } else {
                tasks.push(React.createElement('li', {
                        key : task.cid,
                        className : 'drag-item',
                        'data-id' : task.cid
                    },
                    React.createElement(TaskItem, {
                        model: task
                    })
                ));
            }
        });
        return (
            React.createElement('ol', {
                    className : 'task-container sortable'
                },
                tasks
            )
        );
    }
});

module.exports = SidePanel;

},{"./NestedTask":15,"./TaskItem":17}],17:[function(require,module,exports){
"use strict";

var TaskItem = React.createClass({
    displayName : 'TaskItem',
    getInitialState : function() {
        return {
            editRow : undefined
        };
    },
    componentDidMount  : function() {
        this.props.model.on('change', function() {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount  : function() {
        this.props.model.off(null, null, this);
    },
    _findNestedLevel : function() {
        var level = 0;
        var parent = this.props.model.parent;
        while(true) {
            if (!parent) {
                return level;
            }
            level++;
            parent = parent.parent;
        }
    },
    _createField : function(col) {
        if (this.state.editRow === col) {
            return this._createEditField(col);
        }
//        if (col === 'name' && this.props.model.get('name') === 'New task') {
//            return this._createEditField(col);
//        }
        return this._createReadFiled(col);
    },
    _createReadFiled : function(col) {
        if (col === 'complete') {
            return this.props.model.get(col) + '%';
        }
        if (col === 'start' || col === 'end') {
            return this.props.model.get(col).toString('dd/MM/yyyy');
        }
        return this.props.model.get(col);
    },
    _createEditField : function(col) {
        var val = this.props.model.get(col);
        return React.createElement('input', {
            value : (col === 'start' || col === 'end') ? val.toString('yyyy-MM-dd') : val,
            type : (col === 'start' || col === 'end') ? 'date' : 'text',
            onChange : function(e) {
                var newVal = e.target.value;
                if (col === 'start' || col === 'end') {
                    newVal = new Date(newVal);
                }
                this.props.model.set(col, newVal);
            }.bind(this),
            onKeyDown : function(e) {
                if (e.keyCode === 13) {
                    var state = this.state;
                    state.editRow = undefined;
                    this.setState(state);
                    this.props.model.save();
                }
            }.bind(this)
        });
    },
    render : function() {
        var model = this.props.model;
        return React.createElement('ul', {
                    className : 'task' + (this.props.isSubTask ? ' sub-task' : ''),
                    'data-id' : this.props.model.cid,
                    onDoubleClick : function(e) {
                        var className = e.target.className;
                        var col = className.slice(4, className.length);
                        var state = this.state;
                        state.editRow = col;
                        this.setState(state);
                    }.bind(this)
                },
                React.createElement('li', {
                    key : 'name',
                    className : 'col-name',
                    style : {
                        paddingLeft : (this._findNestedLevel() * 10) + 'px'
                    }
                }, this._createField('name')),
                React.createElement('li', {
                    key : 'complete',
                    className : 'col-complete'
                }, this._createField('complete')),
                React.createElement('li', {
                    key : 'start',
                    className : 'col-start'
                }, this._createField('start')),
                React.createElement('li', {
                    key : 'end',
                    className : 'col-end'
                }, this._createField('end')),
                React.createElement('li', {
                    key : 'status',
                    className : 'col-status'
                }, model.get('status')),
                React.createElement('li', {
                    key : 'duration',
                    className : 'col-duration'
                }, Date.daysdiff(model.get('start'),model.get('end'))+' d'),
                React.createElement('li', {
                        key : 'remove',
                        className : 'remove-item'
                    },
                    React.createElement('button', {
                            className : 'mini red ui button',
                            onClick : function() {
                                model.destroy();
                            }
                        },
                        React.createElement('i', {
                                className : 'small trash icon'
                            }
                        )
                    )
                )
            );
    }
});

module.exports = TaskItem;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9mYWtlXzc2NjZiYjIyLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9BZGRGb3JtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9OZXN0ZWRUYXNrLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1NpZGVQYW5lbC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9aQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYXNrTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGFza01vZGVsJyk7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0dXJsIDogJ2FwaS90YXNrcycsXG5cdG1vZGVsOiBUYXNrTW9kZWwsXG5cdGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xuXHR9LFxuXHRjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcblx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0bGlua0NoaWxkcmVuIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHBhcmVudFRhc2sgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50VGFzaykge1xuXHRcdFx0XHRpZiAocGFyZW50VGFzayA9PT0gdGFzaykge1xuXHRcdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0Y29uc29sZS5lcnJvcigndGFzayBoYXMgcGFyZW50IHdpdGggaWQgJyArIHRhc2suZ2V0KCdwYXJlbnRpZCcpICsgJyAtIGJ1dCB0aGVyZSBpcyBubyBzdWNoIHRhc2snKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRfc29ydENoaWxkcmVuIDogZnVuY3Rpb24gKHRhc2ssIHNvcnRJbmRleCkge1xuXHRcdHRhc2suY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKGNoaWxkLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRhc2suc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4odGFzaywgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRfcmVzb3J0Q2hpbGRyZW4gOiBmdW5jdGlvbihkYXRhLCBzdGFydEluZGV4LCBwYXJlbnRJRCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSBzdGFydEluZGV4O1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbih0YXNrRGF0YSkge1xuXHRcdFx0dmFyIHRhc2sgPSB0aGlzLmdldCh0YXNrRGF0YS5pZCk7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudElEKSB7XG5cdFx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldChwYXJlbnRJRCk7XG5cdFx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNhdmUoe1xuXHRcdFx0XHRzb3J0aW5kZXg6ICsrc29ydEluZGV4LFxuXHRcdFx0XHRwYXJlbnRpZDogcGFyZW50SURcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhc2tEYXRhLmNoaWxkcmVuICYmIHRhc2tEYXRhLmNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9yZXNvcnRDaGlsZHJlbih0YXNrRGF0YS5jaGlsZHJlbiwgc29ydEluZGV4LCB0YXNrLmlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdHJlc29ydCA6IGZ1bmN0aW9uKGRhdGEpIHtcbi8vXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHRoaXMuX3Jlc29ydENoaWxkcmVuKGRhdGEsIC0xLCAwKTtcblx0XHR0aGlzLnNvcnQoKTtcbi8vXHRcdHZhciBzZWxmID0gdGhpcztcbi8vXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbihwYXJlbnREYXRhKSB7XG4vL1x0XHRcdHZhciBwYXJlbnRNb2RlbCA9IHRoaXMuZ2V0KHBhcmVudERhdGEuaWQpO1xuLy9cdFx0XHR2YXIgcHJldlNvcnQgPSBwYXJlbnRNb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuLy9cdFx0XHRpZiAocHJldlNvcnQgIT09ICsrc29ydEluZGV4KSB7XG4vL1x0XHRcdFx0cGFyZW50TW9kZWwuc2V0KCdzb3J0aW5kZXgnLCBzb3J0SW5kZXgpLnNhdmUoKTtcbi8vXHRcdFx0fVxuLy9cdFx0XHRpZiAocGFyZW50TW9kZWwuZ2V0KCdwYXJlbnRpZCcpKSB7XG4vL1x0XHRcdFx0cGFyZW50TW9kZWwuc2V0KCdwYXJlbnRpZCcsIDApLnNhdmUoKTtcbi8vXHRcdFx0fVxuLy9cdFx0XHRwYXJlbnREYXRhLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGREYXRhKSB7XG4vL1x0XHRcdFx0dmFyIGNoaWxkTW9kZWwgPSBzZWxmLmdldChjaGlsZERhdGEuaWQpO1xuLy9cdFx0XHRcdHZhciBwcmV2U29ydEkgPSBjaGlsZE1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG4vL1x0XHRcdFx0aWYgKHByZXZTb3J0SSAhPT0gKytzb3J0SW5kZXgpIHtcbi8vXHRcdFx0XHRcdGNoaWxkTW9kZWwuc2V0KCdzb3J0aW5kZXgnLCBzb3J0SW5kZXgpLnNhdmUoKTtcbi8vXHRcdFx0XHR9XG4vL1x0XHRcdFx0aWYgKGNoaWxkTW9kZWwuZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRNb2RlbC5pZCkge1xuLy9cdFx0XHRcdFx0Y2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJywgcGFyZW50TW9kZWwuaWQpLnNhdmUoKTtcbi8vXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBzZWxmLmZpbmQoZnVuY3Rpb24obSkge1xuLy9cdFx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gcGFyZW50TW9kZWwuaWQ7XG4vL1x0XHRcdFx0XHR9KTtcbi8vXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQoY2hpbGRNb2RlbCk7XG4vL1x0XHRcdFx0fVxuLy9cdFx0XHR9KTtcbi8vXHRcdH0uYmluZCh0aGlzKSk7XG4vL1x0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0fSxcblx0c3Vic2NyaWJlIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IG1vZGVsLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5saW5rQ2hpbGRyZW4oKTtcblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZ2V0KG1vZGVsLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRjcmVhdGVEZXBlbmRlbmN5IDogZnVuY3Rpb24gKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0YWZ0ZXJNb2RlbC5zZXQoJ2RlcGVuZCcsIGJlZm9yZU1vZGVsLmlkKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0NvbGxlY3Rpb247XG5cbiIsIlxudmFyIFRhc2tDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9ucy90YXNrQ29sbGVjdGlvbicpO1xudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9tb2RlbHMvU2V0dGluZ01vZGVsJyk7XG5cbnZhciBHYW50dFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0dhbnR0VmlldycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL3V0aWwnKTtcblxuJChmdW5jdGlvbiAoKSB7XG5cdHZhciBhcHAgPSB7fTtcblx0YXBwLnRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cblx0Ly8gZGV0ZWN0IEFQSSBwYXJhbXMgZnJvbSBnZXQsIGUuZy4gP3Byb2plY3Q9MTQzJnByb2ZpbGU9MTdcblx0dmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cdGlmIChwYXJhbXMucHJvamVjdCAmJiBwYXJhbXMucHJvZmlsZSkge1xuXHRcdGFwcC50YXNrcy51cmwgPSAnYXBpL3Rhc2tzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5wcm9maWxlO1xuXHR9XG5cblx0YXBwLnRhc2tzLmZldGNoKHtcblx0XHRzdWNjZXNzIDogZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnU3VjY2VzcyBsb2FkaW5nIHRhc2tzLicpO1xuXHRcdFx0YXBwLnNldHRpbmdzID0gbmV3IFNldHRpbmdzKHt9LCB7YXBwIDogYXBwfSk7XG5cdFx0XHRhcHAudGFza3MubGlua0NoaWxkcmVuKCk7XG5cdFx0XHRhcHAudGFza3MuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcCxcblx0XHRcdFx0Y29sbGVjdGlvbiA6IGFwcC50YXNrc1xuXHRcdFx0fSkucmVuZGVyKCk7XG5cdFx0XHQkKCcjbG9hZGVyJykuZmFkZU91dCgpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9XG5cdH0sIHtwYXJzZTogdHJ1ZX0pO1xufSk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcblxudmFyIGFwcCA9IHt9O1xuXG52YXIgaGZ1bmMgPSBmdW5jdGlvbihwb3MsIGV2dCkge1xuXHR2YXIgZHJhZ0ludGVydmFsID0gYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInLCAnZHJhZ0ludGVydmFsJyk7XG5cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcblx0cmV0dXJuIHtcblx0XHR4OiBldnQuaW5pcG9zLnggKyBuICogZHJhZ0ludGVydmFsLFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGludGVydmFsOiAnZml4Jyxcblx0XHQvL2RheXMgcGVyIGludGVydmFsXG5cdFx0ZHBpOiAxXG5cdH0sXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0YXBwID0gdGhpcy5hcHA7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwXG5cdFx0fTtcblxuXHRcdHRoaXMuc2dyb3VwID0ge1xuXHRcdFx0Y3VycmVudFk6IDAsXG5cdFx0XHRpbmlZOiA2MCxcblx0XHRcdGFjdGl2ZTogZmFsc2UsXG5cdFx0XHR0b3BCYXI6IHtcblx0XHRcdFx0ZmlsbDogJyM2NjYnLFxuXHRcdFx0XHRoZWlnaHQ6IDEyLFxuXHRcdFx0XHRzdHJva2VFbmFibGVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdGdhcDogMyxcblx0XHRcdHJvd0hlaWdodDogMjIsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiBoZnVuY1xuXHRcdH07XG5cblx0XHR0aGlzLnNiYXIgPSB7XG5cdFx0XHRiYXJoZWlnaHQ6IDEyLFxuXHRcdFx0Z2FwOiAyMCxcblx0XHRcdHJvd2hlaWdodDogIDYwLFxuXHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxuXHRcdFx0cmVzaXphYmxlOiB0cnVlLFxuXHRcdFx0ZHJhZ0JvdW5kRnVuYzogaGZ1bmMsXG5cdFx0XHRyZXNpemVCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdFx0c3ViZ3JvdXA6IHRydWVcblx0XHR9O1xuXHRcdHRoaXMuc2Zvcm09e1xuXHRcdFx0J25hbWUnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAndGV4dCdcblx0XHRcdH0sXG5cdFx0XHQnc3RhcnQnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnZGF0ZScsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24oZCl7XG5cdFx0XHRcdFx0cmV0dXJuIGQudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dDJkOiBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5wYXJzZUV4YWN0KCB1dGlsLmNvcnJlY3RkYXRlKHQpLCAnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdkYXRlJyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRyZXR1cm4gZC50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0MmQ6IGZ1bmN0aW9uKHQpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLnBhcnNlRXhhY3QoIHV0aWwuY29ycmVjdGRhdGUodCksICdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3NlbGVjdCcsXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHQnMTEwJzogJ2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5JzogJ29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2NvbXBsZXRlJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnXG5cdFx0XHR9LFxuXHRcdFx0J2R1cmF0aW9uJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnLFxuXHRcdFx0XHRkMnQ6IGZ1bmN0aW9uKHQsbW9kZWwpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSxtb2RlbC5nZXQoJ2VuZCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0dGhpcy5nZXRGb3JtRWxlbSA9IHRoaXMuY3JlYXRlRWxlbSgpO1xuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuYXBwLnRhc2tzO1xuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XG5cdH0sXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xuXHRcdGlmKGF0dHIpe1xuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xuXHR9LFxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWluRGF0ZSA9IG5ldyBEYXRlKDIwMjAsMSwxKSwgbWF4RGF0ZSA9IG5ldyBEYXRlKDAsMCwwKTtcblx0XHRcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XG5cdFx0XHRcdG1pbkRhdGU9bW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGUgPSBtaW5EYXRlO1xuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XG5cdFx0XG5cdH0sXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xuXHRcdFxuXHRcdHZhciBpbnRlcnZhbCA9IHRoaXMuZ2V0KCdpbnRlcnZhbCcpO1xuXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDEyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdFxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCA3LCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogNykubW92ZVRvRGF5T2ZXZWVrKDEsIC0xKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDcpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiAzMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluLm1vdmVUb0ZpcnN0RGF5T2ZRdWFydGVyKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gMzAgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcblx0XHRcdGNlbGxXaWR0aCA9IDMwO1xuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2l6ZSAvIGR1cmF0aW9uO1xuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gZHBpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcblx0XHRcdGRwaSA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIwICogZHBpKTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xuXHRcdFx0fTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHR9XG5cdFx0dmFyIGhEYXRhID0ge1xuXHRcdFx0JzEnOiBbXSxcblx0XHRcdCcyJzogW10sXG5cdFx0XHQnMyc6IFtdXG5cdFx0fTtcblx0XHR2YXIgaGRhdGEzID0gW107XG5cdFx0XG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcblx0XHRcblx0XHRsYXN0ID0gc3RhcnQ7XG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR2YXIgZHVyZnVuYztcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGR1cmZ1bmMobGFzdCksXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogaW50ZXJ2YWxkYXlzLFxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcblx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHNhdHRyLmJvdW5kYXJ5TWF4ID0gZW5kID0gbGFzdDtcblx0XHRoRGF0YVsnMyddID0gaGRhdGEzO1xuXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBkYXRlIHRvIGVuZCBvZiB5ZWFyXG5cdFx0dmFyIGludGVyID0gRGF0ZS5kYXlzZGlmZihzdGFydCwgbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgMTEsIDMxKSk7XG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdHRleHQ6IHN0YXJ0LmdldEZ1bGxZZWFyKClcblx0XHR9KTtcblx0XHRmb3IoaSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCkgKyAxLCBpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7IGkgPCBpTGVuOyBpKyspe1xuXHRcdFx0aW50ZXIgPSBEYXRlLmlzTGVhcFllYXIoaSkgPyAzNjYgOiAzNjU7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGlcblx0XHRcdH0pO1xuXHRcdH1cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGxhc3QgeWVhciB1cHRvIGVuZCBkYXRlXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0aW50ZXIgPSBEYXRlLmRheXNkaWZmKG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCAwLCAxKSwgZW5kKTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdFx0dGV4dDogZW5kLmdldEZ1bGxZZWFyKClcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKHN0YXJ0LCBzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLFxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcblx0XHR9KTtcblx0XHRcblx0XHRqID0gc3RhcnQuZ2V0TW9udGgoKSArIDE7XG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG5cdFx0aUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpO1xuXHRcdHZhciBlbmRtb250aCA9IGVuZC5nZXRNb250aCgpO1xuXG5cdFx0d2hpbGUgKGkgPD0gaUxlbikge1xuXHRcdFx0d2hpbGUoaiA8IDEyKSB7XG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5nZXREYXlzSW5Nb250aChpLCBqKSxcblx0XHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoaiwgJ20nKVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aiArPSAxO1xuXHRcdFx0fVxuXHRcdFx0aSArPSAxO1xuXHRcdFx0aiA9IDA7XG5cdFx0fVxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGggJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xuXHR9LFxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xuXHR9LFxuXHRjcmVhdGVFbGVtOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWxlbXMgPSB7fSwgb2JqLCBjYWxsYmFjayA9IGZhbHNlLCBjb250ZXh0ID0gZmFsc2U7XG5cdFx0ZnVuY3Rpb24gYmluZFRleHRFdmVudHMoZWxlbWVudCwgb2JqLCBuYW1lKSB7XG5cdFx0XHRlbGVtZW50Lm9uKCdibHVyJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWUgPSAkdGhpcy52YWwoKTtcblx0XHRcdFx0JHRoaXMuZGV0YWNoKCk7XG5cdFx0XHRcdHZhciBjYWxsZnVuYyA9IGNhbGxiYWNrLCBjdHggPSBjb250ZXh0O1xuXHRcdFx0XHRjYWxsYmFjayA9IGZhbHNlO1xuXHRcdFx0XHRjb250ZXh0ID0gZmFsc2U7XG5cdFx0XHRcdGlmIChvYmoudDJkKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqLnQyZCh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FsbGZ1bmMuY2FsbChjdHgsbmFtZSx2YWx1ZSk7XG5cdFx0XHR9KS5vbigna2V5cHJlc3MnLGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRpZihldmVudC53aGljaD09PTEzKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdGZ1bmN0aW9uIGJpbmREYXRlRXZlbnRzKGVsZW1lbnQsb2JqLG5hbWUpe1xuXHRcdFx0ZWxlbWVudC5kYXRlcGlja2VyKHsgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLG9uQ2xvc2U6ZnVuY3Rpb24oKXtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2Nsb3NlIGl0Jyk7XG5cdFx0XHRcdHZhciAkdGhpcz0kKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWU9JHRoaXMudmFsKCk7XG5cdFx0XHRcdCR0aGlzLmRldGFjaCgpO1xuXHRcdFx0XHR2YXIgY2FsbGZ1bmM9Y2FsbGJhY2ssY3R4PWNvbnRleHQ7XG5cdFx0XHRcdGNhbGxiYWNrPWZhbHNlO1xuXHRcdFx0XHRjb250ZXh0PWZhbHNlO1xuXHRcdFx0XHRpZihvYmpbJ3QyZCddKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqWyd0MmQnXSh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdFx0XHRjYWxsZnVuYy5jYWxsKGN0eCxuYW1lLHZhbHVlKTtcblx0XHRcdFx0fSwgMTApO1xuXHRcdFx0fX0pO1xuXHRcdH1cblx0XHRcblx0XHRmb3IodmFyIGkgaW4gdGhpcy5zZm9ybSl7XG5cdFx0XHRvYmo9dGhpcy5zZm9ybVtpXTtcblx0XHRcdGlmKG9iai5lZGl0YWJsZSl7XG5cdFx0XHRcdGlmKG9iai50eXBlPT09J3RleHQnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmRUZXh0RXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKG9iai50eXBlPT09J2RhdGUnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmREYXRlRXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH1cblxuXHRcdG9iaiA9IG51bGw7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLCBtb2RlbCwgY2FsbGZ1bmMsIGN0eCl7XG5cdFx0XHRjYWxsYmFjayA9IGNhbGxmdW5jO1xuXHRcdFx0Y29udGV4dCA9IGN0eDtcblx0XHRcdHZhciBlbGVtZW50PWVsZW1zW2ZpZWxkXSwgdmFsdWUgPSBtb2RlbC5nZXQoZmllbGQpO1xuXHRcdFx0aWYgKHRoaXMuc2Zvcm1bZmllbGRdLmQydCkge1xuXHRcdFx0XHR2YWx1ZSA9IHRoaXMuc2Zvcm1bZmllbGRdLmQydCh2YWx1ZSwgbW9kZWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxlbWVudC52YWwodmFsdWUpO1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQ7XG5cdFx0fTtcblx0XG5cdH0sXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRUb1RleHQ9e1xuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XG5cdFx0fTtcblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJccnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xydmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJccnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcciAgICBjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcciAgICAgICAgcmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XHIgICAgfVxyfSk7XHJccnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyICAgIGRlZmF1bHRzOiB7XHIgICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHIgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcciAgICAgICAgY29tcGxldGU6IDAsICAvLyBpbiBwZXJjZW50c1xyICAgICAgICBhY3Rpb246ICcnLFxyICAgICAgICBhY3RpdmUgOiB0cnVlLFxyICAgICAgICBzb3J0aW5kZXg6IDAsXHIgICAgICAgIGRlcGVuZGVuY3k6IG51bGwsICAvLyBpZCBvZiB0YXNrXHIgICAgICAgIHJlc291cmNlczoge30sXHIgICAgICAgIHN0YXR1czogMTEwLFxyICAgICAgICBoZWFsdGg6IDIxLFxyICAgICAgICBzdGFydDogbmV3IERhdGUoKSxcciAgICAgICAgZW5kOiBuZXcgRGF0ZSgpLFxyICAgICAgICBQcm9qZWN0UmVmIDogcGFyYW1zLnByb2plY3QsXHIgICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyICAgICAgICBjb2xvcjogJyMwMDkwZDMnLCAgIC8vIHVzZXIgY29sb3Jcci8vICAgICAgICBsaWdodGNvbG9yOiAnI0U2RjBGRicsIC8vXHIvLyAgICAgICAgZGFya2NvbG9yOiAnI2U4ODEzNCcsXHIgICAgICAgIGFUeXBlOiAnJyxcciAgICAgICAgcmVwb3J0YWJsZTogJycsXHIgICAgICAgIHBhcmVudGlkOiAwLFxyXHIgICAgICAgIC8vIGFwcCBwYXJhbXNcciAgICAgICAgaGlkZGVuIDogZmFsc2UsXHIgICAgICAgIGNvbGxhcHNlZCA6IGZhbHNlXHIgICAgfSxcciAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgU3ViVGFza3MoKTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24oY2hpbGQpIHtcciAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ3BhcmVudGlkJykgPT09IHRoaXMuaWQpIHtcciAgICAgICAgICAgICAgICByZXR1cm47XHIgICAgICAgICAgICB9XHIgICAgICAgICAgICBjaGlsZC5wYXJlbnQgPSB1bmRlZmluZWQ7XHIgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgY2hpbGQucGFyZW50ID0gdGhpcztcciAgICAgICAgfSk7XHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpzb3J0aW5kZXgnLCBmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc29ydCgpO1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5fY2hlY2tUaW1lKCk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldCgnY29sbGFwc2VkJykpIHtcciAgICAgICAgICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyICAgICAgICAgICAgICAgIH0gZWxzZSB7XHIgICAgICAgICAgICAgICAgICAgIGNoaWxkLnNob3coKTtcciAgICAgICAgICAgICAgICB9XHIgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIC8vIGNoZWNraW5nIG5lc3RlZCBzdGF0ZVxyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlJywgdGhpcy5fY2hlY2tOZXN0ZWQpO1xyXHIgICAgICAgIC8vIHRpbWUgY2hlY2tpbmdcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl9jaGVja0NvbXBsZXRlKTtcciAgICB9LFxyICAgIGlzTmVzdGVkIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyICAgIH0sXHIgICAgc2hvdyA6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgZmFsc2UpO1xyICAgIH0sXHIgICAgaGlkZSA6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgdHJ1ZSk7XHIgICAgfSxcciAgICBfY2hlY2tOZXN0ZWQgOiBmdW5jdGlvbigpIHtcciAgICAgICAgdGhpcy50cmlnZ2VyKCduZXN0ZWRTdGF0ZUNoYW5nZScsIHRoaXMpO1xyICAgIH0sXHIgICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHIgICAgICAgIHZhciBzdGFydCwgZW5kO1xyICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLnN0YXJ0KSl7XHIgICAgICAgICAgICBzdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwnZGQvTU0veXl5eScpIHx8XHIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoKTtcciAgICAgICAgfVxyICAgICAgICBcciAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcciAgICAgICAgICAgIGVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksJ2RkL01NL3l5eXknKSB8fFxyICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIGVuZCA9IG5ldyBEYXRlKCk7XHIgICAgICAgIH1cclxyICAgICAgICByZXNwb25zZS5zdGFydCA9IHN0YXJ0IDwgZW5kID8gc3RhcnQgOiBlbmQ7XHIgICAgICAgIHJlc3BvbnNlLmVuZCA9IHN0YXJ0IDwgZW5kID8gZW5kIDogc3RhcnQ7XHJcciAgICAgICAgcmVzcG9uc2UucGFyZW50aWQgPSBwYXJzZUludChyZXNwb25zZS5wYXJlbnRpZCB8fCAnMCcsIDEwKTtcclxyICAgICAgICAvLyByZW1vdmUgbnVsbCBwYXJhbXNcciAgICAgICAgXy5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbih2YWwsIGtleSkge1xyICAgICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xyICAgICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVtrZXldO1xyICAgICAgICAgICAgfVxyICAgICAgICB9KTtcciAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyICAgIH0sXHIgICAgX2NoZWNrVGltZSA6IGZ1bmN0aW9uKCkge1xyICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcciAgICAgICAgICAgIHJldHVybjtcciAgICAgICAgfVxyICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHIgICAgICAgIHZhciBlbmRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ2VuZCcpO1xyICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcciAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcciAgICAgICAgICAgIHZhciBjaGlsZEVuZFRpbWUgPSBjaGlsZC5nZXQoJ2VuZCcpO1xyICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUgPCBzdGFydFRpbWUpIHtcciAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZSA+IGVuZFRpbWUpe1xyICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHIgICAgICAgICAgICB9XHIgICAgICAgIH0uYmluZCh0aGlzKSk7XHIgICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHIgICAgICAgIHRoaXMuc2V0KCdlbmQnLCBlbmRUaW1lKTtcciAgICB9LFxyICAgIF9jaGVja0NvbXBsZXRlIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHZhciBjb21wbGV0ZSA9IDA7XHIgICAgICAgIHZhciBsZW5ndGggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcciAgICAgICAgaWYgKGxlbmd0aCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICAgICAgY29tcGxldGUgKz0gY2hpbGQuZ2V0KCdjb21wbGV0ZScpIC8gbGVuZ3RoO1xyICAgICAgICAgICAgfSk7XHIgICAgICAgIH1cciAgICAgICAgdGhpcy5zZXQoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xyICAgIH0sXHIgICAgbW92ZVRvU3RhcnQgOiBmdW5jdGlvbihuZXdTdGFydCkge1xyICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5ldyBzdGFydCBpcyB0aGUgc2FtZSBhcyBjdXJyZW50XHIgICAgICAgIGlmIChuZXdTdGFydC50b0RhdGVTdHJpbmcoKSA9PT0gdGhpcy5nZXQoJ3N0YXJ0JykudG9EYXRlU3RyaW5nKCkpIHtcciAgICAgICAgICAgIHJldHVybjtcciAgICAgICAgfVxyXHIgICAgICAgIC8vIGNhbGN1bGF0ZSBvZmZzZXRcci8vICAgICAgICB2YXIgZGF5c0RpZmYgPSBNYXRoLmZsb29yKChuZXdTdGFydC50aW1lKCkgLSB0aGlzLmdldCgnc3RhcnQnKS50aW1lKCkpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNClcciAgICAgICAgdmFyIGRheXNEaWZmID0gRGF0ZS5kYXlzZGlmZihuZXdTdGFydCwgdGhpcy5nZXQoJ3N0YXJ0JykpIC0gMTtcciAgICAgICAgaWYgKG5ld1N0YXJ0IDwgdGhpcy5nZXQoJ3N0YXJ0JykpIHtcciAgICAgICAgICAgIGRheXNEaWZmICo9IC0xO1xyICAgICAgICB9XHJcciAgICAgICAgLy8gY2hhbmdlIGRhdGVzXHIgICAgICAgIHRoaXMuc2V0KHtcciAgICAgICAgICAgIHN0YXJ0IDogbmV3U3RhcnQuY2xvbmUoKSxcciAgICAgICAgICAgIGVuZCA6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5c0RpZmYpXHIgICAgICAgIH0pO1xyXHIgICAgICAgIC8vIGNoYW5nZXMgZGF0ZXMgaW4gYWxsIGNoaWxkcmVuXHIgICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzRGlmZik7XHIgICAgfSxcciAgICBfbW92ZUNoaWxkcmVuIDogZnVuY3Rpb24oZGF5cykge1xyICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcciAgICAgICAgICAgIGNoaWxkLm1vdmUoZGF5cyk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgbW92ZSA6IGZ1bmN0aW9uKGRheXMpIHtcciAgICAgICAgdGhpcy5zYXZlKHtcciAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMoZGF5cyksXHIgICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5cylcciAgICAgICAgfSk7XHIgICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHIiLCJ2YXIgbW9udGhzQ29kZT1bJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuXG5tb2R1bGUuZXhwb3J0cy5jb3JyZWN0ZGF0ZSA9IGZ1bmN0aW9uKHN0cikge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHN0cjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdGRhdGEgPSBmdW5jdGlvbih2YWwsIHR5cGUpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmICh0eXBlID09PSAnbScpIHtcblx0XHRyZXR1cm4gbW9udGhzQ29kZVt2YWxdO1xuXHR9XG5cdHJldHVybiB2YWw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5oZnVuYyA9IGZ1bmN0aW9uKHBvcykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHtcblx0XHR4OiBwb3MueCxcblx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdH07XG59O1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSB7XG5cdHZhciBwYXJhbXMgPSB7fTtcblx0dmFyIHBybWFyciA9IHBybXN0ci5zcGxpdCgnJicpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHBybWFyci5sZW5ndGg7IGkrKykge1xuXHRcdHZhciB0bXBhcnIgPSBwcm1hcnJbaV0uc3BsaXQoJz0nKTtcblx0XHRwYXJhbXNbdG1wYXJyWzBdXSA9IHRtcGFyclsxXTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRVUkxQYXJhbXMgPSBmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0dmFyIHBybXN0ciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xuXHRyZXR1cm4gcHJtc3RyICE9PSBudWxsICYmIHBybXN0ciAhPT0gJycgPyB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSA6IHt9O1xufTtcblxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAwMi4xMi4yMDE0LlxyXG4gKi9cclxuXHJcbnZhciB0ZW1wbGF0ZSA9IFwiPGRpdiBjbGFzcz1cXFwidWkgc21hbGwgbW9kYWwgYWRkLW5ldy10YXNrIGZsaXBcXFwiPlxcclxcbiAgICA8aSBjbGFzcz1cXFwiY2xvc2UgaWNvblxcXCI+PC9pPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJoZWFkZXJcXFwiPlxcclxcbiAgICA8L2Rpdj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiY29udGVudFxcXCI+XFxyXFxuICAgICAgICA8Zm9ybSBpZD1cXFwibmV3LXRhc2stZm9ybVxcXCIgYWN0aW9uPVxcXCIvXFxcIiB0eXBlPVxcXCJQT1NUXFxcIj5cXHJcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ1aSBmb3JtIHNlZ21lbnRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8cD5MZXQncyBnbyBhaGVhZCBhbmQgc2V0IGEgbmV3IGdvYWwuPC9wPlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+VGFzayBuYW1lPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBuYW1lPVxcXCJuYW1lXFxcIiBwbGFjZWhvbGRlcj1cXFwiTmV3IHRhc2sgbmFtZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+RGlzY3JpcHRpb248L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPHRleHRhcmVhIG5hbWU9XFxcImRlc2NyaXB0aW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiVGhlIGRldGFpbGVkIGRlc2NyaXB0aW9uIG9mIHlvdXIgdGFza1xcXCI+PC90ZXh0YXJlYT5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5TZWxlY3QgcGFyZW50PC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwidWkgZHJvcGRvd24gc2VsZWN0aW9uXFxcIj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBuYW1lPVxcXCJwYXJlbnRpZFxcXCIgY2xhc3M9XFxcInVpIGRyb3Bkb3duXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZCByZXNvdXJjZXNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5Bc3NpZ24gUmVzb3VyY2VzPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlN0YXJ0IERhdGU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJkYXRlXFxcIiBuYW1lPVxcXCJzdGFydFxcXCIgcGxhY2Vob2xkZXI9XFxcIlN0YXJ0IERhdGVcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkVuZCBEYXRlPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiZGF0ZVxcXCIgbmFtZT1cXFwiZW5kXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW5kIERhdGVcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJjb21wbGV0ZVxcXCIgdmFsdWU9XFxcIjBcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJhY3Rpb25cXFwiIHZhbHVlPVxcXCJhZGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJkZXBlbmRlbmN5XFxcIiB2YWx1ZT1cXFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiYVR5cGVcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJoZWFsdGhcXFwiIHZhbHVlPVxcXCIyMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImNvbG9yXFxcIiB2YWx1ZT1cXFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwibWlsZXN0b25lXFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImRlbGl2ZXJhYmxlXFxcIiB2YWx1ZT1cXFwiMFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInJlcG9ydGFibGVcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwic29ydGluZGV4XFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImluc2VydFBvc1xcXCIgdmFsdWU9XFxcInNldFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInJlZmVyZW5jZV9pZFxcXCIgdmFsdWU9XFxcIi0xXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlN0YXR1czwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidWkgZmx1aWQgc2VsZWN0aW9uIGRyb3Bkb3duXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwic3RhdHVzXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGVmYXVsdCB0ZXh0XFxcIj5TdGF0dXM8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcImRyb3Bkb3duIGljb25cXFwiPjwvaT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwibWVudVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMDhcXFwiPlJlYWR5PC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMDlcXFwiPk9wZW48L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiIGRhdGEtdmFsdWU9XFxcIjExMFxcXCI+Q29tcGxldGVkPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkR1cmF0aW9uPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwibnVtYmVyXFxcIiBtaW49XFxcIjBcXFwiIG5hbWU9XFxcImR1cmF0aW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiUHJvamVjdCBEdXJhdGlvblxcXCIgcmVxdWlyZWQgcmVhZG9ubHk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XFxcInN1Ym1pdEZvcm1cXFwiIGNsYXNzPVxcXCJ1aSBibHVlIHN1Ym1pdCBwYXJlbnQgYnV0dG9uXFxcIj5TdWJtaXQ8L2J1dHRvbj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZm9ybT5cXHJcXG4gICAgPC9kaXY+XFxyXFxuPC9kaXY+XCI7XHJcblxyXG52YXIgZGVtb1Jlc291cmNlcyA9IFt7XCJ3YnNpZFwiOjEsXCJyZXNfaWRcIjoxLFwicmVzX25hbWVcIjpcIkpvZSBCbGFja1wiLFwicmVzX2FsbG9jYXRpb25cIjo2MH0se1wid2JzaWRcIjozLFwicmVzX2lkXCI6MixcInJlc19uYW1lXCI6XCJKb2huIEJsYWNrbW9yZVwiLFwicmVzX2FsbG9jYXRpb25cIjo0MH1dO1xyXG5cclxudmFyIEFkZEZvcm1WaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6IGRvY3VtZW50LmJvZHksXHJcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgICAnY2xpY2sgLm5ldy10YXNrJzogJ29wZW5Gb3JtJyxcclxuICAgICAgICAnY2xpY2sgI3N1Ym1pdEZvcm0nOiAnc3VibWl0Rm9ybSdcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kKHRoaXMudGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVGb3JtKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFJlc291cmNlcygpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgdGhpcy5fc2V0dXBQYXJlbnRTZWxlY3Rvcik7XHJcbiAgICB9LFxyXG4gICAgX2luaXRSZXNvdXJjZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBSZXNvdXJjZXMgZnJvbSBiYWNrZW5kXHJcbiAgICAgICAgdmFyICRyZXNvdXJjZXMgPSAnPHNlbGVjdCBpZD1cInJlc291cmNlc1wiICBuYW1lPVwicmVzb3VyY2VzW11cIiBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JztcclxuICAgICAgICBkZW1vUmVzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICRyZXNvdXJjZXMgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgcmVzb3VyY2UucmVzX2lkICsgJ1wiPicgKyByZXNvdXJjZS5yZXNfbmFtZSArICc8L29wdGlvbj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRyZXNvdXJjZXMgKz0gJzwvc2VsZWN0Pic7XHJcbiAgICAgICAgLy8gYWRkIGJhY2tlbmQgdG8gdGhlIHRhc2sgbGlzdFxyXG4gICAgICAgICQoJy5yZXNvdXJjZXMnKS5hcHBlbmQoJHJlc291cmNlcyk7XHJcblxyXG4gICAgICAgIC8vIGluaXRpYWxpemUgbXVsdGlwbGUgc2VsZWN0b3JzXHJcbiAgICAgICAgJCgnI3Jlc291cmNlcycpLmNob3Nlbih7d2lkdGg6ICc5NSUnfSk7XHJcbiAgICB9LFxyXG4gICAgX2Zvcm1WYWxpZGF0aW9uUGFyYW1zIDoge1xyXG4gICAgICAgIG5hbWU6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ25hbWUnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIGVudGVyIGEgdGFzayBuYW1lJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wbGV0ZToge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnY29tcGxldGUnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIGVudGVyIGFuIGVzdGltYXRlIGRheXMnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXJ0OiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdzdGFydCcsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGEgc3RhcnQgZGF0ZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5kOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdlbmQnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhbiBlbmQgZGF0ZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHVyYXRpb246IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYSB2YWxpZCBkdXJhdGlvbidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhdHVzOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdzdGF0dXMnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNlbGVjdCBhIHN0YXR1cydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZUZvcm0gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcubWFzdGhlYWQgLmluZm9ybWF0aW9uJykudHJhbnNpdGlvbignc2NhbGUgaW4nKTtcclxuICAgICAgICAkKCcudWkuZm9ybScpLmZvcm0odGhpcy5fZm9ybVZhbGlkYXRpb25QYXJhbXMpO1xyXG4gICAgICAgIC8vIGFzc2lnbiByYW5kb20gcGFyZW50IGNvbG9yXHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImNvbG9yXCJdJykudmFsKCcjJytNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTY3NzcyMTUpLnRvU3RyaW5nKDE2KSk7XHJcbiAgICB9LFxyXG4gICAgX3NldHVwUGFyZW50U2VsZWN0b3IgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgJHNlbGVjdG9yID0gJCgnW25hbWU9XCJwYXJlbnRpZFwiXScpO1xyXG4gICAgICAgICRzZWxlY3Rvci5lbXB0eSgpO1xyXG4gICAgICAgICRzZWxlY3Rvci5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCIwXCI+TWFpbiBQcm9qZWN0PC9vcHRpb24+Jyk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSBwYXJzZUludCh0YXNrLmdldCgncGFyZW50aWQnKSwgMTApO1xyXG4gICAgICAgICAgICBpZihwYXJlbnRJZCA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIHRhc2suaWQgKyAnXCI+JyArIHRhc2suZ2V0KCduYW1lJykgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCdzZWxlY3QuZHJvcGRvd24nKS5kcm9wZG93bigpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIC8vIGluaXRpYWxpemUgZHJvcGRvd25cclxuICAgICAgICB0aGlzLl9zZXR1cFBhcmVudFNlbGVjdG9yKCk7XHJcbiAgICB9LFxyXG4gICAgb3BlbkZvcm06IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy51aS5hZGQtbmV3LXRhc2snKS5tb2RhbCgnc2V0dGluZycsICd0cmFuc2l0aW9uJywgJ3ZlcnRpY2FsIGZsaXAnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgfSxcclxuICAgIHN1Ym1pdEZvcm06IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgZm9ybSA9ICQoXCIjbmV3LXRhc2stZm9ybVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAkKGZvcm0pLnNlcmlhbGl6ZUFycmF5KCkuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgICBkYXRhW2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgICAgICBpZiAocmVmX21vZGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnNlcnRQb3MgPSBkYXRhLmluc2VydFBvcztcclxuICAgICAgICAgICAgc29ydGluZGV4ID0gcmVmX21vZGVsLmdldCgnc29ydGluZGV4JykgKyAoaW5zZXJ0UG9zID09PSAnYWJvdmUnID8gLTAuNSA6IDAuNSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc29ydGluZGV4ID0gKHRoaXMuY29sbGVjdGlvbi5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLnNvcnRpbmRleCA9IHNvcnRpbmRleDtcclxuXHJcbiAgICAgICAgaWYgKGZvcm0uZ2V0KDApLmNoZWNrVmFsaWRpdHkoKSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciB0YXNrID0gdGhpcy5jb2xsZWN0aW9uLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICAgICAgICAgIHRhc2suc2F2ZSgpO1xyXG4gICAgICAgICAgICAkKCcudWkubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFkZEZvcm1WaWV3OyIsIlwidXNlIHN0cmljdFwiO1xydmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBTaWRlUGFuZWwgPSByZXF1aXJlKCcuL3NpZGVCYXIvU2lkZVBhbmVsJyk7XHJcclxydmFyIEdhbnR0Q2hhcnRWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXNDaGFydC9HYW50dENoYXJ0VmlldycpO1xydmFyIEFkZEZvcm1WaWV3ID0gcmVxdWlyZSgnLi9BZGRGb3JtVmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51VmlldycpO1xyXHJccnZhciBHYW50dFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHIgICAgZWw6ICcuR2FudHQnLFxyICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyICAgICAgICB0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBBZGRGb3JtVmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBUb3BNZW51Vmlldyh7XHIgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMuY2FudmFzVmlldyA9IG5ldyBHYW50dENoYXJ0Vmlldyh7XHIgICAgICAgICAgICBhcHAgOiB0aGlzLmFwcCxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyICAgICAgICB9LmJpbmQodGhpcyksIDUwMCk7XHJcclxyICAgICAgICB2YXIgdGFza3NDb250YWluZXIgPSAkKCcudGFza3MnKS5nZXQoMCk7XHIgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2lkZVBhbmVsLCB7XHIgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICAgICAgfSksXHIgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICApO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0YXNrc0NvbnRhaW5lcik7XHIgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgICAgIHRhc2tzQ29udGFpbmVyXHIgICAgICAgICAgICApO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIGV2ZW50czoge1xyICAgICAgICAnY2xpY2sgI3RIYW5kbGUnOiAnZXhwYW5kJ1xyLy8gICAgICAgICdkYmxjbGljayAuc3ViLXRhc2snOiAnaGFuZGxlcm93Y2xpY2snLFxyLy8gICAgICAgICdkYmxjbGljayAudGFzayc6ICdoYW5kbGVyb3djbGljaycsXHIvLyAgICAgICAgJ2hvdmVyIC5zdWItdGFzayc6ICdzaG93TWFzaydcciAgICB9LFxyICAgIGNhbGN1bGF0ZUR1cmF0aW9uOiBmdW5jdGlvbigpe1xyXHIgICAgICAgIC8vIENhbGN1bGF0aW5nIHRoZSBkdXJhdGlvbiBmcm9tIHN0YXJ0IGFuZCBlbmQgZGF0ZVxyICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cInN0YXJ0XCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgZW5kZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHIgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPT0gXCJcIiAmJiBlbmRkYXRlICE9PSBcIlwiKXtcciAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgIHZhciB1dGMyID0gRGF0ZS5VVEMoZW5kZGF0ZS5nZXRGdWxsWWVhcigpLCBlbmRkYXRlLmdldE1vbnRoKCksIGVuZGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyICAgICAgICB9ZWxzZXtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKDApKTtcciAgICAgICAgfVxyICAgIH0sXHIgICAgZXhwYW5kOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LnRhcmdldCk7XHIgICAgICAgIGlmIChidXR0b24uaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgfVxyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA2MDApO1xyICAgICAgICBidXR0b24udG9nZ2xlQ2xhc3MoJ2NvbnRyYWN0Jyk7XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuZmluZCgnLm1lbnUtaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ21lbnUtaGVhZGVyLW9wZW5lZCcpO1xyICAgIH0sXHIgICAgX21vdmVDYW52YXNWaWV3IDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHZhciBzaWRlQmFyV2lkdGggPSAkKCcubWVudS1jb250YWluZXInKS53aWR0aCgpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuc2V0TGVmdFBhZGRpbmcoc2lkZUJhcldpZHRoKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBHYW50dFZpZXc7XHIiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBUb3BNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJy5oZWFkLWJhcicsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrIGJ1dHRvbic6ICdvbkludGVydmFsQnV0dG9uQ2xpY2tlZCcsXHJcbiAgICAgICAgJ2NsaWNrIGFbaHJlZj1cIi8jIS9nZW5lcmF0ZS9cIl0nOiAnZ2VuZXJhdGVQREYnXHJcbiAgICB9LFxyXG4gICAgb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQgOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gJChldnQuY3VycmVudFRhcmdldCk7XHJcbiAgICAgICAgdmFyIGFjdGlvbiA9IGJ1dHRvbi5kYXRhKCdhY3Rpb24nKTtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBhY3Rpb24uc3BsaXQoJy0nKVsxXTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnNldCgnaW50ZXJ2YWwnLCBpbnRlcnZhbCk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVQREYgOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB3aW5kb3cucHJpbnQoKTtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvcE1lbnVWaWV3O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2JvcmRlcldpZHRoIDogMyxcclxuICAgIF9jb2xvciA6ICcjRTZGMEZGJyxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBfLmV4dGVuZChCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5ldmVudHMoKSwge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmxlZnRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5yaWdodEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG5cclxuICAgICAgICAgICAgJ2RyYWdlbmQgLmxlZnRCb3JkZXInIDogJ3JlbmRlcicsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5yaWdodEJvcmRlcicgOiAncmVuZGVyJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLmxlZnRCb3JkZXInIDogJ19wb2ludGVyTW91c2UnLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLmxlZnRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAucmlnaHRCb3JkZXInIDogJ19wb2ludGVyTW91c2UnLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLnJpZ2h0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBwb3MueCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMucGFyYW1zLnBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLnBhcmFtcy5wYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLnBhcmFtcy5oZWlnaHQgLSB0aGlzLnBhcmFtcy5wYWRkaW5nICogMixcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLnBhcmFtcy5wYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5wYXJhbXMucGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5wYXJhbXMuaGVpZ2h0IC0gdGhpcy5wYXJhbXMucGFkZGluZyAqIDIsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3BvaW50ZXJNb3VzZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgfSxcclxuICAgIF9kZWZhdWx0TW91c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcclxuICAgIH0sXHJcbiAgICBfY2hhbmdlU2l6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZWZ0WCA9IHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCk7XHJcbiAgICAgICAgdmFyIHJpZ2h0WCA9IHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpICsgdGhpcy5fYm9yZGVyV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LndpZHRoKHJpZ2h0WCAtIGxlZnRYKTtcclxuICAgICAgICByZWN0LngobGVmdFgpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxIC0gdGhpcy5fYm9yZGVyV2lkdGgpO1xyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxvbmVUYXNrVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQmFzaWNUYXNrVmlldyA9IEJhY2tib25lLktpbmV0aWNWaWV3LmV4dGVuZCh7XHJcbiAgICBwYXJhbXMgOiB7XHJcbiAgICAgICAgaGVpZ2h0IDogMjEsXHJcbiAgICAgICAgcGFkZGluZyA6IDNcclxuICAgIH0sXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjZTg4MTM0JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX2luaXRNb2RlbEV2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZScgOiAnX3VwZGF0ZURhdGVzJyxcclxuICAgICAgICAgICAgJ2RyYWdlbmQnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXInIDogJ19zaG93RGVwZW5kZW5jeVRvb2wnLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQnIDogJ19oaWRlRGVwZW5kZW5jeVRvb2wnLFxyXG4gICAgICAgICAgICAnZHJhZ3N0YXJ0IC5kZXBlbmRlbmN5VG9vbCcgOiAnX3N0YXJ0Q29ubmVjdGluZycsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAuZGVwZW5kZW5jeVRvb2wnIDogJ19tb3ZlQ29ubmVjdCcsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5kZXBlbmRlbmN5VG9vbCcgOiAnX2NyZWF0ZURlcGVuZGVuY3knXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3lcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgaWQgOiB0aGlzLm1vZGVsLmlkLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5wYXJhbXMucGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5wYXJhbXMuaGVpZ2h0IC0gdGhpcy5wYXJhbXMucGFkZGluZyAqIDIsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbWFpblJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29tcGxldGVDb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMucGFyYW1zLnBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMucGFyYW1zLmhlaWdodCAtIHRoaXMucGFyYW1zLnBhZGRpbmcgKiAyLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2NvbXBsZXRlUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGFyYyA9IG5ldyBLaW5ldGljLlNoYXBlKHtcclxuICAgICAgICAgICAgeTogdGhpcy5wYXJhbXMucGFkZGluZyxcclxuICAgICAgICAgICAgZmlsbCA6ICdncmVlbicsXHJcbiAgICAgICAgICAgIGRyYXdGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gc2VsZi5wYXJhbXMuaGVpZ2h0IC0gc2VsZi5wYXJhbXMucGFkZGluZyAqIDI7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoMCwgaGVpZ2h0IC8gMiwgaGVpZ2h0IC8gMiwgLSBNYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbygwLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3Ryb2tlU2hhcGUodGhpcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5hbWUgOiAnZGVwZW5kZW5jeVRvb2wnLFxyXG4gICAgICAgICAgICB2aXNpYmxlIDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkKHJlY3QsIGNvbXBsZXRlUmVjdCwgYXJjKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZURhdGVzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHJlY3Qud2lkdGgoKTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5mbG9vcih4IC8gZGF5c1dpZHRoKSwgZGF5czIgPSBNYXRoLmZsb29yKCh4ICsgbGVuZ3RoKSAvIGRheXNXaWR0aCk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXHJcbiAgICAgICAgICAgIGVuZDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zaG93RGVwZW5kZW5jeVRvb2wgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9oaWRlRGVwZW5kZW5jeVRvb2wgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9zdGFydENvbm5lY3RpbmcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wuaGlkZSgpO1xyXG4gICAgICAgIHZhciBwb3MgPSB0b29sLmdldEFic29sdXRlUG9zaXRpb24oKTtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gbmV3IEtpbmV0aWMuTGluZSh7XHJcbiAgICAgICAgICAgIHN0cm9rZSA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoIDogMSxcclxuICAgICAgICAgICAgcG9pbnRzIDogW3Bvcy54IC0gc3RhZ2UueCgpLCBwb3MueSwgcG9zLnggLSBzdGFnZS54KCksIHBvcy55XSxcclxuICAgICAgICAgICAgbmFtZSA6ICdjb25uZWN0b3InXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmFkZChjb25uZWN0b3IpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfbW92ZUNvbm5lY3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHBvaW50cyA9IGNvbm5lY3Rvci5wb2ludHMoKTtcclxuICAgICAgICBwb2ludHNbMl0gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS54IC0gc3RhZ2UueCgpO1xyXG4gICAgICAgIHBvaW50c1szXSA9IHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLnk7XHJcbiAgICAgICAgY29ubmVjdG9yLnBvaW50cyhwb2ludHMpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEZXBlbmRlbmN5IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgY29ubmVjdG9yLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgZWwgPSBzdGFnZS5nZXRJbnRlcnNlY3Rpb24oc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkpO1xyXG4gICAgICAgIHZhciBncm91cCA9IGVsLmdldFBhcmVudCgpO1xyXG4gICAgICAgIHZhciB0YXNrSWQgPSBncm91cC5pZCgpO1xyXG4gICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMubW9kZWw7XHJcbiAgICAgICAgdmFyIGFmdGVyTW9kZWwgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZ2V0KHRhc2tJZCk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmNyZWF0ZURlcGVuZGVuY3koYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZHJhZ2dpbmcgPSB0aGlzLmVsLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5nZXRDaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZHJhZ2dpbmcgfHwgY2hpbGQuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdlbmQnKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICAvLyBtb3ZlIGdyb3VwXHJcbiAgICAgICAgdGhpcy5lbC54KHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgbWFpbiByZWN0IHBhcmFtc1xyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LngoMCk7XHJcbiAgICAgICAgcmVjdC53aWR0aCh4LngyIC0geC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHgueDIgLSB4LngxKTtcclxuICAgICAgICB0b29sLnkodGhpcy5wYXJhbXMucGFkZGluZyk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc2V0WSA6IGZ1bmN0aW9uKHkpIHtcclxuICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB0aGlzLmVsLnkoeSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0WSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl95O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzaWNUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBDb25uZWN0b3JWaWV3ID0gQmFja2JvbmUuS2luZXRpY1ZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gcGFyYW1zLmJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMuYWZ0ZXJNb2RlbCA9IHBhcmFtcy5hZnRlck1vZGVsO1xyXG4gICAgICAgIHRoaXMuX3kxID0gMDtcclxuICAgICAgICB0aGlzLl95MiA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGluZSA9IG5ldyBLaW5ldGljLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDIsXHJcbiAgICAgICAgICAgIHN0cm9rZSA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFswLDAsMCwwXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgfSxcclxuICAgIHNldFkxIDogZnVuY3Rpb24oeTEpIHtcclxuICAgICAgICB0aGlzLl95MSA9IHkxO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0WTIgOiBmdW5jdGlvbih5Mikge1xyXG4gICAgICAgIHRoaXMuX3kyID0geTI7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLnBvaW50cyhbeC54MSwgdGhpcy5feTEsIHgueDIsIHRoaXMuX3kyXSk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYWZ0ZXJNb2RlbC5nZXQoJ3N0YXJ0JykpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvclZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSByZXF1aXJlKCcuL05lc3RlZFRhc2tWaWV3Jyk7XHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gcmVxdWlyZSgnLi9BbG9uZVRhc2tWaWV3Jyk7XHJcbnZhciBDb25uZWN0b3JWaWV3ID0gcmVxdWlyZSgnLi9Db25uZWN0b3JWaWV3Jyk7XHJcblxyXG52YXIgR2FudHRDaGFydFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyNnYW50dC1jb250YWluZXInLFxyXG4gICAgX3RvcFBhZGRpbmcgOiA3MyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gW107XHJcbiAgICAgICAgdGhpcy5faW5pdFN0YWdlKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdExheWVycygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRCYWNrZ3JvdW5kKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFN1YlZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdENvbGxlY3Rpb25FdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBzZXRMZWZ0UGFkZGluZyA6IGZ1bmN0aW9uKG9mZnNldCkge1xyXG4gICAgICAgIHRoaXMuX2xlZnRQYWRkaW5nID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN0YWdlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZSA9IG5ldyBLaW5ldGljLlN0YWdlKHtcclxuICAgICAgICAgICAgY29udGFpbmVyIDogdGhpcy5lbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdExheWVycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuRmxheWVyID0gbmV3IEtpbmV0aWMuTGF5ZXIoKTtcclxuICAgICAgICB0aGlzLkJsYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIsIHRoaXMuRmxheWVyKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlU3RhZ2VBdHRycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5zZXRBdHRycyh7XHJcbiAgICAgICAgICAgIHggOiB0aGlzLl9sZWZ0UGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heCgkKFwiLm1lbnUtY29udGFpbmVyXCIpLmlubmVySGVpZ2h0KCksIHdpbmRvdy5pbm5lckhlaWdodCAtICQodGhpcy5zdGFnZS5nZXRDb250YWluZXIoKSkub2Zmc2V0KCkudG9wKSxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuJGVsLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDtcclxuICAgICAgICAgICAgICAgIHZhciBtaW5YID0gLSAobGluZVdpZHRoIC0gdGhpcy53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb3MueCA+IHNlbGYuX2xlZnRQYWRkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYuX2xlZnRQYWRkaW5nO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3MueCA8IG1pblgpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbWluWDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHBvcy54O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdEJhY2tncm91bmQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2hhcGUgPSBuZXcgS2luZXRpYy5TaGFwZSh7XHJcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0U2NlbmVGdW5jdGlvbigpLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciB3aWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgYmFjayA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLnN0YWdlLmhlaWdodCgpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHdpZHRoXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuQmxheWVyLmFkZChiYWNrKS5hZGQoc2hhcGUpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9nZXRTY2VuZUZ1bmN0aW9uIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNkaXNwbGF5ID0gdGhpcy5zZXR0aW5ncy5zZGlzcGxheTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IDE7XHJcbiAgICAgICAgdmFyIHJvd0hlaWdodCA9IDIwO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAgICAgICAgIHZhciBpLCBzLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XHJcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAvL2RyYXcgdGhyZWUgbGluZXNcclxuICAgICAgICAgICAgZm9yKGkgPSAxOyBpIDwgNCA7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcclxuICAgICAgICAgICAgZm9yIChzID0gMTsgcyA8IDM7IHMrKyl7XHJcbiAgICAgICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aD1oRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB5Zik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxMHB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWYgLSByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHlpID0geWY7IHlmID0geWYgKyByb3dIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwOyBzID0gMzsgeWYgPSAxMjAwO1xyXG4gICAgICAgICAgICB2YXIgZHJhZ0ludCA9IHBhcnNlSW50KHNhdHRyLmRyYWdJbnRlcnZhbCwgMTApO1xyXG4gICAgICAgICAgICB2YXIgaGlkZURhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYoIGRyYWdJbnQgPT09IDE0IHx8IGRyYWdJbnQgPT09IDMwKXtcclxuICAgICAgICAgICAgICAgIGhpZGVEYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGg9aERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB5Zik7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnNnB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2xlZnQnO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgIC8vIGRhdGUgaGlkZSBvbiBzcGVjaWZpYyB2aWV3c1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZGVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzFwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHgtbGVuZ3RoKzQwLHlpK3Jvd0hlaWdodC8yKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb250ZXh0LmZpbGxTdHJva2VTaGFwZSh0aGlzKTtcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRDb2xsZWN0aW9uRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAncmVtb3ZlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdjaGFuZ2U6ZGVwZW5kJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnbmVzdGVkU3RhdGVDaGFuZ2UnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVZpZXdGb3JNb2RlbCh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbCA6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgdmFyIHRhc2tWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gbW9kZWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlVmlldyh0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXcgOiBmdW5jdGlvbih0YXNrVmlldykge1xyXG4gICAgICAgIHRhc2tWaWV3LnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl90YXNrVmlld3MsIHRhc2tWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN1YlZpZXdzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyh0YXNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9hZGRUYXNrVmlldyA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgdmlldztcclxuICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTmVzdGVkVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWxvbmVUYXNrVmlldyh7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcclxuICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9hZGRDb25uZWN0b3JWaWV3IDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciBkZXBlbmRJZCA9IHRhc2suZ2V0KCdkZXBlbmQnKTtcclxuICAgICAgICBpZiAoIWRlcGVuZElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZpZXcgPSBuZXcgQ29ubmVjdG9yVmlldyh7XHJcbiAgICAgICAgICAgIGJlZm9yZU1vZGVsIDogdGhpcy5jb2xsZWN0aW9uLmdldChkZXBlbmRJZCksXHJcbiAgICAgICAgICAgIGFmdGVyTW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XHJcbiAgICAgICAgdmlldy5lbC5tb3ZlVG9Cb3R0b20oKTtcclxuICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzLnB1c2godmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3Jlc29ydFZpZXdzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxhc3RZID0gdGhpcy5fdG9wUGFkZGluZztcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmlldy5zZXRZKGxhc3RZKTtcclxuICAgICAgICAgICAgbGFzdFkgKz0gdmlldy5oZWlnaHQ7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBkZXBlbmRJZCA9IHRhc2suZ2V0KCdkZXBlbmQnKTtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSB8fCAhZGVwZW5kSWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRlcGVuZElkKTtcclxuICAgICAgICAgICAgdmFyIGJlZm9yZVZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgYWZ0ZXJWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcuYmVmb3JlTW9kZWwgPT09IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMShiZWZvcmVWaWV3LmdldFkoKSArIGJlZm9yZVZpZXcucGFyYW1zLmhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICBjb25uZWN0b3JWaWV3LnNldFkyKGFmdGVyVmlldy5nZXRZKCkgICsgYWZ0ZXJWaWV3LnBhcmFtcy5oZWlnaHQgLyAyKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yIDogJyNiM2QxZmMnLFxyXG4gICAgX3VwZGF0ZURhdGVzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZ3JvdXAgaXMgbW92ZWRcclxuICAgICAgICAvLyBzbyB3ZSBuZWVkIHRvIGRldGVjdCBpbnRlcnZhbFxyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLmZsb29yKHggLyBkYXlzV2lkdGgpO1xyXG4gICAgICAgIHZhciBuZXdTdGFydCA9IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5tb3ZlVG9TdGFydChuZXdTdGFydCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXN0ZWRUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhwYXJhbXMpIHtcclxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHBhcmFtcy5jb2xsZWN0aW9uO1xyXG59XHJcblxyXG5Db250ZXh0TWVudVZpZXcucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgJCgnLnRhc2stY29udGFpbmVyJykuY29udGV4dE1lbnUoe1xyXG4gICAgICAgIHNlbGVjdG9yOiAndWwnLFxyXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKCdpZCcpIHx8ICQodGhpcykuZGF0YSgnaWQnKTtcclxuICAgICAgICAgICAgdmFyIG1vZGVsID0gc2VsZi5jb2xsZWN0aW9uLmdldChpZCk7XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2RlbGV0ZScpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Byb3BlcnRpZXMnKXtcclxuLy8gICAgICAgICAgICAgICAgdmFyICRwcm9wZXJ0eSA9ICcucHJvcGVydHktJztcclxuLy8gICAgICAgICAgICAgICAgdmFyIHN0YXR1cyA9IHtcclxuLy8gICAgICAgICAgICAgICAgICAgICcxMDgnOiAnUmVhZHknLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgJzEwOSc6ICdPcGVuJyxcclxuLy8gICAgICAgICAgICAgICAgICAgICcxMTAnOiAnQ29tcGxldGUnXHJcbi8vICAgICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgICAgIHZhciAkZWwgPSAkKGRvY3VtZW50KTtcclxuLy8gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KyduYW1lJykuaHRtbChtb2RlbC5nZXQoJ25hbWUnKSk7XHJcbi8vICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZGVzY3JpcHRpb24nKS5odG1sKG1vZGVsLmdldCgnZGVzY3JpcHRpb24nKSk7XHJcbi8vICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnc3RhcnQnKS5odG1sKGNvbnZlcnREYXRlKG1vZGVsLmdldCgnc3RhcnQnKSkpO1xyXG4vLyAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2VuZCcpLmh0bWwoY29udmVydERhdGUobW9kZWwuZ2V0KCdlbmQnKSkpO1xyXG4vLyAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXR1cycpLmh0bWwoc3RhdHVzW21vZGVsLmdldCgnc3RhdHVzJyldKTtcclxuLy8gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ZGF0ZSA9IG5ldyBEYXRlKG1vZGVsLmdldCgnc3RhcnQnKSk7XHJcbi8vICAgICAgICAgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUobW9kZWwuZ2V0KCdlbmQnKSk7XHJcbi8vICAgICAgICAgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHJcbi8vICAgICAgICAgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPSBcIlwiICYmIGVuZGRhdGUgIT0gXCJcIil7XHJcbi8vICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2R1cmF0aW9uJykuaHRtbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyXG4vLyAgICAgICAgICAgICAgICB9ZWxzZXtcclxuLy8gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoMCkpO1xyXG4vLyAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICQoJy51aS5wcm9wZXJ0aWVzJykubW9kYWwoJ3NldHRpbmcnLCAndHJhbnNpdGlvbicsICd2ZXJ0aWNhbCBmbGlwJylcclxuLy8gICAgICAgICAgICAgICAgICAgIC5tb2RhbCgnc2hvdycpXHJcbi8vICAgICAgICAgICAgICAgIDtcclxuLy9cclxuLy8gICAgICAgICAgICAgICAgZnVuY3Rpb24gY29udmVydERhdGUoaW5wdXRGb3JtYXQpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHBhZChzKSB7IHJldHVybiAocyA8IDEwKSA/ICcwJyArIHMgOiBzOyB9XHJcbi8vICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKGlucHV0Rm9ybWF0KTtcclxuLy8gICAgICAgICAgICAgICAgICAgIHJldHVybiBbcGFkKGQuZ2V0RGF0ZSgpKSwgcGFkKGQuZ2V0TW9udGgoKSsxKSwgZC5nZXRGdWxsWWVhcigpXS5qb2luKCcvJyk7XHJcbi8vICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soZGF0YSwgJ2Fib3ZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QmVsb3cnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH0sICdiZWxvdycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdpbmRlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldlRhc2sgPSBtb2RlbC5jb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnc29ydGluZGV4JykgPT09IG1vZGVsLmdldCgnc29ydGluZGV4JykgLSAxO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldlRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zYXZlKCdwYXJlbnRpZCcsIHByZXZUYXNrLmlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgaWYgKG1vZGVsLnBhcmVudCAmJiBtb2RlbC5wYXJlbnQucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgncGFyZW50aWQnLCBtb2RlbC5wYXJlbnQucGFyZW50LmlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgncGFyZW50aWQnLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7bmFtZTogXCJOZXcgUm93IEFib3ZlXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHtuYW1lOiBcIk5ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHtuYW1lOiBcIkluZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7bmFtZTogXCJPdXRkZW50IFJvd1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7bmFtZTogXCJQcm9wZXJ0aWVzXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjoge25hbWU6IFwiRGVsZXRlIFJvd1wiLCBpY29uOiBcIlwifVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGFzay5zYXZlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHRNZW51VmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xyXG5cclxudmFyIE5lc3RlZFRhc2sgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZSA6ICdOZXN0ZWRUYXNrJyxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdWJ0YXNrcyA9IHRoaXMucHJvcHMubW9kZWwuY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAgaXNTdWJUYXNrIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWJUYXNrIDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrLWxpc3QtY29udGFpbmVyIGRyYWctaXRlbScgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICBpZCA6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbCA6IHRoaXMucHJvcHMubW9kZWxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnc3ViLXRhc2stbGlzdCBzb3J0YWJsZSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN1YnRhc2tzXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXN0ZWRUYXNrO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcclxudmFyIE5lc3RlZFRhc2sgPSByZXF1aXJlKCcuL05lc3RlZFRhc2snKTtcclxuXHJcbmZ1bmN0aW9uIGdldERhdGEoY29udGFpbmVyKSB7XHJcbiAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgdmFyIGNoaWxkcmVuID0gJCgnPG9sPicgKyBjb250YWluZXIuZ2V0KDApLmlubmVySFRNTCArICc8L29sPicpLmNoaWxkcmVuKCk7XHJcbiAgICBfLmVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgdmFyICRjaGlsZCA9ICQoY2hpbGQpO1xyXG4gICAgICAgIHZhciBvYmogPSB7XHJcbiAgICAgICAgICAgIGlkIDogJGNoaWxkLmRhdGEoJ2lkJyksXHJcbiAgICAgICAgICAgIGNoaWxkcmVuIDogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBzdWJsaXN0ID0gJGNoaWxkLmZpbmQoJ29sJyk7XHJcbiAgICAgICAgaWYgKHN1Ymxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIG9iai5jaGlsZHJlbiA9IGdldERhdGEoc3VibGlzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEucHVzaChvYmopO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZGF0YTtcclxufVxyXG5cclxudmFyIFNpZGVQYW5lbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lOiAnU2lkZVBhbmVsJyxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignYWRkIHJlbW92ZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbWFrZVNvcnRhYmxlKCk7XHJcbiAgICB9LFxyXG4gICAgX21ha2VTb3J0YWJsZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb250YWluZXIgPSAkKCcudGFzay1jb250YWluZXInKTtcclxuICAgICAgICBjb250YWluZXIuc29ydGFibGUoe1xyXG4gICAgICAgICAgICBncm91cDogJ3NvcnRhYmxlJyxcclxuICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3IgOiAnb2wnLFxyXG4gICAgICAgICAgICBpdGVtU2VsZWN0b3IgOiAnLmRyYWctaXRlbScsXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyIHNvcnQtcGxhY2Vob2xkZXJcIi8+JyxcclxuICAgICAgICAgICAgb25EcmFnU3RhcnQgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25EcmFnIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBsYWNlaG9sZGVyID0gJCgnLnNvcnQtcGxhY2Vob2xkZXInKTtcclxuICAgICAgICAgICAgICAgIHZhciBpc1N1YlRhc2sgPSAhJCgkcGxhY2Vob2xkZXIucGFyZW50KCkpLmhhc0NsYXNzKCd0YXNrLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAgICAgJHBsYWNlaG9sZGVyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctbGVmdCcgOiBpc1N1YlRhc2sgPyAnMzBweCcgOiAnMCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25Ecm9wIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBnZXREYXRhKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLnJlc29ydChkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTApO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIgPSAkKCc8ZGl2PicpO1xyXG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgYmFja2dyb3VuZCA6ICdncmV5JyxcclxuICAgICAgICAgICAgb3BhY2l0eSA6ICcwLjUnLFxyXG4gICAgICAgICAgICBsaWZ0IDogJzAnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlb3ZlcihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgdmFyIHBvcyA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB0b3AgOiBwb3MudG9wLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogJGVsLmhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgd2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuLy8gICAgICAgICQoJy50YXNrLWNvbnRhaW5lcicpLnNvcnRhYmxlKFwiZGlzYWJsZVwiKTtcclxuICAgICAgICAkKCcudGFzay1jb250YWluZXInKS5zb3J0YWJsZShcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2sucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stY29udGFpbmVyIHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRhc2tzXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2lkZVBhbmVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBUYXNrSXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ1Rhc2tJdGVtJyxcclxuICAgIGdldEluaXRpYWxTdGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVkaXRSb3cgOiB1bmRlZmluZWRcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgX2ZpbmROZXN0ZWRMZXZlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZXZlbCA9IDA7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucHJvcHMubW9kZWwucGFyZW50O1xyXG4gICAgICAgIHdoaWxlKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZXZlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXZlbCsrO1xyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRmllbGQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0Um93ID09PSBjb2wpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVkaXRGaWVsZChjb2wpO1xyXG4gICAgICAgIH1cclxuLy8gICAgICAgIGlmIChjb2wgPT09ICduYW1lJyAmJiB0aGlzLnByb3BzLm1vZGVsLmdldCgnbmFtZScpID09PSAnTmV3IHRhc2snKSB7XHJcbi8vICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVkaXRGaWVsZChjb2wpO1xyXG4vLyAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVSZWFkRmlsZWQoY29sKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlUmVhZEZpbGVkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKSArICclJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVFZGl0RmllbGQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKTtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSA/IHZhbC50b1N0cmluZygneXl5eS1NTS1kZCcpIDogdmFsLFxyXG4gICAgICAgICAgICB0eXBlIDogKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSA/ICdkYXRlJyA6ICd0ZXh0JyxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdWYWwgPSBuZXcgRGF0ZShuZXdWYWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoY29sLCBuZXdWYWwpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uS2V5RG93biA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCd1bCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzaycgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gZS50YXJnZXQuY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sID0gY2xhc3NOYW1lLnNsaWNlKDQsIGNsYXNzTmFtZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gY29sO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnbmFtZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1uYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgOiAodGhpcy5fZmluZE5lc3RlZExldmVsKCkgKiAxMCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ25hbWUnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnY29tcGxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtY29tcGxldGUnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnY29tcGxldGUnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnc3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtc3RhcnQnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnc3RhcnQnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWVuZCdcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdlbmQnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnc3RhdHVzJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXN0YXR1cydcclxuICAgICAgICAgICAgICAgIH0sIG1vZGVsLmdldCgnc3RhdHVzJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfSwgRGF0ZS5kYXlzZGlmZihtb2RlbC5nZXQoJ3N0YXJ0JyksbW9kZWwuZ2V0KCdlbmQnKSkrJyBkJyksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5IDogJ3JlbW92ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdyZW1vdmUtaXRlbSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdtaW5pIHJlZCB1aSBidXR0b24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljayA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnc21hbGwgdHJhc2ggaWNvbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tJdGVtO1xyXG4iXX0=
