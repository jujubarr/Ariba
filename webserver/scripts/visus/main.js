require.config({
    paths: {
        processing: 		'../static/processing',
		ring:				'../static/ring',
		underscore:			'../static/underscore',
		processingCanvas:	'processingCanvas',
		variables:			'variables',
        animationManager: 	'animation-manager-class',
        websocket: 			'websocket-class',
		client:				'websocket',
        visu: 				'visu14',

        animationClass: 	'animations/animation-class',
        background: 		'animations/background',
        circle: 			'animations/circle',
        curve: 				'animations/curve',
        slogan: 			'animations/slogan',
        transaction: 		'animations/transaction',
        twentyfourtimer: 	'animations/twentyfourtimer',
        warning: 			'animations/warning'
    },
	shim:{
		"underscore": {
            deps: [],
            exports: "_"
        },
        "ring": {
            deps: ["underscore"],
            exports: "ring"
        },		
	}
});


require(['visu', 'client'], function(Visu, Client)
{
    Client.init;
    Visu.init;
    console.log("Client initialized");
});


