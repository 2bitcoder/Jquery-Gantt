"use strict";


var CommentsView = Backbone.View.extend({
    el : '#taskCommentsModal',
    initialize : function(params) {
        this.settings = params.settings;
    },
    render : function() {
        this._fillData();

        // open modal
        this.$el.modal({
            onHidden : function() {
                $("#taskComments").empty();
                $(document.body).removeClass('dimmable');
            }.bind(this),
            onApprove : function() {
            }.bind(this)
        }).modal('show');

        // init comments
        $("#taskComments").comments({
            getCommentsUrl: "../api/comment/" + this.model.id,
            postCommentUrl: "../api/comment/"  + this.model.id,
            deleteCommentUrl: "../api/comment/" + this.model.id,
            displayAvatar: true
        });
    },
    _fillData : function() {
        _.each(this.model.attributes, function(val, key) {
            var input = this.$el.find('[name="' + key + '"]');
            if (!input.length) {
                return;
            }
            input.val(val);
        }, this);
    }
});

module.exports = CommentsView;
