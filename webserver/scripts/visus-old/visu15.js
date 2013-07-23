if (UrlConfig.show_color_picker) {
    var width = false;
    $('#color_picker_holder').ColorPicker({
        flat: true,
        color: "#" + hex(BackgroundColor).substring(2),
        onChange: function(hsb, hex, rgb) {
            $('#color_selector div').css('backgroundColor', "#" + hex);
        },
        onSubmit: function(hsb, hex, rgb) {
            BackgroundColor = unhex("FF" + hex);
            background(BackgroundColor);
            $('html,body').css('backgroundColor', "#" + hex);
        }
    }).parent().css('display', 'block');
    $('#color_selector').bind('click', function() {
        $('#color_picker_holder').stop().animate(
            {height: width ? 0 : 176}, 500);
        width = !width;
    }).find('div').css('backgroundColor', "#" +
        hex(BackgroundColor).substring(2));
}

// necessary to enable inhertiance
function inherit(C, P, p) {
    var F = function () {};
    F.prototype = P.prototype;
    C.prototype = new F();
    C.uber = P.prototype;
    C.prototype.constructor = C;

    if (p) {
        $.extend(C.prototype, p);
    }

    return C;
}

var DEFAULT_ANIMATION_LENGTH =
    UrlConfig.animLength || UrlConfig.show24 ? 10 : 100;
var PERIOD_FOR_24_HOURS = UrlConfig.period || 10 * 60 * 1000; // 10 minutes
var DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

// Class used for managing animations, subclasses must define draw function
function AnimationClass () {}
AnimationClass.prototype = {
    data     : null,  // optional data
    draw     : null,  // required, the function to render this animation
    end      : null,  // optional function to call, when animation is finished
    finished : function() {
        return DEFAULT_ANIMATION_LENGTH < this.time;
    },  // optional function to indicate when to stop
    name     : null,  // the name of the animation, useful for debugging
    reset: function() {
        this.time = 0;
    },
    start    : null,  // optional function to call, before animation begins
    time     : 0      // required, the time counter
};


// Colors
color BackgroundColor = 0xFF666666;
color SloganColor = 0xFFFFFFFF;
color WarningColor = color(224, 224, 224, 192);
color FutureColor = 0xFFCCCCCC;
var RegionCenterToColor = {
    "FC" : 0xFF898185,
    "CC" : 0xFF898185
};
var CurrencyToColor = {
    "USD" : 0xFF73D62B,
    "EUR" : 0xFF1EBFFF,
    "OTHER" : 0xFFFFE521
};
color CurrencyDefaultColor = CurrencyToColor['OTHER'];
color CurrencyColorSmall = 0xFFD62B73;
color CurrencyColorMedium = 0xFF73D62B;
color CurrencyColorLarge = 0xFFD6732B;

// Other Variables
var Queue = [];
function enqueue(cls) {
    var o = new cls();
    Queue.push(o);
    return o;
}
var IntroInProgress = true;
var CurveSets = {};
var CircleCoreSets = {};
var RegionCenterToSize = {
    "FC" : 5,
    "CC" : 10
};
var CurveAlpha = 200;
var CurveSize = 2;
var CurvePointSizeSmall = 4;
var CurvePointSizeMedium = 6;
var CurvePointSizeLarge = 8;
var Debug = UrlConfig.debug;
var warningAnimInst;

// States
var StateIndex = 0;
var STATE_NO_FUTURE = 'NoFuture';
var STATE_PROJECTED_FUTURE =   'Projected Future Activity';
var STATE_ANTICIPATED_FUTURE = 'Anticipated Future Activity';
var State = [STATE_NO_FUTURE, STATE_PROJECTED_FUTURE, STATE_ANTICIPATED_FUTURE];

$(document).keypress(function(e) {
    e.preventDefault();

    if (32 === e.keyCode) {
        if (e.shiftKey) {
            StateIndex -= 1;
        }
        else {
            StateIndex += 1;
        }

        if (StateIndex >= State.length) {
            StateIndex = 0;
        }

        if (StateIndex < 0) {
            StateIndex = State.length - 1;
        }

        if (0 < StateIndex && warningAnimInst) {
            warningAnimInst.reset();
        }
    }
});

// Animations
var BackgroundAnim = inherit(function() {}, AnimationClass, {
    draw: function() {
        background(BackgroundColor);
        image(mapBackground, 0, 0);
        image(logo, 0,445);
    },

    finished: function() {
        return false;
    },

    name: 'Background Animation'
});
var CircleAnim = inherit(function(regionType, x, y) {
    this.type = regionType;
    this.x    = x;
    this.y    = y;
}, AnimationClass, {
    draw: function() {
        var type  = this.type;
        var color = RegionCenterToColor[type];
        var size  = RegionCenterToSize[type] * this.time / 100;

        fill(color, 200);
        ellipse(this.x, this.y, size, size);
				
        if (100 > this.time) {
            this.time += 10;
        }
    },

    name: 'Circle Animation',

    time: 1,

    finished: function() {
        return false;
    }
});
var CurveAnim = inherit(function(curve, curveSet) {
    this.data = curve;
    this.curveSet = curveSet;
}, AnimationClass, {
    draw: function() {
        if (DEFAULT_ANIMATION_LENGTH >= this.time) {
            this.drawCurveEnter();			
        }
        else {
            this.drawCurveExit();
        }
		if (DEFAULT_ANIMATION_LENGTH*.5 <= this.time) {
            this.drawFlowers();
		}
    },

    drawCurveEnter: function() {
        strokeWeight(CurveSize);
        strokeCap(ROUND);
        var curve = this.data;
        log("draw curve id: " + curve.id + ", time: " + this.time);

        if (DEFAULT_ANIMATION_LENGTH / 2 > this.time) {
            log("in progress curve: " + this.time);
            stroke(curve.color, curve.alpha);
            subBezier(curve, this.time / (DEFAULT_ANIMATION_LENGTH / 2));
            this.time += 1;
        }
        else if (DEFAULT_ANIMATION_LENGTH >= this.time) {
            stroke(curve.color, curve.alpha);
            bezier(curve.buyerX, curve.buyerY,
                   curve.buyerCX, curve.buyerCY,
                   curve.supplierCX, curve.supplierCY,
                   curve.supplierX, curve.supplierY);
            this.time += 1;
        }
    },

    drawCurveExit: function() {
        var curve  = this.data;
        var alpha  = curve.alpha;

        if (0 === curve.points.length) {
            if (!curve.stage) {
                curve.stage = 'exiting';
                log("curve exiting: " + curve.id);
            }
            alpha = alpha * .9*(1 - (this.time - DEFAULT_ANIMATION_LENGTH) / DEFAULT_ANIMATION_LENGTH);
            this.time += 1;
        }
        else {
            log("called drawCurveExit id: " + curve.id + ", curve.points.length: " + curve.points.length);
        }

        strokeWeight(CurveSize);
        strokeCap(ROUND);
        stroke(curve.color, alpha);
        bezier(curve.buyerX, curve.buyerY,
               curve.buyerCX, curve.buyerCY,
               curve.supplierCX, curve.supplierCY,
               curve.supplierX, curve.supplierY);
	},
	drawFlowers: function() {
		var curve  = this.data;
        var alpha  = curve.alpha;

        if (0 === curve.points.length) {
            alpha = alpha * (1 - 1.5*(this.time - DEFAULT_ANIMATION_LENGTH) / DEFAULT_ANIMATION_LENGTH);
            this.time += 1;
        }        
		
		//draw floral pattern		
				translate(curve.supplierX, curve.supplierY);
				strokeWeight(.1);
				rotate(radians(2*frameCount));
				fill(252, 163, 225, .5*alpha); //pink
				for (int i = 0; i < 5; i++) {		
				ellipse(0, -8, 7, 10);
				rotate(radians(72));
				}		
				// centre circle
				fill(#fff9bb, .5*alpha); // light yellow
				ellipse(0, 0,7,7);	
				resetMatrix();  		
    },
	
    end: function() {
        var curveSet = this.curveSet;
        var curve    = this.data;

        for (var i = 0; i < curveSet.length; i++) {
            if (curveSet[i] === curve) {
                curveSet.splice(i, 1);
                log("remove curve.id: " + curve.id + ", curve.points.length: " + curve.points.length);
                break;
            }
        }
    },

    finished: function() {
        return 2 * DEFAULT_ANIMATION_LENGTH < this.time;
    },

    name: 'Curve Animation'
});
var SloganAnim = inherit(function() {}, AnimationClass, {					//Do something fun with this later
    data: {
        text: ['WELCOME TO THE NETWORKED ECONOMY', '~SHOWERED WITH FLOWERS~', '',
        //'Willkommen', 'in der Netz-Wirtschaft'],
		'PEACE ON EARTH HAS', 'NEVER BEEN SO BEAUTIFUL'],
        x : 500,
        y : 100
    },

    draw: function() {
        var alpha       = 256;
        var slogan      = this.data;
        var sloganText  = slogan.text;
        var x           = null;
        var y           = slogan.y;

        // for the first 100 iterations, adjust the alpha of the
        // background color
        if (100 <= this.time) {
            alpha = alpha * (200 - this.time) / 100;
        }

        // repaint the whole background
        fill(BackgroundColor, alpha);
        rect(0, 0, width, height);

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
    drawSlogan: function (x, y, alpha, sloganText) {
        log(alpha);
        fill(SloganColor, alpha);
        for (var i = 0; i < sloganText.length; i++) {
            text(sloganText[i], x, y + 50 * i);
        }
    },

    end: function () {
        IntroInProgress = false;
    },

    finished: function() {
        return 200 < this.time;
    },

    name: 'Slogan Animation'
});
var TimerAnim = inherit(function() {}, AnimationClass, {
    draw: function() {
        var iNow = (new Date()).getTime(),
            aText = [];

        if (!this.iEndTime || iNow > this.iEndTime) {
            this.iDisplayTime = new Date();
            this.iStartTime = this.iDisplayTime.getTime();
            this.iEndTime = iNow + PERIOD_FOR_24_HOURS;

            // set to midnight
            this.iDisplayTime.setHours(0);
            this.iDisplayTime.setMinutes(0);
            this.iDisplayTime.setSeconds(1);
            this.iDisplayTime.setMilliseconds(0);
        }

        // only update the time every 5 frames
        if (!(this.time % 5)) {
            // calculate change in display time
            var iMillisSinceMidnight = DAY_IN_MILLIS * (iNow - this.iStartTime)
                / PERIOD_FOR_24_HOURS;
            UpdateStartEndMsStack(iMillisSinceMidnight);
            this.iDisplayTime.setHours(iMillisSinceMidnight / 3600000);
            this.iDisplayTime.setMinutes(iMillisSinceMidnight / 60000);
            this.iDisplayTime.setSeconds(iMillisSinceMidnight / 6000);
            this.iDisplayTime.setMilliseconds(iMillisSinceMidnight % 1000);
        }

        fill(WarningColor, 256);

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

        text(aText.join(""), 100, 30);
        this.time += 1;
    },

    finished: function() {
        return false;
    },

    name: '24 Hour Timer Animation'
});
var TransactionAnim = inherit(function(txn) { //draws the points at the end of a curve
    this.data = txn;
}, AnimationClass, {
    draw: function() {
        var curve           = this.data.curve;
        var curvePointSize  = this.getPointSize();

        if (this.time >= 0 && this.time <= DEFAULT_ANIMATION_LENGTH) {
            var x = bezierPoint(
                    curve.buyerX, curve.buyerCX, curve.supplierCX,
                    curve.supplierX, this.time / DEFAULT_ANIMATION_LENGTH);
            var y = bezierPoint(
                    curve.buyerY, curve.buyerCY, curve.supplierCY,
                    curve.supplierY, this.time / DEFAULT_ANIMATION_LENGTH);
            fill(this.data.color, 150);
            
			if(this.data.color == CurrencyToColor['USD']){
				//textFont("Oswald-Bold", curvePointSize*2);
				textFont("Oswald-Bold", curvePointSize*2.5);
				text("$", x, y+(curvePointSize));
			}
			else if (this.data.color == CurrencyToColor['EUR']){
				ellipse(x, y, curvePointSize, curvePointSize);
			}
			else
			{
				textFont("Oswald", curvePointSize*2.5);
				text("€", x, y+(curvePointSize));				
			}
        }

        this.time += 2;
    },

    getPointSize: function() {
        var amount = this.data.amount;

        if (amount) {
            if (1000 > amount) {
                return CurvePointSizeSmall;
            }
            else if (1000000 > amount) {
                return CurvePointSizeLarge;
            }
        }

        return CurvePointSizeMedium;
    },

    end: function() {
        log("removing points from curve.id: " + this.data.curve.id);
        this.data.curve.points.shift();
    },

    name: 'Transaction Animation'
});
var WarningAnim = inherit(function() {}, AnimationClass, {
    draw: function() {
        var alpha = 256,
            x = 775;

        // for the first 100 iterations, adjust the alpha of the
        // background color
        if (100 > this.time && 1 == StateIndex) {
            alpha = 256 * this.time / 100;
            x = (775 - 250) + 250 * this.time / 100;
        }

        if (0 < StateIndex) {
            fill(WarningColor, alpha);
            text('Projected Commerce', x, 40);
            this.time += 1;
        }
    },

    finished: function() {
        return false;
    },

    name: 'Warning Animation'
});

// print something to the console, when in debug mode
function log (msg) {
    if (Debug) {
        console.log(msg);
    }
}

// dequeue
function updateAnimationQueue () {
    var animObj = Queue.shift();
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

        animObj = Queue.shift();
    }
    Queue = nextQueue;

    if (IntroInProgress) {
        return;
    }

    var txn = transactions.shift();
    while (txn) {
        // don't show future transactions right now
        if (!txn.future || STATE_NO_FUTURE !== State[StateIndex]) {
            txn.time = 0;
            Queue.push(new TransactionAnim(txn));

            var buyerX = txn.buyerX * width / 100;
            var buyerY = txn.buyerY * height / 100;
            var supplierX = buyerX;
            var supplierY = buyerY;
//            txn.amount = getRandomInt(1, 1250000);

            if (txn.supplierX) {
                supplierX = txn.supplierX * width / 100;
            }

            if (txn.supplierY) {
                supplierY = txn.supplierY * height / 100;
            }

            if (UrlConfig.amount_color) {
                txn.color = CurrencyColorMedium;

                if (txn.amount) {
                    if (100000 > txn.amount) {
                        txn.color = CurrencyColorSmall;
                    }
                    else if (1000000 > txn.amount) {
                        txn.color = CurrencyColorLarge;
                    }
                }
            }
            else {
                txn.color = CurrencyDefaultColor;
                if (txn.currency) {
                    var color = CurrencyToColor[txn.currency];
                    if (color) {
                        txn.color = color;
                    }
                }
            }

            if (txn.future &&
                    STATE_PROJECTED_FUTURE === State[StateIndex]) {
                txn.color = FutureColor;
            }

            var local = txn.local =
                buyerX == supplierX && buyerY == supplierY;

            getCircleCore(buyerX, buyerY, txn.buyerRegion);
            getCircleCore(supplierX, supplierY, txn.supplierRegion);
            var curve = getCurve(
                    buyerX, buyerY, supplierX, supplierY, txn.color, local);
            var points = curve.points;
            if (points.length == 0) {
                txn.time = -20;
            }
            else {
                txn.time = points[points.length - 1].time - random(5,10);
            }
            txn.curve = curve;
            curve.points.push(txn);
            log("add points to curve.id: " + curve.id);
        }

        txn = transactions.shift();
    }
    // log("queue length:" + Queue.length);
}

var MaxCurveSetSize = 5;
var PreferredCurvePointCount = 1;
var CurveId = 0;

function getCurve (buyerX, buyerY, supplierX, supplierY, color, local)
{
    var curveSetId = buyerX + ":" + buyerY + "," + supplierX + ":" +
            supplierY + "," + local;
    var curveSet = CurveSets[curveSetId];
    var curveSetByColor;
    if (!curveSet) {
        curveSet = CurveSets[curveSetId] = [];
    }
    var curve = findCurve(curveSet, color);
//    var curve;
    if (!curve) {
        curve = { color : color,
                  local : local,
                  points : [],
                  alpha : CurveAlpha,
                  buyerX : buyerX,
                  buyerY : buyerY,
                  supplierX : supplierX,
                  supplierY : supplierY
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
            var direction = buyerX - supplierX < 0 ? 1 : - 1;
            log("direction: " + direction);
            var distance = Math.abs(buyerX - supplierX);
            log("distance: " + distance);
            var curveHeight = distance / 3 + curveSet.length * direction * 7;
            log("curveHeight: " + curveHeight);
            curve.buyerCX = buyerX + direction * 0;
            curve.buyerCY = buyerY - direction * curveHeight;
            curve.supplierCX = supplierX - direction * 0;
            curve.supplierCY = supplierY - direction * curveHeight;

        }
        curveSet.push(curve);
        curve.id = CurveId++;
        log("add " + curveSet.length);
        Queue.push(new CurveAnim(curve, curveSet));
    }
    return curve;
}

// Find the least busy curve
// Return null all curve at preferred count
function findCurve (curveSet, color)
{
    var len = curveSet.length;
    if (len == 0) {
        return null;
    }
    var minCurve = null;
    var lengthByColor = 0;
    for (var i = 0; i < curveSet.length; i++) {
        var curve = curveSet[i];
        if (curve.color == color) {
            lengthByColor++;
            if (curve.stage != 'exiting') {
                if (minCurve == null ||
                    curve.points.length < minCurve.points.length) {
                    minCurve = curve;
                }
            }
        }
    }
    if (minCurve == null) {
        log("minCurve == null");
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

function logCurveSet (curveSet)
{
    if (Debug) {
        console.log("** logCurveSet");
        for (var i = 0; i < curveSet.length; i++) {
            var curve = curveSet[i];
            console.log("curve.id " + curve.id + ", curve.stage + " +
                curve.stage + ", curve.points.length: " +
                curve.points.length);
        }
        console.log("logCurveSet **");
    }
}

function getCircleCore (x, y, regionType)
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
        Queue.push(circleCore);
    }
    return circleCore;
}

var MaxCircleCoreSetSize = 1;
var PreferredCircleCount = 10;

function findCircleCore (circleCoreSet)
{
    var len = circleCoreSet.length;
    if (len == 0) {
        return null;
    }
    var minCircleCore = circleCoreSet[0];
    for (var i = 1; i < circleCoreSet.length; i++) {
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

PImage mapBackground;
PImage logo;
PFont myFont;

// called automatically by processing, initialization
void setup()
{
//    width = 1000;
//    height = 489;
    width = 1250;
    height = 611;

    // @pjs preload must be used to preload the image
    /* @pjs preload="img/continents.png"; */
    /* @pjs preload="img/logo.png"; */
	mapBackground = loadImage("img/continents.png");
    mapBackground.resize(width, height);
    logo = loadImage("img/logo.png");
    myFont = createFont("Oswald", 38, true);
    textFont(myFont);
    textAlign(CENTER);
    background(BackgroundColor);

    // start the Queue
    enqueue(BackgroundAnim);
    warningAnimInst = enqueue(WarningAnim);

    if (UrlConfig.show24) {
        enqueue(TimerAnim);
    }

    if (!UrlConfig.no_slogan) {
        enqueue(SloganAnim);
    }
    else {
        IntroInProgress = false;
    }
}

// called automatically by processing continuing the animation
void draw()
{
    updateAnimationQueue();
    $.each(Queue, function (i, animObj) {
        noFill();
        noStroke();
        animObj.draw();
	});
}

function tPoint (x1, x2, t)
{
    return (x2 - x1) * t + x1;
}

function reducePoints (points, t)
{
    var reducedPoints = [];
    for (var i = 0; i < points.length - 1; i++) {
        reducedPoints.push(tPoint(points[i], points[i+1], t));
    }
    return reducedPoints;
}


//for drawing the bezier curve based on the time ex: C -> O
function subBezier (curve, t)
{
    // de Casteljau's algorithm
    var buyerX = curve.buyerX;
    var buyerY = curve.buyerY;

    // 4 to 3 points
    var xPoints =
        reducePoints(
            [buyerX, curve.buyerCX, curve.supplierCX, curve.supplierX], t);
    var yPoints =
        reducePoints(
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

    bezier(curve.buyerX, curve.buyerY, c1X, c1Y, c2X, c2Y, subX, subY);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawDollar()
{}

function drawEuro()
{}
