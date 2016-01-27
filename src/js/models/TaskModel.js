var ResCollection = require('../collections/ResourceReferenceCollection');

var util = require('../utils/util');
var params = util.getURLParams();

var SubTasks = Backbone.Collection.extend({
    comparator: function(model) {
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
        depend: [],  // id of tasks
        status: '110',      // 110 - complete, 109  - open, 108 - ready
        start: new Date(),
        end: new Date(),
        parentid: 0,
        Comments: 0,

        color: '#0090d3',   // user color, not used for now

        // some additional properties
        resources: [],         //list of id
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
        ProjectRef: params.project,
        WBS_ID: params.profile,
        sitekey: params.sitekey,


        // params for application views
        // should be removed from JSON
        hidden: false,
        collapsed: false,
        hightlight: ''
    },
    initialize: function() {
        // self validation
        this.listenTo(this, 'change:resources', function() {
            resLinks.updateResourcesForTask(this);
        });

        this.listenTo(this, 'change:milestone', function() {
            if (this.get('milestone')) {
                this.set('start', new Date(this.get('end')));
            }
        });

        // children references
        this.children = new SubTasks();
        this.depends = new Backbone.Collection();

        this.listenTo(this.children, 'add', function() {
            this.set('milestone', false);
        });

        // removing refs
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
        this._listenDependsCollection();
    },
    isNested: function() {
        return !!this.children.length;
    },
    show: function() {
        this.set('hidden', false);
    },
    hide: function() {
        this.set('hidden', true);
        this.children.forEach((child) => {
            child.hide();
        });
    },
    dependOn: function(beforeModel, silent) {
        this.depends.add(beforeModel, {silent: silent});
        if (this.get('start') < beforeModel.get('end')) {
            this.moveToStart(beforeModel.get('end'));
        }
        if (!silent) {
            this.save();
        }
    },
    hasInDeps: function (model) {
        return !!this.depends.get(model.id);
    },
    toJSON: function() {
        var json = Backbone.Model.prototype.toJSON.call(this);
        delete json.resources;
        delete json.hidden;
        delete json.collapsed;
        delete json.hightlight;
        json.depend = json.depend.join(',');
        return json;
    },
    hasParent: function(parentForCheck) {
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
    clearDependence: function() {
        this.depends.each((m) => {
            this.depends.remove(m);
        });
    },
    _listenDependsCollection: function() {
        this.listenTo(this.depends, 'remove add', function() {
            var ids = this.depends.map((m) => m.id);
            this.set('depend', ids).save();
        });

        this.listenTo(this.depends, 'add', function(beforeModel) {
            this.collection.trigger('depend:add', beforeModel, this);
        });

        this.listenTo(this.depends, 'remove', function(beforeModel) {
            this.collection.trigger('depend:remove', beforeModel, this);
        });

        this.listenTo(this.depends, 'change:end', function(beforeModel) {
            if (this.parent && this.parent.underMoving) {
                return;
            }
            // check infinite depend loop
            var inDeps = [this];
            var isInfinite = false;

            function checkDeps(model) {
                if (!model.depends.length) {
                    return;
                }
                model.depends.each((m) => {
                    if (inDeps.indexOf(m) > -1 || isInfinite) {
                        isInfinite = true;
                        return;
                    }
                    inDeps.push(m);
                    checkDeps(m);
                });
            }
            checkDeps(this);

            if (isInfinite) {
                return;
            }
            if (this.get('start') < beforeModel.get('end')) {
                this.moveToStart(beforeModel.get('end'));
            }
        });
    },
    _checkNested: function() {
        this.trigger('nestedStateChange', this);
    },
    parse: function(response) {
        var start, end;
        if(_.isString(response.start)){
            start = Date.parseExact(util.correctdate(response.start), 'dd/MM/yyyy') ||
                             new Date(response.start);
        } else if (_.isDate(response.start)) {
            start = response.start;
        } else {
            start = new Date();
        }



        if(_.isString(response.end)){
            end = Date.parseExact(util.correctdate(response.end), 'dd/MM/yyyy') ||
                           new Date(response.end);
        } else if (_.isDate(response.end)) {
            end = response.end;
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
        if (response.milestone) {
            response.start = response.end;
        }


        // update deps for new API (array of deps)
        if (_.isNumber(response.depend)) {
            response.depend = [response.depend];
        }
        if (_.isString(response.depend)) {
            response.depend = _.compact(response.depend.split(','));
        }
        return response;
    },
    _checkTime: function() {
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
        });
        this.set('start', startTime);
        this.set('end', endTime);
    },
    _checkComplete: function() {
        var complete = 0;
        var length = this.children.length;
        if (length) {
            this.children.each(function(child) {
                complete += child.get('complete') / length;
            });
        }
        this.set('complete', Math.round(complete));
    },
    moveToStart: function(newStart) {
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
            start: newStart.clone(),
            end: this.get('end').clone().addDays(daysDiff)
        });

        // changes dates in all children
        this.underMoving = true;
        this._moveChildren(daysDiff);
        this.underMoving = false;
    },
    _moveChildren: function(days) {
        this.children.each(function(child) {
            child.move(days);
        });
    },
    saveWithChildren: function() {
        this.save();
        this.children.each(function(task) {
            task.saveWithChildren();
        });
    },
    move: function(days) {
        this.set({
            start: this.get('start').clone().addDays(days),
            end: this.get('end').clone().addDays(days)
        });
        this._moveChildren(days);
    },
    getOutlineLevel: function() {
        var level = 1;
        var parent = this.parent;
        while(true) {
            if (!parent) {
                return level;
            }
            level++;
            parent = parent.parent;
        }
    },
    getOutlineNumber: function() {
        if (this.parent) {
            const index = this.parent.children.models.indexOf(this);
            return this.parent.getOutlineNumber() + '.' + (index + 1);
        }

        let number = 1;
        for(let i = 0; i < this.collection.length; i++) {
            const model = this.collection.at(i);
            if (model === this) {
                return number;
            } else if (!model.parent) {
                number += 1;
            }
        }
    }
});

module.exports = TaskModel;
