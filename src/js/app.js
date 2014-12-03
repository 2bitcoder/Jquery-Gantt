
var TaskCollection = require('./collections/taskCollection');
var Settings = require('./models/SettingModel');

var GanttView = require('./views/GanttView');

$(function () {
    'use strict';
	var app = window.app || {};
	app.tasks = new TaskCollection();

	app.tasks.fetch({
		success : function() {
			console.log('Success loading tasks.');
			app.setting = new Settings({}, {app : app});
			app.tasks.linkChildren();
			new GanttView({
				app : app,
				collection : app.tasks
			}).render();
		},
		error : function(err) {
			console.error('error loading');
			console.error(err);
		}
	}, {parse: true});
});
