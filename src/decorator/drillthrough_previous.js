Calendar.decorator.previous = function(){
	var me = this;

	me.id = "drillthrough_previous"

	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;

		var node = d3.select(calendar.decoratorId)
			.style('cursor','pointer')
			.append('div')
			.attr("id", "drillthrough_previous")
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
				.append('p')
				.style('font-size', '14px')
				.style('margin-left', '10px')
				.style('margin-right', '10px')

				.text('reset')


				// .style('opacity', '0')
				// .append('div');

		// node.transition().duration(calendar.duration).style('opacity', 1)

	}

	me.clean = function(){
		var previous = d3.select("#"+me.id).remove();
	}

}