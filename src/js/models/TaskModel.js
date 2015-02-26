"use strict";

var ResCollection = require('../collections/ResourceReferenceCollection');

var util = require('../utils/util');
var params = util.getURLParams();

var SubTasks = Backbone.Collection.extend({
    comparator : function(model) {
        return model.get('sortindex');
    }
});

var resLinks = new ResCollection();
resLinks.fetch();

var TaskModel = Backbone.Model.extend({
    defaults: {
        // MAIN PARAMS
        name: 'New task',
        description: '',
        complete: 0,  // 0% - 100% percents
        sortindex: 0,   // place on side menu, starts from 0
        depend: undefined,  // id of task
        status: '110',      // 110 - complete, 109  - open, 108 - ready
        start: new Date(),
        end: new Date(),
        parentid: 0,
        Comments : 0,

        color: '#0090d3',   // user color, not used for now

        // some additional properties
        resources : [],         //list of id
        health: 21,
        reportable: false,
        wo: 2,                  //Select List in properties modal   (configdata)
        milestone: false,       //Check box in properties modal (true/false)
        deliverable: false,     //Check box in properties modal (true/false)
        financial: false,       //Check box in properties modal (true/false)
        timesheets: false,      //Check box in properties modal (true/false)
        acttimesheets: false,   //Check box in properties modal (true/false)

        // server specific params
        // don't use them on client side
        ProjectRef : params.project,
        WBS_ID : params.profile,
        sitekey: params.sitekey,


        // params for application views
        // should be removed from JSON
        hidden : false,
        collapsed : false,
        hightlight : ''
    },
    initialize : function() {
        this.children = new SubTasks();
        this.listenTo(this.children, 'change:parentid', function(child) {
            if (child.get('parentid') === this.id) {
                return;
            }
            this.children.remove(child);
        });
        this.listenTo(this.children, 'add', function(child) {
            child.parent = this;
        });
        this.listenTo(this.children, 'change:sortindex', function() {
            this.children.sort();
        });
        this.listenTo(this.children, 'add remove change:start change:end', function() {
            this._checkTime();
        });

        this.listenTo(this, 'change:collapsed', function() {
            this.children.each(function(child) {
                if (this.get('collapsed')) {
                    child.hide();
                } else {
                    child.show();
                }
            }.bind(this));
        });
        this.listenTo(this, 'destroy', function() {
            this.children.toArray().forEach(function(child) {
                child.destroy();
            });
            this.stopListening();
        });

        // checking nested state
        this.listenTo(this.children, 'add remove', this._checkNested);

        // time checking
        this.listenTo(this.children, 'add remove change:complete', this._checkComplete);

        this.listenTo(this, 'change:resources', function() {
            resLinks.updateResourcesForTask(this);
        });
    },
    isNested : function() {
        return !!this.children.length;
    },
    show : function() {
        this.set('hidden', false);
    },
    hide : function() {
        this.set('hidden', true);
    },
    dependOn : function(beforeModel, silent) {
        this.set('depend', beforeModel.id);
        this.beforeModel = beforeModel;
        if (this.get('start') < beforeModel.get('end')) {
            this.moveToStart(beforeModel.get('end'));
        }
        if (!silent) {
            this.save();
        }
        this._listenBeforeModel();
    },
    toJSON : function() {
        var json = Backbone.Model.prototype.toJSON.call(this);
        delete json.resources;
        delete json.hidden;
        delete json.collapsed;
        delete json.hightlight;
        return json;
    },
    clearDependence : function() {
        if (this.beforeModel) {
            this.stopListening(this.beforeModel);
            this.unset('depend').save();
            this.beforeModel = undefined;
        }
    },
    hasParent : function(parentForCheck) {
        var parent = this.parent;
        while(true) {
            if (!parent) {
                return false;
            }
            if (parent === parentForCheck) {
                return true;
            }
            parent = parent.parent;
        }
    },
    _listenBeforeModel : function() {
        this.listenTo(this.beforeModel, 'destroy', function() {
            this.clearDependence();
        });
        this.listenTo(this.beforeModel, 'change:end', function() {
            if (this.parent && this.parent.underMoving) {
                return;
            }
            // check infinite depend loop
            var before = this;
            var befores = [];
            while(true) {
                before = before.beforeModel;
                if (!before) {
                    break;
                }
                if (befores.indexOf(before) !== -1) {
                    return;
                }
                befores.push(before);
            }
            if (this.get('start') < this.beforeModel.get('end')) {
                this.moveToStart(this.beforeModel.get('end'));
            }
        });
    },
    _checkNested : function() {
        this.trigger('nestedStateChange', this);
    },
    parse: function(response) {
        var start, end;
        if(_.isString(response.start)){
            start = Date.parseExact(util.correctdate(response.start),'dd/MM/yyyy') ||
                             new Date(response.start);
        } else {
            start = new Date();
        }
        
        if(_.isString(response.end)){
            end = Date.parseExact(util.correctdate(response.end),'dd/MM/yyyy') ||
                           new Date(response.end);
        } else {
            end = new Date();
        }

        response.start = start < end ? start : end;
        response.end = start < end ? end : start;

        response.parentid = parseInt(response.parentid || '0', 10);

        // remove null params
        _.each(response, function(val, key) {
            if (val === null) {
                delete response[key];
            }
        });

        // update resources as list of ID
        var ids = [];
        (response.Resources || []).forEach(function(resInfo) {
            ids.push(resInfo.ResID);
        });
        response.Resources = undefined;
        response.resources = ids;
        return response;
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
            if(childStartTime < startTime) {
                startTime = childStartTime;
            }
            if(childEndTime > endTime){
                endTime = childEndTime;
            }
        }.bind(this));
        this.set('start', startTime);
        this.set('end', endTime);
    },
    _checkComplete : function() {
        var complete = 0;
        var length = this.children.length;
        if (length) {
            this.children.each(function(child) {
                complete += child.get('complete') / length;
            });
        }
        this.set('complete', Math.round(complete));
    },
    moveToStart : function(newStart) {
        // do nothing if new start is the same as current
        if (newStart.toDateString() === this.get('start').toDateString()) {
            return;
        }

        // calculate offset
//        var daysDiff = Math.floor((newStart.time() - this.get('start').time()) / 1000 / 60 / 60 / 24)
        var daysDiff = Date.daysdiff(newStart, this.get('start')) - 1;
        if (newStart < this.get('start')) {
            daysDiff *= -1;
        }

        // change dates
        this.set({
            start : newStart.clone(),
            end : this.get('end').clone().addDays(daysDiff)
        });

        // changes dates in all children
        this.underMoving = true;
        this._moveChildren(daysDiff);
        this.underMoving = false;
    },
    _moveChildren : function(days) {
        this.children.each(function(child) {
            child.move(days);
        });
    },
    saveWithChildren : function() {
        this.save();
        this.children.each(function(task) {
            task.saveWithChildren();
        });
    },
    move : function(days) {
        this.set({
            start: this.get('start').clone().addDays(days),
            end: this.get('end').clone().addDays(days)
        });
        this._moveChildren(days);
    }
});

module.exports = TaskModel;
