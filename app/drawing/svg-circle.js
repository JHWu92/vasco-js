define(function () {
    'use strict';


    function SvgCircle(svg, id, pt, r) {
        this.svg = svg;  // d3 object
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
        var c = this.svg.append("circle")
            .attr({
                transform: 'translate' + this.pt.getXYStr(),
                r: this.r,
                id: this.id,
                fill: this.color,
                'class': this.cname
            })
            .style({
                cursor: 'pointer'
            });

        //        console.log(c);
    };

    pro.moveTo = function (x, y) {
        this.svg.select('#' + this.id).attr('transform', 'translate(' + x + ',' + y + ')');
    };

    pro.del = function () {
        this.svg.select('#' + this.id).remove();
    };

    return SvgCircle;
});
