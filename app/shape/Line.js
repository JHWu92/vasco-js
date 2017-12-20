/*global define, Math*/
define(['./Rectangle'], function (Rectangle) {
    'use strict';

    function Line(pt1, pt2) {
        this.pt1 = pt1;
        this.pt2 = pt2;
        this.bbox = new Rectangle(Math.min(pt1.x, pt2.x), Math.min(pt1.y, pt2.y), Math.abs(pt1.x - pt2.x), Math.abs(pt1.y - pt2.y));
    }

    var pro = Line.prototype;
    pro.name = 'Line';
    pro.getPoints = function () {
        return [this.pt1, this.pt2];
    };

    pro.getPointsStr = function () {
        return this.pt1.getXYStr() + ' ' + this.pt2.getXYStr();
    };

    pro.toString = function () {
        return [this.name, this.id, this.getPointsStr()].join(' ');
    };

    pro.update = function (args) {
        if ('x1' in args && 'y1' in args) {
            this.pt1.update(args.x1, args.y1);
        }
        if ('x2' in args && 'y2' in args) {
            this.pt2.update(args.x2, args.y2);
        }
    };

    /* point order irrelevant */
    pro.equals = function (ln) {
        return (ln !== null) &&
            (
                (this.pt1.equals(ln.pt1) && this.pt2.equals(ln.pt2)) ||
                (this.pt1.equals(ln.pt2) && this.pt2.equals(ln.pt1))
            );
    };

    pro.getBB = function () {
        return this.bbox;
    };

    return Line;
});
