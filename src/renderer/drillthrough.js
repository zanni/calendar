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

	var previous_btn = new Calendar.decorator.previous();
	
	me.previous = [];
	me.current_display = null;


	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

		var displayCalendar = function(display){
			
			
			
			me.current_display = display;
			calendar.renderer = display.renderer;
			calendar.retreiveDataCallback = display.retreiveDataCallback;
			calendar.createTiles.apply(calendar, display.arguments);
		}

		
		var args = [];
		for(var i = 1; i<arguments.length;i++) {
			args.push(arguments[i]);
		}
		var display = {
			renderer: me.current_renderer
			, retreiveDataCallback: calendar.retreiveDataClosure("day")
			, arguments: args
		};
		me.current_display = display;

		var args = arguments
		calendar.eventManager.on("tile:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			var display = {
				renderer: new Calendar.renderer.day()
				, retreiveDataCallback: calendar.retreiveDataClosure("hour")
				, arguments: [d.time.getFullYear(), calendar.time.getWeek(d.time), calendar.time.getDay(d.time)]
				
			};
			displayCalendar(display);
		});

		calendar.eventManager.on("label:month:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			var display = {
				renderer: new Calendar.renderer.month()
				, retreiveDataCallback: calendar.retreiveDataClosure("day")
				, arguments: [d.getFullYear(), calendar.time.getMonth(d)-1]
			};

			displayCalendar(display);
		});

		calendar.eventManager.on("label:year:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			var display = {
				renderer: new Calendar.renderer.year()
				, retreiveDataCallback: calendar.retreiveDataClosure("day")
				, arguments: [d.getFullYear()]
			};

			displayCalendar(display);
		});

		calendar.eventManager.on("label:week:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			var display = {
				renderer: new Calendar.renderer.week()
				, retreiveDataCallback: calendar.retreiveDataClosure("hour")
				, arguments: [d.getFullYear(), calendar.time.getWeek(d)]
			};
			displayCalendar(display);
		});

		calendar.eventManager.on("label:day:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			var display = {
				renderer: new Calendar.renderer.day()
				, retreiveDataCallback: calendar.retreiveDataClosure("hour")
				, arguments: [d.getFullYear(), calendar.time.getWeek(d), calendar.time.getDay(d)]
			};
			displayCalendar(display);
		});


		calendar.eventManager.on("previous:click", function(d){
			var display = me.previous.pop();

			if(!display) { 
				return;
			}
			if(me.previous.length == 0 ){
				previous_btn.clean.apply(calendar);
			}
			displayCalendar(display);
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