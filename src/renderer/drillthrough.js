
var previousDecorator = function(spec){
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

		me.decorator = calendar.decoratorEnter(me.id, me.float, me.position, true);

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
/**
 * @class
 */
Calendar.renderer.drillthrough = function(spec){

	// renderer self ref
	var me = this;


	if(!spec) spec={};
	me.possible_display = spec.possible_display;
	me.current_renderer = spec.current_renderer || new Calendar.renderer.year();

	me.horodator_format = me.current_renderer.horodator_format
	me.hovered_format = me.current_renderer.hovered_format

	var previous_btn = new previousDecorator({
		float: 'left'
		, position: 'top'
	});
	
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
		

		var args = [];
		for(var i = 1; i<arguments.length;i++) {
			args.push(arguments[i]);
		}
		me.current_display = {
			renderer : new Calendar.renderer.year()
			, args: args
		}

		var display = function(display){
			calendar.renderer = display.renderer;
			calendar.createTiles.apply(calendar, display.args);
		}

		display(me.current_display);

		calendar.eventManager.on("tile:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			me.current_display = {
				renderer : new Calendar.renderer.day()
				, args: [d.time.getFullYear()
					, calendar.time.getWeek(d.time)
					, calendar.time.getDay(d.time)
					, "quarter"
				]
			}
			display(me.current_display);
		});

		calendar.eventManager.on("label:month:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			me.current_display = {
				renderer : new Calendar.renderer.month()
				, args: [d.getFullYear()
					, calendar.time.getMonth(d) -1
					, "day"
				]
			}
			display(me.current_display);
		});

		calendar.eventManager.on("label:year:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			me.current_display = {
				renderer : new Calendar.renderer.year()
				, args: [d.getFullYear(), "day"]
			}
			display(me.current_display);
		});

		calendar.eventManager.on("label:week:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			me.current_display = {
				renderer : new Calendar.renderer.week()
				, args: [d.getFullYear(), calendar.time.getWeek(d), "hour"]
			}
			display(me.current_display);
		});

		calendar.eventManager.on("label:day:click", function(d){
			if(me.previous.length == 0 ){
				previous_btn.draw.apply(calendar);
			}
			me.previous.push(me.current_display);
			me.current_display = {
				renderer : new Calendar.renderer.day()
				, args: [d.getFullYear(), calendar.time.getWeek(d), calendar.time.getDay(d), "quarter"]
			}
			display(me.current_display);
		});


		calendar.eventManager.on("previous:click", function(d){
			var view = me.previous.pop();
			if(!view) { 
				return;
			}
			if(me.previous.length == 0 ){
				previous_btn.clean.apply(calendar);
			}
			me.current_display = view;
			display(view);
		});
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