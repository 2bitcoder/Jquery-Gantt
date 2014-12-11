var Bar = require('./Bar');

var BarGroup = function(options){
	this.cid = _.uniqueId('bg');
	this.settings = options.settings;
	this.model = options.model;
	var setting = this.setting = options.settings.getSetting('group');
	this.attr = {
		height: 0
	};
	this.syncing = false;
	this.children = [];

	this.group = new Kinetic.Group(this.getGroupParams());
	this.topbar = new Kinetic.Rect(this.getRectparams());
	this.group.add(this.topbar);

	this.attr.height +=  setting.rowHeight;

	if(setting.draggable){
		this.makeDraggable();
	}
	if(setting.resizable){
		this.topbar.makeResizable();
	}
	this.initialize();
};

BarGroup.prototype={
		initialize:function(){
			this.model.children.each(function(child) {
				this.addChild(new Bar({
					model:child,
					settings : this.settings
				}));
			}.bind(this));

			this.listenTo(this.model.children, 'add', function(child) {
				this.addChild(new Bar({
					model:child,
					settings : this.settings
				}));
				this.renderSortedChildren(true);
			}.bind(this));

			this.listenTo(this.model.children, 'remove', function(child) {
				var viewForDelete = _.find(this.children, function(m) {
					return m.model === child;
				});
				this.children = _.without(this.children, viewForDelete);
				viewForDelete.destroy();
				this.renderSortedChildren(true);
			}.bind(this));
			this.renderSortedChildren(true);
			this.renderDependency();
			this.bindEvents();
		},
		destroy : function() {
			this.group.destroy();
		},
		renderSortedChildren:function(nodraw){
			!nodraw && (nodraw=false);
			var sorted=_.sortBy(this.children, function(itembar){
				return itembar.model.get('sortindex');
			});
			this.attr.height=this.setting.rowHeight;
			for(var i=0;i<sorted.length;i++){
				sorted[i].setY(this.getHeight()+this.setting.gap);
				sorted[i].renderConnectors();
				this.attr.height += this.setting.rowHeight;
			}
			if(!nodraw) {
				this.group.getLayer().draw();
			}
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
						Bar.createRelation(bar,children[i]);
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
			if(this.model.get('active'))
				return this.attr.height;
			else{
				return this.settings.getSetting('group','rowHeight');
			}
		},
		getCurrentHeight:function(){
			if(this.model.get('active'))
				return this.attr.height;
			else{
				return this.settings.getSetting('group','rowHeight');
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
			var parent=this.model;
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
			this.listenTo(this.model, 'change:active', this.toggleChildren);
			this.listenTo(this.model, 'onsort', this.renderSortedChildren);
			this.listenTo(this.model, 'change:start change:end', function() {

				this.topbar.setAttrs(this.getRectparams());
				this.topbar.getLayer().draw();
			});

		},
		getGroupParams: function(){
			return _.extend({
				x: 0,
				y: 0
			}, this.setting.topBar);
			
		},
		calculateX:function(){
			var attrs = this.settings.getSetting('attr'),
			boundaryMin = attrs.boundaryMin,
			daysWidth = attrs.daysWidth;
			return {
				x1: (Date.daysdiff(boundaryMin, this.model.get('start'))) * daysWidth - this.group.x(),
				x2: Date.daysdiff(boundaryMin, this.model.get('end')) * daysWidth - this.group.x()
			};
		},
		calculateParentDates:function(){
			var attrs = this.settings.getSetting('attr'),
				boundaryMin = attrs.boundaryMin,
				daysWidth = attrs.daysWidth;
			var days1 = Math.round(this.getX1(true)/daysWidth),days2=Math.round(this.getX2(true)/daysWidth);
			return {
				start: boundaryMin.clone().addDays(days1),
				end: boundaryMin.clone().addDays(days2 - 1)
			};
		},
		getRectparams:function(){
			var xs=this.calculateX(this.model);
			var setting = this.setting;
			return _.extend({
				x: xs.x1,
				width: xs.x2 - xs.x1,
				y: setting.gap
			}, setting.topBar);
		},
		toggleChildren: function(){
			var show = this.model.get('active');
			this.children.forEach(function(child) {
				child.toggle(show);
			});
		},
		sync:function(){
			this.syncing = true;

			var pdates = this.calculateParentDates();
			this.model.set({
				start: pdates.start,
				end:pdates.end
			});


			var children = this.children;
			children.forEach(function(child) {
				child.sync();
			});

			this.syncing = false;
		}
	};

_.extend(BarGroup.prototype, Backbone.Events);

module.exports = BarGroup;
