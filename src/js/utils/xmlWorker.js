"use strict";

var fs = require('fs');
var xml = fs.readFileSync(__dirname + '/xmlTemplate.xml', 'utf8');
var compiled = _.template(xml);

function parseXMLObj(xmlString) {
    var obj = xmlToJSON.parseString(xmlString);
    var tasks = _.map(obj.Project[0].Tasks[0].Task, function(xmlItem) {
        return {
            name : xmlItem.Name[0]._text,
            start : xmlItem.Start[0]._text,
            end : xmlItem.Finish[0]._text,
            complete : xmlItem.PercentComplete[0]._text
        };
    });
    return tasks;
}

module.exports.parseXMLObj = parseXMLObj;

module.exports.JSONToXML = function(json) {
    var start = json[0].start;
    var end = json[0].end;
    var data = _.map(json, function(task) {
        if (start > task.start) {
            start = task.start;
        }
        if (end < task.end) {
            end = task.end;
        }
        return {
            name : task.name,
            start : task.start.toISOString(),
            end : task.end.toISOString()
        };
    });
    return compiled({
        tasks : data,
        currentDate : new Date().toISOString(),
        startDate : start,
        finishDate : end
    });
};
