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
                    "cDefault": true,
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
            if (child.get('depend') === task.id) {
                child.clearDependence();
            }
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
var params = util.getURLParams();

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
				$.getJSON('/api/GanttConfig/wbs/' + params.project + '/' + params.sitekey, function(statuses) {
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
},{"./collections/taskCollection":2,"./models/SettingModel":4,"./utils/util":6,"./views/GanttView":7}],4:[function(require,module,exports){
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
    findStatusForId : function(id) {
        for(var category in this.statuses.cfgdata) {
            var data = this.statuses.cfgdata[category];
            if (data.Category === 'Task Status') {
                for (var i in data.data) {
                    var statusItem = data.data[i];
                    if (statusItem.ID.toString().toLowerCase() === id.toString().toLowerCase()) {
                        return statusItem.ID;
                    }
                }
            }
        }
    },
    findDefaultStatusId : function() {
        for(var category in this.statuses.cfgdata) {
            var data = this.statuses.cfgdata[category];
            if (data.Category === 'Task Status') {
                for (var i in data.data) {
                    var statusItem = data.data[i];
                    if (statusItem.cDefault) {
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
						return statusItem;
					}
				}
			}
		}
	},
    findHealthForId : function(id) {
        for(var category in this.statuses.cfgdata) {
            var data = this.statuses.cfgdata[category];
            if (data.Category === 'Task Health') {
                for (var i in data.data) {
                    var statusItem = data.data[i];
                    if (statusItem.ID.toString().toLowerCase() === id.toString().toLowerCase()) {
                        return statusItem;
                    }
                }
            }
        }
    },
    findDefaultHealthId : function() {
        for(var category in this.statuses.cfgdata) {
            var data = this.statuses.cfgdata[category];
            if (data.Category === 'Task Health') {
                for (var i in data.data) {
                    var statusItem = data.data[i];
                    if (statusItem.cDefault) {
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
            if (this.parent && this.parent.underMoving) {
                return;
            }
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
        this.underMoving = true;
        this._moveChildren(daysDiff);
        this.underMoving = false;
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
"use strict";var ContextMenuView = require('./sideBar/ContextMenuView');var SidePanel = require('./sideBar/SidePanel');var GanttChartView = require('./canvasChart/GanttChartView');var TopMenuView = require('./TopMenuView/TopMenuView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        new ContextMenuView({            collection : this.collection,            settings: this.app.settings        }).render();        $('.new-task').click(function() {            var lastTask = params.collection.last();            var lastIndex = -1;            if (lastTask) {                lastIndex = lastTask.get('sortindex');            }            params.collection.add({                name : 'New task',                sortindex : lastIndex + 1            });        });        var $sidePanel = $('.menu-container');        $sidePanel.css({            'min-height' : window.innerHeight - $sidePanel.offset().top        });        new TopMenuView({            settings : this.app.settings,            collection : this.collection        }).render();        this.canvasView = new GanttChartView({            app : this.app,            collection : this.collection,            settings: this.app.settings        });        this.canvasView.render();        this._moveCanvasView();        setTimeout(function() {            this.canvasView._updateStageAttrs();        }.bind(this), 500);        var tasksContainer = $('.tasks').get(0);        React.render(            React.createElement(SidePanel, {                collection : this.collection            }),            tasksContainer        );        this.listenTo(this.collection, 'sort', function() {            console.log('recompile');            React.unmountComponentAtNode(tasksContainer);            React.render(                React.createElement(SidePanel, {                    collection : this.collection                }),                tasksContainer            );        });    },    events: {        'click #tHandle': 'expand'    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var button = $(evt.target);        if (button.hasClass('contract')) {            this.$menuContainer.addClass('panel-collapsed');            this.$menuContainer.removeClass('panel-expanded');        }        else {            this.$menuContainer.addClass('panel-expanded');            this.$menuContainer.removeClass('panel-collapsed');        }        setTimeout(function() {            this._moveCanvasView();        }.bind(this), 600);        button.toggleClass('contract');    },    _moveCanvasView : function() {        var sideBarWidth = $('.menu-container').width();        this.canvasView.setLeftPadding(sideBarWidth);    }});module.exports = GanttView;
},{"./TopMenuView/TopMenuView":13,"./canvasChart/GanttChartView":18,"./sideBar/ContextMenuView":20,"./sideBar/SidePanel":23}],8:[function(require,module,exports){
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
            if (key === 'status' && (!val || !this.settings.findStatusForId(val))) {
                val = this.settings.findDefaultStatusId();
            }
            if (key === 'health' && (!val || !this.settings.findHealthForId(val))) {
                val = this.settings.findDefaultHealthId();
            }
            var input = this.$el.find('[name="' + key + '"]');
            if (!input.length) {
                return;
            }
            if (key === 'start' || key === 'end') {
                input.get(0).value = (val.toString('dd/MM/yyyy'));
                input.datepicker( "refresh" );
            } else if (input.prop('type') === 'checkbox') {
                input.prop('checked', val);
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
"use strict";

var ReportsMenuView = Backbone.View.extend({
    el : '#reports-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click #print' : 'generatePDF',
        'click #showVideo' : 'showHelp'
    },
    generatePDF : function(evt) {
        window.print();
        evt.preventDefault();
    },
    showHelp : function() {
        $('#showVideoModal').modal({
            onHidden : function() {
                $(document.body).removeClass('dimmable');
            },
            onApprove : function() {
                $(document.body).removeClass('dimmable');
            }
        }).modal('show');
    }
});

module.exports = ReportsMenuView;

},{}],13:[function(require,module,exports){
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

},{"./FilterMenuView":9,"./GroupingMenuView":10,"./MSProjectMenuView":11,"./ReportsMenuView":12,"./ZoomMenuView":14}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./BasicTaskView":16}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{"./AloneTaskView":15,"./ConnectorView":17,"./NestedTaskView":19}],19:[function(require,module,exports){
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
},{"./BasicTaskView":16}],20:[function(require,module,exports){
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
},{"../ModalTaskEditView":8}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{"./TaskItem":24}],23:[function(require,module,exports){
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

},{"./NestedTask":22,"./TaskItem":24}],24:[function(require,module,exports){
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
                        console.log('dbclick');
                        var className = e.target.className;
                        if (!className) {
                            className = e.target.parentNode.className;
                        }
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
                    key : 'sortindex',
                    className : 'col-sortindex'
                }, model.get('sortindex')),
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
                    key : 'duration',
                    className : 'col-duration'
                }, this._createField('duration'))
            );
    }
});

module.exports = TaskItem;

},{"./DatePicker":21}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvZGF0YS9zdGF0dXNlcy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24uanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2Zha2VfNWZiMTc1LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9HYW50dFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL01vZGFsVGFza0VkaXRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1JlcG9ydHNNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiY2ZnZGF0YVwiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIkNhdGVnb3J5XCI6IFwiVGFzayBIZWFsdGhcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDE1MDI3LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJHcmVlblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDE1MDI4LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJBbWJlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDE1MDI5LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJSZWRcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIkNhdGVnb3J5XCI6IFwiVGFzayBTdGF0dXNcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDIzLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJJbiBQcm9ncmVzc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDI0LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJDb21wbGV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDIxOCxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiUmVhZHlcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAxNTAyNixcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiQmFja2xvZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgXSxcclxuICAgIFwid29kYXRhXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiV09OdW1iZXJcIjogXCJXb3JrT3JkZXJzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiA0MyxcclxuICAgICAgICAgICAgICAgICAgICBcIldPTnVtYmVyXCI6IFwiV08xMDAxOFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDQzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICBdLFxyXG4gICAgXCJyZXNvdXJjZWRhdGFcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjogMSxcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIkdyZWcgVmFuZGVsaWd0XCIsXHJcbiAgICAgICAgICAgIFwiSm9iVGl0bGVcIjogXCJQcm9ncmFtIE1hbmFnZXJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOiA1OCxcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIkphbWVzIEd1bWxleVwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6IFwiUHJvamVjdCBNYW5hZ2VyXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjogMixcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIkx1Y3kgTWlub3RhXCIsXHJcbiAgICAgICAgICAgIFwiSm9iVGl0bGVcIjogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOiA1OSxcclxuICAgICAgICAgICAgXCJVc2VybmFtZVwiOiBcIlJvYiBUeW5hblwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6IFwiQnVzaW5lc3MgQW5hbHlzdFwiXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmwgOiAnYXBpL3Rhc2tzJyxcblx0bW9kZWw6IFRhc2tNb2RlbCxcblx0aW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5zdWJzY3JpYmUoKTtcblx0fSxcblx0Y29tcGFyYXRvciA6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdH0sXG5cdGxpbmtDaGlsZHJlbiA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBwYXJlbnRUYXNrID0gdGhpcy5nZXQodGFzay5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0aWYgKHBhcmVudFRhc2spIHtcblx0XHRcdFx0aWYgKHBhcmVudFRhc2sgPT09IHRhc2spIHtcblx0XHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXJlbnRUYXNrLmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFzay5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3Rhc2sgaGFzIHBhcmVudCB3aXRoIGlkICcgKyB0YXNrLmdldCgncGFyZW50aWQnKSArICcgLSBidXQgdGhlcmUgaXMgbm8gc3VjaCB0YXNrJyk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0X3NvcnRDaGlsZHJlbiA6IGZ1bmN0aW9uICh0YXNrLCBzb3J0SW5kZXgpIHtcblx0XHR0YXNrLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRjaGlsZC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbihjaGlsZCwgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdGNoZWNrU29ydGVkSW5kZXggOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gLTE7XG5cdFx0dGhpcy50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGFzay5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbih0YXNrLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5zb3J0KCk7XG5cdH0sXG5cdF9yZXNvcnRDaGlsZHJlbiA6IGZ1bmN0aW9uKGRhdGEsIHN0YXJ0SW5kZXgsIHBhcmVudElEKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IHN0YXJ0SW5kZXg7XG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2tEYXRhKSB7XG5cdFx0XHR2YXIgdGFzayA9IHRoaXMuZ2V0KHRhc2tEYXRhLmlkKTtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSAhPT0gcGFyZW50SUQpIHtcblx0XHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHBhcmVudElEKTtcblx0XHRcdFx0aWYgKG5ld1BhcmVudCkge1xuXHRcdFx0XHRcdG5ld1BhcmVudC5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRhc2suc2F2ZSh7XG5cdFx0XHRcdHNvcnRpbmRleDogKytzb3J0SW5kZXgsXG5cdFx0XHRcdHBhcmVudGlkOiBwYXJlbnRJRFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAodGFza0RhdGEuY2hpbGRyZW4gJiYgdGFza0RhdGEuY2hpbGRyZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3Jlc29ydENoaWxkcmVuKHRhc2tEYXRhLmNoaWxkcmVuLCBzb3J0SW5kZXgsIHRhc2suaWQpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0cmVzb3J0IDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR0aGlzLl9yZXNvcnRDaGlsZHJlbihkYXRhLCAtMSwgMCk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0c3Vic2NyaWJlIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IG1vZGVsLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0XHRtb2RlbC5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdjYW4gbm90IGZpbmQgcGFyZW50IHdpdGggaWQgJyArIG1vZGVsLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRcdFx0bW9kZWwuc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubGlua0NoaWxkcmVuKCk7XG5cdFx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0XHRcdHRoaXMuX2NoZWNrRGVwZW5kZW5jaWVzKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHRcdHRhc2sucGFyZW50LmNoaWxkcmVuLnJlbW92ZSh0YXNrKTtcblx0XHRcdFx0dGFzay5wYXJlbnQgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdG5ld1BhcmVudC5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuX3ByZXZlbnRTb3J0aW5nKSB7XG5cdFx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRjcmVhdGVEZXBlbmRlbmN5IDogZnVuY3Rpb24gKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKHRoaXMuX2NhbkNyZWF0ZURlcGVuZGVuY2UoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpKSB7XG5cdFx0XHRhZnRlck1vZGVsLmRlcGVuZE9uKGJlZm9yZU1vZGVsKTtcblx0XHR9XG5cdH0sXG5cblx0X2NhbkNyZWF0ZURlcGVuZGVuY2UgOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmIChiZWZvcmVNb2RlbC5oYXNQYXJlbnQoYWZ0ZXJNb2RlbCkgfHwgYWZ0ZXJNb2RlbC5oYXNQYXJlbnQoYmVmb3JlTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICgoYmVmb3JlTW9kZWwuZ2V0KCdkZXBlbmQnKSA9PT0gYWZ0ZXJNb2RlbC5pZCkgfHxcblx0XHRcdChhZnRlck1vZGVsLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0cmVtb3ZlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uKGFmdGVyTW9kZWwpIHtcblx0XHRhZnRlck1vZGVsLmNsZWFyRGVwZW5kZW5jZSgpO1xuXHR9LFxuXHRfY2hlY2tEZXBlbmRlbmNpZXMgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgnZGVwZW5kJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGJlZm9yZU1vZGVsID0gdGhpcy5nZXQodGFzay5nZXQoJ2RlcGVuZCcpKTtcblx0XHRcdGlmICghYmVmb3JlTW9kZWwpIHtcblx0XHRcdFx0dGFzay51bnNldCgnZGVwZW5kJykuc2F2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFzay5kZXBlbmRPbihiZWZvcmVNb2RlbCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0b3V0ZGVudCA6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgdW5kZXJTdWJsaW5ncyA9IFtdO1xuXHRcdGlmICh0YXNrLnBhcmVudCkge1xuXHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRpZiAoY2hpbGQuZ2V0KCdzb3J0aW5kZXgnKSA8PSB0YXNrLmdldCgnc29ydGluZGV4JykpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dW5kZXJTdWJsaW5ncy5wdXNoKGNoaWxkKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR1bmRlclN1YmxpbmdzLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ2RlcGVuZCcpID09PSB0YXNrLmlkKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuY2xlYXJEZXBlbmRlbmNlKCk7XG4gICAgICAgICAgICB9XG5cdFx0XHRjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHRhc2suaWQpO1xuXHRcdH0pO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0aWYgKHRhc2sucGFyZW50ICYmIHRhc2sucGFyZW50LnBhcmVudCkge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHRhc2sucGFyZW50LnBhcmVudC5pZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCAwKTtcblx0XHR9XG5cdH0sXG5cdGluZGVudCA6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgcHJldlRhc2ssIGksIG07XG5cdFx0Zm9yIChpID0gdGhpcy5sZW5ndGggLSAxOyBpID49MDsgaS0tKSB7XG5cdFx0XHRtID0gdGhpcy5hdChpKTtcblx0XHRcdGlmICgobS5nZXQoJ3NvcnRpbmRleCcpIDwgdGFzay5nZXQoJ3NvcnRpbmRleCcpKSAmJiAodGFzay5wYXJlbnQgPT09IG0ucGFyZW50KSkge1xuXHRcdFx0XHRwcmV2VGFzayA9IG07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAocHJldlRhc2spIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCBwcmV2VGFzay5pZCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrQ29sbGVjdGlvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24nKTtcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vbW9kZWxzL1NldHRpbmdNb2RlbCcpO1xuXG52YXIgR2FudHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9HYW50dFZpZXcnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlscy91dGlsJyk7XG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblxuZnVuY3Rpb24gZmV0Y2hDb2xsZWN0aW9uKGFwcCkge1xuXHRhcHAudGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3MgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGFkZCBlbXB0eSB0YXNrIGlmIG5vIHRhc2tzIGZyb20gc2VydmVyXG4gICAgICAgICAgICBpZiAoYXBwLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGFwcC50YXNrcy5yZXNldChbe1xuICAgICAgICAgICAgICAgICAgICBuYW1lIDogJ05ldyB0YXNrJ1xuICAgICAgICAgICAgICAgIH1dKTtcblxuICAgICAgICAgICAgfVxuXHRcdFx0Y29uc29sZS5sb2coJ1N1Y2Nlc3MgbG9hZGluZyB0YXNrcy4nKTtcblx0XHRcdGFwcC50YXNrcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdGFwcC50YXNrcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cblx0XHRcdGFwcC5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyh7fSwge2FwcCA6IGFwcH0pO1xuXHRcdFx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcblx0XHRcdFx0JC5nZXRKU09OKCcvYXBpL0dhbnR0Q29uZmlnL3dicy8nICsgcGFyYW1zLnByb2plY3QgKyAnLycgKyBwYXJhbXMuc2l0ZWtleSwgZnVuY3Rpb24oc3RhdHVzZXMpIHtcblx0XHRcdFx0XHRhcHAuc2V0dGluZ3MgPSBzdGF0dXNlcztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdG5ldyBHYW50dFZpZXcoe1xuXHRcdFx0XHRhcHAgOiBhcHAsXG5cdFx0XHRcdGNvbGxlY3Rpb24gOiBhcHAudGFza3Ncblx0XHRcdH0pLnJlbmRlcigpO1xuXG5cdFx0XHQkKCcjbG9hZGVyJykuZmFkZU91dCgpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9LFxuXHRcdHBhcnNlOiB0cnVlLFxuXHRcdHJlc2V0IDogdHJ1ZVxuXHR9KTtcbn1cblxuXG4kKGZ1bmN0aW9uICgpIHtcblx0dmFyIGFwcCA9IHt9O1xuXHRhcHAudGFza3MgPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcblxuXHQvLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xNyZzaXRla2V5PTJiMDBkYTQ2YjU3YzAzOTVcblx0dmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cdGlmIChwYXJhbXMucHJvamVjdCAmJiBwYXJhbXMucHJvZmlsZSAmJiBwYXJhbXMuc2l0ZWtleSkge1xuXHRcdGFwcC50YXNrcy51cmwgPSAnYXBpL3Rhc2tzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5wcm9maWxlICsgJy8nICsgcGFyYW1zLnNpdGVrZXk7XG5cdH1cblx0ZmV0Y2hDb2xsZWN0aW9uKGFwcCk7XG59KTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XG52YXIgdGVzdFN0YXR1c2VzID0gcmVxdWlyZSgnLi4vLi4vLi4vZGF0YS9zdGF0dXNlcycpO1xuXG4vL3ZhciBoZnVuYyA9IGZ1bmN0aW9uKHBvcywgZXZ0KSB7XG4vL1x0dmFyIGRyYWdJbnRlcnZhbCA9IGFwcC5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJywgJ2RyYWdJbnRlcnZhbCcpO1xuLy9cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcbi8vXHRyZXR1cm4ge1xuLy9cdFx0eDogZXZ0LmluaXBvcy54ICsgbiAqIGRyYWdJbnRlcnZhbCxcbi8vXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcbi8vXHR9O1xuLy99O1xuXG52YXIgU2V0dGluZ01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpbnRlcnZhbDogJ2ZpeCcsXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxuXHRcdGRwaTogMVxuXHR9LFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycywgcGFyYW1zKSB7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMuc3RhdHVzZXMgPSB0ZXN0U3RhdHVzZXM7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwXG5cdFx0fTtcblxuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuYXBwLnRhc2tzO1xuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XG5cdH0sXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xuXHRcdGlmKGF0dHIpe1xuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xuXHR9LFxuXHRmaW5kU3RhdHVzSWQgOiBmdW5jdGlvbihzdGF0dXMpIHtcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBzdGF0dXMudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuICAgIGZpbmRTdGF0dXNGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZpbmREZWZhdWx0U3RhdHVzSWQgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cdGZpbmRIZWFsdGhJZCA6IGZ1bmN0aW9uKGhlYWx0aCkge1xuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XG5cdFx0XHRpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xuXHRcdFx0XHRcdGlmIChzdGF0dXNJdGVtLmNmZ19pdGVtLnRvTG93ZXJDYXNlKCkgPT09IGhlYWx0aC50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG4gICAgZmluZEhlYWx0aEZvcklkIDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZmluZERlZmF1bHRIZWFsdGhJZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblx0ZmluZFdPSWQgOiBmdW5jdGlvbih3bykge1xuXHRcdGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbaV07XG4gICAgICAgICAgICBpZiAoZGF0YS5XT051bWJlci50b0xvd2VyQ2FzZSgpID09PSB3by50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuSUQ7XG4gICAgICAgICAgICB9XG5cdFx0fVxuXHR9LFxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWluRGF0ZSA9IG5ldyBEYXRlKCksIG1heERhdGUgPSBtaW5EYXRlLmNsb25lKCkuYWRkWWVhcnMoMSk7XG5cdFx0XG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3N0YXJ0JykuY29tcGFyZVRvKG1pbkRhdGUpID09PSAtMSkge1xuXHRcdFx0XHRtaW5EYXRlPW1vZGVsLmdldCgnc3RhcnQnKTtcblx0XHRcdH1cblx0XHRcdGlmIChtb2RlbC5nZXQoJ2VuZCcpLmNvbXBhcmVUbyhtYXhEYXRlKSA9PT0gMSkge1xuXHRcdFx0XHRtYXhEYXRlPW1vZGVsLmdldCgnZW5kJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5zYXR0ci5taW5EYXRlID0gbWluRGF0ZTtcblx0XHR0aGlzLnNhdHRyLm1heERhdGUgPSBtYXhEYXRlO1xuXHRcdFxuXHR9LFxuXHRzZXRBdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZW5kLHNhdHRyPXRoaXMuc2F0dHIsZGF0dHI9dGhpcy5zZGlzcGxheSxkdXJhdGlvbixzaXplLGNlbGxXaWR0aCxkcGkscmV0ZnVuYyxzdGFydCxsYXN0LGk9MCxqPTAsaUxlbj0wLG5leHQ9bnVsbDtcblx0XHRcblx0XHR2YXIgaW50ZXJ2YWwgPSB0aGlzLmdldCgnaW50ZXJ2YWwnKTtcblxuXHRcdGlmIChpbnRlcnZhbCA9PT0gJ2RhaWx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDEsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxMjtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDEpO1xuXHRcdFx0fTtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRcblx0XHR9IGVsc2UgaWYoaW50ZXJ2YWwgPT09ICd3ZWVrbHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgNywge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiA3KTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDcpLm1vdmVUb0RheU9mV2VlaygxLCAtMSk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSA1O1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoICogNztcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyg3KTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ21vbnRobHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogMzApLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMjtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDcgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygxKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiAzMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbi5tb3ZlVG9GaXJzdERheU9mUXVhcnRlcigpO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDMwICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMztcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMyk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdmaXgnKSB7XG5cdFx0XHRjZWxsV2lkdGggPSAzMDtcblx0XHRcdGR1cmF0aW9uID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLCBzYXR0ci5tYXhEYXRlKTtcblx0XHRcdHNpemUgPSBkYXR0ci5zY3JlZW5XaWR0aCAtIGRhdHRyLnRIaWRkZW5XaWR0aCAtIDEwMDtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNpemUgLyBkdXJhdGlvbjtcblx0XHRcdGRwaSA9IE1hdGgucm91bmQoY2VsbFdpZHRoIC8gc2F0dHIuZGF5c1dpZHRoKTtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCBkcGksIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IGRwaSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIgKiBkcGkpO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsPT09J2F1dG8nKSB7XG5cdFx0XHRkcGkgPSB0aGlzLmdldCgnZHBpJyk7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAoMSArIE1hdGgubG9nKGRwaSkpICogMTI7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzYXR0ci5jZWxsV2lkdGggLyBkcGk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yMCAqIGRwaSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIGRwaSk7XG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcblx0XHRcdH07XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0fVxuXHRcdHZhciBoRGF0YSA9IHtcblx0XHRcdCcxJzogW10sXG5cdFx0XHQnMic6IFtdLFxuXHRcdFx0JzMnOiBbXVxuXHRcdH07XG5cdFx0dmFyIGhkYXRhMyA9IFtdO1xuXHRcdFxuXHRcdHN0YXJ0ID0gc2F0dHIuYm91bmRhcnlNaW47XG5cdFx0XG5cdFx0bGFzdCA9IHN0YXJ0O1xuXHRcdGlmIChpbnRlcnZhbCA9PT0gJ21vbnRobHknIHx8IGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xuXHRcdFx0dmFyIGR1cmZ1bmM7XG5cdFx0XHRpZiAoaW50ZXJ2YWw9PT0nbW9udGhseScpIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5Nb250aChkYXRlLmdldEZ1bGxZZWFyKCksZGF0ZS5nZXRNb250aCgpKTtcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luUXVhcnRlcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0UXVhcnRlcigpKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xuXHRcdFx0XHRcdGhkYXRhMy5wdXNoKHtcblx0XHRcdFx0XHRcdGR1cmF0aW9uOiBkdXJmdW5jKGxhc3QpLFxuXHRcdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcblx0XHRcdFx0XHRsYXN0ID0gbmV4dDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGludGVydmFsZGF5cyA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xuXHRcdFx0XHRoZGF0YTMucHVzaCh7XG5cdFx0XHRcdFx0ZHVyYXRpb246IGludGVydmFsZGF5cyxcblx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XG5cdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzYXR0ci5ib3VuZGFyeU1heCA9IGVuZCA9IGxhc3Q7XG5cdFx0aERhdGFbJzMnXSA9IGhkYXRhMztcblxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgZGF0ZSB0byBlbmQgb2YgeWVhclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xuXHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXG5cdFx0fSk7XG5cdFx0Zm9yKGkgPSBzdGFydC5nZXRGdWxsWWVhcigpICsgMSwgaUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpOyBpIDwgaUxlbjsgaSsrKXtcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xuXHRcdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxuXHRcdFx0XHR0ZXh0OiBpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxuXHRcdGlmIChzdGFydC5nZXRGdWxsWWVhcigpIT09ZW5kLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGludGVyID0gRGF0ZS5kYXlzZGlmZihuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwgMCwgMSksIGVuZCk7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGVuZC5nZXRGdWxsWWVhcigpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxuXHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihzdGFydCwgc3RhcnQuY2xvbmUoKS5tb3ZlVG9MYXN0RGF5T2ZNb250aCgpKSxcblx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCAnbScpXG5cdFx0fSk7XG5cdFx0XG5cdFx0aiA9IHN0YXJ0LmdldE1vbnRoKCkgKyAxO1xuXHRcdGkgPSBzdGFydC5nZXRGdWxsWWVhcigpO1xuXHRcdGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTtcblx0XHR2YXIgZW5kbW9udGggPSBlbmQuZ2V0TW9udGgoKTtcblxuXHRcdHdoaWxlIChpIDw9IGlMZW4pIHtcblx0XHRcdHdoaWxlKGogPCAxMikge1xuXHRcdFx0XHRpZiAoaSA9PT0gaUxlbiAmJiBqID09PSBlbmRtb250aCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XG5cdFx0XHRcdFx0ZHVyYXRpb246IERhdGUuZ2V0RGF5c0luTW9udGgoaSwgaiksXG5cdFx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGosICdtJylcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGogKz0gMTtcblx0XHRcdH1cblx0XHRcdGkgKz0gMTtcblx0XHRcdGogPSAwO1xuXHRcdH1cblx0XHRpZiAoZW5kLmdldE1vbnRoKCkgIT09IHN0YXJ0LmdldE1vbnRoICYmIGVuZC5nZXRGdWxsWWVhcigpICE9PSBzdGFydC5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihlbmQuY2xvbmUoKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKSwgZW5kKSxcblx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGVuZC5nZXRNb250aCgpLCAnbScpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0c2F0dHIuaERhdGEgPSBoRGF0YTtcblx0fSxcblx0Y2FsY3VsYXRlSW50ZXJ2YWxzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNhbGNtaW5tYXgoKTtcblx0XHR0aGlzLnNldEF0dHJpYnV0ZXMoKTtcblx0fSxcblx0Y29uRFRvVDooZnVuY3Rpb24oKXtcblx0XHR2YXIgZFRvVGV4dD17XG5cdFx0XHQnc3RhcnQnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdH0sXG5cdFx0XHQnZHVyYXRpb24nOmZ1bmN0aW9uKHZhbHVlLG1vZGVsKXtcblx0XHRcdFx0cmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuc3RhcnQsbW9kZWwuZW5kKSsnIGQnO1xuXHRcdFx0fSxcblx0XHRcdCdzdGF0dXMnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0dmFyIHN0YXR1c2VzPXtcblx0XHRcdFx0XHQnMTEwJzonY29tcGxldGUnLFxuXHRcdFx0XHRcdCcxMDknOidvcGVuJyxcblx0XHRcdFx0XHQnMTA4JyA6ICdyZWFkeSdcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHN0YXR1c2VzW3ZhbHVlXTtcblx0XHRcdH1cblx0XHRcblx0XHR9O1xuXHRcdHJldHVybiBmdW5jdGlvbihmaWVsZCx2YWx1ZSxtb2RlbCl7XG5cdFx0XHRyZXR1cm4gZFRvVGV4dFtmaWVsZF0/ZFRvVGV4dFtmaWVsZF0odmFsdWUsbW9kZWwpOnZhbHVlO1xuXHRcdH07XG5cdH0oKSlcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdNb2RlbDtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIFN1YlRhc2tzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG4gICAgY29tcGFyYXRvciA6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxudmFyIFRhc2tNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcbiAgICBkZWZhdWx0czoge1xyXG4gICAgICAgIC8vIE1BSU4gUEFSQU1TXHJcbiAgICAgICAgbmFtZTogJ05ldyB0YXNrJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgY29tcGxldGU6IDAsICAvLyAwJSAtIDEwMCUgcGVyY2VudHNcclxuICAgICAgICBzb3J0aW5kZXg6IDAsICAgLy8gcGxhY2Ugb24gc2lkZSBtZW51LCBzdGFydHMgZnJvbSAwXHJcbiAgICAgICAgZGVwZW5kOiB1bmRlZmluZWQsICAvLyBpZCBvZiB0YXNrXHJcbiAgICAgICAgc3RhdHVzOiAnMTEwJywgICAgICAvLyAxMTAgLSBjb21wbGV0ZSwgMTA5ICAtIG9wZW4sIDEwOCAtIHJlYWR5XHJcbiAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgZW5kOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHBhcmVudGlkOiAwLFxyXG5cclxuICAgICAgICBjb2xvcjogJyMwMDkwZDMnLCAgIC8vIHVzZXIgY29sb3IsIG5vdCB1c2VkIGZvciBub3dcclxuXHJcbiAgICAgICAgLy8gc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXNcclxuICAgICAgICBoZWFsdGg6IDIxLFxyXG4gICAgICAgIHJlcG9ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdvOiAyLCAgICAgICAgICAgICAgICAgIC8vU2VsZWN0IExpc3QgaW4gcHJvcGVydGllcyBtb2RhbCAgIChjb25maWdkYXRhKVxyXG4gICAgICAgIG1pbGVzdG9uZTogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZGVsaXZlcmFibGU6IGZhbHNlLCAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBmaW5hbmNpYWw6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIHRpbWVzaGVldHM6IGZhbHNlLCAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgYWN0dGltZXNoZWV0czogZmFsc2UsICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuXHJcbiAgICAgICAgLy8gc2VydmVyIHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIC8vIGRvbid0IHVzZSB0aGVtIG9uIGNsaWVudCBzaWRlXHJcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5LFxyXG5cclxuXHJcbiAgICAgICAgLy8gcGFyYW1zIGZvciBhcHBsaWNhdGlvbiB2aWV3c1xyXG4gICAgICAgIC8vIHNob3VsZCBiZSByZW1vdmVkIGZyb20gSlNPTlxyXG4gICAgICAgIGhpZGRlbiA6IGZhbHNlLFxyXG4gICAgICAgIGNvbGxhcHNlZCA6IGZhbHNlLFxyXG4gICAgICAgIGhpZ2h0bGlnaHQgOiAnJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gbmV3IFN1YlRhc2tzKCk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdldCgncGFyZW50aWQnKSA9PT0gdGhpcy5pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucmVtb3ZlKGNoaWxkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpzb3J0aW5kZXgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja1RpbWUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldCgnY29sbGFwc2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNraW5nIG5lc3RlZCBzdGF0ZVxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUnLCB0aGlzLl9jaGVja05lc3RlZCk7XHJcblxyXG4gICAgICAgIC8vIHRpbWUgY2hlY2tpbmdcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpjb21wbGV0ZScsIHRoaXMuX2NoZWNrQ29tcGxldGUpO1xyXG4gICAgfSxcclxuICAgIGlzTmVzdGVkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICB9LFxyXG4gICAgc2hvdyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XHJcbiAgICB9LFxyXG4gICAgaGlkZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCB0cnVlKTtcclxuICAgIH0sXHJcbiAgICBkZXBlbmRPbiA6IGZ1bmN0aW9uKGJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2RlcGVuZCcsIGJlZm9yZU1vZGVsLmlkKTtcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9TdGFydChiZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB0aGlzLl9saXN0ZW5CZWZvcmVNb2RlbCgpO1xyXG4gICAgfSxcclxuICAgIGNsZWFyRGVwZW5kZW5jZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZyh0aGlzLmJlZm9yZU1vZGVsKTtcclxuICAgICAgICAgICAgdGhpcy51bnNldCgnZGVwZW5kJykuc2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoYXNQYXJlbnQgOiBmdW5jdGlvbihwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gcGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9saXN0ZW5CZWZvcmVNb2RlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGVhckRlcGVuZGVuY2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC51bmRlck1vdmluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdldCgnc3RhcnQnKSA8IHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG9TdGFydCh0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrTmVzdGVkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCduZXN0ZWRTdGF0ZUNoYW5nZScsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHZhciBzdGFydCwgZW5kO1xyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2Uuc3RhcnQpKXtcclxuICAgICAgICAgICAgc3RhcnQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5zdGFydCksJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2UuZW5kKSl7XHJcbiAgICAgICAgICAgIGVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5lbmQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNwb25zZS5zdGFydCA9IHN0YXJ0IDwgZW5kID8gc3RhcnQgOiBlbmQ7XHJcbiAgICAgICAgcmVzcG9uc2UuZW5kID0gc3RhcnQgPCBlbmQgPyBlbmQgOiBzdGFydDtcclxuXHJcbiAgICAgICAgcmVzcG9uc2UucGFyZW50aWQgPSBwYXJzZUludChyZXNwb25zZS5wYXJlbnRpZCB8fCAnMCcsIDEwKTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIG51bGwgcGFyYW1zXHJcbiAgICAgICAgXy5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAodmFsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzcG9uc2Vba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tUaW1lIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXJ0VGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgIHZhciBlbmRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ2VuZCcpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRTdGFydFRpbWUgPSBjaGlsZC5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZEVuZFRpbWUgPSBjaGlsZC5nZXQoJ2VuZCcpO1xyXG4gICAgICAgICAgICBpZihjaGlsZFN0YXJ0VGltZSA8IHN0YXJ0VGltZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gY2hpbGRTdGFydFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoY2hpbGRFbmRUaW1lID4gZW5kVGltZSl7XHJcbiAgICAgICAgICAgICAgICBlbmRUaW1lID0gY2hpbGRFbmRUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNldCgnc3RhcnQnLCBzdGFydFRpbWUpO1xyXG4gICAgICAgIHRoaXMuc2V0KCdlbmQnLCBlbmRUaW1lKTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tDb21wbGV0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb21wbGV0ZSA9IDA7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgICAgIGlmIChsZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSArPSBjaGlsZC5nZXQoJ2NvbXBsZXRlJykgLyBsZW5ndGg7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNldCgnY29tcGxldGUnLCBNYXRoLnJvdW5kKGNvbXBsZXRlKSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZVRvU3RhcnQgOiBmdW5jdGlvbihuZXdTdGFydCkge1xyXG4gICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgbmV3IHN0YXJ0IGlzIHRoZSBzYW1lIGFzIGN1cnJlbnRcclxuICAgICAgICBpZiAobmV3U3RhcnQudG9EYXRlU3RyaW5nKCkgPT09IHRoaXMuZ2V0KCdzdGFydCcpLnRvRGF0ZVN0cmluZygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBvZmZzZXRcclxuLy8gICAgICAgIHZhciBkYXlzRGlmZiA9IE1hdGguZmxvb3IoKG5ld1N0YXJ0LnRpbWUoKSAtIHRoaXMuZ2V0KCdzdGFydCcpLnRpbWUoKSkgLyAxMDAwIC8gNjAgLyA2MCAvIDI0KVxyXG4gICAgICAgIHZhciBkYXlzRGlmZiA9IERhdGUuZGF5c2RpZmYobmV3U3RhcnQsIHRoaXMuZ2V0KCdzdGFydCcpKSAtIDE7XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0IDwgdGhpcy5nZXQoJ3N0YXJ0JykpIHtcclxuICAgICAgICAgICAgZGF5c0RpZmYgKj0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGFuZ2UgZGF0ZXNcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0IDogbmV3U3RhcnQuY2xvbmUoKSxcclxuICAgICAgICAgICAgZW5kIDogdGhpcy5nZXQoJ2VuZCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzRGlmZilcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hhbmdlcyBkYXRlcyBpbiBhbGwgY2hpbGRyZW5cclxuICAgICAgICB0aGlzLnVuZGVyTW92aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2hpbGRyZW4oZGF5c0RpZmYpO1xyXG4gICAgICAgIHRoaXMudW5kZXJNb3ZpbmcgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBfbW92ZUNoaWxkcmVuIDogZnVuY3Rpb24oZGF5cykge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5tb3ZlKGRheXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmVXaXRoQ2hpbGRyZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0YXNrLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBtb3ZlIDogZnVuY3Rpb24oZGF5cykge1xyXG4gICAgICAgIHRoaXMuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKSxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGFza01vZGVsO1xyXG4iLCJ2YXIgbW9udGhzQ29kZT1bJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuXG5tb2R1bGUuZXhwb3J0cy5jb3JyZWN0ZGF0ZSA9IGZ1bmN0aW9uKHN0cikge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHN0cjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdGRhdGEgPSBmdW5jdGlvbih2YWwsIHR5cGUpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmICh0eXBlID09PSAnbScpIHtcblx0XHRyZXR1cm4gbW9udGhzQ29kZVt2YWxdO1xuXHR9XG5cdHJldHVybiB2YWw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5oZnVuYyA9IGZ1bmN0aW9uKHBvcykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHtcblx0XHR4OiBwb3MueCxcblx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdH07XG59O1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSB7XG5cdHZhciBwYXJhbXMgPSB7fTtcblx0dmFyIHBybWFyciA9IHBybXN0ci5zcGxpdCgnJicpO1xuXHR2YXIgaSwgdG1wYXJyO1xuXHRmb3IgKGkgPSAwOyBpIDwgcHJtYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0dG1wYXJyID0gcHJtYXJyW2ldLnNwbGl0KCc9Jyk7XG5cdFx0cGFyYW1zW3RtcGFyclswXV0gPSB0bXBhcnJbMV07XG5cdH1cblx0cmV0dXJuIHBhcmFtcztcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0VVJMUGFyYW1zID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cdHZhciBwcm1zdHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKTtcblx0cmV0dXJuIHBybXN0ciAhPT0gbnVsbCAmJiBwcm1zdHIgIT09ICcnID8gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikgOiB7fTtcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xydmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBTaWRlUGFuZWwgPSByZXF1aXJlKCcuL3NpZGVCYXIvU2lkZVBhbmVsJyk7XHJcclxydmFyIEdhbnR0Q2hhcnRWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXNDaGFydC9HYW50dENoYXJ0VmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51Vmlldy9Ub3BNZW51VmlldycpO1xyXHJccnZhciBHYW50dFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHIgICAgZWw6ICcuR2FudHQnLFxyICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyICAgICAgICB0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgICQoJy5uZXctdGFzaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdmFyIGxhc3RUYXNrID0gcGFyYW1zLmNvbGxlY3Rpb24ubGFzdCgpO1xyICAgICAgICAgICAgdmFyIGxhc3RJbmRleCA9IC0xO1xyICAgICAgICAgICAgaWYgKGxhc3RUYXNrKSB7XHIgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gbGFzdFRhc2suZ2V0KCdzb3J0aW5kZXgnKTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIHBhcmFtcy5jb2xsZWN0aW9uLmFkZCh7XHIgICAgICAgICAgICAgICAgbmFtZSA6ICdOZXcgdGFzaycsXHIgICAgICAgICAgICAgICAgc29ydGluZGV4IDogbGFzdEluZGV4ICsgMVxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIHZhciAkc2lkZVBhbmVsID0gJCgnLm1lbnUtY29udGFpbmVyJyk7XHIgICAgICAgICRzaWRlUGFuZWwuY3NzKHtcciAgICAgICAgICAgICdtaW4taGVpZ2h0JyA6IHdpbmRvdy5pbm5lckhlaWdodCAtICRzaWRlUGFuZWwub2Zmc2V0KCkudG9wXHIgICAgICAgIH0pO1xyXHJcciAgICAgICAgbmV3IFRvcE1lbnVWaWV3KHtcciAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5hcHAuc2V0dGluZ3MsXHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMuY2FudmFzVmlldyA9IG5ldyBHYW50dENoYXJ0Vmlldyh7XHIgICAgICAgICAgICBhcHAgOiB0aGlzLmFwcCxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyICAgICAgICB9LmJpbmQodGhpcyksIDUwMCk7XHJcclxyICAgICAgICB2YXIgdGFza3NDb250YWluZXIgPSAkKCcudGFza3MnKS5nZXQoMCk7XHIgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2lkZVBhbmVsLCB7XHIgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICAgICAgfSksXHIgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICApO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgY29uc29sZS5sb2coJ3JlY29tcGlsZScpO1xyICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0YXNrc0NvbnRhaW5lcik7XHIgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgICAgIHRhc2tzQ29udGFpbmVyXHIgICAgICAgICAgICApO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIGV2ZW50czoge1xyICAgICAgICAnY2xpY2sgI3RIYW5kbGUnOiAnZXhwYW5kJ1xyICAgIH0sXHIgICAgY2FsY3VsYXRlRHVyYXRpb246IGZ1bmN0aW9uKCl7XHJcciAgICAgICAgLy8gQ2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uIGZyb20gc3RhcnQgYW5kIGVuZCBkYXRlXHIgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIF9NU19QRVJfREFZID0gMTAwMCAqIDYwICogNjAgKiAyNDtcciAgICAgICAgaWYoc3RhcnRkYXRlICE9PSBcIlwiICYmIGVuZGRhdGUgIT09IFwiXCIpe1xyICAgICAgICAgICAgdmFyIHV0YzEgPSBEYXRlLlVUQyhzdGFydGRhdGUuZ2V0RnVsbFllYXIoKSwgc3RhcnRkYXRlLmdldE1vbnRoKCksIHN0YXJ0ZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHIgICAgICAgIH1lbHNle1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoMCkpO1xyICAgICAgICB9XHIgICAgfSxcciAgICBleHBhbmQ6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgYnV0dG9uID0gJChldnQudGFyZ2V0KTtcciAgICAgICAgaWYgKGJ1dHRvbi5oYXNDbGFzcygnY29udHJhY3QnKSkge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICB9XHIgICAgICAgIGVsc2Uge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICB9XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICB9LmJpbmQodGhpcyksIDYwMCk7XHIgICAgICAgIGJ1dHRvbi50b2dnbGVDbGFzcygnY29udHJhY3QnKTtcciAgICB9LFxyICAgIF9tb3ZlQ2FudmFzVmlldyA6IGZ1bmN0aW9uKCkge1xyICAgICAgICB2YXIgc2lkZUJhcldpZHRoID0gJCgnLm1lbnUtY29udGFpbmVyJykud2lkdGgoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldExlZnRQYWRkaW5nKHNpZGVCYXJXaWR0aCk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gR2FudHRWaWV3O1xyIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIE1vZGFsVGFza0VkaXRDb21wb25lbnQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZWRpdFRhc2snLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgICAgICAvLyBzZXR1cCB2YWx1ZXMgZm9yIHNlbGVjdG9yc1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVTZWxlY3RzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy50YWJ1bGFyLm1lbnUgLml0ZW0nKS50YWIoKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0sIFtuYW1lPVwiZW5kXCJdJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IFwiZGQvbW0veXlcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuXHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVTZWxlY3RzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YXR1c1NlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhdHVzXCJdJyk7XHJcbiAgICAgICAgc3RhdHVzU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIGhlYWx0aFNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiaGVhbHRoXCJdJyk7XHJcbiAgICAgICAgaGVhbHRoU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIHdvcmtPcmRlclNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwid29cIl0nKTtcclxuICAgICAgICB3b3JrT3JkZXJTZWxlY3QuZW1wdHkoKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhLmZvckVhY2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAkKCc8b3B0aW9uIHZhbHVlPVwiJyArIGRhdGEuSUQgKyAnXCI+JyArIGRhdGEuV09OdW1iZXIgKyAnPC9vcHRpb24+JykuYXBwZW5kVG8od29ya09yZGVyU2VsZWN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfZmlsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhdHVzJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRTdGF0dXNJZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdoZWFsdGgnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdEhlYWx0aElkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0KDApLnZhbHVlID0gKHZhbC50b1N0cmluZygnZGQvTU0veXl5eScpKTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmRhdGVwaWNrZXIoIFwicmVmcmVzaFwiICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKCdjaGVja2VkJywgdmFsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnZhbCh2YWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgX3NhdmVEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBpbnB1dC52YWwoKS5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgbmV3IERhdGUodmFsdWUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQucHJvcCgnY2hlY2tlZCcpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQudmFsKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zYXZlKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbFRhc2tFZGl0Q29tcG9uZW50O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGaWx0ZXJWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2ZpbHRlci1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2hhbmdlICNoaWdodGxpZ2h0cy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgaGlnaHRsaWdodFRhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaHRsaWdodFRhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdGhpcy5jb2xvcnNbZS50YXJnZXQudmFsdWVdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjaGFuZ2UgI2ZpbHRlcnMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGNyaXRlcmlhID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChjcml0ZXJpYSA9PT0gJ3Jlc2V0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2hvd1Rhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG93VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaG93IGFsbCBwYXJlbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0YXNrLnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbG9ycyA6IHtcclxuICAgICAgICAnc3RhdHVzLWJhY2tsb2cnIDogJyNEMkQyRDknLFxyXG4gICAgICAgICdzdGF0dXMtcmVhZHknIDogJyNCMkQxRjAnLFxyXG4gICAgICAgICdzdGF0dXMtcHJvZ3Jlc3MnIDogJyM2NkEzRTAnLFxyXG4gICAgICAgICdzdGF0dXMtY29tcGxldGUnIDogJyM5OUMyOTknLFxyXG4gICAgICAgICdsYXRlJyA6ICcjRkZCMkIyJyxcclxuICAgICAgICAnZHVlJyA6ICcgI0ZGQzI5OScsXHJcbiAgICAgICAgJ21pbGVzdG9uZScgOiAnI0Q2QzJGRicsXHJcbiAgICAgICAgJ2RlbGl2ZXJhYmxlJyA6ICcjRTBEMUMyJyxcclxuICAgICAgICAnZmluYW5jaWFsJyA6ICcjRjBFMEIyJyxcclxuICAgICAgICAndGltZXNoZWV0cycgOiAnI0MyQzJCMicsXHJcbiAgICAgICAgJ3JlcG9ydGFibGUnIDogJyAjRTBDMkMyJyxcclxuICAgICAgICAnaGVhbHRoLXJlZCcgOiAncmVkJyxcclxuICAgICAgICAnaGVhbHRoLWFtYmVyJyA6ICcjRkZCRjAwJyxcclxuICAgICAgICAnaGVhbHRoLWdyZWVuJyA6ICdncmVlbidcclxuICAgIH0sXHJcbiAgICBfZ2V0TW9kZWxzRm9yQ3JpdGVyaWEgOiBmdW5jdGlvbihjcmV0ZXJpYSkge1xyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ3Jlc2V0cycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignc3RhdHVzJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoc3RhdHVzKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ3N0YXR1cycpLnRvU3RyaW5nKCkgPT09IGlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnbGF0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdkdWUnKSB7XHJcbiAgICAgICAgICAgIHZhciBsYXN0RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIGxhc3REYXRlLmFkZFdlZWtzKDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpID4gbmV3IERhdGUoKSAmJiB0YXNrLmdldCgnZW5kJykgPCBsYXN0RGF0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChbJ21pbGVzdG9uZScsICdkZWxpdmVyYWJsZScsICdmaW5hbmNpYWwnLCAndGltZXNoZWV0cycsICdyZXBvcnRhYmxlJ10uaW5kZXhPZihjcmV0ZXJpYSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldChjcmV0ZXJpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignaGVhbHRoJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGggPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aElkID0gdGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoSWQoaGVhbHRoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2hlYWx0aCcpLnRvU3RyaW5nKCkgPT09IGhlYWx0aElkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsdGVyVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNncm91cGluZy1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3RvcC1leHBhbmQtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI3RvcC1jb2xsYXBzZS1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwaW5nTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3Byb2plY3QtbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICN1cGxvYWQtcHJvamVjdCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ25vdCBpbXBsZW1lbnRlZCcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICNkb3dubG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhbGVydCgnbm90IGltcGxlbWVudGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTVNQcm9qZWN0TWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFJlcG9ydHNNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNyZXBvcnRzLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjcHJpbnQnIDogJ2dlbmVyYXRlUERGJyxcclxuICAgICAgICAnY2xpY2sgI3Nob3dWaWRlbycgOiAnc2hvd0hlbHAnXHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVQREYgOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB3aW5kb3cucHJpbnQoKTtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcbiAgICBzaG93SGVscCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNzaG93VmlkZW9Nb2RhbCcpLm1vZGFsKHtcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRzTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgWm9vbU1lbnVWaWV3ID0gcmVxdWlyZSgnLi9ab29tTWVudVZpZXcnKTtcclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSByZXF1aXJlKCcuL0dyb3VwaW5nTWVudVZpZXcnKTtcclxudmFyIEZpbHRlck1lbnVWaWV3ID0gcmVxdWlyZSgnLi9GaWx0ZXJNZW51VmlldycpO1xyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSByZXF1aXJlKCcuL01TUHJvamVjdE1lbnVWaWV3Jyk7XHJcbnZhciBSZXBvcnRzTWVudVZpZXcgPSByZXF1aXJlKCcuL1JlcG9ydHNNZW51VmlldycpO1xyXG5cclxudmFyIFRvcE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIG5ldyBab29tTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgR3JvdXBpbmdNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBGaWx0ZXJNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNU1Byb2plY3RNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBSZXBvcnRzTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvcE1lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBab29tTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjem9vbS1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgLmFjdGlvbic6ICdvbkludGVydmFsQnV0dG9uQ2xpY2tlZCdcclxuICAgIH0sXHJcbiAgICBvbkludGVydmFsQnV0dG9uQ2xpY2tlZCA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSAkKGV2dC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICB2YXIgYWN0aW9uID0gYnV0dG9uLmRhdGEoJ2FjdGlvbicpO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IGFjdGlvbi5zcGxpdCgnLScpWzFdO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KCdpbnRlcnZhbCcsIGludGVydmFsKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFpvb21NZW51VmlldztcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgQWxvbmVUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9ib3JkZXJXaWR0aCA6IDMsXHJcbiAgICBfY29sb3IgOiAnI0U2RjBGRicsXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gXy5leHRlbmQoQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZXZlbnRzKCksIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5sZWZ0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAucmlnaHRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5sZWZ0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAucmlnaHRCb3JkZXInIDogJ3JlbmRlcicsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5sZWZ0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAubGVmdEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZScsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5yaWdodEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLnJpZ2h0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5taW4obG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5tYXgobG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3Jlc2l6ZVBvaW50ZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xyXG4gICAgfSxcclxuICAgIF9jaGFuZ2VTaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxlZnRYID0gdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKTtcclxuICAgICAgICB2YXIgcmlnaHRYID0gdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkgKyB0aGlzLl9ib3JkZXJXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHJlY3Qud2lkdGgocmlnaHRYIC0gbGVmdFgpO1xyXG4gICAgICAgIHJlY3QueChsZWZ0WCk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB2YXIgY29tcGxldGVSZWN0ID0gdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF07XHJcbiAgICAgICAgY29tcGxldGVSZWN0LngobGVmdFgpO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHJpZ2h0WCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEgLSB0aGlzLl9ib3JkZXJXaWR0aCk7XHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbG9uZVRhc2tWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gQmFja2JvbmUuS2luZXRpY1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9mdWxsSGVpZ2h0IDogMjEsXHJcbiAgICBfdG9wUGFkZGluZyA6IDMsXHJcbiAgICBfYmFySGVpZ2h0IDogMTUsXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjZTg4MTM0JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuX2Z1bGxIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVUeXBlICE9PSAnR3JvdXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdlbmQnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXInIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd0RlcGVuZGVuY3lUb29sKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ncmFiUG9pbnRlcihlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ21vdXNlb3V0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZURlcGVuZGVuY3lUb29sKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0TW91c2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdzdGFydCAuZGVwZW5kZW5jeVRvb2wnIDogJ19zdGFydENvbm5lY3RpbmcnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmRlcGVuZGVuY3lUb29sJyA6ICdfbW92ZUNvbm5lY3QnLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAuZGVwZW5kZW5jeVRvb2wnIDogJ19jcmVhdGVEZXBlbmRlbmN5J1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBuZXcgS2luZXRpYy5Hcm91cCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IHBvcy54LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIGlkIDogdGhpcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgcmVjdCA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbWFpblJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLaW5ldGljLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29tcGxldGVDb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgbmFtZSA6ICdjb21wbGV0ZVJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBhcmMgPSBuZXcgS2luZXRpYy5TaGFwZSh7XHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnZ3JlZW4nLFxyXG4gICAgICAgICAgICBkcmF3RnVuYzogZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYXJjKDAsIHNlbGYuX2JhckhlaWdodCAvIDIsIHNlbGYuX2JhckhlaWdodCAvIDIsIC0gTWF0aC5QSSAvIDIsIE1hdGguUEkgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgc2VsZi5fYmFySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2RlcGVuZGVuY3lUb29sJyxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZChyZWN0LCBjb21wbGV0ZVJlY3QsIGFyYyk7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLnJvdW5kKHggLyBkYXlzV2lkdGgpLCBkYXlzMiA9IE1hdGgucm91bmQoKHggKyBsZW5ndGgpIC8gZGF5c1dpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcclxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zaG93RGVwZW5kZW5jeVRvb2wgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9ncmFiUG9pbnRlciA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgbmFtZSA9IGUudGFyZ2V0Lm5hbWUoKTtcclxuICAgICAgICBpZiAoKG5hbWUgIT09ICdtYWluUmVjdCcpICYmIChuYW1lICE9PSAnZGVwZW5kZW5jeVRvb2wnKSAmJiAobmFtZSAhPT0gJ2NvbXBsZXRlUmVjdCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICB9LFxyXG4gICAgX2RlZmF1bHRNb3VzZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xyXG4gICAgfSxcclxuICAgIF9oaWRlRGVwZW5kZW5jeVRvb2wgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9zdGFydENvbm5lY3RpbmcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wuaGlkZSgpO1xyXG4gICAgICAgIHZhciBwb3MgPSB0b29sLmdldEFic29sdXRlUG9zaXRpb24oKTtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gbmV3IEtpbmV0aWMuTGluZSh7XHJcbiAgICAgICAgICAgIHN0cm9rZSA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoIDogMSxcclxuICAgICAgICAgICAgcG9pbnRzIDogW3Bvcy54IC0gc3RhZ2UueCgpLCBwb3MueSwgcG9zLnggLSBzdGFnZS54KCksIHBvcy55XSxcclxuICAgICAgICAgICAgbmFtZSA6ICdjb25uZWN0b3InXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmFkZChjb25uZWN0b3IpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfbW92ZUNvbm5lY3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHBvaW50cyA9IGNvbm5lY3Rvci5wb2ludHMoKTtcclxuICAgICAgICBwb2ludHNbMl0gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS54IC0gc3RhZ2UueCgpO1xyXG4gICAgICAgIHBvaW50c1szXSA9IHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLnk7XHJcbiAgICAgICAgY29ubmVjdG9yLnBvaW50cyhwb2ludHMpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEZXBlbmRlbmN5IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgY29ubmVjdG9yLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgZWwgPSBzdGFnZS5nZXRJbnRlcnNlY3Rpb24oc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkpO1xyXG4gICAgICAgIHZhciBncm91cCA9IGVsICYmIGVsLmdldFBhcmVudCgpO1xyXG4gICAgICAgIHZhciB0YXNrSWQgPSBncm91cCAmJiBncm91cC5pZCgpO1xyXG4gICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMubW9kZWw7XHJcbiAgICAgICAgdmFyIGFmdGVyTW9kZWwgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZ2V0KHRhc2tJZCk7XHJcbiAgICAgICAgaWYgKGFmdGVyTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmNyZWF0ZURlcGVuZGVuY3koYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciByZW1vdmVGb3IgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZmluZChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2RlcGVuZCcpID09PSBiZWZvcmVNb2RlbC5pZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChyZW1vdmVGb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuY29sbGVjdGlvbi5yZW1vdmVEZXBlbmRlbmN5KHJlbW92ZUZvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRNb2RlbEV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGRvbid0IHVwZGF0ZSBlbGVtZW50IHdoaWxlIGRyYWdnaW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2luZyA9IHRoaXMuZWwuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmdldENoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBkcmFnZ2luZyB8fCBjaGlsZC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSkgLSAxKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnZW5kJykpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICByZXR1cm4gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIC8vIG1vdmUgZ3JvdXBcclxuICAgICAgICB0aGlzLmVsLngoeC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBtYWluIHJlY3QgcGFyYW1zXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHJlY3QueCgwKTtcclxuICAgICAgICByZWN0LndpZHRoKHgueDIgLSB4LngxKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNvbXBsZXRlIHBhcmFtc1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdLndpZHRoKHRoaXMuX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGgoKSk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ueCgwKTtcclxuXHJcbiAgICAgICAgLy8gbW92ZSB0b29sIHBvc2l0aW9uXHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wueCh4LngyIC0geC54MSk7XHJcbiAgICAgICAgdG9vbC55KHRoaXMuX3RvcFBhZGRpbmcpO1xyXG5cclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHNldFkgOiBmdW5jdGlvbih5KSB7XHJcbiAgICAgICAgdGhpcy5feSA9IHk7XHJcbiAgICAgICAgdGhpcy5lbC55KHkpO1xyXG4gICAgfSxcclxuICAgIGdldFkgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQ29ubmVjdG9yVmlldyA9IEJhY2tib25lLktpbmV0aWNWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3IgOiAnZ3JleScsXHJcbiAgICBfd3JvbmdDb2xvciA6ICdyZWQnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuYmVmb3JlTW9kZWwgPSBwYXJhbXMuYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgdGhpcy5hZnRlck1vZGVsID0gcGFyYW1zLmFmdGVyTW9kZWw7XHJcbiAgICAgICAgdGhpcy5feTEgPSAwO1xyXG4gICAgICAgIHRoaXMuX3kyID0gMDtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsaW5lID0gbmV3IEtpbmV0aWMuTGluZSh7XHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoIDogMixcclxuICAgICAgICAgICAgc3Ryb2tlIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgcG9pbnRzIDogWzAsMCwwLDBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9LFxyXG4gICAgc2V0WTEgOiBmdW5jdGlvbih5MSkge1xyXG4gICAgICAgIHRoaXMuX3kxID0geTE7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICBzZXRZMiA6IGZ1bmN0aW9uKHkyKSB7XHJcbiAgICAgICAgdGhpcy5feTIgPSB5MjtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIGlmICh4LngyID49IHgueDEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fY29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbeC54MSwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTIsIHgueDIsIHRoaXMuX3kyXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fd3JvbmdDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFtcclxuICAgICAgICAgICAgICAgIHgueDEsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kyLFxyXG4gICAgICAgICAgICAgICAgeC54MiwgdGhpcy5feTJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5hZnRlck1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5hZnRlck1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkgKiBkYXlzV2lkdGgsXHJcbiAgICAgICAgICAgIHgyOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLmFmdGVyTW9kZWwuZ2V0KCdzdGFydCcpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3JWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrVmlldycpO1xyXG52YXIgQWxvbmVUYXNrVmlldyA9IHJlcXVpcmUoJy4vQWxvbmVUYXNrVmlldycpO1xyXG52YXIgQ29ubmVjdG9yVmlldyA9IHJlcXVpcmUoJy4vQ29ubmVjdG9yVmlldycpO1xyXG5cclxudmFyIEdhbnR0Q2hhcnRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjZ2FudHQtY29udGFpbmVyJyxcclxuICAgIF90b3BQYWRkaW5nIDogNzMsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2luaXRTdGFnZSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRMYXllcnMoKTtcclxuICAgICAgICB0aGlzLl9pbml0QmFja2dyb3VuZCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTdWJWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRDb2xsZWN0aW9uRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0TGVmdFBhZGRpbmcgOiBmdW5jdGlvbihvZmZzZXQpIHtcclxuICAgICAgICB0aGlzLl9sZWZ0UGFkZGluZyA9IG9mZnNldDtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTdGFnZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc3RhZ2UgPSBuZXcgS2luZXRpYy5TdGFnZSh7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA6IHRoaXMuZWxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRMYXllcnMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLkZsYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5CbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcigpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkKHRoaXMuQmxheWVyLCB0aGlzLkZsYXllcik7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZVN0YWdlQXR0cnMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc3RhZ2Uuc2V0QXR0cnMoe1xyXG4gICAgICAgICAgICB4IDogdGhpcy5fbGVmdFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgoJChcIi50YXNrc1wiKS5pbm5lckhlaWdodCgpICsgdGhpcy5fdG9wUGFkZGluZywgd2luZG93LmlubmVySGVpZ2h0IC0gJCh0aGlzLnN0YWdlLmdldENvbnRhaW5lcigpKS5vZmZzZXQoKS50b3ApLFxyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy4kZWwuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmM6ICBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciB4O1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pblggPSAtIChsaW5lV2lkdGggLSB0aGlzLndpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvcy54ID4gc2VsZi5fbGVmdFBhZGRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gc2VsZi5fbGVmdFBhZGRpbmc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvcy54IDwgbWluWCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBtaW5YO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gcG9zLng7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0QmFja2dyb3VuZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IG5ldyBLaW5ldGljLlNoYXBlKHtcclxuICAgICAgICAgICAgc2NlbmVGdW5jOiB0aGlzLl9nZXRTY2VuZUZ1bmN0aW9uKCksXHJcbiAgICAgICAgICAgIHN0cm9rZTogJ2xpZ2h0Z3JheScsXHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoIDogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBiYWNrID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuc3RhZ2UuaGVpZ2h0KCksXHJcbiAgICAgICAgICAgIHdpZHRoIDogd2lkdGhcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5CbGF5ZXIuYWRkKGJhY2spLmFkZChzaGFwZSk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2dldFNjZW5lRnVuY3Rpb24gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2Rpc3BsYXkgPSB0aGlzLnNldHRpbmdzLnNkaXNwbGF5O1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gMTtcclxuICAgICAgICB2YXIgcm93SGVpZ2h0ID0gMjA7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAgICAgICAgIHZhciBpLCBzLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XHJcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAvL2RyYXcgdGhyZWUgbGluZXNcclxuICAgICAgICAgICAgZm9yKGkgPSAxOyBpIDwgNCA7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcclxuICAgICAgICAgICAgZm9yIChzID0gMTsgcyA8IDM7IHMrKyl7XHJcbiAgICAgICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aD1oRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB5Zik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxMHB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWYgLSByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHlpID0geWY7IHlmID0geWYgKyByb3dIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwOyBzID0gMzsgeWYgPSAxMjAwO1xyXG4gICAgICAgICAgICB2YXIgZHJhZ0ludCA9IHBhcnNlSW50KHNhdHRyLmRyYWdJbnRlcnZhbCwgMTApO1xyXG4gICAgICAgICAgICB2YXIgaGlkZURhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYoIGRyYWdJbnQgPT09IDE0IHx8IGRyYWdJbnQgPT09IDMwKXtcclxuICAgICAgICAgICAgICAgIGhpZGVEYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gaERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgIGlmIChoaWRlRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWkgKyByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb250ZXh0LmZpbGxTdHJva2VTaGFwZSh0aGlzKTtcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRDb2xsZWN0aW9uRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAncmVtb3ZlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgcmVtb3ZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIHdhaXQgZm9yIGxlZnQgcGFuZWwgdXBkYXRlc1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdjaGFuZ2U6ZGVwZW5kJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2RlcGVuZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdG9yKHRhc2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICduZXN0ZWRTdGF0ZUNoYW5nZScsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfcmVtb3ZlVmlld0Zvck1vZGVsIDogZnVuY3Rpb24obW9kZWwpIHtcclxuICAgICAgICB2YXIgdGFza1ZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBtb2RlbDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9yZW1vdmVWaWV3KHRhc2tWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVtb3ZlVmlldyA6IGZ1bmN0aW9uKHRhc2tWaWV3KSB7XHJcbiAgICAgICAgdGFza1ZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzID0gXy53aXRob3V0KHRoaXMuX3Rhc2tWaWV3cywgdGFza1ZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZW1vdmVDb25uZWN0b3IgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvclZpZXcgPSBfLmZpbmQodGhpcy5fY29ubmVjdG9yVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXcuYWZ0ZXJNb2RlbCA9PT0gdGFzaztcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25uZWN0b3JWaWV3LnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gXy53aXRob3V0KHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBjb25uZWN0b3JWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN1YlZpZXdzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyh0YXNrKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9hZGRUYXNrVmlldyA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgdmlldztcclxuICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTmVzdGVkVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWxvbmVUYXNrVmlldyh7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcclxuICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9hZGRDb25uZWN0b3JWaWV3IDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciBkZXBlbmRJZCA9IHRhc2suZ2V0KCdkZXBlbmQnKTtcclxuICAgICAgICBpZiAoIWRlcGVuZElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZpZXcgPSBuZXcgQ29ubmVjdG9yVmlldyh7XHJcbiAgICAgICAgICAgIGJlZm9yZU1vZGVsIDogdGhpcy5jb2xsZWN0aW9uLmdldChkZXBlbmRJZCksXHJcbiAgICAgICAgICAgIGFmdGVyTW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XHJcbiAgICAgICAgdmlldy5lbC5tb3ZlVG9Cb3R0b20oKTtcclxuICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzLnB1c2godmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3Jlc29ydFZpZXdzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxhc3RZID0gdGhpcy5fdG9wUGFkZGluZztcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmlldy5zZXRZKGxhc3RZKTtcclxuICAgICAgICAgICAgbGFzdFkgKz0gdmlldy5oZWlnaHQ7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBkZXBlbmRJZCA9IHRhc2suZ2V0KCdkZXBlbmQnKTtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSB8fCAhZGVwZW5kSWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRlcGVuZElkKTtcclxuICAgICAgICAgICAgdmFyIGJlZm9yZVZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgYWZ0ZXJWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcuYmVmb3JlTW9kZWwgPT09IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMShiZWZvcmVWaWV3LmdldFkoKSArIGJlZm9yZVZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMihhZnRlclZpZXcuZ2V0WSgpICArIGFmdGVyVmlldy5fZnVsbEhlaWdodCAvIDIpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuZHJhdygpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FudHRDaGFydFZpZXc7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3IgOiAnI2IzZDFmYycsXHJcbiAgICBfYm9yZGVyU2l6ZSA6IDYsXHJcbiAgICBfYmFySGVpZ2h0IDogMTAsXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjQzk1RjEwJyxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLaW5ldGljLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZSAqIDEuNSwgMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZV0sXHJcbiAgICAgICAgICAgIGNsb3NlZCA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtpbmV0aWMuTGluZSh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFstdGhpcy5fYm9yZGVyU2l6ZSAqIDEuNSwgMCwgMCwgMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZV0sXHJcbiAgICAgICAgICAgIGNsb3NlZCA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZURhdGVzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZ3JvdXAgaXMgbW92ZWRcclxuICAgICAgICAvLyBzbyB3ZSBuZWVkIHRvIGRldGVjdCBpbnRlcnZhbFxyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLmZsb29yKHggLyBkYXlzV2lkdGgpO1xyXG4gICAgICAgIHZhciBuZXdTdGFydCA9IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5tb3ZlVG9TdGFydChuZXdTdGFydCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxKTtcclxuICAgICAgICB2YXIgY29tcGxldGVXaWR0aCA9ICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgICAgICBpZiAoY29tcGxldGVXaWR0aCA+IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbXBsZXRlQ29sb3IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh4LngyIC0geC54MSkgLSBjb21wbGV0ZVdpZHRoIDwgdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbXBsZXRlQ29sb3IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2tWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE1vZGFsRWRpdCA9IHJlcXVpcmUoJy4uL01vZGFsVGFza0VkaXRWaWV3Jyk7XHJcblxyXG5mdW5jdGlvbiBDb250ZXh0TWVudVZpZXcocGFyYW1zKSB7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMuY29sbGVjdGlvbjtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICd1bCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykgfHwgJCh0aGlzKS5kYXRhKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmNvbGxlY3Rpb24uZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnZGVsZXRlJyl7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncHJvcGVydGllcycpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgTW9kYWxFZGl0KHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbCA6IG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzIDogc2VsZi5zZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soZGF0YSwgJ2Fib3ZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QmVsb3cnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH0sICdiZWxvdycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdpbmRlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24uaW5kZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLm91dGRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICBcInJvd0Fib3ZlXCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEFib3ZlXCIsIGljb246IFwiYWJvdmVcIiB9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEJlbG93XCIsIGljb246IFwiYmVsb3dcIiB9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7SW5kZW50IFJvd1wiLCBpY29uOiBcImluZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7T3V0ZGVudCBSb3dcIiwgaWNvbjogXCJvdXRkZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7IG5hbWU6IFwiJm5ic3A7UHJvcGVydGllc1wiLCBpY29uOiBcInByb3BlcnRpZXNcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjogeyBuYW1lOiBcIiZuYnNwO0RlbGV0ZSBSb3dcIiwgaWNvbjogXCJkZWxldGVcIiB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Db250ZXh0TWVudVZpZXcucHJvdG90eXBlLmFkZFRhc2sgPSBmdW5jdGlvbihkYXRhLCBpbnNlcnRQb3MpIHtcclxuICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGFzay5zYXZlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHRNZW51VmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnRGF0ZVBpY2tlcicsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLFxyXG4gICAgICAgICAgICBvblNlbGVjdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSB0aGlzLmdldERPTU5vZGUoKS52YWx1ZS5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgOiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdzaG93Jyk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcignZGVzdHJveScpO1xyXG4gICAgfSxcclxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvbW0veXknKTtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnTmVzdGVkVGFzaycsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9uKCdjaGFuZ2U6aGlkZGVuIGNoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdWJ0YXNrcyA9IHRoaXMucHJvcHMubW9kZWwuY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzay1saXN0LWNvbnRhaW5lciBkcmFnLWl0ZW0nICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiB0aGlzLnByb3BzLm1vZGVsXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdvbCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3N1Yi10YXNrLWxpc3Qgc29ydGFibGUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdWJ0YXNrc1xyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFzaztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XHJcbnZhciBOZXN0ZWRUYXNrID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrJyk7XHJcblxyXG5mdW5jdGlvbiBnZXREYXRhKGNvbnRhaW5lcikge1xyXG4gICAgdmFyIGRhdGEgPSBbXTtcclxuICAgIHZhciBjaGlsZHJlbiA9ICQoJzxvbD4nICsgY29udGFpbmVyLmdldCgwKS5pbm5lckhUTUwgKyAnPC9vbD4nKS5jaGlsZHJlbigpO1xyXG4gICAgXy5lYWNoKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgIHZhciAkY2hpbGQgPSAkKGNoaWxkKTtcclxuICAgICAgICB2YXIgb2JqID0ge1xyXG4gICAgICAgICAgICBpZCA6ICRjaGlsZC5kYXRhKCdpZCcpLFxyXG4gICAgICAgICAgICBjaGlsZHJlbiA6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc3VibGlzdCA9ICRjaGlsZC5maW5kKCdvbCcpO1xyXG4gICAgICAgIGlmIChzdWJsaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBvYmouY2hpbGRyZW4gPSBnZXREYXRhKHN1Ymxpc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLnB1c2gob2JqKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuXHJcbnZhciBTaWRlUGFuZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZTogJ1NpZGVQYW5lbCcsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLl9tYWtlU29ydGFibGUoKTtcclxuICAgIH0sXHJcbiAgICBfbWFrZVNvcnRhYmxlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoJy50YXNrLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGNvbnRhaW5lci5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgIGdyb3VwOiAnc29ydGFibGUnLFxyXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3RvciA6ICdvbCcsXHJcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXIgc29ydC1wbGFjZWhvbGRlclwiLz4nLFxyXG4gICAgICAgICAgICBvbkRyYWdTdGFydCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyYWcgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGdldERhdGEoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlciA9ICQoJzxkaXY+Jyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kIDogJ2dyZXknLFxyXG4gICAgICAgICAgICBvcGFjaXR5IDogJzAuNScsXHJcbiAgICAgICAgICAgIGxpZnQgOiAnMCcsXHJcbiAgICAgICAgICAgIHRvcCA6ICcwJyxcclxuICAgICAgICAgICAgd2lkdGggOiAnMTAwJSdcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlb3ZlcihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgdmFyIHBvcyA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcCA6IHBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogJGVsLmhlaWdodCgpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlbGVhdmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG4gICAgcmVxdWVzdFVwZGF0ZSA6IChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICB9O1xyXG4gICAgfSgpKSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy50YXNrLWNvbnRhaW5lcicpLnNvcnRhYmxlKFwiZGVzdHJveVwiKTtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHRhc2tzID0gW107XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stY29udGFpbmVyIHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRhc2tzXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2lkZVBhbmVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERhdGVQaWNrZXIgPSByZXF1aXJlKCcuL0RhdGVQaWNrZXInKTtcclxuXHJcbnZhciBUYXNrSXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ1Rhc2tJdGVtJyxcclxuICAgIGdldEluaXRpYWxTdGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVkaXRSb3cgOiB1bmRlZmluZWRcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgX2ZpbmROZXN0ZWRMZXZlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZXZlbCA9IDA7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucHJvcHMubW9kZWwucGFyZW50O1xyXG4gICAgICAgIHdoaWxlKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZXZlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXZlbCsrO1xyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRmllbGQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0Um93ID09PSBjb2wpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVkaXRGaWVsZChjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlUmVhZEZpbGVkKGNvbCk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZVJlYWRGaWxlZCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KGNvbCkgKyAnJSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2wgPT09ICdzdGFydCcgfHwgY29sID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KGNvbCkudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2R1cmF0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5nZXQoJ3N0YXJ0JyksIG1vZGVsLmdldCgnZW5kJykpKycgZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRGF0ZUVsZW1lbnQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKTtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChEYXRlUGlja2VyLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogdmFsLFxyXG4gICAgICAgICAgICBrZXkgOiBjb2wsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfZHVyYXRpb25DaGFuZ2UgOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHZhciBudW1iZXIgPSBwYXJzZUludCh2YWx1ZS5yZXBsYWNlKCAvXlxcRCsvZywgJycpLCAxMCk7XHJcbiAgICAgICAgaWYgKCFudW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZigndycpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkV2Vla3MobnVtYmVyKSk7XHJcbiAgICAgICAgfSBlbHNlICBpZiAodmFsdWUuaW5kZXhPZignbScpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkTW9udGhzKG51bWJlcikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG51bWJlci0tO1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKG51bWJlcikpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRHVyYXRpb25GaWVsZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB2YWwgPSBEYXRlLmRheXNkaWZmKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnZW5kJykpKycgZCc7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHRoaXMuc3RhdGUudmFsIHx8IHZhbCxcclxuICAgICAgICAgICAga2V5IDogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kdXJhdGlvbkNoYW5nZShuZXdWYWwpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnZhbCA9IG5ld1ZhbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uS2V5RG93biA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnZhbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUVkaXRGaWVsZCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xyXG4gICAgICAgIGlmIChjb2wgPT09ICdzdGFydCcgfHwgY29sID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRGF0ZUVsZW1lbnQoY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2R1cmF0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRHVyYXRpb25GaWVsZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogdmFsLFxyXG4gICAgICAgICAgICBrZXkgOiBjb2wsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoY29sLCBuZXdWYWwpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uS2V5RG93biA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCd1bCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzaycgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZGJjbGljaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gZS50YXJnZXQuY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbCA9IGNsYXNzTmFtZS5zbGljZSg0LCBjbGFzc05hbWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IGNvbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZENvbG9yJyA6IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdoaWdodGxpZ2h0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3NvcnRpbmRleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1zb3J0aW5kZXgnXHJcbiAgICAgICAgICAgICAgICB9LCBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiAnbmFtZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtbmFtZSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuaXNOZXN0ZWQoKSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2knLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0cmlhbmdsZSBpY29uICcgKyAodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpID8gJ3JpZ2h0JyA6ICdkb3duJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2sgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdjb2xsYXBzZWQnLCAhdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgOiAodGhpcy5fZmluZE5lc3RlZExldmVsKCkgKiAxMCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpZWxkKCduYW1lJykpXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2NvbXBsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWNvbXBsZXRlJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2NvbXBsZXRlJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3N0YXJ0JyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXN0YXJ0J1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ3N0YXJ0JykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2VuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1lbmQnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnZW5kJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2R1cmF0aW9uJykpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbTtcclxuIl19
