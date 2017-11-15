/*global define*/

define(['./constant', './KDNode'], function (cons, KDNode) {

    'use strict';
    /* KDCompare in java applet*/
    function leftOrRight(base, newNode) {
        if (base.DISC === cons.xAttr) {
            return (newNode.pt.x < base.pt.x) ? cons.left : cons.right;
        } else {
            return (newNode.pt.y < base.pt.y) ? cons.left : cons.right;
        }
    }

    function addKDNode(root, newNode) {
        var father = null,
            curNode = null,
            position = -1;
        if (root === null) {
            // first node for KD tree
            root = newNode;
            newNode.DISC = cons.xAttr;
        } else {
            // iterate KD tree to find a spot for newNode
            curNode = root;

            // curNode == null means empty empty spot for newNode; 
            // newNode equals curNode means duplicate, don't add new node
            while (curNode !== null && !newNode.pt.equals(curNode.pt)) {
                father = curNode;
                position = leftOrRight(curNode, newNode);
                curNode = curNode.son[position];
            }
            if (curNode === null) {
                father.son[position] = newNode;
                newNode.DISC = father.nextDisc();
            }
        }
        return root;
    }
/*
    
    */
    
    return {
        addKDNode: addKDNode,
    };
});
