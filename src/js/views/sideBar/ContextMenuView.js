"use strict";

function ContextMenuView(params) {
    this.collection = params.collection;
}

ContextMenuView.prototype.render = function() {
    var self = this;
    $('.task-container').contextMenu({
        selector: 'ul',
        callback: function(key) {
            var id = $(this).attr('id') || $(this).data('id');
            var model = self.collection.get(id);
            if(key === 'delete'){
                model.destroy();
            }
            if(key === 'properties'){
//                var $property = '.property-';
//                var status = {
//                    '108': 'Ready',
//                    '109': 'Open',
//                    '110': 'Complete'
//                };
//                var $el = $(document);
//                $el.find($property+'name').html(model.get('name'));
//                $el.find($property+'description').html(model.get('description'));
//                $el.find($property+'start').html(convertDate(model.get('start')));
//                $el.find($property+'end').html(convertDate(model.get('end')));
//                $el.find($property+'status').html(status[model.get('status')]);
//                var startdate = new Date(model.get('start'));
//                var enddate = new Date(model.get('end'));
//                var _MS_PER_DAY = 1000 * 60 * 60 * 24;
//                if(startdate != "" && enddate != ""){
//                    var utc1 = Date.UTC(startdate.getFullYear(), startdate.getMonth(), startdate.getDate());
//                    var utc2 = Date.UTC(enddate.getFullYear(), enddate.getMonth(), enddate.getDate());
//                    $el.find($property+'duration').html(Math.floor((utc2 - utc1) / _MS_PER_DAY));
//                }else{
//                    $el.find($property+'duration').html(Math.floor(0));
//                }
//                $('.ui.properties').modal('setting', 'transition', 'vertical flip')
//                    .modal('show')
//                ;
//
//                function convertDate(inputFormat) {
//                    function pad(s) { return (s < 10) ? '0' + s : s; }
//                    var d = new Date(inputFormat);
//                    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
//                }
            }
            if(key === 'rowAbove'){
                var data = {
                    reference_id : id
                };
                self.addTask(data, 'above');
            }
            if(key === 'rowBelow'){
                self.addTask({
                    reference_id : id
                }, 'below');
            }
            if (key === 'indent') {
                self.collection.indent(model);
            }
            if (key === 'outdent'){
                self.collection.outdent(model);
            }
        },
        items: {
            "rowAbove": {name: "New Row Above", icon: ""},
            "rowBelow": {name: "New Row Below", icon: ""},
            "indent": {name: "Indent Row", icon: ""},
            "outdent": {name: "Outdent Row", icon: ""},
            "sep1": "---------",
            "properties": {name: "Properties", icon: ""},
            "sep2": "---------",
            "delete": {name: "Delete Row", icon: ""}
        }
    });
};

ContextMenuView.prototype.addTask = function(data, insertPos) {
    var sortindex = 0;
    var ref_model = this.collection.get(data.reference_id);
    if (ref_model) {
        sortindex = ref_model.get('sortindex') + (insertPos === 'above' ? -0.5 : 0.5)
    } else {
        sortindex = (this.app.tasks.last().get('sortindex') + 1);
    }
    data.sortindex = sortindex;
    data.parentid = ref_model.get('parentid');
    var task = this.collection.add(data, {parse : true});
    task.save();
};

module.exports = ContextMenuView;