// Fix map for IE
if (!('map' in Array.prototype)) { 
  Array.prototype.map = function (mapper, that /*opt*/) { 
    var other = new Array(this.length); 
    for (var i = 0, n = this.length; i < n; i++) 
      if (i in this) 
        other[i] = mapper.call(that, this[i], i, this); 
    return other; 
  }; 
};

/* ************************** */

function formatDay(d){
	if(d < 10){ d = "0" + d;}
	return d;
}

/* ************************** */

function formatMonth(m){
	m++;
	if(m < 10){ m = "0" + m;}
	return m;
}

/* ************************** */

function formatDate(date){
	return date.getFullYear()
		+ "-"
		+ formatMonth(date.getMonth())
		+ "-"
		+ formatDay(date.getDate());
}

/* ************************** */

var Calendar = {
	
	/* ************************** */
		
	init : function(spec, exists){
		var me = this;
			//retreive data bound callback
			me.retreiveCalcsCallback = spec.retreiveCalcsCallback;
			// retreive 
			me.retreiveValueCallback = spec.retreiveValueCallback;
		 	me.buckets = spec.buckets || 9,
			me.colorScheme = spec.colorSchema || 'RdYlGn',
			me.colorSchemeInverse = spec.colorSchemeInverse || false
			me.days = Calendar.i18n.days;
			me.hours = Calendar.i18n.hours;
			me.visId = spec.visId || '#vis';
			me.legendId = spec.legendId || '#legend';
			me.period = spec.period ||  'week';

			me.tilesWidth = spec.tilesWidth || 36;
			me.tilesHeight = spec.tilesHeight || 36;
			me.tilesWidthSpace = spec.tilesWidthSpace || 2;
			me.tilesHeightSpace = spec.tilesHeightSpace || 4;
			me.duration = spec.duration || 500;
			me.labelSpace = spec.labelSpace || 60; 
			me.labelHeightDecal = spec.labelHeightDecal || 24;




			me.getColor = function(index){
				var i = (me.colorSchemeInverse) ? me.buckets - index - 1 : index;
//				return 'q' + i + '-' + me.buckets;
				return i;
			}

			
			
		

		d3.select(me.legendId).classed(me.colorScheme, true);
		d3.select(me.visId).classed(me.colorScheme, true);

		if(!exists){
			me.createTiles();
			me.createLegend();
		}
		

		// me.reColorTiles();

		/* ************************** */
		
		// tiles mouseover events
		// $('#tiles td').hover(function() {
		
		// 	$(this).addClass('sel');
			
		// 	var tmp = $(this).attr('id').split('d').join('').split('h'),
		// 		day = parseInt(tmp[0]),
		// 		hour = parseInt(tmp[1]);
			
		
		// }, function() {
			
		// 	$(this).removeClass('sel');
			
		// });
		
		return me;
	}

	/* ************************** */

	, createTiles : function () {

		// self reference 
		var me = this;

		// OLD html code
		// var html = '<table id="tiles" class="front">';
		// html += '<tr><th><div>&nbsp;</div></th>';
		// for (var h = 0; h < me.hours.length; h++) {
		// 	html += '<th class="h' + h + '">' + me.hours[h] + '</th>';
		// }
		// html += '</tr>';
		// // OLD table generation
		// for (var d = 0; d < me.days.length; d++) {
		// 	html += '<tr class="d' + d + '">';
		// 	html += '<th id="days_'+d+'"></th>';
		// 	for (var h = 0; h < me.hours.length; h++) {
		// 		html += '<td id="d' + d + 'h' + h + '" class="d' + d + ' h' + h + '"><div class="tile"><div class="face front"></div><div class="face back"></div></div></td>';
		// 	}
		// 	html += '</tr>';
		// }
		// html += '</table>';
		// d3.select('#vis').html(html);


		var vis = d3.select('#vis');
		var data = [];
		var label = [];
		switch(me.period){
			case 'day':
				break;
			case 'week':
				// create a 24*7 matrice
				for (var d = 0; d < me.days.length; d++) {
					label.push({
						day: d, name: me.days[d]
					})
					for(var h=0; h < me.hours.length; h++){
						data.push({
							day:d, hour:h
						});
					}
				}
				var svg = vis.append('svg:svg')
					.attr("width", me.labelSpace+(me.hours.length)*(me.tilesWidth + me.tilesWidthSpace))
					.attr("height", (me.days.length)*(me.tilesHeight + me.tilesHeightSpace));

				svg.selectAll(".tile")
						.data(data)
						.enter()
						.append("rect")
						    .attr("width", me.tilesWidth+"px")
						    .attr("height", me.tilesHeight+"px")
						    .attr("stroke-width", "2px")
						    .attr("x", function(d){ 
						    	return me.labelSpace+d.hour * (me.tilesWidth + me.tilesWidthSpace) })
						    .attr("y", function(d){ 
						    	return d.day * (me.tilesHeight + me.tilesHeightSpace) })
						    .attr("id", function(d){
						    	return "svg_tile_"+d.day+"_"+d.hour;
						    })
						    .attr("fill", "#eee")

				svg.selectAll(".day_label")
						.data(label)
						.enter()
						.append("text")
						.attr("font-size", "14px")
						.attr("id", function(d){
							return "day_label_"+d.day
						})
						.attr("y", function(d){ 
						    	return me.labelHeightDecal+d.day * (me.tilesHeight + me.tilesHeightSpace) })
						.text(function(d){
							return d.name.abbr;
						})
						


				break;
			case 'month':
				break;
			case 'year':
				break;
			default:
				break;
		}
	}

	/* ************************** */

	, createLegend : function() {
		var me = this;
		var html = "";
		for (var i = 0; i < me.buckets; i++) {
			
			html += "<li style='background:"+colorbrewer[me.colorScheme][me.buckets][me.getColor(i)]+"'></li>";
		}
		d3.select('#legend ul').html(html);
	}
	
	/* ************************** */

	, emptyLegend : function() {
		d3.select('#legend ul').html("");
	}
	

	/* ************************** */

	, setLegend : function(min, max) {
		
		d3.select('#legend .less').text(min);
		d3.select('#legend .more').text(max);
	}

	/* ************************** */

	 , setPeriod : function(period) {
		
		 
		 
	 	var me = this;
	 		 	 
	 	 
	 	 
	 	for (var d = 0; d < me.days.length; d++) {
	 		var date = new Date();
	 		date.setTime(period.start.getTime() + d * 24 * 60 * 60 * 1000);
	 		d3.select('#days_'+d).text(
	 			me.days[d].abbr + " " + formatDay	(date.getDate()) + "/" + formatMonth(date.getMonth())
	 		);
	 	}
	 	d3.select('#period .start').text(formatDate(period.start));
	 	d3.select('#period .end').text(formatDate(period.end));
	 }

	/* ************************** */

	// , flipTiles : function () {

	// 	var me = this;
	// 	var oldSide = d3.select('#tiles').attr('class'),
	// 		newSide = '';
		
	// 	if (oldSide == 'front') {
	// 		newSide = 'back';
	// 	} else {
	// 		newSide = 'front';
	// 	}
		
	// 	var flipper = function(h, d, side) {
	// 		return function() {
	// 			var sel = '#d' + d + 'h' + h + ' .tile',
	// 				rotateY = 'rotateY(180deg)';
				
	// 			if (oldSide === 'back') {
	// 				rotateY = 'rotateY(0deg)';	
	// 			}
	// 			if ( BrowserDetect && BrowserDetect.browser === 'Safari' || BrowserDetect.browser === 'Chrome') {
	// 				d3.select(sel).style('-webkit-transform', rotateY);
	// 			} else {
	// 				d3.select(sel).select('.' + oldSide).classed('hidden', true);
	// 				d3.select(sel).select('.' + newSide).classed('hidden', false);
	// 			}
	// 			d3.select(sel).select('.' + oldSide).classed('hidden', true);
	// 			d3.select(sel).select('.' + newSide).classed('hidden', false);
	// 		};
	// 	};
	// 	var side = d3.select('#tiles').attr('class');
		
	// 	for (var h = 0; h < me.hours.length; h++) {
	// 		for (var d = 0; d < me.days.length; d++) {
				
	// 			setTimeout(flipper(h, d, side), (h * 20) + (d * 20) + (Math.random() * 100));
	// 		}
	// 	}
	// 	d3.select('#tiles').attr('class', newSide);
	// }

	, reColorTiles : function () {
		function getArgs(arguments, d, h){
			var args = [];
			args.push(arguments[0]);
			args.push(arguments[1]); 
			args.push(d); 
			args.push(h); 
			for(var i =2 ;i < arguments.length; i++){
				args.push(arguments[i]);
			}
			return args;
		}
		
		
		var me = this;


		me.emptyLegend();
		me.createLegend();
		
		
		var calcs = me.retreiveCalcsCallback.apply(this, arguments);

		var range = [];
		for (var i = 0; i < me.buckets; i++) {
			range.push(i);
		}		
		
		if(calcs){
			//fu representation dependent code, SHOULD not be here !!!
			var year = arguments[0];
			var week = arguments[1];
			var date = new Date(year, 0, 0);
			date.setTime(date.getTime() + ( (week-1)  * (7) ) * ( 24 * 60 * 60 * 1000 ) - 1);
			var end = new Date();

			end.setTime(date.getTime() + 5 * 24 * 60 * 60 * 1000);
			// me.setPeriod({start:date, end:end });
			//end fu		

			if(calcs.start && calcs.end){
				me.setPeriod({start:calcs.start, end:calcs.end });
				for(var i=0; i<7; i++){
				d3.select("#day_label_"+i)
					.transition()
					.duration(me.duration)
					.text(function(d){
						var day = new Date()
						day.setTime(calcs.start.getTime()+i*(24*60*60*1000))
						var month = day.getMonth()+1;

						if(month.length < 10){
							month = "0"+month.toString();
						}
						return me.days[i].abbr+" "+day.getDate()+"/"+month;
					})
				}
			}

			var start = date;

			

			me.setLegend(calcs.min, calcs.max);
			var bucket = d3.scale.quantize().domain([calcs.min, calcs.max]).range(range)
			// , side = d3.select('#tiles').attr('class');
		}
		
		

		// if (side == 'front') {
		// 	side = 'back';
		// } else {
		// 	side = 'front';
		// }		

		for (var d = 0; d < me.days.length; d++) {
							
			for (var h = 0; h < me.hours.length; h++) {
				// var sel = '#d' + d + 'h' + h + ' .tile .' + side;
				// var front = '#d' + d + 'h' + h + ' .tile .front';
				// var back = '#d' + d + 'h' + h + ' .tile .back';
				// retreive value for this specific hour
				var val = me.retreiveValueCallback.apply(this, getArgs(arguments, d, h));

				// erase all previous bucket designations on this cell
				// for (var i = 0; i <= me.buckets; i++) {
				// 	var cls = 'q' + i + '-' + me.buckets;
				// 	d3.select(sel).attr("style" , "");
				// }
				
				// set new bucket designation for this cell
				// var cls = 'q' + + '-' + me.buckets;
				var color = "#eee";
				if(val != undefined && val !=0 ) {
//					d3.select(sel).classed(me.getColor((val > 0 ? bucket(val) : 0) ), true);
					// d3.select(sel).attr("style", "background:"+colorbrewer[me.colorScheme][me.buckets][me.getColor((val > 0 ? bucket(val) : 0) )]);


					// SVG style
					color = colorbrewer[me.colorScheme][me.buckets][me.getColor((val > 0 ? bucket(val) : "#eee"))];
				}

				var svg_sel = "#svg_tile_"+d+"_"+h;
					d3.select(svg_sel)
						.transition()
						.duration(me.duration + (h * 40) + (d * 40) + (Math.random() * 100))
						.attr("fill", color );
				
				
			}

		}
		// me.flipTiles();
		
	}
}