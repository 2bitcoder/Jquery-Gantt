var app = app || {};

// disable sync while developing
Backbone.sync = function() {};


$(function () {
    'use strict';
	app.tasks = new app.TaskCollection();
	app.tasks.add(demoTasks, {parse: true});

	app.setting = new app.SettingModel();

	app.THCollection = app.TaskHierarchyCollection.importData(
		/*collection  =*/ app.tasks,
		/*parentAttribute  =*/'parentid',
		/*rootid =*/0,
		/*sortBy=*/ 'sortindex'
	);

	new app.GanttView().render();

	// initalize parent selector for "add task form"
	var $selector = $('.select-parent.dropdown').find('.menu');
	$selector.append('<div class="item" data-value="0">Main Project</div>');
	for (var i = 0; i < demoTasks.length; i++) {
		if(demoTasks[i].parentid === 0){
			$selector.append('<div class="item" data-value="'+demoTasks[i].id+'">'+demoTasks[i].name+'</div>');
		}
	}

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

	// Item highlighter
});
