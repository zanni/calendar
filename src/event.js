// http://www.guahanweb.com/2011/09/27/custom-event-management-in-javascript/

var EventManager = {
    trigger : function(ev, args) {
        if (!!this.listeners[ev]) {
            for (var i = 0; i < this.listeners[ev].length; i++) {
                // Execute in the global scope (window), though this could also be customized
                this.listeners[ev][i].apply(window,  [args]);
            }
        }
    },
    // Inside the Events declaration
	on : function(ev, fn) {
	    // Verify we have events enabled
	    EventManager.enable.call(this, ev);
	 
	    if (!this.listeners[ev]) {
	        this.listeners[ev] = [];
	    }
	 
	    // Verify a function is being added
	    if (fn instanceof Function) {
	        this.listeners[ev].push(fn);
	    }
	},
	 
	remove : function(ev, fn) {
	    if (!!this.listeners[ev] &&
	        this.listeners[ev].length > 0) {
	        // If a listener is provided
	        if (!!fn) {
	            var fns = [];
	            for (var i = 0; i < this.listeners[ev].length; i++) {
	                if (fn != this.listeners[ev][i]) {
	                    fns.push(this.listeners[ev][i]);
	                }
	            }
	            this.listeners[ev] = fns;
	        } else { // No listener, so remove them all
	            this.listeners[ev] = [];
	        }
	    }
	},

	enable : function() {
	    var self = this;
	    if (!self.listeners) {
	        self.listeners = {};
	    }
	 
	    self.trigger = function(ev, args) {
	        EventManager.trigger.call(self, ev, args);
	    };
	 
	    self.on = function(ev, fn) {
	        EventManager.on.call(self, ev, fn);
	    };
	 
	    self.remove = function(ev, fn) {
	        EventManager.remove.call(self, ev, fn);
	    };
	}
};