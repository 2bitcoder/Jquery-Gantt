var fs = require('fs');
var template = fs.readFileSync(__dirname + '/taskTemplate.html', 'utf8');

var TaskItemView=Backbone.View.extend({
	tagName : 'li',
	template: _.template(template),
	isParent: false,
	initialize: function(params){
		this.app = params.app;
		this.listenTo(this.model,'editrow',this.edit);
		this.listenTo(this.model,'change:name change:start change:end change:complete change:status',this.renderRow);
		this.$el.hover(function(e){
			$(document).find('.item-selector').stop().css({
				top: ($(e.currentTarget).offset().top)+'px'
			}).fadeIn();
		}, function(){
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
			this.$el.data({
				id : this.model.id
			});
		}
		this.$el.addClass(addClass);
		this.$el.attr('id', this.model.cid);
		return this.renderRow();
	},
	renderRow:function(){
		var data = this.model.toJSON();
		data.isParent = this.isParent;
//		if (this.isParent) {
//			this.$handle.html(this.template(data));
//		} else {
		data.app = this.app;
		this.$el.html(this.template(data));
//		}
		return this;
	},
	edit:function(evt){
		var target = $(evt.target);
		var width  = parseInt(target.css('width'), 10) - 5;
		var field = target.attr('class').split('-')[1];
		var form = this.app.setting.getFormElem(field,this.model,this.onEdit,this);
		form.css({width:width+'px',height:'10px'});
		target.html(form);
		form.focus();
	},
	onEdit:function(name,value){
		if(name==='duration'){
			var start=this.model.get('start');
			var end=start.clone().addDays(parseInt(value, 10)-1);
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

module.exports = TaskItemView;
