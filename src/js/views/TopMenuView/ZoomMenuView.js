"use strict";
var fs = require('fs');
var template = fs.readFileSync(__dirname + '/ZoomMenuTemplate.html', 'utf8');

var ZoomMenuView = Backbone.View.extend({
    initialize : function(params) {
        this.settings = params.settings;
    },
    events : {
        'click button': 'onIntervalButtonClicked',
        'click a[href="/#!/generate/"]': 'generatePDF'
    },
    onIntervalButtonClicked : function(evt) {
        var button = $(evt.currentTarget);
        var action = button.data('action');
        var interval = action.split('-')[1];
        this.settings.set('interval', interval);
    },
    generatePDF : function(evt) {
        window.print();
        evt.preventDefault();
    },
    render : function() {
        var el = $('#top-menu').append(template);
        this.setElement(el);
    }
});

module.exports = ZoomMenuView;
