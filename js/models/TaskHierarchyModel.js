var app=app || {};

app.TaskHierarchyModel = Backbone.Model.extend({
	defaults:{
		parent: null,
		active: true
	},
	initialize : function() {
		this.children = new Backbone.Collection();
		this.listenTo(this.children, 'change:parentid', function(child) {
			this.children.remove(child);
		});
		this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);
	},
	addChildren:function(children){
		children.forEach(function(child) {
			this.children.add(child);
		}.bind(this));
	},
	_checkTime : function() {
		console.log('checking time on', this.get('parent').get('name'));
		var startTime = this.children.at(0).get('start');
		var endTime = this.children.at(0).get('end');
		this.children.each(function(child) {
			var childStartTime = child.get('start');
			var childEndTime = child.get('end');
			if(childStartTime.compareTo(startTime) === -1) {
				startTime = childStartTime;
			}
			if(childEndTime.compareTo(endTime) === 1){
				endTime = childEndTime;
			}
		}.bind(this));
		this.get('parent').set('start', startTime);
		console.log('new start', startTime);
		this.get('parent').set('end', endTime);

	}
});