"use strict";
var parseXML = require('../../utils/xmlWorker').parseXMLObj;
var JSONToXML = require('../../utils/xmlWorker').JSONToXML

var MSProjectMenuView = Backbone.View.extend({
    el : '#project-menu',

    initialize : function(params) {
        this.settings = params.settings;
        this._setupInput();
    },
    _setupInput : function() {
        var input = $('#xmlinput');
        var self = this;
        input.on('change', function(evt) {
            var files = evt.target.files;
            _.each(files, function(file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        self.xmlData = e.target.result;
                    } catch (e) {
                        alert('Error while paring file.');
                        throw e;
                    }
                };
                reader.readAsText(file);
            });
        });
    },
    events : {
        'click #upload-project' : function() {
            $('#msimport').modal({
                onHidden : function() {
                    $(document.body).removeClass('dimmable');
                },
                onApprove : function() {
                    $(document.body).removeClass('dimmable');
                    $('#xmlinput-form').trigger('reset');;
                    this.importData();
                }.bind(this)
            }).modal('show');
        },
        'click #download-project' : function() {
            var data = JSONToXML(this.collection.toJSON());
            var blob = new Blob([data], {type : 'application/json'});
            saveAs(blob, 'GanttTasks.xml');
        }
    },
    importData : function() {
        this.collection.importTasks(parseXML(this.xmlData));
    }
});

module.exports = MSProjectMenuView;
