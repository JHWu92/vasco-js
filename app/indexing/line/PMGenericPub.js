/*global define, require*/

define(function (require) {
    'use strict';

    function PMGenericPub(treeStructure) {
        this.treeStructure = treeStructure;
    }

    var QLine = require('./QLine'),
        QEdgeList = require('./QEdgeList'),
        op = require('./opHelper'),
        gCons = require('app/constant'),
        $ = require('jquery'),
        tree = null,
        maxDecomp,
        pro = PMGenericPub.prototype;


    pro.init = function () {
        tree = op.initRoot(gCons.svgWidth);
        maxDecomp = parseInt($('#maxDecomp').val());
    };

    pro.toString = function () {
        return tree.treeString();
    };

    pro.options = function () {
        return  '<p><strong>Indexing parameters:</strong></p>' + '<label>max decomposition level</label>: <input id="maxDecomp" value=9 ><br>' +
            '<button id="update">update</button>';
    };

    pro.insert = function (pt1, pt2) {
        var nList = new QEdgeList(new QLine(pt1, pt2)),
            ok = this.treeStructure.insert(nList, tree, maxDecomp);

        // console.log('==============================inserted:', pt1.toString(), pt2.toString(), ok);
        if (!ok) {
            // console.log('******************************need to delete');
            this.treeStructure.delete(nList, tree);
        }
        return ok;

    };

    pro.del = function (pt1, pt2) {
        var nList = new QEdgeList(new QLine(pt1, pt2));
        this.treeStructure.delete(nList, tree);
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

    return PMGenericPub;
});
