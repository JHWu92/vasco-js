/*global define*/

define(['./constant'], function (cons) {
    'use strict';

    function PRkdBucketGeneric(nodeType, cx, cy, maxBucketSize) {
        this.nodeType = nodeType;
        this.cx = cx;
        this.cy = cy;
        this.maxBucketSize = maxBucketSize;
        this.points = [];
        this.left = null;
        this.right = null;
    }

    var pro = PRkdBucketGeneric.prototype;

    // ------------------------
    // print info about Tree
    // ------------------------

    pro.toString = function () {
        var str = cons.colorName[this.nodeType] + ' c(' + this.cx + ',' + this.cy + ') ',
            i;
        for (i = 0; i < this.points.length; i += 1) {
            str += this.points[i].toString() + ', ';
        }
        return str;
    };

    pro.treeJSON = function () {
        var tree = {
            node: this.toString()
        };
        if (this.left !== null) {
            tree.left = this.left.treeJSON();
        }
        if (this.right !== null) {
            tree.right = this.right.treeJSON();
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
    pro.isInPt = function (pt) {
        return this.indexOfPt(pt) !== -1;
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
        // console.log('index of point to be deleted', i, this.toString());
        if (i === -1) {
            return false;
        }
        this.points.splice(i, 1);
        // console.log('delete point, remaining:', this.points);
        // it is white as long as points are not full
        this.nodeType = cons.white;
        return true;
    };

    pro.deleteByPt = function (pt, useX, width, height) {
        // if pt is in this.points, 
        // this.nodeType!==gray
        // console.log('deleteByPt', this.toString(), 'inpt:', this.isInPt(pt));
        var res = {};
        if (this.isInPt(pt)) {
            res.deleted = this.deleteDirectPoint(pt);
            return {
                empty: this.point !== cons.gray && this.points.length === 0,
                deleted: res.deleted
            };
        }

        // console.log('deleteByPt: search pt in sons of a', this.toString(), 'useX',useX);
        // delete point in sons
        if (useX) { // partition based on X coordinate
            if (pt.x > this.cx) { // on the right of X coor
                if (this.right !== null) {
                    // console.log('deleteByPt: ', this.toString(), 'use X, in this.right', this.right.isInPt(pt));
                    if (this.right.isInPt(pt)) {
                        res.deleted = this.right.deleteDirectPoint(pt);
                    } else {
                        res = this.right.deleteByPt(pt, !useX, width / 2, height);
                    }
                }
            } else { // on the left of X coor
                if (this.left !== null) {
                    // console.log('deleteByPt:', this.toString(), 'use X, in this.left', this.left.isInPt(pt));
                    if (this.left.isInPt(pt)) {
                        res.deleted = this.left.deleteDirectPoint(pt);
                    } else {
                        res = this.left.deleteByPt(pt, !useX, width / 2, height);
                    }
                }
            }
        } else { // partition based on Y coordinate
            if (pt.y > this.cy) { // on the right of Y coor
                if (this.right !== null) {
                    // console.log('deleteByPt:', this.toString(), 'use Y, in this.right', this.right.isInPt(pt));
                    if (this.right.isInPt(pt)) {
                        res.deleted = this.right.deleteDirectPoint(pt);
                    } else {
                        res = this.right.deleteByPt(pt, !useX, width, height / 2);
                    }
                }
            } else { // on the left of Y coor
                if (this.left !== null) {
                    // console.log('deleteByPt:', this.toString(), 'user Y, in this.left', this.left.isInPt(pt));
                    if (this.left.isInPt(pt)) {
                        res.deleted = this.left.deleteDirectPoint(pt);
                    } else {
                        res = this.left.deleteByPt(pt, !useX, width, height / 2);
                    }
                }
            }
        }

        // see if merge available
        // this.left !== null means this.right !== null
        // this.left/right !== gray means they have no
        // sub bucket. If they have, definitely no merge
        if (this.left !== null &&
            this.left.nodeType !== cons.gray &&
            this.right.nodeType !== cons.gray &&
            this.left.points.length + this.right.points.length <= this.maxBucketSize) {

            // console.log('merge available', this.left.points.length + this.right.points.length);

            this.points = [];
            this.nodeType = (this.left.points.length + this.right.points.length === this.maxBucketSize) ? cons.black : cons.white;

            var i;
            for (i = 0; i < this.left.points.length; i += 1) {
                this.addPoint(this.left.points[i]);
            }

            for (i = 0; i < this.right.points.length; i += 1) {
                this.addPoint(this.right.points[i]);
            }
            this.left = null;
            this.right = null;
            // console.log('after merge', this.toString());
        }

        // it has sons, can't be empty
        return res;
    };

    pro.getPartitions = function (useX, minX, minY, width, height) {
        // console.log('getParitition', this.toString());
        var partitions = [];
        // if this is not a gray bucket return empty partitions
        if (this.nodeType !== cons.gray) {
            // console.log('return empty partition');
            return partitions;
        }
        partitions.push((useX) ? [this.cx, minY, this.cx, minY + height] : [minX, this.cy, minX + width, this.cy]);

        function partFromSon(son, useX, minX, minY, width, height) {
            if (son !== null) {
                return son.getPartitions(useX, minX, minY, width, height);
            }
        }
        if (useX) {
            partitions.push.apply(partitions, partFromSon(this.left, !useX, minX, minY, width / 2, height));
            partitions.push.apply(partitions, partFromSon(this.right, !useX, this.cx, minY, width / 2, height));
        } else {
            partitions.push.apply(partitions, partFromSon(this.left, !useX, minX, minY, width, height / 2));
            partitions.push.apply(partitions, partFromSon(this.right, !useX, minX, this.cy, width, height / 2));
        }
        return partitions;
    };



    return PRkdBucketGeneric;

});
