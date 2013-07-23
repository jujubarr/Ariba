define(function(require) {
	
	//  Variables for animations class
		var Processing = require('processingCanvas');
		
	return {
		DEFAULT_ANIMATION_LENGTH:
			UrlConfig.animLength || UrlConfig.show24 ? 10 : 100,
		PERIOD_FOR_24_HOURS: UrlConfig.period || 10 * 60 * 1000, // 10 minutes
		DAY_IN_MILLIS: 24 * 60 * 60 * 1000,
		mapBackground: Processing.loadImage(""),
		logo: Processing.loadImage(""),
		myFont: Processing.loadFont(""),

	//  Colors
		BackgroundColor: Processing.color(0xFF666666),
		SloganColor: Processing.color(0xFFFFFFFF),
		WarningColor: Processing.color(224, 224, 224, 192),
		FutureColor: Processing.color(0xFFCCCCCC),
		RegionCenterToColor: {
						"FC" : 0xFF898185,
						"CC" : 0xFF898185
		},
		CurrencyToColor: {
						"USD" : 0xFF73D62B,
						"EUR" : 0xFF1EBFFF,
						"OTHER" : 0xFFFFE521
		},
		CurrencyDefaultColor: Processing.color(0xFFFFE521),
		CurrencyColorSmall: Processing.color(0xFFD62B73),
		CurrencyColorMedium: Processing.color(0xFF73D62B),
		CurrencyColorLarge: Processing.color(0xFFD6732B),


	//  Interface Class used for managing animations, subclasses must define draw function
		AnimationClass: ring.create({
			data     : null,  // optional data
			draw     : null,  // required, the function to render this animation
			end      : null,  // optional function to call, when animation is finished
			finished : function() {
				return this.DEFAULT_ANIMATION_LENGTH < this.time;
			},  // optional function to indicate when to stop
			name     : null,  // the name of the animation, useful for debugging
			reset: function() {
				this.time = 0;
			},
			start    : null,  // optional function to call, before animation begins
			time     : 0,      // required, the time counter
		})
	}
});