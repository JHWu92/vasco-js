/*global define*/

define(['./constant', './quadOP', './../../shape/Point'], function (cons, qOP, Point) {
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

    // ----------------------------
    // direct son related functions
    // ---------------------------- 

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
    };


    // ----------------------------
    // find node by point
    // ----------------------------

    /* find node in this tree */
    pro.findNodeByPt = function (pt) {
        var node = this;
        // if it stops at node===null, it means no node is corresponded
        while (node !== null && !(node.pt.equals(pt))) {
            node = node.son[node.PQCompare(pt)];
        }
        return node;
    };

    /** findFather for a query pt/node.pt */
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

    // ----------------------------
    // Tree manipulation
    // ----------------------------

    /* insert a new point to this. If point exist, return false, else return true and insert into this */
    pro.insert = function (pt) {
        // this pt is actually a node
        if (pt.hasOwnProperty('pt')) {
            pt = pt.pt;
        }
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

    // Delete point helper
    // -------------------

    pro.findBest = function () {
        //console.log('findBest on ', this.toString());
        /* NOTE: why not just return +inf, +inf for all quadrant? they seems to work the same for res */
        function findCandidate(node, quadrant) {
            if (node === null) {
                switch (quadrant) {
                    case cons.SW:
                        return new Point(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
                    case cons.NW:
                        return new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
                    case cons.SE:
                        return new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                    case cons.NE:
                        return new Point(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
                }
            }
            // if node !==null
            //            console.log('findCandidate', node.toString());
            while (node.son[qOP.OpQuad(quadrant)] !== null) {
                node = node.son[qOP.OpQuad(quadrant)];
                //                console.log('findCandidate', node.toString());
            }
            return node.pt;
        }

        var min = Number.POSITIVE_INFINITY,
            bestQuad = -1,
            bestCand,
            i,
            res,
            candidate;

        for (i = 0; i < NRDIRS; i += 1) {
            candidate = findCandidate(this.son[i], i);

            // if son[i] == null, res is always +inf.
            res = Math.abs(candidate.x - this.pt.x) + Math.abs(candidate.y - this.pt.y);
            //            console.log('findBest on quadrant', i, candidate, res);
            // if all sons are null, bestQuad = -1
            if (res < min) {
                //                console.log('switch from', [min, bestQuad], 'to', [res, i]);
                min = res;
                bestQuad = i;
                bestCand = candidate;
            }
        }

        return {
            bestQ: bestQuad,
            candPt: bestCand
        };
    };

    function insertQuadrant(src, dest) {
        // son of leaf node, return
        if (src === null) {
            return;
        }

        var i;
        // dive into the leaf node of src
        // the recursion stops when all its son is null.
        for (i = 0; i < NRDIRS; i += 1) {
            insertQuadrant(src.son[i], dest);
        }
        // clear all its son because they have been
        // reinserted in dest
        // this is not necessary in this implementation
        // since this.insert() create a new node 
        // with the same src.pt, no src.sons
        for (i = 0; i < NRDIRS; i += 1) {
            src.son[i] = null;
        }

        dest.insert(src);

    }

    //TODO: finish documentation
    function newRoot(bestQ, son, root, father) {
        if (son.son[qOP.OpQuad(bestQ)] === null) {
            insertQuadrant(son.son[qOP.CQuad(bestQ)], root);
            insertQuadrant(son.son[qOP.CCQuad(bestQ)], root);
            if (root !== father) {
                father.son[qOP.OpQuad(bestQ)] = son.son[bestQ];
            } else {
                father.son[bestQ] = son.son[bestQ];
            }
        } else {
            root.adjQuad(bestQ, qOP.CQuad(bestQ), qOP.CQuad(bestQ), son);
            root.adjQuad(bestQ, qOP.CCQuad(bestQ), qOP.CCQuad(bestQ), son);
            if (root.PQCompare(son.son[qOP.OpQuad(bestQ)]) !== bestQ) {
                father = son.son[qOP.OpQuad(bestQ)];
                son.son[qOP.OpQuad(bestQ)] = null;
                insertQuadrant(father, root);
            } else {
                newRoot(bestQ, son.son[qOP.OpQuad(bestQ)], root, son);
            }
        }
    }

    // TODO: the parameters name doesn't seem to fit its use in newRoot
    pro.adjQuad = function (subQuad, oppoBestQ, sonQuad, father) {
        //            qOP.CQuad(bestQ), qOP.OpQuad(bestQ), qOP.CQuad(bestQ)
        var son = father.son[sonQuad];
        if (son === null) {
            return;
        }

        if (this.PQCompare(son.pt) === subQuad) {
            // if the son remains in baseQuad 
            // (c/cc of bestQ of deletion)
            // of the new root point
            // no reinsertion in 2 quadrants of son 
            // (subQuad and bestQ)
            // apply adjQuad to 2 others 
            // (opposite of subQuad and oppoBestQ)
            this.adjQuad(subQuad, oppoBestQ, qOP.OpQuad(subQuad), son);
            this.adjQuad(subQuad, oppoBestQ, oppoBestQ, son);
        } else {
            // reinsert entire quadrant
            // clear this position of current father
            father.son[sonQuad] = null;
            // reinsert entire quadrant into new root
            insertQuadrant(son, this);
        }

    };

    /* return true if the PQTree is not empty after deletion; false if it is empty */
    pro.deleteByPt = function (pt) {
        var father, tmpNode, repNode, candidate,
            bestQ = -1,
            foundBest,
            ptNode = this.findNodeByPt(pt);

        // can't find corresponding node, nothing is deleted
        if (ptNode === null) {
            return {
                deleted: false,
                empty: false
            };
        }

        // console.log('ptNode.numDirectSons()', ptNode.numDirectSons());

        if (ptNode.numDirectSons() <= 1) {
            // if only one son, no need for findBest
            // there is at most 1 son
            // so the repNode is the only son, if any.
            father = this.findFather(ptNode, null);
            // console.log(father);
            if (father === null) {
                // father === null, curNode is the root.
                repNode = this.firstNotEmptySon();
                if (repNode === null) {
                    return {
                        deleted: true,
                        empty: true
                    };
                }
                this.pt = repNode.pt;
                this.son = repNode.son;
            } else {
                father.son[father.SonTypeByNode(ptNode)] = ptNode.firstNotEmptySon();
            }
        } else {

            // Although findBest could return -1,
            // the possibility is captured by previous situation
            foundBest = ptNode.findBest();
            bestQ = foundBest.bestQ;
            //            candidate = ptNode.son[bestQ];  // VASCOapplet
            candidate = ptNode.findNodeByPt(foundBest.candPt);
            //            console.log('del->findBest on', ptNode.toString(), 'get bestQ=', bestQ, 'candidate=', candidate.toString());
            // the point of ptNode has changed
            // --> delete pt, move the coordinate to candidates
            ptNode.pt = candidate.pt;

            // Moving necessary quadrants after changing coordinate
            // reinsert adjacent quadrants of best quadrant
            // not in opposite quadrant
            ptNode.adjQuad(qOP.CQuad(bestQ), qOP.OpQuad(bestQ), qOP.CQuad(bestQ), ptNode);
            ptNode.adjQuad(qOP.CCQuad(bestQ), qOP.OpQuad(bestQ), qOP.CCQuad(bestQ), ptNode);

            if (ptNode.PQCompare(ptNode.son[bestQ].pt) !== bestQ) {
                // after adjQuad, if somehow ptNode.son[bestQ]
                // is not in ptNode's bestQ quardrant
                // e.g. the son.pt is ptNode.pt itself???
                // cache this son
                tmpNode = ptNode.son[bestQ];
                // set this position to null
                ptNode.son[bestQ] = null;
                // reinsert tmpNode and its descendent
                insertQuadrant(tmpNode, ptNode);
            } else {
                // apply newRoot to the bestQ
                newRoot(bestQ, ptNode.son[bestQ], ptNode, ptNode);
            }
        }
        return {
            deleted: true,
            empty: false
        };
    };


    pro.getPartitions = function (minX, minY, maxX, maxY) {
        var partition = [];
        if (this === null) {
            return partition;
        }

        if (this.firstNotEmptySon() !== null) {
            // vertical partition
            partition.push([this.pt.x, minY, this.pt.x, maxY]);
            // horizontal partition
            partition.push([minX, this.pt.y, maxX, this.pt.y]);
            // get partition from sons
            Array.prototype.push.apply(partition, this.getPartitions.call(this.son[0], minX, minY, this.pt.x, this.pt.y));
            Array.prototype.push.apply(partition, this.getPartitions.call(this.son[1], this.pt.x, minY, maxX, this.pt.y));
            Array.prototype.push.apply(partition, this.getPartitions.call(this.son[2], minX, this.pt.y, this.pt.x, maxY));
            Array.prototype.push.apply(partition, this.getPartitions.call(this.son[3], this.pt.x, this.pt.y, maxX, maxY));

        }

        return partition;
    }
    return PointQuadTree;
});
