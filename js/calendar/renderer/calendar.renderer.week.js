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
Calendar.renderer.week = function(){

	// renderer self ref
	var me = this;

	// store labels in order to clean
	me.labels_days;
	me.labels_hours;

	/******************************************************/
	// renderer unic id
	/******************************************************/
	me.rendererId = "week";

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
	me.draw = function(grab_data, year, week){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

		/******************************************************/
		// Retreive period bounds (val, time)
		// Adjust time to first day (if their is no data)
		/******************************************************/
		var bounds = calendar.retreiveCalcsCallback(grab_data, year, week);
		calendar.setBucket(bounds);
		calendar.setLegend(bounds);

		var start = d3.time.monday(bounds.start);

		/******************************************************/
		// Helpers
		/******************************************************/
		// get time range
		var getPeriod = function(start, period, callback){
			return callback(
				start
				, new Date().setTime(start.getTime() + period)
			);
		}

		// color tiles depending on val
		var colorize = function(d){
			var val = calendar.retreiveValueCallback(grab_data, year, week, d.getDay(), d.getHours());
			return calendar.getColor(val);
		}

		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/
		var cell_size = 36;
		var space_between_tiles = 2;
		var tiles_left_decal = 85;
		var day_label_top_decal = 30;
		var tile_top_decal = 10;
		var hour_label_top_decal = 20;
		var hour_label_left_decal = 5;
		var label_fill = "darkgray";
		var label_fontsize = "14px";
		var day_label_class = "day_label";
		var hour_label_class = "hour_label";
		var _day_label_format = d3.time.format("%a %d %b");
		var day_label_format = function(d,i){
			return (i % 2 == 0) ? _day_label_format(d) : "";
		}
		var _hour_label_format = d3.time.format("%Hh");
		var hour_label_format = function(d,i){ 
			return (i % 2 == 0) ? _hour_label_format(d) : "";
		}

		var initLabel = function(transform, klass){
			return transform.append("text")
						.classed(klass, true)
						.attr("fill", label_fill)
						.attr("font-size", label_fontsize);
		}
		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			return tiles_left_decal + d.getHours() * (cell_size + space_between_tiles)
		}

		// calcul Y for hour / day chart
		var calculTilePosY = function(d,i){
			return d.getDay() * (cell_size + space_between_tiles) + hour_label_top_decal + tile_top_decal
		}

		// calcul X for hour / day chart
		var calculLabelDayPosX = function(d,i){
			return 0;
		}

		// calcul Y for hour / day chart
		var calculLabelDayPosY = function(d,i){
			return day_label_top_decal + i * (cell_size + space_between_tiles) + hour_label_top_decal
		}

		// calcul X for hour / day chart
		var calculLabelHourPosX = function(d,i){
			return tiles_left_decal + d.getHours() * (cell_size + space_between_tiles) + hour_label_left_decal;
		}

		// calcul Y for hour / day chart
		var calculLabelHourPosY = function(d,i){
			return hour_label_top_decal;
		}

		var calculBBox = function(){
			return {
				width : tiles_left_decal + 24 * (cell_size + space_between_tiles)
				, height : 7 * (cell_size + space_between_tiles) + hour_label_top_decal
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
					getPeriod(start, week_time, d3.time.hours)
					, function(d,i){ return i;} 
				)
		
		// tiles enter		
		tiles.enter()
			.insert("rect")
				.classed(calendar.tileClass, true)
				.attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", cell_size+"px")
		    	.attr("height", cell_size+"px")
			    .attr("stroke-width", "2px")
				.attr("fill", "#fff")
				.attr("fill-opacity", 0)
			     

		tiles
			.transition()
			// .duration(calendar.duration)
			.delay(function(d){
				return (d.getHours() * 20) + (d.getDay() * 20) + (Math.random() * 50) / calendar.duration
			})
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
		//day labels
		me.labels_days = svg.selectAll("."+day_label_class)
				.data(
					// get each day on a week
					getPeriod(start, week_time, d3.time.days)
					, function(d,i){ return i}
				);
		//day labels enter
		initLabel(me.labels_days.enter(), day_label_class)
			.attr("x", calculLabelDayPosX ) 
		    .attr("y", calculLabelDayPosY ) 
		    .text(day_label_format);

		//day labels update
		fadeIn(me.labels_days.transition(), calendar.duration)
			.text(day_label_format);
	
		//day labels exit
		fadeOut(me.labels_days.exit().transition(), calendar.duration);

		//hours labels
		me.labels_hours = svg.selectAll("."+hour_label_class)
				.data(
					// get each hour in a day
					getPeriod(start, day_time, d3.time.hours)
				);
		//hour labels enter
		initLabel(me.labels_hours.enter(), hour_label_class)
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
		fadeOut(me.labels_days.transition(), calendar.duration);
		fadeOut(me.labels_hours.transition(), calendar.duration);
	}

	return me;
}