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

/**********************************************************/
// Calendar
/**********************************************************/
var Calendar = {
	
	/******************************************************/
	// INIT
	/******************************************************/
	init : function(spec){
		// self ref
		var me = this;

		me.height = spec.height || 600;
		me.width = spec.width || 800;
		me.margin = spec.margin

		//retreive data according to your createTiles call
		me.retreiveDataCallback = spec.retreiveDataCallback;
		//retreive data bound callback
		me.retreiveCalcsCallback = spec.retreiveCalcsCallback;
		// retreive 
		me.retreiveValueCallback = spec.retreiveValueCallback;

		// color scheme
	 	me.buckets = spec.buckets || 9,
		me.colorScheme = spec.colorSchema || 'RdYlGn',
		me.colorSchemeInverse = spec.colorSchemeInverse || false
		me.noDataColor = spec.noDataColor || "#eee";

		// Dom balise settings
		me.visId = spec.visId || '#vis';
		me.legendId = spec.legendId || '#legend';
		me.tileClass = spec.tileClass || 'tile';

		// type of calendar displayed
		me.period = spec.period ||  'week';

		// animation duration
		me.duration = spec.duration || 800;

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

		
		me.svg = d3.select(me.visId)
				.append('svg:svg')

				.attr("width", me.width)
				.attr("height", me.height)
				.append('svg:g')
				.attr("transform", "translate(" + 0 + "," + 0+ ")");
		me.createLegend();
		
	
		return me;
	}

	/* ************************** */

	, createTiles : function(){
		console.log(arguments)
		// self reference 
		var me = this;

		if(me.retreiveDataCallback != null 
			&& typeof me.retreiveDataCallback  == "function" ){

			me.retreiveDataCallback.apply(me, arguments)
		}
		else{
			me._createTiles.apply(me, arguments);
		}
		
	}
	, draw : function(){
		this._createTiles.apply(this, arguments);
	}

	, _createTiles : function () {

		// self reference 
		var me = this;

		var args = arguments;

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
				var calendar = new Calendar.renderer.week();
				break;
		}
		me.current_calendar = calendar;
		var bbox = calendar.draw.apply(this, arguments);

		if(bbox && bbox.width){
			// adjust width
			// scale down
			var scale,decal = 0
			if(bbox.width > me.width){
				scale = me.width / bbox.width ;
			}
			// scale 1 and center
			else{
				scale = 1;
				decal = (me.width - bbox.width) / 2;
			}
			me.svg
			.transition()
			.duration(me.duration)
			.attr("transform", "translate(" + decal + "," + 0 + ")"+"scale("+scale+")");
		}
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

	, setLegend : function(bounds) {
		var check = function(a){ return (a) ? a : ""; }
		var me = this;
		if(bounds){
			d3.select('#legend .less').text(check(bounds.min));
			d3.select('#legend .more').text(check(bounds.max));
		}
		else{
			d3.select('#legend .less').text(me.downBound);
			d3.select('#legend .more').text(me.upBound);
		}
	}

	, setBucket : function(bounds){
		
		var me = this;
		var range = [];
		for (var i = 0; i < me.buckets; i++) {
			range.push(i);
		}	
		if(bounds){
			me.bucket = d3.scale.quantize().domain([bounds.min, bounds.max]).range(range)
		}
		else{
			me.bucket = d3.scale.quantize().domain([me.downBound, me.upBound]).range(range)
		}
	}

	/* ************************** */

	 , setPeriod : function(start, end) {
	 	var me = this;
	 	var format = d3.time.format("%c");
	 	d3.select('#period .start').text(format(start));
	 	d3.select('#period .end').text(format(end));
	 }
}