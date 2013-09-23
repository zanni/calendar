/**
 * @fileOverview Various tool functions.
 * @author <a href="mailto:zanni.bertrand@gmail.com">Bertrand Zanni </a>
 * @version 3.1.2
 */
/**
 * Description {@tutorial test-tutorial}.
 * @method Calendar
 * @property {integer} width 				
 *			- canvas width
 * @property {integer} height 				
 *			- canvas height
 * @property {object} margin 				
 *			- canvas margin
 * @property {object} eventManager  		
 *			- give evenemential capacity to calendar
 * @property {boolean} adaptiveHeight 		
 *			- whether canvas container height should adapt to effective canvas height
 * @property {object} timeserie 		
 *			- timeserie to display


 *
 * @example 
 *	<caption>Calendar().timeserie(timeserie).createTile(2013)</caption>
 * 
 */
var Calendar = function(spec){
	var calendar = new CalendarObject(spec);
	var my = function(){

	}
	var timeserie = calendar.timeserie;
	my.timeserie = function(value) {
		if (!arguments.length) return timeserie;
		timeserie = value;
		calendar.timeserie = timeserie
		calendar.retreiveValueCallback = timeserie.retreiveValueCallback;
		calendar.data = timeserie.parsed;
		calendar.upBound = timeserie.max();
		calendar.downBound = timeserie.min();
		calendar.setBucket();
		return my;
	};
	var data = calendar._data;
	my.data = function(value) {
		if (!arguments.length) return calendar._data;
		data = value;
		calendar.data = calendar.timeserie.data(value)
		calendar.upBound = timeserie.max();
		calendar.downBound = timeserie.min();
		calendar.setBucket();
		return my;
	};
	var grab = calendar.retreiveDataCallback;
	my.grab = function(value) {
		if (!arguments.length) return grab;
		grab = value;
		calendar.retreiveDataCallback = grab;
		return my;
	};
	var renderer = calendar._renderer;
	my.renderer = function(value) {
		if(value == "year") value = new Calendar.renderer.year();
		else if(value == "month") value = new Calendar.renderer.month();
		else if(value == "week") value = new Calendar.renderer.week();
		else if(value == "day") value = new Calendar.renderer.day()

		if (!arguments.length) return renderer;
		renderer = value;
		calendar.renderer = renderer;
		return my;
	};
	my.createTiles = function(){
		calendar.createTiles.apply(calendar, arguments);
	}
	return my;
}

/**
 * @namespace
 * @property {RendererObject} day 				
 *				- Day renderer constructor @see bar
 * @property {RendererObject} week 				
 *				- Week renderer constructor
 * @property {RendererObject} month 				
 *				- Month renderer constructor
 * @property {RendererObject} year 				
 *				- Year renderer constructor
 */
Calendar.renderer = {};

/**
 * @namespace 
 */
Calendar.decorator = {};

/**
 * @namespace 
 */
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

/**********************************************************/
// Calendar CONSTRUCTOR
/**********************************************************/
var CalendarObject = function(spec){
	/******************************************************/
	// INIT
	/******************************************************/
	// self ref
	var me = this;

	var settings = {
		// SIZE
		height : null
		, width : 960
		, margin: {top:0, bottom:0}
		, adaptiveHeight: true
		// DOM
		, visId : '#vis'
		, decoratorId : '#decorator_top'
		, decoratorBottomId : '#decorator_bottom'
		, tileClass : 'tile'
		, monthPathClass : 'month_path'
		// THEME
		, renderer : new Calendar.renderer.year()
		, decorators : []
		, noDataColor : '#eee'
		, colorScheme : ["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"]
		, noDataColor : '#eee'
		, label_fill : 'darkgray'
		, label_fontsize : "22px"
		, interactive : false
		// ANIMATION
		, animation : false
		, duration : 800
		// DECORATORS
		, drawLegend: false
		, drawHorodator : false
		// DATA
		, timeserie : null
	}
	$.extend(me, settings);
	$.extend(me, spec);
	me.current_renderer = me.renderer;
	if(!me.animation) me.duration=0;

	// event manager
	me.eventManager = {};
	EventManager.enable.call(me.eventManager);

	// timeserie
	if(me.timeserie){
		me.retreiveValueCallback = me.timeserie.retreiveValueCallback;
		me.data = me.timeserie.parsed;
		me.upBound = me.timeserie.max();
		me.downBound = me.timeserie.min();
	}

	// bucket
	var range = [];
	for (var i = 0; i < me.colorScheme.length; i++) {
		range.push(i);
	}	

	// var bucket = d3.scale.quantize().domain([calcs.min, calcs.max]).range(range)
	me.bucket = d3.scale.quantize().domain([me.downBound, me.upBound]).range(range);
	


	/******************************************************/
	// TILES SVG NODE CREATION
	/******************************************************/
	me.svg = d3.select(me.visId)
			.append('svg:svg')
			.attr("width", me.width)
			.attr("height", (me.adaptiveHeight) ? 0 : me.height)
			.append('svg:g')
			.attr("transform", "translate(" + 0 + "," + 0+ ")");

	
	
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
	var renderer_switched = false;
	if(me.current_renderer 
		&& me.current_renderer.clean
		&& me.renderer != me.current_renderer){

		// clean previous renderer and relink current_renderer ref
		me.current_renderer.clean.apply(me, arguments);
		me.current_renderer = me.renderer;
		renderer_switched = true;
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
	if(bbox && bbox.width && bbox.height){
		// adjust width
		// scale down
		var scale = decal_w = decal_h = 0
		var delta_h = me.height - bbox.height
		if(me.adaptiveHeight) delta_h = 1;
		var delta_w = me.width - bbox.width
		if(delta_h > 0 && delta_w > 0){
			scale = 1;
			decal_h = (me.height - bbox.height) / 2;
			decal_w = (me.width - bbox.width) / 2;
		}
		else if(delta_h < 0 && delta_w > 0){
			scale = me.height / bbox.height ;
			decal_w = (me.width - scale*bbox.width) / 2;
		}
		else if(delta_h > 0 && delta_w < 0){
			scale = me.width / bbox.width ;
			decal_h = (me.height - scale*bbox.height) / 2;
		}
		else if(delta_h < 0 && delta_w < 0){
			if(delta_h < delta_w){
				scale = me.height / bbox.height ;
				decal_w = (me.width - scale*bbox.width) / 2;
			}
			else{
				scale = me.width / bbox.width ;
				decal_h = (me.height - scale*bbox.height) / 2;
			}
		}
		if(me.adaptiveHeight){
			decal_h = 0
			var height = scale*bbox.height
			d3.select(me.visId+" svg").transition()
			.duration(me.duration).attr('height', height)
		}
		if(renderer_switched){
			me.svg
			.transition()
			.duration(me.duration)
			.attr("transform", "translate(" + decal_w + "," + decal_h + ")"+"scale("+scale+")");
		}
		else{
			me.svg
			.attr("transform", "translate(" + decal_w + "," + 0 + ")"+"scale("+scale+")");
		}
		
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
CalendarObject.prototype.createTiles = function(){

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
CalendarObject.prototype.draw = function(data, mergeData){
	var me = this;
	
	if(me.timeserie){
		if(typeof mergeData == "boolean" && mergeData)
			me.timeserie.merge(data);
		else{
			me.timeserie.data(data);
		}
		var bounds = {
			min: me.timeserie.min()
			, max: me.timeserie.max()
		}
		me.setBucket(bounds);
		if(me.legend) me.setLegend(bounds)
		if(me.horodator) me.setHorodator(me.timeserie.start(), me.timeserie.end());
		me.data = me.timeserie.data();
	}
	else{
		console.log(me);
		me.data = data;
	}
	// if local args have been memorized,
	// we concat grabbed data with those args and give
	// them to _createTiles
	if(me._tempargs) {
		var args = [];
		args.splice(0, 0, me.data);
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
CalendarObject.prototype.setLegend = function(bounds) {

		var check = function(a){ return (a) ? a : ""; }
		var me = this;
		me.setBucket(bounds);
		if(bounds){
			me.legend.refresh(check(bounds.min),check(bounds.max));
		}
		else{
			me.legend.refresh(check(me.downBound),check(me.upBound));
		}
	}

/******************************************************/
// CALENDAR PROTOTYPE SET HORODATOR
/******************************************************/
CalendarObject.prototype.setHorodator = function(start, end) {
		var check = function(a){ return (a) ? me.renderer.horodator_format(a) : ""; }
		var me = this;
		me.horodator.refresh(check(start),check(end));
	}

/******************************************************/
// CALENDAR PROTOTYPE SET BUCKETS
/******************************************************/
CalendarObject.prototype.setBucket = function(bounds){
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
CalendarObject.prototype.tilesEnter = function(tiles) {
	var me = this;

	return tiles.enter()
				.append("rect")
				.classed(this.tileClass, true)
				.attr("stroke-width", "2px")
				.attr("fill-opacity", 0)				
}

// UPDATE
CalendarObject.prototype.tilesUpdate = function(tiles) { 
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
CalendarObject.prototype.tilesExit = function(tiles) {
	tiles.exit()
		// .transition().duration(calendar.duration)
		.attr("fill-opacity", 0)
		.remove()		
}

/******************************************************/
// MONTH PATH UTILS 
/******************************************************/
// ENTER
CalendarObject.prototype.monthPathEnter = function(data_month, monthPath) {
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
CalendarObject.prototype.monthPathExit = function(data_month, monthPath) {
	this.svg.selectAll("."+this.monthPathClass)
				.attr("stroke-opacity", 0)
				// .transition().duration(this.duration).attr("fill-opacity", 0)
				// .remove();
}

/******************************************************/
// LABEL UTILS 
/******************************************************/
// ENTER
CalendarObject.prototype.labelEnter = function(renderer, transform, klass){
	var me = this;
	var label = transform.append("text")
				.classed(klass, true)
				.attr("fill", renderer.label_fill)
				.attr("font-size", renderer.label_fontsize);
	if(me.interactive){
		label = label.attr("cursor", "pointer");
	}
	return label;
}

/******************************************************/
// DECORATOR UTILS 
/******************************************************/
// ENTER
CalendarObject.prototype.decoratorEnter = function(id, float, position, interactive){
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
CalendarObject.prototype.decoratorTextEnter = function(decorator){
	var me = this;
	return decorator.append('p')
				.style('font-size', '14px')
				.style("margin-right", '15px')
				.style("margin-left", '15px')
}

/******************************************************/
// TIME HELPERS
/******************************************************/
CalendarObject.prototype.time = {};
// TODO permits to specify which day is the first day of week
CalendarObject.prototype.time.getDay = function(d){
	return Calendar.data.getDay(d);
}

CalendarObject.prototype.time.getMonth = function(d){
	var format = d3.time.format("%m");
	return parseInt(format(d));
}

CalendarObject.prototype.time.getWeek = function(d){
	return Calendar.data.getWeek(d);
}

/******************************************************/
// COLOR HELPERS
/******************************************************/
CalendarObject.prototype.getColor = function(val){
	var me = this;
	var color = me.noDataColor;
	if(val != undefined && val !=0 ) {
		color = me.colorScheme[me.bucket(val)];
	}
	return color;
}


