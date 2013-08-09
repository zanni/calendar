Calendar.decorator.legend = function(){
	var me = this;

	var drawn = false;
	/******************************************************/
	// DRAW implementation
	/******************************************************/
	me.draw = function(){

		/******************************************************/
		// self ref is supposed to be set with generic calendar
		// setting when calling draw func with apply
		/******************************************************/
		var calendar = this;
		if(!drawn) drawn = true;
		else return;
		

		var node = d3.select(calendar.decoratorId)
			.append('div')
			.attr("id", calendar.legendId)
				.style('color', "#777")
				.style('border', '1px solid #f0f0f0')
				.style('background', '#f3f3f3')
				.style('font-size', '11px')
				.style('-moz-border-radius', '3px')
				.style('border-radius', '3px')
				.style('width', '155px')
				.style('height', '50px')
				.style('float', 'right')
				.style('margin', '10px 30px')
				.style('opacity', '0')
				// .append('div');

		var colors = node.append('ul')
					.style('list-style-type', "none")
					.style('overflow', 'hidden')
					.style('margin-left', '-25px')
					.style('margin-bottom', 5)


		for (var i = 0; i < calendar.buckets; i++) {
			colors.append('li')
					.style('background', calendar.colorScheme[i])
					.style('float','left')
					.style('width','14px')
					.style('height','14px')
		}

		// node = node.append('div')

		node.append('span').classed('less', true)
				// .style('margin-top', '3px')
				// .style('margin-left', '10px')
				.style("float", 'left')
				.style("margin-left", '15px')
				// .style('position', 'absolute')
				// .style('top', 0)
				.text(calendar.downBound);

		node.append('span').classed('more', true)
				// .style('margin-top', '3px')
				.style("float", 'right')
				.style("margin-right", '15px')
				// .style('position', 'absolute')
				// .style('top', '24px')
				// .style('right', '10px')
				.text(calendar.upBound);

		node.transition().duration(calendar.duration).style('opacity', 1)

	}


}