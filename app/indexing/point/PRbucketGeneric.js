/*global define*/

define(['./constant'], function (cons) {
    'use strict';

    function PRbucketGeneric(nodeType, cx, cy, maxBucketSize) {
        this.nodeType = nodeType;
        this.cx = cx;
        this.cy = cy;
        this.maxBucketSize = maxBucketSize;
        this.son = [null, null, null, null];
        this.points = [];
    }


    var pro = PRbucketGeneric.prototype;


    // ------------------------
    // print info about KDTree
    // ------------------------

    pro.toString = function () {
        var str = cons.colorName[this.nodeType] + ' node ',
            i;
        for (i = 0; i < this.points.length; i += 1) {
            str += this.points[i].toString() + ', ';
        }
        return str;
    };

    pro.treeJSON = function () {
        var i, tree = {
            node: this.toString()
        };
        for (i = 0; i < 4; i += 1) {
            if (this.son[i] !== null) {
                tree[cons.QuadName[i]] = this.son[i].treeJSON();
            }
        }
        return tree;
    };

    pro.treeString = function () {
        return JSON.stringify(this.treeJSON(), null, '  ');
    };

    // function for points in bucket
    /* return the index of pt in this.points, -1 if not found */
    pro.indexOfPt = function (pt) {
        var i;
        // console.log('in indexOfPt, points=',this.points.length);
        for (i = 0; i < this.points.length; i += 1) {
            if (this.points[i].equals(pt)) {
                return i;
            }
        }
        return -1;
    };
    /* return true if added, false if pt exists */
    pro.addPoint = function (pt) {
        if (this.indexOfPt(pt) === -1) {
            this.points.push(pt);
            return true;
        }
        return false;
    };
    /* return true if deleted, false if pt doesn't exists */
    pro.deleteDirectPoint = function (pt) {
        var i = this.indexOfPt(pt);
        // console.log('index of point to be deleted', i);
        if (i === -1) {
            return false;
        }
        this.points.splice(i, 1);
        // console.log('delete point, remaining:', this.points);
        return true;
    };

    /* compare pt to a center (cx,cy) of a bucket */
    pro.PRCompare = function (pt) {
        // NW(0): x< this.x  & y< this.y
        // NE(1): x>=this.x  & y< this.y
        // SW(2): x< this.x  & y<=this.y
        // SE(3): x>=this.x  & y<=this.y
        if (pt.x < this.cx) { // West
            return (pt.y > this.cy) ? cons.SW : cons.NW;
        }
        // East
        return (pt.y > this.cy) ? cons.SE : cons.NE;
    };



    /** 
     * @param {double} x: x of center of a bucket
     * @param {double} y: y of .....
     */
    pro.deleteByPt = function (pt, width, height) {
        var res = {
                empty: false,
                deleted: true,
                node: this
            },
            quadrant, // which quadrant does pt land
            q, // iterate each quadrant
            i, // iterate points
            sumNumOfPoint = 0,
            newNode;

        if (this.nodeType === cons.black) {
            this.deleteDirectPoint(pt);
            // no points in bucket means the bucket is empty
            if (this.points.length === 0) {
                res.empty = true;
                res.node = null;
                return res;
            }
            return res;
        }

        // nodetype!=black, pt will be in one of this.son
        // keep diving until reach a black node.
        quadrant = this.PRCompare(pt);
        this.son[quadrant] = this.son[quadrant].deleteByPt(pt, width / 2, height / 2).node;

        for (q = 0; q < 4; q += 1) {
            if (this.son[q] !== null) {
                // if any son is gray, this node doesn't need replace
                if (this.son[q].nodeType === cons.gray) {
                    return res;
                }
                sumNumOfPoint += this.son[q].points.length;
            }
        }

        // None of the sons is gray,
        // check if its capacity can hold all points in sons
        if (sumNumOfPoint <= this.maxBucketSize) {
            // its capacity is enough, merge its son's points
            newNode = new PRbucketGeneric(cons.black, this.cx, this.cy, this.maxBucketSize);
            for (q = 0; q < 4; q += 1) {
                if (this.son[q] !== null) {
                    for (i = 0; i < this.son[q].points.length; i += 1) {
                        newNode.addPoint(this.son[q].points[i]);
                    }
                }
            }
            // update current node with new node
            this.son = newNode.son;
            this.points = newNode.points;
            this.nodeType = newNode.nodeType;
        }

        return res;
    };

    pro.getPartitions = function (minX, minY, width, height) {
        var partitions = [],
            hWid = width / 2,
            hHei = height / 2;
        // if this is a black bucket return empty partitions
        if (this.nodeType === cons.black) {
            return partitions;
        }

        // vertical and horizontal partitions
        partitions.push([this.cx, minY, this.cx, minY + height]);
        partitions.push([minX, this.cy, minX + width, this.cy]);

        // dive into sons
        function partFromSon(son, minX, minY, width, height) {
            if (son !== null) {

                return son.getPartitions.call(son, minX, minY, width, height);
            }
            return [];
        }
        Array.prototype.push.apply(partitions, partFromSon(this.son[0], minX, minY, hWid, hHei));
        Array.prototype.push.apply(partitions, partFromSon(this.son[1], minX + hWid, minY, hWid, hHei));
        Array.prototype.push.apply(partitions, partFromSon(this.son[2], minX, minY + hHei, hWid, hHei));
        Array.prototype.push.apply(partitions, partFromSon(this.son[3], minX + hWid, minY + hHei, hWid, hHei));

        return partitions;
    };

    return PRbucketGeneric;

});
