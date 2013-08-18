var RteCalendar = function(spec){
	/* ************************** */
	/* 
		RTE PARSER 
	*/
	var rte_parser = Calendar.data.create(RteWS.specialization.time);

	/* ************************** */
	/* 
		RTE WS INITILIZATION 
	*/
	var rte_ws = spec.rte_ws;

	/* ************************** */
	/* 
		DATA RETRIEVING CLOSURE DEFINITION

		Ok I probably loose myself in javascripts closures but
		let's explain :
	*/
	// I want the closure to be first specialized with data grabbing 
	// function in order to calculate bounds when data will be grabbed. 
	// This information is related to the current view definition
	var rte_datagrab_closure = function(specializedFunc, fields){
		// use Calendar.data.bounds to create func
		var computeBounds = Calendar.data.bounds(specializedFunc);

		// Then I want the callback to be specialized with URL 
		// attributes (aggregation method)
		// Those definition change depending on user event and are not related 
		// with data specialization
		return function(agg){

			// Then I use collected information in order to grabb the data
			// from rte_ws and display it in calendar view
			return function(){
				var me = this;
				// RTE WS JSONP REQUEST FACILITY
				var request = rte_ws.jsonp(agg, fields, function(json, start, end){
					// compute bounds with previously intialized method
					var bounds = computeBounds(json);
					// refresh Buckets and Legend
					me.setBucket(bounds);
					
					// draw calendar view
					me.draw(rte_parser(json));

					me.setLegend(bounds);
					me.setHorodator(start, end);
				});
				if(me.renderer.bounds){
					var bounds = me.renderer.bounds.apply(me, arguments);
					// var bounds = me.renderer.bounds( arguments);
					if(bounds){
						request(bounds.start, bounds.end);
					}
					
				}
			}
		}
	}

	/* ************************** */
	/* 
		COLORBREWER UTIL
	*/
	var getColorBrewerScheme = function(scheme, buckets, inverse){
		var color = colorbrewer[scheme][buckets];
		if(inverse){
			return color.reverse();
		}
		return color;
	}
	/* ************************** */
	/* 
		VIEWS DEFINITION
	*/
	var possible_displays = {
		/* ************************** */
		/* 
			TAUX CO2 en g/KWh
		*/
		taux_co2 : {
			name : "Co2 produit par kWh consomme (g)"
			, rte_closure : Calendar.data.retreiveValueCallbackClosure(
				RteWS.specialization.taux_co2
				, d3.mean
			)
			, rte_datagrab_closure: rte_datagrab_closure(
				RteWS.specialization.taux_co2, "taux_co2"
			)
			, fields : "taux_co2"
			, colorScheme : getColorBrewerScheme('Spectral', 11, true)
		}
		/* ************************** */
		/* 
			CONSOMMATION en MWh
		*/
		, consommation : {
			name : "Consommation (MWh)"
			, rte_closure : Calendar.data.retreiveValueCallbackClosure(
				RteWS.specialization.consommation
				, d3.mean
			)
			, rte_datagrab_closure: rte_datagrab_closure(
				RteWS.specialization.consommation, "consommation"
			)
			, fields : "consommation"
			, colorScheme : getColorBrewerScheme('Blues', 9, true)
		}
		/* ************************** */
		/* 
			TAUX_CO2 * CONSOMMATION (tonnes)
		*/
		, taux_co2_consommation : {
			name : "CO2 Produit en tonne"
			, rte_closure : Calendar.data.retreiveValueCallbackClosure(
				RteWS.specialization.product_co2
				, d3.sum
			)
			, rte_datagrab_closure: rte_datagrab_closure(
				RteWS.specialization.product_co2, "taux_co2,consommation"
			)
			, fields : "taux_co2,consommation"
			, colorScheme : getColorBrewerScheme('Greens', 9, true)
		}
		/* ************************** */
		/* 
			PART DE NUCLEAIRE DANS L ENERGIE PRODUITE (%)
		*/
		, nucleaire : {
			name : "Pourcentage de nucleaire"
			, rte_closure : Calendar.data.retreiveValueCallbackClosure(
				RteWS.specialization.taux_nucleaire
				, d3.mean
			)
			, rte_datagrab_closure: rte_datagrab_closure(
				RteWS.specialization.taux_nucleaire, "nucleaire,consommation"
			)
			, fields : "nucleaire,consommation"
			, colorScheme : getColorBrewerScheme('PuBu', 9, true)
		}
		/* ************************** */
		/* 
			PART D ENERGIES RENOUVELABLES DANS L ENERGIE PRODUITE (%)
		*/
		, nrj_ren : {
			name : "Pourcentage de energie renouvelable"
			, rte_closure : Calendar.data.retreiveValueCallbackClosure(
				RteWS.specialization.taux_ren
				, d3.mean
			)
			, rte_datagrab_closure: rte_datagrab_closure(
				RteWS.specialization.taux_ren, "consommation,eolien,hydrolique,solaire"
			)
			, fields : "consommation,eolien,hydrolique,solaire"
			, colorScheme : getColorBrewerScheme('Greens', 9,false)
		}
		/* ************************** */
		/* 
			PART D ENERGIE FOSSILE (HORS NUCLEAIRE) DANS L ENERGIE PRODUITE (%)
		*/
		, fossile : {
			name : "Pourcentage d'energie fossile (hors nucleaire)'"
			, rte_closure : Calendar.data.retreiveValueCallbackClosure(
				RteWS.specialization.taux_fossile_no_nucleaire
				, d3.mean
			)
			, rte_datagrab_closure: rte_datagrab_closure(
				RteWS.specialization.taux_fossile_no_nucleaire,"consommation,nucleaire,charbon,fioul,gaz"
			)
			, fields : "consommation,nucleaire,charbon,fioul,gaz"
			, colorScheme : getColorBrewerScheme('RdYlGn', 9, true)
		}
		/* ************************** */
		/* 
			ALL
		*/
		, all : {
			name : "test"
			, rte_closure : Calendar.data.retreiveValueCallbackClosure(
				RteWS.specialization.all
				, d3.mean
			)
			, rte_datagrab_closure: rte_datagrab_closure(
				RteWS.specialization.all,"*"
			)
			, fields : "*"
			, colorScheme : getColorBrewerScheme('RdYlGn', 9, true)
		}
	}

	return possible_displays;
};