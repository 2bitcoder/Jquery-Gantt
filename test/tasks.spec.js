"use strict";
var expect = require("chai").expect;
var Backbone = require('backbone');
require('../src/js/lib/date');
Backbone.sync = function() {};
global.Backbone = Backbone;

var Tasks = require('../src/js/collections/TaskCollection');

describe("Tasks", function(){
    it("should have some length", function(){
        var tasks = new Tasks([{}]);
        expect(tasks.length).to.equal(1);
    });

    it('resort on reset', function(){
        var tasks = new Tasks();
        var count = 0;
        tasks.on('sort', function() {
            count += 1;
        });
        tasks.reset([{id : 2}, {id : 1}]);
        expect(tasks.get(2).get('sortindex')).to.equal(0);
        expect(tasks.get(1).get('sortindex')).to.equal(1);
        expect(count).to.equal(1);
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

    it('update parent time on child time change', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1}, {id : 2}, {id : 3, parentid : 2}]);

        var parent = tasks.get(2);
        var child = tasks.get(3);

        expect(parent.children.at(0)).to.equal(child);
        child.set({
            start : new Date('2014-12-10'),
            end : new Date('2014-12-12')
        });

        expect(parent.get('start').toDateString()).to.equal(child.get('start').toDateString());
        expect(parent.get('end').toDateString()).to.equal(child.get('end').toDateString());
    });

    it('update parent time on several children time change', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1}, {id : 2,parentid : 1}, {id : 3, parentid : 1}]);

        var parent = tasks.get(1);
        var child1 = tasks.get(2);
        var child2 = tasks.get(3);

        expect(parent.children.length).to.equal(2);
        child1.set({
            start : new Date('2014-12-10'),
            end : new Date('2014-12-12')
        });

        child2.set({
            start : new Date('2014-12-13'),
            end : new Date('2014-12-14')
        });

        expect(parent.get('start').toDateString()).to.equal(child1.get('start').toDateString());
        expect(parent.get('end').toDateString()).to.equal(child2.get('end').toDateString());
    });

    it('update parent time on grand child time change', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1, parentid: 3}, {id : 2}, {id : 3, parentid : 2}]);

        var parent = tasks.get(2);
        var child = tasks.get(3);
        var grandChild = tasks.get(1);

        grandChild.set({
            start : new Date('2014-12-10'),
            end : new Date('2014-12-12')
        });

        expect(parent.get('start').toDateString()).to.equal(child.get('start').toDateString());
        expect(parent.get('end').toDateString()).to.equal(child.get('end').toDateString());
    });

    it('task moving should move all sub children', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1, parentid: 3}, {id : 2}, {id : 3, parentid : 2}]);

        var parent = tasks.get(2);
        var child = tasks.get(3);
        var grandChild = tasks.get(1);

        parent.moveToStart(new Date('2014-12-12'));

        expect(child.get('start').toDateString()).to.equal(parent.get('start').toDateString());
        expect(grandChild.get('start').toDateString()).to.equal(parent.get('start').toDateString());
    });

    it('resort tasks on parentid change', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1, parentid: 3}, {id : 2}, {id : 3, parentid : 2}]);
        var count = 0;
        tasks.once('sort', function() {
            count++;
        });

        tasks.get(1).set('parentid', 2);
        expect(count).to.equal(1);
    });

    it('outdent to root', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1}, {id : 2, parentid : 1}, {id : 3, parentid : 2}]);
        var count = 0;
        tasks.on('sort', function() {
            count++;
            expect(tasks.get(2).get('parentid')).to.equal(0);
            expect(tasks.get(1).children.length).to.equal(0);
        });

        // do nothing if task already on root
        tasks.outdent(tasks.get(1));
        expect(count).to.equal(0);

        tasks.outdent(tasks.get(2));
        expect(count).to.equal(1);

    });

    it('outdent to grand parent', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1, parentid: 3}, {id : 2}, {id : 3, parentid : 2}]);


        tasks.outdent(tasks.get(1));
        expect(tasks.get(1).get('parentid')).to.equal(2);
    });

    it('indent task', function() {
        var tasks = new Tasks();
        tasks.reset([{id : 1}, {id : 2, parentid : 1}, {id : 3}]);
        var count = 0;
        tasks.once('sort', function() {
            count++;
        });

        tasks.indent(tasks.get(3));
        expect(tasks.get(3).get('parentid')).to.equal(1);
        expect(count).to.equal(1);

        expect(tasks.get(1).get('sortindex')).to.equal(0);
        expect(tasks.get(2).get('sortindex')).to.equal(1);
        expect(tasks.get(3).get('sortindex')).to.equal(2);
    });
});