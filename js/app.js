var app = app || {};
$(function() {
	
	app.ENTER_KEY=13;
	app.tasks=new app.TaskCollection();
	app.tasks.add(ganttData,{parse:true});
	app.setting=new app.SettingModel();
	app.THCollection=app.TaskHierarchyCollection.importData(app.tasks,'parentid',0,'sortindex');
	//console.log(app.THCollection);
	new app.GanttView().render();
	//new app.TasksView();
	
	
	
});