"use strict";

var TaskItem = React.createClass({
    displayName : 'TaskItem',
    getInitialState : function() {
        return {
            editRow : undefined
        };
    },
    componentDidMount  : function() {
        this.props.model.on('change:name change:complete change:start change:end change:status', function() {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount  : function() {
        this.props.model.off(null, null, this);
    },
    componentDidUpdate : function() {
//        var el = this.getDOMNode();
//        var dateInput = $(el).find('.date').get(0);
//        if (dateInput) {
//            datepickr(dateInput, {
//                dateFormat : 'd-m-Y'
//            });
//            $(dateInput).on('change input', function(e) {
//                var newVal =  new Date(e.target.value);
//                this.props.model.set(this.state.editRow, newVal);
//            }.bind(this));
//        }
    },
    _findNestedLevel : function() {
        var level = 0;
        var parent = this.props.model.parent;
        while(true) {
            if (!parent) {
                return level;
            }
            level++;
            parent = parent.parent;
        }
    },
    _createField : function(col) {
        if (this.state.editRow === col) {
            return this._createEditField(col);
        }
        return this._createReadFiled(col);
    },
    _createReadFiled : function(col) {
        if (col === 'complete') {
            return this.props.model.get(col) + '%';
        }
        if (col === 'start' || col === 'end') {
            return this.props.model.get(col).toString('dd/MM/yyyy');
        }
        return this.props.model.get(col);
    },
    _createEditField : function(col) {
        var val = this.props.model.get(col);
        return React.createElement('input', {
            value : (col === 'start' || col === 'end') ? val.toString('yyyy-MM-dd') : val,
            type : (col === 'start' || col === 'end') ? 'date' : 'text',
//            className : (col === 'start' || col === 'end') ? 'date' : undefined,
            onChange : function(e) {
                var newVal = e.target.value;
                if (col === 'start' || col === 'end') {
                    newVal = new Date(newVal);
                }
                this.props.model.set(col, newVal);
            }.bind(this),
            onKeyDown : function(e) {
                if (e.keyCode === 13) {
                    var state = this.state;
                    state.editRow = undefined;
                    this.setState(state);
                    this.props.model.save();
                }
            }.bind(this)
        });
    },
    render : function() {
        var model = this.props.model;
        return React.createElement('ul', {
                    className : 'task' + (this.props.isSubTask ? ' sub-task' : ''),
                    'data-id' : this.props.model.cid,
                    onDoubleClick : function(e) {
                        var className = e.target.className;
                        var col = className.slice(4, className.length);
                        var state = this.state;
                        state.editRow = col;
                        this.setState(state);
                    }.bind(this)
                },
                React.createElement('li', {
                    key : 'name',
                    className : 'col-name',
                    style : {
                        paddingLeft : (this._findNestedLevel() * 10) + 'px'
                    }
                }, this._createField('name')),
                React.createElement('li', {
                    key : 'complete',
                    className : 'col-complete'
                }, this._createField('complete')),
                React.createElement('li', {
                    key : 'start',
                    className : 'col-start'
                }, this._createField('start')),
                React.createElement('li', {
                    key : 'end',
                    className : 'col-end'
                }, this._createField('end')),
                React.createElement('li', {
                    key : 'status',
                    className : 'col-status'
                }, model.get('status')),
                React.createElement('li', {
                    key : 'duration',
                    className : 'col-duration'
                }, Date.daysdiff(model.get('start'),model.get('end'))+' d'),
                React.createElement('li', {
                        key : 'remove',
                        className : 'remove-item'
                    },
                    React.createElement('button', {
                            className : 'mini red ui button',
                            onClick : function() {
                                model.destroy();
                            }
                        },
                        React.createElement('i', {
                                className : 'small trash icon'
                            }
                        )
                    )
                )
            );
    }
});

module.exports = TaskItem;
