/*global define, console*/

define(function (require) {
    'use strict';
    var extend = require('app/utils/extend');

    function RTreeNode(r, minlength, maxlength) {
        this.boundingBox = r;
        this.minlength = minlength;
        this.rarray = []; // children RTreeNodes
        for (var i = 0; i < maxlength; i++) {
            this.rarray[i] = null;
        }
        this.occup = 0;
    }
    
    function RTreeLeaf(gm, minlength, maxlength) {
        RTreeNode.call(this, gm.getBB(), minlength, maxlength);
        this.geom = gm;
    }
    extend(RTreeLeaf, RTreeNode);
    
    /*return new node*/
    RTreeNode.prototype.splitNode = function (min) {
        var i,
            split = min[0], // index of the first element from the second group
            bbox = this.rarray[min[1]].boundingBox;
        this.btreeKey = this.rarray[min[1]].btreeKey;
        for (i = 1; i < min[0]; i += 1) {
            bbox = bbox.union(this.rarray[min[i + 1]].boundingBox);
            this.btreeKey = Math.max(this.btreeKey, this.rarray[min[i + 1]].btreeKey);
        }
        this.boundingBox = bbox;

        bbox = this.rarray[min[split + 1]].boundingBox;
        var bkey = this.rarray[min[split + 1]].btreeKey;
        for (i = split + 1; i < this.rarray.length; i++) {
            bbox = bbox.union(this.rarray[min[i + 1]].boundingBox);
            bkey = Math.max(bkey, this.rarray[min[i + 1]].btreeKey);
        }

        var nn = new RTreeNode(bbox, this.minlength, this.rarray.length);
        nn.btreeKey = bkey;
        for (i = split; i < this.rarray.length; i += 1) {
            nn.rarray[i - split] = this.rarray[min[i + 1]];
        }

        var newrarray = new Array(this.rarray.length);
        for (i = 0; i < split; i += 1) {
            newrarray[i] = this.rarray[min[i + 1]];
        }
        this.rarray = newrarray;
        this.occup = split;
        nn.occup = this.rarray.length - split;
        return nn;

    };

    RTreeNode.prototype.linear = function () {
        var maxMinValX = Number.MIN_VALUE,
            maxMinValY = Number.MIN_VALUE,
            minMaxValX = Number.MAX_VALUE,
            minMaxValY = Number.MAX_VALUE,
            minValX = Number.MAX_VALUE,
            minValY = Number.MAX_VALUE,
            maxValX = Number.MIN_VALUE,
            maxValY = Number.MIN_VALUE,
            maxMinNodeX = -1,
            maxMinNodeY = -1,
            minMaxNodeX = -1,
            minMaxNodeY = -1,
            i, j;

        for (i = 0; i < this.rarray.length; i += 1) {
            if (this.rarray[i].boundingBox.x > maxMinValX) {
                maxMinValX = this.rarray[i].boundingBox.x;
                maxMinNodeX = i;
            }
            if (this.rarray[i].boundingBox.y > maxMinValY) {
                maxMinValY = this.rarray[i].boundingBox.y;
                maxMinNodeY = i;
            }
            if (this.rarray[i].boundingBox.x > minValX) {
                minValX = this.rarray[i].boundingBox.x;
            }
            if (this.rarray[i].boundingBox.y > minValY) {
                minValY = this.rarray[i].boundingBox.y;
            }
            if (this.rarray[i].boundingBox.x + this.rarray[i].boundingBox.width < minMaxValX) {
                minMaxValX = this.rarray[i].boundingBox.x + this.rarray[i].boundingBox.width;
                minMaxNodeX = i;
            }
            if (this.rarray[i].boundingBox.y + this.rarray[i].boundingBox.height < minMaxValY) {
                minMaxValY = this.rarray[i].boundingBox.y + this.rarray[i].boundingBox.height;
                minMaxNodeY = i;
            }
            if (this.rarray[i].boundingBox.x + this.rarray[i].boundingBox.width > maxValX) {
                maxValX = this.rarray[i].boundingBox.x + this.rarray[i].boundingBox.width;
            }
            if (this.rarray[i].boundingBox.y + this.rarray[i].boundingBox.height > maxValY) {
                maxValY = this.rarray[i].boundingBox.y + this.rarray[i].boundingBox.height;
            }

            var seed1, seed2,
                sepX = (maxMinValX - minMaxValX) / (maxValX - minValX),
                sepY = (maxMinValY - minMaxValY) / (maxValY - minValY);

            if (sepX > sepY) {
                seed1 = maxMinNodeX;
                seed2 = minMaxNodeX;
            } else {
                seed1 = maxMinNodeY;
                seed2 = minMaxNodeY;
            }

            var min = [];
            min[1] = seed1;
            min[this.rarray.length] = seed2; // min[0] is undefined

            var forward = 2,
                backward = this.rarray.length - 1,
                r1 = this.rarray[seed1].boundingBox,
                r2 = this.rarray[seed2].boundingBox;

            while (forward <= backward) {
                var n = -1,
                    maxdiff = Number.MIN_VALUE;
                loop:
                    for (i = 0; i < this.rarray.length; i += 1) {
                        for (j = 1; j < forward; j += 1)
                            if (min[j] == i)
                                continue loop;
                        for (j = this.rarray.length; j > backward; j -= 1)
                            if (min[j] == i)
                                continue loop;
                        n = i;
                        break;
                    } // generates nexxt non-used index

                var tst1 = r1.union(this.rarray[n].boundingBox);
                var tst2 = r2.union(this.rarray[n].boundingBox);
                console.log('tst1', tst1);
                console.log('tst2', tst2);
                if (tst1.getArea() - r1.getArea() > tst2.getArea() - r2.getArea()) {
                    min[backward] = n;
                    r2 = r2.union(this.rarray[n].boundingBox);
                    backward -= 1;
                } else {
                    min[forward] = n;
                    r1 = r1.union(this.rarray[n].boundingBox);
                    forward += 1;
                }
            }

            min[0] = forward - 1;
            if (min[0] < this.minlength)
                min[0] = this.minlength;
            if (min[0] > this.rarray.length - this.minlength)
                min[0] = this.rarray.length - this.minlength;
            console.log('min',min);
            return this.splitNode(min);
        }

    };

    RTreeNode.prototype.recalcBBox = function () {
        if (this instanceof RTreeLeaf) {
            return;
        }
        this.boundingBox = this.rarray[0].boundingBox;
        for (var i = 1; i < this.occup; i += 1)
            this.boundingBox = this.boundingBox.union(this.rarray[i].boundingBox);
    };

    /*r: RtreeNode/RTreeLeaft*/
    RTreeNode.prototype.insert = function (r, mode) {
        if (typeof mode === undefined) { // assume no overflow
            this.rarray[this.occup] = r;
            this.occup += 1;
            this.recalcBBox();
            this.btreeKey = Math.max(this.btreeKey, r.btreeKey);
        } else {
            console.log(this, r.btreeKey, this.boundingBox);
            this.boundingBox = this.boundingBox.union(r.boundingBox);
            this.btreeKey = Math.max(this.btreeKey, r.btreeKey);
            this.rarray[this.occup] = r;
            this.occup += 1;
            console.log('after union:', this.boundingBox, this.btreeKey, this.occup);
            console.log(this, this.occup);

            //            if(mode === "Hilbert nonpacked" || mode === "Morton nonpacked")
            //                return this.btree();

            if (this.occup === this.rarray.length) {
                if (mode === "Linear")
                    return this.linear();
                // TODO: a lot of other modes haven't been implemented
                else
                    return this.linear();
            }

            return null;
        }
    }
    
    return {
        RTreeNode: RTreeNode,
        RTreeLeaf: RTreeLeaf
    };
});