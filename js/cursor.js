
if (!Function.prototype.bind) {

  Function.prototype.bind = function (oThis) {

    if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));    
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;

  };

}


document.addEvent = function(eventName, eventHandler){
    this.addEventListener(eventName, eventHandler, false);
};

document.addEvents = function(events){
    for (var eventName in events)
        this.addEvent(eventName, events[eventName]);
};

document.removeEvent = function(eventName, eventHandler){
    this.removeEventListener(eventName, eventHandler, false);
};


var Cursor = function(){
    // binding an instance method...
    this.movement = this.movement.bind(this);

    var moveStart = this.moveStart.bind(this),
        moveEnd = this.moveEnd.bind(this);

    document.addEvents({
        'mousedown': moveStart('mousemove'),
        'touchstart': moveStart('touchmove'),
        'mouseup': moveEnd('mousemove'),
        'touchend': moveEnd('touchmove'),
        'touchcancel': moveEnd('touchmove')
    });
};

Cursor.prototype = {
    callbacks: [],

    moveStart: function(eventName){
        var movement = this.movement; // this has be statically bound...
        return (function(event){
            event.preventDefault();
            this.reset();
            document.addEvent(eventName, movement); // move on subsequent moves
        }).bind(this);
    },

    moveEnd: function(eventName){
        var movement = this.movement; // this has be statically bound...
        return (function(){
            document.removeEvent(eventName, movement);
            this.momentum();
        }).bind(this);
    },

    reset: function(){
        delete this.previous;
        this.stopMomentum();
    },

    movement: function(event, delta){
        if (!delta) delta = this.calculateDelta(event);
        this.callbacks.forEach(function(callback){
            callback(delta);
        });
    },

    calculateDelta: function(event){
        if (event.touches) event = event.touches[0];

        var position = new Vector(event.pageX, event.pageY);

        if (!this.previous) this.previous = position;

        var delta = position.subtract(this.previous);
        this.previous = position;

        return this.lastDelta = delta;
    },

    stopMomentum: function(){
        this.momentumTimer = clearTimeout(this.momentumTimer);
    },

    momentum: function(){
        var delta = this.lastDelta,
            damp = 0.94, delay = 30;

        if (this.momentumTimer) this.stopMomentum();

        var calcMomentum = (function(){
			if (delta == undefined) return;
			
			var l = delta.length;
            if (l < 0.1) return; // BUG: was .length()

            this.movement(null, (delta = delta.scale(damp)));

            this.momentumTimer = setTimeout(calcMomentum, delay);
        }).bind(this);

        calcMomentum();
    },

    addMovementListener: function(callback){
        this.callbacks.push(callback);
    }

};