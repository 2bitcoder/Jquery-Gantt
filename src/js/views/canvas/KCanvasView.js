var BarGroup = require('./BarGroup');
var Bar = require('./Bar');

var viewOptions = ['model', 'collection'];

var KineticView = Backbone.KineticView = function(options) {
	this.cid = _.uniqueId('view');
	_.extend(this, _.pick(options, viewOptions));
	this.initialize.apply(this, arguments);
};
_.extend(KineticView.prototype, Backbone.Events, {
	initialize: function(){},
	render: function() {
		return this;
	}
});


KineticView.extend=Backbone.Model.extend;

var KCanvasView = KineticView.extend({
	initialize: function(params){
		this.app = params.app;
		this.groups=[];
		this.settings = this.app.setting;
		var setting =  this.app.setting.getSetting('display');
		
		this.stage = new Kinetic.Stage({
			container : 'gantt-container',
			height: 580,
			width: setting.screenWidth - setting.tHiddenWidth - 20,
			draggable: true,
			dragBoundFunc:  function(pos) {
				return {
					x: pos.x,
					y: this.getAbsolutePosition().y
				};
			}
		});
		
		this.Flayer = new Kinetic.Layer({});
		this.Blayer = new Kinetic.Layer({});
		
		this.listenTo( this.app.tasks, 'change:sortindex', this.renderRequest);

		this.listenTo(this.collection, 'add', function(model) {
			if (!parseInt(model.get('parentid'), 10)) {
				return;
			}
			this.groups.push(new BarGroup({
				model: model,
				settings : this.settings
			}));

			var gsetting =  this.app.setting.getSetting('group');
			gsetting.currentY = gsetting.iniY;

			this.groups.forEach(function(groupi) {
				groupi.setY(gsetting.currentY);
				gsetting.currentY += groupi.getHeight();
				this.Flayer.add(groupi.group);
			}.bind(this));
			this.rendergroups();
		});
		this.initializeFrontLayer();
		this.initializeBackLayer();
		this.bindEvents();
	},
	renderRequest : (function() {
		var waiting = false;
		return function() {
			if (waiting) {
				return;
			}
			waiting = true;
			setTimeout(function() {
				this.rendergroups();
				waiting = false;
			}.bind(this), 10);
		};
	})(),
	initializeBackLayer:function(){
		var shape = new Kinetic.Shape({
			stroke: '#bbb',
			strokeWidth: 0,
			sceneFunc:this.getSceneFunc()
		});
		this.Blayer.add(shape);
		
	},
	initializeFrontLayer:function(){
		this.collection.each(function(task) {
			"use strict";
			if (!task.get('parentid')) {
				this.addGroup(task);
			}
		}, this);
	},
	bindEvents:function(){
		var calculating=false;
		this.listenTo( this.collection, 'change:active', this.rendergroups);
		this.listenTo( this.app.setting, 'change:interval change:dpi', this.renderBars);
		$('#gantt-container').mousewheel(function(e){
			if(calculating) {
				return false;
			}
			var cdpi =  this.settings.get('dpi'), dpi=0;
			calculating=true;
			if (e.originalEvent.wheelDelta > 0){
				dpi = Math.max(1, cdpi - 1);
			} else {
				dpi = cdpi + 1;
			}
			if (dpi === 1){
				if ( this.app.setting.get('interval') === 'auto') {
					 this.app.setting.set({interval:'daily'});
				}
			} else {
				 this.app.setting.set({interval: 'auto', dpi: dpi});
			}
			calculating = false;
			return false;
		}.bind(this));

		if (calculating) {
			return false;
		}

		var cdpi =  this.app.setting.get('dpi'), dpi=0;
		calculating  =true;
		dpi = Math.max(0, cdpi + 25);

		if (dpi === 1) {
			if( this.app.setting.get('interval')==='auto') {
				 this.app.setting.set({interval:'daily'});
			}
		} else {
			 this.app.setting.set({interval: 'auto', dpi: dpi});
		}

		calculating = false;
		$('#gantt-container').on('dragmove', function(){
			if(calculating) {
				return false;
			}
			var cdpi =  this.app.setting.get('dpi'), dpi=0;
			calculating = true;
			dpi = cdpi + 1;

			if(dpi===1){
				if ( this.app.setting.get('interval') === 'auto') {
					 this.app.setting.set({interval: 'daily'});
				}
			} else {
				 this.app.setting.set({interval:'auto',dpi:dpi});
			}
			calculating = false;
			return false;
		}.bind(this));
	},

	addGroup: function(taskgroup) {
		this.groups.push(new BarGroup({
			model: taskgroup,
			settings : this.app.setting
		}));
	},

	render: function(){
		var gsetting =  this.app.setting.getSetting('group');

		gsetting.currentY = gsetting.iniY;
		
		this.groups.forEach(function(groupi) {
			groupi.setY(gsetting.currentY);
			gsetting.currentY += groupi.getHeight();
			this.Flayer.add(groupi.group);
		}.bind(this));


		//loop through groups
		for(var i = 0; i < this.groups.length; i++){

			//loop through tasks
			for(var j = 0; j < this.groups[i].children.length; j++){

				//if threre is dependency
				if (this.groups[i].children[j].model.attributes.dependency !== ''){

					//parse dependencies
					var dependency = $.parseJSON(this.groups[i].children[j].model.attributes.dependency);

					for(var l=0; l < dependency.length; l++){
						for( var k=0; k < this.groups[i].children.length; k++){
							if (dependency[l] == this.groups[i].children[k].model.attributes.id ){
								Bar.createRelation(this.groups[i].children[j], this.groups[i].children[k]);
							}
						}
					}					
				}
			}
		}

		this.stage.add(this.Blayer);
		this.stage.add(this.Flayer);
		return this;
	},

	renderBars:function(){
		for(var i=0;i<this.groups.length;i++){
			this.groups[i].renderChildren();
		} 
		this.Flayer.draw();
		this.Blayer.draw();
	},

	rendergroups:function(){
		var gsetting =  this.app.setting.getSetting('group');
		var sorted = _.sortBy(this.groups, function(itemview){
			return itemview.model.get('sortindex');
		});
		gsetting.currentY = gsetting.iniY;
		sorted.forEach(function(groupi) {
			groupi.setY(gsetting.currentY);
			groupi.renderSortedChildren();
			gsetting.currentY += groupi.getHeight();
		});
		this.Flayer.draw();
	},
	setWidth: function(value) {
		this.stage.setWidth(value);
	},
	getSceneFunc:function(){
		var setting= this.app.setting, sdisplay = setting.sdisplay;
		var borderWidth=sdisplay.borderWidth || 1;
		var offset=borderWidth/2;
		var rowHeight=20;
		var interval =  this.app.setting.get('interval');
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
			var dragInt = parseInt(sattr.dragInterval);
			var hideDate = false;
			if( dragInt == 14 || dragInt == 30){
				hideDate = true;
			}
			for(i=0,iLen=hData[s].length;i<iLen;i++){
				length=hData[s][i].duration*daysWidth;
				x = x+length;
				xi = x - borderWidth + offset;
				context.moveTo(xi,yi);
				context.lineTo(xi,yf);
				
				context._context.save();
				context._context.font = '6pt Arial,Helvetica,sans-serif';
				context._context.textAlign = 'left';
				context._context.textBaseline = 'middle';
				// date hide on specific views
				if (hideDate) {
						context._context.font = '1pt Arial,Helvetica,sans-serif';
				};
				context._context.fillText(hData[s][i].text, x-length+40,yi+rowHeight/2);
				context._context.restore();

			}
			context.strokeShape(this);
			
			
		}

	},
	renderBackLayer: function(){
		

	}


});

module.exports = KCanvasView;