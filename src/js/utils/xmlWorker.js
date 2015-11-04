var fs = require('fs');
var xml = fs.readFileSync(__dirname + '/xmlTemplate.xml', 'utf8');
var compiled = _.template(xml);
var xmlToJSON = window.xmlToJSON;

function parseXMLObj(xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var tasks = [];
     _.each(obj.Project[0].Tasks[0].Task, function(xmlItem) {
        if (!xmlItem.Name) {
            return;
            // xmlItem.Name = [{_text: 'no name ' + xmlItem.UID[0]._text}];
        }
        tasks.push({
            name: xmlItem.Name[0]._text,
            start: xmlItem.Start[0]._text,
            end: xmlItem.Finish[0]._text,
            complete: xmlItem.PercentComplete[0]._text,
            outline: xmlItem.OutlineNumber[0]._text.toString()
        });
    });
    return tasks;
}

module.exports.parseDepsFromXML = function(xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var uids = {};
    var outlines = {};
    var deps = [];
    var parents = [];
    _.each(obj.Project[0].Tasks[0].Task, function(xmlItem) {
        if (!xmlItem.Name) {
            return;
            // xmlItem.Name = [{_text: 'no name ' + xmlItem.UID[0]._text}];
        }
        var item = {
            name: xmlItem.Name[0]._text.toString(),
            outline: xmlItem.OutlineNumber[0]._text.toString()
        };
        uids[xmlItem.UID[0]._text] = item;
        outlines[item.outline] = item;
    });
    _.each(obj.Project[0].Tasks[0].Task, function(xmlItem) {
        if (!xmlItem.Name) {
            return;
        }
        var task = uids[xmlItem.UID[0]._text];
        // var name = xmlItem.Name[0]._text;
        var outline = task.outline;

        if (xmlItem.PredecessorLink) {
            xmlItem.PredecessorLink.forEach((link) => {
                var beforeUID = link.PredecessorUID[0]._text;
                var before = uids[beforeUID];

                deps.push({
                    before: before,
                    after: task
                });
            });

        }

        if (outline.indexOf('.') !== -1) {
            var parentOutline = outline.slice(0, outline.lastIndexOf('.'));
            var parent = outlines[parentOutline];
            if (!parent) {
                console.error('can not find parent');
                return;
            }

            parents.push({
                parent: parent,
                child: task
            });
        }
    });
    return {
        deps: deps,
        parents: parents
    };
};

module.exports.parseXMLObj = parseXMLObj;

function cut(date) {
    let formated = date.toISOString();
    return formated.slice(0, formated.indexOf('.'));
}

module.exports.tasksToXML = function(tasks) {
    var start = tasks.at(0).get('start');
    var end = tasks.at(0).get('end');
    var data = tasks.map(function(task) {
        if (start > task.get('start')) {
            start = task.get('start');
        }
        if (end < task.get('end')) {
            end = task.get('end');
        }

        console.log(task.get('depend'));
        const depend = _.map(task.get('depend'), (id) => {
            return tasks.get(id).get('sortindex');
        });

        return {
            id: task.get('sortindex'),
            name: task.get('name'),
            outlineNumber: task.getOutlineNumber(),
            outlineLevel: task.getOutlineLevel(),
            start: cut(task.get('start')),
            finish: cut(task.get('end')),
            depend: depend[0]
        };
    });
    return compiled({
        tasks: data,
        currentDate: cut(new Date()),
        startDate: cut(start),
        finishDate: cut(end)
    });
};
