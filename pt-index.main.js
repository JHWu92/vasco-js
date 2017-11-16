/*global define, console, event*/
/*jslint nomen: true*/

define(function (require) {
    'use strict';

    var $ = require('jquery'),
        d3 = require('d3'),
        //        _ = require('underscore'),

        constant = require('app/constant.js'),

        Point = require('app/shape/Point'),

        SvgCircle = require('app/drawing/svg-circle'),
        SvgLn = require('app/drawing/svg-ln'),

        KDTree = require('app/indexing/point/KDTreeSvg'),

        state = {
            m: [0, 0],
            autopid: 0,
            onId: '',
            onClass: '',
            etype: 0,
            pts: {}
        },

        svg = d3.select('#indexing')
        .attr({
            width: constant.svgWidth,
            height: constant.svgHeight
        })
        .on({
            mousemove: mousemove,
            mousedown: mousedown,
            mouseup: mouseup,
            contextmenu: function () {
                d3.event.preventDefault();
            }
        });

    function mousemove() {
        var m = d3.mouse(this);
        m = [parseInt(m[0]), parseInt(m[1])];
        $('#x').text(m[0]);
        $('#y').text(m[1]);
        state.m = m;

    }

    function mousemoveOnPoint() {
        mousemove.apply(this);
        var x = state.m[0],
            y = state.m[1];
        state.pts[state.onId].moveTo(x, y);

        KDTree.rebuild(state.pts, state.autopid);
        $('#tree').text(KDTree.toString());
        drawPartition();
    }

    function mousedown() {

        // ignore second down event while other mouse key is pressed.
        if (state.etype != 0) {
            return;
        }

        // set current state of mouse event
        state.onId = event.target.id;
        state.onClass = event.target.className.baseVal;
        state.etype = event.which;
        //        console.log('mousedown', state.m, state.etype, ' target ', state.onId, state.onClass);

        // switch function based on Element
        switch (state.onClass) {
            case 'point':
                mousedownOnPoint();
                break;
            default:
                // nothing change if down on anything else
                break;
        }
    }

    function mousedownOnPoint() {
        switch (state.etype) {
            case 1: //left click
                // change mousemove callback to drag the point
                svg.on({
                    mousemove: mousemoveOnPoint
                });
                break;
            case 3: //right click
                var temp =state.pts[state.onId];
                KDTree.del(temp.pt);
                temp.del();
                delete state.pts[state.onId];
                $('#tree').text(KDTree.toString());
                drawPartition();

        }
    }


    function mouseup() {
        // ignore if etype doesn't match, i.e. up on right key while pressing left key 
        var etype = event.which;
        if (state.etype != etype) {
            return;
        }
        //        console.log('mouseup', state.m, state.etype, ' target ', state.onId, state.onClass);

        switch (state.onClass) {
            case 'point':
                mouseupOnPoint();
                break;
            default:
                mouseupOnChart();
                break;
        }

        // reset state
        state.onId = '';
        state.onClass = '';
        state.etype = 0;
    }

    function mouseupOnPoint() {
        switch (state.etype) {
            case 1: //left click
                // reset mouse move
                svg.on({
                    mousemove: mousemove
                });
                break;
        }
    }

    function mouseupOnChart() {
        
        switch (state.etype) {
            case 1: //left click
                // get current mouse position
                var x = state.m[0],
                    y = state.m[1];

                // set current pid and new pid count 
                var pid = 'pid_' + state.autopid;
                state.autopid += 1;

                // draw a circle on #chart
                var pt = new Point(x, y),
                    sCir = new SvgCircle(svg, pid,
                        pt, constant.pRadius);
                sCir.setClass('point');
                sCir.draw();

                // add point data to state
                state.pts[pid] = sCir;

                // add point to KDTree
                KDTree.insert(pt);
                // print tree
                $('#tree').text(KDTree.toString());

                drawPartition();
                break;
        }

    }

    function drawPartition() {
        // clear existing partition lines
        svg.selectAll('.partition').remove();

        // redraw all partitions
        var temp, partitions, svgPart;
        // get current partitions
        partitions = KDTree.getPartitions(0, 0, constant.svgWidth, constant.svgHeight);
        if (partitions===null){
            return;
        }
        // draw partitions
        for (var i = 0; i < partitions.length; i++) {
            temp = partitions[i];
            svgPart = new SvgLn(svg, 'partition_' + i,
                new Point(temp[0], temp[1]),
                new Point(temp[2], temp[3]));
            svgPart.setClass('partition');
            svgPart.draw();
        }
    }

});
