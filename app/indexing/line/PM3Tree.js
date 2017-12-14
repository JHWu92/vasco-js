/*global define, Math*/

define(function (require) {
    'use strict';

    var op = require('./opHelper'),
        cons = require('./constant'),
        PM23 = require('./PM23'),
        Point = require('app/shape/Point');

    /*P: Point, l: QEdgeList, S: QSquare*/
    function sharePM3Vertex(P, l, S) {
        if (l === null) {
            return true;
        }
        if (P === l.DATA.pt1) {
            return (!op.ptInSquare(l.DATA.pt2, S) && sharePM3Vertex(P, l.NEXT, S));
        }
        if (P === l.DATA.pt2) {
            return (!op.ptInSquare(l.DATA.pt1, S) && sharePM3Vertex(P, l.NEXT, S));
        }
        return (!op.ptInSquare(l.DATA.pt1, S) && !op.ptInSquare(l.DATA.pt2, S) && sharePM3Vertex(P, l.NEXT, S));
    }

    /*L: QEdgeList, S: QSquare*/
    function pm3Check(l, S) {
        if (l === null) {
            return true;
        }
        if (l.DATA.pt1 === l.DATA.pt2) {
            return (sharePM3Vertex(new Point(Math.POSITIVE_INFINITY, Math.NEGATIVE_INFINITY), l.NEXT, S));
        }

        if (op.ptInSquare(l.DATA.pt1, S) && op.ptInSquare(l.DATA.pt2, S)) {
            return false;
        }
        if (op.ptInSquare(l.DATA.pt1, S)) {
            return (sharePM3Vertex(l.DATA.pt1, l.NEXT, S));
        }
        if (op.ptInSquare(l.DATA.pt2, S)) {
            return (sharePM3Vertex(l.DATA.pt2, l.NEXT, S));
        }
        return pm3Check(l.NEXT, S);

    }

    /*P: QEdgeList, R: QNode, md: int, max decomposition*/
    function insert(P, R, md) {
        var L = op.clipLines(P, R.SQUARE),
            ok = true,
            i;

        if (L === null) {
            return ok;
        }
        if (R.nodeType !== cons.gray) {
            L = op.mergeLists(L, R.DICTIONARY);
            if (pm3Check(L, R.SQUARE) || md < 0) {
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
