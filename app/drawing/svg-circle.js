define(['jquery'], function ($) {
    'use strict';
    function SvgCircle(svg, id, pt, r) {
        this.svg = svg;
        this.id = id;
        this.pt = pt;
        this.r = r;
        this.color = '#666';
    }

    var pro = SvgCircle.prototype;
    pro.setClass = function (cname) {
        this.cname = cname;
    };
    pro.setColor = function (color) {
        this.color = color;
    };
    pro.draw = function () {
        var c = $(document.createElementNS("http://www.w3.org/2000/svg", "circle"))
            .attr({
                transform: 'translate' + this.pt.getXYStr(),
                r: this.r,
                id: this.id,
                fill: this.color,
                'class': this.cname
            })
            .css({
                cursor: 'pointer'
            });

        console.log(c);
        this.svg.append(c);
    };

    pro.moveTo = function (x, y) {
        $('#' + this.id).attr('transform', 'translate(' + x + ',' + y + ')');
    };

    pro.del = function () {
        $('#' + this.id).remove();
    };

    return SvgCircle;
});
