/*global define*/

define(function () {
    'use strict';
    function extend(Child, Parent) {
        var F = function () {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.uber = Parent.prototype;
    }

    return {
        extend: extend
    };
});
