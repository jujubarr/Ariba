define(function(require){
    var AnimClass = require('animationClass');
	var Processing = require('processingCanvas');
	
		var BackgroundAnim = ring.create([AnimClass.AnimationClass], {
			draw: function()
			{
				Processing.background(AnimClass.BackgroundColor);
				Processing.image(AnimClass.mapBackground, 0, 0);
				Processing.image(AnimClass.logo, 0, 445);
			},

			finished: function()
			{
				return false;
			},

			name: 'Background Animation',
		});
	return BackgroundAnim;
});