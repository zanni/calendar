calendar.js
==================

Calendar is a javascript library intended to facilitate creation of those kind of visualizations:

http://bl.ocks.org/mbostock/4063318

http://trends.truliablog.com/vis/tru247/

I did not conceive nor imagine those data visualizations, I just made a tool making them more accessible

Dependencies
============
Calendar is build upon the awesome D3.js and therefore require inclusion of both d3.js and jquery.js

Examples
============

http://rte-ws.herokuapp.com/

http://rte-ws.herokuapp.com/basic.html

http://rte-ws.herokuapp.com/equalizer.html


Dev 
============
```javascript
// install smash and uglifyjs
npm install
make all
```

Usage
=====

```javascript
// Create time series specialization callbacks
var timeCallback = function(d){ return new Date(d.date); };
var dataCallback = function(d){ return d.tauxDeCo2;  };

// Create time serie parser
// parser take a time serie array: raw = [{ date:date, data:data ...}, {}, ... ]
// and transform it into a tree: [year][week][dayOfWeek][hour][quarter] 
var parser = Calendar.data.create(timeCallback);

// synchronous data loading
d3.json("mydata.json", function(raw){
    // parse raw data
    data = parser(raw);
    // Create valueCallback to automatically retreive and aggregate data whatever 
    // which renderer used
    var valueCallback = Calendar.data.retreiveValueCallbackClosure(dataCallback, d3.mean);
    var calendar = new Calendar( {
        name : "Basic example"
        // data is fully loaded when calendar is created
        , data : data
        // defining data renderer
        , renderer : new Calendar.renderer.year()
        , retreiveValueCallback : valueCallback
        , upBound : d3.max(raw, dataCallback)
        , downBound : d3.min(raw, dataCallback)
        , width : $("#container").width()
        , height: 800		
    });

    calendar.createTiles(2013);
}

```

Different renderers can be used, arguments given to calendar.createTiles() depends on which renderer is loaded :

    - new Calendar.renderer.year() | calendar.createTiles(year);
    - new Calendar.renderer.month() | calendar.createTiles(year, month);
    - new Calendar.renderer.week() | calendar.createTiles(year, weekOfYear);
    - new Calendar.renderer.day() | calendar.createTiles(year, weekOfYear, dayOfWeek);



