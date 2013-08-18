Calendar.decorator.hovered = function(spec){
	var me = this;

	me.id = "hovered";
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

		calendar.eventManager.on("tile:mouseenter", function(d){
			me.decorator.style("display","block");
			me.refresh(d.time+" - "+d.value);
			// me.refresh(d.value);
		})
		calendar.eventManager.on("tile:mouseout", function(d){
			// me.decorator.style("display","none");
		})
		if(!drawn) drawn = true;
		else return;

		me.decorator = calendar.decoratorEnter(me.id, me.float, me.position);
		me.decorator.style("display", "none");
		me.node = calendar.decoratorTextEnter(me.decorator);
	}

	me.refresh = function(value){
		var calendar = this;
		if(me.node) me.node.text(value);
	}

	me.clean = function(){
		var previous = d3.select("#"+me.id).remove();
	}


}