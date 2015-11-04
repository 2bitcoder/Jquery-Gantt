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


var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n<Project xmlns=\"http://schemas.microsoft.com/project\">\r\n    <SaveVersion>14</SaveVersion>\r\n    <Name>Gantt Tasks.xml</Name>\r\n    <Title>Gantt Tasks</Title>\r\n    <CreationDate><%= currentDate %></CreationDate>\r\n    <LastSaved><%= currentDate %></LastSaved>\r\n    <ScheduleFromStart>1</ScheduleFromStart>\r\n    <StartDate><%= startDate %></StartDate>\r\n    <FinishDate><%= finishDate %></FinishDate>\r\n    <FYStartDate>1</FYStartDate>\r\n    <CriticalSlackLimit>0</CriticalSlackLimit>\r\n    <CurrencyDigits>2</CurrencyDigits>\r\n    <CurrencySymbol>$</CurrencySymbol>\r\n    <CurrencyCode>USD</CurrencyCode>\r\n    <CurrencySymbolPosition>0</CurrencySymbolPosition>\r\n    <CalendarUID>1</CalendarUID>\r\n    <DefaultStartTime>08:00:00</DefaultStartTime>\r\n    <DefaultFinishTime>17:00:00</DefaultFinishTime>\r\n    <MinutesPerDay>480</MinutesPerDay>\r\n    <MinutesPerWeek>2400</MinutesPerWeek>\r\n    <DaysPerMonth>20</DaysPerMonth>\r\n    <DefaultTaskType>0</DefaultTaskType>\r\n    <DefaultFixedCostAccrual>3</DefaultFixedCostAccrual>\r\n    <DefaultStandardRate>0</DefaultStandardRate>\r\n    <DefaultOvertimeRate>0</DefaultOvertimeRate>\r\n    <DurationFormat>7</DurationFormat>\r\n    <WorkFormat>2</WorkFormat>\r\n    <EditableActualCosts>0</EditableActualCosts>\r\n    <HonorConstraints>0</HonorConstraints>\r\n    <InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>\r\n    <MultipleCriticalPaths>0</MultipleCriticalPaths>\r\n    <NewTasksEffortDriven>1</NewTasksEffortDriven>\r\n    <NewTasksEstimated>1</NewTasksEstimated>\r\n    <SplitsInProgressTasks>1</SplitsInProgressTasks>\r\n    <SpreadActualCost>0</SpreadActualCost>\r\n    <SpreadPercentComplete>0</SpreadPercentComplete>\r\n    <TaskUpdatesResource>1</TaskUpdatesResource>\r\n    <FiscalYearStart>0</FiscalYearStart>\r\n    <WeekStartDay>0</WeekStartDay>\r\n    <MoveCompletedEndsBack>0</MoveCompletedEndsBack>\r\n    <MoveRemainingStartsBack>0</MoveRemainingStartsBack>\r\n    <MoveRemainingStartsForward>0</MoveRemainingStartsForward>\r\n    <MoveCompletedEndsForward>0</MoveCompletedEndsForward>\r\n    <BaselineForEarnedValue>0</BaselineForEarnedValue>\r\n    <AutoAddNewResourcesAndTasks>1</AutoAddNewResourcesAndTasks>\r\n    <CurrentDate><%= currentDate %></CurrentDate>\r\n    <MicrosoftProjectServerURL>1</MicrosoftProjectServerURL>\r\n    <Autolink>1</Autolink>\r\n    <NewTaskStartDate>0</NewTaskStartDate>\r\n    <NewTasksAreManual>0</NewTasksAreManual>\r\n    <DefaultTaskEVMethod>0</DefaultTaskEVMethod>\r\n    <ProjectExternallyEdited>0</ProjectExternallyEdited>\r\n    <ExtendedCreationDate>1984-01-01T00:00:00</ExtendedCreationDate>\r\n    <ActualsInSync>0</ActualsInSync>\r\n    <RemoveFileProperties>0</RemoveFileProperties>\r\n    <AdminProject>0</AdminProject>\r\n    <UpdateManuallyScheduledTasksWhenEditingLinks>1</UpdateManuallyScheduledTasksWhenEditingLinks>\r\n    <KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>0</KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>\r\n    <OutlineCodes/>\r\n    <WBSMasks/>\r\n    <ExtendedAttributes/>\r\n    <Calendars>\r\n        <Calendar>\r\n            <UID>1</UID>\r\n            <Name>Standard</Name>\r\n            <IsBaseCalendar>1</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>-1</BaseCalendarUID>\r\n            <WeekDays>\r\n                <WeekDay>\r\n                    <DayType>1</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>2</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>3</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>4</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>5</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>6</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>7</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n            </WeekDays>\r\n        </Calendar>\r\n    </Calendars>\r\n    <Tasks>\r\n        <Task>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Name>Gantt Project</Name>\r\n            <Active>1</Active>\r\n            <Manual>0</Manual>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <CreateDate><%= startDate %></CreateDate>\r\n            <WBS>0</WBS>\r\n            <OutlineNumber>0</OutlineNumber>\r\n            <OutlineLevel>0</OutlineLevel>\r\n            <Priority>500</Priority>\r\n            <Start><%= startDate %></Start>\r\n            <Finish><%= finishDate %></Finish>\r\n            <Duration>PT104H0M0S</Duration>\r\n            <ManualStart><%= startDate %></ManualStart>\r\n            <ManualFinish><%= finishDate %></ManualFinish>\r\n            <ManualDuration>PT104H0M0S</ManualDuration>\r\n            <DurationFormat>53</DurationFormat>\r\n            <Work>PT0H0M0S</Work>\r\n            <ResumeValid>0</ResumeValid>\r\n            <EffortDriven>0</EffortDriven>\r\n            <Recurring>0</Recurring>\r\n            <OverAllocated>0</OverAllocated>\r\n            <Estimated>1</Estimated>\r\n            <Milestone>0</Milestone>\r\n            <Summary>1</Summary>\r\n            <DisplayAsSummary>0</DisplayAsSummary>\r\n            <Critical>1</Critical>\r\n            <IsSubproject>0</IsSubproject>\r\n            <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n            <ExternalTask>0</ExternalTask>\r\n            <EarlyStart><%= startDate %></EarlyStart>\r\n            <EarlyFinish><%= finishDate %></EarlyFinish>\r\n            <LateStart><%= startDate %></LateStart>\r\n            <LateFinish><%= finishDate %></LateFinish>\r\n            <StartVariance>0</StartVariance>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <FreeSlack>0</FreeSlack>\r\n            <TotalSlack>0</TotalSlack>\r\n            <StartSlack>0</StartSlack>\r\n            <FinishSlack>0</FinishSlack>\r\n            <FixedCost>0</FixedCost>\r\n            <FixedCostAccrual>3</FixedCostAccrual>\r\n            <PercentComplete>0</PercentComplete>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <Cost>0</Cost>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualDuration>PT0H0M0S</ActualDuration>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <RemainingDuration>PT104H0M0S</RemainingDuration>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <ACWP>0.00</ACWP>\r\n            <CV>0.00</CV>\r\n            <ConstraintType>0</ConstraintType>\r\n            <CalendarUID>-1</CalendarUID>\r\n            <LevelAssignments>1</LevelAssignments>\r\n            <LevelingCanSplit>1</LevelingCanSplit>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>8</LevelingDelayFormat>\r\n            <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n            <HideBar>0</HideBar>\r\n            <Rollup>0</Rollup>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n            <EarnedValueMethod>0</EarnedValueMethod>\r\n            <IsPublished>0</IsPublished>\r\n            <CommitmentType>0</CommitmentType>\r\n        </Task><% tasks.forEach(function(task){ %>\r\n        <Task>\r\n            <UID><%= task.id %></UID>\r\n            <ID><%= task.id %></ID>\r\n            <Name><%= task.name %></Name>\r\n            <Active>1</Active>\r\n            <Manual>0</Manual>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <CreateDate><%= task.start %></CreateDate>\r\n            <WBS><%= task.outlineNumber %></WBS>\r\n            <OutlineNumber><%= task.outlineNumber %></OutlineNumber>\r\n            <OutlineLevel><%= task.outlineLevel %></OutlineLevel>\r\n            <Priority>500</Priority>\r\n            <Start><%= task.start %></Start>\r\n            <Finish><%= task.finish %></Finish>\r\n            <Duration>PT766H0M0S</Duration>\r\n            <ManualStart><%= task.start %></ManualStart>\r\n            <ManualFinish><%= task.finish %></ManualFinish>\r\n            <ManualDuration>PT766H0M0S</ManualDuration>\r\n            <DurationFormat>21</DurationFormat>\r\n            <Work>PT1532H0M0S</Work>\r\n            <ResumeValid>0</ResumeValid>\r\n            <EffortDriven>0</EffortDriven>\r\n            <Recurring>0</Recurring>\r\n            <OverAllocated>0</OverAllocated>\r\n            <Estimated>1</Estimated>\r\n            <Milestone>0</Milestone>\r\n            <Summary>1</Summary>\r\n            <DisplayAsSummary>0</DisplayAsSummary>\r\n            <Critical>1</Critical>\r\n            <IsSubproject>0</IsSubproject>\r\n            <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n            <ExternalTask>0</ExternalTask>\r\n            <EarlyStart><%= task.start %></EarlyStart>\r\n            <EarlyFinish><%= task.finish %></EarlyFinish>\r\n            <LateStart><%= task.start %></LateStart>\r\n            <LateFinish><%= task.finish %></LateFinish>\r\n            <StartVariance>0</StartVariance>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <FreeSlack>0</FreeSlack>\r\n            <TotalSlack>0</TotalSlack>\r\n            <StartSlack>0</StartSlack>\r\n            <FinishSlack>0</FinishSlack>\r\n            <FixedCost>0</FixedCost>\r\n            <FixedCostAccrual>3</FixedCostAccrual>\r\n            <PercentComplete>0</PercentComplete>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <Cost>0</Cost>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualDuration>PT0H0M0S</ActualDuration>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RegularWork>PT1532H0M0S</RegularWork>\r\n            <RemainingDuration>PT766H0M0S</RemainingDuration>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingWork>PT1532H0M0S</RemainingWork>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <ACWP>0.00</ACWP>\r\n            <CV>0.00</CV>\r\n            <ConstraintType>0</ConstraintType>\r\n            <CalendarUID>-1</CalendarUID>\r\n            <LevelAssignments>1</LevelAssignments>\r\n            <LevelingCanSplit>1</LevelingCanSplit>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>8</LevelingDelayFormat>\r\n            <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n            <HideBar>0</HideBar>\r\n            <Rollup>0</Rollup>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n            <EarnedValueMethod>0</EarnedValueMethod><% if (task.depend !== undefined) {%>\r\n            <PredecessorLink>\r\n                <PredecessorUID><%= task.depend %></PredecessorUID>\r\n                <Type>1</Type>\r\n                <CrossProject>0</CrossProject>\r\n                <LinkLag>0</LinkLag>\r\n                <LagFormat>7</LagFormat>\r\n            </PredecessorLink><% } %> \r\n            <IsPublished>0</IsPublished>\r\n            <CommitmentType>0</CommitmentType>\r\n        </Task><% }); %>\r\n    </Tasks>\r\n    <Resources>\r\n        <Resource>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <WorkGroup>0</WorkGroup>\r\n            <MaxUnits>1.00</MaxUnits>\r\n            <PeakUnits>0.00</PeakUnits>\r\n            <OverAllocated>0</OverAllocated>\r\n            <CanLevel>1</CanLevel>\r\n            <AccrueAt>3</AccrueAt>\r\n            <Work>PT0H0M0S</Work>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <StandardRate>0</StandardRate>\r\n            <StandardRateFormat>2</StandardRateFormat>\r\n            <Cost>0</Cost>\r\n            <OvertimeRate>0</OvertimeRate>\r\n            <OvertimeRateFormat>2</OvertimeRateFormat>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <CostPerUse>0</CostPerUse>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <CostVariance>0</CostVariance>\r\n            <SV>0.00</SV>\r\n            <CV>0.00</CV>\r\n            <ACWP>0.00</ACWP>\r\n            <CalendarUID>2</CalendarUID>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <IsGeneric>0</IsGeneric>\r\n            <IsInactive>0</IsInactive>\r\n            <IsEnterprise>0</IsEnterprise>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate><%= currentDate %></CreationDate>\r\n            <IsCostResource>0</IsCostResource>\r\n            <IsBudget>0</IsBudget>\r\n        </Resource>\r\n    </Resources>\r\n    <Assignments/>\r\n</Project>\r\n";
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
        return this.props.model.getOutlineLevel() - 1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvbm9kZV9tb2R1bGVzL2JhYmVsL2V4dGVybmFsLWhlbHBlcnMuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NsaWVudENvbmZpZy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9jb2xsZWN0aW9ucy9UYXNrQ29sbGVjdGlvbi5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvZmFrZV9jODA5MTAzMy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Jlc291cmNlUmVmZXJlbmNlLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy94bWxXb3JrZXIuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL0NvbW1lbnRzVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Nb2RhbFRhc2tFZGl0Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvTm90aWZpY2F0aW9ucy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvUmVzb3VyY2VzRWRpdG9yLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9GaWx0ZXJNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvR3JvdXBpbmdNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvTVNQcm9qZWN0TWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L01pc2NNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvVG9wTWVudVZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L1pvb21NZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQWxvbmVUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQmFzaWNUYXNrVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvQ29ubmVjdG9yVmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcuanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhc0NoYXJ0L05lc3RlZFRhc2tWaWV3LmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0NvbnRleHRNZW51Vmlldy5qcyIsIi9ob21lL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9EYXRlUGlja2VyLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL05lc3RlZFRhc2suanMiLCIvaG9tZS9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvU2lkZVBhbmVsLmpzIiwiL2hvbWUvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOzs7Ozs7O0FDRkEsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFakMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFN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QUcsa0JBQVc7QUFDaEIsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCLFlBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxZQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDL0MsWUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDckUsWUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7QUFDdEMsZ0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDNUQsTUFBTTtBQUNILGdCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3BEO0FBQ0QsWUFBSSxBQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7QUFDdEQsZ0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDN0QsTUFBTTtBQUNILGdCQUFJLENBQUMsRUFBRSxDQUFDLElB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N0I7WUFDTDs7a0JBQUksR0FBRyxFQUFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsb0JBQW9CLEVBQUMsWUFBUyxPQUFPO0FBQzNELHlCQUFLLEVBQUUsRUFBQyxTQUFTLEVBQUUsV0FBVyxLQUFLLE9BQU8sR0FBRyxZQUFZLEdBQUcsSUFBSSxFQUFDLEFBQUM7O2dCQUVqRSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQzthQUMxQjtZQUNMOztrQkFBSSxHQUFHLEVBQUMsS0FBSyxFQUFDLFNBQVMsRUFBQyxrQkFBa0IsRUFBQyxZQUFTLEtBQUs7QUFDckQseUJBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxXQUFXLEtBQUssS0FBSyxHQUFHLFlBQVksR0FBRyxJQUFJLEVBQUMsQUFBQzs7Z0JBRS9ELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO2FBQ3hCO1lBQ0w7O2tCQUFJLEdBQUcsRUFBQyxVQUFVLEVBQUMsU0FBUyxFQUFDLHVCQUF1QixFQUFDLFlBQVMsVUFBVTtBQUNwRSx5QkFBSyxFQUFFLEVBQUMsU0FBUyxFQUFFLFdBQVcsS0FBSyxVQUFVLEdBQUcsWUFBWSxHQUFHLElBQUksRUFBQyxBQUFDOztnQkFFcEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7YUFDN0I7U0FDSixDQUNQO0tBQ0w7Q0FDSixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuKGZ1bmN0aW9uKGdsb2JhbCl7dmFyIGJhYmVsSGVscGVycz1nbG9iYWwuYmFiZWxIZWxwZXJzPXt9O2JhYmVsSGVscGVycy5pbmhlcml0cz1mdW5jdGlvbihzdWJDbGFzcyxzdXBlckNsYXNzKXtpZih0eXBlb2Ygc3VwZXJDbGFzcyE9PVwiZnVuY3Rpb25cIiYmc3VwZXJDbGFzcyE9PW51bGwpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiBzdXBlckNsYXNzKX1zdWJDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzJiZzdXBlckNsYXNzLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnN1YkNsYXNzLGVudW1lcmFibGU6ZmFsc2Usd3JpdGFibGU6dHJ1ZSxjb25maWd1cmFibGU6dHJ1ZX19KTtpZihzdXBlckNsYXNzKXN1YkNsYXNzLl9fcHJvdG9fXz1zdXBlckNsYXNzfTtiYWJlbEhlbHBlcnMuZGVmYXVsdHM9ZnVuY3Rpb24ob2JqLGRlZmF1bHRzKXt2YXIga2V5cz1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7Zm9yKHZhciBpPTA7aTxrZXlzLmxlbmd0aDtpKyspe3ZhciBrZXk9a2V5c1tpXTt2YXIgdmFsdWU9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cyxrZXkpO2lmKHZhbHVlJiZ2YWx1ZS5jb25maWd1cmFibGUmJm9ialtrZXldPT09dW5kZWZpbmVkKXtPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLGtleSx2YWx1ZSl9fXJldHVybiBvYmp9O2JhYmVsSGVscGVycy5jcmVhdGVDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGtleSBpbiBwcm9wcyl7dmFyIHByb3A9cHJvcHNba2V5XTtwcm9wLmNvbmZpZ3VyYWJsZT10cnVlO2lmKHByb3AudmFsdWUpcHJvcC53cml0YWJsZT10cnVlfU9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl9cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuY3JlYXRlQ29tcHV0ZWRDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGk9MDtpPHByb3BzLmxlbmd0aDtpKyspe3ZhciBwcm9wPXByb3BzW2ldO3Byb3AuY29uZmlndXJhYmxlPXRydWU7aWYocHJvcC52YWx1ZSlwcm9wLndyaXRhYmxlPXRydWU7T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wLmtleSxwcm9wKX19cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuYXBwbHlDb25zdHJ1Y3Rvcj1mdW5jdGlvbihDb25zdHJ1Y3RvcixhcmdzKXt2YXIgaW5zdGFuY2U9T2JqZWN0LmNyZWF0ZShDb25zdHJ1Y3Rvci5wcm90b3R5cGUpO3ZhciByZXN1bHQ9Q29uc3RydWN0b3IuYXBwbHkoaW5zdGFuY2UsYXJncyk7cmV0dXJuIHJlc3VsdCE9bnVsbCYmKHR5cGVvZiByZXN1bHQ9PVwib2JqZWN0XCJ8fHR5cGVvZiByZXN1bHQ9PVwiZnVuY3Rpb25cIik/cmVzdWx0Omluc3RhbmNlfTtiYWJlbEhlbHBlcnMudGFnZ2VkVGVtcGxhdGVMaXRlcmFsPWZ1bmN0aW9uKHN0cmluZ3MscmF3KXtyZXR1cm4gT2JqZWN0LmZyZWV6ZShPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHJpbmdzLHtyYXc6e3ZhbHVlOk9iamVjdC5mcmVlemUocmF3KX19KSl9O2JhYmVsSGVscGVycy50YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZT1mdW5jdGlvbihzdHJpbmdzLHJhdyl7c3RyaW5ncy5yYXc9cmF3O3JldHVybiBzdHJpbmdzfTtiYWJlbEhlbHBlcnMuaW50ZXJvcFJlcXVpcmU9ZnVuY3Rpb24ob2JqKXtyZXR1cm4gb2JqJiZvYmouX19lc01vZHVsZT9vYmpbXCJkZWZhdWx0XCJdOm9ian07YmFiZWxIZWxwZXJzLnRvQXJyYXk9ZnVuY3Rpb24oYXJyKXtyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpP2FycjpBcnJheS5mcm9tKGFycil9O2JhYmVsSGVscGVycy50b0NvbnN1bWFibGVBcnJheT1mdW5jdGlvbihhcnIpe2lmKEFycmF5LmlzQXJyYXkoYXJyKSl7Zm9yKHZhciBpPTAsYXJyMj1BcnJheShhcnIubGVuZ3RoKTtpPGFyci5sZW5ndGg7aSsrKWFycjJbaV09YXJyW2ldO3JldHVybiBhcnIyfWVsc2V7cmV0dXJuIEFycmF5LmZyb20oYXJyKX19O2JhYmVsSGVscGVycy5zbGljZWRUb0FycmF5PWZ1bmN0aW9uKGFycixpKXtpZihBcnJheS5pc0FycmF5KGFycikpe3JldHVybiBhcnJ9ZWxzZSBpZihTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpe3ZhciBfYXJyPVtdO2Zvcih2YXIgX2l0ZXJhdG9yPWFycltTeW1ib2wuaXRlcmF0b3JdKCksX3N0ZXA7IShfc3RlcD1faXRlcmF0b3IubmV4dCgpKS5kb25lOyl7X2Fyci5wdXNoKF9zdGVwLnZhbHVlKTtpZihpJiZfYXJyLmxlbmd0aD09PWkpYnJlYWt9cmV0dXJuIF9hcnJ9ZWxzZXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKX19O2JhYmVsSGVscGVycy5vYmplY3RXaXRob3V0UHJvcGVydGllcz1mdW5jdGlvbihvYmosa2V5cyl7dmFyIHRhcmdldD17fTtmb3IodmFyIGkgaW4gb2JqKXtpZihrZXlzLmluZGV4T2YoaSk+PTApY29udGludWU7aWYoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosaSkpY29udGludWU7dGFyZ2V0W2ldPW9ialtpXX1yZXR1cm4gdGFyZ2V0fTtiYWJlbEhlbHBlcnMuaGFzT3duPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7YmFiZWxIZWxwZXJzLnNsaWNlPUFycmF5LnByb3RvdHlwZS5zbGljZTtiYWJlbEhlbHBlcnMuYmluZD1GdW5jdGlvbi5wcm90b3R5cGUuYmluZDtiYWJlbEhlbHBlcnMuZGVmaW5lUHJvcGVydHk9ZnVuY3Rpb24ob2JqLGtleSx2YWx1ZSl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosa2V5LHt2YWx1ZTp2YWx1ZSxlbnVtZXJhYmxlOnRydWUsY29uZmlndXJhYmxlOnRydWUsd3JpdGFibGU6dHJ1ZX0pfTtiYWJlbEhlbHBlcnMuYXN5bmNUb0dlbmVyYXRvcj1mdW5jdGlvbihmbil7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGdlbj1mbi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXt2YXIgY2FsbE5leHQ9c3RlcC5iaW5kKG51bGwsXCJuZXh0XCIpO3ZhciBjYWxsVGhyb3c9c3RlcC5iaW5kKG51bGwsXCJ0aHJvd1wiKTtmdW5jdGlvbiBzdGVwKGtleSxhcmcpe3RyeXt2YXIgaW5mbz1nZW5ba2V5XShhcmcpO3ZhciB2YWx1ZT1pbmZvLnZhbHVlfWNhdGNoKGVycm9yKXtyZWplY3QoZXJyb3IpO3JldHVybn1pZihpbmZvLmRvbmUpe3Jlc29sdmUodmFsdWUpfWVsc2V7UHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGNhbGxOZXh0LGNhbGxUaHJvdyl9fWNhbGxOZXh0KCl9KX19O2JhYmVsSGVscGVycy5pbnRlcm9wUmVxdWlyZVdpbGRjYXJkPWZ1bmN0aW9uKG9iail7cmV0dXJuIG9iaiYmb2JqLl9fZXNNb2R1bGU/b2JqOntcImRlZmF1bHRcIjpvYmp9fTtiYWJlbEhlbHBlcnMuX3R5cGVvZj1mdW5jdGlvbihvYmope3JldHVybiBvYmomJm9iai5jb25zdHJ1Y3Rvcj09PVN5bWJvbD9cInN5bWJvbFwiOnR5cGVvZiBvYmp9O2JhYmVsSGVscGVycy5fZXh0ZW5kcz1PYmplY3QuYXNzaWdufHxmdW5jdGlvbih0YXJnZXQpe2Zvcih2YXIgaT0xO2k8YXJndW1lbnRzLmxlbmd0aDtpKyspe3ZhciBzb3VyY2U9YXJndW1lbnRzW2ldO2Zvcih2YXIga2V5IGluIHNvdXJjZSl7aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSxrZXkpKXt0YXJnZXRba2V5XT1zb3VyY2Vba2V5XX19fXJldHVybiB0YXJnZXR9O2JhYmVsSGVscGVycy5nZXQ9ZnVuY3Rpb24gZ2V0KG9iamVjdCxwcm9wZXJ0eSxyZWNlaXZlcil7dmFyIGRlc2M9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QscHJvcGVydHkpO2lmKGRlc2M9PT11bmRlZmluZWQpe3ZhciBwYXJlbnQ9T2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7aWYocGFyZW50PT09bnVsbCl7cmV0dXJuIHVuZGVmaW5lZH1lbHNle3JldHVybiBnZXQocGFyZW50LHByb3BlcnR5LHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZX1lbHNle3ZhciBnZXR0ZXI9ZGVzYy5nZXQ7aWYoZ2V0dGVyPT09dW5kZWZpbmVkKXtyZXR1cm4gdW5kZWZpbmVkfXJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcil9fTtiYWJlbEhlbHBlcnMuc2V0PWZ1bmN0aW9uIHNldChvYmplY3QscHJvcGVydHksdmFsdWUscmVjZWl2ZXIpe3ZhciBkZXNjPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LHByb3BlcnR5KTtpZihkZXNjPT09dW5kZWZpbmVkKXt2YXIgcGFyZW50PU9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO2lmKHBhcmVudCE9PW51bGwpe3JldHVybiBzZXQocGFyZW50LHByb3BlcnR5LHZhbHVlLHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZT12YWx1ZX1lbHNle3ZhciBzZXR0ZXI9ZGVzYy5zZXQ7aWYoc2V0dGVyIT09dW5kZWZpbmVkKXtyZXR1cm4gc2V0dGVyLmNhbGwocmVjZWl2ZXIsdmFsdWUpfX19O2JhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjaz1mdW5jdGlvbihpbnN0YW5jZSxDb25zdHJ1Y3Rvcil7aWYoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX19O2JhYmVsSGVscGVycy5vYmplY3REZXN0cnVjdHVyaW5nRW1wdHk9ZnVuY3Rpb24ob2JqKXtpZihvYmo9PW51bGwpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBkZXN0cnVjdHVyZSB1bmRlZmluZWRcIil9O2JhYmVsSGVscGVycy50ZW1wb3JhbFVuZGVmaW5lZD17fTtiYWJlbEhlbHBlcnMudGVtcG9yYWxBc3NlcnREZWZpbmVkPWZ1bmN0aW9uKHZhbCxuYW1lLHVuZGVmKXtpZih2YWw9PT11bmRlZil7dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG5hbWUrXCIgaXMgbm90IGRlZmluZWQgLSB0ZW1wb3JhbCBkZWFkIHpvbmVcIil9cmV0dXJuIHRydWV9O2JhYmVsSGVscGVycy5zZWxmR2xvYmFsPXR5cGVvZiBnbG9iYWw9PT1cInVuZGVmaW5lZFwiP3NlbGY6Z2xvYmFsfSkodHlwZW9mIGdsb2JhbD09PVwidW5kZWZpbmVkXCI/c2VsZjpnbG9iYWwpO1xufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJsZXQgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvdXRpbCcpO1xyXG5sZXQgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbmxldCB0YXNrc1N1YlVSTCA9ICcnO1xyXG4vLyBkZXRlY3QgQVBJIHBhcmFtcyBmcm9tIGdldCwgZS5nLiA/cHJvamVjdD0xNDMmcHJvZmlsZT0xNyZzaXRla2V5PTJiMDBkYTQ2YjU3YzAzOTVcclxuaWYgKHBhcmFtcy5wcm9qZWN0ICYmIHBhcmFtcy5wcm9maWxlICYmIHBhcmFtcy5zaXRla2V5KSB7XHJcbiAgICB0YXNrc1N1YlVSTCA9ICcvJyArIHBhcmFtcy5wcm9qZWN0ICsgJy8nICsgcGFyYW1zLnByb2ZpbGUgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcclxufVxyXG5leHBvcnQgbGV0IHRhc2tzVVJMID0gJ2FwaS90YXNrcy8nICsgdGFza3NTdWJVUkw7XHJcblxyXG5cclxuXHJcbmxldCBjb25maWdTdWJVUkwgPSAnJztcclxuaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcclxuICAgIGNvbmZpZ1N1YlVSTCA9ICcvd2JzLycgKyBwYXJhbXMucHJvamVjdCArICcvJyArIHBhcmFtcy5zaXRla2V5O1xyXG59XHJcblxyXG5leHBvcnQgbGV0IGNvbmZpZ1VSTCA9ICcvYXBpL0dhbnR0Q29uZmlnJyArIGNvbmZpZ1N1YlVSTDtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVzb3VyY2VSZWZlcmVuY2VNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9SZXNvdXJjZVJlZmVyZW5jZScpO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xuXG52YXIgQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICB1cmwgOiAnYXBpL3Jlc291cmNlcy8nICsgKHBhcmFtcy5wcm9qZWN0IHx8IDEpICsgJy8nICsgKHBhcmFtcy5wcm9maWxlIHx8IDEpLFxuXHRtb2RlbDogUmVzb3VyY2VSZWZlcmVuY2VNb2RlbCxcbiAgICBpZEF0dHJpYnV0ZSA6ICdJRCcsXG4gICAgdXBkYXRlUmVzb3VyY2VzRm9yVGFzayA6IGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9sZCByZWZlcmVuY2VzXG4gICAgICAgIHRoaXMudG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgICAgICBpZiAocmVmLmdldCgnV0JTSUQnKS50b1N0cmluZygpICE9PSB0YXNrLmlkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXNPbGQgPSB0YXNrLmdldCgncmVzb3VyY2VzJykuaW5kZXhPZihyZWYuZ2V0KCdSZXNJRCcpKTtcbiAgICAgICAgICAgIGlmIChpc09sZCkge1xuICAgICAgICAgICAgICAgIHJlZi5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAvLyBhZGQgbmV3IHJlZmVyZW5jZXNcbiAgICAgICAgdGFzay5nZXQoJ3Jlc291cmNlcycpLmZvckVhY2goZnVuY3Rpb24ocmVzSWQpIHtcbiAgICAgICAgICAgIHZhciBpc0V4aXN0ID0gdGhpcy5maW5kV2hlcmUoe1Jlc0lEIDogcmVzSWR9KTtcbiAgICAgICAgICAgIGlmICghaXNFeGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgUmVzSUQgOiByZXNJZCxcbiAgICAgICAgICAgICAgICAgICAgV0JTSUQgOiB0YXNrLmlkLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBwYXJzZSA6IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgcmVzdWx0ICA9IFtdO1xuICAgICAgICByZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLlJlc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHJlc0l0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gcmVzSXRlbTtcbiAgICAgICAgICAgICAgICBvYmouV0JTSUQgPSBpdGVtLldCU0lEO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG9iaik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbjtcblxuIiwidmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmw6ICdhcGkvdGFza3MnLFxuXHRtb2RlbDogVGFza01vZGVsLFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc3Vic2NyaWJlKCk7XG5cdH0sXG5cdGNvbXBhcmF0b3I6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdH0sXG5cdGxpbmtDaGlsZHJlbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHBhcmVudFRhc2sgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50VGFzaykge1xuXHRcdFx0XHRpZiAocGFyZW50VGFzayA9PT0gdGFzaykge1xuXHRcdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd0YXNrIGhhcyBwYXJlbnQgd2l0aCBpZCAnICsgdGFzay5nZXQoJ3BhcmVudGlkJykgKyAnIC0gYnV0IHRoZXJlIGlzIG5vIHN1Y2ggdGFzaycpO1xuXHRcdFx0XHR0YXNrLnVuc2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cdF9zb3J0Q2hpbGRyZW46IGZ1bmN0aW9uICh0YXNrLCBzb3J0SW5kZXgpIHtcblx0XHR0YXNrLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRjaGlsZC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHNvcnRJbmRleCA9IHRoaXMuX3NvcnRDaGlsZHJlbihjaGlsZCwgc29ydEluZGV4KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdGNoZWNrU29ydGVkSW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAtMTtcblx0XHR0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKHRhc2ssIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0X3Jlc29ydENoaWxkcmVuOiBmdW5jdGlvbihkYXRhLCBzdGFydEluZGV4LCBwYXJlbnRJRCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSBzdGFydEluZGV4O1xuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbih0YXNrRGF0YSkge1xuXHRcdFx0dmFyIHRhc2sgPSB0aGlzLmdldCh0YXNrRGF0YS5pZCk7XG5cdFx0XHRpZiAodGFzay5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudElEKSB7XG5cdFx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldChwYXJlbnRJRCk7XG5cdFx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0XHRuZXdQYXJlbnQuY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNhdmUoe1xuXHRcdFx0XHRzb3J0aW5kZXg6ICsrc29ydEluZGV4LFxuXHRcdFx0XHRwYXJlbnRpZDogcGFyZW50SURcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhc2tEYXRhLmNoaWxkcmVuICYmIHRhc2tEYXRhLmNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRzb3J0SW5kZXggPSB0aGlzLl9yZXNvcnRDaGlsZHJlbih0YXNrRGF0YS5jaGlsZHJlbiwgc29ydEluZGV4LCB0YXNrLmlkKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHRcdHJldHVybiBzb3J0SW5kZXg7XG5cdH0sXG5cdHJlc29ydDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR0aGlzLl9yZXNvcnRDaGlsZHJlbihkYXRhLCAtMSwgMCk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0c3Vic2NyaWJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBhZGQgZW1wdHkgdGFzayBpZiBubyB0YXNrcyBmcm9tIHNlcnZlclxuICAgICAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldChbe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IHRhc2snXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdHBhcmVudC5jaGlsZHJlbi5hZGQobW9kZWwpO1xuXHRcdFx0XHRcdG1vZGVsLnBhcmVudCA9IHBhcmVudDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ2NhbiBub3QgZmluZCBwYXJlbnQgd2l0aCBpZCAnICsgbW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdFx0XHRtb2RlbC5zZXQoJ3BhcmVudGlkJywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdyZXNldCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5saW5rQ2hpbGRyZW4oKTtcblx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0dGhpcy5fY2hlY2tEZXBlbmRlbmNpZXMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAodGFzay5wYXJlbnQpIHtcblx0XHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4ucmVtb3ZlKHRhc2spO1xuXHRcdFx0XHR0YXNrLnBhcmVudCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG5ld1BhcmVudCA9IHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHRcdGlmIChuZXdQYXJlbnQpIHtcblx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fcHJldmVudFNvcnRpbmcpIHtcblx0XHRcdFx0dGhpcy5jaGVja1NvcnRlZEluZGV4KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGNyZWF0ZURlcGVuZGVuY3k6IGZ1bmN0aW9uIChiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmICh0aGlzLl9jYW5DcmVhdGVEZXBlbmRlbmNlKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSkge1xuXHRcdFx0YWZ0ZXJNb2RlbC5kZXBlbmRPbihiZWZvcmVNb2RlbCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9jYW5DcmVhdGVEZXBlbmRlbmNlOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmIChiZWZvcmVNb2RlbC5oYXNQYXJlbnQoYWZ0ZXJNb2RlbCkgfHwgYWZ0ZXJNb2RlbC5oYXNQYXJlbnQoYmVmb3JlTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChiZWZvcmVNb2RlbC5oYXNJbkRlcHMoYWZ0ZXJNb2RlbCkgfHxcblx0XHRcdGFmdGVyTW9kZWwuaGFzSW5EZXBzKGJlZm9yZU1vZGVsKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0cmVtb3ZlRGVwZW5kZW5jeTogZnVuY3Rpb24oYWZ0ZXJNb2RlbCkge1xuXHRcdGFmdGVyTW9kZWwuY2xlYXJEZXBlbmRlbmNlKCk7XG5cdH0sXG5cdF9jaGVja0RlcGVuZGVuY2llczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKCh0YXNrKSA9PiB7XG5cdFx0XHR2YXIgaWRzID0gdGFzay5nZXQoJ2RlcGVuZCcpLmNvbmNhdChbXSk7XG5cdFx0XHR2YXIgaGFzR29vZERlcGVuZHMgPSBmYWxzZTtcblx0XHRcdGlmIChpZHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Xy5lYWNoKGlkcywgKGlkKSA9PiB7XG5cdFx0XHRcdHZhciBiZWZvcmVNb2RlbCA9IHRoaXMuZ2V0KGlkKTtcblx0XHRcdFx0aWYgKGJlZm9yZU1vZGVsKSB7XG5cdFx0XHRcdFx0dGFzay5kZXBlbmRPbihiZWZvcmVNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0aGFzR29vZERlcGVuZHMgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmICghaGFzR29vZERlcGVuZHMpIHtcblx0XHRcdFx0dGFzay5zYXZlKCdkZXBlbmQnLCBbXSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdG91dGRlbnQ6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgdW5kZXJTdWJsaW5ncyA9IFtdO1xuXHRcdGlmICh0YXNrLnBhcmVudCkge1xuXHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRpZiAoY2hpbGQuZ2V0KCdzb3J0aW5kZXgnKSA8PSB0YXNrLmdldCgnc29ydGluZGV4JykpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dW5kZXJTdWJsaW5ncy5wdXNoKGNoaWxkKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR1bmRlclN1YmxpbmdzLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5kZXBlbmRzLmdldCh0YXNrLmlkKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkLmNsZWFyRGVwZW5kZW5jZSgpO1xuICAgICAgICAgICAgfVxuXHRcdFx0Y2hpbGQuc2F2ZSgncGFyZW50aWQnLCB0YXNrLmlkKTtcblx0XHR9KTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdGlmICh0YXNrLnBhcmVudCAmJiB0YXNrLnBhcmVudC5wYXJlbnQpIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCB0YXNrLnBhcmVudC5wYXJlbnQuaWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgMCk7XG5cdFx0fVxuXHR9LFxuXHRpbmRlbnQ6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgcHJldlRhc2ssIGksIG07XG5cdFx0Zm9yIChpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0bSA9IHRoaXMuYXQoaSk7XG5cdFx0XHRpZiAoKG0uZ2V0KCdzb3J0aW5kZXgnKSA8IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSkgJiYgKHRhc2sucGFyZW50ID09PSBtLnBhcmVudCkpIHtcblx0XHRcdFx0cHJldlRhc2sgPSBtO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHByZXZUYXNrKSB7XG5cdFx0XHR0YXNrLnNhdmUoJ3BhcmVudGlkJywgcHJldlRhc2suaWQpO1xuXHRcdH1cblx0fSxcbiAgICBpbXBvcnRUYXNrczogZnVuY3Rpb24odGFza0pTT05hcnJheSwgY2FsbGJhY2spIHtcblx0XHR2YXIgc29ydGluZGV4ID0gLTE7XG5cdFx0aWYgKHRoaXMubGFzdCgpKSB7XG5cdFx0XHRzb3J0aW5kZXggPSB0aGlzLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdH1cbiAgICAgICAgdGFza0pTT05hcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2tJdGVtKSB7XG4gICAgICAgICAgICB0YXNrSXRlbS5zb3J0aW5kZXggPSArK3NvcnRpbmRleDtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBsZW5ndGggPSB0YXNrSlNPTmFycmF5Lmxlbmd0aDtcbiAgICAgICAgdmFyIGRvbmUgPSAwO1xuICAgICAgICB0aGlzLmFkZCh0YXNrSlNPTmFycmF5LCB7cGFyc2U6IHRydWV9KS5mb3JFYWNoKCh0YXNrKSA9PiB7XG4gICAgICAgICAgICB0YXNrLnNhdmUoe30sIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUgPT09IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZURlcHM6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IHRydWU7XG4gICAgICAgIGRhdGEucGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5wYXJlbnQubmFtZSxcblx0XHRcdFx0b3V0bGluZTogaXRlbS5wYXJlbnQub3V0bGluZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5jaGlsZC5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBpdGVtLmNoaWxkLm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hpbGQuc2F2ZSgncGFyZW50aWQnLCBwYXJlbnQuaWQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG5cdFx0ZGF0YS5kZXBzLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG4gICAgICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogZGVwLmJlZm9yZS5uYW1lLFxuXHRcdFx0XHRvdXRsaW5lOiBkZXAuYmVmb3JlLm91dGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGFmdGVyTW9kZWwgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogZGVwLmFmdGVyLm5hbWUsXG5cdFx0XHRcdG91dGxpbmU6IGRlcC5hZnRlci5vdXRsaW5lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrQ29sbGVjdGlvbjtcbiIsInJlcXVpcmUoJ2JhYmVsL2V4dGVybmFsLWhlbHBlcnMnKTtcblxuaW1wb3J0IFRhc2tDb2xsZWN0aW9uIGZyb20gJy4vY29sbGVjdGlvbnMvVGFza0NvbGxlY3Rpb24nO1xuaW1wb3J0IFNldHRpbmdzIGZyb20gJy4vbW9kZWxzL1NldHRpbmdNb2RlbCc7XG5cbmltcG9ydCBHYW50dFZpZXcgZnJvbSAnLi92aWV3cy9HYW50dFZpZXcnO1xuaW1wb3J0IHt0YXNrc1VSTCwgY29uZmlnVVJMfSBmcm9tICcuL2NsaWVudENvbmZpZyc7XG5cblxuZnVuY3Rpb24gbG9hZFRhc2tzKHRhc2tzKSB7XG4gICAgdmFyIGRmZCA9IG5ldyAkLkRlZmVycmVkKCk7XG5cdHRhc2tzLmZldGNoKHtcblx0XHRzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRmZC5yZXNvbHZlKCk7XG5cdFx0fSxcblx0XHRlcnJvcjogZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBkZmQucmVqZWN0KGVycik7XG5cdFx0fSxcblx0XHRwYXJzZTogdHJ1ZSxcblx0XHRyZXNldDogdHJ1ZVxuXHR9KTtcbiAgICByZXR1cm4gZGZkLnByb21pc2UoKTtcbn1cblxuZnVuY3Rpb24gbG9hZFNldHRpbmdzKHNldHRpbmdzKSB7XG4gICAgcmV0dXJuICQuZ2V0SlNPTihjb25maWdVUkwpXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBzZXR0aW5ncy5zdGF0dXNlcyA9IGRhdGE7XG4gICAgICAgIH0pO1xufVxuXG5cbiQoKCkgPT4ge1xuXHRsZXQgdGFza3MgPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcbiAgICB0YXNrcy51cmwgPSB0YXNrc1VSTDtcbiAgICBsZXQgc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3Moe30sIHt0YXNrczogdGFza3N9KTtcblxuICAgIHdpbmRvdy50YXNrcyA9IHRhc2tzO1xuXG4gICAgJC53aGVuKGxvYWRUYXNrcyh0YXNrcykpXG4gICAgLnRoZW4oKCkgPT4gbG9hZFNldHRpbmdzKHNldHRpbmdzKSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTdWNjZXNzIGxvYWRpbmcgdGFza3MuJyk7XG4gICAgICAgIG5ldyBHYW50dFZpZXcoe1xuICAgICAgICAgICAgc2V0dGluZ3M6IHNldHRpbmdzLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogdGFza3NcbiAgICAgICAgfSkucmVuZGVyKCk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB7XG5cblxuXG4gICAgICAgIC8vIGhpZGUgbG9hZGluZ1xuICAgICAgICAkKCcjbG9hZGVyJykuZmFkZU91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gZGlzcGxheSBoZWFkIGFsd2F5cyBvbiB0b3BcbiAgICAgICAgICAgICQoJyNoZWFkJykuY3NzKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGVuYWJsZSBzY3JvbGxpbmdcbiAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaG9sZC1zY3JvbGwnKTtcbiAgICAgICAgfSk7XG4gICAgfSkuZmFpbCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZycsIGVycm9yKTtcbiAgICB9KTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgUmVzb3VyY2VSZWZlcmVuY2UgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBtYWluIHBhcmFtc1xyXG4gICAgICAgIFdCU0lEIDogMSwgLy8gdGFzayBpZFxyXG4gICAgICAgIFJlc0lEOiAxLCAvLyByZXNvdXJjZSBpZFxyXG4gICAgICAgIFRTQWN0aXZhdGU6IHRydWUsXHJcblxyXG4gICAgICAgIC8vIHNvbWUgc2VydmVyIHBhcmFtc1xyXG4gICAgICAgIFdCU1Byb2ZpbGVJRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIFBhcnRpdE5vIDogJzJiMDBkYTQ2YjU3YzAzOTUnLCAvLyBoYXZlIG5vIGlkZWEgd2hhdCBpcyB0aGF0XHJcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5XHJcblxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZVJlZmVyZW5jZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxuXHJcbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdGRlZmF1bHRzOiB7XHJcblx0XHRpbnRlcnZhbDogJ2RhaWx5JyxcclxuXHRcdC8vZGF5cyBwZXIgaW50ZXJ2YWxcclxuXHRcdGRwaTogMVxyXG5cdH0sXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cnMsIHBhcmFtcykge1xyXG5cdFx0dGhpcy5zdGF0dXNlcyA9IHVuZGVmaW5lZDtcclxuXHRcdHRoaXMuc2F0dHIgPSB7XHJcblx0XHRcdGhEYXRhOiB7fSxcclxuXHRcdFx0ZHJhZ0ludGVydmFsOiAxLFxyXG5cdFx0XHRkYXlzV2lkdGg6IDUsXHJcblx0XHRcdGNlbGxXaWR0aDogMzUsXHJcblx0XHRcdG1pbkRhdGU6IG5ldyBEYXRlKDIwMjAsMSwxKSxcclxuXHRcdFx0bWF4RGF0ZTogbmV3IERhdGUoMCwwLDApLFxyXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxyXG5cdFx0XHRib3VuZGFyeU1heDogbmV3IERhdGUoMjAyMCwxLDEpLFxyXG5cdFx0XHQvL21vbnRocyBwZXIgY2VsbFxyXG5cdFx0XHRtcGM6IDFcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcclxuXHRcdFx0c2NyZWVuV2lkdGg6ICAkKCcjZ2FudHQtY29udGFpbmVyJykuaW5uZXJXaWR0aCgpICsgNzg2LFxyXG5cdFx0XHR0SGlkZGVuV2lkdGg6IDMwNSxcclxuXHRcdFx0dGFibGVXaWR0aDogNzEwXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuY29sbGVjdGlvbiA9IHBhcmFtcy50YXNrcztcclxuXHRcdHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XHJcblx0XHR0aGlzLm9uKCdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCBjaGFuZ2U6ZW5kJywgXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMoKTtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2U6d2lkdGgnKTtcclxuICAgICAgICB9LCA1MDApKTtcclxuXHR9LFxyXG5cdGdldFNldHRpbmc6IGZ1bmN0aW9uKGZyb20sIGF0dHIpe1xyXG5cdFx0aWYoYXR0cil7XHJcblx0XHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dW2F0dHJdO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXNbJ3MnICsgZnJvbV07XHJcblx0fSxcclxuXHRmaW5kU3RhdHVzSWQgOiBmdW5jdGlvbihzdGF0dXMpIHtcclxuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBzdGF0dXMudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZFN0YXR1c0ZvcklkIDogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdFN0YXR1c0lkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5jRGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cdGZpbmRIZWFsdGhJZCA6IGZ1bmN0aW9uKGhlYWx0aCkge1xyXG5cdFx0Zm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG5cdFx0XHRpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcblx0XHRcdFx0XHR2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuXHRcdFx0XHRcdGlmIChzdGF0dXNJdGVtLmNmZ19pdGVtLnRvTG93ZXJDYXNlKCkgPT09IGhlYWx0aC50b0xvd2VyQ2FzZSgpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcbiAgICBmaW5kSGVhbHRoRm9ySWQgOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uSUQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSBpZC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGZpbmREZWZhdWx0SGVhbHRoSWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLmNEZWZhdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblx0ZmluZFdPSWQgOiBmdW5jdGlvbih3bykge1xyXG5cdFx0Zm9yKHZhciBpIGluIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGEpIHtcclxuXHRcdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhW2ldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5XT051bWJlci50b0xvd2VyQ2FzZSgpID09PSB3by50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5JRDtcclxuICAgICAgICAgICAgfVxyXG5cdFx0fVxyXG5cdH0sXHJcbiAgICBmaW5kV09Gb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBpIGluIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhW2ldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5JRC50b1N0cmluZygpID09PSBpZC50b1N0cmluZygpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5XT051bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdFdPSWQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVswXS5JRDtcclxuICAgIH0sXHJcbiAgICBnZXREYXRlRm9ybWF0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICdkZC9tbS95eSc7XHJcbiAgICB9LFxyXG5cdGNhbGNtaW5tYXg6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG1pbkRhdGUgPSBuZXcgRGF0ZSgpLCBtYXhEYXRlID0gbWluRGF0ZS5jbG9uZSgpLmFkZFllYXJzKDEpO1xyXG5cclxuXHRcdHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XHJcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3N0YXJ0JykuY29tcGFyZVRvKG1pbkRhdGUpID09PSAtMSkge1xyXG5cdFx0XHRcdG1pbkRhdGU9bW9kZWwuZ2V0KCdzdGFydCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChtb2RlbC5nZXQoJ2VuZCcpLmNvbXBhcmVUbyhtYXhEYXRlKSA9PT0gMSkge1xyXG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGUgPSBtaW5EYXRlO1xyXG5cdFx0dGhpcy5zYXR0ci5tYXhEYXRlID0gbWF4RGF0ZTtcclxuXHR9LFxyXG5cdHNldEF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGVuZCxzYXR0cj10aGlzLnNhdHRyLGRhdHRyPXRoaXMuc2Rpc3BsYXksZHVyYXRpb24sc2l6ZSxjZWxsV2lkdGgsZHBpLHJldGZ1bmMsc3RhcnQsbGFzdCxpPTAsaj0wLGlMZW49MCxuZXh0PW51bGw7XHJcblxyXG5cdFx0dmFyIGludGVydmFsID0gdGhpcy5nZXQoJ2ludGVydmFsJyk7XHJcblxyXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAxLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDYwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTU7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDEpO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xyXG5cclxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDcsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiA3KTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKS5tb3ZlVG9EYXlPZldlZWsoMSwgLTEpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSA1O1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoNyk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDEyICogMzApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDcgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygxKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4ubW92ZVRvRmlyc3REYXlPZlF1YXJ0ZXIoKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSAzMCAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMztcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDMpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcclxuXHRcdFx0Y2VsbFdpZHRoID0gMzA7XHJcblx0XHRcdGR1cmF0aW9uID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLCBzYXR0ci5tYXhEYXRlKTtcclxuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzaXplIC8gZHVyYXRpb247XHJcblx0XHRcdGRwaSA9IE1hdGgucm91bmQoY2VsbFdpZHRoIC8gc2F0dHIuZGF5c1dpZHRoKTtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBkcGkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIgKiBkcGkpO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDMwICogMTApO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcclxuXHRcdFx0ZHBpID0gdGhpcy5nZXQoJ2RwaScpO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAoMSArIE1hdGgubG9nKGRwaSkpICogMTI7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMjAgKiBkcGkpO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygzMCAqIDEwKTtcclxuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHR9XHJcblx0XHR2YXIgaERhdGEgPSB7XHJcblx0XHRcdCcxJzogW10sXHJcblx0XHRcdCcyJzogW10sXHJcblx0XHRcdCczJzogW11cclxuXHRcdH07XHJcblx0XHR2YXIgaGRhdGEzID0gW107XHJcblxyXG5cdFx0c3RhcnQgPSBzYXR0ci5ib3VuZGFyeU1pbjtcclxuXHJcblx0XHRsYXN0ID0gc3RhcnQ7XHJcblx0XHRpZiAoaW50ZXJ2YWwgPT09ICdtb250aGx5JyB8fCBpbnRlcnZhbCA9PT0gJ3F1YXJ0ZXJseScpIHtcclxuXHRcdFx0dmFyIGR1cmZ1bmM7XHJcblx0XHRcdGlmIChpbnRlcnZhbD09PSdtb250aGx5Jykge1xyXG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5Nb250aChkYXRlLmdldEZ1bGxZZWFyKCksZGF0ZS5nZXRNb250aCgpKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGR1cmZ1bmMgPSBmdW5jdGlvbihkYXRlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5nZXREYXlzSW5RdWFydGVyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRRdWFydGVyKCkpO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdH1cclxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRoZGF0YTMucHVzaCh7XHJcblx0XHRcdFx0XHRcdGR1cmF0aW9uOiBkdXJmdW5jKGxhc3QpLFxyXG5cdFx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcclxuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzID0gdGhpcy5nZXQoJ2RwaScpO1xyXG5cdFx0XHR3aGlsZSAobGFzdC5jb21wYXJlVG8oZW5kKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpc0hvbHkgPSBsYXN0LmdldERheSgpID09PSA2IHx8IGxhc3QuZ2V0RGF5KCkgPT09IDA7XHJcblx0XHRcdFx0aGRhdGEzLnB1c2goe1xyXG5cdFx0XHRcdFx0ZHVyYXRpb246IGludGVydmFsZGF5cyxcclxuXHRcdFx0XHRcdHRleHQ6IGxhc3QuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGhvbHkgOiAoaW50ZXJ2YWwgPT09ICdkYWlseScpICYmIGlzSG9seVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xyXG5cdFx0XHRcdGxhc3QgPSBuZXh0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRzYXR0ci5ib3VuZGFyeU1heCA9IGVuZCA9IGxhc3Q7XHJcblx0XHRoRGF0YVsnMyddID0gaGRhdGEzO1xyXG5cclxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgZGF0ZSB0byBlbmQgb2YgeWVhclxyXG5cdFx0dmFyIGludGVyID0gRGF0ZS5kYXlzZGlmZihzdGFydCwgbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwgMTEsIDMxKSk7XHJcblx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRkdXJhdGlvbjogaW50ZXIsXHJcblx0XHRcdHRleHQ6IHN0YXJ0LmdldEZ1bGxZZWFyKClcclxuXHRcdH0pO1xyXG5cdFx0Zm9yKGkgPSBzdGFydC5nZXRGdWxsWWVhcigpICsgMSwgaUxlbiA9IGVuZC5nZXRGdWxsWWVhcigpOyBpIDwgaUxlbjsgaSsrKXtcclxuXHRcdFx0aW50ZXIgPSBEYXRlLmlzTGVhcFllYXIoaSkgPyAzNjYgOiAzNjU7XHJcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XHJcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHRcdHRleHQ6IGlcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGxhc3QgeWVhciB1cHRvIGVuZCBkYXRlXHJcblx0XHRpZiAoc3RhcnQuZ2V0RnVsbFllYXIoKSE9PWVuZC5nZXRGdWxsWWVhcigpKSB7XHJcblx0XHRcdGludGVyID0gRGF0ZS5kYXlzZGlmZihuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwgMCwgMSksIGVuZCk7XHJcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7XHJcblx0XHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHRcdHRleHQ6IGVuZC5nZXRGdWxsWWVhcigpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgbW9udGhcclxuXHRcdGhEYXRhWycyJ10ucHVzaCh7XHJcblx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKHN0YXJ0LCBzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLFxyXG5cdFx0XHR0ZXh0OiB1dGlsLmZvcm1hdGRhdGEoc3RhcnQuZ2V0TW9udGgoKSwgJ20nKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0aiA9IHN0YXJ0LmdldE1vbnRoKCkgKyAxO1xyXG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XHJcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XHJcblx0XHR2YXIgZW5kbW9udGggPSBlbmQuZ2V0TW9udGgoKTtcclxuXHJcblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XHJcblx0XHRcdHdoaWxlKGogPCAxMikge1xyXG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxyXG5cdFx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGosICdtJylcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRqICs9IDE7XHJcblx0XHRcdH1cclxuXHRcdFx0aSArPSAxO1xyXG5cdFx0XHRqID0gMDtcclxuXHRcdH1cclxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGgoKSAmJiBlbmQuZ2V0RnVsbFllYXIoKSAhPT0gc3RhcnQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRoRGF0YVsnMiddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxyXG5cdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShlbmQuZ2V0TW9udGgoKSwgJ20nKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHNhdHRyLmhEYXRhID0gaERhdGE7XHJcblx0fSxcclxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5jYWxjbWlubWF4KCk7XHJcblx0XHR0aGlzLnNldEF0dHJpYnV0ZXMoKTtcclxuXHR9LFxyXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgZFRvVGV4dD17XHJcblx0XHRcdCdzdGFydCc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnZW5kJzpmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xyXG5cdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLnN0YXJ0LG1vZGVsLmVuZCkrJyBkJztcclxuXHRcdFx0fSxcclxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHZhciBzdGF0dXNlcz17XHJcblx0XHRcdFx0XHQnMTEwJzonY29tcGxldGUnLFxyXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxyXG5cdFx0XHRcdFx0JzEwOCcgOiAncmVhZHknXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fTtcclxuXHRcdHJldHVybiBmdW5jdGlvbihmaWVsZCx2YWx1ZSxtb2RlbCl7XHJcblx0XHRcdHJldHVybiBkVG9UZXh0W2ZpZWxkXT9kVG9UZXh0W2ZpZWxkXSh2YWx1ZSxtb2RlbCk6dmFsdWU7XHJcblx0XHR9O1xyXG5cdH0oKSlcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdNb2RlbDtcclxuIiwidmFyIFJlc0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9jb2xsZWN0aW9ucy9SZXNvdXJjZVJlZmVyZW5jZUNvbGxlY3Rpb24nKTtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuICAgIGNvbXBhcmF0b3I6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxudmFyIHJlc0xpbmtzID0gbmV3IFJlc0NvbGxlY3Rpb24oKTtcclxucmVzTGlua3MuZmV0Y2goKTtcclxuXHJcbnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBNQUlOIFBBUkFNU1xyXG4gICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGNvbXBsZXRlOiAwLCAgLy8gMCUgLSAxMDAlIHBlcmNlbnRzXHJcbiAgICAgICAgc29ydGluZGV4OiAwLCAgIC8vIHBsYWNlIG9uIHNpZGUgbWVudSwgc3RhcnRzIGZyb20gMFxyXG4gICAgICAgIGRlcGVuZDogW10sICAvLyBpZCBvZiB0YXNrc1xyXG4gICAgICAgIHN0YXR1czogJzExMCcsICAgICAgLy8gMTEwIC0gY29tcGxldGUsIDEwOSAgLSBvcGVuLCAxMDggLSByZWFkeVxyXG4gICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIGVuZDogbmV3IERhdGUoKSxcclxuICAgICAgICBwYXJlbnRpZDogMCxcclxuICAgICAgICBDb21tZW50czogMCxcclxuXHJcbiAgICAgICAgY29sb3I6ICcjMDA5MGQzJywgICAvLyB1c2VyIGNvbG9yLCBub3QgdXNlZCBmb3Igbm93XHJcblxyXG4gICAgICAgIC8vIHNvbWUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgcmVzb3VyY2VzOiBbXSwgICAgICAgICAvL2xpc3Qgb2YgaWRcclxuICAgICAgICBoZWFsdGg6IDIxLFxyXG4gICAgICAgIHJlcG9ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdvOiAyLCAgICAgICAgICAgICAgICAgIC8vU2VsZWN0IExpc3QgaW4gcHJvcGVydGllcyBtb2RhbCAgIChjb25maWdkYXRhKVxyXG4gICAgICAgIG1pbGVzdG9uZTogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZGVsaXZlcmFibGU6IGZhbHNlLCAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBmaW5hbmNpYWw6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIHRpbWVzaGVldHM6IGZhbHNlLCAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgYWN0dGltZXNoZWV0czogZmFsc2UsICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuXHJcbiAgICAgICAgLy8gc2VydmVyIHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIC8vIGRvbid0IHVzZSB0aGVtIG9uIGNsaWVudCBzaWRlXHJcbiAgICAgICAgUHJvamVjdFJlZjogcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgV0JTX0lEOiBwYXJhbXMucHJvZmlsZSxcclxuICAgICAgICBzaXRla2V5OiBwYXJhbXMuc2l0ZWtleSxcclxuXHJcblxyXG4gICAgICAgIC8vIHBhcmFtcyBmb3IgYXBwbGljYXRpb24gdmlld3NcclxuICAgICAgICAvLyBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIEpTT05cclxuICAgICAgICBoaWRkZW46IGZhbHNlLFxyXG4gICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXHJcbiAgICAgICAgaGlnaHRsaWdodDogJydcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBzZWxmIHZhbGlkYXRpb25cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc0xpbmtzLnVwZGF0ZVJlc291cmNlc0ZvclRhc2sodGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTptaWxlc3RvbmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0JywgbmV3IERhdGUodGhpcy5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hpbGRyZW4gcmVmZXJlbmNlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgU3ViVGFza3MoKTtcclxuICAgICAgICB0aGlzLmRlcGVuZHMgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXQoJ21pbGVzdG9uZScsIGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZpbmcgcmVmc1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ3BhcmVudGlkJykgPT09IHRoaXMuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLnBhcmVudCA9IHRoaXM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnY2hhbmdlOnNvcnRpbmRleCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrVGltZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdjb2xsYXBzZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi50b0FycmF5KCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNraW5nIG5lc3RlZCBzdGF0ZVxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2FkZCByZW1vdmUnLCB0aGlzLl9jaGVja05lc3RlZCk7XHJcblxyXG4gICAgICAgIC8vIHRpbWUgY2hlY2tpbmdcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpjb21wbGV0ZScsIHRoaXMuX2NoZWNrQ29tcGxldGUpO1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbkRlcGVuZHNDb2xsZWN0aW9uKCk7XHJcbiAgICB9LFxyXG4gICAgaXNOZXN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgfSxcclxuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KCdoaWRkZW4nLCBmYWxzZSk7XHJcbiAgICB9LFxyXG4gICAgaGlkZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2hpZGRlbicsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgY2hpbGQuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGRlcGVuZE9uOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgc2lsZW50KSB7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRzLmFkZChiZWZvcmVNb2RlbCwge3NpbGVudDogc2lsZW50fSk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaGFzSW5EZXBzOiBmdW5jdGlvbiAobW9kZWwpIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLmRlcGVuZHMuZ2V0KG1vZGVsLmlkKTtcclxuICAgIH0sXHJcbiAgICB0b0pTT046IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBqc29uID0gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLnJlc291cmNlcztcclxuICAgICAgICBkZWxldGUganNvbi5oaWRkZW47XHJcbiAgICAgICAgZGVsZXRlIGpzb24uY29sbGFwc2VkO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmhpZ2h0bGlnaHQ7XHJcbiAgICAgICAganNvbi5kZXBlbmQgPSBqc29uLmRlcGVuZC5qb2luKCcsJyk7XHJcbiAgICAgICAgcmV0dXJuIGpzb247XHJcbiAgICB9LFxyXG4gICAgaGFzUGFyZW50OiBmdW5jdGlvbihwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gcGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNsZWFyRGVwZW5kZW5jZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRzLmVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kZXBlbmRzLnJlbW92ZShtKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfbGlzdGVuRGVwZW5kc0NvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5kZXBlbmRzLCAncmVtb3ZlIGFkZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaWRzID0gdGhpcy5kZXBlbmRzLm1hcCgobSkgPT4gbS5pZCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KCdkZXBlbmQnLCBpZHMpLnNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmRlcGVuZHMsICdhZGQnLCBmdW5jdGlvbihiZWZvcmVNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24udHJpZ2dlcignZGVwZW5kOmFkZCcsIGJlZm9yZU1vZGVsLCB0aGlzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmRlcGVuZHMsICdyZW1vdmUnLCBmdW5jdGlvbihiZWZvcmVNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24udHJpZ2dlcignZGVwZW5kOnJlbW92ZScsIGJlZm9yZU1vZGVsLCB0aGlzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmRlcGVuZHMsICdjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oYmVmb3JlTW9kZWwpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LnVuZGVyTW92aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2hlY2sgaW5maW5pdGUgZGVwZW5kIGxvb3BcclxuICAgICAgICAgICAgdmFyIGluRGVwcyA9IFt0aGlzXTtcclxuICAgICAgICAgICAgdmFyIGlzSW5maW5pdGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrRGVwcyhtb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtb2RlbC5kZXBlbmRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlcGVuZHMuZWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbkRlcHMuaW5kZXhPZihtKSA+IC0xIHx8IGlzSW5maW5pdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNJbmZpbml0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaW5EZXBzLnB1c2gobSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tEZXBzKG0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hlY2tEZXBzKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzSW5maW5pdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXQoJ3N0YXJ0JykgPCBiZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrTmVzdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ25lc3RlZFN0YXRlQ2hhbmdlJywgdGhpcyk7XHJcbiAgICB9LFxyXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0LCBlbmQ7XHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5zdGFydCkpe1xyXG4gICAgICAgICAgICBzdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwgJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKF8uaXNEYXRlKHJlc3BvbnNlLnN0YXJ0KSkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHJlc3BvbnNlLnN0YXJ0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcclxuICAgICAgICAgICAgZW5kID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2UuZW5kKSwgJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5lbmQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc0RhdGUocmVzcG9uc2UuZW5kKSkge1xyXG4gICAgICAgICAgICBlbmQgPSByZXNwb25zZS5lbmQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZW5kID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gc3RhcnQgPCBlbmQgPyBzdGFydCA6IGVuZDtcclxuICAgICAgICByZXNwb25zZS5lbmQgPSBzdGFydCA8IGVuZCA/IGVuZCA6IHN0YXJ0O1xyXG5cclxuICAgICAgICByZXNwb25zZS5wYXJlbnRpZCA9IHBhcnNlSW50KHJlc3BvbnNlLnBhcmVudGlkIHx8ICcwJywgMTApO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgbnVsbCBwYXJhbXNcclxuICAgICAgICBfLmVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSByZXNvdXJjZXMgYXMgbGlzdCBvZiBJRFxyXG4gICAgICAgIHZhciBpZHMgPSBbXTtcclxuICAgICAgICAocmVzcG9uc2UuUmVzb3VyY2VzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc0luZm8pIHtcclxuICAgICAgICAgICAgaWRzLnB1c2gocmVzSW5mby5SZXNJRCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzcG9uc2UuUmVzb3VyY2VzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJlc3BvbnNlLnJlc291cmNlcyA9IGlkcztcclxuICAgICAgICBpZiAocmVzcG9uc2UubWlsZXN0b25lKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gcmVzcG9uc2UuZW5kO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBkZXBzIGZvciBuZXcgQVBJIChhcnJheSBvZiBkZXBzKVxyXG4gICAgICAgIGlmIChfLmlzTnVtYmVyKHJlc3BvbnNlLmRlcGVuZCkpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2UuZGVwZW5kID0gW3Jlc3BvbnNlLmRlcGVuZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChfLmlzU3RyaW5nKHJlc3BvbnNlLmRlcGVuZCkpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2UuZGVwZW5kID0gXy5jb21wYWN0KHJlc3BvbnNlLmRlcGVuZC5zcGxpdCgnLCcpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfSxcclxuICAgIF9jaGVja1RpbWU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnc3RhcnQnKTtcclxuICAgICAgICB2YXIgZW5kVGltZSA9IHRoaXMuY2hpbGRyZW4uYXQoMCkuZ2V0KCdlbmQnKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhcnRUaW1lID0gY2hpbGQuZ2V0KCdzdGFydCcpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcclxuICAgICAgICAgICAgaWYoY2hpbGRTdGFydFRpbWUgPCBzdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IGNoaWxkU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZSA+IGVuZFRpbWUpe1xyXG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IGNoaWxkRW5kVGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xyXG4gICAgfSxcclxuICAgIF9jaGVja0NvbXBsZXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY29tcGxldGUgPSAwO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGUgKz0gY2hpbGQuZ2V0KCdjb21wbGV0ZScpIC8gbGVuZ3RoO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXQoJ2NvbXBsZXRlJywgTWF0aC5yb3VuZChjb21wbGV0ZSkpO1xyXG4gICAgfSxcclxuICAgIG1vdmVUb1N0YXJ0OiBmdW5jdGlvbihuZXdTdGFydCkge1xyXG4gICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgbmV3IHN0YXJ0IGlzIHRoZSBzYW1lIGFzIGN1cnJlbnRcclxuICAgICAgICBpZiAobmV3U3RhcnQudG9EYXRlU3RyaW5nKCkgPT09IHRoaXMuZ2V0KCdzdGFydCcpLnRvRGF0ZVN0cmluZygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBvZmZzZXRcclxuLy8gICAgICAgIHZhciBkYXlzRGlmZiA9IE1hdGguZmxvb3IoKG5ld1N0YXJ0LnRpbWUoKSAtIHRoaXMuZ2V0KCdzdGFydCcpLnRpbWUoKSkgLyAxMDAwIC8gNjAgLyA2MCAvIDI0KVxyXG4gICAgICAgIHZhciBkYXlzRGlmZiA9IERhdGUuZGF5c2RpZmYobmV3U3RhcnQsIHRoaXMuZ2V0KCdzdGFydCcpKSAtIDE7XHJcbiAgICAgICAgaWYgKG5ld1N0YXJ0IDwgdGhpcy5nZXQoJ3N0YXJ0JykpIHtcclxuICAgICAgICAgICAgZGF5c0RpZmYgKj0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGFuZ2UgZGF0ZXNcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBuZXdTdGFydC5jbG9uZSgpLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5c0RpZmYpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZXMgZGF0ZXMgaW4gYWxsIGNoaWxkcmVuXHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNoaWxkcmVuKGRheXNEaWZmKTtcclxuICAgICAgICB0aGlzLnVuZGVyTW92aW5nID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDaGlsZHJlbjogZnVuY3Rpb24oZGF5cykge1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5tb3ZlKGRheXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmVXaXRoQ2hpbGRyZW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2suc2F2ZVdpdGhDaGlsZHJlbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIG1vdmU6IGZ1bmN0aW9uKGRheXMpIHtcclxuICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMoZGF5cyksXHJcbiAgICAgICAgICAgIGVuZDogdGhpcy5nZXQoJ2VuZCcpLmNsb25lKCkuYWRkRGF5cyhkYXlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzKTtcclxuICAgIH0sXHJcbiAgICBnZXRPdXRsaW5lTGV2ZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsZXZlbCA9IDE7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xyXG4gICAgICAgIHdoaWxlKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZXZlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXZlbCsrO1xyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBnZXRPdXRsaW5lTnVtYmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBhcmVudC5jaGlsZHJlbi5tb2RlbHMuaW5kZXhPZih0aGlzKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldE91dGxpbmVOdW1iZXIoKSArICcuJyArIChpbmRleCArIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG51bWJlciA9IDE7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBtb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5hdChpKTtcclxuICAgICAgICAgICAgaWYgKG1vZGVsID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtYmVyO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFtb2RlbC5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIG51bWJlciArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGFza01vZGVsO1xyXG4iLCJ2YXIgbW9udGhzQ29kZT1bJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuXG5tb2R1bGUuZXhwb3J0cy5jb3JyZWN0ZGF0ZSA9IGZ1bmN0aW9uKHN0cikge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHN0cjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdGRhdGEgPSBmdW5jdGlvbih2YWwsIHR5cGUpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmICh0eXBlID09PSAnbScpIHtcblx0XHRyZXR1cm4gbW9udGhzQ29kZVt2YWxdO1xuXHR9XG5cdHJldHVybiB2YWw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5oZnVuYyA9IGZ1bmN0aW9uKHBvcykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHtcblx0XHR4OiBwb3MueCxcblx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdH07XG59O1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSB7XG5cdHZhciBwYXJhbXMgPSB7fTtcblx0dmFyIHBybWFyciA9IHBybXN0ci5zcGxpdCgnJicpO1xuXHR2YXIgaSwgdG1wYXJyO1xuXHRmb3IgKGkgPSAwOyBpIDwgcHJtYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0dG1wYXJyID0gcHJtYXJyW2ldLnNwbGl0KCc9Jyk7XG5cdFx0cGFyYW1zW3RtcGFyclswXV0gPSB0bXBhcnJbMV07XG5cdH1cblx0cmV0dXJuIHBhcmFtcztcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0VVJMUGFyYW1zID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cdHZhciBwcm1zdHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKTtcblx0cmV0dXJuIHBybXN0ciAhPT0gbnVsbCAmJiBwcm1zdHIgIT09ICcnID8gdHJhbnNmb3JtVG9Bc3NvY0FycmF5KHBybXN0cikgOiB7fTtcbn07XG5cbiIsInZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XHJcbnZhciB4bWwgPSBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy94bWxUZW1wbGF0ZS54bWwnLCAndXRmOCcpO1xyXG52YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKHhtbCk7XHJcbnZhciB4bWxUb0pTT04gPSB3aW5kb3cueG1sVG9KU09OO1xyXG5cclxuZnVuY3Rpb24gcGFyc2VYTUxPYmooeG1sU3RyaW5nKSB7XHJcbiAgICB2YXIgb2JqID0geG1sVG9KU09OLnBhcnNlU3RyaW5nKHhtbFN0cmluZyk7XHJcbiAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy8geG1sSXRlbS5OYW1lID0gW3tfdGV4dDogJ25vIG5hbWUgJyArIHhtbEl0ZW0uVUlEWzBdLl90ZXh0fV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNraXAgcm9vdCBwcm9qZWN0IHRhc2tcclxuICAgICAgICBpZiAoeG1sSXRlbS5PdXRsaW5lTnVtYmVyWzBdLl90ZXh0LnRvU3RyaW5nKCkgPT09ICcwJykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhc2tzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiB4bWxJdGVtLk5hbWVbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIHN0YXJ0OiB4bWxJdGVtLlN0YXJ0WzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBlbmQ6IHhtbEl0ZW0uRmluaXNoWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBjb21wbGV0ZTogeG1sSXRlbS5QZXJjZW50Q29tcGxldGVbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIG91dGxpbmU6IHhtbEl0ZW0uT3V0bGluZU51bWJlclswXS5fdGV4dC50b1N0cmluZygpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0YXNrcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMucGFyc2VEZXBzRnJvbVhNTCA9IGZ1bmN0aW9uKHhtbFN0cmluZykge1xyXG4gICAgdmFyIG9iaiA9IHhtbFRvSlNPTi5wYXJzZVN0cmluZyh4bWxTdHJpbmcpO1xyXG4gICAgdmFyIHVpZHMgPSB7fTtcclxuICAgIHZhciBvdXRsaW5lcyA9IHt9O1xyXG4gICAgdmFyIGRlcHMgPSBbXTtcclxuICAgIHZhciBwYXJlbnRzID0gW107XHJcbiAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy8geG1sSXRlbS5OYW1lID0gW3tfdGV4dDogJ25vIG5hbWUgJyArIHhtbEl0ZW0uVUlEWzBdLl90ZXh0fV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICBuYW1lOiB4bWxJdGVtLk5hbWVbMF0uX3RleHQudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgb3V0bGluZTogeG1sSXRlbS5PdXRsaW5lTnVtYmVyWzBdLl90ZXh0LnRvU3RyaW5nKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHVpZHNbeG1sSXRlbS5VSURbMF0uX3RleHRdID0gaXRlbTtcclxuICAgICAgICBvdXRsaW5lc1tpdGVtLm91dGxpbmVdID0gaXRlbTtcclxuICAgIH0pO1xyXG4gICAgXy5lYWNoKG9iai5Qcm9qZWN0WzBdLlRhc2tzWzBdLlRhc2ssIGZ1bmN0aW9uKHhtbEl0ZW0pIHtcclxuICAgICAgICBpZiAoIXhtbEl0ZW0uTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXNrID0gdWlkc1t4bWxJdGVtLlVJRFswXS5fdGV4dF07XHJcbiAgICAgICAgLy8gdmFyIG5hbWUgPSB4bWxJdGVtLk5hbWVbMF0uX3RleHQ7XHJcbiAgICAgICAgdmFyIG91dGxpbmUgPSB0YXNrLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICh4bWxJdGVtLlByZWRlY2Vzc29yTGluaykge1xyXG4gICAgICAgICAgICB4bWxJdGVtLlByZWRlY2Vzc29yTGluay5mb3JFYWNoKChsaW5rKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmVmb3JlVUlEID0gbGluay5QcmVkZWNlc3NvclVJRFswXS5fdGV4dDtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmUgPSB1aWRzW2JlZm9yZVVJRF07XHJcblxyXG4gICAgICAgICAgICAgICAgZGVwcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBiZWZvcmU6IGJlZm9yZSxcclxuICAgICAgICAgICAgICAgICAgICBhZnRlcjogdGFza1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmVudE91dGxpbmUgPSBvdXRsaW5lLnNsaWNlKDAsIG91dGxpbmUubGFzdEluZGV4T2YoJy4nKSk7XHJcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSBvdXRsaW5lc1twYXJlbnRPdXRsaW5lXTtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2NhbiBub3QgZmluZCBwYXJlbnQnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyZW50cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudDogcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgY2hpbGQ6IHRhc2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRlcHM6IGRlcHMsXHJcbiAgICAgICAgcGFyZW50czogcGFyZW50c1xyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnBhcnNlWE1MT2JqID0gcGFyc2VYTUxPYmo7XHJcblxyXG5mdW5jdGlvbiBjdXQoZGF0ZSkge1xyXG4gICAgbGV0IGZvcm1hdGVkID0gZGF0ZS50b0lTT1N0cmluZygpO1xyXG4gICAgcmV0dXJuIGZvcm1hdGVkLnNsaWNlKDAsIGZvcm1hdGVkLmluZGV4T2YoJy4nKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLnRhc2tzVG9YTUwgPSBmdW5jdGlvbih0YXNrcykge1xyXG4gICAgdmFyIHN0YXJ0ID0gdGFza3MuYXQoMCkuZ2V0KCdzdGFydCcpO1xyXG4gICAgdmFyIGVuZCA9IHRhc2tzLmF0KDApLmdldCgnZW5kJyk7XHJcbiAgICB2YXIgZGF0YSA9IHRhc2tzLm1hcChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID4gdGFzay5nZXQoJ3N0YXJ0JykpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0YXNrLmdldCgnc3RhcnQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVuZCA8IHRhc2suZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICBlbmQgPSB0YXNrLmdldCgnZW5kJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkZXBlbmQgPSBfLm1hcCh0YXNrLmdldCgnZGVwZW5kJyksIChpZCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGFza3MuZ2V0KGlkKS5nZXQoJ3NvcnRpbmRleCcpICsgMTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWQ6IHRhc2suZ2V0KCdzb3J0aW5kZXgnKSArIDEsXHJcbiAgICAgICAgICAgIG5hbWU6IHRhc2suZ2V0KCduYW1lJyksXHJcbiAgICAgICAgICAgIG91dGxpbmVOdW1iZXI6IHRhc2suZ2V0T3V0bGluZU51bWJlcigpLFxyXG4gICAgICAgICAgICBvdXRsaW5lTGV2ZWw6IHRhc2suZ2V0T3V0bGluZUxldmVsKCksXHJcbiAgICAgICAgICAgIHN0YXJ0OiBjdXQodGFzay5nZXQoJ3N0YXJ0JykpLFxyXG4gICAgICAgICAgICBmaW5pc2g6IGN1dCh0YXNrLmdldCgnZW5kJykpLFxyXG4gICAgICAgICAgICBkZXBlbmQ6IGRlcGVuZFswXVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb21waWxlZCh7XHJcbiAgICAgICAgdGFza3M6IGRhdGEsXHJcbiAgICAgICAgY3VycmVudERhdGU6IGN1dChuZXcgRGF0ZSgpKSxcclxuICAgICAgICBzdGFydERhdGU6IGN1dChzdGFydCksXHJcbiAgICAgICAgZmluaXNoRGF0ZTogY3V0KGVuZClcclxuICAgIH0pO1xyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxudmFyIENvbW1lbnRzVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyN0YXNrQ29tbWVudHNNb2RhbCcsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9maWxsRGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBvcGVuIG1vZGFsXHJcbiAgICAgICAgdGhpcy4kZWwubW9kYWwoe1xyXG4gICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25BcHByb3ZlJyk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25IaWRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25IaWRlJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRGVueSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29uRGVueScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuXHJcbiAgICAgICAgdmFyIHVwZGF0ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBjb3VudCA9ICQoXCIjdGFza0NvbW1lbnRzXCIpLmNvbW1lbnRzKFwiY291bnRcIik7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0KCdDb21tZW50cycsIGNvdW50KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0ge1xyXG4gICAgICAgICAgICBhZnRlckRlbGV0ZSA6IHVwZGF0ZUNvdW50LFxyXG4gICAgICAgICAgICBhZnRlckNvbW1lbnRBZGQgOiB1cGRhdGVDb3VudFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCdsb2NhbGhvc3QnKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gaW5pdCBjb21tZW50c1xyXG4gICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5jb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICBnZXRDb21tZW50c1VybDogXCIvYXBpL2NvbW1lbnQvXCIgKyB0aGlzLm1vZGVsLmlkICsgXCIvXCIgKyBwYXJhbXMuc2l0ZWtleSArIFwiL1dCUy8wMDBcIixcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQgKyBcIi9cIiArIHBhcmFtcy5zaXRla2V5ICsgXCIvV0JTL1wiICsgcGFyYW1zLnByb2plY3QsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJChcIiN0YXNrQ29tbWVudHNcIikuY29tbWVudHMoe1xyXG4gICAgICAgICAgICAgICAgZ2V0Q29tbWVudHNVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIHBvc3RDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVDb21tZW50VXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5QXZhdGFyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIDogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9maWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1lbnRzVmlldztcclxuIiwidmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBTaWRlUGFuZWwgPSByZXF1aXJlKCcuL3NpZGVCYXIvU2lkZVBhbmVsJyk7XHJcclxydmFyIEdhbnR0Q2hhcnRWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXNDaGFydC9HYW50dENoYXJ0VmlldycpO1xydmFyIFRvcE1lbnVWaWV3ID0gcmVxdWlyZSgnLi9Ub3BNZW51Vmlldy9Ub3BNZW51VmlldycpO1xyXHJ2YXIgTm90aWZpY2F0aW9ucyA9IHJlcXVpcmUoJy4vTm90aWZpY2F0aW9ucycpO1xyXHJccnZhciBHYW50dFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHIgICAgZWw6ICcuR2FudHQnLFxyICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyXHIgICAgICAgIG5ldyBDb250ZXh0TWVudVZpZXcoe1xyICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcciAgICAgICAgfSkucmVuZGVyKCk7XHJcciAgICAgICAgLy8gbmV3IHRhc2sgYnV0dG9uXHIgICAgICAgICQoJy5uZXctdGFzaycpLmNsaWNrKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdmFyIGxhc3RUYXNrID0gcGFyYW1zLmNvbGxlY3Rpb24ubGFzdCgpO1xyICAgICAgICAgICAgdmFyIGxhc3RJbmRleCA9IC0xO1xyICAgICAgICAgICAgaWYgKGxhc3RUYXNrKSB7XHIgICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gbGFzdFRhc2suZ2V0KCdzb3J0aW5kZXgnKTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIHBhcmFtcy5jb2xsZWN0aW9uLmFkZCh7XHIgICAgICAgICAgICAgICAgbmFtZTogJ05ldyB0YXNrJyxcciAgICAgICAgICAgICAgICBzb3J0aW5kZXg6IGxhc3RJbmRleCArIDFcciAgICAgICAgICAgIH0pO1xyICAgICAgICB9KTtcclxyICAgICAgICBuZXcgTm90aWZpY2F0aW9ucyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb25cciAgICAgICAgfSk7XHJcclxyXHJcciAgICAgICAgbmV3IFRvcE1lbnVWaWV3KHtcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxyICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uXHIgICAgICAgIH0pLnJlbmRlcigpO1xyXHIgICAgICAgIHRoaXMuY2FudmFzVmlldyA9IG5ldyBHYW50dENoYXJ0Vmlldyh7XHIgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyICAgICAgICB9KTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnJlbmRlcigpO1xyICAgICAgICB0aGlzLl9tb3ZlQ2FudmFzVmlldygpO1xyICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jYW52YXNWaWV3Ll91cGRhdGVTdGFnZUF0dHJzKCk7XHIgICAgICAgICAgICAvLyBzZXQgc2lkZSB0YXNrcyBwYW5lbCBoZWlnaHRcciAgICAgICAgICAgIHZhciAkc2lkZVBhbmVsID0gJCgnLm1lbnUtY29udGFpbmVyJyk7XHIgICAgICAgICAgICAkc2lkZVBhbmVsLmNzcyh7XHIgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiB3aW5kb3cuaW5uZXJIZWlnaHQgLSAkc2lkZVBhbmVsLm9mZnNldCgpLnRvcFxyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNTAwKTtcclxyXHIgICAgICAgIHZhciB0YXNrc0NvbnRhaW5lciA9ICQoJy50YXNrcycpLmdldCgwKTtcciAgICAgICAgUmVhY3QucmVuZGVyKFxyICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KClcciAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgdGFza3NDb250YWluZXJcciAgICAgICAgKTtcclxyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ3NvcnQnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0YXNrc0NvbnRhaW5lcik7XHIgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTaWRlUGFuZWwsIHtcciAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxyICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyICAgICAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgICAgIHRhc2tzQ29udGFpbmVyXHIgICAgICAgICAgICApO1xyICAgICAgICB9LmJpbmQodGhpcyksNSkpO1xyXHIgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB7XHIgICAgICAgICAgICB2YXIgeSA9IE1hdGgubWF4KDAsIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IHdpbmRvdy5zY3JvbGxZKTtcciAgICAgICAgICAgICQoJy5tZW51LWhlYWRlcicpLmNzcyh7XHIgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAoeSkgKyAncHgnXHIgICAgICAgICAgICB9KTtcciAgICAgICAgICAgICQoJy50YXNrcycpLmNzcyh7XHIgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnLScgKyB5ICsgJ3B4J1xyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgZXZlbnRzOiB7XHIgICAgICAgICdjbGljayAjdEhhbmRsZSc6ICdleHBhbmQnLFxyICAgICAgICAnY2xpY2sgI2RlbGV0ZUFsbCc6ICdkZWxldGVBbGwnXHIgICAgfSxcciAgICBjYWxjdWxhdGVEdXJhdGlvbjogZnVuY3Rpb24oKXtcclxyICAgICAgICAvLyBDYWxjdWxhdGluZyB0aGUgZHVyYXRpb24gZnJvbSBzdGFydCBhbmQgZW5kIGRhdGVcciAgICAgICAgdmFyIHN0YXJ0ZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJzdGFydFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyICAgICAgICBpZihzdGFydGRhdGUgIT09IFwiXCIgJiYgZW5kZGF0ZSAhPT0gXCJcIil7XHIgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcciAgICAgICAgfWVsc2V7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigwKSk7XHIgICAgICAgIH1cciAgICB9LFxyICAgIGV4cGFuZDogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciBidXR0b24gPSAkKGV2dC50YXJnZXQpO1xyICAgICAgICBpZiAoYnV0dG9uLmhhc0NsYXNzKCdjb250cmFjdCcpKSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgIH1cciAgICAgICAgZWxzZSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgIH1cciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNjAwKTtcciAgICAgICAgYnV0dG9uLnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgIH0sXHIgICAgX21vdmVDYW52YXNWaWV3OiBmdW5jdGlvbigpIHtcciAgICAgICAgdmFyIHNpZGVCYXJXaWR0aCA9ICQoJy5tZW51LWNvbnRhaW5lcicpLndpZHRoKCk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5zZXRMZWZ0UGFkZGluZyhzaWRlQmFyV2lkdGgpO1xyICAgIH0sXHIgICAgZGVsZXRlQWxsOiBmdW5jdGlvbigpIHtcciAgICAgICAgJCgnI2NvbmZpcm0nKS5tb2RhbCh7XHIgICAgICAgICAgICBvbkhpZGRlbjogZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcciAgICAgICAgICAgIH0sXHIgICAgICAgICAgICBvbkFwcHJvdmU6IGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgICAgIHdoaWxlKHRoaXMuY29sbGVjdGlvbi5hdCgwKSkge1xyICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYXQoMCkuZGVzdHJveSgpO1xyICAgICAgICAgICAgICAgIH1cciAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IEdhbnR0VmlldztcciIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBNb2RhbFRhc2tFZGl0Q29tcG9uZW50ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2VkaXRUYXNrJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy51aS5jaGVja2JveCcpLmNoZWNrYm94KCk7XHJcbiAgICAgICAgLy8gc2V0dXAgdmFsdWVzIGZvciBzZWxlY3RvcnNcclxuICAgICAgICB0aGlzLl9wcmVwYXJlU2VsZWN0cygpO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCcudGFidWxhci5tZW51IC5pdGVtJykudGFiKCk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXJ0XCJdLCBbbmFtZT1cImVuZFwiXScpLmRhdGVwaWNrZXIoe1xyXG4vLyAgICAgICAgICAgIGRhdGVGb3JtYXQ6IFwiZGQvbW0veXlcIlxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5zZXR0aW5ncy5nZXREYXRlRm9ybWF0KClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZmlsbERhdGEoKTtcclxuXHJcbiAgICAgICAgLy8gb3BlbiBtb2RhbFxyXG4gICAgICAgIHRoaXMuJGVsLm1vZGFsKHtcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuSW5wdXRzKCk7XHJcblxyXG4gICAgfSxcclxuICAgIF9saXN0ZW5JbnB1dHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgJG1pbGVzdG9uZSA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwibWlsZXN0b25lXCJdJyk7XHJcbiAgICAgICAgdmFyICRkZWxpdmVyYWJsZSA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiZGVsaXZlcmFibGVcIl0nKTtcclxuICAgICAgICB2YXIgJHN0YXJ0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGFydFwiXScpO1xyXG4gICAgICAgIHZhciAkZW5kID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCJlbmRcIl0nKTtcclxuICAgICAgICAkbWlsZXN0b25lLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9ICRtaWxlc3RvbmUucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhcnQudmFsKCRlbmQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgJGRlbGl2ZXJhYmxlLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkZGVsaXZlcmFibGUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoJGRlbGl2ZXJhYmxlLnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgJG1pbGVzdG9uZS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3ByZXBhcmVTZWxlY3RzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YXR1c1NlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhdHVzXCJdJyk7XHJcbiAgICAgICAgc3RhdHVzU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIGhlYWx0aFNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiaGVhbHRoXCJdJyk7XHJcbiAgICAgICAgaGVhbHRoU2VsZWN0LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihpLCBjaGlsZCkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChjaGlsZC50ZXh0KTtcclxuICAgICAgICAgICAgJChjaGlsZCkucHJvcCgndmFsdWUnLCBpZCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIHdvcmtPcmRlclNlbGVjdCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwid29cIl0nKTtcclxuICAgICAgICB3b3JrT3JkZXJTZWxlY3QuZW1wdHkoKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhLmZvckVhY2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAkKCc8b3B0aW9uIHZhbHVlPVwiJyArIGRhdGEuSUQgKyAnXCI+JyArIGRhdGEuV09OdW1iZXIgKyAnPC9vcHRpb24+JykuYXBwZW5kVG8od29ya09yZGVyU2VsZWN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfZmlsbERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhdHVzJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRTdGF0dXNJZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdoZWFsdGgnICYmICghdmFsIHx8ICF0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhGb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdEhlYWx0aElkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3dvJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kV09Gb3JJZCh2YWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFdPSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZVN0ciA9ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpLCB2YWwpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZ2V0KDApLnZhbHVlID0gZGF0ZVN0cjtcclxuICAgICAgICAgICAgICAgIGlucHV0LmRhdGVwaWNrZXIoIFwicmVmcmVzaFwiICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKCdjaGVja2VkJywgdmFsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlucHV0LnZhbCh2YWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwibWlsZXN0b25lXCJdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9zYXZlRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiJyArIGtleSArICdcIl0nKTtcclxuICAgICAgICAgICAgaWYgKCFpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnc3RhcnQnIHx8IGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gaW5wdXQudmFsKCkuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBEYXRlKGRhdGVbMl0gKyAnLScgKyBkYXRlWzFdICsgJy0nICsgZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIG5ldyBEYXRlKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQucHJvcCgndHlwZScpID09PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnByb3AoJ2NoZWNrZWQnKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNldChrZXksIGlucHV0LnZhbCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2F2ZSgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kYWxUYXNrRWRpdENvbXBvbmVudDtcclxuIiwidmFyIE5vdGlmaWNhdGlvbnMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdlcnJvcicsIF8uZGVib3VuY2UodGhpcy5vbkVycm9yLCAxMCkpO1xyXG4gICAgfSxcclxuICAgIG9uRXJyb3IgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgbm90eSh7XHJcbiAgICAgICAgICAgIHRleHQ6ICdFcnJvciB3aGlsZSBzYXZpbmcgdGFzaywgcGxlYXNlIHJlZnJlc2ggeW91ciBicm93c2VyLCByZXF1ZXN0IHN1cHBvcnQgaWYgdGhpcyBlcnJvciBjb250aW51ZXMuJyxcclxuICAgICAgICAgICAgbGF5b3V0IDogJ3RvcFJpZ2h0JyxcclxuICAgICAgICAgICAgdHlwZSA6ICdlcnJvcidcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbnM7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuXHJcbnZhciBSZXNvdXJjZUVkaXRvclZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICB2YXIgc3RhZ2VQb3MgPSAkKCcjZ2FudHQtY29udGFpbmVyJykub2Zmc2V0KCk7XHJcbiAgICAgICAgdmFyIGZha2VFbCA9ICQoJzxkaXY+JykuYXBwZW5kVG8oJ2JvZHknKTtcclxuICAgICAgICBmYWtlRWwuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICB0b3AgOiBwb3MueSArIHN0YWdlUG9zLnRvcCArICdweCcsXHJcbiAgICAgICAgICAgIGxlZnQgOiBwb3MueCArIHN0YWdlUG9zLmxlZnQgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucG9wdXAgPSAkKCcuY3VzdG9tLnBvcHVwJyk7XHJcbiAgICAgICAgZmFrZUVsLnBvcHVwKHtcclxuICAgICAgICAgICAgcG9wdXAgOiB0aGlzLnBvcHVwLFxyXG4gICAgICAgICAgICBvbiA6ICdob3ZlcicsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2JvdHRvbSBsZWZ0JyxcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVwLm9mZignLmVkaXRvcicpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KS5wb3B1cCgnc2hvdycpO1xyXG5cclxuICAgICAgICB0aGlzLl9hZGRSZXNvdXJjZXMoKTtcclxuICAgICAgICB0aGlzLnBvcHVwLmZpbmQoJy5idXR0b24nKS5vbignY2xpY2suZWRpdG9yJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAucG9wdXAoJ2hpZGUnKTtcclxuICAgICAgICAgICAgdGhpcy5fc2F2ZURhdGEoKTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1cC5vZmYoJy5lZGl0b3InKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLl9mdWxsRGF0YSgpO1xyXG4gICAgfSxcclxuICAgIF9hZGRSZXNvdXJjZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnBvcHVwLmVtcHR5KCk7XHJcbiAgICAgICAgdmFyIGh0bWxTdHJpbmcgPSAnJztcclxuICAgICAgICAodGhpcy5zZXR0aW5ncy5zdGF0dXNlcy5yZXNvdXJjZWRhdGEgfHwgW10pLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgaHRtbFN0cmluZyArPSAnPGRpdiBjbGFzcz1cInVpIGNoZWNrYm94XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAgbmFtZT1cIicgKyByZXNvdXJjZS5Vc2VySWQgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxsYWJlbD4nICsgcmVzb3VyY2UuVXNlcm5hbWUgKyAnPC9sYWJlbD4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj48YnI+JztcclxuICAgICAgICB9KTtcclxuICAgICAgICBodG1sU3RyaW5nICs9Jzxicj48ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PGRpdiBjbGFzcz1cInVpIHBvc2l0aXZlIHJpZ2h0IGJ1dHRvbiBzYXZlIHRpbnlcIj4nICtcclxuICAgICAgICAgICAgICAgICdDbG9zZScgK1xyXG4gICAgICAgICAgICAnPC9kaXY+PC9kaXY+JztcclxuICAgICAgICB0aGlzLnBvcHVwLmFwcGVuZChodG1sU3RyaW5nKTtcclxuICAgICAgICB0aGlzLnBvcHVwLmZpbmQoJy51aS5jaGVja2JveCcpLmNoZWNrYm94KCk7XHJcbiAgICB9LFxyXG4gICAgX2Z1bGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHBvcHVwID0gdGhpcy5wb3B1cDtcclxuICAgICAgICB0aGlzLm1vZGVsLmdldCgncmVzb3VyY2VzJykuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBwb3B1cC5maW5kKCdbbmFtZT1cIicgKyByZXNvdXJjZSArICdcIl0nKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3NhdmVEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHJlc291cmNlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucG9wdXAuZmluZCgnaW5wdXQnKS5lYWNoKGZ1bmN0aW9uKGksIGlucHV0KSB7XHJcbiAgICAgICAgICAgIHZhciAkaW5wdXQgPSAkKGlucHV0KTtcclxuICAgICAgICAgICAgaWYgKCRpbnB1dC5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc291cmNlcy5wdXNoKCRpbnB1dC5hdHRyKCduYW1lJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLm1vZGVsLnNldCgncmVzb3VyY2VzJywgcmVzb3VyY2VzKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc291cmNlRWRpdG9yVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRmlsdGVyVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNmaWx0ZXItbWVudScsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiB7XHJcbiAgICAgICAgJ2NoYW5nZSAjaGlnaHRsaWdodHMtc2VsZWN0JyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGhpZ2h0bGlnaHRUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2h0bGlnaHRUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHRoaXMuY29sb3JzW2UudGFyZ2V0LnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdoaWdodGxpZ2h0JywgdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2hhbmdlICNmaWx0ZXJzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBjcml0ZXJpYSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoY3JpdGVyaWEgPT09ICdyZXNldCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNob3dUYXNrcyA9IHRoaXMuX2dldE1vZGVsc0ZvckNyaXRlcmlhKGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd1Rhc2tzLmluZGV4T2YodGFzaykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2hvdyBhbGwgcGFyZW50c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGFzay5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb2xvcnMgOiB7XHJcbiAgICAgICAgJ3N0YXR1cy1iYWNrbG9nJyA6ICcjRDJEMkQ5JyxcclxuICAgICAgICAnc3RhdHVzLXJlYWR5JyA6ICcjQjJEMUYwJyxcclxuICAgICAgICAnc3RhdHVzLWluIHByb2dyZXNzJyA6ICcjNjZBM0UwJyxcclxuICAgICAgICAnc3RhdHVzLWNvbXBsZXRlJyA6ICcjOTlDMjk5JyxcclxuICAgICAgICAnbGF0ZScgOiAnI0ZGQjJCMicsXHJcbiAgICAgICAgJ2R1ZScgOiAnICNGRkMyOTknLFxyXG4gICAgICAgICdtaWxlc3RvbmUnIDogJyNENkMyRkYnLFxyXG4gICAgICAgICdkZWxpdmVyYWJsZScgOiAnI0UwRDFDMicsXHJcbiAgICAgICAgJ2ZpbmFuY2lhbCcgOiAnI0YwRTBCMicsXHJcbiAgICAgICAgJ3RpbWVzaGVldHMnIDogJyNDMkMyQjInLFxyXG4gICAgICAgICdyZXBvcnRhYmxlJyA6ICcgI0UwQzJDMicsXHJcbiAgICAgICAgJ2hlYWx0aC1yZWQnIDogJ3JlZCcsXHJcbiAgICAgICAgJ2hlYWx0aC1hbWJlcicgOiAnI0ZGQkYwMCcsXHJcbiAgICAgICAgJ2hlYWx0aC1ncmVlbicgOiAnZ3JlZW4nXHJcbiAgICB9LFxyXG4gICAgX2dldE1vZGVsc0ZvckNyaXRlcmlhIDogZnVuY3Rpb24oY3JldGVyaWEpIHtcclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdyZXNldHMnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ3N0YXR1cycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICh0aGlzLnNldHRpbmdzLmZpbmRTdGF0dXNJZChzdGF0dXMpIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ3N0YXR1cycpLnRvU3RyaW5nKCkgPT09IGlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnbGF0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEgPT09ICdkdWUnKSB7XHJcbiAgICAgICAgICAgIHZhciBsYXN0RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIGxhc3REYXRlLmFkZFdlZWtzKDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2VuZCcpID4gbmV3IERhdGUoKSAmJiB0YXNrLmdldCgnZW5kJykgPCBsYXN0RGF0ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChbJ21pbGVzdG9uZScsICdkZWxpdmVyYWJsZScsICdmaW5hbmNpYWwnLCAndGltZXNoZWV0cycsICdyZXBvcnRhYmxlJ10uaW5kZXhPZihjcmV0ZXJpYSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldChjcmV0ZXJpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3JldGVyaWEuaW5kZXhPZignaGVhbHRoJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGggPSBjcmV0ZXJpYS5zbGljZShjcmV0ZXJpYS5pbmRleE9mKCctJykgKyAxKTtcclxuICAgICAgICAgICAgdmFyIGhlYWx0aElkID0gKHRoaXMuc2V0dGluZ3MuZmluZEhlYWx0aElkKGhlYWx0aCkgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnaGVhbHRoJykudG9TdHJpbmcoKSA9PT0gaGVhbHRoSWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBHcm91cGluZ01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI2dyb3VwaW5nLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjdG9wLWV4cGFuZC1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICdjbGljayAjdG9wLWNvbGxhcHNlLWFsbCcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2V0KCdjb2xsYXBzZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JvdXBpbmdNZW51VmlldztcclxuIiwidmFyIHBhcnNlWE1MID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMveG1sV29ya2VyJykucGFyc2VYTUxPYmo7XHJcbnZhciB0YXNrc1RvWE1MID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMveG1sV29ya2VyJykudGFza3NUb1hNTDtcclxudmFyIHBhcnNlRGVwc0Zyb21YTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZURlcHNGcm9tWE1MO1xyXG5cclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjcHJvamVjdC1tZW51JyxcclxuXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuaW1wb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fc2V0dXBJbnB1dCgpO1xyXG4gICAgfSxcclxuICAgIF9zZXR1cElucHV0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW5wdXQgPSAkKCcjaW1wb3J0RmlsZScpO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGV2dC50YXJnZXQuZmlsZXM7XHJcbiAgICAgICAgICAgIF8uZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gZmlsZS5uYW1lLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZXh0ZW50aW9uID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlbnRpb24gIT09ICd4bWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ1RoZSBmaWxlIHR5cGUgXCInICsgZXh0ZW50aW9uICsgJ1wiIGlzIG5vdCBzdXBwb3J0ZWQuIE9ubHkgeG1sIGZpbGVzIGFyZSBhbGxvd2VkLiBQbGVhc2Ugc2F2ZSB5b3VyIE1TIHByb2plY3QgYXMgYSB4bWwgZmlsZSBhbmQgdHJ5IGFnYWluLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnhtbERhdGEgPSBlLnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnRXJyb3Igd2hpbGUgcGFyaW5nIGZpbGUuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgICAnY2xpY2sgI3VwbG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjbXNpbXBvcnQnKS5tb2RhbCh7XHJcbiAgICAgICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnhtbERhdGEgfHwgdGhpcy5pbXBvcnRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltcG9ydGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRQcm9ncmVzc1wiKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRGaWxlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN4bWxpbnB1dC1mb3JtJykudHJpZ2dlcigncmVzZXQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuaW1wb3J0RGF0YS5iaW5kKHRoaXMpLCAyMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICQoXCIjaW1wb3J0UHJvZ3Jlc3NcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2ltcG9ydEZpbGVcIikuc2hvdygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICNkb3dubG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRhc2tzVG9YTUwodGhpcy5jb2xsZWN0aW9uKTtcclxuICAgICAgICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbZGF0YV0sIHt0eXBlIDogJ2FwcGxpY2F0aW9uL2pzb24nfSk7XHJcbiAgICAgICAgICAgIHNhdmVBcyhibG9iLCAnR2FudHRUYXNrcy54bWwnKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcHJvZ3Jlc3MgOiBmdW5jdGlvbihwZXJjZW50KSB7XHJcbiAgICAgICAgJCgnI2ltcG9ydFByb2dyZXNzJykucHJvZ3Jlc3Moe1xyXG4gICAgICAgICAgICBwZXJjZW50IDogcGVyY2VudFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlRGF0YSA6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB2YXIgZGVmU3RhdHVzID0gdGhpcy5zZXR0aW5ncy5maW5kRGVmYXVsdFN0YXR1c0lkKCk7XHJcbiAgICAgICAgdmFyIGRlZkhlYWx0aCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRIZWFsdGhJZCgpO1xyXG4gICAgICAgIHZhciBkZWZXTyA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRXT0lkKCk7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5oZWFsdGggPSBkZWZIZWFsdGg7XHJcbiAgICAgICAgICAgIGl0ZW0uc3RhdHVzID0gZGVmU3RhdHVzO1xyXG4gICAgICAgICAgICBpdGVtLndvID0gZGVmV087XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9LFxyXG4gICAgaW1wb3J0RGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBkZWxheSA9IDEwMDtcclxuICAgICAgICB0aGlzLnByb2dyZXNzKDApO1xyXG4gICAgICAgIC8vIHRoaXMgaXMgc29tZSBzb3J0IG9mIGNhbGxiYWNrIGhlbGwhIVxyXG4gICAgICAgIC8vIHdlIG5lZWQgdGltZW91dHMgZm9yIGJldHRlciB1c2VyIGV4cGVyaWVuY2VcclxuICAgICAgICAvLyBJIHRoaW5rIHVzZXIgd2FudCB0byBzZWUgYW5pbWF0ZWQgcHJvZ3Jlc3MgYmFyXHJcbiAgICAgICAgLy8gYnV0IHdpdGhvdXQgdGltZW91dHMgaXQgaXMgbm90IHBvc3NpYmxlLCByaWdodD9cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzKDEwKTtcclxuICAgICAgICAgICAgdmFyIGNvbCA9IHRoaXMuY29sbGVjdGlvbjtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBwYXJzZVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fcHJlcGFyZURhdGEoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygyNik7XHJcbiAgICAgICAgICAgICAgICBjb2wuaW1wb3J0VGFza3MoZGF0YSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg0Myk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg1OSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZXBzID0gcGFyc2VEZXBzRnJvbVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg3OCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wuY3JlYXRlRGVwcyhkZXBzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygxMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1wb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI21zaW1wb3J0JykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZGVsYXkpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIGRlbGF5KTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1TUHJvamVjdE1lbnVWaWV3O1xyXG4iLCJ2YXIgUmVwb3J0c01lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWw6ICcjcmVwb3J0cy1tZW51JyxcclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzOiB7XHJcbiAgICAgICAgJ2NsaWNrICNwcmludCc6ICdnZW5lcmF0ZVBERicsXHJcbiAgICAgICAgJ2NsaWNrICNzaG93VmlkZW8nOiAnc2hvd0hlbHAnXHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVQREY6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSxcclxuICAgIHNob3dIZWxwOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjc2hvd1ZpZGVvTW9kYWwnKS5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkubW9kYWwoJ3Nob3cnKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9ydHNNZW51VmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBab29tTWVudVZpZXcgPSByZXF1aXJlKCcuL1pvb21NZW51VmlldycpO1xyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IHJlcXVpcmUoJy4vR3JvdXBpbmdNZW51VmlldycpO1xyXG52YXIgRmlsdGVyTWVudVZpZXcgPSByZXF1aXJlKCcuL0ZpbHRlck1lbnVWaWV3Jyk7XHJcbnZhciBNU1Byb2plY3RNZW51VmlldyA9IHJlcXVpcmUoJy4vTVNQcm9qZWN0TWVudVZpZXcnKTtcclxudmFyIE1pc2NNZW51VmlldyA9IHJlcXVpcmUoJy4vTWlzY01lbnVWaWV3Jyk7XHJcblxyXG52YXIgVG9wTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgbmV3IFpvb21NZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBHcm91cGluZ01lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IEZpbHRlck1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IE1TUHJvamVjdE1lbnVWaWV3KHBhcmFtcykucmVuZGVyKCk7XHJcbiAgICAgICAgbmV3IE1pc2NNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVG9wTWVudVZpZXc7XHJcbiIsInZhciBab29tTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbDogJyN6b29tLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl9oaWdodGxpZ2h0U2VsZWN0ZWQoKTtcclxuICAgIH0sXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgICAnY2xpY2sgLmFjdGlvbic6ICdvbkludGVydmFsQnV0dG9uQ2xpY2tlZCdcclxuICAgIH0sXHJcbiAgICBvbkludGVydmFsQnV0dG9uQ2xpY2tlZDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IGJ1dHRvbi5kYXRhKCdpbnRlcnZhbCcpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KCdpbnRlcnZhbCcsIGludGVydmFsKTtcclxuICAgICAgICB0aGlzLl9oaWdodGxpZ2h0U2VsZWN0ZWQoKTtcclxuICAgIH0sXHJcbiAgICBfaGlnaHRsaWdodFNlbGVjdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLiQoJy5hY3Rpb24nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHJcbiAgICAgICAgbGV0IGludGVydmFsID0gdGhpcy5zZXR0aW5ncy5nZXQoJ2ludGVydmFsJyk7XHJcbiAgICAgICAgdGhpcy4kKCdbZGF0YS1pbnRlcnZhbD1cIicgKyBpbnRlcnZhbCArICdcIl0nKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFpvb21NZW51VmlldztcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgQWxvbmVUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9ib3JkZXJXaWR0aCA6IDMsXHJcbiAgICBfY29sb3IgOiAnI0U2RjBGRicsXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gXy5leHRlbmQoQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZXZlbnRzKCksIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5sZWZ0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAucmlnaHRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5sZWZ0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAucmlnaHRCb3JkZXInIDogJ3JlbmRlcicsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5sZWZ0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAubGVmdEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZScsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5yaWdodEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLnJpZ2h0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWluKGxvY2FsWCwgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1heChsb2NhbFgsIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfcmVzaXplUG9pbnRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2V3LXJlc2l6ZSc7XHJcbiAgICB9LFxyXG4gICAgX2NoYW5nZVNpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGVmdFggPSB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpO1xyXG4gICAgICAgIHZhciByaWdodFggPSB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSArIHRoaXMuX2JvcmRlcldpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC53aWR0aChyaWdodFggLSBsZWZ0WCk7XHJcbiAgICAgICAgcmVjdC54KGxlZnRYKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNvbXBsZXRlIHBhcmFtc1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXTtcclxuICAgICAgICBjb21wbGV0ZVJlY3QueChsZWZ0WCk7XHJcbiAgICAgICAgY29tcGxldGVSZWN0LndpZHRoKHRoaXMuX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGgoKSk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngocmlnaHRYKTtcclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VzLngocmlnaHRYICsgdGhpcy5fdG9vbGJhck9mZnNldCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxIC0gdGhpcy5fYm9yZGVyV2lkdGgpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnbWlsZXN0b25lJykpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuZGlhbW9uZCcpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKS5oaWRlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuZGlhbW9uZCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKS5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxvbmVUYXNrVmlldztcclxuIiwiXHJcbnZhciBSZXNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4uL1Jlc291cmNlc0VkaXRvcicpO1xyXG5cclxudmFyIGxpbmtJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5saW5rSW1hZ2Uuc3JjID0gJ2Nzcy9pbWFnZXMvbGluay5wbmcnO1xyXG5cclxudmFyIHVzZXJJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG51c2VySW1hZ2Uuc3JjID0gJ2Nzcy9pbWFnZXMvdXNlci5wbmcnO1xyXG5cclxudmFyIEJhc2ljVGFza1ZpZXcgPSBCYWNrYm9uZS5Lb252YVZpZXcuZXh0ZW5kKHtcclxuICAgIF9mdWxsSGVpZ2h0OiAyMSxcclxuICAgIF90b3BQYWRkaW5nOiAzLFxyXG4gICAgX2JhckhlaWdodDogMTUsXHJcbiAgICBfY29tcGxldGVDb2xvcjogJyNlODgxMzQnLFxyXG4gICAgX3Rvb2xiYXJPZmZzZXQ6IDIwLFxyXG4gICAgX3Jlc291cmNlTGlzdE9mZnNldDogMjAsXHJcbiAgICBfbWlsZXN0b25lQ29sb3I6ICdibHVlJyxcclxuICAgIF9taWxlc3RvbmVPZmZzZXQ6IDAsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuX2Z1bGxIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBldmVudHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdkcmFnbW92ZSc6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5ub2RlVHlwZSAhPT0gJ0dyb3VwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdkcmFnZW5kJzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZWVudGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd1Rvb2xzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlUmVzb3VyY2VzTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ3JhYlBvaW50ZXIoZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZWxlYXZlJzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlVG9vbHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dSZXNvdXJjZXNMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0TW91c2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdzdGFydCAuZGVwZW5kZW5jeVRvb2wnOiAnX3N0YXJ0Q29ubmVjdGluZycsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAuZGVwZW5kZW5jeVRvb2wnOiAnX21vdmVDb25uZWN0JyxcclxuICAgICAgICAgICAgJ2RyYWdlbmQgLmRlcGVuZGVuY3lUb29sJzogJ19jcmVhdGVEZXBlbmRlbmN5JyxcclxuICAgICAgICAgICAgJ2NsaWNrIC5yZXNvdXJjZXMnOiAnX2VkaXRSZXNvdXJjZXMnXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gbmV3IEtvbnZhLkdyb3VwKHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYzogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHBvcy54LFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHRoaXMuX3lcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgaWQ6IHRoaXMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgZmFrZUJhY2tncm91bmQgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5fYmFySGVpZ2h0LFxyXG4gICAgICAgICAgICBuYW1lOiAnZmFrZUJhY2tncm91bmQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgbmFtZTogJ21haW5SZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBkaWFtb25kID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsOiB0aGlzLl9taWxlc3RvbmVDb2xvcixcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgIHg6IHRoaXMuX2JhckhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5fYmFySGVpZ2h0ICogMC44LFxyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5fYmFySGVpZ2h0ICogMC44LFxyXG4gICAgICAgICAgICBvZmZzZXRYOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjggLyAyLFxyXG4gICAgICAgICAgICBvZmZzZXRZOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjggLyAyLFxyXG4gICAgICAgICAgICBuYW1lOiAnZGlhbW9uZCcsXHJcbiAgICAgICAgICAgIHJvdGF0aW9uOiA0NSxcclxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgY29tcGxldGVSZWN0ID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBmaWxsOiB0aGlzLl9jb21wbGV0ZUNvbG9yLFxyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgbmFtZTogJ2NvbXBsZXRlUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGhvck9mZnNldCA9IDY7XHJcbiAgICAgICAgdmFyIGFyYyA9IG5ldyBLb252YS5TaGFwZSh7XHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGZpbGw6ICdsaWdodGdyZWVuJyxcclxuICAgICAgICAgICAgc2NlbmVGdW5jOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2l6ZSA9IHNlbGYuX2JhckhlaWdodCArIChzZWxmLl9ib3JkZXJTaXplIHx8IDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oaG9yT2Zmc2V0LCAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYXJjKGhvck9mZnNldCwgc2l6ZSAvIDIsIHNpemUgLyAyLCAtTWF0aC5QSSAvIDIsIE1hdGguUEkgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIHNpemUpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHZhciBpbWdTaXplID0gc2l6ZSAtIDQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShsaW5rSW1hZ2UsIDEsIChzaXplIC0gaW1nU2l6ZSkgLyAyLCBpbWdTaXplLCBpbWdTaXplKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGl0RnVuYzogZnVuY3Rpb24oY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQucmVjdCgwLCAwLCA2ICsgc2VsZi5fYmFySGVpZ2h0LCBzZWxmLl9iYXJIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5maWxsU2hhcGUodGhpcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5hbWU6ICdkZXBlbmRlbmN5VG9vbCcsXHJcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHRvb2xiYXIgPSBuZXcgS29udmEuR3JvdXAoe1xyXG4gICAgICAgICAgICB5OiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBuYW1lOiAncmVzb3VyY2VzJyxcclxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2l6ZSA9IHNlbGYuX2JhckhlaWdodCArIChzZWxmLl9ib3JkZXJTaXplIHx8IDApO1xyXG4gICAgICAgIHZhciB0b29sYmFjayA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbDogJ2xpZ2h0Z3JleScsXHJcbiAgICAgICAgICAgIHdpZHRoOiBzaXplLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHNpemUsXHJcbiAgICAgICAgICAgIGNvcm5lclJhZGl1czogMlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgdXNlckltID0gbmV3IEtvbnZhLkltYWdlKHtcclxuICAgICAgICAgICAgaW1hZ2U6IHVzZXJJbWFnZSxcclxuICAgICAgICAgICAgd2lkdGg6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodDogc2l6ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRvb2xiYXIuYWRkKHRvb2xiYWNrLCB1c2VySW0pO1xyXG5cclxuICAgICAgICB2YXIgcmVzb3VyY2VMaXN0ID0gbmV3IEtvbnZhLlRleHQoe1xyXG4gICAgICAgICAgICBuYW1lOiAncmVzb3VyY2VMaXN0JyxcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbGlzdGVuaW5nOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBncm91cC5hZGQoZmFrZUJhY2tncm91bmQsIGRpYW1vbmQsIHJlY3QsIGNvbXBsZXRlUmVjdCwgYXJjLCB0b29sYmFyLCByZXNvdXJjZUxpc3QpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfZWRpdFJlc291cmNlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZpZXcgPSBuZXcgUmVzb3VyY2VFZGl0b3Ioe1xyXG4gICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3NcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5lbC5nZXRTdGFnZSgpLmdldFBvaW50ZXJQb3NpdGlvbigpO1xyXG4gICAgICAgIHZpZXcucmVuZGVyKHBvcyk7XHJcbiAgICB9LFxyXG4gICAgX3VwZGF0ZURhdGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXR0cnMgPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHJlY3Qud2lkdGgoKTtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuZWwueCgpICsgcmVjdC54KCk7XHJcbiAgICAgICAgdmFyIGRheXMxID0gTWF0aC5yb3VuZCh4IC8gZGF5c1dpZHRoKSwgZGF5czIgPSBNYXRoLnJvdW5kKCh4ICsgbGVuZ3RoKSAvIGRheXNXaWR0aCk7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXHJcbiAgICAgICAgICAgIGVuZDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyIC0gMSlcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfc2hvd1Rvb2xzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKS5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVRvb2xzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfc2hvd1Jlc291cmNlc0xpc3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX2hpZGVSZXNvdXJjZXNMaXN0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9ncmFiUG9pbnRlcjogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciBuYW1lID0gZS50YXJnZXQubmFtZSgpO1xyXG4gICAgICAgIGlmICgobmFtZSA9PT0gJ21haW5SZWN0JykgfHwgKG5hbWUgPT09ICdkZXBlbmRlbmN5VG9vbCcpIHx8XHJcbiAgICAgICAgICAgIChuYW1lID09PSAnY29tcGxldGVSZWN0JykgfHwgKGUudGFyZ2V0LmdldFBhcmVudCgpLm5hbWUoKSA9PT0gJ3Jlc291cmNlcycpKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfZGVmYXVsdE1vdXNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcclxuICAgIH0sXHJcbiAgICBfc3RhcnRDb25uZWN0aW5nOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wuaGlkZSgpO1xyXG4gICAgICAgIHZhciBwb3MgPSB0b29sLmdldEFic29sdXRlUG9zaXRpb24oKTtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gbmV3IEtvbnZhLkFycm93KHtcclxuICAgICAgICAgICAgc3Ryb2tlOiAnZGFya2dyZWVuJyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXHJcbiAgICAgICAgICAgIHBvaW50ZXJXaWR0aDogNixcclxuICAgICAgICAgICAgcG9pbnRlckhlaWdodDogMTAsXHJcbiAgICAgICAgICAgIGZpbGw6ICdncmV5JyxcclxuICAgICAgICAgICAgcG9pbnRzOiBbcG9zLnggLSBzdGFnZS54KCksIHBvcy55ICsgdGhpcy5fYmFySGVpZ2h0IC8gMiwgcG9zLnggLSBzdGFnZS54KCksIHBvcy55XSxcclxuICAgICAgICAgICAgbmFtZTogJ2Nvbm5lY3RvcidcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYWRkKGNvbm5lY3Rvcik7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ29ubmVjdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBwb2ludHMgPSBjb25uZWN0b3IucG9pbnRzKCk7XHJcbiAgICAgICAgcG9pbnRzWzJdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueCAtIHN0YWdlLngoKTtcclxuICAgICAgICBwb2ludHNbM10gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS55O1xyXG4gICAgICAgIGNvbm5lY3Rvci5wb2ludHMocG9pbnRzKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRGVwZW5kZW5jeTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgY29ubmVjdG9yLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIHZhciBzdGFnZSA9IHRoaXMuZWwuZ2V0U3RhZ2UoKTtcclxuICAgICAgICB2YXIgZWwgPSBzdGFnZS5nZXRJbnRlcnNlY3Rpb24oc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkpO1xyXG4gICAgICAgIHZhciBncm91cCA9IGVsICYmIGVsLmdldFBhcmVudCgpO1xyXG4gICAgICAgIHZhciB0YXNrSWQgPSBncm91cCAmJiBncm91cC5pZCgpO1xyXG4gICAgICAgIHZhciBiZWZvcmVNb2RlbCA9IHRoaXMubW9kZWw7XHJcbiAgICAgICAgdmFyIGFmdGVyTW9kZWwgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZ2V0KHRhc2tJZCk7XHJcbiAgICAgICAgaWYgKGFmdGVyTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmNyZWF0ZURlcGVuZGVuY3koYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciByZW1vdmVGb3IgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZmluZChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2RlcGVuZCcpID09PSBiZWZvcmVNb2RlbC5pZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChyZW1vdmVGb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuY29sbGVjdGlvbi5yZW1vdmVEZXBlbmRlbmN5KHJlbW92ZUZvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2luZyA9IHRoaXMuZWwuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmdldENoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBkcmFnZ2luZyB8fCBjaGlsZC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSkgLSAxKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnZW5kJykpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIHJldHVybiAoeC54MiAtIHgueDEpICogdGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDA7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICAvLyBtb3ZlIGdyb3VwXHJcbiAgICAgICAgdGhpcy5lbC54KHgueDEpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgZmFrZSBiYWNrZ3JvdW5kIHJlY3QgcGFyYW1zXHJcbiAgICAgICAgdmFyIGJhY2sgPSB0aGlzLmVsLmZpbmQoJy5mYWtlQmFja2dyb3VuZCcpWzBdO1xyXG4gICAgICAgIGJhY2sueCgtMjApO1xyXG4gICAgICAgIGJhY2sud2lkdGgoeC54MiAtIHgueDEgKyA2MCk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBtYWluIHJlY3QgcGFyYW1zXHJcbiAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmVsLmZpbmQoJy5tYWluUmVjdCcpWzBdO1xyXG4gICAgICAgIHJlY3QueCgwKTtcclxuICAgICAgICByZWN0LndpZHRoKHgueDIgLSB4LngxKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNvbXBsZXRlIHBhcmFtc1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdLndpZHRoKHRoaXMuX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGgoKSk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuY29tcGxldGVSZWN0JylbMF0ueCgwKTtcclxuXHJcbiAgICAgICAgdmFyIF9taWxlc3RvbmVPZmZzZXQgPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnbWlsZXN0b25lJykpIHtcclxuICAgICAgICAgICAgX21pbGVzdG9uZU9mZnNldCA9IDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbW92ZSB0b29sIHBvc2l0aW9uXHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wueCh4LngyIC0geC54MSArIF9taWxlc3RvbmVPZmZzZXQpO1xyXG4gICAgICAgIHRvb2wueSh0aGlzLl90b3BQYWRkaW5nKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc291cmNlcyA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlcycpWzBdO1xyXG4gICAgICAgIHJlc291cmNlcy54KHgueDIgLSB4LngxICsgdGhpcy5fdG9vbGJhck9mZnNldCArIF9taWxlc3RvbmVPZmZzZXQpO1xyXG4gICAgICAgIHJlc291cmNlcy55KHRoaXMuX3RvcFBhZGRpbmcpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIHJlc291cmNlIGxpc3RcclxuICAgICAgICB2YXIgcmVzb3VyY2VMaXN0ID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0JylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LngoeC54MiAtIHgueDEgKyB0aGlzLl9yZXNvdXJjZUxpc3RPZmZzZXQgKyBfbWlsZXN0b25lT2Zmc2V0KTtcclxuICAgICAgICByZXNvdXJjZUxpc3QueSh0aGlzLl90b3BQYWRkaW5nICsgMik7XHJcbiAgICAgICAgdmFyIG5hbWVzID0gW107XHJcbiAgICAgICAgdmFyIGxpc3QgPSB0aGlzLm1vZGVsLmdldCgncmVzb3VyY2VzJyk7XHJcbiAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlSWQpIHtcclxuICAgICAgICAgICAgdmFyIHJlcyA9IF8uZmluZCgodGhpcy5zZXR0aW5ncy5zdGF0dXNlcy5yZXNvdXJjZWRhdGEgfHwgW10pLCBmdW5jdGlvbihyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gci5Vc2VySWQudG9TdHJpbmcoKSA9PT0gcmVzb3VyY2VJZC50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgMykge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVzLnB1c2gocmVzLlVzZXJuYW1lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFsaWFzZXMgPSBfLm1hcChyZXMuVXNlcm5hbWUuc3BsaXQoJyAnKSwgZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChhbGlhc2VzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LnRleHQobmFtZXMuam9pbignLCAnKSk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuICAgIHNldFk6IGZ1bmN0aW9uKHkpIHtcclxuICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB0aGlzLmVsLnkoeSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0WTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3k7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY1Rhc2tWaWV3O1xyXG4iLCJ2YXIgQ29ubmVjdG9yVmlldyA9IEJhY2tib25lLktvbnZhVmlldy5leHRlbmQoe1xyXG4gICAgX2NvbG9yOiAnZ3JleScsXHJcbiAgICBfd3JvbmdDb2xvcjogJ3JlZCcsXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gcGFyYW1zLmJlZm9yZU1vZGVsO1xyXG4gICAgICAgIHRoaXMuYWZ0ZXJNb2RlbCA9IHBhcmFtcy5hZnRlck1vZGVsO1xyXG4gICAgICAgIHRoaXMuX3kxID0gMDtcclxuICAgICAgICB0aGlzLl95MiA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdE1vZGVsRXZlbnRzKCk7XHJcbiAgICB9LFxyXG4gICAgZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsaW5lID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcclxuICAgICAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBwb2ludHM6IFswLCAwLCAwLCAwXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgfSxcclxuICAgIHNldFkxOiBmdW5jdGlvbih5MSkge1xyXG4gICAgICAgIHRoaXMuX3kxID0geTE7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICBzZXRZMjogZnVuY3Rpb24oeTIpIHtcclxuICAgICAgICB0aGlzLl95MiA9IHkyO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICBpZiAoeC54MiA+PSB4LngxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW3gueDEsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kyLCB4LngyLCB0aGlzLl95Ml0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX3dyb25nQ29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbXHJcbiAgICAgICAgICAgICAgICB4LngxLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MixcclxuICAgICAgICAgICAgICAgIHgueDIsIHRoaXMuX3kyXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLnNldHRpbmdzLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfaW5pdE1vZGVsRXZlbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmJlZm9yZU1vZGVsLCAnY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmFmdGVyTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4MTogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5iZWZvcmVNb2RlbC5nZXQoJ2VuZCcpKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sIHRoaXMuYWZ0ZXJNb2RlbC5nZXQoJ3N0YXJ0JykpICogZGF5c1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvclZpZXc7XHJcbiIsInZhciBOZXN0ZWRUYXNrVmlldyA9IHJlcXVpcmUoJy4vTmVzdGVkVGFza1ZpZXcnKTtcbnZhciBBbG9uZVRhc2tWaWV3ID0gcmVxdWlyZSgnLi9BbG9uZVRhc2tWaWV3Jyk7XG52YXIgQ29ubmVjdG9yVmlldyA9IHJlcXVpcmUoJy4vQ29ubmVjdG9yVmlldycpO1xuXG52YXIgR2FudHRDaGFydFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgZWw6ICcjZ2FudHQtY29udGFpbmVyJyxcbiAgICBfdG9wUGFkZGluZzogNzMsXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBbXTtcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBbXTtcbiAgICAgICAgdGhpcy5faW5pdFN0YWdlKCk7XG4gICAgICAgIHRoaXMuX2luaXRMYXllcnMoKTtcbiAgICAgICAgdGhpcy5faW5pdEJhY2tncm91bmQoKTtcbiAgICAgICAgdGhpcy5faW5pdFNldHRpbmdzRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuX2luaXRTdWJWaWV3cygpO1xuICAgICAgICB0aGlzLl9pbml0Q29sbGVjdGlvbkV2ZW50cygpO1xuICAgIH0sXG4gICAgc2V0TGVmdFBhZGRpbmc6IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgICB0aGlzLl9sZWZ0UGFkZGluZyA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xuICAgIH0sXG4gICAgX2luaXRTdGFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3RhZ2UgPSBuZXcgS29udmEuU3RhZ2Uoe1xuICAgICAgICAgICAgY29udGFpbmVyOiB0aGlzLmVsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XG4gICAgfSxcbiAgICBfaW5pdExheWVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuRmxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XG4gICAgICAgIHRoaXMuQmxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XG4gICAgICAgIHRoaXMuVG9wQmFyTGF5ZXIgPSBuZXcgS29udmEuTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIsIHRoaXMuRmxheWVyLCB0aGlzLlRvcEJhckxheWVyKTtcbiAgICB9LFxuICAgIF91cGRhdGVTdGFnZUF0dHJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgcHJldmlvdXNUYXNrWCA9IHRoaXMuX3Rhc2tWaWV3cy5sZW5ndGggPyB0aGlzLl90YXNrVmlld3NbMF0uZWwueCgpIDogMDtcbiAgICAgICAgdGhpcy5zdGFnZS5zZXRBdHRycyh7XG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KCQoJy50YXNrcycpLmlubmVySGVpZ2h0KCkgKyB0aGlzLl90b3BQYWRkaW5nLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAkKHRoaXMuc3RhZ2UuZ2V0Q29udGFpbmVyKCkpLm9mZnNldCgpLnRvcCksXG4gICAgICAgICAgICB3aWR0aDogdGhpcy4kZWwuaW5uZXJXaWR0aCgpLFxuICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYzogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICAgICAgdmFyIHg7XG4gICAgICAgICAgICAgICAgdmFyIG1pblggPSAtKGxpbmVXaWR0aCAtIHRoaXMud2lkdGgoKSk7XG4gICAgICAgICAgICAgICAgaWYgKHBvcy54ID4gc2VsZi5fbGVmdFBhZGRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IHNlbGYuX2xlZnRQYWRkaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zLnggPCBtaW5YKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBtaW5YO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBwb3MueDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5kcmFnZ2VkVG9EYXkgPSBNYXRoLmFicyh4IC0gc2VsZi5fbGVmdFBhZGRpbmcpIC8gc2VsZi5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJykuZGF5c1dpZHRoO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl90YXNrVmlld3MubGVuZ3RoIHx8ICFwcmV2aW91c1Rhc2tYKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZS54KHRoaXMuX2xlZnRQYWRkaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pbnggPSAtKGxpbmVXaWR0aCAtIHRoaXMuc3RhZ2Uud2lkdGgoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLl9sZWZ0UGFkZGluZyAtICh0aGlzLmRyYWdnZWRUb0RheSB8fCAwKSAqIHNlbGYuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLmRheXNXaWR0aDtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLngoTWF0aC5tYXgobWlueCwgeCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XG4gICAgICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcblxuXG4gICAgfSxcbiAgICBfaW5pdEJhY2tncm91bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG9wQmFyID0gbmV3IEtvbnZhLlNoYXBlKHtcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0VG9wQmFyU2NlbmVGdW5jdGlvbigpLFxuICAgICAgICAgICAgc3Ryb2tlOiAnbGlnaHRncmF5JyxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICAgICAgZmlsbDogJ3JnYmEoMCwwLDAsMC4xKScsXG4gICAgICAgICAgICBuYW1lOiAndG9wQmFyJyxcbiAgICAgICAgICAgIGhpdEdyYXBoRW5hYmxlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBncmlkID0gbmV3IEtvbnZhLlNoYXBlKHtcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0R3JpZFNjZW5lRnVuY3Rpb24oKSxcbiAgICAgICAgICAgIHN0cm9rZTogJ2xpZ2h0Z3JheScsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgICAgIGZpbGw6ICdyZ2JhKDAsMCwwLDAuMSknLFxuICAgICAgICAgICAgbmFtZTogJ2dyaWQnLFxuICAgICAgICAgICAgaGl0R3JhcGhFbmFibGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcbiAgICAgICAgdmFyIHdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xuICAgICAgICB2YXIgYmFjayA9IG5ldyBLb252YS5SZWN0KHtcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zdGFnZS5oZWlnaHQoKSxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aFxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGN1cnJlbnREYXlMaW5lID0gbmV3IEtvbnZhLlJlY3Qoe1xuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YWdlLmhlaWdodCgpLFxuICAgICAgICAgICAgd2lkdGg6IDIsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIGZpbGw6ICdncmVlbicsXG4gICAgICAgICAgICBsaXN0ZW5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgbmFtZTogJ2N1cnJlbnREYXlMaW5lJ1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIHkgPSBNYXRoLm1heCgwLCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCB3aW5kb3cuc2Nyb2xsWSk7XG4gICAgICAgICAgICB0b3BCYXIueSh5KTtcbiAgICAgICAgICAgIHRvcEJhci5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLkJsYXllci5hZGQoYmFjaykuYWRkKGN1cnJlbnREYXlMaW5lKS5hZGQoZ3JpZCk7XG4gICAgICAgIHRoaXMuVG9wQmFyTGF5ZXIuYWRkKHRvcEJhcik7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVRvZGF5TGluZSgpO1xuICAgICAgICB0aGlzLnN0YWdlLmRyYXcoKTtcbiAgICB9LFxuICAgIF9nZXRUb3BCYXJTY2VuZUZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2Rpc3BsYXkgPSB0aGlzLnNldHRpbmdzLnNkaXNwbGF5O1xuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xuICAgICAgICB2YXIgYm9yZGVyV2lkdGggPSBzZGlzcGxheS5ib3JkZXJXaWR0aCB8fCAxO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMTtcbiAgICAgICAgdmFyIHJvd0hlaWdodCA9IDIwO1xuXG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xuICAgICAgICAgICAgdmFyIGksIHMsIGlMZW4gPSAwLFx0ZGF5c1dpZHRoID0gc2F0dHIuZGF5c1dpZHRoLCB4LFx0bGVuZ3RoLFx0aERhdGEgPSBzYXR0ci5oRGF0YTtcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XG5cbiAgICAgICAgICAgIC8vIGNsZWFyIGJhY2tnb3VuZFxuICAgICAgICAgICAgLy8gc28gYWxsIHNoYXBlcyB1bmRlciB3aWxsIGJlIG5vdCB2aXNpYmxlXG4gICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgICAgICBjb250ZXh0LnJlY3QoMCwgMCwgbGluZVdpZHRoICsgb2Zmc2V0LCAzICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xuXG5cblxuICAgICAgICAgICAgLy9kcmF3IHRocmVlIGhvcml6b250YWwgbGluZXNcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnbGlnaHRncmV5JztcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBmb3IoaSA9IDE7IGkgPCA0OyBpKyspe1xuICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8obGluZVdpZHRoICsgb2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cblxuICAgICAgICAgICAgLy8gZHJhdyB5ZWFycy9tb250aFxuICAgICAgICAgICAgLy8gd2l0aCBsaW5lc1xuICAgICAgICAgICAgdmFyIHlpID0gMCwgeWYgPSByb3dIZWlnaHQsIHhpID0gMDtcbiAgICAgICAgICAgIGZvciAocyA9IDE7IHMgPCAzOyBzKyspe1xuICAgICAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBsZW5ndGggPSBoRGF0YVtzXVtpXS5kdXJhdGlvbiAqIGRheXNXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgeWYpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMTBwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeCAtIGxlbmd0aCAvIDIsIHlmIC0gcm93SGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB5aSA9IHlmOyB5ZiA9IHlmICsgcm93SGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkcmF3IGRheXNcbiAgICAgICAgICAgIHggPSAwOyBsZW5ndGggPSAwOyBzID0gMztcbiAgICAgICAgICAgIHZhciBkcmFnSW50ID0gcGFyc2VJbnQoc2F0dHIuZHJhZ0ludGVydmFsLCAxMCk7XG4gICAgICAgICAgICB2YXIgaGlkZURhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmKCBkcmFnSW50ID09PSAxNCB8fCBkcmFnSW50ID09PSAzMCl7XG4gICAgICAgICAgICAgICAgaGlkZURhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMCwgaUxlbiA9IGhEYXRhW3NdLmxlbmd0aDsgaSA8IGlMZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxlbmd0aCA9IGhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xuICAgICAgICAgICAgICAgIHggPSB4ICsgbGVuZ3RoO1xuICAgICAgICAgICAgICAgIHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChoRGF0YVtzXVtpXS5ob2x5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2xpZ2h0Z3JheSc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB5aSArIHJvd0hlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpIC0gbGVuZ3RoLCB5aSArIHJvd0hlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpIC0gbGVuZ3RoLCB5aSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgICAgICAgICAgIGlmIChoaWRlRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMXB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coaERhdGFbc11baV0udGV4dCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4IC0gbGVuZ3RoIC8gMiwgeWkgKyByb3dIZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIF9nZXRHcmlkU2NlbmVGdW5jdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZGlzcGxheSA9IHRoaXMuc2V0dGluZ3Muc2Rpc3BsYXk7XG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XG4gICAgICAgIHZhciBvZmZzZXQgPSAxO1xuXG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xuICAgICAgICAgICAgdmFyIGksIHMsIGlMZW4gPSAwLFx0ZGF5c1dpZHRoID0gc2F0dHIuZGF5c1dpZHRoLCB4LFx0bGVuZ3RoLFx0aERhdGEgPSBzYXR0ci5oRGF0YTtcblxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgICAgICAgICAgdmFyIHlpID0gMCwgeGkgPSAwO1xuXG4gICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDsgcyA9IDM7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gaERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XG4gICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XG4gICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKGhEYXRhW3NdW2ldLmhvbHkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeGksIHRoaXMuZ2V0U3RhZ2UoKS5oZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpIC0gbGVuZ3RoLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSAtIGxlbmd0aCwgeWkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHhpLCB5aSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgX2NhY2hlQmFja2dyb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XG4gICAgICAgIHZhciBsaW5lV2lkdGggPSBEYXRlLmRheXNkaWZmKHNhdHRyLmJvdW5kYXJ5TWluLCBzYXR0ci5ib3VuZGFyeU1heCkgKiBzYXR0ci5kYXlzV2lkdGg7XG4gICAgICAgIHRoaXMuc3RhZ2UuZmluZCgnLmdyaWQsLnRvcEJhcicpLmNhY2hlKHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgd2lkdGg6IGxpbmVXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zdGFnZS5oZWlnaHQoKVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF91cGRhdGVUb2RheUxpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG4gICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcbiAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XG5cbiAgICAgIHZhciB4ID0gRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgbmV3IERhdGUoKSkgKiBkYXlzV2lkdGg7XG4gICAgICB0aGlzLkJsYXllci5maW5kT25lKCcuY3VycmVudERheUxpbmUnKS54KHgpLmhlaWdodCh0aGlzLnN0YWdlLmhlaWdodCgpKTtcbiAgICAgIHRoaXMuQmxheWVyLmJhdGNoRHJhdygpO1xuICAgIH0sXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVUb2RheUxpbmUoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlQmFja2dyb3VuZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6d2lkdGgnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlQmFja2dyb3VuZCgpO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVG9kYXlMaW5lKCk7XG4gICAgICAgICAgICB0aGlzLl90YXNrVmlld3MuZm9yRWFjaChmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MuZm9yRWFjaChmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH0sXG4gICAgX2luaXRDb2xsZWN0aW9uRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQnLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAncmVtb3ZlJywgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlVmlld0Zvck1vZGVsKHRhc2spO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgcmVtb3ZlJywgXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHdhaXQgZm9yIGxlZnQgcGFuZWwgdXBkYXRlc1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMCk7XG4gICAgICAgIH0sIDEwKSk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0IGNoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdkZXBlbmQ6YWRkJywgZnVuY3Rpb24oYmVmb3JlLCBhZnRlcikge1xuICAgICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdG9yVmlldyhiZWZvcmUsIGFmdGVyKTtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdkZXBlbmQ6cmVtb3ZlJywgZnVuY3Rpb24oYmVmb3JlLCBhZnRlcikge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdG9yVmlldyhiZWZvcmUsIGFmdGVyKTtcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICduZXN0ZWRTdGF0ZUNoYW5nZScsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVZpZXdGb3JNb2RlbCh0YXNrKTtcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9yZW1vdmVWaWV3Rm9yTW9kZWw6IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgIHZhciB0YXNrVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBtb2RlbDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3JlbW92ZVZpZXcodGFza1ZpZXcpO1xuICAgIH0sXG4gICAgX3JlbW92ZVZpZXc6IGZ1bmN0aW9uKHRhc2tWaWV3KSB7XG4gICAgICAgIHRhc2tWaWV3LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLl90YXNrVmlld3MgPSBfLndpdGhvdXQodGhpcy5fdGFza1ZpZXdzLCB0YXNrVmlldyk7XG4gICAgfSxcbiAgICBfcmVtb3ZlQ29ubmVjdG9yVmlldzogZnVuY3Rpb24oYmVmb3JlLCBhZnRlcikge1xuICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcuYWZ0ZXJNb2RlbCA9PT0gYWZ0ZXIgJiZcbiAgICAgICAgICAgICAgICB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmU7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25uZWN0b3JWaWV3LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl9jb25uZWN0b3JWaWV3cywgY29ubmVjdG9yVmlldyk7XG4gICAgfSxcbiAgICBfaW5pdFN1YlZpZXdzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaCgoYWZ0ZXIpID0+IHtcbiAgICAgICAgICAgIGFmdGVyLmRlcGVuZHMuZWFjaCgoYmVmb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3RvclZpZXcoYmVmb3JlLCBhZnRlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcbiAgICAgICAgdGhpcy5GbGF5ZXIuZHJhdygpO1xuICAgIH0sXG4gICAgX2FkZFRhc2tWaWV3OiBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgIHZhciB2aWV3O1xuICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XG4gICAgICAgICAgICB2aWV3ID0gbmV3IE5lc3RlZFRhc2tWaWV3KHtcbiAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFsb25lVGFza1ZpZXcoe1xuICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XG4gICAgICAgIHZpZXcucmVuZGVyKCk7XG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cy5wdXNoKHZpZXcpO1xuICAgIH0sXG4gICAgX2FkZENvbm5lY3RvclZpZXc6IGZ1bmN0aW9uKGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICAgICAgdmFyIHZpZXcgPSBuZXcgQ29ubmVjdG9yVmlldyh7XG4gICAgICAgICAgICBiZWZvcmVNb2RlbDogYmVmb3JlLFxuICAgICAgICAgICAgYWZ0ZXJNb2RlbDogYWZ0ZXIsXG4gICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xuICAgICAgICB2aWV3LmVsLm1vdmVUb0JvdHRvbSgpO1xuICAgICAgICB2aWV3LnJlbmRlcigpO1xuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5wdXNoKHZpZXcpO1xuICAgIH0sXG5cbiAgICBfcmVxdWVzdFJlc29ydDogKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29ydFZpZXdzKCk7XG4gICAgICAgICAgICAgICAgd2FpdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcbiAgICAgICAgICAgIHdhaXRpbmcgPSB0cnVlO1xuICAgICAgICB9O1xuICAgIH0oKSksXG4gICAgX3Jlc29ydFZpZXdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhc3RZID0gdGhpcy5fdG9wUGFkZGluZztcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2aWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2Lm1vZGVsID09PSB0YXNrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXZpZXcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aWV3LnNldFkobGFzdFkpO1xuICAgICAgICAgICAgbGFzdFkgKz0gdmlldy5oZWlnaHQ7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKChhZnRlcikgPT4ge1xuICAgICAgICAgICAgaWYgKGFmdGVyLmdldCgnaGlkZGVuJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZnRlci5kZXBlbmRzLmVhY2goKGJlZm9yZSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBiZWZvcmVWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gYmVmb3JlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBhZnRlclZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSBhZnRlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdG9yVmlldyA9IF8uZmluZCh0aGlzLl9jb25uZWN0b3JWaWV3cywgZnVuY3Rpb24odmlldykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5iZWZvcmVNb2RlbCA9PT0gYmVmb3JlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmFmdGVyTW9kZWwgPT09IGFmdGVyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTEoYmVmb3JlVmlldy5nZXRZKCkgKyBiZWZvcmVWaWV3Ll9mdWxsSGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgY29ubmVjdG9yVmlldy5zZXRZMihhZnRlclZpZXcuZ2V0WSgpICsgYWZ0ZXJWaWV3Ll9mdWxsSGVpZ2h0IC8gMik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuRmxheWVyLmJhdGNoRHJhdygpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbnR0Q2hhcnRWaWV3O1xuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3IgOiAnI2IzZDFmYycsXHJcbiAgICBfYm9yZGVyU2l6ZSA6IDYsXHJcbiAgICBfYmFySGVpZ2h0IDogMTAsXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjQzk1RjEwJyxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWzAsIDAsIHRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWy10aGlzLl9ib3JkZXJTaXplICogMS41LCAwLCAwLCAwLCAwLCB0aGlzLl9ib3JkZXJTaXplXSxcclxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBncm91cCBpcyBtb3ZlZFxyXG4gICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZGV0ZWN0IGludGVydmFsXHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmVsLngoKSArIHJlY3QueCgpO1xyXG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCk7XHJcbiAgICAgICAgdmFyIG5ld1N0YXJ0ID0gYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKTtcclxuICAgICAgICB0aGlzLm1vZGVsLm1vdmVUb1N0YXJ0KG5ld1N0YXJ0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEpO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVdpZHRoID0gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgICAgIGlmIChjb21wbGV0ZVdpZHRoID4gdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHgueDIgLSB4LngxKSAtIGNvbXBsZXRlV2lkdGggPCB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTW9kYWxFZGl0ID0gcmVxdWlyZSgnLi4vTW9kYWxUYXNrRWRpdFZpZXcnKTtcclxudmFyIENvbW1lbnRzID0gcmVxdWlyZSgnLi4vQ29tbWVudHNWaWV3Jyk7XHJcblxyXG5mdW5jdGlvbiBDb250ZXh0TWVudVZpZXcocGFyYW1zKSB7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMuY29sbGVjdGlvbjtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICd1bCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykgfHwgJCh0aGlzKS5kYXRhKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmNvbGxlY3Rpb24uZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnZGVsZXRlJyl7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncHJvcGVydGllcycpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgTW9kYWxFZGl0KHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHNlbGYuc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdjb21tZW50cycpe1xyXG4gICAgICAgICAgICAgICAgbmV3IENvbW1lbnRzKHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHNlbGYuc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIH0pLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyb3dBYm92ZScpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlX2lkOiBpZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayhkYXRhLCAnYWJvdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdyb3dCZWxvdycpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfSwgJ2JlbG93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2luZGVudCcpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29sbGVjdGlvbi5pbmRlbnQobW9kZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdvdXRkZW50Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbGxlY3Rpb24ub3V0ZGVudChtb2RlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIFwicm93QWJvdmVcIjogeyBuYW1lOiBcIiZuYnNwO05ldyBSb3cgQWJvdmVcIiwgaWNvbjogXCJhYm92ZVwiIH0sXHJcbiAgICAgICAgICAgIFwicm93QmVsb3dcIjogeyBuYW1lOiBcIiZuYnNwO05ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJiZWxvd1wiIH0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHsgbmFtZTogXCImbmJzcDtJbmRlbnQgUm93XCIsIGljb246IFwiaW5kZW50XCIgfSxcclxuICAgICAgICAgICAgXCJvdXRkZW50XCI6IHsgbmFtZTogXCImbmJzcDtPdXRkZW50IFJvd1wiLCBpY29uOiBcIm91dGRlbnRcIiB9LFxyXG4gICAgICAgICAgICBcInNlcDFcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHsgbmFtZTogXCImbmJzcDtQcm9wZXJ0aWVzXCIsIGljb246IFwicHJvcGVydGllc1wiIH0sXHJcbiAgICAgICAgICAgIFwiY29tbWVudHNcIjogeyBuYW1lOiBcIiZuYnNwO0NvbW1lbnRzXCIsIGljb246IFwiY29tbWVudFwiIH0sXHJcbiAgICAgICAgICAgIFwic2VwMlwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcImRlbGV0ZVwiOiB7IG5hbWU6IFwiJm5ic3A7RGVsZXRlIFJvd1wiLCBpY29uOiBcImRlbGV0ZVwiIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUuYWRkVGFzayA9IGZ1bmN0aW9uKGRhdGEsIGluc2VydFBvcykge1xyXG4gICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkYXRhLnJlZmVyZW5jZV9pZCk7XHJcbiAgICBpZiAocmVmX21vZGVsKSB7XHJcbiAgICAgICAgc29ydGluZGV4ID0gcmVmX21vZGVsLmdldCgnc29ydGluZGV4JykgKyAoaW5zZXJ0UG9zID09PSAnYWJvdmUnID8gLTAuNSA6IDAuNSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmNvbGxlY3Rpb24ubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuY29sbGVjdGlvbi5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyXG4gICAgdGhpcy5jb2xsZWN0aW9uLmNoZWNrU29ydGVkSW5kZXgoKTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwidmFyIERhdGVQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdEYXRlUGlja2VyJyxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzZWxlY3QnKTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbmV3IERhdGUoZGF0ZVsyXSArICctJyArIGRhdGVbMV0gKyAnLScgKyBkYXRlWzBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdzaG93Jyk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ2Rlc3Ryb3knKTtcbiAgICB9LFxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRlU3RyID0gJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5wcm9wcy5kYXRlRm9ybWF0LCB0aGlzLnByb3BzLnZhbHVlKTtcbiAgICAgICAgdGhpcy5nZXRET01Ob2RlKCkudmFsdWUgPSBkYXRlU3RyO1xuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgdGhpcy5wcm9wcy52YWx1ZSlcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcbiIsInZhciBUYXNrSXRlbSA9IHJlcXVpcmUoJy4vVGFza0l0ZW0nKTtcblxudmFyIE5lc3RlZFRhc2sgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdOZXN0ZWRUYXNrJyxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub24oJ2NoYW5nZTpoaWRkZW4gY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3VidGFza3MgPSB0aGlzLnByb3BzLm1vZGVsLmNoaWxkcmVuLm1hcCgodGFzaykgPT4ge1xuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiB0YXNrLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdFJvdzogdGhpcy5wcm9wcy5vblNlbGVjdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgb25FZGl0Um93OiB0aGlzLnByb3BzLm9uRWRpdFJvdyxcbiAgICAgICAgICAgICAgICAgICAgZWRpdGVkUm93OiB0aGlzLnByb3BzLmVkaXRlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRSb3c6IHRoaXMucHJvcHMuc2VsZWN0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTW9kZWxDaWQ6IHRoaXMucHJvcHMuc2VsZWN0ZWRNb2RlbENpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0YXNrLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2RyYWctaXRlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnOiB0YXNrLmNpZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N1YlRhc2s6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0Um93OiB0aGlzLnByb3BzLm9uU2VsZWN0Um93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdFJvdzogdGhpcy5wcm9wcy5vbkVkaXRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGVkUm93OiAodGhpcy5wcm9wcy5zZWxlY3RlZE1vZGVsQ2lkID09PSB0YXNrLmNpZCkgJiYgdGhpcy5wcm9wcy5lZGl0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRSb3c6ICh0aGlzLnByb3BzLnNlbGVjdGVkTW9kZWxDaWQgPT09IHRhc2suY2lkKSAmJiB0aGlzLnByb3BzLnNlbGVjdGVkUm93XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICd0YXNrLWxpc3QtY29udGFpbmVyIGRyYWctaXRlbScgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRoaXMucHJvcHMubW9kZWwuY2lkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRoaXMucHJvcHMubW9kZWwuY2lkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLnByb3BzLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3RSb3c6IHRoaXMucHJvcHMub25TZWxlY3RSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVkaXRSb3c6IHRoaXMucHJvcHMub25FZGl0Um93LFxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGVkUm93OiAodGhpcy5wcm9wcy5zZWxlY3RlZE1vZGVsQ2lkID09PSB0aGlzLnByb3BzLm1vZGVsLmNpZCkgJiYgdGhpcy5wcm9wcy5lZGl0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogKHRoaXMucHJvcHMuc2VsZWN0ZWRNb2RlbENpZCA9PT0gdGhpcy5wcm9wcy5tb2RlbC5jaWQpICYmIHRoaXMucHJvcHMuc2VsZWN0ZWRSb3dcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ29sJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3ViLXRhc2stbGlzdCBzb3J0YWJsZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3VidGFza3NcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2s7XG4iLCJ2YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XG52YXIgTmVzdGVkVGFzayA9IHJlcXVpcmUoJy4vTmVzdGVkVGFzaycpO1xuXG5mdW5jdGlvbiBidWlsZFRhc2tzT3JkZXJGcm9tRE9NKGNvbnRhaW5lcikge1xuICAgIHZhciBkYXRhID0gW107XG4gICAgdmFyIGNoaWxkcmVuID0gJCgnPG9sPicgKyBjb250YWluZXIuZ2V0KDApLmlubmVySFRNTCArICc8L29sPicpLmNoaWxkcmVuKCk7XG4gICAgXy5lYWNoKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICB2YXIgJGNoaWxkID0gJChjaGlsZCk7XG4gICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICBpZDogJGNoaWxkLmRhdGEoJ2lkJyksXG4gICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN1Ymxpc3QgPSAkY2hpbGQuZmluZCgnb2wnKTtcbiAgICAgICAgaWYgKHN1Ymxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBvYmouY2hpbGRyZW4gPSBidWlsZFRhc2tzT3JkZXJGcm9tRE9NKHN1Ymxpc3QpO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEucHVzaChvYmopO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xufVxuXG52YXIgU2lkZVBhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU2lkZVBhbmVsJyxcbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZWxlY3RlZFJvdzogbnVsbCxcbiAgICAgICAgICAgIGxhc3RTZWxlY3RlZFJvdzogbnVsbCxcbiAgICAgICAgICAgIHNlbGVjdGVkTW9kZWw6IG51bGwsXG4gICAgICAgICAgICBlZGl0ZWRSb3c6IG51bGxcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ub24oJ2FkZCByZW1vdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHRoaXMuX21ha2VTb3J0YWJsZSgpO1xuICAgICAgICB0aGlzLl9zZXR1cEhpZ2hsaWdodGVyKCk7XG4gICAgfSxcbiAgICBfbWFrZVNvcnRhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoJy50YXNrLWNvbnRhaW5lcicpO1xuICAgICAgICBjb250YWluZXIuc29ydGFibGUoe1xuICAgICAgICAgICAgZ3JvdXA6ICdzb3J0YWJsZScsXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJ29sJyxcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy5kcmFnLWl0ZW0nLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlciBzb3J0LXBsYWNlaG9sZGVyXCIvPicsXG4gICAgICAgICAgICBvbkRyYWdTdGFydDogKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRHJhZzogKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xuICAgICAgICAgICAgICAgIHZhciBpc1N1YlRhc2sgPSAhJCgkcGxhY2Vob2xkZXIucGFyZW50KCkpLmhhc0NsYXNzKCd0YXNrLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogaXNTdWJUYXNrID8gJzMwcHgnIDogJzAnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Ecm9wOiAoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gYnVpbGRUYXNrc09yZGVyRnJvbURPTShjb250YWluZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfc2V0dXBIaWdobGlnaHRlcigpIHtcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIgPSAkKCc8ZGl2PicpO1xuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5jc3Moe1xuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnZ3JleScsXG4gICAgICAgICAgICBvcGFjaXR5OiAnMC41JyxcbiAgICAgICAgICAgIHRvcDogJzAnLFxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJ1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gJCgnLnRhc2stY29udGFpbmVyJyk7XG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWVudGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgY29udGFpbmVyLm1vdXNlb3ZlcihmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBUT0RPOiByZXdyaXRlIHRvIGZpbmQgY2xvc2VzdCB1bFxuICAgICAgICAgICAgaWYgKCEkZWwuZGF0YSgnaWQnKSkge1xuICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAoISRlbC5kYXRhKCdpZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcG9zID0gJGVsLm9mZnNldCgpO1xuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcbiAgICAgICAgICAgICAgICB0b3A6IHBvcy50b3AgKyAncHgnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJGVsLmhlaWdodCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICBjb250YWluZXIubW91c2VsZWF2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgcmVxdWVzdFVwZGF0ZTogKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgd2FpdGluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDUpO1xuICAgICAgICAgICAgd2FpdGluZyA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfSgpKSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJy50YXNrLWNvbnRhaW5lcicpLnNvcnRhYmxlKCdkZXN0cm95Jyk7XG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XG4gICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLnJlbW92ZSgpO1xuICAgIH0sXG4gICAgb25TZWxlY3RSb3coc2VsZWN0ZWRNb2RlbENpZCwgc2VsZWN0ZWRSb3cpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZFJvdyxcbiAgICAgICAgICAgIHNlbGVjdGVkTW9kZWxDaWRcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBvbkVkaXRSb3coc2VsZWN0ZWRNb2RlbENpZCwgZWRpdGVkUm93KSB7XG4gICAgICAgIGlmICghZWRpdGVkUm93KSB7XG4gICAgICAgICAgICB2YXIgeCA9IHdpbmRvdy5zY3JvbGxYLCB5ID0gd2luZG93LnNjcm9sbFk7XG4gICAgICAgICAgICB0aGlzLnJlZnMuY29udGFpbmVyLmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKHgsIHkpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRSb3c6IHRoaXMuc3RhdGUubGFzdFNlbGVjdGVkUm93XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTW9kZWxDaWQsXG4gICAgICAgICAgICBlZGl0ZWRSb3dcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBvbktleURvd24oZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3Qgcm93cyA9IFsnbmFtZScsICdjb21wbGV0ZScsICdzdGFydCcsICdlbmQnLCAnZHVyYXRpb24nXTtcbiAgICAgICAgbGV0IGkgPSByb3dzLmluZGV4T2YodGhpcy5zdGF0ZS5zZWxlY3RlZFJvdyk7XG4gICAgICAgIGNvbnN0IHRhc2tzID0gdGhpcy5wcm9wcy5jb2xsZWN0aW9uO1xuICAgICAgICBsZXQgbW9kZWxJbmRleCA9IHRhc2tzLmdldCh0aGlzLnN0YXRlLnNlbGVjdGVkTW9kZWxDaWQpLmdldCgnc29ydGluZGV4Jyk7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDQwKSB7IC8vIGRvd25cbiAgICAgICAgICAgIG1vZGVsSW5kZXggPSAobW9kZWxJbmRleCArIDEgKyB0YXNrcy5sZW5ndGgpICUgdGFza3MubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMzkpIHsgLy8gcmlnaHRcbiAgICAgICAgICAgIGkgPSAoaSArIDEgKyByb3dzLmxlbmd0aCkgJSByb3dzLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDM4KSB7IC8vIHVwXG4gICAgICAgICAgICBtb2RlbEluZGV4ID0gKG1vZGVsSW5kZXggLSAxICsgdGFza3MubGVuZ3RoKSAlIHRhc2tzLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDM3KSB7IC8vIGxlZnRcbiAgICAgICAgICAgIGkgPSAoaSAtIDEgKyByb3dzLmxlbmd0aCkgJSByb3dzLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDEzKSB7IC8vIGVudGVyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6IHJvd3NbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXV0byBvcGVuIHNpZGUgcGFuZWxcbiAgICAgICAgaWYgKGkgPj0gMikge1xuICAgICAgICAgICAgJCgnLm1lbnUtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3BhbmVsLWNvbGxhcHNlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWRSb3c6IHJvd3NbaV0sXG4gICAgICAgICAgICBzZWxlY3RlZE1vZGVsQ2lkOiB0YXNrcy5hdChtb2RlbEluZGV4KS5jaWRcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBvbkNsaWNrKCkge1xuICAgICAgICB2YXIgeCA9IHdpbmRvdy5zY3JvbGxYLCB5ID0gd2luZG93LnNjcm9sbFk7XG4gICAgICAgIHRoaXMucmVmcy5jb250YWluZXIuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbyh4LCB5KTtcbiAgICB9LFxuICAgIG9uQmx1cigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsYXN0U2VsZWN0ZWRSb3c6IHRoaXMuc3RhdGUuc2VsZWN0ZWRSb3csXG4gICAgICAgICAgICBzZWxlY3RlZFJvdzogbnVsbFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0YXNrcyA9IFtdO1xuICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24uZWFjaCgodGFzaykgPT4ge1xuICAgICAgICAgICAgaWYgKHRhc2sucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChOZXN0ZWRUYXNrLCB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0Um93OiB0aGlzLm9uU2VsZWN0Um93LFxuICAgICAgICAgICAgICAgICAgICBvbkVkaXRSb3c6IHRoaXMub25FZGl0Um93LFxuICAgICAgICAgICAgICAgICAgICBlZGl0ZWRSb3c6IHRoaXMuc3RhdGUuZWRpdGVkUm93LFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogdGhpcy5zdGF0ZS5zZWxlY3RlZFJvdyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRNb2RlbENpZDogdGhpcy5zdGF0ZS5zZWxlY3RlZE1vZGVsQ2lkXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB0YXNrLmNpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2RyYWctaXRlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCc6IHRhc2suY2lkXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGFza0l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZWxlY3RSb3c6IHRoaXMub25TZWxlY3RSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVkaXRSb3c6IHRoaXMub25FZGl0Um93LFxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGVkUm93OiAodGhpcy5zdGF0ZS5zZWxlY3RlZE1vZGVsQ2lkID09PSB0YXNrLmNpZCkgJiYgdGhpcy5zdGF0ZS5lZGl0ZWRSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFJvdzogKHRoaXMuc3RhdGUuc2VsZWN0ZWRNb2RlbENpZCA9PT0gdGFzay5jaWQpICYmIHRoaXMuc3RhdGUuc2VsZWN0ZWRSb3dcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8b2xcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J3Rhc2stY29udGFpbmVyIHNvcnRhYmxlJ1xuICAgICAgICAgICAgICAgIHRhYkluZGV4PVwiMVwiXG4gICAgICAgICAgICAgICAgcmVmPVwiY29udGFpbmVyXCJcbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGlja31cbiAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25CbHVyfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0YXNrc31cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lkZVBhbmVsO1xuIiwidmFyIERhdGVQaWNrZXIgPSByZXF1aXJlKCcuL0RhdGVQaWNrZXInKTtcbnZhciBDb21tZXRzVmlldyA9IHJlcXVpcmUoJy4uL0NvbW1lbnRzVmlldycpO1xuXG52YXIgVGFza0l0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdUYXNrSXRlbScsXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsOiBudWxsXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGU6IGZ1bmN0aW9uKHByb3BzKSB7XG4gICAgICAgIGlmIChfLmlzRXF1YWwocHJvcHMsIHRoaXMucHJvcHMpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCAkaW5wdXQgPSAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5maW5kKCdpbnB1dCcpO1xuICAgICAgICAkaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgLy8gbW92ZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiBpbnB1dC4gVGlwIGZyb206XG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTExMDg4L3VzZS1qYXZhc2NyaXB0LXRvLXBsYWNlLWN1cnNvci1hdC1lbmQtb2YtdGV4dC1pbi10ZXh0LWlucHV0LWVsZW1lbnRcbiAgICAgICAgY29uc3QgdmFsID0gJGlucHV0LnZhbCgpOyAvL3N0b3JlIHRoZSB2YWx1ZSBvZiB0aGUgZWxlbWVudFxuICAgICAgICAkaW5wdXQudmFsKCcnKTsgLy9jbGVhciB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnRcbiAgICAgICAgJGlucHV0LnZhbCh2YWwpOyAvL3NldCB0aGF0IHZhbHVlIGJhY2suXG5cbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGV2ZW50cyA9IFtcbiAgICAgICAgICAgICdjaGFuZ2U6bmFtZScsICdjaGFuZ2U6Y29tcGxldGUnLCAnY2hhbmdlOnN0YXJ0JyxcbiAgICAgICAgICAgICdjaGFuZ2U6ZW5kJywgJ2NoYW5nZTpkdXJhdGlvbicsICdjaGFuZ2U6aGlnaHRsaWdodCcsXG4gICAgICAgICAgICAnY2hhbmdlOkNvbW1lbnRzJ1xuICAgICAgICBdO1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9uKGV2ZW50cy5qb2luKCcgJyksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vZmYobnVsbCwgbnVsbCwgdGhpcyk7XG4gICAgfSxcbiAgICBfZmluZE5lc3RlZExldmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubW9kZWwuZ2V0T3V0bGluZUxldmVsKCkgLSAxO1xuICAgIH0sXG4gICAgX2NyZWF0ZUZpZWxkOiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgY29uc3QgaXNDb2xJbkVkaXQgPSAodGhpcy5wcm9wcy5lZGl0ZWRSb3cgPT09IGNvbCk7XG4gICAgICAgIGlmIChpc0NvbEluRWRpdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUVkaXRGaWVsZChjb2wpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywge30sIHRoaXMuX2NyZWF0ZVJlYWRGaWxlZChjb2wpKTtcbiAgICB9LFxuICAgIF9jcmVhdGVSZWFkRmlsZWQ6IGZ1bmN0aW9uKGNvbCkge1xuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICBpZiAoY29sID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0KGNvbCkgKyAnJSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5kYXRlcGlja2VyLmZvcm1hdERhdGUodGhpcy5wcm9wcy5kYXRlRm9ybWF0LCBtb2RlbC5nZXQoY29sKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA9PT0gJ2R1cmF0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIERhdGUuZGF5c2RpZmYobW9kZWwuZ2V0KCdzdGFydCcpLCBtb2RlbC5nZXQoJ2VuZCcpKSArICcgZCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpO1xuICAgIH0sXG4gICAgX2NyZWF0ZURhdGVFbGVtZW50OiBmdW5jdGlvbihjb2wpIHtcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXG4gICAgICAgICAgICBrZXk6IGNvbCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFJvdyh0aGlzLnByb3BzLm1vZGVsLmNpZCwgbnVsbCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfZHVyYXRpb25DaGFuZ2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBudW1iZXIgPSBwYXJzZUludCh2YWx1ZS5yZXBsYWNlKCAvXlxcRCsvZywgJycpLCAxMCk7XG4gICAgICAgIGlmICghbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJ3cnKSA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRXZWVrcyhudW1iZXIpKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5pbmRleE9mKCdtJykgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2VuZCcsIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLmNsb25lKCkuYWRkTW9udGhzKG51bWJlcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbnVtYmVyLS07XG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKG51bWJlcikpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBfY3JlYXRlRHVyYXRpb25GaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSBEYXRlLmRheXNkaWZmKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdzdGFydCcpLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnZW5kJykpICsgJyBkJztcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsIHx8IHZhbCxcbiAgICAgICAgICAgIGtleTogJ2R1cmF0aW9uJyxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHVyYXRpb25DaGFuZ2UodmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlfSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbktleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMyB8fCBlLmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FZGl0Um93KHRoaXMucHJvcHMubW9kZWwuY2lkLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX2NyZWF0ZUVkaXRGaWVsZDogZnVuY3Rpb24oY29sKSB7XG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlRWxlbWVudChjb2wpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPT09ICdkdXJhdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEdXJhdGlvbkZpZWxkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnbmFtZUlucHV0JyxcbiAgICAgICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgICAgICBrZXk6IGNvbCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KGNvbCwgbmV3VmFsKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uS2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzIHx8IGUua2V5Q29kZSA9PT0gMjcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkVkaXRSb3codGhpcy5wcm9wcy5tb2RlbC5jaWQsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FZGl0Um93KHRoaXMucHJvcHMubW9kZWwuY2lkLCBudWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZUNvbW1lbnRGaWVsZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tZW50cyA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdDb21tZW50cycpIHx8IDA7XG4gICAgICAgIGlmICghY29tbWVudHMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdjb21tZW50cycsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY29sLWNvbW1lbnRzJyxcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IENvbW1ldHNWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLnByb3BzLm1vZGVsXG4gICAgICAgICAgICAgICAgICAgIH0pLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2ltZycsIHtcbiAgICAgICAgICAgICAgICBzcmM6ICdjc3MvaW1hZ2VzL2NvbW1lbnRzLnBuZydcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29tbWVudHNcbiAgICAgICAgKTtcbiAgICB9LFxuICAgIHNob3dDb250ZXh0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcbiAgICAgICAgdmFyIHVsID0gJGVsLnBhcmVudCgpO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gJGVsLm9mZnNldCgpO1xuICAgICAgICB1bC5jb250ZXh0TWVudSh7XG4gICAgICAgICAgICB4OiBvZmZzZXQubGVmdCArIDIwLFxuICAgICAgICAgICAgeTogb2Zmc2V0LnRvcFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGZpbmRDb2w6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY29uc3QgY29sID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhc2stY29sJykuZGF0YSgnY29sJyk7XG4gICAgICAgIHJldHVybiBjb2w7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkUm93ID0gdGhpcy5wcm9wcy5zZWxlY3RlZFJvdztcbiAgICAgICAgY29uc3Qgc2hhZG93Qm9yZGVyID0gJzAgMCAwIDJweCAjMzg3OWQ5IGluc2V0JztcblxuICAgICAgICBsZXQgY29sbGFwc2VCdXR0b247XG4gICAgICAgIGlmIChtb2RlbC5pc05lc3RlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc05hbWUgPSAndHJpYW5nbGUgaWNvbiAnICsgKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSA/ICdyaWdodCcgOiAnZG93bicpO1xuICAgICAgICAgICAgY29sbGFwc2VCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPGlcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdjb2xsYXBzZWQnLCAhdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2NvbGxhcHNlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgfX0vPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1bENsYXNzID0gJ3Rhc2snXG4gICAgICAgICAgKyAodGhpcy5wcm9wcy5pc1N1YlRhc2sgPyAnIHN1Yi10YXNrJyA6ICcnKVxuICAgICAgICAgICsgKHRoaXMucHJvcHMubW9kZWwuZ2V0KCdjb2xsYXBzZWQnKSA/ICcgY29sbGFwc2VkJyA6ICcnKVxuICAgICAgICAgICsgKHRoaXMucHJvcHMubW9kZWwuaXNOZXN0ZWQoKSA/ICcgbmVzdGVkJyA6ICcnKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDx1bFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dWxDbGFzc31cbiAgICAgICAgICAgICAgICBkYXRhLWlkPXt0aGlzLnByb3BzLm1vZGVsLmNpZH1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFJvdyhtb2RlbC5jaWQsIHRoaXMuZmluZENvbChlKSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uU2VsZWN0Um93KG1vZGVsLmNpZCwgdGhpcy5maW5kQ29sKGUpKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2hpZ2h0bGlnaHQnKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGxpIGtleT1cImluZm9cIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cImNzcy9pbWFnZXMvaW5mby5wbmdcIiBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9Lz5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJzb3J0aW5kZXhcIiBjbGFzc05hbWU9XCJjb2wtc29ydGluZGV4XCI+XG4gICAgICAgICAgICAgICAgICAgIHttb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgMX1cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJuYW1lXCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLW5hbWVcIiBkYXRhLWNvbD1cIm5hbWVcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6ICh0aGlzLl9maW5kTmVzdGVkTGV2ZWwoKSAqIDEwKSArICdweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnbmFtZScgPyBzaGFkb3dCb3JkZXIgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7Y29sbGFwc2VCdXR0b259XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlRmllbGQoJ25hbWUnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICB7dGhpcy5jcmVhdGVDb21tZW50RmllbGQoKX1cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwiY29tcGxldGVcIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtY29tcGxldGVcIiBkYXRhLWNvbD1cImNvbXBsZXRlXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnY29tcGxldGUnID8gc2hhZG93Qm9yZGVyIDogbnVsbH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlRmllbGQoJ2NvbXBsZXRlJyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwic3RhcnRcIiBjbGFzc05hbWU9XCJ0YXNrLWNvbCBjb2wtc3RhcnRcIiBkYXRhLWNvbD1cInN0YXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnc3RhcnQnID8gc2hhZG93Qm9yZGVyIDogbnVsbH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5fY3JlYXRlRmllbGQoJ3N0YXJ0Jyl9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGkga2V5PVwiZW5kXCIgY2xhc3NOYW1lPVwidGFzay1jb2wgY29sLWVuZFwiIGRhdGEtY29sPVwiZW5kXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tib3hTaGFkb3c6IHNlbGVjdGVkUm93ID09PSAnZW5kJyA/IHNoYWRvd0JvcmRlciA6IG51bGx9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2NyZWF0ZUZpZWxkKCdlbmQnKX1cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJkdXJhdGlvblwiIGNsYXNzTmFtZT1cInRhc2stY29sIGNvbC1kdXJhdGlvblwiIGRhdGEtY29sPVwiZHVyYXRpb25cIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e2JveFNoYWRvdzogc2VsZWN0ZWRSb3cgPT09ICdkdXJhdGlvbicgPyBzaGFkb3dCb3JkZXIgOiBudWxsfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9jcmVhdGVGaWVsZCgnZHVyYXRpb24nKX1cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbTtcbiJdfQ==
