"use strict";
var ZoomMenuView = require('./ZoomMenuView');
var GroupingMenuView = require('./GroupingMenuView');
var FilterMenuView = require('./FilterMenuView');

var TopMenuView = Backbone.View.extend({
    initialize : function(params) {
        new ZoomMenuView(params).render();
        new GroupingMenuView(params).render();
        new FilterMenuView(params).render();
    }
});

module.exports = TopMenuView;
