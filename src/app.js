(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var TaskHierarchyModel = require('../models/TaskHierarchyModel');

var TaskHierarchyCollection = Backbone.Collection.extend({
	model: TaskHierarchyModel,
	initialize : function(models, options) {
		this.tasks = options.tasks
	},
	comparator : function(model) {
		return model.get('parent').get('sortindex');
	},
	checkSortedIndex : function() {
		var sortIndex = 0;
		this.each(function(model) {
			model.get('parent').set('sortindex', ++sortIndex);
			model.get('children').each(function(child) {
				child.set('sortindex', ++sortIndex);
			});
		});
		this.trigger('resort');
	},
	resort : function(data) {
		var sortIndex = 0;
		var self = this;
		data.forEach(function(parentData) {
			var parentModel = self.tasks.get(parentData.id);
			parentModel.set('sortindex', ++sortIndex);
			parentData.children.forEach(function(childData) {
				var childModel = self.tasks.get(childData.id);
				childModel.set('sortindex', ++sortIndex);
				if (childModel.get('parentid') !== parentModel.id) {
					childModel.set('parentid', parentModel.id);
					var THparent = self.find(function(m) {
						return m.get('parent').id === parentModel.id;
					});
					THparent.children.add(childModel);
				}
			})
		});
	},
	subscribe : function(collection) {
		this.listenTo(collection, 'add', function(model) {
			if (model.get('parentid')) {
				var parent = this.find(function(m) {
					return m.get('parent').id === model.get('parentid');
				});
				parent.children.add(model);
				this.trigger('add', parent);
			} else {
				this.add({
					parent : model,
					children : []
				});
			}
		});
	}
},{
	// static function
	importData:function(collection, parentAttribute, rootid, sortBy){
		if(!collection instanceof Backbone.Collection){
			throw 'TaskHierarchyCollection can not import data of unknown collection';
		}

		if (!rootid) {
			rootid = 0;
		}
		
		var grouped = collection.groupBy(parentAttribute);
		
		if (!grouped[rootid]) {
			return false;
		}

		var sorted = _.sortBy(grouped[rootid],function(model){
			return model.get(sortBy);
		});

		var newCol = new TaskHierarchyCollection([], {
			tasks : collection
		});

		sorted.forEach(function(model) {
			var tcol = {
				parent : model,
				children : []
			};
			var newModel = newCol.add(tcol, {silent:true});

			var id = model.get('id');
			if (grouped[id]) {
				newModel.addChildren(grouped[id]);
			}
		});

		newCol.subscribe(collection);
		return newCol;
		
	}
});

module.exports = TaskHierarchyCollection;
},{"../models/TaskHierarchyModel":5}],2:[function(require,module,exports){
var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: TaskModel
});

module.exports = TaskCollection;


},{"../models/TaskModel":6}],3:[function(require,module,exports){
var demoResources = [{"wbsid":1,"res_id":1,"res_name":"Joe Black","res_allocation":60},{"wbsid":3,"res_id":2,"res_name":"John Blackmore","res_allocation":40}];

var TaskCollection = require('./collections/taskCollection');
var TaskHierarchyCollection = require('./collections/TaskHierarchyCollection');
var Settings = require('./models/SettingModel');

var GanttView = require('./views/GanttView');

var prepareAddForm = require('./views/prepareAddForm');
$(function () {
    'use strict';
	var app = window.app || {};
	app.tasks = new TaskCollection();

	app.tasks.fetch({
		success : function() {
			console.log('Success loading tasks.');
			app.setting = new Settings({}, {app : app});

			app.THCollection = TaskHierarchyCollection.importData(
				/*collection  =*/ app.tasks,
				/*parentAttribute  =*/'parentid',
				/*rootid =*/0,
				/*sortBy=*/ 'sortindex'
			);

			prepareAddForm();
			new GanttView({
				app : app
			}).render();

			// initalize parent selector for "add task form"
			var $selector = $('.select-parent.dropdown').find('.menu');
			$selector.append('<div class="item" data-value="0">Main Project</div>');
			app.tasks.each(function(task) {
				var parentId = task.get('parentid');
				if(parentId === 0){
					$selector.append('<div class="item" data-value="' + task.get('id') + '">' + task.get('name') + '</div>');
				}
			});

			// initialize dropdown
			$('.select-parent.dropdown').dropdown();
			// line adjustment
			setTimeout(function(){
				$('button[data-action="view-monthly"]').trigger('click');
			},1000);

			// Resources from backend
			var $resources = '<select id="resources"  name="resources[]" multiple="multiple">';
			for (var i = 0; i < demoResources.length; i++) {
				$resources += '<option value="'+demoResources[i].res_id+'">'+demoResources[i].res_name+'</option>';
			}
			$resources += '</select>';
			// add backend to the task list
			$('.resources').append($resources);

			// initialize multiple selectors
			$('#resources').chosen({width: '95%'});

			// assign random parent color
			$('input[name="color"]').val('#'+Math.floor(Math.random()*16777215).toString(16));
		},
		error : function(err) {
			console.error('error loading');
			console.error(err);
		}
	}, {parse: true});
});

},{"./collections/TaskHierarchyCollection":1,"./collections/taskCollection":2,"./models/SettingModel":4,"./views/GanttView":8,"./views/prepareAddForm":12}],4:[function(require,module,exports){
var util = require('../utils/util');

var hfunc = function(pos, evt) {
	var dragInterval = app.setting.getSetting('attr', 'dragInterval');
	var n = Math.round((pos.x - evt.inipos.x) / dragInterval);
	return {
		x: evt.inipos.x + n * dragInterval,
		y: this.getAbsolutePosition().y
	};
};

var SettingModel = Backbone.Model.extend({
	defaults:{
		interval:'fix',
		//days per interval
		dpi:1
	},
	initialize: function(attrs, params) {
		this.app = params.app;
		this.sattr = {
			hData: {},
			dragInterval: 1,
			daysWidth: 5,
			cellWidth: 35,
			minDate: new Date(2020,1,1),
			maxDate: new Date(0,0,0),
			boundaryMin: new Date(0,0,0),
			boundaryMax: new Date(2020,1,1),
			//months per cell
			mpc: 1
		};

		this.sdisplay = {
			screenWidth:  $('#gantt-container').innerWidth() + 786,
			tHiddenWidth: 305,
			tableWidth: 710,
		};

		this.sgroup = {
			currentY: 0,
			iniY: 60,
			active: false,
			topBar: {
				fill: '#666',
				height: 12,
				strokeEnabled: false,
			},
			gap: 3,
			rowHeight: 22,
			draggable: true,
			dragBoundFunc: hfunc,
		};
		this.sbar = {
			barheight: 12,
			rectoption: {
				strokeEnabled: false,
				fill: 'grey'
			},
			gap: 20,
			rowheight:  60,
			draggable: true,
			resizable: true,
			dragBoundFunc: hfunc,
			resizeBoundFunc: hfunc,
			subgroup: true,
		},
		this.sform={
			'name': {
				editable: true,
				type: 'text',
			},
			'start': {
				editable: true,
				type: 'date',
				d2t: function(d){
					return d.toString('dd/MM/yyyy');
				},
				t2d: function(t){
					return Date.parseExact( util.correctdate(t), 'dd/MM/yyyy');
				}
			},
			'end': {
				editable: true,
				type: 'date',
				d2t: function(d){
					return d.toString('dd/MM/yyyy');
				},
				t2d: function(t){
					return Date.parseExact( util.correctdate(t), 'dd/MM/yyyy');
				}
			},
			'status': {
				editable: true,
				type: 'select',
				options: {
					'110': 'complete',
					'109': 'open',
					'108' : 'ready'
				}
			},
			'complete': {
				editable: true,
				type: 'text',
			},
			'duration': {
				editable: true,
				type: 'text',
				d2t: function(t,model){
					return Date.daysdiff(model.get('start'),model.get('end'));
				}
			}
		
		};
		this.getFormElem = this.createElem();
		this.collection = this.app.tasks;
		this.calculateIntervals();
		this.on('change:interval change:dpi', this.calculateIntervals);
	},
	getSetting:function(from,attr){
		if(attr){
			return this['s'+from][attr];
		}
		return this['s'+from];
	},
	calcminmax:function(){
		var collection=this.collection;
		var minDate=new Date(2020,1,1),maxDate=new Date(0,0,0);
		
		collection.each(function(model){
			if(model.get('start').compareTo(minDate)==-1){
				minDate=model.get('start');
			}
			if(model.get('end').compareTo(maxDate)==1){
				maxDate=model.get('end');
			}
		});
		this.sattr.minDate=minDate;
		this.sattr.maxDate=maxDate;
		
	},
	setAttributes: function() {
		var end,interval,sattr=this.sattr,dattr=this.sdisplay,duration,size,cellWidth,dpi,retfunc,start,last,i=0,j=0,iLen=0,next=null;
		
		interval = this.get('interval');
		//TODO:needs improvement instaed of cloning convert into time for better performance
		if(interval==='daily'){
			this.set('dpi',1,{silent:true});
			end=sattr.maxDate.clone().addDays(20);
			sattr.boundaryMin=sattr.minDate.clone().addDays(-1*20);
			sattr.daysWidth=12;
			sattr.cellWidth=sattr.daysWidth*1;
			sattr.dragInterval=1*sattr.daysWidth;
			retfunc=function(date){ return date.clone().addDays(1); };
			sattr.mpc=1;
			
		}
		else if(interval==='weekly'){
			this.set('dpi',7,{silent:true});
			end=sattr.maxDate.clone().addDays(20*7);
			sattr.boundaryMin=sattr.minDate.clone().addDays(-1*20*7).moveToDayOfWeek(1,-1);
			sattr.daysWidth=5;
			sattr.cellWidth=sattr.daysWidth*7;
			sattr.dragInterval=1*sattr.daysWidth;
			sattr.mpc=1;
			retfunc=function(date){ return date.clone().addDays(7); }			
		}
		else if(interval==='monthly'){
			this.set('dpi',30,{silent:true});
			end=sattr.maxDate.clone().addDays(20*30);
			sattr.boundaryMin=sattr.minDate.clone().addDays(-1*20*30).moveToFirstDayOfMonth();
			sattr.daysWidth=2;
			sattr.cellWidth='auto';
			sattr.dragInterval=7*sattr.daysWidth;
			sattr.mpc=1;
			retfunc=function(date){ return date.clone().addMonths(1); }
		
		}
		else if(interval==='quarterly'){
			this.set('dpi',30,{silent:true});
			end=sattr.maxDate.clone().addDays(20*30);
			sattr.boundaryMin=sattr.minDate.clone().addDays(-1*20*30);
			sattr.boundaryMin.moveToFirstDayOfQuarter();

			sattr.daysWidth=1;
			sattr.cellWidth='auto';
			sattr.dragInterval=30*sattr.daysWidth;
			sattr.mpc=3;
			retfunc=function(date){ return date.clone().addMonths(3); }
		}
		else if(interval==='fix'){
			cellWidth=30;
			duration=Date.daysdiff(sattr.minDate,sattr.maxDate);
			size=dattr.screenWidth-dattr.tHiddenWidth-100;
			sattr.daysWidth=size/duration;
			dpi=Math.round(cellWidth/sattr.daysWidth);
			this.set('dpi',dpi,{silent:true});
			sattr.cellWidth=dpi*sattr.daysWidth;
			sattr.boundaryMin=sattr.minDate.clone().addDays(-2*dpi);
			sattr.dragInterval=Math.round(.3*dpi)*sattr.daysWidth;
			end=sattr.maxDate.clone().addDays(2*dpi);
			sattr.mpc=Math.max(1,Math.round(dpi/30));
			retfunc=function(date){ return date.clone().addDays(dpi); };
			
		}
		else if(interval==='auto'){
			dpi=this.get('dpi');
			sattr.cellWidth=(1+Math.log(dpi))*12;
			sattr.daysWidth=sattr.cellWidth/dpi;
			sattr.boundaryMin=sattr.minDate.clone().addDays(-20*dpi);
			end=sattr.maxDate.clone().addDays(20*dpi);
			sattr.mpc=Math.max(1,Math.round(dpi/30));
			retfunc=function(date){ return date.clone().addDays(dpi); }
			sattr.dragInterval=Math.round(.3*dpi)*sattr.daysWidth;
		}
		
		var hData={
			'1':[],
			'2':[],
			'3':[]
		}
		var hdata3=[];
		
		start=sattr.boundaryMin;
		
		last = start;
		if(interval=='monthly' || interval=='quarterly')
		{
			var durfunc=(interval==='monthly')?function(date){ return Date.getDaysInMonth(date.getFullYear(),date.getMonth());}:function(date){ return Date.getDaysInQuarter(date.getFullYear(),date.getQuarter());};
			while (last.compareTo(end) == -1) {
					hdata3.push({duration:durfunc(last),text:last.getDate()});
					next = retfunc(last);
					last = next;
			}
		}
		else{
			var intervaldays=this.get('dpi');
			
			while (last.compareTo(end) == -1) {
				hdata3.push({duration:intervaldays,text:last.getDate()});
				next = retfunc(last);
					last = next;
			}
		}
		
		sattr.boundaryMax=end=last;
		hData['3']=hdata3;
		
		var inter=0;
			
		//enter duration of first date to end of year
		inter=Date.daysdiff(start,new Date(start.getFullYear(),11,31));
		hData['1'].push({duration:inter,text:start.getFullYear()});
		for(i=start.getFullYear()+1,iLen=end.getFullYear();i<iLen;i++){
			inter=Date.isLeapYear(i)?366:365;
			hData['1'].push({duration:inter,text:i});
		}
		//enter duration of last year upto end date
		if(start.getFullYear()!==end.getFullYear()){
			inter=Date.daysdiff(new Date(end.getFullYear(),0,1),end);
			hData['1'].push({duration:inter,text:end.getFullYear()});
		}
		
		//enter duration of first month
		hData['2'].push({duration:Date.daysdiff(start,start.clone().moveToLastDayOfMonth()),text: util.formatdata(start.getMonth(),'m')});
		
		j=start.getMonth()+1;
		i=start.getFullYear();
		iLen=end.getFullYear();
		var endmonth=end.getMonth()
		while(i<=iLen){
			while(j<12){
				if(i==iLen && j==endmonth) break; 
				hData['2'].push({duration:Date.getDaysInMonth(i,j),text: util.formatdata(j,'m')});
				j += 1;
				
			}
			i += 1;
			j=0;
		}
		if(end.getMonth()!==start.getMonth && end.getFullYear()!==start.getFullYear()){
			hData['2'].push({duration:Date.daysdiff(end.clone().moveToFirstDayOfMonth(),end),text: util.formatdata(end.getMonth(),'m')});
		
		}
		sattr.hData=hData;
		
	},
	calculateIntervals:function(){
		this.calcminmax();
		this.setAttributes();
	},
	createElem:function(){
		var elems={},obj,callback=false,context=false;
		function bindTextEvents(element,obj,name){
			element.on('blur',function(e){
				var $this=$(this);
				var value=$this.val();
				$this.detach();
				var callfunc=callback,ctx=context;
				callback=false;
				context=false;
				if(obj['t2d']) value=obj['t2d'](value);
				callfunc.call(ctx,name,value);
			}).on('keypress',function(e){
				if(event.which===13){
					$(this).trigger('blur');
				}
			})
		}
		
		function bindDateEvents(element,obj,name){
			element.datepicker({ dateFormat: "dd/mm/yy",onClose:function(){
				//console.log('on close called');
				var $this=$(this);
				var value=$this.val();
				$this.detach();
				var callfunc=callback,ctx=context;
				callback=false;
				context=false;
				if(obj['t2d']) value=obj['t2d'](value);
				callfunc.call(ctx,name,value);
			}});
		}
		
		for(var i in this.sform){
			obj=this.sform[i];
			if(obj.editable){
				if(obj.type==='text'){
					elems[i]=$('<input type="text" class="content-edit">');
					bindTextEvents(elems[i],obj,i);
				}
				else if(obj.type==='date'){
					elems[i]=$('<input type="text" class="content-edit">');
					bindDateEvents(elems[i],obj,i);
				}
			}
		
		}
		//console.log(elems);
		obj=null;
		return function(field,model,callfunc,ctx){
			callback=callfunc;
			context=ctx;
			var element=elems[field],value=model.get(field);
			if(this.sform[field].d2t)  value=this.sform[field].d2t(value,model);
			//console.log(element);
			element.val(value);
			return element;
		}
	
	},
	conDToT:(function(){
		var dToText={
			'start':function(value){
				return value.toString('dd/MM/yyyy')
			},
			'end':function(value){
				return value.toString('dd/MM/yyyy')
			},
			'duration':function(value,model){
				return Date.daysdiff(model.start,model.end)+' d';
			},
			'status':function(value){
				var statuses={
					'110':'complete',
					'109':'open',
					'108' : 'ready'
				}
				return statuses[value];
			}
		
		}
		return function(field,value,model){
			return dToText[field]?dToText[field](value,model):value;
		}
	}())
});

module.exports = SettingModel;

},{"../utils/util":7}],5:[function(require,module,exports){

var TaskHierarchyModel = Backbone.Model.extend({
	defaults:{
		parent: null,
		active: true
	},
	initialize : function() {
		this.children = new Backbone.Collection();
		this.listenTo(this.children, 'change:parentid', function(child) {
			this.children.remove(child);
		});
		this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);
	},
	addChildren:function(children){
		children.forEach(function(child) {
			this.children.add(child);
		}.bind(this));
	},
	_checkTime : function() {
		if (this.children.length === 0) {
			return;
		}
		var startTime = this.children.at(0).get('start');
		var endTime = this.children.at(0).get('end');
		this.children.each(function(child) {
			var childStartTime = child.get('start');
			var childEndTime = child.get('end');
			if(childStartTime.compareTo(startTime) === -1) {
				startTime = childStartTime;
			}
			if(childEndTime.compareTo(endTime) === 1){
				endTime = childEndTime;
			}
		}.bind(this));
		this.get('parent').set('start', startTime);
		this.get('parent').set('end', endTime);

	}
});

module.exports = TaskHierarchyModel;

},{}],6:[function(require,module,exports){
var util = require('../utils/util');var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,        action: '',        sortindex: 0,        dependency:'',        resources: {},        status: 110,        health: 21,        start: '',        end: '',        color:'#0090d3',        aType: '',        reportable: '',        parentid: 0    },    parse: function(response) {        if(_.isString(response.start)){            response.start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            response.start = new Date();        }                if(_.isString(response.end)){            response.end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            response.end = new Date();        }        return response;    }});module.exports = TaskModel;
},{"../utils/util":7}],7:[function(require,module,exports){
var monthsCode=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

module.exports.correctdate = function(str) {
	"use strict";
	return str;
};

module.exports.formatdata = function(val, type) {
	"use strict";
	if (type === 'm') {
		return monthsCode[val];
	}
	return val;
};

module.exports.hfunc = function(pos) {
	"use strict";
	return {
		x: pos.x,
		y: this.getAbsolutePosition().y
	};
};
},{}],8:[function(require,module,exports){
var ContextMenuView = require('./sideBar/ContextMenuView');var TaskView = require('./sideBar/TaskView');var KCanvasView = require('./canvas/KCanvasView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.collection = this.app.THCollection;        this.$container = this.$el.find('.task-container');        this.$submitButton = this.$el.find('#submitFrom');        this.$submitButton.on('click', function(e) {            this.submitForm(e);        }.bind(this));        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        this.makeSortable();        this.defineContextMenu();        this.listenTo(this.collection, 'sorted add', function() {            this.$container.empty();            this.render();        });    },    makeSortable: function() {        this.$container.sortable({            group: 'sortable',            containerSelector : 'ol',            itemSelector : '.drag-item',            placeholder : '<li class="placeholder sort-placeholder"/>',            onDrag : function($item, position, _super, event) {                var $placeholder = $('.sort-placeholder');                var isSubTask = !$($placeholder.parent()).hasClass('task-container');                $placeholder.css({                    'padding-left' : isSubTask ? '30px' : '0'                });                _super($item, position, _super, event);                var data = this.$container.sortable("serialize").get()[0];                data.forEach(function(parentData) {                    parentData.children = parentData.children[0];                });                this.app.THCollection.resort(data);            }.bind(this),            onDrop : function($item, position, _super, event) {                _super($item, position, _super, event);                var data = this.$container.sortable("serialize").get()[0];                data.forEach(function(parentData) {                    parentData.children = parentData.children[0];                });                this.app.THCollection.resort(data);            }.bind(this)        });    },    events: {        'click #tHandle': 'expand',        'dblclick .sub-task': 'handlerowclick',        'dblclick .task': 'handlerowclick',        'hover .sub-task': 'showMask',        'click .head-bar button': 'handbuttonclick',        'click .new-task': 'openForm',        'click a[href="/#!/generate/"]': 'generatePdf'    },    defineContextMenu: function(){        var contextView = new ContextMenuView(this.app);        contextView.render();    },    render: function() {        this.collection.each(function(task) {            this.addTask(task);        }, this);        this.canvasView = new KCanvasView({            app : this.app        }).render();        this.makeSortable();    },    handlerowclick: function(evt) {        var id = evt.currentTarget.id;        this.app.tasks.get(id).trigger('editrow', evt);    },    handbuttonclick: function(evt) {        var button = $(evt.currentTarget);        var action = button.data('action');        var interval = action.split('-')[1];        this.app.setting.set('interval', interval);    },    generatePdf: function(evt){        window.print();        evt.preventDefault();    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var target = $(evt.target);        var width = 0;        var setting = this.app.setting.getSetting('display');        if (target.hasClass('contract')) {            width = setting.tHiddenWidth;        }        else {            width = setting.tableWidth;        }        this.$menuContainer.css('width', width);        this.canvasView.setWidth(setting.screenWidth - width - 20);        target.toggleClass('contract');        this.$menuContainer.find('.menu-header').toggleClass('menu-header-opened');    },    openForm: function() {        $('.ui.add-new-task').modal('setting', 'transition', 'vertical flip')        .modal('show')        ;    },    addTask: function(task) {        var taskView = new TaskView({model: task, app : this.app});        this.$container.append(taskView.render().el);    },    submitForm: function(e) {        e.preventDefault();        var form = $("#new-task-form");        var data = {};        $(form).serializeArray().forEach(function(input) {            data[input.name] = input.value;        });        var sortindex = 0;        var ref_model = this.app.tasks.get(data.reference_id);        if (ref_model) {            sortindex = ref_model.get('sortindex') + (data.insertPos === 'above' ? -0.5 : 0.5)        } else {            sortindex = (this.app.tasks.last().get('sortindex') + 1);        }        data.sortindex = sortindex;        data.id = Math.random().toString();        var task = this.app.tasks.add(data, {parse : true});        task.save();        $('.ui.modal').modal('hide');    }});module.exports = GanttView;
},{"./canvas/KCanvasView":11,"./sideBar/ContextMenuView":13,"./sideBar/TaskView":15}],9:[function(require,module,exports){
	var dd=Kinetic.DD;
	var barOptions=['draggable','dragBoundFunc','resizable','resizeBoundFunc','height','width','x','y'];

	var calculating=false;
	function createHandle(option){
		option.draggable=true;
		option.opacity=1;
		option.strokeEnabled=false;
		option.width=2;
		option.fill='black';
		return new Kinetic.Rect(option);
	}
	function createSubGroup(option){
		var gr=new Kinetic.Group();
		var imgrect=new Kinetic.Rect({
			x:0,
			y:0,
			height: option.height,
			width: 20,
			strokeEnabled:false,
			fill:'yellow',
			opacity:0.5
		});
		var anchor=new Kinetic.Circle({
			x:10,
			y:5,
			radius: 3,
			strokeWidth:1,
			name: 'anchor',
			stroke:'black',
			fill:'white',
		})

		var namerect=new Kinetic.Rect({
			x:20,
			y:0,
			height: option.height,
			width: 40,
			strokeEnabled:false,
			fill:'pink',
		});
		gr.add(imgrect);
		gr.add(anchor);
		gr.add(namerect);
		return gr;
	}

	var beforebind=function(func){
		return function(){
			if(calculating) return false;
			calculating=true;
			func.apply(this,arguments);
			calculating=false;
		}
	}

	function getDragDir(stage){
		return (stage.getPointerPosition().x-dd.startPointerPos.x>0)?'right':'left';
	}

	var Bar=function(options){
		this.model=options.model;
		this.settings = options.settings;

		this.listenTo(this.model, 'change:complete', this._updateCompleteBar);
		
		var setting = this.setting = this.settings.getSetting('bar');
		//this.barid = _.uniqueId('b');
		this.subgroupoptions={
			showOnHover: true,
			hideOnHoverOut:true,
			hasSubGroup: false,
		};
		
		this.dependants=[];
		this.dependencies=[];
		
		/*var option={
			x : rectoptions.x,
			y: rectoptions.y
		}
		rectoptions.x=0;
		rectoptions.y=0;
		rectoptions.name='mainbar';*/

		// coloring section
		var parentModel = this.model.collection.get(this.model.get('parentid'));
		this.setting.rectoption.fill = parentModel.get('lightcolor');		
		this.group=new Kinetic.Group(this.getGroupParams());
		//remove the strokeEnabled if not provided in option
		//rectoptions.strokeEnabled=false;

		var rect = this.rect  =new Kinetic.Rect(this.getRectparams());
		this.group.add(rect);
		
		if(setting.subgroup){
			this.addSubgroup();
		}
		
		if(setting.draggable){
			this.makeDraggable();
		}
		
		if(setting.resizable){
			this.makeResizable();
		}

		var leftx=this.leftHandle.getX();
		var w=this.rightHandle.getX()-leftx+2;
		var width = ( ( w ) * (this.model.get('complete') / 100) );
		this.setting.rectoption.fill = parentModel.get('darkcolor');
		opt =  this.getRectparams();
		opt.x = 2;
		opt.width = width-4;
		if(width > 0){
			var completeBar= this.completeBar = new Kinetic.Rect(opt);
			this.group.add(completeBar);
		}
		
		//addEvents
		this.bindEvents();
		//this.on('resize move',this.renderConnectors,this);;
	}
	Bar.prototype={
		_updateCompleteBar : function() {
			var leftx=this.leftHandle.getX();
			var w = this.rightHandle.getX() - leftx+2;
			var width = ( ( w ) * (this.model.get('complete') / 100) ) - 4;

			if(width > 0){
				this.completeBar.width(width);
				this.completeBar.getLayer().batchDraw();
			}
		},
		//retrieves only width,height,x,y relative to point 0,0 on canvas;
		getX1: function(absolute){
			var retval=0;
			if(absolute && this.parent) retval=this.parent.getX();
			return retval+this.group.getX();
		},
		getX2: function(absolute){
			return this.getX1(absolute)+this.getWidth();
		},
		getX:function(absolute){
			return {
				x: this.getX1(absolute),
				y: this.getX2(absolute)
			};
		},
		getY: function(){
			return this.group.getY();
		},
		getHeight: function(){
			return this.rect.getHeight();
		},
		getWidth: function(){
			return this.rect.getWidth();
		},
		
		setX1:function(value,options){
			!options && (options={})
			var prevx,width,dx;

			//if value is in absolute sense then make it relative to parent
			if(options.absolute && this.parent){
				value=value-this.parent.getX(true);
			}
			prevx=this.getX1();
			//dx +ve means bar moved left 
			dx=prevx-value;
			
			var silent=options.silent || options.osame;
			
			this.move(-1*dx,silent);
			//if x2 has to remain same
			// Draw percentage completed
			if(options.osame){
				this.rect.setWidth(dx+this.getWidth());
				var width =( this.getWidth() * (this.model.get('complete') / 100) )-4;
				if(width > 0)
					this.completeBar.setWidth(width);
				this.renderHandle();
				if(!options.silent){
					this.trigger('resizeleft',this);
					this.trigger('resize',this);
					this.triggerParent('resize');
				}
			}
			this.enableSubgroup();
			
		},
		setX2:function(value,options){
			var prevx,width,dx;
			//if value is in absolute sense then make it relative to parent
			if(options.absolute && this.parent){
				value=value-this.parent.getX(true);
			}
			prevx=this.getX2();
			//dx -ve means bar moved right 
			dx=prevx-value;
			
			var silent=options.silent || options.osame;
			//this.group.setX(value);
			//if x2 has to remain same
			if(options.osame){
				this.rect.setWidth(this.getWidth()-dx);
				var width =( this.getWidth() * (this.model.get('complete') / 100) )-4;
				if(width > 0)
					this.completeBar.setWidth(width);
				this.renderHandle();
				if(!options.silent){
					this.trigger('resizeright',this);
					this.trigger('resize',this);
					this.triggerParent('resize');
				}
			}
			else{
				this.move(-1*dx,options.silent);
			}
			this.enableSubgroup();
			
		},
		setY:function(value){
			this.group.setY(value);
		},
		setParent:function(parent){
			this.parent=parent;

		},
		triggerParent:function(eventName){
			if(this.parent){
				this.parent.trigger(eventName,this);
			}			
		},
		bindEvents:function(){
			var that=this;
			this.group.on('click',_.bind(this.handleClickevents,this));
			
			this.group.on('mouseover',function(){
				if(!that.subgroupoptions.showOnHover) return;
				that.subgroup.show();
				this.getLayer().draw();
			});
			this.group.on('mouseout',function(){
				if(!that.subgroupoptions.hideOnHoverOut) return;
				that.subgroup.hide();
				this.getLayer().draw();
			});
			
			this.on('resize move',this.renderConnectors,this);
			this.listenTo(this.model,'change',this.handleChange);
			this.on('change', this.handleChange,this);

		},
		destroy : function() {
			this.group.destroy();
			this.stopListening();
		},
		handleChange:function(model){
			// console.log('handling change');
			if(this.parent.syncing){
				// console.log('returning');
				return;
			}
			
			if(model.changed.start || model.changed.end){
				var x=this.calculateX(model);
				console.log(x);
				if(model.changed.start){
					this.setX1(x.x1,{osame:true,absolute:true});
				}
				else{
					this.setX2(x.x2,{osame:true,absolute:true});
				}
				this.parent.sync();
			}
			console.log('drawing');
			this.draw();
			this.model.save();
			
		},
		handleClickevents:function(evt){
			var target,targetName,startBar;
			target=evt.target;
			targetName=target.getName();
			window.startBar;
			if(targetName!=='mainbar'){
				Bar.disableConnector();
				if(targetName=='anchor'){
					target.stroke('red');
					Bar.enableConnector(this);
					var dept = this.model.get('dependency');
					if(dept != ""){
						window.currentDpt.push(this.model.get('dependency'));	
					}
					console.log(window.currentDpt);
					window.startBar = this.model;
				}
			}
			else{
				if((startBar=Bar.isConnectorEnabled())){
					Bar.createRelation(startBar,this);
					window.currentDpt.push(this.model.get('id'));
					window.startBar.set('dependency', JSON.stringify(window.currentDpt));
					window.startBar.save();
					Bar.disableConnector();
				}
			}
			evt.cancelBubble=true;
		},
		makeResizable: function(){
			var that=this;
			this.resizable=true;
			this.leftHandle=createHandle({
				x: 0,
				y: 0,
				height: this.getHeight(),
				dragBoundFunc: this.setting.resizeBoundFunc,
			});
			this.rightHandle=createHandle({
				x: this.getWidth()-2,
				y: 0,
				height: this.getHeight(),
				dragBoundFunc: this.setting.resizeBoundFunc,
			});
			this.leftHandle.on('dragstart',function(){
				that.disableSubgroup();
			});
			this.rightHandle.on('dragstart',function(){
				that.disableSubgroup();
			});
			
			this.leftHandle.on('dragend',function(){
				that.enableSubgroup();
				that.parent.sync();
			});
			this.rightHandle.on('dragend',function(){
				that.enableSubgroup();
				that.parent.sync();
			});
			
			this.leftHandle.on('dragmove',beforebind(function(){
				that.render();
				that.trigger('resizeleft',that);
				that.trigger('resize',that);
				that.triggerParent('resize');
			}));
			this.rightHandle.on('dragmove',beforebind(function(){
				that.render();
				that.trigger('resizeright',that);
				that.trigger('resize',that);
				that.triggerParent('resize');
			}));
			this.leftHandle.on('mouseover',this.changeResizeCursor);
			this.rightHandle.on('mouseover',this.changeResizeCursor);
			this.leftHandle.on('mouseout',this.changeDefaultCursor);
			this.rightHandle.on('mouseout',this.changeDefaultCursor);
			
			this.group.add(this.leftHandle);
			this.group.add(this.rightHandle);
			
			
		},
		addSubgroup:function(){
			this.hasSubGroup=true;
			var subgroup,that=this;
			subgroup=this.subgroup=createSubGroup({height:this.getHeight()});
			subgroup.hide();
			subgroup.setX(this.getWidth());
			this.group.add(subgroup);
			
			
			//this.bindAnchor();
		},
		enableSubgroup:function(){
			this.subgroupoptions.showOnHover=true;
			this.subgroup.setX(this.getWidth());
		},
		disableSubgroup:function(){
			this.subgroupoptions.showOnHover=true;
			this.subgroup.hide();
		},
		
		bindAnchor: function(){
			var that=this;
			var anchor=this.subgroup.find('.anchor');
			anchor.on('click',function(evt){
				anchor.stroke('red');
				that.subgroupoptions.hideOnHoverOut=false;
				Kinetic.Connect.start=that;
				this.getLayer().draw();
				evt.cancelBubble = true;
			});

		},
		
		makeDraggable: function(option){
			var that=this;
			this.group.draggable(true);
			if(this.setting.dragBoundFunc){
				this.group.dragBoundFunc(this.setting.dragBoundFunc);
			}
			this.group.on('dragmove',beforebind(function(){
				that.trigger('move'+getDragDir(this.getStage()),that);
				that.trigger('move');
				that.triggerParent('move');
			}));
			this.group.on('dragend',function(){
				that.parent.sync();
			});
		},
		changeResizeCursor:function(type){
			document.body.style.cursor = 'ew-resize';
		},
		changeDefaultCursor:function(type){
			document.body.style.cursor = 'default';
		},
		//renders the handle by its rect
		renderHandle:function(){
			if(!this.resizable) return false;
			var x=this.rect.getX();
			this.leftHandle.setX(x);
			this.rightHandle.setX(x+this.rect.getWidth()-2);
		},
		
		
		//renders the bar by the handles
		render: function(){
			var leftx=this.leftHandle.getX();
			var width=this.rightHandle.getX()-leftx+2;
			this.group.setX(this.group.getX()+leftx);
			this.leftHandle.setX(0);
			this.rightHandle.setX(width-2);
			this.rect.setWidth(width);
			var width2 = this.rect.getWidth()  * (this.model.get('complete') / 100);
			if(width2)
				this.completeBar.setWidth(width2 - 4);
		},
		/*
			dependentObj: {'elem':dependant,'connector':connector}
			*/
			addDependant:function(dependantObj){
				this.listenTo(dependantObj.elem,'moveleft resizeleft',this.adjustleft)
				this.dependants.push(dependantObj);
			},
		//renders the bar by its model 
		renderBar:function(){
			var x = this.calculateX();
			this.setX1(x.x1,{absolute:true, silent:true});
			this.setX2(x.x2,{absolute:true, silent:true, osame:true});
			this.renderConnectors();
		},
		
		addDependancy: function(dependencyObj){
			this.listenTo(dependencyObj.elem,'moveright resizeright',this.adjustright);
			this.dependencies.push(dependencyObj);
			this.renderConnector(dependencyObj,2);
		},
		//checks if the bar needs movement in left side on left movement of dependent and makes adjustment
		adjustleft:function(dependant){
			if(!this.isDependant(dependant)) return false;
			var dx=this.getX1()+this.getWidth()-dependant.getX1();
			//an overlap occurs in this case
			if(dx>0){
				//event will be triggered in move func
				this.move(-1*dx);
				//this.trigger('moveleft',this);
			}
		},
		adjustright:function(dependency){
			if(!this.isDependency(dependency)) return false;
			var dx=dependency.getX1()+dependency.getWidth()-this.getX1();
			//console.log(dx);
			if(dx>0){
				//event will be triggered in move func
				this.move(dx);
				//this.trigger('moveright',this);
			}
		},
		isDependant:function(dependant){
			for(var i=0;i<this.dependants.length;i++){
				if(this.dependants[i]['elem']['barid']===dependant['barid']){
					return true;
					
				}
			}
			return false;

		},
		//@type Dependant:1, Dependency:2
		renderConnector:function(obj,type){
			if(type==1){
				Bar.renderConnector(this,obj.elem,obj.connector);
			}
			else{
				Bar.renderConnector(obj.elem,this,obj.connector);
			}
		},
		//renders all connectors
		renderConnectors:function(){
			for(var i=0,iLen=this.dependants.length;i<iLen;i++){
				this.renderConnector(this.dependants[i],1);
			}
			for(var i=0,iLen=this.dependencies.length;i<iLen;i++){
				this.renderConnector(this.dependencies[i],2);
			}
		},
		isDependency: function(dependency){
			
			for(var i=0;i<this.dependencies.length;i++){
				if(this.dependencies[i]['elem']['barid']===dependency['barid']){
					return true;
					
				}
			}
			return false;
		},
		move: function(dx,silent){
			if(dx===0) return;
			this.group.move({x:dx});
			if(!silent){
				this.trigger('move',this);
				if(dx>0){
					this.trigger('moveright',this);
				}
				else{
					this.trigger('moveleft',this);
				}
				this.triggerParent('move');
			}
		},
		calculateX:function(model){
			!model && (model=this.model);
			var attrs= this.settings.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			return {
				x1:(Date.daysdiff(boundaryMin,model.get('start')))*daysWidth,
				x2:Date.daysdiff(boundaryMin,model.get('end'))*daysWidth,
			}
		},
		calculateDates:function(){
			var attrs=app.setting.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			var days1=Math.round(this.getX1(true)/daysWidth),days2=Math.round(this.getX2(true)/daysWidth);
			
			return {
				start: boundaryMin.clone().addDays(days1),
				end:boundaryMin.clone().addDays(days2-1)
			}
			
		},
		getRectparams:function(){
			var setting=this.setting;
			var xs  =this.calculateX(this.model);
			// console.log(this.model.get('complete'));
			return _.extend({
				x:0,
				width:xs.x2-xs.x1,
				y: 0,
				name:'mainbar',
				height:setting.barheight
			},setting.rectoption);
		},
		getGroupParams:function(){
			var xs=this.calculateX(this.model);
			return {
				x: xs.x1,
				y: 0,
			}
		},
		toggle:function(show){
			var method=show?'show':'hide';
			this.group[method]();
			for(var i=0,iLen=this.dependencies.length;i<iLen;i++){
				this.dependencies[i].connector[method]();
			}
		},
		draw:function(){
			this.group.getLayer().draw();

		},
		sync:function(){
			console.log('syncing '+this.model.cid);
			var dates=this.calculateDates();
			this.model.set({start:dates.start,end:dates.end});
			console.log('syncing '+this.model.cid+' finished');
			this.model.save();
		}
		

	}
	//It creates a relation between dependant and dependency
	//Dependant is the task which needs to be done after dependency
	//Suppose task B requires task A to be done beforehand. So, A is dependancy/requirement for B whereas B is dependant on A.
	Bar.createRelation=function(dependency,dependant){
		var connector,parent;
		parent=dependant.group.getParent();
		connector=this.createConnector();
		dependency.addDependant({
			'elem':dependant,
			'connector': connector,
		});
		dependant.addDependancy({
			'elem':dependency,
			'connector': connector,
		});
		
		parent.add(connector);
		
	}
	
	Bar.createConnector=function(){
		return new Kinetic.Line({
			strokeWidth: 1,
			stroke: 'black',
			points: [0, 0]
		});
		
	},
	Bar.enableConnector=function(start){
		Kinetic.Connect.start=start;
		start.subgroupoptions.hideOnHoverOut=false;
	}
	Bar.disableConnector=function(){
		if(!Kinetic.Connect.start) return;
		var start=Kinetic.Connect.start;
		start.subgroupoptions.hideOnHoverOut=true;
		Kinetic.Connect.start=null;
	}
	
	Bar.isConnectorEnabled=function(){
		return Kinetic.Connect.start;
	}
	Bar.renderConnector=function(startBar,endBar,connector){
		
		var point1,point2,halfheight,points,color='#000';
		halfheight=parseInt(startBar.getHeight()/2);
		point1={
			x:startBar.getX2(),
			y:startBar.getY()+halfheight,
		}
		point2={
			x:endBar.getX1(),
			y:endBar.getY()+halfheight,
		}
		var offset=5,arrowflank=4,arrowheight=5,bottomoffset=4;
		

		if(point2.x-point1.x<0){
			if(point2.y<point1.y){
				halfheight= -1*halfheight;
				bottomoffset=-1*bottomoffset;
				//arrowheight=-1*arrowheight;
			}
			points=[
			point1.x,point1.y,
			point1.x+offset,point1.y,
			point1.x+offset,point1.y+halfheight+bottomoffset,
			point2.x-offset,point1.y+halfheight+bottomoffset,
			point2.x-offset,point2.y,
			point2.x,point2.y,
			point2.x-arrowheight,point2.y-arrowflank,
			point2.x-arrowheight,point2.y+arrowflank,
			point2.x,point2.y
			];
			color='red';
			
		}
		else if(point2.x-point1.x<5){
			if(point2.y<point1.y){
				halfheight= -1*halfheight;
				bottomoffset=-1*bottomoffset;
				arrowheight=-1*arrowheight;
			}
			points=[
			point1.x,point1.y,
			point1.x+offset,point1.y,
			point1.x+offset,point2.y-halfheight,
			point1.x+offset-arrowflank,point2.y-halfheight-arrowheight,
			point1.x+offset+arrowflank,point2.y-halfheight-arrowheight,
			point1.x+offset,point2.y-halfheight
			];

		}
		else{
			points=[
			point1.x,point1.y,
			point1.x+offset,point1.y,
			point1.x+offset,point2.y,
			point2.x,point2.y,
			point2.x-arrowheight,point2.y-arrowflank,
			point2.x-arrowheight,point2.y+arrowflank,
			point2.x,point2.y
			];
		}
		connector.setAttr('stroke',color);
		connector.setPoints(points);
	}
	
	Kinetic.Connect={
		start:false,
		end:false
	}
	
	
	
	_.extend(Bar.prototype, Backbone.Events);

	module.exports = Bar;
},{}],10:[function(require,module,exports){
var Bar = require('./Bar');

var BarGroup = function(options){
	this.cid = _.uniqueId('bg');
	this.settings = options.settings;
	this.model = options.model;
	var setting = this.setting = options.settings.getSetting('group');
	this.attr = {
		height: 0
	};
	this.syncing=false;
	this.children=[];

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
					model:child
				}));
				this.renderSortedChildren(true);
			}.bind(this));

			this.listenTo(this.model.children, 'remove', function(child) {
				var viewForDelete = _.find(this.children, function(m) {
					return m.model === child
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
			if(!nodraw)
				this.group.getLayer().draw();
			
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
			return this.attr.height;
		},
		getCurrentHeight:function(){
			if(this.model.get('active'))
				return this.attr.height;
			else{
				return app.setting.getSetting('group','rowHeight');
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
			var parent=this.model.get('parent');
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
			this.listenTo(this.model,'change:active',this.toggleChildren);
			this.listenTo(this.model,'onsort',this.renderSortedChildren);
			this.listenTo(this.model.get('parent'),'change:start change:end', function(){
				this.topbar.setAttrs(this.getRectparams());
				this.topbar.getLayer().draw();
			});

		},
		getGroupParams: function(){
			return _.extend({
				x:0,
				y:0,
			}, this.setting.topBar);
			
		},
		calculateX:function(model){
			var attrs= this.settings.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			return {
				x1:(Date.daysdiff(boundaryMin,model.get('start'))-1)*daysWidth,
				x2:Date.daysdiff(boundaryMin,model.get('end'))*daysWidth,
			}
		},
		calculateParentDates:function(){
			var attrs=app.setting.getSetting('attr'),
			boundaryMin=attrs.boundaryMin,
			daysWidth=attrs.daysWidth;
			var days1=Math.round(this.getX1(true)/daysWidth),days2=Math.round(this.getX2(true)/daysWidth);
			return {
				start: boundaryMin.clone().addDays(days1),
				end:boundaryMin.clone().addDays(days2-1)
			}
			
		},
		getRectparams:function(){
			var parent=this.model.get('parent');
			var xs=this.calculateX(parent);
			var setting=this.setting;
			return _.extend({
				x: xs.x1,
				width:xs.x2-xs.x1,
				y: setting.gap,
			},setting.topBar);
		},
		toggleChildren:function(){
			var show=this.model.get('active');
			var children=this.children;
			for(var i=0;i<children.length;i++){
				children[i].toggle(show)
			}
		},
		sync:function(){
			this.syncing=true;

			console.log('parent sync called');
			//sync parent first
			var pdates=this.calculateParentDates();
			var parent=this.model.get('parent');
			parent.set({start:pdates.start,end:pdates.end});
			
			var children=this.children;
			for(var i=0;i<children.length;i++){
				children[i].sync()
			}
			console.log('setting sync to false');
			this.syncing=false;
		}
	};

_.extend(BarGroup.prototype, Backbone.Events);

module.exports = BarGroup;

},{"./Bar":9}],11:[function(require,module,exports){
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
		this.collection =  this.app.THCollection;

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
			this.groups.push(new BarGroup({
				model: model
			}));

			var gsetting =  this.app.setting.getSetting('group');
			gsetting.currentY = gsetting.iniY;

			this.groups.forEach(function(groupi) {
				groupi.setY(gsetting.currentY);
				gsetting.currentY += groupi.getCurrentHeight();
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
			} else {
				waiting = true;
				setTimeout(function() {
					this.rendergroups();
					waiting = false;
				}.bind(this), 10);
			}
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
		this.collection.each(this.addGroup,this);
	},
	bindEvents:function(){
		var calculating=false;
		this.listenTo( this.app.THCollection, 'change:active', this.rendergroups);
		this.listenTo( this.app.setting, 'change:interval change:dpi', this.renderBars);
		$('#gantt-container').mousewheel(function(e){
			if(calculating) {
				return false;
			}
			var cdpi =  this.app.setting.get('dpi'), dpi=0;
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
		});

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
		});
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
			gsetting.currentY += groupi.getCurrentHeight();
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
			return itemview.model.get('parent').get('sortindex');
		});
		gsetting.currentY = gsetting.iniY;

		sorted.forEach(function(groupi) {
			groupi.setY(gsetting.currentY);
			gsetting.currentY += groupi.getCurrentHeight();
			groupi.renderSortedChildren();
		});
		this.Flayer.draw();
	},
	setWidth: function(value) {
		this.stage.setWidth(value);
	},
	getSceneFunc:function(){
		var setting= this.app.setting,sdisplay=setting.sdisplay;
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
},{"./Bar":9,"./BarGroup":10}],12:[function(require,module,exports){
function prepareAddForm() {
  "use strict";
  $('.masthead .information').transition('scale in');

  $('.ui.new-task').popup();

  $('.ui.form').form({
    name: {
      identifier  : 'name',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a task name'
        }
      ]
    },
    complete: {
      identifier  : 'complete',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter an estimate days'
        }
      ]
    },
    start: {
      identifier : 'start',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please set a start date'
        }
      ]
    },
    end: {
      identifier : 'end',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please set an end date'
        }
      ]
    },
    duration: {
      identifier : 'duration',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please set a valid duration'
        }
      ]
    },
    status: {
      identifier  : 'status',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please select a status'
        }
      ]
    },
  });


  // what is 108???
  $('.ui.dropdown').dropdown('set selected', '108');
  $('input[name="status"]').val(108);

  $(document).on('click','.remove-item button',function(){
    $(this).closest('ul').fadeOut(1000, function(){
      $(this).remove();
    });
  });
}

module.exports = prepareAddForm;

},{}],13:[function(require,module,exports){
function ContextMenuView(app) {
    "use strict";
    this.app = app;
}

ContextMenuView.prototype.render = function() {
    var self = this;
    $('.task-container').contextMenu({
        selector: 'div',
        callback: function(key) {
            var id = $(this.parent()).attr('id');
            var model = self.app.tasks.get(id);
            if(key === 'delete'){
                model.destroy();
                model.save();
                $(this).fadeOut(function(){
                    $(this).remove();
                });
            }
            if(key === 'properties'){
                var $property = '.property-';
                var status = {
                    '108': 'Ready',
                    '109': 'Open',
                    '110': 'Complete'
                };
                var $el = $(document);
                $el.find($property+'name').html(model.get('name'));
                $el.find($property+'description').html(model.get('description'));
                $el.find($property+'start').html(convertDate(model.get('start')));
                $el.find($property+'end').html(convertDate(model.get('end')));
                $el.find($property+'status').html(status[model.get('status')]);
                var startdate = new Date(model.get('start'));
                var enddate = new Date(model.get('end'));
                var _MS_PER_DAY = 1000 * 60 * 60 * 24;
                if(startdate != "" && enddate != ""){
                    var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());
                    var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());
                    $el.find($property+'duration').html(Math.floor((utc2 - utc1) / _MS_PER_DAY));
                }else{
                    $el.find($property+'duration').html(Math.floor(0));
                }
                $('.ui.properties').modal('setting', 'transition', 'vertical flip')
                    .modal('show')
                ;

                function convertDate(inputFormat) {
                    function pad(s) { return (s < 10) ? '0' + s : s; }
                    var d = new Date(inputFormat);
                    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
                }
            }
            if(key === 'rowAbove'){
                var data = {
                    reference_id : id
                };
                self.addTask(data, 'above');
            }
            if(key === 'rowBelow'){
                self.addTask({
                    reference_id : id
                }, 'below');
            }
            if(key === 'indent'){
                $(this).find('.expand-menu').remove();
                var rel_id = $(this).closest('div').prev().find('.sub-task').last().attr('id');
                var prevModel = this.app.tasks.get(rel_id);
                var parent_id = prevModel.get('parentid');
                model.set('parentid', parent_id);
                model.save();
                var tobeChild = $(this).next().children();
                jQuery.each(tobeChild, function(index, data){
                    var childId = $(this).attr('id');
                    var childModel = this.app.tasks.get(childId);
                    childModel.set('parentid',parent_id);
                    childModel.save();
                });
                $(this).removeClass('task').addClass('sub-task').css({
                    'padding-left': '30px'
                });
                location.reload();
            }
            if(key === 'outdent'){
                model.set('parentid',0);
                model.save();
                var tobeChild = $(this).parent().children();
                var currIndex = $(this).index();
                jQuery.each(tobeChild, function(index, data){
                    if(index > currIndex){
                        var childId = $(this).attr('id');
                        var childModel = self.app.tasks.get(childId);
                        childModel.set('parentid',model.get('id'));
                        childModel.save();
                    }
                });
                $(this).prepend('<li class="expand-menu"><i class="triangle up icon"></i> </li>');
                $(this).removeClass('sub-task').addClass('task').css({
                    'padding-left': '0px'
                });
                location.reload();
                // this.canvasView.rendergroups();
            }
        },
        items: {
            "rowAbove": {name: "New Row Above", icon: ""},
            "rowBelow": {name: "New Row Below", icon: ""},
            "indent": {name: "Indent Row", icon: ""},
            "outdent": {name: "Outdent Row", icon: ""},
            "sep1": "---------",
            "properties": {name: "Properties", icon: ""},
            "sep2": "---------",
            "delete": {name: "Delete Row", icon: ""}
        }
    });
};

ContextMenuView.prototype.addTask = function(data, insertPos) {
    var sortindex = 0;
    var ref_model = this.app.tasks.get(data.reference_id);
    if (ref_model) {
        sortindex = ref_model.get('sortindex') + (insertPos === 'above' ? -0.5 : 0.5)
    } else {
        sortindex = (this.app.tasks.last().get('sortindex') + 1);
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get('parentid');
    var task = this.app.tasks.add(data, {parse : true});
    task.save();
};

module.exports = ContextMenuView;
},{}],14:[function(require,module,exports){

var template = "<div>\r\n    <ul>\r\n        <% var setting=app.setting;%>\r\n        <% if(isParent){ %> <li class=\"expand-menu\"><i class=\"triangle down icon\"></i></li><% } %>\r\n        <li class=\"col-name\"><% print(setting.conDToT(\"name\",name)); %></li>\r\n        <li class=\"col-start\"><% print(setting.conDToT(\"start\",start));%></li>\r\n        <li class=\"col-end\"><% print(setting.conDToT(\"end\",end)); %></li>\r\n        <li class=\"col-complete\"><% print(setting.conDToT(\"complete\",complete)); %></li>\r\n        <li class=\"col-status\"><% print(setting.conDToT(\"status\",status)); %></li>\r\n        <li class=\"col-duration\"><% print(setting.conDToT(\"duration\",0,{\"start\":start,\"end\":end})); %></li>\r\n        <li class=\"remove-item\"><button class=\"mini red ui button\"> <i class=\"small trash icon\"></i></button></li>\r\n    </ul>\r\n</div>";

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

},{}],15:[function(require,module,exports){
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

},{"./TaskItemView":14}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL1Rhc2tIaWVyYXJjaHlDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9jb2xsZWN0aW9ucy90YXNrQ29sbGVjdGlvbi5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvZmFrZV9jNTlkZmE1Ny5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1NldHRpbmdNb2RlbC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Rhc2tIaWVyYXJjaHlNb2RlbC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvbW9kZWxzL1Rhc2tNb2RlbC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdXRpbHMvdXRpbC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvR2FudHRWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXMvQmFyLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9jYW52YXMvQmFyR3JvdXAuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhcy9LQ2FudmFzVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvcHJlcGFyZUFkZEZvcm0uanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tJdGVtVmlldy5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9UYXNrVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0c0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRhc2tIaWVyYXJjaHlNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrSGllcmFyY2h5TW9kZWwnKTtcblxudmFyIFRhc2tIaWVyYXJjaHlDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHRtb2RlbDogVGFza0hpZXJhcmNoeU1vZGVsLFxuXHRpbml0aWFsaXplIDogZnVuY3Rpb24obW9kZWxzLCBvcHRpb25zKSB7XG5cdFx0dGhpcy50YXNrcyA9IG9wdGlvbnMudGFza3Ncblx0fSxcblx0Y29tcGFyYXRvciA6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgncGFyZW50JykuZ2V0KCdzb3J0aW5kZXgnKTtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0bW9kZWwuZ2V0KCdwYXJlbnQnKS5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdG1vZGVsLmdldCgnY2hpbGRyZW4nKS5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0dGhpcy50cmlnZ2VyKCdyZXNvcnQnKTtcblx0fSxcblx0cmVzb3J0IDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24ocGFyZW50RGF0YSkge1xuXHRcdFx0dmFyIHBhcmVudE1vZGVsID0gc2VsZi50YXNrcy5nZXQocGFyZW50RGF0YS5pZCk7XG5cdFx0XHRwYXJlbnRNb2RlbC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KTtcblx0XHRcdHBhcmVudERhdGEuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZERhdGEpIHtcblx0XHRcdFx0dmFyIGNoaWxkTW9kZWwgPSBzZWxmLnRhc2tzLmdldChjaGlsZERhdGEuaWQpO1xuXHRcdFx0XHRjaGlsZE1vZGVsLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0XHRpZiAoY2hpbGRNb2RlbC5nZXQoJ3BhcmVudGlkJykgIT09IHBhcmVudE1vZGVsLmlkKSB7XG5cdFx0XHRcdFx0Y2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJywgcGFyZW50TW9kZWwuaWQpO1xuXHRcdFx0XHRcdHZhciBUSHBhcmVudCA9IHNlbGYuZmluZChmdW5jdGlvbihtKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbS5nZXQoJ3BhcmVudCcpLmlkID09PSBwYXJlbnRNb2RlbC5pZDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRUSHBhcmVudC5jaGlsZHJlbi5hZGQoY2hpbGRNb2RlbCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0sXG5cdHN1YnNjcmliZSA6IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcblx0XHR0aGlzLmxpc3RlblRvKGNvbGxlY3Rpb24sICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5nZXQoJ3BhcmVudCcpLmlkID09PSBtb2RlbC5nZXQoJ3BhcmVudGlkJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKG1vZGVsKTtcblx0XHRcdFx0dGhpcy50cmlnZ2VyKCdhZGQnLCBwYXJlbnQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5hZGQoe1xuXHRcdFx0XHRcdHBhcmVudCA6IG1vZGVsLFxuXHRcdFx0XHRcdGNoaWxkcmVuIDogW11cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn0se1xuXHQvLyBzdGF0aWMgZnVuY3Rpb25cblx0aW1wb3J0RGF0YTpmdW5jdGlvbihjb2xsZWN0aW9uLCBwYXJlbnRBdHRyaWJ1dGUsIHJvb3RpZCwgc29ydEJ5KXtcblx0XHRpZighY29sbGVjdGlvbiBpbnN0YW5jZW9mIEJhY2tib25lLkNvbGxlY3Rpb24pe1xuXHRcdFx0dGhyb3cgJ1Rhc2tIaWVyYXJjaHlDb2xsZWN0aW9uIGNhbiBub3QgaW1wb3J0IGRhdGEgb2YgdW5rbm93biBjb2xsZWN0aW9uJztcblx0XHR9XG5cblx0XHRpZiAoIXJvb3RpZCkge1xuXHRcdFx0cm9vdGlkID0gMDtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIGdyb3VwZWQgPSBjb2xsZWN0aW9uLmdyb3VwQnkocGFyZW50QXR0cmlidXRlKTtcblx0XHRcblx0XHRpZiAoIWdyb3VwZWRbcm9vdGlkXSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHZhciBzb3J0ZWQgPSBfLnNvcnRCeShncm91cGVkW3Jvb3RpZF0sZnVuY3Rpb24obW9kZWwpe1xuXHRcdFx0cmV0dXJuIG1vZGVsLmdldChzb3J0QnkpO1xuXHRcdH0pO1xuXG5cdFx0dmFyIG5ld0NvbCA9IG5ldyBUYXNrSGllcmFyY2h5Q29sbGVjdGlvbihbXSwge1xuXHRcdFx0dGFza3MgOiBjb2xsZWN0aW9uXG5cdFx0fSk7XG5cblx0XHRzb3J0ZWQuZm9yRWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0dmFyIHRjb2wgPSB7XG5cdFx0XHRcdHBhcmVudCA6IG1vZGVsLFxuXHRcdFx0XHRjaGlsZHJlbiA6IFtdXG5cdFx0XHR9O1xuXHRcdFx0dmFyIG5ld01vZGVsID0gbmV3Q29sLmFkZCh0Y29sLCB7c2lsZW50OnRydWV9KTtcblxuXHRcdFx0dmFyIGlkID0gbW9kZWwuZ2V0KCdpZCcpO1xuXHRcdFx0aWYgKGdyb3VwZWRbaWRdKSB7XG5cdFx0XHRcdG5ld01vZGVsLmFkZENoaWxkcmVuKGdyb3VwZWRbaWRdKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG5ld0NvbC5zdWJzY3JpYmUoY29sbGVjdGlvbik7XG5cdFx0cmV0dXJuIG5ld0NvbDtcblx0XHRcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0hpZXJhcmNoeUNvbGxlY3Rpb247IiwidmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmwgOiAnYXBpL3Rhc2tzJyxcblx0bW9kZWw6IFRhc2tNb2RlbFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza0NvbGxlY3Rpb247XG5cbiIsInZhciBkZW1vUmVzb3VyY2VzID0gW3tcIndic2lkXCI6MSxcInJlc19pZFwiOjEsXCJyZXNfbmFtZVwiOlwiSm9lIEJsYWNrXCIsXCJyZXNfYWxsb2NhdGlvblwiOjYwfSx7XCJ3YnNpZFwiOjMsXCJyZXNfaWRcIjoyLFwicmVzX25hbWVcIjpcIkpvaG4gQmxhY2ttb3JlXCIsXCJyZXNfYWxsb2NhdGlvblwiOjQwfV07XG5cbnZhciBUYXNrQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvdGFza0NvbGxlY3Rpb24nKTtcbnZhciBUYXNrSGllcmFyY2h5Q29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMvVGFza0hpZXJhcmNoeUNvbGxlY3Rpb24nKTtcbnZhciBTZXR0aW5ncyA9IHJlcXVpcmUoJy4vbW9kZWxzL1NldHRpbmdNb2RlbCcpO1xuXG52YXIgR2FudHRWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9HYW50dFZpZXcnKTtcblxudmFyIHByZXBhcmVBZGRGb3JtID0gcmVxdWlyZSgnLi92aWV3cy9wcmVwYXJlQWRkRm9ybScpO1xuJChmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXHR2YXIgYXBwID0gd2luZG93LmFwcCB8fCB7fTtcblx0YXBwLnRhc2tzID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cblx0YXBwLnRhc2tzLmZldGNoKHtcblx0XHRzdWNjZXNzIDogZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnU3VjY2VzcyBsb2FkaW5nIHRhc2tzLicpO1xuXHRcdFx0YXBwLnNldHRpbmcgPSBuZXcgU2V0dGluZ3Moe30sIHthcHAgOiBhcHB9KTtcblxuXHRcdFx0YXBwLlRIQ29sbGVjdGlvbiA9IFRhc2tIaWVyYXJjaHlDb2xsZWN0aW9uLmltcG9ydERhdGEoXG5cdFx0XHRcdC8qY29sbGVjdGlvbiAgPSovIGFwcC50YXNrcyxcblx0XHRcdFx0LypwYXJlbnRBdHRyaWJ1dGUgID0qLydwYXJlbnRpZCcsXG5cdFx0XHRcdC8qcm9vdGlkID0qLzAsXG5cdFx0XHRcdC8qc29ydEJ5PSovICdzb3J0aW5kZXgnXG5cdFx0XHQpO1xuXG5cdFx0XHRwcmVwYXJlQWRkRm9ybSgpO1xuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcFxuXHRcdFx0fSkucmVuZGVyKCk7XG5cblx0XHRcdC8vIGluaXRhbGl6ZSBwYXJlbnQgc2VsZWN0b3IgZm9yIFwiYWRkIHRhc2sgZm9ybVwiXG5cdFx0XHR2YXIgJHNlbGVjdG9yID0gJCgnLnNlbGVjdC1wYXJlbnQuZHJvcGRvd24nKS5maW5kKCcubWVudScpO1xuXHRcdFx0JHNlbGVjdG9yLmFwcGVuZCgnPGRpdiBjbGFzcz1cIml0ZW1cIiBkYXRhLXZhbHVlPVwiMFwiPk1haW4gUHJvamVjdDwvZGl2PicpO1xuXHRcdFx0YXBwLnRhc2tzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0XHR2YXIgcGFyZW50SWQgPSB0YXNrLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0aWYocGFyZW50SWQgPT09IDApe1xuXHRcdFx0XHRcdCRzZWxlY3Rvci5hcHBlbmQoJzxkaXYgY2xhc3M9XCJpdGVtXCIgZGF0YS12YWx1ZT1cIicgKyB0YXNrLmdldCgnaWQnKSArICdcIj4nICsgdGFzay5nZXQoJ25hbWUnKSArICc8L2Rpdj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGluaXRpYWxpemUgZHJvcGRvd25cblx0XHRcdCQoJy5zZWxlY3QtcGFyZW50LmRyb3Bkb3duJykuZHJvcGRvd24oKTtcblx0XHRcdC8vIGxpbmUgYWRqdXN0bWVudFxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCdidXR0b25bZGF0YS1hY3Rpb249XCJ2aWV3LW1vbnRobHlcIl0nKS50cmlnZ2VyKCdjbGljaycpO1xuXHRcdFx0fSwxMDAwKTtcblxuXHRcdFx0Ly8gUmVzb3VyY2VzIGZyb20gYmFja2VuZFxuXHRcdFx0dmFyICRyZXNvdXJjZXMgPSAnPHNlbGVjdCBpZD1cInJlc291cmNlc1wiICBuYW1lPVwicmVzb3VyY2VzW11cIiBtdWx0aXBsZT1cIm11bHRpcGxlXCI+Jztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVtb1Jlc291cmNlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQkcmVzb3VyY2VzICs9ICc8b3B0aW9uIHZhbHVlPVwiJytkZW1vUmVzb3VyY2VzW2ldLnJlc19pZCsnXCI+JytkZW1vUmVzb3VyY2VzW2ldLnJlc19uYW1lKyc8L29wdGlvbj4nO1xuXHRcdFx0fVxuXHRcdFx0JHJlc291cmNlcyArPSAnPC9zZWxlY3Q+Jztcblx0XHRcdC8vIGFkZCBiYWNrZW5kIHRvIHRoZSB0YXNrIGxpc3Rcblx0XHRcdCQoJy5yZXNvdXJjZXMnKS5hcHBlbmQoJHJlc291cmNlcyk7XG5cblx0XHRcdC8vIGluaXRpYWxpemUgbXVsdGlwbGUgc2VsZWN0b3JzXG5cdFx0XHQkKCcjcmVzb3VyY2VzJykuY2hvc2VuKHt3aWR0aDogJzk1JSd9KTtcblxuXHRcdFx0Ly8gYXNzaWduIHJhbmRvbSBwYXJlbnQgY29sb3Jcblx0XHRcdCQoJ2lucHV0W25hbWU9XCJjb2xvclwiXScpLnZhbCgnIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNikpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9XG5cdH0sIHtwYXJzZTogdHJ1ZX0pO1xufSk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcblxudmFyIGhmdW5jID0gZnVuY3Rpb24ocG9zLCBldnQpIHtcblx0dmFyIGRyYWdJbnRlcnZhbCA9IGFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2F0dHInLCAnZHJhZ0ludGVydmFsJyk7XG5cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcblx0cmV0dXJuIHtcblx0XHR4OiBldnQuaW5pcG9zLnggKyBuICogZHJhZ0ludGVydmFsLFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czp7XG5cdFx0aW50ZXJ2YWw6J2ZpeCcsXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxuXHRcdGRwaToxXG5cdH0sXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwLFxuXHRcdH07XG5cblx0XHR0aGlzLnNncm91cCA9IHtcblx0XHRcdGN1cnJlbnRZOiAwLFxuXHRcdFx0aW5pWTogNjAsXG5cdFx0XHRhY3RpdmU6IGZhbHNlLFxuXHRcdFx0dG9wQmFyOiB7XG5cdFx0XHRcdGZpbGw6ICcjNjY2Jyxcblx0XHRcdFx0aGVpZ2h0OiAxMixcblx0XHRcdFx0c3Ryb2tlRW5hYmxlZDogZmFsc2UsXG5cdFx0XHR9LFxuXHRcdFx0Z2FwOiAzLFxuXHRcdFx0cm93SGVpZ2h0OiAyMixcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdH07XG5cdFx0dGhpcy5zYmFyID0ge1xuXHRcdFx0YmFyaGVpZ2h0OiAxMixcblx0XHRcdHJlY3RvcHRpb246IHtcblx0XHRcdFx0c3Ryb2tlRW5hYmxlZDogZmFsc2UsXG5cdFx0XHRcdGZpbGw6ICdncmV5J1xuXHRcdFx0fSxcblx0XHRcdGdhcDogMjAsXG5cdFx0XHRyb3doZWlnaHQ6ICA2MCxcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdFx0cmVzaXplQm91bmRGdW5jOiBoZnVuYyxcblx0XHRcdHN1Ymdyb3VwOiB0cnVlLFxuXHRcdH0sXG5cdFx0dGhpcy5zZm9ybT17XG5cdFx0XHQnbmFtZSc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICd0ZXh0Jyxcblx0XHRcdH0sXG5cdFx0XHQnc3RhcnQnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnZGF0ZScsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24oZCl7XG5cdFx0XHRcdFx0cmV0dXJuIGQudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dDJkOiBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5wYXJzZUV4YWN0KCB1dGlsLmNvcnJlY3RkYXRlKHQpLCAnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdkYXRlJyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRyZXR1cm4gZC50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0MmQ6IGZ1bmN0aW9uKHQpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLnBhcnNlRXhhY3QoIHV0aWwuY29ycmVjdGRhdGUodCksICdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3NlbGVjdCcsXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHQnMTEwJzogJ2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5JzogJ29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2NvbXBsZXRlJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnLFxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICd0ZXh0Jyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbih0LG1vZGVsKXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5nZXQoJ3N0YXJ0JyksbW9kZWwuZ2V0KCdlbmQnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcblx0XHR9O1xuXHRcdHRoaXMuZ2V0Rm9ybUVsZW0gPSB0aGlzLmNyZWF0ZUVsZW0oKTtcblx0XHR0aGlzLmNvbGxlY3Rpb24gPSB0aGlzLmFwcC50YXNrcztcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xuXHRcdHRoaXMub24oJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMpO1xuXHR9LFxuXHRnZXRTZXR0aW5nOmZ1bmN0aW9uKGZyb20sYXR0cil7XG5cdFx0aWYoYXR0cil7XG5cdFx0XHRyZXR1cm4gdGhpc1sncycrZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJytmcm9tXTtcblx0fSxcblx0Y2FsY21pbm1heDpmdW5jdGlvbigpe1xuXHRcdHZhciBjb2xsZWN0aW9uPXRoaXMuY29sbGVjdGlvbjtcblx0XHR2YXIgbWluRGF0ZT1uZXcgRGF0ZSgyMDIwLDEsMSksbWF4RGF0ZT1uZXcgRGF0ZSgwLDAsMCk7XG5cdFx0XG5cdFx0Y29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdGlmKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSk9PS0xKXtcblx0XHRcdFx0bWluRGF0ZT1tb2RlbC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR9XG5cdFx0XHRpZihtb2RlbC5nZXQoJ2VuZCcpLmNvbXBhcmVUbyhtYXhEYXRlKT09MSl7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGU9bWluRGF0ZTtcblx0XHR0aGlzLnNhdHRyLm1heERhdGU9bWF4RGF0ZTtcblx0XHRcblx0fSxcblx0c2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVuZCxpbnRlcnZhbCxzYXR0cj10aGlzLnNhdHRyLGRhdHRyPXRoaXMuc2Rpc3BsYXksZHVyYXRpb24sc2l6ZSxjZWxsV2lkdGgsZHBpLHJldGZ1bmMsc3RhcnQsbGFzdCxpPTAsaj0wLGlMZW49MCxuZXh0PW51bGw7XG5cdFx0XG5cdFx0aW50ZXJ2YWwgPSB0aGlzLmdldCgnaW50ZXJ2YWwnKTtcblx0XHQvL1RPRE86bmVlZHMgaW1wcm92ZW1lbnQgaW5zdGFlZCBvZiBjbG9uaW5nIGNvbnZlcnQgaW50byB0aW1lIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2Vcblx0XHRpZihpbnRlcnZhbD09PSdkYWlseScpe1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsMSx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbj1zYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSoyMCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9MTI7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGg9c2F0dHIuZGF5c1dpZHRoKjE7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWw9MSpzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7IH07XG5cdFx0XHRzYXR0ci5tcGM9MTtcblx0XHRcdFxuXHRcdH1cblx0XHRlbHNlIGlmKGludGVydmFsPT09J3dlZWtseScpe1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsNyx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCo3KTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluPXNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xKjIwKjcpLm1vdmVUb0RheU9mV2VlaygxLC0xKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aD01O1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoPXNhdHRyLmRheXNXaWR0aCo3O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsPTEqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjPTE7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoNyk7IH1cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZSBpZihpbnRlcnZhbD09PSdtb250aGx5Jyl7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywzMCx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCozMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbj1zYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSoyMCozMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9Mjtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aD0nYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWw9NypzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGM9MTtcblx0XHRcdHJldGZ1bmM9ZnVuY3Rpb24oZGF0ZSl7IHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpOyB9XG5cdFx0XG5cdFx0fVxuXHRcdGVsc2UgaWYoaW50ZXJ2YWw9PT0ncXVhcnRlcmx5Jyl7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywzMCx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCozMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbj1zYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSoyMCozMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbi5tb3ZlVG9GaXJzdERheU9mUXVhcnRlcigpO1xuXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9MTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aD0nYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWw9MzAqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjPTM7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTsgfVxuXHRcdH1cblx0XHRlbHNlIGlmKGludGVydmFsPT09J2ZpeCcpe1xuXHRcdFx0Y2VsbFdpZHRoPTMwO1xuXHRcdFx0ZHVyYXRpb249RGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZT1kYXR0ci5zY3JlZW5XaWR0aC1kYXR0ci50SGlkZGVuV2lkdGgtMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoPXNpemUvZHVyYXRpb247XG5cdFx0XHRkcGk9TWF0aC5yb3VuZChjZWxsV2lkdGgvc2F0dHIuZGF5c1dpZHRoKTtcblx0XHRcdHRoaXMuc2V0KCdkcGknLGRwaSx7c2lsZW50OnRydWV9KTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aD1kcGkqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW49c2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIqZHBpKTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbD1NYXRoLnJvdW5kKC4zKmRwaSkqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0ZW5kPXNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIqZHBpKTtcblx0XHRcdHNhdHRyLm1wYz1NYXRoLm1heCgxLE1hdGgucm91bmQoZHBpLzMwKSk7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTsgfTtcblx0XHRcdFxuXHRcdH1cblx0XHRlbHNlIGlmKGludGVydmFsPT09J2F1dG8nKXtcblx0XHRcdGRwaT10aGlzLmdldCgnZHBpJyk7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGg9KDErTWF0aC5sb2coZHBpKSkqMTI7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9c2F0dHIuY2VsbFdpZHRoL2RwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluPXNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yMCpkcGkpO1xuXHRcdFx0ZW5kPXNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwKmRwaSk7XG5cdFx0XHRzYXR0ci5tcGM9TWF0aC5tYXgoMSxNYXRoLnJvdW5kKGRwaS8zMCkpO1xuXHRcdFx0cmV0ZnVuYz1mdW5jdGlvbihkYXRlKXsgcmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7IH1cblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbD1NYXRoLnJvdW5kKC4zKmRwaSkqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgaERhdGE9e1xuXHRcdFx0JzEnOltdLFxuXHRcdFx0JzInOltdLFxuXHRcdFx0JzMnOltdXG5cdFx0fVxuXHRcdHZhciBoZGF0YTM9W107XG5cdFx0XG5cdFx0c3RhcnQ9c2F0dHIuYm91bmRhcnlNaW47XG5cdFx0XG5cdFx0bGFzdCA9IHN0YXJ0O1xuXHRcdGlmKGludGVydmFsPT0nbW9udGhseScgfHwgaW50ZXJ2YWw9PSdxdWFydGVybHknKVxuXHRcdHtcblx0XHRcdHZhciBkdXJmdW5jPShpbnRlcnZhbD09PSdtb250aGx5Jyk/ZnVuY3Rpb24oZGF0ZSl7IHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO306ZnVuY3Rpb24oZGF0ZSl7IHJldHVybiBEYXRlLmdldERheXNJblF1YXJ0ZXIoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0UXVhcnRlcigpKTt9O1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT0gLTEpIHtcblx0XHRcdFx0XHRoZGF0YTMucHVzaCh7ZHVyYXRpb246ZHVyZnVuYyhsYXN0KSx0ZXh0Omxhc3QuZ2V0RGF0ZSgpfSk7XG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XG5cdFx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzPXRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdFxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT0gLTEpIHtcblx0XHRcdFx0aGRhdGEzLnB1c2goe2R1cmF0aW9uOmludGVydmFsZGF5cyx0ZXh0Omxhc3QuZ2V0RGF0ZSgpfSk7XG5cdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRzYXR0ci5ib3VuZGFyeU1heD1lbmQ9bGFzdDtcblx0XHRoRGF0YVsnMyddPWhkYXRhMztcblx0XHRcblx0XHR2YXIgaW50ZXI9MDtcblx0XHRcdFxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgZGF0ZSB0byBlbmQgb2YgeWVhclxuXHRcdGludGVyPURhdGUuZGF5c2RpZmYoc3RhcnQsbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwxMSwzMSkpO1xuXHRcdGhEYXRhWycxJ10ucHVzaCh7ZHVyYXRpb246aW50ZXIsdGV4dDpzdGFydC5nZXRGdWxsWWVhcigpfSk7XG5cdFx0Zm9yKGk9c3RhcnQuZ2V0RnVsbFllYXIoKSsxLGlMZW49ZW5kLmdldEZ1bGxZZWFyKCk7aTxpTGVuO2krKyl7XG5cdFx0XHRpbnRlcj1EYXRlLmlzTGVhcFllYXIoaSk/MzY2OjM2NTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7ZHVyYXRpb246aW50ZXIsdGV4dDppfSk7XG5cdFx0fVxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgbGFzdCB5ZWFyIHVwdG8gZW5kIGRhdGVcblx0XHRpZihzdGFydC5nZXRGdWxsWWVhcigpIT09ZW5kLmdldEZ1bGxZZWFyKCkpe1xuXHRcdFx0aW50ZXI9RGF0ZS5kYXlzZGlmZihuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwwLDEpLGVuZCk7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe2R1cmF0aW9uOmludGVyLHRleHQ6ZW5kLmdldEZ1bGxZZWFyKCl9KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxuXHRcdGhEYXRhWycyJ10ucHVzaCh7ZHVyYXRpb246RGF0ZS5kYXlzZGlmZihzdGFydCxzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCdtJyl9KTtcblx0XHRcblx0XHRqPXN0YXJ0LmdldE1vbnRoKCkrMTtcblx0XHRpPXN0YXJ0LmdldEZ1bGxZZWFyKCk7XG5cdFx0aUxlbj1lbmQuZ2V0RnVsbFllYXIoKTtcblx0XHR2YXIgZW5kbW9udGg9ZW5kLmdldE1vbnRoKClcblx0XHR3aGlsZShpPD1pTGVuKXtcblx0XHRcdHdoaWxlKGo8MTIpe1xuXHRcdFx0XHRpZihpPT1pTGVuICYmIGo9PWVuZG1vbnRoKSBicmVhazsgXG5cdFx0XHRcdGhEYXRhWycyJ10ucHVzaCh7ZHVyYXRpb246RGF0ZS5nZXREYXlzSW5Nb250aChpLGopLHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShqLCdtJyl9KTtcblx0XHRcdFx0aiArPSAxO1xuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdGkgKz0gMTtcblx0XHRcdGo9MDtcblx0XHR9XG5cdFx0aWYoZW5kLmdldE1vbnRoKCkhPT1zdGFydC5nZXRNb250aCAmJiBlbmQuZ2V0RnVsbFllYXIoKSE9PXN0YXJ0LmdldEZ1bGxZZWFyKCkpe1xuXHRcdFx0aERhdGFbJzInXS5wdXNoKHtkdXJhdGlvbjpEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLGVuZCksdGV4dDogdXRpbC5mb3JtYXRkYXRhKGVuZC5nZXRNb250aCgpLCdtJyl9KTtcblx0XHRcblx0XHR9XG5cdFx0c2F0dHIuaERhdGE9aERhdGE7XG5cdFx0XG5cdH0sXG5cdGNhbGN1bGF0ZUludGVydmFsczpmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xuXHR9LFxuXHRjcmVhdGVFbGVtOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIGVsZW1zPXt9LG9iaixjYWxsYmFjaz1mYWxzZSxjb250ZXh0PWZhbHNlO1xuXHRcdGZ1bmN0aW9uIGJpbmRUZXh0RXZlbnRzKGVsZW1lbnQsb2JqLG5hbWUpe1xuXHRcdFx0ZWxlbWVudC5vbignYmx1cicsZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHZhciAkdGhpcz0kKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWU9JHRoaXMudmFsKCk7XG5cdFx0XHRcdCR0aGlzLmRldGFjaCgpO1xuXHRcdFx0XHR2YXIgY2FsbGZ1bmM9Y2FsbGJhY2ssY3R4PWNvbnRleHQ7XG5cdFx0XHRcdGNhbGxiYWNrPWZhbHNlO1xuXHRcdFx0XHRjb250ZXh0PWZhbHNlO1xuXHRcdFx0XHRpZihvYmpbJ3QyZCddKSB2YWx1ZT1vYmpbJ3QyZCddKHZhbHVlKTtcblx0XHRcdFx0Y2FsbGZ1bmMuY2FsbChjdHgsbmFtZSx2YWx1ZSk7XG5cdFx0XHR9KS5vbigna2V5cHJlc3MnLGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRpZihldmVudC53aGljaD09PTEzKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0XG5cdFx0ZnVuY3Rpb24gYmluZERhdGVFdmVudHMoZWxlbWVudCxvYmosbmFtZSl7XG5cdFx0XHRlbGVtZW50LmRhdGVwaWNrZXIoeyBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCIsb25DbG9zZTpmdW5jdGlvbigpe1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCdvbiBjbG9zZSBjYWxsZWQnKTtcblx0XHRcdFx0dmFyICR0aGlzPSQodGhpcyk7XG5cdFx0XHRcdHZhciB2YWx1ZT0kdGhpcy52YWwoKTtcblx0XHRcdFx0JHRoaXMuZGV0YWNoKCk7XG5cdFx0XHRcdHZhciBjYWxsZnVuYz1jYWxsYmFjayxjdHg9Y29udGV4dDtcblx0XHRcdFx0Y2FsbGJhY2s9ZmFsc2U7XG5cdFx0XHRcdGNvbnRleHQ9ZmFsc2U7XG5cdFx0XHRcdGlmKG9ialsndDJkJ10pIHZhbHVlPW9ialsndDJkJ10odmFsdWUpO1xuXHRcdFx0XHRjYWxsZnVuYy5jYWxsKGN0eCxuYW1lLHZhbHVlKTtcblx0XHRcdH19KTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yKHZhciBpIGluIHRoaXMuc2Zvcm0pe1xuXHRcdFx0b2JqPXRoaXMuc2Zvcm1baV07XG5cdFx0XHRpZihvYmouZWRpdGFibGUpe1xuXHRcdFx0XHRpZihvYmoudHlwZT09PSd0ZXh0Jyl7XG5cdFx0XHRcdFx0ZWxlbXNbaV09JCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJjb250ZW50LWVkaXRcIj4nKTtcblx0XHRcdFx0XHRiaW5kVGV4dEV2ZW50cyhlbGVtc1tpXSxvYmosaSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZihvYmoudHlwZT09PSdkYXRlJyl7XG5cdFx0XHRcdFx0ZWxlbXNbaV09JCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJjb250ZW50LWVkaXRcIj4nKTtcblx0XHRcdFx0XHRiaW5kRGF0ZUV2ZW50cyhlbGVtc1tpXSxvYmosaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcblx0XHR9XG5cdFx0Ly9jb25zb2xlLmxvZyhlbGVtcyk7XG5cdFx0b2JqPW51bGw7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLG1vZGVsLGNhbGxmdW5jLGN0eCl7XG5cdFx0XHRjYWxsYmFjaz1jYWxsZnVuYztcblx0XHRcdGNvbnRleHQ9Y3R4O1xuXHRcdFx0dmFyIGVsZW1lbnQ9ZWxlbXNbZmllbGRdLHZhbHVlPW1vZGVsLmdldChmaWVsZCk7XG5cdFx0XHRpZih0aGlzLnNmb3JtW2ZpZWxkXS5kMnQpICB2YWx1ZT10aGlzLnNmb3JtW2ZpZWxkXS5kMnQodmFsdWUsbW9kZWwpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhlbGVtZW50KTtcblx0XHRcdGVsZW1lbnQudmFsKHZhbHVlKTtcblx0XHRcdHJldHVybiBlbGVtZW50O1xuXHRcdH1cblx0XG5cdH0sXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRUb1RleHQ9e1xuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzdGF0dXNlc1t2YWx1ZV07XG5cdFx0XHR9XG5cdFx0XG5cdFx0fVxuXHRcdHJldHVybiBmdW5jdGlvbihmaWVsZCx2YWx1ZSxtb2RlbCl7XG5cdFx0XHRyZXR1cm4gZFRvVGV4dFtmaWVsZF0/ZFRvVGV4dFtmaWVsZF0odmFsdWUsbW9kZWwpOnZhbHVlO1xuXHRcdH1cblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwiXG52YXIgVGFza0hpZXJhcmNoeU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6e1xuXHRcdHBhcmVudDogbnVsbCxcblx0XHRhY3RpdmU6IHRydWVcblx0fSxcblx0aW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY2hpbGRyZW4gPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHR0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLmNoaWxkcmVuLCAnYWRkIHJlbW92ZSBjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIHRoaXMuX2NoZWNrVGltZSk7XG5cdH0sXG5cdGFkZENoaWxkcmVuOmZ1bmN0aW9uKGNoaWxkcmVuKXtcblx0XHRjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHR0aGlzLmNoaWxkcmVuLmFkZChjaGlsZCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0X2NoZWNrVGltZSA6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgc3RhcnRUaW1lID0gdGhpcy5jaGlsZHJlbi5hdCgwKS5nZXQoJ3N0YXJ0Jyk7XG5cdFx0dmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XG5cdFx0dGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHR2YXIgY2hpbGRTdGFydFRpbWUgPSBjaGlsZC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR2YXIgY2hpbGRFbmRUaW1lID0gY2hpbGQuZ2V0KCdlbmQnKTtcblx0XHRcdGlmKGNoaWxkU3RhcnRUaW1lLmNvbXBhcmVUbyhzdGFydFRpbWUpID09PSAtMSkge1xuXHRcdFx0XHRzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcblx0XHRcdH1cblx0XHRcdGlmKGNoaWxkRW5kVGltZS5jb21wYXJlVG8oZW5kVGltZSkgPT09IDEpe1xuXHRcdFx0XHRlbmRUaW1lID0gY2hpbGRFbmRUaW1lO1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5nZXQoJ3BhcmVudCcpLnNldCgnc3RhcnQnLCBzdGFydFRpbWUpO1xuXHRcdHRoaXMuZ2V0KCdwYXJlbnQnKS5zZXQoJ2VuZCcsIGVuZFRpbWUpO1xuXG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tIaWVyYXJjaHlNb2RlbDtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbHMvdXRpbCcpO1xyXHJ2YXIgVGFza01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcciAgICBkZWZhdWx0czoge1xyICAgICAgICBuYW1lOiAnTmV3IHRhc2snLFxyICAgICAgICBkZXNjcmlwdGlvbjogJycsXHIgICAgICAgIGNvbXBsZXRlOiAwLFxyICAgICAgICBhY3Rpb246ICcnLFxyICAgICAgICBzb3J0aW5kZXg6IDAsXHIgICAgICAgIGRlcGVuZGVuY3k6JycsXHIgICAgICAgIHJlc291cmNlczoge30sXHIgICAgICAgIHN0YXR1czogMTEwLFxyICAgICAgICBoZWFsdGg6IDIxLFxyICAgICAgICBzdGFydDogJycsXHIgICAgICAgIGVuZDogJycsXHIgICAgICAgIGNvbG9yOicjMDA5MGQzJyxcciAgICAgICAgYVR5cGU6ICcnLFxyICAgICAgICByZXBvcnRhYmxlOiAnJyxcciAgICAgICAgcGFyZW50aWQ6IDBcciAgICB9LFxyICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xyICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLnN0YXJ0KSl7XHIgICAgICAgICAgICByZXNwb25zZS5zdGFydCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLnN0YXJ0KSwnZGQvTU0veXl5eScpIHx8XHIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHJlc3BvbnNlLnN0YXJ0KTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gbmV3IERhdGUoKTtcciAgICAgICAgfVxyICAgICAgICBcciAgICAgICAgaWYoXy5pc1N0cmluZyhyZXNwb25zZS5lbmQpKXtcciAgICAgICAgICAgIHJlc3BvbnNlLmVuZCA9IERhdGUucGFyc2VFeGFjdCh1dGlsLmNvcnJlY3RkYXRlKHJlc3BvbnNlLmVuZCksJ2RkL01NL3l5eXknKSB8fFxyICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2UuZW5kKTtcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIHJlc3BvbnNlLmVuZCA9IG5ldyBEYXRlKCk7XHIgICAgICAgIH1cciAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IFRhc2tNb2RlbDtcciIsInZhciBtb250aHNDb2RlPVsnSmFuJywnRmViJywnTWFyJywnQXByJywnTWF5JywnSnVuJywnSnVsJywnQXVnJywnU2VwJywnT2N0JywnTm92JywnRGVjJ107XG5cbm1vZHVsZS5leHBvcnRzLmNvcnJlY3RkYXRlID0gZnVuY3Rpb24oc3RyKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4gc3RyO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZm9ybWF0ZGF0YSA9IGZ1bmN0aW9uKHZhbCwgdHlwZSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKHR5cGUgPT09ICdtJykge1xuXHRcdHJldHVybiBtb250aHNDb2RlW3ZhbF07XG5cdH1cblx0cmV0dXJuIHZhbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmhmdW5jID0gZnVuY3Rpb24ocG9zKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRyZXR1cm4ge1xuXHRcdHg6IHBvcy54LFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07IiwidmFyIENvbnRleHRNZW51VmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9Db250ZXh0TWVudVZpZXcnKTtccnZhciBUYXNrVmlldyA9IHJlcXVpcmUoJy4vc2lkZUJhci9UYXNrVmlldycpO1xydmFyIEtDYW52YXNWaWV3ID0gcmVxdWlyZSgnLi9jYW52YXMvS0NhbnZhc1ZpZXcnKTtcclxydmFyIEdhbnR0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcciAgICBlbDogJy5HYW50dCcsXHIgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKSB7XHIgICAgICAgIHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcciAgICAgICAgdGhpcy5jb2xsZWN0aW9uID0gdGhpcy5hcHAuVEhDb2xsZWN0aW9uO1xyICAgICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcudGFzay1jb250YWluZXInKTtcciAgICAgICAgdGhpcy4kc3VibWl0QnV0dG9uID0gdGhpcy4kZWwuZmluZCgnI3N1Ym1pdEZyb20nKTtcciAgICAgICAgdGhpcy4kc3VibWl0QnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcciAgICAgICAgICAgIHRoaXMuc3VibWl0Rm9ybShlKTtcciAgICAgICAgfS5iaW5kKHRoaXMpKTtcciAgICAgICAgdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXSxpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS5vbignY2hhbmdlJywgdGhpcy5jYWxjdWxhdGVEdXJhdGlvbik7XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIgPSB0aGlzLiRlbC5maW5kKCcubWVudS1jb250YWluZXInKTtcciAgICAgICAgdGhpcy5tYWtlU29ydGFibGUoKTtcciAgICAgICAgdGhpcy5kZWZpbmVDb250ZXh0TWVudSgpO1xyXHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnc29ydGVkIGFkZCcsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy4kY29udGFpbmVyLmVtcHR5KCk7XHIgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xyICAgICAgICB9KTtcciAgICB9LFxyICAgIG1ha2VTb3J0YWJsZTogZnVuY3Rpb24oKSB7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lci5zb3J0YWJsZSh7XHIgICAgICAgICAgICBncm91cDogJ3NvcnRhYmxlJyxcciAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yIDogJ29sJyxcciAgICAgICAgICAgIGl0ZW1TZWxlY3RvciA6ICcuZHJhZy1pdGVtJyxcciAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyIHNvcnQtcGxhY2Vob2xkZXJcIi8+JyxcciAgICAgICAgICAgIG9uRHJhZyA6IGZ1bmN0aW9uKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCkge1xyICAgICAgICAgICAgICAgIHZhciAkcGxhY2Vob2xkZXIgPSAkKCcuc29ydC1wbGFjZWhvbGRlcicpO1xyICAgICAgICAgICAgICAgIHZhciBpc1N1YlRhc2sgPSAhJCgkcGxhY2Vob2xkZXIucGFyZW50KCkpLmhhc0NsYXNzKCd0YXNrLWNvbnRhaW5lcicpO1xyICAgICAgICAgICAgICAgICRwbGFjZWhvbGRlci5jc3Moe1xyICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JyA6IGlzU3ViVGFzayA/ICczMHB4JyA6ICcwJ1xyICAgICAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgICAgIF9zdXBlcigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpO1xyICAgICAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy4kY29udGFpbmVyLnNvcnRhYmxlKFwic2VyaWFsaXplXCIpLmdldCgpWzBdO1xyICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbihwYXJlbnREYXRhKSB7XHIgICAgICAgICAgICAgICAgICAgIHBhcmVudERhdGEuY2hpbGRyZW4gPSBwYXJlbnREYXRhLmNoaWxkcmVuWzBdO1xyICAgICAgICAgICAgICAgIH0pO1xyICAgICAgICAgICAgICAgIHRoaXMuYXBwLlRIQ29sbGVjdGlvbi5yZXNvcnQoZGF0YSk7XHIgICAgICAgICAgICB9LmJpbmQodGhpcyksXHIgICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcciAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcciAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuJGNvbnRhaW5lci5zb3J0YWJsZShcInNlcmlhbGl6ZVwiKS5nZXQoKVswXTtcciAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24ocGFyZW50RGF0YSkge1xyICAgICAgICAgICAgICAgICAgICBwYXJlbnREYXRhLmNoaWxkcmVuID0gcGFyZW50RGF0YS5jaGlsZHJlblswXTtcciAgICAgICAgICAgICAgICB9KTtcciAgICAgICAgICAgICAgICB0aGlzLmFwcC5USENvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgZXZlbnRzOiB7XHIgICAgICAgICdjbGljayAjdEhhbmRsZSc6ICdleHBhbmQnLFxyICAgICAgICAnZGJsY2xpY2sgLnN1Yi10YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcciAgICAgICAgJ2RibGNsaWNrIC50YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcciAgICAgICAgJ2hvdmVyIC5zdWItdGFzayc6ICdzaG93TWFzaycsXHIgICAgICAgICdjbGljayAuaGVhZC1iYXIgYnV0dG9uJzogJ2hhbmRidXR0b25jbGljaycsXHIgICAgICAgICdjbGljayAubmV3LXRhc2snOiAnb3BlbkZvcm0nLFxyICAgICAgICAnY2xpY2sgYVtocmVmPVwiLyMhL2dlbmVyYXRlL1wiXSc6ICdnZW5lcmF0ZVBkZidcciAgICB9LFxyICAgIGRlZmluZUNvbnRleHRNZW51OiBmdW5jdGlvbigpe1xyICAgICAgICB2YXIgY29udGV4dFZpZXcgPSBuZXcgQ29udGV4dE1lbnVWaWV3KHRoaXMuYXBwKTtcciAgICAgICAgY29udGV4dFZpZXcucmVuZGVyKCk7XHIgICAgfSxcciAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHIgICAgICAgICAgICB0aGlzLmFkZFRhc2sodGFzayk7XHIgICAgICAgIH0sIHRoaXMpO1xyICAgICAgICB0aGlzLmNhbnZhc1ZpZXcgPSBuZXcgS0NhbnZhc1ZpZXcoe1xyICAgICAgICAgICAgYXBwIDogdGhpcy5hcHBcciAgICAgICAgfSkucmVuZGVyKCk7XHIgICAgICAgIHRoaXMubWFrZVNvcnRhYmxlKCk7XHIgICAgfSxcciAgICBoYW5kbGVyb3djbGljazogZnVuY3Rpb24oZXZ0KSB7XHIgICAgICAgIHZhciBpZCA9IGV2dC5jdXJyZW50VGFyZ2V0LmlkO1xyICAgICAgICB0aGlzLmFwcC50YXNrcy5nZXQoaWQpLnRyaWdnZXIoJ2VkaXRyb3cnLCBldnQpO1xyICAgIH0sXHIgICAgaGFuZGJ1dHRvbmNsaWNrOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpO1xyICAgICAgICB2YXIgYWN0aW9uID0gYnV0dG9uLmRhdGEoJ2FjdGlvbicpO1xyICAgICAgICB2YXIgaW50ZXJ2YWwgPSBhY3Rpb24uc3BsaXQoJy0nKVsxXTtcciAgICAgICAgdGhpcy5hcHAuc2V0dGluZy5zZXQoJ2ludGVydmFsJywgaW50ZXJ2YWwpO1xyICAgIH0sXHIgICAgZ2VuZXJhdGVQZGY6IGZ1bmN0aW9uKGV2dCl7XHIgICAgICAgIHdpbmRvdy5wcmludCgpO1xyICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcciAgICB9LFxyICAgIGNhbGN1bGF0ZUR1cmF0aW9uOiBmdW5jdGlvbigpe1xyXHIgICAgICAgIC8vIENhbGN1bGF0aW5nIHRoZSBkdXJhdGlvbiBmcm9tIHN0YXJ0IGFuZCBlbmQgZGF0ZVxyICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cInN0YXJ0XCJdJykudmFsKCkpO1xyICAgICAgICB2YXIgZW5kZGF0ZSA9IG5ldyBEYXRlKCQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJlbmRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHIgICAgICAgIGlmKHN0YXJ0ZGF0ZSAhPT0gXCJcIiAmJiBlbmRkYXRlICE9PSBcIlwiKXtcciAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgIHZhciB1dGMyID0gRGF0ZS5VVEMoZW5kZGF0ZS5nZXRGdWxsWWVhcigpLCBlbmRkYXRlLmdldE1vbnRoKCksIGVuZGRhdGUuZ2V0RGF0ZSgpKTtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKCh1dGMyIC0gdXRjMSkgLyBfTVNfUEVSX0RBWSkpO1xyICAgICAgICB9ZWxzZXtcciAgICAgICAgICAgICQoZG9jdW1lbnQpLmZpbmQoJ2lucHV0W25hbWU9XCJkdXJhdGlvblwiXScpLnZhbChNYXRoLmZsb29yKDApKTtcciAgICAgICAgfVxyICAgIH0sXHIgICAgZXhwYW5kOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIHRhcmdldCA9ICQoZXZ0LnRhcmdldCk7XHIgICAgICAgIHZhciB3aWR0aCA9IDA7XHIgICAgICAgIHZhciBzZXR0aW5nID0gdGhpcy5hcHAuc2V0dGluZy5nZXRTZXR0aW5nKCdkaXNwbGF5Jyk7XHIgICAgICAgIGlmICh0YXJnZXQuaGFzQ2xhc3MoJ2NvbnRyYWN0JykpIHtcciAgICAgICAgICAgIHdpZHRoID0gc2V0dGluZy50SGlkZGVuV2lkdGg7XHIgICAgICAgIH1cciAgICAgICAgZWxzZSB7XHIgICAgICAgICAgICB3aWR0aCA9IHNldHRpbmcudGFibGVXaWR0aDtcciAgICAgICAgfVxyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmNzcygnd2lkdGgnLCB3aWR0aCk7XHIgICAgICAgIHRoaXMuY2FudmFzVmlldy5zZXRXaWR0aChzZXR0aW5nLnNjcmVlbldpZHRoIC0gd2lkdGggLSAyMCk7XHIgICAgICAgIHRhcmdldC50b2dnbGVDbGFzcygnY29udHJhY3QnKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lci5maW5kKCcubWVudS1oZWFkZXInKS50b2dnbGVDbGFzcygnbWVudS1oZWFkZXItb3BlbmVkJyk7XHJcciAgICB9LFxyICAgIG9wZW5Gb3JtOiBmdW5jdGlvbigpIHtcciAgICAgICAgJCgnLnVpLmFkZC1uZXctdGFzaycpLm1vZGFsKCdzZXR0aW5nJywgJ3RyYW5zaXRpb24nLCAndmVydGljYWwgZmxpcCcpXHIgICAgICAgIC5tb2RhbCgnc2hvdycpXHIgICAgICAgIDtcciAgICB9LFxyICAgIGFkZFRhc2s6IGZ1bmN0aW9uKHRhc2spIHtcciAgICAgICAgdmFyIHRhc2tWaWV3ID0gbmV3IFRhc2tWaWV3KHttb2RlbDogdGFzaywgYXBwIDogdGhpcy5hcHB9KTtcciAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0YXNrVmlldy5yZW5kZXIoKS5lbCk7XHIgICAgfSxcciAgICBzdWJtaXRGb3JtOiBmdW5jdGlvbihlKSB7XHIgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxyICAgICAgICB2YXIgZm9ybSA9ICQoXCIjbmV3LXRhc2stZm9ybVwiKTtcciAgICAgICAgdmFyIGRhdGEgPSB7fTtcciAgICAgICAgJChmb3JtKS5zZXJpYWxpemVBcnJheSgpLmZvckVhY2goZnVuY3Rpb24oaW5wdXQpIHtcciAgICAgICAgICAgIGRhdGFbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcciAgICAgICAgfSk7XHJcciAgICAgICAgdmFyIHNvcnRpbmRleCA9IDA7XHIgICAgICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyICAgICAgICBpZiAocmVmX21vZGVsKSB7XHIgICAgICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChkYXRhLmluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpXHIgICAgICAgIH0gZWxzZSB7XHIgICAgICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcciAgICAgICAgfVxyICAgICAgICBkYXRhLnNvcnRpbmRleCA9IHNvcnRpbmRleDtcciAgICAgICAgZGF0YS5pZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKTtcciAgICAgICAgdmFyIHRhc2sgPSB0aGlzLmFwcC50YXNrcy5hZGQoZGF0YSwge3BhcnNlIDogdHJ1ZX0pO1xyICAgICAgICB0YXNrLnNhdmUoKTtcclxyICAgICAgICAkKCcudWkubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyICAgIH1ccn0pO1xyXHJtb2R1bGUuZXhwb3J0cyA9IEdhbnR0VmlldztcciIsIlx0dmFyIGRkPUtpbmV0aWMuREQ7XG5cdHZhciBiYXJPcHRpb25zPVsnZHJhZ2dhYmxlJywnZHJhZ0JvdW5kRnVuYycsJ3Jlc2l6YWJsZScsJ3Jlc2l6ZUJvdW5kRnVuYycsJ2hlaWdodCcsJ3dpZHRoJywneCcsJ3knXTtcblxuXHR2YXIgY2FsY3VsYXRpbmc9ZmFsc2U7XG5cdGZ1bmN0aW9uIGNyZWF0ZUhhbmRsZShvcHRpb24pe1xuXHRcdG9wdGlvbi5kcmFnZ2FibGU9dHJ1ZTtcblx0XHRvcHRpb24ub3BhY2l0eT0xO1xuXHRcdG9wdGlvbi5zdHJva2VFbmFibGVkPWZhbHNlO1xuXHRcdG9wdGlvbi53aWR0aD0yO1xuXHRcdG9wdGlvbi5maWxsPSdibGFjayc7XG5cdFx0cmV0dXJuIG5ldyBLaW5ldGljLlJlY3Qob3B0aW9uKTtcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVTdWJHcm91cChvcHRpb24pe1xuXHRcdHZhciBncj1uZXcgS2luZXRpYy5Hcm91cCgpO1xuXHRcdHZhciBpbWdyZWN0PW5ldyBLaW5ldGljLlJlY3Qoe1xuXHRcdFx0eDowLFxuXHRcdFx0eTowLFxuXHRcdFx0aGVpZ2h0OiBvcHRpb24uaGVpZ2h0LFxuXHRcdFx0d2lkdGg6IDIwLFxuXHRcdFx0c3Ryb2tlRW5hYmxlZDpmYWxzZSxcblx0XHRcdGZpbGw6J3llbGxvdycsXG5cdFx0XHRvcGFjaXR5OjAuNVxuXHRcdH0pO1xuXHRcdHZhciBhbmNob3I9bmV3IEtpbmV0aWMuQ2lyY2xlKHtcblx0XHRcdHg6MTAsXG5cdFx0XHR5OjUsXG5cdFx0XHRyYWRpdXM6IDMsXG5cdFx0XHRzdHJva2VXaWR0aDoxLFxuXHRcdFx0bmFtZTogJ2FuY2hvcicsXG5cdFx0XHRzdHJva2U6J2JsYWNrJyxcblx0XHRcdGZpbGw6J3doaXRlJyxcblx0XHR9KVxuXG5cdFx0dmFyIG5hbWVyZWN0PW5ldyBLaW5ldGljLlJlY3Qoe1xuXHRcdFx0eDoyMCxcblx0XHRcdHk6MCxcblx0XHRcdGhlaWdodDogb3B0aW9uLmhlaWdodCxcblx0XHRcdHdpZHRoOiA0MCxcblx0XHRcdHN0cm9rZUVuYWJsZWQ6ZmFsc2UsXG5cdFx0XHRmaWxsOidwaW5rJyxcblx0XHR9KTtcblx0XHRnci5hZGQoaW1ncmVjdCk7XG5cdFx0Z3IuYWRkKGFuY2hvcik7XG5cdFx0Z3IuYWRkKG5hbWVyZWN0KTtcblx0XHRyZXR1cm4gZ3I7XG5cdH1cblxuXHR2YXIgYmVmb3JlYmluZD1mdW5jdGlvbihmdW5jKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGNhbGN1bGF0aW5nKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYWxjdWxhdGluZz10cnVlO1xuXHRcdFx0ZnVuYy5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG5cdFx0XHRjYWxjdWxhdGluZz1mYWxzZTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREcmFnRGlyKHN0YWdlKXtcblx0XHRyZXR1cm4gKHN0YWdlLmdldFBvaW50ZXJQb3NpdGlvbigpLngtZGQuc3RhcnRQb2ludGVyUG9zLng+MCk/J3JpZ2h0JzonbGVmdCc7XG5cdH1cblxuXHR2YXIgQmFyPWZ1bmN0aW9uKG9wdGlvbnMpe1xuXHRcdHRoaXMubW9kZWw9b3B0aW9ucy5tb2RlbDtcblx0XHR0aGlzLnNldHRpbmdzID0gb3B0aW9ucy5zZXR0aW5ncztcblxuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTpjb21wbGV0ZScsIHRoaXMuX3VwZGF0ZUNvbXBsZXRlQmFyKTtcblx0XHRcblx0XHR2YXIgc2V0dGluZyA9IHRoaXMuc2V0dGluZyA9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYmFyJyk7XG5cdFx0Ly90aGlzLmJhcmlkID0gXy51bmlxdWVJZCgnYicpO1xuXHRcdHRoaXMuc3ViZ3JvdXBvcHRpb25zPXtcblx0XHRcdHNob3dPbkhvdmVyOiB0cnVlLFxuXHRcdFx0aGlkZU9uSG92ZXJPdXQ6dHJ1ZSxcblx0XHRcdGhhc1N1Ykdyb3VwOiBmYWxzZSxcblx0XHR9O1xuXHRcdFxuXHRcdHRoaXMuZGVwZW5kYW50cz1bXTtcblx0XHR0aGlzLmRlcGVuZGVuY2llcz1bXTtcblx0XHRcblx0XHQvKnZhciBvcHRpb249e1xuXHRcdFx0eCA6IHJlY3RvcHRpb25zLngsXG5cdFx0XHR5OiByZWN0b3B0aW9ucy55XG5cdFx0fVxuXHRcdHJlY3RvcHRpb25zLng9MDtcblx0XHRyZWN0b3B0aW9ucy55PTA7XG5cdFx0cmVjdG9wdGlvbnMubmFtZT0nbWFpbmJhcic7Ki9cblxuXHRcdC8vIGNvbG9yaW5nIHNlY3Rpb25cblx0XHR2YXIgcGFyZW50TW9kZWwgPSB0aGlzLm1vZGVsLmNvbGxlY3Rpb24uZ2V0KHRoaXMubW9kZWwuZ2V0KCdwYXJlbnRpZCcpKTtcblx0XHR0aGlzLnNldHRpbmcucmVjdG9wdGlvbi5maWxsID0gcGFyZW50TW9kZWwuZ2V0KCdsaWdodGNvbG9yJyk7XHRcdFxuXHRcdHRoaXMuZ3JvdXA9bmV3IEtpbmV0aWMuR3JvdXAodGhpcy5nZXRHcm91cFBhcmFtcygpKTtcblx0XHQvL3JlbW92ZSB0aGUgc3Ryb2tlRW5hYmxlZCBpZiBub3QgcHJvdmlkZWQgaW4gb3B0aW9uXG5cdFx0Ly9yZWN0b3B0aW9ucy5zdHJva2VFbmFibGVkPWZhbHNlO1xuXG5cdFx0dmFyIHJlY3QgPSB0aGlzLnJlY3QgID1uZXcgS2luZXRpYy5SZWN0KHRoaXMuZ2V0UmVjdHBhcmFtcygpKTtcblx0XHR0aGlzLmdyb3VwLmFkZChyZWN0KTtcblx0XHRcblx0XHRpZihzZXR0aW5nLnN1Ymdyb3VwKXtcblx0XHRcdHRoaXMuYWRkU3ViZ3JvdXAoKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYoc2V0dGluZy5kcmFnZ2FibGUpe1xuXHRcdFx0dGhpcy5tYWtlRHJhZ2dhYmxlKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKHNldHRpbmcucmVzaXphYmxlKXtcblx0XHRcdHRoaXMubWFrZVJlc2l6YWJsZSgpO1xuXHRcdH1cblxuXHRcdHZhciBsZWZ0eD10aGlzLmxlZnRIYW5kbGUuZ2V0WCgpO1xuXHRcdHZhciB3PXRoaXMucmlnaHRIYW5kbGUuZ2V0WCgpLWxlZnR4KzI7XG5cdFx0dmFyIHdpZHRoID0gKCAoIHcgKSAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCkgKTtcblx0XHR0aGlzLnNldHRpbmcucmVjdG9wdGlvbi5maWxsID0gcGFyZW50TW9kZWwuZ2V0KCdkYXJrY29sb3InKTtcblx0XHRvcHQgPSAgdGhpcy5nZXRSZWN0cGFyYW1zKCk7XG5cdFx0b3B0LnggPSAyO1xuXHRcdG9wdC53aWR0aCA9IHdpZHRoLTQ7XG5cdFx0aWYod2lkdGggPiAwKXtcblx0XHRcdHZhciBjb21wbGV0ZUJhcj0gdGhpcy5jb21wbGV0ZUJhciA9IG5ldyBLaW5ldGljLlJlY3Qob3B0KTtcblx0XHRcdHRoaXMuZ3JvdXAuYWRkKGNvbXBsZXRlQmFyKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly9hZGRFdmVudHNcblx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0XHQvL3RoaXMub24oJ3Jlc2l6ZSBtb3ZlJyx0aGlzLnJlbmRlckNvbm5lY3RvcnMsdGhpcyk7O1xuXHR9XG5cdEJhci5wcm90b3R5cGU9e1xuXHRcdF91cGRhdGVDb21wbGV0ZUJhciA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGxlZnR4PXRoaXMubGVmdEhhbmRsZS5nZXRYKCk7XG5cdFx0XHR2YXIgdyA9IHRoaXMucmlnaHRIYW5kbGUuZ2V0WCgpIC0gbGVmdHgrMjtcblx0XHRcdHZhciB3aWR0aCA9ICggKCB3ICkgKiAodGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDApICkgLSA0O1xuXG5cdFx0XHRpZih3aWR0aCA+IDApe1xuXHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLndpZHRoKHdpZHRoKTtcblx0XHRcdFx0dGhpcy5jb21wbGV0ZUJhci5nZXRMYXllcigpLmJhdGNoRHJhdygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly9yZXRyaWV2ZXMgb25seSB3aWR0aCxoZWlnaHQseCx5IHJlbGF0aXZlIHRvIHBvaW50IDAsMCBvbiBjYW52YXM7XG5cdFx0Z2V0WDE6IGZ1bmN0aW9uKGFic29sdXRlKXtcblx0XHRcdHZhciByZXR2YWw9MDtcblx0XHRcdGlmKGFic29sdXRlICYmIHRoaXMucGFyZW50KSByZXR2YWw9dGhpcy5wYXJlbnQuZ2V0WCgpO1xuXHRcdFx0cmV0dXJuIHJldHZhbCt0aGlzLmdyb3VwLmdldFgoKTtcblx0XHR9LFxuXHRcdGdldFgyOiBmdW5jdGlvbihhYnNvbHV0ZSl7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRYMShhYnNvbHV0ZSkrdGhpcy5nZXRXaWR0aCgpO1xuXHRcdH0sXG5cdFx0Z2V0WDpmdW5jdGlvbihhYnNvbHV0ZSl7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB0aGlzLmdldFgxKGFic29sdXRlKSxcblx0XHRcdFx0eTogdGhpcy5nZXRYMihhYnNvbHV0ZSlcblx0XHRcdH07XG5cdFx0fSxcblx0XHRnZXRZOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXAuZ2V0WSgpO1xuXHRcdH0sXG5cdFx0Z2V0SGVpZ2h0OiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMucmVjdC5nZXRIZWlnaHQoKTtcblx0XHR9LFxuXHRcdGdldFdpZHRoOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMucmVjdC5nZXRXaWR0aCgpO1xuXHRcdH0sXG5cdFx0XG5cdFx0c2V0WDE6ZnVuY3Rpb24odmFsdWUsb3B0aW9ucyl7XG5cdFx0XHQhb3B0aW9ucyAmJiAob3B0aW9ucz17fSlcblx0XHRcdHZhciBwcmV2eCx3aWR0aCxkeDtcblxuXHRcdFx0Ly9pZiB2YWx1ZSBpcyBpbiBhYnNvbHV0ZSBzZW5zZSB0aGVuIG1ha2UgaXQgcmVsYXRpdmUgdG8gcGFyZW50XG5cdFx0XHRpZihvcHRpb25zLmFic29sdXRlICYmIHRoaXMucGFyZW50KXtcblx0XHRcdFx0dmFsdWU9dmFsdWUtdGhpcy5wYXJlbnQuZ2V0WCh0cnVlKTtcblx0XHRcdH1cblx0XHRcdHByZXZ4PXRoaXMuZ2V0WDEoKTtcblx0XHRcdC8vZHggK3ZlIG1lYW5zIGJhciBtb3ZlZCBsZWZ0IFxuXHRcdFx0ZHg9cHJldngtdmFsdWU7XG5cdFx0XHRcblx0XHRcdHZhciBzaWxlbnQ9b3B0aW9ucy5zaWxlbnQgfHwgb3B0aW9ucy5vc2FtZTtcblx0XHRcdFxuXHRcdFx0dGhpcy5tb3ZlKC0xKmR4LHNpbGVudCk7XG5cdFx0XHQvL2lmIHgyIGhhcyB0byByZW1haW4gc2FtZVxuXHRcdFx0Ly8gRHJhdyBwZXJjZW50YWdlIGNvbXBsZXRlZFxuXHRcdFx0aWYob3B0aW9ucy5vc2FtZSl7XG5cdFx0XHRcdHRoaXMucmVjdC5zZXRXaWR0aChkeCt0aGlzLmdldFdpZHRoKCkpO1xuXHRcdFx0XHR2YXIgd2lkdGggPSggdGhpcy5nZXRXaWR0aCgpICogKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwKSApLTQ7XG5cdFx0XHRcdGlmKHdpZHRoID4gMClcblx0XHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLnNldFdpZHRoKHdpZHRoKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJIYW5kbGUoKTtcblx0XHRcdFx0aWYoIW9wdGlvbnMuc2lsZW50KXtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZWxlZnQnLHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplJyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcblx0XHR9LFxuXHRcdHNldFgyOmZ1bmN0aW9uKHZhbHVlLG9wdGlvbnMpe1xuXHRcdFx0dmFyIHByZXZ4LHdpZHRoLGR4O1xuXHRcdFx0Ly9pZiB2YWx1ZSBpcyBpbiBhYnNvbHV0ZSBzZW5zZSB0aGVuIG1ha2UgaXQgcmVsYXRpdmUgdG8gcGFyZW50XG5cdFx0XHRpZihvcHRpb25zLmFic29sdXRlICYmIHRoaXMucGFyZW50KXtcblx0XHRcdFx0dmFsdWU9dmFsdWUtdGhpcy5wYXJlbnQuZ2V0WCh0cnVlKTtcblx0XHRcdH1cblx0XHRcdHByZXZ4PXRoaXMuZ2V0WDIoKTtcblx0XHRcdC8vZHggLXZlIG1lYW5zIGJhciBtb3ZlZCByaWdodCBcblx0XHRcdGR4PXByZXZ4LXZhbHVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgc2lsZW50PW9wdGlvbnMuc2lsZW50IHx8IG9wdGlvbnMub3NhbWU7XG5cdFx0XHQvL3RoaXMuZ3JvdXAuc2V0WCh2YWx1ZSk7XG5cdFx0XHQvL2lmIHgyIGhhcyB0byByZW1haW4gc2FtZVxuXHRcdFx0aWYob3B0aW9ucy5vc2FtZSl7XG5cdFx0XHRcdHRoaXMucmVjdC5zZXRXaWR0aCh0aGlzLmdldFdpZHRoKCktZHgpO1xuXHRcdFx0XHR2YXIgd2lkdGggPSggdGhpcy5nZXRXaWR0aCgpICogKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwKSApLTQ7XG5cdFx0XHRcdGlmKHdpZHRoID4gMClcblx0XHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLnNldFdpZHRoKHdpZHRoKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJIYW5kbGUoKTtcblx0XHRcdFx0aWYoIW9wdGlvbnMuc2lsZW50KXtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZXJpZ2h0Jyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScsdGhpcyk7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyUGFyZW50KCdyZXNpemUnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0dGhpcy5tb3ZlKC0xKmR4LG9wdGlvbnMuc2lsZW50KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZW5hYmxlU3ViZ3JvdXAoKTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0c2V0WTpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHR0aGlzLmdyb3VwLnNldFkodmFsdWUpO1xuXHRcdH0sXG5cdFx0c2V0UGFyZW50OmZ1bmN0aW9uKHBhcmVudCl7XG5cdFx0XHR0aGlzLnBhcmVudD1wYXJlbnQ7XG5cblx0XHR9LFxuXHRcdHRyaWdnZXJQYXJlbnQ6ZnVuY3Rpb24oZXZlbnROYW1lKXtcblx0XHRcdGlmKHRoaXMucGFyZW50KXtcblx0XHRcdFx0dGhpcy5wYXJlbnQudHJpZ2dlcihldmVudE5hbWUsdGhpcyk7XG5cdFx0XHR9XHRcdFx0XG5cdFx0fSxcblx0XHRiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dGhpcy5ncm91cC5vbignY2xpY2snLF8uYmluZCh0aGlzLmhhbmRsZUNsaWNrZXZlbnRzLHRoaXMpKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5ncm91cC5vbignbW91c2VvdmVyJyxmdW5jdGlvbigpe1xuXHRcdFx0XHRpZighdGhhdC5zdWJncm91cG9wdGlvbnMuc2hvd09uSG92ZXIpIHJldHVybjtcblx0XHRcdFx0dGhhdC5zdWJncm91cC5zaG93KCk7XG5cdFx0XHRcdHRoaXMuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuZ3JvdXAub24oJ21vdXNlb3V0JyxmdW5jdGlvbigpe1xuXHRcdFx0XHRpZighdGhhdC5zdWJncm91cG9wdGlvbnMuaGlkZU9uSG92ZXJPdXQpIHJldHVybjtcblx0XHRcdFx0dGhhdC5zdWJncm91cC5oaWRlKCk7XG5cdFx0XHRcdHRoaXMuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0dGhpcy5vbigncmVzaXplIG1vdmUnLHRoaXMucmVuZGVyQ29ubmVjdG9ycyx0aGlzKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnY2hhbmdlJyx0aGlzLmhhbmRsZUNoYW5nZSk7XG5cdFx0XHR0aGlzLm9uKCdjaGFuZ2UnLCB0aGlzLmhhbmRsZUNoYW5nZSx0aGlzKTtcblxuXHRcdH0sXG5cdFx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5ncm91cC5kZXN0cm95KCk7XG5cdFx0XHR0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcblx0XHR9LFxuXHRcdGhhbmRsZUNoYW5nZTpmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygnaGFuZGxpbmcgY2hhbmdlJyk7XG5cdFx0XHRpZih0aGlzLnBhcmVudC5zeW5jaW5nKXtcblx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ3JldHVybmluZycpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmKG1vZGVsLmNoYW5nZWQuc3RhcnQgfHwgbW9kZWwuY2hhbmdlZC5lbmQpe1xuXHRcdFx0XHR2YXIgeD10aGlzLmNhbGN1bGF0ZVgobW9kZWwpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyh4KTtcblx0XHRcdFx0aWYobW9kZWwuY2hhbmdlZC5zdGFydCl7XG5cdFx0XHRcdFx0dGhpcy5zZXRYMSh4LngxLHtvc2FtZTp0cnVlLGFic29sdXRlOnRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRoaXMuc2V0WDIoeC54Mix7b3NhbWU6dHJ1ZSxhYnNvbHV0ZTp0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5wYXJlbnQuc3luYygpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc29sZS5sb2coJ2RyYXdpbmcnKTtcblx0XHRcdHRoaXMuZHJhdygpO1xuXHRcdFx0dGhpcy5tb2RlbC5zYXZlKCk7XG5cdFx0XHRcblx0XHR9LFxuXHRcdGhhbmRsZUNsaWNrZXZlbnRzOmZ1bmN0aW9uKGV2dCl7XG5cdFx0XHR2YXIgdGFyZ2V0LHRhcmdldE5hbWUsc3RhcnRCYXI7XG5cdFx0XHR0YXJnZXQ9ZXZ0LnRhcmdldDtcblx0XHRcdHRhcmdldE5hbWU9dGFyZ2V0LmdldE5hbWUoKTtcblx0XHRcdHdpbmRvdy5zdGFydEJhcjtcblx0XHRcdGlmKHRhcmdldE5hbWUhPT0nbWFpbmJhcicpe1xuXHRcdFx0XHRCYXIuZGlzYWJsZUNvbm5lY3RvcigpO1xuXHRcdFx0XHRpZih0YXJnZXROYW1lPT0nYW5jaG9yJyl7XG5cdFx0XHRcdFx0dGFyZ2V0LnN0cm9rZSgncmVkJyk7XG5cdFx0XHRcdFx0QmFyLmVuYWJsZUNvbm5lY3Rvcih0aGlzKTtcblx0XHRcdFx0XHR2YXIgZGVwdCA9IHRoaXMubW9kZWwuZ2V0KCdkZXBlbmRlbmN5Jyk7XG5cdFx0XHRcdFx0aWYoZGVwdCAhPSBcIlwiKXtcblx0XHRcdFx0XHRcdHdpbmRvdy5jdXJyZW50RHB0LnB1c2godGhpcy5tb2RlbC5nZXQoJ2RlcGVuZGVuY3knKSk7XHRcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cod2luZG93LmN1cnJlbnREcHQpO1xuXHRcdFx0XHRcdHdpbmRvdy5zdGFydEJhciA9IHRoaXMubW9kZWw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGlmKChzdGFydEJhcj1CYXIuaXNDb25uZWN0b3JFbmFibGVkKCkpKXtcblx0XHRcdFx0XHRCYXIuY3JlYXRlUmVsYXRpb24oc3RhcnRCYXIsdGhpcyk7XG5cdFx0XHRcdFx0d2luZG93LmN1cnJlbnREcHQucHVzaCh0aGlzLm1vZGVsLmdldCgnaWQnKSk7XG5cdFx0XHRcdFx0d2luZG93LnN0YXJ0QmFyLnNldCgnZGVwZW5kZW5jeScsIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5jdXJyZW50RHB0KSk7XG5cdFx0XHRcdFx0d2luZG93LnN0YXJ0QmFyLnNhdmUoKTtcblx0XHRcdFx0XHRCYXIuZGlzYWJsZUNvbm5lY3RvcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRldnQuY2FuY2VsQnViYmxlPXRydWU7XG5cdFx0fSxcblx0XHRtYWtlUmVzaXphYmxlOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHRoaXMucmVzaXphYmxlPXRydWU7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGU9Y3JlYXRlSGFuZGxlKHtcblx0XHRcdFx0eDogMCxcblx0XHRcdFx0eTogMCxcblx0XHRcdFx0aGVpZ2h0OiB0aGlzLmdldEhlaWdodCgpLFxuXHRcdFx0XHRkcmFnQm91bmRGdW5jOiB0aGlzLnNldHRpbmcucmVzaXplQm91bmRGdW5jLFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlPWNyZWF0ZUhhbmRsZSh7XG5cdFx0XHRcdHg6IHRoaXMuZ2V0V2lkdGgoKS0yLFxuXHRcdFx0XHR5OiAwLFxuXHRcdFx0XHRoZWlnaHQ6IHRoaXMuZ2V0SGVpZ2h0KCksXG5cdFx0XHRcdGRyYWdCb3VuZEZ1bmM6IHRoaXMuc2V0dGluZy5yZXNpemVCb3VuZEZ1bmMsXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LmRpc2FibGVTdWJncm91cCgpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZGlzYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdkcmFnZW5kJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcdHRoYXQucGFyZW50LnN5bmMoKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignZHJhZ2VuZCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5lbmFibGVTdWJncm91cCgpO1xuXHRcdFx0XHR0aGF0LnBhcmVudC5zeW5jKCk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdkcmFnbW92ZScsYmVmb3JlYmluZChmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LnJlbmRlcigpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ3Jlc2l6ZWxlZnQnLHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ3Jlc2l6ZScsdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlclBhcmVudCgncmVzaXplJyk7XG5cdFx0XHR9KSk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLm9uKCdkcmFnbW92ZScsYmVmb3JlYmluZChmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LnJlbmRlcigpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ3Jlc2l6ZXJpZ2h0Jyx0aGF0KTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdyZXNpemUnLHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0fSkpO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdtb3VzZW92ZXInLHRoaXMuY2hhbmdlUmVzaXplQ3Vyc29yKTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ21vdXNlb3ZlcicsdGhpcy5jaGFuZ2VSZXNpemVDdXJzb3IpO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdtb3VzZW91dCcsdGhpcy5jaGFuZ2VEZWZhdWx0Q3Vyc29yKTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ21vdXNlb3V0Jyx0aGlzLmNoYW5nZURlZmF1bHRDdXJzb3IpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmdyb3VwLmFkZCh0aGlzLmxlZnRIYW5kbGUpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQodGhpcy5yaWdodEhhbmRsZSk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdH0sXG5cdFx0YWRkU3ViZ3JvdXA6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuaGFzU3ViR3JvdXA9dHJ1ZTtcblx0XHRcdHZhciBzdWJncm91cCx0aGF0PXRoaXM7XG5cdFx0XHRzdWJncm91cD10aGlzLnN1Ymdyb3VwPWNyZWF0ZVN1Ykdyb3VwKHtoZWlnaHQ6dGhpcy5nZXRIZWlnaHQoKX0pO1xuXHRcdFx0c3ViZ3JvdXAuaGlkZSgpO1xuXHRcdFx0c3ViZ3JvdXAuc2V0WCh0aGlzLmdldFdpZHRoKCkpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQoc3ViZ3JvdXApO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdC8vdGhpcy5iaW5kQW5jaG9yKCk7XG5cdFx0fSxcblx0XHRlbmFibGVTdWJncm91cDpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5zdWJncm91cG9wdGlvbnMuc2hvd09uSG92ZXI9dHJ1ZTtcblx0XHRcdHRoaXMuc3ViZ3JvdXAuc2V0WCh0aGlzLmdldFdpZHRoKCkpO1xuXHRcdH0sXG5cdFx0ZGlzYWJsZVN1Ymdyb3VwOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnN1Ymdyb3Vwb3B0aW9ucy5zaG93T25Ib3Zlcj10cnVlO1xuXHRcdFx0dGhpcy5zdWJncm91cC5oaWRlKCk7XG5cdFx0fSxcblx0XHRcblx0XHRiaW5kQW5jaG9yOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHZhciBhbmNob3I9dGhpcy5zdWJncm91cC5maW5kKCcuYW5jaG9yJyk7XG5cdFx0XHRhbmNob3Iub24oJ2NsaWNrJyxmdW5jdGlvbihldnQpe1xuXHRcdFx0XHRhbmNob3Iuc3Ryb2tlKCdyZWQnKTtcblx0XHRcdFx0dGhhdC5zdWJncm91cG9wdGlvbnMuaGlkZU9uSG92ZXJPdXQ9ZmFsc2U7XG5cdFx0XHRcdEtpbmV0aWMuQ29ubmVjdC5zdGFydD10aGF0O1xuXHRcdFx0XHR0aGlzLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0XHRldnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcblx0XHRcdH0pO1xuXG5cdFx0fSxcblx0XHRcblx0XHRtYWtlRHJhZ2dhYmxlOiBmdW5jdGlvbihvcHRpb24pe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHRoaXMuZ3JvdXAuZHJhZ2dhYmxlKHRydWUpO1xuXHRcdFx0aWYodGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpe1xuXHRcdFx0XHR0aGlzLmdyb3VwLmRyYWdCb3VuZEZ1bmModGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cC5vbignZHJhZ21vdmUnLGJlZm9yZWJpbmQoZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdtb3ZlJytnZXREcmFnRGlyKHRoaXMuZ2V0U3RhZ2UoKSksdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcignbW92ZScpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXJQYXJlbnQoJ21vdmUnKTtcblx0XHRcdH0pKTtcblx0XHRcdHRoaXMuZ3JvdXAub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQucGFyZW50LnN5bmMoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Y2hhbmdlUmVzaXplQ3Vyc29yOmZ1bmN0aW9uKHR5cGUpe1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZXctcmVzaXplJztcblx0XHR9LFxuXHRcdGNoYW5nZURlZmF1bHRDdXJzb3I6ZnVuY3Rpb24odHlwZSl7XG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0Jztcblx0XHR9LFxuXHRcdC8vcmVuZGVycyB0aGUgaGFuZGxlIGJ5IGl0cyByZWN0XG5cdFx0cmVuZGVySGFuZGxlOmZ1bmN0aW9uKCl7XG5cdFx0XHRpZighdGhpcy5yZXNpemFibGUpIHJldHVybiBmYWxzZTtcblx0XHRcdHZhciB4PXRoaXMucmVjdC5nZXRYKCk7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUuc2V0WCh4KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUuc2V0WCh4K3RoaXMucmVjdC5nZXRXaWR0aCgpLTIpO1xuXHRcdH0sXG5cdFx0XG5cdFx0XG5cdFx0Ly9yZW5kZXJzIHRoZSBiYXIgYnkgdGhlIGhhbmRsZXNcblx0XHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgbGVmdHg9dGhpcy5sZWZ0SGFuZGxlLmdldFgoKTtcblx0XHRcdHZhciB3aWR0aD10aGlzLnJpZ2h0SGFuZGxlLmdldFgoKS1sZWZ0eCsyO1xuXHRcdFx0dGhpcy5ncm91cC5zZXRYKHRoaXMuZ3JvdXAuZ2V0WCgpK2xlZnR4KTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5zZXRYKDApO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5zZXRYKHdpZHRoLTIpO1xuXHRcdFx0dGhpcy5yZWN0LnNldFdpZHRoKHdpZHRoKTtcblx0XHRcdHZhciB3aWR0aDIgPSB0aGlzLnJlY3QuZ2V0V2lkdGgoKSAgKiAodGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDApO1xuXHRcdFx0aWYod2lkdGgyKVxuXHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLnNldFdpZHRoKHdpZHRoMiAtIDQpO1xuXHRcdH0sXG5cdFx0Lypcblx0XHRcdGRlcGVuZGVudE9iajogeydlbGVtJzpkZXBlbmRhbnQsJ2Nvbm5lY3Rvcic6Y29ubmVjdG9yfVxuXHRcdFx0Ki9cblx0XHRcdGFkZERlcGVuZGFudDpmdW5jdGlvbihkZXBlbmRhbnRPYmope1xuXHRcdFx0XHR0aGlzLmxpc3RlblRvKGRlcGVuZGFudE9iai5lbGVtLCdtb3ZlbGVmdCByZXNpemVsZWZ0Jyx0aGlzLmFkanVzdGxlZnQpXG5cdFx0XHRcdHRoaXMuZGVwZW5kYW50cy5wdXNoKGRlcGVuZGFudE9iaik7XG5cdFx0XHR9LFxuXHRcdC8vcmVuZGVycyB0aGUgYmFyIGJ5IGl0cyBtb2RlbCBcblx0XHRyZW5kZXJCYXI6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciB4ID0gdGhpcy5jYWxjdWxhdGVYKCk7XG5cdFx0XHR0aGlzLnNldFgxKHgueDEse2Fic29sdXRlOnRydWUsIHNpbGVudDp0cnVlfSk7XG5cdFx0XHR0aGlzLnNldFgyKHgueDIse2Fic29sdXRlOnRydWUsIHNpbGVudDp0cnVlLCBvc2FtZTp0cnVlfSk7XG5cdFx0XHR0aGlzLnJlbmRlckNvbm5lY3RvcnMoKTtcblx0XHR9LFxuXHRcdFxuXHRcdGFkZERlcGVuZGFuY3k6IGZ1bmN0aW9uKGRlcGVuZGVuY3lPYmope1xuXHRcdFx0dGhpcy5saXN0ZW5UbyhkZXBlbmRlbmN5T2JqLmVsZW0sJ21vdmVyaWdodCByZXNpemVyaWdodCcsdGhpcy5hZGp1c3RyaWdodCk7XG5cdFx0XHR0aGlzLmRlcGVuZGVuY2llcy5wdXNoKGRlcGVuZGVuY3lPYmopO1xuXHRcdFx0dGhpcy5yZW5kZXJDb25uZWN0b3IoZGVwZW5kZW5jeU9iaiwyKTtcblx0XHR9LFxuXHRcdC8vY2hlY2tzIGlmIHRoZSBiYXIgbmVlZHMgbW92ZW1lbnQgaW4gbGVmdCBzaWRlIG9uIGxlZnQgbW92ZW1lbnQgb2YgZGVwZW5kZW50IGFuZCBtYWtlcyBhZGp1c3RtZW50XG5cdFx0YWRqdXN0bGVmdDpmdW5jdGlvbihkZXBlbmRhbnQpe1xuXHRcdFx0aWYoIXRoaXMuaXNEZXBlbmRhbnQoZGVwZW5kYW50KSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0dmFyIGR4PXRoaXMuZ2V0WDEoKSt0aGlzLmdldFdpZHRoKCktZGVwZW5kYW50LmdldFgxKCk7XG5cdFx0XHQvL2FuIG92ZXJsYXAgb2NjdXJzIGluIHRoaXMgY2FzZVxuXHRcdFx0aWYoZHg+MCl7XG5cdFx0XHRcdC8vZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgaW4gbW92ZSBmdW5jXG5cdFx0XHRcdHRoaXMubW92ZSgtMSpkeCk7XG5cdFx0XHRcdC8vdGhpcy50cmlnZ2VyKCdtb3ZlbGVmdCcsdGhpcyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRhZGp1c3RyaWdodDpmdW5jdGlvbihkZXBlbmRlbmN5KXtcblx0XHRcdGlmKCF0aGlzLmlzRGVwZW5kZW5jeShkZXBlbmRlbmN5KSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0dmFyIGR4PWRlcGVuZGVuY3kuZ2V0WDEoKStkZXBlbmRlbmN5LmdldFdpZHRoKCktdGhpcy5nZXRYMSgpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkeCk7XG5cdFx0XHRpZihkeD4wKXtcblx0XHRcdFx0Ly9ldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBpbiBtb3ZlIGZ1bmNcblx0XHRcdFx0dGhpcy5tb3ZlKGR4KTtcblx0XHRcdFx0Ly90aGlzLnRyaWdnZXIoJ21vdmVyaWdodCcsdGhpcyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpc0RlcGVuZGFudDpmdW5jdGlvbihkZXBlbmRhbnQpe1xuXHRcdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmRlcGVuZGFudHMubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGlmKHRoaXMuZGVwZW5kYW50c1tpXVsnZWxlbSddWydiYXJpZCddPT09ZGVwZW5kYW50WydiYXJpZCddKXtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblx0XHQvL0B0eXBlIERlcGVuZGFudDoxLCBEZXBlbmRlbmN5OjJcblx0XHRyZW5kZXJDb25uZWN0b3I6ZnVuY3Rpb24ob2JqLHR5cGUpe1xuXHRcdFx0aWYodHlwZT09MSl7XG5cdFx0XHRcdEJhci5yZW5kZXJDb25uZWN0b3IodGhpcyxvYmouZWxlbSxvYmouY29ubmVjdG9yKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdEJhci5yZW5kZXJDb25uZWN0b3Iob2JqLmVsZW0sdGhpcyxvYmouY29ubmVjdG9yKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdC8vcmVuZGVycyBhbGwgY29ubmVjdG9yc1xuXHRcdHJlbmRlckNvbm5lY3RvcnM6ZnVuY3Rpb24oKXtcblx0XHRcdGZvcih2YXIgaT0wLGlMZW49dGhpcy5kZXBlbmRhbnRzLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0dGhpcy5yZW5kZXJDb25uZWN0b3IodGhpcy5kZXBlbmRhbnRzW2ldLDEpO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKHZhciBpPTAsaUxlbj10aGlzLmRlcGVuZGVuY2llcy5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdHRoaXMucmVuZGVyQ29ubmVjdG9yKHRoaXMuZGVwZW5kZW5jaWVzW2ldLDIpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aXNEZXBlbmRlbmN5OiBmdW5jdGlvbihkZXBlbmRlbmN5KXtcblx0XHRcdFxuXHRcdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmRlcGVuZGVuY2llcy5sZW5ndGg7aSsrKXtcblx0XHRcdFx0aWYodGhpcy5kZXBlbmRlbmNpZXNbaV1bJ2VsZW0nXVsnYmFyaWQnXT09PWRlcGVuZGVuY3lbJ2JhcmlkJ10pe1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRtb3ZlOiBmdW5jdGlvbihkeCxzaWxlbnQpe1xuXHRcdFx0aWYoZHg9PT0wKSByZXR1cm47XG5cdFx0XHR0aGlzLmdyb3VwLm1vdmUoe3g6ZHh9KTtcblx0XHRcdGlmKCFzaWxlbnQpe1xuXHRcdFx0XHR0aGlzLnRyaWdnZXIoJ21vdmUnLHRoaXMpO1xuXHRcdFx0XHRpZihkeD4wKXtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ21vdmVyaWdodCcsdGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXIoJ21vdmVsZWZ0Jyx0aGlzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnRyaWdnZXJQYXJlbnQoJ21vdmUnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNhbGN1bGF0ZVg6ZnVuY3Rpb24obW9kZWwpe1xuXHRcdFx0IW1vZGVsICYmIChtb2RlbD10aGlzLm1vZGVsKTtcblx0XHRcdHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4MTooRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbixtb2RlbC5nZXQoJ3N0YXJ0JykpKSpkYXlzV2lkdGgsXG5cdFx0XHRcdHgyOkRhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sbW9kZWwuZ2V0KCdlbmQnKSkqZGF5c1dpZHRoLFxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2FsY3VsYXRlRGF0ZXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBhdHRycz1hcHAuc2V0dGluZy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XG5cdFx0XHR2YXIgZGF5czE9TWF0aC5yb3VuZCh0aGlzLmdldFgxKHRydWUpL2RheXNXaWR0aCksZGF5czI9TWF0aC5yb3VuZCh0aGlzLmdldFgyKHRydWUpL2RheXNXaWR0aCk7XG5cdFx0XHRcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHN0YXJ0OiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpLFxuXHRcdFx0XHRlbmQ6Ym91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyLTEpXG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9LFxuXHRcdGdldFJlY3RwYXJhbXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBzZXR0aW5nPXRoaXMuc2V0dGluZztcblx0XHRcdHZhciB4cyAgPXRoaXMuY2FsY3VsYXRlWCh0aGlzLm1vZGVsKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpKTtcblx0XHRcdHJldHVybiBfLmV4dGVuZCh7XG5cdFx0XHRcdHg6MCxcblx0XHRcdFx0d2lkdGg6eHMueDIteHMueDEsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHRcdG5hbWU6J21haW5iYXInLFxuXHRcdFx0XHRoZWlnaHQ6c2V0dGluZy5iYXJoZWlnaHRcblx0XHRcdH0sc2V0dGluZy5yZWN0b3B0aW9uKTtcblx0XHR9LFxuXHRcdGdldEdyb3VwUGFyYW1zOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgeHM9dGhpcy5jYWxjdWxhdGVYKHRoaXMubW9kZWwpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeHMueDEsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0b2dnbGU6ZnVuY3Rpb24oc2hvdyl7XG5cdFx0XHR2YXIgbWV0aG9kPXNob3c/J3Nob3cnOidoaWRlJztcblx0XHRcdHRoaXMuZ3JvdXBbbWV0aG9kXSgpO1xuXHRcdFx0Zm9yKHZhciBpPTAsaUxlbj10aGlzLmRlcGVuZGVuY2llcy5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdHRoaXMuZGVwZW5kZW5jaWVzW2ldLmNvbm5lY3RvclttZXRob2RdKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRkcmF3OmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXG5cdFx0fSxcblx0XHRzeW5jOmZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZygnc3luY2luZyAnK3RoaXMubW9kZWwuY2lkKTtcblx0XHRcdHZhciBkYXRlcz10aGlzLmNhbGN1bGF0ZURhdGVzKCk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCh7c3RhcnQ6ZGF0ZXMuc3RhcnQsZW5kOmRhdGVzLmVuZH0pO1xuXHRcdFx0Y29uc29sZS5sb2coJ3N5bmNpbmcgJyt0aGlzLm1vZGVsLmNpZCsnIGZpbmlzaGVkJyk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmUoKTtcblx0XHR9XG5cdFx0XG5cblx0fVxuXHQvL0l0IGNyZWF0ZXMgYSByZWxhdGlvbiBiZXR3ZWVuIGRlcGVuZGFudCBhbmQgZGVwZW5kZW5jeVxuXHQvL0RlcGVuZGFudCBpcyB0aGUgdGFzayB3aGljaCBuZWVkcyB0byBiZSBkb25lIGFmdGVyIGRlcGVuZGVuY3lcblx0Ly9TdXBwb3NlIHRhc2sgQiByZXF1aXJlcyB0YXNrIEEgdG8gYmUgZG9uZSBiZWZvcmVoYW5kLiBTbywgQSBpcyBkZXBlbmRhbmN5L3JlcXVpcmVtZW50IGZvciBCIHdoZXJlYXMgQiBpcyBkZXBlbmRhbnQgb24gQS5cblx0QmFyLmNyZWF0ZVJlbGF0aW9uPWZ1bmN0aW9uKGRlcGVuZGVuY3ksZGVwZW5kYW50KXtcblx0XHR2YXIgY29ubmVjdG9yLHBhcmVudDtcblx0XHRwYXJlbnQ9ZGVwZW5kYW50Lmdyb3VwLmdldFBhcmVudCgpO1xuXHRcdGNvbm5lY3Rvcj10aGlzLmNyZWF0ZUNvbm5lY3RvcigpO1xuXHRcdGRlcGVuZGVuY3kuYWRkRGVwZW5kYW50KHtcblx0XHRcdCdlbGVtJzpkZXBlbmRhbnQsXG5cdFx0XHQnY29ubmVjdG9yJzogY29ubmVjdG9yLFxuXHRcdH0pO1xuXHRcdGRlcGVuZGFudC5hZGREZXBlbmRhbmN5KHtcblx0XHRcdCdlbGVtJzpkZXBlbmRlbmN5LFxuXHRcdFx0J2Nvbm5lY3Rvcic6IGNvbm5lY3Rvcixcblx0XHR9KTtcblx0XHRcblx0XHRwYXJlbnQuYWRkKGNvbm5lY3Rvcik7XG5cdFx0XG5cdH1cblx0XG5cdEJhci5jcmVhdGVDb25uZWN0b3I9ZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gbmV3IEtpbmV0aWMuTGluZSh7XG5cdFx0XHRzdHJva2VXaWR0aDogMSxcblx0XHRcdHN0cm9rZTogJ2JsYWNrJyxcblx0XHRcdHBvaW50czogWzAsIDBdXG5cdFx0fSk7XG5cdFx0XG5cdH0sXG5cdEJhci5lbmFibGVDb25uZWN0b3I9ZnVuY3Rpb24oc3RhcnQpe1xuXHRcdEtpbmV0aWMuQ29ubmVjdC5zdGFydD1zdGFydDtcblx0XHRzdGFydC5zdWJncm91cG9wdGlvbnMuaGlkZU9uSG92ZXJPdXQ9ZmFsc2U7XG5cdH1cblx0QmFyLmRpc2FibGVDb25uZWN0b3I9ZnVuY3Rpb24oKXtcblx0XHRpZighS2luZXRpYy5Db25uZWN0LnN0YXJ0KSByZXR1cm47XG5cdFx0dmFyIHN0YXJ0PUtpbmV0aWMuQ29ubmVjdC5zdGFydDtcblx0XHRzdGFydC5zdWJncm91cG9wdGlvbnMuaGlkZU9uSG92ZXJPdXQ9dHJ1ZTtcblx0XHRLaW5ldGljLkNvbm5lY3Quc3RhcnQ9bnVsbDtcblx0fVxuXHRcblx0QmFyLmlzQ29ubmVjdG9yRW5hYmxlZD1mdW5jdGlvbigpe1xuXHRcdHJldHVybiBLaW5ldGljLkNvbm5lY3Quc3RhcnQ7XG5cdH1cblx0QmFyLnJlbmRlckNvbm5lY3Rvcj1mdW5jdGlvbihzdGFydEJhcixlbmRCYXIsY29ubmVjdG9yKXtcblx0XHRcblx0XHR2YXIgcG9pbnQxLHBvaW50MixoYWxmaGVpZ2h0LHBvaW50cyxjb2xvcj0nIzAwMCc7XG5cdFx0aGFsZmhlaWdodD1wYXJzZUludChzdGFydEJhci5nZXRIZWlnaHQoKS8yKTtcblx0XHRwb2ludDE9e1xuXHRcdFx0eDpzdGFydEJhci5nZXRYMigpLFxuXHRcdFx0eTpzdGFydEJhci5nZXRZKCkraGFsZmhlaWdodCxcblx0XHR9XG5cdFx0cG9pbnQyPXtcblx0XHRcdHg6ZW5kQmFyLmdldFgxKCksXG5cdFx0XHR5OmVuZEJhci5nZXRZKCkraGFsZmhlaWdodCxcblx0XHR9XG5cdFx0dmFyIG9mZnNldD01LGFycm93Zmxhbms9NCxhcnJvd2hlaWdodD01LGJvdHRvbW9mZnNldD00O1xuXHRcdFxuXG5cdFx0aWYocG9pbnQyLngtcG9pbnQxLng8MCl7XG5cdFx0XHRpZihwb2ludDIueTxwb2ludDEueSl7XG5cdFx0XHRcdGhhbGZoZWlnaHQ9IC0xKmhhbGZoZWlnaHQ7XG5cdFx0XHRcdGJvdHRvbW9mZnNldD0tMSpib3R0b21vZmZzZXQ7XG5cdFx0XHRcdC8vYXJyb3doZWlnaHQ9LTEqYXJyb3doZWlnaHQ7XG5cdFx0XHR9XG5cdFx0XHRwb2ludHM9W1xuXHRcdFx0cG9pbnQxLngscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQxLnkraGFsZmhlaWdodCtib3R0b21vZmZzZXQsXG5cdFx0XHRwb2ludDIueC1vZmZzZXQscG9pbnQxLnkraGFsZmhlaWdodCtib3R0b21vZmZzZXQsXG5cdFx0XHRwb2ludDIueC1vZmZzZXQscG9pbnQyLnksXG5cdFx0XHRwb2ludDIueCxwb2ludDIueSxcblx0XHRcdHBvaW50Mi54LWFycm93aGVpZ2h0LHBvaW50Mi55LWFycm93ZmxhbmssXG5cdFx0XHRwb2ludDIueC1hcnJvd2hlaWdodCxwb2ludDIueSthcnJvd2ZsYW5rLFxuXHRcdFx0cG9pbnQyLngscG9pbnQyLnlcblx0XHRcdF07XG5cdFx0XHRjb2xvcj0ncmVkJztcblx0XHRcdFxuXHRcdH1cblx0XHRlbHNlIGlmKHBvaW50Mi54LXBvaW50MS54PDUpe1xuXHRcdFx0aWYocG9pbnQyLnk8cG9pbnQxLnkpe1xuXHRcdFx0XHRoYWxmaGVpZ2h0PSAtMSpoYWxmaGVpZ2h0O1xuXHRcdFx0XHRib3R0b21vZmZzZXQ9LTEqYm90dG9tb2Zmc2V0O1xuXHRcdFx0XHRhcnJvd2hlaWdodD0tMSphcnJvd2hlaWdodDtcblx0XHRcdH1cblx0XHRcdHBvaW50cz1bXG5cdFx0XHRwb2ludDEueCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDIueS1oYWxmaGVpZ2h0LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LWFycm93ZmxhbmsscG9pbnQyLnktaGFsZmhlaWdodC1hcnJvd2hlaWdodCxcblx0XHRcdHBvaW50MS54K29mZnNldCthcnJvd2ZsYW5rLHBvaW50Mi55LWhhbGZoZWlnaHQtYXJyb3doZWlnaHQsXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQyLnktaGFsZmhlaWdodFxuXHRcdFx0XTtcblxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0cG9pbnRzPVtcblx0XHRcdHBvaW50MS54LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50Mi55LFxuXHRcdFx0cG9pbnQyLngscG9pbnQyLnksXG5cdFx0XHRwb2ludDIueC1hcnJvd2hlaWdodCxwb2ludDIueS1hcnJvd2ZsYW5rLFxuXHRcdFx0cG9pbnQyLngtYXJyb3doZWlnaHQscG9pbnQyLnkrYXJyb3dmbGFuayxcblx0XHRcdHBvaW50Mi54LHBvaW50Mi55XG5cdFx0XHRdO1xuXHRcdH1cblx0XHRjb25uZWN0b3Iuc2V0QXR0cignc3Ryb2tlJyxjb2xvcik7XG5cdFx0Y29ubmVjdG9yLnNldFBvaW50cyhwb2ludHMpO1xuXHR9XG5cdFxuXHRLaW5ldGljLkNvbm5lY3Q9e1xuXHRcdHN0YXJ0OmZhbHNlLFxuXHRcdGVuZDpmYWxzZVxuXHR9XG5cdFxuXHRcblx0XG5cdF8uZXh0ZW5kKEJhci5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cyk7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBCYXI7IiwidmFyIEJhciA9IHJlcXVpcmUoJy4vQmFyJyk7XG5cbnZhciBCYXJHcm91cCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuXHR0aGlzLmNpZCA9IF8udW5pcXVlSWQoJ2JnJyk7XG5cdHRoaXMuc2V0dGluZ3MgPSBvcHRpb25zLnNldHRpbmdzO1xuXHR0aGlzLm1vZGVsID0gb3B0aW9ucy5tb2RlbDtcblx0dmFyIHNldHRpbmcgPSB0aGlzLnNldHRpbmcgPSBvcHRpb25zLnNldHRpbmdzLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cdHRoaXMuYXR0ciA9IHtcblx0XHRoZWlnaHQ6IDBcblx0fTtcblx0dGhpcy5zeW5jaW5nPWZhbHNlO1xuXHR0aGlzLmNoaWxkcmVuPVtdO1xuXG5cdHRoaXMuZ3JvdXAgPSBuZXcgS2luZXRpYy5Hcm91cCh0aGlzLmdldEdyb3VwUGFyYW1zKCkpO1xuXHR0aGlzLnRvcGJhciA9IG5ldyBLaW5ldGljLlJlY3QodGhpcy5nZXRSZWN0cGFyYW1zKCkpO1xuXHR0aGlzLmdyb3VwLmFkZCh0aGlzLnRvcGJhcik7XG5cblx0dGhpcy5hdHRyLmhlaWdodCArPSAgc2V0dGluZy5yb3dIZWlnaHQ7XG5cblx0aWYoc2V0dGluZy5kcmFnZ2FibGUpe1xuXHRcdHRoaXMubWFrZURyYWdnYWJsZSgpO1xuXHR9XG5cdGlmKHNldHRpbmcucmVzaXphYmxlKXtcblx0XHR0aGlzLnRvcGJhci5tYWtlUmVzaXphYmxlKCk7XG5cdH1cblx0dGhpcy5pbml0aWFsaXplKCk7XG59O1xuXG5CYXJHcm91cC5wcm90b3R5cGU9e1xuXHRcdGluaXRpYWxpemU6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMubW9kZWwuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHR0aGlzLmFkZENoaWxkKG5ldyBCYXIoe1xuXHRcdFx0XHRcdG1vZGVsOmNoaWxkLFxuXHRcdFx0XHRcdHNldHRpbmdzIDogdGhpcy5zZXR0aW5nc1xuXHRcdFx0XHR9KSk7XG5cdFx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwuY2hpbGRyZW4sICdhZGQnLCBmdW5jdGlvbihjaGlsZCkge1xuXHRcdFx0XHR0aGlzLmFkZENoaWxkKG5ldyBCYXIoe1xuXHRcdFx0XHRcdG1vZGVsOmNoaWxkXG5cdFx0XHRcdH0pKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJTb3J0ZWRDaGlsZHJlbih0cnVlKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHZhciB2aWV3Rm9yRGVsZXRlID0gXy5maW5kKHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5tb2RlbCA9PT0gY2hpbGRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRoaXMuY2hpbGRyZW4gPSBfLndpdGhvdXQodGhpcy5jaGlsZHJlbiwgdmlld0ZvckRlbGV0ZSk7XG5cdFx0XHRcdHZpZXdGb3JEZWxldGUuZGVzdHJveSgpO1xuXHRcdFx0XHR0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKHRydWUpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdHRoaXMucmVuZGVyU29ydGVkQ2hpbGRyZW4odHJ1ZSk7XG5cdFx0XHR0aGlzLnJlbmRlckRlcGVuZGVuY3koKTtcblx0XHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHRcdH0sXG5cdFx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5ncm91cC5kZXN0cm95KCk7XG5cdFx0fSxcblx0XHRyZW5kZXJTb3J0ZWRDaGlsZHJlbjpmdW5jdGlvbihub2RyYXcpe1xuXHRcdFx0IW5vZHJhdyAmJiAobm9kcmF3PWZhbHNlKTtcblx0XHRcdHZhciBzb3J0ZWQ9Xy5zb3J0QnkodGhpcy5jaGlsZHJlbiwgZnVuY3Rpb24oaXRlbWJhcil7XG5cdFx0XHRcdHJldHVybiBpdGVtYmFyLm1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuYXR0ci5oZWlnaHQ9dGhpcy5zZXR0aW5nLnJvd0hlaWdodDtcblx0XHRcdGZvcih2YXIgaT0wO2k8c29ydGVkLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRzb3J0ZWRbaV0uc2V0WSh0aGlzLmdldEhlaWdodCgpK3RoaXMuc2V0dGluZy5nYXApO1xuXHRcdFx0XHRzb3J0ZWRbaV0ucmVuZGVyQ29ubmVjdG9ycygpO1xuXHRcdFx0XHR0aGlzLmF0dHIuaGVpZ2h0ICs9IHRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHR9XG5cdFx0XHRpZighbm9kcmF3KVxuXHRcdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRmaW5kQnlJZDpmdW5jdGlvbihpZCl7XG5cdFx0XHR2YXIgY2hpbGRyZW49dGhpcy5jaGlsZHJlbjtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGlmKGNoaWxkcmVuW2ldLm1vZGVsLmdldCgnaWQnKT09PWlkKVxuXHRcdFx0XHRcdHJldHVybiBjaGlsZHJlbltpXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cdFx0cmVuZGVyRGVwZW5kZW5jeTpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGNoaWxkcmVuPXRoaXMuY2hpbGRyZW4sZGVwZW5kZW5jaWVzPVtdLGJhcjtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGRlcGVuZGVuY2llcz1jaGlsZHJlbltpXS5tb2RlbC5nZXQoJ2RlcGVuZGVuY3knKTtcblx0XHRcdFx0Zm9yKHZhciBqPTA7ajxkZXBlbmRlbmNpZXMubGVuZ3RoO2orKyl7XG5cdFx0XHRcdFx0YmFyPXRoaXMuZmluZEJ5SWQoZGVwZW5kZW5jaWVzW2pdWydpZCddKTtcblx0XHRcdFx0XHRpZihiYXIpe1xuXHRcdFx0XHRcdFx0QmFyLmNyZWF0ZVJlbGF0aW9uKGJhcixjaGlsZHJlbltpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRtYWtlRHJhZ2dhYmxlOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHRoaXMuZ3JvdXAuZHJhZ2dhYmxlKHRydWUpO1xuXHRcdFx0aWYodGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpe1xuXHRcdFx0XHR0aGlzLmdyb3VwLmRyYWdCb3VuZEZ1bmModGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5zeW5jKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdC8vcmV0dXJucyB0aGUgeCBwb3NpdGlvbiBvZiB0aGUgZ3JvdXBcblx0XHQvL1RoZSB4IHBvc2l0aW9uIG9mIHRoZSBncm91cCBpcyBzZXQgMCBpbml0aWFsbHkuVGhlIHRvcGJhciB4IHBvc2l0aW9uIGlzIHNldCByZWxhdGl2ZSB0byBncm91cHMgMCBwb3NpdGlvbiBpbml0aWFsbHkuIHdoZW4gdGhlIGdyb3VwIGlzIG1vdmVkIHRvIGdldCB0aGUgYWJzb2x1dGUgeCBwb3NpdGlvbiBvZiB0aGUgdG9wIGJhciB1c2UgZ2V0WDEgbWV0aG9kLlxuXHRcdC8vVGhlIHByb2JsZW0gaXMgd2hlbiBhbnkgY2hpbGRyZW4gZ2V0IG91dHNpZGUgb2YgYm91bmQgdGhlbiB0aGUgcG9zaXRpb24gb2YgZWFjaCBjaGlsZHJlbiBoYXMgdG8gYmUgdXBkYXRlZC4gVGhpcyB3YXkgc29sdmVzIHRoZSBwcm9ibGVtXG5cdFx0Z2V0WDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXAuZ2V0WCgpO1xuXHRcdH0sXG5cdFx0Ly9yZXR1cm5zIHRoZSBiYnNvbHV0ZSB4MSBwb3NpdGlvbiBvZiB0b3AgYmFyXG5cdFx0Z2V0WDE6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFgoKSt0aGlzLnRvcGJhci5nZXRYKCk7XG5cdFx0fSxcblx0XHQvL3JldHVybnMgdGhlIGFic29sdXRlIHgxIHBvc2l0aW9uIG9mIHRvcCBiYXJcblx0XHRnZXRYMjpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0WDEoKSt0aGlzLnRvcGJhci5nZXRXaWR0aCgpO1xuXHRcdH0sXG5cdFx0Z2V0WTE6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFkoKTtcblx0XHR9LFxuXHRcdHNldFk6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0dGhpcy5ncm91cC5zZXRZKHZhbHVlKTtcblx0XHR9LFxuXHRcdGdldFdpZHRoOmZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy50b3BiYXIuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdGdldEhlaWdodDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuYXR0ci5oZWlnaHQ7XG5cdFx0fSxcblx0XHRnZXRDdXJyZW50SGVpZ2h0OmZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpXG5cdFx0XHRcdHJldHVybiB0aGlzLmF0dHIuaGVpZ2h0O1xuXHRcdFx0ZWxzZXtcblx0XHRcdFx0cmV0dXJuIGFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2dyb3VwJywncm93SGVpZ2h0Jyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRcblx0XHRhZGRDaGlsZDogZnVuY3Rpb24oYmFyKXtcblx0XHRcdHRoaXMuY2hpbGRyZW4ucHVzaChiYXIpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQoYmFyLmdyb3VwKTtcblx0XHRcdHZhciB4PWJhci5nZXRYMSh0cnVlKTtcblx0XHRcdC8vbWFrZSBiYXIgeCByZWxhdGl2ZSB0byB0aGlzIGdyb3VwXG5cdFx0XHRiYXIuc2V0UGFyZW50KHRoaXMpO1xuXHRcdFx0YmFyLnNldFgxKHgse2Fic29sdXRlOnRydWUsc2lsZW50OnRydWV9KTtcblx0XHRcdGJhci5zZXRZKHRoaXMuZ2V0SGVpZ2h0KCkrdGhpcy5zZXR0aW5nLmdhcCk7XG5cdFx0XHR0aGlzLmF0dHIuaGVpZ2h0ICs9IHRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHRiYXIuZ3JvdXAudmlzaWJsZSh0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpO1xuXHRcdH0sXG5cdFx0cmVuZGVyQ2hpbGRyZW46ZnVuY3Rpb24oKXtcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy5jaGlsZHJlbi5sZW5ndGg7aSsrKXtcblx0XHRcdFx0dGhpcy5jaGlsZHJlbltpXS5yZW5kZXJCYXIoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVuZGVyVG9wQmFyKCk7XG5cblx0XHR9LFxuXHRcdHJlbmRlclRvcEJhcjpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHBhcmVudD10aGlzLm1vZGVsLmdldCgncGFyZW50Jyk7XG5cdFx0XHR2YXIgeD10aGlzLmNhbGN1bGF0ZVgocGFyZW50KTtcblxuXHRcdFx0dGhpcy50b3BiYXIuc2V0WCh4LngxLXRoaXMuZ3JvdXAuZ2V0WCgpKTtcblx0XHRcdHRoaXMudG9wYmFyLnNldFdpZHRoKHgueDIteC54MSk7XG5cdFx0fSxcblx0XHRiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLm9uKCdyZXNpemUgbW92ZScsZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIG1pblgsbWF4WDtcblx0XHRcdFx0bWluWD1fLm1pbih0aGlzLmNoaWxkcmVuLGZ1bmN0aW9uKGJhcil7XG5cdFx0XHRcdFx0cmV0dXJuIGJhci5nZXRYMSgpO1xuXHRcdFx0XHR9KS5nZXRYMSgpO1xuXHRcdFx0XHRtYXhYPV8ubWF4KHRoaXMuY2hpbGRyZW4sZnVuY3Rpb24oYmFyKXtcblx0XHRcdFx0XHRyZXR1cm4gYmFyLmdldFgyKCk7XG5cdFx0XHRcdH0pLmdldFgyKCk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLnNldFgobWluWCk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLnNldFdpZHRoKG1heFgtbWluWCk7XG5cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCdjaGFuZ2U6YWN0aXZlJyx0aGlzLnRvZ2dsZUNoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnb25zb3J0Jyx0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5nZXQoJ3BhcmVudCcpLCdjaGFuZ2U6c3RhcnQgY2hhbmdlOmVuZCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoaXMudG9wYmFyLnNldEF0dHJzKHRoaXMuZ2V0UmVjdHBhcmFtcygpKTtcblx0XHRcdFx0dGhpcy50b3BiYXIuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cdFx0Z2V0R3JvdXBQYXJhbXM6IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gXy5leHRlbmQoe1xuXHRcdFx0XHR4OjAsXG5cdFx0XHRcdHk6MCxcblx0XHRcdH0sIHRoaXMuc2V0dGluZy50b3BCYXIpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVYOmZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdHZhciBhdHRycz0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4MTooRGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbixtb2RlbC5nZXQoJ3N0YXJ0JykpLTEpKmRheXNXaWR0aCxcblx0XHRcdFx0eDI6RGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbixtb2RlbC5nZXQoJ2VuZCcpKSpkYXlzV2lkdGgsXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVQYXJlbnREYXRlczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGF0dHJzPWFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxuXHRcdFx0ZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcblx0XHRcdHZhciBkYXlzMT1NYXRoLnJvdW5kKHRoaXMuZ2V0WDEodHJ1ZSkvZGF5c1dpZHRoKSxkYXlzMj1NYXRoLnJvdW5kKHRoaXMuZ2V0WDIodHJ1ZSkvZGF5c1dpZHRoKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHN0YXJ0OiBib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czEpLFxuXHRcdFx0XHRlbmQ6Ym91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMyLTEpXG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9LFxuXHRcdGdldFJlY3RwYXJhbXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBwYXJlbnQ9dGhpcy5tb2RlbC5nZXQoJ3BhcmVudCcpO1xuXHRcdFx0dmFyIHhzPXRoaXMuY2FsY3VsYXRlWChwYXJlbnQpO1xuXHRcdFx0dmFyIHNldHRpbmc9dGhpcy5zZXR0aW5nO1xuXHRcdFx0cmV0dXJuIF8uZXh0ZW5kKHtcblx0XHRcdFx0eDogeHMueDEsXG5cdFx0XHRcdHdpZHRoOnhzLngyLXhzLngxLFxuXHRcdFx0XHR5OiBzZXR0aW5nLmdhcCxcblx0XHRcdH0sc2V0dGluZy50b3BCYXIpO1xuXHRcdH0sXG5cdFx0dG9nZ2xlQ2hpbGRyZW46ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBzaG93PXRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKTtcblx0XHRcdHZhciBjaGlsZHJlbj10aGlzLmNoaWxkcmVuO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxjaGlsZHJlbi5sZW5ndGg7aSsrKXtcblx0XHRcdFx0Y2hpbGRyZW5baV0udG9nZ2xlKHNob3cpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzeW5jOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnN5bmNpbmc9dHJ1ZTtcblxuXHRcdFx0Y29uc29sZS5sb2coJ3BhcmVudCBzeW5jIGNhbGxlZCcpO1xuXHRcdFx0Ly9zeW5jIHBhcmVudCBmaXJzdFxuXHRcdFx0dmFyIHBkYXRlcz10aGlzLmNhbGN1bGF0ZVBhcmVudERhdGVzKCk7XG5cdFx0XHR2YXIgcGFyZW50PXRoaXMubW9kZWwuZ2V0KCdwYXJlbnQnKTtcblx0XHRcdHBhcmVudC5zZXQoe3N0YXJ0OnBkYXRlcy5zdGFydCxlbmQ6cGRhdGVzLmVuZH0pO1xuXHRcdFx0XG5cdFx0XHR2YXIgY2hpbGRyZW49dGhpcy5jaGlsZHJlbjtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGNoaWxkcmVuW2ldLnN5bmMoKVxuXHRcdFx0fVxuXHRcdFx0Y29uc29sZS5sb2coJ3NldHRpbmcgc3luYyB0byBmYWxzZScpO1xuXHRcdFx0dGhpcy5zeW5jaW5nPWZhbHNlO1xuXHRcdH1cblx0fTtcblxuXy5leHRlbmQoQmFyR3JvdXAucHJvdG90eXBlLCBCYWNrYm9uZS5FdmVudHMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhckdyb3VwO1xuIiwidmFyIEJhckdyb3VwID0gcmVxdWlyZSgnLi9CYXJHcm91cCcpO1xudmFyIEJhciA9IHJlcXVpcmUoJy4vQmFyJyk7XG5cbnZhciB2aWV3T3B0aW9ucyA9IFsnbW9kZWwnLCAnY29sbGVjdGlvbiddO1xuXG52YXIgS2luZXRpY1ZpZXcgPSBCYWNrYm9uZS5LaW5ldGljVmlldyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCd2aWV3Jyk7XG5cdF8uZXh0ZW5kKHRoaXMsIF8ucGljayhvcHRpb25zLCB2aWV3T3B0aW9ucykpO1xuXHR0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5fLmV4dGVuZChLaW5ldGljVmlldy5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cywge1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5cbktpbmV0aWNWaWV3LmV4dGVuZD1CYWNrYm9uZS5Nb2RlbC5leHRlbmQ7XG5cbnZhciBLQ2FudmFzVmlldyA9IEtpbmV0aWNWaWV3LmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMuZ3JvdXBzPVtdO1xuXHRcdHRoaXMuY29sbGVjdGlvbiA9ICB0aGlzLmFwcC5USENvbGxlY3Rpb247XG5cblx0XHR2YXIgc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2Rpc3BsYXknKTtcblx0XHRcblx0XHR0aGlzLnN0YWdlID0gbmV3IEtpbmV0aWMuU3RhZ2Uoe1xuXHRcdFx0Y29udGFpbmVyIDogJ2dhbnR0LWNvbnRhaW5lcicsXG5cdFx0XHRoZWlnaHQ6IDU4MCxcblx0XHRcdHdpZHRoOiBzZXR0aW5nLnNjcmVlbldpZHRoIC0gc2V0dGluZy50SGlkZGVuV2lkdGggLSAyMCxcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6ICBmdW5jdGlvbihwb3MpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR4OiBwb3MueCxcblx0XHRcdFx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0XG5cdFx0dGhpcy5GbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcih7fSk7XG5cdFx0dGhpcy5CbGF5ZXIgPSBuZXcgS2luZXRpYy5MYXllcih7fSk7XG5cdFx0XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5hcHAudGFza3MsICdjaGFuZ2U6c29ydGluZGV4JywgdGhpcy5yZW5kZXJSZXF1ZXN0KTtcblxuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkJywgZnVuY3Rpb24obW9kZWwpIHtcblx0XHRcdHRoaXMuZ3JvdXBzLnB1c2gobmV3IEJhckdyb3VwKHtcblx0XHRcdFx0bW9kZWw6IG1vZGVsXG5cdFx0XHR9KSk7XG5cblx0XHRcdHZhciBnc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cdFx0XHRnc2V0dGluZy5jdXJyZW50WSA9IGdzZXR0aW5nLmluaVk7XG5cblx0XHRcdHRoaXMuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRcdGdyb3VwaS5zZXRZKGdzZXR0aW5nLmN1cnJlbnRZKTtcblx0XHRcdFx0Z3NldHRpbmcuY3VycmVudFkgKz0gZ3JvdXBpLmdldEN1cnJlbnRIZWlnaHQoKTtcblx0XHRcdFx0dGhpcy5GbGF5ZXIuYWRkKGdyb3VwaS5ncm91cCk7XG5cdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdFx0dGhpcy5yZW5kZXJncm91cHMoKTtcblx0XHR9KTtcblx0XHR0aGlzLmluaXRpYWxpemVGcm9udExheWVyKCk7XG5cdFx0dGhpcy5pbml0aWFsaXplQmFja0xheWVyKCk7XG5cdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdH0sXG5cdHJlbmRlclJlcXVlc3QgOiAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHdhaXRpbmcgPSBmYWxzZTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAod2FpdGluZykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR3YWl0aW5nID0gdHJ1ZTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGlzLnJlbmRlcmdyb3VwcygpO1xuXHRcdFx0XHRcdHdhaXRpbmcgPSBmYWxzZTtcblx0XHRcdFx0fS5iaW5kKHRoaXMpLCAxMCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSkoKSxcblx0aW5pdGlhbGl6ZUJhY2tMYXllcjpmdW5jdGlvbigpe1xuXHRcdHZhciBzaGFwZSA9IG5ldyBLaW5ldGljLlNoYXBlKHtcblx0XHRcdHN0cm9rZTogJyNiYmInLFxuXHRcdFx0c3Ryb2tlV2lkdGg6IDAsXG5cdFx0XHRzY2VuZUZ1bmM6dGhpcy5nZXRTY2VuZUZ1bmMoKVxuXHRcdH0pO1xuXHRcdHRoaXMuQmxheWVyLmFkZChzaGFwZSk7XG5cdFx0XG5cdH0sXG5cdGluaXRpYWxpemVGcm9udExheWVyOmZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2godGhpcy5hZGRHcm91cCx0aGlzKTtcblx0fSxcblx0YmluZEV2ZW50czpmdW5jdGlvbigpe1xuXHRcdHZhciBjYWxjdWxhdGluZz1mYWxzZTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmFwcC5USENvbGxlY3Rpb24sICdjaGFuZ2U6YWN0aXZlJywgdGhpcy5yZW5kZXJncm91cHMpO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuYXBwLnNldHRpbmcsICdjaGFuZ2U6aW50ZXJ2YWwgY2hhbmdlOmRwaScsIHRoaXMucmVuZGVyQmFycyk7XG5cdFx0JCgnI2dhbnR0LWNvbnRhaW5lcicpLm1vdXNld2hlZWwoZnVuY3Rpb24oZSl7XG5cdFx0XHRpZihjYWxjdWxhdGluZykge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR2YXIgY2RwaSA9ICB0aGlzLmFwcC5zZXR0aW5nLmdldCgnZHBpJyksIGRwaT0wO1xuXHRcdFx0Y2FsY3VsYXRpbmc9dHJ1ZTtcblx0XHRcdGlmIChlLm9yaWdpbmFsRXZlbnQud2hlZWxEZWx0YSA+IDApe1xuXHRcdFx0XHRkcGkgPSBNYXRoLm1heCgxLCBjZHBpIC0gMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkcGkgPSBjZHBpICsgMTtcblx0XHRcdH1cblx0XHRcdGlmIChkcGkgPT09IDEpe1xuXHRcdFx0XHRpZiAoIHRoaXMuYXBwLnNldHRpbmcuZ2V0KCdpbnRlcnZhbCcpID09PSAnYXV0bycpIHtcblx0XHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZy5zZXQoe2ludGVydmFsOidkYWlseSd9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmcuc2V0KHtpbnRlcnZhbDogJ2F1dG8nLCBkcGk6IGRwaX0pO1xuXHRcdFx0fVxuXHRcdFx0Y2FsY3VsYXRpbmcgPSBmYWxzZTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblxuXHRcdGlmIChjYWxjdWxhdGluZykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHZhciBjZHBpID0gIHRoaXMuYXBwLnNldHRpbmcuZ2V0KCdkcGknKSwgZHBpPTA7XG5cdFx0Y2FsY3VsYXRpbmcgID10cnVlO1xuXHRcdGRwaSA9IE1hdGgubWF4KDAsIGNkcGkgKyAyNSk7XG5cblx0XHRpZiAoZHBpID09PSAxKSB7XG5cdFx0XHRpZiggdGhpcy5hcHAuc2V0dGluZy5nZXQoJ2ludGVydmFsJyk9PT0nYXV0bycpIHtcblx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmcuc2V0KHtpbnRlcnZhbDonZGFpbHknfSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdCB0aGlzLmFwcC5zZXR0aW5nLnNldCh7aW50ZXJ2YWw6ICdhdXRvJywgZHBpOiBkcGl9KTtcblx0XHR9XG5cblx0XHRjYWxjdWxhdGluZyA9IGZhbHNlO1xuXHRcdCQoJyNnYW50dC1jb250YWluZXInKS5vbignZHJhZ21vdmUnLCBmdW5jdGlvbigpe1xuXHRcdFx0aWYoY2FsY3VsYXRpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNkcGkgPSAgdGhpcy5hcHAuc2V0dGluZy5nZXQoJ2RwaScpLCBkcGk9MDtcblx0XHRcdGNhbGN1bGF0aW5nID0gdHJ1ZTtcblx0XHRcdGRwaSA9IGNkcGkgKyAxO1xuXG5cdFx0XHRpZihkcGk9PT0xKXtcblx0XHRcdFx0aWYgKCB0aGlzLmFwcC5zZXR0aW5nLmdldCgnaW50ZXJ2YWwnKSA9PT0gJ2F1dG8nKSB7XG5cdFx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmcuc2V0KHtpbnRlcnZhbDogJ2RhaWx5J30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZy5zZXQoe2ludGVydmFsOidhdXRvJyxkcGk6ZHBpfSk7XG5cdFx0XHR9XG5cdFx0XHRjYWxjdWxhdGluZyA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGFkZEdyb3VwOiBmdW5jdGlvbih0YXNrZ3JvdXApIHtcblx0XHR0aGlzLmdyb3Vwcy5wdXNoKG5ldyBCYXJHcm91cCh7XG5cdFx0XHRtb2RlbDogdGFza2dyb3VwLFxuXHRcdFx0c2V0dGluZ3MgOiB0aGlzLmFwcC5zZXR0aW5nXG5cdFx0fSkpO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgZ3NldHRpbmcgPSAgdGhpcy5hcHAuc2V0dGluZy5nZXRTZXR0aW5nKCdncm91cCcpO1xuXG5cdFx0Z3NldHRpbmcuY3VycmVudFkgPSBnc2V0dGluZy5pbmlZO1xuXHRcdFxuXHRcdHRoaXMuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRncm91cGkuc2V0WShnc2V0dGluZy5jdXJyZW50WSk7XG5cdFx0XHRnc2V0dGluZy5jdXJyZW50WSArPSBncm91cGkuZ2V0Q3VycmVudEhlaWdodCgpO1xuXHRcdFx0dGhpcy5GbGF5ZXIuYWRkKGdyb3VwaS5ncm91cCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXG5cdFx0Ly9sb29wIHRocm91Z2ggZ3JvdXBzXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZ3JvdXBzLmxlbmd0aDsgaSsrKXtcblxuXHRcdFx0Ly9sb29wIHRocm91Z2ggdGFza3Ncblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbi5sZW5ndGg7IGorKyl7XG5cblx0XHRcdFx0Ly9pZiB0aHJlcmUgaXMgZGVwZW5kZW5jeVxuXHRcdFx0XHRpZiAodGhpcy5ncm91cHNbaV0uY2hpbGRyZW5bal0ubW9kZWwuYXR0cmlidXRlcy5kZXBlbmRlbmN5ICE9PSAnJyl7XG5cblx0XHRcdFx0XHQvL3BhcnNlIGRlcGVuZGVuY2llc1xuXHRcdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gJC5wYXJzZUpTT04odGhpcy5ncm91cHNbaV0uY2hpbGRyZW5bal0ubW9kZWwuYXR0cmlidXRlcy5kZXBlbmRlbmN5KTtcblxuXHRcdFx0XHRcdGZvcih2YXIgbD0wOyBsIDwgZGVwZW5kZW5jeS5sZW5ndGg7IGwrKyl7XG5cdFx0XHRcdFx0XHRmb3IoIHZhciBrPTA7IGsgPCB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbi5sZW5ndGg7IGsrKyl7XG5cdFx0XHRcdFx0XHRcdGlmIChkZXBlbmRlbmN5W2xdID09IHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2tdLm1vZGVsLmF0dHJpYnV0ZXMuaWQgKXtcblx0XHRcdFx0XHRcdFx0XHRCYXIuY3JlYXRlUmVsYXRpb24odGhpcy5ncm91cHNbaV0uY2hpbGRyZW5bal0sIHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2tdKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnN0YWdlLmFkZCh0aGlzLkJsYXllcik7XG5cdFx0dGhpcy5zdGFnZS5hZGQodGhpcy5GbGF5ZXIpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHJlbmRlckJhcnM6ZnVuY3Rpb24oKXtcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZ3JvdXBzLmxlbmd0aDtpKyspe1xuXHRcdFx0dGhpcy5ncm91cHNbaV0ucmVuZGVyQ2hpbGRyZW4oKTtcblx0XHR9IFxuXHRcdHRoaXMuRmxheWVyLmRyYXcoKTtcblx0XHR0aGlzLkJsYXllci5kcmF3KCk7XG5cdH0sXG5cblx0cmVuZGVyZ3JvdXBzOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIGdzZXR0aW5nID0gIHRoaXMuYXBwLnNldHRpbmcuZ2V0U2V0dGluZygnZ3JvdXAnKTtcblx0XHR2YXIgc29ydGVkID0gXy5zb3J0QnkodGhpcy5ncm91cHMsIGZ1bmN0aW9uKGl0ZW12aWV3KXtcblx0XHRcdHJldHVybiBpdGVtdmlldy5tb2RlbC5nZXQoJ3BhcmVudCcpLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0fSk7XG5cdFx0Z3NldHRpbmcuY3VycmVudFkgPSBnc2V0dGluZy5pbmlZO1xuXG5cdFx0c29ydGVkLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRncm91cGkuc2V0WShnc2V0dGluZy5jdXJyZW50WSk7XG5cdFx0XHRnc2V0dGluZy5jdXJyZW50WSArPSBncm91cGkuZ2V0Q3VycmVudEhlaWdodCgpO1xuXHRcdFx0Z3JvdXBpLnJlbmRlclNvcnRlZENoaWxkcmVuKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5GbGF5ZXIuZHJhdygpO1xuXHR9LFxuXHRzZXRXaWR0aDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLnN0YWdlLnNldFdpZHRoKHZhbHVlKTtcblx0fSxcblx0Z2V0U2NlbmVGdW5jOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNldHRpbmc9IHRoaXMuYXBwLnNldHRpbmcsc2Rpc3BsYXk9c2V0dGluZy5zZGlzcGxheTtcblx0XHR2YXIgYm9yZGVyV2lkdGg9c2Rpc3BsYXkuYm9yZGVyV2lkdGggfHwgMTtcblx0XHR2YXIgb2Zmc2V0PWJvcmRlcldpZHRoLzI7XG5cdFx0dmFyIHJvd0hlaWdodD0yMDtcblx0XHR2YXIgaW50ZXJ2YWwgPSAgdGhpcy5hcHAuc2V0dGluZy5nZXQoJ2ludGVydmFsJyk7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQpe1xuXHRcdFx0dmFyIGxpbmVXaWR0aCxzYXR0cj1zZXR0aW5nLnNhdHRyO1xuXHRcdFx0XG5cdFx0XHR2YXIgaT0wLFxuXHRcdFx0cz0wLFxuXHRcdFx0aUxlbj0wLFxuXHRcdFx0ZGF5c1dpZHRoPXNhdHRyLmRheXNXaWR0aCxcblx0XHRcdHgsXG5cdFx0XHRsZW5ndGgsXG5cdFx0XHRoRGF0YT1zYXR0ci5oRGF0YTtcblx0XHRcdFxuXHRcdFx0bGluZVdpZHRoPURhdGUuZGF5c2RpZmYoc2F0dHIuYm91bmRhcnlNaW4sc2F0dHIuYm91bmRhcnlNYXgpKnNhdHRyLmRheXNXaWR0aDtcblx0XHRcdGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0XHQvL2RyYXcgdGhyZWUgbGluZXNcblx0XHRcdGZvcihpPTE7aTw0O2krKyl7XG5cdFx0XHRcdGNvbnRleHQubW92ZVRvKG9mZnNldCwgaSpyb3dIZWlnaHQtb2Zmc2V0KTtcblx0XHRcdFx0Y29udGV4dC5saW5lVG8obGluZVdpZHRoK29mZnNldCwgaSpyb3dIZWlnaHQtb2Zmc2V0KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHlpPTAseWY9cm93SGVpZ2h0LHhpPTA7XG5cdFx0XHRmb3Iocz0xO3M8MztzKyspe1xuXHRcdFx0XHR4PTAsbGVuZ3RoPTA7XG5cdFx0XHRcdGZvcihpPTAsaUxlbj1oRGF0YVtzXS5sZW5ndGg7aTxpTGVuO2krKyl7XG5cdFx0XHRcdFx0bGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uKmRheXNXaWR0aDtcblx0XHRcdFx0XHR4ID0geCtsZW5ndGg7XG5cdFx0XHRcdFx0eGkgPSB4IC0gYm9yZGVyV2lkdGggKyBvZmZzZXQ7XG5cdFx0XHRcdFx0Y29udGV4dC5tb3ZlVG8oeGkseWkpO1xuXHRcdFx0XHRcdGNvbnRleHQubGluZVRvKHhpLHlmKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMTBwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuZmlsbFRleHQoaERhdGFbc11baV0udGV4dCwgeC1sZW5ndGgvMix5Zi1yb3dIZWlnaHQvMik7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0eWk9eWYseWY9IHlmK3Jvd0hlaWdodDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0eD0wLGxlbmd0aD0wLHM9Myx5Zj0xMjAwO1xuXHRcdFx0dmFyIGRyYWdJbnQgPSBwYXJzZUludChzYXR0ci5kcmFnSW50ZXJ2YWwpO1xuXHRcdFx0dmFyIGhpZGVEYXRlID0gZmFsc2U7XG5cdFx0XHRpZiggZHJhZ0ludCA9PSAxNCB8fCBkcmFnSW50ID09IDMwKXtcblx0XHRcdFx0aGlkZURhdGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKGk9MCxpTGVuPWhEYXRhW3NdLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0bGVuZ3RoPWhEYXRhW3NdW2ldLmR1cmF0aW9uKmRheXNXaWR0aDtcblx0XHRcdFx0eCA9IHgrbGVuZ3RoO1xuXHRcdFx0XHR4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcblx0XHRcdFx0Y29udGV4dC5tb3ZlVG8oeGkseWkpO1xuXHRcdFx0XHRjb250ZXh0LmxpbmVUbyh4aSx5Zik7XG5cdFx0XHRcdFxuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnNhdmUoKTtcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5mb250ID0gJzZwdCBBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZic7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQudGV4dEFsaWduID0gJ2xlZnQnO1xuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuXHRcdFx0XHQvLyBkYXRlIGhpZGUgb24gc3BlY2lmaWMgdmlld3Ncblx0XHRcdFx0aWYgKGhpZGVEYXRlKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnMXB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4LWxlbmd0aCs0MCx5aStyb3dIZWlnaHQvMik7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQucmVzdG9yZSgpO1xuXG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LnN0cm9rZVNoYXBlKHRoaXMpO1xuXHRcdFx0XG5cdFx0XHRcblx0XHR9XG5cblx0fSxcblx0cmVuZGVyQmFja0xheWVyOiBmdW5jdGlvbigpe1xuXHRcdFxuXG5cdH1cblxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBLQ2FudmFzVmlldzsiLCJmdW5jdGlvbiBwcmVwYXJlQWRkRm9ybSgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gICQoJy5tYXN0aGVhZCAuaW5mb3JtYXRpb24nKS50cmFuc2l0aW9uKCdzY2FsZSBpbicpO1xuXG4gICQoJy51aS5uZXctdGFzaycpLnBvcHVwKCk7XG5cbiAgJCgnLnVpLmZvcm0nKS5mb3JtKHtcbiAgICBuYW1lOiB7XG4gICAgICBpZGVudGlmaWVyICA6ICduYW1lJyxcbiAgICAgIHJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlICAgOiAnZW1wdHknLFxuICAgICAgICAgIHByb21wdCA6ICdQbGVhc2UgZW50ZXIgYSB0YXNrIG5hbWUnXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIGNvbXBsZXRlOiB7XG4gICAgICBpZGVudGlmaWVyICA6ICdjb21wbGV0ZScsXG4gICAgICBydWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZSAgIDogJ2VtcHR5JyxcbiAgICAgICAgICBwcm9tcHQgOiAnUGxlYXNlIGVudGVyIGFuIGVzdGltYXRlIGRheXMnXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHN0YXJ0OiB7XG4gICAgICBpZGVudGlmaWVyIDogJ3N0YXJ0JyxcbiAgICAgIHJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlICAgOiAnZW1wdHknLFxuICAgICAgICAgIHByb21wdCA6ICdQbGVhc2Ugc2V0IGEgc3RhcnQgZGF0ZSdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgZW5kOiB7XG4gICAgICBpZGVudGlmaWVyIDogJ2VuZCcsXG4gICAgICBydWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZSAgIDogJ2VtcHR5JyxcbiAgICAgICAgICBwcm9tcHQgOiAnUGxlYXNlIHNldCBhbiBlbmQgZGF0ZSdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgZHVyYXRpb246IHtcbiAgICAgIGlkZW50aWZpZXIgOiAnZHVyYXRpb24nLFxuICAgICAgcnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgICA6ICdlbXB0eScsXG4gICAgICAgICAgcHJvbXB0IDogJ1BsZWFzZSBzZXQgYSB2YWxpZCBkdXJhdGlvbidcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgc3RhdHVzOiB7XG4gICAgICBpZGVudGlmaWVyICA6ICdzdGF0dXMnLFxuICAgICAgcnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgICA6ICdlbXB0eScsXG4gICAgICAgICAgcHJvbXB0IDogJ1BsZWFzZSBzZWxlY3QgYSBzdGF0dXMnXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICB9KTtcblxuXG4gIC8vIHdoYXQgaXMgMTA4Pz8/XG4gICQoJy51aS5kcm9wZG93bicpLmRyb3Bkb3duKCdzZXQgc2VsZWN0ZWQnLCAnMTA4Jyk7XG4gICQoJ2lucHV0W25hbWU9XCJzdGF0dXNcIl0nKS52YWwoMTA4KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucmVtb3ZlLWl0ZW0gYnV0dG9uJyxmdW5jdGlvbigpe1xuICAgICQodGhpcykuY2xvc2VzdCgndWwnKS5mYWRlT3V0KDEwMDAsIGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgIH0pO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwcmVwYXJlQWRkRm9ybTtcbiIsImZ1bmN0aW9uIENvbnRleHRNZW51VmlldyhhcHApIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5hcHAgPSBhcHA7XHJcbn1cclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAkKCcudGFzay1jb250YWluZXInKS5jb250ZXh0TWVudSh7XHJcbiAgICAgICAgc2VsZWN0b3I6ICdkaXYnLFxyXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzLnBhcmVudCgpKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBzZWxmLmFwcC50YXNrcy5nZXQoaWQpO1xyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdkZWxldGUnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmFkZU91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdwcm9wZXJ0aWVzJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHByb3BlcnR5ID0gJy5wcm9wZXJ0eS0nO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXR1cyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnMTA4JzogJ1JlYWR5JyxcclxuICAgICAgICAgICAgICAgICAgICAnMTA5JzogJ09wZW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICcxMTAnOiAnQ29tcGxldGUnXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdmFyICRlbCA9ICQoZG9jdW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KyduYW1lJykuaHRtbChtb2RlbC5nZXQoJ25hbWUnKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2Rlc2NyaXB0aW9uJykuaHRtbChtb2RlbC5nZXQoJ2Rlc2NyaXB0aW9uJykpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydzdGFydCcpLmh0bWwoY29udmVydERhdGUobW9kZWwuZ2V0KCdzdGFydCcpKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2VuZCcpLmh0bWwoY29udmVydERhdGUobW9kZWwuZ2V0KCdlbmQnKSkpO1xyXG4gICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydzdGF0dXMnKS5odG1sKHN0YXR1c1ttb2RlbC5nZXQoJ3N0YXR1cycpXSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRkYXRlID0gbmV3IERhdGUobW9kZWwuZ2V0KCdzdGFydCcpKTtcclxuICAgICAgICAgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUobW9kZWwuZ2V0KCdlbmQnKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgX01TX1BFUl9EQVkgPSAxMDAwICogNjAgKiA2MCAqIDI0O1xyXG4gICAgICAgICAgICAgICAgaWYoc3RhcnRkYXRlICE9IFwiXCIgJiYgZW5kZGF0ZSAhPSBcIlwiKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMSA9IERhdGUuVVRDKHN0YXJ0ZGF0ZS5nZXRGdWxsWWVhcigpLCBzdGFydGRhdGUuZ2V0TW9udGgoKSwgc3RhcnRkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ2R1cmF0aW9uJykuaHRtbChNYXRoLmZsb29yKDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJy51aS5wcm9wZXJ0aWVzJykubW9kYWwoJ3NldHRpbmcnLCAndHJhbnNpdGlvbicsICd2ZXJ0aWNhbCBmbGlwJylcclxuICAgICAgICAgICAgICAgICAgICAubW9kYWwoJ3Nob3cnKVxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbnZlcnREYXRlKGlucHV0Rm9ybWF0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcGFkKHMpIHsgcmV0dXJuIChzIDwgMTApID8gJzAnICsgcyA6IHM7IH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKGlucHV0Rm9ybWF0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3BhZChkLmdldERhdGUoKSksIHBhZChkLmdldE1vbnRoKCkrMSksIGQuZ2V0RnVsbFllYXIoKV0uam9pbignLycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0Fib3ZlJyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkVGFzayhkYXRhLCAnYWJvdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdyb3dCZWxvdycpe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKHtcclxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VfaWQgOiBpZFxyXG4gICAgICAgICAgICAgICAgfSwgJ2JlbG93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnaW5kZW50Jyl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5leHBhbmQtbWVudScpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbF9pZCA9ICQodGhpcykuY2xvc2VzdCgnZGl2JykucHJldigpLmZpbmQoJy5zdWItdGFzaycpLmxhc3QoKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHByZXZNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChyZWxfaWQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudF9pZCA9IHByZXZNb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoJ3BhcmVudGlkJywgcGFyZW50X2lkKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHZhciB0b2JlQ2hpbGQgPSAkKHRoaXMpLm5leHQoKS5jaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5LmVhY2godG9iZUNoaWxkLCBmdW5jdGlvbihpbmRleCwgZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkTW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoY2hpbGRJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJyxwYXJlbnRfaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCd0YXNrJykuYWRkQ2xhc3MoJ3N1Yi10YXNrJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogJzMwcHgnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ291dGRlbnQnKXtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgncGFyZW50aWQnLDApO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvYmVDaGlsZCA9ICQodGhpcykucGFyZW50KCkuY2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJySW5kZXggPSAkKHRoaXMpLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0b2JlQ2hpbGQsIGZ1bmN0aW9uKGluZGV4LCBkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA+IGN1cnJJbmRleCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZElkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRNb2RlbCA9IHNlbGYuYXBwLnRhc2tzLmdldChjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zZXQoJ3BhcmVudGlkJyxtb2RlbC5nZXQoJ2lkJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucHJlcGVuZCgnPGxpIGNsYXNzPVwiZXhwYW5kLW1lbnVcIj48aSBjbGFzcz1cInRyaWFuZ2xlIHVwIGljb25cIj48L2k+IDwvbGk+Jyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdzdWItdGFzaycpLmFkZENsYXNzKCd0YXNrJykuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAncGFkZGluZy1sZWZ0JzogJzBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbnZhc1ZpZXcucmVuZGVyZ3JvdXBzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIFwicm93QWJvdmVcIjoge25hbWU6IFwiTmV3IFJvdyBBYm92ZVwiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJyb3dCZWxvd1wiOiB7bmFtZTogXCJOZXcgUm93IEJlbG93XCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcImluZGVudFwiOiB7bmFtZTogXCJJbmRlbnQgUm93XCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcIm91dGRlbnRcIjoge25hbWU6IFwiT3V0ZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwic2VwMVwiOiBcIi0tLS0tLS0tLVwiLFxyXG4gICAgICAgICAgICBcInByb3BlcnRpZXNcIjoge25hbWU6IFwiUHJvcGVydGllc1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAyXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwiZGVsZXRlXCI6IHtuYW1lOiBcIkRlbGV0ZSBSb3dcIiwgaWNvbjogXCJcIn1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNvbnRleHRNZW51Vmlldy5wcm90b3R5cGUuYWRkVGFzayA9IGZ1bmN0aW9uKGRhdGEsIGluc2VydFBvcykge1xyXG4gICAgdmFyIHNvcnRpbmRleCA9IDA7XHJcbiAgICB2YXIgcmVmX21vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KGRhdGEucmVmZXJlbmNlX2lkKTtcclxuICAgIGlmIChyZWZfbW9kZWwpIHtcclxuICAgICAgICBzb3J0aW5kZXggPSByZWZfbW9kZWwuZ2V0KCdzb3J0aW5kZXgnKSArIChpbnNlcnRQb3MgPT09ICdhYm92ZScgPyAtMC41IDogMC41KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzb3J0aW5kZXggPSAodGhpcy5hcHAudGFza3MubGFzdCgpLmdldCgnc29ydGluZGV4JykgKyAxKTtcclxuICAgIH1cclxuICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyXG4gICAgZGF0YS5wYXJlbnRpZCA9IHJlZl9tb2RlbC5nZXQoJ3BhcmVudGlkJyk7XHJcbiAgICB2YXIgdGFzayA9IHRoaXMuYXBwLnRhc2tzLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHJcbiAgICB0YXNrLnNhdmUoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udGV4dE1lbnVWaWV3OyIsIlxudmFyIHRlbXBsYXRlID0gXCI8ZGl2PlxcclxcbiAgICA8dWw+XFxyXFxuICAgICAgICA8JSB2YXIgc2V0dGluZz1hcHAuc2V0dGluZzslPlxcclxcbiAgICAgICAgPCUgaWYoaXNQYXJlbnQpeyAlPiA8bGkgY2xhc3M9XFxcImV4cGFuZC1tZW51XFxcIj48aSBjbGFzcz1cXFwidHJpYW5nbGUgZG93biBpY29uXFxcIj48L2k+PC9saT48JSB9ICU+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1uYW1lXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcIm5hbWVcXFwiLG5hbWUpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtc3RhcnRcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhcnRcXFwiLHN0YXJ0KSk7JT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZW5kXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImVuZFxcXCIsZW5kKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLWNvbXBsZXRlXFxcIj48JSBwcmludChzZXR0aW5nLmNvbkRUb1QoXFxcImNvbXBsZXRlXFxcIixjb21wbGV0ZSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1zdGF0dXNcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwic3RhdHVzXFxcIixzdGF0dXMpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtZHVyYXRpb25cXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwiZHVyYXRpb25cXFwiLDAse1xcXCJzdGFydFxcXCI6c3RhcnQsXFxcImVuZFxcXCI6ZW5kfSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcInJlbW92ZS1pdGVtXFxcIj48YnV0dG9uIGNsYXNzPVxcXCJtaW5pIHJlZCB1aSBidXR0b25cXFwiPiA8aSBjbGFzcz1cXFwic21hbGwgdHJhc2ggaWNvblxcXCI+PC9pPjwvYnV0dG9uPjwvbGk+XFxyXFxuICAgIDwvdWw+XFxyXFxuPC9kaXY+XCI7XG5cbnZhciBUYXNrSXRlbVZpZXc9QmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lIDogJ2xpJyxcblx0dGVtcGxhdGU6IF8udGVtcGxhdGUodGVtcGxhdGUpLFxuXHRpc1BhcmVudDogZmFsc2UsXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0dGhpcy5hcHAgPSBwYXJhbXMuYXBwO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnZWRpdHJvdycsdGhpcy5lZGl0KTtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsJ2NoYW5nZTpuYW1lIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kIGNoYW5nZTpjb21wbGV0ZSBjaGFuZ2U6c3RhdHVzJyx0aGlzLnJlbmRlclJvdyk7XG5cdFx0dGhpcy4kZWwuaG92ZXIoZnVuY3Rpb24oZSl7XG5cdFx0XHQkKGRvY3VtZW50KS5maW5kKCcuaXRlbS1zZWxlY3RvcicpLnN0b3AoKS5jc3Moe1xuXHRcdFx0XHR0b3A6ICgkKGUuY3VycmVudFRhcmdldCkub2Zmc2V0KCkudG9wKSsncHgnXG5cdFx0XHR9KS5mYWRlSW4oKTtcblx0XHR9LCBmdW5jdGlvbigpe1xuXHRcdFx0JChkb2N1bWVudCkuZmluZCgnLml0ZW0tc2VsZWN0b3InKS5zdG9wKCkuZmFkZU91dCgpO1xuXHRcdH0pO1xuXHRcdHRoaXMuJGVsLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcblx0XHRcdCQoZG9jdW1lbnQpLmZpbmQoJy5pdGVtLXNlbGVjdG9yJykuc3RvcCgpLmZhZGVPdXQoKTtcblx0XHR9KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbihwYXJlbnQpe1xuXHRcdHZhciBhZGRDbGFzcz0nc3ViLXRhc2sgZHJhZy1pdGVtJztcblx0XHRcblx0XHRpZihwYXJlbnQpe1xuXHRcdFx0YWRkQ2xhc3M9XCJ0YXNrXCI7XG5cdFx0XHR0aGlzLmlzUGFyZW50ID0gdHJ1ZTtcblx0XHRcdHRoaXMuc2V0RWxlbWVudCgkKCc8ZGl2PicpKTtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMuaXNQYXJlbnQgPSBmYWxzZTtcblx0XHRcdHRoaXMuc2V0RWxlbWVudCgkKCc8bGk+JykpO1xuXHRcdFx0dGhpcy4kZWwuZGF0YSh7XG5cdFx0XHRcdGlkIDogdGhpcy5tb2RlbC5pZFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHRoaXMuJGVsLmFkZENsYXNzKGFkZENsYXNzKTtcblx0XHR0aGlzLiRlbC5hdHRyKCdpZCcsIHRoaXMubW9kZWwuY2lkKTtcblx0XHRyZXR1cm4gdGhpcy5yZW5kZXJSb3coKTtcblx0fSxcblx0cmVuZGVyUm93OmZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRhdGEgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXHRcdGRhdGEuaXNQYXJlbnQgPSB0aGlzLmlzUGFyZW50O1xuLy9cdFx0aWYgKHRoaXMuaXNQYXJlbnQpIHtcbi8vXHRcdFx0dGhpcy4kaGFuZGxlLmh0bWwodGhpcy50ZW1wbGF0ZShkYXRhKSk7XG4vL1x0XHR9IGVsc2Uge1xuXHRcdGRhdGEuYXBwID0gdGhpcy5hcHA7XG5cdFx0dGhpcy4kZWwuaHRtbCh0aGlzLnRlbXBsYXRlKGRhdGEpKTtcbi8vXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0ZWRpdDpmdW5jdGlvbihldnQpe1xuXHRcdHZhciB0YXJnZXQgPSAkKGV2dC50YXJnZXQpO1xuXHRcdHZhciB3aWR0aCAgPSBwYXJzZUludCh0YXJnZXQuY3NzKCd3aWR0aCcpLCAxMCkgLSA1O1xuXHRcdHZhciBmaWVsZCA9IHRhcmdldC5hdHRyKCdjbGFzcycpLnNwbGl0KCctJylbMV07XG5cdFx0dmFyIGZvcm0gPSB0aGlzLmFwcC5zZXR0aW5nLmdldEZvcm1FbGVtKGZpZWxkLHRoaXMubW9kZWwsdGhpcy5vbkVkaXQsdGhpcyk7XG5cdFx0Zm9ybS5jc3Moe3dpZHRoOndpZHRoKydweCcsaGVpZ2h0OicxMHB4J30pO1xuXHRcdHRhcmdldC5odG1sKGZvcm0pO1xuXHRcdGZvcm0uZm9jdXMoKTtcblx0fSxcblx0b25FZGl0OmZ1bmN0aW9uKG5hbWUsdmFsdWUpe1xuXHRcdGlmKG5hbWU9PT0nZHVyYXRpb24nKXtcblx0XHRcdHZhciBzdGFydD10aGlzLm1vZGVsLmdldCgnc3RhcnQnKTtcblx0XHRcdHZhciBlbmQ9c3RhcnQuY2xvbmUoKS5hZGREYXlzKHBhcnNlSW50KHZhbHVlLCAxMCktMSk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCgnZW5kJyxlbmQpO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQobmFtZSx2YWx1ZSk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmUoKTsvLzFcblx0XHQvL1RoaXMgaGFzIHRvIGJlIGNhbGxlZCBpbiBjYXNlIG5vIGNoYW5nZSB0YWtlcyBwbGFjZVxuXHRcdH1cblx0XHR0aGlzLnJlbmRlclJvdygpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrSXRlbVZpZXc7XG4iLCJ2YXIgVGFza0l0ZW1WaWV3ID0gcmVxdWlyZSgnLi9UYXNrSXRlbVZpZXcnKTtcblxudmFyIFRhc2tWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAnbGknLFxuXHRjbGFzc05hbWU6ICd0YXNrLWxpc3QtY29udGFpbmVyIGRyYWctaXRlbScsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOmFjdGl2ZScsIHRoaXMudG9nZ2xlUGFyZW50KTtcblx0fSxcblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC50YXNrIC5leHBhbmQtbWVudSc6ICdoYW5kbGVDbGljaycsXG5cdFx0J2NsaWNrIC5hZGQtaXRlbSBidXR0b24nOiAnYWRkSXRlbScsXG5cdFx0J2NsaWNrIC5yZW1vdmUtaXRlbSBidXR0b24nOiAncmVtb3ZlSXRlbSdcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzLm1vZGVsLmdldCgncGFyZW50Jyk7XG5cdFx0dmFyIGl0ZW1WaWV3ID0gbmV3IFRhc2tJdGVtVmlldyh7XG5cdFx0XHRtb2RlbCA6IHBhcmVudCxcblx0XHRcdGFwcCA6IHRoaXMuYXBwXG5cdFx0fSk7XG5cblx0XHR0aGlzLiRwYXJlbnRlbCA9IGl0ZW1WaWV3LnJlbmRlcih0cnVlKS4kZWw7XG5cdFx0dGhpcy4kZWwuYXBwZW5kKHRoaXMuJHBhcmVudGVsKTtcblxuXHRcdHRoaXMuJGVsLmRhdGEoe1xuXHRcdFx0aWQgOiBwYXJlbnQuaWRcblx0XHR9KTtcblx0XHR0aGlzLiRjaGlsZGVsID0gJCgnPG9sIGNsYXNzPVwic3ViLXRhc2stbGlzdCBzb3J0YWJsZVwiPjwvb2w+Jyk7XG5cblx0XHR0aGlzLiRlbC5hcHBlbmQodGhpcy4kY2hpbGRlbCk7XG5cdFx0dmFyIGNoaWxkcmVuID0gXy5zb3J0QnkodGhpcy5tb2RlbC5jaGlsZHJlbi5tb2RlbHMsIGZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdH0pO1xuXHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRpdGVtVmlldz1uZXcgVGFza0l0ZW1WaWV3KHttb2RlbDpjaGlsZHJlbltpXSwgYXBwIDogdGhpcy5hcHB9KTtcblx0XHRcdGl0ZW1WaWV3LnJlbmRlcigpO1xuXHRcdFx0dGhpcy4kY2hpbGRlbC5hcHBlbmQoaXRlbVZpZXcuZWwpO1xuXHRcdH1cblx0XHR0aGlzLnRvZ2dsZVBhcmVudCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRoYW5kbGVDbGljazpmdW5jdGlvbihldil7XG5cdFx0dmFyIHZpc2libGU9dGhpcy4kY2hpbGRlbC5pcygnOnZpc2libGUnKVxuXHRcdHRoaXMubW9kZWwuc2V0KCdhY3RpdmUnLCF2aXNpYmxlKTtcblx0XHR0aGlzLm1vZGVsLnNhdmUoKTtcblx0XHQvL3RoaXMudG9nZ2xlUGFyZW50KCk7XG5cdH0sXG5cdGFkZEl0ZW06IGZ1bmN0aW9uKGV2dCl7XG5cdFx0JChldnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndWwnKS5uZXh0KCkuYXBwZW5kKCc8dWwgY2xhc3M9XCJzdWItdGFza1wiIGlkPVwiYycrTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDEwMDAwKSArIDEpKydcIj48bGkgY2xhc3M9XCJjb2wtbmFtZVwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiTmV3IHBsYW5cIiBzaXplPVwiMzhcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1zdGFydFwiPjxpbnB1dCB0eXBlPVwiZGF0ZVwiIHBsYWNlaG9sZGVyPVwiU3RhcnQgRGF0ZVwiIHN0eWxlPVwid2lkdGg6ODBweDtcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1lbmRcIj48aW5wdXQgdHlwZT1cImRhdGVcIiBwbGFjZWhvbGRlcj1cIkVuZCBEYXRlXCIgc3R5bGU9XCJ3aWR0aDo4MHB4O1wiPjwvbGk+PGxpIGNsYXNzPVwiY29sLWNvbXBsZXRlXCI+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIjJcIiBzdHlsZT1cIndpZHRoOiAzMHB4O21hcmdpbi1sZWZ0OiAtMTRweDtcIiBtaW49XCIwXCI+PC9saT48bGkgY2xhc3M9XCJjb2wtc3RhdHVzXCI+PHNlbGVjdCBzdHlsZT1cIndpZHRoOiA3MHB4O1wiPjxvcHRpb24gdmFsdWU9XCJpbmNvbXBsZXRlXCI+SW5vbXBsZXRlZDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCJjb21wbGV0ZWRcIj5Db21wbGV0ZWQ8L29wdGlvbj48L3NlbGVjdD48L2xpPjxsaSBjbGFzcz1cImNvbC1kdXJhdGlvblwiPjxpbnB1dCB0eXBlPVwibnVtYmVyXCIgcGxhY2Vob2xkZXI9XCIyNFwiIHN0eWxlPVwid2lkdGg6IDMycHg7bWFyZ2luLWxlZnQ6IC04cHg7XCIgbWluPVwiMFwiPiBkPC9saT48bGkgY2xhc3M9XCJyZW1vdmUtaXRlbVwiPjxidXR0b24gY2xhc3M9XCJtaW5pIHJlZCB1aSBidXR0b25cIj4gPGkgY2xhc3M9XCJzbWFsbCB0cmFzaCBpY29uXCI+PC9pPjwvYnV0dG9uPjwvbGk+PC91bD4nKS5oaWRlKCkuc2xpZGVEb3duKCk7XG5cdH0sXG5cdHJlbW92ZUl0ZW06IGZ1bmN0aW9uKGV2dCl7XG5cdFx0dmFyICRwYXJlbnRVTCA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ29sJyk7XG5cdFx0dmFyIGlkID0gJHBhcmVudFVMLmF0dHIoJ2lkJyk7XG5cdFx0dmFyIHRhc2tNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChpZCk7XG5cdFx0aWYoJHBhcmVudFVMLmhhc0NsYXNzKCd0YXNrJykpe1xuXHRcdFx0JHBhcmVudFVMLm5leHQoJ3VsJykuZmFkZU91dCgxMDAwLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fWVsc2V7XG5cdFx0XHQkKGV2dC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd1bCcpLmZhZGVPdXQoMTAwMCwgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH1cbi8vXHRcdHRhc2tNb2RlbC5zZXQoJ2FjdGlvbicsJ2RlbGV0ZScpO1xuXHRcdHRhc2tNb2RlbC5kZXN0cm95KCk7XG4vL1x0XHR0YXNrTW9kZWwuc2F2ZSgpO1xuXHRcdC8vdGFza01vZGVsLmRlbGV0ZSgpO1xuXHRcdHRhc2tNb2RlbC5zYXZlKCk7XG5cdH0sXG5cdHRvZ2dsZVBhcmVudDogZnVuY3Rpb24oKXtcblx0XHR2YXIgYWN0aXZlPXRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKTtcblx0XHR2YXIgc3RyPWFjdGl2ZT8nPGkgY2xhc3M9XCJ0cmlhbmdsZSB1cCBpY29uXCI+PC9pPiAnOic8aSBjbGFzcz1cInRyaWFuZ2xlIGRvd24gaWNvblwiPjwvaT4nO1xuXHRcdHRoaXMuJGNoaWxkZWwuc2xpZGVUb2dnbGUoKTtcblx0XHR0aGlzLiRwYXJlbnRlbC5maW5kKCcuZXhwYW5kLW1lbnUnKS5odG1sKHN0cik7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tWaWV3O1xuIl19
