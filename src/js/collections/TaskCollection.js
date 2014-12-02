var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: TaskModel,
	comparator : function(model) {
		return model.get('sortindex');
	},
	linkChildren : function() {
		"use strict";
		this.each(function(task) {
			if (!task.get('parentid')) {
				return;
			}
			this.get(task.get('parentid')).children.add(task);
		}.bind(this));
	},
	checkSortedIndex : function() {
		var sortIndex = 0;
		this.each(function(model) {
			model.set('sortindex', ++sortIndex);
			model.children.each(function(child) {
				child.set('sortindex', ++sortIndex);
			});
		});
		this.trigger('resort');
	},
	resort : function(data) {
		var sortIndex = 0;
		var self = this;
		data.forEach(function(parentData) {
			var parentModel = this.get(parentData.id);
			parentModel.set('sortindex', ++sortIndex).save();

			parentData.children.forEach(function(childData) {
				var childModel = self.get(childData.id);
				childModel.set('sortindex', ++sortIndex).save();
				if (childModel.get('parentid') !== parentModel.id) {
					childModel.set('parentid', parentModel.id);
					var parent = self.find(function(m) {
						return m.id === parentModel.id;
					});
					parent.children.add(childModel);
				}
			});
		}.bind(this));
	},
	subscribe : function() {
		this.listenTo(this, 'add', function(model) {
			if (model.get('parentid')) {
				var parent = this.find(function(m) {
					return m.id === model.get('parentid');
				});
				parent.children.add(model);
			}
		});
	}
});

module.exports = TaskCollection;

