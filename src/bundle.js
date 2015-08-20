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
		if (beforeModel.get("depend") === afterModel.id || afterModel.get("depend") === beforeModel.id) {
			return false;
		}
		return true;
	},
	removeDependency: function removeDependency(afterModel) {
		afterModel.clearDependence();
	},
	_checkDependencies: function _checkDependencies() {
		this.each((function (task) {
			if (!task.get("depend")) {
				return;
			}
			var beforeModel = this.get(task.get("depend"));
			if (!beforeModel) {
				task.unset("depend").save();
			} else {
				task.dependOn(beforeModel, true);
			}
		}).bind(this));
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
			if (child.get("depend") === task.id) {
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
		taskJSONarray.forEach((function (taskItem) {
			taskItem.sortindex = ++sortindex;
		}).bind(this));
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
        depend: undefined, // id of task
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
    },
    isNested: function isNested() {
        return !!this.children.length;
    },
    show: function show() {
        this.set("hidden", false);
    },
    hide: function hide() {
        this.set("hidden", true);
    },
    dependOn: function dependOn(beforeModel, silent) {
        this.set("depend", beforeModel.id);
        this.beforeModel = beforeModel;
        if (this.get("start") < beforeModel.get("end")) {
            this.moveToStart(beforeModel.get("end"));
        }
        if (!silent) {
            this.save();
        }
        this._listenBeforeModel();
    },
    toJSON: function toJSON() {
        var json = Backbone.Model.prototype.toJSON.call(this);
        delete json.resources;
        delete json.hidden;
        delete json.collapsed;
        delete json.hightlight;
        return json;
    },
    clearDependence: function clearDependence() {
        if (this.beforeModel) {
            this.stopListening(this.beforeModel);
            this.unset("depend").save();
            this.beforeModel = undefined;
        }
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
    _listenBeforeModel: function _listenBeforeModel() {
        this.listenTo(this.beforeModel, "destroy", function () {
            this.clearDependence();
        });
        this.listenTo(this.beforeModel, "change:end", function () {
            if (this.parent && this.parent.underMoving) {
                return;
            }
            // check infinite depend loop
            var before = this;
            var befores = [];
            while (true) {
                before = before.beforeModel;
                if (!before) {
                    break;
                }
                if (befores.indexOf(before) !== -1) {
                    return;
                }
                befores.push(before);
            }
            if (this.get("start") < this.beforeModel.get("end")) {
                this.moveToStart(this.beforeModel.get("end"));
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
        } else {
            start = new Date();
        }

        if (_.isString(response.end)) {
            end = Date.parseExact(util.correctdate(response.end), "dd/MM/yyyy") || new Date(response.end);
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
        return response;
    },
    _checkTime: function _checkTime() {
        if (this.children.length === 0) {
            return;
        }
        var startTime = this.children.at(0).get("start");
        var endTime = this.children.at(0).get("end");
        this.children.each((function (child) {
            var childStartTime = child.get("start");
            var childEndTime = child.get("end");
            if (childStartTime < startTime) {
                startTime = childStartTime;
            }
            if (childEndTime > endTime) {
                endTime = childEndTime;
            }
        }).bind(this));
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
            var beforeUID = xmlItem.PredecessorLink[0].PredecessorUID[0]._text;
            var before = uids[beforeUID];

            deps.push({
                before: before,
                after: task
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
    // set side tasks panel height
    var $sidePanel = $(".menu-container");
    $sidePanel.css({
      "min-height": window.innerHeight - $sidePanel.offset().top
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
        console.error(percent);
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
                console.log("cancel");
            },
            onApprove: (function () {
                $(document.body).removeClass("dimmable");
                console.log("yes");
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

        this.listenTo(this.collection, "change:depend", function (task) {
            if (task.get("depend")) {
                this._addConnectorView(task);
            } else {
                this._removeConnector(task);
            }
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
    _removeConnector: function _removeConnector(task) {
        var connectorView = _.find(this._connectorViews, function (view) {
            return view.afterModel === task;
        });
        connectorView.remove();
        this._connectorViews = _.without(this._connectorViews, connectorView);
    },
    _initSubViews: function _initSubViews() {
        this.collection.each((function (task) {
            this._addTaskView(task);
        }).bind(this));
        this.collection.each((function (task) {
            this._addConnectorView(task);
        }).bind(this));
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
    _addConnectorView: function _addConnectorView(task) {
        var dependId = task.get("depend");
        if (!dependId) {
            return;
        }
        var view = new ConnectorView({
            beforeModel: this.collection.get(dependId),
            afterModel: task,
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
        var lastY = this._topPadding;
        this.collection.each((function (task) {
            if (task.get("hidden")) {
                return;
            }
            var view = _.find(this._taskViews, function (view) {
                return view.model === task;
            });
            if (!view) {
                return;
            }
            view.setY(lastY);
            lastY += view.height;
        }).bind(this));
        this.collection.each((function (task) {
            var dependId = task.get("depend");
            if (task.get("hidden") || !dependId) {
                return;
            }
            var beforeModel = this.collection.get(dependId);
            var beforeView = _.find(this._taskViews, function (view) {
                return view.model === beforeModel;
            });
            var afterView = _.find(this._taskViews, function (view) {
                return view.model === task;
            });
            var connectorView = _.find(this._connectorViews, function (view) {
                return view.beforeModel === beforeModel;
            });
            connectorView.setY1(beforeView.getY() + beforeView._fullHeight / 2);
            connectorView.setY2(afterView.getY() + afterView._fullHeight / 2);
        }).bind(this));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvbm9kZV9tb2R1bGVzL2JhYmVsL2V4dGVybmFsLWhlbHBlcnMuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NsaWVudENvbmZpZy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9jb2xsZWN0aW9ucy9UYXNrQ29sbGVjdGlvbi5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvZmFrZV81MjIwYWI5OC5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Jlc291cmNlUmVmZXJlbmNlLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy94bWxXb3JrZXIuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0NvbW1lbnRzVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Nb2RhbFRhc2tFZGl0Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvTm90aWZpY2F0aW9ucy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvUmVzb3VyY2VzRWRpdG9yLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L01pc2NNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOzs7Ozs7O0FDRkEsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFakMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFN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QUMsSUFBSSxFQUFFO0FBQ3RCLGVBQUcsRUFBRyxVQUFVO0FBQ2hCLHFCQUFTLEVBQUcsY0FBYztTQUM3QixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FDcEMsQ0FBQztLQUNUO0NBQ0osQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbihmdW5jdGlvbihnbG9iYWwpe3ZhciBiYWJlbEhlbHBlcnM9Z2xvYmFsLmJhYmVsSGVscGVycz17fTtiYWJlbEhlbHBlcnMuaW5oZXJpdHM9ZnVuY3Rpb24oc3ViQ2xhc3Msc3VwZXJDbGFzcyl7aWYodHlwZW9mIHN1cGVyQ2xhc3MhPT1cImZ1bmN0aW9uXCImJnN1cGVyQ2xhc3MhPT1udWxsKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2Ygc3VwZXJDbGFzcyl9c3ViQ2xhc3MucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyYmc3VwZXJDbGFzcy5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTpzdWJDbGFzcyxlbnVtZXJhYmxlOmZhbHNlLHdyaXRhYmxlOnRydWUsY29uZmlndXJhYmxlOnRydWV9fSk7aWYoc3VwZXJDbGFzcylzdWJDbGFzcy5fX3Byb3RvX189c3VwZXJDbGFzc307YmFiZWxIZWxwZXJzLmRlZmF1bHRzPWZ1bmN0aW9uKG9iaixkZWZhdWx0cyl7dmFyIGtleXM9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZGVmYXVsdHMpO2Zvcih2YXIgaT0wO2k8a2V5cy5sZW5ndGg7aSsrKXt2YXIga2V5PWtleXNbaV07dmFyIHZhbHVlPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmYXVsdHMsa2V5KTtpZih2YWx1ZSYmdmFsdWUuY29uZmlndXJhYmxlJiZvYmpba2V5XT09PXVuZGVmaW5lZCl7T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaixrZXksdmFsdWUpfX1yZXR1cm4gb2JqfTtiYWJlbEhlbHBlcnMuY3JlYXRlQ2xhc3M9ZnVuY3Rpb24oKXtmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl7Zm9yKHZhciBrZXkgaW4gcHJvcHMpe3ZhciBwcm9wPXByb3BzW2tleV07cHJvcC5jb25maWd1cmFibGU9dHJ1ZTtpZihwcm9wLnZhbHVlKXByb3Aud3JpdGFibGU9dHJ1ZX1PYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQscHJvcHMpfXJldHVybiBmdW5jdGlvbihDb25zdHJ1Y3Rvcixwcm90b1Byb3BzLHN0YXRpY1Byb3BzKXtpZihwcm90b1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLHByb3RvUHJvcHMpO2lmKHN0YXRpY1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3Isc3RhdGljUHJvcHMpO3JldHVybiBDb25zdHJ1Y3Rvcn19KCk7YmFiZWxIZWxwZXJzLmNyZWF0ZUNvbXB1dGVkQ2xhc3M9ZnVuY3Rpb24oKXtmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl7Zm9yKHZhciBpPTA7aTxwcm9wcy5sZW5ndGg7aSsrKXt2YXIgcHJvcD1wcm9wc1tpXTtwcm9wLmNvbmZpZ3VyYWJsZT10cnVlO2lmKHByb3AudmFsdWUpcHJvcC53cml0YWJsZT10cnVlO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQscHJvcC5rZXkscHJvcCl9fXJldHVybiBmdW5jdGlvbihDb25zdHJ1Y3Rvcixwcm90b1Byb3BzLHN0YXRpY1Byb3BzKXtpZihwcm90b1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLHByb3RvUHJvcHMpO2lmKHN0YXRpY1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3Isc3RhdGljUHJvcHMpO3JldHVybiBDb25zdHJ1Y3Rvcn19KCk7YmFiZWxIZWxwZXJzLmFwcGx5Q29uc3RydWN0b3I9ZnVuY3Rpb24oQ29uc3RydWN0b3IsYXJncyl7dmFyIGluc3RhbmNlPU9iamVjdC5jcmVhdGUoQ29uc3RydWN0b3IucHJvdG90eXBlKTt2YXIgcmVzdWx0PUNvbnN0cnVjdG9yLmFwcGx5KGluc3RhbmNlLGFyZ3MpO3JldHVybiByZXN1bHQhPW51bGwmJih0eXBlb2YgcmVzdWx0PT1cIm9iamVjdFwifHx0eXBlb2YgcmVzdWx0PT1cImZ1bmN0aW9uXCIpP3Jlc3VsdDppbnN0YW5jZX07YmFiZWxIZWxwZXJzLnRhZ2dlZFRlbXBsYXRlTGl0ZXJhbD1mdW5jdGlvbihzdHJpbmdzLHJhdyl7cmV0dXJuIE9iamVjdC5mcmVlemUoT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RyaW5ncyx7cmF3Ont2YWx1ZTpPYmplY3QuZnJlZXplKHJhdyl9fSkpfTtiYWJlbEhlbHBlcnMudGFnZ2VkVGVtcGxhdGVMaXRlcmFsTG9vc2U9ZnVuY3Rpb24oc3RyaW5ncyxyYXcpe3N0cmluZ3MucmF3PXJhdztyZXR1cm4gc3RyaW5nc307YmFiZWxIZWxwZXJzLmludGVyb3BSZXF1aXJlPWZ1bmN0aW9uKG9iail7cmV0dXJuIG9iaiYmb2JqLl9fZXNNb2R1bGU/b2JqW1wiZGVmYXVsdFwiXTpvYmp9O2JhYmVsSGVscGVycy50b0FycmF5PWZ1bmN0aW9uKGFycil7cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKT9hcnI6QXJyYXkuZnJvbShhcnIpfTtiYWJlbEhlbHBlcnMudG9Db25zdW1hYmxlQXJyYXk9ZnVuY3Rpb24oYXJyKXtpZihBcnJheS5pc0FycmF5KGFycikpe2Zvcih2YXIgaT0wLGFycjI9QXJyYXkoYXJyLmxlbmd0aCk7aTxhcnIubGVuZ3RoO2krKylhcnIyW2ldPWFycltpXTtyZXR1cm4gYXJyMn1lbHNle3JldHVybiBBcnJheS5mcm9tKGFycil9fTtiYWJlbEhlbHBlcnMuc2xpY2VkVG9BcnJheT1mdW5jdGlvbihhcnIsaSl7aWYoQXJyYXkuaXNBcnJheShhcnIpKXtyZXR1cm4gYXJyfWVsc2UgaWYoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKXt2YXIgX2Fycj1bXTtmb3IodmFyIF9pdGVyYXRvcj1hcnJbU3ltYm9sLml0ZXJhdG9yXSgpLF9zdGVwOyEoX3N0ZXA9X2l0ZXJhdG9yLm5leHQoKSkuZG9uZTspe19hcnIucHVzaChfc3RlcC52YWx1ZSk7aWYoaSYmX2Fyci5sZW5ndGg9PT1pKWJyZWFrfXJldHVybiBfYXJyfWVsc2V7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIil9fTtiYWJlbEhlbHBlcnMub2JqZWN0V2l0aG91dFByb3BlcnRpZXM9ZnVuY3Rpb24ob2JqLGtleXMpe3ZhciB0YXJnZXQ9e307Zm9yKHZhciBpIGluIG9iail7aWYoa2V5cy5pbmRleE9mKGkpPj0wKWNvbnRpbnVlO2lmKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLGkpKWNvbnRpbnVlO3RhcmdldFtpXT1vYmpbaV19cmV0dXJuIHRhcmdldH07YmFiZWxIZWxwZXJzLmhhc093bj1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O2JhYmVsSGVscGVycy5zbGljZT1BcnJheS5wcm90b3R5cGUuc2xpY2U7YmFiZWxIZWxwZXJzLmJpbmQ9RnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ7YmFiZWxIZWxwZXJzLmRlZmluZVByb3BlcnR5PWZ1bmN0aW9uKG9iaixrZXksdmFsdWUpe3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLGtleSx7dmFsdWU6dmFsdWUsZW51bWVyYWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlLHdyaXRhYmxlOnRydWV9KX07YmFiZWxIZWxwZXJzLmFzeW5jVG9HZW5lcmF0b3I9ZnVuY3Rpb24oZm4pe3JldHVybiBmdW5jdGlvbigpe3ZhciBnZW49Zm4uYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLHJlamVjdCl7dmFyIGNhbGxOZXh0PXN0ZXAuYmluZChudWxsLFwibmV4dFwiKTt2YXIgY2FsbFRocm93PXN0ZXAuYmluZChudWxsLFwidGhyb3dcIik7ZnVuY3Rpb24gc3RlcChrZXksYXJnKXt0cnl7dmFyIGluZm89Z2VuW2tleV0oYXJnKTt2YXIgdmFsdWU9aW5mby52YWx1ZX1jYXRjaChlcnJvcil7cmVqZWN0KGVycm9yKTtyZXR1cm59aWYoaW5mby5kb25lKXtyZXNvbHZlKHZhbHVlKX1lbHNle1Byb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihjYWxsTmV4dCxjYWxsVGhyb3cpfX1jYWxsTmV4dCgpfSl9fTtiYWJlbEhlbHBlcnMuaW50ZXJvcFJlcXVpcmVXaWxkY2FyZD1mdW5jdGlvbihvYmope3JldHVybiBvYmomJm9iai5fX2VzTW9kdWxlP29iajp7XCJkZWZhdWx0XCI6b2JqfX07YmFiZWxIZWxwZXJzLl90eXBlb2Y9ZnVuY3Rpb24ob2JqKXtyZXR1cm4gb2JqJiZvYmouY29uc3RydWN0b3I9PT1TeW1ib2w/XCJzeW1ib2xcIjp0eXBlb2Ygb2JqfTtiYWJlbEhlbHBlcnMuX2V4dGVuZHM9T2JqZWN0LmFzc2lnbnx8ZnVuY3Rpb24odGFyZ2V0KXtmb3IodmFyIGk9MTtpPGFyZ3VtZW50cy5sZW5ndGg7aSsrKXt2YXIgc291cmNlPWFyZ3VtZW50c1tpXTtmb3IodmFyIGtleSBpbiBzb3VyY2Upe2lmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2Usa2V5KSl7dGFyZ2V0W2tleV09c291cmNlW2tleV19fX1yZXR1cm4gdGFyZ2V0fTtiYWJlbEhlbHBlcnMuZ2V0PWZ1bmN0aW9uIGdldChvYmplY3QscHJvcGVydHkscmVjZWl2ZXIpe3ZhciBkZXNjPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LHByb3BlcnR5KTtpZihkZXNjPT09dW5kZWZpbmVkKXt2YXIgcGFyZW50PU9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO2lmKHBhcmVudD09PW51bGwpe3JldHVybiB1bmRlZmluZWR9ZWxzZXtyZXR1cm4gZ2V0KHBhcmVudCxwcm9wZXJ0eSxyZWNlaXZlcil9fWVsc2UgaWYoXCJ2YWx1ZVwiaW4gZGVzYyYmZGVzYy53cml0YWJsZSl7cmV0dXJuIGRlc2MudmFsdWV9ZWxzZXt2YXIgZ2V0dGVyPWRlc2MuZ2V0O2lmKGdldHRlcj09PXVuZGVmaW5lZCl7cmV0dXJuIHVuZGVmaW5lZH1yZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpfX07YmFiZWxIZWxwZXJzLnNldD1mdW5jdGlvbiBzZXQob2JqZWN0LHByb3BlcnR5LHZhbHVlLHJlY2VpdmVyKXt2YXIgZGVzYz1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCxwcm9wZXJ0eSk7aWYoZGVzYz09PXVuZGVmaW5lZCl7dmFyIHBhcmVudD1PYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtpZihwYXJlbnQhPT1udWxsKXtyZXR1cm4gc2V0KHBhcmVudCxwcm9wZXJ0eSx2YWx1ZSxyZWNlaXZlcil9fWVsc2UgaWYoXCJ2YWx1ZVwiaW4gZGVzYyYmZGVzYy53cml0YWJsZSl7cmV0dXJuIGRlc2MudmFsdWU9dmFsdWV9ZWxzZXt2YXIgc2V0dGVyPWRlc2Muc2V0O2lmKHNldHRlciE9PXVuZGVmaW5lZCl7cmV0dXJuIHNldHRlci5jYWxsKHJlY2VpdmVyLHZhbHVlKX19fTtiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2s9ZnVuY3Rpb24oaW5zdGFuY2UsQ29uc3RydWN0b3Ipe2lmKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9fTtiYWJlbEhlbHBlcnMub2JqZWN0RGVzdHJ1Y3R1cmluZ0VtcHR5PWZ1bmN0aW9uKG9iail7aWYob2JqPT1udWxsKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgZGVzdHJ1Y3R1cmUgdW5kZWZpbmVkXCIpfTtiYWJlbEhlbHBlcnMudGVtcG9yYWxVbmRlZmluZWQ9e307YmFiZWxIZWxwZXJzLnRlbXBvcmFsQXNzZXJ0RGVmaW5lZD1mdW5jdGlvbih2YWwsbmFtZSx1bmRlZil7aWYodmFsPT09dW5kZWYpe3Rocm93IG5ldyBSZWZlcmVuY2VFcnJvcihuYW1lK1wiIGlzIG5vdCBkZWZpbmVkIC0gdGVtcG9yYWwgZGVhZCB6b25lXCIpfXJldHVybiB0cnVlfTtiYWJlbEhlbHBlcnMuc2VsZkdsb2JhbD10eXBlb2YgZ2xvYmFsPT09XCJ1bmRlZmluZWRcIj9zZWxmOmdsb2JhbH0pKHR5cGVvZiBnbG9iYWw9PT1cInVuZGVmaW5lZFwiP3NlbGY6Z2xvYmFsKTtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG5sZXQgdGFza3NTdWJVUkwgPSAnJztcclxuLy8gZGV0ZWN0IEFQSSBwYXJhbXMgZnJvbSBnZXQsIGUuZy4gP3Byb2plY3Q9MTQzJnByb2ZpbGU9MTcmc2l0ZWtleT0yYjAwZGE0NmI1N2MwMzk1XHJcbmlmIChwYXJhbXMucHJvamVjdCAmJiBwYXJhbXMucHJvZmlsZSAmJiBwYXJhbXMuc2l0ZWtleSkge1xyXG4gICAgdGFza3NTdWJVUkwgPSAnLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5wcm9maWxlICsgJy8nICsgcGFyYW1zLnNpdGVrZXk7XHJcbn1cclxuZXhwb3J0IHZhciB0YXNrc1VSTCA9ICdhcGkvdGFza3MvJyArIHRhc2tzU3ViVVJMO1xyXG5cclxuXHJcbmxldCBjb25maWdTdWJVUkwgPSAnJztcclxuaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcclxuICAgIGNvbmZpZ1N1YlVSTCA9ICcvd2JzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5zaXRla2V5O1xyXG59XHJcblxyXG5leHBvcnQgdmFyIGNvbmZpZ1VSTCA9ICcvYXBpL0dhbnR0Q29uZmlnJyArIGNvbmZpZ1N1YlVSTDtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVzb3VyY2VSZWZlcmVuY2VNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9SZXNvdXJjZVJlZmVyZW5jZScpO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xuXG52YXIgQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICB1cmwgOiAnYXBpL3Jlc291cmNlcy8nICsgKHBhcmFtcy5wcm9qZWN0IHx8IDEpICsgJy8nICsgKHBhcmFtcy5wcm9maWxlIHx8IDEpLFxuXHRtb2RlbDogUmVzb3VyY2VSZWZlcmVuY2VNb2RlbCxcbiAgICBpZEF0dHJpYnV0ZSA6ICdJRCcsXG4gICAgdXBkYXRlUmVzb3VyY2VzRm9yVGFzayA6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9sZCByZWZlcmVuY2VzXG4gICAgICAgIHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgICAgICBpZiAocmVmLmdldCgnV0JTSUQnKS50b1N0cmluZygpICE9PSB0YXNrLmlkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXNPbGQgPSB0YXNrLmdldCgncmVzb3VyY2VzJykuaW5kZXhPZihyZWYuZ2V0KCdSZXNJRCcpKTtcbiAgICAgICAgICAgIGlmIChpc09sZCkge1xuICAgICAgICAgICAgICAgIHJlZi5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAvLyBhZGQgbmV3IHJlZmVyZW5jZXNcbiAgICAgICAgdGFzay5nZXQoJ3Jlc291cmNlcycpLmZvckVhY2goZnVuY3Rpb24ocmVzSWQpIHtcbiAgICAgICAgICAgIHZhciBpc0V4aXN0ID0gdGhpcy5maW5kV2hlcmUoe1Jlc0lEIDogcmVzSWR9KTtcbiAgICAgICAgICAgIGlmICghaXNFeGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgUmVzSUQgOiByZXNJZCxcbiAgICAgICAgICAgICAgICAgICAgV0JTSUQgOiB0YXNrLmlkLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBwYXJzZSA6IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgcmVzdWx0ICA9IFtdO1xuICAgICAgICByZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLlJlc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHJlc0l0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gcmVzSXRlbTtcbiAgICAgICAgICAgICAgICBvYmouV0JTSUQgPSBpdGVtLldCU0lEO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG9iaik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYXNrTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGFza01vZGVsJyk7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0dXJsIDogJ2FwaS90YXNrcycsXG5cdG1vZGVsOiBUYXNrTW9kZWwsXG5cdGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc3Vic2NyaWJlKCk7XG5cdH0sXG5cdGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xuXHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHR9LFxuXHRsaW5rQ2hpbGRyZW4gOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGFyZW50VGFzayA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChwYXJlbnRUYXNrKSB7XG5cdFx0XHRcdGlmIChwYXJlbnRUYXNrID09PSB0YXNrKSB7XG5cdFx0XHRcdFx0dGFzay5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdF9zb3J0Q2hpbGRyZW4gOiBmdW5jdGlvbiAodGFzaywgc29ydEluZGV4KSB7XG5cdFx0dGFzay5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0Y2hpbGQuc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4oY2hpbGQsIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRjaGVja1NvcnRlZEluZGV4IDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IC0xO1xuXHRcdHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRhc2suc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4odGFzaywgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRfcmVzb3J0Q2hpbGRyZW4gOiBmdW5jdGlvbihkYXRhLCBzdGFydEluZGV4LCBwYXJlbnRJRCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSBzdGFydEluZGV4O1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbih0YXNrRGF0YSkge1xuXHRcdFx0dmFyIHRhc2sgPSB0aGlzLmdldCh0YXNrRGF0YS5pZCk7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudElEKSB7XG5cdFx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldChwYXJlbnRJRCk7XG5cdFx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNhdmUoe1xuXHRcdFx0XHRzb3J0aW5kZXg6ICsrc29ydEluZGV4LFxuXHRcdFx0XHRwYXJlbnRpZDogcGFyZW50SURcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhc2tEYXRhLmNoaWxkcmVuICYmIHRhc2tEYXRhLmNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9yZXNvcnRDaGlsZHJlbih0YXNrRGF0YS5jaGlsZHJlbiwgc29ydEluZGV4LCB0YXNrLmlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdHJlc29ydCA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG5cdFx0dGhpcy5fcmVzb3J0Q2hpbGRyZW4oZGF0YSwgLTEsIDApO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5zb3J0KCk7XG5cdH0sXG5cdHN1YnNjcmliZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsICgpID0+IHtcbiAgICAgICAgICAgIC8vIGFkZCBlbXB0eSB0YXNrIGlmIG5vIHRhc2tzIGZyb20gc2VydmVyXG4gICAgICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KFt7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgOiAnTmV3IHRhc2snXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHRcdG1vZGVsLnBhcmVudCA9IHBhcmVudDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0dGhpcy5fY2hlY2tEZXBlbmRlbmNpZXMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4ucmVtb3ZlKHRhc2spO1xuXHRcdFx0XHR0YXNrLnBhcmVudCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fcHJldmVudFNvcnRpbmcpIHtcblx0XHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGNyZWF0ZURlcGVuZGVuY3kgOiBmdW5jdGlvbiAoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpIHtcblx0XHRpZiAodGhpcy5fY2FuQ3JlYXRlRGVwZW5kZW5jZShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkpIHtcblx0XHRcdGFmdGVyTW9kZWwuZGVwZW5kT24oYmVmb3JlTW9kZWwpO1xuXHRcdH1cblx0fSxcblxuXHRfY2FuQ3JlYXRlRGVwZW5kZW5jZSA6IGZ1bmN0aW9uKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKGJlZm9yZU1vZGVsLmhhc1BhcmVudChhZnRlck1vZGVsKSB8fCBhZnRlck1vZGVsLmhhc1BhcmVudChiZWZvcmVNb2RlbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKChiZWZvcmVNb2RlbC5nZXQoJ2RlcGVuZCcpID09PSBhZnRlck1vZGVsLmlkKSB8fFxuXHRcdFx0KGFmdGVyTW9kZWwuZ2V0KCdkZXBlbmQnKSA9PT0gYmVmb3JlTW9kZWwuaWQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRyZW1vdmVEZXBlbmRlbmN5IDogZnVuY3Rpb24oYWZ0ZXJNb2RlbCkge1xuXHRcdGFmdGVyTW9kZWwuY2xlYXJEZXBlbmRlbmNlKCk7XG5cdH0sXG5cdF9jaGVja0RlcGVuZGVuY2llcyA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdkZXBlbmQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmdldCh0YXNrLmdldCgnZGVwZW5kJykpO1xuXHRcdFx0aWYgKCFiZWZvcmVNb2RlbCkge1xuXHRcdFx0XHR0YXNrLnVuc2V0KCdkZXBlbmQnKS5zYXZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLmRlcGVuZE9uKGJlZm9yZU1vZGVsLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRvdXRkZW50IDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciB1bmRlclN1YmxpbmdzID0gW107XG5cdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHR0YXNrLnBhcmVudC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGlmIChjaGlsZC5nZXQoJ3NvcnRpbmRleCcpIDw9IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmRlclN1YmxpbmdzLnB1c2goY2hpbGQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHVuZGVyU3VibGluZ3MuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKGNoaWxkLmdldCgnZGVwZW5kJykgPT09IHRhc2suaWQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5jbGVhckRlcGVuZGVuY2UoKTtcbiAgICAgICAgICAgIH1cblx0XHRcdGNoaWxkLnNhdmUoJ3BhcmVudGlkJywgdGFzay5pZCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHRpZiAodGFzay5wYXJlbnQgJiYgdGFzay5wYXJlbnQucGFyZW50KSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgdGFzay5wYXJlbnQucGFyZW50LmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIDApO1xuXHRcdH1cblx0fSxcblx0aW5kZW50IDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciBwcmV2VGFzaywgaSwgbTtcblx0XHRmb3IgKGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0wOyBpLS0pIHtcblx0XHRcdG0gPSB0aGlzLmF0KGkpO1xuXHRcdFx0aWYgKChtLmdldCgnc29ydGluZGV4JykgPCB0YXNrLmdldCgnc29ydGluZGV4JykpICYmICh0YXNrLnBhcmVudCA9PT0gbS5wYXJlbnQpKSB7XG5cdFx0XHRcdHByZXZUYXNrID0gbTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChwcmV2VGFzaykge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHByZXZUYXNrLmlkKTtcblx0XHR9XG5cdH0sXG4gICAgaW1wb3J0VGFza3MgOiBmdW5jdGlvbih0YXNrSlNPTmFycmF5LCBjYWxsYmFjaykge1xuICAgIFx0dmFyIHNvcnRpbmRleCA9IDA7XG4gICAgXHRpZiAodGhpcy5sYXN0KCkpIHtcblx0XHRcdHNvcnRpbmRleCA9IHRoaXMubGFzdCgpLmdldCgnc29ydGluZGV4Jyk7XG4gICAgXHR9XG4gICAgICAgIHRhc2tKU09OYXJyYXkuZm9yRWFjaChmdW5jdGlvbih0YXNrSXRlbSkge1xuICAgICAgICAgICAgdGFza0l0ZW0uc29ydGluZGV4ID0gICsrc29ydGluZGV4O1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB2YXIgbGVuZ3RoID0gdGFza0pTT05hcnJheS5sZW5ndGg7XG4gICAgICAgIHZhciBkb25lID0gMDtcbiAgICAgICAgdGhpcy5hZGQodGFza0pTT05hcnJheSwge3BhcnNlIDogdHJ1ZX0pLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgdGFzay5zYXZlKHt9LHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUgKz0xO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9uZSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlRGVwcyA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG4gICAgICAgIGRhdGEucGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZSA6IGl0ZW0ucGFyZW50Lm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGl0ZW0ucGFyZW50Lm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5maW5kV2hlcmUoe1xuICAgICAgICAgICAgICAgIG5hbWUgOiBpdGVtLmNoaWxkLm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGl0ZW0uY2hpbGQub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHBhcmVudC5pZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cblx0XHRkYXRhLmRlcHMuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lIDogZGVwLmJlZm9yZS5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBkZXAuYmVmb3JlLm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGFmdGVyTW9kZWwgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZSA6IGRlcC5hZnRlci5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBkZXAuYWZ0ZXIub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZURlcGVuZGVuY3koYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0NvbGxlY3Rpb247XG4iLCIndXNlIHN0cmljdCc7XG5yZXF1aXJlKCdiYWJlbC9leHRlcm5hbC1oZWxwZXJzJyk7XG52YXIgVGFza0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2NvbGxlY3Rpb25zL1Rhc2tDb2xsZWN0aW9uJyk7XG52YXIgU2V0dGluZ3MgPSByZXF1aXJlKCcuL21vZGVscy9TZXR0aW5nTW9kZWwnKTtcblxudmFyIEdhbnR0VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvR2FudHRWaWV3Jyk7XG5pbXBvcnQge3Rhc2tzVVJMLCBjb25maWdVUkx9IGZyb20gJy4vY2xpZW50Q29uZmlnJztcblxuXG5mdW5jdGlvbiBsb2FkVGFza3ModGFza3MpIHtcbiAgICB2YXIgZGZkID0gbmV3ICQuRGVmZXJyZWQoKTtcblx0dGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3MgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRmZC5yZXNvbHZlKCk7XG5cdFx0fSxcblx0XHRlcnJvciA6IGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgZGZkLnJlamVjdChlcnIpO1xuXHRcdH0sXG5cdFx0cGFyc2U6IHRydWUsXG5cdFx0cmVzZXQgOiB0cnVlXG5cdH0pO1xuICAgIHJldHVybiBkZmQucHJvbWlzZSgpO1xufVxuXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICByZXR1cm4gJC5nZXRKU09OKGNvbmZpZ1VSTClcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHNldHRpbmdzLnN0YXR1c2VzID0gZGF0YTtcbiAgICAgICAgfSk7XG59XG5cblxuJCgoKSA9PiB7XG5cdGxldCB0YXNrcyA9IG5ldyBUYXNrQ29sbGVjdGlvbigpO1xuICAgIHRhc2tzLnVybCA9IHRhc2tzVVJMO1xuICAgIGxldCBzZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyh7fSwge3Rhc2tzIDogdGFza3N9KTtcblxuICAgIHdpbmRvdy50YXNrcyA9IHRhc2tzO1xuICAgIFxuICAgICQud2hlbihsb2FkVGFza3ModGFza3MpKVxuICAgIC50aGVuKCgpID0+IGxvYWRTZXR0aW5ncyhzZXR0aW5ncykpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnU3VjY2VzcyBsb2FkaW5nIHRhc2tzLicpO1xuICAgICAgICBuZXcgR2FudHRWaWV3KHtcbiAgICAgICAgICAgIHNldHRpbmdzOiBzZXR0aW5ncyxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IHRhc2tzXG4gICAgICAgIH0pLnJlbmRlcigpO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyBoaWRlIGxvYWRpbmdcbiAgICAgICAgJCgnI2xvYWRlcicpLmZhZGVPdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIGRpc3BsYXkgaGVhZCBhbHdheXMgb24gdG9wXG4gICAgICAgICAgICAkKCcjaGVhZCcpLmNzcyh7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gOiAnZml4ZWQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGVuYWJsZSBzY3JvbGxpbmdcbiAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaG9sZC1zY3JvbGwnKTtcbiAgICAgICAgfSk7XG4gICAgfSkuZmFpbCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZycsIGVycm9yKTtcbiAgICB9KTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgUmVzb3VyY2VSZWZlcmVuY2UgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBtYWluIHBhcmFtc1xyXG4gICAgICAgIFdCU0lEIDogMSwgLy8gdGFzayBpZFxyXG4gICAgICAgIFJlc0lEOiAxLCAvLyByZXNvdXJjZSBpZFxyXG4gICAgICAgIFRTQWN0aXZhdGU6IHRydWUsXHJcblxyXG4gICAgICAgIC8vIHNvbWUgc2VydmVyIHBhcmFtc1xyXG4gICAgICAgIFdCU1Byb2ZpbGVJRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIFBhcnRpdE5vIDogJzJiMDBkYTQ2YjU3YzAzOTUnLCAvLyBoYXZlIG5vIGlkZWEgd2hhdCBpcyB0aGF0XHJcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5XHJcblxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZVJlZmVyZW5jZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxuXHJcbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdGRlZmF1bHRzOiB7XHJcblx0XHRpbnRlcnZhbDogJ2ZpeCcsXHJcblx0XHQvL2RheXMgcGVyIGludGVydmFsXHJcblx0XHRkcGk6IDFcclxuXHR9LFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcclxuXHRcdHRoaXMuc3RhdHVzZXMgPSB1bmRlZmluZWQ7XHJcblx0XHR0aGlzLnNhdHRyID0ge1xyXG5cdFx0XHRoRGF0YToge30sXHJcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcclxuXHRcdFx0ZGF5c1dpZHRoOiA1LFxyXG5cdFx0XHRjZWxsV2lkdGg6IDM1LFxyXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXHJcblx0XHRcdG1heERhdGU6IG5ldyBEYXRlKDAsMCwwKSxcclxuXHRcdFx0Ym91bmRhcnlNaW46IG5ldyBEYXRlKDAsMCwwKSxcclxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcclxuXHRcdFx0Ly9tb250aHMgcGVyIGNlbGxcclxuXHRcdFx0bXBjOiAxXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuc2Rpc3BsYXkgPSB7XHJcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4NixcclxuXHRcdFx0dEhpZGRlbldpZHRoOiAzMDUsXHJcblx0XHRcdHRhYmxlV2lkdGg6IDcxMFxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMudGFza3M7XHJcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xyXG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgY2hhbmdlOmVuZCcsIF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlOndpZHRoJyk7XHJcbiAgICAgICAgfSwgNTAwKSk7XHJcblx0fSxcclxuXHRnZXRTZXR0aW5nOiBmdW5jdGlvbihmcm9tLCBhdHRyKXtcclxuXHRcdGlmKGF0dHIpe1xyXG5cdFx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXVthdHRyXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xyXG5cdH0sXHJcblx0ZmluZFN0YXR1c0lkIDogZnVuY3Rpb24oc3RhdHVzKSB7XHJcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gc3RhdHVzLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmRTdGF0dXNGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRTdGF0dXNJZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHRmaW5kSGVhbHRoSWQgOiBmdW5jdGlvbihoZWFsdGgpIHtcclxuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBoZWFsdGgudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZEhlYWx0aEZvcklkIDogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdEhlYWx0aElkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5jRGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cdGZpbmRXT0lkIDogZnVuY3Rpb24od28pIHtcclxuXHRcdGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuV09OdW1iZXIudG9Mb3dlckNhc2UoKSA9PT0gd28udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuSUQ7XHJcbiAgICAgICAgICAgIH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZFdPRm9ySWQgOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuSUQudG9TdHJpbmcoKSA9PT0gaWQudG9TdHJpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuV09OdW1iZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRXT0lkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbMF0uSUQ7XHJcbiAgICB9LFxyXG4gICAgZ2V0RGF0ZUZvcm1hdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAnZGQvbW0veXknO1xyXG4gICAgfSxcclxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBtaW5EYXRlID0gbmV3IERhdGUoKSwgbWF4RGF0ZSA9IG1pbkRhdGUuY2xvbmUoKS5hZGRZZWFycygxKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcclxuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0bWluRGF0ZT1tb2RlbC5nZXQoJ3N0YXJ0Jyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XHJcblx0XHRcdFx0bWF4RGF0ZT1tb2RlbC5nZXQoJ2VuZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuc2F0dHIubWluRGF0ZSA9IG1pbkRhdGU7XHJcblx0XHR0aGlzLnNhdHRyLm1heERhdGUgPSBtYXhEYXRlO1xyXG5cdH0sXHJcblx0c2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZW5kLHNhdHRyPXRoaXMuc2F0dHIsZGF0dHI9dGhpcy5zZGlzcGxheSxkdXJhdGlvbixzaXplLGNlbGxXaWR0aCxkcGkscmV0ZnVuYyxzdGFydCxsYXN0LGk9MCxqPTAsaUxlbj0wLG5leHQ9bnVsbDtcclxuXHRcdFxyXG5cdFx0dmFyIGludGVydmFsID0gdGhpcy5nZXQoJ2ludGVydmFsJyk7XHJcblxyXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAxLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDYwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTU7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDEpO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xyXG5cdFx0XHRcclxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDcsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiA3KTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKS5tb3ZlVG9EYXlPZldlZWsoMSwgLTEpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSA1O1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoNyk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDEyICogMzApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDcgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygxKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4ubW92ZVRvRmlyc3REYXlPZlF1YXJ0ZXIoKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSAzMCAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMztcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDMpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcclxuXHRcdFx0Y2VsbFdpZHRoID0gMzA7XHJcblx0XHRcdGR1cmF0aW9uID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLCBzYXR0ci5tYXhEYXRlKTtcclxuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzaXplIC8gZHVyYXRpb247XHJcblx0XHRcdGRwaSA9IE1hdGgucm91bmQoY2VsbFdpZHRoIC8gc2F0dHIuZGF5c1dpZHRoKTtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBkcGkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIgKiBkcGkpO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDMwICogMTApO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcclxuXHRcdFx0ZHBpID0gdGhpcy5nZXQoJ2RwaScpO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAoMSArIE1hdGgubG9nKGRwaSkpICogMTI7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMjAgKiBkcGkpO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygzMCAqIDEwKTtcclxuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHR9XHJcblx0XHR2YXIgaERhdGEgPSB7XHJcblx0XHRcdCcxJzogW10sXHJcblx0XHRcdCcyJzogW10sXHJcblx0XHRcdCczJzogW11cclxuXHRcdH07XHJcblx0XHR2YXIgaGRhdGEzID0gW107XHJcblx0XHRcclxuXHRcdHN0YXJ0ID0gc2F0dHIuYm91bmRhcnlNaW47XHJcblxyXG5cdFx0bGFzdCA9IHN0YXJ0O1xyXG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XHJcblx0XHRcdHZhciBkdXJmdW5jO1xyXG5cdFx0XHRpZiAoaW50ZXJ2YWw9PT0nbW9udGhseScpIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luTW9udGgoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0TW9udGgoKSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luUXVhcnRlcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0UXVhcnRlcigpKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xyXG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogZHVyZnVuYyhsYXN0KSxcclxuXHRcdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XHJcblx0XHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIGludGVydmFsZGF5cyA9IHRoaXMuZ2V0KCdkcGknKTtcclxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNIb2x5ID0gbGFzdC5nZXREYXkoKSA9PT0gNiB8fCBsYXN0LmdldERheSgpID09PSAwO1xyXG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBpbnRlcnZhbGRheXMsXHJcblx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBob2x5IDogKGludGVydmFsID09PSAnZGFpbHknKSAmJiBpc0hvbHlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcclxuXHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0c2F0dHIuYm91bmRhcnlNYXggPSBlbmQgPSBsYXN0O1xyXG5cdFx0aERhdGFbJzMnXSA9IGhkYXRhMztcclxuXHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IGRhdGUgdG8gZW5kIG9mIHllYXJcclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xyXG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXHJcblx0XHR9KTtcclxuXHRcdGZvcihpID0gc3RhcnQuZ2V0RnVsbFllYXIoKSArIDEsIGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTsgaSA8IGlMZW47IGkrKyl7XHJcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxyXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRpbnRlciA9IERhdGUuZGF5c2RpZmYobmV3IERhdGUoZW5kLmdldEZ1bGxZZWFyKCksIDAsIDEpLCBlbmQpO1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBlbmQuZ2V0RnVsbFllYXIoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxyXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoc3RhcnQsIHN0YXJ0LmNsb25lKCkubW92ZVRvTGFzdERheU9mTW9udGgoKSksXHJcblx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCAnbScpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aiA9IHN0YXJ0LmdldE1vbnRoKCkgKyAxO1xyXG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XHJcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XHJcblx0XHR2YXIgZW5kbW9udGggPSBlbmQuZ2V0TW9udGgoKTtcclxuXHJcblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XHJcblx0XHRcdHdoaWxlKGogPCAxMikge1xyXG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxyXG5cdFx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGosICdtJylcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRqICs9IDE7XHJcblx0XHRcdH1cclxuXHRcdFx0aSArPSAxO1xyXG5cdFx0XHRqID0gMDtcclxuXHRcdH1cclxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGgoKSAmJiBlbmQuZ2V0RnVsbFllYXIoKSAhPT0gc3RhcnQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRoRGF0YVsnMiddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxyXG5cdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShlbmQuZ2V0TW9udGgoKSwgJ20nKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHNhdHRyLmhEYXRhID0gaERhdGE7XHJcblx0fSxcclxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5jYWxjbWlubWF4KCk7XHJcblx0XHR0aGlzLnNldEF0dHJpYnV0ZXMoKTtcclxuXHR9LFxyXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgZFRvVGV4dD17XHJcblx0XHRcdCdzdGFydCc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnZW5kJzpmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xyXG5cdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLnN0YXJ0LG1vZGVsLmVuZCkrJyBkJztcclxuXHRcdFx0fSxcclxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHZhciBzdGF0dXNlcz17XHJcblx0XHRcdFx0XHQnMTEwJzonY29tcGxldGUnLFxyXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxyXG5cdFx0XHRcdFx0JzEwOCcgOiAncmVhZHknXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xyXG5cdFx0XHR9XHJcblx0XHRcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZmllbGQsdmFsdWUsbW9kZWwpe1xyXG5cdFx0XHRyZXR1cm4gZFRvVGV4dFtmaWVsZF0/ZFRvVGV4dFtmaWVsZF0odmFsdWUsbW9kZWwpOnZhbHVlO1xyXG5cdFx0fTtcclxuXHR9KCkpXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nTW9kZWw7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFJlc0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9jb2xsZWN0aW9ucy9SZXNvdXJjZVJlZmVyZW5jZUNvbGxlY3Rpb24nKTtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuICAgIGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbnZhciByZXNMaW5rcyA9IG5ldyBSZXNDb2xsZWN0aW9uKCk7XHJcbnJlc0xpbmtzLmZldGNoKCk7XHJcblxyXG52YXIgVGFza01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgLy8gTUFJTiBQQVJBTVNcclxuICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcclxuICAgICAgICBjb21wbGV0ZTogMCwgIC8vIDAlIC0gMTAwJSBwZXJjZW50c1xyXG4gICAgICAgIHNvcnRpbmRleDogMCwgICAvLyBwbGFjZSBvbiBzaWRlIG1lbnUsIHN0YXJ0cyBmcm9tIDBcclxuICAgICAgICBkZXBlbmQ6IHVuZGVmaW5lZCwgIC8vIGlkIG9mIHRhc2tcclxuICAgICAgICBzdGF0dXM6ICcxMTAnLCAgICAgIC8vIDExMCAtIGNvbXBsZXRlLCAxMDkgIC0gb3BlbiwgMTA4IC0gcmVhZHlcclxuICAgICAgICBzdGFydDogbmV3IERhdGUoKSxcclxuICAgICAgICBlbmQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgcGFyZW50aWQ6IDAsXHJcbiAgICAgICAgQ29tbWVudHMgOiAwLFxyXG5cclxuICAgICAgICBjb2xvcjogJyMwMDkwZDMnLCAgIC8vIHVzZXIgY29sb3IsIG5vdCB1c2VkIGZvciBub3dcclxuXHJcbiAgICAgICAgLy8gc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXNcclxuICAgICAgICByZXNvdXJjZXMgOiBbXSwgICAgICAgICAvL2xpc3Qgb2YgaWRcclxuICAgICAgICBoZWFsdGg6IDIxLFxyXG4gICAgICAgIHJlcG9ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdvOiAyLCAgICAgICAgICAgICAgICAgIC8vU2VsZWN0IExpc3QgaW4gcHJvcGVydGllcyBtb2RhbCAgIChjb25maWdkYXRhKVxyXG4gICAgICAgIG1pbGVzdG9uZTogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZGVsaXZlcmFibGU6IGZhbHNlLCAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBmaW5hbmNpYWw6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIHRpbWVzaGVldHM6IGZhbHNlLCAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgYWN0dGltZXNoZWV0czogZmFsc2UsICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuXHJcbiAgICAgICAgLy8gc2VydmVyIHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIC8vIGRvbid0IHVzZSB0aGVtIG9uIGNsaWVudCBzaWRlXHJcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5LFxyXG5cclxuXHJcbiAgICAgICAgLy8gcGFyYW1zIGZvciBhcHBsaWNhdGlvbiB2aWV3c1xyXG4gICAgICAgIC8vIHNob3VsZCBiZSByZW1vdmVkIGZyb20gSlNPTlxyXG4gICAgICAgIGhpZGRlbiA6IGZhbHNlLFxyXG4gICAgICAgIGNvbGxhcHNlZCA6IGZhbHNlLFxyXG4gICAgICAgIGhpZ2h0bGlnaHQgOiAnJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBzZWxmIHZhbGlkYXRpb25cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc0xpbmtzLnVwZGF0ZVJlc291cmNlc0ZvclRhc2sodGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTptaWxlc3RvbmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0JywgbmV3IERhdGUodGhpcy5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hpbGRyZW4gcmVmZXJlbmNlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgU3ViVGFza3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KCdtaWxlc3RvbmUnLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92aW5nIHJlZnNcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ2V0KCdwYXJlbnRpZCcpID09PSB0aGlzLmlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5yZW1vdmUoY2hpbGQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpzb3J0aW5kZXgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja1RpbWUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldCgnY29sbGFwc2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGVja2luZyBuZXN0ZWQgc3RhdGVcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlJywgdGhpcy5fY2hlY2tOZXN0ZWQpO1xyXG5cclxuICAgICAgICAvLyB0aW1lIGNoZWNraW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl9jaGVja0NvbXBsZXRlKTtcclxuICAgIH0sXHJcbiAgICBpc05lc3RlZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgfSxcclxuICAgIHNob3cgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgZmFsc2UpO1xyXG4gICAgfSxcclxuICAgIGhpZGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgdHJ1ZSk7XHJcbiAgICB9LFxyXG4gICAgZGVwZW5kT24gOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgc2lsZW50KSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2RlcGVuZCcsIGJlZm9yZU1vZGVsLmlkKTtcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuQmVmb3JlTW9kZWwoKTtcclxuICAgIH0sXHJcbiAgICB0b0pTT04gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIganNvbiA9IEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS50b0pTT04uY2FsbCh0aGlzKTtcclxuICAgICAgICBkZWxldGUganNvbi5yZXNvdXJjZXM7XHJcbiAgICAgICAgZGVsZXRlIGpzb24uaGlkZGVuO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmNvbGxhcHNlZDtcclxuICAgICAgICBkZWxldGUganNvbi5oaWdodGxpZ2h0O1xyXG4gICAgICAgIHJldHVybiBqc29uO1xyXG4gICAgfSxcclxuICAgIGNsZWFyRGVwZW5kZW5jZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZyh0aGlzLmJlZm9yZU1vZGVsKTtcclxuICAgICAgICAgICAgdGhpcy51bnNldCgnZGVwZW5kJykuc2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoYXNQYXJlbnQgOiBmdW5jdGlvbihwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gcGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9saXN0ZW5CZWZvcmVNb2RlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGVhckRlcGVuZGVuY2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC51bmRlck1vdmluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGluZmluaXRlIGRlcGVuZCBsb29wXHJcbiAgICAgICAgICAgIHZhciBiZWZvcmUgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgYmVmb3JlcyA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBiZWZvcmUuYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJlZm9yZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGJlZm9yZXMuaW5kZXhPZihiZWZvcmUpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJlZm9yZXMucHVzaChiZWZvcmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdldCgnc3RhcnQnKSA8IHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG9TdGFydCh0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrTmVzdGVkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCduZXN0ZWRTdGF0ZUNoYW5nZScsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHZhciBzdGFydCwgZW5kO1xyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2Uuc3RhcnQpKXtcclxuICAgICAgICAgICAgc3RhcnQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5zdGFydCksJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2UuZW5kKSl7XHJcbiAgICAgICAgICAgIGVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5lbmQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNwb25zZS5zdGFydCA9IHN0YXJ0IDwgZW5kID8gc3RhcnQgOiBlbmQ7XHJcbiAgICAgICAgcmVzcG9uc2UuZW5kID0gc3RhcnQgPCBlbmQgPyBlbmQgOiBzdGFydDtcclxuXHJcbiAgICAgICAgcmVzcG9uc2UucGFyZW50aWQgPSBwYXJzZUludChyZXNwb25zZS5wYXJlbnRpZCB8fCAnMCcsIDEwKTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIG51bGwgcGFyYW1zXHJcbiAgICAgICAgXy5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAodmFsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzcG9uc2Vba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2VzIGFzIGxpc3Qgb2YgSURcclxuICAgICAgICB2YXIgaWRzID0gW107XHJcbiAgICAgICAgKHJlc3BvbnNlLlJlc291cmNlcyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihyZXNJbmZvKSB7XHJcbiAgICAgICAgICAgIGlkcy5wdXNoKHJlc0luZm8uUmVzSUQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc3BvbnNlLlJlc291cmNlcyA9IHVuZGVmaW5lZDtcclxuICAgICAgICByZXNwb25zZS5yZXNvdXJjZXMgPSBpZHM7XHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLm1pbGVzdG9uZSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS5zdGFydCA9IHJlc3BvbnNlLmVuZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfSxcclxuICAgIF9jaGVja1RpbWUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICAgICAgdmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkRW5kVGltZSA9IGNoaWxkLmdldCgnZW5kJyk7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkU3RhcnRUaW1lIDwgc3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihjaGlsZEVuZFRpbWUgPiBlbmRUaW1lKXtcclxuICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xyXG4gICAgfSxcclxuICAgIF9jaGVja0NvbXBsZXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlID0gMDtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlICs9IGNoaWxkLmdldCgnY29tcGxldGUnKSAvIGxlbmd0aDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0KCdjb21wbGV0ZScsIE1hdGgucm91bmQoY29tcGxldGUpKTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG9TdGFydCA6IGZ1bmN0aW9uKG5ld1N0YXJ0KSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZyBpZiBuZXcgc3RhcnQgaXMgdGhlIHNhbWUgYXMgY3VycmVudFxyXG4gICAgICAgIGlmIChuZXdTdGFydC50b0RhdGVTdHJpbmcoKSA9PT0gdGhpcy5nZXQoJ3N0YXJ0JykudG9EYXRlU3RyaW5nKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIG9mZnNldFxyXG4vLyAgICAgICAgdmFyIGRheXNEaWZmID0gTWF0aC5mbG9vcigobmV3U3RhcnQudGltZSgpIC0gdGhpcy5nZXQoJ3N0YXJ0JykudGltZSgpKSAvIDEwMDAgLyA2MCAvIDYwIC8gMjQpXHJcbiAgICAgICAgdmFyIGRheXNEaWZmID0gRGF0ZS5kYXlzZGlmZihuZXdTdGFydCwgdGhpcy5nZXQoJ3N0YXJ0JykpIC0gMTtcclxuICAgICAgICBpZiAobmV3U3RhcnQgPCB0aGlzLmdldCgnc3RhcnQnKSkge1xyXG4gICAgICAgICAgICBkYXlzRGlmZiAqPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZSBkYXRlc1xyXG4gICAgICAgIHRoaXMuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQgOiBuZXdTdGFydC5jbG9uZSgpLFxyXG4gICAgICAgICAgICBlbmQgOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXNEaWZmKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGFuZ2VzIGRhdGVzIGluIGFsbCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMudW5kZXJNb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzRGlmZik7XHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ2hpbGRyZW4gOiBmdW5jdGlvbihkYXlzKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLm1vdmUoZGF5cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZVdpdGhDaGlsZHJlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2suc2F2ZVdpdGhDaGlsZHJlbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIG1vdmUgOiBmdW5jdGlvbihkYXlzKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogdGhpcy5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKGRheXMpLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5cylcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2hpbGRyZW4oZGF5cyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHJcbiIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHR2YXIgcHJtYXJyID0gcHJtc3RyLnNwbGl0KCcmJyk7XG5cdHZhciBpLCB0bXBhcnI7XG5cdGZvciAoaSA9IDA7IGkgPCBwcm1hcnIubGVuZ3RoOyBpKyspIHtcblx0XHR0bXBhcnIgPSBwcm1hcnJbaV0uc3BsaXQoJz0nKTtcblx0XHRwYXJhbXNbdG1wYXJyWzBdXSA9IHRtcGFyclsxXTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRVUkxQYXJhbXMgPSBmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0dmFyIHBybXN0ciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xuXHRyZXR1cm4gcHJtc3RyICE9PSBudWxsICYmIHBybXN0ciAhPT0gJycgPyB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSA6IHt9O1xufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xyXG52YXIgeG1sID0gZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcveG1sVGVtcGxhdGUueG1sJywgJ3V0ZjgnKTtcclxudmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSh4bWwpO1xyXG5cclxuZnVuY3Rpb24gcGFyc2VYTUxPYmooeG1sU3RyaW5nKSB7XHJcbiAgICB2YXIgb2JqID0geG1sVG9KU09OLnBhcnNlU3RyaW5nKHhtbFN0cmluZyk7XHJcbiAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgIHRhc2tzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lIDogeG1sSXRlbS5OYW1lWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBzdGFydCA6IHhtbEl0ZW0uU3RhcnRbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGVuZCA6IHhtbEl0ZW0uRmluaXNoWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBjb21wbGV0ZSA6IHhtbEl0ZW0uUGVyY2VudENvbXBsZXRlWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBvdXRsaW5lOiB4bWxJdGVtLk91dGxpbmVOdW1iZXJbMF0uX3RleHQudG9TdHJpbmcoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gdGFza3M7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLnBhcnNlRGVwc0Zyb21YTUwgPSBmdW5jdGlvbih4bWxTdHJpbmcpIHtcclxuICAgIHZhciBvYmogPSB4bWxUb0pTT04ucGFyc2VTdHJpbmcoeG1sU3RyaW5nKTtcclxuICAgIHZhciB1aWRzID0ge307XHJcbiAgICB2YXIgb3V0bGluZXMgPSB7fTtcclxuICAgIHZhciBkZXBzID0gW107XHJcbiAgICB2YXIgcGFyZW50cyA9IFtdO1xyXG4gICAgXy5lYWNoKG9iai5Qcm9qZWN0WzBdLlRhc2tzWzBdLlRhc2ssIGZ1bmN0aW9uKHhtbEl0ZW0pIHtcclxuICAgICAgICBpZiAoIXhtbEl0ZW0uTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICBuYW1lOiB4bWxJdGVtLk5hbWVbMF0uX3RleHQudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgb3V0bGluZTogeG1sSXRlbS5PdXRsaW5lTnVtYmVyWzBdLl90ZXh0LnRvU3RyaW5nKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHVpZHNbeG1sSXRlbS5VSURbMF0uX3RleHRdID0gaXRlbTtcclxuICAgICAgICBvdXRsaW5lc1tpdGVtLm91dGxpbmVdID0gaXRlbTtcclxuICAgIH0pO1xyXG4gICAgXy5lYWNoKG9iai5Qcm9qZWN0WzBdLlRhc2tzWzBdLlRhc2ssIGZ1bmN0aW9uKHhtbEl0ZW0pIHtcclxuICAgICAgICBpZiAoIXhtbEl0ZW0uTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXNrID0gdWlkc1t4bWxJdGVtLlVJRFswXS5fdGV4dF07XHJcbiAgICAgICAgLy8gdmFyIG5hbWUgPSB4bWxJdGVtLk5hbWVbMF0uX3RleHQ7XHJcbiAgICAgICAgdmFyIG91dGxpbmUgPSB0YXNrLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICh4bWxJdGVtLlByZWRlY2Vzc29yTGluaykge1xyXG4gICAgICAgICAgICB2YXIgYmVmb3JlVUlEID0geG1sSXRlbS5QcmVkZWNlc3NvckxpbmtbMF0uUHJlZGVjZXNzb3JVSURbMF0uX3RleHQ7XHJcbiAgICAgICAgICAgIHZhciBiZWZvcmUgPSB1aWRzW2JlZm9yZVVJRF07XHJcblxyXG4gICAgICAgICAgICBkZXBzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgYmVmb3JlOiBiZWZvcmUsXHJcbiAgICAgICAgICAgICAgICBhZnRlcjogdGFza1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmVudE91dGxpbmUgPSBvdXRsaW5lLnNsaWNlKDAsb3V0bGluZS5sYXN0SW5kZXhPZignLicpKTtcclxuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG91dGxpbmVzW3BhcmVudE91dGxpbmVdO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignY2FuIG5vdCBmaW5kIHBhcmVudCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJlbnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBjaGlsZDogdGFza1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVwcyA6IGRlcHMsXHJcbiAgICAgICAgcGFyZW50cyA6IHBhcmVudHNcclxuICAgIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5wYXJzZVhNTE9iaiA9IHBhcnNlWE1MT2JqO1xyXG5cclxubW9kdWxlLmV4cG9ydHMuSlNPTlRvWE1MID0gZnVuY3Rpb24oanNvbikge1xyXG4gICAgdmFyIHN0YXJ0ID0ganNvblswXS5zdGFydDtcclxuICAgIHZhciBlbmQgPSBqc29uWzBdLmVuZDtcclxuICAgIHZhciBkYXRhID0gXy5tYXAoanNvbiwgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIGlmIChzdGFydCA+IHRhc2suc3RhcnQpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0YXNrLnN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW5kIDwgdGFzay5lbmQpIHtcclxuICAgICAgICAgICAgZW5kID0gdGFzay5lbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlkOiB0YXNrLnNvcnRpbmRleCxcclxuICAgICAgICAgICAgbmFtZSA6IHRhc2submFtZSxcclxuICAgICAgICAgICAgc3RhcnQgOiB0YXNrLnN0YXJ0LmZvcm1hdCgneXl5eS1tbS1kZDtoaDptbTpzcycpLnJlcGxhY2UoJzsnLCAnVCcpLFxyXG4gICAgICAgICAgICBlbmQgOiB0YXNrLmVuZC5mb3JtYXQoJ3l5eXktbW0tZGQ7aGg6bW06c3MnKS5yZXBsYWNlKCc7JywgJ1QnKVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21waWxlZCh7XHJcbiAgICAgICAgdGFza3MgOiBkYXRhLFxyXG4gICAgICAgIGN1cnJlbnREYXRlIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZSA6IHN0YXJ0LFxyXG4gICAgICAgIGZpbmlzaERhdGUgOiBlbmRcclxuICAgIH0pO1xyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIENvbW1lbnRzVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyN0YXNrQ29tbWVudHNNb2RhbCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25BcHByb3ZlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25IaWRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25IaWRlJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRGVueSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29uRGVueScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuXHJcbiAgICAgICAgdmFyIHVwZGF0ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBjb3VudCA9ICQoXCIjdGFza0NvbW1lbnRzXCIpLmNvbW1lbnRzKFwiY291bnRcIik7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KCdDb21tZW50cycsIGNvdW50KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0ge1xyXG4gICAgICAgICAgICBhZnRlckRlbGV0ZSA6IHVwZGF0ZUNvdW50LFxyXG4gICAgICAgICAgICBhZnRlckNvbW1lbnRBZGQgOiB1cGRhdGVDb3VudFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gaW5pdCBjb21tZW50c1xyXG4gICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5jb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICBnZXRDb21tZW50c1VybDogXCIvYXBpL2NvbW1lbnQvXCIgKyB0aGlzLm1vZGVsLmlkICsgXCIvXCIgKyBwYXJhbXMuc2l0ZWtleSArIFwiL1dCUy8wMDBcIixcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQgKyBcIi9cIiArIHBhcmFtcy5zaXRla2V5ICsgXCIvV0JTL1wiICsgcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuY29tbWVudHMoe1xyXG4gICAgICAgICAgICAgICAgZ2V0Q29tbWVudHNVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1lbnRzVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFNpZGVQYW5lbCA9IHJlcXVpcmUoJy4vc2lkZUJhci9TaWRlUGFuZWwnKTtcclxyXHJ2YXIgR2FudHRDaGFydFZpZXcgPSByZXF1aXJlKCcuL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3Jyk7XHJ2YXIgVG9wTWVudVZpZXcgPSByZXF1aXJlKCcuL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3Jyk7XHJccnZhciBOb3RpZmljYXRpb25zID0gcmVxdWlyZSgnLi9Ob3RpZmljYXRpb25zJyk7XHJcclxydmFyIEdhbnR0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcciAgICBlbDogJy5HYW50dCcsXHIgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHIgICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgLy8gbmV3IHRhc2sgYnV0dG9uXHIgICAgICAgICQoJy5uZXctdGFzaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdmFyIGxhc3RUYXNrID0gcGFyYW1zLmNvbGxlY3Rpb24ubGFzdCgpO1xyICAgICAgICAgICAgdmFyIGxhc3RJbmRleCA9IC0xO1xyICAgICAgICAgICAgaWYgKGxhc3RUYXNrKSB7XHIgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gbGFzdFRhc2suZ2V0KCdzb3J0aW5kZXgnKTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIHBhcmFtcy5jb2xsZWN0aW9uLmFkZCh7XHIgICAgICAgICAgICAgICAgbmFtZSA6ICdOZXcgdGFzaycsXHIgICAgICAgICAgICAgICAgc29ydGluZGV4IDogbGFzdEluZGV4ICsgMVxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIG5ldyBOb3RpZmljYXRpb25zKHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSk7XHIgICAgICAgIC8vIHNldCBzaWRlIHRhc2tzIHBhbmVsIGhlaWdodFxyICAgICAgICB2YXIgJHNpZGVQYW5lbCA9ICQoJy5tZW51LWNvbnRhaW5lcicpO1xyICAgICAgICAkc2lkZVBhbmVsLmNzcyh7XHIgICAgICAgICAgICAnbWluLWhlaWdodCcgOiB3aW5kb3cuaW5uZXJIZWlnaHQgLSAkc2lkZVBhbmVsLm9mZnNldCgpLnRvcFxyICAgICAgICB9KTtcclxyXHJcciAgICAgICAgbmV3IFRvcE1lbnVWaWV3KHtcciAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5ncyxcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEdhbnR0Q2hhcnRWaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnJlbmRlcigpO1xyICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Ll91cGRhdGVTdGFnZUF0dHJzKCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNTAwKTtcclxyXHIgICAgICAgIHZhciB0YXNrc0NvbnRhaW5lciA9ICQoJy50YXNrcycpLmdldCgwKTtcciAgICAgICAgUmVhY3QucmVuZGVyKFxyICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyICAgICAgICAgICAgfSksXHIgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICApO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICBjb25zb2xlLmxvZygncmVjb21waWxlJyk7XHIgICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRhc2tzQ29udGFpbmVyKTtcciAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uIDogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KClcciAgICAgICAgICAgICAgICB9KSxcciAgICAgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICAgICAgKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLDUpKTtcciAgICB9LFxyICAgIGV2ZW50czoge1xyICAgICAgICAnY2xpY2sgI3RIYW5kbGUnOiAnZXhwYW5kJ1xyICAgIH0sXHIgICAgY2FsY3VsYXRlRHVyYXRpb246IGZ1bmN0aW9uKCl7XHJcciAgICAgICAgLy8gQ2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uIGZyb20gc3RhcnQgYW5kIGVuZCBkYXRlXHIgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIF9NU19QRVJfREFZID0gMTAwMCAqIDYwICogNjAgKiAyNDtcciAgICAgICAgaWYoc3RhcnRkYXRlICE9PSBcIlwiICYmIGVuZGRhdGUgIT09IFwiXCIpe1xyICAgICAgICAgICAgdmFyIHV0YzEgPSBEYXRlLlVUQyhzdGFydGRhdGUuZ2V0RnVsbFllYXIoKSwgc3RhcnRkYXRlLmdldE1vbnRoKCksIHN0YXJ0ZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHIgICAgICAgIH1lbHNle1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoMCkpO1xyICAgICAgICB9XHIgICAgfSxcciAgICBleHBhbmQ6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgYnV0dG9uID0gJChldnQudGFyZ2V0KTtcciAgICAgICAgaWYgKGJ1dHRvbi5oYXNDbGFzcygnY29udHJhY3QnKSkge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICB9XHIgICAgICAgIGVsc2Uge1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5hZGRDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICB9XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICB9LmJpbmQodGhpcyksIDYwMCk7XHIgICAgICAgIGJ1dHRvbi50b2dnbGVDbGFzcygnY29udHJhY3QnKTtcciAgICB9LFxyICAgIF9tb3ZlQ2FudmFzVmlldyA6IGZ1bmN0aW9uKCkge1xyICAgICAgICB2YXIgc2lkZUJhcldpZHRoID0gJCgnLm1lbnUtY29udGFpbmVyJykud2lkdGgoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldExlZnRQYWRkaW5nKHNpZGVCYXJXaWR0aCk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gR2FudHRWaWV3O1xyIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIE1vZGFsVGFza0VkaXRDb21wb25lbnQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZWRpdFRhc2snLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgICAgICAvLyBzZXR1cCB2YWx1ZXMgZm9yIHNlbGVjdG9yc1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVTZWxlY3RzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy50YWJ1bGFyLm1lbnUgLml0ZW0nKS50YWIoKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0sIFtuYW1lPVwiZW5kXCJdJykuZGF0ZXBpY2tlcih7XHJcbi8vICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICB0aGlzLl9saXN0ZW5JbnB1dHMoKTtcclxuXHJcbiAgICB9LFxyXG4gICAgX2xpc3RlbklucHV0cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkbWlsZXN0b25lID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJtaWxlc3RvbmVcIl0nKTtcclxuICAgICAgICB2YXIgJGRlbGl2ZXJhYmxlID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJkZWxpdmVyYWJsZVwiXScpO1xyXG4gICAgICAgIHZhciAkc3RhcnQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdJyk7XHJcbiAgICAgICAgdmFyICRlbmQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImVuZFwiXScpO1xyXG4gICAgICAgICRtaWxlc3RvbmUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gJG1pbGVzdG9uZS5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgICRzdGFydC52YWwoJGVuZC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAkZGVsaXZlcmFibGUucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRkZWxpdmVyYWJsZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkZGVsaXZlcmFibGUucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkbWlsZXN0b25lLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZVNlbGVjdHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhdHVzU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGF0dXNcIl0nKTtcclxuICAgICAgICBzdGF0dXNTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgaGVhbHRoU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJoZWFsdGhcIl0nKTtcclxuICAgICAgICBoZWFsdGhTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgd29ya09yZGVyU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJ3b1wiXScpO1xyXG4gICAgICAgIHdvcmtPcmRlclNlbGVjdC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMud29kYXRhWzBdLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICQoJzxvcHRpb24gdmFsdWU9XCInICsgZGF0YS5JRCArICdcIj4nICsgZGF0YS5XT051bWJlciArICc8L29wdGlvbj4nKS5hcHBlbmRUbyh3b3JrT3JkZXJTZWxlY3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGF0dXMnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2hlYWx0aCcgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aEZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnd28nICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRXT0ZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0V09JZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlU3RyID0gJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KCksIHZhbCk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXQoMCkudmFsdWUgPSBkYXRlU3RyO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0ZXBpY2tlciggXCJyZWZyZXNoXCIgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQudmFsKHZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJtaWxlc3RvbmVcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX3NhdmVEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBpbnB1dC52YWwoKS5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgbmV3IERhdGUodmFsdWUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQucHJvcCgnY2hlY2tlZCcpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQudmFsKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zYXZlKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbFRhc2tFZGl0Q29tcG9uZW50O1xyXG4iLCJ2YXIgTm90aWZpY2F0aW9ucyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2Vycm9yJywgXy5kZWJvdW5jZSh0aGlzLm9uRXJyb3IsIDEwKSk7XHJcbiAgICB9LFxyXG4gICAgb25FcnJvciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXJndW1lbnRzKTtcclxuICAgICAgICBub3R5KHtcclxuICAgICAgICAgICAgdGV4dDogJ0Vycm9yIHdoaWxlIHNhdmluZyB0YXNrLCBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIsIHJlcXVlc3Qgc3VwcG9ydCBpZiB0aGlzIGVycm9yIGNvbnRpbnVlcy4nLFxyXG4gICAgICAgICAgICBsYXlvdXQgOiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICB0eXBlIDogJ2Vycm9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9ucztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIFJlc291cmNlRWRpdG9yVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgIHZhciBzdGFnZVBvcyA9ICQoJyNnYW50dC1jb250YWluZXInKS5vZmZzZXQoKTtcclxuICAgICAgICB2YXIgZmFrZUVsID0gJCgnPGRpdj4nKS5hcHBlbmRUbygnYm9keScpO1xyXG4gICAgICAgIGZha2VFbC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIHRvcCA6IHBvcy55ICsgc3RhZ2VQb3MudG9wICsgJ3B4JyxcclxuICAgICAgICAgICAgbGVmdCA6IHBvcy54ICsgc3RhZ2VQb3MubGVmdCArICdweCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1cCA9ICQoJy5jdXN0b20ucG9wdXAnKTtcclxuICAgICAgICBmYWtlRWwucG9wdXAoe1xyXG4gICAgICAgICAgICBwb3B1cCA6IHRoaXMucG9wdXAsXHJcbiAgICAgICAgICAgIG9uIDogJ2hvdmVyJyxcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYm90dG9tIGxlZnQnLFxyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdXAub2ZmKCcuZWRpdG9yJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLnBvcHVwKCdzaG93Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FkZFJlc291cmNlcygpO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnLmJ1dHRvbicpLm9uKCdjbGljay5lZGl0b3InLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3B1cC5wb3B1cCgnaGlkZScpO1xyXG4gICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVwLm9mZignLmVkaXRvcicpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2Z1bGxEYXRhKCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFJlc291cmNlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucG9wdXAuZW1wdHkoKTtcclxuICAgICAgICB2YXIgaHRtbFN0cmluZyA9ICcnO1xyXG4gICAgICAgICh0aGlzLnNldHRpbmdzLnN0YXR1c2VzLnJlc291cmNlZGF0YSB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBodG1sU3RyaW5nICs9ICc8ZGl2IGNsYXNzPVwidWkgY2hlY2tib3hcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICBuYW1lPVwiJyArIHJlc291cmNlLlVzZXJJZCArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGxhYmVsPicgKyByZXNvdXJjZS5Vc2VybmFtZSArICc8L2xhYmVsPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pjxicj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGh0bWxTdHJpbmcgKz0nPGJyPjxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48ZGl2IGNsYXNzPVwidWkgcG9zaXRpdmUgcmlnaHQgYnV0dG9uIHNhdmUgdGlueVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJ0Nsb3NlJyArXHJcbiAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgICAgIHRoaXMucG9wdXAuYXBwZW5kKGh0bWxTdHJpbmcpO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgIH0sXHJcbiAgICBfZnVsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcG9wdXAgPSB0aGlzLnBvcHVwO1xyXG4gICAgICAgIHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIHBvcHVwLmZpbmQoJ1tuYW1lPVwiJyArIHJlc291cmNlICsgJ1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCdpbnB1dCcpLmVhY2goZnVuY3Rpb24oaSwgaW5wdXQpIHtcclxuICAgICAgICAgICAgdmFyICRpbnB1dCA9ICQoaW5wdXQpO1xyXG4gICAgICAgICAgICBpZiAoJGlucHV0LnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzLnB1c2goJGlucHV0LmF0dHIoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KCdyZXNvdXJjZXMnLCByZXNvdXJjZXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzb3VyY2VFZGl0b3JWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGaWx0ZXJWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2ZpbHRlci1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2hhbmdlICNoaWdodGxpZ2h0cy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgaGlnaHRsaWdodFRhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaHRsaWdodFRhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdGhpcy5jb2xvcnNbZS50YXJnZXQudmFsdWVdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjaGFuZ2UgI2ZpbHRlcnMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGNyaXRlcmlhID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChjcml0ZXJpYSA9PT0gJ3Jlc2V0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2hvd1Rhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG93VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaG93IGFsbCBwYXJlbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0YXNrLnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbG9ycyA6IHtcclxuICAgICAgICAnc3RhdHVzLWJhY2tsb2cnIDogJyNEMkQyRDknLFxyXG4gICAgICAgICdzdGF0dXMtcmVhZHknIDogJyNCMkQxRjAnLFxyXG4gICAgICAgICdzdGF0dXMtaW4gcHJvZ3Jlc3MnIDogJyM2NkEzRTAnLFxyXG4gICAgICAgICdzdGF0dXMtY29tcGxldGUnIDogJyM5OUMyOTknLFxyXG4gICAgICAgICdsYXRlJyA6ICcjRkZCMkIyJyxcclxuICAgICAgICAnZHVlJyA6ICcgI0ZGQzI5OScsXHJcbiAgICAgICAgJ21pbGVzdG9uZScgOiAnI0Q2QzJGRicsXHJcbiAgICAgICAgJ2RlbGl2ZXJhYmxlJyA6ICcjRTBEMUMyJyxcclxuICAgICAgICAnZmluYW5jaWFsJyA6ICcjRjBFMEIyJyxcclxuICAgICAgICAndGltZXNoZWV0cycgOiAnI0MyQzJCMicsXHJcbiAgICAgICAgJ3JlcG9ydGFibGUnIDogJyAjRTBDMkMyJyxcclxuICAgICAgICAnaGVhbHRoLXJlZCcgOiAncmVkJyxcclxuICAgICAgICAnaGVhbHRoLWFtYmVyJyA6ICcjRkZCRjAwJyxcclxuICAgICAgICAnaGVhbHRoLWdyZWVuJyA6ICdncmVlbidcclxuICAgIH0sXHJcbiAgICBfZ2V0TW9kZWxzRm9yQ3JpdGVyaWEgOiBmdW5jdGlvbihjcmV0ZXJpYSkge1xyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ3Jlc2V0cycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignc3RhdHVzJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gKHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKHN0YXR1cykgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnc3RhdHVzJykudG9TdHJpbmcoKSA9PT0gaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdsYXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpIDwgbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2R1ZScpIHtcclxuICAgICAgICAgICAgdmFyIGxhc3REYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgbGFzdERhdGUuYWRkV2Vla3MoMik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPiBuZXcgRGF0ZSgpICYmIHRhc2suZ2V0KCdlbmQnKSA8IGxhc3REYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFsnbWlsZXN0b25lJywgJ2RlbGl2ZXJhYmxlJywgJ2ZpbmFuY2lhbCcsICd0aW1lc2hlZXRzJywgJ3JlcG9ydGFibGUnXS5pbmRleE9mKGNyZXRlcmlhKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KGNyZXRlcmlhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdoZWFsdGgnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aCA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoSWQgPSAodGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoSWQoaGVhbHRoKSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdoZWFsdGgnKS50b1N0cmluZygpID09PSBoZWFsdGhJZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlclZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZ3JvdXBpbmctbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICN0b3AtZXhwYW5kLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICN0b3AtY29sbGFwc2UtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcm91cGluZ01lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHBhcnNlWE1MID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMveG1sV29ya2VyJykucGFyc2VYTUxPYmo7XHJcbnZhciBKU09OVG9YTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5KU09OVG9YTUw7XHJcbnZhciBwYXJzZURlcHNGcm9tWE1MID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMveG1sV29ya2VyJykucGFyc2VEZXBzRnJvbVhNTDtcclxuXHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNwcm9qZWN0LW1lbnUnLFxyXG5cclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuaW1wb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBJbnB1dCgpO1xyXG4gICAgfSxcclxuICAgIF9zZXR1cElucHV0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGlucHV0ID0gJCgnI2ltcG9ydEZpbGUnKTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgICAgICB2YXIgZmlsZXMgPSBldnQudGFyZ2V0LmZpbGVzO1xyXG4gICAgICAgICAgICBfLmVhY2goZmlsZXMsIGZ1bmN0aW9uKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IGZpbGUubmFtZS5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGV4dGVudGlvbiA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW50aW9uICE9PSAneG1sJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdUaGUgZmlsZSB0eXBlIFwiJyArIGV4dGVudGlvbiArICdcIiBpcyBub3Qgc3VwcG9ydGVkLiBPbmx5IHhtbCBmaWxlcyBhcmUgYWxsb3dlZC4gUGxlYXNlIHNhdmUgeW91ciBNUyBwcm9qZWN0IGFzIGEgeG1sIGZpbGUgYW5kIHRyeSBhZ2Fpbi4nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi54bWxEYXRhID0gZS50YXJnZXQucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ0Vycm9yIHdoaWxlIHBhcmluZyBmaWxlLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjdXBsb2FkLXByb2plY3QnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNtc2ltcG9ydCcpLm1vZGFsKHtcclxuICAgICAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMueG1sRGF0YSB8fCB0aGlzLmltcG9ydGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1wb3J0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI2ltcG9ydFByb2dyZXNzXCIpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI2ltcG9ydEZpbGVcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3htbGlucHV0LWZvcm0nKS50cmlnZ2VyKCdyZXNldCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5pbXBvcnREYXRhLmJpbmQodGhpcyksIDIwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgICAgJChcIiNpbXBvcnRQcm9ncmVzc1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjaW1wb3J0RmlsZVwiKS5zaG93KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI2Rvd25sb2FkLXByb2plY3QnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTlRvWE1MKHRoaXMuY29sbGVjdGlvbi50b0pTT04oKSk7XHJcbiAgICAgICAgICAgIHZhciBibG9iID0gbmV3IEJsb2IoW2RhdGFdLCB7dHlwZSA6ICdhcHBsaWNhdGlvbi9qc29uJ30pO1xyXG4gICAgICAgICAgICBzYXZlQXMoYmxvYiwgJ0dhbnR0VGFza3MueG1sJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHByb2dyZXNzIDogZnVuY3Rpb24ocGVyY2VudCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IocGVyY2VudCk7XHJcbiAgICAgICAgJCgnI2ltcG9ydFByb2dyZXNzJykucHJvZ3Jlc3Moe1xyXG4gICAgICAgICAgICBwZXJjZW50IDogcGVyY2VudFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlRGF0YSA6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB2YXIgZGVmU3RhdHVzID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgdmFyIGRlZkhlYWx0aCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRIZWFsdGhJZCgpO1xyXG4gICAgICAgIHZhciBkZWZXTyA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRXT0lkKCk7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5oZWFsdGggPSBkZWZIZWFsdGg7XHJcbiAgICAgICAgICAgIGl0ZW0uc3RhdHVzID0gZGVmU3RhdHVzO1xyXG4gICAgICAgICAgICBpdGVtLndvID0gZGVmV087XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9LFxyXG4gICAgaW1wb3J0RGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBkZWxheSA9IDEwMDtcclxuICAgICAgICB0aGlzLnByb2dyZXNzKDApO1xyXG4gICAgICAgIC8vIHRoaXMgaXMgc29tZSBzb3J0IG9mIGNhbGxiYWNrIGhlbGwhIVxyXG4gICAgICAgIC8vIHdlIG5lZWQgdGltZW91dHMgZm9yIGJldHRlciB1c2VyIGV4cGVyaWVuY2VcclxuICAgICAgICAvLyBJIHRoaW5rIHVzZXIgd2FudCB0byBzZWUgYW5pbWF0ZWQgcHJvZ3Jlc3MgYmFyXHJcbiAgICAgICAgLy8gYnV0IHdpdGhvdXQgdGltZW91dHMgaXQgaXMgbm90IHBvc3NpYmxlLCByaWdodD9cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzKDEwKTtcclxuICAgICAgICAgICAgdmFyIGNvbCA9IHRoaXMuY29sbGVjdGlvbjtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBwYXJzZVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fcHJlcGFyZURhdGEoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygyNik7XHJcbiAgICAgICAgICAgICAgICBjb2wuaW1wb3J0VGFza3MoZGF0YSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg0Myk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg1OSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZXBzID0gcGFyc2VEZXBzRnJvbVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg3OCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wuY3JlYXRlRGVwcyhkZXBzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygxMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1wb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI21zaW1wb3J0JykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTVNQcm9qZWN0TWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFJlcG9ydHNNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNyZXBvcnRzLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjcHJpbnQnIDogJ2dlbmVyYXRlUERGJyxcclxuICAgICAgICAnY2xpY2sgI3Nob3dWaWRlbycgOiAnc2hvd0hlbHAnLFxyXG4gICAgICAgICdjbGljayAjZGVsZXRlLWFsbCcgOiAnZGVsZXRlQWxsJ1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUERGIDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgd2luZG93LnByaW50KCk7XHJcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9LFxyXG4gICAgc2hvd0hlbHAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjc2hvd1ZpZGVvTW9kYWwnKS5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgfSxcclxuICAgIGRlbGV0ZUFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI2NvbmZpcm0nKS5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NhbmNlbCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygneWVzJyk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSh0aGlzLmNvbGxlY3Rpb24uYXQoMCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYXQoMCkuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0c01lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFpvb21NZW51VmlldyA9IHJlcXVpcmUoJy4vWm9vbU1lbnVWaWV3Jyk7XHJcbnZhciBHcm91cGluZ01lbnVWaWV3ID0gcmVxdWlyZSgnLi9Hcm91cGluZ01lbnVWaWV3Jyk7XHJcbnZhciBGaWx0ZXJNZW51VmlldyA9IHJlcXVpcmUoJy4vRmlsdGVyTWVudVZpZXcnKTtcclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9NU1Byb2plY3RNZW51VmlldycpO1xyXG52YXIgTWlzY01lbnVWaWV3ID0gcmVxdWlyZSgnLi9NaXNjTWVudVZpZXcnKTtcclxuXHJcbnZhciBUb3BNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICBuZXcgWm9vbU1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IEdyb3VwaW5nTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgRmlsdGVyTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgTVNQcm9qZWN0TWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgTWlzY01lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb3BNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgWm9vbU1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3pvb20tbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrIC5hY3Rpb24nOiAnb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQnXHJcbiAgICB9LFxyXG4gICAgb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQgOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gJChldnQuY3VycmVudFRhcmdldCk7XHJcbiAgICAgICAgdmFyIGFjdGlvbiA9IGJ1dHRvbi5kYXRhKCdhY3Rpb24nKTtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBhY3Rpb24uc3BsaXQoJy0nKVsxXTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnNldCgnaW50ZXJ2YWwnLCBpbnRlcnZhbCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBab29tTWVudVZpZXc7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIEFsb25lVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfYm9yZGVyV2lkdGggOiAzLFxyXG4gICAgX2NvbG9yIDogJyNFNkYwRkYnLFxyXG4gICAgZXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmV2ZW50cygpLCB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAubGVmdEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLnJpZ2h0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcblxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAubGVmdEJvcmRlcicgOiAncmVuZGVyJyxcclxuICAgICAgICAgICAgJ2RyYWdlbmQgLnJpZ2h0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAubGVmdEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLmxlZnRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAucmlnaHRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5yaWdodEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZSdcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1pbihsb2NhbFgsIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5tYXgobG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3Jlc2l6ZVBvaW50ZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xyXG4gICAgfSxcclxuICAgIF9jaGFuZ2VTaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxlZnRYID0gdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKTtcclxuICAgICAgICB2YXIgcmlnaHRYID0gdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkgKyB0aGlzLl9ib3JkZXJXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHJlY3Qud2lkdGgocmlnaHRYIC0gbGVmdFgpO1xyXG4gICAgICAgIHJlY3QueChsZWZ0WCk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB2YXIgY29tcGxldGVSZWN0ID0gdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF07XHJcbiAgICAgICAgY29tcGxldGVSZWN0LngobGVmdFgpO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHJpZ2h0WCk7XHJcbiAgICAgICAgdmFyIHJlc291cmNlcyA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpWzBdO1xyXG4gICAgICAgIHJlc291cmNlcy54KHJpZ2h0WCArIHRoaXMuX3Rvb2xiYXJPZmZzZXQpO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSAtIHRoaXMuX2JvcmRlcldpZHRoKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ21pbGVzdG9uZScpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmRpYW1vbmQnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JykuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJykuaGlkZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmRpYW1vbmQnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLm1haW5SZWN0Jykuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJykuc2hvdygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsb25lVGFza1ZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgUmVzb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuLi9SZXNvdXJjZXNFZGl0b3InKTtcclxuXHJcbnZhciBsaW5rSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxubGlua0ltYWdlLnNyYyA9ICdjc3MvaW1hZ2VzL2xpbmsucG5nJztcclxuXHJcbnZhciB1c2VySW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxudXNlckltYWdlLnNyYyA9ICdjc3MvaW1hZ2VzL3VzZXIucG5nJztcclxuXHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gQmFja2JvbmUuS29udmFWaWV3LmV4dGVuZCh7XHJcbiAgICBfZnVsbEhlaWdodCA6IDIxLFxyXG4gICAgX3RvcFBhZGRpbmcgOiAzLFxyXG4gICAgX2JhckhlaWdodCA6IDE1LFxyXG4gICAgX2NvbXBsZXRlQ29sb3IgOiAnI2U4ODEzNCcsXHJcbiAgICBfdG9vbGJhck9mZnNldCA6IDIwLFxyXG4gICAgX3Jlc291cmNlTGlzdE9mZnNldCA6IDIwLFxyXG4gICAgX21pbGVzdG9uZUNvbG9yIDogJ2JsdWUnLFxyXG4gICAgX21pbGVzdG9uZU9mZnNldCA6IDAsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLl9mdWxsSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlJyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5ub2RlVHlwZSAhPT0gJ0dyb3VwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdkcmFnZW5kJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlV2l0aENoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VlbnRlcicgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93VG9vbHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVSZXNvdXJjZXNMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ncmFiUG9pbnRlcihlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ21vdXNlbGVhdmUnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlVG9vbHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dSZXNvdXJjZXNMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0TW91c2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdzdGFydCAuZGVwZW5kZW5jeVRvb2wnIDogJ19zdGFydENvbm5lY3RpbmcnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmRlcGVuZGVuY3lUb29sJyA6ICdfbW92ZUNvbm5lY3QnLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAuZGVwZW5kZW5jeVRvb2wnIDogJ19jcmVhdGVEZXBlbmRlbmN5JyxcclxuICAgICAgICAgICAgJ2NsaWNrIC5yZXNvdXJjZXMnIDogJ19lZGl0UmVzb3VyY2VzJ1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBuZXcgS29udmEuR3JvdXAoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBwb3MueCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBpZCA6IHRoaXMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGZha2VCYWNrZ3JvdW5kID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2Zha2VCYWNrZ3JvdW5kJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbWFpblJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGRpYW1vbmQgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9taWxlc3RvbmVDb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcgK3RoaXMuX2JhckhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgIHggOiB0aGlzLl9iYXJIZWlnaHQgLyAyLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjgsXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYmFySGVpZ2h0ICogMC44LFxyXG4gICAgICAgICAgICBvZmZzZXRYIDogdGhpcy5fYmFySGVpZ2h0ICogMC44IC8gMixcclxuICAgICAgICAgICAgb2Zmc2V0WSA6IHRoaXMuX2JhckhlaWdodCAqIDAuOCAvIDIsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnZGlhbW9uZCcsXHJcbiAgICAgICAgICAgIHJvdGF0aW9uIDogNDUsXHJcbiAgICAgICAgICAgIHZpc2libGUgOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb21wbGV0ZUNvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2NvbXBsZXRlUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGFyYyA9IG5ldyBLb252YS5TaGFwZSh7XHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnbGlnaHRncmVlbicsXHJcbiAgICAgICAgICAgIGRyYXdGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaG9yT2Zmc2V0ID0gNjtcclxuICAgICAgICAgICAgICAgIHZhciBzaXplID0gIHNlbGYuX2JhckhlaWdodCArIChzZWxmLl9ib3JkZXJTaXplIHx8IDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oaG9yT2Zmc2V0LCAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYXJjKGhvck9mZnNldCwgc2l6ZSAvIDIsIHNpemUgLyAyLCAtIE1hdGguUEkgLyAyLCBNYXRoLlBJIC8gMik7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbygwLCBzaXplKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU2hhcGUodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1nU2l6ZSA9IHNpemUgLSA0O1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UobGlua0ltYWdlLCAxLCAoc2l6ZSAtIGltZ1NpemUpIC8gMiwgaW1nU2l6ZSwgaW1nU2l6ZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpdEZ1bmMgOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5yZWN0KDAsIDAsIDYgKyBzZWxmLl9iYXJIZWlnaHQsIHNlbGYuX2JhckhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmFtZSA6ICdkZXBlbmRlbmN5VG9vbCcsXHJcbiAgICAgICAgICAgIHZpc2libGUgOiBmYWxzZSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgdG9vbGJhciA9IG5ldyBLb252YS5Hcm91cCh7XHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmVzb3VyY2VzJyxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHNpemUgPSBzZWxmLl9iYXJIZWlnaHQgKyAoc2VsZi5fYm9yZGVyU2l6ZSB8fCAwKTtcclxuICAgICAgICB2YXIgdG9vbGJhY2sgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiAnbGlnaHRncmV5JyxcclxuICAgICAgICAgICAgd2lkdGggOiBzaXplLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiBzaXplLFxyXG4gICAgICAgICAgICBjb3JuZXJSYWRpdXMgOiAyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB1c2VySW0gPSBuZXcgS29udmEuSW1hZ2Uoe1xyXG4gICAgICAgICAgICBpbWFnZSA6IHVzZXJJbWFnZSxcclxuICAgICAgICAgICAgd2lkdGggOiBzaXplLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiBzaXplXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbGJhci5hZGQodG9vbGJhY2ssIHVzZXJJbSk7XHJcblxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSBuZXcgS29udmEuVGV4dCh7XHJcbiAgICAgICAgICAgIG5hbWUgOiAncmVzb3VyY2VMaXN0JyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGxpc3RlbmluZyA6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZChmYWtlQmFja2dyb3VuZCwgZGlhbW9uZCwgcmVjdCwgY29tcGxldGVSZWN0LCBhcmMsIHRvb2xiYXIsIHJlc291cmNlTGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9lZGl0UmVzb3VyY2VzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZpZXcgPSBuZXcgUmVzb3VyY2VFZGl0b3Ioe1xyXG4gICAgICAgICAgICBtb2RlbCA6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLmVsLmdldFN0YWdlKCkuZ2V0UG9pbnRlclBvc2l0aW9uKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIocG9zKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHJlY3Qud2lkdGgoKTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5yb3VuZCh4IC8gZGF5c1dpZHRoKSwgZGF5czIgPSBNYXRoLnJvdW5kKCh4ICsgbGVuZ3RoKSAvIGRheXNXaWR0aCk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXHJcbiAgICAgICAgICAgIGVuZDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyIC0gMSlcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2hvd1Rvb2xzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKS5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2hpZGVUb29scyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9zaG93UmVzb3VyY2VzTGlzdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2hpZGVSZXNvdXJjZXNMaXN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0JykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ3JhYlBvaW50ZXIgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBlLnRhcmdldC5uYW1lKCk7XHJcbiAgICAgICAgaWYgKChuYW1lID09PSAnbWFpblJlY3QnKSB8fCAobmFtZSA9PT0gJ2RlcGVuZGVuY3lUb29sJykgfHxcclxuICAgICAgICAgICAgKG5hbWUgPT09ICdjb21wbGV0ZVJlY3QnKSB8fCAoZS50YXJnZXQuZ2V0UGFyZW50KCkubmFtZSgpID09PSAncmVzb3VyY2VzJykpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9kZWZhdWx0TW91c2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcclxuICAgIH0sXHJcbiAgICBfc3RhcnRDb25uZWN0aW5nIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLmhpZGUoKTtcclxuICAgICAgICB2YXIgcG9zID0gdG9vbC5nZXRBYnNvbHV0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgc3Ryb2tlIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAxLFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbcG9zLnggLSBzdGFnZS54KCksIHBvcy55LCBwb3MueCAtIHN0YWdlLngoKSwgcG9zLnldLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2Nvbm5lY3RvcidcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYWRkKGNvbm5lY3Rvcik7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ29ubmVjdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgcG9pbnRzID0gY29ubmVjdG9yLnBvaW50cygpO1xyXG4gICAgICAgIHBvaW50c1syXSA9IHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLnggLSBzdGFnZS54KCk7XHJcbiAgICAgICAgcG9pbnRzWzNdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueTtcclxuICAgICAgICBjb25uZWN0b3IucG9pbnRzKHBvaW50cyk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZURlcGVuZGVuY3kgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBlbCA9IHN0YWdlLmdldEludGVyc2VjdGlvbihzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKSk7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gZWwgJiYgZWwuZ2V0UGFyZW50KCk7XHJcbiAgICAgICAgdmFyIHRhc2tJZCA9IGdyb3VwICYmIGdyb3VwLmlkKCk7XHJcbiAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5tb2RlbDtcclxuICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5nZXQodGFza0lkKTtcclxuICAgICAgICBpZiAoYWZ0ZXJNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHJlbW92ZUZvciA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5maW5kKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlbW92ZUZvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLnJlbW92ZURlcGVuZGVuY3kocmVtb3ZlRm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gZG9uJ3QgdXBkYXRlIGVsZW1lbnQgd2hpbGUgZHJhZ2dpbmdcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCBjaGFuZ2U6Y29tcGxldGUgY2hhbmdlOnJlc291cmNlcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZHJhZ2dpbmcgPSB0aGlzLmVsLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5nZXRDaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZHJhZ2dpbmcgfHwgY2hpbGQuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZVggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHgxOiAoRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ3N0YXJ0JykpIC0gMSkgKiBkYXlzV2lkdGgsXHJcbiAgICAgICAgICAgIHgyOiAoRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5tb2RlbC5nZXQoJ2VuZCcpKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICAvLyBtb3ZlIGdyb3VwXHJcbiAgICAgICAgdGhpcy5lbC54KHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgZmFrZSBiYWNrZ3JvdW5kIHJlY3QgcGFyYW1zXHJcbiAgICAgICAgdmFyIGJhY2sgPSB0aGlzLmVsLmZpbmQoJy5mYWtlQmFja2dyb3VuZCcpWzBdO1xyXG4gICAgICAgIGJhY2sueCggLSAyMCk7XHJcbiAgICAgICAgYmFjay53aWR0aCh4LngyIC0geC54MSArIDYwKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIG1haW4gcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC54KDApO1xyXG4gICAgICAgIHJlY3Qud2lkdGgoeC54MiAtIHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS54KDApO1xyXG5cclxuICAgICAgICB2YXIgX21pbGVzdG9uZU9mZnNldCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICBfbWlsZXN0b25lT2Zmc2V0ID0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHgueDIgLSB4LngxICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgdG9vbC55KHRoaXMuX3RvcFBhZGRpbmcpO1xyXG5cclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VzLngoeC54MiAtIHgueDEgKyB0aGlzLl90b29sYmFyT2Zmc2V0ICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgcmVzb3VyY2VzLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2UgbGlzdFxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKVswXTtcclxuICAgICAgICByZXNvdXJjZUxpc3QueCh4LngyIC0geC54MSArIHRoaXMuX3Jlc291cmNlTGlzdE9mZnNldCArIF9taWxlc3RvbmVPZmZzZXQpO1xyXG4gICAgICAgIHJlc291cmNlTGlzdC55KHRoaXMuX3RvcFBhZGRpbmcgKyAyKTtcclxuICAgICAgICB2YXIgbmFtZXMgPSBbXTtcclxuICAgICAgICB2YXIgbGlzdCA9IHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKTtcclxuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2VJZCkge1xyXG4gICAgICAgICAgICB2YXIgcmVzID0gXy5maW5kKCh0aGlzLnNldHRpbmdzLnN0YXR1c2VzLnJlc291cmNlZGF0YSB8fCBbXSksIGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5Vc2VySWQudG9TdHJpbmcoKSA9PT0gcmVzb3VyY2VJZC50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgMykge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVzLnB1c2gocmVzLlVzZXJuYW1lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFsaWFzZXMgPSBfLm1hcChyZXMuVXNlcm5hbWUuc3BsaXQoJyAnKSwgZnVuY3Rpb24oc3RyKSB7IHJldHVybiBzdHJbMF07fSkuam9pbignJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChhbGlhc2VzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LnRleHQobmFtZXMuam9pbignLCAnKSk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHNldFkgOiBmdW5jdGlvbih5KSB7XHJcbiAgICAgICAgdGhpcy5feSA9IHk7XHJcbiAgICAgICAgdGhpcy5lbC55KHkpO1xyXG4gICAgfSxcclxuICAgIGdldFkgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQ29ubmVjdG9yVmlldyA9IEJhY2tib25lLktvbnZhVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yIDogJ2dyZXknLFxyXG4gICAgX3dyb25nQ29sb3IgOiAncmVkJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gcGFyYW1zLmJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMuYWZ0ZXJNb2RlbCA9IHBhcmFtcy5hZnRlck1vZGVsO1xyXG4gICAgICAgIHRoaXMuX3kxID0gMDtcclxuICAgICAgICB0aGlzLl95MiA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGluZSA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGggOiAyLFxyXG4gICAgICAgICAgICBzdHJva2UgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbMCwwLDAsMF1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGluZTtcclxuICAgIH0sXHJcbiAgICBzZXRZMSA6IGZ1bmN0aW9uKHkxKSB7XHJcbiAgICAgICAgdGhpcy5feTEgPSB5MTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHNldFkyIDogZnVuY3Rpb24oeTIpIHtcclxuICAgICAgICB0aGlzLl95MiA9IHkyO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgaWYgKHgueDIgPj0geC54MSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFt4LngxLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MSwgeC54MSArIDEwLCB0aGlzLl95MiwgeC54MiwgdGhpcy5feTJdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnN0cm9rZSh0aGlzLl93cm9uZ0NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW1xyXG4gICAgICAgICAgICAgICAgeC54MSwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTIsXHJcbiAgICAgICAgICAgICAgICB4LngyLCB0aGlzLl95MlxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYWZ0ZXJNb2RlbC5nZXQoJ3N0YXJ0JykpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvclZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSByZXF1aXJlKCcuL05lc3RlZFRhc2tWaWV3Jyk7XHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gcmVxdWlyZSgnLi9BbG9uZVRhc2tWaWV3Jyk7XHJcbnZhciBDb25uZWN0b3JWaWV3ID0gcmVxdWlyZSgnLi9Db25uZWN0b3JWaWV3Jyk7XHJcblxyXG52YXIgR2FudHRDaGFydFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyNnYW50dC1jb250YWluZXInLFxyXG4gICAgX3RvcFBhZGRpbmcgOiA3MyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gW107XHJcbiAgICAgICAgdGhpcy5faW5pdFN0YWdlKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdExheWVycygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRCYWNrZ3JvdW5kKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFN1YlZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdENvbGxlY3Rpb25FdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBzZXRMZWZ0UGFkZGluZyA6IGZ1bmN0aW9uKG9mZnNldCkge1xyXG4gICAgICAgIHRoaXMuX2xlZnRQYWRkaW5nID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdFN0YWdlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZSA9IG5ldyBLb252YS5TdGFnZSh7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA6IHRoaXMuZWxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRMYXllcnMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLkZsYXllciA9IG5ldyBLb252YS5MYXllcigpO1xyXG4gICAgICAgIHRoaXMuQmxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIsIHRoaXMuRmxheWVyKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlU3RhZ2VBdHRycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHByZXZpb3VzVGFza1ggPSB0aGlzLl90YXNrVmlld3MubGVuZ3RoID8gdGhpcy5fdGFza1ZpZXdzWzBdLmVsLngoKSA6IDA7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5zZXRBdHRycyh7XHJcbiAgICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgoJCgnLnRhc2tzJykuaW5uZXJIZWlnaHQoKSArIHRoaXMuX3RvcFBhZGRpbmcsIHdpbmRvdy5pbm5lckhlaWdodCAtICQodGhpcy5zdGFnZS5nZXRDb250YWluZXIoKSkub2Zmc2V0KCkudG9wKSxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuJGVsLmlubmVyV2lkdGgoKSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDtcclxuICAgICAgICAgICAgICAgIHZhciBtaW5YID0gLSAobGluZVdpZHRoIC0gdGhpcy53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb3MueCA+IHNlbGYuX2xlZnRQYWRkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYuX2xlZnRQYWRkaW5nO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3MueCA8IG1pblgpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gbWluWDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHBvcy54O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VsZi5kcmFnZ2VkVG9EYXkgPSBNYXRoLmFicyh4IC0gc2VsZi5fbGVmdFBhZGRpbmcpIC8gc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90YXNrVmlld3MubGVuZ3RoIHx8ICFwcmV2aW91c1Rhc2tYKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLngodGhpcy5fbGVmdFBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbnggPSAtKGxpbmVXaWR0aCAtIHRoaXMuc3RhZ2Uud2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMuX2xlZnRQYWRkaW5nIC0gKHRoaXMuZHJhZ2dlZFRvRGF5IHx8IDApICogc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZS54KE1hdGgubWF4KG1pbngsIHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xyXG5cclxuICAgIH0sXHJcbiAgICBfaW5pdEJhY2tncm91bmQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JpZCA9IG5ldyBLb252YS5TaGFwZSh7XHJcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0U2NlbmVGdW5jdGlvbigpLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDAsXHJcbiAgICAgICAgICAgIGZpbGwgOiAncmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgbmFtZSA6ICdncmlkJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBiYWNrID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLnN0YWdlLmhlaWdodCgpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHdpZHRoXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnREYXlMaW5lID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc3RhZ2UuaGVpZ2h0KCksXHJcbiAgICAgICAgICAgIHdpZHRoOiAyLFxyXG4gICAgICAgICAgICB5OiAwLFxyXG4gICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICBmaWxsOiAnZ3JlZW4nLFxyXG4gICAgICAgICAgICBsaXN0ZW5pbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICBuYW1lOiAnY3VycmVudERheUxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB5ID0gTWF0aC5tYXgoMCwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgLSAxNSk7XHJcbiAgICAgICAgICAgIGdyaWQueSh5KTtcclxuICAgICAgICAgICAgZ3JpZC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLkJsYXllci5hZGQoYmFjaykuYWRkKGN1cnJlbnREYXlMaW5lKS5hZGQoZ3JpZCk7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XHJcbiAgICAgICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2dldFNjZW5lRnVuY3Rpb24gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2Rpc3BsYXkgPSB0aGlzLnNldHRpbmdzLnNkaXNwbGF5O1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gMTtcclxuICAgICAgICB2YXIgcm93SGVpZ2h0ID0gMjA7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAgICAgICAgIHZhciBpLCBzLCBpTGVuID0gMCxcdGRheXNXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCwgeCxcdGxlbmd0aCxcdGhEYXRhID0gc2F0dHIuaERhdGE7XHJcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAvL2RyYXcgdGhyZWUgbGluZXNcclxuICAgICAgICAgICAgZm9yKGkgPSAxOyBpIDwgNCA7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcclxuICAgICAgICAgICAgZm9yIChzID0gMTsgcyA8IDM7IHMrKyl7XHJcbiAgICAgICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aD1oRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB5Zik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxMHB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWYgLSByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHlpID0geWY7IHlmID0geWYgKyByb3dIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwOyBzID0gMztcclxuICAgICAgICAgICAgdmFyIGRyYWdJbnQgPSBwYXJzZUludChzYXR0ci5kcmFnSW50ZXJ2YWwsIDEwKTtcclxuICAgICAgICAgICAgdmFyIGhpZGVEYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmKCBkcmFnSW50ID09PSAxNCB8fCBkcmFnSW50ID09PSAzMCl7XHJcbiAgICAgICAgICAgICAgICBoaWRlRGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gaERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKGhEYXRhW3NdW2ldLmhvbHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpIC0gbGVuZ3RoLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpIC0gbGVuZ3RoLCB5aSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICc2cHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlkZURhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMXB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeCAtIGxlbmd0aCAvIDIsIHlpICsgcm93SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb250ZXh0LmZpbGxTdHJva2VTaGFwZSh0aGlzKTtcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIF9jYWNoZUJhY2tncm91bmQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcbiAgICAgICAgdGhpcy5CbGF5ZXIuZmluZE9uZSgnLmdyaWQnKS5jYWNoZSh7XHJcbiAgICAgICAgICAgIHggOiAwLFxyXG4gICAgICAgICAgICB5IDogMCxcclxuICAgICAgICAgICAgd2lkdGggOiBsaW5lV2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuc3RhZ2UuaGVpZ2h0KClcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlVG9kYXlMaW5lOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGF0dHJzPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICB2YXIgeCA9IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIG5ldyBEYXRlKCkpICogZGF5c1dpZHRoO1xyXG4gICAgICB0aGlzLkJsYXllci5maW5kT25lKCcuY3VycmVudERheUxpbmUnKS54KHgpLmhlaWdodCh0aGlzLnN0YWdlLmhlaWdodCgpKTtcclxuICAgICAgdGhpcy5CbGF5ZXIuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlQmFja2dyb3VuZCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6d2lkdGgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUJhY2tncm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0sXHJcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgcmVtb3ZlJywgXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gd2FpdCBmb3IgbGVmdCBwYW5lbCB1cGRhdGVzXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcclxuICAgICAgICB9LCAxMCkpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQgY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmRlcGVuZCcsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdkZXBlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rvcih0YXNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICduZXN0ZWRTdGF0ZUNoYW5nZScsIGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9yZW1vdmVWaWV3Rm9yTW9kZWwgOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHZhciB0YXNrVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IG1vZGVsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVZpZXcodGFza1ZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZW1vdmVWaWV3IDogZnVuY3Rpb24odGFza1ZpZXcpIHtcclxuICAgICAgICB0YXNrVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBfLndpdGhvdXQodGhpcy5fdGFza1ZpZXdzLCB0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZUNvbm5lY3RvciA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5hZnRlck1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbm5lY3RvclZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBfLndpdGhvdXQodGhpcy5fY29ubmVjdG9yVmlld3MsIGNvbm5lY3RvclZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3ViVmlld3MgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICB0aGlzLkZsYXllci5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFRhc2tWaWV3IDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciB2aWV3O1xyXG4gICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgdmlldyA9IG5ldyBOZXN0ZWRUYXNrVmlldyh7XHJcbiAgICAgICAgICAgICAgICBtb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmlldyA9IG5ldyBBbG9uZVRhc2tWaWV3KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzLnB1c2godmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2FkZENvbm5lY3RvclZpZXcgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIGRlcGVuZElkID0gdGFzay5nZXQoJ2RlcGVuZCcpO1xyXG4gICAgICAgIGlmICghZGVwZW5kSWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBDb25uZWN0b3JWaWV3KHtcclxuICAgICAgICAgICAgYmVmb3JlTW9kZWwgOiB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRlcGVuZElkKSxcclxuICAgICAgICAgICAgYWZ0ZXJNb2RlbCA6IHRhc2ssXHJcbiAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcclxuICAgICAgICB2aWV3LmVsLm1vdmVUb0JvdHRvbSgpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MucHVzaCh2aWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVxdWVzdFJlc29ydCA6IChmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XHJcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgICAgIHdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICB9KCkpLFxyXG4gICAgX3Jlc29ydFZpZXdzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxhc3RZID0gdGhpcy5fdG9wUGFkZGluZztcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmlldy5zZXRZKGxhc3RZKTtcclxuICAgICAgICAgICAgbGFzdFkgKz0gdmlldy5oZWlnaHQ7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBkZXBlbmRJZCA9IHRhc2suZ2V0KCdkZXBlbmQnKTtcclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSB8fCAhZGVwZW5kSWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRlcGVuZElkKTtcclxuICAgICAgICAgICAgdmFyIGJlZm9yZVZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgYWZ0ZXJWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcuYmVmb3JlTW9kZWwgPT09IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMShiZWZvcmVWaWV3LmdldFkoKSArIGJlZm9yZVZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMihhZnRlclZpZXcuZ2V0WSgpICArIGFmdGVyVmlldy5fZnVsbEhlaWdodCAvIDIpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYmF0Y2hEcmF3KCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW50dENoYXJ0VmlldztcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3IgOiAnI2IzZDFmYycsXHJcbiAgICBfYm9yZGVyU2l6ZSA6IDYsXHJcbiAgICBfYmFySGVpZ2h0IDogMTAsXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjQzk1RjEwJyxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWzAsIDAsIHRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWy10aGlzLl9ib3JkZXJTaXplICogMS41LCAwLCAwLCAwLCAwLCB0aGlzLl9ib3JkZXJTaXplXSxcclxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBncm91cCBpcyBtb3ZlZFxyXG4gICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZGV0ZWN0IGludGVydmFsXHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmVsLngoKSArIHJlY3QueCgpO1xyXG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCk7XHJcbiAgICAgICAgdmFyIG5ld1N0YXJ0ID0gYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKTtcclxuICAgICAgICB0aGlzLm1vZGVsLm1vdmVUb1N0YXJ0KG5ld1N0YXJ0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEpO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVdpZHRoID0gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgICAgIGlmIChjb21wbGV0ZVdpZHRoID4gdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHgueDIgLSB4LngxKSAtIGNvbXBsZXRlV2lkdGggPCB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTW9kYWxFZGl0ID0gcmVxdWlyZSgnLi4vTW9kYWxUYXNrRWRpdFZpZXcnKTtcclxudmFyIENvbW1lbnRzID0gcmVxdWlyZSgnLi4vQ29tbWVudHNWaWV3Jyk7XHJcblxyXG5mdW5jdGlvbiBDb250ZXh0TWVudVZpZXcocGFyYW1zKSB7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMuY29sbGVjdGlvbjtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICd1bCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykgfHwgJCh0aGlzKS5kYXRhKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmNvbGxlY3Rpb24uZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnZGVsZXRlJyl7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncHJvcGVydGllcycpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgTW9kYWxFZGl0KHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbCA6IG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzIDogc2VsZi5zZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2NvbW1lbnRzJyl7XHJcbiAgICAgICAgICAgICAgICBuZXcgQ29tbWVudHMoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsIDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MgOiBzZWxmLnNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICB9KS5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAncm93QWJvdmUnKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaW5kZW50Jykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLmluZGVudChtb2RlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ291dGRlbnQnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29sbGVjdGlvbi5vdXRkZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBBYm92ZVwiLCBpY29uOiBcImFib3ZlXCIgfSxcclxuICAgICAgICAgICAgXCJyb3dCZWxvd1wiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBCZWxvd1wiLCBpY29uOiBcImJlbG93XCIgfSxcclxuICAgICAgICAgICAgXCJpbmRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO0luZGVudCBSb3dcIiwgaWNvbjogXCJpbmRlbnRcIiB9LFxyXG4gICAgICAgICAgICBcIm91dGRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO091dGRlbnQgUm93XCIsIGljb246IFwib3V0ZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwic2VwMVwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcInByb3BlcnRpZXNcIjogeyBuYW1lOiBcIiZuYnNwO1Byb3BlcnRpZXNcIiwgaWNvbjogXCJwcm9wZXJ0aWVzXCIgfSxcclxuICAgICAgICAgICAgXCJjb21tZW50c1wiOiB7IG5hbWU6IFwiJm5ic3A7Q29tbWVudHNcIiwgaWNvbjogXCJjb21tZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAyXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwiZGVsZXRlXCI6IHsgbmFtZTogXCImbmJzcDtEZWxldGUgUm93XCIsIGljb246IFwiZGVsZXRlXCIgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc29ydGluZGV4ID0gKHRoaXMuYXBwLnRhc2tzLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpICsgMSk7XHJcbiAgICB9XHJcbiAgICBkYXRhLnNvcnRpbmRleCA9IHNvcnRpbmRleDtcclxuICAgIGRhdGEucGFyZW50aWQgPSByZWZfbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xyXG4gICAgdmFyIHRhc2sgPSB0aGlzLmNvbGxlY3Rpb24uYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRGF0ZVBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ0RhdGVQaWNrZXInLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcih7XHJcbi8vICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLFxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgIG9uU2VsZWN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0IDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ3Nob3cnKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdkZXN0cm95Jyk7XHJcbiAgICB9LFxyXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlIDogZnVuY3Rpb24oKSB7XHJcbi8vICAgICAgICB0aGlzLmdldERPTU5vZGUoKS52YWx1ZSA9IHRoaXMucHJvcHMudmFsdWUudG9TdHJpbmcoJ2RkL21tL3l5Jyk7XHJcbiAgICAgICAgdmFyIGRhdGVTdHIgPSAkLmRhdGVwaWNrZXIuZm9ybWF0RGF0ZSh0aGlzLnByb3BzLmRhdGVGb3JtYXQsIHRoaXMucHJvcHMudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlID0gZGF0ZVN0cjtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbi8vICAgICAgICAgICAgZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXHJcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA6ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgdGhpcy5wcm9wcy52YWx1ZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XHJcblxyXG52YXIgTmVzdGVkVGFzayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ05lc3RlZFRhc2snLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vbignY2hhbmdlOmhpZGRlbiBjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3VidGFza3MgPSB0aGlzLnByb3BzLm1vZGVsLmNoaWxkcmVuLm1hcChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICBpc1N1YlRhc2sgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnByb3BzLmRhdGVGb3JtYXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsIDogdGhpcy5wcm9wcy5tb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdzdWItdGFzay1saXN0IHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VidGFza3NcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2s7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xyXG52YXIgTmVzdGVkVGFzayA9IHJlcXVpcmUoJy4vTmVzdGVkVGFzaycpO1xyXG5cclxuZnVuY3Rpb24gZ2V0RGF0YShjb250YWluZXIpIHtcclxuICAgIHZhciBkYXRhID0gW107XHJcbiAgICB2YXIgY2hpbGRyZW4gPSAkKCc8b2w+JyArIGNvbnRhaW5lci5nZXQoMCkuaW5uZXJIVE1MICsgJzwvb2w+JykuY2hpbGRyZW4oKTtcclxuICAgIF8uZWFjaChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICB2YXIgJGNoaWxkID0gJChjaGlsZCk7XHJcbiAgICAgICAgdmFyIG9iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiAkY2hpbGQuZGF0YSgnaWQnKSxcclxuICAgICAgICAgICAgY2hpbGRyZW4gOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHN1Ymxpc3QgPSAkY2hpbGQuZmluZCgnb2wnKTtcclxuICAgICAgICBpZiAoc3VibGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqLmNoaWxkcmVuID0gZ2V0RGF0YShzdWJsaXN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5wdXNoKG9iaik7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBkYXRhO1xyXG59XHJcblxyXG52YXIgU2lkZVBhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWU6ICdTaWRlUGFuZWwnLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdhZGQgcmVtb3ZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLl9tYWtlU29ydGFibGUoKTtcclxuICAgIH0sXHJcbiAgICBfbWFrZVNvcnRhYmxlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoJy50YXNrLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGNvbnRhaW5lci5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgIGdyb3VwOiAnc29ydGFibGUnLFxyXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3RvciA6ICdvbCcsXHJcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXIgc29ydC1wbGFjZWhvbGRlclwiLz4nLFxyXG4gICAgICAgICAgICBvbkRyYWdTdGFydCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyYWcgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGdldERhdGEoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlciA9ICQoJzxkaXY+Jyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kIDogJ2dyZXknLFxyXG4gICAgICAgICAgICBvcGFjaXR5IDogJzAuNScsXHJcbiAgICAgICAgICAgIHRvcCA6ICcwJyxcclxuICAgICAgICAgICAgd2lkdGggOiAnMTAwJSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZW92ZXIoZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHJld3JpdGUgdG8gZmluZCBjbG9zZXN0IHVsXHJcbiAgICAgICAgICAgIGlmICghJGVsLmRhdGEoJ2lkJykpIHtcclxuICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICghJGVsLmRhdGEoJ2lkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZWwgPSAkZWwucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHBvcyA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcCA6IHBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogJGVsLmhlaWdodCgpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIHJlcXVlc3RVcGRhdGUgOiAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAod2FpdGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgICAgIHdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICB9KCkpLFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLnRhc2stY29udGFpbmVyJykuc29ydGFibGUoXCJkZXN0cm95XCIpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdkcmFnLWl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrLWNvbnRhaW5lciBzb3J0YWJsZSdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0YXNrc1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGVQYW5lbDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEYXRlUGlja2VyID0gcmVxdWlyZSgnLi9EYXRlUGlja2VyJyk7XHJcbnZhciBDb21tZXRzVmlldyA9IHJlcXVpcmUoJy4uL0NvbW1lbnRzVmlldycpO1xyXG5cclxudmFyIFRhc2tJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnVGFza0l0ZW0nLFxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZWRpdFJvdyA6IHVuZGVmaW5lZFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50RGlkVXBkYXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudERpZE1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZTpuYW1lIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCBjaGFuZ2U6ZHVyYXRpb24gY2hhbmdlOmhpZ2h0bGlnaHQgY2hhbmdlOkNvbW1lbnRzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBfZmluZE5lc3RlZExldmVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxldmVsID0gMDtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wcm9wcy5tb2RlbC5wYXJlbnQ7XHJcbiAgICAgICAgd2hpbGUodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldmVsKys7XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9jcmVhdGVGaWVsZCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRSb3cgPT09IGNvbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRWRpdEZpZWxkKGNvbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVSZWFkRmlsZWQoY29sKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlUmVhZEZpbGVkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcclxuICAgICAgICBpZiAoY29sID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKSArICclJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkLmRhdGVwaWNrZXIuZm9ybWF0RGF0ZSh0aGlzLnByb3BzLmRhdGVGb3JtYXQsIG1vZGVsLmdldChjb2wpKTtcclxuLy8gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KGNvbCkudG9TdHJpbmcodGhpcy5wcm9wcy5kYXRlRm9ybWF0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2R1cmF0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5nZXQoJ3N0YXJ0JyksIG1vZGVsLmdldCgnZW5kJykpKycgZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRGF0ZUVsZW1lbnQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgdmFsID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKTtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChEYXRlUGlja2VyLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogdmFsLFxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxyXG4gICAgICAgICAgICBrZXkgOiBjb2wsXHJcbiAgICAgICAgICAgIG9uQ2hhbmdlIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfZHVyYXRpb25DaGFuZ2UgOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHZhciBudW1iZXIgPSBwYXJzZUludCh2YWx1ZS5yZXBsYWNlKCAvXlxcRCsvZywgJycpLCAxMCk7XHJcbiAgICAgICAgaWYgKCFudW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZigndycpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkV2Vla3MobnVtYmVyKSk7XHJcbiAgICAgICAgfSBlbHNlICBpZiAodmFsdWUuaW5kZXhPZignbScpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkTW9udGhzKG51bWJlcikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG51bWJlci0tO1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKG51bWJlcikpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRHVyYXRpb25GaWVsZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB2YWwgPSBEYXRlLmRheXNkaWZmKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnZW5kJykpKycgZCc7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICB2YWx1ZSA6IHRoaXMuc3RhdGUudmFsIHx8IHZhbCxcclxuICAgICAgICAgICAga2V5IDogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kdXJhdGlvbkNoYW5nZShuZXdWYWwpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnZhbCA9IG5ld1ZhbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uS2V5RG93biA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnZhbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUVkaXRGaWVsZCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xyXG4gICAgICAgIGlmIChjb2wgPT09ICdzdGFydCcgfHwgY29sID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRGF0ZUVsZW1lbnQoY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2R1cmF0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRHVyYXRpb25GaWVsZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJuYW1lSW5wdXRcIixcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25CbHVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGNyZWF0ZUNvbW1lbnRGaWVsZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb21tZW50cyA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdDb21tZW50cycpIHx8IDA7XHJcbiAgICAgICAgaWYgKCFjb21tZW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAga2V5IDogJ2NvbW1lbnRzJyxcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtY29tbWVudHMnLFxyXG4gICAgICAgICAgICAgICAgb25DbGljayA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb21tZXRzVmlldyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsIDogdGhpcy5wcm9wcy5tb2RlbFxyXG4gICAgICAgICAgICAgICAgICAgIH0pLnJlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2ltZycse1xyXG4gICAgICAgICAgICAgICAgc3JjIDogJ2Nzcy9pbWFnZXMvY29tbWVudHMucG5nJ1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgY29tbWVudHNcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuICAgIHNob3dDb250ZXh0IDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICB2YXIgdWwgPSAkZWwucGFyZW50KCk7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICB1bC5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgICAgIHggOiBvZmZzZXQubGVmdCArIDIwLFxyXG4gICAgICAgICAgICB5IDogb2Zmc2V0LnRvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3VsJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICArICh0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykgPyAnIGNvbGxhcHNlZCcgOiAnJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgb25Eb3VibGVDbGljayA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGUudGFyZ2V0LmNsYXNzTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IGUudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2wgPSBjbGFzc05hbWUuc2xpY2UoNCwgY2xhc3NOYW1lLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSBjb2w7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcicgOiB0aGlzLnByb3BzLm1vZGVsLmdldCgnaGlnaHRsaWdodCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdpbmZvJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWluZm8nXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2ltZycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjIDogJ2Nzcy9pbWFnZXMvaW5mby5wbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrIDogdGhpcy5zaG93Q29udGV4dFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3NvcnRpbmRleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1zb3J0aW5kZXgnXHJcbiAgICAgICAgICAgICAgICB9LCBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgMSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5IDogJ25hbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLW5hbWUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLmlzTmVzdGVkKCkgPyBSZWFjdC5jcmVhdGVFbGVtZW50KCdpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAndHJpYW5nbGUgaWNvbiAnICsgKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSA/ICdyaWdodCcgOiAnZG93bicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnY29sbGFwc2VkJywgIXRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0IDogKHRoaXMuX2ZpbmROZXN0ZWRMZXZlbCgpICogMTApICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVGaWVsZCgnbmFtZScpKVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29tbWVudEZpZWxkKCksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnY29tcGxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtY29tcGxldGUnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnY29tcGxldGUnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnc3RhcnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtc3RhcnQnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnc3RhcnQnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWVuZCdcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdlbmQnKSksXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtZHVyYXRpb24nXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnZHVyYXRpb24nKSlcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tJdGVtO1xyXG4iXX0=
