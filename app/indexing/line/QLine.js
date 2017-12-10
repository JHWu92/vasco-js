/*global define*/

define(function () {
    'use strict';

    function QLine(pt1, pt2) {
        this.name = null;
        this.LSON = null;
        this.RSON = null;
        this.pt1 = pt1;
        this.pt2 = pt2;
    }
    QLine.prototype.equals = function (qLn) {
        return (qLn !== null) &&
            (
                (this.pt1.equals(qLn.pt1) && this.pt2.equals(qLn.pt2)) ||
                (this.pt1.equals(qLn.pt2) && this.pt2.equals(qLn.pt1))
            );
    };
    QLine.prototype.toString = function () {
        return 'QLine [' + this.pt1.toString() + ', ' + this.pt2.toString() +
            ']';
    };
    
    return QLine;
});