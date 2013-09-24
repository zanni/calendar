/**********************************************************/
// Calendar CONSTRUCTOR
/**********************************************************/
Calendar.timeserie = function(spec){
	var me = this;
	// layout
	me.time = spec.time || function(d){ d.time; };
	me.indicator = spec.indicator || function(d){ d.value; }; 
	me.indicatorAggregation = spec.indicatorAggregation || d3.mean;

	me.raw = [];
	me.parsed = {};

	me.parser = Calendar.data.create(me.time);
	me.retreiveValueCallback = Calendar.data.retreiveValueCallbackClosure(me.indicator, me.indicatorAggregation);

	me.max = function(){
		return d3.max(me.raw, me.indicator);
	}
	me.min = function(){
		return d3.min(me.raw, me.indicator);
	}
	me.mean = function(){
		return d3.mean(me.raw, me.indicator);
	}
	me.start = function(){
		return d3.min(me.raw, me.time);
	}
	me.end = function(){
		return d3.max(me.raw, me.time);
	}

	me.data = function(raw) {
		if (!arguments.length) return me.parsed;
		me.raw = raw;
		me.parsed = me.parser(raw);
		return me.parsed;
	};

	me.merge = function(raw){
		me.raw = me.raw.concat(raw);
		me.raw.sort(function(a,b){ return (a < b) ? 1 : -1})
		$.extend(true, me.parsed, me.parser(raw));
		return me.parsed;
	}
}