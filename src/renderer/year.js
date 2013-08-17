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
Calendar.renderer.year = function(spec){

	// renderer self ref
	var me = this;

	//theming 
	if(!spec) spec={};
	me.cell_size = spec.cell_size || 36;
	me.margin = spec.margin || 20;
	me.space_between_tiles = spec.space_between_tiles || 2;
	me.space_between_years = spec.space_between_years || me.cell_size*2;
	me.month_label_left_decal = spec.month_label_left_decal || 80;
	me.year_label_top_decal = spec.year_label_top_decal || 146;
	me.week_label_left_decal = spec.week_label_left_decal || 20;
	me.week_label_top_decal = spec.week_label_top_decal || 20;
	me.tiles_top_decal = spec.tiles_top_decal || 15;
	me.tiles_left_decal = spec.tiles_left_decal || 20;

	me.label_fill = spec.label_fill || "darkgray";
	me.label_fontsize = spec.label_fontsize || "22px";
	
	me.month_label_class = spec.month_label_class || "month_label";
	me.month_label_format = spec.month_label_format || d3.time.format("%B");
	me.year_label_class = spec.year_label_class || "year_label";
	me.week_label_class = spec.week_label_class || "week_label";
	me.year_label_format = spec.year_label_format || d3.time.format("%Y");

	// store labels in order to clean
	me.labels_months;
	me.label_year;
	me.label_weeks;

	// cache bounds
	me.cache_bounds = {};

	/******************************************************/
	// DRAW implementation
	// in this case, data are given to the renderer
	// cause they are grabbed just before displaying calendar
	// , in order to load just the correct amount of data
	/******************************************************/
	me.draw = function(data, year){
		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// settings when calling draw func with apply
		/******************************************************/
		var calendar = this;

		/******************************************************/
		// Helpers
		/******************************************************/
		// get time range
		var getPeriod = function(y, period){
			return period(
				new Date(parseInt(y), 0, 1)
				, new Date(parseInt(y)+1, 0, 1)
			); 
		}

		var getValue = function(d, i, u){
			return calendar.retreiveValueCallback(data, d.getFullYear(), calendar.time.getWeek(d),calendar.time.getDay(d));
		}

		// color tiles depending on val
		var colorize = function(val){
			// var val = calendar.retreiveValueCallback(data, d.getFullYear(), calendar.time.getWeek(d),calendar.time.getDay(d));
			return calendar.getColor(val);
		}

		
		/******************************************************/
		var data_year;
		var data_year_label;
		var data_month;
		var data_week_label
		var first_year;
		var year_index = [];
		if(year instanceof Array){
			data_year = [];
			data_year_label = [];
			data_month = [];
			data_week_label = [];
			year.sort(function(a,b){ return a - b});
			
			var j = 0;
			for(var i in year){
				year_index[year[i]] = j++; 
				if(!first_year) first_year = year[i];
				data_year = data_year.concat(getPeriod(year[i], d3.time.days))
				data_year_label.push(new Date(year[i], 1, 1));
				data_month = data_month.concat(getPeriod(year[i], d3.time.months));
				data_week_label = data_week_label.concat(getPeriod(year[i], d3.time.weeks));

			}
		}
		else{
			first_year = year;
			year_index[year] = 0;
			data_year = getPeriod(year, d3.time.days);
			data_year_label = [new Date(year, 0, 1)];
			data_month = getPeriod(year, d3.time.months);
			data_week_label = getPeriod(year, d3.time.weeks);
		}

		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/
		var year_height = 7 * me.cell_size + me.margin+me.tiles_top_decal +me.space_between_years;
		
		
		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			return calendar.time.getWeek(d) * (me.cell_size+ me.space_between_tiles) + me.margin + me.tiles_left_decal; 
		}

		var calculTilePosY = function(d,i){

			return year_height * year_index[d.getFullYear()] //( d.getFullYear() - first_year ) 
				+ me.margin+me.tiles_top_decal +calendar.time.getDay(d) * (me.cell_size + me.space_between_tiles);
		}

		// calcul X for hour / day chart
		var calculLabelMonthPosX = function(d,i){
			
			return me.margin+me.month_label_left_decal + (calendar.time.getWeek(d)) * (me.cell_size + me.space_between_tiles);
		}

		// calcul Y for hour / day chart
		var calculLabelMonthPosY = function(d,i){
			return year_height * year_index[d.getFullYear()] + me.margin;
		}

		// calcul X for hour / day chart
		var calculLabelYearPosX = function(d,i){
			return -me.year_label_top_decal-year_height * year_index[d.getFullYear()] //( d.getFullYear() - first_year );
		}

		// calcul Y for hour / day chart
		var calculLabelYearPosY = function(d,i){
			return +me.margin;
		}

		// calcul X for hour / day chart
		var calculLabelWeekPosX = function(d,i){

			return me.week_label_left_decal+ calendar.time.getWeek(d) * (me.cell_size+ me.space_between_tiles) + me.margin + me.tiles_left_decal; 
		}

		// calcul Y for hour / day chart
		var calculLabelWeekPosY = function(d,i){
			return me.week_label_top_decal+year_height * year_index[d.getFullYear()] //( d.getFullYear() - first_year ) 
				+ me.margin+me.tiles_top_decal +7 * (me.cell_size + me.space_between_tiles);
		}

		// mouai...
		var calculBBox = function(){
			var j = 0;
			return {
				width : 53 * (me.cell_size+ me.space_between_tiles) + me.tiles_left_decal + me.margin + 2*me.cell_size
				, height : me.margin+me.tiles_top_decal + 7 * (me.cell_size + me.space_between_tiles)
			}
		}

		function monthPath(t0) {
			var decal = year_height * year_index[t0.getFullYear()]//( t0.getFullYear() - first_year );
			var cell = (me.cell_size + me.space_between_tiles);
			var decaled_cell = (me.cell_size + me.space_between_tiles );

			var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
			  d0 = +calendar.time.getDay(t0), w0 = +calendar.time.getWeek(t0),
		      d1 = +calendar.time.getDay(t1), w1 = +calendar.time.getWeek(t1);
			return "M" + ((w0 + 1) * decaled_cell + me.tiles_left_decal+me.margin) + "," + (me.margin+d0 * cell + me.tiles_top_decal+decal)
			  + "H" + (w0 * decaled_cell +me.tiles_left_decal +me.margin)+ "V" + (me.margin+7 * cell+ me.tiles_top_decal+decal)
			  + "H" + (w1 * decaled_cell + me.tiles_left_decal+me.margin) + "V" + (me.margin+(d1 + 1) * cell+ me.tiles_top_decal+decal)
			  + "H" + ((w1 + 1) * decaled_cell + me.tiles_left_decal+me.margin) + "V" + (me.tiles_top_decal+me.margin+decal)
			  + "H" + ((w0 + 1) * decaled_cell + me.tiles_left_decal+me.margin) + "Z";
		}

		/******************************************************/
		// MONTH PATH
		/******************************************************/
		calendar.monthPathEnter(data_month,monthPath);

		/******************************************************/
		// TILES
		/******************************************************/
		//tiles select
		var tiles = calendar.svg.selectAll("."+calendar.tileClass)
				.data(data_year, function(d,i){ return i;} );
		
		// tiles enter		
		calendar.tilesEnter(tiles)
				.attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", me.cell_size+"px")
		    	.attr("height", me.cell_size+"px")
		    	
			     
		// tiles update
		calendar.tilesUpdate(tiles)
			.transition()
			// .duration(calendar.duration)
			.delay(function(d){
				return (calendar.time.getWeek(d) * 20) + (calendar.time.getDay(d) * 20) + (Math.random() * 50) / calendar.duration
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
		calendar.tilesExit(tiles);

		/******************************************************/
		// LABELS
		/******************************************************/
		//hours labels
		me.labels_months = calendar.svg.selectAll("."+me.month_label_class)
				.data(data_month, function(d,i){return i;});
		//hour labels enter
		calendar.labelEnter(me, me.labels_months.enter(), me.month_label_class)
			.attr("x", calculLabelMonthPosX ) 
		    .attr("y", calculLabelMonthPosY ) 
		    .on("mouseover", function (d, i) {
		     	calendar.eventManager.trigger("label:month:mouseover", d);
		    })
		    .on("mouseout", function (d, i) {
		    	calendar.eventManager.trigger("label:month:mouseout", d);
		    })
		    .on("click", function (d, i) {
		    	calendar.eventManager.trigger("label:month:click", d);
		    })
		    .text(me.month_label_format);

		//hour labels update
		Calendar.animation.fadeIn(me.labels_months.transition(), calendar.duration)
		    .attr("x", calculLabelMonthPosX ) 
		    .attr("y", calculLabelMonthPosY ) 
		    .text(me.month_label_format);

		//hour labels exit
		me.labels_months.exit().remove();
		// fadeOut(me.labels_months.exit().tra

		//hours labels
		me.label_year = calendar.svg.selectAll("."+me.year_label_class)
				.data(data_year_label, function(d,i){return i;});
		//hour labels enter
		calendar.labelEnter(me, me.label_year.enter(), me.year_label_class)
		    .attr("transform", "rotate(-90)")
		    .attr("x", calculLabelYearPosX ) 
		    .attr("y", calculLabelYearPosY ) 
		    .on("mouseover", function (d, i) {
		     	calendar.eventManager.trigger("label:year:mouseover", d);
		    })
		    .on("mouseout", function (d, i) {
		    	calendar.eventManager.trigger("label:year:mouseout", d);
		    })
		    .on("click", function (d, i) {
		    	calendar.eventManager.trigger("label:year:click", d);
		    })
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
				.data(data_week_label, function(d,i){return i;});
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
		Calendar.animation.fadeOut(me.label_year.transition(), calendar.duration);
		Calendar.animation.fadeOut(me.labels_months.transition(), calendar.duration);
		Calendar.animation.fadeOut(me.label_weeks.transition(), calendar.duration);
	}

	/******************************************************/
	// BOUNDS implementation
	/******************************************************/
	me.bounds = function(year){
		if(year instanceof Array && year.length > 0){
			if(year.length < 2){
				return {
					start : new Date(d3.min(year), 0, 1)
					, end : new Date(d3.min(year) + 1, 0, 1)
				}
			}
			else{
				return {
					start : new Date(d3.min(year), 0, 1)
					, end : new Date(d3.max(year) + 1, 0, 1)
				}
			}			
		}
		else{

			return {
				start : new Date(year, 0, 1)
				, end : new Date(year+1, 0, 1)
			}
		}
	}

	return me;
}