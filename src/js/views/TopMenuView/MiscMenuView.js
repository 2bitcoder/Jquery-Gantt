"use strict";

var ReportsMenuView = Backbone.View.extend({
    el : '#reports-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click #print' : 'generatePDF',
        'click #showVideo' : 'showHelp',
        'click #delete-all' : 'deleteAll'
    },
    generatePDF : function(evt) {
        window.print();
        evt.preventDefault();
    },
    showHelp : function() {
        $('#showVideoModal').modal({
            onHidden : function() {
                $(document.body).removeClass('dimmable');
            },
            onApprove : function() {
                $(document.body).removeClass('dimmable');
            }
        }).modal('show');
    },
    deleteAll: function() {
        $('#confirm').modal({
            onHidden : function() {
                $(document.body).removeClass('dimmable');
            },
            onApprove : function() {
                while(this.collection.at(0)) {
                    this.collection.at(0).destroy();
                }
            }.bind(this)
        }).modal('show');
    }
});

module.exports = ReportsMenuView;
