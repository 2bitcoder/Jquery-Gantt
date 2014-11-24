var app= app || {};
app.TaskHierarchyCollection = Backbone.Collection.extend({
	model: app.TaskHierarchyModel,
	comparator : function(model) {
		return model.get('parent').get('sortindex');
	},
	checkSortedIndex : function() {
		var sortIndex = 0;
		this.each(function(model) {
			model.get('parent').set('sortindex', ++sortIndex);
			model.get('children').each(function(child) {
				child.set('sortindex', ++sortIndex);
			});
		});
		this.trigger('resort');
	},
	resort : function(data) {
		var sortIndex = 0;
		var self = this;
		data.forEach(function(parentData) {
			var parentModel = app.tasks.get(parentData.id);
			parentModel.set('sortindex', ++sortIndex);
			parentData.children.forEach(function(childData) {
				var childModel = app.tasks.get(childData.id);
				childModel.set('sortindex', ++sortIndex);
				if (childModel.get('parentid') !== parentModel.id) {
					childModel.set('parentid', parentModel.id);
					var THparent = self.find(function(m) {
						return m.get('parent').id === parentModel.id;
					});
					THparent.children.add(childModel);
				}
			})
		});
	},
	subscribe : function(collection) {
		this.listenTo(collection, 'add', function(model) {
			if (model.get('parentid')) {
				var parent = this.find(function(m) {
					return m.get('parent').id === model.get('parentid');
				});
				parent.children.add(model);
				this.trigger('add', parent);
			} else {
				this.add({
					parent : model,
					children : []
				});
			}
		});
	}
},{
	// static function
	importData:function(collection, parentAttribute, rootid, sortBy){
		if(!collection instanceof Backbone.Collection){
			throw 'TaskHierarchyCollection can not import data of unknown collection';
		}

		if (!rootid) {
			rootid = 0;
		}
		
		var grouped = collection.groupBy(parentAttribute);
		
		if (!grouped[rootid]) {
			return false;
		}

		var sorted = _.sortBy(grouped[rootid],function(model){
			return model.get(sortBy);
		});

		var newCol = new app.TaskHierarchyCollection();

		sorted.forEach(function(model) {
			var tcol = {
				parent : model,
				children : []
			};
			var newModel = newCol.add(tcol, {silent:true});

			var id = model.get('id');
			if (grouped[id]) {
				newModel.addChildren(grouped[id]);
			}
		});

		newCol.subscribe(collection);

		// for(i=0;i<sorted.length;i++){ 
		// 	tcol={};
		// 	model=null;
		// 	id=sorted[i].get('id');
		// 	tcol['parent']=sorted[i];
		// 	tcol['children']=[];
		// 	model=newCol.add(tcol,{silent:true});
		// 	if(grouped[id]){
		// 		//console.log(grouped[id]);
		// 		model.addChildren(grouped[id]);
		// 	}
			
		// }
		
		return newCol;
		
	}

});