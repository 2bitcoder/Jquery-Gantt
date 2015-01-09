"use strict";
var fs = require('fs');
var template = fs.readFileSync(__dirname + '/GroupingMenuTemplate.html', 'utf8');

var ZoomMenuView = Backbone.View.extend({
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
    },
    render : function() {
        var el = $('#top-menu').append(template);
        this.setElement(el);
    }
});

module.exports = ZoomMenuView;
