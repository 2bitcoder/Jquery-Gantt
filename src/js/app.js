"use strict";

var TaskCollection = require('./collections/taskCollection');
var Settings = require('./models/SettingModel');

var GanttView = require('./views/GanttView');
var util = require('./utils/util');
var params = util.getURLParams();

function getConfig(cb) {
    var configURL;
    // load statuses settings
    if (window.location.hostname.indexOf('localhost') === -1) {
        configURL = '/api/GanttConfig/wbs/' + params.project + '/' + params.sitekey;
    } else {
        configURL = '/api/GanttConfig';
    }
    $.getJSON(configURL, function(statuses) {
        cb(statuses);
    });
}

function fetchCollection(app) {
	app.tasks.fetch({
		success : function() {
            // add empty task if no tasks from server
            if (app.tasks.length === 0) {
                app.tasks.reset([{
                    name : 'New task'
                }]);

            }
			console.log('Success loading tasks.');
			app.tasks.linkChildren();
			app.tasks.checkSortedIndex();





			new GanttView({
				app : app,
				collection : app.tasks
			}).render();

			$('#loader').fadeOut();
		},
		error : function(err) {
			console.error('error loading');
			console.error(err);
		},
		parse: true,
		reset : true
	});
}


$(function () {
	var app = {};
	app.tasks = new TaskCollection();
    app.settings = new Settings({}, {app : app});

	// detect API params from get, e.g. ?project=143&profile=17&sitekey=2b00da46b57c0395
	var params = util.getURLParams();
	if (params.project && params.profile && params.sitekey) {
		app.tasks.url = 'api/tasks/' + params.project + '/' + params.profile + '/' + params.sitekey;
	}
    getConfig(function(statuses) {
        app.settings.statuses = statuses;
        fetchCollection(app);
    });
});