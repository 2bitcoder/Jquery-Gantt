"use strict";

var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: TaskModel,
	initialize : function() {
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
		var sortIndex = 0;
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
//		var sortIndex = 0;
		this._resortChildren(data, -1, 0);
		this.sort();
//		var self = this;
//		data.forEach(function(parentData) {
//			var parentModel = this.get(parentData.id);
//			var prevSort = parentModel.get('sortindex');
//			if (prevSort !== ++sortIndex) {
//				parentModel.set('sortindex', sortIndex).save();
//			}
//			if (parentModel.get('parentid')) {
//				parentModel.set('parentid', 0).save();
//			}
//			parentData.children.forEach(function(childData) {
//				var childModel = self.get(childData.id);
//				var prevSortI = childModel.get('sortindex');
//				if (prevSortI !== ++sortIndex) {
//					childModel.set('sortindex', sortIndex).save();
//				}
//				if (childModel.get('parentid') !== parentModel.id) {
//					childModel.set('parentid', parentModel.id).save();
//					var parent = self.find(function(m) {
//						return m.id === parentModel.id;
//					});
//					parent.children.add(childModel);
//				}
//			});
//		}.bind(this));
//		this.checkSortedIndex();
	},
	subscribe : function() {
		this.listenTo(this, 'add', function(model) {
			if (model.get('parentid')) {
				var parent = this.find(function(m) {
					return m.id === model.get('parentid');
				});
				if (parent) {
					parent.children.add(model);
				} else {
					console.warn('can not find parent with id ' + model.get('parentid'));
					model.set('parentid', 0);
				}
			}
		});
		this.listenTo(this, 'reset', function() {
			this.linkChildren();
		});
		this.listenTo(this, 'change:parentid', function(model) {
			var parent = this.get(model.get('parentid'));
			if (parent) {
				parent.children.add(model);
			}
		});
	},
	createDependency : function (beforeModel, afterModel) {
		afterModel.set('depend', beforeModel.id);
	}
});

module.exports = TaskCollection;

