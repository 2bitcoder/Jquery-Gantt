// require('babel/external-helpers');

import TaskCollection from './collections/TaskCollection';
import Settings from './models/SettingModel';

import GanttView from './views/GanttView';
import {tasksURL, configURL} from './clientConfig';


function loadTasks(tasks) {
    var dfd = new $.Deferred();
	tasks.fetch({
		success: function() {
            dfd.resolve();
		},
		error: function(err) {
            dfd.reject(err);
		},
		parse: true,
		reset: true
	});
    return dfd.promise();
}

function loadSettings(settings) {
    return $.getJSON(configURL)
        .then((data) => {
            settings.statuses = data;
        });
}


$(() => {
	let tasks = new TaskCollection();
    tasks.url = tasksURL;
    let settings = new Settings({}, {tasks: tasks});

    window.tasks = tasks;

    $.when(loadTasks(tasks))
    .then(() => loadSettings(settings))
    .then(() => {
        console.log('Success loading tasks.');
        new GanttView({
            settings: settings,
            collection: tasks
        }).render();
    })
    .then(() => {
        tasks.setDefaultStatusId(settings.getDefaultStatusId());
        tasks.setClosedStatusId(settings.getClosedStatusId());
    })
    .then(() => {
        // hide loading
        $('#loader').fadeOut(function() {

            // display head always on top
            $('#head').css({
                position: 'fixed'
            });

            // enable scrolling
            $('body').removeClass('hold-scroll');
        });
    }).fail((error) => {
        console.error('Error while loading', error);
    });
});
