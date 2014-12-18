"use strict";

var BasicTaskView = Backbone.KineticView.extend({
    params : {
        height : 21,
        padding : 2
    },
    initialize : function(params) {
        this.height = this.params.height;
        this.settings = params.settings;
        this._initModelEvents();
        this._initSettingsEvents();
    },
    events : function() {
        return {
            'dragmove' : '_updateDates',
            'dragend' : function() {
                this.model.save();
            }
        };
    },
    el : function() {
        var group = new Kinetic.Group({
            dragBoundFunc : function(pos) {
                return {
                    x : pos.x,
                    y : this._y
                };
            }.bind(this),
            draggable : true
        });
        var rect = new Kinetic.Rect({
            fill : this.model.get('lightcolor'),
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            name : 'mainRect'
        });
        var completeRect = new Kinetic.Rect({
            fill : this.model.get('darkcolor'),
            y : this.params.padding,
            height : this.params.height - this.params.padding * 2,
            name : 'completeRect'
        });
        group.add(rect, completeRect);
        return group;
    },
    _updateDates : function() {
        var attrs = this.settings.getSetting('attr'),
            boundaryMin=attrs.boundaryMin,
            daysWidth=attrs.daysWidth;

        var rect = this.el.find('.mainRect')[0];
        var length = rect.width();
        var x = this.el.x() + rect.x();
        var days1 = Math.floor(x / daysWidth), days2 = Math.floor((x + length) / daysWidth);

        this.model.set({
            start: boundaryMin.clone().addDays(days1),
            end: boundaryMin.clone().addDays(days2 - 1)
        });
    },
    _initSettingsEvents : function() {
        this.listenTo(this.settings, 'change:interval change:dpi', function() {
            this.render();
        });
    },
    _initModelEvents : function() {
        // don't update element while dragging
        this.listenTo(this.model, 'change', function() {
            var dragging = this.el.isDragging();
            this.el.getChildren().each(function(child) {
                dragging = dragging || child.isDragging();
            });
            if (dragging) {
                return;
            }
            this.render();
        });

        this.listenTo(this.model, 'change:hidden', function() {
            if (this.model.get('hidden')) {
                this.el.hide();
            } else {
                this.el.show();
            }
        });
    },
    _calculateX : function() {
        var attrs= this.settings.getSetting('attr'),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;
        return {
            x1: Date.daysdiff(boundaryMin, this.model.get('start')) * daysWidth,
            x2: Date.daysdiff(boundaryMin, this.model.get('end')) * daysWidth
        };
    },
    _calculateCompleteWidth : function() {
        var x = this._calculateX();
        return (x.x2 - x.x1) * this.model.get('complete') / 100;
    },
    render : function() {
        var x = this._calculateX();
        // move group
        this.el.x(x.x1);

        // update main rect params
        var rect = this.el.find('.mainRect')[0];
        rect.x(0);
        rect.width(x.x2 - x.x1);

        // update complete params
        this.el.find('.completeRect')[0].width(this._calculateCompleteWidth());
        this.el.getLayer().draw();
        return this;
    },
    setY : function(y) {
        this._y = y;
        this.el.y(y);
    }
});

module.exports = BasicTaskView;