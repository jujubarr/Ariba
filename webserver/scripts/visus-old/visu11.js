var NetworkInit;
function initNetwork () {
    if (NetworkInit) {
        return;
    }
    NetworkInit = true;
    initNetworkD3();
}

function initNetworkD3(){
	var width = 720,
		height = 720,
		outerRadius = Math.min(width, height) / 2 - 10,
		innerRadius = outerRadius - 24;

	var formatPercent = d3.format(".1%");

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var layout = d3.layout.chord()
		.padding(.04)
		.sortSubgroups(d3.descending)
		.sortChords(d3.ascending);

	var path = d3.svg.chord()
		.radius(innerRadius);

	var svg = d3.select("#network").append("svg")
		.attr("width", width)
		.attr("height", height)
	  .append("g")
		.attr("id", "circle")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	svg.append("circle")
		.attr("r", outerRadius);

	d3.csv("data/cities.csv", function(cities) {
	  d3.json("data/matrix.json", function(matrix) {
		// Compute the chord layout.
		layout.matrix(matrix);
		
		// Add a group per neighborhood.
		var group = svg.selectAll(".group")
			.data(layout.groups)
		  .enter().append("g")
			.attr("class", "group")
			.on("mouseover", mouseover);

		// Add a mouseover title.
		group.append("title").text(function(d, i) {
		  return cities[i].name + ": " + formatPercent(d.value) + " of origins";
		});

		// Add the group arc.
		var groupPath = group.append("path")
			.attr("id", function(d, i) { return "group" + i; })
			.attr("d", arc)
			.style("fill", function(d, i) { return cities[i].color; });

		// Add a text label.
		var groupText = group.append("text")
			.attr("x", 6)
			.attr("dy", 15);

		groupText.append("textPath")
			.attr("xlink:href", function(d, i) { return "#group" + i; })
			.text(function(d, i) { return cities[i].name; });

		// Remove the labels that don't fit. :(
		groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
			.remove();

		// Add the chords.
		var chord = svg.selectAll(".chord")
			.data(layout.chords)
		  .enter().append("path")
			.attr("class", "chord")
			.style("fill", function(d) { return cities[d.source.index].color; })
			.attr("d", path);

		// Add an elaborate mouseover title for each chod.
		chord.append("title").text(function(d) {
		  return cities[d.source.index].name
			  + " ? " + cities[d.target.index].name
			  + ": " + formatPercent(d.source.value)
			  + "\n" + cities[d.target.index].name
			  + " ? " + cities[d.source.index].name
			  + ": " + formatPercent(d.target.value);
		});

		function mouseover(d, i) {
		  chord.classed("fade", function(p) {
			return p.source.index != i
				&& p.target.index != i;
		  });
		}
		
		var row_number = 11;
		var column_number = 11;
			
		randomChange();
		function randomChange(){
			// 12 cities
			// 11 rows from 0 to 10
			// 12 columns from 0 to 11
			//console.log(matrix);
			var random_row = parseInt(Math.random() * row_number);
			var random_column = parseInt(Math.random() * column_number);
			var random_change;
					
			var bool = false;
			while (!bool){
				if((matrix[random_row][random_column] <= 0.85) && (matrix[random_column][random_row] >= 0.10))
					bool = true;
				else{
					random_column = parseInt(Math.random() * column_number);
				}
			}
			/*
			console.log("before");
			console.log("matrix["+random_row+"]["+random_column+"]:"+matrix[random_row][random_column]);
			console.log("matrix["+random_column+"]["+random_row+"]:"+matrix[random_column][random_row]);
			*/
			bool = false;
			while (!bool){
				if( ((matrix[random_row][random_column] + random_change) < 1) && ((matrix[random_column][random_row] - random_change) > 0) )
					bool = true;
				else{
					random_change = Math.random()/3;
					//console.log("random_change: "+random_change);
				}
			}
			
			matrix[random_row][random_column] += random_change;
			matrix[random_column][random_row] -= random_change;
			
			/*
			console.log("after");
			console.log("matrix["+random_row+"]["+random_column+"]:"+matrix[random_row][random_column]);
			console.log("matrix["+random_column+"]["+random_row+"]:"+matrix[random_column][random_row]);
			*/
		}
		
		//getSymetric();
		
		function getSymetric(){		
			var random1 = parseInt(Math.random() * row_number);
			var random2 = parseInt(Math.random() * column_number);
			
			var a = matrix[random1][random2];
			var b = matrix[random2][random1];
			
			console.log("random1: "+random1);
			console.log("random2: "+random2);
			console.log("matrix["+random1+"]["+random2+"]: "+a);
			console.log("matrix["+random2+"]["+random1+"]: "+b);
		}
	  });
	});
}