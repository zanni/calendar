Calendar.decorator.horodator = function(spec){
	var me = this;

	me.id = "decorator_horodator";
	// theming
	if(!spec) spec={};
	me.float = spec.float || 'left';
	me.position = spec.position || 'top';
	var drawn = false;
	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){
		var calendar = this;
		if(!drawn) drawn = true;
		else return;

		me.decorator = calendar.decoratorEnter(me.id, me.float, me.position);

		me.node = calendar.decoratorTextEnter(me.decorator);
	}

	me.refresh = function(start, end){
		var calendar = this;
		// if(!me.node) me.draw.apply(calendar);
		
		// me.node.text(start);
		if(me.node) me.node.text(start);
	}

	me.clean = function(){
		var previous = d3.select("#"+me.id).remove();
	}


}