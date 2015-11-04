var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url: 'api/tasks',
	model: TaskModel,
	initialize: function() {
		this._preventSorting = false;
		this.subscribe();
	},
	comparator: function(model) {
		return model.get('sortindex');
	},
	linkChildren: function() {
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
				console.error('task has parent with id ' + task.get('parentid') + ' - but there is no such task');
				task.unset('parentid');
			}
		}.bind(this));
	},
	_sortChildren: function (task, sortIndex) {
		task.children.toArray().forEach(function(child) {
			child.set('sortindex', ++sortIndex);
			sortIndex = this._sortChildren(child, sortIndex);
		}.bind(this));
		return sortIndex;
	},
	checkSortedIndex: function() {
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
	_resortChildren: function(data, startIndex, parentID) {
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
	resort: function(data) {
		this._preventSorting = true;
		this._resortChildren(data, -1, 0);
		this._preventSorting = false;
		this.sort();
	},
	subscribe: function() {
        this.listenTo(this, 'reset', () => {
            // add empty task if no tasks from server
            if (this.length === 0) {
                this.reset([{
                    name: 'New task'
                }]);
            }
        });
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
	createDependency: function (beforeModel, afterModel) {
		if (this._canCreateDependence(beforeModel, afterModel)) {
			afterModel.dependOn(beforeModel);
		}
	},

	_canCreateDependence: function(beforeModel, afterModel) {
		if (beforeModel.hasParent(afterModel) || afterModel.hasParent(beforeModel)) {
			return false;
		}
		if (beforeModel.hasInDeps(afterModel) ||
			afterModel.hasInDeps(beforeModel)) {
			return false;
		}
		return true;
	},
	removeDependency: function(afterModel) {
		afterModel.clearDependence();
	},
	_checkDependencies: function() {
		this.each((task) => {
			var ids = task.get('depend').concat([]);
			var hasGoodDepends = false;
			if (ids.length === 0) {
				return;
			}

			_.each(ids, (id) => {
				var beforeModel = this.get(id);
				if (beforeModel) {
					task.dependOn(beforeModel, true);
					hasGoodDepends = true;
				}
			});
			if (!hasGoodDepends) {
				task.save('depend', []);
			}
		});
	},
	outdent: function(task) {
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
            if (child.depends.get(task.id)) {
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
	indent: function(task) {
		var prevTask, i, m;
		for (i = this.length - 1; i >= 0; i--) {
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
    importTasks: function(taskJSONarray, callback) {
		var sortindex = -1;
		if (this.last()) {
			sortindex = this.last().get('sortindex');
		}
        taskJSONarray.forEach(function(taskItem) {
            taskItem.sortindex = ++sortindex;
        });
        var length = taskJSONarray.length;
        var done = 0;
        this.add(taskJSONarray, {parse: true}).forEach((task) => {
            task.save({}, {
                success: () => {
                    done += 1;
                    if (done === length) {
                        callback();
                    }
                }
            });
        });
    },
    createDeps: function(data) {
		this._preventSorting = true;
        data.parents.forEach(function(item) {
            var parent = this.findWhere({
                name: item.parent.name,
				outline: item.parent.outline
            });
            var child = this.findWhere({
                name: item.child.name,
				outline: item.child.outline
            });
            child.save('parentid', parent.id);
        }.bind(this));

		data.deps.forEach(function(dep) {
            var beforeModel = this.findWhere({
                name: dep.before.name,
				outline: dep.before.outline
            });
            var afterModel = this.findWhere({
                name: dep.after.name,
				outline: dep.after.outline
            });
            this.createDependency(beforeModel, afterModel);
        }.bind(this));
		this._preventSorting = false;
		this.checkSortedIndex();
    }
});

module.exports = TaskCollection;
