(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    "cfgdata":[
        {
            "Category":"Task Health",
            "data":[
                {
                    "ID":15027,
                    "cfg_item":"Green",
                    "SortOrder":0,
                    "cDefault":true,
                    "Alias":""
                },
                {
                    "ID":15028,
                    "cfg_item":"Amber",
                    "SortOrder":1,
                    "cDefault":false,
                    "Alias":""
                },
                {
                    "ID":15029,
                    "cfg_item":"Red",
                    "SortOrder":2,
                    "cDefault":false,
                    "Alias":""
                }
            ]
        },
        {
            "Category":"Task Status",
            "data":[
                {
                    "ID":23,
                    "cfg_item":"In Progress",
                    "SortOrder":2,
                    "cDefault":false,
                    "Alias":""
                },
                {
                    "ID":24,
                    "cfg_item":"Complete",
                    "SortOrder":3,
                    "cDefault":false,
                    "Alias":""
                },
                {
                    "ID":218,
                    "cfg_item":"Ready",
                    "SortOrder":1,
                    "cDefault":false,
                    "Alias":""
                },
                {
                    "ID":15026,
                    "cfg_item":"Backlog",
                    "SortOrder":0,
                    "cDefault":true,
                    "Alias":""
                }
            ]
        }
    ],
    "wodata":[
        {
            "WONumber":"WorkOrders",
            "data":[
                {
                    "ID":43,
                    "WONumber":"WO10018",
                    "SortOrder":43
                }
            ]
        }
    ],
    "resourcedata":[
        {
            "UserId":1,
            "Username":"Greg Vandeligt",
            "JobTitle":"Program Manager"
        },
        {
            "UserId":58,
            "Username":"James Gumley",
            "JobTitle":"Project Manager"
        },
        {
            "UserId":2,
            "Username":"Lucy Minota",
            "JobTitle":null
        },
        {
            "UserId":59,
            "Username":"Rob Tynan",
            "JobTitle":"Business Analyst"
        }
    ]
};

},{}],2:[function(require,module,exports){
"use strict";

var ResourceReferenceModel = require('../models/ResourceReference');

var util = require('../utils/util');
var params = util.getURLParams();

var Collection = Backbone.Collection.extend({
    url : 'api/resources/' + (params.project || 1) + '/' + (params.profile || 1),
	model: ResourceReferenceModel,
    idAttribute : 'ID',
    updateResourcesForTask : function(task) {
        // remove old references
        this.toArray().forEach(function(ref) {
            if (ref.get('WBSID').toString() !== task.id.toString()) {
                return;
            }
            var isOld = task.get('resources').indexOf(ref.get('ResID'));
            if (isOld) {
                ref.destroy();
            }
        }, this);
        // add new references
        task.get('resources').forEach(function(resId) {
            var isExist = this.findWhere({ResID : resId});
            if (!isExist) {
                this.add({
                    ResID : resId,
                    WBSID : task.id.toString()
                }).save();
            }
        }.bind(this));
    },
    parse : function(res) {
        var result  = [];
        res.forEach(function(item) {
            item.Resources.forEach(function(resItem) {
                var obj = resItem;
                obj.WBSID = item.WBSID;
                result.push(obj);
            });
        });
        return result;
    }
});

module.exports = Collection;


},{"../models/ResourceReference":5,"../utils/util":8}],3:[function(require,module,exports){
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
	},
    importTasks : function(taskJSONarray, callback) {
    	var sortindex = 0;
    	if (this.last()) {
			sortindex = this.last().get('sortindex');
    	}
        taskJSONarray.forEach(function(taskItem) {
            taskItem.sortindex =  ++sortindex;
        }.bind(this));
        var length = taskJSONarray.length;
        var done = 0;
        this.add(taskJSONarray, {parse : true}).forEach(function(task) {
            task.save({},{
                success : function() {
                    done +=1;
                    if (done === length) {
                        callback();
                    }
                }
            });
        });
    },
    createDeps : function(data) {

        data.deps.forEach(function(dep) {
            var beforeModel = this.findWhere({
                name : dep[0]
            });
            var afterModel = this.findWhere({
                name : dep[1]
            });
            this.createDependency(beforeModel, afterModel);
        }.bind(this));
        data.parents.forEach(function(item) {
            var parent = this.findWhere({
                name : item[0]
            });
            var child = this.findWhere({
                name : item[1]
            });
            child.save('parentid', parent.id);;
        }.bind(this));
    }
});

module.exports = TaskCollection;


},{"../models/TaskModel":7}],4:[function(require,module,exports){
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

            // load statuses settings
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
},{"./collections/taskCollection":3,"./models/SettingModel":6,"./utils/util":8,"./views/GanttView":10}],5:[function(require,module,exports){
"use strict";

var util = require('../utils/util');
var params = util.getURLParams();

var ResourceReference = Backbone.Model.extend({
    defaults: {
        // main params
        WBSID : 1, // task id
        ResID: 1, // resource id
        TSActivate: true,

        // some server params
        WBSProfileID : params.profile,
        WBS_ID : params.profile,
        PartitNo : '2b00da46b57c0395', // have no idea what is that
        ProjectRef : params.project,
        sitekey: params.sitekey

    },
    initialize : function() {

    }
});

module.exports = ResourceReference;

},{"../utils/util":8}],6:[function(require,module,exports){
"use strict";

var util = require('../utils/util');
var testStatuses = require('../../../data/config');

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
        this.listenTo(this.collection, 'add change:end', _.debounce(function() {
            this.calculateIntervals();
            this.trigger('change:width');
        }, 500));
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
    findDefaulWOId : function() {
        return this.statuses.wodata[0].data[0].ID;
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
			end = sattr.maxDate.clone().addDays(60);
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
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20).moveToDayOfWeek(1, -1);
			sattr.daysWidth = 5;
			sattr.cellWidth = sattr.daysWidth * 7;
			sattr.dragInterval = sattr.daysWidth;
			sattr.mpc = 1;
			retfunc = function(date){
				return date.clone().addDays(7);
			};
		} else if (interval === 'monthly') {
			this.set('dpi', 30, {silent: true});
			end = sattr.maxDate.clone().addDays(12 * 30);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20).moveToFirstDayOfMonth();
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
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20);
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
			end = sattr.maxDate.clone().addDays(30 * 10);
			sattr.mpc = Math.max(1, Math.round(dpi / 30));
			retfunc = function(date){
				return date.clone().addDays(dpi);
			};
		} else if (interval==='auto') {
			dpi = this.get('dpi');
			sattr.cellWidth = (1 + Math.log(dpi)) * 12;
			sattr.daysWidth = sattr.cellWidth / dpi;
			sattr.boundaryMin = sattr.minDate.clone().addDays(-20 * dpi);
			end = sattr.maxDate.clone().addDays(30 * 10);
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

        console.log(end);
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

},{"../../../data/config":1,"../utils/util":8}],7:[function(require,module,exports){
"use strict";

var ResCollection = require('../collections/ResourceReferenceCollection');

var util = require('../utils/util');
var params = util.getURLParams();

var SubTasks = Backbone.Collection.extend({
    comparator : function(model) {
        return model.get('sortindex');
    }
});

var resLinks = new ResCollection();
resLinks.fetch();

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
            this.children.toArray().forEach(function(child) {
                child.destroy();
            });
            this.stopListening();
        });

        // checking nested state
        this.listenTo(this.children, 'add remove', this._checkNested);

        // time checking
        this.listenTo(this.children, 'add remove change:complete', this._checkComplete);

        this.listenTo(this, 'change:resources', function() {
            resLinks.updateResourcesForTask(this);
        });
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
        if (this.get('start') < beforeModel.get('end')) {
            this.moveToStart(beforeModel.get('end'));
        }
        this.save();
        this._listenBeforeModel();
    },
    toJSON : function() {
        var json = Backbone.Model.prototype.toJSON.call(this);
        delete json.resources;
        delete json.hidden;
        delete json.collapsed;
        delete json.hightlight;
        return json;
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
            // check infinite depend loop
            var before = this;
            var befores = [];
            while(true) {
                before = before.beforeModel;
                if (!before) {
                    break;
                }
                if (befores.indexOf(before) !== -1) {
                    return;
                }
                befores.push(before);
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

        // update resources as list of ID
        var ids = [];
        (response.Resources || []).forEach(function(resInfo) {
            ids.push(resInfo.ResID);
        });
        response.Resources = undefined;
        response.resources = ids;
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

},{"../collections/ResourceReferenceCollection":2,"../utils/util":8}],8:[function(require,module,exports){
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


},{}],9:[function(require,module,exports){
"use strict";


var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n<Project xmlns=\"http://schemas.microsoft.com/project\">\r\n    <SaveVersion>14</SaveVersion>\r\n    <Name>Gantt Tasks.xml</Name>\r\n    <Title>Gantt Tasks</Title>\r\n    <CreationDate><%= currentDate %></CreationDate>\r\n    <LastSaved><%= currentDate %></LastSaved>\r\n    <ScheduleFromStart>1</ScheduleFromStart>\r\n    <StartDate><%= startDate %></StartDate>\r\n    <FinishDate><%= finishDate %></FinishDate>\r\n    <FYStartDate>1</FYStartDate>\r\n    <CriticalSlackLimit>0</CriticalSlackLimit>\r\n    <CurrencyDigits>2</CurrencyDigits>\r\n    <CurrencySymbol>$</CurrencySymbol>\r\n    <CurrencyCode>USD</CurrencyCode>\r\n    <CurrencySymbolPosition>0</CurrencySymbolPosition>\r\n    <CalendarUID>1</CalendarUID>\r\n    <DefaultStartTime>08:00:00</DefaultStartTime>\r\n    <DefaultFinishTime>17:00:00</DefaultFinishTime>\r\n    <MinutesPerDay>480</MinutesPerDay>\r\n    <MinutesPerWeek>2400</MinutesPerWeek>\r\n    <DaysPerMonth>20</DaysPerMonth>\r\n    <DefaultTaskType>0</DefaultTaskType>\r\n    <DefaultFixedCostAccrual>3</DefaultFixedCostAccrual>\r\n    <DefaultStandardRate>0</DefaultStandardRate>\r\n    <DefaultOvertimeRate>0</DefaultOvertimeRate>\r\n    <DurationFormat>7</DurationFormat>\r\n    <WorkFormat>2</WorkFormat>\r\n    <EditableActualCosts>0</EditableActualCosts>\r\n    <HonorConstraints>0</HonorConstraints>\r\n    <InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>\r\n    <MultipleCriticalPaths>0</MultipleCriticalPaths>\r\n    <NewTasksEffortDriven>1</NewTasksEffortDriven>\r\n    <NewTasksEstimated>1</NewTasksEstimated>\r\n    <SplitsInProgressTasks>1</SplitsInProgressTasks>\r\n    <SpreadActualCost>0</SpreadActualCost>\r\n    <SpreadPercentComplete>0</SpreadPercentComplete>\r\n    <TaskUpdatesResource>1</TaskUpdatesResource>\r\n    <FiscalYearStart>0</FiscalYearStart>\r\n    <WeekStartDay>0</WeekStartDay>\r\n    <MoveCompletedEndsBack>0</MoveCompletedEndsBack>\r\n    <MoveRemainingStartsBack>0</MoveRemainingStartsBack>\r\n    <MoveRemainingStartsForward>0</MoveRemainingStartsForward>\r\n    <MoveCompletedEndsForward>0</MoveCompletedEndsForward>\r\n    <BaselineForEarnedValue>0</BaselineForEarnedValue>\r\n    <AutoAddNewResourcesAndTasks>1</AutoAddNewResourcesAndTasks>\r\n    <CurrentDate><%= currentDate %></CurrentDate>\r\n    <MicrosoftProjectServerURL>1</MicrosoftProjectServerURL>\r\n    <Autolink>1</Autolink>\r\n    <NewTaskStartDate>0</NewTaskStartDate>\r\n    <NewTasksAreManual>0</NewTasksAreManual>\r\n    <DefaultTaskEVMethod>0</DefaultTaskEVMethod>\r\n    <ProjectExternallyEdited>0</ProjectExternallyEdited>\r\n    <ExtendedCreationDate>1984-01-01T00:00:00</ExtendedCreationDate>\r\n    <ActualsInSync>0</ActualsInSync>\r\n    <RemoveFileProperties>0</RemoveFileProperties>\r\n    <AdminProject>0</AdminProject>\r\n    <UpdateManuallyScheduledTasksWhenEditingLinks>1</UpdateManuallyScheduledTasksWhenEditingLinks>\r\n    <KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>0</KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>\r\n    <OutlineCodes/>\r\n    <WBSMasks/>\r\n    <ExtendedAttributes>\r\n        <ExtendedAttribute>\r\n            <FieldID>188743752</FieldID>\r\n            <FieldName>Flag1</FieldName>\r\n            <Guid>000039B7-8BBE-4CEB-82C4-FA8C0B400048</Guid>\r\n            <SecondaryPID>255868938</SecondaryPID>\r\n            <SecondaryGuid>000039B7-8BBE-4CEB-82C4-FA8C0F40400A</SecondaryGuid>\r\n        </ExtendedAttribute>\r\n        <ExtendedAttribute>\r\n            <FieldID>188744006</FieldID>\r\n            <FieldName>Text20</FieldName>\r\n            <Guid>000039B7-8BBE-4CEB-82C4-FA8C0B400146</Guid>\r\n            <SecondaryPID>255869047</SecondaryPID>\r\n            <SecondaryGuid>000039B7-8BBE-4CEB-82C4-FA8C0F404077</SecondaryGuid>\r\n        </ExtendedAttribute>\r\n    </ExtendedAttributes>\r\n    <Calendars>\r\n        <Calendar>\r\n            <UID>1</UID>\r\n            <Name>Standard</Name>\r\n            <IsBaseCalendar>1</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>-1</BaseCalendarUID>\r\n            <WeekDays>\r\n                <WeekDay>\r\n                    <DayType>1</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>2</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>3</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>4</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>5</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>6</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>7</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n            </WeekDays>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>3</UID>\r\n            <Name>Management</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>4</UID>\r\n            <Name>Project Manager</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>5</UID>\r\n            <Name>Analyst</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>6</UID>\r\n            <Name>Developer</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>7</UID>\r\n            <Name>Testers</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>8</UID>\r\n            <Name>Trainers</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>9</UID>\r\n            <Name>Technical Communicators</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>10</UID>\r\n            <Name>Deployment Team</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n    </Calendars>\r\n    <Tasks>\r\n        <% tasks.forEach(function(task){ %>\r\n            <Task>\r\n                <UID><%= task.id %></UID>\r\n                <ID><%= task.id %></ID>\r\n                <Name><%= task.name %></Name>\r\n                <Active>1</Active>\r\n                <Manual>0</Manual>\r\n                <Type>1</Type>\r\n                <IsNull>0</IsNull>\r\n                <CreateDate><%= task.start %></CreateDate>\r\n                <WBS>0</WBS>\r\n                <OutlineNumber>0</OutlineNumber>\r\n                <OutlineLevel>0</OutlineLevel>\r\n                <Priority>500</Priority>\r\n                <Start><%= task.start %></Start>\r\n                <Finish><%= task.finish %></Finish>\r\n                <Duration>PT766H0M0S</Duration>\r\n                <ManualStart><%= task.start %></ManualStart>\r\n                <ManualFinish><%= task.finish %></ManualFinish>\r\n                <ManualDuration>PT766H0M0S</ManualDuration>\r\n                <DurationFormat>21</DurationFormat>\r\n                <Work>PT1532H0M0S</Work>\r\n                <ResumeValid>0</ResumeValid>\r\n                <EffortDriven>0</EffortDriven>\r\n                <Recurring>0</Recurring>\r\n                <OverAllocated>0</OverAllocated>\r\n                <Estimated>0</Estimated>\r\n                <Milestone>0</Milestone>\r\n                <Summary>1</Summary>\r\n                <DisplayAsSummary>0</DisplayAsSummary>\r\n                <Critical>1</Critical>\r\n                <IsSubproject>0</IsSubproject>\r\n                <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n                <ExternalTask>0</ExternalTask>\r\n                <EarlyStart><%= task.start %>0</EarlyStart>\r\n                <EarlyFinish><%= task.finish %></EarlyFinish>\r\n                <LateStart><%= task.start %></LateStart>\r\n                <LateFinish><%= task.finish %></LateFinish>\r\n                <StartVariance>0</StartVariance>\r\n                <FinishVariance>0</FinishVariance>\r\n                <WorkVariance>91920000.00</WorkVariance>\r\n                <FreeSlack>0</FreeSlack>\r\n                <TotalSlack>0</TotalSlack>\r\n                <StartSlack>0</StartSlack>\r\n                <FinishSlack>0</FinishSlack>\r\n                <FixedCost>0</FixedCost>\r\n                <FixedCostAccrual>3</FixedCostAccrual>\r\n                <PercentComplete>0</PercentComplete>\r\n                <PercentWorkComplete>0</PercentWorkComplete>\r\n                <Cost>0</Cost>\r\n                <OvertimeCost>0</OvertimeCost>\r\n                <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n                <ActualDuration>PT0H0M0S</ActualDuration>\r\n                <ActualCost>0</ActualCost>\r\n                <ActualOvertimeCost>0</ActualOvertimeCost>\r\n                <ActualWork>PT0H0M0S</ActualWork>\r\n                <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n                <RegularWork>PT1532H0M0S</RegularWork>\r\n                <RemainingDuration>PT766H0M0S</RemainingDuration>\r\n                <RemainingCost>0</RemainingCost>\r\n                <RemainingWork>PT1532H0M0S</RemainingWork>\r\n                <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n                <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n                <ACWP>0.00</ACWP>\r\n                <CV>0.00</CV>\r\n                <ConstraintType>0</ConstraintType>\r\n                <CalendarUID>-1</CalendarUID>\r\n                <LevelAssignments>1</LevelAssignments>\r\n                <LevelingCanSplit>1</LevelingCanSplit>\r\n                <LevelingDelay>0</LevelingDelay>\r\n                <LevelingDelayFormat>8</LevelingDelayFormat>\r\n                <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n                <HideBar>0</HideBar>\r\n                <Rollup>0</Rollup>\r\n                <BCWS>0.00</BCWS>\r\n                <BCWP>0.00</BCWP>\r\n                <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n                <EarnedValueMethod>0</EarnedValueMethod>\r\n                <IsPublished>0</IsPublished>\r\n                <CommitmentType>0</CommitmentType>\r\n            </Task><% }); %>\r\n    </Tasks>\r\n    <Resources>\r\n        <Resource>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <WorkGroup>0</WorkGroup>\r\n            <MaxUnits>1.00</MaxUnits>\r\n            <PeakUnits>0.00</PeakUnits>\r\n            <OverAllocated>0</OverAllocated>\r\n            <CanLevel>1</CanLevel>\r\n            <AccrueAt>3</AccrueAt>\r\n            <Work>PT0H0M0S</Work>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <StandardRate>0</StandardRate>\r\n            <StandardRateFormat>2</StandardRateFormat>\r\n            <Cost>0</Cost>\r\n            <OvertimeRate>0</OvertimeRate>\r\n            <OvertimeRateFormat>2</OvertimeRateFormat>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <CostPerUse>0</CostPerUse>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <CostVariance>0</CostVariance>\r\n            <SV>0.00</SV>\r\n            <CV>0.00</CV>\r\n            <ACWP>0.00</ACWP>\r\n            <CalendarUID>2</CalendarUID>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <IsGeneric>0</IsGeneric>\r\n            <IsInactive>0</IsInactive>\r\n            <IsEnterprise>0</IsEnterprise>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate>2012-08-07T08:59:00</CreationDate>\r\n            <IsCostResource>0</IsCostResource>\r\n            <IsBudget>0</IsBudget>\r\n        </Resource>\r\n    </Resources>\r\n    <Assignments>\r\n        <Assignment>\r\n            <UID>6</UID>\r\n            <TaskUID>6</TaskUID>\r\n            <ResourceUID>-65535</ResourceUID>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ACWP>0.00</ACWP>\r\n            <Confirmed>0</Confirmed>\r\n            <Cost>0</Cost>\r\n            <CostRateTable>0</CostRateTable>\r\n            <RateScale>0</RateScale>\r\n            <CostVariance>0</CostVariance>\r\n            <CV>0.00</CV>\r\n            <Delay>0</Delay>\r\n            <Finish>2014-04-18T12:00:00</Finish>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <HasFixedRateUnits>1</HasFixedRateUnits>\r\n            <FixedMaterial>0</FixedMaterial>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>7</LevelingDelayFormat>\r\n            <LinkedFields>0</LinkedFields>\r\n            <Milestone>1</Milestone>\r\n            <Overallocated>0</Overallocated>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ResponsePending>0</ResponsePending>\r\n            <Start>2014-04-18T12:00:00</Start>\r\n            <StartVariance>0</StartVariance>\r\n            <Units>1</Units>\r\n            <UpdateNeeded>0</UpdateNeeded>\r\n            <VAC>0.00</VAC>\r\n            <Work>PT0H0M0S</Work>\r\n            <WorkContour>0</WorkContour>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate>2012-08-07T08:59:00</CreationDate>\r\n            <BudgetCost>0</BudgetCost>\r\n            <BudgetWork>PT0H0M0S</BudgetWork>\r\n        </Assignment>\r\n    </Assignments>\r\n</Project>";
var compiled = _.template(xml);

function parseXMLObj(xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var tasks = [];
     _.each(obj.Project[0].Tasks[0].Task, function(xmlItem) {
        if (!xmlItem.Name) {
            return;
        }
         tasks.push({
            name : xmlItem.Name[0]._text,
            start : xmlItem.Start[0]._text,
            end : xmlItem.Finish[0]._text,
            complete : xmlItem.PercentComplete[0]._text
        });
    });
    return tasks;
}

module.exports.parseDepsFromXML = function(xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var uids = {};
    var outlines = {};
    var deps = [];
    var parents = [];
    _.each(obj.Project[0].Tasks[0].Task, function(xmlItem) {
        if (!xmlItem.Name) {
            return;
        }
        uids[xmlItem.UID[0]._text] = xmlItem.Name[0]._text.toString();
        outlines[xmlItem.OutlineNumber[0]._text.toString()] = xmlItem.Name[0]._text;
    });
    _.each(obj.Project[0].Tasks[0].Task, function(xmlItem) {
        if (!xmlItem.Name) {
            return;
        }
        var name = xmlItem.Name[0]._text;
        if (xmlItem.PredecessorLink) {
            deps.push([uids[xmlItem.PredecessorLink[0].PredecessorUID[0]._text], name]);
        }
        var outline = xmlItem.OutlineNumber[0]._text.toString();
        if (outline.indexOf('.') !== -1) {
            var parentOutline = outline.slice(0,outline.lastIndexOf('.'));
            parents.push([outlines[parentOutline], name]);
        }
    });
    return {
        deps : deps,
        parents : parents
    };
};

module.exports.parseXMLObj = parseXMLObj;

module.exports.JSONToXML = function(json) {
    var start = json[0].start;
    var end = json[0].end;
    var data = _.map(json, function(task) {
        if (start > task.start) {
            start = task.start;
        }
        if (end < task.end) {
            end = task.end;
        }
        return {
            name : task.name,
            start : task.start.toISOString(),
            end : task.end.toISOString()
        };
    });
    return compiled({
        tasks : data,
        currentDate : new Date().toISOString(),
        startDate : start,
        finishDate : end
    });
};


},{}],10:[function(require,module,exports){
"use strict";var ContextMenuView = require('./sideBar/ContextMenuView');var SidePanel = require('./sideBar/SidePanel');var GanttChartView = require('./canvasChart/GanttChartView');var TopMenuView = require('./TopMenuView/TopMenuView');var Notifications = require('./Notifications');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        new ContextMenuView({            collection : this.collection,            settings: this.app.settings        }).render();        // new task button        $('.new-task').click(function() {            var lastTask = params.collection.last();            var lastIndex = -1;            if (lastTask) {                lastIndex = lastTask.get('sortindex');            }            params.collection.add({                name : 'New task',                sortindex : lastIndex + 1            });        });        new Notifications({            collection : this.collection        });        // set side tasks panel height        var $sidePanel = $('.menu-container');        $sidePanel.css({            'min-height' : window.innerHeight - $sidePanel.offset().top        });        new TopMenuView({            settings : this.app.settings,            collection : this.collection        }).render();        this.canvasView = new GanttChartView({            app : this.app,            collection : this.collection,            settings: this.app.settings        });        this.canvasView.render();        this._moveCanvasView();        setTimeout(function() {            this.canvasView._updateStageAttrs();        }.bind(this), 500);        var tasksContainer = $('.tasks').get(0);        React.render(            React.createElement(SidePanel, {                collection : this.collection            }),            tasksContainer        );        this.listenTo(this.collection, 'sort', _.debounce(function() {            console.log('recompile');            React.unmountComponentAtNode(tasksContainer);            React.render(                React.createElement(SidePanel, {                    collection : this.collection                }),                tasksContainer            );        }.bind(this),5));    },    events: {        'click #tHandle': 'expand'    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var button = $(evt.target);        if (button.hasClass('contract')) {            this.$menuContainer.addClass('panel-collapsed');            this.$menuContainer.removeClass('panel-expanded');        }        else {            this.$menuContainer.addClass('panel-expanded');            this.$menuContainer.removeClass('panel-collapsed');        }        setTimeout(function() {            this._moveCanvasView();        }.bind(this), 600);        button.toggleClass('contract');    },    _moveCanvasView : function() {        var sideBarWidth = $('.menu-container').width();        this.canvasView.setLeftPadding(sideBarWidth);    }});module.exports = GanttView;
},{"./Notifications":12,"./TopMenuView/TopMenuView":18,"./canvasChart/GanttChartView":23,"./sideBar/ContextMenuView":25,"./sideBar/SidePanel":28}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
var Notifications = Backbone.View.extend({
    initialize : function() {
        this.listenTo(this.collection, 'error', this.onError);
    },
    onError : function() {
        console.error(arguments);
        noty({
            text: 'Error while saving task. Sorry...',
            layout : 'topRight',
            type : 'error'
        });
    }
});

module.exports = Notifications;

},{}],13:[function(require,module,exports){
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
            on : 'hover',
            position : 'bottom left',
            onHidden : function() {
                this._saveData();
                this.popup.off('.editor');
            }.bind(this)
        }).popup('show');

        this._addResources();
        this.popup.find('.button').on('click.editor', function() {
            this.popup.popup('hide');
            this._saveData();
            this.popup.off('.editor');
        }.bind(this));

        this._fullData();
    },
    _addResources : function() {
        this.popup.empty();
        var htmlString = '';
        (this.settings.statuses.resourcedata || []).forEach(function(resource) {
            htmlString += '<div class="ui checkbox">' +
                    '<input type="checkbox"  name="' + resource.UserId + '">' +
                    '<label>' + resource.Username + '</label>' +
                '</div><br>';
        });
        htmlString +='<br><div style="text-align:center;"><div class="ui positive right button save tiny">' +
                'Close' +
            '</div></div>';
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
        this.model.set('resources', resources);
    }
});

module.exports = ResourceEditorView;

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
"use strict";
var parseXML = require('../../utils/xmlWorker').parseXMLObj;
var JSONToXML = require('../../utils/xmlWorker').JSONToXML;
var parseDepsFromXML = require('../../utils/xmlWorker').parseDepsFromXML;

var MSProjectMenuView = Backbone.View.extend({
    el : '#project-menu',

    initialize : function(params) {
        this.settings = params.settings;
        this.importing = false;
        this._setupInput();
    },
    _setupInput : function() {
        var input = $('#importFile');
        var self = this;
        input.on('change', function(evt) {
            var files = evt.target.files;
            _.each(files, function(file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        self.xmlData = e.target.result;
                    } catch (e) {
                        alert('Error while paring file.');
                        throw e;
                    }
                };
                reader.readAsText(file);
            });
        });
    },
    events : {
        'click #upload-project' : function() {
            $('#msimport').modal({
                onHidden : function() {
                    $(document.body).removeClass('dimmable');
                },
                onApprove : function() {
                    if (!this.xmlData || this.importing) {
                        return false;
                    }
                    this.importing = true;
                    $("#importProgress").show();
                    $("#importFile").hide();
                    $(document.body).removeClass('dimmable');
                    $('#xmlinput-form').trigger('reset');
                    setTimeout(this.importData.bind(this), 20);
                    return false;
                }.bind(this)
            }).modal('show');
            $("#importProgress").hide();
            $("#importFile").show();
        },
        'click #download-project' : function() {
            var data = JSONToXML(this.collection.toJSON());
            var blob = new Blob([data], {type : 'application/json'});
            saveAs(blob, 'GanttTasks.xml');
        }
    },
    progress : function(percent) {
        console.error(percent);
        $('#importProgress').progress({
            percent : percent
        });
    },
    _prepareData : function(data) {
        var defStatus = this.settings.findDefaultStatusId();
        var defHealth = this.settings.findDefaultHealthId();
        var defWO = this.settings.findDefaulWOId();
        data.forEach(function(item) {
            item.health = defHealth;
            item.status = defStatus;
            item.wo = defWO;
        });
        return data;
    },
    importData : function() {
        this.progress(0);
        // this is some sort of callback hell!!
        // we need timeouts for better user experience
        // I think user want to see animated progress bar
        // but without timeouts it is not possible, right?
        setTimeout(function() {
            this.progress(21);
            var col = this.collection;
            var data = parseXML(this.xmlData);
            data = this._prepareData(data);

            setTimeout(function() {
                this.progress(43);
                col.importTasks(data, function() {
                    this.progress(51);
                    setTimeout(function() {
                        this.progress(67);
                        var deps = parseDepsFromXML(this.xmlData);
                        setTimeout(function() {
                            this.progress(95);
                            col.createDeps(deps);
                            setTimeout(function() {
                                this.progress(100);
                                this.importing = false;
                                $('#msimport').modal('hide');
                            }.bind(this), 5);
                        }.bind(this), 5);
                    }.bind(this), 5);
                }.bind(this));
            }.bind(this), 5);
        }.bind(this), 5);





    }
});

module.exports = MSProjectMenuView;

},{"../../utils/xmlWorker":9}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"./FilterMenuView":14,"./GroupingMenuView":15,"./MSProjectMenuView":16,"./ReportsMenuView":17,"./ZoomMenuView":19}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{"./BasicTaskView":21}],21:[function(require,module,exports){
"use strict";
var ResourceEditor = require('../ResourcesEditor');

var linkImage = new Image();
linkImage.src = 'css/images/link.png';

var userImage = new Image();
userImage.src = 'css/images/user.png';

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
                var size =  self._barHeight + (self._borderSize || 0);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(horOffset, 0);
                context.arc(horOffset, size / 2, size / 2, - Math.PI / 2, Math.PI / 2);
                context.lineTo(0, size);
                context.lineTo(0, 0);
                context.fillShape(this);
                var imgSize = size - 4;
                context.drawImage(linkImage, 1, (size - imgSize) / 2, imgSize, imgSize);
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
        var size = self._barHeight + (self._borderSize || 0);
        var toolback = new Konva.Rect({
            fill : 'lightgrey',
            width : size,
            height : size,
            cornerRadius : 2
        });

        var userIm = new Konva.Image({
            image : userImage,
            width : size,
            height : size
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
        var names = [];
        var list = this.model.get('resources');
        list.forEach(function(resourceId) {
            var res = _.find((this.settings.statuses.resourcedata || []), function(res) {
                return res.UserId.toString() === resourceId.toString();
            });
            if (res) {
                if (list.length < 3) {
                    names.push(res.Username);
                } else {
                    var aliases = _.map(res.Username.split(' '), function(str) { return str[0];}).join('');
                    names.push(aliases);
                }
            }
        }.bind(this));
        resourceList.text(names.join(', '));

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
},{"../ResourcesEditor":13}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
        var previousTaskX = this._taskViews.length ? this._taskViews[0].el.x() : 0;
        this.stage.setAttrs({
//            x : this._leftPadding,
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
                self.draggedToDay = Math.abs(x - self._leftPadding) / self.settings.getSetting('attr').daysWidth;
                return {
                    x: x,
                    y: 0
                };
            }
        });

        setTimeout(function() {
            if (!this._taskViews.length || !previousTaskX) {
                this.stage.x(this._leftPadding);
            } else {
                var minx = -(lineWidth - this.stage.width());
                var x = this._leftPadding - (this.draggedToDay || 0) * self.settings.getSetting('attr').daysWidth;
                this.stage.x(Math.max(minx, x));
            }
            this.stage.draw();
        }.bind(this), 5);

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

        this.listenTo(this.settings, 'change:width', function() {
            this._updateStageAttrs();
            this._taskViews.forEach(function(view) {
                view.render();
            });
            this._connectorViews.forEach(function(view) {
                view.render();
            });
        });

    },
    _initCollectionEvents : function() {
        this.listenTo(this.collection, 'add', function(task) {
            this._addTaskView(task);
            this._requestResort();
        });
        this.listenTo(this.collection, 'remove', function(task) {
            this._removeViewForModel(task);
            this._requestResort();
        });
        this.listenTo(this.collection, 'add remove', _.debounce(function() {
            // wait for left panel updates
            setTimeout(function() {
                this._updateStageAttrs();
            }.bind(this), 100);
        }, 10));

        this.listenTo(this.collection, 'sort change:hidden', function() {
            this._requestResort();
        });

        this.listenTo(this.collection, 'change:depend', function(task) {
            if (task.get('depend')) {
                this._addConnectorView(task);
            } else {
                this._removeConnector(task);
            }
            this._requestResort();
        });
        this.listenTo(this.collection, 'nestedStateChange', function(task) {
            this._removeViewForModel(task);
            this._addTaskView(task);
            this._requestResort();
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
    _requestResort : (function() {
        var waiting = false;
        return function () {
            if (waiting) {
                return;
            }
            setTimeout(function() {
                this._resortViews();
                waiting = false;
            }.bind(this), 5);
        };
    }()),
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
        this.Flayer.batchDraw();
    }
});

module.exports = GanttChartView;
},{"./AloneTaskView":20,"./ConnectorView":22,"./NestedTaskView":24}],24:[function(require,module,exports){
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
},{"./BasicTaskView":21}],25:[function(require,module,exports){
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
},{"../ModalTaskEditView":11}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"./TaskItem":29}],28:[function(require,module,exports){
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
            this.requestUpdate();
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

},{"./NestedTask":27,"./TaskItem":29}],29:[function(require,module,exports){
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

},{"./DatePicker":26}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvZGF0YS9jb25maWcuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL1Jlc291cmNlUmVmZXJlbmNlQ29sbGVjdGlvbi5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24uanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2Zha2VfNTdlOTcyNjcuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9SZXNvdXJjZVJlZmVyZW5jZS5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1NldHRpbmdNb2RlbC5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Rhc2tNb2RlbC5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdXRpbHMvdXRpbC5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdXRpbHMveG1sV29ya2VyLmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9HYW50dFZpZXcuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL01vZGFsVGFza0VkaXRWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ob3RpZmljYXRpb25zLmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9SZXNvdXJjZXNFZGl0b3IuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L0ZpbHRlck1lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9Hcm91cGluZ01lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9NU1Byb2plY3RNZW51Vmlldy5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvUmVwb3J0c01lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9Ub3BNZW51Vmlldy5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvWm9vbU1lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9BbG9uZVRhc2tWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9CYXNpY1Rhc2tWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9Db25uZWN0b3JWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9HYW50dENoYXJ0Vmlldy5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvTmVzdGVkVGFza1ZpZXcuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0RhdGVQaWNrZXIuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvTmVzdGVkVGFzay5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9TaWRlUGFuZWwuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvVGFza0l0ZW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIFwiY2ZnZGF0YVwiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiQ2F0ZWdvcnlcIjpcIlRhc2sgSGVhbHRoXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6MTUwMjcsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOlwiR3JlZW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOnRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOlwiXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOjE1MDI4LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjpcIkFtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6XCJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6MTUwMjksXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOlwiUmVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY0RlZmF1bHRcIjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcIkFsaWFzXCI6XCJcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiQ2F0ZWdvcnlcIjpcIlRhc2sgU3RhdHVzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcIklEXCI6MjMsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjZmdfaXRlbVwiOlwiSW4gUHJvZ3Jlc3NcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiQWxpYXNcIjpcIlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjoyNCxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6XCJDb21wbGV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6MyxcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOlwiXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOjIxOCxcclxuICAgICAgICAgICAgICAgICAgICBcImNmZ19pdGVtXCI6XCJSZWFkeVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydE9yZGVyXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICBcImNEZWZhdWx0XCI6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOlwiXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJJRFwiOjE1MDI2LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2ZnX2l0ZW1cIjpcIkJhY2tsb2dcIixcclxuICAgICAgICAgICAgICAgICAgICBcIlNvcnRPcmRlclwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjRGVmYXVsdFwiOnRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJBbGlhc1wiOlwiXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIF0sXHJcbiAgICBcIndvZGF0YVwiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFwiV09OdW1iZXJcIjpcIldvcmtPcmRlcnNcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiSURcIjo0MyxcclxuICAgICAgICAgICAgICAgICAgICBcIldPTnVtYmVyXCI6XCJXTzEwMDE4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0T3JkZXJcIjo0M1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgXSxcclxuICAgIFwicmVzb3VyY2VkYXRhXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjoxLFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6XCJHcmVnIFZhbmRlbGlndFwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6XCJQcm9ncmFtIE1hbmFnZXJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOjU4LFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6XCJKYW1lcyBHdW1sZXlcIixcclxuICAgICAgICAgICAgXCJKb2JUaXRsZVwiOlwiUHJvamVjdCBNYW5hZ2VyXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJVc2VySWRcIjoyLFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6XCJMdWN5IE1pbm90YVwiLFxyXG4gICAgICAgICAgICBcIkpvYlRpdGxlXCI6bnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlVzZXJJZFwiOjU5LFxyXG4gICAgICAgICAgICBcIlVzZXJuYW1lXCI6XCJSb2IgVHluYW5cIixcclxuICAgICAgICAgICAgXCJKb2JUaXRsZVwiOlwiQnVzaW5lc3MgQW5hbHlzdFwiXHJcbiAgICAgICAgfVxyXG4gICAgXVxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlc291cmNlUmVmZXJlbmNlTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvUmVzb3VyY2VSZWZlcmVuY2UnKTtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblxudmFyIENvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgdXJsIDogJ2FwaS9yZXNvdXJjZXMvJyArIChwYXJhbXMucHJvamVjdCB8fCAxKSArICcvJyArIChwYXJhbXMucHJvZmlsZSB8fCAxKSxcblx0bW9kZWw6IFJlc291cmNlUmVmZXJlbmNlTW9kZWwsXG4gICAgaWRBdHRyaWJ1dGUgOiAnSUQnLFxuICAgIHVwZGF0ZVJlc291cmNlc0ZvclRhc2sgOiBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbGQgcmVmZXJlbmNlc1xuICAgICAgICB0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHJlZikge1xuICAgICAgICAgICAgaWYgKHJlZi5nZXQoJ1dCU0lEJykudG9TdHJpbmcoKSAhPT0gdGFzay5pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlzT2xkID0gdGFzay5nZXQoJ3Jlc291cmNlcycpLmluZGV4T2YocmVmLmdldCgnUmVzSUQnKSk7XG4gICAgICAgICAgICBpZiAoaXNPbGQpIHtcbiAgICAgICAgICAgICAgICByZWYuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgLy8gYWRkIG5ldyByZWZlcmVuY2VzXG4gICAgICAgIHRhc2suZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc0lkKSB7XG4gICAgICAgICAgICB2YXIgaXNFeGlzdCA9IHRoaXMuZmluZFdoZXJlKHtSZXNJRCA6IHJlc0lkfSk7XG4gICAgICAgICAgICBpZiAoIWlzRXhpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZCh7XG4gICAgICAgICAgICAgICAgICAgIFJlc0lEIDogcmVzSWQsXG4gICAgICAgICAgICAgICAgICAgIFdCU0lEIDogdGFzay5pZC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgcGFyc2UgOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCAgPSBbXTtcbiAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5SZXNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbihyZXNJdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHJlc0l0ZW07XG4gICAgICAgICAgICAgICAgb2JqLldCU0lEID0gaXRlbS5XQlNJRDtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChvYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb247XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgVGFza01vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Rhc2tNb2RlbCcpO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdHVybCA6ICdhcGkvdGFza3MnLFxuXHRtb2RlbDogVGFza01vZGVsLFxuXHRpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xuXHR9LFxuXHRjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcblx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0bGlua0NoaWxkcmVuIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHBhcmVudFRhc2sgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50VGFzaykge1xuXHRcdFx0XHRpZiAocGFyZW50VGFzayA9PT0gdGFzaykge1xuXHRcdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0Y29uc29sZS5lcnJvcigndGFzayBoYXMgcGFyZW50IHdpdGggaWQgJyArIHRhc2suZ2V0KCdwYXJlbnRpZCcpICsgJyAtIGJ1dCB0aGVyZSBpcyBubyBzdWNoIHRhc2snKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRfc29ydENoaWxkcmVuIDogZnVuY3Rpb24gKHRhc2ssIHNvcnRJbmRleCkge1xuXHRcdHRhc2suY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKGNoaWxkLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAtMTtcblx0XHR0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKHRhc2ssIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0X3Jlc29ydENoaWxkcmVuIDogZnVuY3Rpb24oZGF0YSwgc3RhcnRJbmRleCwgcGFyZW50SUQpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gc3RhcnRJbmRleDtcblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24odGFza0RhdGEpIHtcblx0XHRcdHZhciB0YXNrID0gdGhpcy5nZXQodGFza0RhdGEuaWQpO1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRJRCkge1xuXHRcdFx0XHR2YXIgbmV3UGFyZW50ID0gdGhpcy5nZXQocGFyZW50SUQpO1xuXHRcdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGFzay5zYXZlKHtcblx0XHRcdFx0c29ydGluZGV4OiArK3NvcnRJbmRleCxcblx0XHRcdFx0cGFyZW50aWQ6IHBhcmVudElEXG5cdFx0XHR9KTtcblx0XHRcdGlmICh0YXNrRGF0YS5jaGlsZHJlbiAmJiB0YXNrRGF0YS5jaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0c29ydEluZGV4ID0gdGhpcy5fcmVzb3J0Q2hpbGRyZW4odGFza0RhdGEuY2hpbGRyZW4sIHNvcnRJbmRleCwgdGFzay5pZCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRyZXNvcnQgOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHRoaXMuX3Jlc29ydENoaWxkcmVuKGRhdGEsIC0xLCAwKTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRzdWJzY3JpYmUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHRcdG1vZGVsLnBhcmVudCA9IHBhcmVudDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0dGhpcy5fY2hlY2tEZXBlbmRlbmNpZXMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4ucmVtb3ZlKHRhc2spO1xuXHRcdFx0XHR0YXNrLnBhcmVudCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fcHJldmVudFNvcnRpbmcpIHtcblx0XHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGNyZWF0ZURlcGVuZGVuY3kgOiBmdW5jdGlvbiAoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpIHtcblx0XHRpZiAodGhpcy5fY2FuQ3JlYXRlRGVwZW5kZW5jZShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkpIHtcblx0XHRcdGFmdGVyTW9kZWwuZGVwZW5kT24oYmVmb3JlTW9kZWwpO1xuXHRcdH1cblx0fSxcblxuXHRfY2FuQ3JlYXRlRGVwZW5kZW5jZSA6IGZ1bmN0aW9uKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKGJlZm9yZU1vZGVsLmhhc1BhcmVudChhZnRlck1vZGVsKSB8fCBhZnRlck1vZGVsLmhhc1BhcmVudChiZWZvcmVNb2RlbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKChiZWZvcmVNb2RlbC5nZXQoJ2RlcGVuZCcpID09PSBhZnRlck1vZGVsLmlkKSB8fFxuXHRcdFx0KGFmdGVyTW9kZWwuZ2V0KCdkZXBlbmQnKSA9PT0gYmVmb3JlTW9kZWwuaWQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRyZW1vdmVEZXBlbmRlbmN5IDogZnVuY3Rpb24oYWZ0ZXJNb2RlbCkge1xuXHRcdGFmdGVyTW9kZWwuY2xlYXJEZXBlbmRlbmNlKCk7XG5cdH0sXG5cdF9jaGVja0RlcGVuZGVuY2llcyA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdkZXBlbmQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmdldCh0YXNrLmdldCgnZGVwZW5kJykpO1xuXHRcdFx0aWYgKCFiZWZvcmVNb2RlbCkge1xuXHRcdFx0XHR0YXNrLnVuc2V0KCdkZXBlbmQnKS5zYXZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLmRlcGVuZE9uKGJlZm9yZU1vZGVsKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRvdXRkZW50IDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciB1bmRlclN1YmxpbmdzID0gW107XG5cdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHR0YXNrLnBhcmVudC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGlmIChjaGlsZC5nZXQoJ3NvcnRpbmRleCcpIDw9IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmRlclN1YmxpbmdzLnB1c2goY2hpbGQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHVuZGVyU3VibGluZ3MuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKGNoaWxkLmdldCgnZGVwZW5kJykgPT09IHRhc2suaWQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5jbGVhckRlcGVuZGVuY2UoKTtcbiAgICAgICAgICAgIH1cblx0XHRcdGNoaWxkLnNhdmUoJ3BhcmVudGlkJywgdGFzay5pZCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHRpZiAodGFzay5wYXJlbnQgJiYgdGFzay5wYXJlbnQucGFyZW50KSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgdGFzay5wYXJlbnQucGFyZW50LmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIDApO1xuXHRcdH1cblx0fSxcblx0aW5kZW50IDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciBwcmV2VGFzaywgaSwgbTtcblx0XHRmb3IgKGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0wOyBpLS0pIHtcblx0XHRcdG0gPSB0aGlzLmF0KGkpO1xuXHRcdFx0aWYgKChtLmdldCgnc29ydGluZGV4JykgPCB0YXNrLmdldCgnc29ydGluZGV4JykpICYmICh0YXNrLnBhcmVudCA9PT0gbS5wYXJlbnQpKSB7XG5cdFx0XHRcdHByZXZUYXNrID0gbTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChwcmV2VGFzaykge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHByZXZUYXNrLmlkKTtcblx0XHR9XG5cdH0sXG4gICAgaW1wb3J0VGFza3MgOiBmdW5jdGlvbih0YXNrSlNPTmFycmF5LCBjYWxsYmFjaykge1xuICAgIFx0dmFyIHNvcnRpbmRleCA9IDA7XG4gICAgXHRpZiAodGhpcy5sYXN0KCkpIHtcblx0XHRcdHNvcnRpbmRleCA9IHRoaXMubGFzdCgpLmdldCgnc29ydGluZGV4Jyk7XG4gICAgXHR9XG4gICAgICAgIHRhc2tKU09OYXJyYXkuZm9yRWFjaChmdW5jdGlvbih0YXNrSXRlbSkge1xuICAgICAgICAgICAgdGFza0l0ZW0uc29ydGluZGV4ID0gICsrc29ydGluZGV4O1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB2YXIgbGVuZ3RoID0gdGFza0pTT05hcnJheS5sZW5ndGg7XG4gICAgICAgIHZhciBkb25lID0gMDtcbiAgICAgICAgdGhpcy5hZGQodGFza0pTT05hcnJheSwge3BhcnNlIDogdHJ1ZX0pLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgdGFzay5zYXZlKHt9LHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUgKz0xO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9uZSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlRGVwcyA6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICBkYXRhLmRlcHMuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lIDogZGVwWzBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBhZnRlck1vZGVsID0gdGhpcy5maW5kV2hlcmUoe1xuICAgICAgICAgICAgICAgIG5hbWUgOiBkZXBbMV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVEZXBlbmRlbmN5KGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgZGF0YS5wYXJlbnRzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lIDogaXRlbVswXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZSA6IGl0ZW1bMV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hpbGQuc2F2ZSgncGFyZW50aWQnLCBwYXJlbnQuaWQpOztcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrQ29sbGVjdGlvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24nKTtcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vbW9kZWxzL1NldHRpbmdNb2RlbCcpO1xuXG52YXIgR2FudHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9HYW50dFZpZXcnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlscy91dGlsJyk7XG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblxuZnVuY3Rpb24gZmV0Y2hDb2xsZWN0aW9uKGFwcCkge1xuXHRhcHAudGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3MgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGFkZCBlbXB0eSB0YXNrIGlmIG5vIHRhc2tzIGZyb20gc2VydmVyXG4gICAgICAgICAgICBpZiAoYXBwLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGFwcC50YXNrcy5yZXNldChbe1xuICAgICAgICAgICAgICAgICAgICBuYW1lIDogJ05ldyB0YXNrJ1xuICAgICAgICAgICAgICAgIH1dKTtcblxuICAgICAgICAgICAgfVxuXHRcdFx0Y29uc29sZS5sb2coJ1N1Y2Nlc3MgbG9hZGluZyB0YXNrcy4nKTtcblx0XHRcdGFwcC50YXNrcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdGFwcC50YXNrcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cblx0XHRcdGFwcC5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyh7fSwge2FwcCA6IGFwcH0pO1xuXG4gICAgICAgICAgICAvLyBsb2FkIHN0YXR1c2VzIHNldHRpbmdzXG5cdFx0XHRpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluZGV4T2YoJ2xvY2FsaG9zdCcpID09PSAtMSkge1xuXHRcdFx0XHQkLmdldEpTT04oJy9hcGkvR2FudHRDb25maWcvd2JzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5zaXRla2V5LCBmdW5jdGlvbihzdGF0dXNlcykge1xuXHRcdFx0XHRcdGFwcC5zZXR0aW5ncyA9IHN0YXR1c2VzO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcCxcblx0XHRcdFx0Y29sbGVjdGlvbiA6IGFwcC50YXNrc1xuXHRcdFx0fSkucmVuZGVyKCk7XG5cblx0XHRcdCQoJyNsb2FkZXInKS5mYWRlT3V0KCk7XG5cdFx0fSxcblx0XHRlcnJvciA6IGZ1bmN0aW9uKGVycikge1xuXHRcdFx0Y29uc29sZS5lcnJvcignZXJyb3IgbG9hZGluZycpO1xuXHRcdFx0Y29uc29sZS5lcnJvcihlcnIpO1xuXHRcdH0sXG5cdFx0cGFyc2U6IHRydWUsXG5cdFx0cmVzZXQgOiB0cnVlXG5cdH0pO1xufVxuXG5cbiQoZnVuY3Rpb24gKCkge1xuXHR2YXIgYXBwID0ge307XG5cdGFwcC50YXNrcyA9IG5ldyBUYXNrQ29sbGVjdGlvbigpO1xuXG5cdC8vIGRldGVjdCBBUEkgcGFyYW1zIGZyb20gZ2V0LCBlLmcuID9wcm9qZWN0PTE0MyZwcm9maWxlPTE3JnNpdGVrZXk9MmIwMGRhNDZiNTdjMDM5NVxuXHR2YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblx0aWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlICYmIHBhcmFtcy5zaXRla2V5KSB7XG5cdFx0YXBwLnRhc2tzLnVybCA9ICdhcGkvdGFza3MvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGUgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcblx0fVxuXHRmZXRjaENvbGxlY3Rpb24oYXBwKTtcbn0pOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIFJlc291cmNlUmVmZXJlbmNlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgLy8gbWFpbiBwYXJhbXNcclxuICAgICAgICBXQlNJRCA6IDEsIC8vIHRhc2sgaWRcclxuICAgICAgICBSZXNJRDogMSwgLy8gcmVzb3VyY2UgaWRcclxuICAgICAgICBUU0FjdGl2YXRlOiB0cnVlLFxyXG5cclxuICAgICAgICAvLyBzb21lIHNlcnZlciBwYXJhbXNcclxuICAgICAgICBXQlNQcm9maWxlSUQgOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBXQlNfSUQgOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBQYXJ0aXRObyA6ICcyYjAwZGE0NmI1N2MwMzk1JywgLy8gaGF2ZSBubyBpZGVhIHdoYXQgaXMgdGhhdFxyXG4gICAgICAgIFByb2plY3RSZWYgOiBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleVxyXG5cclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzb3VyY2VSZWZlcmVuY2U7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciB0ZXN0U3RhdHVzZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9kYXRhL2NvbmZpZycpO1xyXG5cclxudmFyIFNldHRpbmdNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0ZGVmYXVsdHM6IHtcclxuXHRcdGludGVydmFsOiAnZml4JyxcclxuXHRcdC8vZGF5cyBwZXIgaW50ZXJ2YWxcclxuXHRcdGRwaTogMVxyXG5cdH0sXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cnMsIHBhcmFtcykge1xyXG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xyXG5cdFx0dGhpcy5zdGF0dXNlcyA9IHRlc3RTdGF0dXNlcztcclxuXHRcdHRoaXMuc2F0dHIgPSB7XHJcblx0XHRcdGhEYXRhOiB7fSxcclxuXHRcdFx0ZHJhZ0ludGVydmFsOiAxLFxyXG5cdFx0XHRkYXlzV2lkdGg6IDUsXHJcblx0XHRcdGNlbGxXaWR0aDogMzUsXHJcblx0XHRcdG1pbkRhdGU6IG5ldyBEYXRlKDIwMjAsMSwxKSxcclxuXHRcdFx0bWF4RGF0ZTogbmV3IERhdGUoMCwwLDApLFxyXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxyXG5cdFx0XHRib3VuZGFyeU1heDogbmV3IERhdGUoMjAyMCwxLDEpLFxyXG5cdFx0XHQvL21vbnRocyBwZXIgY2VsbFxyXG5cdFx0XHRtcGM6IDFcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcclxuXHRcdFx0c2NyZWVuV2lkdGg6ICAkKCcjZ2FudHQtY29udGFpbmVyJykuaW5uZXJXaWR0aCgpICsgNzg2LFxyXG5cdFx0XHR0SGlkZGVuV2lkdGg6IDMwNSxcclxuXHRcdFx0dGFibGVXaWR0aDogNzEwXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuYXBwLnRhc2tzO1xyXG5cdFx0dGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMoKTtcclxuXHRcdHRoaXMub24oJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkIGNoYW5nZTplbmQnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZTp3aWR0aCcpO1xyXG4gICAgICAgIH0sIDUwMCkpO1xyXG5cdH0sXHJcblx0Z2V0U2V0dGluZzogZnVuY3Rpb24oZnJvbSwgYXR0cil7XHJcblx0XHRpZihhdHRyKXtcclxuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXTtcclxuXHR9LFxyXG5cdGZpbmRTdGF0dXNJZCA6IGZ1bmN0aW9uKHN0YXR1cykge1xyXG5cdFx0Zm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG5cdFx0XHRpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuXHRcdFx0XHRcdGlmIChzdGF0dXNJdGVtLmNmZ19pdGVtLnRvTG93ZXJDYXNlKCkgPT09IHN0YXR1cy50b0xvd2VyQ2FzZSgpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcbiAgICBmaW5kU3RhdHVzRm9ySWQgOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uSUQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSBpZC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGZpbmREZWZhdWx0U3RhdHVzSWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblx0ZmluZEhlYWx0aElkIDogZnVuY3Rpb24oaGVhbHRoKSB7XHJcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gaGVhbHRoLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmRIZWFsdGhGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRIZWFsdGhJZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHRmaW5kV09JZCA6IGZ1bmN0aW9uKHdvKSB7XHJcblx0XHRmb3IodmFyIGkgaW4gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLldPTnVtYmVyLnRvTG93ZXJDYXNlKCkgPT09IHdvLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLklEO1xyXG4gICAgICAgICAgICB9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmREZWZhdWxXT0lkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbMF0uSUQ7XHJcbiAgICB9LFxyXG5cdGNhbGNtaW5tYXg6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG1pbkRhdGUgPSBuZXcgRGF0ZSgpLCBtYXhEYXRlID0gbWluRGF0ZS5jbG9uZSgpLmFkZFllYXJzKDEpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdzdGFydCcpLmNvbXBhcmVUbyhtaW5EYXRlKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRtaW5EYXRlPW1vZGVsLmdldCgnc3RhcnQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdlbmQnKS5jb21wYXJlVG8obWF4RGF0ZSkgPT09IDEpIHtcclxuXHRcdFx0XHRtYXhEYXRlPW1vZGVsLmdldCgnZW5kJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5zYXR0ci5taW5EYXRlID0gbWluRGF0ZTtcclxuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XHJcblx0fSxcclxuXHRzZXRBdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xyXG5cdFx0XHJcblx0XHR2YXIgaW50ZXJ2YWwgPSB0aGlzLmdldCgnaW50ZXJ2YWwnKTtcclxuXHJcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdkYWlseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDEsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoNjApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxMjtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XHJcblx0XHRcdH07XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdFxyXG5cdFx0fSBlbHNlIGlmKGludGVydmFsID09PSAnd2Vla2x5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgNywge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApLm1vdmVUb0RheU9mV2VlaygxLCAtMSk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCAqIDc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyg3KTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMTIgKiAzMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDI7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbi5tb3ZlVG9GaXJzdERheU9mUXVhcnRlcigpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDMwICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMyk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnZml4Jykge1xyXG5cdFx0XHRjZWxsV2lkdGggPSAzMDtcclxuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xyXG5cdFx0XHRzaXplID0gZGF0dHIuc2NyZWVuV2lkdGggLSBkYXR0ci50SGlkZGVuV2lkdGggLSAxMDA7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNpemUgLyBkdXJhdGlvbjtcclxuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgZHBpLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IGRwaSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMzAgKiAxMCk7XHJcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbD09PSdhdXRvJykge1xyXG5cdFx0XHRkcGkgPSB0aGlzLmdldCgnZHBpJyk7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2F0dHIuY2VsbFdpZHRoIC8gZHBpO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yMCAqIGRwaSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDMwICogMTApO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XHJcblx0XHRcdH07XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdH1cclxuXHRcdHZhciBoRGF0YSA9IHtcclxuXHRcdFx0JzEnOiBbXSxcclxuXHRcdFx0JzInOiBbXSxcclxuXHRcdFx0JzMnOiBbXVxyXG5cdFx0fTtcclxuXHRcdHZhciBoZGF0YTMgPSBbXTtcclxuXHRcdFxyXG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcclxuXHRcdFxyXG5cdFx0bGFzdCA9IHN0YXJ0O1xyXG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XHJcblx0XHRcdHZhciBkdXJmdW5jO1xyXG5cdFx0XHRpZiAoaW50ZXJ2YWw9PT0nbW9udGhseScpIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luTW9udGgoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0TW9udGgoKSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luUXVhcnRlcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0UXVhcnRlcigpKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xyXG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogZHVyZnVuYyhsYXN0KSxcclxuXHRcdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XHJcblx0XHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIGludGVydmFsZGF5cyA9IHRoaXMuZ2V0KCdkcGknKTtcclxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XHJcblx0XHRcdFx0aGRhdGEzLnB1c2goe1xyXG5cdFx0XHRcdFx0ZHVyYXRpb246IGludGVydmFsZGF5cyxcclxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XHJcblx0XHRcdFx0bGFzdCA9IG5leHQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHNhdHRyLmJvdW5kYXJ5TWF4ID0gZW5kID0gbGFzdDtcclxuXHRcdGhEYXRhWyczJ10gPSBoZGF0YTM7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGVuZCk7XHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IGRhdGUgdG8gZW5kIG9mIHllYXJcclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xyXG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXHJcblx0XHR9KTtcclxuXHRcdGZvcihpID0gc3RhcnQuZ2V0RnVsbFllYXIoKSArIDEsIGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTsgaSA8IGlMZW47IGkrKyl7XHJcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxyXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRpbnRlciA9IERhdGUuZGF5c2RpZmYobmV3IERhdGUoZW5kLmdldEZ1bGxZZWFyKCksIDAsIDEpLCBlbmQpO1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBlbmQuZ2V0RnVsbFllYXIoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxyXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoc3RhcnQsIHN0YXJ0LmNsb25lKCkubW92ZVRvTGFzdERheU9mTW9udGgoKSksXHJcblx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCAnbScpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aiA9IHN0YXJ0LmdldE1vbnRoKCkgKyAxO1xyXG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XHJcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XHJcblx0XHR2YXIgZW5kbW9udGggPSBlbmQuZ2V0TW9udGgoKTtcclxuXHJcblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XHJcblx0XHRcdHdoaWxlKGogPCAxMikge1xyXG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxyXG5cdFx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGosICdtJylcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRqICs9IDE7XHJcblx0XHRcdH1cclxuXHRcdFx0aSArPSAxO1xyXG5cdFx0XHRqID0gMDtcclxuXHRcdH1cclxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGggJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcclxuXHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihlbmQuY2xvbmUoKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKSwgZW5kKSxcclxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xyXG5cdH0sXHJcblx0Y2FsY3VsYXRlSW50ZXJ2YWxzOiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xyXG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGVzKCk7XHJcblx0fSxcclxuXHRjb25EVG9UOihmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGRUb1RleHQ9e1xyXG5cdFx0XHQnc3RhcnQnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnZHVyYXRpb24nOmZ1bmN0aW9uKHZhbHVlLG1vZGVsKXtcclxuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdzdGF0dXMnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xyXG5cdFx0XHRcdFx0JzExMCc6J2NvbXBsZXRlJyxcclxuXHRcdFx0XHRcdCcxMDknOidvcGVuJyxcclxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0cmV0dXJuIHN0YXR1c2VzW3ZhbHVlXTtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcclxuXHRcdFx0cmV0dXJuIGRUb1RleHRbZmllbGRdP2RUb1RleHRbZmllbGRdKHZhbHVlLG1vZGVsKTp2YWx1ZTtcclxuXHRcdH07XHJcblx0fSgpKVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBSZXNDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uJyk7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgU3ViVGFza3MgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcbiAgICBjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcclxuICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcclxuICAgIH1cclxufSk7XHJcblxyXG52YXIgcmVzTGlua3MgPSBuZXcgUmVzQ29sbGVjdGlvbigpO1xyXG5yZXNMaW5rcy5mZXRjaCgpO1xyXG5cclxudmFyIFRhc2tNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcbiAgICBkZWZhdWx0czoge1xyXG4gICAgICAgIC8vIE1BSU4gUEFSQU1TXHJcbiAgICAgICAgbmFtZTogJ05ldyB0YXNrJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgY29tcGxldGU6IDAsICAvLyAwJSAtIDEwMCUgcGVyY2VudHNcclxuICAgICAgICBzb3J0aW5kZXg6IDAsICAgLy8gcGxhY2Ugb24gc2lkZSBtZW51LCBzdGFydHMgZnJvbSAwXHJcbiAgICAgICAgZGVwZW5kOiB1bmRlZmluZWQsICAvLyBpZCBvZiB0YXNrXHJcbiAgICAgICAgc3RhdHVzOiAnMTEwJywgICAgICAvLyAxMTAgLSBjb21wbGV0ZSwgMTA5ICAtIG9wZW4sIDEwOCAtIHJlYWR5XHJcbiAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgZW5kOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHBhcmVudGlkOiAwLFxyXG5cclxuICAgICAgICBjb2xvcjogJyMwMDkwZDMnLCAgIC8vIHVzZXIgY29sb3IsIG5vdCB1c2VkIGZvciBub3dcclxuXHJcbiAgICAgICAgLy8gc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXNcclxuICAgICAgICByZXNvdXJjZXMgOiBbXSwgICAgICAgICAvL2xpc3Qgb2YgaWRcclxuICAgICAgICBoZWFsdGg6IDIxLFxyXG4gICAgICAgIHJlcG9ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdvOiAyLCAgICAgICAgICAgICAgICAgIC8vU2VsZWN0IExpc3QgaW4gcHJvcGVydGllcyBtb2RhbCAgIChjb25maWdkYXRhKVxyXG4gICAgICAgIG1pbGVzdG9uZTogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZGVsaXZlcmFibGU6IGZhbHNlLCAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBmaW5hbmNpYWw6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIHRpbWVzaGVldHM6IGZhbHNlLCAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgYWN0dGltZXNoZWV0czogZmFsc2UsICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuXHJcbiAgICAgICAgLy8gc2VydmVyIHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIC8vIGRvbid0IHVzZSB0aGVtIG9uIGNsaWVudCBzaWRlXHJcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5LFxyXG5cclxuXHJcbiAgICAgICAgLy8gcGFyYW1zIGZvciBhcHBsaWNhdGlvbiB2aWV3c1xyXG4gICAgICAgIC8vIHNob3VsZCBiZSByZW1vdmVkIGZyb20gSlNPTlxyXG4gICAgICAgIGhpZGRlbiA6IGZhbHNlLFxyXG4gICAgICAgIGNvbGxhcHNlZCA6IGZhbHNlLFxyXG4gICAgICAgIGhpZ2h0bGlnaHQgOiAnJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gbmV3IFN1YlRhc2tzKCk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdldCgncGFyZW50aWQnKSA9PT0gdGhpcy5pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucmVtb3ZlKGNoaWxkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpzb3J0aW5kZXgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja1RpbWUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldCgnY29sbGFwc2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGVja2luZyBuZXN0ZWQgc3RhdGVcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlJywgdGhpcy5fY2hlY2tOZXN0ZWQpO1xyXG5cclxuICAgICAgICAvLyB0aW1lIGNoZWNraW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl9jaGVja0NvbXBsZXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnJlc291cmNlcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXNMaW5rcy51cGRhdGVSZXNvdXJjZXNGb3JUYXNrKHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGlzTmVzdGVkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICB9LFxyXG4gICAgc2hvdyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XHJcbiAgICB9LFxyXG4gICAgaGlkZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCB0cnVlKTtcclxuICAgIH0sXHJcbiAgICBkZXBlbmRPbiA6IGZ1bmN0aW9uKGJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2RlcGVuZCcsIGJlZm9yZU1vZGVsLmlkKTtcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB0aGlzLl9saXN0ZW5CZWZvcmVNb2RlbCgpO1xyXG4gICAgfSxcclxuICAgIHRvSlNPTiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBqc29uID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLnJlc291cmNlcztcclxuICAgICAgICBkZWxldGUganNvbi5oaWRkZW47XHJcbiAgICAgICAgZGVsZXRlIGpzb24uY29sbGFwc2VkO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmhpZ2h0bGlnaHQ7XHJcbiAgICAgICAgcmV0dXJuIGpzb247XHJcbiAgICB9LFxyXG4gICAgY2xlYXJEZXBlbmRlbmNlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKHRoaXMuYmVmb3JlTW9kZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnVuc2V0KCdkZXBlbmQnKS5zYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYmVmb3JlTW9kZWwgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhhc1BhcmVudCA6IGZ1bmN0aW9uKHBhcmVudEZvckNoZWNrKSB7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xyXG4gICAgICAgIHdoaWxlKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFyZW50ID09PSBwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2xpc3RlbkJlZm9yZU1vZGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyRGVwZW5kZW5jZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZTplbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LnVuZGVyTW92aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2hlY2sgaW5maW5pdGUgZGVwZW5kIGxvb3BcclxuICAgICAgICAgICAgdmFyIGJlZm9yZSA9IHRoaXM7XHJcbiAgICAgICAgICAgIHZhciBiZWZvcmVzID0gW107XHJcbiAgICAgICAgICAgIHdoaWxlKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGJlZm9yZSA9IGJlZm9yZS5iZWZvcmVNb2RlbDtcclxuICAgICAgICAgICAgICAgIGlmICghYmVmb3JlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoYmVmb3Jlcy5pbmRleE9mKGJlZm9yZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYmVmb3Jlcy5wdXNoKGJlZm9yZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tOZXN0ZWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ25lc3RlZFN0YXRlQ2hhbmdlJywgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0LCBlbmQ7XHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5zdGFydCkpe1xyXG4gICAgICAgICAgICBzdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwnZGQvTU0veXl5eScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2Uuc3RhcnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcclxuICAgICAgICAgICAgZW5kID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2UuZW5kKSwnZGQvTU0veXl5eScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLmVuZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZW5kID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gc3RhcnQgPCBlbmQgPyBzdGFydCA6IGVuZDtcclxuICAgICAgICByZXNwb25zZS5lbmQgPSBzdGFydCA8IGVuZCA/IGVuZCA6IHN0YXJ0O1xyXG5cclxuICAgICAgICByZXNwb25zZS5wYXJlbnRpZCA9IHBhcnNlSW50KHJlc3BvbnNlLnBhcmVudGlkIHx8ICcwJywgMTApO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgbnVsbCBwYXJhbXNcclxuICAgICAgICBfLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSByZXNvdXJjZXMgYXMgbGlzdCBvZiBJRFxyXG4gICAgICAgIHZhciBpZHMgPSBbXTtcclxuICAgICAgICAocmVzcG9uc2UuUmVzb3VyY2VzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc0luZm8pIHtcclxuICAgICAgICAgICAgaWRzLnB1c2gocmVzSW5mby5SZXNJRCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzcG9uc2UuUmVzb3VyY2VzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJlc3BvbnNlLnJlc291cmNlcyA9IGlkcztcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrVGltZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnc3RhcnQnKTtcclxuICAgICAgICB2YXIgZW5kVGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdlbmQnKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhcnRUaW1lID0gY2hpbGQuZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcclxuICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUgPCBzdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGNoaWxkU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZSA+IGVuZFRpbWUpe1xyXG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IGNoaWxkRW5kVGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0Jywgc3RhcnRUaW1lKTtcclxuICAgICAgICB0aGlzLnNldCgnZW5kJywgZW5kVGltZSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrQ29tcGxldGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29tcGxldGUgPSAwO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGUgKz0gY2hpbGQuZ2V0KCdjb21wbGV0ZScpIC8gbGVuZ3RoO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXQoJ2NvbXBsZXRlJywgTWF0aC5yb3VuZChjb21wbGV0ZSkpO1xyXG4gICAgfSxcclxuICAgIG1vdmVUb1N0YXJ0IDogZnVuY3Rpb24obmV3U3RhcnQpIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5ldyBzdGFydCBpcyB0aGUgc2FtZSBhcyBjdXJyZW50XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0LnRvRGF0ZVN0cmluZygpID09PSB0aGlzLmdldCgnc3RhcnQnKS50b0RhdGVTdHJpbmcoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgb2Zmc2V0XHJcbi8vICAgICAgICB2YXIgZGF5c0RpZmYgPSBNYXRoLmZsb29yKChuZXdTdGFydC50aW1lKCkgLSB0aGlzLmdldCgnc3RhcnQnKS50aW1lKCkpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNClcclxuICAgICAgICB2YXIgZGF5c0RpZmYgPSBEYXRlLmRheXNkaWZmKG5ld1N0YXJ0LCB0aGlzLmdldCgnc3RhcnQnKSkgLSAxO1xyXG4gICAgICAgIGlmIChuZXdTdGFydCA8IHRoaXMuZ2V0KCdzdGFydCcpKSB7XHJcbiAgICAgICAgICAgIGRheXNEaWZmICo9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hhbmdlIGRhdGVzXHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydCA6IG5ld1N0YXJ0LmNsb25lKCksXHJcbiAgICAgICAgICAgIGVuZCA6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5c0RpZmYpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZXMgZGF0ZXMgaW4gYWxsIGNoaWxkcmVuXHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXNEaWZmKTtcclxuICAgICAgICB0aGlzLnVuZGVyTW92aW5nID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDaGlsZHJlbiA6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQubW92ZShkYXlzKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlV2l0aENoaWxkcmVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGFzay5zYXZlV2l0aENoaWxkcmVuKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZSA6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMoZGF5cyksXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5nZXQoJ2VuZCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tNb2RlbDtcclxuIiwidmFyIG1vbnRoc0NvZGU9WydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcblxubW9kdWxlLmV4cG9ydHMuY29ycmVjdGRhdGUgPSBmdW5jdGlvbihzdHIpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiBzdHI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRkYXRhID0gZnVuY3Rpb24odmFsLCB0eXBlKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZiAodHlwZSA9PT0gJ20nKSB7XG5cdFx0cmV0dXJuIG1vbnRoc0NvZGVbdmFsXTtcblx0fVxuXHRyZXR1cm4gdmFsO1xufTtcblxubW9kdWxlLmV4cG9ydHMuaGZ1bmMgPSBmdW5jdGlvbihwb3MpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiB7XG5cdFx0eDogcG9zLngsXG5cdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHR9O1xufTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikge1xuXHR2YXIgcGFyYW1zID0ge307XG5cdHZhciBwcm1hcnIgPSBwcm1zdHIuc3BsaXQoJyYnKTtcblx0dmFyIGksIHRtcGFycjtcblx0Zm9yIChpID0gMDsgaSA8IHBybWFyci5sZW5ndGg7IGkrKykge1xuXHRcdHRtcGFyciA9IHBybWFycltpXS5zcGxpdCgnPScpO1xuXHRcdHBhcmFtc1t0bXBhcnJbMF1dID0gdG1wYXJyWzFdO1xuXHR9XG5cdHJldHVybiBwYXJhbXM7XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldFVSTFBhcmFtcyA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHR2YXIgcHJtc3RyID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSk7XG5cdHJldHVybiBwcm1zdHIgIT09IG51bGwgJiYgcHJtc3RyICE9PSAnJyA/IHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIDoge307XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgeG1sID0gXCI8P3htbCB2ZXJzaW9uPVxcXCIxLjBcXFwiIGVuY29kaW5nPVxcXCJVVEYtOFxcXCIgc3RhbmRhbG9uZT1cXFwieWVzXFxcIj8+XFxyXFxuPFByb2plY3QgeG1sbnM9XFxcImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vcHJvamVjdFxcXCI+XFxyXFxuICAgIDxTYXZlVmVyc2lvbj4xNDwvU2F2ZVZlcnNpb24+XFxyXFxuICAgIDxOYW1lPkdhbnR0IFRhc2tzLnhtbDwvTmFtZT5cXHJcXG4gICAgPFRpdGxlPkdhbnR0IFRhc2tzPC9UaXRsZT5cXHJcXG4gICAgPENyZWF0aW9uRGF0ZT48JT0gY3VycmVudERhdGUgJT48L0NyZWF0aW9uRGF0ZT5cXHJcXG4gICAgPExhc3RTYXZlZD48JT0gY3VycmVudERhdGUgJT48L0xhc3RTYXZlZD5cXHJcXG4gICAgPFNjaGVkdWxlRnJvbVN0YXJ0PjE8L1NjaGVkdWxlRnJvbVN0YXJ0PlxcclxcbiAgICA8U3RhcnREYXRlPjwlPSBzdGFydERhdGUgJT48L1N0YXJ0RGF0ZT5cXHJcXG4gICAgPEZpbmlzaERhdGU+PCU9IGZpbmlzaERhdGUgJT48L0ZpbmlzaERhdGU+XFxyXFxuICAgIDxGWVN0YXJ0RGF0ZT4xPC9GWVN0YXJ0RGF0ZT5cXHJcXG4gICAgPENyaXRpY2FsU2xhY2tMaW1pdD4wPC9Dcml0aWNhbFNsYWNrTGltaXQ+XFxyXFxuICAgIDxDdXJyZW5jeURpZ2l0cz4yPC9DdXJyZW5jeURpZ2l0cz5cXHJcXG4gICAgPEN1cnJlbmN5U3ltYm9sPiQ8L0N1cnJlbmN5U3ltYm9sPlxcclxcbiAgICA8Q3VycmVuY3lDb2RlPlVTRDwvQ3VycmVuY3lDb2RlPlxcclxcbiAgICA8Q3VycmVuY3lTeW1ib2xQb3NpdGlvbj4wPC9DdXJyZW5jeVN5bWJvbFBvc2l0aW9uPlxcclxcbiAgICA8Q2FsZW5kYXJVSUQ+MTwvQ2FsZW5kYXJVSUQ+XFxyXFxuICAgIDxEZWZhdWx0U3RhcnRUaW1lPjA4OjAwOjAwPC9EZWZhdWx0U3RhcnRUaW1lPlxcclxcbiAgICA8RGVmYXVsdEZpbmlzaFRpbWU+MTc6MDA6MDA8L0RlZmF1bHRGaW5pc2hUaW1lPlxcclxcbiAgICA8TWludXRlc1BlckRheT40ODA8L01pbnV0ZXNQZXJEYXk+XFxyXFxuICAgIDxNaW51dGVzUGVyV2Vlaz4yNDAwPC9NaW51dGVzUGVyV2Vlaz5cXHJcXG4gICAgPERheXNQZXJNb250aD4yMDwvRGF5c1Blck1vbnRoPlxcclxcbiAgICA8RGVmYXVsdFRhc2tUeXBlPjA8L0RlZmF1bHRUYXNrVHlwZT5cXHJcXG4gICAgPERlZmF1bHRGaXhlZENvc3RBY2NydWFsPjM8L0RlZmF1bHRGaXhlZENvc3RBY2NydWFsPlxcclxcbiAgICA8RGVmYXVsdFN0YW5kYXJkUmF0ZT4wPC9EZWZhdWx0U3RhbmRhcmRSYXRlPlxcclxcbiAgICA8RGVmYXVsdE92ZXJ0aW1lUmF0ZT4wPC9EZWZhdWx0T3ZlcnRpbWVSYXRlPlxcclxcbiAgICA8RHVyYXRpb25Gb3JtYXQ+NzwvRHVyYXRpb25Gb3JtYXQ+XFxyXFxuICAgIDxXb3JrRm9ybWF0PjI8L1dvcmtGb3JtYXQ+XFxyXFxuICAgIDxFZGl0YWJsZUFjdHVhbENvc3RzPjA8L0VkaXRhYmxlQWN0dWFsQ29zdHM+XFxyXFxuICAgIDxIb25vckNvbnN0cmFpbnRzPjA8L0hvbm9yQ29uc3RyYWludHM+XFxyXFxuICAgIDxJbnNlcnRlZFByb2plY3RzTGlrZVN1bW1hcnk+MTwvSW5zZXJ0ZWRQcm9qZWN0c0xpa2VTdW1tYXJ5PlxcclxcbiAgICA8TXVsdGlwbGVDcml0aWNhbFBhdGhzPjA8L011bHRpcGxlQ3JpdGljYWxQYXRocz5cXHJcXG4gICAgPE5ld1Rhc2tzRWZmb3J0RHJpdmVuPjE8L05ld1Rhc2tzRWZmb3J0RHJpdmVuPlxcclxcbiAgICA8TmV3VGFza3NFc3RpbWF0ZWQ+MTwvTmV3VGFza3NFc3RpbWF0ZWQ+XFxyXFxuICAgIDxTcGxpdHNJblByb2dyZXNzVGFza3M+MTwvU3BsaXRzSW5Qcm9ncmVzc1Rhc2tzPlxcclxcbiAgICA8U3ByZWFkQWN0dWFsQ29zdD4wPC9TcHJlYWRBY3R1YWxDb3N0PlxcclxcbiAgICA8U3ByZWFkUGVyY2VudENvbXBsZXRlPjA8L1NwcmVhZFBlcmNlbnRDb21wbGV0ZT5cXHJcXG4gICAgPFRhc2tVcGRhdGVzUmVzb3VyY2U+MTwvVGFza1VwZGF0ZXNSZXNvdXJjZT5cXHJcXG4gICAgPEZpc2NhbFllYXJTdGFydD4wPC9GaXNjYWxZZWFyU3RhcnQ+XFxyXFxuICAgIDxXZWVrU3RhcnREYXk+MDwvV2Vla1N0YXJ0RGF5PlxcclxcbiAgICA8TW92ZUNvbXBsZXRlZEVuZHNCYWNrPjA8L01vdmVDb21wbGV0ZWRFbmRzQmFjaz5cXHJcXG4gICAgPE1vdmVSZW1haW5pbmdTdGFydHNCYWNrPjA8L01vdmVSZW1haW5pbmdTdGFydHNCYWNrPlxcclxcbiAgICA8TW92ZVJlbWFpbmluZ1N0YXJ0c0ZvcndhcmQ+MDwvTW92ZVJlbWFpbmluZ1N0YXJ0c0ZvcndhcmQ+XFxyXFxuICAgIDxNb3ZlQ29tcGxldGVkRW5kc0ZvcndhcmQ+MDwvTW92ZUNvbXBsZXRlZEVuZHNGb3J3YXJkPlxcclxcbiAgICA8QmFzZWxpbmVGb3JFYXJuZWRWYWx1ZT4wPC9CYXNlbGluZUZvckVhcm5lZFZhbHVlPlxcclxcbiAgICA8QXV0b0FkZE5ld1Jlc291cmNlc0FuZFRhc2tzPjE8L0F1dG9BZGROZXdSZXNvdXJjZXNBbmRUYXNrcz5cXHJcXG4gICAgPEN1cnJlbnREYXRlPjwlPSBjdXJyZW50RGF0ZSAlPjwvQ3VycmVudERhdGU+XFxyXFxuICAgIDxNaWNyb3NvZnRQcm9qZWN0U2VydmVyVVJMPjE8L01pY3Jvc29mdFByb2plY3RTZXJ2ZXJVUkw+XFxyXFxuICAgIDxBdXRvbGluaz4xPC9BdXRvbGluaz5cXHJcXG4gICAgPE5ld1Rhc2tTdGFydERhdGU+MDwvTmV3VGFza1N0YXJ0RGF0ZT5cXHJcXG4gICAgPE5ld1Rhc2tzQXJlTWFudWFsPjA8L05ld1Rhc2tzQXJlTWFudWFsPlxcclxcbiAgICA8RGVmYXVsdFRhc2tFVk1ldGhvZD4wPC9EZWZhdWx0VGFza0VWTWV0aG9kPlxcclxcbiAgICA8UHJvamVjdEV4dGVybmFsbHlFZGl0ZWQ+MDwvUHJvamVjdEV4dGVybmFsbHlFZGl0ZWQ+XFxyXFxuICAgIDxFeHRlbmRlZENyZWF0aW9uRGF0ZT4xOTg0LTAxLTAxVDAwOjAwOjAwPC9FeHRlbmRlZENyZWF0aW9uRGF0ZT5cXHJcXG4gICAgPEFjdHVhbHNJblN5bmM+MDwvQWN0dWFsc0luU3luYz5cXHJcXG4gICAgPFJlbW92ZUZpbGVQcm9wZXJ0aWVzPjA8L1JlbW92ZUZpbGVQcm9wZXJ0aWVzPlxcclxcbiAgICA8QWRtaW5Qcm9qZWN0PjA8L0FkbWluUHJvamVjdD5cXHJcXG4gICAgPFVwZGF0ZU1hbnVhbGx5U2NoZWR1bGVkVGFza3NXaGVuRWRpdGluZ0xpbmtzPjE8L1VwZGF0ZU1hbnVhbGx5U2NoZWR1bGVkVGFza3NXaGVuRWRpdGluZ0xpbmtzPlxcclxcbiAgICA8S2VlcFRhc2tPbk5lYXJlc3RXb3JraW5nVGltZVdoZW5NYWRlQXV0b1NjaGVkdWxlZD4wPC9LZWVwVGFza09uTmVhcmVzdFdvcmtpbmdUaW1lV2hlbk1hZGVBdXRvU2NoZWR1bGVkPlxcclxcbiAgICA8T3V0bGluZUNvZGVzLz5cXHJcXG4gICAgPFdCU01hc2tzLz5cXHJcXG4gICAgPEV4dGVuZGVkQXR0cmlidXRlcz5cXHJcXG4gICAgICAgIDxFeHRlbmRlZEF0dHJpYnV0ZT5cXHJcXG4gICAgICAgICAgICA8RmllbGRJRD4xODg3NDM3NTI8L0ZpZWxkSUQ+XFxyXFxuICAgICAgICAgICAgPEZpZWxkTmFtZT5GbGFnMTwvRmllbGROYW1lPlxcclxcbiAgICAgICAgICAgIDxHdWlkPjAwMDAzOUI3LThCQkUtNENFQi04MkM0LUZBOEMwQjQwMDA0ODwvR3VpZD5cXHJcXG4gICAgICAgICAgICA8U2Vjb25kYXJ5UElEPjI1NTg2ODkzODwvU2Vjb25kYXJ5UElEPlxcclxcbiAgICAgICAgICAgIDxTZWNvbmRhcnlHdWlkPjAwMDAzOUI3LThCQkUtNENFQi04MkM0LUZBOEMwRjQwNDAwQTwvU2Vjb25kYXJ5R3VpZD5cXHJcXG4gICAgICAgIDwvRXh0ZW5kZWRBdHRyaWJ1dGU+XFxyXFxuICAgICAgICA8RXh0ZW5kZWRBdHRyaWJ1dGU+XFxyXFxuICAgICAgICAgICAgPEZpZWxkSUQ+MTg4NzQ0MDA2PC9GaWVsZElEPlxcclxcbiAgICAgICAgICAgIDxGaWVsZE5hbWU+VGV4dDIwPC9GaWVsZE5hbWU+XFxyXFxuICAgICAgICAgICAgPEd1aWQ+MDAwMDM5QjctOEJCRS00Q0VCLTgyQzQtRkE4QzBCNDAwMTQ2PC9HdWlkPlxcclxcbiAgICAgICAgICAgIDxTZWNvbmRhcnlQSUQ+MjU1ODY5MDQ3PC9TZWNvbmRhcnlQSUQ+XFxyXFxuICAgICAgICAgICAgPFNlY29uZGFyeUd1aWQ+MDAwMDM5QjctOEJCRS00Q0VCLTgyQzQtRkE4QzBGNDA0MDc3PC9TZWNvbmRhcnlHdWlkPlxcclxcbiAgICAgICAgPC9FeHRlbmRlZEF0dHJpYnV0ZT5cXHJcXG4gICAgPC9FeHRlbmRlZEF0dHJpYnV0ZXM+XFxyXFxuICAgIDxDYWxlbmRhcnM+XFxyXFxuICAgICAgICA8Q2FsZW5kYXI+XFxyXFxuICAgICAgICAgICAgPFVJRD4xPC9VSUQ+XFxyXFxuICAgICAgICAgICAgPE5hbWU+U3RhbmRhcmQ8L05hbWU+XFxyXFxuICAgICAgICAgICAgPElzQmFzZUNhbGVuZGFyPjE8L0lzQmFzZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VsaW5lQ2FsZW5kYXI+MDwvSXNCYXNlbGluZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxCYXNlQ2FsZW5kYXJVSUQ+LTE8L0Jhc2VDYWxlbmRhclVJRD5cXHJcXG4gICAgICAgICAgICA8V2Vla0RheXM+XFxyXFxuICAgICAgICAgICAgICAgIDxXZWVrRGF5PlxcclxcbiAgICAgICAgICAgICAgICAgICAgPERheVR5cGU+MTwvRGF5VHlwZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxEYXlXb3JraW5nPjA8L0RheVdvcmtpbmc+XFxyXFxuICAgICAgICAgICAgICAgIDwvV2Vla0RheT5cXHJcXG4gICAgICAgICAgICAgICAgPFdlZWtEYXk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8RGF5VHlwZT4yPC9EYXlUeXBlPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPERheVdvcmtpbmc+MTwvRGF5V29ya2luZz5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxXb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPFdvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJvbVRpbWU+MDg6MDA6MDA8L0Zyb21UaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VG9UaW1lPjEyOjAwOjAwPC9Ub1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8V29ya2luZ1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcm9tVGltZT4xMzowMDowMDwvRnJvbVRpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUb1RpbWU+MTc6MDA6MDA8L1RvVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L1dvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgIDwvV2Vla0RheT5cXHJcXG4gICAgICAgICAgICAgICAgPFdlZWtEYXk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8RGF5VHlwZT4zPC9EYXlUeXBlPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPERheVdvcmtpbmc+MTwvRGF5V29ya2luZz5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxXb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPFdvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJvbVRpbWU+MDg6MDA6MDA8L0Zyb21UaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VG9UaW1lPjEyOjAwOjAwPC9Ub1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8V29ya2luZ1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcm9tVGltZT4xMzowMDowMDwvRnJvbVRpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUb1RpbWU+MTc6MDA6MDA8L1RvVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L1dvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgIDwvV2Vla0RheT5cXHJcXG4gICAgICAgICAgICAgICAgPFdlZWtEYXk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8RGF5VHlwZT40PC9EYXlUeXBlPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPERheVdvcmtpbmc+MTwvRGF5V29ya2luZz5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxXb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPFdvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJvbVRpbWU+MDg6MDA6MDA8L0Zyb21UaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VG9UaW1lPjEyOjAwOjAwPC9Ub1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8V29ya2luZ1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcm9tVGltZT4xMzowMDowMDwvRnJvbVRpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUb1RpbWU+MTc6MDA6MDA8L1RvVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L1dvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgIDwvV2Vla0RheT5cXHJcXG4gICAgICAgICAgICAgICAgPFdlZWtEYXk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8RGF5VHlwZT41PC9EYXlUeXBlPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPERheVdvcmtpbmc+MTwvRGF5V29ya2luZz5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxXb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPFdvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJvbVRpbWU+MDg6MDA6MDA8L0Zyb21UaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VG9UaW1lPjEyOjAwOjAwPC9Ub1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8V29ya2luZ1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcm9tVGltZT4xMzowMDowMDwvRnJvbVRpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUb1RpbWU+MTc6MDA6MDA8L1RvVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L1dvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgIDwvV2Vla0RheT5cXHJcXG4gICAgICAgICAgICAgICAgPFdlZWtEYXk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8RGF5VHlwZT42PC9EYXlUeXBlPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPERheVdvcmtpbmc+MTwvRGF5V29ya2luZz5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxXb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPFdvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJvbVRpbWU+MDg6MDA6MDA8L0Zyb21UaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VG9UaW1lPjEyOjAwOjAwPC9Ub1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8V29ya2luZ1RpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcm9tVGltZT4xMzowMDowMDwvRnJvbVRpbWU+XFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUb1RpbWU+MTc6MDA6MDA8L1RvVGltZT5cXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICA8L1dvcmtpbmdUaW1lPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPC9Xb3JraW5nVGltZXM+XFxyXFxuICAgICAgICAgICAgICAgIDwvV2Vla0RheT5cXHJcXG4gICAgICAgICAgICAgICAgPFdlZWtEYXk+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8RGF5VHlwZT43PC9EYXlUeXBlPlxcclxcbiAgICAgICAgICAgICAgICAgICAgPERheVdvcmtpbmc+MDwvRGF5V29ya2luZz5cXHJcXG4gICAgICAgICAgICAgICAgPC9XZWVrRGF5PlxcclxcbiAgICAgICAgICAgIDwvV2Vla0RheXM+XFxyXFxuICAgICAgICA8L0NhbGVuZGFyPlxcclxcbiAgICAgICAgPENhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxVSUQ+MzwvVUlEPlxcclxcbiAgICAgICAgICAgIDxOYW1lPk1hbmFnZW1lbnQ8L05hbWU+XFxyXFxuICAgICAgICAgICAgPElzQmFzZUNhbGVuZGFyPjA8L0lzQmFzZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VsaW5lQ2FsZW5kYXI+MDwvSXNCYXNlbGluZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxCYXNlQ2FsZW5kYXJVSUQ+MTwvQmFzZUNhbGVuZGFyVUlEPlxcclxcbiAgICAgICAgPC9DYWxlbmRhcj5cXHJcXG4gICAgICAgIDxDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8VUlEPjQ8L1VJRD5cXHJcXG4gICAgICAgICAgICA8TmFtZT5Qcm9qZWN0IE1hbmFnZXI8L05hbWU+XFxyXFxuICAgICAgICAgICAgPElzQmFzZUNhbGVuZGFyPjA8L0lzQmFzZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VsaW5lQ2FsZW5kYXI+MDwvSXNCYXNlbGluZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxCYXNlQ2FsZW5kYXJVSUQ+MTwvQmFzZUNhbGVuZGFyVUlEPlxcclxcbiAgICAgICAgPC9DYWxlbmRhcj5cXHJcXG4gICAgICAgIDxDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8VUlEPjU8L1VJRD5cXHJcXG4gICAgICAgICAgICA8TmFtZT5BbmFseXN0PC9OYW1lPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VDYWxlbmRhcj4wPC9Jc0Jhc2VDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8SXNCYXNlbGluZUNhbGVuZGFyPjA8L0lzQmFzZWxpbmVDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8QmFzZUNhbGVuZGFyVUlEPjE8L0Jhc2VDYWxlbmRhclVJRD5cXHJcXG4gICAgICAgIDwvQ2FsZW5kYXI+XFxyXFxuICAgICAgICA8Q2FsZW5kYXI+XFxyXFxuICAgICAgICAgICAgPFVJRD42PC9VSUQ+XFxyXFxuICAgICAgICAgICAgPE5hbWU+RGV2ZWxvcGVyPC9OYW1lPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VDYWxlbmRhcj4wPC9Jc0Jhc2VDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8SXNCYXNlbGluZUNhbGVuZGFyPjA8L0lzQmFzZWxpbmVDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8QmFzZUNhbGVuZGFyVUlEPjE8L0Jhc2VDYWxlbmRhclVJRD5cXHJcXG4gICAgICAgIDwvQ2FsZW5kYXI+XFxyXFxuICAgICAgICA8Q2FsZW5kYXI+XFxyXFxuICAgICAgICAgICAgPFVJRD43PC9VSUQ+XFxyXFxuICAgICAgICAgICAgPE5hbWU+VGVzdGVyczwvTmFtZT5cXHJcXG4gICAgICAgICAgICA8SXNCYXNlQ2FsZW5kYXI+MDwvSXNCYXNlQ2FsZW5kYXI+XFxyXFxuICAgICAgICAgICAgPElzQmFzZWxpbmVDYWxlbmRhcj4wPC9Jc0Jhc2VsaW5lQ2FsZW5kYXI+XFxyXFxuICAgICAgICAgICAgPEJhc2VDYWxlbmRhclVJRD4xPC9CYXNlQ2FsZW5kYXJVSUQ+XFxyXFxuICAgICAgICA8L0NhbGVuZGFyPlxcclxcbiAgICAgICAgPENhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxVSUQ+ODwvVUlEPlxcclxcbiAgICAgICAgICAgIDxOYW1lPlRyYWluZXJzPC9OYW1lPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VDYWxlbmRhcj4wPC9Jc0Jhc2VDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8SXNCYXNlbGluZUNhbGVuZGFyPjA8L0lzQmFzZWxpbmVDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8QmFzZUNhbGVuZGFyVUlEPjE8L0Jhc2VDYWxlbmRhclVJRD5cXHJcXG4gICAgICAgIDwvQ2FsZW5kYXI+XFxyXFxuICAgICAgICA8Q2FsZW5kYXI+XFxyXFxuICAgICAgICAgICAgPFVJRD45PC9VSUQ+XFxyXFxuICAgICAgICAgICAgPE5hbWU+VGVjaG5pY2FsIENvbW11bmljYXRvcnM8L05hbWU+XFxyXFxuICAgICAgICAgICAgPElzQmFzZUNhbGVuZGFyPjA8L0lzQmFzZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VsaW5lQ2FsZW5kYXI+MDwvSXNCYXNlbGluZUNhbGVuZGFyPlxcclxcbiAgICAgICAgICAgIDxCYXNlQ2FsZW5kYXJVSUQ+MTwvQmFzZUNhbGVuZGFyVUlEPlxcclxcbiAgICAgICAgPC9DYWxlbmRhcj5cXHJcXG4gICAgICAgIDxDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8VUlEPjEwPC9VSUQ+XFxyXFxuICAgICAgICAgICAgPE5hbWU+RGVwbG95bWVudCBUZWFtPC9OYW1lPlxcclxcbiAgICAgICAgICAgIDxJc0Jhc2VDYWxlbmRhcj4wPC9Jc0Jhc2VDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8SXNCYXNlbGluZUNhbGVuZGFyPjA8L0lzQmFzZWxpbmVDYWxlbmRhcj5cXHJcXG4gICAgICAgICAgICA8QmFzZUNhbGVuZGFyVUlEPjE8L0Jhc2VDYWxlbmRhclVJRD5cXHJcXG4gICAgICAgIDwvQ2FsZW5kYXI+XFxyXFxuICAgIDwvQ2FsZW5kYXJzPlxcclxcbiAgICA8VGFza3M+XFxyXFxuICAgICAgICA8JSB0YXNrcy5mb3JFYWNoKGZ1bmN0aW9uKHRhc2speyAlPlxcclxcbiAgICAgICAgICAgIDxUYXNrPlxcclxcbiAgICAgICAgICAgICAgICA8VUlEPjwlPSB0YXNrLmlkICU+PC9VSUQ+XFxyXFxuICAgICAgICAgICAgICAgIDxJRD48JT0gdGFzay5pZCAlPjwvSUQ+XFxyXFxuICAgICAgICAgICAgICAgIDxOYW1lPjwlPSB0YXNrLm5hbWUgJT48L05hbWU+XFxyXFxuICAgICAgICAgICAgICAgIDxBY3RpdmU+MTwvQWN0aXZlPlxcclxcbiAgICAgICAgICAgICAgICA8TWFudWFsPjA8L01hbnVhbD5cXHJcXG4gICAgICAgICAgICAgICAgPFR5cGU+MTwvVHlwZT5cXHJcXG4gICAgICAgICAgICAgICAgPElzTnVsbD4wPC9Jc051bGw+XFxyXFxuICAgICAgICAgICAgICAgIDxDcmVhdGVEYXRlPjwlPSB0YXNrLnN0YXJ0ICU+PC9DcmVhdGVEYXRlPlxcclxcbiAgICAgICAgICAgICAgICA8V0JTPjA8L1dCUz5cXHJcXG4gICAgICAgICAgICAgICAgPE91dGxpbmVOdW1iZXI+MDwvT3V0bGluZU51bWJlcj5cXHJcXG4gICAgICAgICAgICAgICAgPE91dGxpbmVMZXZlbD4wPC9PdXRsaW5lTGV2ZWw+XFxyXFxuICAgICAgICAgICAgICAgIDxQcmlvcml0eT41MDA8L1ByaW9yaXR5PlxcclxcbiAgICAgICAgICAgICAgICA8U3RhcnQ+PCU9IHRhc2suc3RhcnQgJT48L1N0YXJ0PlxcclxcbiAgICAgICAgICAgICAgICA8RmluaXNoPjwlPSB0YXNrLmZpbmlzaCAlPjwvRmluaXNoPlxcclxcbiAgICAgICAgICAgICAgICA8RHVyYXRpb24+UFQ3NjZIME0wUzwvRHVyYXRpb24+XFxyXFxuICAgICAgICAgICAgICAgIDxNYW51YWxTdGFydD48JT0gdGFzay5zdGFydCAlPjwvTWFudWFsU3RhcnQ+XFxyXFxuICAgICAgICAgICAgICAgIDxNYW51YWxGaW5pc2g+PCU9IHRhc2suZmluaXNoICU+PC9NYW51YWxGaW5pc2g+XFxyXFxuICAgICAgICAgICAgICAgIDxNYW51YWxEdXJhdGlvbj5QVDc2NkgwTTBTPC9NYW51YWxEdXJhdGlvbj5cXHJcXG4gICAgICAgICAgICAgICAgPER1cmF0aW9uRm9ybWF0PjIxPC9EdXJhdGlvbkZvcm1hdD5cXHJcXG4gICAgICAgICAgICAgICAgPFdvcms+UFQxNTMySDBNMFM8L1dvcms+XFxyXFxuICAgICAgICAgICAgICAgIDxSZXN1bWVWYWxpZD4wPC9SZXN1bWVWYWxpZD5cXHJcXG4gICAgICAgICAgICAgICAgPEVmZm9ydERyaXZlbj4wPC9FZmZvcnREcml2ZW4+XFxyXFxuICAgICAgICAgICAgICAgIDxSZWN1cnJpbmc+MDwvUmVjdXJyaW5nPlxcclxcbiAgICAgICAgICAgICAgICA8T3ZlckFsbG9jYXRlZD4wPC9PdmVyQWxsb2NhdGVkPlxcclxcbiAgICAgICAgICAgICAgICA8RXN0aW1hdGVkPjA8L0VzdGltYXRlZD5cXHJcXG4gICAgICAgICAgICAgICAgPE1pbGVzdG9uZT4wPC9NaWxlc3RvbmU+XFxyXFxuICAgICAgICAgICAgICAgIDxTdW1tYXJ5PjE8L1N1bW1hcnk+XFxyXFxuICAgICAgICAgICAgICAgIDxEaXNwbGF5QXNTdW1tYXJ5PjA8L0Rpc3BsYXlBc1N1bW1hcnk+XFxyXFxuICAgICAgICAgICAgICAgIDxDcml0aWNhbD4xPC9Dcml0aWNhbD5cXHJcXG4gICAgICAgICAgICAgICAgPElzU3VicHJvamVjdD4wPC9Jc1N1YnByb2plY3Q+XFxyXFxuICAgICAgICAgICAgICAgIDxJc1N1YnByb2plY3RSZWFkT25seT4wPC9Jc1N1YnByb2plY3RSZWFkT25seT5cXHJcXG4gICAgICAgICAgICAgICAgPEV4dGVybmFsVGFzaz4wPC9FeHRlcm5hbFRhc2s+XFxyXFxuICAgICAgICAgICAgICAgIDxFYXJseVN0YXJ0PjwlPSB0YXNrLnN0YXJ0ICU+MDwvRWFybHlTdGFydD5cXHJcXG4gICAgICAgICAgICAgICAgPEVhcmx5RmluaXNoPjwlPSB0YXNrLmZpbmlzaCAlPjwvRWFybHlGaW5pc2g+XFxyXFxuICAgICAgICAgICAgICAgIDxMYXRlU3RhcnQ+PCU9IHRhc2suc3RhcnQgJT48L0xhdGVTdGFydD5cXHJcXG4gICAgICAgICAgICAgICAgPExhdGVGaW5pc2g+PCU9IHRhc2suZmluaXNoICU+PC9MYXRlRmluaXNoPlxcclxcbiAgICAgICAgICAgICAgICA8U3RhcnRWYXJpYW5jZT4wPC9TdGFydFZhcmlhbmNlPlxcclxcbiAgICAgICAgICAgICAgICA8RmluaXNoVmFyaWFuY2U+MDwvRmluaXNoVmFyaWFuY2U+XFxyXFxuICAgICAgICAgICAgICAgIDxXb3JrVmFyaWFuY2U+OTE5MjAwMDAuMDA8L1dvcmtWYXJpYW5jZT5cXHJcXG4gICAgICAgICAgICAgICAgPEZyZWVTbGFjaz4wPC9GcmVlU2xhY2s+XFxyXFxuICAgICAgICAgICAgICAgIDxUb3RhbFNsYWNrPjA8L1RvdGFsU2xhY2s+XFxyXFxuICAgICAgICAgICAgICAgIDxTdGFydFNsYWNrPjA8L1N0YXJ0U2xhY2s+XFxyXFxuICAgICAgICAgICAgICAgIDxGaW5pc2hTbGFjaz4wPC9GaW5pc2hTbGFjaz5cXHJcXG4gICAgICAgICAgICAgICAgPEZpeGVkQ29zdD4wPC9GaXhlZENvc3Q+XFxyXFxuICAgICAgICAgICAgICAgIDxGaXhlZENvc3RBY2NydWFsPjM8L0ZpeGVkQ29zdEFjY3J1YWw+XFxyXFxuICAgICAgICAgICAgICAgIDxQZXJjZW50Q29tcGxldGU+MDwvUGVyY2VudENvbXBsZXRlPlxcclxcbiAgICAgICAgICAgICAgICA8UGVyY2VudFdvcmtDb21wbGV0ZT4wPC9QZXJjZW50V29ya0NvbXBsZXRlPlxcclxcbiAgICAgICAgICAgICAgICA8Q29zdD4wPC9Db3N0PlxcclxcbiAgICAgICAgICAgICAgICA8T3ZlcnRpbWVDb3N0PjA8L092ZXJ0aW1lQ29zdD5cXHJcXG4gICAgICAgICAgICAgICAgPE92ZXJ0aW1lV29yaz5QVDBIME0wUzwvT3ZlcnRpbWVXb3JrPlxcclxcbiAgICAgICAgICAgICAgICA8QWN0dWFsRHVyYXRpb24+UFQwSDBNMFM8L0FjdHVhbER1cmF0aW9uPlxcclxcbiAgICAgICAgICAgICAgICA8QWN0dWFsQ29zdD4wPC9BY3R1YWxDb3N0PlxcclxcbiAgICAgICAgICAgICAgICA8QWN0dWFsT3ZlcnRpbWVDb3N0PjA8L0FjdHVhbE92ZXJ0aW1lQ29zdD5cXHJcXG4gICAgICAgICAgICAgICAgPEFjdHVhbFdvcms+UFQwSDBNMFM8L0FjdHVhbFdvcms+XFxyXFxuICAgICAgICAgICAgICAgIDxBY3R1YWxPdmVydGltZVdvcms+UFQwSDBNMFM8L0FjdHVhbE92ZXJ0aW1lV29yaz5cXHJcXG4gICAgICAgICAgICAgICAgPFJlZ3VsYXJXb3JrPlBUMTUzMkgwTTBTPC9SZWd1bGFyV29yaz5cXHJcXG4gICAgICAgICAgICAgICAgPFJlbWFpbmluZ0R1cmF0aW9uPlBUNzY2SDBNMFM8L1JlbWFpbmluZ0R1cmF0aW9uPlxcclxcbiAgICAgICAgICAgICAgICA8UmVtYWluaW5nQ29zdD4wPC9SZW1haW5pbmdDb3N0PlxcclxcbiAgICAgICAgICAgICAgICA8UmVtYWluaW5nV29yaz5QVDE1MzJIME0wUzwvUmVtYWluaW5nV29yaz5cXHJcXG4gICAgICAgICAgICAgICAgPFJlbWFpbmluZ092ZXJ0aW1lQ29zdD4wPC9SZW1haW5pbmdPdmVydGltZUNvc3Q+XFxyXFxuICAgICAgICAgICAgICAgIDxSZW1haW5pbmdPdmVydGltZVdvcms+UFQwSDBNMFM8L1JlbWFpbmluZ092ZXJ0aW1lV29yaz5cXHJcXG4gICAgICAgICAgICAgICAgPEFDV1A+MC4wMDwvQUNXUD5cXHJcXG4gICAgICAgICAgICAgICAgPENWPjAuMDA8L0NWPlxcclxcbiAgICAgICAgICAgICAgICA8Q29uc3RyYWludFR5cGU+MDwvQ29uc3RyYWludFR5cGU+XFxyXFxuICAgICAgICAgICAgICAgIDxDYWxlbmRhclVJRD4tMTwvQ2FsZW5kYXJVSUQ+XFxyXFxuICAgICAgICAgICAgICAgIDxMZXZlbEFzc2lnbm1lbnRzPjE8L0xldmVsQXNzaWdubWVudHM+XFxyXFxuICAgICAgICAgICAgICAgIDxMZXZlbGluZ0NhblNwbGl0PjE8L0xldmVsaW5nQ2FuU3BsaXQ+XFxyXFxuICAgICAgICAgICAgICAgIDxMZXZlbGluZ0RlbGF5PjA8L0xldmVsaW5nRGVsYXk+XFxyXFxuICAgICAgICAgICAgICAgIDxMZXZlbGluZ0RlbGF5Rm9ybWF0Pjg8L0xldmVsaW5nRGVsYXlGb3JtYXQ+XFxyXFxuICAgICAgICAgICAgICAgIDxJZ25vcmVSZXNvdXJjZUNhbGVuZGFyPjA8L0lnbm9yZVJlc291cmNlQ2FsZW5kYXI+XFxyXFxuICAgICAgICAgICAgICAgIDxIaWRlQmFyPjA8L0hpZGVCYXI+XFxyXFxuICAgICAgICAgICAgICAgIDxSb2xsdXA+MDwvUm9sbHVwPlxcclxcbiAgICAgICAgICAgICAgICA8QkNXUz4wLjAwPC9CQ1dTPlxcclxcbiAgICAgICAgICAgICAgICA8QkNXUD4wLjAwPC9CQ1dQPlxcclxcbiAgICAgICAgICAgICAgICA8UGh5c2ljYWxQZXJjZW50Q29tcGxldGU+MDwvUGh5c2ljYWxQZXJjZW50Q29tcGxldGU+XFxyXFxuICAgICAgICAgICAgICAgIDxFYXJuZWRWYWx1ZU1ldGhvZD4wPC9FYXJuZWRWYWx1ZU1ldGhvZD5cXHJcXG4gICAgICAgICAgICAgICAgPElzUHVibGlzaGVkPjA8L0lzUHVibGlzaGVkPlxcclxcbiAgICAgICAgICAgICAgICA8Q29tbWl0bWVudFR5cGU+MDwvQ29tbWl0bWVudFR5cGU+XFxyXFxuICAgICAgICAgICAgPC9UYXNrPjwlIH0pOyAlPlxcclxcbiAgICA8L1Rhc2tzPlxcclxcbiAgICA8UmVzb3VyY2VzPlxcclxcbiAgICAgICAgPFJlc291cmNlPlxcclxcbiAgICAgICAgICAgIDxVSUQ+MDwvVUlEPlxcclxcbiAgICAgICAgICAgIDxJRD4wPC9JRD5cXHJcXG4gICAgICAgICAgICA8VHlwZT4xPC9UeXBlPlxcclxcbiAgICAgICAgICAgIDxJc051bGw+MDwvSXNOdWxsPlxcclxcbiAgICAgICAgICAgIDxXb3JrR3JvdXA+MDwvV29ya0dyb3VwPlxcclxcbiAgICAgICAgICAgIDxNYXhVbml0cz4xLjAwPC9NYXhVbml0cz5cXHJcXG4gICAgICAgICAgICA8UGVha1VuaXRzPjAuMDA8L1BlYWtVbml0cz5cXHJcXG4gICAgICAgICAgICA8T3ZlckFsbG9jYXRlZD4wPC9PdmVyQWxsb2NhdGVkPlxcclxcbiAgICAgICAgICAgIDxDYW5MZXZlbD4xPC9DYW5MZXZlbD5cXHJcXG4gICAgICAgICAgICA8QWNjcnVlQXQ+MzwvQWNjcnVlQXQ+XFxyXFxuICAgICAgICAgICAgPFdvcms+UFQwSDBNMFM8L1dvcms+XFxyXFxuICAgICAgICAgICAgPFJlZ3VsYXJXb3JrPlBUMEgwTTBTPC9SZWd1bGFyV29yaz5cXHJcXG4gICAgICAgICAgICA8T3ZlcnRpbWVXb3JrPlBUMEgwTTBTPC9PdmVydGltZVdvcms+XFxyXFxuICAgICAgICAgICAgPEFjdHVhbFdvcms+UFQwSDBNMFM8L0FjdHVhbFdvcms+XFxyXFxuICAgICAgICAgICAgPFJlbWFpbmluZ1dvcms+UFQwSDBNMFM8L1JlbWFpbmluZ1dvcms+XFxyXFxuICAgICAgICAgICAgPEFjdHVhbE92ZXJ0aW1lV29yaz5QVDBIME0wUzwvQWN0dWFsT3ZlcnRpbWVXb3JrPlxcclxcbiAgICAgICAgICAgIDxSZW1haW5pbmdPdmVydGltZVdvcms+UFQwSDBNMFM8L1JlbWFpbmluZ092ZXJ0aW1lV29yaz5cXHJcXG4gICAgICAgICAgICA8UGVyY2VudFdvcmtDb21wbGV0ZT4wPC9QZXJjZW50V29ya0NvbXBsZXRlPlxcclxcbiAgICAgICAgICAgIDxTdGFuZGFyZFJhdGU+MDwvU3RhbmRhcmRSYXRlPlxcclxcbiAgICAgICAgICAgIDxTdGFuZGFyZFJhdGVGb3JtYXQ+MjwvU3RhbmRhcmRSYXRlRm9ybWF0PlxcclxcbiAgICAgICAgICAgIDxDb3N0PjA8L0Nvc3Q+XFxyXFxuICAgICAgICAgICAgPE92ZXJ0aW1lUmF0ZT4wPC9PdmVydGltZVJhdGU+XFxyXFxuICAgICAgICAgICAgPE92ZXJ0aW1lUmF0ZUZvcm1hdD4yPC9PdmVydGltZVJhdGVGb3JtYXQ+XFxyXFxuICAgICAgICAgICAgPE92ZXJ0aW1lQ29zdD4wPC9PdmVydGltZUNvc3Q+XFxyXFxuICAgICAgICAgICAgPENvc3RQZXJVc2U+MDwvQ29zdFBlclVzZT5cXHJcXG4gICAgICAgICAgICA8QWN0dWFsQ29zdD4wPC9BY3R1YWxDb3N0PlxcclxcbiAgICAgICAgICAgIDxBY3R1YWxPdmVydGltZUNvc3Q+MDwvQWN0dWFsT3ZlcnRpbWVDb3N0PlxcclxcbiAgICAgICAgICAgIDxSZW1haW5pbmdDb3N0PjA8L1JlbWFpbmluZ0Nvc3Q+XFxyXFxuICAgICAgICAgICAgPFJlbWFpbmluZ092ZXJ0aW1lQ29zdD4wPC9SZW1haW5pbmdPdmVydGltZUNvc3Q+XFxyXFxuICAgICAgICAgICAgPFdvcmtWYXJpYW5jZT4wLjAwPC9Xb3JrVmFyaWFuY2U+XFxyXFxuICAgICAgICAgICAgPENvc3RWYXJpYW5jZT4wPC9Db3N0VmFyaWFuY2U+XFxyXFxuICAgICAgICAgICAgPFNWPjAuMDA8L1NWPlxcclxcbiAgICAgICAgICAgIDxDVj4wLjAwPC9DVj5cXHJcXG4gICAgICAgICAgICA8QUNXUD4wLjAwPC9BQ1dQPlxcclxcbiAgICAgICAgICAgIDxDYWxlbmRhclVJRD4yPC9DYWxlbmRhclVJRD5cXHJcXG4gICAgICAgICAgICA8QkNXUz4wLjAwPC9CQ1dTPlxcclxcbiAgICAgICAgICAgIDxCQ1dQPjAuMDA8L0JDV1A+XFxyXFxuICAgICAgICAgICAgPElzR2VuZXJpYz4wPC9Jc0dlbmVyaWM+XFxyXFxuICAgICAgICAgICAgPElzSW5hY3RpdmU+MDwvSXNJbmFjdGl2ZT5cXHJcXG4gICAgICAgICAgICA8SXNFbnRlcnByaXNlPjA8L0lzRW50ZXJwcmlzZT5cXHJcXG4gICAgICAgICAgICA8Qm9va2luZ1R5cGU+MDwvQm9va2luZ1R5cGU+XFxyXFxuICAgICAgICAgICAgPENyZWF0aW9uRGF0ZT4yMDEyLTA4LTA3VDA4OjU5OjAwPC9DcmVhdGlvbkRhdGU+XFxyXFxuICAgICAgICAgICAgPElzQ29zdFJlc291cmNlPjA8L0lzQ29zdFJlc291cmNlPlxcclxcbiAgICAgICAgICAgIDxJc0J1ZGdldD4wPC9Jc0J1ZGdldD5cXHJcXG4gICAgICAgIDwvUmVzb3VyY2U+XFxyXFxuICAgIDwvUmVzb3VyY2VzPlxcclxcbiAgICA8QXNzaWdubWVudHM+XFxyXFxuICAgICAgICA8QXNzaWdubWVudD5cXHJcXG4gICAgICAgICAgICA8VUlEPjY8L1VJRD5cXHJcXG4gICAgICAgICAgICA8VGFza1VJRD42PC9UYXNrVUlEPlxcclxcbiAgICAgICAgICAgIDxSZXNvdXJjZVVJRD4tNjU1MzU8L1Jlc291cmNlVUlEPlxcclxcbiAgICAgICAgICAgIDxQZXJjZW50V29ya0NvbXBsZXRlPjA8L1BlcmNlbnRXb3JrQ29tcGxldGU+XFxyXFxuICAgICAgICAgICAgPEFjdHVhbENvc3Q+MDwvQWN0dWFsQ29zdD5cXHJcXG4gICAgICAgICAgICA8QWN0dWFsT3ZlcnRpbWVDb3N0PjA8L0FjdHVhbE92ZXJ0aW1lQ29zdD5cXHJcXG4gICAgICAgICAgICA8QWN0dWFsT3ZlcnRpbWVXb3JrPlBUMEgwTTBTPC9BY3R1YWxPdmVydGltZVdvcms+XFxyXFxuICAgICAgICAgICAgPEFjdHVhbFdvcms+UFQwSDBNMFM8L0FjdHVhbFdvcms+XFxyXFxuICAgICAgICAgICAgPEFDV1A+MC4wMDwvQUNXUD5cXHJcXG4gICAgICAgICAgICA8Q29uZmlybWVkPjA8L0NvbmZpcm1lZD5cXHJcXG4gICAgICAgICAgICA8Q29zdD4wPC9Db3N0PlxcclxcbiAgICAgICAgICAgIDxDb3N0UmF0ZVRhYmxlPjA8L0Nvc3RSYXRlVGFibGU+XFxyXFxuICAgICAgICAgICAgPFJhdGVTY2FsZT4wPC9SYXRlU2NhbGU+XFxyXFxuICAgICAgICAgICAgPENvc3RWYXJpYW5jZT4wPC9Db3N0VmFyaWFuY2U+XFxyXFxuICAgICAgICAgICAgPENWPjAuMDA8L0NWPlxcclxcbiAgICAgICAgICAgIDxEZWxheT4wPC9EZWxheT5cXHJcXG4gICAgICAgICAgICA8RmluaXNoPjIwMTQtMDQtMThUMTI6MDA6MDA8L0ZpbmlzaD5cXHJcXG4gICAgICAgICAgICA8RmluaXNoVmFyaWFuY2U+MDwvRmluaXNoVmFyaWFuY2U+XFxyXFxuICAgICAgICAgICAgPFdvcmtWYXJpYW5jZT4wLjAwPC9Xb3JrVmFyaWFuY2U+XFxyXFxuICAgICAgICAgICAgPEhhc0ZpeGVkUmF0ZVVuaXRzPjE8L0hhc0ZpeGVkUmF0ZVVuaXRzPlxcclxcbiAgICAgICAgICAgIDxGaXhlZE1hdGVyaWFsPjA8L0ZpeGVkTWF0ZXJpYWw+XFxyXFxuICAgICAgICAgICAgPExldmVsaW5nRGVsYXk+MDwvTGV2ZWxpbmdEZWxheT5cXHJcXG4gICAgICAgICAgICA8TGV2ZWxpbmdEZWxheUZvcm1hdD43PC9MZXZlbGluZ0RlbGF5Rm9ybWF0PlxcclxcbiAgICAgICAgICAgIDxMaW5rZWRGaWVsZHM+MDwvTGlua2VkRmllbGRzPlxcclxcbiAgICAgICAgICAgIDxNaWxlc3RvbmU+MTwvTWlsZXN0b25lPlxcclxcbiAgICAgICAgICAgIDxPdmVyYWxsb2NhdGVkPjA8L092ZXJhbGxvY2F0ZWQ+XFxyXFxuICAgICAgICAgICAgPE92ZXJ0aW1lQ29zdD4wPC9PdmVydGltZUNvc3Q+XFxyXFxuICAgICAgICAgICAgPE92ZXJ0aW1lV29yaz5QVDBIME0wUzwvT3ZlcnRpbWVXb3JrPlxcclxcbiAgICAgICAgICAgIDxSZWd1bGFyV29yaz5QVDBIME0wUzwvUmVndWxhcldvcms+XFxyXFxuICAgICAgICAgICAgPFJlbWFpbmluZ0Nvc3Q+MDwvUmVtYWluaW5nQ29zdD5cXHJcXG4gICAgICAgICAgICA8UmVtYWluaW5nT3ZlcnRpbWVDb3N0PjA8L1JlbWFpbmluZ092ZXJ0aW1lQ29zdD5cXHJcXG4gICAgICAgICAgICA8UmVtYWluaW5nT3ZlcnRpbWVXb3JrPlBUMEgwTTBTPC9SZW1haW5pbmdPdmVydGltZVdvcms+XFxyXFxuICAgICAgICAgICAgPFJlbWFpbmluZ1dvcms+UFQwSDBNMFM8L1JlbWFpbmluZ1dvcms+XFxyXFxuICAgICAgICAgICAgPFJlc3BvbnNlUGVuZGluZz4wPC9SZXNwb25zZVBlbmRpbmc+XFxyXFxuICAgICAgICAgICAgPFN0YXJ0PjIwMTQtMDQtMThUMTI6MDA6MDA8L1N0YXJ0PlxcclxcbiAgICAgICAgICAgIDxTdGFydFZhcmlhbmNlPjA8L1N0YXJ0VmFyaWFuY2U+XFxyXFxuICAgICAgICAgICAgPFVuaXRzPjE8L1VuaXRzPlxcclxcbiAgICAgICAgICAgIDxVcGRhdGVOZWVkZWQ+MDwvVXBkYXRlTmVlZGVkPlxcclxcbiAgICAgICAgICAgIDxWQUM+MC4wMDwvVkFDPlxcclxcbiAgICAgICAgICAgIDxXb3JrPlBUMEgwTTBTPC9Xb3JrPlxcclxcbiAgICAgICAgICAgIDxXb3JrQ29udG91cj4wPC9Xb3JrQ29udG91cj5cXHJcXG4gICAgICAgICAgICA8QkNXUz4wLjAwPC9CQ1dTPlxcclxcbiAgICAgICAgICAgIDxCQ1dQPjAuMDA8L0JDV1A+XFxyXFxuICAgICAgICAgICAgPEJvb2tpbmdUeXBlPjA8L0Jvb2tpbmdUeXBlPlxcclxcbiAgICAgICAgICAgIDxDcmVhdGlvbkRhdGU+MjAxMi0wOC0wN1QwODo1OTowMDwvQ3JlYXRpb25EYXRlPlxcclxcbiAgICAgICAgICAgIDxCdWRnZXRDb3N0PjA8L0J1ZGdldENvc3Q+XFxyXFxuICAgICAgICAgICAgPEJ1ZGdldFdvcms+UFQwSDBNMFM8L0J1ZGdldFdvcms+XFxyXFxuICAgICAgICA8L0Fzc2lnbm1lbnQ+XFxyXFxuICAgIDwvQXNzaWdubWVudHM+XFxyXFxuPC9Qcm9qZWN0PlwiO1xyXG52YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKHhtbCk7XHJcblxyXG5mdW5jdGlvbiBwYXJzZVhNTE9iaih4bWxTdHJpbmcpIHtcclxuICAgIHZhciBvYmogPSB4bWxUb0pTT04ucGFyc2VTdHJpbmcoeG1sU3RyaW5nKTtcclxuICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgdGFza3MucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWUgOiB4bWxJdGVtLk5hbWVbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIHN0YXJ0IDogeG1sSXRlbS5TdGFydFswXS5fdGV4dCxcclxuICAgICAgICAgICAgZW5kIDogeG1sSXRlbS5GaW5pc2hbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlIDogeG1sSXRlbS5QZXJjZW50Q29tcGxldGVbMF0uX3RleHRcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRhc2tzO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5wYXJzZURlcHNGcm9tWE1MID0gZnVuY3Rpb24oeG1sU3RyaW5nKSB7XHJcbiAgICB2YXIgb2JqID0geG1sVG9KU09OLnBhcnNlU3RyaW5nKHhtbFN0cmluZyk7XHJcbiAgICB2YXIgdWlkcyA9IHt9O1xyXG4gICAgdmFyIG91dGxpbmVzID0ge307XHJcbiAgICB2YXIgZGVwcyA9IFtdO1xyXG4gICAgdmFyIHBhcmVudHMgPSBbXTtcclxuICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1aWRzW3htbEl0ZW0uVUlEWzBdLl90ZXh0XSA9IHhtbEl0ZW0uTmFtZVswXS5fdGV4dC50b1N0cmluZygpO1xyXG4gICAgICAgIG91dGxpbmVzW3htbEl0ZW0uT3V0bGluZU51bWJlclswXS5fdGV4dC50b1N0cmluZygpXSA9IHhtbEl0ZW0uTmFtZVswXS5fdGV4dDtcclxuICAgIH0pO1xyXG4gICAgXy5lYWNoKG9iai5Qcm9qZWN0WzBdLlRhc2tzWzBdLlRhc2ssIGZ1bmN0aW9uKHhtbEl0ZW0pIHtcclxuICAgICAgICBpZiAoIXhtbEl0ZW0uTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuYW1lID0geG1sSXRlbS5OYW1lWzBdLl90ZXh0O1xyXG4gICAgICAgIGlmICh4bWxJdGVtLlByZWRlY2Vzc29yTGluaykge1xyXG4gICAgICAgICAgICBkZXBzLnB1c2goW3VpZHNbeG1sSXRlbS5QcmVkZWNlc3NvckxpbmtbMF0uUHJlZGVjZXNzb3JVSURbMF0uX3RleHRdLCBuYW1lXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBvdXRsaW5lID0geG1sSXRlbS5PdXRsaW5lTnVtYmVyWzBdLl90ZXh0LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKG91dGxpbmUuaW5kZXhPZignLicpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50T3V0bGluZSA9IG91dGxpbmUuc2xpY2UoMCxvdXRsaW5lLmxhc3RJbmRleE9mKCcuJykpO1xyXG4gICAgICAgICAgICBwYXJlbnRzLnB1c2goW291dGxpbmVzW3BhcmVudE91dGxpbmVdLCBuYW1lXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRlcHMgOiBkZXBzLFxyXG4gICAgICAgIHBhcmVudHMgOiBwYXJlbnRzXHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMucGFyc2VYTUxPYmogPSBwYXJzZVhNTE9iajtcclxuXHJcbm1vZHVsZS5leHBvcnRzLkpTT05Ub1hNTCA9IGZ1bmN0aW9uKGpzb24pIHtcclxuICAgIHZhciBzdGFydCA9IGpzb25bMF0uc3RhcnQ7XHJcbiAgICB2YXIgZW5kID0ganNvblswXS5lbmQ7XHJcbiAgICB2YXIgZGF0YSA9IF8ubWFwKGpzb24sIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICBpZiAoc3RhcnQgPiB0YXNrLnN0YXJ0KSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gdGFzay5zdGFydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVuZCA8IHRhc2suZW5kKSB7XHJcbiAgICAgICAgICAgIGVuZCA9IHRhc2suZW5kO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lIDogdGFzay5uYW1lLFxyXG4gICAgICAgICAgICBzdGFydCA6IHRhc2suc3RhcnQudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgICAgZW5kIDogdGFzay5lbmQudG9JU09TdHJpbmcoKVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21waWxlZCh7XHJcbiAgICAgICAgdGFza3MgOiBkYXRhLFxyXG4gICAgICAgIGN1cnJlbnREYXRlIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZSA6IHN0YXJ0LFxyXG4gICAgICAgIGZpbmlzaERhdGUgOiBlbmRcclxuICAgIH0pO1xyXG59O1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFNpZGVQYW5lbCA9IHJlcXVpcmUoJy4vc2lkZUJhci9TaWRlUGFuZWwnKTtcclxyXHJ2YXIgR2FudHRDaGFydFZpZXcgPSByZXF1aXJlKCcuL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3Jyk7XHJ2YXIgVG9wTWVudVZpZXcgPSByZXF1aXJlKCcuL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3Jyk7XHJccnZhciBOb3RpZmljYXRpb25zID0gcmVxdWlyZSgnLi9Ob3RpZmljYXRpb25zJyk7XHJcclxydmFyIEdhbnR0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcciAgICBlbDogJy5HYW50dCcsXHIgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHIgICAgICAgIHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcciAgICAgICAgdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXSxpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS5vbignY2hhbmdlJywgdGhpcy5jYWxjdWxhdGVEdXJhdGlvbik7XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcubWVudS1jb250YWluZXInKTtcclxyICAgICAgICBuZXcgQ29udGV4dE1lbnVWaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgLy8gbmV3IHRhc2sgYnV0dG9uXHIgICAgICAgICQoJy5uZXctdGFzaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdmFyIGxhc3RUYXNrID0gcGFyYW1zLmNvbGxlY3Rpb24ubGFzdCgpO1xyICAgICAgICAgICAgdmFyIGxhc3RJbmRleCA9IC0xO1xyICAgICAgICAgICAgaWYgKGxhc3RUYXNrKSB7XHIgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gbGFzdFRhc2suZ2V0KCdzb3J0aW5kZXgnKTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIHBhcmFtcy5jb2xsZWN0aW9uLmFkZCh7XHIgICAgICAgICAgICAgICAgbmFtZSA6ICdOZXcgdGFzaycsXHIgICAgICAgICAgICAgICAgc29ydGluZGV4IDogbGFzdEluZGV4ICsgMVxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIG5ldyBOb3RpZmljYXRpb25zKHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSk7XHIgICAgICAgIC8vIHNldCBzaWRlIHRhc2tzIHBhbmVsIGhlaWdodFxyICAgICAgICB2YXIgJHNpZGVQYW5lbCA9ICQoJy5tZW51LWNvbnRhaW5lcicpO1xyICAgICAgICAkc2lkZVBhbmVsLmNzcyh7XHIgICAgICAgICAgICAnbWluLWhlaWdodCcgOiB3aW5kb3cuaW5uZXJIZWlnaHQgLSAkc2lkZVBhbmVsLm9mZnNldCgpLnRvcFxyICAgICAgICB9KTtcclxyXHJcciAgICAgICAgbmV3IFRvcE1lbnVWaWV3KHtcciAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5hcHAuc2V0dGluZ3MsXHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMuY2FudmFzVmlldyA9IG5ldyBHYW50dENoYXJ0Vmlldyh7XHIgICAgICAgICAgICBhcHAgOiB0aGlzLmFwcCxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5hcHAuc2V0dGluZ3NcciAgICAgICAgfSk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuY2FudmFzVmlldy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyICAgICAgICB9LmJpbmQodGhpcyksIDUwMCk7XHJcclxyICAgICAgICB2YXIgdGFza3NDb250YWluZXIgPSAkKCcudGFza3MnKS5nZXQoMCk7XHIgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2lkZVBhbmVsLCB7XHIgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICAgICAgfSksXHIgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICApO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICBjb25zb2xlLmxvZygncmVjb21waWxlJyk7XHIgICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRhc2tzQ29udGFpbmVyKTtcciAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgICAgICAgICAgfSksXHIgICAgICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgICAgICk7XHIgICAgICAgIH0uYmluZCh0aGlzKSw1KSk7XHIgICAgfSxcciAgICBldmVudHM6IHtcciAgICAgICAgJ2NsaWNrICN0SGFuZGxlJzogJ2V4cGFuZCdcciAgICB9LFxyICAgIGNhbGN1bGF0ZUR1cmF0aW9uOiBmdW5jdGlvbigpe1xyXHIgICAgICAgIC8vIENhbGN1bGF0aW5nIHRoZSBkdXJhdGlvbiBmcm9tIHN0YXJ0IGFuZCBlbmQgZGF0ZVxyICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cInN0YXJ0XCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgZW5kZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHIgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPT0gXCJcIiAmJiBlbmRkYXRlICE9PSBcIlwiKXtcciAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgIHZhciB1dGMyID0gRGF0ZS5VVEMoZW5kZGF0ZS5nZXRGdWxsWWVhcigpLCBlbmRkYXRlLmdldE1vbnRoKCksIGVuZGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyICAgICAgICB9ZWxzZXtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKDApKTtcciAgICAgICAgfVxyICAgIH0sXHIgICAgZXhwYW5kOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LnRhcmdldCk7XHIgICAgICAgIGlmIChidXR0b24uaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgfVxyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA2MDApO1xyICAgICAgICBidXR0b24udG9nZ2xlQ2xhc3MoJ2NvbnRyYWN0Jyk7XHIgICAgfSxcciAgICBfbW92ZUNhbnZhc1ZpZXcgOiBmdW5jdGlvbigpIHtcciAgICAgICAgdmFyIHNpZGVCYXJXaWR0aCA9ICQoJy5tZW51LWNvbnRhaW5lcicpLndpZHRoKCk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5zZXRMZWZ0UGFkZGluZyhzaWRlQmFyV2lkdGgpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IEdhbnR0VmlldztcciIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBNb2RhbFRhc2tFZGl0Q29tcG9uZW50ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2VkaXRUYXNrJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy51aS5jaGVja2JveCcpLmNoZWNrYm94KCk7XHJcbiAgICAgICAgLy8gc2V0dXAgdmFsdWVzIGZvciBzZWxlY3RvcnNcclxuICAgICAgICB0aGlzLl9wcmVwYXJlU2VsZWN0cygpO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCcudGFidWxhci5tZW51IC5pdGVtJykudGFiKCk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdLCBbbmFtZT1cImVuZFwiXScpLmRhdGVwaWNrZXIoe1xyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZmlsbERhdGEoKTtcclxuXHJcbiAgICAgICAgLy8gb3BlbiBtb2RhbFxyXG4gICAgICAgIHRoaXMuJGVsLm1vZGFsKHtcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcblxyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlU2VsZWN0cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGF0dXNTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXR1c1wiXScpO1xyXG4gICAgICAgIHN0YXR1c1NlbGVjdC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oaSwgY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoY2hpbGQudGV4dCk7XHJcbiAgICAgICAgICAgICQoY2hpbGQpLnByb3AoJ3ZhbHVlJywgaWQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciBoZWFsdGhTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImhlYWx0aFwiXScpO1xyXG4gICAgICAgIGhlYWx0aFNlbGVjdC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oaSwgY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoSWQoY2hpbGQudGV4dCk7XHJcbiAgICAgICAgICAgICQoY2hpbGQpLnByb3AoJ3ZhbHVlJywgaWQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciB3b3JrT3JkZXJTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIndvXCJdJyk7XHJcbiAgICAgICAgd29ya09yZGVyU2VsZWN0LmVtcHR5KCk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgJCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBkYXRhLklEICsgJ1wiPicgKyBkYXRhLldPTnVtYmVyICsgJzwvb3B0aW9uPicpLmFwcGVuZFRvKHdvcmtPcmRlclNlbGVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2ZpbGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXR1cycgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0ZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0U3RhdHVzSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaGVhbHRoJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRIZWFsdGhJZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LmdldCgwKS52YWx1ZSA9ICh2YWwudG9TdHJpbmcoJ2RkL01NL3l5eXknKSk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0LnByb3AoJ3R5cGUnKSA9PT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQucHJvcCgnY2hlY2tlZCcsIHZhbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIF9zYXZlRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gaW5wdXQudmFsKCkuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBEYXRlKGRhdGVbMl0gKyAnLScgKyBkYXRlWzFdICsgJy0nICsgZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIG5ldyBEYXRlKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnByb3AoJ2NoZWNrZWQnKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnZhbCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2F2ZSgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kYWxUYXNrRWRpdENvbXBvbmVudDtcclxuIiwidmFyIE5vdGlmaWNhdGlvbnMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdlcnJvcicsIHRoaXMub25FcnJvcik7XHJcbiAgICB9LFxyXG4gICAgb25FcnJvciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXJndW1lbnRzKTtcclxuICAgICAgICBub3R5KHtcclxuICAgICAgICAgICAgdGV4dDogJ0Vycm9yIHdoaWxlIHNhdmluZyB0YXNrLiBTb3JyeS4uLicsXHJcbiAgICAgICAgICAgIGxheW91dCA6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgIHR5cGUgOiAnZXJyb3InXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb25zO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgUmVzb3VyY2VFZGl0b3JWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgdmFyIHN0YWdlUG9zID0gJCgnI2dhbnR0LWNvbnRhaW5lcicpLm9mZnNldCgpO1xyXG4gICAgICAgIHZhciBmYWtlRWwgPSAkKCc8ZGl2PicpLmFwcGVuZFRvKCdib2R5Jyk7XHJcbiAgICAgICAgZmFrZUVsLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgdG9wIDogcG9zLnkgKyBzdGFnZVBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICBsZWZ0IDogcG9zLnggKyBzdGFnZVBvcy5sZWZ0ICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnBvcHVwID0gJCgnLmN1c3RvbS5wb3B1cCcpO1xyXG4gICAgICAgIGZha2VFbC5wb3B1cCh7XHJcbiAgICAgICAgICAgIHBvcHVwIDogdGhpcy5wb3B1cCxcclxuICAgICAgICAgICAgb24gOiAnaG92ZXInLFxyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdib3R0b20gbGVmdCcsXHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cC5vZmYoJy5lZGl0b3InKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkucG9wdXAoJ3Nob3cnKTtcclxuXHJcbiAgICAgICAgdGhpcy5fYWRkUmVzb3VyY2VzKCk7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCcuYnV0dG9uJykub24oJ2NsaWNrLmVkaXRvcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVwLnBvcHVwKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAub2ZmKCcuZWRpdG9yJyk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZnVsbERhdGEoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkUmVzb3VyY2VzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5lbXB0eSgpO1xyXG4gICAgICAgIHZhciBodG1sU3RyaW5nID0gJyc7XHJcbiAgICAgICAgKHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMucmVzb3VyY2VkYXRhIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIGh0bWxTdHJpbmcgKz0gJzxkaXYgY2xhc3M9XCJ1aSBjaGVja2JveFwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgIG5hbWU9XCInICsgcmVzb3VyY2UuVXNlcklkICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8bGFiZWw+JyArIHJlc291cmNlLlVzZXJuYW1lICsgJzwvbGFiZWw+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PGJyPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaHRtbFN0cmluZyArPSc8YnI+PGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxkaXYgY2xhc3M9XCJ1aSBwb3NpdGl2ZSByaWdodCBidXR0b24gc2F2ZSB0aW55XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnQ2xvc2UnICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5hcHBlbmQoaHRtbFN0cmluZyk7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCcudWkuY2hlY2tib3gnKS5jaGVja2JveCgpO1xyXG4gICAgfSxcclxuICAgIF9mdWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwb3B1cCA9IHRoaXMucG9wdXA7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5nZXQoJ3Jlc291cmNlcycpLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgcG9wdXAuZmluZCgnW25hbWU9XCInICsgcmVzb3VyY2UgKyAnXCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zYXZlRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBvcHVwLmZpbmQoJ2lucHV0JykuZWFjaChmdW5jdGlvbihpLCBpbnB1dCkge1xyXG4gICAgICAgICAgICB2YXIgJGlucHV0ID0gJChpbnB1dCk7XHJcbiAgICAgICAgICAgIGlmICgkaW5wdXQucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZXMucHVzaCgkaW5wdXQuYXR0cignbmFtZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ3Jlc291cmNlcycsIHJlc291cmNlcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZUVkaXRvclZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEZpbHRlclZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZmlsdGVyLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjaGFuZ2UgI2hpZ2h0bGlnaHRzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBoaWdodGxpZ2h0VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmIChoaWdodGxpZ2h0VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB0aGlzLmNvbG9yc1tlLnRhcmdldC52YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NoYW5nZSAjZmlsdGVycy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgY3JpdGVyaWEgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKGNyaXRlcmlhID09PSAncmVzZXQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaG93VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNob3cgYWxsIHBhcmVudHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRhc2sucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29sb3JzIDoge1xyXG4gICAgICAgICdzdGF0dXMtYmFja2xvZycgOiAnI0QyRDJEOScsXHJcbiAgICAgICAgJ3N0YXR1cy1yZWFkeScgOiAnI0IyRDFGMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1pbiBwcm9ncmVzcycgOiAnIzY2QTNFMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1jb21wbGV0ZScgOiAnIzk5QzI5OScsXHJcbiAgICAgICAgJ2xhdGUnIDogJyNGRkIyQjInLFxyXG4gICAgICAgICdkdWUnIDogJyAjRkZDMjk5JyxcclxuICAgICAgICAnbWlsZXN0b25lJyA6ICcjRDZDMkZGJyxcclxuICAgICAgICAnZGVsaXZlcmFibGUnIDogJyNFMEQxQzInLFxyXG4gICAgICAgICdmaW5hbmNpYWwnIDogJyNGMEUwQjInLFxyXG4gICAgICAgICd0aW1lc2hlZXRzJyA6ICcjQzJDMkIyJyxcclxuICAgICAgICAncmVwb3J0YWJsZScgOiAnICNFMEMyQzInLFxyXG4gICAgICAgICdoZWFsdGgtcmVkJyA6ICdyZWQnLFxyXG4gICAgICAgICdoZWFsdGgtYW1iZXInIDogJyNGRkJGMDAnLFxyXG4gICAgICAgICdoZWFsdGgtZ3JlZW4nIDogJ2dyZWVuJ1xyXG4gICAgfSxcclxuICAgIF9nZXRNb2RlbHNGb3JDcml0ZXJpYSA6IGZ1bmN0aW9uKGNyZXRlcmlhKSB7XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAncmVzZXRzJykge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdzdGF0dXMnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXR1cyA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAodGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoc3RhdHVzKSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdzdGF0dXMnKS50b1N0cmluZygpID09PSBpZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2xhdGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnZHVlJykge1xyXG4gICAgICAgICAgICB2YXIgbGFzdERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICBsYXN0RGF0ZS5hZGRXZWVrcygyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA+IG5ldyBEYXRlKCkgJiYgdGFzay5nZXQoJ2VuZCcpIDwgbGFzdERhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoWydtaWxlc3RvbmUnLCAnZGVsaXZlcmFibGUnLCAnZmluYW5jaWFsJywgJ3RpbWVzaGVldHMnLCAncmVwb3J0YWJsZSddLmluZGV4T2YoY3JldGVyaWEpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoY3JldGVyaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ2hlYWx0aCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGhJZCA9ICh0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChoZWFsdGgpIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2hlYWx0aCcpLnRvU3RyaW5nKCkgPT09IGhlYWx0aElkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsdGVyVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNncm91cGluZy1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3RvcC1leHBhbmQtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI3RvcC1jb2xsYXBzZS1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwaW5nTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgcGFyc2VYTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZVhNTE9iajtcclxudmFyIEpTT05Ub1hNTCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3htbFdvcmtlcicpLkpTT05Ub1hNTDtcclxudmFyIHBhcnNlRGVwc0Zyb21YTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZURlcHNGcm9tWE1MO1xyXG5cclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3Byb2plY3QtbWVudScsXHJcblxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9zZXR1cElucHV0KCk7XHJcbiAgICB9LFxyXG4gICAgX3NldHVwSW5wdXQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW5wdXQgPSAkKCcjaW1wb3J0RmlsZScpO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGV2dC50YXJnZXQuZmlsZXM7XHJcbiAgICAgICAgICAgIF8uZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYueG1sRGF0YSA9IGUudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdFcnJvciB3aGlsZSBwYXJpbmcgZmlsZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3VwbG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjbXNpbXBvcnQnKS5tb2RhbCh7XHJcbiAgICAgICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnhtbERhdGEgfHwgdGhpcy5pbXBvcnRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltcG9ydGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRQcm9ncmVzc1wiKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRGaWxlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN4bWxpbnB1dC1mb3JtJykudHJpZ2dlcigncmVzZXQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuaW1wb3J0RGF0YS5iaW5kKHRoaXMpLCAyMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICQoXCIjaW1wb3J0UHJvZ3Jlc3NcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2ltcG9ydEZpbGVcIikuc2hvdygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICNkb3dubG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IEpTT05Ub1hNTCh0aGlzLmNvbGxlY3Rpb24udG9KU09OKCkpO1xyXG4gICAgICAgICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwge3R5cGUgOiAnYXBwbGljYXRpb24vanNvbid9KTtcclxuICAgICAgICAgICAgc2F2ZUFzKGJsb2IsICdHYW50dFRhc2tzLnhtbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwcm9ncmVzcyA6IGZ1bmN0aW9uKHBlcmNlbnQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKHBlcmNlbnQpO1xyXG4gICAgICAgICQoJyNpbXBvcnRQcm9ncmVzcycpLnByb2dyZXNzKHtcclxuICAgICAgICAgICAgcGVyY2VudCA6IHBlcmNlbnRcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZURhdGEgOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgdmFyIGRlZlN0YXR1cyA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRTdGF0dXNJZCgpO1xyXG4gICAgICAgIHZhciBkZWZIZWFsdGggPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICB2YXIgZGVmV08gPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWxXT0lkKCk7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5oZWFsdGggPSBkZWZIZWFsdGg7XHJcbiAgICAgICAgICAgIGl0ZW0uc3RhdHVzID0gZGVmU3RhdHVzO1xyXG4gICAgICAgICAgICBpdGVtLndvID0gZGVmV087XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9LFxyXG4gICAgaW1wb3J0RGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvZ3Jlc3MoMCk7XHJcbiAgICAgICAgLy8gdGhpcyBpcyBzb21lIHNvcnQgb2YgY2FsbGJhY2sgaGVsbCEhXHJcbiAgICAgICAgLy8gd2UgbmVlZCB0aW1lb3V0cyBmb3IgYmV0dGVyIHVzZXIgZXhwZXJpZW5jZVxyXG4gICAgICAgIC8vIEkgdGhpbmsgdXNlciB3YW50IHRvIHNlZSBhbmltYXRlZCBwcm9ncmVzcyBiYXJcclxuICAgICAgICAvLyBidXQgd2l0aG91dCB0aW1lb3V0cyBpdCBpcyBub3QgcG9zc2libGUsIHJpZ2h0P1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoMjEpO1xyXG4gICAgICAgICAgICB2YXIgY29sID0gdGhpcy5jb2xsZWN0aW9uO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHBhcnNlWE1MKHRoaXMueG1sRGF0YSk7XHJcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9wcmVwYXJlRGF0YShkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDQzKTtcclxuICAgICAgICAgICAgICAgIGNvbC5pbXBvcnRUYXNrcyhkYXRhLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDUxKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDY3KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlcHMgPSBwYXJzZURlcHNGcm9tWE1MKHRoaXMueG1sRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDk1KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbC5jcmVhdGVEZXBzKGRlcHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXNpbXBvcnQnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNU1Byb2plY3RNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgUmVwb3J0c01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3JlcG9ydHMtbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICNwcmludCcgOiAnZ2VuZXJhdGVQREYnLFxyXG4gICAgICAgICdjbGljayAjc2hvd1ZpZGVvJyA6ICdzaG93SGVscCdcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVBERiA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSxcclxuICAgIHNob3dIZWxwIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI3Nob3dWaWRlb01vZGFsJykubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydHNNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBab29tTWVudVZpZXcgPSByZXF1aXJlKCcuL1pvb21NZW51VmlldycpO1xyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IHJlcXVpcmUoJy4vR3JvdXBpbmdNZW51VmlldycpO1xyXG52YXIgRmlsdGVyTWVudVZpZXcgPSByZXF1aXJlKCcuL0ZpbHRlck1lbnVWaWV3Jyk7XHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IHJlcXVpcmUoJy4vTVNQcm9qZWN0TWVudVZpZXcnKTtcclxudmFyIFJlcG9ydHNNZW51VmlldyA9IHJlcXVpcmUoJy4vUmVwb3J0c01lbnVWaWV3Jyk7XHJcblxyXG52YXIgVG9wTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgbmV3IFpvb21NZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBHcm91cGluZ01lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IEZpbHRlck1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IE1TUHJvamVjdE1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IFJlcG9ydHNNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVG9wTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFpvb21NZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyN6b29tLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAuYWN0aW9uJzogJ29uSW50ZXJ2YWxCdXR0b25DbGlja2VkJ1xyXG4gICAgfSxcclxuICAgIG9uSW50ZXJ2YWxCdXR0b25DbGlja2VkIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIHZhciBhY3Rpb24gPSBidXR0b24uZGF0YSgnYWN0aW9uJyk7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gYWN0aW9uLnNwbGl0KCctJylbMV07XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gWm9vbU1lbnVWaWV3O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2JvcmRlcldpZHRoIDogMyxcclxuICAgIF9jb2xvciA6ICcjRTZGMEZGJyxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBfLmV4dGVuZChCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5ldmVudHMoKSwge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmxlZnRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5yaWdodEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG5cclxuICAgICAgICAgICAgJ2RyYWdlbmQgLmxlZnRCb3JkZXInIDogJ3JlbmRlcicsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5yaWdodEJvcmRlcicgOiAncmVuZGVyJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLmxlZnRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5sZWZ0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLnJpZ2h0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAucmlnaHRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5taW4obG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWF4KGxvY2FsWCwgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9yZXNpemVQb2ludGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZXctcmVzaXplJztcclxuICAgIH0sXHJcbiAgICBfY2hhbmdlU2l6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZWZ0WCA9IHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCk7XHJcbiAgICAgICAgdmFyIHJpZ2h0WCA9IHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpICsgdGhpcy5fYm9yZGVyV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LndpZHRoKHJpZ2h0WCAtIGxlZnRYKTtcclxuICAgICAgICByZWN0LngobGVmdFgpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC54KGxlZnRYKTtcclxuICAgICAgICBjb21wbGV0ZVJlY3Qud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuXHJcbiAgICAgICAgLy8gbW92ZSB0b29sIHBvc2l0aW9uXHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wueChyaWdodFgpO1xyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKVswXTtcclxuICAgICAgICByZXNvdXJjZXMueChyaWdodFggKyB0aGlzLl90b29sYmFyT2Zmc2V0KTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEgLSB0aGlzLl9ib3JkZXJXaWR0aCk7XHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbG9uZVRhc2tWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFJlc291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi4vUmVzb3VyY2VzRWRpdG9yJyk7XHJcblxyXG52YXIgbGlua0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbmxpbmtJbWFnZS5zcmMgPSAnY3NzL2ltYWdlcy9saW5rLnBuZyc7XHJcblxyXG52YXIgdXNlckltYWdlID0gbmV3IEltYWdlKCk7XHJcbnVzZXJJbWFnZS5zcmMgPSAnY3NzL2ltYWdlcy91c2VyLnBuZyc7XHJcblxyXG52YXIgQmFzaWNUYXNrVmlldyA9IEJhY2tib25lLktvbnZhVmlldy5leHRlbmQoe1xyXG4gICAgX2Z1bGxIZWlnaHQgOiAyMSxcclxuICAgIF90b3BQYWRkaW5nIDogMyxcclxuICAgIF9iYXJIZWlnaHQgOiAxNSxcclxuICAgIF9jb21wbGV0ZUNvbG9yIDogJyNlODgxMzQnLFxyXG4gICAgX3Rvb2xiYXJPZmZzZXQgOiAyMCxcclxuICAgIF9yZXNvdXJjZUxpc3RPZmZzZXQgOiAyMCxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuX2Z1bGxIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVUeXBlICE9PSAnR3JvdXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdlbmQnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZWVudGVyJyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dUb29scygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVJlc291cmNlc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dyYWJQb2ludGVyKGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VsZWF2ZScgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlVG9vbHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dSZXNvdXJjZXNMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0TW91c2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdzdGFydCAuZGVwZW5kZW5jeVRvb2wnIDogJ19zdGFydENvbm5lY3RpbmcnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmRlcGVuZGVuY3lUb29sJyA6ICdfbW92ZUNvbm5lY3QnLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAuZGVwZW5kZW5jeVRvb2wnIDogJ19jcmVhdGVEZXBlbmRlbmN5JyxcclxuICAgICAgICAgICAgJ2NsaWNrIC5yZXNvdXJjZXMnIDogJ19lZGl0UmVzb3VyY2VzJ1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBuZXcgS29udmEuR3JvdXAoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBwb3MueCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBpZCA6IHRoaXMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGZha2VCYWNrZ3JvdW5kID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2Zha2VCYWNrZ3JvdW5kJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbWFpblJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29tcGxldGVSZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgYXJjID0gbmV3IEtvbnZhLlNoYXBlKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgZmlsbCA6ICdsaWdodGdyZWVuJyxcclxuICAgICAgICAgICAgZHJhd0Z1bmM6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBob3JPZmZzZXQgPSA2O1xyXG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSAgc2VsZi5fYmFySGVpZ2h0ICsgKHNlbGYuX2JvcmRlclNpemUgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhob3JPZmZzZXQsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoaG9yT2Zmc2V0LCBzaXplIC8gMiwgc2l6ZSAvIDIsIC0gTWF0aC5QSSAvIDIsIE1hdGguUEkgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIHNpemUpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHZhciBpbWdTaXplID0gc2l6ZSAtIDQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShsaW5rSW1hZ2UsIDEsIChzaXplIC0gaW1nU2l6ZSkgLyAyLCBpbWdTaXplLCBpbWdTaXplKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGl0RnVuYyA6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlY3QoMCwgMCwgNiArIHNlbGYuX2JhckhlaWdodCwgc2VsZi5fYmFySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFNoYXBlKHRoaXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2RlcGVuZGVuY3lUb29sJyxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB0b29sYmFyID0gbmV3IEtvbnZhLkdyb3VwKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbmFtZSA6ICdyZXNvdXJjZXMnLFxyXG4gICAgICAgICAgICB2aXNpYmxlIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2l6ZSA9IHNlbGYuX2JhckhlaWdodCArIChzZWxmLl9ib3JkZXJTaXplIHx8IDApO1xyXG4gICAgICAgIHZhciB0b29sYmFjayA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6ICdsaWdodGdyZXknLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHNpemUsXHJcbiAgICAgICAgICAgIGNvcm5lclJhZGl1cyA6IDJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHVzZXJJbSA9IG5ldyBLb252YS5JbWFnZSh7XHJcbiAgICAgICAgICAgIGltYWdlIDogdXNlckltYWdlLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHNpemVcclxuICAgICAgICB9KTtcclxuICAgICAgICB0b29sYmFyLmFkZCh0b29sYmFjaywgdXNlckltKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc291cmNlTGlzdCA9IG5ldyBLb252YS5UZXh0KHtcclxuICAgICAgICAgICAgbmFtZSA6ICdyZXNvdXJjZUxpc3QnLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbGlzdGVuaW5nIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkKGZha2VCYWNrZ3JvdW5kLCByZWN0LCBjb21wbGV0ZVJlY3QsIGFyYywgdG9vbGJhciwgcmVzb3VyY2VMaXN0KTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX2VkaXRSZXNvdXJjZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBSZXNvdXJjZUVkaXRvcih7XHJcbiAgICAgICAgICAgIG1vZGVsIDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS5nZXRQb2ludGVyUG9zaXRpb24oKTtcclxuICAgICAgICB2aWV3LnJlbmRlcihwb3MpO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLnJvdW5kKHggLyBkYXlzV2lkdGgpLCBkYXlzMiA9IE1hdGgucm91bmQoKHggKyBsZW5ndGgpIC8gZGF5c1dpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcclxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zaG93VG9vbHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKS5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVRvb2xzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX3Nob3dSZXNvdXJjZXNMaXN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0Jykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVJlc291cmNlc0xpc3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9ncmFiUG9pbnRlciA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgbmFtZSA9IGUudGFyZ2V0Lm5hbWUoKTtcclxuICAgICAgICBpZiAoKG5hbWUgPT09ICdtYWluUmVjdCcpIHx8IChuYW1lID09PSAnZGVwZW5kZW5jeVRvb2wnKSB8fFxyXG4gICAgICAgICAgICAobmFtZSA9PT0gJ2NvbXBsZXRlUmVjdCcpIHx8IChlLnRhcmdldC5nZXRQYXJlbnQoKS5uYW1lKCkgPT09ICdyZXNvdXJjZXMnKSkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2RlZmF1bHRNb3VzZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xyXG4gICAgfSxcclxuICAgIF9zdGFydENvbm5lY3RpbmcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wuaGlkZSgpO1xyXG4gICAgICAgIHZhciBwb3MgPSB0b29sLmdldEFic29sdXRlUG9zaXRpb24oKTtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2UgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDEsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFtwb3MueCAtIHN0YWdlLngoKSwgcG9zLnksIHBvcy54IC0gc3RhZ2UueCgpLCBwb3MueV0sXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29ubmVjdG9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5hZGQoY29ubmVjdG9yKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDb25uZWN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBwb2ludHMgPSBjb25uZWN0b3IucG9pbnRzKCk7XHJcbiAgICAgICAgcG9pbnRzWzJdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueCAtIHN0YWdlLngoKTtcclxuICAgICAgICBwb2ludHNbM10gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS55O1xyXG4gICAgICAgIGNvbm5lY3Rvci5wb2ludHMocG9pbnRzKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xyXG4gICAgICAgIGNvbm5lY3Rvci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIGVsID0gc3RhZ2UuZ2V0SW50ZXJzZWN0aW9uKHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpKTtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBlbCAmJiBlbC5nZXRQYXJlbnQoKTtcclxuICAgICAgICB2YXIgdGFza0lkID0gZ3JvdXAgJiYgZ3JvdXAuaWQoKTtcclxuICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHZhciBhZnRlck1vZGVsID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmdldCh0YXNrSWQpO1xyXG4gICAgICAgIGlmIChhZnRlck1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuY29sbGVjdGlvbi5jcmVhdGVEZXBlbmRlbmN5KGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlRm9yID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdkZXBlbmQnKSA9PT0gYmVmb3JlTW9kZWwuaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVtb3ZlRm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24ucmVtb3ZlRGVwZW5kZW5jeShyZW1vdmVGb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2luZyA9IHRoaXMuZWwuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmdldENoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBkcmFnZ2luZyB8fCBjaGlsZC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSkgLSAxKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnZW5kJykpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICByZXR1cm4gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIC8vIG1vdmUgZ3JvdXBcclxuICAgICAgICB0aGlzLmVsLngoeC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBmYWtlIGJhY2tncm91bmQgcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgYmFjayA9IHRoaXMuZWwuZmluZCgnLmZha2VCYWNrZ3JvdW5kJylbMF07XHJcbiAgICAgICAgYmFjay54KCAtIDIwKTtcclxuICAgICAgICBiYWNrLndpZHRoKHgueDIgLSB4LngxICsgNjApO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgbWFpbiByZWN0IHBhcmFtc1xyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LngoMCk7XHJcbiAgICAgICAgcmVjdC53aWR0aCh4LngyIC0geC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdLngoMCk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngoeC54MiAtIHgueDEpO1xyXG4gICAgICAgIHRvb2wueSh0aGlzLl90b3BQYWRkaW5nKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc291cmNlcyA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpWzBdO1xyXG4gICAgICAgIHJlc291cmNlcy54KHgueDIgLSB4LngxICsgdGhpcy5fdG9vbGJhck9mZnNldCk7XHJcbiAgICAgICAgcmVzb3VyY2VzLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2UgbGlzdFxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKVswXTtcclxuICAgICAgICByZXNvdXJjZUxpc3QueCh4LngyIC0geC54MSArIHRoaXMuX3Jlc291cmNlTGlzdE9mZnNldCk7XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LnkodGhpcy5fdG9wUGFkZGluZyArIDIpO1xyXG4gICAgICAgIHZhciBuYW1lcyA9IFtdO1xyXG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5tb2RlbC5nZXQoJ3Jlc291cmNlcycpO1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZUlkKSB7XHJcbiAgICAgICAgICAgIHZhciByZXMgPSBfLmZpbmQoKHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMucmVzb3VyY2VkYXRhIHx8IFtdKSwgZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLlVzZXJJZC50b1N0cmluZygpID09PSByZXNvdXJjZUlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPCAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChyZXMuVXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxpYXNlcyA9IF8ubWFwKHJlcy5Vc2VybmFtZS5zcGxpdCgnICcpLCBmdW5jdGlvbihzdHIpIHsgcmV0dXJuIHN0clswXTt9KS5qb2luKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lcy5wdXNoKGFsaWFzZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXNvdXJjZUxpc3QudGV4dChuYW1lcy5qb2luKCcsICcpKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHNldFkgOiBmdW5jdGlvbih5KSB7XHJcbiAgICAgICAgdGhpcy5feSA9IHk7XHJcbiAgICAgICAgdGhpcy5lbC55KHkpO1xyXG4gICAgfSxcclxuICAgIGdldFkgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQ29ubmVjdG9yVmlldyA9IEJhY2tib25lLktvbnZhVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yIDogJ2dyZXknLFxyXG4gICAgX3dyb25nQ29sb3IgOiAncmVkJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gcGFyYW1zLmJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMuYWZ0ZXJNb2RlbCA9IHBhcmFtcy5hZnRlck1vZGVsO1xyXG4gICAgICAgIHRoaXMuX3kxID0gMDtcclxuICAgICAgICB0aGlzLl95MiA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGluZSA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAyLFxyXG4gICAgICAgICAgICBzdHJva2UgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbMCwwLDAsMF1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGluZTtcclxuICAgIH0sXHJcbiAgICBzZXRZMSA6IGZ1bmN0aW9uKHkxKSB7XHJcbiAgICAgICAgdGhpcy5feTEgPSB5MTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHNldFkyIDogZnVuY3Rpb24oeTIpIHtcclxuICAgICAgICB0aGlzLl95MiA9IHkyO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgaWYgKHgueDIgPj0geC54MSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFt4LngxLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MiwgeC54MiwgdGhpcy5feTJdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl93cm9uZ0NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW1xyXG4gICAgICAgICAgICAgICAgeC54MSwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTIsXHJcbiAgICAgICAgICAgICAgICB4LngyLCB0aGlzLl95MlxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYWZ0ZXJNb2RlbC5nZXQoJ3N0YXJ0JykpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvclZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSByZXF1aXJlKCcuL05lc3RlZFRhc2tWaWV3Jyk7XHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gcmVxdWlyZSgnLi9BbG9uZVRhc2tWaWV3Jyk7XHJcbnZhciBDb25uZWN0b3JWaWV3ID0gcmVxdWlyZSgnLi9Db25uZWN0b3JWaWV3Jyk7XHJcblxyXG52YXIgR2FudHRDaGFydFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyNnYW50dC1jb250YWluZXInLFxyXG4gICAgX3RvcFBhZGRpbmcgOiA3MyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gW107XHJcbiAgICAgICAgdGhpcy5faW5pdFN0YWdlKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdExheWVycygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRCYWNrZ3JvdW5kKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFN1YlZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdENvbGxlY3Rpb25FdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBzZXRMZWZ0UGFkZGluZyA6IGZ1bmN0aW9uKG9mZnNldCkge1xyXG4gICAgICAgIHRoaXMuX2xlZnRQYWRkaW5nID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN0YWdlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZSA9IG5ldyBLb252YS5TdGFnZSh7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA6IHRoaXMuZWxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRMYXllcnMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLkZsYXllciA9IG5ldyBLb252YS5MYXllcigpO1xyXG4gICAgICAgIHRoaXMuQmxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIsIHRoaXMuRmxheWVyKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlU3RhZ2VBdHRycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHByZXZpb3VzVGFza1ggPSB0aGlzLl90YXNrVmlld3MubGVuZ3RoID8gdGhpcy5fdGFza1ZpZXdzWzBdLmVsLngoKSA6IDA7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5zZXRBdHRycyh7XHJcbi8vICAgICAgICAgICAgeCA6IHRoaXMuX2xlZnRQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KCQoXCIudGFza3NcIikuaW5uZXJIZWlnaHQoKSArIHRoaXMuX3RvcFBhZGRpbmcsIHdpbmRvdy5pbm5lckhlaWdodCAtICQodGhpcy5zdGFnZS5nZXRDb250YWluZXIoKSkub2Zmc2V0KCkudG9wKSxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuJGVsLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDtcclxuICAgICAgICAgICAgICAgIHZhciBtaW5YID0gLSAobGluZVdpZHRoIC0gdGhpcy53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb3MueCA+IHNlbGYuX2xlZnRQYWRkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYuX2xlZnRQYWRkaW5nO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3MueCA8IG1pblgpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbWluWDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHBvcy54O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VsZi5kcmFnZ2VkVG9EYXkgPSBNYXRoLmFicyh4IC0gc2VsZi5fbGVmdFBhZGRpbmcpIC8gc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90YXNrVmlld3MubGVuZ3RoIHx8ICFwcmV2aW91c1Rhc2tYKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLngodGhpcy5fbGVmdFBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbnggPSAtKGxpbmVXaWR0aCAtIHRoaXMuc3RhZ2Uud2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMuX2xlZnRQYWRkaW5nIC0gKHRoaXMuZHJhZ2dlZFRvRGF5IHx8IDApICogc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZS54KE1hdGgubWF4KG1pbngsIHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xyXG5cclxuICAgIH0sXHJcbiAgICBfaW5pdEJhY2tncm91bmQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2hhcGUgPSBuZXcgS29udmEuU2hhcGUoe1xyXG4gICAgICAgICAgICBzY2VuZUZ1bmM6IHRoaXMuX2dldFNjZW5lRnVuY3Rpb24oKSxcclxuICAgICAgICAgICAgc3Ryb2tlOiAnbGlnaHRncmF5JyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgd2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcbiAgICAgICAgdmFyIGJhY2sgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuc3RhZ2UuaGVpZ2h0KCksXHJcbiAgICAgICAgICAgIHdpZHRoIDogd2lkdGhcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5CbGF5ZXIuYWRkKGJhY2spLmFkZChzaGFwZSk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2dldFNjZW5lRnVuY3Rpb24gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2Rpc3BsYXkgPSB0aGlzLnNldHRpbmdzLnNkaXNwbGF5O1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gMTtcclxuICAgICAgICB2YXIgcm93SGVpZ2h0ID0gMjA7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAgICAgICAgIHZhciBpLCBzLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XHJcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAvL2RyYXcgdGhyZWUgbGluZXNcclxuICAgICAgICAgICAgZm9yKGkgPSAxOyBpIDwgNCA7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcclxuICAgICAgICAgICAgZm9yIChzID0gMTsgcyA8IDM7IHMrKyl7XHJcbiAgICAgICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aD1oRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB5Zik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxMHB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWYgLSByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHlpID0geWY7IHlmID0geWYgKyByb3dIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwOyBzID0gMzsgeWYgPSAxMjAwO1xyXG4gICAgICAgICAgICB2YXIgZHJhZ0ludCA9IHBhcnNlSW50KHNhdHRyLmRyYWdJbnRlcnZhbCwgMTApO1xyXG4gICAgICAgICAgICB2YXIgaGlkZURhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYoIGRyYWdJbnQgPT09IDE0IHx8IGRyYWdJbnQgPT09IDMwKXtcclxuICAgICAgICAgICAgICAgIGhpZGVEYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gaERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgIGlmIChoaWRlRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWkgKyByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb250ZXh0LmZpbGxTdHJva2VTaGFwZSh0aGlzKTtcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTp3aWR0aCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0sXHJcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgcmVtb3ZlJywgXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gd2FpdCBmb3IgbGVmdCBwYW5lbCB1cGRhdGVzXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxuICAgICAgICB9LCAxMCkpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQgY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmRlcGVuZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdkZXBlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rvcih0YXNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICduZXN0ZWRTdGF0ZUNoYW5nZScsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9yZW1vdmVWaWV3Rm9yTW9kZWwgOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHZhciB0YXNrVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IG1vZGVsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVZpZXcodGFza1ZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZW1vdmVWaWV3IDogZnVuY3Rpb24odGFza1ZpZXcpIHtcclxuICAgICAgICB0YXNrVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBfLndpdGhvdXQodGhpcy5fdGFza1ZpZXdzLCB0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZUNvbm5lY3RvciA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5hZnRlck1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbm5lY3RvclZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBfLndpdGhvdXQodGhpcy5fY29ubmVjdG9yVmlld3MsIGNvbm5lY3RvclZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3ViVmlld3MgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB0aGlzLkZsYXllci5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFRhc2tWaWV3IDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciB2aWV3O1xyXG4gICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgdmlldyA9IG5ldyBOZXN0ZWRUYXNrVmlldyh7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlldyA9IG5ldyBBbG9uZVRhc2tWaWV3KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzLnB1c2godmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2FkZENvbm5lY3RvclZpZXcgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIGRlcGVuZElkID0gdGFzay5nZXQoJ2RlcGVuZCcpO1xyXG4gICAgICAgIGlmICghZGVwZW5kSWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBDb25uZWN0b3JWaWV3KHtcclxuICAgICAgICAgICAgYmVmb3JlTW9kZWwgOiB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRlcGVuZElkKSxcclxuICAgICAgICAgICAgYWZ0ZXJNb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcclxuICAgICAgICB2aWV3LmVsLm1vdmVUb0JvdHRvbSgpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MucHVzaCh2aWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVxdWVzdFJlc29ydCA6IChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSksXHJcbiAgICBfcmVzb3J0Vmlld3MgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGFzdFkgPSB0aGlzLl90b3BQYWRkaW5nO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2aWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIXZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2aWV3LnNldFkobGFzdFkpO1xyXG4gICAgICAgICAgICBsYXN0WSArPSB2aWV3LmhlaWdodDtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIGRlcGVuZElkID0gdGFzay5nZXQoJ2RlcGVuZCcpO1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpIHx8ICFkZXBlbmRJZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGVwZW5kSWQpO1xyXG4gICAgICAgICAgICB2YXIgYmVmb3JlVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBiZWZvcmVNb2RlbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBhZnRlclZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5iZWZvcmVNb2RlbCA9PT0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25uZWN0b3JWaWV3LnNldFkxKGJlZm9yZVZpZXcuZ2V0WSgpICsgYmVmb3JlVmlldy5fZnVsbEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICBjb25uZWN0b3JWaWV3LnNldFkyKGFmdGVyVmlldy5nZXRZKCkgICsgYWZ0ZXJWaWV3Ll9mdWxsSGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLkZsYXllci5iYXRjaERyYXcoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIE5lc3RlZFRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yIDogJyNiM2QxZmMnLFxyXG4gICAgX2JvcmRlclNpemUgOiA2LFxyXG4gICAgX2JhckhlaWdodCA6IDEwLFxyXG4gICAgX2NvbXBsZXRlQ29sb3IgOiAnI0M5NUYxMCcsXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS29udmEuTGluZSh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFswLCAwLCB0aGlzLl9ib3JkZXJTaXplICogMS41LCAwLCAwLCB0aGlzLl9ib3JkZXJTaXplXSxcclxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS29udmEuTGluZSh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFstdGhpcy5fYm9yZGVyU2l6ZSAqIDEuNSwgMCwgMCwgMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZV0sXHJcbiAgICAgICAgICAgIGNsb3NlZCA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZURhdGVzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZ3JvdXAgaXMgbW92ZWRcclxuICAgICAgICAvLyBzbyB3ZSBuZWVkIHRvIGRldGVjdCBpbnRlcnZhbFxyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLmZsb29yKHggLyBkYXlzV2lkdGgpO1xyXG4gICAgICAgIHZhciBuZXdTdGFydCA9IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5tb3ZlVG9TdGFydChuZXdTdGFydCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxKTtcclxuICAgICAgICB2YXIgY29tcGxldGVXaWR0aCA9ICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgICAgICBpZiAoY29tcGxldGVXaWR0aCA+IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbXBsZXRlQ29sb3IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh4LngyIC0geC54MSkgLSBjb21wbGV0ZVdpZHRoIDwgdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbXBsZXRlQ29sb3IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2tWaWV3OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE1vZGFsRWRpdCA9IHJlcXVpcmUoJy4uL01vZGFsVGFza0VkaXRWaWV3Jyk7XHJcblxyXG5mdW5jdGlvbiBDb250ZXh0TWVudVZpZXcocGFyYW1zKSB7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMuY29sbGVjdGlvbjtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICd1bCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykgfHwgJCh0aGlzKS5kYXRhKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmNvbGxlY3Rpb24uZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnZGVsZXRlJyl7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncHJvcGVydGllcycpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgTW9kYWxFZGl0KHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbCA6IG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzIDogc2VsZi5zZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soZGF0YSwgJ2Fib3ZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QmVsb3cnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH0sICdiZWxvdycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdpbmRlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24uaW5kZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLm91dGRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICBcInJvd0Fib3ZlXCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEFib3ZlXCIsIGljb246IFwiYWJvdmVcIiB9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEJlbG93XCIsIGljb246IFwiYmVsb3dcIiB9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7SW5kZW50IFJvd1wiLCBpY29uOiBcImluZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7T3V0ZGVudCBSb3dcIiwgaWNvbjogXCJvdXRkZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7IG5hbWU6IFwiJm5ic3A7UHJvcGVydGllc1wiLCBpY29uOiBcInByb3BlcnRpZXNcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjogeyBuYW1lOiBcIiZuYnNwO0RlbGV0ZSBSb3dcIiwgaWNvbjogXCJkZWxldGVcIiB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Db250ZXh0TWVudVZpZXcucHJvdG90eXBlLmFkZFRhc2sgPSBmdW5jdGlvbihkYXRhLCBpbnNlcnRQb3MpIHtcclxuICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGFzay5zYXZlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHRNZW51VmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnRGF0ZVBpY2tlcicsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLFxyXG4gICAgICAgICAgICBvblNlbGVjdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSB0aGlzLmdldERPTU5vZGUoKS52YWx1ZS5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgOiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdzaG93Jyk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcignZGVzdHJveScpO1xyXG4gICAgfSxcclxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvbW0veXknKTtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnTmVzdGVkVGFzaycsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9uKCdjaGFuZ2U6aGlkZGVuIGNoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdWJ0YXNrcyA9IHRoaXMucHJvcHMubW9kZWwuY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzay1saXN0LWNvbnRhaW5lciBkcmFnLWl0ZW0nICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiB0aGlzLnByb3BzLm1vZGVsXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdvbCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3N1Yi10YXNrLWxpc3Qgc29ydGFibGUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdWJ0YXNrc1xyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFzaztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XHJcbnZhciBOZXN0ZWRUYXNrID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrJyk7XHJcblxyXG5mdW5jdGlvbiBnZXREYXRhKGNvbnRhaW5lcikge1xyXG4gICAgdmFyIGRhdGEgPSBbXTtcclxuICAgIHZhciBjaGlsZHJlbiA9ICQoJzxvbD4nICsgY29udGFpbmVyLmdldCgwKS5pbm5lckhUTUwgKyAnPC9vbD4nKS5jaGlsZHJlbigpO1xyXG4gICAgXy5lYWNoKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgIHZhciAkY2hpbGQgPSAkKGNoaWxkKTtcclxuICAgICAgICB2YXIgb2JqID0ge1xyXG4gICAgICAgICAgICBpZCA6ICRjaGlsZC5kYXRhKCdpZCcpLFxyXG4gICAgICAgICAgICBjaGlsZHJlbiA6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc3VibGlzdCA9ICRjaGlsZC5maW5kKCdvbCcpO1xyXG4gICAgICAgIGlmIChzdWJsaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBvYmouY2hpbGRyZW4gPSBnZXREYXRhKHN1Ymxpc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLnB1c2gob2JqKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuXHJcbnZhciBTaWRlUGFuZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZTogJ1NpZGVQYW5lbCcsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX21ha2VTb3J0YWJsZSgpO1xyXG4gICAgfSxcclxuICAgIF9tYWtlU29ydGFibGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gJCgnLnRhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgY29udGFpbmVyLnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgZ3JvdXA6ICdzb3J0YWJsZScsXHJcbiAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yIDogJ29sJyxcclxuICAgICAgICAgICAgaXRlbVNlbGVjdG9yIDogJy5kcmFnLWl0ZW0nLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlciBzb3J0LXBsYWNlaG9sZGVyXCIvPicsXHJcbiAgICAgICAgICAgIG9uRHJhZ1N0YXJ0IDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uRHJhZyA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwbGFjZWhvbGRlciA9ICQoJy5zb3J0LXBsYWNlaG9sZGVyJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNTdWJUYXNrID0gISQoJHBsYWNlaG9sZGVyLnBhcmVudCgpKS5oYXNDbGFzcygndGFzay1jb250YWluZXInKTtcclxuICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnIDogaXNTdWJUYXNrID8gJzMwcHgnIDogJzAnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uRHJvcCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZ2V0RGF0YShjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5yZXNvcnQoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyID0gJCgnPGRpdj4nKTtcclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmQgOiAnZ3JleScsXHJcbiAgICAgICAgICAgIG9wYWNpdHkgOiAnMC41JyxcclxuICAgICAgICAgICAgbGlmdCA6ICcwJyxcclxuICAgICAgICAgICAgdG9wIDogJzAnLFxyXG4gICAgICAgICAgICB3aWR0aCA6ICcxMDAlJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBjb250YWluZXIubW91c2VvdmVyKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgICAgICB2YXIgcG9zID0gJGVsLm9mZnNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wIDogcG9zLnRvcCArICdweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgOiAkZWwuaGVpZ2h0KClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICBjb250YWluZXIubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICByZXF1ZXN0VXBkYXRlIDogKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgd2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KCkpLFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLnRhc2stY29udGFpbmVyJykuc29ydGFibGUoXCJkZXN0cm95XCIpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2tcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdvbCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzay1jb250YWluZXIgc29ydGFibGUnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdGFza3NcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaWRlUGFuZWw7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vRGF0ZVBpY2tlcicpO1xyXG5cclxudmFyIFRhc2tJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnVGFza0l0ZW0nLFxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZWRpdFJvdyA6IHVuZGVmaW5lZFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50RGlkVXBkYXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZTpuYW1lIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCBjaGFuZ2U6ZHVyYXRpb24gY2hhbmdlOmhpZ2h0bGlnaHQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIF9maW5kTmVzdGVkTGV2ZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGV2ZWwgPSAwO1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLm1vZGVsLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV2ZWwrKztcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdFJvdyA9PT0gY29sKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVFZGl0RmllbGQoY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVJlYWRGaWxlZChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVSZWFkRmlsZWQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xyXG4gICAgICAgIGlmIChjb2wgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpICsgJyUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuZ2V0KCdzdGFydCcpLCBtb2RlbC5nZXQoJ2VuZCcpKSsnIGQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KGNvbCk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZURhdGVFbGVtZW50IDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF0ZVBpY2tlciwge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHZhbCxcclxuICAgICAgICAgICAga2V5IDogY29sLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2R1cmF0aW9uQ2hhbmdlIDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICB2YXIgbnVtYmVyID0gcGFyc2VJbnQodmFsdWUucmVwbGFjZSggL15cXEQrL2csICcnKSwgMTApO1xyXG4gICAgICAgIGlmICghbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJ3cnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZFdlZWtzKG51bWJlcikpO1xyXG4gICAgICAgIH0gZWxzZSAgaWYgKHZhbHVlLmluZGV4T2YoJ20nKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZE1vbnRocyhudW1iZXIpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBudW1iZXItLTtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkRGF5cyhudW1iZXIpKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUR1cmF0aW9uRmllbGQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdmFsID0gRGF0ZS5kYXlzZGlmZih0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKSwgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2VuZCcpKSsnIGQnO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB0aGlzLnN0YXRlLnZhbCB8fCB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6ICdkdXJhdGlvbicsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHVyYXRpb25DaGFuZ2UobmV3VmFsKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS52YWwgPSBuZXdWYWw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbktleURvd24gOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS52YWwgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVFZGl0RmllbGQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKTtcclxuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZURhdGVFbGVtZW50KGNvbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUR1cmF0aW9uRmllbGQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHZhbCxcclxuICAgICAgICAgICAga2V5IDogY29sLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbktleURvd24gOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkJsdXIgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3VsJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2sgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBlLnRhcmdldC5jbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBlLnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sID0gY2xhc3NOYW1lLnNsaWNlKDQsIGNsYXNzTmFtZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gY29sO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kQ29sb3InIDogdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2hpZ2h0bGlnaHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnc29ydGluZGV4JyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXNvcnRpbmRleCdcclxuICAgICAgICAgICAgICAgIH0sIG1vZGVsLmdldCgnc29ydGluZGV4JykgKyAxKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiAnbmFtZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtbmFtZSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuaXNOZXN0ZWQoKSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2knLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0cmlhbmdsZSBpY29uICcgKyAodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpID8gJ3JpZ2h0JyA6ICdkb3duJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2sgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdjb2xsYXBzZWQnLCAhdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgOiAodGhpcy5fZmluZE5lc3RlZExldmVsKCkgKiAxMCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpZWxkKCduYW1lJykpXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2NvbXBsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWNvbXBsZXRlJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2NvbXBsZXRlJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3N0YXJ0JyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXN0YXJ0J1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ3N0YXJ0JykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2VuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1lbmQnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnZW5kJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2R1cmF0aW9uJykpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbTtcclxuIl19
