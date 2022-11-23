/**
 * Wind map code (c) 2012
 * Fernanda Viegas & Martin Wattenberg
 */

/**
 * Simple representation of 2D vector.
 */

var showMask=false;
var display;
d3.selectAll('.form-control').on('change',update_canvas);
// update_canvas();
var Vector = function(x, y) {
    this.x = x;
    this.y = y;
}


Vector.polar = function(r, theta) {
    return new Vector(r * Math.cos(theta), r * Math.sin(theta));
};


Vector.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};


Vector.prototype.copy = function(){
    return new Vector(this.x, this.y);
};


Vector.prototype.setLength = function(length) {
    var current = this.length();
    if (current) {
        var scale = length / current;
        this.x *= scale;
        this.y *= scale;
    }
    return this;
};


Vector.prototype.setAngle = function(theta) {
    var r = length();
    this.x = r * Math.cos(theta);
    this.y = r * Math.sin(theta);
    return this;
};


Vector.prototype.getAngle = function() {
    return Math.atan2(this.y, this.x);
};


Vector.prototype.d = function(v) {
    var dx = v.x - this.x;
    var dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};/**
 * Identity projection.
 */
var IDProjection = {
        project: function(x, y, opt_v) {
            var v = opt_v || new Vector();
            v.x = x;
            v.y = y;
            return v;
        },
        invert: function(x, y, opt_v) {
            var v = opt_v || new Vector();
            v.x = x;
            v.y = y;
            return v;
        }
    };

/**
 * Albers equal-area projection.
 * Constant param values after d3 (Bostock, Carden).
 */
var Albers = function() {
    function radians(degrees) {
        return Math.PI * degrees / 180;
    }

    var phi1 = radians(29.5);
    var phi2 = radians(45.5);
    var n = .5 * (phi1 + phi2);
    var C = Math.cos(phi1) * Math.cos(phi1) + 2 * n * Math.sin(phi1);
    var phi0 = radians(38);
    var lambda0 = radians(+110);
    var rho0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n;

    return {
        project: function(lon, lat, opt_result) {
            lon = radians(lon);
            lat = radians(lat);
            var theta = n * (lon - lambda0);
            var rho = Math.sqrt(C - 2 * n * Math.sin(lat)) / n;
            var x = rho * Math.sin(theta);
            var y = rho0 - rho * Math.cos(theta);
            if (opt_result) {
                opt_result.x = x;
                opt_result.y = y;
                return opt_result;
            }
            return new Vector(x, y);
        },
        invert: function(x, y) {
            var rho2 = x * x + (rho0 - y) * (rho0 - y);
            var theta = Math.atan(x / (rho0 - y));
            var lon = lambda0 + theta / n;
            var lat = Math.asin((C / n - rho2 * n) / 2);
            return new Vector(lon * 180 / Math.PI, lat * 180 / Math.PI);
        }
    };
}();


var ScaledAlbers = function(scale, offsetX, offsetY, longMin, latMin) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.longMin = longMin;
    this.latMin = latMin;
    this.swCorner = Albers.project(longMin, latMin);
};

ScaledAlbers.temp = new Vector(0, 0);

ScaledAlbers.prototype.project = function(lon, lat, opt_result) {
    var proj = Albers.project(lon, lat, ScaledAlbers.temp);
    var a = proj.x;
    var b = proj.y;
    var x = this.scale * (a - this.swCorner.x) + this.offsetX;
    var y = -this.scale * (b - this.swCorner.y) + this.offsetY;
    if (opt_result) {
        opt_result.x = x;
        opt_result.y = y;
        return opt_result;
    }
    return new Vector(x, y);
};

ScaledAlbers.prototype.invert = function(x, y) {
    var a = (x - this.offsetX) / this.scale + this.swCorner.x;
    var b = (y - this.offsetY) / -this.scale + this.swCorner.y;
    return Albers.invert(a, b);
};

/**
 * Represents a vector field based on an array of data,
 * with specified grid coordinates, using bilinear interpolation
 * for values that don't lie on grid points.
 */

/**
 *
 * @param field 2D array of Vectors
 *
 * next params are corners of region.
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 */
var VectorField = function(field, x0, y0, x1, y1) {
    this.x0 = x0;
    this.x1 = x1;
    this.y0 = y0;
    this.y1 = y1;
    this.field = field;
    this.w = field.length;
    this.h = field[0].length;
    this.maxLength = 0;
    for (var i = 0; i < this.w; i++) {
        for (var j = 0; j < this.h; j++) {

            this.maxLength = Math.max(this.maxLength, field[i][j].length());
        }
    }
};

/**
 * Reads data from raw object in form:
 * {
 *   x0: -126.292942,
 *   y0: 23.525552,
 *   x1: -66.922962,
 *   y1: 49.397231,
 *   gridWidth: 501.0,
 *   gridHeight: 219.0,
 *   field: [
 *     0,0,
 *     0,0,
 *     ... (list of vectors)
 *   ]
 * }
 *
 * If the correctForSphere flag is set, we correct for the
 * distortions introduced by an equirectangular projection.
 */
VectorField.read = function(data, correctForSphere) {
    field = [];
    var w = data.gridWidth; //width
    var h = data.gridHeight; //height
    var n = 2 * w * h; //2*area
    var i = 0;
    // OK, "total" and "weight"
    // are kludges that you should totally ignore,
    // unless you are interested in the average
    // vector length on vector field over lat/lon domain.
    var total = 0;
    var weight = 0;
    for (var x = 0; x < w; x++) {
        field[x] = [];
        for (var y = 0; y < h; y++) {
            //reads in x/y data for each point, left->right, top->bottom
            var vx = data.field[i++];
            var vy = data.field[i++];
            var v = new Vector(vx, vy);
            // Uncomment to test a constant field:
            // v = new Vector(10, 0);
            if (correctForSphere) {
                var ux = x / (w - 1);
                var uy = y / (h - 1);
                var lon = data.x0 * (1 - ux) + data.x1 * ux;
                var lat = data.y0 * (1 - uy) + data.y1 * uy;
                var m = Math.PI * lat / 180;
                var length = v.length();
                if (length) {
                    total += length * m;
                    weight += m;
                }
                v.x /= Math.cos(m);
                v.setLength(length);
            }
            field[x][y] = v;
        }
    }
    var result = new VectorField(field, data.x0, data.y0, data.x1, data.y1);
    //window.console.log('total = ' + total);
    //window.console.log('weight = ' + weight);
    if (total && weight) {

        result.averageLength = total / weight;
    }
    return result;
};

VectorField.prototype.inBounds = function(x, y) {
    return x >= this.x0 && x < this.x1 && y >= this.y0 && y < this.y1;
};


VectorField.prototype.bilinear = function(coord, a, b) {
    var na = Math.floor(a);
    var nb = Math.floor(b);
    var ma = Math.ceil(a);
    var mb = Math.ceil(b);
    var fa = a - na;
    var fb = b - nb;

    return this.field[na][nb][coord] * (1 - fa) * (1 - fb) +
        this.field[ma][nb][coord] * fa * (1 - fb) +
        this.field[na][mb][coord] * (1 - fa) * fb +
        this.field[ma][mb][coord] * fa * fb;
};


VectorField.prototype.getValue = function(x, y, opt_result) {
    var a = (this.w - 1 - 1e-6) * (x - this.x0) / (this.x1 - this.x0);
    var b = (this.h - 1 - 1e-6) * (y - this.y0) / (this.y1 - this.y0);
    var vx = this.bilinear('x', a, b);
    var vy = this.bilinear('y', a, b);
    if (opt_result) {
        opt_result.x = vx;
        opt_result.y = vy;
        return opt_result;
    }
    return new Vector(vx, vy);
};


VectorField.prototype.vectValue = function(vector) {
    return this.getValue(vector.x, vector.y);
};


VectorField.constant = function(dx, dy, x0, y0, x1, y1) {
    var field1 = new VectorField([[]], x0, y0, x1, y1);
    field1.maxLength = Math.sqrt(dx * dx + dy * dy);
    field1.getValue = function() {
        return new Vector(dx, dy);
    }
    return field1;
}
/**
 * Listens to mouse events on an element, tracks zooming and panning,
 * informs other components of what's going on.
 */
var Animator = function(element, opt_animFunc, opt_unzoomButton) {
    this.element = element;
    this.mouseIsDown = false;
    this.mouseX = -1;
    this.mouseY = -1;
    this.animating = true;
    this.state = 'animate';
    this.listeners = [];
    this.dx = 0;
    this.dy = 0;
    this.scale = 1;
    this.zoomProgress = 0;
    this.scaleTarget = 1;
    this.scaleStart = 1;
    this.animFunc = opt_animFunc;
    this.unzoomButton = opt_unzoomButton;

    if (element) {
        var self = this;
        $(element).mousedown(function(e){
            self.mouseX = e.pageX - this.offsetLeft;
            self.mouseY = e.pageY - this.offsetTop;
            self.mousedown();
        });
        $(element).mouseup(function(e){
            self.mouseX = e.pageX - this.offsetLeft;
            self.mouseY = e.pageY - this.offsetTop;
            self.mouseup();
        });
        $(element).mousemove(function(e){
            self.mouseX = e.pageX - this.offsetLeft;
            self.mouseY = e.pageY - this.offsetTop;
            self.mousemove();
        });
    }
};


Animator.prototype.mousedown = function() {
    this.state = 'mouse-down';
    this.notify('startMove');
    this.landingX = this.mouseX;
    this.landingY = this.mouseY;
    this.dxStart = this.dx;
    this.dyStart = this.dy;
    this.scaleStart = this.scale;
    this.mouseIsDown = true;
};


Animator.prototype.mousemove = function() {
    if (!this.mouseIsDown) {
        this.notify('hover');
        return;
    }
    var ddx = this.mouseX - this.landingX;
    var ddy = this.mouseY - this.landingY;
    var slip = Math.abs(ddx) + Math.abs(ddy);
    if (slip > 2 || this.state == 'pan') {
        this.state = 'pan';
        this.dx += ddx;
        this.dy += ddy;
        this.landingX = this.mouseX;
        this.landingY = this.mouseY;
        this.notify('move');
    }
}

Animator.prototype.mouseup = function() {
    this.mouseIsDown = false;
    if (this.state == 'pan') {
        this.state = 'animate';
        this.notify('endMove');
        return;
    }
    this.zoomClick(this.mouseX, this.mouseY);
};


Animator.prototype.add = function(listener) {
    this.listeners.push(listener);
};


Animator.prototype.notify = function(message) {
    if (this.unzoomButton) {
        var diff = Math.abs(this.scale - 1) > .001 ||
            Math.abs(this.dx) > .001 || Math.abs(this.dy > .001);
        this.unzoomButton.style.visibility = diff ? 'visible' : 'hidden';
    }
    if (this.animFunc && !this.animFunc()) {
        return;
    }
    for (var i = 0; i < this.listeners.length; i++) {
        var listener = this.listeners[i];
        if (listener[message]) {
            listener[message].call(listener, this);
        }
    }
};


Animator.prototype.unzoom = function() {
    this.zoom(0, 0, 1);
};

Animator.prototype.removeMask = function() {

    this.notify('remove');

};

Animator.prototype.zoomClick = function(x, y) {
    var z = 1.7;
    var scale = 1.7 * this.scale;
    var dx = x - z * (x - this.dx);
    var dy = y - z * (y - this.dy);
    this.zoom(dx, dy, scale);
};

Animator.prototype.zoom = function(dx, dy, scale) {
    this.state = 'zoom';
    this.zoomProgress = 0;
    this.scaleStart = this.scale;
    this.scaleTarget = scale;
    this.dxTarget = dx;
    this.dyTarget = dy;
    this.dxStart = this.dx;
    this.dyStart = this.dy;
    this.notify('startMove');
};

Animator.prototype.relativeZoom = function() {
    return this.scale / this.scaleStart;
};


Animator.prototype.relativeDx = function() {
    return this.dx - this.dxStart;
}

Animator.prototype.relativeDy = function() {
    return this.dy - this.dyStart;
}
var animate_stop = 0;
Animator.prototype.start = function(opt_millis) { //start animation
    var millis = opt_millis || 20;
    var self = this;
    function go() {
        var start = new Date();
        self.loop();
        if (animate_stop === 1) return false;
        var time = new Date() - start;
        setTimeout(go, Math.max(10, millis - time)); //execute every opt_milis seconds
        // return ;
    }
    go();
    // return false;
};


Animator.prototype.loop = function() {
    if (this.state == 'mouse-down' || this.state == 'pan') {
        return;
    }
    if (this.state == 'animate') {
        this.notify('animate');
        return;
    }
    if (this.state == 'zoom') {
        this.zoomProgress = Math.min(1, this.zoomProgress + .07);
        var u = (1 + Math.cos(Math.PI * this.zoomProgress)) / 2;
        function lerp(a, b) {
            return u * a + (1 - u) * b;
        }
        this.scale = lerp(this.scaleStart, this.scaleTarget);
        this.dx = lerp(this.dxStart, this.dxTarget);
        this.dy = lerp(this.dyStart, this.dyTarget);
        if (this.zoomProgress < 1) {
            this.notify('move');
        } else {
            this.state = 'animate';
            this.zoomCurrent = this.zoomTarget;
            this.notify('endMove');
        }
    }
};

/**
 * Displays a geographic vector field using moving particles.
 * Positions in the field are drawn onscreen using the Alber
 * "Projection" file.
 */

var Particle = function(x, y, age) {
    this.x = x;
    this.y = y;
    this.oldX = -1;
    this.oldY = -1;
    this.age = age;
    this.rnd = Math.random();
}


/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} scale The scale factor for the projection.
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {number} longMin
 * @param {number} latMin
 * @param {VectorField} field
 * @param {number} numParticles
 */
var MotionDisplay = function(canvas, imageCanvas, field, numParticles, opt_projection) {
    this.canvas = canvas;
    this.projection = opt_projection || IDProjection;
    this.field = field;
    this.numParticles = numParticles; //number of streaks
    this.first = true; //first run
    this.maxLength = field.maxLength; //max length of vector
    this.imageCanvas = imageCanvas;
    this.x0 = this.field.x0;  //corner coordinates
    this.x1 = this.field.x1;  //corner coordinates
    this.y0 = this.field.y0;  //corner coordinates
    this.y1 = this.field.y1;  //corner coordinates
    this.makeNewParticles(null, true); //randomly generate particles within map
    this.colors = [];
    this.rgb = '40, 40, 40'; //background color
    this.background = 'rgb(' + this.rgb + ')';
    this.backgroundAlpha = 'rgba(' + this.rgb + ', .02)';
    this.outsideColor = '#fff';
    for (var i = 0; i < 256; i++) {
        this.colors[i] = 'rgb(' + i + ',' + i + ',' + i + ')'; //grayscale colors
    }
    if (this.projection) {
        this.startOffsetX = this.projection.offsetX;
        this.startOffsetY = this.projection.offsetY;
        this.startScale = this.projection.scale;
    }
};


MotionDisplay.prototype.setAlpha = function(alpha) {
    this.backgroundAlpha = 'rgba(' + this.rgb + ', ' + alpha + ')';
};

MotionDisplay.prototype.makeNewParticles = function(animator) {
    this.particles = [];
    for (var i = 0; i < this.numParticles; i++) {
        this.particles.push(this.makeParticle(animator));
    }
};

//makes random particle within bounds of canvas
MotionDisplay.prototype.makeParticle = function(animator) {
    var dx = animator ? animator.dx : 0; //speed?
    var dy = animator ? animator.dy : 0; //speed?
    var scale = animator ? animator.scale : 1; //scale of orig graph
    for (;;) { //infinite loop
        var a = Math.random(); //0-1
        var b = Math.random(); //0-1
        var x = a * this.x0 + (1 - a) * this.x1;
        var y = b * this.y0 + (1 - b) * this.y1;
        var v = this.field.getValue(x, y); //vector form
        if (this.field.maxLength == 0) {
            return new Particle(x, y, 1 + 40 * Math.random());
        }
        var m = v.length() / this.field.maxLength;  //magnitude
        // The random factor here is designed to ensure that
        // more particles are placed in slower areas; this makes the
        // overall distribution appear more even.
        if ((v.x || v.y) && ( Math.random() > m * .9)) { //10% chance at max length
            var proj = this.projection.project(x, y);
            var sx = proj.x * scale + dx;
            var sy = proj.y * scale + dy;
            if ( !(sx < 0 || sy < 0 || sx > this.canvas.width || sy > this.canvas.height)) { //dimension check
                return new Particle(x, y, 1 + 40 * Math.random());
            }
        }
    }
};


MotionDisplay.prototype.startMove = function(animator) {
    // Save screen.
    //this.imageCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
};


MotionDisplay.prototype.endMove  = function(animator) {
    if (animator.scale < 1.1) {
        this.x0 = this.field.x0;
        this.x1 = this.field.x1;
        this.y0 = this.field.y0;
        this.y1 = this.field.y1;
    } else {
        // get new bounds for making new particles.
        var p = this.projection;
        var self = this;
        function invert(x, y) {
            x = (x - animator.dx) / animator.scale;
            y = (y - animator.dy) / animator.scale;
            return self.projection.invert(x, y);
        }
        var loc = invert(0, 0);
        var x0 = loc.x;
        var x1 = loc.x;
        var y0 = loc.y;
        var y1 = loc.y;
        function expand(x, y) {
            var v = invert(x, y);
            x0 = Math.min(v.x, x0);
            x1 = Math.max(v.x, x1);
            y0 = Math.min(v.y, y0);
            y1 = Math.max(v.y, y1);
        }
        // This calculation with "top" is designed to fix a bug
        // where we were missing particles at the top of the
        // screen with north winds. This is a short-term fix,
        // it's dependent on the particular projection and
        // region, and we should figure out a more general
        // solution soon.
        var top = -.2 * this.canvas.height;
        expand(top, this.canvas.height);
        expand(this.canvas.width, top);
        expand(this.canvas.width, this.canvas.height);
        this.x0 = Math.max(this.field.x0, x0);
        this.x1 = Math.min(this.field.x1, x1);
        this.y0 = Math.max(this.field.y0, y0);
        this.y1 = Math.min(this.field.y1, y1);
    }
    tick = 0;
    this.makeNewParticles(animator);
};


MotionDisplay.prototype.animate = function(animator) {
    this.moveThings(animator);
    this.draw(animator);
}


MotionDisplay.prototype.move = function(animator) {
    var w = this.canvas.width;
    var h = this.canvas.height;
    var g = this.canvas.getContext('2d');

    g.fillStyle = this.outsideColor;
    var dx = animator.dx;
    var dy = animator.dy;
    var scale = animator.scale;

    g.fillRect(0, 0, w, h);
    g.fillStyle = this.background;
    g.fillRect(dx, dy, w * scale, h * scale);
    var z = animator.relativeZoom();
    var dx = animator.dx - z * animator.dxStart;
    var dy = animator.dy - z * animator.dyStart;
    g.drawImage(this.imageCanvas, dx, dy, z * w, z * h);
};


MotionDisplay.prototype.moveThings = function(animator) {
    var speed = .01  / animator.scale;
    for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        if (p.age > 0 && this.field.inBounds(p.x, p.y)) {
            var a = this.field.getValue(p.x, p.y);
            p.x += speed * a.x;
            p.y += speed * a.y;
            p.age--;
        } else {
            this.particles[i] = this.makeParticle(animator);
        }
    }
};


MotionDisplay.prototype.draw = function(animator) {
    var g = this.canvas.getContext('2d');
    var w = this.canvas.width;
    var h = this.canvas.height;
    if (this.first) {
        g.fillStyle =  this.background;
        this.first = false;
    } else {
        g.fillStyle = this.backgroundAlpha;
    }
    var dx = animator.dx;
    var dy = animator.dy;
    var scale = animator.scale;

    g.fillRect(dx, dy, w * scale,h * scale);
    var proj = new Vector(0, 0);
    var val = new Vector(0, 0);
    g.lineWidth = .75;
    for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        if (!this.field.inBounds(p.x, p.y)) {
            p.age = -2;
            continue;
        }
        this.projection.project(p.x, p.y, proj);
        proj.x = proj.x * scale + dx;
        proj.y = proj.y * scale + dy;
        if (proj.x < 0 || proj.y < 0 || proj.x > w || proj.y > h) {
            p.age = -2;
        }
        if (p.oldX != -1) { //not new
            var wind = this.field.getValue(p.x, p.y, val);
            var s = wind.length() / this.maxLength;
            var t=Math.floor(290 * (1-s))-45;


            g.strokeStyle = "hsl(" + t + ", 50%, 50%)";
            g.beginPath();
            g.moveTo(proj.x, proj.y);
            g.lineTo(p.oldX, p.oldY);
            g.stroke();
        }
        p.oldX = proj.x;
        p.oldY = proj.y;
    }
};

// please don't hate on this code too much.
// it's late and i'm tired.

var MotionDetails = function(div, callout, field, projection, animator) {
    $(callout).fadeOut();
    var moveTime = +new Date();
    var calloutOK = false;
    var currentlyShowing = false;
    var calloutX = 0;
    var calloutY = 0;
    var calloutHTML = '';
    var lastX = 0;
    var lastY = 0;

    function format(x) {
        x = Math.round(x * 10) / 10;
        var a1 = ~~x;
        var a2 = (~~(x * 10)) % 10;
        return a1 + '.' + a2;
    }

    function minutes(x) {
        x = Math.round(x * 60) / 60;
        var degrees = ~~x;
        var m = ~~((x - degrees) * 60);
        return degrees + '&deg;&nbsp;' + (m == 0 ? '00' : m < 10 ? '0' + m : '' + m) + "'";
    }

    $(div).mouseleave(function() {
        moveTime = +new Date();
        calloutOK = false;
    });

    var pos = $(div).position();

    $(div).mousemove(function(e) {

        // TODO: REMOVE MAGIC CONSTANTS
        var x = e.pageX - this.offsetLeft - 60;
        var y = e.pageY - this.offsetTop - 10;
        if (x == lastX && y == lastY) {
            return;
        }
        lastX = x;
        lastY = y;
        moveTime = +new Date();
        var scale = animator.scale;
        var dx = animator.dx;
        var dy = animator.dy;
        var mx = (x - dx) / scale;
        var my = (y - dy) / scale;
        var location = projection.invert(mx, my);
        var lat = location.y;
        var lon = location.x;
        var speed = 0;
        if (field.inBounds(lon, lat)) {
            // speed = field.getValue(lon, lat).length() / 1.15;
            speed = field.getValue(lon, lat).length();
        }
        calloutOK = !!speed;
        calloutHTML = '<div style="padding-bottom:5px"><b>' +
            ' 风速： ' + format(speed)  + ' km/h </b><br></div>' +
            minutes(lat) + ' N, ' +
            minutes(lon) + ' W<br>' +
            '点击放大';

        calloutY = (pos.top + y) + 'px';
        calloutX = (pos.left + x + 20) + 'px';
    });

    setInterval(function() {
        var timeSinceMove = +new Date() - moveTime;
        if (timeSinceMove > 200 && calloutOK) {
            if (!currentlyShowing) {
                callout.innerHTML = calloutHTML;
                callout.style.left = calloutX;
                callout.style.top = calloutY;
                callout.style.visibility = 'visible';
                $(callout).fadeTo(400, 1);
                currentlyShowing = true;
            }
        } else if (currentlyShowing) {
            $(callout).fadeOut('fast');
            currentlyShowing = false;
        }
    }, 50);
};

// var field;
var mapAnimator;
var legendSpeeds = [1, 3, 5, 7, 10, 15];

var MapMask = function(image, width, height) {
    this.image = image;
    this.width = width;
    this.height = height;
};

MapMask.prototype.endMove = function(animator) {
    this.move(animator);
}

MapMask.prototype.move = function(animator) {
    var s = this.image.style;
    s.width = ~~(animator.scale * this.width) + 'px';
    s.height = ~~(animator.scale * this.height) + 'px';
    s.left = animator.dx + 'px';
    s.top = animator.dy + 'px';
};

MapMask.prototype.remove = function(animator) {
    $(this.image).toggle();
    if(showMask)
    {
        display.background="rgb(255,255,255)"
        display.backgroundAlpha="rgba(255,255,255,.22)"
        window.setTimeout(function(){display.backgroundAlpha="rgba(255,255,255,.02)"},500)
    }
    else
    {
        display.background="rgb(0,0,0)"
        display.backgroundAlpha="rgba(0,0,0,.22)"
        window.setTimeout(function(){display.backgroundAlpha="rgba(0,0,0,.02)"},500)
    }
    /* 	$("mask-holder").css({"background-color":"white"})
     */};

function isAnimating() {
    return true;
}


function doUnzoom() {
    mapAnimator.unzoom();
}
let count_mode_num = 0;

function ShowMask() {
    if ((count_mode_num % 2) === 0 ) showMask = false;
    else showMask = true;
    showMask = !showMask;
    mapAnimator.removeMask();
    mapAnimator.removeMask();
    count_mode_num += 1;
    console.log("Mask");
    //mapAnimator.unzoom();
}

function format(x) {
    x = Math.round(x * 10) / 10;
    var a1 = ~~x;
    var a2 = (~~(x * 10)) % 10;
    return a1 + '.' + a2;
}


var field;
function update_canvas(){
    test_updates();
    function test_updates(){
        $("#display").stop(true);
        $("#city-display").stop(true);
        $("#legend").stop(true);
        $("#image-canvas").stop(true);
        $("#unzoom").stop(true);
        $("#mask").stop(true);
        $("#callout").stop(true);
        $("#range-slide").stop(true);
        animate_stop = 1;
    }
    $(document).ready(function (){
            let day = $('#day option:selected').val();
            let time = $('#time option:selected').val();
            let map = $('#map option:selected').val();
            // if ((day) ==='' ||(time) ===''){
            //     alert('Please select one day and time before choosing a point on the map.');
            //     return false;
            // };
            if (day === "1") day = "20210722";
            if (day === "2") day = "20210723";
            if (day === "3") day = "20210724";
            if (day === "4") day = "20210725";
            if (day === "5") day = "20210726";
            if (day === "6") day = "20210727";

            if (time === "1") time = "00";
            if (time === "2") time = "01";
            if (time === "3") time = "02";
            if (time === "4") time = "03";
            if (time === "5") time = "04";
            if (time === "6") time = "05";
            if (time === "7") time = "06";
            if (time === "8") time = "07";
            if (time === "9") time = "08";
            if (time === "10") time = "09";
            if (time === "11") time = "10";
            if (time === "12") time = "11";
            if (time === "13") time = "12";
            if (time === "14") time = "13";
            if (time === "15") time = "14";
            if (time === "16") time = "15";
            if (time === "17") time = "16";
            if (time === "18") time = "17";
            if (time === "19") time = "18";
            if (time === "20") time = "19";
            if (time === "21") time = "20";
            if (time === "22") time = "21";
            if (time === "23") time = "22";
            if (time === "24") time = "23";

            if (range_change === 1){
                let d = jQuery('.value').html();
                time = parseInt(d.slice(11,d.length), 10);
                if (time < 10) time = "0" + time;
                test_updates();
                // range_change = 0;
            }

            if (map === '') map = 'wind';
            if (map === "3") map = 'wind';
            if (map === "4") map = 'wind_100';

            let weather_json_file_name1;
            if ((day) ==='' ||(time) ===''){
                alert('Please select one day before choosing a region on the map.');
                return false;
                // weather_json_file_name1 = "2021072200" + ".json"; //instantiate variable for reading file
            }
            else{
                weather_json_file_name1 = day + time + ".json"; //instantiate variable for reading file
                // mapAnimator.start(40, 1);
            }
            let weather_json_file_path1 = "data_all/" + map + "/" + weather_json_file_name1
            $.ajax({
                type: "get",
                url: weather_json_file_path1,
                dataType: "json",
                // data file path
                success: function (data) {

                    var windDataRaw = data;
                    field = VectorField.read(windDataRaw, true);
                    animate_stop = 0;
                    test_updates();
                    init();
                }
            });
        }
    )
}

function init() {
    $("#display").stop(true);
    $("#city-display").stop(true);
    $("#legend").stop(true);
    $("#image-canvas").stop(true);
    $("#unzoom").stop(true);
    $("#mask").stop(true);
    $("#callout").stop(true);
    animate_stop = 1;
    loading = false;
    var timestamp = windDataRaw.timestamp || 'unknown on unknown';
    // var parts = timestamp.split('on');
    // var time = parts[0].trim();
    // var day = parts[1].trim().replace(' 0', ' '); // correct "01" dates.
    // day = day.replace('September', 'Sept.'); // No room for full "September".
    // day = day.replace('November', 'Nov.'); // No room for full "November".
    // day = day.replace('December', 'Dec.'); // No room for full "December".
    // document.getElementById('update-time').innerHTML =
    //     '<span id="day">' + day +'</span><br>' + time + ' EST' +
    //     '<br><span id="time-explanation">(time of forecast download)</span>';
    // 00:00 pm on July 22, 2021
    let real_time;
    let map = $('#map option:selected').val();
    let name1 = timestamp.slice(0, timestamp.length-2) + timestamp.slice(-2) + ":00:00";
    if (timestamp.slice(-2) < "12") real_time = timestamp.slice(-2) + ":00:00" + " a.m";
    if (timestamp.slice(-2) === "12") real_time = timestamp.slice(-2) + ":00:00" + " noon";
    if (timestamp.slice(-2) > "12") real_time = timestamp.slice(-2) + ":00:00" + " p.m";
    if (map === "2") real_time = real_time + " on July " + timestamp.slice(-4, -2) + ", 2021" + " 100m Wind Flow map";
    else real_time = real_time + " on July " + timestamp.slice(-4, -2) + ", 2021" + " Wind Flow map";

    document.getElementById('update-time').innerHTML =
        '<span id="show_day">' + real_time +
        '<br></span>';
    // var avg = field.averageLength / 1.15; // knots --> miles per hour
    // var max = field.maxLength / 1.15;
    // document.getElementById('average-speed').innerHTML =
    //     '<br>top speed: <b>' + format(max) + ' mph</b><br>' +
    //     'average: <b>' + format(avg) + ' mph</b>';

    var canvas = document.getElementById('display');
    var imageCanvas = document.getElementById('image-canvas');
    var mapProjection = new ScaledAlbers(
        14111, -30, canvas.height + 20, 105.5, 32.4);
    var isMacFF = navigator.platform.indexOf('Mac') != -1 &&
        navigator.userAgent.indexOf('Firefox') != -1;
    var isWinFF = navigator.platform.indexOf('Win') != -1 &&
        navigator.userAgent.indexOf('Firefox') != -1;
    var isWinIE = navigator.platform.indexOf('Win') != -1 &&
        navigator.userAgent.indexOf('MSIE') != -1;
    var numParticles = isMacFF || isWinIE ? 3500 : 4500; // slowwwww browsers
    display = new MotionDisplay(canvas, imageCanvas, field,
        numParticles, mapProjection);

    // IE & FF Windows do weird stuff with very low alpha.
    if (isWinFF || isWinIE) {
        display.setAlpha(.05);
    }

    var navDiv = document.getElementById("city-display");
    var unzoom = document.getElementById('unzoom');
    mapAnimator = new Animator(navDiv, isAnimating, unzoom);
    mapAnimator.add(display);

    var mask = new MapMask(document.getElementById('mask'), 1100, 500);
    mapAnimator.add(mask);

    var callout = document.getElementById('callout');
    var hovercard = new MotionDetails(navDiv, callout, field,
        mapProjection, mapAnimator);

    // var cityCanvas = document.getElementById('city-display');
    // cityDisplay = new CityDisplay(cities, cityCanvas, mapProjection);
    // mapAnimator.add(cityDisplay);
    // cityDisplay.move();

    var legendAnimator = new Animator(null, isAnimating);

    // Scale for speed.
    // Numerator comes from size of map.
    // Denominator is knots vs. mph.
    // var speedScaleFactor = 20 / 1.15;
    var speedScaleFactor = 20;
    for (var i = 1; i <= legendSpeeds.length; i++) {
        var c = document.getElementById('legend' + i);
        var legendField = VectorField.constant(
            legendSpeeds[i - 1] * speedScaleFactor, 0, 0, 0, c.width, c.height);
        var legend = new MotionDisplay(c, null, legendField, 30);
        // normalize so colors correspond to wind map's maximum length!
        legend.maxLength = field.maxLength * speedScaleFactor;
        legendAnimator.add(legend);
    }
    animate_stop = 0;
    mapAnimator.start(40);
    legendAnimator.start(40);
}
var range_change;
function myFunctionBack() {
    // a = 0;

    // var d = jQuery('.value').html();
    // var a = parseInt(d, 10);
    // a = parseInt(a, 10);
    // console.log(a);
    // if (a >= 133) {
    //     a = 132
    // }
    range_change = 1;
    let day = $('#day option:selected').val();
    if ((day) ===''){
        alert('Please select one day before choosing a region on the map.');
        return false;
        // weather_json_file_name1 = "2021072200" + ".json"; //instantiate variable for reading file
    }
}
var elem = document.querySelector('input[type="range"]');

var rangeValue = function () {
    var test_day = $('#day option:selected').val();
    if (test_day === "1") test_day = "2021-07-22 ";
    if (test_day === "2") test_day = "2021-07-23 ";
    if (test_day === "3") test_day = "2021-07-24 ";
    if (test_day === "4") test_day = "2021-07-25 ";
    if (test_day === "5") test_day = "2021-07-26 ";
    if (test_day === "6") test_day = "2021-07-27 ";

    var newValue = elem.value;
    var target = document.querySelector('.value');
    target.innerHTML = test_day + newValue + ":00";
}

elem.addEventListener("input", rangeValue);

