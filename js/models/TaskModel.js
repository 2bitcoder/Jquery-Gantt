var app= app || {};app.TaskModel=Backbone.Model.extend({  	defaults: {		name: '',		description: '',		complete: 0,		action: '',		sortIndex: 0,		dependency:"",		resources: [],		status: 110,		health: 21,		start: '',		end: '',		color:'#ddd',		aType: '',		reportable: '',		parentId: 0	},	parse: function(response){		if(_.isString(response.start)){			response.start = Date.parseExact(app.util.correctdate(response.start),'dd/MM/yyyy');		}				if(_.isString(response.end)){			response.end = Date.parseExact(app.util.correctdate(response.end),'dd/MM/yyyy');		}		return response;	},	/*initialize:function(){		var kmodel=new Kinetic.Bar({			x:0,			y:0,			color:'grey',			height:4,			width:4		},{});		this.equivalent=kmodel;		kmodel.equivalent=this;	}*/	},{	});