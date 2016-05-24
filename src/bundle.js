(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var util = require("./utils/util");
var params = util.getURLParams();

var tasksSubURL = "";
// detect API params from get, e.g. ?project=143&profile=17&sitekey=2b00da46b57c0395
if (params.project && params.profile && params.sitekey) {
    tasksSubURL = "/" + params.project + "/" + params.profile + "/" + params.sitekey;
}
var tasksURL = "api/tasks/" + tasksSubURL;

exports.tasksURL = tasksURL;
var configSubURL = "";
if (window.location.hostname.indexOf("localhost") === -1) {
    configSubURL = "/wbs/" + params.project + "/" + params.sitekey;
}

var configURL = "/api/GanttConfig" + configSubURL;
exports.configURL = configURL;

},{"./utils/util":8}],2:[function(require,module,exports){
"use strict";

var ResourceReferenceModel = require("../models/ResourceReference");

var util = require("../utils/util");
var params = util.getURLParams();

var Collection = Backbone.Collection.extend({
    url: "api/resources/" + (params.project || 1) + "/" + (params.profile || 1),
    model: ResourceReferenceModel,
    idAttribute: "ID",
    updateResourcesForTask: function updateResourcesForTask(task) {
        // remove old references
        this.toArray().forEach(function (ref) {
            if (ref.get("WBSID").toString() !== task.id.toString()) {
                return;
            }
            var isOld = task.get("resources").indexOf(ref.get("ResID"));
            if (isOld) {
                ref.destroy();
            }
        }, this);
        // add new references
        task.get("resources").forEach((function (resId) {
            var isExist = this.findWhere({ ResID: resId });
            if (!isExist) {
                this.add({
                    ResID: resId,
                    WBSID: task.id.toString()
                }).save();
            }
        }).bind(this));
    },
    parse: function parse(res) {
        var result = [];
        res.forEach(function (item) {
            item.Resources.forEach(function (resItem) {
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

var TaskModel = require("../models/TaskModel");

var TaskCollection = Backbone.Collection.extend({
	url: "api/tasks",
	model: TaskModel,
	initialize: function initialize() {
		this._preventSorting = false;
		this.subscribe();
	},
	setDefaultStatusId: function setDefaultStatusId(id) {
		this.defaultStatusId = id;
	},
	setClosedStatusId: function setClosedStatusId(id) {
		this.closedStatusId = id;
	},
	comparator: function comparator(model) {
		return model.get("sortindex");
	},
	linkChildren: function linkChildren() {
		this.each((function (task) {
			if (!task.get("parentid")) {
				return;
			}
			var parentTask = this.get(task.get("parentid"));
			if (parentTask) {
				if (parentTask === task) {
					task.set("parentid", 0);
				} else {
					parentTask.children.add(task);
				}
			} else {
				console.error("task has parent with id " + task.get("parentid") + " - but there is no such task");
				task.unset("parentid");
			}
		}).bind(this));
	},
	_sortChildren: function _sortChildren(task, sortIndex) {
		task.children.toArray().forEach((function (child) {
			child.set("sortindex", ++sortIndex);
			sortIndex = this._sortChildren(child, sortIndex);
		}).bind(this));
		return sortIndex;
	},
	checkSortedIndex: function checkSortedIndex() {
		var sortIndex = -1;
		this.toArray().forEach((function (task) {
			if (task.get("parentid")) {
				return;
			}
			task.set("sortindex", ++sortIndex);
			sortIndex = this._sortChildren(task, sortIndex);
		}).bind(this));
		this.sort();
	},
	_resortChildren: function _resortChildren(data, startIndex, parentID) {
		var sortIndex = startIndex;
		data.forEach((function (taskData) {
			var task = this.get(taskData.id);
			if (task.get("parentid") !== parentID) {
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
		}).bind(this));
		return sortIndex;
	},
	resort: function resort(data) {
		this._preventSorting = true;
		this._resortChildren(data, -1, 0);
		this._preventSorting = false;
		this.sort();
	},
	subscribe: function subscribe() {
		var _this = this;

		this.listenTo(this, "reset", function () {
			// add empty task if no tasks from server
			if (_this.length === 0) {
				_this.reset([{
					name: "New task"
				}]);
			}
		});
		this.listenTo(this, "add", function (model) {
			if (model.get("parentid")) {
				var parent = this.find(function (m) {
					return m.id === model.get("parentid");
				});
				if (parent) {
					parent.children.add(model);
					model.parent = parent;
				} else {
					console.warn("can not find parent with id " + model.get("parentid"));
					model.set("parentid", 0);
				}
			}
			if (this.defaultStatusId) {
				model.set("status", this.defaultStatusId);
			}
		});
		this.listenTo(this, "reset", function () {
			this.linkChildren();
			this.checkSortedIndex();
			this._checkDependencies();
		});
		this.listenTo(this, "change:parentid", function (task) {
			if (task.parent) {
				task.parent.children.remove(task);
				task.parent = undefined;
			}

			var newParent = this.get(task.get("parentid"));
			if (newParent) {
				newParent.children.add(task);
			}
			if (!this._preventSorting) {
				this.checkSortedIndex();
			}
		});
		this.listenTo(this, "change:complete", function (task) {
			if (task.get("complete") == 100 && _this.closedStatusId !== undefined) {
				task.set("status", _this.closedStatusId);
			}
		});
	},
	createDependency: function createDependency(beforeModel, afterModel) {
		if (this._canCreateDependence(beforeModel, afterModel)) {
			afterModel.dependOn(beforeModel);
		}
	},

	_canCreateDependence: function _canCreateDependence(beforeModel, afterModel) {
		if (beforeModel.hasParent(afterModel) || afterModel.hasParent(beforeModel)) {
			return false;
		}
		if (beforeModel.hasInDeps(afterModel) || afterModel.hasInDeps(beforeModel)) {
			return false;
		}
		return true;
	},
	removeDependency: function removeDependency(afterModel) {
		afterModel.clearDependence();
	},
	_checkDependencies: function _checkDependencies() {
		var _this = this;

		this.each(function (task) {
			var ids = task.get("depend").concat([]);
			var hasGoodDepends = false;
			if (ids.length === 0) {
				return;
			}

			_.each(ids, function (id) {
				var beforeModel = _this.get(id);
				if (beforeModel) {
					task.dependOn(beforeModel, true);
					hasGoodDepends = true;
				}
			});
			if (!hasGoodDepends) {
				task.save("depend", []);
			}
		});
	},
	outdent: function outdent(task) {
		var underSublings = [];
		if (task.parent) {
			task.parent.children.each(function (child) {
				if (child.get("sortindex") <= task.get("sortindex")) {
					return;
				}
				underSublings.push(child);
			});
		}

		this._preventSorting = true;
		underSublings.forEach(function (child) {
			if (child.depends.get(task.id)) {
				child.clearDependence();
			}
			child.save("parentid", task.id);
		});
		this._preventSorting = false;
		if (task.parent && task.parent.parent) {
			task.save("parentid", task.parent.parent.id);
		} else {
			task.save("parentid", 0);
		}
	},
	indent: function indent(task) {
		var prevTask, i, m;
		for (i = this.length - 1; i >= 0; i--) {
			m = this.at(i);
			if (m.get("sortindex") < task.get("sortindex") && task.parent === m.parent) {
				prevTask = m;
				break;
			}
		}
		if (prevTask) {
			task.save("parentid", prevTask.id);
		}
	},
	importTasks: function importTasks(taskJSONarray, callback) {
		var sortindex = -1;
		if (this.last()) {
			sortindex = this.last().get("sortindex");
		}
		taskJSONarray.forEach(function (taskItem) {
			taskItem.sortindex = ++sortindex;
		});
		var length = taskJSONarray.length;
		var done = 0;
		this.add(taskJSONarray, { parse: true }).forEach(function (task) {
			task.save({}, {
				success: function () {
					done += 1;
					if (done === length) {
						callback();
					}
				}
			});
		});
	},
	createDeps: function createDeps(data) {
		this._preventSorting = true;
		data.parents.forEach((function (item) {
			var parent = this.findWhere({
				name: item.parent.name,
				outline: item.parent.outline
			});
			var child = this.findWhere({
				name: item.child.name,
				outline: item.child.outline
			});
			child.save("parentid", parent.id);
		}).bind(this));

		data.deps.forEach((function (dep) {
			var beforeModel = this.findWhere({
				name: dep.before.name,
				outline: dep.before.outline
			});
			var afterModel = this.findWhere({
				name: dep.after.name,
				outline: dep.after.outline
			});
			this.createDependency(beforeModel, afterModel);
		}).bind(this));
		this._preventSorting = false;
		this.checkSortedIndex();
	}
});

module.exports = TaskCollection;

},{"../models/TaskModel":7}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// require('babel/external-helpers');

var TaskCollection = _interopRequire(require("./collections/TaskCollection"));

var Settings = _interopRequire(require("./models/SettingModel"));

var GanttView = _interopRequire(require("./views/GanttView"));

var _clientConfig = require("./clientConfig");

var tasksURL = _clientConfig.tasksURL;
var configURL = _clientConfig.configURL;

function loadTasks(tasks) {
    var dfd = new $.Deferred();
    tasks.fetch({
        success: function success() {
            dfd.resolve();
        },
        error: function error(err) {
            dfd.reject(err);
        },
        parse: true,
        reset: true
    });
    return dfd.promise();
}

function loadSettings(settings) {
    return $.getJSON(configURL).then(function (data) {
        settings.statuses = data;
    });
}

$(function () {
    var tasks = new TaskCollection();
    tasks.url = tasksURL;
    var settings = new Settings({}, { tasks: tasks });

    window.tasks = tasks;

    $.when(loadTasks(tasks)).then(function () {
        return loadSettings(settings);
    }).then(function () {
        console.log("Success loading tasks.");
        new GanttView({
            settings: settings,
            collection: tasks
        }).render();
    }).then(function () {
        tasks.setDefaultStatusId(settings.getDefaultStatusId());
        tasks.setClosedStatusId(settings.getClosedStatusId());
    }).then(function () {
        // hide loading
        $("#loader").fadeOut(function () {

            // display head always on top
            $("#head").css({
                position: "fixed"
            });

            // enable scrolling
            $("body").removeClass("hold-scroll");
        });
    }).fail(function (error) {
        console.error("Error while loading", error);
    });
});

},{"./clientConfig":1,"./collections/TaskCollection":3,"./models/SettingModel":6,"./views/GanttView":11}],5:[function(require,module,exports){
"use strict";

var util = require("../utils/util");
var params = util.getURLParams();

var ResourceReference = Backbone.Model.extend({
    defaults: {
        // main params
        WBSID: 1, // task id
        ResID: 1, // resource id
        TSActivate: true,

        // some server params
        WBSProfileID: params.profile,
        WBS_ID: params.profile,
        PartitNo: params.sitekey, // have no idea what is that
        ProjectRef: params.project,
        sitekey: params.sitekey

    },
    initialize: function initialize() {}
});

module.exports = ResourceReference;

},{"../utils/util":8}],6:[function(require,module,exports){
"use strict";

var util = require("../utils/util");

var SettingModel = Backbone.Model.extend({
	defaults: {
		interval: "daily",
		//days per interval
		dpi: 1
	},
	initialize: function initialize(attrs, params) {
		this.statuses = undefined;
		this.sattr = {
			hData: {},
			dragInterval: 1,
			daysWidth: 5,
			cellWidth: 35,
			minDate: new Date(2020, 1, 1),
			maxDate: new Date(0, 0, 0),
			boundaryMin: new Date(0, 0, 0),
			boundaryMax: new Date(2020, 1, 1),
			//months per cell
			mpc: 1
		};

		this.sdisplay = {
			screenWidth: $("#gantt-container").innerWidth() + 786,
			tHiddenWidth: 305,
			tableWidth: 710
		};

		this.collection = params.tasks;
		this.calculateIntervals();
		this.on("change:interval change:dpi", this.calculateIntervals);
		this.listenTo(this.collection, "add change:end", _.debounce(function () {
			this.calculateIntervals();
			this.trigger("change:width");
		}, 500));
	},
	getSetting: function getSetting(from, attr) {
		if (attr) {
			return this["s" + from][attr];
		}
		return this["s" + from];
	},
	findStatusId: function findStatusId(status) {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Status") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cfg_item.toLowerCase() === status.toLowerCase()) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	findStatusForId: function findStatusForId(id) {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Status") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.ID.toString().toLowerCase() === id.toString().toLowerCase()) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	getAllStatuses: function getAllStatuses() {
		var statuses = [];
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Status") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					statuses.push(statusItem.cfg_item);
				}
			}
		}
		return statuses;
	},
	getDefaultStatusId: function getDefaultStatusId() {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Status") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cDefault) {
						return statusItem.ID;
					}
				}
				console.warn("no default status in config");
			}
		}
	},
	getClosedStatusId: function getClosedStatusId() {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Status") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cClose) {
						return statusItem.ID;
					}
				}
				console.warn("no closed status in config");
			}
		}
	},
	findDefaultStatusId: function findDefaultStatusId() {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Status") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cDefault) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	findHealthId: function findHealthId(health) {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Health") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cfg_item.toLowerCase() === health.toLowerCase()) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	findHealthForId: function findHealthForId(id) {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Health") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.ID.toString().toLowerCase() === id.toString().toLowerCase()) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	findDefaultHealthId: function findDefaultHealthId() {
		for (var category in this.statuses.cfgdata) {
			var data = this.statuses.cfgdata[category];
			if (data.Category === "Task Health") {
				for (var i in data.data) {
					var statusItem = data.data[i];
					if (statusItem.cDefault) {
						return statusItem.ID;
					}
				}
			}
		}
	},
	findWOId: function findWOId(wo) {
		for (var i in this.statuses.wodata[0].data) {
			var data = this.statuses.wodata[0].data[i];
			if (data.WONumber.toLowerCase() === wo.toLowerCase()) {
				return data.ID;
			}
		}
	},
	findWOForId: function findWOForId(id) {
		for (var i in this.statuses.wodata[0].data) {
			var data = this.statuses.wodata[0].data[i];
			if (data.ID.toString() === id.toString()) {
				return data.WONumber;
			}
		}
	},
	findDefaultWOId: function findDefaultWOId() {
		return this.statuses.wodata[0].data[0].ID;
	},
	getDateFormat: function getDateFormat() {
		return "dd/mm/yy";
	},
	calcminmax: function calcminmax() {
		var minDate = new Date(),
		    maxDate = minDate.clone().addYears(1);

		this.collection.each(function (model) {
			if (model.get("start").compareTo(minDate) === -1) {
				minDate = model.get("start");
			}
			if (model.get("end").compareTo(maxDate) === 1) {
				maxDate = model.get("end");
			}
		});
		this.sattr.minDate = minDate;
		this.sattr.maxDate = maxDate;
	},
	setAttributes: function setAttributes() {
		var end,
		    sattr = this.sattr,
		    dattr = this.sdisplay,
		    duration,
		    size,
		    cellWidth,
		    dpi,
		    retfunc,
		    start,
		    last,
		    i = 0,
		    j = 0,
		    iLen = 0,
		    next = null;

		var interval = this.get("interval");

		if (interval === "daily") {
			this.set("dpi", 1, { silent: true });
			end = sattr.maxDate.clone().addDays(60);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20);
			sattr.daysWidth = 15;
			sattr.cellWidth = sattr.daysWidth;
			sattr.dragInterval = sattr.daysWidth;
			retfunc = function (date) {
				return date.clone().addDays(1);
			};
			sattr.mpc = 1;
		} else if (interval === "weekly") {
			this.set("dpi", 7, { silent: true });
			end = sattr.maxDate.clone().addDays(20 * 7);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20).moveToDayOfWeek(1, -1);
			sattr.daysWidth = 5;
			sattr.cellWidth = sattr.daysWidth * 7;
			sattr.dragInterval = sattr.daysWidth;
			sattr.mpc = 1;
			retfunc = function (date) {
				return date.clone().addDays(7);
			};
		} else if (interval === "monthly") {
			this.set("dpi", 30, { silent: true });
			end = sattr.maxDate.clone().addDays(12 * 30);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20).moveToFirstDayOfMonth();
			sattr.daysWidth = 2;
			sattr.cellWidth = "auto";
			sattr.dragInterval = 7 * sattr.daysWidth;
			sattr.mpc = 1;
			retfunc = function (date) {
				return date.clone().addMonths(1);
			};
		} else if (interval === "quarterly") {
			this.set("dpi", 30, { silent: true });
			end = sattr.maxDate.clone().addDays(20 * 30);
			sattr.boundaryMin = sattr.minDate.clone().addDays(-1 * 20);
			sattr.boundaryMin.moveToFirstDayOfQuarter();
			sattr.daysWidth = 1;
			sattr.cellWidth = "auto";
			sattr.dragInterval = 30 * sattr.daysWidth;
			sattr.mpc = 3;
			retfunc = function (date) {
				return date.clone().addMonths(3);
			};
		} else if (interval === "fix") {
			cellWidth = 30;
			duration = Date.daysdiff(sattr.minDate, sattr.maxDate);
			size = dattr.screenWidth - dattr.tHiddenWidth - 100;
			sattr.daysWidth = size / duration;
			dpi = Math.round(cellWidth / sattr.daysWidth);
			this.set("dpi", dpi, { silent: true });
			sattr.cellWidth = dpi * sattr.daysWidth;
			sattr.boundaryMin = sattr.minDate.clone().addDays(-2 * dpi);
			sattr.dragInterval = Math.round(0.3 * dpi) * sattr.daysWidth;
			end = sattr.maxDate.clone().addDays(30 * 10);
			sattr.mpc = Math.max(1, Math.round(dpi / 30));
			retfunc = function (date) {
				return date.clone().addDays(dpi);
			};
		} else if (interval === "auto") {
			dpi = this.get("dpi");
			sattr.cellWidth = (1 + Math.log(dpi)) * 12;
			sattr.daysWidth = sattr.cellWidth / dpi;
			sattr.boundaryMin = sattr.minDate.clone().addDays(-20 * dpi);
			end = sattr.maxDate.clone().addDays(30 * 10);
			sattr.mpc = Math.max(1, Math.round(dpi / 30));
			retfunc = function (date) {
				return date.clone().addDays(dpi);
			};
			sattr.dragInterval = Math.round(0.3 * dpi) * sattr.daysWidth;
		}
		var hData = {
			"1": [],
			"2": [],
			"3": []
		};
		var hdata3 = [];

		start = sattr.boundaryMin;

		last = start;
		if (interval === "monthly" || interval === "quarterly") {
			var durfunc;
			if (interval === "monthly") {
				durfunc = function (date) {
					return Date.getDaysInMonth(date.getFullYear(), date.getMonth());
				};
			} else {
				durfunc = function (date) {
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
			var intervaldays = this.get("dpi");
			while (last.compareTo(end) === -1) {
				var isHoly = last.getDay() === 6 || last.getDay() === 0;
				hdata3.push({
					duration: intervaldays,
					text: last.getDate(),
					holy: interval === "daily" && isHoly
				});
				next = retfunc(last);
				last = next;
			}
		}
		sattr.boundaryMax = end = last;
		hData["3"] = hdata3;

		//enter duration of first date to end of year
		var inter = Date.daysdiff(start, new Date(start.getFullYear(), 11, 31));
		hData["1"].push({
			duration: inter,
			text: start.getFullYear()
		});
		for (i = start.getFullYear() + 1, iLen = end.getFullYear(); i < iLen; i++) {
			inter = Date.isLeapYear(i) ? 366 : 365;
			hData["1"].push({
				duration: inter,
				text: i
			});
		}
		//enter duration of last year upto end date
		if (start.getFullYear() !== end.getFullYear()) {
			inter = Date.daysdiff(new Date(end.getFullYear(), 0, 1), end);
			hData["1"].push({
				duration: inter,
				text: end.getFullYear()
			});
		}

		//enter duration of first month
		hData["2"].push({
			duration: Date.daysdiff(start, start.clone().moveToLastDayOfMonth()),
			text: util.formatdata(start.getMonth(), "m")
		});

		j = start.getMonth() + 1;
		i = start.getFullYear();
		iLen = end.getFullYear();
		var endmonth = end.getMonth();

		while (i <= iLen) {
			while (j < 12) {
				if (i === iLen && j === endmonth) {
					break;
				}
				hData["2"].push({
					duration: Date.getDaysInMonth(i, j),
					text: util.formatdata(j, "m")
				});
				j += 1;
			}
			i += 1;
			j = 0;
		}
		if (end.getMonth() !== start.getMonth() && end.getFullYear() !== start.getFullYear()) {
			hData["2"].push({
				duration: Date.daysdiff(end.clone().moveToFirstDayOfMonth(), end),
				text: util.formatdata(end.getMonth(), "m")
			});
		}
		sattr.hData = hData;
	},
	calculateIntervals: function calculateIntervals() {
		this.calcminmax();
		this.setAttributes();
	},
	conDToT: (function () {
		var dToText = {
			start: function start(value) {
				return value.toString("dd/MM/yyyy");
			},
			end: function end(value) {
				return value.toString("dd/MM/yyyy");
			},
			duration: function duration(value, model) {
				return Date.daysdiff(model.start, model.end) + " d";
			},
			status: function status(value) {
				var statuses = {
					"110": "complete",
					"109": "open",
					"108": "ready"
				};
				return statuses[value];
			}

		};
		return function (field, value, model) {
			return dToText[field] ? dToText[field](value, model) : value;
		};
	})()
});

module.exports = SettingModel;

},{"../utils/util":8}],7:[function(require,module,exports){
"use strict";

var ResCollection = require("../collections/ResourceReferenceCollection");

var util = require("../utils/util");
var params = util.getURLParams();

var SubTasks = Backbone.Collection.extend({
    comparator: function comparator(model) {
        return model.get("sortindex");
    }
});

var resLinks = new ResCollection();
resLinks.fetch();

var TaskModel = Backbone.Model.extend({
    defaults: {
        // MAIN PARAMS
        name: "New task",
        description: "",
        complete: 0, // 0% - 100% percents
        sortindex: 0, // place on side menu, starts from 0
        depend: [], // id of tasks
        status: "110", // 110 - complete, 109  - open, 108 - ready
        start: new Date(),
        end: new Date(),
        parentid: 0,
        Comments: 0,

        color: "#0090d3", // user color, not used for now

        // some additional properties
        resources: [], //list of id
        health: 21,
        reportable: false,
        wo: 2, //Select List in properties modal   (configdata)
        milestone: false, //Check box in properties modal (true/false)
        deliverable: false, //Check box in properties modal (true/false)
        financial: false, //Check box in properties modal (true/false)
        timesheets: false, //Check box in properties modal (true/false)
        acttimesheets: false, //Check box in properties modal (true/false)

        // server specific params
        // don't use them on client side
        ProjectRef: params.project,
        WBS_ID: params.profile,
        sitekey: params.sitekey,

        // params for application views
        // should be removed from JSON
        hidden: false,
        collapsed: false,
        hightlight: ""
    },
    initialize: function initialize() {
        // self validation
        this.listenTo(this, "change:resources", function () {
            resLinks.updateResourcesForTask(this);
        });

        this.listenTo(this, "change:milestone", function () {
            if (this.get("milestone")) {
                this.set("start", new Date(this.get("end")));
            }
        });

        // children references
        this.children = new SubTasks();
        this.depends = new Backbone.Collection();

        this.listenTo(this.children, "add", function () {
            this.set("milestone", false);
        });

        // removing refs
        this.listenTo(this.children, "change:parentid", function (child) {
            if (child.get("parentid") === this.id) {
                return;
            }
            this.children.remove(child);
        });

        this.listenTo(this.children, "add", function (child) {
            child.parent = this;
        });
        this.listenTo(this.children, "change:sortindex", function () {
            this.children.sort();
        });
        this.listenTo(this.children, "add remove change:start change:end", function () {
            this._checkTime();
        });

        this.listenTo(this, "change:collapsed", function () {
            this.children.each((function (child) {
                if (this.get("collapsed")) {
                    child.hide();
                } else {
                    child.show();
                }
            }).bind(this));
        });
        this.listenTo(this, "destroy", function () {
            this.children.toArray().forEach(function (child) {
                child.destroy();
            });
            this.stopListening();
        });

        // checking nested state
        this.listenTo(this.children, "add remove", this._checkNested);

        // time checking
        this.listenTo(this.children, "add remove change:complete", this._checkComplete);
        this._listenDependsCollection();
    },
    isNested: function isNested() {
        return !!this.children.length;
    },
    show: function show() {
        this.set("hidden", false);
    },
    hide: function hide() {
        this.set("hidden", true);
        this.children.forEach(function (child) {
            child.hide();
        });
    },
    dependOn: function dependOn(beforeModel, silent) {
        this.depends.add(beforeModel, { silent: silent });
        if (this.get("start") < beforeModel.get("end")) {
            this.moveToStart(beforeModel.get("end"));
        }
        if (!silent) {
            this.save();
        }
    },
    hasInDeps: function hasInDeps(model) {
        return !!this.depends.get(model.id);
    },
    hasDeps: function hasDeps() {
        return this.depends.length !== 0;
    },
    toJSON: function toJSON() {
        var json = Backbone.Model.prototype.toJSON.call(this);
        delete json.resources;
        delete json.hidden;
        delete json.collapsed;
        delete json.hightlight;
        json.depend = json.depend.join(",");
        return json;
    },
    hasParent: function hasParent(parentForCheck) {
        var parent = this.parent;
        while (true) {
            if (!parent) {
                return false;
            }
            if (parent === parentForCheck) {
                return true;
            }
            parent = parent.parent;
        }
    },
    clearDependence: function clearDependence() {
        var _this = this;

        this.depends.toArray().forEach(function (m) {
            _this.depends.remove(m);
        });
    },
    _listenDependsCollection: function _listenDependsCollection() {
        this.listenTo(this.depends, "remove add", function () {
            var ids = this.depends.map(function (m) {
                return m.id;
            });
            this.set("depend", ids).save();
        });

        this.listenTo(this.depends, "add", function (beforeModel) {
            this.collection.trigger("depend:add", beforeModel, this);
        });

        this.listenTo(this.depends, "remove", function (beforeModel) {
            this.collection.trigger("depend:remove", beforeModel, this);
        });

        this.listenTo(this.depends, "change:end", function (beforeModel) {
            if (this.parent && this.parent.underMoving) {
                return;
            }
            // check infinite depend loop
            var inDeps = [this];
            var isInfinite = false;

            function checkDeps(model) {
                if (!model.depends.length) {
                    return;
                }
                model.depends.each(function (m) {
                    if (inDeps.indexOf(m) > -1 || isInfinite) {
                        isInfinite = true;
                        return;
                    }
                    inDeps.push(m);
                    checkDeps(m);
                });
            }
            checkDeps(this);

            if (isInfinite) {
                return;
            }
            if (this.get("start") < beforeModel.get("end")) {
                this.moveToStart(beforeModel.get("end"));
            }
        });
    },
    _checkNested: function _checkNested() {
        this.trigger("nestedStateChange", this);
    },
    parse: function parse(response) {
        var start, end;
        if (_.isString(response.start)) {
            start = Date.parseExact(util.correctdate(response.start), "dd/MM/yyyy") || new Date(response.start);
        } else if (_.isDate(response.start)) {
            start = response.start;
        } else {
            start = new Date();
        }

        if (_.isString(response.end)) {
            end = Date.parseExact(util.correctdate(response.end), "dd/MM/yyyy") || new Date(response.end);
        } else if (_.isDate(response.end)) {
            end = response.end;
        } else {
            end = new Date();
        }

        response.start = start < end ? start : end;
        response.end = start < end ? end : start;

        response.start = util.convertDateToUTC(response.start);
        response.end = util.convertDateToUTC(response.end);
        response.parentid = parseInt(response.parentid || "0", 10);

        // remove null params
        _.each(response, function (val, key) {
            if (val === null) {
                delete response[key];
            }
        });

        // update resources as list of ID
        var ids = [];
        (response.Resources || []).forEach(function (resInfo) {
            ids.push(resInfo.ResID);
        });
        response.Resources = undefined;
        response.resources = ids;
        if (response.milestone) {
            response.start = response.end;
        }

        // update deps for new API (array of deps)
        if (_.isNumber(response.depend)) {
            response.depend = [response.depend];
        }
        if (_.isString(response.depend)) {
            response.depend = _.compact(response.depend.split(","));
        }
        return response;
    },
    _checkTime: function _checkTime() {
        if (this.children.length === 0) {
            return;
        }
        var startTime = this.children.at(0).get("start");
        var endTime = this.children.at(0).get("end");
        this.children.each(function (child) {
            var childStartTime = child.get("start");
            var childEndTime = child.get("end");
            if (childStartTime < startTime) {
                startTime = childStartTime;
            }
            if (childEndTime > endTime) {
                endTime = childEndTime;
            }
        });
        this.set("start", startTime);
        this.set("end", endTime);
    },
    _checkComplete: function _checkComplete() {
        var complete = 0;
        var length = this.children.length;
        if (length) {
            this.children.each(function (child) {
                complete += child.get("complete") / length;
            });
        }
        this.set("complete", Math.round(complete));
    },
    moveToStart: function moveToStart(newStart) {
        // do nothing if new start is the same as current
        if (newStart.toDateString() === this.get("start").toDateString()) {
            return;
        }

        // calculate offset
        //        var daysDiff = Math.floor((newStart.time() - this.get('start').time()) / 1000 / 60 / 60 / 24)
        var daysDiff = Date.daysdiff(newStart, this.get("start")) - 1;
        if (newStart < this.get("start")) {
            daysDiff *= -1;
        }

        // change dates
        this.set({
            start: newStart.clone(),
            end: this.get("end").clone().addDays(daysDiff)
        });

        // changes dates in all children
        this.underMoving = true;
        this._moveChildren(daysDiff);
        this.underMoving = false;
    },
    _moveChildren: function _moveChildren(days) {
        this.children.each(function (child) {
            child.move(days);
        });
    },
    saveWithChildren: function saveWithChildren() {
        this.save();
        this.children.each(function (task) {
            task.saveWithChildren();
        });
    },
    move: function move(days) {
        this.set({
            start: this.get("start").clone().addDays(days),
            end: this.get("end").clone().addDays(days)
        });
        this._moveChildren(days);
    },
    getOutlineLevel: function getOutlineLevel() {
        var level = 1;
        var parent = this.parent;
        while (true) {
            if (!parent) {
                return level;
            }
            level++;
            parent = parent.parent;
        }
    },
    getOutlineNumber: function getOutlineNumber() {
        if (this.parent) {
            var index = this.parent.children.models.indexOf(this);
            return this.parent.getOutlineNumber() + "." + (index + 1);
        }

        var number = 1;
        for (var i = 0; i < this.collection.length; i++) {
            var model = this.collection.at(i);
            if (model === this) {
                return number;
            } else if (!model.parent) {
                number += 1;
            }
        }
    }
});

module.exports = TaskModel;

},{"../collections/ResourceReferenceCollection":2,"../utils/util":8}],8:[function(require,module,exports){
"use strict";

var monthsCode = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

module.exports.correctdate = function (str) {
	"use strict";
	return str;
};

module.exports.formatdata = function (val, type) {
	"use strict";
	if (type === "m") {
		return monthsCode[val];
	}
	return val;
};

module.exports.hfunc = function (pos) {
	"use strict";
	return {
		x: pos.x,
		y: this.getAbsolutePosition().y
	};
};

function transformToAssocArray(prmstr) {
	var params = {};
	var prmarr = prmstr.split("&");
	var i, tmparr;
	for (i = 0; i < prmarr.length; i++) {
		tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	return params;
}

module.exports.getURLParams = function () {
	if (typeof window === "undefined") {
		return {};
	}
	var prmstr = window.location.search.substr(1);
	return prmstr !== null && prmstr !== "" ? transformToAssocArray(prmstr) : {};
};

module.exports.convertDateToUTC = function (date) {
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
};

},{}],9:[function(require,module,exports){
"use strict";


var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n<Project xmlns=\"http://schemas.microsoft.com/project\">\r\n    <SaveVersion>14</SaveVersion>\r\n    <Name>Gantt Tasks.xml</Name>\r\n    <Title>Project</Title>\r\n    <CreationDate><%= currentDate %></CreationDate>\r\n    <LastSaved><%= currentDate %></LastSaved>\r\n    <ScheduleFromStart>1</ScheduleFromStart>\r\n    <StartDate><%= startDate %></StartDate>\r\n    <FinishDate><%= finishDate %></FinishDate>\r\n    <FYStartDate>1</FYStartDate>\r\n    <CriticalSlackLimit>0</CriticalSlackLimit>\r\n    <CurrencyDigits>2</CurrencyDigits>\r\n    <CurrencySymbol>$</CurrencySymbol>\r\n    <CurrencyCode>USD</CurrencyCode>\r\n    <CurrencySymbolPosition>0</CurrencySymbolPosition>\r\n    <CalendarUID>1</CalendarUID>\r\n    <DefaultStartTime>08:00:00</DefaultStartTime>\r\n    <DefaultFinishTime>17:00:00</DefaultFinishTime>\r\n    <MinutesPerDay>480</MinutesPerDay>\r\n    <MinutesPerWeek>2400</MinutesPerWeek>\r\n    <DaysPerMonth>20</DaysPerMonth>\r\n    <DefaultTaskType>0</DefaultTaskType>\r\n    <DefaultFixedCostAccrual>3</DefaultFixedCostAccrual>\r\n    <DefaultStandardRate>0</DefaultStandardRate>\r\n    <DefaultOvertimeRate>0</DefaultOvertimeRate>\r\n    <DurationFormat>7</DurationFormat>\r\n    <WorkFormat>2</WorkFormat>\r\n    <EditableActualCosts>0</EditableActualCosts>\r\n    <HonorConstraints>0</HonorConstraints>\r\n    <InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>\r\n    <MultipleCriticalPaths>0</MultipleCriticalPaths>\r\n    <NewTasksEffortDriven>0</NewTasksEffortDriven>\r\n    <NewTasksEstimated>1</NewTasksEstimated>\r\n    <SplitsInProgressTasks>1</SplitsInProgressTasks>\r\n    <SpreadActualCost>0</SpreadActualCost>\r\n    <SpreadPercentComplete>0</SpreadPercentComplete>\r\n    <TaskUpdatesResource>1</TaskUpdatesResource>\r\n    <FiscalYearStart>0</FiscalYearStart>\r\n    <WeekStartDay>0</WeekStartDay>\r\n    <MoveCompletedEndsBack>0</MoveCompletedEndsBack>\r\n    <MoveRemainingStartsBack>0</MoveRemainingStartsBack>\r\n    <MoveRemainingStartsForward>0</MoveRemainingStartsForward>\r\n    <MoveCompletedEndsForward>0</MoveCompletedEndsForward>\r\n    <BaselineForEarnedValue>0</BaselineForEarnedValue>\r\n    <AutoAddNewResourcesAndTasks>1</AutoAddNewResourcesAndTasks>\r\n    <CurrentDate><%= currentDate %></CurrentDate>\r\n    <MicrosoftProjectServerURL>1</MicrosoftProjectServerURL>\r\n    <Autolink>0</Autolink>\r\n    <NewTaskStartDate>0</NewTaskStartDate>\r\n    <NewTasksAreManual>1</NewTasksAreManual>\r\n    <DefaultTaskEVMethod>0</DefaultTaskEVMethod>\r\n    <ProjectExternallyEdited>0</ProjectExternallyEdited>\r\n    <ExtendedCreationDate>1984-01-01T00:00:00</ExtendedCreationDate>\r\n    <ActualsInSync>0</ActualsInSync>\r\n    <RemoveFileProperties>0</RemoveFileProperties>\r\n    <AdminProject>0</AdminProject>\r\n    <UpdateManuallyScheduledTasksWhenEditingLinks>1</UpdateManuallyScheduledTasksWhenEditingLinks>\r\n    <KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>0</KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>\r\n    <OutlineCodes/>\r\n    <WBSMasks/>\r\n    <ExtendedAttributes/>\r\n    <Calendars>\r\n        <Calendar>\r\n            <UID>1</UID>\r\n            <Name>Standard</Name>\r\n            <IsBaseCalendar>1</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>-1</BaseCalendarUID>\r\n            <WeekDays>\r\n                <WeekDay>\r\n                    <DayType>1</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>2</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>3</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>4</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>5</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>6</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>7</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n            </WeekDays>\r\n        </Calendar>\r\n    </Calendars>\r\n    <Tasks>\r\n        <Task>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Name>Project</Name>\r\n            <Active>1</Active>\r\n            <Manual>0</Manual>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <CreateDate><%= startDate %></CreateDate>\r\n            <WBS>0</WBS>\r\n            <OutlineNumber>0</OutlineNumber>\r\n            <OutlineLevel>0</OutlineLevel>\r\n            <Priority>500</Priority>\r\n            <Start><%= startDate %></Start>\r\n            <Finish><%= finishDate %></Finish>\r\n            <Duration><%= duration %></Duration>\r\n            <ManualStart><%= startDate %></ManualStart>\r\n            <ManualFinish><%= finishDate %></ManualFinish>\r\n            <ManualDuration><%= duration %></ManualDuration>\r\n            <DurationFormat>53</DurationFormat>\r\n            <Work>PT0H0M0S</Work>\r\n            <ResumeValid>0</ResumeValid>\r\n            <EffortDriven>0</EffortDriven>\r\n            <Recurring>0</Recurring>\r\n            <OverAllocated>0</OverAllocated>\r\n            <Estimated>1</Estimated>\r\n            <Milestone>0</Milestone>\r\n            <Summary>1</Summary>\r\n            <DisplayAsSummary>0</DisplayAsSummary>\r\n            <Critical>1</Critical>\r\n            <IsSubproject>0</IsSubproject>\r\n            <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n            <ExternalTask>0</ExternalTask>\r\n            <EarlyStart><%= startDate %></EarlyStart>\r\n            <EarlyFinish><%= finishDate %></EarlyFinish>\r\n            <LateStart><%= startDate %></LateStart>\r\n            <LateFinish><%= finishDate %></LateFinish>\r\n            <StartVariance>0</StartVariance>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <FreeSlack>0</FreeSlack>\r\n            <TotalSlack>0</TotalSlack>\r\n            <StartSlack>0</StartSlack>\r\n            <FinishSlack>0</FinishSlack>\r\n            <FixedCost>0</FixedCost>\r\n            <FixedCostAccrual>3</FixedCostAccrual>\r\n            <PercentComplete>0</PercentComplete>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <Cost>0</Cost>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualDuration>PT0H0M0S</ActualDuration>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <RemainingDuration><%= duration %></RemainingDuration>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <ACWP>0.00</ACWP>\r\n            <CV>0.00</CV>\r\n            <ConstraintType>0</ConstraintType>\r\n            <CalendarUID>-1</CalendarUID>\r\n            <LevelAssignments>1</LevelAssignments>\r\n            <LevelingCanSplit>1</LevelingCanSplit>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>8</LevelingDelayFormat>\r\n            <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n            <HideBar>0</HideBar>\r\n            <Rollup>0</Rollup>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n            <EarnedValueMethod>0</EarnedValueMethod>\r\n            <IsPublished>0</IsPublished>\r\n            <CommitmentType>0</CommitmentType>\r\n        </Task><% tasks.forEach(function(task){ %>\r\n        <Task>\r\n            <UID><%= task.id %></UID>\r\n            <ID><%= task.id %></ID>\r\n            <Name><%= task.name %></Name>\r\n            <Active>1</Active>\r\n            <Manual>0</Manual>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <CreateDate><%= task.start %></CreateDate>\r\n            <WBS><%= task.outlineNumber %></WBS>\r\n            <OutlineNumber><%= task.outlineNumber %></OutlineNumber>\r\n            <OutlineLevel><%= task.outlineLevel %></OutlineLevel>\r\n            <Priority>500</Priority>\r\n            <Start><%= task.start %></Start>\r\n            <Finish><%= task.finish %></Finish>\r\n            <Duration><%= task.duration %></Duration>\r\n            <ManualStart><%= task.start %></ManualStart>\r\n            <ManualFinish><%= task.finish %></ManualFinish>\r\n            <ManualDuration><%= task.duration %></ManualDuration>\r\n            <DurationFormat>53</DurationFormat>\r\n            <Work>PT0H0M0S</Work>\r\n            <ResumeValid>0</ResumeValid>\r\n            <EffortDriven>0</EffortDriven>\r\n            <Recurring>0</Recurring>\r\n            <OverAllocated>0</OverAllocated>\r\n            <Estimated>1</Estimated>\r\n            <Milestone>0</Milestone>\r\n            <Summary>0</Summary>\r\n            <DisplayAsSummary>0</DisplayAsSummary>\r\n            <Critical>0</Critical>\r\n            <IsSubproject>0</IsSubproject>\r\n            <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n            <ExternalTask>0</ExternalTask>\r\n            <EarlyStart><%= task.start %></EarlyStart>\r\n            <EarlyFinish><%= task.finish %></EarlyFinish>\r\n            <LateStart><%= task.start %></LateStart>\r\n            <LateFinish><%= task.finish %></LateFinish>\r\n            <StartVariance>0</StartVariance>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <FreeSlack>0</FreeSlack>\r\n            <TotalSlack>0</TotalSlack>\r\n            <StartSlack>0</StartSlack>\r\n            <FinishSlack>0</FinishSlack>\r\n            <FixedCost>0</FixedCost>\r\n            <FixedCostAccrual>3</FixedCostAccrual>\r\n            <PercentComplete>0</PercentComplete>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <Cost>0</Cost>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualDuration>PT0H0M0S</ActualDuration>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <RemainingDuration><%= task.duration %></RemainingDuration>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <ACWP>0.00</ACWP>\r\n            <CV>0.00</CV>\r\n            <ConstraintType>0</ConstraintType>\r\n            <CalendarUID>-1</CalendarUID>\r\n            <LevelAssignments>1</LevelAssignments>\r\n            <LevelingCanSplit>1</LevelingCanSplit>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>8</LevelingDelayFormat>\r\n            <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n            <HideBar>0</HideBar>\r\n            <Rollup>0</Rollup>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n            <EarnedValueMethod>0</EarnedValueMethod><% if (task.depend !== undefined) {%>\r\n            <PredecessorLink>\r\n                <PredecessorUID><%= task.depend %></PredecessorUID>\r\n                <Type>1</Type>\r\n                <CrossProject>0</CrossProject>\r\n                <LinkLag>0</LinkLag>\r\n                <LagFormat>7</LagFormat>\r\n            </PredecessorLink><% } %> \r\n            <IsPublished>1</IsPublished>\r\n            <CommitmentType>0</CommitmentType>\r\n        </Task><% }); %>\r\n    </Tasks>\r\n    <Resources>\r\n        <Resource>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <WorkGroup>0</WorkGroup>\r\n            <MaxUnits>1.00</MaxUnits>\r\n            <PeakUnits>0.00</PeakUnits>\r\n            <OverAllocated>0</OverAllocated>\r\n            <CanLevel>1</CanLevel>\r\n            <AccrueAt>3</AccrueAt>\r\n            <Work>PT0H0M0S</Work>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <StandardRate>0</StandardRate>\r\n            <StandardRateFormat>2</StandardRateFormat>\r\n            <Cost>0</Cost>\r\n            <OvertimeRate>0</OvertimeRate>\r\n            <OvertimeRateFormat>2</OvertimeRateFormat>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <CostPerUse>0</CostPerUse>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <CostVariance>0</CostVariance>\r\n            <SV>0.00</SV>\r\n            <CV>0.00</CV>\r\n            <ACWP>0.00</ACWP>\r\n            <CalendarUID>2</CalendarUID>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <IsGeneric>0</IsGeneric>\r\n            <IsInactive>0</IsInactive>\r\n            <IsEnterprise>0</IsEnterprise>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate><%= currentDate %></CreationDate>\r\n            <IsCostResource>0</IsCostResource>\r\n            <IsBudget>0</IsBudget>\r\n        </Resource>\r\n    </Resources>\r\n    <Assignments/>\r\n</Project>\r\n";
var compiled = _.template(xml);
var xmlToJSON = window.xmlToJSON;

function parseXMLObj(xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var tasks = [];
    _.each(obj.Project[0].Tasks[0].Task, function (xmlItem) {
        if (!xmlItem.Name) {
            return;
            // xmlItem.Name = [{_text: 'no name ' + xmlItem.UID[0]._text}];
        }
        // skip root project task
        if (xmlItem.OutlineNumber[0]._text.toString() === "0") {
            return;
        }
        tasks.push({
            name: xmlItem.Name[0]._text,
            start: xmlItem.Start[0]._text,
            end: xmlItem.Finish[0]._text,
            complete: xmlItem.PercentComplete[0]._text,
            outline: xmlItem.OutlineNumber[0]._text.toString()
        });
    });
    return tasks;
}

module.exports.parseDepsFromXML = function (xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var uids = {};
    var outlines = {};
    var deps = [];
    var parents = [];
    _.each(obj.Project[0].Tasks[0].Task, function (xmlItem) {
        if (!xmlItem.Name) {
            return;
            // xmlItem.Name = [{_text: 'no name ' + xmlItem.UID[0]._text}];
        }
        var item = {
            name: xmlItem.Name[0]._text.toString(),
            outline: xmlItem.OutlineNumber[0]._text.toString()
        };
        uids[xmlItem.UID[0]._text] = item;
        outlines[item.outline] = item;
    });
    _.each(obj.Project[0].Tasks[0].Task, function (xmlItem) {
        if (!xmlItem.Name) {
            return;
        }
        var task = uids[xmlItem.UID[0]._text];
        // var name = xmlItem.Name[0]._text;
        var outline = task.outline;

        if (xmlItem.PredecessorLink) {
            xmlItem.PredecessorLink.forEach(function (link) {
                var beforeUID = link.PredecessorUID[0]._text;
                var before = uids[beforeUID];

                deps.push({
                    before: before,
                    after: task
                });
            });
        }

        if (outline.indexOf(".") !== -1) {
            var parentOutline = outline.slice(0, outline.lastIndexOf("."));
            var parent = outlines[parentOutline];
            if (!parent) {
                console.error("can not find parent");
                return;
            }

            parents.push({
                parent: parent,
                child: task
            });
        }
    });
    return {
        deps: deps,
        parents: parents
    };
};

module.exports.parseXMLObj = parseXMLObj;

function cut(date) {
    var formated = date.toISOString();
    return formated.slice(0, formated.indexOf("."));
}

function getDuration(end, start) {
    var diff = end.getTime() - start.getTime();
    var days = Math.floor(diff / 1000 / 60 / 60 / 24) + 1;
    // if (days >= 1) {

    // }
    var hours = days * 8;
    // var mins = Math.floor((diff - hours * 1000 * 60 * 60) / 1000 /60);
    // var secs = Math.floor((diff - hours * 1000 * 60 * 60 - mins * 1000 * 60) / 1000);
    return "PT" + hours + "H0M0S";
}

module.exports.tasksToXML = function (tasks) {
    var start = tasks.at(0).get("start");
    var end = tasks.at(0).get("end");
    var data = tasks.map(function (task) {
        if (start > task.get("start")) {
            start = task.get("start");
        }
        if (end < task.get("end")) {
            end = task.get("end");
        }

        var depend = _.map(task.get("depend"), function (id) {
            return tasks.get(id).get("sortindex") + 1;
        });

        return {
            id: task.get("sortindex") + 1,
            name: task.get("name"),
            outlineNumber: task.getOutlineNumber(),
            outlineLevel: task.getOutlineLevel(),
            start: cut(task.get("start")),
            finish: cut(task.get("end")),
            duration: getDuration(task.get("end"), task.get("start")),
            depend: depend[0]
        };
    });
    return compiled({
        tasks: data,
        currentDate: cut(new Date()),
        startDate: cut(start),
        finishDate: cut(end),
        duration: getDuration(end, start)
    });
};

},{}],10:[function(require,module,exports){
"use strict";
var util = require("../utils/util");
var params = util.getURLParams();

var CommentsView = Backbone.View.extend({
    el: "#taskCommentsModal",
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    render: function render() {
        this._fillData();

        // open modal
        this.$el.modal({
            onHidden: (function () {
                $("#taskComments").empty();
                $(document.body).removeClass("dimmable");
            }).bind(this),
            onApprove: (function () {
                console.log("onApprove");
            }).bind(this),
            onHide: function onHide() {
                console.log("onHide");
                return false;
            },
            onDeny: function onDeny() {
                console.log("onDeny");
                return false;
            }
        }).modal("show");

        var updateCount = (function () {
            var count = $("#taskComments").comments("count");
            this.model.set("Comments", count);
        }).bind(this);
        var callback = {
            afterDelete: updateCount,
            afterCommentAdd: updateCount
        };
        if (window.location.hostname.indexOf("localhost") === -1) {
            // init comments
            $("#taskComments").comments({
                getCommentsUrl: "/api/comment/" + this.model.id + "/" + params.sitekey + "/WBS/000",
                postCommentUrl: "/api/comment/" + this.model.id + "/" + params.sitekey + "/WBS/" + params.project,
                deleteCommentUrl: "/api/comment/" + this.model.id,
                displayAvatar: false,
                callback: callback
            });
        } else {
            $("#taskComments").comments({
                getCommentsUrl: "/api/comment/" + this.model.id,
                postCommentUrl: "/api/comment/" + this.model.id,
                deleteCommentUrl: "/api/comment/" + this.model.id,
                displayAvatar: false,
                callback: callback
            });
        }
    },
    _fillData: function _fillData() {
        _.each(this.model.attributes, function (val, key) {
            var input = this.$el.find("[name=\"" + key + "\"]");
            if (!input.length) {
                return;
            }
            input.val(val);
        }, this);
    }
});

module.exports = CommentsView;

},{"../utils/util":8}],11:[function(require,module,exports){
"use strict";

var ContextMenuView = require("./sideBar/ContextMenuView");
var SidePanel = require("./sideBar/SidePanel");

var GanttChartView = require("./canvasChart/GanttChartView");
var TopMenuView = require("./TopMenuView/TopMenuView");

var Notifications = require("./Notifications");

var GanttView = Backbone.View.extend({
  el: ".Gantt",
  initialize: function initialize(params) {
    this.settings = params.settings;
    this.$el.find("input[name=\"end\"],input[name=\"start\"]").on("change", this.calculateDuration);
    this.$menuContainer = this.$el.find(".menu-container");

    new ContextMenuView({
      collection: this.collection,
      settings: this.settings
    }).render();

    // new task button
    $(".new-task").click(function () {
      var lastTask = params.collection.last();
      var lastIndex = -1;
      if (lastTask) {
        lastIndex = lastTask.get("sortindex");
      }
      params.collection.add({
        name: "New task",
        sortindex: lastIndex + 1
      });
    });

    new Notifications({
      collection: this.collection
    });

    new TopMenuView({
      settings: this.settings,
      collection: this.collection
    }).render();

    this.canvasView = new GanttChartView({
      collection: this.collection,
      settings: this.settings
    });
    this.canvasView.render();
    this._moveCanvasView();
    setTimeout((function () {
      this.canvasView._updateStageAttrs();
      // set side tasks panel height
      var $sidePanel = $(".menu-container");
      $sidePanel.css({
        "min-height": window.innerHeight - $sidePanel.offset().top
      });
    }).bind(this), 500);

    var tasksContainer = $(".tasks").get(0);
    React.render(React.createElement(SidePanel, {
      collection: this.collection,
      settings: this.settings,
      dateFormat: this.settings.getDateFormat()
    }), tasksContainer);

    this.listenTo(this.collection, "sort", _.debounce((function () {
      React.unmountComponentAtNode(tasksContainer);
      React.render(React.createElement(SidePanel, {
        collection: this.collection,
        settings: this.settings,
        dateFormat: this.settings.getDateFormat()
      }), tasksContainer);
    }).bind(this), 5));

    window.addEventListener("scroll", function () {
      var y = Math.max(0, document.body.scrollTop || window.scrollY);
      $(".menu-header").css({
        marginTop: y + "px"
      });
      $(".tasks").css({
        marginTop: "-" + y + "px"
      });
    });
  },
  events: {
    "click #tHandle": "expand",
    "click #deleteAll": "deleteAll"
  },
  calculateDuration: function calculateDuration() {

    // Calculating the duration from start and end date
    var startdate = new Date($(document).find("input[name=\"start\"]").val());
    var enddate = new Date($(document).find("input[name=\"end\"]").val());
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    if (startdate !== "" && enddate !== "") {
      var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());
      var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());
      $(document).find("input[name=\"duration\"]").val(Math.floor((utc2 - utc1) / _MS_PER_DAY));
    } else {
      $(document).find("input[name=\"duration\"]").val(Math.floor(0));
    }
  },
  expand: function expand(evt) {
    var button = $(evt.target);
    if (button.hasClass("contract")) {
      this.$menuContainer.addClass("panel-collapsed");
      this.$menuContainer.removeClass("panel-expanded");
    } else {
      this.$menuContainer.addClass("panel-expanded");
      this.$menuContainer.removeClass("panel-collapsed");
    }
    setTimeout((function () {
      this._moveCanvasView();
    }).bind(this), 600);
    button.toggleClass("contract");
  },
  _moveCanvasView: function _moveCanvasView() {
    var sideBarWidth = $(".menu-container").width();
    this.canvasView.setLeftPadding(sideBarWidth);
  },
  deleteAll: function deleteAll() {
    $("#confirm").modal({
      onHidden: function onHidden() {
        $(document.body).removeClass("dimmable");
      },
      onApprove: (function () {
        while (this.collection.at(0)) {
          this.collection.at(0).destroy();
        }
      }).bind(this)
    }).modal("show");
  }
});

module.exports = GanttView;

},{"./Notifications":13,"./TopMenuView/TopMenuView":19,"./canvasChart/GanttChartView":24,"./sideBar/ContextMenuView":26,"./sideBar/SidePanel":29}],12:[function(require,module,exports){
"use strict";

var ModalTaskEditComponent = Backbone.View.extend({
    el: "#editTask",
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    render: function render() {
        this.$el.find(".ui.checkbox").checkbox();
        // setup values for selectors
        this._prepareSelects();

        this.$el.find(".tabular.menu .item").tab();

        this.$el.find("[name=\"start\"], [name=\"end\"]").datepicker({
            //            dateFormat: "dd/mm/yy"
            dateFormat: this.settings.getDateFormat()
        });

        this._fillData();

        // open modal
        this.$el.modal({
            onHidden: (function () {
                $(document.body).removeClass("dimmable");
                this.undelegateEvents();
            }).bind(this),
            onApprove: (function () {
                this._saveData();
            }).bind(this)
        }).modal("show");
        this._listenInputs();
    },
    _listenInputs: function _listenInputs() {
        var $milestone = this.$el.find("[name=\"milestone\"]");
        var $deliverable = this.$el.find("[name=\"deliverable\"]");
        var $start = this.$el.find("[name=\"start\"]");
        var $end = this.$el.find("[name=\"end\"]");
        $milestone.on("change", function () {
            var val = $milestone.prop("checked");
            if (val) {
                $start.val($end.val());
                $deliverable.prop("checked", false);
            }
        });
        $deliverable.on("change", function () {
            if ($deliverable.prop("checked")) {
                $milestone.prop("checked", false);
            }
        });
    },
    _prepareSelects: function _prepareSelects() {
        var statusSelect = this.$el.find("[name=\"status\"]");
        statusSelect.children().each((function (i, child) {
            var id = this.settings.findStatusId(child.text);
            $(child).prop("value", id);
        }).bind(this));

        var healthSelect = this.$el.find("[name=\"health\"]");
        healthSelect.children().each((function (i, child) {
            var id = this.settings.findHealthId(child.text);
            $(child).prop("value", id);
        }).bind(this));

        var workOrderSelect = this.$el.find("[name=\"wo\"]");
        workOrderSelect.empty();
        this.settings.statuses.wodata[0].data.forEach(function (data) {
            $("<option value=\"" + data.ID + "\">" + data.WONumber + "</option>").appendTo(workOrderSelect);
        });
    },
    _fillData: function _fillData() {
        _.each(this.model.attributes, function (val, key) {
            if (key === "status" && (!val || !this.settings.findStatusForId(val))) {
                val = this.settings.findDefaultStatusId();
            }
            if (key === "health" && (!val || !this.settings.findHealthForId(val))) {
                val = this.settings.findDefaultHealthId();
            }
            if (key === "wo" && (!val || !this.settings.findWOForId(val))) {
                val = this.settings.findDefaultWOId();
            }
            var input = this.$el.find("[name=\"" + key + "\"]");
            if (!input.length) {
                return;
            }
            if (key === "start" || key === "end") {
                var dateStr = $.datepicker.formatDate(this.settings.getDateFormat(), val);
                input.get(0).value = dateStr;
                input.datepicker("refresh");
            } else if (input.prop("type") === "checkbox") {
                input.prop("checked", val);
            } else {
                input.val(val);
            }
        }, this);
        if (this.model.children.length) {
            this.$el.find("[name=\"milestone\"]").parent().addClass("disabled");
        }
    },
    _saveData: function _saveData() {
        _.each(this.model.attributes, function (val, key) {
            var input = this.$el.find("[name=\"" + key + "\"]");
            if (!input.length) {
                return;
            }
            if (key === "start" || key === "end") {
                var date = input.val().split("/");
                var value = new Date(date[2] + "-" + date[1] + "-" + date[0]);
                this.model.set(key, new Date(value));
            } else if (input.prop("type") === "checkbox") {
                this.model.set(key, input.prop("checked"));
            } else {
                this.model.set(key, input.val());
            }
        }, this);
        this.model.save();
    }
});

module.exports = ModalTaskEditComponent;

},{}],13:[function(require,module,exports){
"use strict";

var Notifications = Backbone.View.extend({
    initialize: function initialize() {
        this.listenTo(this.collection, "error", _.debounce(this.onError, 10));
    },
    onError: function onError() {
        console.error(arguments);
        noty({
            text: "Error while saving task, please refresh your browser, request support if this error continues.",
            layout: "topRight",
            type: "error"
        });
    }
});

module.exports = Notifications;

},{}],14:[function(require,module,exports){
"use strict";

var ResourceEditorView = Backbone.View.extend({
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    render: function render(pos) {
        var stagePos = $("#gantt-container").offset();
        var fakeEl = $("<div>").appendTo("body");
        fakeEl.css({
            position: "absolute",
            top: pos.y + stagePos.top + "px",
            left: pos.x + stagePos.left + "px"
        });

        this.popup = $(".custom.popup");
        fakeEl.popup({
            popup: this.popup,
            on: "hover",
            position: "bottom left",
            onHidden: (function () {
                this._saveData();
                this.popup.off(".editor");
            }).bind(this)
        }).popup("show");

        this._addResources();
        this.popup.find(".button").on("click.editor", (function () {
            this.popup.popup("hide");
            this._saveData();
            this.popup.off(".editor");
        }).bind(this));

        this._fullData();
    },
    _addResources: function _addResources() {
        this.popup.empty();
        var htmlString = "";
        (this.settings.statuses.resourcedata || []).forEach(function (resource) {
            htmlString += "<div class=\"ui checkbox\">" + "<input type=\"checkbox\"  name=\"" + resource.UserId + "\">" + "<label>" + resource.Username + "</label>" + "</div><br>";
        });
        htmlString += "<br><div style=\"text-align:center;\"><div class=\"ui positive right button save tiny\">" + "Close" + "</div></div>";
        this.popup.append(htmlString);
        this.popup.find(".ui.checkbox").checkbox();
    },
    _fullData: function _fullData() {
        var popup = this.popup;
        this.model.get("resources").forEach(function (resource) {
            popup.find("[name=\"" + resource + "\"]").prop("checked", true);
        });
    },
    _saveData: function _saveData() {
        var resources = [];
        this.popup.find("input").each((function (i, input) {
            var $input = $(input);
            if ($input.prop("checked")) {
                resources.push($input.attr("name"));
            }
        }).bind(this));
        this.model.set("resources", resources);
    }
});

module.exports = ResourceEditorView;

},{}],15:[function(require,module,exports){
"use strict";

var FilterView = Backbone.View.extend({
    el: "#filter-menu",
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    events: {
        "change #hightlights-select": function changeHightlightsSelect(e) {
            var hightlightTasks = this._getModelsForCriteria(e.target.value);
            this.collection.each(function (task) {
                if (hightlightTasks.indexOf(task) > -1) {
                    task.set("hightlight", this.colors[e.target.value]);
                } else {
                    task.set("hightlight", undefined);
                }
            }, this);
        },
        "change #filters-select": function changeFiltersSelect(e) {
            var criteria = e.target.value;
            if (criteria === "reset") {
                this.collection.each(function (task) {
                    task.show();
                });
            } else {
                var showTasks = this._getModelsForCriteria(e.target.value);
                this.collection.each(function (task) {
                    if (showTasks.indexOf(task) > -1) {
                        task.show();
                        // show all parents
                        var parent = task.parent;
                        while (parent) {
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
    colors: {
        "status-backlog": "#D2D2D9",
        "status-ready": "#B2D1F0",
        "status-in progress": "#66A3E0",
        "status-complete": "#99C299",
        late: "#FFB2B2",
        due: " #FFC299",
        milestone: "#D6C2FF",
        deliverable: "#E0D1C2",
        financial: "#F0E0B2",
        timesheets: "#C2C2B2",
        reportable: " #E0C2C2",
        "health-red": "red",
        "health-amber": "#FFBF00",
        "health-green": "green"
    },
    _getModelsForCriteria: function _getModelsForCriteria(creteria) {
        if (creteria === "resets") {
            return [];
        }
        if (creteria.indexOf("status") !== -1) {
            var status = creteria.slice(creteria.indexOf("-") + 1);
            var id = (this.settings.findStatusId(status) || "").toString();
            return this.collection.filter(function (task) {
                return task.get("status").toString() === id;
            });
        }
        if (creteria === "late") {
            return this.collection.filter(function (task) {
                return task.get("end") < new Date();
            });
        }
        if (creteria === "due") {
            var lastDate = new Date();
            lastDate.addWeeks(2);
            return this.collection.filter(function (task) {
                return task.get("end") > new Date() && task.get("end") < lastDate;
            });
        }
        if (["milestone", "deliverable", "financial", "timesheets", "reportable"].indexOf(creteria) !== -1) {
            return this.collection.filter(function (task) {
                return task.get(creteria);
            });
        }
        if (creteria.indexOf("health") !== -1) {
            var health = creteria.slice(creteria.indexOf("-") + 1);
            var healthId = (this.settings.findHealthId(health) || "").toString();
            return this.collection.filter(function (task) {
                return task.get("health").toString() === healthId;
            });
        }
        return [];
    }
});

module.exports = FilterView;

},{}],16:[function(require,module,exports){
"use strict";

var GroupingMenuView = Backbone.View.extend({
    el: "#grouping-menu",
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    events: {
        "click #top-expand-all": function clickTopExpandAll() {
            this.collection.each(function (task) {
                if (task.isNested()) {
                    task.set("collapsed", false);
                }
            });
        },
        "click #top-collapse-all": function clickTopCollapseAll() {
            this.collection.each(function (task) {
                if (task.isNested()) {
                    task.set("collapsed", true);
                }
            });
        }
    }
});

module.exports = GroupingMenuView;

},{}],17:[function(require,module,exports){
"use strict";

var parseXML = require("../../utils/xmlWorker").parseXMLObj;
var tasksToXML = require("../../utils/xmlWorker").tasksToXML;
var parseDepsFromXML = require("../../utils/xmlWorker").parseDepsFromXML;

var MSProjectMenuView = Backbone.View.extend({
    el: "#project-menu",

    initialize: function initialize(params) {
        this.settings = params.settings;
        this.importing = false;
        this._setupInput();
    },
    _setupInput: function _setupInput() {
        var input = $("#importFile");
        var self = this;
        input.on("change", function (evt) {
            var files = evt.target.files;
            _.each(files, function (file) {
                var parts = file.name.split(".");
                var extention = parts[parts.length - 1].toLowerCase();
                if (extention !== "xml") {
                    alert("The file type \"" + extention + "\" is not supported. Only xml files are allowed. Please save your MS project as a xml file and try again.");
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        self.xmlData = e.target.result;
                    } catch (e) {
                        alert("Error while paring file.");
                        throw e;
                    }
                };
                reader.readAsText(file);
            });
        });
    },
    events: {
        "click #upload-project": function clickUploadProject() {
            $("#msimport").modal({
                onHidden: function onHidden() {
                    $(document.body).removeClass("dimmable");
                },
                onApprove: (function () {
                    if (!this.xmlData || this.importing) {
                        return false;
                    }
                    this.importing = true;
                    $("#importProgress").show();
                    $("#importFile").hide();
                    $(document.body).removeClass("dimmable");
                    $("#xmlinput-form").trigger("reset");
                    setTimeout(this.importData.bind(this), 20);
                    return false;
                }).bind(this)
            }).modal("show");
            $("#importProgress").hide();
            $("#importFile").show();
        },
        "click #download-project": function clickDownloadProject() {
            var data = tasksToXML(this.collection);
            var blob = new Blob([data], { type: "application/json" });
            saveAs(blob, "GanttTasks.xml");
        }
    },
    progress: function progress(percent) {
        $("#importProgress").progress({
            percent: percent
        });
    },
    _prepareData: function _prepareData(data) {
        var defStatus = this.settings.findDefaultStatusId();
        var defHealth = this.settings.findDefaultHealthId();
        var defWO = this.settings.findDefaultWOId();
        data.forEach(function (item) {
            item.health = defHealth;
            item.status = defStatus;
            item.wo = defWO;
        });
        return data;
    },
    importData: function importData() {
        var delay = 100;
        this.progress(0);
        // this is some sort of callback hell!!
        // we need timeouts for better user experience
        // I think user want to see animated progress bar
        // but without timeouts it is not possible, right?
        setTimeout((function () {
            this.progress(10);
            var col = this.collection;
            var data = parseXML(this.xmlData);
            data = this._prepareData(data);

            setTimeout((function () {
                this.progress(26);
                col.importTasks(data, (function () {
                    this.progress(43);
                    setTimeout((function () {
                        this.progress(59);
                        var deps = parseDepsFromXML(this.xmlData);
                        setTimeout((function () {
                            this.progress(78);
                            col.createDeps(deps);
                            setTimeout((function () {
                                this.progress(100);
                                this.importing = false;
                                $("#msimport").modal("hide");
                            }).bind(this), delay);
                        }).bind(this), delay);
                    }).bind(this), delay);
                }).bind(this), delay);
            }).bind(this), delay);
        }).bind(this), delay);
    }
});

module.exports = MSProjectMenuView;

},{"../../utils/xmlWorker":9}],18:[function(require,module,exports){
"use strict";

var ReportsMenuView = Backbone.View.extend({
    el: "#reports-menu",
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    events: {
        "click #print": "generatePDF",
        "click #showVideo": "showHelp"
    },
    generatePDF: function generatePDF(evt) {
        window.print();
        evt.preventDefault();
    },
    showHelp: function showHelp() {
        $("#showVideoModal").modal({
            onHidden: function onHidden() {
                $(document.body).removeClass("dimmable");
            },
            onApprove: function onApprove() {
                $(document.body).removeClass("dimmable");
            }
        }).modal("show");
    }
});

module.exports = ReportsMenuView;

},{}],19:[function(require,module,exports){
"use strict";
var ZoomMenuView = require("./ZoomMenuView");
var GroupingMenuView = require("./GroupingMenuView");
var FilterMenuView = require("./FilterMenuView");
var MSProjectMenuView = require("./MSProjectMenuView");
var MiscMenuView = require("./MiscMenuView");

var TopMenuView = Backbone.View.extend({
    initialize: function initialize(params) {
        new ZoomMenuView(params).render();
        new GroupingMenuView(params).render();
        new FilterMenuView(params).render();
        new MSProjectMenuView(params).render();
        new MiscMenuView(params).render();
    }
});

module.exports = TopMenuView;

},{"./FilterMenuView":15,"./GroupingMenuView":16,"./MSProjectMenuView":17,"./MiscMenuView":18,"./ZoomMenuView":20}],20:[function(require,module,exports){
"use strict";

var ZoomMenuView = Backbone.View.extend({
    el: "#zoom-menu",
    initialize: function initialize(params) {
        this.settings = params.settings;
        this._hightlightSelected();
    },
    events: {
        "click .action": "onIntervalButtonClicked"
    },
    onIntervalButtonClicked: function onIntervalButtonClicked(evt) {
        var button = $(evt.currentTarget);
        var interval = button.data("interval");
        this.settings.set("interval", interval);
        this._hightlightSelected();
    },
    _hightlightSelected: function _hightlightSelected() {
        this.$(".action").removeClass("selected");

        var interval = this.settings.get("interval");
        this.$("[data-interval=\"" + interval + "\"]").addClass("selected");
    }
});

module.exports = ZoomMenuView;

},{}],21:[function(require,module,exports){
/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require("./BasicTaskView");

var AloneTaskView = BasicTaskView.extend({
    _borderWidth: 3,
    _color: "#E6F0FF",
    events: function events() {
        return _.extend(BasicTaskView.prototype.events(), {
            "dragmove .leftBorder": "_changeSize",
            "dragmove .rightBorder": "_changeSize",

            "dragend .leftBorder": "render",
            "dragend .rightBorder": "render",

            "mouseover .leftBorder": "_resizePointer",
            "mouseout .leftBorder": "_defaultMouse",

            "mouseover .rightBorder": "_resizePointer",
            "mouseout .rightBorder": "_defaultMouse"
        });
    },
    el: function el() {
        var group = BasicTaskView.prototype.el.call(this);
        var leftBorder = new Konva.Rect({
            dragBoundFunc: (function (pos) {
                var offset = this.el.getStage().x() + this.el.x();
                var localX = pos.x - offset;
                return {
                    x: Math.min(localX, this.el.find(".rightBorder")[0].x()) + offset,
                    y: this._y + this._topPadding
                };
            }).bind(this),
            width: this._borderWidth,
            fill: "black",
            y: this._topPadding,
            height: this._barHeight,
            draggable: true,
            name: "leftBorder"
        });
        group.add(leftBorder);
        var rightBorder = new Konva.Rect({
            dragBoundFunc: (function (pos) {
                var offset = this.el.getStage().x() + this.el.x();
                var localX = pos.x - offset;
                return {
                    x: Math.max(localX, this.el.find(".leftBorder")[0].x()) + offset,
                    y: this._y + this._topPadding
                };
            }).bind(this),
            width: this._borderWidth,
            fill: "black",
            y: this._topPadding,
            height: this._barHeight,
            draggable: true,
            name: "rightBorder"
        });
        group.add(rightBorder);
        return group;
    },
    _resizePointer: function _resizePointer() {
        document.body.style.cursor = "ew-resize";
    },
    _changeSize: function _changeSize() {
        var leftX = this.el.find(".leftBorder")[0].x();
        var rightX = this.el.find(".rightBorder")[0].x() + this._borderWidth;

        var rect = this.el.find(".mainRect")[0];
        rect.width(rightX - leftX);
        rect.x(leftX);

        // update complete params
        var completeRect = this.el.find(".completeRect")[0];
        completeRect.x(leftX);
        completeRect.width(this._calculateCompleteWidth());

        // move tool position
        var tool = this.el.find(".dependencyTool")[0];
        tool.x(rightX);
        var resources = this.el.find(".resources")[0];
        resources.x(rightX + this._toolbarOffset);

        this._updateDates();
    },
    render: function render() {
        var x = this._calculateX();
        this.el.find(".leftBorder")[0].x(0);
        this.el.find(".rightBorder")[0].x(x.x2 - x.x1 - this._borderWidth);
        if (this.model.get("milestone")) {
            this.el.find(".diamond").show();
            this.el.find(".mainRect").hide();
            this.el.find(".completeRect").hide();
            this.el.find(".leftBorder").hide();
            this.el.find(".rightBorder").hide();
        } else {
            this.el.find(".diamond").hide();
            this.el.find(".mainRect").show();
            this.el.find(".completeRect").show();
            this.el.find(".leftBorder").show();
            this.el.find(".rightBorder").show();
        }
        BasicTaskView.prototype.render.call(this);
        return this;
    }
});

module.exports = AloneTaskView;

},{"./BasicTaskView":22}],22:[function(require,module,exports){
"use strict";

var ResourceEditor = require("../ResourcesEditor");

var linkImage = new Image();
linkImage.src = "css/images/link.png";

var userImage = new Image();
userImage.src = "css/images/user.png";

var BasicTaskView = Backbone.KonvaView.extend({
    _fullHeight: 21,
    _topPadding: 3,
    _barHeight: 15,
    _completeColor: "#77A4D2",
    _toolbarOffset: 20,
    _resourceListOffset: 20,
    _milestoneColor: "#336699",
    _milestoneOffset: 0,
    initialize: function initialize(params) {
        this.height = this._fullHeight;
        this.settings = params.settings;
        this._initModelEvents();
        this._initSettingsEvents();
    },
    events: function events() {
        return {
            dragmove: function dragmove(e) {
                if (e.target.nodeType !== "Group") {
                    return;
                }
                this._updateDates();
            },
            dragend: function dragend() {
                this.model.saveWithChildren();
                this.render();
            },
            mouseenter: function mouseenter(e) {
                this._showTools();
                this._hideResourcesList();
                this._grabPointer(e);
            },
            mouseleave: function mouseleave() {
                this._hideTools();
                this._showResourcesList();
                this._defaultMouse();
            },
            "dragstart .dependencyTool": "_startConnecting",
            "dragmove .dependencyTool": "_moveConnect",
            "dragend .dependencyTool": "_createDependency",
            "click .resources": "_editResources",
            "click .deleteDeps": "_deleteDeps"
        };
    },
    el: function el() {
        var group = new Konva.Group({
            dragBoundFunc: (function (pos) {
                return {
                    x: pos.x,
                    y: this._y
                };
            }).bind(this),
            id: this.model.cid,
            draggable: true
        });
        var fakeBackground = new Konva.Rect({
            y: this._topPadding,
            height: this._barHeight,
            name: "fakeBackground"
        });
        var rect = new Konva.Rect({
            fill: this._color,
            y: this._topPadding,
            height: this._barHeight,
            name: "mainRect"
        });
        var diamond = new Konva.Rect({
            fill: this._milestoneColor,
            y: this._topPadding + this._barHeight / 2,
            x: this._barHeight / 2,
            height: this._barHeight * 0.8,
            width: this._barHeight * 0.8,
            offsetX: this._barHeight * 0.8 / 2,
            offsetY: this._barHeight * 0.8 / 2,
            name: "diamond",
            rotation: 45,
            visible: false
        });
        var completeRect = new Konva.Rect({
            fill: this._completeColor,
            y: this._topPadding,
            height: this._barHeight,
            name: "completeRect"
        });
        var self = this;
        var horOffset = 6;
        var arc = new Konva.Shape({
            y: this._topPadding,
            fill: "lightgreen",
            sceneFunc: function sceneFunc(context) {
                var size = self._barHeight + (self._borderSize || 0);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(horOffset, 0);
                context.arc(horOffset, size / 2, size / 2, -Math.PI / 2, Math.PI / 2);
                context.lineTo(0, size);
                context.lineTo(0, 0);
                context.fillShape(this);
                var imgSize = size - 4;
                context.drawImage(linkImage, 1, (size - imgSize) / 2, imgSize, imgSize);
            },
            hitFunc: function hitFunc(context) {
                context.beginPath();
                context.rect(0, 0, 6 + self._barHeight, self._barHeight);
                context.fillShape(this);
            },
            name: "dependencyTool",
            visible: false,
            draggable: true
        });

        var toolbar = new Konva.Group({
            y: this._topPadding,
            name: "resources",
            visible: false
        });

        var deleteDeps = new Konva.Group({
            y: this._topPadding,
            x: -this._barHeight,
            name: "deleteDeps",
            visible: false
        });
        deleteDeps.add(new Konva.Rect({
            fill: "red",
            width: this._barHeight,
            height: this._barHeight
        }));
        deleteDeps.add(new Konva.Text({
            text: "X",
            fill: "white",
            x: 3,
            fontSize: this._barHeight
        }));

        var size = self._barHeight + (self._borderSize || 0);
        var toolback = new Konva.Rect({
            fill: "lightgrey",
            width: size,
            height: size,
            cornerRadius: 2
        });

        var userIm = new Konva.Image({
            image: userImage,
            width: size,
            height: size
        });
        toolbar.add(toolback, userIm);

        var resourceList = new Konva.Text({
            name: "resourceList",
            y: this._topPadding,
            listening: false
        });

        group.add(fakeBackground, diamond, rect, completeRect, arc, toolbar, resourceList, deleteDeps);
        return group;
    },
    _editResources: function _editResources() {
        var view = new ResourceEditor({
            model: this.model,
            settings: this.settings
        });
        var pos = this.el.getStage().getPointerPosition();
        view.render(pos);
    },
    _deleteDeps: function _deleteDeps() {
        this.model.clearDependence();
    },
    _updateDates: function _updateDates() {
        var attrs = this.settings.getSetting("attr"),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;

        var rect = this.el.find(".mainRect")[0];
        var length = rect.width();
        var x = this.el.x() + rect.x();
        var days1 = Math.round(x / daysWidth),
            days2 = Math.round((x + length) / daysWidth);

        this.model.set({
            start: boundaryMin.clone().addDays(days1),
            end: boundaryMin.clone().addDays(days2 - 1)
        });
    },
    _showTools: function _showTools() {
        this.el.find(".dependencyTool").show();
        this.el.find(".resources").show();
        if (this.model.hasDeps()) {
            this.el.find(".deleteDeps").show();
        }
        this.el.getLayer().batchDraw();
    },
    _hideTools: function _hideTools() {
        this.el.find(".dependencyTool").hide();
        this.el.find(".resources").hide();
        this.el.find(".deleteDeps").hide();
        this.el.getLayer().batchDraw();
    },
    _showResourcesList: function _showResourcesList() {
        this.el.find(".resourceList").show();
        this.el.getLayer().batchDraw();
    },
    _hideResourcesList: function _hideResourcesList() {
        this.el.find(".resourceList").hide();
        this.el.getLayer().batchDraw();
    },
    _grabPointer: function _grabPointer(e) {
        var name = e.target.name();
        if (name === "mainRect" || name === "dependencyTool" || name === "completeRect" || e.target.getParent().name() === "resources") {
            document.body.style.cursor = "pointer";
        }
    },
    _defaultMouse: function _defaultMouse() {
        document.body.style.cursor = "default";
    },
    _startConnecting: function _startConnecting() {
        var stage = this.el.getStage();
        var tool = this.el.find(".dependencyTool")[0];
        tool.hide();
        var pos = tool.getAbsolutePosition();
        var connector = new Konva.Arrow({
            stroke: "darkgreen",
            strokeWidth: 1,
            pointerWidth: 6,
            pointerHeight: 10,
            fill: "grey",
            points: [pos.x - stage.x(), pos.y + this._barHeight / 2, pos.x - stage.x(), pos.y],
            name: "connector"
        });
        this.el.getLayer().add(connector);
        this.el.getLayer().batchDraw();
    },
    _moveConnect: function _moveConnect() {
        var connector = this.el.getLayer().find(".connector")[0];
        var stage = this.el.getStage();
        var points = connector.points();
        points[2] = stage.getPointerPosition().x - stage.x();
        points[3] = stage.getPointerPosition().y;
        connector.points(points);
    },
    _createDependency: function _createDependency() {
        var connector = this.el.getLayer().find(".connector")[0];
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
            var removeFor = this.model.collection.find(function (task) {
                return task.get("depend") === beforeModel.id;
            });
            if (removeFor) {
                this.model.collection.removeDependency(removeFor);
            }
        }
    },
    _initSettingsEvents: function _initSettingsEvents() {
        this.listenTo(this.settings, "change:interval change:dpi", function () {
            this.render();
        });
    },
    _initModelEvents: function _initModelEvents() {
        // don't update element while dragging
        this.listenTo(this.model, "change:start change:end change:complete change:resources", function () {
            var dragging = this.el.isDragging();
            this.el.getChildren().each(function (child) {
                dragging = dragging || child.isDragging();
            });
            if (dragging) {
                return;
            }
            this.render();
        });

        this.listenTo(this.model, "change:hidden", function () {
            if (this.model.get("hidden")) {
                this.el.hide();
            } else {
                this.el.show();
            }
        });
    },
    _calculateX: function _calculateX() {
        var attrs = this.settings.getSetting("attr"),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;

        return {
            x1: (Date.daysdiff(boundaryMin, this.model.get("start")) - 1) * daysWidth,
            x2: Date.daysdiff(boundaryMin, this.model.get("end")) * daysWidth
        };
    },
    _calculateCompleteWidth: function _calculateCompleteWidth() {
        var x = this._calculateX();
        return (x.x2 - x.x1) * this.model.get("complete") / 100;
    },
    render: function render() {
        var x = this._calculateX();
        // move group
        this.el.x(x.x1);

        // update fake background rect params
        var back = this.el.find(".fakeBackground")[0];
        back.x(-20);
        back.width(x.x2 - x.x1 + 60);

        // update main rect params
        var rect = this.el.find(".mainRect")[0];
        rect.x(0);
        rect.width(x.x2 - x.x1);

        // update complete params
        this.el.find(".completeRect")[0].width(this._calculateCompleteWidth());
        this.el.find(".completeRect")[0].x(0);

        var _milestoneOffset = 0;
        if (this.model.get("milestone")) {
            _milestoneOffset = 10;
        }

        // move tool position
        var tool = this.el.find(".dependencyTool")[0];
        tool.x(x.x2 - x.x1 + _milestoneOffset);
        tool.y(this._topPadding);

        var resources = this.el.find(".resources")[0];
        resources.x(x.x2 - x.x1 + this._toolbarOffset + _milestoneOffset);
        resources.y(this._topPadding);

        // update resource list
        var resourceList = this.el.find(".resourceList")[0];
        resourceList.x(x.x2 - x.x1 + this._resourceListOffset + _milestoneOffset);
        resourceList.y(this._topPadding + 2);
        var names = [];
        var list = this.model.get("resources");
        list.forEach((function (resourceId) {
            var res = _.find(this.settings.statuses.resourcedata || [], function (r) {
                return r.UserId.toString() === resourceId.toString();
            });
            if (res) {
                if (list.length < 3) {
                    names.push(res.Username);
                } else {
                    var aliases = _.map(res.Username.split(" "), function (str) {
                        return str[0];
                    }).join("");
                    names.push(aliases);
                }
            }
        }).bind(this));
        resourceList.text(names.join(", "));
        this.el.getLayer().batchDraw();
        return this;
    },
    setY: function setY(y) {
        this._y = y;
        this.el.y(y);
    },
    getY: function getY() {
        return this._y;
    }
});

module.exports = BasicTaskView;

},{"../ResourcesEditor":14}],23:[function(require,module,exports){
"use strict";

var ConnectorView = Backbone.KonvaView.extend({
    _color: "grey",
    _wrongColor: "red",
    initialize: function initialize(params) {
        this.settings = params.settings;
        this.beforeModel = params.beforeModel;
        this.afterModel = params.afterModel;
        this._y1 = 0;
        this._y2 = 0;
        this._initSettingsEvents();
        this._initModelEvents();
    },
    el: function el() {
        var line = new Konva.Line({
            strokeWidth: 2,
            stroke: "black",
            points: [0, 0, 0, 0]
        });
        return line;
    },
    setY1: function setY1(y1) {
        this._y1 = y1;
        this.render();
    },
    setY2: function setY2(y2) {
        this._y2 = y2;
        this.render();
    },
    render: function render() {
        var x = this._calculateX();
        if (x.x2 >= x.x1) {
            this.el.stroke(this._color);
            this.el.points([x.x1, this._y1, x.x1 + 10, this._y1, x.x1 + 10, this._y2, x.x2, this._y2]);
        } else {
            this.el.stroke(this._wrongColor);
            this.el.points([x.x1, this._y1, x.x1 + 10, this._y1, x.x1 + 10, this._y1 + (this._y2 - this._y1) / 2, x.x2 - 10, this._y1 + (this._y2 - this._y1) / 2, x.x2 - 10, this._y2, x.x2, this._y2]);
        }
        this.el.getLayer().batchDraw();
        return this;
    },
    _initSettingsEvents: function _initSettingsEvents() {
        this.listenTo(this.settings, "change:interval change:dpi", function () {
            this.render();
        });
    },
    _initModelEvents: function _initModelEvents() {
        this.listenTo(this.beforeModel, "change", function () {
            this.render();
        });

        this.listenTo(this.beforeModel, "change:hidden", function () {
            if (this.beforeModel.get("hidden")) {
                this.el.hide();
            } else {
                this.el.show();
            }
        });
        this.listenTo(this.afterModel, "change", function () {
            this.render();
        });

        this.listenTo(this.afterModel, "change:hidden", function () {
            if (this.beforeModel.get("hidden")) {
                this.el.hide();
            } else {
                this.el.show();
            }
        });
    },
    _calculateX: function _calculateX() {
        var attrs = this.settings.getSetting("attr"),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;
        return {
            x1: Date.daysdiff(boundaryMin, this.beforeModel.get("end")) * daysWidth,
            x2: Date.daysdiff(boundaryMin, this.afterModel.get("start")) * daysWidth
        };
    }
});

module.exports = ConnectorView;

},{}],24:[function(require,module,exports){
"use strict";

var NestedTaskView = require("./NestedTaskView");
var AloneTaskView = require("./AloneTaskView");
var ConnectorView = require("./ConnectorView");

var GanttChartView = Backbone.View.extend({
    el: "#gantt-container",
    _topPadding: 73,
    initialize: function initialize(params) {
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
    setLeftPadding: function setLeftPadding(offset) {
        this._leftPadding = offset;
        this._updateStageAttrs();
    },
    _initStage: function _initStage() {
        this.stage = new Konva.Stage({
            container: this.el
        });
        this._updateStageAttrs();
    },
    _initLayers: function _initLayers() {
        this.Flayer = new Konva.Layer();
        this.Blayer = new Konva.Layer();
        this.TopBarLayer = new Konva.Layer();
        this.stage.add(this.Blayer, this.Flayer, this.TopBarLayer);
    },
    _updateStageAttrs: function _updateStageAttrs() {
        var sattr = this.settings.sattr;
        var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;
        var self = this;
        var previousTaskX = this._taskViews.length ? this._taskViews[0].el.x() : 0;
        this.stage.setAttrs({
            height: Math.max($(".tasks").innerHeight() + this._topPadding, window.innerHeight - $(this.stage.getContainer()).offset().top),
            width: this.$el.innerWidth(),
            draggable: true,
            dragBoundFunc: function dragBoundFunc(pos) {
                var x;
                var minX = -(lineWidth - this.width());
                if (pos.x > self._leftPadding) {
                    x = self._leftPadding;
                } else if (pos.x < minX) {
                    x = minX;
                } else {
                    x = pos.x;
                }
                self.draggedToDay = Math.abs(x - self._leftPadding) / self.settings.getSetting("attr").daysWidth;
                return {
                    x: x,
                    y: 0
                };
            }
        });

        setTimeout((function () {
            if (!this._taskViews.length || !previousTaskX) {
                this.stage.x(this._leftPadding);
            } else {
                var minx = -(lineWidth - this.stage.width());
                var x = this._leftPadding - (this.draggedToDay || 0) * self.settings.getSetting("attr").daysWidth;
                this.stage.x(Math.max(minx, x));
            }
            this._updateTodayLine();
            this.stage.draw();
        }).bind(this), 5);
    },
    _initBackground: function _initBackground() {
        var topBar = new Konva.Shape({
            sceneFunc: this._getTopBarSceneFunction(),
            stroke: "lightgray",
            strokeWidth: 0,
            fill: "rgba(0,0,0,0.1)",
            name: "topBar",
            hitGraphEnabled: false
        });
        var grid = new Konva.Shape({
            sceneFunc: this._getGridSceneFunction(),
            stroke: "lightgray",
            strokeWidth: 0,
            fill: "rgba(0,0,0,0.1)",
            name: "grid",
            hitGraphEnabled: false
        });
        var sattr = this.settings.sattr;
        var width = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;
        var back = new Konva.Rect({
            height: this.stage.height(),
            width: width
        });
        var currentDayLine = new Konva.Rect({
            height: this.stage.height(),
            width: 2,
            y: 0,
            x: 0,
            fill: "green",
            listening: false,
            name: "currentDayLine"
        });

        window.addEventListener("scroll", function () {
            var y = Math.max(0, document.body.scrollTop || window.scrollY);
            topBar.y(y);
            topBar.getLayer().batchDraw();
        });

        this.Blayer.add(back).add(currentDayLine).add(grid);
        this.TopBarLayer.add(topBar);
        this._updateTodayLine();
        this.stage.draw();
    },
    _getTopBarSceneFunction: function _getTopBarSceneFunction() {
        var sdisplay = this.settings.sdisplay;
        var sattr = this.settings.sattr;
        var borderWidth = sdisplay.borderWidth || 1;
        var offset = 1;
        var rowHeight = 20;
        var stage = this.stage;

        return function (context) {
            var i,
                s,
                iLen = 0,
                daysWidth = sattr.daysWidth,
                x,
                length,
                hData = sattr.hData;
            var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;

            // clear backgound
            // so all shapes under will be not visible
            context.fillStyle = "white";
            context.rect(0, 0, lineWidth + offset, 3 * rowHeight - offset);
            context.fill();

            //draw three horizontal lines
            context.strokeStyle = "lightgrey";
            context.beginPath();
            for (i = 1; i < 4; i++) {
                context.moveTo(offset, i * rowHeight - offset);
                context.lineTo(lineWidth + offset, i * rowHeight - offset);
            }
            context.stroke();

            // draw years/month
            // with lines
            var yi = 0,
                yf = rowHeight,
                xi = 0;
            for (s = 1; s < 3; s++) {
                x = 0;length = 0;
                for (i = 0, iLen = hData[s].length; i < iLen; i++) {
                    length = hData[s][i].duration * daysWidth;
                    x = x + length;
                    xi = x - borderWidth + offset;
                    context.moveTo(xi, yi);
                    context.lineTo(xi, yf);
                    context.stroke();
                    context.fillStyle = "black";
                    context._context.save();
                    context._context.font = "10pt Arial,Helvetica,sans-serif";
                    context._context.textAlign = "center";
                    context._context.textBaseline = "middle";
                    context._context.fillText(hData[s][i].text, x - length / 2, yf - rowHeight / 2);
                    context._context.restore();
                }
                yi = yf;yf = yf + rowHeight;
            }

            // draw days
            x = 0;length = 0;s = 3;
            var dragInt = parseInt(sattr.dragInterval, 10);
            var hideDate = false;
            if (dragInt === 14 || dragInt === 30) {
                hideDate = true;
            }
            for (i = 0, iLen = hData[s].length; i < iLen; i++) {
                length = hData[s][i].duration * daysWidth;
                x = x + length;
                xi = x - borderWidth + offset;
                if (hData[s][i].holy) {
                    context.beginPath();
                    context.fillStyle = "lightgray";
                    context.moveTo(xi, yi);
                    context.lineTo(xi, yi + rowHeight);
                    context.lineTo(xi - length, yi + rowHeight);
                    context.lineTo(xi - length, yi);
                    context.closePath();
                    context.fill();
                }
                context._context.save();
                context.fillStyle = "black";
                context._context.font = "6pt Arial,Helvetica,sans-serif";
                context._context.textAlign = "center";
                context._context.textBaseline = "middle";
                if (hideDate) {
                    context._context.font = "1pt Arial,Helvetica,sans-serif";
                }
                // console.log(hData[s][i].text);
                context._context.fillText(hData[s][i].text, x - length / 2, yi + rowHeight / 2);
                context._context.restore();
            }

            context.stroke();
        };
    },
    _getGridSceneFunction: function _getGridSceneFunction() {
        var sdisplay = this.settings.sdisplay;
        var sattr = this.settings.sattr;
        var borderWidth = sdisplay.borderWidth || 1;
        var offset = 1;

        return function (context) {
            var i,
                s,
                iLen = 0,
                daysWidth = sattr.daysWidth,
                x,
                length,
                hData = sattr.hData;

            context.beginPath();

            var yi = 0,
                xi = 0;

            x = 0;length = 0;s = 3;
            for (i = 0, iLen = hData[s].length; i < iLen; i++) {
                length = hData[s][i].duration * daysWidth;
                x = x + length;
                xi = x - borderWidth + offset;
                if (hData[s][i].holy) {
                    context.moveTo(xi, yi);
                    context.lineTo(xi, this.getStage().height());
                    context.lineTo(xi - length, this.getStage().height());
                    context.lineTo(xi - length, yi);
                } else {
                    context.moveTo(xi, yi);
                    context.lineTo(xi, this.getStage().height());
                }
            }
            context.fillStrokeShape(this);
        };
    },
    _cacheBackground: function _cacheBackground() {
        var sattr = this.settings.sattr;
        var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;
        this.stage.find(".grid,.topBar").clearCache();
        if (lineWidth < 5000) {
            this.stage.find(".grid,.topBar").cache({
                x: 0,
                y: 0,
                width: lineWidth,
                height: this.stage.height()
            });
        }
    },
    _updateTodayLine: function _updateTodayLine() {
        var attrs = this.settings.getSetting("attr"),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;

        var x = Date.daysdiff(boundaryMin, new Date()) * daysWidth;
        this.Blayer.findOne(".currentDayLine").x(x).height(this.stage.height());
        this.Blayer.batchDraw();
    },
    _initSettingsEvents: function _initSettingsEvents() {
        this.listenTo(this.settings, "change:interval change:dpi", function () {
            this._updateStageAttrs();
            this._updateTodayLine();
            this._cacheBackground();
        });

        this.listenTo(this.settings, "change:width", function () {
            this._updateStageAttrs();
            this._cacheBackground();
            this._updateTodayLine();
            this._taskViews.forEach(function (view) {
                view.render();
            });
            this._connectorViews.forEach(function (view) {
                view.render();
            });
        });
    },
    _initCollectionEvents: function _initCollectionEvents() {
        this.listenTo(this.collection, "add", function (task) {
            this._addTaskView(task);
            this._requestResort();
        });
        this.listenTo(this.collection, "remove", function (task) {
            this._removeViewForModel(task);
            this._requestResort();
        });
        this.listenTo(this.collection, "add remove", _.debounce(function () {
            // wait for left panel updates
            setTimeout((function () {
                this._updateStageAttrs();
            }).bind(this), 100);
        }, 10));

        this.listenTo(this.collection, "sort change:hidden", function () {
            this._requestResort();
        });

        this.listenTo(this.collection, "depend:add", function (before, after) {
            this._addConnectorView(before, after);
            this._requestResort();
        });

        this.listenTo(this.collection, "depend:remove", function (before, after) {
            this._removeConnectorView(before, after);
            this._requestResort();
        });

        this.listenTo(this.collection, "nestedStateChange", function (task) {
            this._removeViewForModel(task);
            this._addTaskView(task);
            this._requestResort();
        });
    },
    _removeViewForModel: function _removeViewForModel(model) {
        var taskView = _.find(this._taskViews, function (view) {
            return view.model === model;
        });
        this._removeView(taskView);
    },
    _removeView: function _removeView(taskView) {
        taskView.remove();
        this._taskViews = _.without(this._taskViews, taskView);
    },
    _removeConnectorView: function _removeConnectorView(before, after) {
        var connectorView = _.find(this._connectorViews, function (view) {
            return view.afterModel === after && view.beforeModel === before;
        });
        connectorView.remove();
        this._connectorViews = _.without(this._connectorViews, connectorView);
    },
    _initSubViews: function _initSubViews() {
        var _this = this;

        this.collection.each((function (task) {
            this._addTaskView(task);
        }).bind(this));

        this.collection.each(function (after) {
            after.depends.each(function (before) {
                _this._addConnectorView(before, after);
            });
        });

        this._resortViews();
        this.Flayer.draw();
    },
    _addTaskView: function _addTaskView(task) {
        var view;
        if (task.isNested()) {
            view = new NestedTaskView({
                model: task,
                settings: this.settings
            });
        } else {
            view = new AloneTaskView({
                model: task,
                settings: this.settings
            });
        }
        this.Flayer.add(view.el);
        view.render();
        this._taskViews.push(view);
    },
    _addConnectorView: function _addConnectorView(before, after) {
        var view = new ConnectorView({
            beforeModel: before,
            afterModel: after,
            settings: this.settings
        });
        this.Flayer.add(view.el);
        view.el.moveToBottom();
        view.render();
        this._connectorViews.push(view);
    },

    _requestResort: (function () {
        var waiting = false;
        return function () {
            if (waiting) {
                return;
            }
            setTimeout((function () {
                this._resortViews();
                waiting = false;
            }).bind(this), 5);
            waiting = true;
        };
    })(),
    _resortViews: function _resortViews() {
        var _this = this;

        var lastY = this._topPadding;
        this.collection.each((function (task) {
            if (task.get("hidden")) {
                return;
            }
            var view = _.find(this._taskViews, function (v) {
                return v.model === task;
            });
            if (!view) {
                return;
            }
            view.setY(lastY);
            lastY += view.height;
        }).bind(this));
        this.collection.each(function (after) {
            if (after.get("hidden")) {
                return;
            }
            after.depends.each(function (before) {
                var beforeView = _.find(_this._taskViews, function (view) {
                    return view.model === before;
                });
                var afterView = _.find(_this._taskViews, function (view) {
                    return view.model === after;
                });
                var connectorView = _.find(_this._connectorViews, function (view) {
                    return view.beforeModel === before && view.afterModel === after;
                });
                connectorView.setY1(beforeView.getY() + beforeView._fullHeight / 2);
                connectorView.setY2(afterView.getY() + afterView._fullHeight / 2);
            });
        });
        this.Flayer.batchDraw();
    }
});

module.exports = GanttChartView;

},{"./AloneTaskView":21,"./ConnectorView":23,"./NestedTaskView":25}],25:[function(require,module,exports){
/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require("./BasicTaskView");

var NestedTaskView = BasicTaskView.extend({
    _color: "#b3d1fc",
    _borderSize: 6,
    _barHeight: 10,
    _completeColor: "#336699",
    el: function el() {
        var group = BasicTaskView.prototype.el.call(this);
        var leftBorder = new Konva.Line({
            fill: this._color,
            y: this._topPadding + this._barHeight,
            points: [0, 0, this._borderSize * 1.5, 0, 0, this._borderSize],
            closed: true,
            name: "leftBorder"
        });
        group.add(leftBorder);
        var rightBorder = new Konva.Line({
            fill: this._color,
            y: this._topPadding + this._barHeight,
            points: [-this._borderSize * 1.5, 0, 0, 0, 0, this._borderSize],
            closed: true,
            name: "rightBorder"
        });
        group.add(rightBorder);
        return group;
    },
    _updateDates: function _updateDates() {
        // group is moved
        // so we need to detect interval
        var attrs = this.settings.getSetting("attr"),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;

        var rect = this.el.find(".mainRect")[0];
        var x = this.el.x() + rect.x();
        var days1 = Math.floor(x / daysWidth);
        var newStart = boundaryMin.clone().addDays(days1);
        this.model.moveToStart(newStart);
    },
    render: function render() {
        var x = this._calculateX();
        this.el.find(".leftBorder")[0].x(0);
        this.el.find(".rightBorder")[0].x(x.x2 - x.x1);
        var completeWidth = (x.x2 - x.x1) * this.model.get("complete") / 100;
        if (completeWidth > this._borderSize / 2) {
            this.el.find(".leftBorder")[0].fill(this._completeColor);
        } else {
            this.el.find(".leftBorder")[0].fill(this._color);
        }
        if (x.x2 - x.x1 - completeWidth < this._borderSize / 2) {
            this.el.find(".rightBorder")[0].fill(this._completeColor);
        } else {
            this.el.find(".rightBorder")[0].fill(this._color);
        }

        BasicTaskView.prototype.render.call(this);
        return this;
    }
});

module.exports = NestedTaskView;

},{"./BasicTaskView":22}],26:[function(require,module,exports){
"use strict";

var ModalEdit = require("../ModalTaskEditView");
var Comments = require("../CommentsView");

function ContextMenuView(params) {
    this.collection = params.collection;
    this.settings = params.settings;
}

ContextMenuView.prototype.render = function () {
    var self = this;
    $(".task-container").contextMenu({
        selector: "ul",
        callback: function callback(key) {
            var id = $(this).attr("id") || $(this).data("id");
            var model = self.collection.get(id);
            if (key === "delete") {
                model.destroy();
            }
            if (key === "properties") {
                var view = new ModalEdit({
                    model: model,
                    settings: self.settings
                });
                view.render();
            }
            if (key === "comments") {
                new Comments({
                    model: model,
                    settings: self.settings
                }).render();
            }
            if (key === "rowAbove") {
                var data = {
                    reference_id: id
                };
                self.addTask(data, "above");
            }
            if (key === "rowBelow") {
                self.addTask({
                    reference_id: id
                }, "below");
            }
            if (key === "indent") {
                self.collection.indent(model);
            }
            if (key === "outdent") {
                self.collection.outdent(model);
            }
        },
        items: {
            rowAbove: { name: "&nbsp;New Row Above", icon: "above" },
            rowBelow: { name: "&nbsp;New Row Below", icon: "below" },
            indent: { name: "&nbsp;Indent Row", icon: "indent" },
            outdent: { name: "&nbsp;Outdent Row", icon: "outdent" },
            sep1: "---------",
            properties: { name: "&nbsp;Properties", icon: "properties" },
            comments: { name: "&nbsp;Comments", icon: "comment" },
            sep2: "---------",
            "delete": { name: "&nbsp;Delete Row", icon: "delete" }
        }
    });
};

ContextMenuView.prototype.addTask = function (data, insertPos) {
    var sortindex = 0;
    var ref_model = this.collection.get(data.reference_id);
    if (ref_model) {
        sortindex = ref_model.get("sortindex") + (insertPos === "above" ? -0.5 : 0.5);
    } else {
        sortindex = this.collection.last().get("sortindex") + 1;
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get("parentid");
    var task = this.collection.add(data, { parse: true });
    this.collection.checkSortedIndex();
    task.save();
};

module.exports = ContextMenuView;

},{"../CommentsView":10,"../ModalTaskEditView":12}],27:[function(require,module,exports){
"use strict";

var DatePicker = React.createClass({
    displayName: "DatePicker",
    componentDidMount: function componentDidMount() {
        $(this.getDOMNode()).datepicker({
            dateFormat: this.props.dateFormat,
            onSelect: (function () {
                console.log("select");
                var date = this.getDOMNode().value.split("/");
                var value = new Date(date[2] + "-" + date[1] + "-" + date[0]);
                this.props.onChange({
                    target: {
                        value: value
                    }
                });
            }).bind(this)
        });
        $(this.getDOMNode()).datepicker("show");
    },
    componentWillUnmount: function componentWillUnmount() {
        $(this.getDOMNode()).datepicker("destroy");
    },
    shouldComponentUpdate: function shouldComponentUpdate() {
        var dateStr = $.datepicker.formatDate(this.props.dateFormat, this.props.value);
        this.getDOMNode().value = dateStr;
        $(this.getDOMNode()).datepicker("refresh");
        return false;
    },
    render: function render() {
        return React.createElement("input", {
            defaultValue: $.datepicker.formatDate(this.props.dateFormat, this.props.value)
        });
    }
});

module.exports = DatePicker;

},{}],28:[function(require,module,exports){
"use strict";

var TaskItem = require("./TaskItem");

var NestedTask = React.createClass({
    displayName: "NestedTask",
    componentDidMount: function componentDidMount() {
        this.props.model.on("change:hidden change:collapsed", function () {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount: function componentWillUnmount() {
        this.props.model.off(null, null, this);
    },
    render: function render() {
        var _this = this;

        var subtasks = this.props.model.children.map(function (task) {
            if (task.get("hidden")) {
                return;
            }
            if (task.children.length) {
                return React.createElement(NestedTask, {
                    model: task,
                    isSubTask: true,
                    key: task.cid,
                    dateFormat: _this.props.dateFormat,
                    onSelectRow: _this.props.onSelectRow,
                    onEditRow: _this.props.onEditRow,
                    editedRow: _this.props.editedRow,
                    selectedRow: _this.props.selectedRow,
                    selectedModelCid: _this.props.selectedModelCid,
                    getAllStatuses: _this.props.getAllStatuses,
                    getStatusId: _this.props.getStatusId
                });
            }
            return React.createElement("li", {
                id: task.cid,
                key: task.cid,
                className: "drag-item",
                "data-id": task.cid
            }, React.createElement(TaskItem, {
                model: task,
                isSubTask: true,
                dateFormat: _this.props.dateFormat,
                onSelectRow: _this.props.onSelectRow,
                onEditRow: _this.props.onEditRow,
                editedRow: _this.props.selectedModelCid === task.cid && _this.props.editedRow,
                selectedRow: _this.props.selectedModelCid === task.cid && _this.props.selectedRow,
                getAllStatuses: _this.props.getAllStatuses,
                getStatusId: _this.props.getStatusId
            }));
        });
        return React.createElement("li", {
            className: "task-list-container drag-item" + (this.props.isSubTask ? " sub-task" : ""),
            id: this.props.model.cid,
            "data-id": this.props.model.cid
        }, React.createElement("div", {
            id: this.props.model.cid,
            "data-id": this.props.model.cid
        }, React.createElement(TaskItem, {
            model: this.props.model,
            dateFormat: this.props.dateFormat,
            onSelectRow: this.props.onSelectRow,
            onEditRow: this.props.onEditRow,
            editedRow: this.props.selectedModelCid === this.props.model.cid && this.props.editedRow,
            selectedRow: this.props.selectedModelCid === this.props.model.cid && this.props.selectedRow,
            getAllStatuses: this.props.getAllStatuses,
            getStatusId: this.props.getStatusId
        })), React.createElement("ol", {
            className: "sub-task-list sortable"
        }, subtasks));
    }
});

module.exports = NestedTask;

},{"./TaskItem":30}],29:[function(require,module,exports){
"use strict";

var TaskItem = require("./TaskItem");
var NestedTask = require("./NestedTask");

function buildTasksOrderFromDOM(container) {
    var data = [];
    var children = $("<ol>" + container.get(0).innerHTML + "</ol>").children();
    _.each(children, function (child) {
        var $child = $(child);
        var obj = {
            id: $child.data("id"),
            children: []
        };
        var sublist = $child.find("ol");
        if (sublist.length) {
            obj.children = buildTasksOrderFromDOM(sublist);
        }
        data.push(obj);
    });
    return data;
}

var SidePanel = React.createClass({
    displayName: "SidePanel",
    getInitialState: function getInitialState() {
        return {
            selectedRow: null,
            lastSelectedRow: null,
            selectedModel: null,
            editedRow: null
        };
    },
    componentDidMount: function componentDidMount() {
        this.props.collection.on("add remove", function () {
            this.requestUpdate();
        }, this);
        this.props.collection.on("change:hidden", function () {
            this.requestUpdate();
        }, this);
        this._makeSortable();
        this._setupHighlighter();
    },
    _makeSortable: function _makeSortable() {
        var _this = this;

        var container = $(".task-container");
        container.sortable({
            group: "sortable",
            containerSelector: "ol",
            itemSelector: ".drag-item",
            placeholder: "<li class=\"placeholder sort-placeholder\"/>",
            handle: ".col-sortindex",
            onDragStart: function ($item, position, _super, event) {
                _super($item, position, _super, event);
                _this.hightlighter.remove();
            },
            onDrag: function ($item, position, _super, event) {
                var $placeholder = $(".sort-placeholder");
                var isSubTask = !$($placeholder.parent()).hasClass("task-container");
                $placeholder.css({
                    "padding-left": isSubTask ? "30px" : "0"
                });
                _super($item, position, _super, event);
            },
            onDrop: function ($item, position, _super, event) {
                _super($item, position, _super, event);
                setTimeout(function () {
                    var data = buildTasksOrderFromDOM(container);
                    _this.props.collection.resort(data);
                }, 10);
            }
        });
    },
    _setupHighlighter: function _setupHighlighter() {
        this.hightlighter = $("<div>");
        this.hightlighter.css({
            position: "absolute",
            background: "grey",
            opacity: "0.5",
            top: "0",
            width: "100%"
        });

        var container = $(".task-container");
        container.mouseenter((function () {
            this.hightlighter.appendTo(document.body);
        }).bind(this));

        container.mouseover((function (e) {
            var $el = $(e.target);
            // TODO: rewrite to find closest ul
            if (!$el.data("id")) {
                $el = $el.parent();
                if (!$el.data("id")) {
                    $el = $el.parent();
                }
            }
            var pos = $el.offset();
            this.hightlighter.css({
                top: pos.top + "px",
                height: $el.height()
            });
        }).bind(this));

        container.mouseleave((function () {
            this.hightlighter.remove();
        }).bind(this));
    },
    requestUpdate: (function () {
        var waiting = false;
        return function () {
            if (waiting) {
                return;
            }
            setTimeout((function () {
                this.forceUpdate();
                waiting = false;
            }).bind(this), 5);
            waiting = true;
        };
    })(),
    componentWillUnmount: function componentWillUnmount() {
        $(".task-container").sortable("destroy");
        this.props.collection.off(null, null, this);
        this.hightlighter.remove();
    },
    onSelectRow: function onSelectRow(selectedModelCid, selectedRow) {
        if (this.selecteableRows.indexOf(selectedRow) === -1) {
            return;
        }
        this.setState({
            selectedRow: selectedRow,
            selectedModelCid: selectedModelCid
        });
    },
    onEditRow: function onEditRow(selectedModelCid, editedRow) {
        if (!editedRow) {
            var x = window.scrollX,
                y = window.scrollY;
            this.refs.container.getDOMNode().focus();
            window.scrollTo(x, y);
            this.setState({
                selectedRow: this.state.lastSelectedRow
            });
        }
        this.setState({
            selectedModelCid: selectedModelCid,
            editedRow: editedRow
        });
    },
    selecteableRows: ["name", "complete", "status", "start", "end", "duration"],
    onKeyDown: function onKeyDown(e) {
        if (e.target.tagName === "INPUT") {
            return;
        }
        e.preventDefault();
        var rows = this.selecteableRows;
        var i = rows.indexOf(this.state.selectedRow);
        var tasks = this.props.collection;
        var modelIndex = tasks.get(this.state.selectedModelCid).get("sortindex");
        if (e.keyCode === 40) {
            // down
            modelIndex = (modelIndex + 1 + tasks.length) % tasks.length;
        } else if (e.keyCode === 39) {
            // right
            i = (i + 1 + rows.length) % rows.length;
        } else if (e.keyCode === 38) {
            // up
            modelIndex = (modelIndex - 1 + tasks.length) % tasks.length;
        } else if (e.keyCode === 37) {
            // left
            i = (i - 1 + rows.length) % rows.length;
        } else if (e.keyCode === 13) {
            // enter
            this.setState({
                editedRow: rows[i]
            });
        }

        // auto open side panel
        if (i >= 2) {
            $(".menu-container").addClass("panel-expanded").removeClass("panel-collapsed");
        }
        this.setState({
            selectedRow: rows[i],
            selectedModelCid: tasks.at(modelIndex).cid
        });
    },
    onClick: function onClick() {
        var x = window.scrollX,
            y = window.scrollY;
        this.refs.container.getDOMNode().focus();
        window.scrollTo(x, y);
    },
    onBlur: function onBlur() {
        this.setState({
            lastSelectedRow: this.state.selectedRow,
            selectedRow: null
        });
    },
    getAllStatuses: function getAllStatuses() {
        // return [
        //     'Backlog',
        //     'Ready',
        //     'In Progress',
        //     'Complete'
        // ];
        return this.props.settings.getAllStatuses();
    },
    getStatusId: function getStatusId(statusText) {
        return this.props.settings.findStatusId(statusText);
    },
    render: function render() {
        var _this = this;

        var tasks = [];
        this.props.collection.each(function (task) {
            if (task.parent) {
                return;
            }
            if (task.get("hidden")) {
                return;
            }
            if (task.children.length) {
                tasks.push(React.createElement(NestedTask, {
                    model: task,
                    key: task.cid,
                    dateFormat: _this.props.dateFormat,
                    onSelectRow: _this.onSelectRow,
                    onEditRow: _this.onEditRow,
                    editedRow: _this.state.editedRow,
                    selectedRow: _this.state.selectedRow,
                    selectedModelCid: _this.state.selectedModelCid,
                    getAllStatuses: _this.getAllStatuses,
                    getStatusId: _this.getStatusId
                }));
            } else {
                tasks.push(React.createElement("li", {
                    key: task.cid,
                    className: "drag-item",
                    "data-id": task.cid
                }, React.createElement(TaskItem, {
                    model: task,
                    dateFormat: _this.props.dateFormat,
                    onSelectRow: _this.onSelectRow,
                    onEditRow: _this.onEditRow,
                    editedRow: _this.state.selectedModelCid === task.cid && _this.state.editedRow,
                    selectedRow: _this.state.selectedModelCid === task.cid && _this.state.selectedRow,
                    getAllStatuses: _this.getAllStatuses,
                    getStatusId: _this.getStatusId
                })));
            }
        });
        return React.createElement(
            "ol",
            {
                className: "task-container sortable",
                tabIndex: "1",
                ref: "container",
                onKeyDown: this.onKeyDown,
                onClick: this.onClick,
                onBlur: this.onBlur
            },
            tasks
        );
    }
});

module.exports = SidePanel;

},{"./NestedTask":28,"./TaskItem":30}],30:[function(require,module,exports){
"use strict";

var DatePicker = require("./DatePicker");
var CommetsView = require("../CommentsView");

var TaskItem = React.createClass({
    displayName: "TaskItem",
    getInitialState: function getInitialState() {
        return {
            val: null
        };
    },
    shouldComponentUpdate: function shouldComponentUpdate(props) {
        if (_.isEqual(props, this.props)) {
            return false;
        }
        return true;
    },
    componentDidUpdate: function componentDidUpdate() {
        var $input = $(this.getDOMNode()).find("input");
        if ($input.length > 0 && !$input.is(":focus")) {
            $input.focus();
            // move cursor to the end of input. Tip from:
            // http://stackoverflow.com/questions/511088/use-javascript-to-place-cursor-at-end-of-text-in-text-input-element
            var val = $input.val(); //store the value of the element
            $input.val(""); //clear the value of the element
            $input.val(val); //set that value back.
        }
        $input = $(this.getDOMNode()).find("select").focus();
    },
    componentDidMount: function componentDidMount() {
        var events = ["change:name", "change:complete", "change:start", "change:end", "change:duration", "change:hightlight", "change:milestone", "change:deliverable", "change:reportable", "change:status", "change:timesheets", "change:acttimesheets", "change:Comments"];
        this.props.model.on(events.join(" "), function () {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount: function componentWillUnmount() {
        this.props.model.off(null, null, this);
    },
    _findNestedLevel: function _findNestedLevel() {
        return this.props.model.getOutlineLevel() - 1;
    },
    _createStatusIconField: function _createStatusIconField(col) {
        var _this = this;

        var handleClick = function () {
            if (col === "milestone" && _this.props.model.isNested()) {
                return;
            }
            _this.props.model.save(col, !_this.props.model.get(col));
        };
        if (this.props.model.get(col)) {
            return React.createElement("img", { src: "img/icon-" + col + ".png", onClick: handleClick });
        }
        return React.createElement("div", { onClick: handleClick, style: { width: "20px", height: "20px" } });
    },
    _createField: function _createField(col) {
        var isColInEdit = this.props.editedRow === col;
        if (isColInEdit) {
            return this._createEditField(col);
        }
        return React.createElement("span", {}, this._createReadFiled(col));
    },
    _createReadFiled: function _createReadFiled(col) {
        var _this = this;

        var model = this.props.model;
        if (col === "complete") {
            return model.get(col) + "%";
        }
        if (col === "start" || col === "end") {
            return $.datepicker.formatDate(this.props.dateFormat, model.get(col));
        }
        if (col === "duration") {
            return Date.daysdiff(model.get("start"), model.get("end")) + " d";
        }
        if (col === "status") {
            var text = _.find(this.props.getAllStatuses(), function (t) {
                return _this.props.getStatusId(t).toString() === _this.props.model.get("status").toString();
            });
            return text || "Unrecognized";
        }
        return model.get(col);
    },
    _createDateElement: function _createDateElement(col) {
        var val = this.props.model.get(col);
        return React.createElement(DatePicker, {
            value: val,
            dateFormat: this.props.dateFormat,
            key: col,
            onChange: (function (e) {
                var newVal = e.target.value;
                this.props.model.set(col, newVal);
                this.props.model.save();
                this.props.onEditRow(this.props.model.cid, null);
            }).bind(this)
        });
    },
    _durationChange: function _durationChange(value) {
        var number = parseInt(value.replace(/^\D+/g, ""), 10);
        if (!number) {
            return;
        }
        if (value.indexOf("w") > -1) {
            this.props.model.set("end", this.props.model.get("start").clone().addWeeks(number));
        } else if (value.indexOf("m") > -1) {
            this.props.model.set("end", this.props.model.get("start").clone().addMonths(number));
        } else {
            number--;
            this.props.model.set("end", this.props.model.get("start").clone().addDays(number));
        }
    },
    _createDurationField: function _createDurationField() {
        var val = Date.daysdiff(this.props.model.get("start"), this.props.model.get("end")) + " d";
        return React.createElement("input", {
            value: this.state.val || val,
            key: "duration",
            onChange: (function (e) {
                var value = e.target.value;
                this._durationChange(value);
                this.setState({ value: value });
            }).bind(this),
            onKeyDown: (function (e) {
                if (e.keyCode === 13 || e.keyCode === 27) {
                    this.props.onEditRow(this.props.model.cid, null);
                    this.setState({
                        val: undefined
                    });
                    this.props.model.save();
                }
            }).bind(this)
        });
    },
    _createStatusField: function _createStatusField() {
        var _this = this;

        var options = this.props.getAllStatuses().map(function (statusText) {
            var statusId = _this.props.getStatusId(statusText);
            return React.createElement(
                "option",
                { key: statusText, value: statusId },
                statusText
            );
        });
        return React.createElement(
            "select",
            {
                value: this.props.model.get("status"),
                onClick: function (e) {},
                onChange: function (e) {
                    _this.props.model.save("status", e.target.value);
                    _this.props.onEditRow(_this.props.model.cid, null);
                },
                style: {
                    width: "100%",
                    fontSize: "11px"
                }
            },
            options
        );
    },
    _requestSave: function _requestSave() {
        var _this = this;

        if (this.waiting) {
            return;
        }
        this.waiting = true;
        setTimeout(function () {
            _this.waiting = false;
            _this.props.model.save();
        }, 500);
    },
    _createEditField: function _createEditField(col) {
        var val = this.props.model.get(col);
        if (col === "start" || col === "end") {
            return this._createDateElement(col);
        }
        if (col === "duration") {
            return this._createDurationField();
        }
        if (col === "status") {
            return this._createStatusField();
        }
        return React.createElement("input", {
            className: "nameInput",
            value: val,
            key: col,
            onChange: (function (e) {
                var newVal = e.target.value;
                this.props.model.set(col, newVal);
            }).bind(this),
            onKeyDown: (function (e) {
                if (e.keyCode === 13 || e.keyCode === 27) {
                    this.props.onEditRow(this.props.model.cid, null);
                    this._requestSave();
                }
            }).bind(this),
            onBlur: (function () {
                this.props.onEditRow(this.props.model.cid, null);
                this._requestSave();
            }).bind(this)
        });
    },
    createCommentField: function createCommentField() {
        var comments = this.props.model.get("Comments") || 0;
        if (!comments) {
            return null;
        }
        return React.createElement("li", {
            key: "comments",
            className: "col-comments",
            onClick: (function () {
                new CommetsView({
                    model: this.props.model
                }).render();
            }).bind(this)
        }, React.createElement("img", {
            src: "css/images/comments.png"
        }), comments);
    },
    showContext: function showContext(e) {
        var $el = $(e.target);
        var ul = $el.parent();
        var offset = $el.offset();
        ul.contextMenu({
            x: offset.left + 20,
            y: offset.top
        });
    },
    findCol: function findCol(e) {
        var col = $(e.target).closest(".task-col").data("col");
        return col;
    },
    render: function render() {
        var _this = this;

        var model = this.props.model;
        var selectedRow = this.props.selectedRow;
        var shadowBorder = "0 0 0 2px #3879d9 inset";

        var collapseButton = undefined;
        if (model.isNested()) {
            var className = "triangle icon " + (this.props.model.get("collapsed") ? "right" : "down");
            collapseButton = React.createElement("i", {
                className: className,
                onClick: function () {
                    _this.props.model.set("collapsed", !_this.props.model.get("collapsed"));
                } });
        }
        var ulClass = "task" + (this.props.isSubTask ? " sub-task" : "") + (this.props.model.get("collapsed") ? " collapsed" : "") + (this.props.model.isNested() ? " nested" : "");
        return React.createElement(
            "ul",
            {
                className: ulClass,
                "data-id": this.props.model.cid,
                onDoubleClick: function (e) {
                    _this.props.onEditRow(model.cid, _this.findCol(e));
                },
                onClick: function (e) {
                    _this.props.onSelectRow(model.cid, _this.findCol(e));
                },
                style: {
                    backgroundColor: this.props.model.get("hightlight")
                }
            },
            React.createElement(
                "li",
                { key: "info", className: "task-col col-info" },
                React.createElement("img", { src: "img/info.png", onClick: this.showContext })
            ),
            React.createElement(
                "li",
                { key: "sortindex", className: "col-sortindex" },
                model.get("sortindex") + 1
            ),
            React.createElement(
                "li",
                { key: "name", className: "task-col col-name", "data-col": "name",
                    style: {
                        paddingLeft: this._findNestedLevel() * 10 + "px",
                        boxShadow: selectedRow === "name" ? shadowBorder : null
                    }
                },
                collapseButton,
                React.createElement(
                    "div",
                    null,
                    this._createField("name")
                )
            ),
            this.createCommentField(),
            React.createElement(
                "li",
                { key: "complete", className: "task-col col-complete", "data-col": "complete",
                    style: { boxShadow: selectedRow === "complete" ? shadowBorder : null }
                },
                this._createField("complete")
            ),
            React.createElement(
                "li",
                { key: "status", className: "task-col col-status", "data-col": "status",
                    style: { boxShadow: selectedRow === "status" ? shadowBorder : null }
                },
                this._createField("status")
            ),
            React.createElement(
                "li",
                { key: "start", className: "task-col col-start", "data-col": "start",
                    style: { boxShadow: selectedRow === "start" ? shadowBorder : null }
                },
                this._createField("start")
            ),
            React.createElement(
                "li",
                { key: "end", className: "task-col col-end", "data-col": "end",
                    style: { boxShadow: selectedRow === "end" ? shadowBorder : null }
                },
                this._createField("end")
            ),
            React.createElement(
                "li",
                { key: "duration", className: "task-col col-duration", "data-col": "duration",
                    style: { boxShadow: selectedRow === "duration" ? shadowBorder : null }
                },
                this._createField("duration")
            ),
            React.createElement(
                "li",
                { key: "milestone", className: "task-col col-milestone", "data-col": "milestone",
                    style: { boxShadow: selectedRow === "milestone" ? shadowBorder : null }
                },
                this._createStatusIconField("milestone")
            ),
            React.createElement(
                "li",
                { key: "deliverable", className: "task-col col-deliverable", "data-col": "deliverable",
                    style: { boxShadow: selectedRow === "deliverable" ? shadowBorder : null }
                },
                this._createStatusIconField("deliverable")
            ),
            React.createElement(
                "li",
                { key: "reportable", className: "task-col col-reportable", "data-col": "reportable",
                    style: { boxShadow: selectedRow === "reportable" ? shadowBorder : null }
                },
                this._createStatusIconField("reportable")
            ),
            React.createElement(
                "li",
                { key: "timesheets", className: "task-col col-timesheets", "data-col": "timesheets",
                    style: { boxShadow: selectedRow === "timesheets" ? shadowBorder : null }
                },
                this._createStatusIconField("timesheets")
            ),
            React.createElement(
                "li",
                { key: "acttimesheets", className: "task-col col-acttimesheets", "data-col": "acttimesheets",
                    style: { boxShadow: selectedRow === "acttimesheets" ? shadowBorder : null }
                },
                this._createStatusIconField("acttimesheets")
            )
        );
    }
});

module.exports = TaskItem;

// e.stopPropagation();

},{"../CommentsView":10,"./DatePicker":27}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2xhdnJ0b24vUHJvamVjdHMvSnF1ZXJ5LUdhbnR0L3NyYy9qcy9jbGllbnRDb25maWcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL1Jlc291cmNlUmVmZXJlbmNlQ29sbGVjdGlvbi5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvVGFza0NvbGxlY3Rpb24uanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL2Zha2VfNGUzMDBhYzUuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL21vZGVscy9SZXNvdXJjZVJlZmVyZW5jZS5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvbW9kZWxzL1NldHRpbmdNb2RlbC5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvbW9kZWxzL1Rhc2tNb2RlbC5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvdXRpbHMvdXRpbC5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvdXRpbHMveG1sV29ya2VyLmpzIiwiL1VzZXJzL2xhdnJ0b24vUHJvamVjdHMvSnF1ZXJ5LUdhbnR0L3NyYy9qcy92aWV3cy9Db21tZW50c1ZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL0dhbnR0Vmlldy5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvdmlld3MvTW9kYWxUYXNrRWRpdFZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL05vdGlmaWNhdGlvbnMuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL1Jlc291cmNlc0VkaXRvci5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvRmlsdGVyTWVudVZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L0dyb3VwaW5nTWVudVZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L01TUHJvamVjdE1lbnVWaWV3LmpzIiwiL1VzZXJzL2xhdnJ0b24vUHJvamVjdHMvSnF1ZXJ5LUdhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9NaXNjTWVudVZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3LmpzIiwiL1VzZXJzL2xhdnJ0b24vUHJvamVjdHMvSnF1ZXJ5LUdhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9ab29tTWVudVZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0Fsb25lVGFza1ZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0Jhc2ljVGFza1ZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0Nvbm5lY3RvclZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3LmpzIiwiL1VzZXJzL2xhdnJ0b24vUHJvamVjdHMvSnF1ZXJ5LUdhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9OZXN0ZWRUYXNrVmlldy5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9Db250ZXh0TWVudVZpZXcuanMiLCIvVXNlcnMvbGF2cnRvbi9Qcm9qZWN0cy9KcXVlcnktR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvRGF0ZVBpY2tlci5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9OZXN0ZWRUYXNrLmpzIiwiL1VzZXJzL2xhdnJ0b24vUHJvamVjdHMvSnF1ZXJ5LUdhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1NpZGVQYW5lbC5qcyIsIi9Vc2Vycy9sYXZydG9uL1Byb2plY3RzL0pxdWVyeS1HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQUEsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFakMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO0FBQ3BELGVBQVcsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztDQUNwRjtBQUNNLElBQUksUUFBUSxHQUFH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Q0FBQztBQUNsQyxNQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlDLE9BQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ3JDLFFBQUssQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDeEMsUUFBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM1RCxRQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0QsTUFBRyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM3QyxRQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUMsVUFBTyxHQUFHLFVBQVMsSUFBSSxFQUFDO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0dBQ0YsTUFBTSxJQUFJLFFBQVEsS0FBRyxNQUFNLEVBQUU7QUFDN0IsTUFBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsUUFBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksRUFBRSxDQUFDO0FBQzNDLFFBQUssQ0FBQyxTQUFTLEdB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LFFBQVEsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbCcpO1xyXG5sZXQgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbmxldCB0YXNrc1N1YlVSTCA9ICcnO1xyXG4vLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xNyZzaXRla2V5PTJiMDBkYTQ2YjU3YzAzOTVcclxuaWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlICYmIHBhcmFtcy5zaXRla2V5KSB7XHJcbiAgICB0YXNrc1N1YlVSTCA9ICcvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGUgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcclxufVxyXG5leHBvcnQgbGV0IHRhc2tzVVJMID0gJ2FwaS90YXNrcy8nICsgdGFza3NTdWJVUkw7XHJcblxyXG5cclxuXHJcbmxldCBjb25maWdTdWJVUkwgPSAnJztcclxuaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcclxuICAgIGNvbmZpZ1N1YlVSTCA9ICcvd2JzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5zaXRla2V5O1xyXG59XHJcblxyXG5leHBvcnQgbGV0IGNvbmZpZ1VSTCA9ICcvYXBpL0dhbnR0Q29uZmlnJyArIGNvbmZpZ1N1YlVSTDtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVzb3VyY2VSZWZlcmVuY2VNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9SZXNvdXJjZVJlZmVyZW5jZScpO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xuXG52YXIgQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICB1cmwgOiAnYXBpL3Jlc291cmNlcy8nICsgKHBhcmFtcy5wcm9qZWN0IHx8IDEpICsgJy8nICsgKHBhcmFtcy5wcm9maWxlIHx8IDEpLFxuXHRtb2RlbDogUmVzb3VyY2VSZWZlcmVuY2VNb2RlbCxcbiAgICBpZEF0dHJpYnV0ZSA6ICdJRCcsXG4gICAgdXBkYXRlUmVzb3VyY2VzRm9yVGFzayA6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9sZCByZWZlcmVuY2VzXG4gICAgICAgIHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgICAgICBpZiAocmVmLmdldCgnV0JTSUQnKS50b1N0cmluZygpICE9PSB0YXNrLmlkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXNPbGQgPSB0YXNrLmdldCgncmVzb3VyY2VzJykuaW5kZXhPZihyZWYuZ2V0KCdSZXNJRCcpKTtcbiAgICAgICAgICAgIGlmIChpc09sZCkge1xuICAgICAgICAgICAgICAgIHJlZi5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAvLyBhZGQgbmV3IHJlZmVyZW5jZXNcbiAgICAgICAgdGFzay5nZXQoJ3Jlc291cmNlcycpLmZvckVhY2goZnVuY3Rpb24ocmVzSWQpIHtcbiAgICAgICAgICAgIHZhciBpc0V4aXN0ID0gdGhpcy5maW5kV2hlcmUoe1Jlc0lEIDogcmVzSWR9KTtcbiAgICAgICAgICAgIGlmICghaXNFeGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgUmVzSUQgOiByZXNJZCxcbiAgICAgICAgICAgICAgICAgICAgV0JTSUQgOiB0YXNrLmlkLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBwYXJzZSA6IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgcmVzdWx0ICA9IFtdO1xuICAgICAgICByZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLlJlc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHJlc0l0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gcmVzSXRlbTtcbiAgICAgICAgICAgICAgICBvYmouV0JTSUQgPSBpdGVtLldCU0lEO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG9iaik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbjtcblxuIiwidmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmw6ICdhcGkvdGFza3MnLFxuXHRtb2RlbDogVGFza01vZGVsLFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc3Vic2NyaWJlKCk7XG5cdH0sXG5cdHNldERlZmF1bHRTdGF0dXNJZChpZCl7XG5cdFx0dGhpcy5kZWZhdWx0U3RhdHVzSWQgPSBpZDtcblx0fSxcblx0c2V0Q2xvc2VkU3RhdHVzSWQoaWQpIHtcblx0XHR0aGlzLmNsb3NlZFN0YXR1c0lkID0gaWQ7XG5cdH0sXG5cdGNvbXBhcmF0b3I6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdH0sXG5cdGxpbmtDaGlsZHJlbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHBhcmVudFRhc2sgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50VGFzaykge1xuXHRcdFx0XHRpZiAocGFyZW50VGFzayA9PT0gdGFzaykge1xuXHRcdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0XHR0YXNrLnVuc2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdF9zb3J0Q2hpbGRyZW46IGZ1bmN0aW9uICh0YXNrLCBzb3J0SW5kZXgpIHtcblx0XHR0YXNrLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRjaGlsZC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbihjaGlsZCwgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdGNoZWNrU29ydGVkSW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAtMTtcblx0XHR0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKHRhc2ssIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0X3Jlc29ydENoaWxkcmVuOiBmdW5jdGlvbihkYXRhLCBzdGFydEluZGV4LCBwYXJlbnRJRCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSBzdGFydEluZGV4O1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbih0YXNrRGF0YSkge1xuXHRcdFx0dmFyIHRhc2sgPSB0aGlzLmdldCh0YXNrRGF0YS5pZCk7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudElEKSB7XG5cdFx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldChwYXJlbnRJRCk7XG5cdFx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNhdmUoe1xuXHRcdFx0XHRzb3J0aW5kZXg6ICsrc29ydEluZGV4LFxuXHRcdFx0XHRwYXJlbnRpZDogcGFyZW50SURcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhc2tEYXRhLmNoaWxkcmVuICYmIHRhc2tEYXRhLmNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9yZXNvcnRDaGlsZHJlbih0YXNrRGF0YS5jaGlsZHJlbiwgc29ydEluZGV4LCB0YXNrLmlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdHJlc29ydDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR0aGlzLl9yZXNvcnRDaGlsZHJlbihkYXRhLCAtMSwgMCk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0c3Vic2NyaWJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBhZGQgZW1wdHkgdGFzayBpZiBubyB0YXNrcyBmcm9tIHNlcnZlclxuICAgICAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldChbe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IHRhc2snXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHRcdG1vZGVsLnBhcmVudCA9IHBhcmVudDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmRlZmF1bHRTdGF0dXNJZCkge1xuXHRcdFx0XHRtb2RlbC5zZXQoJ3N0YXR1cycsIHRoaXMuZGVmYXVsdFN0YXR1c0lkKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0dGhpcy5fY2hlY2tEZXBlbmRlbmNpZXMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4ucmVtb3ZlKHRhc2spO1xuXHRcdFx0XHR0YXNrLnBhcmVudCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fcHJldmVudFNvcnRpbmcpIHtcblx0XHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmNvbXBsZXRlJywgKHRhc2spID0+IHtcblx0XHRcdGlmICh0YXNrLmdldCgnY29tcGxldGUnKSA9PSAxMDAgJiYgdGhpcy5jbG9zZWRTdGF0dXNJZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRhc2suc2V0KCdzdGF0dXMnLCB0aGlzLmNsb3NlZFN0YXR1c0lkKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0Y3JlYXRlRGVwZW5kZW5jeTogZnVuY3Rpb24gKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKHRoaXMuX2NhbkNyZWF0ZURlcGVuZGVuY2UoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpKSB7XG5cdFx0XHRhZnRlck1vZGVsLmRlcGVuZE9uKGJlZm9yZU1vZGVsKTtcblx0XHR9XG5cdH0sXG5cblx0X2NhbkNyZWF0ZURlcGVuZGVuY2U6IGZ1bmN0aW9uKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKGJlZm9yZU1vZGVsLmhhc1BhcmVudChhZnRlck1vZGVsKSB8fCBhZnRlck1vZGVsLmhhc1BhcmVudChiZWZvcmVNb2RlbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGJlZm9yZU1vZGVsLmhhc0luRGVwcyhhZnRlck1vZGVsKSB8fFxuXHRcdFx0YWZ0ZXJNb2RlbC5oYXNJbkRlcHMoYmVmb3JlTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRyZW1vdmVEZXBlbmRlbmN5OiBmdW5jdGlvbihhZnRlck1vZGVsKSB7XG5cdFx0YWZ0ZXJNb2RlbC5jbGVhckRlcGVuZGVuY2UoKTtcblx0fSxcblx0X2NoZWNrRGVwZW5kZW5jaWVzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goKHRhc2spID0+IHtcblx0XHRcdHZhciBpZHMgPSB0YXNrLmdldCgnZGVwZW5kJykuY29uY2F0KFtdKTtcblx0XHRcdHZhciBoYXNHb29kRGVwZW5kcyA9IGZhbHNlO1xuXHRcdFx0aWYgKGlkcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRfLmVhY2goaWRzLCAoaWQpID0+IHtcblx0XHRcdFx0dmFyIGJlZm9yZU1vZGVsID0gdGhpcy5nZXQoaWQpO1xuXHRcdFx0XHRpZiAoYmVmb3JlTW9kZWwpIHtcblx0XHRcdFx0XHR0YXNrLmRlcGVuZE9uKGJlZm9yZU1vZGVsLCB0cnVlKTtcblx0XHRcdFx0XHRoYXNHb29kRGVwZW5kcyA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFoYXNHb29kRGVwZW5kcykge1xuXHRcdFx0XHR0YXNrLnNhdmUoJ2RlcGVuZCcsIFtdKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0b3V0ZGVudDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciB1bmRlclN1YmxpbmdzID0gW107XG5cdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHR0YXNrLnBhcmVudC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGlmIChjaGlsZC5nZXQoJ3NvcnRpbmRleCcpIDw9IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmRlclN1YmxpbmdzLnB1c2goY2hpbGQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHVuZGVyU3VibGluZ3MuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKGNoaWxkLmRlcGVuZHMuZ2V0KHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuY2xlYXJEZXBlbmRlbmNlKCk7XG4gICAgICAgICAgICB9XG5cdFx0XHRjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHRhc2suaWQpO1xuXHRcdH0pO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0aWYgKHRhc2sucGFyZW50ICYmIHRhc2sucGFyZW50LnBhcmVudCkge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHRhc2sucGFyZW50LnBhcmVudC5pZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCAwKTtcblx0XHR9XG5cdH0sXG5cdGluZGVudDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciBwcmV2VGFzaywgaSwgbTtcblx0XHRmb3IgKGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRtID0gdGhpcy5hdChpKTtcblx0XHRcdGlmICgobS5nZXQoJ3NvcnRpbmRleCcpIDwgdGFzay5nZXQoJ3NvcnRpbmRleCcpKSAmJiAodGFzay5wYXJlbnQgPT09IG0ucGFyZW50KSkge1xuXHRcdFx0XHRwcmV2VGFzayA9IG07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAocHJldlRhc2spIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCBwcmV2VGFzay5pZCk7XG5cdFx0fVxuXHR9LFxuICAgIGltcG9ydFRhc2tzOiBmdW5jdGlvbih0YXNrSlNPTmFycmF5LCBjYWxsYmFjaykge1xuXHRcdHZhciBzb3J0aW5kZXggPSAtMTtcblx0XHRpZiAodGhpcy5sYXN0KCkpIHtcblx0XHRcdHNvcnRpbmRleCA9IHRoaXMubGFzdCgpLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0fVxuICAgICAgICB0YXNrSlNPTmFycmF5LmZvckVhY2goZnVuY3Rpb24odGFza0l0ZW0pIHtcbiAgICAgICAgICAgIHRhc2tJdGVtLnNvcnRpbmRleCA9ICsrc29ydGluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRhc2tKU09OYXJyYXkubGVuZ3RoO1xuICAgICAgICB2YXIgZG9uZSA9IDA7XG4gICAgICAgIHRoaXMuYWRkKHRhc2tKU09OYXJyYXksIHtwYXJzZTogdHJ1ZX0pLmZvckVhY2goKHRhc2spID0+IHtcbiAgICAgICAgICAgIHRhc2suc2F2ZSh7fSwge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZG9uZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9uZSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlRGVwczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcbiAgICAgICAgZGF0YS5wYXJlbnRzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnBhcmVudC5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBpdGVtLnBhcmVudC5vdXRsaW5lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLmNoaWxkLm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGl0ZW0uY2hpbGQub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHBhcmVudC5pZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cblx0XHRkYXRhLmRlcHMuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBkZXAuYmVmb3JlLm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGRlcC5iZWZvcmUub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBkZXAuYWZ0ZXIubmFtZSxcblx0XHRcdFx0b3V0bGluZTogZGVwLmFmdGVyLm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVEZXBlbmRlbmN5KGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tDb2xsZWN0aW9uO1xuIiwiLy8gcmVxdWlyZSgnYmFiZWwvZXh0ZXJuYWwtaGVscGVycycpO1xuXG5pbXBvcnQgVGFza0NvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9ucy9UYXNrQ29sbGVjdGlvbic7XG5pbXBvcnQgU2V0dGluZ3MgZnJvbSAnLi9tb2RlbHMvU2V0dGluZ01vZGVsJztcblxuaW1wb3J0IEdhbnR0VmlldyBmcm9tICcuL3ZpZXdzL0dhbnR0Vmlldyc7XG5pbXBvcnQge3Rhc2tzVVJMLCBjb25maWdVUkx9IGZyb20gJy4vY2xpZW50Q29uZmlnJztcblxuXG5mdW5jdGlvbiBsb2FkVGFza3ModGFza3MpIHtcbiAgICB2YXIgZGZkID0gbmV3ICQuRGVmZXJyZWQoKTtcblx0dGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGZkLnJlc29sdmUoKTtcblx0XHR9LFxuXHRcdGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGRmZC5yZWplY3QoZXJyKTtcblx0XHR9LFxuXHRcdHBhcnNlOiB0cnVlLFxuXHRcdHJlc2V0OiB0cnVlXG5cdH0pO1xuICAgIHJldHVybiBkZmQucHJvbWlzZSgpO1xufVxuXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICByZXR1cm4gJC5nZXRKU09OKGNvbmZpZ1VSTClcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHNldHRpbmdzLnN0YXR1c2VzID0gZGF0YTtcbiAgICAgICAgfSk7XG59XG5cblxuJCgoKSA9PiB7XG5cdGxldCB0YXNrcyA9IG5ldyBUYXNrQ29sbGVjdGlvbigpO1xuICAgIHRhc2tzLnVybCA9IHRhc2tzVVJMO1xuICAgIGxldCBzZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyh7fSwge3Rhc2tzOiB0YXNrc30pO1xuXG4gICAgd2luZG93LnRhc2tzID0gdGFza3M7XG5cbiAgICAkLndoZW4obG9hZFRhc2tzKHRhc2tzKSlcbiAgICAudGhlbigoKSA9PiBsb2FkU2V0dGluZ3Moc2V0dGluZ3MpKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1N1Y2Nlc3MgbG9hZGluZyB0YXNrcy4nKTtcbiAgICAgICAgbmV3IEdhbnR0Vmlldyh7XG4gICAgICAgICAgICBzZXR0aW5nczogc2V0dGluZ3MsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiB0YXNrc1xuICAgICAgICB9KS5yZW5kZXIoKTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGFza3Muc2V0RGVmYXVsdFN0YXR1c0lkKHNldHRpbmdzLmdldERlZmF1bHRTdGF0dXNJZCgpKTtcbiAgICAgICAgdGFza3Muc2V0Q2xvc2VkU3RhdHVzSWQoc2V0dGluZ3MuZ2V0Q2xvc2VkU3RhdHVzSWQoKSk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIGhpZGUgbG9hZGluZ1xuICAgICAgICAkKCcjbG9hZGVyJykuZmFkZU91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gZGlzcGxheSBoZWFkIGFsd2F5cyBvbiB0b3BcbiAgICAgICAgICAgICQoJyNoZWFkJykuY3NzKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGVuYWJsZSBzY3JvbGxpbmdcbiAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaG9sZC1zY3JvbGwnKTtcbiAgICAgICAgfSk7XG4gICAgfSkuZmFpbCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZycsIGVycm9yKTtcbiAgICB9KTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cbnZhciBSZXNvdXJjZVJlZmVyZW5jZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgLy8gbWFpbiBwYXJhbXNcbiAgICAgICAgV0JTSUQgOiAxLCAvLyB0YXNrIGlkXG4gICAgICAgIFJlc0lEOiAxLCAvLyByZXNvdXJjZSBpZFxuICAgICAgICBUU0FjdGl2YXRlOiB0cnVlLFxuXG4gICAgICAgIC8vIHNvbWUgc2VydmVyIHBhcmFtc1xuICAgICAgICBXQlNQcm9maWxlSUQgOiBwYXJhbXMucHJvZmlsZSxcbiAgICAgICAgV0JTX0lEIDogcGFyYW1zLnByb2ZpbGUsXG4gICAgICAgIFBhcnRpdE5vIDogcGFyYW1zLnNpdGVrZXksIC8vIGhhdmUgbm8gaWRlYSB3aGF0IGlzIHRoYXRcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleVxuXG4gICAgfSxcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZVJlZmVyZW5jZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcblxudmFyIFNldHRpbmdNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aW50ZXJ2YWw6ICdkYWlseScsXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxuXHRcdGRwaTogMVxuXHR9LFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycywgcGFyYW1zKSB7XG5cdFx0dGhpcy5zdGF0dXNlcyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnNhdHRyID0ge1xuXHRcdFx0aERhdGE6IHt9LFxuXHRcdFx0ZHJhZ0ludGVydmFsOiAxLFxuXHRcdFx0ZGF5c1dpZHRoOiA1LFxuXHRcdFx0Y2VsbFdpZHRoOiAzNSxcblx0XHRcdG1pbkRhdGU6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdG1heERhdGU6IG5ldyBEYXRlKDAsMCwwKSxcblx0XHRcdGJvdW5kYXJ5TWluOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1heDogbmV3IERhdGUoMjAyMCwxLDEpLFxuXHRcdFx0Ly9tb250aHMgcGVyIGNlbGxcblx0XHRcdG1wYzogMVxuXHRcdH07XG5cblx0XHR0aGlzLnNkaXNwbGF5ID0ge1xuXHRcdFx0c2NyZWVuV2lkdGg6ICAkKCcjZ2FudHQtY29udGFpbmVyJykuaW5uZXJXaWR0aCgpICsgNzg2LFxuXHRcdFx0dEhpZGRlbldpZHRoOiAzMDUsXG5cdFx0XHR0YWJsZVdpZHRoOiA3MTBcblx0XHR9O1xuXG5cdFx0dGhpcy5jb2xsZWN0aW9uID0gcGFyYW1zLnRhc2tzO1xuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkIGNoYW5nZTplbmQnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMoKTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlOndpZHRoJyk7XG4gICAgICAgIH0sIDUwMCkpO1xuXHR9LFxuXHRnZXRTZXR0aW5nOiBmdW5jdGlvbihmcm9tLCBhdHRyKXtcblx0XHRpZihhdHRyKXtcblx0XHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dW2F0dHJdO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXTtcblx0fSxcblx0ZmluZFN0YXR1c0lkIDogZnVuY3Rpb24oc3RhdHVzKSB7XG5cdFx0Zm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gc3RhdHVzLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBzdGF0dXNJdGVtLklEO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcbiAgICBmaW5kU3RhdHVzRm9ySWQgOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uSUQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSBpZC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRBbGxTdGF0dXNlcygpIHtcbiAgICAgICAgY29uc3Qgc3RhdHVzZXMgPSBbXTtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c2VzLnB1c2goc3RhdHVzSXRlbS5jZmdfaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGF0dXNlcztcbiAgICB9LFxuICAgIGdldERlZmF1bHRTdGF0dXNJZCgpIHtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ25vIGRlZmF1bHQgc3RhdHVzIGluIGNvbmZpZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRDbG9zZWRTdGF0dXNJZCgpIHtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNDbG9zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdubyBjbG9zZWQgc3RhdHVzIGluIGNvbmZpZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBmaW5kRGVmYXVsdFN0YXR1c0lkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cdGZpbmRIZWFsdGhJZCA6IGZ1bmN0aW9uKGhlYWx0aCkge1xuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XG5cdFx0XHRpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xuXHRcdFx0XHRcdGlmIChzdGF0dXNJdGVtLmNmZ19pdGVtLnRvTG93ZXJDYXNlKCkgPT09IGhlYWx0aC50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbS5JRDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG4gICAgZmluZEhlYWx0aEZvcklkIDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZmluZERlZmF1bHRIZWFsdGhJZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblx0ZmluZFdPSWQgOiBmdW5jdGlvbih3bykge1xuXHRcdGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbaV07XG4gICAgICAgICAgICBpZiAoZGF0YS5XT051bWJlci50b0xvd2VyQ2FzZSgpID09PSB3by50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuSUQ7XG4gICAgICAgICAgICB9XG5cdFx0fVxuXHR9LFxuICAgIGZpbmRXT0ZvcklkIDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgZm9yKHZhciBpIGluIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGEpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcbiAgICAgICAgICAgIGlmIChkYXRhLklELnRvU3RyaW5nKCkgPT09IGlkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5XT051bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZmluZERlZmF1bHRXT0lkIDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhWzBdLklEO1xuICAgIH0sXG4gICAgZ2V0RGF0ZUZvcm1hdCA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ2RkL21tL3l5JztcbiAgICB9LFxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWluRGF0ZSA9IG5ldyBEYXRlKCksIG1heERhdGUgPSBtaW5EYXRlLmNsb25lKCkuYWRkWWVhcnMoMSk7XG5cblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XG5cdFx0XHRcdG1pbkRhdGU9bW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGUgPSBtaW5EYXRlO1xuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XG5cdH0sXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xuXG5cdFx0dmFyIGludGVydmFsID0gdGhpcy5nZXQoJ2ludGVydmFsJyk7XG5cblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdkYWlseScpIHtcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAxLCB7c2lsZW50OiB0cnVlfSk7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cyg2MCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTU7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cygxKTtcblx0XHRcdH07XG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xuXG5cdFx0fSBlbHNlIGlmKGludGVydmFsID09PSAnd2Vla2x5Jykge1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDcsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogNyk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApLm1vdmVUb0RheU9mV2VlaygxLCAtMSk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSA1O1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoICogNztcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcblx0XHRcdHNhdHRyLm1wYyA9IDE7XG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyg3KTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ21vbnRobHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDEyICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDI7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSA3ICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjID0gMTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluLm1vdmVUb0ZpcnN0RGF5T2ZRdWFydGVyKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gMzAgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTtcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcblx0XHRcdGNlbGxXaWR0aCA9IDMwO1xuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2l6ZSAvIGR1cmF0aW9uO1xuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gZHBpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygzMCAqIDEwKTtcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcblx0XHRcdGRwaSA9IHRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIwICogZHBpKTtcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDMwICogMTApO1xuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XG5cdFx0XHR9O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xuXHRcdH1cblx0XHR2YXIgaERhdGEgPSB7XG5cdFx0XHQnMSc6IFtdLFxuXHRcdFx0JzInOiBbXSxcblx0XHRcdCczJzogW11cblx0XHR9O1xuXHRcdHZhciBoZGF0YTMgPSBbXTtcblxuXHRcdHN0YXJ0ID0gc2F0dHIuYm91bmRhcnlNaW47XG5cblx0XHRsYXN0ID0gc3RhcnQ7XG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XG5cdFx0XHR2YXIgZHVyZnVuYztcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGR1cmZ1bmMobGFzdCksXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzSG9seSA9IGxhc3QuZ2V0RGF5KCkgPT09IDYgfHwgbGFzdC5nZXREYXkoKSA9PT0gMDtcblx0XHRcdFx0aGRhdGEzLnB1c2goe1xuXHRcdFx0XHRcdGR1cmF0aW9uOiBpbnRlcnZhbGRheXMsXG5cdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIGhvbHkgOiAoaW50ZXJ2YWwgPT09ICdkYWlseScpICYmIGlzSG9seVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XG5cdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzYXR0ci5ib3VuZGFyeU1heCA9IGVuZCA9IGxhc3Q7XG5cdFx0aERhdGFbJzMnXSA9IGhkYXRhMztcblxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgZGF0ZSB0byBlbmQgb2YgeWVhclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xuXHRcdGhEYXRhWycxJ10ucHVzaCh7XG5cdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXG5cdFx0fSk7XG5cdFx0Zm9yKGkgPSBzdGFydC5nZXRGdWxsWWVhcigpICsgMSwgaUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpOyBpIDwgaUxlbjsgaSsrKXtcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xuXHRcdFx0aERhdGFbJzEnXS5wdXNoKHtcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxuXHRcdFx0XHR0ZXh0OiBpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxuXHRcdGlmIChzdGFydC5nZXRGdWxsWWVhcigpIT09ZW5kLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdGludGVyID0gRGF0ZS5kYXlzZGlmZihuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwgMCwgMSksIGVuZCk7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXG5cdFx0XHRcdHRleHQ6IGVuZC5nZXRGdWxsWWVhcigpXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcblx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKHN0YXJ0LCBzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLFxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcblx0XHR9KTtcblxuXHRcdGogPSBzdGFydC5nZXRNb250aCgpICsgMTtcblx0XHRpID0gc3RhcnQuZ2V0RnVsbFllYXIoKTtcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XG5cdFx0dmFyIGVuZG1vbnRoID0gZW5kLmdldE1vbnRoKCk7XG5cblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XG5cdFx0XHR3aGlsZShqIDwgMTIpIHtcblx0XHRcdFx0aWYgKGkgPT09IGlMZW4gJiYgaiA9PT0gZW5kbW9udGgpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxuXHRcdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShqLCAnbScpXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRqICs9IDE7XG5cdFx0XHR9XG5cdFx0XHRpICs9IDE7XG5cdFx0XHRqID0gMDtcblx0XHR9XG5cdFx0aWYgKGVuZC5nZXRNb250aCgpICE9PSBzdGFydC5nZXRNb250aCgpICYmIGVuZC5nZXRGdWxsWWVhcigpICE9PSBzdGFydC5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHRoRGF0YVsnMiddLnB1c2goe1xuXHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihlbmQuY2xvbmUoKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKSwgZW5kKSxcblx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGVuZC5nZXRNb250aCgpLCAnbScpXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0c2F0dHIuaERhdGEgPSBoRGF0YTtcblx0fSxcblx0Y2FsY3VsYXRlSW50ZXJ2YWxzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNhbGNtaW5tYXgoKTtcblx0XHR0aGlzLnNldEF0dHJpYnV0ZXMoKTtcblx0fSxcblx0Y29uRFRvVDooZnVuY3Rpb24oKXtcblx0XHR2YXIgZFRvVGV4dD17XG5cdFx0XHQnc3RhcnQnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdH0sXG5cdFx0XHQnZHVyYXRpb24nOmZ1bmN0aW9uKHZhbHVlLG1vZGVsKXtcblx0XHRcdFx0cmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuc3RhcnQsbW9kZWwuZW5kKSsnIGQnO1xuXHRcdFx0fSxcblx0XHRcdCdzdGF0dXMnOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0dmFyIHN0YXR1c2VzPXtcblx0XHRcdFx0XHQnMTEwJzonY29tcGxldGUnLFxuXHRcdFx0XHRcdCcxMDknOidvcGVuJyxcblx0XHRcdFx0XHQnMTA4JyA6ICdyZWFkeSdcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHN0YXR1c2VzW3ZhbHVlXTtcblx0XHRcdH1cblxuXHRcdH07XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XG5cdFx0fTtcblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwidmFyIFJlc0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9jb2xsZWN0aW9ucy9SZXNvdXJjZVJlZmVyZW5jZUNvbGxlY3Rpb24nKTtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuICAgIGNvbXBhcmF0b3I6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxudmFyIHJlc0xpbmtzID0gbmV3IFJlc0NvbGxlY3Rpb24oKTtcclxucmVzTGlua3MuZmV0Y2goKTtcclxuXHJcbnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBNQUlOIFBBUkFNU1xyXG4gICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGNvbXBsZXRlOiAwLCAgLy8gMCUgLSAxMDAlIHBlcmNlbnRzXHJcbiAgICAgICAgc29ydGluZGV4OiAwLCAgIC8vIHBsYWNlIG9uIHNpZGUgbWVudSwgc3RhcnRzIGZyb20gMFxyXG4gICAgICAgIGRlcGVuZDogW10sICAvLyBpZCBvZiB0YXNrc1xyXG4gICAgICAgIHN0YXR1czogJzExMCcsICAgICAgLy8gMTEwIC0gY29tcGxldGUsIDEwOSAgLSBvcGVuLCAxMDggLSByZWFkeVxyXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZDogbmV3IERhdGUoKSxcclxuICAgICAgICBwYXJlbnRpZDogMCxcclxuICAgICAgICBDb21tZW50czogMCxcclxuXHJcbiAgICAgICAgY29sb3I6ICcjMDA5MGQzJywgICAvLyB1c2VyIGNvbG9yLCBub3QgdXNlZCBmb3Igbm93XHJcblxyXG4gICAgICAgIC8vIHNvbWUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgcmVzb3VyY2VzOiBbXSwgICAgICAgICAvL2xpc3Qgb2YgaWRcclxuICAgICAgICBoZWFsdGg6IDIxLFxyXG4gICAgICAgIHJlcG9ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdvOiAyLCAgICAgICAgICAgICAgICAgIC8vU2VsZWN0IExpc3QgaW4gcHJvcGVydGllcyBtb2RhbCAgIChjb25maWdkYXRhKVxyXG4gICAgICAgIG1pbGVzdG9uZTogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZGVsaXZlcmFibGU6IGZhbHNlLCAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBmaW5hbmNpYWw6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIHRpbWVzaGVldHM6IGZhbHNlLCAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgYWN0dGltZXNoZWV0czogZmFsc2UsICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuXHJcbiAgICAgICAgLy8gc2VydmVyIHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIC8vIGRvbid0IHVzZSB0aGVtIG9uIGNsaWVudCBzaWRlXHJcbiAgICAgICAgUHJvamVjdFJlZjogcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgV0JTX0lEOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleSxcclxuXHJcblxyXG4gICAgICAgIC8vIHBhcmFtcyBmb3IgYXBwbGljYXRpb24gdmlld3NcclxuICAgICAgICAvLyBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIEpTT05cclxuICAgICAgICBoaWRkZW46IGZhbHNlLFxyXG4gICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXHJcbiAgICAgICAgaGlnaHRsaWdodDogJydcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBzZWxmIHZhbGlkYXRpb25cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc0xpbmtzLnVwZGF0ZVJlc291cmNlc0ZvclRhc2sodGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTptaWxlc3RvbmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0JywgbmV3IERhdGUodGhpcy5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hpbGRyZW4gcmVmZXJlbmNlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgU3ViVGFza3MoKTtcclxuICAgICAgICB0aGlzLmRlcGVuZHMgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXQoJ21pbGVzdG9uZScsIGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZpbmcgcmVmc1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ3BhcmVudGlkJykgPT09IHRoaXMuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLnBhcmVudCA9IHRoaXM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnNvcnRpbmRleCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrVGltZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdjb2xsYXBzZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNraW5nIG5lc3RlZCBzdGF0ZVxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUnLCB0aGlzLl9jaGVja05lc3RlZCk7XHJcblxyXG4gICAgICAgIC8vIHRpbWUgY2hlY2tpbmdcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpjb21wbGV0ZScsIHRoaXMuX2NoZWNrQ29tcGxldGUpO1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbkRlcGVuZHNDb2xsZWN0aW9uKCk7XHJcbiAgICB9LFxyXG4gICAgaXNOZXN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgfSxcclxuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XHJcbiAgICB9LFxyXG4gICAgaGlkZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2hpZGRlbicsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGRlcGVuZE9uOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgc2lsZW50KSB7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRzLmFkZChiZWZvcmVNb2RlbCwge3NpbGVudDogc2lsZW50fSk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGFzSW5EZXBzOiBmdW5jdGlvbiAobW9kZWwpIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLmRlcGVuZHMuZ2V0KG1vZGVsLmlkKTtcclxuICAgIH0sXHJcbiAgICBoYXNEZXBzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRzLmxlbmd0aCAhPT0gMDtcclxuICAgIH0sXHJcbiAgICB0b0pTT046IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBqc29uID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLnJlc291cmNlcztcclxuICAgICAgICBkZWxldGUganNvbi5oaWRkZW47XHJcbiAgICAgICAgZGVsZXRlIGpzb24uY29sbGFwc2VkO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmhpZ2h0bGlnaHQ7XHJcbiAgICAgICAganNvbi5kZXBlbmQgPSBqc29uLmRlcGVuZC5qb2luKCcsJyk7XHJcbiAgICAgICAgcmV0dXJuIGpzb247XHJcbiAgICB9LFxyXG4gICAgaGFzUGFyZW50OiBmdW5jdGlvbihwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gcGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNsZWFyRGVwZW5kZW5jZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRzLnRvQXJyYXkoKS5mb3JFYWNoKChtKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVwZW5kcy5yZW1vdmUobSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2xpc3RlbkRlcGVuZHNDb2xsZWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuZGVwZW5kcywgJ3JlbW92ZSBhZGQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGlkcyA9IHRoaXMuZGVwZW5kcy5tYXAoKG0pID0+IG0uaWQpO1xyXG4gICAgICAgICAgICB0aGlzLnNldCgnZGVwZW5kJywgaWRzKS5zYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAnYWRkJywgZnVuY3Rpb24oYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnRyaWdnZXIoJ2RlcGVuZDphZGQnLCBiZWZvcmVNb2RlbCwgdGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAncmVtb3ZlJywgZnVuY3Rpb24oYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnRyaWdnZXIoJ2RlcGVuZDpyZW1vdmUnLCBiZWZvcmVNb2RlbCwgdGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAnY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKGJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC51bmRlck1vdmluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGluZmluaXRlIGRlcGVuZCBsb29wXHJcbiAgICAgICAgICAgIHZhciBpbkRlcHMgPSBbdGhpc107XHJcbiAgICAgICAgICAgIHZhciBpc0luZmluaXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0RlcHMobW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIGlmICghbW9kZWwuZGVwZW5kcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXBlbmRzLmVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5EZXBzLmluZGV4T2YobSkgPiAtMSB8fCBpc0luZmluaXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5maW5pdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGluRGVwcy5wdXNoKG0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGVwcyhtKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoZWNrRGVwcyh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0luZmluaXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG9TdGFydChiZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jaGVja05lc3RlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCduZXN0ZWRTdGF0ZUNoYW5nZScsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHZhciBzdGFydCwgZW5kO1xyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2Uuc3RhcnQpKXtcclxuICAgICAgICAgICAgc3RhcnQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5zdGFydCksICdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5zdGFydCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChfLmlzRGF0ZShyZXNwb25zZS5zdGFydCkpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSByZXNwb25zZS5zdGFydDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2UuZW5kKSl7XHJcbiAgICAgICAgICAgIGVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksICdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcclxuICAgICAgICB9IGVsc2UgaWYgKF8uaXNEYXRlKHJlc3BvbnNlLmVuZCkpIHtcclxuICAgICAgICAgICAgZW5kID0gcmVzcG9uc2UuZW5kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNwb25zZS5zdGFydCA9IHN0YXJ0IDwgZW5kID8gc3RhcnQgOiBlbmQ7XHJcbiAgICAgICAgcmVzcG9uc2UuZW5kID0gc3RhcnQgPCBlbmQgPyBlbmQgOiBzdGFydDtcclxuXHJcbiAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSB1dGlsLmNvbnZlcnREYXRlVG9VVEMocmVzcG9uc2Uuc3RhcnQpO1xyXG4gICAgICAgIHJlc3BvbnNlLmVuZCA9IHV0aWwuY29udmVydERhdGVUb1VUQyhyZXNwb25zZS5lbmQpO1xyXG4gICAgICAgIHJlc3BvbnNlLnBhcmVudGlkID0gcGFyc2VJbnQocmVzcG9uc2UucGFyZW50aWQgfHwgJzAnLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBudWxsIHBhcmFtc1xyXG4gICAgICAgIF8uZWFjaChyZXNwb25zZSwgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlc3BvbnNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIHJlc291cmNlcyBhcyBsaXN0IG9mIElEXHJcbiAgICAgICAgdmFyIGlkcyA9IFtdO1xyXG4gICAgICAgIChyZXNwb25zZS5SZXNvdXJjZXMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24ocmVzSW5mbykge1xyXG4gICAgICAgICAgICBpZHMucHVzaChyZXNJbmZvLlJlc0lEKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXNwb25zZS5SZXNvdXJjZXMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmVzcG9uc2UucmVzb3VyY2VzID0gaWRzO1xyXG4gICAgICAgIGlmIChyZXNwb25zZS5taWxlc3RvbmUpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSByZXNwb25zZS5lbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGRlcHMgZm9yIG5ldyBBUEkgKGFycmF5IG9mIGRlcHMpXHJcbiAgICAgICAgaWYgKF8uaXNOdW1iZXIocmVzcG9uc2UuZGVwZW5kKSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS5kZXBlbmQgPSBbcmVzcG9uc2UuZGVwZW5kXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKF8uaXNTdHJpbmcocmVzcG9uc2UuZGVwZW5kKSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS5kZXBlbmQgPSBfLmNvbXBhY3QocmVzcG9uc2UuZGVwZW5kLnNwbGl0KCcsJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrVGltZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXJ0VGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgIHZhciBlbmRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ2VuZCcpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRTdGFydFRpbWUgPSBjaGlsZC5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZEVuZFRpbWUgPSBjaGlsZC5nZXQoJ2VuZCcpO1xyXG4gICAgICAgICAgICBpZihjaGlsZFN0YXJ0VGltZSA8IHN0YXJ0VGltZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gY2hpbGRTdGFydFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoY2hpbGRFbmRUaW1lID4gZW5kVGltZSl7XHJcbiAgICAgICAgICAgICAgICBlbmRUaW1lID0gY2hpbGRFbmRUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0Jywgc3RhcnRUaW1lKTtcclxuICAgICAgICB0aGlzLnNldCgnZW5kJywgZW5kVGltZSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb21wbGV0ZSA9IDA7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgICAgIGlmIChsZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSArPSBjaGlsZC5nZXQoJ2NvbXBsZXRlJykgLyBsZW5ndGg7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNldCgnY29tcGxldGUnLCBNYXRoLnJvdW5kKGNvbXBsZXRlKSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZVRvU3RhcnQ6IGZ1bmN0aW9uKG5ld1N0YXJ0KSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZyBpZiBuZXcgc3RhcnQgaXMgdGhlIHNhbWUgYXMgY3VycmVudFxyXG4gICAgICAgIGlmIChuZXdTdGFydC50b0RhdGVTdHJpbmcoKSA9PT0gdGhpcy5nZXQoJ3N0YXJ0JykudG9EYXRlU3RyaW5nKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIG9mZnNldFxyXG4vLyAgICAgICAgdmFyIGRheXNEaWZmID0gTWF0aC5mbG9vcigobmV3U3RhcnQudGltZSgpIC0gdGhpcy5nZXQoJ3N0YXJ0JykudGltZSgpKSAvIDEwMDAgLyA2MCAvIDYwIC8gMjQpXHJcbiAgICAgICAgdmFyIGRheXNEaWZmID0gRGF0ZS5kYXlzZGlmZihuZXdTdGFydCwgdGhpcy5nZXQoJ3N0YXJ0JykpIC0gMTtcclxuICAgICAgICBpZiAobmV3U3RhcnQgPCB0aGlzLmdldCgnc3RhcnQnKSkge1xyXG4gICAgICAgICAgICBkYXlzRGlmZiAqPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZSBkYXRlc1xyXG4gICAgICAgIHRoaXMuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IG5ld1N0YXJ0LmNsb25lKCksXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5nZXQoJ2VuZCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzRGlmZilcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hhbmdlcyBkYXRlcyBpbiBhbGwgY2hpbGRyZW5cclxuICAgICAgICB0aGlzLnVuZGVyTW92aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2hpbGRyZW4oZGF5c0RpZmYpO1xyXG4gICAgICAgIHRoaXMudW5kZXJNb3ZpbmcgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBfbW92ZUNoaWxkcmVuOiBmdW5jdGlvbihkYXlzKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLm1vdmUoZGF5cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZVdpdGhDaGlsZHJlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGFzay5zYXZlV2l0aENoaWxkcmVuKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZTogZnVuY3Rpb24oZGF5cykge1xyXG4gICAgICAgIHRoaXMuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKSxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXMpO1xyXG4gICAgfSxcclxuICAgIGdldE91dGxpbmVMZXZlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxldmVsID0gMTtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XHJcbiAgICAgICAgd2hpbGUodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldmVsKys7XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdldE91dGxpbmVOdW1iZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucGFyZW50LmNoaWxkcmVuLm1vZGVscy5pbmRleE9mKHRoaXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQuZ2V0T3V0bGluZU51bWJlcigpICsgJy4nICsgKGluZGV4ICsgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbnVtYmVyID0gMTtcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmF0KGkpO1xyXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW1vZGVsLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgbnVtYmVyICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHJcbiIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHR2YXIgcHJtYXJyID0gcHJtc3RyLnNwbGl0KCcmJyk7XG5cdHZhciBpLCB0bXBhcnI7XG5cdGZvciAoaSA9IDA7IGkgPCBwcm1hcnIubGVuZ3RoOyBpKyspIHtcblx0XHR0bXBhcnIgPSBwcm1hcnJbaV0uc3BsaXQoJz0nKTtcblx0XHRwYXJhbXNbdG1wYXJyWzBdXSA9IHRtcGFyclsxXTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRVUkxQYXJhbXMgPSBmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0dmFyIHBybXN0ciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xuXHRyZXR1cm4gcHJtc3RyICE9PSBudWxsICYmIHBybXN0ciAhPT0gJycgPyB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSA6IHt9O1xufTtcblxubW9kdWxlLmV4cG9ydHMuY29udmVydERhdGVUb1VUQyA9IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoXG5cdFx0ZGF0ZS5nZXRVVENGdWxsWWVhcigpLCBkYXRlLmdldFVUQ01vbnRoKCksIGRhdGUuZ2V0VVRDRGF0ZSgpLFxuXHRcdGRhdGUuZ2V0VVRDSG91cnMoKSwgZGF0ZS5nZXRVVENNaW51dGVzKCksIGRhdGUuZ2V0VVRDU2Vjb25kcygpXG5cdCk7XG59O1xuIiwidmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcclxudmFyIHhtbCA9IGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL3htbFRlbXBsYXRlLnhtbCcsICd1dGY4Jyk7XHJcbnZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoeG1sKTtcclxudmFyIHhtbFRvSlNPTiA9IHdpbmRvdy54bWxUb0pTT047XHJcblxyXG5mdW5jdGlvbiBwYXJzZVhNTE9iaih4bWxTdHJpbmcpIHtcclxuICAgIHZhciBvYmogPSB4bWxUb0pTT04ucGFyc2VTdHJpbmcoeG1sU3RyaW5nKTtcclxuICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyB4bWxJdGVtLk5hbWUgPSBbe190ZXh0OiAnbm8gbmFtZSAnICsgeG1sSXRlbS5VSURbMF0uX3RleHR9XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2tpcCByb290IHByb2plY3QgdGFza1xyXG4gICAgICAgIGlmICh4bWxJdGVtLk91dGxpbmVOdW1iZXJbMF0uX3RleHQudG9TdHJpbmcoKSA9PT0gJzAnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGFza3MucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6IHhtbEl0ZW0uTmFtZVswXS5fdGV4dCxcclxuICAgICAgICAgICAgc3RhcnQ6IHhtbEl0ZW0uU3RhcnRbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGVuZDogeG1sSXRlbS5GaW5pc2hbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiB4bWxJdGVtLlBlcmNlbnRDb21wbGV0ZVswXS5fdGV4dCxcclxuICAgICAgICAgICAgb3V0bGluZTogeG1sSXRlbS5PdXRsaW5lTnVtYmVyWzBdLl90ZXh0LnRvU3RyaW5nKClcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRhc2tzO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5wYXJzZURlcHNGcm9tWE1MID0gZnVuY3Rpb24oeG1sU3RyaW5nKSB7XHJcbiAgICB2YXIgb2JqID0geG1sVG9KU09OLnBhcnNlU3RyaW5nKHhtbFN0cmluZyk7XHJcbiAgICB2YXIgdWlkcyA9IHt9O1xyXG4gICAgdmFyIG91dGxpbmVzID0ge307XHJcbiAgICB2YXIgZGVwcyA9IFtdO1xyXG4gICAgdmFyIHBhcmVudHMgPSBbXTtcclxuICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyB4bWxJdGVtLk5hbWUgPSBbe190ZXh0OiAnbm8gbmFtZSAnICsgeG1sSXRlbS5VSURbMF0uX3RleHR9XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IHhtbEl0ZW0uTmFtZVswXS5fdGV4dC50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBvdXRsaW5lOiB4bWxJdGVtLk91dGxpbmVOdW1iZXJbMF0uX3RleHQudG9TdHJpbmcoKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdWlkc1t4bWxJdGVtLlVJRFswXS5fdGV4dF0gPSBpdGVtO1xyXG4gICAgICAgIG91dGxpbmVzW2l0ZW0ub3V0bGluZV0gPSBpdGVtO1xyXG4gICAgfSk7XHJcbiAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhc2sgPSB1aWRzW3htbEl0ZW0uVUlEWzBdLl90ZXh0XTtcclxuICAgICAgICAvLyB2YXIgbmFtZSA9IHhtbEl0ZW0uTmFtZVswXS5fdGV4dDtcclxuICAgICAgICB2YXIgb3V0bGluZSA9IHRhc2sub3V0bGluZTtcclxuXHJcbiAgICAgICAgaWYgKHhtbEl0ZW0uUHJlZGVjZXNzb3JMaW5rKSB7XHJcbiAgICAgICAgICAgIHhtbEl0ZW0uUHJlZGVjZXNzb3JMaW5rLmZvckVhY2goKGxpbmspID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmVVSUQgPSBsaW5rLlByZWRlY2Vzc29yVUlEWzBdLl90ZXh0O1xyXG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZSA9IHVpZHNbYmVmb3JlVUlEXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZXBzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGJlZm9yZTogYmVmb3JlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyOiB0YXNrXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmUuaW5kZXhPZignLicpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50T3V0bGluZSA9IG91dGxpbmUuc2xpY2UoMCwgb3V0bGluZS5sYXN0SW5kZXhPZignLicpKTtcclxuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG91dGxpbmVzW3BhcmVudE91dGxpbmVdO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignY2FuIG5vdCBmaW5kIHBhcmVudCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJlbnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBjaGlsZDogdGFza1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVwczogZGVwcyxcclxuICAgICAgICBwYXJlbnRzOiBwYXJlbnRzXHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMucGFyc2VYTUxPYmogPSBwYXJzZVhNTE9iajtcclxuXHJcbmZ1bmN0aW9uIGN1dChkYXRlKSB7XHJcbiAgICBsZXQgZm9ybWF0ZWQgPSBkYXRlLnRvSVNPU3RyaW5nKCk7XHJcbiAgICByZXR1cm4gZm9ybWF0ZWQuc2xpY2UoMCwgZm9ybWF0ZWQuaW5kZXhPZignLicpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RHVyYXRpb24oZW5kLCBzdGFydCkge1xyXG4gICAgdmFyIGRpZmYgPSBlbmQuZ2V0VGltZSgpIC0gc3RhcnQuZ2V0VGltZSgpO1xyXG4gICAgY29uc3QgZGF5cyA9IE1hdGguZmxvb3IoZGlmZiAvIDEwMDAgLyA2MCAvIDYwIC8gMjQpICsgMTtcclxuICAgIC8vIGlmIChkYXlzID49IDEpIHtcclxuXHJcbiAgICAvLyB9XHJcbiAgICB2YXIgaG91cnMgPSBkYXlzICogODtcclxuICAgIC8vIHZhciBtaW5zID0gTWF0aC5mbG9vcigoZGlmZiAtIGhvdXJzICogMTAwMCAqIDYwICogNjApIC8gMTAwMCAvNjApO1xyXG4gICAgLy8gdmFyIHNlY3MgPSBNYXRoLmZsb29yKChkaWZmIC0gaG91cnMgKiAxMDAwICogNjAgKiA2MCAtIG1pbnMgKiAxMDAwICogNjApIC8gMTAwMCk7XHJcbiAgICByZXR1cm4gYFBUJHtob3Vyc31IME0wU2A7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLnRhc2tzVG9YTUwgPSBmdW5jdGlvbih0YXNrcykge1xyXG4gICAgdmFyIHN0YXJ0ID0gdGFza3MuYXQoMCkuZ2V0KCdzdGFydCcpO1xyXG4gICAgdmFyIGVuZCA9IHRhc2tzLmF0KDApLmdldCgnZW5kJyk7XHJcbiAgICB2YXIgZGF0YSA9IHRhc2tzLm1hcChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID4gdGFzay5nZXQoJ3N0YXJ0JykpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0YXNrLmdldCgnc3RhcnQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVuZCA8IHRhc2suZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICBlbmQgPSB0YXNrLmdldCgnZW5kJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkZXBlbmQgPSBfLm1hcCh0YXNrLmdldCgnZGVwZW5kJyksIChpZCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGFza3MuZ2V0KGlkKS5nZXQoJ3NvcnRpbmRleCcpICsgMTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWQ6IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSArIDEsXHJcbiAgICAgICAgICAgIG5hbWU6IHRhc2suZ2V0KCduYW1lJyksXHJcbiAgICAgICAgICAgIG91dGxpbmVOdW1iZXI6IHRhc2suZ2V0T3V0bGluZU51bWJlcigpLFxyXG4gICAgICAgICAgICBvdXRsaW5lTGV2ZWw6IHRhc2suZ2V0T3V0bGluZUxldmVsKCksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBjdXQodGFzay5nZXQoJ3N0YXJ0JykpLFxyXG4gICAgICAgICAgICBmaW5pc2g6IGN1dCh0YXNrLmdldCgnZW5kJykpLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogZ2V0RHVyYXRpb24odGFzay5nZXQoJ2VuZCcpLCB0YXNrLmdldCgnc3RhcnQnKSksXHJcbiAgICAgICAgICAgIGRlcGVuZDogZGVwZW5kWzBdXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXBpbGVkKHtcclxuICAgICAgICB0YXNrczogZGF0YSxcclxuICAgICAgICBjdXJyZW50RGF0ZTogY3V0KG5ldyBEYXRlKCkpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZTogY3V0KHN0YXJ0KSxcclxuICAgICAgICBmaW5pc2hEYXRlOiBjdXQoZW5kKSxcclxuICAgICAgICBkdXJhdGlvbjogZ2V0RHVyYXRpb24oZW5kLCBzdGFydClcclxuICAgIH0pO1xyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIENvbW1lbnRzVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyN0YXNrQ29tbWVudHNNb2RhbCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25BcHByb3ZlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25IaWRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25IaWRlJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRGVueSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29uRGVueScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuXHJcbiAgICAgICAgdmFyIHVwZGF0ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBjb3VudCA9ICQoXCIjdGFza0NvbW1lbnRzXCIpLmNvbW1lbnRzKFwiY291bnRcIik7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KCdDb21tZW50cycsIGNvdW50KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0ge1xyXG4gICAgICAgICAgICBhZnRlckRlbGV0ZSA6IHVwZGF0ZUNvdW50LFxyXG4gICAgICAgICAgICBhZnRlckNvbW1lbnRBZGQgOiB1cGRhdGVDb3VudFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gaW5pdCBjb21tZW50c1xyXG4gICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5jb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICBnZXRDb21tZW50c1VybDogXCIvYXBpL2NvbW1lbnQvXCIgKyB0aGlzLm1vZGVsLmlkICsgXCIvXCIgKyBwYXJhbXMuc2l0ZWtleSArIFwiL1dCUy8wMDBcIixcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQgKyBcIi9cIiArIHBhcmFtcy5zaXRla2V5ICsgXCIvV0JTL1wiICsgcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuY29tbWVudHMoe1xyXG4gICAgICAgICAgICAgICAgZ2V0Q29tbWVudHNVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1lbnRzVmlldztcclxuIiwidmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBTaWRlUGFuZWwgPSByZXF1aXJlKCcuL3NpZGVCYXIvU2lkZVBhbmVsJyk7XHJcclxydmFyIEdhbnR0Q2hhcnRWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXNDaGFydC9HYW50dENoYXJ0VmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51Vmlldy9Ub3BNZW51VmlldycpO1xyXHJ2YXIgTm90aWZpY2F0aW9ucyA9IHJlcXVpcmUoJy4vTm90aWZpY2F0aW9ucycpO1xyXHJccnZhciBHYW50dFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHIgICAgZWw6ICcuR2FudHQnLFxyICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyXHIgICAgICAgIG5ldyBDb250ZXh0TWVudVZpZXcoe1xyICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgLy8gbmV3IHRhc2sgYnV0dG9uXHIgICAgICAgICQoJy5uZXctdGFzaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdmFyIGxhc3RUYXNrID0gcGFyYW1zLmNvbGxlY3Rpb24ubGFzdCgpO1xyICAgICAgICAgICAgdmFyIGxhc3RJbmRleCA9IC0xO1xyICAgICAgICAgICAgaWYgKGxhc3RUYXNrKSB7XHIgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gbGFzdFRhc2suZ2V0KCdzb3J0aW5kZXgnKTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIHBhcmFtcy5jb2xsZWN0aW9uLmFkZCh7XHIgICAgICAgICAgICAgICAgbmFtZTogJ05ldyB0YXNrJyxcciAgICAgICAgICAgICAgICBzb3J0aW5kZXg6IGxhc3RJbmRleCArIDFcciAgICAgICAgICAgIH0pO1xyICAgICAgICB9KTtcclxyICAgICAgICBuZXcgTm90aWZpY2F0aW9ucyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSk7XHJcciAgICAgICAgbmV3IFRvcE1lbnVWaWV3KHtcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxyICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMuY2FudmFzVmlldyA9IG5ldyBHYW50dENoYXJ0Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnJlbmRlcigpO1xyICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Ll91cGRhdGVTdGFnZUF0dHJzKCk7XHIgICAgICAgICAgICAvLyBzZXQgc2lkZSB0YXNrcyBwYW5lbCBoZWlnaHRcciAgICAgICAgICAgIHZhciAkc2lkZVBhbmVsID0gJCgnLm1lbnUtY29udGFpbmVyJyk7XHIgICAgICAgICAgICAkc2lkZVBhbmVsLmNzcyh7XHIgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiB3aW5kb3cuaW5uZXJIZWlnaHQgLSAkc2lkZVBhbmVsLm9mZnNldCgpLnRvcFxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNTAwKTtcclxyXHIgICAgICAgIHZhciB0YXNrc0NvbnRhaW5lciA9ICQoJy50YXNrcycpLmdldCgwKTtcciAgICAgICAgUmVhY3QucmVuZGVyKFxyICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXHIgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KClcciAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgKTtcclxyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0YXNrc0NvbnRhaW5lcik7XHIgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcciAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KClcciAgICAgICAgICAgICAgICB9KSxcciAgICAgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICAgICAgKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLDUpKTtcclxyICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKCkgPT4ge1xyICAgICAgICAgICAgdmFyIHkgPSBNYXRoLm1heCgwLCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCB3aW5kb3cuc2Nyb2xsWSk7XHIgICAgICAgICAgICAkKCcubWVudS1oZWFkZXInKS5jc3Moe1xyICAgICAgICAgICAgICAgIG1hcmdpblRvcDogKHkpICsgJ3B4J1xyICAgICAgICAgICAgfSk7XHIgICAgICAgICAgICAkKCcudGFza3MnKS5jc3Moe1xyICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJy0nICsgeSArICdweCdcciAgICAgICAgICAgIH0pO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIGV2ZW50czoge1xyICAgICAgICAnY2xpY2sgI3RIYW5kbGUnOiAnZXhwYW5kJyxcciAgICAgICAgJ2NsaWNrICNkZWxldGVBbGwnOiAnZGVsZXRlQWxsJ1xyICAgIH0sXHIgICAgY2FsY3VsYXRlRHVyYXRpb246IGZ1bmN0aW9uKCl7XHJcciAgICAgICAgLy8gQ2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uIGZyb20gc3RhcnQgYW5kIGVuZCBkYXRlXHIgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIF9NU19QRVJfREFZID0gMTAwMCAqIDYwICogNjAgKiAyNDtcciAgICAgICAgaWYoc3RhcnRkYXRlICE9PSBcIlwiICYmIGVuZGRhdGUgIT09IFwiXCIpe1xyICAgICAgICAgICAgdmFyIHV0YzEgPSBEYXRlLlVUQyhzdGFydGRhdGUuZ2V0RnVsbFllYXIoKSwgc3RhcnRkYXRlLmdldE1vbnRoKCksIHN0YXJ0ZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHIgICAgICAgIH1lbHNle1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoMCkpO1xyICAgICAgICB9XHIgICAgfSxcciAgICBleHBhbmQ6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgYnV0dG9uID0gJChldnQudGFyZ2V0KTtcciAgICAgICAgaWYgKGJ1dHRvbi5oYXNDbGFzcygnY29udHJhY3QnKSkge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICB9XHIgICAgICAgIGVsc2Uge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICB9XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICB9LmJpbmQodGhpcyksIDYwMCk7XHIgICAgICAgIGJ1dHRvbi50b2dnbGVDbGFzcygnY29udHJhY3QnKTtcciAgICB9LFxyICAgIF9tb3ZlQ2FudmFzVmlldzogZnVuY3Rpb24oKSB7XHIgICAgICAgIHZhciBzaWRlQmFyV2lkdGggPSAkKCcubWVudS1jb250YWluZXInKS53aWR0aCgpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuc2V0TGVmdFBhZGRpbmcoc2lkZUJhcldpZHRoKTtcciAgICB9LFxyICAgIGRlbGV0ZUFsbDogZnVuY3Rpb24oKSB7XHIgICAgICAgICQoJyNjb25maXJtJykubW9kYWwoe1xyICAgICAgICAgICAgb25IaWRkZW46IGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHIgICAgICAgICAgICB9LFxyICAgICAgICAgICAgb25BcHByb3ZlOiBmdW5jdGlvbigpIHtcciAgICAgICAgICAgICAgICB3aGlsZSh0aGlzLmNvbGxlY3Rpb24uYXQoMCkpIHtcciAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmF0KDApLmRlc3Ryb3koKTtcciAgICAgICAgICAgICAgICB9XHIgICAgICAgICAgICB9LmJpbmQodGhpcylcciAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBHYW50dFZpZXc7XHIiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgTW9kYWxUYXNrRWRpdENvbXBvbmVudCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNlZGl0VGFzaycsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLiRlbC5maW5kKCcudWkuY2hlY2tib3gnKS5jaGVja2JveCgpO1xyXG4gICAgICAgIC8vIHNldHVwIHZhbHVlcyBmb3Igc2VsZWN0b3JzXHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZVNlbGVjdHMoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnRhYnVsYXIubWVudSAuaXRlbScpLnRhYigpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGFydFwiXSwgW25hbWU9XCJlbmRcIl0nKS5kYXRlcGlja2VyKHtcclxuLy8gICAgICAgICAgICBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCJcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2ZpbGxEYXRhKCk7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRlbC5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbklucHV0cygpO1xyXG5cclxuICAgIH0sXHJcbiAgICBfbGlzdGVuSW5wdXRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyICRtaWxlc3RvbmUgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIm1pbGVzdG9uZVwiXScpO1xyXG4gICAgICAgIHZhciAkZGVsaXZlcmFibGUgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImRlbGl2ZXJhYmxlXCJdJyk7XHJcbiAgICAgICAgdmFyICRzdGFydCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0nKTtcclxuICAgICAgICB2YXIgJGVuZCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiZW5kXCJdJyk7XHJcbiAgICAgICAgJG1pbGVzdG9uZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSAkbWlsZXN0b25lLnByb3AoJ2NoZWNrZWQnKTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgJHN0YXJ0LnZhbCgkZW5kLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICRkZWxpdmVyYWJsZS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGRlbGl2ZXJhYmxlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRkZWxpdmVyYWJsZS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICRtaWxlc3RvbmUucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlU2VsZWN0cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGF0dXNTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXR1c1wiXScpO1xyXG4gICAgICAgIHN0YXR1c1NlbGVjdC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oaSwgY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoY2hpbGQudGV4dCk7XHJcbiAgICAgICAgICAgICQoY2hpbGQpLnByb3AoJ3ZhbHVlJywgaWQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciBoZWFsdGhTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImhlYWx0aFwiXScpO1xyXG4gICAgICAgIGhlYWx0aFNlbGVjdC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oaSwgY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoSWQoY2hpbGQudGV4dCk7XHJcbiAgICAgICAgICAgICQoY2hpbGQpLnByb3AoJ3ZhbHVlJywgaWQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciB3b3JrT3JkZXJTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIndvXCJdJyk7XHJcbiAgICAgICAgd29ya09yZGVyU2VsZWN0LmVtcHR5KCk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgJCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBkYXRhLklEICsgJ1wiPicgKyBkYXRhLldPTnVtYmVyICsgJzwvb3B0aW9uPicpLmFwcGVuZFRvKHdvcmtPcmRlclNlbGVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2ZpbGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXR1cycgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0ZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0U3RhdHVzSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaGVhbHRoJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRIZWFsdGhJZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd3bycgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZFdPRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRXT0lkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGVTdHIgPSAkLmRhdGVwaWNrZXIuZm9ybWF0RGF0ZSh0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKSwgdmFsKTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmdldCgwKS52YWx1ZSA9IGRhdGVTdHI7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0LnByb3AoJ3R5cGUnKSA9PT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQucHJvcCgnY2hlY2tlZCcsIHZhbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIm1pbGVzdG9uZVwiXScpLnBhcmVudCgpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IGlucHV0LnZhbCgpLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBuZXcgRGF0ZSh2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0LnByb3AoJ3R5cGUnKSA9PT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC5wcm9wKCdjaGVja2VkJykpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC52YWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLm1vZGVsLnNhdmUoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsVGFza0VkaXRDb21wb25lbnQ7XHJcbiIsInZhciBOb3RpZmljYXRpb25zID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnZXJyb3InLCBfLmRlYm91bmNlKHRoaXMub25FcnJvciwgMTApKTtcclxuICAgIH0sXHJcbiAgICBvbkVycm9yIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihhcmd1bWVudHMpO1xyXG4gICAgICAgIG5vdHkoe1xyXG4gICAgICAgICAgICB0ZXh0OiAnRXJyb3Igd2hpbGUgc2F2aW5nIHRhc2ssIHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciwgcmVxdWVzdCBzdXBwb3J0IGlmIHRoaXMgZXJyb3IgY29udGludWVzLicsXHJcbiAgICAgICAgICAgIGxheW91dCA6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgIHR5cGUgOiAnZXJyb3InXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb25zO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgUmVzb3VyY2VFZGl0b3JWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgdmFyIHN0YWdlUG9zID0gJCgnI2dhbnR0LWNvbnRhaW5lcicpLm9mZnNldCgpO1xyXG4gICAgICAgIHZhciBmYWtlRWwgPSAkKCc8ZGl2PicpLmFwcGVuZFRvKCdib2R5Jyk7XHJcbiAgICAgICAgZmFrZUVsLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgdG9wIDogcG9zLnkgKyBzdGFnZVBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICBsZWZ0IDogcG9zLnggKyBzdGFnZVBvcy5sZWZ0ICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnBvcHVwID0gJCgnLmN1c3RvbS5wb3B1cCcpO1xyXG4gICAgICAgIGZha2VFbC5wb3B1cCh7XHJcbiAgICAgICAgICAgIHBvcHVwIDogdGhpcy5wb3B1cCxcclxuICAgICAgICAgICAgb24gOiAnaG92ZXInLFxyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdib3R0b20gbGVmdCcsXHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cC5vZmYoJy5lZGl0b3InKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkucG9wdXAoJ3Nob3cnKTtcclxuXHJcbiAgICAgICAgdGhpcy5fYWRkUmVzb3VyY2VzKCk7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCcuYnV0dG9uJykub24oJ2NsaWNrLmVkaXRvcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVwLnBvcHVwKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAub2ZmKCcuZWRpdG9yJyk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZnVsbERhdGEoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkUmVzb3VyY2VzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5lbXB0eSgpO1xyXG4gICAgICAgIHZhciBodG1sU3RyaW5nID0gJyc7XHJcbiAgICAgICAgKHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMucmVzb3VyY2VkYXRhIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIGh0bWxTdHJpbmcgKz0gJzxkaXYgY2xhc3M9XCJ1aSBjaGVja2JveFwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgIG5hbWU9XCInICsgcmVzb3VyY2UuVXNlcklkICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8bGFiZWw+JyArIHJlc291cmNlLlVzZXJuYW1lICsgJzwvbGFiZWw+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PGJyPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaHRtbFN0cmluZyArPSc8YnI+PGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxkaXYgY2xhc3M9XCJ1aSBwb3NpdGl2ZSByaWdodCBidXR0b24gc2F2ZSB0aW55XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnQ2xvc2UnICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5hcHBlbmQoaHRtbFN0cmluZyk7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCcudWkuY2hlY2tib3gnKS5jaGVja2JveCgpO1xyXG4gICAgfSxcclxuICAgIF9mdWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwb3B1cCA9IHRoaXMucG9wdXA7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5nZXQoJ3Jlc291cmNlcycpLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgcG9wdXAuZmluZCgnW25hbWU9XCInICsgcmVzb3VyY2UgKyAnXCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zYXZlRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBvcHVwLmZpbmQoJ2lucHV0JykuZWFjaChmdW5jdGlvbihpLCBpbnB1dCkge1xyXG4gICAgICAgICAgICB2YXIgJGlucHV0ID0gJChpbnB1dCk7XHJcbiAgICAgICAgICAgIGlmICgkaW5wdXQucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZXMucHVzaCgkaW5wdXQuYXR0cignbmFtZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ3Jlc291cmNlcycsIHJlc291cmNlcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZUVkaXRvclZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEZpbHRlclZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZmlsdGVyLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjaGFuZ2UgI2hpZ2h0bGlnaHRzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBoaWdodGxpZ2h0VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmIChoaWdodGxpZ2h0VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB0aGlzLmNvbG9yc1tlLnRhcmdldC52YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NoYW5nZSAjZmlsdGVycy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgY3JpdGVyaWEgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKGNyaXRlcmlhID09PSAncmVzZXQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaG93VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNob3cgYWxsIHBhcmVudHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRhc2sucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29sb3JzIDoge1xyXG4gICAgICAgICdzdGF0dXMtYmFja2xvZycgOiAnI0QyRDJEOScsXHJcbiAgICAgICAgJ3N0YXR1cy1yZWFkeScgOiAnI0IyRDFGMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1pbiBwcm9ncmVzcycgOiAnIzY2QTNFMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1jb21wbGV0ZScgOiAnIzk5QzI5OScsXHJcbiAgICAgICAgJ2xhdGUnIDogJyNGRkIyQjInLFxyXG4gICAgICAgICdkdWUnIDogJyAjRkZDMjk5JyxcclxuICAgICAgICAnbWlsZXN0b25lJyA6ICcjRDZDMkZGJyxcclxuICAgICAgICAnZGVsaXZlcmFibGUnIDogJyNFMEQxQzInLFxyXG4gICAgICAgICdmaW5hbmNpYWwnIDogJyNGMEUwQjInLFxyXG4gICAgICAgICd0aW1lc2hlZXRzJyA6ICcjQzJDMkIyJyxcclxuICAgICAgICAncmVwb3J0YWJsZScgOiAnICNFMEMyQzInLFxyXG4gICAgICAgICdoZWFsdGgtcmVkJyA6ICdyZWQnLFxyXG4gICAgICAgICdoZWFsdGgtYW1iZXInIDogJyNGRkJGMDAnLFxyXG4gICAgICAgICdoZWFsdGgtZ3JlZW4nIDogJ2dyZWVuJ1xyXG4gICAgfSxcclxuICAgIF9nZXRNb2RlbHNGb3JDcml0ZXJpYSA6IGZ1bmN0aW9uKGNyZXRlcmlhKSB7XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAncmVzZXRzJykge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdzdGF0dXMnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXR1cyA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAodGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoc3RhdHVzKSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdzdGF0dXMnKS50b1N0cmluZygpID09PSBpZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2xhdGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnZHVlJykge1xyXG4gICAgICAgICAgICB2YXIgbGFzdERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICBsYXN0RGF0ZS5hZGRXZWVrcygyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA+IG5ldyBEYXRlKCkgJiYgdGFzay5nZXQoJ2VuZCcpIDwgbGFzdERhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoWydtaWxlc3RvbmUnLCAnZGVsaXZlcmFibGUnLCAnZmluYW5jaWFsJywgJ3RpbWVzaGVldHMnLCAncmVwb3J0YWJsZSddLmluZGV4T2YoY3JldGVyaWEpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoY3JldGVyaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ2hlYWx0aCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGhJZCA9ICh0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChoZWFsdGgpIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2hlYWx0aCcpLnRvU3RyaW5nKCkgPT09IGhlYWx0aElkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsdGVyVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNncm91cGluZy1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3RvcC1leHBhbmQtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI3RvcC1jb2xsYXBzZS1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwaW5nTWVudVZpZXc7XHJcbiIsInZhciBwYXJzZVhNTCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3htbFdvcmtlcicpLnBhcnNlWE1MT2JqO1xyXG52YXIgdGFza3NUb1hNTCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3htbFdvcmtlcicpLnRhc2tzVG9YTUw7XHJcbnZhciBwYXJzZURlcHNGcm9tWE1MID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMveG1sV29ya2VyJykucGFyc2VEZXBzRnJvbVhNTDtcclxuXHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI3Byb2plY3QtbWVudScsXHJcblxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmltcG9ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3NldHVwSW5wdXQoKTtcclxuICAgIH0sXHJcbiAgICBfc2V0dXBJbnB1dDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGlucHV0ID0gJCgnI2ltcG9ydEZpbGUnKTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgICAgICB2YXIgZmlsZXMgPSBldnQudGFyZ2V0LmZpbGVzO1xyXG4gICAgICAgICAgICBfLmVhY2goZmlsZXMsIGZ1bmN0aW9uKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IGZpbGUubmFtZS5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGV4dGVudGlvbiA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW50aW9uICE9PSAneG1sJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdUaGUgZmlsZSB0eXBlIFwiJyArIGV4dGVudGlvbiArICdcIiBpcyBub3Qgc3VwcG9ydGVkLiBPbmx5IHhtbCBmaWxlcyBhcmUgYWxsb3dlZC4gUGxlYXNlIHNhdmUgeW91ciBNUyBwcm9qZWN0IGFzIGEgeG1sIGZpbGUgYW5kIHRyeSBhZ2Fpbi4nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi54bWxEYXRhID0gZS50YXJnZXQucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ0Vycm9yIHdoaWxlIHBhcmluZyBmaWxlLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgICAgJ2NsaWNrICN1cGxvYWQtcHJvamVjdCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI21zaW1wb3J0JykubW9kYWwoe1xyXG4gICAgICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy54bWxEYXRhIHx8IHRoaXMuaW1wb3J0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjaW1wb3J0UHJvZ3Jlc3NcIikuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjaW1wb3J0RmlsZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjeG1saW5wdXQtZm9ybScpLnRyaWdnZXIoJ3Jlc2V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLmltcG9ydERhdGEuYmluZCh0aGlzKSwgMjApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAkKFwiI2ltcG9ydFByb2dyZXNzXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNpbXBvcnRGaWxlXCIpLnNob3coKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjbGljayAjZG93bmxvYWQtcHJvamVjdCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0YXNrc1RvWE1MKHRoaXMuY29sbGVjdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBibG9iID0gbmV3IEJsb2IoW2RhdGFdLCB7dHlwZSA6ICdhcHBsaWNhdGlvbi9qc29uJ30pO1xyXG4gICAgICAgICAgICBzYXZlQXMoYmxvYiwgJ0dhbnR0VGFza3MueG1sJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHByb2dyZXNzIDogZnVuY3Rpb24ocGVyY2VudCkge1xyXG4gICAgICAgICQoJyNpbXBvcnRQcm9ncmVzcycpLnByb2dyZXNzKHtcclxuICAgICAgICAgICAgcGVyY2VudCA6IHBlcmNlbnRcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZURhdGEgOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgdmFyIGRlZlN0YXR1cyA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRTdGF0dXNJZCgpO1xyXG4gICAgICAgIHZhciBkZWZIZWFsdGggPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICB2YXIgZGVmV08gPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0V09JZCgpO1xyXG4gICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uaGVhbHRoID0gZGVmSGVhbHRoO1xyXG4gICAgICAgICAgICBpdGVtLnN0YXR1cyA9IGRlZlN0YXR1cztcclxuICAgICAgICAgICAgaXRlbS53byA9IGRlZldPO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfSxcclxuICAgIGltcG9ydERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZGVsYXkgPSAxMDA7XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzcygwKTtcclxuICAgICAgICAvLyB0aGlzIGlzIHNvbWUgc29ydCBvZiBjYWxsYmFjayBoZWxsISFcclxuICAgICAgICAvLyB3ZSBuZWVkIHRpbWVvdXRzIGZvciBiZXR0ZXIgdXNlciBleHBlcmllbmNlXHJcbiAgICAgICAgLy8gSSB0aGluayB1c2VyIHdhbnQgdG8gc2VlIGFuaW1hdGVkIHByb2dyZXNzIGJhclxyXG4gICAgICAgIC8vIGJ1dCB3aXRob3V0IHRpbWVvdXRzIGl0IGlzIG5vdCBwb3NzaWJsZSwgcmlnaHQ/XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygxMCk7XHJcbiAgICAgICAgICAgIHZhciBjb2wgPSB0aGlzLmNvbGxlY3Rpb247XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gcGFyc2VYTUwodGhpcy54bWxEYXRhKTtcclxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX3ByZXBhcmVEYXRhKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoMjYpO1xyXG4gICAgICAgICAgICAgICAgY29sLmltcG9ydFRhc2tzKGRhdGEsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoNDMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoNTkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVwcyA9IHBhcnNlRGVwc0Zyb21YTUwodGhpcy54bWxEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoNzgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sLmNyZWF0ZURlcHMoZGVwcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltcG9ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNtc2ltcG9ydCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNU1Byb2plY3RNZW51VmlldztcclxuIiwidmFyIFJlcG9ydHNNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI3JlcG9ydHMtbWVudScsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50czoge1xyXG4gICAgICAgICdjbGljayAjcHJpbnQnOiAnZ2VuZXJhdGVQREYnLFxyXG4gICAgICAgICdjbGljayAjc2hvd1ZpZGVvJzogJ3Nob3dIZWxwJ1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUERGOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB3aW5kb3cucHJpbnQoKTtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcbiAgICBzaG93SGVscDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI3Nob3dWaWRlb01vZGFsJykubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkFwcHJvdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRzTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgWm9vbU1lbnVWaWV3ID0gcmVxdWlyZSgnLi9ab29tTWVudVZpZXcnKTtcclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSByZXF1aXJlKCcuL0dyb3VwaW5nTWVudVZpZXcnKTtcclxudmFyIEZpbHRlck1lbnVWaWV3ID0gcmVxdWlyZSgnLi9GaWx0ZXJNZW51VmlldycpO1xyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSByZXF1aXJlKCcuL01TUHJvamVjdE1lbnVWaWV3Jyk7XHJcbnZhciBNaXNjTWVudVZpZXcgPSByZXF1aXJlKCcuL01pc2NNZW51VmlldycpO1xyXG5cclxudmFyIFRvcE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIG5ldyBab29tTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgR3JvdXBpbmdNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBGaWx0ZXJNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNU1Byb2plY3RNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNaXNjTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvcE1lbnVWaWV3O1xyXG4iLCJ2YXIgWm9vbU1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjem9vbS1tZW51JyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5faGlnaHRsaWdodFNlbGVjdGVkKCk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgICAgJ2NsaWNrIC5hY3Rpb24nOiAnb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQnXHJcbiAgICB9LFxyXG4gICAgb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQ6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSAkKGV2dC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBidXR0b24uZGF0YSgnaW50ZXJ2YWwnKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnNldCgnaW50ZXJ2YWwnLCBpbnRlcnZhbCk7XHJcbiAgICAgICAgdGhpcy5faGlnaHRsaWdodFNlbGVjdGVkKCk7XHJcbiAgICB9LFxyXG4gICAgX2hpZ2h0bGlnaHRTZWxlY3RlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy4kKCcuYWN0aW9uJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblxyXG4gICAgICAgIGxldCBpbnRlcnZhbCA9IHRoaXMuc2V0dGluZ3MuZ2V0KCdpbnRlcnZhbCcpO1xyXG4gICAgICAgIHRoaXMuJCgnW2RhdGEtaW50ZXJ2YWw9XCInICsgaW50ZXJ2YWwgKyAnXCJdJykuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBab29tTWVudVZpZXc7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIEFsb25lVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfYm9yZGVyV2lkdGggOiAzLFxyXG4gICAgX2NvbG9yIDogJyNFNkYwRkYnLFxyXG4gICAgZXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmV2ZW50cygpLCB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAubGVmdEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLnJpZ2h0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcblxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAubGVmdEJvcmRlcicgOiAncmVuZGVyJyxcclxuICAgICAgICAgICAgJ2RyYWdlbmQgLnJpZ2h0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAubGVmdEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLmxlZnRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAucmlnaHRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5yaWdodEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZSdcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1pbihsb2NhbFgsIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5tYXgobG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3Jlc2l6ZVBvaW50ZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xyXG4gICAgfSxcclxuICAgIF9jaGFuZ2VTaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxlZnRYID0gdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKTtcclxuICAgICAgICB2YXIgcmlnaHRYID0gdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkgKyB0aGlzLl9ib3JkZXJXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHJlY3Qud2lkdGgocmlnaHRYIC0gbGVmdFgpO1xyXG4gICAgICAgIHJlY3QueChsZWZ0WCk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB2YXIgY29tcGxldGVSZWN0ID0gdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF07XHJcbiAgICAgICAgY29tcGxldGVSZWN0LngobGVmdFgpO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHJpZ2h0WCk7XHJcbiAgICAgICAgdmFyIHJlc291cmNlcyA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpWzBdO1xyXG4gICAgICAgIHJlc291cmNlcy54KHJpZ2h0WCArIHRoaXMuX3Rvb2xiYXJPZmZzZXQpO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSAtIHRoaXMuX2JvcmRlcldpZHRoKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ21pbGVzdG9uZScpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmRpYW1vbmQnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JykuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJykuaGlkZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmRpYW1vbmQnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLm1haW5SZWN0Jykuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJykuc2hvdygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsb25lVGFza1ZpZXc7XHJcbiIsIlxudmFyIFJlc291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi4vUmVzb3VyY2VzRWRpdG9yJyk7XG5cbnZhciBsaW5rSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbmxpbmtJbWFnZS5zcmMgPSAnY3NzL2ltYWdlcy9saW5rLnBuZyc7XG5cbnZhciB1c2VySW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbnVzZXJJbWFnZS5zcmMgPSAnY3NzL2ltYWdlcy91c2VyLnBuZyc7XG5cbnZhciBCYXNpY1Rhc2tWaWV3ID0gQmFja2JvbmUuS29udmFWaWV3LmV4dGVuZCh7XG4gICAgX2Z1bGxIZWlnaHQ6IDIxLFxuICAgIF90b3BQYWRkaW5nOiAzLFxuICAgIF9iYXJIZWlnaHQ6IDE1LFxuICAgIF9jb21wbGV0ZUNvbG9yOiAnIzc3QTREMicsXG4gICAgX3Rvb2xiYXJPZmZzZXQ6IDIwLFxuICAgIF9yZXNvdXJjZUxpc3RPZmZzZXQ6IDIwLFxuICAgIF9taWxlc3RvbmVDb2xvcjogJyMzMzY2OTknLFxuICAgIF9taWxlc3RvbmVPZmZzZXQ6IDAsXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5fZnVsbEhlaWdodDtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xuICAgIH0sXG4gICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICdkcmFnbW92ZSc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQubm9kZVR5cGUgIT09ICdHcm91cCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdkcmFnZW5kJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlV2l0aENoaWxkcmVuKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnbW91c2VlbnRlcic6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93VG9vbHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlUmVzb3VyY2VzTGlzdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2dyYWJQb2ludGVyKGUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdtb3VzZWxlYXZlJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVRvb2xzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd1Jlc291cmNlc0xpc3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0TW91c2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnZHJhZ3N0YXJ0IC5kZXBlbmRlbmN5VG9vbCc6ICdfc3RhcnRDb25uZWN0aW5nJyxcbiAgICAgICAgICAgICdkcmFnbW92ZSAuZGVwZW5kZW5jeVRvb2wnOiAnX21vdmVDb25uZWN0JyxcbiAgICAgICAgICAgICdkcmFnZW5kIC5kZXBlbmRlbmN5VG9vbCc6ICdfY3JlYXRlRGVwZW5kZW5jeScsXG4gICAgICAgICAgICAnY2xpY2sgLnJlc291cmNlcyc6ICdfZWRpdFJlc291cmNlcycsXG4gICAgICAgICAgICAnY2xpY2sgLmRlbGV0ZURlcHMnOiAnX2RlbGV0ZURlcHMnXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLb252YS5Hcm91cCh7XG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5feVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBpZDogdGhpcy5tb2RlbC5jaWQsXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBmYWtlQmFja2dyb3VuZCA9IG5ldyBLb252YS5SZWN0KHtcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2JhckhlaWdodCxcbiAgICAgICAgICAgIG5hbWU6ICdmYWtlQmFja2dyb3VuZCdcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtvbnZhLlJlY3Qoe1xuICAgICAgICAgICAgZmlsbDogdGhpcy5fY29sb3IsXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9iYXJIZWlnaHQsXG4gICAgICAgICAgICBuYW1lOiAnbWFpblJlY3QnXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZGlhbW9uZCA9IG5ldyBLb252YS5SZWN0KHtcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuX21pbGVzdG9uZUNvbG9yLFxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCAvIDIsXG4gICAgICAgICAgICB4OiB0aGlzLl9iYXJIZWlnaHQgLyAyLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9iYXJIZWlnaHQgKiAwLjgsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5fYmFySGVpZ2h0ICogMC44LFxuICAgICAgICAgICAgb2Zmc2V0WDogdGhpcy5fYmFySGVpZ2h0ICogMC44IC8gMixcbiAgICAgICAgICAgIG9mZnNldFk6IHRoaXMuX2JhckhlaWdodCAqIDAuOCAvIDIsXG4gICAgICAgICAgICBuYW1lOiAnZGlhbW9uZCcsXG4gICAgICAgICAgICByb3RhdGlvbjogNDUsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLb252YS5SZWN0KHtcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9iYXJIZWlnaHQsXG4gICAgICAgICAgICBuYW1lOiAnY29tcGxldGVSZWN0J1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgaG9yT2Zmc2V0ID0gNjtcbiAgICAgICAgdmFyIGFyYyA9IG5ldyBLb252YS5TaGFwZSh7XG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxuICAgICAgICAgICAgZmlsbDogJ2xpZ2h0Z3JlZW4nLFxuICAgICAgICAgICAgc2NlbmVGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSBzZWxmLl9iYXJIZWlnaHQgKyAoc2VsZi5fYm9yZGVyU2l6ZSB8fCAwKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKDAsIDApO1xuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGhvck9mZnNldCwgMCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoaG9yT2Zmc2V0LCBzaXplIC8gMiwgc2l6ZSAvIDIsIC1NYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIHNpemUpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIDApO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFNoYXBlKHRoaXMpO1xuICAgICAgICAgICAgICAgIHZhciBpbWdTaXplID0gc2l6ZSAtIDQ7XG4gICAgICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UobGlua0ltYWdlLCAxLCAoc2l6ZSAtIGltZ1NpemUpIC8gMiwgaW1nU2l6ZSwgaW1nU2l6ZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGl0RnVuYzogZnVuY3Rpb24oY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5yZWN0KDAsIDAsIDYgKyBzZWxmLl9iYXJIZWlnaHQsIHNlbGYuX2JhckhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU2hhcGUodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmFtZTogJ2RlcGVuZGVuY3lUb29sJyxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB0b29sYmFyID0gbmV3IEtvbnZhLkdyb3VwKHtcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXG4gICAgICAgICAgICBuYW1lOiAncmVzb3VyY2VzJyxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBkZWxldGVEZXBzID0gbmV3IEtvbnZhLkdyb3VwKHtcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXG4gICAgICAgICAgICB4OiAtdGhpcy5fYmFySGVpZ2h0LFxuICAgICAgICAgICAgbmFtZTogJ2RlbGV0ZURlcHMnLFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIGRlbGV0ZURlcHMuYWRkKG5ldyBLb252YS5SZWN0KHtcbiAgICAgICAgICAgIGZpbGw6ICdyZWQnLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2JhckhlaWdodCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5fYmFySGVpZ2h0XG4gICAgICAgIH0pKTtcbiAgICAgICAgZGVsZXRlRGVwcy5hZGQobmV3IEtvbnZhLlRleHQoe1xuICAgICAgICAgICAgdGV4dDogJ1gnLFxuICAgICAgICAgICAgZmlsbDogJ3doaXRlJyxcbiAgICAgICAgICAgIHg6IDMsXG4gICAgICAgICAgICBmb250U2l6ZTogdGhpcy5fYmFySGVpZ2h0XG4gICAgICAgIH0pKTtcblxuICAgICAgICB2YXIgc2l6ZSA9IHNlbGYuX2JhckhlaWdodCArIChzZWxmLl9ib3JkZXJTaXplIHx8IDApO1xuICAgICAgICB2YXIgdG9vbGJhY2sgPSBuZXcgS29udmEuUmVjdCh7XG4gICAgICAgICAgICBmaWxsOiAnbGlnaHRncmV5JyxcbiAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgICAgaGVpZ2h0OiBzaXplLFxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB1c2VySW0gPSBuZXcgS29udmEuSW1hZ2Uoe1xuICAgICAgICAgICAgaW1hZ2U6IHVzZXJJbWFnZSxcbiAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgICAgaGVpZ2h0OiBzaXplXG4gICAgICAgIH0pO1xuICAgICAgICB0b29sYmFyLmFkZCh0b29sYmFjaywgdXNlckltKTtcblxuICAgICAgICB2YXIgcmVzb3VyY2VMaXN0ID0gbmV3IEtvbnZhLlRleHQoe1xuICAgICAgICAgICAgbmFtZTogJ3Jlc291cmNlTGlzdCcsXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxuICAgICAgICAgICAgbGlzdGVuaW5nOiBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICBncm91cC5hZGQoZmFrZUJhY2tncm91bmQsIGRpYW1vbmQsIHJlY3QsIGNvbXBsZXRlUmVjdCwgYXJjLCB0b29sYmFyLCByZXNvdXJjZUxpc3QsIGRlbGV0ZURlcHMpO1xuICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgfSxcbiAgICBfZWRpdFJlc291cmNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2aWV3ID0gbmV3IFJlc291cmNlRWRpdG9yKHtcbiAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLmVsLmdldFN0YWdlKCkuZ2V0UG9pbnRlclBvc2l0aW9uKCk7XG4gICAgICAgIHZpZXcucmVuZGVyKHBvcyk7XG4gICAgfSxcbiAgICBfZGVsZXRlRGVwczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubW9kZWwuY2xlYXJEZXBlbmRlbmNlKCk7XG4gICAgfSxcbiAgICBfdXBkYXRlRGF0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XG5cbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGgucm91bmQoeCAvIGRheXNXaWR0aCksIGRheXMyID0gTWF0aC5yb3VuZCgoeCArIGxlbmd0aCkgLyBkYXlzV2lkdGgpO1xuXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHtcbiAgICAgICAgICAgIHN0YXJ0OiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpLFxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9zaG93VG9vbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpLnNob3coKTtcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJykuc2hvdygpO1xuICAgICAgICBpZiAodGhpcy5tb2RlbC5oYXNEZXBzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmRlbGV0ZURlcHMnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xuICAgIH0sXG4gICAgX2hpZGVUb29sczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJykuaGlkZSgpO1xuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKS5oaWRlKCk7XG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlbGV0ZURlcHMnKS5oaWRlKCk7XG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcbiAgICB9LFxuICAgIF9zaG93UmVzb3VyY2VzTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpLnNob3coKTtcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xuICAgIH0sXG4gICAgX2hpZGVSZXNvdXJjZXNMaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0JykuaGlkZSgpO1xuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XG4gICAgfSxcbiAgICBfZ3JhYlBvaW50ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBlLnRhcmdldC5uYW1lKCk7XG4gICAgICAgIGlmICgobmFtZSA9PT0gJ21haW5SZWN0JykgfHwgKG5hbWUgPT09ICdkZXBlbmRlbmN5VG9vbCcpIHx8XG4gICAgICAgICAgICAobmFtZSA9PT0gJ2NvbXBsZXRlUmVjdCcpIHx8IChlLnRhcmdldC5nZXRQYXJlbnQoKS5uYW1lKCkgPT09ICdyZXNvdXJjZXMnKSkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9kZWZhdWx0TW91c2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgICB9LFxuICAgIF9zdGFydENvbm5lY3Rpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcbiAgICAgICAgdG9vbC5oaWRlKCk7XG4gICAgICAgIHZhciBwb3MgPSB0b29sLmdldEFic29sdXRlUG9zaXRpb24oKTtcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IG5ldyBLb252YS5BcnJvdyh7XG4gICAgICAgICAgICBzdHJva2U6ICdkYXJrZ3JlZW4nLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXG4gICAgICAgICAgICBwb2ludGVyV2lkdGg6IDYsXG4gICAgICAgICAgICBwb2ludGVySGVpZ2h0OiAxMCxcbiAgICAgICAgICAgIGZpbGw6ICdncmV5JyxcbiAgICAgICAgICAgIHBvaW50czogW3Bvcy54IC0gc3RhZ2UueCgpLCBwb3MueSArIHRoaXMuX2JhckhlaWdodCAvIDIsIHBvcy54IC0gc3RhZ2UueCgpLCBwb3MueV0sXG4gICAgICAgICAgICBuYW1lOiAnY29ubmVjdG9yJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmFkZChjb25uZWN0b3IpO1xuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XG4gICAgfSxcbiAgICBfbW92ZUNvbm5lY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xuICAgICAgICB2YXIgcG9pbnRzID0gY29ubmVjdG9yLnBvaW50cygpO1xuICAgICAgICBwb2ludHNbMl0gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS54IC0gc3RhZ2UueCgpO1xuICAgICAgICBwb2ludHNbM10gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS55O1xuICAgICAgICBjb25uZWN0b3IucG9pbnRzKHBvaW50cyk7XG4gICAgfSxcbiAgICBfY3JlYXRlRGVwZW5kZW5jeTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XG4gICAgICAgIHZhciBlbCA9IHN0YWdlLmdldEludGVyc2VjdGlvbihzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKSk7XG4gICAgICAgIHZhciBncm91cCA9IGVsICYmIGVsLmdldFBhcmVudCgpO1xuICAgICAgICB2YXIgdGFza0lkID0gZ3JvdXAgJiYgZ3JvdXAuaWQoKTtcbiAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5tb2RlbDtcbiAgICAgICAgdmFyIGFmdGVyTW9kZWwgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZ2V0KHRhc2tJZCk7XG4gICAgICAgIGlmIChhZnRlck1vZGVsKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcmVtb3ZlRm9yID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVtb3ZlRm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLnJlbW92ZURlcGVuZGVuY3kocmVtb3ZlRm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9pbml0TW9kZWxFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCBjaGFuZ2U6Y29tcGxldGUgY2hhbmdlOnJlc291cmNlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRyYWdnaW5nID0gdGhpcy5lbC5pc0RyYWdnaW5nKCk7XG4gICAgICAgICAgICB0aGlzLmVsLmdldENoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZHJhZ2dpbmcgfHwgY2hpbGQuaXNEcmFnZ2luZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9jYWxjdWxhdGVYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4MTogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSAtIDEpICogZGF5c1dpZHRoLFxuICAgICAgICAgICAgeDI6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnZW5kJykpKSAqIGRheXNXaWR0aFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xuICAgICAgICAvLyBtb3ZlIGdyb3VwXG4gICAgICAgIHRoaXMuZWwueCh4LngxKTtcblxuICAgICAgICAvLyB1cGRhdGUgZmFrZSBiYWNrZ3JvdW5kIHJlY3QgcGFyYW1zXG4gICAgICAgIHZhciBiYWNrID0gdGhpcy5lbC5maW5kKCcuZmFrZUJhY2tncm91bmQnKVswXTtcbiAgICAgICAgYmFjay54KC0yMCk7XG4gICAgICAgIGJhY2sud2lkdGgoeC54MiAtIHgueDEgKyA2MCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIG1haW4gcmVjdCBwYXJhbXNcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xuICAgICAgICByZWN0LngoMCk7XG4gICAgICAgIHJlY3Qud2lkdGgoeC54MiAtIHgueDEpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ueCgwKTtcblxuICAgICAgICB2YXIgX21pbGVzdG9uZU9mZnNldCA9IDA7XG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnbWlsZXN0b25lJykpIHtcbiAgICAgICAgICAgIF9taWxlc3RvbmVPZmZzZXQgPSAxMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XG4gICAgICAgIHRvb2wueCh4LngyIC0geC54MSArIF9taWxlc3RvbmVPZmZzZXQpO1xuICAgICAgICB0b29sLnkodGhpcy5fdG9wUGFkZGluZyk7XG5cbiAgICAgICAgdmFyIHJlc291cmNlcyA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpWzBdO1xuICAgICAgICByZXNvdXJjZXMueCh4LngyIC0geC54MSArIHRoaXMuX3Rvb2xiYXJPZmZzZXQgKyBfbWlsZXN0b25lT2Zmc2V0KTtcbiAgICAgICAgcmVzb3VyY2VzLnkodGhpcy5fdG9wUGFkZGluZyk7XG5cblxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2UgbGlzdFxuICAgICAgICB2YXIgcmVzb3VyY2VMaXN0ID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0JylbMF07XG4gICAgICAgIHJlc291cmNlTGlzdC54KHgueDIgLSB4LngxICsgdGhpcy5fcmVzb3VyY2VMaXN0T2Zmc2V0ICsgX21pbGVzdG9uZU9mZnNldCk7XG4gICAgICAgIHJlc291cmNlTGlzdC55KHRoaXMuX3RvcFBhZGRpbmcgKyAyKTtcbiAgICAgICAgdmFyIG5hbWVzID0gW107XG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5tb2RlbC5nZXQoJ3Jlc291cmNlcycpO1xuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2VJZCkge1xuICAgICAgICAgICAgdmFyIHJlcyA9IF8uZmluZCgodGhpcy5zZXR0aW5ncy5zdGF0dXNlcy5yZXNvdXJjZWRhdGEgfHwgW10pLCBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIuVXNlcklkLnRvU3RyaW5nKCkgPT09IHJlc291cmNlSWQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChyZXMuVXNlcm5hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhbGlhc2VzID0gXy5tYXAocmVzLlVzZXJuYW1lLnNwbGl0KCcgJyksIGZ1bmN0aW9uKHN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0clswXTtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignJyk7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVzLnB1c2goYWxpYXNlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICByZXNvdXJjZUxpc3QudGV4dChuYW1lcy5qb2luKCcsICcpKTtcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHNldFk6IGZ1bmN0aW9uKHkpIHtcbiAgICAgICAgdGhpcy5feSA9IHk7XG4gICAgICAgIHRoaXMuZWwueSh5KTtcbiAgICB9LFxuICAgIGdldFk6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5feTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1Rhc2tWaWV3O1xuIiwidmFyIENvbm5lY3RvclZpZXcgPSBCYWNrYm9uZS5Lb252YVZpZXcuZXh0ZW5kKHtcclxuICAgIF9jb2xvcjogJ2dyZXknLFxyXG4gICAgX3dyb25nQ29sb3I6ICdyZWQnLFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5iZWZvcmVNb2RlbCA9IHBhcmFtcy5iZWZvcmVNb2RlbDtcclxuICAgICAgICB0aGlzLmFmdGVyTW9kZWwgPSBwYXJhbXMuYWZ0ZXJNb2RlbDtcclxuICAgICAgICB0aGlzLl95MSA9IDA7XHJcbiAgICAgICAgdGhpcy5feTIgPSAwO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRNb2RlbEV2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIGVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGluZSA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXHJcbiAgICAgICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICAgICAgcG9pbnRzOiBbMCwgMCwgMCwgMF1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGluZTtcclxuICAgIH0sXHJcbiAgICBzZXRZMTogZnVuY3Rpb24oeTEpIHtcclxuICAgICAgICB0aGlzLl95MSA9IHkxO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0WTI6IGZ1bmN0aW9uKHkyKSB7XHJcbiAgICAgICAgdGhpcy5feTIgPSB5MjtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgaWYgKHgueDIgPj0geC54MSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFt4LngxLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MiwgeC54MiwgdGhpcy5feTJdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl93cm9uZ0NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW1xyXG4gICAgICAgICAgICAgICAgeC54MSwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTIsXHJcbiAgICAgICAgICAgICAgICB4LngyLCB0aGlzLl95MlxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRNb2RlbEV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5hZnRlck1vZGVsLCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5hZnRlck1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkgKiBkYXlzV2lkdGgsXHJcbiAgICAgICAgICAgIHgyOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLmFmdGVyTW9kZWwuZ2V0KCdzdGFydCcpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3JWaWV3O1xyXG4iLCJ2YXIgTmVzdGVkVGFza1ZpZXcgPSByZXF1aXJlKCcuL05lc3RlZFRhc2tWaWV3Jyk7XG52YXIgQWxvbmVUYXNrVmlldyA9IHJlcXVpcmUoJy4vQWxvbmVUYXNrVmlldycpO1xudmFyIENvbm5lY3RvclZpZXcgPSByZXF1aXJlKCcuL0Nvbm5lY3RvclZpZXcnKTtcblxudmFyIEdhbnR0Q2hhcnRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIGVsOiAnI2dhbnR0LWNvbnRhaW5lcicsXG4gICAgX3RvcFBhZGRpbmc6IDczLFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzID0gW107XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gW107XG4gICAgICAgIHRoaXMuX2luaXRTdGFnZSgpO1xuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XG4gICAgICAgIHRoaXMuX2luaXRCYWNrZ3JvdW5kKCk7XG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xuICAgICAgICB0aGlzLl9pbml0U3ViVmlld3MoKTtcbiAgICAgICAgdGhpcy5faW5pdENvbGxlY3Rpb25FdmVudHMoKTtcbiAgICB9LFxuICAgIHNldExlZnRQYWRkaW5nOiBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICAgICAgdGhpcy5fbGVmdFBhZGRpbmcgPSBvZmZzZXQ7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcbiAgICB9LFxuICAgIF9pbml0U3RhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN0YWdlID0gbmV3IEtvbnZhLlN0YWdlKHtcbiAgICAgICAgICAgIGNvbnRhaW5lcjogdGhpcy5lbFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xuICAgIH0sXG4gICAgX2luaXRMYXllcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLkZsYXllciA9IG5ldyBLb252YS5MYXllcigpO1xuICAgICAgICB0aGlzLkJsYXllciA9IG5ldyBLb252YS5MYXllcigpO1xuICAgICAgICB0aGlzLlRvcEJhckxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkKHRoaXMuQmxheWVyLCB0aGlzLkZsYXllciwgdGhpcy5Ub3BCYXJMYXllcik7XG4gICAgfSxcbiAgICBfdXBkYXRlU3RhZ2VBdHRyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XG4gICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHByZXZpb3VzVGFza1ggPSB0aGlzLl90YXNrVmlld3MubGVuZ3RoID8gdGhpcy5fdGFza1ZpZXdzWzBdLmVsLngoKSA6IDA7XG4gICAgICAgIHRoaXMuc3RhZ2Uuc2V0QXR0cnMoe1xuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heCgkKCcudGFza3MnKS5pbm5lckhlaWdodCgpICsgdGhpcy5fdG9wUGFkZGluZywgd2luZG93LmlubmVySGVpZ2h0IC0gJCh0aGlzLnN0YWdlLmdldENvbnRhaW5lcigpKS5vZmZzZXQoKS50b3ApLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuJGVsLmlubmVyV2lkdGgoKSxcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmM6IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICAgICAgICAgIHZhciB4O1xuICAgICAgICAgICAgICAgIHZhciBtaW5YID0gLShsaW5lV2lkdGggLSB0aGlzLndpZHRoKCkpO1xuICAgICAgICAgICAgICAgIGlmIChwb3MueCA+IHNlbGYuX2xlZnRQYWRkaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBzZWxmLl9sZWZ0UGFkZGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvcy54IDwgbWluWCkge1xuICAgICAgICAgICAgICAgICAgICB4ID0gbWluWDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB4ID0gcG9zLng7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlbGYuZHJhZ2dlZFRvRGF5ID0gTWF0aC5hYnMoeCAtIHNlbGYuX2xlZnRQYWRkaW5nKSAvIHNlbGYuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLmRheXNXaWR0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fdGFza1ZpZXdzLmxlbmd0aCB8fCAhcHJldmlvdXNUYXNrWCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2UueCh0aGlzLl9sZWZ0UGFkZGluZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBtaW54ID0gLShsaW5lV2lkdGggLSB0aGlzLnN0YWdlLndpZHRoKCkpO1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy5fbGVmdFBhZGRpbmcgLSAodGhpcy5kcmFnZ2VkVG9EYXkgfHwgMCkgKiBzZWxmLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKS5kYXlzV2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZS54KE1hdGgubWF4KG1pbngsIHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRvZGF5TGluZSgpO1xuICAgICAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XG5cblxuICAgIH0sXG4gICAgX2luaXRCYWNrZ3JvdW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRvcEJhciA9IG5ldyBLb252YS5TaGFwZSh7XG4gICAgICAgICAgICBzY2VuZUZ1bmM6IHRoaXMuX2dldFRvcEJhclNjZW5lRnVuY3Rpb24oKSxcbiAgICAgICAgICAgIHN0cm9rZTogJ2xpZ2h0Z3JheScsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgICAgIGZpbGw6ICdyZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgbmFtZTogJ3RvcEJhcicsXG4gICAgICAgICAgICBoaXRHcmFwaEVuYWJsZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZ3JpZCA9IG5ldyBLb252YS5TaGFwZSh7XG4gICAgICAgICAgICBzY2VuZUZ1bmM6IHRoaXMuX2dldEdyaWRTY2VuZUZ1bmN0aW9uKCksXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgICAgICBmaWxsOiAncmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgIG5hbWU6ICdncmlkJyxcbiAgICAgICAgICAgIGhpdEdyYXBoRW5hYmxlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XG4gICAgICAgIHZhciB3aWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcbiAgICAgICAgdmFyIGJhY2sgPSBuZXcgS29udmEuUmVjdCh7XG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc3RhZ2UuaGVpZ2h0KCksXG4gICAgICAgICAgICB3aWR0aDogd2lkdGhcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBjdXJyZW50RGF5TGluZSA9IG5ldyBLb252YS5SZWN0KHtcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zdGFnZS5oZWlnaHQoKSxcbiAgICAgICAgICAgIHdpZHRoOiAyLFxuICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICBmaWxsOiAnZ3JlZW4nLFxuICAgICAgICAgICAgbGlzdGVuaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIG5hbWU6ICdjdXJyZW50RGF5TGluZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHtcbiAgICAgICAgICAgIHZhciB5ID0gTWF0aC5tYXgoMCwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgd2luZG93LnNjcm9sbFkpO1xuICAgICAgICAgICAgdG9wQmFyLnkoeSk7XG4gICAgICAgICAgICB0b3BCYXIuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5CbGF5ZXIuYWRkKGJhY2spLmFkZChjdXJyZW50RGF5TGluZSkuYWRkKGdyaWQpO1xuICAgICAgICB0aGlzLlRvcEJhckxheWVyLmFkZCh0b3BCYXIpO1xuICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcbiAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XG4gICAgfSxcbiAgICBfZ2V0VG9wQmFyU2NlbmVGdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNkaXNwbGF5ID0gdGhpcy5zZXR0aW5ncy5zZGlzcGxheTtcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcbiAgICAgICAgdmFyIG9mZnNldCA9IDE7XG4gICAgICAgIHZhciByb3dIZWlnaHQgPSAyMDtcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5zdGFnZTtcblxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0KXtcbiAgICAgICAgICAgIHZhciBpLCBzLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xuXG4gICAgICAgICAgICAvLyBjbGVhciBiYWNrZ291bmRcbiAgICAgICAgICAgIC8vIHNvIGFsbCBzaGFwZXMgdW5kZXIgd2lsbCBiZSBub3QgdmlzaWJsZVxuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICAgICAgY29udGV4dC5yZWN0KDAsIDAsIGxpbmVXaWR0aCArIG9mZnNldCwgMyAqIHJvd0hlaWdodCAtIG9mZnNldCk7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcblxuXG5cbiAgICAgICAgICAgIC8vZHJhdyB0aHJlZSBob3Jpem9udGFsIGxpbmVzXG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2xpZ2h0Z3JleSc7XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgZm9yKGkgPSAxOyBpIDwgNDsgaSsrKXtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGxpbmVXaWR0aCArIG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG5cbiAgICAgICAgICAgIC8vIGRyYXcgeWVhcnMvbW9udGhcbiAgICAgICAgICAgIC8vIHdpdGggbGluZXNcbiAgICAgICAgICAgIHZhciB5aSA9IDAsIHlmID0gcm93SGVpZ2h0LCB4aSA9IDA7XG4gICAgICAgICAgICBmb3IgKHMgPSAxOyBzIDwgMzsgcysrKXtcbiAgICAgICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gaERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlmKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzEwcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5ZiAtIHJvd0hlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeWkgPSB5ZjsgeWYgPSB5ZiArIHJvd0hlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZHJhdyBkYXlzXG4gICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDsgcyA9IDM7XG4gICAgICAgICAgICB2YXIgZHJhZ0ludCA9IHBhcnNlSW50KHNhdHRyLmRyYWdJbnRlcnZhbCwgMTApO1xuICAgICAgICAgICAgdmFyIGhpZGVEYXRlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiggZHJhZ0ludCA9PT0gMTQgfHwgZHJhZ0ludCA9PT0gMzApe1xuICAgICAgICAgICAgICAgIGhpZGVEYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBoRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcbiAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcbiAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoaERhdGFbc11baV0uaG9seSkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdsaWdodGdyYXknO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgeWkgKyByb3dIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSAtIGxlbmd0aCwgeWkgKyByb3dIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSAtIGxlbmd0aCwgeWkpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICc2cHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICAgICAgICAgICAgICBpZiAoaGlkZURhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzFwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGhEYXRhW3NdW2ldLnRleHQpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeCAtIGxlbmd0aCAvIDIsIHlpICsgcm93SGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBfZ2V0R3JpZFNjZW5lRnVuY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2Rpc3BsYXkgPSB0aGlzLnNldHRpbmdzLnNkaXNwbGF5O1xuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xuICAgICAgICB2YXIgYm9yZGVyV2lkdGggPSBzZGlzcGxheS5ib3JkZXJXaWR0aCB8fCAxO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMTtcblxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0KXtcbiAgICAgICAgICAgIHZhciBpLCBzLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XG5cbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgICAgIHZhciB5aSA9IDAsIHhpID0gMDtcblxuICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7IHMgPSAzO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxlbmd0aCA9IGhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xuICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xuICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChoRGF0YVtzXVtpXS5ob2x5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSAtIGxlbmd0aCwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHlpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxTdHJva2VTaGFwZSh0aGlzKTtcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIF9jYWNoZUJhY2tncm91bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xuICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xuICAgICAgICB0aGlzLnN0YWdlLmZpbmQoJy5ncmlkLC50b3BCYXInKS5jbGVhckNhY2hlKCk7XG4gICAgICAgIGlmIChsaW5lV2lkdGggPCA1MDAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YWdlLmZpbmQoJy5ncmlkLC50b3BCYXInKS5jYWNoZSh7XG4gICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBsaW5lV2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YWdlLmhlaWdodCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX3VwZGF0ZVRvZGF5TGluZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcbiAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxuICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcblxuICAgICAgdmFyIHggPSBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCBuZXcgRGF0ZSgpKSAqIGRheXNXaWR0aDtcbiAgICAgIHRoaXMuQmxheWVyLmZpbmRPbmUoJy5jdXJyZW50RGF5TGluZScpLngoeCkuaGVpZ2h0KHRoaXMuc3RhZ2UuaGVpZ2h0KCkpO1xuICAgICAgdGhpcy5CbGF5ZXIuYmF0Y2hEcmF3KCk7XG4gICAgfSxcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRvZGF5TGluZSgpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVCYWNrZ3JvdW5kKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTp3aWR0aCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVCYWNrZ3JvdW5kKCk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgfSxcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdyZW1vdmUnLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gd2FpdCBmb3IgbGVmdCBwYW5lbCB1cGRhdGVzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcbiAgICAgICAgfSwgMTApKTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQgY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2RlcGVuZDphZGQnLCBmdW5jdGlvbihiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KGJlZm9yZSwgYWZ0ZXIpO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2RlcGVuZDpyZW1vdmUnLCBmdW5jdGlvbihiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVDb25uZWN0b3JWaWV3KGJlZm9yZSwgYWZ0ZXIpO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ25lc3RlZFN0YXRlQ2hhbmdlJywgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgdmFyIHRhc2tWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IG1vZGVsO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlVmlldyh0YXNrVmlldyk7XG4gICAgfSxcbiAgICBfcmVtb3ZlVmlldzogZnVuY3Rpb24odGFza1ZpZXcpIHtcbiAgICAgICAgdGFza1ZpZXcucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl90YXNrVmlld3MsIHRhc2tWaWV3KTtcbiAgICB9LFxuICAgIF9yZW1vdmVDb25uZWN0b3JWaWV3OiBmdW5jdGlvbihiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICByZXR1cm4gdmlldy5hZnRlck1vZGVsID09PSBhZnRlciAmJlxuICAgICAgICAgICAgICAgIHZpZXcuYmVmb3JlTW9kZWwgPT09IGJlZm9yZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbm5lY3RvclZpZXcucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gXy53aXRob3V0KHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBjb25uZWN0b3JWaWV3KTtcbiAgICB9LFxuICAgIF9pbml0U3ViVmlld3M6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKChhZnRlcikgPT4ge1xuICAgICAgICAgICAgYWZ0ZXIuZGVwZW5kcy5lYWNoKChiZWZvcmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyhiZWZvcmUsIGFmdGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xuICAgICAgICB0aGlzLkZsYXllci5kcmF3KCk7XG4gICAgfSxcbiAgICBfYWRkVGFza1ZpZXc6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgdmFyIHZpZXc7XG4gICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTmVzdGVkVGFza1ZpZXcoe1xuICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWxvbmVUYXNrVmlldyh7XG4gICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzLnB1c2godmlldyk7XG4gICAgfSxcbiAgICBfYWRkQ29ubmVjdG9yVmlldzogZnVuY3Rpb24oYmVmb3JlLCBhZnRlcikge1xuICAgICAgICB2YXIgdmlldyA9IG5ldyBDb25uZWN0b3JWaWV3KHtcbiAgICAgICAgICAgIGJlZm9yZU1vZGVsOiBiZWZvcmUsXG4gICAgICAgICAgICBhZnRlck1vZGVsOiBhZnRlcixcbiAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XG4gICAgICAgIHZpZXcuZWwubW92ZVRvQm90dG9tKCk7XG4gICAgICAgIHZpZXcucmVuZGVyKCk7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzLnB1c2godmlldyk7XG4gICAgfSxcblxuICAgIF9yZXF1ZXN0UmVzb3J0OiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAod2FpdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xuICAgICAgICAgICAgd2FpdGluZyA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfSgpKSxcbiAgICBfcmVzb3J0Vmlld3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFzdFkgPSB0aGlzLl90b3BQYWRkaW5nO1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYubW9kZWwgPT09IHRhc2s7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdmlldykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XG4gICAgICAgICAgICBsYXN0WSArPSB2aWV3LmhlaWdodDtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goKGFmdGVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoYWZ0ZXIuZ2V0KCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFmdGVyLmRlcGVuZHMuZWFjaCgoYmVmb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZVZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBiZWZvcmU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGFmdGVyVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IGFmdGVyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuYWZ0ZXJNb2RlbCA9PT0gYWZ0ZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMShiZWZvcmVWaWV3LmdldFkoKSArIGJlZm9yZVZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JWaWV3LnNldFkyKGFmdGVyVmlldy5nZXRZKCkgKyBhZnRlclZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5GbGF5ZXIuYmF0Y2hEcmF3KCk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FudHRDaGFydFZpZXc7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxuICovXG5cInVzZSBzdHJpY3RcIjtcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XG5cbnZhciBOZXN0ZWRUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcbiAgICBfY29sb3IgOiAnI2IzZDFmYycsXG4gICAgX2JvcmRlclNpemUgOiA2LFxuICAgIF9iYXJIZWlnaHQgOiAxMCxcbiAgICBfY29tcGxldGVDb2xvciA6ICcjMzM2Njk5JyxcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLb252YS5MaW5lKHtcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxuICAgICAgICAgICAgcG9pbnRzIDogWzAsIDAsIHRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcbiAgICAgICAgfSk7XG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtvbnZhLkxpbmUoe1xuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQsXG4gICAgICAgICAgICBwb2ludHMgOiBbLXRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXG4gICAgICAgIH0pO1xuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xuICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgfSxcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gZ3JvdXAgaXMgbW92ZWRcbiAgICAgICAgLy8gc28gd2UgbmVlZCB0byBkZXRlY3QgaW50ZXJ2YWxcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG4gICAgICAgICAgICBib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcbiAgICAgICAgICAgIGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XG5cbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCk7XG4gICAgICAgIHZhciBuZXdTdGFydCA9IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSk7XG4gICAgICAgIHRoaXMubW9kZWwubW92ZVRvU3RhcnQobmV3U3RhcnQpO1xuICAgIH0sXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxKTtcbiAgICAgICAgdmFyIGNvbXBsZXRlV2lkdGggPSAoeC54MiAtIHgueDEpICogdGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDA7XG4gICAgICAgIGlmIChjb21wbGV0ZVdpZHRoID4gdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbXBsZXRlQ29sb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoeC54MiAtIHgueDEpIC0gY29tcGxldGVXaWR0aCA8IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2tWaWV3O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTW9kYWxFZGl0ID0gcmVxdWlyZSgnLi4vTW9kYWxUYXNrRWRpdFZpZXcnKTtcclxudmFyIENvbW1lbnRzID0gcmVxdWlyZSgnLi4vQ29tbWVudHNWaWV3Jyk7XHJcblxyXG5mdW5jdGlvbiBDb250ZXh0TWVudVZpZXcocGFyYW1zKSB7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMuY29sbGVjdGlvbjtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICd1bCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykgfHwgJCh0aGlzKS5kYXRhKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmNvbGxlY3Rpb24uZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnZGVsZXRlJyl7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncHJvcGVydGllcycpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgTW9kYWxFZGl0KHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHNlbGYuc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdjb21tZW50cycpe1xyXG4gICAgICAgICAgICAgICAgbmV3IENvbW1lbnRzKHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHNlbGYuc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIH0pLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkOiBpZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayhkYXRhLCAnYWJvdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdyb3dCZWxvdycpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfSwgJ2JlbG93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2luZGVudCcpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29sbGVjdGlvbi5pbmRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdvdXRkZW50Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24ub3V0ZGVudChtb2RlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIFwicm93QWJvdmVcIjogeyBuYW1lOiBcIiZuYnNwO05ldyBSb3cgQWJvdmVcIiwgaWNvbjogXCJhYm92ZVwiIH0sXHJcbiAgICAgICAgICAgIFwicm93QmVsb3dcIjogeyBuYW1lOiBcIiZuYnNwO05ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJiZWxvd1wiIH0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHsgbmFtZTogXCImbmJzcDtJbmRlbnQgUm93XCIsIGljb246IFwiaW5kZW50XCIgfSxcclxuICAgICAgICAgICAgXCJvdXRkZW50XCI6IHsgbmFtZTogXCImbmJzcDtPdXRkZW50IFJvd1wiLCBpY29uOiBcIm91dGRlbnRcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDFcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHsgbmFtZTogXCImbmJzcDtQcm9wZXJ0aWVzXCIsIGljb246IFwicHJvcGVydGllc1wiIH0sXHJcbiAgICAgICAgICAgIFwiY29tbWVudHNcIjogeyBuYW1lOiBcIiZuYnNwO0NvbW1lbnRzXCIsIGljb246IFwiY29tbWVudFwiIH0sXHJcbiAgICAgICAgICAgIFwic2VwMlwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcImRlbGV0ZVwiOiB7IG5hbWU6IFwiJm5ic3A7RGVsZXRlIFJvd1wiLCBpY29uOiBcImRlbGV0ZVwiIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUuYWRkVGFzayA9IGZ1bmN0aW9uKGRhdGEsIGluc2VydFBvcykge1xyXG4gICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkYXRhLnJlZmVyZW5jZV9pZCk7XHJcbiAgICBpZiAocmVmX21vZGVsKSB7XHJcbiAgICAgICAgc29ydGluZGV4ID0gcmVmX21vZGVsLmdldCgnc29ydGluZGV4JykgKyAoaW5zZXJ0UG9zID09PSAnYWJvdmUnID8gLTAuNSA6IDAuNSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmNvbGxlY3Rpb24ubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGhpcy5jb2xsZWN0aW9uLmNoZWNrU29ydGVkSW5kZXgoKTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwidmFyIERhdGVQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdEYXRlUGlja2VyJyxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzZWxlY3QnKTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdzaG93Jyk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ2Rlc3Ryb3knKTtcbiAgICB9LFxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRlU3RyID0gJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5wcm9wcy5kYXRlRm9ybWF0LCB0aGlzLnByb3BzLnZhbHVlKTtcbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkudmFsdWUgPSBkYXRlU3RyO1xuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgdGhpcy5wcm9wcy52YWx1ZSlcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcbiIsInZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcblxudmFyIE5lc3RlZFRhc2sgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdOZXN0ZWRUYXNrJyxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZTpoaWRkZW4gY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3VidGFza3MgPSB0aGlzLnByb3BzLm1vZGVsLmNoaWxkcmVuLm1hcCgodGFzaykgPT4ge1xuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiB0YXNrLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdFJvdzogdGhpcy5wcm9wcy5vblNlbGVjdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgb25FZGl0Um93OiB0aGlzLnByb3BzLm9uRWRpdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgZWRpdGVkUm93OiB0aGlzLnByb3BzLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRSb3c6IHRoaXMucHJvcHMuc2VsZWN0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTW9kZWxDaWQ6IHRoaXMucHJvcHMuc2VsZWN0ZWRNb2RlbENpZCxcbiAgICAgICAgICAgICAgICAgICAgZ2V0QWxsU3RhdHVzZXM6IHRoaXMucHJvcHMuZ2V0QWxsU3RhdHVzZXMsXG4gICAgICAgICAgICAgICAgICAgIGdldFN0YXR1c0lkOiB0aGlzLnByb3BzLmdldFN0YXR1c0lkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suY2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5jaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZHJhZy1pdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRhc2suY2lkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3RSb3c6IHRoaXMucHJvcHMub25TZWxlY3RSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FZGl0Um93OiB0aGlzLnByb3BzLm9uRWRpdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6ICh0aGlzLnByb3BzLnNlbGVjdGVkTW9kZWxDaWQgPT09IHRhc2suY2lkKSAmJiB0aGlzLnByb3BzLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogKHRoaXMucHJvcHMuc2VsZWN0ZWRNb2RlbENpZCA9PT0gdGFzay5jaWQpICYmIHRoaXMucHJvcHMuc2VsZWN0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0QWxsU3RhdHVzZXM6IHRoaXMucHJvcHMuZ2V0QWxsU3RhdHVzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U3RhdHVzSWQ6IHRoaXMucHJvcHMuZ2V0U3RhdHVzSWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGhpcy5wcm9wcy5tb2RlbC5jaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGhpcy5wcm9wcy5tb2RlbC5jaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMucHJvcHMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdFJvdzogdGhpcy5wcm9wcy5vblNlbGVjdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdFJvdzogdGhpcy5wcm9wcy5vbkVkaXRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6ICh0aGlzLnByb3BzLnNlbGVjdGVkTW9kZWxDaWQgPT09IHRoaXMucHJvcHMubW9kZWwuY2lkKSAmJiB0aGlzLnByb3BzLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkUm93OiAodGhpcy5wcm9wcy5zZWxlY3RlZE1vZGVsQ2lkID09PSB0aGlzLnByb3BzLm1vZGVsLmNpZCkgJiYgdGhpcy5wcm9wcy5zZWxlY3RlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEFsbFN0YXR1c2VzOiB0aGlzLnByb3BzLmdldEFsbFN0YXR1c2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U3RhdHVzSWQ6IHRoaXMucHJvcHMuZ2V0U3RhdHVzSWRcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3ViLXRhc2stbGlzdCBzb3J0YWJsZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3VidGFza3NcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2s7XG4iLCJ2YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XG52YXIgTmVzdGVkVGFzayA9IHJlcXVpcmUoJy4vTmVzdGVkVGFzaycpO1xuXG5mdW5jdGlvbiBidWlsZFRhc2tzT3JkZXJGcm9tRE9NKGNvbnRhaW5lcikge1xuICAgIHZhciBkYXRhID0gW107XG4gICAgdmFyIGNoaWxkcmVuID0gJCgnPG9sPicgKyBjb250YWluZXIuZ2V0KDApLmlubmVySFRNTCArICc8L29sPicpLmNoaWxkcmVuKCk7XG4gICAgXy5lYWNoKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICB2YXIgJGNoaWxkID0gJChjaGlsZCk7XG4gICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICBpZDogJGNoaWxkLmRhdGEoJ2lkJyksXG4gICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN1Ymxpc3QgPSAkY2hpbGQuZmluZCgnb2wnKTtcbiAgICAgICAgaWYgKHN1Ymxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBvYmouY2hpbGRyZW4gPSBidWlsZFRhc2tzT3JkZXJGcm9tRE9NKHN1Ymxpc3QpO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEucHVzaChvYmopO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xufVxuXG52YXIgU2lkZVBhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU2lkZVBhbmVsJyxcbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZWxlY3RlZFJvdzogbnVsbCxcbiAgICAgICAgICAgIGxhc3RTZWxlY3RlZFJvdzogbnVsbCxcbiAgICAgICAgICAgIHNlbGVjdGVkTW9kZWw6IG51bGwsXG4gICAgICAgICAgICBlZGl0ZWRSb3c6IG51bGxcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHRoaXMuX21ha2VTb3J0YWJsZSgpO1xuICAgICAgICB0aGlzLl9zZXR1cEhpZ2hsaWdodGVyKCk7XG4gICAgfSxcbiAgICBfbWFrZVNvcnRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoJy50YXNrLWNvbnRhaW5lcicpO1xuICAgICAgICBjb250YWluZXIuc29ydGFibGUoe1xuICAgICAgICAgICAgZ3JvdXA6ICdzb3J0YWJsZScsXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJ29sJyxcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5kcmFnLWl0ZW0nLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlciBzb3J0LXBsYWNlaG9sZGVyXCIvPicsXG4gICAgICAgICAgICBoYW5kbGU6ICcuY29sLXNvcnRpbmRleCcsXG4gICAgICAgICAgICBvbkRyYWdTdGFydDogKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRHJhZzogKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xuICAgICAgICAgICAgICAgIHZhciBpc1N1YlRhc2sgPSAhJCgkcGxhY2Vob2xkZXIucGFyZW50KCkpLmhhc0NsYXNzKCd0YXNrLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogaXNTdWJUYXNrID8gJzMwcHgnIDogJzAnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Ecm9wOiAoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gYnVpbGRUYXNrc09yZGVyRnJvbURPTShjb250YWluZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfc2V0dXBIaWdobGlnaHRlcigpIHtcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIgPSAkKCc8ZGl2PicpO1xuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnZ3JleScsXG4gICAgICAgICAgICBvcGFjaXR5OiAnMC41JyxcbiAgICAgICAgICAgIHRvcDogJzAnLFxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJ1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gJCgnLnRhc2stY29udGFpbmVyJyk7XG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgY29udGFpbmVyLm1vdXNlb3ZlcihmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBUT0RPOiByZXdyaXRlIHRvIGZpbmQgY2xvc2VzdCB1bFxuICAgICAgICAgICAgaWYgKCEkZWwuZGF0YSgnaWQnKSkge1xuICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAoISRlbC5kYXRhKCdpZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcG9zID0gJGVsLm9mZnNldCgpO1xuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcbiAgICAgICAgICAgICAgICB0b3A6IHBvcy50b3AgKyAncHgnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJGVsLmhlaWdodCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICBjb250YWluZXIubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgcmVxdWVzdFVwZGF0ZTogKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xuICAgICAgICAgICAgd2FpdGluZyA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfSgpKSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJy50YXNrLWNvbnRhaW5lcicpLnNvcnRhYmxlKCdkZXN0cm95Jyk7XG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xuICAgIH0sXG4gICAgb25TZWxlY3RSb3coc2VsZWN0ZWRNb2RlbENpZCwgc2VsZWN0ZWRSb3cpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWFibGVSb3dzLmluZGV4T2Yoc2VsZWN0ZWRSb3cpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWRSb3csXG4gICAgICAgICAgICBzZWxlY3RlZE1vZGVsQ2lkXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgb25FZGl0Um93KHNlbGVjdGVkTW9kZWxDaWQsIGVkaXRlZFJvdykge1xuICAgICAgICBpZiAoIWVkaXRlZFJvdykge1xuICAgICAgICAgICAgdmFyIHggPSB3aW5kb3cuc2Nyb2xsWCwgeSA9IHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICAgICAgdGhpcy5yZWZzLmNvbnRhaW5lci5nZXRET01Ob2RlKCkuZm9jdXMoKTtcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbyh4LCB5KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkUm93OiB0aGlzLnN0YXRlLmxhc3RTZWxlY3RlZFJvd1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZE1vZGVsQ2lkLFxuICAgICAgICAgICAgZWRpdGVkUm93XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc2VsZWN0ZWFibGVSb3dzOiBbJ25hbWUnLCAnY29tcGxldGUnLCAnc3RhdHVzJywgJ3N0YXJ0JywgJ2VuZCcsICdkdXJhdGlvbiddLFxuICAgIG9uS2V5RG93bihlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCByb3dzID0gdGhpcy5zZWxlY3RlYWJsZVJvd3M7XG4gICAgICAgIGxldCBpID0gcm93cy5pbmRleE9mKHRoaXMuc3RhdGUuc2VsZWN0ZWRSb3cpO1xuICAgICAgICBjb25zdCB0YXNrcyA9IHRoaXMucHJvcHMuY29sbGVjdGlvbjtcbiAgICAgICAgbGV0IG1vZGVsSW5kZXggPSB0YXNrcy5nZXQodGhpcy5zdGF0ZS5zZWxlY3RlZE1vZGVsQ2lkKS5nZXQoJ3NvcnRpbmRleCcpO1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA0MCkgeyAvLyBkb3duXG4gICAgICAgICAgICBtb2RlbEluZGV4ID0gKG1vZGVsSW5kZXggKyAxICsgdGFza3MubGVuZ3RoKSAlIHRhc2tzLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDM5KSB7IC8vIHJpZ2h0XG4gICAgICAgICAgICBpID0gKGkgKyAxICsgcm93cy5sZW5ndGgpICUgcm93cy5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzOCkgeyAvLyB1cFxuICAgICAgICAgICAgbW9kZWxJbmRleCA9IChtb2RlbEluZGV4IC0gMSArIHRhc2tzLmxlbmd0aCkgJSB0YXNrcy5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzNykgeyAvLyBsZWZ0XG4gICAgICAgICAgICBpID0gKGkgLSAxICsgcm93cy5sZW5ndGgpICUgcm93cy5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAxMykgeyAvLyBlbnRlclxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZWRpdGVkUm93OiByb3dzW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGF1dG8gb3BlbiBzaWRlIHBhbmVsXG4gICAgICAgIGlmIChpID49IDIpIHtcbiAgICAgICAgICAgICQoJy5tZW51LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdwYW5lbC1leHBhbmRlZCcpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkUm93OiByb3dzW2ldLFxuICAgICAgICAgICAgc2VsZWN0ZWRNb2RlbENpZDogdGFza3MuYXQobW9kZWxJbmRleCkuY2lkXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgb25DbGljaygpIHtcbiAgICAgICAgdmFyIHggPSB3aW5kb3cuc2Nyb2xsWCwgeSA9IHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICB0aGlzLnJlZnMuY29udGFpbmVyLmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oeCwgeSk7XG4gICAgfSxcbiAgICBvbkJsdXIoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbGFzdFNlbGVjdGVkUm93OiB0aGlzLnN0YXRlLnNlbGVjdGVkUm93LFxuICAgICAgICAgICAgc2VsZWN0ZWRSb3c6IG51bGxcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRBbGxTdGF0dXNlcygpIHtcbiAgICAgICAgLy8gcmV0dXJuIFtcbiAgICAgICAgLy8gICAgICdCYWNrbG9nJyxcbiAgICAgICAgLy8gICAgICdSZWFkeScsXG4gICAgICAgIC8vICAgICAnSW4gUHJvZ3Jlc3MnLFxuICAgICAgICAvLyAgICAgJ0NvbXBsZXRlJ1xuICAgICAgICAvLyBdO1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5zZXR0aW5ncy5nZXRBbGxTdGF0dXNlcygpO1xuICAgIH0sXG4gICAgZ2V0U3RhdHVzSWQoc3RhdHVzVGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoc3RhdHVzVGV4dCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGFza3MgPSBbXTtcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLmVhY2goKHRhc2spID0+IHtcbiAgICAgICAgICAgIGlmICh0YXNrLnBhcmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcbiAgICAgICAgICAgICAgICAgICAga2V5OiB0YXNrLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdFJvdzogdGhpcy5vblNlbGVjdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgb25FZGl0Um93OiB0aGlzLm9uRWRpdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgZWRpdGVkUm93OiB0aGlzLnN0YXRlLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRSb3c6IHRoaXMuc3RhdGUuc2VsZWN0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTW9kZWxDaWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWRNb2RlbENpZCxcbiAgICAgICAgICAgICAgICAgICAgZ2V0QWxsU3RhdHVzZXM6IHRoaXMuZ2V0QWxsU3RhdHVzZXMsXG4gICAgICAgICAgICAgICAgICAgIGdldFN0YXR1c0lkOiB0aGlzLmdldFN0YXR1c0lkXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB0YXNrLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2RyYWctaXRlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRhc2suY2lkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3RSb3c6IHRoaXMub25TZWxlY3RSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVkaXRSb3c6IHRoaXMub25FZGl0Um93LFxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGVkUm93OiAodGhpcy5zdGF0ZS5zZWxlY3RlZE1vZGVsQ2lkID09PSB0YXNrLmNpZCkgJiYgdGhpcy5zdGF0ZS5lZGl0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogKHRoaXMuc3RhdGUuc2VsZWN0ZWRNb2RlbENpZCA9PT0gdGFzay5jaWQpICYmIHRoaXMuc3RhdGUuc2VsZWN0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRBbGxTdGF0dXNlczogdGhpcy5nZXRBbGxTdGF0dXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFN0YXR1c0lkOiB0aGlzLmdldFN0YXR1c0lkXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPG9sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPSd0YXNrLWNvbnRhaW5lciBzb3J0YWJsZSdcbiAgICAgICAgICAgICAgICB0YWJJbmRleD1cIjFcIlxuICAgICAgICAgICAgICAgIHJlZj1cImNvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQmx1cn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dGFza3N9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGVQYW5lbDtcbiIsInZhciBEYXRlUGlja2VyID0gcmVxdWlyZSgnLi9EYXRlUGlja2VyJyk7XG52YXIgQ29tbWV0c1ZpZXcgPSByZXF1aXJlKCcuLi9Db21tZW50c1ZpZXcnKTtcblxudmFyIFRhc2tJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVGFza0l0ZW0nLFxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbDogbnVsbFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihwcm9wcykge1xuICAgICAgICBpZiAoXy5pc0VxdWFsKHByb3BzLCB0aGlzLnByb3BzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0ICRpbnB1dCA9ICQodGhpcy5nZXRET01Ob2RlKCkpLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIGlmICgkaW5wdXQubGVuZ3RoID4gMCAmJiAhJGlucHV0LmlzKCc6Zm9jdXMnKSkge1xuICAgICAgICAgICAgJGlucHV0LmZvY3VzKCk7XG4gICAgICAgICAgICAvLyBtb3ZlIGN1cnNvciB0byB0aGUgZW5kIG9mIGlucHV0LiBUaXAgZnJvbTpcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTExMDg4L3VzZS1qYXZhc2NyaXB0LXRvLXBsYWNlLWN1cnNvci1hdC1lbmQtb2YtdGV4dC1pbi10ZXh0LWlucHV0LWVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IHZhbCA9ICRpbnB1dC52YWwoKTsgLy9zdG9yZSB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnRcbiAgICAgICAgICAgICRpbnB1dC52YWwoJycpOyAvL2NsZWFyIHRoZSB2YWx1ZSBvZiB0aGUgZWxlbWVudFxuICAgICAgICAgICAgJGlucHV0LnZhbCh2YWwpOyAvL3NldCB0aGF0IHZhbHVlIGJhY2suXG4gICAgICAgIH1cbiAgICAgICAgJGlucHV0ID0gJCh0aGlzLmdldERPTU5vZGUoKSkuZmluZCgnc2VsZWN0JykuZm9jdXMoKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGV2ZW50cyA9IFtcbiAgICAgICAgICAgICdjaGFuZ2U6bmFtZScsICdjaGFuZ2U6Y29tcGxldGUnLCAnY2hhbmdlOnN0YXJ0JyxcbiAgICAgICAgICAgICdjaGFuZ2U6ZW5kJywgJ2NoYW5nZTpkdXJhdGlvbicsICdjaGFuZ2U6aGlnaHRsaWdodCcsXG4gICAgICAgICAgICAnY2hhbmdlOm1pbGVzdG9uZScsICdjaGFuZ2U6ZGVsaXZlcmFibGUnLCAnY2hhbmdlOnJlcG9ydGFibGUnLFxuICAgICAgICAgICAgJ2NoYW5nZTpzdGF0dXMnLFxuICAgICAgICAgICAgJ2NoYW5nZTp0aW1lc2hlZXRzJywgJ2NoYW5nZTphY3R0aW1lc2hlZXRzJyxcbiAgICAgICAgICAgICdjaGFuZ2U6Q29tbWVudHMnXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oZXZlbnRzLmpvaW4oJyAnKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcbiAgICB9LFxuICAgIF9maW5kTmVzdGVkTGV2ZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5tb2RlbC5nZXRPdXRsaW5lTGV2ZWwoKSAtIDE7XG4gICAgfSxcbiAgICBfY3JlYXRlU3RhdHVzSWNvbkZpZWxkOiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29sID09PSAnbWlsZXN0b25lJyAmJiB0aGlzLnByb3BzLm1vZGVsLmlzTmVzdGVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoY29sLCAhdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtgaW1nL2ljb24tJHtjb2x9LnBuZ2B9IG9uQ2xpY2s9e2hhbmRsZUNsaWNrfT48L2ltZz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICg8ZGl2IG9uQ2xpY2s9e2hhbmRsZUNsaWNrfSBzdHlsZT17e3dpZHRoOiAnMjBweCcsIGhlaWdodDogJzIwcHgnfX0+PC9kaXY+KTtcbiAgICB9LFxuICAgIF9jcmVhdGVGaWVsZDogZnVuY3Rpb24oY29sKSB7XG4gICAgICAgIGNvbnN0IGlzQ29sSW5FZGl0ID0gKHRoaXMucHJvcHMuZWRpdGVkUm93ID09PSBjb2wpO1xuICAgICAgICBpZiAoaXNDb2xJbkVkaXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVFZGl0RmllbGQoY29sKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHt9LCB0aGlzLl9jcmVhdGVSZWFkRmlsZWQoY29sKSk7XG4gICAgfSxcbiAgICBfY3JlYXRlUmVhZEZpbGVkOiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpICsgJyUnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPT09ICdzdGFydCcgfHwgY29sID09PSAnZW5kJykge1xuICAgICAgICAgICAgcmV0dXJuICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgbW9kZWwuZ2V0KGNvbCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSwgbW9kZWwuZ2V0KCdlbmQnKSkgKyAnIGQnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPT09ICdzdGF0dXMnKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gXy5maW5kKHRoaXMucHJvcHMuZ2V0QWxsU3RhdHVzZXMoKSwgKHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5nZXRTdGF0dXNJZCh0KS50b1N0cmluZygpID09PSB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhdHVzJykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRleHQgfHwgJ1VucmVjb2duaXplZCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpO1xuICAgIH0sXG4gICAgX2NyZWF0ZURhdGVFbGVtZW50OiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICBrZXk6IGNvbCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFJvdyh0aGlzLnByb3BzLm1vZGVsLmNpZCwgbnVsbCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfZHVyYXRpb25DaGFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBudW1iZXIgPSBwYXJzZUludCh2YWx1ZS5yZXBsYWNlKCAvXlxcRCsvZywgJycpLCAxMCk7XG4gICAgICAgIGlmICghbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJ3cnKSA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRXZWVrcyhudW1iZXIpKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5pbmRleE9mKCdtJykgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkTW9udGhzKG51bWJlcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbnVtYmVyLS07XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKG51bWJlcikpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBfY3JlYXRlRHVyYXRpb25GaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSBEYXRlLmRheXNkaWZmKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnZW5kJykpICsgJyBkJztcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsIHx8IHZhbCxcbiAgICAgICAgICAgIGtleTogJ2R1cmF0aW9uJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHVyYXRpb25DaGFuZ2UodmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlfSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbktleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMyB8fCBlLmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FZGl0Um93KHRoaXMucHJvcHMubW9kZWwuY2lkLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX2NyZWF0ZVN0YXR1c0ZpZWxkKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5wcm9wcy5nZXRBbGxTdGF0dXNlcygpLm1hcCgoc3RhdHVzVGV4dCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzSWQgPSB0aGlzLnByb3BzLmdldFN0YXR1c0lkKHN0YXR1c1RleHQpO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c3RhdHVzVGV4dH0gdmFsdWU9e3N0YXR1c0lkfT57c3RhdHVzVGV4dH08L29wdGlvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgIHZhbHVlID0ge3RoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGF0dXMnKX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgnc3RhdHVzJywgZS50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFJvdyh0aGlzLnByb3BzLm1vZGVsLmNpZCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzExcHgnXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7b3B0aW9uc31cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICApO1xuICAgIH0sXG4gICAgX3JlcXVlc3RTYXZlKCkge1xuICAgICAgICBpZiAodGhpcy53YWl0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xuICAgICAgICB9LCA1MDApO1xuICAgIH0sXG4gICAgX2NyZWF0ZUVkaXRGaWVsZDogZnVuY3Rpb24oY29sKSB7XG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlRWxlbWVudChjb2wpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEdXJhdGlvbkZpZWxkKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXR1cycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVTdGF0dXNGaWVsZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ25hbWVJbnB1dCcsXG4gICAgICAgICAgICB2YWx1ZTogdmFsLFxuICAgICAgICAgICAga2V5OiBjb2wsXG4gICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbktleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMyB8fCBlLmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FZGl0Um93KHRoaXMucHJvcHMubW9kZWwuY2lkLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFNhdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FZGl0Um93KHRoaXMucHJvcHMubW9kZWwuY2lkLCBudWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXF1ZXN0U2F2ZSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlQ29tbWVudEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1lbnRzID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ0NvbW1lbnRzJykgfHwgMDtcbiAgICAgICAgaWYgKCFjb21tZW50cykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbW1lbnRzJyxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjb2wtY29tbWVudHMnLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBuZXcgQ29tbWV0c1ZpZXcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMucHJvcHMubW9kZWxcbiAgICAgICAgICAgICAgICAgICAgfSkucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaW1nJywge1xuICAgICAgICAgICAgICAgIHNyYzogJ2Nzcy9pbWFnZXMvY29tbWVudHMucG5nJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb21tZW50c1xuICAgICAgICApO1xuICAgIH0sXG4gICAgc2hvd0NvbnRleHQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpO1xuICAgICAgICB2YXIgdWwgPSAkZWwucGFyZW50KCk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCk7XG4gICAgICAgIHVsLmNvbnRleHRNZW51KHtcbiAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgMjAsXG4gICAgICAgICAgICB5OiBvZmZzZXQudG9wXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZmluZENvbDogZnVuY3Rpb24oZSkge1xuICAgICAgICBjb25zdCBjb2wgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFzay1jb2wnKS5kYXRhKCdjb2wnKTtcbiAgICAgICAgcmV0dXJuIGNvbDtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3cgPSB0aGlzLnByb3BzLnNlbGVjdGVkUm93O1xuICAgICAgICBjb25zdCBzaGFkb3dCb3JkZXIgPSAnMCAwIDAgMnB4ICMzODc5ZDkgaW5zZXQnO1xuXG4gICAgICAgIGxldCBjb2xsYXBzZUJ1dHRvbjtcbiAgICAgICAgaWYgKG1vZGVsLmlzTmVzdGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9ICd0cmlhbmdsZSBpY29uICcgKyAodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpID8gJ3JpZ2h0JyA6ICdkb3duJyk7XG4gICAgICAgICAgICBjb2xsYXBzZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8aVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2NvbGxhcHNlZCcsICF0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykpO1xuICAgICAgICAgICAgICAgICAgICB9fS8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVsQ2xhc3MgPSAndGFzaydcbiAgICAgICAgICArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpXG4gICAgICAgICAgKyAodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpID8gJyBjb2xsYXBzZWQnIDogJycpXG4gICAgICAgICAgKyAodGhpcy5wcm9wcy5tb2RlbC5pc05lc3RlZCgpID8gJyBuZXN0ZWQnIDogJycpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHVsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt1bENsYXNzfVxuICAgICAgICAgICAgICAgIGRhdGEtaWQ9e3RoaXMucHJvcHMubW9kZWwuY2lkfVxuICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FZGl0Um93KG1vZGVsLmNpZCwgdGhpcy5maW5kQ29sKGUpKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25TZWxlY3RSb3cobW9kZWwuY2lkLCB0aGlzLmZpbmRDb2woZSkpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLnByb3BzLm1vZGVsLmdldCgnaGlnaHRsaWdodCcpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwiaW5mb1wiIGNsYXNzTmFtZT1cInRhc2stY29sIGNvbC1pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiaW1nL2luZm8ucG5nXCIgb25DbGljaz17dGhpcy5zaG93Q29udGV4dH0vPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cInNvcnRpbmRleFwiIGNsYXNzTmFtZT1cImNvbC1zb3J0aW5kZXhcIj5cbiAgICAgICAgICAgICAgICAgICAge21vZGVsLmdldCgnc29ydGluZGV4JykgKyAxfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cIm5hbWVcIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtbmFtZVwiIGRhdGEtY29sPVwibmFtZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogKHRoaXMuX2ZpbmROZXN0ZWRMZXZlbCgpICogMTApICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogc2VsZWN0ZWRSb3cgPT09ICduYW1lJyA/IHNoYWRvd0JvcmRlciA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtjb2xsYXBzZUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLl9jcmVhdGVGaWVsZCgnbmFtZScpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIHt0aGlzLmNyZWF0ZUNvbW1lbnRGaWVsZCgpfVxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJjb21wbGV0ZVwiIGNsYXNzTmFtZT1cInRhc2stY29sIGNvbC1jb21wbGV0ZVwiIGRhdGEtY29sPVwiY29tcGxldGVcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2JveFNoYWRvdzogc2VsZWN0ZWRSb3cgPT09ICdjb21wbGV0ZScgPyBzaGFkb3dCb3JkZXIgOiBudWxsfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9jcmVhdGVGaWVsZCgnY29tcGxldGUnKX1cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJzdGF0dXNcIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtc3RhdHVzXCIgZGF0YS1jb2w9XCJzdGF0dXNcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2JveFNoYWRvdzogc2VsZWN0ZWRSb3cgPT09ICdzdGF0dXMnID8gc2hhZG93Qm9yZGVyIDogbnVsbH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlRmllbGQoJ3N0YXR1cycpfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cInN0YXJ0XCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLXN0YXJ0XCIgZGF0YS1jb2w9XCJzdGFydFwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7Ym94U2hhZG93OiBzZWxlY3RlZFJvdyA9PT0gJ3N0YXJ0JyA/IHNoYWRvd0JvcmRlciA6IG51bGx9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2NyZWF0ZUZpZWxkKCdzdGFydCcpfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cImVuZFwiIGNsYXNzTmFtZT1cInRhc2stY29sIGNvbC1lbmRcIiBkYXRhLWNvbD1cImVuZFwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7Ym94U2hhZG93OiBzZWxlY3RlZFJvdyA9PT0gJ2VuZCcgPyBzaGFkb3dCb3JkZXIgOiBudWxsfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9jcmVhdGVGaWVsZCgnZW5kJyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwiZHVyYXRpb25cIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtZHVyYXRpb25cIiBkYXRhLWNvbD1cImR1cmF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnZHVyYXRpb24nID8gc2hhZG93Qm9yZGVyIDogbnVsbH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlRmllbGQoJ2R1cmF0aW9uJyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwibWlsZXN0b25lXCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLW1pbGVzdG9uZVwiIGRhdGEtY29sPVwibWlsZXN0b25lXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnbWlsZXN0b25lJyA/IHNoYWRvd0JvcmRlciA6IG51bGx9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2NyZWF0ZVN0YXR1c0ljb25GaWVsZCgnbWlsZXN0b25lJyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwiZGVsaXZlcmFibGVcIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtZGVsaXZlcmFibGVcIiBkYXRhLWNvbD1cImRlbGl2ZXJhYmxlXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnZGVsaXZlcmFibGUnID8gc2hhZG93Qm9yZGVyIDogbnVsbH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlU3RhdHVzSWNvbkZpZWxkKCdkZWxpdmVyYWJsZScpfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cInJlcG9ydGFibGVcIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtcmVwb3J0YWJsZVwiIGRhdGEtY29sPVwicmVwb3J0YWJsZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7Ym94U2hhZG93OiBzZWxlY3RlZFJvdyA9PT0gJ3JlcG9ydGFibGUnID8gc2hhZG93Qm9yZGVyIDogbnVsbH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlU3RhdHVzSWNvbkZpZWxkKCdyZXBvcnRhYmxlJyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwidGltZXNoZWV0c1wiIGNsYXNzTmFtZT1cInRhc2stY29sIGNvbC10aW1lc2hlZXRzXCIgZGF0YS1jb2w9XCJ0aW1lc2hlZXRzXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAndGltZXNoZWV0cycgPyBzaGFkb3dCb3JkZXIgOiBudWxsfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9jcmVhdGVTdGF0dXNJY29uRmllbGQoJ3RpbWVzaGVldHMnKX1cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJhY3R0aW1lc2hlZXRzXCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLWFjdHRpbWVzaGVldHNcIiBkYXRhLWNvbD1cImFjdHRpbWVzaGVldHNcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2JveFNoYWRvdzogc2VsZWN0ZWRSb3cgPT09ICdhY3R0aW1lc2hlZXRzJyA/IHNoYWRvd0JvcmRlciA6IG51bGx9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2NyZWF0ZVN0YXR1c0ljb25GaWVsZCgnYWN0dGltZXNoZWV0cycpfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tJdGVtO1xuIl19
