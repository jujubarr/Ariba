define(function(require){
    var AnimClass = require('animationClass');	
	var Processing = require('processingCanvas');

		var SloganAnim = ring.create([AnimClass.AnimationClass], {
			data: {
				text: ['WELCOME TO', 'THE NETWORKED ECONOMY', '', 'Willkommen',
						'in der Netz-Wirtschaft'],
				x: 500,
				y: 100
			},

			draw: function()
			{
				var alpha = 256;
				var slogan = this.data;
				var sloganText = slogan.text;
				var x = null;
				var y = slogan.y;

				// for the first 100 iterations, adjust the alpha of the
				// background color
				if (100 <= this.time) {
					alpha = alpha * (200 - this.time) / 100;
				}

				// repaint the whole background
				Processing.fill(AnimClass.BackgroundColor, alpha);
				Processing.rect(0, 0, width, height);

				// draw slogan into the new new position
				if (100 > this.time) {
					x = (slogan.x - 100) + 100 * this.time / 100;
					alpha = alpha * this.time / 100;
					this.drawSlogan(x, y, alpha, sloganText);
					this.time += 1;
				}
				// fade the slogan out
				else {
					this.drawSlogan(slogan.x, y, alpha, sloganText);
					this.time += 0.7;
				}
			},

			// draw the slogan text
			drawSlogan: function(x, y, alpha, sloganText)
			{
				// log(alpha);
				Processing.fill(AnimClass.SloganColor, alpha);
				for ( var i = 0; i < sloganText.length; i++) {
					Processing.text(sloganText[i], x, y + 50 * i);
				}
			},

			end: function()
			{
				IntroInProgress = false;
			},

			finished: function()
			{
				return 200 < this.time;
			},

			name: 'Slogan Animation'
		});
	return SloganAnim;
});