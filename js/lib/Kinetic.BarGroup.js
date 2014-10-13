(function(Kinetic,Backbone){
	Kinetic.BarGroup=function(options){
		var groupOption,rectOption,setting;
		this.cid = _.uniqueId('bg');
		options || (options={});
		
		this.model=options.model || {};
		
		setting=this.setting=app.setting.getSetting('group');
		this.attr={
			height:0,
		}
		this.syncing=false;
		
		//rectOption.y=0;
		
		this.children=[];
		//this.height=0;
		//this.rowheight=30;
		//this.gap=5;  
		
		this.group=new Kinetic.Group(this.getGroupParams());
		this.topbar=new Kinetic.Rect(this.getRectparams());
		this.group.add(this.topbar);
		// this.group.add(leftTrinagle);
		// this.group.add(rightTrinagle);
		
		this.attr.height +=  setting.rowHeight;
		//this.height=this.rowheight;
		
		if(setting.draggable){
			this.makeDraggable();
		}
		if(setting.resizable){
			this.topbar.makeResizable();
		}
		this.initialize();
		

	}
	Kinetic.BarGroup.prototype={
		initialize:function(){
			var children=this.model.get('children');
			for(var i=0;i<children.length;i++){
				this.addChild(new Kinetic.Bar({model:children[i]}));
			}
			this.renderSortedChildren(true);
			this.renderDependency();
			this.bindEvents();
		},
		renderSortedChildren:function(nodraw){
			!nodraw && (nodraw=false);
			var sorted=_.sortBy(this.children,function(itembar){
				return itembar.model.get('sortindex');
			});
			this.attr.height=this.setting.rowHeight;
			for(var i=0;i<sorted.length;i++){
				sorted[i].setY(this.getHeight()+this.setting.gap);
				sorted[i].renderConnectors();
				this.attr.height += this.setting.rowHeight;
			}
			if(!nodraw)
				this.group.getLayer().draw();
			
		},
		findById:function(id){
			var children=this.children;
			for(var i=0;i<children.length;i++){
				if(children[i].model.get('id')===id)
					return children[i];
			}
			return false;

		},
		renderDependency:function(){
			var children=this.children,dependencies=[],bar;
			for(var i=0;i<children.length;i++){
				dependencies=children[i].model.get('dependency');
				for(var j=0;j<dependencies.length;j++){
					bar=this.findById(dependencies[j]['id']);
					if(bar){
						Kinetic.Bar.createRelation(bar,children[i]);
					}
				}
				
			}
		},

		makeDraggable: function(){
			var that=this;
			this.group.draggable(true);
			if(this.setting.dragBoundFunc){
				this.group.dragBoundFunc(this.setting.dragBoundFunc);
			}
			this.group.on('dragend',function(){
				that.sync();
			});
		},
		//returns the x position of the group
		//The x position of the group is set 0 initially.The topbar x position is set relative to groups 0 position initially. when the group is moved to get the absolute x position of the top bar use getX1 method.
		//The problem is when any children get outside of bound then the position of each children has to be updated. This way solves the problem
		getX:function(){
			return this.group.getX();
		},
		//returns the bbsolute x1 position of top bar
		getX1:function(){
			return this.group.getX()+this.topbar.getX();
		},
		//returns the absolute x1 position of top bar
		getX2:function(){
			return this.getX1()+this.topbar.getWidth();
		},
		getY1:function(){
			return this.group.getY();
		},
		setY:function(value){
			this.group.setY(value);
		},
		getWidth:function(){
			return this.topbar.getWidth();
		},
		getHeight:function(){
			return this.attr.height;
		},
		getCurrentHeight:function(){
			if(this.model.get('active'))
				return this.attr.height;
			else{
				return app.setting.getSetting('group','rowHeight');
			}
		},
		
		addChild: function(bar){
			this.children.push(bar);
			this.group.add(bar.group);
			var x=bar.getX1(true);
			//make bar x relative to this group
			bar.setParent(this);
			bar.setX1(x,{absolute:true,silent:true});
			bar.setY(this.getHeight()+this.setting.gap);
			this.attr.height += this.setting.rowHeight;
			bar.group.visible(this.model.get('active'));

		},
		renderChildren:function(){

			for(var i=0;i<this.children.length;i++){
				this.children[i].renderBar();
			}
			this.renderTopBar();

		},
		renderTopBar:function(){
			var parent=this.model.get('parent');
			var x=this.calculateX(parent);
			this.topbar.setX(x.x1-this.group.getX());
			this.topbar.setWidth(x.x2-x.x1);
		},
		bindEvents:function(){
			this.on('resize move',function(){
				var minX,maxX;
				minX=_.min(this.children,function(bar){
					return bar.getX1();
				}).getX1();
				maxX=_.max(this.children,function(bar){
					return bar.getX2();
				}).getX2();
				this.topbar.setX(minX);
				this.topbar.setWidth(maxX-minX);

			});
			this.listenTo(this.model,'change:active',this.toggleChildren);
			this.listenTo(this.model,'onsort',this.renderSortedChildren);
			
			
		},
		getGroupParams: function(){
			var setting=app.setting.getSetting('group');
			return _.extend({
				x:0,
				y:0,
			},setting.topBar);
			
		},
		calculateX:function(model){
			var attrs=app.setting.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			return {
				x1:(Date.daysdiff(boundaryMin,model.get('start'))-1)*daysWidth,
				x2:Date.daysdiff(boundaryMin,model.get('end'))*daysWidth,
			}
		},
		calculateParentDates:function(){
			var attrs=app.setting.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			var days1=Math.round(this.getX1(true)/daysWidth),days2=Math.round(this.getX2(true)/daysWidth);
			return {
				start: boundaryMin.clone().addDays(days1),
				end:boundaryMin.clone().addDays(days2-1)
			}
			
		},
		getRectparams:function(){
			var parent=this.model.get('parent');
			var xs=this.calculateX(parent);
			var setting=this.setting;
			return _.extend({
				x: xs.x1,
				width:xs.x2-xs.x1,
				y: setting.gap,
			},setting.topBar);
		},
		toggleChildren:function(){
			var show=this.model.get('active');
			var children=this.children;
			for(var i=0;i<children.length;i++){
				children[i].toggle(show)
			}
		},
		sync:function(){
			this.syncing=true;

			console.log('parent sync called');
			//sync parent first
			var pdates=this.calculateParentDates();
			var parent=this.model.get('parent');
			parent.set({start:pdates.start,end:pdates.end});
			
			var children=this.children;
			for(var i=0;i<children.length;i++){
				children[i].sync()
			}
			console.log('setting sync to false');
			this.syncing=false;
		},
		
	}
	_.extend(Kinetic.BarGroup.prototype,Backbone.Events);

}(Kinetic,Backbone));