var TaskItemView = require('./TaskItemView');

var TaskView = Backbone.View.extend({
	tagName: 'li',
	className: 'task-list-container drag-item',

	initialize: function(params){
		this.app = params.app;
		this.listenTo(this.model, 'change:active', this.toggleParent);
	},
	events: {
		'click .task .expand-menu': 'handleClick',
		'click .add-item button': 'addItem',
		'click .remove-item button': 'removeItem'
	},
	render: function(){
		var parent = this.model.get('parent');
		var itemView = new TaskItemView({
			model : parent,
			app : this.app
		});

		this.$parentel = itemView.render(true).$el;
		this.$el.append(this.$parentel);

		this.$el.data({
			id : parent.id
		});
		this.$childel = $('<ol class="sub-task-list sortable"></ol>');

		this.$el.append(this.$childel);
		var children = _.sortBy(this.model.children.models, function(model){
			return model.get('sortindex');
		});
		for(var i=0;i<children.length;i++){
			itemView=new TaskItemView({model:children[i], app : this.app});
			itemView.render();
			this.$childel.append(itemView.el);
		}
		this.toggleParent();
		return this;
	},
	handleClick:function(ev){
		var visible=this.$childel.is(':visible')
		this.model.set('active',!visible);
		this.model.save();
		//this.toggleParent();
	},
	addItem: function(evt){
		$(evt.currentTarget).closest('ul').next().append('<ul class="sub-task" id="c'+Math.floor((Math.random() * 10000) + 1)+'"><li class="col-name"><input type="text" placeholder="New plan" size="38"></li><li class="col-start"><input type="date" placeholder="Start Date" style="width:80px;"></li><li class="col-end"><input type="date" placeholder="End Date" style="width:80px;"></li><li class="col-complete"><input type="number" placeholder="2" style="width: 30px;margin-left: -14px;" min="0"></li><li class="col-status"><select style="width: 70px;"><option value="incomplete">Inompleted</option><option value="completed">Completed</option></select></li><li class="col-duration"><input type="number" placeholder="24" style="width: 32px;margin-left: -8px;" min="0"> d</li><li class="remove-item"><button class="mini red ui button"> <i class="small trash icon"></i></button></li></ul>').hide().slideDown();
	},
	removeItem: function(evt){
		var $parentUL = $(evt.currentTarget).closest('ol');
		var id = $parentUL.attr('id');
		var taskModel = this.app.tasks.get(id);
		if($parentUL.hasClass('task')){
			$parentUL.next('ul').fadeOut(1000, function(){
				$(this).remove();
			});
		}else{
			$(evt.currentTarget).closest('ul').fadeOut(1000, function(){
				$(this).remove();
			});
		}
//		taskModel.set('action','delete');
		taskModel.destroy();
//		taskModel.save();
		//taskModel.delete();
		taskModel.save();
	},
	toggleParent: function(){
		var active=this.model.get('active');
		var str=active?'<i class="triangle up icon"></i> ':'<i class="triangle down icon"></i>';
		this.$childel.slideToggle();
		this.$parentel.find('.expand-menu').html(str);
	}
});

module.exports = TaskView;
