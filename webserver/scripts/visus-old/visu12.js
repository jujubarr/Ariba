//	Processing.js test sketch

var Queue = [];
var IntroInProgress = true;
var CurveSets = {};
var CircleCoreSets = {};
var BackgroundColor = 0xFF666666;
var SloganColor = 0xFFFFFFFF;
var RegionCenterToColor = {
    "FC" : 0xFF898185,
    "CC" : 0xFF898185
};
var RegionCenterToSize = {
    "FC" : 5,
    "CC" : 10
};
var CurrencyToColor = {
    "USD" : 0xFF73D62B,
    "EUR" : 0xFF1EBFFF,
    "OTHER" : 0xFFFFE521
};
var CurrencyDefaultColor = CurrencyToColor['OTHER'];
var CurveAlpha = 200;
var CurveSize = 3;
var CurvePointSize = 6;
var Debug = IsLocal;

function log (msg) {
    if (Debug) {
        console.log(msg);
    }
}
function initAnimationQueue ()
{
    var background = {
        draw : drawBackground,
        time : 0
    };
    var slogan = {
        text: ['WELCOME TO', 'THE NETWORKED ECONOMY', '', 'Willkommen', 'in der Netz-Wirtschaft'],
        x : 500,
        y : 100
    };
    var sloganEnter = {
        draw : drawSloganEnter,
        time : 0,
        slogan : slogan
    };
    var sloganExit = {
        draw : drawSloganExit,
        time : 0,
        slogan : slogan, 
        prev : sloganEnter
    };

    var mapCover = {
        draw : drawMapCover,
        end : function () { IntroInProgress = false },
        time : 0,
        prev : sloganExit
    };

    Queue.push(background);
    Queue.push(mapCover);
    Queue.push(sloganEnter);
    Queue.push(sloganExit);
}

function updateAnimationQueue () {
    var animObj = Queue.shift();
    var nextQueue = [];
    while (animObj) {
        if (animObj.time <= 100) {
            nextQueue.push(animObj);
        }
        else {
            if (animObj.end) {
                animObj.end();
            }
            animObj.ended = true;
        }

        animObj = Queue.shift();
    }
    Queue = nextQueue;
    if (IntroInProgress) {
        return;
    }
    var txn = transactions.shift();
    while (txn) {
        txn.time = 0;
        Queue.push(txn);

        var buyerX = txn.buyerX * width / 100;
        var buyerY = txn.buyerY * height / 100;
        var supplierX = buyerX;
        var supplierY = buyerY;
        if (txn.supplierX) {
            supplierX = txn.supplierX * width / 100;
        }
        if (txn.supplierY) {
            supplierY = txn.supplierY * height / 100;
        }
        txn.color = CurrencyDefaultColor;
        if (txn.currency) {
            var color = CurrencyToColor[txn.currency];
            if (color) {
                txn.color = color;
            }
        }
        var local = txn.local =
            buyerX == supplierX && buyerY == supplierY;
        
        txn.draw = drawCurvePoint;
        txn.end = endCurvePoint;
        getCircleCore(buyerX, buyerY, txn.buyerRegion);
        getCircleCore(supplierX, supplierY, txn.supplierRegion);
        var curve = getCurve(buyerX, buyerY, supplierX, supplierY, txn.color, local);
        var points = curve.points;
        if (points.length == 0) {
            txn.time = -1 * random(50,60);
        }
        else {
            txn.time = points[points.length - 1].time - random(5,10);
        }
        txn.curve = curve;
        curve.points.push(txn);
        log("add points to curve.id: " + curve.id);

        txn = transactions.shift();
    }
    // console.log("queue length:" + Queue.length);
}

var MaxCurveSetSize = 5;
var PreferredCurvePointCount = 1;
var CurveId = 0;

function getCurve (buyerX, buyerY, supplierX, supplierY, color, local)
{
    var curveSetId = buyerX + ":" + buyerY + "," + supplierX + ":" + supplierY + "," + local;
    var curveSet = CurveSets[curveSetId];
    var curveSetByColor;
    if (!curveSet) {
        curveSet = CurveSets[curveSetId] = [];
    }
    var curve = findCurve(curveSet, color);
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
        var curveEnter = {
            draw : drawCurveEnter,
            curve : curve,
            time : 0
        };
        var curveExit = {
            draw : drawCurveExit,
            end : endCurve,
            curve : curve,
            curveSet : curveSet,
            time : 0,
            prev : curveEnter
        };
        curveSet.push(curve);
        curve.id = CurveId++;
        log("add " + curveSet.length);
        Queue.push(curveEnter);
        Queue.push(curveExit);
    }
    return curve;
}

// Find the least busy curve
// Return null all curve at preferred count
function findCurve (curveSet, color)
{
    // disable curve reuse for now
    return null;
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
            console.log("curve.id " + curve.id + ", curve.stage + " + curve.stage + ", curve.points.length: " + curve.points.length);
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
        circleCore = { draw : drawCircleCore,
                       time : 0,
                       circles : [],
                       type : regionType,
                       x : x + offset,
                       y : y + offset
                     };
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

void setup() 
{
    width = 1000;
    height = 489;

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
    initAnimationQueue();
}

void draw() 
{
    updateAnimationQueue();
    $.each(Queue, function (i, animObj) {
        noFill();
        noStroke();        
        animObj.draw();
	});
}

function drawBackground ()
{
    background(BackgroundColor);
    image(mapBackground, 0, 0);
    image(logo, 0,445);
}

function drawSloganEnter ()
{
    var slogan = this.slogan;
    var x = (slogan.x - 100) + 100 * this.time / 100;
    var y = slogan.y;
    var alpha = 256 * this.time / 100;
    fill(SloganColor, alpha);
    var sloganText = slogan.text;
    for (var i = 0; i < sloganText.length; i++) {
        text(sloganText[i], x, y + 50 * i);
    }
    this.time += 1;
}

function drawSloganExit ()
{
    if (this.prev.time >= 100) {
        var slogan = this.slogan;
        var x = slogan.x;
        var y = slogan.y;
        var alpha = 256 * (100 - this.time) / 100;
        log(alpha);
        fill(SloganColor, alpha);
        var sloganText = slogan.text;
        for (var i = 0; i < sloganText.length; i++) {
            text(sloganText[i], x, y + 50 * i);
        }
        this.time += 0.7;
    }
}

function drawMapCover ()
{
    var alpha = 256;
    if (this.prev.time >= 100) {
        alpha = 256 * (100 - this.time) / 100;
        this.time += 2;
    }
    fill(BackgroundColor, alpha);
    rect(0, 0, width, height);
}

function drawCurveEnter ()
{
    strokeWeight(CurveSize);
    strokeCap(ROUND);
    var curve = this.curve;
    log("draw curve id: " + curve.id + ", time: " + this.time);
    if (this.time < 50) {
        log("in progress curve: " + this.time);
        stroke(curve.color, curve.alpha);
        subBezier(curve, this.time/50);
        this.time += 1;
    }
    else if (this.time <= 100) {
        stroke(curve.color, curve.alpha);
        bezier(curve.buyerX, curve.buyerY,
               curve.buyerCX, curve.buyerCY,
               curve.supplierCX, curve.supplierCY,
               curve.supplierX, curve.supplierY);
        this.time += .1;
    }
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

function subBezier (curve, t)
{
    // de Casteljau's algorithm
    var buyerX = curve.buyerX;
    var buyerY = curve.buyerY;

    // 4 to 3 points
    var xPoints =
        reducePoints([buyerX, curve.buyerCX, curve.supplierCX, curve.supplierX], t);
    var yPoints =
        reducePoints([buyerY, curve.buyerCY, curve.supplierCY, curve.supplierY], t);
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

function drawCurveExit ()
{
    if (this.prev.ended) {
        var curve = this.curve;
        var alpha = curve.alpha;
        if (curve.points.length == 0) {
            if (!curve.stage) {
                curve.stage = 'exiting';
                log("curve exiting: " + curve.id);
            }
            alpha = alpha * (1 - this.time / 100);
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
    }
}

function endCurve ()
{
    var curveSet = this.curveSet;
    var curve = this.curve;
    for (var i = 0; i < curveSet.length; i++) {
        if (curveSet[i] === curve) {
            curveSet.splice(i, 1);
            log("remove curve.id: " + curve.id + ", curve.points.length: " + curve.points.length);
            break;
        }
    }
}

function drawCurvePoint ()
{
    var curve = this.curve;
    if (this.time >= 0 && this.time <= 100) {
        var x = bezierPoint(curve.buyerX, curve.buyerCX, curve.supplierCX, curve.supplierX, this.time/100);
        var y = bezierPoint(curve.buyerY, curve.buyerCY, curve.supplierCY, curve.supplierY, this.time/100);
        fill(this.color, 150);
        ellipse(x, y, CurvePointSize, CurvePointSize);
    }
    this.time += 2;
}

function endCurvePoint ()
{
    log("removing points from curve.id: " + this.curve.id);
    this.curve.points.shift();
}

function drawCircleCore ()
{
    var type = this.type;
    var color = RegionCenterToColor[type];
    fill(color, 200);
    var size = RegionCenterToSize[type] * this.time / 100;
    ellipse(this.x, this.y, size, size);
    if (this.time < 100) {
        this.time += 10;
    }
}
