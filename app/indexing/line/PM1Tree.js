/*global define*/

define(['./constant', './QEdgeList', './QNode', './opHelper'], function (cons, QEdgeList, QNode, op) {
    'use strict';


    /*l: QEdgeList, s: QSquare*/
    function pm1Check(l, s) {
        if (l === null) {
            return true;
        }

        // if pt1===pt2(normally shouldn't happen)
        // then true if l has null NEXT
        if (l.DATA.pt1 === l.DATA.pt2) // pointer comparison
            return (l.NEXT === null);

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
    
    /** P: QNode, R: QNode, L: QEdgeListRef */
    function tryToMergePM1(P, R, L){
        // TODO: delete function
        return;
    }
    // *********************
    // public methods
    // *********************
    
    /*p: QEdgeList, r: QNode, md: max decomposition*/
    function insert(p, r, md) {
        var ok = true,
            newList = op.clipLines(p, r.SQUARE);

        console.log('PM1Tree: insert. newList: ', newList);
        // no line is inside the square window
        if (newList === null) {
            return ok;
        }

        if (r.NODETYPE !== cons.gray) {
            console.log('insert, not a gray node');
            newList = op.mergeLists(newList, r.DICTIONARY);
            console.log('newList after mergeLists:', newList);
            if (pm1Check(newList, r.SQUARE) || md < 0) {
                if (md < 0) {
                    ok = false;
                }
                r.DICTIONARY = newList;
                return ok;
            } else {
                op.splitPMNode(r);
            }
        }

        for (var i = 0; i < 4; i += 1) {
            console.log('perform insert for son',i);
            ok = insert(newList, r.SON[i], md - 1) && ok;
        }
        return ok;

    }

    
    return {
        insert: insert
    };
});
