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
// Calendar CONSTRUCTOR
/**********************************************************/
var Calendar = function(spec){
	/******************************************************/
	// INIT
	/******************************************************/
	// self ref
	var me = this;

	me.height = spec.height || 600;
	me.width = spec.width || 800;
	me.margin = spec.margin

	//retreive data according to your createTiles call
	me.retreiveDataCallback = spec.retreiveDataCallback;

	// retreive 
	me.retreiveValueCallback = spec.retreiveValueCallback;

	// color scheme
	me.colorScheme = spec.colorScheme 
		|| ["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"];

	me.noDataColor = spec.noDataColor || "#eee";
	me.buckets = me.colorScheme.length;

	// Dom balise settings
	me.visId = spec.visId || '#vis';
	me.legendId = spec.legendId || '#legend';
	me.tileClass = spec.tileClass || 'tile';
	me.monthPathClass = spec.monthPathClass || 'month_path';
	// type of calendar displayed
	me.renderer = spec.renderer;
	me.current_renderer = me.renderer;

	// animation duration
	me.duration = spec.duration || 800;

	me.upBound = spec.upBound || 80;
	me.downBound = spec.downBound || 20;

	me.name = spec.name || "";

	var range = [];
	for (var i = 0; i < me.buckets; i++) {
		range.push(i);
	}	
	// var bucket = d3.scale.quantize().domain([calcs.min, calcs.max]).range(range)
	me.bucket = d3.scale.quantize().domain([20, 80]).range(range)

	
	
	
	
	me.svg = d3.select(me.visId)
			.append('svg:svg')

			.attr("width", me.width)
			.attr("height", me.height)
			.append('svg:g')
			.attr("transform", "translate(" + 0 + "," + 0+ ")");

	me.createLegend();		

	// return me;
}

/******************************************************/
// PRIVATE _ CREATE TILES
// This private method is intended to manage renderer
// switch
// it also resize drawing to screen size depending on
// renderer.draw(...) return object.
// if renderer return an object like bbox = { width: ..., height: ...}
// drawing will be resize in order to fit bbox
// in calendar.width / calendar.height
/******************************************************/
var _createTiles = function () {

	// self reference 
	var me = this;


	var args = arguments;

	data = [];
	label = [];
	if(me.current_renderer 
		&& me.current_renderer.clean
		&& me.renderer != me.current_renderer){

		me.current_renderer.clean.apply(me, arguments);
		me.current_renderer = me.renderer;

	}
	
	$("#title").text(me.name);

	var bbox = me.current_renderer.draw.apply(me, arguments);



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

/******************************************************/
// CALENDAR PROTOTYPE CREATE TILES
//
// This function is used to refresh screen depending on 
// actual calendar configuration.
//
// It also manage the fact that data can be grabbed synchronously
// or asynchronously depending on calendar.retreiveDataCallback
// implementation 
//
// Arguments passed to this function are given to 
// the DRAW implementation of current renderer
// with : me.current_renderer.draw.apply(this, arguments);
// for example, if current renderer is Calendar.renderer.year()
// as long as this renderer can be called with renderer.draw(2012)
// you should refresh the screen with something like :
// calendar.createTiles(2012)
/******************************************************/
Calendar.prototype.createTiles = function(){
	// self reference 
	var me = this;
	if(me.retreiveDataCallback != null 
		&& typeof me.retreiveDataCallback  == "function" ){
		// if there is a data retreiving callback, 
		// we save createTiles arguments in order to 
		// inject it into _createTiles
		me._tempargs = arguments;
		me.retreiveDataCallback.apply(me, arguments)
	}
	else{
		_createTiles.apply(me, arguments);
	}
	
}
/******************************************************/
// CALENDAR PROTOTYPE DRAW 
//
// this function is intended to be called in
// calendar.retreiveDataCallback provided callback 
// in order to give data to the renderer
//
// IT IS ONLY USED WITH ASYNC DATA GRABBING
/******************************************************/
Calendar.prototype.draw = function(data){
	var me = this;
	// if local args have been memorized,
	// we concat grabbed data with those args and give
	// them to _createTiles
	if(me._tempargs) {
		var args = [];
		args.splice(0, 0, data);
		for(var i=0; i< me._tempargs.length;i++) args.push(me._tempargs[i]);
		_createTiles.apply(this, args);
	}
	else{
		_createTiles.apply(this, arguments);
	}
	
}

/******************************************************/
// CALENDAR PROTOTYPE CREATE LEGEND
/******************************************************/
Calendar.prototype.createLegend = function() {
	var me = this;
	var html = "";
	for (var i = 0; i < me.buckets; i++) {
		
		html += "<li style='background:"+ me.colorScheme[i] +"'></li>";
	}
	d3.select('#legend ul').html(html);
	me.setLegend();
}
	
/******************************************************/
// CALENDAR PROTOTYPE SET LEGEND
/******************************************************/
Calendar.prototype.setLegend = function(bounds) {
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

/******************************************************/
// CALENDAR PROTOTYPE SET BUCKETS
/******************************************************/
Calendar.prototype.setBucket = function(bounds){
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

/******************************************************/
// TILES UTILS
/******************************************************/
// ENTER
Calendar.prototype.tilesEnter = function(tiles) {
	return tiles.enter()
				.insert("rect")
					.classed(this.tileClass, true)
					.attr("stroke-width", "2px")
					.attr("fill", "#fff")
					.attr("fill-opacity", 0);
		     
}

// UPDATE
Calendar.prototype.tilesUpdate = function() { }

// EXIT
Calendar.prototype.tilesExit = function(tiles) {
	tiles.exit()
		// .transition().duration(calendar.duration)
		.attr("fill-opacity", 0)
		.remove()		
}

/******************************************************/
// MONTH PATH UTILS 
/******************************************************/
// ENTER
Calendar.prototype.monthPathEnter = function(data_month, monthPath) {
	var paths = this.svg.selectAll("."+this.monthPathClass)
	    .data(data_month, function(d,i){return i;})

	paths.enter()
		.append("path")
	    .classed(this.monthPathClass, true)
	    .attr("stroke-width", "2px")
	    .attr("stroke", "#FFF")
	    .attr("fill-opacity", 0)
	    .attr("stroke-opacity", 1)
	    .attr("d", monthPath)

	paths.transition().duration(this.duration).attr("stroke", "#000")
		.attr("stroke", "#000")
	    .attr("d", monthPath)

	paths.exit().remove()

	return paths;
}
// EXIT
Calendar.prototype.monthPathExit = function(data_month, monthPath) {
	this.svg.selectAll("."+this.monthPathClass)
				.data([])
				.exit()
				// .transition().duration(this.duration).attr("fill-opacity", 0)
				.remove();
}

/******************************************************/
// TIME HELPERS
/******************************************************/
Calendar.prototype.time = {};
Calendar.prototype.time.getDay = function(d){
	var day = d.getDay();
	return ( day == 0) ? 6 : day - 1;
}

Calendar.prototype.time.getMonth = function(d){
	var format = d3.time.format("%m");
	return parseInt(format(d));
}

Calendar.prototype.time.getWeek = function(d){
	var format = d3.time.format("%W");
	return parseInt(format(d));
}

/******************************************************/
// COLOR HELPERS
/******************************************************/
Calendar.prototype.getColor = function(val){
	var me = this;
	var color = me.noDataColor;
	if(val != undefined && val !=0 ) {
		color = me.colorScheme[me.bucket(val)];
	}
	return color;
}


/******************************************************/
// RENDERER NAMESPACE
/******************************************************/
Calendar.renderer = {};

/******************************************************/
// ANIMATION UTILS
/******************************************************/
Calendar.animation = {
	// fade in animation
	fadeIn : function(transition, duration){
		return transition
			.duration(duration)
			.attr("fill-opacity", 1)	
	}

	// fade out animation
	, fadeOut : function(transition, duration){
		return transition
			.duration(duration)
			.attr("fill-opacity", 0)
			.remove();	
	}
	
}