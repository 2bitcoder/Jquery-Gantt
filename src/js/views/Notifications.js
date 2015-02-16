var Notifications = Backbone.View.extend({
    initialize : function() {
        this.listenTo(this.collection, 'error', this.onError);
    },
    onError : function() {
        console.error(arguments);
        noty({
            text: 'Error while saving task. Sorry...',
            layout : 'topRight',
            type : 'error'
        });
    }
});

module.exports = Notifications;
