var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: TaskModel
});

module.exports = TaskCollection;

