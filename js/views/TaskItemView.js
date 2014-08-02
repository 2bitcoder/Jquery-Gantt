var app= app || {};
app.TaskItemView=Backbone.View.extend({
	tagName: 'ul',
	template: _.template($('#itemView').html()),
	isParent: false,
	initialize: function(){
		
		this.listenTo(this.model,'editrow',this.edit);
		this.listenTo(this.model,'change:name change:start change:end change:complete change:status',this.renderRow);
	},
	render: function(parent){
		var addClass='sub-task';
		
		if(parent){
			addClass="task";
			this.isParent=true;
		}
		else{
			this.isParent=false;
		}
		this.$el.addClass(addClass);
		
		this.$el.attr('id',this.model.cid);
		return this.renderRow();
	},
	renderRow:function(){
		var data=this.model.toJSON();
		data['isParent']=this.isParent;
		this.$el.html(this.template(data));
		return this;
	},
	edit:function(evt){
		var target=$(evt.target);
		var width=parseInt(target.css('width'))-5;
		var field=target.attr('class').split('-')[1];
		var form=app.setting.getFormElem(field,this.model,this.onEdit,this);
		form.css({width:width+'px',height:'10px'});
		target.html(form);
		form.focus();
	},
	onEdit:function(name,value){
		if(name==='duration'){
			var start=this.model.get('start');
			var end=start.clone().addDays(parseInt(value)-1);
			this.model.set('end',end);
		}
		else{
			this.model.set(name,value);
		//This has to be called in case no change takes place
		}
		this.renderRow();
	}


});