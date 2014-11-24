var app= app || {};

app.TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: app.TaskModel
});

