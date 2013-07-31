if (!("map" in Array.prototype)) {
    Array.prototype.map = function(mapper, that) {
        var other = new Array(this.length);
        for (var i = 0, n = this.length; i < n; i++) if (i in this) other[i] = mapper.call(that, this[i], i, this);
        return other;
    };
}

var Calendar = function(spec) {
    var me = this;
    me.height = spec.height || 600;
    me.width = spec.width || 800;
    me.margin = spec.margin;
    me.retreiveDataCallback = spec.retreiveDataCallback;
    me.retreiveValueCallback = spec.retreiveValueCallback;
    me.colorScheme = spec.colorScheme || [ "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850" ];
    me.noDataColor = spec.noDataColor || "#eee";
    me.buckets = me.colorScheme.length;
    me.visId = spec.visId || "#vis";
    me.legendId = spec.legendId || "#legend";
    me.tileClass = spec.tileClass || "tile";
    me.monthPathClass = spec.monthPathClass || "month_path";
    me.renderer = spec.renderer;
    me.current_renderer = me.renderer;
    me.duration = spec.duration || 800;
    me.upBound = spec.upBound || 80;
    me.downBound = spec.downBound || 20;
    me.name = spec.name || "";
    var range = [];
    for (var i = 0; i < me.buckets; i++) {
        range.push(i);
    }
    me.bucket = d3.scale.quantize().domain([ 20, 80 ]).range(range);
    me.svg = d3.select(me.visId).append("svg:svg").attr("width", me.width).attr("height", me.height).append("svg:g").attr("transform", "translate(" + 0 + "," + 0 + ")");
    me.createLegend();
};

var _createTiles = function() {
    var me = this;
    var args = arguments;
    data = [];
    label = [];
    if (me.current_renderer && me.current_renderer.clean && me.renderer != me.current_renderer) {
        me.current_renderer.clean.apply(me, arguments);
        me.current_renderer = me.renderer;
    }
    $("#title").text(me.name);
    var bbox = me.current_renderer.draw.apply(me, arguments);
    if (bbox && bbox.width) {
        var scale, decal = 0;
        if (bbox.width > me.width) {
            scale = me.width / bbox.width;
        } else {
            scale = 1;
            decal = (me.width - bbox.width) / 2;
        }
        me.svg.transition().duration(me.duration).attr("transform", "translate(" + decal + "," + 0 + ")" + "scale(" + scale + ")");
    }
};

Calendar.prototype.createTiles = function() {
    var me = this;
    if (me.retreiveDataCallback != null && typeof me.retreiveDataCallback == "function") {
        me._tempargs = arguments;
        me.retreiveDataCallback.apply(me, arguments);
    } else {
        _createTiles.apply(me, arguments);
    }
};

Calendar.prototype.draw = function(data) {
    var me = this;
    if (me._tempargs) {
        var args = [];
        args.splice(0, 0, data);
        for (var i = 0; i < me._tempargs.length; i++) args.push(me._tempargs[i]);
        _createTiles.apply(this, args);
    } else {
        _createTiles.apply(this, arguments);
    }
};

Calendar.prototype.createLegend = function() {
    var me = this;
    var html = "";
    for (var i = 0; i < me.buckets; i++) {
        html += "<li style='background:" + me.colorScheme[i] + "'></li>";
    }
    d3.select("#legend ul").html(html);
    me.setLegend();
};

Calendar.prototype.setLegend = function(bounds) {
    var check = function(a) {
        return a ? a : "";
    };
    var me = this;
    if (bounds) {
        d3.select("#legend .less").text(check(bounds.min));
        d3.select("#legend .more").text(check(bounds.max));
    } else {
        d3.select("#legend .less").text(me.downBound);
        d3.select("#legend .more").text(me.upBound);
    }
};

Calendar.prototype.setBucket = function(bounds) {
    var me = this;
    var range = [];
    for (var i = 0; i < me.buckets; i++) {
        range.push(i);
    }
    if (bounds) {
        me.bucket = d3.scale.quantize().domain([ bounds.min, bounds.max ]).range(range);
    } else {
        me.bucket = d3.scale.quantize().domain([ me.downBound, me.upBound ]).range(range);
    }
};

Calendar.prototype.tilesEnter = function(tiles) {
    return tiles.enter().insert("rect").classed(this.tileClass, true).attr("stroke-width", "2px").attr("fill", "#fff").attr("fill-opacity", 0);
};

Calendar.prototype.tilesUpdate = function() {};

Calendar.prototype.tilesExit = function(tiles) {
    tiles.exit().attr("fill-opacity", 0).remove();
};

Calendar.prototype.monthPathEnter = function(data_month, monthPath) {
    var paths = this.svg.selectAll("." + this.monthPathClass).data(data_month, function(d, i) {
        return i;
    });
    paths.enter().append("path").classed(this.monthPathClass, true).attr("stroke-width", "2px").attr("stroke", "#FFF").attr("fill-opacity", 0).attr("stroke-opacity", 1).attr("d", monthPath);
    paths.transition().duration(this.duration).attr("stroke", "#000").attr("stroke", "#000").attr("d", monthPath);
    paths.exit().remove();
    return paths;
};

Calendar.prototype.monthPathExit = function(data_month, monthPath) {
    this.svg.selectAll("." + this.monthPathClass).data([]).exit().remove();
};

Calendar.prototype.time = {};

Calendar.prototype.time.getDay = function(d) {
    var day = d.getDay();
    return day == 0 ? 6 : day - 1;
};

Calendar.prototype.time.getMonth = function(d) {
    var format = d3.time.format("%m");
    return parseInt(format(d));
};

Calendar.prototype.time.getWeek = function(d) {
    var format = d3.time.format("%W");
    return parseInt(format(d));
};

Calendar.prototype.getColor = function(val) {
    var me = this;
    var color = me.noDataColor;
    if (val != undefined && val != 0) {
        color = me.colorScheme[me.bucket(val)];
    }
    return color;
};

Calendar.renderer = {};

Calendar.animation = {
    fadeIn: function(transition, duration) {
        return transition.duration(duration).attr("fill-opacity", 1);
    },
    fadeOut: function(transition, duration) {
        return transition.duration(duration).attr("fill-opacity", 0).remove();
    }
};

Calendar.renderer.day = function() {
    var me = this;
    me.labels_hours;
    var _bounds = function(year, week, day) {
        var mondays = d3.time.mondays(new Date(year, 0, 1), new Date(year + 1, 0, 1));
        if (mondays && mondays[parseInt(week)]) {
            var firstday = mondays[week];
            firstday.setTime(firstday.getTime() + (parseInt(day) - 7) * 24 * 60 * 60 * 1e3);
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
        var colorize = function(d) {
            var day = d.getDay();
            var val = calendar.retreiveValueCallback(data, year, week, day == 0 ? 6 : day - 1, d.getHours());
            return calendar.getColor(val);
        };
        var cell_size = 36;
        var space_between_tiles = 2;
        var space_between_row = 15;
        var tiles_left_decal = 30;
        var label_fill = "darkgray";
        var label_fontsize = "12px";
        var hour_label_class = "day_hour_label";
        var hour_label_format = d3.time.format("%Hh");
        var quarter = function(d) {
            return Math.floor(d.getMinutes() / 15);
        };
        var initLabel = function(transform) {
            return transform.append("text").classed(hour_label_class, true).attr("fill", label_fill).attr("font-size", label_fontsize);
        };
        var calculTilePosX = function(d, i) {
            return Math.floor(d.getHours() / 6) * 4 * (space_between_row + cell_size + space_between_tiles) + quarter(d) * (cell_size + space_between_tiles) + tiles_left_decal;
        };
        var calculTilePosY = function(d, i) {
            return d.getHours() % 6 * (cell_size + space_between_tiles);
        };
        var calculLabelHourPosX = function(d, i) {
            return Math.floor(d.getHours() / 6) * 4 * (space_between_row + cell_size + space_between_tiles) + quarter(d) * (cell_size + space_between_tiles);
        };
        var calculLabelHourPosY = function(d, i) {
            return i % 6 * (cell_size + space_between_tiles) + 20;
        };
        var calculBBox = function() {
            return {
                width: 16 * (space_between_row + cell_size + space_between_tiles) + 3 * space_between_row + tiles_left_decal,
                height: 6 * (cell_size + space_between_tiles)
            };
        };
        var day_time = 24 * 60 * 60 * 1e3;
        var week_time = 7 * day_time;
        var svg = calendar.svg;
        var tiles = svg.selectAll("." + calendar.tileClass).data(getPeriod(start, day_time, d3.time.minutes, 15));
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", cell_size + "px").attr("height", cell_size + "px");
        tiles.transition().delay(function(d) {
            return quarter(d) * Math.random() * 50 + d.getHours() % 6 * Math.random() * 50 / calendar.duration;
        }).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", cell_size + "px").attr("height", cell_size + "px").attr("fill", colorize);
        calendar.tilesExit(tiles);
        var labels_hours_transition = function(attr) {};
        me.labels_hours = svg.selectAll("." + hour_label_class).data(getPeriod(start, day_time, d3.time.hours));
        initLabel(me.labels_hours.enter()).attr("x", calculLabelHourPosX).attr("y", calculLabelHourPosY).text(hour_label_format);
        Calendar.animation.fadeIn(me.labels_hours.transition(), calendar.duration).attr("x", calculLabelHourPosX).attr("y", calculLabelHourPosY).text(hour_label_format);
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

Calendar.renderer.week = function() {
    var me = this;
    me.labels_days;
    me.labels_hours;
    var _bounds = function(year, week) {
        var mondays = d3.time.mondays(new Date(year, 0, 1), new Date(year + 1, 0, 1));
        console.debug(week);
        if (mondays && mondays[week]) {
            var firstday = mondays[week];
            firstday.setTime(firstday.getTime() - 7 * 24 * 60 * 60 * 1e3);
            console.debug(firstday);
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
            start = d3.time.monday(bounds.start);
        } else {
            start = new Date(year, 0, 0);
            faked = true;
        }
        var getPeriod = function(start, period, callback) {
            return callback(start, new Date().setTime(start.getTime() + period));
        };
        var colorize = function(d) {
            var val = calendar.retreiveValueCallback(grab_data, year, week, calendar.time.getDay(d), d.getHours());
            return calendar.getColor(val);
        };
        var cell_size = 36;
        var space_between_tiles = 2;
        var tiles_left_decal = 85;
        var day_label_top_decal = 30;
        var tile_top_decal = 10;
        var hour_label_top_decal = 20;
        var hour_label_left_decal = 5;
        var label_fill = "darkgray";
        var label_fontsize = "14px";
        var day_label_class = "day_label";
        var hour_label_class = "hour_label";
        var _day_label_format = d3.time.format("%a %d %b");
        var day_label_format = function(d, i) {
            return i % 2 == 0 ? _day_label_format(d) : "";
        };
        var _hour_label_format = d3.time.format("%Hh");
        var hour_label_format = function(d, i) {
            return i % 2 == 0 ? _hour_label_format(d) : "";
        };
        var initLabel = function(transform, klass) {
            return transform.append("text").classed(klass, true).attr("fill", label_fill).attr("font-size", label_fontsize);
        };
        var calculTilePosX = function(d, i) {
            return tiles_left_decal + d.getHours() * (cell_size + space_between_tiles);
        };
        var calculTilePosY = function(d, i) {
            return calendar.time.getDay(d) * (cell_size + space_between_tiles) + hour_label_top_decal + tile_top_decal;
        };
        var calculLabelDayPosX = function(d, i) {
            return 0;
        };
        var calculLabelDayPosY = function(d, i) {
            return day_label_top_decal + i * (cell_size + space_between_tiles) + hour_label_top_decal;
        };
        var calculLabelHourPosX = function(d, i) {
            return tiles_left_decal + d.getHours() * (cell_size + space_between_tiles) + hour_label_left_decal;
        };
        var calculLabelHourPosY = function(d, i) {
            return hour_label_top_decal;
        };
        var calculBBox = function() {
            return {
                width: tiles_left_decal + 24 * (cell_size + space_between_tiles),
                height: 7 * (cell_size + space_between_tiles) + hour_label_top_decal
            };
        };
        var day_time = 24 * 60 * 60 * 1e3;
        var week_time = 7 * day_time;
        var svg = calendar.svg;
        var tiles = svg.selectAll("." + calendar.tileClass).data(getPeriod(start, week_time, d3.time.hours), function(d, i) {
            return i;
        });
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", cell_size + "px").attr("height", cell_size + "px");
        tiles.transition().delay(function(d) {
            return d.getHours() * 20 + calendar.time.getDay(d) * 20 + Math.random() * 50 / calendar.duration;
        }).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", cell_size + "px").attr("height", cell_size + "px").attr("fill", colorize);
        calendar.tilesExit(tiles);
        me.labels_days = svg.selectAll("." + day_label_class).data(getPeriod(start, week_time, d3.time.days), function(d, i) {
            return i;
        });
        initLabel(me.labels_days.enter(), day_label_class).attr("x", calculLabelDayPosX).attr("y", calculLabelDayPosY).text(day_label_format);
        Calendar.animation.fadeIn(me.labels_days.transition(), calendar.duration).text(day_label_format);
        Calendar.animation.fadeOut(me.labels_days.exit().transition(), calendar.duration);
        me.labels_hours = svg.selectAll("." + hour_label_class).data(getPeriod(start, day_time, d3.time.hours));
        initLabel(me.labels_hours.enter(), hour_label_class).attr("x", calculLabelHourPosX).attr("y", calculLabelHourPosY).text(hour_label_format);
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

Calendar.renderer.month = function() {
    var me = this;
    me.labels_months;
    me.label_year;
    me.draw = function(grab_data, year, month) {
        var calendar = this;
        var getPeriod = function(m, period) {
            return period(new Date(parseInt(year), parseInt(m), 1), new Date(parseInt(year), parseInt(m) + 1, 1));
        };
        var colorize = function(d) {
            var val = calendar.retreiveValueCallback(grab_data, year, calendar.time.getWeek(d), calendar.time.getDay(d));
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
        }
        var cell_size = 36;
        var margin = 20;
        var space_between_tiles = 2;
        var space_between_months = cell_size;
        var month_label_left_decal = 80;
        var year_label_top_decal = 146;
        var tiles_top_decal = 15;
        var tiles_left_decal = 20;
        var label_fill = "darkgray";
        var label_fontsize = "14px";
        var month_label_class = "month_label";
        var month_label_format = d3.time.format("%B");
        var year_label_class = "year_label";
        var year_label_format = d3.time.format("%Y");
        var initLabel = function(transform, klass) {
            return transform.append("text").classed(klass, true).attr("fill", label_fill).attr("font-size", label_fontsize);
        };
        var calculTilePosX = function(d, i) {
            return margin + tiles_left_decal + weeks[calendar.time.getWeek(d)] * (cell_size + space_between_tiles);
        };
        var calculTilePosY = function(d, i) {
            return margin + tiles_top_decal + calendar.time.getDay(d) * (cell_size + space_between_tiles);
        };
        var calculLabelMonthPosX = function(d, i) {
            return margin + month_label_left_decal + weeks[calendar.time.getWeek(d)] * (cell_size + space_between_tiles);
        };
        var calculLabelMonthPosY = function(d, i) {
            return margin;
        };
        var calculLabelYearPosX = function(d, i) {
            return -year_label_top_decal;
        };
        var calculLabelYearPosY = function(d, i) {
            return margin;
        };
        var calculBBox = function() {
            var j = 0;
            weeks.map(function() {
                j++;
            });
            return {
                width: tiles_left_decal + j * (cell_size + space_between_tiles) + delcalages * cell_size + 25,
                height: tiles_top_decal + 7 * (cell_size + space_between_tiles)
            };
        };
        function monthPath(t0) {
            var cell = cell_size + space_between_tiles;
            var decaled_cell = cell_size + space_between_tiles;
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0), d0 = +calendar.time.getDay(t0), w0 = +weeks[calendar.time.getWeek(t0)], d1 = +calendar.time.getDay(t1), w1 = +weeks[calendar.time.getWeek(t1)];
            return "M" + ((w0 + 1) * decaled_cell + tiles_left_decal + margin) + "," + (margin + d0 * cell + tiles_top_decal) + "H" + (w0 * decaled_cell + tiles_left_decal + margin) + "V" + (margin + 7 * cell + tiles_top_decal) + "H" + (w1 * decaled_cell + tiles_left_decal + margin) + "V" + (margin + (d1 + 1) * cell + tiles_top_decal) + "H" + ((w1 + 1) * decaled_cell + tiles_left_decal + margin) + "V" + (tiles_top_decal + margin) + "H" + ((w0 + 1) * decaled_cell + tiles_left_decal + margin) + "Z";
        }
        var day_time = 24 * 60 * 60 * 1e3;
        var week_time = 7 * day_time;
        var svg = calendar.svg;
        var tiles = svg.selectAll("." + calendar.tileClass).data(data);
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", cell_size + "px").attr("height", cell_size + "px");
        tiles.transition().delay(function(d) {
            return calendar.time.getWeek(d) * 20 + calendar.time.getDay(d) * 20 + Math.random() * 50 / calendar.duration;
        }).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", cell_size + "px").attr("height", cell_size + "px").attr("fill", colorize);
        calendar.tilesExit(tiles);
        calendar.monthPathEnter(data_month, monthPath);
        me.labels_months = svg.selectAll("." + month_label_class).data(data_month);
        initLabel(me.labels_months.enter(), month_label_class).attr("x", calculLabelMonthPosX).attr("y", calculLabelMonthPosY).text(month_label_format);
        Calendar.animation.fadeIn(me.labels_months.transition(), calendar.duration).attr("x", calculLabelMonthPosX).attr("y", calculLabelMonthPosY).text(month_label_format);
        me.labels_months.exit().remove();
        me.label_year = svg.selectAll("." + year_label_class).data(getPeriod(0, d3.time.years));
        initLabel(me.label_year.enter(), year_label_class).attr("transform", "rotate(-90)").attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).style("text-anchor", "middle").text(year_label_format);
        Calendar.animation.fadeIn(me.label_year.transition(), calendar.duration).attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).text(year_label_format);
        Calendar.animation.fadeOut(me.label_year.exit().transition(), calendar.duration);
        return calculBBox();
    };
    me.clean = function() {
        var calendar = this;
        calendar.monthPathExit();
        Calendar.animation.fadeOut(me.labels_months.transition(), calendar.duration);
        if (me.label_year) Calendar.animation.fadeOut(me.label_year.transition(), calendar.duration);
    };
    me.bounds = function(year, month) {
        if (month instanceof Array && month.length > 0) {
            if (month.length < 2) {
                return {
                    start: new Date(year, d3.min(month), 1),
                    end: new Date(year, d3.min(month) + 1, 1)
                };
            } else {
                return {
                    start: new Date(year, d3.min(month), 1),
                    end: new Date(year, d3.max(month) + 1, 1)
                };
            }
        } else {
            return {
                start: new Date(year, month, 1),
                end: new Date(year, month + 1, 1)
            };
        }
    };
    return me;
};

Calendar.renderer.year = function() {
    var me = this;
    me.labels_months;
    me.label_year;
    me.cache_bounds = {};
    me.draw = function(data, year) {
        var calendar = this;
        var getPeriod = function(y, period) {
            return period(new Date(parseInt(y), 0, 1), new Date(parseInt(y) + 1, 0, 1));
        };
        var colorize = function(d, i, u) {
            var val = calendar.retreiveValueCallback(data, d.getFullYear(), calendar.time.getWeek(d), calendar.time.getDay(d));
            return calendar.getColor(val);
        };
        var data_year;
        var data_year_label;
        var data_month;
        var first_year;
        var year_index = [];
        if (year instanceof Array) {
            data_year = [];
            data_year_label = [];
            data_month = [];
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
            }
        } else {
            first_year = year;
            year_index[year] = 0;
            data_year = getPeriod(year, d3.time.days);
            data_year_label = [ new Date(year, 0, 1) ];
            data_month = getPeriod(year, d3.time.months);
        }
        var cell_size = 36;
        var margin = 20;
        var space_between_tiles = 2;
        var space_between_years = cell_size * 2;
        var month_label_left_decal = 80;
        var year_label_top_decal = 146;
        var tiles_top_decal = 15;
        var tiles_left_decal = 20;
        var label_fill = "darkgray";
        var label_fontsize = "22px";
        var month_label_class = "month_label";
        var month_label_format = d3.time.format("%B");
        var year_label_class = "year_label";
        var year_label_format = d3.time.format("%Y");
        var year_height = 7 * cell_size + margin + tiles_top_decal + space_between_years;
        var initLabel = function(transform, klass) {
            return transform.append("text").classed(klass, true).attr("fill", label_fill).attr("font-size", label_fontsize);
        };
        var calculTilePosX = function(d, i) {
            return calendar.time.getWeek(d) * (cell_size + space_between_tiles) + margin + tiles_left_decal;
        };
        var calculTilePosY = function(d, i) {
            return year_height * year_index[d.getFullYear()] + margin + tiles_top_decal + calendar.time.getDay(d) * (cell_size + space_between_tiles);
        };
        var calculLabelYearPosX = function(d, i) {
            return -year_label_top_decal - year_height * year_index[d.getFullYear()];
        };
        var calculLabelYearPosY = function(d, i) {
            return +margin;
        };
        var calculBBox = function() {
            var j = 0;
            return {
                width: 53 * (cell_size + space_between_tiles) + tiles_left_decal + margin + 2 * cell_size,
                height: margin + tiles_top_decal + 7 * (cell_size + space_between_tiles)
            };
        };
        function monthPath(t0) {
            var decal = year_height * year_index[t0.getFullYear()];
            var cell = cell_size + space_between_tiles;
            var decaled_cell = cell_size + space_between_tiles;
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0), d0 = +calendar.time.getDay(t0), w0 = +calendar.time.getWeek(t0), d1 = +calendar.time.getDay(t1), w1 = +calendar.time.getWeek(t1);
            return "M" + ((w0 + 1) * decaled_cell + tiles_left_decal + margin) + "," + (margin + d0 * cell + tiles_top_decal + decal) + "H" + (w0 * decaled_cell + tiles_left_decal + margin) + "V" + (margin + 7 * cell + tiles_top_decal + decal) + "H" + (w1 * decaled_cell + tiles_left_decal + margin) + "V" + (margin + (d1 + 1) * cell + tiles_top_decal + decal) + "H" + ((w1 + 1) * decaled_cell + tiles_left_decal + margin) + "V" + (tiles_top_decal + margin + decal) + "H" + ((w0 + 1) * decaled_cell + tiles_left_decal + margin) + "Z";
        }
        var tiles = calendar.svg.selectAll("." + calendar.tileClass).data(data_year);
        calendar.tilesEnter(tiles).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("width", cell_size + "px").attr("height", cell_size + "px");
        tiles.transition().delay(function(d) {
            return calendar.time.getWeek(d) * 20 + calendar.time.getDay(d) * 20 + Math.random() * 50 / calendar.duration;
        }).attr("x", calculTilePosX).attr("y", calculTilePosY).attr("fill-opacity", 1).attr("width", cell_size + "px").attr("height", cell_size + "px").attr("fill", colorize);
        calendar.tilesExit(tiles);
        calendar.monthPathEnter(data_month, monthPath);
        me.label_year = calendar.svg.selectAll("." + year_label_class).data(data_year_label);
        initLabel(me.label_year.enter(), year_label_class).attr("transform", "rotate(-90)").attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).style("text-anchor", "middle").text(year_label_format);
        Calendar.animation.fadeIn(me.label_year.transition(), calendar.duration).attr("x", calculLabelYearPosX).attr("y", calculLabelYearPosY).text(year_label_format);
        Calendar.animation.fadeOut(me.label_year.exit().transition(), calendar.duration);
        return calculBBox();
    };
    me.clean = function() {
        var calendar = this;
        calendar.monthPathExit();
        Calendar.animation.fadeOut(me.label_year.transition(), calendar.duration);
    };
    me.bounds = function(year) {
        if (year instanceof Array && year.length > 0) {
            if (year.length < 2) {
                return {
                    start: new Date(d3.min(year), 0, 1),
                    end: new Date(d3.min(year) + 1, 0, 1)
                };
            } else {
                return {
                    start: new Date(d3.min(year), 0, 1),
                    end: new Date(d3.max(year) + 1, 0, 1)
                };
            }
        } else {
            return {
                start: new Date(year, 0, 1),
                end: new Date(year + 1, 0, 1)
            };
        }
    };
    return me;
};

Calendar.data = {
    create: function(timeCallback) {
        return function(data) {
            var year = function(d) {
                return timeCallback(d).getFullYear();
            };
            var day = function(d) {
                var day = timeCallback(d).getDay();
                return day == 0 ? 6 : day - 1;
            };
            var week = function(d) {
                var format = d3.time.format("%W");
                return parseInt(format(timeCallback(d)));
            };
            var hour = function(d) {
                return timeCallback(d).getHours();
            };
            var nest = d3.nest();
            nest.key(year).key(week).key(day).key(hour);
            return nest.map(data);
        };
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
            if (specializedFunc(array) != null) {
                return specializedFunc(array);
            } else {
                for (var i in array) {
                    logs.push(recurr(array[i]));
                }
                var val = aggregatFunc(logs);
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