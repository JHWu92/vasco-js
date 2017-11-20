/*global define*/

define(['./utils', './PRbucketGeneric', './constant'], function (utils, prFather, cons) {
    'use strict';

    // set up class and inheritance
    function PRbucket(nodeType, cx, cy, maxBucketSize) {
        this.nodeType = nodeType;
        this.cx = cx;
        this.cy = cy;
        this.maxBucketSize = maxBucketSize;
        this.son = [null, null, null, null];
        this.points = [];
    }
    utils.extend(PRbucket, prFather);
    var pro = PRbucket.prototype;

    pro.overflow = function (pt, width, height, maxDecomp, ok) {
        var newNode = new PRbucket(cons.gray, this.cx, this.cy, this.maxBucketSize),
            i,
            oldPt;
        for (i = 0; i < this.points.length; i += 1) {
            // console.log('overflow: reinserting existing point_', i+1);
            oldPt = this.points[i];
            newNode.insert(oldPt, width, height, maxDecomp, ok);
        }
        // console.log('overflow: insert new point');
        newNode.insert(pt, width, height, maxDecomp, ok);
        this.points = newNode.points;
        this.son = newNode.son;
        this.nodeType = newNode.nodeType;
    };

    /* if maxDecomp<=0, stop decomposing, insert fails */
    pro.insert = function (pt, width, height, maxDecomp, ok) {
        // console.log(this.toString(), 'inserting', pt.toString(), ok, maxDecomp);
        var tmpNode, sonCx, sonCy, father, inQ;
        ok[0] = ok[0] && (maxDecomp > 0);

        // It is black meaning it has no son bucket
        if (this.nodeType === cons.black) {
            //            console.log('has no son bucket');
            if (this.points.length < this.maxBucketSize) {
                //                console.log('addPoint directly w/o overflow');
                this.addPoint(pt);
            } else {
                // console.log('overflow');
                if (maxDecomp === 1) {
                    return false;
                }
                this.overflow(pt, width, height, maxDecomp, ok);
            }
            return true;
        }

        // It is gray with some son buckets.
        tmpNode = this;
        // console.log('tmpNode', this.toString());
        inQ = this.PRCompare(pt);
        // console.log('in quadrant',cons.QuadName[inQ]);
        // if it has gray son bucket in this quadrant,
        // keep diving.
        while (tmpNode.son[inQ] !== null && tmpNode.son[inQ].nodeType === cons.gray) {
            // console.log('find a gray son in quadrant', cons.QuadName[inQ],'of',tmpNode.toString());
            tmpNode = tmpNode.son[inQ];
            width /= 2;
            height /= 2;
            inQ = tmpNode.PRCompare(pt); // get new quadrant
            maxDecomp -= 1; // decompose 1 time
        }

        // it doesn't have son in this quadrant
        // add a black son with this point and return
        if (tmpNode.son[inQ] === null) {
            // console.log(tmpNode.toString(),'does not have son in quadrant', inQ, 'Create new black bucket and add new point');
            sonCx = tmpNode.cx + cons.XF[inQ] * width;
            sonCy = tmpNode.cy + cons.YF[inQ] * height;
            tmpNode.son[inQ] = new PRbucket(cons.black, sonCx, sonCy, this.maxBucketSize);
            tmpNode.son[inQ].addPoint(pt);
            return true;
        }

        // it has a black son, dive into that son
        father = tmpNode;
        tmpNode = father.son[inQ];
        width /= 2;
        height /= 2;
        maxDecomp -= 1;
        // console.log(father.toString(), 'has a black son:', tmpNode.toString(), width, height);

        // NOTE: why? how can it not be black
        if (tmpNode.nodeType === cons.black) {
            // if point exists, don't insert again
            if (tmpNode.indexOfPt(pt) !== -1) {
                return false;
            }
            // if not exists and not at maximum capacity
            if (tmpNode.points.length < tmpNode.maxBucketSize) {
                tmpNode.addPoint(pt);
                return true;
            }
            // if not exists but will overflow upon inserting
            // overflow the tmpNode
            // check if it can be further decomposed
            // father.son[inQ] point to new tmpNode
            tmpNode.overflow(pt, width, height, maxDecomp, ok);
            father.son[inQ] = tmpNode;
        }
        return true;

    };

    return PRbucket;
});
