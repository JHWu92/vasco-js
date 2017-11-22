/*global requirejs, console*/
requirejs(['./common.config'], function (common) {
    
    'use strict';
    console.log('loadi ln-index.config');
    requirejs(['./ln-index.main.js']);  
});