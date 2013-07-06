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
Calendar.renderer.month = function(){

	// renderer self ref
	var me = this;

	// store labels in order to clean
	me.labels_months;
	me.label_year;

	/******************************************************/
	// renderer unic id
	/******************************************************/
	me.rendererId = "month";

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

		var day = function(d){
			var day = d.getDay();
			return ( day == 0) ? 6 : day - 1;
		}

		var formatMonth = function(d){
			var format = d3.time.format("%m");
			return parseInt(format(d));
		}

		var week = function(d){
			var format = d3.time.format("%W");
			return parseInt(format(d));
		}

		// color tiles depending on val
		var colorize = function(d){
			if(faked) return calendar.getColor();
			var val = calendar.retreiveValueCallback(grab_data, year, week(d), day(d));
			return calendar.getColor(val);
		}

		

		/******************************************************/
		// Retreive period bounds (val, time)
		// Adjust time to first day (if their is no data)
		/******************************************************/
		var data = [];
		var data_month = [];
		var bounds = [];
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
		for(var d in data){
			var bound = calendar.retreiveCalcsCallback(grab_data, year, week(data[d]), day(data[d]))
			if(prev_week < week(data[d])){
				current_week_index++;
				if(week(data[d]) - prev_week > 1){ 
					delcalages++;
					current_week_index++; 
				}
			}
			prev_week = week(data[d]);
			weeks[week(data[d])] = current_week_index;
			if(bound) bounds.push(bound);	
		}
		var min = [];
		 max = [];
		 mean = [];
		 median = [];
		startdate = [];
		bounds.map(function(d){
			if(d.start){
				min.push(d.min);
				max.push(d.max);
				mean.push(d.mean);
				median.push(d.median);
				startdate.push(d.start.getTime());
			}
		})
		var start = new Date();
		start.setTime(d3.min(startdate))
		bounds = {
			'min': d3.round(d3.min(min), 2)
			, 'max': d3.round(d3.max(max), 2)
			, 'mean': d3.round(d3.mean(mean), 2)
			, 'median': d3.round(d3.median(median), 2)
			, 'start': start
		};

		calendar.setBucket(bounds);
		calendar.setLegend(bounds);
		var faked = false;
		start;
		try{
			var time = bounds.start.getTime();
			start = d3.time.day(time);
		}
		catch(err){
			start = new Date(year,first_month,0);
		}

		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/
		var cell_size = 36;
		var margin = 20;
		var space_between_tiles = 2;
		var space_between_months = cell_size;
		var month_label_left_decal = 80;
		var year_label_top_decal = 146;
		var tiles_top_decal = 15;
		var tiles_left_decal = 20;
		var label_fill = "darkgray";
		var label_fontsize = "14px";
		var month_label_class = "month_label";
		var month_label_format = d3.time.format("%B");
		var year_label_class = "year_label";
		var year_label_format = d3.time.format("%Y");
		
		var initLabel = function(transform, klass){
			return transform.append("text")
						.classed(klass, true)
						.attr("fill", label_fill)
						.attr("font-size", label_fontsize);
		}
		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			return margin+tiles_left_decal + (weeks[week(d)]) * (cell_size + space_between_tiles);
		}

		var calculTilePosY = function(d,i){
			return margin+tiles_top_decal + day(d) * (cell_size + space_between_tiles);
		}

		// calcul X for hour / day chart
		var calculLabelMonthPosX = function(d,i){
			return margin+month_label_left_decal + (weeks[week(d)]) * (cell_size + space_between_tiles);
		}

		// calcul Y for hour / day chart
		var calculLabelMonthPosY = function(d,i){
			return margin;
		}

		// calcul X for hour / day chart
		var calculLabelYearPosX = function(d,i){
			return -year_label_top_decal;
		}

		// calcul Y for hour / day chart
		var calculLabelYearPosY = function(d,i){
			return margin;
		}

		var calculBBox = function(){
			var j = 0;
			weeks.map(function(){j++;})
			return {
				width : tiles_left_decal + (j) * (cell_size + space_between_tiles) + delcalages * cell_size + 25
				, height : tiles_top_decal + 7 * (cell_size + space_between_tiles)
			}
		}

		function monthPath(t0) {

			var cell = (cell_size + space_between_tiles);
			var decaled_cell = (cell_size + space_between_tiles );

			var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
			  d0 = +day(t0), w0 = +(weeks[week(t0)]) ,
			  d1 = +day(t1), w1 = +(weeks[week(t1)]) ;
			return "M" + ((w0 + 1) * decaled_cell + tiles_left_decal+margin) + "," + (margin+d0 * cell + tiles_top_decal)
			  + "H" + (w0 * decaled_cell +tiles_left_decal +margin)+ "V" + (margin+7 * cell+ tiles_top_decal)
			  + "H" + (w1 * decaled_cell + tiles_left_decal+margin) + "V" + (margin+(d1 + 1) * cell+ tiles_top_decal)
			  + "H" + ((w1 + 1) * decaled_cell + tiles_left_decal+margin) + "V" + (tiles_top_decal+margin)
			  + "H" + ((w0 + 1) * decaled_cell + tiles_left_decal+margin) + "Z";
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
				.data(data)
		
		// tiles enter			
		calendar.tilesEnter(tiles)
			     .attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", cell_size+"px")
		    	.attr("height", cell_size+"px")

		tiles
			.transition()
			// .duration(calendar.duration)
			.delay(function(d){
				return (week(d) * 20) + (d.getDay() * 20) + (Math.random() * 50) / calendar.duration
			})
		    .attr("x", calculTilePosX)
	    	.attr("y", calculTilePosY)
		    .attr("fill-opacity", 1)
		    .attr("width", cell_size+"px")
		    .attr("height", cell_size+"px")
		    .attr("fill", colorize);
			    
		// tiles exit
		calendar.tilesExit(tiles);

		/******************************************************/
		// MONTH PATH
		/******************************************************/
		calendar.monthPathEnter(data_month,monthPath );

		/******************************************************/
		// LABELS
		/******************************************************/
		//hours labels
		me.labels_months = svg.selectAll("."+month_label_class)
				.data(data_month);
		//hour labels enter
		initLabel(me.labels_months.enter(), month_label_class)
			.attr("x", calculLabelMonthPosX ) 
		    .attr("y", calculLabelMonthPosY ) 
		    .text(month_label_format);

		//hour labels update
		Calendar.animation.fadeIn(me.labels_months.transition(), calendar.duration)
		    .attr("x", calculLabelMonthPosX ) 
		    .attr("y", calculLabelMonthPosY ) 
		    .text(month_label_format);

		//hour labels exit
		me.labels_months.exit().remove();
		// fadeOut(me.labels_months.exit().transition(), calendar.duration);
		
		//hours labels
		me.label_year = svg.selectAll("."+year_label_class)
				.data(getPeriod(0, d3.time.years));
		//hour labels enter
		initLabel(me.label_year.enter(), year_label_class)
		    .attr("transform", "rotate(-90)")
		    .attr("x", calculLabelYearPosX ) 
		    .attr("y", calculLabelYearPosY ) 
    		.style("text-anchor", "middle")
		    .text(year_label_format);

		//hour labels update
		Calendar.animation.fadeIn(me.label_year.transition(), calendar.duration)
		    .attr("x", calculLabelYearPosX ) 
		    .attr("y", calculLabelYearPosY ) 
		    .text(year_label_format);

		//hour labels exit
		Calendar.animation.fadeOut(me.label_year.exit().transition(), calendar.duration);

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
	}

	/******************************************************/
	// BOUNDS implementation
	/******************************************************/
	me.bounds = function(year, month){
		if(month instanceof Array && month.length > 0){
			if(month.length < 2){
				return {
					start : new Date(year, d3.min(month), 0)
					, end : new Date(year, d3.min(month) + 1, 0)
				}
			}
			else{
				return {
					start : new Date(year, d3.min(month), 0)
					, end : new Date(year, d3.max(month) + 1, 0)
				}
			}			
		}
		else{
			return {
				start : new Date(year, month, 0)
				, end : new Date(year, month + 1, 0)
			}
		}
	}

	return me;
}