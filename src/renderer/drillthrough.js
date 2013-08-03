/*********************************************************/
//
// Calendar.renderer.week
// deps on:
//			calendar.svg;
//			calendar.duration
//			calendar.retreiveCalcsCallback(year, week);
//			calendar.retreiveValueCallback(year, week, d.getDay(), d.getHours())
//			calendar.getColor(val);
//
/**********************************************************/
Calendar.renderer.drillthrough = function(spec){

	// renderer self ref
	var me = this;


	if(!spec) spec={};
	me.possible_display = spec.possible_display;
	me.current_renderer = spec.current_renderer || new Calendar.renderer.year();


	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;
		var args = arguments
		calendar.eventManager.on("tile:click", function(d){
			calendar.renderer = new Calendar.renderer.week();
			calendar.retreiveDataCallback = calendar.retreiveDataClosure("hour");
			calendar.createTiles(d.time.getFullYear(), calendar.time.getWeek(d.time))
		});

		return me.current_renderer.draw.apply(calendar, arguments);

	}

	/******************************************************/
	// CLEAN implementation
	/******************************************************/
	me.clean = function(){

		var calendar = this;

		return me.current_renderer.clean.apply(calendar, arguments);

	}

	/******************************************************/
	// BOUNDS implementation
	/******************************************************/
	me.bounds = function(year, week, day){
		
		var calendar = this;

		return me.current_renderer.bounds.apply(calendar, arguments);
	}

	return me;
}