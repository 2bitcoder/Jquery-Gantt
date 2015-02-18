var Notifications = Backbone.View.extend({
    initialize : function() {
        this.listenTo(this.collection, 'error', _.debounce(this.onError, 10));
    },
    onError : function() {
        console.error(arguments);
        noty({
            text: 'Error while saving task, please refresh your browser, request support if this error continues.',
            layout : 'topRight',
            type : 'error'
        });
    }
});

module.exports = Notifications;
