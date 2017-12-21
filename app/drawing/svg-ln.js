/*global define, Math*/
define(function () {
    'use strict';

    /** 
     * svg: d3 object, id: #id, pt1: start, p2: end
     */
    function SvgLn(svg, id, pt1, pt2) {
        this.svg = svg;
        this.id = id;
        this.pt1 = pt1;
        this.pt2 = pt2;
        this.pts = {
            1: this.pt1,
            2: this.pt2
        };
        this.color = '#666';
    }

    var pro = SvgLn.prototype,
        strokeWidth = 5; // keep it consistent with main.css.line
    
    pro.toString = function () {
        return 'Line from ' + this.pt1.toString() + ' to ' + this.pt2.toString();
    };

    pro.setClass = function (cname) {
        this.cname = cname;
    };

    pro.setColor = function (color) {
        this.color = color;
    };

    pro.del = function () {
        this.svg.select('#' + this.id).remove();
    };

    pro.draw = function () {
        this.svg.append("line")
            .attr({
                x1: this.pt1.getX(),
                y1: this.pt1.getY(),
                x2: this.pt2.getX(),
                y2: this.pt2.getY(),
                id: this.id,
                fill: this.color,
                'stroke-linecap': "round",
                'stroke-width': strokeWidth,
                'class': this.cname
            });
            /*.style({
                cursor: 'pointer'
            });*/
    };

    pro.legitLn = function () {
        return !this.pt1.equals(this.pt2);
    };
    pro.update = function () {
        this.svg.select('#' + this.id).attr({
            'x1': this.pt1.getX(),
            'y1': this.pt1.getY(),
            'x2': this.pt2.getX(),
            'y2': this.pt2.getY()
        });
    };

    pro.movePt1 = function (x, y) {
        this.pt1.update(x, y);
        this.update();
    };
    pro.movePt2 = function (x, y) {
        this.pt2.update(x, y);
        this.update();
    };
    pro.moveLn = function (x1, y1, x2, y2) {
        this.movePt1(x1, y1);
        this.movePt2(x2, y2);
        this.update();
    };

    /** Move a line on draggin. 
     * (smx, smy) is the start position of mouse,
     * (emx, emy) is the end position of mouse
     */
    pro.moveLnOnDrag = function (smx, smy, emx, emy, nearPt) {
        var dx = emx - smx,
            dy = emy - smy,
            x1 = this.pt1.getX(),
            y1 = this.pt1.getY(),
            x2 = this.pt2.getX(),
            y2 = this.pt2.getY();
        if (nearPt !== 2) {
            x1 += dx;
            y1 += dy;
        }
        if (nearPt !== 1) {
            x2 += dx;
            y2 += dy;
        }
        this.pt1.update(x1, y1);
        this.pt2.update(x2, y2);
        this.update();
    };

    /** mx, my: mouse coordinate */
    pro.nearEndPt = function (mx, my) {

        var x1 = this.pt1.getX(),
            y1 = this.pt1.getY(),
            x2 = this.pt2.getX(),
            y2 = this.pt2.getY(),
            //            xthre = Math.max(strokeWidth, Math.abs(x2 - x1) * 0.1),
            //            ythres = Math.max(strokeWidth, Math.abs(y2 - y1) * 0.1),
            dist1 = Math.abs(mx - x1) + Math.abs(my - y1),
            dist2 = Math.abs(mx - x2) + Math.abs(my - y2),
            nearerPt = (dist2 < dist1) ? 2 : 1,
            minDist = (dist2 < dist1) ? dist2 : dist1,
            distThres = Math.max(strokeWidth, Math.abs(x2 - x1) * 0.1 + Math.abs(y2 - y1) * 0.1);
        distThres = Math.min(distThres, strokeWidth * 3);

        if (minDist < distThres) {
            return nearerPt;
        } else {
            // not near endpoints
            return 0;
        }
    };


    return SvgLn;
});
