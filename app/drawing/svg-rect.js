/*global define, Math*/
define(function () {
    'use strict';

    function SvgRect(svg, id, x, y, width, height) {
        this.svg = svg;
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    var pro = SvgRect.prototype;

    pro.toString = function () {
        return 'Rectangle top-left (' + this.x + ', ' + this.y + ') width ' + this.width + ' height ' + this.height;
    };
    pro.setClass = function (cname) {
        this.cname = cname;
    };


    pro.del = function () {
        this.svg.select('#' + this.id).remove();
    };

    pro.draw = function () {
        this.svg.append("rect")
            .attr({
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                id: this.id,
                'class': this.cname
            })
            .style({
                cursor: 'pointer'
            });
    };
    return SvgRect;
});
