/*global define*/

define(function (require) {
    'use strict';

    var PRkdBucket = require('./PRkdBucket'),
        cons = require('./constant'),
        gCons = require('app/constant'),
        $ = require('jquery'),
        tree = null,
        maxDecomp,
        maxBucketSize;

    function init() {
        tree = null;
        maxBucketSize = parseInt($('#maxBucketSize').val());
        maxDecomp = parseInt($('#maxDecomp').val());
    }

    function toString() {
        if (tree === null) {
            return '';
        }
        return tree.treeString();
    }

    function getName() {
        return 'Bucket PR k-d Tree';
    }

    function orderDependent() {
        return 'order independent'
    }

    function options() {
        return '<p><strong>Indexing parameters:</strong></p>' + '<label>max decomposition level</label>: <input id="maxDecomp" class="small-input" value=5 ><br>' +
            '<label>max bucket size</label>: <input id="maxBucketSize" class="small-input" value=3 ><br>' +
            '<button id="update">update</button>';
    }

    function del(pt) {
        var res = tree.deleteByPt(pt, true, gCons.svgWidth, gCons.svgHeight);
        // console.log('delete', pt.toString(), 'res=', res);
        if (res.empty) {
            tree = null;
        }
        return res.deleted;
    }

    function insert(pt) {
        if (tree === null) {
            tree = new PRkdBucket(cons.white, gCons.svgWidth / 2, gCons.svgHeight / 2, maxBucketSize);
        }
        var ok = tree.insert(pt, true, gCons.svgWidth, gCons.svgHeight, maxDecomp);
        // console.log(tree.toString(), ok);
        // console.log('insert res', ok[0]);
        if (ok === false) {
            del(pt);
        }
        return ok;
    }

    function getPartitions(minX, minY, maxX, maxY) {
        var width = maxX - minX,
            height = maxY - minY;

        if (tree !== null) {
            return tree.getPartitions(true, minX, minY, width, height);
        }
        return null;
    }

    function rebuild(svgPts, autopid) {
        var cachedTree = tree,
            canRebuild = true,
            insertRes,
            i;
        tree = null;
        for (i = 0; i < autopid; i = i + 1) {
            if (svgPts.hasOwnProperty('pid_' + i)) {
                insertRes = insert(svgPts['pid_' + i].pt);
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
    }

    return {
        init: init,
        toString: toString,
        getName: getName,
        orderDependent: orderDependent,
        options: options,
        insert: insert,
        del: del,
        getPartitions: getPartitions,
        rebuild: rebuild
    };

});
