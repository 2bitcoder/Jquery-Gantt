var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var _ = require('lodash');
var serveStatic = require('serve-static');

var tasks = require('./data/tasks_stress');
tasks = tasks.concat(tasks).concat(tasks);

var idCounter = 0;
_(tasks).each(function(task) {
    if (!task.id) {
        task.id = idCounter++;
    }
    idCounter = Math.max(parseInt(task.id), idCounter);
});

var app = express();

app.use(serveStatic('./src'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));



app.get('/', function(req, res) {
    res.send('please select a collection, e.g., /collections/messages')
});

app.get('/api/tasks', function(req, res) {
    console.log('return tasks');
    res.send(tasks);
});


app.post('/api/tasks', function(req, res) {
    console.log('add task', req.body);
    req.body.id = ++idCounter;
    tasks.push(req.body);
    return res.send(req.body);
});

app.get('/api/tasks/:id', function(req, res) {
    var id = req.params.id.toString();
    console.log('return task with id ' + id);

    var task = _(tasks).find(function(task) {
        return task.id.toString() === id;
    });

    res.send(task || {});
});

app.put('/api/tasks/:id', function(req, res) {
    var id = req.params.id.toString();
    console.log('update task with id ' + id);

    var task = _(tasks).find(function(task) {
        return task.id.toString() === id;
    });

    if (task) {
        _(req.body).each(function(val, key) {
            task[key] = val;
        });
        _(task).each(function(val, key) {
            if (!req.body[key]) {
                task[key] = undefined;
            }
        });
    } else {
        console.error('no such task');
    }
    res.send(task || {});
});

app.delete('/api/tasks/:id', function(req, res) {
    var id = req.params.id.toString();

    console.log('delete task with id ' + req.params.id);

    var task = _(tasks).find(function(task) {
        return task.id.toString() === id;
    });

    if (task) {
        tasks = _.without(tasks, task);
        res.send({
          msg : 'success'
        });
    } else {
        console.error('no such task');
        res.send({
          msg: 'error'
        });
    }
});

app.listen(3000, function(){
  console.log('Express server listening on port 3000')
});
