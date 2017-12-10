/*global define*/

define(function () {
    'use strict';

    function QSquare(pt, len) {
        this.CENTER = pt;
        this.LEN = len;
    }

    QSquare.prototype.toRect = function () {
        return {
            x: this.CENTER.x - this.LEN / 2,
            y: this.CENTER.y - this.LEN / 2,
            width: this.LEN,
            height: this.LEN
        };
    };

    QSquare.prototype.toString = function () {
        return 'SQUARE: ' + this.CENTER.toString() + ', len: ' + this.LEN;
    };
    
    return QSquare;
});