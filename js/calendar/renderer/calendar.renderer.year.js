if(!Calendar.renderer){
	Calendar.renderer = {};
}



Calendar.renderer.year = function(){
	var me = this;
	var args = arguments;
	function getArgs(arguments, data){
		var args = [];
		for(var i in arguments) {
			args.push(arguments[i]);
		}
		for(var i in data) {
			args.push(data[i]);
		}
		return args;
	}
	me.rendererId = "year";
	me.draw = function(year){
		var args = arguments;
		var calendar = this;
		

		var svg = calendar.svg;
		svg.attr("x", 100).attr("y", 100)
		var data = d3.time.days(new Date(parseInt(year), 0, 1), new Date(parseInt(year)+1, 0, 1)); 

		

		//tiles update
		var tiles = svg.selectAll(".tile")
				.data(data, function(d, i){ return i;})

		var width = 960,
		    height = 136,
		    cellSize = 16; // cell size

		var day = d3.time.format("%w"),
		    week = d3.time.format("%U"),
		    percent = d3.format(".1%"),
		    format = d3.time.format("%Y-%m-%d");
	
		    
		

		var day = function(d){
			var day = d.getDay();
			return ( day == 0) ? 6 : day - 1;
		}
		var week = function(d){
			var format = d3.time.format("%W");
			return parseInt(format(d));
		}

		tiles.enter()
			.insert("rect")
				.classed("tile", true)
				.attr("width", cellSize)
			    .attr("height", cellSize)
			    .attr("x", function(d) { return week(d) * (cellSize+ calendar.tilesWidthSpace); })
			    .attr("y", function(d) { return day(d) * (cellSize+ calendar.tilesWidthSpace); })
			
			    .attr("stroke-width", "2px")
				.attr("fill", "#fff")
			     

		tiles
			.transition()
			.duration(calendar.duration)
			// .delay(function(d){
			// 			return (day(d) * 20) + (week(d) * 20) + (Math.random() * 50)
			// 		})
			.attr("width", cellSize)
			    .attr("height", cellSize)
			    .attr("x", function(d) { return week(d) * (cellSize+ calendar.tilesWidthSpace); })
			    .attr("y", function(d) { return day(d) * (cellSize+ calendar.tilesWidthSpace); })
			
			    .attr("stroke-width", "2px")
				.attr("fill", function(d){
				var val = calendar.retreiveValueCallback.apply(this, getArgs(args, [week(d), day(d)]));
					return calendar.getColor(val);
				});
			     
			    
		tiles.exit().transition().duration(calendar.duration)
		.attr("fill-opacity", 0)
		.remove()
		// day label
		var labels = svg.selectAll(".label")
				.data(label, function(d){ return d.name});

		labels.enter()
			.append("text")
			.classed("label", true)
			.attr("font-size", "14px")
			.attr("id", function(d){
				return "label_"+d.id
			})
			.attr("x", 0)
			.attr("y", function(d){ 
			    	return calendar.labelHeightDecal+d.id * (calendar.tilesHeight + calendar.tilesHeightSpace) })

		labels
			.transition()
			.duration(calendar.duration)
			.ease("exp")
			.attr("fill-opacity", 1)
			.attr("id", function(d){
				return "label_"+d.id
			})
			
			.text(function(d){
				return d.name;
			})
		// labels exit
		labels.exit()
			.transition().duration(calendar.duration).attr("fill-opacity", 0)
			.remove();

		function monthPath(t0) {
			var cell = (cellSize+ calendar.tilesWidthSpace)
		  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
		      d0 = +day(t0), w0 = +week(t0),
		      d1 = +day(t1), w1 = +week(t1);
		  return "M" + (w0 + 1) * cell + "," + d0 * cell
		      + "H" + w0 * cell + "V" + 7 * cell
		      + "H" + w1 * cell + "V" + (d1 + 1) * cell
		      + "H" + (w1 + 1) * cell + "V" + 0
		      + "H" + (w0 + 1) * cell + "Z";
		}
		var months = svg.selectAll(".month")
		    .data(d3.time.months(new Date(parseInt(year), 0, 1), new Date(parseInt(year)+1, 0, 1)))
		
		months.enter()
			.append("path")
		    .attr("class", "month")
		    .attr("stroke-width", "2px")
		    .attr("stroke", "#FFF")
		    .attr("fill-opacity", 0)
		    .attr("d", monthPath);

		months.transition().duration(calendar.duration).attr("stroke", "#000")
			.attr("d", monthPath);
		// tiles enter	

			
	}

	me.clean = function(){
		var calendar = this;
		
		var svg = calendar.svg;
		svg.selectAll(".month")
		    .data([])
		    .exit()
			// .transition().duration(calendar.duration).attr("fill-opacity", 0)
			.remove();


		
	}
	return me;
}