/*global define*/

define(function (require) {
    'use strict';

    var gBucket = require('./GenericBucket'),
        cons = require('./constant'),
        op = require('./opHelper');

    /*P: QEdgeList, R: QNode, md: max decomposition, mbs: maxBucketSize*/
    function insert(P, R, md, mbs) {
        var L = op.clipLines(P, R.SQUARE),
            i,
            ok = md > 0 || true; // always true even if capacity exceeded

        if (L === null) {
            return ok;
        }
        if (R.nodeType !== cons.gray) {
            L = op.mergeLists(L, R.DICTIONARY);
            if (L.length() <= mbs || md < 0) {
                R.DICTIONARY = L;
                return ok;
            } else {
                op.splitPMNode(R);
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
