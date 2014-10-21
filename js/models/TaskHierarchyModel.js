var app=app || {};

app.TaskHierarchyModel = Backbone.Model.extend({
	defaults:{
		parent: null,
		children: [],
		active: true,
	},
	addChildren:function(children, options){
		children.forEach(function(child) {
			this.addChild(child, options);
		}.bind(this));
	},
	addChild:function(child,options){
		options = options || {};
		var parent = this.get('parent');
		var children=this.get('children');
		if (children.length === 0) {
			parent.set('start', child.get('start'), options);
			parent.set('end', child.get('end'), options);
		} else{
			var start = child.get('start');
			var end = child.get('end');
			if(start.compareTo(parent.get('start')) === -1) {
				parent.set('start', start, options);
			}
			if(end.compareTo(parent.get('end')) === 1){
				parent.set('end', end, options);
			}
		}
		children.push(child);
	}	
});