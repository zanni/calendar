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
		year = parseInt(year);
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
				new Date(parseInt(y), 0, 0)
				, new Date(parseInt(y), 11, 31)
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
			// if(faked) return calendar.getColor();
			var val = calendar.retreiveValueCallback(year, week(d), day(d));
			console.log(val)
			if(val == null)console.log( week(d) +" - "+ day(d));
			return calendar.getColor(val);
		}

		

		/******************************************************/
		// Retreive period bounds (val, time)
		// Adjust time to first day (if their is no data)
		/******************************************************/
		var bounds = calendar.retreiveCalcsCallback(year);
		calendar.setBucket(bounds);
		calendar.setLegend(bounds);
		calendar.setPeriod(new Date(year, 0, 0), new Date((year+1), 0, 0))

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
		var label_fontsize = "22px";
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
			return week(d) * (cell_size+ calendar.tilesWidthSpace) + margin + tiles_left_decal; 
		}

		var calculTilePosY = function(d,i){
			return margin+tiles_top_decal + day(d) * (cell_size + space_between_tiles);
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
			return {
				width : 53 * (cell_size+ calendar.tilesWidthSpace) + tiles_left_decal + margin + 5
				, height : margin+tiles_top_decal + 7 * (cell_size + space_between_tiles)
			}
		}

		function monthPath(t0) {

			var cell = (cell_size + space_between_tiles);
			var decaled_cell = (cell_size + space_between_tiles );

			var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
			  d0 = +day(t0), w0 = +week(t0),
		      d1 = +day(t1), w1 = +week(t1);
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
		var tiles = svg.selectAll(".tile")
				.data(getPeriod(year, d3.time.days));
		
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
		tiles.exit()
		// .transition().duration(calendar.duration)
		// .attr("fill-opacity", 0)
		.remove()

		/******************************************************/
		// MONTH PATH
		/******************************************************/
		me.months_path = svg.selectAll(".month")
		    .data(getPeriod(year, d3.time.months), function(d,i){return i;})
		
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
				.data(getPeriod(year, d3.time.years));
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