/*global define*/

define(function () {
    'use strict';
    
    function Point(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }


    // augment Point
    var pro = Point.prototype;
    pro.name = 'Point';
    pro.getXY = function () {
        return [this.x, this.y];
    };
    pro.getXYStr = function () {
        return '(' + this.x + ', ' + this.y + ')';
    };
    pro.toString = function () {
        return this.name + ' ' + this.id + ' ' + this.getXYStr();
    };

    pro.update = function (x, y) {
        this.x = x;
        this.y = y;
    };

    pro.equals = function (pt) {
        return pt.x === this.x && pt.y === this.y;
    };
    return Point;
});
