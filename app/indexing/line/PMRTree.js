/*global define*/

define(function (require) {
    'use strict';

    var gBucket = require('./GenericBucket'),
        op = require('./opHelper'),
        cons = require('./constant');

    /*P: QEdgeList, R: QNode, md: max decomposition, mbs: maxBucketSize*/
    function insert(P, R, md, mbs) {
        var L = op.clipLines(P, R.SQUARE),
            ok = md > 0,
            i;

        if (L === null) {
            return ok;
        }

        if (R.nodeType !== cons.gray) {
            L = op.mergeLists(L, R.DICTIONARY);
            if (L.length() <= mbs) {
                R.DICTIONARY = L;
                return ok;
            } else {
                op.splitPMNode(R);
                for (i = 0; i < 4; i += 1) {
                    R.SON[i].DICTIONARY = op.clipLines(L, R.SON[i].SQUARE);
                }
                return ok && (md > 1);  // this block adds one level
            }
        }

        for (i = 0; i < 4; i += 1) {
            ok = insert(L, R.SON[i], md - 1, mbs) && ok;
        }
        return ok;
    }

    return {
        del: gBucket.del,
        insert: insert
    };
});
