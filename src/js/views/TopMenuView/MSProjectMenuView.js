var parseXML = require('../../utils/xmlWorker').parseXMLObj;
var tasksToXML = require('../../utils/xmlWorker').tasksToXML;
var parseDepsFromXML = require('../../utils/xmlWorker').parseDepsFromXML;

var MSProjectMenuView = Backbone.View.extend({
    el: '#project-menu',

    initialize: function(params) {
        this.settings = params.settings;
        this.importing = false;
        this._setupInput();
    },
    _setupInput: function() {
        var input = $('#importFile');
        var self = this;
        input.on('change', function(evt) {
            var files = evt.target.files;
            _.each(files, function(file) {
                var parts = file.name.split('.');
                var extention = parts[parts.length - 1].toLowerCase();
                if (extention !== 'xml') {
                    alert('The file type "' + extention + '" is not supported. Only xml files are allowed. Please save your MS project as a xml file and try again.');
                    return;
                }
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
    events: {
        'click #upload-project' : function() {
            $('#msimport').modal({
                onHidden : function() {
                    $(document.body).removeClass('dimmable');
                },
                onApprove : function() {
                    if (!this.xmlData || this.importing) {
                        return false;
                    }
                    this.importing = true;
                    $("#importProgress").show();
                    $("#importFile").hide();
                    $(document.body).removeClass('dimmable');
                    $('#xmlinput-form').trigger('reset');
                    setTimeout(this.importData.bind(this), 20);
                    return false;
                }.bind(this)
            }).modal('show');
            $("#importProgress").hide();
            $("#importFile").show();
        },
        'click #download-project' : function() {
            var data = tasksToXML(this.collection);
            var blob = new Blob([data], {type : 'application/json'});
            saveAs(blob, 'GanttTasks.xml');
        }
    },
    progress : function(percent) {
        $('#importProgress').progress({
            percent : percent
        });
    },
    _prepareData : function(data) {
        var defStatus = this.settings.findDefaultStatusId();
        var defHealth = this.settings.findDefaultHealthId();
        var defWO = this.settings.findDefaultWOId();
        data.forEach(function(item) {
            item.health = defHealth;
            item.status = defStatus;
            item.wo = defWO;
        });
        return data;
    },
    importData : function() {
        var delay = 100;
        this.progress(0);
        // this is some sort of callback hell!!
        // we need timeouts for better user experience
        // I think user want to see animated progress bar
        // but without timeouts it is not possible, right?
        setTimeout(function() {
            this.progress(10);
            var col = this.collection;
            var data = parseXML(this.xmlData);
            data = this._prepareData(data);

            setTimeout(function() {
                this.progress(26);
                col.importTasks(data, function() {
                    this.progress(43);
                    setTimeout(function() {
                        this.progress(59);
                        var deps = parseDepsFromXML(this.xmlData);
                        setTimeout(function() {
                            this.progress(78);
                            col.createDeps(deps);
                            setTimeout(function() {
                                this.progress(100);
                                this.importing = false;
                                $('#msimport').modal('hide');
                            }.bind(this), delay);
                        }.bind(this), delay);
                    }.bind(this), delay);
                }.bind(this), delay);
            }.bind(this), delay);
        }.bind(this), delay);
    }
});

module.exports = MSProjectMenuView;
