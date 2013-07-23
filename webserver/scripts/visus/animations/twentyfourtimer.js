define(function(require) {
    //Require.js definitions
    var AnimClass = require('animationClass');
	var Processing = require('processingCanvas');
		var TimerAnim = ring.create([AnimClass.AnimationClass], {
			draw: function()
			{
				var iNow = (new Date()).getTime(), aText = [];

				if (!this.iEndTime || iNow > this.iEndTime) {
					this.iDisplayTime = new Date();
					this.iStartTime = this.iDisplayTime.getTime();
					this.iEndTime = iNow + AnimClass.PERIOD_FOR_24_HOURS;

					// set to midnight
					this.iDisplayTime.setHours(0);
					this.iDisplayTime.setMinutes(0);
					this.iDisplayTime.setSeconds(1);
					this.iDisplayTime.setMilliseconds(0);
				}

				// only update the time every 5 frames
				if (!(this.time % 5)) {
					// calculate change in display time
					var iMillisSinceMidnight = AnimClass.DAY_IN_MILLIS * (iNow - this.iStartTime)
									/ AnimClass.PERIOD_FOR_24_HOURS;
					UpdateStartEndMsStack(iMillisSinceMidnight);
					this.iDisplayTime.setHours(iMillisSinceMidnight / 3600000);
					this.iDisplayTime.setMinutes(iMillisSinceMidnight / 60000);
					this.iDisplayTime.setSeconds(iMillisSinceMidnight / 6000);
					this.iDisplayTime.setMilliseconds(iMillisSinceMidnight % 1000);
				}

				Processing.fill(AnimClass.WarningColor, 256);

				if (10 > this.iDisplayTime.getHours()) {
					aText.push("0");
				}

				aText.push(this.iDisplayTime.getHours());
				aText.push(":");

				if (10 > this.iDisplayTime.getMinutes()) {
					aText.push("0");
				}

				aText.push(this.iDisplayTime.getMinutes());
				aText.push(":");

				if (10 > this.iDisplayTime.getSeconds()) {
					aText.push("0");
				}

				aText.push(this.iDisplayTime.getSeconds());

				Processing.text(aText.join(""), 100, 50);
				this.time += 1;
			},

			finished: function()
			{
				return false;
			},

			name: '24 Hour Timer Animation',
		});
	return TimerAnim;
});