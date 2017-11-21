/*global define*/
// NOTE: this implementation is flawed. it won't subdivide enough for overflowed bucket. The right one is PRbucket

define(['./utils', './PRbucketGeneric', './constant'], function (utils, prFather, cons) {
    'use strict';

    // set up class and inheritance
    function PMR(nodeType, cx, cy, maxBucketSize) {
        this.nodeType = nodeType;
        this.cx = cx;
        this.cy = cy;
        this.maxBucketSize = maxBucketSize;
        this.son = [null, null, null, null];
        this.points = [];
    }
    utils.extend(PMR, prFather);
    var pro = PMR.prototype;

    pro.overflow = function (width, height) {
        var newNode = new PMR(cons.gray, this.cx, this.cy, this.maxBucketSize),
            i,
            inQ,
            sonCx,
            sonCy,
            oldPt;
        for (i = 0; i < this.points.length; i += 1) {
            oldPt = this.points[i];
            inQ = newNode.PRCompare(oldPt);
            if (newNode.son[inQ] === null) {
                sonCx = this.cx + cons.XF[inQ] * width;
                sonCy = this.cy + cons.YF[inQ] * height;
                newNode.son[inQ] = new PMR(cons.black, sonCx, sonCy, this.maxBucketSize);
            }
            newNode.son[inQ].addPoint(oldPt);
        }
        // replace this properties
        this.points = newNode.points;
        this.son = newNode.son;
        this.nodeType = newNode.nodeType;
    };

    pro.insert = function (pt, width, height, maxDecomp, ok) {

        console.log(this.toString(), 'inserting', pt.toString(), ok, maxDecomp);
        var tmpNode, father, inQ, sonCx, sonCy;

        // It is black, it has no son bucket.
        if (this.nodeType === cons.black) {
            console.log('has no son bucket');
            this.addPoint(pt);
            if (this.points.length > this.maxBucketSize) {
                maxDecomp -= 1;
                this.overflow(width, height);
                console.log('overflow');
            }
            ok[0] = ok[0] && (maxDecomp > 0);
            return;
        }

        // It is gray with some son buckets
        tmpNode = this;
        inQ = this.PRCompare(pt);
        while (tmpNode.son[inQ] !== null && tmpNode.son[inQ].nodeType === cons.gray) {
            tmpNode = tmpNode.son[inQ];
            width /= 2;
            height /= 2;
            inQ = tmpNode.PRCompare(pt); // get new quadrant
            maxDecomp -= 1; // decompose 1 time
        }

        // dive one more time
        maxDecomp -= 1;

        // son in this quadrant doesn't exist
        // create a new son
        if (tmpNode.son[inQ] === null) {
            ok[0] = ok[0] && (maxDecomp > 0);
            sonCx = tmpNode.cx + cons.XF[inQ] * width;
            sonCy = tmpNode.cy + cons.YF[inQ] * height;
            tmpNode.son[inQ] = new PMR(cons.black, sonCx, sonCy, this.maxBucketSize);
            tmpNode.son[inQ].addPoint(pt);
            return;
        }

        // this son exist
        father = tmpNode;
        tmpNode = father.son[inQ];
        width /= 2;
        height /= 2;
        console.log(father.toString(), 'find a black son', tmpNode.toString());
        
        if (tmpNode.nodeType === cons.black) {
            // pt doesn't exist
            if (tmpNode.indexOfPt(pt) === -1) {
                console.log(pt.toString(), 'doesnot exist');
                tmpNode.addPoint(pt);
                if (tmpNode.points.length > this.maxBucketSize) {
                    maxDecomp -= 1;
                    tmpNode.overflow(width, height);
                    console.log('tmpNode after overflow', tmpNode.toString());
                }
                ok[0] = ok[0] && (maxDecomp > 0);
            }
            return;
        }

    };

    return PMR;
});
