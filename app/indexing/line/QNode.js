/*global define*/

define(function (require) {
    'use strict';

    var cons = require('./constant');

    function QNode(qSquare, level) {
        this.SQUARE = qSquare;
        this.SON = [null, null, null, null];
        this.DICTIONARY = null;
        this.level = level;
        this.nodeType = cons.black;
    }

    QNode.prototype.toString = function () {
        return 'QNode [' +
            ((this.SQUARE === null) ? 'null' : this.SQUARE.toString()) +
            '], NodeType=' +
            this.nodeType +
            ' Dictionary:' +
            ((this.DICTIONARY === null) ? 'null' : this.DICTIONARY.toString());
    };
    QNode.prototype.toJson = function () {
        return {
            square: this.SQUARE.toString(),
            nodeType: cons.colorName[this.nodeType],
            dictionary: (this.DICTIONARY === null) ? 'null' : this.DICTIONARY.toString()
        };
    };
    QNode.prototype.treeJSON = function () {
        var i, tree = {
            QNode: this.toJson()
        };

        for (i = 0; i < 4; i += 1) {
            if (this.SON[i] !== null) {
                tree[cons.QuadName[i]] = this.SON[i].treeJSON();
            }
        }
        return tree;
    };

    QNode.prototype.treeString = function () {
        return JSON.stringify(this.treeJSON(), null, '  ');
    };
    return QNode;
});
