Calendar.decorator.previous = function(spec){
	var me = this;

	me.id = "drillthrough_previous"
	// theming
	if(!spec) spec={};
	me.float = spec.float || 'right';
	me.position = spec.position || 'top';
	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

		me.decorator = calendar.decoratorEnter(me.id, me.float, me.position);

		me.decorator.on("click", function (d, i) {
	    	calendar.eventManager.trigger("previous:click");
	    })

		me.node = calendar.decoratorTextEnter(me.decorator)
				.text('previous')
	}

	me.clean = function(){
		var previous = d3.select("#"+me.id).remove();
	}

}