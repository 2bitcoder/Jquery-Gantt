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
"use strict";var util = require('../utils/util');var params = util.getURLParams();var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,  // in percents        action: '',        active : true,        sortindex: 0,        dependency: null,  // id of task        resources: {},        status: 110,        health: 21,        start: '',        end: '',        ProjectRef : params.project,        WBS_ID : params.profile,        color: '#0090d3',   // user color//        lightcolor: '#E6F0FF', ////        darkcolor: '#e88134',        aType: '',        reportable: '',        parentid: 0,        // app params        hidden : false,        collapsed : false    },    initialize : function() {        this.children = new Backbone.Collection();        this.listenTo(this.children, 'change:parentid', function(child) {            this.children.remove(child);        });        this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);        this.listenTo(this, 'change:collapsed', function() {            this.children.each(function(child) {                if (this.get('collapsed')) {                    child.hide();                } else {                    child.show();                }            }.bind(this));        });        this.listenTo(this, 'destroy', function() {            this.children.each(function(child) {                child.destroy();            });        });        this.listenTo(this.children, 'add remove change:complete', this._checkComplete);    },    show : function() {        this.set('hidden', false);    },    hide : function() {        this.set('hidden', true);    },    parse: function(response) {        var start, end;        if(_.isString(response.start)){            start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            start = new Date();        }                if(_.isString(response.end)){            end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            end = new Date();        }        response.start = start < end ? start : end;        response.end = start < end ? end : start;        response.parentid = parseInt(response.parentid || '0', 10);        // remove null params        _.each(response, function(val, key) {            if (val === null) {                delete response[key];            }        });        return response;    },    _checkTime : function() {        if (this.children.length === 0) {            return;        }        var startTime = this.children.at(0).get('start');        var endTime = this.children.at(0).get('end');        this.children.each(function(child) {            var childStartTime = child.get('start');            var childEndTime = child.get('end');            if(childStartTime.compareTo(startTime) === -1) {                startTime = childStartTime;            }            if(childEndTime.compareTo(endTime) === 1){                endTime = childEndTime;            }        }.bind(this));        this.set('start', startTime);        this.set('end', endTime);    },    _checkComplete : function() {        var complete = 0;        var length = this.children.length        if (length) {            this.children.each(function(child) {                complete += child.get('complete') / length;            });        }        this.set('complete', complete);    },    moveToStart : function(newStart) {        // do nothing if new start is the same as current        if (newStart.toDateString() === this.get('start').toDateString()) {            return;        }        // calculate offset        var daysDiff = Date.daysdiff(newStart, this.get('start')) - 1;        if (newStart < this.get('start')) {            daysDiff *= -1;        }        // change dates        this.set({            start : newStart.clone(),            end : this.get('end').clone().addDays(daysDiff)        });        // changes dates in all children        this._moveChildren(daysDiff);    },    _moveChildren : function(days) {        this.children.each(function(child) {            child.move(days);        });    },    move : function(days) {        this.save({            start: this.get('start').clone().addDays(days),            end: this.get('end').clone().addDays(days)        });    }});module.exports = TaskModel;
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

//        BasicTaskView.prototype._updateDates.call(this);
//        var timeDiff =
//        this.model.set({
//            start: boundaryMin.clone().addDays(days1),
//            end: boundaryMin.clone().addDays(days2 - 1)
//        });
//
//        var attrs = this.settings.getSetting('attr'),
//            boundaryMin=attrs.boundaryMin,
//            daysWidth=attrs.daysWidth;
//
//        var rect = this.el.find('.mainRect')[0];
//        var length = rect.width();
//        var x = this.el.x() + rect.x();
//        var days1 = Math.floor(x / daysWidth), days2 = Math.floor((x + length) / daysWidth);
//
//        this.model.set({
//            start: boundaryMin.clone().addDays(days1),
//            end: boundaryMin.clone().addDays(days2 - 1)
//        });
    },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9mYWtlXzkzMzcxYmEyLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9BZGRGb3JtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrSXRlbVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvVGFza1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmwgOiAnYXBpL3Rhc2tzJyxcblx0bW9kZWw6IFRhc2tNb2RlbCxcblx0aW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3Vic2NyaWJlKCk7XG5cdH0sXG5cdGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xuXHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHR9LFxuXHRsaW5rQ2hpbGRyZW4gOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGFyZW50VGFzayA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChwYXJlbnRUYXNrKSB7XG5cdFx0XHRcdGlmIChwYXJlbnRUYXNrID09PSB0YXNrKSB7XG5cdFx0XHRcdFx0dGFzay5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdF9zb3J0Q2hpbGRyZW4gOiBmdW5jdGlvbiAodGFzaywgc29ydEluZGV4KSB7XG5cdFx0dGFzay5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0Y2hpbGQuc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4oY2hpbGQsIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRjaGVja1NvcnRlZEluZGV4IDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IDA7XG5cdFx0dGhpcy50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGFzay5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbih0YXNrLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5zb3J0KCk7XG5cdH0sXG5cdHJlc29ydCA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gMDtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmVudERhdGEpIHtcblx0XHRcdHZhciBwYXJlbnRNb2RlbCA9IHRoaXMuZ2V0KHBhcmVudERhdGEuaWQpO1xuXHRcdFx0dmFyIHByZXZTb3J0ID0gcGFyZW50TW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHRcdGlmIChwcmV2U29ydCAhPT0gKytzb3J0SW5kZXgpIHtcblx0XHRcdFx0cGFyZW50TW9kZWwuc2V0KCdzb3J0aW5kZXgnLCBzb3J0SW5kZXgpLnNhdmUoKTtcblx0XHRcdH1cblx0XHRcdGlmIChwYXJlbnRNb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cGFyZW50TW9kZWwuc2V0KCdwYXJlbnRpZCcsIDApLnNhdmUoKTtcblx0XHRcdH1cblx0XHRcdHBhcmVudERhdGEuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZERhdGEpIHtcblx0XHRcdFx0dmFyIGNoaWxkTW9kZWwgPSBzZWxmLmdldChjaGlsZERhdGEuaWQpO1xuXHRcdFx0XHR2YXIgcHJldlNvcnRJID0gY2hpbGRNb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdFx0XHRpZiAocHJldlNvcnRJICE9PSArK3NvcnRJbmRleCkge1xuXHRcdFx0XHRcdGNoaWxkTW9kZWwuc2V0KCdzb3J0aW5kZXgnLCBzb3J0SW5kZXgpLnNhdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoY2hpbGRNb2RlbC5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudE1vZGVsLmlkKSB7XG5cdFx0XHRcdFx0Y2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJywgcGFyZW50TW9kZWwuaWQpLnNhdmUoKTtcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gc2VsZi5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRcdHJldHVybiBtLmlkID09PSBwYXJlbnRNb2RlbC5pZDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKGNoaWxkTW9kZWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuc29ydCgpO1xuXHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHR9LFxuXHRzdWJzY3JpYmUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybignY2FuIG5vdCBmaW5kIHBhcmVudCB3aXRoIGlkICcgKyBtb2RlbC5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0XHRcdG1vZGVsLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrQ29sbGVjdGlvbjtcblxuIiwiXG52YXIgVGFza0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uJyk7XG52YXIgU2V0dGluZ3MgPSByZXF1aXJlKCcuL21vZGVscy9TZXR0aW5nTW9kZWwnKTtcblxudmFyIEdhbnR0VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvR2FudHRWaWV3Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbCcpO1xuXG4kKGZ1bmN0aW9uICgpIHtcblx0dmFyIGFwcCA9IHt9O1xuXHRhcHAudGFza3MgPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcblxuXHQvLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xN1xuXHR2YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblx0aWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlKSB7XG5cdFx0YXBwLnRhc2tzLnVybCA9ICdhcGkvdGFza3MvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGU7XG5cdH1cblxuXHRhcHAudGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3MgOiBmdW5jdGlvbigpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdTdWNjZXNzIGxvYWRpbmcgdGFza3MuJyk7XG5cdFx0XHRhcHAuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3Moe30sIHthcHAgOiBhcHB9KTtcblx0XHRcdGFwcC50YXNrcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdGFwcC50YXNrcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHRuZXcgR2FudHRWaWV3KHtcblx0XHRcdFx0YXBwIDogYXBwLFxuXHRcdFx0XHRjb2xsZWN0aW9uIDogYXBwLnRhc2tzXG5cdFx0XHR9KS5yZW5kZXIoKTtcblx0XHRcdCQoJyNsb2FkZXInKS5mYWRlT3V0KCk7XG5cdFx0fSxcblx0XHRlcnJvciA6IGZ1bmN0aW9uKGVycikge1xuXHRcdFx0Y29uc29sZS5lcnJvcignZXJyb3IgbG9hZGluZycpO1xuXHRcdFx0Y29uc29sZS5lcnJvcihlcnIpO1xuXHRcdH1cblx0fSwge3BhcnNlOiB0cnVlfSk7XG59KTtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xuXG52YXIgYXBwID0ge307XG5cbnZhciBoZnVuYyA9IGZ1bmN0aW9uKHBvcywgZXZ0KSB7XG5cdHZhciBkcmFnSW50ZXJ2YWwgPSBhcHAuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicsICdkcmFnSW50ZXJ2YWwnKTtcblx0dmFyIG4gPSBNYXRoLnJvdW5kKChwb3MueCAtIGV2dC5pbmlwb3MueCkgLyBkcmFnSW50ZXJ2YWwpO1xuXHRyZXR1cm4ge1xuXHRcdHg6IGV2dC5pbmlwb3MueCArIG4gKiBkcmFnSW50ZXJ2YWwsXG5cdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHR9O1xufTtcblxudmFyIFNldHRpbmdNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aW50ZXJ2YWw6ICdmaXgnLFxuXHRcdC8vZGF5cyBwZXIgaW50ZXJ2YWxcblx0XHRkcGk6IDFcblx0fSxcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cnMsIHBhcmFtcykge1xuXHRcdHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcblx0XHRhcHAgPSB0aGlzLmFwcDtcblx0XHR0aGlzLnNhdHRyID0ge1xuXHRcdFx0aERhdGE6IHt9LFxuXHRcdFx0ZHJhZ0ludGVydmFsOiAxLFxuXHRcdFx0ZGF5c1dpZHRoOiA1LFxuXHRcdFx0Y2VsbFdpZHRoOiAzNSxcblx0XHRcdG1pbkRhdGU6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdG1heERhdGU6IG5ldyBEYXRlKDAsMCwwKSxcblx0XHRcdGJvdW5kYXJ5TWluOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1heDogbmV3IERhdGUoMjAyMCwxLDEpLFxuXHRcdFx0Ly9tb250aHMgcGVyIGNlbGxcblx0XHRcdG1wYzogMVxuXHRcdH07XG5cblx0XHR0aGlzLnNkaXNwbGF5ID0ge1xuXHRcdFx0c2NyZWVuV2lkdGg6ICAkKCcjZ2FudHQtY29udGFpbmVyJykuaW5uZXJXaWR0aCgpICsgNzg2LFxuXHRcdFx0dEhpZGRlbldpZHRoOiAzMDUsXG5cdFx0XHR0YWJsZVdpZHRoOiA3MTBcblx0XHR9O1xuXG5cdFx0dGhpcy5zZ3JvdXAgPSB7XG5cdFx0XHRjdXJyZW50WTogMCxcblx0XHRcdGluaVk6IDYwLFxuXHRcdFx0YWN0aXZlOiBmYWxzZSxcblx0XHRcdHRvcEJhcjoge1xuXHRcdFx0XHRmaWxsOiAnIzY2NicsXG5cdFx0XHRcdGhlaWdodDogMTIsXG5cdFx0XHRcdHN0cm9rZUVuYWJsZWQ6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0Z2FwOiAzLFxuXHRcdFx0cm93SGVpZ2h0OiAyMixcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6IGhmdW5jXG5cdFx0fTtcblxuXHRcdHRoaXMuc2JhciA9IHtcblx0XHRcdGJhcmhlaWdodDogMTIsXG5cdFx0XHRnYXA6IDIwLFxuXHRcdFx0cm93aGVpZ2h0OiAgNjAsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRyZXNpemFibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiBoZnVuYyxcblx0XHRcdHJlc2l6ZUJvdW5kRnVuYzogaGZ1bmMsXG5cdFx0XHRzdWJncm91cDogdHJ1ZVxuXHRcdH07XG5cdFx0dGhpcy5zZm9ybT17XG5cdFx0XHQnbmFtZSc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICd0ZXh0J1xuXHRcdFx0fSxcblx0XHRcdCdzdGFydCc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdkYXRlJyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRyZXR1cm4gZC50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0MmQ6IGZ1bmN0aW9uKHQpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLnBhcnNlRXhhY3QoIHV0aWwuY29ycmVjdGRhdGUodCksICdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnZW5kJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ2RhdGUnLFxuXHRcdFx0XHRkMnQ6IGZ1bmN0aW9uKGQpe1xuXHRcdFx0XHRcdHJldHVybiBkLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHQyZDogZnVuY3Rpb24odCl7XG5cdFx0XHRcdFx0cmV0dXJuIERhdGUucGFyc2VFeGFjdCggdXRpbC5jb3JyZWN0ZGF0ZSh0KSwgJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdzdGF0dXMnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnc2VsZWN0Jyxcblx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdCcxMTAnOiAnY29tcGxldGUnLFxuXHRcdFx0XHRcdCcxMDknOiAnb3BlbicsXG5cdFx0XHRcdFx0JzEwOCcgOiAncmVhZHknXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnY29tcGxldGUnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAndGV4dCdcblx0XHRcdH0sXG5cdFx0XHQnZHVyYXRpb24nOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAndGV4dCcsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24odCxtb2RlbCl7XG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuZ2V0KCdzdGFydCcpLG1vZGVsLmdldCgnZW5kJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XG5cdFx0fTtcblx0XHR0aGlzLmdldEZvcm1FbGVtID0gdGhpcy5jcmVhdGVFbGVtKCk7XG5cdFx0dGhpcy5jb2xsZWN0aW9uID0gdGhpcy5hcHAudGFza3M7XG5cdFx0dGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMoKTtcblx0XHR0aGlzLm9uKCdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKTtcblx0fSxcblx0Z2V0U2V0dGluZzogZnVuY3Rpb24oZnJvbSwgYXR0cil7XG5cdFx0aWYoYXR0cil7XG5cdFx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXVthdHRyXTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV07XG5cdH0sXG5cdGNhbGNtaW5tYXg6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtaW5EYXRlID0gbmV3IERhdGUoMjAyMCwxLDEpLCBtYXhEYXRlID0gbmV3IERhdGUoMCwwLDApO1xuXHRcdFxuXHRcdHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdzdGFydCcpLmNvbXBhcmVUbyhtaW5EYXRlKSA9PT0gLTEpIHtcblx0XHRcdFx0bWluRGF0ZT1tb2RlbC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdlbmQnKS5jb21wYXJlVG8obWF4RGF0ZSkgPT09IDEpIHtcblx0XHRcdFx0bWF4RGF0ZT1tb2RlbC5nZXQoJ2VuZCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuc2F0dHIubWluRGF0ZSA9IG1pbkRhdGU7XG5cdFx0dGhpcy5zYXR0ci5tYXhEYXRlID0gbWF4RGF0ZTtcblx0XHRcblx0fSxcblx0c2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVuZCxzYXR0cj10aGlzLnNhdHRyLGRhdHRyPXRoaXMuc2Rpc3BsYXksZHVyYXRpb24sc2l6ZSxjZWxsV2lkdGgsZHBpLHJldGZ1bmMsc3RhcnQsbGFzdCxpPTAsaj0wLGlMZW49MCxuZXh0PW51bGw7XG5cdFx0XG5cdFx0dmFyIGludGVydmFsID0gdGhpcy5nZXQoJ2ludGVydmFsJyk7XG5cblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdkYWlseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAxLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTI7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cygxKTtcblx0XHRcdH07XG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xuXHRcdFx0XG5cdFx0fSBlbHNlIGlmKGludGVydmFsID09PSAnd2Vla2x5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDcsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogNyk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiA3KS5tb3ZlVG9EYXlPZldlZWsoMSwgLTEpO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gNTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCAqIDc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoNyk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDI7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSA3ICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4ubW92ZVRvRmlyc3REYXlPZlF1YXJ0ZXIoKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDE7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSAzMCAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDM7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDMpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnZml4Jykge1xuXHRcdFx0Y2VsbFdpZHRoID0gMzA7XG5cdFx0XHRkdXJhdGlvbiA9IERhdGUuZGF5c2RpZmYoc2F0dHIubWluRGF0ZSwgc2F0dHIubWF4RGF0ZSk7XG5cdFx0XHRzaXplID0gZGF0dHIuc2NyZWVuV2lkdGggLSBkYXR0ci50SGlkZGVuV2lkdGggLSAxMDA7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzaXplIC8gZHVyYXRpb247XG5cdFx0XHRkcGkgPSBNYXRoLnJvdW5kKGNlbGxXaWR0aCAvIHNhdHRyLmRheXNXaWR0aCk7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgZHBpLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBkcGkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yICogZHBpKTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIgKiBkcGkpO1xuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbD09PSdhdXRvJykge1xuXHRcdFx0ZHBpID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gKDEgKyBNYXRoLmxvZyhkcGkpKSAqIDEyO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2F0dHIuY2VsbFdpZHRoIC8gZHBpO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMjAgKiBkcGkpO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiBkcGkpO1xuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdH1cblx0XHR2YXIgaERhdGEgPSB7XG5cdFx0XHQnMSc6IFtdLFxuXHRcdFx0JzInOiBbXSxcblx0XHRcdCczJzogW11cblx0XHR9O1xuXHRcdHZhciBoZGF0YTMgPSBbXTtcblx0XHRcblx0XHRzdGFydCA9IHNhdHRyLmJvdW5kYXJ5TWluO1xuXHRcdFxuXHRcdGxhc3QgPSBzdGFydDtcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5JyB8fCBpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcblx0XHRcdHZhciBkdXJmdW5jO1xuXHRcdFx0aWYgKGludGVydmFsPT09J21vbnRobHknKSB7XG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luTW9udGgoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0TW9udGgoKSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJblF1YXJ0ZXIoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldFF1YXJ0ZXIoKSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRoZGF0YTMucHVzaCh7XG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogZHVyZnVuYyhsYXN0KSxcblx0XHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XG5cdFx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpbnRlcnZhbGRheXMgPSB0aGlzLmdldCgnZHBpJyk7XG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcblx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdGR1cmF0aW9uOiBpbnRlcnZhbGRheXMsXG5cdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRsYXN0ID0gbmV4dDtcblx0XHRcdH1cblx0XHR9XG5cdFx0c2F0dHIuYm91bmRhcnlNYXggPSBlbmQgPSBsYXN0O1xuXHRcdGhEYXRhWyczJ10gPSBoZGF0YTM7XG5cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IGRhdGUgdG8gZW5kIG9mIHllYXJcblx0XHR2YXIgaW50ZXIgPSBEYXRlLmRheXNkaWZmKHN0YXJ0LCBuZXcgRGF0ZShzdGFydC5nZXRGdWxsWWVhcigpLCAxMSwgMzEpKTtcblx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0ZHVyYXRpb246IGludGVyLFxuXHRcdFx0dGV4dDogc3RhcnQuZ2V0RnVsbFllYXIoKVxuXHRcdH0pO1xuXHRcdGZvcihpID0gc3RhcnQuZ2V0RnVsbFllYXIoKSArIDEsIGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTsgaSA8IGlMZW47IGkrKyl7XG5cdFx0XHRpbnRlciA9IERhdGUuaXNMZWFwWWVhcihpKSA/IDM2NiA6IDM2NTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdFx0dGV4dDogaVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgbGFzdCB5ZWFyIHVwdG8gZW5kIGRhdGVcblx0XHRpZiAoc3RhcnQuZ2V0RnVsbFllYXIoKSE9PWVuZC5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHRpbnRlciA9IERhdGUuZGF5c2RpZmYobmV3IERhdGUoZW5kLmdldEZ1bGxZZWFyKCksIDAsIDEpLCBlbmQpO1xuXHRcdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxuXHRcdFx0XHR0ZXh0OiBlbmQuZ2V0RnVsbFllYXIoKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgbW9udGhcblx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoc3RhcnQsIHN0YXJ0LmNsb25lKCkubW92ZVRvTGFzdERheU9mTW9udGgoKSksXG5cdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoc3RhcnQuZ2V0TW9udGgoKSwgJ20nKVxuXHRcdH0pO1xuXHRcdFxuXHRcdGogPSBzdGFydC5nZXRNb250aCgpICsgMTtcblx0XHRpID0gc3RhcnQuZ2V0RnVsbFllYXIoKTtcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XG5cdFx0dmFyIGVuZG1vbnRoID0gZW5kLmdldE1vbnRoKCk7XG5cblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XG5cdFx0XHR3aGlsZShqIDwgMTIpIHtcblx0XHRcdFx0aWYgKGkgPT09IGlMZW4gJiYgaiA9PT0gZW5kbW9udGgpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxuXHRcdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShqLCAnbScpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRqICs9IDE7XG5cdFx0XHR9XG5cdFx0XHRpICs9IDE7XG5cdFx0XHRqID0gMDtcblx0XHR9XG5cdFx0aWYgKGVuZC5nZXRNb250aCgpICE9PSBzdGFydC5nZXRNb250aCAmJiBlbmQuZ2V0RnVsbFllYXIoKSAhPT0gc3RhcnQuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoZW5kLmNsb25lKCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCksIGVuZCksXG5cdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShlbmQuZ2V0TW9udGgoKSwgJ20nKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHNhdHRyLmhEYXRhID0gaERhdGE7XG5cdH0sXG5cdGNhbGN1bGF0ZUludGVydmFsczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jYWxjbWlubWF4KCk7XG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGVzKCk7XG5cdH0sXG5cdGNyZWF0ZUVsZW06IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbGVtcyA9IHt9LCBvYmosIGNhbGxiYWNrID0gZmFsc2UsIGNvbnRleHQgPSBmYWxzZTtcblx0XHRmdW5jdGlvbiBiaW5kVGV4dEV2ZW50cyhlbGVtZW50LCBvYmosIG5hbWUpIHtcblx0XHRcdGVsZW1lbnQub24oJ2JsdXInLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cdFx0XHRcdHZhciB2YWx1ZSA9ICR0aGlzLnZhbCgpO1xuXHRcdFx0XHQkdGhpcy5kZXRhY2goKTtcblx0XHRcdFx0dmFyIGNhbGxmdW5jID0gY2FsbGJhY2ssIGN0eCA9IGNvbnRleHQ7XG5cdFx0XHRcdGNhbGxiYWNrID0gZmFsc2U7XG5cdFx0XHRcdGNvbnRleHQgPSBmYWxzZTtcblx0XHRcdFx0aWYgKG9iai50MmQpIHtcblx0XHRcdFx0XHR2YWx1ZT1vYmoudDJkKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYWxsZnVuYy5jYWxsKGN0eCxuYW1lLHZhbHVlKTtcblx0XHRcdH0pLm9uKCdrZXlwcmVzcycsZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGlmKGV2ZW50LndoaWNoPT09MTMpe1xuXHRcdFx0XHRcdCQodGhpcykudHJpZ2dlcignYmx1cicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0ZnVuY3Rpb24gYmluZERhdGVFdmVudHMoZWxlbWVudCxvYmosbmFtZSl7XG5cdFx0XHRlbGVtZW50LmRhdGVwaWNrZXIoeyBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCIsb25DbG9zZTpmdW5jdGlvbigpe1xuXHRcdFx0XHRjb25zb2xlLmxvZygnY2xvc2UgaXQnKTtcblx0XHRcdFx0dmFyICR0aGlzPSQodGhpcyk7XG5cdFx0XHRcdHZhciB2YWx1ZT0kdGhpcy52YWwoKTtcblx0XHRcdFx0JHRoaXMuZGV0YWNoKCk7XG5cdFx0XHRcdHZhciBjYWxsZnVuYz1jYWxsYmFjayxjdHg9Y29udGV4dDtcblx0XHRcdFx0Y2FsbGJhY2s9ZmFsc2U7XG5cdFx0XHRcdGNvbnRleHQ9ZmFsc2U7XG5cdFx0XHRcdGlmKG9ialsndDJkJ10pIHtcblx0XHRcdFx0XHR2YWx1ZT1vYmpbJ3QyZCddKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFwidXNlIHN0cmljdFwiO1xuXHRcdFx0XHRcdGNhbGxmdW5jLmNhbGwoY3R4LG5hbWUsdmFsdWUpO1xuXHRcdFx0XHR9LCAxMCk7XG5cdFx0XHR9fSk7XG5cdFx0fVxuXHRcdFxuXHRcdGZvcih2YXIgaSBpbiB0aGlzLnNmb3JtKXtcblx0XHRcdG9iaj10aGlzLnNmb3JtW2ldO1xuXHRcdFx0aWYob2JqLmVkaXRhYmxlKXtcblx0XHRcdFx0aWYob2JqLnR5cGU9PT0ndGV4dCcpe1xuXHRcdFx0XHRcdGVsZW1zW2ldPSQoJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiY29udGVudC1lZGl0XCI+Jyk7XG5cdFx0XHRcdFx0YmluZFRleHRFdmVudHMoZWxlbXNbaV0sb2JqLGkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYob2JqLnR5cGU9PT0nZGF0ZScpe1xuXHRcdFx0XHRcdGVsZW1zW2ldPSQoJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiY29udGVudC1lZGl0XCI+Jyk7XG5cdFx0XHRcdFx0YmluZERhdGVFdmVudHMoZWxlbXNbaV0sb2JqLGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XG5cdFx0fVxuXG5cdFx0b2JqID0gbnVsbDtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZmllbGQsIG1vZGVsLCBjYWxsZnVuYywgY3R4KXtcblx0XHRcdGNhbGxiYWNrID0gY2FsbGZ1bmM7XG5cdFx0XHRjb250ZXh0ID0gY3R4O1xuXHRcdFx0dmFyIGVsZW1lbnQ9ZWxlbXNbZmllbGRdLCB2YWx1ZSA9IG1vZGVsLmdldChmaWVsZCk7XG5cdFx0XHRpZiAodGhpcy5zZm9ybVtmaWVsZF0uZDJ0KSB7XG5cdFx0XHRcdHZhbHVlID0gdGhpcy5zZm9ybVtmaWVsZF0uZDJ0KHZhbHVlLCBtb2RlbCk7XG5cdFx0XHR9XG5cdFx0XHRlbGVtZW50LnZhbCh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gZWxlbWVudDtcblx0XHR9O1xuXHRcblx0fSxcblx0Y29uRFRvVDooZnVuY3Rpb24oKXtcblx0XHR2YXIgZFRvVGV4dD17XG5cdFx0XHQnc3RhcnQnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jylcblx0XHRcdH0sXG5cdFx0XHQnZW5kJzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXG5cdFx0XHR9LFxuXHRcdFx0J2R1cmF0aW9uJzpmdW5jdGlvbih2YWx1ZSxtb2RlbCl7XG5cdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLnN0YXJ0LG1vZGVsLmVuZCkrJyBkJztcblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHZhciBzdGF0dXNlcz17XG5cdFx0XHRcdFx0JzExMCc6J2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5Jzonb3BlbicsXG5cdFx0XHRcdFx0JzEwOCcgOiAncmVhZHknXG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBzdGF0dXNlc1t2YWx1ZV07XG5cdFx0XHR9XG5cdFx0XG5cdFx0fTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZmllbGQsdmFsdWUsbW9kZWwpe1xuXHRcdFx0cmV0dXJuIGRUb1RleHRbZmllbGRdP2RUb1RleHRbZmllbGRdKHZhbHVlLG1vZGVsKTp2YWx1ZTtcblx0XHR9O1xuXHR9KCkpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nTW9kZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxydmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJccnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXHJ2YXIgVGFza01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcciAgICBkZWZhdWx0czoge1xyICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyICAgICAgICBkZXNjcmlwdGlvbjogJycsXHIgICAgICAgIGNvbXBsZXRlOiAwLCAgLy8gaW4gcGVyY2VudHNcciAgICAgICAgYWN0aW9uOiAnJyxcciAgICAgICAgYWN0aXZlIDogdHJ1ZSxcciAgICAgICAgc29ydGluZGV4OiAwLFxyICAgICAgICBkZXBlbmRlbmN5OiBudWxsLCAgLy8gaWQgb2YgdGFza1xyICAgICAgICByZXNvdXJjZXM6IHt9LFxyICAgICAgICBzdGF0dXM6IDExMCxcciAgICAgICAgaGVhbHRoOiAyMSxcciAgICAgICAgc3RhcnQ6ICcnLFxyICAgICAgICBlbmQ6ICcnLFxyICAgICAgICBQcm9qZWN0UmVmIDogcGFyYW1zLnByb2plY3QsXHIgICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyICAgICAgICBjb2xvcjogJyMwMDkwZDMnLCAgIC8vIHVzZXIgY29sb3Jcci8vICAgICAgICBsaWdodGNvbG9yOiAnI0U2RjBGRicsIC8vXHIvLyAgICAgICAgZGFya2NvbG9yOiAnI2U4ODEzNCcsXHIgICAgICAgIGFUeXBlOiAnJyxcciAgICAgICAgcmVwb3J0YWJsZTogJycsXHIgICAgICAgIHBhcmVudGlkOiAwLFxyXHIgICAgICAgIC8vIGFwcCBwYXJhbXNcciAgICAgICAgaGlkZGVuIDogZmFsc2UsXHIgICAgICAgIGNvbGxhcHNlZCA6IGZhbHNlXHIgICAgfSxcciAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5yZW1vdmUoY2hpbGQpO1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIHRoaXMuX2NoZWNrVGltZSk7XHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldCgnY29sbGFwc2VkJykpIHtcciAgICAgICAgICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyICAgICAgICAgICAgICAgIH0gZWxzZSB7XHIgICAgICAgICAgICAgICAgICAgIGNoaWxkLnNob3coKTtcciAgICAgICAgICAgICAgICB9XHIgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUgY2hhbmdlOmNvbXBsZXRlJywgdGhpcy5fY2hlY2tDb21wbGV0ZSk7XHIgICAgfSxcciAgICBzaG93IDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XHIgICAgfSxcciAgICBoaWRlIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCB0cnVlKTtcciAgICB9LFxyICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyICAgICAgICB2YXIgc3RhcnQsIGVuZDtcciAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5zdGFydCkpe1xyICAgICAgICAgICAgc3RhcnQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5zdGFydCksJ2RkL01NL3l5eXknKSB8fFxyICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5zdGFydCk7XHIgICAgICAgIH0gZWxzZSB7XHIgICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XHIgICAgICAgIH1cciAgICAgICAgXHIgICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2UuZW5kKSl7XHIgICAgICAgICAgICBlbmQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5lbmQpLCdkZC9NTS95eXl5JykgfHxcciAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLmVuZCk7XHIgICAgICAgIH0gZWxzZSB7XHIgICAgICAgICAgICBlbmQgPSBuZXcgRGF0ZSgpO1xyICAgICAgICB9XHJcciAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSBzdGFydCA8IGVuZCA/IHN0YXJ0IDogZW5kO1xyICAgICAgICByZXNwb25zZS5lbmQgPSBzdGFydCA8IGVuZCA/IGVuZCA6IHN0YXJ0O1xyXHIgICAgICAgIHJlc3BvbnNlLnBhcmVudGlkID0gcGFyc2VJbnQocmVzcG9uc2UucGFyZW50aWQgfHwgJzAnLCAxMCk7XHJcciAgICAgICAgLy8gcmVtb3ZlIG51bGwgcGFyYW1zXHIgICAgICAgIF8uZWFjaChyZXNwb25zZSwgZnVuY3Rpb24odmFsLCBrZXkpIHtcciAgICAgICAgICAgIGlmICh2YWwgPT09IG51bGwpIHtcciAgICAgICAgICAgICAgICBkZWxldGUgcmVzcG9uc2Vba2V5XTtcciAgICAgICAgICAgIH1cciAgICAgICAgfSk7XHIgICAgICAgIHJldHVybiByZXNwb25zZTtcciAgICB9LFxyICAgIF9jaGVja1RpbWUgOiBmdW5jdGlvbigpIHtcciAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XHIgICAgICAgICAgICByZXR1cm47XHIgICAgICAgIH1cciAgICAgICAgdmFyIHN0YXJ0VGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdzdGFydCcpO1xyICAgICAgICB2YXIgZW5kVGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdlbmQnKTtcciAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICB2YXIgY2hpbGRTdGFydFRpbWUgPSBjaGlsZC5nZXQoJ3N0YXJ0Jyk7XHIgICAgICAgICAgICB2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcciAgICAgICAgICAgIGlmKGNoaWxkU3RhcnRUaW1lLmNvbXBhcmVUbyhzdGFydFRpbWUpID09PSAtMSkge1xyICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGNoaWxkU3RhcnRUaW1lO1xyICAgICAgICAgICAgfVxyICAgICAgICAgICAgaWYoY2hpbGRFbmRUaW1lLmNvbXBhcmVUbyhlbmRUaW1lKSA9PT0gMSl7XHIgICAgICAgICAgICAgICAgZW5kVGltZSA9IGNoaWxkRW5kVGltZTtcciAgICAgICAgICAgIH1cciAgICAgICAgfS5iaW5kKHRoaXMpKTtcciAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0Jywgc3RhcnRUaW1lKTtcciAgICAgICAgdGhpcy5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xyICAgIH0sXHIgICAgX2NoZWNrQ29tcGxldGUgOiBmdW5jdGlvbigpIHtcciAgICAgICAgdmFyIGNvbXBsZXRlID0gMDtcciAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoXHIgICAgICAgIGlmIChsZW5ndGgpIHtcciAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgICAgIGNvbXBsZXRlICs9IGNoaWxkLmdldCgnY29tcGxldGUnKSAvIGxlbmd0aDtcciAgICAgICAgICAgIH0pO1xyICAgICAgICB9XHIgICAgICAgIHRoaXMuc2V0KCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcciAgICB9LFxyICAgIG1vdmVUb1N0YXJ0IDogZnVuY3Rpb24obmV3U3RhcnQpIHtcciAgICAgICAgLy8gZG8gbm90aGluZyBpZiBuZXcgc3RhcnQgaXMgdGhlIHNhbWUgYXMgY3VycmVudFxyICAgICAgICBpZiAobmV3U3RhcnQudG9EYXRlU3RyaW5nKCkgPT09IHRoaXMuZ2V0KCdzdGFydCcpLnRvRGF0ZVN0cmluZygpKSB7XHIgICAgICAgICAgICByZXR1cm47XHIgICAgICAgIH1cclxyICAgICAgICAvLyBjYWxjdWxhdGUgb2Zmc2V0XHIgICAgICAgIHZhciBkYXlzRGlmZiA9IERhdGUuZGF5c2RpZmYobmV3U3RhcnQsIHRoaXMuZ2V0KCdzdGFydCcpKSAtIDE7XHIgICAgICAgIGlmIChuZXdTdGFydCA8IHRoaXMuZ2V0KCdzdGFydCcpKSB7XHIgICAgICAgICAgICBkYXlzRGlmZiAqPSAtMTtcciAgICAgICAgfVxyXHIgICAgICAgIC8vIGNoYW5nZSBkYXRlc1xyICAgICAgICB0aGlzLnNldCh7XHIgICAgICAgICAgICBzdGFydCA6IG5ld1N0YXJ0LmNsb25lKCksXHIgICAgICAgICAgICBlbmQgOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXNEaWZmKVxyICAgICAgICB9KTtcclxyICAgICAgICAvLyBjaGFuZ2VzIGRhdGVzIGluIGFsbCBjaGlsZHJlblxyICAgICAgICB0aGlzLl9tb3ZlQ2hpbGRyZW4oZGF5c0RpZmYpO1xyICAgIH0sXHIgICAgX21vdmVDaGlsZHJlbiA6IGZ1bmN0aW9uKGRheXMpIHtcciAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICBjaGlsZC5tb3ZlKGRheXMpO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIG1vdmUgOiBmdW5jdGlvbihkYXlzKSB7XHIgICAgICAgIHRoaXMuc2F2ZSh7XHIgICAgICAgICAgICBzdGFydDogdGhpcy5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKGRheXMpLFxyICAgICAgICAgICAgZW5kOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXMpXHIgICAgICAgIH0pO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IFRhc2tNb2RlbDtcciIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHR2YXIgcHJtYXJyID0gcHJtc3RyLnNwbGl0KCcmJyk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcHJtYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHRtcGFyciA9IHBybWFycltpXS5zcGxpdCgnPScpO1xuXHRcdHBhcmFtc1t0bXBhcnJbMF1dID0gdG1wYXJyWzFdO1xuXHR9XG5cdHJldHVybiBwYXJhbXM7XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldFVSTFBhcmFtcyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcHJtc3RyID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSk7XG5cdHJldHVybiBwcm1zdHIgIT09IG51bGwgJiYgcHJtc3RyICE9PSAnJyA/IHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIDoge307XG59O1xuXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDAyLjEyLjIwMTQuXHJcbiAqL1xyXG5cclxudmFyIHRlbXBsYXRlID0gXCI8ZGl2IGNsYXNzPVxcXCJ1aSBzbWFsbCBtb2RhbCBhZGQtbmV3LXRhc2sgZmxpcFxcXCI+XFxyXFxuICAgIDxpIGNsYXNzPVxcXCJjbG9zZSBpY29uXFxcIj48L2k+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImhlYWRlclxcXCI+XFxyXFxuICAgIDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb250ZW50XFxcIj5cXHJcXG4gICAgICAgIDxmb3JtIGlkPVxcXCJuZXctdGFzay1mb3JtXFxcIiBhY3Rpb249XFxcIi9cXFwiIHR5cGU9XFxcIlBPU1RcXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInVpIGZvcm0gc2VnbWVudFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxwPkxldCdzIGdvIGFoZWFkIGFuZCBzZXQgYSBuZXcgZ29hbC48L3A+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbD5UYXNrIG5hbWU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcIm5hbWVcXFwiIHBsYWNlaG9sZGVyPVxcXCJOZXcgdGFzayBuYW1lXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbD5EaXNjcmlwdGlvbjwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgbmFtZT1cXFwiZGVzY3JpcHRpb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJUaGUgZGV0YWlsZWQgZGVzY3JpcHRpb24gb2YgeW91ciB0YXNrXFxcIj48L3RleHRhcmVhPlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlNlbGVjdCBwYXJlbnQ8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJ1aSBkcm9wZG93biBzZWxlY3Rpb25cXFwiPi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IG5hbWU9XFxcInBhcmVudGlkXFxcIiBjbGFzcz1cXFwidWkgZHJvcGRvd25cXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPC9kaXY+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkIHJlc291cmNlc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkFzc2lnbiBSZXNvdXJjZXM8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U3RhcnQgRGF0ZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiIG5hbWU9XFxcInN0YXJ0XFxcIiBwbGFjZWhvbGRlcj1cXFwiU3RhcnQgRGF0ZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+RW5kIERhdGU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJkYXRlXFxcIiBuYW1lPVxcXCJlbmRcXFwiIHBsYWNlaG9sZGVyPVxcXCJFbmQgRGF0ZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImNvbXBsZXRlXFxcIiB2YWx1ZT1cXFwiMFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImFjdGlvblxcXCIgdmFsdWU9XFxcImFkZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImRlcGVuZGVuY3lcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJhVHlwZVxcXCIgdmFsdWU9XFxcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImhlYWx0aFxcXCIgdmFsdWU9XFxcIjIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiY29sb3JcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJtaWxlc3RvbmVcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiZGVsaXZlcmFibGVcXFwiIHZhbHVlPVxcXCIwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwicmVwb3J0YWJsZVxcXCIgdmFsdWU9XFxcIjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJzb3J0aW5kZXhcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW5zZXJ0UG9zXFxcIiB2YWx1ZT1cXFwic2V0XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwicmVmZXJlbmNlX2lkXFxcIiB2YWx1ZT1cXFwiLTFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U3RhdHVzPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ1aSBmbHVpZCBzZWxlY3Rpb24gZHJvcGRvd25cXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJzdGF0dXNcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJkZWZhdWx0IHRleHRcXFwiPlN0YXR1czwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwiZHJvcGRvd24gaWNvblxcXCI+PC9pPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZW51XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiIGRhdGEtdmFsdWU9XFxcIjEwOFxcXCI+UmVhZHk8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiIGRhdGEtdmFsdWU9XFxcIjEwOVxcXCI+T3BlbjwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTEwXFxcIj5Db21wbGV0ZWQ8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+RHVyYXRpb248L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJudW1iZXJcXFwiIG1pbj1cXFwiMFxcXCIgbmFtZT1cXFwiZHVyYXRpb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJQcm9qZWN0IER1cmF0aW9uXFxcIiByZXF1aXJlZCByZWFkb25seT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cXFwic3VibWl0Rm9ybVxcXCIgY2xhc3M9XFxcInVpIGJsdWUgc3VibWl0IHBhcmVudCBidXR0b25cXFwiPlN1Ym1pdDwvYnV0dG9uPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9mb3JtPlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cIjtcclxuXHJcbnZhciBkZW1vUmVzb3VyY2VzID0gW3tcIndic2lkXCI6MSxcInJlc19pZFwiOjEsXCJyZXNfbmFtZVwiOlwiSm9lIEJsYWNrXCIsXCJyZXNfYWxsb2NhdGlvblwiOjYwfSx7XCJ3YnNpZFwiOjMsXCJyZXNfaWRcIjoyLFwicmVzX25hbWVcIjpcIkpvaG4gQmxhY2ttb3JlXCIsXCJyZXNfYWxsb2NhdGlvblwiOjQwfV07XHJcblxyXG52YXIgQWRkRm9ybVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogZG9jdW1lbnQuYm9keSxcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcclxuICAgIGV2ZW50czoge1xyXG4gICAgICAgICdjbGljayAubmV3LXRhc2snOiAnb3BlbkZvcm0nLFxyXG4gICAgICAgICdjbGljayAjc3VibWl0Rm9ybSc6ICdzdWJtaXRGb3JtJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLiRlbC5hcHBlbmQodGhpcy50ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZUZvcm0oKTtcclxuICAgICAgICB0aGlzLl9pbml0UmVzb3VyY2VzKCk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQnLCB0aGlzLl9zZXR1cFBhcmVudFNlbGVjdG9yKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFJlc291cmNlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIFJlc291cmNlcyBmcm9tIGJhY2tlbmRcclxuICAgICAgICB2YXIgJHJlc291cmNlcyA9ICc8c2VsZWN0IGlkPVwicmVzb3VyY2VzXCIgIG5hbWU9XCJyZXNvdXJjZXNbXVwiIG11bHRpcGxlPVwibXVsdGlwbGVcIj4nO1xyXG4gICAgICAgIGRlbW9SZXNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgJHJlc291cmNlcyArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyByZXNvdXJjZS5yZXNfaWQgKyAnXCI+JyArIHJlc291cmNlLnJlc19uYW1lICsgJzwvb3B0aW9uPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHJlc291cmNlcyArPSAnPC9zZWxlY3Q+JztcclxuICAgICAgICAvLyBhZGQgYmFja2VuZCB0byB0aGUgdGFzayBsaXN0XHJcbiAgICAgICAgJCgnLnJlc291cmNlcycpLmFwcGVuZCgkcmVzb3VyY2VzKTtcclxuXHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBtdWx0aXBsZSBzZWxlY3RvcnNcclxuICAgICAgICAkKCcjcmVzb3VyY2VzJykuY2hvc2VuKHt3aWR0aDogJzk1JSd9KTtcclxuICAgIH0sXHJcbiAgICBfZm9ybVZhbGlkYXRpb25QYXJhbXMgOiB7XHJcbiAgICAgICAgbmFtZToge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnbmFtZScsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2UgZW50ZXIgYSB0YXNrIG5hbWUnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBsZXRlOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdjb21wbGV0ZScsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2UgZW50ZXIgYW4gZXN0aW1hdGUgZGF5cydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ3N0YXJ0JyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYSBzdGFydCBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2VuZCcsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGFuIGVuZCBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkdXJhdGlvbjoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhIHZhbGlkIGR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGF0dXM6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ3N0YXR1cycsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2VsZWN0IGEgc3RhdHVzJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlRm9ybSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy5tYXN0aGVhZCAuaW5mb3JtYXRpb24nKS50cmFuc2l0aW9uKCdzY2FsZSBpbicpO1xyXG4gICAgICAgICQoJy51aS5mb3JtJykuZm9ybSh0aGlzLl9mb3JtVmFsaWRhdGlvblBhcmFtcyk7XHJcbiAgICAgICAgLy8gYXNzaWduIHJhbmRvbSBwYXJlbnQgY29sb3JcclxuICAgICAgICAkKCdpbnB1dFtuYW1lPVwiY29sb3JcIl0nKS52YWwoJyMnK01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxNjc3NzIxNSkudG9TdHJpbmcoMTYpKTtcclxuICAgIH0sXHJcbiAgICBfc2V0dXBQYXJlbnRTZWxlY3RvciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkc2VsZWN0b3IgPSAkKCdbbmFtZT1cInBhcmVudGlkXCJdJyk7XHJcbiAgICAgICAgJHNlbGVjdG9yLmVtcHR5KCk7XHJcbiAgICAgICAgJHNlbGVjdG9yLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIjBcIj5NYWluIFByb2plY3Q8L29wdGlvbj4nKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHBhcnNlSW50KHRhc2suZ2V0KCdwYXJlbnRpZCcpLCAxMCk7XHJcbiAgICAgICAgICAgIGlmKHBhcmVudElkID09PSAwKXtcclxuICAgICAgICAgICAgICAgICRzZWxlY3Rvci5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgdGFzay5pZCArICdcIj4nICsgdGFzay5nZXQoJ25hbWUnKSArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJ3NlbGVjdC5kcm9wZG93bicpLmRyb3Bkb3duKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBkcm9wZG93blxyXG4gICAgICAgIHRoaXMuX3NldHVwUGFyZW50U2VsZWN0b3IoKTtcclxuICAgIH0sXHJcbiAgICBvcGVuRm9ybTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLnVpLmFkZC1uZXctdGFzaycpLm1vZGFsKCdzZXR0aW5nJywgJ3RyYW5zaXRpb24nLCAndmVydGljYWwgZmxpcCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9LFxyXG4gICAgc3VibWl0Rm9ybTogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBmb3JtID0gJChcIiNuZXctdGFzay1mb3JtXCIpO1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICQoZm9ybSkuc2VyaWFsaXplQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgICAgIGRhdGFbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICAgICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICAgICAgdmFyIGluc2VydFBvcyA9IGRhdGEuaW5zZXJ0UG9zO1xyXG4gICAgICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5jb2xsZWN0aW9uLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG5cclxuICAgICAgICBpZiAoZm9ybS5nZXQoMCkuY2hlY2tWYWxpZGl0eSgpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyIHRhc2sgPSB0aGlzLmNvbGxlY3Rpb24uYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgICAgICAgICAgdGFzay5zYXZlKCk7XHJcbiAgICAgICAgICAgICQoJy51aS5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWRkRm9ybVZpZXc7IiwidmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBUYXNrVmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9UYXNrVmlldycpO1xyLy92YXIgS0NhbnZhc1ZpZXcgPSByZXF1aXJlKCcuL2NhbnZhcy9LQ2FudmFzVmlldycpO1xydmFyIEdhbnR0Q2hhcnRWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXNDaGFydC9HYW50dENoYXJ0VmlldycpO1xydmFyIEFkZEZvcm1WaWV3ID0gcmVxdWlyZSgnLi9BZGRGb3JtVmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51VmlldycpO1xyXHJ2YXIgR2FudHRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyICAgIGVsOiAnLkdhbnR0JyxcciAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcciAgICAgICAgdGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xyICAgICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcudGFzay1jb250YWluZXInKTtcclxyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyICAgICAgICB0aGlzLm1ha2VTb3J0YWJsZSgpO1xyXHIgICAgICAgIG5ldyBDb250ZXh0TWVudVZpZXcodGhpcy5hcHApLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBBZGRGb3JtVmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIG5ldyBUb3BNZW51Vmlldyh7XHIgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMuY2FudmFzVmlldyA9IG5ldyBHYW50dENoYXJ0Vmlldyh7XHIgICAgICAgICAgICBhcHAgOiB0aGlzLmFwcCxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcclxyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnRlZCBhZGQnLCBmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5lbXB0eSgpO1xyICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBtYWtlU29ydGFibGU6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLiRjb250YWluZXIuc29ydGFibGUoe1xyICAgICAgICAgICAgZ3JvdXA6ICdzb3J0YWJsZScsXHIgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvciA6ICdvbCcsXHIgICAgICAgICAgICBpdGVtU2VsZWN0b3IgOiAnLmRyYWctaXRlbScsXHIgICAgICAgICAgICBwbGFjZWhvbGRlciA6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlciBzb3J0LXBsYWNlaG9sZGVyXCIvPicsXHIgICAgICAgICAgICBvbkRyYWcgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcciAgICAgICAgICAgICAgICB2YXIgJHBsYWNlaG9sZGVyID0gJCgnLnNvcnQtcGxhY2Vob2xkZXInKTtcciAgICAgICAgICAgICAgICB2YXIgaXNTdWJUYXNrID0gISQoJHBsYWNlaG9sZGVyLnBhcmVudCgpKS5oYXNDbGFzcygndGFzay1jb250YWluZXInKTtcciAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuY3NzKHtcciAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctbGVmdCcgOiBpc1N1YlRhc2sgPyAnMzBweCcgOiAnMCdcciAgICAgICAgICAgICAgICB9KTtcciAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcciAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcciAgICAgICAgICAgIG9uRHJvcCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyICAgICAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy4kY29udGFpbmVyLnNvcnRhYmxlKFwic2VyaWFsaXplXCIpLmdldCgpWzBdO1xyICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbihwYXJlbnREYXRhKSB7XHIgICAgICAgICAgICAgICAgICAgIHBhcmVudERhdGEuY2hpbGRyZW4gPSBwYXJlbnREYXRhLmNoaWxkcmVuID8gcGFyZW50RGF0YS5jaGlsZHJlblswXSA6IFtdO1xyICAgICAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZXNvcnQoZGF0YSk7XHIgICAgICAgICAgICB9LmJpbmQodGhpcylcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBldmVudHM6IHtcciAgICAgICAgJ2NsaWNrICN0SGFuZGxlJzogJ2V4cGFuZCcsXHIgICAgICAgICdkYmxjbGljayAuc3ViLXRhc2snOiAnaGFuZGxlcm93Y2xpY2snLFxyICAgICAgICAnZGJsY2xpY2sgLnRhc2snOiAnaGFuZGxlcm93Y2xpY2snLFxyICAgICAgICAnaG92ZXIgLnN1Yi10YXNrJzogJ3Nob3dNYXNrJ1xyICAgIH0sXHIgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcciAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpLnRvU3RyaW5nKCkgPT09ICcwJykge1xyICAgICAgICAgICAgICAgIHRoaXMuYWRkVGFzayh0YXNrKTtcciAgICAgICAgICAgIH1cciAgICAgICAgfSwgdGhpcyk7XHIgICAgICAgIHRoaXMubWFrZVNvcnRhYmxlKCk7XHIgICAgfSxcciAgICBoYW5kbGVyb3djbGljazogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciBpZCA9IGV2dC5jdXJyZW50VGFyZ2V0LmlkO1xyICAgICAgICB0aGlzLmFwcC50YXNrcy5nZXQoaWQpLnRyaWdnZXIoJ2VkaXRyb3cnLCBldnQpO1xyICAgIH0sXHIgICAgY2FsY3VsYXRlRHVyYXRpb246IGZ1bmN0aW9uKCl7XHJcciAgICAgICAgLy8gQ2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uIGZyb20gc3RhcnQgYW5kIGVuZCBkYXRlXHIgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIF9NU19QRVJfREFZID0gMTAwMCAqIDYwICogNjAgKiAyNDtcciAgICAgICAgaWYoc3RhcnRkYXRlICE9PSBcIlwiICYmIGVuZGRhdGUgIT09IFwiXCIpe1xyICAgICAgICAgICAgdmFyIHV0YzEgPSBEYXRlLlVUQyhzdGFydGRhdGUuZ2V0RnVsbFllYXIoKSwgc3RhcnRkYXRlLmdldE1vbnRoKCksIHN0YXJ0ZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHIgICAgICAgIH1lbHNle1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoMCkpO1xyICAgICAgICB9XHIgICAgfSxcciAgICBleHBhbmQ6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgdGFyZ2V0ID0gJChldnQudGFyZ2V0KTtcciAgICAgICAgdmFyIHdpZHRoID0gMDtcciAgICAgICAgdmFyIHNldHRpbmcgPSB0aGlzLmFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdkaXNwbGF5Jyk7XHIgICAgICAgIGlmICh0YXJnZXQuaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHdpZHRoID0gc2V0dGluZy50SGlkZGVuV2lkdGg7XHIgICAgICAgIH1cciAgICAgICAgZWxzZSB7XHIgICAgICAgICAgICB3aWR0aCA9IHNldHRpbmcudGFibGVXaWR0aDtcciAgICAgICAgfVxyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmNzcygnd2lkdGgnLCB3aWR0aCk7XHJcciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNjAwKTtcciAgICAgICAgdGFyZ2V0LnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmZpbmQoJy5tZW51LWhlYWRlcicpLnRvZ2dsZUNsYXNzKCdtZW51LWhlYWRlci1vcGVuZWQnKTtcciAgICB9LFxyICAgIF9tb3ZlQ2FudmFzVmlldyA6IGZ1bmN0aW9uKCkge1xyICAgICAgICB2YXIgc2lkZUJhcldpZHRoID0gJCgnLm1lbnUtY29udGFpbmVyJykud2lkdGgoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldExlZnRQYWRkaW5nKHNpZGVCYXJXaWR0aCk7XHIgICAgfSxcciAgICBhZGRUYXNrOiBmdW5jdGlvbih0YXNrKSB7XHIgICAgICAgIHZhciB0YXNrVmlldyA9IG5ldyBUYXNrVmlldyh7bW9kZWw6IHRhc2ssIGFwcCA6IHRoaXMuYXBwfSk7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGFza1ZpZXcucmVuZGVyKCkuZWwpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IEdhbnR0VmlldztcciIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMDguMTIuMjAxNC5cclxuICovXHJcblxyXG52YXIgVG9wTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcuaGVhZC1iYXInLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayBidXR0b24nOiAnb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQnLFxyXG4gICAgICAgICdjbGljayBhW2hyZWY9XCIvIyEvZ2VuZXJhdGUvXCJdJzogJ2dlbmVyYXRlUERGJ1xyXG4gICAgfSxcclxuICAgIG9uSW50ZXJ2YWxCdXR0b25DbGlja2VkIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIHZhciBhY3Rpb24gPSBidXR0b24uZGF0YSgnYWN0aW9uJyk7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gYWN0aW9uLnNwbGl0KCctJylbMV07XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUERGIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgd2luZG93LnByaW50KCk7XHJcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb3BNZW51VmlldztcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgQWxvbmVUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9ib3JkZXJXaWR0aCA6IDMsXHJcbiAgICBfY29sb3IgOiAnI0U2RjBGRicsXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gXy5leHRlbmQoQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZXZlbnRzKCksIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5sZWZ0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAucmlnaHRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5sZWZ0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAucmlnaHRCb3JkZXInIDogJ3JlbmRlcicsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5sZWZ0Qm9yZGVyJyA6ICdfcG9pbnRlck1vdXNlJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5sZWZ0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLnJpZ2h0Qm9yZGVyJyA6ICdfcG9pbnRlck1vdXNlJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5yaWdodEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZSdcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLnBhcmFtcy5wYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5wYXJhbXMucGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5wYXJhbXMuaGVpZ2h0IC0gdGhpcy5wYXJhbXMucGFkZGluZyAqIDIsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IHBvcy54LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5wYXJhbXMucGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMucGFyYW1zLnBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMucGFyYW1zLmhlaWdodCAtIHRoaXMucGFyYW1zLnBhZGRpbmcgKiAyLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9wb2ludGVyTW91c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgIH0sXHJcbiAgICBfZGVmYXVsdE1vdXNlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XHJcbiAgICB9LFxyXG4gICAgX2NoYW5nZVNpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGVmdFggPSB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpO1xyXG4gICAgICAgIHZhciByaWdodFggPSB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSArIHRoaXMuX2JvcmRlcldpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC53aWR0aChyaWdodFggLSBsZWZ0WCk7XHJcbiAgICAgICAgcmVjdC54KGxlZnRYKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSAtIHRoaXMuX2JvcmRlcldpZHRoKTtcclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsb25lVGFza1ZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEJhc2ljVGFza1ZpZXcgPSBCYWNrYm9uZS5LaW5ldGljVmlldy5leHRlbmQoe1xyXG4gICAgcGFyYW1zIDoge1xyXG4gICAgICAgIGhlaWdodCA6IDIxLFxyXG4gICAgICAgIHBhZGRpbmcgOiAzXHJcbiAgICB9LFxyXG4gICAgX2NvbXBsZXRlQ29sb3IgOiAnI2U4ODEzNCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUnIDogJ191cGRhdGVEYXRlcycsXHJcbiAgICAgICAgICAgICdkcmFnZW5kJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3lcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMucGFyYW1zLnBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMucGFyYW1zLmhlaWdodCAtIHRoaXMucGFyYW1zLnBhZGRpbmcgKiAyLFxyXG4gICAgICAgICAgICBuYW1lIDogJ21haW5SZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLnBhcmFtcy5wYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLnBhcmFtcy5oZWlnaHQgLSB0aGlzLnBhcmFtcy5wYWRkaW5nICogMixcclxuICAgICAgICAgICAgbmFtZSA6ICdjb21wbGV0ZVJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJlY3QsIGNvbXBsZXRlUmVjdCk7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSByZWN0LndpZHRoKCk7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmVsLngoKSArIHJlY3QueCgpO1xyXG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCksIGRheXMyID0gTWF0aC5mbG9vcigoeCArIGxlbmd0aCkgLyBkYXlzV2lkdGgpO1xyXG5cclxuICAgICAgICB0aGlzLm1vZGVsLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpLFxyXG4gICAgICAgICAgICBlbmQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMiAtIDEpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRNb2RlbEV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGRvbid0IHVwZGF0ZSBlbGVtZW50IHdoaWxlIGRyYWdnaW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2luZyA9IHRoaXMuZWwuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmdldENoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBkcmFnZ2luZyB8fCBjaGlsZC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ3N0YXJ0JykpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ2VuZCcpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICByZXR1cm4gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIC8vIG1vdmUgZ3JvdXBcclxuICAgICAgICB0aGlzLmVsLngoeC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBtYWluIHJlY3QgcGFyYW1zXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHJlY3QueCgwKTtcclxuICAgICAgICByZWN0LndpZHRoKHgueDIgLSB4LngxKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNvbXBsZXRlIHBhcmFtc1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdLndpZHRoKHRoaXMuX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGgoKSk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBzZXRZIDogZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuZWwueSh5KTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSByZXF1aXJlKCcuL05lc3RlZFRhc2tWaWV3Jyk7XHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gcmVxdWlyZSgnLi9BbG9uZVRhc2tWaWV3Jyk7XHJcblxyXG52YXIgR2FudHRDaGFydFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyNnYW50dC1jb250YWluZXInLFxyXG4gICAgX3RvcFBhZGRpbmcgOiA3MCxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2luaXRTdGFnZSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRMYXllcnMoKTtcclxuICAgICAgICB0aGlzLl9pbml0QmFja2dyb3VuZCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRUYXNrc1ZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdENvbGxlY3Rpb25FdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBzZXRMZWZ0UGFkZGluZyA6IGZ1bmN0aW9uKG9mZnNldCkge1xyXG4gICAgICAgIHRoaXMuX2xlZnRQYWRkaW5nID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN0YWdlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZSA9IG5ldyBLaW5ldGljLlN0YWdlKHtcclxuICAgICAgICAgICAgY29udGFpbmVyIDogdGhpcy5lbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdExheWVycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuRmxheWVyID0gbmV3IEtpbmV0aWMuTGF5ZXIoKTtcclxuICAgICAgICB0aGlzLkJsYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIsIHRoaXMuRmxheWVyKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlU3RhZ2VBdHRycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFnZS5zZXRBdHRycyh7XHJcbiAgICAgICAgICAgIG9mZnNldFggOiAtIHRoaXMuX2xlZnRQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDU4MCxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuJGVsLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDtcclxuICAgICAgICAgICAgICAgIHZhciBtaW5YID0gLSAobGluZVdpZHRoIC0gdGhpcy53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb3MueCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zLnggPCBtaW5YKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG1pblg7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBwb3MueDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcclxuICAgICAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRCYWNrZ3JvdW5kIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlID0gbmV3IEtpbmV0aWMuU2hhcGUoe1xyXG4gICAgICAgICAgICBzY2VuZUZ1bmM6IHRoaXMuX2dldFNjZW5lRnVuY3Rpb24oKSxcclxuICAgICAgICAgICAgc3Ryb2tlOiAnbGlnaHRncmF5JyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgd2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcbiAgICAgICAgdmFyIGJhY2sgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5zdGFnZS5oZWlnaHQoKSxcclxuICAgICAgICAgICAgd2lkdGggOiB3aWR0aFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLkJsYXllci5hZGQoYmFjaykuYWRkKHNoYXBlKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ2V0U2NlbmVGdW5jdGlvbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzZGlzcGxheSA9IHRoaXMuc2V0dGluZ3Muc2Rpc3BsYXk7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgYm9yZGVyV2lkdGggPSBzZGlzcGxheS5ib3JkZXJXaWR0aCB8fCAxO1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSAxO1xyXG4gICAgICAgIHZhciByb3dIZWlnaHQgPSAyMDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xyXG4gICAgICAgICAgICB2YXIgaSwgcywgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xyXG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgLy9kcmF3IHRocmVlIGxpbmVzXHJcbiAgICAgICAgICAgIGZvcihpID0gMTsgaSA8IDQgOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8ob2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGxpbmVXaWR0aCArIG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB5aSA9IDAsIHlmID0gcm93SGVpZ2h0LCB4aSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAocyA9IDE7IHMgPCAzOyBzKyspe1xyXG4gICAgICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg9aERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgeWYpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMTBwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeCAtIGxlbmd0aCAvIDIsIHlmIC0gcm93SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB5aSA9IHlmOyB5ZiA9IHlmICsgcm93SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDsgcyA9IDM7IHlmID0gMTIwMDtcclxuICAgICAgICAgICAgdmFyIGRyYWdJbnQgPSBwYXJzZUludChzYXR0ci5kcmFnSW50ZXJ2YWwsIDEwKTtcclxuICAgICAgICAgICAgdmFyIGhpZGVEYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmKCBkcmFnSW50ID09PSAxNCB8fCBkcmFnSW50ID09PSAzMCl7XHJcbiAgICAgICAgICAgICAgICBoaWRlRGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgeWYpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdsZWZ0JztcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICAvLyBkYXRlIGhpZGUgb24gc3BlY2lmaWMgdmlld3NcclxuICAgICAgICAgICAgICAgIGlmIChoaWRlRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4LWxlbmd0aCs0MCx5aStyb3dIZWlnaHQvMik7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3Ryb2tlU2hhcGUodGhpcyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0Q29sbGVjdGlvbkV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl90YXNrVmlld3MsIHZpZXcpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0VGFza3NWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkVGFza1ZpZXcgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIHZpZXc7XHJcbiAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTmVzdGVkVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWxvbmVUYXNrVmlldyh7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcclxuICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZXNvcnRWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsYXN0WSA9IHRoaXMuX3RvcFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XHJcbiAgICAgICAgICAgIGxhc3RZICs9IHZpZXcuaGVpZ2h0O1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuZHJhdygpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FudHRDaGFydFZpZXc7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3IgOiAnI2IzZDFmYycsXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBncm91cCBpcyBtb3ZlZFxyXG4gICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZGV0ZWN0IGludGVydmFsXHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmVsLngoKSArIHJlY3QueCgpO1xyXG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCk7XHJcbiAgICAgICAgdmFyIG5ld1N0YXJ0ID0gYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKTtcclxuICAgICAgICB0aGlzLm1vZGVsLm1vdmVUb1N0YXJ0KG5ld1N0YXJ0KTtcclxuXHJcbi8vICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5fdXBkYXRlRGF0ZXMuY2FsbCh0aGlzKTtcclxuLy8gICAgICAgIHZhciB0aW1lRGlmZiA9XHJcbi8vICAgICAgICB0aGlzLm1vZGVsLnNldCh7XHJcbi8vICAgICAgICAgICAgc3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXHJcbi8vICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4vLyAgICAgICAgfSk7XHJcbi8vXHJcbi8vICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuLy8gICAgICAgICAgICBib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcclxuLy8gICAgICAgICAgICBkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xyXG4vL1xyXG4vLyAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4vLyAgICAgICAgdmFyIGxlbmd0aCA9IHJlY3Qud2lkdGgoKTtcclxuLy8gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuLy8gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCksIGRheXMyID0gTWF0aC5mbG9vcigoeCArIGxlbmd0aCkgLyBkYXlzV2lkdGgpO1xyXG4vL1xyXG4vLyAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4vLyAgICAgICAgICAgIHN0YXJ0OiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpLFxyXG4vLyAgICAgICAgICAgIGVuZDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyIC0gMSlcclxuLy8gICAgICAgIH0pO1xyXG4gICAgfSxcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2tWaWV3OyIsImZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhhcHApIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5hcHAgPSBhcHA7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICdkaXYnLFxyXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzLnBhcmVudCgpKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmFwcC50YXNrcy5nZXQoaWQpO1xyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdkZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmFkZU91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdwcm9wZXJ0aWVzJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHByb3BlcnR5ID0gJy5wcm9wZXJ0eS0nO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXR1cyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnMTA4JzogJ1JlYWR5JyxcclxuICAgICAgICAgICAgICAgICAgICAnMTA5JzogJ09wZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICcxMTAnOiAnQ29tcGxldGUnXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdmFyICRlbCA9ICQoZG9jdW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KyduYW1lJykuaHRtbChtb2RlbC5nZXQoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2Rlc2NyaXB0aW9uJykuaHRtbChtb2RlbC5nZXQoJ2Rlc2NyaXB0aW9uJykpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydzdGFydCcpLmh0bWwoY29udmVydERhdGUobW9kZWwuZ2V0KCdzdGFydCcpKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2VuZCcpLmh0bWwoY29udmVydERhdGUobW9kZWwuZ2V0KCdlbmQnKSkpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydzdGF0dXMnKS5odG1sKHN0YXR1c1ttb2RlbC5nZXQoJ3N0YXR1cycpXSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUobW9kZWwuZ2V0KCdzdGFydCcpKTtcclxuICAgICAgICAgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUobW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyXG4gICAgICAgICAgICAgICAgaWYoc3RhcnRkYXRlICE9IFwiXCIgJiYgZW5kZGF0ZSAhPSBcIlwiKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2R1cmF0aW9uJykuaHRtbChNYXRoLmZsb29yKDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJy51aS5wcm9wZXJ0aWVzJykubW9kYWwoJ3NldHRpbmcnLCAndHJhbnNpdGlvbicsICd2ZXJ0aWNhbCBmbGlwJylcclxuICAgICAgICAgICAgICAgICAgICAubW9kYWwoJ3Nob3cnKVxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbnZlcnREYXRlKGlucHV0Rm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcGFkKHMpIHsgcmV0dXJuIChzIDwgMTApID8gJzAnICsgcyA6IHM7IH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKGlucHV0Rm9ybWF0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3BhZChkLmdldERhdGUoKSksIHBhZChkLmdldE1vbnRoKCkrMSksIGQuZ2V0RnVsbFllYXIoKV0uam9pbignLycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0Fib3ZlJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayhkYXRhLCAnYWJvdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdyb3dCZWxvdycpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfSwgJ2JlbG93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnaW5kZW50Jyl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5leHBhbmQtbWVudScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbF9pZCA9ICQodGhpcykuY2xvc2VzdCgnZGl2JykucHJldigpLmZpbmQoJy5zdWItdGFzaycpLmxhc3QoKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHByZXZNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChyZWxfaWQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudF9pZCA9IHByZXZNb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ3BhcmVudGlkJywgcGFyZW50X2lkKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHZhciB0b2JlQ2hpbGQgPSAkKHRoaXMpLm5leHQoKS5jaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5LmVhY2godG9iZUNoaWxkLCBmdW5jdGlvbihpbmRleCwgZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkTW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoY2hpbGRJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJyxwYXJlbnRfaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCd0YXNrJykuYWRkQ2xhc3MoJ3N1Yi10YXNrJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogJzMwcHgnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ291dGRlbnQnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgncGFyZW50aWQnLDApO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvYmVDaGlsZCA9ICQodGhpcykucGFyZW50KCkuY2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJySW5kZXggPSAkKHRoaXMpLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0b2JlQ2hpbGQsIGZ1bmN0aW9uKGluZGV4LCBkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA+IGN1cnJJbmRleCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZElkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRNb2RlbCA9IHNlbGYuYXBwLnRhc2tzLmdldChjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJyxtb2RlbC5nZXQoJ2lkJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucHJlcGVuZCgnPGxpIGNsYXNzPVwiZXhwYW5kLW1lbnVcIj48aSBjbGFzcz1cInRyaWFuZ2xlIHVwIGljb25cIj48L2k+IDwvbGk+Jyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdzdWItdGFzaycpLmFkZENsYXNzKCd0YXNrJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogJzBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbnZhc1ZpZXcucmVuZGVyZ3JvdXBzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIFwicm93QWJvdmVcIjoge25hbWU6IFwiTmV3IFJvdyBBYm92ZVwiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJyb3dCZWxvd1wiOiB7bmFtZTogXCJOZXcgUm93IEJlbG93XCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7bmFtZTogXCJJbmRlbnQgUm93XCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcIm91dGRlbnRcIjoge25hbWU6IFwiT3V0ZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwic2VwMVwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge25hbWU6IFwiUHJvcGVydGllc1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAyXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwiZGVsZXRlXCI6IHtuYW1lOiBcIkRlbGV0ZSBSb3dcIiwgaWNvbjogXCJcIn1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUuYWRkVGFzayA9IGZ1bmN0aW9uKGRhdGEsIGluc2VydFBvcykge1xyXG4gICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuYXBwLnRhc2tzLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICB0YXNrLnNhdmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udGV4dE1lbnVWaWV3OyIsIlxudmFyIHRlbXBsYXRlID0gXCI8ZGl2PlxcclxcbiAgICA8dWw+XFxyXFxuICAgICAgICA8JSB2YXIgc2V0dGluZz1hcHAuc2V0dGluZ3M7JT5cXHJcXG4gICAgICAgIDwlIGlmKGlzUGFyZW50KXsgJT4gPGxpIGNsYXNzPVxcXCJleHBhbmQtbWVudVxcXCI+PGkgY2xhc3M9XFxcInRyaWFuZ2xlIGRvd24gaWNvblxcXCI+PC9pPjwvbGk+PCUgfSAlPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtbmFtZVxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJuYW1lXFxcIixuYW1lKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLXN0YXJ0XFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcInN0YXJ0XFxcIixzdGFydCkpOyU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWVuZFxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJlbmRcXFwiLGVuZCkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1jb21wbGV0ZVxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJjb21wbGV0ZVxcXCIsY29tcGxldGUpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtc3RhdHVzXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcInN0YXR1c1xcXCIsc3RhdHVzKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWR1cmF0aW9uXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImR1cmF0aW9uXFxcIiwwLHtcXFwic3RhcnRcXFwiOnN0YXJ0LFxcXCJlbmRcXFwiOmVuZH0pKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJyZW1vdmUtaXRlbVxcXCI+PGJ1dHRvbiBjbGFzcz1cXFwibWluaSByZWQgdWkgYnV0dG9uXFxcIj4gPGkgY2xhc3M9XFxcInNtYWxsIHRyYXNoIGljb25cXFwiPjwvaT48L2J1dHRvbj48L2xpPlxcclxcbiAgICA8L3VsPlxcclxcbjwvZGl2PlwiO1xuXG52YXIgVGFza0l0ZW1WaWV3PUJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZSA6ICdsaScsXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKHRlbXBsYXRlKSxcblx0aXNQYXJlbnQ6IGZhbHNlLFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpe1xuXHRcdHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdlZGl0cm93JywgdGhpcy5lZGl0KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6bmFtZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCBjaGFuZ2U6Y29tcGxldGUgY2hhbmdlOnN0YXR1cycsIHRoaXMucmVuZGVyUm93KTtcblx0XHR0aGlzLiRlbC5ob3ZlcihmdW5jdGlvbihlKXtcblx0XHRcdCQoZG9jdW1lbnQpLmZpbmQoJy5pdGVtLXNlbGVjdG9yJykuc3RvcCgpLmNzcyh7XG5cdFx0XHRcdHRvcDogKCQoZS5jdXJyZW50VGFyZ2V0KS5vZmZzZXQoKS50b3ApKydweCdcblx0XHRcdH0pLmZhZGVJbigpO1xuXHRcdH0sIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKGRvY3VtZW50KS5maW5kKCcuaXRlbS1zZWxlY3RvcicpLnN0b3AoKS5mYWRlT3V0KCk7XG5cdFx0fSk7XG5cdFx0dGhpcy4kZWwub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xuXHRcdFx0JChkb2N1bWVudCkuZmluZCgnLml0ZW0tc2VsZWN0b3InKS5zdG9wKCkuZmFkZU91dCgpO1xuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKHBhcmVudCl7XG5cdFx0dmFyIGFkZENsYXNzPSdzdWItdGFzayBkcmFnLWl0ZW0nO1xuXHRcdFxuXHRcdGlmKHBhcmVudCl7XG5cdFx0XHRhZGRDbGFzcz1cInRhc2tcIjtcblx0XHRcdHRoaXMuaXNQYXJlbnQgPSB0cnVlO1xuXHRcdFx0dGhpcy5zZXRFbGVtZW50KCQoJzxkaXY+JykpO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5pc1BhcmVudCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5zZXRFbGVtZW50KCQoJzxsaT4nKSk7XG5cdFx0XHR0aGlzLiRlbC5kYXRhKHtcblx0XHRcdFx0aWQgOiB0aGlzLm1vZGVsLmlkXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoYWRkQ2xhc3MpO1xuXHRcdHRoaXMuJGVsLmF0dHIoJ2lkJywgdGhpcy5tb2RlbC5jaWQpO1xuXHRcdHJldHVybiB0aGlzLnJlbmRlclJvdygpO1xuXHR9LFxuXHRyZW5kZXJSb3c6ZnVuY3Rpb24oKXtcblx0XHR2YXIgZGF0YSA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cdFx0ZGF0YS5pc1BhcmVudCA9IHRoaXMuaXNQYXJlbnQ7XG5cdFx0ZGF0YS5hcHAgPSB0aGlzLmFwcDtcblx0XHR0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUoZGF0YSkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRlZGl0OmZ1bmN0aW9uKGV2dCl7XG5cdFx0dmFyIHRhcmdldCA9ICQoZXZ0LnRhcmdldCk7XG5cdFx0dmFyIHdpZHRoICA9IHBhcnNlSW50KHRhcmdldC5jc3MoJ3dpZHRoJyksIDEwKSAtIDU7XG5cdFx0dmFyIGZpZWxkID0gdGFyZ2V0LmF0dHIoJ2NsYXNzJykuc3BsaXQoJy0nKVsxXTtcblx0XHR2YXIgZm9ybSA9IHRoaXMuYXBwLnNldHRpbmdzLmdldEZvcm1FbGVtKGZpZWxkLCB0aGlzLm1vZGVsLCB0aGlzLm9uRWRpdCwgdGhpcyk7XG5cdFx0Zm9ybS5jc3Moe1xuXHRcdFx0d2lkdGg6IHdpZHRoICsgJ3B4J1xuXHRcdH0pO1xuXG5cdFx0dGFyZ2V0Lmh0bWwoZm9ybSk7XG5cdFx0Zm9ybS5mb2N1cygpO1xuXHR9LFxuXHRvbkVkaXQ6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcblx0XHRjb25zb2xlLmxvZyhuYW1lLCB2YWx1ZSk7XG5cdFx0aWYgKG5hbWUgPT09ICdkdXJhdGlvbicpIHtcblx0XHRcdHZhciBzdGFydCA9IHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0dmFyIGVuZCA9IHN0YXJ0LmNsb25lKCkuYWRkRGF5cyhwYXJzZUludCh2YWx1ZSwgMTApIC0gMSk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCgnZW5kJywgZW5kKS5zYXZlKCk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLm1vZGVsLnNldChuYW1lLCB2YWx1ZSkuc2F2ZSgpO1xuXHRcdH1cblx0XHR0aGlzLnJlbmRlclJvdygpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbVZpZXc7XG4iLCJ2YXIgVGFza0l0ZW1WaWV3ID0gcmVxdWlyZSgnLi9UYXNrSXRlbVZpZXcnKTtcblxudmFyIFRhc2tWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAnbGknLFxuXHRjbGFzc05hbWU6ICd0YXNrLWxpc3QtY29udGFpbmVyIGRyYWctaXRlbScsXG5cdGNvbGxhcHNlZCA6IGZhbHNlLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHR9LFxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLnRhc2sgLmV4cGFuZC1tZW51JzogJ2NvbGxhcHNlT3JFeHBhbmQnLFxuXHRcdCdjbGljayAuYWRkLWl0ZW0gYnV0dG9uJzogJ2FkZEl0ZW0nLFxuXHRcdCdjbGljayAucmVtb3ZlLWl0ZW0gYnV0dG9uJzogJ3JlbW92ZUl0ZW0nXG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgcGFyZW50ID0gdGhpcy5tb2RlbDtcblx0XHR2YXIgaXRlbVZpZXcgPSBuZXcgVGFza0l0ZW1WaWV3KHtcblx0XHRcdG1vZGVsIDogcGFyZW50LFxuXHRcdFx0YXBwIDogdGhpcy5hcHBcblx0XHR9KTtcblxuXHRcdHRoaXMuJHBhcmVudGVsID0gaXRlbVZpZXcucmVuZGVyKHRydWUpLiRlbDtcblx0XHR0aGlzLiRlbC5hcHBlbmQodGhpcy4kcGFyZW50ZWwpO1xuXG5cdFx0dGhpcy4kZWwuZGF0YSh7XG5cdFx0XHRpZCA6IHBhcmVudC5pZFxuXHRcdH0pO1xuXHRcdHRoaXMuJGNoaWxkZWwgPSAkKCc8b2wgY2xhc3M9XCJzdWItdGFzay1saXN0IHNvcnRhYmxlXCI+PC9vbD4nKTtcblxuXHRcdHRoaXMuJGVsLmFwcGVuZCh0aGlzLiRjaGlsZGVsKTtcblx0XHR2YXIgY2hpbGRyZW4gPSBfLnNvcnRCeSh0aGlzLm1vZGVsLmNoaWxkcmVuLm1vZGVscywgZnVuY3Rpb24obW9kZWwpe1xuXHRcdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0fSk7XG5cdFx0Y2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XCJ1c2Ugc3RyaWN0XCI7XG5cdFx0XHRpdGVtVmlldz1uZXcgVGFza0l0ZW1WaWV3KHtcblx0XHRcdFx0bW9kZWw6IGNoaWxkLFxuXHRcdFx0XHRhcHA6IHRoaXMuYXBwXG5cdFx0XHR9KTtcblx0XHRcdGl0ZW1WaWV3LnJlbmRlcigpO1xuXHRcdFx0dGhpcy4kY2hpbGRlbC5hcHBlbmQoaXRlbVZpZXcuZWwpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHR0aGlzLnRvZ2dsZVBhcmVudCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRjb2xsYXBzZU9yRXhwYW5kOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29sbGFwc2VkID0gIXRoaXMuY29sbGFwc2VkO1xuXHRcdHRoaXMubW9kZWwuc2V0KCdjb2xsYXBzZWQnLCB0aGlzLmNvbGxhcHNlZCk7XG5cdFx0dGhpcy50b2dnbGVQYXJlbnQoKTtcblx0fSxcblx0dG9nZ2xlUGFyZW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RyID0gdGhpcy5jb2xsYXBzZWQgPyAnPGkgY2xhc3M9XCJ0cmlhbmdsZSB1cCBpY29uXCI+PC9pPiAnIDogJzxpIGNsYXNzPVwidHJpYW5nbGUgZG93biBpY29uXCI+PC9pPic7XG5cdFx0dGhpcy4kY2hpbGRlbC5zbGlkZVRvZ2dsZSgpO1xuXHRcdHRoaXMuJHBhcmVudGVsLmZpbmQoJy5leHBhbmQtbWVudScpLmh0bWwoc3RyKTtcblx0fSxcblx0YWRkSXRlbTogZnVuY3Rpb24oZXZ0KXtcblx0XHQkKGV2dC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd1bCcpLm5leHQoKS5hcHBlbmQoJzx1bCBjbGFzcz1cInN1Yi10YXNrXCIgaWQ9XCJjJytNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMTAwMDApICsgMSkrJ1wiPjxsaSBjbGFzcz1cImNvbC1uYW1lXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJOZXcgcGxhblwiIHNpemU9XCIzOFwiPjwvbGk+PGxpIGNsYXNzPVwiY29sLXN0YXJ0XCI+PGlucHV0IHR5cGU9XCJkYXRlXCIgcGxhY2Vob2xkZXI9XCJTdGFydCBEYXRlXCIgc3R5bGU9XCJ3aWR0aDo4MHB4O1wiPjwvbGk+PGxpIGNsYXNzPVwiY29sLWVuZFwiPjxpbnB1dCB0eXBlPVwiZGF0ZVwiIHBsYWNlaG9sZGVyPVwiRW5kIERhdGVcIiBzdHlsZT1cIndpZHRoOjgwcHg7XCI+PC9saT48bGkgY2xhc3M9XCJjb2wtY29tcGxldGVcIj48aW5wdXQgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiMlwiIHN0eWxlPVwid2lkdGg6IDMwcHg7bWFyZ2luLWxlZnQ6IC0xNHB4O1wiIG1pbj1cIjBcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1zdGF0dXNcIj48c2VsZWN0IHN0eWxlPVwid2lkdGg6IDcwcHg7XCI+PG9wdGlvbiB2YWx1ZT1cImluY29tcGxldGVcIj5Jbm9tcGxldGVkPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cImNvbXBsZXRlZFwiPkNvbXBsZXRlZDwvb3B0aW9uPjwvc2VsZWN0PjwvbGk+PGxpIGNsYXNzPVwiY29sLWR1cmF0aW9uXCI+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIjI0XCIgc3R5bGU9XCJ3aWR0aDogMzJweDttYXJnaW4tbGVmdDogLThweDtcIiBtaW49XCIwXCI+IGQ8L2xpPjxsaSBjbGFzcz1cInJlbW92ZS1pdGVtXCI+PGJ1dHRvbiBjbGFzcz1cIm1pbmkgcmVkIHVpIGJ1dHRvblwiPiA8aSBjbGFzcz1cInNtYWxsIHRyYXNoIGljb25cIj48L2k+PC9idXR0b24+PC9saT48L3VsPicpLmhpZGUoKS5zbGlkZURvd24oKTtcblx0fSxcblx0cmVtb3ZlSXRlbTogZnVuY3Rpb24oZXZ0KXtcblx0XHR2YXIgJHBhcmVudFVMID0gJChldnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnb2wgdWwnKS5wYXJlbnQoKS5wYXJlbnQoKTtcblx0XHR2YXIgaWQgPSAkcGFyZW50VUwuYXR0cignaWQnKTtcblx0XHR2YXIgdGFza01vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KGlkKTtcblx0XHRpZigkcGFyZW50VUwuaGFzQ2xhc3MoJ3Rhc2snKSl7XG5cdFx0XHQkcGFyZW50VUwubmV4dCgnb2wnKS5mYWRlT3V0KDEwMDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHR9KTtcblx0XHR9ZWxzZXtcblx0XHRcdCQoZXZ0LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3VsJykuZmFkZU91dCgxMDAwLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHRhc2tNb2RlbC5kZXN0cm95KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tWaWV3O1xuIl19
