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
Calendar.renderer.year = function(){

	// renderer self ref
	var me = this;

	// store labels in order to clean
	me.labels_months;
	me.label_year;

	// cache bounds
	me.cache_bounds = {};

	/******************************************************/
	// renderer unic id
	/******************************************************/
	me.rendererId = "year";

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
	me.draw = function(year){
		// year = parseInt(year);
		// year = [2012, 2013];
		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
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
		var colorize = function(d, i, u){
			
			// if(faked) return calendar.getColor();
			var val = calendar.retreiveValueCallback(d.getFullYear(), week(d), day(d));
			return calendar.getColor(val);
		}

		

		/******************************************************/
		// Retreive period bounds (val, time)
		// Adjust time to first day (if their is no data)
		/******************************************************/
		var data_year;
		var data_year_label;
		var data_month;
		var first_year;
		var bounds;
		var year_index = [];
		if(year instanceof Array){
			data_year = [];
			data_year_label = [];
			data_month = [];
			bounds = [];
			year.sort(function(a,b){ return a - b});
			
			var j = 0;
			for(var i in year){
				year_index[year[i]] = j++; 
				if(!first_year) first_year = year[i];
				data_year = data_year.concat(getPeriod(year[i], d3.time.days))
				data_year_label.push(new Date(year[i], 1, 1));
				data_month = data_month.concat(getPeriod(year[i], d3.time.months));
			}
			if(!me.cache_bounds[year]){
				for(var d in data_year){
					var bound = calendar.retreiveCalcsCallback(data_year[d].getFullYear(), week(data_year[d]), day(data_year[d]))
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
					}
				})
				bounds = {
					'min': d3.round(d3.min(min), 2)
					, 'max': d3.round(d3.max(max), 2)
					, 'mean': d3.round(d3.mean(mean), 2)
					, 'median': d3.round(d3.median(median), 2)
					, 'start': new Date(first_year, 0, 1)
				};
				me.cache_bounds[year] = bounds;
			}
			else{
				bounds = me.cache_bounds[year];
			}
			
			console.log(bounds)
		}
		else{
			year_index[year] = 0;
			first_year = year;
			data_year = getPeriod(year, d3.time.days);
			data_year_label = [new Date(year, 0, 1)];
			data_month = getPeriod(year, d3.time.months);
			bounds = calendar.retreiveCalcsCallback(year);
			calendar.setPeriod(new Date(year, 0, 0), new Date((year+1), 0, 0))
		}

		calendar.setBucket(bounds);
		calendar.setLegend(bounds);

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
			return week(d) * (cell_size+ space_between_tiles) + margin + tiles_left_decal; 
		}

		var calculTilePosY = function(d,i){
			return year_height * year_index[d.getFullYear()] //( d.getFullYear() - first_year ) 
				+ margin+tiles_top_decal + day(d) * (cell_size + space_between_tiles);
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
			console.log(decal)
			var cell = (cell_size + space_between_tiles);
			var decaled_cell = (cell_size + space_between_tiles );

			var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
			  d0 = +day(t0), w0 = +week(t0),
		      d1 = +day(t1), w1 = +week(t1);
			return "M" + ((w0 + 1) * decaled_cell + tiles_left_decal+margin) + "," + (margin+d0 * cell + tiles_top_decal+decal)
			  + "H" + (w0 * decaled_cell +tiles_left_decal +margin)+ "V" + (margin+7 * cell+ tiles_top_decal+decal)
			  + "H" + (w1 * decaled_cell + tiles_left_decal+margin) + "V" + (margin+(d1 + 1) * cell+ tiles_top_decal+decal)
			  + "H" + ((w1 + 1) * decaled_cell + tiles_left_decal+margin) + "V" + (tiles_top_decal+margin+decal)
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
				.data(data_year);
		
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
				return (week(d) * 20) + (d.getDay() * 20) + (Math.random() * 50) / calendar.duration
			})
		    .attr("x", calculTilePosX)
	    	.attr("y", calculTilePosY)
		    .attr("fill-opacity", 1)
		    .attr("width", cell_size+"px")
		    .attr("height", cell_size+"px")
		    .attr("fill", colorize);
			    
		// tiles exit
		tiles.exit()
		// .transition().duration(calendar.duration)
		// .attr("fill-opacity", 0)
		.remove()

		/******************************************************/
		// MONTH PATH
		/******************************************************/
		me.months_path = svg.selectAll(".month")
		    .data(data_month, function(d,i){return i;})
		
		me.months_path.enter()
			.append("path")
		    .attr("class", "month")
		    .attr("stroke-width", "2px")
		    .attr("stroke", "#FFF")
		    .attr("fill-opacity", 0)
		    .attr("stroke-opacity", 1)
		    .attr("d", monthPath)

		me.months_path.transition().duration(calendar.duration).attr("stroke", "#000")
			.attr("stroke", "#000")
		    .attr("d", monthPath)

		me.months_path.exit().remove()
		// fadeOut(me.months_path.exit().transition(), calendar.duration);
		/******************************************************/
		// LABELS
		/******************************************************/
		
		// //hours labels
		// me.labels_months = svg.selectAll("."+month_label_class)
		// 		.data(data_month);
		// //hour labels enter
		// initLabel(me.labels_months.enter(), month_label_class)
		// 	.attr("x", calculLabelMonthPosX ) 
		//     .attr("y", calculLabelMonthPosY ) 
		//     .text(month_label_format);

		// //hour labels update
		// fadeIn(me.labels_months.transition(), calendar.duration)
		//     .attr("x", calculLabelMonthPosX ) 
		//     .attr("y", calculLabelMonthPosY ) 
		//     .text(month_label_format);

		// //hour labels exit
		// me.labels_months.exit().remove();
		// // fadeOut(me.labels_months.exit().transition(), calendar.duration);
		
		//hours labels
		me.label_year = svg.selectAll("."+year_label_class)
				.data(data_year_label);
		//hour labels enter
		initLabel(me.label_year.enter(), year_label_class)
		    .attr("transform", "rotate(-90)")
		    .attr("x", calculLabelYearPosX ) 
		    .attr("y", calculLabelYearPosY ) 
    		.style("text-anchor", "middle")
		    .text(year_label_format);

		//hour labels update
		fadeIn(me.label_year.transition(), calendar.duration)
		    .attr("x", calculLabelYearPosX ) 
		    .attr("y", calculLabelYearPosY ) 
		    .text(year_label_format);

		//hour labels exit
		fadeOut(me.label_year.exit().transition(), calendar.duration);

		
		return calculBBox();
		
	}

	/******************************************************/
	// CLEAN implementation
	/******************************************************/
	me.clean = function(){
		var calendar = this;	
		me.months_path
		    .data([])
		    .exit()
			// .transition().duration(calendar.duration).attr("fill-opacity", 0)
			.remove();
		// fadeOut(me.labels_months.transition(), calendar.duration);
		fadeOut(me.label_year.transition(), calendar.duration);
	}

	return me;
}