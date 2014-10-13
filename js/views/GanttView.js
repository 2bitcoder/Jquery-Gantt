var app = app || {};app.GanttView = Backbone.View.extend({    el: '.Gantt',    initialize: function() {        this.collection = app.THCollection;        this.$container = this.$el.find('.task-container');        this.$control = this.$el.find('.head-bar');        this.$newtask = this.$el.find('.ui.new-task');        this.$parent = this.$el.find('#submitFrom');        this.$parent.on('click', this.submitForm);        this.$el.find('input[name="end"],input[name="start"]').on('change', this.calculateDuration);        this.$menuContainer = this.$el.find('.menu-container');        console.log(this);        this.makeSortable();        this.defineContextMenu();    },    makeSortable: function() {        var that = this;        this.$container.sortable({axis: "y",revert: true,connectWith: ".task",             stop: function() {                that.canvasView.rendergroups();            }        });    },    events: {        'click #tHandle': 'expand',        'dblclick .sub-task': 'handlerowclick',        'hover .sub-task': 'showMask',        'click .head-bar button': 'handbuttonclick',        'click .new-task': 'openForm',        'click a[href="/#!/generate/"]': 'generatePdf'    },    defineContextMenu: function(){// Context menu$('.task-container').contextMenu({    selector: 'ul',     callback: function(key, options) {        if(key == 'delete'){            var id = $(this).attr('id');            var model = app.tasks.get(id);            model.set('action','delete');            model.save();            $(this).fadeOut(function(){                $(this).remove();                location.reload();            });        }        if(key == 'properties'){            var id = $(this).attr('id');            var model = app.tasks.get(id);            $property = '.property-';            var status = {                '108': 'Ready',                '109': 'Open',                '110': 'Complete'            };            var $el = $(document);            $el.find($property+'name').html(model.get('name'));            $el.find($property+'description').html(model.get('description'));            $el.find($property+'start').html(convertDate(model.get('start')));            $el.find($property+'end').html(convertDate(model.get('end')));            $el.find($property+'status').html(status[model.get('status')]);            var startdate = new Date(model.get('start'));            var enddate = new Date(model.get('end'));            var _MS_PER_DAY = 1000 * 60 * 60 * 24;            if(startdate != "" && enddate != ""){                var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());                var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());                $el.find($property+'duration').html(Math.floor((utc2 - utc1) / _MS_PER_DAY));            }else{                $el.find($property+'duration').html(Math.floor(0));            }            $('.ui.properties').modal('setting', 'transition', 'vertical flip')            .modal('show')            ;            function convertDate(inputFormat) {              function pad(s) { return (s < 10) ? '0' + s : s; }              var d = new Date(inputFormat);              return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');          }      }      if(key == 'rowAbove'){        var $el = $(document);        $el.find('input[name="insertPos"]').val('above');        var id = $(this).attr('id');        var model = app.tasks.get(id);        $el.find('input[name="reference_id"]').val(model.get('id'));        $('.ui.add-new-task').modal('setting', 'transition', 'vertical flip')        .modal('show')        ;    }    if(key == 'rowBelow'){        var $el = $(document);        $el.find('input[name="insertPos"]').val('below');        var id = $(this).attr('id');        var model = app.tasks.get(id);        $el.find('input[name="reference_id"]').val(model.get('id'));        $('.ui.add-new-task').modal('setting', 'transition', 'vertical flip')        .modal('show')        ;    }    if(key == 'indent'){     var id = $(this).attr('id');     var model = app.tasks.get(id);     $(this).find('.expand-menu').remove();     var rel_id = $(this).closest('div').prev().find('.sub-task').last().attr('id');     var prevModel = app.tasks.get(rel_id);     var parent_id = prevModel.get('parentid');     model.set('parentid', parent_id);     model.save();     var tobeChild = $(this).next().children();     jQuery.each(tobeChild, function(index, data){        var childId = $(this).attr('id');        var childModel = app.tasks.get(childId);        childModel.set('parentid',parent_id);        childModel.save();    });     $(this).removeClass('task').addClass('sub-task').css({        'padding-left': '30px'    });     location.reload(); } if(key == 'outdent'){    var id = $(this).attr('id');    var model = app.tasks.get(id);    model.set('parentid',0);    model.save();    var tobeChild = $(this).parent().children();    var currIndex = $(this).index();    jQuery.each(tobeChild, function(index, data){        if(index > currIndex){            var childId = $(this).attr('id');            var childModel = app.tasks.get(childId);            childModel.set('parentid',model.get('id'));            childModel.save();        }    });    $(this).prepend('<li class="expand-menu"><i class="triangle up icon"></i> </li>');    $(this).removeClass('sub-task').addClass('task').css({        'padding-left': '0px'    });    location.reload();    // this.canvasView.rendergroups();}},items: {    "rowAbove": {name: "New Row Above", icon: ""},    "rowBelow": {name: "New Row Below", icon: ""},    "indent": {name: "Indent Row", icon: ""},    "outdent": {name: "Outdent Row", icon: ""},    "sep1": "---------",    "properties": {name: "Properties", icon: ""},    "sep2": "---------",    "delete": {name: "Delete Row", icon: ""}}});},render: function() {    this.collection.each(function(task) {        this.addTask(task);    }, this);    stagebv = this.canvasView = new app.KCanvasView().render();},handlerowclick: function(evt) {    var id = evt.currentTarget.id;    app.tasks.get(id).trigger('editrow', evt);},handbuttonclick: function(evt) {    var button = $(evt.currentTarget);    var action = button.data('action');    var interval = action.split('-')[1];    app.setting.set('interval', interval);},generatePdf: function(evt){    window.print();    evt.preventDefault();},calculateDuration: function(evt){    // Calculating the duration from start and end date    var startdate = new Date($(document).find('input[name="start"]').val());    var enddate = new Date($(document).find('input[name="end"]').val());    var _MS_PER_DAY = 1000 * 60 * 60 * 24;    if(startdate != "" && enddate != ""){        var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());        var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());        $(document).find('input[name="duration"]').val(Math.floor((utc2 - utc1) / _MS_PER_DAY));    }else{        $(document).find('input[name="duration"]').val(Math.floor(0));    }},expand: function(evt) {    var target = $(evt.target);    var width = 0;    var setting = app.setting.getSetting('display');    if (target.hasClass('contract')) {        width = setting.tHiddenWidth;    }    else {        width = setting.tableWidth;    }    this.$menuContainer.css('width', width);        //console.log(this.canvasView);        this.canvasView.setWidth(setting.screenWidth - width - 20);        target.toggleClass('contract');        this.$menuContainer.find('.menu-header').toggleClass('menu-header-opened');    },    openForm: function() {        $('.ui.add-new-task').modal('setting', 'transition', 'vertical flip')        .modal('show')        ;    },    addTask: function(task) {        var taski = new app.TaskView({model: task});        this.$container.append(taski.render().el);    },    submitForm: function(evnt) {        $('button#submitForm').unbind('click');        $("#new-task-form").unbind('submit').submit(function(e) {            $ci_api = "ci_api/index.php/api/gantt/tasks";            $.ajax({                url: $ci_api,                type: 'POST',                data: $(this).serialize(),                success: function(data, textStatus, xhr) {                    console.log(data);                    $('.ui.modal').modal('hide');                    location.reload();                },                error: function(xhr, textStatus, errorThrown) {                    console.log('Error in Operation');                }            });            e.preventDefault();        });    },    renderButtons: function() {        var buttons = ['display-Expand', 'view-Daily', 'view-Weekly', 'view-Monthly', 'view-Quarterly'];        for (var i = 0; i < buttons.length; i++) {        }    }})