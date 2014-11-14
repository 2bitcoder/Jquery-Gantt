var app=app || {};

app.TaskView=Backbone.View.extend({
	tagName: 'li',
	className: 'task-list-container drag-item',
	
	initialize: function(){
		this.listenTo(this.model, 'change:active', this.toggleParent);
	},
	events: {
		'click .task .expand-menu': 'handleClick',
		'click .add-item button': 'addItem',
		'click .remove-item button': 'removeItem'
	},
	makeSortable:function(){
//		var that=this;
//		this.$childel.sortable({
//			axis: 'y',
//			helper: function(evt,elem){
//				var title=elem.find('.col-name').text();
//				return $('<div>'+title+'</div>');
//			},
//			change:function(evt,ui){
//				var item = ui.item,changedItem;
//				var id1,id2,model1,model2,temp;
//				id1=item.attr('id');
//				if(ui.originalPosition.top<ui.position.top){
//					//dom position is updated after this function is called
//					changedItem = ui.placeholder.prev(':not(:hidden)');
//				}
//				else{
//					changedItem = ui.placeholder.next(':not(:hidden)');
//				}
//				id2=changedItem.attr('id');
//				model1=app.tasks.get(id1);
//				model2=app.tasks.get(id2);
//
//				console.log(model1.get('name'), model1.get('sortindex'));
//				console.log(model2.get('name'), model2.get('sortindex'));
//
//				temp=model1.get('sortindex');
//				model1.set('sortindex', model2.get('sortindex'));
//				model2.set('sortindex', temp);
//
//				model1.save();
//				model2.save();
//			},
//			stop: function() {
//				that.model.trigger('onsort');
//			}
//		});

	},
	render: function(){
		var parent = this.model.get('parent');
		var itemView  =new app.TaskItemView({
			model : parent
		});

		this.$parentel = itemView.render(true).$el;
		this.$el.append(this.$parentel);

		this.$childel = $('<ol class="sub-task-list sortable"></ol>');

		this.$el.append(this.$childel);
		var children=_.sortBy(this.model.get('children'),function(model){
			return model.get('sortindex');
		});
		for(var i=0;i<children.length;i++){
			itemView=new app.TaskItemView({model:children[i]});
			itemView.render();
			this.$childel.append(itemView.el);
		}
		this.toggleParent();
		this.makeSortable();
		return this;
	},
	handleClick:function(ev){
		var visible=false;
		visible=this.$childel.is(':visible')
		this.model.set('active',!visible);
		this.model.save();
		//this.toggleParent();
	},
	addItem: function(evt){
		$(evt.currentTarget).closest('ul').next().append('<ul class="sub-task" id="c'+Math.floor((Math.random() * 10000) + 1)+'"><li class="col-name"><input type="text" placeholder="New plan" size="38"></li><li class="col-start"><input type="date" placeholder="Start Date" style="width:80px;"></li><li class="col-end"><input type="date" placeholder="End Date" style="width:80px;"></li><li class="col-complete"><input type="number" placeholder="2" style="width: 30px;margin-left: -14px;" min="0"></li><li class="col-status"><select style="width: 70px;"><option value="incomplete">Inompleted</option><option value="completed">Completed</option></select></li><li class="col-duration"><input type="number" placeholder="24" style="width: 32px;margin-left: -8px;" min="0"> d</li><li class="remove-item"><button class="mini red ui button"> <i class="small trash icon"></i></button></li></ul>').hide().slideDown();
	},
	removeItem: function(evt){
		var $parentUL = $(evt.currentTarget).closest('ul');
		var id = $parentUL.attr('id');
		taskModel = app.tasks.get(id);
		if($parentUL.hasClass('task')){
			$parentUL.next('ul').fadeOut(1000, function(){
				$(this).remove();
			});
		}else{
			$(evt.currentTarget).closest('ul').fadeOut(1000, function(){
				$(this).remove();
			});
		}
		taskModel.set('action','delete');
		//taskModel.delete();
		taskModel.save();
	},
	toggleParent: function(){
		var active=this.model.get('active');
		var str=active?'<i class="triangle up icon"></i> ':'<i class="triangle down icon"></i>';
		this.$childel.slideToggle();
		this.$parentel.find('.expand-menu').html(str);
	}



})