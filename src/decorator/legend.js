Calendar.decorator.legend = function(spec){
	var me = this;

	
	// theming
	if(!spec) spec={};
	me.float = spec.float || 'left';
	me.position = spec.position || 'top';
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
		
		me.node = calendar.decoratorEnter(me.id, me.float, me.position);

		
		me.less = me.node.append('p').classed('less', true)
				.style("float", 'left')
				.style('font-size', '14px')
				.style("margin-right", '15px')
				.style("margin-left", '15px')

		var tiles_size = 14;
		me.colors = me.node.append('ul')
					.style("display", "inline")
					.style('padding-left', '0 ')
					.style('padding-top', '4px')
					.style("float", 'left')
					.style("list-style-type","none")	

		me.colors_data = me.colors.selectAll('li').data(calendar.colorScheme, function(d, i){return i;})
					.enter()
					.append('li')
					.style('background', function(d){
						return d;
					})
					.style('float','left')
					.style('width',tiles_size+'px')
					.style('height',tiles_size+'px')
						

		me.more = me.node.append('p').classed('more', true)
				.style("float", 'left')
				.style('font-size', '14px')
				.style("margin-right", '15px')
				.style("margin-left", '15px')

		me.node.transition().duration(calendar.duration).style('opacity', 1)

	}

	me.refresh = function(down, up){
		if(!drawn) return;
		me.less.text(down);
		me.more.text(up);			
	}

	me.recolor = function(){
		var tiles = me.colors.selectAll('li')
			.data(me.calendar.colorScheme, function(d, i){return i;})

		tiles.style('background', function(d){
						return d;
					})
					.style('float','left')
					.style('width','14px')
					.style('height','14px')

		tiles.exit().remove();	
	}


}