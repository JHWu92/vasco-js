/*global define, require*/

define(function (require) {
    'use strict';

    var cons = require('./constant'),
        KDTree = require('./KDTree'),
        tree = null;

    function insert(pt) {
        if (tree === null) {
            tree = new KDTree(pt);
            return true;
        }
        tree.insert(pt);
    }
    
    function rebuild(svgPts, autopid){
        tree = null;
        for(var i = 0; i<autopid; i++){
            if(svgPts.hasOwnProperty('pid_'+i))
                insert(svgPts['pid_'+i].pt);
        }
    }

    function toString() {
        if (tree === null) return '';
        return tree.treeString();
    }
    
    function getPartitions(minX, minY, maxX, maxY){
        if (tree !== null){
            return tree.getPartitions(minX, minY, maxX, maxY);
        }
        return null;
    }

    return {
        insert: insert,
        toString: toString,
        rebuild: rebuild,
        getPartitions: getPartitions
    };


});
