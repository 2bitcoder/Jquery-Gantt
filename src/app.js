(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    "cfgdata": [
        {
            "Category": "Task Health",
            "data": [
                {
                    "ID": 15027,
                    "cfg_item": "Green",
                    "SortOrder": 0,
                    "cDefault": null,
                    "Alias": null
                },
                {
                    "ID": 15028,
                    "cfg_item": "Amber",
                    "SortOrder": 1,
                    "cDefault": null,
                    "Alias": null
                },
                {
                    "ID": 15029,
                    "cfg_item": "Red",
                    "SortOrder": 2,
                    "cDefault": null,
                    "Alias": null
                }
            ]
        },
        {
            "Category": "Task Status",
            "data": [
                {
                    "ID": 23,
                    "cfg_item": "In Progress",
                    "SortOrder": 2,
                    "cDefault": null,
                    "Alias": null
                },
                {
                    "ID": 24,
                    "cfg_item": "Complete",
                    "SortOrder": 3,
                    "cDefault": null,
                    "Alias": null
                },
                {
                    "ID": 218,
                    "cfg_item": "Ready",
                    "SortOrder": 1,
                    "cDefault": null,
                    "Alias": null
                },
                {
                    "ID": 15026,
                    "cfg_item": "Backlog",
                    "SortOrder": 0,
                    "cDefault": null,
                    "Alias": null
                }
            ]
        }
    ],
    "wodata": [
        {
            "WONumber": "WorkOrders",
            "data": [
                {
                    "ID": 43,
                    "WONumber": "WO10018",
                    "SortOrder": 43
                }
            ]
        }
    ],
    "resourcedata": [
        {
            "UserId": 1,
            "Username": "Greg Vandeligt",
            "JobTitle": "Program Manager"
        },
        {
            "UserId": 58,
            "Username": "James Gumley",
            "JobTitle": "Project Manager"
        },
        {
            "UserId": 2,
            "Username": "Lucy Minota",
            "JobTitle": null
        },
        {
            "UserId": 59,
            "Username": "Rob Tynan",
            "JobTitle": "Business Analyst"
        }
    ]
};

},{}],2:[function(require,module,exports){
"use strict";

var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: TaskModel,
	initialize : function() {
		this._preventSorting = false;
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
		var sortIndex = -1;
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
		this._preventSorting = true;
		this._resortChildren(data, -1, 0);
		this._preventSorting = false;
		this.sort();
	},
	subscribe : function() {
		this.listenTo(this, 'add', function(model) {
			if (model.get('parentid')) {
				var parent = this.find(function(m) {
					return m.id === model.get('parentid');
				});
				if (parent) {
					parent.children.add(model);
					model.parent = parent;
				} else {
					console.warn('can not find parent with id ' + model.get('parentid'));
					model.set('parentid', 0);
				}
			}
		});
		this.listenTo(this, 'reset', function() {
			this.linkChildren();
			this.checkSortedIndex();
			this._checkDependencies();
		});
		this.listenTo(this, 'change:parentid', function(task) {
			if (task.parent) {
				task.parent.children.remove(task);
				task.parent = undefined;
			}

			var newParent = this.get(task.get('parentid'));
			if (newParent) {
				newParent.children.add(task);
			}
			if (!this._preventSorting) {
				this.checkSortedIndex();
			}
		});
	},
	createDependency : function (beforeModel, afterModel) {
		if (this._canCreateDependence(beforeModel, afterModel)) {
			afterModel.dependOn(beforeModel);
		}
	},

	_canCreateDependence : function(beforeModel, afterModel) {
		if (beforeModel.hasParent(afterModel) || afterModel.hasParent(beforeModel)) {
			return false;
		}
		if ((beforeModel.get('depend') === afterModel.id) ||
			(afterModel.get('depend') === beforeModel.id)) {
			return false;
		}
		return true;
	},
	removeDependency : function(afterModel) {
		afterModel.clearDependence();
	},
	_checkDependencies : function() {
		this.each(function(task) {
			if (!task.get('depend')) {
				return;
			}
			var beforeModel = this.get(task.get('depend'));
			if (!beforeModel) {
				task.unset('depend').save();
			} else {
				task.dependOn(beforeModel);
			}
		}.bind(this));
	},
	outdent : function(task) {
		var underSublings = [];
		if (task.parent) {
			task.parent.children.each(function(child) {
				if (child.get('sortindex') <= task.get('sortindex')) {
					return;
				}
				underSublings.push(child);
			});
		}

		this._preventSorting = true;
		underSublings.forEach(function(child) {
			child.save('parentid', task.id);
		});
		this._preventSorting = false;
		if (task.parent && task.parent.parent) {
			task.save('parentid', task.parent.parent.id);
		} else {
			task.save('parentid', 0);
		}
	},
	indent : function(task) {
		var prevTask, i, m;
		for (i = this.length - 1; i >=0; i--) {
			m = this.at(i);
			if ((m.get('sortindex') < task.get('sortindex')) && (task.parent === m.parent)) {
				prevTask = m;
				break;
			}
		}
		if (prevTask) {
			task.save('parentid', prevTask.id);
		}
	}
});

module.exports = TaskCollection;


},{"../models/TaskModel":5}],3:[function(require,module,exports){
"use strict";

var TaskCollection = require('./collections/taskCollection');
var Settings = require('./models/SettingModel');

var GanttView = require('./views/GanttView');
var util = require('./utils/util');

function fetchCollection(app) {
	app.tasks.fetch({
		success : function() {
            // add empty task if no tasks from server
            if (app.tasks.length === 0) {
                app.tasks.reset([{
                    name : 'New task'
                }]);

            }
			console.log('Success loading tasks.');
			app.tasks.linkChildren();
			app.tasks.checkSortedIndex();

			app.settings = new Settings({}, {app : app});
			if (window.location.hostname.indexOf('localhost') === -1) {
				$.getJSON('/api/GanttConfig/wbs/43/2b00da46b57c0395', function(statuses) {
					app.settings = statuses;
				});
			}

			new GanttView({
				app : app,
				collection : app.tasks
			}).render();

			$('#loader').fadeOut();
		},
		error : function(err) {
			console.error('error loading');
			console.error(err);
		},
		parse: true,
		reset : true
	});
}


$(function () {
	var app = {};
	app.tasks = new TaskCollection();

	// detect API params from get, e.g. ?project=143&profile=17&sitekey=2b00da46b57c0395
	var params = util.getURLParams();
	if (params.project && params.profile && params.sitekey) {
		app.tasks.url = 'api/tasks/' + params.project + '/' + params.profile + '/' + params.sitekey;
	}
	fetchCollection(app);
});
},{"./collections/taskCollection":2,"./models/SettingModel":4,"./utils/util":6,"./views/GanttView":8}],4:[function(require,module,exports){
"use strict";

var util = require('../utils/util');
var testStatuses = require('../../../data/statuses');

//var hfunc = function(pos, evt) {
//	var dragInterval = app.settings.getSetting('attr', 'dragInterval');
//	var n = Math.round((pos.x - evt.inipos.x) / dragInterval);
//	return {
//		x: evt.inipos.x + n * dragInterval,
//		y: this.getAbsolutePosition().y
//	};
//};

var SettingModel = Backbone.Model.extend({
	defaults: {
		interval: 'fix',
		//days per interval
		dpi: 1
	},
	initialize: function(attrs, params) {
		this.app = params.app;
		this.statuses = testStatuses;
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
	findStatusId : function(status) {
		for(var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === 'Task Status') {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cfg_item.toLowerCase() === status.toLowerCase()) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	findHealthId : function(health) {
		for(var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === 'Task Health') {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cfg_item.toLowerCase() === health.toLowerCase()) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	findWOId : function(wo) {
		for(var i in this.statuses.wodata[0].data) {
			var data = this.statuses.wodata[0].data[i];
            if (data.WONumber.toLowerCase() === wo.toLowerCase()) {
                return data.ID;
            }
		}
	},
	calcminmax: function() {
		var minDate = new Date(), maxDate = minDate.clone().addYears(1);
		
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
	conDToT:(function(){
		var dToText={
			'start':function(value){
				return value.toString('dd/MM/yyyy');
			},
			'end':function(value){
				return value.toString('dd/MM/yyyy');
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

},{"../../../data/statuses":1,"../utils/util":6}],5:[function(require,module,exports){
"use strict";

var util = require('../utils/util');
var params = util.getURLParams();

var SubTasks = Backbone.Collection.extend({
    comparator : function(model) {
        return model.get('sortindex');
    }
});

var TaskModel = Backbone.Model.extend({
    defaults: {
        // MAIN PARAMS
        name: 'New task',
        description: '',
        complete: 0,  // 0% - 100% percents
        sortindex: 0,   // place on side menu, starts from 0
        depend: undefined,  // id of task
        status: '110',      // 110 - complete, 109  - open, 108 - ready
        start: new Date(),
        end: new Date(),
        parentid: 0,

        color: '#0090d3',   // user color, not used for now

        // some additional properties
        health: 21,
        reportable: false,
        wo: 2,                  //Select List in properties modal   (configdata)
        milestone: false,       //Check box in properties modal (true/false)
        deliverable: false,     //Check box in properties modal (true/false)
        financial: false,       //Check box in properties modal (true/false)
        timesheets: false,      //Check box in properties modal (true/false)
        acttimesheets: false,   //Check box in properties modal (true/false)

        // server specific params
        // don't use them on client side
        ProjectRef : params.project,
        WBS_ID : params.profile,
        sitekey: params.sitekey,


        // params for application views
        // should be removed from JSON
        hidden : false,
        collapsed : false,
        hightlight : ''
    },
    initialize : function() {
        this.children = new SubTasks();
        this.listenTo(this.children, 'change:parentid', function(child) {
            if (child.get('parentid') === this.id) {
                return;
            }
            this.children.remove(child);
        });
        this.listenTo(this.children, 'add', function(child) {
            child.parent = this;
        });
        this.listenTo(this.children, 'change:sortindex', function() {
            this.children.sort();
        });
        this.listenTo(this.children, 'add remove change:start change:end', function() {
            this._checkTime();
        });

        this.listenTo(this, 'change:collapsed', function() {
            this.children.each(function(child) {
                if (this.get('collapsed')) {
                    child.hide();
                } else {
                    child.show();
                }
            }.bind(this));
        });
        this.listenTo(this, 'destroy', function() {
            this.children.each(function(child) {
                child.destroy();
            });
            this.stopListening();
        });

        // checking nested state
        this.listenTo(this.children, 'add remove', this._checkNested);

        // time checking
        this.listenTo(this.children, 'add remove change:complete', this._checkComplete);
    },
    isNested : function() {
        return !!this.children.length;
    },
    show : function() {
        this.set('hidden', false);
    },
    hide : function() {
        this.set('hidden', true);
    },
    dependOn : function(beforeModel) {
        this.set('depend', beforeModel.id);
        this.beforeModel = beforeModel;
        this.moveToStart(beforeModel.get('end'));
        this.save();
        this._listenBeforeModel();
    },
    clearDependence : function() {
        if (this.beforeModel) {
            this.stopListening(this.beforeModel);
            this.unset('depend').save();
            this.beforeModel = undefined;
        }
    },
    hasParent : function(parentForCheck) {
        var parent = this.parent;
        while(true) {
            if (!parent) {
                return false;
            }
            if (parent === parentForCheck) {
                return true;
            }
            parent = parent.parent;
        }
    },
    _listenBeforeModel : function() {
        this.listenTo(this.beforeModel, 'destroy', function() {
            this.clearDependence();
        });
        this.listenTo(this.beforeModel, 'change:end', function() {
            if (this.get('start') < this.beforeModel.get('end')) {
                this.moveToStart(this.beforeModel.get('end'));
            }
        });
    },
    _checkNested : function() {
        this.trigger('nestedStateChange', this);
    },
    parse: function(response) {
        var start, end;
        if(_.isString(response.start)){
            start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||
                             new Date(response.start);
        } else {
            start = new Date();
        }
        
        if(_.isString(response.end)){
            end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||
                           new Date(response.end);
        } else {
            end = new Date();
        }

        response.start = start < end ? start : end;
        response.end = start < end ? end : start;

        response.parentid = parseInt(response.parentid || '0', 10);

        // remove null params
        _.each(response, function(val, key) {
            if (val === null) {
                delete response[key];
            }
        });
        return response;
    },
    _checkTime : function() {
        if (this.children.length === 0) {
            return;
        }
        var startTime = this.children.at(0).get('start');
        var endTime = this.children.at(0).get('end');
        this.children.each(function(child) {
            var childStartTime = child.get('start');
            var childEndTime = child.get('end');
            if(childStartTime < startTime) {
                startTime = childStartTime;
            }
            if(childEndTime > endTime){
                endTime = childEndTime;
            }
        }.bind(this));
        this.set('start', startTime);
        this.set('end', endTime);
    },
    _checkComplete : function() {
        var complete = 0;
        var length = this.children.length;
        if (length) {
            this.children.each(function(child) {
                complete += child.get('complete') / length;
            });
        }
        this.set('complete', Math.round(complete));
    },
    moveToStart : function(newStart) {
        // do nothing if new start is the same as current
        if (newStart.toDateString() === this.get('start').toDateString()) {
            return;
        }

        // calculate offset
//        var daysDiff = Math.floor((newStart.time() - this.get('start').time()) / 1000 / 60 / 60 / 24)
        var daysDiff = Date.daysdiff(newStart, this.get('start')) - 1;
        if (newStart < this.get('start')) {
            daysDiff *= -1;
        }

        // change dates
        this.set({
            start : newStart.clone(),
            end : this.get('end').clone().addDays(daysDiff)
        });

        // changes dates in all children
        this._moveChildren(daysDiff);
    },
    _moveChildren : function(days) {
        this.children.each(function(child) {
            child.move(days);
        });
    },
    saveWithChildren : function() {
        this.save();
        this.children.each(function(task) {
            task.saveWithChildren();
        });
    },
    move : function(days) {
        this.set({
            start: this.get('start').clone().addDays(days),
            end: this.get('end').clone().addDays(days)
        });
        this._moveChildren(days);
    }
});

module.exports = TaskModel;

},{"../utils/util":6}],6:[function(require,module,exports){
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
	var i, tmparr;
	for (i = 0; i < prmarr.length; i++) {
		tmparr = prmarr[i].split('=');
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


},{}],7:[function(require,module,exports){
"use strict";


var template = "<div class=\"ui small modal add-new-task flip\">\r\n    <i class=\"close icon\"></i>\r\n    <div class=\"header\">\r\n        Add new Task\r\n    </div>\r\n    <div class=\"content\">\r\n        <form class=\"ui form\" id=\"new-task-form\">\r\n            <div class=\"ui form segment\">\r\n                <p>Let's go ahead and set a new goal.</p>\r\n                <div class=\"field\">\r\n                    <label>Task name</label>\r\n                    <input type=\"text\" name=\"name\" placeholder=\"New task name\" required>\r\n                </div>\r\n                <div class=\"field\">\r\n                    <label>Discription</label>\r\n                    <textarea name=\"description\" placeholder=\"The detailed description of your task\"></textarea>\r\n                </div>\r\n                <div class=\"two fields\">\r\n                    <div class=\"field\">\r\n                        <label>Select parent</label>\r\n                        <!--<div class=\"ui dropdown selection\">-->\r\n                            <select name=\"parentid\" class=\"ui dropdown\">\r\n                            </select>\r\n                        <!--</div>-->\r\n                    </div>\r\n                    <div class=\"field resources\">\r\n                        <label>Assign Resources</label>\r\n                    </div>\r\n                </div>\r\n                <div class=\"two fields\">\r\n                    <div class=\"field\">\r\n                        <label>Start Date</label>\r\n                        <input type=\"text\" name=\"start\" placeholder=\"Start Date\" required>\r\n                    </div>\r\n                    <div class=\"field\">\r\n                        <label>End Date</label>\r\n                        <input type=\"text\" name=\"end\" placeholder=\"End Date\" required>\r\n                    </div>\r\n                </div>\r\n                <input type=\"hidden\" name=\"complete\" value=\"0\">\r\n                <input type=\"hidden\" name=\"action\" value=\"add\">\r\n                <input type=\"hidden\" name=\"dependency\" value=\"\">\r\n                <!--<input type=\"hidden\" name=\"aType\" value=\"\">-->\r\n                <input type=\"hidden\" name=\"health\" value=\"21\">\r\n                <input type=\"hidden\" name=\"color\" value=\"\">\r\n                <input type=\"hidden\" name=\"milestone\" value=\"1\">\r\n                <input type=\"hidden\" name=\"deliverable\" value=\"0\">\r\n                <input type=\"hidden\" name=\"reportable\" value=\"1\">\r\n                <input type=\"hidden\" name=\"sortindex\" value=\"1\">\r\n                <input type=\"hidden\" name=\"insertPos\" value=\"set\">\r\n                <input type=\"hidden\" name=\"reference_id\" value=\"-1\">\r\n                <!--<div class=\"two fields\">-->\r\n                    <!--<div class=\"field\">-->\r\n                        <!--<label>Status</label>-->\r\n                        <!--<div class=\"ui fluid selection dropdown\">-->\r\n                            <!--<input type=\"hidden\" name=\"status\" required>-->\r\n                            <!--<div class=\"default text\">Status</div>-->\r\n                            <!--<i class=\"dropdown icon\"></i>-->\r\n                            <!--<div class=\"menu\">-->\r\n                                <!--<div class=\"item\" data-value=\"108\">Ready</div>-->\r\n                                <!--<div class=\"item\" data-value=\"109\">Open</div>-->\r\n                                <!--<div class=\"item\" data-value=\"110\">Completed</div>-->\r\n                            <!--</div>-->\r\n                        <!--</div>-->\r\n                    <!--</div>-->\r\n                    <!--<div class=\"field\">-->\r\n                        <!--<label>Duration</label>-->\r\n                        <!--<input type=\"number\" min=\"0\" name=\"duration\" placeholder=\"Project Duration\" required readonly>-->\r\n                    <!--</div>-->\r\n                <!--</div>-->\r\n            </div>\r\n        </form>\r\n    </div>\r\n    <div class=\"actions\">\r\n        <div class=\"ui black button cancel\">\r\n            Cancel\r\n        </div>\r\n        <div class=\"ui positive right labeled icon button save\">\r\n            Add new task\r\n            <i class=\"checkmark icon\"></i>\r\n        </div>\r\n    </div>\r\n</div>";

var demoResources = [{"wbsid":1,"res_id":1,"res_name":"Joe Black","res_allocation":60},{"wbsid":3,"res_id":2,"res_name":"John Blackmore","res_allocation":40}];

var AddFormView = Backbone.View.extend({
    template: template,
    initialize: function (params) {
        this.settings = params.settings;
    },
    render : function() {
        // append html to body
        this.setElement(this.template);
        this.$el.appendTo('body');

        // setup validation
        $('.ui.form').form(this._formValidationParams);

        // assign random parent color
        $('input[name="color"]').val('#'+Math.floor(Math.random()*16777215).toString(16));



        this.$el.find('[name="start"], [name="end"]').datepicker({
            dateFormat: "dd/mm/yy"
        });

        this.$el.find('[name="start"]').val(new Date().toString('dd/MM/yyyy'));
        this.$el.find('[name="end"]').val(new Date().addDays(2).toString('dd/MM/yyyy'));

        this.$el.find('[name="start"], [name="end"]').datepicker("refresh");

//        this._setup
        this._initResources();
        // initialize dropdown
        this._setupParentSelector();

        this.$el.modal({
            onHidden : function() {
                $(document.body).removeClass('dimmable');
            },
            onApprove : function(e) {
                return this.submitForm(e);
            }.bind(this)
        }).modal('show');
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
            if (this.collection.last()){
                sortindex = (this.collection.last().get('sortindex') + 1);
            } else {
                sortindex = 0;
            }
        }
        data.sortindex = sortindex;

        if (form.get(0).checkValidity()) {
            var task = this.collection.add(data, {parse : true});
            task.save();
            // delete view
            setTimeout(function() {
                $(document.body).removeClass('dimmable');
                this.$el.remove();
            }.bind(this), 300);
        } else {
            return false;
        }
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
    }
});

module.exports = AddFormView;
},{}],8:[function(require,module,exports){
"use strict";var ContextMenuView = require('./sideBar/ContextMenuView');var SidePanel = require('./sideBar/SidePanel');var GanttChartView = require('./canvasChart/GanttChartView');var AddFormView = require('./AddFormView');var TopMenuView = require('./TopMenuView/TopMenuView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        new ContextMenuView({            collection : this.collection,            settings: this.app.settings        }).render();        $('.new-task').click(function() {            new AddFormView({                collection : this.collection,                settings: this.app.settings            }).render();        }.bind(this));        new TopMenuView({            settings : this.app.settings,            collection : this.collection        }).render();        this.canvasView = new GanttChartView({            app : this.app,            collection : this.collection,            settings: this.app.settings        });        this.canvasView.render();        this._moveCanvasView();        setTimeout(function() {            this.canvasView._updateStageAttrs();        }.bind(this), 500);        var tasksContainer = $('.tasks').get(0);        React.render(            React.createElement(SidePanel, {                collection : this.collection            }),            tasksContainer        );        this.listenTo(this.collection, 'sort', function() {            console.log('recompile');            React.unmountComponentAtNode(tasksContainer);            React.render(                React.createElement(SidePanel, {                    collection : this.collection                }),                tasksContainer            );        });    },    events: {        'click #tHandle': 'expand'//        'dblclick .sub-task': 'handlerowclick',//        'dblclick .task': 'handlerowclick',//        'hover .sub-task': 'showMask'    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var button = $(evt.target);        if (button.hasClass('contract')) {            this.$menuContainer.addClass('panel-collapsed');            this.$menuContainer.removeClass('panel-expanded');        }        else {            this.$menuContainer.addClass('panel-expanded');            this.$menuContainer.removeClass('panel-collapsed');        }        setTimeout(function() {            this._moveCanvasView();        }.bind(this), 600);        button.toggleClass('contract');    },    _moveCanvasView : function() {        var sideBarWidth = $('.menu-container').width();        this.canvasView.setLeftPadding(sideBarWidth);    }});module.exports = GanttView;
},{"./AddFormView":7,"./TopMenuView/TopMenuView":14,"./canvasChart/GanttChartView":19,"./sideBar/ContextMenuView":21,"./sideBar/SidePanel":24}],9:[function(require,module,exports){
"use strict";


var ModalTaskEditComponent = Backbone.View.extend({
    el : '#editTask',
    initialize : function(params) {
        this.settings = params.settings;
    },
    render : function() {
        this.$el.find('.ui.checkbox').checkbox();
        // setup values for selectors
        this._prepareSelects();

        this.$el.find('.tabular.menu .item').tab();


        this.$el.find('[name="start"], [name="end"]').datepicker({
            dateFormat: "dd/mm/yy"
        });

        this._fillData();

        // open modal
        this.$el.modal({
            onHidden : function() {
                $(document.body).removeClass('dimmable');
                this.undelegateEvents();
            }.bind(this),
            onApprove : function() {
                this._saveData();
            }.bind(this)
        }).modal('show');

    },
    _prepareSelects : function() {
        var statusSelect = this.$el.find('[name="status"]');
        statusSelect.children().each(function(i, child) {
            var id = this.settings.findStatusId(child.text);
            $(child).prop('value', id);
        }.bind(this));

        var healthSelect = this.$el.find('[name="health"]');
        healthSelect.children().each(function(i, child) {
            var id = this.settings.findHealthId(child.text);
            $(child).prop('value', id);
        }.bind(this));

        var workOrderSelect = this.$el.find('[name="wo"]');
        workOrderSelect.empty();
        this.settings.statuses.wodata[0].data.forEach(function(data) {
            $('<option value="' + data.ID + '">' + data.WONumber + '</option>').appendTo(workOrderSelect);
        });
    },
    _fillData : function() {
        _.each(this.model.attributes, function(val, key) {
            var input = this.$el.find('[name="' + key + '"]');
            if (!input.length) {
                return;
            }
            if (key === 'start' || key === 'end') {
                input.get(0).value = (val.toString('dd/MM/yyyy'));
                input.datepicker( "refresh" );
            } else if (input.prop('type') === 'checkbox') {
                input.prop('checked', val);
//            } else if (input.prop('type') === 'select-one') {
//                input.dropdown('set value', val);
            } else {
                input.val(val);
            }
        }, this);
    },
    _saveData : function() {
        _.each(this.model.attributes, function(val, key) {
            var input = this.$el.find('[name="' + key + '"]');
            if (!input.length) {
                return;
            }
            if (key === 'start' || key === 'end') {
                var date = input.val().split('/');
                var value = new Date(date[2] + '-' + date[1] + '-' + date[0]);
                this.model.set(key, new Date(value));
            } else if (input.prop('type') === 'checkbox') {
                this.model.set(key, input.prop('checked'));
            } else {
                this.model.set(key, input.val());
            }
        }, this);
        this.model.save();
    }
});

module.exports = ModalTaskEditComponent;

},{}],10:[function(require,module,exports){
"use strict";

var FilterView = Backbone.View.extend({
    el : '#filter-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'change #hightlights-select' : function(e) {
            var hightlightTasks = this._getModelsForCriteria(e.target.value);
            this.collection.each(function(task) {
                if (hightlightTasks.indexOf(task) > -1) {
                    task.set('hightlight', this.colors[e.target.value]);
                } else {
                    task.set('hightlight', undefined);
                }
            }, this);
        },
        'change #filters-select' : function(e) {
            var criteria = e.target.value;
            if (criteria === 'reset') {
                this.collection.each(function(task) {
                    task.show();
                });
            } else {
                var showTasks = this._getModelsForCriteria(e.target.value);
                this.collection.each(function(task) {
                    if (showTasks.indexOf(task) > -1) {
                        task.show();
                        // show all parents
                        var parent = task.parent;
                        while(parent) {
                            parent.show();
                            parent = parent.parent;
                        }
                    } else {
                        task.hide();
                    }
                });
            }
        }
    },
    colors : {
        'status-backlog' : '#D2D2D9',
        'status-ready' : '#B2D1F0',
        'status-progress' : '#66A3E0',
        'status-complete' : '#99C299',
        'late' : '#FFB2B2',
        'due' : ' #FFC299',
        'milestone' : '#D6C2FF',
        'deliverable' : '#E0D1C2',
        'financial' : '#F0E0B2',
        'timesheets' : '#C2C2B2',
        'reportable' : ' #E0C2C2',
        'health-red' : 'red',
        'health-amber' : '#FFBF00',
        'health-green' : 'green'
    },
    _getModelsForCriteria : function(creteria) {
        if (creteria === 'resets') {
            return [];
        }
        if (creteria.indexOf('status') !== -1) {
            var status = creteria.slice(creteria.indexOf('-') + 1);
            var id = this.settings.findStatusId(status).toString();
            return this.collection.filter(function(task) {
                return task.get('status').toString() === id;
            });
        }
        if (creteria === 'late') {
            return this.collection.filter(function(task) {
                return task.get('end') < new Date();
            });
        }
        if (creteria === 'due') {
            var lastDate = new Date();
            lastDate.addWeeks(2);
            return this.collection.filter(function(task) {
                return task.get('end') > new Date() && task.get('end') < lastDate;
            });
        }
        if (['milestone', 'deliverable', 'financial', 'timesheets', 'reportable'].indexOf(creteria) !== -1) {
            return this.collection.filter(function(task) {
                return task.get(creteria);
            });
        }
        if (creteria.indexOf('health') !== -1) {
            var health = creteria.slice(creteria.indexOf('-') + 1);
            var healthId = this.settings.findHealthId(health).toString();
            return this.collection.filter(function(task) {
                return task.get('health').toString() === healthId;
            });
        }
        return [];
    }
});

module.exports = FilterView;

},{}],11:[function(require,module,exports){
"use strict";

var GroupingMenuView = Backbone.View.extend({
    el : '#grouping-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click #top-expand-all' : function() {
            this.collection.each(function(task) {
                if (task.isNested()) {
                    task.set('collapsed', false);
                }
            });
        },
        'click #top-collapse-all' : function() {
            this.collection.each(function(task) {
                if (task.isNested()) {
                    task.set('collapsed', true);
                }
            });
        }
    }
});

module.exports = GroupingMenuView;

},{}],12:[function(require,module,exports){
"use strict";

var MSProjectMenuView = Backbone.View.extend({
    el : '#project-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click #upload-project' : function() {
            alert('not implemented');
        },
        'click #download-project' : function() {
            alert('not implemented');
        }
    }
});

module.exports = MSProjectMenuView;

},{}],13:[function(require,module,exports){
"use strict";

var ReportsMenuView = Backbone.View.extend({
    el : '#reports-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click #print' : 'generatePDF'
    },
    generatePDF : function(evt) {
        window.print();
        evt.preventDefault();
    }
});

module.exports = ReportsMenuView;

},{}],14:[function(require,module,exports){
"use strict";
var ZoomMenuView = require('./ZoomMenuView');
var GroupingMenuView = require('./GroupingMenuView');
var FilterMenuView = require('./FilterMenuView');
var MSProjectMenuView = require('./MSProjectMenuView');
var ReportsMenuView = require('./ReportsMenuView');

var TopMenuView = Backbone.View.extend({
    initialize : function(params) {
        new ZoomMenuView(params).render();
        new GroupingMenuView(params).render();
        new FilterMenuView(params).render();
        new MSProjectMenuView(params).render();
        new ReportsMenuView(params).render();
    }
});

module.exports = TopMenuView;

},{"./FilterMenuView":10,"./GroupingMenuView":11,"./MSProjectMenuView":12,"./ReportsMenuView":13,"./ZoomMenuView":15}],15:[function(require,module,exports){
"use strict";

var ZoomMenuView = Backbone.View.extend({
    el : '#zoom-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click .action': 'onIntervalButtonClicked'
    },
    onIntervalButtonClicked : function(evt) {
        var button = $(evt.currentTarget);
        var action = button.data('action');
        var interval = action.split('-')[1];
        this.settings.set('interval', interval);
    }
});

module.exports = ZoomMenuView;

},{}],16:[function(require,module,exports){
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

            'mouseover .leftBorder' : '_resizePointer',
            'mouseout .leftBorder' : '_defaultMouse',

            'mouseover .rightBorder' : '_resizePointer',
            'mouseout .rightBorder' : '_defaultMouse'
        });
    },
    el : function() {
        var group = BasicTaskView.prototype.el.call(this);
        var leftBorder = new Kinetic.Rect({
            dragBoundFunc : function(pos) {
                var offset = this.el.getStage().x() + this.el.x();
                var localX = pos.x - offset;
                return {
                    x : Math.min(localX, this.el.find('.rightBorder')[0].x()) + offset,
                    y : this._y + this._topPadding
                };
            }.bind(this),
            width : this._borderWidth,
            fill : 'black',
            y : this._topPadding,
            height : this._barHeight,
            draggable : true,
            name : 'leftBorder'
        });
        group.add(leftBorder);
        var rightBorder = new Kinetic.Rect({
            dragBoundFunc : function(pos) {
                var offset = this.el.getStage().x() + this.el.x();
                var localX = pos.x - offset;
                return {
                    x : Math.max(localX, this.el.find('.leftBorder')[0].x()) + offset,
                    y : this._y + this._topPadding
                };
            }.bind(this),
            width : this._borderWidth,
            fill : 'black',
            y : this._topPadding,
            height : this._barHeight,
            draggable : true,
            name : 'rightBorder'
        });
        group.add(rightBorder);
        return group;
    },
    _resizePointer : function() {
        document.body.style.cursor = 'ew-resize';
    },
    _changeSize : function() {
        var leftX = this.el.find('.leftBorder')[0].x();
        var rightX = this.el.find('.rightBorder')[0].x() + this._borderWidth;

        var rect = this.el.find('.mainRect')[0];
        rect.width(rightX - leftX);
        rect.x(leftX);

        // update complete params
        var completeRect = this.el.find('.completeRect')[0];
        completeRect.x(leftX);
        completeRect.width(this._calculateCompleteWidth());

        // move tool position
        var tool = this.el.find('.dependencyTool')[0];
        tool.x(rightX);
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

},{"./BasicTaskView":17}],17:[function(require,module,exports){
"use strict";

var BasicTaskView = Backbone.KineticView.extend({
    _fullHeight : 21,
    _topPadding : 3,
    _barHeight : 15,
    _completeColor : '#e88134',
    initialize : function(params) {
        this.height = this._fullHeight;
        this.settings = params.settings;
        this._initModelEvents();
        this._initSettingsEvents();
    },
    events : function() {
        return {
            'dragmove' : function(e) {
                if (e.target.nodeType !== 'Group') {
                    return;
                }
                this._updateDates();
            },
            'dragend' : function() {
                this.model.saveWithChildren();
                this.render();
            },
            'mouseover' : function(e) {
                this._showDependencyTool();
                this._grabPointer(e);
            },
            'mouseout' : function() {
                this._hideDependencyTool();
                this._defaultMouse();
            },
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
            id : this.model.cid,
            draggable : true
        });
        var rect = new Kinetic.Rect({
            fill : this._color,
            y : this._topPadding,
            height : this._barHeight,
            name : 'mainRect'
        });
        var completeRect = new Kinetic.Rect({
            fill : this._completeColor,
            y : this._topPadding,
            height : this._barHeight,
            name : 'completeRect'
        });
        var self = this;
        var arc = new Kinetic.Shape({
            y: this._topPadding,
            fill : 'green',
            drawFunc: function(context) {
                context.beginPath();
                context.arc(0, self._barHeight / 2, self._barHeight / 2, - Math.PI / 2, Math.PI / 2);
                context.moveTo(0, 0);
                context.lineTo(0, self._barHeight);
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
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;

        var rect = this.el.find('.mainRect')[0];
        var length = rect.width();
        var x = this.el.x() + rect.x();
        var days1 = Math.round(x / daysWidth), days2 = Math.round((x + length) / daysWidth);

        this.model.set({
            start: boundaryMin.clone().addDays(days1),
            end: boundaryMin.clone().addDays(days2 - 1)
        });
    },
    _showDependencyTool : function() {
        this.el.find('.dependencyTool')[0].show();
        this.el.getLayer().draw();
    },
    _grabPointer : function(e) {
        var name = e.target.name();
        if ((name !== 'mainRect') && (name !== 'dependencyTool') && (name !== 'completeRect')) {
            return;
        }
        document.body.style.cursor = 'pointer';
    },
    _defaultMouse : function() {
        document.body.style.cursor = 'default';
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
        var group = el && el.getParent();
        var taskId = group && group.id();
        var beforeModel = this.model;
        var afterModel = this.model.collection.get(taskId);
        if (afterModel) {
            this.model.collection.createDependency(beforeModel, afterModel);
        } else {
            var removeFor = this.model.collection.find(function(task) {
                return task.get('depend') === beforeModel.id;
            });
            if (removeFor) {
                this.model.collection.removeDependency(removeFor);
            }
        }
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
            x1: (Date.daysdiff(boundaryMin, this.model.get('start')) - 1) * daysWidth,
            x2: (Date.daysdiff(boundaryMin, this.model.get('end'))) * daysWidth
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
        this.el.find('.completeRect')[0].x(0);

        // move tool position
        var tool = this.el.find('.dependencyTool')[0];
        tool.x(x.x2 - x.x1);
        tool.y(this._topPadding);

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
},{}],18:[function(require,module,exports){
"use strict";

var ConnectorView = Backbone.KineticView.extend({
    _color : 'grey',
    _wrongColor : 'red',
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
        if (x.x2 >= x.x1) {
            this.el.stroke(this._color);
            this.el.points([x.x1, this._y1, x.x1 + 10, this._y1, x.x1 + 10, this._y2, x.x2, this._y2]);
        } else {
            this.el.stroke(this._wrongColor);
            this.el.points([
                x.x1, this._y1,
                x.x1 + 10, this._y1,
                x.x1 + 10, this._y1 + (this._y2 - this._y1) / 2,
                x.x2 - 10, this._y1 + (this._y2 - this._y1) / 2,
                x.x2 - 10, this._y2,
                x.x2, this._y2
            ]);
        }
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
},{}],19:[function(require,module,exports){
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
            height: Math.max($(".tasks").innerHeight() + this._topPadding, window.innerHeight - $(this.stage.getContainer()).offset().top),
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

                length = hData[s][i].duration * daysWidth;
                x = x + length;
                xi = x - borderWidth + offset;
                context.moveTo(xi, yi);
                context.lineTo(xi, this.getStage().height());

                context._context.save();
                context._context.font = '6pt Arial,Helvetica,sans-serif';
                context._context.textAlign = 'center';
                context._context.textBaseline = 'middle';
                if (hideDate) {
                    context._context.font = '1pt Arial,Helvetica,sans-serif';
                }
                context._context.fillText(hData[s][i].text, x - length / 2, yi + rowHeight / 2);
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
        this.listenTo(this.collection, 'add remove', function() {
            // wait for left panel updates
            setTimeout(function() {
                this._updateStageAttrs();
            }.bind(this), 100);
        });
        this.listenTo(this.collection, 'sort', function() {
            this._resortViews();
        });
        this.listenTo(this.collection, 'change:hidden', function() {
            this._resortViews();
        });
        this.listenTo(this.collection, 'change:depend', function(task) {
            if (task.get('depend')) {
                this._addConnectorView(task);
            } else {
                this._removeConnector(task);
            }
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
    _removeConnector : function(task) {
        var connectorView = _.find(this._connectorViews, function(view) {
            return view.afterModel === task;
        });
        connectorView.remove();
        this._connectorViews = _.without(this._connectorViews, connectorView);
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
            connectorView.setY1(beforeView.getY() + beforeView._fullHeight / 2);
            connectorView.setY2(afterView.getY()  + afterView._fullHeight / 2);
        }.bind(this));
        this.Flayer.draw();
    }
});

module.exports = GanttChartView;
},{"./AloneTaskView":16,"./ConnectorView":18,"./NestedTaskView":20}],20:[function(require,module,exports){
/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require('./BasicTaskView');

var NestedTaskView = BasicTaskView.extend({
    _color : '#b3d1fc',
    _borderSize : 6,
    _barHeight : 10,
    _completeColor : '#C95F10',
    el : function() {
        var group = BasicTaskView.prototype.el.call(this);
        var leftBorder = new Kinetic.Line({
            fill : this._color,
            y : this._topPadding + this._barHeight,
            points : [0, 0, this._borderSize * 1.5, 0, 0, this._borderSize],
            closed : true,
            name : 'leftBorder'
        });
        group.add(leftBorder);
        var rightBorder = new Kinetic.Line({
            fill : this._color,
            y : this._topPadding + this._barHeight,
            points : [-this._borderSize * 1.5, 0, 0, 0, 0, this._borderSize],
            closed : true,
            name : 'rightBorder'
        });
        group.add(rightBorder);
        return group;
    },
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
    },
    render : function() {
        var x = this._calculateX();
        this.el.find('.leftBorder')[0].x(0);
        this.el.find('.rightBorder')[0].x(x.x2 - x.x1);
        var completeWidth = (x.x2 - x.x1) * this.model.get('complete') / 100;
        if (completeWidth > this._borderSize / 2) {
            this.el.find('.leftBorder')[0].fill(this._completeColor);
        } else {
            this.el.find('.leftBorder')[0].fill(this._color);
        }
        if ((x.x2 - x.x1) - completeWidth < this._borderSize / 2) {
            this.el.find('.rightBorder')[0].fill(this._completeColor);
        } else {
            this.el.find('.rightBorder')[0].fill(this._color);
        }

        BasicTaskView.prototype.render.call(this);
        return this;
    }
});

module.exports = NestedTaskView;
},{"./BasicTaskView":17}],21:[function(require,module,exports){
"use strict";

var ModalEdit = require('../ModalTaskEditView');

function ContextMenuView(params) {
    this.collection = params.collection;
    this.settings = params.settings;
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
            }
            if(key === 'properties'){
                var view = new ModalEdit({
                    model : model,
                    settings : self.settings
                });
                view.render();
            }
            if (key === 'rowAbove'){
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
                self.collection.indent(model);
            }
            if (key === 'outdent'){
                self.collection.outdent(model);
            }
        },
        items: {
            "rowAbove": { name: "&nbsp;New Row Above", icon: "above" },
            "rowBelow": { name: "&nbsp;New Row Below", icon: "below" },
            "indent": { name: "&nbsp;Indent Row", icon: "indent" },
            "outdent": { name: "&nbsp;Outdent Row", icon: "outdent" },
            "sep1": "---------",
            "properties": { name: "&nbsp;Properties", icon: "properties" },
            "sep2": "---------",
            "delete": { name: "&nbsp;Delete Row", icon: "delete" }
        }
    });
};

ContextMenuView.prototype.addTask = function(data, insertPos) {
    var sortindex = 0;
    var ref_model = this.collection.get(data.reference_id);
    if (ref_model) {
        sortindex = ref_model.get('sortindex') + (insertPos === 'above' ? -0.5 : 0.5);
    } else {
        sortindex = (this.app.tasks.last().get('sortindex') + 1);
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get('parentid');
    var task = this.collection.add(data, {parse : true});
    task.save();
};

module.exports = ContextMenuView;
},{"../ModalTaskEditView":9}],22:[function(require,module,exports){
"use strict";

var DatePicker = React.createClass({
    displayName : 'DatePicker',
    componentDidMount  : function() {
        $(this.getDOMNode()).datepicker({
            dateFormat: "dd/mm/yy",
            onSelect : function() {
                var date = this.getDOMNode().value.split('/');
                var value = new Date(date[2] + '-' + date[1] + '-' + date[0]);
                this.props.onChange({
                    target : {
                        value : value
                    }
                });
            }.bind(this)
        });
        $(this.getDOMNode()).datepicker('show');
    },
    componentWillUnmount  : function() {
        $(this.getDOMNode()).datepicker('destroy');
    },
    shouldComponentUpdate : function() {
        this.getDOMNode().value = this.props.value.toString('dd/mm/yy');
        $(this.getDOMNode()).datepicker( "refresh" );
        return false;
    },
    render : function() {
        return React.createElement('input', {
            defaultValue : this.props.value.toString('dd/MM/yyyy')
        });
    }
});

module.exports = DatePicker;

},{}],23:[function(require,module,exports){
"use strict";
var TaskItem = require('./TaskItem');

var NestedTask = React.createClass({
    displayName : 'NestedTask',
    componentDidMount  : function() {
        this.props.model.on('change:hidden change:collapsed', function() {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount  : function() {
        this.props.model.off(null, null, this);
    },
    render : function() {
        var subtasks = this.props.model.children.map(function(task) {
            if (task.get('hidden')) {
                return;
            }
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

},{"./TaskItem":25}],24:[function(require,module,exports){
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
        this.props.collection.on('change:hidden', function() {
            this.requestUpdate();
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
            lift : '0',
            top : '0',
            width : '100%'
        });
        container.mouseenter(function() {
            this.hightlighter.appendTo(document.body);
        }.bind(this));

        container.mouseover(function(e) {
            var $el = $(e.target);
            var pos = $el.offset();
            this.hightlighter.css({
                top : pos.top + 'px',
                height : $el.height()
            });
        }.bind(this));
        container.mouseleave(function() {
            this.hightlighter.remove();
        }.bind(this));
    },
    requestUpdate : (function() {
        var waiting = false;
        return function () {
            if (waiting) {
                return;
            }
            setTimeout(function() {
                this.forceUpdate();
                waiting = false;
            }.bind(this), 5);
        };
    }()),
    componentWillUnmount  : function() {
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
            if (task.get('hidden')) {
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

},{"./NestedTask":23,"./TaskItem":25}],25:[function(require,module,exports){
"use strict";
var DatePicker = require('./DatePicker');

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
        return this._createReadFiled(col);
    },
    _createReadFiled : function(col) {
        var model = this.props.model;
        if (col === 'complete') {
            return model.get(col) + '%';
        }
        if (col === 'start' || col === 'end') {
            return model.get(col).toString('dd/MM/yyyy');
        }
        if (col === 'duration') {
            return Date.daysdiff(model.get('start'), model.get('end'))+' d';
        }
        return model.get(col);
    },
    _createDateElement : function(col) {
        var val = this.props.model.get(col);
        return React.createElement(DatePicker, {
            value : val,
            key : col,
            onChange : function(e) {
                var newVal = e.target.value;
                var state = this.state;
                state.editRow = undefined;
                this.setState(state);
                this.props.model.set(col, newVal);
                this.props.model.save();
            }.bind(this)
        });
    },
    _durationChange : function(value) {
        var number = parseInt(value.replace( /^\D+/g, ''), 10);
        if (!number) {
            return;
        }
        if (value.indexOf('w') > -1) {
            this.props.model.set('end', this.props.model.get('start').clone().addWeeks(number));
        } else  if (value.indexOf('m') > -1) {
            this.props.model.set('end', this.props.model.get('start').clone().addMonths(number));
        } else {
            number--;
            this.props.model.set('end', this.props.model.get('start').clone().addDays(number));
        }
    },
    _createDurationField : function() {
        var val = Date.daysdiff(this.props.model.get('start'), this.props.model.get('end'))+' d';
        return React.createElement('input', {
            value : this.state.val || val,
            key : 'duration',
            onChange : function(e) {
                var newVal = e.target.value;
                this._durationChange(newVal);
                var state = this.state;
                state.val = newVal;
                this.setState(state);
            }.bind(this),
            onKeyDown : function(e) {
                if (e.keyCode === 13) {
                    var state = this.state;
                    state.editRow = undefined;
                    state.val = undefined;
                    this.setState(state);
                    this.props.model.save();
                }
            }.bind(this)
        });
    },
    _createEditField : function(col) {
        var val = this.props.model.get(col);
        if (col === 'start' || col === 'end') {
            return this._createDateElement(col);
        }
        if (col === 'duration') {
            return this._createDurationField();
        }
        return React.createElement('input', {
            value : val,
            key : col,
            onChange : function(e) {
                var newVal = e.target.value;
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
                    }.bind(this),
                    style : {
                        'backgroundColor' : this.props.model.get('hightlight')
                    }
                },
                React.createElement('li', {
                        key : 'name',
                        className : 'col-name'
                    },
                    this.props.model.isNested() ? React.createElement('i', {
                        className : 'triangle icon ' + (this.props.model.get('collapsed') ? 'right' : 'down'),
                        onClick : function() {
                            this.props.model.set('collapsed', !this.props.model.get('collapsed'));
                        }.bind(this)
                    }) : undefined,
                    React.createElement('div', {
                            style : {
                                paddingLeft : (this._findNestedLevel() * 10) + 'px'
                            }
                        },
                        this._createField('name'))
                ),
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
                }, this._createField('duration'))
            );
    }
});

module.exports = TaskItem;

},{"./DatePicker":22}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvZGF0YS9zdGF0dXNlcy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24uanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2Zha2VfNzRmYTg5NmYuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9TZXR0aW5nTW9kZWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9UYXNrTW9kZWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3V0aWxzL3V0aWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0FkZEZvcm1WaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9HYW50dFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL01vZGFsVGFza0VkaXRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1JlcG9ydHNNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiY2ZnZGF0YVwiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIkNhdGVnb3J5XCI6IFwiVGFzayBIZWFsdGhcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDE1MDI3LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJHcmVlblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDE1MDI4LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJBbWJlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDE1MDI5LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJSZWRcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIkNhdGVnb3J5XCI6IFwiVGFzayBTdGF0dXNcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDIzLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJJbiBQcm9ncmVzc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDI0LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJDb21wbGV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDIxOCxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiUmVhZHlcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAxNTAyNixcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiQmFja2xvZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgXSxcclxuICAgIFwid29kYXRhXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiV09OdW1iZXJcIjogXCJXb3JrT3JkZXJzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiA0MyxcclxuICAgICAgICAgICAgICAgICAgICBcIldPTnVtYmVyXCI6IFwiV08xMDAxOFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDQzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICBdLFxyXG4gICAgXCJyZXNvdXJjZWRhdGFcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjogMSxcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIkdyZWcgVmFuZGVsaWd0XCIsXHJcbiAgICAgICAgICAgIFwiSm9iVGl0bGVcIjogXCJQcm9ncmFtIE1hbmFnZXJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOiA1OCxcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIkphbWVzIEd1bWxleVwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6IFwiUHJvamVjdCBNYW5hZ2VyXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjogMixcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIkx1Y3kgTWlub3RhXCIsXHJcbiAgICAgICAgICAgIFwiSm9iVGl0bGVcIjogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOiA1OSxcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIlJvYiBUeW5hblwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6IFwiQnVzaW5lc3MgQW5hbHlzdFwiXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmwgOiAnYXBpL3Rhc2tzJyxcblx0bW9kZWw6IFRhc2tNb2RlbCxcblx0aW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5zdWJzY3JpYmUoKTtcblx0fSxcblx0Y29tcGFyYXRvciA6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdH0sXG5cdGxpbmtDaGlsZHJlbiA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBwYXJlbnRUYXNrID0gdGhpcy5nZXQodGFzay5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0aWYgKHBhcmVudFRhc2spIHtcblx0XHRcdFx0aWYgKHBhcmVudFRhc2sgPT09IHRhc2spIHtcblx0XHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXJlbnRUYXNrLmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFzay5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3Rhc2sgaGFzIHBhcmVudCB3aXRoIGlkICcgKyB0YXNrLmdldCgncGFyZW50aWQnKSArICcgLSBidXQgdGhlcmUgaXMgbm8gc3VjaCB0YXNrJyk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0X3NvcnRDaGlsZHJlbiA6IGZ1bmN0aW9uICh0YXNrLCBzb3J0SW5kZXgpIHtcblx0XHR0YXNrLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRjaGlsZC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbihjaGlsZCwgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdGNoZWNrU29ydGVkSW5kZXggOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gLTE7XG5cdFx0dGhpcy50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGFzay5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbih0YXNrLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5zb3J0KCk7XG5cdH0sXG5cdF9yZXNvcnRDaGlsZHJlbiA6IGZ1bmN0aW9uKGRhdGEsIHN0YXJ0SW5kZXgsIHBhcmVudElEKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IHN0YXJ0SW5kZXg7XG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2tEYXRhKSB7XG5cdFx0XHR2YXIgdGFzayA9IHRoaXMuZ2V0KHRhc2tEYXRhLmlkKTtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSAhPT0gcGFyZW50SUQpIHtcblx0XHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHBhcmVudElEKTtcblx0XHRcdFx0aWYgKG5ld1BhcmVudCkge1xuXHRcdFx0XHRcdG5ld1BhcmVudC5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRhc2suc2F2ZSh7XG5cdFx0XHRcdHNvcnRpbmRleDogKytzb3J0SW5kZXgsXG5cdFx0XHRcdHBhcmVudGlkOiBwYXJlbnRJRFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAodGFza0RhdGEuY2hpbGRyZW4gJiYgdGFza0RhdGEuY2hpbGRyZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3Jlc29ydENoaWxkcmVuKHRhc2tEYXRhLmNoaWxkcmVuLCBzb3J0SW5kZXgsIHRhc2suaWQpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0cmVzb3J0IDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR0aGlzLl9yZXNvcnRDaGlsZHJlbihkYXRhLCAtMSwgMCk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0c3Vic2NyaWJlIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IG1vZGVsLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0XHRtb2RlbC5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdjYW4gbm90IGZpbmQgcGFyZW50IHdpdGggaWQgJyArIG1vZGVsLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRcdFx0bW9kZWwuc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubGlua0NoaWxkcmVuKCk7XG5cdFx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0XHRcdHRoaXMuX2NoZWNrRGVwZW5kZW5jaWVzKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHRcdHRhc2sucGFyZW50LmNoaWxkcmVuLnJlbW92ZSh0YXNrKTtcblx0XHRcdFx0dGFzay5wYXJlbnQgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdG5ld1BhcmVudC5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuX3ByZXZlbnRTb3J0aW5nKSB7XG5cdFx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRjcmVhdGVEZXBlbmRlbmN5IDogZnVuY3Rpb24gKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKHRoaXMuX2NhbkNyZWF0ZURlcGVuZGVuY2UoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpKSB7XG5cdFx0XHRhZnRlck1vZGVsLmRlcGVuZE9uKGJlZm9yZU1vZGVsKTtcblx0XHR9XG5cdH0sXG5cblx0X2NhbkNyZWF0ZURlcGVuZGVuY2UgOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmIChiZWZvcmVNb2RlbC5oYXNQYXJlbnQoYWZ0ZXJNb2RlbCkgfHwgYWZ0ZXJNb2RlbC5oYXNQYXJlbnQoYmVmb3JlTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICgoYmVmb3JlTW9kZWwuZ2V0KCdkZXBlbmQnKSA9PT0gYWZ0ZXJNb2RlbC5pZCkgfHxcblx0XHRcdChhZnRlck1vZGVsLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0cmVtb3ZlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uKGFmdGVyTW9kZWwpIHtcblx0XHRhZnRlck1vZGVsLmNsZWFyRGVwZW5kZW5jZSgpO1xuXHR9LFxuXHRfY2hlY2tEZXBlbmRlbmNpZXMgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgnZGVwZW5kJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGJlZm9yZU1vZGVsID0gdGhpcy5nZXQodGFzay5nZXQoJ2RlcGVuZCcpKTtcblx0XHRcdGlmICghYmVmb3JlTW9kZWwpIHtcblx0XHRcdFx0dGFzay51bnNldCgnZGVwZW5kJykuc2F2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFzay5kZXBlbmRPbihiZWZvcmVNb2RlbCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0b3V0ZGVudCA6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgdW5kZXJTdWJsaW5ncyA9IFtdO1xuXHRcdGlmICh0YXNrLnBhcmVudCkge1xuXHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRpZiAoY2hpbGQuZ2V0KCdzb3J0aW5kZXgnKSA8PSB0YXNrLmdldCgnc29ydGluZGV4JykpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dW5kZXJTdWJsaW5ncy5wdXNoKGNoaWxkKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR1bmRlclN1YmxpbmdzLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdGNoaWxkLnNhdmUoJ3BhcmVudGlkJywgdGFzay5pZCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHRpZiAodGFzay5wYXJlbnQgJiYgdGFzay5wYXJlbnQucGFyZW50KSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgdGFzay5wYXJlbnQucGFyZW50LmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIDApO1xuXHRcdH1cblx0fSxcblx0aW5kZW50IDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciBwcmV2VGFzaywgaSwgbTtcblx0XHRmb3IgKGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0wOyBpLS0pIHtcblx0XHRcdG0gPSB0aGlzLmF0KGkpO1xuXHRcdFx0aWYgKChtLmdldCgnc29ydGluZGV4JykgPCB0YXNrLmdldCgnc29ydGluZGV4JykpICYmICh0YXNrLnBhcmVudCA9PT0gbS5wYXJlbnQpKSB7XG5cdFx0XHRcdHByZXZUYXNrID0gbTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChwcmV2VGFzaykge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHByZXZUYXNrLmlkKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tDb2xsZWN0aW9uO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9ucy90YXNrQ29sbGVjdGlvbicpO1xudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9tb2RlbHMvU2V0dGluZ01vZGVsJyk7XG5cbnZhciBHYW50dFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0dhbnR0VmlldycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL3V0aWwnKTtcblxuZnVuY3Rpb24gZmV0Y2hDb2xsZWN0aW9uKGFwcCkge1xuXHRhcHAudGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3MgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGFkZCBlbXB0eSB0YXNrIGlmIG5vIHRhc2tzIGZyb20gc2VydmVyXG4gICAgICAgICAgICBpZiAoYXBwLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGFwcC50YXNrcy5yZXNldChbe1xuICAgICAgICAgICAgICAgICAgICBuYW1lIDogJ05ldyB0YXNrJ1xuICAgICAgICAgICAgICAgIH1dKTtcblxuICAgICAgICAgICAgfVxuXHRcdFx0Y29uc29sZS5sb2coJ1N1Y2Nlc3MgbG9hZGluZyB0YXNrcy4nKTtcblx0XHRcdGFwcC50YXNrcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdGFwcC50YXNrcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cblx0XHRcdGFwcC5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyh7fSwge2FwcCA6IGFwcH0pO1xuXHRcdFx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcblx0XHRcdFx0JC5nZXRKU09OKCcvYXBpL0dhbnR0Q29uZmlnL3dicy80My8yYjAwZGE0NmI1N2MwMzk1JywgZnVuY3Rpb24oc3RhdHVzZXMpIHtcblx0XHRcdFx0XHRhcHAuc2V0dGluZ3MgPSBzdGF0dXNlcztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdG5ldyBHYW50dFZpZXcoe1xuXHRcdFx0XHRhcHAgOiBhcHAsXG5cdFx0XHRcdGNvbGxlY3Rpb24gOiBhcHAudGFza3Ncblx0XHRcdH0pLnJlbmRlcigpO1xuXG5cdFx0XHQkKCcjbG9hZGVyJykuZmFkZU91dCgpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9LFxuXHRcdHBhcnNlOiB0cnVlLFxuXHRcdHJlc2V0IDogdHJ1ZVxuXHR9KTtcbn1cblxuXG4kKGZ1bmN0aW9uICgpIHtcblx0dmFyIGFwcCA9IHt9O1xuXHRhcHAudGFza3MgPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcblxuXHQvLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xNyZzaXRla2V5PTJiMDBkYTQ2YjU3YzAzOTVcblx0dmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cdGlmIChwYXJhbXMucHJvamVjdCAmJiBwYXJhbXMucHJvZmlsZSAmJiBwYXJhbXMuc2l0ZWtleSkge1xuXHRcdGFwcC50YXNrcy51cmwgPSAnYXBpL3Rhc2tzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5wcm9maWxlICsgJy8nICsgcGFyYW1zLnNpdGVrZXk7XG5cdH1cblx0ZmV0Y2hDb2xsZWN0aW9uKGFwcCk7XG59KTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XG52YXIgdGVzdFN0YXR1c2VzID0gcmVxdWlyZSgnLi4vLi4vLi4vZGF0YS9zdGF0dXNlcycpO1xuXG4vL3ZhciBoZnVuYyA9IGZ1bmN0aW9uKHBvcywgZXZ0KSB7XG4vL1x0dmFyIGRyYWdJbnRlcnZhbCA9IGFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJywgJ2RyYWdJbnRlcnZhbCcpO1xuLy9cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcbi8vXHRyZXR1cm4ge1xuLy9cdFx0eDogZXZ0LmluaXBvcy54ICsgbiAqIGRyYWdJbnRlcnZhbCxcbi8vXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcbi8vXHR9O1xuLy99O1xuXG52YXIgU2V0dGluZ01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpbnRlcnZhbDogJ2ZpeCcsXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxuXHRcdGRwaTogMVxuXHR9LFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycywgcGFyYW1zKSB7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMuc3RhdHVzZXMgPSB0ZXN0U3RhdHVzZXM7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwXG5cdFx0fTtcblxuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuYXBwLnRhc2tzO1xuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XG5cdH0sXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xuXHRcdGlmKGF0dHIpe1xuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xuXHR9LFxuXHRmaW5kU3RhdHVzSWQgOiBmdW5jdGlvbihzdGF0dXMpIHtcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBzdGF0dXMudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRmaW5kSGVhbHRoSWQgOiBmdW5jdGlvbihoZWFsdGgpIHtcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBoZWFsdGgudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRmaW5kV09JZCA6IGZ1bmN0aW9uKHdvKSB7XG5cdFx0Zm9yKHZhciBpIGluIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGEpIHtcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcbiAgICAgICAgICAgIGlmIChkYXRhLldPTnVtYmVyLnRvTG93ZXJDYXNlKCkgPT09IHdvLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5JRDtcbiAgICAgICAgICAgIH1cblx0XHR9XG5cdH0sXG5cdGNhbGNtaW5tYXg6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtaW5EYXRlID0gbmV3IERhdGUoKSwgbWF4RGF0ZSA9IG1pbkRhdGUuY2xvbmUoKS5hZGRZZWFycygxKTtcblx0XHRcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XG5cdFx0XHRcdG1pbkRhdGU9bW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGUgPSBtaW5EYXRlO1xuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XG5cdFx0XG5cdH0sXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xuXHRcdFxuXHRcdHZhciBpbnRlcnZhbCA9IHRoaXMuZ2V0KCdpbnRlcnZhbCcpO1xuXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDEyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdFxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCA3LCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogNykubW92ZVRvRGF5T2ZXZWVrKDEsIC0xKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDcpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiAzMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluLm1vdmVUb0ZpcnN0RGF5T2ZRdWFydGVyKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gMzAgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcblx0XHRcdGNlbGxXaWR0aCA9IDMwO1xuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2l6ZSAvIGR1cmF0aW9uO1xuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gZHBpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcblx0XHRcdGRwaSA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIwICogZHBpKTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogZHBpKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xuXHRcdFx0fTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHR9XG5cdFx0dmFyIGhEYXRhID0ge1xuXHRcdFx0JzEnOiBbXSxcblx0XHRcdCcyJzogW10sXG5cdFx0XHQnMyc6IFtdXG5cdFx0fTtcblx0XHR2YXIgaGRhdGEzID0gW107XG5cdFx0XG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcblx0XHRcblx0XHRsYXN0ID0gc3RhcnQ7XG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR2YXIgZHVyZnVuYztcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGR1cmZ1bmMobGFzdCksXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogaW50ZXJ2YWxkYXlzLFxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcblx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHNhdHRyLmJvdW5kYXJ5TWF4ID0gZW5kID0gbGFzdDtcblx0XHRoRGF0YVsnMyddID0gaGRhdGEzO1xuXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBkYXRlIHRvIGVuZCBvZiB5ZWFyXG5cdFx0dmFyIGludGVyID0gRGF0ZS5kYXlzZGlmZihzdGFydCwgbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgMTEsIDMxKSk7XG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdHRleHQ6IHN0YXJ0LmdldEZ1bGxZZWFyKClcblx0XHR9KTtcblx0XHRmb3IoaSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCkgKyAxLCBpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7IGkgPCBpTGVuOyBpKyspe1xuXHRcdFx0aW50ZXIgPSBEYXRlLmlzTGVhcFllYXIoaSkgPyAzNjYgOiAzNjU7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGlcblx0XHRcdH0pO1xuXHRcdH1cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGxhc3QgeWVhciB1cHRvIGVuZCBkYXRlXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0aW50ZXIgPSBEYXRlLmRheXNkaWZmKG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCAwLCAxKSwgZW5kKTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdFx0dGV4dDogZW5kLmdldEZ1bGxZZWFyKClcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKHN0YXJ0LCBzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLFxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcblx0XHR9KTtcblx0XHRcblx0XHRqID0gc3RhcnQuZ2V0TW9udGgoKSArIDE7XG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG5cdFx0aUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpO1xuXHRcdHZhciBlbmRtb250aCA9IGVuZC5nZXRNb250aCgpO1xuXG5cdFx0d2hpbGUgKGkgPD0gaUxlbikge1xuXHRcdFx0d2hpbGUoaiA8IDEyKSB7XG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5nZXREYXlzSW5Nb250aChpLCBqKSxcblx0XHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoaiwgJ20nKVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aiArPSAxO1xuXHRcdFx0fVxuXHRcdFx0aSArPSAxO1xuXHRcdFx0aiA9IDA7XG5cdFx0fVxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGggJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xuXHR9LFxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xuXHR9LFxuXHRjb25EVG9UOihmdW5jdGlvbigpe1xuXHRcdHZhciBkVG9UZXh0PXtcblx0XHRcdCdzdGFydCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdH0sXG5cdFx0XHQnZW5kJzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xuXHRcdFx0fVxuXHRcdFxuXHRcdH07XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XG5cdFx0fTtcblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgU3ViVGFza3MgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcbiAgICBjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcclxuICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcclxuICAgIH1cclxufSk7XHJcblxyXG52YXIgVGFza01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgLy8gTUFJTiBQQVJBTVNcclxuICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcclxuICAgICAgICBjb21wbGV0ZTogMCwgIC8vIDAlIC0gMTAwJSBwZXJjZW50c1xyXG4gICAgICAgIHNvcnRpbmRleDogMCwgICAvLyBwbGFjZSBvbiBzaWRlIG1lbnUsIHN0YXJ0cyBmcm9tIDBcclxuICAgICAgICBkZXBlbmQ6IHVuZGVmaW5lZCwgIC8vIGlkIG9mIHRhc2tcclxuICAgICAgICBzdGF0dXM6ICcxMTAnLCAgICAgIC8vIDExMCAtIGNvbXBsZXRlLCAxMDkgIC0gb3BlbiwgMTA4IC0gcmVhZHlcclxuICAgICAgICBzdGFydDogbmV3IERhdGUoKSxcclxuICAgICAgICBlbmQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgcGFyZW50aWQ6IDAsXHJcblxyXG4gICAgICAgIGNvbG9yOiAnIzAwOTBkMycsICAgLy8gdXNlciBjb2xvciwgbm90IHVzZWQgZm9yIG5vd1xyXG5cclxuICAgICAgICAvLyBzb21lIGFkZGl0aW9uYWwgcHJvcGVydGllc1xyXG4gICAgICAgIGhlYWx0aDogMjEsXHJcbiAgICAgICAgcmVwb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgd286IDIsICAgICAgICAgICAgICAgICAgLy9TZWxlY3QgTGlzdCBpbiBwcm9wZXJ0aWVzIG1vZGFsICAgKGNvbmZpZ2RhdGEpXHJcbiAgICAgICAgbWlsZXN0b25lOiBmYWxzZSwgICAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBkZWxpdmVyYWJsZTogZmFsc2UsICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGZpbmFuY2lhbDogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgdGltZXNoZWV0czogZmFsc2UsICAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBhY3R0aW1lc2hlZXRzOiBmYWxzZSwgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG5cclxuICAgICAgICAvLyBzZXJ2ZXIgc3BlY2lmaWMgcGFyYW1zXHJcbiAgICAgICAgLy8gZG9uJ3QgdXNlIHRoZW0gb24gY2xpZW50IHNpZGVcclxuICAgICAgICBQcm9qZWN0UmVmIDogcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgV0JTX0lEIDogcGFyYW1zLnByb2ZpbGUsXHJcbiAgICAgICAgc2l0ZWtleTogcGFyYW1zLnNpdGVrZXksXHJcblxyXG5cclxuICAgICAgICAvLyBwYXJhbXMgZm9yIGFwcGxpY2F0aW9uIHZpZXdzXHJcbiAgICAgICAgLy8gc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSBKU09OXHJcbiAgICAgICAgaGlkZGVuIDogZmFsc2UsXHJcbiAgICAgICAgY29sbGFwc2VkIDogZmFsc2UsXHJcbiAgICAgICAgaGlnaHRsaWdodCA6ICcnXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgU3ViVGFza3MoKTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ2V0KCdwYXJlbnRpZCcpID09PSB0aGlzLmlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5yZW1vdmUoY2hpbGQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLnBhcmVudCA9IHRoaXM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnNvcnRpbmRleCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrVGltZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdjb2xsYXBzZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hlY2tpbmcgbmVzdGVkIHN0YXRlXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZScsIHRoaXMuX2NoZWNrTmVzdGVkKTtcclxuXHJcbiAgICAgICAgLy8gdGltZSBjaGVja2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUgY2hhbmdlOmNvbXBsZXRlJywgdGhpcy5fY2hlY2tDb21wbGV0ZSk7XHJcbiAgICB9LFxyXG4gICAgaXNOZXN0ZWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgIH0sXHJcbiAgICBzaG93IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2hpZGRlbicsIGZhbHNlKTtcclxuICAgIH0sXHJcbiAgICBoaWRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2hpZGRlbicsIHRydWUpO1xyXG4gICAgfSxcclxuICAgIGRlcGVuZE9uIDogZnVuY3Rpb24oYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICB0aGlzLnNldCgnZGVwZW5kJywgYmVmb3JlTW9kZWwuaWQpO1xyXG4gICAgICAgIHRoaXMuYmVmb3JlTW9kZWwgPSBiZWZvcmVNb2RlbDtcclxuICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbkJlZm9yZU1vZGVsKCk7XHJcbiAgICB9LFxyXG4gICAgY2xlYXJEZXBlbmRlbmNlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKHRoaXMuYmVmb3JlTW9kZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnVuc2V0KCdkZXBlbmQnKS5zYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYmVmb3JlTW9kZWwgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhhc1BhcmVudCA6IGZ1bmN0aW9uKHBhcmVudEZvckNoZWNrKSB7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xyXG4gICAgICAgIHdoaWxlKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFyZW50ID09PSBwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2xpc3RlbkJlZm9yZU1vZGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyRGVwZW5kZW5jZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZTplbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tOZXN0ZWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ25lc3RlZFN0YXRlQ2hhbmdlJywgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0LCBlbmQ7XHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5zdGFydCkpe1xyXG4gICAgICAgICAgICBzdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwnZGQvTU0veXl5eScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2Uuc3RhcnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcclxuICAgICAgICAgICAgZW5kID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2UuZW5kKSwnZGQvTU0veXl5eScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLmVuZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZW5kID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gc3RhcnQgPCBlbmQgPyBzdGFydCA6IGVuZDtcclxuICAgICAgICByZXNwb25zZS5lbmQgPSBzdGFydCA8IGVuZCA/IGVuZCA6IHN0YXJ0O1xyXG5cclxuICAgICAgICByZXNwb25zZS5wYXJlbnRpZCA9IHBhcnNlSW50KHJlc3BvbnNlLnBhcmVudGlkIHx8ICcwJywgMTApO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgbnVsbCBwYXJhbXNcclxuICAgICAgICBfLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfSxcclxuICAgIF9jaGVja1RpbWUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICAgICAgdmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkRW5kVGltZSA9IGNoaWxkLmdldCgnZW5kJyk7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkU3RhcnRUaW1lIDwgc3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihjaGlsZEVuZFRpbWUgPiBlbmRUaW1lKXtcclxuICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xyXG4gICAgfSxcclxuICAgIF9jaGVja0NvbXBsZXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlID0gMDtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlICs9IGNoaWxkLmdldCgnY29tcGxldGUnKSAvIGxlbmd0aDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0KCdjb21wbGV0ZScsIE1hdGgucm91bmQoY29tcGxldGUpKTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG9TdGFydCA6IGZ1bmN0aW9uKG5ld1N0YXJ0KSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZyBpZiBuZXcgc3RhcnQgaXMgdGhlIHNhbWUgYXMgY3VycmVudFxyXG4gICAgICAgIGlmIChuZXdTdGFydC50b0RhdGVTdHJpbmcoKSA9PT0gdGhpcy5nZXQoJ3N0YXJ0JykudG9EYXRlU3RyaW5nKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIG9mZnNldFxyXG4vLyAgICAgICAgdmFyIGRheXNEaWZmID0gTWF0aC5mbG9vcigobmV3U3RhcnQudGltZSgpIC0gdGhpcy5nZXQoJ3N0YXJ0JykudGltZSgpKSAvIDEwMDAgLyA2MCAvIDYwIC8gMjQpXHJcbiAgICAgICAgdmFyIGRheXNEaWZmID0gRGF0ZS5kYXlzZGlmZihuZXdTdGFydCwgdGhpcy5nZXQoJ3N0YXJ0JykpIC0gMTtcclxuICAgICAgICBpZiAobmV3U3RhcnQgPCB0aGlzLmdldCgnc3RhcnQnKSkge1xyXG4gICAgICAgICAgICBkYXlzRGlmZiAqPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZSBkYXRlc1xyXG4gICAgICAgIHRoaXMuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQgOiBuZXdTdGFydC5jbG9uZSgpLFxyXG4gICAgICAgICAgICBlbmQgOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXNEaWZmKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGFuZ2VzIGRhdGVzIGluIGFsbCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzRGlmZik7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDaGlsZHJlbiA6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQubW92ZShkYXlzKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlV2l0aENoaWxkcmVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGFzay5zYXZlV2l0aENoaWxkcmVuKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZSA6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMoZGF5cyksXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5nZXQoJ2VuZCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tNb2RlbDtcclxuIiwidmFyIG1vbnRoc0NvZGU9WydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcblxubW9kdWxlLmV4cG9ydHMuY29ycmVjdGRhdGUgPSBmdW5jdGlvbihzdHIpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiBzdHI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRkYXRhID0gZnVuY3Rpb24odmFsLCB0eXBlKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZiAodHlwZSA9PT0gJ20nKSB7XG5cdFx0cmV0dXJuIG1vbnRoc0NvZGVbdmFsXTtcblx0fVxuXHRyZXR1cm4gdmFsO1xufTtcblxubW9kdWxlLmV4cG9ydHMuaGZ1bmMgPSBmdW5jdGlvbihwb3MpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiB7XG5cdFx0eDogcG9zLngsXG5cdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHR9O1xufTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikge1xuXHR2YXIgcGFyYW1zID0ge307XG5cdHZhciBwcm1hcnIgPSBwcm1zdHIuc3BsaXQoJyYnKTtcblx0dmFyIGksIHRtcGFycjtcblx0Zm9yIChpID0gMDsgaSA8IHBybWFyci5sZW5ndGg7IGkrKykge1xuXHRcdHRtcGFyciA9IHBybWFycltpXS5zcGxpdCgnPScpO1xuXHRcdHBhcmFtc1t0bXBhcnJbMF1dID0gdG1wYXJyWzFdO1xuXHR9XG5cdHJldHVybiBwYXJhbXM7XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldFVSTFBhcmFtcyA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHR2YXIgcHJtc3RyID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSk7XG5cdHJldHVybiBwcm1zdHIgIT09IG51bGwgJiYgcHJtc3RyICE9PSAnJyA/IHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIDoge307XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgdGVtcGxhdGUgPSBcIjxkaXYgY2xhc3M9XFxcInVpIHNtYWxsIG1vZGFsIGFkZC1uZXctdGFzayBmbGlwXFxcIj5cXHJcXG4gICAgPGkgY2xhc3M9XFxcImNsb3NlIGljb25cXFwiPjwvaT5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiaGVhZGVyXFxcIj5cXHJcXG4gICAgICAgIEFkZCBuZXcgVGFza1xcclxcbiAgICA8L2Rpdj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiY29udGVudFxcXCI+XFxyXFxuICAgICAgICA8Zm9ybSBjbGFzcz1cXFwidWkgZm9ybVxcXCIgaWQ9XFxcIm5ldy10YXNrLWZvcm1cXFwiPlxcclxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInVpIGZvcm0gc2VnbWVudFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxwPkxldCdzIGdvIGFoZWFkIGFuZCBzZXQgYSBuZXcgZ29hbC48L3A+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbD5UYXNrIG5hbWU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcIm5hbWVcXFwiIHBsYWNlaG9sZGVyPVxcXCJOZXcgdGFzayBuYW1lXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbD5EaXNjcmlwdGlvbjwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgbmFtZT1cXFwiZGVzY3JpcHRpb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJUaGUgZGV0YWlsZWQgZGVzY3JpcHRpb24gb2YgeW91ciB0YXNrXFxcIj48L3RleHRhcmVhPlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlNlbGVjdCBwYXJlbnQ8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJ1aSBkcm9wZG93biBzZWxlY3Rpb25cXFwiPi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IG5hbWU9XFxcInBhcmVudGlkXFxcIiBjbGFzcz1cXFwidWkgZHJvcGRvd25cXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPC9kaXY+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkIHJlc291cmNlc1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkFzc2lnbiBSZXNvdXJjZXM8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U3RhcnQgRGF0ZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcInN0YXJ0XFxcIiBwbGFjZWhvbGRlcj1cXFwiU3RhcnQgRGF0ZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+RW5kIERhdGU8L2xhYmVsPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBuYW1lPVxcXCJlbmRcXFwiIHBsYWNlaG9sZGVyPVxcXCJFbmQgRGF0ZVxcXCIgcmVxdWlyZWQ+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImNvbXBsZXRlXFxcIiB2YWx1ZT1cXFwiMFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImFjdGlvblxcXCIgdmFsdWU9XFxcImFkZFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImRlcGVuZGVuY3lcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8IS0tPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiYVR5cGVcXFwiIHZhbHVlPVxcXCJcXFwiPi0tPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJoZWFsdGhcXFwiIHZhbHVlPVxcXCIyMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImNvbG9yXFxcIiB2YWx1ZT1cXFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwibWlsZXN0b25lXFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImRlbGl2ZXJhYmxlXFxcIiB2YWx1ZT1cXFwiMFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInJlcG9ydGFibGVcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwic29ydGluZGV4XFxcIiB2YWx1ZT1cXFwiMVxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImluc2VydFBvc1xcXCIgdmFsdWU9XFxcInNldFxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInJlZmVyZW5jZV9pZFxcXCIgdmFsdWU9XFxcIi0xXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGxhYmVsPlN0YXR1czwvbGFiZWw+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcInVpIGZsdWlkIHNlbGVjdGlvbiBkcm9wZG93blxcXCI+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJzdGF0dXNcXFwiIHJlcXVpcmVkPi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwiZGVmYXVsdCB0ZXh0XFxcIj5TdGF0dXM8L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxpIGNsYXNzPVxcXCJkcm9wZG93biBpY29uXFxcIj48L2k+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJtZW51XFxcIj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMDhcXFwiPlJlYWR5PC9kaXY+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTA5XFxcIj5PcGVuPC9kaXY+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwiaXRlbVxcXCIgZGF0YS12YWx1ZT1cXFwiMTEwXFxcIj5Db21wbGV0ZWQ8L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwhLS08L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxsYWJlbD5EdXJhdGlvbjwvbGFiZWw+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxpbnB1dCB0eXBlPVxcXCJudW1iZXJcXFwiIG1pbj1cXFwiMFxcXCIgbmFtZT1cXFwiZHVyYXRpb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJQcm9qZWN0IER1cmF0aW9uXFxcIiByZXF1aXJlZCByZWFkb25seT4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwhLS08L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgPCEtLTwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPC9mb3JtPlxcclxcbiAgICA8L2Rpdj5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwiYWN0aW9uc1xcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ1aSBibGFjayBidXR0b24gY2FuY2VsXFxcIj5cXHJcXG4gICAgICAgICAgICBDYW5jZWxcXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwidWkgcG9zaXRpdmUgcmlnaHQgbGFiZWxlZCBpY29uIGJ1dHRvbiBzYXZlXFxcIj5cXHJcXG4gICAgICAgICAgICBBZGQgbmV3IHRhc2tcXHJcXG4gICAgICAgICAgICA8aSBjbGFzcz1cXFwiY2hlY2ttYXJrIGljb25cXFwiPjwvaT5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG48L2Rpdj5cIjtcclxuXHJcbnZhciBkZW1vUmVzb3VyY2VzID0gW3tcIndic2lkXCI6MSxcInJlc19pZFwiOjEsXCJyZXNfbmFtZVwiOlwiSm9lIEJsYWNrXCIsXCJyZXNfYWxsb2NhdGlvblwiOjYwfSx7XCJ3YnNpZFwiOjMsXCJyZXNfaWRcIjoyLFwicmVzX25hbWVcIjpcIkpvaG4gQmxhY2ttb3JlXCIsXCJyZXNfYWxsb2NhdGlvblwiOjQwfV07XHJcblxyXG52YXIgQWRkRm9ybVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBhcHBlbmQgaHRtbCB0byBib2R5XHJcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50KHRoaXMudGVtcGxhdGUpO1xyXG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCdib2R5Jyk7XHJcblxyXG4gICAgICAgIC8vIHNldHVwIHZhbGlkYXRpb25cclxuICAgICAgICAkKCcudWkuZm9ybScpLmZvcm0odGhpcy5fZm9ybVZhbGlkYXRpb25QYXJhbXMpO1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gcmFuZG9tIHBhcmVudCBjb2xvclxyXG4gICAgICAgICQoJ2lucHV0W25hbWU9XCJjb2xvclwiXScpLnZhbCgnIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNikpO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0sIFtuYW1lPVwiZW5kXCJdJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IFwiZGQvbW0veXlcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdJykudmFsKG5ldyBEYXRlKCkudG9TdHJpbmcoJ2RkL01NL3l5eXknKSk7XHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJlbmRcIl0nKS52YWwobmV3IERhdGUoKS5hZGREYXlzKDIpLnRvU3RyaW5nKCdkZC9NTS95eXl5JykpO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdLCBbbmFtZT1cImVuZFwiXScpLmRhdGVwaWNrZXIoXCJyZWZyZXNoXCIpO1xyXG5cclxuLy8gICAgICAgIHRoaXMuX3NldHVwXHJcbiAgICAgICAgdGhpcy5faW5pdFJlc291cmNlcygpO1xyXG4gICAgICAgIC8vIGluaXRpYWxpemUgZHJvcGRvd25cclxuICAgICAgICB0aGlzLl9zZXR1cFBhcmVudFNlbGVjdG9yKCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLm1vZGFsKHtcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN1Ym1pdEZvcm0oZSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRSZXNvdXJjZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBSZXNvdXJjZXMgZnJvbSBiYWNrZW5kXHJcbiAgICAgICAgdmFyICRyZXNvdXJjZXMgPSAnPHNlbGVjdCBpZD1cInJlc291cmNlc1wiICBuYW1lPVwicmVzb3VyY2VzW11cIiBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JztcclxuICAgICAgICBkZW1vUmVzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICRyZXNvdXJjZXMgKz0gJzxvcHRpb24gdmFsdWU9XCInICsgcmVzb3VyY2UucmVzX2lkICsgJ1wiPicgKyByZXNvdXJjZS5yZXNfbmFtZSArICc8L29wdGlvbj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRyZXNvdXJjZXMgKz0gJzwvc2VsZWN0Pic7XHJcbiAgICAgICAgLy8gYWRkIGJhY2tlbmQgdG8gdGhlIHRhc2sgbGlzdFxyXG4gICAgICAgICQoJy5yZXNvdXJjZXMnKS5hcHBlbmQoJHJlc291cmNlcyk7XHJcblxyXG4gICAgICAgIC8vIGluaXRpYWxpemUgbXVsdGlwbGUgc2VsZWN0b3JzXHJcbiAgICAgICAgJCgnI3Jlc291cmNlcycpLmNob3Nlbih7d2lkdGg6ICc5NSUnfSk7XHJcbiAgICB9LFxyXG4gICAgX3NldHVwUGFyZW50U2VsZWN0b3IgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgJHNlbGVjdG9yID0gJCgnW25hbWU9XCJwYXJlbnRpZFwiXScpO1xyXG4gICAgICAgICRzZWxlY3Rvci5lbXB0eSgpO1xyXG4gICAgICAgICRzZWxlY3Rvci5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCIwXCI+TWFpbiBQcm9qZWN0PC9vcHRpb24+Jyk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSBwYXJzZUludCh0YXNrLmdldCgncGFyZW50aWQnKSwgMTApO1xyXG4gICAgICAgICAgICBpZihwYXJlbnRJZCA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIHRhc2suaWQgKyAnXCI+JyArIHRhc2suZ2V0KCduYW1lJykgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCdzZWxlY3QuZHJvcGRvd24nKS5kcm9wZG93bigpO1xyXG4gICAgfSxcclxuICAgIHN1Ym1pdEZvcm06IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgZm9ybSA9ICQoXCIjbmV3LXRhc2stZm9ybVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAkKGZvcm0pLnNlcmlhbGl6ZUFycmF5KCkuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgICBkYXRhW2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgICAgICBpZiAocmVmX21vZGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnNlcnRQb3MgPSBkYXRhLmluc2VydFBvcztcclxuICAgICAgICAgICAgc29ydGluZGV4ID0gcmVmX21vZGVsLmdldCgnc29ydGluZGV4JykgKyAoaW5zZXJ0UG9zID09PSAnYWJvdmUnID8gLTAuNSA6IDAuNSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGlvbi5sYXN0KCkpe1xyXG4gICAgICAgICAgICAgICAgc29ydGluZGV4ID0gKHRoaXMuY29sbGVjdGlvbi5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc29ydGluZGV4ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLnNvcnRpbmRleCA9IHNvcnRpbmRleDtcclxuXHJcbiAgICAgICAgaWYgKGZvcm0uZ2V0KDApLmNoZWNrVmFsaWRpdHkoKSkge1xyXG4gICAgICAgICAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgICAgICAgICB0YXNrLnNhdmUoKTtcclxuICAgICAgICAgICAgLy8gZGVsZXRlIHZpZXdcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAzMDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2Zvcm1WYWxpZGF0aW9uUGFyYW1zIDoge1xyXG4gICAgICAgIG5hbWU6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ25hbWUnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIGVudGVyIGEgdGFzayBuYW1lJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wbGV0ZToge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnY29tcGxldGUnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIGVudGVyIGFuIGVzdGltYXRlIGRheXMnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXJ0OiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdzdGFydCcsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGEgc3RhcnQgZGF0ZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5kOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdlbmQnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhbiBlbmQgZGF0ZSdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHVyYXRpb246IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYSB2YWxpZCBkdXJhdGlvbidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhdHVzOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdzdGF0dXMnLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNlbGVjdCBhIHN0YXR1cydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFkZEZvcm1WaWV3OyIsIlwidXNlIHN0cmljdFwiO1xydmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBTaWRlUGFuZWwgPSByZXF1aXJlKCcuL3NpZGVCYXIvU2lkZVBhbmVsJyk7XHJcclxydmFyIEdhbnR0Q2hhcnRWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXNDaGFydC9HYW50dENoYXJ0VmlldycpO1xydmFyIEFkZEZvcm1WaWV3ID0gcmVxdWlyZSgnLi9BZGRGb3JtVmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51Vmlldy9Ub3BNZW51VmlldycpO1xyXHJccnZhciBHYW50dFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHIgICAgZWw6ICcuR2FudHQnLFxyICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyICAgICAgICB0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgICQoJy5uZXctdGFzaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgbmV3IEFkZEZvcm1WaWV3KHtcciAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLmFwcC5zZXR0aW5nc1xyICAgICAgICAgICAgfSkucmVuZGVyKCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcclxyICAgICAgICBuZXcgVG9wTWVudVZpZXcoe1xyICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLmFwcC5zZXR0aW5ncyxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEdhbnR0Q2hhcnRWaWV3KHtcciAgICAgICAgICAgIGFwcCA6IHRoaXMuYXBwLFxyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLmFwcC5zZXR0aW5nc1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnJlbmRlcigpO1xyICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Ll91cGRhdGVTdGFnZUF0dHJzKCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNTAwKTtcclxyXHIgICAgICAgIHZhciB0YXNrc0NvbnRhaW5lciA9ICQoJy50YXNrcycpLmdldCgwKTtcciAgICAgICAgUmVhY3QucmVuZGVyKFxyICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgICAgICB9KSxcciAgICAgICAgICAgIHRhc2tzQ29udGFpbmVyXHIgICAgICAgICk7XHJcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0JywgZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICBjb25zb2xlLmxvZygncmVjb21waWxlJyk7XHIgICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRhc2tzQ29udGFpbmVyKTtcciAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgICAgICAgICAgfSksXHIgICAgICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgICAgICk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgZXZlbnRzOiB7XHIgICAgICAgICdjbGljayAjdEhhbmRsZSc6ICdleHBhbmQnXHIvLyAgICAgICAgJ2RibGNsaWNrIC5zdWItdGFzayc6ICdoYW5kbGVyb3djbGljaycsXHIvLyAgICAgICAgJ2RibGNsaWNrIC50YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcci8vICAgICAgICAnaG92ZXIgLnN1Yi10YXNrJzogJ3Nob3dNYXNrJ1xyICAgIH0sXHIgICAgY2FsY3VsYXRlRHVyYXRpb246IGZ1bmN0aW9uKCl7XHJcciAgICAgICAgLy8gQ2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uIGZyb20gc3RhcnQgYW5kIGVuZCBkYXRlXHIgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIF9NU19QRVJfREFZID0gMTAwMCAqIDYwICogNjAgKiAyNDtcciAgICAgICAgaWYoc3RhcnRkYXRlICE9PSBcIlwiICYmIGVuZGRhdGUgIT09IFwiXCIpe1xyICAgICAgICAgICAgdmFyIHV0YzEgPSBEYXRlLlVUQyhzdGFydGRhdGUuZ2V0RnVsbFllYXIoKSwgc3RhcnRkYXRlLmdldE1vbnRoKCksIHN0YXJ0ZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHIgICAgICAgIH1lbHNle1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoMCkpO1xyICAgICAgICB9XHIgICAgfSxcciAgICBleHBhbmQ6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgYnV0dG9uID0gJChldnQudGFyZ2V0KTtcciAgICAgICAgaWYgKGJ1dHRvbi5oYXNDbGFzcygnY29udHJhY3QnKSkge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICB9XHIgICAgICAgIGVsc2Uge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICB9XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICB9LmJpbmQodGhpcyksIDYwMCk7XHIgICAgICAgIGJ1dHRvbi50b2dnbGVDbGFzcygnY29udHJhY3QnKTtcciAgICB9LFxyICAgIF9tb3ZlQ2FudmFzVmlldyA6IGZ1bmN0aW9uKCkge1xyICAgICAgICB2YXIgc2lkZUJhcldpZHRoID0gJCgnLm1lbnUtY29udGFpbmVyJykud2lkdGgoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldExlZnRQYWRkaW5nKHNpZGVCYXJXaWR0aCk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gR2FudHRWaWV3O1xyIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIE1vZGFsVGFza0VkaXRDb21wb25lbnQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZWRpdFRhc2snLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgICAgICAvLyBzZXR1cCB2YWx1ZXMgZm9yIHNlbGVjdG9yc1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVTZWxlY3RzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy50YWJ1bGFyLm1lbnUgLml0ZW0nKS50YWIoKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0sIFtuYW1lPVwiZW5kXCJdJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IFwiZGQvbW0veXlcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuXHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVTZWxlY3RzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YXR1c1NlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhdHVzXCJdJyk7XHJcbiAgICAgICAgc3RhdHVzU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIGhlYWx0aFNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiaGVhbHRoXCJdJyk7XHJcbiAgICAgICAgaGVhbHRoU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIHdvcmtPcmRlclNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwid29cIl0nKTtcclxuICAgICAgICB3b3JrT3JkZXJTZWxlY3QuZW1wdHkoKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhLmZvckVhY2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAkKCc8b3B0aW9uIHZhbHVlPVwiJyArIGRhdGEuSUQgKyAnXCI+JyArIGRhdGEuV09OdW1iZXIgKyAnPC9vcHRpb24+JykuYXBwZW5kVG8od29ya09yZGVyU2VsZWN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfZmlsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXQoMCkudmFsdWUgPSAodmFsLnRvU3RyaW5nKCdkZC9NTS95eXl5JykpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0ZXBpY2tlciggXCJyZWZyZXNoXCIgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWwpO1xyXG4vLyAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnc2VsZWN0LW9uZScpIHtcclxuLy8gICAgICAgICAgICAgICAgaW5wdXQuZHJvcGRvd24oJ3NldCB2YWx1ZScsIHZhbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIF9zYXZlRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gaW5wdXQudmFsKCkuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBEYXRlKGRhdGVbMl0gKyAnLScgKyBkYXRlWzFdICsgJy0nICsgZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIG5ldyBEYXRlKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnByb3AoJ2NoZWNrZWQnKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnZhbCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2F2ZSgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kYWxUYXNrRWRpdENvbXBvbmVudDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRmlsdGVyVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNmaWx0ZXItbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NoYW5nZSAjaGlnaHRsaWdodHMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGhpZ2h0bGlnaHRUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2h0bGlnaHRUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHRoaXMuY29sb3JzW2UudGFyZ2V0LnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2hhbmdlICNmaWx0ZXJzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBjcml0ZXJpYSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoY3JpdGVyaWEgPT09ICdyZXNldCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3dUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd1Rhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2hvdyBhbGwgcGFyZW50c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGFzay5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb2xvcnMgOiB7XHJcbiAgICAgICAgJ3N0YXR1cy1iYWNrbG9nJyA6ICcjRDJEMkQ5JyxcclxuICAgICAgICAnc3RhdHVzLXJlYWR5JyA6ICcjQjJEMUYwJyxcclxuICAgICAgICAnc3RhdHVzLXByb2dyZXNzJyA6ICcjNjZBM0UwJyxcclxuICAgICAgICAnc3RhdHVzLWNvbXBsZXRlJyA6ICcjOTlDMjk5JyxcclxuICAgICAgICAnbGF0ZScgOiAnI0ZGQjJCMicsXHJcbiAgICAgICAgJ2R1ZScgOiAnICNGRkMyOTknLFxyXG4gICAgICAgICdtaWxlc3RvbmUnIDogJyNENkMyRkYnLFxyXG4gICAgICAgICdkZWxpdmVyYWJsZScgOiAnI0UwRDFDMicsXHJcbiAgICAgICAgJ2ZpbmFuY2lhbCcgOiAnI0YwRTBCMicsXHJcbiAgICAgICAgJ3RpbWVzaGVldHMnIDogJyNDMkMyQjInLFxyXG4gICAgICAgICdyZXBvcnRhYmxlJyA6ICcgI0UwQzJDMicsXHJcbiAgICAgICAgJ2hlYWx0aC1yZWQnIDogJ3JlZCcsXHJcbiAgICAgICAgJ2hlYWx0aC1hbWJlcicgOiAnI0ZGQkYwMCcsXHJcbiAgICAgICAgJ2hlYWx0aC1ncmVlbicgOiAnZ3JlZW4nXHJcbiAgICB9LFxyXG4gICAgX2dldE1vZGVsc0ZvckNyaXRlcmlhIDogZnVuY3Rpb24oY3JldGVyaWEpIHtcclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdyZXNldHMnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ3N0YXR1cycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKHN0YXR1cykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdzdGF0dXMnKS50b1N0cmluZygpID09PSBpZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2xhdGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnZHVlJykge1xyXG4gICAgICAgICAgICB2YXIgbGFzdERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICBsYXN0RGF0ZS5hZGRXZWVrcygyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA+IG5ldyBEYXRlKCkgJiYgdGFzay5nZXQoJ2VuZCcpIDwgbGFzdERhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoWydtaWxlc3RvbmUnLCAnZGVsaXZlcmFibGUnLCAnZmluYW5jaWFsJywgJ3RpbWVzaGVldHMnLCAncmVwb3J0YWJsZSddLmluZGV4T2YoY3JldGVyaWEpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoY3JldGVyaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ2hlYWx0aCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGhJZCA9IHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGhlYWx0aCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdoZWFsdGgnKS50b1N0cmluZygpID09PSBoZWFsdGhJZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlclZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZ3JvdXBpbmctbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICN0b3AtZXhwYW5kLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICN0b3AtY29sbGFwc2UtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcm91cGluZ01lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNwcm9qZWN0LW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjdXBsb2FkLXByb2plY3QnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdub3QgaW1wbGVtZW50ZWQnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjbGljayAjZG93bmxvYWQtcHJvamVjdCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ25vdCBpbXBsZW1lbnRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1TUHJvamVjdE1lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBSZXBvcnRzTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjcmVwb3J0cy1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3ByaW50JyA6ICdnZW5lcmF0ZVBERidcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVBERiA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0c01lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFpvb21NZW51VmlldyA9IHJlcXVpcmUoJy4vWm9vbU1lbnVWaWV3Jyk7XHJcbnZhciBHcm91cGluZ01lbnVWaWV3ID0gcmVxdWlyZSgnLi9Hcm91cGluZ01lbnVWaWV3Jyk7XHJcbnZhciBGaWx0ZXJNZW51VmlldyA9IHJlcXVpcmUoJy4vRmlsdGVyTWVudVZpZXcnKTtcclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9NU1Byb2plY3RNZW51VmlldycpO1xyXG52YXIgUmVwb3J0c01lbnVWaWV3ID0gcmVxdWlyZSgnLi9SZXBvcnRzTWVudVZpZXcnKTtcclxuXHJcbnZhciBUb3BNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICBuZXcgWm9vbU1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IEdyb3VwaW5nTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgRmlsdGVyTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgTVNQcm9qZWN0TWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgUmVwb3J0c01lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb3BNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgWm9vbU1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3pvb20tbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrIC5hY3Rpb24nOiAnb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQnXHJcbiAgICB9LFxyXG4gICAgb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQgOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gJChldnQuY3VycmVudFRhcmdldCk7XHJcbiAgICAgICAgdmFyIGFjdGlvbiA9IGJ1dHRvbi5kYXRhKCdhY3Rpb24nKTtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBhY3Rpb24uc3BsaXQoJy0nKVsxXTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnNldCgnaW50ZXJ2YWwnLCBpbnRlcnZhbCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBab29tTWVudVZpZXc7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIEFsb25lVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfYm9yZGVyV2lkdGggOiAzLFxyXG4gICAgX2NvbG9yIDogJyNFNkYwRkYnLFxyXG4gICAgZXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmV2ZW50cygpLCB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAubGVmdEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLnJpZ2h0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcblxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAubGVmdEJvcmRlcicgOiAncmVuZGVyJyxcclxuICAgICAgICAgICAgJ2RyYWdlbmQgLnJpZ2h0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAubGVmdEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLmxlZnRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAucmlnaHRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5yaWdodEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZSdcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWluKGxvY2FsWCwgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWF4KGxvY2FsWCwgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9yZXNpemVQb2ludGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZXctcmVzaXplJztcclxuICAgIH0sXHJcbiAgICBfY2hhbmdlU2l6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZWZ0WCA9IHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCk7XHJcbiAgICAgICAgdmFyIHJpZ2h0WCA9IHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpICsgdGhpcy5fYm9yZGVyV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LndpZHRoKHJpZ2h0WCAtIGxlZnRYKTtcclxuICAgICAgICByZWN0LngobGVmdFgpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC54KGxlZnRYKTtcclxuICAgICAgICBjb21wbGV0ZVJlY3Qud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuXHJcbiAgICAgICAgLy8gbW92ZSB0b29sIHBvc2l0aW9uXHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wueChyaWdodFgpO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxIC0gdGhpcy5fYm9yZGVyV2lkdGgpO1xyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxvbmVUYXNrVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQmFzaWNUYXNrVmlldyA9IEJhY2tib25lLktpbmV0aWNWaWV3LmV4dGVuZCh7XHJcbiAgICBfZnVsbEhlaWdodCA6IDIxLFxyXG4gICAgX3RvcFBhZGRpbmcgOiAzLFxyXG4gICAgX2JhckhlaWdodCA6IDE1LFxyXG4gICAgX2NvbXBsZXRlQ29sb3IgOiAnI2U4ODEzNCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLl9mdWxsSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlJyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5ub2RlVHlwZSAhPT0gJ0dyb3VwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdkcmFnZW5kJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlV2l0aENoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VvdmVyJyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dEZXBlbmRlbmN5VG9vbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ3JhYlBvaW50ZXIoZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZW91dCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVEZXBlbmRlbmN5VG9vbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdE1vdXNlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdkcmFnc3RhcnQgLmRlcGVuZGVuY3lUb29sJyA6ICdfc3RhcnRDb25uZWN0aW5nJyxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5kZXBlbmRlbmN5VG9vbCcgOiAnX21vdmVDb25uZWN0JyxcclxuICAgICAgICAgICAgJ2RyYWdlbmQgLmRlcGVuZGVuY3lUb29sJyA6ICdfY3JlYXRlRGVwZW5kZW5jeSdcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gbmV3IEtpbmV0aWMuR3JvdXAoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBwb3MueCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBpZCA6IHRoaXMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lIDogJ21haW5SZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29tcGxldGVSZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgYXJjID0gbmV3IEtpbmV0aWMuU2hhcGUoe1xyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2dyZWVuJyxcclxuICAgICAgICAgICAgZHJhd0Z1bmM6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmFyYygwLCBzZWxmLl9iYXJIZWlnaHQgLyAyLCBzZWxmLl9iYXJIZWlnaHQgLyAyLCAtIE1hdGguUEkgLyAyLCBNYXRoLlBJIC8gMik7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbygwLCAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIHNlbGYuX2JhckhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTdHJva2VTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmFtZSA6ICdkZXBlbmRlbmN5VG9vbCcsXHJcbiAgICAgICAgICAgIHZpc2libGUgOiBmYWxzZSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBncm91cC5hZGQocmVjdCwgY29tcGxldGVSZWN0LCBhcmMpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHJlY3Qud2lkdGgoKTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5yb3VuZCh4IC8gZGF5c1dpZHRoKSwgZGF5czIgPSBNYXRoLnJvdW5kKCh4ICsgbGVuZ3RoKSAvIGRheXNXaWR0aCk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXHJcbiAgICAgICAgICAgIGVuZDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyIC0gMSlcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2hvd0RlcGVuZGVuY3lUb29sIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXS5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ3JhYlBvaW50ZXIgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBlLnRhcmdldC5uYW1lKCk7XHJcbiAgICAgICAgaWYgKChuYW1lICE9PSAnbWFpblJlY3QnKSAmJiAobmFtZSAhPT0gJ2RlcGVuZGVuY3lUb29sJykgJiYgKG5hbWUgIT09ICdjb21wbGV0ZVJlY3QnKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgfSxcclxuICAgIF9kZWZhdWx0TW91c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcclxuICAgIH0sXHJcbiAgICBfaGlkZURlcGVuZGVuY3lUb29sIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfc3RhcnRDb25uZWN0aW5nIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLmhpZGUoKTtcclxuICAgICAgICB2YXIgcG9zID0gdG9vbC5nZXRBYnNvbHV0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IG5ldyBLaW5ldGljLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2UgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDEsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFtwb3MueCAtIHN0YWdlLngoKSwgcG9zLnksIHBvcy54IC0gc3RhZ2UueCgpLCBwb3MueV0sXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29ubmVjdG9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5hZGQoY29ubmVjdG9yKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDb25uZWN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBwb2ludHMgPSBjb25uZWN0b3IucG9pbnRzKCk7XHJcbiAgICAgICAgcG9pbnRzWzJdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueCAtIHN0YWdlLngoKTtcclxuICAgICAgICBwb2ludHNbM10gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS55O1xyXG4gICAgICAgIGNvbm5lY3Rvci5wb2ludHMocG9pbnRzKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xyXG4gICAgICAgIGNvbm5lY3Rvci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIGVsID0gc3RhZ2UuZ2V0SW50ZXJzZWN0aW9uKHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpKTtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBlbCAmJiBlbC5nZXRQYXJlbnQoKTtcclxuICAgICAgICB2YXIgdGFza0lkID0gZ3JvdXAgJiYgZ3JvdXAuaWQoKTtcclxuICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHZhciBhZnRlck1vZGVsID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmdldCh0YXNrSWQpO1xyXG4gICAgICAgIGlmIChhZnRlck1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuY29sbGVjdGlvbi5jcmVhdGVEZXBlbmRlbmN5KGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlRm9yID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdkZXBlbmQnKSA9PT0gYmVmb3JlTW9kZWwuaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVtb3ZlRm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24ucmVtb3ZlRGVwZW5kZW5jeShyZW1vdmVGb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZHJhZ2dpbmcgPSB0aGlzLmVsLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5nZXRDaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZHJhZ2dpbmcgfHwgY2hpbGQuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHgxOiAoRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ3N0YXJ0JykpIC0gMSkgKiBkYXlzV2lkdGgsXHJcbiAgICAgICAgICAgIHgyOiAoRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ2VuZCcpKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICAvLyBtb3ZlIGdyb3VwXHJcbiAgICAgICAgdGhpcy5lbC54KHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgbWFpbiByZWN0IHBhcmFtc1xyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LngoMCk7XHJcbiAgICAgICAgcmVjdC53aWR0aCh4LngyIC0geC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdLngoMCk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngoeC54MiAtIHgueDEpO1xyXG4gICAgICAgIHRvb2wueSh0aGlzLl90b3BQYWRkaW5nKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBzZXRZIDogZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuZWwueSh5KTtcclxuICAgIH0sXHJcbiAgICBnZXRZIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3k7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1Rhc2tWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIENvbm5lY3RvclZpZXcgPSBCYWNrYm9uZS5LaW5ldGljVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yIDogJ2dyZXknLFxyXG4gICAgX3dyb25nQ29sb3IgOiAncmVkJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gcGFyYW1zLmJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMuYWZ0ZXJNb2RlbCA9IHBhcmFtcy5hZnRlck1vZGVsO1xyXG4gICAgICAgIHRoaXMuX3kxID0gMDtcclxuICAgICAgICB0aGlzLl95MiA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGluZSA9IG5ldyBLaW5ldGljLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDIsXHJcbiAgICAgICAgICAgIHN0cm9rZSA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFswLDAsMCwwXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgfSxcclxuICAgIHNldFkxIDogZnVuY3Rpb24oeTEpIHtcclxuICAgICAgICB0aGlzLl95MSA9IHkxO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0WTIgOiBmdW5jdGlvbih5Mikge1xyXG4gICAgICAgIHRoaXMuX3kyID0geTI7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICBpZiAoeC54MiA+PSB4LngxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW3gueDEsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kyLCB4LngyLCB0aGlzLl95Ml0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX3dyb25nQ29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbXHJcbiAgICAgICAgICAgICAgICB4LngxLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MixcclxuICAgICAgICAgICAgICAgIHgueDIsIHRoaXMuX3kyXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRNb2RlbEV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVYIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHgxOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5hZnRlck1vZGVsLmdldCgnc3RhcnQnKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdG9yVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXN0ZWRUYXNrVmlldyA9IHJlcXVpcmUoJy4vTmVzdGVkVGFza1ZpZXcnKTtcclxudmFyIEFsb25lVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Fsb25lVGFza1ZpZXcnKTtcclxudmFyIENvbm5lY3RvclZpZXcgPSByZXF1aXJlKCcuL0Nvbm5lY3RvclZpZXcnKTtcclxuXHJcbnZhciBHYW50dENoYXJ0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI2dhbnR0LWNvbnRhaW5lcicsXHJcbiAgICBfdG9wUGFkZGluZyA6IDczLFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzID0gW107XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9pbml0U3RhZ2UoKTtcclxuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdEJhY2tncm91bmQoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U3ViVmlld3MoKTtcclxuICAgICAgICB0aGlzLl9pbml0Q29sbGVjdGlvbkV2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIHNldExlZnRQYWRkaW5nIDogZnVuY3Rpb24ob2Zmc2V0KSB7XHJcbiAgICAgICAgdGhpcy5fbGVmdFBhZGRpbmcgPSBvZmZzZXQ7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3RhZ2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnN0YWdlID0gbmV3IEtpbmV0aWMuU3RhZ2Uoe1xyXG4gICAgICAgICAgICBjb250YWluZXIgOiB0aGlzLmVsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0TGF5ZXJzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcigpO1xyXG4gICAgICAgIHRoaXMuQmxheWVyID0gbmV3IEtpbmV0aWMuTGF5ZXIoKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmFkZCh0aGlzLkJsYXllciwgdGhpcy5GbGF5ZXIpO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVTdGFnZUF0dHJzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLnN0YWdlLnNldEF0dHJzKHtcclxuICAgICAgICAgICAgeCA6IHRoaXMuX2xlZnRQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KCQoXCIudGFza3NcIikuaW5uZXJIZWlnaHQoKSArIHRoaXMuX3RvcFBhZGRpbmcsIHdpbmRvdy5pbm5lckhlaWdodCAtICQodGhpcy5zdGFnZS5nZXRDb250YWluZXIoKSkub2Zmc2V0KCkudG9wKSxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuJGVsLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDtcclxuICAgICAgICAgICAgICAgIHZhciBtaW5YID0gLSAobGluZVdpZHRoIC0gdGhpcy53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb3MueCA+IHNlbGYuX2xlZnRQYWRkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYuX2xlZnRQYWRkaW5nO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3MueCA8IG1pblgpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbWluWDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHBvcy54O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdEJhY2tncm91bmQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2hhcGUgPSBuZXcgS2luZXRpYy5TaGFwZSh7XHJcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0U2NlbmVGdW5jdGlvbigpLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciB3aWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgYmFjayA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLnN0YWdlLmhlaWdodCgpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHdpZHRoXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuQmxheWVyLmFkZChiYWNrKS5hZGQoc2hhcGUpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9nZXRTY2VuZUZ1bmN0aW9uIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNkaXNwbGF5ID0gdGhpcy5zZXR0aW5ncy5zZGlzcGxheTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IDE7XHJcbiAgICAgICAgdmFyIHJvd0hlaWdodCA9IDIwO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xyXG4gICAgICAgICAgICB2YXIgaSwgcywgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xyXG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgLy9kcmF3IHRocmVlIGxpbmVzXHJcbiAgICAgICAgICAgIGZvcihpID0gMTsgaSA8IDQgOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8ob2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGxpbmVXaWR0aCArIG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB5aSA9IDAsIHlmID0gcm93SGVpZ2h0LCB4aSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAocyA9IDE7IHMgPCAzOyBzKyspe1xyXG4gICAgICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg9aERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgeWYpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMTBwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeCAtIGxlbmd0aCAvIDIsIHlmIC0gcm93SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB5aSA9IHlmOyB5ZiA9IHlmICsgcm93SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDsgcyA9IDM7IHlmID0gMTIwMDtcclxuICAgICAgICAgICAgdmFyIGRyYWdJbnQgPSBwYXJzZUludChzYXR0ci5kcmFnSW50ZXJ2YWwsIDEwKTtcclxuICAgICAgICAgICAgdmFyIGhpZGVEYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmKCBkcmFnSW50ID09PSAxNCB8fCBkcmFnSW50ID09PSAzMCl7XHJcbiAgICAgICAgICAgICAgICBoaWRlRGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IGhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICc2cHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlkZURhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMXB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeCAtIGxlbmd0aCAvIDIsIHlpICsgcm93SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3Ryb2tlU2hhcGUodGhpcyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0Q29sbGVjdGlvbkV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkIHJlbW92ZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyB3YWl0IGZvciBsZWZ0IHBhbmVsIHVwZGF0ZXNcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmRlcGVuZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdkZXBlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rvcih0YXNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnbmVzdGVkU3RhdGVDaGFuZ2UnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVZpZXdGb3JNb2RlbCh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbCA6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgdmFyIHRhc2tWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gbW9kZWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlVmlldyh0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXcgOiBmdW5jdGlvbih0YXNrVmlldykge1xyXG4gICAgICAgIHRhc2tWaWV3LnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl90YXNrVmlld3MsIHRhc2tWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVtb3ZlQ29ubmVjdG9yIDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3LmFmdGVyTW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29ubmVjdG9yVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl9jb25uZWN0b3JWaWV3cywgY29ubmVjdG9yVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTdWJWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3RvclZpZXcodGFzayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkVGFza1ZpZXcgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIHZpZXc7XHJcbiAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IE5lc3RlZFRhc2tWaWV3KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFsb25lVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MucHVzaCh2aWV3KTtcclxuICAgIH0sXHJcbiAgICBfYWRkQ29ubmVjdG9yVmlldyA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgZGVwZW5kSWQgPSB0YXNrLmdldCgnZGVwZW5kJyk7XHJcbiAgICAgICAgaWYgKCFkZXBlbmRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB2aWV3ID0gbmV3IENvbm5lY3RvclZpZXcoe1xyXG4gICAgICAgICAgICBiZWZvcmVNb2RlbCA6IHRoaXMuY29sbGVjdGlvbi5nZXQoZGVwZW5kSWQpLFxyXG4gICAgICAgICAgICBhZnRlck1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcuZWwubW92ZVRvQm90dG9tKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZXNvcnRWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsYXN0WSA9IHRoaXMuX3RvcFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XHJcbiAgICAgICAgICAgIGxhc3RZICs9IHZpZXcuaGVpZ2h0O1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB2YXIgZGVwZW5kSWQgPSB0YXNrLmdldCgnZGVwZW5kJyk7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykgfHwgIWRlcGVuZElkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkZXBlbmRJZCk7XHJcbiAgICAgICAgICAgIHZhciBiZWZvcmVWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGFmdGVyVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGNvbm5lY3RvclZpZXcgPSBfLmZpbmQodGhpcy5fY29ubmVjdG9yVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmVNb2RlbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTEoYmVmb3JlVmlldy5nZXRZKCkgKyBiZWZvcmVWaWV3Ll9mdWxsSGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTIoYWZ0ZXJWaWV3LmdldFkoKSAgKyBhZnRlclZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yIDogJyNiM2QxZmMnLFxyXG4gICAgX2JvcmRlclNpemUgOiA2LFxyXG4gICAgX2JhckhlaWdodCA6IDEwLFxyXG4gICAgX2NvbXBsZXRlQ29sb3IgOiAnI0M5NUYxMCcsXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS2luZXRpYy5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWzAsIDAsIHRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLaW5ldGljLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbLXRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGdyb3VwIGlzIG1vdmVkXHJcbiAgICAgICAgLy8gc28gd2UgbmVlZCB0byBkZXRlY3QgaW50ZXJ2YWxcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5mbG9vcih4IC8gZGF5c1dpZHRoKTtcclxuICAgICAgICB2YXIgbmV3U3RhcnQgPSBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpO1xyXG4gICAgICAgIHRoaXMubW9kZWwubW92ZVRvU3RhcnQobmV3U3RhcnQpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlV2lkdGggPSAoeC54MiAtIHgueDEpICogdGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDA7XHJcbiAgICAgICAgaWYgKGNvbXBsZXRlV2lkdGggPiB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgoeC54MiAtIHgueDEpIC0gY29tcGxldGVXaWR0aCA8IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXN0ZWRUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBNb2RhbEVkaXQgPSByZXF1aXJlKCcuLi9Nb2RhbFRhc2tFZGl0VmlldycpO1xyXG5cclxuZnVuY3Rpb24gQ29udGV4dE1lbnVWaWV3KHBhcmFtcykge1xyXG4gICAgdGhpcy5jb2xsZWN0aW9uID0gcGFyYW1zLmNvbGxlY3Rpb247XHJcbiAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG59XHJcblxyXG5Db250ZXh0TWVudVZpZXcucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgJCgnLnRhc2stY29udGFpbmVyJykuY29udGV4dE1lbnUoe1xyXG4gICAgICAgIHNlbGVjdG9yOiAndWwnLFxyXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKCdpZCcpIHx8ICQodGhpcykuZGF0YSgnaWQnKTtcclxuICAgICAgICAgICAgdmFyIG1vZGVsID0gc2VsZi5jb2xsZWN0aW9uLmdldChpZCk7XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2RlbGV0ZScpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Byb3BlcnRpZXMnKXtcclxuICAgICAgICAgICAgICAgIHZhciB2aWV3ID0gbmV3IE1vZGFsRWRpdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiBtb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHNlbGYuc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAncm93QWJvdmUnKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaW5kZW50Jykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLmluZGVudChtb2RlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ291dGRlbnQnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29sbGVjdGlvbi5vdXRkZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBBYm92ZVwiLCBpY29uOiBcImFib3ZlXCIgfSxcclxuICAgICAgICAgICAgXCJyb3dCZWxvd1wiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBCZWxvd1wiLCBpY29uOiBcImJlbG93XCIgfSxcclxuICAgICAgICAgICAgXCJpbmRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO0luZGVudCBSb3dcIiwgaWNvbjogXCJpbmRlbnRcIiB9LFxyXG4gICAgICAgICAgICBcIm91dGRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO091dGRlbnQgUm93XCIsIGljb246IFwib3V0ZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwic2VwMVwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcInByb3BlcnRpZXNcIjogeyBuYW1lOiBcIiZuYnNwO1Byb3BlcnRpZXNcIiwgaWNvbjogXCJwcm9wZXJ0aWVzXCIgfSxcclxuICAgICAgICAgICAgXCJzZXAyXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwiZGVsZXRlXCI6IHsgbmFtZTogXCImbmJzcDtEZWxldGUgUm93XCIsIGljb246IFwiZGVsZXRlXCIgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc29ydGluZGV4ID0gKHRoaXMuYXBwLnRhc2tzLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpICsgMSk7XHJcbiAgICB9XHJcbiAgICBkYXRhLnNvcnRpbmRleCA9IHNvcnRpbmRleDtcclxuICAgIGRhdGEucGFyZW50aWQgPSByZWZfbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xyXG4gICAgdmFyIHRhc2sgPSB0aGlzLmNvbGxlY3Rpb24uYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRGF0ZVBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ0RhdGVQaWNrZXInLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IFwiZGQvbW0veXlcIixcclxuICAgICAgICAgICAgb25TZWxlY3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5nZXRET01Ob2RlKCkudmFsdWUuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBEYXRlKGRhdGVbMl0gKyAnLScgKyBkYXRlWzFdICsgJy0nICsgZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIDogdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcignc2hvdycpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ2Rlc3Ryb3knKTtcclxuICAgIH0sXHJcbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmdldERPTU5vZGUoKS52YWx1ZSA9IHRoaXMucHJvcHMudmFsdWUudG9TdHJpbmcoJ2RkL21tL3l5Jyk7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlciggXCJyZWZyZXNoXCIgKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWUgOiB0aGlzLnByb3BzLnZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5JylcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XHJcblxyXG52YXIgTmVzdGVkVGFzayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ05lc3RlZFRhc2snLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vbignY2hhbmdlOmhpZGRlbiBjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3VidGFza3MgPSB0aGlzLnByb3BzLm1vZGVsLmNoaWxkcmVuLm1hcChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICBpc1N1YlRhc2sgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdkcmFnLWl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1YlRhc2sgOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsIDogdGhpcy5wcm9wcy5tb2RlbFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdzdWItdGFzay1saXN0IHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VidGFza3NcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2s7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xyXG52YXIgTmVzdGVkVGFzayA9IHJlcXVpcmUoJy4vTmVzdGVkVGFzaycpO1xyXG5cclxuZnVuY3Rpb24gZ2V0RGF0YShjb250YWluZXIpIHtcclxuICAgIHZhciBkYXRhID0gW107XHJcbiAgICB2YXIgY2hpbGRyZW4gPSAkKCc8b2w+JyArIGNvbnRhaW5lci5nZXQoMCkuaW5uZXJIVE1MICsgJzwvb2w+JykuY2hpbGRyZW4oKTtcclxuICAgIF8uZWFjaChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICB2YXIgJGNoaWxkID0gJChjaGlsZCk7XHJcbiAgICAgICAgdmFyIG9iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiAkY2hpbGQuZGF0YSgnaWQnKSxcclxuICAgICAgICAgICAgY2hpbGRyZW4gOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHN1Ymxpc3QgPSAkY2hpbGQuZmluZCgnb2wnKTtcclxuICAgICAgICBpZiAoc3VibGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqLmNoaWxkcmVuID0gZ2V0RGF0YShzdWJsaXN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5wdXNoKG9iaik7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBkYXRhO1xyXG59XHJcblxyXG52YXIgU2lkZVBhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWU6ICdTaWRlUGFuZWwnLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdhZGQgcmVtb3ZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5fbWFrZVNvcnRhYmxlKCk7XHJcbiAgICB9LFxyXG4gICAgX21ha2VTb3J0YWJsZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb250YWluZXIgPSAkKCcudGFzay1jb250YWluZXInKTtcclxuICAgICAgICBjb250YWluZXIuc29ydGFibGUoe1xyXG4gICAgICAgICAgICBncm91cDogJ3NvcnRhYmxlJyxcclxuICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3IgOiAnb2wnLFxyXG4gICAgICAgICAgICBpdGVtU2VsZWN0b3IgOiAnLmRyYWctaXRlbScsXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyIHNvcnQtcGxhY2Vob2xkZXJcIi8+JyxcclxuICAgICAgICAgICAgb25EcmFnU3RhcnQgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25EcmFnIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBsYWNlaG9sZGVyID0gJCgnLnNvcnQtcGxhY2Vob2xkZXInKTtcclxuICAgICAgICAgICAgICAgIHZhciBpc1N1YlRhc2sgPSAhJCgkcGxhY2Vob2xkZXIucGFyZW50KCkpLmhhc0NsYXNzKCd0YXNrLWNvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAgICAgJHBsYWNlaG9sZGVyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3BhZGRpbmctbGVmdCcgOiBpc1N1YlRhc2sgPyAnMzBweCcgOiAnMCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25Ecm9wIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBnZXREYXRhKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLnJlc29ydChkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTApO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIgPSAkKCc8ZGl2PicpO1xyXG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgYmFja2dyb3VuZCA6ICdncmV5JyxcclxuICAgICAgICAgICAgb3BhY2l0eSA6ICcwLjUnLFxyXG4gICAgICAgICAgICBsaWZ0IDogJzAnLFxyXG4gICAgICAgICAgICB0b3AgOiAnMCcsXHJcbiAgICAgICAgICAgIHdpZHRoIDogJzEwMCUnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZW92ZXIoZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgIHZhciBwb3MgPSAkZWwub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB0b3AgOiBwb3MudG9wICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodCA6ICRlbC5oZWlnaHQoKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIHJlcXVlc3RVcGRhdGUgOiAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAod2FpdGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSksXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcudGFzay1jb250YWluZXInKS5zb3J0YWJsZShcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2sucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdkcmFnLWl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFza1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrLWNvbnRhaW5lciBzb3J0YWJsZSdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0YXNrc1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGVQYW5lbDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEYXRlUGlja2VyID0gcmVxdWlyZSgnLi9EYXRlUGlja2VyJyk7XHJcblxyXG52YXIgVGFza0l0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZSA6ICdUYXNrSXRlbScsXHJcbiAgICBnZXRJbml0aWFsU3RhdGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBlZGl0Um93IDogdW5kZWZpbmVkXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIF9maW5kTmVzdGVkTGV2ZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGV2ZWwgPSAwO1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLm1vZGVsLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV2ZWwrKztcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdFJvdyA9PT0gY29sKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVFZGl0RmllbGQoY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVJlYWRGaWxlZChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVSZWFkRmlsZWQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xyXG4gICAgICAgIGlmIChjb2wgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpICsgJyUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuZ2V0KCdzdGFydCcpLCBtb2RlbC5nZXQoJ2VuZCcpKSsnIGQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KGNvbCk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZURhdGVFbGVtZW50IDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF0ZVBpY2tlciwge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHZhbCxcclxuICAgICAgICAgICAga2V5IDogY29sLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2R1cmF0aW9uQ2hhbmdlIDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICB2YXIgbnVtYmVyID0gcGFyc2VJbnQodmFsdWUucmVwbGFjZSggL15cXEQrL2csICcnKSwgMTApO1xyXG4gICAgICAgIGlmICghbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJ3cnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZFdlZWtzKG51bWJlcikpO1xyXG4gICAgICAgIH0gZWxzZSAgaWYgKHZhbHVlLmluZGV4T2YoJ20nKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZE1vbnRocyhudW1iZXIpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBudW1iZXItLTtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkRGF5cyhudW1iZXIpKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUR1cmF0aW9uRmllbGQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdmFsID0gRGF0ZS5kYXlzZGlmZih0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKSwgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2VuZCcpKSsnIGQnO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB0aGlzLnN0YXRlLnZhbCB8fCB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6ICdkdXJhdGlvbicsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHVyYXRpb25DaGFuZ2UobmV3VmFsKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS52YWwgPSBuZXdWYWw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbktleURvd24gOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS52YWwgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVFZGl0RmllbGQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKTtcclxuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZURhdGVFbGVtZW50KGNvbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUR1cmF0aW9uRmllbGQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHZhbCxcclxuICAgICAgICAgICAga2V5IDogY29sLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbktleURvd24gOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgndWwnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2snICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgb25Eb3VibGVDbGljayA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGUudGFyZ2V0LmNsYXNzTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbCA9IGNsYXNzTmFtZS5zbGljZSg0LCBjbGFzc05hbWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IGNvbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZENvbG9yJyA6IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdoaWdodGxpZ2h0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA6ICduYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1uYW1lJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5pc05lc3RlZCgpID8gUmVhY3QuY3JlYXRlRWxlbWVudCgnaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3RyaWFuZ2xlIGljb24gJyArICh0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykgPyAncmlnaHQnIDogJ2Rvd24nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljayA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2NvbGxhcHNlZCcsICF0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9KSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA6ICh0aGlzLl9maW5kTmVzdGVkTGV2ZWwoKSAqIDEwKSArICdweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRmllbGQoJ25hbWUnKSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnY29tcGxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtY29tcGxldGUnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnY29tcGxldGUnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnc3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtc3RhcnQnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnc3RhcnQnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWVuZCdcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdlbmQnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnc3RhdHVzJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXN0YXR1cydcclxuICAgICAgICAgICAgICAgIH0sIG1vZGVsLmdldCgnc3RhdHVzJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2R1cmF0aW9uJykpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbTtcclxuIl19
