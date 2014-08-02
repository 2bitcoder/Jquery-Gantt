(function(Backbone){
var viewOptions = ['model', 'collection'];

var KineticView = Backbone.KineticView = function(options) {
    this.cid = _.uniqueId('view');
	options || (options = {});
	_.extend(this, _.pick(options, viewOptions));
    this.initialize.apply(this, arguments);
};
_.extend(KineticView.prototype, Backbone.Events, {
	initialize: function(){},
	render: function() {
      return this;
    },
});


KineticView.extend=Backbone.Model.extend;
}(Backbone));