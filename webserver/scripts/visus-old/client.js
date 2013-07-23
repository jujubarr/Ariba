/*
 Copyright (c) 1999-2013 Ariba, Inc.
 All rights reserved. Patents pending.

 arecibo/client.js

 Responsible: msnider
 */

/*
 * Tool for processing URL arguments into an object that can be used by the
 * page.
 */
var UrlConfig = {};
// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
(function ()
{
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=+([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, " "));
        },
        query  = window.location.search.substring(1);

    while (match = search.exec(query)) {
       UrlConfig[decode(match[1])] = decode(match[2]);
    }
})();

// CONNECTION TO THE SERVER

var wsUri = UrlConfig.show24 ? "./data24" : "./data",
    websocket = null;

if (window.addEventListener) {
    window.addEventListener("load", init, false);
}
else {
    window.attachEvent("onload", init);
}


function init ()
{
    console.log("Client initialization.");
    streamingWebSocket();
}

function streamingWebSocket ()
{

    websocket = new VisualizerWebSocket(wsUri);

    websocket.onopen = function() { onOpen(); };
    websocket.onclose = function() { onClose(); };  
    websocket.onmessage = function(evt) {
        onMessage(evt);
    };
    websocket.onerror = function(evt) { onError(evt); };

}

function onOpen ()
{
    time_server = 0;
    console.log("onOpen");

}

function onClose ()
{
    console.log("onClose");
}

function pushOnTransaction (i, oTxn)
{
    transactions.push(oTxn);
}

function onMessage (evt)
{
    var oData = JSON.parse(evt.data),
        aDelayGroup1 = [],
        aDelayGroup2 = [],
        aDelayGroup3 = [],
        aDelayGroup4 = [];

    // for the 24 hour visualization we randomize when the transaction
    // enters the animation stream to smooth out when lines appear/disappear
    $.each(oData.POs, function (i, x)
    {
        switch (UrlConfig.show24 ? i % 5 : 0) {
            case 0:
                transactions.push(x);
            break;
            case 1:
                aDelayGroup1.push(x);
            break;
            case 2:
                aDelayGroup2.push(x);
            break;
            case 3:
                aDelayGroup3.push(x);
            break;
            case 4:
                aDelayGroup4.push(x);
            break;
        }
    });

    setTimeout(function ()
    {
        $.each(aDelayGroup1, pushOnTransaction);
    }, 250);

    setTimeout(function ()
    {
        $.each(aDelayGroup2, pushOnTransaction);
    }, 500);

    setTimeout(function ()
    {
        $.each(aDelayGroup3, pushOnTransaction);
    }, 750);

    setTimeout(function ()
    {
        $.each(aDelayGroup4, pushOnTransaction);
    }, 1000);
}

function onError (evt)
{
    console.log("Error :" + evt.data);
}

function doSend (msg)
{
    console.log("Demand aggregated data.");
    websocket.send(msg);
}