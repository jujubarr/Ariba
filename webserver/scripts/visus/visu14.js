define(function(require)
{
	var Canvas = require('processingCanvas');
	//var Variables = require('variables');
	var AnimationManager = require('animationManager');
	var AnimationClass = require('animationClass'); 
	var Curve = require('curve');
	var Transaction = require('transaction');
	
	function callback()
	{
		var txn = transactions.shift();
		while (txn) {
			txn.time = 0;
			TransactionAnim = new Transaction();
			TransactionAnim.init(txn);
            this.enqueue(TransactionAnim);

			var buyerX = txn.buyerX * width / 100;
			var buyerY = txn.buyerY * height / 100;
			var supplierX = buyerX;
			var supplierY = buyerY;
			// txn.amount = getRandomInt(1, 1250000);

			if (txn.supplierX) {
				supplierX = txn.supplierX * width / 100;
			}

			if (txn.supplierY) {
				supplierY = txn.supplierY * height / 100;
			}

			if (UrlConfig.amount_color) {
				txn.color = AnimationClass.CurrencyColorMedium;

				if (txn.amount) {
					if (100000 > txn.amount) {
						txn.color = AnimationClass.CurrencyColorSmall;
					}
					else if (1000000 > txn.amount) {
						txn.color = AnimationClass.CurrencyColorLarge;
					}
				}
			}
			else {
				txn.color = AnimationClass.CurrencyDefaultColor;
				if (txn.currency) {
					var color = AnimationClass.CurrencyToColor[txn.currency];
					if (color) {
						txn.color = color;
					}
				}
			}

			var local = txn.local = buyerX == supplierX && buyerY == supplierY;

			var curve = Curve.getCurve(buyerX, buyerY, supplierX, supplierY, txn.color, local);
			var points = curve.points;
			if (points.length == 0) {
				txn.time = -20;
			}
			else {
				txn.time = points[points.length - 1].time - Math.random(5, 10);
			}
			txn.curve = curve;
			curve.points.push(txn);
			// log("add points to curve.id: " + curve.id);
			txn = transactions.shift();
		}
	}
		
	function init()
	{
		console.log("Visu Initialization");
		var animManager = new AnimationManager;
		animManager.init(callback);
		
		setManager(animManager);
		// called automatically by processing, initialization
		Canvas.setup = function()
		{
			animManager.setup();
		}

		// called automatically by processing continuing the animation
		Canvas.draw = function()
		{
			animManager.draw();
		}
		Canvas.setup();
		Canvas.draw();
		Canvas.loop();
	}

	return{
		init: init(),
		animManager: animManager
	}

});
