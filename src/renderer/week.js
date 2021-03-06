/**
 * @class
 */
Calendar.renderer.week = function(spec){

	// renderer self ref
	var me = this;

	var settings = {
		cell_size : 36
		, space_between_tiles : 2
		, tiles_left_decal : 85
		, day_label_top_decal : 30
		, tile_top_decal : 10
		, hour_label_top_decal : 20
		, hour_label_left_decal : 5
		, label_fill : "darkgray"
		, label_fontsize : "14px"
		, day_label_class : "day_label"
		, hour_label_class : "hour_label"
		, _day_label_format : d3.time.format("%a %d %b")
		, horodator_format : d3.time.format("%Y, week %W")
		, hovered_format : d3.time.format("%d %Hh")
	}
	$.extend(me, settings);
	$.extend(me, spec);

	// store labels in order to clean
	me.labels_days;
	me.labels_hours;

	var _bounds = function(year, week){
		var mondays = Calendar.data.firstDayOfWeek(new Date(year, 0, 1), new Date(year+1, 0,7));
		if(mondays && mondays[week]){
			var firstday = mondays[week];
			firstday.setTime(firstday.getTime() - 7*24*60*60*1000)
			var lastday = new Date();
			lastday.setTime(firstday.getTime() + 7*24*60*60*1000);
			return {
				start : firstday
				, end : lastday
			}
		}
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
		var bounds = _bounds(year, week);
		var start; 
		if(bounds && bounds.start){
			start = bounds.start
		}
		else{
			start = new Date(year,0,0);
			faked = true;
		}

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

		var getValue = function(d){
			return  calendar.retreiveValueCallback(grab_data, year, week, calendar.time.getDay(d), d.getHours());
		}
		// color tiles depending on val
		var colorize = function(val){
			return calendar.getColor(val);
		}

		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/

		var day_label_format = function(d,i){
			return (i % 2 == 0) ? me._day_label_format(d) : "";
		}
		var _hour_label_format = d3.time.format("%Hh");

		var hour_label_format = function(d,i){ 
			return (i % 2 == 0) ? _hour_label_format(d) : "";
		}

		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			return me.tiles_left_decal + d.getHours() * (me.cell_size + me.space_between_tiles)
		}

		// calcul Y for hour / day chart
		var calculTilePosY = function(d,i){
			return calendar.time.getDay(d) * (me.cell_size + me.space_between_tiles) + me.hour_label_top_decal + me.tile_top_decal
		}

		// calcul X for hour / day chart
		var calculLabelDayPosX = function(d,i){
			return 0;
		}

		// calcul Y for hour / day chart
		var calculLabelDayPosY = function(d,i){
			return me.day_label_top_decal + i * (me.cell_size + me.space_between_tiles) + me.hour_label_top_decal
		}

		// calcul X for hour / day chart
		var calculLabelHourPosX = function(d,i){
			return me.tiles_left_decal + d.getHours() * (me.cell_size + me.space_between_tiles) + me.hour_label_left_decal;
		}

		// calcul Y for hour / day chart
		var calculLabelHourPosY = function(d,i){
			return me.hour_label_top_decal;
		}

		var calculBBox = function(){
			return {
				width : me.tiles_left_decal + 24 * (me.cell_size + me.space_between_tiles)
				, height : 7 * (me.cell_size + me.space_between_tiles) + me.hour_label_top_decal + 40
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
		calendar.tilesEnter(tiles)
				.attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", me.cell_size+"px")
		    	.attr("height", me.cell_size+"px")
			     

		calendar.tilesUpdate(tiles)
			.transition()
			.duration(calendar.duration)
			.delay(function(d){
				if(!calendar.animation) return 0;
				return (d.getHours() * 20) + (calendar.time.getDay(d) * 20) + (Math.random() * 50) / calendar.duration
			})
		    .attr("x", calculTilePosX)
	    	.attr("y", calculTilePosY)
		    .attr("fill-opacity", 1)
		    .attr("width", me.cell_size+"px")
		    .attr("height", me.cell_size+"px")
		   	.attr("value", getValue)
		    .attr("fill", function(d){
		    	var val = getValue(d);
		    	this.setAttributeNS("http://www.example.com/d3.calendar", "data", val);
		    	return colorize(val);
		    });
			    
		// tiles exit
		calendar.tilesExit(tiles);

		/******************************************************/
		// LABELS
		/******************************************************/
		//day labels
		me.labels_days = svg.selectAll("."+me.day_label_class)
				.data(
					// get each day on a week
					getPeriod(start, week_time, d3.time.days)
					, function(d,i){ return i}
				);
		//day labels enter
		calendar.labelEnter(me, me.labels_days.enter(), me.day_label_class)
			.attr("x", calculLabelDayPosX ) 
		    .attr("y", calculLabelDayPosY ) 
		    .on("mouseover", function (d, i) {
		     	calendar.eventManager.trigger("label:day:mouseover", d);
		    })
		    .on("mouseout", function (d, i) {
		    	calendar.eventManager.trigger("label:day:mouseout", d);
		    })
		    .on("click", function (d, i) {
		    	calendar.eventManager.trigger("label:day:click", d);
		    })
		    .text(day_label_format);

		//day labels update
		Calendar.animation.fadeIn(me.labels_days.transition(), calendar.duration)
			.text(day_label_format);
	
		//day labels exit
		Calendar.animation.fadeOut(me.labels_days.exit().transition(), calendar.duration);

		//hours labels
		me.labels_hours = svg.selectAll("."+me.hour_label_class)
				.data(
					// get each hour in a day
					getPeriod(start, day_time, d3.time.hours)
					, function(d,i){return i;}
				);
		//hour labels enter
		calendar.labelEnter(me, me.labels_hours.enter(), me.hour_label_class)
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
		Calendar.animation.fadeOut(me.labels_days.transition(), calendar.duration);
		Calendar.animation.fadeOut(me.labels_hours.transition(), calendar.duration);
	}

	/******************************************************/
	// BOUNDS implementation
	/******************************************************/
	me.bounds = function(year, week){
		return _bounds(year, week);
	}

	return me;
}