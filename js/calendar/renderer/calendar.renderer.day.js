if(!Calendar.renderer){
	Calendar.renderer = {};
}

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
	// animation utils
	/******************************************************/
	// fade in animation
	var fadeIn = function(transition, duration){
		return transition
			.duration(duration)
			.attr("fill-opacity", 1)	
	}

	// fade out animation
	var fadeOut = function(transition, duration){
		return transition
			.duration(duration)
			.attr("fill-opacity", 0)
			.remove();	
	}

	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(year, week, day){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

		/******************************************************/
		// Retreive period bounds (val, time)
		// Adjust time to first day (if their is no data)
		/******************************************************/
		var bounds = calendar.retreiveCalcsCallback(year, week, day);
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
			var val = calendar.retreiveValueCallback(year, week, d.getDay() - 1, d.getHours());
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
		var tiles = svg.selectAll(".tile")
				.data(
					// get each hour in a week
					getPeriod(start, day_time, d3.time.minutes, 15)
				)
		
		// tiles enter		
		tiles.enter()
			.insert("rect")
				.classed("tile", true)
				.attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", cell_size+"px")
		    	.attr("height", cell_size+"px")
			    .attr("stroke-width", "2px")
				.attr("fill", "#fff")
				.attr("fill-opacity", 0)
			     

		tiles
			.transition()
			.duration(calendar.duration)
			// .delay(function(d){
			// 	return (d.getHours() * 20) + (d.getDay() * 20) + (Math.random() * 50)
			// })
		    .attr("x", calculTilePosX)
	    	.attr("y", calculTilePosY)
		    .attr("fill-opacity", 1)
		    .attr("width", cell_size+"px")
		    .attr("height", cell_size+"px")
		    .attr("fill", colorize);
			    
		// tiles exit
		tiles.exit().transition().duration(calendar.duration)
		.attr("fill-opacity", 0)
		.remove()

		/******************************************************/
		// LABELS
		/******************************************************/
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
		fadeIn(me.labels_hours.transition(), calendar.duration)
		    .attr("x", calculLabelHourPosX ) 
		    .attr("y", calculLabelHourPosY ) 
		    .text(hour_label_format);

		//hour labels exit
		fadeOut(me.labels_hours.exit().transition(), calendar.duration);
		
		return calculBBox();

	}

	/******************************************************/
	// CLEAN implementation
	/******************************************************/
	me.clean = function(){
		var calendar = this;
		fadeOut(me.labels_hours.transition(), calendar.duration);
	}

	return me;
}