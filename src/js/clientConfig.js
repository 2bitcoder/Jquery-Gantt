var util = require('./utils/util');
var params = util.getURLParams();

let tasksSubURL = '';
// detect API params from get, e.g. ?project=143&profile=17&sitekey=2b00da46b57c0395
if (params.project && params.profile && params.sitekey) {
    tasksSubURL = '/' + params.project + '/' + params.profile + '/' + params.sitekey;
}
export var tasksURL = 'api/tasks/' + tasksSubURL;


let configSubURL = '';
if (window.location.hostname.indexOf('localhost') === -1) {
    configSubURL = '/wbs/' + params.project + '/' + params.sitekey;
}

export var configURL = '/api/GanttConfig' + configSubURL;

