var circles  = [];

var aggregated_transactions;

var string_key;

var isAmount;

var isAmountControlDiv;
var controlTextisAmount = document.createElement('DIV');
var controlTextisBuyer = document.createElement('DIV');

var map_2;
var myLatLngOrigin_2 = new google.maps.LatLng(28,-19);
var myMapOptions_2 = {
	streetViewControl: false,
    disableDefaultUI: true,
    maxZoom: 6,
    minZoom: 2,
    zoom: 3,
	center: myLatLngOrigin_2,
	mapTypeId: google.maps.MapTypeId.ROADMAP};

var menu_map_2;
var myMenuLatLngOrigin_2 = new google.maps.LatLng(21, 13);	
var myMenuMapOptions_2 = {
	zoom: 1,
    scrollwheel: false,
    draggable: false,
	disableDefaultUI: true,
	center: myMenuLatLngOrigin_2,
	mapTypeId: google.maps.MapTypeId.ROADMAP};

function initMenuVisu_2(){
	isAmount = true;
	menu_map_2 = new google.maps.Map(document.getElementById("menu_map_canvas2"),  myMenuMapOptions_2);
	calculCircles(transactions);
	drawCircles(menu_map_2);
}

function initVisu_2(){
	isAmount = true;

	string_key = "Amount";
    
	map_2 = new google.maps.Map(document.getElementById("map_canvas2"),  myMapOptions_2);
	
	// Create the DIV to hold the control and
	// call the HomeControl() constructor passing
	// in this DIV.
	var menuControlDiv = document.createElement('DIV');
	var menuControl = new MenuControl_2(menuControlDiv, map_2);
	menuControlDiv.index = 1;
	map_2.controls[google.maps.ControlPosition.TOP_RIGHT].push(menuControlDiv);

	isAmountControlDiv = document.createElement('DIV');
	var isAmountControl = new IsAmountControl(isAmountControlDiv, map_2);
	isAmountControlDiv.index = 2;
	map_2.controls[google.maps.ControlPosition.TOP_RIGHT].push(isAmountControlDiv);
}

function calculCircles(transactions){
	aggregated_transactions = new Array();
	var cptInsertTransac = 0;
	for (var i = 0; i < transactions.length; ++i) {
		var found = false;
		for (var j = 0; j < cptInsertTransac; ++j) {
            if (aggregated_transactions[j][9] == transactions[i][9]) {
                found = true;
                var valueAmount;
                var valueVolume;
                if (isAmount) {
                    valueAmount = parseFloat(aggregated_transactions[j][6]);
                    valueAmount += parseFloat(transactions[i][6]);
                    aggregated_transactions[j][6] = valueAmount.toString();
                }
                else {
                    valueVolume = parseFloat(aggregated_transactions[j][5]);
                    valueVolume += parseFloat(transactions[i][5]);
                    aggregated_transactions[j][5] = valueVolume.toString();
                }
            }
		}
		if (!found) {
			aggregated_transactions[cptInsertTransac] = new Array(12);
			aggregated_transactions[cptInsertTransac] = transactions[i];
			cptInsertTransac++;
		}
	}
}

function resetCircles(){
	for (var i = 0 ; i < circles.length ; i++){
		circles[i].setMap(null); // circles[i].setVisible(false); is equal
	}
	
	circles = [];
}

function drawCircles(aMap){
	resetCircles();
	
	for (var i = 0 ; i < aggregated_transactions.length ; ++i){
		var locations = aggregated_transactions[i][9].split(locationSeparator);
		var buyer_location_lattitude = locations[0];
		var buyer_location_longitude = locations[1];
		var myCircleCenter = new google.maps.LatLng(parseFloat(buyer_location_lattitude), parseFloat(buyer_location_longitude));
		
		var volume = parseInt(aggregated_transactions[i][5]);
		var amount = parseFloat(aggregated_transactions[i][6]);
        var amountOrVolume = isAmount ? amount : volume;
		var myCircleOptions = {
			center: myCircleCenter,
			radius: amountOrVolume*10000,
			strokeWeight: 1,
			map: aMap,
			fillColor: 'black',
			fillOpacity: 0.2
		};
		
		var myCircle = new google.maps.Circle(myCircleOptions);
		
		circles.push(myCircle);
	}
}

var context;
var canvas;

function drawKeyVisu_2(){
	canvas = document.getElementById('my_canvas');
    canvas.style.opacity = .7;
	context = canvas.getContext('2d');
	context.save();
	context.shadowOffsetX = 2;
	context.shadowOffsetY = 2;
	context.shadowBlur = 2;
	context.shadowColor = "rgba(0, 0, 0, 0.5)";
	context.fillStyle="#FFFFFF";
	context.fillRect(0,0,400,50);
	context.fillStyle="#000000";
	context.font = "10px Helvetica";
	context.fillText("Time : "+time_server, 9, 27);
	var img1;
	var img2 ;
	img1 = new Image();
	img1.src = "img/key10.png";
	context.drawImage(img1, 60, 5);
	if (isAmount)
		context.fillText("Big Amount", 108, 35);
	else
		context.fillText("Big Volume", 108, 35);
	img2 = new Image();
	img2.src = "img/key5.png";
	context.drawImage(img2, 170, 5);
	if (isAmount)
		context.fillText("Little Amount", 215, 35);
	else
		context.fillText("Little Volume", 215, 35);
	context.fillText("Transaction by ", 285, 18);
	context.fillText(string_key, 285, 38);
}


function setStringVisu_2() {
	console.log("setStringVisu2()");
    if (isAmount){
        string_key = "Amount";
    }
    else{
        string_key = "Volume";
    }
}

function IsAmountControl(isAmountControlDiv, map) {
	// Set CSS styles for the DIV containing the control
	// Setting padding to 5 px will offset the control
	// from the edge of the map
	isAmountControlDiv.style.padding = '5px';

	// Set CSS for the control border
	var controlUI = document.createElement('DIV');
    controlUI.className = "control";
    controlUI.innerHTML = 'Set to Volume';
	isAmountControlDiv.appendChild(controlUI);


	// Setup the click event listeners
	google.maps.event.addDomListener(controlUI, 'click', function() {
		map.controls[google.maps.ControlPosition.TOP_RIGHT].pop(isAmountControlDiv);
		
		if(this.innerHTML == 'Set to Volume')
			this.innerHTML = 'Set to Amount';
		else if(this.innerHTML == 'Set to Amount')
			this.innerHTML = 'Set to Volume';
		else
			console.log("controlTextisAmount error");

		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(isAmountControlDiv);
		
		isAmount = !isAmount;
		
		setStringVisu_2();
	});
}

function MenuControl_2(menuControlDiv, map) {
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
		$('#map_canvas2').hide();
		
		// Hide the div container
		$('#div_map').hide();
	    clearCanvas(context, canvas);				
        
		// Show the menu
		$('#div_menu').show();
		
		visu_number = 0;
	});
}

function clearCanvas(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
}
