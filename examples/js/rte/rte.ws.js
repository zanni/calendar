var RteWS = function(spec) {
	var me = this;
	me.url = spec.url || 'localhost:8080';
	var formatTimeStampUrl = function (time){
		var str = time.getFullYear();
		str += "-";
		str +=time.getMonth() + 1;
		str += "-";
		str += time.getDate();
		return str;
	}
	me.jsonp = function(agg, fields, success){
		var getRTEURl = function (dateDebut, dateFin){
			var url =  "http://"+me.url+"/RTE-WS/mixenergys/"+agg+"/"+fields+"/between/jsonp/";
			if(dateDebut != null){
				url += formatTimeStampUrl(dateDebut)
			}
			if(dateFin != null){
				url += "/"+ formatTimeStampUrl(dateFin)
			}
			return url;
		}
		return function(start, end){
			var me = this;
			$.ajax({
				url : getRTEURl( start, end)
				, dataType : 'jsonp'
				, success : function(json){
					success(json, start, end);
				}
			});
		}
	}
}

var round = function(val, precision){
	var dec = Math.pow(10, precision);

	return Math.round(val*dec)/dec;
}

RteWS.specialization = {
	time : function(el){ return new Date(el.logDate); }
	, taux_co2 : function(d){  return d.taux_co2 ; }
	, consommation : function(d){ return d.consommation; }
	, nucleaire : function(d) { return d.nuceaire; }
	, product_co2 : function(d) {
		return (d.taux_co2 && d.consommation) ? round((d.taux_co2 * d.consommation / 1000000), 2) : null; 
	}
	, total_product_nrj : function(d) {
		return ((d.autres) ? d.autres : 0)
			+ ((d.charbon) ? d.charbon : 0)
			+ ((d.eolien) ? d.eolien : 0)
			+ ((d.fioul) ? d.fioul : 0)
			+ ((d.gaz) ? d.gaz : 0)
			+ ((d.hydrolique) ? d.hydrolique : 0)
			+ ((d.nucleaire) ? d.nucleaire : 0)
			+ ((d.pompage) ? d.pompage : 0)
			+ ((d.solaire) ? d.solaire : 0)
	}
	, total_ren: function(d) {
		return ((d.eolien) ? d.eolien : 0)
			+ ((d.hydrolique) ? d.hydrolique : 0)
			+ ((d.pompage) ? d.pompage : 0)
			+ ((d.solaire) ? d.solaire : 0)
	}
	, total_fossile_no_nucleaire : function(d) {
		return ((d.charbon) ? d.charbon : 0)
				+ ((d.fioul) ? d.fioul : 0)
				+ ((d.gaz) ? d.gaz : 0)
	}
	//{"autre":36804.0,"charbon":86179.0,"consommation":3174541.0,"":18326.0
	// ,"":-23833.0,"":-60345.0,"":8278.0,
	// "":-64385.0,"":-73422.0,"":-406301.0,
	, total_echange_comm : function(d) {
		return ((d.ech_physiques) ? d.ech_physiques : 0)
	}
	, taux_nucleaire : function(d) {

		// var conso = RteWS.specialization.total_product_nrj(d);
		var conso = d.consommation;
		return (d.nucleaire && conso) ? d.nucleaire * 100 / conso : null;
	}
	, taux_ren : function(d) {
		// var conso = RteWS.specialization.total_product_nrj(d);
		var conso = d.consommation;
		var nrj = RteWS.specialization.total_ren(d);
		return (nrj && conso) ? nrj * 100 / conso : null; 
	}
	, taux_fossile_no_nucleaire : function(d) {
		// var conso = RteWS.specialization.total_product_nrj(d);
		var conso = d.consommation;
		var nrj = RteWS.specialization.total_fossile_no_nucleaire(d);
		return (nrj && conso) ? nrj * 100 / conso : null; 
	}	
	, all : function(d) {
		// var conso = RteWS.specialization.total_product_nrj(d);
		var conso = d.consommation;
		var fossile = RteWS.specialization.total_fossile_no_nucleaire(d);
		var ren =  RteWS.specialization.total_ren(d);
		var nucleaire =  RteWS.specialization.nucleaire(d);
		var comm = RteWS.specialization.total_echange_comm(d)
		return (fossile && ren  && d.autre && d.pompage && d.nucleaire && conso && comm) ? (d.autre + d.pompage+comm + fossile + ren +d.nucleaire) * 100 / conso : null; 
	}	
};