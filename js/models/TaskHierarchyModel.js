var app=app || {};
app.TaskHierarchyModel=Backbone.Model.extend({
	defaults:{
		parent: null,
		children: [],
		active: true,
	},
	/*initialize:function(){
		var kmodel=new Kinetic.BarGroup({
			x:0,
			y:0,
			color:'black',
			height:4,
			width:4
		},{});
		this.equivalent=kmodel;
		kmodel.equivalent=this;
	},*/
	addChildren:function(children,options){
		//console.log(children);
		options || (options={});
		if(_.isArray(children)){
			for(var i=0;i<children.length;i++){
				this.addChild(children[i],options);
			}
			return true;
		}
	},
	addChild:function(child,options){
		options || (options={});
		var parent,children,start,end;
		parent=this.get('parent');
		children=this.get('children');
		if(children.length==0){
			parent.set('start',child.get('start'),options);
			parent.set('end',child.get('end'),options);
		}
		else{
			start=child.get('start'),end=child.get('end');
			if(start.compareTo(parent.get('start'))===-1){
				parent.set('start',start,options);
			}
			if(end.compareTo(parent.get('end'))===1){
				parent.set('end',end,options);
			}
			
		}
		children.push(child);
		
	}
	//,

	//url:"ci_api/index.php/api/gantt/debug_request"
	
});