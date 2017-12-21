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
        this.btreeKey = 0;
    }

    function RTreeLeaf(gm, minlength, maxlength) {
        RTreeNode.call(this, gm.getBB(), minlength, maxlength);
        this.geom = gm;
    }
    extend(RTreeLeaf, RTreeNode);

    RTreeNode.prototype.toString = function () {
        return 'RTreeNode/Leaf BBox: ' + this.boundingBox.toString() + ', len_rarray: ' + this.rarray.length + ', btreeKey: ' + this.btreeKey + ', occup: ' + this.occup;
    }
    //    RTreeNode.prototype.setBBox = function (newBB) {
    //        console.log('**********');
    //        console.log('newBB', newBB, 'this.bb', this.boundingBox);
    //        this.boundingBox = newBB;
    //        console.log('this.bb', this.boundingBox);
    //        console.log('**********');
    //
    //    };

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
            i, j,
            upperLeftX, upperLeftY, bottomRightX, bottomRightY;

        for (i = 0; i < this.rarray.length; i += 1) {
            upperLeftX = this.rarray[i].boundingBox.x;
            upperLeftY = this.rarray[i].boundingBox.y;
            bottomRightX = this.rarray[i].boundingBox.x + this.rarray[i].boundingBox.width;
            bottomRightY = this.rarray[i].boundingBox.y + this.rarray[i].boundingBox.height;
            // console.log(i, upperLeftX, upperLeftY, bottomRightX, bottomRightY);
            if (upperLeftX > maxMinValX) {
                maxMinValX = upperLeftX
                maxMinNodeX = i;
            }
            if (upperLeftY > maxMinValY) {
                maxMinValY = upperLeftY;
                maxMinNodeY = i;
            }
            if (upperLeftX < minValX) {
                minValX = upperLeftX;
            }
            if (upperLeftY < minValY) {
                minValY = upperLeftY;
            }
            if (bottomRightX < minMaxValX) {
                minMaxValX = bottomRightX;
                minMaxNodeX = i;
            }
            if (bottomRightY < minMaxValY) {
                minMaxValY = bottomRightY;
                minMaxNodeY = i;
            }
            if (bottomRightX > maxValX) {
                maxValX = bottomRightX;
            }
            if (bottomRightY > maxValY) {
                maxValY = bottomRightY;
            }
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
        // console.log(maxMinNodeX, minMaxNodeX, maxMinNodeY, minMaxNodeY);
        // console.log('on', (sepX > sepY) ? 'x' : 'y', 'seed', seed1, seed2);
        var min = [];
        min[1] = seed1;
        min[this.rarray.length] = seed2; // min[0] is undefined

        var forward = 2,
            backward = this.rarray.length - 1,
            r1 = this.rarray[seed1].boundingBox,
            r2 = this.rarray[seed2].boundingBox;
        // console.log('forward backward:', forward, backward);
        while (forward <= backward) {
            var n = -1;
            loop:
                for (i = 0; i < this.rarray.length; i += 1) {
                    for (j = 1; j < forward; j += 1)
                        if (min[j] == i) {
                            // console.log('i=', i, 'has been used before forward');
                            continue loop;
                        }
                    for (j = this.rarray.length; j > backward; j -= 1)
                        if (min[j] == i) {
                            // console.log('i=', i, 'has been used after backward');
                            continue loop;
                        }
                    n = i;
                    break;
                } // generates next non-used index
            // console.log('n=', n);
            var tst1 = r1.union(this.rarray[n].boundingBox);
            var tst2 = r2.union(this.rarray[n].boundingBox);
            // console.log('tst1', tst1);
            // console.log('tst2', tst2);
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
        // console.log('min', min);
        return this.splitNode(min);


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

        // console.log(this.toString());
        this.boundingBox = this.boundingBox.union(r.boundingBox);
        this.btreeKey = Math.max(this.btreeKey, r.btreeKey);
        this.rarray[this.occup++] = r;
        // console.log('after union:', this.boundingBox, this.btreeKey, this.occup);
        // console.log(this.toString(), this.occup);

        //            if(mode === "Hilbert nonpacked" || mode === "Morton nonpacked")
        //                return this.btree();

        if (this.occup === this.rarray.length) {
            // console.log('overflow, split');
            if (mode === "Linear")
                return this.linear();
            // TODO: a lot of other modes haven't been implemented
            else
                return this.linear();
        }

        return null;

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
        maxNodeLength = maxnl+1;
        splitMode = mode;
        root = null;
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
            bbox = r.getBB(),
            ii = parseInt(((DEFSIZE * ((bbox.x + bbox.width / 2) - 0)) / gCons.svgWidth)), // 0 corresponding to wholeCanvas.x(for zooming?),
            jj = parseInt(((DEFSIZE * ((bbox.y + bbox.height / 2) - 0)) / gCons.svgHeight));
        
        return (splitMode === "Hilbert nonpacked") ? getHilbert(ii, jj) : getMorton(ii, jj); // getHilbert hasn't be implemented
    }

    /*r: Drawable, n: RTreeNode*/
    function insertLoc(r, n) {
        if (n instanceof RTreeLeaf)
            return null;
        var rt;
        // console.log('===============');
        // console.log('insertLoc, original BBox', n.boundingBox);
        // console.log('union with r.bb:', r.getBB());

        n.boundingBox = n.boundingBox.union(r.getBB());
        //        n.setBBox(newbb);

        // console.log('after union', n.boundingBox);
        // console.log(n.toString());

        if (n.rarray[0] instanceof RTreeLeaf) { // second level from bottom
            // console.log('n.rarray[0] instanceof RTreeLeaf')
            rt = new RTreeLeaf(r, minNodeLength, maxNodeLength);
            rt.btreeKey = getBtreeKey(r);
            // console.log(n.boundingBox, 'insert', rt.boundingBox, 'geom:', rt.geom);
            //            console.log(n.toString());
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
            // console.log('RTree.insert: root==null');
            root = new RTreeLeaf(r, minNodeLength, maxNodeLength);
            root.btreeKey = getBtreeKey(r);
        } else {
            if (root instanceof RTreeLeaf) {
                // console.log('RTree.insert: root == rtreeleaf');
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
                    // console.log('==========');
                    // console.log('RTree.insert: after insertLoc, newr.bb:', newr.boundingBox);
                    // console.log('the obj is:', newr.toString());
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
        // console.log('localinsert:', r.toString());
        if (splitMode === "R* tree")
            insertRstar(r); // TODO: not implemented
        else
            insert(r);
    }

    /*add drawables of r to v*/
    function gat(r, v) {
        // console.log(r,v);
        if (r === null) {
            return;
        } else if (r instanceof RTreeLeaf) {
            // console.log('add one gat');
            v[v.length] = r.geom;
        } else {
            for (var i = 0; i < r.occup; i += 1) {
                gat(r.rarray[i], v); // go to the leaf nodes
            }
        }
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
            // console.log(toRe.length);
            if (root.occup === 1) {
                // console.log('root occup = 1');
                root = root.rarray[0];
            }
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

    function treeJSON(lev, r) {
        var tree = {},
            i, son;

        if (typeof lev === 'undefined') {
            lev = 0;
        }
        if (typeof r === 'undefined') {
            r = root;
        }

        if (r === null) {
            return null;
        }

        tree.lev = lev;
        tree.btreeKey = r.btreeKey;
        if (r instanceof RTreeLeaf) {
            tree.leaf = r.geom.toString();
            return tree;
        }

        tree.node = 'rect ' + [r.boundingBox.x, r.boundingBox.y, r.boundingBox.width, r.boundingBox.height].join(' ');
        for (i = 0; i < r.occup; i += 1) {
            son = treeJSON(lev + 1, r.rarray[i]);
            if (son !== null) {
                tree['son' + i] = son;
            }
        }
        return tree;
    }

    function treeString() {
        return JSON.stringify(treeJSON(), null, '  ');
    }

    function getPartitions(lev, r) {
        if (typeof lev === 'undefined') {
            lev = 0;
        }
        if (typeof r === 'undefined') {
            r = root;
        }

        if (r === null || r instanceof RTreeLeaf) {
            return [];
        }

        var i,
            partitions = [{
                type: 'rectangle',
                x: r.boundingBox.x,
                y: r.boundingBox.y,
                w: r.boundingBox.width,
                h: r.boundingBox.height,
                level: lev
            }];

        for (i = 0; i < r.occup; i += 1) {
            Array.prototype.push.apply(partitions, getPartitions(lev + 1, r.rarray[i]));
        }
        //        console.log('level:',lev, 'len:', partitions.length);
        return partitions;

    }

    function getDepth(r){
        if (typeof r === 'undefined'){
            return getDepth(root);
        }
        
        if(r === null){
            return 0;
        }
        
        return getDepth(r.rarray[0]) +1;
    }
    return {
        RTree: RTree,
        Insert: localInsert,
        Delete: deleteDirect,
        getName: getName,
        orderDependent: orderDependent,
        getRoot: getRoot,
        treeJSON: treeJSON,
        treeString: treeString,
        getPartitions: getPartitions,
        getDepth: getDepth
    }
});
