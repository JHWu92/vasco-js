/*global define*/

define(function () {
    'use strict';

    var constant = {
        left: 0,
        right: 1,
        xAttr: 'X',
        yAttr: 'Y',

        black: 0,
        white: 1,
        gray: 2,
        colorName: ['black', 'white', 'gray'],
        
        NW: 0,
        NE: 1,
        SW: 2,
        SE: 3,
        QuadName: ['NW', 'NE', 'SW', 'SE'],
        
        // The distance factor of width/height 
        // between the center of current block
        // and its sub-block of each quadrant.
        // Used in regular decomposition.
        XF: [-0.25, 0.25, -0.25, 0.25],
        // different from VASCO, N/S upside down <-- not anymore
        YF: [0.25, 0.25, -0.25, -0.25]
    };
    return constant;
});
