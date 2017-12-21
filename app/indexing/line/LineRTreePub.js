/*global define, console*/

define(function (require) {
    'use strict';

    var $ = require('jquery'),
        Line = require('app/shape/Line'),
        RTree = require('app/indexing/common/RTree'),
        total_level = 1;

    function init() {
        var minNodeLen = parseInt($('#minNodeLen').val()),
            maxNodeLen = parseInt($('#maxNodeLen').val()),
            splitMode = parseInt($('#splitMode').val());
        RTree.RTree(minNodeLen, maxNodeLen, splitMode);
    }

    function toString() {
        return RTree.treeString();
    }

    function options() {
        var i, structs = ['Linear'],
            str = '<p><strong>Indexing parameters:</strong></p>';
        str += '<label>- min node length</label>: <input class="small-input" id="minNodeLen" value=2><br>';
        str += '<label>- max node length</label>: <input class="small-input" id="maxNodeLen" value=4><br>';
        str += '- split mode: <select id="splitMode">';
        for (i = 0; i < structs.length; i += 1) {
            str += '<option value="' + structs[i] + '">' + structs[i] + '</option>';
        }
        str += '</select><br>';
        str += '<button id="update">update</button>' + '<br><br>';
        str += '<p><strong>Show rectangles on level:</strong></p>';
        str += '<div id="RtreeLevel"></div>';
        return str;
    }

    function updateLevelOptions() {
        var html = '',
            i;
        for (i = 0; i < total_level-1; i += 1) {
            html += '<input type="checkbox" id="level_"' + i + ' name="level_"' + i + ' value=' + i + ' checked /> ';
            html += '<label for="level_"' + i + '>level ' + i + ' </label> ';
            html += '<br>';
        }
        $('#RtreeLevel').html(html);

        $('#RtreeLevel :checkbox').change(function () {
            $('.level_' + $(this).val()).toggleClass('hide');
        });
    }

    function insert(pt1, pt2) {
        var line = new Line(pt1, pt2);
        RTree.Insert(line);
        total_level = RTree.getDepth();
        updateLevelOptions();
        return true;
    }

    function del(pt1, pt2) {
        var line = new Line(pt1, pt2);
        RTree.Delete(line);
        return true;
    }

    function getPartitions() {
        return RTree.getPartitions();
    }

    function rebuild(svgLns, autolid) {
        var i;
        init();
        for (i = 0; i < autolid; i = i + 1) {
            if (svgLns.hasOwnProperty('lid_' + i)) {
                insert(svgLns['lid_' + i].pt1, svgLns['lid_' + i].pt2);
            }
        }
        return {
            succeed: true
        };
    }

    return {
        init: init,
        toString: toString,
        getName: RTree.getName,
        orderDependent: RTree.orderDependent,
        options: options,
        insert: insert,
        del: del,
        getPartitions: getPartitions,
        rebuild: rebuild
    };

});
