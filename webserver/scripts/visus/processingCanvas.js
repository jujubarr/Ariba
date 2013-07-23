define(function (require) {
	console.log("processingCanvas.js");
	var canvas = document.getElementById('processing_canvas');
	var pjs = new Processing(canvas);
	return pjs;
});