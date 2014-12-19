/**
 * Created by lavrton on 17.12.2014.
 */
"use strict";
var BasicTaskView = require('./BasicTaskView');

var NestedTaskView = BasicTaskView.extend({
    _color : '#b3d1fc',
    _updateDates : function() {
        // group is moved
        // so we need to detect interval
        var attrs = this.settings.getSetting('attr'),
            boundaryMin=attrs.boundaryMin,
            daysWidth=attrs.daysWidth;

        var rect = this.el.find('.mainRect')[0];
        var x = this.el.x() + rect.x();
        var days1 = Math.floor(x / daysWidth);
        var newStart = boundaryMin.clone().addDays(days1);
        this.model.moveToStart(newStart);

//        BasicTaskView.prototype._updateDates.call(this);
//        var timeDiff =
//        this.model.set({
//            start: boundaryMin.clone().addDays(days1),
//            end: boundaryMin.clone().addDays(days2 - 1)
//        });
//
//        var attrs = this.settings.getSetting('attr'),
//            boundaryMin=attrs.boundaryMin,
//            daysWidth=attrs.daysWidth;
//
//        var rect = this.el.find('.mainRect')[0];
//        var length = rect.width();
//        var x = this.el.x() + rect.x();
//        var days1 = Math.floor(x / daysWidth), days2 = Math.floor((x + length) / daysWidth);
//
//        this.model.set({
//            start: boundaryMin.clone().addDays(days1),
//            end: boundaryMin.clone().addDays(days2 - 1)
//        });
    },
});

module.exports = NestedTaskView;