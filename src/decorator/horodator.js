Calendar.decorator.horodator = function(){
	var me = this;

	me.id = "horodator";

	var drawn = false;
	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){
		var calendar = this;
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
			    .on("click", function (d, i) {
			    	calendar.eventManager.trigger("horodator:click");
			    })

		me.node = me.node.append('p')
				.style('font-size', '14px')
				.style('margin-left', '10px')
				.style('margin-right', '10px')
				.text("mouai c cool")
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