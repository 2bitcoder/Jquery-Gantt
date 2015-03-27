"use strict";
var TaskItem = require('./TaskItem');

var NestedTask = React.createClass({
    displayName : 'NestedTask',
    componentDidMount  : function() {
        this.props.model.on('change:hidden change:collapsed', function() {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount  : function() {
        this.props.model.off(null, null, this);
    },
    render : function() {
        var subtasks = this.props.model.children.map(function(task) {
            if (task.get('hidden')) {
                return;
            }
            if (task.children.length) {
                return React.createElement(NestedTask, {
                    model: task,
                    isSubTask : true,
                    key : task.cid,
                    dateFormat : this.props.dateFormat
                });
            }
            return React.createElement('li', {
                            id : task.cid,
                            key: task.cid,
                            className : 'drag-item',
                            'data-id' : task.cid
                        },
                        React.createElement(TaskItem, {
                            model: task,
                            isSubTask : true,
                            dateFormat : this.props.dateFormat
                        })
                    );
        }, this);
        return React.createElement('li', {
                    className : 'task-list-container drag-item' + (this.props.isSubTask ? ' sub-task' : ''),
                    id : this.props.model.cid,
                    'data-id' : this.props.model.cid
                },
                React.createElement('div', {
                        id : this.props.model.cid,
                        'data-id' : this.props.model.cid
                    },
                    React.createElement(TaskItem, {
                        model : this.props.model,
                        dateFormat : this.props.dateFormat
                    })
                ),
                React.createElement('ol', {
                        className : 'sub-task-list sortable'
                    },
                    subtasks
                )
            );
    }
});

module.exports = NestedTask;
