var EventManager = {
    trigger: function(ev, args) {
        if (!!this.listeners[ev]) {
            for (var i = 0; i < this.listeners[ev].length; i++) {
                this.listeners[ev][i].apply(window, [ args ]);
            }
        }
    },
    on: function(ev, fn) {
        EventManager.enable.call(this, ev);
        if (!this.listeners[ev]) {
            this.listeners[ev] = [];
        }
        if (fn instanceof Function) {
            this.listeners[ev].push(fn);
        }
    },
    remove: function(ev, fn) {
        if (!!this.listeners[ev] && this.listeners[ev].length > 0) {
            if (!!fn) {
                var fns = [];
                for (var i = 0; i < this.listeners[ev].length; i++) {
                    if (fn != this.listeners[ev][i]) {
                        fns.push(this.listeners[ev][i]);
                    }
                }
                this.listeners[ev] = fns;
            } else {
                this.listeners[ev] = [];
            }
        }
    },
    enable: function() {
        var self = this;
        if (!self.listeners) {
            self.listeners = {};
        }
        self.trigger = function(ev, args) {
            EventManager.trigger.call(self, ev, args);
        };
        self.on = function(ev, fn) {
            EventManager.on.call(self, ev, fn);
        };
        self.remove = function(ev, fn) {
            EventManager.remove.call(self, ev, fn);
        };
    }
};

var Calendar = function(spec) {
    var calendar = new CalendarObject(spec);
    var my = function() {};
    var timeserie = calendar.timeserie;
    my.timeserie = function(value) {
        if (!arguments.length) return timeserie;
        timeserie = value;
        calendar.timeserie = timeserie;
        calendar.retreiveValueCallback = timeserie.retreiveValueCallback;
        calendar.data = timeserie.parsed;
        calendar.upBound = timeserie.max();
        calendar.downBound = timeserie.min();
        calendar.setBucket();
        return my;
    };
    var data = calendar._data;
    my.data = function(value) {
        if (!arguments.length) return calendar._data;
        data = value;
        calendar.data = calendar.timeserie.data(value);
        calendar.upBound = timeserie.max();
        calendar.downBound = timeserie.min();
        calendar.setBucket();
        return my;
    };
    var grab = calendar.retreiveDataCallback;
    my.grab = function(value) {
        if (!arguments.length) return grab;
        grab = value;
        calendar.retreiveDataCallback = grab;
        return my;
    };
    var renderer = calendar._renderer;
    my.renderer = function(value) {
        if (value == "year") value = new Calendar.renderer.year(); else if (value == "month") value = new Calendar.renderer.month(); else if (value == "week") value = new Calendar.renderer.week(); else if (value == "day") value = new Calendar.renderer.day();
        if (!arguments.length) return renderer;
        renderer = value;
        calendar.renderer = renderer;
        return my;
    };
    my.color = function(scheme) {
        calendar.colorScheme = scheme;
        if (calendar.legend) calendar.legend.recolor();
        return my;
    };
    my.createTiles = function() {
        calendar.createTiles.apply(calendar, arguments);
    };
    return my;
};

Calendar.renderer = {};

Calendar.decorator = {};

Calendar.animation = {
    fadeIn: function(transition, duration) {
        return transition.duration(duration).attr("fill-opacity", 1);
    },
    fadeOut: function(transition, duration) {
        return transition.duration(duration).attr("fill-opacity", 0).remove();
    }
};

var CalendarObject = function(spec) {
    var me = this;
    var settings = {
        height: null,
        width: 960,
        margin: {
            top: 0,
            bottom: 0
        },
        adaptiveHeight: true,
        visId: "#vis",
        decoratorId: "#decorator_top",
        decoratorBottomId: "#decorator_bottom",
        tileClass: "tile",
        monthPathClass: "month_path",
        renderer: new Calendar.renderer.year(),
        decorators: [],
        noDataColor: "#eee",
        colorScheme: [ "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850" ],
        noDataColor: "#eee",
        label_fill: "darkgray",
        label_fontsize: "22px",
        interactive: false,
        animation: false,
        duration: 800,
        drawLegend: false,
        drawHorodator: false,
        timeserie: null
    };
    $.extend(me, settings);
    $.extend(me, spec);
    me.current_renderer = me.renderer;
    if (!me.animation) me.duration = 0;
    me.eventManager = {};
    EventManager.enable.call(me.eventManager);
    if (me.timeserie) {
        me.retreiveValueCallback = me.timeserie.retreiveValueCallback;
        me.data = me.timeserie.parsed;
        me.upBound = me.timeserie.max();
        me.downBound = me.timeserie.min();
    }
    var range = [];
    for (var i = 0; i < me.colorScheme.length; i++) {
        range.push(i);
    }
    me.bucket = d3.scale.quantize().domain([ me.downBound, me.upBound ]).range(range);
    me.svg = d3.select(me.visId).append("svg:svg").attr("width", me.width).attr("height", me.adaptiveHeight ? 0 : me.height).append("svg:g").attr("transform", "translate(" + 0 + "," + 0 + ")");
    d3.select(me.decoratorId).style("margin", "20px 0");
    if (me.drawLegend) {
        me.legend = new Calendar.decorator.legend();
        me.decorators.push(me.legend);
    }
    if (me.drawHorodator) {
        me.horodator = new Calendar.decorator.horodator();
        me.decorators.push(me.horodator);
    }
};

var _createTiles = function() {
    var me = this;
    for (var i in me.decorators) {
        if (me.decorators[i] && typeof me.decorators[i].draw == "function") {
            me.decorators[i].draw.apply(me);
        }
    }
    var bounds = {
        min: me.timeserie.min(),
        max: me.timeserie.max()
    };
    me.setBucket(bounds);
    if (me.legend) me.setLegend(bounds);
    if (me.horodator) me.setHorodator(me.timeserie.start(), me.timeserie.end());
    data = [];
    label = [];
    var renderer_switched = false;
    if (me.current_renderer && me.current_renderer.clean && me.renderer != me.current_renderer) {
        me.current_renderer.clean.apply(me, arguments);
        me.current_renderer = me.renderer;
        renderer_switched = true;
    }
    var bbox = me.current_renderer.draw.apply(me, arguments);
    if (bbox && bbox.width && bbox.height) {
        var scale = decal_w = decal_h = 0;
        var delta_h = me.height - bbox.height;
        if (me.adaptiveHeight) delta_h = 1;
        var delta_w = me.width - bbox.width;
        if (delta_h > 0 && delta_w > 0) {
            scale = 1;
            decal_h = (me.height - bbox.height) / 2;
            decal_w = (me.width - bbox.width) / 2;
        } else if (delta_h < 0 && delta_w > 0) {
            scale = me.height / bbox.height;
            decal_w = (me.width - scale * bbox.width) / 2;
        } else if (delta_h > 0 && delta_w < 0) {
            scale = me.width / bbox.width;
            decal_h = (me.height - scale * bbox.height) / 2;
        } else if (delta_h < 0 && delta_w < 0) {
            if (delta_h < delta_w) {
                scale = me.height / bbox.height;
                decal_w = (me.width - scale * bbox.width) / 2;
            } else {
                scale = me.width / bbox.width;
                decal_h = (me.height - scale * bbox.height) / 2;
            }
        }
        if (me.adaptiveHeight) {
            decal_h = 0;
            var height = scale * bbox.height;
            d3.select(me.visId + " svg").transition().duration(me.duration).attr("height", height);
        }
        if (renderer_switched) {
            me.svg.transition().duration(me.duration).attr("transform", "translate(" + decal_w + "," + decal_h + ")" + "scale(" + scale + ")");
        } else {
            me.svg.attr("transform", "translate(" + decal_w + "," + 0 + ")" + "scale(" + scale + ")");
        }
    }
};

CalendarObject.prototype.createTiles = function() {
    var me = this;
    if (me.retreiveDataCallback != null && typeof me.retreiveDataCallback == "function") {
        me._tempargs = arguments;
        me.retreiveDataCallback.apply(me, arguments);
    } else if (me.data) {
        me._tempargs = arguments;
        var args = [];
        args.push(me.data);
        for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
        _createTiles.apply(me, args);
    } else {
        _createTiles.apply(me, arguments);
    }
};

CalendarObject.prototype.draw = function(data, mergeData) {
    var me = this;
    if (me.timeserie) {
        if (typeof mergeData == "boolean" && mergeData) me.timeserie.merge(data); else {
            me.timeserie.data(data);
        }
        me.data = me.timeserie.data();
    } else {
        me.data = data;
    }
    if (me._tempargs) {
        var args = [];
        args.splice(0, 0, me.data);
        for (var i = 0; i < me._tempargs.length; i++) args.push(me._tempargs[i]);
        _createTiles.apply(this, args);
    } else {
        _createTiles.apply(this, arguments);
    }
};

CalendarObject.prototype.setLegend = function(bounds) {
    var check = function(a) {
        return a ? a : "";
    };
    var me = this;
    me.setBucket(bounds);
    if (bounds) {
        me.legend.refresh(check(bounds.min), check(bounds.max));
    } else {
        me.legend.refresh(check(me.downBound), check(me.upBound));
    }
};

CalendarObject.prototype.setHorodator = function(start, end) {
    var check = function(a) {
        return a ? me.renderer.horodator_format(a) : "";
    };
    var me = this;
    me.horodator.refresh(check(start), check(end));
};

CalendarObject.prototype.setBucket = function(bounds) {
    var me = this;
    var range = [];
    for (var i = 0; i < me.colorScheme.length; i++) {
        range.push(i);
    }
    if (bounds) {
        me.bucket = d3.scale.quantize().domain([ bounds.min, bounds.max ]).range(range);
    } else {
        me.bucket = d3.scale.quantize().domain([ me.downBound, me.upBound ]).range(range);
    }
};

CalendarObject.prototype.tilesEnter = function(tiles) {
    var me = this;
    return tiles.enter().append("rect").classed(this.tileClass, true).attr("stroke-width", "2px").attr("fill-opacity", 0);
};

CalendarObject.prototype.tilesUpdate = function(tiles) {
    var me = this;
    if (me.interactive) {
        return tiles.on("mouseover", function(d, i) {
            me.eventManager.trigger("tile:mouseenter", {
                time: d,
                value: d3.select(this).attr("data")
            });
        }).on("mouseout", function(d, i) {
            me.eventManager.trigger("tile:mouseout", {
                time: d,
                value: d3.select(this).attr("data")
            });
        }).on("click", function(d, i) {
            me.eventManager.trigger("tile:click", {
                time: d,
                value: d3.select(this).attr("data")
            });
        }).attr("cursor", "pointer");
    }
    return tiles;
};

CalendarObject.prototype.tilesExit = function(tiles) {
    tiles.exit().attr("fill-opacity", 0).remove();
};

CalendarObject.prototype.monthPathEnter = function(data_month, monthPath) {
    var paths = this.svg.selectAll("." + this.monthPathClass).data(data_month, function(d, i) {
        return d.getFullYear() + "-" + d.getMonth();
    });
    paths.enter().insert("path").classed(this.monthPathClass, true).attr("stroke-width", "2px").attr("stroke", "#FFF").attr("fill-opacity", 0).attr("stroke-opacity", 1).attr("z-index", 0).attr("fill-opacity", 0).attr("d", monthPath);
    paths.transition().duration(this.duration).attr("stroke", "#000").attr("stroke", "#000").attr("stroke-opacity", 1).attr("d", monthPath);
    paths.exit().remove();
    return paths;
};

CalendarObject.prototype.monthPathExit = function(data_month, monthPath) {
    this.svg.selectAll("." + this.monthPathClass).attr("stroke-opacity", 0);
};

CalendarObject.prototype.labelEnter = function(renderer, transform, klass) {
    var me = this;
    var label = transform.append("text").classed(klass, true).attr("fill", renderer.label_fill).attr("font-size", renderer.label_fontsize);
    if (me.interactive) {
        label = label.attr("cursor", "pointer");
    }
    return label;
};

CalendarObject.prototype.decoratorEnter = function(id, float, position, interactive) {
    var me = this;
    return d3.select(position && position == "bottom" ? me.decoratorBottomId : me.decoratorId).style("cursor", interactive ? "pointer" : "cursor").append("div").attr("id", id).style("color", "#777").style("border", "1px solid #f0f0f0").style("background", "#f3f3f3").style("font-size", "11px").style("-moz-border-radius", "3px").style("border-radius", "3px").style("height", "40px").style("float", float ? float : "right").style("margin-left", "10px");
};

CalendarObject.prototype.decoratorTextEnter = function(decorator) {
    var me = this;
    return decorator.append("p").style("font-size", "14px").style("margin-right", "15px").style("margin-left", "15px");
};

CalendarObject.prototype.time = {};

CalendarObject.prototype.time.getDay = function(d) {
    return Calendar.data.getDay(d);
};

CalendarObject.prototype.time.getMonth = function(d) {
    var format = d3.time.format("%m");
    return parseInt(format(d));
};

CalendarObject.prototype.time.getWeek = function(d) {
    return Calendar.data.getWeek(d);
};

CalendarObject.prototype.getColor = function(val) {
    var me = this;
    var color = me.noDataColor;
    if (val != undefined && val != 0) {
        color = me.colorScheme[me.bucket(val)];
    }
    return color;
};

Calendar.data = {
    week_format: d3.time.format("%W"),
    firstDayOfWeek: d3.time.mondays,
    _firstDayOfWeek: d3.time.monday,
    getYear: function(d) {
        return parseInt(d.getFullYear());
    },
    getDay: function(d) {
        var time = d.getTime() - Calendar.data._firstDayOfWeek(d).getTime();
        return Math.floor(parseInt(time) / (24 * 36e5));
    },
    getDayOfYear: function(d) {
        var start = new Date(d.getFullYear(), 0, 0);
        var diff = d - start;
        var oneDay = 1e3 * 60 * 60 * 24;
        return Math.ceil(diff / oneDay);
    },
    getWeek: function(d) {
        return parseInt(Calendar.data.week_format(d));
    },
    getHours: function(d) {
        return parseInt(d.getHours());
    },
    getQuarter: function(d) {
        return parseInt(Math.floor(parseInt(d.getMinutes()) / 15));
    },
    create: function(timeCallback) {
        return function(data) {
            var year = function(d) {
                return Calendar.data.getYear(timeCallback(d));
            };
            var day = function(d) {
                return Calendar.data.getDay(timeCallback(d));
            };
            var week = function(d) {
                return Calendar.data.getWeek(timeCallback(d));
            };
            var hour = function(d) {
                return Calendar.data.getHours(timeCallback(d));
            };
            var quarter = function(d) {
                return Calendar.data.getQuarter(timeCallback(d));
            };
            var nest = d3.nest();
            nest.key(year).key(week).key(day).key(hour).key(quarter);
            var data = nest.map(data);
            return data;
        };
    },
    merge: function(collection, tomerge_data, update) {
        if (update == null) update = true;
        function getKeys(obj, filter) {
            var name, result = [];
            for (name in obj) {
                if ((!filter || filter.test(name)) && obj.hasOwnProperty(name)) {
                    result[result.length] = parseInt(name);
                }
            }
            return result;
        }
        function intersection_destructive(a, b) {
            var result = new Array();
            while (a.length > 0 && b.length > 0) {
                if (a[0] < b[0]) {
                    a.shift();
                } else if (a[0] > b[0]) {
                    b.shift();
                } else {
                    result.push(a.shift());
                    b.shift();
                }
            }
            return result;
        }
        function intersect_safe(a, b) {
            var ai = 0, bi = 0;
            var result = new Array();
            while (ai < a.length && bi < b.length) {
                if (a[ai] < b[bi]) {
                    ai++;
                } else if (a[ai] > b[bi]) {
                    bi++;
                } else {
                    result.push(a[ai]);
                    ai++;
                    bi++;
                }
            }
            return result;
        }
        function merge_options(obj1, obj2) {
            var obj3 = {};
            for (var attrname in obj1) {
                obj3[attrname] = obj1[attrname];
            }
            for (var attrname in obj2) {
                obj3[attrname] = obj2[attrname];
            }
            return obj3;
        }
        var _merge = function(arrayA, arrayB, i) {
            var el_a = getKeys(arrayA);
            var el_b = getKeys(arrayB);
            el_a.sort();
            el_b.sort();
            var intersec = intersection_destructive(el_a, el_b);
            for (var i in intersec) {
                var el = _merge(arrayA[intersec[i]], arrayB[intersec[i]]);
                arrayB[intersec[i]] = el;
            }
            var safe_merge = merge_options(arrayA, arrayB);
            return safe_merge;
        };
        return _merge(collection, tomerge_data);
    },
    bounds: function(valueCallback) {
        return function(data) {
            var result = [];
            data.map(function(d) {
                result.push(valueCallback(d));
            });
            return {
                min: d3.round(d3.min(result)),
                max: d3.round(d3.max(result)),
                mean: d3.round(d3.mean(result)),
                median: d3.round(d3.median(result))
            };
        };
    },
    retreiveValueCallbackClosure: function(specializedFunc, aggregatFunc, filterFunc) {
        var recurr = function(array, i) {
            var logs = [];
            var value = specializedFunc(array);
            if (value != null && value != undefined && !isNaN(value)) {
                return value;
            } else {
                for (var i in array) {
                    logs.push(recurr(array[i]));
                }
                if (aggregatFunc && typeof aggregatFunc == "function") {
                    return aggregatFunc(logs);
                }
                return val;
            }
        };
        return function() {
            try {
                var args = [];
                var period = arguments[0];
                for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
                for (var i in args) period = period[args[i]];
                var val = recurr(period, 0);
                return val;
            } catch (err) {
                return null;
            }
        };
    },
    retreiveBoundsCallbackClosure: function(specializedTimeFunc, specializedFunc, aggregatFunc, filterFunc) {
        var findStart = function(array, i) {
            var logs = [];
            if (array != null && specializedFunc(array) != null && specializedTimeFunc(array) != undefined) {
                return specializedTimeFunc(array);
            } else {
                for (var j in array) {
                    return findStart(array[j]);
                }
            }
        };
        var recurr = function(array, i) {
            var logs = [];
            if (array != null && specializedFunc(array) != null) {
                return specializedFunc(array);
            } else {
                for (var j in array) {
                    logs = logs.concat(recurr(array[j]));
                }
                return logs;
            }
        };
        return function() {
            try {
                var args = [];
                var period = arguments[0];
                for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
                for (var i in args) period = period[args[i]];
                var logs = recurr(period, 0);
                var start = findStart(period, 0);
                return {
                    min: d3.round(d3.min(logs), 2),
                    max: d3.round(d3.max(logs), 2),
                    mean: d3.round(d3.mean(logs), 2),
                    median: d3.round(d3.median(logs), 2),
                    start: start
                };
            } catch (err) {
                return null;
            }
        };
    },
    retreiveBoundsPercentCallbackClosure: function() {
        return function() {
            return {
                min: 0,
                max: 100
            };
        };
    }
};

Calendar.timeserie = function(spec) {
    var me = this;
    me.time = spec.time || function(d) {
        d.time;
    };
    me.indicator = spec.indicator || function(d) {
        d.value;
    };
    me.indicatorAggregation = spec.indicatorAggregation || d3.mean;
    me.raw = [];
    me.parsed = {};
    me.parser = Calendar.data.create(me.time);
    me.retreiveValueCallback = Calendar.data.retreiveValueCallbackClosure(me.indicator, me.indicatorAggregation);
    me.max = function() {
        return d3.max(me.raw, me.indicator);
    };
    me.min = function() {
        return d3.min(me.raw, me.indicator);
    };
    me.mean = function() {
        return d3.mean(me.raw, me.indicator);
    };
    me.start = function() {
        return d3.min(me.raw, me.time);
    };
    me.end = function() {
        return d3.max(me.raw, me.time);
    };
    me.data = function(raw) {
        if (!arguments.length) return me.parsed;
        me.raw = raw;
        me.parsed = me.parser(raw);
        return me.parsed;
    };
    me.merge = function(raw) {
        me.raw = me.raw.concat(raw);
        me.raw.sort(function(a, b) {
            return a < b ? 1 : -1;
        });
        $.extend(true, me.parsed, me.parser(raw));
        return me.parsed;
    };
};

Calendar.renderer.day = function(spec) {
    var me = this;
    var settings = {
        cell_size: 36,
        margin: 20,
        space_between_tiles: 2,
        space_between_row: 15,
        tiles_left_decal: 30,
        label_fill: "darkgray",
        label_fontsize: "12px",
        hour_label_class: "day_hour_label",
        hour_label_format: d3.time.format("%Hh"),
        horodator_format: d3.time.format("%Y %B %d"),
        hovered_format: d3.time.format("%Hh:%M")
    };
    $.extend(me, settings);
    $.extend(me, spec);
    me.labels_hours;
    var _bounds = function(year, week, day) {
        var mondays = Calendar.data.firstDayOfWeek(new Date(year, 0, 0), new Date(year + 1, 0, 7));
        if (mondays && mondays[parseInt(week)]) {
            var firstday = mondays[week];
            firstday.setTime(firstday.getTime() + parseInt(day) * 24 * 60 * 60 * 1e3 - 7 * 24 * 60 * 60 * 1e3);
            var end = new Date();
            end.setTime(firstday.getTime() + 24 * 60 * 60 * 1e3);
            return {
                start: firstday,
                end: end
            };
        }
    };
    me.draw = function(data, year, week, day) {
        var calendar = this;
        var bounds = _bounds(year, week, day);
        var start;
        if (bounds && bounds.start) {
            start = d3.time.day(bounds.start);
        } else {
            start = new Date(year, 0, 0);
        }
        var getPeriod = function(start, period, callback, step) {
            return callback(start, new Date().setTime(start.getTime() + period), step ? step : 1);
        };
        var getValue = function(d, i, u) {
            return calendar.retreiveValueCallback(data, Calendar.data.getYear(d), Calendar.data.getWeek(d), Calendar.data.getDay(d), Calendar.data.getHours(d), Calendar.data.getQuarter(d));
        };
        var colorize = function(val) {
            return calendar.getColor(val);
        };
        var quarter = function(d) {
            return Math.floor(d.getMinutes() / 15);
        };
        var calculTilePosX = function(d, i) {
            return Math.floor(d.getHours() / 6) * 4 * (me.space_between_row + me.cell_size + me.space_between_tiles) + quarter(d) * (me.cell_size + me.space_between_tiles) + me.tiles_left_decal;
        };
        var calculTilePosY = function(d, i) {
            return me.margin + d.getHours() % 6 * (me.cell_size + me.space_between_tiles);
        };
        var calculLabelHourPosX = function(d, i) {
            return Math.floor(d.getHours() / 6) * 4 * (me.space_between_row + me.cell_size + me.space_between_tiles) + quarter(d) * (me.cell_size + me.space_between_tiles);
        };
        var calculLabelHourPosY = function(d, i) {
            return me.margin + i % 6 * (me.cell_size + me.space_between_tiles) + 20;
        };
        var calculBBox = function() {
            return {
                width: 16 * (me.space_between_row + me.cell_size + me.space_between_tiles) + 3 * me.space_between_row + me.tiles_left_decal,
                height: 6 * (me.cell_size + me.space_between_tiles) + 30
            };
        };
        var day_time = 24 * 60 * 60 * 1e3;
        var week_time = 7 * day_time;
        var svg = calendar.svg;
        var tiles = svg.selectAll("." + calendar.tileClass).data(getPeriod(start, day_time, d3.time.minutes, 15), function(d, i) {
            return i;
        });
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px");
        calendar.tilesUpdate(tiles).transition().duration(calendar.duration).delay(function(d) {
            return quarter(d) * Math.random() * 50 + d.getHours() % 6 * Math.random() * 50 / calendar.duration;
        }).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px").attr("fill", function(d) {
            var val = getValue(d);
            this.setAttributeNS("http://www.example.com/d3.calendar", "data", val);
            return colorize(val);
        });
        calendar.tilesExit(tiles);
        var labels_hours_transition = function(attr) {};
        me.labels_hours = svg.selectAll("." + me.hour_label_class).data(getPeriod(start, day_time, d3.time.hours));
        calendar.labelEnter(me, me.labels_hours.enter(), me.hour_label_class).attr("x", calculLabelHourPosX).attr("y", calculLabelHourPosY).attr("cursor", "cursor").text(me.hour_label_format);
        Calendar.animation.fadeIn(me.labels_hours.transition(), calendar.duration).attr("x", calculLabelHourPosX).attr("y", calculLabelHourPosY).text(me.hour_label_format);
        Calendar.animation.fadeOut(me.labels_hours.exit().transition(), calendar.duration);
        return calculBBox();
    };
    me.clean = function() {
        var calendar = this;
        Calendar.animation.fadeOut(me.labels_hours.transition(), calendar.duration);
    };
    me.bounds = function(year, week, day) {
        return _bounds(year, week, day);
    };
    return me;
};

Calendar.renderer.week = function(spec) {
    var me = this;
    var settings = {
        cell_size: 36,
        space_between_tiles: 2,
        tiles_left_decal: 85,
        day_label_top_decal: 30,
        tile_top_decal: 10,
        hour_label_top_decal: 20,
        hour_label_left_decal: 5,
        label_fill: "darkgray",
        label_fontsize: "14px",
        day_label_class: "day_label",
        hour_label_class: "hour_label",
        _day_label_format: d3.time.format("%a %d %b"),
        horodator_format: d3.time.format("%Y, week %W"),
        hovered_format: d3.time.format("%d %Hh")
    };
    $.extend(me, settings);
    $.extend(me, spec);
    me.labels_days;
    me.labels_hours;
    var _bounds = function(year, week) {
        var mondays = Calendar.data.firstDayOfWeek(new Date(year, 0, 1), new Date(year + 1, 0, 7));
        if (mondays && mondays[week]) {
            var firstday = mondays[week];
            firstday.setTime(firstday.getTime() - 7 * 24 * 60 * 60 * 1e3);
            var lastday = new Date();
            lastday.setTime(firstday.getTime() + 7 * 24 * 60 * 60 * 1e3);
            return {
                start: firstday,
                end: lastday
            };
        }
    };
    me.draw = function(grab_data, year, week) {
        var calendar = this;
        var bounds = _bounds(year, week);
        var start;
        if (bounds && bounds.start) {
            start = bounds.start;
        } else {
            start = new Date(year, 0, 0);
            faked = true;
        }
        var getPeriod = function(start, period, callback) {
            return callback(start, new Date().setTime(start.getTime() + period));
        };
        var getValue = function(d) {
            return calendar.retreiveValueCallback(grab_data, year, week, calendar.time.getDay(d), d.getHours());
        };
        var colorize = function(val) {
            return calendar.getColor(val);
        };
        var day_label_format = function(d, i) {
            return i % 2 == 0 ? me._day_label_format(d) : "";
        };
        var _hour_label_format = d3.time.format("%Hh");
        var hour_label_format = function(d, i) {
            return i % 2 == 0 ? _hour_label_format(d) : "";
        };
        var calculTilePosX = function(d, i) {
            return me.tiles_left_decal + d.getHours() * (me.cell_size + me.space_between_tiles);
        };
        var calculTilePosY = function(d, i) {
            return calendar.time.getDay(d) * (me.cell_size + me.space_between_tiles) + me.hour_label_top_decal + me.tile_top_decal;
        };
        var calculLabelDayPosX = function(d, i) {
            return 0;
        };
        var calculLabelDayPosY = function(d, i) {
            return me.day_label_top_decal + i * (me.cell_size + me.space_between_tiles) + me.hour_label_top_decal;
        };
        var calculLabelHourPosX = function(d, i) {
            return me.tiles_left_decal + d.getHours() * (me.cell_size + me.space_between_tiles) + me.hour_label_left_decal;
        };
        var calculLabelHourPosY = function(d, i) {
            return me.hour_label_top_decal;
        };
        var calculBBox = function() {
            return {
                width: me.tiles_left_decal + 24 * (me.cell_size + me.space_between_tiles),
                height: 7 * (me.cell_size + me.space_between_tiles) + me.hour_label_top_decal + 40
            };
        };
        var day_time = 24 * 60 * 60 * 1e3;
        var week_time = 7 * day_time;
        var svg = calendar.svg;
        var tiles = svg.selectAll("." + calendar.tileClass).data(getPeriod(start, week_time, d3.time.hours), function(d, i) {
            return i;
        });
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px");
        calendar.tilesUpdate(tiles).transition().duration(calendar.duration).delay(function(d) {
            if (!calendar.animation) return 0;
            return d.getHours() * 20 + calendar.time.getDay(d) * 20 + Math.random() * 50 / calendar.duration;
        }).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px").attr("value", getValue).attr("fill", function(d) {
            var val = getValue(d);
            this.setAttributeNS("http://www.example.com/d3.calendar", "data", val);
            return colorize(val);
        });
        calendar.tilesExit(tiles);
        me.labels_days = svg.selectAll("." + me.day_label_class).data(getPeriod(start, week_time, d3.time.days), function(d, i) {
            return i;
        });
        calendar.labelEnter(me, me.labels_days.enter(), me.day_label_class).attr("x", calculLabelDayPosX).attr("y", calculLabelDayPosY).on("mouseover", function(d, i) {
            calendar.eventManager.trigger("label:day:mouseover", d);
        }).on("mouseout", function(d, i) {
            calendar.eventManager.trigger("label:day:mouseout", d);
        }).on("click", function(d, i) {
            calendar.eventManager.trigger("label:day:click", d);
        }).text(day_label_format);
        Calendar.animation.fadeIn(me.labels_days.transition(), calendar.duration).text(day_label_format);
        Calendar.animation.fadeOut(me.labels_days.exit().transition(), calendar.duration);
        me.labels_hours = svg.selectAll("." + me.hour_label_class).data(getPeriod(start, day_time, d3.time.hours), function(d, i) {
            return i;
        });
        calendar.labelEnter(me, me.labels_hours.enter(), me.hour_label_class).attr("x", calculLabelHourPosX).attr("y", calculLabelHourPosY).text(hour_label_format);
        Calendar.animation.fadeIn(me.labels_hours.transition(), calendar.duration).attr("x", calculLabelHourPosX).attr("y", calculLabelHourPosY).text(hour_label_format);
        Calendar.animation.fadeOut(me.labels_hours.exit().transition(), calendar.duration);
        return calculBBox();
    };
    me.clean = function() {
        var calendar = this;
        Calendar.animation.fadeOut(me.labels_days.transition(), calendar.duration);
        Calendar.animation.fadeOut(me.labels_hours.transition(), calendar.duration);
    };
    me.bounds = function(year, week) {
        return _bounds(year, week);
    };
    return me;
};

Calendar.renderer.month = function(spec) {
    var me = this;
    var settings = {
        cell_size: 36,
        margin: 40,
        space_between_tiles: 2,
        space_between_months: 36,
        month_label_left_decal: 80,
        year_label_top_decal: 146,
        tiles_top_decal: 15,
        tiles_left_decal: 20,
        label_fill: "darkgray",
        label_fontsize: "14px",
        month_label_class: "month_label",
        week_label_class: "week_label",
        year_label_class: "year_label",
        month_label_format: d3.time.format("%B"),
        year_label_format: d3.time.format("%Y"),
        horodator_format: d3.time.format("%B, %Y"),
        hovered_format: d3.time.format("%B %d %Hh")
    };
    $.extend(me, settings);
    $.extend(me, spec);
    me.labels_months;
    me.label_year;
    me.label_weeks;
    me.draw = function(grab_data, year, month) {
        var calendar = this;
        var getPeriod = function(m, period) {
            return period(new Date(parseInt(year), parseInt(m), 1), new Date(parseInt(year), parseInt(m) + 1, 1));
        };
        var getValue = function(d, i, u) {
            return calendar.retreiveValueCallback(grab_data, year, calendar.time.getWeek(d), calendar.time.getDay(d));
        };
        var colorize = function(val) {
            return calendar.getColor(val);
        };
        var data = [];
        var data_month = [];
        var first_month;
        var delcalages = 0;
        if (month instanceof Array) {
            month.sort(function(a, b) {
                return a - b;
            });
            for (var m in month) {
                if (!first_month) first_month = month[m];
                data = data.concat(getPeriod(month[m], d3.time.days));
                data_month = data_month.concat(getPeriod(month[m], d3.time.months));
            }
        } else {
            first_month = month;
            data = getPeriod(month, d3.time.days);
            data_month = getPeriod(month, d3.time.months);
        }
        var current_week_index = 0;
        var prev_week;
        var weeks = [];
        var weeks_label = [];
        for (var d in data) {
            if (prev_week < calendar.time.getWeek(data[d])) {
                current_week_index++;
                if (calendar.time.getWeek(data[d]) - prev_week > 1) {
                    delcalages++;
                    current_week_index++;
                }
            }
            prev_week = calendar.time.getWeek(data[d]);
            weeks[calendar.time.getWeek(data[d])] = current_week_index;
            weeks_label.push(data[d]);
        }
        var calculTilePosX = function(d, i) {
            return me.margin + me.tiles_left_decal + weeks[calendar.time.getWeek(d)] * (me.cell_size + me.space_between_tiles);
        };
        var calculTilePosY = function(d, i) {
            return me.margin + me.tiles_top_decal + calendar.time.getDay(d) * (me.cell_size + me.space_between_tiles);
        };
        var calculLabelMonthPosX = function(d, i) {
            return me.margin + me.month_label_left_decal + weeks[calendar.time.getWeek(d)] * (me.cell_size + me.space_between_tiles);
        };
        var calculLabelMonthPosY = function(d, i) {
            return me.margin;
        };
        var calculLabelYearPosX = function(d, i) {
            return -me.year_label_top_decal;
        };
        var calculLabelYearPosY = function(d, i) {
            return me.margin;
        };
        var calculLabelWeekPosX = function(d, i) {
            return 20 + me.margin + me.tiles_left_decal + weeks[calendar.time.getWeek(d)] * (me.cell_size + me.space_between_tiles);
        };
        var calculLabelWeekPosY = function(d, i) {
            return me.margin + me.tiles_top_decal + 8 * (me.cell_size + me.space_between_tiles);
        };
        var calculBBox = function() {
            var j = 0;
            weeks.map(function() {
                j++;
            });
            return {
                width: me.tiles_left_decal + j * (me.cell_size + me.space_between_tiles) + delcalages * me.cell_size + 25,
                height: me.tiles_top_decal + 7 * (me.cell_size + me.space_between_tiles) + 100
            };
        };
        function monthPath(t0) {
            var cell = me.cell_size + me.space_between_tiles;
            var decaled_cell = me.cell_size + me.space_between_tiles;
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0), d0 = +calendar.time.getDay(t0), w0 = +weeks[calendar.time.getWeek(t0)], d1 = +calendar.time.getDay(t1), w1 = +weeks[calendar.time.getWeek(t1)];
            return "M" + ((w0 + 1) * decaled_cell + me.tiles_left_decal + me.margin) + "," + (me.margin + d0 * cell + me.tiles_top_decal) + "H" + (w0 * decaled_cell + me.tiles_left_decal + me.margin) + "V" + (me.margin + 7 * cell + me.tiles_top_decal) + "H" + (w1 * decaled_cell + me.tiles_left_decal + me.margin) + "V" + (me.margin + (d1 + 1) * cell + me.tiles_top_decal) + "H" + ((w1 + 1) * decaled_cell + me.tiles_left_decal + me.margin) + "V" + (me.tiles_top_decal + me.margin) + "H" + ((w0 + 1) * decaled_cell + me.tiles_left_decal + me.margin) + "Z";
        }
        var day_time = 24 * 60 * 60 * 1e3;
        var week_time = 7 * day_time;
        var svg = calendar.svg;
        calendar.monthPathEnter(data_month, monthPath);
        var tiles = svg.selectAll("." + calendar.tileClass).data(data, function(d) {
            return Calendar.data.getYear(d) + "-" + Calendar.data.getDayOfYear(d);
        });
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px");
        calendar.tilesUpdate(tiles).transition().duration(calendar.duration).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px").attr("fill", function(d) {
            var val = getValue(d);
            this.setAttributeNS("http://www.example.com/d3.calendar", "data", val);
            return colorize(val);
        });
        calendar.tilesExit(tiles);
        me.labels_months = svg.selectAll("." + me.month_label_class).data(data_month, function(d, i) {
            return Calendar.data.getDayOfYear(d);
        });
        calendar.labelEnter(me, me.labels_months.enter(), me.month_label_class).attr("x", calculLabelMonthPosX).attr("y", calculLabelMonthPosY).text(me.month_label_format);
        Calendar.animation.fadeIn(me.labels_months.transition(), calendar.duration).attr("x", calculLabelMonthPosX).attr("y", calculLabelMonthPosY).text(me.month_label_format);
        me.labels_months.exit().remove();
        me.label_year = svg.selectAll("." + me.year_label_class).data(getPeriod(0, d3.time.years), function(d, i) {
            return i;
        });
        calendar.labelEnter(me, me.label_year.enter(), me.year_label_class).attr("transform", "rotate(-90)").attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).style("text-anchor", "middle").text(me.year_label_format);
        Calendar.animation.fadeIn(me.label_year.transition(), calendar.duration).attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).text(me.year_label_format);
        Calendar.animation.fadeOut(me.label_year.exit().transition(), calendar.duration);
        me.label_weeks = calendar.svg.selectAll("." + me.week_label_class).data(weeks_label, function(d, i) {
            return d.getFullYear() + "-" + Calendar.data.getWeek(d);
        });
        calendar.labelEnter(me, me.label_weeks.enter(), me.week_label_class).attr("x", calculLabelWeekPosX).attr("y", calculLabelWeekPosY).on("mouseover", function(d, i) {
            calendar.eventManager.trigger("label:week:mouseover", d);
        }).on("mouseout", function(d, i) {
            calendar.eventManager.trigger("label:week:mouseout", d);
        }).on("click", function(d, i) {
            calendar.eventManager.trigger("label:week:click", d);
        }).style("text-anchor", "middle").text(calendar.time.getWeek);
        Calendar.animation.fadeIn(me.label_weeks.transition(), calendar.duration).attr("x", calculLabelWeekPosX).attr("y", calculLabelWeekPosY).text(calendar.time.getWeek);
        Calendar.animation.fadeOut(me.label_weeks.exit().transition(), calendar.duration);
        return calculBBox();
    };
    me.clean = function() {
        var calendar = this;
        calendar.monthPathExit();
        Calendar.animation.fadeOut(me.labels_months.transition(), calendar.duration);
        if (me.label_year) Calendar.animation.fadeOut(me.label_year.transition(), calendar.duration);
        Calendar.animation.fadeOut(me.label_weeks.transition(), calendar.duration);
    };
    me.bounds = function(year, month) {
        if (month instanceof Array && month.length > 0) {
            return {
                start: new Date(year, d3.min(month), 1),
                end: new Date(year, d3.max(month) + 1, 1)
            };
        } else {
            return {
                start: new Date(year, month, 1),
                end: new Date(year, month + 1, 1)
            };
        }
    };
    return me;
};

Calendar.renderer.year = function(spec) {
    var me = this;
    var settings = {
        cell_size: 36,
        margin: 40,
        space_between_tiles: 2,
        space_between_years: 36 * 2,
        month_label_left_decal: 80,
        year_label_top_decal: 146,
        week_label_left_decal: 20,
        week_label_top_decal: 20,
        tiles_top_decal: 15,
        tiles_left_decal: 20,
        label_fill: "darkgray",
        label_fontsize: "22px",
        month_label_class: "month_label",
        month_label_format: d3.time.format("%B"),
        year_label_class: "year_label",
        week_label_class: "week_label",
        year_label_format: d3.time.format("%Y"),
        horodator_format: d3.time.format("%Y"),
        hovered_format: d3.time.format("%B %d")
    };
    $.extend(me, settings);
    $.extend(me, spec);
    me.labels_months;
    me.label_year;
    me.label_weeks;
    me.cache_bounds = {};
    me.draw = function(data, year) {
        var calendar = this;
        var getPeriod = function(y, period) {
            return period(new Date(parseInt(y), 0, 1), new Date(parseInt(y) + 1, 0, 1));
        };
        var getValue = function(d, i, u) {
            return calendar.retreiveValueCallback(data, d.getFullYear(), calendar.time.getWeek(d), calendar.time.getDay(d));
        };
        var colorize = function(val) {
            return calendar.getColor(val);
        };
        var data_year;
        var data_year_label;
        var data_month;
        var data_week_label;
        var first_year;
        var year_index = [];
        var nb_year = 0;
        if (year instanceof Array) {
            nb_year = year.length;
            data_year = [];
            data_year_label = [];
            data_month = [];
            data_week_label = [];
            year.sort(function(a, b) {
                return a - b;
            });
            var j = 0;
            for (var i in year) {
                year_index[year[i]] = j++;
                if (!first_year) first_year = year[i];
                data_year = data_year.concat(getPeriod(year[i], d3.time.days));
                data_year_label.push(new Date(year[i], 1, 1));
                data_month = data_month.concat(getPeriod(year[i], d3.time.months));
                data_week_label = data_week_label.concat(getPeriod(year[i], Calendar.data.firstDayOfWeek));
            }
        } else {
            nb_year = 1;
            first_year = year;
            year_index[year] = 0;
            data_year = getPeriod(year, d3.time.days);
            data_year_label = [ new Date(year, 0, 1) ];
            data_month = getPeriod(year, d3.time.months);
            data_week_label = getPeriod(year, Calendar.data.firstDayOfWeek);
        }
        var year_height = 7 * me.cell_size + me.margin + me.tiles_top_decal + me.space_between_years;
        var calculTilePosX = function(d, i) {
            return calendar.time.getWeek(d) * (me.cell_size + me.space_between_tiles) + me.margin + me.tiles_left_decal;
        };
        var calculTilePosY = function(d, i) {
            return year_height * year_index[d.getFullYear()] + me.margin + me.tiles_top_decal + calendar.time.getDay(d) * (me.cell_size + me.space_between_tiles);
        };
        var calculLabelMonthPosX = function(d, i) {
            return me.margin + me.month_label_left_decal + calendar.time.getWeek(d) * (me.cell_size + me.space_between_tiles);
        };
        var calculLabelMonthPosY = function(d, i) {
            return year_height * year_index[d.getFullYear()] + me.margin;
        };
        var calculLabelYearPosX = function(d, i) {
            return -me.year_label_top_decal - year_height * year_index[d.getFullYear()];
        };
        var calculLabelYearPosY = function(d, i) {
            return +me.margin;
        };
        var calculLabelWeekPosX = function(d, i) {
            return me.week_label_left_decal + calendar.time.getWeek(d) * (me.cell_size + me.space_between_tiles) + me.margin + me.tiles_left_decal;
        };
        var calculLabelWeekPosY = function(d, i) {
            return me.week_label_top_decal + year_height * year_index[d.getFullYear()] + me.margin + me.tiles_top_decal + 7 * (me.cell_size + me.space_between_tiles);
        };
        var calculBBox = function() {
            var j = 0;
            return {
                width: 53 * (me.cell_size + me.space_between_tiles) + me.tiles_left_decal + me.margin + 2 * me.cell_size,
                height: nb_year * year_height
            };
        };
        function monthPath(t0) {
            var decal = year_height * year_index[t0.getFullYear()];
            var cell = me.cell_size + me.space_between_tiles;
            var decaled_cell = me.cell_size + me.space_between_tiles;
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0), d0 = +calendar.time.getDay(t0), w0 = +calendar.time.getWeek(t0), d1 = +calendar.time.getDay(t1), w1 = +calendar.time.getWeek(t1);
            return "M" + ((w0 + 1) * decaled_cell + me.tiles_left_decal + me.margin) + "," + (me.margin + d0 * cell + me.tiles_top_decal + decal) + "H" + (w0 * decaled_cell + me.tiles_left_decal + me.margin) + "V" + (me.margin + 7 * cell + me.tiles_top_decal + decal) + "H" + (w1 * decaled_cell + me.tiles_left_decal + me.margin) + "V" + (me.margin + (d1 + 1) * cell + me.tiles_top_decal + decal) + "H" + ((w1 + 1) * decaled_cell + me.tiles_left_decal + me.margin) + "V" + (me.tiles_top_decal + me.margin + decal) + "H" + ((w0 + 1) * decaled_cell + me.tiles_left_decal + me.margin) + "Z";
        }
        calendar.monthPathEnter(data_month, monthPath);
        var tiles = calendar.svg.selectAll("." + calendar.tileClass).data(data_year, function(d) {
            return Calendar.data.getYear(d) + "-" + Calendar.data.getDayOfYear(d);
        });
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px");
        calendar.tilesUpdate(tiles).transition().delay(function(d) {
            return calendar.time.getWeek(d) * 20 + calendar.time.getDay(d) * 20 + Math.random() * 50 / calendar.duration;
        }).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", me.cell_size + "px").attr("height", me.cell_size + "px").attr("fill", function(d) {
            var val = getValue(d);
            this.setAttributeNS("http://www.example.com/d3.calendar", "data", val);
            return colorize(val);
        });
        calendar.tilesExit(tiles);
        me.labels_months = calendar.svg.selectAll("." + me.month_label_class).data(data_month, function(d, i) {
            return d.getFullYear() + "-" + d.getMonth();
        });
        calendar.labelEnter(me, me.labels_months.enter(), me.month_label_class).attr("x", calculLabelMonthPosX).attr("y", calculLabelMonthPosY).on("mouseover", function(d, i) {
            calendar.eventManager.trigger("label:month:mouseover", d);
        }).on("mouseout", function(d, i) {
            calendar.eventManager.trigger("label:month:mouseout", d);
        }).on("click", function(d, i) {
            calendar.eventManager.trigger("label:month:click", d);
        }).text(me.month_label_format);
        Calendar.animation.fadeIn(me.labels_months.transition(), calendar.duration).attr("x", calculLabelMonthPosX).attr("y", calculLabelMonthPosY).text(me.month_label_format);
        me.labels_months.exit().remove();
        me.label_year = calendar.svg.selectAll("." + me.year_label_class).data(data_year_label, function(d, i) {
            return i;
        });
        calendar.labelEnter(me, me.label_year.enter(), me.year_label_class).attr("transform", "rotate(-90)").attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).on("mouseover", function(d, i) {
            calendar.eventManager.trigger("label:year:mouseover", d);
        }).on("mouseout", function(d, i) {
            calendar.eventManager.trigger("label:year:mouseout", d);
        }).on("click", function(d, i) {
            calendar.eventManager.trigger("label:year:click", d);
        }).style("text-anchor", "middle").text(me.year_label_format);
        Calendar.animation.fadeIn(me.label_year.transition(), calendar.duration).attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).text(me.year_label_format);
        Calendar.animation.fadeOut(me.label_year.exit().transition(), calendar.duration);
        me.label_weeks = calendar.svg.selectAll("." + me.week_label_class).data(data_week_label, function(d, i) {
            return d.getFullYear() + "-" + Calendar.data.getWeek(d);
        });
        calendar.labelEnter(me, me.label_weeks.enter(), me.week_label_class).attr("x", calculLabelWeekPosX).attr("y", calculLabelWeekPosY).on("mouseover", function(d, i) {
            calendar.eventManager.trigger("label:week:mouseover", d);
        }).on("mouseout", function(d, i) {
            calendar.eventManager.trigger("label:week:mouseout", d);
        }).on("click", function(d, i) {
            calendar.eventManager.trigger("label:week:click", d);
        }).style("text-anchor", "middle").text(calendar.time.getWeek);
        Calendar.animation.fadeIn(me.label_weeks.transition(), calendar.duration).attr("x", calculLabelWeekPosX).attr("y", calculLabelWeekPosY).text(calendar.time.getWeek);
        Calendar.animation.fadeOut(me.label_weeks.exit().transition(), calendar.duration);
        return calculBBox();
    };
    me.clean = function() {
        var calendar = this;
        calendar.monthPathExit();
        if (me.label_year) Calendar.animation.fadeOut(me.label_year.transition(), calendar.duration);
        if (me.labels_months) Calendar.animation.fadeOut(me.labels_months.transition(), calendar.duration);
        if (me.label_weeks) Calendar.animation.fadeOut(me.label_weeks.transition(), calendar.duration);
    };
    me.bounds = function(year) {
        if (year instanceof Array && year.length > 0) {
            return {
                start: new Date(d3.min(year), 0, 1),
                end: new Date(d3.max(year) + 1, 0, 1)
            };
        } else {
            return {
                start: new Date(year, 0, 1),
                end: new Date(year + 1, 0, 1)
            };
        }
    };
    return me;
};

var previousDecorator = function(spec) {
    var me = this;
    me.id = "drillthrough_previous";
    if (!spec) spec = {};
    me.float = spec.float || "right";
    me.position = spec.position || "top";
    me.draw = function() {
        var calendar = this;
        me.decorator = calendar.decoratorEnter(me.id, me.float, me.position, true);
        me.decorator.on("click", function(d, i) {
            calendar.eventManager.trigger("previous:click");
        });
        me.node = calendar.decoratorTextEnter(me.decorator).text("previous");
    };
    me.clean = function() {
        var previous = d3.select("#" + me.id).remove();
    };
};

Calendar.renderer.drillthrough = function(spec) {
    var me = this;
    if (!spec) spec = {};
    me.possible_display = spec.possible_display;
    me.current_renderer = spec.current_renderer || new Calendar.renderer.year();
    me.horodator_format = me.current_renderer.horodator_format;
    me.hovered_format = me.current_renderer.hovered_format;
    var previous_btn = new previousDecorator({
        "float": "left",
        position: "top"
    });
    me.previous = [];
    me.current_display = null;
    me.draw = function() {
        var calendar = this;
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        me.current_display = {
            renderer: new Calendar.renderer.year(),
            args: args
        };
        var display = function(display) {
            calendar.renderer = display.renderer;
            calendar.createTiles.apply(calendar, display.args);
        };
        display(me.current_display);
        calendar.eventManager.on("tile:click", function(d) {
            if (me.previous.length == 0) {
                previous_btn.draw.apply(calendar);
            }
            me.previous.push(me.current_display);
            me.current_display = {
                renderer: new Calendar.renderer.day(),
                args: [ d.time.getFullYear(), calendar.time.getWeek(d.time), calendar.time.getDay(d.time), "quarter" ]
            };
            display(me.current_display);
        });
        calendar.eventManager.on("label:month:click", function(d) {
            if (me.previous.length == 0) {
                previous_btn.draw.apply(calendar);
            }
            me.previous.push(me.current_display);
            me.current_display = {
                renderer: new Calendar.renderer.month(),
                args: [ d.getFullYear(), calendar.time.getMonth(d) - 1, "day" ]
            };
            display(me.current_display);
        });
        calendar.eventManager.on("label:year:click", function(d) {
            if (me.previous.length == 0) {
                previous_btn.draw.apply(calendar);
            }
            me.previous.push(me.current_display);
            me.current_display = {
                renderer: new Calendar.renderer.year(),
                args: [ d.getFullYear(), "day" ]
            };
            display(me.current_display);
        });
        calendar.eventManager.on("label:week:click", function(d) {
            if (me.previous.length == 0) {
                previous_btn.draw.apply(calendar);
            }
            me.previous.push(me.current_display);
            me.current_display = {
                renderer: new Calendar.renderer.week(),
                args: [ d.getFullYear(), calendar.time.getWeek(d), "hour" ]
            };
            display(me.current_display);
        });
        calendar.eventManager.on("label:day:click", function(d) {
            if (me.previous.length == 0) {
                previous_btn.draw.apply(calendar);
            }
            me.previous.push(me.current_display);
            me.current_display = {
                renderer: new Calendar.renderer.day(),
                args: [ d.getFullYear(), calendar.time.getWeek(d), calendar.time.getDay(d), "quarter" ]
            };
            display(me.current_display);
        });
        calendar.eventManager.on("previous:click", function(d) {
            var view = me.previous.pop();
            if (!view) {
                return;
            }
            if (me.previous.length == 0) {
                previous_btn.clean.apply(calendar);
            }
            me.current_display = view;
            display(view);
        });
    };
    me.clean = function() {
        var calendar = this;
        return me.current_renderer.clean.apply(calendar, arguments);
    };
    me.bounds = function(year, week, day) {
        var calendar = this;
        return me.current_renderer.bounds.apply(calendar, arguments);
    };
    return me;
};

Calendar.decorator.legend = function(spec) {
    var me = this;
    if (!spec) spec = {};
    me.float = spec.float || "left";
    me.position = spec.position || "top";
    var drawn = false;
    me.draw = function() {
        var calendar = this;
        me.calendar = calendar;
        if (!drawn) drawn = true; else return;
        me.node = calendar.decoratorEnter(me.id, me.float, me.position);
        me.less = me.node.append("p").classed("less", true).style("float", "left").style("font-size", "14px").style("margin-right", "15px").style("margin-left", "15px");
        var tiles_size = 14;
        me.colors = me.node.append("ul").style("display", "inline").style("padding-left", "0 ").style("padding-top", "4px").style("float", "left").style("list-style-type", "none");
        me.colors_data = me.colors.selectAll("li").data(calendar.colorScheme, function(d, i) {
            return i;
        }).enter().append("li").style("background", function(d) {
            return d;
        }).style("float", "left").style("width", tiles_size + "px").style("height", tiles_size + "px");
        me.more = me.node.append("p").classed("more", true).style("float", "left").style("font-size", "14px").style("margin-right", "15px").style("margin-left", "15px");
        me.node.transition().duration(calendar.duration).style("opacity", 1);
    };
    me.refresh = function(down, up) {
        if (!drawn) return;
        me.less.text(down);
        me.more.text(up);
    };
    me.recolor = function() {
        var tiles = me.colors.selectAll("li").data(me.calendar.colorScheme, function(d, i) {
            return i;
        });
        tiles.style("background", function(d) {
            return d;
        }).style("float", "left").style("width", "14px").style("height", "14px");
        tiles.exit().remove();
    };
};

Calendar.decorator.horodator = function(spec) {
    var me = this;
    me.id = "decorator_horodator";
    if (!spec) spec = {};
    me.float = spec.float || "left";
    me.position = spec.position || "top";
    var drawn = false;
    me.draw = function() {
        var calendar = this;
        if (!drawn) drawn = true; else return;
        me.decorator = calendar.decoratorEnter(me.id, me.float, me.position);
        me.node = calendar.decoratorTextEnter(me.decorator);
    };
    me.refresh = function(start, end) {
        var calendar = this;
        if (me.node) me.node.text(start);
    };
    me.clean = function() {
        var previous = d3.select("#" + me.id).remove();
    };
};

Calendar.decorator.hovered = function(spec) {
    var me = this;
    me.id = "hovered";
    if (!spec) spec = {};
    me.float = spec.float || "right";
    me.position = spec.position || "top";
    var drawn = false;
    me.draw = function() {
        var calendar = this;
        calendar.eventManager.on("tile:mouseenter", function(d) {
            me.decorator.style("display", "block");
            me.refresh(calendar.renderer.hovered_format(d.time) + " - " + d.value);
        });
        calendar.eventManager.on("tile:mouseout", function(d) {});
        if (!drawn) drawn = true; else return;
        me.decorator = calendar.decoratorEnter(me.id, me.float, me.position);
        me.decorator.style("display", "none");
        me.node = calendar.decoratorTextEnter(me.decorator);
    };
    me.refresh = function(value) {
        var calendar = this;
        if (me.node) me.node.text(value);
    };
    me.clean = function() {
        var previous = d3.select("#" + me.id).remove();
    };
};