/*global define, console, event*/
/*jslint nomen: true*/

define(function (require) {
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

        // data state
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
        layerPoint = svg.append('g'),

        // Tree structure
        Trees = {
            PointQuadTree: require('app/indexing/point/PointQuadTreePub'),
            KDTree: require('app/indexing/point/KDTreePub'),
            PR: require('app/indexing/point/PRPub'),
            PRbucket: require('app/indexing/point/PRbucketPub'),
            PRkd: require('app/indexing/point/PRkdPub'),
            PRkdBucket: require('app/indexing/point/PRkdBucketPub'),
            PMR: require('app/indexing/point/PMRPub'),
            PMRkd: require('app/indexing/point/PMRkdPub')
        },
        treeType = utils.getParameterByName('type'),
        Tree;

    // output supported tree type
    for (var type in Trees) {
        
        $('#supType').append('<li><a href="?type=' + type + '">' + Trees[type].getName() + '</a></li>');
    }

    // init chosen Tree structure
    treeType = (typeof treeType === 'undefined' || !Trees.hasOwnProperty(treeType)) ? 'PointQuadTree' : treeType;
    Tree = Trees[treeType];
    $('#treeType').text(Tree.getName() + ', ' + Tree.orderDependent());
    $('#options').append(Tree.options());
    $('#update').on('click', updateParam);
    Tree.init();

    // helper function
    function updateParam() {
        $('#status').text('update parameters');
        Tree.init();

        // current drawing state
        state = {
            m: [0, 0],
            autopid: 0,
            onId: '',
            onClass: '',
            etype: 0,
            pts: {}
        };
        layerPartition.selectAll('*').remove();
        layerPoint.selectAll('*').remove();
    }

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
            y = state.m[1],
            res,
            oldPt = new Point(state.pts[state.onId].pt.x, state.pts[state.onId].pt.y);

        $('#status').text('');
        state.pts[state.onId].moveTo(x, y);

        res = Tree.rebuild(state.pts, state.autopid);
        if (!res.succeed) {
            state.pts[state.onId].moveTo(oldPt.x, oldPt.y);
            $('#status').text("Can't move to this place, because " + res.msg);
        }
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
                    $('#status').text('delete failed');
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
                var pt = new Point(x, y);
                // add point to Tree
                if (Tree.insert(pt)) {

                    // draw a circle on #chart
                    var pid = 'pid_' + state.autopid,
                        sCir = new SvgCircle(layerPoint, pid,
                            pt, constant.pRadius);
                    sCir.setClass('point');
                    sCir.draw();

                    // add point data to state
                    state.pts[pid] = sCir;
                    // update pid for next point
                    state.autopid += 1;

                    // print tree
                    $('#tree').text(Tree.toString());
                    drawPartition();
                    $('#status').text('insert successfully');
                } else {
                    $('#status').text('cannot insert here');
                }

                break;
        }

    }

});
