/*global define*/
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
        this.color = '#666';
    }

    var pro = SvgLn.prototype;
    pro.setClass = function (cname) {
        this.cname = cname;
    };
    pro.setColor = function (color) {
        this.color = color;
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
                'class': this.cname
            })
            .style({
                cursor: 'pointer'
            });
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
    
    return SvgLn;
});
