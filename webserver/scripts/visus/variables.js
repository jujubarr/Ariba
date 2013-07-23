var animManager;

function setManager(manager)
{
	animManager = manager;
}

var UrlConfig = {};
// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
(function()
{
    var match, pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^&=]+)=+([^&]*)/g, decode = function(s)
    {
        return decodeURIComponent(s.replace(pl, " "));
    }, query = window.location.search.substring(1);

    while (match = search.exec(query)) {
        UrlConfig[decode(match[1])] = decode(match[2]);
    }
})();

var IsLocal = location.href.indexOf("file") > -1;
var IntroInProgress = true;
var Debug = UrlConfig.debug;
var width = 1100;
var height = 550;

// print something to the console, when in debug mode
function log(msg)
{
    if (Debug) {
        console.log(msg);
    }
}

var StartEndMsStack = [];

function UpdateStartEndMsStack(iTimeMs)
{
    StartEndMsStack.push(iTimeMs);
}

var transactions = [];
// Debugging: This is if you're not connected to server
if (IsLocal) {
    var repeat = 0;
    setInterval(function()
    {
        if (repeat < 20) {
            for ( var i = 0; i < 61; i++) {
                transactions.push({
                    "buyerY": "40",
                    "buyerX": "13",
                    "supplierX": "13",
                    "supplierY": "40",
                    "currency": "USD"
                });
            }
        }
        repeat++;
    }, 5000)
}
