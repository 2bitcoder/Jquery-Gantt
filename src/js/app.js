var demoResources = [{"wbsid":1,"res_id":1,"res_name":"Joe Black","res_allocation":60},{"wbsid":3,"res_id":2,"res_name":"John Blackmore","res_allocation":40}];

var TaskCollection = require('./collections/taskCollection');
var TaskHierarchyCollection = require('./collections/TaskHierarchyCollection');
var Settings = require('./models/SettingModel');

var GanttView = require('./views/GanttView');

var prepareAddForm = require('./views/prepareAddForm');
$(function () {
    'use strict';
	var app = window.app || {};
	app.tasks = new TaskCollection();

	app.tasks.fetch({
		success : function() {
			console.log('Success loading tasks.');
			app.setting = new Settings({}, {app : app});

			app.THCollection = TaskHierarchyCollection.importData(
				/*collection  =*/ app.tasks,
				/*parentAttribute  =*/'parentid',
				/*rootid =*/0,
				/*sortBy=*/ 'sortindex'
			);

			prepareAddForm();
			new GanttView({
				app : app
			}).render();

			// initalize parent selector for "add task form"
			var $selector = $('.select-parent.dropdown').find('.menu');
			$selector.append('<div class="item" data-value="0">Main Project</div>');
			app.tasks.each(function(task) {
				var parentId = task.get('parentid');
				if(parentId === 0){
					$selector.append('<div class="item" data-value="' + task.get('id') + '">' + task.get('name') + '</div>');
				}
			});

			// initialize dropdown
			$('.select-parent.dropdown').dropdown();
			// line adjustment
			setTimeout(function(){
				$('button[data-action="view-monthly"]').trigger('click');
			},1000);

			// Resources from backend
			var $resources = '<select id="resources"  name="resources[]" multiple="multiple">';
			for (var i = 0; i < demoResources.length; i++) {
				$resources += '<option value="'+demoResources[i].res_id+'">'+demoResources[i].res_name+'</option>';
			}
			$resources += '</select>';
			// add backend to the task list
			$('.resources').append($resources);

			// initialize multiple selectors
			$('#resources').chosen({width: '95%'});

			// assign random parent color
			$('input[name="color"]').val('#'+Math.floor(Math.random()*16777215).toString(16));
		},
		error : function(err) {
			console.error('error loading');
			console.error(err);
		}
	}, {parse: true});
});
