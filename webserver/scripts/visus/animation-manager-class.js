define(function(require)
{
	var Processing = require('processingCanvas');
    var Background = require('background');
    var Timer = require('twentyfourtimer');
    var Slogan = require('slogan');
	var AnimClass = require('animationClass');	
	//var Variables = require('variables');
	
	
		var AnimationManager = ring.create({
			callback: null, // required: callback function for updateAnimationQueue

			queue: [],

			getQueue: function()
			{
				return this.queue;
			},

			enqueue: function(o)
			{
				this.queue.push(o);
				return o;
			},

			/**
			 * This function updates the animation queue, it first checks if there are
			 * any animations that are still in the queue, Then it will call the
			 * callback function passed in. The callback function should be implemented
			 * to push animations into the queue, i.e, transaction animations.
			 *
			 * @params callback: called at the end, primarily to push animations into
			 *         the queue.
			 */
			updateAnimationQueue: function(callback)
			{
				var that = this;
				var animObj = this.queue.shift();
				var nextQueue = [];

				while (animObj) {
					// has the animation not started yet
					if (!animObj.started) {
						// if the start function exists, call it
						if (animObj.start) {
							animObj.start();
						}

						// mark animation as started
						animObj.started = true;
					}

					// is the animation finished
					if (animObj.finished()) {
						// if the end function exists, call it
						if (animObj.end) {
							animObj.end();
						}

						// mark animation as ended
						animObj.ended = true;
					}
					// if not finished enequeue the animation
					else {
						nextQueue.push(animObj);
					}

					animObj = this.queue.shift();
				}
				this.queue = nextQueue;

				if (IntroInProgress) {
					return;
				}

				that.callback();

				// log("queue length:" + queue.length);
			},

			setup: function()
			{
				var that = this;
				Processing.width = width;
				Processing.height = height;

				// @pjs preload must be used to preload the image
				/* @pjs preload="img/continents.png"; */
				/* @pjs preload="img/logo.png"; */
				AnimClass.mapBackground = Processing.loadImage("img/continents.png");
				AnimClass.mapBackground.resize(Processing.width, Processing.height);
				AnimClass.logo = Processing.loadImage("img/logo.png");
				AnimClass.myFont = Processing.createFont("Oswald", 38, true);
				Processing.textFont(AnimClass.myFont);
				Processing.textAlign(Processing.CENTER);
				Processing.background(AnimClass.BackgroundColor);

				// start the Queue
				that.enqueue(new Background);

				if (UrlConfig.show24) {
					that.enqueue(new Timer);
				}

				if (!UrlConfig.no_slogan) {
					that.enqueue(new Slogan);
				}
				else {
					IntroInProgress = false;
				}
			},

			draw: function()
			{
				var that = this;
				that.updateAnimationQueue();
				var data = this.getQueue();
				$.each(data, function(i, animObj)
				{
					Processing.noFill();
					Processing.noStroke();
					animObj.draw();
				});
			},

			init: function(callback)
			{
				var that = this;
				that.callback = callback;
			}
		})
	return AnimationManager;
});
