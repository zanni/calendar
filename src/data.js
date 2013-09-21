Calendar.data = {
	week_format :  d3.time.format("%W")
	, firstDayOfWeek: d3.time.mondays
	, _firstDayOfWeek: d3.time.monday
	, getYear : function(d){
		return parseInt(d.getFullYear());
	}
	, getDay : function(d){
		var time = d.getTime() - Calendar.data._firstDayOfWeek(d).getTime();
		// return parseInt(d.getDay());
		return Math.floor(parseInt(time)/ (24*3600000));
	}
	, getDayOfYear : function(d){
		var start = new Date(d.getFullYear(), 0, 0);
		var diff = d - start;
		var oneDay = 1000 * 60 * 60 * 24;
		return Math.ceil(diff / oneDay);
	}
	, getWeek : function(d){
		return parseInt(Calendar.data.week_format(d));
		// return parseInt(getWeek(d)):
	}
	, getHours : function(d){
		return parseInt(d.getHours());
	}
	, getQuarter : function(d){
		return parseInt(Math.floor(parseInt(d.getMinutes())/15));
	}
	/* ************************** */
	/*
	 * create a generic parser, specilized with :
	 * 	timeCallback : function(d){
	 * 		return d.whatEverTimestampedField
	 * }
	 */
	, create : function(timeCallback){
		return function(data){
			var year = function(d){
				return Calendar.data.getYear(timeCallback(d));
			}
			var day = function(d){
				return Calendar.data.getDay(timeCallback(d));
			}
			var week = function(d){
				return Calendar.data.getWeek(timeCallback(d));
			}
			var hour = function(d){
				return Calendar.data.getHours(timeCallback(d));
			}
			var quarter = function(d){
				return Calendar.data.getQuarter(timeCallback(d));
			}

			var nest = d3.nest();

			nest.key(year)
				.key(week)
				.key(day)
				.key(hour)
				.key(quarter);

			var data = nest.map(data);
				
			return data;
		}
	}
	/* ************************** */
	/*
	 *  collection : parsed data collection
	 *  tomerge_data : parsed data to mege with collection
	 *  if data collision, default behavior is data update
	 *	
	 */
	 , merge: function(collection, tomerge_data, update){
	 	if(update == null) update = true;
	 	// http://stackoverflow.com/questions/11561350/javascript-how-to-get-keys-of-associative-array-to-array-variable
	 	function getKeys(obj, filter) {
		    var name,
		        result = [];
		    for (name in obj) {
		        if ((!filter || filter.test(name)) && obj.hasOwnProperty(name)) {
		            result[result.length] = parseInt(name);
		        }
		    }
		    return result;
		}
		/* 
		 * http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
		 */
		function intersection_destructive(a, b)
		{
		  var result = new Array();
		  while( a.length > 0 && b.length > 0 )
		  {  
		     if      (a[0] < b[0] ){ a.shift(); }
		     else if (a[0] > b[0] ){ b.shift(); }
		     else /* they're equal */
		     {
		       result.push(a.shift());
		       b.shift();
		     }
		  }

		  return result;
		}
		function intersect_safe(a, b)
		{
		  var ai=0, bi=0;
		  var result = new Array();

		  while( ai < a.length && bi < b.length )
		  {
		     if      (a[ai] < b[bi] ){ ai++; }
		     else if (a[ai] > b[bi] ){ bi++; }
		     else /* they're equal */
		     {
		       result.push(a[ai]);
		       ai++;
		       bi++;
		     }
		  }

		  return result;
		}
		/* 
		 * http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
		 */
		function merge_options(obj1,obj2){
		    var obj3 = {};
		    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		    return obj3;
		}
	 	var _merge = function(arrayA, arrayB, i){
			var el_a = getKeys(arrayA);
			var el_b = getKeys(arrayB);
			el_a.sort();
			el_b.sort();
			var intersec = intersection_destructive(el_a,el_b);
			for(var i in intersec){
				var el = _merge(arrayA[intersec[i]],arrayB[intersec[i]]);
				arrayB[intersec[i]] = el;
			}
			var safe_merge = merge_options(arrayA, arrayB);
			return safe_merge;
		}

		return _merge(collection, tomerge_data);
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
	 ,retreiveValueCallbackClosure: function(specializedFunc, aggregatFunc, filterFunc){
	 	
		var recurr = function(array, i){
			
			var logs = [];
			var value = specializedFunc(array);
			if(value != null && value != undefined && !isNaN(value)){
				return value;
			}
			else{
				for(var i in array){

					logs.push(recurr(array[i]));
				}
				if(aggregatFunc && typeof aggregatFunc == "function") {
					return aggregatFunc(logs);
				}
				
				return val;
			}
		}
		return function(){
			try{	
				var args = [];
				// get root 
				var period = arguments[0];
				
				for(var i=1; i< arguments.length;i++) args.push(arguments[i])
				// get through the tree using variable arguments
				for(var i in args) period = period[args[i]];
				//start recurrence 
				var val = recurr(period, 0);

				

				return val;
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
	,retreiveBoundsCallbackClosure : function(specializedTimeFunc, specializedFunc, aggregatFunc, filterFunc){
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
			try{
				var args = [];
				// get root 
				var period = arguments[0];
				for(var i=1; i< arguments.length;i++) args.push(arguments[i])
				// get through the tree using variable arguments
				for(var i in args) period = period[args[i]];
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
	, retreiveBoundsPercentCallbackClosure : function(){
		return function(){
			return {
					'min': 0
					, 'max': 100
				};
			
		}
	}
}