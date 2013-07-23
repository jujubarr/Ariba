var projection;

var points_5 = [];

var CST = 3;

var speed = 2400;

var radius = 2;

var screen_size = 1400;

function initVisu_5(){
    // Create the Google Map…
    var map_5 = new google.maps.Map(d3.select("#map_canvas5").node(), {
        zoom: 3,
        center: new google.maps.LatLng(28,-19),
        disableDefaultUI: true,
        panControl: true,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var overlay = new google.maps.OverlayView();

    overlay.onAdd = function() {
        console.log("overlay.onAdd");
        var pourcentage = 0.0; // initialize position
        var last = 0;
        var delta = 0.01; // interval
        var bezier = {};
        var padding = 0;
        projection = this.getProjection();

        var line = d3.svg.line().x(getLat).y(getLng);

        var visualization_layer = d3.select(this.getPanes().overlayLayer).append("div")
            .style("position","absolute");

        var nb_curve = transactions.length * 2;
//        var nb_curve = transactions.length;
        var orders = d3.range(CST, nb_curve + CST);

        var visualization = visualization_layer.selectAll("svg")
            .data(orders)
            .enter().append("svg:svg")
            .attr("width", screen_size + 2 * padding)
            .attr("height", screen_size + 2 * padding)
            .style("position","absolute")
            .append("svg:g");

        init_point5();
        
        fill_points5();

        update();

        overlay.draw = function() {
            createTimer();
        };

        function createTimer(){
            d3.timer(function(elapsed) {

                pourcentage = (pourcentage + (elapsed - last) / speed) % 1;
                last = elapsed;
                update();
                if(pourcentage > 0.98){
                    bezier = {};
                    fill_points5();
                    if (visu_number == 5){
                        createTimer();
                    }
                    else{
                        return true;
                    }
                    return true;
                }
            });
        }

        function update() {
            var interpolations = visualization.selectAll("g")
                .data(function(data) {
                    return getLevels(data, pourcentage);
                    });

            interpolations.enter().append("svg:g")
                .style("fill", colour)
                .style("stroke", colour);

            var path = interpolations.selectAll("path")
                .data(function(data) { return [data]; });

            path.enter().append("svg:path")
                .attr("class", "line")
            //	.attr("d", line); // draw lines between points

            //path.attr("d", line); // draw lines between points yellow blue and green

            var curves = visualization.selectAll("path.curve")
                .data(function(data) { return getCurve([data]); });		//.data(getCurve); is the same

            curves.enter().append("svg:path")
                .attr("class", "curve");

            curves.attr("d", line); // draw the path in red

            var circle = interpolations.selectAll("circle")// Update circle positions
                .data(getCircle)
                .style("stroke", "black");

            circle.enter().append("svg:circle")
                .attr("r", radius); // rayon du cercle

            circle
                .attr("cx", getLat)
                .attr("cy", getLng);

            /* * /
            // DRAW MIDDLE CIRCLES IN BLUE
            var circle_middle = interpolations.selectAll("circle_middle")// Update circle positions
                .data(getCircleMiddle)
                //.style("stroke", "green")
                ;

            circle_middle.enter().append("svg:circle")
                .style("stroke", "blue")
                .style("fill", "blue")
                .attr("r", 4); // rayon du cercle

            circle_middle
                .attr("cx", getLat)
                .attr("cy", getLng);
            /* */
        }
        /*
        function getCircleMiddle(){
            var result = [];
            for (var i = CONSTANT ; i < points_5.length ; i++) {
                result.push(
                                {x: points_5[i][1].x,
                                 y: points_5[i][1].y}
                            );
            }
            //console.log("i getCircleMiddle: "+i);
            return result;
        }
        */

        function getCircle(){
            var result = [];
            for (var i = CST ; i < points_5.length ; i++) {
                for (var j = 0 ; j < points_5[i].length ; j=j+2) {
                    result.push(
                                    {x: points_5[i][j].x,
                                     y: points_5[i][j].y}
                                );
                }
            }
            //console.log("i getCircle: "+i);
            return result;
        }

        function getLevels(data, pourcent) {
            if (arguments.length < 2)
				pourcent = pourcentage;

            // pts is initialize with the [0] case with 3 objects: origin {x,y} middle {x,y} dest {x,y}
			var pts = [points_5[data]]; // pts.length = 1
            var tmp;
            var res;
            var origin;
            var destin;

            // on passe deux fois dans la boucle for
            for (var i = 0 ; i < 2 ; i++) {

                // tmp always equals pts[0]
                // first  boucle tmp.length = 3
                // second boucle tmp.length = 2
                tmp = pts[ pts.length - 1 ];

                res = [];

                for (var j = 1 ; j < tmp.length ; j++) {
                    origin = tmp[j-1];
                    destin = tmp[j];
                    res.push(   {x: origin.x + (destin.x - origin.x) * pourcent,
                                 y: origin.y + (destin.y - origin.y) * pourcent}
                          );
                }
                pts.push(res);
            }
            // pts [0] : origin {x,y} middle {x,y} dest {x,y}
            // pts [1] : point A (entre origine et middle) et point B (entre middle et destination)
            // pts [2] : point ROUGE resultat
            return pts;
        }

        function getCurve(data) {
            // We get the curve for the data from the bezier table
		    // curve.length = 100
            var curve = bezier[data];

            // test if the curve already exists for this data
            if (!curve) {
                curve = bezier[data] = [];

                for (var pour_centage = 0 ; pour_centage <= 1 ; pour_centage += delta) {
                    // variable.length = 3
                    // variable [0] : 3 elements origin {x,y} middle {x,y} dest {x,y}
                    // variable [1] : 2 elements point A (entre origine et middle) et point B (entre middle et destination)
                    // variable [2] : 1 element point ROUGE resultat
                    var variable = getLevels(data, pour_centage);

                    var tmp = variable[2][0];
                    curve.push(tmp);
                }
            }
            if(data >= (CST + last_transactions.length) ){
                return [ curve.slice(0, 1.00 / delta + 1) ];
            }
            // return the slice of the curve that we want
            return [ curve.slice(0, pourcentage / delta + 1) ];
        }

        function getLat(data) {
            return data.x;
        }

        function getLng(data) {
            return data.y;
        }

        function colour(data, i) {
            return data.length > 0 ? "black" : "red";
        }
    };

    overlay.setMap(map_5);

    var menuControlDiv_5 = document.createElement('DIV');
    var menuControl_5 = new MenuControl_5(menuControlDiv_5, map_5);
    menuControlDiv_5.index = 1;
    map_5.controls[google.maps.ControlPosition.TOP_RIGHT].push(menuControlDiv_5);
}

function currencyColor(data, indice){
    //console.log("indice:"+indice);
    if(points_5[CST + indice][3] == "EURO")
        return "blue_curve";
    else if(points_5[CST + indice][3] == "USD")
        return "green_curve";
    else
        return "red_curve";
}

function fill_points5(){
	//console.log("FILL point5");
    for (var i = 0 ; i < transactions.length; i++) {
		var beforeSplitBuyer = transactions[i][9];
        var beforeSplitSupplier = transactions[i][10];
        var buyerLocations = beforeSplitBuyer.split(locationSeparator);
        var supplierLocations = beforeSplitSupplier.split(locationSeparator);
        var buyer_location_latitude = parseFloat(buyerLocations[0]);
        var buyer_location_longitude = parseFloat(buyerLocations[1]);
        var supplier_location_latitude = parseFloat(supplierLocations[0]);
        var supplier_location_longitude = parseFloat(supplierLocations[1]);
        var currency = transactions[i][11];

        var origin = coordinatesToPixels(supplier_location_latitude, supplier_location_longitude);
        var middle = calculateMiddle({lat:supplier_location_latitude, lng:supplier_location_longitude}, {lat:buyer_location_latitude, lng:buyer_location_longitude});
		var dest = coordinatesToPixels(buyer_location_latitude, buyer_location_longitude);
		//console.log("origin: "+origin);
		//console.log("middle: "+middle);
		//console.log("dest: "+dest);

        // 10 previous transactions
        points_5[CST + transactions.length + i] = new Array();
        points_5[CST + transactions.length + i] = points_5[CST + i];

        // 10 actual transactions
        points_5[CST + i] = new Array();
        points_5[CST + i].push(origin);
        points_5[CST + i].push(middle);
        points_5[CST + i].push(dest);
        points_5[CST + i].push(currency);

	}
}

function init_point5(){
    //console.log("INIT FILL point5");

    var beforeSplitBuyer = transactions[0][9];
    var buyerLocations = beforeSplitBuyer.split(locationSeparator);
    var buyer_location_latitude = parseFloat(buyerLocations[0]);
    var buyer_location_longitude = parseFloat(buyerLocations[1]);
    var currency = transactions[0][11];

    var middle = calculateMiddle({lat:buyer_location_latitude, lng:buyer_location_longitude}, {lat:buyer_location_latitude, lng:buyer_location_longitude});
    var dest = coordinatesToPixels(buyer_location_latitude, buyer_location_longitude);

    for (var i = 0 ; i < transactions.length; i++) {
        points_5[CST + i] = new Array();
        points_5[CST + i].push(dest);
        points_5[CST + i].push(middle);
        points_5[CST + i].push(dest);
        points_5[CST + i].push(currency);
	}
}

function calculateMiddle(orig, dest){
	var latitude;
	var longitude;
	var diff_lat;
	var diff_lng;
	if (orig.lat >= dest.lat){
		latitude = orig.lat - ((orig.lat - dest.lat)/2);
		diff_lat = orig.lat - dest.lat;
	}
	else{
		latitude = dest.lat - ((dest.lat - orig.lat)/2);
		diff_lat = dest.lat - orig.lat;
	}
	if (orig.lng >= dest.lng){
		longitude = orig.lng - ((orig.lng - dest.lng)/2);
		diff_lng = orig.lng - dest.lng;
	}
	else{
		longitude = dest.lng - ((dest.lng - orig.lng)/2);
		diff_lng = dest.lng - orig.lng;
	}
    var lat = latitude  + ( (diff_lng*30) / 100 );
    if (lat >= 85)
        lat = 84;
	return coordinatesToPixels(lat , longitude + ( (diff_lat*30) / 100 ));
}

function coordinatesToPixels(lat,lng){
	var coordinates = new google.maps.LatLng(lat,lng);
	return projection.fromLatLngToDivPixel(coordinates);
}

function MenuControl_5(menuControlDiv, map) {
    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map
    menuControlDiv.style.padding = '5px';

    var controlTextMenu = document.createElement('DIV');
    controlTextMenu.className = "control";
    controlTextMenu.innerHTML = 'Back to Menu';
    menuControlDiv.appendChild(controlTextMenu);
    
    // Setup the click event listeners
    google.maps.event.addDomListener(controlTextMenu, 'click', function() {

        // Hide the visualization
        $('#map_canvas5').hide();
        $('#div_slots3').hide();

        // Hide the div container
        $('#div_map').hide();

        // Show the menu
        $('#div_menu').show();

        visu_number = 0;
    });
}