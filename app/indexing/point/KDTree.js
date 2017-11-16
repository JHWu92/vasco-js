/*global define*/

define(['./constant'], function (cons) {
    'use strict';

    function KDTree(pt) {
        this.pt = pt;
        this.son = [null, null];
        this.DISC = cons.xAttr; // split on which attribute, X or Y
    }

    var pro = KDTree.prototype;

    pro.nextDisc = function () {
        return (this.DISC === cons.xAttr) ? cons.yAttr : cons.xAttr;
    };

    pro.noLeftSon = function () {
        return this.son[cons.left] === null;
    };
    pro.noRightSon = function () {
        return this.son[cons.right] === null;
    };
    pro.empty = function () {
        return this.noLeftSon() && this.noRightSon();
    };

    pro.directSonType = function (node) {
        // TODO == comparison may not work here.
        if (this.son[cons.left] === node) {
            return cons.left;
        } else if (this.son[cons.right] === node) {
            return cons.right;
        } else {
            return null;
        }
    };
    pro.directSonTypeByPt = function (pt) {
        var leftpt = null,
            rightpt = null;
        if (!this.noLeftSon()) {
            leftpt = this.son[cons.left].pt;
        }
        if (!this.noRightSon()) {
            rightpt = this.son[cons.right].pt;
        }

        if (leftpt !== null && leftpt.equals(pt)) {
            return cons.left;
        } else if (rightpt !== null && rightpt.equals(pt)) {
            return cons.right;
        } else {
            return null;
        }
    };

    /* compare a point to this node to see if the the point is on the left or right of this node */
    pro.KDCompare = function (pt) {
        if (this.DISC === cons.xAttr) {
            return (pt.x < this.pt.x) ? cons.left : cons.right;
        } else {
            return (pt.y < this.pt.y) ? cons.left : cons.right;
        }
    };

    /* code segment inside KDNode delete() */
    pro.findNodeByPt = function (pt) {
        var node = this,
            sonType = null;
        while (node !== null && !(node.pt.equals(pt))) {
            sonType = node.KDCompare(pt);
            node = node.son[sonType];
        }
        return node;
    };

    /** 
     * FindFather in vasco.KDTree. 
     * FindFather(node, this, father)
     * node: Target node, find the father for node.
     * this: current node, if node===this, return father.
     */
    pro.findFather = function (node, father) {
        if (node.pt.equals(this.pt)) {
            return father;
        }
        var son = this.son[this.KDCompare(node.pt)];
        if (son===null){return null;}
        return son.findFather(node, this);


    };

    /** recursively find node with minimum values in terms of disc*/
    pro.findDMinimum = function (disc) {
        function minNode(n1, n2, disc) {
            if (n1 === null) {
                return n2;
            }
            if (n2 === null) {
                return n1;
            }

            if (disc === cons.xAttr) {
                return (n1.pt.x < n2.pt.x) ? n1 : n2;
            }
            if (disc === cons.yAttr) {
                return (n1.pt.y < n2.pt.y) ? n1 : n2;
            }

        }

        var n1 = null,
            n2 = null;

        // if this is none, stop recursion
        if (this === null) {
            return null;
        }

        // if same split attribute
        // because the attribute is the same
        // descendant not larger than this itself are all LOSON
        if (this.DISC === disc) {
            // find a smaller node in the LOSON in terms of disc
            if (!this.noLeftSon()) {
                n1 = this.son[cons.left].findDMinimum(disc);
            }
            // compare the smallest in descendant with this itself
            return minNode(this, n1, disc);
        }

        // if not the same split attribute
        // minimum could be in either LOSON or HISON
        if (!this.noLeftSon()) {
            n1 = this.son[cons.left].findDMinimum(disc);
        }
        if (!this.noRightSon()) {
            n2 = this.son[cons.right].findDMinimum(disc);
        }
        // find min among n1, n2 and this itself
        return minNode(this, minNode(n1, n2, disc), disc);

    };

    pro.insert = function (pt) {
        var newNode = null,
            father = null,
            curNode = this, // iterate KD tree to find a spot for pt
            sontype = -1;


        // curNode == null means empty empty spot for newNode; 
        // newNode equals curNode means duplicate, don't add new node
        while (curNode !== null && !pt.equals(curNode.pt)) {
            father = curNode;
            sontype = father.KDCompare(pt);
            curNode = father.son[sontype];
        }

        if (curNode === null) {
            newNode = new KDTree(pt);
            newNode.DISC = father.nextDisc();
            father.son[sontype] = newNode;

        }
    };

    pro.deleteByPt = function (pt) {
        if (this.empty()){return false;}
        var rep, father, node;
        node = this.findNodeByPt(pt);
        rep = this.deleteHelperByNode(node);
        father = this.findFather(node, null);
 
        if (father === null) { // the node to be replaced is the root itself
            this.pt = rep.pt;
            this.DISC = rep.DISC;
            this.son = rep.son;
        } else {
            father.son[father.directSonType(node)] = rep;
        }
        return true;
    };

    pro.deleteHelperByNode = function (node) {
        var father = null, // original father of rep
            rep = null, // replacement for deleted node
            disc = null, // disc of deleted node
            hiSon; // hiSon of node

        // Stop recursion if node has no son
        if (node.empty()) {
            return null;
        }

        disc = node.DISC;

        // if node has no HISON, move LOSON to HISON
        if (node.son[cons.right] === null) {
            node.son[cons.right] = node.son[cons.left];
            node.son[cons.left] = null;
        }

        // find the node with minimun value in HISON 
        // in terms of disc(node.DISC)
        hiSon = node.son[cons.right];
        rep = hiSon.findDMinimum(disc);
        // find rep's current father in HISON
        father = hiSon.findFather(rep, node);

        // rep is supposed to replace node
        // -> rep is effectively deleted from its original position
        // -> recursively run the deleteByNode to trace down the left node
        //    whose son is empty
        // -> then fill up the empty slots from bottom to top.
        father.son[father.directSonType(rep)] = this.deleteHelperByNode(rep);

        // new root take over deleted node's son and DISC
        rep.son[cons.left] = node.son[cons.left];
        rep.son[cons.right] = node.son[cons.right];
        // TODO: why not just disc?
        rep.DISC = node.DISC;

        return rep;
    };

    pro.getPartitions = function (minX, minY, maxX, maxY) {
        var partition = [];
        //        console.log(minX, minY, maxX, maxY);
        if (this.empty()) {
            return partition;
        }
        if (this.DISC === cons.xAttr) {
            partition.push([this.pt.x, minY, this.pt.x, maxY]);
            if (!this.noLeftSon()) {
                Array.prototype.push.apply(partition,
                    this.son[cons.left].getPartitions(minX, minY, this.pt.x, maxY)
                    );
            }
            if (!this.noRightSon()) {
                Array.prototype.push.apply(partition,
                    this.son[cons.right].getPartitions(this.pt.x, minY, maxX, maxY)
                    );
            }

        } else {
            partition.push([minX, this.pt.y, maxX, this.pt.y]);
            if (!this.noLeftSon()) {
                Array.prototype.push.apply(partition, this.son[cons.left].getPartitions(minX, minY, maxX, this.pt.y));
            }
            if (!this.noRightSon()) {
                Array.prototype.push.apply(partition, this.son[cons.right].getPartitions(minX, this.pt.y, maxX, maxY));
            }

        }
        return partition;

    };
    pro.getBoundaryAsObj = function (minX, minY, maxX, maxY) {
        var bnd = {};
        if (this.empty()) {
            return null;
        }
        if (this.DISC === cons.xAttr) {
            bnd.me = [this.pt.x, minY, this.pt.x, maxY];
            if (!this.noLeftSon()) {
                bnd.left = this.son[cons.left].getBoundary(minX, minY, this.pt.x, maxY);
            }
            if (!this.noRightSon()) {
                bnd.right = this.son[cons.right].getBoundary(this.pt.x, minY, maxX, maxY);
            }

        } else {
            bnd.me = [minX, this.pt.y, maxX, this.pt.y];
            if (!this.noLeftSon()) {
                bnd.left = this.son[cons.left].getBoundary(minX, minY, maxX, this.pt.y);
            }
            if (!this.noRightSon()) {
                bnd.right = this.son[cons.right].getBoundary(minX, this.pt.y, maxX, maxY);
            }

        }
        return bnd;
    };

    // ------------------------
    // print info about KDTree
    // ------------------------

    pro.toString = function () {
        return this.pt.toString() + ' ' + this.DISC;
    };

    pro.treeJSON = function () {
        var tree = {
            node: this.toString()
        };
        if (!this.noLeftSon()) {
            tree.left = this.son[cons.left].treeJSON();
        }
        if (!this.noRightSon()) {
            tree.right = this.son[cons.right].treeJSON();
        }
        return tree;
    };

    pro.treeString = function () {
        return JSON.stringify(this.treeJSON(), null, '  ');
    };

    return KDTree;
});
