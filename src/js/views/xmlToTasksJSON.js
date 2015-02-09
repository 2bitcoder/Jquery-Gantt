"use strict";
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

module.exports = parseXMLObj;

