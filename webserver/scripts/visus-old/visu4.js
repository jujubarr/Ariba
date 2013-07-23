var curves_4 = [];

var markers_4 = [];

var map_4;
var myLatLngOrigin_4 = new google.maps.LatLng(21, 13);
var myMapOptions_4 = {
	streetViewControl: false,
    maxZoom: 6,
    minZoom: 2,
	zoom: 2,
	center: myLatLngOrigin_4,
	mapTypeId: google.maps.MapTypeId.TERRAIN};

var menu_map_4;
var myMenuLatLngOrigin_4 = new google.maps.LatLng(21, 13);
var myMenuMapOptions_4 = {
	zoom: 1,
    scrollwheel: false,
    draggable: false,
	disableDefaultUI: true,
	center: myMenuLatLngOrigin_4,
	mapTypeId: google.maps.MapTypeId.TERRAIN};

var myLatLngOrigin = new google.maps.LatLng(10, 80);
var myLatLngFin = new google.maps.LatLng(5, 1);

function initMenuVisu_4(){
	menu_map_4  = new google.maps.Map(document.getElementById("menu_map_canvas4"),  myMenuMapOptions_4);
}

function initVisu_4(){
	map_4 = new google.maps.Map(document.getElementById("map_canvas4"),  myMapOptions_4);
	
	// Create the DIV to hold the control and
	// call the HomeControl() constructor passing
	// in this DIV.
	
	var menuControlDiv = document.createElement('DIV');
	var menuControl = new MenuControl_4(menuControlDiv, map_4);
	menuControlDiv.index = 1;
	map_4.controls[google.maps.ControlPosition.TOP_RIGHT].push(menuControlDiv);
	
	lineControlDiv = document.createElement('DIV');
	var lineControl_4 = new CurveControl_4(lineControlDiv, map_4);
	lineControlDiv.index = 2;
	map_4.controls[google.maps.ControlPosition.TOP_RIGHT].push(lineControlDiv);
}

function resetMarkers_4(){
	for (var i = 0 ; i < markers_4.length ; i++){
		markers_4[i].setMap(null); // markers_4[i].setVisible(false); is equal
	}
	markers_4 = [];
}

var zone = 0;

function resetCurves_4(){
    if (curves_4.length >= (zone + 20)){
        for (var i = zone ; i < (zone + 10) ; i++){
		    curves_4[i].setMap(null); // lines[i].setVisible(false); is equal
        }
        zone = zone + 10;
	}
	//curves_4 = [];
}

function resetAllCurves_4(){
    zone = 0;
    for (var i = 0 ; i < curves_4.length ; i++){
        curves_4[i].setMap(null); // lines[i].setVisible(false); is equal
    }
    curves_4 = [];
}

function drawCurves_4(aMap){
    resetMarkers_4();
    //if (visu_number == 0)
		resetCurves_4();

	for (var i = 0 ; i < (transactions.length - 1) ; ++i){
        var beforeSplitBuyer = transactions[indice][9];
		var beforeSplitSupplier = transactions[indice][10];
		var buyerLocations = beforeSplitBuyer.split(locationSeparator);
		var supplierLocations = beforeSplitSupplier.split(locationSeparator);
		var buyer_location_lattitude = parseFloat(buyerLocations[0]);
		var buyer_location_longitude = parseFloat(buyerLocations[1]);
		var supplier_location_lattitude = parseFloat(supplierLocations[0]);
		var supplier_location_longitude = parseFloat(supplierLocations[1]);
		var myMarkerCenterBuyer = new google.maps.LatLng(buyer_location_lattitude, buyer_location_longitude);
		var myMarkerCenterSupplier = new google.maps.LatLng(supplier_location_lattitude, supplier_location_longitude);

        var lineCoordinates = [
            myMarkerCenterBuyer,
            myMarkerCenterSupplier
        ];

        var myCurve = new google.maps.Polyline({
            path:lineCoordinates,
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 0.7,
            geodesic: true
        });
        myCurve.setMap(aMap);
        curves_4.push(myCurve);
        indice++;

        var	myMarkerOptionsBuyer = {
            position: myMarkerCenterBuyer,
            icon: negative_img,
            map: aMap
        };
        var myMarker = new google.maps.Marker(myMarkerOptionsBuyer);
        markers_4.push(myMarker);
        var myMarkerOptionsSupplier = {
            position: myMarkerCenterSupplier,
            icon: negative_img,
            map: aMap
        };
        myMarker = new google.maps.Marker(myMarkerOptionsSupplier);
        markers_4.push(myMarker);

	}
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

function drawKeyVisu_4(){
	var canvas = document.getElementById('my_canvas');
	var context = canvas.getContext('2d');

	context.shadowOffsetX = 2;
	context.shadowOffsetY = 2;
	context.shadowBlur = 2;
	context.shadowColor = "rgba(0, 0, 0, 0.5)";
	context.fillStyle="#FFFFFF";
	context.fillRect(0,0,400,50);
	context.fillStyle="#000000";
	context.font = "10px Helvetica";
	context.fillText("Time : "+time_server, 9, 27);

	var img = new Image();
	img.src = "img/negative.png";
	context.drawImage(img, 110, 10);
	context.fillText("Transaction", 140, 35);

	context.fillText("You are visualizing: ", 285, 18);
	context.fillText("All transactions", 285, 38);
}

function CurveControl_4(menuControlDiv, map) {
	// Set CSS styles for the DIV containing the control
	// Setting padding to 5 px will offset the control
	// from the edge of the map
	menuControlDiv.style.padding = '5px';

	// Set CSS for the control border
	var controlUI = document.createElement('DIV');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '2px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Click to reset curves';
	menuControlDiv.appendChild(controlUI);

	// Set CSS for the control interior
	var controlTextMenu = document.createElement('DIV');
	controlTextMenu.style.fontFamily = 'Arial,sans-serif';
	controlTextMenu.style.fontSize = '12px';
	controlTextMenu.style.paddingLeft = '4px';
	controlTextMenu.style.paddingRight = '4px';
	controlTextMenu.innerHTML = '<b>Reset curves</b>';
	controlUI.appendChild(controlTextMenu);

	// Setup the click event listeners
	google.maps.event.addDomListener(controlUI, 'click', function() {
		resetAllCurves_4();
	});
}

function MenuControl_4(menuControlDiv, map) {
	// Set CSS styles for the DIV containing the control
	// Setting padding to 5 px will offset the control
	// from the edge of the map
	menuControlDiv.style.padding = '5px';

	// Set CSS for the control border
	var controlUI = document.createElement('DIV');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '2px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Click to go to menu';
	menuControlDiv.appendChild(controlUI);

	// Set CSS for the control interior
	var controlTextMenu = document.createElement('DIV');
	controlTextMenu.style.fontFamily = 'Arial,sans-serif';
	controlTextMenu.style.fontSize = '12px';
	controlTextMenu.style.paddingLeft = '4px';
	controlTextMenu.style.paddingRight = '4px';
	controlTextMenu.innerHTML = '<b>Back to Menu</b>';
	controlUI.appendChild(controlTextMenu);

	// Setup the click event listeners
	google.maps.event.addDomListener(controlUI, 'click', function() {
			
		// Hide the visualization
		$('#map_canvas4').hide();
		
		// Hide the div container
		$('#div_map').hide();
		
		// Show the menu
		$('#div_menu').show();
		
		visu_number = 0;
	});
}