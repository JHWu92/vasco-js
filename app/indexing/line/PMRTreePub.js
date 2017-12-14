/*global define, require*/

define(function (require) {
    'use strict';
    var PMRTree = require('./PMRTree'),
        GenericBucketPub = require('./GenericBucketPub'),
        pub = new GenericBucketPub(PMRTree);

    function orderDependent() {
        return 'order independent';
    }

    function getName() {
        return 'PMR Quadtree';
    }

    function insert(pt1, pt2) {
        return pub.insert(pt1, pt2);
    }

    function del(pt1, pt2) {
        return pub.del(pt1, pt2);
    }
    return {
        init: pub.init,
        toString: pub.toString,
        getName: getName,
        orderDependent: orderDependent,
        options: pub.options,
        insert: insert,
        del: del,
        getPartitions: pub.getPartitions,
        rebuild: pub.rebuild
    };
});
