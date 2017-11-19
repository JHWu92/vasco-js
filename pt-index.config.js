/*global requirejs, console*/
requirejs(['./common.config'], function (common) {
    
    'use strict';
    console.log('loading pt-index.config');
    requirejs(['./pt-index.main.js']);  // because this url starts with app, as defined in config.paths, the base url changes to ../app, (.. means parent of baseUrl)
});