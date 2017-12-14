/*global define, require*/

define(function (require) {
    'use strict';
    var PM2Tree = require('./PM2Tree'),
        PMGenericPub = require('./PMGenericPub'),
        pub = new PMGenericPub(PM2Tree);

    function orderDependent() {
        return 'order independent';
    }

    function getName() {
        return 'PM2 Quadtree';
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
