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

function formatPeriodDate(date){
	return date.getFullYear()
		+ "-"
		+ formatMonth(date.getMonth())
		+ "-"
		+ formatDay(date.getDate());
}


/**********************************************************/
// Calendar
/**********************************************************/
var Calendar = {
	
	/******************************************************/
	// INIT
	/******************************************************/
	init : function(spec, exists){
		// self ref
		var me = this;

		me.height = spec.height || 800;
		me.width = spec.width || 1200;
		me.margin = spec.margin

		//retreive data bound callback
		me.retreiveCalcsCallback = spec.retreiveCalcsCallback;
		// retreive 
		me.retreiveValueCallback = spec.retreiveValueCallback;

		// color scheme
	 	me.buckets = spec.buckets || 9,
		me.colorScheme = spec.colorSchema || 'RdYlGn',
		me.colorSchemeInverse = spec.colorSchemeInverse || false
		me.noDataColor = spec.noDataColor || "#eee";

		// label i18n
		me.days = Calendar.i18n.days;
		me.hours = Calendar.i18n.hours;

		// Dom balise settings
		me.visId = spec.visId || '#vis';
		me.legendId = spec.legendId || '#legend';

		// type of calendar displayed
		me.period = spec.period ||  'week';

		// animation duration
		me.duration = spec.duration || 800;

		// calendar dispay settings, should depend on period 
		// WEEK ORIENTED
		me.tilesWidth = spec.tilesWidth || 36;
		me.tilesHeight = spec.tilesHeight || 36;
		me.tilesWidthSpace = spec.tilesWidthSpace || 2;
		me.tilesHeightSpace = spec.tilesHeightSpace || 4;
		me.labelSpace = spec.labelSpace || 60; 
		me.labelHeightDecal = spec.labelHeightDecal || 24;
		// DAY ORIENTED
		me.dayWidthDecal = spec.dayWidthDecal || 20;

		// arrays representing tiles and label
		// data must be a 2 dim matrix
		me.data = [];
		me.label = [];

		me.upBound = spec.upBound || 80;
		me.downBound = spec.downBound || 20;

		var range = [];
		for (var i = 0; i < me.buckets; i++) {
			range.push(i);
		}	
		// var bucket = d3.scale.quantize().domain([calcs.min, calcs.max]).range(range)
		me.bucket = d3.scale.quantize().domain([20, 80]).range(range)

		// get tile color depending on inverse setting
		me.getColorScheme = function (index){
			return (me.colorSchemeInverse) ? me.buckets - index - 1 : index;
		}
		me.getColor = function(val){
			var color = me.noDataColor;
			if(val != undefined && val !=0 ) {
				color = colorbrewer[me.colorScheme][me.buckets][me.getColorScheme((val > 0 ? me.bucket(val) : me.noDataColor))];
			}
			return color;
		}

		// add css classes to activate color scheme on both calendar and legend
		d3.select(me.legendId).classed(me.colorScheme, true);
		d3.select(me.visId).classed(me.colorScheme, true);

		// recreate dom only on first initialization
		if(!exists){
			me.svg = d3.select(me.visId)
					.append('svg:svg')

					.attr("width", me.width)
					.attr("height", me.height)
					.append('svg:g')
					.attr("transform", "translate(" + 10 + "," + 10+ ")");
			// me.createTiles();
			me.createLegend();
		}
	
		return me;
	}

	/* ************************** */

	, createTiles : function () {

		// self reference 
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

		// var calcs = me.retreiveCalcsCallback.apply(this, arguments);		
		
		data = [];
		label = [];
		if(me.current_calendar 
			&& me.current_calendar.clean
			&& me.current_calendar.rendererId != me.period)
			me.current_calendar.clean.apply(this, arguments);
		switch(me.period){
			case 'day':
				var calendar = new Calendar.renderer.day();
				break;
			case 'week':
				var calendar = new Calendar.renderer.week();
				break;
			case 'month':
				var calendar = new Calendar.renderer.month();
				break;
			case 'year':
				var calendar = new Calendar.renderer.year();
				break;
			default:
				break;
		}
		me.current_calendar = calendar;
		calendar.draw.apply(this, arguments);

		// if(callback) callback();

		me.data =  data;
		me.label =  label;
	}

	/* ************************** */

	, createLegend : function() {
		var me = this;
		var html = "";
		for (var i = 0; i < me.buckets; i++) {
			
			html += "<li style='background:"+ colorbrewer[me.colorScheme][me.buckets][me.getColorScheme(i)] +"'></li>";
		}
		d3.select('#legend ul').html(html);
		me.setLegend();
	}
	
	/* ************************** */

	, emptyLegend : function() {
		d3.select('#legend ul').html("");
	}
	

	/* ************************** */

	, setLegend : function() {
		var me = this;
		d3.select('#legend .less').text(me.downBound);
		d3.select('#legend .more').text(me.upBound);
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
	 	d3.select('#period .start').text(formatPeriodDate(period.start));
	 	d3.select('#period .end').text(formatPeriodDate(period.end));
	 }
}