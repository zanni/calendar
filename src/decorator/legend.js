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
		// yep ...
		me.calendar = calendar;
		if(!drawn) drawn = true;
		else return;
		
		me.node = d3.select(calendar.decoratorId);
		me.node = me.node
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

		me.colors = me.node.append('ul')
					.style('list-style-type', "none")
					.style('overflow', 'hidden')
					.style('margin-left', '-25px')
					.style('margin-bottom', 5)


		// for (var i = 0; i < calendar.buckets; i++) {
		// 	me.colors.append('li')
		// 			.style('background', calendar.colorScheme[i])
		// 			.style('float','left')
		// 			.style('width','14px')
		// 			.style('height','14px')
		// }

		me.colors_data = me.colors.selectAll('li').data(calendar.colorScheme, function(d, i){return i;})
					.enter()
					.append('li')
					.style('background', function(d){
						return d;
					})
					.style('float','left')
					.style('width','14px')
					.style('height','14px')

		// node = node.append('div')

		me.less = me.node.append('span').classed('less', true)
				// .style('margin-top', '3px')
				// .style('margin-left', '10px')
				.style("float", 'left')
				.style("margin-left", '15px')
				// .style('position', 'absolute')
				// .style('top', 0)
				.text(calendar.downBound);

		me.more = me.node.append('span').classed('more', true)
				// .style('margin-top', '3px')
				.style("float", 'right')
				.style("margin-right", '15px')
				// .style('position', 'absolute')
				// .style('top', '24px')
				// .style('right', '10px')
				.text(calendar.upBound);

		me.node.transition().duration(calendar.duration).style('opacity', 1)

	}

	me.refresh = function(down, up){
		me.less.text(down);
		me.more.text(up);	
		// yep yep ...
		// me.colors.selectAll('li')
		// 	.data(me.calendar.colorScheme, function(d, i){return i;})
		// 	.style('background', function(d){
		// 				return d;
		// 			})
		// 			.style('float','left')
		// 			.style('width','14px')
		// 			.style('height','14px')
	}


}