var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var _ = require('lodash');
var serveStatic = require('serve-static');

var tasks = require('./data/tasks');

_.times(0, function() {
    tasks = tasks.concat(JSON.parse(JSON.stringify(tasks)));
});


var resources = require('./data/resources');
var comments = require('./data/comments');

var config = require('./data/config');

var taskIdCounter = 1;
var ids = [];
_(tasks).each(function(task) {
    if (!task.id || ids.indexOf(task.id) >= 0) {
        task.id = Math.round(Math.random() * 100000);
    }
    ids.push(task.id);
    taskIdCounter = Math.max(parseInt(task.id), taskIdCounter);
});


var resourceIdCounter = 0;
_(resources).each(function(resource) {
    if (!resource.id) {
        resource.id = resourceIdCounter++;
    }
    resourceIdCounter = Math.max(parseInt(resource.id), resourceIdCounter);
});
var commentsIdCounter = 3;

var app = express();

app.use(serveStatic('./src'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));



app.get('/', function(req, res) {
    res.send('please select a collection, e.g., /collections/messages');
});

function generateAPI(items, baseURL) {
    app.get(baseURL, function(req, res) {
        console.log('return items ', baseURL);
        res.send(items);
    });


    app.post(baseURL, function(req, res) {
        console.log('add item', req.body);
        req.body.id = ++taskIdCounter;
        tasks.push(req.body);
        return res.send(req.body);
    });

    app.get(baseURL + '/:id', function(req, res) {
        var id = req.params.id.toString();
        console.log('return item with id ' + id);

        var task = _(items).find(function(item) {
            return item.id.toString() === id;
        });

        res.send(task || {});
    });

    app.put(baseURL + '/:id', function(req, res) {
        var id = req.params.id.toString();
        console.log('update item with id ' + id);

        var item = _(items).find(function(i) {
            return i.id.toString() === id;
        });

        if (item) {
            _(req.body).each(function(val, key) {
                item[key] = val;
            });
            _(item).each(function(val, key) {
                if (!req.body[key]) {
                    item[key] = undefined;
                }
            });
        } else {
            console.error('no such item');
        }
        res.send(item || {});
    });

    app.delete(baseURL + '/:id', function(req, res) {
        console.log(req.params);
        var id = req.params.id.toString();

        console.log('delete item with id ' + req.params.id);

        var item = _(items).find(function(i) {
            return i.id.toString() === id;
        });

        if (item) {
            items = _.without(items, item);
            res.send({
                msg: 'success'
            });
        } else {
            console.error('no such task');
            res.send({
                msg: 'error'
            });
        }
    });
}

generateAPI(tasks, '/api/tasks');
generateAPI(resources, '/api/resources/1/1');



app.get('/api/comment/:id/', function(req, res) {
    var id = req.params.id.toString();
    console.log('return comments with id ' + id);
    res.send(comments[id] || []);
});

app.get('/api/GanttConfig', function(req, res) {
    res.send(config);
});


app.post('/api/comment/:id/', function(req, res) {
    var id = req.params.id.toString();
    console.log('add comment', req.body, 'to task', id);
    var comment = {
        Comment: req.body.comment,
        Id: ++commentsIdCounter,
        Author: 'User',
        Date: new Date(),
        UserAvatar: null,
        ParentId: null,
        CanDelete: false,
        CanReply: true,
        PartitNo: null,
        vKey: null,
        dtype: null,
        ProjectRef: null,
        ActionID: null,
        UserID: null
    };
    comments[id] = comments[id] || [];
    comments[id].push(comment);
    return res.send(comment);
});


app.listen(3000, function(){
  console.log('Express server listening on port 3000');
});
