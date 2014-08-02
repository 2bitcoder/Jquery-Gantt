var app= app || {};
app.KCanvasView=Backbone.KineticView.extend({
	initialize: function(){
		this.groups=[];
		this.collection=app.THCollection;
		var setting=app.setting.getSetting('display');
		
		this.stage=new Kinetic.Stage({
			container : 'gantt-container',
			height: 580,
			width: setting.screenWidth-setting.tHiddenWidth-20,
			draggable:true,
			dragBoundFunc:app.util.hfunc,
		});
		this.Flayer=new Kinetic.Layer();
		this.Blayer=new Kinetic.Layer();
		
		this.initializeFrontLayer();
		this.initializeBackLayer();
		this.bindEvents();
		
		
		
	},
	initializeBackLayer:function(){
		var shape=new Kinetic.Shape({
			stroke: '#d0d0d0',
			strokeWidth: 1,
			sceneFunc:this.getSceneFunc()
		});
		this.Blayer.add(shape);
	
	},
	initializeFrontLayer:function(){
		this.collection.each(this.addGroup,this);
	},
	bindEvents:function(){
		var that=this;
		var calculating=false;
		this.listenTo(app.THCollection,'change:active',this.rendergroups);
		this.listenTo(app.setting,'change:interval change:dpi',this.renderBars);
		$('#gantt-container').mousewheel(function(e){
			
			if(calculating) return false;
			
			var cdpi=app.setting.get('dpi'),dpi=0;
			calculating=true;
			if(e.originalEvent.wheelDelta > 0){
				dpi = Math.max(1,cdpi-1);
			}
			else
				dpi = cdpi+1;
			
			if(dpi===1){
				if(app.setting.get('interval')==='auto')
					app.setting.set({interval:'daily'});
			}
			else
				app.setting.set({interval:'auto',dpi:dpi});
			calculating=false;
			return false;
		})
	
	},
	addGroup:function(taskgroup){
		this.groups.push(new Kinetic.BarGroup({model:taskgroup}));
	},
	initializeTaskGroup:function(){
		
	},
	render: function(){
		var groupi,gsetting=app.setting.getSetting('group');
		gsetting.currentY=gsetting.iniY;
		//console.log(this.groups);		
		for(var i=0;i<this.groups.length;i++){
			//console.log(gsetting.currentY);
			groupi=this.groups[i];
			groupi.setY(gsetting.currentY);
			gsetting.currentY += groupi.getCurrentHeight();
			this.Flayer.add(groupi.group);
		}
		this.stage.add(this.Blayer);
		this.stage.add(this.Flayer);
		
		return this;
	},
	renderBars:function(){
		for(var i=0;i<this.groups.length;i++){
			//console.log(gsetting.currentY);
			this.groups[i].renderChildren();
		} 
		this.Flayer.draw();
		this.Blayer.draw();
	},
	rendergroups:function(){
		console.log('rendering');
		var groupi,gsetting=app.setting.getSetting('group'),sorted=[];
		sorted=_.sortBy(this.groups,function(itemview){ return itemview.model.get('parent').get('sortindex') });
		console.log(sorted);
		gsetting.currentY=gsetting.iniY;
		//console.log(this.groups);		
		for(var i=0;i<sorted.length;i++){
			//console.log(gsetting.currentY);
			groupi=sorted[i];
			groupi.setY(gsetting.currentY);
			gsetting.currentY += groupi.getCurrentHeight();
		}  
		groupi=null;
		this.Flayer.draw();
	
	},
	setWidth:function(value){
		
		this.stage.setWidth(value);
	},
	getSceneFunc:function(){
		var setting=app.setting,sdisplay=setting.sdisplay;
		var borderWidth=sdisplay.borderWidth || 1;
		var offset=borderWidth/2;
		var rowHeight=20;
		return function(context){
			var lineWidth,sattr=setting.sattr;
			
			var i=0,
				s=0,
				iLen=0,
				daysWidth=sattr.daysWidth,
				x,
				length,
				hData=sattr.hData;
			
			lineWidth=Date.daysdiff(sattr.boundaryMin,sattr.boundaryMax)*sattr.daysWidth;
			
			context.beginPath();
			//draw three lines
			for(i=1;i<4;i++){
				context.moveTo(offset, i*rowHeight-offset);
				context.lineTo(lineWidth+offset, i*rowHeight-offset);
			}

			var yi=0,yf=rowHeight,xi=0;
			for(s=1;s<3;s++){
				x=0,length=0;
				for(i=0,iLen=hData[s].length;i<iLen;i++){
					length=hData[s][i].duration*daysWidth;
					x = x+length;
					xi = x - borderWidth + offset;
					context.moveTo(xi,yi);
					context.lineTo(xi,yf);
					
					context._context.save();
					context._context.font = '10pt Arial,Helvetica,sans-serif';
					context._context.textAlign = 'center';
					context._context.textBaseline = 'middle';
					context._context.fillText(hData[s][i].text, x-length/2,yf-rowHeight/2);
					context._context.restore();
				}
				yi=yf,yf= yf+rowHeight;
			}
			
			x=0,length=0,s=3,yf=1200;
			for(i=0,iLen=hData[s].length;i<iLen;i++){
				length=hData[s][i].duration*daysWidth;
				x = x+length;
				xi = x - borderWidth + offset;
				context.moveTo(xi,yi);
				context.lineTo(xi,yf);
				
				context._context.save();
				context._context.font = '6pt Arial,Helvetica,sans-serif';
				context._context.textAlign = 'center';
				context._context.textBaseline = 'middle';
				context._context.fillText(hData[s][i].text, x-length+5,yi+rowHeight/2);
				context._context.restore();
			}
			
			context.strokeShape(this);
			
			
		}
	
	},
	renderBackLayer: function(){
		
	
	}


});