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
						return statusItem.ID;
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
                        return statusItem.ID;
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
        resources : [],         //list of id
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
"use strict";var ContextMenuView = require('./sideBar/ContextMenuView');var SidePanel = require('./sideBar/SidePanel');var GanttChartView = require('./canvasChart/GanttChartView');var TopMenuView = require('./TopMenuView/TopMenuView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        new ContextMenuView({            collection : this.collection,            settings: this.app.settings        }).render();        // new task button        $('.new-task').click(function() {            var lastTask = params.collection.last();            var lastIndex = -1;            if (lastTask) {                lastIndex = lastTask.get('sortindex');            }            params.collection.add({                name : 'New task',                sortindex : lastIndex + 1            });        });        // set side tasks panel height        var $sidePanel = $('.menu-container');        $sidePanel.css({            'min-height' : window.innerHeight - $sidePanel.offset().top        });        new TopMenuView({            settings : this.app.settings,            collection : this.collection        }).render();        this.canvasView = new GanttChartView({            app : this.app,            collection : this.collection,            settings: this.app.settings        });        this.canvasView.render();        this._moveCanvasView();        setTimeout(function() {            this.canvasView._updateStageAttrs();        }.bind(this), 500);        var tasksContainer = $('.tasks').get(0);        React.render(            React.createElement(SidePanel, {                collection : this.collection            }),            tasksContainer        );        this.listenTo(this.collection, 'sort', function() {            console.log('recompile');            React.unmountComponentAtNode(tasksContainer);            React.render(                React.createElement(SidePanel, {                    collection : this.collection                }),                tasksContainer            );        });    },    events: {        'click #tHandle': 'expand'    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var button = $(evt.target);        if (button.hasClass('contract')) {            this.$menuContainer.addClass('panel-collapsed');            this.$menuContainer.removeClass('panel-expanded');        }        else {            this.$menuContainer.addClass('panel-expanded');            this.$menuContainer.removeClass('panel-collapsed');        }        setTimeout(function() {            this._moveCanvasView();        }.bind(this), 600);        button.toggleClass('contract');    },    _moveCanvasView : function() {        var sideBarWidth = $('.menu-container').width();        this.canvasView.setLeftPadding(sideBarWidth);    }});module.exports = GanttView;
},{"./TopMenuView/TopMenuView":14,"./canvasChart/GanttChartView":19,"./sideBar/ContextMenuView":21,"./sideBar/SidePanel":24}],8:[function(require,module,exports){
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


var ResourceEditorView = Backbone.View.extend({
    initialize : function(params) {
        this.settings = params.settings;
    },
    render : function(pos) {
        var stagePos = $('#gantt-container').offset();
        var fakeEl = $('<div>').appendTo('body');
        fakeEl.css({
            position : 'absolute',
            top : pos.y + stagePos.top + 'px',
            left : pos.x + stagePos.left + 'px'
        });

        this.popup = $('.custom.popup');
        fakeEl.popup({
            popup : this.popup,
            on : 'click',
            position : 'bottom left',
            onHidden : function() {
                this._saveData();
            }.bind(this)
        }).popup('show');

        this._addResources();
        this._fullData();
    },
    _addResources : function() {
        this.popup.empty();
        var htmlString = '';
        this.settings.statuses.resourcedata.forEach(function(resource) {
            htmlString += '<div class="ui checkbox">' +
                    '<input type="checkbox"  name="' + resource.UserId + '">' +
                    '<label>' + resource.Username + '</label>' +
                '</div>';
        });
        this.popup.append(htmlString);
        this.popup.find('.ui.checkbox').checkbox();
    },
    _fullData : function() {
        var popup = this.popup;
        this.model.get('resources').forEach(function(resource) {
            popup.find('[name="' + resource + '"]').prop('checked', true);
        });
    },
    _saveData : function() {
        var resources = [];
        this.popup.find('input').each(function(i, input) {
            var $input = $(input);
            if ($input.prop('checked')) {
                resources.push($input.attr('name'));
            }
        }.bind(this));
        this.model.save('resources', resources);
    }
});

module.exports = ResourceEditorView;

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
        'status-in progress' : '#66A3E0',
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
            var id = (this.settings.findStatusId(status) || '').toString();
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
            var healthId = (this.settings.findHealthId(health) || '').toString();
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
        var leftBorder = new Konva.Rect({
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
        var rightBorder = new Konva.Rect({
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
        var resources = this.el.find('.resources')[0];
        resources.x(rightX + this._toolbarOffset);

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
var ResourceEditor = require('../ResourcesEditor');

var linkImage = new Image();
linkImage.src = '/css/images/link.png';

var userImage = new Image();
userImage.src = '/css/images/user.png';

var BasicTaskView = Backbone.KonvaView.extend({
    _fullHeight : 21,
    _topPadding : 3,
    _barHeight : 15,
    _completeColor : '#e88134',
    _toolbarOffset : 20,
    _resourceListOffset : 20,
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
            'mouseenter' : function(e) {
                this._showTools();
                this._hideResourcesList();
                this._grabPointer(e);
            },
            'mouseleave' : function(e) {
                console.error(e);
                this._hideTools();
                this._showResourcesList();
                this._defaultMouse();
            },
            'dragstart .dependencyTool' : '_startConnecting',
            'dragmove .dependencyTool' : '_moveConnect',
            'dragend .dependencyTool' : '_createDependency',
            'click .resources' : '_editResources'
        };
    },
    el : function() {
        var group = new Konva.Group({
            dragBoundFunc : function(pos) {
                return {
                    x : pos.x,
                    y : this._y
                };
            }.bind(this),
            id : this.model.cid,
            draggable : true
        });
        var fakeBackground = new Konva.Rect({
            y : this._topPadding,
            height : this._barHeight,
            name : 'fakeBackground'
        });
        var rect = new Konva.Rect({
            fill : this._color,
            y : this._topPadding,
            height : this._barHeight,
            name : 'mainRect'
        });
        var completeRect = new Konva.Rect({
            fill : this._completeColor,
            y : this._topPadding,
            height : this._barHeight,
            name : 'completeRect'
        });
        var self = this;
        var arc = new Konva.Shape({
            y: this._topPadding,
            fill : 'lightgreen',
            drawFunc: function(context) {
                var horOffset = 6;
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(horOffset, 0);
                context.arc(horOffset, self._barHeight / 2, self._barHeight / 2, - Math.PI / 2, Math.PI / 2);
                context.lineTo(0, self._barHeight);
                context.lineTo(0, 0);
                context.fillShape(this);
                context.drawImage(linkImage, 1, (self._barHeight - 10) / 2,10,10);
            },
            hitFunc : function(context) {
                context.beginPath();
                context.rect(0, 0, 6 + self._barHeight, self._barHeight);
                context.fillShape(this);
            },
            name : 'dependencyTool',
            visible : false,
            draggable : true
        });

        var toolbar = new Konva.Group({
            y: this._topPadding,
            name : 'resources',
            visible : false
        });
        var toolback = new Konva.Rect({
            fill : 'lightgrey',
            width : self._barHeight,
            height : self._barHeight,
            cornerRadius : 2
        });
        var userIm = new Konva.Image({
            image : userImage,
            x : (self._barHeight - 10) / 2,
            y : (self._barHeight - 10) / 2,
            width : 10,
            height : 10
        });
        toolbar.add(toolback, userIm);

        var resourceList = new Konva.Text({
            name : 'resourceList',
            y : this._topPadding,
            listening : false
        });

        group.add(fakeBackground, rect, completeRect, arc, toolbar, resourceList);
        return group;
    },
    _editResources : function() {
        var view = new ResourceEditor({
            model : this.model,
            settings : this.settings
        });
        var pos = this.el.getStage().getPointerPosition();
        view.render(pos);
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
    _showTools : function() {
        this.el.find('.dependencyTool').show();
        this.el.find('.resources').show();
        this.el.getLayer().draw();
    },
    _hideTools : function() {
        this.el.find('.dependencyTool').hide();
        this.el.find('.resources').hide();
        this.el.getLayer().draw();
    },
    _showResourcesList : function() {
        this.el.find('.resourceList').show();
        this.el.getLayer().batchDraw();
    },
    _hideResourcesList : function() {
        this.el.find('.resourceList').hide();
        this.el.getLayer().batchDraw();
    },
    _grabPointer : function(e) {
        var name = e.target.name();
        if ((name === 'mainRect') || (name === 'dependencyTool') ||
            (name === 'completeRect') || (e.target.getParent().name() === 'resources')) {
            document.body.style.cursor = 'pointer';
        }
    },
    _defaultMouse : function() {
        document.body.style.cursor = 'default';
    },
    _startConnecting : function() {
        var stage = this.el.getStage();
        var tool = this.el.find('.dependencyTool')[0];
        tool.hide();
        var pos = tool.getAbsolutePosition();
        var connector = new Konva.Line({
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
        this.listenTo(this.model, 'change:start change:end change:complete change:resources', function() {
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

        // update fake background rect params
        var back = this.el.find('.fakeBackground')[0];
        back.x( - 20);
        back.width(x.x2 - x.x1 + 60);

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

        var resources = this.el.find('.resources')[0];
        resources.x(x.x2 - x.x1 + this._toolbarOffset);
        resources.y(this._topPadding);


        // update resource list
        var resourceList = this.el.find('.resourceList')[0];
        resourceList.x(x.x2 - x.x1 + this._resourceListOffset);
        resourceList.y(this._topPadding + 2);
        var text = '';
        this.model.get('resources').forEach(function(resourceId) {
            var res = _.find(this.settings.statuses.resourcedata, function(res) {
                return res.UserId.toString() === resourceId.toString();
            });
            if (res) {
                text += res.Username + ' ';
            }
        }.bind(this));
        resourceList.text(text);

        this.el.getLayer().batchDraw();
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
},{"../ResourcesEditor":9}],18:[function(require,module,exports){
"use strict";

var ConnectorView = Backbone.KonvaView.extend({
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
        var line = new Konva.Line({
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
        this.stage = new Konva.Stage({
            container : this.el
        });
        this._updateStageAttrs();
    },
    _initLayers : function() {
        this.Flayer = new Konva.Layer();
        this.Blayer = new Konva.Layer();
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
        var shape = new Konva.Shape({
            sceneFunc: this._getSceneFunction(),
            stroke: 'lightgray',
            strokeWidth : 0
        });
        var sattr = this.settings.sattr;
        var width = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;
        var back = new Konva.Rect({
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
        this.listenTo(this.collection, 'change:hidden', _.debounce(function() {
            this._resortViews();
        }.bind(this)), 5);
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
        var leftBorder = new Konva.Line({
            fill : this._color,
            y : this._topPadding + this._barHeight,
            points : [0, 0, this._borderSize * 1.5, 0, 0, this._borderSize],
            closed : true,
            name : 'leftBorder'
        });
        group.add(leftBorder);
        var rightBorder = new Konva.Line({
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
},{"../ModalTaskEditView":8}],22:[function(require,module,exports){
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
    componentDidUpdate : function() {
        $(this.getDOMNode()).find('input').focus();
    },
    componentDidMount  : function() {
        this.props.model.on('change:name change:complete change:start change:end change:duration change:hightlight', function() {
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
            }.bind(this),
            onBlur : function(e) {
                var state = this.state;
                state.editRow = undefined;
                this.setState(state);
                this.props.model.save();
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
                }, model.get('sortindex') + 1),
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

},{"./DatePicker":22}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvZGF0YS9zdGF0dXNlcy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24uanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2Zha2VfMmE4ZmYxMDkuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9TZXR0aW5nTW9kZWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9UYXNrTW9kZWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3V0aWxzL3V0aWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0dhbnR0Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvTW9kYWxUYXNrRWRpdFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1Jlc291cmNlc0VkaXRvci5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvRmlsdGVyTWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L0dyb3VwaW5nTWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L01TUHJvamVjdE1lbnVWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9SZXBvcnRzTWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9ab29tTWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0Fsb25lVGFza1ZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0Jhc2ljVGFza1ZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0Nvbm5lY3RvclZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9OZXN0ZWRUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9Db250ZXh0TWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvRGF0ZVBpY2tlci5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9OZXN0ZWRUYXNrLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1NpZGVQYW5lbC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgXCJjZmdkYXRhXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiQ2F0ZWdvcnlcIjogXCJUYXNrIEhlYWx0aFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogMTUwMjcsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOiBcIkdyZWVuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogMCxcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogMTUwMjgsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOiBcIkFtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogMTUwMjksXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOiBcIlJlZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiQ2F0ZWdvcnlcIjogXCJUYXNrIFN0YXR1c1wiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogMjMsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOiBcIkluIFByb2dyZXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogMixcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogMjQsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOiBcIkNvbXBsZXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogMyxcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogMjE4LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJSZWFkeVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDE1MDI2LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjogXCJCYWNrbG9nXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogMCxcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICBdLFxyXG4gICAgXCJ3b2RhdGFcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJXT051bWJlclwiOiBcIldvcmtPcmRlcnNcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6IDQzLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiV09OdW1iZXJcIjogXCJXTzEwMDE4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogNDNcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIF0sXHJcbiAgICBcInJlc291cmNlZGF0YVwiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOiAxLFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6IFwiR3JlZyBWYW5kZWxpZ3RcIixcclxuICAgICAgICAgICAgXCJKb2JUaXRsZVwiOiBcIlByb2dyYW0gTWFuYWdlclwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiVXNlcklkXCI6IDU4LFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6IFwiSmFtZXMgR3VtbGV5XCIsXHJcbiAgICAgICAgICAgIFwiSm9iVGl0bGVcIjogXCJQcm9qZWN0IE1hbmFnZXJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOiAyLFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6IFwiTHVjeSBNaW5vdGFcIixcclxuICAgICAgICAgICAgXCJKb2JUaXRsZVwiOiBudWxsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiVXNlcklkXCI6IDU5LFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6IFwiUm9iIFR5bmFuXCIsXHJcbiAgICAgICAgICAgIFwiSm9iVGl0bGVcIjogXCJCdXNpbmVzcyBBbmFseXN0XCJcclxuICAgICAgICB9XHJcbiAgICBdXHJcbn07XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgVGFza01vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Rhc2tNb2RlbCcpO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdHVybCA6ICdhcGkvdGFza3MnLFxuXHRtb2RlbDogVGFza01vZGVsLFxuXHRpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xuXHR9LFxuXHRjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcblx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0bGlua0NoaWxkcmVuIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHBhcmVudFRhc2sgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50VGFzaykge1xuXHRcdFx0XHRpZiAocGFyZW50VGFzayA9PT0gdGFzaykge1xuXHRcdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0Y29uc29sZS5lcnJvcigndGFzayBoYXMgcGFyZW50IHdpdGggaWQgJyArIHRhc2suZ2V0KCdwYXJlbnRpZCcpICsgJyAtIGJ1dCB0aGVyZSBpcyBubyBzdWNoIHRhc2snKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRfc29ydENoaWxkcmVuIDogZnVuY3Rpb24gKHRhc2ssIHNvcnRJbmRleCkge1xuXHRcdHRhc2suY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKGNoaWxkLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAtMTtcblx0XHR0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKHRhc2ssIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0X3Jlc29ydENoaWxkcmVuIDogZnVuY3Rpb24oZGF0YSwgc3RhcnRJbmRleCwgcGFyZW50SUQpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gc3RhcnRJbmRleDtcblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24odGFza0RhdGEpIHtcblx0XHRcdHZhciB0YXNrID0gdGhpcy5nZXQodGFza0RhdGEuaWQpO1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRJRCkge1xuXHRcdFx0XHR2YXIgbmV3UGFyZW50ID0gdGhpcy5nZXQocGFyZW50SUQpO1xuXHRcdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGFzay5zYXZlKHtcblx0XHRcdFx0c29ydGluZGV4OiArK3NvcnRJbmRleCxcblx0XHRcdFx0cGFyZW50aWQ6IHBhcmVudElEXG5cdFx0XHR9KTtcblx0XHRcdGlmICh0YXNrRGF0YS5jaGlsZHJlbiAmJiB0YXNrRGF0YS5jaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0c29ydEluZGV4ID0gdGhpcy5fcmVzb3J0Q2hpbGRyZW4odGFza0RhdGEuY2hpbGRyZW4sIHNvcnRJbmRleCwgdGFzay5pZCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRyZXNvcnQgOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHRoaXMuX3Jlc29ydENoaWxkcmVuKGRhdGEsIC0xLCAwKTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRzdWJzY3JpYmUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHRcdG1vZGVsLnBhcmVudCA9IHBhcmVudDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0dGhpcy5fY2hlY2tEZXBlbmRlbmNpZXMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4ucmVtb3ZlKHRhc2spO1xuXHRcdFx0XHR0YXNrLnBhcmVudCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fcHJldmVudFNvcnRpbmcpIHtcblx0XHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGNyZWF0ZURlcGVuZGVuY3kgOiBmdW5jdGlvbiAoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpIHtcblx0XHRpZiAodGhpcy5fY2FuQ3JlYXRlRGVwZW5kZW5jZShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkpIHtcblx0XHRcdGFmdGVyTW9kZWwuZGVwZW5kT24oYmVmb3JlTW9kZWwpO1xuXHRcdH1cblx0fSxcblxuXHRfY2FuQ3JlYXRlRGVwZW5kZW5jZSA6IGZ1bmN0aW9uKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKGJlZm9yZU1vZGVsLmhhc1BhcmVudChhZnRlck1vZGVsKSB8fCBhZnRlck1vZGVsLmhhc1BhcmVudChiZWZvcmVNb2RlbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKChiZWZvcmVNb2RlbC5nZXQoJ2RlcGVuZCcpID09PSBhZnRlck1vZGVsLmlkKSB8fFxuXHRcdFx0KGFmdGVyTW9kZWwuZ2V0KCdkZXBlbmQnKSA9PT0gYmVmb3JlTW9kZWwuaWQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRyZW1vdmVEZXBlbmRlbmN5IDogZnVuY3Rpb24oYWZ0ZXJNb2RlbCkge1xuXHRcdGFmdGVyTW9kZWwuY2xlYXJEZXBlbmRlbmNlKCk7XG5cdH0sXG5cdF9jaGVja0RlcGVuZGVuY2llcyA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdkZXBlbmQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmdldCh0YXNrLmdldCgnZGVwZW5kJykpO1xuXHRcdFx0aWYgKCFiZWZvcmVNb2RlbCkge1xuXHRcdFx0XHR0YXNrLnVuc2V0KCdkZXBlbmQnKS5zYXZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLmRlcGVuZE9uKGJlZm9yZU1vZGVsKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRvdXRkZW50IDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciB1bmRlclN1YmxpbmdzID0gW107XG5cdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHR0YXNrLnBhcmVudC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGlmIChjaGlsZC5nZXQoJ3NvcnRpbmRleCcpIDw9IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmRlclN1YmxpbmdzLnB1c2goY2hpbGQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHVuZGVyU3VibGluZ3MuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKGNoaWxkLmdldCgnZGVwZW5kJykgPT09IHRhc2suaWQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5jbGVhckRlcGVuZGVuY2UoKTtcbiAgICAgICAgICAgIH1cblx0XHRcdGNoaWxkLnNhdmUoJ3BhcmVudGlkJywgdGFzay5pZCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHRpZiAodGFzay5wYXJlbnQgJiYgdGFzay5wYXJlbnQucGFyZW50KSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgdGFzay5wYXJlbnQucGFyZW50LmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIDApO1xuXHRcdH1cblx0fSxcblx0aW5kZW50IDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciBwcmV2VGFzaywgaSwgbTtcblx0XHRmb3IgKGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0wOyBpLS0pIHtcblx0XHRcdG0gPSB0aGlzLmF0KGkpO1xuXHRcdFx0aWYgKChtLmdldCgnc29ydGluZGV4JykgPCB0YXNrLmdldCgnc29ydGluZGV4JykpICYmICh0YXNrLnBhcmVudCA9PT0gbS5wYXJlbnQpKSB7XG5cdFx0XHRcdHByZXZUYXNrID0gbTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChwcmV2VGFzaykge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHByZXZUYXNrLmlkKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tDb2xsZWN0aW9uO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9ucy90YXNrQ29sbGVjdGlvbicpO1xudmFyIFNldHRpbmdzID0gcmVxdWlyZSgnLi9tb2RlbHMvU2V0dGluZ01vZGVsJyk7XG5cbnZhciBHYW50dFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL0dhbnR0VmlldycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL3V0aWwnKTtcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xuXG5mdW5jdGlvbiBmZXRjaENvbGxlY3Rpb24oYXBwKSB7XG5cdGFwcC50YXNrcy5mZXRjaCh7XG5cdFx0c3VjY2VzcyA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gYWRkIGVtcHR5IHRhc2sgaWYgbm8gdGFza3MgZnJvbSBzZXJ2ZXJcbiAgICAgICAgICAgIGlmIChhcHAudGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXBwLnRhc2tzLnJlc2V0KFt7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgOiAnTmV3IHRhc2snXG4gICAgICAgICAgICAgICAgfV0pO1xuXG4gICAgICAgICAgICB9XG5cdFx0XHRjb25zb2xlLmxvZygnU3VjY2VzcyBsb2FkaW5nIHRhc2tzLicpO1xuXHRcdFx0YXBwLnRhc2tzLmxpbmtDaGlsZHJlbigpO1xuXHRcdFx0YXBwLnRhc2tzLmNoZWNrU29ydGVkSW5kZXgoKTtcblxuXHRcdFx0YXBwLnNldHRpbmdzID0gbmV3IFNldHRpbmdzKHt9LCB7YXBwIDogYXBwfSk7XG5cdFx0XHRpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluZGV4T2YoJ2xvY2FsaG9zdCcpID09PSAtMSkge1xuXHRcdFx0XHQkLmdldEpTT04oJy9hcGkvR2FudHRDb25maWcvd2JzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5zaXRla2V5LCBmdW5jdGlvbihzdGF0dXNlcykge1xuXHRcdFx0XHRcdGFwcC5zZXR0aW5ncyA9IHN0YXR1c2VzO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcCxcblx0XHRcdFx0Y29sbGVjdGlvbiA6IGFwcC50YXNrc1xuXHRcdFx0fSkucmVuZGVyKCk7XG5cblx0XHRcdCQoJyNsb2FkZXInKS5mYWRlT3V0KCk7XG5cdFx0fSxcblx0XHRlcnJvciA6IGZ1bmN0aW9uKGVycikge1xuXHRcdFx0Y29uc29sZS5lcnJvcignZXJyb3IgbG9hZGluZycpO1xuXHRcdFx0Y29uc29sZS5lcnJvcihlcnIpO1xuXHRcdH0sXG5cdFx0cGFyc2U6IHRydWUsXG5cdFx0cmVzZXQgOiB0cnVlXG5cdH0pO1xufVxuXG5cbiQoZnVuY3Rpb24gKCkge1xuXHR2YXIgYXBwID0ge307XG5cdGFwcC50YXNrcyA9IG5ldyBUYXNrQ29sbGVjdGlvbigpO1xuXG5cdC8vIGRldGVjdCBBUEkgcGFyYW1zIGZyb20gZ2V0LCBlLmcuID9wcm9qZWN0PTE0MyZwcm9maWxlPTE3JnNpdGVrZXk9MmIwMGRhNDZiNTdjMDM5NVxuXHR2YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblx0aWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlICYmIHBhcmFtcy5zaXRla2V5KSB7XG5cdFx0YXBwLnRhc2tzLnVybCA9ICdhcGkvdGFza3MvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGUgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcblx0fVxuXHRmZXRjaENvbGxlY3Rpb24oYXBwKTtcbn0pOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciB0ZXN0U3RhdHVzZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9kYXRhL3N0YXR1c2VzJyk7XHJcblxyXG4vL3ZhciBoZnVuYyA9IGZ1bmN0aW9uKHBvcywgZXZ0KSB7XHJcbi8vXHR2YXIgZHJhZ0ludGVydmFsID0gYXBwLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInLCAnZHJhZ0ludGVydmFsJyk7XHJcbi8vXHR2YXIgbiA9IE1hdGgucm91bmQoKHBvcy54IC0gZXZ0LmluaXBvcy54KSAvIGRyYWdJbnRlcnZhbCk7XHJcbi8vXHRyZXR1cm4ge1xyXG4vL1x0XHR4OiBldnQuaW5pcG9zLnggKyBuICogZHJhZ0ludGVydmFsLFxyXG4vL1x0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XHJcbi8vXHR9O1xyXG4vL307XHJcblxyXG52YXIgU2V0dGluZ01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHRkZWZhdWx0czoge1xyXG5cdFx0aW50ZXJ2YWw6ICdmaXgnLFxyXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxyXG5cdFx0ZHBpOiAxXHJcblx0fSxcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycywgcGFyYW1zKSB7XHJcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XHJcblx0XHR0aGlzLnN0YXR1c2VzID0gdGVzdFN0YXR1c2VzO1xyXG5cdFx0dGhpcy5zYXR0ciA9IHtcclxuXHRcdFx0aERhdGE6IHt9LFxyXG5cdFx0XHRkcmFnSW50ZXJ2YWw6IDEsXHJcblx0XHRcdGRheXNXaWR0aDogNSxcclxuXHRcdFx0Y2VsbFdpZHRoOiAzNSxcclxuXHRcdFx0bWluRGF0ZTogbmV3IERhdGUoMjAyMCwxLDEpLFxyXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXHJcblx0XHRcdGJvdW5kYXJ5TWluOiBuZXcgRGF0ZSgwLDAsMCksXHJcblx0XHRcdGJvdW5kYXJ5TWF4OiBuZXcgRGF0ZSgyMDIwLDEsMSksXHJcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXHJcblx0XHRcdG1wYzogMVxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLnNkaXNwbGF5ID0ge1xyXG5cdFx0XHRzY3JlZW5XaWR0aDogICQoJyNnYW50dC1jb250YWluZXInKS5pbm5lcldpZHRoKCkgKyA3ODYsXHJcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxyXG5cdFx0XHR0YWJsZVdpZHRoOiA3MTBcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5jb2xsZWN0aW9uID0gdGhpcy5hcHAudGFza3M7XHJcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xyXG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XHJcblx0fSxcclxuXHRnZXRTZXR0aW5nOiBmdW5jdGlvbihmcm9tLCBhdHRyKXtcclxuXHRcdGlmKGF0dHIpe1xyXG5cdFx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXVthdHRyXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xyXG5cdH0sXHJcblx0ZmluZFN0YXR1c0lkIDogZnVuY3Rpb24oc3RhdHVzKSB7XHJcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gc3RhdHVzLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmRTdGF0dXNGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRTdGF0dXNJZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHRmaW5kSGVhbHRoSWQgOiBmdW5jdGlvbihoZWFsdGgpIHtcclxuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBoZWFsdGgudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZEhlYWx0aEZvcklkIDogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdEhlYWx0aElkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5jRGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cdGZpbmRXT0lkIDogZnVuY3Rpb24od28pIHtcclxuXHRcdGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuV09OdW1iZXIudG9Mb3dlckNhc2UoKSA9PT0gd28udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuSUQ7XHJcbiAgICAgICAgICAgIH1cclxuXHRcdH1cclxuXHR9LFxyXG5cdGNhbGNtaW5tYXg6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG1pbkRhdGUgPSBuZXcgRGF0ZSgpLCBtYXhEYXRlID0gbWluRGF0ZS5jbG9uZSgpLmFkZFllYXJzKDEpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdzdGFydCcpLmNvbXBhcmVUbyhtaW5EYXRlKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRtaW5EYXRlPW1vZGVsLmdldCgnc3RhcnQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdlbmQnKS5jb21wYXJlVG8obWF4RGF0ZSkgPT09IDEpIHtcclxuXHRcdFx0XHRtYXhEYXRlPW1vZGVsLmdldCgnZW5kJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5zYXR0ci5taW5EYXRlID0gbWluRGF0ZTtcclxuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XHJcblx0XHRcclxuXHR9LFxyXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGVuZCxzYXR0cj10aGlzLnNhdHRyLGRhdHRyPXRoaXMuc2Rpc3BsYXksZHVyYXRpb24sc2l6ZSxjZWxsV2lkdGgsZHBpLHJldGZ1bmMsc3RhcnQsbGFzdCxpPTAsaj0wLGlMZW49MCxuZXh0PW51bGw7XHJcblx0XHRcclxuXHRcdHZhciBpbnRlcnZhbCA9IHRoaXMuZ2V0KCdpbnRlcnZhbCcpO1xyXG5cclxuXHRcdGlmIChpbnRlcnZhbCA9PT0gJ2RhaWx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMSwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDEyO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cygxKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0XHJcblx0XHR9IGVsc2UgaWYoaW50ZXJ2YWwgPT09ICd3ZWVrbHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCA3LCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogNyk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDcpLm1vdmVUb0RheU9mV2VlaygxLCAtMSk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCAqIDc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyg3KTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMjtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSA3ICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMSk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4ubW92ZVRvRmlyc3REYXlPZlF1YXJ0ZXIoKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSAzMCAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMztcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDMpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcclxuXHRcdFx0Y2VsbFdpZHRoID0gMzA7XHJcblx0XHRcdGR1cmF0aW9uID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLCBzYXR0ci5tYXhEYXRlKTtcclxuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzaXplIC8gZHVyYXRpb247XHJcblx0XHRcdGRwaSA9IE1hdGgucm91bmQoY2VsbFdpZHRoIC8gc2F0dHIuZGF5c1dpZHRoKTtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBkcGkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIgKiBkcGkpO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIgKiBkcGkpO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcclxuXHRcdFx0ZHBpID0gdGhpcy5nZXQoJ2RwaScpO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAoMSArIE1hdGgubG9nKGRwaSkpICogMTI7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMjAgKiBkcGkpO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIGRwaSk7XHJcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGhEYXRhID0ge1xyXG5cdFx0XHQnMSc6IFtdLFxyXG5cdFx0XHQnMic6IFtdLFxyXG5cdFx0XHQnMyc6IFtdXHJcblx0XHR9O1xyXG5cdFx0dmFyIGhkYXRhMyA9IFtdO1xyXG5cdFx0XHJcblx0XHRzdGFydCA9IHNhdHRyLmJvdW5kYXJ5TWluO1xyXG5cdFx0XHJcblx0XHRsYXN0ID0gc3RhcnQ7XHJcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5JyB8fCBpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcclxuXHRcdFx0dmFyIGR1cmZ1bmM7XHJcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xyXG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5Nb250aChkYXRlLmdldEZ1bGxZZWFyKCksZGF0ZS5nZXRNb250aCgpKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdH1cclxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRoZGF0YTMucHVzaCh7XHJcblx0XHRcdFx0XHRcdGR1cmF0aW9uOiBkdXJmdW5jKGxhc3QpLFxyXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcclxuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xyXG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRoZGF0YTMucHVzaCh7XHJcblx0XHRcdFx0XHRkdXJhdGlvbjogaW50ZXJ2YWxkYXlzLFxyXG5cdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcclxuXHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0c2F0dHIuYm91bmRhcnlNYXggPSBlbmQgPSBsYXN0O1xyXG5cdFx0aERhdGFbJzMnXSA9IGhkYXRhMztcclxuXHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IGRhdGUgdG8gZW5kIG9mIHllYXJcclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xyXG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXHJcblx0XHR9KTtcclxuXHRcdGZvcihpID0gc3RhcnQuZ2V0RnVsbFllYXIoKSArIDEsIGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTsgaSA8IGlMZW47IGkrKyl7XHJcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxyXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRpbnRlciA9IERhdGUuZGF5c2RpZmYobmV3IERhdGUoZW5kLmdldEZ1bGxZZWFyKCksIDAsIDEpLCBlbmQpO1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBlbmQuZ2V0RnVsbFllYXIoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxyXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoc3RhcnQsIHN0YXJ0LmNsb25lKCkubW92ZVRvTGFzdERheU9mTW9udGgoKSksXHJcblx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCAnbScpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aiA9IHN0YXJ0LmdldE1vbnRoKCkgKyAxO1xyXG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XHJcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XHJcblx0XHR2YXIgZW5kbW9udGggPSBlbmQuZ2V0TW9udGgoKTtcclxuXHJcblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XHJcblx0XHRcdHdoaWxlKGogPCAxMikge1xyXG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxyXG5cdFx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGosICdtJylcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRqICs9IDE7XHJcblx0XHRcdH1cclxuXHRcdFx0aSArPSAxO1xyXG5cdFx0XHRqID0gMDtcclxuXHRcdH1cclxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGggJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcclxuXHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihlbmQuY2xvbmUoKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKSwgZW5kKSxcclxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xyXG5cdH0sXHJcblx0Y2FsY3VsYXRlSW50ZXJ2YWxzOiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xyXG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGVzKCk7XHJcblx0fSxcclxuXHRjb25EVG9UOihmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGRUb1RleHQ9e1xyXG5cdFx0XHQnc3RhcnQnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnZHVyYXRpb24nOmZ1bmN0aW9uKHZhbHVlLG1vZGVsKXtcclxuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdzdGF0dXMnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xyXG5cdFx0XHRcdFx0JzExMCc6J2NvbXBsZXRlJyxcclxuXHRcdFx0XHRcdCcxMDknOidvcGVuJyxcclxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0cmV0dXJuIHN0YXR1c2VzW3ZhbHVlXTtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcclxuXHRcdFx0cmV0dXJuIGRUb1RleHRbZmllbGRdP2RUb1RleHRbZmllbGRdKHZhbHVlLG1vZGVsKTp2YWx1ZTtcclxuXHRcdH07XHJcblx0fSgpKVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuICAgIGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBNQUlOIFBBUkFNU1xyXG4gICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGNvbXBsZXRlOiAwLCAgLy8gMCUgLSAxMDAlIHBlcmNlbnRzXHJcbiAgICAgICAgc29ydGluZGV4OiAwLCAgIC8vIHBsYWNlIG9uIHNpZGUgbWVudSwgc3RhcnRzIGZyb20gMFxyXG4gICAgICAgIGRlcGVuZDogdW5kZWZpbmVkLCAgLy8gaWQgb2YgdGFza1xyXG4gICAgICAgIHN0YXR1czogJzExMCcsICAgICAgLy8gMTEwIC0gY29tcGxldGUsIDEwOSAgLSBvcGVuLCAxMDggLSByZWFkeVxyXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZDogbmV3IERhdGUoKSxcclxuICAgICAgICBwYXJlbnRpZDogMCxcclxuXHJcbiAgICAgICAgY29sb3I6ICcjMDA5MGQzJywgICAvLyB1c2VyIGNvbG9yLCBub3QgdXNlZCBmb3Igbm93XHJcblxyXG4gICAgICAgIC8vIHNvbWUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgcmVzb3VyY2VzIDogW10sICAgICAgICAgLy9saXN0IG9mIGlkXHJcbiAgICAgICAgaGVhbHRoOiAyMSxcclxuICAgICAgICByZXBvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICB3bzogMiwgICAgICAgICAgICAgICAgICAvL1NlbGVjdCBMaXN0IGluIHByb3BlcnRpZXMgbW9kYWwgICAoY29uZmlnZGF0YSlcclxuICAgICAgICBtaWxlc3RvbmU6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGRlbGl2ZXJhYmxlOiBmYWxzZSwgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZmluYW5jaWFsOiBmYWxzZSwgICAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICB0aW1lc2hlZXRzOiBmYWxzZSwgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGFjdHRpbWVzaGVldHM6IGZhbHNlLCAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcblxyXG4gICAgICAgIC8vIHNlcnZlciBzcGVjaWZpYyBwYXJhbXNcclxuICAgICAgICAvLyBkb24ndCB1c2UgdGhlbSBvbiBjbGllbnQgc2lkZVxyXG4gICAgICAgIFByb2plY3RSZWYgOiBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICBXQlNfSUQgOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleSxcclxuXHJcblxyXG4gICAgICAgIC8vIHBhcmFtcyBmb3IgYXBwbGljYXRpb24gdmlld3NcclxuICAgICAgICAvLyBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIEpTT05cclxuICAgICAgICBoaWRkZW4gOiBmYWxzZSxcclxuICAgICAgICBjb2xsYXBzZWQgOiBmYWxzZSxcclxuICAgICAgICBoaWdodGxpZ2h0IDogJydcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBTdWJUYXNrcygpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ3BhcmVudGlkJykgPT09IHRoaXMuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkJywgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQucGFyZW50ID0gdGhpcztcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6c29ydGluZGV4JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUgY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hlY2tUaW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXQoJ2NvbGxhcHNlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGVja2luZyBuZXN0ZWQgc3RhdGVcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlJywgdGhpcy5fY2hlY2tOZXN0ZWQpO1xyXG5cclxuICAgICAgICAvLyB0aW1lIGNoZWNraW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl9jaGVja0NvbXBsZXRlKTtcclxuICAgIH0sXHJcbiAgICBpc05lc3RlZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgfSxcclxuICAgIHNob3cgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgZmFsc2UpO1xyXG4gICAgfSxcclxuICAgIGhpZGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgdHJ1ZSk7XHJcbiAgICB9LFxyXG4gICAgZGVwZW5kT24gOiBmdW5jdGlvbihiZWZvcmVNb2RlbCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdkZXBlbmQnLCBiZWZvcmVNb2RlbC5pZCk7XHJcbiAgICAgICAgdGhpcy5iZWZvcmVNb2RlbCA9IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMubW92ZVRvU3RhcnQoYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuQmVmb3JlTW9kZWwoKTtcclxuICAgIH0sXHJcbiAgICBjbGVhckRlcGVuZGVuY2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcodGhpcy5iZWZvcmVNb2RlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudW5zZXQoJ2RlcGVuZCcpLnNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5iZWZvcmVNb2RlbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGFzUGFyZW50IDogZnVuY3Rpb24ocGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XHJcbiAgICAgICAgd2hpbGUodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IHBhcmVudEZvckNoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfbGlzdGVuQmVmb3JlTW9kZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJEZXBlbmRlbmNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQudW5kZXJNb3ZpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXQoJ3N0YXJ0JykgPCB0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvU3RhcnQodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jaGVja05lc3RlZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcignbmVzdGVkU3RhdGVDaGFuZ2UnLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBwYXJzZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICB2YXIgc3RhcnQsIGVuZDtcclxuICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLnN0YXJ0KSl7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2Uuc3RhcnQpLCdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5zdGFydCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLmVuZCkpe1xyXG4gICAgICAgICAgICBlbmQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5lbmQpLCdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbmQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSBzdGFydCA8IGVuZCA/IHN0YXJ0IDogZW5kO1xyXG4gICAgICAgIHJlc3BvbnNlLmVuZCA9IHN0YXJ0IDwgZW5kID8gZW5kIDogc3RhcnQ7XHJcblxyXG4gICAgICAgIHJlc3BvbnNlLnBhcmVudGlkID0gcGFyc2VJbnQocmVzcG9uc2UucGFyZW50aWQgfHwgJzAnLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBudWxsIHBhcmFtc1xyXG4gICAgICAgIF8uZWFjaChyZXNwb25zZSwgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlc3BvbnNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrVGltZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnc3RhcnQnKTtcclxuICAgICAgICB2YXIgZW5kVGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdlbmQnKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhcnRUaW1lID0gY2hpbGQuZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcclxuICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUgPCBzdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGNoaWxkU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZSA+IGVuZFRpbWUpe1xyXG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IGNoaWxkRW5kVGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0Jywgc3RhcnRUaW1lKTtcclxuICAgICAgICB0aGlzLnNldCgnZW5kJywgZW5kVGltZSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrQ29tcGxldGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29tcGxldGUgPSAwO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGUgKz0gY2hpbGQuZ2V0KCdjb21wbGV0ZScpIC8gbGVuZ3RoO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXQoJ2NvbXBsZXRlJywgTWF0aC5yb3VuZChjb21wbGV0ZSkpO1xyXG4gICAgfSxcclxuICAgIG1vdmVUb1N0YXJ0IDogZnVuY3Rpb24obmV3U3RhcnQpIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5ldyBzdGFydCBpcyB0aGUgc2FtZSBhcyBjdXJyZW50XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0LnRvRGF0ZVN0cmluZygpID09PSB0aGlzLmdldCgnc3RhcnQnKS50b0RhdGVTdHJpbmcoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgb2Zmc2V0XHJcbi8vICAgICAgICB2YXIgZGF5c0RpZmYgPSBNYXRoLmZsb29yKChuZXdTdGFydC50aW1lKCkgLSB0aGlzLmdldCgnc3RhcnQnKS50aW1lKCkpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNClcclxuICAgICAgICB2YXIgZGF5c0RpZmYgPSBEYXRlLmRheXNkaWZmKG5ld1N0YXJ0LCB0aGlzLmdldCgnc3RhcnQnKSkgLSAxO1xyXG4gICAgICAgIGlmIChuZXdTdGFydCA8IHRoaXMuZ2V0KCdzdGFydCcpKSB7XHJcbiAgICAgICAgICAgIGRheXNEaWZmICo9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hhbmdlIGRhdGVzXHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydCA6IG5ld1N0YXJ0LmNsb25lKCksXHJcbiAgICAgICAgICAgIGVuZCA6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5c0RpZmYpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZXMgZGF0ZXMgaW4gYWxsIGNoaWxkcmVuXHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXNEaWZmKTtcclxuICAgICAgICB0aGlzLnVuZGVyTW92aW5nID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDaGlsZHJlbiA6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQubW92ZShkYXlzKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlV2l0aENoaWxkcmVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGFzay5zYXZlV2l0aENoaWxkcmVuKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZSA6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMoZGF5cyksXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5nZXQoJ2VuZCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tNb2RlbDtcclxuIiwidmFyIG1vbnRoc0NvZGU9WydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcblxubW9kdWxlLmV4cG9ydHMuY29ycmVjdGRhdGUgPSBmdW5jdGlvbihzdHIpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiBzdHI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRkYXRhID0gZnVuY3Rpb24odmFsLCB0eXBlKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZiAodHlwZSA9PT0gJ20nKSB7XG5cdFx0cmV0dXJuIG1vbnRoc0NvZGVbdmFsXTtcblx0fVxuXHRyZXR1cm4gdmFsO1xufTtcblxubW9kdWxlLmV4cG9ydHMuaGZ1bmMgPSBmdW5jdGlvbihwb3MpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiB7XG5cdFx0eDogcG9zLngsXG5cdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHR9O1xufTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikge1xuXHR2YXIgcGFyYW1zID0ge307XG5cdHZhciBwcm1hcnIgPSBwcm1zdHIuc3BsaXQoJyYnKTtcblx0dmFyIGksIHRtcGFycjtcblx0Zm9yIChpID0gMDsgaSA8IHBybWFyci5sZW5ndGg7IGkrKykge1xuXHRcdHRtcGFyciA9IHBybWFycltpXS5zcGxpdCgnPScpO1xuXHRcdHBhcmFtc1t0bXBhcnJbMF1dID0gdG1wYXJyWzFdO1xuXHR9XG5cdHJldHVybiBwYXJhbXM7XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldFVSTFBhcmFtcyA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHR2YXIgcHJtc3RyID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSk7XG5cdHJldHVybiBwcm1zdHIgIT09IG51bGwgJiYgcHJtc3RyICE9PSAnJyA/IHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIDoge307XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtccnZhciBDb250ZXh0TWVudVZpZXcgPSByZXF1aXJlKCcuL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3Jyk7XHJ2YXIgU2lkZVBhbmVsID0gcmVxdWlyZSgnLi9zaWRlQmFyL1NpZGVQYW5lbCcpO1xyXHJccnZhciBHYW50dENoYXJ0VmlldyA9IHJlcXVpcmUoJy4vY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcnKTtccnZhciBUb3BNZW51VmlldyA9IHJlcXVpcmUoJy4vVG9wTWVudVZpZXcvVG9wTWVudVZpZXcnKTtcclxyXHJ2YXIgR2FudHRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyICAgIGVsOiAnLkdhbnR0JyxcciAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcciAgICAgICAgdGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyXHIgICAgICAgIG5ldyBDb250ZXh0TWVudVZpZXcoe1xyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLmFwcC5zZXR0aW5nc1xyICAgICAgICB9KS5yZW5kZXIoKTtcclxyICAgICAgICAvLyBuZXcgdGFzayBidXR0b25cciAgICAgICAgJCgnLm5ldy10YXNrJykuY2xpY2soZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB2YXIgbGFzdFRhc2sgPSBwYXJhbXMuY29sbGVjdGlvbi5sYXN0KCk7XHIgICAgICAgICAgICB2YXIgbGFzdEluZGV4ID0gLTE7XHIgICAgICAgICAgICBpZiAobGFzdFRhc2spIHtcciAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSBsYXN0VGFzay5nZXQoJ3NvcnRpbmRleCcpO1xyICAgICAgICAgICAgfVxyICAgICAgICAgICAgcGFyYW1zLmNvbGxlY3Rpb24uYWRkKHtcciAgICAgICAgICAgICAgICBuYW1lIDogJ05ldyB0YXNrJyxcciAgICAgICAgICAgICAgICBzb3J0aW5kZXggOiBsYXN0SW5kZXggKyAxXHIgICAgICAgICAgICB9KTtcciAgICAgICAgfSk7XHJcciAgICAgICAgLy8gc2V0IHNpZGUgdGFza3MgcGFuZWwgaGVpZ2h0XHIgICAgICAgIHZhciAkc2lkZVBhbmVsID0gJCgnLm1lbnUtY29udGFpbmVyJyk7XHIgICAgICAgICRzaWRlUGFuZWwuY3NzKHtcciAgICAgICAgICAgICdtaW4taGVpZ2h0JyA6IHdpbmRvdy5pbm5lckhlaWdodCAtICRzaWRlUGFuZWwub2Zmc2V0KCkudG9wXHIgICAgICAgIH0pO1xyXHJcclxyICAgICAgICBuZXcgVG9wTWVudVZpZXcoe1xyICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLmFwcC5zZXR0aW5ncyxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEdhbnR0Q2hhcnRWaWV3KHtcciAgICAgICAgICAgIGFwcCA6IHRoaXMuYXBwLFxyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLmFwcC5zZXR0aW5nc1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnJlbmRlcigpO1xyICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Ll91cGRhdGVTdGFnZUF0dHJzKCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNTAwKTtcclxyXHIgICAgICAgIHZhciB0YXNrc0NvbnRhaW5lciA9ICQoJy50YXNrcycpLmdldCgwKTtcciAgICAgICAgUmVhY3QucmVuZGVyKFxyICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgICAgICB9KSxcciAgICAgICAgICAgIHRhc2tzQ29udGFpbmVyXHIgICAgICAgICk7XHJcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0JywgZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICBjb25zb2xlLmxvZygncmVjb21waWxlJyk7XHIgICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRhc2tzQ29udGFpbmVyKTtcciAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgICAgICAgICAgfSksXHIgICAgICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgICAgICk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgZXZlbnRzOiB7XHIgICAgICAgICdjbGljayAjdEhhbmRsZSc6ICdleHBhbmQnXHIgICAgfSxcciAgICBjYWxjdWxhdGVEdXJhdGlvbjogZnVuY3Rpb24oKXtcclxyICAgICAgICAvLyBDYWxjdWxhdGluZyB0aGUgZHVyYXRpb24gZnJvbSBzdGFydCBhbmQgZW5kIGRhdGVcciAgICAgICAgdmFyIHN0YXJ0ZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJzdGFydFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyICAgICAgICBpZihzdGFydGRhdGUgIT09IFwiXCIgJiYgZW5kZGF0ZSAhPT0gXCJcIil7XHIgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcciAgICAgICAgfWVsc2V7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigwKSk7XHIgICAgICAgIH1cciAgICB9LFxyICAgIGV4cGFuZDogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciBidXR0b24gPSAkKGV2dC50YXJnZXQpO1xyICAgICAgICBpZiAoYnV0dG9uLmhhc0NsYXNzKCdjb250cmFjdCcpKSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgIH1cciAgICAgICAgZWxzZSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgIH1cciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNjAwKTtcciAgICAgICAgYnV0dG9uLnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgIH0sXHIgICAgX21vdmVDYW52YXNWaWV3IDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHZhciBzaWRlQmFyV2lkdGggPSAkKCcubWVudS1jb250YWluZXInKS53aWR0aCgpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuc2V0TGVmdFBhZGRpbmcoc2lkZUJhcldpZHRoKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBHYW50dFZpZXc7XHIiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgTW9kYWxUYXNrRWRpdENvbXBvbmVudCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNlZGl0VGFzaycsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLiRlbC5maW5kKCcudWkuY2hlY2tib3gnKS5jaGVja2JveCgpO1xyXG4gICAgICAgIC8vIHNldHVwIHZhbHVlcyBmb3Igc2VsZWN0b3JzXHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZVNlbGVjdHMoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnRhYnVsYXIubWVudSAuaXRlbScpLnRhYigpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGFydFwiXSwgW25hbWU9XCJlbmRcIl0nKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2ZpbGxEYXRhKCk7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRlbC5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG5cclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZVNlbGVjdHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhdHVzU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGF0dXNcIl0nKTtcclxuICAgICAgICBzdGF0dXNTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgaGVhbHRoU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJoZWFsdGhcIl0nKTtcclxuICAgICAgICBoZWFsdGhTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgd29ya09yZGVyU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJ3b1wiXScpO1xyXG4gICAgICAgIHdvcmtPcmRlclNlbGVjdC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMud29kYXRhWzBdLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICQoJzxvcHRpb24gdmFsdWU9XCInICsgZGF0YS5JRCArICdcIj4nICsgZGF0YS5XT051bWJlciArICc8L29wdGlvbj4nKS5hcHBlbmRUbyh3b3JrT3JkZXJTZWxlY3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGF0dXMnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2hlYWx0aCcgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aEZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXQoMCkudmFsdWUgPSAodmFsLnRvU3RyaW5nKCdkZC9NTS95eXl5JykpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0ZXBpY2tlciggXCJyZWZyZXNoXCIgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQudmFsKHZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IGlucHV0LnZhbCgpLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBuZXcgRGF0ZSh2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0LnByb3AoJ3R5cGUnKSA9PT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC5wcm9wKCdjaGVja2VkJykpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC52YWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLm1vZGVsLnNhdmUoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsVGFza0VkaXRDb21wb25lbnQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBSZXNvdXJjZUVkaXRvclZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICB2YXIgc3RhZ2VQb3MgPSAkKCcjZ2FudHQtY29udGFpbmVyJykub2Zmc2V0KCk7XHJcbiAgICAgICAgdmFyIGZha2VFbCA9ICQoJzxkaXY+JykuYXBwZW5kVG8oJ2JvZHknKTtcclxuICAgICAgICBmYWtlRWwuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICB0b3AgOiBwb3MueSArIHN0YWdlUG9zLnRvcCArICdweCcsXHJcbiAgICAgICAgICAgIGxlZnQgOiBwb3MueCArIHN0YWdlUG9zLmxlZnQgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucG9wdXAgPSAkKCcuY3VzdG9tLnBvcHVwJyk7XHJcbiAgICAgICAgZmFrZUVsLnBvcHVwKHtcclxuICAgICAgICAgICAgcG9wdXAgOiB0aGlzLnBvcHVwLFxyXG4gICAgICAgICAgICBvbiA6ICdjbGljaycsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2JvdHRvbSBsZWZ0JyxcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLnBvcHVwKCdzaG93Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FkZFJlc291cmNlcygpO1xyXG4gICAgICAgIHRoaXMuX2Z1bGxEYXRhKCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFJlc291cmNlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucG9wdXAuZW1wdHkoKTtcclxuICAgICAgICB2YXIgaHRtbFN0cmluZyA9ICcnO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMucmVzb3VyY2VkYXRhLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgaHRtbFN0cmluZyArPSAnPGRpdiBjbGFzcz1cInVpIGNoZWNrYm94XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAgbmFtZT1cIicgKyByZXNvdXJjZS5Vc2VySWQgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxsYWJlbD4nICsgcmVzb3VyY2UuVXNlcm5hbWUgKyAnPC9sYWJlbD4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucG9wdXAuYXBwZW5kKGh0bWxTdHJpbmcpO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgIH0sXHJcbiAgICBfZnVsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcG9wdXAgPSB0aGlzLnBvcHVwO1xyXG4gICAgICAgIHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIHBvcHVwLmZpbmQoJ1tuYW1lPVwiJyArIHJlc291cmNlICsgJ1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCdpbnB1dCcpLmVhY2goZnVuY3Rpb24oaSwgaW5wdXQpIHtcclxuICAgICAgICAgICAgdmFyICRpbnB1dCA9ICQoaW5wdXQpO1xyXG4gICAgICAgICAgICBpZiAoJGlucHV0LnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzLnB1c2goJGlucHV0LmF0dHIoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2F2ZSgncmVzb3VyY2VzJywgcmVzb3VyY2VzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc291cmNlRWRpdG9yVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRmlsdGVyVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNmaWx0ZXItbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NoYW5nZSAjaGlnaHRsaWdodHMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGhpZ2h0bGlnaHRUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2h0bGlnaHRUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHRoaXMuY29sb3JzW2UudGFyZ2V0LnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2hhbmdlICNmaWx0ZXJzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBjcml0ZXJpYSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoY3JpdGVyaWEgPT09ICdyZXNldCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3dUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd1Rhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2hvdyBhbGwgcGFyZW50c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGFzay5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb2xvcnMgOiB7XHJcbiAgICAgICAgJ3N0YXR1cy1iYWNrbG9nJyA6ICcjRDJEMkQ5JyxcclxuICAgICAgICAnc3RhdHVzLXJlYWR5JyA6ICcjQjJEMUYwJyxcclxuICAgICAgICAnc3RhdHVzLWluIHByb2dyZXNzJyA6ICcjNjZBM0UwJyxcclxuICAgICAgICAnc3RhdHVzLWNvbXBsZXRlJyA6ICcjOTlDMjk5JyxcclxuICAgICAgICAnbGF0ZScgOiAnI0ZGQjJCMicsXHJcbiAgICAgICAgJ2R1ZScgOiAnICNGRkMyOTknLFxyXG4gICAgICAgICdtaWxlc3RvbmUnIDogJyNENkMyRkYnLFxyXG4gICAgICAgICdkZWxpdmVyYWJsZScgOiAnI0UwRDFDMicsXHJcbiAgICAgICAgJ2ZpbmFuY2lhbCcgOiAnI0YwRTBCMicsXHJcbiAgICAgICAgJ3RpbWVzaGVldHMnIDogJyNDMkMyQjInLFxyXG4gICAgICAgICdyZXBvcnRhYmxlJyA6ICcgI0UwQzJDMicsXHJcbiAgICAgICAgJ2hlYWx0aC1yZWQnIDogJ3JlZCcsXHJcbiAgICAgICAgJ2hlYWx0aC1hbWJlcicgOiAnI0ZGQkYwMCcsXHJcbiAgICAgICAgJ2hlYWx0aC1ncmVlbicgOiAnZ3JlZW4nXHJcbiAgICB9LFxyXG4gICAgX2dldE1vZGVsc0ZvckNyaXRlcmlhIDogZnVuY3Rpb24oY3JldGVyaWEpIHtcclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdyZXNldHMnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ3N0YXR1cycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICh0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChzdGF0dXMpIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ3N0YXR1cycpLnRvU3RyaW5nKCkgPT09IGlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnbGF0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdkdWUnKSB7XHJcbiAgICAgICAgICAgIHZhciBsYXN0RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIGxhc3REYXRlLmFkZFdlZWtzKDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpID4gbmV3IERhdGUoKSAmJiB0YXNrLmdldCgnZW5kJykgPCBsYXN0RGF0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChbJ21pbGVzdG9uZScsICdkZWxpdmVyYWJsZScsICdmaW5hbmNpYWwnLCAndGltZXNoZWV0cycsICdyZXBvcnRhYmxlJ10uaW5kZXhPZihjcmV0ZXJpYSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldChjcmV0ZXJpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignaGVhbHRoJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGggPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aElkID0gKHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGhlYWx0aCkgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnaGVhbHRoJykudG9TdHJpbmcoKSA9PT0gaGVhbHRoSWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBHcm91cGluZ01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2dyb3VwaW5nLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjdG9wLWV4cGFuZC1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjbGljayAjdG9wLWNvbGxhcHNlLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JvdXBpbmdNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjcHJvamVjdC1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3VwbG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhbGVydCgnbm90IGltcGxlbWVudGVkJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI2Rvd25sb2FkLXByb2plY3QnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdub3QgaW1wbGVtZW50ZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNU1Byb2plY3RNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUmVwb3J0c01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3JlcG9ydHMtbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICNwcmludCcgOiAnZ2VuZXJhdGVQREYnLFxyXG4gICAgICAgICdjbGljayAjc2hvd1ZpZGVvJyA6ICdzaG93SGVscCdcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVBERiA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSxcclxuICAgIHNob3dIZWxwIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI3Nob3dWaWRlb01vZGFsJykubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydHNNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBab29tTWVudVZpZXcgPSByZXF1aXJlKCcuL1pvb21NZW51VmlldycpO1xyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IHJlcXVpcmUoJy4vR3JvdXBpbmdNZW51VmlldycpO1xyXG52YXIgRmlsdGVyTWVudVZpZXcgPSByZXF1aXJlKCcuL0ZpbHRlck1lbnVWaWV3Jyk7XHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IHJlcXVpcmUoJy4vTVNQcm9qZWN0TWVudVZpZXcnKTtcclxudmFyIFJlcG9ydHNNZW51VmlldyA9IHJlcXVpcmUoJy4vUmVwb3J0c01lbnVWaWV3Jyk7XHJcblxyXG52YXIgVG9wTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgbmV3IFpvb21NZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBHcm91cGluZ01lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IEZpbHRlck1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IE1TUHJvamVjdE1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IFJlcG9ydHNNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVG9wTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFpvb21NZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyN6b29tLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAuYWN0aW9uJzogJ29uSW50ZXJ2YWxCdXR0b25DbGlja2VkJ1xyXG4gICAgfSxcclxuICAgIG9uSW50ZXJ2YWxCdXR0b25DbGlja2VkIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIHZhciBhY3Rpb24gPSBidXR0b24uZGF0YSgnYWN0aW9uJyk7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gYWN0aW9uLnNwbGl0KCctJylbMV07XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gWm9vbU1lbnVWaWV3O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2JvcmRlcldpZHRoIDogMyxcclxuICAgIF9jb2xvciA6ICcjRTZGMEZGJyxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBfLmV4dGVuZChCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5ldmVudHMoKSwge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmxlZnRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5yaWdodEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG5cclxuICAgICAgICAgICAgJ2RyYWdlbmQgLmxlZnRCb3JkZXInIDogJ3JlbmRlcicsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5yaWdodEJvcmRlcicgOiAncmVuZGVyJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLmxlZnRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5sZWZ0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLnJpZ2h0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAucmlnaHRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5taW4obG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWF4KGxvY2FsWCwgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9yZXNpemVQb2ludGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZXctcmVzaXplJztcclxuICAgIH0sXHJcbiAgICBfY2hhbmdlU2l6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZWZ0WCA9IHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCk7XHJcbiAgICAgICAgdmFyIHJpZ2h0WCA9IHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpICsgdGhpcy5fYm9yZGVyV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LndpZHRoKHJpZ2h0WCAtIGxlZnRYKTtcclxuICAgICAgICByZWN0LngobGVmdFgpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC54KGxlZnRYKTtcclxuICAgICAgICBjb21wbGV0ZVJlY3Qud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuXHJcbiAgICAgICAgLy8gbW92ZSB0b29sIHBvc2l0aW9uXHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wueChyaWdodFgpO1xyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKVswXTtcclxuICAgICAgICByZXNvdXJjZXMueChyaWdodFggKyB0aGlzLl90b29sYmFyT2Zmc2V0KTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEgLSB0aGlzLl9ib3JkZXJXaWR0aCk7XHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbG9uZVRhc2tWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFJlc291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi4vUmVzb3VyY2VzRWRpdG9yJyk7XHJcblxyXG52YXIgbGlua0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbmxpbmtJbWFnZS5zcmMgPSAnL2Nzcy9pbWFnZXMvbGluay5wbmcnO1xyXG5cclxudmFyIHVzZXJJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG51c2VySW1hZ2Uuc3JjID0gJy9jc3MvaW1hZ2VzL3VzZXIucG5nJztcclxuXHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gQmFja2JvbmUuS29udmFWaWV3LmV4dGVuZCh7XHJcbiAgICBfZnVsbEhlaWdodCA6IDIxLFxyXG4gICAgX3RvcFBhZGRpbmcgOiAzLFxyXG4gICAgX2JhckhlaWdodCA6IDE1LFxyXG4gICAgX2NvbXBsZXRlQ29sb3IgOiAnI2U4ODEzNCcsXHJcbiAgICBfdG9vbGJhck9mZnNldCA6IDIwLFxyXG4gICAgX3Jlc291cmNlTGlzdE9mZnNldCA6IDIwLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5fZnVsbEhlaWdodDtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX2luaXRNb2RlbEV2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZScgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQubm9kZVR5cGUgIT09ICdHcm91cCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2F2ZVdpdGhDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ21vdXNlZW50ZXInIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd1Rvb2xzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlUmVzb3VyY2VzTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ3JhYlBvaW50ZXIoZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZWxlYXZlJyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlVG9vbHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dSZXNvdXJjZXNMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0TW91c2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdzdGFydCAuZGVwZW5kZW5jeVRvb2wnIDogJ19zdGFydENvbm5lY3RpbmcnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmRlcGVuZGVuY3lUb29sJyA6ICdfbW92ZUNvbm5lY3QnLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAuZGVwZW5kZW5jeVRvb2wnIDogJ19jcmVhdGVEZXBlbmRlbmN5JyxcclxuICAgICAgICAgICAgJ2NsaWNrIC5yZXNvdXJjZXMnIDogJ19lZGl0UmVzb3VyY2VzJ1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBuZXcgS29udmEuR3JvdXAoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBwb3MueCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBpZCA6IHRoaXMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGZha2VCYWNrZ3JvdW5kID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2Zha2VCYWNrZ3JvdW5kJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbWFpblJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29tcGxldGVSZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgYXJjID0gbmV3IEtvbnZhLlNoYXBlKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgZmlsbCA6ICdsaWdodGdyZWVuJyxcclxuICAgICAgICAgICAgZHJhd0Z1bmM6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBob3JPZmZzZXQgPSA2O1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oaG9yT2Zmc2V0LCAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYXJjKGhvck9mZnNldCwgc2VsZi5fYmFySGVpZ2h0IC8gMiwgc2VsZi5fYmFySGVpZ2h0IC8gMiwgLSBNYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgc2VsZi5fYmFySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU2hhcGUodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShsaW5rSW1hZ2UsIDEsIChzZWxmLl9iYXJIZWlnaHQgLSAxMCkgLyAyLDEwLDEwKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGl0RnVuYyA6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlY3QoMCwgMCwgNiArIHNlbGYuX2JhckhlaWdodCwgc2VsZi5fYmFySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFNoYXBlKHRoaXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2RlcGVuZGVuY3lUb29sJyxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB0b29sYmFyID0gbmV3IEtvbnZhLkdyb3VwKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbmFtZSA6ICdyZXNvdXJjZXMnLFxyXG4gICAgICAgICAgICB2aXNpYmxlIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgdG9vbGJhY2sgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiAnbGlnaHRncmV5JyxcclxuICAgICAgICAgICAgd2lkdGggOiBzZWxmLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHNlbGYuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgY29ybmVyUmFkaXVzIDogMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciB1c2VySW0gPSBuZXcgS29udmEuSW1hZ2Uoe1xyXG4gICAgICAgICAgICBpbWFnZSA6IHVzZXJJbWFnZSxcclxuICAgICAgICAgICAgeCA6IChzZWxmLl9iYXJIZWlnaHQgLSAxMCkgLyAyLFxyXG4gICAgICAgICAgICB5IDogKHNlbGYuX2JhckhlaWdodCAtIDEwKSAvIDIsXHJcbiAgICAgICAgICAgIHdpZHRoIDogMTAsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IDEwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbGJhci5hZGQodG9vbGJhY2ssIHVzZXJJbSk7XHJcblxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSBuZXcgS29udmEuVGV4dCh7XHJcbiAgICAgICAgICAgIG5hbWUgOiAncmVzb3VyY2VMaXN0JyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGxpc3RlbmluZyA6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZChmYWtlQmFja2dyb3VuZCwgcmVjdCwgY29tcGxldGVSZWN0LCBhcmMsIHRvb2xiYXIsIHJlc291cmNlTGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9lZGl0UmVzb3VyY2VzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZpZXcgPSBuZXcgUmVzb3VyY2VFZGl0b3Ioe1xyXG4gICAgICAgICAgICBtb2RlbCA6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLmVsLmdldFN0YWdlKCkuZ2V0UG9pbnRlclBvc2l0aW9uKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIocG9zKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHJlY3Qud2lkdGgoKTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5yb3VuZCh4IC8gZGF5c1dpZHRoKSwgZGF5czIgPSBNYXRoLnJvdW5kKCh4ICsgbGVuZ3RoKSAvIGRheXNXaWR0aCk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXHJcbiAgICAgICAgICAgIGVuZDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyIC0gMSlcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2hvd1Rvb2xzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKS5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2hpZGVUb29scyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9zaG93UmVzb3VyY2VzTGlzdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2hpZGVSZXNvdXJjZXNMaXN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0JykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ3JhYlBvaW50ZXIgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBlLnRhcmdldC5uYW1lKCk7XHJcbiAgICAgICAgaWYgKChuYW1lID09PSAnbWFpblJlY3QnKSB8fCAobmFtZSA9PT0gJ2RlcGVuZGVuY3lUb29sJykgfHxcclxuICAgICAgICAgICAgKG5hbWUgPT09ICdjb21wbGV0ZVJlY3QnKSB8fCAoZS50YXJnZXQuZ2V0UGFyZW50KCkubmFtZSgpID09PSAncmVzb3VyY2VzJykpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9kZWZhdWx0TW91c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcclxuICAgIH0sXHJcbiAgICBfc3RhcnRDb25uZWN0aW5nIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLmhpZGUoKTtcclxuICAgICAgICB2YXIgcG9zID0gdG9vbC5nZXRBYnNvbHV0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgc3Ryb2tlIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAxLFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbcG9zLnggLSBzdGFnZS54KCksIHBvcy55LCBwb3MueCAtIHN0YWdlLngoKSwgcG9zLnldLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2Nvbm5lY3RvcidcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYWRkKGNvbm5lY3Rvcik7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ29ubmVjdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgcG9pbnRzID0gY29ubmVjdG9yLnBvaW50cygpO1xyXG4gICAgICAgIHBvaW50c1syXSA9IHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLnggLSBzdGFnZS54KCk7XHJcbiAgICAgICAgcG9pbnRzWzNdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueTtcclxuICAgICAgICBjb25uZWN0b3IucG9pbnRzKHBvaW50cyk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZURlcGVuZGVuY3kgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBlbCA9IHN0YWdlLmdldEludGVyc2VjdGlvbihzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKSk7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gZWwgJiYgZWwuZ2V0UGFyZW50KCk7XHJcbiAgICAgICAgdmFyIHRhc2tJZCA9IGdyb3VwICYmIGdyb3VwLmlkKCk7XHJcbiAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5tb2RlbDtcclxuICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5nZXQodGFza0lkKTtcclxuICAgICAgICBpZiAoYWZ0ZXJNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHJlbW92ZUZvciA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5maW5kKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlbW92ZUZvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLnJlbW92ZURlcGVuZGVuY3kocmVtb3ZlRm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZG9uJ3QgdXBkYXRlIGVsZW1lbnQgd2hpbGUgZHJhZ2dpbmdcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCBjaGFuZ2U6Y29tcGxldGUgY2hhbmdlOnJlc291cmNlcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZHJhZ2dpbmcgPSB0aGlzLmVsLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5nZXRDaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZHJhZ2dpbmcgfHwgY2hpbGQuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHgxOiAoRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ3N0YXJ0JykpIC0gMSkgKiBkYXlzV2lkdGgsXHJcbiAgICAgICAgICAgIHgyOiAoRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ2VuZCcpKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICAvLyBtb3ZlIGdyb3VwXHJcbiAgICAgICAgdGhpcy5lbC54KHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgZmFrZSBiYWNrZ3JvdW5kIHJlY3QgcGFyYW1zXHJcbiAgICAgICAgdmFyIGJhY2sgPSB0aGlzLmVsLmZpbmQoJy5mYWtlQmFja2dyb3VuZCcpWzBdO1xyXG4gICAgICAgIGJhY2sueCggLSAyMCk7XHJcbiAgICAgICAgYmFjay53aWR0aCh4LngyIC0geC54MSArIDYwKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIG1haW4gcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC54KDApO1xyXG4gICAgICAgIHJlY3Qud2lkdGgoeC54MiAtIHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS54KDApO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHgueDIgLSB4LngxKTtcclxuICAgICAgICB0b29sLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKVswXTtcclxuICAgICAgICByZXNvdXJjZXMueCh4LngyIC0geC54MSArIHRoaXMuX3Rvb2xiYXJPZmZzZXQpO1xyXG4gICAgICAgIHJlc291cmNlcy55KHRoaXMuX3RvcFBhZGRpbmcpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIHJlc291cmNlIGxpc3RcclxuICAgICAgICB2YXIgcmVzb3VyY2VMaXN0ID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0JylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LngoeC54MiAtIHgueDEgKyB0aGlzLl9yZXNvdXJjZUxpc3RPZmZzZXQpO1xyXG4gICAgICAgIHJlc291cmNlTGlzdC55KHRoaXMuX3RvcFBhZGRpbmcgKyAyKTtcclxuICAgICAgICB2YXIgdGV4dCA9ICcnO1xyXG4gICAgICAgIHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlSWQpIHtcclxuICAgICAgICAgICAgdmFyIHJlcyA9IF8uZmluZCh0aGlzLnNldHRpbmdzLnN0YXR1c2VzLnJlc291cmNlZGF0YSwgZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLlVzZXJJZC50b1N0cmluZygpID09PSByZXNvdXJjZUlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0ICs9IHJlcy5Vc2VybmFtZSArICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LnRleHQodGV4dCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBzZXRZIDogZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuZWwueSh5KTtcclxuICAgIH0sXHJcbiAgICBnZXRZIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3k7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1Rhc2tWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIENvbm5lY3RvclZpZXcgPSBCYWNrYm9uZS5Lb252YVZpZXcuZXh0ZW5kKHtcclxuICAgIF9jb2xvciA6ICdncmV5JyxcclxuICAgIF93cm9uZ0NvbG9yIDogJ3JlZCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5iZWZvcmVNb2RlbCA9IHBhcmFtcy5iZWZvcmVNb2RlbDtcclxuICAgICAgICB0aGlzLmFmdGVyTW9kZWwgPSBwYXJhbXMuYWZ0ZXJNb2RlbDtcclxuICAgICAgICB0aGlzLl95MSA9IDA7XHJcbiAgICAgICAgdGhpcy5feTIgPSAwO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRNb2RlbEV2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxpbmUgPSBuZXcgS29udmEuTGluZSh7XHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoIDogMixcclxuICAgICAgICAgICAgc3Ryb2tlIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgcG9pbnRzIDogWzAsMCwwLDBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9LFxyXG4gICAgc2V0WTEgOiBmdW5jdGlvbih5MSkge1xyXG4gICAgICAgIHRoaXMuX3kxID0geTE7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICBzZXRZMiA6IGZ1bmN0aW9uKHkyKSB7XHJcbiAgICAgICAgdGhpcy5feTIgPSB5MjtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIGlmICh4LngyID49IHgueDEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fY29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbeC54MSwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTIsIHgueDIsIHRoaXMuX3kyXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fd3JvbmdDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFtcclxuICAgICAgICAgICAgICAgIHgueDEsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kyLFxyXG4gICAgICAgICAgICAgICAgeC54MiwgdGhpcy5feTJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5hZnRlck1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5hZnRlck1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkgKiBkYXlzV2lkdGgsXHJcbiAgICAgICAgICAgIHgyOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLmFmdGVyTW9kZWwuZ2V0KCdzdGFydCcpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3JWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrVmlldycpO1xyXG52YXIgQWxvbmVUYXNrVmlldyA9IHJlcXVpcmUoJy4vQWxvbmVUYXNrVmlldycpO1xyXG52YXIgQ29ubmVjdG9yVmlldyA9IHJlcXVpcmUoJy4vQ29ubmVjdG9yVmlldycpO1xyXG5cclxudmFyIEdhbnR0Q2hhcnRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjZ2FudHQtY29udGFpbmVyJyxcclxuICAgIF90b3BQYWRkaW5nIDogNzMsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2luaXRTdGFnZSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRMYXllcnMoKTtcclxuICAgICAgICB0aGlzLl9pbml0QmFja2dyb3VuZCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTdWJWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRDb2xsZWN0aW9uRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0TGVmdFBhZGRpbmcgOiBmdW5jdGlvbihvZmZzZXQpIHtcclxuICAgICAgICB0aGlzLl9sZWZ0UGFkZGluZyA9IG9mZnNldDtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTdGFnZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc3RhZ2UgPSBuZXcgS29udmEuU3RhZ2Uoe1xyXG4gICAgICAgICAgICBjb250YWluZXIgOiB0aGlzLmVsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0TGF5ZXJzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIgPSBuZXcgS29udmEuTGF5ZXIoKTtcclxuICAgICAgICB0aGlzLkJsYXllciA9IG5ldyBLb252YS5MYXllcigpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkKHRoaXMuQmxheWVyLCB0aGlzLkZsYXllcik7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZVN0YWdlQXR0cnMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc3RhZ2Uuc2V0QXR0cnMoe1xyXG4gICAgICAgICAgICB4IDogdGhpcy5fbGVmdFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgoJChcIi50YXNrc1wiKS5pbm5lckhlaWdodCgpICsgdGhpcy5fdG9wUGFkZGluZywgd2luZG93LmlubmVySGVpZ2h0IC0gJCh0aGlzLnN0YWdlLmdldENvbnRhaW5lcigpKS5vZmZzZXQoKS50b3ApLFxyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy4kZWwuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmM6ICBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciB4O1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pblggPSAtIChsaW5lV2lkdGggLSB0aGlzLndpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvcy54ID4gc2VsZi5fbGVmdFBhZGRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gc2VsZi5fbGVmdFBhZGRpbmc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvcy54IDwgbWluWCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBtaW5YO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gcG9zLng7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0QmFja2dyb3VuZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IG5ldyBLb252YS5TaGFwZSh7XHJcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0U2NlbmVGdW5jdGlvbigpLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciB3aWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgYmFjayA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5zdGFnZS5oZWlnaHQoKSxcclxuICAgICAgICAgICAgd2lkdGggOiB3aWR0aFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLkJsYXllci5hZGQoYmFjaykuYWRkKHNoYXBlKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ2V0U2NlbmVGdW5jdGlvbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzZGlzcGxheSA9IHRoaXMuc2V0dGluZ3Muc2Rpc3BsYXk7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgYm9yZGVyV2lkdGggPSBzZGlzcGxheS5ib3JkZXJXaWR0aCB8fCAxO1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSAxO1xyXG4gICAgICAgIHZhciByb3dIZWlnaHQgPSAyMDtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0KXtcclxuICAgICAgICAgICAgdmFyIGksIHMsIGlMZW4gPSAwLFx0ZGF5c1dpZHRoID0gc2F0dHIuZGF5c1dpZHRoLCB4LFx0bGVuZ3RoLFx0aERhdGEgPSBzYXR0ci5oRGF0YTtcclxuICAgICAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIC8vZHJhdyB0aHJlZSBsaW5lc1xyXG4gICAgICAgICAgICBmb3IoaSA9IDE7IGkgPCA0IDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhsaW5lV2lkdGggKyBvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgeWkgPSAwLCB5ZiA9IHJvd0hlaWdodCwgeGkgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHMgPSAxOyBzIDwgMzsgcysrKXtcclxuICAgICAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzEwcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5ZiAtIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeWkgPSB5ZjsgeWYgPSB5ZiArIHJvd0hlaWdodDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7IHMgPSAzOyB5ZiA9IDEyMDA7XHJcbiAgICAgICAgICAgIHZhciBkcmFnSW50ID0gcGFyc2VJbnQoc2F0dHIuZHJhZ0ludGVydmFsLCAxMCk7XHJcbiAgICAgICAgICAgIHZhciBoaWRlRGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiggZHJhZ0ludCA9PT0gMTQgfHwgZHJhZ0ludCA9PT0gMzApe1xyXG4gICAgICAgICAgICAgICAgaGlkZURhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBoRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnNnB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZGVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzFwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5aSArIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdyZW1vdmUnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVZpZXdGb3JNb2RlbCh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gd2FpdCBmb3IgbGVmdCBwYW5lbCB1cGRhdGVzXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2NoYW5nZTpoaWRkZW4nLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSksIDUpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmRlcGVuZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdkZXBlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rvcih0YXNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnbmVzdGVkU3RhdGVDaGFuZ2UnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVZpZXdGb3JNb2RlbCh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbCA6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgdmFyIHRhc2tWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gbW9kZWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlVmlldyh0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXcgOiBmdW5jdGlvbih0YXNrVmlldykge1xyXG4gICAgICAgIHRhc2tWaWV3LnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl90YXNrVmlld3MsIHRhc2tWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVtb3ZlQ29ubmVjdG9yIDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3LmFmdGVyTW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29ubmVjdG9yVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl9jb25uZWN0b3JWaWV3cywgY29ubmVjdG9yVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTdWJWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3RvclZpZXcodGFzayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkVGFza1ZpZXcgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIHZpZXc7XHJcbiAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IE5lc3RlZFRhc2tWaWV3KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFsb25lVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MucHVzaCh2aWV3KTtcclxuICAgIH0sXHJcbiAgICBfYWRkQ29ubmVjdG9yVmlldyA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgZGVwZW5kSWQgPSB0YXNrLmdldCgnZGVwZW5kJyk7XHJcbiAgICAgICAgaWYgKCFkZXBlbmRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB2aWV3ID0gbmV3IENvbm5lY3RvclZpZXcoe1xyXG4gICAgICAgICAgICBiZWZvcmVNb2RlbCA6IHRoaXMuY29sbGVjdGlvbi5nZXQoZGVwZW5kSWQpLFxyXG4gICAgICAgICAgICBhZnRlck1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcuZWwubW92ZVRvQm90dG9tKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZXNvcnRWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsYXN0WSA9IHRoaXMuX3RvcFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XHJcbiAgICAgICAgICAgIGxhc3RZICs9IHZpZXcuaGVpZ2h0O1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB2YXIgZGVwZW5kSWQgPSB0YXNrLmdldCgnZGVwZW5kJyk7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykgfHwgIWRlcGVuZElkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkZXBlbmRJZCk7XHJcbiAgICAgICAgICAgIHZhciBiZWZvcmVWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGFmdGVyVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGNvbm5lY3RvclZpZXcgPSBfLmZpbmQodGhpcy5fY29ubmVjdG9yVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmVNb2RlbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTEoYmVmb3JlVmlldy5nZXRZKCkgKyBiZWZvcmVWaWV3Ll9mdWxsSGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTIoYWZ0ZXJWaWV3LmdldFkoKSAgKyBhZnRlclZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yIDogJyNiM2QxZmMnLFxyXG4gICAgX2JvcmRlclNpemUgOiA2LFxyXG4gICAgX2JhckhlaWdodCA6IDEwLFxyXG4gICAgX2NvbXBsZXRlQ29sb3IgOiAnI0M5NUYxMCcsXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS29udmEuTGluZSh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFswLCAwLCB0aGlzLl9ib3JkZXJTaXplICogMS41LCAwLCAwLCB0aGlzLl9ib3JkZXJTaXplXSxcclxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS29udmEuTGluZSh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFstdGhpcy5fYm9yZGVyU2l6ZSAqIDEuNSwgMCwgMCwgMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZV0sXHJcbiAgICAgICAgICAgIGNsb3NlZCA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZURhdGVzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZ3JvdXAgaXMgbW92ZWRcclxuICAgICAgICAvLyBzbyB3ZSBuZWVkIHRvIGRldGVjdCBpbnRlcnZhbFxyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLmZsb29yKHggLyBkYXlzV2lkdGgpO1xyXG4gICAgICAgIHZhciBuZXdTdGFydCA9IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5tb3ZlVG9TdGFydChuZXdTdGFydCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxKTtcclxuICAgICAgICB2YXIgY29tcGxldGVXaWR0aCA9ICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgICAgICBpZiAoY29tcGxldGVXaWR0aCA+IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbXBsZXRlQ29sb3IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh4LngyIC0geC54MSkgLSBjb21wbGV0ZVdpZHRoIDwgdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbXBsZXRlQ29sb3IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2tWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE1vZGFsRWRpdCA9IHJlcXVpcmUoJy4uL01vZGFsVGFza0VkaXRWaWV3Jyk7XHJcblxyXG5mdW5jdGlvbiBDb250ZXh0TWVudVZpZXcocGFyYW1zKSB7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMuY29sbGVjdGlvbjtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICd1bCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykgfHwgJCh0aGlzKS5kYXRhKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmNvbGxlY3Rpb24uZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnZGVsZXRlJyl7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncHJvcGVydGllcycpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgTW9kYWxFZGl0KHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbCA6IG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzIDogc2VsZi5zZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soZGF0YSwgJ2Fib3ZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QmVsb3cnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH0sICdiZWxvdycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdpbmRlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24uaW5kZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLm91dGRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICBcInJvd0Fib3ZlXCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEFib3ZlXCIsIGljb246IFwiYWJvdmVcIiB9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEJlbG93XCIsIGljb246IFwiYmVsb3dcIiB9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7SW5kZW50IFJvd1wiLCBpY29uOiBcImluZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7T3V0ZGVudCBSb3dcIiwgaWNvbjogXCJvdXRkZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7IG5hbWU6IFwiJm5ic3A7UHJvcGVydGllc1wiLCBpY29uOiBcInByb3BlcnRpZXNcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjogeyBuYW1lOiBcIiZuYnNwO0RlbGV0ZSBSb3dcIiwgaWNvbjogXCJkZWxldGVcIiB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Db250ZXh0TWVudVZpZXcucHJvdG90eXBlLmFkZFRhc2sgPSBmdW5jdGlvbihkYXRhLCBpbnNlcnRQb3MpIHtcclxuICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGFzay5zYXZlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHRNZW51VmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnRGF0ZVBpY2tlcicsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLFxyXG4gICAgICAgICAgICBvblNlbGVjdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSB0aGlzLmdldERPTU5vZGUoKS52YWx1ZS5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgOiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdzaG93Jyk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcignZGVzdHJveScpO1xyXG4gICAgfSxcclxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvbW0veXknKTtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnTmVzdGVkVGFzaycsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9uKCdjaGFuZ2U6aGlkZGVuIGNoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdWJ0YXNrcyA9IHRoaXMucHJvcHMubW9kZWwuY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzay1saXN0LWNvbnRhaW5lciBkcmFnLWl0ZW0nICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiB0aGlzLnByb3BzLm1vZGVsXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdvbCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3N1Yi10YXNrLWxpc3Qgc29ydGFibGUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdWJ0YXNrc1xyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFzaztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XHJcbnZhciBOZXN0ZWRUYXNrID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrJyk7XHJcblxyXG5mdW5jdGlvbiBnZXREYXRhKGNvbnRhaW5lcikge1xyXG4gICAgdmFyIGRhdGEgPSBbXTtcclxuICAgIHZhciBjaGlsZHJlbiA9ICQoJzxvbD4nICsgY29udGFpbmVyLmdldCgwKS5pbm5lckhUTUwgKyAnPC9vbD4nKS5jaGlsZHJlbigpO1xyXG4gICAgXy5lYWNoKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgIHZhciAkY2hpbGQgPSAkKGNoaWxkKTtcclxuICAgICAgICB2YXIgb2JqID0ge1xyXG4gICAgICAgICAgICBpZCA6ICRjaGlsZC5kYXRhKCdpZCcpLFxyXG4gICAgICAgICAgICBjaGlsZHJlbiA6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc3VibGlzdCA9ICRjaGlsZC5maW5kKCdvbCcpO1xyXG4gICAgICAgIGlmIChzdWJsaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBvYmouY2hpbGRyZW4gPSBnZXREYXRhKHN1Ymxpc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLnB1c2gob2JqKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuXHJcbnZhciBTaWRlUGFuZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZTogJ1NpZGVQYW5lbCcsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLl9tYWtlU29ydGFibGUoKTtcclxuICAgIH0sXHJcbiAgICBfbWFrZVNvcnRhYmxlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoJy50YXNrLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGNvbnRhaW5lci5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgIGdyb3VwOiAnc29ydGFibGUnLFxyXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3RvciA6ICdvbCcsXHJcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXIgc29ydC1wbGFjZWhvbGRlclwiLz4nLFxyXG4gICAgICAgICAgICBvbkRyYWdTdGFydCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyYWcgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGdldERhdGEoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlciA9ICQoJzxkaXY+Jyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kIDogJ2dyZXknLFxyXG4gICAgICAgICAgICBvcGFjaXR5IDogJzAuNScsXHJcbiAgICAgICAgICAgIGxpZnQgOiAnMCcsXHJcbiAgICAgICAgICAgIHRvcCA6ICcwJyxcclxuICAgICAgICAgICAgd2lkdGggOiAnMTAwJSdcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlb3ZlcihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgdmFyIHBvcyA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcCA6IHBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogJGVsLmhlaWdodCgpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlbGVhdmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG4gICAgcmVxdWVzdFVwZGF0ZSA6IChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICB9O1xyXG4gICAgfSgpKSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJy50YXNrLWNvbnRhaW5lcicpLnNvcnRhYmxlKFwiZGVzdHJveVwiKTtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHRhc2tzID0gW107XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stY29udGFpbmVyIHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRhc2tzXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2lkZVBhbmVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERhdGVQaWNrZXIgPSByZXF1aXJlKCcuL0RhdGVQaWNrZXInKTtcclxuXHJcbnZhciBUYXNrSXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ1Rhc2tJdGVtJyxcclxuICAgIGdldEluaXRpYWxTdGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVkaXRSb3cgOiB1bmRlZmluZWRcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmZpbmQoJ2lucHV0JykuZm9jdXMoKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9uKCdjaGFuZ2U6bmFtZSBjaGFuZ2U6Y29tcGxldGUgY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQgY2hhbmdlOmR1cmF0aW9uIGNoYW5nZTpoaWdodGxpZ2h0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBfZmluZE5lc3RlZExldmVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxldmVsID0gMDtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wcm9wcy5tb2RlbC5wYXJlbnQ7XHJcbiAgICAgICAgd2hpbGUodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldmVsKys7XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9jcmVhdGVGaWVsZCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRSb3cgPT09IGNvbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRWRpdEZpZWxkKGNvbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVSZWFkRmlsZWQoY29sKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlUmVhZEZpbGVkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcclxuICAgICAgICBpZiAoY29sID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKSArICclJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSwgbW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEYXRlRWxlbWVudCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoY29sLCBuZXdWYWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9kdXJhdGlvbkNoYW5nZSA6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG51bWJlciA9IHBhcnNlSW50KHZhbHVlLnJlcGxhY2UoIC9eXFxEKy9nLCAnJyksIDEwKTtcclxuICAgICAgICBpZiAoIW51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCd3JykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRXZWVrcyhudW1iZXIpKTtcclxuICAgICAgICB9IGVsc2UgIGlmICh2YWx1ZS5pbmRleE9mKCdtJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRNb250aHMobnVtYmVyKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbnVtYmVyLS07XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMobnVtYmVyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEdXJhdGlvbkZpZWxkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IERhdGUuZGF5c2RpZmYodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JyksIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogdGhpcy5zdGF0ZS52YWwgfHwgdmFsLFxyXG4gICAgICAgICAgICBrZXkgOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2R1cmF0aW9uQ2hhbmdlKG5ld1ZhbCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudmFsID0gbmV3VmFsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUudmFsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRWRpdEZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlRWxlbWVudChjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEdXJhdGlvbkZpZWxkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25CbHVyIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCd1bCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzaycgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gZS50YXJnZXQuY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbCA9IGNsYXNzTmFtZS5zbGljZSg0LCBjbGFzc05hbWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IGNvbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZENvbG9yJyA6IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdoaWdodGxpZ2h0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3NvcnRpbmRleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1zb3J0aW5kZXgnXHJcbiAgICAgICAgICAgICAgICB9LCBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgMSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5IDogJ25hbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLW5hbWUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLmlzTmVzdGVkKCkgPyBSZWFjdC5jcmVhdGVFbGVtZW50KCdpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndHJpYW5nbGUgaWNvbiAnICsgKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSA/ICdyaWdodCcgOiAnZG93bicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnY29sbGFwc2VkJywgIXRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0IDogKHRoaXMuX2ZpbmROZXN0ZWRMZXZlbCgpICogMTApICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVGaWVsZCgnbmFtZScpKVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdjb21wbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1jb21wbGV0ZSdcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdjb21wbGV0ZScpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdzdGFydCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1zdGFydCdcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdzdGFydCcpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtZW5kJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2VuZCcpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdkdXJhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1kdXJhdGlvbidcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdkdXJhdGlvbicpKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGFza0l0ZW07XHJcbiJdfQ==
