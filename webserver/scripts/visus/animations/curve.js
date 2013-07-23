define(function(require){
	var AnimClass = require('animationClass');
	var Processing = require('processingCanvas');

	var CurveSets = {};
	var CircleCoreSets = {};
	var RegionCenterToSize = {
		"FC": 5,
		"CC": 10
	};
	var CurveAlpha = 200;
	var CurveSize = 3;

	var MaxCurveSetSize = 5;
	var PreferredCurvePointCount = 1;
	var CurveId = 0;

	function getCurve(buyerX, buyerY, supplierX, supplierY, color, local)
	{
		var curveSetId = buyerX + ":" + buyerY + "," + supplierX + ":" + supplierY + ","
						+ local;
		var curveSet = CurveSets[curveSetId];
		var curveSetByColor;
		if (!curveSet) {
			curveSet = CurveSets[curveSetId] = [];
		}
		var curve = findCurve(curveSet, color);
		// var curve;
		if (!curve) {
			curve = {
				color: color,
				local: local,
				points: [],
				alpha: CurveAlpha,
				buyerX: buyerX,
				buyerY: buyerY,
				supplierX: supplierX,
				supplierY: supplierY
			};
			if (local) {
				var direction = buyerX < width / 2 ? 1 : -1;
				var curveWidth = 25 + curveSet.length * 10;
				var curveHeight = 25 + curveSet.length * 15;
				curve.buyerCX = buyerX + curveWidth * direction;
				curve.buyerCY = buyerY - curveHeight;
				curve.supplierCX = supplierX + curveWidth * direction;
				curve.supplierCY = supplierY + curveHeight;
				curve.supplierX++;
			}
			else {
				var direction = buyerX - supplierX < 0 ? 1 : -1;
				// log("direction: " + direction);
				var distance = Math.abs(buyerX - supplierX);
				// log("distance: " + distance);
				var curveHeight = distance / 3 + curveSet.length * direction * 7;
				// log("curveHeight: " + curveHeight);
				curve.buyerCX = buyerX + direction * 0;
				curve.buyerCY = buyerY - direction * curveHeight;
				curve.supplierCX = supplierX - direction * 0;
				curve.supplierCY = supplierY - direction * curveHeight;

			}
			curveSet.push(curve);
			curve.id = CurveId++;
			// log("add " + curveSet.length);
			animManager.enqueue(new CurveAnim(curve, curveSet));
		}
		return curve;
	}

	// Find the least busy curve
	// Return null all curve at preferred count
	function findCurve(curveSet, color)
	{
		var len = curveSet.length;
		if (len == 0) {
			return null;
		}
		var minCurve = null;
		var lengthByColor = 0;
		for ( var i = 0; i < curveSet.length; i++) {
			var curve = curveSet[i];
			if (curve.color == color) {
				lengthByColor++;
				if (curve.stage != 'exiting') {
					if (minCurve == null || curve.points.length < minCurve.points.length) {
						minCurve = curve;
					}
				}
			}
		}
		if (minCurve == null) {
			// log("minCurve == null");
			return null;
		}
		if (minCurve.points.length < PreferredCurvePointCount) {
			return minCurve;
		}
		else if (lengthByColor >= MaxCurveSetSize) {
			logCurveSet(curveSet);
			return minCurve;
		}
		return null;
	}

	function logCurveSet(curveSet)
	{
		if (Debug) {
			// console.log("** logCurveSet");
			for ( var i = 0; i < curveSet.length; i++) {
				var curve = curveSet[i];
				// console.log("curve.id " + curve.id + ", curve.stage + " +
				// curve.stage + ", curve.points.length: " +
				// curve.points.length);
			}
			// console.log("logCurveSet **");
		}
	}

	function getCircleCore(x, y, regionType)
	{
		var circleCoreSetId = x + ":" + y;
		var circleCoreSet = CircleCoreSets[circleCoreSetId];
		if (!circleCoreSet) {
			circleCoreSet = CircleCoreSets[circleCoreSetId] = [];
		}
		var circleCore = findCircleCore(circleCoreSet);
		if (!circleCore) {
			var offset = circleCoreSet.length * 4;
			if (!regionType) {
				regionType = "FC";
			}
			circleCore = new CircleAnim(regionType, x + offset, y + offset);
			circleCoreSet.push(circleCore);
			animManager.enqueue(circleCore);
		}
		return circleCore;
	}

	var MaxCircleCoreSetSize = 1;
	var PreferredCircleCount = 10;

	function findCircleCore(circleCoreSet)
	{
		var len = circleCoreSet.length;
		if (len == 0) {
			return null;
		}
		var minCircleCore = circleCoreSet[0];
		for ( var i = 1; i < circleCoreSet.length; i++) {
			var circleCore = circleCoreSet[i];
			if (circleCore.circles.length < minCircleCore.circles.length) {
				minCircleCore = circleCore;
			}
		}
		if (len == MaxCircleCoreSetSize) {
			return minCircleCore;
		}
		else if (minCircleCore.circles.length < PreferredCircleCount) {
			return minCircleCore;
		}
		return null;
	}

	function tPoint(x1, x2, t)
	{
		return (x2 - x1) * t + x1;
	}

	function subBezier(curve, t)
	{
		// de Casteljau's algorithm
		var buyerX = curve.buyerX;
		var buyerY = curve.buyerY;

		// 4 to 3 points
		var xPoints = reducePoints(
						[buyerX, curve.buyerCX, curve.supplierCX, curve.supplierX], t);
		var yPoints = reducePoints(
						[buyerY, curve.buyerCY, curve.supplierCY, curve.supplierY], t);
		var c1X = xPoints[0];
		var c1Y = yPoints[0];

		// 3 to 2 points
		xPoints = reducePoints(xPoints, t);
		yPoints = reducePoints(yPoints, t);
		var c2X = xPoints[0];
		var c2Y = yPoints[0];

		// 2 to 1 point
		var subX = reducePoints(xPoints, t)[0];
		var subY = reducePoints(yPoints, t)[0];

		Processing.bezier(curve.buyerX, curve.buyerY, c1X, c1Y, c2X, c2Y, subX, subY);
	}

	function reducePoints(points, t)
	{
		var reducedPoints = [];
		for ( var i = 0; i < points.length - 1; i++) {
			reducedPoints.push(tPoint(points[i], points[i + 1], t));
		}
		return reducedPoints;
	}

	var CurveAnim = ring.create([AnimClass.AnimationClass], {
		init: function(curve, curveSet)
		{
			var that = this;
			that.data = curve;
			that.curveSet = curveSet;
		},
		draw: function()
		{
			if (AnimClass.DEFAULT_ANIMATION_LENGTH >= this.time) {
				this.drawCurveEnter();
			}
			else {
				this.drawCurveExit();
			}
		},

		drawCurveEnter: function()
		{
			Processing.strokeWeight(CurveSize);
			Processing.strokeCap(Processing.ROUND);
			var curve = this.data;
			// log("draw curve id: " + curve.id + ", time: " + this.time);

			if (AnimClass.DEFAULT_ANIMATION_LENGTH / 2 > this.time) {
				// log("in progress curve: " + this.time);
				Processing.stroke(curve.color, curve.alpha);
				subBezier(curve, this.time / (AnimClass.DEFAULT_ANIMATION_LENGTH / 2));
				this.time += 1;
			}
			else if (AnimClass.DEFAULT_ANIMATION_LENGTH >= this.time) {
				Processing.stroke(curve.color, curve.alpha);
				Processing.bezier(curve.buyerX, curve.buyerY, curve.buyerCX, curve.buyerCY,
								curve.supplierCX, curve.supplierCY, curve.supplierX,
								curve.supplierY);
				this.time += 1;
			}
		},

		drawCurveExit: function()
		{
			var curve = this.data;
			var alpha = curve.alpha;

			//if (0 === curve.points.length) {
				if (!curve.stage) {
					curve.stage = 'exiting';
					// log("curve exiting: " + curve.id);
				}
				alpha = alpha * (1 - (this.time - AnimClass.DEFAULT_ANIMATION_LENGTH)
												/ AnimClass.DEFAULT_ANIMATION_LENGTH);
				this.time += 1;
			//}
			//else {
				// log("called drawCurveExit id: " + curve.id + ",
				// curve.points.length: " + curve.points.length);
			//}

			Processing.strokeWeight(CurveSize);
			Processing.strokeCap(Processing.ROUND);
			Processing.stroke(curve.color, alpha);
			Processing.bezier(curve.buyerX, curve.buyerY, curve.buyerCX, curve.buyerCY,
							curve.supplierCX, curve.supplierCY, curve.supplierX,
							curve.supplierY);
		},

		end: function()
		{
			var curveSet = this.curveSet;
			var curve = this.data;

			for ( var i = 0; i < curveSet.length; i++) {
				if (curveSet[i] === curve) {
					curveSet.splice(i, 1);
					// log("remove curve.id: " + curve.id + ", curve.points.length:
					// " + curve.points.length);
					break;
				}
			}
		},

		finished: function()
		{
			return 2 * AnimClass.DEFAULT_ANIMATION_LENGTH < this.time;
		},

		name: 'Curve Animation',
	});
	
	return {
		CurvePointSizeSmall: 4,
		CurvePointSizeMedium: 6,
		CurvePointSizeLarge: 8,
		getCurve: function(buyerX, buyerY, supplierX, supplierY, color, local)
		{
			return getCurve(buyerX, buyerY, supplierX, supplierY, color, local);
		},
		CurveAnim: CurveAnim,		
	}
});
