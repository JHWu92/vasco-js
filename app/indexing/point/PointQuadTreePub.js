/*global define, require*/

define(function (require) {
    'use strict';

    var PQTree = require('./PointQuadTree'),
        tree = null;

    function init() {}

    function options() {}

    function toString() {
        if (tree === null) {
            return '';
        }
        return tree.treeString();
    }

    function orderDependent() {
        return 'order dependent';
    }

    function getName() {
        return 'Point QuadTree';
    }

    function insert(pt) {
        if (tree === null) {
            tree = new PQTree(pt);
            return true;
        }
        return tree.insert(pt);
    }

    function del(pt) {
        var res = tree.deleteByPt(pt);
        // res.empty===true means the last point is deleted
        if (res.empty) {
            tree = null;
        }
        return res.deleted;

    }

    function getPartitions(minX, minY, maxX, maxY) {
        if (tree !== null) {
            return tree.getPartitions(minX, minY, maxX, maxY);
        }
        return null;
    }

    // TODO better rebuild logic
    function rebuild(svgPts, autopid) {
        tree = null;
        var i;
        for (i = 0; i < autopid; i = i + 1) {
            if (svgPts.hasOwnProperty('pid_' + i)) {
                insert(svgPts['pid_' + i].pt);
            }
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
