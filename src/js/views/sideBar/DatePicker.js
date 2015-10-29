var DatePicker = React.createClass({
    displayName: 'DatePicker',
    componentDidMount: function() {
        $(this.getDOMNode()).datepicker({
            dateFormat: this.props.dateFormat,
            onSelect: function() {
                console.log('select');
                var date = this.getDOMNode().value.split('/');
                var value = new Date(date[2] + '-' + date[1] + '-' + date[0]);
                this.props.onChange({
                    target: {
                        value: value
                    }
                });
            }.bind(this)
        });
        $(this.getDOMNode()).datepicker('show');
    },
    componentWillUnmount: function() {
        $(this.getDOMNode()).datepicker('destroy');
    },
    shouldComponentUpdate: function() {
        var dateStr = $.datepicker.formatDate(this.props.dateFormat, this.props.value);
        this.getDOMNode().value = dateStr;
        $(this.getDOMNode()).datepicker( "refresh" );
        return false;
    },
    render: function() {
        return React.createElement('input', {
            defaultValue: $.datepicker.formatDate(this.props.dateFormat, this.props.value)
        });
    }
});

module.exports = DatePicker;
