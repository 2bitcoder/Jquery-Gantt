"use strict";

var DatePicker = React.createClass({
    displayName : 'DatePicker',
    componentDidMount  : function() {
        $(this.getDOMNode()).datepicker({
//            dateFormat: "dd/mm/yy",
            dateFormat: this.props.dateFormat,
            onSelect : function() {
                var date = this.getDOMNode().value.split('/');
                var value = new Date(date[2] + '-' + date[1] + '-' + date[0]);
                this.props.onChange({
                    target : {
                        value : value
                    }
                });
            }.bind(this)
        });
        $(this.getDOMNode()).datepicker('show');
    },
    componentWillUnmount  : function() {
        $(this.getDOMNode()).datepicker('destroy');
    },
    shouldComponentUpdate : function() {
//        this.getDOMNode().value = this.props.value.toString('dd/mm/yy');
        var dateStr = $.datepicker.formatDate(this.props.dateFormat, this.props.value);
        this.getDOMNode().value = dateStr;
        $(this.getDOMNode()).datepicker( "refresh" );
        return false;
    },
    render : function() {
        return React.createElement('input', {
//            defaultValue : this.props.value.toString('dd/MM/yyyy')
            defaultValue : $.datepicker.formatDate(this.props.dateFormat, this.props.value)
        });
    }
});

module.exports = DatePicker;
