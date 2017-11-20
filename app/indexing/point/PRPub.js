/*global define*/

define(function (require) {
    'use strict';

    var PRbucket = require('./PRbucket'),
        cons = require('./constant'),
        gCons = require('app/constant'),
        $ = require('jquery'),
        tree = null,
        maxDecomp,
        maxBucketSize = 1;

    function init() {
        tree = null;
        maxDecomp = $('#maxDecomp').val();
    }

    function toString() {
        if (tree === null) {
            return '';
        }
        return tree.treeString();
    }

    function orderDependent() {
        return 'order independent';
    }

    function getName() {
        return 'PR Quadtree';
    }

    function options() {
        return '<label>max decomposition level</label>: <input id="maxDecomp" value=5 ><br>' +
            '<button id="update">update</button>';
    }

    function del(pt) {
        var res = tree.deleteByPt(pt, 600, 400);
        // console.log('delete', pt.toString(), 'res=', res);
        if (res.empty) {
            tree = null;
        }
        return res.deleted;
    }

    function insert(pt) {
        if (tree === null) {
            tree = new PRbucket(cons.black, gCons.svgWidth / 2, gCons.svgHeight / 2, maxBucketSize);
        }
        var ok = [true];
        tree.insert(pt, gCons.svgWidth, gCons.svgHeight, maxDecomp, ok);
        // console.log('insert res', ok[0]);
        if (ok[0] === false) {
            del(pt);
        }
        return ok[0];
    }


    function getPartitions(minX, minY, maxX, maxY) {
        var width = maxX - minX,
            height = maxY - minY;

        if (tree !== null) {
            return tree.getPartitions(minX, minY, width, height);
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
