
var ResourceEditor = require('../ResourcesEditor');

var linkImage = new Image();
linkImage.src = 'css/images/link.png';

var userImage = new Image();
userImage.src = 'css/images/user.png';

var BasicTaskView = Backbone.KonvaView.extend({
    _fullHeight: 21,
    _topPadding: 3,
    _barHeight: 15,
    _completeColor: '#e88134',
    _toolbarOffset: 20,
    _resourceListOffset: 20,
    _milestoneColor: 'blue',
    _milestoneOffset: 0,
    initialize: function(params) {
        this.height = this._fullHeight;
        this.settings = params.settings;
        this._initModelEvents();
        this._initSettingsEvents();
    },
    events: function() {
        return {
            'dragmove': function(e) {
                if (e.target.nodeType !== 'Group') {
                    return;
                }
                this._updateDates();
            },
            'dragend': function() {
                this.model.saveWithChildren();
                this.render();
            },
            'mouseenter': function(e) {
                this._showTools();
                this._hideResourcesList();
                this._grabPointer(e);
            },
            'mouseleave': function() {
                this._hideTools();
                this._showResourcesList();
                this._defaultMouse();
            },
            'dragstart .dependencyTool': '_startConnecting',
            'dragmove .dependencyTool': '_moveConnect',
            'dragend .dependencyTool': '_createDependency',
            'click .resources': '_editResources'
        };
    },
    el: function() {
        var group = new Konva.Group({
            dragBoundFunc: function(pos) {
                return {
                    x: pos.x,
                    y: this._y
                };
            }.bind(this),
            id: this.model.cid,
            draggable: true
        });
        var fakeBackground = new Konva.Rect({
            y: this._topPadding,
            height: this._barHeight,
            name: 'fakeBackground'
        });
        var rect = new Konva.Rect({
            fill: this._color,
            y: this._topPadding,
            height: this._barHeight,
            name: 'mainRect'
        });
        var diamond = new Konva.Rect({
            fill: this._milestoneColor,
            y: this._topPadding + this._barHeight / 2,
            x: this._barHeight / 2,
            height: this._barHeight * 0.8,
            width: this._barHeight * 0.8,
            offsetX: this._barHeight * 0.8 / 2,
            offsetY: this._barHeight * 0.8 / 2,
            name: 'diamond',
            rotation: 45,
            visible: false
        });
        var completeRect = new Konva.Rect({
            fill: this._completeColor,
            y: this._topPadding,
            height: this._barHeight,
            name: 'completeRect'
        });
        var self = this;
        var horOffset = 6;
        var arc = new Konva.Shape({
            y: this._topPadding,
            fill: 'lightgreen',
            sceneFunc: function(context) {
                var size = self._barHeight + (self._borderSize || 0);
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(horOffset, 0);
                context.arc(horOffset, size / 2, size / 2, -Math.PI / 2, Math.PI / 2);
                context.lineTo(0, size);
                context.lineTo(0, 0);
                context.fillShape(this);
                var imgSize = size - 4;
                context.drawImage(linkImage, 1, (size - imgSize) / 2, imgSize, imgSize);
            },
            hitFunc: function(context) {
                context.beginPath();
                context.rect(0, 0, 6 + self._barHeight, self._barHeight);
                context.fillShape(this);
            },
            name: 'dependencyTool',
            visible: false,
            draggable: true
        });

        var toolbar = new Konva.Group({
            y: this._topPadding,
            name: 'resources',
            visible: false
        });
        var size = self._barHeight + (self._borderSize || 0);
        var toolback = new Konva.Rect({
            fill: 'lightgrey',
            width: size,
            height: size,
            cornerRadius: 2
        });

        var userIm = new Konva.Image({
            image: userImage,
            width: size,
            height: size
        });
        toolbar.add(toolback, userIm);

        var resourceList = new Konva.Text({
            name: 'resourceList',
            y: this._topPadding,
            listening: false
        });

        group.add(fakeBackground, diamond, rect, completeRect, arc, toolbar, resourceList);
        return group;
    },
    _editResources: function() {
        var view = new ResourceEditor({
            model: this.model,
            settings: this.settings
        });
        var pos = this.el.getStage().getPointerPosition();
        view.render(pos);
    },
    _updateDates: function() {
        var attrs = this.settings.getSetting('attr'),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;

        var rect = this.el.find('.mainRect')[0];
        var length = rect.width();
        var x = this.el.x() + rect.x();
        var days1 = Math.round(x / daysWidth), days2 = Math.round((x + length) / daysWidth);

        this.model.set({
            start: boundaryMin.clone().addDays(days1),
            end: boundaryMin.clone().addDays(days2 - 1)
        });
    },
    _showTools: function() {
        this.el.find('.dependencyTool').show();
        this.el.find('.resources').show();
        this.el.getLayer().draw();
    },
    _hideTools: function() {
        this.el.find('.dependencyTool').hide();
        this.el.find('.resources').hide();
        this.el.getLayer().draw();
    },
    _showResourcesList: function() {
        this.el.find('.resourceList').show();
        this.el.getLayer().batchDraw();
    },
    _hideResourcesList: function() {
        this.el.find('.resourceList').hide();
        this.el.getLayer().batchDraw();
    },
    _grabPointer: function(e) {
        var name = e.target.name();
        if ((name === 'mainRect') || (name === 'dependencyTool') ||
            (name === 'completeRect') || (e.target.getParent().name() === 'resources')) {
            document.body.style.cursor = 'pointer';
        }
    },
    _defaultMouse: function() {
        document.body.style.cursor = 'default';
    },
    _startConnecting: function() {
        var stage = this.el.getStage();
        var tool = this.el.find('.dependencyTool')[0];
        tool.hide();
        var pos = tool.getAbsolutePosition();
        var connector = new Konva.Arrow({
            stroke: 'darkgreen',
            strokeWidth: 1,
            pointerWidth: 6,
            pointerHeight: 10,
            fill: 'grey',
            points: [pos.x - stage.x(), pos.y + this._barHeight / 2, pos.x - stage.x(), pos.y],
            name: 'connector'
        });
        this.el.getLayer().add(connector);
        this.el.getLayer().batchDraw();
    },
    _moveConnect: function() {
        var connector = this.el.getLayer().find('.connector')[0];
        var stage = this.el.getStage();
        var points = connector.points();
        points[2] = stage.getPointerPosition().x - stage.x();
        points[3] = stage.getPointerPosition().y;
        connector.points(points);
    },
    _createDependency: function() {
        var connector = this.el.getLayer().find('.connector')[0];
        connector.destroy();
        this.render();
        var stage = this.el.getStage();
        var el = stage.getIntersection(stage.getPointerPosition());
        var group = el && el.getParent();
        var taskId = group && group.id();
        var beforeModel = this.model;
        var afterModel = this.model.collection.get(taskId);
        if (afterModel) {
            this.model.collection.createDependency(beforeModel, afterModel);
        } else {
            var removeFor = this.model.collection.find(function(task) {
                return task.get('depend') === beforeModel.id;
            });
            if (removeFor) {
                this.model.collection.removeDependency(removeFor);
            }
        }
    },
    _initSettingsEvents: function() {
        this.listenTo(this.settings, 'change:interval change:dpi', function() {
            this.render();
        });
    },
    _initModelEvents: function() {
        // don't update element while dragging
        this.listenTo(this.model, 'change:start change:end change:complete change:resources', function() {
            var dragging = this.el.isDragging();
            this.el.getChildren().each(function(child) {
                dragging = dragging || child.isDragging();
            });
            if (dragging) {
                return;
            }
            this.render();
        });

        this.listenTo(this.model, 'change:hidden', function() {
            if (this.model.get('hidden')) {
                this.el.hide();
            } else {
                this.el.show();
            }
        });
    },
    _calculateX: function() {
        var attrs = this.settings.getSetting('attr'),
            boundaryMin = attrs.boundaryMin,
            daysWidth = attrs.daysWidth;

        return {
            x1: (Date.daysdiff(boundaryMin, this.model.get('start')) - 1) * daysWidth,
            x2: (Date.daysdiff(boundaryMin, this.model.get('end'))) * daysWidth
        };
    },
    _calculateCompleteWidth: function() {
        var x = this._calculateX();
        return (x.x2 - x.x1) * this.model.get('complete') / 100;
    },
    render: function() {
        var x = this._calculateX();
        // move group
        this.el.x(x.x1);

        // update fake background rect params
        var back = this.el.find('.fakeBackground')[0];
        back.x(-20);
        back.width(x.x2 - x.x1 + 60);

        // update main rect params
        var rect = this.el.find('.mainRect')[0];
        rect.x(0);
        rect.width(x.x2 - x.x1);

        // update complete params
        this.el.find('.completeRect')[0].width(this._calculateCompleteWidth());
        this.el.find('.completeRect')[0].x(0);

        var _milestoneOffset = 0;
        if (this.model.get('milestone')) {
            _milestoneOffset = 10;
        }

        // move tool position
        var tool = this.el.find('.dependencyTool')[0];
        tool.x(x.x2 - x.x1 + _milestoneOffset);
        tool.y(this._topPadding);

        var resources = this.el.find('.resources')[0];
        resources.x(x.x2 - x.x1 + this._toolbarOffset + _milestoneOffset);
        resources.y(this._topPadding);


        // update resource list
        var resourceList = this.el.find('.resourceList')[0];
        resourceList.x(x.x2 - x.x1 + this._resourceListOffset + _milestoneOffset);
        resourceList.y(this._topPadding + 2);
        var names = [];
        var list = this.model.get('resources');
        list.forEach(function(resourceId) {
            var res = _.find((this.settings.statuses.resourcedata || []), function(r) {
                return r.UserId.toString() === resourceId.toString();
            });
            if (res) {
                if (list.length < 3) {
                    names.push(res.Username);
                } else {
                    var aliases = _.map(res.Username.split(' '), function(str) {
                        return str[0];
                    }).join('');
                    names.push(aliases);
                }
            }
        }.bind(this));
        resourceList.text(names.join(', '));
        this.el.getLayer().batchDraw();
        return this;
    },
    setY: function(y) {
        this._y = y;
        this.el.y(y);
    },
    getY: function() {
        return this._y;
    }
});

module.exports = BasicTaskView;
