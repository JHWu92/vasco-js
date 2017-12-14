/*global define*/

define(function () {
    'use strict';

    function QEdgeList(qLine) {
        this.DATA = qLine;
        this.NEXT = null;
    }

    var pro = QEdgeList.prototype;
    pro.length = function () {
        var n = this,
            i = 1;
        while (n.NEXT !== null) {
            i += 1;
            n = n.NEXT;
        }
        return i;
    };
    pro.toString = function () {
        var str = 'QEdgeList: ',
            cur = this;
        while (cur !== null) {
            str += cur.DATA.toString() + '; ';
            cur = cur.NEXT;
        }
        return str;
    };

    return QEdgeList;
});
