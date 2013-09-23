Calendar.renderer.github = function(spec){

	// renderer self ref
	var me = this;


	if(!spec) spec={};

	me.horodator_format = me.current_renderer.horodator_format
	me.hovered_format = me.current_renderer.hovered_format


	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

	

	}

	/******************************************************/
	// CLEAN implementation
	/******************************************************/
	me.clean = function(){


	}

	/******************************************************/
	// BOUNDS implementation
	/******************************************************/
	me.bounds = function(){
		
		var calendar = this;

		return me.current_renderer.bounds.apply(calendar, arguments);
	}

	return me;
}