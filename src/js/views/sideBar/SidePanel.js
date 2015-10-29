var TaskItem = require('./TaskItem');
var NestedTask = require('./NestedTask');

function buildTasksOrderFromDOM(container) {
    var data = [];
    var children = $('<ol>' + container.get(0).innerHTML + '</ol>').children();
    _.each(children, function(child) {
        var $child = $(child);
        var obj = {
            id: $child.data('id'),
            children: []
        };
        var sublist = $child.find('ol');
        if (sublist.length) {
            obj.children = buildTasksOrderFromDOM(sublist);
        }
        data.push(obj);
    });
    return data;
}

var SidePanel = React.createClass({
    displayName: 'SidePanel',
    getInitialState() {
        return {
            selectedRow: null,
            lastSelectedRow: null,
            selectedModel: null,
            editedRow: null
        };
    },
    componentDidMount() {
        this.props.collection.on('add remove', function() {
            this.requestUpdate();
        }, this);
        this.props.collection.on('change:hidden', function() {
            this.requestUpdate();
        }, this);
        this._makeSortable();
        this._setupHighlighter();
    },
    _makeSortable: function() {
        var container = $('.task-container');
        container.sortable({
            group: 'sortable',
            containerSelector: 'ol',
            itemSelector: '.drag-item',
            placeholder: '<li class="placeholder sort-placeholder"/>',
            onDragStart: ($item, position, _super, event) => {
                _super($item, position, _super, event);
                this.hightlighter.remove();
            },
            onDrag: ($item, position, _super, event) => {
                var $placeholder = $('.sort-placeholder');
                var isSubTask = !$($placeholder.parent()).hasClass('task-container');
                $placeholder.css({
                    'padding-left': isSubTask ? '30px' : '0'
                });
                _super($item, position, _super, event);
            },
            onDrop: ($item, position, _super, event) => {
                _super($item, position, _super, event);
                setTimeout(() => {
                    var data = buildTasksOrderFromDOM(container);
                    this.props.collection.resort(data);
                }, 10);
            }
        });
    },
    _setupHighlighter() {
        this.hightlighter = $('<div>');
        this.hightlighter.css({
            position: 'absolute',
            background: 'grey',
            opacity: '0.5',
            top: '0',
            width: '100%'
        });

        var container = $('.task-container');
        container.mouseenter(function() {
            this.hightlighter.appendTo(document.body);
        }.bind(this));

        container.mouseover(function(e) {
            var $el = $(e.target);
            // TODO: rewrite to find closest ul
            if (!$el.data('id')) {
                $el = $el.parent();
                if (!$el.data('id')) {
                    $el = $el.parent();
                }
            }
            var pos = $el.offset();
            this.hightlighter.css({
                top: pos.top + 'px',
                height: $el.height()
            });
        }.bind(this));

        container.mouseleave(function() {
            this.hightlighter.remove();
        }.bind(this));
    },
    requestUpdate: (function() {
        var waiting = false;
        return function () {
            if (waiting) {
                return;
            }
            setTimeout(function() {
                this.forceUpdate();
                waiting = false;
            }.bind(this), 5);
            waiting = true;
        };
    }()),
    componentWillUnmount: function() {
        $('.task-container').sortable('destroy');
        this.props.collection.off(null, null, this);
        this.hightlighter.remove();
    },
    onSelectRow(selectedModelCid, selectedRow) {
        this.setState({
            selectedRow,
            selectedModelCid
        });
    },
    onEditRow(selectedModelCid, editedRow) {
        if (!editedRow) {
            var x = window.scrollX, y = window.scrollY;
            this.refs.container.getDOMNode().focus();
            window.scrollTo(x, y);
            this.setState({
                selectedRow: this.state.lastSelectedRow
            });
        }
        this.setState({
            selectedModelCid,
            editedRow
        });
    },
    onKeyDown(e) {
        if (e.target.tagName === 'INPUT') {
            return;
        }
        e.preventDefault();
        const rows = ['name', 'complete', 'start', 'end', 'duration'];
        let i = rows.indexOf(this.state.selectedRow);
        const tasks = this.props.collection;
        let modelIndex = tasks.get(this.state.selectedModelCid).get('sortindex');
        if (e.keyCode === 40) { // down
            modelIndex = (modelIndex + 1 + tasks.length) % tasks.length;
        } else if (e.keyCode === 39) { // right
            i = (i + 1 + rows.length) % rows.length;
        } else if (e.keyCode === 38) { // up
            modelIndex = (modelIndex - 1 + tasks.length) % tasks.length;
        } else if (e.keyCode === 37) { // left
            i = (i - 1 + rows.length) % rows.length;
        } else if (e.keyCode === 13) { // enter
            this.setState({
                editedRow: rows[i]
            });
        }

        // auto open side panel
        if (i >= 2) {
            $('.menu-container')
                .addClass('panel-expanded')
                .removeClass('panel-collapsed');
        }
        this.setState({
            selectedRow: rows[i],
            selectedModelCid: tasks.at(modelIndex).cid
        });
    },
    onClick() {
        var x = window.scrollX, y = window.scrollY;
        this.refs.container.getDOMNode().focus();
        window.scrollTo(x, y);
    },
    onBlur() {
        this.setState({
            lastSelectedRow: this.state.selectedRow,
            selectedRow: null
        });
    },
    render: function() {
        var tasks = [];
        this.props.collection.each((task) => {
            if (task.parent) {
                return;
            }
            if (task.get('hidden')) {
                return;
            }
            if (task.children.length) {
                tasks.push(React.createElement(NestedTask, {
                    model: task,
                    key: task.cid,
                    dateFormat: this.props.dateFormat,
                    onSelectRow: this.onSelectRow,
                    onEditRow: this.onEditRow,
                    editedRow: this.state.editedRow,
                    selectedRow: this.state.selectedRow,
                    selectedModelCid: this.state.selectedModelCid
                }));
            } else {
                tasks.push(React.createElement('li', {
                        key: task.cid,
                        className: 'drag-item',
                        'data-id': task.cid
                    },
                    React.createElement(TaskItem, {
                        model: task,
                        dateFormat: this.props.dateFormat,
                        onSelectRow: this.onSelectRow,
                        onEditRow: this.onEditRow,
                        editedRow: (this.props.selectedModelCid === task.cid) && this.state.editedRow,
                        selectedRow: (this.props.selectedModelCid === task.cid) && this.state.selectedRow
                    })
                ));
            }
        });
        return (
            <ol
                className='task-container sortable'
                tabIndex="1"
                ref="container"
                onKeyDown={this.onKeyDown}
                onClick={this.onClick}
                onBlur={this.onBlur}
            >
                {tasks}
            </ol>
        );
    }
});

module.exports = SidePanel;
