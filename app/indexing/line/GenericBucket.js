/*global define*/

define(function (require) {
    'use strict';

    var op = require('./opHelper'),
        cons = require('./constant'),
        QEdgeListRef = require('./QEdgeListRef');

    /*P: QEdgeList, R: QNode, L: QEdgeListRef*/
    function tryToMergePMR(P, R, L, maxBucketSize) {
        if (P.nodeType !== cons.gray) {
            L.val = op.setUnion(L.val, P.DICTIONARY);
            return (true);
        } else {
            var result = (
                tryToMergePMR(P.SON[0], R, L, maxBucketSize) &&
                tryToMergePMR(P.SON[1], R, L, maxBucketSize) &&
                tryToMergePMR(P.SON[2], R, L, maxBucketSize) &&
                tryToMergePMR(P.SON[3], R, L, maxBucketSize) &&
                L.val.length() <= maxBucketSize
            );
            console.log('tryTomergePMR, L.val.len', L.val.length(), 'mbs:', maxBucketSize, result);
            return (result);
        }
    }

    /*P: QEdgeList, R: QNode*/
    function del(P, R, maxBucketSize) {

        var L = new QEdgeListRef(),
            i;

        L.val = op.clipLines(P, R.SQUARE);
        if (L.val === null) {
            return;
        }
        if (R.nodeType === cons.gray) {
            for (i = 0; i < 4; i += 1) {
                del(L.val, R.SON[i], maxBucketSize);
            }
            if (op.possiblePM1RMerge(R)) {
                L.val = null;
                if (tryToMergePMR(R, R, L, maxBucketSize)) {
                    console.log('merge', 'level=', R.level, 'L.val.len=', L.val.length());
                    R.DICTIONARY = L.val;
                    R.nodeType = cons.black;
                    R.SON = [null, null, null, null];
                } else {
                    console.log('dont merge level = ', R.level);
                }
            }

        } else {
            console.log('level =', R.level, cons.colorName[R.nodeType],', len(dictionary):', R.DICTIONARY.length(), 'to delete L.val.length:', L.val.length());
            R.DICTIONARY = op.setDifference(R.DICTIONARY, L.val);
            console.log('level =', R.level, 'black node, after setDifference, len(dictionary):', (R.DICTIONARY===null)?0:R.DICTIONARY.length());

        }
    }

    return {
        del: del
    };
});
