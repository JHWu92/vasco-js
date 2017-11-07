define(function () {
    'use strict';

    function Line(id, p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.id = id;
    }

    var pro = Line.prototype;
    pro.name = 'Line';
    pro.getPoints = function () {
        return [this.p1, this.p2];
    };

    pro.getPointsStr = function () {
        return this.p1.getXYStr() + ' ' + this.p2.getXYStr();
    };

    pro.toString = function () {
        return [this.name, this.id, this.getPointsStr()].join(' ');
    };

    pro.update = function (args) {
        if ('x1' in args && 'y1' in args) {
            this.p1.update(args.x1, args.y1);
        }
        if ('x2' in args && 'y2' in args) {
            this.p2.update(args.x2, args.y2);
        }
    };

    return Line;
});
