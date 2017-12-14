/*global define, require*/

define(function (require) {
    'use strict';
    var PM1Tree = require('./PM1Tree'),
        QLine = require('./QLine'),
        QEdgeList = require('./QEdgeList'),
//        QNode = require('./QNode'),
        op = require('./opHelper'),
//        cons = require('./constant'),
        gCons = require('app/constant'),
        $ = require('jquery'),
        tree = null,
        maxDecomp;


    function init() {
        tree = op.initRoot(gCons.svgWidth);
        maxDecomp = parseInt($('#maxDecomp').val());
    }

    function toString() {
        return tree.treeString();
    }

    function orderDependent() {
        return 'order independent';
    }

    function getName() {
        return 'PM1 Quadtree';
    }

    function options() {
        return '<label>max decomposition level</label>: <input id="maxDecomp" value=5 ><br>' +
            '<button id="update">update</button>';
    }

    function insert(pt1, pt2) {
        var nList = new QEdgeList(new QLine(pt1, pt2)),
            ok = PM1Tree.insert(nList, tree, maxDecomp);

        // console.log('==============================inserted:', pt1.toString(), pt2.toString(), ok);
        if (!ok) {
            // console.log('******************************need to delete');
            PM1Tree.delete(nList, tree);
        }
        return ok;

    }

    function del(pt1, pt2) {
        var nList = new QEdgeList(new QLine(pt1, pt2));
        PM1Tree.delete(nList, tree);
        return true;
    }

    function getPartitions() {
        return op.getPartitions(tree);
    }

    function rebuild(svgLns, autolid) {
        var cachedTree = tree,
            canRebuild = true,
            insertRes,
            i;
        init();
        for (i = 0; i < autolid; i = i + 1) {
            if (svgLns.hasOwnProperty('lid_' + i)) {
                insertRes = insert(
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
