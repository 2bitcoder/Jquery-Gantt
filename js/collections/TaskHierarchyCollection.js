var app= app || {};
app.TaskHierarchyCollection=Backbone.Collection.extend({
	model: app.TaskHierarchyModel,
	/*add:function(models,options){
		var model=this.constructor.__super__.add.apply(this,arguments);
	}*/
	
},{
	//@param data: type collection
	importData:function(collection,parentAttribute,rootid,sortBy){
		
		if(!collection instanceof Backbone.Collection){
			throw 'TaskHierarchyCollection cacnot import data of unknown collection';
		}
		
		var grouped,tcol,sorted,i=0,id,newCol,model;
		!rootid && (rootid=0);
		
		grouped=collection.groupBy(parentAttribute);
		
		if(!grouped[rootid]) return false;
		sorted=_.sortBy(grouped[rootid],function(model){
			return model.get(sortBy);
		});
		newCol=new app.TaskHierarchyCollection();
		for(i=0;i<sorted.length;i++){ 
			tcol={};
			model=null;
			id=sorted[i].get('id');
			tcol['parent']=sorted[i];
			tcol['children']=[];
			model=newCol.add(tcol,{silent:true});
	
			if(grouped[id]){
				//console.log(grouped[id]);
				model.addChildren(grouped[id]);
			}
			
		}
		
		return newCol;
		
	}

})