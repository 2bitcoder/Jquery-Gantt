"use strict";

var ReportsMenuView = Backbone.View.extend({
    el : '#reports-menu',
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click #print' : 'generatePDF'
    },
    generatePDF : function(evt) {
        window.print();
        evt.preventDefault();
    }
});

module.exports = ReportsMenuView;
