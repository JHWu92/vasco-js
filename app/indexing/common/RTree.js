/*global define, Number, Math*/

define(function (require) {
    'use strict';
    var Rectangle = require('app/shape/Rectangle'),
        extend = require('app/utils/extend'),
        gCons = require('app/constant');


    // *************************************
    // Class for Leaf / non-leaf node
    // *************************************
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
                            if (min[j] == 1)
                                continue loop;
                        for (j = this.rarray.length; j > backward; j -= 1)
                            if (min[j] == i)
                                continue loop;
                        n = i;
                        break;
                    } // generates nexxt non-used index

                var tst1 = r1.union(this.rarray[n].boundingBox);
                var tst2 = r2.union(this.rarray[n].boundingBox);

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

    RTreeNode.prototype.insert = function (r, mode) {
        if (typeof mode === undefined) { // assume no overflow
            this.rarray[this.occup] = r;
            this.occup += 1;
            this.recalcBBox();
            this.btreeKey = Math.max(this.btreeKey, r.btreeKey);
        } else {
            this.boundingBox = this.boundingBox.union(r.boundingBox);
            this.btreeKey = Math.max(this.btreeKey, r.btreeKey);
            this.rarray[this.occup] = r;
            this.occup += 1;

            //            if(mode === "Hilbert nonpacked" || mode === "Morton nonpacked")
            //                return this.btree();

            if (this.occup === this.rarray.length) {
                if (mode === "Linear")
                    return this.linear();
                // a lot of other modes haven't been implemented
                else
                    return this.linear();
            }

            return null;
        }
    }


    // *************************************
    // Class for RTree operations
    // *************************************

    var structs = ['Linear'], // names of different strategies
        root = null, // RTreeNode
        splitMode,
        minNodeLength, maxNodeLength,
        //        maxSpaceFillingCurveLevel = 6,
        //        coverage, overlap,
        lastOn;

    function RTree(minnl, maxnl, mode) {
        if (typeof mode === undefined || !(mode in structs)) {
            mode = structs[0];
        }
        minNodeLength = minnl;
        maxNodeLength = maxnl;
        splitMode = mode;
        //        initSpaceFillingCurves();
    }

    function getHilbert(ii, jj) {
        return;
    }

    function getMorton(ii, jj) {
        var xloc = parseInt(ii), // works only for positive coordinates
            yloc = parseInt(jj), // ii, jj centroids of rectangles
            res = 0,
            i, bit1, bit2;

        for (i = 16; i >= 0; i -= 1) {
            bit1 = ((xloc & (1 << i)) != 0) ? 1 : 0;
            bit2 = ((yloc & (1 << i)) != 0) ? 1 : 0;
            res = res << 2 | (bit1 << 1) | bit2;
        }

        return res;
    }

    function getBtreeKey(r) {
        var DEFSIZE = 512,
            ii = parseInt(((DEFSIZE * ((r.x + r.width / 2) - 0)) / gCons.svgWidth)), // 0 corresponding to wholeCanvas.x(for zooming?),
            jj = parseInt(((DEFSIZE * ((r.y + r.height / 2) - 0)) / gCons.svgHeight));
        return (splitMode === "Hilbert nonpacked") ? getHilbert(ii, jj) : getMorton(ii, jj); // getHilbert hasn't be implemented
    }

    /*r: Drawable, n: RTreeNode*/
    function insertLoc(r, n) {
        if (n instanceof RTreeLeaf)
            return null;
        console.log('insertLoc, n=', n);
        var rt;
        n.boundingBox = n.boundingBox.union(r.getBB());

        if (n.rarray[0] instanceof RTreeLeaf) { // second level from bottom
            rt = new RTreeLeaf(r, minNodeLength, maxNodeLength);
            rt.btreeKey = getBtreeKey(r);
            return n.insert(rt, splitMode);
        }

        //        if(splitMode === "Hilbert nonpacked"  || splitMode === "Morton nonpacked"){}  not implemented

        var un = r.getBB().union(n.rarray[0].boundingBox),
            minS = un.getArea(),
            minI = 0,
            i, S;

        for (i = 1; i < n.occup; i++) {
            un = r.getBB().union(n.rarray[i].boundingBox);
            S = un.getArea();
            if (S < minS) {
                minS = S;
                minI = i;
            }
        }

        var nd = insertLoc(r, n.rarray[minI]);
        if (nd !== null)
            return n.insert(nd, splitMode);
        else
            return null;
    }

    /*r: Drawable, i.e., DRectangle*/
    function insert(r) {
        var oldr, rt, newr;

        if (root === null) {
            root = new RTreeLeaf(r, minNodeLength, maxNodeLength);
            root.btreeKey = getBtreeKey(r);
        } else {
            if (root instanceof RTreeLeaf) {
                oldr = root;
                root = new RTreeNode(r.getBB().union(oldr.boundingBox), minNodeLength, maxNodeLength);
                root.rarray[root.occup++] = oldr;
                root.rarray[root.occup++] = new RTreeLeaf(r, minNodeLength, maxNodeLength);
                root.rarray[1].btreeKey = getBtreeKey(r);
                if (root.rarray[0].btreeKey > root.rarray[1].btreeKey) { // switch the position
                    rt = root.rarray[0];
                    root.rarray[0] = root.rarray[1];
                    root.rarray[1] = rt;
                }
            } else {
                newr = insertLoc(r, root);
                if (newr !== null) {
                    oldr = root;
                    root = new RTreeNode(newr.boundingBox.union(oldr.boundingBox), minNodeLength, maxNodeLength);
                    root.btreeKey = Math.max(oldr.btreeKey, newr.btreeKey);
                    root.insert(oldr, splitMode);
                    root.insert(newr, splitMode);
                }
            }
        }
    }

    // TODO: to be implemented
    function insertRstar(r) {
        return;
    }

    function localInsert(r) {
        if (splitMode === "R* tree")
            insertRstar(r); // TODO: not implemented
        else
            insert(r);
    }

    /*add drawables of r to v*/
    function gat(r, v) {
        if (r === null)
            return;
        else if (r instanceof RTreeLeaf)
            v[v.length] = r.geom;
        else
            for (var i = 0; i < r.occup; i += 1)
                gat(r.rarray[i], v); // go to the leaf nodes

    }

    function deleteRec(toErase, r, toRe) {
        var counter = 0,
            i;
        for (i = 0; i < r.occup; i += 1) {
            if (r.rarray[i] instanceof RTreeLeaf) { //sons are leaves
                if (r.rarray[i].boundingBox.equals(toErase.getBB())) {
                    r.rarray[i] = r.rarray[r.occup - 1];
                    r.occup--;
                    r.recalcBBox();
                    return;
                } else {
                    counter++;
                }
            } else if (r.rarray[i].boundingBox.contains(toErase.getBB())) {
                deleteRec(toErase, r.rarray[i], toRe);
            }
        }

        if (counter === r.occup) // sons are leaves but none is the rectangle to be deleted
            return;

        // verify RTree consistency after return from the recursion
        for (i = 0; i < r.occup; i += 1) {
            if (r.rarray[i].occup < minNodeLength) {
                gat(r.rarray[i], toRe);
                r.rarray[i] = r.rarray[r.occup - 1];
                r.occup--;
                i--;
            }
        }
        r.recalcBBox();
    }

    function deleteDirect(toErase) {
        if (root === null)
            return;
        if (root instanceof RTreeLeaf) {
            root = null;
            return;
        }
        if (toErase !== null) {
            var toRe = [],
                i; // a list of elements to be re inserted
            deleteRec(toErase, root, toRe);
            if (root.occup === 1)
                root = root.rarray[0];
            for (i = 0; i < toRe.length; i += 1) {
                localInsert(toRe[i]);
            }
        }
    }


    function getName() {
        return 'R Tree';
    }

    function orderDependent() {
        return 'order dependent';
    }

    function getRoot() {
        return root;
    }
    return {
        RTree: RTree,
        Insert: localInsert,
        Delete: deleteDirect,
        getName: getName,
        orderDependent: orderDependent,
        getRoot: getRoot
    }
});
