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

	// event manager
	me.eventManager = {};
	EventManager.enable.call(me.eventManager);

	// layout
	me.height = spec.height || 600;
	me.width = spec.width || 800;
	me.margin = spec.margin

	//retreive data according to your createTiles call
	me.retreiveDataClosure = spec.retreiveDataClosure;

	//retreive data according to your createTiles call
	me.retreiveDataCallback = spec.retreiveDataCallback;

	// retreive value
	me.retreiveValueCallback = spec.retreiveValueCallback;

	// synchronous data loading
	me.data = spec.data;

	// THEME
	// color scheme
	me.colorScheme = spec.colorScheme 
		|| ["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"];

	me.noDataColor = spec.noDataColor || "#eee";
	me.buckets = me.colorScheme.length;
	me.label_fill = spec.label_fill || "darkgray";
	me.label_fontsize = spec.label_fontsize || "22px";

	// Dom balise settings
	// tiles visulatization id
	me.visId = spec.visId || '#vis';
	// decorator layer id
	me.decoratorId = spec.decoratorId || '#decorator_top';
	me.decoratorBottomId = spec.decoratorBottomId || '#decorator_bottom';
	me.tileClass = spec.tileClass || 'tile';
	me.monthPathClass = spec.monthPathClass || 'month_path';
	// type of calendar displayed
	me.renderer = spec.renderer;
	me.current_renderer = me.renderer;

	// animation duration
	me.duration = spec.duration  || 800;
	if(spec.duration ==0) me.duration = 0;

	me.upBound = spec.upBound || 80;
	me.downBound = spec.downBound || 20;

	me.name = spec.name || "";

	// interactivity
	me.interactive = (typeof spec.interactive  == "boolean") ? spec.interactive : true;
	// legend
	me.drawLegend = (typeof spec.drawLegend  == "boolean") ? spec.drawLegend : true;
	me.drawHorodator = (typeof spec.drawHorodator  == "boolean") ? spec.drawHorodator : true;
	// me.drawHovered = (typeof spec.drawHovered  == "boolean") ? spec.drawHovered : true;
	// me.drawTitle = (typeof spec.drawTitle  == "boolean") ? spec.drawTitle : true;

	var range = [];
	for (var i = 0; i < me.buckets; i++) {
		range.push(i);
	}	
	// var bucket = d3.scale.quantize().domain([calcs.min, calcs.max]).range(range)
	me.bucket = d3.scale.quantize().domain([20, 80]).range(range);


	/******************************************************/
	// TILES SVG NODE CREATION
	/******************************************************/
	me.svg = d3.select(me.visId)
			.append('svg:svg')
			.attr("width", me.width)
			.attr("height", me.height)
			.append('svg:g')
			.attr("transform", "translate(" + 0 + "," + 0+ ")");

	
	
	me.decorators = spec.decorators || [];
	d3.select(me.decoratorId)
		// .style("display", "block")
		.style("margin", "20px 0");
	if(me.drawLegend){
		me.legend = new Calendar.decorator.legend();
		me.decorators.push(me.legend);
	}
		
	if(me.drawHorodator){
		me.horodator = new Calendar.decorator.horodator();
		me.decorators.push(me.horodator);
	}
		
	// if(me.drawHovered){
	// 	me.hovered = new Calendar.decorator.hovered({
	// 		float: 'left'
	// 		, position: 'bottom'
	// 	});
	// 	me.decorators.push(me.hovered);
	// }		
}

/******************************************************/
// PRIVATE _ CREATE TILES
// This private method is intended to manage renderer
// switch (clean previous renderer by calling clean method)
// it also resize drawing to screen size depending on
// renderer.draw(...) return object.
// if renderer draw method return an object like bbox = { width: ..., height: ...}
// drawing will be resize in order to fit bbox
// in calendar.width / calendar.height
/******************************************************/
var _createTiles = function () {

	// self reference 
	var me = this;

	data = [];
	label = [];

	/******************************************************/
	// DECORATORS
	/******************************************************/
	for(var i in me.decorators){
		if(me.decorators[i] && typeof me.decorators[i].draw == 'function'){
			me.decorators[i].draw.apply(me);
		}
	}

	// if renderer != current_renderer that's mean that renderer 
	// have been swiched 
	if(me.current_renderer 
		&& me.current_renderer.clean
		&& me.renderer != me.current_renderer){

		// clean previous renderer and relink current_renderer ref
		me.current_renderer.clean.apply(me, arguments);
		me.current_renderer = me.renderer;

	}

	// delegate drawing to the current renderer
	var bbox = me.current_renderer.draw.apply(me, arguments);

	// At this point, renderering have been called but the drawing 
	// may not have been done yet because of animation latency
	// That's why we can't simply get calendar bbox by calling to getBbox()
	// on svg node
	// renderer developper MUST return it's own computed bbox in order to 
	// automaticaly adjust his drawing on screen calendar size
	// expected object SHOULD be { width:... , height: ... }
	if(bbox && bbox.width){
		// adjust width
		// scale down
		var scale = decal = decal_h = 0
		if(bbox.width > me.width){
			scale = me.width / bbox.width ;
		}
		// scale 1 and center
		else{
			scale = 1;
			decal = (me.width - bbox.width) / 2;
			// decal_h = (me.height - bbox.height) / 2;
		}
		me.svg
		.transition()
		.duration(me.duration)
		.attr("transform", "translate(" + decal + "," + decal_h + ")"+"scale("+scale+")");
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
// you should refresh the screen with :
// calendar.createTiles(2012)
// 
/******************************************************/
Calendar.prototype.createTiles = function(){

	// self reference 
	var me = this;
	if(me.retreiveDataCallback != null 
		&& typeof me.retreiveDataCallback  == "function" ){
		// asynchronous data loading
		// if there is a data retreiving callback, 
		// we save createTiles arguments in order to 
		// inject it into _createTiles
		me._tempargs = arguments;
		me.retreiveDataCallback.apply(me, arguments)
	}
	else if(me.data){
		// synchronous data loading
		me._tempargs = arguments;
		var args = [];
		args.push(me.data);
		for(var i=0;i<arguments.length;i++) args.push(arguments[i]);
		_createTiles.apply(me, args);
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
	me.data = data;
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
// CALENDAR PROTOTYPE SET LEGEND
/******************************************************/
Calendar.prototype.setLegend = function(bounds) {
		var check = function(a){ return (a) ? a : ""; }
		var me = this;
		if(bounds){
			me.legend.refresh(check(bounds.min),check(bounds.max));
		}
		else{
			me.legend.refresh(check(me.downBound),check(me.upBound));
		}
	}

/******************************************************/
// CALENDAR PROTOTYPE REDRAW LEGEND
/******************************************************/
Calendar.prototype.redrawLegend = function(bounds) {
		var me = this;
		me.legend.recolor()		
	}

/******************************************************/
// CALENDAR PROTOTYPE SET HORODATOR
/******************************************************/
Calendar.prototype.setHorodator = function(start, end) {
		var check = function(a){ return (a) ? me.renderer.horodator_format(a) : ""; }
		var me = this;
		me.horodator.refresh(check(start),check(end));
	}

/******************************************************/
// CALENDAR PROTOTYPE SET BUCKETS
/******************************************************/
Calendar.prototype.setBucket = function(bounds){
	var me = this;
	var range = [];
	for (var i = 0; i < me.colorScheme.length; i++) {
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
	var me = this;

	return tiles.enter()
				.append("rect")
				.classed(this.tileClass, true)
				.attr("stroke-width", "2px")
				.attr("fill-opacity", 0)				
}

// UPDATE
Calendar.prototype.tilesUpdate = function(tiles) { 
	var me = this;
	if(me.interactive){
		return tiles.on("mouseover", function (d, i) {
			     	me.eventManager.trigger("tile:mouseenter", {
			    		time:d
			    		, value: d3.select(this).attr("data")
			    	});
			    })
			    .on("mouseout", function (d, i) {
			    	me.eventManager.trigger("tile:mouseout", {
			    		time:d
			    		, value: d3.select(this).attr("data")
			    	});
			    })
			    .on("click", function (d, i) {
			    	me.eventManager.trigger("tile:click", {
			    		time:d
			    		, value: d3.select(this).attr("data")
			    	});
			    })
			    .attr("cursor", "pointer");
	}
	return tiles;
	
}

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
	    .data(data_month, function(d,i){return d.getFullYear()+"-"+d.getMonth();})

	paths.enter()
		.insert("path")
	    .classed(this.monthPathClass, true)
	    .attr("stroke-width", "2px")
	    .attr("stroke", "#FFF")
	    .attr("fill-opacity", 0)
	    .attr("stroke-opacity", 1)
	    .attr("z-index", 0)
	    .attr("fill-opacity", 0)

	    .attr("d", monthPath)



	paths.transition().duration(this.duration).attr("stroke", "#000")
		.attr("stroke", "#000")
		.attr("stroke-opacity", 1)
	    .attr("d", monthPath)

	paths.exit().remove()

	return paths;
}
// EXIT
Calendar.prototype.monthPathExit = function(data_month, monthPath) {
	this.svg.selectAll("."+this.monthPathClass)
				.attr("stroke-opacity", 0)
				// .transition().duration(this.duration).attr("fill-opacity", 0)
				// .remove();
}

/******************************************************/
// LABEL UTILS 
/******************************************************/
// ENTER
Calendar.prototype.labelEnter = function(renderer, transform, klass){
	return transform.append("text")
				.classed(klass, true)
				.attr("fill", renderer.label_fill)
				.attr("font-size", renderer.label_fontsize);
}

/******************************************************/
// DECORATOR UTILS 
/******************************************************/
// ENTER
Calendar.prototype.decoratorEnter = function(id, float, position, interactive){
	var me = this;
	return d3.select(position && (position == "bottom") ? me.decoratorBottomId : me.decoratorId)
			.style('cursor',(interactive) ? 'pointer' : 'cursor')
			.append('div')
			.attr("id", id)
				.style('color', "#777")
				.style('border', '1px solid #f0f0f0')
				.style('background', '#f3f3f3')
				.style('font-size', '11px')
				.style('-moz-border-radius', '3px')
				.style('border-radius', '3px')
				// .style('width', '1px')
				.style('height', '40px')

				.style('float', ((float) ? float : 'right'))
				.style('margin-left', '10px')
}
Calendar.prototype.decoratorTextEnter = function(decorator){
	var me = this;
	return decorator.append('p')
				.style('font-size', '14px')
				.style("margin-right", '15px')
				.style("margin-left", '15px')
}

/******************************************************/
// TIME HELPERS
/******************************************************/
Calendar.prototype.time = {};
// TODO permits to specify which day is the first day of week
Calendar.prototype.time.getDay = function(d){
	return Calendar.data.getDay(d);
}

Calendar.prototype.time.getMonth = function(d){
	var format = d3.time.format("%m");
	return parseInt(format(d));
}

Calendar.prototype.time.getWeek = function(d){
	return Calendar.data.getWeek(d);
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
// DECORATOR NAMESPACE
/******************************************************/
Calendar.decorator = {};

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