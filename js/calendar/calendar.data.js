

/*
 * Generic parser used to manipulate list of timestamped data
 */
Calendar.data = {
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
	/* ************************** */
	/* 
		retreive value generic callback closure
	*/
	 ,retreiveValueCallbackClosure: function(data, specializedFunc, aggregatFunc, filterFunc){
		var depth = 0;
		var recurr = function(array, i){
			var logs = [];
				if(specializedFunc(array) != null){
					return specializedFunc(array);
				}
				else{
					for(var i in array){
						logs.push(recurr(array[i]));
					}
					var val = aggregatFunc(logs);
					return val;
				}
		}
		return function(){
			try{	
				var period = data;
				for(var i in arguments){
					period = period[arguments[i]];
				}
				return recurr(period, 0);
			}
			catch(err){
				return null;
			}
		}
	}
	/* ************************** */
	/* 
		retreive bounds generic callback closure
	*/
	,retreiveBoundsCallbackClosure : function(data, specializedTimeFunc, specializedFunc, aggregatFunc, filterFunc){
		var findStart = function(array, i){
			var logs = [];
			if(array != null && specializedFunc(array) != null && specializedTimeFunc(array) != undefined){
				return specializedTimeFunc(array)
			}
			else{
				for(var j in array){
					return findStart(array[j]);
				}
			}
		}
		var recurr = function(array, i){

			var logs = [];
			if(array != null && specializedFunc(array) != null){
				return specializedFunc(array);
			}
			else{
				for(var j in array){
					logs = logs.concat(recurr(array[j]));
				}
				// if(i==0) return logs;
				// var val = aggregatFunc(logs);
				return logs;
			}
		}
		return function(){
			// console.log(arguments)
			try{
				var period = data;
				for(var i in arguments){
					period = period[arguments[i]];
				}
				var logs =  recurr(period, 0);
				var start = findStart(period, 0);
				return {
					'min': d3.round(d3.min(logs), 2)
					, 'max': d3.round(d3.max(logs), 2)
					, 'mean': d3.round(d3.mean(logs), 2)
					, 'median': d3.round(d3.median(logs), 2)
					, 'start' : start
				};
			}
			catch(err){
				return null;
			}
		}
	}
}