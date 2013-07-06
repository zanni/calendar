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
Calendar.renderer.day = function(){

	// renderer self ref
	var me = this;

	// store labels in order to clean
	me.labels_hours;

	/******************************************************/
	// renderer unic id
	/******************************************************/
	me.rendererId = "day";

	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(data, year, week, day){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

		/******************************************************/
		// Retreive period bounds (val, time)
		// Adjust time to first day (if their is no data)
		/******************************************************/

		var bounds = calendar.retreiveCalcsCallback(data, year, week, day);
		calendar.setBucket(bounds);
		calendar.setLegend(bounds);
		var faked = false;
		var start;
		if(bounds.start){
			start = d3.time.day(bounds.start);
		}
		else{
			start = new Date(year,0,0);
			faked = true;
		}
		/******************************************************/
		// Helpers
		/******************************************************/
		// get time range
		var getPeriod = function(start, period, callback, step){

			return callback(
				start
				, new Date().setTime(start.getTime() + period), (step) ? step : 1
			);
		}

		// color tiles depending on val
		var colorize = function(d){
			if(faked) return calendar.getColor();
			var day = d.getDay();
			var val = calendar.retreiveValueCallback(data
				, year
				, week
				, ( day == 0) ? 6 : day - 1
				, d.getHours()
			);
			return calendar.getColor(val);
		}



		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/
		var cell_size = 36;
		var space_between_tiles = 2;
		var space_between_row = 15;
		var tiles_left_decal = 30;
		var label_fill = "darkgray";
		var label_fontsize = "12px";
		var hour_label_class = "day_hour_label";
		var hour_label_format = d3.time.format("%Hh");
		var quarter = function(d){
			return Math.floor(d.getMinutes() / 15);
		}

		var initLabel = function(transform){
			return transform.append("text")
						.classed(hour_label_class, true)
						.attr("fill", label_fill)
						.attr("font-size", label_fontsize);
		}
		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			// return tiles_left_decal + d.getHours() * (cell_size + space_between_tiles)
			return (Math.floor(d.getHours()/6) * 4 
						* ( space_between_row + cell_size + space_between_tiles) 
					+ quarter(d)
						* ( cell_size + space_between_tiles )) + tiles_left_decal;
		}

		var calculTilePosY = function(d,i){
			return ((d.getHours() %6))* ( cell_size + space_between_tiles ) ;
		}

		// calcul X for hour / day chart
		var calculLabelHourPosX = function(d,i){
			// return 0;
			return (Math.floor(d.getHours()/6) * 4 
						* ( space_between_row+ cell_size + space_between_tiles) 
					+ quarter(d)
						* ( cell_size + space_between_tiles));
		}

		// calcul Y for hour / day chart
		var calculLabelHourPosY = function(d,i){
			return ((i%6))* ( cell_size + space_between_tiles) + 20 ;
		}

		var calculBBox = function(){
			return {
				// mouai ...
				width : 
						16 * (  space_between_row+cell_size + space_between_tiles) 
					+ 3	*  space_between_row+tiles_left_decal
						
				, height : 6 * ( cell_size + space_between_tiles )
			}
		}
		/******************************************************/
		// definitions
		/******************************************************/

		// time helpers
		var day_time = 24 * 60 * 60 * 1000;
		var week_time = 7 * day_time;

		// ref on DOM
		var svg = calendar.svg;

		/******************************************************/
		// TILES
		/******************************************************/
		//tiles update
		var tiles = svg.selectAll("."+calendar.tileClass)
				.data(
					// get each hour in a week
					getPeriod(start, day_time, d3.time.minutes, 15)
				)
		
		// tiles enter		
		calendar.tilesEnter(tiles)
				.attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", cell_size+"px")
		    	.attr("height", cell_size+"px");
			     

		tiles
			.transition()
			// .duration(calendar.duration)
			.delay(function(d){
				return (quarter(d) * 20) + (d.getDay() * 20) + (Math.random() * 50)/ calendar.duration
			})
		    .attr("x", calculTilePosX)
	    	.attr("y", calculTilePosY)
		    .attr("fill-opacity", 1)
		    .attr("width", cell_size+"px")
		    .attr("height", cell_size+"px")
		    .attr("fill", colorize);
			    
		// tiles exit
		calendar.tilesExit(tiles)

		/******************************************************/
		// LABELS
		/******************************************************/
		var labels_hours_transition = function(attr){

		}
		//hours labels
		me.labels_hours = svg.selectAll("."+hour_label_class)
				.data(
					// get each hour in a day
					getPeriod(start, day_time, d3.time.hours)
				);
		//hour labels enter
		initLabel(me.labels_hours.enter())
			.attr("x", calculLabelHourPosX ) 
		    .attr("y", calculLabelHourPosY ) 
		    .text(hour_label_format);

		//hour labels update
		Calendar.animation.fadeIn(me.labels_hours.transition(), calendar.duration)
		    .attr("x", calculLabelHourPosX ) 
		    .attr("y", calculLabelHourPosY ) 
		    .text(hour_label_format);

		//hour labels exit
		Calendar.animation.fadeOut(me.labels_hours.exit().transition(), calendar.duration);
		
		return calculBBox();

	}

	/******************************************************/
	// CLEAN implementation
	/******************************************************/
	me.clean = function(){
		var calendar = this;
		Calendar.animation.fadeOut(me.labels_hours.transition(), calendar.duration);
	}

	return me;
}