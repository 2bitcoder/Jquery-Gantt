(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

(function (global) {
  var babelHelpers = global.babelHelpers = {};babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
  };babelHelpers.defaults = function (obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
      var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
        Object.defineProperty(obj, key, value);
      }
    }return obj;
  };babelHelpers.createClass = (function () {
    function defineProperties(target, props) {
      for (var key in props) {
        var prop = props[key];prop.configurable = true;if (prop.value) prop.writable = true;
      }Object.defineProperties(target, props);
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  })();babelHelpers.createComputedClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];prop.configurable = true;if (prop.value) prop.writable = true;Object.defineProperty(target, prop.key, prop);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  })();babelHelpers.applyConstructor = function (Constructor, args) {
    var instance = Object.create(Constructor.prototype);var result = Constructor.apply(instance, args);return result != null && (typeof result == "object" || typeof result == "function") ? result : instance;
  };babelHelpers.taggedTemplateLiteral = function (strings, raw) {
    return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } }));
  };babelHelpers.taggedTemplateLiteralLoose = function (strings, raw) {
    strings.raw = raw;return strings;
  };babelHelpers.interopRequire = function (obj) {
    return obj && obj.__esModule ? obj["default"] : obj;
  };babelHelpers.toArray = function (arr) {
    return Array.isArray(arr) ? arr : Array.from(arr);
  };babelHelpers.toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
    } else {
      return Array.from(arr);
    }
  };babelHelpers.slicedToArray = function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      var _arr = [];for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
        _arr.push(_step.value);if (i && _arr.length === i) break;
      }return _arr;
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };babelHelpers.objectWithoutProperties = function (obj, keys) {
    var target = {};for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];
    }return target;
  };babelHelpers.hasOwn = Object.prototype.hasOwnProperty;babelHelpers.slice = Array.prototype.slice;babelHelpers.bind = Function.prototype.bind;babelHelpers.defineProperty = function (obj, key, value) {
    return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  };babelHelpers.asyncToGenerator = function (fn) {
    return function () {
      var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
        var callNext = step.bind(null, "next");var callThrow = step.bind(null, "throw");function step(key, arg) {
          try {
            var info = gen[key](arg);var value = info.value;
          } catch (error) {
            reject(error);return;
          }if (info.done) {
            resolve(value);
          } else {
            Promise.resolve(value).then(callNext, callThrow);
          }
        }callNext();
      });
    };
  };babelHelpers.interopRequireWildcard = function (obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  };babelHelpers._typeof = function (obj) {
    return obj && obj.constructor === Symbol ? "symbol" : typeof obj;
  };babelHelpers._extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }return target;
  };babelHelpers.get = function get(_x, _x2, _x3) {
    var _again = true;

    _function: while (_again) {
      _again = false;
      var object = _x,
          property = _x2,
          receiver = _x3;
      desc = parent = getter = undefined;
      var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);if (parent === null) {
          return undefined;
        } else {
          _x = parent;
          _x2 = property;
          _x3 = receiver;
          _again = true;
          continue _function;
        }
      } else if ("value" in desc && desc.writable) {
        return desc.value;
      } else {
        var getter = desc.get;if (getter === undefined) {
          return undefined;
        }return getter.call(receiver);
      }
    }
  };babelHelpers.set = function set(_x, _x2, _x3, _x4) {
    var _again = true;

    _function: while (_again) {
      _again = false;
      var object = _x,
          property = _x2,
          value = _x3,
          receiver = _x4;
      desc = parent = setter = undefined;
      var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);if (parent !== null) {
          _x = parent;
          _x2 = property;
          _x3 = value;
          _x4 = receiver;
          _again = true;
          continue _function;
        }
      } else if ("value" in desc && desc.writable) {
        return desc.value = value;
      } else {
        var setter = desc.set;if (setter !== undefined) {
          return setter.call(receiver, value);
        }
      }
    }
  };babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };babelHelpers.objectDestructuringEmpty = function (obj) {
    if (obj == null) throw new TypeError("Cannot destructure undefined");
  };babelHelpers.temporalUndefined = {};babelHelpers.temporalAssertDefined = function (val, name, undef) {
    if (val === undef) {
      throw new ReferenceError(name + " is not defined - temporal dead zone");
    }return true;
  };babelHelpers.selfGlobal = typeof global === "undefined" ? self : global;
})(typeof global === "undefined" ? self : global);

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

		data.deps.forEach((function (dep) {
			var beforeModel = this.findWhere({
				name: dep[0]
			});
			var afterModel = this.findWhere({
				name: dep[1]
			});
			this.createDependency(beforeModel, afterModel);
		}).bind(this));
		data.parents.forEach((function (item) {
			var parent = this.findWhere({
				name: item[0]
			});
			var child = this.findWhere({
				name: item[1]
			});
			child.save("parentid", parent.id);;
		}).bind(this));
	}
});

module.exports = TaskCollection;

},{"../models/TaskModel":8}],5:[function(require,module,exports){
"use strict";
require("babel/external-helpers");
var TaskCollection = require("./collections/taskCollection");
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

},{"./clientConfig":2,"./collections/taskCollection":4,"./models/SettingModel":7,"./views/GanttView":12,"babel/external-helpers":1}],6:[function(require,module,exports){
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


var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n<Project xmlns=\"http://schemas.microsoft.com/project\">\r\n    <SaveVersion>14</SaveVersion>\r\n    <Name>Gantt Tasks.xml</Name>\r\n    <Title>Gantt Tasks</Title>\r\n    <CreationDate><%= currentDate %></CreationDate>\r\n    <LastSaved><%= currentDate %></LastSaved>\r\n    <ScheduleFromStart>1</ScheduleFromStart>\r\n    <StartDate><%= startDate %></StartDate>\r\n    <FinishDate><%= finishDate %></FinishDate>\r\n    <FYStartDate>1</FYStartDate>\r\n    <CriticalSlackLimit>0</CriticalSlackLimit>\r\n    <CurrencyDigits>2</CurrencyDigits>\r\n    <CurrencySymbol>$</CurrencySymbol>\r\n    <CurrencyCode>USD</CurrencyCode>\r\n    <CurrencySymbolPosition>0</CurrencySymbolPosition>\r\n    <CalendarUID>1</CalendarUID>\r\n    <DefaultStartTime>08:00:00</DefaultStartTime>\r\n    <DefaultFinishTime>17:00:00</DefaultFinishTime>\r\n    <MinutesPerDay>480</MinutesPerDay>\r\n    <MinutesPerWeek>2400</MinutesPerWeek>\r\n    <DaysPerMonth>20</DaysPerMonth>\r\n    <DefaultTaskType>0</DefaultTaskType>\r\n    <DefaultFixedCostAccrual>3</DefaultFixedCostAccrual>\r\n    <DefaultStandardRate>0</DefaultStandardRate>\r\n    <DefaultOvertimeRate>0</DefaultOvertimeRate>\r\n    <DurationFormat>7</DurationFormat>\r\n    <WorkFormat>2</WorkFormat>\r\n    <EditableActualCosts>0</EditableActualCosts>\r\n    <HonorConstraints>0</HonorConstraints>\r\n    <InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>\r\n    <MultipleCriticalPaths>0</MultipleCriticalPaths>\r\n    <NewTasksEffortDriven>1</NewTasksEffortDriven>\r\n    <NewTasksEstimated>1</NewTasksEstimated>\r\n    <SplitsInProgressTasks>1</SplitsInProgressTasks>\r\n    <SpreadActualCost>0</SpreadActualCost>\r\n    <SpreadPercentComplete>0</SpreadPercentComplete>\r\n    <TaskUpdatesResource>1</TaskUpdatesResource>\r\n    <FiscalYearStart>0</FiscalYearStart>\r\n    <WeekStartDay>0</WeekStartDay>\r\n    <MoveCompletedEndsBack>0</MoveCompletedEndsBack>\r\n    <MoveRemainingStartsBack>0</MoveRemainingStartsBack>\r\n    <MoveRemainingStartsForward>0</MoveRemainingStartsForward>\r\n    <MoveCompletedEndsForward>0</MoveCompletedEndsForward>\r\n    <BaselineForEarnedValue>0</BaselineForEarnedValue>\r\n    <AutoAddNewResourcesAndTasks>1</AutoAddNewResourcesAndTasks>\r\n    <CurrentDate><%= currentDate %></CurrentDate>\r\n    <MicrosoftProjectServerURL>1</MicrosoftProjectServerURL>\r\n    <Autolink>1</Autolink>\r\n    <NewTaskStartDate>0</NewTaskStartDate>\r\n    <NewTasksAreManual>0</NewTasksAreManual>\r\n    <DefaultTaskEVMethod>0</DefaultTaskEVMethod>\r\n    <ProjectExternallyEdited>0</ProjectExternallyEdited>\r\n    <ExtendedCreationDate>1984-01-01T00:00:00</ExtendedCreationDate>\r\n    <ActualsInSync>0</ActualsInSync>\r\n    <RemoveFileProperties>0</RemoveFileProperties>\r\n    <AdminProject>0</AdminProject>\r\n    <UpdateManuallyScheduledTasksWhenEditingLinks>1</UpdateManuallyScheduledTasksWhenEditingLinks>\r\n    <KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>0</KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled>\r\n    <OutlineCodes/>\r\n    <WBSMasks/>\r\n    <ExtendedAttributes>\r\n        <ExtendedAttribute>\r\n            <FieldID>188743752</FieldID>\r\n            <FieldName>Flag1</FieldName>\r\n            <Guid>000039B7-8BBE-4CEB-82C4-FA8C0B400048</Guid>\r\n            <SecondaryPID>255868938</SecondaryPID>\r\n            <SecondaryGuid>000039B7-8BBE-4CEB-82C4-FA8C0F40400A</SecondaryGuid>\r\n        </ExtendedAttribute>\r\n        <ExtendedAttribute>\r\n            <FieldID>188744006</FieldID>\r\n            <FieldName>Text20</FieldName>\r\n            <Guid>000039B7-8BBE-4CEB-82C4-FA8C0B400146</Guid>\r\n            <SecondaryPID>255869047</SecondaryPID>\r\n            <SecondaryGuid>000039B7-8BBE-4CEB-82C4-FA8C0F404077</SecondaryGuid>\r\n        </ExtendedAttribute>\r\n    </ExtendedAttributes>\r\n    <Calendars>\r\n        <Calendar>\r\n            <UID>1</UID>\r\n            <Name>Standard</Name>\r\n            <IsBaseCalendar>1</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>-1</BaseCalendarUID>\r\n            <WeekDays>\r\n                <WeekDay>\r\n                    <DayType>1</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>2</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>3</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>4</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>5</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>6</DayType>\r\n                    <DayWorking>1</DayWorking>\r\n                    <WorkingTimes>\r\n                        <WorkingTime>\r\n                            <FromTime>08:00:00</FromTime>\r\n                            <ToTime>12:00:00</ToTime>\r\n                        </WorkingTime>\r\n                        <WorkingTime>\r\n                            <FromTime>13:00:00</FromTime>\r\n                            <ToTime>17:00:00</ToTime>\r\n                        </WorkingTime>\r\n                    </WorkingTimes>\r\n                </WeekDay>\r\n                <WeekDay>\r\n                    <DayType>7</DayType>\r\n                    <DayWorking>0</DayWorking>\r\n                </WeekDay>\r\n            </WeekDays>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>3</UID>\r\n            <Name>Management</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>4</UID>\r\n            <Name>Project Manager</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>5</UID>\r\n            <Name>Analyst</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>6</UID>\r\n            <Name>Developer</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>7</UID>\r\n            <Name>Testers</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>8</UID>\r\n            <Name>Trainers</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>9</UID>\r\n            <Name>Technical Communicators</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n        <Calendar>\r\n            <UID>10</UID>\r\n            <Name>Deployment Team</Name>\r\n            <IsBaseCalendar>0</IsBaseCalendar>\r\n            <IsBaselineCalendar>0</IsBaselineCalendar>\r\n            <BaseCalendarUID>1</BaseCalendarUID>\r\n        </Calendar>\r\n    </Calendars>\r\n    <Tasks>\r\n        <% tasks.forEach(function(task){ %>\r\n            <Task>\r\n                <UID><%= task.id %></UID>\r\n                <ID><%= task.id %></ID>\r\n                <Name><%= task.name %></Name>\r\n                <Active>1</Active>\r\n                <Manual>0</Manual>\r\n                <Type>1</Type>\r\n                <IsNull>0</IsNull>\r\n                <CreateDate><%= task.start %></CreateDate>\r\n                <WBS>0</WBS>\r\n                <OutlineNumber>0</OutlineNumber>\r\n                <OutlineLevel>0</OutlineLevel>\r\n                <Priority>500</Priority>\r\n                <Start><%= task.start %></Start>\r\n                <Finish><%= task.finish %></Finish>\r\n                <Duration>PT766H0M0S</Duration>\r\n                <ManualStart><%= task.start %></ManualStart>\r\n                <ManualFinish><%= task.finish %></ManualFinish>\r\n                <ManualDuration>PT766H0M0S</ManualDuration>\r\n                <DurationFormat>21</DurationFormat>\r\n                <Work>PT1532H0M0S</Work>\r\n                <ResumeValid>0</ResumeValid>\r\n                <EffortDriven>0</EffortDriven>\r\n                <Recurring>0</Recurring>\r\n                <OverAllocated>0</OverAllocated>\r\n                <Estimated>0</Estimated>\r\n                <Milestone>0</Milestone>\r\n                <Summary>1</Summary>\r\n                <DisplayAsSummary>0</DisplayAsSummary>\r\n                <Critical>1</Critical>\r\n                <IsSubproject>0</IsSubproject>\r\n                <IsSubprojectReadOnly>0</IsSubprojectReadOnly>\r\n                <ExternalTask>0</ExternalTask>\r\n                <EarlyStart><%= task.start %>0</EarlyStart>\r\n                <EarlyFinish><%= task.finish %></EarlyFinish>\r\n                <LateStart><%= task.start %></LateStart>\r\n                <LateFinish><%= task.finish %></LateFinish>\r\n                <StartVariance>0</StartVariance>\r\n                <FinishVariance>0</FinishVariance>\r\n                <WorkVariance>91920000.00</WorkVariance>\r\n                <FreeSlack>0</FreeSlack>\r\n                <TotalSlack>0</TotalSlack>\r\n                <StartSlack>0</StartSlack>\r\n                <FinishSlack>0</FinishSlack>\r\n                <FixedCost>0</FixedCost>\r\n                <FixedCostAccrual>3</FixedCostAccrual>\r\n                <PercentComplete>0</PercentComplete>\r\n                <PercentWorkComplete>0</PercentWorkComplete>\r\n                <Cost>0</Cost>\r\n                <OvertimeCost>0</OvertimeCost>\r\n                <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n                <ActualDuration>PT0H0M0S</ActualDuration>\r\n                <ActualCost>0</ActualCost>\r\n                <ActualOvertimeCost>0</ActualOvertimeCost>\r\n                <ActualWork>PT0H0M0S</ActualWork>\r\n                <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n                <RegularWork>PT1532H0M0S</RegularWork>\r\n                <RemainingDuration>PT766H0M0S</RemainingDuration>\r\n                <RemainingCost>0</RemainingCost>\r\n                <RemainingWork>PT1532H0M0S</RemainingWork>\r\n                <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n                <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n                <ACWP>0.00</ACWP>\r\n                <CV>0.00</CV>\r\n                <ConstraintType>0</ConstraintType>\r\n                <CalendarUID>-1</CalendarUID>\r\n                <LevelAssignments>1</LevelAssignments>\r\n                <LevelingCanSplit>1</LevelingCanSplit>\r\n                <LevelingDelay>0</LevelingDelay>\r\n                <LevelingDelayFormat>8</LevelingDelayFormat>\r\n                <IgnoreResourceCalendar>0</IgnoreResourceCalendar>\r\n                <HideBar>0</HideBar>\r\n                <Rollup>0</Rollup>\r\n                <BCWS>0.00</BCWS>\r\n                <BCWP>0.00</BCWP>\r\n                <PhysicalPercentComplete>0</PhysicalPercentComplete>\r\n                <EarnedValueMethod>0</EarnedValueMethod>\r\n                <IsPublished>0</IsPublished>\r\n                <CommitmentType>0</CommitmentType>\r\n            </Task><% }); %>\r\n    </Tasks>\r\n    <Resources>\r\n        <Resource>\r\n            <UID>0</UID>\r\n            <ID>0</ID>\r\n            <Type>1</Type>\r\n            <IsNull>0</IsNull>\r\n            <WorkGroup>0</WorkGroup>\r\n            <MaxUnits>1.00</MaxUnits>\r\n            <PeakUnits>0.00</PeakUnits>\r\n            <OverAllocated>0</OverAllocated>\r\n            <CanLevel>1</CanLevel>\r\n            <AccrueAt>3</AccrueAt>\r\n            <Work>PT0H0M0S</Work>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <StandardRate>0</StandardRate>\r\n            <StandardRateFormat>2</StandardRateFormat>\r\n            <Cost>0</Cost>\r\n            <OvertimeRate>0</OvertimeRate>\r\n            <OvertimeRateFormat>2</OvertimeRateFormat>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <CostPerUse>0</CostPerUse>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <CostVariance>0</CostVariance>\r\n            <SV>0.00</SV>\r\n            <CV>0.00</CV>\r\n            <ACWP>0.00</ACWP>\r\n            <CalendarUID>2</CalendarUID>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <IsGeneric>0</IsGeneric>\r\n            <IsInactive>0</IsInactive>\r\n            <IsEnterprise>0</IsEnterprise>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate>2012-08-07T08:59:00</CreationDate>\r\n            <IsCostResource>0</IsCostResource>\r\n            <IsBudget>0</IsBudget>\r\n        </Resource>\r\n    </Resources>\r\n    <Assignments>\r\n        <Assignment>\r\n            <UID>6</UID>\r\n            <TaskUID>6</TaskUID>\r\n            <ResourceUID>-65535</ResourceUID>\r\n            <PercentWorkComplete>0</PercentWorkComplete>\r\n            <ActualCost>0</ActualCost>\r\n            <ActualOvertimeCost>0</ActualOvertimeCost>\r\n            <ActualOvertimeWork>PT0H0M0S</ActualOvertimeWork>\r\n            <ActualWork>PT0H0M0S</ActualWork>\r\n            <ACWP>0.00</ACWP>\r\n            <Confirmed>0</Confirmed>\r\n            <Cost>0</Cost>\r\n            <CostRateTable>0</CostRateTable>\r\n            <RateScale>0</RateScale>\r\n            <CostVariance>0</CostVariance>\r\n            <CV>0.00</CV>\r\n            <Delay>0</Delay>\r\n            <Finish>2014-04-18T12:00:00</Finish>\r\n            <FinishVariance>0</FinishVariance>\r\n            <WorkVariance>0.00</WorkVariance>\r\n            <HasFixedRateUnits>1</HasFixedRateUnits>\r\n            <FixedMaterial>0</FixedMaterial>\r\n            <LevelingDelay>0</LevelingDelay>\r\n            <LevelingDelayFormat>7</LevelingDelayFormat>\r\n            <LinkedFields>0</LinkedFields>\r\n            <Milestone>1</Milestone>\r\n            <Overallocated>0</Overallocated>\r\n            <OvertimeCost>0</OvertimeCost>\r\n            <OvertimeWork>PT0H0M0S</OvertimeWork>\r\n            <RegularWork>PT0H0M0S</RegularWork>\r\n            <RemainingCost>0</RemainingCost>\r\n            <RemainingOvertimeCost>0</RemainingOvertimeCost>\r\n            <RemainingOvertimeWork>PT0H0M0S</RemainingOvertimeWork>\r\n            <RemainingWork>PT0H0M0S</RemainingWork>\r\n            <ResponsePending>0</ResponsePending>\r\n            <Start>2014-04-18T12:00:00</Start>\r\n            <StartVariance>0</StartVariance>\r\n            <Units>1</Units>\r\n            <UpdateNeeded>0</UpdateNeeded>\r\n            <VAC>0.00</VAC>\r\n            <Work>PT0H0M0S</Work>\r\n            <WorkContour>0</WorkContour>\r\n            <BCWS>0.00</BCWS>\r\n            <BCWP>0.00</BCWP>\r\n            <BookingType>0</BookingType>\r\n            <CreationDate>2012-08-07T08:59:00</CreationDate>\r\n            <BudgetCost>0</BudgetCost>\r\n            <BudgetWork>PT0H0M0S</BudgetWork>\r\n        </Assignment>\r\n    </Assignments>\r\n</Project>";
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
            complete: xmlItem.PercentComplete[0]._text
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
        uids[xmlItem.UID[0]._text] = xmlItem.Name[0]._text.toString();
        outlines[xmlItem.OutlineNumber[0]._text.toString()] = xmlItem.Name[0]._text;
    });
    _.each(obj.Project[0].Tasks[0].Task, function (xmlItem) {
        if (!xmlItem.Name) {
            return;
        }
        var name = xmlItem.Name[0]._text;
        if (xmlItem.PredecessorLink) {
            deps.push([uids[xmlItem.PredecessorLink[0].PredecessorUID[0]._text], name]);
        }
        var outline = xmlItem.OutlineNumber[0]._text.toString();
        if (outline.indexOf(".") !== -1) {
            var parentOutline = outline.slice(0, outline.lastIndexOf("."));
            parents.push([outlines[parentOutline], name]);
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
            name: task.name,
            start: task.start.toISOString(),
            end: task.end.toISOString()
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
        this.progress(0);
        // this is some sort of callback hell!!
        // we need timeouts for better user experience
        // I think user want to see animated progress bar
        // but without timeouts it is not possible, right?
        setTimeout((function () {
            this.progress(21);
            var col = this.collection;
            var data = parseXML(this.xmlData);
            data = this._prepareData(data);

            setTimeout((function () {
                this.progress(43);
                col.importTasks(data, (function () {
                    this.progress(51);
                    setTimeout((function () {
                        this.progress(67);
                        var deps = parseDepsFromXML(this.xmlData);
                        setTimeout((function () {
                            this.progress(95);
                            col.createDeps(deps);
                            setTimeout((function () {
                                this.progress(100);
                                this.importing = false;
                                $("#msimport").modal("hide");
                            }).bind(this), 5);
                        }).bind(this), 5);
                    }).bind(this), 5);
                }).bind(this));
            }).bind(this), 5);
        }).bind(this), 5);
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
var ReportsMenuView = require("./ReportsMenuView");

var TopMenuView = Backbone.View.extend({
    initialize: function initialize(params) {
        new ZoomMenuView(params).render();
        new GroupingMenuView(params).render();
        new FilterMenuView(params).render();
        new MSProjectMenuView(params).render();
        new ReportsMenuView(params).render();
    }
});

module.exports = TopMenuView;

},{"./FilterMenuView":16,"./GroupingMenuView":17,"./MSProjectMenuView":18,"./ReportsMenuView":19,"./ZoomMenuView":21}],21:[function(require,module,exports){
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
            //            x : this._leftPadding,
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
        var shape = new Konva.Shape({
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

        this.Blayer.add(back).add(shape);
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
    _initSettingsEvents: function _initSettingsEvents() {
        this.listenTo(this.settings, "change:interval change:dpi", function () {
            this._updateStageAttrs();
            this._cacheBackground();
        });

        this.listenTo(this.settings, "change:width", function () {
            this._updateStageAttrs();
            this._cacheBackground();
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
            className: "task" + (this.props.isSubTask ? " sub-task" : ""),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvbm9kZV9tb2R1bGVzL2JhYmVsL2V4dGVybmFsLWhlbHBlcnMuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NsaWVudENvbmZpZy5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvY29sbGVjdGlvbnMvUmVzb3VyY2VSZWZlcmVuY2VDb2xsZWN0aW9uLmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9jb2xsZWN0aW9ucy90YXNrQ29sbGVjdGlvbi5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvZmFrZV9kZmYxMDIxLmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvUmVzb3VyY2VSZWZlcmVuY2UuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9TZXR0aW5nTW9kZWwuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL21vZGVscy9UYXNrTW9kZWwuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3V0aWxzL3V0aWwuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3V0aWxzL3htbFdvcmtlci5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvQ29tbWVudHNWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9HYW50dFZpZXcuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL01vZGFsVGFza0VkaXRWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ob3RpZmljYXRpb25zLmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9SZXNvdXJjZXNFZGl0b3IuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL1RvcE1lbnVWaWV3L0ZpbHRlck1lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9Hcm91cGluZ01lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9NU1Byb2plY3RNZW51Vmlldy5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvUmVwb3J0c01lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9Ub3BNZW51Vmlldy9Ub3BNZW51Vmlldy5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvVG9wTWVudVZpZXcvWm9vbU1lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9BbG9uZVRhc2tWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9CYXNpY1Rhc2tWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9Db25uZWN0b3JWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXNDaGFydC9HYW50dENoYXJ0Vmlldy5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzQ2hhcnQvTmVzdGVkVGFza1ZpZXcuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3LmpzIiwiYzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL0RhdGVQaWNrZXIuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvTmVzdGVkVGFzay5qcyIsImM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9TaWRlUGFuZWwuanMiLCJjOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvVGFza0l0ZW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLENBQUMsVUFBUyxNQUFNLEVBQUM7QUFBQyxNQUFJLFlBQVksR0FBQyxNQUFNLENBQUMsWUFBWSxHQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFB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RyxHQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7R0FBQyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsR0FBQyxVQUFTLEdBQUcsRUFBQztBQUFDLFFBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLElBQUksR0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUE7S0FBQyxNQUFJO0FBQUMsYUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQUM7R0FBQyxDQUFDLFlBQVksQ0FBQyxhQUFhLEdBQUMsVUFBUyxHQUFHLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFDO0FBQUMsYUFBTyxHQUFHLENBQUE7S0FBQyxNQUFLLElBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUM7QUFBQyxVQUFJLElBQUksR0FBQyxFQUFFLENBQUMsS0FBSSxJQUFJLFNBQVMsR0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFBLENBQUUsSUFBSSxHQUFFO0FBQUMsWUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBRyxDQUFDLElBQUUsSUFBSSxDQUFDLE1BQU0sS0FBRyxDQUFDLEVBQUMsTUFBSztPQUFDLE9BQU8sSUFBSSxDQUFBO0tBQUMsTUFBSTtBQUFDLFlBQU0sSUFBSSxTQUFTLENBQUMsc0RBQXNELENBQUMsQ0FBQTtLQUFDO0dBQUMsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEdBQUMsVUFBUyxHQUFHLEVBQUMsSUFBSSxFQUFDO0FBQUMsUUFBSSxNQUFNLEdBQUMsRUFBRSxDQUFDLEtBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFDO0FBQUMsVUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxTQUFTLElBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQyxFQUFDLFNBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE9BQU8sTUFBTSxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksR0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxHQUFDLFVBQVMsR0FBRyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUM7QUFBQyxXQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLElBQUksRUFBQyxZQUFZLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEdBQUMsVUFBUyxFQUFFLEVBQUM7QUFBQyxXQUFPLFlBQVU7QUFBQyxVQUFJLEdBQUcsR0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFDLE1BQU0sRUFBQztBQUFDLFlBQUksUUFBUSxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksU0FBUyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUM7QUFBQyxjQUFHO0FBQUMsZ0JBQUksSUFBSSxHQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO1dBQUMsQ0FBQSxPQUFNLEtBQUssRUFBQztBQUFDLGtCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTTtXQUFDLElBQUcsSUFBSSxDQUFDLElBQUksRUFBQztBQUFDLG1CQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7V0FBQyxNQUFJO0FBQUMsbUJBQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxTQUFTLENBQUMsQ0FBQTtXQUFDO1NBQUMsUUFBUSxFQUFFLENBQUE7T0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEdBQUMsVUFBUyxHQUFHLEVBQUM7QUFBQyxXQUFPLEdBQUcsSUFBRSxHQUFHLENBQUMsVUFBVSxHQUFDLEdBQUcsR0FBQyxFQUFDLFNBQVMsRUFBQyxHQUFHLEVBQUMsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBQyxVQUFTLEdBQUcsRUFBQztBQUFDLFdBQU8sR0FBRyxJQUFFLEdBQUcsQ0FBQyxXQUFXLEtBQUcsTUFBTSxHQUFDLFFBQVEsR0FBQyxPQUFPLEdBQUcsQ0FBQTtHQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBQyxNQUFNLENBQUMsTUFBTSxJQUFFLFVBQVMsTUFBTSxFQUFDO0FBQUMsU0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7QUFBQyxVQUFJLE1BQU0sR0FBQyxTQUFT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OUIsWUFBUyxHQUFHLEVBQUUsQ0FBQztBQUNmLFdBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELE9BQUksR0FBRyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ3BELFFBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLFFBQVEsQ0FBQztBQUNsQyxNQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlDLE9BQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ3JDLFFBQUssQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDeEMsUUFBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM1RCxRQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0QsTUFBRyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM3QyxRQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUMsVUFBTyxHQUFHLFVBQVMsSUFBSSxFQUFDO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJ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LEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO0FBQ3RCLGVBQUcsRUFBRyxPQUFPO0FBQ2IscUJBQVMsRUFBRyxXQUFXO1NBQzFCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUM5QixLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRTtBQUN0QixlQUFHLEVBQUcsS0FBSztBQUNYLHFCQUFTLEVBQUcsU0FBUztTQUN4QixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDNUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsZUFBRyxFQUFHLFVBQVU7QUFDaEIscUJBQVMsRUFBRyxjQUFjO1NBQzdCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUNwQyxDQUFDO0tBQ1Q7Q0FDSixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKGdsb2JhbCl7dmFyIGJhYmVsSGVscGVycz1nbG9iYWwuYmFiZWxIZWxwZXJzPXt9O2JhYmVsSGVscGVycy5pbmhlcml0cz1mdW5jdGlvbihzdWJDbGFzcyxzdXBlckNsYXNzKXtpZih0eXBlb2Ygc3VwZXJDbGFzcyE9PVwiZnVuY3Rpb25cIiYmc3VwZXJDbGFzcyE9PW51bGwpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiBzdXBlckNsYXNzKX1zdWJDbGFzcy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzJiZzdXBlckNsYXNzLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnN1YkNsYXNzLGVudW1lcmFibGU6ZmFsc2Usd3JpdGFibGU6dHJ1ZSxjb25maWd1cmFibGU6dHJ1ZX19KTtpZihzdXBlckNsYXNzKXN1YkNsYXNzLl9fcHJvdG9fXz1zdXBlckNsYXNzfTtiYWJlbEhlbHBlcnMuZGVmYXVsdHM9ZnVuY3Rpb24ob2JqLGRlZmF1bHRzKXt2YXIga2V5cz1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7Zm9yKHZhciBpPTA7aTxrZXlzLmxlbmd0aDtpKyspe3ZhciBrZXk9a2V5c1tpXTt2YXIgdmFsdWU9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cyxrZXkpO2lmKHZhbHVlJiZ2YWx1ZS5jb25maWd1cmFibGUmJm9ialtrZXldPT09dW5kZWZpbmVkKXtPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLGtleSx2YWx1ZSl9fXJldHVybiBvYmp9O2JhYmVsSGVscGVycy5jcmVhdGVDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGtleSBpbiBwcm9wcyl7dmFyIHByb3A9cHJvcHNba2V5XTtwcm9wLmNvbmZpZ3VyYWJsZT10cnVlO2lmKHByb3AudmFsdWUpcHJvcC53cml0YWJsZT10cnVlfU9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl9cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuY3JlYXRlQ29tcHV0ZWRDbGFzcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LHByb3BzKXtmb3IodmFyIGk9MDtpPHByb3BzLmxlbmd0aDtpKyspe3ZhciBwcm9wPXByb3BzW2ldO3Byb3AuY29uZmlndXJhYmxlPXRydWU7aWYocHJvcC52YWx1ZSlwcm9wLndyaXRhYmxlPXRydWU7T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wLmtleSxwcm9wKX19cmV0dXJuIGZ1bmN0aW9uKENvbnN0cnVjdG9yLHByb3RvUHJvcHMsc3RhdGljUHJvcHMpe2lmKHByb3RvUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3RvcixzdGF0aWNQcm9wcyk7cmV0dXJuIENvbnN0cnVjdG9yfX0oKTtiYWJlbEhlbHBlcnMuYXBwbHlDb25zdHJ1Y3Rvcj1mdW5jdGlvbihDb25zdHJ1Y3RvcixhcmdzKXt2YXIgaW5zdGFuY2U9T2JqZWN0LmNyZWF0ZShDb25zdHJ1Y3Rvci5wcm90b3R5cGUpO3ZhciByZXN1bHQ9Q29uc3RydWN0b3IuYXBwbHkoaW5zdGFuY2UsYXJncyk7cmV0dXJuIHJlc3VsdCE9bnVsbCYmKHR5cGVvZiByZXN1bHQ9PVwib2JqZWN0XCJ8fHR5cGVvZiByZXN1bHQ9PVwiZnVuY3Rpb25cIik/cmVzdWx0Omluc3RhbmNlfTtiYWJlbEhlbHBlcnMudGFnZ2VkVGVtcGxhdGVMaXRlcmFsPWZ1bmN0aW9uKHN0cmluZ3MscmF3KXtyZXR1cm4gT2JqZWN0LmZyZWV6ZShPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHJpbmdzLHtyYXc6e3ZhbHVlOk9iamVjdC5mcmVlemUocmF3KX19KSl9O2JhYmVsSGVscGVycy50YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZT1mdW5jdGlvbihzdHJpbmdzLHJhdyl7c3RyaW5ncy5yYXc9cmF3O3JldHVybiBzdHJpbmdzfTtiYWJlbEhlbHBlcnMuaW50ZXJvcFJlcXVpcmU9ZnVuY3Rpb24ob2JqKXtyZXR1cm4gb2JqJiZvYmouX19lc01vZHVsZT9vYmpbXCJkZWZhdWx0XCJdOm9ian07YmFiZWxIZWxwZXJzLnRvQXJyYXk9ZnVuY3Rpb24oYXJyKXtyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpP2FycjpBcnJheS5mcm9tKGFycil9O2JhYmVsSGVscGVycy50b0NvbnN1bWFibGVBcnJheT1mdW5jdGlvbihhcnIpe2lmKEFycmF5LmlzQXJyYXkoYXJyKSl7Zm9yKHZhciBpPTAsYXJyMj1BcnJheShhcnIubGVuZ3RoKTtpPGFyci5sZW5ndGg7aSsrKWFycjJbaV09YXJyW2ldO3JldHVybiBhcnIyfWVsc2V7cmV0dXJuIEFycmF5LmZyb20oYXJyKX19O2JhYmVsSGVscGVycy5zbGljZWRUb0FycmF5PWZ1bmN0aW9uKGFycixpKXtpZihBcnJheS5pc0FycmF5KGFycikpe3JldHVybiBhcnJ9ZWxzZSBpZihTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpe3ZhciBfYXJyPVtdO2Zvcih2YXIgX2l0ZXJhdG9yPWFycltTeW1ib2wuaXRlcmF0b3JdKCksX3N0ZXA7IShfc3RlcD1faXRlcmF0b3IubmV4dCgpKS5kb25lOyl7X2Fyci5wdXNoKF9zdGVwLnZhbHVlKTtpZihpJiZfYXJyLmxlbmd0aD09PWkpYnJlYWt9cmV0dXJuIF9hcnJ9ZWxzZXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKX19O2JhYmVsSGVscGVycy5vYmplY3RXaXRob3V0UHJvcGVydGllcz1mdW5jdGlvbihvYmosa2V5cyl7dmFyIHRhcmdldD17fTtmb3IodmFyIGkgaW4gb2JqKXtpZihrZXlzLmluZGV4T2YoaSk+PTApY29udGludWU7aWYoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosaSkpY29udGludWU7dGFyZ2V0W2ldPW9ialtpXX1yZXR1cm4gdGFyZ2V0fTtiYWJlbEhlbHBlcnMuaGFzT3duPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7YmFiZWxIZWxwZXJzLnNsaWNlPUFycmF5LnByb3RvdHlwZS5zbGljZTtiYWJlbEhlbHBlcnMuYmluZD1GdW5jdGlvbi5wcm90b3R5cGUuYmluZDtiYWJlbEhlbHBlcnMuZGVmaW5lUHJvcGVydHk9ZnVuY3Rpb24ob2JqLGtleSx2YWx1ZSl7cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosa2V5LHt2YWx1ZTp2YWx1ZSxlbnVtZXJhYmxlOnRydWUsY29uZmlndXJhYmxlOnRydWUsd3JpdGFibGU6dHJ1ZX0pfTtiYWJlbEhlbHBlcnMuYXN5bmNUb0dlbmVyYXRvcj1mdW5jdGlvbihmbil7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGdlbj1mbi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXt2YXIgY2FsbE5leHQ9c3RlcC5iaW5kKG51bGwsXCJuZXh0XCIpO3ZhciBjYWxsVGhyb3c9c3RlcC5iaW5kKG51bGwsXCJ0aHJvd1wiKTtmdW5jdGlvbiBzdGVwKGtleSxhcmcpe3RyeXt2YXIgaW5mbz1nZW5ba2V5XShhcmcpO3ZhciB2YWx1ZT1pbmZvLnZhbHVlfWNhdGNoKGVycm9yKXtyZWplY3QoZXJyb3IpO3JldHVybn1pZihpbmZvLmRvbmUpe3Jlc29sdmUodmFsdWUpfWVsc2V7UHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGNhbGxOZXh0LGNhbGxUaHJvdyl9fWNhbGxOZXh0KCl9KX19O2JhYmVsSGVscGVycy5pbnRlcm9wUmVxdWlyZVdpbGRjYXJkPWZ1bmN0aW9uKG9iail7cmV0dXJuIG9iaiYmb2JqLl9fZXNNb2R1bGU/b2JqOntcImRlZmF1bHRcIjpvYmp9fTtiYWJlbEhlbHBlcnMuX3R5cGVvZj1mdW5jdGlvbihvYmope3JldHVybiBvYmomJm9iai5jb25zdHJ1Y3Rvcj09PVN5bWJvbD9cInN5bWJvbFwiOnR5cGVvZiBvYmp9O2JhYmVsSGVscGVycy5fZXh0ZW5kcz1PYmplY3QuYXNzaWdufHxmdW5jdGlvbih0YXJnZXQpe2Zvcih2YXIgaT0xO2k8YXJndW1lbnRzLmxlbmd0aDtpKyspe3ZhciBzb3VyY2U9YXJndW1lbnRzW2ldO2Zvcih2YXIga2V5IGluIHNvdXJjZSl7aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSxrZXkpKXt0YXJnZXRba2V5XT1zb3VyY2Vba2V5XX19fXJldHVybiB0YXJnZXR9O2JhYmVsSGVscGVycy5nZXQ9ZnVuY3Rpb24gZ2V0KG9iamVjdCxwcm9wZXJ0eSxyZWNlaXZlcil7dmFyIGRlc2M9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QscHJvcGVydHkpO2lmKGRlc2M9PT11bmRlZmluZWQpe3ZhciBwYXJlbnQ9T2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7aWYocGFyZW50PT09bnVsbCl7cmV0dXJuIHVuZGVmaW5lZH1lbHNle3JldHVybiBnZXQocGFyZW50LHByb3BlcnR5LHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZX1lbHNle3ZhciBnZXR0ZXI9ZGVzYy5nZXQ7aWYoZ2V0dGVyPT09dW5kZWZpbmVkKXtyZXR1cm4gdW5kZWZpbmVkfXJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcil9fTtiYWJlbEhlbHBlcnMuc2V0PWZ1bmN0aW9uIHNldChvYmplY3QscHJvcGVydHksdmFsdWUscmVjZWl2ZXIpe3ZhciBkZXNjPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LHByb3BlcnR5KTtpZihkZXNjPT09dW5kZWZpbmVkKXt2YXIgcGFyZW50PU9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO2lmKHBhcmVudCE9PW51bGwpe3JldHVybiBzZXQocGFyZW50LHByb3BlcnR5LHZhbHVlLHJlY2VpdmVyKX19ZWxzZSBpZihcInZhbHVlXCJpbiBkZXNjJiZkZXNjLndyaXRhYmxlKXtyZXR1cm4gZGVzYy52YWx1ZT12YWx1ZX1lbHNle3ZhciBzZXR0ZXI9ZGVzYy5zZXQ7aWYoc2V0dGVyIT09dW5kZWZpbmVkKXtyZXR1cm4gc2V0dGVyLmNhbGwocmVjZWl2ZXIsdmFsdWUpfX19O2JhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjaz1mdW5jdGlvbihpbnN0YW5jZSxDb25zdHJ1Y3Rvcil7aWYoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX19O2JhYmVsSGVscGVycy5vYmplY3REZXN0cnVjdHVyaW5nRW1wdHk9ZnVuY3Rpb24ob2JqKXtpZihvYmo9PW51bGwpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBkZXN0cnVjdHVyZSB1bmRlZmluZWRcIil9O2JhYmVsSGVscGVycy50ZW1wb3JhbFVuZGVmaW5lZD17fTtiYWJlbEhlbHBlcnMudGVtcG9yYWxBc3NlcnREZWZpbmVkPWZ1bmN0aW9uKHZhbCxuYW1lLHVuZGVmKXtpZih2YWw9PT11bmRlZil7dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG5hbWUrXCIgaXMgbm90IGRlZmluZWQgLSB0ZW1wb3JhbCBkZWFkIHpvbmVcIil9cmV0dXJuIHRydWV9O2JhYmVsSGVscGVycy5zZWxmR2xvYmFsPXR5cGVvZiBnbG9iYWw9PT1cInVuZGVmaW5lZFwiP3NlbGY6Z2xvYmFsfSkodHlwZW9mIGdsb2JhbD09PVwidW5kZWZpbmVkXCI/c2VsZjpnbG9iYWwpOyIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlscy91dGlsJyk7XHJcbnZhciBwYXJhbXMgPSB1dGlsLmdldFVSTFBhcmFtcygpO1xyXG5cclxubGV0IHRhc2tzU3ViVVJMID0gJyc7XHJcbi8vIGRldGVjdCBBUEkgcGFyYW1zIGZyb20gZ2V0LCBlLmcuID9wcm9qZWN0PTE0MyZwcm9maWxlPTE3JnNpdGVrZXk9MmIwMGRhNDZiNTdjMDM5NVxyXG5pZiAocGFyYW1zLnByb2plY3QgJiYgcGFyYW1zLnByb2ZpbGUgJiYgcGFyYW1zLnNpdGVrZXkpIHtcclxuICAgIHRhc2tzU3ViVVJMID0gJy8nICsgcGFyYW1zLnByb2plY3QgKyAnLycgKyBwYXJhbXMucHJvZmlsZSArICcvJyArIHBhcmFtcy5zaXRla2V5O1xyXG59XHJcbmV4cG9ydCB2YXIgdGFza3NVUkwgPSAnYXBpL3Rhc2tzLycgKyB0YXNrc1N1YlVSTDtcclxuXHJcblxyXG5sZXQgY29uZmlnU3ViVVJMID0gJyc7XHJcbmlmICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUuaW5kZXhPZignbG9jYWxob3N0JykgPT09IC0xKSB7XHJcbiAgICBjb25maWdTdWJVUkwgPSAnL3dicy8nICsgcGFyYW1zLnByb2plY3QgKyAnLycgKyBwYXJhbXMuc2l0ZWtleTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBjb25maWdVUkwgPSAnL2FwaS9HYW50dENvbmZpZycgKyBjb25maWdTdWJVUkw7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlc291cmNlUmVmZXJlbmNlTW9kZWwgPSByZXF1aXJlKCcuLi9tb2RlbHMvUmVzb3VyY2VSZWZlcmVuY2UnKTtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcblxudmFyIENvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgdXJsIDogJ2FwaS9yZXNvdXJjZXMvJyArIChwYXJhbXMucHJvamVjdCB8fCAxKSArICcvJyArIChwYXJhbXMucHJvZmlsZSB8fCAxKSxcblx0bW9kZWw6IFJlc291cmNlUmVmZXJlbmNlTW9kZWwsXG4gICAgaWRBdHRyaWJ1dGUgOiAnSUQnLFxuICAgIHVwZGF0ZVJlc291cmNlc0ZvclRhc2sgOiBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbGQgcmVmZXJlbmNlc1xuICAgICAgICB0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHJlZikge1xuICAgICAgICAgICAgaWYgKHJlZi5nZXQoJ1dCU0lEJykudG9TdHJpbmcoKSAhPT0gdGFzay5pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlzT2xkID0gdGFzay5nZXQoJ3Jlc291cmNlcycpLmluZGV4T2YocmVmLmdldCgnUmVzSUQnKSk7XG4gICAgICAgICAgICBpZiAoaXNPbGQpIHtcbiAgICAgICAgICAgICAgICByZWYuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgLy8gYWRkIG5ldyByZWZlcmVuY2VzXG4gICAgICAgIHRhc2suZ2V0KCdyZXNvdXJjZXMnKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc0lkKSB7XG4gICAgICAgICAgICB2YXIgaXNFeGlzdCA9IHRoaXMuZmluZFdoZXJlKHtSZXNJRCA6IHJlc0lkfSk7XG4gICAgICAgICAgICBpZiAoIWlzRXhpc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZCh7XG4gICAgICAgICAgICAgICAgICAgIFJlc0lEIDogcmVzSWQsXG4gICAgICAgICAgICAgICAgICAgIFdCU0lEIDogdGFzay5pZC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgcGFyc2UgOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCAgPSBbXTtcbiAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5SZXNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbihyZXNJdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHJlc0l0ZW07XG4gICAgICAgICAgICAgICAgb2JqLldCU0lEID0gaXRlbS5XQlNJRDtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChvYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb247XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgVGFza01vZGVsID0gcmVxdWlyZSgnLi4vbW9kZWxzL1Rhc2tNb2RlbCcpO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdHVybCA6ICdhcGkvdGFza3MnLFxuXHRtb2RlbDogVGFza01vZGVsLFxuXHRpbml0aWFsaXplIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xuXHR9LFxuXHRjb21wYXJhdG9yIDogZnVuY3Rpb24obW9kZWwpIHtcblx0XHRyZXR1cm4gbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0bGlua0NoaWxkcmVuIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICghdGFzay5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHBhcmVudFRhc2sgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAocGFyZW50VGFzaykge1xuXHRcdFx0XHRpZiAocGFyZW50VGFzayA9PT0gdGFzaykge1xuXHRcdFx0XHRcdHRhc2suc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcmVudFRhc2suY2hpbGRyZW4uYWRkKHRhc2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXNrLnNldCgncGFyZW50aWQnLCAwKTtcblx0XHRcdFx0Y29uc29sZS5lcnJvcigndGFzayBoYXMgcGFyZW50IHdpdGggaWQgJyArIHRhc2suZ2V0KCdwYXJlbnRpZCcpICsgJyAtIGJ1dCB0aGVyZSBpcyBubyBzdWNoIHRhc2snKTtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRfc29ydENoaWxkcmVuIDogZnVuY3Rpb24gKHRhc2ssIHNvcnRJbmRleCkge1xuXHRcdHRhc2suY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcblx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKGNoaWxkLCBzb3J0SW5kZXgpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cmV0dXJuIHNvcnRJbmRleDtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAtMTtcblx0XHR0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcblx0XHRcdGlmICh0YXNrLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXNrLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0c29ydEluZGV4ID0gdGhpcy5fc29ydENoaWxkcmVuKHRhc2ssIHNvcnRJbmRleCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnNvcnQoKTtcblx0fSxcblx0X3Jlc29ydENoaWxkcmVuIDogZnVuY3Rpb24oZGF0YSwgc3RhcnRJbmRleCwgcGFyZW50SUQpIHtcblx0XHR2YXIgc29ydEluZGV4ID0gc3RhcnRJbmRleDtcblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24odGFza0RhdGEpIHtcblx0XHRcdHZhciB0YXNrID0gdGhpcy5nZXQodGFza0RhdGEuaWQpO1xuXHRcdFx0aWYgKHRhc2suZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRJRCkge1xuXHRcdFx0XHR2YXIgbmV3UGFyZW50ID0gdGhpcy5nZXQocGFyZW50SUQpO1xuXHRcdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdFx0bmV3UGFyZW50LmNoaWxkcmVuLmFkZCh0YXNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGFzay5zYXZlKHtcblx0XHRcdFx0c29ydGluZGV4OiArK3NvcnRJbmRleCxcblx0XHRcdFx0cGFyZW50aWQ6IHBhcmVudElEXG5cdFx0XHR9KTtcblx0XHRcdGlmICh0YXNrRGF0YS5jaGlsZHJlbiAmJiB0YXNrRGF0YS5jaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0c29ydEluZGV4ID0gdGhpcy5fcmVzb3J0Q2hpbGRyZW4odGFza0RhdGEuY2hpbGRyZW4sIHNvcnRJbmRleCwgdGFzay5pZCk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRyZXR1cm4gc29ydEluZGV4O1xuXHR9LFxuXHRyZXNvcnQgOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dGhpcy5fcHJldmVudFNvcnRpbmcgPSB0cnVlO1xuXHRcdHRoaXMuX3Jlc29ydENoaWxkcmVuKGRhdGEsIC0xLCAwKTtcblx0XHR0aGlzLl9wcmV2ZW50U29ydGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuc29ydCgpO1xuXHR9LFxuXHRzdWJzY3JpYmUgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBhZGQgZW1wdHkgdGFzayBpZiBubyB0YXNrcyBmcm9tIHNlcnZlclxuICAgICAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldChbe1xuICAgICAgICAgICAgICAgICAgICBuYW1lIDogJ05ldyB0YXNrJ1xuICAgICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdGlmIChtb2RlbC5nZXQoJ3BhcmVudGlkJykpIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IHRoaXMuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG0uaWQgPT09IG1vZGVsLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0XHRtb2RlbC5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdjYW4gbm90IGZpbmQgcGFyZW50IHdpdGggaWQgJyArIG1vZGVsLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRcdFx0bW9kZWwuc2V0KCdwYXJlbnRpZCcsIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAncmVzZXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMubGlua0NoaWxkcmVuKCk7XG5cdFx0XHR0aGlzLmNoZWNrU29ydGVkSW5kZXgoKTtcblx0XHRcdHRoaXMuX2NoZWNrRGVwZW5kZW5jaWVzKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnBhcmVudGlkJywgZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKHRhc2sucGFyZW50KSB7XG5cdFx0XHRcdHRhc2sucGFyZW50LmNoaWxkcmVuLnJlbW92ZSh0YXNrKTtcblx0XHRcdFx0dGFzay5wYXJlbnQgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBuZXdQYXJlbnQgPSB0aGlzLmdldCh0YXNrLmdldCgncGFyZW50aWQnKSk7XG5cdFx0XHRpZiAobmV3UGFyZW50KSB7XG5cdFx0XHRcdG5ld1BhcmVudC5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuX3ByZXZlbnRTb3J0aW5nKSB7XG5cdFx0XHRcdHRoaXMuY2hlY2tTb3J0ZWRJbmRleCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRjcmVhdGVEZXBlbmRlbmN5IDogZnVuY3Rpb24gKGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKSB7XG5cdFx0aWYgKHRoaXMuX2NhbkNyZWF0ZURlcGVuZGVuY2UoYmVmb3JlTW9kZWwsIGFmdGVyTW9kZWwpKSB7XG5cdFx0XHRhZnRlck1vZGVsLmRlcGVuZE9uKGJlZm9yZU1vZGVsKTtcblx0XHR9XG5cdH0sXG5cblx0X2NhbkNyZWF0ZURlcGVuZGVuY2UgOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCkge1xuXHRcdGlmIChiZWZvcmVNb2RlbC5oYXNQYXJlbnQoYWZ0ZXJNb2RlbCkgfHwgYWZ0ZXJNb2RlbC5oYXNQYXJlbnQoYmVmb3JlTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICgoYmVmb3JlTW9kZWwuZ2V0KCdkZXBlbmQnKSA9PT0gYWZ0ZXJNb2RlbC5pZCkgfHxcblx0XHRcdChhZnRlck1vZGVsLmdldCgnZGVwZW5kJykgPT09IGJlZm9yZU1vZGVsLmlkKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0cmVtb3ZlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uKGFmdGVyTW9kZWwpIHtcblx0XHRhZnRlck1vZGVsLmNsZWFyRGVwZW5kZW5jZSgpO1xuXHR9LFxuXHRfY2hlY2tEZXBlbmRlbmNpZXMgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0aWYgKCF0YXNrLmdldCgnZGVwZW5kJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGJlZm9yZU1vZGVsID0gdGhpcy5nZXQodGFzay5nZXQoJ2RlcGVuZCcpKTtcblx0XHRcdGlmICghYmVmb3JlTW9kZWwpIHtcblx0XHRcdFx0dGFzay51bnNldCgnZGVwZW5kJykuc2F2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFzay5kZXBlbmRPbihiZWZvcmVNb2RlbCwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0b3V0ZGVudCA6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgdW5kZXJTdWJsaW5ncyA9IFtdO1xuXHRcdGlmICh0YXNrLnBhcmVudCkge1xuXHRcdFx0dGFzay5wYXJlbnQuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHRpZiAoY2hpbGQuZ2V0KCdzb3J0aW5kZXgnKSA8PSB0YXNrLmdldCgnc29ydGluZGV4JykpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dW5kZXJTdWJsaW5ncy5wdXNoKGNoaWxkKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gdHJ1ZTtcblx0XHR1bmRlclN1YmxpbmdzLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXQoJ2RlcGVuZCcpID09PSB0YXNrLmlkKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuY2xlYXJEZXBlbmRlbmNlKCk7XG4gICAgICAgICAgICB9XG5cdFx0XHRjaGlsZC5zYXZlKCdwYXJlbnRpZCcsIHRhc2suaWQpO1xuXHRcdH0pO1xuXHRcdHRoaXMuX3ByZXZlbnRTb3J0aW5nID0gZmFsc2U7XG5cdFx0aWYgKHRhc2sucGFyZW50ICYmIHRhc2sucGFyZW50LnBhcmVudCkge1xuXHRcdFx0dGFzay5zYXZlKCdwYXJlbnRpZCcsIHRhc2sucGFyZW50LnBhcmVudC5pZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCAwKTtcblx0XHR9XG5cdH0sXG5cdGluZGVudCA6IGZ1bmN0aW9uKHRhc2spIHtcblx0XHR2YXIgcHJldlRhc2ssIGksIG07XG5cdFx0Zm9yIChpID0gdGhpcy5sZW5ndGggLSAxOyBpID49MDsgaS0tKSB7XG5cdFx0XHRtID0gdGhpcy5hdChpKTtcblx0XHRcdGlmICgobS5nZXQoJ3NvcnRpbmRleCcpIDwgdGFzay5nZXQoJ3NvcnRpbmRleCcpKSAmJiAodGFzay5wYXJlbnQgPT09IG0ucGFyZW50KSkge1xuXHRcdFx0XHRwcmV2VGFzayA9IG07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAocHJldlRhc2spIHtcblx0XHRcdHRhc2suc2F2ZSgncGFyZW50aWQnLCBwcmV2VGFzay5pZCk7XG5cdFx0fVxuXHR9LFxuICAgIGltcG9ydFRhc2tzIDogZnVuY3Rpb24odGFza0pTT05hcnJheSwgY2FsbGJhY2spIHtcbiAgICBcdHZhciBzb3J0aW5kZXggPSAwO1xuICAgIFx0aWYgKHRoaXMubGFzdCgpKSB7XG5cdFx0XHRzb3J0aW5kZXggPSB0aGlzLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpO1xuICAgIFx0fVxuICAgICAgICB0YXNrSlNPTmFycmF5LmZvckVhY2goZnVuY3Rpb24odGFza0l0ZW0pIHtcbiAgICAgICAgICAgIHRhc2tJdGVtLnNvcnRpbmRleCA9ICArK3NvcnRpbmRleDtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRhc2tKU09OYXJyYXkubGVuZ3RoO1xuICAgICAgICB2YXIgZG9uZSA9IDA7XG4gICAgICAgIHRoaXMuYWRkKHRhc2tKU09OYXJyYXksIHtwYXJzZSA6IHRydWV9KS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgIHRhc2suc2F2ZSh7fSx7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkb25lICs9MTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUgPT09IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNyZWF0ZURlcHMgOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgZGF0YS5kZXBzLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG4gICAgICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZSA6IGRlcFswXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYWZ0ZXJNb2RlbCA9IHRoaXMuZmluZFdoZXJlKHtcbiAgICAgICAgICAgICAgICBuYW1lIDogZGVwWzFdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRGVwZW5kZW5jeShiZWZvcmVNb2RlbCwgYWZ0ZXJNb2RlbCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIGRhdGEucGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmZpbmRXaGVyZSh7XG4gICAgICAgICAgICAgICAgbmFtZSA6IGl0ZW1bMF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5maW5kV2hlcmUoe1xuICAgICAgICAgICAgICAgIG5hbWUgOiBpdGVtWzFdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNoaWxkLnNhdmUoJ3BhcmVudGlkJywgcGFyZW50LmlkKTs7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0NvbGxlY3Rpb247XG5cbiIsIid1c2Ugc3RyaWN0JztcbnJlcXVpcmUoJ2JhYmVsL2V4dGVybmFsLWhlbHBlcnMnKTtcbnZhciBUYXNrQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24nKTtcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vbW9kZWxzL1NldHRpbmdNb2RlbCcpO1xuXG52YXIgR2FudHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9HYW50dFZpZXcnKTtcbmltcG9ydCB7dGFza3NVUkwsIGNvbmZpZ1VSTH0gZnJvbSAnLi9jbGllbnRDb25maWcnO1xuXG5cbmZ1bmN0aW9uIGxvYWRUYXNrcyh0YXNrcykge1xuICAgIHZhciBkZmQgPSBuZXcgJC5EZWZlcnJlZCgpO1xuXHR0YXNrcy5mZXRjaCh7XG5cdFx0c3VjY2VzcyA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGZkLnJlc29sdmUoKTtcblx0XHR9LFxuXHRcdGVycm9yIDogZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBkZmQucmVqZWN0KGVycik7XG5cdFx0fSxcblx0XHRwYXJzZTogdHJ1ZSxcblx0XHRyZXNldCA6IHRydWVcblx0fSk7XG4gICAgcmV0dXJuIGRmZC5wcm9taXNlKCk7XG59XG5cbmZ1bmN0aW9uIGxvYWRTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgIHJldHVybiAkLmdldEpTT04oY29uZmlnVVJMKVxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgc2V0dGluZ3Muc3RhdHVzZXMgPSBkYXRhO1xuICAgICAgICB9KTtcbn1cblxuXG4kKCgpID0+IHtcblx0bGV0IHRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG4gICAgdGFza3MudXJsID0gdGFza3NVUkw7XG4gICAgbGV0IHNldHRpbmdzID0gbmV3IFNldHRpbmdzKHt9LCB7dGFza3MgOiB0YXNrc30pO1xuXG4gICAgJC53aGVuKGxvYWRUYXNrcyh0YXNrcykpXG4gICAgLnRoZW4oKCkgPT4gbG9hZFNldHRpbmdzKHNldHRpbmdzKSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTdWNjZXNzIGxvYWRpbmcgdGFza3MuJyk7XG4gICAgICAgIG5ldyBHYW50dFZpZXcoe1xuICAgICAgICAgICAgc2V0dGluZ3M6IHNldHRpbmdzLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogdGFza3NcbiAgICAgICAgfSkucmVuZGVyKCk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIGhpZGUgbG9hZGluZ1xuICAgICAgICAkKCcjbG9hZGVyJykuZmFkZU91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gZGlzcGxheSBoZWFkIGFsd2F5cyBvbiB0b3BcbiAgICAgICAgICAgICQoJyNoZWFkJykuY3NzKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA6ICdmaXhlZCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gZW5hYmxlIHNjcm9sbGluZ1xuICAgICAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdob2xkLXNjcm9sbCcpO1xuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nJywgZXJyb3IpO1xuICAgIH0pO1xufSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgUmVzb3VyY2VSZWZlcmVuY2UgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAvLyBtYWluIHBhcmFtc1xyXG4gICAgICAgIFdCU0lEIDogMSwgLy8gdGFzayBpZFxyXG4gICAgICAgIFJlc0lEOiAxLCAvLyByZXNvdXJjZSBpZFxyXG4gICAgICAgIFRTQWN0aXZhdGU6IHRydWUsXHJcblxyXG4gICAgICAgIC8vIHNvbWUgc2VydmVyIHBhcmFtc1xyXG4gICAgICAgIFdCU1Byb2ZpbGVJRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIFBhcnRpdE5vIDogJzJiMDBkYTQ2YjU3YzAzOTUnLCAvLyBoYXZlIG5vIGlkZWEgd2hhdCBpcyB0aGF0XHJcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5XHJcblxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZVJlZmVyZW5jZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxuXHJcbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdGRlZmF1bHRzOiB7XHJcblx0XHRpbnRlcnZhbDogJ2ZpeCcsXHJcblx0XHQvL2RheXMgcGVyIGludGVydmFsXHJcblx0XHRkcGk6IDFcclxuXHR9LFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcclxuXHRcdHRoaXMuc3RhdHVzZXMgPSB1bmRlZmluZWQ7XHJcblx0XHR0aGlzLnNhdHRyID0ge1xyXG5cdFx0XHRoRGF0YToge30sXHJcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcclxuXHRcdFx0ZGF5c1dpZHRoOiA1LFxyXG5cdFx0XHRjZWxsV2lkdGg6IDM1LFxyXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXHJcblx0XHRcdG1heERhdGU6IG5ldyBEYXRlKDAsMCwwKSxcclxuXHRcdFx0Ym91bmRhcnlNaW46IG5ldyBEYXRlKDAsMCwwKSxcclxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcclxuXHRcdFx0Ly9tb250aHMgcGVyIGNlbGxcclxuXHRcdFx0bXBjOiAxXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuc2Rpc3BsYXkgPSB7XHJcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4NixcclxuXHRcdFx0dEhpZGRlbldpZHRoOiAzMDUsXHJcblx0XHRcdHRhYmxlV2lkdGg6IDcxMFxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMudGFza3M7XHJcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xyXG5cdFx0dGhpcy5vbignY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLmNhbGN1bGF0ZUludGVydmFscyk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgY2hhbmdlOmVuZCcsIF8uZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlSW50ZXJ2YWxzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlOndpZHRoJyk7XHJcbiAgICAgICAgfSwgNTAwKSk7XHJcblx0fSxcclxuXHRnZXRTZXR0aW5nOiBmdW5jdGlvbihmcm9tLCBhdHRyKXtcclxuXHRcdGlmKGF0dHIpe1xyXG5cdFx0XHRyZXR1cm4gdGhpc1sncycgKyBmcm9tXVthdHRyXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzWydzJyArIGZyb21dO1xyXG5cdH0sXHJcblx0ZmluZFN0YXR1c0lkIDogZnVuY3Rpb24oc3RhdHVzKSB7XHJcblx0XHRmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG5cdFx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcblx0XHRcdGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBTdGF0dXMnKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuXHRcdFx0XHRcdHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG5cdFx0XHRcdFx0aWYgKHN0YXR1c0l0ZW0uY2ZnX2l0ZW0udG9Mb3dlckNhc2UoKSA9PT0gc3RhdHVzLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuICAgIGZpbmRTdGF0dXNGb3JJZCA6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgU3RhdHVzJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5JRC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09IGlkLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRTdGF0dXNJZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIFN0YXR1cycpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1c0l0ZW0uY0RlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c0l0ZW0uSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHRmaW5kSGVhbHRoSWQgOiBmdW5jdGlvbihoZWFsdGgpIHtcclxuXHRcdGZvcih2YXIgY2F0ZWdvcnkgaW4gdGhpcy5zdGF0dXNlcy5jZmdkYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy5jZmdkYXRhW2NhdGVnb3J5XTtcclxuXHRcdFx0aWYgKGRhdGEuQ2F0ZWdvcnkgPT09ICdUYXNrIEhlYWx0aCcpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG5cdFx0XHRcdFx0dmFyIHN0YXR1c0l0ZW0gPSBkYXRhLmRhdGFbaV07XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzSXRlbS5jZmdfaXRlbS50b0xvd2VyQ2FzZSgpID09PSBoZWFsdGgudG9Mb3dlckNhc2UoKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZEhlYWx0aEZvcklkIDogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICBmb3IodmFyIGNhdGVnb3J5IGluIHRoaXMuc3RhdHVzZXMuY2ZnZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdHVzZXMuY2ZnZGF0YVtjYXRlZ29yeV07XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkNhdGVnb3J5ID09PSAnVGFzayBIZWFsdGgnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXNJdGVtID0gZGF0YS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNJdGVtLklELnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gaWQudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNJdGVtLklEO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaW5kRGVmYXVsdEhlYWx0aElkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yKHZhciBjYXRlZ29yeSBpbiB0aGlzLnN0YXR1c2VzLmNmZ2RhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnN0YXR1c2VzLmNmZ2RhdGFbY2F0ZWdvcnldO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5DYXRlZ29yeSA9PT0gJ1Rhc2sgSGVhbHRoJykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdHVzSXRlbSA9IGRhdGEuZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzSXRlbS5jRGVmYXVsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzSXRlbS5JRDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cdGZpbmRXT0lkIDogZnVuY3Rpb24od28pIHtcclxuXHRcdGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XHJcblx0XHRcdHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuV09OdW1iZXIudG9Mb3dlckNhc2UoKSA9PT0gd28udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuSUQ7XHJcbiAgICAgICAgICAgIH1cclxuXHRcdH1cclxuXHR9LFxyXG4gICAgZmluZFdPRm9ySWQgOiBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnN0YXR1c2VzLndvZGF0YVswXS5kYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuSUQudG9TdHJpbmcoKSA9PT0gaWQudG9TdHJpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuV09OdW1iZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgZmluZERlZmF1bHRXT0lkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzZXMud29kYXRhWzBdLmRhdGFbMF0uSUQ7XHJcbiAgICB9LFxyXG4gICAgZ2V0RGF0ZUZvcm1hdCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAnZGQvbW0veXknO1xyXG4gICAgfSxcclxuXHRjYWxjbWlubWF4OiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBtaW5EYXRlID0gbmV3IERhdGUoKSwgbWF4RGF0ZSA9IG1pbkRhdGUuY2xvbmUoKS5hZGRZZWFycygxKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcclxuXHRcdFx0aWYgKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0bWluRGF0ZT1tb2RlbC5nZXQoJ3N0YXJ0Jyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKG1vZGVsLmdldCgnZW5kJykuY29tcGFyZVRvKG1heERhdGUpID09PSAxKSB7XHJcblx0XHRcdFx0bWF4RGF0ZT1tb2RlbC5nZXQoJ2VuZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuc2F0dHIubWluRGF0ZSA9IG1pbkRhdGU7XHJcblx0XHR0aGlzLnNhdHRyLm1heERhdGUgPSBtYXhEYXRlO1xyXG5cdH0sXHJcblx0c2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZW5kLHNhdHRyPXRoaXMuc2F0dHIsZGF0dHI9dGhpcy5zZGlzcGxheSxkdXJhdGlvbixzaXplLGNlbGxXaWR0aCxkcGkscmV0ZnVuYyxzdGFydCxsYXN0LGk9MCxqPTAsaUxlbj0wLG5leHQ9bnVsbDtcclxuXHRcdFxyXG5cdFx0dmFyIGludGVydmFsID0gdGhpcy5nZXQoJ2ludGVydmFsJyk7XHJcblxyXG5cdFx0aWYgKGludGVydmFsID09PSAnZGFpbHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAxLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDYwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTU7XHJcblx0XHRcdHNhdHRyLmNlbGxXaWR0aCA9IHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsID0gc2F0dHIuZGF5c1dpZHRoO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKDEpO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRzYXR0ci5tcGMgPSAxO1xyXG5cdFx0XHRcclxuXHRcdH0gZWxzZSBpZihpbnRlcnZhbCA9PT0gJ3dlZWtseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDcsIHtzaWxlbnQ6IHRydWV9KTtcclxuXHRcdFx0ZW5kID0gc2F0dHIubWF4RGF0ZS5jbG9uZSgpLmFkZERheXMoMjAgKiA3KTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKS5tb3ZlVG9EYXlPZldlZWsoMSwgLTEpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSA1O1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBzYXR0ci5kYXlzV2lkdGggKiA3O1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoNyk7XHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGludGVydmFsID09PSAnbW9udGhseScpIHtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIDMwLCB7c2lsZW50OiB0cnVlfSk7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDEyICogMzApO1xyXG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbiA9IHNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xICogMjApLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSAyO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAnYXV0byc7XHJcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbCA9IDcgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLm1wYyA9IDE7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygxKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XHJcblx0XHRcdHRoaXMuc2V0KCdkcGknLCAzMCwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCAqIDMwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSAqIDIwKTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4ubW92ZVRvRmlyc3REYXlPZlF1YXJ0ZXIoKTtcclxuXHRcdFx0c2F0dHIuZGF5c1dpZHRoID0gMTtcclxuXHRcdFx0c2F0dHIuY2VsbFdpZHRoID0gJ2F1dG8nO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSAzMCAqIHNhdHRyLmRheXNXaWR0aDtcclxuXHRcdFx0c2F0dHIubXBjID0gMztcclxuXHRcdFx0cmV0ZnVuYyA9IGZ1bmN0aW9uKGRhdGUpe1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDMpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIGlmIChpbnRlcnZhbCA9PT0gJ2ZpeCcpIHtcclxuXHRcdFx0Y2VsbFdpZHRoID0gMzA7XHJcblx0XHRcdGR1cmF0aW9uID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLCBzYXR0ci5tYXhEYXRlKTtcclxuXHRcdFx0c2l6ZSA9IGRhdHRyLnNjcmVlbldpZHRoIC0gZGF0dHIudEhpZGRlbldpZHRoIC0gMTAwO1xyXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGggPSBzaXplIC8gZHVyYXRpb247XHJcblx0XHRcdGRwaSA9IE1hdGgucm91bmQoY2VsbFdpZHRoIC8gc2F0dHIuZGF5c1dpZHRoKTtcclxuXHRcdFx0dGhpcy5zZXQoJ2RwaScsIGRwaSwge3NpbGVudDogdHJ1ZX0pO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSBkcGkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluID0gc2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIgKiBkcGkpO1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHRcdGVuZCA9IHNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDMwICogMTApO1xyXG5cdFx0XHRzYXR0ci5tcGMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKGRwaSAvIDMwKSk7XHJcblx0XHRcdHJldGZ1bmMgPSBmdW5jdGlvbihkYXRlKXtcclxuXHRcdFx0XHRyZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTtcclxuXHRcdFx0fTtcclxuXHRcdH0gZWxzZSBpZiAoaW50ZXJ2YWw9PT0nYXV0bycpIHtcclxuXHRcdFx0ZHBpID0gdGhpcy5nZXQoJ2RwaScpO1xyXG5cdFx0XHRzYXR0ci5jZWxsV2lkdGggPSAoMSArIE1hdGgubG9nKGRwaSkpICogMTI7XHJcblx0XHRcdHNhdHRyLmRheXNXaWR0aCA9IHNhdHRyLmNlbGxXaWR0aCAvIGRwaTtcclxuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW4gPSBzYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMjAgKiBkcGkpO1xyXG5cdFx0XHRlbmQgPSBzYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygzMCAqIDEwKTtcclxuXHRcdFx0c2F0dHIubXBjID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChkcGkgLyAzMCkpO1xyXG5cdFx0XHRyZXRmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdHJldHVybiBkYXRlLmNsb25lKCkuYWRkRGF5cyhkcGkpO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWwgPSBNYXRoLnJvdW5kKDAuMyAqIGRwaSkgKiBzYXR0ci5kYXlzV2lkdGg7XHJcblx0XHR9XHJcblx0XHR2YXIgaERhdGEgPSB7XHJcblx0XHRcdCcxJzogW10sXHJcblx0XHRcdCcyJzogW10sXHJcblx0XHRcdCczJzogW11cclxuXHRcdH07XHJcblx0XHR2YXIgaGRhdGEzID0gW107XHJcblx0XHRcclxuXHRcdHN0YXJ0ID0gc2F0dHIuYm91bmRhcnlNaW47XHJcblxyXG5cdFx0bGFzdCA9IHN0YXJ0O1xyXG5cdFx0aWYgKGludGVydmFsID09PSAnbW9udGhseScgfHwgaW50ZXJ2YWwgPT09ICdxdWFydGVybHknKSB7XHJcblx0XHRcdHZhciBkdXJmdW5jO1xyXG5cdFx0XHRpZiAoaW50ZXJ2YWw9PT0nbW9udGhseScpIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luTW9udGgoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0TW9udGgoKSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkdXJmdW5jID0gZnVuY3Rpb24oZGF0ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERhdGUuZ2V0RGF5c0luUXVhcnRlcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0UXVhcnRlcigpKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblx0XHRcdHdoaWxlIChsYXN0LmNvbXBhcmVUbyhlbmQpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0aGRhdGEzLnB1c2goe1xyXG5cdFx0XHRcdFx0XHRkdXJhdGlvbjogZHVyZnVuYyhsYXN0KSxcclxuXHRcdFx0XHRcdFx0dGV4dDogbGFzdC5nZXREYXRlKClcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XHJcblx0XHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIGludGVydmFsZGF5cyA9IHRoaXMuZ2V0KCdkcGknKTtcclxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNIb2x5ID0gbGFzdC5nZXREYXkoKSA9PT0gNiB8fCBsYXN0LmdldERheSgpID09PSAwO1xyXG5cdFx0XHRcdGhkYXRhMy5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBpbnRlcnZhbGRheXMsXHJcblx0XHRcdFx0XHR0ZXh0OiBsYXN0LmdldERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBob2x5IDogKGludGVydmFsID09PSAnZGFpbHknKSAmJiBpc0hvbHlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRuZXh0ID0gcmV0ZnVuYyhsYXN0KTtcclxuXHRcdFx0XHRsYXN0ID0gbmV4dDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0c2F0dHIuYm91bmRhcnlNYXggPSBlbmQgPSBsYXN0O1xyXG5cdFx0aERhdGFbJzMnXSA9IGhkYXRhMztcclxuXHJcblx0XHQvL2VudGVyIGR1cmF0aW9uIG9mIGZpcnN0IGRhdGUgdG8gZW5kIG9mIHllYXJcclxuXHRcdHZhciBpbnRlciA9IERhdGUuZGF5c2RpZmYoc3RhcnQsIG5ldyBEYXRlKHN0YXJ0LmdldEZ1bGxZZWFyKCksIDExLCAzMSkpO1xyXG5cdFx0aERhdGFbJzEnXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IGludGVyLFxyXG5cdFx0XHR0ZXh0OiBzdGFydC5nZXRGdWxsWWVhcigpXHJcblx0XHR9KTtcclxuXHRcdGZvcihpID0gc3RhcnQuZ2V0RnVsbFllYXIoKSArIDEsIGlMZW4gPSBlbmQuZ2V0RnVsbFllYXIoKTsgaSA8IGlMZW47IGkrKyl7XHJcblx0XHRcdGludGVyID0gRGF0ZS5pc0xlYXBZZWFyKGkpID8gMzY2IDogMzY1O1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBsYXN0IHllYXIgdXB0byBlbmQgZGF0ZVxyXG5cdFx0aWYgKHN0YXJ0LmdldEZ1bGxZZWFyKCkhPT1lbmQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRpbnRlciA9IERhdGUuZGF5c2RpZmYobmV3IERhdGUoZW5kLmdldEZ1bGxZZWFyKCksIDAsIDEpLCBlbmQpO1xyXG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBpbnRlcixcclxuXHRcdFx0XHR0ZXh0OiBlbmQuZ2V0RnVsbFllYXIoKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxyXG5cdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0ZHVyYXRpb246IERhdGUuZGF5c2RpZmYoc3RhcnQsIHN0YXJ0LmNsb25lKCkubW92ZVRvTGFzdERheU9mTW9udGgoKSksXHJcblx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCAnbScpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aiA9IHN0YXJ0LmdldE1vbnRoKCkgKyAxO1xyXG5cdFx0aSA9IHN0YXJ0LmdldEZ1bGxZZWFyKCk7XHJcblx0XHRpTGVuID0gZW5kLmdldEZ1bGxZZWFyKCk7XHJcblx0XHR2YXIgZW5kbW9udGggPSBlbmQuZ2V0TW9udGgoKTtcclxuXHJcblx0XHR3aGlsZSAoaSA8PSBpTGVuKSB7XHJcblx0XHRcdHdoaWxlKGogPCAxMikge1xyXG5cdFx0XHRcdGlmIChpID09PSBpTGVuICYmIGogPT09IGVuZG1vbnRoKSB7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aERhdGFbJzInXS5wdXNoKHtcclxuXHRcdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmdldERheXNJbk1vbnRoKGksIGopLFxyXG5cdFx0XHRcdFx0dGV4dDogdXRpbC5mb3JtYXRkYXRhKGosICdtJylcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRqICs9IDE7XHJcblx0XHRcdH1cclxuXHRcdFx0aSArPSAxO1xyXG5cdFx0XHRqID0gMDtcclxuXHRcdH1cclxuXHRcdGlmIChlbmQuZ2V0TW9udGgoKSAhPT0gc3RhcnQuZ2V0TW9udGgoKSAmJiBlbmQuZ2V0RnVsbFllYXIoKSAhPT0gc3RhcnQuZ2V0RnVsbFllYXIoKSkge1xyXG5cdFx0XHRoRGF0YVsnMiddLnB1c2goe1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLCBlbmQpLFxyXG5cdFx0XHRcdHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShlbmQuZ2V0TW9udGgoKSwgJ20nKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHNhdHRyLmhEYXRhID0gaERhdGE7XHJcblx0fSxcclxuXHRjYWxjdWxhdGVJbnRlcnZhbHM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5jYWxjbWlubWF4KCk7XHJcblx0XHR0aGlzLnNldEF0dHJpYnV0ZXMoKTtcclxuXHR9LFxyXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgZFRvVGV4dD17XHJcblx0XHRcdCdzdGFydCc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQnZW5kJzpmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCdkZC9NTS95eXl5Jyk7XHJcblx0XHRcdH0sXHJcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xyXG5cdFx0XHRcdHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLnN0YXJ0LG1vZGVsLmVuZCkrJyBkJztcclxuXHRcdFx0fSxcclxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0XHRcdHZhciBzdGF0dXNlcz17XHJcblx0XHRcdFx0XHQnMTEwJzonY29tcGxldGUnLFxyXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxyXG5cdFx0XHRcdFx0JzEwOCcgOiAncmVhZHknXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRyZXR1cm4gc3RhdHVzZXNbdmFsdWVdO1xyXG5cdFx0XHR9XHJcblx0XHRcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZmllbGQsdmFsdWUsbW9kZWwpe1xyXG5cdFx0XHRyZXR1cm4gZFRvVGV4dFtmaWVsZF0/ZFRvVGV4dFtmaWVsZF0odmFsdWUsbW9kZWwpOnZhbHVlO1xyXG5cdFx0fTtcclxuXHR9KCkpXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nTW9kZWw7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFJlc0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9jb2xsZWN0aW9ucy9SZXNvdXJjZVJlZmVyZW5jZUNvbGxlY3Rpb24nKTtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXG52YXIgcGFyYW1zID0gdXRpbC5nZXRVUkxQYXJhbXMoKTtcclxuXHJcbnZhciBTdWJUYXNrcyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuICAgIGNvbXBhcmF0b3IgOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbnZhciByZXNMaW5rcyA9IG5ldyBSZXNDb2xsZWN0aW9uKCk7XHJcbnJlc0xpbmtzLmZldGNoKCk7XHJcblxyXG52YXIgVGFza01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgLy8gTUFJTiBQQVJBTVNcclxuICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcclxuICAgICAgICBjb21wbGV0ZTogMCwgIC8vIDAlIC0gMTAwJSBwZXJjZW50c1xyXG4gICAgICAgIHNvcnRpbmRleDogMCwgICAvLyBwbGFjZSBvbiBzaWRlIG1lbnUsIHN0YXJ0cyBmcm9tIDBcclxuICAgICAgICBkZXBlbmQ6IHVuZGVmaW5lZCwgIC8vIGlkIG9mIHRhc2tcclxuICAgICAgICBzdGF0dXM6ICcxMTAnLCAgICAgIC8vIDExMCAtIGNvbXBsZXRlLCAxMDkgIC0gb3BlbiwgMTA4IC0gcmVhZHlcclxuICAgICAgICBzdGFydDogbmV3IERhdGUoKSxcclxuICAgICAgICBlbmQ6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgcGFyZW50aWQ6IDAsXHJcbiAgICAgICAgQ29tbWVudHMgOiAwLFxyXG5cclxuICAgICAgICBjb2xvcjogJyMwMDkwZDMnLCAgIC8vIHVzZXIgY29sb3IsIG5vdCB1c2VkIGZvciBub3dcclxuXHJcbiAgICAgICAgLy8gc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXNcclxuICAgICAgICByZXNvdXJjZXMgOiBbXSwgICAgICAgICAvL2xpc3Qgb2YgaWRcclxuICAgICAgICBoZWFsdGg6IDIxLFxyXG4gICAgICAgIHJlcG9ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdvOiAyLCAgICAgICAgICAgICAgICAgIC8vU2VsZWN0IExpc3QgaW4gcHJvcGVydGllcyBtb2RhbCAgIChjb25maWdkYXRhKVxyXG4gICAgICAgIG1pbGVzdG9uZTogZmFsc2UsICAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgZGVsaXZlcmFibGU6IGZhbHNlLCAgICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuICAgICAgICBmaW5hbmNpYWw6IGZhbHNlLCAgICAgICAvL0NoZWNrIGJveCBpbiBwcm9wZXJ0aWVzIG1vZGFsICh0cnVlL2ZhbHNlKVxyXG4gICAgICAgIHRpbWVzaGVldHM6IGZhbHNlLCAgICAgIC8vQ2hlY2sgYm94IGluIHByb3BlcnRpZXMgbW9kYWwgKHRydWUvZmFsc2UpXHJcbiAgICAgICAgYWN0dGltZXNoZWV0czogZmFsc2UsICAgLy9DaGVjayBib3ggaW4gcHJvcGVydGllcyBtb2RhbCAodHJ1ZS9mYWxzZSlcclxuXHJcbiAgICAgICAgLy8gc2VydmVyIHNwZWNpZmljIHBhcmFtc1xyXG4gICAgICAgIC8vIGRvbid0IHVzZSB0aGVtIG9uIGNsaWVudCBzaWRlXHJcbiAgICAgICAgUHJvamVjdFJlZiA6IHBhcmFtcy5wcm9qZWN0LFxyXG4gICAgICAgIFdCU19JRCA6IHBhcmFtcy5wcm9maWxlLFxyXG4gICAgICAgIHNpdGVrZXk6IHBhcmFtcy5zaXRla2V5LFxyXG5cclxuXHJcbiAgICAgICAgLy8gcGFyYW1zIGZvciBhcHBsaWNhdGlvbiB2aWV3c1xyXG4gICAgICAgIC8vIHNob3VsZCBiZSByZW1vdmVkIGZyb20gSlNPTlxyXG4gICAgICAgIGhpZGRlbiA6IGZhbHNlLFxyXG4gICAgICAgIGNvbGxhcHNlZCA6IGZhbHNlLFxyXG4gICAgICAgIGhpZ2h0bGlnaHQgOiAnJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBzZWxmIHZhbGlkYXRpb25cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlc0xpbmtzLnVwZGF0ZVJlc291cmNlc0ZvclRhc2sodGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTptaWxlc3RvbmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KCdtaWxlc3RvbmUnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0JywgbmV3IERhdGUodGhpcy5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY2hpbGRyZW4gcmVmZXJlbmNlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBuZXcgU3ViVGFza3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KCdtaWxlc3RvbmUnLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92aW5nIHJlZnNcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdjaGFuZ2U6cGFyZW50aWQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ2V0KCdwYXJlbnRpZCcpID09PSB0aGlzLmlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5yZW1vdmUoY2hpbGQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpzb3J0aW5kZXgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja1RpbWUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmNvbGxhcHNlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldCgnY29sbGFwc2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGVja2luZyBuZXN0ZWQgc3RhdGVcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlJywgdGhpcy5fY2hlY2tOZXN0ZWQpO1xyXG5cclxuICAgICAgICAvLyB0aW1lIGNoZWNraW5nXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6Y29tcGxldGUnLCB0aGlzLl9jaGVja0NvbXBsZXRlKTtcclxuICAgIH0sXHJcbiAgICBpc05lc3RlZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgfSxcclxuICAgIHNob3cgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgZmFsc2UpO1xyXG4gICAgfSxcclxuICAgIGhpZGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNldCgnaGlkZGVuJywgdHJ1ZSk7XHJcbiAgICB9LFxyXG4gICAgZGVwZW5kT24gOiBmdW5jdGlvbihiZWZvcmVNb2RlbCwgc2lsZW50KSB7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2RlcGVuZCcsIGJlZm9yZU1vZGVsLmlkKTtcclxuICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdzdGFydCcpIDwgYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVUb1N0YXJ0KGJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXNpbGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuQmVmb3JlTW9kZWwoKTtcclxuICAgIH0sXHJcbiAgICB0b0pTT04gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIganNvbiA9IEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS50b0pTT04uY2FsbCh0aGlzKTtcclxuICAgICAgICBkZWxldGUganNvbi5yZXNvdXJjZXM7XHJcbiAgICAgICAgZGVsZXRlIGpzb24uaGlkZGVuO1xyXG4gICAgICAgIGRlbGV0ZSBqc29uLmNvbGxhcHNlZDtcclxuICAgICAgICBkZWxldGUganNvbi5oaWdodGxpZ2h0O1xyXG4gICAgICAgIHJldHVybiBqc29uO1xyXG4gICAgfSxcclxuICAgIGNsZWFyRGVwZW5kZW5jZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcExpc3RlbmluZyh0aGlzLmJlZm9yZU1vZGVsKTtcclxuICAgICAgICAgICAgdGhpcy51bnNldCgnZGVwZW5kJykuc2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmJlZm9yZU1vZGVsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoYXNQYXJlbnQgOiBmdW5jdGlvbihwYXJlbnRGb3JDaGVjaykge1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcmVudCA9PT0gcGFyZW50Rm9yQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9saXN0ZW5CZWZvcmVNb2RlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGVhckRlcGVuZGVuY2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2U6ZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC51bmRlck1vdmluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGluZmluaXRlIGRlcGVuZCBsb29wXHJcbiAgICAgICAgICAgIHZhciBiZWZvcmUgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgYmVmb3JlcyA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBiZWZvcmUuYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWJlZm9yZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGJlZm9yZXMuaW5kZXhPZihiZWZvcmUpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJlZm9yZXMucHVzaChiZWZvcmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdldCgnc3RhcnQnKSA8IHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdlbmQnKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG9TdGFydCh0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2NoZWNrTmVzdGVkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCduZXN0ZWRTdGF0ZUNoYW5nZScsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHZhciBzdGFydCwgZW5kO1xyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2Uuc3RhcnQpKXtcclxuICAgICAgICAgICAgc3RhcnQgPSBEYXRlLnBhcnNlRXhhY3QodXRpbC5jb3JyZWN0ZGF0ZShyZXNwb25zZS5zdGFydCksJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2UuZW5kKSl7XHJcbiAgICAgICAgICAgIGVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksJ2RkL01NL3l5eXknKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5lbmQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNwb25zZS5zdGFydCA9IHN0YXJ0IDwgZW5kID8gc3RhcnQgOiBlbmQ7XHJcbiAgICAgICAgcmVzcG9uc2UuZW5kID0gc3RhcnQgPCBlbmQgPyBlbmQgOiBzdGFydDtcclxuXHJcbiAgICAgICAgcmVzcG9uc2UucGFyZW50aWQgPSBwYXJzZUludChyZXNwb25zZS5wYXJlbnRpZCB8fCAnMCcsIDEwKTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIG51bGwgcGFyYW1zXHJcbiAgICAgICAgXy5lYWNoKHJlc3BvbnNlLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICBpZiAodmFsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzcG9uc2Vba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcmVzb3VyY2VzIGFzIGxpc3Qgb2YgSURcclxuICAgICAgICB2YXIgaWRzID0gW107XHJcbiAgICAgICAgKHJlc3BvbnNlLlJlc291cmNlcyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihyZXNJbmZvKSB7XHJcbiAgICAgICAgICAgIGlkcy5wdXNoKHJlc0luZm8uUmVzSUQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlc3BvbnNlLlJlc291cmNlcyA9IHVuZGVmaW5lZDtcclxuICAgICAgICByZXNwb25zZS5yZXNvdXJjZXMgPSBpZHM7XHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLm1pbGVzdG9uZSkge1xyXG4gICAgICAgICAgICByZXNwb25zZS5zdGFydCA9IHJlc3BvbnNlLmVuZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfSxcclxuICAgIF9jaGVja1RpbWUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XHJcbiAgICAgICAgdmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFN0YXJ0VGltZSA9IGNoaWxkLmdldCgnc3RhcnQnKTtcclxuICAgICAgICAgICAgdmFyIGNoaWxkRW5kVGltZSA9IGNoaWxkLmdldCgnZW5kJyk7XHJcbiAgICAgICAgICAgIGlmKGNoaWxkU3RhcnRUaW1lIDwgc3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihjaGlsZEVuZFRpbWUgPiBlbmRUaW1lKXtcclxuICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHJcbiAgICAgICAgdGhpcy5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xyXG4gICAgfSxcclxuICAgIF9jaGVja0NvbXBsZXRlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlID0gMDtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmVhY2goZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlICs9IGNoaWxkLmdldCgnY29tcGxldGUnKSAvIGxlbmd0aDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0KCdjb21wbGV0ZScsIE1hdGgucm91bmQoY29tcGxldGUpKTtcclxuICAgIH0sXHJcbiAgICBtb3ZlVG9TdGFydCA6IGZ1bmN0aW9uKG5ld1N0YXJ0KSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZyBpZiBuZXcgc3RhcnQgaXMgdGhlIHNhbWUgYXMgY3VycmVudFxyXG4gICAgICAgIGlmIChuZXdTdGFydC50b0RhdGVTdHJpbmcoKSA9PT0gdGhpcy5nZXQoJ3N0YXJ0JykudG9EYXRlU3RyaW5nKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIG9mZnNldFxyXG4vLyAgICAgICAgdmFyIGRheXNEaWZmID0gTWF0aC5mbG9vcigobmV3U3RhcnQudGltZSgpIC0gdGhpcy5nZXQoJ3N0YXJ0JykudGltZSgpKSAvIDEwMDAgLyA2MCAvIDYwIC8gMjQpXHJcbiAgICAgICAgdmFyIGRheXNEaWZmID0gRGF0ZS5kYXlzZGlmZihuZXdTdGFydCwgdGhpcy5nZXQoJ3N0YXJ0JykpIC0gMTtcclxuICAgICAgICBpZiAobmV3U3RhcnQgPCB0aGlzLmdldCgnc3RhcnQnKSkge1xyXG4gICAgICAgICAgICBkYXlzRGlmZiAqPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoYW5nZSBkYXRlc1xyXG4gICAgICAgIHRoaXMuc2V0KHtcclxuICAgICAgICAgICAgc3RhcnQgOiBuZXdTdGFydC5jbG9uZSgpLFxyXG4gICAgICAgICAgICBlbmQgOiB0aGlzLmdldCgnZW5kJykuY2xvbmUoKS5hZGREYXlzKGRheXNEaWZmKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjaGFuZ2VzIGRhdGVzIGluIGFsbCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMudW5kZXJNb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX21vdmVDaGlsZHJlbihkYXlzRGlmZik7XHJcbiAgICAgICAgdGhpcy51bmRlck1vdmluZyA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIF9tb3ZlQ2hpbGRyZW4gOiBmdW5jdGlvbihkYXlzKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLm1vdmUoZGF5cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZVdpdGhDaGlsZHJlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2F2ZSgpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRhc2suc2F2ZVdpdGhDaGlsZHJlbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIG1vdmUgOiBmdW5jdGlvbihkYXlzKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogdGhpcy5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGREYXlzKGRheXMpLFxyXG4gICAgICAgICAgICBlbmQ6IHRoaXMuZ2V0KCdlbmQnKS5jbG9uZSgpLmFkZERheXMoZGF5cylcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2hpbGRyZW4oZGF5cyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHJcbiIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRvQXNzb2NBcnJheShwcm1zdHIpIHtcblx0dmFyIHBhcmFtcyA9IHt9O1xuXHR2YXIgcHJtYXJyID0gcHJtc3RyLnNwbGl0KCcmJyk7XG5cdHZhciBpLCB0bXBhcnI7XG5cdGZvciAoaSA9IDA7IGkgPCBwcm1hcnIubGVuZ3RoOyBpKyspIHtcblx0XHR0bXBhcnIgPSBwcm1hcnJbaV0uc3BsaXQoJz0nKTtcblx0XHRwYXJhbXNbdG1wYXJyWzBdXSA9IHRtcGFyclsxXTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRVUkxQYXJhbXMgPSBmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0dmFyIHBybXN0ciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpO1xuXHRyZXR1cm4gcHJtc3RyICE9PSBudWxsICYmIHBybXN0ciAhPT0gJycgPyB0cmFuc2Zvcm1Ub0Fzc29jQXJyYXkocHJtc3RyKSA6IHt9O1xufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xyXG52YXIgeG1sID0gZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcveG1sVGVtcGxhdGUueG1sJywgJ3V0ZjgnKTtcclxudmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSh4bWwpO1xyXG5cclxuZnVuY3Rpb24gcGFyc2VYTUxPYmooeG1sU3RyaW5nKSB7XHJcbiAgICB2YXIgb2JqID0geG1sVG9KU09OLnBhcnNlU3RyaW5nKHhtbFN0cmluZyk7XHJcbiAgICB2YXIgdGFza3MgPSBbXTtcclxuICAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgIHRhc2tzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lIDogeG1sSXRlbS5OYW1lWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBzdGFydCA6IHhtbEl0ZW0uU3RhcnRbMF0uX3RleHQsXHJcbiAgICAgICAgICAgIGVuZCA6IHhtbEl0ZW0uRmluaXNoWzBdLl90ZXh0LFxyXG4gICAgICAgICAgICBjb21wbGV0ZSA6IHhtbEl0ZW0uUGVyY2VudENvbXBsZXRlWzBdLl90ZXh0XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0YXNrcztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMucGFyc2VEZXBzRnJvbVhNTCA9IGZ1bmN0aW9uKHhtbFN0cmluZykge1xyXG4gICAgdmFyIG9iaiA9IHhtbFRvSlNPTi5wYXJzZVN0cmluZyh4bWxTdHJpbmcpO1xyXG4gICAgdmFyIHVpZHMgPSB7fTtcclxuICAgIHZhciBvdXRsaW5lcyA9IHt9O1xyXG4gICAgdmFyIGRlcHMgPSBbXTtcclxuICAgIHZhciBwYXJlbnRzID0gW107XHJcbiAgICBfLmVhY2gob2JqLlByb2plY3RbMF0uVGFza3NbMF0uVGFzaywgZnVuY3Rpb24oeG1sSXRlbSkge1xyXG4gICAgICAgIGlmICgheG1sSXRlbS5OYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdWlkc1t4bWxJdGVtLlVJRFswXS5fdGV4dF0gPSB4bWxJdGVtLk5hbWVbMF0uX3RleHQudG9TdHJpbmcoKTtcclxuICAgICAgICBvdXRsaW5lc1t4bWxJdGVtLk91dGxpbmVOdW1iZXJbMF0uX3RleHQudG9TdHJpbmcoKV0gPSB4bWxJdGVtLk5hbWVbMF0uX3RleHQ7XHJcbiAgICB9KTtcclxuICAgIF8uZWFjaChvYmouUHJvamVjdFswXS5UYXNrc1swXS5UYXNrLCBmdW5jdGlvbih4bWxJdGVtKSB7XHJcbiAgICAgICAgaWYgKCF4bWxJdGVtLk5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmFtZSA9IHhtbEl0ZW0uTmFtZVswXS5fdGV4dDtcclxuICAgICAgICBpZiAoeG1sSXRlbS5QcmVkZWNlc3NvckxpbmspIHtcclxuICAgICAgICAgICAgZGVwcy5wdXNoKFt1aWRzW3htbEl0ZW0uUHJlZGVjZXNzb3JMaW5rWzBdLlByZWRlY2Vzc29yVUlEWzBdLl90ZXh0XSwgbmFtZV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb3V0bGluZSA9IHhtbEl0ZW0uT3V0bGluZU51bWJlclswXS5fdGV4dC50b1N0cmluZygpO1xyXG4gICAgICAgIGlmIChvdXRsaW5lLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmVudE91dGxpbmUgPSBvdXRsaW5lLnNsaWNlKDAsb3V0bGluZS5sYXN0SW5kZXhPZignLicpKTtcclxuICAgICAgICAgICAgcGFyZW50cy5wdXNoKFtvdXRsaW5lc1twYXJlbnRPdXRsaW5lXSwgbmFtZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkZXBzIDogZGVwcyxcclxuICAgICAgICBwYXJlbnRzIDogcGFyZW50c1xyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnBhcnNlWE1MT2JqID0gcGFyc2VYTUxPYmo7XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5KU09OVG9YTUwgPSBmdW5jdGlvbihqc29uKSB7XHJcbiAgICB2YXIgc3RhcnQgPSBqc29uWzBdLnN0YXJ0O1xyXG4gICAgdmFyIGVuZCA9IGpzb25bMF0uZW5kO1xyXG4gICAgdmFyIGRhdGEgPSBfLm1hcChqc29uLCBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID4gdGFzay5zdGFydCkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHRhc2suc3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlbmQgPCB0YXNrLmVuZCkge1xyXG4gICAgICAgICAgICBlbmQgPSB0YXNrLmVuZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmFtZSA6IHRhc2submFtZSxcclxuICAgICAgICAgICAgc3RhcnQgOiB0YXNrLnN0YXJ0LnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGVuZCA6IHRhc2suZW5kLnRvSVNPU3RyaW5nKClcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29tcGlsZWQoe1xyXG4gICAgICAgIHRhc2tzIDogZGF0YSxcclxuICAgICAgICBjdXJyZW50RGF0ZSA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICBzdGFydERhdGUgOiBzdGFydCxcclxuICAgICAgICBmaW5pc2hEYXRlIDogZW5kXHJcbiAgICB9KTtcclxufTtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcclxudmFyIHBhcmFtcyA9IHV0aWwuZ2V0VVJMUGFyYW1zKCk7XHJcblxyXG52YXIgQ29tbWVudHNWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3Rhc2tDb21tZW50c01vZGFsJyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuX2ZpbGxEYXRhKCk7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRlbC5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkFwcHJvdmUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkFwcHJvdmUnKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkhpZGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkhpZGUnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25EZW55IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25EZW55Jyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG5cclxuICAgICAgICB2YXIgdXBkYXRlQ291bnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGNvdW50ID0gJChcIiN0YXNrQ29tbWVudHNcIikuY29tbWVudHMoXCJjb3VudFwiKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ0NvbW1lbnRzJywgY291bnQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuICAgICAgICB2YXIgY2FsbGJhY2sgPSB7XHJcbiAgICAgICAgICAgIGFmdGVyRGVsZXRlIDogdXBkYXRlQ291bnQsXHJcbiAgICAgICAgICAgIGFmdGVyQ29tbWVudEFkZCA6IHVwZGF0ZUNvdW50XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLmluZGV4T2YoJ2xvY2FsaG9zdCcpID09PSAtMSkge1xyXG4gICAgICAgICAgICAvLyBpbml0IGNvbW1lbnRzXHJcbiAgICAgICAgICAgICQoXCIjdGFza0NvbW1lbnRzXCIpLmNvbW1lbnRzKHtcclxuICAgICAgICAgICAgICAgIGdldENvbW1lbnRzVXJsOiBcIi9hcGkvY29tbWVudC9cIiArIHRoaXMubW9kZWwuaWQgKyBcIi9cIiArIHBhcmFtcy5zaXRla2V5ICsgXCIvV0JTLzAwMFwiLFxyXG4gICAgICAgICAgICAgICAgcG9zdENvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCArIFwiL1wiICsgcGFyYW1zLnNpdGVrZXkgKyBcIi9XQlMvXCIgKyBwYXJhbXMucHJvamVjdCxcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUNvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlBdmF0YXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgOiBjYWxsYmFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI3Rhc2tDb21tZW50c1wiKS5jb21tZW50cyh7XHJcbiAgICAgICAgICAgICAgICBnZXRDb21tZW50c1VybDogXCIvYXBpL2NvbW1lbnQvXCIgKyB0aGlzLm1vZGVsLmlkLFxyXG4gICAgICAgICAgICAgICAgcG9zdENvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUNvbW1lbnRVcmw6IFwiL2FwaS9jb21tZW50L1wiICsgdGhpcy5tb2RlbC5pZCxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlBdmF0YXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgOiBjYWxsYmFja1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2ZpbGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlucHV0LnZhbCh2YWwpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29tbWVudHNWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtccnZhciBDb250ZXh0TWVudVZpZXcgPSByZXF1aXJlKCcuL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3Jyk7XHJ2YXIgU2lkZVBhbmVsID0gcmVxdWlyZSgnLi9zaWRlQmFyL1NpZGVQYW5lbCcpO1xyXHJccnZhciBHYW50dENoYXJ0VmlldyA9IHJlcXVpcmUoJy4vY2FudmFzQ2hhcnQvR2FudHRDaGFydFZpZXcnKTtccnZhciBUb3BNZW51VmlldyA9IHJlcXVpcmUoJy4vVG9wTWVudVZpZXcvVG9wTWVudVZpZXcnKTtcclxydmFyIE5vdGlmaWNhdGlvbnMgPSByZXF1aXJlKCcuL05vdGlmaWNhdGlvbnMnKTtcclxyXHJ2YXIgR2FudHRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyICAgIGVsOiAnLkdhbnR0JyxcciAgICBpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpIHtcciAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcciAgICAgICAgdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXSxpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS5vbignY2hhbmdlJywgdGhpcy5jYWxjdWxhdGVEdXJhdGlvbik7XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcubWVudS1jb250YWluZXInKTtcclxyICAgICAgICBuZXcgQ29udGV4dE1lbnVWaWV3KHtcciAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5nc1xyICAgICAgICB9KS5yZW5kZXIoKTtcclxyICAgICAgICAvLyBuZXcgdGFzayBidXR0b25cciAgICAgICAgJCgnLm5ldy10YXNrJykuY2xpY2soZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB2YXIgbGFzdFRhc2sgPSBwYXJhbXMuY29sbGVjdGlvbi5sYXN0KCk7XHIgICAgICAgICAgICB2YXIgbGFzdEluZGV4ID0gLTE7XHIgICAgICAgICAgICBpZiAobGFzdFRhc2spIHtcciAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSBsYXN0VGFzay5nZXQoJ3NvcnRpbmRleCcpO1xyICAgICAgICAgICAgfVxyICAgICAgICAgICAgcGFyYW1zLmNvbGxlY3Rpb24uYWRkKHtcciAgICAgICAgICAgICAgICBuYW1lIDogJ05ldyB0YXNrJyxcciAgICAgICAgICAgICAgICBzb3J0aW5kZXggOiBsYXN0SW5kZXggKyAxXHIgICAgICAgICAgICB9KTtcciAgICAgICAgfSk7XHJcciAgICAgICAgbmV3IE5vdGlmaWNhdGlvbnMoe1xyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KTtcciAgICAgICAgLy8gc2V0IHNpZGUgdGFza3MgcGFuZWwgaGVpZ2h0XHIgICAgICAgIHZhciAkc2lkZVBhbmVsID0gJCgnLm1lbnUtY29udGFpbmVyJyk7XHIgICAgICAgICRzaWRlUGFuZWwuY3NzKHtcciAgICAgICAgICAgICdtaW4taGVpZ2h0JyA6IHdpbmRvdy5pbm5lckhlaWdodCAtICRzaWRlUGFuZWwub2Zmc2V0KCkudG9wXHIgICAgICAgIH0pO1xyXHJcclxyICAgICAgICBuZXcgVG9wTWVudVZpZXcoe1xyICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzLFxyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KS5yZW5kZXIoKTtcclxyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcgPSBuZXcgR2FudHRDaGFydFZpZXcoe1xyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvbixcciAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzXHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcucmVuZGVyKCk7XHIgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcciAgICAgICAgfS5iaW5kKHRoaXMpLCA1MDApO1xyXHJcciAgICAgICAgdmFyIHRhc2tzQ29udGFpbmVyID0gJCgnLnRhc2tzJykuZ2V0KDApO1xyICAgICAgICBSZWFjdC5yZW5kZXIoXHIgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNpZGVQYW5lbCwge1xyICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpXHIgICAgICAgICAgICB9KSxcciAgICAgICAgICAgIHRhc2tzQ29udGFpbmVyXHIgICAgICAgICk7XHJcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0JywgXy5kZWJvdW5jZShmdW5jdGlvbigpIHtcciAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZWNvbXBpbGUnKTtcciAgICAgICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGFza3NDb250YWluZXIpO1xyICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxyICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2lkZVBhbmVsLCB7XHIgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gOiB0aGlzLmNvbGxlY3Rpb24sXHIgICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKVxyICAgICAgICAgICAgICAgIH0pLFxyICAgICAgICAgICAgICAgIHRhc2tzQ29udGFpbmVyXHIgICAgICAgICAgICApO1xyICAgICAgICB9LmJpbmQodGhpcyksNSkpO1xyICAgIH0sXHIgICAgZXZlbnRzOiB7XHIgICAgICAgICdjbGljayAjdEhhbmRsZSc6ICdleHBhbmQnXHIgICAgfSxcciAgICBjYWxjdWxhdGVEdXJhdGlvbjogZnVuY3Rpb24oKXtcclxyICAgICAgICAvLyBDYWxjdWxhdGluZyB0aGUgZHVyYXRpb24gZnJvbSBzdGFydCBhbmQgZW5kIGRhdGVcciAgICAgICAgdmFyIHN0YXJ0ZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJzdGFydFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyICAgICAgICBpZihzdGFydGRhdGUgIT09IFwiXCIgJiYgZW5kZGF0ZSAhPT0gXCJcIil7XHIgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcciAgICAgICAgfWVsc2V7XHIgICAgICAgICAgICAkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwiZHVyYXRpb25cIl0nKS52YWwoTWF0aC5mbG9vcigwKSk7XHIgICAgICAgIH1cciAgICB9LFxyICAgIGV4cGFuZDogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciBidXR0b24gPSAkKGV2dC50YXJnZXQpO1xyICAgICAgICBpZiAoYnV0dG9uLmhhc0NsYXNzKCdjb250cmFjdCcpKSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1jb2xsYXBzZWQnKTtcciAgICAgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIucmVtb3ZlQ2xhc3MoJ3BhbmVsLWV4cGFuZGVkJyk7XHIgICAgICAgIH1cciAgICAgICAgZWxzZSB7XHIgICAgICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmFkZENsYXNzKCdwYW5lbC1leHBhbmRlZCcpO1xyICAgICAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5yZW1vdmVDbGFzcygncGFuZWwtY29sbGFwc2VkJyk7XHIgICAgICAgIH1cciAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcciAgICAgICAgICAgIHRoaXMuX21vdmVDYW52YXNWaWV3KCk7XHIgICAgICAgIH0uYmluZCh0aGlzKSwgNjAwKTtcciAgICAgICAgYnV0dG9uLnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgIH0sXHIgICAgX21vdmVDYW52YXNWaWV3IDogZnVuY3Rpb24oKSB7XHIgICAgICAgIHZhciBzaWRlQmFyV2lkdGggPSAkKCcubWVudS1jb250YWluZXInKS53aWR0aCgpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcuc2V0TGVmdFBhZGRpbmcoc2lkZUJhcldpZHRoKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBHYW50dFZpZXc7XHIiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgTW9kYWxUYXNrRWRpdENvbXBvbmVudCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNlZGl0VGFzaycsXHJcbiAgICBpbml0aWFsaXplIDogZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLiRlbC5maW5kKCcudWkuY2hlY2tib3gnKS5jaGVja2JveCgpO1xyXG4gICAgICAgIC8vIHNldHVwIHZhbHVlcyBmb3Igc2VsZWN0b3JzXHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZVNlbGVjdHMoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnLnRhYnVsYXIubWVudSAuaXRlbScpLnRhYigpO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnW25hbWU9XCJzdGFydFwiXSwgW25hbWU9XCJlbmRcIl0nKS5kYXRlcGlja2VyKHtcclxuLy8gICAgICAgICAgICBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCJcclxuICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMuc2V0dGluZ3MuZ2V0RGF0ZUZvcm1hdCgpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2ZpbGxEYXRhKCk7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gbW9kYWxcclxuICAgICAgICB0aGlzLiRlbC5tb2RhbCh7XHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbklucHV0cygpO1xyXG5cclxuICAgIH0sXHJcbiAgICBfbGlzdGVuSW5wdXRzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyICRtaWxlc3RvbmUgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIm1pbGVzdG9uZVwiXScpO1xyXG4gICAgICAgIHZhciAkZGVsaXZlcmFibGUgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImRlbGl2ZXJhYmxlXCJdJyk7XHJcbiAgICAgICAgdmFyICRzdGFydCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwic3RhcnRcIl0nKTtcclxuICAgICAgICB2YXIgJGVuZCA9IHRoaXMuJGVsLmZpbmQoJ1tuYW1lPVwiZW5kXCJdJyk7XHJcbiAgICAgICAgJG1pbGVzdG9uZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSAkbWlsZXN0b25lLnByb3AoJ2NoZWNrZWQnKTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgJHN0YXJ0LnZhbCgkZW5kLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICRkZWxpdmVyYWJsZS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGRlbGl2ZXJhYmxlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCRkZWxpdmVyYWJsZS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICRtaWxlc3RvbmUucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9wcmVwYXJlU2VsZWN0cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGF0dXNTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cInN0YXR1c1wiXScpO1xyXG4gICAgICAgIHN0YXR1c1NlbGVjdC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oaSwgY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoY2hpbGQudGV4dCk7XHJcbiAgICAgICAgICAgICQoY2hpbGQpLnByb3AoJ3ZhbHVlJywgaWQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciBoZWFsdGhTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cImhlYWx0aFwiXScpO1xyXG4gICAgICAgIGhlYWx0aFNlbGVjdC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oaSwgY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoSWQoY2hpbGQudGV4dCk7XHJcbiAgICAgICAgICAgICQoY2hpbGQpLnByb3AoJ3ZhbHVlJywgaWQpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciB3b3JrT3JkZXJTZWxlY3QgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIndvXCJdJyk7XHJcbiAgICAgICAgd29ya09yZGVyU2VsZWN0LmVtcHR5KCk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zdGF0dXNlcy53b2RhdGFbMF0uZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgJCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBkYXRhLklEICsgJ1wiPicgKyBkYXRhLldPTnVtYmVyICsgJzwvb3B0aW9uPicpLmFwcGVuZFRvKHdvcmtPcmRlclNlbGVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2ZpbGxEYXRhIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMubW9kZWwuYXR0cmlidXRlcywgZnVuY3Rpb24odmFsLCBrZXkpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXR1cycgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZFN0YXR1c0ZvcklkKHZhbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YWwgPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0U3RhdHVzSWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaGVhbHRoJyAmJiAoIXZhbCB8fCAhdGhpcy5zZXR0aW5ncy5maW5kSGVhbHRoRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRIZWFsdGhJZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd3bycgJiYgKCF2YWwgfHwgIXRoaXMuc2V0dGluZ3MuZmluZFdPRm9ySWQodmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHZhbCA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRXT0lkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy4kZWwuZmluZCgnW25hbWU9XCInICsga2V5ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICBpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdzdGFydCcgfHwga2V5ID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGVTdHIgPSAkLmRhdGVwaWNrZXIuZm9ybWF0RGF0ZSh0aGlzLnNldHRpbmdzLmdldERhdGVGb3JtYXQoKSwgdmFsKTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmdldCgwKS52YWx1ZSA9IGRhdGVTdHI7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0LnByb3AoJ3R5cGUnKSA9PT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgICAgICAgICAgaW5wdXQucHJvcCgnY2hlY2tlZCcsIHZhbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC52YWwodmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIm1pbGVzdG9uZVwiXScpLnBhcmVudCgpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfc2F2ZURhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBfLmVhY2godGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3N0YXJ0JyB8fCBrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IGlucHV0LnZhbCgpLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBuZXcgRGF0ZSh2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0LnByb3AoJ3R5cGUnKSA9PT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC5wcm9wKCdjaGVja2VkJykpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXQoa2V5LCBpbnB1dC52YWwoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLm1vZGVsLnNhdmUoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsVGFza0VkaXRDb21wb25lbnQ7XHJcbiIsInZhciBOb3RpZmljYXRpb25zID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnZXJyb3InLCBfLmRlYm91bmNlKHRoaXMub25FcnJvciwgMTApKTtcclxuICAgIH0sXHJcbiAgICBvbkVycm9yIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihhcmd1bWVudHMpO1xyXG4gICAgICAgIG5vdHkoe1xyXG4gICAgICAgICAgICB0ZXh0OiAnRXJyb3Igd2hpbGUgc2F2aW5nIHRhc2ssIHBsZWFzZSByZWZyZXNoIHlvdXIgYnJvd3NlciwgcmVxdWVzdCBzdXBwb3J0IGlmIHRoaXMgZXJyb3IgY29udGludWVzLicsXHJcbiAgICAgICAgICAgIGxheW91dCA6ICd0b3BSaWdodCcsXHJcbiAgICAgICAgICAgIHR5cGUgOiAnZXJyb3InXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb25zO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcblxyXG52YXIgUmVzb3VyY2VFZGl0b3JWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24ocG9zKSB7XHJcbiAgICAgICAgdmFyIHN0YWdlUG9zID0gJCgnI2dhbnR0LWNvbnRhaW5lcicpLm9mZnNldCgpO1xyXG4gICAgICAgIHZhciBmYWtlRWwgPSAkKCc8ZGl2PicpLmFwcGVuZFRvKCdib2R5Jyk7XHJcbiAgICAgICAgZmFrZUVsLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uIDogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgdG9wIDogcG9zLnkgKyBzdGFnZVBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICBsZWZ0IDogcG9zLnggKyBzdGFnZVBvcy5sZWZ0ICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnBvcHVwID0gJCgnLmN1c3RvbS5wb3B1cCcpO1xyXG4gICAgICAgIGZha2VFbC5wb3B1cCh7XHJcbiAgICAgICAgICAgIHBvcHVwIDogdGhpcy5wb3B1cCxcclxuICAgICAgICAgICAgb24gOiAnaG92ZXInLFxyXG4gICAgICAgICAgICBwb3NpdGlvbiA6ICdib3R0b20gbGVmdCcsXHJcbiAgICAgICAgICAgIG9uSGlkZGVuIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cC5vZmYoJy5lZGl0b3InKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgfSkucG9wdXAoJ3Nob3cnKTtcclxuXHJcbiAgICAgICAgdGhpcy5fYWRkUmVzb3VyY2VzKCk7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCcuYnV0dG9uJykub24oJ2NsaWNrLmVkaXRvcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVwLnBvcHVwKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NhdmVEYXRhKCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAub2ZmKCcuZWRpdG9yJyk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5fZnVsbERhdGEoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkUmVzb3VyY2VzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5lbXB0eSgpO1xyXG4gICAgICAgIHZhciBodG1sU3RyaW5nID0gJyc7XHJcbiAgICAgICAgKHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMucmVzb3VyY2VkYXRhIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIGh0bWxTdHJpbmcgKz0gJzxkaXYgY2xhc3M9XCJ1aSBjaGVja2JveFwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgIG5hbWU9XCInICsgcmVzb3VyY2UuVXNlcklkICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8bGFiZWw+JyArIHJlc291cmNlLlVzZXJuYW1lICsgJzwvbGFiZWw+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+PGJyPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaHRtbFN0cmluZyArPSc8YnI+PGRpdiBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxkaXYgY2xhc3M9XCJ1aSBwb3NpdGl2ZSByaWdodCBidXR0b24gc2F2ZSB0aW55XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnQ2xvc2UnICtcclxuICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5hcHBlbmQoaHRtbFN0cmluZyk7XHJcbiAgICAgICAgdGhpcy5wb3B1cC5maW5kKCcudWkuY2hlY2tib3gnKS5jaGVja2JveCgpO1xyXG4gICAgfSxcclxuICAgIF9mdWxsRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwb3B1cCA9IHRoaXMucG9wdXA7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5nZXQoJ3Jlc291cmNlcycpLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgcG9wdXAuZmluZCgnW25hbWU9XCInICsgcmVzb3VyY2UgKyAnXCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zYXZlRGF0YSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBvcHVwLmZpbmQoJ2lucHV0JykuZWFjaChmdW5jdGlvbihpLCBpbnB1dCkge1xyXG4gICAgICAgICAgICB2YXIgJGlucHV0ID0gJChpbnB1dCk7XHJcbiAgICAgICAgICAgIGlmICgkaW5wdXQucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZXMucHVzaCgkaW5wdXQuYXR0cignbmFtZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ3Jlc291cmNlcycsIHJlc291cmNlcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZUVkaXRvclZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEZpbHRlclZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjZmlsdGVyLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjaGFuZ2UgI2hpZ2h0bGlnaHRzLXNlbGVjdCcgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBoaWdodGxpZ2h0VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmIChoaWdodGxpZ2h0VGFza3MuaW5kZXhPZih0YXNrKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2hpZ2h0bGlnaHQnLCB0aGlzLmNvbG9yc1tlLnRhcmdldC52YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnaGlnaHRsaWdodCcsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NoYW5nZSAjZmlsdGVycy1zZWxlY3QnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgY3JpdGVyaWEgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKGNyaXRlcmlhID09PSAncmVzZXQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaG93VGFza3MgPSB0aGlzLl9nZXRNb2RlbHNGb3JDcml0ZXJpYShlLnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dUYXNrcy5pbmRleE9mKHRhc2spID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNob3cgYWxsIHBhcmVudHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRhc2sucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29sb3JzIDoge1xyXG4gICAgICAgICdzdGF0dXMtYmFja2xvZycgOiAnI0QyRDJEOScsXHJcbiAgICAgICAgJ3N0YXR1cy1yZWFkeScgOiAnI0IyRDFGMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1pbiBwcm9ncmVzcycgOiAnIzY2QTNFMCcsXHJcbiAgICAgICAgJ3N0YXR1cy1jb21wbGV0ZScgOiAnIzk5QzI5OScsXHJcbiAgICAgICAgJ2xhdGUnIDogJyNGRkIyQjInLFxyXG4gICAgICAgICdkdWUnIDogJyAjRkZDMjk5JyxcclxuICAgICAgICAnbWlsZXN0b25lJyA6ICcjRDZDMkZGJyxcclxuICAgICAgICAnZGVsaXZlcmFibGUnIDogJyNFMEQxQzInLFxyXG4gICAgICAgICdmaW5hbmNpYWwnIDogJyNGMEUwQjInLFxyXG4gICAgICAgICd0aW1lc2hlZXRzJyA6ICcjQzJDMkIyJyxcclxuICAgICAgICAncmVwb3J0YWJsZScgOiAnICNFMEMyQzInLFxyXG4gICAgICAgICdoZWFsdGgtcmVkJyA6ICdyZWQnLFxyXG4gICAgICAgICdoZWFsdGgtYW1iZXInIDogJyNGRkJGMDAnLFxyXG4gICAgICAgICdoZWFsdGgtZ3JlZW4nIDogJ2dyZWVuJ1xyXG4gICAgfSxcclxuICAgIF9nZXRNb2RlbHNGb3JDcml0ZXJpYSA6IGZ1bmN0aW9uKGNyZXRlcmlhKSB7XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAncmVzZXRzJykge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYS5pbmRleE9mKCdzdGF0dXMnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXR1cyA9IGNyZXRlcmlhLnNsaWNlKGNyZXRlcmlhLmluZGV4T2YoJy0nKSArIDEpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAodGhpcy5zZXR0aW5ncy5maW5kU3RhdHVzSWQoc3RhdHVzKSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdzdGF0dXMnKS50b1N0cmluZygpID09PSBpZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjcmV0ZXJpYSA9PT0gJ2xhdGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmdldCgnZW5kJykgPCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhID09PSAnZHVlJykge1xyXG4gICAgICAgICAgICB2YXIgbGFzdERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICBsYXN0RGF0ZS5hZGRXZWVrcygyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdlbmQnKSA+IG5ldyBEYXRlKCkgJiYgdGFzay5nZXQoJ2VuZCcpIDwgbGFzdERhdGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoWydtaWxlc3RvbmUnLCAnZGVsaXZlcmFibGUnLCAnZmluYW5jaWFsJywgJ3RpbWVzaGVldHMnLCAncmVwb3J0YWJsZSddLmluZGV4T2YoY3JldGVyaWEpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoY3JldGVyaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNyZXRlcmlhLmluZGV4T2YoJ2hlYWx0aCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgaGVhbHRoID0gY3JldGVyaWEuc2xpY2UoY3JldGVyaWEuaW5kZXhPZignLScpICsgMSk7XHJcbiAgICAgICAgICAgIHZhciBoZWFsdGhJZCA9ICh0aGlzLnNldHRpbmdzLmZpbmRIZWFsdGhJZChoZWFsdGgpIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5nZXQoJ2hlYWx0aCcpLnRvU3RyaW5nKCkgPT09IGhlYWx0aElkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsdGVyVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgR3JvdXBpbmdNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNncm91cGluZy1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3RvcC1leHBhbmQtYWxsJyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5pc05lc3RlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFzay5zZXQoJ2NvbGxhcHNlZCcsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnY2xpY2sgI3RvcC1jb2xsYXBzZS1hbGwnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmlzTmVzdGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXNrLnNldCgnY29sbGFwc2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwaW5nTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgcGFyc2VYTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZVhNTE9iajtcclxudmFyIEpTT05Ub1hNTCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3htbFdvcmtlcicpLkpTT05Ub1hNTDtcclxudmFyIHBhcnNlRGVwc0Zyb21YTUwgPSByZXF1aXJlKCcuLi8uLi91dGlscy94bWxXb3JrZXInKS5wYXJzZURlcHNGcm9tWE1MO1xyXG5cclxudmFyIE1TUHJvamVjdE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgZWwgOiAnI3Byb2plY3QtbWVudScsXHJcblxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5pbXBvcnRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9zZXR1cElucHV0KCk7XHJcbiAgICB9LFxyXG4gICAgX3NldHVwSW5wdXQgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW5wdXQgPSAkKCcjaW1wb3J0RmlsZScpO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlcyA9IGV2dC50YXJnZXQuZmlsZXM7XHJcbiAgICAgICAgICAgIF8uZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYueG1sRGF0YSA9IGUudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdFcnJvciB3aGlsZSBwYXJpbmcgZmlsZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgI3VwbG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjbXNpbXBvcnQnKS5tb2RhbCh7XHJcbiAgICAgICAgICAgICAgICBvbkhpZGRlbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25BcHByb3ZlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnhtbERhdGEgfHwgdGhpcy5pbXBvcnRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltcG9ydGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRQcm9ncmVzc1wiKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNpbXBvcnRGaWxlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLnJlbW92ZUNsYXNzKCdkaW1tYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyN4bWxpbnB1dC1mb3JtJykudHJpZ2dlcigncmVzZXQnKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuaW1wb3J0RGF0YS5iaW5kKHRoaXMpLCAyMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICQoXCIjaW1wb3J0UHJvZ3Jlc3NcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2ltcG9ydEZpbGVcIikuc2hvdygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2NsaWNrICNkb3dubG9hZC1wcm9qZWN0JyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IEpTT05Ub1hNTCh0aGlzLmNvbGxlY3Rpb24udG9KU09OKCkpO1xyXG4gICAgICAgICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwge3R5cGUgOiAnYXBwbGljYXRpb24vanNvbid9KTtcclxuICAgICAgICAgICAgc2F2ZUFzKGJsb2IsICdHYW50dFRhc2tzLnhtbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwcm9ncmVzcyA6IGZ1bmN0aW9uKHBlcmNlbnQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKHBlcmNlbnQpO1xyXG4gICAgICAgICQoJyNpbXBvcnRQcm9ncmVzcycpLnByb2dyZXNzKHtcclxuICAgICAgICAgICAgcGVyY2VudCA6IHBlcmNlbnRcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfcHJlcGFyZURhdGEgOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgdmFyIGRlZlN0YXR1cyA9IHRoaXMuc2V0dGluZ3MuZmluZERlZmF1bHRTdGF0dXNJZCgpO1xyXG4gICAgICAgIHZhciBkZWZIZWFsdGggPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0SGVhbHRoSWQoKTtcclxuICAgICAgICB2YXIgZGVmV08gPSB0aGlzLnNldHRpbmdzLmZpbmREZWZhdWx0V09JZCgpO1xyXG4gICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uaGVhbHRoID0gZGVmSGVhbHRoO1xyXG4gICAgICAgICAgICBpdGVtLnN0YXR1cyA9IGRlZlN0YXR1cztcclxuICAgICAgICAgICAgaXRlbS53byA9IGRlZldPO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfSxcclxuICAgIGltcG9ydERhdGEgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb2dyZXNzKDApO1xyXG4gICAgICAgIC8vIHRoaXMgaXMgc29tZSBzb3J0IG9mIGNhbGxiYWNrIGhlbGwhIVxyXG4gICAgICAgIC8vIHdlIG5lZWQgdGltZW91dHMgZm9yIGJldHRlciB1c2VyIGV4cGVyaWVuY2VcclxuICAgICAgICAvLyBJIHRoaW5rIHVzZXIgd2FudCB0byBzZWUgYW5pbWF0ZWQgcHJvZ3Jlc3MgYmFyXHJcbiAgICAgICAgLy8gYnV0IHdpdGhvdXQgdGltZW91dHMgaXQgaXMgbm90IHBvc3NpYmxlLCByaWdodD9cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzKDIxKTtcclxuICAgICAgICAgICAgdmFyIGNvbCA9IHRoaXMuY29sbGVjdGlvbjtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBwYXJzZVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fcHJlcGFyZURhdGEoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg0Myk7XHJcbiAgICAgICAgICAgICAgICBjb2wuaW1wb3J0VGFza3MoZGF0YSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg1MSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg2Nyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZXBzID0gcGFyc2VEZXBzRnJvbVhNTCh0aGlzLnhtbERhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcyg5NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wuY3JlYXRlRGVwcyhkZXBzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzcygxMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1wb3J0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI21zaW1wb3J0JykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTVNQcm9qZWN0TWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFJlcG9ydHNNZW51VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsIDogJyNyZXBvcnRzLW1lbnUnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICB9LFxyXG4gICAgZXZlbnRzIDoge1xyXG4gICAgICAgICdjbGljayAjcHJpbnQnIDogJ2dlbmVyYXRlUERGJyxcclxuICAgICAgICAnY2xpY2sgI3Nob3dWaWRlbycgOiAnc2hvd0hlbHAnXHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVQREYgOiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICB3aW5kb3cucHJpbnQoKTtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcbiAgICBzaG93SGVscCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNzaG93VmlkZW9Nb2RhbCcpLm1vZGFsKHtcclxuICAgICAgICAgICAgb25IaWRkZW4gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkucmVtb3ZlQ2xhc3MoJ2RpbW1hYmxlJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uQXBwcm92ZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnZGltbWFibGUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXBvcnRzTWVudVZpZXc7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgWm9vbU1lbnVWaWV3ID0gcmVxdWlyZSgnLi9ab29tTWVudVZpZXcnKTtcclxudmFyIEdyb3VwaW5nTWVudVZpZXcgPSByZXF1aXJlKCcuL0dyb3VwaW5nTWVudVZpZXcnKTtcclxudmFyIEZpbHRlck1lbnVWaWV3ID0gcmVxdWlyZSgnLi9GaWx0ZXJNZW51VmlldycpO1xyXG52YXIgTVNQcm9qZWN0TWVudVZpZXcgPSByZXF1aXJlKCcuL01TUHJvamVjdE1lbnVWaWV3Jyk7XHJcbnZhciBSZXBvcnRzTWVudVZpZXcgPSByZXF1aXJlKCcuL1JlcG9ydHNNZW51VmlldycpO1xyXG5cclxudmFyIFRvcE1lbnVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIG5ldyBab29tTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgICAgICBuZXcgR3JvdXBpbmdNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBGaWx0ZXJNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBNU1Byb2plY3RNZW51VmlldyhwYXJhbXMpLnJlbmRlcigpO1xyXG4gICAgICAgIG5ldyBSZXBvcnRzTWVudVZpZXcocGFyYW1zKS5yZW5kZXIoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvcE1lbnVWaWV3O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBab29tTWVudVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcbiAgICBlbCA6ICcjem9vbS1tZW51JyxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgfSxcclxuICAgIGV2ZW50cyA6IHtcclxuICAgICAgICAnY2xpY2sgLmFjdGlvbic6ICdvbkludGVydmFsQnV0dG9uQ2xpY2tlZCdcclxuICAgIH0sXHJcbiAgICBvbkludGVydmFsQnV0dG9uQ2xpY2tlZCA6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIHZhciBidXR0b24gPSAkKGV2dC5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICB2YXIgYWN0aW9uID0gYnV0dG9uLmRhdGEoJ2FjdGlvbicpO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IGFjdGlvbi5zcGxpdCgnLScpWzFdO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0KCdpbnRlcnZhbCcsIGludGVydmFsKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFpvb21NZW51VmlldztcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgQWxvbmVUYXNrVmlldyA9IEJhc2ljVGFza1ZpZXcuZXh0ZW5kKHtcclxuICAgIF9ib3JkZXJXaWR0aCA6IDMsXHJcbiAgICBfY29sb3IgOiAnI0U2RjBGRicsXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gXy5leHRlbmQoQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZXZlbnRzKCksIHtcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlIC5sZWZ0Qm9yZGVyJyA6ICdfY2hhbmdlU2l6ZScsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAucmlnaHRCb3JkZXInIDogJ19jaGFuZ2VTaXplJyxcclxuXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5sZWZ0Qm9yZGVyJyA6ICdyZW5kZXInLFxyXG4gICAgICAgICAgICAnZHJhZ2VuZCAucmlnaHRCb3JkZXInIDogJ3JlbmRlcicsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5sZWZ0Qm9yZGVyJyA6ICdfcmVzaXplUG9pbnRlcicsXHJcbiAgICAgICAgICAgICdtb3VzZW91dCAubGVmdEJvcmRlcicgOiAnX2RlZmF1bHRNb3VzZScsXHJcblxyXG4gICAgICAgICAgICAnbW91c2VvdmVyIC5yaWdodEJvcmRlcicgOiAnX3Jlc2l6ZVBvaW50ZXInLFxyXG4gICAgICAgICAgICAnbW91c2VvdXQgLnJpZ2h0Qm9yZGVyJyA6ICdfZGVmYXVsdE1vdXNlJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZHJhZ0JvdW5kRnVuYyA6IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS54KCkgKyB0aGlzLmVsLngoKTtcclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFggPSBwb3MueCAtIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IE1hdGgubWluKGxvY2FsWCwgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdsZWZ0Qm9yZGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyb3VwLmFkZChsZWZ0Qm9yZGVyKTtcclxuICAgICAgICB2YXIgcmlnaHRCb3JkZXIgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmVsLmdldFN0YWdlKCkueCgpICsgdGhpcy5lbC54KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxYID0gcG9zLnggLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHggOiBNYXRoLm1heChsb2NhbFgsIHRoaXMuZWwuZmluZCgnLmxlZnRCb3JkZXInKVswXS54KCkpICsgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95ICsgdGhpcy5fdG9wUGFkZGluZ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHRoaXMuX2JvcmRlcldpZHRoLFxyXG4gICAgICAgICAgICBmaWxsIDogJ2JsYWNrJyxcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfcmVzaXplUG9pbnRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2V3LXJlc2l6ZSc7XHJcbiAgICB9LFxyXG4gICAgX2NoYW5nZVNpemUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGVmdFggPSB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgpO1xyXG4gICAgICAgIHZhciByaWdodFggPSB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoKSArIHRoaXMuX2JvcmRlcldpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgcmVjdC53aWR0aChyaWdodFggLSBsZWZ0WCk7XHJcbiAgICAgICAgcmVjdC54KGxlZnRYKTtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNvbXBsZXRlIHBhcmFtc1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVJlY3QgPSB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXTtcclxuICAgICAgICBjb21wbGV0ZVJlY3QueChsZWZ0WCk7XHJcbiAgICAgICAgY29tcGxldGVSZWN0LndpZHRoKHRoaXMuX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGgoKSk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngocmlnaHRYKTtcclxuICAgICAgICB2YXIgcmVzb3VyY2VzID0gdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJylbMF07XHJcbiAgICAgICAgcmVzb3VyY2VzLngocmlnaHRYICsgdGhpcy5fdG9vbGJhck9mZnNldCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZURhdGVzKCk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9jYWxjdWxhdGVYKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLngoMCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS54KHgueDIgLSB4LngxIC0gdGhpcy5fYm9yZGVyV2lkdGgpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnbWlsZXN0b25lJykpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuZGlhbW9uZCcpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKS5oaWRlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcuZGlhbW9uZCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKS5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxvbmVUYXNrVmlldztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBSZXNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4uL1Jlc291cmNlc0VkaXRvcicpO1xyXG5cclxudmFyIGxpbmtJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5saW5rSW1hZ2Uuc3JjID0gJ2Nzcy9pbWFnZXMvbGluay5wbmcnO1xyXG5cclxudmFyIHVzZXJJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG51c2VySW1hZ2Uuc3JjID0gJ2Nzcy9pbWFnZXMvdXNlci5wbmcnO1xyXG5cclxudmFyIEJhc2ljVGFza1ZpZXcgPSBCYWNrYm9uZS5Lb252YVZpZXcuZXh0ZW5kKHtcclxuICAgIF9mdWxsSGVpZ2h0IDogMjEsXHJcbiAgICBfdG9wUGFkZGluZyA6IDMsXHJcbiAgICBfYmFySGVpZ2h0IDogMTUsXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjZTg4MTM0JyxcclxuICAgIF90b29sYmFyT2Zmc2V0IDogMjAsXHJcbiAgICBfcmVzb3VyY2VMaXN0T2Zmc2V0IDogMjAsXHJcbiAgICBfbWlsZXN0b25lQ29sb3IgOiAnYmx1ZScsXHJcbiAgICBfbWlsZXN0b25lT2Zmc2V0IDogMCxcclxuICAgIGluaXRpYWxpemUgOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuX2Z1bGxIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHBhcmFtcy5zZXR0aW5ncztcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBldmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnZHJhZ21vdmUnIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVUeXBlICE9PSAnR3JvdXAnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRGF0ZXMoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdlbmQnIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnNhdmVXaXRoQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdtb3VzZWVudGVyJyA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dUb29scygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZVJlc291cmNlc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dyYWJQb2ludGVyKGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnbW91c2VsZWF2ZScgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGVUb29scygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd1Jlc291cmNlc0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRNb3VzZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ3N0YXJ0IC5kZXBlbmRlbmN5VG9vbCcgOiAnX3N0YXJ0Q29ubmVjdGluZycsXHJcbiAgICAgICAgICAgICdkcmFnbW92ZSAuZGVwZW5kZW5jeVRvb2wnIDogJ19tb3ZlQ29ubmVjdCcsXHJcbiAgICAgICAgICAgICdkcmFnZW5kIC5kZXBlbmRlbmN5VG9vbCcgOiAnX2NyZWF0ZURlcGVuZGVuY3knLFxyXG4gICAgICAgICAgICAnY2xpY2sgLnJlc291cmNlcycgOiAnX2VkaXRSZXNvdXJjZXMnXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBncm91cCA9IG5ldyBLb252YS5Hcm91cCh7XHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmMgOiBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA6IHBvcy54LFxyXG4gICAgICAgICAgICAgICAgICAgIHkgOiB0aGlzLl95XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIGlkIDogdGhpcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZSA6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgZmFrZUJhY2tncm91bmQgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnZmFrZUJhY2tncm91bmQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBuZXcgS29udmEuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGwgOiB0aGlzLl9jb2xvcixcclxuICAgICAgICAgICAgeSA6IHRoaXMuX3RvcFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgbmFtZSA6ICdtYWluUmVjdCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgZGlhbW9uZCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX21pbGVzdG9uZUNvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArdGhpcy5fYmFySGVpZ2h0IC8gMixcclxuICAgICAgICAgICAgeCA6IHRoaXMuX2JhckhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHRoaXMuX2JhckhlaWdodCAqIDAuOCxcclxuICAgICAgICAgICAgd2lkdGggOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjgsXHJcbiAgICAgICAgICAgIG9mZnNldFggOiB0aGlzLl9iYXJIZWlnaHQgKiAwLjggLyAyLFxyXG4gICAgICAgICAgICBvZmZzZXRZIDogdGhpcy5fYmFySGVpZ2h0ICogMC44IC8gMixcclxuICAgICAgICAgICAgbmFtZSA6ICdkaWFtb25kJyxcclxuICAgICAgICAgICAgcm90YXRpb24gOiA0NSxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlUmVjdCA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbXBsZXRlQ29sb3IsXHJcbiAgICAgICAgICAgIHkgOiB0aGlzLl90b3BQYWRkaW5nLFxyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLl9iYXJIZWlnaHQsXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29tcGxldGVSZWN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgYXJjID0gbmV3IEtvbnZhLlNoYXBlKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgZmlsbCA6ICdsaWdodGdyZWVuJyxcclxuICAgICAgICAgICAgZHJhd0Z1bmM6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBob3JPZmZzZXQgPSA2O1xyXG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSAgc2VsZi5fYmFySGVpZ2h0ICsgKHNlbGYuX2JvcmRlclNpemUgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhob3JPZmZzZXQsIDApO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMoaG9yT2Zmc2V0LCBzaXplIC8gMiwgc2l6ZSAvIDIsIC0gTWF0aC5QSSAvIDIsIE1hdGguUEkgLyAyKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKDAsIHNpemUpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTaGFwZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHZhciBpbWdTaXplID0gc2l6ZSAtIDQ7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShsaW5rSW1hZ2UsIDEsIChzaXplIC0gaW1nU2l6ZSkgLyAyLCBpbWdTaXplLCBpbWdTaXplKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGl0RnVuYyA6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlY3QoMCwgMCwgNiArIHNlbGYuX2JhckhlaWdodCwgc2VsZi5fYmFySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFNoYXBlKHRoaXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuYW1lIDogJ2RlcGVuZGVuY3lUb29sJyxcclxuICAgICAgICAgICAgdmlzaWJsZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGUgOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciB0b29sYmFyID0gbmV3IEtvbnZhLkdyb3VwKHtcclxuICAgICAgICAgICAgeTogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbmFtZSA6ICdyZXNvdXJjZXMnLFxyXG4gICAgICAgICAgICB2aXNpYmxlIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgc2l6ZSA9IHNlbGYuX2JhckhlaWdodCArIChzZWxmLl9ib3JkZXJTaXplIHx8IDApO1xyXG4gICAgICAgIHZhciB0b29sYmFjayA9IG5ldyBLb252YS5SZWN0KHtcclxuICAgICAgICAgICAgZmlsbCA6ICdsaWdodGdyZXknLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHNpemUsXHJcbiAgICAgICAgICAgIGNvcm5lclJhZGl1cyA6IDJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHVzZXJJbSA9IG5ldyBLb252YS5JbWFnZSh7XHJcbiAgICAgICAgICAgIGltYWdlIDogdXNlckltYWdlLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHNpemUsXHJcbiAgICAgICAgICAgIGhlaWdodCA6IHNpemVcclxuICAgICAgICB9KTtcclxuICAgICAgICB0b29sYmFyLmFkZCh0b29sYmFjaywgdXNlckltKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc291cmNlTGlzdCA9IG5ldyBLb252YS5UZXh0KHtcclxuICAgICAgICAgICAgbmFtZSA6ICdyZXNvdXJjZUxpc3QnLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyxcclxuICAgICAgICAgICAgbGlzdGVuaW5nIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JvdXAuYWRkKGZha2VCYWNrZ3JvdW5kLCBkaWFtb25kLCByZWN0LCBjb21wbGV0ZVJlY3QsIGFyYywgdG9vbGJhciwgcmVzb3VyY2VMaXN0KTtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9LFxyXG4gICAgX2VkaXRSZXNvdXJjZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdmlldyA9IG5ldyBSZXNvdXJjZUVkaXRvcih7XHJcbiAgICAgICAgICAgIG1vZGVsIDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuZWwuZ2V0U3RhZ2UoKS5nZXRQb2ludGVyUG9zaXRpb24oKTtcclxuICAgICAgICB2aWV3LnJlbmRlcihwb3MpO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVEYXRlcyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxyXG4gICAgICAgICAgICBib3VuZGFyeU1pbiA9IGF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGggPSBhdHRycy5kYXlzV2lkdGg7XHJcblxyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcmVjdC53aWR0aCgpO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5lbC54KCkgKyByZWN0LngoKTtcclxuICAgICAgICB2YXIgZGF5czEgPSBNYXRoLnJvdW5kKHggLyBkYXlzV2lkdGgpLCBkYXlzMiA9IE1hdGgucm91bmQoKHggKyBsZW5ndGgpIC8gZGF5c1dpZHRoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xyXG4gICAgICAgICAgICBzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcclxuICAgICAgICAgICAgZW5kOiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czIgLSAxKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9zaG93VG9vbHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpLnNob3coKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKS5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVRvb2xzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VzJykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5kcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX3Nob3dSZXNvdXJjZXNMaXN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbC5maW5kKCcucmVzb3VyY2VMaXN0Jykuc2hvdygpO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5iYXRjaERyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfaGlkZVJlc291cmNlc0xpc3QgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZUxpc3QnKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5lbC5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9ncmFiUG9pbnRlciA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgbmFtZSA9IGUudGFyZ2V0Lm5hbWUoKTtcclxuICAgICAgICBpZiAoKG5hbWUgPT09ICdtYWluUmVjdCcpIHx8IChuYW1lID09PSAnZGVwZW5kZW5jeVRvb2wnKSB8fFxyXG4gICAgICAgICAgICAobmFtZSA9PT0gJ2NvbXBsZXRlUmVjdCcpIHx8IChlLnRhcmdldC5nZXRQYXJlbnQoKS5uYW1lKCkgPT09ICdyZXNvdXJjZXMnKSkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2RlZmF1bHRNb3VzZSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xyXG4gICAgfSxcclxuICAgIF9zdGFydENvbm5lY3RpbmcgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIHRvb2wgPSB0aGlzLmVsLmZpbmQoJy5kZXBlbmRlbmN5VG9vbCcpWzBdO1xyXG4gICAgICAgIHRvb2wuaGlkZSgpO1xyXG4gICAgICAgIHZhciBwb3MgPSB0b29sLmdldEFic29sdXRlUG9zaXRpb24oKTtcclxuICAgICAgICB2YXIgY29ubmVjdG9yID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2UgOiAnYmxhY2snLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDEsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFtwb3MueCAtIHN0YWdlLngoKSwgcG9zLnksIHBvcy54IC0gc3RhZ2UueCgpLCBwb3MueV0sXHJcbiAgICAgICAgICAgIG5hbWUgOiAnY29ubmVjdG9yJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWwuZ2V0TGF5ZXIoKS5hZGQoY29ubmVjdG9yKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICB9LFxyXG4gICAgX21vdmVDb25uZWN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbm5lY3RvciA9IHRoaXMuZWwuZ2V0TGF5ZXIoKS5maW5kKCcuY29ubmVjdG9yJylbMF07XHJcbiAgICAgICAgdmFyIHN0YWdlID0gdGhpcy5lbC5nZXRTdGFnZSgpO1xyXG4gICAgICAgIHZhciBwb2ludHMgPSBjb25uZWN0b3IucG9pbnRzKCk7XHJcbiAgICAgICAgcG9pbnRzWzJdID0gc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueCAtIHN0YWdlLngoKTtcclxuICAgICAgICBwb2ludHNbM10gPSBzdGFnZS5nZXRQb2ludGVyUG9zaXRpb24oKS55O1xyXG4gICAgICAgIGNvbm5lY3Rvci5wb2ludHMocG9pbnRzKTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRGVwZW5kZW5jeSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3IgPSB0aGlzLmVsLmdldExheWVyKCkuZmluZCgnLmNvbm5lY3RvcicpWzBdO1xyXG4gICAgICAgIGNvbm5lY3Rvci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICB2YXIgc3RhZ2UgPSB0aGlzLmVsLmdldFN0YWdlKCk7XHJcbiAgICAgICAgdmFyIGVsID0gc3RhZ2UuZ2V0SW50ZXJzZWN0aW9uKHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpKTtcclxuICAgICAgICB2YXIgZ3JvdXAgPSBlbCAmJiBlbC5nZXRQYXJlbnQoKTtcclxuICAgICAgICB2YXIgdGFza0lkID0gZ3JvdXAgJiYgZ3JvdXAuaWQoKTtcclxuICAgICAgICB2YXIgYmVmb3JlTW9kZWwgPSB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHZhciBhZnRlck1vZGVsID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmdldCh0YXNrSWQpO1xyXG4gICAgICAgIGlmIChhZnRlck1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuY29sbGVjdGlvbi5jcmVhdGVEZXBlbmRlbmN5KGJlZm9yZU1vZGVsLCBhZnRlck1vZGVsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlRm9yID0gdGhpcy5tb2RlbC5jb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdkZXBlbmQnKSA9PT0gYmVmb3JlTW9kZWwuaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVtb3ZlRm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmNvbGxlY3Rpb24ucmVtb3ZlRGVwZW5kZW5jeShyZW1vdmVGb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0TW9kZWxFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBkb24ndCB1cGRhdGUgZWxlbWVudCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6cmVzb3VyY2VzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2luZyA9IHRoaXMuZWwuaXNEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLmdldENoaWxkcmVuKCkuZWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcgPSBkcmFnZ2luZyB8fCBjaGlsZC5pc0RyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY2FsY3VsYXRlWCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluID0gYXR0cnMuYm91bmRhcnlNaW4sXHJcbiAgICAgICAgICAgIGRheXNXaWR0aCA9IGF0dHJzLmRheXNXaWR0aDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDE6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSkgLSAxKSAqIGRheXNXaWR0aCxcclxuICAgICAgICAgICAgeDI6IChEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLm1vZGVsLmdldCgnZW5kJykpKSAqIGRheXNXaWR0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhbGN1bGF0ZUNvbXBsZXRlV2lkdGggOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICByZXR1cm4gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcy5fY2FsY3VsYXRlWCgpO1xyXG4gICAgICAgIC8vIG1vdmUgZ3JvdXBcclxuICAgICAgICB0aGlzLmVsLngoeC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBmYWtlIGJhY2tncm91bmQgcmVjdCBwYXJhbXNcclxuICAgICAgICB2YXIgYmFjayA9IHRoaXMuZWwuZmluZCgnLmZha2VCYWNrZ3JvdW5kJylbMF07XHJcbiAgICAgICAgYmFjay54KCAtIDIwKTtcclxuICAgICAgICBiYWNrLndpZHRoKHgueDIgLSB4LngxICsgNjApO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgbWFpbiByZWN0IHBhcmFtc1xyXG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5lbC5maW5kKCcubWFpblJlY3QnKVswXTtcclxuICAgICAgICByZWN0LngoMCk7XHJcbiAgICAgICAgcmVjdC53aWR0aCh4LngyIC0geC54MSk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjb21wbGV0ZSBwYXJhbXNcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5jb21wbGV0ZVJlY3QnKVswXS53aWR0aCh0aGlzLl9jYWxjdWxhdGVDb21wbGV0ZVdpZHRoKCkpO1xyXG4gICAgICAgIHRoaXMuZWwuZmluZCgnLmNvbXBsZXRlUmVjdCcpWzBdLngoMCk7XHJcblxyXG4gICAgICAgIHZhciBfbWlsZXN0b25lT2Zmc2V0ID0gMDtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ21pbGVzdG9uZScpKSB7XHJcbiAgICAgICAgICAgIF9taWxlc3RvbmVPZmZzZXQgPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdG9vbCBwb3NpdGlvblxyXG4gICAgICAgIHZhciB0b29sID0gdGhpcy5lbC5maW5kKCcuZGVwZW5kZW5jeVRvb2wnKVswXTtcclxuICAgICAgICB0b29sLngoeC54MiAtIHgueDEgKyBfbWlsZXN0b25lT2Zmc2V0KTtcclxuICAgICAgICB0b29sLnkodGhpcy5fdG9wUGFkZGluZyk7XHJcblxyXG4gICAgICAgIHZhciByZXNvdXJjZXMgPSB0aGlzLmVsLmZpbmQoJy5yZXNvdXJjZXMnKVswXTtcclxuICAgICAgICByZXNvdXJjZXMueCh4LngyIC0geC54MSArIHRoaXMuX3Rvb2xiYXJPZmZzZXQgKyBfbWlsZXN0b25lT2Zmc2V0KTtcclxuICAgICAgICByZXNvdXJjZXMueSh0aGlzLl90b3BQYWRkaW5nKTtcclxuXHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSByZXNvdXJjZSBsaXN0XHJcbiAgICAgICAgdmFyIHJlc291cmNlTGlzdCA9IHRoaXMuZWwuZmluZCgnLnJlc291cmNlTGlzdCcpWzBdO1xyXG4gICAgICAgIHJlc291cmNlTGlzdC54KHgueDIgLSB4LngxICsgdGhpcy5fcmVzb3VyY2VMaXN0T2Zmc2V0ICsgX21pbGVzdG9uZU9mZnNldCk7XHJcbiAgICAgICAgcmVzb3VyY2VMaXN0LnkodGhpcy5fdG9wUGFkZGluZyArIDIpO1xyXG4gICAgICAgIHZhciBuYW1lcyA9IFtdO1xyXG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5tb2RlbC5nZXQoJ3Jlc291cmNlcycpO1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZUlkKSB7XHJcbiAgICAgICAgICAgIHZhciByZXMgPSBfLmZpbmQoKHRoaXMuc2V0dGluZ3Muc3RhdHVzZXMucmVzb3VyY2VkYXRhIHx8IFtdKSwgZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLlVzZXJJZC50b1N0cmluZygpID09PSByZXNvdXJjZUlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPCAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMucHVzaChyZXMuVXNlcm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxpYXNlcyA9IF8ubWFwKHJlcy5Vc2VybmFtZS5zcGxpdCgnICcpLCBmdW5jdGlvbihzdHIpIHsgcmV0dXJuIHN0clswXTt9KS5qb2luKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lcy5wdXNoKGFsaWFzZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICByZXNvdXJjZUxpc3QudGV4dChuYW1lcy5qb2luKCcsICcpKTtcclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgc2V0WSA6IGZ1bmN0aW9uKHkpIHtcclxuICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB0aGlzLmVsLnkoeSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0WSA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl95O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzaWNUYXNrVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBDb25uZWN0b3JWaWV3ID0gQmFja2JvbmUuS29udmFWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3IgOiAnZ3JleScsXHJcbiAgICBfd3JvbmdDb2xvciA6ICdyZWQnLFxyXG4gICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gcGFyYW1zLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuYmVmb3JlTW9kZWwgPSBwYXJhbXMuYmVmb3JlTW9kZWw7XHJcbiAgICAgICAgdGhpcy5hZnRlck1vZGVsID0gcGFyYW1zLmFmdGVyTW9kZWw7XHJcbiAgICAgICAgdGhpcy5feTEgPSAwO1xyXG4gICAgICAgIHRoaXMuX3kyID0gMDtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0TW9kZWxFdmVudHMoKTtcclxuICAgIH0sXHJcbiAgICBlbCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsaW5lID0gbmV3IEtvbnZhLkxpbmUoe1xyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDIsXHJcbiAgICAgICAgICAgIHN0cm9rZSA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIHBvaW50cyA6IFswLDAsMCwwXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgfSxcclxuICAgIHNldFkxIDogZnVuY3Rpb24oeTEpIHtcclxuICAgICAgICB0aGlzLl95MSA9IHkxO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0WTIgOiBmdW5jdGlvbih5Mikge1xyXG4gICAgICAgIHRoaXMuX3kyID0geTI7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICBpZiAoeC54MiA+PSB4LngxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5lbC5wb2ludHMoW3gueDEsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kxLCB4LngxICsgMTAsIHRoaXMuX3kyLCB4LngyLCB0aGlzLl95Ml0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuc3Ryb2tlKHRoaXMuX3dyb25nQ29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVsLnBvaW50cyhbXHJcbiAgICAgICAgICAgICAgICB4LngxLCB0aGlzLl95MSxcclxuICAgICAgICAgICAgICAgIHgueDEgKyAxMCwgdGhpcy5feTEsXHJcbiAgICAgICAgICAgICAgICB4LngxICsgMTAsIHRoaXMuX3kxICsgKHRoaXMuX3kyIC0gdGhpcy5feTEpIC8gMixcclxuICAgICAgICAgICAgICAgIHgueDIgLSAxMCwgdGhpcy5feTEgKyAodGhpcy5feTIgLSB0aGlzLl95MSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgeC54MiAtIDEwLCB0aGlzLl95MixcclxuICAgICAgICAgICAgICAgIHgueDIsIHRoaXMuX3kyXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTZXR0aW5nc0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5zZXR0aW5ncywgJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRNb2RlbEV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5iZWZvcmVNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYmVmb3JlTW9kZWwsICdjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJlZm9yZU1vZGVsLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuYWZ0ZXJNb2RlbCwgJ2NoYW5nZTpoaWRkZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmVmb3JlTW9kZWwuZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9jYWxjdWxhdGVYIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGF0dHJzPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcclxuICAgICAgICAgICAgYm91bmRhcnlNaW4gPSBhdHRycy5ib3VuZGFyeU1pbixcclxuICAgICAgICAgICAgZGF5c1dpZHRoID0gYXR0cnMuZGF5c1dpZHRoO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHgxOiBEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLCB0aGlzLmJlZm9yZU1vZGVsLmdldCgnZW5kJykpICogZGF5c1dpZHRoLFxyXG4gICAgICAgICAgICB4MjogRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbiwgdGhpcy5hZnRlck1vZGVsLmdldCgnc3RhcnQnKSkgKiBkYXlzV2lkdGhcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdG9yVmlldzsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXN0ZWRUYXNrVmlldyA9IHJlcXVpcmUoJy4vTmVzdGVkVGFza1ZpZXcnKTtcclxudmFyIEFsb25lVGFza1ZpZXcgPSByZXF1aXJlKCcuL0Fsb25lVGFza1ZpZXcnKTtcclxudmFyIENvbm5lY3RvclZpZXcgPSByZXF1aXJlKCcuL0Nvbm5lY3RvclZpZXcnKTtcclxuXHJcbnZhciBHYW50dENoYXJ0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuICAgIGVsOiAnI2dhbnR0LWNvbnRhaW5lcicsXHJcbiAgICBfdG9wUGFkZGluZyA6IDczLFxyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5fdGFza1ZpZXdzID0gW107XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdG9yVmlld3MgPSBbXTtcclxuICAgICAgICB0aGlzLl9pbml0U3RhZ2UoKTtcclxuICAgICAgICB0aGlzLl9pbml0TGF5ZXJzKCk7XHJcbiAgICAgICAgdGhpcy5faW5pdEJhY2tncm91bmQoKTtcclxuICAgICAgICB0aGlzLl9pbml0U2V0dGluZ3NFdmVudHMoKTtcclxuICAgICAgICB0aGlzLl9pbml0U3ViVmlld3MoKTtcclxuICAgICAgICB0aGlzLl9pbml0Q29sbGVjdGlvbkV2ZW50cygpO1xyXG4gICAgfSxcclxuICAgIHNldExlZnRQYWRkaW5nIDogZnVuY3Rpb24ob2Zmc2V0KSB7XHJcbiAgICAgICAgdGhpcy5fbGVmdFBhZGRpbmcgPSBvZmZzZXQ7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgfSxcclxuICAgIF9pbml0U3RhZ2UgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnN0YWdlID0gbmV3IEtvbnZhLlN0YWdlKHtcclxuICAgICAgICAgICAgY29udGFpbmVyIDogdGhpcy5lbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgIH0sXHJcbiAgICBfaW5pdExheWVycyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuRmxheWVyID0gbmV3IEtvbnZhLkxheWVyKCk7XHJcbiAgICAgICAgdGhpcy5CbGF5ZXIgPSBuZXcgS29udmEuTGF5ZXIoKTtcclxuICAgICAgICB0aGlzLnN0YWdlLmFkZCh0aGlzLkJsYXllciwgdGhpcy5GbGF5ZXIpO1xyXG4gICAgfSxcclxuICAgIF91cGRhdGVTdGFnZUF0dHJzIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNhdHRyID0gdGhpcy5zZXR0aW5ncy5zYXR0cjtcclxuICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgcHJldmlvdXNUYXNrWCA9IHRoaXMuX3Rhc2tWaWV3cy5sZW5ndGggPyB0aGlzLl90YXNrVmlld3NbMF0uZWwueCgpIDogMDtcclxuICAgICAgICB0aGlzLnN0YWdlLnNldEF0dHJzKHtcclxuLy8gICAgICAgICAgICB4IDogdGhpcy5fbGVmdFBhZGRpbmcsXHJcbiAgICAgICAgICAgIGhlaWdodDogTWF0aC5tYXgoJChcIi50YXNrc1wiKS5pbm5lckhlaWdodCgpICsgdGhpcy5fdG9wUGFkZGluZywgd2luZG93LmlubmVySGVpZ2h0IC0gJCh0aGlzLnN0YWdlLmdldENvbnRhaW5lcigpKS5vZmZzZXQoKS50b3ApLFxyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy4kZWwuaW5uZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdCb3VuZEZ1bmM6ICBmdW5jdGlvbihwb3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciB4O1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pblggPSAtIChsaW5lV2lkdGggLSB0aGlzLndpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvcy54ID4gc2VsZi5fbGVmdFBhZGRpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gc2VsZi5fbGVmdFBhZGRpbmc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvcy54IDwgbWluWCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBtaW5YO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gcG9zLng7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRyYWdnZWRUb0RheSA9IE1hdGguYWJzKHggLSBzZWxmLl9sZWZ0UGFkZGluZykgLyBzZWxmLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKS5kYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3Rhc2tWaWV3cy5sZW5ndGggfHwgIXByZXZpb3VzVGFza1gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2UueCh0aGlzLl9sZWZ0UGFkZGluZyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWlueCA9IC0obGluZVdpZHRoIC0gdGhpcy5zdGFnZS53aWR0aCgpKTtcclxuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy5fbGVmdFBhZGRpbmcgLSAodGhpcy5kcmFnZ2VkVG9EYXkgfHwgMCkgKiBzZWxmLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKS5kYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLngoTWF0aC5tYXgobWlueCwgeCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcblxyXG4gICAgfSxcclxuICAgIF9pbml0QmFja2dyb3VuZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzaGFwZSA9IG5ldyBLb252YS5TaGFwZSh7XHJcbiAgICAgICAgICAgIHNjZW5lRnVuYzogdGhpcy5fZ2V0U2NlbmVGdW5jdGlvbigpLFxyXG4gICAgICAgICAgICBzdHJva2U6ICdsaWdodGdyYXknLFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aCA6IDAsXHJcbiAgICAgICAgICAgIGZpbGwgOiAncmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgbmFtZSA6ICdncmlkJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG4gICAgICAgIHZhciBiYWNrID0gbmV3IEtvbnZhLlJlY3Qoe1xyXG4gICAgICAgICAgICBoZWlnaHQgOiB0aGlzLnN0YWdlLmhlaWdodCgpLFxyXG4gICAgICAgICAgICB3aWR0aCA6IHdpZHRoXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuQmxheWVyLmFkZChiYWNrKS5hZGQoc2hhcGUpO1xyXG4gICAgICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgfSxcclxuICAgIF9nZXRTY2VuZUZ1bmN0aW9uIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNkaXNwbGF5ID0gdGhpcy5zZXR0aW5ncy5zZGlzcGxheTtcclxuICAgICAgICB2YXIgc2F0dHIgPSB0aGlzLnNldHRpbmdzLnNhdHRyO1xyXG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9IHNkaXNwbGF5LmJvcmRlcldpZHRoIHx8IDE7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IDE7XHJcbiAgICAgICAgdmFyIHJvd0hlaWdodCA9IDIwO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xyXG4gICAgICAgICAgICB2YXIgaSwgcywgaUxlbiA9IDAsXHRkYXlzV2lkdGggPSBzYXR0ci5kYXlzV2lkdGgsIHgsXHRsZW5ndGgsXHRoRGF0YSA9IHNhdHRyLmhEYXRhO1xyXG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gRGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbiwgc2F0dHIuYm91bmRhcnlNYXgpICogc2F0dHIuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgLy9kcmF3IHRocmVlIGxpbmVzXHJcbiAgICAgICAgICAgIGZvcihpID0gMTsgaSA8IDQgOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8ob2Zmc2V0LCBpICogcm93SGVpZ2h0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGxpbmVXaWR0aCArIG9mZnNldCwgaSAqIHJvd0hlaWdodCAtIG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB5aSA9IDAsIHlmID0gcm93SGVpZ2h0LCB4aSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAocyA9IDE7IHMgPCAzOyBzKyspe1xyXG4gICAgICAgICAgICAgICAgeCA9IDA7IGxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBpTGVuID0gaERhdGFbc10ubGVuZ3RoOyBpIDwgaUxlbjsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg9aERhdGFbc11baV0uZHVyYXRpb24gKiBkYXlzV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgeGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgeWYpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMTBwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeCAtIGxlbmd0aCAvIDIsIHlmIC0gcm93SGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB5aSA9IHlmOyB5ZiA9IHlmICsgcm93SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4ID0gMDsgbGVuZ3RoID0gMDsgcyA9IDM7XHJcbiAgICAgICAgICAgIHZhciBkcmFnSW50ID0gcGFyc2VJbnQoc2F0dHIuZHJhZ0ludGVydmFsLCAxMCk7XHJcbiAgICAgICAgICAgIHZhciBoaWRlRGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiggZHJhZ0ludCA9PT0gMTQgfHwgZHJhZ0ludCA9PT0gMzApe1xyXG4gICAgICAgICAgICAgICAgaGlkZURhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlMZW4gPSBoRGF0YVtzXS5sZW5ndGg7IGkgPCBpTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IGhEYXRhW3NdW2ldLmR1cmF0aW9uICogZGF5c1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgeCA9IHggKyBsZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcclxuICAgICAgICAgICAgICAgIGlmIChoRGF0YVtzXVtpXS5ob2x5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeGksIHlpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSAtIGxlbmd0aCwgdGhpcy5nZXRTdGFnZSgpLmhlaWdodCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4aSAtIGxlbmd0aCwgeWkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4aSwgeWkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHhpLCB0aGlzLmdldFN0YWdlKCkuaGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnNnB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZGVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5mb250ID0gJzFwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHggLSBsZW5ndGggLyAyLCB5aSArIHJvd0hlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0cm9rZVNoYXBlKHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgX2NhY2hlQmFja2dyb3VuZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzYXR0ciA9IHRoaXMuc2V0dGluZ3Muc2F0dHI7XHJcbiAgICAgICAgdmFyIGxpbmVXaWR0aCA9IERhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sIHNhdHRyLmJvdW5kYXJ5TWF4KSAqIHNhdHRyLmRheXNXaWR0aDtcclxuICAgICAgICB0aGlzLkJsYXllci5maW5kT25lKCcuZ3JpZCcpLmNhY2hlKHtcclxuICAgICAgICAgICAgeCA6IDAsXHJcbiAgICAgICAgICAgIHkgOiAwLFxyXG4gICAgICAgICAgICB3aWR0aCA6IGxpbmVXaWR0aCxcclxuICAgICAgICAgICAgaGVpZ2h0IDogdGhpcy5zdGFnZS5oZWlnaHQoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9pbml0U2V0dGluZ3NFdmVudHMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTdGFnZUF0dHJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlQmFja2dyb3VuZCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuc2V0dGluZ3MsICdjaGFuZ2U6d2lkdGgnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3RhZ2VBdHRycygpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYWNoZUJhY2tncm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy5fdGFza1ZpZXdzLmZvckVhY2goZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RvclZpZXdzLmZvckVhY2goZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSxcclxuICAgIF9pbml0Q29sbGVjdGlvbkV2ZW50cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRUYXNrVmlldyh0YXNrKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdFJlc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAncmVtb3ZlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCByZW1vdmUnLCBfLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyB3YWl0IGZvciBsZWZ0IHBhbmVsIHVwZGF0ZXNcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YWdlQXR0cnMoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDApO1xyXG4gICAgICAgIH0sIDEwKSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydCBjaGFuZ2U6aGlkZGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdjaGFuZ2U6ZGVwZW5kJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2RlcGVuZCcpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRDb25uZWN0b3JWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ29ubmVjdG9yKHRhc2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RSZXNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ25lc3RlZFN0YXRlQ2hhbmdlJywgZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVWaWV3Rm9yTW9kZWwodGFzayk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZFRhc2tWaWV3KHRhc2spO1xyXG4gICAgICAgICAgICB0aGlzLl9yZXF1ZXN0UmVzb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXdGb3JNb2RlbCA6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgdmFyIHRhc2tWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gbW9kZWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlVmlldyh0YXNrVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX3JlbW92ZVZpZXcgOiBmdW5jdGlvbih0YXNrVmlldykge1xyXG4gICAgICAgIHRhc2tWaWV3LnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuX3Rhc2tWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl90YXNrVmlld3MsIHRhc2tWaWV3KTtcclxuICAgIH0sXHJcbiAgICBfcmVtb3ZlQ29ubmVjdG9yIDogZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgIHZhciBjb25uZWN0b3JWaWV3ID0gXy5maW5kKHRoaXMuX2Nvbm5lY3RvclZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3LmFmdGVyTW9kZWwgPT09IHRhc2s7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29ubmVjdG9yVmlldy5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cyA9IF8ud2l0aG91dCh0aGlzLl9jb25uZWN0b3JWaWV3cywgY29ubmVjdG9yVmlldyk7XHJcbiAgICB9LFxyXG4gICAgX2luaXRTdWJWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgdGhpcy5fYWRkVGFza1ZpZXcodGFzayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3RvclZpZXcodGFzayk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLl9yZXNvcnRWaWV3cygpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmRyYXcoKTtcclxuICAgIH0sXHJcbiAgICBfYWRkVGFza1ZpZXcgOiBmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgdmFyIHZpZXc7XHJcbiAgICAgICAgaWYgKHRhc2suaXNOZXN0ZWQoKSkge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IE5lc3RlZFRhc2tWaWV3KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFsb25lVGFza1ZpZXcoe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwgOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLkZsYXllci5hZGQodmlldy5lbCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl90YXNrVmlld3MucHVzaCh2aWV3KTtcclxuICAgIH0sXHJcbiAgICBfYWRkQ29ubmVjdG9yVmlldyA6IGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICB2YXIgZGVwZW5kSWQgPSB0YXNrLmdldCgnZGVwZW5kJyk7XHJcbiAgICAgICAgaWYgKCFkZXBlbmRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB2aWV3ID0gbmV3IENvbm5lY3RvclZpZXcoe1xyXG4gICAgICAgICAgICBiZWZvcmVNb2RlbCA6IHRoaXMuY29sbGVjdGlvbi5nZXQoZGVwZW5kSWQpLFxyXG4gICAgICAgICAgICBhZnRlck1vZGVsIDogdGFzayxcclxuICAgICAgICAgICAgc2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5GbGF5ZXIuYWRkKHZpZXcuZWwpO1xyXG4gICAgICAgIHZpZXcuZWwubW92ZVRvQm90dG9tKCk7XHJcbiAgICAgICAgdmlldy5yZW5kZXIoKTtcclxuICAgICAgICB0aGlzLl9jb25uZWN0b3JWaWV3cy5wdXNoKHZpZXcpO1xyXG4gICAgfSxcclxuICAgIF9yZXF1ZXN0UmVzb3J0IDogKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHdhaXRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb3J0Vmlld3MoKTtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCA1KTtcclxuICAgICAgICB9O1xyXG4gICAgfSgpKSxcclxuICAgIF9yZXNvcnRWaWV3cyA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBsYXN0WSA9IHRoaXMuX3RvcFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGFzay5nZXQoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZpZXcgPSBfLmZpbmQodGhpcy5fdGFza1ZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5tb2RlbCA9PT0gdGFzaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghdmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZpZXcuc2V0WShsYXN0WSk7XHJcbiAgICAgICAgICAgIGxhc3RZICs9IHZpZXcuaGVpZ2h0O1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xyXG4gICAgICAgICAgICB2YXIgZGVwZW5kSWQgPSB0YXNrLmdldCgnZGVwZW5kJyk7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykgfHwgIWRlcGVuZElkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGJlZm9yZU1vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChkZXBlbmRJZCk7XHJcbiAgICAgICAgICAgIHZhciBiZWZvcmVWaWV3ID0gXy5maW5kKHRoaXMuX3Rhc2tWaWV3cywgZnVuY3Rpb24odmlldykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcubW9kZWwgPT09IGJlZm9yZU1vZGVsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGFmdGVyVmlldyA9IF8uZmluZCh0aGlzLl90YXNrVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3Lm1vZGVsID09PSB0YXNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGNvbm5lY3RvclZpZXcgPSBfLmZpbmQodGhpcy5fY29ubmVjdG9yVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmJlZm9yZU1vZGVsID09PSBiZWZvcmVNb2RlbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTEoYmVmb3JlVmlldy5nZXRZKCkgKyBiZWZvcmVWaWV3Ll9mdWxsSGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIGNvbm5lY3RvclZpZXcuc2V0WTIoYWZ0ZXJWaWV3LmdldFkoKSAgKyBhZnRlclZpZXcuX2Z1bGxIZWlnaHQgLyAyKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuRmxheWVyLmJhdGNoRHJhdygpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FudHRDaGFydFZpZXc7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGF2cnRvbiBvbiAxNy4xMi4yMDE0LlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBCYXNpY1Rhc2tWaWV3ID0gcmVxdWlyZSgnLi9CYXNpY1Rhc2tWaWV3Jyk7XHJcblxyXG52YXIgTmVzdGVkVGFza1ZpZXcgPSBCYXNpY1Rhc2tWaWV3LmV4dGVuZCh7XHJcbiAgICBfY29sb3IgOiAnI2IzZDFmYycsXHJcbiAgICBfYm9yZGVyU2l6ZSA6IDYsXHJcbiAgICBfYmFySGVpZ2h0IDogMTAsXHJcbiAgICBfY29tcGxldGVDb2xvciA6ICcjQzk1RjEwJyxcclxuICAgIGVsIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gQmFzaWNUYXNrVmlldy5wcm90b3R5cGUuZWwuY2FsbCh0aGlzKTtcclxuICAgICAgICB2YXIgbGVmdEJvcmRlciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWzAsIDAsIHRoaXMuX2JvcmRlclNpemUgKiAxLjUsIDAsIDAsIHRoaXMuX2JvcmRlclNpemVdLFxyXG4gICAgICAgICAgICBjbG9zZWQgOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lIDogJ2xlZnRCb3JkZXInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JvdXAuYWRkKGxlZnRCb3JkZXIpO1xyXG4gICAgICAgIHZhciByaWdodEJvcmRlciA9IG5ldyBLb252YS5MaW5lKHtcclxuICAgICAgICAgICAgZmlsbCA6IHRoaXMuX2NvbG9yLFxyXG4gICAgICAgICAgICB5IDogdGhpcy5fdG9wUGFkZGluZyArIHRoaXMuX2JhckhlaWdodCxcclxuICAgICAgICAgICAgcG9pbnRzIDogWy10aGlzLl9ib3JkZXJTaXplICogMS41LCAwLCAwLCAwLCAwLCB0aGlzLl9ib3JkZXJTaXplXSxcclxuICAgICAgICAgICAgY2xvc2VkIDogdHJ1ZSxcclxuICAgICAgICAgICAgbmFtZSA6ICdyaWdodEJvcmRlcidcclxuICAgICAgICB9KTtcclxuICAgICAgICBncm91cC5hZGQocmlnaHRCb3JkZXIpO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH0sXHJcbiAgICBfdXBkYXRlRGF0ZXMgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBncm91cCBpcyBtb3ZlZFxyXG4gICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZGV0ZWN0IGludGVydmFsXHJcbiAgICAgICAgdmFyIGF0dHJzID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXHJcbiAgICAgICAgICAgIGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxyXG4gICAgICAgICAgICBkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xyXG5cclxuICAgICAgICB2YXIgcmVjdCA9IHRoaXMuZWwuZmluZCgnLm1haW5SZWN0JylbMF07XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLmVsLngoKSArIHJlY3QueCgpO1xyXG4gICAgICAgIHZhciBkYXlzMSA9IE1hdGguZmxvb3IoeCAvIGRheXNXaWR0aCk7XHJcbiAgICAgICAgdmFyIG5ld1N0YXJ0ID0gYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKTtcclxuICAgICAgICB0aGlzLm1vZGVsLm1vdmVUb1N0YXJ0KG5ld1N0YXJ0KTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2NhbGN1bGF0ZVgoKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5sZWZ0Qm9yZGVyJylbMF0ueCgwKTtcclxuICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLngoeC54MiAtIHgueDEpO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZVdpZHRoID0gKHgueDIgLSB4LngxKSAqIHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwO1xyXG4gICAgICAgIGlmIChjb21wbGV0ZVdpZHRoID4gdGhpcy5fYm9yZGVyU2l6ZSAvIDIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcubGVmdEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHgueDIgLSB4LngxKSAtIGNvbXBsZXRlV2lkdGggPCB0aGlzLl9ib3JkZXJTaXplIC8gMikge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmZpbmQoJy5yaWdodEJvcmRlcicpWzBdLmZpbGwodGhpcy5fY29tcGxldGVDb2xvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5maW5kKCcucmlnaHRCb3JkZXInKVswXS5maWxsKHRoaXMuX2NvbG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJhc2ljVGFza1ZpZXcucHJvdG90eXBlLnJlbmRlci5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmVzdGVkVGFza1ZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTW9kYWxFZGl0ID0gcmVxdWlyZSgnLi4vTW9kYWxUYXNrRWRpdFZpZXcnKTtcclxudmFyIENvbW1lbnRzID0gcmVxdWlyZSgnLi4vQ29tbWVudHNWaWV3Jyk7XHJcblxyXG5mdW5jdGlvbiBDb250ZXh0TWVudVZpZXcocGFyYW1zKSB7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBwYXJhbXMuY29sbGVjdGlvbjtcclxuICAgIHRoaXMuc2V0dGluZ3MgPSBwYXJhbXMuc2V0dGluZ3M7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICd1bCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykgfHwgJCh0aGlzKS5kYXRhKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmNvbGxlY3Rpb24uZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnZGVsZXRlJyl7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncHJvcGVydGllcycpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgTW9kYWxFZGl0KHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbCA6IG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzIDogc2VsZi5zZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2NvbW1lbnRzJyl7XHJcbiAgICAgICAgICAgICAgICBuZXcgQ29tbWVudHMoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsIDogbW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MgOiBzZWxmLnNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICB9KS5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAncm93QWJvdmUnKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaW5kZW50Jykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb2xsZWN0aW9uLmluZGVudChtb2RlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ291dGRlbnQnKXtcclxuICAgICAgICAgICAgICAgIHNlbGYuY29sbGVjdGlvbi5vdXRkZW50KG1vZGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBBYm92ZVwiLCBpY29uOiBcImFib3ZlXCIgfSxcclxuICAgICAgICAgICAgXCJyb3dCZWxvd1wiOiB7IG5hbWU6IFwiJm5ic3A7TmV3IFJvdyBCZWxvd1wiLCBpY29uOiBcImJlbG93XCIgfSxcclxuICAgICAgICAgICAgXCJpbmRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO0luZGVudCBSb3dcIiwgaWNvbjogXCJpbmRlbnRcIiB9LFxyXG4gICAgICAgICAgICBcIm91dGRlbnRcIjogeyBuYW1lOiBcIiZuYnNwO091dGRlbnQgUm93XCIsIGljb246IFwib3V0ZGVudFwiIH0sXHJcbiAgICAgICAgICAgIFwic2VwMVwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcInByb3BlcnRpZXNcIjogeyBuYW1lOiBcIiZuYnNwO1Byb3BlcnRpZXNcIiwgaWNvbjogXCJwcm9wZXJ0aWVzXCIgfSxcclxuICAgICAgICAgICAgXCJjb21tZW50c1wiOiB7IG5hbWU6IFwiJm5ic3A7Q29tbWVudHNcIiwgaWNvbjogXCJjb21tZW50XCIgfSxcclxuICAgICAgICAgICAgXCJzZXAyXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwiZGVsZXRlXCI6IHsgbmFtZTogXCImbmJzcDtEZWxldGUgUm93XCIsIGljb246IFwiZGVsZXRlXCIgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc29ydGluZGV4ID0gKHRoaXMuYXBwLnRhc2tzLmxhc3QoKS5nZXQoJ3NvcnRpbmRleCcpICsgMSk7XHJcbiAgICB9XHJcbiAgICBkYXRhLnNvcnRpbmRleCA9IHNvcnRpbmRleDtcclxuICAgIGRhdGEucGFyZW50aWQgPSByZWZfbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xyXG4gICAgdmFyIHRhc2sgPSB0aGlzLmNvbGxlY3Rpb24uYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRGF0ZVBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ0RhdGVQaWNrZXInLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzLmdldERPTU5vZGUoKSkuZGF0ZXBpY2tlcih7XHJcbi8vICAgICAgICAgICAgZGF0ZUZvcm1hdDogXCJkZC9tbS95eVwiLFxyXG4gICAgICAgICAgICBkYXRlRm9ybWF0OiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgIG9uU2VsZWN0IDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBuZXcgRGF0ZShkYXRlWzJdICsgJy0nICsgZGF0ZVsxXSArICctJyArIGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0IDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQodGhpcy5nZXRET01Ob2RlKCkpLmRhdGVwaWNrZXIoJ3Nob3cnKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCdkZXN0cm95Jyk7XHJcbiAgICB9LFxyXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlIDogZnVuY3Rpb24oKSB7XHJcbi8vICAgICAgICB0aGlzLmdldERPTU5vZGUoKS52YWx1ZSA9IHRoaXMucHJvcHMudmFsdWUudG9TdHJpbmcoJ2RkL21tL3l5Jyk7XHJcbiAgICAgICAgdmFyIGRhdGVTdHIgPSAkLmRhdGVwaWNrZXIuZm9ybWF0RGF0ZSh0aGlzLnByb3BzLmRhdGVGb3JtYXQsIHRoaXMucHJvcHMudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLnZhbHVlID0gZGF0ZVN0cjtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5kYXRlcGlja2VyKCBcInJlZnJlc2hcIiApO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbi8vICAgICAgICAgICAgZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXHJcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA6ICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgdGhpcy5wcm9wcy52YWx1ZSlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgVGFza0l0ZW0gPSByZXF1aXJlKCcuL1Rhc2tJdGVtJyk7XHJcblxyXG52YXIgTmVzdGVkVGFzayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGRpc3BsYXlOYW1lIDogJ05lc3RlZFRhc2snLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vbignY2hhbmdlOmhpZGRlbiBjaGFuZ2U6Y29sbGFwc2VkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXIgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3VidGFza3MgPSB0aGlzLnByb3BzLm1vZGVsLmNoaWxkcmVuLm1hcChmdW5jdGlvbih0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmdldCgnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGFzay5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICBpc1N1YlRhc2sgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnByb3BzLmRhdGVGb3JtYXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGFzay5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHRhc2suY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pZCcgOiB0YXNrLmNpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3ViVGFzayA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaWQnIDogdGhpcy5wcm9wcy5tb2RlbC5jaWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogdGhpcy5wcm9wcy5tb2RlbC5jaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsIDogdGhpcy5wcm9wcy5tb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZUZvcm1hdCA6IHRoaXMucHJvcHMuZGF0ZUZvcm1hdFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdzdWItdGFzay1saXN0IHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VidGFza3NcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZFRhc2s7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFRhc2tJdGVtID0gcmVxdWlyZSgnLi9UYXNrSXRlbScpO1xyXG52YXIgTmVzdGVkVGFzayA9IHJlcXVpcmUoJy4vTmVzdGVkVGFzaycpO1xyXG5cclxuZnVuY3Rpb24gZ2V0RGF0YShjb250YWluZXIpIHtcclxuICAgIHZhciBkYXRhID0gW107XHJcbiAgICB2YXIgY2hpbGRyZW4gPSAkKCc8b2w+JyArIGNvbnRhaW5lci5nZXQoMCkuaW5uZXJIVE1MICsgJzwvb2w+JykuY2hpbGRyZW4oKTtcclxuICAgIF8uZWFjaChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICB2YXIgJGNoaWxkID0gJChjaGlsZCk7XHJcbiAgICAgICAgdmFyIG9iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiAkY2hpbGQuZGF0YSgnaWQnKSxcclxuICAgICAgICAgICAgY2hpbGRyZW4gOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHN1Ymxpc3QgPSAkY2hpbGQuZmluZCgnb2wnKTtcclxuICAgICAgICBpZiAoc3VibGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgb2JqLmNoaWxkcmVuID0gZ2V0RGF0YShzdWJsaXN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5wdXNoKG9iaik7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBkYXRhO1xyXG59XHJcblxyXG52YXIgU2lkZVBhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgZGlzcGxheU5hbWU6ICdTaWRlUGFuZWwnLFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9uKCdhZGQgcmVtb3ZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5vbignY2hhbmdlOmhpZGRlbicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLl9tYWtlU29ydGFibGUoKTtcclxuICAgIH0sXHJcbiAgICBfbWFrZVNvcnRhYmxlIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoJy50YXNrLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIGNvbnRhaW5lci5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgIGdyb3VwOiAnc29ydGFibGUnLFxyXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3RvciA6ICdvbCcsXHJcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXIgc29ydC1wbGFjZWhvbGRlclwiLz4nLFxyXG4gICAgICAgICAgICBvbkRyYWdTdGFydCA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyYWcgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XHJcbiAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGdldERhdGEoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlciA9ICQoJzxkaXY+Jyk7XHJcbiAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kIDogJ2dyZXknLFxyXG4gICAgICAgICAgICBvcGFjaXR5IDogJzAuNScsXHJcbiAgICAgICAgICAgIHRvcCA6ICcwJyxcclxuICAgICAgICAgICAgd2lkdGggOiAnMTAwJSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyLm1vdXNlZW50ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaHRsaWdodGVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZW92ZXIoZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgJGVsID0gJChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHJld3JpdGUgdG8gZmluZCBjbG9zZXN0IHVsXHJcbiAgICAgICAgICAgIGlmICghJGVsLmRhdGEoJ2lkJykpIHtcclxuICAgICAgICAgICAgICAgICRlbCA9ICRlbC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICghJGVsLmRhdGEoJ2lkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZWwgPSAkZWwucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHBvcyA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5oaWdodGxpZ2h0ZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcCA6IHBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0IDogJGVsLmhlaWdodCgpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5tb3VzZWxlYXZlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIHJlcXVlc3RVcGRhdGUgOiAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHdhaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAod2FpdGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB3YWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgNSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSksXHJcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCAgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcudGFzay1jb250YWluZXInKS5zb3J0YWJsZShcImRlc3Ryb3lcIik7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsZWN0aW9uLm9mZihudWxsLCBudWxsLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmhpZ2h0bGlnaHRlci5yZW1vdmUoKTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB0YXNrcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucHJvcHMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRhc2sucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRhc2suZ2V0KCdoaWRkZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0YXNrLmNoaWxkcmVuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE5lc3RlZFRhc2ssIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbDogdGFzayxcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgOiB0YXNrLmNpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2RyYWctaXRlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRhc2suY2lkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRhc2tJdGVtLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0YXNrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0IDogdGhpcy5wcm9wcy5kYXRlRm9ybWF0XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnb2wnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3Rhc2stY29udGFpbmVyIHNvcnRhYmxlJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRhc2tzXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2lkZVBhbmVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERhdGVQaWNrZXIgPSByZXF1aXJlKCcuL0RhdGVQaWNrZXInKTtcclxudmFyIENvbW1ldHNWaWV3ID0gcmVxdWlyZSgnLi4vQ29tbWVudHNWaWV3Jyk7XHJcblxyXG52YXIgVGFza0l0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICBkaXNwbGF5TmFtZSA6ICdUYXNrSXRlbScsXHJcbiAgICBnZXRJbml0aWFsU3RhdGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBlZGl0Um93IDogdW5kZWZpbmVkXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBjb21wb25lbnREaWRVcGRhdGUgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMuZ2V0RE9NTm9kZSgpKS5maW5kKCdpbnB1dCcpLmZvY3VzKCk7XHJcbiAgICB9LFxyXG4gICAgY29tcG9uZW50RGlkTW91bnQgIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5vbignY2hhbmdlOm5hbWUgY2hhbmdlOmNvbXBsZXRlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpkdXJhdGlvbiBjaGFuZ2U6aGlnaHRsaWdodCBjaGFuZ2U6Q29tbWVudHMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ICA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwub2ZmKG51bGwsIG51bGwsIHRoaXMpO1xyXG4gICAgfSxcclxuICAgIF9maW5kTmVzdGVkTGV2ZWwgOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGV2ZWwgPSAwO1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLm1vZGVsLnBhcmVudDtcclxuICAgICAgICB3aGlsZSh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV2ZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV2ZWwrKztcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2NyZWF0ZUZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdFJvdyA9PT0gY29sKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVFZGl0RmllbGQoY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVJlYWRGaWxlZChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVSZWFkRmlsZWQgOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xyXG4gICAgICAgIGlmIChjb2wgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpICsgJyUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnc3RhcnQnIHx8IGNvbCA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQuZGF0ZXBpY2tlci5mb3JtYXREYXRlKHRoaXMucHJvcHMuZGF0ZUZvcm1hdCwgbW9kZWwuZ2V0KGNvbCkpO1xyXG4vLyAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXQoY29sKS50b1N0cmluZyh0aGlzLnByb3BzLmRhdGVGb3JtYXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBEYXRlLmRheXNkaWZmKG1vZGVsLmdldCgnc3RhcnQnKSwgbW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsLmdldChjb2wpO1xyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEYXRlRWxlbWVudCA6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnByb3BzLm1vZGVsLmdldChjb2wpO1xyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGRhdGVGb3JtYXQgOiB0aGlzLnByb3BzLmRhdGVGb3JtYXQsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoY29sLCBuZXdWYWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIF9kdXJhdGlvbkNoYW5nZSA6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG51bWJlciA9IHBhcnNlSW50KHZhbHVlLnJlcGxhY2UoIC9eXFxEKy9nLCAnJyksIDEwKTtcclxuICAgICAgICBpZiAoIW51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKCd3JykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRXZWVrcyhudW1iZXIpKTtcclxuICAgICAgICB9IGVsc2UgIGlmICh2YWx1ZS5pbmRleE9mKCdtJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldCgnZW5kJywgdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JykuY2xvbmUoKS5hZGRNb250aHMobnVtYmVyKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbnVtYmVyLS07XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0KCdlbmQnLCB0aGlzLnByb3BzLm1vZGVsLmdldCgnc3RhcnQnKS5jbG9uZSgpLmFkZERheXMobnVtYmVyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9jcmVhdGVEdXJhdGlvbkZpZWxkIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IERhdGUuZGF5c2RpZmYodGhpcy5wcm9wcy5tb2RlbC5nZXQoJ3N0YXJ0JyksIHRoaXMucHJvcHMubW9kZWwuZ2V0KCdlbmQnKSkrJyBkJztcclxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgIHZhbHVlIDogdGhpcy5zdGF0ZS52YWwgfHwgdmFsLFxyXG4gICAgICAgICAgICBrZXkgOiAnZHVyYXRpb24nLFxyXG4gICAgICAgICAgICBvbkNoYW5nZSA6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2R1cmF0aW9uQ2hhbmdlKG5ld1ZhbCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudmFsID0gbmV3VmFsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUudmFsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBfY3JlYXRlRWRpdEZpZWxkIDogZnVuY3Rpb24oY29sKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KGNvbCk7XHJcbiAgICAgICAgaWYgKGNvbCA9PT0gJ3N0YXJ0JyB8fCBjb2wgPT09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlRWxlbWVudChjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sID09PSAnZHVyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVEdXJhdGlvbkZpZWxkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXHJcbiAgICAgICAgICAgIGtleSA6IGNvbCxcclxuICAgICAgICAgICAgb25DaGFuZ2UgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldChjb2wsIG5ld1ZhbCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25LZXlEb3duIDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRSb3cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgb25CbHVyIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuZWRpdFJvdyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGNyZWF0ZUNvbW1lbnRGaWVsZCA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb21tZW50cyA9IHRoaXMucHJvcHMubW9kZWwuZ2V0KCdDb21tZW50cycpIHx8IDA7XHJcbiAgICAgICAgaWYgKCFjb21tZW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAga2V5IDogJ2NvbW1lbnRzJyxcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtY29tbWVudHMnLFxyXG4gICAgICAgICAgICAgICAgb25DbGljayA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb21tZXRzVmlldyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsIDogdGhpcy5wcm9wcy5tb2RlbFxyXG4gICAgICAgICAgICAgICAgICAgIH0pLnJlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2ltZycse1xyXG4gICAgICAgICAgICAgICAgc3JjIDogJ2Nzcy9pbWFnZXMvY29tbWVudHMucG5nJ1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgY29tbWVudHNcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuICAgIHNob3dDb250ZXh0IDogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciAkZWwgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICB2YXIgdWwgPSAkZWwucGFyZW50KCk7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKTtcclxuICAgICAgICB1bC5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgICAgIHggOiBvZmZzZXQubGVmdCArIDIwLFxyXG4gICAgICAgICAgICB5IDogb2Zmc2V0LnRvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbmRlciA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3VsJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICd0YXNrJyArICh0aGlzLnByb3BzLmlzU3ViVGFzayA/ICcgc3ViLXRhc2snIDogJycpLFxyXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlkJyA6IHRoaXMucHJvcHMubW9kZWwuY2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2sgOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBlLnRhcmdldC5jbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBlLnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sID0gY2xhc3NOYW1lLnNsaWNlKDQsIGNsYXNzTmFtZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0Um93ID0gY29sO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kQ29sb3InIDogdGhpcy5wcm9wcy5tb2RlbC5nZXQoJ2hpZ2h0bGlnaHQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdsaScsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgOiAnaW5mbycsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1pbmZvJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbWcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYyA6ICdjc3MvaW1hZ2VzL2luZm8ucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljayA6IHRoaXMuc2hvd0NvbnRleHRcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2xpJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA6ICdzb3J0aW5kZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA6ICdjb2wtc29ydGluZGV4J1xyXG4gICAgICAgICAgICAgICAgfSwgbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIDEpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA6ICduYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1uYW1lJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5pc05lc3RlZCgpID8gUmVhY3QuY3JlYXRlRWxlbWVudCgnaScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ3RyaWFuZ2xlIGljb24gJyArICh0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykgPyAncmlnaHQnIDogJ2Rvd24nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljayA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5zZXQoJ2NvbGxhcHNlZCcsICF0aGlzLnByb3BzLm1vZGVsLmdldCgnY29sbGFwc2VkJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9KSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA6ICh0aGlzLl9maW5kTmVzdGVkTGV2ZWwoKSAqIDEwKSArICdweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlRmllbGQoJ25hbWUnKSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbW1lbnRGaWVsZCgpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2NvbXBsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWNvbXBsZXRlJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2NvbXBsZXRlJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ3N0YXJ0JyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLXN0YXJ0J1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ3N0YXJ0JykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2VuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogJ2NvbC1lbmQnXHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLl9jcmVhdGVGaWVsZCgnZW5kJykpLFxyXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnbGknLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5IDogJ2R1cmF0aW9uJyxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgOiAnY29sLWR1cmF0aW9uJ1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5fY3JlYXRlRmllbGQoJ2R1cmF0aW9uJykpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbTtcclxuIl19
