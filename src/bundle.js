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

var TaskCollection = babelHelpers.interopRequire(require("./collections/TaskCollection"));
var Settings = babelHelpers.interopRequire(require("./models/SettingModel"));
var GanttView = babelHelpers.interopRequire(require("./views/GanttView"));

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
      React.unmountComponentAtNode(tasksContainer);
      React.render(React.createElement(SidePanel, {
        collection: this.collection,
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
            var y = Math.max(0, document.body.scrollTop || window.scrollY);
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
        var events = ["change:name", "change:complete", "change:start", "change:end", "change:duration", "change:hightlight", "change:Comments"];
        this.props.model.on(events.join(" "), function () {
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
        return React.createElement("span", {}, this._createReadFiled(col));
    },
    _createReadFiled: function _createReadFiled(col) {
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
    findRaw: function findRaw(e) {
        var className = e.target.parentNode.className;
        if (!className) {
            className = e.target.parentNode.parentNode.className;
        }
        var col = className.slice(4, className.length);
        return col;
    },
    render: function render() {
        var model = this.props.model;
        return React.createElement("ul", {
            className: "task" + (this.props.isSubTask ? " sub-task" : "") + (this.props.model.get("collapsed") ? " collapsed" : "") + (this.props.model.isNested() ? " nested" : ""),
            "data-id": this.props.model.cid,
            onDoubleClick: (function (e) {
                var row = this.findRaw(e);
                this.setState({
                    editRow: row
                });
            }).bind(this),
            // onClick: (e) => {
            //     this.setState({
            //         selectedCol: this.findRaw(e)
            //     });
            // },
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
            className: "col-name",
            style: {
                paddingLeft: this._findNestedLevel() * 10 + "px"
            }
        }, this.props.model.isNested() ? React.createElement("i", {
            className: "triangle icon " + (this.props.model.get("collapsed") ? "right" : "down"),
            onClick: (function () {
                this.props.model.set("collapsed", !this.props.model.get("collapsed"));
            }).bind(this)
        }) : undefined, React.createElement("div", {}, this._createField("name"))), this.createCommentField(), React.createElement("li", {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvbm9kZV9tb2R1bGVzL2JhYmVsL2V4dGVybmFsLWhlbHBlcnMuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NsaWVudENvbmZpZy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9jb2xsZWN0aW9ucy9UYXNrQ29sbGVjdGlvbi5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvZmFrZV9lOTZhN2Y3MC5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Jlc291cmNlUmVmZXJlbmNlLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy94bWxXb3JrZXIuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0NvbW1lbnRzVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Nb2RhbFRhc2tFZGl0Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvTm90aWZpY2F0aW9ucy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvUmVzb3VyY2VzRWRpdG9yLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L01pc2NNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOzs7Ozs7O0FDRkEsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFakMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFN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LENBQUMsT0FBTyxDQUFDLENBQUMsRUFDOUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsZUFBRyxFQUFFLEtBQUs7QUFDVixxQkFBUyxFQUFFLFNBQVM7U0FDdkIsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQzVCLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO0FBQ3RCLGVBQUcsRUFBRSxVQUFVO0FBQ2YscUJBQVMsRUFBRSxjQUFjO1NBQzVCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUNwQyxDQUFDO0tBQ1Q7Q0FDSixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuKGZ1bmN0aW9uKGdsb2JhbCl7dmFyIGJhYmVsSGVscGVycz1nbG9iYWwuYmFiZWxIZWxwZXJzPXt9O2JhYmVsSGVscGVycy5pbmhlcml0cz1mdW5jdGlvbihzdWJDbGFzcyxzdXBlckNsYXNzKXtpZih0eXBlb2Ygc3VwZXJDbGFzcyE9PVwiZnVuY3Rpb25cIiYmc3VwZXJDbGFzcyE9PW51bGwpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiBzdXBlckNsYXNzKX1zdWJDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzJiZzdXBlckNsYXNzLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnN1YkNsYXNzLGVudW1lcmFibGU6ZmFsc2Usd3JpdGFibGU6dHJ1ZSxjb25maWd1cmFibGU6dHJ1ZX19KTtpZihzdXBlckNsYXNzKXN1YkNsYXNzLl9fcHJvdG9fXz1zdXBlckNsYXNzfTtiYWJlbEhlbHBlcnMuZGVmYXVsdHM9ZnVuY3Rpb24ob2JqLGRlZmF1bHRzKXt2YXIga2V5cz1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7Zm9yKHZhciBpPTA7aTxrZXlzLmxlbmd0aDtpKyspe3ZhciBrZXk9a2V5c1tpXTt2YXIgdmFsdWU9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cyxrZXkpO2lmKHZhbHVlJiZ2YWx1ZS5jb25maWd1cmFibGUmJm9ialtrZXldPT09dW5kZWZpbmVkKXtPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLGtleSx2YWx1ZSl9fXJldHVybiBvYmp9O2JhYmVsSGVscGVycy5jcmVhdGVDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGtleSBpbiBwcm9wcyl7dmFyIHByb3A9cHJvcHNba2V5XTtwcm9wLmNvbmZpZ3VyYWJsZT10cnVlO2lmKHByb3AudmFsdWUpcHJvcC53cml0YWJsZT10cnVlfU9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl9cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuY3JlYXRlQ29tcHV0ZWRDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGk9MDtpPHByb3BzLmxlbmd0aDtpKyspe3ZhciBwcm9wPXByb3BzW2ldO3Byb3AuY29uZmlndXJhYmxlPXRydWU7aWYocHJvcC52YWx1ZSlwcm9wLndyaXRhYmxlPXRydWU7T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wLmtleSxwcm9wKX19cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuYXBwbHlDb25zdHJ1Y3Rvcj1mdW5jdGlvbihDb25zdHJ1Y3RvcixhcmdzKXt2YXIgaW5zdGFuY2U9T2JqZWN0LmNyZWF0ZShDb25zdHJ1Y3Rvci5wcm90b3R5cGUpO3ZhciByZXN1bHQ9Q29uc3RydWN0b3IuYXBwbHkoaW5zdGFuY2UsYXJncyk7cmV0dXJuIHJlc3VsdCE9bnVsbCYmKHR5cGVvZiByZXN1bHQ9PVwib2JqZWN0XCJ8fHR5cGVvZiByZXN1bHQ9PVwiZnVuY3Rpb25cIik/cmVzdWx0Omluc3RhbmNlfTtiYWJlbEhlbHBlcnMudGFnZ2VkVGVtcGxhdGVMaXRlcmFsPWZ1bmN0aW9uKHN0cmluZ3MscmF3KXtyZXR1cm4gT2JqZWN0LmZyZWV6ZShPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHJpbmdzLHtyYXc6e3ZhbHVlOk9iamVjdC5mcmVlemUocmF3KX19KSl9O2JhYmVsSGVscGVycy50YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZT1mdW5jdGlvbihzdHJpbmdzLHJhdyl7c3RyaW5ncy5yYXc9cmF3O3JldHVybiBzdHJpbmdzfTtiYWJlbEhlbHBlcnMuaW50ZXJvcFJlcXVpcmU9ZnVuY3Rpb24ob2JqKXtyZXR1cm4gb2JqJiZvYmouX19lc01vZHVsZT9vYmpbXCJkZWZhdWx0XCJdOm9ian07YmFiZWxIZWxwZXJzLnRvQXJyYXk9ZnVuY3Rpb24oYXJyKXtyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpP2FycjpBcnJheS5mcm9tKGFycil9O2JhYmVsSGVscGVycy50b0NvbnN1bWFibGVBcnJheT1mdW5jdGlvbihhcnIpe2lmKEFycmF5LmlzQXJyYXkoYXJyKSl7Zm9yKHZhciBpPTAsYXJyMj1BcnJheShhcnIubGVuZ3RoKTtpPGFyci5sZW5ndGg7aSsrKWFycjJbaV09YXJyW2ldO3JldHVybiBhcnIyfWVsc2V7cmV0dXJuIEFycmF5LmZyb20oYXJyKX19O2JhYmVsSGVscGVycy5zbGljZWRUb0FycmF5PWZ1bmN0aW9uKGFycixpKXtpZihBcnJheS5pc0FycmF5KGFycikpe3JldHVybiBhcnJ9ZWxzZSBpZihTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpe3ZhciBfYXJyPVtdO2Zvcih2YXIgX2l0ZXJhdG9yPWFycltTeW1ib2wuaXRlcmF0b3JdKCksX3N0ZXA7IShfc3RlcD1faXRlcmF0b3IubmV4dCgpKS5kb25lOyl7X2Fyci5wdXNoKF9zdGVwLnZhbHVlKTtpZihpJiZfYXJyLmxlbmd0aD09PWkpYnJlYWt9cmV0dXJuIF9hcnJ9ZWxzZXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKX19O2JhYmVsSGVscGVycy5vYmplY3RXaXRob3V0UHJvcGVydGllcz1mdW5jdGlvbihvYmosa2V5cyl7dmFyIHRhcmdldD17fTtmb3IodmFyIGkgaW4gb2JqKXtpZihrZXlzLmluZGV4T2YoaSk+PTApY29udGludWU7aWYoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosaSkpY29udGludWU7dGFyZ2V0W2ldPW9ialtpXX1yZXR1cm4gdGFyZ2V0fTtiYWJlbEhlbHBlcnMuaGFzT3duPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7YmFiZWxIZWxwZXJzLnNsaWNlPUFycmF5LnByb3RvdHlwZS5zbGljZTtiYWJlbEhlbHBlcnMuYmluZD1GdW5jdGlvbi5wcm90b3R5cGUuYmluZDtiYWJlbEhlbHBlcnMuZGVmaW5lUHJvcGVydHk9ZnVuY3Rpb24ob2JqLGtleSx2YWx1ZSl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosa2V5LHt2YWx1ZTp2YWx1ZSxlbnVtZXJhYmxlOnRydWUsY29uZmlndXJhYmxlOnRydWUsd3JpdGFibGU6dHJ1ZX0pfTtiYWJlbEhlbHBlcnMuYXN5bmNUb0dlbmVyYXRvcj1mdW5jdGlvbihmbil7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGdlbj1mbi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXt2YXIgY2FsbE5leHQ9c3RlcC5iaW5kKG51bGwsXCJuZXh0XCIpO3ZhciBjYWxsVGhyb3c9c3RlcC5iaW5kKG51bGwsXCJ0aHJvd1wiKTtmdW5jdGlvbiBzdGVwKGtleSxhcmcpe3RyeXt2YXIgaW5mbz1nZW5ba2V5XShhcmcpO3ZhciB2YWx1ZT1pbmZvLnZhbHVlfWNhdGNoKGVycm9yKXtyZWplY3QoZXJyb3IpO3JldHVybn1pZihpbmZvLmRvbmUpe3Jlc29sdmUodmFsdWUpfWVsc2V7UHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGNhbGxOZXh0LGNhbGxUaHJvdyl9fWNhbGxOZXh0KCl9KX19O2JhYmVsSGVscGVycy5pbnRlcm9wUmVxdWlyZVdpbGRjYXJkPWZ1bmN0aW9uKG9iail7cmV0dXJuIG9iaiYmb2JqLl9fZXNNb2R1bGU/b2JqOntcImRlZmF1bHRcIjpvYmp9fTtiYWJlbEhlbHBlcnMuX3R5cGVvZj1mdW5jdGlvbihvYmope3JldHVybiBvYmomJm9iai5jb25zdHJ1Y3Rvcj09PVN5bWJvbD9cInN5bWJvbFwiOnR5cGVvZiBvYmp9O2JhYmVsSGVscGVycy5fZXh0ZW5kcz1PYmplY3QuYXNzaWdufHxmdW5jdGlvbih0YXJnZXQpe2Zvcih2YXIgaT0xO2k8YXJndW1lbnRzLmxlbmd0aDtpKyspe3ZhciBzb3VyY2U9YXJndW1lbnRzW2ldO2Zvcih2YXIga2V5IGluIHNvdXJjZSl7aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSxrZXkpKXt0YXJnZXRba2V5XT1zb3VyY2Vba2V5XX19fXJldHVybiB0YXJnZXR9O2JhYmVsSGVscGVycy5nZXQ9ZnVuY3Rpb24gZ2V0KG9iamVjdCxwcm9wZXJ0eSxyZWNlaXZlcil7dmFyIGRlc2M9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QscHJvcGVydHkpO2lmKGRlc2M9PT11bmRlZmluZWQpe3ZhciBwYXJlbnQ9T2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7aWYocGFyZW50PT09bnVsbCl7cmV0dXJuIHVuZGVmaW5lZH1lbHNle3JldHVybiBnZXQocGFyZW50LHByb3BlcnR5LHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZX1lbHNle3ZhciBnZXR0ZXI9ZGVzYy5nZXQ7aWYoZ2V0dGVyPT09dW5kZWZpbmVkKXtyZXR1cm4gdW5kZWZpbmVkfXJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcil9fTtiYWJlbEhlbHBlcnMuc2V0PWZ1bmN0aW9uIHNldChvYmplY3QscHJvcGVydHksdmFsdWUscmVjZWl2ZXIpe3ZhciBkZXNjPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LHByb3BlcnR5KTtpZihkZXNjPT09dW5kZWZpbmVkKXt2YXIgcGFyZW50PU9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO2lmKHBhcmVudCE9PW51bGwpe3JldHVybiBzZXQocGFyZW50LHByb3BlcnR5LHZhbHVlLHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZT12YWx1ZX1lbHNle3ZhciBzZXR0ZXI9ZGVzYy5zZXQ7aWYoc2V0dGVyIT09dW5kZWZpbmVkKXtyZXR1cm4gc2V0dGVyLmNhbGwocmVjZWl2ZXIsdmFsdWUpfX19O2JhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjaz1mdW5jdGlvbihpbnN0YW5jZSxDb25zdHJ1Y3Rvcil7aWYoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX19O2JhYmVsSGVscGVycy5vYmplY3REZXN0cnVjdHVyaW5nRW1wdHk9ZnVuY3Rpb24ob2JqKXtpZihvYmo9PW51bGwpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBkZXN0cnVjdHVyZSB1bmRlZmluZWRcIil9O2JhYmVsSGVscGVycy50ZW1wb3JhbFVuZGVmaW5lZD17fTtiYWJlbEhlbHBlcnMudGVtcG9yYWxBc3NlcnREZWZpbmVkPWZ1bmN0aW9uKHZhbCxuYW1lLHVuZGVmKXtpZih2YWw9PT11bmRlZil7dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG5hbWUrXCIgaXMgbm90IGRlZmluZWQgLSB0ZW1wb3JhbCBkZWFkIHpvbmVcIil9cmV0dXJuIHRydWV9O2JhYmVsSGVscGVycy5zZWxmR2xvYmFsPXR5cGVvZiBnbG9iYWw9PT1cInVuZGVmaW5lZFwiP3NlbGY6Z2xvYmFsfSkodHlwZW9mIGdsb2JhbD09PVwidW5kZWZpbmVkXCI/c2VsZjpnbG9iYWwpO1xufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbmxldCB0YXNrc1N1YlVSTCA9ICcnO1xyXG4vLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xNyZzaXRla2V5PTJiMDBkYTQ2YjU3YzAzOTVcclxuaWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlICYmIHBhcmFtcy5zaXRla2V5KSB7XHJcbiAgICB0YXNrc1N1YlVSTCA9ICcvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGUgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcclxufVxyXG5leHBvcnQgdmFyIHRhc2tzVVJMID0gJ2FwaS90YXNrcy8nICsgdGFza3NTdWJVUkw7XHJcblxyXG5cclxubGV0IGNvbmZpZ1N1YlVSTCA9ICcnO1xyXG5pZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluZGV4T2YoJ2xvY2FsaG9zdCcpID09PSAtMSkge1xyXG4gICAgY29uZmlnU3ViVVJMID0gJy93YnMvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnNpdGVrZXk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgY29uZmlnVVJMID0gJy9hcGkvR2FudHRDb25maWcnICsgY29uZmlnU3ViVVJMO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZXNvdXJjZVJlZmVyZW5jZU1vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Jlc291cmNlUmVmZXJlbmNlJyk7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XG5cbnZhciBDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgIHVybCA6ICdhcGkvcmVzb3VyY2VzLycgKyAocGFyYW1zLnByb2plY3QgfHwgMSkgKyAnLycgKyAocGFyYW1zLnByb2ZpbGUgfHwgMSksXG5cdG1vZGVsOiBSZXNvdXJjZVJlZmVyZW5jZU1vZGVsLFxuICAgIGlkQXR0cmlidXRlIDogJ0lEJyxcbiAgICB1cGRhdGVSZXNvdXJjZXNGb3JUYXNrIDogZnVuY3Rpb24odGFzaykge1xuICAgICAgICAvLyByZW1vdmUgb2xkIHJlZmVyZW5jZXNcbiAgICAgICAgdGhpcy50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihyZWYpIHtcbiAgICAgICAgICAgIGlmIChyZWYuZ2V0KCdXQlNJRCcpLnRvU3RyaW5nKCkgIT09IHRhc2suaWQudG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpc09sZCA9IHRhc2suZ2V0KCdyZXNvdXJjZXMnKS5pbmRleE9mKHJlZi5nZXQoJ1Jlc0lEJykpO1xuICAgICAgICAgICAgaWYgKGlzT2xkKSB7XG4gICAgICAgICAgICAgICAgcmVmLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIC8vIGFkZCBuZXcgcmVmZXJlbmNlc1xuICAgICAgICB0YXNrLmdldCgncmVzb3VyY2VzJykuZm9yRWFjaChmdW5jdGlvbihyZXNJZCkge1xuICAgICAgICAgICAgdmFyIGlzRXhpc3QgPSB0aGlzLmZpbmRXaGVyZSh7UmVzSUQgOiByZXNJZH0pO1xuICAgICAgICAgICAgaWYgKCFpc0V4aXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQoe1xuICAgICAgICAgICAgICAgICAgICBSZXNJRCA6IHJlc0lkLFxuICAgICAgICAgICAgICAgICAgICBXQlNJRCA6IHRhc2suaWQudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIHBhcnNlIDogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciByZXN1bHQgID0gW107XG4gICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0uUmVzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24ocmVzSXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSByZXNJdGVtO1xuICAgICAgICAgICAgICAgIG9iai5XQlNJRCA9IGl0ZW0uV0JTSUQ7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gob2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uO1xuXG4iLCJ2YXIgVGFza01vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Rhc2tNb2RlbCcpO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdHVybDogJ2FwaS90YXNrcycsXG5cdG1vZGVsOiBUYXNrTW9kZWwsXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5zdWJzY3JpYmUoKTtcblx0fSxcblx0Y29tcGFyYXRvcjogZnVuY3Rpb24obW9kZWwpIHtcblx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0bGlua0NoaWxkcmVuOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGFyZW50VGFzayA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChwYXJlbnRUYXNrKSB7XG5cdFx0XHRcdGlmIChwYXJlbnRUYXNrID09PSB0YXNrKSB7XG5cdFx0XHRcdFx0dGFzay5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGFyZW50VGFzay5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3Rhc2sgaGFzIHBhcmVudCB3aXRoIGlkICcgKyB0YXNrLmdldCgncGFyZW50aWQnKSArICcgLSBidXQgdGhlcmUgaXMgbm8gc3VjaCB0YXNrJyk7XG5cdFx0XHRcdHRhc2sudW5zZXQoJ3BhcmVudGlkJyk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0X3NvcnRDaGlsZHJlbjogZnVuY3Rpb24gKHRhc2ssIHNvcnRJbmRleCkge1xuXHRcdHRhc2suY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKGNoaWxkLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IC0xO1xuXHRcdHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRhc2suc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4odGFzaywgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRfcmVzb3J0Q2hpbGRyZW46IGZ1bmN0aW9uKGRhdGEsIHN0YXJ0SW5kZXgsIHBhcmVudElEKSB7XG5cdFx0dmFyIHNvcnRJbmRleCA9IHN0YXJ0SW5kZXg7XG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2tEYXRhKSB7XG5cdFx0XHR2YXIgdGFzayA9IHRoaXMuZ2V0KHRhc2tEYXRhLmlkKTtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSAhPT0gcGFyZW50SUQpIHtcblx0XHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHBhcmVudElEKTtcblx0XHRcdFx0aWYgKG5ld1BhcmVudCkge1xuXHRcdFx0XHRcdG5ld1BhcmVudC5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRhc2suc2F2ZSh7XG5cdFx0XHRcdHNvcnRpbmRleDogKytzb3J0SW5kZXgsXG5cdFx0XHRcdHBhcmVudGlkOiBwYXJlbnRJRFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAodGFza0RhdGEuY2hpbGRyZW4gJiYgdGFza0RhdGEuY2hpbGRyZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3Jlc29ydENoaWxkcmVuKHRhc2tEYXRhLmNoaWxkcmVuLCBzb3J0SW5kZXgsIHRhc2suaWQpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0cmVzb3J0OiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHRoaXMuX3Jlc29ydENoaWxkcmVuKGRhdGEsIC0xLCAwKTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRzdWJzY3JpYmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsICgpID0+IHtcbiAgICAgICAgICAgIC8vIGFkZCBlbXB0eSB0YXNrIGlmIG5vIHRhc2tzIGZyb20gc2VydmVyXG4gICAgICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KFt7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdOZXcgdGFzaydcbiAgICAgICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcywgJ2FkZCcsIGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHZhciBwYXJlbnQgPSB0aGlzLmZpbmQoZnVuY3Rpb24obSkge1xuXHRcdFx0XHRcdHJldHVybiBtLmlkID09PSBtb2RlbC5nZXQoJ3BhcmVudGlkJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRcdFx0cGFyZW50LmNoaWxkcmVuLmFkZChtb2RlbCk7XG5cdFx0XHRcdFx0bW9kZWwucGFyZW50ID0gcGFyZW50O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybignY2FuIG5vdCBmaW5kIHBhcmVudCB3aXRoIGlkICcgKyBtb2RlbC5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0XHRcdG1vZGVsLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcywgJ3Jlc2V0JywgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmxpbmtDaGlsZHJlbigpO1xuXHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR0aGlzLl9jaGVja0RlcGVuZGVuY2llcygpO1xuXHRcdH0pO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLnBhcmVudCkge1xuXHRcdFx0XHR0YXNrLnBhcmVudC5jaGlsZHJlbi5yZW1vdmUodGFzayk7XG5cdFx0XHRcdHRhc2sucGFyZW50ID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbmV3UGFyZW50ID0gdGhpcy5nZXQodGFzay5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0aWYgKG5ld1BhcmVudCkge1xuXHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0aGlzLl9wcmV2ZW50U29ydGluZykge1xuXHRcdFx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0Y3JlYXRlRGVwZW5kZW5jeTogZnVuY3Rpb24gKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKHRoaXMuX2NhbkNyZWF0ZURlcGVuZGVuY2UoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpKSB7XG5cdFx0XHRhZnRlck1vZGVsLmRlcGVuZE9uKGJlZm9yZU1vZGVsKTtcblx0XHR9XG5cdH0sXG5cblx0X2NhbkNyZWF0ZURlcGVuZGVuY2U6IGZ1bmN0aW9uKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKGJlZm9yZU1vZGVsLmhhc1BhcmVudChhZnRlck1vZGVsKSB8fCBhZnRlck1vZGVsLmhhc1BhcmVudChiZWZvcmVNb2RlbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGJlZm9yZU1vZGVsLmhhc0luRGVwcyhhZnRlck1vZGVsKSB8fFxuXHRcdFx0YWZ0ZXJNb2RlbC5oYXNJbkRlcHMoYmVmb3JlTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRyZW1vdmVEZXBlbmRlbmN5OiBmdW5jdGlvbihhZnRlck1vZGVsKSB7XG5cdFx0YWZ0ZXJNb2RlbC5jbGVhckRlcGVuZGVuY2UoKTtcblx0fSxcblx0X2NoZWNrRGVwZW5kZW5jaWVzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goKHRhc2spID0+IHtcblx0XHRcdHZhciBpZHMgPSB0YXNrLmdldCgnZGVwZW5kJykuY29uY2F0KFtdKTtcblx0XHRcdHZhciBoYXNHb29kRGVwZW5kcyA9IGZhbHNlO1xuXHRcdFx0aWYgKGlkcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRfLmVhY2goaWRzLCAoaWQpID0+IHtcblx0XHRcdFx0dmFyIGJlZm9yZU1vZGVsID0gdGhpcy5nZXQoaWQpO1xuXHRcdFx0XHRpZiAoYmVmb3JlTW9kZWwpIHtcblx0XHRcdFx0XHR0YXNrLmRlcGVuZE9uKGJlZm9yZU1vZGVsLCB0cnVlKTtcblx0XHRcdFx0XHRoYXNHb29kRGVwZW5kcyA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFoYXNHb29kRGVwZW5kcykge1xuXHRcdFx0XHR0YXNrLnNhdmUoJ2RlcGVuZCcsIFtdKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0b3V0ZGVudDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciB1bmRlclN1YmxpbmdzID0gW107XG5cdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHR0YXNrLnBhcmVudC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGlmIChjaGlsZC5nZXQoJ3NvcnRpbmRleCcpIDw9IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmRlclN1YmxpbmdzLnB1c2goY2hpbGQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHVuZGVyU3VibGluZ3MuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICAgICAgaWYgKGNoaWxkLmRlcGVuZHMuZ2V0KHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuY2xlYXJEZXBlbmRlbmNlKCk7XG4gICAgICAgICAgICB9XG5cdFx0XHRjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHRhc2suaWQpO1xuXHRcdH0pO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0aWYgKHRhc2sucGFyZW50ICYmIHRhc2sucGFyZW50LnBhcmVudCkge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHRhc2sucGFyZW50LnBhcmVudC5pZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCAwKTtcblx0XHR9XG5cdH0sXG5cdGluZGVudDogZnVuY3Rpb24odGFzaykge1xuXHRcdHZhciBwcmV2VGFzaywgaSwgbTtcblx0XHRmb3IgKGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRtID0gdGhpcy5hdChpKTtcblx0XHRcdGlmICgobS5nZXQoJ3NvcnRpbmRleCcpIDwgdGFzay5nZXQoJ3NvcnRpbmRleCcpKSAmJiAodGFzay5wYXJlbnQgPT09IG0ucGFyZW50KSkge1xuXHRcdFx0XHRwcmV2VGFzayA9IG07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAocHJldlRhc2spIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCBwcmV2VGFzay5pZCk7XG5cdFx0fVxuXHR9LFxuICAgIGltcG9ydFRhc2tzOiBmdW5jdGlvbih0YXNrSlNPTmFycmF5LCBjYWxsYmFjaykge1xuXHRcdHZhciBzb3J0aW5kZXggPSAwO1xuXHRcdGlmICh0aGlzLmxhc3QoKSkge1xuXHRcdFx0c29ydGluZGV4ID0gdGhpcy5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHR9XG4gICAgICAgIHRhc2tKU09OYXJyYXkuZm9yRWFjaChmdW5jdGlvbih0YXNrSXRlbSkge1xuICAgICAgICAgICAgdGFza0l0ZW0uc29ydGluZGV4ID0gKytzb3J0aW5kZXg7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgbGVuZ3RoID0gdGFza0pTT05hcnJheS5sZW5ndGg7XG4gICAgICAgIHZhciBkb25lID0gMDtcbiAgICAgICAgdGhpcy5hZGQodGFza0pTT05hcnJheSwge3BhcnNlOiB0cnVlfSkuZm9yRWFjaChmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICB0YXNrLnNhdmUoe30sIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9uZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9uZSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlRGVwczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcbiAgICAgICAgZGF0YS5wYXJlbnRzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnBhcmVudC5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBpdGVtLnBhcmVudC5vdXRsaW5lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLmNoaWxkLm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGl0ZW0uY2hpbGQub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHBhcmVudC5pZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cblx0XHRkYXRhLmRlcHMuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBkZXAuYmVmb3JlLm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGRlcC5iZWZvcmUub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBkZXAuYWZ0ZXIubmFtZSxcblx0XHRcdFx0b3V0bGluZTogZGVwLmFmdGVyLm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVEZXBlbmRlbmN5KGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tDb2xsZWN0aW9uO1xuIiwicmVxdWlyZSgnYmFiZWwvZXh0ZXJuYWwtaGVscGVycycpO1xuXG5pbXBvcnQgVGFza0NvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9ucy9UYXNrQ29sbGVjdGlvbic7XG5pbXBvcnQgU2V0dGluZ3MgZnJvbSAnLi9tb2RlbHMvU2V0dGluZ01vZGVsJztcblxuaW1wb3J0IEdhbnR0VmlldyBmcm9tICcuL3ZpZXdzL0dhbnR0Vmlldyc7XG5pbXBvcnQge3Rhc2tzVVJMLCBjb25maWdVUkx9IGZyb20gJy4vY2xpZW50Q29uZmlnJztcblxuXG5mdW5jdGlvbiBsb2FkVGFza3ModGFza3MpIHtcbiAgICB2YXIgZGZkID0gbmV3ICQuRGVmZXJyZWQoKTtcblx0dGFza3MuZmV0Y2goe1xuXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGZkLnJlc29sdmUoKTtcblx0XHR9LFxuXHRcdGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGRmZC5yZWplY3QoZXJyKTtcblx0XHR9LFxuXHRcdHBhcnNlOiB0cnVlLFxuXHRcdHJlc2V0OiB0cnVlXG5cdH0pO1xuICAgIHJldHVybiBkZmQucHJvbWlzZSgpO1xufVxuXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICByZXR1cm4gJC5nZXRKU09OKGNvbmZpZ1VSTClcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHNldHRpbmdzLnN0YXR1c2VzID0gZGF0YTtcbiAgICAgICAgfSk7XG59XG5cblxuJCgoKSA9PiB7XG5cdGxldCB0YXNrcyA9IG5ldyBUYXNrQ29sbGVjdGlvbigpO1xuICAgIHRhc2tzLnVybCA9IHRhc2tzVVJMO1xuICAgIGxldCBzZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyh7fSwge3Rhc2tzOiB0YXNrc30pO1xuXG4gICAgd2luZG93LnRhc2tzID0gdGFza3M7XG5cbiAgICAkLndoZW4obG9hZFRhc2tzKHRhc2tzKSlcbiAgICAudGhlbigoKSA9PiBsb2FkU2V0dGluZ3Moc2V0dGluZ3MpKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1N1Y2Nlc3MgbG9hZGluZyB0YXNrcy4nKTtcbiAgICAgICAgbmV3IEdhbnR0Vmlldyh7XG4gICAgICAgICAgICBzZXR0aW5nczogc2V0dGluZ3MsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiB0YXNrc1xuICAgICAgICB9KS5yZW5kZXIoKTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcblxuXG5cbiAgICAgICAgLy8gaGlkZSBsb2FkaW5nXG4gICAgICAgICQoJyNsb2FkZXInKS5mYWRlT3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBkaXNwbGF5IGhlYWQgYWx3YXlzIG9uIHRvcFxuICAgICAgICAgICAgJCgnI2hlYWQnKS5jc3Moe1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZW5hYmxlIHNjcm9sbGluZ1xuICAgICAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdob2xkLXNjcm9sbCcpO1xuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nJywgZXJyb3IpO1xuICAgIH0pO1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBSZXNvdXJjZVJlZmVyZW5jZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcbiAgICBkZWZhdWx0czoge1xyXG4gICAgICAgIC8vIG1haW4gcGFyYW1zXHJcbiAgICAgICAgV0JTSUQgOiAxLCAvLyB0YXNrIGlkXHJcbiAgICAgICAgUmVzSUQ6IDEsIC8vIHJlc291cmNlIGlkXHJcbiAgICAgICAgVFNBY3RpdmF0ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gc29tZSBzZXJ2ZXIgcGFyYW1zXHJcbiAgICAgICAgV0JTUHJvZmlsZUlEIDogcGFyYW1zLnByb2ZpbGUsXHJcbiAgICAgICAgV0JTX0lEIDogcGFyYW1zLnByb2ZpbGUsXHJcbiAgICAgICAgUGFydGl0Tm8gOiAnMmIwMGRhNDZiNTdjMDM5NScsIC8vIGhhdmUgbm8gaWRlYSB3aGF0IGlzIHRoYXRcclxuICAgICAgICBQcm9qZWN0UmVmIDogcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgc2l0ZWtleTogcGFyYW1zLnNpdGVrZXlcclxuXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc291cmNlUmVmZXJlbmNlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG5cclxudmFyIFNldHRpbmdNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0ZGVmYXVsdHM6IHtcclxuXHRcdGludGVydmFsOiAnZGFpbHknLFxyXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxyXG5cdFx0ZHBpOiAxXHJcblx0fSxcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycywgcGFyYW1zKSB7XHJcblx0XHR0aGlzLnN0YXR1c2VzID0gdW5kZWZpbmVkO1xyXG5cdFx0dGhpcy5zYXR0ciA9IHtcclxuXHRcdFx0aERhdGE6IHt9LFxyXG5cdFx0XHRkcmFnSW50ZXJ2YWw6IDEsXHJcblx0XHRcdGRheXNXaWR0aDogNSxcclxuXHRcdFx0Y2VsbFdpZHRoOiAzNSxcclxuXHRcdFx0bWluRGF0ZTogbmV3IERhdGUoMjAyMCwxLDEpLFxyXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXHJcblx0XHRcdGJvdW5kYXJ5TWluOiBuZXcgRGF0ZSgwLDAsMCksXHJcblx0XHRcdGJvdW5kYXJ5TWF4OiBuZXcgRGF0ZSgyMDIwLDEsMSksXHJcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXHJcblx0XHRcdG1wYzogMVxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLnNkaXNwbGF5ID0ge1xyXG5cdFx0XHRzY3JlZW5XaWR0aDogICQoJyNnYW50dC1jb250YWluZXInKS5pbm5lcldpZHRoKCkgKyA3ODYsXHJcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxyXG5cdFx0XHR0YWJsZVdpZHRoOiA3MTBcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5jb2xsZWN0aW9uID0gcGFyYW1zLnRhc2tzO1xyXG5cdFx0dGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMoKTtcclxuXHRcdHRoaXMub24oJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkIGNoYW5nZTplbmQnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZTp3aWR0aCcpO1xyXG4gICAgICAgIH0sIDUwMCkpO1xyXG5cdH0sXHJcblx0Z2V0U2V0dGluZzogZnVuY3Rpb24oZnJvbSwgYXR0cil7XHJcblx0XHRpZihhdHRyKXtcclxuXHRcdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV1bYXR0cl07XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXTtcclxuXHR9LFxyXG5cdGZpbmRTdGF0dXNJZCA6IGZ1bmN0aW9uKHN0YXR1cykge1xyXG5cdFx0Zm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG5cdFx0XHRpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuXHRcdFx0XHRcdGlmIChzdGF0dXNJdGVtLmNmZ19pdGVtLnRvTG93ZXJDYXNlKCkgPT09IHN0YXR1cy50b0xvd2VyQ2FzZSgpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcbiAgICBmaW5kU3RhdHVzRm9ySWQgOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uSUQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSBpZC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGZpbmREZWZhdWx0U3RhdHVzSWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblx0ZmluZEhlYWx0aElkIDogZnVuY3Rpb24oaGVhbHRoKSB7XHJcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gaGVhbHRoLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmRIZWFsdGhGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRIZWFsdGhJZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHRmaW5kV09JZCA6IGZ1bmN0aW9uKHdvKSB7XHJcblx0XHRmb3IodmFyIGkgaW4gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLldPTnVtYmVyLnRvTG93ZXJDYXNlKCkgPT09IHdvLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLklEO1xyXG4gICAgICAgICAgICB9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmRXT0ZvcklkIDogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLklELnRvU3RyaW5nKCkgPT09IGlkLnRvU3RyaW5nKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLldPTnVtYmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGZpbmREZWZhdWx0V09JZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhWzBdLklEO1xyXG4gICAgfSxcclxuICAgIGdldERhdGVGb3JtYXQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJ2RkL21tL3l5JztcclxuICAgIH0sXHJcblx0Y2FsY21pbm1heDogZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgbWluRGF0ZSA9IG5ldyBEYXRlKCksIG1heERhdGUgPSBtaW5EYXRlLmNsb25lKCkuYWRkWWVhcnMoMSk7XHJcblxyXG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcclxuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0bWluRGF0ZT1tb2RlbC5nZXQoJ3N0YXJ0Jyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XHJcblx0XHRcdFx0bWF4RGF0ZT1tb2RlbC5nZXQoJ2VuZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuc2F0dHIubWluRGF0ZSA9IG1pbkRhdGU7XHJcblx0XHR0aGlzLnNhdHRyLm1heERhdGUgPSBtYXhEYXRlO1xyXG5cdH0sXHJcblx0c2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZW5kLHNhdHRyPXRoaXMuc2F0dHIsZGF0dHI9dGhpcy5zZGlzcGxheSxkdXJhdGlvbixzaXplLGNlbGxXaWR0aCxkcGkscmV0ZnVuYyxzdGFydCxsYXN0LGk9MCxqPTAsaUxlbj0wLG5leHQ9bnVsbDtcclxuXHJcblx0XHR2YXIgaW50ZXJ2YWwgPSB0aGlzLmdldCgnaW50ZXJ2YWwnKTtcclxuXHJcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdkYWlseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDEsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoNjApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxNTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7XHJcblx0XHRcdH07XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblxyXG5cdFx0fSBlbHNlIGlmKGludGVydmFsID09PSAnd2Vla2x5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgNywge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDcpO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApLm1vdmVUb0RheU9mV2VlaygxLCAtMSk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDU7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aCAqIDc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyg3KTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMTIgKiAzMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDI7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gNyAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogMzApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbi5tb3ZlVG9GaXJzdERheU9mUXVhcnRlcigpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAxO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDMwICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAzO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMyk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnZml4Jykge1xyXG5cdFx0XHRjZWxsV2lkdGggPSAzMDtcclxuXHRcdFx0ZHVyYXRpb24gPSBEYXRlLmRheXNkaWZmKHNhdHRyLm1pbkRhdGUsIHNhdHRyLm1heERhdGUpO1xyXG5cdFx0XHRzaXplID0gZGF0dHIuc2NyZWVuV2lkdGggLSBkYXR0ci50SGlkZGVuV2lkdGggLSAxMDA7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNpemUgLyBkdXJhdGlvbjtcclxuXHRcdFx0ZHBpID0gTWF0aC5yb3VuZChjZWxsV2lkdGggLyBzYXR0ci5kYXlzV2lkdGgpO1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgZHBpLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IGRwaSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMiAqIGRwaSk7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMzAgKiAxMCk7XHJcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbD09PSdhdXRvJykge1xyXG5cdFx0XHRkcGkgPSB0aGlzLmdldCgnZHBpJyk7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICgxICsgTWF0aC5sb2coZHBpKSkgKiAxMjtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2F0dHIuY2VsbFdpZHRoIC8gZHBpO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yMCAqIGRwaSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDMwICogMTApO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XHJcblx0XHRcdH07XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IE1hdGgucm91bmQoMC4zICogZHBpKSAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdH1cclxuXHRcdHZhciBoRGF0YSA9IHtcclxuXHRcdFx0JzEnOiBbXSxcclxuXHRcdFx0JzInOiBbXSxcclxuXHRcdFx0JzMnOiBbXVxyXG5cdFx0fTtcclxuXHRcdHZhciBoZGF0YTMgPSBbXTtcclxuXHJcblx0XHRzdGFydCA9IHNhdHRyLmJvdW5kYXJ5TWluO1xyXG5cclxuXHRcdGxhc3QgPSBzdGFydDtcclxuXHRcdGlmIChpbnRlcnZhbCA9PT0gJ21vbnRobHknIHx8IGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xyXG5cdFx0XHR2YXIgZHVyZnVuYztcclxuXHRcdFx0aWYgKGludGVydmFsPT09J21vbnRobHknKSB7XHJcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZHVyZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBEYXRlLmdldERheXNJblF1YXJ0ZXIoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldFF1YXJ0ZXIoKSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdGhkYXRhMy5wdXNoKHtcclxuXHRcdFx0XHRcdFx0ZHVyYXRpb246IGR1cmZ1bmMobGFzdCksXHJcblx0XHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xyXG5cdFx0XHRcdFx0bGFzdCA9IG5leHQ7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciBpbnRlcnZhbGRheXMgPSB0aGlzLmdldCgnZHBpJyk7XHJcblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzSG9seSA9IGxhc3QuZ2V0RGF5KCkgPT09IDYgfHwgbGFzdC5nZXREYXkoKSA9PT0gMDtcclxuXHRcdFx0XHRoZGF0YTMucHVzaCh7XHJcblx0XHRcdFx0XHRkdXJhdGlvbjogaW50ZXJ2YWxkYXlzLFxyXG5cdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgaG9seSA6IChpbnRlcnZhbCA9PT0gJ2RhaWx5JykgJiYgaXNIb2x5XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XHJcblx0XHRcdFx0bGFzdCA9IG5leHQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHNhdHRyLmJvdW5kYXJ5TWF4ID0gZW5kID0gbGFzdDtcclxuXHRcdGhEYXRhWyczJ10gPSBoZGF0YTM7XHJcblxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBkYXRlIHRvIGVuZCBvZiB5ZWFyXHJcblx0XHR2YXIgaW50ZXIgPSBEYXRlLmRheXNkaWZmKHN0YXJ0LCBuZXcgRGF0ZShzdGFydC5nZXRGdWxsWWVhcigpLCAxMSwgMzEpKTtcclxuXHRcdGhEYXRhWycxJ10ucHVzaCh7XHJcblx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0dGV4dDogc3RhcnQuZ2V0RnVsbFllYXIoKVxyXG5cdFx0fSk7XHJcblx0XHRmb3IoaSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCkgKyAxLCBpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7IGkgPCBpTGVuOyBpKyspe1xyXG5cdFx0XHRpbnRlciA9IERhdGUuaXNMZWFwWWVhcihpKSA/IDM2NiA6IDM2NTtcclxuXHRcdFx0aERhdGFbJzEnXS5wdXNoKHtcclxuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXHJcblx0XHRcdFx0dGV4dDogaVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgbGFzdCB5ZWFyIHVwdG8gZW5kIGRhdGVcclxuXHRcdGlmIChzdGFydC5nZXRGdWxsWWVhcigpIT09ZW5kLmdldEZ1bGxZZWFyKCkpIHtcclxuXHRcdFx0aW50ZXIgPSBEYXRlLmRheXNkaWZmKG5ldyBEYXRlKGVuZC5nZXRGdWxsWWVhcigpLCAwLCAxKSwgZW5kKTtcclxuXHRcdFx0aERhdGFbJzEnXS5wdXNoKHtcclxuXHRcdFx0XHRkdXJhdGlvbjogaW50ZXIsXHJcblx0XHRcdFx0dGV4dDogZW5kLmdldEZ1bGxZZWFyKClcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxyXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoc3RhcnQsIHN0YXJ0LmNsb25lKCkubW92ZVRvTGFzdERheU9mTW9udGgoKSksXHJcblx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCAnbScpXHJcblx0XHR9KTtcclxuXHJcblx0XHRqID0gc3RhcnQuZ2V0TW9udGgoKSArIDE7XHJcblx0XHRpID0gc3RhcnQuZ2V0RnVsbFllYXIoKTtcclxuXHRcdGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTtcclxuXHRcdHZhciBlbmRtb250aCA9IGVuZC5nZXRNb250aCgpO1xyXG5cclxuXHRcdHdoaWxlIChpIDw9IGlMZW4pIHtcclxuXHRcdFx0d2hpbGUoaiA8IDEyKSB7XHJcblx0XHRcdFx0aWYgKGkgPT09IGlMZW4gJiYgaiA9PT0gZW5kbW9udGgpIHtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRoRGF0YVsnMiddLnB1c2goe1xyXG5cdFx0XHRcdFx0ZHVyYXRpb246IERhdGUuZ2V0RGF5c0luTW9udGgoaSwgaiksXHJcblx0XHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoaiwgJ20nKVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGogKz0gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpICs9IDE7XHJcblx0XHRcdGogPSAwO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGVuZC5nZXRNb250aCgpICE9PSBzdGFydC5nZXRNb250aCgpICYmIGVuZC5nZXRGdWxsWWVhcigpICE9PSBzdGFydC5nZXRGdWxsWWVhcigpKSB7XHJcblx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XHJcblx0XHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoZW5kLmNsb25lKCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCksIGVuZCksXHJcblx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGVuZC5nZXRNb250aCgpLCAnbScpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0c2F0dHIuaERhdGEgPSBoRGF0YTtcclxuXHR9LFxyXG5cdGNhbGN1bGF0ZUludGVydmFsczogZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLmNhbGNtaW5tYXgoKTtcclxuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xyXG5cdH0sXHJcblx0Y29uRFRvVDooZnVuY3Rpb24oKXtcclxuXHRcdHZhciBkVG9UZXh0PXtcclxuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdlbmQnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0J2R1cmF0aW9uJzpmdW5jdGlvbih2YWx1ZSxtb2RlbCl7XHJcblx0XHRcdFx0cmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuc3RhcnQsbW9kZWwuZW5kKSsnIGQnO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnc3RhdHVzJzpmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0dmFyIHN0YXR1c2VzPXtcclxuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXHJcblx0XHRcdFx0XHQnMTA5Jzonb3BlbicsXHJcblx0XHRcdFx0XHQnMTA4JyA6ICdyZWFkeSdcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHJldHVybiBzdGF0dXNlc1t2YWx1ZV07XHJcblx0XHRcdH1cclxuXHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLHZhbHVlLG1vZGVsKXtcclxuXHRcdFx0cmV0dXJuIGRUb1RleHRbZmllbGRdP2RUb1RleHRbZmllbGRdKHZhbHVlLG1vZGVsKTp2YWx1ZTtcclxuXHRcdH07XHJcblx0fSgpKVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xyXG4iLCJ2YXIgUmVzQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL2NvbGxlY3Rpb25zL1Jlc291cmNlUmVmZXJlbmNlQ29sbGVjdGlvbicpO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIFN1YlRhc2tzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG4gICAgY29tcGFyYXRvcjogZnVuY3Rpb24obW9kZWwpIHtcclxuICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcclxuICAgIH1cclxufSk7XHJcblxyXG52YXIgcmVzTGlua3MgPSBuZXcgUmVzQ29sbGVjdGlvbigpO1xyXG5yZXNMaW5rcy5mZXRjaCgpO1xyXG5cclxudmFyIFRhc2tNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcbiAgICBkZWZhdWx0czoge1xyXG4gICAgICAgIC8vIE1BSU4gUEFSQU1TXHJcbiAgICAgICAgbmFtZTogJ05ldyB0YXNrJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgY29tcGxldGU6IDAsICAvLyAwJSAtIDEwMCUgcGVyY2VudHNcclxuICAgICAgICBzb3J0aW5kZXg6IDAsICAgLy8gcGxhY2Ugb24gc2lkZSBtZW51LCBzdGFydHMgZnJvbSAwXHJcbiAgICAgICAgZGVwZW5kOiBbXSwgIC8vIGlkIG9mIHRhc2tzXHJcbiAgICAgICAgc3RhdHVzOiAnMTEwJywgICAgICAvLyAxMTAgLSBjb21wbGV0ZSwgMTA5ICAtIG9wZW4sIDEwOCAtIHJlYWR5XHJcbiAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgZW5kOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIHBhcmVudGlkOiAwLFxyXG4gICAgICAgIENvbW1lbnRzOiAwLFxyXG5cclxuICAgICAgICBjb2xvcjogJyMwMDkwZDMnLCAgIC8vIHVzZXIgY29sb3IsIG5vdCB1c2VkIGZvciBub3dcclxuXHJcbiAgICAgICAgLy8gc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXNcclxuICAgICAgICByZXNvdXJjZXM6IFtdLCAgICAgICAgIC8vbGlzdCBvZiBpZFxyXG4gICAgICAgIGhlYWx0aDogMjEsXHJcbiAgICAgICAgcmVwb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgd286IDIsICAgICAgICAgICAgICAgICAgLy9TZWxlY3QgTGlzdCBpbiBwcm9wZXJ0aWVzIG1vZGFsICAgKGNvbmZpZ2RhdGEpXHJcbiAgICAgICAgbWlsZXN0b25lOiBmYWxzZSwgICAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBkZWxpdmVyYWJsZTogZmFsc2UsICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGZpbmFuY2lhbDogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgdGltZXNoZWV0czogZmFsc2UsICAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBhY3R0aW1lc2hlZXRzOiBmYWxzZSwgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG5cclxuICAgICAgICAvLyBzZXJ2ZXIgc3BlY2lmaWMgcGFyYW1zXHJcbiAgICAgICAgLy8gZG9uJ3QgdXNlIHRoZW0gb24gY2xpZW50IHNpZGVcclxuICAgICAgICBQcm9qZWN0UmVmOiBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICBXQlNfSUQ6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5LFxyXG5cclxuXHJcbiAgICAgICAgLy8gcGFyYW1zIGZvciBhcHBsaWNhdGlvbiB2aWV3c1xyXG4gICAgICAgIC8vIHNob3VsZCBiZSByZW1vdmVkIGZyb20gSlNPTlxyXG4gICAgICAgIGhpZGRlbjogZmFsc2UsXHJcbiAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcclxuICAgICAgICBoaWdodGxpZ2h0OiAnJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHNlbGYgdmFsaWRhdGlvblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpyZXNvdXJjZXMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmVzTGlua3MudXBkYXRlUmVzb3VyY2VzRm9yVGFzayh0aGlzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOm1pbGVzdG9uZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXQoJ21pbGVzdG9uZScpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldCgnc3RhcnQnLCBuZXcgRGF0ZSh0aGlzLmdldCgnZW5kJykpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGlsZHJlbiByZWZlcmVuY2VzXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBTdWJUYXNrcygpO1xyXG4gICAgICAgIHRoaXMuZGVwZW5kcyA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldCgnbWlsZXN0b25lJywgZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyByZW1vdmluZyByZWZzXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdldCgncGFyZW50aWQnKSA9PT0gdGhpcy5pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucmVtb3ZlKGNoaWxkKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkJywgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQucGFyZW50ID0gdGhpcztcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6c29ydGluZGV4JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUgY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hlY2tUaW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpjb2xsYXBzZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXQoJ2NvbGxhcHNlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hlY2tpbmcgbmVzdGVkIHN0YXRlXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZScsIHRoaXMuX2NoZWNrTmVzdGVkKTtcclxuXHJcbiAgICAgICAgLy8gdGltZSBjaGVja2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUgY2hhbmdlOmNvbXBsZXRlJywgdGhpcy5fY2hlY2tDb21wbGV0ZSk7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuRGVwZW5kc0NvbGxlY3Rpb24oKTtcclxuICAgIH0sXHJcbiAgICBpc05lc3RlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICB9LFxyXG4gICAgc2hvdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2hpZGRlbicsIGZhbHNlKTtcclxuICAgIH0sXHJcbiAgICBoaWRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICBjaGlsZC5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZGVwZW5kT246IGZ1bmN0aW9uKGJlZm9yZU1vZGVsLCBzaWxlbnQpIHtcclxuICAgICAgICB0aGlzLmRlcGVuZHMuYWRkKGJlZm9yZU1vZGVsLCB7c2lsZW50OiBzaWxlbnR9KTtcclxuICAgICAgICBpZiAodGhpcy5nZXQoJ3N0YXJ0JykgPCBiZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZVRvU3RhcnQoYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2lsZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoYXNJbkRlcHM6IGZ1bmN0aW9uIChtb2RlbCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuZGVwZW5kcy5nZXQobW9kZWwuaWQpO1xyXG4gICAgfSxcclxuICAgIHRvSlNPTjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGpzb24gPSBCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcyk7XHJcbiAgICAgICAgZGVsZXRlIGpzb24ucmVzb3VyY2VzO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmhpZGRlbjtcclxuICAgICAgICBkZWxldGUganNvbi5jb2xsYXBzZWQ7XHJcbiAgICAgICAgZGVsZXRlIGpzb24uaGlnaHRsaWdodDtcclxuICAgICAgICBqc29uLmRlcGVuZCA9IGpzb24uZGVwZW5kLmpvaW4oJywnKTtcclxuICAgICAgICByZXR1cm4ganNvbjtcclxuICAgIH0sXHJcbiAgICBoYXNQYXJlbnQ6IGZ1bmN0aW9uKHBhcmVudEZvckNoZWNrKSB7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xyXG4gICAgICAgIHdoaWxlKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFyZW50ID09PSBwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY2xlYXJEZXBlbmRlbmNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmRlcGVuZHMuZWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRlcGVuZHMucmVtb3ZlKG0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9saXN0ZW5EZXBlbmRzQ29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmRlcGVuZHMsICdyZW1vdmUgYWRkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBpZHMgPSB0aGlzLmRlcGVuZHMubWFwKChtKSA9PiBtLmlkKTtcclxuICAgICAgICAgICAgdGhpcy5zZXQoJ2RlcGVuZCcsIGlkcykuc2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuZGVwZW5kcywgJ2FkZCcsIGZ1bmN0aW9uKGJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi50cmlnZ2VyKCdkZXBlbmQ6YWRkJywgYmVmb3JlTW9kZWwsIHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuZGVwZW5kcywgJ3JlbW92ZScsIGZ1bmN0aW9uKGJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi50cmlnZ2VyKCdkZXBlbmQ6cmVtb3ZlJywgYmVmb3JlTW9kZWwsIHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuZGVwZW5kcywgJ2NoYW5nZTplbmQnLCBmdW5jdGlvbihiZWZvcmVNb2RlbCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQudW5kZXJNb3ZpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjaGVjayBpbmZpbml0ZSBkZXBlbmQgbG9vcFxyXG4gICAgICAgICAgICB2YXIgaW5EZXBzID0gW3RoaXNdO1xyXG4gICAgICAgICAgICB2YXIgaXNJbmZpbml0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tEZXBzKG1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1vZGVsLmRlcGVuZHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kZWwuZGVwZW5kcy5lYWNoKChtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluRGVwcy5pbmRleE9mKG0pID4gLTEgfHwgaXNJbmZpbml0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0luZmluaXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpbkRlcHMucHVzaChtKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja0RlcHMobSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjaGVja0RlcHModGhpcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNJbmZpbml0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdldCgnc3RhcnQnKSA8IGJlZm9yZU1vZGVsLmdldCgnZW5kJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvU3RhcnQoYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tOZXN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcignbmVzdGVkU3RhdGVDaGFuZ2UnLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBwYXJzZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICB2YXIgc3RhcnQsIGVuZDtcclxuICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLnN0YXJ0KSl7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2Uuc3RhcnQpLCAnZGQvTU0veXl5eScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2Uuc3RhcnQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc0RhdGUocmVzcG9uc2Uuc3RhcnQpKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gcmVzcG9uc2Uuc3RhcnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLmVuZCkpe1xyXG4gICAgICAgICAgICBlbmQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5lbmQpLCAnZGQvTU0veXl5eScpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLmVuZCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChfLmlzRGF0ZShyZXNwb25zZS5lbmQpKSB7XHJcbiAgICAgICAgICAgIGVuZCA9IHJlc3BvbnNlLmVuZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbmQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSBzdGFydCA8IGVuZCA/IHN0YXJ0IDogZW5kO1xyXG4gICAgICAgIHJlc3BvbnNlLmVuZCA9IHN0YXJ0IDwgZW5kID8gZW5kIDogc3RhcnQ7XHJcblxyXG4gICAgICAgIHJlc3BvbnNlLnBhcmVudGlkID0gcGFyc2VJbnQocmVzcG9uc2UucGFyZW50aWQgfHwgJzAnLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBudWxsIHBhcmFtc1xyXG4gICAgICAgIF8uZWFjaChyZXNwb25zZSwgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlc3BvbnNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIHJlc291cmNlcyBhcyBsaXN0IG9mIElEXHJcbiAgICAgICAgdmFyIGlkcyA9IFtdO1xyXG4gICAgICAgIChyZXNwb25zZS5SZXNvdXJjZXMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24ocmVzSW5mbykge1xyXG4gICAgICAgICAgICBpZHMucHVzaChyZXNJbmZvLlJlc0lEKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXNwb25zZS5SZXNvdXJjZXMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmVzcG9uc2UucmVzb3VyY2VzID0gaWRzO1xyXG4gICAgICAgIGlmIChyZXNwb25zZS5taWxlc3RvbmUpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSByZXNwb25zZS5lbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGRlcHMgZm9yIG5ldyBBUEkgKGFycmF5IG9mIGRlcHMpXHJcbiAgICAgICAgaWYgKF8uaXNOdW1iZXIocmVzcG9uc2UuZGVwZW5kKSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS5kZXBlbmQgPSBbcmVzcG9uc2UuZGVwZW5kXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKF8uaXNTdHJpbmcocmVzcG9uc2UuZGVwZW5kKSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS5kZXBlbmQgPSByZXNwb25zZS5kZXBlbmQuc3BsaXQoJywnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfSxcclxuICAgIF9jaGVja1RpbWU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnc3RhcnQnKTtcclxuICAgICAgICB2YXIgZW5kVGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdlbmQnKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhcnRUaW1lID0gY2hpbGQuZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcclxuICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUgPCBzdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGNoaWxkU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZSA+IGVuZFRpbWUpe1xyXG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IGNoaWxkRW5kVGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xyXG4gICAgfSxcclxuICAgIF9jaGVja0NvbXBsZXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29tcGxldGUgPSAwO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGUgKz0gY2hpbGQuZ2V0KCdjb21wbGV0ZScpIC8gbGVuZ3RoO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXQoJ2NvbXBsZXRlJywgTWF0aC5yb3VuZChjb21wbGV0ZSkpO1xyXG4gICAgfSxcclxuICAgIG1vdmVUb1N0YXJ0OiBmdW5jdGlvbihuZXdTdGFydCkge1xyXG4gICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgbmV3IHN0YXJ0IGlzIHRoZSBzYW1lIGFzIGN1cnJlbnRcclxuICAgICAgICBpZiAobmV3U3RhcnQudG9EYXRlU3RyaW5nKCkgPT09IHRoaXMuZ2V0KCdzdGFydCcpLnRvRGF0ZVN0cmluZygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBvZmZzZXRcclxuLy8gICAgICAgIHZhciBkYXlzRGlmZiA9IE1hdGguZmxvb3IoKG5ld1N0YXJ0LnRpbWUoKSAtIHRoaXMuZ2V0KCdzdGFydCcpLnRpbWUoKSkgLyAxMDAwIC8gNjAgLyA2MCAvIDI0KVxyXG4gICAgICAgIHZhciBkYXlzRGlmZiA9IERhdGUuZGF5c2RpZmYobmV3U3RhcnQsIHRoaXMuZ2V0KCdzdGFydCcpKSAtIDE7XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0IDwgdGhpcy5nZXQoJ3N0YXJ0JykpIHtcclxuICAgICAgICAgICAgZGF5c0RpZmYgKj0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGFuZ2UgZGF0ZXNcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydC5jbG9uZSgpLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5c0RpZmYpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZXMgZGF0ZXMgaW4gYWxsIGNoaWxkcmVuXHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXNEaWZmKTtcclxuICAgICAgICB0aGlzLnVuZGVyTW92aW5nID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDaGlsZHJlbjogZnVuY3Rpb24oZGF5cykge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5tb3ZlKGRheXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmVXaXRoQ2hpbGRyZW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2suc2F2ZVdpdGhDaGlsZHJlbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIG1vdmU6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMoZGF5cyksXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5nZXQoJ2VuZCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tNb2RlbDtcclxuIiwidmFyIG1vbnRoc0NvZGU9WydKYW4nLCdGZWInLCdNYXInLCdBcHInLCdNYXknLCdKdW4nLCdKdWwnLCdBdWcnLCdTZXAnLCdPY3QnLCdOb3YnLCdEZWMnXTtcblxubW9kdWxlLmV4cG9ydHMuY29ycmVjdGRhdGUgPSBmdW5jdGlvbihzdHIpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiBzdHI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mb3JtYXRkYXRhID0gZnVuY3Rpb24odmFsLCB0eXBlKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZiAodHlwZSA9PT0gJ20nKSB7XG5cdFx0cmV0dXJuIG1vbnRoc0NvZGVbdmFsXTtcblx0fVxuXHRyZXR1cm4gdmFsO1xufTtcblxubW9kdWxlLmV4cG9ydHMuaGZ1bmMgPSBmdW5jdGlvbihwb3MpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHJldHVybiB7XG5cdFx0eDogcG9zLngsXG5cdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHR9O1xufTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikge1xuXHR2YXIgcGFyYW1zID0ge307XG5cdHZhciBwcm1hcnIgPSBwcm1zdHIuc3BsaXQoJyYnKTtcblx0dmFyIGksIHRtcGFycjtcblx0Zm9yIChpID0gMDsgaSA8IHBybWFyci5sZW5ndGg7IGkrKykge1xuXHRcdHRtcGFyciA9IHBybWFycltpXS5zcGxpdCgnPScpO1xuXHRcdHBhcmFtc1t0bXBhcnJbMF1dID0gdG1wYXJyWzFdO1xuXHR9XG5cdHJldHVybiBwYXJhbXM7XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldFVSTFBhcmFtcyA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHR2YXIgcHJtc3RyID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSk7XG5cdHJldHVybiBwcm1zdHIgIT09IG51bGwgJiYgcHJtc3RyICE9PSAnJyA/IHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIDoge307XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XHJcbnZhciB4bWwgPSBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy94bWxUZW1wbGF0ZS54bWwnLCAndXRmOCcpO1xyXG52YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKHhtbCk7XHJcblxyXG5mdW5jdGlvbiBwYXJzZVhNTE9iaih4bWxTdHJpbmcpIHtcclxuICAgIHZhciBvYmogPSB4bWxUb0pTT04ucGFyc2VTdHJpbmcoeG1sU3RyaW5nKTtcclxuICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgdGFza3MucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWUgOiB4bWxJdGVtLk5hbWVbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIHN0YXJ0IDogeG1sSXRlbS5TdGFydFswXS5fdGV4dCxcclxuICAgICAgICAgICAgZW5kIDogeG1sSXRlbS5GaW5pc2hbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlIDogeG1sSXRlbS5QZXJjZW50Q29tcGxldGVbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIG91dGxpbmU6IHhtbEl0ZW0uT3V0bGluZU51bWJlclswXS5fdGV4dC50b1N0cmluZygpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0YXNrcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMucGFyc2VEZXBzRnJvbVhNTCA9IGZ1bmN0aW9uKHhtbFN0cmluZykge1xyXG4gICAgdmFyIG9iaiA9IHhtbFRvSlNPTi5wYXJzZVN0cmluZyh4bWxTdHJpbmcpO1xyXG4gICAgdmFyIHVpZHMgPSB7fTtcclxuICAgIHZhciBvdXRsaW5lcyA9IHt9O1xyXG4gICAgdmFyIGRlcHMgPSBbXTtcclxuICAgIHZhciBwYXJlbnRzID0gW107XHJcbiAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IHhtbEl0ZW0uTmFtZVswXS5fdGV4dC50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBvdXRsaW5lOiB4bWxJdGVtLk91dGxpbmVOdW1iZXJbMF0uX3RleHQudG9TdHJpbmcoKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdWlkc1t4bWxJdGVtLlVJRFswXS5fdGV4dF0gPSBpdGVtO1xyXG4gICAgICAgIG91dGxpbmVzW2l0ZW0ub3V0bGluZV0gPSBpdGVtO1xyXG4gICAgfSk7XHJcbiAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhc2sgPSB1aWRzW3htbEl0ZW0uVUlEWzBdLl90ZXh0XTtcclxuICAgICAgICAvLyB2YXIgbmFtZSA9IHhtbEl0ZW0uTmFtZVswXS5fdGV4dDtcclxuICAgICAgICB2YXIgb3V0bGluZSA9IHRhc2sub3V0bGluZTtcclxuXHJcbiAgICAgICAgaWYgKHhtbEl0ZW0uUHJlZGVjZXNzb3JMaW5rKSB7XHJcbiAgICAgICAgICAgIHhtbEl0ZW0uUHJlZGVjZXNzb3JMaW5rLmZvckVhY2goKGxpbmspID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmVVSUQgPSBsaW5rLlByZWRlY2Vzc29yVUlEWzBdLl90ZXh0O1xyXG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZSA9IHVpZHNbYmVmb3JlVUlEXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZXBzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGJlZm9yZTogYmVmb3JlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyOiB0YXNrXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmUuaW5kZXhPZignLicpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50T3V0bGluZSA9IG91dGxpbmUuc2xpY2UoMCxvdXRsaW5lLmxhc3RJbmRleE9mKCcuJykpO1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gb3V0bGluZXNbcGFyZW50T3V0bGluZV07XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdjYW4gbm90IGZpbmQgcGFyZW50Jyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhcmVudHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IHBhcmVudCxcclxuICAgICAgICAgICAgICAgIGNoaWxkOiB0YXNrXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkZXBzIDogZGVwcyxcclxuICAgICAgICBwYXJlbnRzIDogcGFyZW50c1xyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnBhcnNlWE1MT2JqID0gcGFyc2VYTUxPYmo7XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5KU09OVG9YTUwgPSBmdW5jdGlvbihqc29uKSB7XHJcbiAgICB2YXIgc3RhcnQgPSBqc29uWzBdLnN0YXJ0O1xyXG4gICAgdmFyIGVuZCA9IGpzb25bMF0uZW5kO1xyXG4gICAgdmFyIGRhdGEgPSBfLm1hcChqc29uLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID4gdGFzay5zdGFydCkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHRhc2suc3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlbmQgPCB0YXNrLmVuZCkge1xyXG4gICAgICAgICAgICBlbmQgPSB0YXNrLmVuZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWQ6IHRhc2suc29ydGluZGV4LFxyXG4gICAgICAgICAgICBuYW1lIDogdGFzay5uYW1lLFxyXG4gICAgICAgICAgICBzdGFydCA6IHRhc2suc3RhcnQuZm9ybWF0KCd5eXl5LW1tLWRkO2hoOm1tOnNzJykucmVwbGFjZSgnOycsICdUJyksXHJcbiAgICAgICAgICAgIGVuZCA6IHRhc2suZW5kLmZvcm1hdCgneXl5eS1tbS1kZDtoaDptbTpzcycpLnJlcGxhY2UoJzsnLCAnVCcpXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXBpbGVkKHtcclxuICAgICAgICB0YXNrcyA6IGRhdGEsXHJcbiAgICAgICAgY3VycmVudERhdGUgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgc3RhcnREYXRlIDogc3RhcnQsXHJcbiAgICAgICAgZmluaXNoRGF0ZSA6IGVuZFxyXG4gICAgfSk7XHJcbn07XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgQ29tbWVudHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3Rhc2tDb21tZW50c01vZGFsJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuX2ZpbGxEYXRhKCk7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRlbC5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkFwcHJvdmUnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkhpZGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkhpZGUnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25EZW55IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25EZW55Jyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG5cclxuICAgICAgICB2YXIgdXBkYXRlQ291bnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGNvdW50ID0gJChcIiN0YXNrQ29tbWVudHNcIikuY29tbWVudHMoXCJjb3VudFwiKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ0NvbW1lbnRzJywgY291bnQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuICAgICAgICB2YXIgY2FsbGJhY2sgPSB7XHJcbiAgICAgICAgICAgIGFmdGVyRGVsZXRlIDogdXBkYXRlQ291bnQsXHJcbiAgICAgICAgICAgIGFmdGVyQ29tbWVudEFkZCA6IHVwZGF0ZUNvdW50XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluZGV4T2YoJ2xvY2FsaG9zdCcpID09PSAtMSkge1xyXG4gICAgICAgICAgICAvLyBpbml0IGNvbW1lbnRzXHJcbiAgICAgICAgICAgICQoXCIjdGFza0NvbW1lbnRzXCIpLmNvbW1lbnRzKHtcclxuICAgICAgICAgICAgICAgIGdldENvbW1lbnRzVXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQgKyBcIi9cIiArIHBhcmFtcy5zaXRla2V5ICsgXCIvV0JTLzAwMFwiLFxyXG4gICAgICAgICAgICAgICAgcG9zdENvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCArIFwiL1wiICsgcGFyYW1zLnNpdGVrZXkgKyBcIi9XQlMvXCIgKyBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUNvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlBdmF0YXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgOiBjYWxsYmFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5jb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICBnZXRDb21tZW50c1VybDogXCIvYXBpL2NvbW1lbnQvXCIgKyB0aGlzLm1vZGVsLmlkLFxyXG4gICAgICAgICAgICAgICAgcG9zdENvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUNvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlBdmF0YXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgOiBjYWxsYmFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2ZpbGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlucHV0LnZhbCh2YWwpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29tbWVudHNWaWV3O1xyXG4iLCJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFNpZGVQYW5lbCA9IHJlcXVpcmUoJy4vc2lkZUJhci9TaWRlUGFuZWwnKTtcclxyXHJ2YXIgR2FudHRDaGFydFZpZXcgPSByZXF1aXJlKCcuL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3Jyk7XHJ2YXIgVG9wTWVudVZpZXcgPSByZXF1aXJlKCcuL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3Jyk7XHJccnZhciBOb3RpZmljYXRpb25zID0gcmVxdWlyZSgnLi9Ob3RpZmljYXRpb25zJyk7XHJcclxydmFyIEdhbnR0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcciAgICBlbDogJy5HYW50dCcsXHIgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHIgICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyICAgICAgICB9KS5yZW5kZXIoKTtcclxyICAgICAgICAvLyBuZXcgdGFzayBidXR0b25cciAgICAgICAgJCgnLm5ldy10YXNrJykuY2xpY2soZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB2YXIgbGFzdFRhc2sgPSBwYXJhbXMuY29sbGVjdGlvbi5sYXN0KCk7XHIgICAgICAgICAgICB2YXIgbGFzdEluZGV4ID0gLTE7XHIgICAgICAgICAgICBpZiAobGFzdFRhc2spIHtcciAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSBsYXN0VGFzay5nZXQoJ3NvcnRpbmRleCcpO1xyICAgICAgICAgICAgfVxyICAgICAgICAgICAgcGFyYW1zLmNvbGxlY3Rpb24uYWRkKHtcciAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyICAgICAgICAgICAgICAgIHNvcnRpbmRleDogbGFzdEluZGV4ICsgMVxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIG5ldyBOb3RpZmljYXRpb25zKHtcciAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KTtcclxyXHJcclxyICAgICAgICBuZXcgVG9wTWVudVZpZXcoe1xyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEdhbnR0Q2hhcnRWaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcucmVuZGVyKCk7XHIgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcciAgICAgICAgICAgIC8vIHNldCBzaWRlIHRhc2tzIHBhbmVsIGhlaWdodFxyICAgICAgICAgICAgdmFyICRzaWRlUGFuZWwgPSAkKCcubWVudS1jb250YWluZXInKTtcciAgICAgICAgICAgICRzaWRlUGFuZWwuY3NzKHtcciAgICAgICAgICAgICAgICAnbWluLWhlaWdodCc6IHdpbmRvdy5pbm5lckhlaWdodCAtICRzaWRlUGFuZWwub2Zmc2V0KCkudG9wXHIgICAgICAgICAgICB9KTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xyXHJcciAgICAgICAgdmFyIHRhc2tzQ29udGFpbmVyID0gJCgnLnRhc2tzJykuZ2V0KDApO1xyICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyICAgICAgICAgICAgfSksXHIgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICApO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRhc2tzQ29udGFpbmVyKTtcciAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQ6IHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpXHIgICAgICAgICAgICAgICAgfSksXHIgICAgICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgICAgICk7XHIgICAgICAgIH0uYmluZCh0aGlzKSw1KSk7XHJcciAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHtcciAgICAgICAgICAgIHZhciB5ID0gTWF0aC5tYXgoMCwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgd2luZG93LnNjcm9sbFkpO1xyICAgICAgICAgICAgJCgnLm1lbnUtaGVhZGVyJykuY3NzKHtcciAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICh5KSArICdweCdcciAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgJCgnLnRhc2tzJykuY3NzKHtcciAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICctJyArIHkgKyAncHgnXHIgICAgICAgICAgICB9KTtcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBldmVudHM6IHtcciAgICAgICAgJ2NsaWNrICN0SGFuZGxlJzogJ2V4cGFuZCcsXHIgICAgICAgICdjbGljayAjZGVsZXRlQWxsJzogJ2RlbGV0ZUFsbCdcciAgICB9LFxyICAgIGNhbGN1bGF0ZUR1cmF0aW9uOiBmdW5jdGlvbigpe1xyXHIgICAgICAgIC8vIENhbGN1bGF0aW5nIHRoZSBkdXJhdGlvbiBmcm9tIHN0YXJ0IGFuZCBlbmQgZGF0ZVxyICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cInN0YXJ0XCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgZW5kZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHIgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPT0gXCJcIiAmJiBlbmRkYXRlICE9PSBcIlwiKXtcciAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgIHZhciB1dGMyID0gRGF0ZS5VVEMoZW5kZGF0ZS5nZXRGdWxsWWVhcigpLCBlbmRkYXRlLmdldE1vbnRoKCksIGVuZGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyICAgICAgICB9ZWxzZXtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKDApKTtcciAgICAgICAgfVxyICAgIH0sXHIgICAgZXhwYW5kOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LnRhcmdldCk7XHIgICAgICAgIGlmIChidXR0b24uaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgfVxyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA2MDApO1xyICAgICAgICBidXR0b24udG9nZ2xlQ2xhc3MoJ2NvbnRyYWN0Jyk7XHIgICAgfSxcciAgICBfbW92ZUNhbnZhc1ZpZXc6IGZ1bmN0aW9uKCkge1xyICAgICAgICB2YXIgc2lkZUJhcldpZHRoID0gJCgnLm1lbnUtY29udGFpbmVyJykud2lkdGgoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldExlZnRQYWRkaW5nKHNpZGVCYXJXaWR0aCk7XHIgICAgfSxcciAgICBkZWxldGVBbGw6IGZ1bmN0aW9uKCkge1xyICAgICAgICAkKCcjY29uZmlybScpLm1vZGFsKHtcciAgICAgICAgICAgIG9uSGlkZGVuOiBmdW5jdGlvbigpIHtcciAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyICAgICAgICAgICAgfSxcciAgICAgICAgICAgIG9uQXBwcm92ZTogZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICAgICAgd2hpbGUodGhpcy5jb2xsZWN0aW9uLmF0KDApKSB7XHIgICAgICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5hdCgwKS5kZXN0cm95KCk7XHIgICAgICAgICAgICAgICAgfVxyICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHIgICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gR2FudHRWaWV3O1xyIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIE1vZGFsVGFza0VkaXRDb21wb25lbnQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZWRpdFRhc2snLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgICAgICAvLyBzZXR1cCB2YWx1ZXMgZm9yIHNlbGVjdG9yc1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVTZWxlY3RzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy50YWJ1bGFyLm1lbnUgLml0ZW0nKS50YWIoKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0sIFtuYW1lPVwiZW5kXCJdJykuZGF0ZXBpY2tlcih7XHJcbi8vICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICB0aGlzLl9saXN0ZW5JbnB1dHMoKTtcclxuXHJcbiAgICB9LFxyXG4gICAgX2xpc3RlbklucHV0cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkbWlsZXN0b25lID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJtaWxlc3RvbmVcIl0nKTtcclxuICAgICAgICB2YXIgJGRlbGl2ZXJhYmxlID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJkZWxpdmVyYWJsZVwiXScpO1xyXG4gICAgICAgIHZhciAkc3RhcnQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdJyk7XHJcbiAgICAgICAgdmFyICRlbmQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImVuZFwiXScpO1xyXG4gICAgICAgICRtaWxlc3RvbmUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gJG1pbGVzdG9uZS5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgICRzdGFydC52YWwoJGVuZC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAkZGVsaXZlcmFibGUucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRkZWxpdmVyYWJsZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkZGVsaXZlcmFibGUucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkbWlsZXN0b25lLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZVNlbGVjdHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhdHVzU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGF0dXNcIl0nKTtcclxuICAgICAgICBzdGF0dXNTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgaGVhbHRoU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJoZWFsdGhcIl0nKTtcclxuICAgICAgICBoZWFsdGhTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgd29ya09yZGVyU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJ3b1wiXScpO1xyXG4gICAgICAgIHdvcmtPcmRlclNlbGVjdC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMud29kYXRhWzBdLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICQoJzxvcHRpb24gdmFsdWU9XCInICsgZGF0YS5JRCArICdcIj4nICsgZGF0YS5XT051bWJlciArICc8L29wdGlvbj4nKS5hcHBlbmRUbyh3b3JrT3JkZXJTZWxlY3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGF0dXMnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2hlYWx0aCcgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aEZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnd28nICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRXT0ZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0V09JZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlU3RyID0gJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KCksIHZhbCk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXQoMCkudmFsdWUgPSBkYXRlU3RyO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0ZXBpY2tlciggXCJyZWZyZXNoXCIgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQudmFsKHZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJtaWxlc3RvbmVcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX3NhdmVEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBpbnB1dC52YWwoKS5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgbmV3IERhdGUodmFsdWUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQucHJvcCgnY2hlY2tlZCcpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQudmFsKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zYXZlKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbFRhc2tFZGl0Q29tcG9uZW50O1xyXG4iLCJ2YXIgTm90aWZpY2F0aW9ucyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2Vycm9yJywgXy5kZWJvdW5jZSh0aGlzLm9uRXJyb3IsIDEwKSk7XHJcbiAgICB9LFxyXG4gICAgb25FcnJvciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXJndW1lbnRzKTtcclxuICAgICAgICBub3R5KHtcclxuICAgICAgICAgICAgdGV4dDogJ0Vycm9yIHdoaWxlIHNhdmluZyB0YXNrLCBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIsIHJlcXVlc3Qgc3VwcG9ydCBpZiB0aGlzIGVycm9yIGNvbnRpbnVlcy4nLFxyXG4gICAgICAgICAgICBsYXlvdXQgOiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICB0eXBlIDogJ2Vycm9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9ucztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIFJlc291cmNlRWRpdG9yVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgIHZhciBzdGFnZVBvcyA9ICQoJyNnYW50dC1jb250YWluZXInKS5vZmZzZXQoKTtcclxuICAgICAgICB2YXIgZmFrZUVsID0gJCgnPGRpdj4nKS5hcHBlbmRUbygnYm9keScpO1xyXG4gICAgICAgIGZha2VFbC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIHRvcCA6IHBvcy55ICsgc3RhZ2VQb3MudG9wICsgJ3B4JyxcclxuICAgICAgICAgICAgbGVmdCA6IHBvcy54ICsgc3RhZ2VQb3MubGVmdCArICdweCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1cCA9ICQoJy5jdXN0b20ucG9wdXAnKTtcclxuICAgICAgICBmYWtlRWwucG9wdXAoe1xyXG4gICAgICAgICAgICBwb3B1cCA6IHRoaXMucG9wdXAsXHJcbiAgICAgICAgICAgIG9uIDogJ2hvdmVyJyxcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYm90dG9tIGxlZnQnLFxyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdXAub2ZmKCcuZWRpdG9yJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLnBvcHVwKCdzaG93Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FkZFJlc291cmNlcygpO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnLmJ1dHRvbicpLm9uKCdjbGljay5lZGl0b3InLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3B1cC5wb3B1cCgnaGlkZScpO1xyXG4gICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVwLm9mZignLmVkaXRvcicpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2Z1bGxEYXRhKCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFJlc291cmNlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucG9wdXAuZW1wdHkoKTtcclxuICAgICAgICB2YXIgaHRtbFN0cmluZyA9ICcnO1xyXG4gICAgICAgICh0aGlzLnNldHRpbmdzLnN0YXR1c2VzLnJlc291cmNlZGF0YSB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBodG1sU3RyaW5nICs9ICc8ZGl2IGNsYXNzPVwidWkgY2hlY2tib3hcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICBuYW1lPVwiJyArIHJlc291cmNlLlVzZXJJZCArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGxhYmVsPicgKyByZXNvdXJjZS5Vc2VybmFtZSArICc8L2xhYmVsPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pjxicj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGh0bWxTdHJpbmcgKz0nPGJyPjxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48ZGl2IGNsYXNzPVwidWkgcG9zaXRpdmUgcmlnaHQgYnV0dG9uIHNhdmUgdGlueVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJ0Nsb3NlJyArXHJcbiAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgICAgIHRoaXMucG9wdXAuYXBwZW5kKGh0bWxTdHJpbmcpO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgIH0sXHJcbiAgICBfZnVsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcG9wdXAgPSB0aGlzLnBvcHVwO1xyXG4gICAgICAgIHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIHBvcHVwLmZpbmQoJ1tuYW1lPVwiJyArIHJlc291cmNlICsgJ1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCdpbnB1dCcpLmVhY2goZnVuY3Rpb24oaSwgaW5wdXQpIHtcclxuICAgICAgICAgICAgdmFyICRpbnB1dCA9ICQoaW5wdXQpO1xyXG4gICAgICAgICAgICBpZiAoJGlucHV0LnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzLnB1c2goJGlucHV0LmF0dHIoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KCdyZXNvdXJjZXMnLCByZXNvdXJjZXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzb3VyY2VFZGl0b3JWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGaWx0ZXJWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2ZpbHRlci1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2hhbmdlICNoaWdodGxpZ2h0cy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgaGlnaHRsaWdodFRhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaHRsaWdodFRhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdGhpcy5jb2xvcnNbZS50YXJnZXQudmFsdWVdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjaGFuZ2UgI2ZpbHRlcnMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGNyaXRlcmlhID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChjcml0ZXJpYSA9PT0gJ3Jlc2V0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2hvd1Rhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG93VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaG93IGFsbCBwYXJlbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0YXNrLnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbG9ycyA6IHtcclxuICAgICAgICAnc3RhdHVzLWJhY2tsb2cnIDogJyNEMkQyRDknLFxyXG4gICAgICAgICdzdGF0dXMtcmVhZHknIDogJyNCMkQxRjAnLFxyXG4gICAgICAgICdzdGF0dXMtaW4gcHJvZ3Jlc3MnIDogJyM2NkEzRTAnLFxyXG4gICAgICAgICdzdGF0dXMtY29tcGxldGUnIDogJyM5OUMyOTknLFxyXG4gICAgICAgICdsYXRlJyA6ICcjRkZCMkIyJyxcclxuICAgICAgICAnZHVlJyA6ICcgI0ZGQzI5OScsXHJcbiAgICAgICAgJ21pbGVzdG9uZScgOiAnI0Q2QzJGRicsXHJcbiAgICAgICAgJ2RlbGl2ZXJhYmxlJyA6ICcjRTBEMUMyJyxcclxuICAgICAgICAnZmluYW5jaWFsJyA6ICcjRjBFMEIyJyxcclxuICAgICAgICAndGltZXNoZWV0cycgOiAnI0MyQzJCMicsXHJcbiAgICAgICAgJ3JlcG9ydGFibGUnIDogJyAjRTBDMkMyJyxcclxuICAgICAgICAnaGVhbHRoLXJlZCcgOiAncmVkJyxcclxuICAgICAgICAnaGVhbHRoLWFtYmVyJyA6ICcjRkZCRjAwJyxcclxuICAgICAgICAnaGVhbHRoLWdyZWVuJyA6ICdncmVlbidcclxuICAgIH0sXHJcbiAgICBfZ2V0TW9kZWxzRm9yQ3JpdGVyaWEgOiBmdW5jdGlvbihjcmV0ZXJpYSkge1xyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ3Jlc2V0cycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignc3RhdHVzJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gKHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKHN0YXR1cykgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnc3RhdHVzJykudG9TdHJpbmcoKSA9PT0gaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdsYXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpIDwgbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2R1ZScpIHtcclxuICAgICAgICAgICAgdmFyIGxhc3REYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgbGFzdERhdGUuYWRkV2Vla3MoMik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPiBuZXcgRGF0ZSgpICYmIHRhc2suZ2V0KCdlbmQnKSA8IGxhc3REYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFsnbWlsZXN0b25lJywgJ2RlbGl2ZXJhYmxlJywgJ2ZpbmFuY2lhbCcsICd0aW1lc2hlZXRzJywgJ3JlcG9ydGFibGUnXS5pbmRleE9mKGNyZXRlcmlhKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KGNyZXRlcmlhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdoZWFsdGgnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aCA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoSWQgPSAodGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoSWQoaGVhbHRoKSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdoZWFsdGgnKS50b1N0cmluZygpID09PSBoZWFsdGhJZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlclZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZ3JvdXBpbmctbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICN0b3AtZXhwYW5kLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICN0b3AtY29sbGFwc2UtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcm91cGluZ01lbnVWaWV3O1xyXG4iLCJ2YXIgcGFyc2VYTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZVhNTE9iajtcclxudmFyIEpTT05Ub1hNTCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3htbFdvcmtlcicpLkpTT05Ub1hNTDtcclxudmFyIHBhcnNlRGVwc0Zyb21YTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZURlcHNGcm9tWE1MO1xyXG5cclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjcHJvamVjdC1tZW51JyxcclxuXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmltcG9ydGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3NldHVwSW5wdXQoKTtcclxuICAgIH0sXHJcbiAgICBfc2V0dXBJbnB1dCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpbnB1dCA9ICQoJyNpbXBvcnRGaWxlJyk7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICAgICAgdmFyIGZpbGVzID0gZXZ0LnRhcmdldC5maWxlcztcclxuICAgICAgICAgICAgXy5lYWNoKGZpbGVzLCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBmaWxlLm5hbWUuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgICAgIHZhciBleHRlbnRpb24gPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVudGlvbiAhPT0gJ3htbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgnVGhlIGZpbGUgdHlwZSBcIicgKyBleHRlbnRpb24gKyAnXCIgaXMgbm90IHN1cHBvcnRlZC4gT25seSB4bWwgZmlsZXMgYXJlIGFsbG93ZWQuIFBsZWFzZSBzYXZlIHlvdXIgTVMgcHJvamVjdCBhcyBhIHhtbCBmaWxlIGFuZCB0cnkgYWdhaW4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYueG1sRGF0YSA9IGUudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdFcnJvciB3aGlsZSBwYXJpbmcgZmlsZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3VwbG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjbXNpbXBvcnQnKS5tb2RhbCh7XHJcbiAgICAgICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnhtbERhdGEgfHwgdGhpcy5pbXBvcnRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltcG9ydGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRQcm9ncmVzc1wiKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRGaWxlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN4bWxpbnB1dC1mb3JtJykudHJpZ2dlcigncmVzZXQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuaW1wb3J0RGF0YS5iaW5kKHRoaXMpLCAyMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICQoXCIjaW1wb3J0UHJvZ3Jlc3NcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2ltcG9ydEZpbGVcIikuc2hvdygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICNkb3dubG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IEpTT05Ub1hNTCh0aGlzLmNvbGxlY3Rpb24udG9KU09OKCkpO1xyXG4gICAgICAgICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwge3R5cGUgOiAnYXBwbGljYXRpb24vanNvbid9KTtcclxuICAgICAgICAgICAgc2F2ZUFzKGJsb2IsICdHYW50dFRhc2tzLnhtbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwcm9ncmVzcyA6IGZ1bmN0aW9uKHBlcmNlbnQpIHtcclxuICAgICAgICAkKCcjaW1wb3J0UHJvZ3Jlc3MnKS5wcm9ncmVzcyh7XHJcbiAgICAgICAgICAgIHBlcmNlbnQgOiBwZXJjZW50XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVEYXRhIDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHZhciBkZWZTdGF0dXMgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0U3RhdHVzSWQoKTtcclxuICAgICAgICB2YXIgZGVmSGVhbHRoID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdEhlYWx0aElkKCk7XHJcbiAgICAgICAgdmFyIGRlZldPID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFdPSWQoKTtcclxuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBpdGVtLmhlYWx0aCA9IGRlZkhlYWx0aDtcclxuICAgICAgICAgICAgaXRlbS5zdGF0dXMgPSBkZWZTdGF0dXM7XHJcbiAgICAgICAgICAgIGl0ZW0ud28gPSBkZWZXTztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH0sXHJcbiAgICBpbXBvcnREYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGRlbGF5ID0gMTAwO1xyXG4gICAgICAgIHRoaXMucHJvZ3Jlc3MoMCk7XHJcbiAgICAgICAgLy8gdGhpcyBpcyBzb21lIHNvcnQgb2YgY2FsbGJhY2sgaGVsbCEhXHJcbiAgICAgICAgLy8gd2UgbmVlZCB0aW1lb3V0cyBmb3IgYmV0dGVyIHVzZXIgZXhwZXJpZW5jZVxyXG4gICAgICAgIC8vIEkgdGhpbmsgdXNlciB3YW50IHRvIHNlZSBhbmltYXRlZCBwcm9ncmVzcyBiYXJcclxuICAgICAgICAvLyBidXQgd2l0aG91dCB0aW1lb3V0cyBpdCBpcyBub3QgcG9zc2libGUsIHJpZ2h0P1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoMTApO1xyXG4gICAgICAgICAgICB2YXIgY29sID0gdGhpcy5jb2xsZWN0aW9uO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHBhcnNlWE1MKHRoaXMueG1sRGF0YSk7XHJcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9wcmVwYXJlRGF0YShkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDI2KTtcclxuICAgICAgICAgICAgICAgIGNvbC5pbXBvcnRUYXNrcyhkYXRhLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDQzKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDU5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlcHMgPSBwYXJzZURlcHNGcm9tWE1MKHRoaXMueG1sRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDc4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbC5jcmVhdGVEZXBzKGRlcHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXNpbXBvcnQnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNU1Byb2plY3RNZW51VmlldztcclxuIiwidmFyIFJlcG9ydHNNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI3JlcG9ydHMtbWVudScsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50czoge1xyXG4gICAgICAgICdjbGljayAjcHJpbnQnOiAnZ2VuZXJhdGVQREYnLFxyXG4gICAgICAgICdjbGljayAjc2hvd1ZpZGVvJzogJ3Nob3dIZWxwJ1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUERGOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB3aW5kb3cucHJpbnQoKTtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcbiAgICBzaG93SGVscDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI3Nob3dWaWRlb01vZGFsJykubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkFwcHJvdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRzTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgWm9vbU1lbnVWaWV3ID0gcmVxdWlyZSgnLi9ab29tTWVudVZpZXcnKTtcclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSByZXF1aXJlKCcuL0dyb3VwaW5nTWVudVZpZXcnKTtcclxudmFyIEZpbHRlck1lbnVWaWV3ID0gcmVxdWlyZSgnLi9GaWx0ZXJNZW51VmlldycpO1xyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSByZXF1aXJlKCcuL01TUHJvamVjdE1lbnVWaWV3Jyk7XHJcbnZhciBNaXNjTWVudVZpZXcgPSByZXF1aXJlKCcuL01pc2NNZW51VmlldycpO1xyXG5cclxudmFyIFRvcE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIG5ldyBab29tTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgR3JvdXBpbmdNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBGaWx0ZXJNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNU1Byb2plY3RNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNaXNjTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvcE1lbnVWaWV3O1xyXG4iLCJ2YXIgWm9vbU1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjem9vbS1tZW51JyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5faGlnaHRsaWdodFNlbGVjdGVkKCk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgICAgJ2NsaWNrIC5hY3Rpb24nOiAnb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQnXHJcbiAgICB9LFxyXG4gICAgb25JbnRlcnZhbEJ1dHRvbkNsaWNrZWQ6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSAkKGV2dC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBidXR0b24uZGF0YSgnaW50ZXJ2YWwnKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnNldCgnaW50ZXJ2YWwnLCBpbnRlcnZhbCk7XHJcbiAgICAgICAgdGhpcy5faGlnaHRsaWdodFNlbGVjdGVkKCk7XHJcbiAgICB9LFxyXG4gICAgX2hpZ2h0bGlnaHRTZWxlY3RlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy4kKCcuYWN0aW9uJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblxyXG4gICAgICAgIGxldCBpbnRlcnZhbCA9IHRoaXMuc2V0dGluZ3MuZ2V0KCdpbnRlcnZhbCcpO1xyXG4gICAgICAgIHRoaXMuJCgnW2RhdGEtaW50ZXJ2YWw9XCInICsgaW50ZXJ2YWwgKyAnXCJdJykuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBab29tTWVudVZpZXc7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxhdnJ0b24gb24gMTcuMTIuMjAxNC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG52YXIgQmFzaWNUYXNrVmlldyA9IHJlcXVpcmUoJy4vQmFzaWNUYXNrVmlldycpO1xyXG5cclxudmFyIEFsb25lVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfYm9yZGVyV2lkdGggOiAzLFxyXG4gICAgX2NvbG9yIDogJyNFNkYwRkYnLFxyXG4gICAgZXZlbnRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmV2ZW50cygpLCB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAubGVmdEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLnJpZ2h0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcblxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAubGVmdEJvcmRlcicgOiAncmVuZGVyJyxcclxuICAgICAgICAgICAgJ2RyYWdlbmQgLnJpZ2h0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAubGVmdEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLmxlZnRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnLFxyXG5cclxuICAgICAgICAgICAgJ21vdXNlb3ZlciAucmlnaHRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5yaWdodEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZSdcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLmVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxlZnRCb3JkZXIgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1pbihsb2NhbFgsIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5tYXgobG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpKSArIG9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICB5IDogdGhpcy5feSArIHRoaXMuX3RvcFBhZGRpbmdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9ib3JkZXJXaWR0aCxcclxuICAgICAgICAgICAgZmlsbCA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAncmlnaHRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKHJpZ2h0Qm9yZGVyKTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX3Jlc2l6ZVBvaW50ZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xyXG4gICAgfSxcclxuICAgIF9jaGFuZ2VTaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxlZnRYID0gdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKTtcclxuICAgICAgICB2YXIgcmlnaHRYID0gdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkgKyB0aGlzLl9ib3JkZXJXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHJlY3Qud2lkdGgocmlnaHRYIC0gbGVmdFgpO1xyXG4gICAgICAgIHJlY3QueChsZWZ0WCk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB2YXIgY29tcGxldGVSZWN0ID0gdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF07XHJcbiAgICAgICAgY29tcGxldGVSZWN0LngobGVmdFgpO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHJpZ2h0WCk7XHJcbiAgICAgICAgdmFyIHJlc291cmNlcyA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpWzBdO1xyXG4gICAgICAgIHJlc291cmNlcy54KHJpZ2h0WCArIHRoaXMuX3Rvb2xiYXJPZmZzZXQpO1xyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSAtIHRoaXMuX2JvcmRlcldpZHRoKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ21pbGVzdG9uZScpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmRpYW1vbmQnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JykuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJykuaGlkZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmRpYW1vbmQnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLm1haW5SZWN0Jykuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJykuc2hvdygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5yZW5kZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsb25lVGFza1ZpZXc7XHJcbiIsIlxyXG52YXIgUmVzb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuLi9SZXNvdXJjZXNFZGl0b3InKTtcclxuXHJcbnZhciBsaW5rSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxubGlua0ltYWdlLnNyYyA9ICdjc3MvaW1hZ2VzL2xpbmsucG5nJztcclxuXHJcbnZhciB1c2VySW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxudXNlckltYWdlLnNyYyA9ICdjc3MvaW1hZ2VzL3VzZXIucG5nJztcclxuXHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gQmFja2JvbmUuS29udmFWaWV3LmV4dGVuZCh7XHJcbiAgICBfZnVsbEhlaWdodDogMjEsXHJcbiAgICBfdG9wUGFkZGluZzogMyxcclxuICAgIF9iYXJIZWlnaHQ6IDE1LFxyXG4gICAgX2NvbXBsZXRlQ29sb3I6ICcjZTg4MTM0JyxcclxuICAgIF90b29sYmFyT2Zmc2V0OiAyMCxcclxuICAgIF9yZXNvdXJjZUxpc3RPZmZzZXQ6IDIwLFxyXG4gICAgX21pbGVzdG9uZUNvbG9yOiAnYmx1ZScsXHJcbiAgICBfbWlsZXN0b25lT2Zmc2V0OiAwLFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLl9mdWxsSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUnOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQubm9kZVR5cGUgIT09ICdHcm91cCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEYXRlcygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zYXZlV2l0aENoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VlbnRlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dUb29scygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVJlc291cmNlc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dyYWJQb2ludGVyKGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VsZWF2ZSc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVRvb2xzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93UmVzb3VyY2VzTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdE1vdXNlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdkcmFnc3RhcnQgLmRlcGVuZGVuY3lUb29sJzogJ19zdGFydENvbm5lY3RpbmcnLFxyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmRlcGVuZGVuY3lUb29sJzogJ19tb3ZlQ29ubmVjdCcsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5kZXBlbmRlbmN5VG9vbCc6ICdfY3JlYXRlRGVwZW5kZW5jeScsXHJcbiAgICAgICAgICAgICdjbGljayAucmVzb3VyY2VzJzogJ19lZGl0UmVzb3VyY2VzJ1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLb252YS5Hcm91cCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmM6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiBwb3MueCxcclxuICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLl95XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIGlkOiB0aGlzLm1vZGVsLmNpZCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGZha2VCYWNrZ3JvdW5kID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgbmFtZTogJ2Zha2VCYWNrZ3JvdW5kJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciByZWN0ID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWU6ICdtYWluUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgZGlhbW9uZCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbDogdGhpcy5fbWlsZXN0b25lQ29sb3IsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcgKyB0aGlzLl9iYXJIZWlnaHQgLyAyLFxyXG4gICAgICAgICAgICB4OiB0aGlzLl9iYXJIZWlnaHQgLyAyLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2JhckhlaWdodCAqIDAuOCxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2JhckhlaWdodCAqIDAuOCxcclxuICAgICAgICAgICAgb2Zmc2V0WDogdGhpcy5fYmFySGVpZ2h0ICogMC44IC8gMixcclxuICAgICAgICAgICAgb2Zmc2V0WTogdGhpcy5fYmFySGVpZ2h0ICogMC44IC8gMixcclxuICAgICAgICAgICAgbmFtZTogJ2RpYW1vbmQnLFxyXG4gICAgICAgICAgICByb3RhdGlvbjogNDUsXHJcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbDogdGhpcy5fY29tcGxldGVDb2xvcixcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWU6ICdjb21wbGV0ZVJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBhcmMgPSBuZXcgS29udmEuU2hhcGUoe1xyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBmaWxsOiAnbGlnaHRncmVlbicsXHJcbiAgICAgICAgICAgIGRyYXdGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaG9yT2Zmc2V0ID0gNjtcclxuICAgICAgICAgICAgICAgIHZhciBzaXplID0gc2VsZi5fYmFySGVpZ2h0ICsgKHNlbGYuX2JvcmRlclNpemUgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhob3JPZmZzZXQsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoaG9yT2Zmc2V0LCBzaXplIC8gMiwgc2l6ZSAvIDIsIC1NYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbygwLCAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFNoYXBlKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGltZ1NpemUgPSBzaXplIC0gNDtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGxpbmtJbWFnZSwgMSwgKHNpemUgLSBpbWdTaXplKSAvIDIsIGltZ1NpemUsIGltZ1NpemUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoaXRGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5yZWN0KDAsIDAsIDYgKyBzZWxmLl9iYXJIZWlnaHQsIHNlbGYuX2JhckhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmFtZTogJ2RlcGVuZGVuY3lUb29sJyxcclxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgdG9vbGJhciA9IG5ldyBLb252YS5Hcm91cCh7XHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIG5hbWU6ICdyZXNvdXJjZXMnLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzaXplID0gc2VsZi5fYmFySGVpZ2h0ICsgKHNlbGYuX2JvcmRlclNpemUgfHwgMCk7XHJcbiAgICAgICAgdmFyIHRvb2xiYWNrID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsOiAnbGlnaHRncmV5JyxcclxuICAgICAgICAgICAgd2lkdGg6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcclxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB1c2VySW0gPSBuZXcgS29udmEuSW1hZ2Uoe1xyXG4gICAgICAgICAgICBpbWFnZTogdXNlckltYWdlLFxyXG4gICAgICAgICAgICB3aWR0aDogc2l6ZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiBzaXplXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbGJhci5hZGQodG9vbGJhY2ssIHVzZXJJbSk7XHJcblxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSBuZXcgS29udmEuVGV4dCh7XHJcbiAgICAgICAgICAgIG5hbWU6ICdyZXNvdXJjZUxpc3QnLFxyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBsaXN0ZW5pbmc6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZChmYWtlQmFja2dyb3VuZCwgZGlhbW9uZCwgcmVjdCwgY29tcGxldGVSZWN0LCBhcmMsIHRvb2xiYXIsIHJlc291cmNlTGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9lZGl0UmVzb3VyY2VzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBSZXNvdXJjZUVkaXRvcih7XHJcbiAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxyXG4gICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLmVsLmdldFN0YWdlKCkuZ2V0UG9pbnRlclBvc2l0aW9uKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIocG9zKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLnJvdW5kKHggLyBkYXlzV2lkdGgpLCBkYXlzMiA9IE1hdGgucm91bmQoKHggKyBsZW5ndGgpIC8gZGF5c1dpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcclxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zaG93VG9vbHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9oaWRlVG9vbHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9zaG93UmVzb3VyY2VzTGlzdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0Jykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVJlc291cmNlc0xpc3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2dyYWJQb2ludGVyOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBlLnRhcmdldC5uYW1lKCk7XHJcbiAgICAgICAgaWYgKChuYW1lID09PSAnbWFpblJlY3QnKSB8fCAobmFtZSA9PT0gJ2RlcGVuZGVuY3lUb29sJykgfHxcclxuICAgICAgICAgICAgKG5hbWUgPT09ICdjb21wbGV0ZVJlY3QnKSB8fCAoZS50YXJnZXQuZ2V0UGFyZW50KCkubmFtZSgpID09PSAncmVzb3VyY2VzJykpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9kZWZhdWx0TW91c2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xyXG4gICAgfSxcclxuICAgIF9zdGFydENvbm5lY3Rpbmc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC5oaWRlKCk7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRvb2wuZ2V0QWJzb2x1dGVQb3NpdGlvbigpO1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSBuZXcgS29udmEuQXJyb3coe1xyXG4gICAgICAgICAgICBzdHJva2U6ICdkYXJrZ3JlZW4nLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMSxcclxuICAgICAgICAgICAgcG9pbnRlcldpZHRoOiA2LFxyXG4gICAgICAgICAgICBwb2ludGVySGVpZ2h0OiAxMCxcclxuICAgICAgICAgICAgZmlsbDogJ2dyZXknLFxyXG4gICAgICAgICAgICBwb2ludHM6IFtwb3MueCAtIHN0YWdlLngoKSwgcG9zLnkgKyB0aGlzLl9iYXJIZWlnaHQgLyAyLCBwb3MueCAtIHN0YWdlLngoKSwgcG9zLnldLFxyXG4gICAgICAgICAgICBuYW1lOiAnY29ubmVjdG9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5hZGQoY29ubmVjdG9yKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDb25uZWN0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHBvaW50cyA9IGNvbm5lY3Rvci5wb2ludHMoKTtcclxuICAgICAgICBwb2ludHNbMl0gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS54IC0gc3RhZ2UueCgpO1xyXG4gICAgICAgIHBvaW50c1szXSA9IHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLnk7XHJcbiAgICAgICAgY29ubmVjdG9yLnBvaW50cyhwb2ludHMpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEZXBlbmRlbmN5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBlbCA9IHN0YWdlLmdldEludGVyc2VjdGlvbihzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKSk7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gZWwgJiYgZWwuZ2V0UGFyZW50KCk7XHJcbiAgICAgICAgdmFyIHRhc2tJZCA9IGdyb3VwICYmIGdyb3VwLmlkKCk7XHJcbiAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5tb2RlbDtcclxuICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5nZXQodGFza0lkKTtcclxuICAgICAgICBpZiAoYWZ0ZXJNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHJlbW92ZUZvciA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5maW5kKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlbW92ZUZvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLnJlbW92ZURlcGVuZGVuY3kocmVtb3ZlRm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGRvbid0IHVwZGF0ZSBlbGVtZW50IHdoaWxlIGRyYWdnaW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQgY2hhbmdlOmNvbXBsZXRlIGNoYW5nZTpyZXNvdXJjZXMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGRyYWdnaW5nID0gdGhpcy5lbC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZ2V0Q2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZyA9IGRyYWdnaW5nIHx8IGNoaWxkLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVYOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSAtIDEpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdlbmQnKSkpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlQ29tcGxldGVXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIC8vIG1vdmUgZ3JvdXBcclxuICAgICAgICB0aGlzLmVsLngoeC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBmYWtlIGJhY2tncm91bmQgcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgYmFjayA9IHRoaXMuZWwuZmluZCgnLmZha2VCYWNrZ3JvdW5kJylbMF07XHJcbiAgICAgICAgYmFjay54KC0yMCk7XHJcbiAgICAgICAgYmFjay53aWR0aCh4LngyIC0geC54MSArIDYwKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIG1haW4gcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC54KDApO1xyXG4gICAgICAgIHJlY3Qud2lkdGgoeC54MiAtIHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS54KDApO1xyXG5cclxuICAgICAgICB2YXIgX21pbGVzdG9uZU9mZnNldCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICBfbWlsZXN0b25lT2Zmc2V0ID0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHgueDIgLSB4LngxICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgdG9vbC55KHRoaXMuX3RvcFBhZGRpbmcpO1xyXG5cclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VzLngoeC54MiAtIHgueDEgKyB0aGlzLl90b29sYmFyT2Zmc2V0ICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgcmVzb3VyY2VzLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2UgbGlzdFxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKVswXTtcclxuICAgICAgICByZXNvdXJjZUxpc3QueCh4LngyIC0geC54MSArIHRoaXMuX3Jlc291cmNlTGlzdE9mZnNldCArIF9taWxlc3RvbmVPZmZzZXQpO1xyXG4gICAgICAgIHJlc291cmNlTGlzdC55KHRoaXMuX3RvcFBhZGRpbmcgKyAyKTtcclxuICAgICAgICB2YXIgbmFtZXMgPSBbXTtcclxuICAgICAgICB2YXIgbGlzdCA9IHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKTtcclxuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2VJZCkge1xyXG4gICAgICAgICAgICB2YXIgcmVzID0gXy5maW5kKCh0aGlzLnNldHRpbmdzLnN0YXR1c2VzLnJlc291cmNlZGF0YSB8fCBbXSksIGZ1bmN0aW9uKHIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByLlVzZXJJZC50b1N0cmluZygpID09PSByZXNvdXJjZUlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPCAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChyZXMuVXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxpYXNlcyA9IF8ubWFwKHJlcy5Vc2VybmFtZS5zcGxpdCgnICcpLCBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0clswXTtcclxuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lcy5wdXNoKGFsaWFzZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXNvdXJjZUxpc3QudGV4dChuYW1lcy5qb2luKCcsICcpKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc2V0WTogZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuZWwueSh5KTtcclxuICAgIH0sXHJcbiAgICBnZXRZOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljVGFza1ZpZXc7XHJcbiIsInZhciBDb25uZWN0b3JWaWV3ID0gQmFja2JvbmUuS29udmFWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3I6ICdncmV5JyxcclxuICAgIF93cm9uZ0NvbG9yOiAncmVkJyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuYmVmb3JlTW9kZWwgPSBwYXJhbXMuYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgdGhpcy5hZnRlck1vZGVsID0gcGFyYW1zLmFmdGVyTW9kZWw7XHJcbiAgICAgICAgdGhpcy5feTEgPSAwO1xyXG4gICAgICAgIHRoaXMuX3kyID0gMDtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxpbmUgPSBuZXcgS29udmEuTGluZSh7XHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHBvaW50czogWzAsIDAsIDAsIDBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9LFxyXG4gICAgc2V0WTE6IGZ1bmN0aW9uKHkxKSB7XHJcbiAgICAgICAgdGhpcy5feTEgPSB5MTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHNldFkyOiBmdW5jdGlvbih5Mikge1xyXG4gICAgICAgIHRoaXMuX3kyID0geTI7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIGlmICh4LngyID49IHgueDEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fY29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbeC54MSwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTIsIHgueDIsIHRoaXMuX3kyXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fd3JvbmdDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFtcclxuICAgICAgICAgICAgICAgIHgueDEsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kyLFxyXG4gICAgICAgICAgICAgICAgeC54MiwgdGhpcy5feTJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVYOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHgxOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5hZnRlck1vZGVsLmdldCgnc3RhcnQnKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdG9yVmlldztcclxuIiwidmFyIE5lc3RlZFRhc2tWaWV3ID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrVmlldycpO1xyXG52YXIgQWxvbmVUYXNrVmlldyA9IHJlcXVpcmUoJy4vQWxvbmVUYXNrVmlldycpO1xyXG52YXIgQ29ubmVjdG9yVmlldyA9IHJlcXVpcmUoJy4vQ29ubmVjdG9yVmlldycpO1xyXG5cclxudmFyIEdhbnR0Q2hhcnRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjZ2FudHQtY29udGFpbmVyJyxcclxuICAgIF90b3BQYWRkaW5nOiA3MyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gW107XHJcbiAgICAgICAgdGhpcy5faW5pdFN0YWdlKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdExheWVycygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRCYWNrZ3JvdW5kKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdFN1YlZpZXdzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdENvbGxlY3Rpb25FdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBzZXRMZWZ0UGFkZGluZzogZnVuY3Rpb24ob2Zmc2V0KSB7XHJcbiAgICAgICAgdGhpcy5fbGVmdFBhZGRpbmcgPSBvZmZzZXQ7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3RhZ2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc3RhZ2UgPSBuZXcgS29udmEuU3RhZ2Uoe1xyXG4gICAgICAgICAgICBjb250YWluZXI6IHRoaXMuZWxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRMYXllcnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuRmxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5CbGF5ZXIgPSBuZXcgS29udmEuTGF5ZXIoKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmFkZCh0aGlzLkJsYXllciwgdGhpcy5GbGF5ZXIpO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVTdGFnZUF0dHJzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBwcmV2aW91c1Rhc2tYID0gdGhpcy5fdGFza1ZpZXdzLmxlbmd0aCA/IHRoaXMuX3Rhc2tWaWV3c1swXS5lbC54KCkgOiAwO1xyXG4gICAgICAgIHRoaXMuc3RhZ2Uuc2V0QXR0cnMoe1xyXG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KCQoJy50YXNrcycpLmlubmVySGVpZ2h0KCkgKyB0aGlzLl90b3BQYWRkaW5nLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAkKHRoaXMuc3RhZ2UuZ2V0Q29udGFpbmVyKCkpLm9mZnNldCgpLnRvcCksXHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLiRlbC5pbm5lcldpZHRoKCksXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYzogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDtcclxuICAgICAgICAgICAgICAgIHZhciBtaW5YID0gLShsaW5lV2lkdGggLSB0aGlzLndpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvcy54ID4gc2VsZi5fbGVmdFBhZGRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gc2VsZi5fbGVmdFBhZGRpbmc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvcy54IDwgbWluWCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBtaW5YO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gcG9zLng7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRyYWdnZWRUb0RheSA9IE1hdGguYWJzKHggLSBzZWxmLl9sZWZ0UGFkZGluZykgLyBzZWxmLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKS5kYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3Rhc2tWaWV3cy5sZW5ndGggfHwgIXByZXZpb3VzVGFza1gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2UueCh0aGlzLl9sZWZ0UGFkZGluZyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWlueCA9IC0obGluZVdpZHRoIC0gdGhpcy5zdGFnZS53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy5fbGVmdFBhZGRpbmcgLSAodGhpcy5kcmFnZ2VkVG9EYXkgfHwgMCkgKiBzZWxmLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKS5kYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLngoTWF0aC5tYXgobWlueCwgeCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRvZGF5TGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xyXG5cclxuXHJcbiAgICB9LFxyXG4gICAgX2luaXRCYWNrZ3JvdW5kOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JpZCA9IG5ldyBLb252YS5TaGFwZSh7XHJcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0U2NlbmVGdW5jdGlvbigpLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMCxcclxuICAgICAgICAgICAgZmlsbDogJ3JnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgIG5hbWU6ICdncmlkJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBiYWNrID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc3RhZ2UuaGVpZ2h0KCksXHJcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBjdXJyZW50RGF5TGluZSA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YWdlLmhlaWdodCgpLFxyXG4gICAgICAgICAgICB3aWR0aDogMixcclxuICAgICAgICAgICAgeTogMCxcclxuICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgZmlsbDogJ2dyZWVuJyxcclxuICAgICAgICAgICAgbGlzdGVuaW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgbmFtZTogJ2N1cnJlbnREYXlMaW5lJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgeSA9IE1hdGgubWF4KDAsIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IHdpbmRvdy5zY3JvbGxZKTtcclxuICAgICAgICAgICAgZ3JpZC55KHkpO1xyXG4gICAgICAgICAgICBncmlkLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuQmxheWVyLmFkZChiYWNrKS5hZGQoY3VycmVudERheUxpbmUpLmFkZChncmlkKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfZ2V0U2NlbmVGdW5jdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNkaXNwbGF5ID0gdGhpcy5zZXR0aW5ncy5zZGlzcGxheTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IDE7XHJcbiAgICAgICAgdmFyIHJvd0hlaWdodCA9IDIwO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xyXG4gICAgICAgICAgICB2YXIgaSwgcywgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xyXG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgLy9kcmF3IHRocmVlIGxpbmVzXHJcbiAgICAgICAgICAgIGZvcihpID0gMTsgaSA8IDQ7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcclxuICAgICAgICAgICAgZm9yIChzID0gMTsgcyA8IDM7IHMrKyl7XHJcbiAgICAgICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IGhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzEwcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5ZiAtIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeWkgPSB5ZjsgeWYgPSB5ZiArIHJvd0hlaWdodDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7IHMgPSAzO1xyXG4gICAgICAgICAgICB2YXIgZHJhZ0ludCA9IHBhcnNlSW50KHNhdHRyLmRyYWdJbnRlcnZhbCwgMTApO1xyXG4gICAgICAgICAgICB2YXIgaGlkZURhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYoIGRyYWdJbnQgPT09IDE0IHx8IGRyYWdJbnQgPT09IDMwKXtcclxuICAgICAgICAgICAgICAgIGhpZGVEYXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBoRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcclxuICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoaERhdGFbc11baV0uaG9seSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHlpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgIGlmIChoaWRlRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWkgKyByb3dIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhY2hlQmFja2dyb3VuZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHRoaXMuQmxheWVyLmZpbmRPbmUoJy5ncmlkJykuY2FjaGUoe1xyXG4gICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICB5OiAwLFxyXG4gICAgICAgICAgICB3aWR0aDogbGluZVdpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc3RhZ2UuaGVpZ2h0KClcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlVG9kYXlMaW5lOiBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgdmFyIHggPSBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCBuZXcgRGF0ZSgpKSAqIGRheXNXaWR0aDtcclxuICAgICAgdGhpcy5CbGF5ZXIuZmluZE9uZSgnLmN1cnJlbnREYXlMaW5lJykueCh4KS5oZWlnaHQodGhpcy5zdGFnZS5oZWlnaHQoKSk7XHJcbiAgICAgIHRoaXMuQmxheWVyLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlQmFja2dyb3VuZCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6d2lkdGgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUJhY2tncm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0sXHJcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAncmVtb3ZlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyB3YWl0IGZvciBsZWZ0IHBhbmVsIHVwZGF0ZXNcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgICAgIH0sIDEwKSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCBjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdkZXBlbmQ6YWRkJywgZnVuY3Rpb24oYmVmb3JlLCBhZnRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KGJlZm9yZSwgYWZ0ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnZGVwZW5kOnJlbW92ZScsIGZ1bmN0aW9uKGJlZm9yZSwgYWZ0ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdG9yVmlldyhiZWZvcmUsIGFmdGVyKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ25lc3RlZFN0YXRlQ2hhbmdlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbDogZnVuY3Rpb24obW9kZWwpIHtcclxuICAgICAgICB2YXIgdGFza1ZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBtb2RlbDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9yZW1vdmVWaWV3KHRhc2tWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVtb3ZlVmlldzogZnVuY3Rpb24odGFza1ZpZXcpIHtcclxuICAgICAgICB0YXNrVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBfLndpdGhvdXQodGhpcy5fdGFza1ZpZXdzLCB0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZUNvbm5lY3RvclZpZXc6IGZ1bmN0aW9uKGJlZm9yZSwgYWZ0ZXIpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5hZnRlck1vZGVsID09PSBhZnRlciAmJlxyXG4gICAgICAgICAgICAgICAgdmlldy5iZWZvcmVNb2RlbCA9PT0gYmVmb3JlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbm5lY3RvclZpZXcucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBfLndpdGhvdXQodGhpcy5fY29ubmVjdG9yVmlld3MsIGNvbm5lY3RvclZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3ViVmlld3M6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKChhZnRlcikgPT4ge1xyXG4gICAgICAgICAgICBhZnRlci5kZXBlbmRzLmVhY2goKGJlZm9yZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3RvclZpZXcoYmVmb3JlLCBhZnRlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkVGFza1ZpZXc6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgdmlldztcclxuICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTmVzdGVkVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFsb25lVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzLnB1c2godmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2FkZENvbm5lY3RvclZpZXc6IGZ1bmN0aW9uKGJlZm9yZSwgYWZ0ZXIpIHtcclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBDb25uZWN0b3JWaWV3KHtcclxuICAgICAgICAgICAgYmVmb3JlTW9kZWw6IGJlZm9yZSxcclxuICAgICAgICAgICAgYWZ0ZXJNb2RlbDogYWZ0ZXIsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcuZWwubW92ZVRvQm90dG9tKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfcmVxdWVzdFJlc29ydDogKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICAgICAgd2FpdGluZyA9IHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSksXHJcbiAgICBfcmVzb3J0Vmlld3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsYXN0WSA9IHRoaXMuX3RvcFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdi5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XHJcbiAgICAgICAgICAgIGxhc3RZICs9IHZpZXcuaGVpZ2h0O1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goKGFmdGVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhZnRlci5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWZ0ZXIuZGVwZW5kcy5lYWNoKChiZWZvcmUpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmVWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBiZWZvcmU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciBhZnRlclZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IGFmdGVyO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5hZnRlck1vZGVsID09PSBhZnRlcjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMShiZWZvcmVWaWV3LmdldFkoKSArIGJlZm9yZVZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTIoYWZ0ZXJWaWV3LmdldFkoKSArIGFmdGVyVmlldy5fZnVsbEhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLkZsYXllci5iYXRjaERyYXcoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9jb2xvciA6ICcjYjNkMWZjJyxcclxuICAgIF9ib3JkZXJTaXplIDogNixcclxuICAgIF9iYXJIZWlnaHQgOiAxMCxcclxuICAgIF9jb21wbGV0ZUNvbG9yIDogJyNDOTVGMTAnLFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZSAqIDEuNSwgMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZV0sXHJcbiAgICAgICAgICAgIGNsb3NlZCA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbLXRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGdyb3VwIGlzIG1vdmVkXHJcbiAgICAgICAgLy8gc28gd2UgbmVlZCB0byBkZXRlY3QgaW50ZXJ2YWxcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5mbG9vcih4IC8gZGF5c1dpZHRoKTtcclxuICAgICAgICB2YXIgbmV3U3RhcnQgPSBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpO1xyXG4gICAgICAgIHRoaXMubW9kZWwubW92ZVRvU3RhcnQobmV3U3RhcnQpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlV2lkdGggPSAoeC54MiAtIHgueDEpICogdGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDA7XHJcbiAgICAgICAgaWYgKGNvbXBsZXRlV2lkdGggPiB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgoeC54MiAtIHgueDEpIC0gY29tcGxldGVXaWR0aCA8IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXN0ZWRUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBNb2RhbEVkaXQgPSByZXF1aXJlKCcuLi9Nb2RhbFRhc2tFZGl0VmlldycpO1xyXG52YXIgQ29tbWVudHMgPSByZXF1aXJlKCcuLi9Db21tZW50c1ZpZXcnKTtcclxuXHJcbmZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhwYXJhbXMpIHtcclxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHBhcmFtcy5jb2xsZWN0aW9uO1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ3VsJyxcclxuICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cignaWQnKSB8fCAkKHRoaXMpLmRhdGEoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuY29sbGVjdGlvbi5nZXQoaWQpO1xyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdkZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdwcm9wZXJ0aWVzJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBNb2RhbEVkaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsIDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MgOiBzZWxmLnNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnY29tbWVudHMnKXtcclxuICAgICAgICAgICAgICAgIG5ldyBDb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgOiBtb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyA6IHNlbGYuc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIH0pLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soZGF0YSwgJ2Fib3ZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QmVsb3cnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkIDogaWRcclxuICAgICAgICAgICAgICAgIH0sICdiZWxvdycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdpbmRlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24uaW5kZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLm91dGRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICBcInJvd0Fib3ZlXCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEFib3ZlXCIsIGljb246IFwiYWJvdmVcIiB9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHsgbmFtZTogXCImbmJzcDtOZXcgUm93IEJlbG93XCIsIGljb246IFwiYmVsb3dcIiB9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7SW5kZW50IFJvd1wiLCBpY29uOiBcImluZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7IG5hbWU6IFwiJm5ic3A7T3V0ZGVudCBSb3dcIiwgaWNvbjogXCJvdXRkZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7IG5hbWU6IFwiJm5ic3A7UHJvcGVydGllc1wiLCBpY29uOiBcInByb3BlcnRpZXNcIiB9LFxyXG4gICAgICAgICAgICBcImNvbW1lbnRzXCI6IHsgbmFtZTogXCImbmJzcDtDb21tZW50c1wiLCBpY29uOiBcImNvbW1lbnRcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjogeyBuYW1lOiBcIiZuYnNwO0RlbGV0ZSBSb3dcIiwgaWNvbjogXCJkZWxldGVcIiB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Db250ZXh0TWVudVZpZXcucHJvdG90eXBlLmFkZFRhc2sgPSBmdW5jdGlvbihkYXRhLCBpbnNlcnRQb3MpIHtcclxuICAgIHZhciBzb3J0aW5kZXggPSAwO1xyXG4gICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGFzay5zYXZlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHRNZW51VmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWUgOiAnRGF0ZVBpY2tlcicsXHJcbiAgICBjb21wb25lbnREaWRNb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKHtcclxuLy8gICAgICAgICAgICBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCIsXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdCxcclxuICAgICAgICAgICAgb25TZWxlY3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5nZXRET01Ob2RlKCkudmFsdWUuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBEYXRlKGRhdGVbMl0gKyAnLScgKyBkYXRlWzFdICsgJy0nICsgZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIDogdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcignc2hvdycpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ2Rlc3Ryb3knKTtcclxuICAgIH0sXHJcbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUgOiBmdW5jdGlvbigpIHtcclxuLy8gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvbW0veXknKTtcclxuICAgICAgICB2YXIgZGF0ZVN0ciA9ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgdGhpcy5wcm9wcy52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkudmFsdWUgPSBkYXRlU3RyO1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoIFwicmVmcmVzaFwiICk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuLy8gICAgICAgICAgICBkZWZhdWx0VmFsdWUgOiB0aGlzLnByb3BzLnZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5JylcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlIDogJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5wcm9wcy5kYXRlRm9ybWF0LCB0aGlzLnByb3BzLnZhbHVlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcclxuIiwidmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xyXG5cclxudmFyIE5lc3RlZFRhc2sgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZTogJ05lc3RlZFRhc2snLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZTpoaWRkZW4gY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN1YnRhc2tzID0gdGhpcy5wcm9wcy5tb2RlbC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAgaXNTdWJUYXNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGFzay5jaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1YlRhc2s6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICd0YXNrLWxpc3QtY29udGFpbmVyIGRyYWctaXRlbScgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKSxcclxuICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnOiB0aGlzLnByb3BzLm1vZGVsLmNpZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRoaXMucHJvcHMubW9kZWwuY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLnByb3BzLm1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXRcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdzdWItdGFzay1saXN0IHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VidGFza3NcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2s7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xyXG52YXIgTmVzdGVkVGFzayA9IHJlcXVpcmUoJy4vTmVzdGVkVGFzaycpO1xyXG5cclxuZnVuY3Rpb24gZ2V0RGF0YShjb250YWluZXIpIHtcclxuICAgIHZhciBkYXRhID0gW107XHJcbiAgICB2YXIgY2hpbGRyZW4gPSAkKCc8b2w+JyArIGNvbnRhaW5lci5nZXQoMCkuaW5uZXJIVE1MICsgJzwvb2w+JykuY2hpbGRyZW4oKTtcclxuICAgIF8uZWFjaChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICB2YXIgJGNoaWxkID0gJChjaGlsZCk7XHJcbiAgICAgICAgdmFyIG9iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiAkY2hpbGQuZGF0YSgnaWQnKSxcclxuICAgICAgICAgICAgY2hpbGRyZW4gOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHN1Ymxpc3QgPSAkY2hpbGQuZmluZCgnb2wnKTtcclxuICAgICAgICBpZiAoc3VibGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqLmNoaWxkcmVuID0gZ2V0RGF0YShzdWJsaXN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5wdXNoKG9iaik7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBkYXRhO1xyXG59XHJcblxyXG52YXIgU2lkZVBhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWU6ICdTaWRlUGFuZWwnLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdhZGQgcmVtb3ZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLl9tYWtlU29ydGFibGUoKTtcclxuICAgIH0sXHJcbiAgICBfbWFrZVNvcnRhYmxlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoJy50YXNrLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGNvbnRhaW5lci5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgIGdyb3VwOiAnc29ydGFibGUnLFxyXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3RvciA6ICdvbCcsXHJcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXIgc29ydC1wbGFjZWhvbGRlclwiLz4nLFxyXG4gICAgICAgICAgICBvbkRyYWdTdGFydCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyYWcgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGdldERhdGEoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlciA9ICQoJzxkaXY+Jyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kIDogJ2dyZXknLFxyXG4gICAgICAgICAgICBvcGFjaXR5IDogJzAuNScsXHJcbiAgICAgICAgICAgIHRvcCA6ICcwJyxcclxuICAgICAgICAgICAgd2lkdGggOiAnMTAwJSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZW92ZXIoZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHJld3JpdGUgdG8gZmluZCBjbG9zZXN0IHVsXHJcbiAgICAgICAgICAgIGlmICghJGVsLmRhdGEoJ2lkJykpIHtcclxuICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICghJGVsLmRhdGEoJ2lkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZWwgPSAkZWwucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHBvcyA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcCA6IHBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogJGVsLmhlaWdodCgpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIHJlcXVlc3RVcGRhdGUgOiAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAod2FpdGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgICAgIHdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICB9KCkpLFxyXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnLnRhc2stY29udGFpbmVyJykuc29ydGFibGUoXCJkZXN0cm95XCIpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5IDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdkcmFnLWl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrLWNvbnRhaW5lciBzb3J0YWJsZSdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0YXNrc1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGVQYW5lbDtcclxuIiwidmFyIERhdGVQaWNrZXIgPSByZXF1aXJlKCcuL0RhdGVQaWNrZXInKTtcbnZhciBDb21tZXRzVmlldyA9IHJlcXVpcmUoJy4uL0NvbW1lbnRzVmlldycpO1xuXG52YXIgVGFza0l0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdUYXNrSXRlbScsXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVkaXRSb3c6IHVuZGVmaW5lZFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgZXZlbnRzID0gW1xuICAgICAgICAgICAgJ2NoYW5nZTpuYW1lJywgJ2NoYW5nZTpjb21wbGV0ZScsICdjaGFuZ2U6c3RhcnQnLFxuICAgICAgICAgICAgJ2NoYW5nZTplbmQnLCAnY2hhbmdlOmR1cmF0aW9uJywgJ2NoYW5nZTpoaWdodGxpZ2h0JyxcbiAgICAgICAgICAgICdjaGFuZ2U6Q29tbWVudHMnXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oZXZlbnRzLmpvaW4oJyAnKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcbiAgICB9LFxuICAgIF9maW5kTmVzdGVkTGV2ZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGV2ZWwgPSAwO1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wcm9wcy5tb2RlbC5wYXJlbnQ7XG4gICAgICAgIHdoaWxlKHRydWUpIHtcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldmVsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV2ZWwrKztcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9jcmVhdGVGaWVsZDogZnVuY3Rpb24oY29sKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRSb3cgPT09IGNvbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVkaXRGaWVsZChjb2wpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywge30sIHRoaXMuX2NyZWF0ZVJlYWRGaWxlZChjb2wpKTtcbiAgICB9LFxuICAgIF9jcmVhdGVSZWFkRmlsZWQ6IGZ1bmN0aW9uKGNvbCkge1xuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICBpZiAoY29sID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KGNvbCkgKyAnJSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5wcm9wcy5kYXRlRm9ybWF0LCBtb2RlbC5nZXQoY29sKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA9PT0gJ2R1cmF0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuZ2V0KCdzdGFydCcpLCBtb2RlbC5nZXQoJ2VuZCcpKSArICcgZCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpO1xuICAgIH0sXG4gICAgX2NyZWF0ZURhdGVFbGVtZW50OiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICBrZXk6IGNvbCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfZHVyYXRpb25DaGFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBudW1iZXIgPSBwYXJzZUludCh2YWx1ZS5yZXBsYWNlKCAvXlxcRCsvZywgJycpLCAxMCk7XG4gICAgICAgIGlmICghbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJ3cnKSA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRXZWVrcyhudW1iZXIpKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5pbmRleE9mKCdtJykgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkTW9udGhzKG51bWJlcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbnVtYmVyLS07XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKG51bWJlcikpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBfY3JlYXRlRHVyYXRpb25GaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSBEYXRlLmRheXNkaWZmKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnZW5kJykpICsgJyBkJztcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsIHx8IHZhbCxcbiAgICAgICAgICAgIGtleTogJ2R1cmF0aW9uJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2R1cmF0aW9uQ2hhbmdlKG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS52YWwgPSBuZXdWYWw7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbktleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS52YWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfY3JlYXRlRWRpdEZpZWxkOiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XG4gICAgICAgIGlmIChjb2wgPT09ICdzdGFydCcgfHwgY29sID09PSAnZW5kJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZURhdGVFbGVtZW50KGNvbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA9PT0gJ2R1cmF0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUR1cmF0aW9uRmllbGQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICduYW1lSW5wdXQnLFxuICAgICAgICAgICAgdmFsdWU6IHZhbCxcbiAgICAgICAgICAgIGtleTogY29sLFxuICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoY29sLCBuZXdWYWwpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgb25LZXlEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uQmx1cjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlQ29tbWVudEZpZWxkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1lbnRzID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ0NvbW1lbnRzJykgfHwgMDtcbiAgICAgICAgaWYgKCFjb21tZW50cykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgIGtleTogJ2NvbW1lbnRzJyxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjb2wtY29tbWVudHMnLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBuZXcgQ29tbWV0c1ZpZXcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMucHJvcHMubW9kZWxcbiAgICAgICAgICAgICAgICAgICAgfSkucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaW1nJywge1xuICAgICAgICAgICAgICAgIHNyYzogJ2Nzcy9pbWFnZXMvY29tbWVudHMucG5nJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjb21tZW50c1xuICAgICAgICApO1xuICAgIH0sXG4gICAgc2hvd0NvbnRleHQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRlbCA9ICQoZS50YXJnZXQpO1xuICAgICAgICB2YXIgdWwgPSAkZWwucGFyZW50KCk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCk7XG4gICAgICAgIHVsLmNvbnRleHRNZW51KHtcbiAgICAgICAgICAgIHg6IG9mZnNldC5sZWZ0ICsgMjAsXG4gICAgICAgICAgICB5OiBvZmZzZXQudG9wXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZmluZFJhdzogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gZS50YXJnZXQucGFyZW50Tm9kZS5jbGFzc05hbWU7XG4gICAgICAgIGlmICghY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBjbGFzc05hbWUgPSBlLnRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGUuY2xhc3NOYW1lO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb2wgPSBjbGFzc05hbWUuc2xpY2UoNCwgY2xhc3NOYW1lLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBjb2w7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgndWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3Rhc2snXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyAodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpID8gJyBjb2xsYXBzZWQnIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgKHRoaXMucHJvcHMubW9kZWwuaXNOZXN0ZWQoKSA/ICcgbmVzdGVkJyA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgb25Eb3VibGVDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJvdyA9IHRoaXMuZmluZFJhdyhlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRSb3c6IHJvd1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgLy8gb25DbGljazogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHNlbGVjdGVkQ29sOiB0aGlzLmZpbmRSYXcoZSlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcic6IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdoaWdodGxpZ2h0JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2luZm8nLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjb2wtaW5mbydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbWcnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6ICdjc3MvaW1hZ2VzL2luZm8ucG5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuc2hvd0NvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdzb3J0aW5kZXgnLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjb2wtc29ydGluZGV4J1xuICAgICAgICAgICAgICAgIH0sIG1vZGVsLmdldCgnc29ydGluZGV4JykgKyAxKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogJ25hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sLW5hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogKHRoaXMuX2ZpbmROZXN0ZWRMZXZlbCgpICogMTApICsgJ3B4J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLmlzTmVzdGVkKCkgPyBSZWFjdC5jcmVhdGVFbGVtZW50KCdpJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAndHJpYW5nbGUgaWNvbiAnICsgKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSA/ICdyaWdodCcgOiAnZG93bicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2NvbGxhcHNlZCcsICF0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIH0pIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRmllbGQoJ25hbWUnKSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29tbWVudEZpZWxkKCksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2NvbXBsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sLWNvbXBsZXRlJ1xuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdjb21wbGV0ZScpKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjb2wtc3RhcnQnXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ3N0YXJ0JykpLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlbmQnLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjb2wtZW5kJ1xuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdlbmQnKSksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2R1cmF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sLWR1cmF0aW9uJ1xuICAgICAgICAgICAgICAgIH0sIHRoaXMuX2NyZWF0ZUZpZWxkKCdkdXJhdGlvbicpKVxuICAgICAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbTtcbiJdfQ==
