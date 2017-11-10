/*global define*/

define(['./constant', './KDNode'], function (cons, KDNode) {

    function KDCompare(p, q) {
        if (q.DISC == cons.xAttr) {
            return (p.pnt.x < q.pnt.x) ? cons.left : cons.right;
        }else{
            return (p.pnt.y < q.pnt.y) ? cons.left : cons.right;
        }
    }
    
    var root = null;
    function addKDNode(root, p){
        
    }
});
