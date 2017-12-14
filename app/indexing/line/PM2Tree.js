/*global define*/

define(function (require) {
    'use strict';

    var PM23 = require('./PM23'),
        op = require('./opHelper'),
        cons = require('./constant');

    /*P: QEdgeList, R: QNode, md: int, max decomposition*/
    function insert(P, R, md) {
        // console.log("PM2Tree.insert", R);
        var L = op.clipLines(P, R.SQUARE),
            ok = true,
            i;

        if (L === null) {
            return ok;
        }

        if (R.nodeType !== cons.gray) {
            L = op.mergeLists(L, R.DICTIONARY);
            if (PM23.pM2Check(L, R.SQUARE) || md < 0) {
                if (md < 0) {
                    ok = false;
                }
                R.DICTIONARY = L;
                return ok;

            } else {
                op.splitPMNode(R);
            }
        }

        for (i = 0; i < 4; i += 1) {
            ok = insert(L, R.SON[i], md - 1) && ok;
        }
        return ok;
    }

    return {
        insert: insert,
        'delete': PM23.del
    };

});
