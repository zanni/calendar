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
Calendar.renderer.day = function(spec){

	// renderer self ref
	var me = this;

	// theming
	if(!spec) spec={};
	me.margin = spec.margin || 20;
	me.cell_size = spec.cell_size || 36;
	me.space_between_tiles = spec.space_between_tiles || 2;
	me.space_between_row = spec.space_between_row || 15;
	me.tiles_left_decal = spec.tiles_left_decal || 30;
	me.label_fill = spec.label_fill || "darkgray";
	me.label_fontsize = spec.label_fontsize || "12px";
	me.hour_label_class = spec.hour_label_class || "day_hour_label";
	me.hour_label_format = spec.hour_label_format || d3.time.format("%Hh");

	//horodator time format
	me.horodator_format = spec.horodator_format || d3.time.format("%Y %B %d");
	//hovered_format time format
	me.hovered_format = spec.hovered_format || d3.time.format("%Hh:%M");

	// store labels in order to clean
	me.labels_hours;


	var _bounds = function(year, week, day){
		var mondays = Calendar.data.firstDayOfWeek(new Date(year, 0, 0), new Date(year+1, 0,7));
		if(mondays && mondays[parseInt(week)]){
			var firstday = mondays[week];
			firstday.setTime(firstday.getTime() + (parseInt(day)) * 24*60*60*1000 - 7* 24*60*60*1000);
			var end = new Date();
			end.setTime(firstday.getTime() +24*60*60*1000);
			return {
				start : firstday
				, end : end
			}
		}
	}
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
		var bounds = _bounds(year, week, day);
		var start;
		if(bounds && bounds.start){
			start = d3.time.day(bounds.start);
		}
		else{
			start = new Date(year,0,0);
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


		var getValue = function(d, i, u){
			return calendar.retreiveValueCallback(data
				, Calendar.data.getYear(d)
				, Calendar.data.getWeek(d)
				, Calendar.data.getDay(d)
				, Calendar.data.getHours(d)
				, Calendar.data.getQuarter(d)
			);
		}

		// color tiles depending on val
		var colorize = function(val){
			return calendar.getColor(val);
		}



		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/
		
		var quarter = function(d){
			return Math.floor(d.getMinutes() / 15);
		}

		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			// return me.tiles_left_decal + d.getHours() * (cell_size + me.space_between_tiles)
			return (Math.floor(d.getHours()/6) * 4 
						* ( me.space_between_row + me.cell_size + me.space_between_tiles) 
					+ quarter(d)
						* ( me.cell_size + me.space_between_tiles )) + me.tiles_left_decal;
		}

		var calculTilePosY = function(d,i){
			return me.margin+((d.getHours() %6))* ( me.cell_size + me.space_between_tiles ) ;
		}

		// calcul X for hour / day chart
		var calculLabelHourPosX = function(d,i){
			// return 0;
			return (Math.floor(d.getHours()/6) * 4 
						* ( me.space_between_row+ me.cell_size + me.space_between_tiles) 
					+ quarter(d)
						* ( me.cell_size + me.space_between_tiles));
		}

		// calcul Y for hour / day chart
		var calculLabelHourPosY = function(d,i){
			return me.margin+((i%6))* ( me.cell_size + me.space_between_tiles) + 20 ;
		}

		var calculBBox = function(){
			return {
				// mouai ...
				width : 
						16 * (  me.space_between_row+me.cell_size + me.space_between_tiles) 
					+ 3	*  me.space_between_row+me.tiles_left_decal
						
				, height : 6 * ( me.cell_size + me.space_between_tiles ) + 30
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
					, function(d,i){ return i;} 
				)
		
		// tiles enter		
		calendar.tilesEnter(tiles)
				.attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", me.cell_size+"px")
		    	.attr("height", me.cell_size+"px");
			     

		calendar.tilesUpdate(tiles)
			.transition()
			// .duration(calendar.duration)
			.delay(function(d){
				return (quarter(d) * (Math.random() * 50)) + ((d.getHours() %6)) * (Math.random() * 50)/ calendar.duration
			})
		    .attr("x", calculTilePosX)
	    	.attr("y", calculTilePosY)
		    .attr("fill-opacity", 1)
		    .attr("width", me.cell_size+"px")
		    .attr("height", me.cell_size+"px")
		    .attr("fill", function(d){
		    	var val = getValue(d);
		    	this.setAttributeNS("http://www.example.com/d3.calendar", "data", val);
		    	return colorize(val);
		    });
			    
		// tiles exit
		calendar.tilesExit(tiles)

		/******************************************************/
		// LABELS
		/******************************************************/
		var labels_hours_transition = function(attr){

		}
		//hours labels
		me.labels_hours = svg.selectAll("."+me.hour_label_class)
				.data(
					// get each hour in a day
					getPeriod(start, day_time, d3.time.hours)
				);
		//hour labels enter
		calendar.labelEnter(me, me.labels_hours.enter(),me.hour_label_class )
			.attr("x", calculLabelHourPosX ) 
		    .attr("y", calculLabelHourPosY ) 
		    .attr("cursor", "cursor")
		    .text(me.hour_label_format);

		//hour labels update
		Calendar.animation.fadeIn(me.labels_hours.transition(), calendar.duration)
		    .attr("x", calculLabelHourPosX ) 
		    .attr("y", calculLabelHourPosY ) 
		    .text(me.hour_label_format);

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

	/******************************************************/
	// BOUNDS implementation
	/******************************************************/
	me.bounds = function(year, week, day){
		return _bounds(year, week, day);
	}

	return me;
}