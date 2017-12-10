/*global define*/

define(function (require) {
    'use strict';

    var cons = require('./constant'),
        Point = require('app/shape/Point'),
        QEdgeList = require('./QEdgeList'),
        QNode = require('./QNode'),
        QSquare = require('./QSquare');

    /*len: len of the square*/
    function initRoot(len) {
        var center = new Point(len / 2, len / 2),
            s = new QSquare(center, len),
            root = new QNode(s, 0);

        // console.log('initRoot', root.toString());
        return root;
    }

    /*l,r: QEdgeList*/
    function setUnion(l, r) {
        var root = null,
            last = null,
            left = l,
            pt;

        while (l !== null) {
            last = root;
            root = new QEdgeList(l.DATA);
            if (last !== null) {
                root.NEXT = last;
            }
            l = l.NEXT;

        }
        while (r !== null) {
            for (pt = left; pt !== null; pt = pt.NEXT) {
                if (r.DATA.equals(pt.DATA)) {
                    break;
                }
            }
            if (pt === null) {
                last = root;
                root = new QEdgeList(r.DATA);
                if (last !== null) {
                    root.NEXT = last;
                }
            }
            r = r.NEXT;
        }
        return root;
    }

    /*l,r: QEdgeList*/
    function setDifference(l, r) {
        var root = null,
            last = null,
            left = l,
            pt,
            loc;

        while (l !== null) { // erase duplicate elements just once
            for (pt = r; pt !== null; pt = pt.NEXT) {
                if (l.DATA.equals(pt.DATA)) {

                    for (loc = left; loc !== l; loc = loc.NEXT) {
                        if (loc.DATA.equals(l.DATA)) {
                            pt = null;
                            break;
                        }
                    }

                    break;
                }
            }

            if (pt === null) {
                last = root;
                root = new QEdgeList(l.DATA);
                if (last !== null) {
                    root.Next = last;
                }
            }
            l = l.NEXT;
        }
    }

    /*pt:Point, s:QSquare*/
    function ptInSquare(pt, s) {
        var halfLen = s.LEN / 2,
            center = s.CENTER,
            xInRange = (center.x - halfLen) <= pt.x && pt.x <= (center.x + halfLen),
            yInRange = (center.y - halfLen) <= pt.y && pt.y <= (center.y + halfLen);
        return xInRange && yInRange;

    }

    /** which area, divided by QSquare, does a Point(x,y) lie in
     * (float x, float y, QSquare s)*/
    function clipArea(x, y, s) {
        var cx = s.CENTER.x,
            cy = s.CENTER.y,
            halfLen = s.LEN / 2,
            left = 1,
            right = 2,
            up = 4,
            down = 8,
            code = 0;
        if (x < (cx - halfLen)) {
            code = left;
        } else if (x >= (cx + halfLen)) {
            code = right;
        }
        if (y < (cy - halfLen)) {
            code |= down;
        } else if (y >= (cy + halfLen)) {
            code |= up;
        }
        return code;


    }

    /** (float x1, float y1, float x2, float y2, QSquare s)
     * return true if line(represented by x1, y1, x2, y2) interset with or within square, 
     * false if outside or the line is very short.
     */
    function cSquare(x1, y1, x2, y2, s) {
        var code1 = clipArea(x1, y1, s),
            code2 = clipArea(x2, y2, s),
            mid_x,
            mid_y;
        // one vertex inside, line intersects
        if (code1 === 0 || code2 === 0) {
            return true;
        }

        // vertices are all outside and in the same direction
        if ((code1 & code2) !== 0) {
            return false;
        }

        // the line is very short
        if (Math.abs(x1 - x2) < 1e-5 && Math.abs(y1 - y2) < 1e-5) {
            return false;
        }

        // vertices are outside but not the same direction
        // break it into two lines and check again
        mid_x = (x1 + x2) / 2;
        mid_y = (y1 + y2) / 2;
        return cSquare(x1, y1, mid_x, mid_y, s) || cSquare(x2, y2, mid_x, mid_y, s);

    }

    /*s: QSquare*/
    function ptOnBoundary(pt, s) {
        var halfLen = s.LEN / 2,
            center = s.CENTER,
            xInRange = (center.x - halfLen) <= pt.x && pt.x <= (center.x + halfLen),
            yInRange = (center.y - halfLen) <= pt.y && pt.y <= (center.y + halfLen),
            xOnBound = pt.x === (center.x - halfLen) || pt.x === (center.x + halfLen),
            yOnBound = pt.y === (center.y - halfLen) || pt.y === (center.y + halfLen);
        return (xInRange && yOnBound) || (xOnBound && yInRange);

    }

    /** if a QLine intersects with a QSquare, 
     * true if either endpoint of QLine on the boundary of QSquare,
     *         or QLine is within QSquare or QLine crosses QSquare.
     * QLine q, QSqaure s*/
    function clipSquare(q, s) {
        return ptOnBoundary(q.pt1, s) || ptOnBoundary(q.pt2, s) || cSquare(q.pt1.x, q.pt1.y, q.pt2.x, q.pt2.y, s);
    }

    /** merge 2 QEdgeList
     * l: left QEdgeList, r: right QEdgeList
     */
    function mergeLists(l, r) {
        var root = null,
            prevList = null;

        // add l data to root
        while (l !== null) {
            prevList = root;
            root = new QEdgeList(l.DATA);
            if (prevList !== null) {
                root.NEXT = prevList;
            }
            l = l.NEXT;
        }

        // add r data to root
        while (r !== null) {
            prevList = root;
            root = new QEdgeList(r.DATA);
            if (prevList !== null) {
                root.NEXT = prevList;
            }
            r = r.NEXT;
        }
        return root;
    }

    /** Add a Qline into a QEdgeList thru mergeLists()
     * q: QLine, l: QEdgeList
     */
    function addToList(q, l) {
        var newL = new QEdgeList(q);
        return mergeLists(newL, l);

    }

    /** keep lines intersects with square in a QEdgeList.
     * l: QEdgelist, s: QSquare
     */
    function clipLines(l, s) {
        if (l === null) {
            return null;
        }
        if (clipSquare(l.DATA, s)) {
            return (addToList(l.DATA, clipLines(l.NEXT, s)));
        }
        return (clipLines(l.NEXT, s));
    }

    /*P:QNode*/
    function splitPMNode(P) {
        var XF = [-0.25, 0.25, -0.25, 0.25],
            YF = [0.25, 0.25, -0.25, -0.25],
            center, len, // center and len for son QNode
            Q,
            S;

        for (var i = 0; i < 4; i += 1) {
            center = new Point(P.SQUARE.CENTER.x + XF[i] * P.SQUARE.LEN, P.SQUARE.CENTER.y + YF[i] * P.SQUARE.LEN);
            len = P.SQUARE.LEN * 0.5;
            S = new QSquare(center, len);
            Q = new QNode(S, P.level + 1);
            P.SON[i] = Q;
        }

        P.DICTIONARY = null;
        P.nodeType = cons.gray;

    }

    function getPartitions(qnode) {
        if (qnode === null) {
            return [];
        }
        var rects = [qnode.SQUARE.toXYWH()],
            i;
        for (i = 0; i < 4; i += 1) {
            Array.prototype.push.apply(rects, getPartitions(qnode.SON[i]));
        }
        return rects;
    }

    /*P: QNode*/
    function possiblePM1RMerge(P) {
        return (P.SON[0].nodeType !== cons.gray ||
            P.SON[1].nodeType !== cons.gray ||
            P.SON[2].nodeType !== cons.gray ||
            P.SON[3].nodeType !== cons.gray)
    }

    return {
        clipLines: clipLines,
        mergeLists: mergeLists,
        ptInSquare: ptInSquare,
        initRoot: initRoot,
        splitPMNode: splitPMNode,
        getPartitions: getPartitions,
        possiblePM1RMerge: possiblePM1RMerge,
        setDifference: setDifference,
        setUnion: setUnion
    };
});
