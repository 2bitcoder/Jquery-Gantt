var DatePicker = require('./DatePicker');
var CommetsView = require('../CommentsView');

var TaskItem = React.createClass({
    displayName: 'TaskItem',
    getInitialState() {
        return {
            val: null
        };
    },
    shouldComponentUpdate: function(props) {
        if (_.isEqual(props, this.props)) {
            return false;
        }
        return true;
    },
    componentDidUpdate: function() {
        let $input = $(this.getDOMNode()).find('input');
        if ($input.length > 0 && !$input.is(':focus')) {
            $input.focus();
            // move cursor to the end of input. Tip from:
            // http://stackoverflow.com/questions/511088/use-javascript-to-place-cursor-at-end-of-text-in-text-input-element
            const val = $input.val(); //store the value of the element
            $input.val(''); //clear the value of the element
            $input.val(val); //set that value back.
        }
        $input = $(this.getDOMNode()).find('select').focus();
    },
    componentDidMount: function() {
        let events = [
            'change:name', 'change:complete', 'change:start',
            'change:end', 'change:duration', 'change:hightlight',
            'change:milestone', 'change:deliverable', 'change:reportable',
            'change:status',
            'change:timesheets', 'change:acttimesheets',
            'change:Comments'
        ];
        this.props.model.on(events.join(' '), function() {
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount: function() {
        this.props.model.off(null, null, this);
    },
    _findNestedLevel: function() {
        return this.props.model.getOutlineLevel() - 1;
    },
    _createStatusIconField: function(col) {
        const handleClick = () => {
            if (col === 'milestone' && this.props.model.isNested()) {
                return;
            }
            this.props.model.save(col, !this.props.model.get(col));
        };
        if (this.props.model.get(col)) {
            return (
                <img src={`img/icon-${col}.png`} onClick={handleClick}></img>
            );
        }
        return (<div onClick={handleClick} style={{width: '20px', height: '20px'}}></div>);
    },
    _createField: function(col) {
        const isColInEdit = (this.props.editedRow === col);
        if (isColInEdit) {
            return this._createEditField(col);
        }
        return React.createElement('span', {}, this._createReadFiled(col));
    },
    _createReadFiled: function(col) {
        var model = this.props.model;
        if (col === 'complete') {
            return model.get(col) + '%';
        }
        if (col === 'start' || col === 'end') {
            return $.datepicker.formatDate(this.props.dateFormat, model.get(col));
        }
        if (col === 'duration') {
            return Date.daysdiff(model.get('start'), model.get('end')) + ' d';
        }
        if (col === 'status') {
            const text = _.find(this.props.getAllStatuses(), (t) => {
                return this.props.getStatusId(t).toString() === this.props.model.get('status').toString();
            });
            return text || 'Unrecognized';
        }
        return model.get(col);
    },
    _createDateElement: function(col) {
        var val = this.props.model.get(col);
        return React.createElement(DatePicker, {
            value: val,
            dateFormat: this.props.dateFormat,
            key: col,
            onChange: function(e) {
                var newVal = e.target.value;
                this.props.model.set(col, newVal);
                this.props.model.save();
                this.props.onEditRow(this.props.model.cid, null);
            }.bind(this)
        });
    },
    _durationChange: function(value) {
        var number = parseInt(value.replace( /^\D+/g, ''), 10);
        if (!number) {
            return;
        }
        if (value.indexOf('w') > -1) {
            this.props.model.set('end', this.props.model.get('start').clone().addWeeks(number));
        } else if (value.indexOf('m') > -1) {
            this.props.model.set('end', this.props.model.get('start').clone().addMonths(number));
        } else {
            number--;
            this.props.model.set('end', this.props.model.get('start').clone().addDays(number));
        }
    },
    _createDurationField: function() {
        var val = Date.daysdiff(this.props.model.get('start'), this.props.model.get('end')) + ' d';
        return React.createElement('input', {
            value: this.state.val || val,
            key: 'duration',
            onChange: function(e) {
                var value = e.target.value;
                this._durationChange(value);
                this.setState({value});
            }.bind(this),
            onKeyDown: function(e) {
                if (e.keyCode === 13 || e.keyCode === 27) {
                    this.props.onEditRow(this.props.model.cid, null);
                    this.setState({
                        val: undefined
                    });
                    this.props.model.save();
                }
            }.bind(this)
        });
    },
    _createStatusField() {
        const options = this.props.getAllStatuses().map((statusText) => {
            const statusId = this.props.getStatusId(statusText);
            return (
                <option key={statusText} value={statusId}>{statusText}</option>
            );
        });
        return (
            <select
                value = {this.props.model.get('status')}
                onClick={(e) => {
                    // e.stopPropagation();
                }}
                onChange={(e) => {
                    this.props.model.save('status', e.target.value);
                    this.props.onEditRow(this.props.model.cid, null);
                }}
                style={{
                    width: '100%',
                    fontSize: '11px'
                }}
            >
                {options}
            </select>
        );
    },
    _requestSave() {
        if (this.waiting) {
            return;
        }
        this.waiting = true;
        setTimeout(() => {
            this.waiting = false;
            this.props.model.save();
        }, 500);
    },
    _createEditField: function(col) {
        var val = this.props.model.get(col);
        if (col === 'start' || col === 'end') {
            return this._createDateElement(col);
        }
        if (col === 'duration') {
            return this._createDurationField();
        }
        if (col === 'status') {
            return this._createStatusField();
        }
        return React.createElement('input', {
            className: 'nameInput',
            value: val,
            key: col,
            onChange: function(e) {
                var newVal = e.target.value;
                this.props.model.set(col, newVal);
            }.bind(this),
            onKeyDown: function(e) {
                if (e.keyCode === 13 || e.keyCode === 27) {
                    this.props.onEditRow(this.props.model.cid, null);
                    this._requestSave();
                }
            }.bind(this),
            onBlur: function() {
                this.props.onEditRow(this.props.model.cid, null);
                this._requestSave();
            }.bind(this)
        });
    },
    createCommentField: function() {
        var comments = this.props.model.get('Comments') || 0;
        if (!comments) {
            return null;
        }
        return React.createElement('li', {
                key: 'comments',
                className: 'col-comments',
                onClick: function() {
                    new CommetsView({
                        model: this.props.model
                    }).render();
                }.bind(this)
            },
            React.createElement('img', {
                src: 'css/images/comments.png'
            }),
            comments
        );
    },
    showContext: function(e) {
        var $el = $(e.target);
        var ul = $el.parent();
        var offset = $el.offset();
        ul.contextMenu({
            x: offset.left + 20,
            y: offset.top
        });
    },
    findCol: function(e) {
        const col = $(e.target).closest('.task-col').data('col');
        return col;
    },
    render: function() {
        const model = this.props.model;
        const selectedRow = this.props.selectedRow;
        const shadowBorder = '0 0 0 2px #3879d9 inset';

        let collapseButton;
        if (model.isNested()) {
            const className = 'triangle icon ' + (this.props.model.get('collapsed') ? 'right' : 'down');
            collapseButton = (
                <i
                    className={className}
                    onClick={() => {
                        this.props.model.set('collapsed', !this.props.model.get('collapsed'));
                    }}/>
            );
        }
        const ulClass = 'task'
          + (this.props.isSubTask ? ' sub-task' : '')
          + (this.props.model.get('collapsed') ? ' collapsed' : '')
          + (this.props.model.isNested() ? ' nested' : '');
        return (
            <ul
                className={ulClass}
                data-id={this.props.model.cid}
                onDoubleClick={(e) => {
                    this.props.onEditRow(model.cid, this.findCol(e));
                }}
                onClick={(e) => {
                    this.props.onSelectRow(model.cid, this.findCol(e));
                }}
                style={{
                    backgroundColor: this.props.model.get('hightlight')
                }}
            >
                <li key="info" className="task-col col-info">
                    <img src="img/info.png" onClick={this.showContext}/>
                </li>
                <li key="sortindex" className="col-sortindex">
                    {model.get('sortindex') + 1}
                </li>
                <li key="name" className="task-col col-name" data-col="name"
                    style={{
                        paddingLeft: (this._findNestedLevel() * 10) + 'px',
                        boxShadow: selectedRow === 'name' ? shadowBorder : null
                    }}
                >
                    {collapseButton}
                    <div>
                        {this._createField('name')}
                    </div>
                </li>
                {this.createCommentField()}
                <li key="complete" className="task-col col-complete" data-col="complete"
                    style={{boxShadow: selectedRow === 'complete' ? shadowBorder : null}}
                >
                    {this._createField('complete')}
                </li>
                <li key="status" className="task-col col-status" data-col="status"
                    style={{boxShadow: selectedRow === 'status' ? shadowBorder : null}}
                >
                    {this._createField('status')}
                </li>
                <li key="start" className="task-col col-start" data-col="start"
                    style={{boxShadow: selectedRow === 'start' ? shadowBorder : null}}
                >
                    {this._createField('start')}
                </li>
                <li key="end" className="task-col col-end" data-col="end"
                    style={{boxShadow: selectedRow === 'end' ? shadowBorder : null}}
                >
                    {this._createField('end')}
                </li>
                <li key="duration" className="task-col col-duration" data-col="duration"
                    style={{boxShadow: selectedRow === 'duration' ? shadowBorder : null}}
                >
                    {this._createField('duration')}
                </li>
                <li key="milestone" className="task-col col-milestone" data-col="milestone"
                    style={{boxShadow: selectedRow === 'milestone' ? shadowBorder : null}}
                >
                    {this._createStatusIconField('milestone')}
                </li>
                <li key="deliverable" className="task-col col-deliverable" data-col="deliverable"
                    style={{boxShadow: selectedRow === 'deliverable' ? shadowBorder : null}}
                >
                    {this._createStatusIconField('deliverable')}
                </li>
                <li key="reportable" className="task-col col-reportable" data-col="reportable"
                    style={{boxShadow: selectedRow === 'reportable' ? shadowBorder : null}}
                >
                    {this._createStatusIconField('reportable')}
                </li>
                <li key="timesheets" className="task-col col-timesheets" data-col="timesheets"
                    style={{boxShadow: selectedRow === 'timesheets' ? shadowBorder : null}}
                >
                    {this._createStatusIconField('timesheets')}
                </li>
                <li key="acttimesheets" className="task-col col-acttimesheets" data-col="acttimesheets"
                    style={{boxShadow: selectedRow === 'acttimesheets' ? shadowBorder : null}}
                >
                    {this._createStatusIconField('acttimesheets')}
                </li>
            </ul>
        );
    }
});

module.exports = TaskItem;
