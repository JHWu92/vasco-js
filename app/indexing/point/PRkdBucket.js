/*global define*/

define(['./utils', './PRkdBucketGeneric', './constant'], function (utils, prFather, cons) {
    'use strict';

    // set up class and inheritance
    function PRkdBucket(nodeType, cx, cy, maxBucketSize) {
        this.nodeType = nodeType;
        this.cx = cx;
        this.cy = cy;
        this.maxBucketSize = maxBucketSize;
        this.points = [];
        this.left = null;
        this.right = null;
    }
    utils.extend(PRkdBucket, prFather);
    var pro = PRkdBucket.prototype;

    pro.insert = function (pt, useX, width, height, maxDecomp) {
        var ok = maxDecomp > 0,
            lcx,
            lcy,
            rcx,
            rcy,
            cachedPt,
            i;

        if (this.nodeType === cons.gray) {
            maxDecomp -= 1;
            if (useX) {
                if (pt.x > this.cx) {
                    ok = this.right.insert(pt, !useX, width / 2, height, maxDecomp) && ok;
                } else {
                    ok = this.left.insert(pt, !useX, width / 2, height, maxDecomp) && ok;
                }
            } else {
                if (pt.y > this.cy) {
                    ok = this.right.insert(pt, !useX, width, height / 2, maxDecomp) && ok;
                } else {
                    ok = this.left.insert(pt, !useX, width, height / 2, maxDecomp) && ok;
                }
            }
            return ok;
        }

        // if not gray
        if (this.isInPt(pt)) {
            return ok;
        }

        this.addPoint(pt);
        
        if (this.points.length === this.maxBucketSize) {
            this.nodeType = cons.black;
        } else if (this.points.length > this.maxBucketSize) {
            this.nodeType = cons.gray;

            lcx = (useX) ? this.cx - width / 4 : this.cx;
            lcy = (useX) ? this.cy : this.cy - height / 4;
            rcx = (useX) ? this.cx + width / 4 : this.cx;
            rcy = (useX) ? this.cy : this.cy + height / 4;

            this.left = new PRkdBucket(cons.white, lcx, lcy, this.maxBucketSize);
            this.right = new PRkdBucket(cons.white, rcx, rcy, this.maxBucketSize);

            cachedPt = this.points;
            this.points = [];
            for (i = 0; i < cachedPt.length; i += 1) {
                ok = this.insert(cachedPt[i], useX, width, height, maxDecomp) && ok;
            }
        }
        return ok;
    };
    
    return PRkdBucket;
});
