"use strict";

var FilterView = Backbone.View.extend({
    el : '#filter-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'change #hightlights-select' : function(e) {
            console.log(e.target.value);
        },
        'change #filters-select' : function(e) {
            console.log(e.target.value);
        }
    }
});

module.exports = FilterView;
