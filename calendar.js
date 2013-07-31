// Fix map for IE
"map" in Array.prototype || (Array.prototype.map = function(e, t) {
  var n = new Array(this.length);
  for (var r = 0, i = this.length; r < i; r++) r in this && (n[r] = e.call(t, this[r], r, this));
  return n;
});

var Calendar = function(e) {
  var t = this;
  t.height = e.height || 600, t.width = e.width || 800, t.margin = e.margin, t.retreiveDataCallback = e.retreiveDataCallback, t.retreiveValueCallback = e.retreiveValueCallback, t.colorScheme = e.colorScheme || [ "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850" ], t.noDataColor = e.noDataColor || "#eee", t.buckets = t.colorScheme.length, t.visId = e.visId || "#vis", t.legendId = e.legendId || "#legend", t.tileClass = e.tileClass || "tile", t.monthPathClass = e.monthPathClass || "month_path", t.renderer = e.renderer, t.current_renderer = t.renderer, t.duration = e.duration || 800, t.upBound = e.upBound || 80, t.downBound = e.downBound || 20, t.name = e.name || "";
  var n = [];
  for (var r = 0; r < t.buckets; r++) n.push(r);
  t.bucket = d3.scale.quantize().domain([ 20, 80 ]).range(n), t.svg = d3.select(t.visId).append("svg:svg").attr("width", t.width).attr("height", t.height).append("svg:g").attr("transform", "translate(0,0)"), t.createLegend();
}, _createTiles = function() {
  var e = this, t = arguments;
  data = [], label = [], e.current_renderer && e.current_renderer.clean && e.renderer != e.current_renderer && (e.current_renderer.clean.apply(e, arguments), e.current_renderer = e.renderer), $("#title").text(e.name);
  var n = e.current_renderer.draw.apply(e, arguments);
  if (n && n.width) {
    var r, i = 0;
    n.width > e.width ? r = e.width / n.width : (r = 1, i = (e.width - n.width) / 2), e.svg.transition().duration(e.duration).attr("transform", "translate(" + i + "," + 0 + ")" + "scale(" + r + ")");
  }
};

Calendar.prototype.createTiles = function() {
  var e = this;
  e.retreiveDataCallback != null && typeof e.retreiveDataCallback == "function" ? (e._tempargs = arguments, e.retreiveDataCallback.apply(e, arguments)) : _createTiles.apply(e, arguments);
}, Calendar.prototype.draw = function(e) {
  var t = this;
  if (t._tempargs) {
    var n = [];
    n.splice(0, 0, e);
    for (var r = 0; r < t._tempargs.length; r++) n.push(t._tempargs[r]);
    _createTiles.apply(this, n);
  } else _createTiles.apply(this, arguments);
}, Calendar.prototype.createLegend = function() {
  var e = this, t = "";
  for (var n = 0; n < e.buckets; n++) t += "<li style='background:" + e.colorScheme[n] + "'></li>";
  d3.select("#legend ul").html(t), e.setLegend();
}, Calendar.prototype.setLegend = function(e) {
  var t = function(e) {
    return e ? e : "";
  }, n = this;
  e ? (d3.select("#legend .less").text(t(e.min)), d3.select("#legend .more").text(t(e.max))) : (d3.select("#legend .less").text(n.downBound), d3.select("#legend .more").text(n.upBound));
}, Calendar.prototype.setBucket = function(e) {
  var t = this, n = [];
  for (var r = 0; r < t.buckets; r++) n.push(r);
  e ? t.bucket = d3.scale.quantize().domain([ e.min, e.max ]).range(n) : t.bucket = d3.scale.quantize().domain([ t.downBound, t.upBound ]).range(n);
}, Calendar.prototype.tilesEnter = function(e) {
  return e.enter().insert("rect").classed(this.tileClass, !0).attr("stroke-width", "2px").attr("fill", "#fff").attr("fill-opacity", 0);
}, Calendar.prototype.tilesUpdate = function() {}, Calendar.prototype.tilesExit = function(e) {
  e.exit().attr("fill-opacity", 0).remove();
}, Calendar.prototype.monthPathEnter = function(e, t) {
  var n = this.svg.selectAll("." + this.monthPathClass).data(e, function(e, t) {
    return t;
  });
  return n.enter().append("path").classed(this.monthPathClass, !0).attr("stroke-width", "2px").attr("stroke", "#FFF").attr("fill-opacity", 0).attr("stroke-opacity", 1).attr("d", t), n.transition().duration(this.duration).attr("stroke", "#000").attr("stroke", "#000").attr("d", t), n.exit().remove(), n;
}, Calendar.prototype.monthPathExit = function(e, t) {
  this.svg.selectAll("." + this.monthPathClass).data([]).exit().remove();
}, Calendar.prototype.time = {}, Calendar.prototype.time.getDay = function(e) {
  var t = e.getDay();
  return t == 0 ? 6 : t - 1;
}, Calendar.prototype.time.getMonth = function(e) {
  var t = d3.time.format("%m");
  return parseInt(t(e));
}, Calendar.prototype.time.getWeek = function(e) {
  var t = d3.time.format("%W");
  return parseInt(t(e));
}, Calendar.prototype.getColor = function(e) {
  var t = this, n = t.noDataColor;
  return e != undefined && e != 0 && (n = t.colorScheme[t.bucket(e)]), n;
}, Calendar.renderer = {}, Calendar.animation = {
  fadeIn: function(e, t) {
    return e.duration(t).attr("fill-opacity", 1);
  },
  fadeOut: function(e, t) {
    return e.duration(t).attr("fill-opacity", 0).remove();
  }
}, Calendar.renderer.day = function() {
  var e = this;
  e.labels_hours;
  var t = function(e, t, n) {
    var r = d3.time.mondays(new Date(e, 0, 1), new Date(e + 1, 0, 1));
    if (r && r[parseInt(t)]) {
      var i = r[t];
      i.setTime(i.getTime() + (parseInt(n) - 7) * 24 * 60 * 60 * 1e3);
      var s = new Date;
      return s.setTime(i.getTime() + 864e5), {
        start: i,
        end: s
      };
    }
  };
  return e.draw = function(n, r, i, s) {
    var o = this, u = t(r, i, s), a;
    u && u.start ? a = d3.time.day(u.start) : a = new Date(r, 0, 0);
    var f = function(e, t, n, r) {
      return n(e, (new Date).setTime(e.getTime() + t), r ? r : 1);
    }, l = function(e) {
      var t = e.getDay(), s = o.retreiveValueCallback(n, r, i, t == 0 ? 6 : t - 1, e.getHours());
      return o.getColor(s);
    }, c = 36, h = 2, p = 15, d = 30, v = "darkgray", m = "12px", g = "day_hour_label", y = d3.time.format("%Hh"), b = function(e) {
      return Math.floor(e.getMinutes() / 15);
    }, w = function(e) {
      return e.append("text").classed(g, !0).attr("fill", v).attr("font-size", m);
    }, E = function(e, t) {
      return Math.floor(e.getHours() / 6) * 4 * (p + c + h) + b(e) * (c + h) + d;
    }, S = function(e, t) {
      return e.getHours() % 6 * (c + h);
    }, x = function(e, t) {
      return Math.floor(e.getHours() / 6) * 4 * (p + c + h) + b(e) * (c + h);
    }, T = function(e, t) {
      return t % 6 * (c + h) + 20;
    }, N = function() {
      return {
        width: 16 * (p + c + h) + 3 * p + d,
        height: 6 * (c + h)
      };
    }, C = 864e5, k = 7 * C, L = o.svg, A = L.selectAll("." + o.tileClass).data(f(a, C, d3.time.minutes, 15));
    o.tilesEnter(A).attr("x", E).attr("y", S).attr("width", c + "px").attr("height", c + "px"), A.transition().delay(function(e) {
      return b(e) * Math.random() * 50 + e.getHours() % 6 * Math.random() * 50 / o.duration;
    }).attr("x", E).attr("y", S).attr("fill-opacity", 1).attr("width", c + "px").attr("height", c + "px").attr("fill", l), o.tilesExit(A);
    var O = function(e) {};
    return e.labels_hours = L.selectAll("." + g).data(f(a, C, d3.time.hours)), w(e.labels_hours.enter()).attr("x", x).attr("y", T).text(y), Calendar.animation.fadeIn(e.labels_hours.transition(), o.duration).attr("x", x).attr("y", T).text(y), Calendar.animation.fadeOut(e.labels_hours.exit().transition(), o.duration), N();
  }, e.clean = function() {
    var t = this;
    Calendar.animation.fadeOut(e.labels_hours.transition(), t.duration);
  }, e.bounds = function(e, n, r) {
    return t(e, n, r);
  }, e;
}, Calendar.renderer.week = function() {
  var e = this;
  e.labels_days, e.labels_hours;
  var t = function(e, t) {
    var n = d3.time.mondays(new Date(e, 0, 1), new Date(e + 1, 0, 1));
    console.debug(t);
    if (n && n[t]) {
      var r = n[t];
      r.setTime(r.getTime() - 6048e5), console.debug(r);
      var i = new Date;
      return i.setTime(r.getTime() + 6048e5), {
        start: r,
        end: i
      };
    }
  };
  return e.draw = function(n, r, i) {
    var s = this, o = t(r, i), u;
    o && o.start ? u = d3.time.monday(o.start) : (u = new Date(r, 0, 0), faked = !0);
    var a = function(e, t, n) {
      return n(e, (new Date).setTime(e.getTime() + t));
    }, f = function(e) {
      var t = s.retreiveValueCallback(n, r, i, s.time.getDay(e), e.getHours());
      return s.getColor(t);
    }, l = 36, c = 2, h = 85, p = 30, d = 10, v = 20, m = 5, g = "darkgray", y = "14px", b = "day_label", w = "hour_label", E = d3.time.format("%a %d %b"), S = function(e, t) {
      return t % 2 == 0 ? E(e) : "";
    }, x = d3.time.format("%Hh"), T = function(e, t) {
      return t % 2 == 0 ? x(e) : "";
    }, N = function(e, t) {
      return e.append("text").classed(t, !0).attr("fill", g).attr("font-size", y);
    }, C = function(e, t) {
      return h + e.getHours() * (l + c);
    }, k = function(e, t) {
      return s.time.getDay(e) * (l + c) + v + d;
    }, L = function(e, t) {
      return 0;
    }, A = function(e, t) {
      return p + t * (l + c) + v;
    }, O = function(e, t) {
      return h + e.getHours() * (l + c) + m;
    }, M = function(e, t) {
      return v;
    }, _ = function() {
      return {
        width: h + 24 * (l + c),
        height: 7 * (l + c) + v
      };
    }, D = 864e5, P = 7 * D, H = s.svg, B = H.selectAll("." + s.tileClass).data(a(u, P, d3.time.hours), function(e, t) {
      return t;
    });
    return s.tilesEnter(B).attr("x", C).attr("y", k).attr("width", l + "px").attr("height", l + "px"), B.transition().delay(function(e) {
      return e.getHours() * 20 + s.time.getDay(e) * 20 + Math.random() * 50 / s.duration;
    }).attr("x", C).attr("y", k).attr("fill-opacity", 1).attr("width", l + "px").attr("height", l + "px").attr("fill", f), s.tilesExit(B), e.labels_days = H.selectAll("." + b).data(a(u, P, d3.time.days), function(e, t) {
      return t;
    }), N(e.labels_days.enter(), b).attr("x", L).attr("y", A).text(S), Calendar.animation.fadeIn(e.labels_days.transition(), s.duration).text(S), Calendar.animation.fadeOut(e.labels_days.exit().transition(), s.duration), e.labels_hours = H.selectAll("." + w).data(a(u, D, d3.time.hours)), N(e.labels_hours.enter(), w).attr("x", O).attr("y", M).text(T), Calendar.animation.fadeIn(e.labels_hours.transition(), s.duration).attr("x", O).attr("y", M).text(T), Calendar.animation.fadeOut(e.labels_hours.exit().transition(), s.duration), _();
  }, e.clean = function() {
    var t = this;
    Calendar.animation.fadeOut(e.labels_days.transition(), t.duration), Calendar.animation.fadeOut(e.labels_hours.transition(), t.duration);
  }, e.bounds = function(e, n) {
    return t(e, n);
  }, e;
}, Calendar.renderer.month = function() {
  var e = this;
  return e.labels_months, e.label_year, e.draw = function(t, n, r) {
    function F(e) {
      var t = m + y, n = m + y, r = new Date(e.getFullYear(), e.getMonth() + 1, 0), s = +i.time.getDay(e), o = +d[i.time.getWeek(e)], u = +i.time.getDay(r), a = +d[i.time.getWeek(r)];
      return "M" + ((o + 1) * n + x + g) + "," + (g + s * t + S) + "H" + (o * n + x + g) + "V" + (g + 7 * t + S) + "H" + (a * n + x + g) + "V" + (g + (u + 1) * t + S) + "H" + ((a + 1) * n + x + g) + "V" + (S + g) + "H" + ((o + 1) * n + x + g) + "Z";
    }
    var i = this, s = function(e, t) {
      return t(new Date(parseInt(n), parseInt(e), 1), new Date(parseInt(n), parseInt(e) + 1, 1));
    }, o = function(e) {
      var r = i.retreiveValueCallback(t, n, i.time.getWeek(e), i.time.getDay(e));
      return i.getColor(r);
    }, u = [], a = [], f, l = 0;
    if (r instanceof Array) {
      r.sort(function(e, t) {
        return e - t;
      });
      for (var c in r) f || (f = r[c]), u = u.concat(s(r[c], d3.time.days)), a = a.concat(s(r[c], d3.time.months));
    } else f = r, u = s(r, d3.time.days), a = s(r, d3.time.months);
    var h = 0, p, d = [];
    for (var v in u) p < i.time.getWeek(u[v]) && (h++, i.time.getWeek(u[v]) - p > 1 && (l++, h++)), p = i.time.getWeek(u[v]), d[i.time.getWeek(u[v])] = h;
    var m = 36, g = 20, y = 2, b = m, w = 80, E = 146, S = 15, x = 20, T = "darkgray", N = "14px", C = "month_label", k = d3.time.format("%B"), L = "year_label", A = d3.time.format("%Y"), O = function(e, t) {
      return e.append("text").classed(t, !0).attr("fill", T).attr("font-size", N);
    }, M = function(e, t) {
      return g + x + d[i.time.getWeek(e)] * (m + y);
    }, _ = function(e, t) {
      return g + S + i.time.getDay(e) * (m + y);
    }, D = function(e, t) {
      return g + w + d[i.time.getWeek(e)] * (m + y);
    }, P = function(e, t) {
      return g;
    }, H = function(e, t) {
      return -E;
    }, B = function(e, t) {
      return g;
    }, j = function() {
      var e = 0;
      return d.map(function() {
        e++;
      }), {
        width: x + e * (m + y) + l * m + 25,
        height: S + 7 * (m + y)
      };
    }, I = 864e5, q = 7 * I, R = i.svg, U = R.selectAll("." + i.tileClass).data(u);
    return i.tilesEnter(U).attr("x", M).attr("y", _).attr("width", m + "px").attr("height", m + "px"), U.transition().delay(function(e) {
      return i.time.getWeek(e) * 20 + i.time.getDay(e) * 20 + Math.random() * 50 / i.duration;
    }).attr("x", M).attr("y", _).attr("fill-opacity", 1).attr("width", m + "px").attr("height", m + "px").attr("fill", o), i.tilesExit(U), i.monthPathEnter(a, F), e.labels_months = R.selectAll("." + C).data(a), O(e.labels_months.enter(), C).attr("x", D).attr("y", P).text(k), Calendar.animation.fadeIn(e.labels_months.transition(), i.duration).attr("x", D).attr("y", P).text(k), e.labels_months.exit().remove(), e.label_year = R.selectAll("." + L).data(s(0, d3.time.years)), O(e.label_year.enter(), L).attr("transform", "rotate(-90)").attr("x", H).attr("y", B).style("text-anchor", "middle").text(A), Calendar.animation.fadeIn(e.label_year.transition(), i.duration).attr("x", H).attr("y", B).text(A), Calendar.animation.fadeOut(e.label_year.exit().transition(), i.duration), j();
  }, e.clean = function() {
    var t = this;
    t.monthPathExit(), Calendar.animation.fadeOut(e.labels_months.transition(), t.duration), e.label_year && Calendar.animation.fadeOut(e.label_year.transition(), t.duration);
  }, e.bounds = function(e, t) {
    return t instanceof Array && t.length > 0 ? t.length < 2 ? {
      start: new Date(e, d3.min(t), 1),
      end: new Date(e, d3.min(t) + 1, 1)
    } : {
      start: new Date(e, d3.min(t), 1),
      end: new Date(e, d3.max(t) + 1, 1)
    } : {
      start: new Date(e, t, 1),
      end: new Date(e, t + 1, 1)
    };
  }, e;
}, Calendar.renderer.year = function() {
  var e = this;
  return e.labels_months, e.label_year, e.cache_bounds = {}, e.draw = function(t, n) {
    function P(e) {
      var t = k * l[e.getFullYear()], n = p + v, i = p + v, s = new Date(e.getFullYear(), e.getMonth() + 1, 0), o = +r.time.getDay(e), u = +r.time.getWeek(e), a = +r.time.getDay(s), f = +r.time.getWeek(s);
      return "M" + ((u + 1) * i + w + d) + "," + (d + o * n + b + t) + "H" + (u * i + w + d) + "V" + (d + 7 * n + b + t) + "H" + (f * i + w + d) + "V" + (d + (a + 1) * n + b + t) + "H" + ((f + 1) * i + w + d) + "V" + (b + d + t) + "H" + ((u + 1) * i + w + d) + "Z";
    }
    var r = this, i = function(e, t) {
      return t(new Date(parseInt(e), 0, 1), new Date(parseInt(e) + 1, 0, 1));
    }, s = function(e, n, i) {
      var s = r.retreiveValueCallback(t, e.getFullYear(), r.time.getWeek(e), r.time.getDay(e));
      return r.getColor(s);
    }, o, u, a, f, l = [];
    if (n instanceof Array) {
      o = [], u = [], a = [], n.sort(function(e, t) {
        return e - t;
      });
      var c = 0;
      for (var h in n) l[n[h]] = c++, f || (f = n[h]), o = o.concat(i(n[h], d3.time.days)), u.push(new Date(n[h], 1, 1)), a = a.concat(i(n[h], d3.time.months));
    } else f = n, l[n] = 0, o = i(n, d3.time.days), u = [ new Date(n, 0, 1) ], a = i(n, d3.time.months);
    var p = 36, d = 20, v = 2, m = p * 2, g = 80, y = 146, b = 15, w = 20, E = "darkgray", S = "22px", x = "month_label", T = d3.time.format("%B"), N = "year_label", C = d3.time.format("%Y"), k = 7 * p + d + b + m, L = function(e, t) {
      return e.append("text").classed(t, !0).attr("fill", E).attr("font-size", S);
    }, A = function(e, t) {
      return r.time.getWeek(e) * (p + v) + d + w;
    }, O = function(e, t) {
      return k * l[e.getFullYear()] + d + b + r.time.getDay(e) * (p + v);
    }, M = function(e, t) {
      return -y - k * l[e.getFullYear()];
    }, _ = function(e, t) {
      return +d;
    }, D = function() {
      var e = 0;
      return {
        width: 53 * (p + v) + w + d + 2 * p,
        height: d + b + 7 * (p + v)
      };
    }, H = r.svg.selectAll("." + r.tileClass).data(o);
    return r.tilesEnter(H).attr("x", A).attr("y", O).attr("width", p + "px").attr("height", p + "px"), H.transition().delay(function(e) {
      return r.time.getWeek(e) * 20 + r.time.getDay(e) * 20 + Math.random() * 50 / r.duration;
    }).attr("x", A).attr("y", O).attr("fill-opacity", 1).attr("width", p + "px").attr("height", p + "px").attr("fill", s), r.tilesExit(H), r.monthPathEnter(a, P), e.label_year = r.svg.selectAll("." + N).data(u), L(e.label_year.enter(), N).attr("transform", "rotate(-90)").attr("x", M).attr("y", _).style("text-anchor", "middle").text(C), Calendar.animation.fadeIn(e.label_year.transition(), r.duration).attr("x", M).attr("y", _).text(C), Calendar.animation.fadeOut(e.label_year.exit().transition(), r.duration), D();
  }, e.clean = function() {
    var t = this;
    t.monthPathExit(), Calendar.animation.fadeOut(e.label_year.transition(), t.duration);
  }, e.bounds = function(e) {
    return e instanceof Array && e.length > 0 ? e.length < 2 ? {
      start: new Date(d3.min(e), 0, 1),
      end: new Date(d3.min(e) + 1, 0, 1)
    } : {
      start: new Date(d3.min(e), 0, 1),
      end: new Date(d3.max(e) + 1, 0, 1)
    } : {
      start: new Date(e, 0, 1),
      end: new Date(e + 1, 0, 1)
    };
  }, e;
}, Calendar.data = {
  create: function(e) {
    return function(t) {
      var n = function(t) {
        return e(t).getFullYear();
      }, r = function(t) {
        var n = e(t).getDay();
        return n == 0 ? 6 : n - 1;
      }, i = function(t) {
        var n = d3.time.format("%W");
        return parseInt(n(e(t)));
      }, s = function(t) {
        return e(t).getHours();
      }, o = d3.nest();
      return o.key(n).key(i).key(r).key(s), o.map(t);
    };
  },
  bounds: function(e) {
    return function(t) {
      var n = [];
      return t.map(function(t) {
        n.push(e(t));
      }), {
        min: d3.round(d3.min(n)),
        max: d3.round(d3.max(n)),
        mean: d3.round(d3.mean(n)),
        median: d3.round(d3.median(n))
      };
    };
  },
  retreiveValueCallbackClosure: function(e, t, n) {
    var r = function(n, i) {
      var s = [];
      if (e(n) != null) return e(n);
      for (var i in n) s.push(r(n[i]));
      var o = t(s);
      return o;
    };
    return function() {
      try {
        var e = [], t = arguments[0];
        for (var n = 1; n < arguments.length; n++) e.push(arguments[n]);
        for (var n in e) t = t[e[n]];
        var i = r(t, 0);
        return i;
      } catch (s) {
        return null;
      }
    };
  },
  retreiveBoundsCallbackClosure: function(e, t, n, r) {
    var i = function(n, r) {
      var s = [];
      if (n != null && t(n) != null && e(n) != undefined) return e(n);
      for (var o in n) return i(n[o]);
    }, s = function(e, n) {
      var r = [];
      if (e != null && t(e) != null) return t(e);
      for (var i in e) r = r.concat(s(e[i]));
      return r;
    };
    return function() {
      try {
        var e = [], t = arguments[0];
        for (var n = 1; n < arguments.length; n++) e.push(arguments[n]);
        for (var n in e) t = t[e[n]];
        var r = s(t, 0), o = i(t, 0);
        return {
          min: d3.round(d3.min(r), 2),
          max: d3.round(d3.max(r), 2),
          mean: d3.round(d3.mean(r), 2),
          median: d3.round(d3.median(r), 2),
          start: o
        };
      } catch (u) {
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