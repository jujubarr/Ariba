define(function(require){
    var AnimClass = require('animationClass');	
	return {
		CircleCoreSets: {},
		getCircleCore:  function(x, y, regionType)
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
				circleCore = new CircleAnim;
				CircleAnim.init(regionType, x + offset, y + offset);
				circleCoreSet.push(circleCore);
				animManager.enqueue(circleCore);
			}
			return circleCore;
		},		

		findCircleCore: function(circleCoreSet)
		{
			var MaxCircleCoreSetSize = 1;
			var PreferredCircleCount = 10;
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
		},
		
		CircleAnim: ring.create([AnimClass.AnimationClass], {
			draw: function()
			{
				var type = this.type;
				var color = AnimClass.RegionCenterToColor[type];
				var size = AnimClass.RegionCenterToSize[type] * this.time / 100;

				fill(color, 200);
				ellipse(this.x, this.y, size, size);

				if (100 > this.time) {
					this.time += 10;
				}
			},

			name: 'Circle Animation',

			time: 1,

			finished: function()
			{
				return false;
			},

			init: function(regionType, x, y)
			{
				var that = this;
				that.type = regionType;
				that.x = x;
				that.y = y;
			}
		})
	}
});