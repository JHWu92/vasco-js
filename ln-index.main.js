/*global define, console, event*/

define(function (require) {
    'use strict';
    // vendor scripts
    var $ = require('jquery'),
        d3 = require('d3'),

        // app scripts
        //        utils = require('app/utils'),
        constant = require('app/constant.js'),

        // data structure
        Point = require('app/shape/Point'),
        //        Line = require('app/shape/Line'),
        SvgLn = require('app/drawing/svg-ln'),

        // drawing state
        state = {
            m: [0, 0],
            mPrev: [0, 0],
            autolid: 0,
            onId: '',
            onClass: '',
            etype: 0,
            lns: {}
        },

        // drawing svg
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
        layerLines = svg.append('g');




    function drawPartition() {
        // clear existing partition lines
        layerPartition.selectAll('*').remove();

        // redraw all partitions
        var temp, partitions, svgPart;
        // get current partitions
        //        partitions = Tree.getPartitions(0, 0, constant.svgWidth, constant.svgHeight);
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

    function updateEventState(event) {
        // set current state of mouse event
        state.onId = event.target.id;
        state.onClass = event.target.className.baseVal;
        state.etype = event.which;
        state.mPrev = [state.m[0], state.m[1]];
        //        console.log('mousedown', state.m, state.etype, ' target ', state.onId, state.onClass);
    }

    function clearEventState() {

        // reset state
        state.onId = '';
        state.onClass = '';
        state.etype = 0;
    }

    function mousemove() {
        var m = d3.mouse(this);
        m = [parseInt(m[0]), parseInt(m[1])];
        $('#x').text(m[0]);
        $('#y').text(m[1]);
        state.m = m;
    }

    function mousemoveOnLn() {
        mousemove.apply(this);
        var ln = state.lns[state.onId];

        // console.log('mmOnln', ln.toString(), state.onId, state.onClass, state.nearPt);

        ln.moveLnOnDrag(state.mPrev[0], state.mPrev[1], state.m[0], state.m[1], state.nearPt);
        $('#status').text('Drag to adjust ' + ln.toString());
        // update 
        state.mPrev = [state.m[0], state.m[1]];
    }

    function mousedown() {


        // ignore second down event while other mouse key is pressed.
        if (state.etype != 0) {
            // console.log('state etype != 0');
            return;
        }
        updateEventState(event);
        // console.log('mousedown', JSON.stringify(state));

        // switch function based on Element class 
        switch (state.onClass) {
            case 'line':
                mousedownOnLine();
                break;
            case 'chart':
                // console.log('mousedown on chart');
                mousedownOnChart();
                break;
            default:
                // nothing change if down on anything else
                break;
        }
    }

    function mousedownOnLine() {
        switch (state.etype) {
            case 1: // left click

                state.nearPt = state.lns[state.onId].nearEndPt(state.mPrev[0], state.mPrev[1])
                svg.on({
                    mousemove: mousemoveOnLn
                });
                break;
            case 3: // right click
                break;
        }
    }

    function mousedownOnChart() {
        switch (state.etype) {
            case 1: //left click
                // console.log('left click on chart');
                var x = state.m[0],
                    y = state.m[1],
                    pt1 = new Point(x, y),
                    pt2 = new Point(x, y),
                    lid = 'lid_' + state.autolid,
                    sLn = new SvgLn(layerLines, lid, pt1, pt2);

                sLn.setClass('line');
                sLn.draw();
                // console.log('mousedown on chart', sLn.toString());
                // update state
                state.onId = lid;
                state.lns[lid] = sLn;
                state.nearPt = 2;
                // change mousemove
                svg.on({
                    mousemove: mousemoveOnLn
                });
        }
    }

    function mouseup() {
        // ignore if etype doesn't match, i.e. up on right key while pressing left key 
        var etype = event.which;
        if (state.etype !== etype) {
            return;
        }

        switch (state.onClass) {
            case 'line':
                mouseupOnLine();
                break;
            case 'chart':
                mouseupOnChart();
                break;
            default:
                break;
        }

        clearEventState();
    }

    function mouseupOnLine() {
        switch (state.etype) {
            case 1: // left click
                svg.on({
                    mousemove: mousemove
                });
                break;
        }
    }

    function mouseupOnChart() {
        var ln = state.lns[state.onId];
        switch (state.etype) {
            case 1: //left click to insert new line
                if (!ln.legitLn()) {
                    ln.del();
                    $('#status').text('please left click and drag to insert a new line');
                }
                state.autolid += 1;
                $('#tree').text(state.lns);
                svg.on({
                    mousemove: mousemove
                });

        }
    }

});
