calendar.js
==================

Calendar is a javascript library intended to facilitate creation of those kind of visualizations:

http://bl.ocks.org/mbostock/4063318

http://trends.truliablog.com/vis/tru247/

I did not conceive nor imagine those data visualizations, I just made a tool making them more accessible

Dependencies
============
Calendar is build upon the awesome D3.js and therefore require inclusion of both d3.js and jquery.js

Dev 
============
```javascript
// install smash, uglifyjs and jsdoc
npm install
make all
```

Usage
=====

```javascript
var timeserie = new Calendar.timeserie({
	time:function(d){ return new Date(d.logDate); }
	, indicator: function(d){ return d.taux_co2;  }
	, indicatorAggregation: d3.mean
});

var myCalendar = Calendar().timeserie(timeserie);

// synchronous data loading
d3.json("mokup/2013_day.json", function(raw){
	myCalendar.data(raw).createTiles(2013);
	
});
```

Different renderers can be used, arguments given to calendar.createTiles() depends on which renderer is loaded :

    - new Calendar.renderer.year() | calendar.createTiles(year);
    - new Calendar.renderer.month() | calendar.createTiles(year, month);
    - new Calendar.renderer.week() | calendar.createTiles(year, weekOfYear);
    - new Calendar.renderer.day() | calendar.createTiles(year, weekOfYear, dayOfWeek);	



