/**
 * Created by lavrton on 08.12.2014.
 */

var TopMenuView = Backbone.View.extend({
    el : '.head-bar',
    initialize : function(params) {
        "use strict";
        this.settings = params.settings;
    },
    events : {
        'click button': 'onIntervalButtonClicked',
        'click a[href="/#!/generate/"]': 'generatePDF'
    },
    onIntervalButtonClicked : function(evt) {
        "use strict";
        var button = $(evt.currentTarget);
        var action = button.data('action');
        var interval = action.split('-')[1];
        this.settings.set('interval', interval);
    },
    generatePDF : function(evt) {
        "use strict";
        window.print();
        evt.preventDefault();
    }
});

module.exports = TopMenuView;
