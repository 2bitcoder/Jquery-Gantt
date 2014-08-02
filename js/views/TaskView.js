var app=app || {};

app.TaskView=Backbone.View.extend({
	tagName: 'div',
	className: 'task-list-container',
	
	initialize: function(){
		this.listenTo(this.model,'change:active',this.toggleParent);
	},
	events:{
		'click .task .expand-menu': 'handleClick'
	},
	makeSortable:function(){
		var that=this;
		this.$childel.sortable({
			'axis':"y",
			'helper':function(evt,elem){
				var title=elem.find('.col-name').text();
				return $('<div>'+title+'</div>');
			},
			'change':function(evt,ui){
				var item=ui.item,changedItem;
				var id1,id2,model1,model2,temp;
				id1=item.attr('id');
				if(ui.originalPosition.top<ui.position.top){
				//dom position is updated after this function is called
				changedItem=ui.placeholder.prev(":not(:hidden)");
				}
				else{
					changedItem=ui.placeholder.next(":not(:hidden)");
				}
				id2=changedItem.attr('id');
				model1=app.tasks.get(id1);
				model2=app.tasks.get(id2);
				
				temp=model1.get('sortindex');
				model1.set('sortindex',model2.get('sortindex'),{silent:true});
				model2.set('sortindex',temp,{silent:true});
			
				model1=null,model2=null,changedItem=null,item=null;
			},
			'stop':function(){
				that.model.trigger('onsort');
			}
		
		});
	
	},
	render: function(){
		var parent,itemView,children;
		parent=this.model.get('parent');
		itemView=new app.TaskItemView({model:parent});
		this.$parentel=itemView.render(true).$el;
		this.$el.append(this.$parentel);
		this.$childel=$('<ul class="sub-task-list"></ul>');
		
		
		
		
		this.$el.append(this.$childel);
		
		children=_.sortBy(this.model.get('children'),function(model){
			return model.get('sortindex');
		});
		
		for(var i=0;i<children.length;i++){
			itemView=new app.TaskItemView({model:children[i]});
			this.$childel.append(itemView.render().el);
		}
		this.toggleParent();
		this.makeSortable();
		return this;
	},
	handleClick:function(ev){
		var visible=false;
		visible=this.$childel.is(':visible')
		this.model.set('active',!visible);
		//this.toggleParent();
	},
	toggleParent: function(){
		var active=this.model.get('active');
		var str=active?'- ':'+';
		this.$childel.toggle(active);
		this.$parentel.find('.expand-menu').html(str+'&nbsp;');
	}



})