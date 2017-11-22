/*global require*/
require.config({
    baseUrl: './vendors',
    paths: {
        jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min', './jquery-3.2.1'],
        underscore: 'underscore',
        d3: ['https://d3js.org/d3.v3.min', './d3.v3.min'],
        app: '../app'
    }
});
