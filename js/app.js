var app = app || {};
$(function() {
	$.get( "data/tasks.json", function( data ) {
		ganttData = data;
		window.data=data;
		app.ENTER_KEY=13;
		app.tasks=new app.TaskCollection();
		app.tasks.add(ganttData,{parse:true});
		//console.log(app.tasks);
		app.setting=new app.SettingModel();
		app.THCollection=app.TaskHierarchyCollection.importData(app.tasks,'parentid',0,'sortindex'); 
		console.log(app.THCollection);
		new app.GanttView().render();
		//new app.TasksView();

		// initalize parent selector
		$selector = $(".select-parent.dropdown").find('.menu');
		$selector.append('<div class="item" data-value="0">Main Project</div>');
		for (var i = 0; i < data.length; i++) {
			if(data[i].parentid == 0){
				$selector.append('<div class="item" data-value="'+data[i].id+'">'+data[i].name+'</div>');
			}
		};

		// initialize dropdown
		$(".select-parent.dropdown").dropdown();
	});
	// line adjustment
	setTimeout(function(){
		$('button[data-action="view-monthly"]').trigger('click');
	},1000);

	// Resources from backend
	$.get("data/resources.json",function(data){
		$resources = '<select id="resources"  name="resources[]" multiple="multiple">';
		for (var i = 0; i < data.length; i++) {
			$resources += '<option value="'+data[i].res_id+'">'+data[i].res_name+'</option>';
		}
		$resources += '</select>';
		// add backend to the task list
		$('.resources').append($resources);

		// initialize multiple selectors
		$('#resources').chosen({width: "95%"});
	});

	// assign random parent color
	$('input[name="color"]').val('#'+Math.floor(Math.random()*16777215).toString(16));

	// Item highlighter
});