var app= app || {};
app.TaskItemView=Backbone.View.extend({
	tagName : 'li',
	template: _.template($('#itemView').html()),
	isParent: false,
	initialize: function(){
		this.listenTo(this.model,'editrow',this.edit);
		this.listenTo(this.model,'change:name change:start change:end change:complete change:status',this.renderRow);
		this.$el.hover(function(e){
			$(document).find('.item-selector').stop().css({
				top: ($(e.currentTarget).offset().top)+'px'
			}).fadeIn();
		}, function(e){
			$(document).find('.item-selector').stop().fadeOut();
		});
		this.$el.on('click',function(){
			$(document).find('.item-selector').stop().fadeOut();
		});
	},
	render: function(parent){
		var addClass='sub-task drag-item';
		
		if(parent){
			addClass="task";
			this.isParent = true;
			this.setElement($('<div>'));
		}
		else{
			this.isParent = false;
			this.setElement($('<li>'));
		}
		this.$el.addClass(addClass);
//		if (this.isParent) {
////			this.$handle = $('<div>');
//			this.$el.append(this.$handle);
//		}
		this.$el.attr('id', this.model.cid);
		return this.renderRow();
	},
	renderRow:function(){
		var data = this.model.toJSON();
		data['isParent'] = this.isParent;
//		if (this.isParent) {
//			this.$handle.html(this.template(data));
//		} else {
			this.$el.html(this.template(data));
//		}
		return this;
	},
	edit:function(evt){
		var target = $(evt.target);
		var width  =parseInt(target.css('width'))-5;
		var field = target.attr('class').split('-')[1];
		var form = app.setting.getFormElem(field,this.model,this.onEdit,this);
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
			this.model.save();//1
		//This has to be called in case no change takes place
		}
		this.renderRow();
	}


});