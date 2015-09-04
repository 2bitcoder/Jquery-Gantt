(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function(global){var babelHelpers=global.babelHelpers={};babelHelpers.inherits=function(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass)}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__=superClass};babelHelpers.defaults=function(obj,defaults){var keys=Object.getOwnPropertyNames(defaults);for(var i=0;i<keys.length;i++){var key=keys[i];var value=Object.getOwnPropertyDescriptor(defaults,key);if(value&&value.configurable&&obj[key]===undefined){Object.defineProperty(obj,key,value)}}return obj};babelHelpers.createClass=function(){function defineProperties(target,props){for(var key in props){var prop=props[key];prop.configurable=true;if(prop.value)prop.writable=true}Object.defineProperties(target,props)}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();babelHelpers.createComputedClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var prop=props[i];prop.configurable=true;if(prop.value)prop.writable=true;Object.defineProperty(target,prop.key,prop)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();babelHelpers.applyConstructor=function(Constructor,args){var instance=Object.create(Constructor.prototype);var result=Constructor.apply(instance,args);return result!=null&&(typeof result=="object"||typeof result=="function")?result:instance};babelHelpers.taggedTemplateLiteral=function(strings,raw){return Object.freeze(Object.defineProperties(strings,{raw:{value:Object.freeze(raw)}}))};babelHelpers.taggedTemplateLiteralLoose=function(strings,raw){strings.raw=raw;return strings};babelHelpers.interopRequire=function(obj){return obj&&obj.__esModule?obj["default"]:obj};babelHelpers.toArray=function(arr){return Array.isArray(arr)?arr:Array.from(arr)};babelHelpers.toConsumableArray=function(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++)arr2[i]=arr[i];return arr2}else{return Array.from(arr)}};babelHelpers.slicedToArray=function(arr,i){if(Array.isArray(arr)){return arr}else if(Symbol.iterator in Object(arr)){var _arr=[];for(var _iterator=arr[Symbol.iterator](),_step;!(_step=_iterator.next()).done;){_arr.push(_step.value);if(i&&_arr.length===i)break}return _arr}else{throw new TypeError("Invalid attempt to destructure non-iterable instance")}};babelHelpers.objectWithoutProperties=function(obj,keys){var target={};for(var i in obj){if(keys.indexOf(i)>=0)continue;if(!Object.prototype.hasOwnProperty.call(obj,i))continue;target[i]=obj[i]}return target};babelHelpers.hasOwn=Object.prototype.hasOwnProperty;babelHelpers.slice=Array.prototype.slice;babelHelpers.bind=Function.prototype.bind;babelHelpers.defineProperty=function(obj,key,value){return Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})};babelHelpers.asyncToGenerator=function(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){var callNext=step.bind(null,"next");var callThrow=step.bind(null,"throw");function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{Promise.resolve(value).then(callNext,callThrow)}}callNext()})}};babelHelpers.interopRequireWildcard=function(obj){return obj&&obj.__esModule?obj:{"default":obj}};babelHelpers._typeof=function(obj){return obj&&obj.constructor===Symbol?"symbol":typeof obj};babelHelpers._extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key]}}}return target};babelHelpers.get=function get(object,property,receiver){var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined}else{return get(parent,property,receiver)}}else if("value"in desc&&desc.writable){return desc.value}else{var getter=desc.get;if(getter===undefined){return undefined}return getter.call(receiver)}};babelHelpers.set=function set(object,property,value,receiver){var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent!==null){return set(parent,property,value,receiver)}}else if("value"in desc&&desc.writable){return desc.value=value}else{var setter=desc.set;if(setter!==undefined){return setter.call(receiver,value)}}};babelHelpers.classCallCheck=function(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}};babelHelpers.objectDestructuringEmpty=function(obj){if(obj==null)throw new TypeError("Cannot destructure undefined")};babelHelpers.temporalUndefined={};babelHelpers.temporalAssertDefined=function(val,name,undef){if(val===undef){throw new ReferenceError(name+" is not defined - temporal dead zone")}return true};babelHelpers.selfGlobal=typeof global==="undefined"?self:global})(typeof global==="undefined"?self:global);
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
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

},{"./utils/util":9}],3:[function(require,module,exports){
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

},{"../models/ResourceReference":6,"../utils/util":9}],4:[function(require,module,exports){
"use strict";

var TaskModel = require("../models/TaskModel");

var TaskCollection = Backbone.Collection.extend({
	url: "api/tasks",
	model: TaskModel,
	initialize: function initialize() {
		this._preventSorting = false;
		this.subscribe();
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
				task.set("parentid", 0);
				console.error("task has parent with id " + task.get("parentid") + " - but there is no such task");
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
		var sortindex = 0;
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
				success: function success() {
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

},{"../models/TaskModel":8}],5:[function(require,module,exports){
"use strict";
require("babel/external-helpers");
var TaskCollection = require("./collections/TaskCollection");
var Settings = require("./models/SettingModel");

var GanttView = require("./views/GanttView");

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

},{"./clientConfig":2,"./collections/TaskCollection":4,"./models/SettingModel":7,"./views/GanttView":12,"babel/external-helpers":1}],6:[function(require,module,exports){
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
        PartitNo: "2b00da46b57c0395", // have no idea what is that
        ProjectRef: params.project,
        sitekey: params.sitekey

    },
    initialize: function initialize() {}
});

module.exports = ResourceReference;

},{"../utils/util":9}],7:[function(require,module,exports){
"use strict";

var util = require("../utils/util");

var SettingModel = Backbone.Model.extend({
	defaults: {
		interval: "fix",
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

},{"../utils/util":9}],8:[function(require,module,exports){
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

        this.depends.each(function (m) {
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
            response.depend = response.depend.split(",");
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
    }
});

module.exports = TaskModel;

},{"../collections/ResourceReferenceCollection":3,"../utils/util":9}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
"use strict";


var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n<Project xmlns=\"http://schemas.microsoft.com/project\">\r\n    <SaveVersion>14</SaveVersion>\r\n    <Name>Gantt Tasks.xml</Name>\r\n    <Title>Gantt Tasks</Title>\r\n    <CreationDate><%= currentDate %></CreationDate>\r\n    <LastSaved><%= currentDate %></LastSaved>\r\n    <ScheduleFromStart>1</ScheduleFromStart>\r\n    <StartDate><%= startDate %></StartDate>\r\n    <FinishDate><%= finishDate %></FinishDate>\r\n    <FYStartDate>1</FYStartDate>\r\n    <CriticalSlackLimit>0</CriticalSlackLimit>\r\n    <CurrencyDigits>2</CurrencyDigits>\r\n    <CurrencySymbol>$</CurrencySymbol>\r\n    <CurrencyCode>USD</CurrencyCode>\r\n    <CurrencySymbolPosition>0</CurrencySymbolPosition>\r\n    <CalendarUID>1</CalendarUID>\r\n    <DefaultStartTime>08:00:00</DefaultStartTime>\r\n    <DefaultFinishTime>17:00:00</DefaultFinishTime>\r\n    <MinutesPerDay>480</MinutesPerDay>\r\n    <MinutesPerWeek>2400</MinutesPerWeek>\r\n    <DaysPerMonth>20</DaysPerMonth>\r\n    <DefaultTaskType>0</DefaultTaskType>\r\n    <DefaultFixedCostAccrual>3</DefaultFixedCostAccrual>\r\n    <DefaultStandardRate>0</DefaultStandardRate>\r\n    <DefaultOvertimeRate>0</DefaultOvertimeRate>\r\n    <DurationFormat>7</DurationFormat>\r\n    <WorkFormat>2</WorkFormat>\r\n    <EditableActualCosts>0</EditableActualCosts>\r\n    <HonorConstraints>0</HonorConstraints>\r\n    <InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>\r\n    <MultipleCriticalPaths>0</MultipleCriticalPaths>\r\n    <NewTasksEffortDriven>1</NewTasksEffortDriven>\r\n    <NewTasksEstimated>1</NewTasksEstimated>\r\n    <SplitsInProgressTasks>1</SplitsInProgressTasks>\r\n    <SpreadActualCost>0</SpreadActualCost>\r\n    <SpreadPercentComplete>0</SpreadPercentComplete>\r\n    <TaskUpdatesResource>1</TaskUpdatesResource>\r\n    <FiscalYearStart>0</FiscalYearStart>\r\n    <WeekStartDay>0</WeekStartDay>\r\n    <MoveCompletedEndsBack>0</MoveCompletedEndsBack>\r\n    <MoveRemainingStartsBack>0</MoveRemainingStartsBack>\r\n    <MoveRemainingStartsForward>0</MoveRemainingStartsForward>\r\n    <MoveCompletedEndsForward>0</MoveCompletedEndsForward>\r\n    <BaselineForEarnedValue>0</BaselineForEarnedValue>\r\n    <AutoAddNewResourcesAndTasks>1</AutoAddNewResourcesAndTasks>\r\n    <CurrentDate><%= currentDate %></CurrentDate>\r\n    <MicrosoftProjectServerURL>1</MicrosoftProjectServerURL>\r\n    <Autolink>1</Autolink>\r\n    <NewTaskStartDate>0</NewTaskStartDate>\r\n    <NewTasksAreManual>0</NewTasksAreManual>\r\n    <DefaultTaskEVMethod>0</DefaultTaskEVMethod>\r\n    <ProjectExternallyEdited>0</ProjectExternallyEdited>\r\n    <ExtendedCreationDate>1984-01-01T00:00:00</ExtendedCreationDate>\r\n    <ActualsInSync>0</ActualsInSync>\r\n    <RemoveFileProperties>0</RemoveFileProperties>\r\n    <AdminProject>0</AdminProject>\r\n    <UpdateManuallyScheduledTasksWhenEditingLinks>1</UpdateManuallyScheduledTasksWhenEditingLinks>\r\n    <KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>0</KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>\r\n    <OutlineCodes/>\r\n    <WBSMasks/>\r\n    <ExtendedAttributes>\r\n        <ExtendedAttribute>\r\n            <FieldID>188743752</FieldID>\r\n            <FieldName>Flag1</FieldName>\r\n            <Guid>000039B7-8BBE-4CEB-82C4-FA8C0B400048</Guid>\r\n            <SecondaryPID>255868938</SecondaryPID>\r\n            <SecondaryGuid>000039B7-8BBE-4CEB-82C4-FA8C0F40400A</SecondaryGuid>\r\n        </ExtendedAttribute>\r\n        <ExtendedAttribute>\r\n            <FieldID>188744006</FieldID>\r\n            <FieldName>Text20</FieldName>\r\n            <Guid>000039B7-8BBE-4CEB-82C4-FA8C0B400146</Guid>\r\n            <SecondaryPID>255869047</SecondaryPID>\r\n            <SecondaryGuid>000039B7-8BBE-4CEB-82C4-FA8C0F404077</SecondaryGuid>\r\n        </ExtendedAttribute>\r\n    </ExtendedAttributes>\r\n    <Calendars>\r\n        <Calendar>\r\n            <UID>1</UID>\r\n            <Name>Standard</Name>\r\n            <IsBaseCalendar>1</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>-1</BaseCalendarUID>\r\n            <WeekDays>\r\n                <WeekDay>\r\n                    <DayType>1</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>2</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>3</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>4</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>5</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>6</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>7</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n            </WeekDays>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>3</UID>\r\n            <Name>Management</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>4</UID>\r\n            <Name>Project Manager</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>5</UID>\r\n            <Name>Analyst</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>6</UID>\r\n            <Name>Developer</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>7</UID>\r\n            <Name>Testers</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>8</UID>\r\n            <Name>Trainers</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>9</UID>\r\n            <Name>Technical Communicators</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>10</UID>\r\n            <Name>Deployment Team</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n    </Calendars>\r\n    <Tasks>\r\n        <% tasks.forEach(function(task){ %>\r\n            <Task>\r\n                <UID><%= task.id %></UID>\r\n                <ID><%= task.id %></ID>\r\n                <Name><%= task.name %></Name>\r\n                <Active>1</Active>\r\n                <Manual>0</Manual>\r\n                <Type>1</Type>\r\n                <IsNull>0</IsNull>\r\n                <CreateDate><%= task.start %></CreateDate>\r\n                <WBS>0</WBS>\r\n                <OutlineNumber>0</OutlineNumber>\r\n                <OutlineLevel>0</OutlineLevel>\r\n                <Priority>500</Priority>\r\n                <Start><%= task.start %></Start>\r\n                <Finish><%= task.finish %></Finish>\r\n                <Duration>PT766H0M0S</Duration>\r\n                <ManualStart><%= task.start %></ManualStart>\r\n                <ManualFinish><%= task.finish %></ManualFinish>\r\n                <ManualDuration>PT766H0M0S</ManualDuration>\r\n                <DurationFormat>21</DurationFormat>\r\n                <Work>PT1532H0M0S</Work>\r\n                <ResumeValid>0</ResumeValid>\r\n                <EffortDriven>0</EffortDriven>\r\n                <Recurring>0</Recurring>\r\n                <OverAllocated>0</OverAllocated>\r\n                <Estimated>0</Estimated>\r\n                <Milestone>0</Milestone>\r\n                <Summary>1</Summary>\r\n                <DisplayAsSummary>0</DisplayAsSummary>\r\n                <Critical>1</Critical>\r\n                <IsSubproject>0</IsSubproject>\r\n                <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n                <ExternalTask>0</ExternalTask>\r\n                <EarlyStart><%= task.start %>0</EarlyStart>\r\n                <EarlyFinish><%= task.finish %></EarlyFinish>\r\n                <LateStart><%= task.start %></LateStart>\r\n                <LateFinish><%= task.finish %></LateFinish>\r\n                <StartVariance>0</StartVariance>\r\n                <FinishVariance>0</FinishVariance>\r\n                <WorkVariance>91920000.00</WorkVariance>\r\n                <FreeSlack>0</FreeSlack>\r\n                <TotalSlack>0</TotalSlack>\r\n                <StartSlack>0</StartSlack>\r\n                <FinishSlack>0</FinishSlack>\r\n                <FixedCost>0</FixedCost>\r\n                <FixedCostAccrual>3</FixedCostAccrual>\r\n                <PercentComplete>0</PercentComplete>\r\n                <PercentWorkComplete>0</PercentWorkComplete>\r\n                <Cost>0</Cost>\r\n                <OvertimeCost>0</OvertimeCost>\r\n                <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n                <ActualDuration>PT0H0M0S</ActualDuration>\r\n                <ActualCost>0</ActualCost>\r\n                <ActualOvertimeCost>0</ActualOvertimeCost>\r\n                <ActualWork>PT0H0M0S</ActualWork>\r\n                <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n                <RegularWork>PT1532H0M0S</RegularWork>\r\n                <RemainingDuration>PT766H0M0S</RemainingDuration>\r\n                <RemainingCost>0</RemainingCost>\r\n                <RemainingWork>PT1532H0M0S</RemainingWork>\r\n                <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n                <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n                <ACWP>0.00</ACWP>\r\n                <CV>0.00</CV>\r\n                <ConstraintType>0</ConstraintType>\r\n                <CalendarUID>-1</CalendarUID>\r\n                <LevelAssignments>1</LevelAssignments>\r\n                <LevelingCanSplit>1</LevelingCanSplit>\r\n                <LevelingDelay>0</LevelingDelay>\r\n                <LevelingDelayFormat>8</LevelingDelayFormat>\r\n                <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n                <HideBar>0</HideBar>\r\n                <Rollup>0</Rollup>\r\n                <BCWS>0.00</BCWS>\r\n                <BCWP>0.00</BCWP>\r\n                <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n                <EarnedValueMethod>0</EarnedValueMethod>\r\n                <IsPublished>0</IsPublished>\r\n                <CommitmentType>0</CommitmentType>\r\n            </Task><% }); %>\r\n    </Tasks>\r\n    <Resources>\r\n        <Resource>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <WorkGroup>0</WorkGroup>\r\n            <MaxUnits>1.00</MaxUnits>\r\n            <PeakUnits>0.00</PeakUnits>\r\n            <OverAllocated>0</OverAllocated>\r\n            <CanLevel>1</CanLevel>\r\n            <AccrueAt>3</AccrueAt>\r\n            <Work>PT0H0M0S</Work>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <StandardRate>0</StandardRate>\r\n            <StandardRateFormat>2</StandardRateFormat>\r\n            <Cost>0</Cost>\r\n            <OvertimeRate>0</OvertimeRate>\r\n            <OvertimeRateFormat>2</OvertimeRateFormat>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <CostPerUse>0</CostPerUse>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <CostVariance>0</CostVariance>\r\n            <SV>0.00</SV>\r\n            <CV>0.00</CV>\r\n            <ACWP>0.00</ACWP>\r\n            <CalendarUID>2</CalendarUID>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <IsGeneric>0</IsGeneric>\r\n            <IsInactive>0</IsInactive>\r\n            <IsEnterprise>0</IsEnterprise>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate>2012-08-07T08:59:00</CreationDate>\r\n            <IsCostResource>0</IsCostResource>\r\n            <IsBudget>0</IsBudget>\r\n        </Resource>\r\n    </Resources>\r\n    <Assignments>\r\n        <Assignment>\r\n            <UID>6</UID>\r\n            <TaskUID>6</TaskUID>\r\n            <ResourceUID>-65535</ResourceUID>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ACWP>0.00</ACWP>\r\n            <Confirmed>0</Confirmed>\r\n            <Cost>0</Cost>\r\n            <CostRateTable>0</CostRateTable>\r\n            <RateScale>0</RateScale>\r\n            <CostVariance>0</CostVariance>\r\n            <CV>0.00</CV>\r\n            <Delay>0</Delay>\r\n            <Finish>2014-04-18T12:00:00</Finish>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <HasFixedRateUnits>1</HasFixedRateUnits>\r\n            <FixedMaterial>0</FixedMaterial>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>7</LevelingDelayFormat>\r\n            <LinkedFields>0</LinkedFields>\r\n            <Milestone>1</Milestone>\r\n            <Overallocated>0</Overallocated>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ResponsePending>0</ResponsePending>\r\n            <Start>2014-04-18T12:00:00</Start>\r\n            <StartVariance>0</StartVariance>\r\n            <Units>1</Units>\r\n            <UpdateNeeded>0</UpdateNeeded>\r\n            <VAC>0.00</VAC>\r\n            <Work>PT0H0M0S</Work>\r\n            <WorkContour>0</WorkContour>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate>2012-08-07T08:59:00</CreationDate>\r\n            <BudgetCost>0</BudgetCost>\r\n            <BudgetWork>PT0H0M0S</BudgetWork>\r\n        </Assignment>\r\n    </Assignments>\r\n</Project>\r\n";
var compiled = _.template(xml);

function parseXMLObj(xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var tasks = [];
    _.each(obj.Project[0].Tasks[0].Task, function (xmlItem) {
        if (!xmlItem.Name) {
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

module.exports.JSONToXML = function (json) {
    var start = json[0].start;
    var end = json[0].end;
    var data = _.map(json, function (task) {
        if (start > task.start) {
            start = task.start;
        }
        if (end < task.end) {
            end = task.end;
        }
        return {
            id: task.sortindex,
            name: task.name,
            start: task.start.format("yyyy-mm-dd;hh:mm:ss").replace(";", "T"),
            end: task.end.format("yyyy-mm-dd;hh:mm:ss").replace(";", "T")
        };
    });
    return compiled({
        tasks: data,
        currentDate: new Date().toISOString(),
        startDate: start,
        finishDate: end
    });
};

},{}],11:[function(require,module,exports){
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

},{"../utils/util":9}],12:[function(require,module,exports){
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
      dateFormat: this.settings.getDateFormat()
    }), tasksContainer);

    this.listenTo(this.collection, "sort", _.debounce((function () {
      console.log("recompile");
      React.unmountComponentAtNode(tasksContainer);
      React.render(React.createElement(SidePanel, {
        collection: this.collection,
        dateFormat: this.settings.getDateFormat()
      }), tasksContainer);
    }).bind(this), 5));
  },
  events: {
    "click #tHandle": "expand"
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
  }
});

module.exports = GanttView;

},{"./Notifications":14,"./TopMenuView/TopMenuView":20,"./canvasChart/GanttChartView":25,"./sideBar/ContextMenuView":27,"./sideBar/SidePanel":30}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
"use strict";

var parseXML = require("../../utils/xmlWorker").parseXMLObj;
var JSONToXML = require("../../utils/xmlWorker").JSONToXML;
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
            var data = JSONToXML(this.collection.toJSON());
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

},{"../../utils/xmlWorker":10}],19:[function(require,module,exports){
"use strict";

var ReportsMenuView = Backbone.View.extend({
    el: "#reports-menu",
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    events: {
        "click #print": "generatePDF",
        "click #showVideo": "showHelp",
        "click #delete-all": "deleteAll"
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

module.exports = ReportsMenuView;

},{}],20:[function(require,module,exports){
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

},{"./FilterMenuView":16,"./GroupingMenuView":17,"./MSProjectMenuView":18,"./MiscMenuView":19,"./ZoomMenuView":21}],21:[function(require,module,exports){
"use strict";

var ZoomMenuView = Backbone.View.extend({
    el: "#zoom-menu",
    initialize: function initialize(params) {
        this.settings = params.settings;
    },
    events: {
        "click .action": "onIntervalButtonClicked"
    },
    onIntervalButtonClicked: function onIntervalButtonClicked(evt) {
        var button = $(evt.currentTarget);
        var action = button.data("action");
        var interval = action.split("-")[1];
        this.settings.set("interval", interval);
    }
});

module.exports = ZoomMenuView;

},{}],22:[function(require,module,exports){
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

},{"./BasicTaskView":23}],23:[function(require,module,exports){
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
    _completeColor: "#e88134",
    _toolbarOffset: 20,
    _resourceListOffset: 20,
    _milestoneColor: "blue",
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
            "click .resources": "_editResources"
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
        var arc = new Konva.Shape({
            y: this._topPadding,
            fill: "lightgreen",
            drawFunc: function drawFunc(context) {
                var horOffset = 6;
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

        group.add(fakeBackground, diamond, rect, completeRect, arc, toolbar, resourceList);
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
        this.el.getLayer().draw();
    },
    _hideTools: function _hideTools() {
        this.el.find(".dependencyTool").hide();
        this.el.find(".resources").hide();
        this.el.getLayer().draw();
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
        var connector = new Konva.Line({
            stroke: "black",
            strokeWidth: 1,
            points: [pos.x - stage.x(), pos.y, pos.x - stage.x(), pos.y],
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
            var res = _.find(this.settings.statuses.resourcedata || [], function (res) {
                return res.UserId.toString() === resourceId.toString();
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

},{"../ResourcesEditor":15}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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
        this.stage.add(this.Blayer, this.Flayer);
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
        var grid = new Konva.Shape({
            sceneFunc: this._getSceneFunction(),
            stroke: "lightgray",
            strokeWidth: 0,
            fill: "rgba(0,0,0,0.1)",
            name: "grid"
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
            var y = Math.max(0, document.body.scrollTop - 15);
            grid.y(y);
            grid.getLayer().batchDraw();
        });

        this.Blayer.add(back).add(currentDayLine).add(grid);
        this._updateTodayLine();
        this.stage.draw();
    },
    _getSceneFunction: function _getSceneFunction() {
        var sdisplay = this.settings.sdisplay;
        var sattr = this.settings.sattr;
        var borderWidth = sdisplay.borderWidth || 1;
        var offset = 1;
        var rowHeight = 20;

        return function (context) {
            var i,
                s,
                iLen = 0,
                daysWidth = sattr.daysWidth,
                x,
                length,
                hData = sattr.hData;
            var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;

            context.beginPath();
            //draw three lines
            for (i = 1; i < 4; i++) {
                context.moveTo(offset, i * rowHeight - offset);
                context.lineTo(lineWidth + offset, i * rowHeight - offset);
            }

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

                    context._context.save();
                    context._context.font = "10pt Arial,Helvetica,sans-serif";
                    context._context.textAlign = "center";
                    context._context.textBaseline = "middle";
                    context._context.fillText(hData[s][i].text, x - length / 2, yf - rowHeight / 2);
                    context._context.restore();
                }
                yi = yf;yf = yf + rowHeight;
            }

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
                    context.moveTo(xi, yi);
                    context.lineTo(xi, this.getStage().height());
                    context.lineTo(xi - length, this.getStage().height());
                    context.lineTo(xi - length, yi);
                } else {
                    context.moveTo(xi, yi);
                    context.lineTo(xi, this.getStage().height());
                }
                context._context.save();
                context._context.font = "6pt Arial,Helvetica,sans-serif";
                context._context.textAlign = "center";
                context._context.textBaseline = "middle";
                if (hideDate) {
                    context._context.font = "1pt Arial,Helvetica,sans-serif";
                }
                context._context.fillText(hData[s][i].text, x - length / 2, yi + rowHeight / 2);
                context._context.restore();
            }
            context.fillStrokeShape(this);
        };
    },
    _cacheBackground: function _cacheBackground() {
        var sattr = this.settings.sattr;
        var lineWidth = Date.daysdiff(sattr.boundaryMin, sattr.boundaryMax) * sattr.daysWidth;
        this.Blayer.findOne(".grid").cache({
            x: 0,
            y: 0,
            width: lineWidth,
            height: this.stage.height()
        });
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

},{"./AloneTaskView":22,"./ConnectorView":24,"./NestedTaskView":26}],26:[function(require,module,exports){
/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require("./BasicTaskView");

var NestedTaskView = BasicTaskView.extend({
    _color: "#b3d1fc",
    _borderSize: 6,
    _barHeight: 10,
    _completeColor: "#C95F10",
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

},{"./BasicTaskView":23}],27:[function(require,module,exports){
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
        sortindex = this.app.tasks.last().get("sortindex") + 1;
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get("parentid");
    var task = this.collection.add(data, { parse: true });
    task.save();
};

module.exports = ContextMenuView;

},{"../CommentsView":11,"../ModalTaskEditView":13}],28:[function(require,module,exports){
"use strict";

var DatePicker = React.createClass({
    displayName: "DatePicker",
    componentDidMount: function componentDidMount() {
        $(this.getDOMNode()).datepicker({
            //            dateFormat: "dd/mm/yy",
            dateFormat: this.props.dateFormat,
            onSelect: (function () {
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
        //        this.getDOMNode().value = this.props.value.toString('dd/mm/yy');
        var dateStr = $.datepicker.formatDate(this.props.dateFormat, this.props.value);
        this.getDOMNode().value = dateStr;
        $(this.getDOMNode()).datepicker("refresh");
        return false;
    },
    render: function render() {
        return React.createElement("input", {
            //            defaultValue : this.props.value.toString('dd/MM/yyyy')
            defaultValue: $.datepicker.formatDate(this.props.dateFormat, this.props.value)
        });
    }
});

module.exports = DatePicker;

},{}],29:[function(require,module,exports){
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
        var subtasks = this.props.model.children.map(function (task) {
            if (task.get("hidden")) {
                return;
            }
            if (task.children.length) {
                return React.createElement(NestedTask, {
                    model: task,
                    isSubTask: true,
                    key: task.cid,
                    dateFormat: this.props.dateFormat
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
                dateFormat: this.props.dateFormat
            }));
        }, this);
        return React.createElement("li", {
            className: "task-list-container drag-item" + (this.props.isSubTask ? " sub-task" : ""),
            id: this.props.model.cid,
            "data-id": this.props.model.cid
        }, React.createElement("div", {
            id: this.props.model.cid,
            "data-id": this.props.model.cid
        }, React.createElement(TaskItem, {
            model: this.props.model,
            dateFormat: this.props.dateFormat
        })), React.createElement("ol", {
            className: "sub-task-list sortable"
        }, subtasks));
    }
});

module.exports = NestedTask;

},{"./TaskItem":31}],30:[function(require,module,exports){
"use strict";

var TaskItem = require("./TaskItem");
var NestedTask = require("./NestedTask");

function getData(container) {
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
            obj.children = getData(sublist);
        }
        data.push(obj);
    });
    return data;
}

var SidePanel = React.createClass({
    displayName: "SidePanel",
    componentDidMount: function componentDidMount() {
        this.props.collection.on("add remove", function () {
            this.requestUpdate();
        }, this);
        this.props.collection.on("change:hidden", function () {
            this.requestUpdate();
        }, this);
        this._makeSortable();
    },
    _makeSortable: function _makeSortable() {
        var container = $(".task-container");
        container.sortable({
            group: "sortable",
            containerSelector: "ol",
            itemSelector: ".drag-item",
            placeholder: "<li class=\"placeholder sort-placeholder\"/>",
            onDragStart: (function ($item, position, _super, event) {
                _super($item, position, _super, event);
                this.hightlighter.remove();
            }).bind(this),
            onDrag: (function ($item, position, _super, event) {
                var $placeholder = $(".sort-placeholder");
                var isSubTask = !$($placeholder.parent()).hasClass("task-container");
                $placeholder.css({
                    "padding-left": isSubTask ? "30px" : "0"
                });
                _super($item, position, _super, event);
            }).bind(this),
            onDrop: (function ($item, position, _super, event) {
                _super($item, position, _super, event);
                setTimeout((function () {
                    var data = getData(container);
                    this.props.collection.resort(data);
                }).bind(this), 10);
            }).bind(this)
        });

        this.hightlighter = $("<div>");
        this.hightlighter.css({
            position: "absolute",
            background: "grey",
            opacity: "0.5",
            top: "0",
            width: "100%"
        });

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
    render: function render() {
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
                    dateFormat: this.props.dateFormat
                }));
            } else {
                tasks.push(React.createElement("li", {
                    key: task.cid,
                    className: "drag-item",
                    "data-id": task.cid
                }, React.createElement(TaskItem, {
                    model: task,
                    dateFormat: this.props.dateFormat
                })));
            }
        }, this);
        return React.createElement("ol", {
            className: "task-container sortable"
        }, tasks);
    }
});

module.exports = SidePanel;

},{"./NestedTask":29,"./TaskItem":31}],31:[function(require,module,exports){
"use strict";
var DatePicker = require("./DatePicker");
var CommetsView = require("../CommentsView");

var TaskItem = React.createClass({
    displayName: "TaskItem",
    getInitialState: function getInitialState() {
        return {
            editRow: undefined
        };
    },
    componentDidUpdate: function componentDidUpdate() {
        $(this.getDOMNode()).find("input").focus();
    },
    componentDidMount: function componentDidMount() {
        this.props.model.on("change:name change:complete change:start change:end change:duration change:hightlight change:Comments", function () {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount: function componentWillUnmount() {
        this.props.model.off(null, null, this);
    },
    _findNestedLevel: function _findNestedLevel() {
        var level = 0;
        var parent = this.props.model.parent;
        while (true) {
            if (!parent) {
                return level;
            }
            level++;
            parent = parent.parent;
        }
    },
    _createField: function _createField(col) {
        if (this.state.editRow === col) {
            return this._createEditField(col);
        }
        return this._createReadFiled(col);
    },
    _createReadFiled: function _createReadFiled(col) {
        var model = this.props.model;
        if (col === "complete") {
            return model.get(col) + "%";
        }
        if (col === "start" || col === "end") {
            return $.datepicker.formatDate(this.props.dateFormat, model.get(col));
            //            return model.get(col).toString(this.props.dateFormat);
        }
        if (col === "duration") {
            return Date.daysdiff(model.get("start"), model.get("end")) + " d";
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
                var state = this.state;
                state.editRow = undefined;
                this.setState(state);
                this.props.model.set(col, newVal);
                this.props.model.save();
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
                var newVal = e.target.value;
                this._durationChange(newVal);
                var state = this.state;
                state.val = newVal;
                this.setState(state);
            }).bind(this),
            onKeyDown: (function (e) {
                if (e.keyCode === 13) {
                    var state = this.state;
                    state.editRow = undefined;
                    state.val = undefined;
                    this.setState(state);
                    this.props.model.save();
                }
            }).bind(this)
        });
    },
    _createEditField: function _createEditField(col) {
        var val = this.props.model.get(col);
        if (col === "start" || col === "end") {
            return this._createDateElement(col);
        }
        if (col === "duration") {
            return this._createDurationField();
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
                if (e.keyCode === 13) {
                    var state = this.state;
                    state.editRow = undefined;
                    this.setState(state);
                    this.props.model.save();
                }
            }).bind(this),
            onBlur: (function () {
                var state = this.state;
                state.editRow = undefined;
                this.setState(state);
                this.props.model.save();
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
    render: function render() {
        var model = this.props.model;
        return React.createElement("ul", {
            className: "task" + (this.props.isSubTask ? " sub-task" : "") + (this.props.model.get("collapsed") ? " collapsed" : ""),
            "data-id": this.props.model.cid,
            onDoubleClick: (function (e) {
                var className = e.target.className;
                if (!className) {
                    className = e.target.parentNode.className;
                }
                var col = className.slice(4, className.length);
                var state = this.state;
                state.editRow = col;
                this.setState(state);
            }).bind(this),
            style: {
                backgroundColor: this.props.model.get("hightlight")
            }
        }, React.createElement("li", {
            key: "info",
            className: "col-info"
        }, React.createElement("img", {
            src: "css/images/info.png",
            onClick: this.showContext
        })), React.createElement("li", {
            key: "sortindex",
            className: "col-sortindex"
        }, model.get("sortindex") + 1), React.createElement("li", {
            key: "name",
            className: "col-name"
        }, this.props.model.isNested() ? React.createElement("i", {
            className: "triangle icon " + (this.props.model.get("collapsed") ? "right" : "down"),
            onClick: (function () {
                this.props.model.set("collapsed", !this.props.model.get("collapsed"));
            }).bind(this)
        }) : undefined, React.createElement("div", {
            style: {
                paddingLeft: this._findNestedLevel() * 10 + "px"
            }
        }, this._createField("name"))), this.createCommentField(), React.createElement("li", {
            key: "complete",
            className: "col-complete"
        }, this._createField("complete")), React.createElement("li", {
            key: "start",
            className: "col-start"
        }, this._createField("start")), React.createElement("li", {
            key: "end",
            className: "col-end"
        }, this._createField("end")), React.createElement("li", {
            key: "duration",
            className: "col-duration"
        }, this._createField("duration")));
    }
});

module.exports = TaskItem;

},{"../CommentsView":11,"./DatePicker":28}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvbm9kZV9tb2R1bGVzL2JhYmVsL2V4dGVybmFsLWhlbHBlcnMuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NsaWVudENvbmZpZy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9jb2xsZWN0aW9ucy9UYXNrQ29sbGVjdGlvbi5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvZmFrZV9jYzkyY2RlOC5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Jlc291cmNlUmVmZXJlbmNlLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy94bWxXb3JrZXIuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0NvbW1lbnRzVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Nb2RhbFRhc2tFZGl0Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvTm90aWZpY2F0aW9ucy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvUmVzb3VyY2VzRWRpdG9yLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L01pc2NNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOzs7Ozs7O0FDRkEsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFakMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFN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QUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO0FBQ3RCLGVBQUcsRUFBRyxPQUFPO0FBQ2IscUJBQVMsRUFBRyxXQUFXO1NBQzFCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUM5QixLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRTtBQUN0QixlQUFHLEVBQUcsS0FBSztBQUNYLHFCQUFTLEVBQUcsU0FBUztTQUN4QixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDNUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsZUFBRyxFQUFHLFVBQVU7QUFDaEIscUJBQVMsRUFBRyxjQUFjO1NBQzdCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUNwQyxDQUFDO0tBQ1Q7Q0FDSixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuKGZ1bmN0aW9uKGdsb2JhbCl7dmFyIGJhYmVsSGVscGVycz1nbG9iYWwuYmFiZWxIZWxwZXJzPXt9O2JhYmVsSGVscGVycy5pbmhlcml0cz1mdW5jdGlvbihzdWJDbGFzcyxzdXBlckNsYXNzKXtpZih0eXBlb2Ygc3VwZXJDbGFzcyE9PVwiZnVuY3Rpb25cIiYmc3VwZXJDbGFzcyE9PW51bGwpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiBzdXBlckNsYXNzKX1zdWJDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzJiZzdXBlckNsYXNzLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnN1YkNsYXNzLGVudW1lcmFibGU6ZmFsc2Usd3JpdGFibGU6dHJ1ZSxjb25maWd1cmFibGU6dHJ1ZX19KTtpZihzdXBlckNsYXNzKXN1YkNsYXNzLl9fcHJvdG9fXz1zdXBlckNsYXNzfTtiYWJlbEhlbHBlcnMuZGVmYXVsdHM9ZnVuY3Rpb24ob2JqLGRlZmF1bHRzKXt2YXIga2V5cz1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7Zm9yKHZhciBpPTA7aTxrZXlzLmxlbmd0aDtpKyspe3ZhciBrZXk9a2V5c1tpXTt2YXIgdmFsdWU9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cyxrZXkpO2lmKHZhbHVlJiZ2YWx1ZS5jb25maWd1cmFibGUmJm9ialtrZXldPT09dW5kZWZpbmVkKXtPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLGtleSx2YWx1ZSl9fXJldHVybiBvYmp9O2JhYmVsSGVscGVycy5jcmVhdGVDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGtleSBpbiBwcm9wcyl7dmFyIHByb3A9cHJvcHNba2V5XTtwcm9wLmNvbmZpZ3VyYWJsZT10cnVlO2lmKHByb3AudmFsdWUpcHJvcC53cml0YWJsZT10cnVlfU9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl9cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuY3JlYXRlQ29tcHV0ZWRDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGk9MDtpPHByb3BzLmxlbmd0aDtpKyspe3ZhciBwcm9wPXByb3BzW2ldO3Byb3AuY29uZmlndXJhYmxlPXRydWU7aWYocHJvcC52YWx1ZSlwcm9wLndyaXRhYmxlPXRydWU7T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wLmtleSxwcm9wKX19cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuYXBwbHlDb25zdHJ1Y3Rvcj1mdW5jdGlvbihDb25zdHJ1Y3RvcixhcmdzKXt2YXIgaW5zdGFuY2U9T2JqZWN0LmNyZWF0ZShDb25zdHJ1Y3Rvci5wcm90b3R5cGUpO3ZhciByZXN1bHQ9Q29uc3RydWN0b3IuYXBwbHkoaW5zdGFuY2UsYXJncyk7cmV0dXJuIHJlc3VsdCE9bnVsbCYmKHR5cGVvZiByZXN1bHQ9PVwib2JqZWN0XCJ8fHR5cGVvZiByZXN1bHQ9PVwiZnVuY3Rpb25cIik/cmVzdWx0Omluc3RhbmNlfTtiYWJlbEhlbHBlcnMudGFnZ2VkVGVtcGxhdGVMaXRlcmFsPWZ1bmN0aW9uKHN0cmluZ3MscmF3KXtyZXR1cm4gT2JqZWN0LmZyZWV6ZShPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHJpbmdzLHtyYXc6e3ZhbHVlOk9iamVjdC5mcmVlemUocmF3KX19KSl9O2JhYmVsSGVscGVycy50YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZT1mdW5jdGlvbihzdHJpbmdzLHJhdyl7c3RyaW5ncy5yYXc9cmF3O3JldHVybiBzdHJpbmdzfTtiYWJlbEhlbHBlcnMuaW50ZXJvcFJlcXVpcmU9ZnVuY3Rpb24ob2JqKXtyZXR1cm4gb2JqJiZvYmouX19lc01vZHVsZT9vYmpbXCJkZWZhdWx0XCJdOm9ian07YmFiZWxIZWxwZXJzLnRvQXJyYXk9ZnVuY3Rpb24oYXJyKXtyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpP2FycjpBcnJheS5mcm9tKGFycil9O2JhYmVsSGVscGVycy50b0NvbnN1bWFibGVBcnJheT1mdW5jdGlvbihhcnIpe2lmKEFycmF5LmlzQXJyYXkoYXJyKSl7Zm9yKHZhciBpPTAsYXJyMj1BcnJheShhcnIubGVuZ3RoKTtpPGFyci5sZW5ndGg7aSsrKWFycjJbaV09YXJyW2ldO3JldHVybiBhcnIyfWVsc2V7cmV0dXJuIEFycmF5LmZyb20oYXJyKX19O2JhYmVsSGVscGVycy5zbGljZWRUb0FycmF5PWZ1bmN0aW9uKGFycixpKXtpZihBcnJheS5pc0FycmF5KGFycikpe3JldHVybiBhcnJ9ZWxzZSBpZihTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpe3ZhciBfYXJyPVtdO2Zvcih2YXIgX2l0ZXJhdG9yPWFycltTeW1ib2wuaXRlcmF0b3JdKCksX3N0ZXA7IShfc3RlcD1faXRlcmF0b3IubmV4dCgpKS5kb25lOyl7X2Fyci5wdXNoKF9zdGVwLnZhbHVlKTtpZihpJiZfYXJyLmxlbmd0aD09PWkpYnJlYWt9cmV0dXJuIF9hcnJ9ZWxzZXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKX19O2JhYmVsSGVscGVycy5vYmplY3RXaXRob3V0UHJvcGVydGllcz1mdW5jdGlvbihvYmosa2V5cyl7dmFyIHRhcmdldD17fTtmb3IodmFyIGkgaW4gb2JqKXtpZihrZXlzLmluZGV4T2YoaSk+PTApY29udGludWU7aWYoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosaSkpY29udGludWU7dGFyZ2V0W2ldPW9ialtpXX1yZXR1cm4gdGFyZ2V0fTtiYWJlbEhlbHBlcnMuaGFzT3duPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7YmFiZWxIZWxwZXJzLnNsaWNlPUFycmF5LnByb3RvdHlwZS5zbGljZTtiYWJlbEhlbHBlcnMuYmluZD1GdW5jdGlvbi5wcm90b3R5cGUuYmluZDtiYWJlbEhlbHBlcnMuZGVmaW5lUHJvcGVydHk9ZnVuY3Rpb24ob2JqLGtleSx2YWx1ZSl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosa2V5LHt2YWx1ZTp2YWx1ZSxlbnVtZXJhYmxlOnRydWUsY29uZmlndXJhYmxlOnRydWUsd3JpdGFibGU6dHJ1ZX0pfTtiYWJlbEhlbHBlcnMuYXN5bmNUb0dlbmVyYXRvcj1mdW5jdGlvbihmbil7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGdlbj1mbi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXt2YXIgY2FsbE5leHQ9c3RlcC5iaW5kKG51bGwsXCJuZXh0XCIpO3ZhciBjYWxsVGhyb3c9c3RlcC5iaW5kKG51bGwsXCJ0aHJvd1wiKTtmdW5jdGlvbiBzdGVwKGtleSxhcmcpe3RyeXt2YXIgaW5mbz1nZW5ba2V5XShhcmcpO3ZhciB2YWx1ZT1pbmZvLnZhbHVlfWNhdGNoKGVycm9yKXtyZWplY3QoZXJyb3IpO3JldHVybn1pZihpbmZvLmRvbmUpe3Jlc29sdmUodmFsdWUpfWVsc2V7UHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGNhbGxOZXh0LGNhbGxUaHJvdyl9fWNhbGxOZXh0KCl9KX19O2JhYmVsSGVscGVycy5pbnRlcm9wUmVxdWlyZVdpbGRjYXJkPWZ1bmN0aW9uKG9iail7cmV0dXJuIG9iaiYmb2JqLl9fZXNNb2R1bGU/b2JqOntcImRlZmF1bHRcIjpvYmp9fTtiYWJlbEhlbHBlcnMuX3R5cGVvZj1mdW5jdGlvbihvYmope3JldHVybiBvYmomJm9iai5jb25zdHJ1Y3Rvcj09PVN5bWJvbD9cInN5bWJvbFwiOnR5cGVvZiBvYmp9O2JhYmVsSGVscGVycy5fZXh0ZW5kcz1PYmplY3QuYXNzaWdufHxmdW5jdGlvbih0YXJnZXQpe2Zvcih2YXIgaT0xO2k8YXJndW1lbnRzLmxlbmd0aDtpKyspe3ZhciBzb3VyY2U9YXJndW1lbnRzW2ldO2Zvcih2YXIga2V5IGluIHNvdXJjZSl7aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSxrZXkpKXt0YXJnZXRba2V5XT1zb3VyY2Vba2V5XX19fXJldHVybiB0YXJnZXR9O2JhYmVsSGVscGVycy5nZXQ9ZnVuY3Rpb24gZ2V0KG9iamVjdCxwcm9wZXJ0eSxyZWNlaXZlcil7dmFyIGRlc2M9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QscHJvcGVydHkpO2lmKGRlc2M9PT11bmRlZmluZWQpe3ZhciBwYXJlbnQ9T2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7aWYocGFyZW50PT09bnVsbCl7cmV0dXJuIHVuZGVmaW5lZH1lbHNle3JldHVybiBnZXQocGFyZW50LHByb3BlcnR5LHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZX1lbHNle3ZhciBnZXR0ZXI9ZGVzYy5nZXQ7aWYoZ2V0dGVyPT09dW5kZWZpbmVkKXtyZXR1cm4gdW5kZWZpbmVkfXJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcil9fTtiYWJlbEhlbHBlcnMuc2V0PWZ1bmN0aW9uIHNldChvYmplY3QscHJvcGVydHksdmFsdWUscmVjZWl2ZXIpe3ZhciBkZXNjPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LHByb3BlcnR5KTtpZihkZXNjPT09dW5kZWZpbmVkKXt2YXIgcGFyZW50PU9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO2lmKHBhcmVudCE9PW51bGwpe3JldHVybiBzZXQocGFyZW50LHByb3BlcnR5LHZhbHVlLHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZT12YWx1ZX1lbHNle3ZhciBzZXR0ZXI9ZGVzYy5zZXQ7aWYoc2V0dGVyIT09dW5kZWZpbmVkKXtyZXR1cm4gc2V0dGVyLmNhbGwocmVjZWl2ZXIsdmFsdWUpfX19O2JhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjaz1mdW5jdGlvbihpbnN0YW5jZSxDb25zdHJ1Y3Rvcil7aWYoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX19O2JhYmVsSGVscGVycy5vYmplY3REZXN0cnVjdHVyaW5nRW1wdHk9ZnVuY3Rpb24ob2JqKXtpZihvYmo9PW51bGwpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBkZXN0cnVjdHVyZSB1bmRlZmluZWRcIil9O2JhYmVsSGVscGVycy50ZW1wb3JhbFVuZGVmaW5lZD17fTtiYWJlbEhlbHBlcnMudGVtcG9yYWxBc3NlcnREZWZpbmVkPWZ1bmN0aW9uKHZhbCxuYW1lLHVuZGVmKXtpZih2YWw9PT11bmRlZil7dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG5hbWUrXCIgaXMgbm90IGRlZmluZWQgLSB0ZW1wb3JhbCBkZWFkIHpvbmVcIil9cmV0dXJuIHRydWV9O2JhYmVsSGVscGVycy5zZWxmR2xvYmFsPXR5cGVvZiBnbG9iYWw9PT1cInVuZGVmaW5lZFwiP3NlbGY6Z2xvYmFsfSkodHlwZW9mIGdsb2JhbD09PVwidW5kZWZpbmVkXCI/c2VsZjpnbG9iYWwpO1xufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbmxldCB0YXNrc1N1YlVSTCA9ICcnO1xyXG4vLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xNyZzaXRla2V5PTJiMDBkYTQ2YjU3YzAzOTVcclxuaWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlICYmIHBhcmFtcy5zaXRla2V5KSB7XHJcbiAgICB0YXNrc1N1YlVSTCA9ICcvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGUgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcclxufVxyXG5leHBvcnQgdmFyIHRhc2tzVVJMID0gJ2FwaS90YXNrcy8nICsgdGFza3NTdWJVUkw7XHJcblxyXG5cclxubGV0IGNvbmZpZ1N1YlVSTCA9ICcnO1xyXG5pZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluZGV4T2YoJ2xvY2FsaG9zdCcpID09PSAtMSkge1xyXG4gICAgY29uZmlnU3ViVVJMID0gJy93YnMvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnNpdGVrZXk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgY29uZmlnVVJMID0gJy9hcGkvR2FudHRDb25maWcnICsgY29uZmlnU3ViVVJMO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZXNvdXJjZVJlZmVyZW5jZU1vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Jlc291cmNlUmVmZXJlbmNlJyk7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cbnZhciBDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgIHVybCA6ICdhcGkvcmVzb3VyY2VzLycgKyAocGFyYW1zLnByb2plY3QgfHwgMSkgKyAnLycgKyAocGFyYW1zLnByb2ZpbGUgfHwgMSksXG5cdG1vZGVsOiBSZXNvdXJjZVJlZmVyZW5jZU1vZGVsLFxuICAgIGlkQXR0cmlidXRlIDogJ0lEJyxcbiAgICB1cGRhdGVSZXNvdXJjZXNGb3JUYXNrIDogZnVuY3Rpb24odGFzaykge1xuICAgICAgICAvLyByZW1vdmUgb2xkIHJlZmVyZW5jZXNcbiAgICAgICAgdGhpcy50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihyZWYpIHtcbiAgICAgICAgICAgIGlmIChyZWYuZ2V0KCdXQlNJRCcpLnRvU3RyaW5nKCkgIT09IHRhc2suaWQudG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpc09sZCA9IHRhc2suZ2V0KCdyZXNvdXJjZXMnKS5pbmRleE9mKHJlZi5nZXQoJ1Jlc0lEJykpO1xuICAgICAgICAgICAgaWYgKGlzT2xkKSB7XG4gICAgICAgICAgICAgICAgcmVmLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIC8vIGFkZCBuZXcgcmVmZXJlbmNlc1xuICAgICAgICB0YXNrLmdldCgncmVzb3VyY2VzJykuZm9yRWFjaChmdW5jdGlvbihyZXNJZCkge1xuICAgICAgICAgICAgdmFyIGlzRXhpc3QgPSB0aGlzLmZpbmRXaGVyZSh7UmVzSUQgOiByZXNJZH0pO1xuICAgICAgICAgICAgaWYgKCFpc0V4aXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQoe1xuICAgICAgICAgICAgICAgICAgICBSZXNJRCA6IHJlc0lkLFxuICAgICAgICAgICAgICAgICAgICBXQlNJRCA6IHRhc2suaWQudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIHBhcnNlIDogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciByZXN1bHQgID0gW107XG4gICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0uUmVzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24ocmVzSXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSByZXNJdGVtO1xuICAgICAgICAgICAgICAgIG9iai5XQlNJRCA9IGl0ZW0uV0JTSUQ7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gob2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uO1xuXG4iLCJ2YXIgVGFza01vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Rhc2tNb2RlbCcpO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdHVybDogJ2FwaS90YXNrcycsXG5cdG1vZGVsOiBUYXNrTW9kZWwsXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5zdWJzY3JpYmUoKTtcblx0fSxcblx0Y29tcGFyYXRvcjogZnVuY3Rpb24obW9kZWwpIHtcblx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0bGlua0NoaWxkcmVuOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGFyZW50VGFzayA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChwYXJlbnRUYXNrKSB7XG5cdFx0XHRcdGlmIChwYXJlbnRUYXNrID09PSB0YXNrKSB7XG5cdFx0XHRcdFx0dGFzay5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdF9zb3J0Q2hpbGRyZW46IGZ1bmN0aW9uICh0YXNrLCBzb3J0SW5kZXgpIHtcblx0XHR0YXNrLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRjaGlsZC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbihjaGlsZCwgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdGNoZWNrU29ydGVkSW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAtMTtcblx0XHR0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKHRhc2ssIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0X3Jlc29ydENoaWxkcmVuOiBmdW5jdGlvbihkYXRhLCBzdGFydEluZGV4LCBwYXJlbnRJRCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSBzdGFydEluZGV4O1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbih0YXNrRGF0YSkge1xuXHRcdFx0dmFyIHRhc2sgPSB0aGlzLmdldCh0YXNrRGF0YS5pZCk7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudElEKSB7XG5cdFx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldChwYXJlbnRJRCk7XG5cdFx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNhdmUoe1xuXHRcdFx0XHRzb3J0aW5kZXg6ICsrc29ydEluZGV4LFxuXHRcdFx0XHRwYXJlbnRpZDogcGFyZW50SURcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhc2tEYXRhLmNoaWxkcmVuICYmIHRhc2tEYXRhLmNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9yZXNvcnRDaGlsZHJlbih0YXNrRGF0YS5jaGlsZHJlbiwgc29ydEluZGV4LCB0YXNrLmlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdHJlc29ydDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR0aGlzLl9yZXNvcnRDaGlsZHJlbihkYXRhLCAtMSwgMCk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0c3Vic2NyaWJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBhZGQgZW1wdHkgdGFzayBpZiBubyB0YXNrcyBmcm9tIHNlcnZlclxuICAgICAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldChbe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IHRhc2snXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHRcdG1vZGVsLnBhcmVudCA9IHBhcmVudDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0dGhpcy5fY2hlY2tEZXBlbmRlbmNpZXMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4ucmVtb3ZlKHRhc2spO1xuXHRcdFx0XHR0YXNrLnBhcmVudCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fcHJldmVudFNvcnRpbmcpIHtcblx0XHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGNyZWF0ZURlcGVuZGVuY3k6IGZ1bmN0aW9uIChiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmICh0aGlzLl9jYW5DcmVhdGVEZXBlbmRlbmNlKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSkge1xuXHRcdFx0YWZ0ZXJNb2RlbC5kZXBlbmRPbihiZWZvcmVNb2RlbCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9jYW5DcmVhdGVEZXBlbmRlbmNlOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmIChiZWZvcmVNb2RlbC5oYXNQYXJlbnQoYWZ0ZXJNb2RlbCkgfHwgYWZ0ZXJNb2RlbC5oYXNQYXJlbnQoYmVmb3JlTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChiZWZvcmVNb2RlbC5oYXNJbkRlcHMoYWZ0ZXJNb2RlbCkgfHxcblx0XHRcdGFmdGVyTW9kZWwuaGFzSW5EZXBzKGJlZm9yZU1vZGVsKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0cmVtb3ZlRGVwZW5kZW5jeTogZnVuY3Rpb24oYWZ0ZXJNb2RlbCkge1xuXHRcdGFmdGVyTW9kZWwuY2xlYXJEZXBlbmRlbmNlKCk7XG5cdH0sXG5cdF9jaGVja0RlcGVuZGVuY2llczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKCh0YXNrKSA9PiB7XG5cdFx0XHR2YXIgaWRzID0gdGFzay5nZXQoJ2RlcGVuZCcpLmNvbmNhdChbXSk7XG5cdFx0XHR2YXIgaGFzR29vZERlcGVuZHMgPSBmYWxzZTtcblx0XHRcdGlmIChpZHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Xy5lYWNoKGlkcywgKGlkKSA9PiB7XG5cdFx0XHRcdHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuZ2V0KGlkKTtcblx0XHRcdFx0aWYgKGJlZm9yZU1vZGVsKSB7XG5cdFx0XHRcdFx0dGFzay5kZXBlbmRPbihiZWZvcmVNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0aGFzR29vZERlcGVuZHMgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmICghaGFzR29vZERlcGVuZHMpIHtcblx0XHRcdFx0dGFzay5zYXZlKCdkZXBlbmQnLCBbXSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdG91dGRlbnQ6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgdW5kZXJTdWJsaW5ncyA9IFtdO1xuXHRcdGlmICh0YXNrLnBhcmVudCkge1xuXHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRpZiAoY2hpbGQuZ2V0KCdzb3J0aW5kZXgnKSA8PSB0YXNrLmdldCgnc29ydGluZGV4JykpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dW5kZXJTdWJsaW5ncy5wdXNoKGNoaWxkKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR1bmRlclN1YmxpbmdzLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5kZXBlbmRzLmdldCh0YXNrLmlkKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkLmNsZWFyRGVwZW5kZW5jZSgpO1xuICAgICAgICAgICAgfVxuXHRcdFx0Y2hpbGQuc2F2ZSgncGFyZW50aWQnLCB0YXNrLmlkKTtcblx0XHR9KTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdGlmICh0YXNrLnBhcmVudCAmJiB0YXNrLnBhcmVudC5wYXJlbnQpIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCB0YXNrLnBhcmVudC5wYXJlbnQuaWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgMCk7XG5cdFx0fVxuXHR9LFxuXHRpbmRlbnQ6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgcHJldlRhc2ssIGksIG07XG5cdFx0Zm9yIChpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0bSA9IHRoaXMuYXQoaSk7XG5cdFx0XHRpZiAoKG0uZ2V0KCdzb3J0aW5kZXgnKSA8IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSkgJiYgKHRhc2sucGFyZW50ID09PSBtLnBhcmVudCkpIHtcblx0XHRcdFx0cHJldlRhc2sgPSBtO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHByZXZUYXNrKSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgcHJldlRhc2suaWQpO1xuXHRcdH1cblx0fSxcbiAgICBpbXBvcnRUYXNrczogZnVuY3Rpb24odGFza0pTT05hcnJheSwgY2FsbGJhY2spIHtcblx0XHR2YXIgc29ydGluZGV4ID0gMDtcblx0XHRpZiAodGhpcy5sYXN0KCkpIHtcblx0XHRcdHNvcnRpbmRleCA9IHRoaXMubGFzdCgpLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0fVxuICAgICAgICB0YXNrSlNPTmFycmF5LmZvckVhY2goZnVuY3Rpb24odGFza0l0ZW0pIHtcbiAgICAgICAgICAgIHRhc2tJdGVtLnNvcnRpbmRleCA9ICsrc29ydGluZGV4O1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRhc2tKU09OYXJyYXkubGVuZ3RoO1xuICAgICAgICB2YXIgZG9uZSA9IDA7XG4gICAgICAgIHRoaXMuYWRkKHRhc2tKU09OYXJyYXksIHtwYXJzZTogdHJ1ZX0pLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgdGFzay5zYXZlKHt9LCB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUgPT09IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZURlcHM6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG4gICAgICAgIGRhdGEucGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5wYXJlbnQubmFtZSxcblx0XHRcdFx0b3V0bGluZTogaXRlbS5wYXJlbnQub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5jaGlsZC5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBpdGVtLmNoaWxkLm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hpbGQuc2F2ZSgncGFyZW50aWQnLCBwYXJlbnQuaWQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG5cdFx0ZGF0YS5kZXBzLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG4gICAgICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogZGVwLmJlZm9yZS5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBkZXAuYmVmb3JlLm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGFmdGVyTW9kZWwgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogZGVwLmFmdGVyLm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGRlcC5hZnRlci5vdXRsaW5lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrQ29sbGVjdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcbnJlcXVpcmUoJ2JhYmVsL2V4dGVybmFsLWhlbHBlcnMnKTtcbnZhciBUYXNrQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvVGFza0NvbGxlY3Rpb24nKTtcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vbW9kZWxzL1NldHRpbmdNb2RlbCcpO1xuXG52YXIgR2FudHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9HYW50dFZpZXcnKTtcbmltcG9ydCB7dGFza3NVUkwsIGNvbmZpZ1VSTH0gZnJvbSAnLi9jbGllbnRDb25maWcnO1xuXG5cbmZ1bmN0aW9uIGxvYWRUYXNrcyh0YXNrcykge1xuICAgIHZhciBkZmQgPSBuZXcgJC5EZWZlcnJlZCgpO1xuXHR0YXNrcy5mZXRjaCh7XG5cdFx0c3VjY2VzcyA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGZkLnJlc29sdmUoKTtcblx0XHR9LFxuXHRcdGVycm9yIDogZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBkZmQucmVqZWN0KGVycik7XG5cdFx0fSxcblx0XHRwYXJzZTogdHJ1ZSxcblx0XHRyZXNldCA6IHRydWVcblx0fSk7XG4gICAgcmV0dXJuIGRmZC5wcm9taXNlKCk7XG59XG5cbmZ1bmN0aW9uIGxvYWRTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgIHJldHVybiAkLmdldEpTT04oY29uZmlnVVJMKVxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgc2V0dGluZ3Muc3RhdHVzZXMgPSBkYXRhO1xuICAgICAgICB9KTtcbn1cblxuXG4kKCgpID0+IHtcblx0bGV0IHRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG4gICAgdGFza3MudXJsID0gdGFza3NVUkw7XG4gICAgbGV0IHNldHRpbmdzID0gbmV3IFNldHRpbmdzKHt9LCB7dGFza3MgOiB0YXNrc30pO1xuXG4gICAgd2luZG93LnRhc2tzID0gdGFza3M7XG4gICAgXG4gICAgJC53aGVuKGxvYWRUYXNrcyh0YXNrcykpXG4gICAgLnRoZW4oKCkgPT4gbG9hZFNldHRpbmdzKHNldHRpbmdzKSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTdWNjZXNzIGxvYWRpbmcgdGFza3MuJyk7XG4gICAgICAgIG5ldyBHYW50dFZpZXcoe1xuICAgICAgICAgICAgc2V0dGluZ3M6IHNldHRpbmdzLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogdGFza3NcbiAgICAgICAgfSkucmVuZGVyKCk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIGhpZGUgbG9hZGluZ1xuICAgICAgICAkKCcjbG9hZGVyJykuZmFkZU91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gZGlzcGxheSBoZWFkIGFsd2F5cyBvbiB0b3BcbiAgICAgICAgICAgICQoJyNoZWFkJykuY3NzKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA6ICdmaXhlZCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gZW5hYmxlIHNjcm9sbGluZ1xuICAgICAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdob2xkLXNjcm9sbCcpO1xuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nJywgZXJyb3IpO1xuICAgIH0pO1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBSZXNvdXJjZVJlZmVyZW5jZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcbiAgICBkZWZhdWx0czoge1xyXG4gICAgICAgIC8vIG1haW4gcGFyYW1zXHJcbiAgICAgICAgV0JTSUQgOiAxLCAvLyB0YXNrIGlkXHJcbiAgICAgICAgUmVzSUQ6IDEsIC8vIHJlc291cmNlIGlkXHJcbiAgICAgICAgVFNBY3RpdmF0ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gc29tZSBzZXJ2ZXIgcGFyYW1zXHJcbiAgICAgICAgV0JTUHJvZmlsZUlEIDogcGFyYW1zLnByb2ZpbGUsXHJcbiAgICAgICAgV0JTX0lEIDogcGFyYW1zLnByb2ZpbGUsXHJcbiAgICAgICAgUGFydGl0Tm8gOiAnMmIwMGRhNDZiNTdjMDM5NScsIC8vIGhhdmUgbm8gaWRlYSB3aGF0IGlzIHRoYXRcclxuICAgICAgICBQcm9qZWN0UmVmIDogcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgc2l0ZWtleTogcGFyYW1zLnNpdGVrZXlcclxuXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc291cmNlUmVmZXJlbmNlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG5cclxudmFyIFNldHRpbmdNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0ZGVmYXVsdHM6IHtcclxuXHRcdGludGVydmFsOiAnZml4JyxcclxuXHRcdC8vZGF5cyBwZXIgaW50ZXJ2YWxcclxuXHRcdGRwaTogMVxyXG5cdH0sXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cnMsIHBhcmFtcykge1xyXG5cdFx0dGhpcy5zdGF0dXNlcyA9IHVuZGVmaW5lZDtcclxuXHRcdHRoaXMuc2F0dHIgPSB7XHJcblx0XHRcdGhEYXRhOiB7fSxcclxuXHRcdFx0ZHJhZ0ludGVydmFsOiAxLFxyXG5cdFx0XHRkYXlzV2lkdGg6IDUsXHJcblx0XHRcdGNlbGxXaWR0aDogMzUsXHJcblx0XHRcdG1pbkRhdGU6IG5ldyBEYXRlKDIwMjAsMSwxKSxcclxuXHRcdFx0bWF4RGF0ZTogbmV3IERhdGUoMCwwLDApLFxyXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxyXG5cdFx0XHRib3VuZGFyeU1heDogbmV3IERhdGUoMjAyMCwxLDEpLFxyXG5cdFx0XHQvL21vbnRocyBwZXIgY2VsbFxyXG5cdFx0XHRtcGM6IDFcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcclxuXHRcdFx0c2NyZWVuV2lkdGg6ICAkKCcjZ2FudHQtY29udGFpbmVyJykuaW5uZXJXaWR0aCgpICsgNzg2LFxyXG5cdFx0XHR0SGlkZGVuV2lkdGg6IDMwNSxcclxuXHRcdFx0dGFibGVXaWR0aDogNzEwXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHBhcmFtcy50YXNrcztcclxuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XHJcblx0XHR0aGlzLm9uKCdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCBjaGFuZ2U6ZW5kJywgXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMoKTtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2U6d2lkdGgnKTtcclxuICAgICAgICB9LCA1MDApKTtcclxuXHR9LFxyXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xyXG5cdFx0aWYoYXR0cil7XHJcblx0XHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dW2F0dHJdO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV07XHJcblx0fSxcclxuXHRmaW5kU3RhdHVzSWQgOiBmdW5jdGlvbihzdGF0dXMpIHtcclxuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBzdGF0dXMudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZFN0YXR1c0ZvcklkIDogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdFN0YXR1c0lkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5jRGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cdGZpbmRIZWFsdGhJZCA6IGZ1bmN0aW9uKGhlYWx0aCkge1xyXG5cdFx0Zm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG5cdFx0XHRpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuXHRcdFx0XHRcdGlmIChzdGF0dXNJdGVtLmNmZ19pdGVtLnRvTG93ZXJDYXNlKCkgPT09IGhlYWx0aC50b0xvd2VyQ2FzZSgpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcbiAgICBmaW5kSGVhbHRoRm9ySWQgOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uSUQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSBpZC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGZpbmREZWZhdWx0SGVhbHRoSWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblx0ZmluZFdPSWQgOiBmdW5jdGlvbih3bykge1xyXG5cdFx0Zm9yKHZhciBpIGluIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGEpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhW2ldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5XT051bWJlci50b0xvd2VyQ2FzZSgpID09PSB3by50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5JRDtcclxuICAgICAgICAgICAgfVxyXG5cdFx0fVxyXG5cdH0sXHJcbiAgICBmaW5kV09Gb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBpIGluIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhW2ldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5JRC50b1N0cmluZygpID09PSBpZC50b1N0cmluZygpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5XT051bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdFdPSWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVswXS5JRDtcclxuICAgIH0sXHJcbiAgICBnZXREYXRlRm9ybWF0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICdkZC9tbS95eSc7XHJcbiAgICB9LFxyXG5cdGNhbGNtaW5tYXg6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG1pbkRhdGUgPSBuZXcgRGF0ZSgpLCBtYXhEYXRlID0gbWluRGF0ZS5jbG9uZSgpLmFkZFllYXJzKDEpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdzdGFydCcpLmNvbXBhcmVUbyhtaW5EYXRlKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRtaW5EYXRlPW1vZGVsLmdldCgnc3RhcnQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdlbmQnKS5jb21wYXJlVG8obWF4RGF0ZSkgPT09IDEpIHtcclxuXHRcdFx0XHRtYXhEYXRlPW1vZGVsLmdldCgnZW5kJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5zYXR0ci5taW5EYXRlID0gbWluRGF0ZTtcclxuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XHJcblx0fSxcclxuXHRzZXRBdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xyXG5cdFx0XHJcblx0XHR2YXIgaW50ZXJ2YWwgPSB0aGlzLmdldCgnaW50ZXJ2YWwnKTtcclxuXHJcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdkYWlseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDEsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoNjApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxNTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XHJcblx0XHRcdH07XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdFxyXG5cdFx0fSBlbHNlIGlmKGludGVydmFsID09PSAnd2Vla2x5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgNywge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApLm1vdmVUb0RheU9mV2VlaygxLCAtMSk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCAqIDc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyg3KTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMTIgKiAzMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDI7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbi5tb3ZlVG9GaXJzdERheU9mUXVhcnRlcigpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDMwICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMyk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnZml4Jykge1xyXG5cdFx0XHRjZWxsV2lkdGggPSAzMDtcclxuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xyXG5cdFx0XHRzaXplID0gZGF0dHIuc2NyZWVuV2lkdGggLSBkYXR0ci50SGlkZGVuV2lkdGggLSAxMDA7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNpemUgLyBkdXJhdGlvbjtcclxuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgZHBpLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IGRwaSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMzAgKiAxMCk7XHJcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbD09PSdhdXRvJykge1xyXG5cdFx0XHRkcGkgPSB0aGlzLmdldCgnZHBpJyk7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2F0dHIuY2VsbFdpZHRoIC8gZHBpO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yMCAqIGRwaSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDMwICogMTApO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XHJcblx0XHRcdH07XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdH1cclxuXHRcdHZhciBoRGF0YSA9IHtcclxuXHRcdFx0JzEnOiBbXSxcclxuXHRcdFx0JzInOiBbXSxcclxuXHRcdFx0JzMnOiBbXVxyXG5cdFx0fTtcclxuXHRcdHZhciBoZGF0YTMgPSBbXTtcclxuXHRcdFxyXG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcclxuXHJcblx0XHRsYXN0ID0gc3RhcnQ7XHJcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5JyB8fCBpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcclxuXHRcdFx0dmFyIGR1cmZ1bmM7XHJcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xyXG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5Nb250aChkYXRlLmdldEZ1bGxZZWFyKCksZGF0ZS5nZXRNb250aCgpKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdH1cclxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRoZGF0YTMucHVzaCh7XHJcblx0XHRcdFx0XHRcdGR1cmF0aW9uOiBkdXJmdW5jKGxhc3QpLFxyXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcclxuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xyXG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpc0hvbHkgPSBsYXN0LmdldERheSgpID09PSA2IHx8IGxhc3QuZ2V0RGF5KCkgPT09IDA7XHJcblx0XHRcdFx0aGRhdGEzLnB1c2goe1xyXG5cdFx0XHRcdFx0ZHVyYXRpb246IGludGVydmFsZGF5cyxcclxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGhvbHkgOiAoaW50ZXJ2YWwgPT09ICdkYWlseScpICYmIGlzSG9seVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xyXG5cdFx0XHRcdGxhc3QgPSBuZXh0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRzYXR0ci5ib3VuZGFyeU1heCA9IGVuZCA9IGxhc3Q7XHJcblx0XHRoRGF0YVsnMyddID0gaGRhdGEzO1xyXG5cclxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgZGF0ZSB0byBlbmQgb2YgeWVhclxyXG5cdFx0dmFyIGludGVyID0gRGF0ZS5kYXlzZGlmZihzdGFydCwgbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgMTEsIDMxKSk7XHJcblx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRkdXJhdGlvbjogaW50ZXIsXHJcblx0XHRcdHRleHQ6IHN0YXJ0LmdldEZ1bGxZZWFyKClcclxuXHRcdH0pO1xyXG5cdFx0Zm9yKGkgPSBzdGFydC5nZXRGdWxsWWVhcigpICsgMSwgaUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpOyBpIDwgaUxlbjsgaSsrKXtcclxuXHRcdFx0aW50ZXIgPSBEYXRlLmlzTGVhcFllYXIoaSkgPyAzNjYgOiAzNjU7XHJcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XHJcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHRcdHRleHQ6IGlcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGxhc3QgeWVhciB1cHRvIGVuZCBkYXRlXHJcblx0XHRpZiAoc3RhcnQuZ2V0RnVsbFllYXIoKSE9PWVuZC5nZXRGdWxsWWVhcigpKSB7XHJcblx0XHRcdGludGVyID0gRGF0ZS5kYXlzZGlmZihuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwgMCwgMSksIGVuZCk7XHJcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XHJcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHRcdHRleHQ6IGVuZC5nZXRGdWxsWWVhcigpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXHJcblx0XHRoRGF0YVsnMiddLnB1c2goe1xyXG5cdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihzdGFydCwgc3RhcnQuY2xvbmUoKS5tb3ZlVG9MYXN0RGF5T2ZNb250aCgpKSxcclxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRqID0gc3RhcnQuZ2V0TW9udGgoKSArIDE7XHJcblx0XHRpID0gc3RhcnQuZ2V0RnVsbFllYXIoKTtcclxuXHRcdGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTtcclxuXHRcdHZhciBlbmRtb250aCA9IGVuZC5nZXRNb250aCgpO1xyXG5cclxuXHRcdHdoaWxlIChpIDw9IGlMZW4pIHtcclxuXHRcdFx0d2hpbGUoaiA8IDEyKSB7XHJcblx0XHRcdFx0aWYgKGkgPT09IGlMZW4gJiYgaiA9PT0gZW5kbW9udGgpIHtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRoRGF0YVsnMiddLnB1c2goe1xyXG5cdFx0XHRcdFx0ZHVyYXRpb246IERhdGUuZ2V0RGF5c0luTW9udGgoaSwgaiksXHJcblx0XHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoaiwgJ20nKVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGogKz0gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpICs9IDE7XHJcblx0XHRcdGogPSAwO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGVuZC5nZXRNb250aCgpICE9PSBzdGFydC5nZXRNb250aCgpICYmIGVuZC5nZXRGdWxsWWVhcigpICE9PSBzdGFydC5nZXRGdWxsWWVhcigpKSB7XHJcblx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XHJcblx0XHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoZW5kLmNsb25lKCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCksIGVuZCksXHJcblx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGVuZC5nZXRNb250aCgpLCAnbScpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0c2F0dHIuaERhdGEgPSBoRGF0YTtcclxuXHR9LFxyXG5cdGNhbGN1bGF0ZUludGVydmFsczogZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLmNhbGNtaW5tYXgoKTtcclxuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xyXG5cdH0sXHJcblx0Y29uRFRvVDooZnVuY3Rpb24oKXtcclxuXHRcdHZhciBkVG9UZXh0PXtcclxuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdlbmQnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0J2R1cmF0aW9uJzpmdW5jdGlvbih2YWx1ZSxtb2RlbCl7XHJcblx0XHRcdFx0cmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuc3RhcnQsbW9kZWwuZW5kKSsnIGQnO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnc3RhdHVzJzpmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0dmFyIHN0YXR1c2VzPXtcclxuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXHJcblx0XHRcdFx0XHQnMTA5Jzonb3BlbicsXHJcblx0XHRcdFx0XHQnMTA4JyA6ICdyZWFkeSdcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHJldHVybiBzdGF0dXNlc1t2YWx1ZV07XHJcblx0XHRcdH1cclxuXHRcdFxyXG5cdFx0fTtcclxuXHRcdHJldHVybiBmdW5jdGlvbihmaWVsZCx2YWx1ZSxtb2RlbCl7XHJcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XHJcblx0XHR9O1xyXG5cdH0oKSlcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdNb2RlbDtcclxuIiwidmFyIFJlc0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9jb2xsZWN0aW9ucy9SZXNvdXJjZVJlZmVyZW5jZUNvbGxlY3Rpb24nKTtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuICAgIGNvbXBhcmF0b3I6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxudmFyIHJlc0xpbmtzID0gbmV3IFJlc0NvbGxlY3Rpb24oKTtcclxucmVzTGlua3MuZmV0Y2goKTtcclxuXHJcbnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBNQUlOIFBBUkFNU1xyXG4gICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGNvbXBsZXRlOiAwLCAgLy8gMCUgLSAxMDAlIHBlcmNlbnRzXHJcbiAgICAgICAgc29ydGluZGV4OiAwLCAgIC8vIHBsYWNlIG9uIHNpZGUgbWVudSwgc3RhcnRzIGZyb20gMFxyXG4gICAgICAgIGRlcGVuZDogW10sICAvLyBpZCBvZiB0YXNrc1xyXG4gICAgICAgIHN0YXR1czogJzExMCcsICAgICAgLy8gMTEwIC0gY29tcGxldGUsIDEwOSAgLSBvcGVuLCAxMDggLSByZWFkeVxyXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZDogbmV3IERhdGUoKSxcclxuICAgICAgICBwYXJlbnRpZDogMCxcclxuICAgICAgICBDb21tZW50czogMCxcclxuXHJcbiAgICAgICAgY29sb3I6ICcjMDA5MGQzJywgICAvLyB1c2VyIGNvbG9yLCBub3QgdXNlZCBmb3Igbm93XHJcblxyXG4gICAgICAgIC8vIHNvbWUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgcmVzb3VyY2VzOiBbXSwgICAgICAgICAvL2xpc3Qgb2YgaWRcclxuICAgICAgICBoZWFsdGg6IDIxLFxyXG4gICAgICAgIHJlcG9ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdvOiAyLCAgICAgICAgICAgICAgICAgIC8vU2VsZWN0IExpc3QgaW4gcHJvcGVydGllcyBtb2RhbCAgIChjb25maWdkYXRhKVxyXG4gICAgICAgIG1pbGVzdG9uZTogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZGVsaXZlcmFibGU6IGZhbHNlLCAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBmaW5hbmNpYWw6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIHRpbWVzaGVldHM6IGZhbHNlLCAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgYWN0dGltZXNoZWV0czogZmFsc2UsICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuXHJcbiAgICAgICAgLy8gc2VydmVyIHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIC8vIGRvbid0IHVzZSB0aGVtIG9uIGNsaWVudCBzaWRlXHJcbiAgICAgICAgUHJvamVjdFJlZjogcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgV0JTX0lEOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleSxcclxuXHJcblxyXG4gICAgICAgIC8vIHBhcmFtcyBmb3IgYXBwbGljYXRpb24gdmlld3NcclxuICAgICAgICAvLyBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIEpTT05cclxuICAgICAgICBoaWRkZW46IGZhbHNlLFxyXG4gICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXHJcbiAgICAgICAgaGlnaHRsaWdodDogJydcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBzZWxmIHZhbGlkYXRpb25cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc0xpbmtzLnVwZGF0ZVJlc291cmNlc0ZvclRhc2sodGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTptaWxlc3RvbmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0JywgbmV3IERhdGUodGhpcy5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hpbGRyZW4gcmVmZXJlbmNlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgU3ViVGFza3MoKTtcclxuICAgICAgICB0aGlzLmRlcGVuZHMgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXQoJ21pbGVzdG9uZScsIGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZpbmcgcmVmc1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ3BhcmVudGlkJykgPT09IHRoaXMuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLnBhcmVudCA9IHRoaXM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnNvcnRpbmRleCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrVGltZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdjb2xsYXBzZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNraW5nIG5lc3RlZCBzdGF0ZVxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUnLCB0aGlzLl9jaGVja05lc3RlZCk7XHJcblxyXG4gICAgICAgIC8vIHRpbWUgY2hlY2tpbmdcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpjb21wbGV0ZScsIHRoaXMuX2NoZWNrQ29tcGxldGUpO1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbkRlcGVuZHNDb2xsZWN0aW9uKCk7XHJcbiAgICB9LFxyXG4gICAgaXNOZXN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgfSxcclxuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XHJcbiAgICB9LFxyXG4gICAgaGlkZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2hpZGRlbicsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGRlcGVuZE9uOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgc2lsZW50KSB7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRzLmFkZChiZWZvcmVNb2RlbCwge3NpbGVudDogc2lsZW50fSk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGFzSW5EZXBzOiBmdW5jdGlvbiAobW9kZWwpIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLmRlcGVuZHMuZ2V0KG1vZGVsLmlkKTtcclxuICAgIH0sXHJcbiAgICB0b0pTT046IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBqc29uID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLnJlc291cmNlcztcclxuICAgICAgICBkZWxldGUganNvbi5oaWRkZW47XHJcbiAgICAgICAgZGVsZXRlIGpzb24uY29sbGFwc2VkO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmhpZ2h0bGlnaHQ7XHJcbiAgICAgICAganNvbi5kZXBlbmQgPSBqc29uLmRlcGVuZC5qb2luKCcsJyk7XHJcbiAgICAgICAgcmV0dXJuIGpzb247XHJcbiAgICB9LFxyXG4gICAgaGFzUGFyZW50OiBmdW5jdGlvbihwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gcGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNsZWFyRGVwZW5kZW5jZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRzLmVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kZXBlbmRzLnJlbW92ZShtKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfbGlzdGVuRGVwZW5kc0NvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAncmVtb3ZlIGFkZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaWRzID0gdGhpcy5kZXBlbmRzLm1hcCgobSkgPT4gbS5pZCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KCdkZXBlbmQnLCBpZHMpLnNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmRlcGVuZHMsICdhZGQnLCBmdW5jdGlvbihiZWZvcmVNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24udHJpZ2dlcignZGVwZW5kOmFkZCcsIGJlZm9yZU1vZGVsLCB0aGlzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmRlcGVuZHMsICdyZW1vdmUnLCBmdW5jdGlvbihiZWZvcmVNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24udHJpZ2dlcignZGVwZW5kOnJlbW92ZScsIGJlZm9yZU1vZGVsLCB0aGlzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmRlcGVuZHMsICdjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LnVuZGVyTW92aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2hlY2sgaW5maW5pdGUgZGVwZW5kIGxvb3BcclxuICAgICAgICAgICAgdmFyIGluRGVwcyA9IFt0aGlzXTtcclxuICAgICAgICAgICAgdmFyIGlzSW5maW5pdGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrRGVwcyhtb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtb2RlbC5kZXBlbmRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlcGVuZHMuZWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbkRlcHMuaW5kZXhPZihtKSA+IC0xIHx8IGlzSW5maW5pdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNJbmZpbml0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaW5EZXBzLnB1c2gobSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tEZXBzKG0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hlY2tEZXBzKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzSW5maW5pdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXQoJ3N0YXJ0JykgPCBiZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrTmVzdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ25lc3RlZFN0YXRlQ2hhbmdlJywgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0LCBlbmQ7XHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5zdGFydCkpe1xyXG4gICAgICAgICAgICBzdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwgJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKF8uaXNEYXRlKHJlc3BvbnNlLnN0YXJ0KSkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHJlc3BvbnNlLnN0YXJ0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcclxuICAgICAgICAgICAgZW5kID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2UuZW5kKSwgJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5lbmQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc0RhdGUocmVzcG9uc2UuZW5kKSkge1xyXG4gICAgICAgICAgICBlbmQgPSByZXNwb25zZS5lbmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZW5kID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gc3RhcnQgPCBlbmQgPyBzdGFydCA6IGVuZDtcclxuICAgICAgICByZXNwb25zZS5lbmQgPSBzdGFydCA8IGVuZCA/IGVuZCA6IHN0YXJ0O1xyXG5cclxuICAgICAgICByZXNwb25zZS5wYXJlbnRpZCA9IHBhcnNlSW50KHJlc3BvbnNlLnBhcmVudGlkIHx8ICcwJywgMTApO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgbnVsbCBwYXJhbXNcclxuICAgICAgICBfLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSByZXNvdXJjZXMgYXMgbGlzdCBvZiBJRFxyXG4gICAgICAgIHZhciBpZHMgPSBbXTtcclxuICAgICAgICAocmVzcG9uc2UuUmVzb3VyY2VzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc0luZm8pIHtcclxuICAgICAgICAgICAgaWRzLnB1c2gocmVzSW5mby5SZXNJRCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzcG9uc2UuUmVzb3VyY2VzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJlc3BvbnNlLnJlc291cmNlcyA9IGlkcztcclxuICAgICAgICBpZiAocmVzcG9uc2UubWlsZXN0b25lKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gcmVzcG9uc2UuZW5kO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBkZXBzIGZvciBuZXcgQVBJIChhcnJheSBvZiBkZXBzKVxyXG4gICAgICAgIGlmIChfLmlzTnVtYmVyKHJlc3BvbnNlLmRlcGVuZCkpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2UuZGVwZW5kID0gW3Jlc3BvbnNlLmRlcGVuZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChfLmlzU3RyaW5nKHJlc3BvbnNlLmRlcGVuZCkpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2UuZGVwZW5kID0gcmVzcG9uc2UuZGVwZW5kLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tUaW1lOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICAgICAgdmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkRW5kVGltZSA9IGNoaWxkLmdldCgnZW5kJyk7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkU3RhcnRUaW1lIDwgc3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihjaGlsZEVuZFRpbWUgPiBlbmRUaW1lKXtcclxuICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNldCgnc3RhcnQnLCBzdGFydFRpbWUpO1xyXG4gICAgICAgIHRoaXMuc2V0KCdlbmQnLCBlbmRUaW1lKTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tDb21wbGV0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlID0gMDtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlICs9IGNoaWxkLmdldCgnY29tcGxldGUnKSAvIGxlbmd0aDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0KCdjb21wbGV0ZScsIE1hdGgucm91bmQoY29tcGxldGUpKTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG9TdGFydDogZnVuY3Rpb24obmV3U3RhcnQpIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5ldyBzdGFydCBpcyB0aGUgc2FtZSBhcyBjdXJyZW50XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0LnRvRGF0ZVN0cmluZygpID09PSB0aGlzLmdldCgnc3RhcnQnKS50b0RhdGVTdHJpbmcoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgb2Zmc2V0XHJcbi8vICAgICAgICB2YXIgZGF5c0RpZmYgPSBNYXRoLmZsb29yKChuZXdTdGFydC50aW1lKCkgLSB0aGlzLmdldCgnc3RhcnQnKS50aW1lKCkpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNClcclxuICAgICAgICB2YXIgZGF5c0RpZmYgPSBEYXRlLmRheXNkaWZmKG5ld1N0YXJ0LCB0aGlzLmdldCgnc3RhcnQnKSkgLSAxO1xyXG4gICAgICAgIGlmIChuZXdTdGFydCA8IHRoaXMuZ2V0KCdzdGFydCcpKSB7XHJcbiAgICAgICAgICAgIGRheXNEaWZmICo9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hhbmdlIGRhdGVzXHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogbmV3U3RhcnQuY2xvbmUoKSxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXNEaWZmKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGFuZ2VzIGRhdGVzIGluIGFsbCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMudW5kZXJNb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzRGlmZik7XHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ2hpbGRyZW46IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQubW92ZShkYXlzKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlV2l0aENoaWxkcmVuOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0YXNrLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBtb3ZlOiBmdW5jdGlvbihkYXlzKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogdGhpcy5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKGRheXMpLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5cylcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2hpbGRyZW4oZGF5cyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHJcbiIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHR2YXIgcHJtYXJyID0gcHJtc3RyLnNwbGl0KCcmJyk7XG5cdHZhciBpLCB0bXBhcnI7XG5cdGZvciAoaSA9IDA7IGkgPCBwcm1hcnIubGVuZ3RoOyBpKyspIHtcblx0XHR0bXBhcnIgPSBwcm1hcnJbaV0uc3BsaXQoJz0nKTtcblx0XHRwYXJhbXNbdG1wYXJyWzBdXSA9IHRtcGFyclsxXTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRVUkxQYXJhbXMgPSBmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0dmFyIHBybXN0ciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xuXHRyZXR1cm4gcHJtc3RyICE9PSBudWxsICYmIHBybXN0ciAhPT0gJycgPyB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSA6IHt9O1xufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xyXG52YXIgeG1sID0gZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcveG1sVGVtcGxhdGUueG1sJywgJ3V0ZjgnKTtcclxudmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSh4bWwpO1xyXG5cclxuZnVuY3Rpb24gcGFyc2VYTUxPYmooeG1sU3RyaW5nKSB7XHJcbiAgICB2YXIgb2JqID0geG1sVG9KU09OLnBhcnNlU3RyaW5nKHhtbFN0cmluZyk7XHJcbiAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgIHRhc2tzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lIDogeG1sSXRlbS5OYW1lWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBzdGFydCA6IHhtbEl0ZW0uU3RhcnRbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGVuZCA6IHhtbEl0ZW0uRmluaXNoWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBjb21wbGV0ZSA6IHhtbEl0ZW0uUGVyY2VudENvbXBsZXRlWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBvdXRsaW5lOiB4bWxJdGVtLk91dGxpbmVOdW1iZXJbMF0uX3RleHQudG9TdHJpbmcoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdGFza3M7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLnBhcnNlRGVwc0Zyb21YTUwgPSBmdW5jdGlvbih4bWxTdHJpbmcpIHtcclxuICAgIHZhciBvYmogPSB4bWxUb0pTT04ucGFyc2VTdHJpbmcoeG1sU3RyaW5nKTtcclxuICAgIHZhciB1aWRzID0ge307XHJcbiAgICB2YXIgb3V0bGluZXMgPSB7fTtcclxuICAgIHZhciBkZXBzID0gW107XHJcbiAgICB2YXIgcGFyZW50cyA9IFtdO1xyXG4gICAgXy5lYWNoKG9iai5Qcm9qZWN0WzBdLlRhc2tzWzBdLlRhc2ssIGZ1bmN0aW9uKHhtbEl0ZW0pIHtcclxuICAgICAgICBpZiAoIXhtbEl0ZW0uTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICBuYW1lOiB4bWxJdGVtLk5hbWVbMF0uX3RleHQudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgb3V0bGluZTogeG1sSXRlbS5PdXRsaW5lTnVtYmVyWzBdLl90ZXh0LnRvU3RyaW5nKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHVpZHNbeG1sSXRlbS5VSURbMF0uX3RleHRdID0gaXRlbTtcclxuICAgICAgICBvdXRsaW5lc1tpdGVtLm91dGxpbmVdID0gaXRlbTtcclxuICAgIH0pO1xyXG4gICAgXy5lYWNoKG9iai5Qcm9qZWN0WzBdLlRhc2tzWzBdLlRhc2ssIGZ1bmN0aW9uKHhtbEl0ZW0pIHtcclxuICAgICAgICBpZiAoIXhtbEl0ZW0uTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXNrID0gdWlkc1t4bWxJdGVtLlVJRFswXS5fdGV4dF07XHJcbiAgICAgICAgLy8gdmFyIG5hbWUgPSB4bWxJdGVtLk5hbWVbMF0uX3RleHQ7XHJcbiAgICAgICAgdmFyIG91dGxpbmUgPSB0YXNrLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICh4bWxJdGVtLlByZWRlY2Vzc29yTGluaykge1xyXG4gICAgICAgICAgICB4bWxJdGVtLlByZWRlY2Vzc29yTGluay5mb3JFYWNoKChsaW5rKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmVmb3JlVUlEID0gbGluay5QcmVkZWNlc3NvclVJRFswXS5fdGV4dDtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmUgPSB1aWRzW2JlZm9yZVVJRF07XHJcblxyXG4gICAgICAgICAgICAgICAgZGVwcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBiZWZvcmU6IGJlZm9yZSxcclxuICAgICAgICAgICAgICAgICAgICBhZnRlcjogdGFza1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmVudE91dGxpbmUgPSBvdXRsaW5lLnNsaWNlKDAsb3V0bGluZS5sYXN0SW5kZXhPZignLicpKTtcclxuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG91dGxpbmVzW3BhcmVudE91dGxpbmVdO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignY2FuIG5vdCBmaW5kIHBhcmVudCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJlbnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBjaGlsZDogdGFza1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVwcyA6IGRlcHMsXHJcbiAgICAgICAgcGFyZW50cyA6IHBhcmVudHNcclxuICAgIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5wYXJzZVhNTE9iaiA9IHBhcnNlWE1MT2JqO1xyXG5cclxubW9kdWxlLmV4cG9ydHMuSlNPTlRvWE1MID0gZnVuY3Rpb24oanNvbikge1xyXG4gICAgdmFyIHN0YXJ0ID0ganNvblswXS5zdGFydDtcclxuICAgIHZhciBlbmQgPSBqc29uWzBdLmVuZDtcclxuICAgIHZhciBkYXRhID0gXy5tYXAoanNvbiwgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIGlmIChzdGFydCA+IHRhc2suc3RhcnQpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0YXNrLnN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW5kIDwgdGFzay5lbmQpIHtcclxuICAgICAgICAgICAgZW5kID0gdGFzay5lbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlkOiB0YXNrLnNvcnRpbmRleCxcclxuICAgICAgICAgICAgbmFtZSA6IHRhc2submFtZSxcclxuICAgICAgICAgICAgc3RhcnQgOiB0YXNrLnN0YXJ0LmZvcm1hdCgneXl5eS1tbS1kZDtoaDptbTpzcycpLnJlcGxhY2UoJzsnLCAnVCcpLFxyXG4gICAgICAgICAgICBlbmQgOiB0YXNrLmVuZC5mb3JtYXQoJ3l5eXktbW0tZGQ7aGg6bW06c3MnKS5yZXBsYWNlKCc7JywgJ1QnKVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21waWxlZCh7XHJcbiAgICAgICAgdGFza3MgOiBkYXRhLFxyXG4gICAgICAgIGN1cnJlbnREYXRlIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZSA6IHN0YXJ0LFxyXG4gICAgICAgIGZpbmlzaERhdGUgOiBlbmRcclxuICAgIH0pO1xyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIENvbW1lbnRzVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyN0YXNrQ29tbWVudHNNb2RhbCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25BcHByb3ZlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25IaWRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25IaWRlJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRGVueSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29uRGVueScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuXHJcbiAgICAgICAgdmFyIHVwZGF0ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBjb3VudCA9ICQoXCIjdGFza0NvbW1lbnRzXCIpLmNvbW1lbnRzKFwiY291bnRcIik7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KCdDb21tZW50cycsIGNvdW50KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0ge1xyXG4gICAgICAgICAgICBhZnRlckRlbGV0ZSA6IHVwZGF0ZUNvdW50LFxyXG4gICAgICAgICAgICBhZnRlckNvbW1lbnRBZGQgOiB1cGRhdGVDb3VudFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gaW5pdCBjb21tZW50c1xyXG4gICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5jb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICBnZXRDb21tZW50c1VybDogXCIvYXBpL2NvbW1lbnQvXCIgKyB0aGlzLm1vZGVsLmlkICsgXCIvXCIgKyBwYXJhbXMuc2l0ZWtleSArIFwiL1dCUy8wMDBcIixcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQgKyBcIi9cIiArIHBhcmFtcy5zaXRla2V5ICsgXCIvV0JTL1wiICsgcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuY29tbWVudHMoe1xyXG4gICAgICAgICAgICAgICAgZ2V0Q29tbWVudHNVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1lbnRzVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFNpZGVQYW5lbCA9IHJlcXVpcmUoJy4vc2lkZUJhci9TaWRlUGFuZWwnKTtcclxyXHJ2YXIgR2FudHRDaGFydFZpZXcgPSByZXF1aXJlKCcuL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3Jyk7XHJ2YXIgVG9wTWVudVZpZXcgPSByZXF1aXJlKCcuL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3Jyk7XHJccnZhciBOb3RpZmljYXRpb25zID0gcmVxdWlyZSgnLi9Ob3RpZmljYXRpb25zJyk7XHJcclxydmFyIEdhbnR0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcciAgICBlbDogJy5HYW50dCcsXHIgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHIgICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgLy8gbmV3IHRhc2sgYnV0dG9uXHIgICAgICAgICQoJy5uZXctdGFzaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdmFyIGxhc3RUYXNrID0gcGFyYW1zLmNvbGxlY3Rpb24ubGFzdCgpO1xyICAgICAgICAgICAgdmFyIGxhc3RJbmRleCA9IC0xO1xyICAgICAgICAgICAgaWYgKGxhc3RUYXNrKSB7XHIgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gbGFzdFRhc2suZ2V0KCdzb3J0aW5kZXgnKTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIHBhcmFtcy5jb2xsZWN0aW9uLmFkZCh7XHIgICAgICAgICAgICAgICAgbmFtZSA6ICdOZXcgdGFzaycsXHIgICAgICAgICAgICAgICAgc29ydGluZGV4IDogbGFzdEluZGV4ICsgMVxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIG5ldyBOb3RpZmljYXRpb25zKHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSk7XHJcclxyXHJcciAgICAgICAgbmV3IFRvcE1lbnVWaWV3KHtcciAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5ncyxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEdhbnR0Q2hhcnRWaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnJlbmRlcigpO1xyICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Ll91cGRhdGVTdGFnZUF0dHJzKCk7XHIgICAgICAgICAgICAvLyBzZXQgc2lkZSB0YXNrcyBwYW5lbCBoZWlnaHRcciAgICAgICAgICAgIHZhciAkc2lkZVBhbmVsID0gJCgnLm1lbnUtY29udGFpbmVyJyk7XHIgICAgICAgICAgICAkc2lkZVBhbmVsLmNzcyh7XHIgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnIDogd2luZG93LmlubmVySGVpZ2h0IC0gJHNpZGVQYW5lbC5vZmZzZXQoKS50b3BcciAgICAgICAgICAgIH0pO1xyICAgICAgICB9LmJpbmQodGhpcyksIDUwMCk7XHJcclxyICAgICAgICB2YXIgdGFza3NDb250YWluZXIgPSAkKCcudGFza3MnKS5nZXQoMCk7XHIgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2lkZVBhbmVsLCB7XHIgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KClcciAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgKTtcclxyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgY29uc29sZS5sb2coJ3JlY29tcGlsZScpO1xyICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0YXNrc0NvbnRhaW5lcik7XHIgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpXHIgICAgICAgICAgICAgICAgfSksXHIgICAgICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgICAgICk7XHIgICAgICAgIH0uYmluZCh0aGlzKSw1KSk7XHIgICAgfSxcciAgICBldmVudHM6IHtcciAgICAgICAgJ2NsaWNrICN0SGFuZGxlJzogJ2V4cGFuZCdcciAgICB9LFxyICAgIGNhbGN1bGF0ZUR1cmF0aW9uOiBmdW5jdGlvbigpe1xyXHIgICAgICAgIC8vIENhbGN1bGF0aW5nIHRoZSBkdXJhdGlvbiBmcm9tIHN0YXJ0IGFuZCBlbmQgZGF0ZVxyICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cInN0YXJ0XCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgZW5kZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHIgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPT0gXCJcIiAmJiBlbmRkYXRlICE9PSBcIlwiKXtcciAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgIHZhciB1dGMyID0gRGF0ZS5VVEMoZW5kZGF0ZS5nZXRGdWxsWWVhcigpLCBlbmRkYXRlLmdldE1vbnRoKCksIGVuZGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyICAgICAgICB9ZWxzZXtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKDApKTtcciAgICAgICAgfVxyICAgIH0sXHIgICAgZXhwYW5kOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LnRhcmdldCk7XHIgICAgICAgIGlmIChidXR0b24uaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgfVxyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA2MDApO1xyICAgICAgICBidXR0b24udG9nZ2xlQ2xhc3MoJ2NvbnRyYWN0Jyk7XHIgICAgfSxcciAgICBfbW92ZUNhbnZhc1ZpZXcgOiBmdW5jdGlvbigpIHtcciAgICAgICAgdmFyIHNpZGVCYXJXaWR0aCA9ICQoJy5tZW51LWNvbnRhaW5lcicpLndpZHRoKCk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5zZXRMZWZ0UGFkZGluZyhzaWRlQmFyV2lkdGgpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IEdhbnR0VmlldztcciIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBNb2RhbFRhc2tFZGl0Q29tcG9uZW50ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2VkaXRUYXNrJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy51aS5jaGVja2JveCcpLmNoZWNrYm94KCk7XHJcbiAgICAgICAgLy8gc2V0dXAgdmFsdWVzIGZvciBzZWxlY3RvcnNcclxuICAgICAgICB0aGlzLl9wcmVwYXJlU2VsZWN0cygpO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCcudGFidWxhci5tZW51IC5pdGVtJykudGFiKCk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdLCBbbmFtZT1cImVuZFwiXScpLmRhdGVwaWNrZXIoe1xyXG4vLyAgICAgICAgICAgIGRhdGVGb3JtYXQ6IFwiZGQvbW0veXlcIlxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZmlsbERhdGEoKTtcclxuXHJcbiAgICAgICAgLy8gb3BlbiBtb2RhbFxyXG4gICAgICAgIHRoaXMuJGVsLm1vZGFsKHtcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuSW5wdXRzKCk7XHJcblxyXG4gICAgfSxcclxuICAgIF9saXN0ZW5JbnB1dHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgJG1pbGVzdG9uZSA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwibWlsZXN0b25lXCJdJyk7XHJcbiAgICAgICAgdmFyICRkZWxpdmVyYWJsZSA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiZGVsaXZlcmFibGVcIl0nKTtcclxuICAgICAgICB2YXIgJHN0YXJ0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGFydFwiXScpO1xyXG4gICAgICAgIHZhciAkZW5kID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJlbmRcIl0nKTtcclxuICAgICAgICAkbWlsZXN0b25lLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9ICRtaWxlc3RvbmUucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhcnQudmFsKCRlbmQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgJGRlbGl2ZXJhYmxlLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkZGVsaXZlcmFibGUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoJGRlbGl2ZXJhYmxlLnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgJG1pbGVzdG9uZS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVTZWxlY3RzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YXR1c1NlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhdHVzXCJdJyk7XHJcbiAgICAgICAgc3RhdHVzU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIGhlYWx0aFNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiaGVhbHRoXCJdJyk7XHJcbiAgICAgICAgaGVhbHRoU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIHdvcmtPcmRlclNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwid29cIl0nKTtcclxuICAgICAgICB3b3JrT3JkZXJTZWxlY3QuZW1wdHkoKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhLmZvckVhY2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAkKCc8b3B0aW9uIHZhbHVlPVwiJyArIGRhdGEuSUQgKyAnXCI+JyArIGRhdGEuV09OdW1iZXIgKyAnPC9vcHRpb24+JykuYXBwZW5kVG8od29ya09yZGVyU2VsZWN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfZmlsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhdHVzJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRTdGF0dXNJZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdoZWFsdGgnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdEhlYWx0aElkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3dvJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kV09Gb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFdPSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZVN0ciA9ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpLCB2YWwpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0KDApLnZhbHVlID0gZGF0ZVN0cjtcclxuICAgICAgICAgICAgICAgIGlucHV0LmRhdGVwaWNrZXIoIFwicmVmcmVzaFwiICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKCdjaGVja2VkJywgdmFsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnZhbCh2YWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwibWlsZXN0b25lXCJdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9zYXZlRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gaW5wdXQudmFsKCkuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBEYXRlKGRhdGVbMl0gKyAnLScgKyBkYXRlWzFdICsgJy0nICsgZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIG5ldyBEYXRlKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnByb3AoJ2NoZWNrZWQnKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnZhbCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2F2ZSgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kYWxUYXNrRWRpdENvbXBvbmVudDtcclxuIiwidmFyIE5vdGlmaWNhdGlvbnMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdlcnJvcicsIF8uZGVib3VuY2UodGhpcy5vbkVycm9yLCAxMCkpO1xyXG4gICAgfSxcclxuICAgIG9uRXJyb3IgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgbm90eSh7XHJcbiAgICAgICAgICAgIHRleHQ6ICdFcnJvciB3aGlsZSBzYXZpbmcgdGFzaywgcGxlYXNlIHJlZnJlc2ggeW91ciBicm93c2VyLCByZXF1ZXN0IHN1cHBvcnQgaWYgdGhpcyBlcnJvciBjb250aW51ZXMuJyxcclxuICAgICAgICAgICAgbGF5b3V0IDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgdHlwZSA6ICdlcnJvcidcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbnM7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBSZXNvdXJjZUVkaXRvclZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICB2YXIgc3RhZ2VQb3MgPSAkKCcjZ2FudHQtY29udGFpbmVyJykub2Zmc2V0KCk7XHJcbiAgICAgICAgdmFyIGZha2VFbCA9ICQoJzxkaXY+JykuYXBwZW5kVG8oJ2JvZHknKTtcclxuICAgICAgICBmYWtlRWwuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICB0b3AgOiBwb3MueSArIHN0YWdlUG9zLnRvcCArICdweCcsXHJcbiAgICAgICAgICAgIGxlZnQgOiBwb3MueCArIHN0YWdlUG9zLmxlZnQgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucG9wdXAgPSAkKCcuY3VzdG9tLnBvcHVwJyk7XHJcbiAgICAgICAgZmFrZUVsLnBvcHVwKHtcclxuICAgICAgICAgICAgcG9wdXAgOiB0aGlzLnBvcHVwLFxyXG4gICAgICAgICAgICBvbiA6ICdob3ZlcicsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2JvdHRvbSBsZWZ0JyxcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVwLm9mZignLmVkaXRvcicpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KS5wb3B1cCgnc2hvdycpO1xyXG5cclxuICAgICAgICB0aGlzLl9hZGRSZXNvdXJjZXMoKTtcclxuICAgICAgICB0aGlzLnBvcHVwLmZpbmQoJy5idXR0b24nKS5vbignY2xpY2suZWRpdG9yJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAucG9wdXAoJ2hpZGUnKTtcclxuICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1cC5vZmYoJy5lZGl0b3InKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLl9mdWxsRGF0YSgpO1xyXG4gICAgfSxcclxuICAgIF9hZGRSZXNvdXJjZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnBvcHVwLmVtcHR5KCk7XHJcbiAgICAgICAgdmFyIGh0bWxTdHJpbmcgPSAnJztcclxuICAgICAgICAodGhpcy5zZXR0aW5ncy5zdGF0dXNlcy5yZXNvdXJjZWRhdGEgfHwgW10pLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgaHRtbFN0cmluZyArPSAnPGRpdiBjbGFzcz1cInVpIGNoZWNrYm94XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAgbmFtZT1cIicgKyByZXNvdXJjZS5Vc2VySWQgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxsYWJlbD4nICsgcmVzb3VyY2UuVXNlcm5hbWUgKyAnPC9sYWJlbD4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48YnI+JztcclxuICAgICAgICB9KTtcclxuICAgICAgICBodG1sU3RyaW5nICs9Jzxicj48ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PGRpdiBjbGFzcz1cInVpIHBvc2l0aXZlIHJpZ2h0IGJ1dHRvbiBzYXZlIHRpbnlcIj4nICtcclxuICAgICAgICAgICAgICAgICdDbG9zZScgK1xyXG4gICAgICAgICAgICAnPC9kaXY+PC9kaXY+JztcclxuICAgICAgICB0aGlzLnBvcHVwLmFwcGVuZChodG1sU3RyaW5nKTtcclxuICAgICAgICB0aGlzLnBvcHVwLmZpbmQoJy51aS5jaGVja2JveCcpLmNoZWNrYm94KCk7XHJcbiAgICB9LFxyXG4gICAgX2Z1bGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHBvcHVwID0gdGhpcy5wb3B1cDtcclxuICAgICAgICB0aGlzLm1vZGVsLmdldCgncmVzb3VyY2VzJykuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBwb3B1cC5maW5kKCdbbmFtZT1cIicgKyByZXNvdXJjZSArICdcIl0nKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3NhdmVEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHJlc291cmNlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnaW5wdXQnKS5lYWNoKGZ1bmN0aW9uKGksIGlucHV0KSB7XHJcbiAgICAgICAgICAgIHZhciAkaW5wdXQgPSAkKGlucHV0KTtcclxuICAgICAgICAgICAgaWYgKCRpbnB1dC5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc291cmNlcy5wdXNoKCRpbnB1dC5hdHRyKCduYW1lJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLm1vZGVsLnNldCgncmVzb3VyY2VzJywgcmVzb3VyY2VzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc291cmNlRWRpdG9yVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRmlsdGVyVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNmaWx0ZXItbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NoYW5nZSAjaGlnaHRsaWdodHMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGhpZ2h0bGlnaHRUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2h0bGlnaHRUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHRoaXMuY29sb3JzW2UudGFyZ2V0LnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2hhbmdlICNmaWx0ZXJzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBjcml0ZXJpYSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoY3JpdGVyaWEgPT09ICdyZXNldCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3dUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd1Rhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2hvdyBhbGwgcGFyZW50c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGFzay5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb2xvcnMgOiB7XHJcbiAgICAgICAgJ3N0YXR1cy1iYWNrbG9nJyA6ICcjRDJEMkQ5JyxcclxuICAgICAgICAnc3RhdHVzLXJlYWR5JyA6ICcjQjJEMUYwJyxcclxuICAgICAgICAnc3RhdHVzLWluIHByb2dyZXNzJyA6ICcjNjZBM0UwJyxcclxuICAgICAgICAnc3RhdHVzLWNvbXBsZXRlJyA6ICcjOTlDMjk5JyxcclxuICAgICAgICAnbGF0ZScgOiAnI0ZGQjJCMicsXHJcbiAgICAgICAgJ2R1ZScgOiAnICNGRkMyOTknLFxyXG4gICAgICAgICdtaWxlc3RvbmUnIDogJyNENkMyRkYnLFxyXG4gICAgICAgICdkZWxpdmVyYWJsZScgOiAnI0UwRDFDMicsXHJcbiAgICAgICAgJ2ZpbmFuY2lhbCcgOiAnI0YwRTBCMicsXHJcbiAgICAgICAgJ3RpbWVzaGVldHMnIDogJyNDMkMyQjInLFxyXG4gICAgICAgICdyZXBvcnRhYmxlJyA6ICcgI0UwQzJDMicsXHJcbiAgICAgICAgJ2hlYWx0aC1yZWQnIDogJ3JlZCcsXHJcbiAgICAgICAgJ2hlYWx0aC1hbWJlcicgOiAnI0ZGQkYwMCcsXHJcbiAgICAgICAgJ2hlYWx0aC1ncmVlbicgOiAnZ3JlZW4nXHJcbiAgICB9LFxyXG4gICAgX2dldE1vZGVsc0ZvckNyaXRlcmlhIDogZnVuY3Rpb24oY3JldGVyaWEpIHtcclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdyZXNldHMnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ3N0YXR1cycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICh0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChzdGF0dXMpIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ3N0YXR1cycpLnRvU3RyaW5nKCkgPT09IGlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnbGF0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdkdWUnKSB7XHJcbiAgICAgICAgICAgIHZhciBsYXN0RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIGxhc3REYXRlLmFkZFdlZWtzKDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpID4gbmV3IERhdGUoKSAmJiB0YXNrLmdldCgnZW5kJykgPCBsYXN0RGF0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChbJ21pbGVzdG9uZScsICdkZWxpdmVyYWJsZScsICdmaW5hbmNpYWwnLCAndGltZXNoZWV0cycsICdyZXBvcnRhYmxlJ10uaW5kZXhPZihjcmV0ZXJpYSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldChjcmV0ZXJpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignaGVhbHRoJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGggPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aElkID0gKHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGhlYWx0aCkgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnaGVhbHRoJykudG9TdHJpbmcoKSA9PT0gaGVhbHRoSWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBHcm91cGluZ01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2dyb3VwaW5nLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjdG9wLWV4cGFuZC1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjbGljayAjdG9wLWNvbGxhcHNlLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JvdXBpbmdNZW51VmlldztcclxuIiwidmFyIHBhcnNlWE1MID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMveG1sV29ya2VyJykucGFyc2VYTUxPYmo7XHJcbnZhciBKU09OVG9YTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5KU09OVG9YTUw7XHJcbnZhciBwYXJzZURlcHNGcm9tWE1MID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMveG1sV29ya2VyJykucGFyc2VEZXBzRnJvbVhNTDtcclxuXHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI3Byb2plY3QtbWVudScsXHJcblxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9zZXR1cElucHV0KCk7XHJcbiAgICB9LFxyXG4gICAgX3NldHVwSW5wdXQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW5wdXQgPSAkKCcjaW1wb3J0RmlsZScpO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGV2dC50YXJnZXQuZmlsZXM7XHJcbiAgICAgICAgICAgIF8uZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gZmlsZS5uYW1lLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZXh0ZW50aW9uID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlbnRpb24gIT09ICd4bWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ1RoZSBmaWxlIHR5cGUgXCInICsgZXh0ZW50aW9uICsgJ1wiIGlzIG5vdCBzdXBwb3J0ZWQuIE9ubHkgeG1sIGZpbGVzIGFyZSBhbGxvd2VkLiBQbGVhc2Ugc2F2ZSB5b3VyIE1TIHByb2plY3QgYXMgYSB4bWwgZmlsZSBhbmQgdHJ5IGFnYWluLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnhtbERhdGEgPSBlLnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnRXJyb3Igd2hpbGUgcGFyaW5nIGZpbGUuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICN1cGxvYWQtcHJvamVjdCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI21zaW1wb3J0JykubW9kYWwoe1xyXG4gICAgICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy54bWxEYXRhIHx8IHRoaXMuaW1wb3J0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjaW1wb3J0UHJvZ3Jlc3NcIikuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjaW1wb3J0RmlsZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjeG1saW5wdXQtZm9ybScpLnRyaWdnZXIoJ3Jlc2V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLmltcG9ydERhdGEuYmluZCh0aGlzKSwgMjApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAkKFwiI2ltcG9ydFByb2dyZXNzXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNpbXBvcnRGaWxlXCIpLnNob3coKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjbGljayAjZG93bmxvYWQtcHJvamVjdCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OVG9YTUwodGhpcy5jb2xsZWN0aW9uLnRvSlNPTigpKTtcclxuICAgICAgICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbZGF0YV0sIHt0eXBlIDogJ2FwcGxpY2F0aW9uL2pzb24nfSk7XHJcbiAgICAgICAgICAgIHNhdmVBcyhibG9iLCAnR2FudHRUYXNrcy54bWwnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcHJvZ3Jlc3MgOiBmdW5jdGlvbihwZXJjZW50KSB7XHJcbiAgICAgICAgJCgnI2ltcG9ydFByb2dyZXNzJykucHJvZ3Jlc3Moe1xyXG4gICAgICAgICAgICBwZXJjZW50IDogcGVyY2VudFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlRGF0YSA6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB2YXIgZGVmU3RhdHVzID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgdmFyIGRlZkhlYWx0aCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRIZWFsdGhJZCgpO1xyXG4gICAgICAgIHZhciBkZWZXTyA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRXT0lkKCk7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5oZWFsdGggPSBkZWZIZWFsdGg7XHJcbiAgICAgICAgICAgIGl0ZW0uc3RhdHVzID0gZGVmU3RhdHVzO1xyXG4gICAgICAgICAgICBpdGVtLndvID0gZGVmV087XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9LFxyXG4gICAgaW1wb3J0RGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBkZWxheSA9IDEwMDtcclxuICAgICAgICB0aGlzLnByb2dyZXNzKDApO1xyXG4gICAgICAgIC8vIHRoaXMgaXMgc29tZSBzb3J0IG9mIGNhbGxiYWNrIGhlbGwhIVxyXG4gICAgICAgIC8vIHdlIG5lZWQgdGltZW91dHMgZm9yIGJldHRlciB1c2VyIGV4cGVyaWVuY2VcclxuICAgICAgICAvLyBJIHRoaW5rIHVzZXIgd2FudCB0byBzZWUgYW5pbWF0ZWQgcHJvZ3Jlc3MgYmFyXHJcbiAgICAgICAgLy8gYnV0IHdpdGhvdXQgdGltZW91dHMgaXQgaXMgbm90IHBvc3NpYmxlLCByaWdodD9cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzKDEwKTtcclxuICAgICAgICAgICAgdmFyIGNvbCA9IHRoaXMuY29sbGVjdGlvbjtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBwYXJzZVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fcHJlcGFyZURhdGEoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygyNik7XHJcbiAgICAgICAgICAgICAgICBjb2wuaW1wb3J0VGFza3MoZGF0YSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg0Myk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg1OSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZXBzID0gcGFyc2VEZXBzRnJvbVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg3OCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wuY3JlYXRlRGVwcyhkZXBzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygxMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1wb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI21zaW1wb3J0JykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTVNQcm9qZWN0TWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFJlcG9ydHNNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNyZXBvcnRzLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjcHJpbnQnIDogJ2dlbmVyYXRlUERGJyxcclxuICAgICAgICAnY2xpY2sgI3Nob3dWaWRlbycgOiAnc2hvd0hlbHAnLFxyXG4gICAgICAgICdjbGljayAjZGVsZXRlLWFsbCcgOiAnZGVsZXRlQWxsJ1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUERGIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgd2luZG93LnByaW50KCk7XHJcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9LFxyXG4gICAgc2hvd0hlbHAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjc2hvd1ZpZGVvTW9kYWwnKS5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgfSxcclxuICAgIGRlbGV0ZUFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI2NvbmZpcm0nKS5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHdoaWxlKHRoaXMuY29sbGVjdGlvbi5hdCgwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5hdCgwKS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRzTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgWm9vbU1lbnVWaWV3ID0gcmVxdWlyZSgnLi9ab29tTWVudVZpZXcnKTtcclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSByZXF1aXJlKCcuL0dyb3VwaW5nTWVudVZpZXcnKTtcclxudmFyIEZpbHRlck1lbnVWaWV3ID0gcmVxdWlyZSgnLi9GaWx0ZXJNZW51VmlldycpO1xyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSByZXF1aXJlKCcuL01TUHJvamVjdE1lbnVWaWV3Jyk7XHJcbnZhciBNaXNjTWVudVZpZXcgPSByZXF1aXJlKCcuL01pc2NNZW51VmlldycpO1xyXG5cclxudmFyIFRvcE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIG5ldyBab29tTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgR3JvdXBpbmdNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBGaWx0ZXJNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNU1Byb2plY3RNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNaXNjTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvcE1lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBab29tTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjem9vbS1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgLmFjdGlvbic6ICdvbkludGVydmFsQnV0dG9uQ2xpY2tlZCdcclxuICAgIH0sXHJcbiAgICBvbkludGVydmFsQnV0dG9uQ2xpY2tlZCA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSAkKGV2dC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICB2YXIgYWN0aW9uID0gYnV0dG9uLmRhdGEoJ2FjdGlvbicpO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IGFjdGlvbi5zcGxpdCgnLScpWzFdO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KCdpbnRlcnZhbCcsIGludGVydmFsKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFpvb21NZW51VmlldztcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgQWxvbmVUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9ib3JkZXJXaWR0aCA6IDMsXHJcbiAgICBfY29sb3IgOiAnI0U2RjBGRicsXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gXy5leHRlbmQoQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZXZlbnRzKCksIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5sZWZ0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAucmlnaHRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5sZWZ0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAucmlnaHRCb3JkZXInIDogJ3JlbmRlcicsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5sZWZ0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAubGVmdEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZScsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5yaWdodEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLnJpZ2h0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWluKGxvY2FsWCwgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1heChsb2NhbFgsIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfcmVzaXplUG9pbnRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2V3LXJlc2l6ZSc7XHJcbiAgICB9LFxyXG4gICAgX2NoYW5nZVNpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGVmdFggPSB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpO1xyXG4gICAgICAgIHZhciByaWdodFggPSB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSArIHRoaXMuX2JvcmRlcldpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC53aWR0aChyaWdodFggLSBsZWZ0WCk7XHJcbiAgICAgICAgcmVjdC54KGxlZnRYKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNvbXBsZXRlIHBhcmFtc1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXTtcclxuICAgICAgICBjb21wbGV0ZVJlY3QueChsZWZ0WCk7XHJcbiAgICAgICAgY29tcGxldGVSZWN0LndpZHRoKHRoaXMuX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGgoKSk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngocmlnaHRYKTtcclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VzLngocmlnaHRYICsgdGhpcy5fdG9vbGJhck9mZnNldCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxIC0gdGhpcy5fYm9yZGVyV2lkdGgpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnbWlsZXN0b25lJykpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuZGlhbW9uZCcpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKS5oaWRlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuZGlhbW9uZCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKS5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxvbmVUYXNrVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBSZXNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4uL1Jlc291cmNlc0VkaXRvcicpO1xyXG5cclxudmFyIGxpbmtJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5saW5rSW1hZ2Uuc3JjID0gJ2Nzcy9pbWFnZXMvbGluay5wbmcnO1xyXG5cclxudmFyIHVzZXJJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG51c2VySW1hZ2Uuc3JjID0gJ2Nzcy9pbWFnZXMvdXNlci5wbmcnO1xyXG5cclxudmFyIEJhc2ljVGFza1ZpZXcgPSBCYWNrYm9uZS5Lb252YVZpZXcuZXh0ZW5kKHtcclxuICAgIF9mdWxsSGVpZ2h0IDogMjEsXHJcbiAgICBfdG9wUGFkZGluZyA6IDMsXHJcbiAgICBfYmFySGVpZ2h0IDogMTUsXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjZTg4MTM0JyxcclxuICAgIF90b29sYmFyT2Zmc2V0IDogMjAsXHJcbiAgICBfcmVzb3VyY2VMaXN0T2Zmc2V0IDogMjAsXHJcbiAgICBfbWlsZXN0b25lQ29sb3IgOiAnYmx1ZScsXHJcbiAgICBfbWlsZXN0b25lT2Zmc2V0IDogMCxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuX2Z1bGxIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVUeXBlICE9PSAnR3JvdXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdlbmQnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZWVudGVyJyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dUb29scygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVJlc291cmNlc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dyYWJQb2ludGVyKGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VsZWF2ZScgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVUb29scygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd1Jlc291cmNlc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRNb3VzZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ3N0YXJ0IC5kZXBlbmRlbmN5VG9vbCcgOiAnX3N0YXJ0Q29ubmVjdGluZycsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAuZGVwZW5kZW5jeVRvb2wnIDogJ19tb3ZlQ29ubmVjdCcsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5kZXBlbmRlbmN5VG9vbCcgOiAnX2NyZWF0ZURlcGVuZGVuY3knLFxyXG4gICAgICAgICAgICAnY2xpY2sgLnJlc291cmNlcycgOiAnX2VkaXRSZXNvdXJjZXMnXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLb252YS5Hcm91cCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IHBvcy54LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIGlkIDogdGhpcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgZmFrZUJhY2tncm91bmQgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnZmFrZUJhY2tncm91bmQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgbmFtZSA6ICdtYWluUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgZGlhbW9uZCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX21pbGVzdG9uZUNvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArdGhpcy5fYmFySGVpZ2h0IC8gMixcclxuICAgICAgICAgICAgeCA6IHRoaXMuX2JhckhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCAqIDAuOCxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjgsXHJcbiAgICAgICAgICAgIG9mZnNldFggOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjggLyAyLFxyXG4gICAgICAgICAgICBvZmZzZXRZIDogdGhpcy5fYmFySGVpZ2h0ICogMC44IC8gMixcclxuICAgICAgICAgICAgbmFtZSA6ICdkaWFtb25kJyxcclxuICAgICAgICAgICAgcm90YXRpb24gOiA0NSxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29tcGxldGVSZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgYXJjID0gbmV3IEtvbnZhLlNoYXBlKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgZmlsbCA6ICdsaWdodGdyZWVuJyxcclxuICAgICAgICAgICAgZHJhd0Z1bmM6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBob3JPZmZzZXQgPSA2O1xyXG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSAgc2VsZi5fYmFySGVpZ2h0ICsgKHNlbGYuX2JvcmRlclNpemUgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhob3JPZmZzZXQsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoaG9yT2Zmc2V0LCBzaXplIC8gMiwgc2l6ZSAvIDIsIC0gTWF0aC5QSSAvIDIsIE1hdGguUEkgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIHNpemUpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHZhciBpbWdTaXplID0gc2l6ZSAtIDQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShsaW5rSW1hZ2UsIDEsIChzaXplIC0gaW1nU2l6ZSkgLyAyLCBpbWdTaXplLCBpbWdTaXplKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGl0RnVuYyA6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlY3QoMCwgMCwgNiArIHNlbGYuX2JhckhlaWdodCwgc2VsZi5fYmFySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFNoYXBlKHRoaXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2RlcGVuZGVuY3lUb29sJyxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB0b29sYmFyID0gbmV3IEtvbnZhLkdyb3VwKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbmFtZSA6ICdyZXNvdXJjZXMnLFxyXG4gICAgICAgICAgICB2aXNpYmxlIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2l6ZSA9IHNlbGYuX2JhckhlaWdodCArIChzZWxmLl9ib3JkZXJTaXplIHx8IDApO1xyXG4gICAgICAgIHZhciB0b29sYmFjayA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6ICdsaWdodGdyZXknLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHNpemUsXHJcbiAgICAgICAgICAgIGNvcm5lclJhZGl1cyA6IDJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHVzZXJJbSA9IG5ldyBLb252YS5JbWFnZSh7XHJcbiAgICAgICAgICAgIGltYWdlIDogdXNlckltYWdlLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHNpemVcclxuICAgICAgICB9KTtcclxuICAgICAgICB0b29sYmFyLmFkZCh0b29sYmFjaywgdXNlckltKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc291cmNlTGlzdCA9IG5ldyBLb252YS5UZXh0KHtcclxuICAgICAgICAgICAgbmFtZSA6ICdyZXNvdXJjZUxpc3QnLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbGlzdGVuaW5nIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkKGZha2VCYWNrZ3JvdW5kLCBkaWFtb25kLCByZWN0LCBjb21wbGV0ZVJlY3QsIGFyYywgdG9vbGJhciwgcmVzb3VyY2VMaXN0KTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX2VkaXRSZXNvdXJjZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBSZXNvdXJjZUVkaXRvcih7XHJcbiAgICAgICAgICAgIG1vZGVsIDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS5nZXRQb2ludGVyUG9zaXRpb24oKTtcclxuICAgICAgICB2aWV3LnJlbmRlcihwb3MpO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLnJvdW5kKHggLyBkYXlzV2lkdGgpLCBkYXlzMiA9IE1hdGgucm91bmQoKHggKyBsZW5ndGgpIC8gZGF5c1dpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcclxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zaG93VG9vbHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKS5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVRvb2xzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX3Nob3dSZXNvdXJjZXNMaXN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0Jykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVJlc291cmNlc0xpc3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9ncmFiUG9pbnRlciA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgbmFtZSA9IGUudGFyZ2V0Lm5hbWUoKTtcclxuICAgICAgICBpZiAoKG5hbWUgPT09ICdtYWluUmVjdCcpIHx8IChuYW1lID09PSAnZGVwZW5kZW5jeVRvb2wnKSB8fFxyXG4gICAgICAgICAgICAobmFtZSA9PT0gJ2NvbXBsZXRlUmVjdCcpIHx8IChlLnRhcmdldC5nZXRQYXJlbnQoKS5uYW1lKCkgPT09ICdyZXNvdXJjZXMnKSkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2RlZmF1bHRNb3VzZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xyXG4gICAgfSxcclxuICAgIF9zdGFydENvbm5lY3RpbmcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wuaGlkZSgpO1xyXG4gICAgICAgIHZhciBwb3MgPSB0b29sLmdldEFic29sdXRlUG9zaXRpb24oKTtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2UgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDEsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFtwb3MueCAtIHN0YWdlLngoKSwgcG9zLnksIHBvcy54IC0gc3RhZ2UueCgpLCBwb3MueV0sXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29ubmVjdG9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5hZGQoY29ubmVjdG9yKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDb25uZWN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBwb2ludHMgPSBjb25uZWN0b3IucG9pbnRzKCk7XHJcbiAgICAgICAgcG9pbnRzWzJdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueCAtIHN0YWdlLngoKTtcclxuICAgICAgICBwb2ludHNbM10gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS55O1xyXG4gICAgICAgIGNvbm5lY3Rvci5wb2ludHMocG9pbnRzKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xyXG4gICAgICAgIGNvbm5lY3Rvci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIGVsID0gc3RhZ2UuZ2V0SW50ZXJzZWN0aW9uKHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpKTtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBlbCAmJiBlbC5nZXRQYXJlbnQoKTtcclxuICAgICAgICB2YXIgdGFza0lkID0gZ3JvdXAgJiYgZ3JvdXAuaWQoKTtcclxuICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHZhciBhZnRlck1vZGVsID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmdldCh0YXNrSWQpO1xyXG4gICAgICAgIGlmIChhZnRlck1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuY29sbGVjdGlvbi5jcmVhdGVEZXBlbmRlbmN5KGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlRm9yID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdkZXBlbmQnKSA9PT0gYmVmb3JlTW9kZWwuaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVtb3ZlRm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24ucmVtb3ZlRGVwZW5kZW5jeShyZW1vdmVGb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2luZyA9IHRoaXMuZWwuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmdldENoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBkcmFnZ2luZyB8fCBjaGlsZC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSkgLSAxKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnZW5kJykpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICByZXR1cm4gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIC8vIG1vdmUgZ3JvdXBcclxuICAgICAgICB0aGlzLmVsLngoeC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBmYWtlIGJhY2tncm91bmQgcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgYmFjayA9IHRoaXMuZWwuZmluZCgnLmZha2VCYWNrZ3JvdW5kJylbMF07XHJcbiAgICAgICAgYmFjay54KCAtIDIwKTtcclxuICAgICAgICBiYWNrLndpZHRoKHgueDIgLSB4LngxICsgNjApO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgbWFpbiByZWN0IHBhcmFtc1xyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LngoMCk7XHJcbiAgICAgICAgcmVjdC53aWR0aCh4LngyIC0geC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdLngoMCk7XHJcblxyXG4gICAgICAgIHZhciBfbWlsZXN0b25lT2Zmc2V0ID0gMDtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ21pbGVzdG9uZScpKSB7XHJcbiAgICAgICAgICAgIF9taWxlc3RvbmVPZmZzZXQgPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngoeC54MiAtIHgueDEgKyBfbWlsZXN0b25lT2Zmc2V0KTtcclxuICAgICAgICB0b29sLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKVswXTtcclxuICAgICAgICByZXNvdXJjZXMueCh4LngyIC0geC54MSArIHRoaXMuX3Rvb2xiYXJPZmZzZXQgKyBfbWlsZXN0b25lT2Zmc2V0KTtcclxuICAgICAgICByZXNvdXJjZXMueSh0aGlzLl90b3BQYWRkaW5nKTtcclxuXHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSByZXNvdXJjZSBsaXN0XHJcbiAgICAgICAgdmFyIHJlc291cmNlTGlzdCA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpWzBdO1xyXG4gICAgICAgIHJlc291cmNlTGlzdC54KHgueDIgLSB4LngxICsgdGhpcy5fcmVzb3VyY2VMaXN0T2Zmc2V0ICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LnkodGhpcy5fdG9wUGFkZGluZyArIDIpO1xyXG4gICAgICAgIHZhciBuYW1lcyA9IFtdO1xyXG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5tb2RlbC5nZXQoJ3Jlc291cmNlcycpO1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZUlkKSB7XHJcbiAgICAgICAgICAgIHZhciByZXMgPSBfLmZpbmQoKHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMucmVzb3VyY2VkYXRhIHx8IFtdKSwgZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLlVzZXJJZC50b1N0cmluZygpID09PSByZXNvdXJjZUlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPCAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChyZXMuVXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxpYXNlcyA9IF8ubWFwKHJlcy5Vc2VybmFtZS5zcGxpdCgnICcpLCBmdW5jdGlvbihzdHIpIHsgcmV0dXJuIHN0clswXTt9KS5qb2luKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lcy5wdXNoKGFsaWFzZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXNvdXJjZUxpc3QudGV4dChuYW1lcy5qb2luKCcsICcpKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc2V0WSA6IGZ1bmN0aW9uKHkpIHtcclxuICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB0aGlzLmVsLnkoeSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0WSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl95O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzaWNUYXNrVmlldzsiLCJ2YXIgQ29ubmVjdG9yVmlldyA9IEJhY2tib25lLktvbnZhVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yOiAnZ3JleScsXHJcbiAgICBfd3JvbmdDb2xvcjogJ3JlZCcsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gcGFyYW1zLmJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMuYWZ0ZXJNb2RlbCA9IHBhcmFtcy5hZnRlck1vZGVsO1xyXG4gICAgICAgIHRoaXMuX3kxID0gMDtcclxuICAgICAgICB0aGlzLl95MiA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsaW5lID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcclxuICAgICAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBwb2ludHM6IFswLCAwLCAwLCAwXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgfSxcclxuICAgIHNldFkxOiBmdW5jdGlvbih5MSkge1xyXG4gICAgICAgIHRoaXMuX3kxID0geTE7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICBzZXRZMjogZnVuY3Rpb24oeTIpIHtcclxuICAgICAgICB0aGlzLl95MiA9IHkyO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICBpZiAoeC54MiA+PSB4LngxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW3gueDEsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kyLCB4LngyLCB0aGlzLl95Ml0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX3dyb25nQ29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbXHJcbiAgICAgICAgICAgICAgICB4LngxLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MixcclxuICAgICAgICAgICAgICAgIHgueDIsIHRoaXMuX3kyXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYWZ0ZXJNb2RlbC5nZXQoJ3N0YXJ0JykpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvclZpZXc7XHJcbiIsInZhciBOZXN0ZWRUYXNrVmlldyA9IHJlcXVpcmUoJy4vTmVzdGVkVGFza1ZpZXcnKTtcclxudmFyIEFsb25lVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Fsb25lVGFza1ZpZXcnKTtcclxudmFyIENvbm5lY3RvclZpZXcgPSByZXF1aXJlKCcuL0Nvbm5lY3RvclZpZXcnKTtcclxuXHJcbnZhciBHYW50dENoYXJ0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI2dhbnR0LWNvbnRhaW5lcicsXHJcbiAgICBfdG9wUGFkZGluZzogNzMsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2luaXRTdGFnZSgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRMYXllcnMoKTtcclxuICAgICAgICB0aGlzLl9pbml0QmFja2dyb3VuZCgpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTdWJWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRDb2xsZWN0aW9uRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0TGVmdFBhZGRpbmc6IGZ1bmN0aW9uKG9mZnNldCkge1xyXG4gICAgICAgIHRoaXMuX2xlZnRQYWRkaW5nID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN0YWdlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnN0YWdlID0gbmV3IEtvbnZhLlN0YWdlKHtcclxuICAgICAgICAgICAgY29udGFpbmVyOiB0aGlzLmVsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0TGF5ZXJzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLkZsYXllciA9IG5ldyBLb252YS5MYXllcigpO1xyXG4gICAgICAgIHRoaXMuQmxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIsIHRoaXMuRmxheWVyKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlU3RhZ2VBdHRyczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgcHJldmlvdXNUYXNrWCA9IHRoaXMuX3Rhc2tWaWV3cy5sZW5ndGggPyB0aGlzLl90YXNrVmlld3NbMF0uZWwueCgpIDogMDtcclxuICAgICAgICB0aGlzLnN0YWdlLnNldEF0dHJzKHtcclxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLm1heCgkKCcudGFza3MnKS5pbm5lckhlaWdodCgpICsgdGhpcy5fdG9wUGFkZGluZywgd2luZG93LmlubmVySGVpZ2h0IC0gJCh0aGlzLnN0YWdlLmdldENvbnRhaW5lcigpKS5vZmZzZXQoKS50b3ApLFxyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy4kZWwuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmM6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHg7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluWCA9IC0obGluZVdpZHRoIC0gdGhpcy53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb3MueCA+IHNlbGYuX2xlZnRQYWRkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYuX2xlZnRQYWRkaW5nO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3MueCA8IG1pblgpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbWluWDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHBvcy54O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VsZi5kcmFnZ2VkVG9EYXkgPSBNYXRoLmFicyh4IC0gc2VsZi5fbGVmdFBhZGRpbmcpIC8gc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90YXNrVmlld3MubGVuZ3RoIHx8ICFwcmV2aW91c1Rhc2tYKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLngodGhpcy5fbGVmdFBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbnggPSAtKGxpbmVXaWR0aCAtIHRoaXMuc3RhZ2Uud2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMuX2xlZnRQYWRkaW5nIC0gKHRoaXMuZHJhZ2dlZFRvRGF5IHx8IDApICogc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZS54KE1hdGgubWF4KG1pbngsIHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuXHJcblxyXG4gICAgfSxcclxuICAgIF9pbml0QmFja2dyb3VuZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyaWQgPSBuZXcgS29udmEuU2hhcGUoe1xyXG4gICAgICAgICAgICBzY2VuZUZ1bmM6IHRoaXMuX2dldFNjZW5lRnVuY3Rpb24oKSxcclxuICAgICAgICAgICAgc3Ryb2tlOiAnbGlnaHRncmF5JyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXHJcbiAgICAgICAgICAgIGZpbGw6ICdyZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICBuYW1lOiAnZ3JpZCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciB3aWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgYmFjayA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YWdlLmhlaWdodCgpLFxyXG4gICAgICAgICAgICB3aWR0aDogd2lkdGhcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgY3VycmVudERheUxpbmUgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zdGFnZS5oZWlnaHQoKSxcclxuICAgICAgICAgICAgd2lkdGg6IDIsXHJcbiAgICAgICAgICAgIHk6IDAsXHJcbiAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgIGZpbGw6ICdncmVlbicsXHJcbiAgICAgICAgICAgIGxpc3RlbmluZzogZmFsc2UsXHJcbiAgICAgICAgICAgIG5hbWU6ICdjdXJyZW50RGF5TGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHtcclxuICAgICAgICAgICAgdmFyIHkgPSBNYXRoLm1heCgwLCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCAtIDE1KTtcclxuICAgICAgICAgICAgZ3JpZC55KHkpO1xyXG4gICAgICAgICAgICBncmlkLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuQmxheWVyLmFkZChiYWNrKS5hZGQoY3VycmVudERheUxpbmUpLmFkZChncmlkKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ2V0U2NlbmVGdW5jdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNkaXNwbGF5ID0gdGhpcy5zZXR0aW5ncy5zZGlzcGxheTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IDE7XHJcbiAgICAgICAgdmFyIHJvd0hlaWdodCA9IDIwO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xyXG4gICAgICAgICAgICB2YXIgaSwgcywgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xyXG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgLy9kcmF3IHRocmVlIGxpbmVzXHJcbiAgICAgICAgICAgIGZvcihpID0gMTsgaSA8IDQ7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcclxuICAgICAgICAgICAgZm9yIChzID0gMTsgcyA8IDM7IHMrKyl7XHJcbiAgICAgICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IGhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzEwcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5ZiAtIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeWkgPSB5ZjsgeWYgPSB5ZiArIHJvd0hlaWdodDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7IHMgPSAzO1xyXG4gICAgICAgICAgICB2YXIgZHJhZ0ludCA9IHBhcnNlSW50KHNhdHRyLmRyYWdJbnRlcnZhbCwgMTApO1xyXG4gICAgICAgICAgICB2YXIgaGlkZURhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYoIGRyYWdJbnQgPT09IDE0IHx8IGRyYWdJbnQgPT09IDMwKXtcclxuICAgICAgICAgICAgICAgIGhpZGVEYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBoRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoaERhdGFbc11baV0uaG9seSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHlpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgIGlmIChoaWRlRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWkgKyByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhY2hlQmFja2dyb3VuZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHRoaXMuQmxheWVyLmZpbmRPbmUoJy5ncmlkJykuY2FjaGUoe1xyXG4gICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICB5OiAwLFxyXG4gICAgICAgICAgICB3aWR0aDogbGluZVdpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc3RhZ2UuaGVpZ2h0KClcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlVG9kYXlMaW5lOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgdmFyIHggPSBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCBuZXcgRGF0ZSgpKSAqIGRheXNXaWR0aDtcclxuICAgICAgdGhpcy5CbGF5ZXIuZmluZE9uZSgnLmN1cnJlbnREYXlMaW5lJykueCh4KS5oZWlnaHQodGhpcy5zdGFnZS5oZWlnaHQoKSk7XHJcbiAgICAgIHRoaXMuQmxheWVyLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlQmFja2dyb3VuZCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6d2lkdGgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUJhY2tncm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0sXHJcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAncmVtb3ZlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyB3YWl0IGZvciBsZWZ0IHBhbmVsIHVwZGF0ZXNcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgICAgIH0sIDEwKSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCBjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdkZXBlbmQ6YWRkJywgZnVuY3Rpb24oYmVmb3JlLCBhZnRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KGJlZm9yZSwgYWZ0ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnZGVwZW5kOnJlbW92ZScsIGZ1bmN0aW9uKGJlZm9yZSwgYWZ0ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdG9yVmlldyhiZWZvcmUsIGFmdGVyKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ25lc3RlZFN0YXRlQ2hhbmdlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbDogZnVuY3Rpb24obW9kZWwpIHtcclxuICAgICAgICB2YXIgdGFza1ZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBtb2RlbDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9yZW1vdmVWaWV3KHRhc2tWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVtb3ZlVmlldzogZnVuY3Rpb24odGFza1ZpZXcpIHtcclxuICAgICAgICB0YXNrVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBfLndpdGhvdXQodGhpcy5fdGFza1ZpZXdzLCB0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZUNvbm5lY3RvclZpZXc6IGZ1bmN0aW9uKGJlZm9yZSwgYWZ0ZXIpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5hZnRlck1vZGVsID09PSBhZnRlciAmJlxyXG4gICAgICAgICAgICAgICAgdmlldy5iZWZvcmVNb2RlbCA9PT0gYmVmb3JlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbm5lY3RvclZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBfLndpdGhvdXQodGhpcy5fY29ubmVjdG9yVmlld3MsIGNvbm5lY3RvclZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3ViVmlld3M6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKChhZnRlcikgPT4ge1xyXG4gICAgICAgICAgICBhZnRlci5kZXBlbmRzLmVhY2goKGJlZm9yZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3RvclZpZXcoYmVmb3JlLCBhZnRlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkVGFza1ZpZXc6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgdmlldztcclxuICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTmVzdGVkVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFsb25lVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzLnB1c2godmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2FkZENvbm5lY3RvclZpZXc6IGZ1bmN0aW9uKGJlZm9yZSwgYWZ0ZXIpIHtcclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBDb25uZWN0b3JWaWV3KHtcclxuICAgICAgICAgICAgYmVmb3JlTW9kZWw6IGJlZm9yZSxcclxuICAgICAgICAgICAgYWZ0ZXJNb2RlbDogYWZ0ZXIsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcuZWwubW92ZVRvQm90dG9tKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfcmVxdWVzdFJlc29ydDogKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICAgICAgd2FpdGluZyA9IHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSksXHJcbiAgICBfcmVzb3J0Vmlld3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsYXN0WSA9IHRoaXMuX3RvcFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdi5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XHJcbiAgICAgICAgICAgIGxhc3RZICs9IHZpZXcuaGVpZ2h0O1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goKGFmdGVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhZnRlci5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWZ0ZXIuZGVwZW5kcy5lYWNoKChiZWZvcmUpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmVWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBiZWZvcmU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciBhZnRlclZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IGFmdGVyO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5hZnRlck1vZGVsID09PSBhZnRlcjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMShiZWZvcmVWaWV3LmdldFkoKSArIGJlZm9yZVZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTIoYWZ0ZXJWaWV3LmdldFkoKSArIGFmdGVyVmlldy5fZnVsbEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLkZsYXllci5iYXRjaERyYXcoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9jb2xvciA6ICcjYjNkMWZjJyxcclxuICAgIF9ib3JkZXJTaXplIDogNixcclxuICAgIF9iYXJIZWlnaHQgOiAxMCxcclxuICAgIF9jb21wbGV0ZUNvbG9yIDogJyNDOTVGMTAnLFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZSAqIDEuNSwgMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZV0sXHJcbiAgICAgICAgICAgIGNsb3NlZCA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbLXRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGdyb3VwIGlzIG1vdmVkXHJcbiAgICAgICAgLy8gc28gd2UgbmVlZCB0byBkZXRlY3QgaW50ZXJ2YWxcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5mbG9vcih4IC8gZGF5c1dpZHRoKTtcclxuICAgICAgICB2YXIgbmV3U3RhcnQgPSBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpO1xyXG4gICAgICAgIHRoaXMubW9kZWwubW92ZVRvU3RhcnQobmV3U3RhcnQpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlV2lkdGggPSAoeC54MiAtIHgueDEpICogdGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDA7XHJcbiAgICAgICAgaWYgKGNvbXBsZXRlV2lkdGggPiB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgoeC54MiAtIHgueDEpIC0gY29tcGxldGVXaWR0aCA8IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXN0ZWRUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBNb2RhbEVkaXQgPSByZXF1aXJlKCcuLi9Nb2RhbFRhc2tFZGl0VmlldycpO1xyXG52YXIgQ29tbWVudHMgPSByZXF1aXJlKCcuLi9Db21tZW50c1ZpZXcnKTtcclxuXHJcbmZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhwYXJhbXMpIHtcclxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHBhcmFtcy5jb2xsZWN0aW9uO1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ3VsJyxcclxuICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cignaWQnKSB8fCAkKHRoaXMpLmRhdGEoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuY29sbGVjdGlvbi5nZXQoaWQpO1xyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdkZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdwcm9wZXJ0aWVzJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBNb2RhbEVkaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsIDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MgOiBzZWxmLnNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnY29tbWVudHMnKXtcclxuICAgICAgICAgICAgICAgIG5ldyBDb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiBtb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHNlbGYuc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIH0pLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soZGF0YSwgJ2Fib3ZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QmVsb3cnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH0sICdiZWxvdycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdpbmRlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24uaW5kZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLm91dGRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICBcInJvd0Fib3ZlXCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEFib3ZlXCIsIGljb246IFwiYWJvdmVcIiB9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEJlbG93XCIsIGljb246IFwiYmVsb3dcIiB9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7SW5kZW50IFJvd1wiLCBpY29uOiBcImluZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7T3V0ZGVudCBSb3dcIiwgaWNvbjogXCJvdXRkZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7IG5hbWU6IFwiJm5ic3A7UHJvcGVydGllc1wiLCBpY29uOiBcInByb3BlcnRpZXNcIiB9LFxyXG4gICAgICAgICAgICBcImNvbW1lbnRzXCI6IHsgbmFtZTogXCImbmJzcDtDb21tZW50c1wiLCBpY29uOiBcImNvbW1lbnRcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjogeyBuYW1lOiBcIiZuYnNwO0RlbGV0ZSBSb3dcIiwgaWNvbjogXCJkZWxldGVcIiB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Db250ZXh0TWVudVZpZXcucHJvdG90eXBlLmFkZFRhc2sgPSBmdW5jdGlvbihkYXRhLCBpbnNlcnRQb3MpIHtcclxuICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGFzay5zYXZlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHRNZW51VmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnRGF0ZVBpY2tlcicsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKHtcclxuLy8gICAgICAgICAgICBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCIsXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdCxcclxuICAgICAgICAgICAgb25TZWxlY3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5nZXRET01Ob2RlKCkudmFsdWUuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBEYXRlKGRhdGVbMl0gKyAnLScgKyBkYXRlWzFdICsgJy0nICsgZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIDogdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcignc2hvdycpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ2Rlc3Ryb3knKTtcclxuICAgIH0sXHJcbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUgOiBmdW5jdGlvbigpIHtcclxuLy8gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvbW0veXknKTtcclxuICAgICAgICB2YXIgZGF0ZVN0ciA9ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgdGhpcy5wcm9wcy52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkudmFsdWUgPSBkYXRlU3RyO1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoIFwicmVmcmVzaFwiICk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuLy8gICAgICAgICAgICBkZWZhdWx0VmFsdWUgOiB0aGlzLnByb3BzLnZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5JylcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlIDogJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5wcm9wcy5kYXRlRm9ybWF0LCB0aGlzLnByb3BzLnZhbHVlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnTmVzdGVkVGFzaycsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9uKCdjaGFuZ2U6aGlkZGVuIGNoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdWJ0YXNrcyA9IHRoaXMucHJvcHMubW9kZWwuY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdWJUYXNrIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnByb3BzLmRhdGVGb3JtYXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndGFzay1saXN0LWNvbnRhaW5lciBkcmFnLWl0ZW0nICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiB0aGlzLnByb3BzLm1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdvbCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3N1Yi10YXNrLWxpc3Qgc29ydGFibGUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdWJ0YXNrc1xyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFzaztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XHJcbnZhciBOZXN0ZWRUYXNrID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrJyk7XHJcblxyXG5mdW5jdGlvbiBnZXREYXRhKGNvbnRhaW5lcikge1xyXG4gICAgdmFyIGRhdGEgPSBbXTtcclxuICAgIHZhciBjaGlsZHJlbiA9ICQoJzxvbD4nICsgY29udGFpbmVyLmdldCgwKS5pbm5lckhUTUwgKyAnPC9vbD4nKS5jaGlsZHJlbigpO1xyXG4gICAgXy5lYWNoKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgIHZhciAkY2hpbGQgPSAkKGNoaWxkKTtcclxuICAgICAgICB2YXIgb2JqID0ge1xyXG4gICAgICAgICAgICBpZCA6ICRjaGlsZC5kYXRhKCdpZCcpLFxyXG4gICAgICAgICAgICBjaGlsZHJlbiA6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc3VibGlzdCA9ICRjaGlsZC5maW5kKCdvbCcpO1xyXG4gICAgICAgIGlmIChzdWJsaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBvYmouY2hpbGRyZW4gPSBnZXREYXRhKHN1Ymxpc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLnB1c2gob2JqKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuXHJcbnZhciBTaWRlUGFuZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZTogJ1NpZGVQYW5lbCcsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX21ha2VTb3J0YWJsZSgpO1xyXG4gICAgfSxcclxuICAgIF9tYWtlU29ydGFibGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gJCgnLnRhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgY29udGFpbmVyLnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgZ3JvdXA6ICdzb3J0YWJsZScsXHJcbiAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yIDogJ29sJyxcclxuICAgICAgICAgICAgaXRlbVNlbGVjdG9yIDogJy5kcmFnLWl0ZW0nLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlciBzb3J0LXBsYWNlaG9sZGVyXCIvPicsXHJcbiAgICAgICAgICAgIG9uRHJhZ1N0YXJ0IDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uRHJhZyA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwbGFjZWhvbGRlciA9ICQoJy5zb3J0LXBsYWNlaG9sZGVyJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNTdWJUYXNrID0gISQoJHBsYWNlaG9sZGVyLnBhcmVudCgpKS5oYXNDbGFzcygndGFzay1jb250YWluZXInKTtcclxuICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnIDogaXNTdWJUYXNrID8gJzMwcHgnIDogJzAnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uRHJvcCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZ2V0RGF0YShjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5yZXNvcnQoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyID0gJCgnPGRpdj4nKTtcclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmQgOiAnZ3JleScsXHJcbiAgICAgICAgICAgIG9wYWNpdHkgOiAnMC41JyxcclxuICAgICAgICAgICAgdG9wIDogJzAnLFxyXG4gICAgICAgICAgICB3aWR0aCA6ICcxMDAlJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb250YWluZXIubW91c2VlbnRlcihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlb3ZlcihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgLy8gVE9ETzogcmV3cml0ZSB0byBmaW5kIGNsb3Nlc3QgdWxcclxuICAgICAgICAgICAgaWYgKCEkZWwuZGF0YSgnaWQnKSkge1xyXG4gICAgICAgICAgICAgICAgJGVsID0gJGVsLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkZWwuZGF0YSgnaWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcG9zID0gJGVsLm9mZnNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wIDogcG9zLnRvcCArICdweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgOiAkZWwuaGVpZ2h0KClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlbGVhdmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG4gICAgcmVxdWVzdFVwZGF0ZSA6IChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICAgICAgd2FpdGluZyA9IHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSksXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcudGFzay1jb250YWluZXInKS5zb3J0YWJsZShcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2sucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stY29udGFpbmVyIHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRhc2tzXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2lkZVBhbmVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERhdGVQaWNrZXIgPSByZXF1aXJlKCcuL0RhdGVQaWNrZXInKTtcclxudmFyIENvbW1ldHNWaWV3ID0gcmVxdWlyZSgnLi4vQ29tbWVudHNWaWV3Jyk7XHJcblxyXG52YXIgVGFza0l0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZSA6ICdUYXNrSXRlbScsXHJcbiAgICBnZXRJbml0aWFsU3RhdGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBlZGl0Um93IDogdW5kZWZpbmVkXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnREaWRVcGRhdGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5maW5kKCdpbnB1dCcpLmZvY3VzKCk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vbignY2hhbmdlOm5hbWUgY2hhbmdlOmNvbXBsZXRlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpkdXJhdGlvbiBjaGFuZ2U6aGlnaHRsaWdodCBjaGFuZ2U6Q29tbWVudHMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIF9maW5kTmVzdGVkTGV2ZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGV2ZWwgPSAwO1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLm1vZGVsLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV2ZWwrKztcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdFJvdyA9PT0gY29sKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVFZGl0RmllbGQoY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVJlYWRGaWxlZChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVSZWFkRmlsZWQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xyXG4gICAgICAgIGlmIChjb2wgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpICsgJyUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgbW9kZWwuZ2V0KGNvbCkpO1xyXG4vLyAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKS50b1N0cmluZyh0aGlzLnByb3BzLmRhdGVGb3JtYXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSwgbW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEYXRlRWxlbWVudCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoY29sLCBuZXdWYWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9kdXJhdGlvbkNoYW5nZSA6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG51bWJlciA9IHBhcnNlSW50KHZhbHVlLnJlcGxhY2UoIC9eXFxEKy9nLCAnJyksIDEwKTtcclxuICAgICAgICBpZiAoIW51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCd3JykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRXZWVrcyhudW1iZXIpKTtcclxuICAgICAgICB9IGVsc2UgIGlmICh2YWx1ZS5pbmRleE9mKCdtJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRNb250aHMobnVtYmVyKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbnVtYmVyLS07XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMobnVtYmVyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEdXJhdGlvbkZpZWxkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IERhdGUuZGF5c2RpZmYodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JyksIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogdGhpcy5zdGF0ZS52YWwgfHwgdmFsLFxyXG4gICAgICAgICAgICBrZXkgOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2R1cmF0aW9uQ2hhbmdlKG5ld1ZhbCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudmFsID0gbmV3VmFsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUudmFsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRWRpdEZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlRWxlbWVudChjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEdXJhdGlvbkZpZWxkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIm5hbWVJbnB1dFwiLFxyXG4gICAgICAgICAgICB2YWx1ZSA6IHZhbCxcclxuICAgICAgICAgICAga2V5IDogY29sLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbktleURvd24gOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkJsdXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgY3JlYXRlQ29tbWVudEZpZWxkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbW1lbnRzID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ0NvbW1lbnRzJykgfHwgMDtcclxuICAgICAgICBpZiAoIWNvbW1lbnRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICBrZXkgOiAnY29tbWVudHMnLFxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1jb21tZW50cycsXHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENvbW1ldHNWaWV3KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiB0aGlzLnByb3BzLm1vZGVsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkucmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaW1nJyx7XHJcbiAgICAgICAgICAgICAgICBzcmMgOiAnY3NzL2ltYWdlcy9jb21tZW50cy5wbmcnXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBjb21tZW50c1xyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG4gICAgc2hvd0NvbnRleHQgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgIHZhciB1bCA9ICRlbC5wYXJlbnQoKTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gJGVsLm9mZnNldCgpO1xyXG4gICAgICAgIHVsLmNvbnRleHRNZW51KHtcclxuICAgICAgICAgICAgeCA6IG9mZnNldC5sZWZ0ICsgMjAsXHJcbiAgICAgICAgICAgIHkgOiBvZmZzZXQudG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgndWwnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2snXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSA/ICcgY29sbGFwc2VkJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gZS50YXJnZXQuY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbCA9IGNsYXNzTmFtZS5zbGljZSg0LCBjbGFzc05hbWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IGNvbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZENvbG9yJyA6IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdoaWdodGxpZ2h0JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2luZm8nLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtaW5mbydcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaW1nJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgOiAnY3NzL2ltYWdlcy9pbmZvLnBuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2sgOiB0aGlzLnNob3dDb250ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnc29ydGluZGV4JyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXNvcnRpbmRleCdcclxuICAgICAgICAgICAgICAgIH0sIG1vZGVsLmdldCgnc29ydGluZGV4JykgKyAxKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiAnbmFtZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtbmFtZSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuaXNOZXN0ZWQoKSA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2knLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0cmlhbmdsZSBpY29uICcgKyAodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpID8gJ3JpZ2h0JyA6ICdkb3duJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2sgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdjb2xsYXBzZWQnLCAhdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGUgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgOiAodGhpcy5fZmluZE5lc3RlZExldmVsKCkgKiAxMCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpZWxkKCduYW1lJykpXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21tZW50RmllbGQoKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdjb21wbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1jb21wbGV0ZSdcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdjb21wbGV0ZScpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdzdGFydCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1zdGFydCdcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdzdGFydCcpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtZW5kJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2VuZCcpKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdkdXJhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1kdXJhdGlvbidcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdkdXJhdGlvbicpKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGFza0l0ZW07XHJcbiJdfQ==
