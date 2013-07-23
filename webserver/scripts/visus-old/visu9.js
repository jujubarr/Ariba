/*
$(document).ready(function() {
    document.getElementById('stream_graph').style.visibility = 'visible';
    initStreamGraph();
});
*/


//var refresh = setInterval("transition()", 1000);

var CONS = 500;

var currency_number = 3;

var sample_number = 50; // number of sample

var stream_margins = {top: 6, right: 0, bottom: 6, left: 40};
var width = 900 - stream_margins.right;
var height = 500 - stream_margins.top - stream_margins.bottom;

var Xmaximum = sample_number - 1;
var Ymaximum = CONS * currency_number;

var initial_table = new Array();
for (var i = 0 ; i < currency_number ; ++i){
    initial_table[i] = new Array();
    for (var j = 0 ; j < sample_number ; ++j){
        initial_table[i][j] = 0;
    }
}

var values = new Array();
for (var i = 0 ; i < currency_number ; ++i)
    values[i] = new Array();

var data0 = d3.layout.stack().offset("silhouette")(init_layers(currency_number,sample_number));

var color = ['#C4502B', '#6C74B3', '#5A6A4F'];

var y;
var vis;
var area;
var StreamInited;

function initStreamGraph(){
    if (StreamInited) {
        return;
    }
    StreamInited = true;
    y = d3.scale.linear()
              .domain([0, Ymaximum])
              .range([height, 0]);

    area = d3.svg.area()
        .x(function(data) { return data.x * width / Xmaximum; })
        .y0(function(data) { return height - data.y0 * height / Ymaximum; })
        .y1(function(data) { return height - (data.y + data.y0) * height / Ymaximum; });

    vis = d3.select("#stream_graph")
        .append("svg")
          .style("margin-left", -stream_margins.left + "px")
        .attr("width", width + stream_margins.left + stream_margins.right)
        .attr("height", height + stream_margins.top + stream_margins.bottom)
        .append("g")
          .attr("transform", "translate(" + stream_margins.left + "," + stream_margins.top + ")");

    vis.append("defs").append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", width)
          .attr("height", height);

    vis.append("g")
        .attr("clip-path", "url(#clip)");


    vis.selectAll("path")
        .data(data0)
        .enter()
        .append("path")
        .style("fill", function(data, i) { return color[i]; })
        .attr("d", area);


    /*
    vis.append("g")
        .attr("class", "y axis")
          .call(d3.svg.axis().scale(y).ticks(5).orient("left"));
    */


    transition();

    function transition() {
        var layers = update_layers(currency_number,sample_number);
        data0 = d3.layout.stack().offset("silhouette")(layers);

        vis.selectAll("path")
            .data(data0)
            .attr("d", area)
            .attr("transform", null)
            .transition()
            .duration(860)
            .ease("linear")
            .attr("transform", "translate(" + -(width / sample_number) + ")")
            // RECURSION
            /* */
            .each("end", function (data,indice) {
                if (indice==0) transition();
            });
            /* */

        var updates = [
            values[0][sample_number],
            values[1][sample_number],
            values[2][sample_number]
        ];
        d3.selectAll('#stream_graph_labels div')
            .data(updates)
            .transition()
            .duration(860)
            .style('font-size', function (d) {
                return d/10 +"px";
            });

        for (var i = 0 ; i < values.length ; ++i)
            values[i].shift();
    }
}

function init_layers(layers_number, samples_number) {
    return d3.range(layers_number).map(function(data,indice) {
        for (var i = 0 ; i < sample_number ; i++)
            values[indice][i] = initial_table[indice][i];
        return values[indice].map(stream_index);
    });
}

function update_layers(layers_number, samples_number) {
    return d3.range(layers_number).map(function(data,indice) {
        var volume;
        if (indice < 2)
            volume = currency[indice];
        else
            volume = randomNber();
        values[indice][sample_number] = volume;
        
        return values[indice].map(stream_index);
    });
}

function stream_index(data, indice) {
    return {x: indice, y: Math.max(0, data)};
}

function randomNber(){
    return parseInt(Math.random()*CONS)+1;
}

/*
function stop(){
    clearInterval(refresh);
    document.getElementById('stop').style.visibility = 'hidden';
    //document.getElementById('restart').style.visibility = 'visible';
}

function restart(){
    refresh = setInterval("transition()", 1000);
    document.getElementById('restart').style.visibility = 'hidden';
    document.getElementById('stop').style.visibility = 'visible';
}
*/