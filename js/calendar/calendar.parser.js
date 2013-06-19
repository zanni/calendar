

/*
 * Generic parser used to manipulate list of timestamped data
 */
Calendar.parser = {
	/* ************************** */
	/*
	 * create a generic parser, specilized with :
	 * 	timeCallback : function(d){
	 * 		return d.whatEverTimestampedField
	 * }
	 */
	create : function(timeCallback){
		return function(data){
			var year = function(d){
				return timeCallback(d).getFullYear();
			}
			var day = function(d){
				var day = timeCallback(d).getDay();
				return ( day == 0) ? 6 : day - 1;
			}
			var week = function(d){
				var format = d3.time.format("%W");
				return parseInt(format(timeCallback(d)));
			}
			var hour = function(d){
				return timeCallback(d).getHours();
			}

			var nest = d3.nest();

			nest.key(year)
				.key(week)
				.key(day)
				.key(hour)

				
			return nest.map(data);
		}
	}
	/* ************************** */
	/*
	 * create a generic bounder, specilized with :
	 * 	valueCallback : function(d){
	 * 		return d.whatEverValueField
	 * }
	 */
	, bounds: function(valueCallback){
		return function(data){
			var result = [];
			data.map(function(d){ result.push(valueCallback(d))});
			return {
				'min': d3.round(d3.min(result))
				, 'max': d3.round(d3.max(result))
				, 'mean': d3.round(d3.mean(result))
				, 'median': d3.round(d3.median(result))
			};
		};
	}
}