define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Point = require('app/shape/Point'),
        SvgCircle = require('app/drawing/svg-circle'),
        SvgLn = require('app/drawing/svg-ln');
    var svg = $('#indexing')
    .attr({
        width: 600,
        height: 400,
    });
    console.log(svg);
    var pt = new Point(1,10, 10);
    var svgcircle = new SvgCircle(svg, 1, pt, 10);
//    svgcircle.setClass('c')
    svgcircle.draw();
    svgcircle.moveTo(20,20);
        svgcircle.moveTo(20,50);
//    svgcircle.del();
});
