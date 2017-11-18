/*global define*/

define(['./constant', './QuadOP', './../../shape/Point'], function (cons, QuadOp, Point) {
    'use strict';
    var NRDIRS = 4; // number of sons

    function PointQuadTree(pt) {
        this.pt = pt;
        this.son = [];
        var i;
        for (i = 0; i < NRDIRS; i += 1) {
            this.son[i] = null;
        }
    }

    var pro = PointQuadTree.prototype;

    // ------------------------
    // print info about KDTree
    // ------------------------

    pro.toString = function () {
        return this.pt.toString();
    };

    pro.treeJSON = function () {
        var i, tree = {
            node: this.toString()
        };
        for (i = 0; i < NRDIRS; i += 1) {
            if (this.son[i] !== null) {
                tree[cons.QuadName[i]] = this.son[i].treeJSON();
            }
        }
        return tree;
    };

    pro.treeString = function () {
        return JSON.stringify(this.treeJSON(), null, '  ');
    };

    /** if node is a son of this. If yes, return quadrant; if not, return -1 */
    pro.SonTypeByNode = function (node) {
        var i;
        for (i = 0; i < NRDIRS; i += 1) {
            if (this.son[i] === node) {
                return i;
            }
        }
        return -1;
    };

    /* return number of direct sons, [0,4]*/
    pro.numDirectSons = function () {
        var count = 0,
            i;
        for (i = 0; i < NRDIRS; i += 1) {
            if (this.son[i] !== null) {
                count += 1;
            }
        }
        return count;
    };

    /** return first not empty son; 
     * return null if this has no son
     */
    pro.firstNotEmptySon = function () {
        var i;
        for (i = 0; i < NRDIRS; i += 1) {
            if (this.son[i] !== null) {
                return this.son[i];
            }
        }
        return null;
    }
    /** return which quadrant this query point is in
     * the North/South quadrant is different from 
     * VASCO because 
     * (0,0) in JS SVG is in the top-left coner 
     * while JAVAAPPLET in bottom-left.
     */
    pro.PQCompare = function (pt) {
        // NW(0): x< this.x  & y< this.y
        // NE(1): x>=this.x  & y< this.y
        // SW(2): x< this.x  & y<=this.y
        // SE(3): x>=this.x  & y<=this.y
        if (pt.x < this.pt.x) { // West
            return (pt.y > this.pt.y) ? cons.SW : cons.NW;
        }
        // East
        return (pt.y > this.pt.y) ? cons.SE : cons.NE;
    };

    /* insert a new point to this. If point exist, return false, else return true and insert into this */
    pro.insert = function (pt) {
        var curNode = this,
            father = null,
            quadrant;
        while (curNode !== null) {
            // if the Point to be inserted equals to existing son, return false(nothing inserted)
            if (pt.equals(curNode.pt)) {
                return false;
            }
            father = curNode;
            quadrant = curNode.PQCompare(pt);
            curNode = curNode.son[quadrant];
        }
        father.son[quadrant] = new PointQuadTree(pt);
        return true;

    };

    /** findFather for a query pt/node.pt
     */
    pro.findFather = function (pt, father) {

        // this pt is actually a node
        if (pt.hasOwnProperty('pt')) {
            pt = pt.pt;
        }

        if (pt.equals(this.pt)) {
            return father;
        }

        var son = this.son[this.PQCompare(pt)];

        if (son === null) {
            return null;
        }

        return son.findFather(pt, this);
    };

    pro.findCandidate = function (quadrant) {
        var node = this;
        while (node.son[QuadOp.OpQuad(quadrant)] !== null) {
            node = node.son[QuadOp.OpQuad(quadrant)];
        }
        return node.pt;
    }

    pro.findBest = function () {
        /* if NW's son is null, always use NW */
        function candidateForEmptySon(quadrant) {
            switch (quadrant) {
                case cons.SW:
                    return new Point(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
                case cons.NW:
                    return new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
                case cons.SE:
                    return new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                case cons.NE:
                    return new Point(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
            }
        }

        var min = Number.POSITIVE_INFINITY,
            i, bestQuad = -1,
            res, candidate;

        for (i = 0; i < NRDIRS; i += 1) {
            candidate = (this.son[i] === null) ? candidateForEmptySon(i) : this.son[i].findCandidate[i];
            
            // e.g. if son of i = 0(NW) is null, the candidate is (-inf, -inf), res=-inf
            // i = 1(NE), (inf, -inf), res=
            res = Math.abs(candidate.x - this.pt.x) + Math.abs(candidate.y - this.pt.y);
            
            // 
            if (res < min) {
                min = res;
                bestQuad = i;

            }

        }

    }
    return PointQuadTree;
});
