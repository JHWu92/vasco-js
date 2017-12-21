/*global define, console, event*/

define(function (require) {
    'use strict';
    // vendor scripts
    var $ = require('jquery'),
        d3 = require('d3'),

        // app scripts
        utils = require('app/utils'),
        constant = require('app/constant'),

        // data structure
        Point = require('app/shape/Point'),
        SvgLn = require('app/drawing/svg-ln'),
        SvgRect = require('app/drawing/svg-rect'),

        // drawing state
        state = {
            m: [0, 0],
            mPrev: [0, 0],
            autolid: 0,
            onId: '',
            downOnClass: '',
            etype: 0,
            rebuildOnMove: false,
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
        layerLines = svg.append('g'),

        // Tree structure
        Trees = {
            PM1Tree: require('app/indexing/line/PM1TreePub'),
            PM2Tree: require('app/indexing/line/PM2TreePub'),
            PM3Tree: require('app/indexing/line/PM3TreePub'),
            PMRTree: require('app/indexing/line/PMRTreePub'),
            PMBucketTree: require('app/indexing/line/PMBucketTreePub'),
            RTree: require('app/indexing/line/LineRTreePub')
        },
        treeType = utils.getParameterByName('type'),
        Tree;

    for (var type in Trees) {

        $('#supType').append('<li><a href="?type=' + type + '">' + Trees[type].getName() + '</a></li>');
    }
    // init chosen Tree structure
    treeType = (typeof treeType === 'undefined' || !Trees.hasOwnProperty(treeType)) ? 'PM1Tree' : treeType;
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
            mPrev: [0, 0],
            autolid: 0,
            onId: '',
            downOnClass: '',
            etype: 0,
            rebuildOnMove: false,
            lns: {}
        };
        layerPartition.selectAll('*').remove();
        layerLines.selectAll('*').remove();
        $('#tree').text('');
        $('#status').text('reinit');
    }

    function drawPartition() {
        // clear existing partition lines
        layerPartition.selectAll('*').remove();

        // redraw all partitions
        var rect, partitions, svgPart, i;
        // get current partitions
        partitions = Tree.getPartitions();
        if (partitions === null) {
            return;
        }
        // draw partitions
        for (i = 0; i < partitions.length; i++) {
            rect = partitions[i];
//            console.log(rect);
            svgPart = new SvgRect(layerPartition, 'partition_' + i, rect.x, rect.y, rect.w, rect.h);
            svgPart.setClass('partition level'+rect.level);
            svgPart.draw();
        }
    }

    function getNearestPoint(x, y) {
        var nearPtExistLn, existLn, i;
        for (i in state.lns) {
            if (i === state.onId) {
                continue;
            }
            existLn = state.lns[i];
            nearPtExistLn = existLn.nearEndPt(x, y);

            if (nearPtExistLn !== 0) {
                // console.log('need to snap to ' + existLn.toString(), 'nearPtExistLn:', nearPtExistLn);
                $('#status').text('snap to ' + existLn.pts[nearPtExistLn].toString());
                return existLn.pts[nearPtExistLn];
            }
        }
        return null;
    }

    function snapNewLine() {
        var nearPtExistLn, existLn, i,
            ln = state.lns[state.onId],
            nearPtCurLn = ln.nearEndPt(state.m[0], state.m[1]);
        // console.log('curLn', ln.toString(), 'curPt', nearPtCurLn);
        for (i in state.lns) {
            if (i === state.onId) {
                continue;
            }
            existLn = state.lns[i];
            nearPtExistLn = existLn.nearEndPt(state.m[0], state.m[1]);

            if (nearPtExistLn !== 0) {
                // console.log('need to snap to ' + existLn.toString(), 'nearPtExistLn:', nearPtExistLn);
                if (nearPtCurLn === 1) {
                    ln.pt1 = existLn.pts[nearPtExistLn]; // share the same Point object
                    ln.movePt1(existLn.pts[nearPtExistLn].x, existLn.pts[nearPtExistLn].y); // update svgLn

                }
                if (nearPtCurLn === 2) {
                    ln.pt2 = existLn.pts[nearPtExistLn]; // share the same Point object
                    ln.movePt2(existLn.pts[nearPtExistLn].x, existLn.pts[nearPtExistLn].y); // update svgLn
                }
                $('#status').text('snap to ' + existLn.pts[nearPtExistLn].toString());
                break;
            }
        }
    }


    //------------------------------------------------
    // Event handlers
    //------------------------------------------------

    function updateEventState(event) {
        // set current state of mouse event
        state.onId = event.target.id;
        state.downOnClass = event.target.className.baseVal;
        state.etype = event.which;
        state.mPrev = [state.m[0], state.m[1]];
        //        console.log('mousedown', state.m, state.etype, ' target ', state.onId, state.downOnClass);
    }

    function clearEventState() {

        // reset state
        state.onId = '';
        state.downOnClass = '';
        state.etype = 0;
        state.rebuildOnMove = false;
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
        var res,
            ln = state.lns[state.onId],
            oldx1 = ln.pt1.x,
            oldy1 = ln.pt1.y,
            oldx2 = ln.pt2.x,
            oldy2 = ln.pt2.y;

        ln.moveLnOnDrag(state.mPrev[0], state.mPrev[1], state.m[0], state.m[1], state.nearPt);
        $('#status').text('Drag to adjust ' + ln.toString());

        // update SVG lines
        state.mPrev = [state.m[0], state.m[1]];
        for (var i in state.lns) {
            if (i === state.onId) {
                continue;
            }
            var existLn = state.lns[i];
            existLn.update();
        }

        if (state.rebuildOnMove) {

            res = Tree.rebuild(state.lns, state.autolid);
            if (!res.succeed) {
                state.lns[state.onId].moveLn(oldx1, oldy1, oldx2, oldy2);
                $('#status').text("Can't move to this place, because " + res.msg);
            }
            $('#tree').text(Tree.toString());
            drawPartition();
        }

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
        switch (state.downOnClass) {
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

                state.nearPt = state.lns[state.onId].nearEndPt(state.mPrev[0], state.mPrev[1]);
                state.rebuildOnMove = true;
                svg.on({
                    mousemove: mousemoveOnLn
                });
                break;
            case 3: // right click
                var temp = state.lns[state.onId];
                if (Tree.del(temp.pt1, temp.pt2)) {
                    temp.del();
                    delete state.lns[state.onId];
                    $('#tree').text(Tree.toString());
                    drawPartition();

                }
                break;
        }
    }

    function mousedownOnChart() {
        switch (state.etype) {
            case 1: //left click
                // console.log('left click on chart');
                var x = state.m[0],
                    y = state.m[1],
                    nearestPoint = getNearestPoint(x, y),
                    pt1 = (nearestPoint === null) ? new Point(x, y) : nearestPoint,
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
                state.autolid += 1;
                state.rebuildOnMove = false;
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

        switch (state.downOnClass) {
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
                snapNewLine();

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
                } else {
                    snapNewLine();
                    if (Tree.insert(ln.pt1, ln.pt2)) {
                        $('#tree').text(Tree.toString());
                        drawPartition();
                    } else {
                        ln.del();
                        $('#status').text('cannont insert here');
                    }
                }
                svg.on({
                    mousemove: mousemove
                });

        }
    }

});
