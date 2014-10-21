var app= app || {};
app.TaskHierarchyCollection = Backbone.Collection.extend({
	model: app.TaskHierarchyModel,
},{
	//@param data: type collection
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