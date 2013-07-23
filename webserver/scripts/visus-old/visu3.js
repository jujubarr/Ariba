var markers_3 = [];

var lines_3 = [];

var map_3;
var myLatLngOrigin_3 = new google.maps.LatLng(21, 13);
var myMapOptions_3 = {
    streetViewControl: false,
    maxZoom: 6,
    minZoom: 2,
    zoom: 2,
	center: myLatLngOrigin_3,
	mapTypeId: google.maps.MapTypeId.TERRAIN};

var menu_map_3;
var myMenuLatLngOrigin_3 = new google.maps.LatLng(21, 13);
var myMenuMapOptions_3 = {
	zoom: 1,
    scrollwheel: false,
    draggable: false,
	disableDefaultUI: true,
	center: myMenuLatLngOrigin_3,
	mapTypeId: google.maps.MapTypeId.TERRAIN};
			
function initMenuVisu_3(){
	menu_map_3 = new google.maps.Map(document.getElementById("menu_map_canvas3"),  myMenuMapOptions_3);
	drawMarkers_3(menu_map_3);
}

function initVisu_3(){	
	map_3 = new google.maps.Map(document.getElementById("map_canvas3"),  myMapOptions_3);
	
	// Create the DIV to hold the control and
	// call the HomeControl() constructor passing
	// in this DIV.
	
	var menuControlDiv = document.createElement('DIV');
	var menuControl = new MenuControl_3(menuControlDiv, map_3);
	menuControlDiv.index = 1;
	map_3.controls[google.maps.ControlPosition.TOP_RIGHT].push(menuControlDiv);
	
	lineControlDiv = document.createElement('DIV');
	var lineControl_3 = new LineControl_3(lineControlDiv, map_3);
	lineControlDiv.index = 2;
	map_3.controls[google.maps.ControlPosition.TOP_RIGHT].push(lineControlDiv);
}

function resetMarkers_3(){
	for (var i = 0 ; i < markers_3.length ; i++){
		markers_3[i].setMap(null); // markers_3[i].setVisible(false); is equal
	}
	markers_3 = [];
}

function resetLines_3(){
	for (var i = 0 ; i < lines_3.length ; i++){
		lines_3[i].setMap(null); // lines_3[i].setVisible(false); is equal
	}
	lines_3 = [];
}

function drawMarkers_3(aMap){
	resetMarkers_3();
	//if (visu_number == 0)
		resetLines_3();
	
	for (var i = 0 ; i < (transactions.length - 1) ; ++i){
		
		var beforeSplitBuyer = transactions[i][9];
		var beforeSplitSupplier = transactions[i][10];
		var buyerLocations = beforeSplitBuyer.split(locationSeparator);
		var supplierLocations = beforeSplitSupplier.split(locationSeparator);
		var buyer_location_lattitude = parseFloat(buyerLocations[0]);
		var buyer_location_longitude = parseFloat(buyerLocations[1]);
		var supplier_location_lattitude = parseFloat(supplierLocations[0]);
		var supplier_location_longitude = parseFloat(supplierLocations[1]);
		var myMarkerCenterBuyer = new google.maps.LatLng(buyer_location_lattitude, buyer_location_longitude);
		var myMarkerCenterSupplier = new google.maps.LatLng(supplier_location_lattitude, supplier_location_longitude);

		var	myMarkerOptionsBuyer = {
            position: myMarkerCenterBuyer,
            icon: red_img,
            map: aMap
        };
        var myMarker = new google.maps.Marker(myMarkerOptionsBuyer);
        markers_3.push(myMarker);
        var myMarkerOptionsSupplier = {
            position: myMarkerCenterSupplier,
            icon: red_img,
            map: aMap
        };
        myMarker = new google.maps.Marker(myMarkerOptionsSupplier);
        markers_3.push(myMarker);
		
		var lineCoordinates = [
			myMarkerCenterBuyer,
			myMarkerCenterSupplier
		];
		
		var myLine = new google.maps.Polyline({
			path: lineCoordinates,
			strokeColor: "#000000",
			strokeOpacity: 1.0,
			strokeWeight: 0.5
		});
		myLine.setMap(aMap);
		lines_3.push(myLine);
	}
}

function drawKeyVisu_3(){
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
	context.fillText("Time : "+time_server, 39, 27);

	var img = new Image();
	img.src = "img/marker.png";
	context.drawImage(img, 110, 10);
	context.fillText("Transaction", 140, 35);

	context.fillText("You are visualizing: ", 285, 18);
	context.fillText("Transactions", 285, 38);
}

function LineControl_3(menuControlDiv, map) {
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
	controlUI.title = 'Click to reset lines';
	menuControlDiv.appendChild(controlUI);

	// Set CSS for the control interior
	var controlTextMenu = document.createElement('DIV');
	controlTextMenu.style.fontFamily = 'Arial,sans-serif';
	controlTextMenu.style.fontSize = '12px';
	controlTextMenu.style.paddingLeft = '4px';
	controlTextMenu.style.paddingRight = '4px';
	controlTextMenu.innerHTML = '<b>Reset lines</b>';
	controlUI.appendChild(controlTextMenu);

	// Setup the click event listeners
	google.maps.event.addDomListener(controlUI, 'click', function() {
		resetLines_3();
	});
}

function MenuControl_3(menuControlDiv, map) {
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
		/***************************************************************************/
        $('#div_slots3').hide();
        /***************************************************************************/
		// Hide the visualization
		$('#map_canvas3').hide();
		
		// Hide the div container
		$('#div_map').hide();
		
		// Show the menu
		$('#div_menu').show();
        
        /***************************************************************************/
        $('#header').show();
        /***************************************************************************/
		visu_number = 0;
	});
}