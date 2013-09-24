/**
 * @class
 */
Calendar.renderer.month = function(spec){

	// renderer self ref
	var me = this;

	var settings = {
		cell_size : 36
		, margin : 40
		, space_between_tiles : 2
		, space_between_months : 36
		, month_label_left_decal : 80
		, year_label_top_decal : 146
		, tiles_top_decal : 15
		, tiles_left_decal : 20
		, label_fill : "darkgray"
		, label_fontsize : "14px"
		, month_label_class : "month_label"
		, week_label_class : "week_label"
		, year_label_class : "year_label"
		, month_label_format : d3.time.format("%B")
		, year_label_format : d3.time.format("%Y")
		, horodator_format : d3.time.format("%B, %Y")
		, hovered_format : d3.time.format("%B %d %Hh")
	}
	$.extend(me, settings);
	$.extend(me, spec);
	
	// store labels in order to clean
	me.labels_months;
	me.label_year;
	me.label_weeks;

	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(grab_data, year, month){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

		/******************************************************/
		// Helpers
		/******************************************************/
		// get time range
		var getPeriod = function(m, period){
			return period(
				new Date(parseInt(year), parseInt(m), 1)
				, new Date(parseInt(year), parseInt(m)+1, 1)
			); 
		}

		var getValue = function(d, i, u){
			return calendar.retreiveValueCallback(grab_data, year, calendar.time.getWeek(d),calendar.time.getDay(d));
		}

		// color tiles depending on val
		var colorize = function(val){
			return calendar.getColor(val);
		}


		/******************************************************/
		var data = [];
		var data_month = [];
		var first_month;
		var delcalages = 0;

		if(month instanceof Array){
			month.sort(function(a,b){ return a - b});
			for(var m in month){
				if(!first_month) first_month=month[m];
				data = data.concat(getPeriod(month[m],d3.time.days));
				data_month = data_month.concat(getPeriod(month[m],d3.time.months));
			}
		}
		else{
			first_month=month;
			data = getPeriod(month,d3.time.days);
			data_month = getPeriod(month,d3.time.months);
		}
		var current_week_index = 0;
		var prev_week;
		var weeks = [];
		var weeks_label = [];
		for(var d in data){
			if(prev_week < calendar.time.getWeek(data[d])){
				current_week_index++;
				if(calendar.time.getWeek(data[d]) - prev_week > 1){ 
					delcalages++;
					current_week_index++; 
				}
			}
			prev_week = calendar.time.getWeek(data[d]);
			weeks[calendar.time.getWeek(data[d])] = current_week_index;
			weeks_label.push(data[d]);
		}

		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/
		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			return me.margin+me.tiles_left_decal + (weeks[calendar.time.getWeek(d)]) * (me.cell_size + me.space_between_tiles);
		}

		var calculTilePosY = function(d,i){
			return me.margin+me.tiles_top_decal +calendar.time.getDay(d) * (me.cell_size + me.space_between_tiles);
		}

		// calcul X for hour / day chart
		var calculLabelMonthPosX = function(d,i){
			
			return me.margin+me.month_label_left_decal + (weeks[calendar.time.getWeek(d)]) * (me.cell_size + me.space_between_tiles);
		}

		// calcul Y for hour / day chart
		var calculLabelMonthPosY = function(d,i){
			return me.margin;
		}

		// calcul X for hour / day chart
		var calculLabelYearPosX = function(d,i){
			return -me.year_label_top_decal;
		}

		// calcul Y for hour / day chart
		var calculLabelYearPosY = function(d,i){
			return me.margin;
		}

		// calcul X for hour / day chart
		var calculLabelWeekPosX = function(d,i){

			return  20 + me.margin+me.tiles_left_decal + (weeks[calendar.time.getWeek(d)]) * (me.cell_size + me.space_between_tiles);
		}

		// calcul Y for hour / day chart
		var calculLabelWeekPosY = function(d,i){

			return me.margin+me.tiles_top_decal + 8* (me.cell_size + me.space_between_tiles);
		}

		var calculBBox = function(){
			var j = 0;
			weeks.map(function(){j++;})
			return {
				width : me.tiles_left_decal + (j) * (me.cell_size + me.space_between_tiles) + delcalages *me.cell_size + 25
				, height : me.tiles_top_decal + 7 * (me.cell_size + me.space_between_tiles) + 100
			}
		}

		function monthPath(t0) {

			var cell = (me.cell_size + me.space_between_tiles);
			var decaled_cell = (me.cell_size + me.space_between_tiles );

			var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
			  d0 = +calendar.time.getDay(t0), w0 = +(weeks[calendar.time.getWeek(t0)]) ,
			  d1 = +calendar.time.getDay(t1), w1 = +(weeks[calendar.time.getWeek(t1)]) ;
			return "M" + ((w0 + 1) * decaled_cell + me.tiles_left_decal+me.margin) + "," + (me.margin+d0 * cell + me.tiles_top_decal)
			  + "H" + (w0 * decaled_cell +me.tiles_left_decal +me.margin)+ "V" + (me.margin+7 * cell+ me.tiles_top_decal)
			  + "H" + (w1 * decaled_cell + me.tiles_left_decal+me.margin) + "V" + (me.margin+(d1 + 1) * cell+ me.tiles_top_decal)
			  + "H" + ((w1 + 1) * decaled_cell + me.tiles_left_decal+me.margin) + "V" + (me.tiles_top_decal+me.margin)
			  + "H" + ((w0 + 1) * decaled_cell + me.tiles_left_decal+me.margin) + "Z";
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
		// MONTH PATH
		/******************************************************/
		calendar.monthPathEnter(data_month,monthPath );

		/******************************************************/
		// TILES
		/******************************************************/
		//tiles update
		var tiles = svg.selectAll("."+calendar.tileClass)
				.data(data, function(d){
					return Calendar.data.getYear(d)+"-"+Calendar.data.getDayOfYear(d)
				} )
		
		// tiles enter			
		calendar.tilesEnter(tiles)
			     .attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width",me.cell_size+"px")
		    	.attr("height",me.cell_size+"px")

		calendar.tilesUpdate(tiles)
			.transition()
			.duration(calendar.duration)
			// .delay(function(d){
			// 	return (calendar.time.getWeek(d) * 20) + (calendar.time.getDay(d) * 20) + (Math.random() * 50) / calendar.duration
			// })
		    .attr("x", calculTilePosX)
	    	.attr("y", calculTilePosY)
		    .attr("fill-opacity", 1)
		    .attr("width",me.cell_size+"px")
		    .attr("height",me.cell_size+"px")
		    // .attr("fill", colorize);
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
		//hours labels
		me.labels_months = svg.selectAll("."+me.month_label_class)
				.data(data_month, function(d,i){return Calendar.data.getDayOfYear(d);});
		//hour labels enter
		calendar.labelEnter(me, me.labels_months.enter(), me.month_label_class)
			.attr("x", calculLabelMonthPosX ) 
		    .attr("y", calculLabelMonthPosY ) 
		    .text(me.month_label_format);

		//hour labels update
		Calendar.animation.fadeIn(me.labels_months.transition(), calendar.duration)
		    .attr("x", calculLabelMonthPosX ) 
		    .attr("y", calculLabelMonthPosY ) 
		    .text(me.month_label_format);

		//hour labels exit
		me.labels_months.exit().remove();
		// fadeOut(me.labels_months.exit().transition(), calendar.duration);
		
		//hours labels
		me.label_year = svg.selectAll("."+me.year_label_class)
				.data(getPeriod(0, d3.time.years), function(d,i){return i;});
		//hour labels enter
		calendar.labelEnter(me, me.label_year.enter(), me.year_label_class)
		    .attr("transform", "rotate(-90)")
		    .attr("x", calculLabelYearPosX ) 
		    .attr("y", calculLabelYearPosY ) 
    		.style("text-anchor", "middle")
		    .text(me.year_label_format);

		//hour labels update
		Calendar.animation.fadeIn(me.label_year.transition(), calendar.duration)
		    .attr("x", calculLabelYearPosX ) 
		    .attr("y", calculLabelYearPosY ) 
		    .text(me.year_label_format);

		//hour labels exit
		Calendar.animation.fadeOut(me.label_year.exit().transition(), calendar.duration);

		//hours labels
		me.label_weeks = calendar.svg.selectAll("."+me.week_label_class)
				.data(weeks_label, function(d,i){return d.getFullYear()+"-"+Calendar.data.getWeek(d);});


		//hour labels enter
		calendar.labelEnter(me, me.label_weeks.enter(), me.week_label_class)
		    .attr("x", calculLabelWeekPosX ) 
		    .attr("y", calculLabelWeekPosY ) 
		    .on("mouseover", function (d, i) {
		     	calendar.eventManager.trigger("label:week:mouseover", d);
		    })
		    .on("mouseout", function (d, i) {
		    	calendar.eventManager.trigger("label:week:mouseout", d);
		    })
		    .on("click", function (d, i) {
		    	calendar.eventManager.trigger("label:week:click", d);
		    })
    		.style("text-anchor", "middle")
		    .text(calendar.time.getWeek);

		//hour labels update
		Calendar.animation.fadeIn(me.label_weeks.transition(), calendar.duration)
		    .attr("x", calculLabelWeekPosX ) 
		    .attr("y", calculLabelWeekPosY ) 
		    .text(calendar.time.getWeek);

		//hour labels exit
		Calendar.animation.fadeOut(me.label_weeks.exit().transition(), calendar.duration);

		return calculBBox();
	}

	/******************************************************/
	// CLEAN implementation
	/******************************************************/
	me.clean = function(){
		var calendar = this;	
		calendar.monthPathExit();

		Calendar.animation.fadeOut(me.labels_months.transition(), calendar.duration);
		if(me.label_year)
			Calendar.animation.fadeOut(me.label_year.transition(), calendar.duration);

		Calendar.animation.fadeOut(me.label_weeks.transition(), calendar.duration);
	}

	/******************************************************/
	// BOUNDS implementation
	/******************************************************/
	me.bounds = function(year, month){
		if(month instanceof Array && month.length > 0){
			return {
				start : new Date(year, d3.min(month), 1)
				, end : new Date(year, d3.max(month) + 1, 1)
			}		
		}
		else{
			return {
				start : new Date(year, month, 1)
				, end : new Date(year, month + 1, 1)
			}
		}
	}

	return me;
}