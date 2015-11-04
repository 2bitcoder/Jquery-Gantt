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
        var level = 0;
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
            return this.parent.children.models.indexOf(this);
        }

        var number = 0;
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


var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n<Project xmlns=\"http://schemas.microsoft.com/project\">\r\n    <SaveVersion>14</SaveVersion>\r\n    <Name>Gantt Tasks.xml</Name>\r\n    <Title>Gantt Tasks</Title>\r\n    <CreationDate><%= currentDate %></CreationDate>\r\n    <LastSaved><%= currentDate %></LastSaved>\r\n    <ScheduleFromStart>1</ScheduleFromStart>\r\n    <StartDate><%= startDate %></StartDate>\r\n    <FinishDate><%= finishDate %></FinishDate>\r\n    <FYStartDate>1</FYStartDate>\r\n    <CriticalSlackLimit>0</CriticalSlackLimit>\r\n    <CurrencyDigits>2</CurrencyDigits>\r\n    <CurrencySymbol>$</CurrencySymbol>\r\n    <CurrencyCode>USD</CurrencyCode>\r\n    <CurrencySymbolPosition>0</CurrencySymbolPosition>\r\n    <CalendarUID>1</CalendarUID>\r\n    <DefaultStartTime>08:00:00</DefaultStartTime>\r\n    <DefaultFinishTime>17:00:00</DefaultFinishTime>\r\n    <MinutesPerDay>480</MinutesPerDay>\r\n    <MinutesPerWeek>2400</MinutesPerWeek>\r\n    <DaysPerMonth>20</DaysPerMonth>\r\n    <DefaultTaskType>0</DefaultTaskType>\r\n    <DefaultFixedCostAccrual>3</DefaultFixedCostAccrual>\r\n    <DefaultStandardRate>0</DefaultStandardRate>\r\n    <DefaultOvertimeRate>0</DefaultOvertimeRate>\r\n    <DurationFormat>7</DurationFormat>\r\n    <WorkFormat>2</WorkFormat>\r\n    <EditableActualCosts>0</EditableActualCosts>\r\n    <HonorConstraints>0</HonorConstraints>\r\n    <InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>\r\n    <MultipleCriticalPaths>0</MultipleCriticalPaths>\r\n    <NewTasksEffortDriven>1</NewTasksEffortDriven>\r\n    <NewTasksEstimated>1</NewTasksEstimated>\r\n    <SplitsInProgressTasks>1</SplitsInProgressTasks>\r\n    <SpreadActualCost>0</SpreadActualCost>\r\n    <SpreadPercentComplete>0</SpreadPercentComplete>\r\n    <TaskUpdatesResource>1</TaskUpdatesResource>\r\n    <FiscalYearStart>0</FiscalYearStart>\r\n    <WeekStartDay>0</WeekStartDay>\r\n    <MoveCompletedEndsBack>0</MoveCompletedEndsBack>\r\n    <MoveRemainingStartsBack>0</MoveRemainingStartsBack>\r\n    <MoveRemainingStartsForward>0</MoveRemainingStartsForward>\r\n    <MoveCompletedEndsForward>0</MoveCompletedEndsForward>\r\n    <BaselineForEarnedValue>0</BaselineForEarnedValue>\r\n    <AutoAddNewResourcesAndTasks>1</AutoAddNewResourcesAndTasks>\r\n    <CurrentDate><%= currentDate %></CurrentDate>\r\n    <MicrosoftProjectServerURL>1</MicrosoftProjectServerURL>\r\n    <Autolink>1</Autolink>\r\n    <NewTaskStartDate>0</NewTaskStartDate>\r\n    <NewTasksAreManual>0</NewTasksAreManual>\r\n    <DefaultTaskEVMethod>0</DefaultTaskEVMethod>\r\n    <ProjectExternallyEdited>0</ProjectExternallyEdited>\r\n    <ExtendedCreationDate>1984-01-01T00:00:00</ExtendedCreationDate>\r\n    <ActualsInSync>0</ActualsInSync>\r\n    <RemoveFileProperties>0</RemoveFileProperties>\r\n    <AdminProject>0</AdminProject>\r\n    <UpdateManuallyScheduledTasksWhenEditingLinks>1</UpdateManuallyScheduledTasksWhenEditingLinks>\r\n    <KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>0</KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>\r\n    <OutlineCodes/>\r\n    <WBSMasks/>\r\n    <ExtendedAttributes/>\r\n    <Calendars>\r\n        <Calendar>\r\n            <UID>1</UID>\r\n            <Name>Standard</Name>\r\n            <IsBaseCalendar>1</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>-1</BaseCalendarUID>\r\n            <WeekDays>\r\n                <WeekDay>\r\n                    <DayType>1</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>2</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>3</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>4</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>5</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>6</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>7</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n            </WeekDays>\r\n        </Calendar>\r\n    </Calendars>\r\n    <Tasks>\r\n        <Task>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Active>1</Active>\r\n            <Manual>0</Manual>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <CreateDate><%= startDate %></CreateDate>\r\n            <WBS>0</WBS>\r\n            <OutlineNumber>0</OutlineNumber>\r\n            <OutlineLevel>0</OutlineLevel>\r\n            <Priority>500</Priority>\r\n            <Start><%= startDate %></Start>\r\n            <Finish><%= finishDate %></Finish>\r\n            <Duration>PT104H0M0S</Duration>\r\n            <ManualStart><%= startDate %></ManualStart>\r\n            <ManualFinish><%= finishDate %></ManualFinish>\r\n            <ManualDuration>PT104H0M0S</ManualDuration>\r\n            <DurationFormat>53</DurationFormat>\r\n            <Work>PT0H0M0S</Work>\r\n            <ResumeValid>0</ResumeValid>\r\n            <EffortDriven>0</EffortDriven>\r\n            <Recurring>0</Recurring>\r\n            <OverAllocated>0</OverAllocated>\r\n            <Estimated>1</Estimated>\r\n            <Milestone>0</Milestone>\r\n            <Summary>1</Summary>\r\n            <DisplayAsSummary>0</DisplayAsSummary>\r\n            <Critical>1</Critical>\r\n            <IsSubproject>0</IsSubproject>\r\n            <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n            <ExternalTask>0</ExternalTask>\r\n            <EarlyStart><%= startDate %></EarlyStart>\r\n            <EarlyFinish><%= finishDate %></EarlyFinish>\r\n            <LateStart><%= startDate %></LateStart>\r\n            <LateFinish><%= finishDate %></LateFinish>\r\n            <StartVariance>0</StartVariance>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <FreeSlack>0</FreeSlack>\r\n            <TotalSlack>0</TotalSlack>\r\n            <StartSlack>0</StartSlack>\r\n            <FinishSlack>0</FinishSlack>\r\n            <FixedCost>0</FixedCost>\r\n            <FixedCostAccrual>3</FixedCostAccrual>\r\n            <PercentComplete>0</PercentComplete>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <Cost>0</Cost>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualDuration>PT0H0M0S</ActualDuration>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <RemainingDuration>PT104H0M0S</RemainingDuration>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <ACWP>0.00</ACWP>\r\n            <CV>0.00</CV>\r\n            <ConstraintType>0</ConstraintType>\r\n            <CalendarUID>-1</CalendarUID>\r\n            <LevelAssignments>1</LevelAssignments>\r\n            <LevelingCanSplit>1</LevelingCanSplit>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>8</LevelingDelayFormat>\r\n            <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n            <HideBar>0</HideBar>\r\n            <Rollup>0</Rollup>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n            <EarnedValueMethod>0</EarnedValueMethod>\r\n            <IsPublished>0</IsPublished>\r\n            <CommitmentType>0</CommitmentType>\r\n        </Task><% tasks.forEach(function(task){ %>\r\n        <Task>\r\n            <UID><%= task.id + 1%></UID>\r\n            <ID><%= task.id + 1%></ID>\r\n            <Name><%= task.name %></Name>\r\n            <Active>1</Active>\r\n            <Manual>0</Manual>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <CreateDate><%= task.start %></CreateDate>\r\n            <WBS><%= task.outlineNumber + 1 %></WBS>\r\n            <OutlineNumber><%= task.outlineNumber + 1 %></OutlineNumber>\r\n            <OutlineLevel><%= task.outlineLevel + 1 %></OutlineLevel>\r\n            <Priority>500</Priority>\r\n            <Start><%= task.start %></Start>\r\n            <Finish><%= task.finish %></Finish>\r\n            <Duration>PT766H0M0S</Duration>\r\n            <ManualStart><%= task.start %></ManualStart>\r\n            <ManualFinish><%= task.finish %></ManualFinish>\r\n            <ManualDuration>PT766H0M0S</ManualDuration>\r\n            <DurationFormat>21</DurationFormat>\r\n            <Work>PT1532H0M0S</Work>\r\n            <ResumeValid>0</ResumeValid>\r\n            <EffortDriven>0</EffortDriven>\r\n            <Recurring>0</Recurring>\r\n            <OverAllocated>0</OverAllocated>\r\n            <Estimated>1</Estimated>\r\n            <Milestone>0</Milestone>\r\n            <Summary>1</Summary>\r\n            <DisplayAsSummary>0</DisplayAsSummary>\r\n            <Critical>1</Critical>\r\n            <IsSubproject>0</IsSubproject>\r\n            <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n            <ExternalTask>0</ExternalTask>\r\n            <EarlyStart><%= task.start %></EarlyStart>\r\n            <EarlyFinish><%= task.finish %></EarlyFinish>\r\n            <LateStart><%= task.start %></LateStart>\r\n            <LateFinish><%= task.finish %></LateFinish>\r\n            <StartVariance>0</StartVariance>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <FreeSlack>0</FreeSlack>\r\n            <TotalSlack>0</TotalSlack>\r\n            <StartSlack>0</StartSlack>\r\n            <FinishSlack>0</FinishSlack>\r\n            <FixedCost>0</FixedCost>\r\n            <FixedCostAccrual>3</FixedCostAccrual>\r\n            <PercentComplete>0</PercentComplete>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <Cost>0</Cost>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualDuration>PT0H0M0S</ActualDuration>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RegularWork>PT1532H0M0S</RegularWork>\r\n            <RemainingDuration>PT766H0M0S</RemainingDuration>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingWork>PT1532H0M0S</RemainingWork>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <ACWP>0.00</ACWP>\r\n            <CV>0.00</CV>\r\n            <ConstraintType>0</ConstraintType>\r\n            <CalendarUID>-1</CalendarUID>\r\n            <LevelAssignments>1</LevelAssignments>\r\n            <LevelingCanSplit>1</LevelingCanSplit>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>8</LevelingDelayFormat>\r\n            <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n            <HideBar>0</HideBar>\r\n            <Rollup>0</Rollup>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n            <EarnedValueMethod>0</EarnedValueMethod><% if (task.depend !== undefined) {%>\r\n            <PredecessorLink>\r\n                <PredecessorUID><%= task.depend + 1 %></PredecessorUID>\r\n                <Type>1</Type>\r\n                <CrossProject>0</CrossProject>\r\n                <LinkLag>0</LinkLag>\r\n                <LagFormat>7</LagFormat>\r\n            </PredecessorLink><% } %> \r\n            <IsPublished>0</IsPublished>\r\n            <CommitmentType>0</CommitmentType>\r\n        </Task><% }); %>\r\n    </Tasks>\r\n    <Resources>\r\n        <Resource>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <WorkGroup>0</WorkGroup>\r\n            <MaxUnits>1.00</MaxUnits>\r\n            <PeakUnits>0.00</PeakUnits>\r\n            <OverAllocated>0</OverAllocated>\r\n            <CanLevel>1</CanLevel>\r\n            <AccrueAt>3</AccrueAt>\r\n            <Work>PT0H0M0S</Work>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <StandardRate>0</StandardRate>\r\n            <StandardRateFormat>2</StandardRateFormat>\r\n            <Cost>0</Cost>\r\n            <OvertimeRate>0</OvertimeRate>\r\n            <OvertimeRateFormat>2</OvertimeRateFormat>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <CostPerUse>0</CostPerUse>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <CostVariance>0</CostVariance>\r\n            <SV>0.00</SV>\r\n            <CV>0.00</CV>\r\n            <ACWP>0.00</ACWP>\r\n            <CalendarUID>2</CalendarUID>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <IsGeneric>0</IsGeneric>\r\n            <IsInactive>0</IsInactive>\r\n            <IsEnterprise>0</IsEnterprise>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate><%= currentDate %></CreationDate>\r\n            <IsCostResource>0</IsCostResource>\r\n            <IsBudget>0</IsBudget>\r\n        </Resource>\r\n    </Resources>\r\n    <Assignments/>\r\n</Project>\r\n";
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

        console.log(task.get("depend"));
        var depend = _.map(task.get("depend"), function (id) {
            return tasks.get(id).get("sortindex");
        });

        return {
            id: task.get("sortindex"),
            name: task.get("name"),
            outlineNumber: task.getOutlineNumber(),
            outlineLevel: task.getOutlineLevel(),
            start: cut(task.get("start")),
            finish: cut(task.get("end")),
            depend: depend[0]
        };
    });
    return compiled({
        tasks: data,
        currentDate: cut(new Date()),
        startDate: cut(start),
        finishDate: cut(end)
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
        this.stage.find(".grid,.topBar").cache({
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
        sortindex = this.collection.last().get("sortindex") + 1;
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get("parentid");
    var task = this.collection.add(data, { parse: true });
    this.collection.checkSortedIndex();
    task.save();
};

module.exports = ContextMenuView;

},{"../CommentsView":11,"../ModalTaskEditView":13}],28:[function(require,module,exports){
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
                    selectedModelCid: _this.props.selectedModelCid
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
                selectedRow: _this.props.selectedModelCid === task.cid && _this.props.selectedRow
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
            selectedRow: this.props.selectedModelCid === this.props.model.cid && this.props.selectedRow
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
    onKeyDown: function onKeyDown(e) {
        if (e.target.tagName === "INPUT") {
            return;
        }
        e.preventDefault();
        var rows = ["name", "complete", "start", "end", "duration"];
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
                    selectedModelCid: _this.state.selectedModelCid
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
                    selectedRow: _this.state.selectedModelCid === task.cid && _this.state.selectedRow
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

},{"./NestedTask":29,"./TaskItem":31}],31:[function(require,module,exports){
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
        $input.focus();
        // move cursor to the end of input. Tip from:
        // http://stackoverflow.com/questions/511088/use-javascript-to-place-cursor-at-end-of-text-in-text-input-element
        var val = $input.val(); //store the value of the element
        $input.val(""); //clear the value of the element
        $input.val(val); //set that value back.
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
        return this.props.model.getOutlineLevel();
    },
    _createField: function _createField(col) {
        var isColInEdit = this.props.editedRow === col;
        if (isColInEdit) {
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
                if (e.keyCode === 13 || e.keyCode === 27) {
                    this.props.onEditRow(this.props.model.cid, null);
                    this.props.model.save();
                }
            }).bind(this),
            onBlur: (function () {
                this.props.onEditRow(this.props.model.cid, null);
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
                React.createElement("img", { src: "css/images/info.png", onClick: this.onClick })
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
            )
        );
    }
});

module.exports = TaskItem;

},{"../CommentsView":11,"./DatePicker":28}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvbm9kZV9tb2R1bGVzL2JhYmVsL2V4dGVybmFsLWhlbHBlcnMuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NsaWVudENvbmZpZy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9jb2xsZWN0aW9ucy9UYXNrQ29sbGVjdGlvbi5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvZmFrZV9jNGEzMjk2OC5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Jlc291cmNlUmVmZXJlbmNlLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy94bWxXb3JrZXIuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0NvbW1lbnRzVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Nb2RhbFRhc2tFZGl0Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvTm90aWZpY2F0aW9ucy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvUmVzb3VyY2VzRWRpdG9yLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L01pc2NNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOzs7Ozs7O0FDRkEsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFakMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFN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QUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMvQyxZQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNyRSxZQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRTtBQUN0QyxnQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM1RCxNQUFNO0FBQ0gsZ0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDcEQ7QUFDRCxZQUFJLEFBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRTtBQUN0RCxnQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM3RCxNQUFNO0FBQ0gsZ0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckQ7O0FBRUQscUJBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxlQUFPLElB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QVksQ0FBQyxPQUFPLENBQUM7YUFDMUI7WUFDTDs7a0JBQUksR0FBRyxFQUFDLEtBQUssRUFBQyxTQUFTLEVBQUMsa0JBQWtCLEVBQUMsWUFBUyxLQUFLO0FBQ3JELHlCQUFLLEVBQUUsRUFBQyxTQUFTLEVBQUUsV0FBVyxLQUFLLEtBQUssR0FBRyxZQUFZLEdBQUcsSUFBSSxFQUFDLEFBQUM7O2dCQUUvRCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQzthQUN4QjtZQUNMOztrQkFBSSxHQUFHLEVBQUMsVUFBVSxFQUFDLFNBQVMsRUFBQyx1QkFBdUIsRUFBQyxZQUFTLFVBQVU7QUFDcEUseUJBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxXQUFXLEtBQUssVUFBVSxHQUFHLFlBQVksR0FBRyxJQUFJLEVBQUMsQUFBQzs7Z0JBRXBFLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDO2FBQzdCO1NBQ0osQ0FDUDtLQUNMO0NBQ0osQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbihmdW5jdGlvbihnbG9iYWwpe3ZhciBiYWJlbEhlbHBlcnM9Z2xvYmFsLmJhYmVsSGVscGVycz17fTtiYWJlbEhlbHBlcnMuaW5oZXJpdHM9ZnVuY3Rpb24oc3ViQ2xhc3Msc3VwZXJDbGFzcyl7aWYodHlwZW9mIHN1cGVyQ2xhc3MhPT1cImZ1bmN0aW9uXCImJnN1cGVyQ2xhc3MhPT1udWxsKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2Ygc3VwZXJDbGFzcyl9c3ViQ2xhc3MucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyYmc3VwZXJDbGFzcy5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTpzdWJDbGFzcyxlbnVtZXJhYmxlOmZhbHNlLHdyaXRhYmxlOnRydWUsY29uZmlndXJhYmxlOnRydWV9fSk7aWYoc3VwZXJDbGFzcylzdWJDbGFzcy5fX3Byb3RvX189c3VwZXJDbGFzc307YmFiZWxIZWxwZXJzLmRlZmF1bHRzPWZ1bmN0aW9uKG9iaixkZWZhdWx0cyl7dmFyIGtleXM9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZGVmYXVsdHMpO2Zvcih2YXIgaT0wO2k8a2V5cy5sZW5ndGg7aSsrKXt2YXIga2V5PWtleXNbaV07dmFyIHZhbHVlPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmYXVsdHMsa2V5KTtpZih2YWx1ZSYmdmFsdWUuY29uZmlndXJhYmxlJiZvYmpba2V5XT09PXVuZGVmaW5lZCl7T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaixrZXksdmFsdWUpfX1yZXR1cm4gb2JqfTtiYWJlbEhlbHBlcnMuY3JlYXRlQ2xhc3M9ZnVuY3Rpb24oKXtmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl7Zm9yKHZhciBrZXkgaW4gcHJvcHMpe3ZhciBwcm9wPXByb3BzW2tleV07cHJvcC5jb25maWd1cmFibGU9dHJ1ZTtpZihwcm9wLnZhbHVlKXByb3Aud3JpdGFibGU9dHJ1ZX1PYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQscHJvcHMpfXJldHVybiBmdW5jdGlvbihDb25zdHJ1Y3Rvcixwcm90b1Byb3BzLHN0YXRpY1Byb3BzKXtpZihwcm90b1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLHByb3RvUHJvcHMpO2lmKHN0YXRpY1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3Isc3RhdGljUHJvcHMpO3JldHVybiBDb25zdHJ1Y3Rvcn19KCk7YmFiZWxIZWxwZXJzLmNyZWF0ZUNvbXB1dGVkQ2xhc3M9ZnVuY3Rpb24oKXtmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl7Zm9yKHZhciBpPTA7aTxwcm9wcy5sZW5ndGg7aSsrKXt2YXIgcHJvcD1wcm9wc1tpXTtwcm9wLmNvbmZpZ3VyYWJsZT10cnVlO2lmKHByb3AudmFsdWUpcHJvcC53cml0YWJsZT10cnVlO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQscHJvcC5rZXkscHJvcCl9fXJldHVybiBmdW5jdGlvbihDb25zdHJ1Y3Rvcixwcm90b1Byb3BzLHN0YXRpY1Byb3BzKXtpZihwcm90b1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLHByb3RvUHJvcHMpO2lmKHN0YXRpY1Byb3BzKWRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3Isc3RhdGljUHJvcHMpO3JldHVybiBDb25zdHJ1Y3Rvcn19KCk7YmFiZWxIZWxwZXJzLmFwcGx5Q29uc3RydWN0b3I9ZnVuY3Rpb24oQ29uc3RydWN0b3IsYXJncyl7dmFyIGluc3RhbmNlPU9iamVjdC5jcmVhdGUoQ29uc3RydWN0b3IucHJvdG90eXBlKTt2YXIgcmVzdWx0PUNvbnN0cnVjdG9yLmFwcGx5KGluc3RhbmNlLGFyZ3MpO3JldHVybiByZXN1bHQhPW51bGwmJih0eXBlb2YgcmVzdWx0PT1cIm9iamVjdFwifHx0eXBlb2YgcmVzdWx0PT1cImZ1bmN0aW9uXCIpP3Jlc3VsdDppbnN0YW5jZX07YmFiZWxIZWxwZXJzLnRhZ2dlZFRlbXBsYXRlTGl0ZXJhbD1mdW5jdGlvbihzdHJpbmdzLHJhdyl7cmV0dXJuIE9iamVjdC5mcmVlemUoT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RyaW5ncyx7cmF3Ont2YWx1ZTpPYmplY3QuZnJlZXplKHJhdyl9fSkpfTtiYWJlbEhlbHBlcnMudGFnZ2VkVGVtcGxhdGVMaXRlcmFsTG9vc2U9ZnVuY3Rpb24oc3RyaW5ncyxyYXcpe3N0cmluZ3MucmF3PXJhdztyZXR1cm4gc3RyaW5nc307YmFiZWxIZWxwZXJzLmludGVyb3BSZXF1aXJlPWZ1bmN0aW9uKG9iail7cmV0dXJuIG9iaiYmb2JqLl9fZXNNb2R1bGU/b2JqW1wiZGVmYXVsdFwiXTpvYmp9O2JhYmVsSGVscGVycy50b0FycmF5PWZ1bmN0aW9uKGFycil7cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKT9hcnI6QXJyYXkuZnJvbShhcnIpfTtiYWJlbEhlbHBlcnMudG9Db25zdW1hYmxlQXJyYXk9ZnVuY3Rpb24oYXJyKXtpZihBcnJheS5pc0FycmF5KGFycikpe2Zvcih2YXIgaT0wLGFycjI9QXJyYXkoYXJyLmxlbmd0aCk7aTxhcnIubGVuZ3RoO2krKylhcnIyW2ldPWFycltpXTtyZXR1cm4gYXJyMn1lbHNle3JldHVybiBBcnJheS5mcm9tKGFycil9fTtiYWJlbEhlbHBlcnMuc2xpY2VkVG9BcnJheT1mdW5jdGlvbihhcnIsaSl7aWYoQXJyYXkuaXNBcnJheShhcnIpKXtyZXR1cm4gYXJyfWVsc2UgaWYoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKXt2YXIgX2Fycj1bXTtmb3IodmFyIF9pdGVyYXRvcj1hcnJbU3ltYm9sLml0ZXJhdG9yXSgpLF9zdGVwOyEoX3N0ZXA9X2l0ZXJhdG9yLm5leHQoKSkuZG9uZTspe19hcnIucHVzaChfc3RlcC52YWx1ZSk7aWYoaSYmX2Fyci5sZW5ndGg9PT1pKWJyZWFrfXJldHVybiBfYXJyfWVsc2V7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIil9fTtiYWJlbEhlbHBlcnMub2JqZWN0V2l0aG91dFByb3BlcnRpZXM9ZnVuY3Rpb24ob2JqLGtleXMpe3ZhciB0YXJnZXQ9e307Zm9yKHZhciBpIGluIG9iail7aWYoa2V5cy5pbmRleE9mKGkpPj0wKWNvbnRpbnVlO2lmKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLGkpKWNvbnRpbnVlO3RhcmdldFtpXT1vYmpbaV19cmV0dXJuIHRhcmdldH07YmFiZWxIZWxwZXJzLmhhc093bj1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O2JhYmVsSGVscGVycy5zbGljZT1BcnJheS5wcm90b3R5cGUuc2xpY2U7YmFiZWxIZWxwZXJzLmJpbmQ9RnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ7YmFiZWxIZWxwZXJzLmRlZmluZVByb3BlcnR5PWZ1bmN0aW9uKG9iaixrZXksdmFsdWUpe3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLGtleSx7dmFsdWU6dmFsdWUsZW51bWVyYWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlLHdyaXRhYmxlOnRydWV9KX07YmFiZWxIZWxwZXJzLmFzeW5jVG9HZW5lcmF0b3I9ZnVuY3Rpb24oZm4pe3JldHVybiBmdW5jdGlvbigpe3ZhciBnZW49Zm4uYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLHJlamVjdCl7dmFyIGNhbGxOZXh0PXN0ZXAuYmluZChudWxsLFwibmV4dFwiKTt2YXIgY2FsbFRocm93PXN0ZXAuYmluZChudWxsLFwidGhyb3dcIik7ZnVuY3Rpb24gc3RlcChrZXksYXJnKXt0cnl7dmFyIGluZm89Z2VuW2tleV0oYXJnKTt2YXIgdmFsdWU9aW5mby52YWx1ZX1jYXRjaChlcnJvcil7cmVqZWN0KGVycm9yKTtyZXR1cm59aWYoaW5mby5kb25lKXtyZXNvbHZlKHZhbHVlKX1lbHNle1Byb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihjYWxsTmV4dCxjYWxsVGhyb3cpfX1jYWxsTmV4dCgpfSl9fTtiYWJlbEhlbHBlcnMuaW50ZXJvcFJlcXVpcmVXaWxkY2FyZD1mdW5jdGlvbihvYmope3JldHVybiBvYmomJm9iai5fX2VzTW9kdWxlP29iajp7XCJkZWZhdWx0XCI6b2JqfX07YmFiZWxIZWxwZXJzLl90eXBlb2Y9ZnVuY3Rpb24ob2JqKXtyZXR1cm4gb2JqJiZvYmouY29uc3RydWN0b3I9PT1TeW1ib2w/XCJzeW1ib2xcIjp0eXBlb2Ygb2JqfTtiYWJlbEhlbHBlcnMuX2V4dGVuZHM9T2JqZWN0LmFzc2lnbnx8ZnVuY3Rpb24odGFyZ2V0KXtmb3IodmFyIGk9MTtpPGFyZ3VtZW50cy5sZW5ndGg7aSsrKXt2YXIgc291cmNlPWFyZ3VtZW50c1tpXTtmb3IodmFyIGtleSBpbiBzb3VyY2Upe2lmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2Usa2V5KSl7dGFyZ2V0W2tleV09c291cmNlW2tleV19fX1yZXR1cm4gdGFyZ2V0fTtiYWJlbEhlbHBlcnMuZ2V0PWZ1bmN0aW9uIGdldChvYmplY3QscHJvcGVydHkscmVjZWl2ZXIpe3ZhciBkZXNjPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LHByb3BlcnR5KTtpZihkZXNjPT09dW5kZWZpbmVkKXt2YXIgcGFyZW50PU9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO2lmKHBhcmVudD09PW51bGwpe3JldHVybiB1bmRlZmluZWR9ZWxzZXtyZXR1cm4gZ2V0KHBhcmVudCxwcm9wZXJ0eSxyZWNlaXZlcil9fWVsc2UgaWYoXCJ2YWx1ZVwiaW4gZGVzYyYmZGVzYy53cml0YWJsZSl7cmV0dXJuIGRlc2MudmFsdWV9ZWxzZXt2YXIgZ2V0dGVyPWRlc2MuZ2V0O2lmKGdldHRlcj09PXVuZGVmaW5lZCl7cmV0dXJuIHVuZGVmaW5lZH1yZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpfX07YmFiZWxIZWxwZXJzLnNldD1mdW5jdGlvbiBzZXQob2JqZWN0LHByb3BlcnR5LHZhbHVlLHJlY2VpdmVyKXt2YXIgZGVzYz1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCxwcm9wZXJ0eSk7aWYoZGVzYz09PXVuZGVmaW5lZCl7dmFyIHBhcmVudD1PYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtpZihwYXJlbnQhPT1udWxsKXtyZXR1cm4gc2V0KHBhcmVudCxwcm9wZXJ0eSx2YWx1ZSxyZWNlaXZlcil9fWVsc2UgaWYoXCJ2YWx1ZVwiaW4gZGVzYyYmZGVzYy53cml0YWJsZSl7cmV0dXJuIGRlc2MudmFsdWU9dmFsdWV9ZWxzZXt2YXIgc2V0dGVyPWRlc2Muc2V0O2lmKHNldHRlciE9PXVuZGVmaW5lZCl7cmV0dXJuIHNldHRlci5jYWxsKHJlY2VpdmVyLHZhbHVlKX19fTtiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2s9ZnVuY3Rpb24oaW5zdGFuY2UsQ29uc3RydWN0b3Ipe2lmKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3Rvcikpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9fTtiYWJlbEhlbHBlcnMub2JqZWN0RGVzdHJ1Y3R1cmluZ0VtcHR5PWZ1bmN0aW9uKG9iail7aWYob2JqPT1udWxsKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgZGVzdHJ1Y3R1cmUgdW5kZWZpbmVkXCIpfTtiYWJlbEhlbHBlcnMudGVtcG9yYWxVbmRlZmluZWQ9e307YmFiZWxIZWxwZXJzLnRlbXBvcmFsQXNzZXJ0RGVmaW5lZD1mdW5jdGlvbih2YWwsbmFtZSx1bmRlZil7aWYodmFsPT09dW5kZWYpe3Rocm93IG5ldyBSZWZlcmVuY2VFcnJvcihuYW1lK1wiIGlzIG5vdCBkZWZpbmVkIC0gdGVtcG9yYWwgZGVhZCB6b25lXCIpfXJldHVybiB0cnVlfTtiYWJlbEhlbHBlcnMuc2VsZkdsb2JhbD10eXBlb2YgZ2xvYmFsPT09XCJ1bmRlZmluZWRcIj9zZWxmOmdsb2JhbH0pKHR5cGVvZiBnbG9iYWw9PT1cInVuZGVmaW5lZFwiP3NlbGY6Z2xvYmFsKTtcbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwibGV0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL3V0aWwnKTtcclxubGV0IHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG5sZXQgdGFza3NTdWJVUkwgPSAnJztcclxuLy8gZGV0ZWN0IEFQSSBwYXJhbXMgZnJvbSBnZXQsIGUuZy4gP3Byb2plY3Q9MTQzJnByb2ZpbGU9MTcmc2l0ZWtleT0yYjAwZGE0NmI1N2MwMzk1XHJcbmlmIChwYXJhbXMucHJvamVjdCAmJiBwYXJhbXMucHJvZmlsZSAmJiBwYXJhbXMuc2l0ZWtleSkge1xyXG4gICAgdGFza3NTdWJVUkwgPSAnLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5wcm9maWxlICsgJy8nICsgcGFyYW1zLnNpdGVrZXk7XHJcbn1cclxuZXhwb3J0IGxldCB0YXNrc1VSTCA9ICdhcGkvdGFza3MvJyArIHRhc2tzU3ViVVJMO1xyXG5cclxuXHJcblxyXG5sZXQgY29uZmlnU3ViVVJMID0gJyc7XHJcbmlmICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5kZXhPZignbG9jYWxob3N0JykgPT09IC0xKSB7XHJcbiAgICBjb25maWdTdWJVUkwgPSAnL3dicy8nICsgcGFyYW1zLnByb2plY3QgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcclxufVxyXG5cclxuZXhwb3J0IGxldCBjb25maWdVUkwgPSAnL2FwaS9HYW50dENvbmZpZycgKyBjb25maWdTdWJVUkw7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlc291cmNlUmVmZXJlbmNlTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvUmVzb3VyY2VSZWZlcmVuY2UnKTtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblxudmFyIENvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgdXJsIDogJ2FwaS9yZXNvdXJjZXMvJyArIChwYXJhbXMucHJvamVjdCB8fCAxKSArICcvJyArIChwYXJhbXMucHJvZmlsZSB8fCAxKSxcblx0bW9kZWw6IFJlc291cmNlUmVmZXJlbmNlTW9kZWwsXG4gICAgaWRBdHRyaWJ1dGUgOiAnSUQnLFxuICAgIHVwZGF0ZVJlc291cmNlc0ZvclRhc2sgOiBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbGQgcmVmZXJlbmNlc1xuICAgICAgICB0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHJlZikge1xuICAgICAgICAgICAgaWYgKHJlZi5nZXQoJ1dCU0lEJykudG9TdHJpbmcoKSAhPT0gdGFzay5pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlzT2xkID0gdGFzay5nZXQoJ3Jlc291cmNlcycpLmluZGV4T2YocmVmLmdldCgnUmVzSUQnKSk7XG4gICAgICAgICAgICBpZiAoaXNPbGQpIHtcbiAgICAgICAgICAgICAgICByZWYuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgLy8gYWRkIG5ldyByZWZlcmVuY2VzXG4gICAgICAgIHRhc2suZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc0lkKSB7XG4gICAgICAgICAgICB2YXIgaXNFeGlzdCA9IHRoaXMuZmluZFdoZXJlKHtSZXNJRCA6IHJlc0lkfSk7XG4gICAgICAgICAgICBpZiAoIWlzRXhpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZCh7XG4gICAgICAgICAgICAgICAgICAgIFJlc0lEIDogcmVzSWQsXG4gICAgICAgICAgICAgICAgICAgIFdCU0lEIDogdGFzay5pZC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgcGFyc2UgOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCAgPSBbXTtcbiAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5SZXNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbihyZXNJdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHJlc0l0ZW07XG4gICAgICAgICAgICAgICAgb2JqLldCU0lEID0gaXRlbS5XQlNJRDtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChvYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb247XG5cbiIsInZhciBUYXNrTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGFza01vZGVsJyk7XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0dXJsOiAnYXBpL3Rhc2tzJyxcblx0bW9kZWw6IFRhc2tNb2RlbCxcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xuXHR9LFxuXHRjb21wYXJhdG9yOiBmdW5jdGlvbihtb2RlbCkge1xuXHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHR9LFxuXHRsaW5rQ2hpbGRyZW46IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBwYXJlbnRUYXNrID0gdGhpcy5nZXQodGFzay5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdFx0aWYgKHBhcmVudFRhc2spIHtcblx0XHRcdFx0aWYgKHBhcmVudFRhc2sgPT09IHRhc2spIHtcblx0XHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXJlbnRUYXNrLmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcigndGFzayBoYXMgcGFyZW50IHdpdGggaWQgJyArIHRhc2suZ2V0KCdwYXJlbnRpZCcpICsgJyAtIGJ1dCB0aGVyZSBpcyBubyBzdWNoIHRhc2snKTtcblx0XHRcdFx0dGFzay51bnNldCgncGFyZW50aWQnKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRfc29ydENoaWxkcmVuOiBmdW5jdGlvbiAodGFzaywgc29ydEluZGV4KSB7XG5cdFx0dGFzay5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0Y2hpbGQuc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9zb3J0Q2hpbGRyZW4oY2hpbGQsIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRjaGVja1NvcnRlZEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gLTE7XG5cdFx0dGhpcy50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGFzay5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbih0YXNrLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5zb3J0KCk7XG5cdH0sXG5cdF9yZXNvcnRDaGlsZHJlbjogZnVuY3Rpb24oZGF0YSwgc3RhcnRJbmRleCwgcGFyZW50SUQpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gc3RhcnRJbmRleDtcblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24odGFza0RhdGEpIHtcblx0XHRcdHZhciB0YXNrID0gdGhpcy5nZXQodGFza0RhdGEuaWQpO1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRJRCkge1xuXHRcdFx0XHR2YXIgbmV3UGFyZW50ID0gdGhpcy5nZXQocGFyZW50SUQpO1xuXHRcdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGFzay5zYXZlKHtcblx0XHRcdFx0c29ydGluZGV4OiArK3NvcnRJbmRleCxcblx0XHRcdFx0cGFyZW50aWQ6IHBhcmVudElEXG5cdFx0XHR9KTtcblx0XHRcdGlmICh0YXNrRGF0YS5jaGlsZHJlbiAmJiB0YXNrRGF0YS5jaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0c29ydEluZGV4ID0gdGhpcy5fcmVzb3J0Q2hpbGRyZW4odGFza0RhdGEuY2hpbGRyZW4sIHNvcnRJbmRleCwgdGFzay5pZCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRyZXNvcnQ6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG5cdFx0dGhpcy5fcmVzb3J0Q2hpbGRyZW4oZGF0YSwgLTEsIDApO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5zb3J0KCk7XG5cdH0sXG5cdHN1YnNjcmliZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ3Jlc2V0JywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gYWRkIGVtcHR5IHRhc2sgaWYgbm8gdGFza3MgZnJvbSBzZXJ2ZXJcbiAgICAgICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoW3tcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ05ldyB0YXNrJ1xuICAgICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IG1vZGVsLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0XHRtb2RlbC5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdjYW4gbm90IGZpbmQgcGFyZW50IHdpdGggaWQgJyArIG1vZGVsLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRcdFx0bW9kZWwuc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubGlua0NoaWxkcmVuKCk7XG5cdFx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0XHRcdHRoaXMuX2NoZWNrRGVwZW5kZW5jaWVzKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHRcdHRhc2sucGFyZW50LmNoaWxkcmVuLnJlbW92ZSh0YXNrKTtcblx0XHRcdFx0dGFzay5wYXJlbnQgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdG5ld1BhcmVudC5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuX3ByZXZlbnRTb3J0aW5nKSB7XG5cdFx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRjcmVhdGVEZXBlbmRlbmN5OiBmdW5jdGlvbiAoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpIHtcblx0XHRpZiAodGhpcy5fY2FuQ3JlYXRlRGVwZW5kZW5jZShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkpIHtcblx0XHRcdGFmdGVyTW9kZWwuZGVwZW5kT24oYmVmb3JlTW9kZWwpO1xuXHRcdH1cblx0fSxcblxuXHRfY2FuQ3JlYXRlRGVwZW5kZW5jZTogZnVuY3Rpb24oYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpIHtcblx0XHRpZiAoYmVmb3JlTW9kZWwuaGFzUGFyZW50KGFmdGVyTW9kZWwpIHx8IGFmdGVyTW9kZWwuaGFzUGFyZW50KGJlZm9yZU1vZGVsKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoYmVmb3JlTW9kZWwuaGFzSW5EZXBzKGFmdGVyTW9kZWwpIHx8XG5cdFx0XHRhZnRlck1vZGVsLmhhc0luRGVwcyhiZWZvcmVNb2RlbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdHJlbW92ZURlcGVuZGVuY3k6IGZ1bmN0aW9uKGFmdGVyTW9kZWwpIHtcblx0XHRhZnRlck1vZGVsLmNsZWFyRGVwZW5kZW5jZSgpO1xuXHR9LFxuXHRfY2hlY2tEZXBlbmRlbmNpZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWFjaCgodGFzaykgPT4ge1xuXHRcdFx0dmFyIGlkcyA9IHRhc2suZ2V0KCdkZXBlbmQnKS5jb25jYXQoW10pO1xuXHRcdFx0dmFyIGhhc0dvb2REZXBlbmRzID0gZmFsc2U7XG5cdFx0XHRpZiAoaWRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF8uZWFjaChpZHMsIChpZCkgPT4ge1xuXHRcdFx0XHR2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmdldChpZCk7XG5cdFx0XHRcdGlmIChiZWZvcmVNb2RlbCkge1xuXHRcdFx0XHRcdHRhc2suZGVwZW5kT24oYmVmb3JlTW9kZWwsIHRydWUpO1xuXHRcdFx0XHRcdGhhc0dvb2REZXBlbmRzID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIWhhc0dvb2REZXBlbmRzKSB7XG5cdFx0XHRcdHRhc2suc2F2ZSgnZGVwZW5kJywgW10pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRvdXRkZW50OiBmdW5jdGlvbih0YXNrKSB7XG5cdFx0dmFyIHVuZGVyU3VibGluZ3MgPSBbXTtcblx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdHRhc2sucGFyZW50LmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdFx0aWYgKGNoaWxkLmdldCgnc29ydGluZGV4JykgPD0gdGFzay5nZXQoJ3NvcnRpbmRleCcpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuZGVyU3VibGluZ3MucHVzaChjaGlsZCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG5cdFx0dW5kZXJTdWJsaW5ncy5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgICAgICBpZiAoY2hpbGQuZGVwZW5kcy5nZXQodGFzay5pZCkpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5jbGVhckRlcGVuZGVuY2UoKTtcbiAgICAgICAgICAgIH1cblx0XHRcdGNoaWxkLnNhdmUoJ3BhcmVudGlkJywgdGFzay5pZCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHRpZiAodGFzay5wYXJlbnQgJiYgdGFzay5wYXJlbnQucGFyZW50KSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgdGFzay5wYXJlbnQucGFyZW50LmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIDApO1xuXHRcdH1cblx0fSxcblx0aW5kZW50OiBmdW5jdGlvbih0YXNrKSB7XG5cdFx0dmFyIHByZXZUYXNrLCBpLCBtO1xuXHRcdGZvciAoaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdG0gPSB0aGlzLmF0KGkpO1xuXHRcdFx0aWYgKChtLmdldCgnc29ydGluZGV4JykgPCB0YXNrLmdldCgnc29ydGluZGV4JykpICYmICh0YXNrLnBhcmVudCA9PT0gbS5wYXJlbnQpKSB7XG5cdFx0XHRcdHByZXZUYXNrID0gbTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChwcmV2VGFzaykge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHByZXZUYXNrLmlkKTtcblx0XHR9XG5cdH0sXG4gICAgaW1wb3J0VGFza3M6IGZ1bmN0aW9uKHRhc2tKU09OYXJyYXksIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHNvcnRpbmRleCA9IDA7XG5cdFx0aWYgKHRoaXMubGFzdCgpKSB7XG5cdFx0XHRzb3J0aW5kZXggPSB0aGlzLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdH1cbiAgICAgICAgdGFza0pTT05hcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2tJdGVtKSB7XG4gICAgICAgICAgICB0YXNrSXRlbS5zb3J0aW5kZXggPSArK3NvcnRpbmRleDtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBsZW5ndGggPSB0YXNrSlNPTmFycmF5Lmxlbmd0aDtcbiAgICAgICAgdmFyIGRvbmUgPSAwO1xuICAgICAgICB0aGlzLmFkZCh0YXNrSlNPTmFycmF5LCB7cGFyc2U6IHRydWV9KS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHRhc2suc2F2ZSh7fSwge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkb25lICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb25lID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjcmVhdGVEZXBzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuICAgICAgICBkYXRhLnBhcmVudHMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5maW5kV2hlcmUoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0ucGFyZW50Lm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGl0ZW0ucGFyZW50Lm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5maW5kV2hlcmUoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0uY2hpbGQubmFtZSxcblx0XHRcdFx0b3V0bGluZTogaXRlbS5jaGlsZC5vdXRsaW5lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNoaWxkLnNhdmUoJ3BhcmVudGlkJywgcGFyZW50LmlkKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuXHRcdGRhdGEuZGVwcy5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuICAgICAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5maW5kV2hlcmUoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGRlcC5iZWZvcmUubmFtZSxcblx0XHRcdFx0b3V0bGluZTogZGVwLmJlZm9yZS5vdXRsaW5lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBhZnRlck1vZGVsID0gdGhpcy5maW5kV2hlcmUoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGRlcC5hZnRlci5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBkZXAuYWZ0ZXIub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZURlcGVuZGVuY3koYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0NvbGxlY3Rpb247XG4iLCJyZXF1aXJlKCdiYWJlbC9leHRlcm5hbC1oZWxwZXJzJyk7XG5cbmltcG9ydCBUYXNrQ29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb25zL1Rhc2tDb2xsZWN0aW9uJztcbmltcG9ydCBTZXR0aW5ncyBmcm9tICcuL21vZGVscy9TZXR0aW5nTW9kZWwnO1xuXG5pbXBvcnQgR2FudHRWaWV3IGZyb20gJy4vdmlld3MvR2FudHRWaWV3JztcbmltcG9ydCB7dGFza3NVUkwsIGNvbmZpZ1VSTH0gZnJvbSAnLi9jbGllbnRDb25maWcnO1xuXG5cbmZ1bmN0aW9uIGxvYWRUYXNrcyh0YXNrcykge1xuICAgIHZhciBkZmQgPSBuZXcgJC5EZWZlcnJlZCgpO1xuXHR0YXNrcy5mZXRjaCh7XG5cdFx0c3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBkZmQucmVzb2x2ZSgpO1xuXHRcdH0sXG5cdFx0ZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgZGZkLnJlamVjdChlcnIpO1xuXHRcdH0sXG5cdFx0cGFyc2U6IHRydWUsXG5cdFx0cmVzZXQ6IHRydWVcblx0fSk7XG4gICAgcmV0dXJuIGRmZC5wcm9taXNlKCk7XG59XG5cbmZ1bmN0aW9uIGxvYWRTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgIHJldHVybiAkLmdldEpTT04oY29uZmlnVVJMKVxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgc2V0dGluZ3Muc3RhdHVzZXMgPSBkYXRhO1xuICAgICAgICB9KTtcbn1cblxuXG4kKCgpID0+IHtcblx0bGV0IHRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG4gICAgdGFza3MudXJsID0gdGFza3NVUkw7XG4gICAgbGV0IHNldHRpbmdzID0gbmV3IFNldHRpbmdzKHt9LCB7dGFza3M6IHRhc2tzfSk7XG5cbiAgICB3aW5kb3cudGFza3MgPSB0YXNrcztcblxuICAgICQud2hlbihsb2FkVGFza3ModGFza3MpKVxuICAgIC50aGVuKCgpID0+IGxvYWRTZXR0aW5ncyhzZXR0aW5ncykpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnU3VjY2VzcyBsb2FkaW5nIHRhc2tzLicpO1xuICAgICAgICBuZXcgR2FudHRWaWV3KHtcbiAgICAgICAgICAgIHNldHRpbmdzOiBzZXR0aW5ncyxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IHRhc2tzXG4gICAgICAgIH0pLnJlbmRlcigpO1xuICAgIH0pXG4gICAgLnRoZW4oKCkgPT4ge1xuXG5cblxuICAgICAgICAvLyBoaWRlIGxvYWRpbmdcbiAgICAgICAgJCgnI2xvYWRlcicpLmZhZGVPdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIGRpc3BsYXkgaGVhZCBhbHdheXMgb24gdG9wXG4gICAgICAgICAgICAkKCcjaGVhZCcpLmNzcyh7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBlbmFibGUgc2Nyb2xsaW5nXG4gICAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2hvbGQtc2Nyb2xsJyk7XG4gICAgICAgIH0pO1xuICAgIH0pLmZhaWwoKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcnLCBlcnJvcik7XG4gICAgfSk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIFJlc291cmNlUmVmZXJlbmNlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgLy8gbWFpbiBwYXJhbXNcclxuICAgICAgICBXQlNJRCA6IDEsIC8vIHRhc2sgaWRcclxuICAgICAgICBSZXNJRDogMSwgLy8gcmVzb3VyY2UgaWRcclxuICAgICAgICBUU0FjdGl2YXRlOiB0cnVlLFxyXG5cclxuICAgICAgICAvLyBzb21lIHNlcnZlciBwYXJhbXNcclxuICAgICAgICBXQlNQcm9maWxlSUQgOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBXQlNfSUQgOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBQYXJ0aXRObyA6ICcyYjAwZGE0NmI1N2MwMzk1JywgLy8gaGF2ZSBubyBpZGVhIHdoYXQgaXMgdGhhdFxyXG4gICAgICAgIFByb2plY3RSZWYgOiBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleVxyXG5cclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzb3VyY2VSZWZlcmVuY2U7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcblxyXG52YXIgU2V0dGluZ01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHRkZWZhdWx0czoge1xyXG5cdFx0aW50ZXJ2YWw6ICdkYWlseScsXHJcblx0XHQvL2RheXMgcGVyIGludGVydmFsXHJcblx0XHRkcGk6IDFcclxuXHR9LFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcclxuXHRcdHRoaXMuc3RhdHVzZXMgPSB1bmRlZmluZWQ7XHJcblx0XHR0aGlzLnNhdHRyID0ge1xyXG5cdFx0XHRoRGF0YToge30sXHJcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcclxuXHRcdFx0ZGF5c1dpZHRoOiA1LFxyXG5cdFx0XHRjZWxsV2lkdGg6IDM1LFxyXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXHJcblx0XHRcdG1heERhdGU6IG5ldyBEYXRlKDAsMCwwKSxcclxuXHRcdFx0Ym91bmRhcnlNaW46IG5ldyBEYXRlKDAsMCwwKSxcclxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcclxuXHRcdFx0Ly9tb250aHMgcGVyIGNlbGxcclxuXHRcdFx0bXBjOiAxXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuc2Rpc3BsYXkgPSB7XHJcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4NixcclxuXHRcdFx0dEhpZGRlbldpZHRoOiAzMDUsXHJcblx0XHRcdHRhYmxlV2lkdGg6IDcxMFxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMudGFza3M7XHJcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xyXG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgY2hhbmdlOmVuZCcsIF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlOndpZHRoJyk7XHJcbiAgICAgICAgfSwgNTAwKSk7XHJcblx0fSxcclxuXHRnZXRTZXR0aW5nOiBmdW5jdGlvbihmcm9tLCBhdHRyKXtcclxuXHRcdGlmKGF0dHIpe1xyXG5cdFx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXVthdHRyXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xyXG5cdH0sXHJcblx0ZmluZFN0YXR1c0lkIDogZnVuY3Rpb24oc3RhdHVzKSB7XHJcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gc3RhdHVzLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmRTdGF0dXNGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRTdGF0dXNJZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHRmaW5kSGVhbHRoSWQgOiBmdW5jdGlvbihoZWFsdGgpIHtcclxuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBoZWFsdGgudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZEhlYWx0aEZvcklkIDogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdEhlYWx0aElkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5jRGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cdGZpbmRXT0lkIDogZnVuY3Rpb24od28pIHtcclxuXHRcdGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuV09OdW1iZXIudG9Mb3dlckNhc2UoKSA9PT0gd28udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuSUQ7XHJcbiAgICAgICAgICAgIH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZFdPRm9ySWQgOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuSUQudG9TdHJpbmcoKSA9PT0gaWQudG9TdHJpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuV09OdW1iZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRXT0lkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbMF0uSUQ7XHJcbiAgICB9LFxyXG4gICAgZ2V0RGF0ZUZvcm1hdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAnZGQvbW0veXknO1xyXG4gICAgfSxcclxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBtaW5EYXRlID0gbmV3IERhdGUoKSwgbWF4RGF0ZSA9IG1pbkRhdGUuY2xvbmUoKS5hZGRZZWFycygxKTtcclxuXHJcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdzdGFydCcpLmNvbXBhcmVUbyhtaW5EYXRlKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRtaW5EYXRlPW1vZGVsLmdldCgnc3RhcnQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAobW9kZWwuZ2V0KCdlbmQnKS5jb21wYXJlVG8obWF4RGF0ZSkgPT09IDEpIHtcclxuXHRcdFx0XHRtYXhEYXRlPW1vZGVsLmdldCgnZW5kJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5zYXR0ci5taW5EYXRlID0gbWluRGF0ZTtcclxuXHRcdHRoaXMuc2F0dHIubWF4RGF0ZSA9IG1heERhdGU7XHJcblx0fSxcclxuXHRzZXRBdHRyaWJ1dGVzOiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBlbmQsc2F0dHI9dGhpcy5zYXR0cixkYXR0cj10aGlzLnNkaXNwbGF5LGR1cmF0aW9uLHNpemUsY2VsbFdpZHRoLGRwaSxyZXRmdW5jLHN0YXJ0LGxhc3QsaT0wLGo9MCxpTGVuPTAsbmV4dD1udWxsO1xyXG5cclxuXHRcdHZhciBpbnRlcnZhbCA9IHRoaXMuZ2V0KCdpbnRlcnZhbCcpO1xyXG5cclxuXHRcdGlmIChpbnRlcnZhbCA9PT0gJ2RhaWx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMSwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cyg2MCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDE1O1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cygxKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0c2F0dHIubXBjID0gMTtcclxuXHJcblx0XHR9IGVsc2UgaWYoaW50ZXJ2YWwgPT09ICd3ZWVrbHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCA3LCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwICogNyk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCkubW92ZVRvRGF5T2ZXZWVrKDEsIC0xKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gNTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gc2F0dHIuZGF5c1dpZHRoICogNztcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDcpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ21vbnRobHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygxMiAqIDMwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMjtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSA3ICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGRNb250aHMoMSk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAncXVhcnRlcmx5Jykge1xyXG5cdFx0XHR0aGlzLnNldCgnZHBpJywgMzAsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiAzMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTEgKiAyMCk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluLm1vdmVUb0ZpcnN0RGF5T2ZRdWFydGVyKCk7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IDE7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9ICdhdXRvJztcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gMzAgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLm1wYyA9IDM7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdmaXgnKSB7XHJcblx0XHRcdGNlbGxXaWR0aCA9IDMwO1xyXG5cdFx0XHRkdXJhdGlvbiA9IERhdGUuZGF5c2RpZmYoc2F0dHIubWluRGF0ZSwgc2F0dHIubWF4RGF0ZSk7XHJcblx0XHRcdHNpemUgPSBkYXR0ci5zY3JlZW5XaWR0aCAtIGRhdHRyLnRIaWRkZW5XaWR0aCAtIDEwMDtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gc2l6ZSAvIGR1cmF0aW9uO1xyXG5cdFx0XHRkcGkgPSBNYXRoLnJvdW5kKGNlbGxXaWR0aCAvIHNhdHRyLmRheXNXaWR0aCk7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCBkcGksIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gZHBpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yICogZHBpKTtcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygzMCAqIDEwKTtcclxuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsPT09J2F1dG8nKSB7XHJcblx0XHRcdGRwaSA9IHRoaXMuZ2V0KCdkcGknKTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gKDEgKyBNYXRoLmxvZyhkcGkpKSAqIDEyO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzYXR0ci5jZWxsV2lkdGggLyBkcGk7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIwICogZHBpKTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMzAgKiAxMCk7XHJcblx0XHRcdHNhdHRyLm1wYyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoZHBpIC8gMzApKTtcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gTWF0aC5yb3VuZCgwLjMgKiBkcGkpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGhEYXRhID0ge1xyXG5cdFx0XHQnMSc6IFtdLFxyXG5cdFx0XHQnMic6IFtdLFxyXG5cdFx0XHQnMyc6IFtdXHJcblx0XHR9O1xyXG5cdFx0dmFyIGhkYXRhMyA9IFtdO1xyXG5cclxuXHRcdHN0YXJ0ID0gc2F0dHIuYm91bmRhcnlNaW47XHJcblxyXG5cdFx0bGFzdCA9IHN0YXJ0O1xyXG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XHJcblx0XHRcdHZhciBkdXJmdW5jO1xyXG5cdFx0XHRpZiAoaW50ZXJ2YWw9PT0nbW9udGhseScpIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luTW9udGgoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0TW9udGgoKSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luUXVhcnRlcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0UXVhcnRlcigpKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xyXG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogZHVyZnVuYyhsYXN0KSxcclxuXHRcdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XHJcblx0XHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIGludGVydmFsZGF5cyA9IHRoaXMuZ2V0KCdkcGknKTtcclxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNIb2x5ID0gbGFzdC5nZXREYXkoKSA9PT0gNiB8fCBsYXN0LmdldERheSgpID09PSAwO1xyXG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBpbnRlcnZhbGRheXMsXHJcblx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBob2x5IDogKGludGVydmFsID09PSAnZGFpbHknKSAmJiBpc0hvbHlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcclxuXHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0c2F0dHIuYm91bmRhcnlNYXggPSBlbmQgPSBsYXN0O1xyXG5cdFx0aERhdGFbJzMnXSA9IGhkYXRhMztcclxuXHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IGRhdGUgdG8gZW5kIG9mIHllYXJcclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xyXG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXHJcblx0XHR9KTtcclxuXHRcdGZvcihpID0gc3RhcnQuZ2V0RnVsbFllYXIoKSArIDEsIGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTsgaSA8IGlMZW47IGkrKyl7XHJcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxyXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRpbnRlciA9IERhdGUuZGF5c2RpZmYobmV3IERhdGUoZW5kLmdldEZ1bGxZZWFyKCksIDAsIDEpLCBlbmQpO1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBlbmQuZ2V0RnVsbFllYXIoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IG1vbnRoXHJcblx0XHRoRGF0YVsnMiddLnB1c2goe1xyXG5cdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihzdGFydCwgc3RhcnQuY2xvbmUoKS5tb3ZlVG9MYXN0RGF5T2ZNb250aCgpKSxcclxuXHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKHN0YXJ0LmdldE1vbnRoKCksICdtJylcclxuXHRcdH0pO1xyXG5cclxuXHRcdGogPSBzdGFydC5nZXRNb250aCgpICsgMTtcclxuXHRcdGkgPSBzdGFydC5nZXRGdWxsWWVhcigpO1xyXG5cdFx0aUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpO1xyXG5cdFx0dmFyIGVuZG1vbnRoID0gZW5kLmdldE1vbnRoKCk7XHJcblxyXG5cdFx0d2hpbGUgKGkgPD0gaUxlbikge1xyXG5cdFx0XHR3aGlsZShqIDwgMTIpIHtcclxuXHRcdFx0XHRpZiAoaSA9PT0gaUxlbiAmJiBqID09PSBlbmRtb250aCkge1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGhEYXRhWycyJ10ucHVzaCh7XHJcblx0XHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5nZXREYXlzSW5Nb250aChpLCBqKSxcclxuXHRcdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShqLCAnbScpXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0aiArPSAxO1xyXG5cdFx0XHR9XHJcblx0XHRcdGkgKz0gMTtcclxuXHRcdFx0aiA9IDA7XHJcblx0XHR9XHJcblx0XHRpZiAoZW5kLmdldE1vbnRoKCkgIT09IHN0YXJ0LmdldE1vbnRoKCkgJiYgZW5kLmdldEZ1bGxZZWFyKCkgIT09IHN0YXJ0LmdldEZ1bGxZZWFyKCkpIHtcclxuXHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRkdXJhdGlvbjogRGF0ZS5kYXlzZGlmZihlbmQuY2xvbmUoKS5tb3ZlVG9GaXJzdERheU9mTW9udGgoKSwgZW5kKSxcclxuXHRcdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoZW5kLmdldE1vbnRoKCksICdtJylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRzYXR0ci5oRGF0YSA9IGhEYXRhO1xyXG5cdH0sXHJcblx0Y2FsY3VsYXRlSW50ZXJ2YWxzOiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xyXG5cdFx0dGhpcy5zZXRBdHRyaWJ1dGVzKCk7XHJcblx0fSxcclxuXHRjb25EVG9UOihmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGRUb1RleHQ9e1xyXG5cdFx0XHQnc3RhcnQnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnZHVyYXRpb24nOmZ1bmN0aW9uKHZhbHVlLG1vZGVsKXtcclxuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdzdGF0dXMnOmZ1bmN0aW9uKHZhbHVlKXtcclxuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xyXG5cdFx0XHRcdFx0JzExMCc6J2NvbXBsZXRlJyxcclxuXHRcdFx0XHRcdCcxMDknOidvcGVuJyxcclxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0cmV0dXJuIHN0YXR1c2VzW3ZhbHVlXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH07XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZmllbGQsdmFsdWUsbW9kZWwpe1xyXG5cdFx0XHRyZXR1cm4gZFRvVGV4dFtmaWVsZF0/ZFRvVGV4dFtmaWVsZF0odmFsdWUsbW9kZWwpOnZhbHVlO1xyXG5cdFx0fTtcclxuXHR9KCkpXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nTW9kZWw7XHJcbiIsInZhciBSZXNDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uJyk7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgU3ViVGFza3MgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcbiAgICBjb21wYXJhdG9yOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbnZhciByZXNMaW5rcyA9IG5ldyBSZXNDb2xsZWN0aW9uKCk7XHJcbnJlc0xpbmtzLmZldGNoKCk7XHJcblxyXG52YXIgVGFza01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgLy8gTUFJTiBQQVJBTVNcclxuICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcclxuICAgICAgICBjb21wbGV0ZTogMCwgIC8vIDAlIC0gMTAwJSBwZXJjZW50c1xyXG4gICAgICAgIHNvcnRpbmRleDogMCwgICAvLyBwbGFjZSBvbiBzaWRlIG1lbnUsIHN0YXJ0cyBmcm9tIDBcclxuICAgICAgICBkZXBlbmQ6IFtdLCAgLy8gaWQgb2YgdGFza3NcclxuICAgICAgICBzdGF0dXM6ICcxMTAnLCAgICAgIC8vIDExMCAtIGNvbXBsZXRlLCAxMDkgIC0gb3BlbiwgMTA4IC0gcmVhZHlcclxuICAgICAgICBzdGFydDogbmV3IERhdGUoKSxcclxuICAgICAgICBlbmQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgcGFyZW50aWQ6IDAsXHJcbiAgICAgICAgQ29tbWVudHM6IDAsXHJcblxyXG4gICAgICAgIGNvbG9yOiAnIzAwOTBkMycsICAgLy8gdXNlciBjb2xvciwgbm90IHVzZWQgZm9yIG5vd1xyXG5cclxuICAgICAgICAvLyBzb21lIGFkZGl0aW9uYWwgcHJvcGVydGllc1xyXG4gICAgICAgIHJlc291cmNlczogW10sICAgICAgICAgLy9saXN0IG9mIGlkXHJcbiAgICAgICAgaGVhbHRoOiAyMSxcclxuICAgICAgICByZXBvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICB3bzogMiwgICAgICAgICAgICAgICAgICAvL1NlbGVjdCBMaXN0IGluIHByb3BlcnRpZXMgbW9kYWwgICAoY29uZmlnZGF0YSlcclxuICAgICAgICBtaWxlc3RvbmU6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGRlbGl2ZXJhYmxlOiBmYWxzZSwgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZmluYW5jaWFsOiBmYWxzZSwgICAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICB0aW1lc2hlZXRzOiBmYWxzZSwgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIGFjdHRpbWVzaGVldHM6IGZhbHNlLCAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcblxyXG4gICAgICAgIC8vIHNlcnZlciBzcGVjaWZpYyBwYXJhbXNcclxuICAgICAgICAvLyBkb24ndCB1c2UgdGhlbSBvbiBjbGllbnQgc2lkZVxyXG4gICAgICAgIFByb2plY3RSZWY6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIFdCU19JRDogcGFyYW1zLnByb2ZpbGUsXHJcbiAgICAgICAgc2l0ZWtleTogcGFyYW1zLnNpdGVrZXksXHJcblxyXG5cclxuICAgICAgICAvLyBwYXJhbXMgZm9yIGFwcGxpY2F0aW9uIHZpZXdzXHJcbiAgICAgICAgLy8gc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSBKU09OXHJcbiAgICAgICAgaGlkZGVuOiBmYWxzZSxcclxuICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxyXG4gICAgICAgIGhpZ2h0bGlnaHQ6ICcnXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gc2VsZiB2YWxpZGF0aW9uXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnJlc291cmNlcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXNMaW5rcy51cGRhdGVSZXNvdXJjZXNGb3JUYXNrKHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6bWlsZXN0b25lJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdldCgnbWlsZXN0b25lJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIG5ldyBEYXRlKHRoaXMuZ2V0KCdlbmQnKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoaWxkcmVuIHJlZmVyZW5jZXNcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gbmV3IFN1YlRhc2tzKCk7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRzID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KCdtaWxlc3RvbmUnLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92aW5nIHJlZnNcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ2V0KCdwYXJlbnRpZCcpID09PSB0aGlzLmlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5yZW1vdmUoY2hpbGQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpzb3J0aW5kZXgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja1RpbWUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldCgnY29sbGFwc2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGVja2luZyBuZXN0ZWQgc3RhdGVcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlJywgdGhpcy5fY2hlY2tOZXN0ZWQpO1xyXG5cclxuICAgICAgICAvLyB0aW1lIGNoZWNraW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl9jaGVja0NvbXBsZXRlKTtcclxuICAgICAgICB0aGlzLl9saXN0ZW5EZXBlbmRzQ29sbGVjdGlvbigpO1xyXG4gICAgfSxcclxuICAgIGlzTmVzdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgIH0sXHJcbiAgICBzaG93OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgZmFsc2UpO1xyXG4gICAgfSxcclxuICAgIGhpZGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgIGNoaWxkLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBkZXBlbmRPbjogZnVuY3Rpb24oYmVmb3JlTW9kZWwsIHNpbGVudCkge1xyXG4gICAgICAgIHRoaXMuZGVwZW5kcy5hZGQoYmVmb3JlTW9kZWwsIHtzaWxlbnQ6IHNpbGVudH0pO1xyXG4gICAgICAgIGlmICh0aGlzLmdldCgnc3RhcnQnKSA8IGJlZm9yZU1vZGVsLmdldCgnZW5kJykpIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlVG9TdGFydChiZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaWxlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhhc0luRGVwczogZnVuY3Rpb24gKG1vZGVsKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5kZXBlbmRzLmdldChtb2RlbC5pZCk7XHJcbiAgICB9LFxyXG4gICAgdG9KU09OOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIganNvbiA9IEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS50b0pTT04uY2FsbCh0aGlzKTtcclxuICAgICAgICBkZWxldGUganNvbi5yZXNvdXJjZXM7XHJcbiAgICAgICAgZGVsZXRlIGpzb24uaGlkZGVuO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmNvbGxhcHNlZDtcclxuICAgICAgICBkZWxldGUganNvbi5oaWdodGxpZ2h0O1xyXG4gICAgICAgIGpzb24uZGVwZW5kID0ganNvbi5kZXBlbmQuam9pbignLCcpO1xyXG4gICAgICAgIHJldHVybiBqc29uO1xyXG4gICAgfSxcclxuICAgIGhhc1BhcmVudDogZnVuY3Rpb24ocGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XHJcbiAgICAgICAgd2hpbGUodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IHBhcmVudEZvckNoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjbGVhckRlcGVuZGVuY2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGVwZW5kcy5lYWNoKChtKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVwZW5kcy5yZW1vdmUobSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2xpc3RlbkRlcGVuZHNDb2xsZWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuZGVwZW5kcywgJ3JlbW92ZSBhZGQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGlkcyA9IHRoaXMuZGVwZW5kcy5tYXAoKG0pID0+IG0uaWQpO1xyXG4gICAgICAgICAgICB0aGlzLnNldCgnZGVwZW5kJywgaWRzKS5zYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAnYWRkJywgZnVuY3Rpb24oYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnRyaWdnZXIoJ2RlcGVuZDphZGQnLCBiZWZvcmVNb2RlbCwgdGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAncmVtb3ZlJywgZnVuY3Rpb24oYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnRyaWdnZXIoJ2RlcGVuZDpyZW1vdmUnLCBiZWZvcmVNb2RlbCwgdGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAnY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKGJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC51bmRlck1vdmluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGluZmluaXRlIGRlcGVuZCBsb29wXHJcbiAgICAgICAgICAgIHZhciBpbkRlcHMgPSBbdGhpc107XHJcbiAgICAgICAgICAgIHZhciBpc0luZmluaXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0RlcHMobW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIGlmICghbW9kZWwuZGVwZW5kcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXBlbmRzLmVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5EZXBzLmluZGV4T2YobSkgPiAtMSB8fCBpc0luZmluaXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5maW5pdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGluRGVwcy5wdXNoKG0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRGVwcyhtKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoZWNrRGVwcyh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc0luZmluaXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG9TdGFydChiZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jaGVja05lc3RlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCduZXN0ZWRTdGF0ZUNoYW5nZScsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHZhciBzdGFydCwgZW5kO1xyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2Uuc3RhcnQpKXtcclxuICAgICAgICAgICAgc3RhcnQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5zdGFydCksICdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5zdGFydCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChfLmlzRGF0ZShyZXNwb25zZS5zdGFydCkpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSByZXNwb25zZS5zdGFydDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2UuZW5kKSl7XHJcbiAgICAgICAgICAgIGVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksICdkZC9NTS95eXl5JykgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcclxuICAgICAgICB9IGVsc2UgaWYgKF8uaXNEYXRlKHJlc3BvbnNlLmVuZCkpIHtcclxuICAgICAgICAgICAgZW5kID0gcmVzcG9uc2UuZW5kO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNwb25zZS5zdGFydCA9IHN0YXJ0IDwgZW5kID8gc3RhcnQgOiBlbmQ7XHJcbiAgICAgICAgcmVzcG9uc2UuZW5kID0gc3RhcnQgPCBlbmQgPyBlbmQgOiBzdGFydDtcclxuXHJcbiAgICAgICAgcmVzcG9uc2UucGFyZW50aWQgPSBwYXJzZUludChyZXNwb25zZS5wYXJlbnRpZCB8fCAnMCcsIDEwKTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIG51bGwgcGFyYW1zXHJcbiAgICAgICAgXy5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAodmFsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzcG9uc2Vba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2VzIGFzIGxpc3Qgb2YgSURcclxuICAgICAgICB2YXIgaWRzID0gW107XHJcbiAgICAgICAgKHJlc3BvbnNlLlJlc291cmNlcyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihyZXNJbmZvKSB7XHJcbiAgICAgICAgICAgIGlkcy5wdXNoKHJlc0luZm8uUmVzSUQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc3BvbnNlLlJlc291cmNlcyA9IHVuZGVmaW5lZDtcclxuICAgICAgICByZXNwb25zZS5yZXNvdXJjZXMgPSBpZHM7XHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLm1pbGVzdG9uZSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS5zdGFydCA9IHJlc3BvbnNlLmVuZDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgZGVwcyBmb3IgbmV3IEFQSSAoYXJyYXkgb2YgZGVwcylcclxuICAgICAgICBpZiAoXy5pc051bWJlcihyZXNwb25zZS5kZXBlbmQpKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLmRlcGVuZCA9IFtyZXNwb25zZS5kZXBlbmRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoXy5pc1N0cmluZyhyZXNwb25zZS5kZXBlbmQpKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLmRlcGVuZCA9IF8uY29tcGFjdChyZXNwb25zZS5kZXBlbmQuc3BsaXQoJywnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tUaW1lOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICAgICAgdmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkRW5kVGltZSA9IGNoaWxkLmdldCgnZW5kJyk7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkU3RhcnRUaW1lIDwgc3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihjaGlsZEVuZFRpbWUgPiBlbmRUaW1lKXtcclxuICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNldCgnc3RhcnQnLCBzdGFydFRpbWUpO1xyXG4gICAgICAgIHRoaXMuc2V0KCdlbmQnLCBlbmRUaW1lKTtcclxuICAgIH0sXHJcbiAgICBfY2hlY2tDb21wbGV0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlID0gMDtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlICs9IGNoaWxkLmdldCgnY29tcGxldGUnKSAvIGxlbmd0aDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0KCdjb21wbGV0ZScsIE1hdGgucm91bmQoY29tcGxldGUpKTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG9TdGFydDogZnVuY3Rpb24obmV3U3RhcnQpIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5ldyBzdGFydCBpcyB0aGUgc2FtZSBhcyBjdXJyZW50XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0LnRvRGF0ZVN0cmluZygpID09PSB0aGlzLmdldCgnc3RhcnQnKS50b0RhdGVTdHJpbmcoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgb2Zmc2V0XHJcbi8vICAgICAgICB2YXIgZGF5c0RpZmYgPSBNYXRoLmZsb29yKChuZXdTdGFydC50aW1lKCkgLSB0aGlzLmdldCgnc3RhcnQnKS50aW1lKCkpIC8gMTAwMCAvIDYwIC8gNjAgLyAyNClcclxuICAgICAgICB2YXIgZGF5c0RpZmYgPSBEYXRlLmRheXNkaWZmKG5ld1N0YXJ0LCB0aGlzLmdldCgnc3RhcnQnKSkgLSAxO1xyXG4gICAgICAgIGlmIChuZXdTdGFydCA8IHRoaXMuZ2V0KCdzdGFydCcpKSB7XHJcbiAgICAgICAgICAgIGRheXNEaWZmICo9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2hhbmdlIGRhdGVzXHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogbmV3U3RhcnQuY2xvbmUoKSxcclxuICAgICAgICAgICAgZW5kOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXNEaWZmKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGFuZ2VzIGRhdGVzIGluIGFsbCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMudW5kZXJNb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzRGlmZik7XHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ2hpbGRyZW46IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgY2hpbGQubW92ZShkYXlzKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlV2l0aENoaWxkcmVuOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0YXNrLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBtb3ZlOiBmdW5jdGlvbihkYXlzKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogdGhpcy5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKGRheXMpLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5cylcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2hpbGRyZW4oZGF5cyk7XHJcbiAgICB9LFxyXG4gICAgZ2V0T3V0bGluZUxldmVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGV2ZWwgPSAwO1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV2ZWwrKztcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZ2V0T3V0bGluZU51bWJlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5jaGlsZHJlbi5tb2RlbHMuaW5kZXhPZih0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBudW1iZXIgPSAwO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbGxlY3Rpb24ubGVuZ3RoOyBpICsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmF0KGkpO1xyXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW1vZGVsLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgbnVtYmVyICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHJcbiIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHR2YXIgcHJtYXJyID0gcHJtc3RyLnNwbGl0KCcmJyk7XG5cdHZhciBpLCB0bXBhcnI7XG5cdGZvciAoaSA9IDA7IGkgPCBwcm1hcnIubGVuZ3RoOyBpKyspIHtcblx0XHR0bXBhcnIgPSBwcm1hcnJbaV0uc3BsaXQoJz0nKTtcblx0XHRwYXJhbXNbdG1wYXJyWzBdXSA9IHRtcGFyclsxXTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRVUkxQYXJhbXMgPSBmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0dmFyIHBybXN0ciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xuXHRyZXR1cm4gcHJtc3RyICE9PSBudWxsICYmIHBybXN0ciAhPT0gJycgPyB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSA6IHt9O1xufTtcblxuIiwidmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcclxudmFyIHhtbCA9IGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL3htbFRlbXBsYXRlLnhtbCcsICd1dGY4Jyk7XHJcbnZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoeG1sKTtcclxudmFyIHhtbFRvSlNPTiA9IHdpbmRvdy54bWxUb0pTT047XHJcblxyXG5mdW5jdGlvbiBwYXJzZVhNTE9iaih4bWxTdHJpbmcpIHtcclxuICAgIHZhciBvYmogPSB4bWxUb0pTT04ucGFyc2VTdHJpbmcoeG1sU3RyaW5nKTtcclxuICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyB4bWxJdGVtLk5hbWUgPSBbe190ZXh0OiAnbm8gbmFtZSAnICsgeG1sSXRlbS5VSURbMF0uX3RleHR9XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGFza3MucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6IHhtbEl0ZW0uTmFtZVswXS5fdGV4dCxcclxuICAgICAgICAgICAgc3RhcnQ6IHhtbEl0ZW0uU3RhcnRbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGVuZDogeG1sSXRlbS5GaW5pc2hbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGNvbXBsZXRlOiB4bWxJdGVtLlBlcmNlbnRDb21wbGV0ZVswXS5fdGV4dCxcclxuICAgICAgICAgICAgb3V0bGluZTogeG1sSXRlbS5PdXRsaW5lTnVtYmVyWzBdLl90ZXh0LnRvU3RyaW5nKClcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRhc2tzO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5wYXJzZURlcHNGcm9tWE1MID0gZnVuY3Rpb24oeG1sU3RyaW5nKSB7XHJcbiAgICB2YXIgb2JqID0geG1sVG9KU09OLnBhcnNlU3RyaW5nKHhtbFN0cmluZyk7XHJcbiAgICB2YXIgdWlkcyA9IHt9O1xyXG4gICAgdmFyIG91dGxpbmVzID0ge307XHJcbiAgICB2YXIgZGVwcyA9IFtdO1xyXG4gICAgdmFyIHBhcmVudHMgPSBbXTtcclxuICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyB4bWxJdGVtLk5hbWUgPSBbe190ZXh0OiAnbm8gbmFtZSAnICsgeG1sSXRlbS5VSURbMF0uX3RleHR9XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IHhtbEl0ZW0uTmFtZVswXS5fdGV4dC50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBvdXRsaW5lOiB4bWxJdGVtLk91dGxpbmVOdW1iZXJbMF0uX3RleHQudG9TdHJpbmcoKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdWlkc1t4bWxJdGVtLlVJRFswXS5fdGV4dF0gPSBpdGVtO1xyXG4gICAgICAgIG91dGxpbmVzW2l0ZW0ub3V0bGluZV0gPSBpdGVtO1xyXG4gICAgfSk7XHJcbiAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhc2sgPSB1aWRzW3htbEl0ZW0uVUlEWzBdLl90ZXh0XTtcclxuICAgICAgICAvLyB2YXIgbmFtZSA9IHhtbEl0ZW0uTmFtZVswXS5fdGV4dDtcclxuICAgICAgICB2YXIgb3V0bGluZSA9IHRhc2sub3V0bGluZTtcclxuXHJcbiAgICAgICAgaWYgKHhtbEl0ZW0uUHJlZGVjZXNzb3JMaW5rKSB7XHJcbiAgICAgICAgICAgIHhtbEl0ZW0uUHJlZGVjZXNzb3JMaW5rLmZvckVhY2goKGxpbmspID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmVVSUQgPSBsaW5rLlByZWRlY2Vzc29yVUlEWzBdLl90ZXh0O1xyXG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZSA9IHVpZHNbYmVmb3JlVUlEXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZXBzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGJlZm9yZTogYmVmb3JlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyOiB0YXNrXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmUuaW5kZXhPZignLicpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50T3V0bGluZSA9IG91dGxpbmUuc2xpY2UoMCwgb3V0bGluZS5sYXN0SW5kZXhPZignLicpKTtcclxuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG91dGxpbmVzW3BhcmVudE91dGxpbmVdO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignY2FuIG5vdCBmaW5kIHBhcmVudCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJlbnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBjaGlsZDogdGFza1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVwczogZGVwcyxcclxuICAgICAgICBwYXJlbnRzOiBwYXJlbnRzXHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMucGFyc2VYTUxPYmogPSBwYXJzZVhNTE9iajtcclxuXHJcbmZ1bmN0aW9uIGN1dChkYXRlKSB7XHJcbiAgICBsZXQgZm9ybWF0ZWQgPSBkYXRlLnRvSVNPU3RyaW5nKCk7XHJcbiAgICByZXR1cm4gZm9ybWF0ZWQuc2xpY2UoMCwgZm9ybWF0ZWQuaW5kZXhPZignLicpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMudGFza3NUb1hNTCA9IGZ1bmN0aW9uKHRhc2tzKSB7XHJcbiAgICB2YXIgc3RhcnQgPSB0YXNrcy5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICB2YXIgZW5kID0gdGFza3MuYXQoMCkuZ2V0KCdlbmQnKTtcclxuICAgIHZhciBkYXRhID0gdGFza3MubWFwKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICBpZiAoc3RhcnQgPiB0YXNrLmdldCgnc3RhcnQnKSkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHRhc2suZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW5kIDwgdGFzay5nZXQoJ2VuZCcpKSB7XHJcbiAgICAgICAgICAgIGVuZCA9IHRhc2suZ2V0KCdlbmQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHRhc2suZ2V0KCdkZXBlbmQnKSk7XHJcbiAgICAgICAgY29uc3QgZGVwZW5kID0gXy5tYXAodGFzay5nZXQoJ2RlcGVuZCcpLCAoaWQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRhc2tzLmdldChpZCkuZ2V0KCdzb3J0aW5kZXgnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWQ6IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSxcclxuICAgICAgICAgICAgbmFtZTogdGFzay5nZXQoJ25hbWUnKSxcclxuICAgICAgICAgICAgb3V0bGluZU51bWJlcjogdGFzay5nZXRPdXRsaW5lTnVtYmVyKCksXHJcbiAgICAgICAgICAgIG91dGxpbmVMZXZlbDogdGFzay5nZXRPdXRsaW5lTGV2ZWwoKSxcclxuICAgICAgICAgICAgc3RhcnQ6IGN1dCh0YXNrLmdldCgnc3RhcnQnKSksXHJcbiAgICAgICAgICAgIGZpbmlzaDogY3V0KHRhc2suZ2V0KCdlbmQnKSksXHJcbiAgICAgICAgICAgIGRlcGVuZDogZGVwZW5kWzBdXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbXBpbGVkKHtcclxuICAgICAgICB0YXNrczogZGF0YSxcclxuICAgICAgICBjdXJyZW50RGF0ZTogY3V0KG5ldyBEYXRlKCkpLFxyXG4gICAgICAgIHN0YXJ0RGF0ZTogY3V0KHN0YXJ0KSxcclxuICAgICAgICBmaW5pc2hEYXRlOiBjdXQoZW5kKVxyXG4gICAgfSk7XHJcbn07XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgQ29tbWVudHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3Rhc2tDb21tZW50c01vZGFsJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuX2ZpbGxEYXRhKCk7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRlbC5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkFwcHJvdmUnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkhpZGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkhpZGUnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25EZW55IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25EZW55Jyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG5cclxuICAgICAgICB2YXIgdXBkYXRlQ291bnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGNvdW50ID0gJChcIiN0YXNrQ29tbWVudHNcIikuY29tbWVudHMoXCJjb3VudFwiKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ0NvbW1lbnRzJywgY291bnQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuICAgICAgICB2YXIgY2FsbGJhY2sgPSB7XHJcbiAgICAgICAgICAgIGFmdGVyRGVsZXRlIDogdXBkYXRlQ291bnQsXHJcbiAgICAgICAgICAgIGFmdGVyQ29tbWVudEFkZCA6IHVwZGF0ZUNvdW50XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluZGV4T2YoJ2xvY2FsaG9zdCcpID09PSAtMSkge1xyXG4gICAgICAgICAgICAvLyBpbml0IGNvbW1lbnRzXHJcbiAgICAgICAgICAgICQoXCIjdGFza0NvbW1lbnRzXCIpLmNvbW1lbnRzKHtcclxuICAgICAgICAgICAgICAgIGdldENvbW1lbnRzVXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQgKyBcIi9cIiArIHBhcmFtcy5zaXRla2V5ICsgXCIvV0JTLzAwMFwiLFxyXG4gICAgICAgICAgICAgICAgcG9zdENvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCArIFwiL1wiICsgcGFyYW1zLnNpdGVrZXkgKyBcIi9XQlMvXCIgKyBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUNvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlBdmF0YXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgOiBjYWxsYmFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5jb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICBnZXRDb21tZW50c1VybDogXCIvYXBpL2NvbW1lbnQvXCIgKyB0aGlzLm1vZGVsLmlkLFxyXG4gICAgICAgICAgICAgICAgcG9zdENvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUNvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlBdmF0YXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgOiBjYWxsYmFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2ZpbGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlucHV0LnZhbCh2YWwpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29tbWVudHNWaWV3O1xyXG4iLCJ2YXIgQ29udGV4dE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9zaWRlQmFyL0NvbnRleHRNZW51VmlldycpO1xydmFyIFNpZGVQYW5lbCA9IHJlcXVpcmUoJy4vc2lkZUJhci9TaWRlUGFuZWwnKTtcclxyXHJ2YXIgR2FudHRDaGFydFZpZXcgPSByZXF1aXJlKCcuL2NhbnZhc0NoYXJ0L0dhbnR0Q2hhcnRWaWV3Jyk7XHJ2YXIgVG9wTWVudVZpZXcgPSByZXF1aXJlKCcuL1RvcE1lbnVWaWV3L1RvcE1lbnVWaWV3Jyk7XHJccnZhciBOb3RpZmljYXRpb25zID0gcmVxdWlyZSgnLi9Ob3RpZmljYXRpb25zJyk7XHJcclxydmFyIEdhbnR0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcciAgICBlbDogJy5HYW50dCcsXHIgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHIgICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHIgICAgICAgIHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0saW5wdXRbbmFtZT1cInN0YXJ0XCJdJykub24oJ2NoYW5nZScsIHRoaXMuY2FsY3VsYXRlRHVyYXRpb24pO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyID0gdGhpcy4kZWwuZmluZCgnLm1lbnUtY29udGFpbmVyJyk7XHJcciAgICAgICAgbmV3IENvbnRleHRNZW51Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyICAgICAgICB9KS5yZW5kZXIoKTtcclxyICAgICAgICAvLyBuZXcgdGFzayBidXR0b25cciAgICAgICAgJCgnLm5ldy10YXNrJykuY2xpY2soZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB2YXIgbGFzdFRhc2sgPSBwYXJhbXMuY29sbGVjdGlvbi5sYXN0KCk7XHIgICAgICAgICAgICB2YXIgbGFzdEluZGV4ID0gLTE7XHIgICAgICAgICAgICBpZiAobGFzdFRhc2spIHtcciAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSBsYXN0VGFzay5nZXQoJ3NvcnRpbmRleCcpO1xyICAgICAgICAgICAgfVxyICAgICAgICAgICAgcGFyYW1zLmNvbGxlY3Rpb24uYWRkKHtcciAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyICAgICAgICAgICAgICAgIHNvcnRpbmRleDogbGFzdEluZGV4ICsgMVxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyXHIgICAgICAgIG5ldyBOb3RpZmljYXRpb25zKHtcciAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KTtcclxyXHJcclxyICAgICAgICBuZXcgVG9wTWVudVZpZXcoe1xyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEdhbnR0Q2hhcnRWaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcucmVuZGVyKCk7XHIgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcciAgICAgICAgICAgIC8vIHNldCBzaWRlIHRhc2tzIHBhbmVsIGhlaWdodFxyICAgICAgICAgICAgdmFyICRzaWRlUGFuZWwgPSAkKCcubWVudS1jb250YWluZXInKTtcciAgICAgICAgICAgICRzaWRlUGFuZWwuY3NzKHtcciAgICAgICAgICAgICAgICAnbWluLWhlaWdodCc6IHdpbmRvdy5pbm5lckhlaWdodCAtICRzaWRlUGFuZWwub2Zmc2V0KCkudG9wXHIgICAgICAgICAgICB9KTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xyXHJcciAgICAgICAgdmFyIHRhc2tzQ29udGFpbmVyID0gJCgnLnRhc2tzJykuZ2V0KDApO1xyICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyICAgICAgICAgICAgfSksXHIgICAgICAgICAgICB0YXNrc0NvbnRhaW5lclxyICAgICAgICApO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCcsIF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRhc2tzQ29udGFpbmVyKTtcciAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcciAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQ6IHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpXHIgICAgICAgICAgICAgICAgfSksXHIgICAgICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgICAgICk7XHIgICAgICAgIH0uYmluZCh0aGlzKSw1KSk7XHJcciAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHtcciAgICAgICAgICAgIHZhciB5ID0gTWF0aC5tYXgoMCwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgd2luZG93LnNjcm9sbFkpO1xyICAgICAgICAgICAgJCgnLm1lbnUtaGVhZGVyJykuY3NzKHtcciAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICh5KSArICdweCdcciAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgJCgnLnRhc2tzJykuY3NzKHtcciAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICctJyArIHkgKyAncHgnXHIgICAgICAgICAgICB9KTtcciAgICAgICAgfSk7XHIgICAgfSxcciAgICBldmVudHM6IHtcciAgICAgICAgJ2NsaWNrICN0SGFuZGxlJzogJ2V4cGFuZCcsXHIgICAgICAgICdjbGljayAjZGVsZXRlQWxsJzogJ2RlbGV0ZUFsbCdcciAgICB9LFxyICAgIGNhbGN1bGF0ZUR1cmF0aW9uOiBmdW5jdGlvbigpe1xyXHIgICAgICAgIC8vIENhbGN1bGF0aW5nIHRoZSBkdXJhdGlvbiBmcm9tIHN0YXJ0IGFuZCBlbmQgZGF0ZVxyICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cInN0YXJ0XCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgZW5kZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHIgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPT0gXCJcIiAmJiBlbmRkYXRlICE9PSBcIlwiKXtcciAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgIHZhciB1dGMyID0gRGF0ZS5VVEMoZW5kZGF0ZS5nZXRGdWxsWWVhcigpLCBlbmRkYXRlLmdldE1vbnRoKCksIGVuZGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyICAgICAgICB9ZWxzZXtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKDApKTtcciAgICAgICAgfVxyICAgIH0sXHIgICAgZXhwYW5kOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LnRhcmdldCk7XHIgICAgICAgIGlmIChidXR0b24uaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtZXhwYW5kZWQnKTtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuYWRkQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgfVxyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5fbW92ZUNhbnZhc1ZpZXcoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA2MDApO1xyICAgICAgICBidXR0b24udG9nZ2xlQ2xhc3MoJ2NvbnRyYWN0Jyk7XHIgICAgfSxcciAgICBfbW92ZUNhbnZhc1ZpZXc6IGZ1bmN0aW9uKCkge1xyICAgICAgICB2YXIgc2lkZUJhcldpZHRoID0gJCgnLm1lbnUtY29udGFpbmVyJykud2lkdGgoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldExlZnRQYWRkaW5nKHNpZGVCYXJXaWR0aCk7XHIgICAgfSxcciAgICBkZWxldGVBbGw6IGZ1bmN0aW9uKCkge1xyICAgICAgICAkKCcjY29uZmlybScpLm1vZGFsKHtcciAgICAgICAgICAgIG9uSGlkZGVuOiBmdW5jdGlvbigpIHtcciAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyICAgICAgICAgICAgfSxcciAgICAgICAgICAgIG9uQXBwcm92ZTogZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICAgICAgd2hpbGUodGhpcy5jb2xsZWN0aW9uLmF0KDApKSB7XHIgICAgICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5hdCgwKS5kZXN0cm95KCk7XHIgICAgICAgICAgICAgICAgfVxyICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHIgICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gR2FudHRWaWV3O1xyIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIE1vZGFsVGFza0VkaXRDb21wb25lbnQgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZWRpdFRhc2snLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgICAgICAvLyBzZXR1cCB2YWx1ZXMgZm9yIHNlbGVjdG9yc1xyXG4gICAgICAgIHRoaXMuX3ByZXBhcmVTZWxlY3RzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy50YWJ1bGFyLm1lbnUgLml0ZW0nKS50YWIoKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0sIFtuYW1lPVwiZW5kXCJdJykuZGF0ZXBpY2tlcih7XHJcbi8vICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICB0aGlzLl9saXN0ZW5JbnB1dHMoKTtcclxuXHJcbiAgICB9LFxyXG4gICAgX2xpc3RlbklucHV0cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkbWlsZXN0b25lID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJtaWxlc3RvbmVcIl0nKTtcclxuICAgICAgICB2YXIgJGRlbGl2ZXJhYmxlID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJkZWxpdmVyYWJsZVwiXScpO1xyXG4gICAgICAgIHZhciAkc3RhcnQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdJyk7XHJcbiAgICAgICAgdmFyICRlbmQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImVuZFwiXScpO1xyXG4gICAgICAgICRtaWxlc3RvbmUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gJG1pbGVzdG9uZS5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgICRzdGFydC52YWwoJGVuZC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAkZGVsaXZlcmFibGUucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRkZWxpdmVyYWJsZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgkZGVsaXZlcmFibGUucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkbWlsZXN0b25lLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZVNlbGVjdHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhdHVzU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGF0dXNcIl0nKTtcclxuICAgICAgICBzdGF0dXNTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgaGVhbHRoU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJoZWFsdGhcIl0nKTtcclxuICAgICAgICBoZWFsdGhTZWxlY3QuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGksIGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGNoaWxkLnRleHQpO1xyXG4gICAgICAgICAgICAkKGNoaWxkKS5wcm9wKCd2YWx1ZScsIGlkKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgd29ya09yZGVyU2VsZWN0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJ3b1wiXScpO1xyXG4gICAgICAgIHdvcmtPcmRlclNlbGVjdC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMud29kYXRhWzBdLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICQoJzxvcHRpb24gdmFsdWU9XCInICsgZGF0YS5JRCArICdcIj4nICsgZGF0YS5XT051bWJlciArICc8L29wdGlvbj4nKS5hcHBlbmRUbyh3b3JrT3JkZXJTZWxlY3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGF0dXMnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2hlYWx0aCcgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aEZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnd28nICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRXT0ZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0V09JZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlU3RyID0gJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KCksIHZhbCk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5nZXQoMCkudmFsdWUgPSBkYXRlU3RyO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0ZXBpY2tlciggXCJyZWZyZXNoXCIgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2NoZWNrZWQnLCB2YWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQudmFsKHZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJtaWxlc3RvbmVcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX3NhdmVEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBpbnB1dC52YWwoKS5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgbmV3IERhdGUodmFsdWUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdjaGVja2JveCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQucHJvcCgnY2hlY2tlZCcpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KGtleSwgaW5wdXQudmFsKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zYXZlKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbFRhc2tFZGl0Q29tcG9uZW50O1xyXG4iLCJ2YXIgTm90aWZpY2F0aW9ucyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2Vycm9yJywgXy5kZWJvdW5jZSh0aGlzLm9uRXJyb3IsIDEwKSk7XHJcbiAgICB9LFxyXG4gICAgb25FcnJvciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYXJndW1lbnRzKTtcclxuICAgICAgICBub3R5KHtcclxuICAgICAgICAgICAgdGV4dDogJ0Vycm9yIHdoaWxlIHNhdmluZyB0YXNrLCBwbGVhc2UgcmVmcmVzaCB5b3VyIGJyb3dzZXIsIHJlcXVlc3Qgc3VwcG9ydCBpZiB0aGlzIGVycm9yIGNvbnRpbnVlcy4nLFxyXG4gICAgICAgICAgICBsYXlvdXQgOiAndG9wUmlnaHQnLFxyXG4gICAgICAgICAgICB0eXBlIDogJ2Vycm9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9ucztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cclxudmFyIFJlc291cmNlRWRpdG9yVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgIHZhciBzdGFnZVBvcyA9ICQoJyNnYW50dC1jb250YWluZXInKS5vZmZzZXQoKTtcclxuICAgICAgICB2YXIgZmFrZUVsID0gJCgnPGRpdj4nKS5hcHBlbmRUbygnYm9keScpO1xyXG4gICAgICAgIGZha2VFbC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIHRvcCA6IHBvcy55ICsgc3RhZ2VQb3MudG9wICsgJ3B4JyxcclxuICAgICAgICAgICAgbGVmdCA6IHBvcy54ICsgc3RhZ2VQb3MubGVmdCArICdweCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1cCA9ICQoJy5jdXN0b20ucG9wdXAnKTtcclxuICAgICAgICBmYWtlRWwucG9wdXAoe1xyXG4gICAgICAgICAgICBwb3B1cCA6IHRoaXMucG9wdXAsXHJcbiAgICAgICAgICAgIG9uIDogJ2hvdmVyJyxcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYm90dG9tIGxlZnQnLFxyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdXAub2ZmKCcuZWRpdG9yJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLnBvcHVwKCdzaG93Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FkZFJlc291cmNlcygpO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnLmJ1dHRvbicpLm9uKCdjbGljay5lZGl0b3InLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3B1cC5wb3B1cCgnaGlkZScpO1xyXG4gICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVwLm9mZignLmVkaXRvcicpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2Z1bGxEYXRhKCk7XHJcbiAgICB9LFxyXG4gICAgX2FkZFJlc291cmNlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucG9wdXAuZW1wdHkoKTtcclxuICAgICAgICB2YXIgaHRtbFN0cmluZyA9ICcnO1xyXG4gICAgICAgICh0aGlzLnNldHRpbmdzLnN0YXR1c2VzLnJlc291cmNlZGF0YSB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBodG1sU3RyaW5nICs9ICc8ZGl2IGNsYXNzPVwidWkgY2hlY2tib3hcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICBuYW1lPVwiJyArIHJlc291cmNlLlVzZXJJZCArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGxhYmVsPicgKyByZXNvdXJjZS5Vc2VybmFtZSArICc8L2xhYmVsPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pjxicj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGh0bWxTdHJpbmcgKz0nPGJyPjxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48ZGl2IGNsYXNzPVwidWkgcG9zaXRpdmUgcmlnaHQgYnV0dG9uIHNhdmUgdGlueVwiPicgK1xyXG4gICAgICAgICAgICAgICAgJ0Nsb3NlJyArXHJcbiAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgICAgIHRoaXMucG9wdXAuYXBwZW5kKGh0bWxTdHJpbmcpO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnLnVpLmNoZWNrYm94JykuY2hlY2tib3goKTtcclxuICAgIH0sXHJcbiAgICBfZnVsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcG9wdXAgPSB0aGlzLnBvcHVwO1xyXG4gICAgICAgIHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIHBvcHVwLmZpbmQoJ1tuYW1lPVwiJyArIHJlc291cmNlICsgJ1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCdpbnB1dCcpLmVhY2goZnVuY3Rpb24oaSwgaW5wdXQpIHtcclxuICAgICAgICAgICAgdmFyICRpbnB1dCA9ICQoaW5wdXQpO1xyXG4gICAgICAgICAgICBpZiAoJGlucHV0LnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzLnB1c2goJGlucHV0LmF0dHIoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KCdyZXNvdXJjZXMnLCByZXNvdXJjZXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzb3VyY2VFZGl0b3JWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGaWx0ZXJWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2ZpbHRlci1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2hhbmdlICNoaWdodGxpZ2h0cy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgaGlnaHRsaWdodFRhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaHRsaWdodFRhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdGhpcy5jb2xvcnNbZS50YXJnZXQudmFsdWVdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjaGFuZ2UgI2ZpbHRlcnMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGNyaXRlcmlhID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChjcml0ZXJpYSA9PT0gJ3Jlc2V0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2hvd1Rhc2tzID0gdGhpcy5fZ2V0TW9kZWxzRm9yQ3JpdGVyaWEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG93VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaG93IGFsbCBwYXJlbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0YXNrLnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUocGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbG9ycyA6IHtcclxuICAgICAgICAnc3RhdHVzLWJhY2tsb2cnIDogJyNEMkQyRDknLFxyXG4gICAgICAgICdzdGF0dXMtcmVhZHknIDogJyNCMkQxRjAnLFxyXG4gICAgICAgICdzdGF0dXMtaW4gcHJvZ3Jlc3MnIDogJyM2NkEzRTAnLFxyXG4gICAgICAgICdzdGF0dXMtY29tcGxldGUnIDogJyM5OUMyOTknLFxyXG4gICAgICAgICdsYXRlJyA6ICcjRkZCMkIyJyxcclxuICAgICAgICAnZHVlJyA6ICcgI0ZGQzI5OScsXHJcbiAgICAgICAgJ21pbGVzdG9uZScgOiAnI0Q2QzJGRicsXHJcbiAgICAgICAgJ2RlbGl2ZXJhYmxlJyA6ICcjRTBEMUMyJyxcclxuICAgICAgICAnZmluYW5jaWFsJyA6ICcjRjBFMEIyJyxcclxuICAgICAgICAndGltZXNoZWV0cycgOiAnI0MyQzJCMicsXHJcbiAgICAgICAgJ3JlcG9ydGFibGUnIDogJyAjRTBDMkMyJyxcclxuICAgICAgICAnaGVhbHRoLXJlZCcgOiAncmVkJyxcclxuICAgICAgICAnaGVhbHRoLWFtYmVyJyA6ICcjRkZCRjAwJyxcclxuICAgICAgICAnaGVhbHRoLWdyZWVuJyA6ICdncmVlbidcclxuICAgIH0sXHJcbiAgICBfZ2V0TW9kZWxzRm9yQ3JpdGVyaWEgOiBmdW5jdGlvbihjcmV0ZXJpYSkge1xyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ3Jlc2V0cycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignc3RhdHVzJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gKHRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0lkKHN0YXR1cykgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnc3RhdHVzJykudG9TdHJpbmcoKSA9PT0gaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdsYXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpIDwgbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2R1ZScpIHtcclxuICAgICAgICAgICAgdmFyIGxhc3REYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgbGFzdERhdGUuYWRkV2Vla3MoMik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPiBuZXcgRGF0ZSgpICYmIHRhc2suZ2V0KCdlbmQnKSA8IGxhc3REYXRlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFsnbWlsZXN0b25lJywgJ2RlbGl2ZXJhYmxlJywgJ2ZpbmFuY2lhbCcsICd0aW1lc2hlZXRzJywgJ3JlcG9ydGFibGUnXS5pbmRleE9mKGNyZXRlcmlhKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KGNyZXRlcmlhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdoZWFsdGgnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aCA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoSWQgPSAodGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoSWQoaGVhbHRoKSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdoZWFsdGgnKS50b1N0cmluZygpID09PSBoZWFsdGhJZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlclZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZ3JvdXBpbmctbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NsaWNrICN0b3AtZXhwYW5kLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICN0b3AtY29sbGFwc2UtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcm91cGluZ01lbnVWaWV3O1xyXG4iLCJ2YXIgcGFyc2VYTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZVhNTE9iajtcclxudmFyIHRhc2tzVG9YTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS50YXNrc1RvWE1MO1xyXG52YXIgcGFyc2VEZXBzRnJvbVhNTCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3htbFdvcmtlcicpLnBhcnNlRGVwc0Zyb21YTUw7XHJcblxyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyNwcm9qZWN0LW1lbnUnLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9zZXR1cElucHV0KCk7XHJcbiAgICB9LFxyXG4gICAgX3NldHVwSW5wdXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpbnB1dCA9ICQoJyNpbXBvcnRGaWxlJyk7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICAgICAgdmFyIGZpbGVzID0gZXZ0LnRhcmdldC5maWxlcztcclxuICAgICAgICAgICAgXy5lYWNoKGZpbGVzLCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBmaWxlLm5hbWUuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgICAgIHZhciBleHRlbnRpb24gPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVudGlvbiAhPT0gJ3htbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgnVGhlIGZpbGUgdHlwZSBcIicgKyBleHRlbnRpb24gKyAnXCIgaXMgbm90IHN1cHBvcnRlZC4gT25seSB4bWwgZmlsZXMgYXJlIGFsbG93ZWQuIFBsZWFzZSBzYXZlIHlvdXIgTVMgcHJvamVjdCBhcyBhIHhtbCBmaWxlIGFuZCB0cnkgYWdhaW4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYueG1sRGF0YSA9IGUudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdFcnJvciB3aGlsZSBwYXJpbmcgZmlsZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGV2ZW50czoge1xyXG4gICAgICAgICdjbGljayAjdXBsb2FkLXByb2plY3QnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJyNtc2ltcG9ydCcpLm1vZGFsKHtcclxuICAgICAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMueG1sRGF0YSB8fCB0aGlzLmltcG9ydGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1wb3J0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI2ltcG9ydFByb2dyZXNzXCIpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiI2ltcG9ydEZpbGVcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3htbGlucHV0LWZvcm0nKS50cmlnZ2VyKCdyZXNldCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5pbXBvcnREYXRhLmJpbmQodGhpcyksIDIwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgICAgJChcIiNpbXBvcnRQcm9ncmVzc1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjaW1wb3J0RmlsZVwiKS5zaG93KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI2Rvd25sb2FkLXByb2plY3QnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGFza3NUb1hNTCh0aGlzLmNvbGxlY3Rpb24pO1xyXG4gICAgICAgICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwge3R5cGUgOiAnYXBwbGljYXRpb24vanNvbid9KTtcclxuICAgICAgICAgICAgc2F2ZUFzKGJsb2IsICdHYW50dFRhc2tzLnhtbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwcm9ncmVzcyA6IGZ1bmN0aW9uKHBlcmNlbnQpIHtcclxuICAgICAgICAkKCcjaW1wb3J0UHJvZ3Jlc3MnKS5wcm9ncmVzcyh7XHJcbiAgICAgICAgICAgIHBlcmNlbnQgOiBwZXJjZW50XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVEYXRhIDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHZhciBkZWZTdGF0dXMgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0U3RhdHVzSWQoKTtcclxuICAgICAgICB2YXIgZGVmSGVhbHRoID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdEhlYWx0aElkKCk7XHJcbiAgICAgICAgdmFyIGRlZldPID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFdPSWQoKTtcclxuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBpdGVtLmhlYWx0aCA9IGRlZkhlYWx0aDtcclxuICAgICAgICAgICAgaXRlbS5zdGF0dXMgPSBkZWZTdGF0dXM7XHJcbiAgICAgICAgICAgIGl0ZW0ud28gPSBkZWZXTztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH0sXHJcbiAgICBpbXBvcnREYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGRlbGF5ID0gMTAwO1xyXG4gICAgICAgIHRoaXMucHJvZ3Jlc3MoMCk7XHJcbiAgICAgICAgLy8gdGhpcyBpcyBzb21lIHNvcnQgb2YgY2FsbGJhY2sgaGVsbCEhXHJcbiAgICAgICAgLy8gd2UgbmVlZCB0aW1lb3V0cyBmb3IgYmV0dGVyIHVzZXIgZXhwZXJpZW5jZVxyXG4gICAgICAgIC8vIEkgdGhpbmsgdXNlciB3YW50IHRvIHNlZSBhbmltYXRlZCBwcm9ncmVzcyBiYXJcclxuICAgICAgICAvLyBidXQgd2l0aG91dCB0aW1lb3V0cyBpdCBpcyBub3QgcG9zc2libGUsIHJpZ2h0P1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MoMTApO1xyXG4gICAgICAgICAgICB2YXIgY29sID0gdGhpcy5jb2xsZWN0aW9uO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHBhcnNlWE1MKHRoaXMueG1sRGF0YSk7XHJcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9wcmVwYXJlRGF0YShkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDI2KTtcclxuICAgICAgICAgICAgICAgIGNvbC5pbXBvcnRUYXNrcyhkYXRhLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDQzKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDU5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlcHMgPSBwYXJzZURlcHNGcm9tWE1MKHRoaXMueG1sRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDc4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbC5jcmVhdGVEZXBzKGRlcHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzKDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXNpbXBvcnQnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTVNQcm9qZWN0TWVudVZpZXc7XHJcbiIsInZhciBSZXBvcnRzTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyNyZXBvcnRzLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgICAnY2xpY2sgI3ByaW50JzogJ2dlbmVyYXRlUERGJyxcclxuICAgICAgICAnY2xpY2sgI3Nob3dWaWRlbyc6ICdzaG93SGVscCdcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZVBERjogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgd2luZG93LnByaW50KCk7XHJcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9LFxyXG4gICAgc2hvd0hlbHA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNzaG93VmlkZW9Nb2RhbCcpLm1vZGFsKHtcclxuICAgICAgICAgICAgb25IaWRkZW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25BcHByb3ZlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVwb3J0c01lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFpvb21NZW51VmlldyA9IHJlcXVpcmUoJy4vWm9vbU1lbnVWaWV3Jyk7XHJcbnZhciBHcm91cGluZ01lbnVWaWV3ID0gcmVxdWlyZSgnLi9Hcm91cGluZ01lbnVWaWV3Jyk7XHJcbnZhciBGaWx0ZXJNZW51VmlldyA9IHJlcXVpcmUoJy4vRmlsdGVyTWVudVZpZXcnKTtcclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9NU1Byb2plY3RNZW51VmlldycpO1xyXG52YXIgTWlzY01lbnVWaWV3ID0gcmVxdWlyZSgnLi9NaXNjTWVudVZpZXcnKTtcclxuXHJcbnZhciBUb3BNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICBuZXcgWm9vbU1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IEdyb3VwaW5nTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgRmlsdGVyTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgTVNQcm9qZWN0TWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgTWlzY01lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUb3BNZW51VmlldztcclxuIiwidmFyIFpvb21NZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI3pvb20tbWVudScsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX2hpZ2h0bGlnaHRTZWxlY3RlZCgpO1xyXG4gICAgfSxcclxuICAgIGV2ZW50czoge1xyXG4gICAgICAgICdjbGljayAuYWN0aW9uJzogJ29uSW50ZXJ2YWxCdXR0b25DbGlja2VkJ1xyXG4gICAgfSxcclxuICAgIG9uSW50ZXJ2YWxCdXR0b25DbGlja2VkOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gJChldnQuY3VycmVudFRhcmdldCk7XHJcbiAgICAgICAgdmFyIGludGVydmFsID0gYnV0dG9uLmRhdGEoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyXG4gICAgICAgIHRoaXMuX2hpZ2h0bGlnaHRTZWxlY3RlZCgpO1xyXG4gICAgfSxcclxuICAgIF9oaWdodGxpZ2h0U2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuJCgnLmFjdGlvbicpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cclxuICAgICAgICBsZXQgaW50ZXJ2YWwgPSB0aGlzLnNldHRpbmdzLmdldCgnaW50ZXJ2YWwnKTtcclxuICAgICAgICB0aGlzLiQoJ1tkYXRhLWludGVydmFsPVwiJyArIGludGVydmFsICsgJ1wiXScpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gWm9vbU1lbnVWaWV3O1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBBbG9uZVRhc2tWaWV3ID0gQmFzaWNUYXNrVmlldy5leHRlbmQoe1xyXG4gICAgX2JvcmRlcldpZHRoIDogMyxcclxuICAgIF9jb2xvciA6ICcjRTZGMEZGJyxcclxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBfLmV4dGVuZChCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5ldmVudHMoKSwge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUgLmxlZnRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5yaWdodEJvcmRlcicgOiAnX2NoYW5nZVNpemUnLFxyXG5cclxuICAgICAgICAgICAgJ2RyYWdlbmQgLmxlZnRCb3JkZXInIDogJ3JlbmRlcicsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5yaWdodEJvcmRlcicgOiAncmVuZGVyJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLmxlZnRCb3JkZXInIDogJ19yZXNpemVQb2ludGVyJyxcclxuICAgICAgICAgICAgJ21vdXNlb3V0IC5sZWZ0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJyxcclxuXHJcbiAgICAgICAgICAgICdtb3VzZW92ZXIgLnJpZ2h0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAucmlnaHRCb3JkZXInIDogJ19kZWZhdWx0TW91c2UnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5lbC5nZXRTdGFnZSgpLngoKSArIHRoaXMuZWwueCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsWCA9IHBvcy54IC0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB4IDogTWF0aC5taW4obG9jYWxYLCB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWF4KGxvY2FsWCwgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoKSkgKyBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA6IHRoaXMuX3kgKyB0aGlzLl90b3BQYWRkaW5nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIHdpZHRoIDogdGhpcy5fYm9yZGVyV2lkdGgsXHJcbiAgICAgICAgICAgIGZpbGwgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9yZXNpemVQb2ludGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZXctcmVzaXplJztcclxuICAgIH0sXHJcbiAgICBfY2hhbmdlU2l6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZWZ0WCA9IHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCk7XHJcbiAgICAgICAgdmFyIHJpZ2h0WCA9IHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCgpICsgdGhpcy5fYm9yZGVyV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LndpZHRoKHJpZ2h0WCAtIGxlZnRYKTtcclxuICAgICAgICByZWN0LngobGVmdFgpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdO1xyXG4gICAgICAgIGNvbXBsZXRlUmVjdC54KGxlZnRYKTtcclxuICAgICAgICBjb21wbGV0ZVJlY3Qud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuXHJcbiAgICAgICAgLy8gbW92ZSB0b29sIHBvc2l0aW9uXHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wueChyaWdodFgpO1xyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKVswXTtcclxuICAgICAgICByZXNvdXJjZXMueChyaWdodFggKyB0aGlzLl90b29sYmFyT2Zmc2V0KTtcclxuXHJcbiAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEgLSB0aGlzLl9ib3JkZXJXaWR0aCk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5kaWFtb25kJykuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JykuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJykuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpLmhpZGUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5kaWFtb25kJykuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0Jykuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJykuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpLnNob3coKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbG9uZVRhc2tWaWV3O1xyXG4iLCJcclxudmFyIFJlc291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi4vUmVzb3VyY2VzRWRpdG9yJyk7XHJcblxyXG52YXIgbGlua0ltYWdlID0gbmV3IEltYWdlKCk7XHJcbmxpbmtJbWFnZS5zcmMgPSAnY3NzL2ltYWdlcy9saW5rLnBuZyc7XHJcblxyXG52YXIgdXNlckltYWdlID0gbmV3IEltYWdlKCk7XHJcbnVzZXJJbWFnZS5zcmMgPSAnY3NzL2ltYWdlcy91c2VyLnBuZyc7XHJcblxyXG52YXIgQmFzaWNUYXNrVmlldyA9IEJhY2tib25lLktvbnZhVmlldy5leHRlbmQoe1xyXG4gICAgX2Z1bGxIZWlnaHQ6IDIxLFxyXG4gICAgX3RvcFBhZGRpbmc6IDMsXHJcbiAgICBfYmFySGVpZ2h0OiAxNSxcclxuICAgIF9jb21wbGV0ZUNvbG9yOiAnI2U4ODEzNCcsXHJcbiAgICBfdG9vbGJhck9mZnNldDogMjAsXHJcbiAgICBfcmVzb3VyY2VMaXN0T2Zmc2V0OiAyMCxcclxuICAgIF9taWxlc3RvbmVDb2xvcjogJ2JsdWUnLFxyXG4gICAgX21pbGVzdG9uZU9mZnNldDogMCxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5fZnVsbEhlaWdodDtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuX2luaXRNb2RlbEV2ZW50cygpO1xyXG4gICAgICAgIHRoaXMuX2luaXRTZXR0aW5nc0V2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIGV2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVUeXBlICE9PSAnR3JvdXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdlbmQnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuc2F2ZVdpdGhDaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ21vdXNlZW50ZXInOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93VG9vbHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVSZXNvdXJjZXNMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ncmFiUG9pbnRlcihlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ21vdXNlbGVhdmUnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVUb29scygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd1Jlc291cmNlc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRNb3VzZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ3N0YXJ0IC5kZXBlbmRlbmN5VG9vbCc6ICdfc3RhcnRDb25uZWN0aW5nJyxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5kZXBlbmRlbmN5VG9vbCc6ICdfbW92ZUNvbm5lY3QnLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAuZGVwZW5kZW5jeVRvb2wnOiAnX2NyZWF0ZURlcGVuZGVuY3knLFxyXG4gICAgICAgICAgICAnY2xpY2sgLnJlc291cmNlcyc6ICdfZWRpdFJlc291cmNlcydcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBuZXcgS29udmEuR3JvdXAoe1xyXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogcG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5feVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBpZDogdGhpcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBmYWtlQmFja2dyb3VuZCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWU6ICdmYWtlQmFja2dyb3VuZCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgcmVjdCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lOiAnbWFpblJlY3QnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGRpYW1vbmQgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuX21pbGVzdG9uZUNvbG9yLFxyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0IC8gMixcclxuICAgICAgICAgICAgeDogdGhpcy5fYmFySGVpZ2h0IC8gMixcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9iYXJIZWlnaHQgKiAwLjgsXHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjgsXHJcbiAgICAgICAgICAgIG9mZnNldFg6IHRoaXMuX2JhckhlaWdodCAqIDAuOCAvIDIsXHJcbiAgICAgICAgICAgIG9mZnNldFk6IHRoaXMuX2JhckhlaWdodCAqIDAuOCAvIDIsXHJcbiAgICAgICAgICAgIG5hbWU6ICdkaWFtb25kJyxcclxuICAgICAgICAgICAgcm90YXRpb246IDQ1LFxyXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lOiAnY29tcGxldGVSZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgaG9yT2Zmc2V0ID0gNjtcclxuICAgICAgICB2YXIgYXJjID0gbmV3IEtvbnZhLlNoYXBlKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgZmlsbDogJ2xpZ2h0Z3JlZW4nLFxyXG4gICAgICAgICAgICBzY2VuZUZ1bmM6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaXplID0gc2VsZi5fYmFySGVpZ2h0ICsgKHNlbGYuX2JvcmRlclNpemUgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhob3JPZmZzZXQsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoaG9yT2Zmc2V0LCBzaXplIC8gMiwgc2l6ZSAvIDIsIC1NYXRoLlBJIC8gMiwgTWF0aC5QSSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgc2l6ZSk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbygwLCAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFNoYXBlKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGltZ1NpemUgPSBzaXplIC0gNDtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGxpbmtJbWFnZSwgMSwgKHNpemUgLSBpbWdTaXplKSAvIDIsIGltZ1NpemUsIGltZ1NpemUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoaXRGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5yZWN0KDAsIDAsIDYgKyBzZWxmLl9iYXJIZWlnaHQsIHNlbGYuX2JhckhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmFtZTogJ2RlcGVuZGVuY3lUb29sJyxcclxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgdG9vbGJhciA9IG5ldyBLb252YS5Hcm91cCh7XHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIG5hbWU6ICdyZXNvdXJjZXMnLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzaXplID0gc2VsZi5fYmFySGVpZ2h0ICsgKHNlbGYuX2JvcmRlclNpemUgfHwgMCk7XHJcbiAgICAgICAgdmFyIHRvb2xiYWNrID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsOiAnbGlnaHRncmV5JyxcclxuICAgICAgICAgICAgd2lkdGg6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcclxuICAgICAgICAgICAgY29ybmVyUmFkaXVzOiAyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB1c2VySW0gPSBuZXcgS29udmEuSW1hZ2Uoe1xyXG4gICAgICAgICAgICBpbWFnZTogdXNlckltYWdlLFxyXG4gICAgICAgICAgICB3aWR0aDogc2l6ZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiBzaXplXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9vbGJhci5hZGQodG9vbGJhY2ssIHVzZXJJbSk7XHJcblxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSBuZXcgS29udmEuVGV4dCh7XHJcbiAgICAgICAgICAgIG5hbWU6ICdyZXNvdXJjZUxpc3QnLFxyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBsaXN0ZW5pbmc6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyb3VwLmFkZChmYWtlQmFja2dyb3VuZCwgZGlhbW9uZCwgcmVjdCwgY29tcGxldGVSZWN0LCBhcmMsIHRvb2xiYXIsIHJlc291cmNlTGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF9lZGl0UmVzb3VyY2VzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBSZXNvdXJjZUVkaXRvcih7XHJcbiAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxyXG4gICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLmVsLmdldFN0YWdlKCkuZ2V0UG9pbnRlclBvc2l0aW9uKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIocG9zKTtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLnJvdW5kKHggLyBkYXlzV2lkdGgpLCBkYXlzMiA9IE1hdGgucm91bmQoKHggKyBsZW5ndGgpIC8gZGF5c1dpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcclxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zaG93VG9vbHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9oaWRlVG9vbHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9zaG93UmVzb3VyY2VzTGlzdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0Jykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVJlc291cmNlc0xpc3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2dyYWJQb2ludGVyOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBlLnRhcmdldC5uYW1lKCk7XHJcbiAgICAgICAgaWYgKChuYW1lID09PSAnbWFpblJlY3QnKSB8fCAobmFtZSA9PT0gJ2RlcGVuZGVuY3lUb29sJykgfHxcclxuICAgICAgICAgICAgKG5hbWUgPT09ICdjb21wbGV0ZVJlY3QnKSB8fCAoZS50YXJnZXQuZ2V0UGFyZW50KCkubmFtZSgpID09PSAncmVzb3VyY2VzJykpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9kZWZhdWx0TW91c2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xyXG4gICAgfSxcclxuICAgIF9zdGFydENvbm5lY3Rpbmc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC5oaWRlKCk7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRvb2wuZ2V0QWJzb2x1dGVQb3NpdGlvbigpO1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSBuZXcgS29udmEuQXJyb3coe1xyXG4gICAgICAgICAgICBzdHJva2U6ICdkYXJrZ3JlZW4nLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMSxcclxuICAgICAgICAgICAgcG9pbnRlcldpZHRoOiA2LFxyXG4gICAgICAgICAgICBwb2ludGVySGVpZ2h0OiAxMCxcclxuICAgICAgICAgICAgZmlsbDogJ2dyZXknLFxyXG4gICAgICAgICAgICBwb2ludHM6IFtwb3MueCAtIHN0YWdlLngoKSwgcG9zLnkgKyB0aGlzLl9iYXJIZWlnaHQgLyAyLCBwb3MueCAtIHN0YWdlLngoKSwgcG9zLnldLFxyXG4gICAgICAgICAgICBuYW1lOiAnY29ubmVjdG9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5hZGQoY29ubmVjdG9yKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDb25uZWN0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHBvaW50cyA9IGNvbm5lY3Rvci5wb2ludHMoKTtcclxuICAgICAgICBwb2ludHNbMl0gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS54IC0gc3RhZ2UueCgpO1xyXG4gICAgICAgIHBvaW50c1szXSA9IHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLnk7XHJcbiAgICAgICAgY29ubmVjdG9yLnBvaW50cyhwb2ludHMpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEZXBlbmRlbmN5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gdGhpcy5lbC5nZXRMYXllcigpLmZpbmQoJy5jb25uZWN0b3InKVswXTtcclxuICAgICAgICBjb25uZWN0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBlbCA9IHN0YWdlLmdldEludGVyc2VjdGlvbihzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKSk7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gZWwgJiYgZWwuZ2V0UGFyZW50KCk7XHJcbiAgICAgICAgdmFyIHRhc2tJZCA9IGdyb3VwICYmIGdyb3VwLmlkKCk7XHJcbiAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5tb2RlbDtcclxuICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5nZXQodGFza0lkKTtcclxuICAgICAgICBpZiAoYWZ0ZXJNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHJlbW92ZUZvciA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5maW5kKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlbW92ZUZvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLnJlbW92ZURlcGVuZGVuY3kocmVtb3ZlRm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGRvbid0IHVwZGF0ZSBlbGVtZW50IHdoaWxlIGRyYWdnaW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQgY2hhbmdlOmNvbXBsZXRlIGNoYW5nZTpyZXNvdXJjZXMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGRyYWdnaW5nID0gdGhpcy5lbC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZ2V0Q2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZyA9IGRyYWdnaW5nIHx8IGNoaWxkLmlzRHJhZ2dpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVYOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSAtIDEpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogKERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMubW9kZWwuZ2V0KCdlbmQnKSkpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlQ29tcGxldGVXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgcmV0dXJuICh4LngyIC0geC54MSkgKiB0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIC8vIG1vdmUgZ3JvdXBcclxuICAgICAgICB0aGlzLmVsLngoeC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBmYWtlIGJhY2tncm91bmQgcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgYmFjayA9IHRoaXMuZWwuZmluZCgnLmZha2VCYWNrZ3JvdW5kJylbMF07XHJcbiAgICAgICAgYmFjay54KC0yMCk7XHJcbiAgICAgICAgYmFjay53aWR0aCh4LngyIC0geC54MSArIDYwKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIG1haW4gcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC54KDApO1xyXG4gICAgICAgIHJlY3Qud2lkdGgoeC54MiAtIHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY29tcGxldGUgcGFyYW1zXHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ud2lkdGgodGhpcy5fY2FsY3VsYXRlQ29tcGxldGVXaWR0aCgpKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS54KDApO1xyXG5cclxuICAgICAgICB2YXIgX21pbGVzdG9uZU9mZnNldCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICBfbWlsZXN0b25lT2Zmc2V0ID0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvb2wgcG9zaXRpb25cclxuICAgICAgICB2YXIgdG9vbCA9IHRoaXMuZWwuZmluZCgnLmRlcGVuZGVuY3lUb29sJylbMF07XHJcbiAgICAgICAgdG9vbC54KHgueDIgLSB4LngxICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgdG9vbC55KHRoaXMuX3RvcFBhZGRpbmcpO1xyXG5cclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VzLngoeC54MiAtIHgueDEgKyB0aGlzLl90b29sYmFyT2Zmc2V0ICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgcmVzb3VyY2VzLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2UgbGlzdFxyXG4gICAgICAgIHZhciByZXNvdXJjZUxpc3QgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKVswXTtcclxuICAgICAgICByZXNvdXJjZUxpc3QueCh4LngyIC0geC54MSArIHRoaXMuX3Jlc291cmNlTGlzdE9mZnNldCArIF9taWxlc3RvbmVPZmZzZXQpO1xyXG4gICAgICAgIHJlc291cmNlTGlzdC55KHRoaXMuX3RvcFBhZGRpbmcgKyAyKTtcclxuICAgICAgICB2YXIgbmFtZXMgPSBbXTtcclxuICAgICAgICB2YXIgbGlzdCA9IHRoaXMubW9kZWwuZ2V0KCdyZXNvdXJjZXMnKTtcclxuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2VJZCkge1xyXG4gICAgICAgICAgICB2YXIgcmVzID0gXy5maW5kKCh0aGlzLnNldHRpbmdzLnN0YXR1c2VzLnJlc291cmNlZGF0YSB8fCBbXSksIGZ1bmN0aW9uKHIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByLlVzZXJJZC50b1N0cmluZygpID09PSByZXNvdXJjZUlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPCAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChyZXMuVXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxpYXNlcyA9IF8ubWFwKHJlcy5Vc2VybmFtZS5zcGxpdCgnICcpLCBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0clswXTtcclxuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lcy5wdXNoKGFsaWFzZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXNvdXJjZUxpc3QudGV4dChuYW1lcy5qb2luKCcsICcpKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc2V0WTogZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuZWwueSh5KTtcclxuICAgIH0sXHJcbiAgICBnZXRZOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljVGFza1ZpZXc7XHJcbiIsInZhciBDb25uZWN0b3JWaWV3ID0gQmFja2JvbmUuS29udmFWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3I6ICdncmV5JyxcclxuICAgIF93cm9uZ0NvbG9yOiAncmVkJyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuYmVmb3JlTW9kZWwgPSBwYXJhbXMuYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgdGhpcy5hZnRlck1vZGVsID0gcGFyYW1zLmFmdGVyTW9kZWw7XHJcbiAgICAgICAgdGhpcy5feTEgPSAwO1xyXG4gICAgICAgIHRoaXMuX3kyID0gMDtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGxpbmUgPSBuZXcgS29udmEuTGluZSh7XHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHBvaW50czogWzAsIDAsIDAsIDBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9LFxyXG4gICAgc2V0WTE6IGZ1bmN0aW9uKHkxKSB7XHJcbiAgICAgICAgdGhpcy5feTEgPSB5MTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgfSxcclxuICAgIHNldFkyOiBmdW5jdGlvbih5Mikge1xyXG4gICAgICAgIHRoaXMuX3kyID0geTI7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIGlmICh4LngyID49IHgueDEpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fY29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbeC54MSwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTEsIHgueDEgKyAxMCwgdGhpcy5feTIsIHgueDIsIHRoaXMuX3kyXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5zdHJva2UodGhpcy5fd3JvbmdDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZWwucG9pbnRzKFtcclxuICAgICAgICAgICAgICAgIHgueDEsIHRoaXMuX3kxLFxyXG4gICAgICAgICAgICAgICAgeC54MSArIDEwLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MSArICh0aGlzLl95MiAtIHRoaXMuX3kxKSAvIDIsXHJcbiAgICAgICAgICAgICAgICB4LngyIC0gMTAsIHRoaXMuX3kyLFxyXG4gICAgICAgICAgICAgICAgeC54MiwgdGhpcy5feTJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVYOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHgxOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5hZnRlck1vZGVsLmdldCgnc3RhcnQnKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdG9yVmlldztcclxuIiwidmFyIE5lc3RlZFRhc2tWaWV3ID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrVmlldycpO1xudmFyIEFsb25lVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Fsb25lVGFza1ZpZXcnKTtcbnZhciBDb25uZWN0b3JWaWV3ID0gcmVxdWlyZSgnLi9Db25uZWN0b3JWaWV3Jyk7XG5cbnZhciBHYW50dENoYXJ0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICBlbDogJyNnYW50dC1jb250YWluZXInLFxuICAgIF90b3BQYWRkaW5nOiA3MyxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IFtdO1xuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IFtdO1xuICAgICAgICB0aGlzLl9pbml0U3RhZ2UoKTtcbiAgICAgICAgdGhpcy5faW5pdExheWVycygpO1xuICAgICAgICB0aGlzLl9pbml0QmFja2dyb3VuZCgpO1xuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcbiAgICAgICAgdGhpcy5faW5pdFN1YlZpZXdzKCk7XG4gICAgICAgIHRoaXMuX2luaXRDb2xsZWN0aW9uRXZlbnRzKCk7XG4gICAgfSxcbiAgICBzZXRMZWZ0UGFkZGluZzogZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgICAgIHRoaXMuX2xlZnRQYWRkaW5nID0gb2Zmc2V0O1xuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XG4gICAgfSxcbiAgICBfaW5pdFN0YWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGFnZSA9IG5ldyBLb252YS5TdGFnZSh7XG4gICAgICAgICAgICBjb250YWluZXI6IHRoaXMuZWxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcbiAgICB9LFxuICAgIF9pbml0TGF5ZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5GbGF5ZXIgPSBuZXcgS29udmEuTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5CbGF5ZXIgPSBuZXcgS29udmEuTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5Ub3BCYXJMYXllciA9IG5ldyBLb252YS5MYXllcigpO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZCh0aGlzLkJsYXllciwgdGhpcy5GbGF5ZXIsIHRoaXMuVG9wQmFyTGF5ZXIpO1xuICAgIH0sXG4gICAgX3VwZGF0ZVN0YWdlQXR0cnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xuICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBwcmV2aW91c1Rhc2tYID0gdGhpcy5fdGFza1ZpZXdzLmxlbmd0aCA/IHRoaXMuX3Rhc2tWaWV3c1swXS5lbC54KCkgOiAwO1xuICAgICAgICB0aGlzLnN0YWdlLnNldEF0dHJzKHtcbiAgICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgoJCgnLnRhc2tzJykuaW5uZXJIZWlnaHQoKSArIHRoaXMuX3RvcFBhZGRpbmcsIHdpbmRvdy5pbm5lckhlaWdodCAtICQodGhpcy5zdGFnZS5nZXRDb250YWluZXIoKSkub2Zmc2V0KCkudG9wKSxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLiRlbC5pbm5lcldpZHRoKCksXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXG4gICAgICAgICAgICBkcmFnQm91bmRGdW5jOiBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgeDtcbiAgICAgICAgICAgICAgICB2YXIgbWluWCA9IC0obGluZVdpZHRoIC0gdGhpcy53aWR0aCgpKTtcbiAgICAgICAgICAgICAgICBpZiAocG9zLnggPiBzZWxmLl9sZWZ0UGFkZGluZykge1xuICAgICAgICAgICAgICAgICAgICB4ID0gc2VsZi5fbGVmdFBhZGRpbmc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3MueCA8IG1pblgpIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IG1pblg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IHBvcy54O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmRyYWdnZWRUb0RheSA9IE1hdGguYWJzKHggLSBzZWxmLl9sZWZ0UGFkZGluZykgLyBzZWxmLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKS5kYXlzV2lkdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3Rhc2tWaWV3cy5sZW5ndGggfHwgIXByZXZpb3VzVGFza1gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLngodGhpcy5fbGVmdFBhZGRpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlueCA9IC0obGluZVdpZHRoIC0gdGhpcy5zdGFnZS53aWR0aCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMuX2xlZnRQYWRkaW5nIC0gKHRoaXMuZHJhZ2dlZFRvRGF5IHx8IDApICogc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2UueChNYXRoLm1heChtaW54LCB4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xuXG5cbiAgICB9LFxuICAgIF9pbml0QmFja2dyb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b3BCYXIgPSBuZXcgS29udmEuU2hhcGUoe1xuICAgICAgICAgICAgc2NlbmVGdW5jOiB0aGlzLl9nZXRUb3BCYXJTY2VuZUZ1bmN0aW9uKCksXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgICAgICBmaWxsOiAncmdiYSgwLDAsMCwwLjEpJyxcbiAgICAgICAgICAgIG5hbWU6ICd0b3BCYXInLFxuICAgICAgICAgICAgaGl0R3JhcGhFbmFibGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGdyaWQgPSBuZXcgS29udmEuU2hhcGUoe1xuICAgICAgICAgICAgc2NlbmVGdW5jOiB0aGlzLl9nZXRHcmlkU2NlbmVGdW5jdGlvbigpLFxuICAgICAgICAgICAgc3Ryb2tlOiAnbGlnaHRncmF5JyxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICAgICAgZmlsbDogJ3JnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICBuYW1lOiAnZ3JpZCcsXG4gICAgICAgICAgICBoaXRHcmFwaEVuYWJsZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xuICAgICAgICB2YXIgd2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XG4gICAgICAgIHZhciBiYWNrID0gbmV3IEtvbnZhLlJlY3Qoe1xuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YWdlLmhlaWdodCgpLFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgY3VycmVudERheUxpbmUgPSBuZXcgS29udmEuUmVjdCh7XG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc3RhZ2UuaGVpZ2h0KCksXG4gICAgICAgICAgICB3aWR0aDogMixcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgZmlsbDogJ2dyZWVuJyxcbiAgICAgICAgICAgIGxpc3RlbmluZzogZmFsc2UsXG4gICAgICAgICAgICBuYW1lOiAnY3VycmVudERheUxpbmUnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgeSA9IE1hdGgubWF4KDAsIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IHdpbmRvdy5zY3JvbGxZKTtcbiAgICAgICAgICAgIHRvcEJhci55KHkpO1xuICAgICAgICAgICAgdG9wQmFyLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuQmxheWVyLmFkZChiYWNrKS5hZGQoY3VycmVudERheUxpbmUpLmFkZChncmlkKTtcbiAgICAgICAgdGhpcy5Ub3BCYXJMYXllci5hZGQodG9wQmFyKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XG4gICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xuICAgIH0sXG4gICAgX2dldFRvcEJhclNjZW5lRnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZGlzcGxheSA9IHRoaXMuc2V0dGluZ3Muc2Rpc3BsYXk7XG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XG4gICAgICAgIHZhciBvZmZzZXQgPSAxO1xuICAgICAgICB2YXIgcm93SGVpZ2h0ID0gMjA7XG5cblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XG4gICAgICAgICAgICB2YXIgaSwgcywgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xuICAgICAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcblxuICAgICAgICAgICAgLy8gY2xlYXIgYmFja2dvdW5kXG4gICAgICAgICAgICAvLyBzbyBhbGwgc2hhcGVzIHVuZGVyIHdpbGwgYmUgbm90IHZpc2libGVcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgICAgICAgIGNvbnRleHQucmVjdCgwLCAwLCBsaW5lV2lkdGggKyBvZmZzZXQsIDMgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsKCk7XG5cblxuXG4gICAgICAgICAgICAvL2RyYXcgdGhyZWUgaG9yaXpvbnRhbCBsaW5lc1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdsaWdodGdyZXknO1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGZvcihpID0gMTsgaSA8IDQ7IGkrKyl7XG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8ob2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhsaW5lV2lkdGggKyBvZmZzZXQsIGkgKiByb3dIZWlnaHQgLSBvZmZzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcblxuXG4gICAgICAgICAgICAvLyBkcmF3IHllYXJzL21vbnRoXG4gICAgICAgICAgICAvLyB3aXRoIGxpbmVzXG4gICAgICAgICAgICB2YXIgeWkgPSAwLCB5ZiA9IHJvd0hlaWdodCwgeGkgPSAwO1xuICAgICAgICAgICAgZm9yIChzID0gMTsgcyA8IDM7IHMrKyl7XG4gICAgICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IGhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xuICAgICAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB5Zik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxMHB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWYgLSByb3dIZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHlpID0geWY7IHlmID0geWYgKyByb3dIZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRyYXcgZGF5c1xuICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7IHMgPSAzO1xuICAgICAgICAgICAgdmFyIGRyYWdJbnQgPSBwYXJzZUludChzYXR0ci5kcmFnSW50ZXJ2YWwsIDEwKTtcbiAgICAgICAgICAgIHZhciBoaWRlRGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYoIGRyYWdJbnQgPT09IDE0IHx8IGRyYWdJbnQgPT09IDMwKXtcbiAgICAgICAgICAgICAgICBoaWRlRGF0ZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gaERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XG4gICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XG4gICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKGhEYXRhW3NdW2ldLmhvbHkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnbGlnaHRncmF5JztcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHlpICsgcm93SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHlpICsgcm93SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHlpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnNnB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgICAgICAgaWYgKGhpZGVEYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhoRGF0YVtzXVtpXS50ZXh0KTtcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5aSArIHJvd0hlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgX2dldEdyaWRTY2VuZUZ1bmN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNkaXNwbGF5ID0gdGhpcy5zZXR0aW5ncy5zZGlzcGxheTtcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gc2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcbiAgICAgICAgdmFyIG9mZnNldCA9IDE7XG5cblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XG4gICAgICAgICAgICB2YXIgaSwgcywgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xuXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgICAgICB2YXIgeWkgPSAwLCB4aSA9IDA7XG5cbiAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwOyBzID0gMztcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBoRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcbiAgICAgICAgICAgICAgICB4ID0geCArIGxlbmd0aDtcbiAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoaERhdGFbc11baV0uaG9seSkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGkgLSBsZW5ndGgsIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpIC0gbGVuZ3RoLCB5aSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGV4dC5maWxsU3Ryb2tlU2hhcGUodGhpcyk7XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBfY2FjaGVCYWNrZ3JvdW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcbiAgICAgICAgdGhpcy5zdGFnZS5maW5kKCcuZ3JpZCwudG9wQmFyJykuY2FjaGUoe1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3aWR0aDogbGluZVdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YWdlLmhlaWdodCgpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX3VwZGF0ZVRvZGF5TGluZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcbiAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxuICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcblxuICAgICAgdmFyIHggPSBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCBuZXcgRGF0ZSgpKSAqIGRheXNXaWR0aDtcbiAgICAgIHRoaXMuQmxheWVyLmZpbmRPbmUoJy5jdXJyZW50RGF5TGluZScpLngoeCkuaGVpZ2h0KHRoaXMuc3RhZ2UuaGVpZ2h0KCkpO1xuICAgICAgdGhpcy5CbGF5ZXIuYmF0Y2hEcmF3KCk7XG4gICAgfSxcbiAgICBfaW5pdFNldHRpbmdzRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRvZGF5TGluZSgpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVCYWNrZ3JvdW5kKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTp3aWR0aCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVCYWNrZ3JvdW5kKCk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5mb3JFYWNoKGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgfSxcbiAgICBfaW5pdENvbGxlY3Rpb25FdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdyZW1vdmUnLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gd2FpdCBmb3IgbGVmdCBwYW5lbCB1cGRhdGVzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwKTtcbiAgICAgICAgfSwgMTApKTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQgY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2RlcGVuZDphZGQnLCBmdW5jdGlvbihiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KGJlZm9yZSwgYWZ0ZXIpO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2RlcGVuZDpyZW1vdmUnLCBmdW5jdGlvbihiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVDb25uZWN0b3JWaWV3KGJlZm9yZSwgYWZ0ZXIpO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ25lc3RlZFN0YXRlQ2hhbmdlJywgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbDogZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgdmFyIHRhc2tWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IG1vZGVsO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlVmlldyh0YXNrVmlldyk7XG4gICAgfSxcbiAgICBfcmVtb3ZlVmlldzogZnVuY3Rpb24odGFza1ZpZXcpIHtcbiAgICAgICAgdGFza1ZpZXcucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl90YXNrVmlld3MsIHRhc2tWaWV3KTtcbiAgICB9LFxuICAgIF9yZW1vdmVDb25uZWN0b3JWaWV3OiBmdW5jdGlvbihiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICByZXR1cm4gdmlldy5hZnRlck1vZGVsID09PSBhZnRlciAmJlxuICAgICAgICAgICAgICAgIHZpZXcuYmVmb3JlTW9kZWwgPT09IGJlZm9yZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbm5lY3RvclZpZXcucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzID0gXy53aXRob3V0KHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBjb25uZWN0b3JWaWV3KTtcbiAgICB9LFxuICAgIF9pbml0U3ViVmlld3M6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKChhZnRlcikgPT4ge1xuICAgICAgICAgICAgYWZ0ZXIuZGVwZW5kcy5lYWNoKChiZWZvcmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyhiZWZvcmUsIGFmdGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xuICAgICAgICB0aGlzLkZsYXllci5kcmF3KCk7XG4gICAgfSxcbiAgICBfYWRkVGFza1ZpZXc6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgdmFyIHZpZXc7XG4gICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTmVzdGVkVGFza1ZpZXcoe1xuICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWxvbmVUYXNrVmlldyh7XG4gICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuRmxheWVyLmFkZCh2aWV3LmVsKTtcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzLnB1c2godmlldyk7XG4gICAgfSxcbiAgICBfYWRkQ29ubmVjdG9yVmlldzogZnVuY3Rpb24oYmVmb3JlLCBhZnRlcikge1xuICAgICAgICB2YXIgdmlldyA9IG5ldyBDb25uZWN0b3JWaWV3KHtcbiAgICAgICAgICAgIGJlZm9yZU1vZGVsOiBiZWZvcmUsXG4gICAgICAgICAgICBhZnRlck1vZGVsOiBhZnRlcixcbiAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XG4gICAgICAgIHZpZXcuZWwubW92ZVRvQm90dG9tKCk7XG4gICAgICAgIHZpZXcucmVuZGVyKCk7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzLnB1c2godmlldyk7XG4gICAgfSxcblxuICAgIF9yZXF1ZXN0UmVzb3J0OiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAod2FpdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xuICAgICAgICAgICAgd2FpdGluZyA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfSgpKSxcbiAgICBfcmVzb3J0Vmlld3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFzdFkgPSB0aGlzLl90b3BQYWRkaW5nO1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYubW9kZWwgPT09IHRhc2s7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdmlldykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XG4gICAgICAgICAgICBsYXN0WSArPSB2aWV3LmhlaWdodDtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goKGFmdGVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoYWZ0ZXIuZ2V0KCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFmdGVyLmRlcGVuZHMuZWFjaCgoYmVmb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZVZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBiZWZvcmU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGFmdGVyVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IGFmdGVyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuYWZ0ZXJNb2RlbCA9PT0gYWZ0ZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMShiZWZvcmVWaWV3LmdldFkoKSArIGJlZm9yZVZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JWaWV3LnNldFkyKGFmdGVyVmlldy5nZXRZKCkgKyBhZnRlclZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5GbGF5ZXIuYmF0Y2hEcmF3KCk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FudHRDaGFydFZpZXc7XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBsYXZydG9uIG9uIDE3LjEyLjIwMTQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIEJhc2ljVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Jhc2ljVGFza1ZpZXcnKTtcclxuXHJcbnZhciBOZXN0ZWRUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9jb2xvciA6ICcjYjNkMWZjJyxcclxuICAgIF9ib3JkZXJTaXplIDogNixcclxuICAgIF9iYXJIZWlnaHQgOiAxMCxcclxuICAgIF9jb21wbGV0ZUNvbG9yIDogJyNDOTVGMTAnLFxyXG4gICAgZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBCYXNpY1Rhc2tWaWV3LnByb3RvdHlwZS5lbC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHZhciBsZWZ0Qm9yZGVyID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZSAqIDEuNSwgMCwgMCwgdGhpcy5fYm9yZGVyU2l6ZV0sXHJcbiAgICAgICAgICAgIGNsb3NlZCA6IHRydWUsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnbGVmdEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQobGVmdEJvcmRlcik7XHJcbiAgICAgICAgdmFyIHJpZ2h0Qm9yZGVyID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBmaWxsIDogdGhpcy5fY29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nICsgdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBwb2ludHMgOiBbLXRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ3JpZ2h0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChyaWdodEJvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGdyb3VwIGlzIG1vdmVkXHJcbiAgICAgICAgLy8gc28gd2UgbmVlZCB0byBkZXRlY3QgaW50ZXJ2YWxcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5mbG9vcih4IC8gZGF5c1dpZHRoKTtcclxuICAgICAgICB2YXIgbmV3U3RhcnQgPSBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpO1xyXG4gICAgICAgIHRoaXMubW9kZWwubW92ZVRvU3RhcnQobmV3U3RhcnQpO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KDApO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0ueCh4LngyIC0geC54MSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlV2lkdGggPSAoeC54MiAtIHgueDEpICogdGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDA7XHJcbiAgICAgICAgaWYgKGNvbXBsZXRlV2lkdGggPiB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgoeC54MiAtIHgueDEpIC0gY29tcGxldGVXaWR0aCA8IHRoaXMuX2JvcmRlclNpemUgLyAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLnJpZ2h0Qm9yZGVyJylbMF0uZmlsbCh0aGlzLl9jb21wbGV0ZUNvbG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFzaWNUYXNrVmlldy5wcm90b3R5cGUucmVuZGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXN0ZWRUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBNb2RhbEVkaXQgPSByZXF1aXJlKCcuLi9Nb2RhbFRhc2tFZGl0VmlldycpO1xyXG52YXIgQ29tbWVudHMgPSByZXF1aXJlKCcuLi9Db21tZW50c1ZpZXcnKTtcclxuXHJcbmZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhwYXJhbXMpIHtcclxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHBhcmFtcy5jb2xsZWN0aW9uO1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ3VsJyxcclxuICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cignaWQnKSB8fCAkKHRoaXMpLmRhdGEoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuY29sbGVjdGlvbi5nZXQoaWQpO1xyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdkZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdwcm9wZXJ0aWVzJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmlldyA9IG5ldyBNb2RhbEVkaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczogc2VsZi5zZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2NvbW1lbnRzJyl7XHJcbiAgICAgICAgICAgICAgICBuZXcgQ29tbWVudHMoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczogc2VsZi5zZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgfSkucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3Jvd0Fib3ZlJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQ6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaW5kZW50Jykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLmluZGVudChtb2RlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ291dGRlbnQnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29sbGVjdGlvbi5vdXRkZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBBYm92ZVwiLCBpY29uOiBcImFib3ZlXCIgfSxcclxuICAgICAgICAgICAgXCJyb3dCZWxvd1wiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBCZWxvd1wiLCBpY29uOiBcImJlbG93XCIgfSxcclxuICAgICAgICAgICAgXCJpbmRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO0luZGVudCBSb3dcIiwgaWNvbjogXCJpbmRlbnRcIiB9LFxyXG4gICAgICAgICAgICBcIm91dGRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO091dGRlbnQgUm93XCIsIGljb246IFwib3V0ZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwic2VwMVwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcInByb3BlcnRpZXNcIjogeyBuYW1lOiBcIiZuYnNwO1Byb3BlcnRpZXNcIiwgaWNvbjogXCJwcm9wZXJ0aWVzXCIgfSxcclxuICAgICAgICAgICAgXCJjb21tZW50c1wiOiB7IG5hbWU6IFwiJm5ic3A7Q29tbWVudHNcIiwgaWNvbjogXCJjb21tZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAyXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwiZGVsZXRlXCI6IHsgbmFtZTogXCImbmJzcDtEZWxldGUgUm93XCIsIGljb246IFwiZGVsZXRlXCIgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc29ydGluZGV4ID0gKHRoaXMuY29sbGVjdGlvbi5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgfVxyXG4gICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcbiAgICBkYXRhLnBhcmVudGlkID0gcmVmX21vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgIHZhciB0YXNrID0gdGhpcy5jb2xsZWN0aW9uLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24uY2hlY2tTb3J0ZWRJbmRleCgpO1xyXG4gICAgdGFzay5zYXZlKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRleHRNZW51VmlldzsiLCJ2YXIgRGF0ZVBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0RhdGVQaWNrZXInLFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NlbGVjdCcpO1xuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gdGhpcy5nZXRET01Ob2RlKCkudmFsdWUuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ3Nob3cnKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcignZGVzdHJveScpO1xuICAgIH0sXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGVTdHIgPSAkLmRhdGVwaWNrZXIuZm9ybWF0RGF0ZSh0aGlzLnByb3BzLmRhdGVGb3JtYXQsIHRoaXMucHJvcHMudmFsdWUpO1xuICAgICAgICB0aGlzLmdldERPTU5vZGUoKS52YWx1ZSA9IGRhdGVTdHI7XG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoIFwicmVmcmVzaFwiICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5wcm9wcy5kYXRlRm9ybWF0LCB0aGlzLnByb3BzLnZhbHVlKVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRlUGlja2VyO1xuIiwidmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xuXG52YXIgTmVzdGVkVGFzayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ05lc3RlZFRhc2snLFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vbignY2hhbmdlOmhpZGRlbiBjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdWJ0YXNrcyA9IHRoaXMucHJvcHMubW9kZWwuY2hpbGRyZW4ubWFwKCh0YXNrKSA9PiB7XG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTmVzdGVkVGFzaywge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgaXNTdWJUYXNrOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0Um93OiB0aGlzLnByb3BzLm9uU2VsZWN0Um93LFxuICAgICAgICAgICAgICAgICAgICBvbkVkaXRSb3c6IHRoaXMucHJvcHMub25FZGl0Um93LFxuICAgICAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6IHRoaXMucHJvcHMuZWRpdGVkUm93LFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogdGhpcy5wcm9wcy5zZWxlY3RlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRNb2RlbENpZDogdGhpcy5wcm9wcy5zZWxlY3RlZE1vZGVsQ2lkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suY2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5jaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZHJhZy1pdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRhc2suY2lkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3RSb3c6IHRoaXMucHJvcHMub25TZWxlY3RSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FZGl0Um93OiB0aGlzLnByb3BzLm9uRWRpdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6ICh0aGlzLnByb3BzLnNlbGVjdGVkTW9kZWxDaWQgPT09IHRhc2suY2lkKSAmJiB0aGlzLnByb3BzLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogKHRoaXMucHJvcHMuc2VsZWN0ZWRNb2RlbENpZCA9PT0gdGFzay5jaWQpICYmIHRoaXMucHJvcHMuc2VsZWN0ZWRSb3dcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxuICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGhpcy5wcm9wcy5tb2RlbC5jaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLnByb3BzLm1vZGVsLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGhpcy5wcm9wcy5tb2RlbC5jaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMucHJvcHMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdFJvdzogdGhpcy5wcm9wcy5vblNlbGVjdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdFJvdzogdGhpcy5wcm9wcy5vbkVkaXRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6ICh0aGlzLnByb3BzLnNlbGVjdGVkTW9kZWxDaWQgPT09IHRoaXMucHJvcHMubW9kZWwuY2lkKSAmJiB0aGlzLnByb3BzLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkUm93OiAodGhpcy5wcm9wcy5zZWxlY3RlZE1vZGVsQ2lkID09PSB0aGlzLnByb3BzLm1vZGVsLmNpZCkgJiYgdGhpcy5wcm9wcy5zZWxlY3RlZFJvd1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdzdWItdGFzay1saXN0IHNvcnRhYmxlJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdWJ0YXNrc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFzaztcbiIsInZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcbnZhciBOZXN0ZWRUYXNrID0gcmVxdWlyZSgnLi9OZXN0ZWRUYXNrJyk7XG5cbmZ1bmN0aW9uIGJ1aWxkVGFza3NPcmRlckZyb21ET00oY29udGFpbmVyKSB7XG4gICAgdmFyIGRhdGEgPSBbXTtcbiAgICB2YXIgY2hpbGRyZW4gPSAkKCc8b2w+JyArIGNvbnRhaW5lci5nZXQoMCkuaW5uZXJIVE1MICsgJzwvb2w+JykuY2hpbGRyZW4oKTtcbiAgICBfLmVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIHZhciAkY2hpbGQgPSAkKGNoaWxkKTtcbiAgICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgICAgIGlkOiAkY2hpbGQuZGF0YSgnaWQnKSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc3VibGlzdCA9ICRjaGlsZC5maW5kKCdvbCcpO1xuICAgICAgICBpZiAoc3VibGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIG9iai5jaGlsZHJlbiA9IGJ1aWxkVGFza3NPcmRlckZyb21ET00oc3VibGlzdCk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YS5wdXNoKG9iaik7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG59XG5cbnZhciBTaWRlUGFuZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTaWRlUGFuZWwnLFxuICAgIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlbGVjdGVkUm93OiBudWxsLFxuICAgICAgICAgICAgbGFzdFNlbGVjdGVkUm93OiBudWxsLFxuICAgICAgICAgICAgc2VsZWN0ZWRNb2RlbDogbnVsbCxcbiAgICAgICAgICAgIGVkaXRlZFJvdzogbnVsbFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignYWRkIHJlbW92ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5fbWFrZVNvcnRhYmxlKCk7XG4gICAgICAgIHRoaXMuX3NldHVwSGlnaGxpZ2h0ZXIoKTtcbiAgICB9LFxuICAgIF9tYWtlU29ydGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29udGFpbmVyID0gJCgnLnRhc2stY29udGFpbmVyJyk7XG4gICAgICAgIGNvbnRhaW5lci5zb3J0YWJsZSh7XG4gICAgICAgICAgICBncm91cDogJ3NvcnRhYmxlJyxcbiAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiAnb2wnLFxuICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLmRyYWctaXRlbScsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyIHNvcnQtcGxhY2Vob2xkZXJcIi8+JyxcbiAgICAgICAgICAgIG9uRHJhZ1N0YXJ0OiAoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25EcmFnOiAoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyICRwbGFjZWhvbGRlciA9ICQoJy5zb3J0LXBsYWNlaG9sZGVyJyk7XG4gICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XG4gICAgICAgICAgICAgICAgJHBsYWNlaG9sZGVyLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiBpc1N1YlRhc2sgPyAnMzBweCcgOiAnMCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkRyb3A6ICgkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBidWlsZFRhc2tzT3JkZXJGcm9tRE9NKGNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5yZXNvcnQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9zZXR1cEhpZ2hsaWdodGVyKCkge1xuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlciA9ICQoJzxkaXY+Jyk7XG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmNzcyh7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdncmV5JyxcbiAgICAgICAgICAgIG9wYWNpdHk6ICcwLjUnLFxuICAgICAgICAgICAgdG9wOiAnMCcsXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjb250YWluZXIgPSAkKCcudGFzay1jb250YWluZXInKTtcbiAgICAgICAgY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICBjb250YWluZXIubW91c2VvdmVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIFRPRE86IHJld3JpdGUgdG8gZmluZCBjbG9zZXN0IHVsXG4gICAgICAgICAgICBpZiAoISRlbC5kYXRhKCdpZCcpKSB7XG4gICAgICAgICAgICAgICAgJGVsID0gJGVsLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgIGlmICghJGVsLmRhdGEoJ2lkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgJGVsID0gJGVsLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3MgPSAkZWwub2Zmc2V0KCk7XG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xuICAgICAgICAgICAgICAgIHRvcDogcG9zLnRvcCArICdweCcsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAkZWwuaGVpZ2h0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICByZXF1ZXN0VXBkYXRlOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAod2FpdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIHdhaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XG4gICAgICAgICAgICB3YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9KCkpLFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnRhc2stY29udGFpbmVyJykuc29ydGFibGUoJ2Rlc3Ryb3knKTtcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9mZihudWxsLCBudWxsLCB0aGlzKTtcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIucmVtb3ZlKCk7XG4gICAgfSxcbiAgICBvblNlbGVjdFJvdyhzZWxlY3RlZE1vZGVsQ2lkLCBzZWxlY3RlZFJvdykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkUm93LFxuICAgICAgICAgICAgc2VsZWN0ZWRNb2RlbENpZFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG9uRWRpdFJvdyhzZWxlY3RlZE1vZGVsQ2lkLCBlZGl0ZWRSb3cpIHtcbiAgICAgICAgaWYgKCFlZGl0ZWRSb3cpIHtcbiAgICAgICAgICAgIHZhciB4ID0gd2luZG93LnNjcm9sbFgsIHkgPSB3aW5kb3cuc2Nyb2xsWTtcbiAgICAgICAgICAgIHRoaXMucmVmcy5jb250YWluZXIuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oeCwgeSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogdGhpcy5zdGF0ZS5sYXN0U2VsZWN0ZWRSb3dcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWRNb2RlbENpZCxcbiAgICAgICAgICAgIGVkaXRlZFJvd1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG9uS2V5RG93bihlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCByb3dzID0gWyduYW1lJywgJ2NvbXBsZXRlJywgJ3N0YXJ0JywgJ2VuZCcsICdkdXJhdGlvbiddO1xuICAgICAgICBsZXQgaSA9IHJvd3MuaW5kZXhPZih0aGlzLnN0YXRlLnNlbGVjdGVkUm93KTtcbiAgICAgICAgY29uc3QgdGFza3MgPSB0aGlzLnByb3BzLmNvbGxlY3Rpb247XG4gICAgICAgIGxldCBtb2RlbEluZGV4ID0gdGFza3MuZ2V0KHRoaXMuc3RhdGUuc2VsZWN0ZWRNb2RlbENpZCkuZ2V0KCdzb3J0aW5kZXgnKTtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gNDApIHsgLy8gZG93blxuICAgICAgICAgICAgbW9kZWxJbmRleCA9IChtb2RlbEluZGV4ICsgMSArIHRhc2tzLmxlbmd0aCkgJSB0YXNrcy5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzOSkgeyAvLyByaWdodFxuICAgICAgICAgICAgaSA9IChpICsgMSArIHJvd3MubGVuZ3RoKSAlIHJvd3MubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMzgpIHsgLy8gdXBcbiAgICAgICAgICAgIG1vZGVsSW5kZXggPSAobW9kZWxJbmRleCAtIDEgKyB0YXNrcy5sZW5ndGgpICUgdGFza3MubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMzcpIHsgLy8gbGVmdFxuICAgICAgICAgICAgaSA9IChpIC0gMSArIHJvd3MubGVuZ3RoKSAlIHJvd3MubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHsgLy8gZW50ZXJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGVkaXRlZFJvdzogcm93c1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhdXRvIG9wZW4gc2lkZSBwYW5lbFxuICAgICAgICBpZiAoaSA+PSAyKSB7XG4gICAgICAgICAgICAkKCcubWVudS1jb250YWluZXInKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygncGFuZWwtZXhwYW5kZWQnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZFJvdzogcm93c1tpXSxcbiAgICAgICAgICAgIHNlbGVjdGVkTW9kZWxDaWQ6IHRhc2tzLmF0KG1vZGVsSW5kZXgpLmNpZFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG9uQ2xpY2soKSB7XG4gICAgICAgIHZhciB4ID0gd2luZG93LnNjcm9sbFgsIHkgPSB3aW5kb3cuc2Nyb2xsWTtcbiAgICAgICAgdGhpcy5yZWZzLmNvbnRhaW5lci5nZXRET01Ob2RlKCkuZm9jdXMoKTtcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKHgsIHkpO1xuICAgIH0sXG4gICAgb25CbHVyKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxhc3RTZWxlY3RlZFJvdzogdGhpcy5zdGF0ZS5zZWxlY3RlZFJvdyxcbiAgICAgICAgICAgIHNlbGVjdGVkUm93OiBudWxsXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRhc2tzID0gW107XG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5lYWNoKCh0YXNrKSA9PiB7XG4gICAgICAgICAgICBpZiAodGFzay5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhc2suY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGtleTogdGFzay5jaWQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQ6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgb25TZWxlY3RSb3c6IHRoaXMub25TZWxlY3RSb3csXG4gICAgICAgICAgICAgICAgICAgIG9uRWRpdFJvdzogdGhpcy5vbkVkaXRSb3csXG4gICAgICAgICAgICAgICAgICAgIGVkaXRlZFJvdzogdGhpcy5zdGF0ZS5lZGl0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkUm93OiB0aGlzLnN0YXRlLnNlbGVjdGVkUm93LFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE1vZGVsQ2lkOiB0aGlzLnN0YXRlLnNlbGVjdGVkTW9kZWxDaWRcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnZHJhZy1pdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJzogdGFzay5jaWRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUYXNrSXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdFJvdzogdGhpcy5vblNlbGVjdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdFJvdzogdGhpcy5vbkVkaXRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6ICh0aGlzLnN0YXRlLnNlbGVjdGVkTW9kZWxDaWQgPT09IHRhc2suY2lkKSAmJiB0aGlzLnN0YXRlLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkUm93OiAodGhpcy5zdGF0ZS5zZWxlY3RlZE1vZGVsQ2lkID09PSB0YXNrLmNpZCkgJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZFJvd1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxvbFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ndGFzay1jb250YWluZXIgc29ydGFibGUnXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9XCIxXCJcbiAgICAgICAgICAgICAgICByZWY9XCJjb250YWluZXJcIlxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vbkJsdXJ9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3Rhc2tzfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWRlUGFuZWw7XG4iLCJ2YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vRGF0ZVBpY2tlcicpO1xudmFyIENvbW1ldHNWaWV3ID0gcmVxdWlyZSgnLi4vQ29tbWVudHNWaWV3Jyk7XG5cbnZhciBUYXNrSXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1Rhc2tJdGVtJyxcbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWw6IG51bGxcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZTogZnVuY3Rpb24ocHJvcHMpIHtcbiAgICAgICAgaWYgKF8uaXNFcXVhbChwcm9wcywgdGhpcy5wcm9wcykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0ICRpbnB1dCA9ICQodGhpcy5nZXRET01Ob2RlKCkpLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICRpbnB1dC5mb2N1cygpO1xuICAgICAgICAvLyBtb3ZlIGN1cnNvciB0byB0aGUgZW5kIG9mIGlucHV0LiBUaXAgZnJvbTpcbiAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81MTEwODgvdXNlLWphdmFzY3JpcHQtdG8tcGxhY2UtY3Vyc29yLWF0LWVuZC1vZi10ZXh0LWluLXRleHQtaW5wdXQtZWxlbWVudFxuICAgICAgICBjb25zdCB2YWwgPSAkaW5wdXQudmFsKCk7IC8vc3RvcmUgdGhlIHZhbHVlIG9mIHRoZSBlbGVtZW50XG4gICAgICAgICRpbnB1dC52YWwoJycpOyAvL2NsZWFyIHRoZSB2YWx1ZSBvZiB0aGUgZWxlbWVudFxuICAgICAgICAkaW5wdXQudmFsKHZhbCk7IC8vc2V0IHRoYXQgdmFsdWUgYmFjay5cblxuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgZXZlbnRzID0gW1xuICAgICAgICAgICAgJ2NoYW5nZTpuYW1lJywgJ2NoYW5nZTpjb21wbGV0ZScsICdjaGFuZ2U6c3RhcnQnLFxuICAgICAgICAgICAgJ2NoYW5nZTplbmQnLCAnY2hhbmdlOmR1cmF0aW9uJywgJ2NoYW5nZTpoaWdodGxpZ2h0JyxcbiAgICAgICAgICAgICdjaGFuZ2U6Q29tbWVudHMnXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oZXZlbnRzLmpvaW4oJyAnKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcbiAgICB9LFxuICAgIF9maW5kTmVzdGVkTGV2ZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5tb2RlbC5nZXRPdXRsaW5lTGV2ZWwoKTtcbiAgICB9LFxuICAgIF9jcmVhdGVGaWVsZDogZnVuY3Rpb24oY29sKSB7XG4gICAgICAgIGNvbnN0IGlzQ29sSW5FZGl0ID0gKHRoaXMucHJvcHMuZWRpdGVkUm93ID09PSBjb2wpO1xuICAgICAgICBpZiAoaXNDb2xJbkVkaXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVFZGl0RmllbGQoY29sKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHt9LCB0aGlzLl9jcmVhdGVSZWFkRmlsZWQoY29sKSk7XG4gICAgfSxcbiAgICBfY3JlYXRlUmVhZEZpbGVkOiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcbiAgICAgICAgaWYgKGNvbCA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpICsgJyUnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPT09ICdzdGFydCcgfHwgY29sID09PSAnZW5kJykge1xuICAgICAgICAgICAgcmV0dXJuICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgbW9kZWwuZ2V0KGNvbCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSwgbW9kZWwuZ2V0KCdlbmQnKSkgKyAnIGQnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKTtcbiAgICB9LFxuICAgIF9jcmVhdGVEYXRlRWxlbWVudDogZnVuY3Rpb24oY29sKSB7XG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChEYXRlUGlja2VyLCB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsLFxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAga2V5OiBjb2wsXG4gICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkVkaXRSb3codGhpcy5wcm9wcy5tb2RlbC5jaWQsIG51bGwpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX2R1cmF0aW9uQ2hhbmdlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgbnVtYmVyID0gcGFyc2VJbnQodmFsdWUucmVwbGFjZSggL15cXEQrL2csICcnKSwgMTApO1xuICAgICAgICBpZiAoIW51bWJlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCd3JykgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkV2Vla3MobnVtYmVyKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUuaW5kZXhPZignbScpID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZE1vbnRocyhudW1iZXIpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG51bWJlci0tO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkRGF5cyhudW1iZXIpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX2NyZWF0ZUR1cmF0aW9uRmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsID0gRGF0ZS5kYXlzZGlmZih0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKSwgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2VuZCcpKSArICcgZCc7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbCB8fCB2YWwsXG4gICAgICAgICAgICBrZXk6ICdkdXJhdGlvbicsXG4gICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2R1cmF0aW9uQ2hhbmdlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZX0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgb25LZXlEb3duOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMgfHwgZS5rZXlDb2RlID09PSAyNykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFJvdyh0aGlzLnByb3BzLm1vZGVsLmNpZCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9jcmVhdGVFZGl0RmllbGQ6IGZ1bmN0aW9uKGNvbCkge1xuICAgICAgICB2YXIgdmFsID0gdGhpcy5wcm9wcy5tb2RlbC5nZXQoY29sKTtcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRGF0ZUVsZW1lbnQoY29sKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRHVyYXRpb25GaWVsZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ25hbWVJbnB1dCcsXG4gICAgICAgICAgICB2YWx1ZTogdmFsLFxuICAgICAgICAgICAga2V5OiBjb2wsXG4gICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbktleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMyB8fCBlLmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FZGl0Um93KHRoaXMucHJvcHMubW9kZWwuY2lkLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgb25CbHVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFJvdyh0aGlzLnByb3BzLm1vZGVsLmNpZCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjcmVhdGVDb21tZW50RmllbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29tbWVudHMgPSB0aGlzLnByb3BzLm1vZGVsLmdldCgnQ29tbWVudHMnKSB8fCAwO1xuICAgICAgICBpZiAoIWNvbW1lbnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XG4gICAgICAgICAgICAgICAga2V5OiAnY29tbWVudHMnLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2NvbC1jb21tZW50cycsXG4gICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb21tZXRzVmlldyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5wcm9wcy5tb2RlbFxuICAgICAgICAgICAgICAgICAgICB9KS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbWcnLCB7XG4gICAgICAgICAgICAgICAgc3JjOiAnY3NzL2ltYWdlcy9jb21tZW50cy5wbmcnXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNvbW1lbnRzXG4gICAgICAgICk7XG4gICAgfSxcbiAgICBzaG93Q29udGV4dDogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCk7XG4gICAgICAgIHZhciB1bCA9ICRlbC5wYXJlbnQoKTtcbiAgICAgICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKTtcbiAgICAgICAgdWwuY29udGV4dE1lbnUoe1xuICAgICAgICAgICAgeDogb2Zmc2V0LmxlZnQgKyAyMCxcbiAgICAgICAgICAgIHk6IG9mZnNldC50b3BcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBmaW5kQ29sOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnN0IGNvbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50YXNrLWNvbCcpLmRhdGEoJ2NvbCcpO1xuICAgICAgICByZXR1cm4gY29sO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICBjb25zdCBzZWxlY3RlZFJvdyA9IHRoaXMucHJvcHMuc2VsZWN0ZWRSb3c7XG4gICAgICAgIGNvbnN0IHNoYWRvd0JvcmRlciA9ICcwIDAgMCAycHggIzM4NzlkOSBpbnNldCc7XG5cbiAgICAgICAgbGV0IGNvbGxhcHNlQnV0dG9uO1xuICAgICAgICBpZiAobW9kZWwuaXNOZXN0ZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gJ3RyaWFuZ2xlIGljb24gJyArICh0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykgPyAncmlnaHQnIDogJ2Rvd24nKTtcbiAgICAgICAgICAgIGNvbGxhcHNlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxpXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnY29sbGFwc2VkJywgIXRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSk7XG4gICAgICAgICAgICAgICAgICAgIH19Lz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdWxDbGFzcyA9ICd0YXNrJ1xuICAgICAgICAgICsgKHRoaXMucHJvcHMuaXNTdWJUYXNrID8gJyBzdWItdGFzaycgOiAnJylcbiAgICAgICAgICArICh0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykgPyAnIGNvbGxhcHNlZCcgOiAnJylcbiAgICAgICAgICArICh0aGlzLnByb3BzLm1vZGVsLmlzTmVzdGVkKCkgPyAnIG5lc3RlZCcgOiAnJyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8dWxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3VsQ2xhc3N9XG4gICAgICAgICAgICAgICAgZGF0YS1pZD17dGhpcy5wcm9wcy5tb2RlbC5jaWR9XG4gICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkVkaXRSb3cobW9kZWwuY2lkLCB0aGlzLmZpbmRDb2woZSkpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdFJvdyhtb2RlbC5jaWQsIHRoaXMuZmluZENvbChlKSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdoaWdodGxpZ2h0JylcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJpbmZvXCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLWluZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCJjc3MvaW1hZ2VzL2luZm8ucG5nXCIgb25DbGljaz17dGhpcy5vbkNsaWNrfS8+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwic29ydGluZGV4XCIgY2xhc3NOYW1lPVwiY29sLXNvcnRpbmRleFwiPlxuICAgICAgICAgICAgICAgICAgICB7bW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIDF9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwibmFtZVwiIGNsYXNzTmFtZT1cInRhc2stY29sIGNvbC1uYW1lXCIgZGF0YS1jb2w9XCJuYW1lXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiAodGhpcy5fZmluZE5lc3RlZExldmVsKCkgKiAxMCkgKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiBzZWxlY3RlZFJvdyA9PT0gJ25hbWUnID8gc2hhZG93Qm9yZGVyIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2NvbGxhcHNlQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX2NyZWF0ZUZpZWxkKCduYW1lJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAge3RoaXMuY3JlYXRlQ29tbWVudEZpZWxkKCl9XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cImNvbXBsZXRlXCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLWNvbXBsZXRlXCIgZGF0YS1jb2w9XCJjb21wbGV0ZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7Ym94U2hhZG93OiBzZWxlY3RlZFJvdyA9PT0gJ2NvbXBsZXRlJyA/IHNoYWRvd0JvcmRlciA6IG51bGx9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2NyZWF0ZUZpZWxkKCdjb21wbGV0ZScpfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cInN0YXJ0XCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLXN0YXJ0XCIgZGF0YS1jb2w9XCJzdGFydFwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7Ym94U2hhZG93OiBzZWxlY3RlZFJvdyA9PT0gJ3N0YXJ0JyA/IHNoYWRvd0JvcmRlciA6IG51bGx9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2NyZWF0ZUZpZWxkKCdzdGFydCcpfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cImVuZFwiIGNsYXNzTmFtZT1cInRhc2stY29sIGNvbC1lbmRcIiBkYXRhLWNvbD1cImVuZFwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7Ym94U2hhZG93OiBzZWxlY3RlZFJvdyA9PT0gJ2VuZCcgPyBzaGFkb3dCb3JkZXIgOiBudWxsfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9jcmVhdGVGaWVsZCgnZW5kJyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwiZHVyYXRpb25cIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtZHVyYXRpb25cIiBkYXRhLWNvbD1cImR1cmF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnZHVyYXRpb24nID8gc2hhZG93Qm9yZGVyIDogbnVsbH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlRmllbGQoJ2R1cmF0aW9uJyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0l0ZW07XG4iXX0=
