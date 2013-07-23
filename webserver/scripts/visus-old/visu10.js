var IsZooming = false;
var WheelSize;

function randomBrightnessSet(count) {
    var ids = {};
    for (var i = 0; i < count; i++) {
        var id = parseInt(Math.random() * WheelSize)+1;
        ids[id] = true;
    }

    var delay = 0;
    for (id in ids) {
        d3.select("#path-"+id).transition()
            .duration(500)
            .delay(delay)
            .style('fill', function() {
                var that = d3.select(this);
                var originalFill = that.style('fill');
                that.attr("_fill", originalFill);
                return d3.rgb(originalFill).brighter().toString();
            })
            .each('end', function () {
                // reset fill
                d3.select(this).transition()
                    .duration(500)
                    .style('fill', function(elm) {
                        var that = d3.select(this);
                        return that.attr("_fill");
                    })
            });
        delay+=100;
    }
}

function randomTimer(){
    if (IsZooming) return;
	var random = parseInt(Math.random() * 5) + 1;
    randomBrightnessSet(random);
}
var WheelInit;
function initWheel () {
    if (WheelInit) {
        return;
    }
    WheelInit = true;    
    initWheelD3();
    setInterval(randomTimer, 1500);
}

function initWheelD3 () {
    var w = 840,
        h = w,
        r = w / 2,
        x = d3.scale.linear().range([0, 2 * Math.PI]),
        y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, r]),
        p = 5,
        duration = 1000;

    var div = d3.select("#wheel");

    div.select("img").remove();

    var vis = div.append("svg")
        .attr("width", w + p * 2)
        .attr("height", h + p * 2)
      .append("g")
        .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")");

    var partition = d3.layout.partition()
        .sort(null)
        .value(function(d) { return 5.8 - d.depth; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

    d3.json("data/wheel.json", function(json) {
      var nodes = partition.nodes({children: json});
      WheelSize = nodes.length;
      var path = vis.selectAll("path").data(nodes);
      path.enter().append("path")
          .attr("id", function(d, i) { return "path-" + i; })
          .attr("d", arc)
          .attr("fill-rule", "evenodd")
          .style("fill", colour)
          .on("click", click);

      var text = vis.selectAll("text").data(nodes);
      var textEnter = text.enter().append("text")
          .style("fill-opacity", 1)
          .style("fill", function(d) {
            return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000";
          })
          .attr("text-anchor", function(d) {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
          })
          .attr("dy", ".2em")
          .attr("transform", function(d) {
            var multiline = (d.name || "").split(" ").length > 1,
                angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
          })
          .on("click", click);
      textEnter.append("tspan")
          .attr("x", 0)
          .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
      textEnter.append("tspan")
          .attr("x", 0)
          .attr("dy", "1em")
          .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });

      function click(d) {
        IsZooming = true;
        path.transition()
          .duration(duration)
          .attrTween("d", arcTween(d));

        // Somewhat of a hack as we rely on arcTween updating the scales.
        text
          .style("visibility", function(e) {
            return isParentOf(d, e) ? null : d3.select(this).style("visibility");
          })
          .transition().duration(duration)
          .attrTween("text-anchor", function(d) {
            return function() {
              return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
            };
          })
          .attrTween("transform", function(d) {
            var multiline = (d.name || "").split(" ").length > 1;
            return function() {
              var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                  rotate = angle + (multiline ? -.5 : 0);
              return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
            };
          })
          .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
          .each("end", function(e) {
            IsZooming = false;
            d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
          });
      }
    });

    function isParentOf(p, c) {
      if (p === c) return true;
      if (p.children) {
        return p.children.some(function(d) {
          return isParentOf(d, c);
        });
      }
      return false;
    }

    function colour(d) {
      if (d.children) {
        // There is a maximum of two children!
        var colours = d.children.map(colour),
            a = d3.hsl(colours[0]),
            b = d3.hsl(colours[1]);
        // L*a*b* might be better here...
        return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
      }
      return d.colour || "#fff";
    }

    // Interpolate the scales!
    function arcTween(d) {
      var my = maxY(d),
          xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, my]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, r]);
      return function(d) {
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }

    function maxY(d) {
      return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
    }

    function brightness(rgb) {
      return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
    }
}