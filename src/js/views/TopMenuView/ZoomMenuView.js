var ZoomMenuView = Backbone.View.extend({
    el: '#zoom-menu',
    initialize: function(params) {
        this.settings = params.settings;
        this._hightlightSelected();
    },
    events: {
        'click .action': 'onIntervalButtonClicked'
    },
    onIntervalButtonClicked: function(evt) {
        var button = $(evt.currentTarget);
        var interval = button.data('interval');
        this.settings.set('interval', interval);
        this._hightlightSelected();
    },
    _hightlightSelected: function() {
        this.$('.action').removeClass('selected');

        let interval = this.settings.get('interval');
        this.$('[data-interval="' + interval + '"]').addClass('selected');
    }
});

module.exports = ZoomMenuView;
