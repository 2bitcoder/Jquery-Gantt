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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvZGF0YS9zdGF0dXNlcy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24uanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2Zha2VfMTJlZjJjYTguanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9TZXR0aW5nTW9kZWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9UYXNrTW9kZWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3V0aWxzL3V0aWwuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0FkZEZvcm1WaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9HYW50dFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL01vZGFsVGFza0VkaXRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1JlcG9ydHNNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBcImNmZ2RhdGFcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJDYXRlZ29yeVwiOiBcIlRhc2sgSGVhbHRoXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAxNTAyNyxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiR3JlZW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAxNTAyOCxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiQW1iZXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAxNTAyOSxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiUmVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogMixcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJDYXRlZ29yeVwiOiBcIlRhc2sgU3RhdHVzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAyMyxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiSW4gUHJvZ3Jlc3NcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAyNCxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6IFwiQ29tcGxldGVcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOiAyMTgsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOiBcIlJlYWR5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjogMSxcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogMTUwMjYsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOiBcIkJhY2tsb2dcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIF0sXHJcbiAgICBcIndvZGF0YVwiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIldPTnVtYmVyXCI6IFwiV29ya09yZGVyc1wiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjogNDMsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJXT051bWJlclwiOiBcIldPMTAwMThcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOiA0M1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgXSxcclxuICAgIFwicmVzb3VyY2VkYXRhXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiVXNlcklkXCI6IDEsXHJcbiAgICAgICAgICAgIFwiVXNlcm5hbWVcIjogXCJHcmVnIFZhbmRlbGlndFwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6IFwiUHJvZ3JhbSBNYW5hZ2VyXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjogNTgsXHJcbiAgICAgICAgICAgIFwiVXNlcm5hbWVcIjogXCJKYW1lcyBHdW1sZXlcIixcclxuICAgICAgICAgICAgXCJKb2JUaXRsZVwiOiBcIlByb2plY3QgTWFuYWdlclwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiVXNlcklkXCI6IDIsXHJcbiAgICAgICAgICAgIFwiVXNlcm5hbWVcIjogXCJMdWN5IE1pbm90YVwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6IG51bGxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjogNTksXHJcbiAgICAgICAgICAgIFwiVXNlcm5hbWVcIjogXCJSb2IgVHluYW5cIixcclxuICAgICAgICAgICAgXCJKb2JUaXRsZVwiOiBcIkJ1c2luZXNzIEFuYWx5c3RcIlxyXG4gICAgICAgIH1cclxuICAgIF1cclxufTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYXNrTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGFza01vZGVsJyk7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0dXJsIDogJ2FwaS90YXNrcycsXG5cdG1vZGVsOiBUYXNrTW9kZWwsXG5cdGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc3Vic2NyaWJlKCk7XG5cdH0sXG5cdGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xuXHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHR9LFxuXHRsaW5rQ2hpbGRyZW4gOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGFyZW50VGFzayA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChwYXJlbnRUYXNrKSB7XG5cdFx0XHRcdGlmIChwYXJlbnRUYXNrID09PSB0YXNrKSB7XG5cdFx0XHRcdFx0dGFzay5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdF9zb3J0Q2hpbGRyZW4gOiBmdW5jdGlvbiAodGFzaywgc29ydEluZGV4KSB7XG5cdFx0dGFzay5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0Y2hpbGQuc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4oY2hpbGQsIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRjaGVja1NvcnRlZEluZGV4IDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IC0xO1xuXHRcdHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRhc2suc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4odGFzaywgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRfcmVzb3J0Q2hpbGRyZW4gOiBmdW5jdGlvbihkYXRhLCBzdGFydEluZGV4LCBwYXJlbnRJRCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSBzdGFydEluZGV4O1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbih0YXNrRGF0YSkge1xuXHRcdFx0dmFyIHRhc2sgPSB0aGlzLmdldCh0YXNrRGF0YS5pZCk7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudElEKSB7XG5cdFx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldChwYXJlbnRJRCk7XG5cdFx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNhdmUoe1xuXHRcdFx0XHRzb3J0aW5kZXg6ICsrc29ydEluZGV4LFxuXHRcdFx0XHRwYXJlbnRpZDogcGFyZW50SURcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhc2tEYXRhLmNoaWxkcmVuICYmIHRhc2tEYXRhLmNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9yZXNvcnRDaGlsZHJlbih0YXNrRGF0YS5jaGlsZHJlbiwgc29ydEluZGV4LCB0YXNrLmlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdHJlc29ydCA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG5cdFx0dGhpcy5fcmVzb3J0Q2hpbGRyZW4oZGF0YSwgLTEsIDApO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5zb3J0KCk7XG5cdH0sXG5cdHN1YnNjcmliZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcywgJ2FkZCcsIGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHZhciBwYXJlbnQgPSB0aGlzLmZpbmQoZnVuY3Rpb24obSkge1xuXHRcdFx0XHRcdHJldHVybiBtLmlkID09PSBtb2RlbC5nZXQoJ3BhcmVudGlkJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRcdFx0cGFyZW50LmNoaWxkcmVuLmFkZChtb2RlbCk7XG5cdFx0XHRcdFx0bW9kZWwucGFyZW50ID0gcGFyZW50O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybignY2FuIG5vdCBmaW5kIHBhcmVudCB3aXRoIGlkICcgKyBtb2RlbC5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0XHRcdG1vZGVsLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcywgJ3Jlc2V0JywgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmxpbmtDaGlsZHJlbigpO1xuXHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR0aGlzLl9jaGVja0RlcGVuZGVuY2llcygpO1xuXHRcdH0pO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLnBhcmVudCkge1xuXHRcdFx0XHR0YXNrLnBhcmVudC5jaGlsZHJlbi5yZW1vdmUodGFzayk7XG5cdFx0XHRcdHRhc2sucGFyZW50ID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbmV3UGFyZW50ID0gdGhpcy5nZXQodGFzay5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0aWYgKG5ld1BhcmVudCkge1xuXHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0aGlzLl9wcmV2ZW50U29ydGluZykge1xuXHRcdFx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0Y3JlYXRlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uIChiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmICh0aGlzLl9jYW5DcmVhdGVEZXBlbmRlbmNlKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSkge1xuXHRcdFx0YWZ0ZXJNb2RlbC5kZXBlbmRPbihiZWZvcmVNb2RlbCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9jYW5DcmVhdGVEZXBlbmRlbmNlIDogZnVuY3Rpb24oYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpIHtcblx0XHRpZiAoYmVmb3JlTW9kZWwuaGFzUGFyZW50KGFmdGVyTW9kZWwpIHx8IGFmdGVyTW9kZWwuaGFzUGFyZW50KGJlZm9yZU1vZGVsKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoKGJlZm9yZU1vZGVsLmdldCgnZGVwZW5kJykgPT09IGFmdGVyTW9kZWwuaWQpIHx8XG5cdFx0XHQoYWZ0ZXJNb2RlbC5nZXQoJ2RlcGVuZCcpID09PSBiZWZvcmVNb2RlbC5pZCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdHJlbW92ZURlcGVuZGVuY3kgOiBmdW5jdGlvbihhZnRlck1vZGVsKSB7XG5cdFx0YWZ0ZXJNb2RlbC5jbGVhckRlcGVuZGVuY2UoKTtcblx0fSxcblx0X2NoZWNrRGVwZW5kZW5jaWVzIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ2RlcGVuZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdkZXBlbmQnKSk7XG5cdFx0XHRpZiAoIWJlZm9yZU1vZGVsKSB7XG5cdFx0XHRcdHRhc2sudW5zZXQoJ2RlcGVuZCcpLnNhdmUoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhc2suZGVwZW5kT24oYmVmb3JlTW9kZWwpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdG91dGRlbnQgOiBmdW5jdGlvbih0YXNrKSB7XG5cdFx0dmFyIHVuZGVyU3VibGluZ3MgPSBbXTtcblx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdHRhc2sucGFyZW50LmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdFx0aWYgKGNoaWxkLmdldCgnc29ydGluZGV4JykgPD0gdGFzay5nZXQoJ3NvcnRpbmRleCcpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuZGVyU3VibGluZ3MucHVzaChjaGlsZCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG5cdFx0dW5kZXJTdWJsaW5ncy5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHRhc2suaWQpO1xuXHRcdH0pO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0aWYgKHRhc2sucGFyZW50ICYmIHRhc2sucGFyZW50LnBhcmVudCkge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHRhc2sucGFyZW50LnBhcmVudC5pZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCAwKTtcblx0XHR9XG5cdH0sXG5cdGluZGVudCA6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgcHJldlRhc2ssIGksIG07XG5cdFx0Zm9yIChpID0gdGhpcy5sZW5ndGggLSAxOyBpID49MDsgaS0tKSB7XG5cdFx0XHRtID0gdGhpcy5hdChpKTtcblx0XHRcdGlmICgobS5nZXQoJ3NvcnRpbmRleCcpIDwgdGFzay5nZXQoJ3NvcnRpbmRleCcpKSAmJiAodGFzay5wYXJlbnQgPT09IG0ucGFyZW50KSkge1xuXHRcdFx0XHRwcmV2VGFzayA9IG07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAocHJldlRhc2spIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCBwcmV2VGFzay5pZCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrQ29sbGVjdGlvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24nKTtcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vbW9kZWxzL1NldHRpbmdNb2RlbCcpO1xuXG52YXIgR2FudHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9HYW50dFZpZXcnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlscy91dGlsJyk7XG5cbmZ1bmN0aW9uIGZldGNoQ29sbGVjdGlvbihhcHApIHtcblx0YXBwLnRhc2tzLmZldGNoKHtcblx0XHRzdWNjZXNzIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBhZGQgZW1wdHkgdGFzayBpZiBubyB0YXNrcyBmcm9tIHNlcnZlclxuICAgICAgICAgICAgaWYgKGFwcC50YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBhcHAudGFza3MucmVzZXQoW3tcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA6ICdOZXcgdGFzaydcbiAgICAgICAgICAgICAgICB9XSk7XG5cbiAgICAgICAgICAgIH1cblx0XHRcdGNvbnNvbGUubG9nKCdTdWNjZXNzIGxvYWRpbmcgdGFza3MuJyk7XG5cdFx0XHRhcHAudGFza3MubGlua0NoaWxkcmVuKCk7XG5cdFx0XHRhcHAudGFza3MuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXG5cdFx0XHRhcHAuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3Moe30sIHthcHAgOiBhcHB9KTtcblx0XHRcdGlmICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5kZXhPZignbG9jYWxob3N0JykgPT09IC0xKSB7XG5cdFx0XHRcdCQuZ2V0SlNPTignL2FwaS9HYW50dENvbmZpZy93YnMvNDMvMmIwMGRhNDZiNTdjMDM5NScsIGZ1bmN0aW9uKHN0YXR1c2VzKSB7XG5cdFx0XHRcdFx0YXBwLnNldHRpbmdzID0gc3RhdHVzZXM7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRuZXcgR2FudHRWaWV3KHtcblx0XHRcdFx0YXBwIDogYXBwLFxuXHRcdFx0XHRjb2xsZWN0aW9uIDogYXBwLnRhc2tzXG5cdFx0XHR9KS5yZW5kZXIoKTtcblxuXHRcdFx0JCgnI2xvYWRlcicpLmZhZGVPdXQoKTtcblx0XHR9LFxuXHRcdGVycm9yIDogZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdlcnJvciBsb2FkaW5nJyk7XG5cdFx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0fSxcblx0XHRwYXJzZTogdHJ1ZSxcblx0XHRyZXNldCA6IHRydWVcblx0fSk7XG59XG5cblxuJChmdW5jdGlvbiAoKSB7XG5cdHZhciBhcHAgPSB7fTtcblx0YXBwLnRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cblx0Ly8gZGV0ZWN0IEFQSSBwYXJhbXMgZnJvbSBnZXQsIGUuZy4gP3Byb2plY3Q9MTQzJnByb2ZpbGU9MTcmc2l0ZWtleT0yYjAwZGE0NmI1N2MwMzk1XG5cdHZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xuXHRpZiAocGFyYW1zLnByb2plY3QgJiYgcGFyYW1zLnByb2ZpbGUgJiYgcGFyYW1zLnNpdGVrZXkpIHtcblx0XHRhcHAudGFza3MudXJsID0gJ2FwaS90YXNrcy8nICsgcGFyYW1zLnByb2plY3QgKyAnLycgKyBwYXJhbXMucHJvZmlsZSArICcvJyArIHBhcmFtcy5zaXRla2V5O1xuXHR9XG5cdGZldGNoQ29sbGVjdGlvbihhcHApO1xufSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xudmFyIHRlc3RTdGF0dXNlcyA9IHJlcXVpcmUoJy4uLy4uLy4uL2RhdGEvc3RhdHVzZXMnKTtcblxuLy92YXIgaGZ1bmMgPSBmdW5jdGlvbihwb3MsIGV2dCkge1xuLy9cdHZhciBkcmFnSW50ZXJ2YWwgPSBhcHAuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicsICdkcmFnSW50ZXJ2YWwnKTtcbi8vXHR2YXIgbiA9IE1hdGgucm91bmQoKHBvcy54IC0gZXZ0LmluaXBvcy54KSAvIGRyYWdJbnRlcnZhbCk7XG4vL1x0cmV0dXJuIHtcbi8vXHRcdHg6IGV2dC5pbmlwb3MueCArIG4gKiBkcmFnSW50ZXJ2YWwsXG4vL1x0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG4vL1x0fTtcbi8vfTtcblxudmFyIFNldHRpbmdNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aW50ZXJ2YWw6ICdmaXgnLFxuXHRcdC8vZGF5cyBwZXIgaW50ZXJ2YWxcblx0XHRkcGk6IDFcblx0fSxcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cnMsIHBhcmFtcykge1xuXHRcdHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcblx0XHR0aGlzLnN0YXR1c2VzID0gdGVzdFN0YXR1c2VzO1xuXHRcdHRoaXMuc2F0dHIgPSB7XG5cdFx0XHRoRGF0YToge30sXG5cdFx0XHRkcmFnSW50ZXJ2YWw6IDEsXG5cdFx0XHRkYXlzV2lkdGg6IDUsXG5cdFx0XHRjZWxsV2lkdGg6IDM1LFxuXHRcdFx0bWluRGF0ZTogbmV3IERhdGUoMjAyMCwxLDEpLFxuXHRcdFx0bWF4RGF0ZTogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNaW46IG5ldyBEYXRlKDAsMCwwKSxcblx0XHRcdGJvdW5kYXJ5TWF4OiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHQvL21vbnRocyBwZXIgY2VsbFxuXHRcdFx0bXBjOiAxXG5cdFx0fTtcblxuXHRcdHRoaXMuc2Rpc3BsYXkgPSB7XG5cdFx0XHRzY3JlZW5XaWR0aDogICQoJyNnYW50dC1jb250YWluZXInKS5pbm5lcldpZHRoKCkgKyA3ODYsXG5cdFx0XHR0SGlkZGVuV2lkdGg6IDMwNSxcblx0XHRcdHRhYmxlV2lkdGg6IDcxMFxuXHRcdH07XG5cblx0XHR0aGlzLmNvbGxlY3Rpb24gPSB0aGlzLmFwcC50YXNrcztcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xuXHRcdHRoaXMub24oJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMpO1xuXHR9LFxuXHRnZXRTZXR0aW5nOiBmdW5jdGlvbihmcm9tLCBhdHRyKXtcblx0XHRpZihhdHRyKXtcblx0XHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dW2F0dHJdO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXTtcblx0fSxcblx0ZmluZFN0YXR1c0lkIDogZnVuY3Rpb24oc3RhdHVzKSB7XG5cdFx0Zm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gc3RhdHVzLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBzdGF0dXNJdGVtLklEO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcbiAgICBmaW5kU3RhdHVzRm9ySWQgOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uSUQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSBpZC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBmaW5kRGVmYXVsdFN0YXR1c0lkIDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5jRGVmYXVsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXHRmaW5kSGVhbHRoSWQgOiBmdW5jdGlvbihoZWFsdGgpIHtcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBoZWFsdGgudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuICAgIGZpbmRIZWFsdGhGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZpbmREZWZhdWx0SGVhbHRoSWQgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cdGZpbmRXT0lkIDogZnVuY3Rpb24od28pIHtcblx0XHRmb3IodmFyIGkgaW4gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YSkge1xuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhW2ldO1xuICAgICAgICAgICAgaWYgKGRhdGEuV09OdW1iZXIudG9Mb3dlckNhc2UoKSA9PT0gd28udG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLklEO1xuICAgICAgICAgICAgfVxuXHRcdH1cblx0fSxcblx0Y2FsY21pbm1heDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG1pbkRhdGUgPSBuZXcgRGF0ZSgpLCBtYXhEYXRlID0gbWluRGF0ZS5jbG9uZSgpLmFkZFllYXJzKDEpO1xuXHRcdFxuXHRcdHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdzdGFydCcpLmNvbXBhcmVUbyhtaW5EYXRlKSA9PT0gLTEpIHtcblx0XHRcdFx0bWluRGF0ZT1tb2RlbC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdlbmQnKS5jb21wYXJlVG8obWF4RGF0ZSkgPT09IDEpIHtcblx0XHRcdFx0bWF4RGF0ZT1tb2RlbC5nZXQoJ2VuZCcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuc2F0dHIubWluRGF0ZSA9IG1pbkRhdGU7XG5cdFx0dGhpcy5zYXR0ci5tYXhEYXRlID0gbWF4RGF0ZTtcblx0XHRcblx0fSxcblx0c2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVuZCxzYXR0cj10aGlzLnNhdHRyLGRhdHRyPXRoaXMuc2Rpc3BsYXksZHVyYXRpb24sc2l6ZSxjZWxsV2lkdGgsZHBpLHJldGZ1bmMsc3RhcnQsbGFzdCxpPTAsaj0wLGlMZW49MCxuZXh0PW51bGw7XG5cdFx0XG5cdFx0dmFyIGludGVydmFsID0gdGhpcy5nZXQoJ2ludGVydmFsJyk7XG5cblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdkYWlseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAxLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTI7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cygxKTtcblx0XHRcdH07XG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xuXHRcdFx0XG5cdFx0fSBlbHNlIGlmKGludGVydmFsID09PSAnd2Vla2x5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDcsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogNyk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjAgKiA3KS5tb3ZlVG9EYXlPZldlZWsoMSwgLTEpO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gNTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCAqIDc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoNyk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCAqIDMwKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDI7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSA3ICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4ubW92ZVRvRmlyc3REYXlPZlF1YXJ0ZXIoKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDE7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSAzMCAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDM7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDMpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnZml4Jykge1xuXHRcdFx0Y2VsbFdpZHRoID0gMzA7XG5cdFx0XHRkdXJhdGlvbiA9IERhdGUuZGF5c2RpZmYoc2F0dHIubWluRGF0ZSwgc2F0dHIubWF4RGF0ZSk7XG5cdFx0XHRzaXplID0gZGF0dHIuc2NyZWVuV2lkdGggLSBkYXR0ci50SGlkZGVuV2lkdGggLSAxMDA7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzaXplIC8gZHVyYXRpb247XG5cdFx0XHRkcGkgPSBNYXRoLnJvdW5kKGNlbGxXaWR0aCAvIHNhdHRyLmRheXNXaWR0aCk7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgZHBpLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBkcGkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yICogZHBpKTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIgKiBkcGkpO1xuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbD09PSdhdXRvJykge1xuXHRcdFx0ZHBpID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gKDEgKyBNYXRoLmxvZyhkcGkpKSAqIDEyO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2F0dHIuY2VsbFdpZHRoIC8gZHBpO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMjAgKiBkcGkpO1xuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiBkcGkpO1xuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdH1cblx0XHR2YXIgaERhdGEgPSB7XG5cdFx0XHQnMSc6IFtdLFxuXHRcdFx0JzInOiBbXSxcblx0XHRcdCczJzogW11cblx0XHR9O1xuXHRcdHZhciBoZGF0YTMgPSBbXTtcblx0XHRcblx0XHRzdGFydCA9IHNhdHRyLmJvdW5kYXJ5TWluO1xuXHRcdFxuXHRcdGxhc3QgPSBzdGFydDtcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5JyB8fCBpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcblx0XHRcdHZhciBkdXJmdW5jO1xuXHRcdFx0aWYgKGludGVydmFsPT09J21vbnRobHknKSB7XG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luTW9udGgoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0TW9udGgoKSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJblF1YXJ0ZXIoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldFF1YXJ0ZXIoKSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRoZGF0YTMucHVzaCh7XG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogZHVyZnVuYyhsYXN0KSxcblx0XHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XG5cdFx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpbnRlcnZhbGRheXMgPSB0aGlzLmdldCgnZHBpJyk7XG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcblx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdGR1cmF0aW9uOiBpbnRlcnZhbGRheXMsXG5cdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRsYXN0ID0gbmV4dDtcblx0XHRcdH1cblx0XHR9XG5cdFx0c2F0dHIuYm91bmRhcnlNYXggPSBlbmQgPSBsYXN0O1xuXHRcdGhEYXRhWyczJ10gPSBoZGF0YTM7XG5cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IGRhdGUgdG8gZW5kIG9mIHllYXJcblx0XHR2YXIgaW50ZXIgPSBEYXRlLmRheXNkaWZmKHN0YXJ0LCBuZXcgRGF0ZShzdGFydC5nZXRGdWxsWWVhcigpLCAxMSwgMzEpKTtcblx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0ZHVyYXRpb246IGludGVyLFxuXHRcdFx0dGV4dDogc3RhcnQuZ2V0RnVsbFllYXIoKVxuXHRcdH0pO1xuXHRcdGZvcihpID0gc3RhcnQuZ2V0RnVsbFllYXIoKSArIDEsIGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTsgaSA8IGlMZW47IGkrKyl7XG5cdFx0XHRpbnRlciA9IERhdGUuaXNMZWFwWWVhcihpKSA/IDM2NiA6IDM2NTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcblx0XHRcdFx0dGV4dDogaVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgbGFzdCB5ZWFyIHVwdG8gZW5kIGRhdGVcblx0XHRpZiAoc3RhcnQuZ2V0RnVsbFllYXIoKSE9PWVuZC5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHRpbnRlciA9IERhdGUuZGF5c2RpZmYobmV3IERhdGUoZW5kLmdldEZ1bGxZZWFyKCksIDAsIDEpLCBlbmQpO1xuXHRcdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxuXHRcdFx0XHR0ZXh0OiBlbmQuZ2V0RnVsbFllYXIoKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgbW9udGhcblx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoc3RhcnQsIHN0YXJ0LmNsb25lKCkubW92ZVRvTGFzdERheU9mTW9udGgoKSksXG5cdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoc3RhcnQuZ2V0TW9udGgoKSwgJ20nKVxuXHRcdH0pO1xuXHRcdFxuXHRcdGogPSBzdGFydC5nZXRNb250aCgpICsgMTtcblx0XHRpID0gc3RhcnQuZ2V0RnVsbFllYXIoKTtcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XG5cdFx0dmFyIGVuZG1vbnRoID0gZW5kLmdldE1vbnRoKCk7XG5cblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XG5cdFx0XHR3aGlsZShqIDwgMTIpIHtcblx0XHRcdFx0aWYgKGkgPT09IGlMZW4gJiYgaiA9PT0gZW5kbW9udGgpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxuXHRcdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShqLCAnbScpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRqICs9IDE7XG5cdFx0XHR9XG5cdFx0XHRpICs9IDE7XG5cdFx0XHRqID0gMDtcblx0XHR9XG5cdFx0aWYgKGVuZC5nZXRNb250aCgpICE9PSBzdGFydC5nZXRNb250aCAmJiBlbmQuZ2V0RnVsbFllYXIoKSAhPT0gc3RhcnQuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoZW5kLmNsb25lKCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCksIGVuZCksXG5cdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShlbmQuZ2V0TW9udGgoKSwgJ20nKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHNhdHRyLmhEYXRhID0gaERhdGE7XG5cdH0sXG5cdGNhbGN1bGF0ZUludGVydmFsczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jYWxjbWlubWF4KCk7XG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGVzKCk7XG5cdH0sXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRUb1RleHQ9e1xuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0fSxcblx0XHRcdCdlbmQnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XG5cdFx0XHR9LFxuXHRcdFx0J2R1cmF0aW9uJzpmdW5jdGlvbih2YWx1ZSxtb2RlbCl7XG5cdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLnN0YXJ0LG1vZGVsLmVuZCkrJyBkJztcblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHZhciBzdGF0dXNlcz17XG5cdFx0XHRcdFx0JzExMCc6J2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5Jzonb3BlbicsXG5cdFx0XHRcdFx0JzEwOCcgOiAncmVhZHknXG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBzdGF0dXNlc1t2YWx1ZV07XG5cdFx0XHR9XG5cdFx0XG5cdFx0fTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZmllbGQsdmFsdWUsbW9kZWwpe1xuXHRcdFx0cmV0dXJuIGRUb1RleHRbZmllbGRdP2RUb1RleHRbZmllbGRdKHZhbHVlLG1vZGVsKTp2YWx1ZTtcblx0XHR9O1xuXHR9KCkpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nTW9kZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuICAgIGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBNQUlOIFBBUkFNU1xyXG4gICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGNvbXBsZXRlOiAwLCAgLy8gMCUgLSAxMDAlIHBlcmNlbnRzXHJcbiAgICAgICAgc29ydGluZGV4OiAwLCAgIC8vIHBsYWNlIG9uIHNpZGUgbWVudSwgc3RhcnRzIGZyb20gMFxyXG4gICAgICAgIGRlcGVuZDogdW5kZWZpbmVkLCAgLy8gaWQgb2YgdGFza1xyXG4gICAgICAgIHN0YXR1czogJzExMCcsICAgICAgLy8gMTEwIC0gY29tcGxldGUsIDEwOSAgLSBvcGVuLCAxMDggLSByZWFkeVxyXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZDogbmV3IERhdGUoKSxcclxuICAgICAgICBwYXJlbnRpZDogMCxcclxuXHJcbiAgICAgICAgY29sb3I6ICcjMDA5MGQzJywgICAvLyB1c2VyIGNvbG9yLCBub3QgdXNlZCBmb3Igbm93XHJcblxyXG4gICAgICAgIC8vIHNvbWUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgaGVhbHRoOiAyMSxcclxuICAgICAgICByZXBvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICB3bzogMiwgICAgICAgICAgICAgICAgICAvL1NlbGVjdCBMaXN0IGluIHByb3BlcnRpZXMgbW9kYWwgICAoY29uZmlnZGF0YSlcclxuICAgICAgICBtaWxlc3RvbmU6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGRlbGl2ZXJhYmxlOiBmYWxzZSwgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZmluYW5jaWFsOiBmYWxzZSwgICAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICB0aW1lc2hlZXRzOiBmYWxzZSwgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGFjdHRpbWVzaGVldHM6IGZhbHNlLCAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcblxyXG4gICAgICAgIC8vIHNlcnZlciBzcGVjaWZpYyBwYXJhbXNcclxuICAgICAgICAvLyBkb24ndCB1c2UgdGhlbSBvbiBjbGllbnQgc2lkZVxyXG4gICAgICAgIFByb2plY3RSZWYgOiBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICBXQlNfSUQgOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleSxcclxuXHJcblxyXG4gICAgICAgIC8vIHBhcmFtcyBmb3IgYXBwbGljYXRpb24gdmlld3NcclxuICAgICAgICAvLyBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIEpTT05cclxuICAgICAgICBoaWRkZW4gOiBmYWxzZSxcclxuICAgICAgICBjb2xsYXBzZWQgOiBmYWxzZSxcclxuICAgICAgICBoaWdodGxpZ2h0IDogJydcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBTdWJUYXNrcygpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ3BhcmVudGlkJykgPT09IHRoaXMuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkJywgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQucGFyZW50ID0gdGhpcztcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6c29ydGluZGV4JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUgY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hlY2tUaW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXQoJ2NvbGxhcHNlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGVja2luZyBuZXN0ZWQgc3RhdGVcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlJywgdGhpcy5fY2hlY2tOZXN0ZWQpO1xyXG5cclxuICAgICAgICAvLyB0aW1lIGNoZWNraW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl9jaGVja0NvbXBsZXRlKTtcclxuICAgIH0sXHJcbiAgICBpc05lc3RlZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgfSxcclxuICAgIHNob3cgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgZmFsc2UpO1xyXG4gICAgfSxcclxuICAgIGhpZGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgdHJ1ZSk7XHJcbiAgICB9LFxyXG4gICAgZGVwZW5kT24gOiBmdW5jdGlvbihiZWZvcmVNb2RlbCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdkZXBlbmQnLCBiZWZvcmVNb2RlbC5pZCk7XHJcbiAgICAgICAgdGhpcy5iZWZvcmVNb2RlbCA9IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMubW92ZVRvU3RhcnQoYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuQmVmb3JlTW9kZWwoKTtcclxuICAgIH0sXHJcbiAgICBjbGVhckRlcGVuZGVuY2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcodGhpcy5iZWZvcmVNb2RlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudW5zZXQoJ2RlcGVuZCcpLnNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5iZWZvcmVNb2RlbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGFzUGFyZW50IDogZnVuY3Rpb24ocGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XHJcbiAgICAgICAgd2hpbGUodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IHBhcmVudEZvckNoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfbGlzdGVuQmVmb3JlTW9kZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJEZXBlbmRlbmNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXQoJ3N0YXJ0JykgPCB0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvU3RhcnQodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jaGVja05lc3RlZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcignbmVzdGVkU3RhdGVDaGFuZ2UnLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBwYXJzZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICB2YXIgc3RhcnQsIGVuZDtcclxuICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLnN0YXJ0KSl7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2Uuc3RhcnQpLCdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5zdGFydCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLmVuZCkpe1xyXG4gICAgICAgICAgICBlbmQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5lbmQpLCdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbmQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSBzdGFydCA8IGVuZCA/IHN0YXJ0IDogZW5kO1xyXG4gICAgICAgIHJlc3BvbnNlLmVuZCA9IHN0YXJ0IDwgZW5kID8gZW5kIDogc3RhcnQ7XHJcblxyXG4gICAgICAgIHJlc3BvbnNlLnBhcmVudGlkID0gcGFyc2VJbnQocmVzcG9uc2UucGFyZW50aWQgfHwgJzAnLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBudWxsIHBhcmFtc1xyXG4gICAgICAgIF8uZWFjaChyZXNwb25zZSwgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlc3BvbnNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrVGltZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnc3RhcnQnKTtcclxuICAgICAgICB2YXIgZW5kVGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdlbmQnKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhcnRUaW1lID0gY2hpbGQuZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcclxuICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUgPCBzdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGNoaWxkU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZSA+IGVuZFRpbWUpe1xyXG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IGNoaWxkRW5kVGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0Jywgc3RhcnRUaW1lKTtcclxuICAgICAgICB0aGlzLnNldCgnZW5kJywgZW5kVGltZSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrQ29tcGxldGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29tcGxldGUgPSAwO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGUgKz0gY2hpbGQuZ2V0KCdjb21wbGV0ZScpIC8gbGVuZ3RoO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXQoJ2NvbXBsZXRlJywgTWF0aC5yb3VuZChjb21wbGV0ZSkpO1xyXG4gICAgfSxcclxuICAgIG1vdmVUb1N0YXJ0IDogZnVuY3Rpb24obmV3U3RhcnQpIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5ldyBzdGFydCBpcyB0aGUgc2FtZSBhcyBjdXJyZW50XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0LnRvRGF0ZVN0cmluZygpID09PSB0aGlzLmdldCgnc3RhcnQnKS50b0RhdGVTdHJpbmcoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgb2Zmc2V0XHJcbi8vICAgICAgICB2YXIgZGF5c0RpZmYgPSBNYXRoLmZsb29yKChuZXdTdGFydC50aW1lKCkgLSB0aGlzLmdldCgnc3RhcnQnKS50aW1lKCkpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNClcclxuICAgICAgICB2YXIgZGF5c0RpZmYgPSBEYXRlLmRheXNkaWZmKG5ld1N0YXJ0LCB0aGlzLmdldCgnc3RhcnQnKSkgLSAxO1xyXG4gICAgICAgIGlmIChuZXdTdGFydCA8IHRoaXMuZ2V0KCdzdGFydCcpKSB7XHJcbiAgICAgICAgICAgIGRheXNEaWZmICo9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hhbmdlIGRhdGVzXHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydCA6IG5ld1N0YXJ0LmNsb25lKCksXHJcbiAgICAgICAgICAgIGVuZCA6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5c0RpZmYpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZXMgZGF0ZXMgaW4gYWxsIGNoaWxkcmVuXHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXNEaWZmKTtcclxuICAgIH0sXHJcbiAgICBfbW92ZUNoaWxkcmVuIDogZnVuY3Rpb24oZGF5cykge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5tb3ZlKGRheXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmVXaXRoQ2hpbGRyZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0YXNrLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBtb3ZlIDogZnVuY3Rpb24oZGF5cykge1xyXG4gICAgICAgIHRoaXMuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKSxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGFza01vZGVsO1xyXG4iLCJ2YXIgbW9udGhzQ29kZT1bJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuXG5tb2R1bGUuZXhwb3J0cy5jb3JyZWN0ZGF0ZSA9IGZ1bmN0aW9uKHN0cikge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHN0cjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdGRhdGEgPSBmdW5jdGlvbih2YWwsIHR5cGUpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmICh0eXBlID09PSAnbScpIHtcblx0XHRyZXR1cm4gbW9udGhzQ29kZVt2YWxdO1xuXHR9XG5cdHJldHVybiB2YWw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5oZnVuYyA9IGZ1bmN0aW9uKHBvcykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHtcblx0XHR4OiBwb3MueCxcblx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdH07XG59O1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSB7XG5cdHZhciBwYXJhbXMgPSB7fTtcblx0dmFyIHBybWFyciA9IHBybXN0ci5zcGxpdCgnJicpO1xuXHR2YXIgaSwgdG1wYXJyO1xuXHRmb3IgKGkgPSAwOyBpIDwgcHJtYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0dG1wYXJyID0gcHJtYXJyW2ldLnNwbGl0KCc9Jyk7XG5cdFx0cGFyYW1zW3RtcGFyclswXV0gPSB0bXBhcnJbMV07XG5cdH1cblx0cmV0dXJuIHBhcmFtcztcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0VVJMUGFyYW1zID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cdHZhciBwcm1zdHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKTtcblx0cmV0dXJuIHBybXN0ciAhPT0gbnVsbCAmJiBwcm1zdHIgIT09ICcnID8gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikgOiB7fTtcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciB0ZW1wbGF0ZSA9IFwiPGRpdiBjbGFzcz1cXFwidWkgc21hbGwgbW9kYWwgYWRkLW5ldy10YXNrIGZsaXBcXFwiPlxcclxcbiAgICA8aSBjbGFzcz1cXFwiY2xvc2UgaWNvblxcXCI+PC9pPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJoZWFkZXJcXFwiPlxcclxcbiAgICAgICAgQWRkIG5ldyBUYXNrXFxyXFxuICAgIDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJjb250ZW50XFxcIj5cXHJcXG4gICAgICAgIDxmb3JtIGNsYXNzPVxcXCJ1aSBmb3JtXFxcIiBpZD1cXFwibmV3LXRhc2stZm9ybVxcXCI+XFxyXFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidWkgZm9ybSBzZWdtZW50XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPHA+TGV0J3MgZ28gYWhlYWQgYW5kIHNldCBhIG5ldyBnb2FsLjwvcD5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlRhc2sgbmFtZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgbmFtZT1cXFwibmFtZVxcXCIgcGxhY2Vob2xkZXI9XFxcIk5ldyB0YXNrIG5hbWVcXFwiIHJlcXVpcmVkPlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkRpc2NyaXB0aW9uPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBuYW1lPVxcXCJkZXNjcmlwdGlvblxcXCIgcGxhY2Vob2xkZXI9XFxcIlRoZSBkZXRhaWxlZCBkZXNjcmlwdGlvbiBvZiB5b3VyIHRhc2tcXFwiPjwvdGV4dGFyZWE+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ0d28gZmllbGRzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+U2VsZWN0IHBhcmVudDwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcInVpIGRyb3Bkb3duIHNlbGVjdGlvblxcXCI+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgbmFtZT1cXFwicGFyZW50aWRcXFwiIGNsYXNzPVxcXCJ1aSBkcm9wZG93blxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGQgcmVzb3VyY2VzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+QXNzaWduIFJlc291cmNlczwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInR3byBmaWVsZHNcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5TdGFydCBEYXRlPC9sYWJlbD5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgbmFtZT1cXFwic3RhcnRcXFwiIHBsYWNlaG9sZGVyPVxcXCJTdGFydCBEYXRlXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5FbmQgRGF0ZTwvbGFiZWw+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcImVuZFxcXCIgcGxhY2Vob2xkZXI9XFxcIkVuZCBEYXRlXFxcIiByZXF1aXJlZD5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiY29tcGxldGVcXFwiIHZhbHVlPVxcXCIwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiYWN0aW9uXFxcIiB2YWx1ZT1cXFwiYWRkXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiZGVwZW5kZW5jeVxcXCIgdmFsdWU9XFxcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgIDwhLS08aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJhVHlwZVxcXCIgdmFsdWU9XFxcIlxcXCI+LS0+XFxyXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImhlYWx0aFxcXCIgdmFsdWU9XFxcIjIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiY29sb3JcXFwiIHZhbHVlPVxcXCJcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJtaWxlc3RvbmVcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiZGVsaXZlcmFibGVcXFwiIHZhbHVlPVxcXCIwXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwicmVwb3J0YWJsZVxcXCIgdmFsdWU9XFxcIjFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJzb3J0aW5kZXhcXFwiIHZhbHVlPVxcXCIxXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW5zZXJ0UG9zXFxcIiB2YWx1ZT1cXFwic2V0XFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwicmVmZXJlbmNlX2lkXFxcIiB2YWx1ZT1cXFwiLTFcXFwiPlxcclxcbiAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwidHdvIGZpZWxkc1xcXCI+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08bGFiZWw+U3RhdHVzPC9sYWJlbD4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGRpdiBjbGFzcz1cXFwidWkgZmx1aWQgc2VsZWN0aW9uIGRyb3Bkb3duXFxcIj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInN0YXR1c1xcXCIgcmVxdWlyZWQ+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJkZWZhdWx0IHRleHRcXFwiPlN0YXR1czwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGkgY2xhc3M9XFxcImRyb3Bkb3duIGljb25cXFwiPjwvaT4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcIm1lbnVcXFwiPi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcIml0ZW1cXFwiIGRhdGEtdmFsdWU9XFxcIjEwOFxcXCI+UmVhZHk8L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMDlcXFwiPk9wZW48L2Rpdj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS08ZGl2IGNsYXNzPVxcXCJpdGVtXFxcIiBkYXRhLXZhbHVlPVxcXCIxMTBcXFwiPkNvbXBsZXRlZDwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tPC9kaXY+LS0+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPCEtLTwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPCEtLTwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGxhYmVsPkR1cmF0aW9uPC9sYWJlbD4tLT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tPGlucHV0IHR5cGU9XFxcIm51bWJlclxcXCIgbWluPVxcXCIwXFxcIiBuYW1lPVxcXCJkdXJhdGlvblxcXCIgcGxhY2Vob2xkZXI9XFxcIlByb2plY3QgRHVyYXRpb25cXFwiIHJlcXVpcmVkIHJlYWRvbmx5Pi0tPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPCEtLTwvZGl2Pi0tPlxcclxcbiAgICAgICAgICAgICAgICA8IS0tPC9kaXY+LS0+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8L2Zvcm0+XFxyXFxuICAgIDwvZGl2PlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJhY3Rpb25zXFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInVpIGJsYWNrIGJ1dHRvbiBjYW5jZWxcXFwiPlxcclxcbiAgICAgICAgICAgIENhbmNlbFxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ1aSBwb3NpdGl2ZSByaWdodCBsYWJlbGVkIGljb24gYnV0dG9uIHNhdmVcXFwiPlxcclxcbiAgICAgICAgICAgIEFkZCBuZXcgdGFza1xcclxcbiAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJjaGVja21hcmsgaWNvblxcXCI+PC9pPlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbjwvZGl2PlwiO1xyXG5cclxudmFyIGRlbW9SZXNvdXJjZXMgPSBbe1wid2JzaWRcIjoxLFwicmVzX2lkXCI6MSxcInJlc19uYW1lXCI6XCJKb2UgQmxhY2tcIixcInJlc19hbGxvY2F0aW9uXCI6NjB9LHtcIndic2lkXCI6MyxcInJlc19pZFwiOjIsXCJyZXNfbmFtZVwiOlwiSm9obiBCbGFja21vcmVcIixcInJlc19hbGxvY2F0aW9uXCI6NDB9XTtcclxuXHJcbnZhciBBZGRGb3JtVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGFwcGVuZCBodG1sIHRvIGJvZHlcclxuICAgICAgICB0aGlzLnNldEVsZW1lbnQodGhpcy50ZW1wbGF0ZSk7XHJcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kVG8oJ2JvZHknKTtcclxuXHJcbiAgICAgICAgLy8gc2V0dXAgdmFsaWRhdGlvblxyXG4gICAgICAgICQoJy51aS5mb3JtJykuZm9ybSh0aGlzLl9mb3JtVmFsaWRhdGlvblBhcmFtcyk7XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiByYW5kb20gcGFyZW50IGNvbG9yXHJcbiAgICAgICAgJCgnaW5wdXRbbmFtZT1cImNvbG9yXCJdJykudmFsKCcjJytNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTY3NzcyMTUpLnRvU3RyaW5nKDE2KSk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGFydFwiXSwgW25hbWU9XCJlbmRcIl0nKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0nKS52YWwobmV3IERhdGUoKS50b1N0cmluZygnZGQvTU0veXl5eScpKTtcclxuICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImVuZFwiXScpLnZhbChuZXcgRGF0ZSgpLmFkZERheXMoMikudG9TdHJpbmcoJ2RkL01NL3l5eXknKSk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0sIFtuYW1lPVwiZW5kXCJdJykuZGF0ZXBpY2tlcihcInJlZnJlc2hcIik7XHJcblxyXG4vLyAgICAgICAgdGhpcy5fc2V0dXBcclxuICAgICAgICB0aGlzLl9pbml0UmVzb3VyY2VzKCk7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBkcm9wZG93blxyXG4gICAgICAgIHRoaXMuX3NldHVwUGFyZW50U2VsZWN0b3IoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3VibWl0Rm9ybShlKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFJlc291cmNlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIFJlc291cmNlcyBmcm9tIGJhY2tlbmRcclxuICAgICAgICB2YXIgJHJlc291cmNlcyA9ICc8c2VsZWN0IGlkPVwicmVzb3VyY2VzXCIgIG5hbWU9XCJyZXNvdXJjZXNbXVwiIG11bHRpcGxlPVwibXVsdGlwbGVcIj4nO1xyXG4gICAgICAgIGRlbW9SZXNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgJHJlc291cmNlcyArPSAnPG9wdGlvbiB2YWx1ZT1cIicgKyByZXNvdXJjZS5yZXNfaWQgKyAnXCI+JyArIHJlc291cmNlLnJlc19uYW1lICsgJzwvb3B0aW9uPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHJlc291cmNlcyArPSAnPC9zZWxlY3Q+JztcclxuICAgICAgICAvLyBhZGQgYmFja2VuZCB0byB0aGUgdGFzayBsaXN0XHJcbiAgICAgICAgJCgnLnJlc291cmNlcycpLmFwcGVuZCgkcmVzb3VyY2VzKTtcclxuXHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBtdWx0aXBsZSBzZWxlY3RvcnNcclxuICAgICAgICAkKCcjcmVzb3VyY2VzJykuY2hvc2VuKHt3aWR0aDogJzk1JSd9KTtcclxuICAgIH0sXHJcbiAgICBfc2V0dXBQYXJlbnRTZWxlY3RvciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkc2VsZWN0b3IgPSAkKCdbbmFtZT1cInBhcmVudGlkXCJdJyk7XHJcbiAgICAgICAgJHNlbGVjdG9yLmVtcHR5KCk7XHJcbiAgICAgICAgJHNlbGVjdG9yLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIjBcIj5NYWluIFByb2plY3Q8L29wdGlvbj4nKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHBhcnNlSW50KHRhc2suZ2V0KCdwYXJlbnRpZCcpLCAxMCk7XHJcbiAgICAgICAgICAgIGlmKHBhcmVudElkID09PSAwKXtcclxuICAgICAgICAgICAgICAgICRzZWxlY3Rvci5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgdGFzay5pZCArICdcIj4nICsgdGFzay5nZXQoJ25hbWUnKSArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJ3NlbGVjdC5kcm9wZG93bicpLmRyb3Bkb3duKCk7XHJcbiAgICB9LFxyXG4gICAgc3VibWl0Rm9ybTogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBmb3JtID0gJChcIiNuZXctdGFzay1mb3JtXCIpO1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICQoZm9ybSkuc2VyaWFsaXplQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgICAgIGRhdGFbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICAgICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICAgICAgdmFyIGluc2VydFBvcyA9IGRhdGEuaW5zZXJ0UG9zO1xyXG4gICAgICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsZWN0aW9uLmxhc3QoKSl7XHJcbiAgICAgICAgICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5jb2xsZWN0aW9uLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpICsgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzb3J0aW5kZXggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG5cclxuICAgICAgICBpZiAoZm9ybS5nZXQoMCkuY2hlY2tWYWxpZGl0eSgpKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXNrID0gdGhpcy5jb2xsZWN0aW9uLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICAgICAgICAgIHRhc2suc2F2ZSgpO1xyXG4gICAgICAgICAgICAvLyBkZWxldGUgdmlld1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDMwMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfZm9ybVZhbGlkYXRpb25QYXJhbXMgOiB7XHJcbiAgICAgICAgbmFtZToge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnbmFtZScsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2UgZW50ZXIgYSB0YXNrIG5hbWUnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBsZXRlOiB7XHJcbiAgICAgICAgICAgIGlkZW50aWZpZXI6ICdjb21wbGV0ZScsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2UgZW50ZXIgYW4gZXN0aW1hdGUgZGF5cydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ3N0YXJ0JyxcclxuICAgICAgICAgICAgcnVsZXM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogJ1BsZWFzZSBzZXQgYSBzdGFydCBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ2VuZCcsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2V0IGFuIGVuZCBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkdXJhdGlvbjoge1xyXG4gICAgICAgICAgICBpZGVudGlmaWVyOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICBydWxlczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlbXB0eScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiAnUGxlYXNlIHNldCBhIHZhbGlkIGR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGF0dXM6IHtcclxuICAgICAgICAgICAgaWRlbnRpZmllcjogJ3N0YXR1cycsXHJcbiAgICAgICAgICAgIHJ1bGVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtcHR5JyxcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6ICdQbGVhc2Ugc2VsZWN0IGEgc3RhdHVzJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWRkRm9ybVZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFNpZGVQYW5lbCA9IHJlcXVpcmUoJy4vc2lkZUJhci9TaWRlUGFuZWwnKTtcclxyXHJ2YXIgR2FudHRDaGFydFZpZXcgPSByZXF1aXJlKCcuL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3Jyk7XHJ2YXIgQWRkRm9ybVZpZXcgPSByZXF1aXJlKCcuL0FkZEZvcm1WaWV3Jyk7XHJ2YXIgVG9wTWVudVZpZXcgPSByZXF1aXJlKCcuL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3Jyk7XHJcclxydmFyIEdhbnR0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcciAgICBlbDogJy5HYW50dCcsXHIgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHIgICAgICAgIHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcciAgICAgICAgdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXSxpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS5vbignY2hhbmdlJywgdGhpcy5jYWxjdWxhdGVEdXJhdGlvbik7XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcubWVudS1jb250YWluZXInKTtcclxyICAgICAgICBuZXcgQ29udGV4dE1lbnVWaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgJCgnLm5ldy10YXNrJykuY2xpY2soZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICBuZXcgQWRkRm9ybVZpZXcoe1xyICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgICAgICB9KS5yZW5kZXIoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxyXHIgICAgICAgIG5ldyBUb3BNZW51Vmlldyh7XHIgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdzLFxyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KS5yZW5kZXIoKTtcclxyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcgPSBuZXcgR2FudHRDaGFydFZpZXcoe1xyICAgICAgICAgICAgYXBwIDogdGhpcy5hcHAsXHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuYXBwLnNldHRpbmdzXHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcucmVuZGVyKCk7XHIgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xyXHJcciAgICAgICAgdmFyIHRhc2tzQ29udGFpbmVyID0gJCgnLnRhc2tzJykuZ2V0KDApO1xyICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgKTtcclxyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQnLCBmdW5jdGlvbigpIHtcciAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZWNvbXBpbGUnKTtcciAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGFza3NDb250YWluZXIpO1xyICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxyICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2lkZVBhbmVsLCB7XHIgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgICAgICAgICB9KSxcciAgICAgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICAgICAgKTtcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBldmVudHM6IHtcciAgICAgICAgJ2NsaWNrICN0SGFuZGxlJzogJ2V4cGFuZCdcci8vICAgICAgICAnZGJsY2xpY2sgLnN1Yi10YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcci8vICAgICAgICAnZGJsY2xpY2sgLnRhc2snOiAnaGFuZGxlcm93Y2xpY2snLFxyLy8gICAgICAgICdob3ZlciAuc3ViLXRhc2snOiAnc2hvd01hc2snXHIgICAgfSxcciAgICBjYWxjdWxhdGVEdXJhdGlvbjogZnVuY3Rpb24oKXtcclxyICAgICAgICAvLyBDYWxjdWxhdGluZyB0aGUgZHVyYXRpb24gZnJvbSBzdGFydCBhbmQgZW5kIGRhdGVcciAgICAgICAgdmFyIHN0YXJ0ZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJzdGFydFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyICAgICAgICBpZihzdGFydGRhdGUgIT09IFwiXCIgJiYgZW5kZGF0ZSAhPT0gXCJcIil7XHIgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcciAgICAgICAgfWVsc2V7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigwKSk7XHIgICAgICAgIH1cciAgICB9LFxyICAgIGV4cGFuZDogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciBidXR0b24gPSAkKGV2dC50YXJnZXQpO1xyICAgICAgICBpZiAoYnV0dG9uLmhhc0NsYXNzKCdjb250cmFjdCcpKSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgIH1cciAgICAgICAgZWxzZSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgIH1cciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNjAwKTtcciAgICAgICAgYnV0dG9uLnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgIH0sXHIgICAgX21vdmVDYW52YXNWaWV3IDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHZhciBzaWRlQmFyV2lkdGggPSAkKCcubWVudS1jb250YWluZXInKS53aWR0aCgpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuc2V0TGVmdFBhZGRpbmcoc2lkZUJhcldpZHRoKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBHYW50dFZpZXc7XHIiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgTW9kYWxUYXNrRWRpdENvbXBvbmVudCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNlZGl0VGFzaycsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLiRlbC5maW5kKCcudWkuY2hlY2tib3gnKS5jaGVja2JveCgpO1xyXG4gICAgICAgIC8vIHNldHVwIHZhbHVlcyBmb3Igc2VsZWN0b3JzXHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZVNlbGVjdHMoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnRhYnVsYXIubWVudSAuaXRlbScpLnRhYigpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGFydFwiXSwgW25hbWU9XCJlbmRcIl0nKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2ZpbGxEYXRhKCk7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRlbC5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG5cclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZVNlbGVjdHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhdHVzU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGF0dXNcIl0nKTtcclxuICAgICAgICBzdGF0dXNTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgaGVhbHRoU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJoZWFsdGhcIl0nKTtcclxuICAgICAgICBoZWFsdGhTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgd29ya09yZGVyU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJ3b1wiXScpO1xyXG4gICAgICAgIHdvcmtPcmRlclNlbGVjdC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMud29kYXRhWzBdLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICQoJzxvcHRpb24gdmFsdWU9XCInICsgZGF0YS5JRCArICdcIj4nICsgZGF0YS5XT051bWJlciArICc8L29wdGlvbj4nKS5hcHBlbmRUbyh3b3JrT3JkZXJTZWxlY3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGF0dXMnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2hlYWx0aCcgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aEZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXQoMCkudmFsdWUgPSAodmFsLnRvU3RyaW5nKCdkZC9NTS95eXl5JykpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0ZXBpY2tlciggXCJyZWZyZXNoXCIgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQudmFsKHZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IGlucHV0LnZhbCgpLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBuZXcgRGF0ZSh2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0LnByb3AoJ3R5cGUnKSA9PT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC5wcm9wKCdjaGVja2VkJykpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC52YWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLm1vZGVsLnNhdmUoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsVGFza0VkaXRDb21wb25lbnQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEZpbHRlclZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZmlsdGVyLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjaGFuZ2UgI2hpZ2h0bGlnaHRzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBoaWdodGxpZ2h0VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmIChoaWdodGxpZ2h0VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB0aGlzLmNvbG9yc1tlLnRhcmdldC52YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NoYW5nZSAjZmlsdGVycy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgY3JpdGVyaWEgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKGNyaXRlcmlhID09PSAncmVzZXQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaG93VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNob3cgYWxsIHBhcmVudHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRhc2sucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29sb3JzIDoge1xyXG4gICAgICAgICdzdGF0dXMtYmFja2xvZycgOiAnI0QyRDJEOScsXHJcbiAgICAgICAgJ3N0YXR1cy1yZWFkeScgOiAnI0IyRDFGMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1wcm9ncmVzcycgOiAnIzY2QTNFMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1jb21wbGV0ZScgOiAnIzk5QzI5OScsXHJcbiAgICAgICAgJ2xhdGUnIDogJyNGRkIyQjInLFxyXG4gICAgICAgICdkdWUnIDogJyAjRkZDMjk5JyxcclxuICAgICAgICAnbWlsZXN0b25lJyA6ICcjRDZDMkZGJyxcclxuICAgICAgICAnZGVsaXZlcmFibGUnIDogJyNFMEQxQzInLFxyXG4gICAgICAgICdmaW5hbmNpYWwnIDogJyNGMEUwQjInLFxyXG4gICAgICAgICd0aW1lc2hlZXRzJyA6ICcjQzJDMkIyJyxcclxuICAgICAgICAncmVwb3J0YWJsZScgOiAnICNFMEMyQzInLFxyXG4gICAgICAgICdoZWFsdGgtcmVkJyA6ICdyZWQnLFxyXG4gICAgICAgICdoZWFsdGgtYW1iZXInIDogJyNGRkJGMDAnLFxyXG4gICAgICAgICdoZWFsdGgtZ3JlZW4nIDogJ2dyZWVuJ1xyXG4gICAgfSxcclxuICAgIF9nZXRNb2RlbHNGb3JDcml0ZXJpYSA6IGZ1bmN0aW9uKGNyZXRlcmlhKSB7XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAncmVzZXRzJykge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdzdGF0dXMnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXR1cyA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChzdGF0dXMpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnc3RhdHVzJykudG9TdHJpbmcoKSA9PT0gaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdsYXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpIDwgbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2R1ZScpIHtcclxuICAgICAgICAgICAgdmFyIGxhc3REYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgbGFzdERhdGUuYWRkV2Vla3MoMik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPiBuZXcgRGF0ZSgpICYmIHRhc2suZ2V0KCdlbmQnKSA8IGxhc3REYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFsnbWlsZXN0b25lJywgJ2RlbGl2ZXJhYmxlJywgJ2ZpbmFuY2lhbCcsICd0aW1lc2hlZXRzJywgJ3JlcG9ydGFibGUnXS5pbmRleE9mKGNyZXRlcmlhKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KGNyZXRlcmlhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdoZWFsdGgnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aCA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoSWQgPSB0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChoZWFsdGgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnaGVhbHRoJykudG9TdHJpbmcoKSA9PT0gaGVhbHRoSWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBHcm91cGluZ01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2dyb3VwaW5nLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjdG9wLWV4cGFuZC1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjbGljayAjdG9wLWNvbGxhcHNlLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JvdXBpbmdNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjcHJvamVjdC1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3VwbG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhbGVydCgnbm90IGltcGxlbWVudGVkJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI2Rvd25sb2FkLXByb2plY3QnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdub3QgaW1wbGVtZW50ZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNU1Byb2plY3RNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUmVwb3J0c01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3JlcG9ydHMtbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICNwcmludCcgOiAnZ2VuZXJhdGVQREYnXHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVQREYgOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB3aW5kb3cucHJpbnQoKTtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydHNNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBab29tTWVudVZpZXcgPSByZXF1aXJlKCcuL1pvb21NZW51VmlldycpO1xyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IHJlcXVpcmUoJy4vR3JvdXBpbmdNZW51VmlldycpO1xyXG52YXIgRmlsdGVyTWVudVZpZXcgPSByZXF1aXJlKCcuL0ZpbHRlck1lbnVWaWV3Jyk7XHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IHJlcXVpcmUoJy4vTVNQcm9qZWN0TWVudVZpZXcnKTtcclxudmFyIFJlcG9ydHNNZW51VmlldyA9IHJlcXVpcmUoJy4vUmVwb3J0c01lbnVWaWV3Jyk7XHJcblxyXG52YXIgVG9wTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgbmV3IFpvb21NZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBHcm91cGluZ01lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IEZpbHRlck1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IE1TUHJvamVjdE1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IFJlcG9ydHNNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVG9wTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFpvb21NZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyN6b29tLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAuYWN0aW9uJzogJ29uSW50ZXJ2YWxCdXR0b25DbGlja2VkJ1xyXG4gICAgfSxcclxuICAgIG9uSW50ZXJ2YWxCdXR0b25DbGlja2VkIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIHZhciBhY3Rpb24gPSBidXR0b24uZGF0YSgnYWN0aW9uJyk7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gYWN0aW9uLnNwbGl0KCctJylbMV07XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gWm9vbU1lbnVWaWV3O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2JvcmRlcldpZHRoIDogMyxcclxuICAgIF9jb2xvciA6ICcjRTZGMEZGJyxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBfLmV4dGVuZChCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5ldmVudHMoKSwge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmxlZnRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5yaWdodEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG5cclxuICAgICAgICAgICAgJ2RyYWdlbmQgLmxlZnRCb3JkZXInIDogJ3JlbmRlcicsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5yaWdodEJvcmRlcicgOiAncmVuZGVyJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLmxlZnRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5sZWZ0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLnJpZ2h0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAucmlnaHRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1pbihsb2NhbFgsIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1heChsb2NhbFgsIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfcmVzaXplUG9pbnRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2V3LXJlc2l6ZSc7XHJcbiAgICB9LFxyXG4gICAgX2NoYW5nZVNpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGVmdFggPSB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpO1xyXG4gICAgICAgIHZhciByaWdodFggPSB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSArIHRoaXMuX2JvcmRlcldpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC53aWR0aChyaWdodFggLSBsZWZ0WCk7XHJcbiAgICAgICAgcmVjdC54KGxlZnRYKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNvbXBsZXRlIHBhcmFtc1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXTtcclxuICAgICAgICBjb21wbGV0ZVJlY3QueChsZWZ0WCk7XHJcbiAgICAgICAgY29tcGxldGVSZWN0LndpZHRoKHRoaXMuX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGgoKSk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngocmlnaHRYKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSAtIHRoaXMuX2JvcmRlcldpZHRoKTtcclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsb25lVGFza1ZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEJhc2ljVGFza1ZpZXcgPSBCYWNrYm9uZS5LaW5ldGljVmlldy5leHRlbmQoe1xyXG4gICAgX2Z1bGxIZWlnaHQgOiAyMSxcclxuICAgIF90b3BQYWRkaW5nIDogMyxcclxuICAgIF9iYXJIZWlnaHQgOiAxNSxcclxuICAgIF9jb21wbGV0ZUNvbG9yIDogJyNlODgxMzQnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5fZnVsbEhlaWdodDtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX2luaXRNb2RlbEV2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZScgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQubm9kZVR5cGUgIT09ICdHcm91cCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2F2ZVdpdGhDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ21vdXNlb3ZlcicgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93RGVwZW5kZW5jeVRvb2woKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dyYWJQb2ludGVyKGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VvdXQnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlRGVwZW5kZW5jeVRvb2woKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRNb3VzZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ3N0YXJ0IC5kZXBlbmRlbmN5VG9vbCcgOiAnX3N0YXJ0Q29ubmVjdGluZycsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAuZGVwZW5kZW5jeVRvb2wnIDogJ19tb3ZlQ29ubmVjdCcsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5kZXBlbmRlbmN5VG9vbCcgOiAnX2NyZWF0ZURlcGVuZGVuY3knXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3lcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgaWQgOiB0aGlzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgbmFtZSA6ICdtYWluUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgY29tcGxldGVSZWN0ID0gbmV3IEtpbmV0aWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb21wbGV0ZUNvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2NvbXBsZXRlUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGFyYyA9IG5ldyBLaW5ldGljLlNoYXBlKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgZmlsbCA6ICdncmVlbicsXHJcbiAgICAgICAgICAgIGRyYXdGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoMCwgc2VsZi5fYmFySGVpZ2h0IC8gMiwgc2VsZi5fYmFySGVpZ2h0IC8gMiwgLSBNYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbygwLCBzZWxmLl9iYXJIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3Ryb2tlU2hhcGUodGhpcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5hbWUgOiAnZGVwZW5kZW5jeVRvb2wnLFxyXG4gICAgICAgICAgICB2aXNpYmxlIDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkKHJlY3QsIGNvbXBsZXRlUmVjdCwgYXJjKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZURhdGVzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSByZWN0LndpZHRoKCk7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmVsLngoKSArIHJlY3QueCgpO1xyXG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGgucm91bmQoeCAvIGRheXNXaWR0aCksIGRheXMyID0gTWF0aC5yb3VuZCgoeCArIGxlbmd0aCkgLyBkYXlzV2lkdGgpO1xyXG5cclxuICAgICAgICB0aGlzLm1vZGVsLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpLFxyXG4gICAgICAgICAgICBlbmQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMiAtIDEpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3Nob3dEZXBlbmRlbmN5VG9vbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF0uc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2dyYWJQb2ludGVyIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBuYW1lID0gZS50YXJnZXQubmFtZSgpO1xyXG4gICAgICAgIGlmICgobmFtZSAhPT0gJ21haW5SZWN0JykgJiYgKG5hbWUgIT09ICdkZXBlbmRlbmN5VG9vbCcpICYmIChuYW1lICE9PSAnY29tcGxldGVSZWN0JykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgIH0sXHJcbiAgICBfZGVmYXVsdE1vdXNlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XHJcbiAgICB9LFxyXG4gICAgX2hpZGVEZXBlbmRlbmN5VG9vbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF0uaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX3N0YXJ0Q29ubmVjdGluZyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC5oaWRlKCk7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRvb2wuZ2V0QWJzb2x1dGVQb3NpdGlvbigpO1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSBuZXcgS2luZXRpYy5MaW5lKHtcclxuICAgICAgICAgICAgc3Ryb2tlIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAxLFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbcG9zLnggLSBzdGFnZS54KCksIHBvcy55LCBwb3MueCAtIHN0YWdlLngoKSwgcG9zLnldLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2Nvbm5lY3RvcidcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYWRkKGNvbm5lY3Rvcik7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ29ubmVjdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgcG9pbnRzID0gY29ubmVjdG9yLnBvaW50cygpO1xyXG4gICAgICAgIHBvaW50c1syXSA9IHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLnggLSBzdGFnZS54KCk7XHJcbiAgICAgICAgcG9pbnRzWzNdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueTtcclxuICAgICAgICBjb25uZWN0b3IucG9pbnRzKHBvaW50cyk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZURlcGVuZGVuY3kgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBlbCA9IHN0YWdlLmdldEludGVyc2VjdGlvbihzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKSk7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gZWwgJiYgZWwuZ2V0UGFyZW50KCk7XHJcbiAgICAgICAgdmFyIHRhc2tJZCA9IGdyb3VwICYmIGdyb3VwLmlkKCk7XHJcbiAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5tb2RlbDtcclxuICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5nZXQodGFza0lkKTtcclxuICAgICAgICBpZiAoYWZ0ZXJNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHJlbW92ZUZvciA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5maW5kKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlbW92ZUZvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLnJlbW92ZURlcGVuZGVuY3kocmVtb3ZlRm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZG9uJ3QgdXBkYXRlIGVsZW1lbnQgd2hpbGUgZHJhZ2dpbmdcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGRyYWdnaW5nID0gdGhpcy5lbC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZ2V0Q2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZyA9IGRyYWdnaW5nIHx8IGNoaWxkLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVYIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSAtIDEpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdlbmQnKSkpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlQ29tcGxldGVXaWR0aCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHJldHVybiAoeC54MiAtIHgueDEpICogdGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDA7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgLy8gbW92ZSBncm91cFxyXG4gICAgICAgIHRoaXMuZWwueCh4LngxKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIG1haW4gcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC54KDApO1xyXG4gICAgICAgIHJlY3Qud2lkdGgoeC54MiAtIHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS54KDApO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHgueDIgLSB4LngxKTtcclxuICAgICAgICB0b29sLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc2V0WSA6IGZ1bmN0aW9uKHkpIHtcclxuICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB0aGlzLmVsLnkoeSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0WSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl95O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzaWNUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBDb25uZWN0b3JWaWV3ID0gQmFja2JvbmUuS2luZXRpY1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9jb2xvciA6ICdncmV5JyxcclxuICAgIF93cm9uZ0NvbG9yIDogJ3JlZCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5iZWZvcmVNb2RlbCA9IHBhcmFtcy5iZWZvcmVNb2RlbDtcclxuICAgICAgICB0aGlzLmFmdGVyTW9kZWwgPSBwYXJhbXMuYWZ0ZXJNb2RlbDtcclxuICAgICAgICB0aGlzLl95MSA9IDA7XHJcbiAgICAgICAgdGhpcy5feTIgPSAwO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRNb2RlbEV2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxpbmUgPSBuZXcgS2luZXRpYy5MaW5lKHtcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAyLFxyXG4gICAgICAgICAgICBzdHJva2UgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbMCwwLDAsMF1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGluZTtcclxuICAgIH0sXHJcbiAgICBzZXRZMSA6IGZ1bmN0aW9uKHkxKSB7XHJcbiAgICAgICAgdGhpcy5feTEgPSB5MTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHNldFkyIDogZnVuY3Rpb24oeTIpIHtcclxuICAgICAgICB0aGlzLl95MiA9IHkyO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgaWYgKHgueDIgPj0geC54MSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFt4LngxLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MiwgeC54MiwgdGhpcy5feTJdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl93cm9uZ0NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW1xyXG4gICAgICAgICAgICAgICAgeC54MSwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTIsXHJcbiAgICAgICAgICAgICAgICB4LngyLCB0aGlzLl95MlxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYWZ0ZXJNb2RlbC5nZXQoJ3N0YXJ0JykpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvclZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSByZXF1aXJlKCcuL05lc3RlZFRhc2tWaWV3Jyk7XHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gcmVxdWlyZSgnLi9BbG9uZVRhc2tWaWV3Jyk7XHJcbnZhciBDb25uZWN0b3JWaWV3ID0gcmVxdWlyZSgnLi9Db25uZWN0b3JWaWV3Jyk7XHJcblxyXG52YXIgR2FudHRDaGFydFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyNnYW50dC1jb250YWluZXInLFxyXG4gICAgX3RvcFBhZGRpbmcgOiA3MyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gW107XHJcbiAgICAgICAgdGhpcy5faW5pdFN0YWdlKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdExheWVycygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRCYWNrZ3JvdW5kKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFN1YlZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdENvbGxlY3Rpb25FdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBzZXRMZWZ0UGFkZGluZyA6IGZ1bmN0aW9uKG9mZnNldCkge1xyXG4gICAgICAgIHRoaXMuX2xlZnRQYWRkaW5nID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN0YWdlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZSA9IG5ldyBLaW5ldGljLlN0YWdlKHtcclxuICAgICAgICAgICAgY29udGFpbmVyIDogdGhpcy5lbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdExheWVycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuRmxheWVyID0gbmV3IEtpbmV0aWMuTGF5ZXIoKTtcclxuICAgICAgICB0aGlzLkJsYXllciA9IG5ldyBLaW5ldGljLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIsIHRoaXMuRmxheWVyKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlU3RhZ2VBdHRycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5zZXRBdHRycyh7XHJcbiAgICAgICAgICAgIHggOiB0aGlzLl9sZWZ0UGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heCgkKFwiLnRhc2tzXCIpLmlubmVySGVpZ2h0KCkgKyB0aGlzLl90b3BQYWRkaW5nLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAkKHRoaXMuc3RhZ2UuZ2V0Q29udGFpbmVyKCkpLm9mZnNldCgpLnRvcCksXHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLiRlbC5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYzogIGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHg7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluWCA9IC0gKGxpbmVXaWR0aCAtIHRoaXMud2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9zLnggPiBzZWxmLl9sZWZ0UGFkZGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBzZWxmLl9sZWZ0UGFkZGluZztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zLnggPCBtaW5YKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IG1pblg7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBwb3MueDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcclxuICAgICAgICAgICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRCYWNrZ3JvdW5kIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlID0gbmV3IEtpbmV0aWMuU2hhcGUoe1xyXG4gICAgICAgICAgICBzY2VuZUZ1bmM6IHRoaXMuX2dldFNjZW5lRnVuY3Rpb24oKSxcclxuICAgICAgICAgICAgc3Ryb2tlOiAnbGlnaHRncmF5JyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgd2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcbiAgICAgICAgdmFyIGJhY2sgPSBuZXcgS2luZXRpYy5SZWN0KHtcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5zdGFnZS5oZWlnaHQoKSxcclxuICAgICAgICAgICAgd2lkdGggOiB3aWR0aFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLkJsYXllci5hZGQoYmFjaykuYWRkKHNoYXBlKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ2V0U2NlbmVGdW5jdGlvbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzZGlzcGxheSA9IHRoaXMuc2V0dGluZ3Muc2Rpc3BsYXk7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgYm9yZGVyV2lkdGggPSBzZGlzcGxheS5ib3JkZXJXaWR0aCB8fCAxO1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSAxO1xyXG4gICAgICAgIHZhciByb3dIZWlnaHQgPSAyMDtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0KXtcclxuICAgICAgICAgICAgdmFyIGksIHMsIGlMZW4gPSAwLFx0ZGF5c1dpZHRoID0gc2F0dHIuZGF5c1dpZHRoLCB4LFx0bGVuZ3RoLFx0aERhdGEgPSBzYXR0ci5oRGF0YTtcclxuICAgICAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIC8vZHJhdyB0aHJlZSBsaW5lc1xyXG4gICAgICAgICAgICBmb3IoaSA9IDE7IGkgPCA0IDsgaSsrKXtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhsaW5lV2lkdGggKyBvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgeWkgPSAwLCB5ZiA9IHJvd0hlaWdodCwgeGkgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHMgPSAxOyBzIDwgMzsgcysrKXtcclxuICAgICAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzEwcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5ZiAtIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeWkgPSB5ZjsgeWYgPSB5ZiArIHJvd0hlaWdodDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7IHMgPSAzOyB5ZiA9IDEyMDA7XHJcbiAgICAgICAgICAgIHZhciBkcmFnSW50ID0gcGFyc2VJbnQoc2F0dHIuZHJhZ0ludGVydmFsLCAxMCk7XHJcbiAgICAgICAgICAgIHZhciBoaWRlRGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiggZHJhZ0ludCA9PT0gMTQgfHwgZHJhZ0ludCA9PT0gMzApe1xyXG4gICAgICAgICAgICAgICAgaGlkZURhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBoRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnNnB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZGVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzFwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5aSArIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdyZW1vdmUnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVZpZXdGb3JNb2RlbCh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gd2FpdCBmb3IgbGVmdCBwYW5lbCB1cGRhdGVzXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2NoYW5nZTpkZXBlbmQnLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnZGVwZW5kJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3RvclZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDb25uZWN0b3IodGFzayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ25lc3RlZFN0YXRlQ2hhbmdlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9yZW1vdmVWaWV3Rm9yTW9kZWwgOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHZhciB0YXNrVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IG1vZGVsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVZpZXcodGFza1ZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZW1vdmVWaWV3IDogZnVuY3Rpb24odGFza1ZpZXcpIHtcclxuICAgICAgICB0YXNrVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBfLndpdGhvdXQodGhpcy5fdGFza1ZpZXdzLCB0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZUNvbm5lY3RvciA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5hZnRlck1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbm5lY3RvclZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBfLndpdGhvdXQodGhpcy5fY29ubmVjdG9yVmlld3MsIGNvbm5lY3RvclZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3ViVmlld3MgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB0aGlzLkZsYXllci5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFRhc2tWaWV3IDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciB2aWV3O1xyXG4gICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgdmlldyA9IG5ldyBOZXN0ZWRUYXNrVmlldyh7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlldyA9IG5ldyBBbG9uZVRhc2tWaWV3KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzLnB1c2godmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2FkZENvbm5lY3RvclZpZXcgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIGRlcGVuZElkID0gdGFzay5nZXQoJ2RlcGVuZCcpO1xyXG4gICAgICAgIGlmICghZGVwZW5kSWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBDb25uZWN0b3JWaWV3KHtcclxuICAgICAgICAgICAgYmVmb3JlTW9kZWwgOiB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRlcGVuZElkKSxcclxuICAgICAgICAgICAgYWZ0ZXJNb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcclxuICAgICAgICB2aWV3LmVsLm1vdmVUb0JvdHRvbSgpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MucHVzaCh2aWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVzb3J0Vmlld3MgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGFzdFkgPSB0aGlzLl90b3BQYWRkaW5nO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2aWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2aWV3LnNldFkobGFzdFkpO1xyXG4gICAgICAgICAgICBsYXN0WSArPSB2aWV3LmhlaWdodDtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIGRlcGVuZElkID0gdGFzay5nZXQoJ2RlcGVuZCcpO1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpIHx8ICFkZXBlbmRJZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGVwZW5kSWQpO1xyXG4gICAgICAgICAgICB2YXIgYmVmb3JlVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBiZWZvcmVNb2RlbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBhZnRlclZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5iZWZvcmVNb2RlbCA9PT0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25uZWN0b3JWaWV3LnNldFkxKGJlZm9yZVZpZXcuZ2V0WSgpICsgYmVmb3JlVmlldy5fZnVsbEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICBjb25uZWN0b3JWaWV3LnNldFkyKGFmdGVyVmlldy5nZXRZKCkgICsgYWZ0ZXJWaWV3Ll9mdWxsSGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLkZsYXllci5kcmF3KCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW50dENoYXJ0VmlldzsiLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9jb2xvciA6ICcjYjNkMWZjJyxcclxuICAgIF9ib3JkZXJTaXplIDogNixcclxuICAgIF9iYXJIZWlnaHQgOiAxMCxcclxuICAgIF9jb21wbGV0ZUNvbG9yIDogJyNDOTVGMTAnLFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtpbmV0aWMuTGluZSh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFswLCAwLCB0aGlzLl9ib3JkZXJTaXplICogMS41LCAwLCAwLCB0aGlzLl9ib3JkZXJTaXplXSxcclxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS2luZXRpYy5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWy10aGlzLl9ib3JkZXJTaXplICogMS41LCAwLCAwLCAwLCAwLCB0aGlzLl9ib3JkZXJTaXplXSxcclxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBncm91cCBpcyBtb3ZlZFxyXG4gICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZGV0ZWN0IGludGVydmFsXHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmVsLngoKSArIHJlY3QueCgpO1xyXG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCk7XHJcbiAgICAgICAgdmFyIG5ld1N0YXJ0ID0gYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKTtcclxuICAgICAgICB0aGlzLm1vZGVsLm1vdmVUb1N0YXJ0KG5ld1N0YXJ0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEpO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVdpZHRoID0gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgICAgIGlmIChjb21wbGV0ZVdpZHRoID4gdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHgueDIgLSB4LngxKSAtIGNvbXBsZXRlV2lkdGggPCB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTW9kYWxFZGl0ID0gcmVxdWlyZSgnLi4vTW9kYWxUYXNrRWRpdFZpZXcnKTtcclxuXHJcbmZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhwYXJhbXMpIHtcclxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHBhcmFtcy5jb2xsZWN0aW9uO1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ3VsJyxcclxuICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cignaWQnKSB8fCAkKHRoaXMpLmRhdGEoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuY29sbGVjdGlvbi5nZXQoaWQpO1xyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdkZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdwcm9wZXJ0aWVzJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBNb2RhbEVkaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsIDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MgOiBzZWxmLnNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3Jvd0Fib3ZlJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayhkYXRhLCAnYWJvdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdyb3dCZWxvdycpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfSwgJ2JlbG93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2luZGVudCcpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29sbGVjdGlvbi5pbmRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdvdXRkZW50Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24ub3V0ZGVudChtb2RlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIFwicm93QWJvdmVcIjogeyBuYW1lOiBcIiZuYnNwO05ldyBSb3cgQWJvdmVcIiwgaWNvbjogXCJhYm92ZVwiIH0sXHJcbiAgICAgICAgICAgIFwicm93QmVsb3dcIjogeyBuYW1lOiBcIiZuYnNwO05ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJiZWxvd1wiIH0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHsgbmFtZTogXCImbmJzcDtJbmRlbnQgUm93XCIsIGljb246IFwiaW5kZW50XCIgfSxcclxuICAgICAgICAgICAgXCJvdXRkZW50XCI6IHsgbmFtZTogXCImbmJzcDtPdXRkZW50IFJvd1wiLCBpY29uOiBcIm91dGRlbnRcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDFcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHsgbmFtZTogXCImbmJzcDtQcm9wZXJ0aWVzXCIsIGljb246IFwicHJvcGVydGllc1wiIH0sXHJcbiAgICAgICAgICAgIFwic2VwMlwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcImRlbGV0ZVwiOiB7IG5hbWU6IFwiJm5ic3A7RGVsZXRlIFJvd1wiLCBpY29uOiBcImRlbGV0ZVwiIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUuYWRkVGFzayA9IGZ1bmN0aW9uKGRhdGEsIGluc2VydFBvcykge1xyXG4gICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkYXRhLnJlZmVyZW5jZV9pZCk7XHJcbiAgICBpZiAocmVmX21vZGVsKSB7XHJcbiAgICAgICAgc29ydGluZGV4ID0gcmVmX21vZGVsLmdldCgnc29ydGluZGV4JykgKyAoaW5zZXJ0UG9zID09PSAnYWJvdmUnID8gLTAuNSA6IDAuNSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmFwcC50YXNrcy5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgfVxyXG4gICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcbiAgICBkYXRhLnBhcmVudGlkID0gcmVmX21vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgIHZhciB0YXNrID0gdGhpcy5jb2xsZWN0aW9uLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICB0YXNrLnNhdmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udGV4dE1lbnVWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIERhdGVQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZSA6ICdEYXRlUGlja2VyJyxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoe1xyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCIsXHJcbiAgICAgICAgICAgIG9uU2VsZWN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0IDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ3Nob3cnKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdkZXN0cm95Jyk7XHJcbiAgICB9LFxyXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkudmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlLnRvU3RyaW5nKCdkZC9tbS95eScpO1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoIFwicmVmcmVzaFwiICk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEYXRlUGlja2VyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xyXG5cclxudmFyIE5lc3RlZFRhc2sgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZSA6ICdOZXN0ZWRUYXNrJyxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZTpoaWRkZW4gY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN1YnRhc2tzID0gdGhpcy5wcm9wcy5tb2RlbC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAgaXNTdWJUYXNrIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWJUYXNrIDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrLWxpc3QtY29udGFpbmVyIGRyYWctaXRlbScgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICBpZCA6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbCA6IHRoaXMucHJvcHMubW9kZWxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnc3ViLXRhc2stbGlzdCBzb3J0YWJsZSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN1YnRhc2tzXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXN0ZWRUYXNrO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcclxudmFyIE5lc3RlZFRhc2sgPSByZXF1aXJlKCcuL05lc3RlZFRhc2snKTtcclxuXHJcbmZ1bmN0aW9uIGdldERhdGEoY29udGFpbmVyKSB7XHJcbiAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgdmFyIGNoaWxkcmVuID0gJCgnPG9sPicgKyBjb250YWluZXIuZ2V0KDApLmlubmVySFRNTCArICc8L29sPicpLmNoaWxkcmVuKCk7XHJcbiAgICBfLmVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgdmFyICRjaGlsZCA9ICQoY2hpbGQpO1xyXG4gICAgICAgIHZhciBvYmogPSB7XHJcbiAgICAgICAgICAgIGlkIDogJGNoaWxkLmRhdGEoJ2lkJyksXHJcbiAgICAgICAgICAgIGNoaWxkcmVuIDogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBzdWJsaXN0ID0gJGNoaWxkLmZpbmQoJ29sJyk7XHJcbiAgICAgICAgaWYgKHN1Ymxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIG9iai5jaGlsZHJlbiA9IGdldERhdGEoc3VibGlzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEucHVzaChvYmopO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZGF0YTtcclxufVxyXG5cclxudmFyIFNpZGVQYW5lbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lOiAnU2lkZVBhbmVsJyxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignYWRkIHJlbW92ZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX21ha2VTb3J0YWJsZSgpO1xyXG4gICAgfSxcclxuICAgIF9tYWtlU29ydGFibGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gJCgnLnRhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgY29udGFpbmVyLnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgZ3JvdXA6ICdzb3J0YWJsZScsXHJcbiAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yIDogJ29sJyxcclxuICAgICAgICAgICAgaXRlbVNlbGVjdG9yIDogJy5kcmFnLWl0ZW0nLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlciBzb3J0LXBsYWNlaG9sZGVyXCIvPicsXHJcbiAgICAgICAgICAgIG9uRHJhZ1N0YXJ0IDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uRHJhZyA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwbGFjZWhvbGRlciA9ICQoJy5zb3J0LXBsYWNlaG9sZGVyJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNTdWJUYXNrID0gISQoJHBsYWNlaG9sZGVyLnBhcmVudCgpKS5oYXNDbGFzcygndGFzay1jb250YWluZXInKTtcclxuICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnIDogaXNTdWJUYXNrID8gJzMwcHgnIDogJzAnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uRHJvcCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZ2V0RGF0YShjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5yZXNvcnQoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyID0gJCgnPGRpdj4nKTtcclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmQgOiAnZ3JleScsXHJcbiAgICAgICAgICAgIG9wYWNpdHkgOiAnMC41JyxcclxuICAgICAgICAgICAgbGlmdCA6ICcwJyxcclxuICAgICAgICAgICAgdG9wIDogJzAnLFxyXG4gICAgICAgICAgICB3aWR0aCA6ICcxMDAlJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBjb250YWluZXIubW91c2VvdmVyKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgICAgICB2YXIgcG9zID0gJGVsLm9mZnNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wIDogcG9zLnRvcCArICdweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgOiAkZWwuaGVpZ2h0KClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICBjb250YWluZXIubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICByZXF1ZXN0VXBkYXRlIDogKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgd2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KCkpLFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLnRhc2stY29udGFpbmVyJykuc29ydGFibGUoXCJkZXN0cm95XCIpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2tcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdvbCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzay1jb250YWluZXIgc29ydGFibGUnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGFza3NcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaWRlUGFuZWw7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vRGF0ZVBpY2tlcicpO1xyXG5cclxudmFyIFRhc2tJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnVGFza0l0ZW0nLFxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZWRpdFJvdyA6IHVuZGVmaW5lZFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBfZmluZE5lc3RlZExldmVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxldmVsID0gMDtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wcm9wcy5tb2RlbC5wYXJlbnQ7XHJcbiAgICAgICAgd2hpbGUodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldmVsKys7XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9jcmVhdGVGaWVsZCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRSb3cgPT09IGNvbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRWRpdEZpZWxkKGNvbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVSZWFkRmlsZWQoY29sKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlUmVhZEZpbGVkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcclxuICAgICAgICBpZiAoY29sID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKSArICclJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSwgbW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEYXRlRWxlbWVudCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoY29sLCBuZXdWYWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9kdXJhdGlvbkNoYW5nZSA6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG51bWJlciA9IHBhcnNlSW50KHZhbHVlLnJlcGxhY2UoIC9eXFxEKy9nLCAnJyksIDEwKTtcclxuICAgICAgICBpZiAoIW51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCd3JykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRXZWVrcyhudW1iZXIpKTtcclxuICAgICAgICB9IGVsc2UgIGlmICh2YWx1ZS5pbmRleE9mKCdtJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRNb250aHMobnVtYmVyKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbnVtYmVyLS07XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMobnVtYmVyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEdXJhdGlvbkZpZWxkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IERhdGUuZGF5c2RpZmYodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JyksIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogdGhpcy5zdGF0ZS52YWwgfHwgdmFsLFxyXG4gICAgICAgICAgICBrZXkgOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2R1cmF0aW9uQ2hhbmdlKG5ld1ZhbCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudmFsID0gbmV3VmFsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUudmFsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRWRpdEZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlRWxlbWVudChjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEdXJhdGlvbkZpZWxkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3VsJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2sgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBlLnRhcmdldC5jbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2wgPSBjbGFzc05hbWUuc2xpY2UoNCwgY2xhc3NOYW1lLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSBjb2w7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcicgOiB0aGlzLnByb3BzLm1vZGVsLmdldCgnaGlnaHRsaWdodCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiAnbmFtZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtbmFtZSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuaXNOZXN0ZWQoKSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2knLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0cmlhbmdsZSBpY29uICcgKyAodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpID8gJ3JpZ2h0JyA6ICdkb3duJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2sgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdjb2xsYXBzZWQnLCAhdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgOiAodGhpcy5fZmluZE5lc3RlZExldmVsKCkgKiAxMCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpZWxkKCduYW1lJykpXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2NvbXBsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWNvbXBsZXRlJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2NvbXBsZXRlJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3N0YXJ0JyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXN0YXJ0J1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ3N0YXJ0JykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2VuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1lbmQnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnZW5kJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3N0YXR1cycsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1zdGF0dXMnXHJcbiAgICAgICAgICAgICAgICB9LCBtb2RlbC5nZXQoJ3N0YXR1cycpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdkdXJhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1kdXJhdGlvbidcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdkdXJhdGlvbicpKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGFza0l0ZW07XHJcbiJdfQ==
