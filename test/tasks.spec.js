"use strict";
var expect = require("chai").expect;
var Backbone = require('backbone');
Backbone.sync = function() {};
global.Backbone = Backbone;

var Tasks = require('../src/js/collections/TaskCollection');

describe("Tasks", function(){
    it("should have some length", function(){
        var tasks = new Tasks([{}]);
        expect(tasks.length).to.equal(1);
    });

    it('simple resort', function(){
        var tasks = new Tasks([{id : 1}, {id : 2}]);
        tasks.resort([{id : 2}, {id : 1}]);
        expect(tasks.get(2).get('sortindex')).to.equal(0);
        expect(tasks.get(1).get('sortindex')).to.equal(1);
    });

    it('nested resort', function(){
        var tasks = new Tasks([{id : 1}, {id : 2}, {id : 3}]);
        tasks.resort([
            {
                id : 3
            },
            {
                id : 2,
                children : [{id : 1}]
            }
        ]);
        expect(tasks.at(0).id).to.equal(3);
        expect(tasks.get(3).get('sortindex')).to.equal(0);

        expect(tasks.at(1).id).to.equal(2);
        expect(tasks.get(2).get('sortindex')).to.equal(1);
        expect(tasks.get(2).children.length).to.equal(1);

        expect(tasks.at(2).id).to.equal(1);
        expect(tasks.get(1).get('sortindex')).to.equal(2);
    });

    it('resort children of task on collection resort', function(){
        var tasks = new Tasks([{id : 1}, {id : 2}, {id : 3}]);
        tasks.resort([
            {
                id : 3
            },
            {
                id : 2,
                children : [{id : 1}]
            }
        ]);
        tasks.resort([
            {
                id : 2,
                children : [{
                    id : 3
                },{
                    id : 1
                }]
            }
        ]);
        expect(tasks.at(0).id).to.equal(2);
        expect(tasks.get(2).get('sortindex')).to.equal(0);

        expect(tasks.at(1).id).to.equal(3);
        expect(tasks.get(3).get('sortindex')).to.equal(1);

        expect(tasks.at(2).id).to.equal(1);
        expect(tasks.get(1).get('sortindex')).to.equal(2);

        // check children resorting
        expect(tasks.get(2).children.length).to.equal(2);
        expect(tasks.get(2).children.at(0).id).to.equal(3);
    });

    it("linking children on reset", function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1}, {id : 2}, {id : 3, parentid : 1}]);
        expect(tasks.get(1).children.length).to.equal(1);
        tasks.reset([{id : 1}, {id : 2}, {id : 3}]);
        expect(tasks.get(1).children.length).to.equal(0);
    });

    it('is nested method', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1}, {id : 2}, {id : 3, parentid : 1}]);
        expect(tasks.get(1).isNested()).to.equal(true);
        tasks.reset([{id : 1}, {id : 2}, {id : 3}]);
        expect(tasks.get(1).isNested()).to.equal(false);
    });

    it('task nested state change', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1}, {id : 2}, {id : 3, parentid : 1}]);
        var stateChangeCount = 0;
        tasks.get(1).on('nestedStateChange', function() {
            stateChangeCount += 1;
        });
        tasks.get(3).set('parentid', 0);
        expect(stateChangeCount).to.equal(1);
        tasks.get(3).set('parentid', 1);
        expect(stateChangeCount).to.equal(2);
    });
});