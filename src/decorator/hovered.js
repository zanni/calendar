Calendar.decorator.hovered = function(){
	var me = this;

	me.id = "hovered";

	var drawn = false;
	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){
		var calendar = this;

		calendar.eventManager.on("tile:mouseenter", function(d){
			me.refresh(d.time+" - "+d.value);
		})
		if(!drawn) drawn = true;
		else return;

		me.node = d3.select(calendar.decoratorId)
			.style('cursor','pointer')
			.append('div')
			.attr("id", me.id)
				.style('color', "#777")
				.style('border', '1px solid #f0f0f0')
				.style('background', '#f3f3f3')
				.style('font-size', '11px')
				.style('-moz-border-radius', '3px')
				.style('border-radius', '3px')
				// .style('width', '1px')
				.style('height', '50px')
				.style('float', 'right')
				.style('margin', '10px 30px')

		me.node = me.node.append('p')
				.style('font-size', '14px')
				.style('margin-left', '10px')
				.style('margin-right', '10px')
				.text("mouai c cool")
	}

	me.refresh = function(value){
		var calendar = this;
		if(me.node) me.node.text(value);
	}

	me.clean = function(){
		var previous = d3.select("#"+me.id).remove();
	}


}