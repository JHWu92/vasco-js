/*global define, console, event*/
/*jslint nomen: true*/

define(function (require, exports, module) {
    'use strict';
    // vendor scripts
    var $ = require('jquery'),
        d3 = require('d3'),
        //        _ = require('underscore'),

        // app scripts
        utils = require('app/utils'),
        constant = require('app/constant.js'),

        // data structure
        Point = require('app/shape/Point'),
        SvgCircle = require('app/drawing/svg-circle'),
        SvgLn = require('app/drawing/svg-ln'),
        Trees = {
            PointQuadTree: require('app/indexing/point/PointQuadTreePub'),
            KDTree: require('app/indexing/point/KDTreePub')
        },

        treeType = utils.getParameterByName('type'),
        Tree,
        // current drawing state
        state = {
            m: [0, 0],
            autopid: 0,
            onId: '',
            onClass: '',
            etype: 0,
            pts: {}
        },

        // chart
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
        }),
        layerPartition = svg.append('g'),
        layerPoint = svg.append('g');

    // output supported tree type
    for (var type in Trees) {
        $('#supType').append('<a href="?type=' + type + '">' + type + '</a>, ');
    }
    // set up tree type
    treeType = (typeof treeType === 'undefined' || !Trees.hasOwnProperty(treeType)) ? 'PointQuadTree' : treeType;
    Tree = Trees[treeType];
    $('#treeType').text(treeType);

    function drawPartition() {
        // clear existing partition lines
        layerPartition.selectAll('*').remove();

        // redraw all partitions
        var temp, partitions, svgPart;
        // get current partitions
        partitions = Tree.getPartitions(0, 0, constant.svgWidth, constant.svgHeight);
        if (partitions === null) {
            return;
        }
        // draw partitions
        for (var i = 0; i < partitions.length; i++) {
            temp = partitions[i];
            svgPart = new SvgLn(layerPartition, 'partition_' + i,
                new Point(temp[0], temp[1]),
                new Point(temp[2], temp[3]));
            svgPart.setClass('partition');
            svgPart.draw();
        }
    }


    //------------------------------------------------
    // Event handlers
    //------------------------------------------------

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

        Tree.rebuild(state.pts, state.autopid);
        $('#tree').text(Tree.toString());
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
                var temp = state.pts[state.onId];
                //                console.log('del pt ', temp.pt.toString());
                if (Tree.del(temp.pt)) {

                    temp.del();
                    delete state.pts[state.onId];
                    $('#tree').text(Tree.toString());
                    drawPartition();
                } else {
                    console.log('deleted===false');
                }

        }
    }


    function mouseup() {
        // ignore if etype doesn't match, i.e. up on right key while pressing left key 
        var etype = event.which;
        if (state.etype !== etype) {
            return;
        }
        //        console.log('mouseup', state.m, state.etype, ' target ', state.onId, state.onClass);

        switch (state.onClass) {
            case 'point':
                mouseupOnPoint();
                break;
            case 'chart':
                mouseupOnChart();
                break;
            default:
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
                    sCir = new SvgCircle(layerPoint, pid,
                        pt, constant.pRadius);
                sCir.setClass('point');
                sCir.draw();

                // add point data to state
                state.pts[pid] = sCir;

                // add point to Tree
                Tree.insert(pt);
                // print tree
                $('#tree').text(Tree.toString());

                drawPartition();
                break;
        }

    }

});
