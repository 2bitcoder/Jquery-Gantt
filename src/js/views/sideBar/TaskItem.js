"use strict";

var TaskItem = React.createClass({
    displayName : 'TaskItem',
    render : function() {
        var model = this.props.model;
        return React.createElement('ul', {
                    className : 'task' + (this.props.isSubTask ? ' sub-task' : ''),
                    'data-id' : this.props.model.cid
                },
                React.createElement('li', {
                    className : 'col-name'
                }, model.get('name'))
            );
    }
});

module.exports = TaskItem;
