define(function(require){
    var AnimClass = require('animationClass');
	var Curve = require('curve');
	var Processing = require('processingCanvas');
	
		var TransactionAnim = ring.create([AnimClass.AnimationClass], {
			init: function(txn)
			{
				var that = this;
				that.data = txn;
			},

			draw: function()
			{
				var curve = this.data.curve;
				var curvePointSize = this.getPointSize();

				if (this.time >= 0 && this.time <= AnimClass.DEFAULT_ANIMATION_LENGTH) {
					var x = Processing.bezierPoint(curve.buyerX, curve.buyerCX, curve.supplierCX,
									curve.supplierX, this.time / AnimClass.DEFAULT_ANIMATION_LENGTH);
					var y = Processing.bezierPoint(curve.buyerY, curve.buyerCY, curve.supplierCY,
									curve.supplierY, this.time / AnimClass.DEFAULT_ANIMATION_LENGTH);
					Processing.fill(this.data.color, 150);
					Processing.ellipse(x, y, curvePointSize, curvePointSize);
				}

				this.time += 2;
			},

			getPointSize: function()
			{
				var amount = this.data.amount;

				if (amount) {
					if (1000 > amount) {
						return Curve.CurvePointSizeSmall;
					}
					else if (1000000 > amount) {
						return Curve.CurvePointSizeLarge;
					}
				}

				return Curve.CurvePointSizeMedium;
			},

			end: function()
			{
				//        log("removing points from curve.id: " + this.data.curve.id);
				this.data.curve.points.shift();
			},

			name: 'Transaction Animation'
		});
	return TransactionAnim;
});
