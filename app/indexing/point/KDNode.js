/*global define*/

define(['./constant'], function (cons) {
    'use strict';

    function KDNode(p) {
        this.p = p;
        this.son = [null, null];
        this.DISC = null; // split on which attribute, X or Y
    }

    var pro = KDNode.prototype;
    // left or right son
    pro.sonType = function (p) {
        // TODO == comparison may not work here.
        if (this.son[cons.left] == p) {
            return cons.left;
        } else {
            return cons.right;
        }
    };
    pro.nextDisc = function () {
        return (this.DISC === cons.xAttr) ? cons.yAttr : cons.xAttr;
    };
});
