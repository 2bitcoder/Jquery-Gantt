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
var util = require('../utils/util');var params = util.getURLParams();var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,        action: '',        sortindex: 0,        dependency:'',        resources: {},        status: 110,        health: 21,        start: '',        end: '',        ProjectRef : params.project,        WBS_ID : params.profile,        color:'#0090d3',        lightcolor: '#E6F0FF',        darkcolor: '#e88134',        aType: '',        reportable: '',        parentid: 0    },    initialize : function() {        "use strict";        this.children = new Backbone.Collection();        this.listenTo(this.children, 'change:parentid', function(child) {            this.children.remove(child);        });        this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);        this.listenTo(this, 'destroy', function() {            this.children.each(function(child) {                child.destroy();            });        });    },    parse: function(response) {        if(_.isString(response.start)){            response.start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            response.start = new Date();        }                if(_.isString(response.end)){            response.end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            response.end = new Date();        }        response.parentid = parseInt(response.parentid || '0', 10);        // remove null params        _.each(response, function(val, key) {            if (!val) {                response[key] = undefined;            }        });        return response;    },    _checkTime : function() {        if (this.children.length === 0) {            return;        }        var startTime = this.children.at(0).get('start');        var endTime = this.children.at(0).get('end');        this.children.each(function(child) {            var childStartTime = child.get('start');            var childEndTime = child.get('end');            if(childStartTime.compareTo(startTime) === -1) {                startTime = childStartTime;            }            if(childEndTime.compareTo(endTime) === 1){                endTime = childEndTime;            }        }.bind(this));        this.set('start', startTime);        this.set('end', endTime);    }});module.exports = TaskModel;
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
	var barOptions=['draggable','dragBoundFunc','resizable','resizeBoundFunc','height','width','x','y'];

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
		var gr=new Kinetic.Group();
		var imgrect=new Kinetic.Rect({
			x:0,
			y:0,
			height: option.height,
			width: 20,
			strokeEnabled:false,
			fill:'yellow',
			opacity:0.5
		});
		var anchor=new Kinetic.Circle({
			x:10,
			y:5,
			radius: 3,
			strokeWidth:1,
			name: 'anchor',
			stroke:'black',
			fill:'white',
		});

		var namerect=new Kinetic.Rect({
			x:20,
			y:0,
			height: option.height,
			width: 40,
			strokeEnabled:false,
			fill:'pink',
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
			}
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
				y: 0,
			}
		},
		toggle:function(show){
			var method=show?'show':'hide';
			this.group[method]();
			for(var i=0,iLen=this.dependencies.length;i<iLen;i++){
				this.dependencies[i].connector[method]();
			}
		},
		draw:function(){
			this.group.getLayer().draw();

		},
		sync:function(){
			console.log('syncing ' + this.model.cid);
			var dates = this.calculateDates();
			this.model.set({
				start: dates.start,
				end: dates.end
			});
			console.log('syncing '+this.model.cid+' finished');
			this.model.save();
		}
	}
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
	this.syncing=false;
	this.children=[];

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
					return m.model === child
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
			if(!nodraw)
				this.group.getLayer().draw();
			
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
			return this.attr.height;
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
			this.listenTo(this.model,'change:active',this.toggleChildren);
			this.listenTo(this.model,'onsort',this.renderSortedChildren);
			this.listenTo(this.model,'change:start change:end', function(){
				this.topbar.setAttrs(this.getRectparams());
				this.topbar.getLayer().draw();
			});

		},
		getGroupParams: function(){
			return _.extend({
				x:0,
				y:0,
			}, this.setting.topBar);
			
		},
		calculateX:function(model){
			var attrs= this.settings.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			return {
				x1:(Date.daysdiff(boundaryMin,model.get('start'))-1)*daysWidth,
				x2:Date.daysdiff(boundaryMin,model.get('end'))*daysWidth,
			};
		},
		calculateParentDates:function(){
			var attrs=this.settings.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			var days1=Math.round(this.getX1(true)/daysWidth),days2=Math.round(this.getX2(true)/daysWidth);
			return {
				start: boundaryMin.clone().addDays(days1),
				end:boundaryMin.clone().addDays(days2-1)
			};
			
		},
		getRectparams:function(){
			var parent=this.model;
			var xs=this.calculateX(parent);
			var setting=this.setting;
			return _.extend({
				x: xs.x1,
				width:xs.x2-xs.x1,
				y: setting.gap,
			},setting.topBar);
		},
		toggleChildren:function(){
			var show=this.model.get('active');
			var children=this.children;
			for(var i=0;i<children.length;i++){
				children[i].toggle(show)
			}
		},
		sync:function(){
			this.syncing = true;
			console.log('parent sync called');
			var pdates=this.calculateParentDates();
			this.model.set({
				start: pdates.start,
				end:pdates.end
			});
			
			var children = this.children;
			children.forEach(function(child) {
				child.sync();
			});
			console.error('setting sync to false');

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
		this.toggleParent();
	},
	toggleParent: function() {
		"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9mYWtlX2UzNmUxY2EzLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9BZGRGb3JtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzL0Jhci5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzL0Jhckdyb3VwLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXMvS0NhbnZhc1ZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuYUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVGFza01vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Rhc2tNb2RlbCcpO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdHVybCA6ICdhcGkvdGFza3MnLFxuXHRtb2RlbDogVGFza01vZGVsLFxuXHRpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdWJzY3JpYmUoKTtcblx0fSxcblx0Y29tcGFyYXRvciA6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdH0sXG5cdGxpbmtDaGlsZHJlbiA6IGZ1bmN0aW9uKCkge1xuXHRcdFwidXNlIHN0cmljdFwiO1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBwYXJlbnRUYXNrID0gdGhpcy5nZXQodGFzay5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0aWYgKHBhcmVudFRhc2spIHtcblx0XHRcdFx0cGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0bW9kZWwuc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRtb2RlbC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0dGhpcy50cmlnZ2VyKCdyZXNvcnQnKTtcblx0fSxcblx0cmVzb3J0IDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24ocGFyZW50RGF0YSkge1xuXHRcdFx0dmFyIHBhcmVudE1vZGVsID0gdGhpcy5nZXQocGFyZW50RGF0YS5pZCk7XG5cdFx0XHR2YXIgcHJldlNvcnQgPSBwYXJlbnRNb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdFx0aWYgKHByZXZTb3J0ICE9PSArK3NvcnRJbmRleCkge1xuXHRcdFx0XHRwYXJlbnRNb2RlbC5zZXQoJ3NvcnRpbmRleCcsIHNvcnRJbmRleCkuc2F2ZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBhcmVudE1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRwYXJlbnRNb2RlbC5zZXQoJ3BhcmVudGlkJywgMCkuc2F2ZSgpO1xuXHRcdFx0fVxuXHRcdFx0cGFyZW50RGF0YS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkRGF0YSkge1xuXHRcdFx0XHR2YXIgY2hpbGRNb2RlbCA9IHNlbGYuZ2V0KGNoaWxkRGF0YS5pZCk7XG5cdFx0XHRcdHZhciBwcmV2U29ydEkgPSBjaGlsZE1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0XHRcdGlmIChwcmV2U29ydEkgIT09ICsrc29ydEluZGV4KSB7XG5cdFx0XHRcdFx0Y2hpbGRNb2RlbC5zZXQoJ3NvcnRpbmRleCcsIHNvcnRJbmRleCkuc2F2ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChjaGlsZE1vZGVsLmdldCgncGFyZW50aWQnKSAhPT0gcGFyZW50TW9kZWwuaWQpIHtcblx0XHRcdFx0XHRjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLCBwYXJlbnRNb2RlbC5pZCkuc2F2ZSgpO1xuXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBzZWxmLmZpbmQoZnVuY3Rpb24obSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IHBhcmVudE1vZGVsLmlkO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQoY2hpbGRNb2RlbCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdHN1YnNjcmliZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcywgJ2FkZCcsIGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHZhciBwYXJlbnQgPSB0aGlzLmZpbmQoZnVuY3Rpb24obSkge1xuXHRcdFx0XHRcdHJldHVybiBtLmlkID09PSBtb2RlbC5nZXQoJ3BhcmVudGlkJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRcdFx0cGFyZW50LmNoaWxkcmVuLmFkZChtb2RlbCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignY2FuIG5vdCBmaW5kIHBhcmVudCB3aXRoIGlkICcgKyBtb2RlbC5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tDb2xsZWN0aW9uO1xuXG4iLCJcbnZhciBUYXNrQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24nKTtcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vbW9kZWxzL1NldHRpbmdNb2RlbCcpO1xuXG52YXIgR2FudHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9HYW50dFZpZXcnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlscy91dGlsJyk7XG5cbiQoZnVuY3Rpb24gKCkge1xuXHR2YXIgYXBwID0ge307XG5cdGFwcC50YXNrcyA9IG5ldyBUYXNrQ29sbGVjdGlvbigpO1xuXG5cdC8vIGRldGVjdCBBUEkgcGFyYW1zIGZyb20gZ2V0LCBlLmcuID9wcm9qZWN0PTE0MyZwcm9maWxlPTE3XG5cdHZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xuXHRpZiAocGFyYW1zLnByb2plY3QgJiYgcGFyYW1zLnByb2ZpbGUpIHtcblx0XHRhcHAudGFza3MudXJsID0gJ2FwaS90YXNrcy8nICsgcGFyYW1zLnByb2plY3QgKyAnLycgKyBwYXJhbXMucHJvZmlsZTtcblx0fVxuXG5cdGFwcC50YXNrcy5mZXRjaCh7XG5cdFx0c3VjY2VzcyA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ1N1Y2Nlc3MgbG9hZGluZyB0YXNrcy4nKTtcblx0XHRcdGFwcC5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyh7fSwge2FwcCA6IGFwcH0pO1xuXHRcdFx0YXBwLnRhc2tzLmxpbmtDaGlsZHJlbigpO1xuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcCxcblx0XHRcdFx0Y29sbGVjdGlvbiA6IGFwcC50YXNrc1xuXHRcdFx0fSkucmVuZGVyKCk7XG5cdFx0XHQkKCcjbG9hZGVyJykuZmFkZU91dCgpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9XG5cdH0sIHtwYXJzZTogdHJ1ZX0pO1xufSk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcblxudmFyIGFwcCA9IHt9O1xuXG52YXIgaGZ1bmMgPSBmdW5jdGlvbihwb3MsIGV2dCkge1xuXHR2YXIgZHJhZ0ludGVydmFsID0gYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInLCAnZHJhZ0ludGVydmFsJyk7XG5cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcblx0cmV0dXJuIHtcblx0XHR4OiBldnQuaW5pcG9zLnggKyBuICogZHJhZ0ludGVydmFsLFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGludGVydmFsOiAnZml4Jyxcblx0XHQvL2RheXMgcGVyIGludGVydmFsXG5cdFx0ZHBpOiAxXG5cdH0sXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0YXBwID0gdGhpcy5hcHA7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwXG5cdFx0fTtcblxuXHRcdHRoaXMuc2dyb3VwID0ge1xuXHRcdFx0Y3VycmVudFk6IDAsXG5cdFx0XHRpbmlZOiA2MCxcblx0XHRcdGFjdGl2ZTogZmFsc2UsXG5cdFx0XHR0b3BCYXI6IHtcblx0XHRcdFx0ZmlsbDogJyM2NjYnLFxuXHRcdFx0XHRoZWlnaHQ6IDEyLFxuXHRcdFx0XHRzdHJva2VFbmFibGVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdGdhcDogMyxcblx0XHRcdHJvd0hlaWdodDogMjIsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiBoZnVuY1xuXHRcdH07XG5cblx0XHR0aGlzLnNiYXIgPSB7XG5cdFx0XHRiYXJoZWlnaHQ6IDEyLFxuXHRcdFx0cmVjdG9wdGlvbjoge1xuXHRcdFx0XHRzdHJva2VFbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0ZmlsbDogJ2dyZXknXG5cdFx0XHR9LFxuXHRcdFx0Z2FwOiAyMCxcblx0XHRcdHJvd2hlaWdodDogIDYwLFxuXHRcdFx0ZHJhZ2dhYmxlOiB0cnVlLFxuXHRcdFx0cmVzaXphYmxlOiB0cnVlLFxuXHRcdFx0ZHJhZ0JvdW5kRnVuYzogaGZ1bmMsXG5cdFx0XHRyZXNpemVCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdFx0c3ViZ3JvdXA6IHRydWVcblx0XHR9O1xuXHRcdHRoaXMuc2Zvcm09e1xuXHRcdFx0J25hbWUnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAndGV4dCdcblx0XHRcdH0sXG5cdFx0XHQnc3RhcnQnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnZGF0ZScsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24oZCl7XG5cdFx0XHRcdFx0cmV0dXJuIGQudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dDJkOiBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5wYXJzZUV4YWN0KCB1dGlsLmNvcnJlY3RkYXRlKHQpLCAnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdkYXRlJyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRyZXR1cm4gZC50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0MmQ6IGZ1bmN0aW9uKHQpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLnBhcnNlRXhhY3QoIHV0aWwuY29ycmVjdGRhdGUodCksICdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3NlbGVjdCcsXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHQnMTEwJzogJ2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5JzogJ29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2NvbXBsZXRlJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnXG5cdFx0XHR9LFxuXHRcdFx0J2R1cmF0aW9uJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnLFxuXHRcdFx0XHRkMnQ6IGZ1bmN0aW9uKHQsbW9kZWwpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSxtb2RlbC5nZXQoJ2VuZCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0dGhpcy5nZXRGb3JtRWxlbSA9IHRoaXMuY3JlYXRlRWxlbSgpO1xuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuYXBwLnRhc2tzO1xuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XG5cdH0sXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xuXHRcdGlmKGF0dHIpe1xuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xuXHR9LFxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWluRGF0ZSA9IG5ldyBEYXRlKDIwMjAsMSwxKSwgbWF4RGF0ZSA9IG5ldyBEYXRlKDAsMCwwKTtcblx0XHRcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XG5cdFx0XHRcdG1pbkRhdGU9bW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGUgPSBtaW5EYXRlO1xuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XG5cdFx0XG5cdH0sXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xuXHRcdFxuXHRcdHZhciBpbnRlcnZhbCA9IHRoaXMuZ2V0KCdpbnRlcnZhbCcpO1xuXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDEyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdFxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCA3LCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogNykubW92ZVRvRGF5T2ZXZWVrKDEsIC0xKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDcpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiAzMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluLm1vdmVUb0ZpcnN0RGF5T2ZRdWFydGVyKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gMzAgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcblx0XHRcdGNlbGxXaWR0aCA9IDMwO1xuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2l6ZSAvIGR1cmF0aW9uO1xuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gZHBpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcblx0XHRcdGRwaSA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIwICogZHBpKTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xuXHRcdFx0fTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHR9XG5cdFx0dmFyIGhEYXRhID0ge1xuXHRcdFx0JzEnOiBbXSxcblx0XHRcdCcyJzogW10sXG5cdFx0XHQnMyc6IFtdXG5cdFx0fTtcblx0XHR2YXIgaGRhdGEzID0gW107XG5cdFx0XG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcblx0XHRcblx0XHRsYXN0ID0gc3RhcnQ7XG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR2YXIgZHVyZnVuYztcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGR1cmZ1bmMobGFzdCksXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogaW50ZXJ2YWxkYXlzLFxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcblx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHNhdHRyLmJvdW5kYXJ5TWF4ID0gZW5kID0gbGFzdDtcblx0XHRoRGF0YVsnMyddID0gaGRhdGEzO1xuXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBkYXRlIHRvIGVuZCBvZiB5ZWFyXG5cdFx0dmFyIGludGVyID0gRGF0ZS5kYXlzZGlmZihzdGFydCwgbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgMTEsIDMxKSk7XG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdHRleHQ6IHN0YXJ0LmdldEZ1bGxZZWFyKClcblx0XHR9KTtcblx0XHRmb3IoaSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCkgKyAxLCBpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7IGkgPCBpTGVuOyBpKyspe1xuXHRcdFx0aW50ZXIgPSBEYXRlLmlzTGVhcFllYXIoaSkgPyAzNjYgOiAzNjU7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGlcblx0XHRcdH0pO1xuXHRcdH1cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGxhc3QgeWVhciB1cHRvIGVuZCBkYXRlXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0aW50ZXIgPSBEYXRlLmRheXNkaWZmKG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCAwLCAxKSwgZW5kKTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdFx0dGV4dDogZW5kLmdldEZ1bGxZZWFyKClcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKHN0YXJ0LCBzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLFxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcblx0XHR9KTtcblx0XHRcblx0XHRqID0gc3RhcnQuZ2V0TW9udGgoKSArIDE7XG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG5cdFx0aUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpO1xuXHRcdHZhciBlbmRtb250aCA9IGVuZC5nZXRNb250aCgpO1xuXG5cdFx0d2hpbGUgKGkgPD0gaUxlbikge1xuXHRcdFx0d2hpbGUoaiA8IDEyKSB7XG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5nZXREYXlzSW5Nb250aChpLCBqKSxcblx0XHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoaiwgJ20nKVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aiArPSAxO1xuXHRcdFx0fVxuXHRcdFx0aSArPSAxO1xuXHRcdFx0aiA9IDA7XG5cdFx0fVxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGggJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xuXHR9LFxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xuXHR9LFxuXHRjcmVhdGVFbGVtOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWxlbXMgPSB7fSwgb2JqLCBjYWxsYmFjayA9IGZhbHNlLCBjb250ZXh0ID0gZmFsc2U7XG5cdFx0ZnVuY3Rpb24gYmluZFRleHRFdmVudHMoZWxlbWVudCwgb2JqLCBuYW1lKSB7XG5cdFx0XHRlbGVtZW50Lm9uKCdibHVyJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWUgPSAkdGhpcy52YWwoKTtcblx0XHRcdFx0JHRoaXMuZGV0YWNoKCk7XG5cdFx0XHRcdHZhciBjYWxsZnVuYyA9IGNhbGxiYWNrLCBjdHggPSBjb250ZXh0O1xuXHRcdFx0XHRjYWxsYmFjayA9IGZhbHNlO1xuXHRcdFx0XHRjb250ZXh0ID0gZmFsc2U7XG5cdFx0XHRcdGlmIChvYmoudDJkKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqLnQyZCh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FsbGZ1bmMuY2FsbChjdHgsbmFtZSx2YWx1ZSk7XG5cdFx0XHR9KS5vbigna2V5cHJlc3MnLGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRpZihldmVudC53aGljaD09PTEzKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdGZ1bmN0aW9uIGJpbmREYXRlRXZlbnRzKGVsZW1lbnQsb2JqLG5hbWUpe1xuXHRcdFx0ZWxlbWVudC5kYXRlcGlja2VyKHsgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLG9uQ2xvc2U6ZnVuY3Rpb24oKXtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2Nsb3NlIGl0Jyk7XG5cdFx0XHRcdHZhciAkdGhpcz0kKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWU9JHRoaXMudmFsKCk7XG5cdFx0XHRcdCR0aGlzLmRldGFjaCgpO1xuXHRcdFx0XHR2YXIgY2FsbGZ1bmM9Y2FsbGJhY2ssY3R4PWNvbnRleHQ7XG5cdFx0XHRcdGNhbGxiYWNrPWZhbHNlO1xuXHRcdFx0XHRjb250ZXh0PWZhbHNlO1xuXHRcdFx0XHRpZihvYmpbJ3QyZCddKSB7XG5cdFx0XHRcdFx0dmFsdWU9b2JqWyd0MmQnXSh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdFx0XHRjYWxsZnVuYy5jYWxsKGN0eCxuYW1lLHZhbHVlKTtcblx0XHRcdFx0fSwgMTApO1xuXHRcdFx0fX0pO1xuXHRcdH1cblx0XHRcblx0XHRmb3IodmFyIGkgaW4gdGhpcy5zZm9ybSl7XG5cdFx0XHRvYmo9dGhpcy5zZm9ybVtpXTtcblx0XHRcdGlmKG9iai5lZGl0YWJsZSl7XG5cdFx0XHRcdGlmKG9iai50eXBlPT09J3RleHQnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmRUZXh0RXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKG9iai50eXBlPT09J2RhdGUnKXtcblx0XHRcdFx0XHRlbGVtc1tpXT0kKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImNvbnRlbnQtZWRpdFwiPicpO1xuXHRcdFx0XHRcdGJpbmREYXRlRXZlbnRzKGVsZW1zW2ldLG9iaixpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFxuXHRcdH1cblxuXHRcdG9iaiA9IG51bGw7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLCBtb2RlbCwgY2FsbGZ1bmMsIGN0eCl7XG5cdFx0XHRjYWxsYmFjayA9IGNhbGxmdW5jO1xuXHRcdFx0Y29udGV4dCA9IGN0eDtcblx0XHRcdHZhciBlbGVtZW50PWVsZW1zW2ZpZWxkXSwgdmFsdWUgPSBtb2RlbC5nZXQoZmllbGQpO1xuXHRcdFx0aWYgKHRoaXMuc2Zvcm1bZmllbGRdLmQydCkge1xuXHRcdFx0XHR2YWx1ZSA9IHRoaXMuc2Zvcm1bZmllbGRdLmQydCh2YWx1ZSwgbW9kZWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxlbWVudC52YWwodmFsdWUpO1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQ7XG5cdFx0fTtcblx0XG5cdH0sXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRUb1RleHQ9e1xuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XG5cdFx0fTtcblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJccnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXHJccnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyICAgIGRlZmF1bHRzOiB7XHIgICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHIgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcciAgICAgICAgY29tcGxldGU6IDAsXHIgICAgICAgIGFjdGlvbjogJycsXHIgICAgICAgIHNvcnRpbmRleDogMCxcciAgICAgICAgZGVwZW5kZW5jeTonJyxcciAgICAgICAgcmVzb3VyY2VzOiB7fSxcciAgICAgICAgc3RhdHVzOiAxMTAsXHIgICAgICAgIGhlYWx0aDogMjEsXHIgICAgICAgIHN0YXJ0OiAnJyxcciAgICAgICAgZW5kOiAnJyxcciAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyICAgICAgICBXQlNfSUQgOiBwYXJhbXMucHJvZmlsZSxcciAgICAgICAgY29sb3I6JyMwMDkwZDMnLFxyICAgICAgICBsaWdodGNvbG9yOiAnI0U2RjBGRicsXHIgICAgICAgIGRhcmtjb2xvcjogJyNlODgxMzQnLFxyICAgICAgICBhVHlwZTogJycsXHIgICAgICAgIHJlcG9ydGFibGU6ICcnLFxyICAgICAgICBwYXJlbnRpZDogMFxyICAgIH0sXHIgICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyICAgICAgICBcInVzZSBzdHJpY3RcIjtcciAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgdGhpcy5fY2hlY2tUaW1lKTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHIgICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2Uuc3RhcnQpKXtcciAgICAgICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2Uuc3RhcnQpLCdkZC9NTS95eXl5JykgfHxcciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2Uuc3RhcnQpO1xyICAgICAgICB9IGVsc2Uge1xyICAgICAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSBuZXcgRGF0ZSgpO1xyICAgICAgICB9XHIgICAgICAgIFxyICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLmVuZCkpe1xyICAgICAgICAgICAgcmVzcG9uc2UuZW5kID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2UuZW5kKSwnZGQvTU0veXl5eScpIHx8XHIgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5lbmQpO1xyICAgICAgICB9IGVsc2Uge1xyICAgICAgICAgICAgcmVzcG9uc2UuZW5kID0gbmV3IERhdGUoKTtcciAgICAgICAgfVxyICAgICAgICByZXNwb25zZS5wYXJlbnRpZCA9IHBhcnNlSW50KHJlc3BvbnNlLnBhcmVudGlkIHx8ICcwJywgMTApO1xyXHIgICAgICAgIC8vIHJlbW92ZSBudWxsIHBhcmFtc1xyICAgICAgICBfLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHIgICAgICAgICAgICBpZiAoIXZhbCkge1xyICAgICAgICAgICAgICAgIHJlc3BvbnNlW2tleV0gPSB1bmRlZmluZWQ7XHIgICAgICAgICAgICB9XHIgICAgICAgIH0pO1xyICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHIgICAgfSxcciAgICBfY2hlY2tUaW1lIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyICAgICAgICAgICAgcmV0dXJuO1xyICAgICAgICB9XHIgICAgICAgIHZhciBzdGFydFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnc3RhcnQnKTtcciAgICAgICAgdmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XHIgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgdmFyIGNoaWxkU3RhcnRUaW1lID0gY2hpbGQuZ2V0KCdzdGFydCcpO1xyICAgICAgICAgICAgdmFyIGNoaWxkRW5kVGltZSA9IGNoaWxkLmdldCgnZW5kJyk7XHIgICAgICAgICAgICBpZihjaGlsZFN0YXJ0VGltZS5jb21wYXJlVG8oc3RhcnRUaW1lKSA9PT0gLTEpIHtcciAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZS5jb21wYXJlVG8oZW5kVGltZSkgPT09IDEpe1xyICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHIgICAgICAgICAgICB9XHIgICAgICAgIH0uYmluZCh0aGlzKSk7XHIgICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHIgICAgICAgIHRoaXMuc2V0KCdlbmQnLCBlbmRUaW1lKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHIiLCJ2YXIgbW9udGhzQ29kZT1bJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuXG5tb2R1bGUuZXhwb3J0cy5jb3JyZWN0ZGF0ZSA9IGZ1bmN0aW9uKHN0cikge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHN0cjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdGRhdGEgPSBmdW5jdGlvbih2YWwsIHR5cGUpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmICh0eXBlID09PSAnbScpIHtcblx0XHRyZXR1cm4gbW9udGhzQ29kZVt2YWxdO1xuXHR9XG5cdHJldHVybiB2YWw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5oZnVuYyA9IGZ1bmN0aW9uKHBvcykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHtcblx0XHR4OiBwb3MueCxcblx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdH07XG59O1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSB7XG5cdHZhciBwYXJhbXMgPSB7fTtcblx0dmFyIHBybWFyciA9IHBybXN0ci5zcGxpdCgnJicpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHBybWFyci5sZW5ndGg7IGkrKykge1xuXHRcdHZhciB0bXBhcnIgPSBwcm1hcnJbaV0uc3BsaXQoJz0nKTtcblx0XHRwYXJhbXNbdG1wYXJyWzBdXSA9IHRtcGFyclsxXTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRVUkxQYXJhbXMgPSBmdW5jdGlvbigpIHtcblx0dmFyIHBybXN0ciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xuXHRyZXR1cm4gcHJtc3RyICE9PSBudWxsICYmIHBybXN0ciAhPT0gJycgPyB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSA6IHt9O1xufTtcblxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAwMi4xMi4yMDE0LlxyXG4gKi9cclxuXHJcbnZhciB0ZW1wbGF0ZSA9IFwiPGRpdiBjbGFzcz1cXFwidWkgc21hbGwgbW9kYWwgYWRkLW5ldy10YXNrIGZsaXBcXFwiPlxcclxcbiAgICA8aSBjbGFzcz1cXFwiY2xvc2UgaWNvblxcXCI+PC9pPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJoZWFkZXJcXFwiPlxcclxcbiAgICA8L2Rpdj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiY29udGVudFxcXCI+XFxyXFxuICAgICAgICA8Zm9ybSBpZD1cXFwibmV3LXRhc2stZm9ybVxcXCIgYWN0aW9uPVxcXCIvXFxcIiB0eXBlPVxcXCJQT1NUXFxcIj5cXHJcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ1aSBmb3JtIHNlZ21lbnRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8cD5MZXQncyBnbyBhaGVhZCBhbmQgc2V0IGEgbmV3IGdvYWwuPC9wPlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+VGFzayBuYW1lPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBuYW1lPVxcXCJuYW1lXFxcIiBwbGFjZWhvbGRlcj1cXFwiTmV3IHRhc2sgbmFtZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+RGlzY3JpcHRpb248L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPHRleHRhcmVhIG5hbWU9XFxcImRlc2NyaXB0aW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiVGhlIGRldGFpbGVkIGRlc2NyaXB0aW9uIG9mIHlvdXIgdGFza1xcXCI+PC90ZXh0YXJlYT5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5TZWxlY3QgcGFyZW50PC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwidWkgZHJvcGRvd24gc2VsZWN0aW9uXFxcIj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCBuYW1lPVxcXCJwYXJlbnRpZFxcXCIgY2xhc3M9XFxcInVpIGRyb3Bkb3duXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZCByZXNvdXJjZXNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5Bc3NpZ24gUmVzb3VyY2VzPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlN0YXJ0IERhdGU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJkYXRlXFxcIiBuYW1lPVxcXCJzdGFydFxcXCIgcGxhY2Vob2xkZXI9XFxcIlN0YXJ0IERhdGVcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkVuZCBEYXRlPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiZGF0ZVxcXCIgbmFtZT1cXFwiZW5kXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW5kIERhdGVcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJjb21wbGV0ZVxcXCIgdmFsdWU9XFxcIjBcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJhY3Rpb25cXFwiIHZhbHVlPVxcXCJhZGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJkZXBlbmRlbmN5XFxcIiB2YWx1ZT1cXFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiYVR5cGVcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJoZWFsdGhcXFwiIHZhbHVlPVxcXCIyMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImNvbG9yXFxcIiB2YWx1ZT1cXFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwibWlsZXN0b25lXFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImRlbGl2ZXJhYmxlXFxcIiB2YWx1ZT1cXFwiMFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInJlcG9ydGFibGVcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwic29ydGluZGV4XFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImluc2VydFBvc1xcXCIgdmFsdWU9XFxcInNldFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInJlZmVyZW5jZV9pZFxcXCIgdmFsdWU9XFxcIi0xXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlN0YXR1czwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidWkgZmx1aWQgc2VsZWN0aW9uIGRyb3Bkb3duXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwic3RhdHVzXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZGVmYXVsdCB0ZXh0XFxcIj5TdGF0dXM8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcImRyb3Bkb3duIGljb25cXFwiPjwvaT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwibWVudVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMDhcXFwiPlJlYWR5PC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMDlcXFwiPk9wZW48L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiIGRhdGEtdmFsdWU9XFxcIjExMFxcXCI+Q29tcGxldGVkPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkR1cmF0aW9uPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwibnVtYmVyXFxcIiBtaW49XFxcIjBcXFwiIG5hbWU9XFxcImR1cmF0aW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiUHJvamVjdCBEdXJhdGlvblxcXCIgcmVxdWlyZWQgcmVhZG9ubHk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XFxcInN1Ym1pdEZvcm1cXFwiIGNsYXNzPVxcXCJ1aSBibHVlIHN1Ym1pdCBwYXJlbnQgYnV0dG9uXFxcIj5TdWJtaXQ8L2J1dHRvbj5cXHJcXG4gICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgIDwvZm9ybT5cXHJcXG4gICAgPC9kaXY+XFxyXFxuPC9kaXY+XCI7XHJcblxyXG52YXIgZGVtb1Jlc291cmNlcyA9IFt7XCJ3YnNpZFwiOjEsXCJyZXNfaWRcIjoxLFwicmVzX25hbWVcIjpcIkpvZSBCbGFja1wiLFwicmVzX2FsbG9jYXRpb25cIjo2MH0se1wid2JzaWRcIjozLFwicmVzX2lkXCI6MixcInJlc19uYW1lXCI6XCJKb2huIEJsYWNrbW9yZVwiLFwicmVzX2FsbG9jYXRpb25cIjo0MH1dO1xyXG5cclxudmFyIEFkZEZvcm1WaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6IGRvY3VtZW50LmJvZHksXHJcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgICAnY2xpY2sgLm5ldy10YXNrJzogJ29wZW5Gb3JtJyxcclxuICAgICAgICAnY2xpY2sgI3N1Ym1pdEZvcm0nOiAnc3VibWl0Rm9ybSdcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kKHRoaXMudGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVGb3JtKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFJlc291cmNlcygpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgdGhpcy5fc2V0dXBQYXJlbnRTZWxlY3Rvcik7XHJcbiAgICB9LFxyXG4gICAgX2luaXRSZXNvdXJjZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBSZXNvdXJjZXMgZnJvbSBiYWNrZW5kXHJcbiAgICAgICAgdmFyICRyZXNvdXJjZXMgPSAnPHNlbGVjdCBpZD1cInJlc291cmNlc1wiICBuYW1lPVwicmVzb3VyY2VzW11cIiBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JztcclxuICAgICAgICBkZW1vUmVzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICRyZXNvdXJjZXMgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgcmVzb3VyY2UucmVzX2lkICsgJ1wiPicgKyByZXNvdXJjZS5yZXNfbmFtZSArICc8L29wdGlvbj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRyZXNvdXJjZXMgKz0gJzwvc2VsZWN0Pic7XHJcbiAgICAgICAgLy8gYWRkIGJhY2tlbmQgdG8gdGhlIHRhc2sgbGlzdFxyXG4gICAgICAgICQoJy5yZXNvdXJjZXMnKS5hcHBlbmQoJHJlc291cmNlcyk7XHJcblxyXG4gICAgICAgIC8vIGluaXRpYWxpemUgbXVsdGlwbGUgc2VsZWN0b3JzXHJcbiAgICAgICAgJCgnI3Jlc291cmNlcycpLmNob3Nlbih7d2lkdGg6ICc5NSUnfSk7XHJcbiAgICB9LFxyXG4gICAgX2Zvcm1WYWxpZGF0aW9uUGFyYW1zIDoge1xyXG4gICAgICAgIG5hbWU6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ25hbWUnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIGVudGVyIGEgdGFzayBuYW1lJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wbGV0ZToge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnY29tcGxldGUnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIGVudGVyIGFuIGVzdGltYXRlIGRheXMnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXJ0OiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdzdGFydCcsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGEgc3RhcnQgZGF0ZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5kOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdlbmQnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhbiBlbmQgZGF0ZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHVyYXRpb246IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYSB2YWxpZCBkdXJhdGlvbidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhdHVzOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdzdGF0dXMnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNlbGVjdCBhIHN0YXR1cydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZUZvcm0gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcubWFzdGhlYWQgLmluZm9ybWF0aW9uJykudHJhbnNpdGlvbignc2NhbGUgaW4nKTtcclxuICAgICAgICAkKCcudWkuZm9ybScpLmZvcm0odGhpcy5fZm9ybVZhbGlkYXRpb25QYXJhbXMpO1xyXG4gICAgICAgIC8vIGFzc2lnbiByYW5kb20gcGFyZW50IGNvbG9yXHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImNvbG9yXCJdJykudmFsKCcjJytNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTY3NzcyMTUpLnRvU3RyaW5nKDE2KSk7XHJcbiAgICB9LFxyXG4gICAgX3NldHVwUGFyZW50U2VsZWN0b3IgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgJHNlbGVjdG9yID0gJCgnW25hbWU9XCJwYXJlbnRpZFwiXScpO1xyXG4gICAgICAgICRzZWxlY3Rvci5lbXB0eSgpO1xyXG4gICAgICAgICRzZWxlY3Rvci5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCIwXCI+TWFpbiBQcm9qZWN0PC9vcHRpb24+Jyk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSBwYXJzZUludCh0YXNrLmdldCgncGFyZW50aWQnKSwgMTApO1xyXG4gICAgICAgICAgICBpZihwYXJlbnRJZCA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIHRhc2suaWQgKyAnXCI+JyArIHRhc2suZ2V0KCduYW1lJykgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCdzZWxlY3QuZHJvcGRvd24nKS5kcm9wZG93bigpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIC8vIGluaXRpYWxpemUgZHJvcGRvd25cclxuICAgICAgICB0aGlzLl9zZXR1cFBhcmVudFNlbGVjdG9yKCk7XHJcbiAgICB9LFxyXG4gICAgb3BlbkZvcm06IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy51aS5hZGQtbmV3LXRhc2snKS5tb2RhbCgnc2V0dGluZycsICd0cmFuc2l0aW9uJywgJ3ZlcnRpY2FsIGZsaXAnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgfSxcclxuICAgIHN1Ym1pdEZvcm06IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgZm9ybSA9ICQoXCIjbmV3LXRhc2stZm9ybVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAkKGZvcm0pLnNlcmlhbGl6ZUFycmF5KCkuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgICBkYXRhW2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgICAgICBpZiAocmVmX21vZGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnNlcnRQb3MgPSBkYXRhLmluc2VydFBvcztcclxuICAgICAgICAgICAgc29ydGluZGV4ID0gcmVmX21vZGVsLmdldCgnc29ydGluZGV4JykgKyAoaW5zZXJ0UG9zID09PSAnYWJvdmUnID8gLTAuNSA6IDAuNSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc29ydGluZGV4ID0gKHRoaXMuY29sbGVjdGlvbi5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLnNvcnRpbmRleCA9IHNvcnRpbmRleDtcclxuXHJcbiAgICAgICAgaWYgKGZvcm0uZ2V0KDApLmNoZWNrVmFsaWRpdHkoKSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciB0YXNrID0gdGhpcy5jb2xsZWN0aW9uLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICAgICAgICAgIHRhc2suc2F2ZSgpO1xyXG4gICAgICAgICAgICAkKCcudWkubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFkZEZvcm1WaWV3OyIsInZhciBDb250ZXh0TWVudVZpZXcgPSByZXF1aXJlKCcuL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3Jyk7XHJ2YXIgVGFza1ZpZXcgPSByZXF1aXJlKCcuL3NpZGVCYXIvVGFza1ZpZXcnKTtccnZhciBLQ2FudmFzVmlldyA9IHJlcXVpcmUoJy4vY2FudmFzL0tDYW52YXNWaWV3Jyk7XHJ2YXIgQWRkRm9ybVZpZXcgPSByZXF1aXJlKCcuL0FkZEZvcm1WaWV3Jyk7XHJ2YXIgVG9wTWVudVZpZXcgPSByZXF1aXJlKCcuL1RvcE1lbnVWaWV3Jyk7XHJccnZhciBHYW50dFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHIgICAgZWw6ICcuR2FudHQnLFxyICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyICAgICAgICB0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy50YXNrLWNvbnRhaW5lcicpO1xyXHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHIgICAgICAgIHRoaXMubWFrZVNvcnRhYmxlKCk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh0aGlzLmFwcCkucmVuZGVyKCk7XHJcciAgICAgICAgbmV3IEFkZEZvcm1WaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgbmV3IFRvcE1lbnVWaWV3KHtcciAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0ZWQgYWRkJywgZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLiRjb250YWluZXIuZW1wdHkoKTtcciAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgbWFrZVNvcnRhYmxlOiBmdW5jdGlvbigpIHtcciAgICAgICAgdGhpcy4kY29udGFpbmVyLnNvcnRhYmxlKHtcciAgICAgICAgICAgIGdyb3VwOiAnc29ydGFibGUnLFxyICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3IgOiAnb2wnLFxyICAgICAgICAgICAgaXRlbVNlbGVjdG9yIDogJy5kcmFnLWl0ZW0nLFxyICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXIgc29ydC1wbGFjZWhvbGRlclwiLz4nLFxyICAgICAgICAgICAgb25EcmFnIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHIgICAgICAgICAgICAgICAgdmFyICRwbGFjZWhvbGRlciA9ICQoJy5zb3J0LXBsYWNlaG9sZGVyJyk7XHIgICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XHIgICAgICAgICAgICAgICAgJHBsYWNlaG9sZGVyLmNzcyh7XHIgICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnIDogaXNTdWJUYXNrID8gJzMwcHgnIDogJzAnXHIgICAgICAgICAgICAgICAgfSk7XHIgICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHIgICAgICAgICAgICB9LmJpbmQodGhpcyksXHIgICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcciAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcciAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuJGNvbnRhaW5lci5zb3J0YWJsZShcInNlcmlhbGl6ZVwiKS5nZXQoKVswXTtcciAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24ocGFyZW50RGF0YSkge1xyICAgICAgICAgICAgICAgICAgICBwYXJlbnREYXRhLmNoaWxkcmVuID0gcGFyZW50RGF0YS5jaGlsZHJlbiA/IHBhcmVudERhdGEuY2hpbGRyZW5bMF0gOiBbXTtcciAgICAgICAgICAgICAgICB9KTtcciAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgZXZlbnRzOiB7XHIgICAgICAgICdjbGljayAjdEhhbmRsZSc6ICdleHBhbmQnLFxyICAgICAgICAnZGJsY2xpY2sgLnN1Yi10YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcciAgICAgICAgJ2RibGNsaWNrIC50YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcciAgICAgICAgJ2hvdmVyIC5zdWItdGFzayc6ICdzaG93TWFzaydcciAgICB9LFxyICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcciAgICAgICAgICAgIGlmICh0YXNrLmdldCgncGFyZW50aWQnKS50b1N0cmluZygpID09PSAnMCcpIHtcciAgICAgICAgICAgICAgICB0aGlzLmFkZFRhc2sodGFzayk7XHIgICAgICAgICAgICB9XHIgICAgICAgIH0sIHRoaXMpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcgPSBuZXcgS0NhbnZhc1ZpZXcoe1xyICAgICAgICAgICAgYXBwIDogdGhpcy5hcHAsXHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyICAgICAgICB0aGlzLm1ha2VTb3J0YWJsZSgpO1xyICAgIH0sXHIgICAgaGFuZGxlcm93Y2xpY2s6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgaWQgPSBldnQuY3VycmVudFRhcmdldC5pZDtcciAgICAgICAgdGhpcy5hcHAudGFza3MuZ2V0KGlkKS50cmlnZ2VyKCdlZGl0cm93JywgZXZ0KTtcciAgICB9LFxyICAgIGNhbGN1bGF0ZUR1cmF0aW9uOiBmdW5jdGlvbigpe1xyXHIgICAgICAgIC8vIENhbGN1bGF0aW5nIHRoZSBkdXJhdGlvbiBmcm9tIHN0YXJ0IGFuZCBlbmQgZGF0ZVxyICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cInN0YXJ0XCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgZW5kZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHIgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPT0gXCJcIiAmJiBlbmRkYXRlICE9PSBcIlwiKXtcciAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgIHZhciB1dGMyID0gRGF0ZS5VVEMoZW5kZGF0ZS5nZXRGdWxsWWVhcigpLCBlbmRkYXRlLmdldE1vbnRoKCksIGVuZGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyICAgICAgICB9ZWxzZXtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKDApKTtcciAgICAgICAgfVxyICAgIH0sXHIgICAgZXhwYW5kOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIHRhcmdldCA9ICQoZXZ0LnRhcmdldCk7XHIgICAgICAgIHZhciB3aWR0aCA9IDA7XHIgICAgICAgIHZhciBzZXR0aW5nID0gdGhpcy5hcHAuc2V0dGluZ3MuZ2V0U2V0dGluZygnZGlzcGxheScpO1xyICAgICAgICBpZiAodGFyZ2V0Lmhhc0NsYXNzKCdjb250cmFjdCcpKSB7XHIgICAgICAgICAgICB3aWR0aCA9IHNldHRpbmcudEhpZGRlbldpZHRoO1xyICAgICAgICB9XHIgICAgICAgIGVsc2Uge1xyICAgICAgICAgICAgd2lkdGggPSBzZXR0aW5nLnRhYmxlV2lkdGg7XHIgICAgICAgIH1cciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgd2lkdGgpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuc2V0V2lkdGgoc2V0dGluZy5zY3JlZW5XaWR0aCAtIHdpZHRoIC0gMjApO1xyICAgICAgICB0YXJnZXQudG9nZ2xlQ2xhc3MoJ2NvbnRyYWN0Jyk7XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuZmluZCgnLm1lbnUtaGVhZGVyJykudG9nZ2xlQ2xhc3MoJ21lbnUtaGVhZGVyLW9wZW5lZCcpO1xyXHIgICAgfSxcciAgICBhZGRUYXNrOiBmdW5jdGlvbih0YXNrKSB7XHIgICAgICAgIHZhciB0YXNrVmlldyA9IG5ldyBUYXNrVmlldyh7bW9kZWw6IHRhc2ssIGFwcCA6IHRoaXMuYXBwfSk7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQodGFza1ZpZXcucmVuZGVyKCkuZWwpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IEdhbnR0VmlldztcciIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMDguMTIuMjAxNC5cclxuICovXHJcblxyXG52YXIgVG9wTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcuaGVhZC1iYXInLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayBidXR0b24nOiAnb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQnLFxyXG4gICAgICAgICdjbGljayBhW2hyZWY9XCIvIyEvZ2VuZXJhdGUvXCJdJzogJ2dlbmVyYXRlUERGJ1xyXG4gICAgfSxcclxuICAgIG9uSW50ZXJ2YWxCdXR0b25DbGlja2VkIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIHZhciBhY3Rpb24gPSBidXR0b24uZGF0YSgnYWN0aW9uJyk7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gYWN0aW9uLnNwbGl0KCctJylbMV07XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUERGIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgd2luZG93LnByaW50KCk7XHJcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb3BNZW51VmlldztcclxuIiwiXHR2YXIgZGQ9S2luZXRpYy5ERDtcblx0dmFyIGJhck9wdGlvbnM9WydkcmFnZ2FibGUnLCdkcmFnQm91bmRGdW5jJywncmVzaXphYmxlJywncmVzaXplQm91bmRGdW5jJywnaGVpZ2h0Jywnd2lkdGgnLCd4JywneSddO1xuXG5cdHZhciBjYWxjdWxhdGluZz1mYWxzZTtcblx0ZnVuY3Rpb24gY3JlYXRlSGFuZGxlKG9wdGlvbil7XG5cdFx0b3B0aW9uLmRyYWdnYWJsZT10cnVlO1xuXHRcdG9wdGlvbi5vcGFjaXR5PTE7XG5cdFx0b3B0aW9uLnN0cm9rZUVuYWJsZWQ9ZmFsc2U7XG5cdFx0b3B0aW9uLndpZHRoPTI7XG5cdFx0b3B0aW9uLmZpbGw9J2JsYWNrJztcblx0XHRyZXR1cm4gbmV3IEtpbmV0aWMuUmVjdChvcHRpb24pO1xuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZVN1Ykdyb3VwKG9wdGlvbil7XG5cdFx0dmFyIGdyPW5ldyBLaW5ldGljLkdyb3VwKCk7XG5cdFx0dmFyIGltZ3JlY3Q9bmV3IEtpbmV0aWMuUmVjdCh7XG5cdFx0XHR4OjAsXG5cdFx0XHR5OjAsXG5cdFx0XHRoZWlnaHQ6IG9wdGlvbi5oZWlnaHQsXG5cdFx0XHR3aWR0aDogMjAsXG5cdFx0XHRzdHJva2VFbmFibGVkOmZhbHNlLFxuXHRcdFx0ZmlsbDoneWVsbG93Jyxcblx0XHRcdG9wYWNpdHk6MC41XG5cdFx0fSk7XG5cdFx0dmFyIGFuY2hvcj1uZXcgS2luZXRpYy5DaXJjbGUoe1xuXHRcdFx0eDoxMCxcblx0XHRcdHk6NSxcblx0XHRcdHJhZGl1czogMyxcblx0XHRcdHN0cm9rZVdpZHRoOjEsXG5cdFx0XHRuYW1lOiAnYW5jaG9yJyxcblx0XHRcdHN0cm9rZTonYmxhY2snLFxuXHRcdFx0ZmlsbDond2hpdGUnLFxuXHRcdH0pO1xuXG5cdFx0dmFyIG5hbWVyZWN0PW5ldyBLaW5ldGljLlJlY3Qoe1xuXHRcdFx0eDoyMCxcblx0XHRcdHk6MCxcblx0XHRcdGhlaWdodDogb3B0aW9uLmhlaWdodCxcblx0XHRcdHdpZHRoOiA0MCxcblx0XHRcdHN0cm9rZUVuYWJsZWQ6ZmFsc2UsXG5cdFx0XHRmaWxsOidwaW5rJyxcblx0XHR9KTtcblx0XHRnci5hZGQoaW1ncmVjdCk7XG5cdFx0Z3IuYWRkKGFuY2hvcik7XG5cdFx0Z3IuYWRkKG5hbWVyZWN0KTtcblx0XHRyZXR1cm4gZ3I7XG5cdH1cblxuXHR2YXIgYmVmb3JlYmluZD1mdW5jdGlvbihmdW5jKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGNhbGN1bGF0aW5nKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYWxjdWxhdGluZz10cnVlO1xuXHRcdFx0ZnVuYy5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG5cdFx0XHRjYWxjdWxhdGluZz1mYWxzZTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREcmFnRGlyKHN0YWdlKXtcblx0XHRyZXR1cm4gKHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLngtZGQuc3RhcnRQb2ludGVyUG9zLng+MCk/J3JpZ2h0JzonbGVmdCc7XG5cdH1cblxuXHR2YXIgQmFyPWZ1bmN0aW9uKG9wdGlvbnMpe1xuXHRcdHRoaXMubW9kZWw9b3B0aW9ucy5tb2RlbDtcblx0XHR0aGlzLnNldHRpbmdzID0gb3B0aW9ucy5zZXR0aW5ncztcblxuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpjb21wbGV0ZScsIHRoaXMuX3VwZGF0ZUNvbXBsZXRlQmFyKTtcblx0XHRcblx0XHR2YXIgc2V0dGluZyA9IHRoaXMuc2V0dGluZyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYmFyJyk7XG5cdFx0Ly90aGlzLmJhcmlkID0gXy51bmlxdWVJZCgnYicpO1xuXHRcdHRoaXMuc3ViZ3JvdXBvcHRpb25zPXtcblx0XHRcdHNob3dPbkhvdmVyOiB0cnVlLFxuXHRcdFx0aGlkZU9uSG92ZXJPdXQ6dHJ1ZSxcblx0XHRcdGhhc1N1Ykdyb3VwOiBmYWxzZSxcblx0XHR9O1xuXHRcdFxuXHRcdHRoaXMuZGVwZW5kYW50cz1bXTtcblx0XHR0aGlzLmRlcGVuZGVuY2llcz1bXTtcblx0XHRcblx0XHQvKnZhciBvcHRpb249e1xuXHRcdFx0eCA6IHJlY3RvcHRpb25zLngsXG5cdFx0XHR5OiByZWN0b3B0aW9ucy55XG5cdFx0fVxuXHRcdHJlY3RvcHRpb25zLng9MDtcblx0XHRyZWN0b3B0aW9ucy55PTA7XG5cdFx0cmVjdG9wdGlvbnMubmFtZT0nbWFpbmJhcic7Ki9cblxuXHRcdC8vIGNvbG9yaW5nIHNlY3Rpb25cblx0XHR2YXIgcGFyZW50TW9kZWwgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZ2V0KHRoaXMubW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHR0aGlzLnNldHRpbmcucmVjdG9wdGlvbi5maWxsID0gcGFyZW50TW9kZWwuZ2V0KCdsaWdodGNvbG9yJyk7XHRcdFxuXHRcdHRoaXMuZ3JvdXA9bmV3IEtpbmV0aWMuR3JvdXAodGhpcy5nZXRHcm91cFBhcmFtcygpKTtcblx0XHQvL3JlbW92ZSB0aGUgc3Ryb2tlRW5hYmxlZCBpZiBub3QgcHJvdmlkZWQgaW4gb3B0aW9uXG5cdFx0Ly9yZWN0b3B0aW9ucy5zdHJva2VFbmFibGVkPWZhbHNlO1xuXG5cdFx0dmFyIHJlY3QgPSB0aGlzLnJlY3QgID1uZXcgS2luZXRpYy5SZWN0KHRoaXMuZ2V0UmVjdHBhcmFtcygpKTtcblx0XHR0aGlzLmdyb3VwLmFkZChyZWN0KTtcblx0XHRcblx0XHRpZihzZXR0aW5nLnN1Ymdyb3VwKXtcblx0XHRcdHRoaXMuYWRkU3ViZ3JvdXAoKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYoc2V0dGluZy5kcmFnZ2FibGUpe1xuXHRcdFx0dGhpcy5tYWtlRHJhZ2dhYmxlKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKHNldHRpbmcucmVzaXphYmxlKXtcblx0XHRcdHRoaXMubWFrZVJlc2l6YWJsZSgpO1xuXHRcdH1cblxuXHRcdHZhciBsZWZ0eD10aGlzLmxlZnRIYW5kbGUuZ2V0WCgpO1xuXHRcdHZhciB3PXRoaXMucmlnaHRIYW5kbGUuZ2V0WCgpLWxlZnR4KzI7XG5cdFx0dmFyIHdpZHRoID0gKCAoIHcgKSAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCkgKTtcblx0XHR0aGlzLnNldHRpbmcucmVjdG9wdGlvbi5maWxsID0gcGFyZW50TW9kZWwuZ2V0KCdkYXJrY29sb3InKTtcblx0XHRvcHQgPSAgdGhpcy5nZXRSZWN0cGFyYW1zKCk7XG5cdFx0b3B0LnggPSAyO1xuXHRcdG9wdC53aWR0aCA9IHdpZHRoLTQ7XG5cdFx0dmFyIGNvbXBsZXRlQmFyPSB0aGlzLmNvbXBsZXRlQmFyID0gbmV3IEtpbmV0aWMuUmVjdChvcHQpO1xuXHRcdHRoaXMuZ3JvdXAuYWRkKGNvbXBsZXRlQmFyKTtcblx0XHRpZiAod2lkdGggPT09IDApIHtcblx0XHRcdGNvbXBsZXRlQmFyLmhpZGUoKTtcblx0XHR9XG5cblx0XHQvL2FkZEV2ZW50c1xuXHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHRcdC8vdGhpcy5vbigncmVzaXplIG1vdmUnLHRoaXMucmVuZGVyQ29ubmVjdG9ycyx0aGlzKTs7XG5cdH07XG5cblx0QmFyLnByb3RvdHlwZT17XG5cdFx0X3VwZGF0ZUNvbXBsZXRlQmFyIDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbGVmdHg9dGhpcy5sZWZ0SGFuZGxlLmdldFgoKTtcblx0XHRcdHZhciB3ID0gdGhpcy5yaWdodEhhbmRsZS5nZXRYKCkgLSBsZWZ0eCsyO1xuXHRcdFx0dmFyIHdpZHRoID0gKCAoIHcgKSAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCkgKSAtIDQ7XG5cblx0XHRcdGlmKHdpZHRoID4gMCl7XG5cdFx0XHRcdHRoaXMuY29tcGxldGVCYXIud2lkdGgod2lkdGgpO1xuXHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLnNob3coKTtcblx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly9yZXRyaWV2ZXMgb25seSB3aWR0aCxoZWlnaHQseCx5IHJlbGF0aXZlIHRvIHBvaW50IDAsMCBvbiBjYW52YXM7XG5cdFx0Z2V0WDE6IGZ1bmN0aW9uKGFic29sdXRlKXtcblx0XHRcdHZhciByZXR2YWw9MDtcblx0XHRcdGlmKGFic29sdXRlICYmIHRoaXMucGFyZW50KSByZXR2YWw9dGhpcy5wYXJlbnQuZ2V0WCgpO1xuXHRcdFx0cmV0dXJuIHJldHZhbCt0aGlzLmdyb3VwLmdldFgoKTtcblx0XHR9LFxuXHRcdGdldFgyOiBmdW5jdGlvbihhYnNvbHV0ZSl7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRYMShhYnNvbHV0ZSkrdGhpcy5nZXRXaWR0aCgpO1xuXHRcdH0sXG5cdFx0Z2V0WDpmdW5jdGlvbihhYnNvbHV0ZSl7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB0aGlzLmdldFgxKGFic29sdXRlKSxcblx0XHRcdFx0eTogdGhpcy5nZXRYMihhYnNvbHV0ZSlcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRZOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXAuZ2V0WSgpO1xuXHRcdH0sXG5cdFx0Z2V0SGVpZ2h0OiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMucmVjdC5nZXRIZWlnaHQoKTtcblx0XHR9LFxuXHRcdGdldFdpZHRoOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMucmVjdC5nZXRXaWR0aCgpO1xuXHRcdH0sXG5cdFx0XG5cdFx0c2V0WDE6ZnVuY3Rpb24odmFsdWUsb3B0aW9ucyl7XG5cdFx0XHQhb3B0aW9ucyAmJiAob3B0aW9ucz17fSlcblx0XHRcdHZhciBwcmV2eCx3aWR0aCxkeDtcblxuXHRcdFx0Ly9pZiB2YWx1ZSBpcyBpbiBhYnNvbHV0ZSBzZW5zZSB0aGVuIG1ha2UgaXQgcmVsYXRpdmUgdG8gcGFyZW50XG5cdFx0XHRpZihvcHRpb25zLmFic29sdXRlICYmIHRoaXMucGFyZW50KXtcblx0XHRcdFx0dmFsdWU9dmFsdWUtdGhpcy5wYXJlbnQuZ2V0WCh0cnVlKTtcblx0XHRcdH1cblx0XHRcdHByZXZ4PXRoaXMuZ2V0WDEoKTtcblx0XHRcdC8vZHggK3ZlIG1lYW5zIGJhciBtb3ZlZCBsZWZ0IFxuXHRcdFx0ZHg9cHJldngtdmFsdWU7XG5cdFx0XHRcblx0XHRcdHZhciBzaWxlbnQ9b3B0aW9ucy5zaWxlbnQgfHwgb3B0aW9ucy5vc2FtZTtcblx0XHRcdFxuXHRcdFx0dGhpcy5tb3ZlKC0xKmR4LHNpbGVudCk7XG5cdFx0XHQvL2lmIHgyIGhhcyB0byByZW1haW4gc2FtZVxuXHRcdFx0Ly8gRHJhdyBwZXJjZW50YWdlIGNvbXBsZXRlZFxuXHRcdFx0aWYob3B0aW9ucy5vc2FtZSl7XG5cdFx0XHRcdHRoaXMucmVjdC5zZXRXaWR0aChkeCt0aGlzLmdldFdpZHRoKCkpO1xuXHRcdFx0XHR2YXIgd2lkdGggPSggdGhpcy5nZXRXaWR0aCgpICogKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwKSApLTQ7XG5cdFx0XHRcdGlmKHdpZHRoID4gMClcblx0XHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLnNldFdpZHRoKHdpZHRoKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJIYW5kbGUoKTtcblx0XHRcdFx0aWYoIW9wdGlvbnMuc2lsZW50KXtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZWxlZnQnLHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplJyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcblx0XHR9LFxuXHRcdHNldFgyOmZ1bmN0aW9uKHZhbHVlLG9wdGlvbnMpe1xuXHRcdFx0dmFyIHByZXZ4LHdpZHRoLGR4O1xuXHRcdFx0Ly9pZiB2YWx1ZSBpcyBpbiBhYnNvbHV0ZSBzZW5zZSB0aGVuIG1ha2UgaXQgcmVsYXRpdmUgdG8gcGFyZW50XG5cdFx0XHRpZihvcHRpb25zLmFic29sdXRlICYmIHRoaXMucGFyZW50KXtcblx0XHRcdFx0dmFsdWU9dmFsdWUtdGhpcy5wYXJlbnQuZ2V0WCh0cnVlKTtcblx0XHRcdH1cblx0XHRcdHByZXZ4PXRoaXMuZ2V0WDIoKTtcblx0XHRcdC8vZHggLXZlIG1lYW5zIGJhciBtb3ZlZCByaWdodCBcblx0XHRcdGR4PXByZXZ4LXZhbHVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgc2lsZW50PW9wdGlvbnMuc2lsZW50IHx8IG9wdGlvbnMub3NhbWU7XG5cdFx0XHQvL3RoaXMuZ3JvdXAuc2V0WCh2YWx1ZSk7XG5cdFx0XHQvL2lmIHgyIGhhcyB0byByZW1haW4gc2FtZVxuXHRcdFx0aWYob3B0aW9ucy5vc2FtZSl7XG5cdFx0XHRcdHRoaXMucmVjdC5zZXRXaWR0aCh0aGlzLmdldFdpZHRoKCktZHgpO1xuXHRcdFx0XHR2YXIgd2lkdGggPSggdGhpcy5nZXRXaWR0aCgpICogKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwKSApLTQ7XG5cdFx0XHRcdGlmKHdpZHRoID4gMClcblx0XHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLnNldFdpZHRoKHdpZHRoKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJIYW5kbGUoKTtcblx0XHRcdFx0aWYoIW9wdGlvbnMuc2lsZW50KXtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZXJpZ2h0Jyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScsdGhpcyk7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyUGFyZW50KCdyZXNpemUnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0dGhpcy5tb3ZlKC0xKmR4LG9wdGlvbnMuc2lsZW50KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZW5hYmxlU3ViZ3JvdXAoKTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0c2V0WTpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHR0aGlzLmdyb3VwLnNldFkodmFsdWUpO1xuXHRcdH0sXG5cdFx0c2V0UGFyZW50OmZ1bmN0aW9uKHBhcmVudCl7XG5cdFx0XHR0aGlzLnBhcmVudD1wYXJlbnQ7XG5cblx0XHR9LFxuXHRcdHRyaWdnZXJQYXJlbnQ6ZnVuY3Rpb24oZXZlbnROYW1lKXtcblx0XHRcdGlmKHRoaXMucGFyZW50KXtcblx0XHRcdFx0dGhpcy5wYXJlbnQudHJpZ2dlcihldmVudE5hbWUsdGhpcyk7XG5cdFx0XHR9XHRcdFx0XG5cdFx0fSxcblx0XHRiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dGhpcy5ncm91cC5vbignY2xpY2snLF8uYmluZCh0aGlzLmhhbmRsZUNsaWNrZXZlbnRzLHRoaXMpKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5ncm91cC5vbignbW91c2VvdmVyJyxmdW5jdGlvbigpe1xuXHRcdFx0XHRpZighdGhhdC5zdWJncm91cG9wdGlvbnMuc2hvd09uSG92ZXIpIHJldHVybjtcblx0XHRcdFx0dGhhdC5zdWJncm91cC5zaG93KCk7XG5cdFx0XHRcdHRoaXMuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuZ3JvdXAub24oJ21vdXNlb3V0JyxmdW5jdGlvbigpe1xuXHRcdFx0XHRpZighdGhhdC5zdWJncm91cG9wdGlvbnMuaGlkZU9uSG92ZXJPdXQpIHJldHVybjtcblx0XHRcdFx0dGhhdC5zdWJncm91cC5oaWRlKCk7XG5cdFx0XHRcdHRoaXMuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0dGhpcy5vbigncmVzaXplIG1vdmUnLHRoaXMucmVuZGVyQ29ubmVjdG9ycyx0aGlzKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLmRyYXcoKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5vbignY2hhbmdlJywgdGhpcy5oYW5kbGVDaGFuZ2UsIHRoaXMpO1xuXG5cdFx0fSxcblx0XHRkZXN0cm95IDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmdyb3VwLmRlc3Ryb3koKTtcblx0XHRcdHRoaXMuc3RvcExpc3RlbmluZygpO1xuXHRcdH0sXG5cdFx0aGFuZGxlQ2hhbmdlOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgbW9kZWwgPSB0aGlzLm1vZGVsO1xuXHRcdFx0aWYodGhpcy5wYXJlbnQuc3luY2luZyl7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmKG1vZGVsLmNoYW5nZWQuc3RhcnQgfHwgbW9kZWwuY2hhbmdlZC5lbmQpe1xuXHRcdFx0XHR2YXIgeD10aGlzLmNhbGN1bGF0ZVgobW9kZWwpO1xuXHRcdFx0XHRpZihtb2RlbC5jaGFuZ2VkLnN0YXJ0KXtcblx0XHRcdFx0XHR0aGlzLnNldFgxKHgueDEse29zYW1lOnRydWUsYWJzb2x1dGU6dHJ1ZX0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0dGhpcy5zZXRYMih4LngyLHtvc2FtZTp0cnVlLGFic29sdXRlOnRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnBhcmVudC5zeW5jKCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zb2xlLmxvZygnZHJhd2luZycpO1xuXHRcdFx0dGhpcy5kcmF3KCk7XG5cdFx0fSxcblx0XHRoYW5kbGVDbGlja2V2ZW50czpmdW5jdGlvbihldnQpe1xuXHRcdFx0dmFyIHRhcmdldCx0YXJnZXROYW1lLHN0YXJ0QmFyO1xuXHRcdFx0dGFyZ2V0PWV2dC50YXJnZXQ7XG5cdFx0XHR0YXJnZXROYW1lPXRhcmdldC5nZXROYW1lKCk7XG5cdFx0XHR3aW5kb3cuc3RhcnRCYXI7XG5cdFx0XHRpZih0YXJnZXROYW1lIT09J21haW5iYXInKXtcblx0XHRcdFx0QmFyLmRpc2FibGVDb25uZWN0b3IoKTtcblx0XHRcdFx0aWYodGFyZ2V0TmFtZT09J2FuY2hvcicpe1xuXHRcdFx0XHRcdHRhcmdldC5zdHJva2UoJ3JlZCcpO1xuXHRcdFx0XHRcdEJhci5lbmFibGVDb25uZWN0b3IodGhpcyk7XG5cdFx0XHRcdFx0dmFyIGRlcHQgPSB0aGlzLm1vZGVsLmdldCgnZGVwZW5kZW5jeScpO1xuXHRcdFx0XHRcdGlmKGRlcHQgIT0gXCJcIil7XG5cdFx0XHRcdFx0XHR3aW5kb3cuY3VycmVudERwdC5wdXNoKHRoaXMubW9kZWwuZ2V0KCdkZXBlbmRlbmN5JykpO1x0XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHdpbmRvdy5jdXJyZW50RHB0KTtcblx0XHRcdFx0XHR3aW5kb3cuc3RhcnRCYXIgPSB0aGlzLm1vZGVsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRpZigoc3RhcnRCYXI9QmFyLmlzQ29ubmVjdG9yRW5hYmxlZCgpKSl7XG5cdFx0XHRcdFx0QmFyLmNyZWF0ZVJlbGF0aW9uKHN0YXJ0QmFyLHRoaXMpO1xuXHRcdFx0XHRcdHdpbmRvdy5jdXJyZW50RHB0LnB1c2godGhpcy5tb2RlbC5nZXQoJ2lkJykpO1xuXHRcdFx0XHRcdHdpbmRvdy5zdGFydEJhci5zZXQoJ2RlcGVuZGVuY3knLCBKU09OLnN0cmluZ2lmeSh3aW5kb3cuY3VycmVudERwdCkpO1xuXHRcdFx0XHRcdHdpbmRvdy5zdGFydEJhci5zYXZlKCk7XG5cdFx0XHRcdFx0QmFyLmRpc2FibGVDb25uZWN0b3IoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZXZ0LmNhbmNlbEJ1YmJsZT10cnVlO1xuXHRcdH0sXG5cdFx0bWFrZVJlc2l6YWJsZTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0XHR0aGlzLnJlc2l6YWJsZT10cnVlO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlPWNyZWF0ZUhhbmRsZSh7XG5cdFx0XHRcdHg6IDAsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHRcdGhlaWdodDogdGhpcy5nZXRIZWlnaHQoKSxcblx0XHRcdFx0ZHJhZ0JvdW5kRnVuYzogdGhpcy5zZXR0aW5nLnJlc2l6ZUJvdW5kRnVuYyxcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZT1jcmVhdGVIYW5kbGUoe1xuXHRcdFx0XHR4OiB0aGlzLmdldFdpZHRoKCktMixcblx0XHRcdFx0eTogMCxcblx0XHRcdFx0aGVpZ2h0OiB0aGlzLmdldEhlaWdodCgpLFxuXHRcdFx0XHRkcmFnQm91bmRGdW5jOiB0aGlzLnNldHRpbmcucmVzaXplQm91bmRGdW5jLFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5kaXNhYmxlU3ViZ3JvdXAoKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LmRpc2FibGVTdWJncm91cCgpO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5vbignZHJhZ2VuZCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5lbmFibGVTdWJncm91cCgpO1xuXHRcdFx0XHR0aGF0LnBhcmVudC5zeW5jKCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZW5hYmxlU3ViZ3JvdXAoKTtcblx0XHRcdFx0dGhhdC5wYXJlbnQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5vbignZHJhZ21vdmUnLGJlZm9yZWJpbmQoZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5yZW5kZXIoKTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdyZXNpemVsZWZ0Jyx0aGF0KTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdyZXNpemUnLHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0fSkpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignZHJhZ21vdmUnLGJlZm9yZWJpbmQoZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5yZW5kZXIoKTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdyZXNpemVyaWdodCcsdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplJyx0aGF0KTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyUGFyZW50KCdyZXNpemUnKTtcblx0XHRcdH0pKTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5vbignbW91c2VvdmVyJyx0aGlzLmNoYW5nZVJlc2l6ZUN1cnNvcik7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLm9uKCdtb3VzZW92ZXInLHRoaXMuY2hhbmdlUmVzaXplQ3Vyc29yKTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5vbignbW91c2VvdXQnLHRoaXMuY2hhbmdlRGVmYXVsdEN1cnNvcik7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLm9uKCdtb3VzZW91dCcsdGhpcy5jaGFuZ2VEZWZhdWx0Q3Vyc29yKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5ncm91cC5hZGQodGhpcy5sZWZ0SGFuZGxlKTtcblx0XHRcdHRoaXMuZ3JvdXAuYWRkKHRoaXMucmlnaHRIYW5kbGUpO1xuXG5cblx0XHR9LFxuXHRcdGFkZFN1Ymdyb3VwOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLmhhc1N1Ykdyb3VwPXRydWU7XG5cdFx0XHR2YXIgc3ViZ3JvdXAsdGhhdD10aGlzO1xuXHRcdFx0c3ViZ3JvdXA9dGhpcy5zdWJncm91cD1jcmVhdGVTdWJHcm91cCh7aGVpZ2h0OnRoaXMuZ2V0SGVpZ2h0KCl9KTtcblx0XHRcdHN1Ymdyb3VwLmhpZGUoKTtcblx0XHRcdHN1Ymdyb3VwLnNldFgodGhpcy5nZXRXaWR0aCgpKTtcblx0XHRcdHRoaXMuZ3JvdXAuYWRkKHN1Ymdyb3VwKTtcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHQvL3RoaXMuYmluZEFuY2hvcigpO1xuXHRcdH0sXG5cdFx0ZW5hYmxlU3ViZ3JvdXA6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuc3ViZ3JvdXBvcHRpb25zLnNob3dPbkhvdmVyPXRydWU7XG5cdFx0XHR0aGlzLnN1Ymdyb3VwLnNldFgodGhpcy5nZXRXaWR0aCgpKTtcblx0XHR9LFxuXHRcdGRpc2FibGVTdWJncm91cDpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5zdWJncm91cG9wdGlvbnMuc2hvd09uSG92ZXI9dHJ1ZTtcblx0XHRcdHRoaXMuc3ViZ3JvdXAuaGlkZSgpO1xuXHRcdH0sXG5cdFx0XG5cdFx0YmluZEFuY2hvcjogZnVuY3Rpb24oKXtcblx0XHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0XHR2YXIgYW5jaG9yPXRoaXMuc3ViZ3JvdXAuZmluZCgnLmFuY2hvcicpO1xuXHRcdFx0YW5jaG9yLm9uKCdjbGljaycsZnVuY3Rpb24oZXZ0KXtcblx0XHRcdFx0YW5jaG9yLnN0cm9rZSgncmVkJyk7XG5cdFx0XHRcdHRoYXQuc3ViZ3JvdXBvcHRpb25zLmhpZGVPbkhvdmVyT3V0PWZhbHNlO1xuXHRcdFx0XHRLaW5ldGljLkNvbm5lY3Quc3RhcnQ9dGhhdDtcblx0XHRcdFx0dGhpcy5nZXRMYXllcigpLmRyYXcoKTtcblx0XHRcdFx0ZXZ0LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cdFx0XG5cdFx0bWFrZURyYWdnYWJsZTogZnVuY3Rpb24ob3B0aW9uKXtcblx0XHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0XHR0aGlzLmdyb3VwLmRyYWdnYWJsZSh0cnVlKTtcblx0XHRcdGlmKHRoaXMuc2V0dGluZy5kcmFnQm91bmRGdW5jKXtcblx0XHRcdFx0dGhpcy5ncm91cC5kcmFnQm91bmRGdW5jKHRoaXMuc2V0dGluZy5kcmFnQm91bmRGdW5jKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JvdXAub24oJ2RyYWdtb3ZlJyxiZWZvcmViaW5kKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcignbW92ZScrZ2V0RHJhZ0Rpcih0aGlzLmdldFN0YWdlKCkpLHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ21vdmUnKTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyUGFyZW50KCdtb3ZlJyk7XG5cdFx0XHR9KSk7XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdkcmFnZW5kJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LnBhcmVudC5zeW5jKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGNoYW5nZVJlc2l6ZUN1cnNvcjpmdW5jdGlvbih0eXBlKXtcblx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2V3LXJlc2l6ZSc7XG5cdFx0fSxcblx0XHRjaGFuZ2VEZWZhdWx0Q3Vyc29yOmZ1bmN0aW9uKHR5cGUpe1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG5cdFx0fSxcblx0XHQvL3JlbmRlcnMgdGhlIGhhbmRsZSBieSBpdHMgcmVjdFxuXHRcdHJlbmRlckhhbmRsZTpmdW5jdGlvbigpe1xuXHRcdFx0aWYoIXRoaXMucmVzaXphYmxlKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgeD10aGlzLnJlY3QuZ2V0WCgpO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLnNldFgoeCk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLnNldFgoeCt0aGlzLnJlY3QuZ2V0V2lkdGgoKS0yKTtcblx0XHR9LFxuXHRcdFxuXHRcdFxuXHRcdC8vcmVuZGVycyB0aGUgYmFyIGJ5IHRoZSBoYW5kbGVzXG5cdFx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGxlZnR4PXRoaXMubGVmdEhhbmRsZS5nZXRYKCk7XG5cdFx0XHR2YXIgd2lkdGg9dGhpcy5yaWdodEhhbmRsZS5nZXRYKCktbGVmdHgrMjtcblx0XHRcdHRoaXMuZ3JvdXAuc2V0WCh0aGlzLmdyb3VwLmdldFgoKStsZWZ0eCk7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUuc2V0WCgwKTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUuc2V0WCh3aWR0aC0yKTtcblx0XHRcdHRoaXMucmVjdC5zZXRXaWR0aCh3aWR0aCk7XG5cdFx0XHR2YXIgd2lkdGgyID0gdGhpcy5yZWN0LmdldFdpZHRoKCkgICogKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwKTtcblx0XHRcdGlmKHdpZHRoMilcblx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci5zZXRXaWR0aCh3aWR0aDIgLSA0KTtcblx0XHR9LFxuXHRcdC8qXG5cdFx0XHRkZXBlbmRlbnRPYmo6IHsnZWxlbSc6ZGVwZW5kYW50LCdjb25uZWN0b3InOmNvbm5lY3Rvcn1cblx0XHRcdCovXG5cdFx0XHRhZGREZXBlbmRhbnQ6ZnVuY3Rpb24oZGVwZW5kYW50T2JqKXtcblx0XHRcdFx0dGhpcy5saXN0ZW5UbyhkZXBlbmRhbnRPYmouZWxlbSwnbW92ZWxlZnQgcmVzaXplbGVmdCcsdGhpcy5hZGp1c3RsZWZ0KVxuXHRcdFx0XHR0aGlzLmRlcGVuZGFudHMucHVzaChkZXBlbmRhbnRPYmopO1xuXHRcdFx0fSxcblx0XHQvL3JlbmRlcnMgdGhlIGJhciBieSBpdHMgbW9kZWwgXG5cdFx0cmVuZGVyQmFyOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgeCA9IHRoaXMuY2FsY3VsYXRlWCgpO1xuXHRcdFx0dGhpcy5zZXRYMSh4LngxLHthYnNvbHV0ZTp0cnVlLCBzaWxlbnQ6dHJ1ZX0pO1xuXHRcdFx0dGhpcy5zZXRYMih4LngyLHthYnNvbHV0ZTp0cnVlLCBzaWxlbnQ6dHJ1ZSwgb3NhbWU6dHJ1ZX0pO1xuXHRcdFx0dGhpcy5yZW5kZXJDb25uZWN0b3JzKCk7XG5cdFx0fSxcblx0XHRcblx0XHRhZGREZXBlbmRhbmN5OiBmdW5jdGlvbihkZXBlbmRlbmN5T2JqKXtcblx0XHRcdHRoaXMubGlzdGVuVG8oZGVwZW5kZW5jeU9iai5lbGVtLCdtb3ZlcmlnaHQgcmVzaXplcmlnaHQnLHRoaXMuYWRqdXN0cmlnaHQpO1xuXHRcdFx0dGhpcy5kZXBlbmRlbmNpZXMucHVzaChkZXBlbmRlbmN5T2JqKTtcblx0XHRcdHRoaXMucmVuZGVyQ29ubmVjdG9yKGRlcGVuZGVuY3lPYmosMik7XG5cdFx0fSxcblx0XHQvL2NoZWNrcyBpZiB0aGUgYmFyIG5lZWRzIG1vdmVtZW50IGluIGxlZnQgc2lkZSBvbiBsZWZ0IG1vdmVtZW50IG9mIGRlcGVuZGVudCBhbmQgbWFrZXMgYWRqdXN0bWVudFxuXHRcdGFkanVzdGxlZnQ6ZnVuY3Rpb24oZGVwZW5kYW50KXtcblx0XHRcdGlmKCF0aGlzLmlzRGVwZW5kYW50KGRlcGVuZGFudCkpIHJldHVybiBmYWxzZTtcblx0XHRcdHZhciBkeD10aGlzLmdldFgxKCkrdGhpcy5nZXRXaWR0aCgpLWRlcGVuZGFudC5nZXRYMSgpO1xuXHRcdFx0Ly9hbiBvdmVybGFwIG9jY3VycyBpbiB0aGlzIGNhc2Vcblx0XHRcdGlmKGR4PjApe1xuXHRcdFx0XHQvL2V2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGluIG1vdmUgZnVuY1xuXHRcdFx0XHR0aGlzLm1vdmUoLTEqZHgpO1xuXHRcdFx0XHQvL3RoaXMudHJpZ2dlcignbW92ZWxlZnQnLHRoaXMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YWRqdXN0cmlnaHQ6ZnVuY3Rpb24oZGVwZW5kZW5jeSl7XG5cdFx0XHRpZighdGhpcy5pc0RlcGVuZGVuY3koZGVwZW5kZW5jeSkpIHJldHVybiBmYWxzZTtcblx0XHRcdHZhciBkeD1kZXBlbmRlbmN5LmdldFgxKCkrZGVwZW5kZW5jeS5nZXRXaWR0aCgpLXRoaXMuZ2V0WDEoKTtcblx0XHRcdC8vY29uc29sZS5sb2coZHgpO1xuXHRcdFx0aWYoZHg+MCl7XG5cdFx0XHRcdC8vZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgaW4gbW92ZSBmdW5jXG5cdFx0XHRcdHRoaXMubW92ZShkeCk7XG5cdFx0XHRcdC8vdGhpcy50cmlnZ2VyKCdtb3ZlcmlnaHQnLHRoaXMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aXNEZXBlbmRhbnQ6ZnVuY3Rpb24oZGVwZW5kYW50KXtcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy5kZXBlbmRhbnRzLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRpZih0aGlzLmRlcGVuZGFudHNbaV1bJ2VsZW0nXVsnYmFyaWQnXT09PWRlcGVuZGFudFsnYmFyaWQnXSl7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cdFx0Ly9AdHlwZSBEZXBlbmRhbnQ6MSwgRGVwZW5kZW5jeToyXG5cdFx0cmVuZGVyQ29ubmVjdG9yOmZ1bmN0aW9uKG9iaix0eXBlKXtcblx0XHRcdGlmKHR5cGU9PTEpe1xuXHRcdFx0XHRCYXIucmVuZGVyQ29ubmVjdG9yKHRoaXMsb2JqLmVsZW0sb2JqLmNvbm5lY3Rvcik7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRCYXIucmVuZGVyQ29ubmVjdG9yKG9iai5lbGVtLHRoaXMsb2JqLmNvbm5lY3Rvcik7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvL3JlbmRlcnMgYWxsIGNvbm5lY3RvcnNcblx0XHRyZW5kZXJDb25uZWN0b3JzOmZ1bmN0aW9uKCl7XG5cdFx0XHRmb3IodmFyIGk9MCxpTGVuPXRoaXMuZGVwZW5kYW50cy5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdHRoaXMucmVuZGVyQ29ubmVjdG9yKHRoaXMuZGVwZW5kYW50c1tpXSwxKTtcblx0XHRcdH1cblx0XHRcdGZvcih2YXIgaT0wLGlMZW49dGhpcy5kZXBlbmRlbmNpZXMubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHR0aGlzLnJlbmRlckNvbm5lY3Rvcih0aGlzLmRlcGVuZGVuY2llc1tpXSwyKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGlzRGVwZW5kZW5jeTogZnVuY3Rpb24oZGVwZW5kZW5jeSl7XG5cdFx0XHRcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy5kZXBlbmRlbmNpZXMubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGlmKHRoaXMuZGVwZW5kZW5jaWVzW2ldWydlbGVtJ11bJ2JhcmlkJ109PT1kZXBlbmRlbmN5WydiYXJpZCddKXtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0bW92ZTogZnVuY3Rpb24oZHgsc2lsZW50KXtcblx0XHRcdGlmKGR4PT09MCkgcmV0dXJuO1xuXHRcdFx0dGhpcy5ncm91cC5tb3ZlKHt4OmR4fSk7XG5cdFx0XHRpZighc2lsZW50KXtcblx0XHRcdFx0dGhpcy50cmlnZ2VyKCdtb3ZlJyx0aGlzKTtcblx0XHRcdFx0aWYoZHg+MCl7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdtb3ZlcmlnaHQnLHRoaXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdtb3ZlbGVmdCcsdGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy50cmlnZ2VyUGFyZW50KCdtb3ZlJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVYOmZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdCFtb2RlbCAmJiAobW9kZWw9dGhpcy5tb2RlbCk7XG5cdFx0XHR2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxuXHRcdFx0Ym91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXG5cdFx0XHRkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDE6KERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sbW9kZWwuZ2V0KCdzdGFydCcpKSkqZGF5c1dpZHRoLFxuXHRcdFx0XHR4MjpEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLG1vZGVsLmdldCgnZW5kJykpKmRheXNXaWR0aCxcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNhbGN1bGF0ZURhdGVzOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYXR0cnM9dGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XG5cdFx0XHR2YXIgZGF5czE9TWF0aC5yb3VuZCh0aGlzLmdldFgxKHRydWUpL2RheXNXaWR0aCksZGF5czI9TWF0aC5yb3VuZCh0aGlzLmdldFgyKHRydWUpL2RheXNXaWR0aCk7XG5cdFx0XHRcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHN0YXJ0OiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpLFxuXHRcdFx0XHRlbmQ6Ym91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyLTEpXG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9LFxuXHRcdGdldFJlY3RwYXJhbXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBzZXR0aW5nPXRoaXMuc2V0dGluZztcblx0XHRcdHZhciB4cyAgPXRoaXMuY2FsY3VsYXRlWCh0aGlzLm1vZGVsKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpKTtcblx0XHRcdHJldHVybiBfLmV4dGVuZCh7XG5cdFx0XHRcdHg6MCxcblx0XHRcdFx0d2lkdGg6eHMueDIteHMueDEsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHRcdG5hbWU6J21haW5iYXInLFxuXHRcdFx0XHRoZWlnaHQ6c2V0dGluZy5iYXJoZWlnaHRcblx0XHRcdH0sc2V0dGluZy5yZWN0b3B0aW9uKTtcblx0XHR9LFxuXHRcdGdldEdyb3VwUGFyYW1zOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgeHM9dGhpcy5jYWxjdWxhdGVYKHRoaXMubW9kZWwpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeHMueDEsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0b2dnbGU6ZnVuY3Rpb24oc2hvdyl7XG5cdFx0XHR2YXIgbWV0aG9kPXNob3c/J3Nob3cnOidoaWRlJztcblx0XHRcdHRoaXMuZ3JvdXBbbWV0aG9kXSgpO1xuXHRcdFx0Zm9yKHZhciBpPTAsaUxlbj10aGlzLmRlcGVuZGVuY2llcy5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdHRoaXMuZGVwZW5kZW5jaWVzW2ldLmNvbm5lY3RvclttZXRob2RdKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRkcmF3OmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXG5cdFx0fSxcblx0XHRzeW5jOmZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZygnc3luY2luZyAnICsgdGhpcy5tb2RlbC5jaWQpO1xuXHRcdFx0dmFyIGRhdGVzID0gdGhpcy5jYWxjdWxhdGVEYXRlcygpO1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoe1xuXHRcdFx0XHRzdGFydDogZGF0ZXMuc3RhcnQsXG5cdFx0XHRcdGVuZDogZGF0ZXMuZW5kXG5cdFx0XHR9KTtcblx0XHRcdGNvbnNvbGUubG9nKCdzeW5jaW5nICcrdGhpcy5tb2RlbC5jaWQrJyBmaW5pc2hlZCcpO1xuXHRcdFx0dGhpcy5tb2RlbC5zYXZlKCk7XG5cdFx0fVxuXHR9XG5cdC8vSXQgY3JlYXRlcyBhIHJlbGF0aW9uIGJldHdlZW4gZGVwZW5kYW50IGFuZCBkZXBlbmRlbmN5XG5cdC8vRGVwZW5kYW50IGlzIHRoZSB0YXNrIHdoaWNoIG5lZWRzIHRvIGJlIGRvbmUgYWZ0ZXIgZGVwZW5kZW5jeVxuXHQvL1N1cHBvc2UgdGFzayBCIHJlcXVpcmVzIHRhc2sgQSB0byBiZSBkb25lIGJlZm9yZWhhbmQuIFNvLCBBIGlzIGRlcGVuZGFuY3kvcmVxdWlyZW1lbnQgZm9yIEIgd2hlcmVhcyBCIGlzIGRlcGVuZGFudCBvbiBBLlxuXHRCYXIuY3JlYXRlUmVsYXRpb249ZnVuY3Rpb24oZGVwZW5kZW5jeSxkZXBlbmRhbnQpe1xuXHRcdHZhciBjb25uZWN0b3IscGFyZW50O1xuXHRcdHBhcmVudD1kZXBlbmRhbnQuZ3JvdXAuZ2V0UGFyZW50KCk7XG5cdFx0Y29ubmVjdG9yPXRoaXMuY3JlYXRlQ29ubmVjdG9yKCk7XG5cdFx0ZGVwZW5kZW5jeS5hZGREZXBlbmRhbnQoe1xuXHRcdFx0J2VsZW0nOmRlcGVuZGFudCxcblx0XHRcdCdjb25uZWN0b3InOiBjb25uZWN0b3IsXG5cdFx0fSk7XG5cdFx0ZGVwZW5kYW50LmFkZERlcGVuZGFuY3koe1xuXHRcdFx0J2VsZW0nOmRlcGVuZGVuY3ksXG5cdFx0XHQnY29ubmVjdG9yJzogY29ubmVjdG9yLFxuXHRcdH0pO1xuXHRcdFxuXHRcdHBhcmVudC5hZGQoY29ubmVjdG9yKTtcblx0XHRcblx0fVxuXHRcblx0QmFyLmNyZWF0ZUNvbm5lY3Rvcj1mdW5jdGlvbigpe1xuXHRcdHJldHVybiBuZXcgS2luZXRpYy5MaW5lKHtcblx0XHRcdHN0cm9rZVdpZHRoOiAxLFxuXHRcdFx0c3Ryb2tlOiAnYmxhY2snLFxuXHRcdFx0cG9pbnRzOiBbMCwgMF1cblx0XHR9KTtcblx0XHRcblx0fSxcblx0QmFyLmVuYWJsZUNvbm5lY3Rvcj1mdW5jdGlvbihzdGFydCl7XG5cdFx0S2luZXRpYy5Db25uZWN0LnN0YXJ0PXN0YXJ0O1xuXHRcdHN0YXJ0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dD1mYWxzZTtcblx0fVxuXHRCYXIuZGlzYWJsZUNvbm5lY3Rvcj1mdW5jdGlvbigpe1xuXHRcdGlmKCFLaW5ldGljLkNvbm5lY3Quc3RhcnQpIHJldHVybjtcblx0XHR2YXIgc3RhcnQ9S2luZXRpYy5Db25uZWN0LnN0YXJ0O1xuXHRcdHN0YXJ0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dD10cnVlO1xuXHRcdEtpbmV0aWMuQ29ubmVjdC5zdGFydD1udWxsO1xuXHR9XG5cdFxuXHRCYXIuaXNDb25uZWN0b3JFbmFibGVkPWZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIEtpbmV0aWMuQ29ubmVjdC5zdGFydDtcblx0fVxuXHRCYXIucmVuZGVyQ29ubmVjdG9yPWZ1bmN0aW9uKHN0YXJ0QmFyLGVuZEJhcixjb25uZWN0b3Ipe1xuXHRcdFxuXHRcdHZhciBwb2ludDEscG9pbnQyLGhhbGZoZWlnaHQscG9pbnRzLGNvbG9yPScjMDAwJztcblx0XHRoYWxmaGVpZ2h0PXBhcnNlSW50KHN0YXJ0QmFyLmdldEhlaWdodCgpLzIpO1xuXHRcdHBvaW50MT17XG5cdFx0XHR4OnN0YXJ0QmFyLmdldFgyKCksXG5cdFx0XHR5OnN0YXJ0QmFyLmdldFkoKStoYWxmaGVpZ2h0LFxuXHRcdH1cblx0XHRwb2ludDI9e1xuXHRcdFx0eDplbmRCYXIuZ2V0WDEoKSxcblx0XHRcdHk6ZW5kQmFyLmdldFkoKStoYWxmaGVpZ2h0LFxuXHRcdH1cblx0XHR2YXIgb2Zmc2V0PTUsYXJyb3dmbGFuaz00LGFycm93aGVpZ2h0PTUsYm90dG9tb2Zmc2V0PTQ7XG5cdFx0XG5cblx0XHRpZihwb2ludDIueC1wb2ludDEueDwwKXtcblx0XHRcdGlmKHBvaW50Mi55PHBvaW50MS55KXtcblx0XHRcdFx0aGFsZmhlaWdodD0gLTEqaGFsZmhlaWdodDtcblx0XHRcdFx0Ym90dG9tb2Zmc2V0PS0xKmJvdHRvbW9mZnNldDtcblx0XHRcdFx0Ly9hcnJvd2hlaWdodD0tMSphcnJvd2hlaWdodDtcblx0XHRcdH1cblx0XHRcdHBvaW50cz1bXG5cdFx0XHRwb2ludDEueCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDEueStoYWxmaGVpZ2h0K2JvdHRvbW9mZnNldCxcblx0XHRcdHBvaW50Mi54LW9mZnNldCxwb2ludDEueStoYWxmaGVpZ2h0K2JvdHRvbW9mZnNldCxcblx0XHRcdHBvaW50Mi54LW9mZnNldCxwb2ludDIueSxcblx0XHRcdHBvaW50Mi54LHBvaW50Mi55LFxuXHRcdFx0cG9pbnQyLngtYXJyb3doZWlnaHQscG9pbnQyLnktYXJyb3dmbGFuayxcblx0XHRcdHBvaW50Mi54LWFycm93aGVpZ2h0LHBvaW50Mi55K2Fycm93ZmxhbmssXG5cdFx0XHRwb2ludDIueCxwb2ludDIueVxuXHRcdFx0XTtcblx0XHRcdGNvbG9yPSdyZWQnO1xuXHRcdFx0XG5cdFx0fVxuXHRcdGVsc2UgaWYocG9pbnQyLngtcG9pbnQxLng8NSl7XG5cdFx0XHRpZihwb2ludDIueTxwb2ludDEueSl7XG5cdFx0XHRcdGhhbGZoZWlnaHQ9IC0xKmhhbGZoZWlnaHQ7XG5cdFx0XHRcdGJvdHRvbW9mZnNldD0tMSpib3R0b21vZmZzZXQ7XG5cdFx0XHRcdGFycm93aGVpZ2h0PS0xKmFycm93aGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0cG9pbnRzPVtcblx0XHRcdHBvaW50MS54LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50Mi55LWhhbGZoZWlnaHQsXG5cdFx0XHRwb2ludDEueCtvZmZzZXQtYXJyb3dmbGFuayxwb2ludDIueS1oYWxmaGVpZ2h0LWFycm93aGVpZ2h0LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0K2Fycm93ZmxhbmsscG9pbnQyLnktaGFsZmhlaWdodC1hcnJvd2hlaWdodCxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDIueS1oYWxmaGVpZ2h0XG5cdFx0XHRdO1xuXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRwb2ludHM9W1xuXHRcdFx0cG9pbnQxLngscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQyLnksXG5cdFx0XHRwb2ludDIueCxwb2ludDIueSxcblx0XHRcdHBvaW50Mi54LWFycm93aGVpZ2h0LHBvaW50Mi55LWFycm93ZmxhbmssXG5cdFx0XHRwb2ludDIueC1hcnJvd2hlaWdodCxwb2ludDIueSthcnJvd2ZsYW5rLFxuXHRcdFx0cG9pbnQyLngscG9pbnQyLnlcblx0XHRcdF07XG5cdFx0fVxuXHRcdGNvbm5lY3Rvci5zZXRBdHRyKCdzdHJva2UnLGNvbG9yKTtcblx0XHRjb25uZWN0b3Iuc2V0UG9pbnRzKHBvaW50cyk7XG5cdH1cblx0XG5cdEtpbmV0aWMuQ29ubmVjdD17XG5cdFx0c3RhcnQ6ZmFsc2UsXG5cdFx0ZW5kOmZhbHNlXG5cdH1cblx0XG5cdFxuXHRcblx0Xy5leHRlbmQoQmFyLnByb3RvdHlwZSwgQmFja2JvbmUuRXZlbnRzKTtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IEJhcjsiLCJ2YXIgQmFyID0gcmVxdWlyZSgnLi9CYXInKTtcblxudmFyIEJhckdyb3VwID0gZnVuY3Rpb24ob3B0aW9ucyl7XG5cdHRoaXMuY2lkID0gXy51bmlxdWVJZCgnYmcnKTtcblx0dGhpcy5zZXR0aW5ncyA9IG9wdGlvbnMuc2V0dGluZ3M7XG5cdHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXHR2YXIgc2V0dGluZyA9IHRoaXMuc2V0dGluZyA9IG9wdGlvbnMuc2V0dGluZ3MuZ2V0U2V0dGluZygnZ3JvdXAnKTtcblx0dGhpcy5hdHRyID0ge1xuXHRcdGhlaWdodDogMFxuXHR9O1xuXHR0aGlzLnN5bmNpbmc9ZmFsc2U7XG5cdHRoaXMuY2hpbGRyZW49W107XG5cblx0dGhpcy5ncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHRoaXMuZ2V0R3JvdXBQYXJhbXMoKSk7XG5cdHRoaXMudG9wYmFyID0gbmV3IEtpbmV0aWMuUmVjdCh0aGlzLmdldFJlY3RwYXJhbXMoKSk7XG5cdHRoaXMuZ3JvdXAuYWRkKHRoaXMudG9wYmFyKTtcblxuXHR0aGlzLmF0dHIuaGVpZ2h0ICs9ICBzZXR0aW5nLnJvd0hlaWdodDtcblxuXHRpZihzZXR0aW5nLmRyYWdnYWJsZSl7XG5cdFx0dGhpcy5tYWtlRHJhZ2dhYmxlKCk7XG5cdH1cblx0aWYoc2V0dGluZy5yZXNpemFibGUpe1xuXHRcdHRoaXMudG9wYmFyLm1ha2VSZXNpemFibGUoKTtcblx0fVxuXHR0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbkJhckdyb3VwLnByb3RvdHlwZT17XG5cdFx0aW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5tb2RlbC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJTb3J0ZWRDaGlsZHJlbih0cnVlKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHZhciB2aWV3Rm9yRGVsZXRlID0gXy5maW5kKHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5tb2RlbCA9PT0gY2hpbGRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRoaXMuY2hpbGRyZW4gPSBfLndpdGhvdXQodGhpcy5jaGlsZHJlbiwgdmlld0ZvckRlbGV0ZSk7XG5cdFx0XHRcdHZpZXdGb3JEZWxldGUuZGVzdHJveSgpO1xuXHRcdFx0XHR0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKHRydWUpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdHRoaXMucmVuZGVyU29ydGVkQ2hpbGRyZW4odHJ1ZSk7XG5cdFx0XHR0aGlzLnJlbmRlckRlcGVuZGVuY3koKTtcblx0XHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHRcdH0sXG5cdFx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5ncm91cC5kZXN0cm95KCk7XG5cdFx0fSxcblx0XHRyZW5kZXJTb3J0ZWRDaGlsZHJlbjpmdW5jdGlvbihub2RyYXcpe1xuXHRcdFx0IW5vZHJhdyAmJiAobm9kcmF3PWZhbHNlKTtcblx0XHRcdHZhciBzb3J0ZWQ9Xy5zb3J0QnkodGhpcy5jaGlsZHJlbiwgZnVuY3Rpb24oaXRlbWJhcil7XG5cdFx0XHRcdHJldHVybiBpdGVtYmFyLm1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuYXR0ci5oZWlnaHQ9dGhpcy5zZXR0aW5nLnJvd0hlaWdodDtcblx0XHRcdGZvcih2YXIgaT0wO2k8c29ydGVkLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRzb3J0ZWRbaV0uc2V0WSh0aGlzLmdldEhlaWdodCgpK3RoaXMuc2V0dGluZy5nYXApO1xuXHRcdFx0XHRzb3J0ZWRbaV0ucmVuZGVyQ29ubmVjdG9ycygpO1xuXHRcdFx0XHR0aGlzLmF0dHIuaGVpZ2h0ICs9IHRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHR9XG5cdFx0XHRpZighbm9kcmF3KVxuXHRcdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRmaW5kQnlJZDpmdW5jdGlvbihpZCl7XG5cdFx0XHR2YXIgY2hpbGRyZW49dGhpcy5jaGlsZHJlbjtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGlmKGNoaWxkcmVuW2ldLm1vZGVsLmdldCgnaWQnKT09PWlkKVxuXHRcdFx0XHRcdHJldHVybiBjaGlsZHJlbltpXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cdFx0cmVuZGVyRGVwZW5kZW5jeTpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGNoaWxkcmVuPXRoaXMuY2hpbGRyZW4sZGVwZW5kZW5jaWVzPVtdLGJhcjtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGRlcGVuZGVuY2llcz1jaGlsZHJlbltpXS5tb2RlbC5nZXQoJ2RlcGVuZGVuY3knKTtcblx0XHRcdFx0Zm9yKHZhciBqPTA7ajxkZXBlbmRlbmNpZXMubGVuZ3RoO2orKyl7XG5cdFx0XHRcdFx0YmFyPXRoaXMuZmluZEJ5SWQoZGVwZW5kZW5jaWVzW2pdWydpZCddKTtcblx0XHRcdFx0XHRpZihiYXIpe1xuXHRcdFx0XHRcdFx0QmFyLmNyZWF0ZVJlbGF0aW9uKGJhcixjaGlsZHJlbltpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRtYWtlRHJhZ2dhYmxlOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHRoaXMuZ3JvdXAuZHJhZ2dhYmxlKHRydWUpO1xuXHRcdFx0aWYodGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpe1xuXHRcdFx0XHR0aGlzLmdyb3VwLmRyYWdCb3VuZEZ1bmModGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5zeW5jKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdC8vcmV0dXJucyB0aGUgeCBwb3NpdGlvbiBvZiB0aGUgZ3JvdXBcblx0XHQvL1RoZSB4IHBvc2l0aW9uIG9mIHRoZSBncm91cCBpcyBzZXQgMCBpbml0aWFsbHkuVGhlIHRvcGJhciB4IHBvc2l0aW9uIGlzIHNldCByZWxhdGl2ZSB0byBncm91cHMgMCBwb3NpdGlvbiBpbml0aWFsbHkuIHdoZW4gdGhlIGdyb3VwIGlzIG1vdmVkIHRvIGdldCB0aGUgYWJzb2x1dGUgeCBwb3NpdGlvbiBvZiB0aGUgdG9wIGJhciB1c2UgZ2V0WDEgbWV0aG9kLlxuXHRcdC8vVGhlIHByb2JsZW0gaXMgd2hlbiBhbnkgY2hpbGRyZW4gZ2V0IG91dHNpZGUgb2YgYm91bmQgdGhlbiB0aGUgcG9zaXRpb24gb2YgZWFjaCBjaGlsZHJlbiBoYXMgdG8gYmUgdXBkYXRlZC4gVGhpcyB3YXkgc29sdmVzIHRoZSBwcm9ibGVtXG5cdFx0Z2V0WDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXAuZ2V0WCgpO1xuXHRcdH0sXG5cdFx0Ly9yZXR1cm5zIHRoZSBiYnNvbHV0ZSB4MSBwb3NpdGlvbiBvZiB0b3AgYmFyXG5cdFx0Z2V0WDE6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFgoKSt0aGlzLnRvcGJhci5nZXRYKCk7XG5cdFx0fSxcblx0XHQvL3JldHVybnMgdGhlIGFic29sdXRlIHgxIHBvc2l0aW9uIG9mIHRvcCBiYXJcblx0XHRnZXRYMjpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0WDEoKSt0aGlzLnRvcGJhci5nZXRXaWR0aCgpO1xuXHRcdH0sXG5cdFx0Z2V0WTE6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFkoKTtcblx0XHR9LFxuXHRcdHNldFk6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0dGhpcy5ncm91cC5zZXRZKHZhbHVlKTtcblx0XHR9LFxuXHRcdGdldFdpZHRoOmZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy50b3BiYXIuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdGdldEhlaWdodDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuYXR0ci5oZWlnaHQ7XG5cdFx0fSxcblx0XHRnZXRDdXJyZW50SGVpZ2h0OmZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpXG5cdFx0XHRcdHJldHVybiB0aGlzLmF0dHIuaGVpZ2h0O1xuXHRcdFx0ZWxzZXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnZ3JvdXAnLCdyb3dIZWlnaHQnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdFxuXHRcdGFkZENoaWxkOiBmdW5jdGlvbihiYXIpe1xuXHRcdFx0dGhpcy5jaGlsZHJlbi5wdXNoKGJhcik7XG5cdFx0XHR0aGlzLmdyb3VwLmFkZChiYXIuZ3JvdXApO1xuXHRcdFx0dmFyIHg9YmFyLmdldFgxKHRydWUpO1xuXHRcdFx0Ly9tYWtlIGJhciB4IHJlbGF0aXZlIHRvIHRoaXMgZ3JvdXBcblx0XHRcdGJhci5zZXRQYXJlbnQodGhpcyk7XG5cdFx0XHRiYXIuc2V0WDEoeCx7YWJzb2x1dGU6dHJ1ZSxzaWxlbnQ6dHJ1ZX0pO1xuXHRcdFx0YmFyLnNldFkodGhpcy5nZXRIZWlnaHQoKSt0aGlzLnNldHRpbmcuZ2FwKTtcblx0XHRcdHRoaXMuYXR0ci5oZWlnaHQgKz0gdGhpcy5zZXR0aW5nLnJvd0hlaWdodDtcblx0XHRcdGJhci5ncm91cC52aXNpYmxlKHRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKSk7XG5cdFx0fSxcblx0XHRyZW5kZXJDaGlsZHJlbjpmdW5jdGlvbigpe1xuXHRcdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmNoaWxkcmVuLmxlbmd0aDtpKyspe1xuXHRcdFx0XHR0aGlzLmNoaWxkcmVuW2ldLnJlbmRlckJhcigpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZW5kZXJUb3BCYXIoKTtcblxuXHRcdH0sXG5cdFx0cmVuZGVyVG9wQmFyOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgcGFyZW50PXRoaXMubW9kZWw7XG5cdFx0XHR2YXIgeD10aGlzLmNhbGN1bGF0ZVgocGFyZW50KTtcblxuXHRcdFx0dGhpcy50b3BiYXIuc2V0WCh4LngxLXRoaXMuZ3JvdXAuZ2V0WCgpKTtcblx0XHRcdHRoaXMudG9wYmFyLnNldFdpZHRoKHgueDIteC54MSk7XG5cdFx0fSxcblx0XHRiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLm9uKCdyZXNpemUgbW92ZScsZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIG1pblgsbWF4WDtcblx0XHRcdFx0bWluWD1fLm1pbih0aGlzLmNoaWxkcmVuLGZ1bmN0aW9uKGJhcil7XG5cdFx0XHRcdFx0cmV0dXJuIGJhci5nZXRYMSgpO1xuXHRcdFx0XHR9KS5nZXRYMSgpO1xuXHRcdFx0XHRtYXhYPV8ubWF4KHRoaXMuY2hpbGRyZW4sZnVuY3Rpb24oYmFyKXtcblx0XHRcdFx0XHRyZXR1cm4gYmFyLmdldFgyKCk7XG5cdFx0XHRcdH0pLmdldFgyKCk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLnNldFgobWluWCk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLnNldFdpZHRoKG1heFgtbWluWCk7XG5cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCdjaGFuZ2U6YWN0aXZlJyx0aGlzLnRvZ2dsZUNoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnb25zb3J0Jyx0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGlzLnRvcGJhci5zZXRBdHRycyh0aGlzLmdldFJlY3RwYXJhbXMoKSk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0fSk7XG5cblx0XHR9LFxuXHRcdGdldEdyb3VwUGFyYW1zOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIF8uZXh0ZW5kKHtcblx0XHRcdFx0eDowLFxuXHRcdFx0XHR5OjAsXG5cdFx0XHR9LCB0aGlzLnNldHRpbmcudG9wQmFyKTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0Y2FsY3VsYXRlWDpmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHR2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxuXHRcdFx0Ym91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXG5cdFx0XHRkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDE6KERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sbW9kZWwuZ2V0KCdzdGFydCcpKS0xKSpkYXlzV2lkdGgsXG5cdFx0XHRcdHgyOkRhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sbW9kZWwuZ2V0KCdlbmQnKSkqZGF5c1dpZHRoLFxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGNhbGN1bGF0ZVBhcmVudERhdGVzOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYXR0cnM9dGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XG5cdFx0XHR2YXIgZGF5czE9TWF0aC5yb3VuZCh0aGlzLmdldFgxKHRydWUpL2RheXNXaWR0aCksZGF5czI9TWF0aC5yb3VuZCh0aGlzLmdldFgyKHRydWUpL2RheXNXaWR0aCk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcblx0XHRcdFx0ZW5kOmJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMi0xKVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0Z2V0UmVjdHBhcmFtczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHBhcmVudD10aGlzLm1vZGVsO1xuXHRcdFx0dmFyIHhzPXRoaXMuY2FsY3VsYXRlWChwYXJlbnQpO1xuXHRcdFx0dmFyIHNldHRpbmc9dGhpcy5zZXR0aW5nO1xuXHRcdFx0cmV0dXJuIF8uZXh0ZW5kKHtcblx0XHRcdFx0eDogeHMueDEsXG5cdFx0XHRcdHdpZHRoOnhzLngyLXhzLngxLFxuXHRcdFx0XHR5OiBzZXR0aW5nLmdhcCxcblx0XHRcdH0sc2V0dGluZy50b3BCYXIpO1xuXHRcdH0sXG5cdFx0dG9nZ2xlQ2hpbGRyZW46ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBzaG93PXRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKTtcblx0XHRcdHZhciBjaGlsZHJlbj10aGlzLmNoaWxkcmVuO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxjaGlsZHJlbi5sZW5ndGg7aSsrKXtcblx0XHRcdFx0Y2hpbGRyZW5baV0udG9nZ2xlKHNob3cpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzeW5jOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnN5bmNpbmcgPSB0cnVlO1xuXHRcdFx0Y29uc29sZS5sb2coJ3BhcmVudCBzeW5jIGNhbGxlZCcpO1xuXHRcdFx0dmFyIHBkYXRlcz10aGlzLmNhbGN1bGF0ZVBhcmVudERhdGVzKCk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCh7XG5cdFx0XHRcdHN0YXJ0OiBwZGF0ZXMuc3RhcnQsXG5cdFx0XHRcdGVuZDpwZGF0ZXMuZW5kXG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0dmFyIGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcblx0XHRcdGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdFx0Y2hpbGQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdzZXR0aW5nIHN5bmMgdG8gZmFsc2UnKTtcblxuXHRcdFx0dGhpcy5zeW5jaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9O1xuXG5fLmV4dGVuZChCYXJHcm91cC5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyR3JvdXA7XG4iLCJ2YXIgQmFyR3JvdXAgPSByZXF1aXJlKCcuL0Jhckdyb3VwJyk7XG52YXIgQmFyID0gcmVxdWlyZSgnLi9CYXInKTtcblxudmFyIHZpZXdPcHRpb25zID0gWydtb2RlbCcsICdjb2xsZWN0aW9uJ107XG5cbnZhciBLaW5ldGljVmlldyA9IEJhY2tib25lLktpbmV0aWNWaWV3ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR0aGlzLmNpZCA9IF8udW5pcXVlSWQoJ3ZpZXcnKTtcblx0Xy5leHRlbmQodGhpcywgXy5waWNrKG9wdGlvbnMsIHZpZXdPcHRpb25zKSk7XG5cdHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbl8uZXh0ZW5kKEtpbmV0aWNWaWV3LnByb3RvdHlwZSwgQmFja2JvbmUuRXZlbnRzLCB7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cblxuS2luZXRpY1ZpZXcuZXh0ZW5kPUJhY2tib25lLk1vZGVsLmV4dGVuZDtcblxudmFyIEtDYW52YXNWaWV3ID0gS2luZXRpY1ZpZXcuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0dGhpcy5ncm91cHM9W107XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHRoaXMuYXBwLnNldHRpbmdzO1xuXHRcdHZhciBzZXR0aW5nID0gIHRoaXMuYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2Rpc3BsYXknKTtcblx0XHRcblx0XHR0aGlzLnN0YWdlID0gbmV3IEtpbmV0aWMuU3RhZ2Uoe1xuXHRcdFx0Y29udGFpbmVyIDogJ2dhbnR0LWNvbnRhaW5lcicsXG5cdFx0XHRoZWlnaHQ6IDU4MCxcblx0XHRcdHdpZHRoOiBzZXR0aW5nLnNjcmVlbldpZHRoIC0gc2V0dGluZy50SGlkZGVuV2lkdGggLSAyMCxcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6ICBmdW5jdGlvbihwb3MpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR4OiBwb3MueCxcblx0XHRcdFx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLkZsYXllciA9IG5ldyBLaW5ldGljLkxheWVyKHt9KTtcblx0XHR0aGlzLkJsYXllciA9IG5ldyBLaW5ldGljLkxheWVyKHt9KTtcblx0XHRcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmFwcC50YXNrcywgJ2NoYW5nZTpzb3J0aW5kZXgnLCB0aGlzLnJlbmRlclJlcXVlc3QpO1xuXG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKCFwYXJzZUludChtb2RlbC5nZXQoJ3BhcmVudGlkJyksIDEwKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyb3Vwcy5wdXNoKG5ldyBCYXJHcm91cCh7XG5cdFx0XHRcdG1vZGVsOiBtb2RlbCxcblx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHR9KSk7XG5cblx0XHRcdHZhciBnc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdncm91cCcpO1xuXHRcdFx0Z3NldHRpbmcuY3VycmVudFkgPSBnc2V0dGluZy5pbmlZO1xuXG5cdFx0XHR0aGlzLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uKGdyb3VwaSkge1xuXHRcdFx0XHRncm91cGkuc2V0WShnc2V0dGluZy5jdXJyZW50WSk7XG5cdFx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZICs9IGdyb3VwaS5nZXRIZWlnaHQoKTtcblx0XHRcdFx0dGhpcy5GbGF5ZXIuYWRkKGdyb3VwaS5ncm91cCk7XG5cdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdFx0dGhpcy5yZW5kZXJncm91cHMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmluaXRpYWxpemVGcm9udExheWVyKCk7XG5cdFx0dGhpcy5pbml0aWFsaXplQmFja0xheWVyKCk7XG5cdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdH0sXG5cdHJlbmRlclJlcXVlc3QgOiAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHdhaXRpbmcgPSBmYWxzZTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAod2FpdGluZykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR3YWl0aW5nID0gdHJ1ZTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMucmVuZGVyZ3JvdXBzKCk7XG5cdFx0XHRcdHdhaXRpbmcgPSBmYWxzZTtcblx0XHRcdH0uYmluZCh0aGlzKSwgMTApO1xuXHRcdH07XG5cdH0pKCksXG5cdGluaXRpYWxpemVCYWNrTGF5ZXI6ZnVuY3Rpb24oKXtcblx0XHR2YXIgc2hhcGUgPSBuZXcgS2luZXRpYy5TaGFwZSh7XG5cdFx0XHRzdHJva2U6ICcjYmJiJyxcblx0XHRcdHN0cm9rZVdpZHRoOiAwLFxuXHRcdFx0c2NlbmVGdW5jOnRoaXMuZ2V0U2NlbmVGdW5jKClcblx0XHR9KTtcblx0XHR0aGlzLkJsYXllci5hZGQoc2hhcGUpO1xuXHRcdFxuXHR9LFxuXHRpbml0aWFsaXplRnJvbnRMYXllcjpmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdFwidXNlIHN0cmljdFwiO1xuXHRcdFx0aWYgKCF0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR0aGlzLmFkZEdyb3VwKHRhc2spO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpO1xuXHR9LFxuXHRiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhbGN1bGF0aW5nPWZhbHNlO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuY29sbGVjdGlvbiwgJ2NoYW5nZTphY3RpdmUnLCB0aGlzLnJlbmRlcmdyb3Vwcyk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5hcHAuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIHRoaXMucmVuZGVyQmFycyk7XG5cdFx0JCgnI2dhbnR0LWNvbnRhaW5lcicpLm1vdXNld2hlZWwoZnVuY3Rpb24oZSl7XG5cdFx0XHRpZihjYWxjdWxhdGluZykge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR2YXIgY2RwaSA9ICB0aGlzLnNldHRpbmdzLmdldCgnZHBpJyksIGRwaT0wO1xuXHRcdFx0Y2FsY3VsYXRpbmc9dHJ1ZTtcblx0XHRcdGlmIChlLm9yaWdpbmFsRXZlbnQud2hlZWxEZWx0YSA+IDApe1xuXHRcdFx0XHRkcGkgPSBNYXRoLm1heCgxLCBjZHBpIC0gMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkcGkgPSBjZHBpICsgMTtcblx0XHRcdH1cblx0XHRcdGlmIChkcGkgPT09IDEpe1xuXHRcdFx0XHRpZiAoIHRoaXMuYXBwLnNldHRpbmdzLmdldCgnaW50ZXJ2YWwnKSA9PT0gJ2F1dG8nKSB7XG5cdFx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmdzLnNldCh7aW50ZXJ2YWw6J2RhaWx5J30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZ3Muc2V0KHtpbnRlcnZhbDogJ2F1dG8nLCBkcGk6IGRwaX0pO1xuXHRcdFx0fVxuXHRcdFx0Y2FsY3VsYXRpbmcgPSBmYWxzZTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0aWYgKGNhbGN1bGF0aW5nKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dmFyIGNkcGkgPSAgdGhpcy5hcHAuc2V0dGluZ3MuZ2V0KCdkcGknKSwgZHBpPTA7XG5cdFx0Y2FsY3VsYXRpbmcgID10cnVlO1xuXHRcdGRwaSA9IE1hdGgubWF4KDAsIGNkcGkgKyAyNSk7XG5cblx0XHRpZiAoZHBpID09PSAxKSB7XG5cdFx0XHRpZiggdGhpcy5hcHAuc2V0dGluZ3MuZ2V0KCdpbnRlcnZhbCcpPT09J2F1dG8nKSB7XG5cdFx0XHRcdCB0aGlzLmFwcC5zZXR0aW5ncy5zZXQoe2ludGVydmFsOidkYWlseSd9KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0IHRoaXMuYXBwLnNldHRpbmdzLnNldCh7aW50ZXJ2YWw6ICdhdXRvJywgZHBpOiBkcGl9KTtcblx0XHR9XG5cblx0XHRjYWxjdWxhdGluZyA9IGZhbHNlO1xuXHRcdCQoJyNnYW50dC1jb250YWluZXInKS5vbignZHJhZ21vdmUnLCBmdW5jdGlvbigpe1xuXHRcdFx0aWYoY2FsY3VsYXRpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNkcGkgPSAgdGhpcy5hcHAuc2V0dGluZ3MuZ2V0KCdkcGknKSwgZHBpPTA7XG5cdFx0XHRjYWxjdWxhdGluZyA9IHRydWU7XG5cdFx0XHRkcGkgPSBjZHBpICsgMTtcblxuXHRcdFx0aWYoZHBpPT09MSl7XG5cdFx0XHRcdGlmICggdGhpcy5hcHAuc2V0dGluZ3MuZ2V0KCdpbnRlcnZhbCcpID09PSAnYXV0bycpIHtcblx0XHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZ3Muc2V0KHtpbnRlcnZhbDogJ2RhaWx5J30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZ3Muc2V0KHtpbnRlcnZhbDonYXV0bycsZHBpOmRwaX0pO1xuXHRcdFx0fVxuXHRcdFx0Y2FsY3VsYXRpbmcgPSBmYWxzZTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXG5cdGFkZEdyb3VwOiBmdW5jdGlvbih0YXNrZ3JvdXApIHtcblx0XHR0aGlzLmdyb3Vwcy5wdXNoKG5ldyBCYXJHcm91cCh7XG5cdFx0XHRtb2RlbDogdGFza2dyb3VwLFxuXHRcdFx0c2V0dGluZ3MgOiB0aGlzLmFwcC5zZXR0aW5nc1xuXHRcdH0pKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGdzZXR0aW5nID0gIHRoaXMuYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cblx0XHRnc2V0dGluZy5jdXJyZW50WSA9IGdzZXR0aW5nLmluaVk7XG5cdFx0XG5cdFx0dGhpcy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbihncm91cGkpIHtcblx0XHRcdGdyb3VwaS5zZXRZKGdzZXR0aW5nLmN1cnJlbnRZKTtcblx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZICs9IGdyb3VwaS5nZXRIZWlnaHQoKTtcblx0XHRcdHRoaXMuRmxheWVyLmFkZChncm91cGkuZ3JvdXApO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cblxuXHRcdC8vbG9vcCB0aHJvdWdoIGdyb3Vwc1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmdyb3Vwcy5sZW5ndGg7IGkrKyl7XG5cblx0XHRcdC8vbG9vcCB0aHJvdWdoIHRhc2tzXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5ncm91cHNbaV0uY2hpbGRyZW4ubGVuZ3RoOyBqKyspe1xuXG5cdFx0XHRcdC8vaWYgdGhyZXJlIGlzIGRlcGVuZGVuY3lcblx0XHRcdFx0aWYgKHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2pdLm1vZGVsLmF0dHJpYnV0ZXMuZGVwZW5kZW5jeSAhPT0gJycpe1xuXG5cdFx0XHRcdFx0Ly9wYXJzZSBkZXBlbmRlbmNpZXNcblx0XHRcdFx0XHR2YXIgZGVwZW5kZW5jeSA9ICQucGFyc2VKU09OKHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2pdLm1vZGVsLmF0dHJpYnV0ZXMuZGVwZW5kZW5jeSk7XG5cblx0XHRcdFx0XHRmb3IodmFyIGw9MDsgbCA8IGRlcGVuZGVuY3kubGVuZ3RoOyBsKyspe1xuXHRcdFx0XHRcdFx0Zm9yKCB2YXIgaz0wOyBrIDwgdGhpcy5ncm91cHNbaV0uY2hpbGRyZW4ubGVuZ3RoOyBrKyspe1xuXHRcdFx0XHRcdFx0XHRpZiAoZGVwZW5kZW5jeVtsXSA9PSB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbltrXS5tb2RlbC5hdHRyaWJ1dGVzLmlkICl7XG5cdFx0XHRcdFx0XHRcdFx0QmFyLmNyZWF0ZVJlbGF0aW9uKHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2pdLCB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbltrXSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIpO1xuXHRcdHRoaXMuc3RhZ2UuYWRkKHRoaXMuRmxheWVyKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZW5kZXJCYXJzOmZ1bmN0aW9uKCl7XG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmdyb3Vwcy5sZW5ndGg7aSsrKXtcblx0XHRcdHRoaXMuZ3JvdXBzW2ldLnJlbmRlckNoaWxkcmVuKCk7XG5cdFx0fSBcblx0XHR0aGlzLkZsYXllci5kcmF3KCk7XG5cdFx0dGhpcy5CbGF5ZXIuZHJhdygpO1xuXHR9LFxuXG5cdHJlbmRlcmdyb3VwczpmdW5jdGlvbigpe1xuXHRcdHZhciBnc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdncm91cCcpO1xuXHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeSh0aGlzLmdyb3VwcywgZnVuY3Rpb24oaXRlbXZpZXcpe1xuXHRcdFx0cmV0dXJuIGl0ZW12aWV3Lm1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0fSk7XG5cdFx0Z3NldHRpbmcuY3VycmVudFkgPSBnc2V0dGluZy5pbmlZO1xuXHRcdHNvcnRlZC5mb3JFYWNoKGZ1bmN0aW9uKGdyb3VwaSkge1xuXHRcdFx0Z3JvdXBpLnNldFkoZ3NldHRpbmcuY3VycmVudFkpO1xuXHRcdFx0Z3JvdXBpLnJlbmRlclNvcnRlZENoaWxkcmVuKCk7XG5cdFx0XHRnc2V0dGluZy5jdXJyZW50WSArPSBncm91cGkuZ2V0SGVpZ2h0KCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5GbGF5ZXIuZHJhdygpO1xuXHR9LFxuXHRzZXRXaWR0aDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLnN0YWdlLnNldFdpZHRoKHZhbHVlKTtcblx0fSxcblx0Z2V0U2NlbmVGdW5jOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNldHRpbmcgPSB0aGlzLmFwcC5zZXR0aW5ncztcblx0XHR2YXIgc2Rpc3BsYXkgPSBzZXR0aW5nLnNkaXNwbGF5O1xuXHRcdHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XG5cdFx0dmFyIG9mZnNldCA9IGJvcmRlcldpZHRoLzI7XG5cdFx0dmFyIHJvd0hlaWdodCA9IDIwO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xuXHRcdFx0dmFyIHNhdHRyID0gc2V0dGluZy5zYXR0cjtcblx0XHRcdHZhciBpLCBzID0gMCwgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xuXHRcdFx0XG5cdFx0XHR2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdC8vZHJhdyB0aHJlZSBsaW5lc1xuXHRcdFx0Zm9yKGkgPSAxOyBpIDwgNCA7IGkrKyl7XG5cdFx0XHRcdGNvbnRleHQubW92ZVRvKG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XG5cdFx0XHRcdGNvbnRleHQubGluZVRvKGxpbmVXaWR0aCArIG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciB5aSA9IDAsIHlmID0gcm93SGVpZ2h0LCB4aSA9IDA7XG5cdFx0XHRmb3IgKHMgPSAxOyBzIDwgMzsgcysrKXtcblx0XHRcdFx0eD0wLGxlbmd0aD0wO1xuXHRcdFx0XHRmb3IoaT0wLGlMZW49aERhdGFbc10ubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHRcdGxlbmd0aD1oRGF0YVtzXVtpXS5kdXJhdGlvbipkYXlzV2lkdGg7XG5cdFx0XHRcdFx0eCA9IHgrbGVuZ3RoO1xuXHRcdFx0XHRcdHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xuXHRcdFx0XHRcdGNvbnRleHQubW92ZVRvKHhpLHlpKTtcblx0XHRcdFx0XHRjb250ZXh0LmxpbmVUbyh4aSx5Zik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5zYXZlKCk7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5mb250ID0gJzEwcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHgtbGVuZ3RoLzIseWYtcm93SGVpZ2h0LzIpO1xuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHlpPXlmLHlmPSB5Zityb3dIZWlnaHQ7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHg9MCxsZW5ndGg9MCxzPTMseWY9MTIwMDtcblx0XHRcdHZhciBkcmFnSW50ID0gcGFyc2VJbnQoc2F0dHIuZHJhZ0ludGVydmFsKTtcblx0XHRcdHZhciBoaWRlRGF0ZSA9IGZhbHNlO1xuXHRcdFx0aWYoIGRyYWdJbnQgPT0gMTQgfHwgZHJhZ0ludCA9PSAzMCl7XG5cdFx0XHRcdGhpZGVEYXRlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGZvcihpPTAsaUxlbj1oRGF0YVtzXS5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdGxlbmd0aD1oRGF0YVtzXVtpXS5kdXJhdGlvbipkYXlzV2lkdGg7XG5cdFx0XHRcdHggPSB4K2xlbmd0aDtcblx0XHRcdFx0eGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XG5cdFx0XHRcdGNvbnRleHQubW92ZVRvKHhpLHlpKTtcblx0XHRcdFx0Y29udGV4dC5saW5lVG8oeGkseWYpO1xuXHRcdFx0XHRcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5zYXZlKCk7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICc2cHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdsZWZ0Jztcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcblx0XHRcdFx0Ly8gZGF0ZSBoaWRlIG9uIHNwZWNpZmljIHZpZXdzXG5cdFx0XHRcdGlmIChoaWRlRGF0ZSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5mb250ID0gJzFwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG5cdFx0XHRcdH07XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeC1sZW5ndGgrNDAseWkrcm93SGVpZ2h0LzIpO1xuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcblxuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5zdHJva2VTaGFwZSh0aGlzKTtcblx0XHR9O1xuXHR9LFxuXHRyZW5kZXJCYWNrTGF5ZXI6IGZ1bmN0aW9uKCl7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtDYW52YXNWaWV3OyIsImZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhhcHApIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5hcHAgPSBhcHA7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICdkaXYnLFxyXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzLnBhcmVudCgpKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmFwcC50YXNrcy5nZXQoaWQpO1xyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdkZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmFkZU91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdwcm9wZXJ0aWVzJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHByb3BlcnR5ID0gJy5wcm9wZXJ0eS0nO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXR1cyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnMTA4JzogJ1JlYWR5JyxcclxuICAgICAgICAgICAgICAgICAgICAnMTA5JzogJ09wZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICcxMTAnOiAnQ29tcGxldGUnXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdmFyICRlbCA9ICQoZG9jdW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KyduYW1lJykuaHRtbChtb2RlbC5nZXQoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2Rlc2NyaXB0aW9uJykuaHRtbChtb2RlbC5nZXQoJ2Rlc2NyaXB0aW9uJykpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydzdGFydCcpLmh0bWwoY29udmVydERhdGUobW9kZWwuZ2V0KCdzdGFydCcpKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2VuZCcpLmh0bWwoY29udmVydERhdGUobW9kZWwuZ2V0KCdlbmQnKSkpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydzdGF0dXMnKS5odG1sKHN0YXR1c1ttb2RlbC5nZXQoJ3N0YXR1cycpXSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUobW9kZWwuZ2V0KCdzdGFydCcpKTtcclxuICAgICAgICAgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUobW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyXG4gICAgICAgICAgICAgICAgaWYoc3RhcnRkYXRlICE9IFwiXCIgJiYgZW5kZGF0ZSAhPSBcIlwiKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2R1cmF0aW9uJykuaHRtbChNYXRoLmZsb29yKDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJy51aS5wcm9wZXJ0aWVzJykubW9kYWwoJ3NldHRpbmcnLCAndHJhbnNpdGlvbicsICd2ZXJ0aWNhbCBmbGlwJylcclxuICAgICAgICAgICAgICAgICAgICAubW9kYWwoJ3Nob3cnKVxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbnZlcnREYXRlKGlucHV0Rm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcGFkKHMpIHsgcmV0dXJuIChzIDwgMTApID8gJzAnICsgcyA6IHM7IH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKGlucHV0Rm9ybWF0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3BhZChkLmdldERhdGUoKSksIHBhZChkLmdldE1vbnRoKCkrMSksIGQuZ2V0RnVsbFllYXIoKV0uam9pbignLycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0Fib3ZlJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayhkYXRhLCAnYWJvdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdyb3dCZWxvdycpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfSwgJ2JlbG93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnaW5kZW50Jyl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5leHBhbmQtbWVudScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbF9pZCA9ICQodGhpcykuY2xvc2VzdCgnZGl2JykucHJldigpLmZpbmQoJy5zdWItdGFzaycpLmxhc3QoKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHByZXZNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChyZWxfaWQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudF9pZCA9IHByZXZNb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ3BhcmVudGlkJywgcGFyZW50X2lkKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHZhciB0b2JlQ2hpbGQgPSAkKHRoaXMpLm5leHQoKS5jaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5LmVhY2godG9iZUNoaWxkLCBmdW5jdGlvbihpbmRleCwgZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkTW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoY2hpbGRJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJyxwYXJlbnRfaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCd0YXNrJykuYWRkQ2xhc3MoJ3N1Yi10YXNrJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogJzMwcHgnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ291dGRlbnQnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgncGFyZW50aWQnLDApO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvYmVDaGlsZCA9ICQodGhpcykucGFyZW50KCkuY2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJySW5kZXggPSAkKHRoaXMpLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0b2JlQ2hpbGQsIGZ1bmN0aW9uKGluZGV4LCBkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA+IGN1cnJJbmRleCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZElkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRNb2RlbCA9IHNlbGYuYXBwLnRhc2tzLmdldChjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJyxtb2RlbC5nZXQoJ2lkJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucHJlcGVuZCgnPGxpIGNsYXNzPVwiZXhwYW5kLW1lbnVcIj48aSBjbGFzcz1cInRyaWFuZ2xlIHVwIGljb25cIj48L2k+IDwvbGk+Jyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdzdWItdGFzaycpLmFkZENsYXNzKCd0YXNrJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogJzBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbnZhc1ZpZXcucmVuZGVyZ3JvdXBzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIFwicm93QWJvdmVcIjoge25hbWU6IFwiTmV3IFJvdyBBYm92ZVwiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJyb3dCZWxvd1wiOiB7bmFtZTogXCJOZXcgUm93IEJlbG93XCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7bmFtZTogXCJJbmRlbnQgUm93XCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcIm91dGRlbnRcIjoge25hbWU6IFwiT3V0ZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwic2VwMVwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge25hbWU6IFwiUHJvcGVydGllc1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAyXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwiZGVsZXRlXCI6IHtuYW1lOiBcIkRlbGV0ZSBSb3dcIiwgaWNvbjogXCJcIn1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUuYWRkVGFzayA9IGZ1bmN0aW9uKGRhdGEsIGluc2VydFBvcykge1xyXG4gICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuYXBwLnRhc2tzLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICB0YXNrLnNhdmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udGV4dE1lbnVWaWV3OyIsIlxudmFyIHRlbXBsYXRlID0gXCI8ZGl2PlxcclxcbiAgICA8dWw+XFxyXFxuICAgICAgICA8JSB2YXIgc2V0dGluZz1hcHAuc2V0dGluZ3M7JT5cXHJcXG4gICAgICAgIDwlIGlmKGlzUGFyZW50KXsgJT4gPGxpIGNsYXNzPVxcXCJleHBhbmQtbWVudVxcXCI+PGkgY2xhc3M9XFxcInRyaWFuZ2xlIGRvd24gaWNvblxcXCI+PC9pPjwvbGk+PCUgfSAlPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtbmFtZVxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJuYW1lXFxcIixuYW1lKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLXN0YXJ0XFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcInN0YXJ0XFxcIixzdGFydCkpOyU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWVuZFxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJlbmRcXFwiLGVuZCkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1jb21wbGV0ZVxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJjb21wbGV0ZVxcXCIsY29tcGxldGUpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtc3RhdHVzXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcInN0YXR1c1xcXCIsc3RhdHVzKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWR1cmF0aW9uXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImR1cmF0aW9uXFxcIiwwLHtcXFwic3RhcnRcXFwiOnN0YXJ0LFxcXCJlbmRcXFwiOmVuZH0pKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJyZW1vdmUtaXRlbVxcXCI+PGJ1dHRvbiBjbGFzcz1cXFwibWluaSByZWQgdWkgYnV0dG9uXFxcIj4gPGkgY2xhc3M9XFxcInNtYWxsIHRyYXNoIGljb25cXFwiPjwvaT48L2J1dHRvbj48L2xpPlxcclxcbiAgICA8L3VsPlxcclxcbjwvZGl2PlwiO1xuXG52YXIgVGFza0l0ZW1WaWV3PUJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZSA6ICdsaScsXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKHRlbXBsYXRlKSxcblx0aXNQYXJlbnQ6IGZhbHNlLFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpe1xuXHRcdHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdlZGl0cm93JywgdGhpcy5lZGl0KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6bmFtZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCBjaGFuZ2U6Y29tcGxldGUgY2hhbmdlOnN0YXR1cycsIHRoaXMucmVuZGVyUm93KTtcblx0XHR0aGlzLiRlbC5ob3ZlcihmdW5jdGlvbihlKXtcblx0XHRcdCQoZG9jdW1lbnQpLmZpbmQoJy5pdGVtLXNlbGVjdG9yJykuc3RvcCgpLmNzcyh7XG5cdFx0XHRcdHRvcDogKCQoZS5jdXJyZW50VGFyZ2V0KS5vZmZzZXQoKS50b3ApKydweCdcblx0XHRcdH0pLmZhZGVJbigpO1xuXHRcdH0sIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKGRvY3VtZW50KS5maW5kKCcuaXRlbS1zZWxlY3RvcicpLnN0b3AoKS5mYWRlT3V0KCk7XG5cdFx0fSk7XG5cdFx0dGhpcy4kZWwub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xuXHRcdFx0JChkb2N1bWVudCkuZmluZCgnLml0ZW0tc2VsZWN0b3InKS5zdG9wKCkuZmFkZU91dCgpO1xuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKHBhcmVudCl7XG5cdFx0dmFyIGFkZENsYXNzPSdzdWItdGFzayBkcmFnLWl0ZW0nO1xuXHRcdFxuXHRcdGlmKHBhcmVudCl7XG5cdFx0XHRhZGRDbGFzcz1cInRhc2tcIjtcblx0XHRcdHRoaXMuaXNQYXJlbnQgPSB0cnVlO1xuXHRcdFx0dGhpcy5zZXRFbGVtZW50KCQoJzxkaXY+JykpO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5pc1BhcmVudCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5zZXRFbGVtZW50KCQoJzxsaT4nKSk7XG5cdFx0XHR0aGlzLiRlbC5kYXRhKHtcblx0XHRcdFx0aWQgOiB0aGlzLm1vZGVsLmlkXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoYWRkQ2xhc3MpO1xuXHRcdHRoaXMuJGVsLmF0dHIoJ2lkJywgdGhpcy5tb2RlbC5jaWQpO1xuXHRcdHJldHVybiB0aGlzLnJlbmRlclJvdygpO1xuXHR9LFxuXHRyZW5kZXJSb3c6ZnVuY3Rpb24oKXtcblx0XHR2YXIgZGF0YSA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cdFx0ZGF0YS5pc1BhcmVudCA9IHRoaXMuaXNQYXJlbnQ7XG5cdFx0ZGF0YS5hcHAgPSB0aGlzLmFwcDtcblx0XHR0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUoZGF0YSkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRlZGl0OmZ1bmN0aW9uKGV2dCl7XG5cdFx0dmFyIHRhcmdldCA9ICQoZXZ0LnRhcmdldCk7XG5cdFx0dmFyIHdpZHRoICA9IHBhcnNlSW50KHRhcmdldC5jc3MoJ3dpZHRoJyksIDEwKSAtIDU7XG5cdFx0dmFyIGZpZWxkID0gdGFyZ2V0LmF0dHIoJ2NsYXNzJykuc3BsaXQoJy0nKVsxXTtcblx0XHR2YXIgZm9ybSA9IHRoaXMuYXBwLnNldHRpbmdzLmdldEZvcm1FbGVtKGZpZWxkLCB0aGlzLm1vZGVsLCB0aGlzLm9uRWRpdCwgdGhpcyk7XG5cdFx0Zm9ybS5jc3Moe1xuXHRcdFx0d2lkdGg6IHdpZHRoICsgJ3B4J1xuXHRcdH0pO1xuXG5cdFx0dGFyZ2V0Lmh0bWwoZm9ybSk7XG5cdFx0Zm9ybS5mb2N1cygpO1xuXHR9LFxuXHRvbkVkaXQ6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKXtcblx0XHRpZiAobmFtZSA9PT0gJ2R1cmF0aW9uJykge1xuXHRcdFx0dmFyIHN0YXJ0ID0gdGhpcy5tb2RlbC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR2YXIgZW5kID0gc3RhcnQuY2xvbmUoKS5hZGREYXlzKHBhcnNlSW50KHZhbHVlLCAxMCkgLSAxKTtcbi8vXHRcdFx0dGhpcy5tb2RlbC5zZXQoJ2VuZCcsIGVuZCk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRjb25zb2xlLmVycm9yKG5hbWUpO1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQobmFtZSwgdmFsdWUpO1xuXHRcdFx0dGhpcy5tb2RlbC5zYXZlKCk7XG5cdFx0fVxuXHRcdHRoaXMucmVuZGVyUm93KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tJdGVtVmlldztcbiIsInZhciBUYXNrSXRlbVZpZXcgPSByZXF1aXJlKCcuL1Rhc2tJdGVtVmlldycpO1xuXG52YXIgVGFza1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICdsaScsXG5cdGNsYXNzTmFtZTogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyxcblx0Y29sbGFwc2VkIDogZmFsc2UsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdH0sXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAudGFzayAuZXhwYW5kLW1lbnUnOiAnY29sbGFwc2VPckV4cGFuZCcsXG5cdFx0J2NsaWNrIC5hZGQtaXRlbSBidXR0b24nOiAnYWRkSXRlbScsXG5cdFx0J2NsaWNrIC5yZW1vdmUtaXRlbSBidXR0b24nOiAncmVtb3ZlSXRlbSdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzLm1vZGVsO1xuXHRcdHZhciBpdGVtVmlldyA9IG5ldyBUYXNrSXRlbVZpZXcoe1xuXHRcdFx0bW9kZWwgOiBwYXJlbnQsXG5cdFx0XHRhcHAgOiB0aGlzLmFwcFxuXHRcdH0pO1xuXG5cdFx0dGhpcy4kcGFyZW50ZWwgPSBpdGVtVmlldy5yZW5kZXIodHJ1ZSkuJGVsO1xuXHRcdHRoaXMuJGVsLmFwcGVuZCh0aGlzLiRwYXJlbnRlbCk7XG5cblx0XHR0aGlzLiRlbC5kYXRhKHtcblx0XHRcdGlkIDogcGFyZW50LmlkXG5cdFx0fSk7XG5cdFx0dGhpcy4kY2hpbGRlbCA9ICQoJzxvbCBjbGFzcz1cInN1Yi10YXNrLWxpc3Qgc29ydGFibGVcIj48L29sPicpO1xuXG5cdFx0dGhpcy4kZWwuYXBwZW5kKHRoaXMuJGNoaWxkZWwpO1xuXHRcdHZhciBjaGlsZHJlbiA9IF8uc29ydEJ5KHRoaXMubW9kZWwuY2hpbGRyZW4ubW9kZWxzLCBmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHR9KTtcblx0XHRjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHRcdGl0ZW1WaWV3PW5ldyBUYXNrSXRlbVZpZXcoe1xuXHRcdFx0XHRtb2RlbDogY2hpbGQsXG5cdFx0XHRcdGFwcDogdGhpcy5hcHBcblx0XHRcdH0pO1xuXHRcdFx0aXRlbVZpZXcucmVuZGVyKCk7XG5cdFx0XHR0aGlzLiRjaGlsZGVsLmFwcGVuZChpdGVtVmlldy5lbCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdHRoaXMudG9nZ2xlUGFyZW50KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGNvbGxhcHNlT3JFeHBhbmQ6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsYXBzZWQgPSAhdGhpcy5jb2xsYXBzZWQ7XG5cdFx0dGhpcy50b2dnbGVQYXJlbnQoKTtcblx0fSxcblx0dG9nZ2xlUGFyZW50OiBmdW5jdGlvbigpIHtcblx0XHRcInVzZSBzdHJpY3RcIjtcblx0XHR2YXIgc3RyID0gdGhpcy5jb2xsYXBzZWQgPyAnPGkgY2xhc3M9XCJ0cmlhbmdsZSB1cCBpY29uXCI+PC9pPiAnIDogJzxpIGNsYXNzPVwidHJpYW5nbGUgZG93biBpY29uXCI+PC9pPic7XG5cdFx0dGhpcy4kY2hpbGRlbC5zbGlkZVRvZ2dsZSgpO1xuXHRcdHRoaXMuJHBhcmVudGVsLmZpbmQoJy5leHBhbmQtbWVudScpLmh0bWwoc3RyKTtcblx0fSxcblx0YWRkSXRlbTogZnVuY3Rpb24oZXZ0KXtcblx0XHQkKGV2dC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd1bCcpLm5leHQoKS5hcHBlbmQoJzx1bCBjbGFzcz1cInN1Yi10YXNrXCIgaWQ9XCJjJytNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMTAwMDApICsgMSkrJ1wiPjxsaSBjbGFzcz1cImNvbC1uYW1lXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJOZXcgcGxhblwiIHNpemU9XCIzOFwiPjwvbGk+PGxpIGNsYXNzPVwiY29sLXN0YXJ0XCI+PGlucHV0IHR5cGU9XCJkYXRlXCIgcGxhY2Vob2xkZXI9XCJTdGFydCBEYXRlXCIgc3R5bGU9XCJ3aWR0aDo4MHB4O1wiPjwvbGk+PGxpIGNsYXNzPVwiY29sLWVuZFwiPjxpbnB1dCB0eXBlPVwiZGF0ZVwiIHBsYWNlaG9sZGVyPVwiRW5kIERhdGVcIiBzdHlsZT1cIndpZHRoOjgwcHg7XCI+PC9saT48bGkgY2xhc3M9XCJjb2wtY29tcGxldGVcIj48aW5wdXQgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiMlwiIHN0eWxlPVwid2lkdGg6IDMwcHg7bWFyZ2luLWxlZnQ6IC0xNHB4O1wiIG1pbj1cIjBcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1zdGF0dXNcIj48c2VsZWN0IHN0eWxlPVwid2lkdGg6IDcwcHg7XCI+PG9wdGlvbiB2YWx1ZT1cImluY29tcGxldGVcIj5Jbm9tcGxldGVkPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cImNvbXBsZXRlZFwiPkNvbXBsZXRlZDwvb3B0aW9uPjwvc2VsZWN0PjwvbGk+PGxpIGNsYXNzPVwiY29sLWR1cmF0aW9uXCI+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIjI0XCIgc3R5bGU9XCJ3aWR0aDogMzJweDttYXJnaW4tbGVmdDogLThweDtcIiBtaW49XCIwXCI+IGQ8L2xpPjxsaSBjbGFzcz1cInJlbW92ZS1pdGVtXCI+PGJ1dHRvbiBjbGFzcz1cIm1pbmkgcmVkIHVpIGJ1dHRvblwiPiA8aSBjbGFzcz1cInNtYWxsIHRyYXNoIGljb25cIj48L2k+PC9idXR0b24+PC9saT48L3VsPicpLmhpZGUoKS5zbGlkZURvd24oKTtcblx0fSxcblx0cmVtb3ZlSXRlbTogZnVuY3Rpb24oZXZ0KXtcblx0XHR2YXIgJHBhcmVudFVMID0gJChldnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnb2wgdWwnKS5wYXJlbnQoKS5wYXJlbnQoKTtcblx0XHR2YXIgaWQgPSAkcGFyZW50VUwuYXR0cignaWQnKTtcblx0XHR2YXIgdGFza01vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KGlkKTtcblx0XHRpZigkcGFyZW50VUwuaGFzQ2xhc3MoJ3Rhc2snKSl7XG5cdFx0XHQkcGFyZW50VUwubmV4dCgnb2wnKS5mYWRlT3V0KDEwMDAsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHR9KTtcblx0XHR9ZWxzZXtcblx0XHRcdCQoZXZ0LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3VsJykuZmFkZU91dCgxMDAwLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHRhc2tNb2RlbC5kZXN0cm95KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tWaWV3O1xuIl19
