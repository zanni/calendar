Calendar.decorator.title = function(spec){
	var me = this;

	me.id = "decorator_title";

	// theming
	if(!spec) spec={};
	me.float = spec.float || 'right';
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
		me.node.text(calendar.name);
	}

	me.clean = function(){
		var previous = d3.select("#"+me.id).remove();
	}


}