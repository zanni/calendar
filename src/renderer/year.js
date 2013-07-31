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
Calendar.renderer.year = function(){

	// renderer self ref
	var me = this;

	// store labels in order to clean
	me.labels_months;
	me.label_year;

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

		// color tiles depending on val
		var colorize = function(d, i, u){
			var val = calendar.retreiveValueCallback(data, d.getFullYear(), calendar.time.getWeek(d),calendar.time.getDay(d));
			return calendar.getColor(val);
		}

		
		/******************************************************/
		var data_year;
		var data_year_label;
		var data_month;
		var first_year;
		var year_index = [];
		if(year instanceof Array){
			data_year = [];
			data_year_label = [];
			data_month = [];
			year.sort(function(a,b){ return a - b});
			
			var j = 0;
			for(var i in year){
				year_index[year[i]] = j++; 
				if(!first_year) first_year = year[i];
				data_year = data_year.concat(getPeriod(year[i], d3.time.days))
				data_year_label.push(new Date(year[i], 1, 1));
				data_month = data_month.concat(getPeriod(year[i], d3.time.months));
			}
		}
		else{
			first_year = year;
			year_index[year] = 0;
			data_year = getPeriod(year, d3.time.days);
			data_year_label = [new Date(year, 0, 1)];
			data_month = getPeriod(year, d3.time.months);
		}

		/******************************************************/
		// tiles / labels initialization helpers
		/******************************************************/
		var cell_size = 36;
		var margin = 20;
		var space_between_tiles = 2;
		
		var space_between_years = cell_size*2;
		var month_label_left_decal = 80;
		var year_label_top_decal = 146;
		var tiles_top_decal = 15;
		var tiles_left_decal = 20;
		var label_fill = "darkgray";
		var label_fontsize = "22px";
		var month_label_class = "month_label";
		var month_label_format = d3.time.format("%B");
		var year_label_class = "year_label";
		var year_label_format = d3.time.format("%Y");

		var year_height = 7 * cell_size + margin+tiles_top_decal +space_between_years;
		
		var initLabel = function(transform, klass){
			return transform.append("text")
						.classed(klass, true)
						.attr("fill", label_fill)
						.attr("font-size", label_fontsize);
		}
		// calcul X for hour / day chart
		var calculTilePosX = function(d,i){
			return calendar.time.getWeek(d) * (cell_size+ space_between_tiles) + margin + tiles_left_decal; 
		}

		var calculTilePosY = function(d,i){
			return year_height * year_index[d.getFullYear()] //( d.getFullYear() - first_year ) 
				+ margin+tiles_top_decal +calendar.time.getDay(d) * (cell_size + space_between_tiles);
		}

		// calcul X for hour / day chart
		var calculLabelYearPosX = function(d,i){
			return -year_label_top_decal-year_height * year_index[d.getFullYear()] //( d.getFullYear() - first_year );
		}

		// calcul Y for hour / day chart
		var calculLabelYearPosY = function(d,i){
			return +margin;
		}

		// mouai...
		var calculBBox = function(){
			var j = 0;
			return {
				width : 53 * (cell_size+ space_between_tiles) + tiles_left_decal + margin + 2*cell_size
				, height : margin+tiles_top_decal + 7 * (cell_size + space_between_tiles)
			}
		}

		function monthPath(t0) {
			var decal = year_height * year_index[t0.getFullYear()]//( t0.getFullYear() - first_year );
			var cell = (cell_size + space_between_tiles);
			var decaled_cell = (cell_size + space_between_tiles );

			var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
			  d0 = +calendar.time.getDay(t0), w0 = +calendar.time.getWeek(t0),
		      d1 = +calendar.time.getDay(t1), w1 = +calendar.time.getWeek(t1);
			return "M" + ((w0 + 1) * decaled_cell + tiles_left_decal+margin) + "," + (margin+d0 * cell + tiles_top_decal+decal)
			  + "H" + (w0 * decaled_cell +tiles_left_decal +margin)+ "V" + (margin+7 * cell+ tiles_top_decal+decal)
			  + "H" + (w1 * decaled_cell + tiles_left_decal+margin) + "V" + (margin+(d1 + 1) * cell+ tiles_top_decal+decal)
			  + "H" + ((w1 + 1) * decaled_cell + tiles_left_decal+margin) + "V" + (tiles_top_decal+margin+decal)
			  + "H" + ((w0 + 1) * decaled_cell + tiles_left_decal+margin) + "Z";
		}

		/******************************************************/
		// TILES
		/******************************************************/
		//tiles select
		var tiles = calendar.svg.selectAll("."+calendar.tileClass)
				.data(data_year);
		
		// tiles enter		
		calendar.tilesEnter(tiles)
				.attr("x", calculTilePosX)
	    		.attr("y", calculTilePosY)
			    .attr("width", cell_size+"px")
		    	.attr("height", cell_size+"px")
			     
		// tiles update
		tiles
			.transition()
			// .duration(calendar.duration)
			.delay(function(d){
				return (calendar.time.getWeek(d) * 20) + (calendar.time.getDay(d) * 20) + (Math.random() * 50) / calendar.duration
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
		calendar.monthPathEnter(data_month,monthPath);

		/******************************************************/
		// LABELS
		/******************************************************/
		//hours labels
		me.label_year = calendar.svg.selectAll("."+year_label_class)
				.data(data_year_label);
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
		Calendar.animation.fadeOut(me.label_year.transition(), calendar.duration);
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