"use strict";

var FilterView = Backbone.View.extend({
    el : '#filter-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click #top-expand-all' : function() {
            this.collection.each(function(task) {
                if (task.isNested()) {
                    task.set('collapsed', false);
                }
            });
        },
        'click #top-collapse-all' : function() {
            this.collection.each(function(task) {
                if (task.isNested()) {
                    task.set('collapsed', true);
                }
            });
        }
    }
});

module.exports = FilterView;
