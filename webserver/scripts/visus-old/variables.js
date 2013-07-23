var IsLocal = location.href.indexOf("file") > -1;

var transactions = [];
if (IsLocal) {
    var repeat = 0;
    setInterval(function () {
        if (repeat < 20) {
            for (var i = 0; i < 61; i++) {
                transactions.push({"buyerY":"40","buyerX":"13","supplierX":"13","supplierY":"40","currency":"USD"});
            }
        }
        repeat++;
    }, 5000)
}
//var transactions = [];

var last_transactions = new Array();

var aggregated_day_transactions;
var aggregated_month_transactions;
var aggregated_year_transactions;

var days_IDs_table;
var months_IDs_table;
var years_IDs_table;

var rebuild_aggregated_day_transactions;
var rebuild_aggregated_month_transactions;
var rebuild_aggregated_year_transactions;

var transacSeparator = ";";
var itemSeparator = ",";
var locationSeparator = ":";
var currencySeparator = " ";

var hasReceivedHistoricalDataVisu8;

var currency = [];

var curve_indice = 0;

var init_date;
var today_date = new Date();
var	today_month = today_date.getMonth();
var	today_year = today_date.getFullYear();
var yesterday_date = new Date(today_date.getTime() - 86400000);

var limit;

var months_names = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var end_months = [31,28,31,30,31,30,31,31,30,31,30,31];

var visu_number;

var time_slot;
var time_server; // sert dans visu1 visu2 visu3 visu4
/*
// sert dans visu1 et visu4
var white_img = new google.maps.MarkerImage('img/white.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			new google.maps.Size(20, 34),
			// The origin for this image is 0,0.
			new google.maps.Point(0,0)
			);

// sert dans visu1
var yellow_img = new google.maps.MarkerImage('img/yellow.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			new google.maps.Size(20, 34),
			// The origin for this image is 0,0.
			new google.maps.Point(0,0)
			);

// sert dans visu3
var red_img = new google.maps.MarkerImage('img/marker.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			new google.maps.Size(20, 34),
			// The origin for this image is 0,0.
			new google.maps.Point(0,0)
			);

// sert dans visu3
var blue_img = new google.maps.MarkerImage('img/blue.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			new google.maps.Size(20, 34),
			// The origin for this image is 0,0.
			new google.maps.Point(0,0)
			);

// sert dans visu4
var negative_img = new google.maps.MarkerImage('img/negative.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			new google.maps.Size(20, 34),
			// The origin for this image is 0,0.
			new google.maps.Point(0,0)
			);
*/