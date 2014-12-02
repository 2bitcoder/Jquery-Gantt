(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var TaskModel = require('../models/TaskModel');

var TaskCollection = Backbone.Collection.extend({
	url : 'api/tasks',
	model: TaskModel,
	comparator : function(model) {
		return model.get('sortindex');
	},
	linkChildren : function() {
		"use strict";
		this.each(function(task) {
			if (!task.get('parentid')) {
				return;
			}
			this.get(task.get('parentid')).children.add(task);
		}.bind(this));
	},
	checkSortedIndex : function() {
		var sortIndex = 0;
		this.each(function(model) {
			model.set('sortindex', ++sortIndex);
			model.children.each(function(child) {
				child.set('sortindex', ++sortIndex);
			});
		});
		this.trigger('resort');
	},
	resort : function(data) {
		var sortIndex = 0;
		var self = this;
		data.forEach(function(parentData) {
			var parentModel = this.get(parentData.id);
			parentModel.set('sortindex', ++sortIndex).save();

			parentData.children.forEach(function(childData) {
				var childModel = self.get(childData.id);
				childModel.set('sortindex', ++sortIndex).save();
				if (childModel.get('parentid') !== parentModel.id) {
					childModel.set('parentid', parentModel.id);
					var parent = self.find(function(m) {
						return m.id === parentModel.id;
					});
					parent.children.add(childModel);
				}
			});
		}.bind(this));
	},
	subscribe : function() {
		this.listenTo(this, 'add', function(model) {
			if (model.get('parentid')) {
				var parent = this.find(function(m) {
					return m.id === model.get('parentid');
				});
				parent.children.add(model);
			}
		});
	}
});

module.exports = TaskCollection;


},{"../models/TaskModel":4}],2:[function(require,module,exports){
var demoResources = [{"wbsid":1,"res_id":1,"res_name":"Joe Black","res_allocation":60},{"wbsid":3,"res_id":2,"res_name":"John Blackmore","res_allocation":40}];

var TaskCollection = require('./collections/taskCollection');
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
			app.tasks.linkChildren();
			prepareAddForm();
			new GanttView({
				app : app,
				collection : app.tasks
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

},{"./collections/taskCollection":1,"./models/SettingModel":3,"./views/GanttView":6,"./views/prepareAddForm":10}],3:[function(require,module,exports){
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

},{"../utils/util":5}],4:[function(require,module,exports){
var util = require('../utils/util');var TaskModel = Backbone.Model.extend({    defaults: {        name: 'New task',        description: '',        complete: 0,        action: '',        sortindex: 0,        dependency:'',        resources: {},        status: 110,        health: 21,        start: '',        end: '',        color:'#0090d3',        aType: '',        reportable: '',        parentid: 0    },    initialize : function() {        "use strict";        this.children = new Backbone.Collection();        this.listenTo(this.children, 'change:parentid', function(child) {            this.children.remove(child);        });        this.listenTo(this.children, 'add remove change:start change:end', this._checkTime);        this.listenTo(this, 'destroy', function() {            this.children.each(function(child) {                child.destroy();            });        });    },    parse: function(response) {        if(_.isString(response.start)){            response.start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||                             new Date(response.start);        } else {            response.start = new Date();        }                if(_.isString(response.end)){            response.end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||                           new Date(response.end);        } else {            response.end = new Date();        }        return response;    },    _checkTime : function() {        if (this.children.length === 0) {            return;        }        var startTime = this.children.at(0).get('start');        var endTime = this.children.at(0).get('end');        this.children.each(function(child) {            var childStartTime = child.get('start');            var childEndTime = child.get('end');            if(childStartTime.compareTo(startTime) === -1) {                startTime = childStartTime;            }            if(childEndTime.compareTo(endTime) === 1){                endTime = childEndTime;            }        }.bind(this));        this.set('start', startTime);        this.set('end', endTime);    }});module.exports = TaskModel;
},{"../utils/util":5}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
var ContextMenuView = require('./sideBar/ContextMenuView');var TaskView = require('./sideBar/TaskView');var KCanvasView = require('./canvas/KCanvasView');var GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function(params) {        this.app = params.app;        this.$container = this.$el.find('.task-container');        this.$submitButton = this.$el.find('#submitFrom');        this.$submitButton.on('click', function(e) {            this.submitForm(e);        }.bind(this));        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        this.makeSortable();        this.defineContextMenu();        this.listenTo(this.collection, 'sorted add', function() {            this.$container.empty();            this.render();        });    },    makeSortable: function() {        this.$container.sortable({            group: 'sortable',            containerSelector : 'ol',            itemSelector : '.drag-item',            placeholder : '<li class="placeholder sort-placeholder"/>',            onDrag : function($item, position, _super, event) {                var $placeholder = $('.sort-placeholder');                var isSubTask = !$($placeholder.parent()).hasClass('task-container');                $placeholder.css({                    'padding-left' : isSubTask ? '30px' : '0'                });                _super($item, position, _super, event);                var data = this.$container.sortable("serialize").get()[0];                data.forEach(function(parentData) {                    parentData.children = parentData.children[0];                });            }.bind(this),            onDrop : function($item, position, _super, event) {                _super($item, position, _super, event);                var data = this.$container.sortable("serialize").get()[0];                data.forEach(function(parentData) {                    parentData.children = parentData.children[0];                });                this.collection.resort(data);            }.bind(this)        });    },    events: {        'click #tHandle': 'expand',        'dblclick .sub-task': 'handlerowclick',        'dblclick .task': 'handlerowclick',        'hover .sub-task': 'showMask',        'click .head-bar button': 'handbuttonclick',        'click .new-task': 'openForm',        'click a[href="/#!/generate/"]': 'generatePdf'    },    defineContextMenu: function(){        var contextView = new ContextMenuView(this.app);        contextView.render();    },    render: function() {        this.collection.each(function(task) {            if (task.get('parentid').toString() === '0') {                this.addTask(task);            }        }, this);        this.canvasView = new KCanvasView({            app : this.app,            collection : this.collection        }).render();        this.makeSortable();    },    handlerowclick: function(evt) {        var id = evt.currentTarget.id;        this.app.tasks.get(id).trigger('editrow', evt);    },    handbuttonclick: function(evt) {        var button = $(evt.currentTarget);        var action = button.data('action');        var interval = action.split('-')[1];        this.app.setting.set('interval', interval);    },    generatePdf: function(evt){        window.print();        evt.preventDefault();    },    calculateDuration: function(){        // Calculating the duration from start and end date        var startdate = new Date($(document).find('input[name="start"]').val());        var enddate = new Date($(document).find('input[name="end"]').val());        var _MS_PER_DAY = 1000 * 60 * 60 * 24;        if(startdate !== "" && enddate !== ""){            var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());            var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());            $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));        }else{            $(document).find('input[name="duration"]').val(Math.floor(0));        }    },    expand: function(evt) {        var target = $(evt.target);        var width = 0;        var setting = this.app.setting.getSetting('display');        if (target.hasClass('contract')) {            width = setting.tHiddenWidth;        }        else {            width = setting.tableWidth;        }        this.$menuContainer.css('width', width);        this.canvasView.setWidth(setting.screenWidth - width - 20);        target.toggleClass('contract');        this.$menuContainer.find('.menu-header').toggleClass('menu-header-opened');    },    openForm: function() {        $('.ui.add-new-task').modal('setting', 'transition', 'vertical flip')        .modal('show')        ;    },    addTask: function(task) {        var taskView = new TaskView({model: task, app : this.app});        this.$container.append(taskView.render().el);    },    submitForm: function(e) {        e.preventDefault();        var form = $("#new-task-form");        var data = {};        $(form).serializeArray().forEach(function(input) {            data[input.name] = input.value;        });        var sortindex = 0;        var ref_model = this.app.tasks.get(data.reference_id);        if (ref_model) {            sortindex = ref_model.get('sortindex') + (data.insertPos === 'above' ? -0.5 : 0.5)        } else {            sortindex = (this.app.tasks.last().get('sortindex') + 1);        }        data.sortindex = sortindex;        data.id = Math.random().toString();        var task = this.app.tasks.add(data, {parse : true});        task.save();        $('.ui.modal').modal('hide');    }});module.exports = GanttView;
},{"./canvas/KCanvasView":9,"./sideBar/ContextMenuView":11,"./sideBar/TaskView":13}],7:[function(require,module,exports){
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
	};

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
},{}],8:[function(require,module,exports){
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
					model:child,
					settings : this.settings
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
				return this.settings.getSetting('group','rowHeight');
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
			var parent=this.model;
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
			this.listenTo(this.model,'change:start change:end', function(){
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
			var parent=this.model;
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

},{"./Bar":7}],9:[function(require,module,exports){
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
				model: model
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
},{"./Bar":7,"./BarGroup":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){

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

},{}],13:[function(require,module,exports){
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
		var parent = this.model;
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
		var $parentUL = $(evt.currentTarget).closest('ol ul').parent().parent();
		var id = $parentUL.attr('id');
		var taskModel = this.app.tasks.get(id);
		if($parentUL.hasClass('task')){
			$parentUL.next('ol').fadeOut(1000, function(){
				$(this).remove();
			});
		}else{
			$(evt.currentTarget).closest('ul').fadeOut(1000, function(){
				$(this).remove();
			});
		}
		taskModel.destroy();
	},
	toggleParent: function(){
		var active=this.model.get('active');
		var str=active?'<i class="triangle up icon"></i> ':'<i class="triangle down icon"></i>';
		this.$childel.slideToggle();
		this.$parentel.find('.expand-menu').html(str);
	}
});

module.exports = TaskView;

},{"./TaskItemView":12}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbGF2cnRvblxcRHJvcGJveFxcUHJvamVjdHNcXEdhbnR0XFxub2RlX21vZHVsZXNcXGd1bHAtYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9mYWtlXzI5MGU0NjllLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvU2V0dGluZ01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy9tb2RlbHMvVGFza01vZGVsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy91dGlscy91dGlsLmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9HYW50dFZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhcy9CYXIuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL2NhbnZhcy9CYXJHcm91cC5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3MvY2FudmFzL0tDYW52YXNWaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9wcmVwYXJlQWRkRm9ybS5qcyIsIkM6L1VzZXJzL2xhdnJ0b24vRHJvcGJveC9Qcm9qZWN0cy9HYW50dC9zcmMvanMvdmlld3Mvc2lkZUJhci9Db250ZXh0TWVudVZpZXcuanMiLCJDOi9Vc2Vycy9sYXZydG9uL0Ryb3Bib3gvUHJvamVjdHMvR2FudHQvc3JjL2pzL3ZpZXdzL3NpZGVCYXIvVGFza0l0ZW1WaWV3LmpzIiwiQzovVXNlcnMvbGF2cnRvbi9Ecm9wYm94L1Byb2plY3RzL0dhbnR0L3NyYy9qcy92aWV3cy9zaWRlQmFyL1Rhc2tWaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRhc2tNb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy9UYXNrTW9kZWwnKTtcblxudmFyIFRhc2tDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHR1cmwgOiAnYXBpL3Rhc2tzJyxcblx0bW9kZWw6IFRhc2tNb2RlbCxcblx0Y29tcGFyYXRvciA6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0cmV0dXJuIG1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdH0sXG5cdGxpbmtDaGlsZHJlbiA6IGZ1bmN0aW9uKCkge1xuXHRcdFwidXNlIHN0cmljdFwiO1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbih0YXNrKSB7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ2V0KHRhc2suZ2V0KCdwYXJlbnRpZCcpKS5jaGlsZHJlbi5hZGQodGFzayk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fSxcblx0Y2hlY2tTb3J0ZWRJbmRleCA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHRoaXMuZWFjaChmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0bW9kZWwuc2V0KCdzb3J0aW5kZXgnLCArK3NvcnRJbmRleCk7XG5cdFx0XHRtb2RlbC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdGNoaWxkLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0dGhpcy50cmlnZ2VyKCdyZXNvcnQnKTtcblx0fSxcblx0cmVzb3J0IDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBzb3J0SW5kZXggPSAwO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24ocGFyZW50RGF0YSkge1xuXHRcdFx0dmFyIHBhcmVudE1vZGVsID0gdGhpcy5nZXQocGFyZW50RGF0YS5pZCk7XG5cdFx0XHRwYXJlbnRNb2RlbC5zZXQoJ3NvcnRpbmRleCcsICsrc29ydEluZGV4KS5zYXZlKCk7XG5cblx0XHRcdHBhcmVudERhdGEuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZERhdGEpIHtcblx0XHRcdFx0dmFyIGNoaWxkTW9kZWwgPSBzZWxmLmdldChjaGlsZERhdGEuaWQpO1xuXHRcdFx0XHRjaGlsZE1vZGVsLnNldCgnc29ydGluZGV4JywgKytzb3J0SW5kZXgpLnNhdmUoKTtcblx0XHRcdFx0aWYgKGNoaWxkTW9kZWwuZ2V0KCdwYXJlbnRpZCcpICE9PSBwYXJlbnRNb2RlbC5pZCkge1xuXHRcdFx0XHRcdGNoaWxkTW9kZWwuc2V0KCdwYXJlbnRpZCcsIHBhcmVudE1vZGVsLmlkKTtcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gc2VsZi5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRcdHJldHVybiBtLmlkID09PSBwYXJlbnRNb2RlbC5pZDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4uYWRkKGNoaWxkTW9kZWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXHRzdWJzY3JpYmUgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQnLCBmdW5jdGlvbihtb2RlbCkge1xuXHRcdFx0aWYgKG1vZGVsLmdldCgncGFyZW50aWQnKSkge1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gdGhpcy5maW5kKGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5pZCA9PT0gbW9kZWwuZ2V0KCdwYXJlbnRpZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cGFyZW50LmNoaWxkcmVuLmFkZChtb2RlbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tDb2xsZWN0aW9uO1xuXG4iLCJ2YXIgZGVtb1Jlc291cmNlcyA9IFt7XCJ3YnNpZFwiOjEsXCJyZXNfaWRcIjoxLFwicmVzX25hbWVcIjpcIkpvZSBCbGFja1wiLFwicmVzX2FsbG9jYXRpb25cIjo2MH0se1wid2JzaWRcIjozLFwicmVzX2lkXCI6MixcInJlc19uYW1lXCI6XCJKb2huIEJsYWNrbW9yZVwiLFwicmVzX2FsbG9jYXRpb25cIjo0MH1dO1xuXG52YXIgVGFza0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2NvbGxlY3Rpb25zL3Rhc2tDb2xsZWN0aW9uJyk7XG52YXIgU2V0dGluZ3MgPSByZXF1aXJlKCcuL21vZGVscy9TZXR0aW5nTW9kZWwnKTtcblxudmFyIEdhbnR0VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvR2FudHRWaWV3Jyk7XG5cbnZhciBwcmVwYXJlQWRkRm9ybSA9IHJlcXVpcmUoJy4vdmlld3MvcHJlcGFyZUFkZEZvcm0nKTtcbiQoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0Jztcblx0dmFyIGFwcCA9IHdpbmRvdy5hcHAgfHwge307XG5cdGFwcC50YXNrcyA9IG5ldyBUYXNrQ29sbGVjdGlvbigpO1xuXG5cdGFwcC50YXNrcy5mZXRjaCh7XG5cdFx0c3VjY2VzcyA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ1N1Y2Nlc3MgbG9hZGluZyB0YXNrcy4nKTtcblx0XHRcdGFwcC5zZXR0aW5nID0gbmV3IFNldHRpbmdzKHt9LCB7YXBwIDogYXBwfSk7XG5cdFx0XHRhcHAudGFza3MubGlua0NoaWxkcmVuKCk7XG5cdFx0XHRwcmVwYXJlQWRkRm9ybSgpO1xuXHRcdFx0bmV3IEdhbnR0Vmlldyh7XG5cdFx0XHRcdGFwcCA6IGFwcCxcblx0XHRcdFx0Y29sbGVjdGlvbiA6IGFwcC50YXNrc1xuXHRcdFx0fSkucmVuZGVyKCk7XG5cblx0XHRcdC8vIGluaXRhbGl6ZSBwYXJlbnQgc2VsZWN0b3IgZm9yIFwiYWRkIHRhc2sgZm9ybVwiXG5cdFx0XHR2YXIgJHNlbGVjdG9yID0gJCgnLnNlbGVjdC1wYXJlbnQuZHJvcGRvd24nKS5maW5kKCcubWVudScpO1xuXHRcdFx0JHNlbGVjdG9yLmFwcGVuZCgnPGRpdiBjbGFzcz1cIml0ZW1cIiBkYXRhLXZhbHVlPVwiMFwiPk1haW4gUHJvamVjdDwvZGl2PicpO1xuXHRcdFx0YXBwLnRhc2tzLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0XHR2YXIgcGFyZW50SWQgPSB0YXNrLmdldCgncGFyZW50aWQnKTtcblx0XHRcdFx0aWYocGFyZW50SWQgPT09IDApe1xuXHRcdFx0XHRcdCRzZWxlY3Rvci5hcHBlbmQoJzxkaXYgY2xhc3M9XCJpdGVtXCIgZGF0YS12YWx1ZT1cIicgKyB0YXNrLmdldCgnaWQnKSArICdcIj4nICsgdGFzay5nZXQoJ25hbWUnKSArICc8L2Rpdj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGluaXRpYWxpemUgZHJvcGRvd25cblx0XHRcdCQoJy5zZWxlY3QtcGFyZW50LmRyb3Bkb3duJykuZHJvcGRvd24oKTtcblx0XHRcdC8vIGxpbmUgYWRqdXN0bWVudFxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHQkKCdidXR0b25bZGF0YS1hY3Rpb249XCJ2aWV3LW1vbnRobHlcIl0nKS50cmlnZ2VyKCdjbGljaycpO1xuXHRcdFx0fSwxMDAwKTtcblxuXHRcdFx0Ly8gUmVzb3VyY2VzIGZyb20gYmFja2VuZFxuXHRcdFx0dmFyICRyZXNvdXJjZXMgPSAnPHNlbGVjdCBpZD1cInJlc291cmNlc1wiICBuYW1lPVwicmVzb3VyY2VzW11cIiBtdWx0aXBsZT1cIm11bHRpcGxlXCI+Jztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVtb1Jlc291cmNlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQkcmVzb3VyY2VzICs9ICc8b3B0aW9uIHZhbHVlPVwiJytkZW1vUmVzb3VyY2VzW2ldLnJlc19pZCsnXCI+JytkZW1vUmVzb3VyY2VzW2ldLnJlc19uYW1lKyc8L29wdGlvbj4nO1xuXHRcdFx0fVxuXHRcdFx0JHJlc291cmNlcyArPSAnPC9zZWxlY3Q+Jztcblx0XHRcdC8vIGFkZCBiYWNrZW5kIHRvIHRoZSB0YXNrIGxpc3Rcblx0XHRcdCQoJy5yZXNvdXJjZXMnKS5hcHBlbmQoJHJlc291cmNlcyk7XG5cblx0XHRcdC8vIGluaXRpYWxpemUgbXVsdGlwbGUgc2VsZWN0b3JzXG5cdFx0XHQkKCcjcmVzb3VyY2VzJykuY2hvc2VuKHt3aWR0aDogJzk1JSd9KTtcblxuXHRcdFx0Ly8gYXNzaWduIHJhbmRvbSBwYXJlbnQgY29sb3Jcblx0XHRcdCQoJ2lucHV0W25hbWU9XCJjb2xvclwiXScpLnZhbCgnIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNikpO1xuXHRcdH0sXG5cdFx0ZXJyb3IgOiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2Vycm9yIGxvYWRpbmcnKTtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHR9XG5cdH0sIHtwYXJzZTogdHJ1ZX0pO1xufSk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWxzL3V0aWwnKTtcblxudmFyIGhmdW5jID0gZnVuY3Rpb24ocG9zLCBldnQpIHtcblx0dmFyIGRyYWdJbnRlcnZhbCA9IGFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2F0dHInLCAnZHJhZ0ludGVydmFsJyk7XG5cdHZhciBuID0gTWF0aC5yb3VuZCgocG9zLnggLSBldnQuaW5pcG9zLngpIC8gZHJhZ0ludGVydmFsKTtcblx0cmV0dXJuIHtcblx0XHR4OiBldnQuaW5pcG9zLnggKyBuICogZHJhZ0ludGVydmFsLFxuXHRcdHk6IHRoaXMuZ2V0QWJzb2x1dGVQb3NpdGlvbigpLnlcblx0fTtcbn07XG5cbnZhciBTZXR0aW5nTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czp7XG5cdFx0aW50ZXJ2YWw6J2ZpeCcsXG5cdFx0Ly9kYXlzIHBlciBpbnRlcnZhbFxuXHRcdGRwaToxXG5cdH0sXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBwYXJhbXMpIHtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0dGhpcy5zYXR0ciA9IHtcblx0XHRcdGhEYXRhOiB7fSxcblx0XHRcdGRyYWdJbnRlcnZhbDogMSxcblx0XHRcdGRheXNXaWR0aDogNSxcblx0XHRcdGNlbGxXaWR0aDogMzUsXG5cdFx0XHRtaW5EYXRlOiBuZXcgRGF0ZSgyMDIwLDEsMSksXG5cdFx0XHRtYXhEYXRlOiBuZXcgRGF0ZSgwLDAsMCksXG5cdFx0XHRib3VuZGFyeU1pbjogbmV3IERhdGUoMCwwLDApLFxuXHRcdFx0Ym91bmRhcnlNYXg6IG5ldyBEYXRlKDIwMjAsMSwxKSxcblx0XHRcdC8vbW9udGhzIHBlciBjZWxsXG5cdFx0XHRtcGM6IDFcblx0XHR9O1xuXG5cdFx0dGhpcy5zZGlzcGxheSA9IHtcblx0XHRcdHNjcmVlbldpZHRoOiAgJCgnI2dhbnR0LWNvbnRhaW5lcicpLmlubmVyV2lkdGgoKSArIDc4Nixcblx0XHRcdHRIaWRkZW5XaWR0aDogMzA1LFxuXHRcdFx0dGFibGVXaWR0aDogNzEwLFxuXHRcdH07XG5cblx0XHR0aGlzLnNncm91cCA9IHtcblx0XHRcdGN1cnJlbnRZOiAwLFxuXHRcdFx0aW5pWTogNjAsXG5cdFx0XHRhY3RpdmU6IGZhbHNlLFxuXHRcdFx0dG9wQmFyOiB7XG5cdFx0XHRcdGZpbGw6ICcjNjY2Jyxcblx0XHRcdFx0aGVpZ2h0OiAxMixcblx0XHRcdFx0c3Ryb2tlRW5hYmxlZDogZmFsc2UsXG5cdFx0XHR9LFxuXHRcdFx0Z2FwOiAzLFxuXHRcdFx0cm93SGVpZ2h0OiAyMixcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdH07XG5cdFx0dGhpcy5zYmFyID0ge1xuXHRcdFx0YmFyaGVpZ2h0OiAxMixcblx0XHRcdHJlY3RvcHRpb246IHtcblx0XHRcdFx0c3Ryb2tlRW5hYmxlZDogZmFsc2UsXG5cdFx0XHRcdGZpbGw6ICdncmV5J1xuXHRcdFx0fSxcblx0XHRcdGdhcDogMjAsXG5cdFx0XHRyb3doZWlnaHQ6ICA2MCxcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdGRyYWdCb3VuZEZ1bmM6IGhmdW5jLFxuXHRcdFx0cmVzaXplQm91bmRGdW5jOiBoZnVuYyxcblx0XHRcdHN1Ymdyb3VwOiB0cnVlLFxuXHRcdH0sXG5cdFx0dGhpcy5zZm9ybT17XG5cdFx0XHQnbmFtZSc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICd0ZXh0Jyxcblx0XHRcdH0sXG5cdFx0XHQnc3RhcnQnOiB7XG5cdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR0eXBlOiAnZGF0ZScsXG5cdFx0XHRcdGQydDogZnVuY3Rpb24oZCl7XG5cdFx0XHRcdFx0cmV0dXJuIGQudG9TdHJpbmcoJ2RkL01NL3l5eXknKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dDJkOiBmdW5jdGlvbih0KXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5wYXJzZUV4YWN0KCB1dGlsLmNvcnJlY3RkYXRlKHQpLCAnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICdkYXRlJyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbihkKXtcblx0XHRcdFx0XHRyZXR1cm4gZC50b1N0cmluZygnZGQvTU0veXl5eScpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0MmQ6IGZ1bmN0aW9uKHQpe1xuXHRcdFx0XHRcdHJldHVybiBEYXRlLnBhcnNlRXhhY3QoIHV0aWwuY29ycmVjdGRhdGUodCksICdkZC9NTS95eXl5Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnc3RhdHVzJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3NlbGVjdCcsXG5cdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHQnMTEwJzogJ2NvbXBsZXRlJyxcblx0XHRcdFx0XHQnMTA5JzogJ29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2NvbXBsZXRlJzoge1xuXHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dHlwZTogJ3RleHQnLFxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6IHtcblx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6ICd0ZXh0Jyxcblx0XHRcdFx0ZDJ0OiBmdW5jdGlvbih0LG1vZGVsKXtcblx0XHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5nZXQoJ3N0YXJ0JyksbW9kZWwuZ2V0KCdlbmQnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcblx0XHR9O1xuXHRcdHRoaXMuZ2V0Rm9ybUVsZW0gPSB0aGlzLmNyZWF0ZUVsZW0oKTtcblx0XHR0aGlzLmNvbGxlY3Rpb24gPSB0aGlzLmFwcC50YXNrcztcblx0XHR0aGlzLmNhbGN1bGF0ZUludGVydmFscygpO1xuXHRcdHRoaXMub24oJ2NoYW5nZTppbnRlcnZhbCBjaGFuZ2U6ZHBpJywgdGhpcy5jYWxjdWxhdGVJbnRlcnZhbHMpO1xuXHR9LFxuXHRnZXRTZXR0aW5nOmZ1bmN0aW9uKGZyb20sYXR0cil7XG5cdFx0aWYoYXR0cil7XG5cdFx0XHRyZXR1cm4gdGhpc1sncycrZnJvbV1bYXR0cl07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzWydzJytmcm9tXTtcblx0fSxcblx0Y2FsY21pbm1heDpmdW5jdGlvbigpe1xuXHRcdHZhciBjb2xsZWN0aW9uPXRoaXMuY29sbGVjdGlvbjtcblx0XHR2YXIgbWluRGF0ZT1uZXcgRGF0ZSgyMDIwLDEsMSksbWF4RGF0ZT1uZXcgRGF0ZSgwLDAsMCk7XG5cdFx0XG5cdFx0Y29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdGlmKG1vZGVsLmdldCgnc3RhcnQnKS5jb21wYXJlVG8obWluRGF0ZSk9PS0xKXtcblx0XHRcdFx0bWluRGF0ZT1tb2RlbC5nZXQoJ3N0YXJ0Jyk7XG5cdFx0XHR9XG5cdFx0XHRpZihtb2RlbC5nZXQoJ2VuZCcpLmNvbXBhcmVUbyhtYXhEYXRlKT09MSl7XG5cdFx0XHRcdG1heERhdGU9bW9kZWwuZ2V0KCdlbmQnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNhdHRyLm1pbkRhdGU9bWluRGF0ZTtcblx0XHR0aGlzLnNhdHRyLm1heERhdGU9bWF4RGF0ZTtcblx0XHRcblx0fSxcblx0c2V0QXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVuZCxpbnRlcnZhbCxzYXR0cj10aGlzLnNhdHRyLGRhdHRyPXRoaXMuc2Rpc3BsYXksZHVyYXRpb24sc2l6ZSxjZWxsV2lkdGgsZHBpLHJldGZ1bmMsc3RhcnQsbGFzdCxpPTAsaj0wLGlMZW49MCxuZXh0PW51bGw7XG5cdFx0XG5cdFx0aW50ZXJ2YWwgPSB0aGlzLmdldCgnaW50ZXJ2YWwnKTtcblx0XHQvL1RPRE86bmVlZHMgaW1wcm92ZW1lbnQgaW5zdGFlZCBvZiBjbG9uaW5nIGNvbnZlcnQgaW50byB0aW1lIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2Vcblx0XHRpZihpbnRlcnZhbD09PSdkYWlseScpe1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsMSx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbj1zYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSoyMCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9MTI7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGg9c2F0dHIuZGF5c1dpZHRoKjE7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWw9MSpzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoMSk7IH07XG5cdFx0XHRzYXR0ci5tcGM9MTtcblx0XHRcdFxuXHRcdH1cblx0XHRlbHNlIGlmKGludGVydmFsPT09J3dlZWtseScpe1xuXHRcdFx0dGhpcy5zZXQoJ2RwaScsNyx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCo3KTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluPXNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0xKjIwKjcpLm1vdmVUb0RheU9mV2VlaygxLC0xKTtcblx0XHRcdHNhdHRyLmRheXNXaWR0aD01O1xuXHRcdFx0c2F0dHIuY2VsbFdpZHRoPXNhdHRyLmRheXNXaWR0aCo3O1xuXHRcdFx0c2F0dHIuZHJhZ0ludGVydmFsPTEqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjPTE7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoNyk7IH1cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZSBpZihpbnRlcnZhbD09PSdtb250aGx5Jyl7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywzMCx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCozMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbj1zYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSoyMCozMCkubW92ZVRvRmlyc3REYXlPZk1vbnRoKCk7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9Mjtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aD0nYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWw9NypzYXR0ci5kYXlzV2lkdGg7XG5cdFx0XHRzYXR0ci5tcGM9MTtcblx0XHRcdHJldGZ1bmM9ZnVuY3Rpb24oZGF0ZSl7IHJldHVybiBkYXRlLmNsb25lKCkuYWRkTW9udGhzKDEpOyB9XG5cdFx0XG5cdFx0fVxuXHRcdGVsc2UgaWYoaW50ZXJ2YWw9PT0ncXVhcnRlcmx5Jyl7XG5cdFx0XHR0aGlzLnNldCgnZHBpJywzMCx7c2lsZW50OnRydWV9KTtcblx0XHRcdGVuZD1zYXR0ci5tYXhEYXRlLmNsb25lKCkuYWRkRGF5cygyMCozMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbj1zYXR0ci5taW5EYXRlLmNsb25lKCkuYWRkRGF5cygtMSoyMCozMCk7XG5cdFx0XHRzYXR0ci5ib3VuZGFyeU1pbi5tb3ZlVG9GaXJzdERheU9mUXVhcnRlcigpO1xuXG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9MTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aD0nYXV0byc7XG5cdFx0XHRzYXR0ci5kcmFnSW50ZXJ2YWw9MzAqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIubXBjPTM7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZE1vbnRocygzKTsgfVxuXHRcdH1cblx0XHRlbHNlIGlmKGludGVydmFsPT09J2ZpeCcpe1xuXHRcdFx0Y2VsbFdpZHRoPTMwO1xuXHRcdFx0ZHVyYXRpb249RGF0ZS5kYXlzZGlmZihzYXR0ci5taW5EYXRlLHNhdHRyLm1heERhdGUpO1xuXHRcdFx0c2l6ZT1kYXR0ci5zY3JlZW5XaWR0aC1kYXR0ci50SGlkZGVuV2lkdGgtMTAwO1xuXHRcdFx0c2F0dHIuZGF5c1dpZHRoPXNpemUvZHVyYXRpb247XG5cdFx0XHRkcGk9TWF0aC5yb3VuZChjZWxsV2lkdGgvc2F0dHIuZGF5c1dpZHRoKTtcblx0XHRcdHRoaXMuc2V0KCdkcGknLGRwaSx7c2lsZW50OnRydWV9KTtcblx0XHRcdHNhdHRyLmNlbGxXaWR0aD1kcGkqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0c2F0dHIuYm91bmRhcnlNaW49c2F0dHIubWluRGF0ZS5jbG9uZSgpLmFkZERheXMoLTIqZHBpKTtcblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbD1NYXRoLnJvdW5kKC4zKmRwaSkqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0ZW5kPXNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIqZHBpKTtcblx0XHRcdHNhdHRyLm1wYz1NYXRoLm1heCgxLE1hdGgucm91bmQoZHBpLzMwKSk7XG5cdFx0XHRyZXRmdW5jPWZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5jbG9uZSgpLmFkZERheXMoZHBpKTsgfTtcblx0XHRcdFxuXHRcdH1cblx0XHRlbHNlIGlmKGludGVydmFsPT09J2F1dG8nKXtcblx0XHRcdGRwaT10aGlzLmdldCgnZHBpJyk7XG5cdFx0XHRzYXR0ci5jZWxsV2lkdGg9KDErTWF0aC5sb2coZHBpKSkqMTI7XG5cdFx0XHRzYXR0ci5kYXlzV2lkdGg9c2F0dHIuY2VsbFdpZHRoL2RwaTtcblx0XHRcdHNhdHRyLmJvdW5kYXJ5TWluPXNhdHRyLm1pbkRhdGUuY2xvbmUoKS5hZGREYXlzKC0yMCpkcGkpO1xuXHRcdFx0ZW5kPXNhdHRyLm1heERhdGUuY2xvbmUoKS5hZGREYXlzKDIwKmRwaSk7XG5cdFx0XHRzYXR0ci5tcGM9TWF0aC5tYXgoMSxNYXRoLnJvdW5kKGRwaS8zMCkpO1xuXHRcdFx0cmV0ZnVuYz1mdW5jdGlvbihkYXRlKXsgcmV0dXJuIGRhdGUuY2xvbmUoKS5hZGREYXlzKGRwaSk7IH1cblx0XHRcdHNhdHRyLmRyYWdJbnRlcnZhbD1NYXRoLnJvdW5kKC4zKmRwaSkqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgaERhdGE9e1xuXHRcdFx0JzEnOltdLFxuXHRcdFx0JzInOltdLFxuXHRcdFx0JzMnOltdXG5cdFx0fVxuXHRcdHZhciBoZGF0YTM9W107XG5cdFx0XG5cdFx0c3RhcnQ9c2F0dHIuYm91bmRhcnlNaW47XG5cdFx0XG5cdFx0bGFzdCA9IHN0YXJ0O1xuXHRcdGlmKGludGVydmFsPT0nbW9udGhseScgfHwgaW50ZXJ2YWw9PSdxdWFydGVybHknKVxuXHRcdHtcblx0XHRcdHZhciBkdXJmdW5jPShpbnRlcnZhbD09PSdtb250aGx5Jyk/ZnVuY3Rpb24oZGF0ZSl7IHJldHVybiBEYXRlLmdldERheXNJbk1vbnRoKGRhdGUuZ2V0RnVsbFllYXIoKSxkYXRlLmdldE1vbnRoKCkpO306ZnVuY3Rpb24oZGF0ZSl7IHJldHVybiBEYXRlLmdldERheXNJblF1YXJ0ZXIoZGF0ZS5nZXRGdWxsWWVhcigpLGRhdGUuZ2V0UXVhcnRlcigpKTt9O1xuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT0gLTEpIHtcblx0XHRcdFx0XHRoZGF0YTMucHVzaCh7ZHVyYXRpb246ZHVyZnVuYyhsYXN0KSx0ZXh0Omxhc3QuZ2V0RGF0ZSgpfSk7XG5cdFx0XHRcdFx0bmV4dCA9IHJldGZ1bmMobGFzdCk7XG5cdFx0XHRcdFx0bGFzdCA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR2YXIgaW50ZXJ2YWxkYXlzPXRoaXMuZ2V0KCdkcGknKTtcblx0XHRcdFxuXHRcdFx0d2hpbGUgKGxhc3QuY29tcGFyZVRvKGVuZCkgPT0gLTEpIHtcblx0XHRcdFx0aGRhdGEzLnB1c2goe2R1cmF0aW9uOmludGVydmFsZGF5cyx0ZXh0Omxhc3QuZ2V0RGF0ZSgpfSk7XG5cdFx0XHRcdG5leHQgPSByZXRmdW5jKGxhc3QpO1xuXHRcdFx0XHRcdGxhc3QgPSBuZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRzYXR0ci5ib3VuZGFyeU1heD1lbmQ9bGFzdDtcblx0XHRoRGF0YVsnMyddPWhkYXRhMztcblx0XHRcblx0XHR2YXIgaW50ZXI9MDtcblx0XHRcdFxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgZmlyc3QgZGF0ZSB0byBlbmQgb2YgeWVhclxuXHRcdGludGVyPURhdGUuZGF5c2RpZmYoc3RhcnQsbmV3IERhdGUoc3RhcnQuZ2V0RnVsbFllYXIoKSwxMSwzMSkpO1xuXHRcdGhEYXRhWycxJ10ucHVzaCh7ZHVyYXRpb246aW50ZXIsdGV4dDpzdGFydC5nZXRGdWxsWWVhcigpfSk7XG5cdFx0Zm9yKGk9c3RhcnQuZ2V0RnVsbFllYXIoKSsxLGlMZW49ZW5kLmdldEZ1bGxZZWFyKCk7aTxpTGVuO2krKyl7XG5cdFx0XHRpbnRlcj1EYXRlLmlzTGVhcFllYXIoaSk/MzY2OjM2NTtcblx0XHRcdGhEYXRhWycxJ10ucHVzaCh7ZHVyYXRpb246aW50ZXIsdGV4dDppfSk7XG5cdFx0fVxuXHRcdC8vZW50ZXIgZHVyYXRpb24gb2YgbGFzdCB5ZWFyIHVwdG8gZW5kIGRhdGVcblx0XHRpZihzdGFydC5nZXRGdWxsWWVhcigpIT09ZW5kLmdldEZ1bGxZZWFyKCkpe1xuXHRcdFx0aW50ZXI9RGF0ZS5kYXlzZGlmZihuZXcgRGF0ZShlbmQuZ2V0RnVsbFllYXIoKSwwLDEpLGVuZCk7XG5cdFx0XHRoRGF0YVsnMSddLnB1c2goe2R1cmF0aW9uOmludGVyLHRleHQ6ZW5kLmdldEZ1bGxZZWFyKCl9KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly9lbnRlciBkdXJhdGlvbiBvZiBmaXJzdCBtb250aFxuXHRcdGhEYXRhWycyJ10ucHVzaCh7ZHVyYXRpb246RGF0ZS5kYXlzZGlmZihzdGFydCxzdGFydC5jbG9uZSgpLm1vdmVUb0xhc3REYXlPZk1vbnRoKCkpLHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShzdGFydC5nZXRNb250aCgpLCdtJyl9KTtcblx0XHRcblx0XHRqPXN0YXJ0LmdldE1vbnRoKCkrMTtcblx0XHRpPXN0YXJ0LmdldEZ1bGxZZWFyKCk7XG5cdFx0aUxlbj1lbmQuZ2V0RnVsbFllYXIoKTtcblx0XHR2YXIgZW5kbW9udGg9ZW5kLmdldE1vbnRoKClcblx0XHR3aGlsZShpPD1pTGVuKXtcblx0XHRcdHdoaWxlKGo8MTIpe1xuXHRcdFx0XHRpZihpPT1pTGVuICYmIGo9PWVuZG1vbnRoKSBicmVhazsgXG5cdFx0XHRcdGhEYXRhWycyJ10ucHVzaCh7ZHVyYXRpb246RGF0ZS5nZXREYXlzSW5Nb250aChpLGopLHRleHQ6IHV0aWwuZm9ybWF0ZGF0YShqLCdtJyl9KTtcblx0XHRcdFx0aiArPSAxO1xuXHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdGkgKz0gMTtcblx0XHRcdGo9MDtcblx0XHR9XG5cdFx0aWYoZW5kLmdldE1vbnRoKCkhPT1zdGFydC5nZXRNb250aCAmJiBlbmQuZ2V0RnVsbFllYXIoKSE9PXN0YXJ0LmdldEZ1bGxZZWFyKCkpe1xuXHRcdFx0aERhdGFbJzInXS5wdXNoKHtkdXJhdGlvbjpEYXRlLmRheXNkaWZmKGVuZC5jbG9uZSgpLm1vdmVUb0ZpcnN0RGF5T2ZNb250aCgpLGVuZCksdGV4dDogdXRpbC5mb3JtYXRkYXRhKGVuZC5nZXRNb250aCgpLCdtJyl9KTtcblx0XHRcblx0XHR9XG5cdFx0c2F0dHIuaERhdGE9aERhdGE7XG5cdFx0XG5cdH0sXG5cdGNhbGN1bGF0ZUludGVydmFsczpmdW5jdGlvbigpe1xuXHRcdHRoaXMuY2FsY21pbm1heCgpO1xuXHRcdHRoaXMuc2V0QXR0cmlidXRlcygpO1xuXHR9LFxuXHRjcmVhdGVFbGVtOmZ1bmN0aW9uKCl7XG5cdFx0dmFyIGVsZW1zPXt9LG9iaixjYWxsYmFjaz1mYWxzZSxjb250ZXh0PWZhbHNlO1xuXHRcdGZ1bmN0aW9uIGJpbmRUZXh0RXZlbnRzKGVsZW1lbnQsb2JqLG5hbWUpe1xuXHRcdFx0ZWxlbWVudC5vbignYmx1cicsZnVuY3Rpb24oZSl7XG5cdFx0XHRcdHZhciAkdGhpcz0kKHRoaXMpO1xuXHRcdFx0XHR2YXIgdmFsdWU9JHRoaXMudmFsKCk7XG5cdFx0XHRcdCR0aGlzLmRldGFjaCgpO1xuXHRcdFx0XHR2YXIgY2FsbGZ1bmM9Y2FsbGJhY2ssY3R4PWNvbnRleHQ7XG5cdFx0XHRcdGNhbGxiYWNrPWZhbHNlO1xuXHRcdFx0XHRjb250ZXh0PWZhbHNlO1xuXHRcdFx0XHRpZihvYmpbJ3QyZCddKSB2YWx1ZT1vYmpbJ3QyZCddKHZhbHVlKTtcblx0XHRcdFx0Y2FsbGZ1bmMuY2FsbChjdHgsbmFtZSx2YWx1ZSk7XG5cdFx0XHR9KS5vbigna2V5cHJlc3MnLGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRpZihldmVudC53aGljaD09PTEzKXtcblx0XHRcdFx0XHQkKHRoaXMpLnRyaWdnZXIoJ2JsdXInKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0XG5cdFx0ZnVuY3Rpb24gYmluZERhdGVFdmVudHMoZWxlbWVudCxvYmosbmFtZSl7XG5cdFx0XHRlbGVtZW50LmRhdGVwaWNrZXIoeyBkYXRlRm9ybWF0OiBcImRkL21tL3l5XCIsb25DbG9zZTpmdW5jdGlvbigpe1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCdvbiBjbG9zZSBjYWxsZWQnKTtcblx0XHRcdFx0dmFyICR0aGlzPSQodGhpcyk7XG5cdFx0XHRcdHZhciB2YWx1ZT0kdGhpcy52YWwoKTtcblx0XHRcdFx0JHRoaXMuZGV0YWNoKCk7XG5cdFx0XHRcdHZhciBjYWxsZnVuYz1jYWxsYmFjayxjdHg9Y29udGV4dDtcblx0XHRcdFx0Y2FsbGJhY2s9ZmFsc2U7XG5cdFx0XHRcdGNvbnRleHQ9ZmFsc2U7XG5cdFx0XHRcdGlmKG9ialsndDJkJ10pIHZhbHVlPW9ialsndDJkJ10odmFsdWUpO1xuXHRcdFx0XHRjYWxsZnVuYy5jYWxsKGN0eCxuYW1lLHZhbHVlKTtcblx0XHRcdH19KTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yKHZhciBpIGluIHRoaXMuc2Zvcm0pe1xuXHRcdFx0b2JqPXRoaXMuc2Zvcm1baV07XG5cdFx0XHRpZihvYmouZWRpdGFibGUpe1xuXHRcdFx0XHRpZihvYmoudHlwZT09PSd0ZXh0Jyl7XG5cdFx0XHRcdFx0ZWxlbXNbaV09JCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJjb250ZW50LWVkaXRcIj4nKTtcblx0XHRcdFx0XHRiaW5kVGV4dEV2ZW50cyhlbGVtc1tpXSxvYmosaSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZihvYmoudHlwZT09PSdkYXRlJyl7XG5cdFx0XHRcdFx0ZWxlbXNbaV09JCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJjb250ZW50LWVkaXRcIj4nKTtcblx0XHRcdFx0XHRiaW5kRGF0ZUV2ZW50cyhlbGVtc1tpXSxvYmosaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcblx0XHR9XG5cdFx0Ly9jb25zb2xlLmxvZyhlbGVtcyk7XG5cdFx0b2JqPW51bGw7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGZpZWxkLG1vZGVsLGNhbGxmdW5jLGN0eCl7XG5cdFx0XHRjYWxsYmFjaz1jYWxsZnVuYztcblx0XHRcdGNvbnRleHQ9Y3R4O1xuXHRcdFx0dmFyIGVsZW1lbnQ9ZWxlbXNbZmllbGRdLHZhbHVlPW1vZGVsLmdldChmaWVsZCk7XG5cdFx0XHRpZih0aGlzLnNmb3JtW2ZpZWxkXS5kMnQpICB2YWx1ZT10aGlzLnNmb3JtW2ZpZWxkXS5kMnQodmFsdWUsbW9kZWwpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhlbGVtZW50KTtcblx0XHRcdGVsZW1lbnQudmFsKHZhbHVlKTtcblx0XHRcdHJldHVybiBlbGVtZW50O1xuXHRcdH1cblx0XG5cdH0sXG5cdGNvbkRUb1Q6KGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGRUb1RleHQ9e1xuXHRcdFx0J3N0YXJ0JzpmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygnZGQvTU0veXl5eScpXG5cdFx0XHR9LFxuXHRcdFx0J2VuZCc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUudG9TdHJpbmcoJ2RkL01NL3l5eXknKVxuXHRcdFx0fSxcblx0XHRcdCdkdXJhdGlvbic6ZnVuY3Rpb24odmFsdWUsbW9kZWwpe1xuXHRcdFx0XHRyZXR1cm4gRGF0ZS5kYXlzZGlmZihtb2RlbC5zdGFydCxtb2RlbC5lbmQpKycgZCc7XG5cdFx0XHR9LFxuXHRcdFx0J3N0YXR1cyc6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHR2YXIgc3RhdHVzZXM9e1xuXHRcdFx0XHRcdCcxMTAnOidjb21wbGV0ZScsXG5cdFx0XHRcdFx0JzEwOSc6J29wZW4nLFxuXHRcdFx0XHRcdCcxMDgnIDogJ3JlYWR5J1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzdGF0dXNlc1t2YWx1ZV07XG5cdFx0XHR9XG5cdFx0XG5cdFx0fVxuXHRcdHJldHVybiBmdW5jdGlvbihmaWVsZCx2YWx1ZSxtb2RlbCl7XG5cdFx0XHRyZXR1cm4gZFRvVGV4dFtmaWVsZF0/ZFRvVGV4dFtmaWVsZF0odmFsdWUsbW9kZWwpOnZhbHVlO1xuXHRcdH1cblx0fSgpKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ01vZGVsO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy91dGlsJyk7XHJccnZhciBUYXNrTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyICAgIGRlZmF1bHRzOiB7XHIgICAgICAgIG5hbWU6ICdOZXcgdGFzaycsXHIgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcciAgICAgICAgY29tcGxldGU6IDAsXHIgICAgICAgIGFjdGlvbjogJycsXHIgICAgICAgIHNvcnRpbmRleDogMCxcciAgICAgICAgZGVwZW5kZW5jeTonJyxcciAgICAgICAgcmVzb3VyY2VzOiB7fSxcciAgICAgICAgc3RhdHVzOiAxMTAsXHIgICAgICAgIGhlYWx0aDogMjEsXHIgICAgICAgIHN0YXJ0OiAnJyxcciAgICAgICAgZW5kOiAnJyxcciAgICAgICAgY29sb3I6JyMwMDkwZDMnLFxyICAgICAgICBhVHlwZTogJycsXHIgICAgICAgIHJlcG9ydGFibGU6ICcnLFxyICAgICAgICBwYXJlbnRpZDogMFxyICAgIH0sXHIgICAgaW5pdGlhbGl6ZSA6IGZ1bmN0aW9uKCkge1xyICAgICAgICBcInVzZSBzdHJpY3RcIjtcciAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XHIgICAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jaGlsZHJlbiwgJ2NoYW5nZTpwYXJlbnRpZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnJlbW92ZShjaGlsZCk7XHIgICAgICAgIH0pO1xyICAgICAgICB0aGlzLmxpc3RlblRvKHRoaXMuY2hpbGRyZW4sICdhZGQgcmVtb3ZlIGNoYW5nZTpzdGFydCBjaGFuZ2U6ZW5kJywgdGhpcy5fY2hlY2tUaW1lKTtcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHIgICAgICAgICAgICAgICAgY2hpbGQuZGVzdHJveSgpO1xyICAgICAgICAgICAgfSk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHIgICAgICAgIGlmKF8uaXNTdHJpbmcocmVzcG9uc2Uuc3RhcnQpKXtcciAgICAgICAgICAgIHJlc3BvbnNlLnN0YXJ0ID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2Uuc3RhcnQpLCdkZC9NTS95eXl5JykgfHxcciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUocmVzcG9uc2Uuc3RhcnQpO1xyICAgICAgICB9IGVsc2Uge1xyICAgICAgICAgICAgcmVzcG9uc2Uuc3RhcnQgPSBuZXcgRGF0ZSgpO1xyICAgICAgICB9XHIgICAgICAgIFxyICAgICAgICBpZihfLmlzU3RyaW5nKHJlc3BvbnNlLmVuZCkpe1xyICAgICAgICAgICAgcmVzcG9uc2UuZW5kID0gRGF0ZS5wYXJzZUV4YWN0KHV0aWwuY29ycmVjdGRhdGUocmVzcG9uc2UuZW5kKSwnZGQvTU0veXl5eScpIHx8XHIgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShyZXNwb25zZS5lbmQpO1xyICAgICAgICB9IGVsc2Uge1xyICAgICAgICAgICAgcmVzcG9uc2UuZW5kID0gbmV3IERhdGUoKTtcciAgICAgICAgfVxyICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHIgICAgfSxcciAgICBfY2hlY2tUaW1lIDogZnVuY3Rpb24oKSB7XHIgICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xyICAgICAgICAgICAgcmV0dXJuO1xyICAgICAgICB9XHIgICAgICAgIHZhciBzdGFydFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnc3RhcnQnKTtcciAgICAgICAgdmFyIGVuZFRpbWUgPSB0aGlzLmNoaWxkcmVuLmF0KDApLmdldCgnZW5kJyk7XHIgICAgICAgIHRoaXMuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihjaGlsZCkge1xyICAgICAgICAgICAgdmFyIGNoaWxkU3RhcnRUaW1lID0gY2hpbGQuZ2V0KCdzdGFydCcpO1xyICAgICAgICAgICAgdmFyIGNoaWxkRW5kVGltZSA9IGNoaWxkLmdldCgnZW5kJyk7XHIgICAgICAgICAgICBpZihjaGlsZFN0YXJ0VGltZS5jb21wYXJlVG8oc3RhcnRUaW1lKSA9PT0gLTEpIHtcciAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBjaGlsZFN0YXJ0VGltZTtcciAgICAgICAgICAgIH1cciAgICAgICAgICAgIGlmKGNoaWxkRW5kVGltZS5jb21wYXJlVG8oZW5kVGltZSkgPT09IDEpe1xyICAgICAgICAgICAgICAgIGVuZFRpbWUgPSBjaGlsZEVuZFRpbWU7XHIgICAgICAgICAgICB9XHIgICAgICAgIH0uYmluZCh0aGlzKSk7XHIgICAgICAgIHRoaXMuc2V0KCdzdGFydCcsIHN0YXJ0VGltZSk7XHIgICAgICAgIHRoaXMuc2V0KCdlbmQnLCBlbmRUaW1lKTtcciAgICB9XHJ9KTtcclxybW9kdWxlLmV4cG9ydHMgPSBUYXNrTW9kZWw7XHIiLCJ2YXIgbW9udGhzQ29kZT1bJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuXG5tb2R1bGUuZXhwb3J0cy5jb3JyZWN0ZGF0ZSA9IGZ1bmN0aW9uKHN0cikge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHN0cjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZvcm1hdGRhdGEgPSBmdW5jdGlvbih2YWwsIHR5cGUpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmICh0eXBlID09PSAnbScpIHtcblx0XHRyZXR1cm4gbW9udGhzQ29kZVt2YWxdO1xuXHR9XG5cdHJldHVybiB2YWw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5oZnVuYyA9IGZ1bmN0aW9uKHBvcykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0cmV0dXJuIHtcblx0XHR4OiBwb3MueCxcblx0XHR5OiB0aGlzLmdldEFic29sdXRlUG9zaXRpb24oKS55XG5cdH07XG59OyIsInZhciBDb250ZXh0TWVudVZpZXcgPSByZXF1aXJlKCcuL3NpZGVCYXIvQ29udGV4dE1lbnVWaWV3Jyk7XHJ2YXIgVGFza1ZpZXcgPSByZXF1aXJlKCcuL3NpZGVCYXIvVGFza1ZpZXcnKTtccnZhciBLQ2FudmFzVmlldyA9IHJlcXVpcmUoJy4vY2FudmFzL0tDYW52YXNWaWV3Jyk7XHJccnZhciBHYW50dFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHIgICAgZWw6ICcuR2FudHQnLFxyICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKHBhcmFtcykge1xyICAgICAgICB0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XHIgICAgICAgIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy50YXNrLWNvbnRhaW5lcicpO1xyICAgICAgICB0aGlzLiRzdWJtaXRCdXR0b24gPSB0aGlzLiRlbC5maW5kKCcjc3VibWl0RnJvbScpO1xyICAgICAgICB0aGlzLiRzdWJtaXRCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyICAgICAgICAgICAgdGhpcy5zdWJtaXRGb3JtKGUpO1xyICAgICAgICB9LmJpbmQodGhpcykpO1xyICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwiZW5kXCJdLGlucHV0W25hbWU9XCJzdGFydFwiXScpLm9uKCdjaGFuZ2UnLCB0aGlzLmNhbGN1bGF0ZUR1cmF0aW9uKTtcciAgICAgICAgdGhpcy4kbWVudUNvbnRhaW5lciA9IHRoaXMuJGVsLmZpbmQoJy5tZW51LWNvbnRhaW5lcicpO1xyICAgICAgICB0aGlzLm1ha2VTb3J0YWJsZSgpO1xyICAgICAgICB0aGlzLmRlZmluZUNvbnRleHRNZW51KCk7XHJcciAgICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdzb3J0ZWQgYWRkJywgZnVuY3Rpb24oKSB7XHIgICAgICAgICAgICB0aGlzLiRjb250YWluZXIuZW1wdHkoKTtcciAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgbWFrZVNvcnRhYmxlOiBmdW5jdGlvbigpIHtcciAgICAgICAgdGhpcy4kY29udGFpbmVyLnNvcnRhYmxlKHtcciAgICAgICAgICAgIGdyb3VwOiAnc29ydGFibGUnLFxyICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3IgOiAnb2wnLFxyICAgICAgICAgICAgaXRlbVNlbGVjdG9yIDogJy5kcmFnLWl0ZW0nLFxyICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXIgc29ydC1wbGFjZWhvbGRlclwiLz4nLFxyICAgICAgICAgICAgb25EcmFnIDogZnVuY3Rpb24oJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KSB7XHIgICAgICAgICAgICAgICAgdmFyICRwbGFjZWhvbGRlciA9ICQoJy5zb3J0LXBsYWNlaG9sZGVyJyk7XHIgICAgICAgICAgICAgICAgdmFyIGlzU3ViVGFzayA9ICEkKCRwbGFjZWhvbGRlci5wYXJlbnQoKSkuaGFzQ2xhc3MoJ3Rhc2stY29udGFpbmVyJyk7XHIgICAgICAgICAgICAgICAgJHBsYWNlaG9sZGVyLmNzcyh7XHIgICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnIDogaXNTdWJUYXNrID8gJzMwcHgnIDogJzAnXHIgICAgICAgICAgICAgICAgfSk7XHIgICAgICAgICAgICAgICAgX3N1cGVyKCRpdGVtLCBwb3NpdGlvbiwgX3N1cGVyLCBldmVudCk7XHIgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLiRjb250YWluZXIuc29ydGFibGUoXCJzZXJpYWxpemVcIikuZ2V0KClbMF07XHIgICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmVudERhdGEpIHtcciAgICAgICAgICAgICAgICAgICAgcGFyZW50RGF0YS5jaGlsZHJlbiA9IHBhcmVudERhdGEuY2hpbGRyZW5bMF07XHIgICAgICAgICAgICAgICAgfSk7XHIgICAgICAgICAgICB9LmJpbmQodGhpcyksXHIgICAgICAgICAgICBvbkRyb3AgOiBmdW5jdGlvbigkaXRlbSwgcG9zaXRpb24sIF9zdXBlciwgZXZlbnQpIHtcciAgICAgICAgICAgICAgICBfc3VwZXIoJGl0ZW0sIHBvc2l0aW9uLCBfc3VwZXIsIGV2ZW50KTtcciAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuJGNvbnRhaW5lci5zb3J0YWJsZShcInNlcmlhbGl6ZVwiKS5nZXQoKVswXTtcciAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24ocGFyZW50RGF0YSkge1xyICAgICAgICAgICAgICAgICAgICBwYXJlbnREYXRhLmNoaWxkcmVuID0gcGFyZW50RGF0YS5jaGlsZHJlblswXTtcciAgICAgICAgICAgICAgICB9KTtcciAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24ucmVzb3J0KGRhdGEpO1xyICAgICAgICAgICAgfS5iaW5kKHRoaXMpXHIgICAgICAgIH0pO1xyICAgIH0sXHIgICAgZXZlbnRzOiB7XHIgICAgICAgICdjbGljayAjdEhhbmRsZSc6ICdleHBhbmQnLFxyICAgICAgICAnZGJsY2xpY2sgLnN1Yi10YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcciAgICAgICAgJ2RibGNsaWNrIC50YXNrJzogJ2hhbmRsZXJvd2NsaWNrJyxcciAgICAgICAgJ2hvdmVyIC5zdWItdGFzayc6ICdzaG93TWFzaycsXHIgICAgICAgICdjbGljayAuaGVhZC1iYXIgYnV0dG9uJzogJ2hhbmRidXR0b25jbGljaycsXHIgICAgICAgICdjbGljayAubmV3LXRhc2snOiAnb3BlbkZvcm0nLFxyICAgICAgICAnY2xpY2sgYVtocmVmPVwiLyMhL2dlbmVyYXRlL1wiXSc6ICdnZW5lcmF0ZVBkZidcciAgICB9LFxyICAgIGRlZmluZUNvbnRleHRNZW51OiBmdW5jdGlvbigpe1xyICAgICAgICB2YXIgY29udGV4dFZpZXcgPSBuZXcgQ29udGV4dE1lbnVWaWV3KHRoaXMuYXBwKTtcciAgICAgICAgY29udGV4dFZpZXcucmVuZGVyKCk7XHIgICAgfSxcciAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbih0YXNrKSB7XHIgICAgICAgICAgICBpZiAodGFzay5nZXQoJ3BhcmVudGlkJykudG9TdHJpbmcoKSA9PT0gJzAnKSB7XHIgICAgICAgICAgICAgICAgdGhpcy5hZGRUYXNrKHRhc2spO1xyICAgICAgICAgICAgfVxyICAgICAgICB9LCB0aGlzKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3ID0gbmV3IEtDYW52YXNWaWV3KHtcciAgICAgICAgICAgIGFwcCA6IHRoaXMuYXBwLFxyICAgICAgICAgICAgY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvblxyICAgICAgICB9KS5yZW5kZXIoKTtcciAgICAgICAgdGhpcy5tYWtlU29ydGFibGUoKTtcciAgICB9LFxyICAgIGhhbmRsZXJvd2NsaWNrOiBmdW5jdGlvbihldnQpIHtcciAgICAgICAgdmFyIGlkID0gZXZ0LmN1cnJlbnRUYXJnZXQuaWQ7XHIgICAgICAgIHRoaXMuYXBwLnRhc2tzLmdldChpZCkudHJpZ2dlcignZWRpdHJvdycsIGV2dCk7XHIgICAgfSxcciAgICBoYW5kYnV0dG9uY2xpY2s6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgYnV0dG9uID0gJChldnQuY3VycmVudFRhcmdldCk7XHIgICAgICAgIHZhciBhY3Rpb24gPSBidXR0b24uZGF0YSgnYWN0aW9uJyk7XHIgICAgICAgIHZhciBpbnRlcnZhbCA9IGFjdGlvbi5zcGxpdCgnLScpWzFdO1xyICAgICAgICB0aGlzLmFwcC5zZXR0aW5nLnNldCgnaW50ZXJ2YWwnLCBpbnRlcnZhbCk7XHIgICAgfSxcciAgICBnZW5lcmF0ZVBkZjogZnVuY3Rpb24oZXZ0KXtcciAgICAgICAgd2luZG93LnByaW50KCk7XHIgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyICAgIH0sXHIgICAgY2FsY3VsYXRlRHVyYXRpb246IGZ1bmN0aW9uKCl7XHJcciAgICAgICAgLy8gQ2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uIGZyb20gc3RhcnQgYW5kIGVuZCBkYXRlXHIgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZSgkKGRvY3VtZW50KS5maW5kKCdpbnB1dFtuYW1lPVwic3RhcnRcIl0nKS52YWwoKSk7XHIgICAgICAgIHZhciBlbmRkYXRlID0gbmV3IERhdGUoJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImVuZFwiXScpLnZhbCgpKTtcciAgICAgICAgdmFyIF9NU19QRVJfREFZID0gMTAwMCAqIDYwICogNjAgKiAyNDtcciAgICAgICAgaWYoc3RhcnRkYXRlICE9PSBcIlwiICYmIGVuZGRhdGUgIT09IFwiXCIpe1xyICAgICAgICAgICAgdmFyIHV0YzEgPSBEYXRlLlVUQyhzdGFydGRhdGUuZ2V0RnVsbFllYXIoKSwgc3RhcnRkYXRlLmdldE1vbnRoKCksIHN0YXJ0ZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgdmFyIHV0YzIgPSBEYXRlLlVUQyhlbmRkYXRlLmdldEZ1bGxZZWFyKCksIGVuZGRhdGUuZ2V0TW9udGgoKSwgZW5kZGF0ZS5nZXREYXRlKCkpO1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoKHV0YzIgLSB1dGMxKSAvIF9NU19QRVJfREFZKSk7XHIgICAgICAgIH1lbHNle1xyICAgICAgICAgICAgJChkb2N1bWVudCkuZmluZCgnaW5wdXRbbmFtZT1cImR1cmF0aW9uXCJdJykudmFsKE1hdGguZmxvb3IoMCkpO1xyICAgICAgICB9XHIgICAgfSxcciAgICBleHBhbmQ6IGZ1bmN0aW9uKGV2dCkge1xyICAgICAgICB2YXIgdGFyZ2V0ID0gJChldnQudGFyZ2V0KTtcciAgICAgICAgdmFyIHdpZHRoID0gMDtcciAgICAgICAgdmFyIHNldHRpbmcgPSB0aGlzLmFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2Rpc3BsYXknKTtcciAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygnY29udHJhY3QnKSkge1xyICAgICAgICAgICAgd2lkdGggPSBzZXR0aW5nLnRIaWRkZW5XaWR0aDtcciAgICAgICAgfVxyICAgICAgICBlbHNlIHtcciAgICAgICAgICAgIHdpZHRoID0gc2V0dGluZy50YWJsZVdpZHRoO1xyICAgICAgICB9XHIgICAgICAgIHRoaXMuJG1lbnVDb250YWluZXIuY3NzKCd3aWR0aCcsIHdpZHRoKTtcciAgICAgICAgdGhpcy5jYW52YXNWaWV3LnNldFdpZHRoKHNldHRpbmcuc2NyZWVuV2lkdGggLSB3aWR0aCAtIDIwKTtcciAgICAgICAgdGFyZ2V0LnRvZ2dsZUNsYXNzKCdjb250cmFjdCcpO1xyICAgICAgICB0aGlzLiRtZW51Q29udGFpbmVyLmZpbmQoJy5tZW51LWhlYWRlcicpLnRvZ2dsZUNsYXNzKCdtZW51LWhlYWRlci1vcGVuZWQnKTtcclxyICAgIH0sXHIgICAgb3BlbkZvcm06IGZ1bmN0aW9uKCkge1xyICAgICAgICAkKCcudWkuYWRkLW5ldy10YXNrJykubW9kYWwoJ3NldHRpbmcnLCAndHJhbnNpdGlvbicsICd2ZXJ0aWNhbCBmbGlwJylcciAgICAgICAgLm1vZGFsKCdzaG93JylcciAgICAgICAgO1xyICAgIH0sXHIgICAgYWRkVGFzazogZnVuY3Rpb24odGFzaykge1xyICAgICAgICB2YXIgdGFza1ZpZXcgPSBuZXcgVGFza1ZpZXcoe21vZGVsOiB0YXNrLCBhcHAgOiB0aGlzLmFwcH0pO1xyICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRhc2tWaWV3LnJlbmRlcigpLmVsKTtcciAgICB9LFxyICAgIHN1Ym1pdEZvcm06IGZ1bmN0aW9uKGUpIHtcciAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXHIgICAgICAgIHZhciBmb3JtID0gJChcIiNuZXctdGFzay1mb3JtXCIpO1xyICAgICAgICB2YXIgZGF0YSA9IHt9O1xyICAgICAgICAkKGZvcm0pLnNlcmlhbGl6ZUFycmF5KCkuZm9yRWFjaChmdW5jdGlvbihpbnB1dCkge1xyICAgICAgICAgICAgZGF0YVtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xyICAgICAgICB9KTtcclxyICAgICAgICB2YXIgc29ydGluZGV4ID0gMDtcciAgICAgICAgdmFyIHJlZl9tb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChkYXRhLnJlZmVyZW5jZV9pZCk7XHIgICAgICAgIGlmIChyZWZfbW9kZWwpIHtcciAgICAgICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGRhdGEuaW5zZXJ0UG9zID09PSAnYWJvdmUnID8gLTAuNSA6IDAuNSlcciAgICAgICAgfSBlbHNlIHtcciAgICAgICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmFwcC50YXNrcy5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyICAgICAgICB9XHIgICAgICAgIGRhdGEuc29ydGluZGV4ID0gc29ydGluZGV4O1xyICAgICAgICBkYXRhLmlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpO1xyICAgICAgICB2YXIgdGFzayA9IHRoaXMuYXBwLnRhc2tzLmFkZChkYXRhLCB7cGFyc2UgOiB0cnVlfSk7XHIgICAgICAgIHRhc2suc2F2ZSgpO1xyXHIgICAgICAgICQoJy51aS5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHIgICAgfVxyfSk7XHJccm1vZHVsZS5leHBvcnRzID0gR2FudHRWaWV3O1xyIiwiXHR2YXIgZGQ9S2luZXRpYy5ERDtcblx0dmFyIGJhck9wdGlvbnM9WydkcmFnZ2FibGUnLCdkcmFnQm91bmRGdW5jJywncmVzaXphYmxlJywncmVzaXplQm91bmRGdW5jJywnaGVpZ2h0Jywnd2lkdGgnLCd4JywneSddO1xuXG5cdHZhciBjYWxjdWxhdGluZz1mYWxzZTtcblx0ZnVuY3Rpb24gY3JlYXRlSGFuZGxlKG9wdGlvbil7XG5cdFx0b3B0aW9uLmRyYWdnYWJsZT10cnVlO1xuXHRcdG9wdGlvbi5vcGFjaXR5PTE7XG5cdFx0b3B0aW9uLnN0cm9rZUVuYWJsZWQ9ZmFsc2U7XG5cdFx0b3B0aW9uLndpZHRoPTI7XG5cdFx0b3B0aW9uLmZpbGw9J2JsYWNrJztcblx0XHRyZXR1cm4gbmV3IEtpbmV0aWMuUmVjdChvcHRpb24pO1xuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZVN1Ykdyb3VwKG9wdGlvbil7XG5cdFx0dmFyIGdyPW5ldyBLaW5ldGljLkdyb3VwKCk7XG5cdFx0dmFyIGltZ3JlY3Q9bmV3IEtpbmV0aWMuUmVjdCh7XG5cdFx0XHR4OjAsXG5cdFx0XHR5OjAsXG5cdFx0XHRoZWlnaHQ6IG9wdGlvbi5oZWlnaHQsXG5cdFx0XHR3aWR0aDogMjAsXG5cdFx0XHRzdHJva2VFbmFibGVkOmZhbHNlLFxuXHRcdFx0ZmlsbDoneWVsbG93Jyxcblx0XHRcdG9wYWNpdHk6MC41XG5cdFx0fSk7XG5cdFx0dmFyIGFuY2hvcj1uZXcgS2luZXRpYy5DaXJjbGUoe1xuXHRcdFx0eDoxMCxcblx0XHRcdHk6NSxcblx0XHRcdHJhZGl1czogMyxcblx0XHRcdHN0cm9rZVdpZHRoOjEsXG5cdFx0XHRuYW1lOiAnYW5jaG9yJyxcblx0XHRcdHN0cm9rZTonYmxhY2snLFxuXHRcdFx0ZmlsbDond2hpdGUnLFxuXHRcdH0pXG5cblx0XHR2YXIgbmFtZXJlY3Q9bmV3IEtpbmV0aWMuUmVjdCh7XG5cdFx0XHR4OjIwLFxuXHRcdFx0eTowLFxuXHRcdFx0aGVpZ2h0OiBvcHRpb24uaGVpZ2h0LFxuXHRcdFx0d2lkdGg6IDQwLFxuXHRcdFx0c3Ryb2tlRW5hYmxlZDpmYWxzZSxcblx0XHRcdGZpbGw6J3BpbmsnLFxuXHRcdH0pO1xuXHRcdGdyLmFkZChpbWdyZWN0KTtcblx0XHRnci5hZGQoYW5jaG9yKTtcblx0XHRnci5hZGQobmFtZXJlY3QpO1xuXHRcdHJldHVybiBncjtcblx0fVxuXG5cdHZhciBiZWZvcmViaW5kPWZ1bmN0aW9uKGZ1bmMpe1xuXHRcdHJldHVybiBmdW5jdGlvbigpe1xuXHRcdFx0aWYoY2FsY3VsYXRpbmcpIHJldHVybiBmYWxzZTtcblx0XHRcdGNhbGN1bGF0aW5nPXRydWU7XG5cdFx0XHRmdW5jLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcblx0XHRcdGNhbGN1bGF0aW5nPWZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdldERyYWdEaXIoc3RhZ2Upe1xuXHRcdHJldHVybiAoc3RhZ2UuZ2V0UG9pbnRlclBvc2l0aW9uKCkueC1kZC5zdGFydFBvaW50ZXJQb3MueD4wKT8ncmlnaHQnOidsZWZ0Jztcblx0fVxuXG5cdHZhciBCYXI9ZnVuY3Rpb24ob3B0aW9ucyl7XG5cdFx0dGhpcy5tb2RlbD1vcHRpb25zLm1vZGVsO1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBvcHRpb25zLnNldHRpbmdzO1xuXG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCAnY2hhbmdlOmNvbXBsZXRlJywgdGhpcy5fdXBkYXRlQ29tcGxldGVCYXIpO1xuXHRcdFxuXHRcdHZhciBzZXR0aW5nID0gdGhpcy5zZXR0aW5nID0gdGhpcy5zZXR0aW5ncy5nZXRTZXR0aW5nKCdiYXInKTtcblx0XHQvL3RoaXMuYmFyaWQgPSBfLnVuaXF1ZUlkKCdiJyk7XG5cdFx0dGhpcy5zdWJncm91cG9wdGlvbnM9e1xuXHRcdFx0c2hvd09uSG92ZXI6IHRydWUsXG5cdFx0XHRoaWRlT25Ib3Zlck91dDp0cnVlLFxuXHRcdFx0aGFzU3ViR3JvdXA6IGZhbHNlLFxuXHRcdH07XG5cdFx0XG5cdFx0dGhpcy5kZXBlbmRhbnRzPVtdO1xuXHRcdHRoaXMuZGVwZW5kZW5jaWVzPVtdO1xuXHRcdFxuXHRcdC8qdmFyIG9wdGlvbj17XG5cdFx0XHR4IDogcmVjdG9wdGlvbnMueCxcblx0XHRcdHk6IHJlY3RvcHRpb25zLnlcblx0XHR9XG5cdFx0cmVjdG9wdGlvbnMueD0wO1xuXHRcdHJlY3RvcHRpb25zLnk9MDtcblx0XHRyZWN0b3B0aW9ucy5uYW1lPSdtYWluYmFyJzsqL1xuXG5cdFx0Ly8gY29sb3Jpbmcgc2VjdGlvblxuXHRcdHZhciBwYXJlbnRNb2RlbCA9IHRoaXMubW9kZWwuY29sbGVjdGlvbi5nZXQodGhpcy5tb2RlbC5nZXQoJ3BhcmVudGlkJykpO1xuXHRcdHRoaXMuc2V0dGluZy5yZWN0b3B0aW9uLmZpbGwgPSBwYXJlbnRNb2RlbC5nZXQoJ2xpZ2h0Y29sb3InKTtcdFx0XG5cdFx0dGhpcy5ncm91cD1uZXcgS2luZXRpYy5Hcm91cCh0aGlzLmdldEdyb3VwUGFyYW1zKCkpO1xuXHRcdC8vcmVtb3ZlIHRoZSBzdHJva2VFbmFibGVkIGlmIG5vdCBwcm92aWRlZCBpbiBvcHRpb25cblx0XHQvL3JlY3RvcHRpb25zLnN0cm9rZUVuYWJsZWQ9ZmFsc2U7XG5cblx0XHR2YXIgcmVjdCA9IHRoaXMucmVjdCAgPW5ldyBLaW5ldGljLlJlY3QodGhpcy5nZXRSZWN0cGFyYW1zKCkpO1xuXHRcdHRoaXMuZ3JvdXAuYWRkKHJlY3QpO1xuXHRcdFxuXHRcdGlmKHNldHRpbmcuc3ViZ3JvdXApe1xuXHRcdFx0dGhpcy5hZGRTdWJncm91cCgpO1xuXHRcdH1cblx0XHRcblx0XHRpZihzZXR0aW5nLmRyYWdnYWJsZSl7XG5cdFx0XHR0aGlzLm1ha2VEcmFnZ2FibGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYoc2V0dGluZy5yZXNpemFibGUpe1xuXHRcdFx0dGhpcy5tYWtlUmVzaXphYmxlKCk7XG5cdFx0fVxuXG5cdFx0dmFyIGxlZnR4PXRoaXMubGVmdEhhbmRsZS5nZXRYKCk7XG5cdFx0dmFyIHc9dGhpcy5yaWdodEhhbmRsZS5nZXRYKCktbGVmdHgrMjtcblx0XHR2YXIgd2lkdGggPSAoICggdyApICogKHRoaXMubW9kZWwuZ2V0KCdjb21wbGV0ZScpIC8gMTAwKSApO1xuXHRcdHRoaXMuc2V0dGluZy5yZWN0b3B0aW9uLmZpbGwgPSBwYXJlbnRNb2RlbC5nZXQoJ2Rhcmtjb2xvcicpO1xuXHRcdG9wdCA9ICB0aGlzLmdldFJlY3RwYXJhbXMoKTtcblx0XHRvcHQueCA9IDI7XG5cdFx0b3B0LndpZHRoID0gd2lkdGgtNDtcblx0XHRpZih3aWR0aCA+IDApe1xuXHRcdFx0dmFyIGNvbXBsZXRlQmFyPSB0aGlzLmNvbXBsZXRlQmFyID0gbmV3IEtpbmV0aWMuUmVjdChvcHQpO1xuXHRcdFx0dGhpcy5ncm91cC5hZGQoY29tcGxldGVCYXIpO1xuXHRcdH1cblx0XHRcblx0XHQvL2FkZEV2ZW50c1xuXHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHRcdC8vdGhpcy5vbigncmVzaXplIG1vdmUnLHRoaXMucmVuZGVyQ29ubmVjdG9ycyx0aGlzKTs7XG5cdH07XG5cblx0QmFyLnByb3RvdHlwZT17XG5cdFx0X3VwZGF0ZUNvbXBsZXRlQmFyIDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbGVmdHg9dGhpcy5sZWZ0SGFuZGxlLmdldFgoKTtcblx0XHRcdHZhciB3ID0gdGhpcy5yaWdodEhhbmRsZS5nZXRYKCkgLSBsZWZ0eCsyO1xuXHRcdFx0dmFyIHdpZHRoID0gKCAoIHcgKSAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCkgKSAtIDQ7XG5cblx0XHRcdGlmKHdpZHRoID4gMCl7XG5cdFx0XHRcdHRoaXMuY29tcGxldGVCYXIud2lkdGgod2lkdGgpO1xuXHRcdFx0XHR0aGlzLmNvbXBsZXRlQmFyLmdldExheWVyKCkuYmF0Y2hEcmF3KCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvL3JldHJpZXZlcyBvbmx5IHdpZHRoLGhlaWdodCx4LHkgcmVsYXRpdmUgdG8gcG9pbnQgMCwwIG9uIGNhbnZhcztcblx0XHRnZXRYMTogZnVuY3Rpb24oYWJzb2x1dGUpe1xuXHRcdFx0dmFyIHJldHZhbD0wO1xuXHRcdFx0aWYoYWJzb2x1dGUgJiYgdGhpcy5wYXJlbnQpIHJldHZhbD10aGlzLnBhcmVudC5nZXRYKCk7XG5cdFx0XHRyZXR1cm4gcmV0dmFsK3RoaXMuZ3JvdXAuZ2V0WCgpO1xuXHRcdH0sXG5cdFx0Z2V0WDI6IGZ1bmN0aW9uKGFic29sdXRlKXtcblx0XHRcdHJldHVybiB0aGlzLmdldFgxKGFic29sdXRlKSt0aGlzLmdldFdpZHRoKCk7XG5cdFx0fSxcblx0XHRnZXRYOmZ1bmN0aW9uKGFic29sdXRlKXtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHRoaXMuZ2V0WDEoYWJzb2x1dGUpLFxuXHRcdFx0XHR5OiB0aGlzLmdldFgyKGFic29sdXRlKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGdldFk6IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy5ncm91cC5nZXRZKCk7XG5cdFx0fSxcblx0XHRnZXRIZWlnaHQ6IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy5yZWN0LmdldEhlaWdodCgpO1xuXHRcdH0sXG5cdFx0Z2V0V2lkdGg6IGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy5yZWN0LmdldFdpZHRoKCk7XG5cdFx0fSxcblx0XHRcblx0XHRzZXRYMTpmdW5jdGlvbih2YWx1ZSxvcHRpb25zKXtcblx0XHRcdCFvcHRpb25zICYmIChvcHRpb25zPXt9KVxuXHRcdFx0dmFyIHByZXZ4LHdpZHRoLGR4O1xuXG5cdFx0XHQvL2lmIHZhbHVlIGlzIGluIGFic29sdXRlIHNlbnNlIHRoZW4gbWFrZSBpdCByZWxhdGl2ZSB0byBwYXJlbnRcblx0XHRcdGlmKG9wdGlvbnMuYWJzb2x1dGUgJiYgdGhpcy5wYXJlbnQpe1xuXHRcdFx0XHR2YWx1ZT12YWx1ZS10aGlzLnBhcmVudC5nZXRYKHRydWUpO1xuXHRcdFx0fVxuXHRcdFx0cHJldng9dGhpcy5nZXRYMSgpO1xuXHRcdFx0Ly9keCArdmUgbWVhbnMgYmFyIG1vdmVkIGxlZnQgXG5cdFx0XHRkeD1wcmV2eC12YWx1ZTtcblx0XHRcdFxuXHRcdFx0dmFyIHNpbGVudD1vcHRpb25zLnNpbGVudCB8fCBvcHRpb25zLm9zYW1lO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm1vdmUoLTEqZHgsc2lsZW50KTtcblx0XHRcdC8vaWYgeDIgaGFzIHRvIHJlbWFpbiBzYW1lXG5cdFx0XHQvLyBEcmF3IHBlcmNlbnRhZ2UgY29tcGxldGVkXG5cdFx0XHRpZihvcHRpb25zLm9zYW1lKXtcblx0XHRcdFx0dGhpcy5yZWN0LnNldFdpZHRoKGR4K3RoaXMuZ2V0V2lkdGgoKSk7XG5cdFx0XHRcdHZhciB3aWR0aCA9KCB0aGlzLmdldFdpZHRoKCkgKiAodGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDApICktNDtcblx0XHRcdFx0aWYod2lkdGggPiAwKVxuXHRcdFx0XHRcdHRoaXMuY29tcGxldGVCYXIuc2V0V2lkdGgod2lkdGgpO1xuXHRcdFx0XHR0aGlzLnJlbmRlckhhbmRsZSgpO1xuXHRcdFx0XHRpZighb3B0aW9ucy5zaWxlbnQpe1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplbGVmdCcsdGhpcyk7XG5cdFx0XHRcdFx0dGhpcy50cmlnZ2VyKCdyZXNpemUnLHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlclBhcmVudCgncmVzaXplJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuZW5hYmxlU3ViZ3JvdXAoKTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0c2V0WDI6ZnVuY3Rpb24odmFsdWUsb3B0aW9ucyl7XG5cdFx0XHR2YXIgcHJldngsd2lkdGgsZHg7XG5cdFx0XHQvL2lmIHZhbHVlIGlzIGluIGFic29sdXRlIHNlbnNlIHRoZW4gbWFrZSBpdCByZWxhdGl2ZSB0byBwYXJlbnRcblx0XHRcdGlmKG9wdGlvbnMuYWJzb2x1dGUgJiYgdGhpcy5wYXJlbnQpe1xuXHRcdFx0XHR2YWx1ZT12YWx1ZS10aGlzLnBhcmVudC5nZXRYKHRydWUpO1xuXHRcdFx0fVxuXHRcdFx0cHJldng9dGhpcy5nZXRYMigpO1xuXHRcdFx0Ly9keCAtdmUgbWVhbnMgYmFyIG1vdmVkIHJpZ2h0IFxuXHRcdFx0ZHg9cHJldngtdmFsdWU7XG5cdFx0XHRcblx0XHRcdHZhciBzaWxlbnQ9b3B0aW9ucy5zaWxlbnQgfHwgb3B0aW9ucy5vc2FtZTtcblx0XHRcdC8vdGhpcy5ncm91cC5zZXRYKHZhbHVlKTtcblx0XHRcdC8vaWYgeDIgaGFzIHRvIHJlbWFpbiBzYW1lXG5cdFx0XHRpZihvcHRpb25zLm9zYW1lKXtcblx0XHRcdFx0dGhpcy5yZWN0LnNldFdpZHRoKHRoaXMuZ2V0V2lkdGgoKS1keCk7XG5cdFx0XHRcdHZhciB3aWR0aCA9KCB0aGlzLmdldFdpZHRoKCkgKiAodGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykgLyAxMDApICktNDtcblx0XHRcdFx0aWYod2lkdGggPiAwKVxuXHRcdFx0XHRcdHRoaXMuY29tcGxldGVCYXIuc2V0V2lkdGgod2lkdGgpO1xuXHRcdFx0XHR0aGlzLnJlbmRlckhhbmRsZSgpO1xuXHRcdFx0XHRpZighb3B0aW9ucy5zaWxlbnQpe1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplcmlnaHQnLHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcigncmVzaXplJyx0aGlzKTtcblx0XHRcdFx0XHR0aGlzLnRyaWdnZXJQYXJlbnQoJ3Jlc2l6ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHR0aGlzLm1vdmUoLTEqZHgsb3B0aW9ucy5zaWxlbnQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lbmFibGVTdWJncm91cCgpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRzZXRZOmZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdHRoaXMuZ3JvdXAuc2V0WSh2YWx1ZSk7XG5cdFx0fSxcblx0XHRzZXRQYXJlbnQ6ZnVuY3Rpb24ocGFyZW50KXtcblx0XHRcdHRoaXMucGFyZW50PXBhcmVudDtcblxuXHRcdH0sXG5cdFx0dHJpZ2dlclBhcmVudDpmdW5jdGlvbihldmVudE5hbWUpe1xuXHRcdFx0aWYodGhpcy5wYXJlbnQpe1xuXHRcdFx0XHR0aGlzLnBhcmVudC50cmlnZ2VyKGV2ZW50TmFtZSx0aGlzKTtcblx0XHRcdH1cdFx0XHRcblx0XHR9LFxuXHRcdGJpbmRFdmVudHM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdjbGljaycsXy5iaW5kKHRoaXMuaGFuZGxlQ2xpY2tldmVudHMsdGhpcykpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdtb3VzZW92ZXInLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKCF0aGF0LnN1Ymdyb3Vwb3B0aW9ucy5zaG93T25Ib3ZlcikgcmV0dXJuO1xuXHRcdFx0XHR0aGF0LnN1Ymdyb3VwLnNob3coKTtcblx0XHRcdFx0dGhpcy5nZXRMYXllcigpLmRyYXcoKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5ncm91cC5vbignbW91c2VvdXQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKCF0aGF0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dCkgcmV0dXJuO1xuXHRcdFx0XHR0aGF0LnN1Ymdyb3VwLmhpZGUoKTtcblx0XHRcdFx0dGhpcy5nZXRMYXllcigpLmRyYXcoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLm9uKCdyZXNpemUgbW92ZScsdGhpcy5yZW5kZXJDb25uZWN0b3JzLHRoaXMpO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCdjaGFuZ2UnLHRoaXMuaGFuZGxlQ2hhbmdlKTtcblx0XHRcdHRoaXMub24oJ2NoYW5nZScsIHRoaXMuaGFuZGxlQ2hhbmdlLHRoaXMpO1xuXG5cdFx0fSxcblx0XHRkZXN0cm95IDogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmdyb3VwLmRlc3Ryb3koKTtcblx0XHRcdHRoaXMuc3RvcExpc3RlbmluZygpO1xuXHRcdH0sXG5cdFx0aGFuZGxlQ2hhbmdlOmZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdoYW5kbGluZyBjaGFuZ2UnKTtcblx0XHRcdGlmKHRoaXMucGFyZW50LnN5bmNpbmcpe1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZygncmV0dXJuaW5nJyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYobW9kZWwuY2hhbmdlZC5zdGFydCB8fCBtb2RlbC5jaGFuZ2VkLmVuZCl7XG5cdFx0XHRcdHZhciB4PXRoaXMuY2FsY3VsYXRlWChtb2RlbCk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHgpO1xuXHRcdFx0XHRpZihtb2RlbC5jaGFuZ2VkLnN0YXJ0KXtcblx0XHRcdFx0XHR0aGlzLnNldFgxKHgueDEse29zYW1lOnRydWUsYWJzb2x1dGU6dHJ1ZX0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0dGhpcy5zZXRYMih4LngyLHtvc2FtZTp0cnVlLGFic29sdXRlOnRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnBhcmVudC5zeW5jKCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zb2xlLmxvZygnZHJhd2luZycpO1xuXHRcdFx0dGhpcy5kcmF3KCk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmUoKTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0aGFuZGxlQ2xpY2tldmVudHM6ZnVuY3Rpb24oZXZ0KXtcblx0XHRcdHZhciB0YXJnZXQsdGFyZ2V0TmFtZSxzdGFydEJhcjtcblx0XHRcdHRhcmdldD1ldnQudGFyZ2V0O1xuXHRcdFx0dGFyZ2V0TmFtZT10YXJnZXQuZ2V0TmFtZSgpO1xuXHRcdFx0d2luZG93LnN0YXJ0QmFyO1xuXHRcdFx0aWYodGFyZ2V0TmFtZSE9PSdtYWluYmFyJyl7XG5cdFx0XHRcdEJhci5kaXNhYmxlQ29ubmVjdG9yKCk7XG5cdFx0XHRcdGlmKHRhcmdldE5hbWU9PSdhbmNob3InKXtcblx0XHRcdFx0XHR0YXJnZXQuc3Ryb2tlKCdyZWQnKTtcblx0XHRcdFx0XHRCYXIuZW5hYmxlQ29ubmVjdG9yKHRoaXMpO1xuXHRcdFx0XHRcdHZhciBkZXB0ID0gdGhpcy5tb2RlbC5nZXQoJ2RlcGVuZGVuY3knKTtcblx0XHRcdFx0XHRpZihkZXB0ICE9IFwiXCIpe1xuXHRcdFx0XHRcdFx0d2luZG93LmN1cnJlbnREcHQucHVzaCh0aGlzLm1vZGVsLmdldCgnZGVwZW5kZW5jeScpKTtcdFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zb2xlLmxvZyh3aW5kb3cuY3VycmVudERwdCk7XG5cdFx0XHRcdFx0d2luZG93LnN0YXJ0QmFyID0gdGhpcy5tb2RlbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0aWYoKHN0YXJ0QmFyPUJhci5pc0Nvbm5lY3RvckVuYWJsZWQoKSkpe1xuXHRcdFx0XHRcdEJhci5jcmVhdGVSZWxhdGlvbihzdGFydEJhcix0aGlzKTtcblx0XHRcdFx0XHR3aW5kb3cuY3VycmVudERwdC5wdXNoKHRoaXMubW9kZWwuZ2V0KCdpZCcpKTtcblx0XHRcdFx0XHR3aW5kb3cuc3RhcnRCYXIuc2V0KCdkZXBlbmRlbmN5JywgSlNPTi5zdHJpbmdpZnkod2luZG93LmN1cnJlbnREcHQpKTtcblx0XHRcdFx0XHR3aW5kb3cuc3RhcnRCYXIuc2F2ZSgpO1xuXHRcdFx0XHRcdEJhci5kaXNhYmxlQ29ubmVjdG9yKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGV2dC5jYW5jZWxCdWJibGU9dHJ1ZTtcblx0XHR9LFxuXHRcdG1ha2VSZXNpemFibGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dGhpcy5yZXNpemFibGU9dHJ1ZTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZT1jcmVhdGVIYW5kbGUoe1xuXHRcdFx0XHR4OiAwLFxuXHRcdFx0XHR5OiAwLFxuXHRcdFx0XHRoZWlnaHQ6IHRoaXMuZ2V0SGVpZ2h0KCksXG5cdFx0XHRcdGRyYWdCb3VuZEZ1bmM6IHRoaXMuc2V0dGluZy5yZXNpemVCb3VuZEZ1bmMsXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGU9Y3JlYXRlSGFuZGxlKHtcblx0XHRcdFx0eDogdGhpcy5nZXRXaWR0aCgpLTIsXG5cdFx0XHRcdHk6IDAsXG5cdFx0XHRcdGhlaWdodDogdGhpcy5nZXRIZWlnaHQoKSxcblx0XHRcdFx0ZHJhZ0JvdW5kRnVuYzogdGhpcy5zZXR0aW5nLnJlc2l6ZUJvdW5kRnVuYyxcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZGlzYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5kaXNhYmxlU3ViZ3JvdXAoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQuZW5hYmxlU3ViZ3JvdXAoKTtcblx0XHRcdFx0dGhhdC5wYXJlbnQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLm9uKCdkcmFnZW5kJyxmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LmVuYWJsZVN1Ymdyb3VwKCk7XG5cdFx0XHRcdHRoYXQucGFyZW50LnN5bmMoKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ2RyYWdtb3ZlJyxiZWZvcmViaW5kKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQucmVuZGVyKCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplbGVmdCcsdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplJyx0aGF0KTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyUGFyZW50KCdyZXNpemUnKTtcblx0XHRcdH0pKTtcblx0XHRcdHRoaXMucmlnaHRIYW5kbGUub24oJ2RyYWdtb3ZlJyxiZWZvcmViaW5kKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoYXQucmVuZGVyKCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlcigncmVzaXplcmlnaHQnLHRoYXQpO1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ3Jlc2l6ZScsdGhhdCk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlclBhcmVudCgncmVzaXplJyk7XG5cdFx0XHR9KSk7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ21vdXNlb3ZlcicsdGhpcy5jaGFuZ2VSZXNpemVDdXJzb3IpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignbW91c2VvdmVyJyx0aGlzLmNoYW5nZVJlc2l6ZUN1cnNvcik7XG5cdFx0XHR0aGlzLmxlZnRIYW5kbGUub24oJ21vdXNlb3V0Jyx0aGlzLmNoYW5nZURlZmF1bHRDdXJzb3IpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5vbignbW91c2VvdXQnLHRoaXMuY2hhbmdlRGVmYXVsdEN1cnNvcik7XG5cdFx0XHRcblx0XHRcdHRoaXMuZ3JvdXAuYWRkKHRoaXMubGVmdEhhbmRsZSk7XG5cdFx0XHR0aGlzLmdyb3VwLmFkZCh0aGlzLnJpZ2h0SGFuZGxlKTtcblx0XHRcdFxuXHRcdFx0XG5cdFx0fSxcblx0XHRhZGRTdWJncm91cDpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5oYXNTdWJHcm91cD10cnVlO1xuXHRcdFx0dmFyIHN1Ymdyb3VwLHRoYXQ9dGhpcztcblx0XHRcdHN1Ymdyb3VwPXRoaXMuc3ViZ3JvdXA9Y3JlYXRlU3ViR3JvdXAoe2hlaWdodDp0aGlzLmdldEhlaWdodCgpfSk7XG5cdFx0XHRzdWJncm91cC5oaWRlKCk7XG5cdFx0XHRzdWJncm91cC5zZXRYKHRoaXMuZ2V0V2lkdGgoKSk7XG5cdFx0XHR0aGlzLmdyb3VwLmFkZChzdWJncm91cCk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0Ly90aGlzLmJpbmRBbmNob3IoKTtcblx0XHR9LFxuXHRcdGVuYWJsZVN1Ymdyb3VwOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnN1Ymdyb3Vwb3B0aW9ucy5zaG93T25Ib3Zlcj10cnVlO1xuXHRcdFx0dGhpcy5zdWJncm91cC5zZXRYKHRoaXMuZ2V0V2lkdGgoKSk7XG5cdFx0fSxcblx0XHRkaXNhYmxlU3ViZ3JvdXA6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuc3ViZ3JvdXBvcHRpb25zLnNob3dPbkhvdmVyPXRydWU7XG5cdFx0XHR0aGlzLnN1Ymdyb3VwLmhpZGUoKTtcblx0XHR9LFxuXHRcdFxuXHRcdGJpbmRBbmNob3I6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dmFyIGFuY2hvcj10aGlzLnN1Ymdyb3VwLmZpbmQoJy5hbmNob3InKTtcblx0XHRcdGFuY2hvci5vbignY2xpY2snLGZ1bmN0aW9uKGV2dCl7XG5cdFx0XHRcdGFuY2hvci5zdHJva2UoJ3JlZCcpO1xuXHRcdFx0XHR0aGF0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dD1mYWxzZTtcblx0XHRcdFx0S2luZXRpYy5Db25uZWN0LnN0YXJ0PXRoYXQ7XG5cdFx0XHRcdHRoaXMuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cdFx0XHRcdGV2dC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuXHRcdFx0fSk7XG5cblx0XHR9LFxuXHRcdFxuXHRcdG1ha2VEcmFnZ2FibGU6IGZ1bmN0aW9uKG9wdGlvbil7XG5cdFx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdFx0dGhpcy5ncm91cC5kcmFnZ2FibGUodHJ1ZSk7XG5cdFx0XHRpZih0aGlzLnNldHRpbmcuZHJhZ0JvdW5kRnVuYyl7XG5cdFx0XHRcdHRoaXMuZ3JvdXAuZHJhZ0JvdW5kRnVuYyh0aGlzLnNldHRpbmcuZHJhZ0JvdW5kRnVuYyk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyb3VwLm9uKCdkcmFnbW92ZScsYmVmb3JlYmluZChmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGF0LnRyaWdnZXIoJ21vdmUnK2dldERyYWdEaXIodGhpcy5nZXRTdGFnZSgpKSx0aGF0KTtcblx0XHRcdFx0dGhhdC50cmlnZ2VyKCdtb3ZlJyk7XG5cdFx0XHRcdHRoYXQudHJpZ2dlclBhcmVudCgnbW92ZScpO1xuXHRcdFx0fSkpO1xuXHRcdFx0dGhpcy5ncm91cC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5wYXJlbnQuc3luYygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjaGFuZ2VSZXNpemVDdXJzb3I6ZnVuY3Rpb24odHlwZSl7XG5cdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xuXHRcdH0sXG5cdFx0Y2hhbmdlRGVmYXVsdEN1cnNvcjpmdW5jdGlvbih0eXBlKXtcblx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuXHRcdH0sXG5cdFx0Ly9yZW5kZXJzIHRoZSBoYW5kbGUgYnkgaXRzIHJlY3Rcblx0XHRyZW5kZXJIYW5kbGU6ZnVuY3Rpb24oKXtcblx0XHRcdGlmKCF0aGlzLnJlc2l6YWJsZSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0dmFyIHg9dGhpcy5yZWN0LmdldFgoKTtcblx0XHRcdHRoaXMubGVmdEhhbmRsZS5zZXRYKHgpO1xuXHRcdFx0dGhpcy5yaWdodEhhbmRsZS5zZXRYKHgrdGhpcy5yZWN0LmdldFdpZHRoKCktMik7XG5cdFx0fSxcblx0XHRcblx0XHRcblx0XHQvL3JlbmRlcnMgdGhlIGJhciBieSB0aGUgaGFuZGxlc1xuXHRcdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBsZWZ0eD10aGlzLmxlZnRIYW5kbGUuZ2V0WCgpO1xuXHRcdFx0dmFyIHdpZHRoPXRoaXMucmlnaHRIYW5kbGUuZ2V0WCgpLWxlZnR4KzI7XG5cdFx0XHR0aGlzLmdyb3VwLnNldFgodGhpcy5ncm91cC5nZXRYKCkrbGVmdHgpO1xuXHRcdFx0dGhpcy5sZWZ0SGFuZGxlLnNldFgoMCk7XG5cdFx0XHR0aGlzLnJpZ2h0SGFuZGxlLnNldFgod2lkdGgtMik7XG5cdFx0XHR0aGlzLnJlY3Quc2V0V2lkdGgod2lkdGgpO1xuXHRcdFx0dmFyIHdpZHRoMiA9IHRoaXMucmVjdC5nZXRXaWR0aCgpICAqICh0aGlzLm1vZGVsLmdldCgnY29tcGxldGUnKSAvIDEwMCk7XG5cdFx0XHRpZih3aWR0aDIpXG5cdFx0XHRcdHRoaXMuY29tcGxldGVCYXIuc2V0V2lkdGgod2lkdGgyIC0gNCk7XG5cdFx0fSxcblx0XHQvKlxuXHRcdFx0ZGVwZW5kZW50T2JqOiB7J2VsZW0nOmRlcGVuZGFudCwnY29ubmVjdG9yJzpjb25uZWN0b3J9XG5cdFx0XHQqL1xuXHRcdFx0YWRkRGVwZW5kYW50OmZ1bmN0aW9uKGRlcGVuZGFudE9iail7XG5cdFx0XHRcdHRoaXMubGlzdGVuVG8oZGVwZW5kYW50T2JqLmVsZW0sJ21vdmVsZWZ0IHJlc2l6ZWxlZnQnLHRoaXMuYWRqdXN0bGVmdClcblx0XHRcdFx0dGhpcy5kZXBlbmRhbnRzLnB1c2goZGVwZW5kYW50T2JqKTtcblx0XHRcdH0sXG5cdFx0Ly9yZW5kZXJzIHRoZSBiYXIgYnkgaXRzIG1vZGVsIFxuXHRcdHJlbmRlckJhcjpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHggPSB0aGlzLmNhbGN1bGF0ZVgoKTtcblx0XHRcdHRoaXMuc2V0WDEoeC54MSx7YWJzb2x1dGU6dHJ1ZSwgc2lsZW50OnRydWV9KTtcblx0XHRcdHRoaXMuc2V0WDIoeC54Mix7YWJzb2x1dGU6dHJ1ZSwgc2lsZW50OnRydWUsIG9zYW1lOnRydWV9KTtcblx0XHRcdHRoaXMucmVuZGVyQ29ubmVjdG9ycygpO1xuXHRcdH0sXG5cdFx0XG5cdFx0YWRkRGVwZW5kYW5jeTogZnVuY3Rpb24oZGVwZW5kZW5jeU9iail7XG5cdFx0XHR0aGlzLmxpc3RlblRvKGRlcGVuZGVuY3lPYmouZWxlbSwnbW92ZXJpZ2h0IHJlc2l6ZXJpZ2h0Jyx0aGlzLmFkanVzdHJpZ2h0KTtcblx0XHRcdHRoaXMuZGVwZW5kZW5jaWVzLnB1c2goZGVwZW5kZW5jeU9iaik7XG5cdFx0XHR0aGlzLnJlbmRlckNvbm5lY3RvcihkZXBlbmRlbmN5T2JqLDIpO1xuXHRcdH0sXG5cdFx0Ly9jaGVja3MgaWYgdGhlIGJhciBuZWVkcyBtb3ZlbWVudCBpbiBsZWZ0IHNpZGUgb24gbGVmdCBtb3ZlbWVudCBvZiBkZXBlbmRlbnQgYW5kIG1ha2VzIGFkanVzdG1lbnRcblx0XHRhZGp1c3RsZWZ0OmZ1bmN0aW9uKGRlcGVuZGFudCl7XG5cdFx0XHRpZighdGhpcy5pc0RlcGVuZGFudChkZXBlbmRhbnQpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgZHg9dGhpcy5nZXRYMSgpK3RoaXMuZ2V0V2lkdGgoKS1kZXBlbmRhbnQuZ2V0WDEoKTtcblx0XHRcdC8vYW4gb3ZlcmxhcCBvY2N1cnMgaW4gdGhpcyBjYXNlXG5cdFx0XHRpZihkeD4wKXtcblx0XHRcdFx0Ly9ldmVudCB3aWxsIGJlIHRyaWdnZXJlZCBpbiBtb3ZlIGZ1bmNcblx0XHRcdFx0dGhpcy5tb3ZlKC0xKmR4KTtcblx0XHRcdFx0Ly90aGlzLnRyaWdnZXIoJ21vdmVsZWZ0Jyx0aGlzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGFkanVzdHJpZ2h0OmZ1bmN0aW9uKGRlcGVuZGVuY3kpe1xuXHRcdFx0aWYoIXRoaXMuaXNEZXBlbmRlbmN5KGRlcGVuZGVuY3kpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR2YXIgZHg9ZGVwZW5kZW5jeS5nZXRYMSgpK2RlcGVuZGVuY3kuZ2V0V2lkdGgoKS10aGlzLmdldFgxKCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGR4KTtcblx0XHRcdGlmKGR4PjApe1xuXHRcdFx0XHQvL2V2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIGluIG1vdmUgZnVuY1xuXHRcdFx0XHR0aGlzLm1vdmUoZHgpO1xuXHRcdFx0XHQvL3RoaXMudHJpZ2dlcignbW92ZXJpZ2h0Jyx0aGlzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGlzRGVwZW5kYW50OmZ1bmN0aW9uKGRlcGVuZGFudCl7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZGVwZW5kYW50cy5sZW5ndGg7aSsrKXtcblx0XHRcdFx0aWYodGhpcy5kZXBlbmRhbnRzW2ldWydlbGVtJ11bJ2JhcmlkJ109PT1kZXBlbmRhbnRbJ2JhcmlkJ10pe1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXHRcdC8vQHR5cGUgRGVwZW5kYW50OjEsIERlcGVuZGVuY3k6MlxuXHRcdHJlbmRlckNvbm5lY3RvcjpmdW5jdGlvbihvYmosdHlwZSl7XG5cdFx0XHRpZih0eXBlPT0xKXtcblx0XHRcdFx0QmFyLnJlbmRlckNvbm5lY3Rvcih0aGlzLG9iai5lbGVtLG9iai5jb25uZWN0b3IpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0QmFyLnJlbmRlckNvbm5lY3RvcihvYmouZWxlbSx0aGlzLG9iai5jb25uZWN0b3IpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ly9yZW5kZXJzIGFsbCBjb25uZWN0b3JzXG5cdFx0cmVuZGVyQ29ubmVjdG9yczpmdW5jdGlvbigpe1xuXHRcdFx0Zm9yKHZhciBpPTAsaUxlbj10aGlzLmRlcGVuZGFudHMubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHR0aGlzLnJlbmRlckNvbm5lY3Rvcih0aGlzLmRlcGVuZGFudHNbaV0sMSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IodmFyIGk9MCxpTGVuPXRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0dGhpcy5yZW5kZXJDb25uZWN0b3IodGhpcy5kZXBlbmRlbmNpZXNbaV0sMik7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpc0RlcGVuZGVuY3k6IGZ1bmN0aW9uKGRlcGVuZGVuY3kpe1xuXHRcdFx0XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRpZih0aGlzLmRlcGVuZGVuY2llc1tpXVsnZWxlbSddWydiYXJpZCddPT09ZGVwZW5kZW5jeVsnYmFyaWQnXSl7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdG1vdmU6IGZ1bmN0aW9uKGR4LHNpbGVudCl7XG5cdFx0XHRpZihkeD09PTApIHJldHVybjtcblx0XHRcdHRoaXMuZ3JvdXAubW92ZSh7eDpkeH0pO1xuXHRcdFx0aWYoIXNpbGVudCl7XG5cdFx0XHRcdHRoaXMudHJpZ2dlcignbW92ZScsdGhpcyk7XG5cdFx0XHRcdGlmKGR4PjApe1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcignbW92ZXJpZ2h0Jyx0aGlzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlcignbW92ZWxlZnQnLHRoaXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMudHJpZ2dlclBhcmVudCgnbW92ZScpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2FsY3VsYXRlWDpmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHQhbW9kZWwgJiYgKG1vZGVsPXRoaXMubW9kZWwpO1xuXHRcdFx0dmFyIGF0dHJzPSB0aGlzLnNldHRpbmdzLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxuXHRcdFx0ZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHgxOihEYXRlLmRheXNkaWZmKGJvdW5kYXJ5TWluLG1vZGVsLmdldCgnc3RhcnQnKSkpKmRheXNXaWR0aCxcblx0XHRcdFx0eDI6RGF0ZS5kYXlzZGlmZihib3VuZGFyeU1pbixtb2RlbC5nZXQoJ2VuZCcpKSpkYXlzV2lkdGgsXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjYWxjdWxhdGVEYXRlczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGF0dHJzPWFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2F0dHInKSxcblx0XHRcdGJvdW5kYXJ5TWluPWF0dHJzLmJvdW5kYXJ5TWluLFxuXHRcdFx0ZGF5c1dpZHRoPWF0dHJzLmRheXNXaWR0aDtcblx0XHRcdHZhciBkYXlzMT1NYXRoLnJvdW5kKHRoaXMuZ2V0WDEodHJ1ZSkvZGF5c1dpZHRoKSxkYXlzMj1NYXRoLnJvdW5kKHRoaXMuZ2V0WDIodHJ1ZSkvZGF5c1dpZHRoKTtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c3RhcnQ6IGJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMSksXG5cdFx0XHRcdGVuZDpib3VuZGFyeU1pbi5jbG9uZSgpLmFkZERheXMoZGF5czItMSlcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0sXG5cdFx0Z2V0UmVjdHBhcmFtczpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHNldHRpbmc9dGhpcy5zZXR0aW5nO1xuXHRcdFx0dmFyIHhzICA9dGhpcy5jYWxjdWxhdGVYKHRoaXMubW9kZWwpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbC5nZXQoJ2NvbXBsZXRlJykpO1xuXHRcdFx0cmV0dXJuIF8uZXh0ZW5kKHtcblx0XHRcdFx0eDowLFxuXHRcdFx0XHR3aWR0aDp4cy54Mi14cy54MSxcblx0XHRcdFx0eTogMCxcblx0XHRcdFx0bmFtZTonbWFpbmJhcicsXG5cdFx0XHRcdGhlaWdodDpzZXR0aW5nLmJhcmhlaWdodFxuXHRcdFx0fSxzZXR0aW5nLnJlY3RvcHRpb24pO1xuXHRcdH0sXG5cdFx0Z2V0R3JvdXBQYXJhbXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciB4cz10aGlzLmNhbGN1bGF0ZVgodGhpcy5tb2RlbCk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4cy54MSxcblx0XHRcdFx0eTogMCxcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRvZ2dsZTpmdW5jdGlvbihzaG93KXtcblx0XHRcdHZhciBtZXRob2Q9c2hvdz8nc2hvdyc6J2hpZGUnO1xuXHRcdFx0dGhpcy5ncm91cFttZXRob2RdKCk7XG5cdFx0XHRmb3IodmFyIGk9MCxpTGVuPXRoaXMuZGVwZW5kZW5jaWVzLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0dGhpcy5kZXBlbmRlbmNpZXNbaV0uY29ubmVjdG9yW21ldGhvZF0oKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGRyYXc6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuZ3JvdXAuZ2V0TGF5ZXIoKS5kcmF3KCk7XG5cblx0XHR9LFxuXHRcdHN5bmM6ZnVuY3Rpb24oKXtcblx0XHRcdGNvbnNvbGUubG9nKCdzeW5jaW5nICcrdGhpcy5tb2RlbC5jaWQpO1xuXHRcdFx0dmFyIGRhdGVzPXRoaXMuY2FsY3VsYXRlRGF0ZXMoKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KHtzdGFydDpkYXRlcy5zdGFydCxlbmQ6ZGF0ZXMuZW5kfSk7XG5cdFx0XHRjb25zb2xlLmxvZygnc3luY2luZyAnK3RoaXMubW9kZWwuY2lkKycgZmluaXNoZWQnKTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZSgpO1xuXHRcdH1cblx0XHRcblxuXHR9XG5cdC8vSXQgY3JlYXRlcyBhIHJlbGF0aW9uIGJldHdlZW4gZGVwZW5kYW50IGFuZCBkZXBlbmRlbmN5XG5cdC8vRGVwZW5kYW50IGlzIHRoZSB0YXNrIHdoaWNoIG5lZWRzIHRvIGJlIGRvbmUgYWZ0ZXIgZGVwZW5kZW5jeVxuXHQvL1N1cHBvc2UgdGFzayBCIHJlcXVpcmVzIHRhc2sgQSB0byBiZSBkb25lIGJlZm9yZWhhbmQuIFNvLCBBIGlzIGRlcGVuZGFuY3kvcmVxdWlyZW1lbnQgZm9yIEIgd2hlcmVhcyBCIGlzIGRlcGVuZGFudCBvbiBBLlxuXHRCYXIuY3JlYXRlUmVsYXRpb249ZnVuY3Rpb24oZGVwZW5kZW5jeSxkZXBlbmRhbnQpe1xuXHRcdHZhciBjb25uZWN0b3IscGFyZW50O1xuXHRcdHBhcmVudD1kZXBlbmRhbnQuZ3JvdXAuZ2V0UGFyZW50KCk7XG5cdFx0Y29ubmVjdG9yPXRoaXMuY3JlYXRlQ29ubmVjdG9yKCk7XG5cdFx0ZGVwZW5kZW5jeS5hZGREZXBlbmRhbnQoe1xuXHRcdFx0J2VsZW0nOmRlcGVuZGFudCxcblx0XHRcdCdjb25uZWN0b3InOiBjb25uZWN0b3IsXG5cdFx0fSk7XG5cdFx0ZGVwZW5kYW50LmFkZERlcGVuZGFuY3koe1xuXHRcdFx0J2VsZW0nOmRlcGVuZGVuY3ksXG5cdFx0XHQnY29ubmVjdG9yJzogY29ubmVjdG9yLFxuXHRcdH0pO1xuXHRcdFxuXHRcdHBhcmVudC5hZGQoY29ubmVjdG9yKTtcblx0XHRcblx0fVxuXHRcblx0QmFyLmNyZWF0ZUNvbm5lY3Rvcj1mdW5jdGlvbigpe1xuXHRcdHJldHVybiBuZXcgS2luZXRpYy5MaW5lKHtcblx0XHRcdHN0cm9rZVdpZHRoOiAxLFxuXHRcdFx0c3Ryb2tlOiAnYmxhY2snLFxuXHRcdFx0cG9pbnRzOiBbMCwgMF1cblx0XHR9KTtcblx0XHRcblx0fSxcblx0QmFyLmVuYWJsZUNvbm5lY3Rvcj1mdW5jdGlvbihzdGFydCl7XG5cdFx0S2luZXRpYy5Db25uZWN0LnN0YXJ0PXN0YXJ0O1xuXHRcdHN0YXJ0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dD1mYWxzZTtcblx0fVxuXHRCYXIuZGlzYWJsZUNvbm5lY3Rvcj1mdW5jdGlvbigpe1xuXHRcdGlmKCFLaW5ldGljLkNvbm5lY3Quc3RhcnQpIHJldHVybjtcblx0XHR2YXIgc3RhcnQ9S2luZXRpYy5Db25uZWN0LnN0YXJ0O1xuXHRcdHN0YXJ0LnN1Ymdyb3Vwb3B0aW9ucy5oaWRlT25Ib3Zlck91dD10cnVlO1xuXHRcdEtpbmV0aWMuQ29ubmVjdC5zdGFydD1udWxsO1xuXHR9XG5cdFxuXHRCYXIuaXNDb25uZWN0b3JFbmFibGVkPWZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIEtpbmV0aWMuQ29ubmVjdC5zdGFydDtcblx0fVxuXHRCYXIucmVuZGVyQ29ubmVjdG9yPWZ1bmN0aW9uKHN0YXJ0QmFyLGVuZEJhcixjb25uZWN0b3Ipe1xuXHRcdFxuXHRcdHZhciBwb2ludDEscG9pbnQyLGhhbGZoZWlnaHQscG9pbnRzLGNvbG9yPScjMDAwJztcblx0XHRoYWxmaGVpZ2h0PXBhcnNlSW50KHN0YXJ0QmFyLmdldEhlaWdodCgpLzIpO1xuXHRcdHBvaW50MT17XG5cdFx0XHR4OnN0YXJ0QmFyLmdldFgyKCksXG5cdFx0XHR5OnN0YXJ0QmFyLmdldFkoKStoYWxmaGVpZ2h0LFxuXHRcdH1cblx0XHRwb2ludDI9e1xuXHRcdFx0eDplbmRCYXIuZ2V0WDEoKSxcblx0XHRcdHk6ZW5kQmFyLmdldFkoKStoYWxmaGVpZ2h0LFxuXHRcdH1cblx0XHR2YXIgb2Zmc2V0PTUsYXJyb3dmbGFuaz00LGFycm93aGVpZ2h0PTUsYm90dG9tb2Zmc2V0PTQ7XG5cdFx0XG5cblx0XHRpZihwb2ludDIueC1wb2ludDEueDwwKXtcblx0XHRcdGlmKHBvaW50Mi55PHBvaW50MS55KXtcblx0XHRcdFx0aGFsZmhlaWdodD0gLTEqaGFsZmhlaWdodDtcblx0XHRcdFx0Ym90dG9tb2Zmc2V0PS0xKmJvdHRvbW9mZnNldDtcblx0XHRcdFx0Ly9hcnJvd2hlaWdodD0tMSphcnJvd2hlaWdodDtcblx0XHRcdH1cblx0XHRcdHBvaW50cz1bXG5cdFx0XHRwb2ludDEueCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDEueSxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDEueStoYWxmaGVpZ2h0K2JvdHRvbW9mZnNldCxcblx0XHRcdHBvaW50Mi54LW9mZnNldCxwb2ludDEueStoYWxmaGVpZ2h0K2JvdHRvbW9mZnNldCxcblx0XHRcdHBvaW50Mi54LW9mZnNldCxwb2ludDIueSxcblx0XHRcdHBvaW50Mi54LHBvaW50Mi55LFxuXHRcdFx0cG9pbnQyLngtYXJyb3doZWlnaHQscG9pbnQyLnktYXJyb3dmbGFuayxcblx0XHRcdHBvaW50Mi54LWFycm93aGVpZ2h0LHBvaW50Mi55K2Fycm93ZmxhbmssXG5cdFx0XHRwb2ludDIueCxwb2ludDIueVxuXHRcdFx0XTtcblx0XHRcdGNvbG9yPSdyZWQnO1xuXHRcdFx0XG5cdFx0fVxuXHRcdGVsc2UgaWYocG9pbnQyLngtcG9pbnQxLng8NSl7XG5cdFx0XHRpZihwb2ludDIueTxwb2ludDEueSl7XG5cdFx0XHRcdGhhbGZoZWlnaHQ9IC0xKmhhbGZoZWlnaHQ7XG5cdFx0XHRcdGJvdHRvbW9mZnNldD0tMSpib3R0b21vZmZzZXQ7XG5cdFx0XHRcdGFycm93aGVpZ2h0PS0xKmFycm93aGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0cG9pbnRzPVtcblx0XHRcdHBvaW50MS54LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50MS55LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0LHBvaW50Mi55LWhhbGZoZWlnaHQsXG5cdFx0XHRwb2ludDEueCtvZmZzZXQtYXJyb3dmbGFuayxwb2ludDIueS1oYWxmaGVpZ2h0LWFycm93aGVpZ2h0LFxuXHRcdFx0cG9pbnQxLngrb2Zmc2V0K2Fycm93ZmxhbmsscG9pbnQyLnktaGFsZmhlaWdodC1hcnJvd2hlaWdodCxcblx0XHRcdHBvaW50MS54K29mZnNldCxwb2ludDIueS1oYWxmaGVpZ2h0XG5cdFx0XHRdO1xuXG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRwb2ludHM9W1xuXHRcdFx0cG9pbnQxLngscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQxLnksXG5cdFx0XHRwb2ludDEueCtvZmZzZXQscG9pbnQyLnksXG5cdFx0XHRwb2ludDIueCxwb2ludDIueSxcblx0XHRcdHBvaW50Mi54LWFycm93aGVpZ2h0LHBvaW50Mi55LWFycm93ZmxhbmssXG5cdFx0XHRwb2ludDIueC1hcnJvd2hlaWdodCxwb2ludDIueSthcnJvd2ZsYW5rLFxuXHRcdFx0cG9pbnQyLngscG9pbnQyLnlcblx0XHRcdF07XG5cdFx0fVxuXHRcdGNvbm5lY3Rvci5zZXRBdHRyKCdzdHJva2UnLGNvbG9yKTtcblx0XHRjb25uZWN0b3Iuc2V0UG9pbnRzKHBvaW50cyk7XG5cdH1cblx0XG5cdEtpbmV0aWMuQ29ubmVjdD17XG5cdFx0c3RhcnQ6ZmFsc2UsXG5cdFx0ZW5kOmZhbHNlXG5cdH1cblx0XG5cdFxuXHRcblx0Xy5leHRlbmQoQmFyLnByb3RvdHlwZSwgQmFja2JvbmUuRXZlbnRzKTtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IEJhcjsiLCJ2YXIgQmFyID0gcmVxdWlyZSgnLi9CYXInKTtcblxudmFyIEJhckdyb3VwID0gZnVuY3Rpb24ob3B0aW9ucyl7XG5cdHRoaXMuY2lkID0gXy51bmlxdWVJZCgnYmcnKTtcblx0dGhpcy5zZXR0aW5ncyA9IG9wdGlvbnMuc2V0dGluZ3M7XG5cdHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXHR2YXIgc2V0dGluZyA9IHRoaXMuc2V0dGluZyA9IG9wdGlvbnMuc2V0dGluZ3MuZ2V0U2V0dGluZygnZ3JvdXAnKTtcblx0dGhpcy5hdHRyID0ge1xuXHRcdGhlaWdodDogMFxuXHR9O1xuXHR0aGlzLnN5bmNpbmc9ZmFsc2U7XG5cdHRoaXMuY2hpbGRyZW49W107XG5cblx0dGhpcy5ncm91cCA9IG5ldyBLaW5ldGljLkdyb3VwKHRoaXMuZ2V0R3JvdXBQYXJhbXMoKSk7XG5cdHRoaXMudG9wYmFyID0gbmV3IEtpbmV0aWMuUmVjdCh0aGlzLmdldFJlY3RwYXJhbXMoKSk7XG5cdHRoaXMuZ3JvdXAuYWRkKHRoaXMudG9wYmFyKTtcblxuXHR0aGlzLmF0dHIuaGVpZ2h0ICs9ICBzZXR0aW5nLnJvd0hlaWdodDtcblxuXHRpZihzZXR0aW5nLmRyYWdnYWJsZSl7XG5cdFx0dGhpcy5tYWtlRHJhZ2dhYmxlKCk7XG5cdH1cblx0aWYoc2V0dGluZy5yZXNpemFibGUpe1xuXHRcdHRoaXMudG9wYmFyLm1ha2VSZXNpemFibGUoKTtcblx0fVxuXHR0aGlzLmluaXRpYWxpemUoKTtcbn07XG5cbkJhckdyb3VwLnByb3RvdHlwZT17XG5cdFx0aW5pdGlhbGl6ZTpmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5tb2RlbC5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ2FkZCcsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEJhcih7XG5cdFx0XHRcdFx0bW9kZWw6Y2hpbGQsXG5cdFx0XHRcdFx0c2V0dGluZ3MgOiB0aGlzLnNldHRpbmdzXG5cdFx0XHRcdH0pKTtcblx0XHRcdFx0dGhpcy5yZW5kZXJTb3J0ZWRDaGlsZHJlbih0cnVlKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbC5jaGlsZHJlbiwgJ3JlbW92ZScsIGZ1bmN0aW9uKGNoaWxkKSB7XG5cdFx0XHRcdHZhciB2aWV3Rm9yRGVsZXRlID0gXy5maW5kKHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5tb2RlbCA9PT0gY2hpbGRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRoaXMuY2hpbGRyZW4gPSBfLndpdGhvdXQodGhpcy5jaGlsZHJlbiwgdmlld0ZvckRlbGV0ZSk7XG5cdFx0XHRcdHZpZXdGb3JEZWxldGUuZGVzdHJveSgpO1xuXHRcdFx0XHR0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKHRydWUpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdHRoaXMucmVuZGVyU29ydGVkQ2hpbGRyZW4odHJ1ZSk7XG5cdFx0XHR0aGlzLnJlbmRlckRlcGVuZGVuY3koKTtcblx0XHRcdHRoaXMuYmluZEV2ZW50cygpO1xuXHRcdH0sXG5cdFx0ZGVzdHJveSA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5ncm91cC5kZXN0cm95KCk7XG5cdFx0fSxcblx0XHRyZW5kZXJTb3J0ZWRDaGlsZHJlbjpmdW5jdGlvbihub2RyYXcpe1xuXHRcdFx0IW5vZHJhdyAmJiAobm9kcmF3PWZhbHNlKTtcblx0XHRcdHZhciBzb3J0ZWQ9Xy5zb3J0QnkodGhpcy5jaGlsZHJlbiwgZnVuY3Rpb24oaXRlbWJhcil7XG5cdFx0XHRcdHJldHVybiBpdGVtYmFyLm1vZGVsLmdldCgnc29ydGluZGV4Jyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuYXR0ci5oZWlnaHQ9dGhpcy5zZXR0aW5nLnJvd0hlaWdodDtcblx0XHRcdGZvcih2YXIgaT0wO2k8c29ydGVkLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRzb3J0ZWRbaV0uc2V0WSh0aGlzLmdldEhlaWdodCgpK3RoaXMuc2V0dGluZy5nYXApO1xuXHRcdFx0XHRzb3J0ZWRbaV0ucmVuZGVyQ29ubmVjdG9ycygpO1xuXHRcdFx0XHR0aGlzLmF0dHIuaGVpZ2h0ICs9IHRoaXMuc2V0dGluZy5yb3dIZWlnaHQ7XG5cdFx0XHR9XG5cdFx0XHRpZighbm9kcmF3KVxuXHRcdFx0XHR0aGlzLmdyb3VwLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRmaW5kQnlJZDpmdW5jdGlvbihpZCl7XG5cdFx0XHR2YXIgY2hpbGRyZW49dGhpcy5jaGlsZHJlbjtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGlmKGNoaWxkcmVuW2ldLm1vZGVsLmdldCgnaWQnKT09PWlkKVxuXHRcdFx0XHRcdHJldHVybiBjaGlsZHJlbltpXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cdFx0cmVuZGVyRGVwZW5kZW5jeTpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGNoaWxkcmVuPXRoaXMuY2hpbGRyZW4sZGVwZW5kZW5jaWVzPVtdLGJhcjtcblx0XHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRcdGRlcGVuZGVuY2llcz1jaGlsZHJlbltpXS5tb2RlbC5nZXQoJ2RlcGVuZGVuY3knKTtcblx0XHRcdFx0Zm9yKHZhciBqPTA7ajxkZXBlbmRlbmNpZXMubGVuZ3RoO2orKyl7XG5cdFx0XHRcdFx0YmFyPXRoaXMuZmluZEJ5SWQoZGVwZW5kZW5jaWVzW2pdWydpZCddKTtcblx0XHRcdFx0XHRpZihiYXIpe1xuXHRcdFx0XHRcdFx0QmFyLmNyZWF0ZVJlbGF0aW9uKGJhcixjaGlsZHJlbltpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRtYWtlRHJhZ2dhYmxlOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcdHRoaXMuZ3JvdXAuZHJhZ2dhYmxlKHRydWUpO1xuXHRcdFx0aWYodGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpe1xuXHRcdFx0XHR0aGlzLmdyb3VwLmRyYWdCb3VuZEZ1bmModGhpcy5zZXR0aW5nLmRyYWdCb3VuZEZ1bmMpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncm91cC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oKXtcblx0XHRcdFx0dGhhdC5zeW5jKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdC8vcmV0dXJucyB0aGUgeCBwb3NpdGlvbiBvZiB0aGUgZ3JvdXBcblx0XHQvL1RoZSB4IHBvc2l0aW9uIG9mIHRoZSBncm91cCBpcyBzZXQgMCBpbml0aWFsbHkuVGhlIHRvcGJhciB4IHBvc2l0aW9uIGlzIHNldCByZWxhdGl2ZSB0byBncm91cHMgMCBwb3NpdGlvbiBpbml0aWFsbHkuIHdoZW4gdGhlIGdyb3VwIGlzIG1vdmVkIHRvIGdldCB0aGUgYWJzb2x1dGUgeCBwb3NpdGlvbiBvZiB0aGUgdG9wIGJhciB1c2UgZ2V0WDEgbWV0aG9kLlxuXHRcdC8vVGhlIHByb2JsZW0gaXMgd2hlbiBhbnkgY2hpbGRyZW4gZ2V0IG91dHNpZGUgb2YgYm91bmQgdGhlbiB0aGUgcG9zaXRpb24gb2YgZWFjaCBjaGlsZHJlbiBoYXMgdG8gYmUgdXBkYXRlZC4gVGhpcyB3YXkgc29sdmVzIHRoZSBwcm9ibGVtXG5cdFx0Z2V0WDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXAuZ2V0WCgpO1xuXHRcdH0sXG5cdFx0Ly9yZXR1cm5zIHRoZSBiYnNvbHV0ZSB4MSBwb3NpdGlvbiBvZiB0b3AgYmFyXG5cdFx0Z2V0WDE6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFgoKSt0aGlzLnRvcGJhci5nZXRYKCk7XG5cdFx0fSxcblx0XHQvL3JldHVybnMgdGhlIGFic29sdXRlIHgxIHBvc2l0aW9uIG9mIHRvcCBiYXJcblx0XHRnZXRYMjpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0WDEoKSt0aGlzLnRvcGJhci5nZXRXaWR0aCgpO1xuXHRcdH0sXG5cdFx0Z2V0WTE6ZnVuY3Rpb24oKXtcblx0XHRcdHJldHVybiB0aGlzLmdyb3VwLmdldFkoKTtcblx0XHR9LFxuXHRcdHNldFk6ZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0dGhpcy5ncm91cC5zZXRZKHZhbHVlKTtcblx0XHR9LFxuXHRcdGdldFdpZHRoOmZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gdGhpcy50b3BiYXIuZ2V0V2lkdGgoKTtcblx0XHR9LFxuXHRcdGdldEhlaWdodDpmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIHRoaXMuYXR0ci5oZWlnaHQ7XG5cdFx0fSxcblx0XHRnZXRDdXJyZW50SGVpZ2h0OmZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGlzLm1vZGVsLmdldCgnYWN0aXZlJykpXG5cdFx0XHRcdHJldHVybiB0aGlzLmF0dHIuaGVpZ2h0O1xuXHRcdFx0ZWxzZXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnZ3JvdXAnLCdyb3dIZWlnaHQnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdFxuXHRcdGFkZENoaWxkOiBmdW5jdGlvbihiYXIpe1xuXHRcdFx0dGhpcy5jaGlsZHJlbi5wdXNoKGJhcik7XG5cdFx0XHR0aGlzLmdyb3VwLmFkZChiYXIuZ3JvdXApO1xuXHRcdFx0dmFyIHg9YmFyLmdldFgxKHRydWUpO1xuXHRcdFx0Ly9tYWtlIGJhciB4IHJlbGF0aXZlIHRvIHRoaXMgZ3JvdXBcblx0XHRcdGJhci5zZXRQYXJlbnQodGhpcyk7XG5cdFx0XHRiYXIuc2V0WDEoeCx7YWJzb2x1dGU6dHJ1ZSxzaWxlbnQ6dHJ1ZX0pO1xuXHRcdFx0YmFyLnNldFkodGhpcy5nZXRIZWlnaHQoKSt0aGlzLnNldHRpbmcuZ2FwKTtcblx0XHRcdHRoaXMuYXR0ci5oZWlnaHQgKz0gdGhpcy5zZXR0aW5nLnJvd0hlaWdodDtcblx0XHRcdGJhci5ncm91cC52aXNpYmxlKHRoaXMubW9kZWwuZ2V0KCdhY3RpdmUnKSk7XG5cdFx0fSxcblx0XHRyZW5kZXJDaGlsZHJlbjpmdW5jdGlvbigpe1xuXHRcdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmNoaWxkcmVuLmxlbmd0aDtpKyspe1xuXHRcdFx0XHR0aGlzLmNoaWxkcmVuW2ldLnJlbmRlckJhcigpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZW5kZXJUb3BCYXIoKTtcblxuXHRcdH0sXG5cdFx0cmVuZGVyVG9wQmFyOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgcGFyZW50PXRoaXMubW9kZWw7XG5cdFx0XHR2YXIgeD10aGlzLmNhbGN1bGF0ZVgocGFyZW50KTtcblxuXHRcdFx0dGhpcy50b3BiYXIuc2V0WCh4LngxLXRoaXMuZ3JvdXAuZ2V0WCgpKTtcblx0XHRcdHRoaXMudG9wYmFyLnNldFdpZHRoKHgueDIteC54MSk7XG5cdFx0fSxcblx0XHRiaW5kRXZlbnRzOmZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLm9uKCdyZXNpemUgbW92ZScsZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIG1pblgsbWF4WDtcblx0XHRcdFx0bWluWD1fLm1pbih0aGlzLmNoaWxkcmVuLGZ1bmN0aW9uKGJhcil7XG5cdFx0XHRcdFx0cmV0dXJuIGJhci5nZXRYMSgpO1xuXHRcdFx0XHR9KS5nZXRYMSgpO1xuXHRcdFx0XHRtYXhYPV8ubWF4KHRoaXMuY2hpbGRyZW4sZnVuY3Rpb24oYmFyKXtcblx0XHRcdFx0XHRyZXR1cm4gYmFyLmdldFgyKCk7XG5cdFx0XHRcdH0pLmdldFgyKCk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLnNldFgobWluWCk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLnNldFdpZHRoKG1heFgtbWluWCk7XG5cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCdjaGFuZ2U6YWN0aXZlJyx0aGlzLnRvZ2dsZUNoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnb25zb3J0Jyx0aGlzLnJlbmRlclNvcnRlZENoaWxkcmVuKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGlzLnRvcGJhci5zZXRBdHRycyh0aGlzLmdldFJlY3RwYXJhbXMoKSk7XG5cdFx0XHRcdHRoaXMudG9wYmFyLmdldExheWVyKCkuZHJhdygpO1xuXHRcdFx0fSk7XG5cblx0XHR9LFxuXHRcdGdldEdyb3VwUGFyYW1zOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIF8uZXh0ZW5kKHtcblx0XHRcdFx0eDowLFxuXHRcdFx0XHR5OjAsXG5cdFx0XHR9LCB0aGlzLnNldHRpbmcudG9wQmFyKTtcblx0XHRcdFxuXHRcdH0sXG5cdFx0Y2FsY3VsYXRlWDpmdW5jdGlvbihtb2RlbCl7XG5cdFx0XHR2YXIgYXR0cnM9IHRoaXMuc2V0dGluZ3MuZ2V0U2V0dGluZygnYXR0cicpLFxuXHRcdFx0Ym91bmRhcnlNaW49YXR0cnMuYm91bmRhcnlNaW4sXG5cdFx0XHRkYXlzV2lkdGg9YXR0cnMuZGF5c1dpZHRoO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDE6KERhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sbW9kZWwuZ2V0KCdzdGFydCcpKS0xKSpkYXlzV2lkdGgsXG5cdFx0XHRcdHgyOkRhdGUuZGF5c2RpZmYoYm91bmRhcnlNaW4sbW9kZWwuZ2V0KCdlbmQnKSkqZGF5c1dpZHRoLFxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2FsY3VsYXRlUGFyZW50RGF0ZXM6ZnVuY3Rpb24oKXtcblx0XHRcdHZhciBhdHRycz1hcHAuc2V0dGluZy5nZXRTZXR0aW5nKCdhdHRyJyksXG5cdFx0XHRib3VuZGFyeU1pbj1hdHRycy5ib3VuZGFyeU1pbixcblx0XHRcdGRheXNXaWR0aD1hdHRycy5kYXlzV2lkdGg7XG5cdFx0XHR2YXIgZGF5czE9TWF0aC5yb3VuZCh0aGlzLmdldFgxKHRydWUpL2RheXNXaWR0aCksZGF5czI9TWF0aC5yb3VuZCh0aGlzLmdldFgyKHRydWUpL2RheXNXaWR0aCk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzdGFydDogYm91bmRhcnlNaW4uY2xvbmUoKS5hZGREYXlzKGRheXMxKSxcblx0XHRcdFx0ZW5kOmJvdW5kYXJ5TWluLmNsb25lKCkuYWRkRGF5cyhkYXlzMi0xKVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fSxcblx0XHRnZXRSZWN0cGFyYW1zOmZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgcGFyZW50PXRoaXMubW9kZWw7XG5cdFx0XHR2YXIgeHM9dGhpcy5jYWxjdWxhdGVYKHBhcmVudCk7XG5cdFx0XHR2YXIgc2V0dGluZz10aGlzLnNldHRpbmc7XG5cdFx0XHRyZXR1cm4gXy5leHRlbmQoe1xuXHRcdFx0XHR4OiB4cy54MSxcblx0XHRcdFx0d2lkdGg6eHMueDIteHMueDEsXG5cdFx0XHRcdHk6IHNldHRpbmcuZ2FwLFxuXHRcdFx0fSxzZXR0aW5nLnRvcEJhcik7XG5cdFx0fSxcblx0XHR0b2dnbGVDaGlsZHJlbjpmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHNob3c9dGhpcy5tb2RlbC5nZXQoJ2FjdGl2ZScpO1xuXHRcdFx0dmFyIGNoaWxkcmVuPXRoaXMuY2hpbGRyZW47XG5cdFx0XHRmb3IodmFyIGk9MDtpPGNoaWxkcmVuLmxlbmd0aDtpKyspe1xuXHRcdFx0XHRjaGlsZHJlbltpXS50b2dnbGUoc2hvdylcblx0XHRcdH1cblx0XHR9LFxuXHRcdHN5bmM6ZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMuc3luY2luZz10cnVlO1xuXG5cdFx0XHRjb25zb2xlLmxvZygncGFyZW50IHN5bmMgY2FsbGVkJyk7XG5cdFx0XHQvL3N5bmMgcGFyZW50IGZpcnN0XG5cdFx0XHR2YXIgcGRhdGVzPXRoaXMuY2FsY3VsYXRlUGFyZW50RGF0ZXMoKTtcblx0XHRcdHZhciBwYXJlbnQ9dGhpcy5tb2RlbC5nZXQoJ3BhcmVudCcpO1xuXHRcdFx0cGFyZW50LnNldCh7c3RhcnQ6cGRhdGVzLnN0YXJ0LGVuZDpwZGF0ZXMuZW5kfSk7XG5cdFx0XHRcblx0XHRcdHZhciBjaGlsZHJlbj10aGlzLmNoaWxkcmVuO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxjaGlsZHJlbi5sZW5ndGg7aSsrKXtcblx0XHRcdFx0Y2hpbGRyZW5baV0uc3luYygpXG5cdFx0XHR9XG5cdFx0XHRjb25zb2xlLmxvZygnc2V0dGluZyBzeW5jIHRvIGZhbHNlJyk7XG5cdFx0XHR0aGlzLnN5bmNpbmc9ZmFsc2U7XG5cdFx0fVxuXHR9O1xuXG5fLmV4dGVuZChCYXJHcm91cC5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFyR3JvdXA7XG4iLCJ2YXIgQmFyR3JvdXAgPSByZXF1aXJlKCcuL0Jhckdyb3VwJyk7XG52YXIgQmFyID0gcmVxdWlyZSgnLi9CYXInKTtcblxudmFyIHZpZXdPcHRpb25zID0gWydtb2RlbCcsICdjb2xsZWN0aW9uJ107XG5cbnZhciBLaW5ldGljVmlldyA9IEJhY2tib25lLktpbmV0aWNWaWV3ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR0aGlzLmNpZCA9IF8udW5pcXVlSWQoJ3ZpZXcnKTtcblx0Xy5leHRlbmQodGhpcywgXy5waWNrKG9wdGlvbnMsIHZpZXdPcHRpb25zKSk7XG5cdHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbl8uZXh0ZW5kKEtpbmV0aWNWaWV3LnByb3RvdHlwZSwgQmFja2JvbmUuRXZlbnRzLCB7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cblxuS2luZXRpY1ZpZXcuZXh0ZW5kPUJhY2tib25lLk1vZGVsLmV4dGVuZDtcblxudmFyIEtDYW52YXNWaWV3ID0gS2luZXRpY1ZpZXcuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0dGhpcy5ncm91cHM9W107XG5cdFx0dGhpcy5zZXR0aW5ncyA9IHRoaXMuYXBwLnNldHRpbmc7XG5cdFx0dmFyIHNldHRpbmcgPSAgdGhpcy5hcHAuc2V0dGluZy5nZXRTZXR0aW5nKCdkaXNwbGF5Jyk7XG5cdFx0XG5cdFx0dGhpcy5zdGFnZSA9IG5ldyBLaW5ldGljLlN0YWdlKHtcblx0XHRcdGNvbnRhaW5lciA6ICdnYW50dC1jb250YWluZXInLFxuXHRcdFx0aGVpZ2h0OiA1ODAsXG5cdFx0XHR3aWR0aDogc2V0dGluZy5zY3JlZW5XaWR0aCAtIHNldHRpbmcudEhpZGRlbldpZHRoIC0gMjAsXG5cdFx0XHRkcmFnZ2FibGU6IHRydWUsXG5cdFx0XHRkcmFnQm91bmRGdW5jOiAgZnVuY3Rpb24ocG9zKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0eDogcG9zLngsXG5cdFx0XHRcdFx0eTogdGhpcy5nZXRBYnNvbHV0ZVBvc2l0aW9uKCkueVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMuRmxheWVyID0gbmV3IEtpbmV0aWMuTGF5ZXIoe30pO1xuXHRcdHRoaXMuQmxheWVyID0gbmV3IEtpbmV0aWMuTGF5ZXIoe30pO1xuXHRcdFxuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuYXBwLnRhc2tzLCAnY2hhbmdlOnNvcnRpbmRleCcsIHRoaXMucmVuZGVyUmVxdWVzdCk7XG5cblx0XHR0aGlzLmxpc3RlblRvKHRoaXMuY29sbGVjdGlvbiwgJ2FkZCcsIGZ1bmN0aW9uKG1vZGVsKSB7XG5cdFx0XHRpZiAoIXBhcnNlSW50KG1vZGVsLmdldCgncGFyZW50aWQnKSwgMTApKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JvdXBzLnB1c2gobmV3IEJhckdyb3VwKHtcblx0XHRcdFx0bW9kZWw6IG1vZGVsXG5cdFx0XHR9KSk7XG5cblx0XHRcdHZhciBnc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cdFx0XHRnc2V0dGluZy5jdXJyZW50WSA9IGdzZXR0aW5nLmluaVk7XG5cblx0XHRcdHRoaXMuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRcdGdyb3VwaS5zZXRZKGdzZXR0aW5nLmN1cnJlbnRZKTtcblx0XHRcdFx0Z3NldHRpbmcuY3VycmVudFkgKz0gZ3JvdXBpLmdldEhlaWdodCgpO1xuXHRcdFx0XHR0aGlzLkZsYXllci5hZGQoZ3JvdXBpLmdyb3VwKTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLnJlbmRlcmdyb3VwcygpO1xuXHRcdH0pO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZUZyb250TGF5ZXIoKTtcblx0XHR0aGlzLmluaXRpYWxpemVCYWNrTGF5ZXIoKTtcblx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0fSxcblx0cmVuZGVyUmVxdWVzdCA6IChmdW5jdGlvbigpIHtcblx0XHR2YXIgd2FpdGluZyA9IGZhbHNlO1xuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICh3YWl0aW5nKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHdhaXRpbmcgPSB0cnVlO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5yZW5kZXJncm91cHMoKTtcblx0XHRcdFx0d2FpdGluZyA9IGZhbHNlO1xuXHRcdFx0fS5iaW5kKHRoaXMpLCAxMCk7XG5cdFx0fTtcblx0fSkoKSxcblx0aW5pdGlhbGl6ZUJhY2tMYXllcjpmdW5jdGlvbigpe1xuXHRcdHZhciBzaGFwZSA9IG5ldyBLaW5ldGljLlNoYXBlKHtcblx0XHRcdHN0cm9rZTogJyNiYmInLFxuXHRcdFx0c3Ryb2tlV2lkdGg6IDAsXG5cdFx0XHRzY2VuZUZ1bmM6dGhpcy5nZXRTY2VuZUZ1bmMoKVxuXHRcdH0pO1xuXHRcdHRoaXMuQmxheWVyLmFkZChzaGFwZSk7XG5cdFx0XG5cdH0sXG5cdGluaXRpYWxpemVGcm9udExheWVyOmZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24odGFzaykge1xuXHRcdFx0XCJ1c2Ugc3RyaWN0XCI7XG5cdFx0XHRpZiAoIXRhc2suZ2V0KCdwYXJlbnRpZCcpKSB7XG5cdFx0XHRcdHRoaXMuYWRkR3JvdXAodGFzayk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdH0sXG5cdGJpbmRFdmVudHM6ZnVuY3Rpb24oKXtcblx0XHR2YXIgY2FsY3VsYXRpbmc9ZmFsc2U7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb2xsZWN0aW9uLCAnY2hhbmdlOmFjdGl2ZScsIHRoaXMucmVuZGVyZ3JvdXBzKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmFwcC5zZXR0aW5nLCAnY2hhbmdlOmludGVydmFsIGNoYW5nZTpkcGknLCB0aGlzLnJlbmRlckJhcnMpO1xuXHRcdCQoJyNnYW50dC1jb250YWluZXInKS5tb3VzZXdoZWVsKGZ1bmN0aW9uKGUpe1xuXHRcdFx0aWYoY2FsY3VsYXRpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNkcGkgPSAgdGhpcy5zZXR0aW5ncy5nZXQoJ2RwaScpLCBkcGk9MDtcblx0XHRcdGNhbGN1bGF0aW5nPXRydWU7XG5cdFx0XHRpZiAoZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgPiAwKXtcblx0XHRcdFx0ZHBpID0gTWF0aC5tYXgoMSwgY2RwaSAtIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZHBpID0gY2RwaSArIDE7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZHBpID09PSAxKXtcblx0XHRcdFx0aWYgKCB0aGlzLmFwcC5zZXR0aW5nLmdldCgnaW50ZXJ2YWwnKSA9PT0gJ2F1dG8nKSB7XG5cdFx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmcuc2V0KHtpbnRlcnZhbDonZGFpbHknfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCB0aGlzLmFwcC5zZXR0aW5nLnNldCh7aW50ZXJ2YWw6ICdhdXRvJywgZHBpOiBkcGl9KTtcblx0XHRcdH1cblx0XHRcdGNhbGN1bGF0aW5nID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdGlmIChjYWxjdWxhdGluZykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHZhciBjZHBpID0gIHRoaXMuYXBwLnNldHRpbmcuZ2V0KCdkcGknKSwgZHBpPTA7XG5cdFx0Y2FsY3VsYXRpbmcgID10cnVlO1xuXHRcdGRwaSA9IE1hdGgubWF4KDAsIGNkcGkgKyAyNSk7XG5cblx0XHRpZiAoZHBpID09PSAxKSB7XG5cdFx0XHRpZiggdGhpcy5hcHAuc2V0dGluZy5nZXQoJ2ludGVydmFsJyk9PT0nYXV0bycpIHtcblx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmcuc2V0KHtpbnRlcnZhbDonZGFpbHknfSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdCB0aGlzLmFwcC5zZXR0aW5nLnNldCh7aW50ZXJ2YWw6ICdhdXRvJywgZHBpOiBkcGl9KTtcblx0XHR9XG5cblx0XHRjYWxjdWxhdGluZyA9IGZhbHNlO1xuXHRcdCQoJyNnYW50dC1jb250YWluZXInKS5vbignZHJhZ21vdmUnLCBmdW5jdGlvbigpe1xuXHRcdFx0aWYoY2FsY3VsYXRpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNkcGkgPSAgdGhpcy5hcHAuc2V0dGluZy5nZXQoJ2RwaScpLCBkcGk9MDtcblx0XHRcdGNhbGN1bGF0aW5nID0gdHJ1ZTtcblx0XHRcdGRwaSA9IGNkcGkgKyAxO1xuXG5cdFx0XHRpZihkcGk9PT0xKXtcblx0XHRcdFx0aWYgKCB0aGlzLmFwcC5zZXR0aW5nLmdldCgnaW50ZXJ2YWwnKSA9PT0gJ2F1dG8nKSB7XG5cdFx0XHRcdFx0IHRoaXMuYXBwLnNldHRpbmcuc2V0KHtpbnRlcnZhbDogJ2RhaWx5J30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQgdGhpcy5hcHAuc2V0dGluZy5zZXQoe2ludGVydmFsOidhdXRvJyxkcGk6ZHBpfSk7XG5cdFx0XHR9XG5cdFx0XHRjYWxjdWxhdGluZyA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH0sXG5cblx0YWRkR3JvdXA6IGZ1bmN0aW9uKHRhc2tncm91cCkge1xuXHRcdHRoaXMuZ3JvdXBzLnB1c2gobmV3IEJhckdyb3VwKHtcblx0XHRcdG1vZGVsOiB0YXNrZ3JvdXAsXG5cdFx0XHRzZXR0aW5ncyA6IHRoaXMuYXBwLnNldHRpbmdcblx0XHR9KSk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBnc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cblx0XHRnc2V0dGluZy5jdXJyZW50WSA9IGdzZXR0aW5nLmluaVk7XG5cdFx0XG5cdFx0dGhpcy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbihncm91cGkpIHtcblx0XHRcdGdyb3VwaS5zZXRZKGdzZXR0aW5nLmN1cnJlbnRZKTtcblx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZICs9IGdyb3VwaS5nZXRIZWlnaHQoKTtcblx0XHRcdHRoaXMuRmxheWVyLmFkZChncm91cGkuZ3JvdXApO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cblxuXHRcdC8vbG9vcCB0aHJvdWdoIGdyb3Vwc1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmdyb3Vwcy5sZW5ndGg7IGkrKyl7XG5cblx0XHRcdC8vbG9vcCB0aHJvdWdoIHRhc2tzXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5ncm91cHNbaV0uY2hpbGRyZW4ubGVuZ3RoOyBqKyspe1xuXG5cdFx0XHRcdC8vaWYgdGhyZXJlIGlzIGRlcGVuZGVuY3lcblx0XHRcdFx0aWYgKHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2pdLm1vZGVsLmF0dHJpYnV0ZXMuZGVwZW5kZW5jeSAhPT0gJycpe1xuXG5cdFx0XHRcdFx0Ly9wYXJzZSBkZXBlbmRlbmNpZXNcblx0XHRcdFx0XHR2YXIgZGVwZW5kZW5jeSA9ICQucGFyc2VKU09OKHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2pdLm1vZGVsLmF0dHJpYnV0ZXMuZGVwZW5kZW5jeSk7XG5cblx0XHRcdFx0XHRmb3IodmFyIGw9MDsgbCA8IGRlcGVuZGVuY3kubGVuZ3RoOyBsKyspe1xuXHRcdFx0XHRcdFx0Zm9yKCB2YXIgaz0wOyBrIDwgdGhpcy5ncm91cHNbaV0uY2hpbGRyZW4ubGVuZ3RoOyBrKyspe1xuXHRcdFx0XHRcdFx0XHRpZiAoZGVwZW5kZW5jeVtsXSA9PSB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbltrXS5tb2RlbC5hdHRyaWJ1dGVzLmlkICl7XG5cdFx0XHRcdFx0XHRcdFx0QmFyLmNyZWF0ZVJlbGF0aW9uKHRoaXMuZ3JvdXBzW2ldLmNoaWxkcmVuW2pdLCB0aGlzLmdyb3Vwc1tpXS5jaGlsZHJlbltrXSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zdGFnZS5hZGQodGhpcy5CbGF5ZXIpO1xuXHRcdHRoaXMuc3RhZ2UuYWRkKHRoaXMuRmxheWVyKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZW5kZXJCYXJzOmZ1bmN0aW9uKCl7XG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmdyb3Vwcy5sZW5ndGg7aSsrKXtcblx0XHRcdHRoaXMuZ3JvdXBzW2ldLnJlbmRlckNoaWxkcmVuKCk7XG5cdFx0fSBcblx0XHR0aGlzLkZsYXllci5kcmF3KCk7XG5cdFx0dGhpcy5CbGF5ZXIuZHJhdygpO1xuXHR9LFxuXG5cdHJlbmRlcmdyb3VwczpmdW5jdGlvbigpe1xuXHRcdHZhciBnc2V0dGluZyA9ICB0aGlzLmFwcC5zZXR0aW5nLmdldFNldHRpbmcoJ2dyb3VwJyk7XG5cdFx0dmFyIHNvcnRlZCA9IF8uc29ydEJ5KHRoaXMuZ3JvdXBzLCBmdW5jdGlvbihpdGVtdmlldyl7XG5cdFx0XHRyZXR1cm4gaXRlbXZpZXcubW9kZWwuZ2V0KCdzb3J0aW5kZXgnKTtcblx0XHR9KTtcblx0XHRnc2V0dGluZy5jdXJyZW50WSA9IGdzZXR0aW5nLmluaVk7XG5cdFx0c29ydGVkLmZvckVhY2goZnVuY3Rpb24oZ3JvdXBpKSB7XG5cdFx0XHRncm91cGkuc2V0WShnc2V0dGluZy5jdXJyZW50WSk7XG5cdFx0XHRncm91cGkucmVuZGVyU29ydGVkQ2hpbGRyZW4oKTtcblx0XHRcdGdzZXR0aW5nLmN1cnJlbnRZICs9IGdyb3VwaS5nZXRIZWlnaHQoKTtcblx0XHR9KTtcblx0XHR0aGlzLkZsYXllci5kcmF3KCk7XG5cdH0sXG5cdHNldFdpZHRoOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHRoaXMuc3RhZ2Uuc2V0V2lkdGgodmFsdWUpO1xuXHR9LFxuXHRnZXRTY2VuZUZ1bmM6ZnVuY3Rpb24oKXtcblx0XHR2YXIgc2V0dGluZz0gdGhpcy5hcHAuc2V0dGluZywgc2Rpc3BsYXkgPSBzZXR0aW5nLnNkaXNwbGF5O1xuXHRcdHZhciBib3JkZXJXaWR0aD1zZGlzcGxheS5ib3JkZXJXaWR0aCB8fCAxO1xuXHRcdHZhciBvZmZzZXQ9Ym9yZGVyV2lkdGgvMjtcblx0XHR2YXIgcm93SGVpZ2h0PTIwO1xuXHRcdHZhciBpbnRlcnZhbCA9ICB0aGlzLmFwcC5zZXR0aW5nLmdldCgnaW50ZXJ2YWwnKTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XG5cdFx0XHR2YXIgbGluZVdpZHRoLHNhdHRyPXNldHRpbmcuc2F0dHI7XG5cdFx0XHRcblx0XHRcdHZhciBpPTAsXG5cdFx0XHRzPTAsXG5cdFx0XHRpTGVuPTAsXG5cdFx0XHRkYXlzV2lkdGg9c2F0dHIuZGF5c1dpZHRoLFxuXHRcdFx0eCxcblx0XHRcdGxlbmd0aCxcblx0XHRcdGhEYXRhPXNhdHRyLmhEYXRhO1xuXHRcdFx0XG5cdFx0XHRsaW5lV2lkdGg9RGF0ZS5kYXlzZGlmZihzYXR0ci5ib3VuZGFyeU1pbixzYXR0ci5ib3VuZGFyeU1heCkqc2F0dHIuZGF5c1dpZHRoO1xuXHRcdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdC8vZHJhdyB0aHJlZSBsaW5lc1xuXHRcdFx0Zm9yKGk9MTtpPDQ7aSsrKXtcblx0XHRcdFx0Y29udGV4dC5tb3ZlVG8ob2Zmc2V0LCBpKnJvd0hlaWdodC1vZmZzZXQpO1xuXHRcdFx0XHRjb250ZXh0LmxpbmVUbyhsaW5lV2lkdGgrb2Zmc2V0LCBpKnJvd0hlaWdodC1vZmZzZXQpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgeWk9MCx5Zj1yb3dIZWlnaHQseGk9MDtcblx0XHRcdGZvcihzPTE7czwzO3MrKyl7XG5cdFx0XHRcdHg9MCxsZW5ndGg9MDtcblx0XHRcdFx0Zm9yKGk9MCxpTGVuPWhEYXRhW3NdLmxlbmd0aDtpPGlMZW47aSsrKXtcblx0XHRcdFx0XHRsZW5ndGg9aERhdGFbc11baV0uZHVyYXRpb24qZGF5c1dpZHRoO1xuXHRcdFx0XHRcdHggPSB4K2xlbmd0aDtcblx0XHRcdFx0XHR4aSA9IHggLSBib3JkZXJXaWR0aCArIG9mZnNldDtcblx0XHRcdFx0XHRjb250ZXh0Lm1vdmVUbyh4aSx5aSk7XG5cdFx0XHRcdFx0Y29udGV4dC5saW5lVG8oeGkseWYpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxMHB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuXHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG5cdFx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5maWxsVGV4dChoRGF0YVtzXVtpXS50ZXh0LCB4LWxlbmd0aC8yLHlmLXJvd0hlaWdodC8yKTtcblx0XHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LnJlc3RvcmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR5aT15Zix5Zj0geWYrcm93SGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR4PTAsbGVuZ3RoPTAscz0zLHlmPTEyMDA7XG5cdFx0XHR2YXIgZHJhZ0ludCA9IHBhcnNlSW50KHNhdHRyLmRyYWdJbnRlcnZhbCk7XG5cdFx0XHR2YXIgaGlkZURhdGUgPSBmYWxzZTtcblx0XHRcdGlmKCBkcmFnSW50ID09IDE0IHx8IGRyYWdJbnQgPT0gMzApe1xuXHRcdFx0XHRoaWRlRGF0ZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRmb3IoaT0wLGlMZW49aERhdGFbc10ubGVuZ3RoO2k8aUxlbjtpKyspe1xuXHRcdFx0XHRsZW5ndGg9aERhdGFbc11baV0uZHVyYXRpb24qZGF5c1dpZHRoO1xuXHRcdFx0XHR4ID0geCtsZW5ndGg7XG5cdFx0XHRcdHhpID0geCAtIGJvcmRlcldpZHRoICsgb2Zmc2V0O1xuXHRcdFx0XHRjb250ZXh0Lm1vdmVUbyh4aSx5aSk7XG5cdFx0XHRcdGNvbnRleHQubGluZVRvKHhpLHlmKTtcblx0XHRcdFx0XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuc2F2ZSgpO1xuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZvbnQgPSAnNnB0IEFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJztcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC50ZXh0QWxpZ24gPSAnbGVmdCc7XG5cdFx0XHRcdGNvbnRleHQuX2NvbnRleHQudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG5cdFx0XHRcdC8vIGRhdGUgaGlkZSBvbiBzcGVjaWZpYyB2aWV3c1xuXHRcdFx0XHRpZiAoaGlkZURhdGUpIHtcblx0XHRcdFx0XHRcdGNvbnRleHQuX2NvbnRleHQuZm9udCA9ICcxcHQgQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRjb250ZXh0Ll9jb250ZXh0LmZpbGxUZXh0KGhEYXRhW3NdW2ldLnRleHQsIHgtbGVuZ3RoKzQwLHlpK3Jvd0hlaWdodC8yKTtcblx0XHRcdFx0Y29udGV4dC5fY29udGV4dC5yZXN0b3JlKCk7XG5cblx0XHRcdH1cblx0XHRcdGNvbnRleHQuc3Ryb2tlU2hhcGUodGhpcyk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdH1cblxuXHR9LFxuXHRyZW5kZXJCYWNrTGF5ZXI6IGZ1bmN0aW9uKCl7XG5cdFx0XG5cblx0fVxuXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtDYW52YXNWaWV3OyIsImZ1bmN0aW9uIHByZXBhcmVBZGRGb3JtKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgJCgnLm1hc3RoZWFkIC5pbmZvcm1hdGlvbicpLnRyYW5zaXRpb24oJ3NjYWxlIGluJyk7XG5cbiAgJCgnLnVpLm5ldy10YXNrJykucG9wdXAoKTtcblxuICAkKCcudWkuZm9ybScpLmZvcm0oe1xuICAgIG5hbWU6IHtcbiAgICAgIGlkZW50aWZpZXIgIDogJ25hbWUnLFxuICAgICAgcnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgICA6ICdlbXB0eScsXG4gICAgICAgICAgcHJvbXB0IDogJ1BsZWFzZSBlbnRlciBhIHRhc2sgbmFtZSdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgY29tcGxldGU6IHtcbiAgICAgIGlkZW50aWZpZXIgIDogJ2NvbXBsZXRlJyxcbiAgICAgIHJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlICAgOiAnZW1wdHknLFxuICAgICAgICAgIHByb21wdCA6ICdQbGVhc2UgZW50ZXIgYW4gZXN0aW1hdGUgZGF5cydcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgc3RhcnQ6IHtcbiAgICAgIGlkZW50aWZpZXIgOiAnc3RhcnQnLFxuICAgICAgcnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUgICA6ICdlbXB0eScsXG4gICAgICAgICAgcHJvbXB0IDogJ1BsZWFzZSBzZXQgYSBzdGFydCBkYXRlJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBlbmQ6IHtcbiAgICAgIGlkZW50aWZpZXIgOiAnZW5kJyxcbiAgICAgIHJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlICAgOiAnZW1wdHknLFxuICAgICAgICAgIHByb21wdCA6ICdQbGVhc2Ugc2V0IGFuIGVuZCBkYXRlJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBkdXJhdGlvbjoge1xuICAgICAgaWRlbnRpZmllciA6ICdkdXJhdGlvbicsXG4gICAgICBydWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZSAgIDogJ2VtcHR5JyxcbiAgICAgICAgICBwcm9tcHQgOiAnUGxlYXNlIHNldCBhIHZhbGlkIGR1cmF0aW9uJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBzdGF0dXM6IHtcbiAgICAgIGlkZW50aWZpZXIgIDogJ3N0YXR1cycsXG4gICAgICBydWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZSAgIDogJ2VtcHR5JyxcbiAgICAgICAgICBwcm9tcHQgOiAnUGxlYXNlIHNlbGVjdCBhIHN0YXR1cydcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gIH0pO1xuXG5cbiAgLy8gd2hhdCBpcyAxMDg/Pz9cbiAgJCgnLnVpLmRyb3Bkb3duJykuZHJvcGRvd24oJ3NldCBzZWxlY3RlZCcsICcxMDgnKTtcbiAgJCgnaW5wdXRbbmFtZT1cInN0YXR1c1wiXScpLnZhbCgxMDgpO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5yZW1vdmUtaXRlbSBidXR0b24nLGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCd1bCcpLmZhZGVPdXQoMTAwMCwgZnVuY3Rpb24oKXtcbiAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByZXBhcmVBZGRGb3JtO1xuIiwiZnVuY3Rpb24gQ29udGV4dE1lbnVWaWV3KGFwcCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLmFwcCA9IGFwcDtcclxufVxyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICQoJy50YXNrLWNvbnRhaW5lcicpLmNvbnRleHRNZW51KHtcclxuICAgICAgICBzZWxlY3RvcjogJ2RpdicsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMucGFyZW50KCkpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHNlbGYuYXBwLnRhc2tzLmdldChpZCk7XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ2RlbGV0ZScpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Byb3BlcnRpZXMnKXtcclxuICAgICAgICAgICAgICAgIHZhciAkcHJvcGVydHkgPSAnLnByb3BlcnR5LSc7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcxMDgnOiAnUmVhZHknLFxyXG4gICAgICAgICAgICAgICAgICAgICcxMDknOiAnT3BlbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJzExMCc6ICdDb21wbGV0ZSdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgJGVsID0gJChkb2N1bWVudCk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ25hbWUnKS5odG1sKG1vZGVsLmdldCgnbmFtZScpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZGVzY3JpcHRpb24nKS5odG1sKG1vZGVsLmdldCgnZGVzY3JpcHRpb24nKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXJ0JykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpKTtcclxuICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZW5kJykuaHRtbChjb252ZXJ0RGF0ZShtb2RlbC5nZXQoJ2VuZCcpKSk7XHJcbiAgICAgICAgICAgICAgICAkZWwuZmluZCgkcHJvcGVydHkrJ3N0YXR1cycpLmh0bWwoc3RhdHVzW21vZGVsLmdldCgnc3RhdHVzJyldKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdGFydGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ3N0YXJ0JykpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuZGRhdGUgPSBuZXcgRGF0ZShtb2RlbC5nZXQoJ2VuZCcpKTtcclxuICAgICAgICAgICAgICAgIHZhciBfTVNfUEVSX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHJcbiAgICAgICAgICAgICAgICBpZihzdGFydGRhdGUgIT0gXCJcIiAmJiBlbmRkYXRlICE9IFwiXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB1dGMxID0gRGF0ZS5VVEMoc3RhcnRkYXRlLmdldEZ1bGxZZWFyKCksIHN0YXJ0ZGF0ZS5nZXRNb250aCgpLCBzdGFydGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdXRjMiA9IERhdGUuVVRDKGVuZGRhdGUuZ2V0RnVsbFllYXIoKSwgZW5kZGF0ZS5nZXRNb250aCgpLCBlbmRkYXRlLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGVsLmZpbmQoJHByb3BlcnR5KydkdXJhdGlvbicpLmh0bWwoTWF0aC5mbG9vcigodXRjMiAtIHV0YzEpIC8gX01TX1BFUl9EQVkpKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICRlbC5maW5kKCRwcm9wZXJ0eSsnZHVyYXRpb24nKS5odG1sKE1hdGguZmxvb3IoMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJCgnLnVpLnByb3BlcnRpZXMnKS5tb2RhbCgnc2V0dGluZycsICd0cmFuc2l0aW9uJywgJ3ZlcnRpY2FsIGZsaXAnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tb2RhbCgnc2hvdycpXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY29udmVydERhdGUoaW5wdXRGb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBwYWQocykgeyByZXR1cm4gKHMgPCAxMCkgPyAnMCcgKyBzIDogczsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoaW5wdXRGb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbcGFkKGQuZ2V0RGF0ZSgpKSwgcGFkKGQuZ2V0TW9udGgoKSsxKSwgZC5nZXRGdWxsWWVhcigpXS5qb2luKCcvJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAncm93QWJvdmUnKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRUYXNrKGRhdGEsICdhYm92ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGtleSA9PT0gJ3Jvd0JlbG93Jyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFRhc2soe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZV9pZCA6IGlkXHJcbiAgICAgICAgICAgICAgICB9LCAnYmVsb3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihrZXkgPT09ICdpbmRlbnQnKXtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmV4cGFuZC1tZW51JykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsX2lkID0gJCh0aGlzKS5jbG9zZXN0KCdkaXYnKS5wcmV2KCkuZmluZCgnLnN1Yi10YXNrJykubGFzdCgpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldk1vZGVsID0gdGhpcy5hcHAudGFza3MuZ2V0KHJlbF9pZCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50X2lkID0gcHJldk1vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldCgncGFyZW50aWQnLCBwYXJlbnRfaWQpO1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRvYmVDaGlsZCA9ICQodGhpcykubmV4dCgpLmNoaWxkcmVuKCk7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0b2JlQ2hpbGQsIGZ1bmN0aW9uKGluZGV4LCBkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRJZCA9ICQodGhpcykuYXR0cignaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChjaGlsZElkKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLHBhcmVudF9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRNb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3Rhc2snKS5hZGRDbGFzcygnc3ViLXRhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMzBweCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoa2V5ID09PSAnb3V0ZGVudCcpe1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0KCdwYXJlbnRpZCcsMCk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9iZUNoaWxkID0gJCh0aGlzKS5wYXJlbnQoKS5jaGlsZHJlbigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJJbmRleCA9ICQodGhpcykuaW5kZXgoKTtcclxuICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKHRvYmVDaGlsZCwgZnVuY3Rpb24oaW5kZXgsIGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGluZGV4ID4gY3VyckluZGV4KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkSWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZE1vZGVsID0gc2VsZi5hcHAudGFza3MuZ2V0KGNoaWxkSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE1vZGVsLnNldCgncGFyZW50aWQnLG1vZGVsLmdldCgnaWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTW9kZWwuc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wcmVwZW5kKCc8bGkgY2xhc3M9XCJleHBhbmQtbWVudVwiPjxpIGNsYXNzPVwidHJpYW5nbGUgdXAgaWNvblwiPjwvaT4gPC9saT4nKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3N1Yi10YXNrJykuYWRkQ2xhc3MoJ3Rhc2snKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdwYWRkaW5nLWxlZnQnOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FudmFzVmlldy5yZW5kZXJncm91cHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgXCJyb3dBYm92ZVwiOiB7bmFtZTogXCJOZXcgUm93IEFib3ZlXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInJvd0JlbG93XCI6IHtuYW1lOiBcIk5ldyBSb3cgQmVsb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwiaW5kZW50XCI6IHtuYW1lOiBcIkluZGVudCBSb3dcIiwgaWNvbjogXCJcIn0sXHJcbiAgICAgICAgICAgIFwib3V0ZGVudFwiOiB7bmFtZTogXCJPdXRkZW50IFJvd1wiLCBpY29uOiBcIlwifSxcclxuICAgICAgICAgICAgXCJzZXAxXCI6IFwiLS0tLS0tLS0tXCIsXHJcbiAgICAgICAgICAgIFwicHJvcGVydGllc1wiOiB7bmFtZTogXCJQcm9wZXJ0aWVzXCIsIGljb246IFwiXCJ9LFxyXG4gICAgICAgICAgICBcInNlcDJcIjogXCItLS0tLS0tLS1cIixcclxuICAgICAgICAgICAgXCJkZWxldGVcIjoge25hbWU6IFwiRGVsZXRlIFJvd1wiLCBpY29uOiBcIlwifVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuQ29udGV4dE1lbnVWaWV3LnByb3RvdHlwZS5hZGRUYXNrID0gZnVuY3Rpb24oZGF0YSwgaW5zZXJ0UG9zKSB7XHJcbiAgICB2YXIgc29ydGluZGV4ID0gMDtcclxuICAgIHZhciByZWZfbW9kZWwgPSB0aGlzLmFwcC50YXNrcy5nZXQoZGF0YS5yZWZlcmVuY2VfaWQpO1xyXG4gICAgaWYgKHJlZl9tb2RlbCkge1xyXG4gICAgICAgIHNvcnRpbmRleCA9IHJlZl9tb2RlbC5nZXQoJ3NvcnRpbmRleCcpICsgKGluc2VydFBvcyA9PT0gJ2Fib3ZlJyA/IC0wLjUgOiAwLjUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNvcnRpbmRleCA9ICh0aGlzLmFwcC50YXNrcy5sYXN0KCkuZ2V0KCdzb3J0aW5kZXgnKSArIDEpO1xyXG4gICAgfVxyXG4gICAgZGF0YS5zb3J0aW5kZXggPSBzb3J0aW5kZXg7XHJcbiAgICBkYXRhLnBhcmVudGlkID0gcmVmX21vZGVsLmdldCgncGFyZW50aWQnKTtcclxuICAgIHZhciB0YXNrID0gdGhpcy5hcHAudGFza3MuYWRkKGRhdGEsIHtwYXJzZSA6IHRydWV9KTtcclxuICAgIHRhc2suc2F2ZSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0TWVudVZpZXc7IiwiXG52YXIgdGVtcGxhdGUgPSBcIjxkaXY+XFxyXFxuICAgIDx1bD5cXHJcXG4gICAgICAgIDwlIHZhciBzZXR0aW5nPWFwcC5zZXR0aW5nOyU+XFxyXFxuICAgICAgICA8JSBpZihpc1BhcmVudCl7ICU+IDxsaSBjbGFzcz1cXFwiZXhwYW5kLW1lbnVcXFwiPjxpIGNsYXNzPVxcXCJ0cmlhbmdsZSBkb3duIGljb25cXFwiPjwvaT48L2xpPjwlIH0gJT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLW5hbWVcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwibmFtZVxcXCIsbmFtZSkpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1zdGFydFxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJzdGFydFxcXCIsc3RhcnQpKTslPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1lbmRcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwiZW5kXFxcIixlbmQpKTsgJT48L2xpPlxcclxcbiAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2wtY29tcGxldGVcXFwiPjwlIHByaW50KHNldHRpbmcuY29uRFRvVChcXFwiY29tcGxldGVcXFwiLGNvbXBsZXRlKSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwiY29sLXN0YXR1c1xcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJzdGF0dXNcXFwiLHN0YXR1cykpOyAlPjwvbGk+XFxyXFxuICAgICAgICA8bGkgY2xhc3M9XFxcImNvbC1kdXJhdGlvblxcXCI+PCUgcHJpbnQoc2V0dGluZy5jb25EVG9UKFxcXCJkdXJhdGlvblxcXCIsMCx7XFxcInN0YXJ0XFxcIjpzdGFydCxcXFwiZW5kXFxcIjplbmR9KSk7ICU+PC9saT5cXHJcXG4gICAgICAgIDxsaSBjbGFzcz1cXFwicmVtb3ZlLWl0ZW1cXFwiPjxidXR0b24gY2xhc3M9XFxcIm1pbmkgcmVkIHVpIGJ1dHRvblxcXCI+IDxpIGNsYXNzPVxcXCJzbWFsbCB0cmFzaCBpY29uXFxcIj48L2k+PC9idXR0b24+PC9saT5cXHJcXG4gICAgPC91bD5cXHJcXG48L2Rpdj5cIjtcblxudmFyIFRhc2tJdGVtVmlldz1CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWUgOiAnbGknLFxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSh0ZW1wbGF0ZSksXG5cdGlzUGFyZW50OiBmYWxzZSxcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHR0aGlzLmFwcCA9IHBhcmFtcy5hcHA7XG5cdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLm1vZGVsLCdlZGl0cm93Jyx0aGlzLmVkaXQpO1xuXHRcdHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwnY2hhbmdlOm5hbWUgY2hhbmdlOnN0YXJ0IGNoYW5nZTplbmQgY2hhbmdlOmNvbXBsZXRlIGNoYW5nZTpzdGF0dXMnLHRoaXMucmVuZGVyUm93KTtcblx0XHR0aGlzLiRlbC5ob3ZlcihmdW5jdGlvbihlKXtcblx0XHRcdCQoZG9jdW1lbnQpLmZpbmQoJy5pdGVtLXNlbGVjdG9yJykuc3RvcCgpLmNzcyh7XG5cdFx0XHRcdHRvcDogKCQoZS5jdXJyZW50VGFyZ2V0KS5vZmZzZXQoKS50b3ApKydweCdcblx0XHRcdH0pLmZhZGVJbigpO1xuXHRcdH0sIGZ1bmN0aW9uKCl7XG5cdFx0XHQkKGRvY3VtZW50KS5maW5kKCcuaXRlbS1zZWxlY3RvcicpLnN0b3AoKS5mYWRlT3V0KCk7XG5cdFx0fSk7XG5cdFx0dGhpcy4kZWwub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xuXHRcdFx0JChkb2N1bWVudCkuZmluZCgnLml0ZW0tc2VsZWN0b3InKS5zdG9wKCkuZmFkZU91dCgpO1xuXHRcdH0pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKHBhcmVudCl7XG5cdFx0dmFyIGFkZENsYXNzPSdzdWItdGFzayBkcmFnLWl0ZW0nO1xuXHRcdFxuXHRcdGlmKHBhcmVudCl7XG5cdFx0XHRhZGRDbGFzcz1cInRhc2tcIjtcblx0XHRcdHRoaXMuaXNQYXJlbnQgPSB0cnVlO1xuXHRcdFx0dGhpcy5zZXRFbGVtZW50KCQoJzxkaXY+JykpO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5pc1BhcmVudCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5zZXRFbGVtZW50KCQoJzxsaT4nKSk7XG5cdFx0XHR0aGlzLiRlbC5kYXRhKHtcblx0XHRcdFx0aWQgOiB0aGlzLm1vZGVsLmlkXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoYWRkQ2xhc3MpO1xuXHRcdHRoaXMuJGVsLmF0dHIoJ2lkJywgdGhpcy5tb2RlbC5jaWQpO1xuXHRcdHJldHVybiB0aGlzLnJlbmRlclJvdygpO1xuXHR9LFxuXHRyZW5kZXJSb3c6ZnVuY3Rpb24oKXtcblx0XHR2YXIgZGF0YSA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cdFx0ZGF0YS5pc1BhcmVudCA9IHRoaXMuaXNQYXJlbnQ7XG4vL1x0XHRpZiAodGhpcy5pc1BhcmVudCkge1xuLy9cdFx0XHR0aGlzLiRoYW5kbGUuaHRtbCh0aGlzLnRlbXBsYXRlKGRhdGEpKTtcbi8vXHRcdH0gZWxzZSB7XG5cdFx0ZGF0YS5hcHAgPSB0aGlzLmFwcDtcblx0XHR0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUoZGF0YSkpO1xuLy9cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRlZGl0OmZ1bmN0aW9uKGV2dCl7XG5cdFx0dmFyIHRhcmdldCA9ICQoZXZ0LnRhcmdldCk7XG5cdFx0dmFyIHdpZHRoICA9IHBhcnNlSW50KHRhcmdldC5jc3MoJ3dpZHRoJyksIDEwKSAtIDU7XG5cdFx0dmFyIGZpZWxkID0gdGFyZ2V0LmF0dHIoJ2NsYXNzJykuc3BsaXQoJy0nKVsxXTtcblx0XHR2YXIgZm9ybSA9IHRoaXMuYXBwLnNldHRpbmcuZ2V0Rm9ybUVsZW0oZmllbGQsdGhpcy5tb2RlbCx0aGlzLm9uRWRpdCx0aGlzKTtcblx0XHRmb3JtLmNzcyh7d2lkdGg6d2lkdGgrJ3B4JyxoZWlnaHQ6JzEwcHgnfSk7XG5cdFx0dGFyZ2V0Lmh0bWwoZm9ybSk7XG5cdFx0Zm9ybS5mb2N1cygpO1xuXHR9LFxuXHRvbkVkaXQ6ZnVuY3Rpb24obmFtZSx2YWx1ZSl7XG5cdFx0aWYobmFtZT09PSdkdXJhdGlvbicpe1xuXHRcdFx0dmFyIHN0YXJ0PXRoaXMubW9kZWwuZ2V0KCdzdGFydCcpO1xuXHRcdFx0dmFyIGVuZD1zdGFydC5jbG9uZSgpLmFkZERheXMocGFyc2VJbnQodmFsdWUsIDEwKS0xKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCdlbmQnLGVuZCk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLm1vZGVsLnNldChuYW1lLHZhbHVlKTtcblx0XHRcdHRoaXMubW9kZWwuc2F2ZSgpOy8vMVxuXHRcdC8vVGhpcyBoYXMgdG8gYmUgY2FsbGVkIGluIGNhc2Ugbm8gY2hhbmdlIHRha2VzIHBsYWNlXG5cdFx0fVxuXHRcdHRoaXMucmVuZGVyUm93KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhc2tJdGVtVmlldztcbiIsInZhciBUYXNrSXRlbVZpZXcgPSByZXF1aXJlKCcuL1Rhc2tJdGVtVmlldycpO1xuXG52YXIgVGFza1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICdsaScsXG5cdGNsYXNzTmFtZTogJ3Rhc2stbGlzdC1jb250YWluZXIgZHJhZy1pdGVtJyxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihwYXJhbXMpe1xuXHRcdHRoaXMuYXBwID0gcGFyYW1zLmFwcDtcblx0XHR0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6YWN0aXZlJywgdGhpcy50b2dnbGVQYXJlbnQpO1xuXHR9LFxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLnRhc2sgLmV4cGFuZC1tZW51JzogJ2hhbmRsZUNsaWNrJyxcblx0XHQnY2xpY2sgLmFkZC1pdGVtIGJ1dHRvbic6ICdhZGRJdGVtJyxcblx0XHQnY2xpY2sgLnJlbW92ZS1pdGVtIGJ1dHRvbic6ICdyZW1vdmVJdGVtJ1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHBhcmVudCA9IHRoaXMubW9kZWw7XG5cdFx0dmFyIGl0ZW1WaWV3ID0gbmV3IFRhc2tJdGVtVmlldyh7XG5cdFx0XHRtb2RlbCA6IHBhcmVudCxcblx0XHRcdGFwcCA6IHRoaXMuYXBwXG5cdFx0fSk7XG5cblx0XHR0aGlzLiRwYXJlbnRlbCA9IGl0ZW1WaWV3LnJlbmRlcih0cnVlKS4kZWw7XG5cdFx0dGhpcy4kZWwuYXBwZW5kKHRoaXMuJHBhcmVudGVsKTtcblxuXHRcdHRoaXMuJGVsLmRhdGEoe1xuXHRcdFx0aWQgOiBwYXJlbnQuaWRcblx0XHR9KTtcblx0XHR0aGlzLiRjaGlsZGVsID0gJCgnPG9sIGNsYXNzPVwic3ViLXRhc2stbGlzdCBzb3J0YWJsZVwiPjwvb2w+Jyk7XG5cblx0XHR0aGlzLiRlbC5hcHBlbmQodGhpcy4kY2hpbGRlbCk7XG5cdFx0dmFyIGNoaWxkcmVuID0gXy5zb3J0QnkodGhpcy5tb2RlbC5jaGlsZHJlbi5tb2RlbHMsIGZ1bmN0aW9uKG1vZGVsKXtcblx0XHRcdHJldHVybiBtb2RlbC5nZXQoJ3NvcnRpbmRleCcpO1xuXHRcdH0pO1xuXHRcdGZvcih2YXIgaT0wO2k8Y2hpbGRyZW4ubGVuZ3RoO2krKyl7XG5cdFx0XHRpdGVtVmlldz1uZXcgVGFza0l0ZW1WaWV3KHttb2RlbDpjaGlsZHJlbltpXSwgYXBwIDogdGhpcy5hcHB9KTtcblx0XHRcdGl0ZW1WaWV3LnJlbmRlcigpO1xuXHRcdFx0dGhpcy4kY2hpbGRlbC5hcHBlbmQoaXRlbVZpZXcuZWwpO1xuXHRcdH1cblx0XHR0aGlzLnRvZ2dsZVBhcmVudCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRoYW5kbGVDbGljazpmdW5jdGlvbihldil7XG5cdFx0dmFyIHZpc2libGU9dGhpcy4kY2hpbGRlbC5pcygnOnZpc2libGUnKVxuXHRcdHRoaXMubW9kZWwuc2V0KCdhY3RpdmUnLCF2aXNpYmxlKTtcblx0XHR0aGlzLm1vZGVsLnNhdmUoKTtcblx0XHQvL3RoaXMudG9nZ2xlUGFyZW50KCk7XG5cdH0sXG5cdGFkZEl0ZW06IGZ1bmN0aW9uKGV2dCl7XG5cdFx0JChldnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndWwnKS5uZXh0KCkuYXBwZW5kKCc8dWwgY2xhc3M9XCJzdWItdGFza1wiIGlkPVwiYycrTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDEwMDAwKSArIDEpKydcIj48bGkgY2xhc3M9XCJjb2wtbmFtZVwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiTmV3IHBsYW5cIiBzaXplPVwiMzhcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1zdGFydFwiPjxpbnB1dCB0eXBlPVwiZGF0ZVwiIHBsYWNlaG9sZGVyPVwiU3RhcnQgRGF0ZVwiIHN0eWxlPVwid2lkdGg6ODBweDtcIj48L2xpPjxsaSBjbGFzcz1cImNvbC1lbmRcIj48aW5wdXQgdHlwZT1cImRhdGVcIiBwbGFjZWhvbGRlcj1cIkVuZCBEYXRlXCIgc3R5bGU9XCJ3aWR0aDo4MHB4O1wiPjwvbGk+PGxpIGNsYXNzPVwiY29sLWNvbXBsZXRlXCI+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIjJcIiBzdHlsZT1cIndpZHRoOiAzMHB4O21hcmdpbi1sZWZ0OiAtMTRweDtcIiBtaW49XCIwXCI+PC9saT48bGkgY2xhc3M9XCJjb2wtc3RhdHVzXCI+PHNlbGVjdCBzdHlsZT1cIndpZHRoOiA3MHB4O1wiPjxvcHRpb24gdmFsdWU9XCJpbmNvbXBsZXRlXCI+SW5vbXBsZXRlZDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCJjb21wbGV0ZWRcIj5Db21wbGV0ZWQ8L29wdGlvbj48L3NlbGVjdD48L2xpPjxsaSBjbGFzcz1cImNvbC1kdXJhdGlvblwiPjxpbnB1dCB0eXBlPVwibnVtYmVyXCIgcGxhY2Vob2xkZXI9XCIyNFwiIHN0eWxlPVwid2lkdGg6IDMycHg7bWFyZ2luLWxlZnQ6IC04cHg7XCIgbWluPVwiMFwiPiBkPC9saT48bGkgY2xhc3M9XCJyZW1vdmUtaXRlbVwiPjxidXR0b24gY2xhc3M9XCJtaW5pIHJlZCB1aSBidXR0b25cIj4gPGkgY2xhc3M9XCJzbWFsbCB0cmFzaCBpY29uXCI+PC9pPjwvYnV0dG9uPjwvbGk+PC91bD4nKS5oaWRlKCkuc2xpZGVEb3duKCk7XG5cdH0sXG5cdHJlbW92ZUl0ZW06IGZ1bmN0aW9uKGV2dCl7XG5cdFx0dmFyICRwYXJlbnRVTCA9ICQoZXZ0LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ29sIHVsJykucGFyZW50KCkucGFyZW50KCk7XG5cdFx0dmFyIGlkID0gJHBhcmVudFVMLmF0dHIoJ2lkJyk7XG5cdFx0dmFyIHRhc2tNb2RlbCA9IHRoaXMuYXBwLnRhc2tzLmdldChpZCk7XG5cdFx0aWYoJHBhcmVudFVMLmhhc0NsYXNzKCd0YXNrJykpe1xuXHRcdFx0JHBhcmVudFVMLm5leHQoJ29sJykuZmFkZU91dCgxMDAwLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fWVsc2V7XG5cdFx0XHQkKGV2dC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd1bCcpLmZhZGVPdXQoMTAwMCwgZnVuY3Rpb24oKXtcblx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0YXNrTW9kZWwuZGVzdHJveSgpO1xuXHR9LFxuXHR0b2dnbGVQYXJlbnQ6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGFjdGl2ZT10aGlzLm1vZGVsLmdldCgnYWN0aXZlJyk7XG5cdFx0dmFyIHN0cj1hY3RpdmU/JzxpIGNsYXNzPVwidHJpYW5nbGUgdXAgaWNvblwiPjwvaT4gJzonPGkgY2xhc3M9XCJ0cmlhbmdsZSBkb3duIGljb25cIj48L2k+Jztcblx0XHR0aGlzLiRjaGlsZGVsLnNsaWRlVG9nZ2xlKCk7XG5cdFx0dGhpcy4kcGFyZW50ZWwuZmluZCgnLmV4cGFuZC1tZW51JykuaHRtbChzdHIpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUYXNrVmlldztcbiJdfQ==
