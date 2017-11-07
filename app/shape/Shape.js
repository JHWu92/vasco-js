define(function(){
    function Shape(id){
        this.id = id;
    }
    
    Shape.prototype = {
        constructor: Shape,
        
        getId: function(){return this.id;},
        
        name: 'Shape',
        
        toString: function(){return this.name+' '+this.id;},
        
    };
    
    return Shape;
});
