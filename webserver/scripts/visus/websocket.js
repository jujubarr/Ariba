define(['websocket'],function(Websocket){	
	var wsUri = UrlConfig.show24 ? "./data24" : "./data"; 
	var websocket = null;
	function init()
	{
		console.log("Client initialization.");
		websocket = new Websocket;
		websocket.init(wsUri);
	}
	if (window.addEventListener) {
		window.addEventListener("load", init, false);
	}
	else {
		window.attachEvent("onload", init);
	}

	return{
		init: init()
	}	
});



    

    


