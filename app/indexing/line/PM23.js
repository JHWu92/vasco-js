/*global define*/

define(function (require) {
    'use strict';

    var op = require('./opHelper'),
        cons = require('./constant'),
        QEdgeListRef = require('./QEdgeListRef');

    /*P: QNode*/
    function possiblePM23Merge(P) {
        return (
            P.SON[0].nodeType !== cons.gray &&
            P.SON[1].nodeType !== cons.gray &&
            P.SON[2].nodeType !== cons.gray &&
            P.SON[3].nodeType !== cons.gray
        );
    }

    /*P: Point, l: QEdgeList, S: QSquare*/
    function sharePM2Vertex(P, l, S) {
        if (l === null) {
            return true;
        }

        if (P === l.DATA.pt1) {
            return (!op.ptInSquare(l.DATA.pt2, S) && sharePM2Vertex(P, l.NEXT, S));
        }

        if (P === l.DATA.pt2) {
            return (!op.ptInSquare(l.DATA.pt1, S) && sharePM2Vertex(P, l.NEXT, S));
        }

        return false;
    }
    
    /*L: QEdgeList, S: QSquare*/
    function pM2Check(l, s) {
        if (l === null) {
            return true;
        }

        if (l.DATA.pt1 === l.DATA.pt2) {
            return (l.NEXT === null);
        }

        if (op.ptInSquare(l.DATA.pt1, s) && op.ptInSquare(l.DATA.pt2, s)) {
            return false;
        }

        if (sharePM2Vertex(l.DATA.pt1, l, s) || sharePM2Vertex(l.DATA.pt2, l, s)) {
            return true;
        } else {
            return false;
        }
    }

    /*P: QNode, R: QNode, L:QEdgeListRef*/
    function tryToMergePM23(P, R, L) {
        var i;
        for (i = 0; i < 4; i += 1) {
            L.val = op.setUnion(L.val, P.SON[i].DICTIONARY);
        }
        return pM2Check(L.val, P.SQUARE);
    }

    /*P: QEdgeList, R: QNode*/
    function del(P, R) {
        var L = new QEdgeListRef(),
            i;

        L.val = op.clipLines(P, R.SQUARE);
        if (L.val === null) {
            return null;
        }
        if (R.nodeType === cons.gray) {
            for (i = 0; i < 4; i += 1) {
                del(L.val, R.SON[i]);
            }
            if (possiblePM23Merge(R)) {
                L.val = null;
                if (tryToMergePM23(R, R, L)) {
                    R.DICTIONARY = L.val;
                    R.nodeType = cons.black;
                    R.SON = [null, null, null, null];
                }
            }

        } else {
            R.DICTIONARY = op.setDifference(R.DICTIONARY, L.val);
        }
    }
    
    return {
        del: del,
        pM2Check: pM2Check
    };
});
