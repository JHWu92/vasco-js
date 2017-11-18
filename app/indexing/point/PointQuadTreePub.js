/*global define, require*/

define(function (require) {
    'use strict';

    var PQTree = require('./PointQuadTree'),
        tree = null;

    function insert(pt) {
        if (tree === null) {
            tree = new PQTree(pt);
            return true;
        }
        return tree.insert(pt);
    }

    function del(pt) {
        var notEmpty = tree.deleteByPt(pt);
        // !notempty means the last point is deleted
        if (!notEmpty) {
            tree = null;
        }
    }

    function rebuild(svgPts, autopid) {
        tree = null;
        var i;
        for (i = 0; i < autopid; i = i + 1) {
            if (svgPts.hasOwnProperty('pid_' + i)) insert(svgPts['pid_' + i].pt);
        }
    }

    function getPartitions(minX, minY, maxX, maxY) {}

    function toString() {
        if (tree === null) return '';
        return tree.treeString();
    }

    function getName() {
        return 'Point QuadTree';
    }
    
    return {
        insert: insert,
        del: del,
        rebuild: rebuild,
        getPartitions: getPartitions,
        toString: toString,
        getName: getName   
    }
    
});
