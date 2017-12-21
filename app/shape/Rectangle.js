/*global define, Math, require*/

define(['./Point'], function (Point) {
    'use strict';


    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    var Line, pro = Rectangle.prototype;

    require(["app/shape/Line"], function (L) {
        // Delayed loading circular dependency
        Line = L;
    });

    pro.toString = function () {
        return [this.x, this.y, this.width, this.height].join(' ');
    };
    pro.union = function (r) {
        var x1 = Math.min(this.x, r.x),
            x2 = Math.max(this.x + this.width, r.x + r.width),
            y1 = Math.min(this.y, r.y),
            y2 = Math.max(this.y + this.height, r.y + r.height);

        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    };
    pro.getArea = function () {
        return this.width * this.height;
    };
    pro.equals = function (obj) {
        if (obj instanceof Rectangle) {
            return (this.x === obj.x) && (this.y === obj.y) && (this.width === obj.width) && (this.height === obj.height);
        }
        return false;
    };
    pro.contains = function (obj) {
        if (obj instanceof Point) {
            return (obj.x >= this.x) && ((obj.x - this.x) <= this.width) &&
                (obj.y >= this.y) && ((obj.y - this.y) <= this.height);
        }
        if (obj instanceof Line) {
            return (this.contains(obj.pt1) && this.contains(obj.pt2));
        }
        if (obj instanceof Rectangle) {
            return (
                this.contains(new Point(obj.x, obj.y)) &&
                this.contains(new Point(obj.x + obj.width, obj.y)) &&
                this.contains(new Point(obj.x, obj.y + obj.height)) &&
                this.contains(new Point(obj.x + obj.width, obj.y + obj.height))
            );
        }
    };

    return Rectangle;
});
