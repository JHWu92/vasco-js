/*global define*/

define(['./constant', './QEdgeList', './QEdgeListRef', './QNode', './opHelper'], function (cons, QEdgeList, QEdgeListRef, QNode, op) {
    'use strict';


    /** true if l and all sons of l shares the same vertex
     * and the share vertex is the only vertex inside the square.
     * pt: Point, l: QEdgeList, s: QSquare*/
    function sharePM1Vertex(pt, l, s) {

        // l===null to stop recursion,
        // meaning all sons in the same square share the same Point
        if (l === null) {
            return true;
        }

        // pointer comparison
        // if pt1 is the share vertex, pt2 couldn't be inside s
        if (pt === l.DATA.pt1) {
            return (!op.ptInSquare(l.DATA.pt2, s) && sharePM1Vertex(pt, l.NEXT, s));
        }
        if (pt === l.DATA.pt2) {
            return (!op.ptInSquare(l.DATA.pt1, s) && sharePM1Vertex(pt, l.NEXT, s));
        }

        // if neither vertex of l === pt
        return false;
    }

    /** false if there are more than 1 vertex in s
     * l: QEdgeList, s: QSquare
     */
    function pm1Check(l, s) {
        if (l === null) {
            return true;
        }

        // if pt1===pt2(normally shouldn't happen)
        // then true if l has null NEXT
        // pointer comparison
        if (l.DATA.pt1 === l.DATA.pt2) {
            return (l.NEXT === null);
        }

        // for the line without NEXT,
        // return true if the whole line outside square
        if (l.NEXT === null) {
            return !(
                op.ptInSquare(l.DATA.pt1, s) &&
                op.ptInSquare(l.DATA.pt2, s)
            );
        }

        // if this QLine is within s, then false
        if (op.ptInSquare(l.DATA.pt1, s) && op.ptInSquare(l.DATA.pt2, s)) {
            return false;
        }

        // if one vertex is within s
        // return true if it shares the same vertex with its next
        if (op.ptInSquare(l.DATA.pt1, s)) {
            return (sharePM1Vertex(l.DATA.pt1, l.NEXT, s));
        }
        if (op.ptInSquare(l.DATA.pt2, s)) {
            return (sharePM1Vertex(l.DATA.pt2, l.NEXT, s));
        }

        // if none of its vertex is within s, then false
        return false;
    }


    // *********************
    // public methods
    // *********************

    /*p: QEdgeList, r: QNode, md: max decomposition*/
    function insert(p, r, md) {
        var ok = true,
            newList = op.clipLines(p, r.SQUARE);

        //        if (newList !== null) {
        //            console.log(md, 'candidate list p', p.toString());
        //            console.log(md, 'clip newList: ', newList.toString());
        //
        //        } else {
        //            console.log(md, 'no NewList');
        //        }
        // no line is inside the square window
        if (newList === null) {
            return ok;
        }

        if (r.nodeType !== cons.gray) {
            //            console.log(md, 'insert, not a gray node, existing dictionary=', (r.DICTIONARY === null) ? 'null' : r.DICTIONARY.toString());
            newList = op.mergeLists(newList, r.DICTIONARY);
            // console.log(md, 'merged, newList for r.dictionary', newList.toString());
            if (pm1Check(newList, r.SQUARE) || md < 0) {
                if (md < 0) {
                    ok = false;
                }
                r.DICTIONARY = newList;
                //                console.log(md, 'update root.DICTIONARY', ok);
                return ok;
            } else {
                op.splitPMNode(r);
                //                console.log(md, 'failed pm1Check, split root')
            }
        }

        //        console.log(md, 'it is a gray node, recursive on sons');
        for (var i = 0; i < 4; i += 1) {
            //            console.log(md, 'perform insert for son', cons.QuadName[i]);
            ok = insert(newList, r.SON[i], md - 1) && ok;
        }
        return ok;

    }


    /*P: QEdgeList, R: QNode*/
    function Delete(P, R) {
        // console.log('delete target list:', P.toString());
        var L = new QEdgeListRef();
        L.val = op.clipLines(P, R.SQUARE);
        if (L.val === null) {
            // console.log('clipLines === null, abort');
            return null;
        }
        // console.log('lines cliped:', L.val.toString(), 'in node:', R.toString());

        if (R.nodeType === cons.gray) {
            // console.log('a gray node, go for sons');
            for (var i = 0; i < 4; i += 1) {
                // console.log('Son: ', cons.QuadName[i]);
                Delete(L.val, R.SON[i]);
            }

            if (op.possiblePM1RMerge(R)) {
                // console.log('R can be merged after deletion on sons');
                L.val = null;
                if (tryToMergePM1(R, R, L)) {
                    R.DICTIONARY = L.val;
                    R.nodeType = cons.black;
                    R.SON = [null, null, null, null];
                }
                // console.log('new R', R.toString());
            }

        } else {
            // console.log('a black node, remove L.val from dictionary');
            R.DICTIONARY = op.setDifference(R.DICTIONARY, L.val);
        }
    }

    /** P: QNode, R: QNode, L: QEdgeListRef */
    function tryToMergePM1(P, R, L) {
        // console.log((typeof quad !== undefined) ? cons.QuadName[quad] : '', P);
        // console.log((P === null) ? 'p=null' : P.toString());
        // console.log((R === null) ? 'r=null' : R.toString());
        if (P.nodeType !== cons.gray) {
            L.val = op.setUnion(L.val, P.DICTIONARY);
            return (true);
        } else {
            return (
                tryToMergePM1(P.SON[0], R, L) &&
                tryToMergePM1(P.SON[1], R, L) &&
                tryToMergePM1(P.SON[2], R, L) &&
                tryToMergePM1(P.SON[3], R, L) &&
                pm1Check(L.val, R.SQUARE)
            );
        }
    }
    return {
        insert: insert,
        'delete': Delete
    };
});
