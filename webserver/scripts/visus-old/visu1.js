var markers  = [];

var buyerControlDiv;
var supplierControlDiv;
var controlTextSupplier = document.createElement('DIV');
var controlTextBuyer = document.createElement('DIV');

var map_1;
var myLatLngOrigin_1 = new google.maps.LatLng(21, 13);
var myMapOptions_1 = {
	streetViewControl: false,
    zoom: 2,
    maxZoom: 6,
    minZoom: 2,
	center: myLatLngOrigin_1,
	mapTypeId: google.maps.MapTypeId.SATELLITE};
	
var menu_map_1;
var myMenuLatLngOrigin_1 = new google.maps.LatLng(21, 13);	
var myMenuMapOptions_1 = {
	zoom: 1,
    scrollwheel: false,
    draggable: false,
	disableDefaultUI: true,
	center: myMenuLatLngOrigin_1,
	mapTypeId: google.maps.MapTypeId.SATELLITE};

function initMenuVisu_1(){
	menu_map_1 = new google.maps.Map(document.getElementById("menu_map_canvas1"),  myMenuMapOptions_1);
	drawMarkers(menu_map_1);
}
			
function initVisu_1(){
	map_1 = new google.maps.Map(document.getElementById("map_canvas1"),  myMapOptions_1);
	
	// Create the DIV to hold the control and
	// call the HomeControl() constructor passing
	// in this DIV.
	var menuControlDiv = document.createElement('DIV');
	var menuControl = new MenuControl_1(menuControlDiv, map_1);
	menuControlDiv.index = 1;
	map_1.controls[google.maps.ControlPosition.TOP_RIGHT].push(menuControlDiv);
}

function resetMarkers(){
	for (var i = 0 ; i < markers.length ; i++){
		markers[i].setMap(null); // markers[i].setVisible(false); is equal
	}
	markers = [];
}

function drawMarkers(aMap){
	resetMarkers();
	
	for (var i = 0 ; i < (transactions.length - 1) ; ++i){
		
		var beforeSplitBuyer = transactions[i][9];
		var beforeSplitSupplier = transactions[i][10];
		var buyerLocations = beforeSplitBuyer.split(locationSeparator);
		var supplierLocations = beforeSplitSupplier.split(locationSeparator);
		var buyer_location_latitude = parseFloat(buyerLocations[0]);
		var buyer_location_longitude = parseFloat(buyerLocations[1]);
		var supplier_location_latitude = parseFloat(supplierLocations[0]);
		var supplier_location_longitude = parseFloat(supplierLocations[1]);
		var myMarkerCenterBuyer = new google.maps.LatLng(buyer_location_latitude, buyer_location_longitude);
		var myMarkerCenterSupplier = new google.maps.LatLng(supplier_location_latitude, supplier_location_longitude);
		
		var myMarkerOptionsBuyer = {
				position: myMarkerCenterBuyer,
				icon: white_img,
				map: aMap
			};
        var myMarker = new google.maps.Marker(myMarkerOptionsSupplier);
		markers.push(myMarker);
        
		var myMarkerOptionsSupplier = {
				position: myMarkerCenterSupplier,
				icon: white_img,
				map: aMap
			};
		myMarker = new google.maps.Marker(myMarkerOptionsBuyer);
		markers.push(myMarker);
	}
}

function drawKeyVisu_1(){
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
	img.src = "img/white.png";
	context.drawImage(img, 110, 10);
	context.fillText("Transaction", 140, 35);

	context.fillText("You are visualizing: ", 285, 18);
	context.fillText("Transactions", 285, 38);
}

function MenuControl_1(menuControlDiv, map) {
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
		$('#map_canvas1').hide();
		
		// Hide the div container
		$('#div_map').hide();
		
		// Show the menu
		$('#div_menu').show();
		
		visu_number = 0;
	});
}