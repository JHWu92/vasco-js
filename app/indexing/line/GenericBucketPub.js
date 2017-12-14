/*global define, require*/

define(function (require) {
    'use strict';

    function GenericBucketPub(treeStructure) {
        this.treeStructure = treeStructure;
    }

    var QLine = require('./QLine'),
        QEdgeList = require('./QEdgeList'),
        op = require('./opHelper'),
        gCons = require('app/constant'),
        $ = require('jquery'),
        tree = null,
        maxDecomp,
        maxBucketSize,
        pro = GenericBucketPub.prototype;


    pro.init = function () {
        tree = op.initRoot(gCons.svgWidth);
        maxDecomp = parseInt($('#maxDecomp').val());
        maxBucketSize = parseInt($('#maxBucketSize').val());
    };

    pro.toString = function () {
        return tree.treeString();
    };

    pro.options = function () {
        return '<label>max decomposition level</label>: <input id="maxDecomp" value=9 ><br>' +
            '<label>max bucket size</label>: <input id="maxBucketSize" value=3 ><br>' +
            '<button id="update">update</button>';
    };

    pro.insert = function (pt1, pt2) {
        var nList = new QEdgeList(new QLine(pt1, pt2)),
            ok = this.treeStructure.insert(nList, tree, maxDecomp, maxBucketSize);

        // console.log('==============================inserted:', pt1.toString(), pt2.toString(), ok);
        if (!ok) {
            // console.log('******************************need to delete');
            this.treeStructure.del(nList, tree, maxBucketSize);
        }
        return ok;

    };

    pro.del = function (pt1, pt2) {
        var nList = new QEdgeList(new QLine(pt1, pt2));
        this.treeStructure.del(nList, tree, maxBucketSize);
        return true;
    };

    pro.getPartitions = function () {
        return op.getPartitions(tree);
    };

    pro.rebuild = function (svgLns, autolid) {
        var cachedTree = tree,
            canRebuild = true,
            insertRes,
            i;
        this.init();
        for (i = 0; i < autolid; i = i + 1) {
            if (svgLns.hasOwnProperty('lid_' + i)) {
                insertRes = this.insert(
                    svgLns['lid_' + i].pt1,
                    svgLns['lid_' + i].pt2
                );
                if (!insertRes) {
                    canRebuild = false;
                    break;
                }
            }
        }
        if (!canRebuild) {
            tree = cachedTree;
            return {
                succeed: false,
                msg: 'this region cannot be decomposed further'
            };
        }
        return {
            succeed: true
        };
    };

    return GenericBucketPub;
});
