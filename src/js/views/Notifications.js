var Notifications = Backbone.View.extend({
    initialize : function() {
        this.listenTo(this.collection, 'error', this.onError);
        this.listenTo(this.collection, 'success', this.onError);
    },
    onError : function() {
        console.error(arguments);
        var n = noty({text: 'Error while saving task. Sorry...'});
    }
});

module.exports = Notifications;
