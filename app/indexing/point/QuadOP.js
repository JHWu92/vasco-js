/*global define*/
define(['./constant'], function (cons) {

    function OpQuad(Q) {
        switch (Q) {
            case cons.NW:
                return cons.SE;
            case cons.NE:
                return cons.SW;
            case cons.SW:
                return cons.NE;
            case cons.SE:
                return cons.NW;
        }
        return -1;
    }

    function CQuad(Q) {
        switch (Q) {
            case cons.NW:
                return cons.NE;
            case cons.NE:
                return cons.SE;
            case cons.SE:
                return cons.SW;
            case cons.SW:
                return cons.NW;
        }
        return -1;
    }

    function CCQuad(Q) {
        switch (Q) {
            case cons.NW:
                return cons.SW;
            case cons.NE:
                return cons.NW;
            case cons.SE:
                return cons.NE;
            case cons.SW:
                return cons.SE;
        }
        return -1;
    }

    return {
        OpQuad: OpQuad,
        CQuad: CQuad,
        CCQuad: CCQuad
    }
});
