/*global define*/
// NOTE: PMRkd seems to be effectively the same as PRkdTree, whose implementation is better.

define(['./utils', './PRkdBucketGeneric', './constant'], function (utils, prFather, cons) {
    'use strict';

    // set up class and inheritance
    function PMRkd(nodeType, cx, cy, maxBucketSize) {
        this.nodeType = nodeType;
        this.cx = cx;
        this.cy = cy;
        this.maxBucketSize = maxBucketSize;
        this.points = [];
        this.left = null;
        this.right = null;
    }
    utils.extend(PMRkd, prFather);
    var pro = PMRkd.prototype;

    pro.insert = function (pt, useX, width, height, maxDecomp) {
        var ok = maxDecomp > 0,
            lcx,
            lcy,
            rcx,
            rcy,
            cachedPts,
            i;

        // white node, no son
        if (this.nodeType === cons.white) {
            // console.log(this.toString(), 'to add', pt.toString());
            this.addPoint(pt);
            this.nodeType = cons.black;
            // console.log(this.toString(), 'added');
            return ok;
        }

        // gray node, dive into sons
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
            
            // console.log('gray point', this.toString(), 'added', 'ok:',ok);
            return ok;
        }

        // it is black, watch out for overflow
        if (this.nodeType === cons.black) {
            this.addPoint(pt);
            // console.log('itis black', this.toString(), 'added', pt.toString());
            if (this.points.length > this.maxBucketSize) {
                ok = ok && maxDecomp > 1;
                // console.log('overflowed, ok=', ok);
                this.nodeType = cons.gray;
                lcx = (useX) ? this.cx - width / 4 : this.cx;
                lcy = (useX) ? this.cy : this.cy - height / 4;
                rcx = (useX) ? this.cx + width / 4 : this.cx;
                rcy = (useX) ? this.cy : this.cy + height / 4;

                this.left = new PMRkd(cons.white, lcx, lcy, this.maxBucketSize);
                this.right = new PMRkd(cons.white, rcx, rcy, this.maxBucketSize);

                cachedPts = this.points;
                this.points = [];
                for (i = 0; i < cachedPts.length; i += 1) {
                    ok = this.insert(cachedPts[i], useX, width, height, maxDecomp) && ok;
                    // console.log('added', i, pt.toString(), 'ok:', ok);
                }
            }
            return ok;
        }
    };
    
    return PMRkd;
});
