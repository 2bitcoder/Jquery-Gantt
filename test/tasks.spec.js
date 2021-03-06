var expect = require('chai').expect;
var Backbone = require('backbone');
var _ = require('underscore');
require('../src/libs/date');
Backbone.sync = function() {};
global.Backbone = Backbone;
global._ = _;

var Tasks = require('../src/js/collections/TaskCollection');

describe('Tasks', function(){
    it('should have some length', function(){
        var tasks = new Tasks([{}]);
        expect(tasks.length).to.equal(1);
    });

    it('resort on reset', function(){
        var tasks = new Tasks();
        var count = 0;
        tasks.on('sort', function() {
            count += 1;
        });
        tasks.reset([{id: 2}, {id: 1}]);
        expect(tasks.get(2).get('sortindex')).to.equal(0);
        expect(tasks.get(1).get('sortindex')).to.equal(1);
        expect(count).to.equal(1);
    });

    it('simple resort', function(){
        var tasks = new Tasks([{id: 1}, {id: 2}]);
        tasks.resort([{id: 2}, {id: 1}]);
        expect(tasks.get(2).get('sortindex')).to.equal(0);
        expect(tasks.get(1).get('sortindex')).to.equal(1);
    });

    it('nested resort', function(){
        var tasks = new Tasks([{id: 1}, {id: 2}, {id: 3}]);
        tasks.resort([
            {
                id: 3
            },
            {
                id: 2,
                children: [{id: 1}]
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
        var tasks = new Tasks([{id: 1}, {id: 2}, {id: 3}]);
        tasks.resort([
            {
                id: 3
            },
            {
                id: 2,
                children: [{id: 1}]
            }
        ]);
        tasks.resort([
            {
                id: 2,
                children: [{
                    id: 3
                }, {
                    id: 1
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

    it('linking children on reset', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1}, {id: 2}, {id: 3, parentid: 1}]);
        expect(tasks.get(1).children.length).to.equal(1);
        tasks.reset([{id: 1}, {id: 2}, {id: 3}]);
        expect(tasks.get(1).children.length).to.equal(0);
    });

    it('is nested method', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1}, {id: 2}, {id: 3, parentid: 1}]);
        expect(tasks.get(1).isNested()).to.equal(true);
        tasks.reset([{id: 1}, {id: 2}, {id: 3}]);
        expect(tasks.get(1).isNested()).to.equal(false);
    });

    it('task nested state change', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1}, {id: 2}, {id: 3, parentid: 1}]);
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
        tasks.reset([{id: 1}, {id: 2}, {id: 3, parentid: 2}]);

        var parent = tasks.get(2);
        var child = tasks.get(3);

        expect(parent.children.at(0)).to.equal(child);
        child.set({
            start: new Date('2014-12-10'),
            end: new Date('2014-12-12')
        });

        expect(parent.get('start').toDateString()).to.equal(child.get('start').toDateString());
        expect(parent.get('end').toDateString()).to.equal(child.get('end').toDateString());
    });

    it('update parent time on several children time change', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1}, {id: 2, parentid: 1}, {id: 3, parentid: 1}]);

        var parent = tasks.get(1);
        var child1 = tasks.get(2);
        var child2 = tasks.get(3);

        expect(parent.children.length).to.equal(2);
        child1.set({
            start: new Date('2014-12-10'),
            end: new Date('2014-12-12')
        });

        child2.set({
            start: new Date('2014-12-13'),
            end: new Date('2014-12-14')
        });

        expect(parent.get('start').toDateString()).to.equal(child1.get('start').toDateString());
        expect(parent.get('end').toDateString()).to.equal(child2.get('end').toDateString());
    });

    it('update parent time on grand child time change', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1, parentid: 3}, {id: 2}, {id: 3, parentid: 2}]);

        var parent = tasks.get(2);
        var child = tasks.get(3);
        var grandChild = tasks.get(1);

        grandChild.set({
            start: new Date('2014-12-10'),
            end: new Date('2014-12-12')
        });

        expect(parent.get('start').toDateString()).to.equal(child.get('start').toDateString());
        expect(parent.get('end').toDateString()).to.equal(child.get('end').toDateString());
    });

    it('task moving should move all sub children', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1, parentid: 3}, {id: 2}, {id: 3, parentid: 2}]);

        var parent = tasks.get(2);
        var child = tasks.get(3);
        var grandChild = tasks.get(1);

        parent.moveToStart(new Date('2014-12-12'));

        expect(child.get('start').toDateString()).to.equal(parent.get('start').toDateString());
        expect(grandChild.get('start').toDateString()).to.equal(parent.get('start').toDateString());
    });

    it('task moving should move all children (with deps)', function() {
        var tasks = new Tasks();
        tasks.reset([{
                id: 1,
                start: '2020-12-12'
            }, {
                id: 2,
                parentid: 1,
                start: '2020-12-12',
                end: '2020-12-15'
            }, {
                id: 3,
                parentid: 1,
                depend: 2,
                start: '2020-12-15',
                end: '2020-12-21'
        }], {parse: true});

        var parent = tasks.get(1);
        var child1 = tasks.get(2);
        var child2 = tasks.get(3);

        parent.moveToStart(new Date('2020-12-15'));

        expect(child1.get('start').toDateString()).to.equal(parent.get('start').toDateString());
        expect(child2.get('start').toDateString()).to.equal(child1.get('end').toDateString());
    });

    it('resort tasks on parentid change', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1, parentid: 3}, {id: 2}, {id: 3, parentid: 2}]);
        var count = 0;
        tasks.once('sort', function() {
            count++;
        });

        tasks.get(1).set('parentid', 2);
        expect(count).to.equal(1);
    });

    it('outdent to root', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1}, {id: 2, parentid: 1}, {id: 3, parentid: 2}]);
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
        tasks.reset([{id: 1, parentid: 3}, {id: 2}, {id: 3, parentid: 2}]);


        tasks.outdent(tasks.get(1));
        expect(tasks.get(1).get('parentid')).to.equal(2);
    });

    it('outdent child should add all siblings below as children', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1}, {id: 2, parentid: 1}, {id: 3, parentid: 1}, {id: 4, parentid: 1}]);

        var count = 0;
        tasks.on('sort', function() {
            count++;
        });

        tasks.outdent(tasks.get(2));
        // only one sort
        expect(count).to.equal(1);

        expect(tasks.get(1).children.length).to.equal(0);
        expect(tasks.get(2).children.length).to.equal(2);

        expect(tasks.get(2).children.at(0).id).to.equal(3);
        expect(tasks.get(2).children.at(1).id).to.equal(4);

        expect(tasks.get(3).parent.id).to.equal(2);
        expect(tasks.get(4).parent.id).to.equal(2);
    });

    it('outdent width dependencies', function() {
        var tasks = new Tasks();
        tasks.reset([{
            id: 1
        }, {
            id: 2,
            parentid: 1,
            start: new Date('2020-01-01'),
            end: new Date('2020-01-05')
        }, {
            id: 3,
            parentid: 1,
            depend: 2,
            start: new Date('2020-01-05'),
            end: new Date('2020-01-10')
        }], {parse: true});

        var count = 0;
        tasks.on('sort', function() {
            count++;
        });

        tasks.outdent(tasks.get(2));
        // only one sort
        expect(count).to.equal(1);

        expect(tasks.get(1).children.length).to.equal(0);
        expect(tasks.get(2).children.length).to.equal(1);

        expect(tasks.get(2).children.at(0).id).to.equal(3);

        expect(tasks.get(3).parent.id).to.equal(2);
    });

    it('indent task', function() {
        var tasks = new Tasks();
        tasks.reset([{id: 1}, {id: 2, parentid: 1}, {id: 3}]);
        var count = 0;
        tasks.on('sort', function() {
            count++;
        });

        tasks.indent(tasks.get(3));
        expect(tasks.get(3).get('parentid')).to.equal(1);
        expect(count).to.equal(1);

        expect(tasks.get(1).get('sortindex')).to.equal(0);
        expect(tasks.get(2).get('sortindex')).to.equal(1);
        expect(tasks.get(3).get('sortindex')).to.equal(2);
    });

    describe('Tasks dependencies', function() {
        it('create dependence from JSON', function() {
            var tasks = new Tasks();
            tasks.reset([{id: 1}, {id: 2, depend: 1}, {id: 3}], {parse: true});
            expect(tasks.get(2).get('depend')).to.eql([1]);
            expect(tasks.get(2).depends.at(0).id).to.equal(tasks.get(1).id);
        });

        it('remove invalid dependence from JSON', function() {
            var tasks = new Tasks();
            tasks.reset([{id: 1}, {id: 2, depend: 4}, {id: 3}], {parse: true});
            expect(tasks.get(2).get('depend')).to.eql([]);
        });

        it('create dependence', function() {
            var tasks = new Tasks();
            tasks.reset([{id: 1}, {id: 2}, {id: 3}], {parse: true});
            tasks.createDependency(tasks.get(1), tasks.get(2));
            expect(tasks.get(2).get('depend')).to.eql([1]);

            // delete dependency on before model destroy
            tasks.get(1).destroy();
            expect(tasks.get(2).get('depend')).to.eql([]);
        });

        it('move task on deps creating', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {
                id: 2,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {
                id: 3,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }]);

            tasks.createDependency(tasks.get(1), tasks.get(2));
            expect(tasks.get(2).get('depend')).to.eql([1]);

            expect(tasks.get(2).get('start').toDateString()).to.equal(new Date('2014-12-12').toDateString());
        });

        it('don`t move task on deps creating if dates is ok', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {
                id: 2,
                start: new Date('2014-12-15')
            }], {parse: true});


            tasks.createDependency(tasks.get(1), tasks.get(2));
            expect(tasks.get(2).get('depend')).to.eql([1]);
            expect(tasks.get(2).get('start').toDateString()).to.equal(new Date('2014-12-15').toDateString());
        });

        it('move task on deps creating via JSON', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {
                id: 2,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12'),
                depend: 1
            }, {
                id: 3,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }], {parse: true});

            expect(tasks.get(2).get('start').toDateString()).to.equal(new Date('2014-12-12').toDateString());
        });

        it('don`t move task on self dep', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12'),
                depend: 2
            }, {
                id: 2,
                start: new Date('2014-12-12'),
                end: new Date('2014-12-14'),
                depend: 3
            }, {
                id: 3,
                start: new Date('2014-12-14'),
                end: new Date('2014-12-20'),
                depend: 1
            }], {parse: true});

            expect(tasks.get(1).depends.at(0).id).to.equal(2);
            expect(tasks.get(2).depends.at(0).id).to.equal(3);
            expect(tasks.get(3).depends.at(0).id).to.equal(1);

            // should not throw infinite call stack
            tasks.get(3).moveToStart(new Date('2014-12-20'));
        });

        it('move task on before model forward move', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {
                id: 2,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12'),
                depend: 1
            }, {
                id: 3,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }], {parse: true});

            tasks.get(1).move(10);
            expect(tasks.get(2).get('start').toDateString()).to.equal(tasks.get(1).get('end').toDateString());
        });

        it('don`t move task on before model back move', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {id: 2, depend: 1}, {id: 3}], {parse: true});

            var previousDate = tasks.get(2).get('start').toDateString();
            tasks.get(1).move(-10);
            expect(tasks.get(2).get('start').toDateString()).to.equal(previousDate);
        });

        describe('stop listening', function() {
            var tasks;
            var previousDate, bef, task;

            beforeEach(function() {
                tasks = new Tasks();
                tasks.reset([{
                    id: 1,
                    start: new Date('2014-12-10'),
                    end: new Date('2014-12-12')
                }, {id: 2, depend: 1}, {id: 3}], {parse: true});
                previousDate = tasks.get(2).get('start').toDateString();
                bef = tasks.get(1);
                task = tasks.get(2);
            });

            it('on before model destroy', function() {
                bef.destroy();
                bef.move(10);
                expect(task.get('start').toDateString()).to.equal(previousDate);
            });

            it('on removing dependence', function() {
                tasks.removeDependency(task);
                bef.move(10);
                expect(task.get('start').toDateString()).to.equal(previousDate);
            });

            it('on self destroy', function() {
                task.destroy();
                bef.move(10);
                expect(task.get('start').toDateString()).to.equal(previousDate);
            });
        });

        it('don`t create dependence between parent and children', function() {
            var tasks = new Tasks();
            tasks.reset([{id: 1}, {id: 2, parentid: 1}, {id: 3, parentid: 2}], {parse: true});

            tasks.createDependency(tasks.get(1), tasks.get(2));
            expect(tasks.get(2).get('depend')).to.eql([]);

            tasks.createDependency(tasks.get(2), tasks.get(1));
            expect(tasks.get(1).get('depend')).to.eql([]);

            tasks.createDependency(tasks.get(1), tasks.get(3));
            expect(tasks.get(3).get('depend')).to.eql([]);

            tasks.createDependency(tasks.get(3), tasks.get(1));
            expect(tasks.get(2).get('depend')).to.eql([]);
        });

        it('don`t create dependence between already dependend tasks', function() {
            var tasks = new Tasks();
            tasks.reset([{id: 1}, {id: 2}, {id: 3, depend: 2}], {parse: true});

            tasks.createDependency(tasks.get(3), tasks.get(2));
            expect(tasks.get(2).get('depend')).to.eql([]);
        });

        it('support of several dependencies', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {
                id: 2,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12')
            }, {
                id: 3,
                start: new Date('2014-12-10'),
                end: new Date('2014-12-12'),
                depend: [1, 2]
            }]);


            expect(tasks.get(3).get('start').toDateString()).to.equal(new Date('2014-12-12').toDateString());

            tasks.get(1).move(2);
            expect(tasks.get(3).get('start').toDateString()).to.equal(new Date('2014-12-14').toDateString());

            tasks.get(2).move(3);
            expect(tasks.get(3).get('start').toDateString()).to.equal(new Date('2014-12-15').toDateString());
        });
    });

    describe('milestone', function() {
        it('reset start date on milestone true change', function() {
            var tasks = new Tasks();
            tasks.reset([{
                id: 1,
                start: '2010-10-12',
                end: '2010-10-16',
                milestone: true
            }], {parse: true});
            var task = tasks.get(1);
            expect(task.get('start').toDateString()).to.equal(task.get('end').toDateString());
        });

        it('reset start date on milestone true change', function() {
            var tasks = new Tasks();
            var task = tasks.add({
                start: '2010-10-12',
                end: '2010-10-16'
            }, { parse: true });
            task.set('milestone', true);
            expect(task.get('start').toDateString()).to.equal(task.get('end').toDateString());
        });

        it('reset milestone on child add', function() {
            var tasks = new Tasks();
            tasks.reset([{id: 1, milestone: true}, {id: 2}]);
            expect(tasks.get(1).get('milestone')).to.equal(true);

            tasks.get(2).set('parentid', 1);
            expect(tasks.get(1).get('milestone')).to.equal(false);
        });
    });

    describe('check collapsing', () => {
        it('must hide all child on collapse', () => {
            var tasks = new Tasks();
            tasks.reset([{id: 1}, {id: 2, parentid: 1}, {id: 3, parentid: 2}]);
            tasks.get(1).set('collapsed', 'true');
            expect(tasks.get(2).get('hidden')).to.equal(true);
            expect(tasks.get(3).get('hidden')).to.equal(true);
        });
    });


    it.only('check for no UPDATE sync on first loading', () => {
        var tasks = new Tasks();
        var counter = 0;
        Backbone.sync = function(type) {
            console.log(type);
            if (type === 'update') {
                counter += 1;
            }
        };
        tasks.reset([{id: 1}, {id: 2, parentid: 1}, {id: 3, parentid: 2, depend: [2]}]);
        expect(counter).to.equal(0);
    });
});
