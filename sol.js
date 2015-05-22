'use strict';

// -- State class --------------------------------------------------------------

function State(x, y, vx, vy) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
}

State.prototype.setv = function(other) {
  this.x = other.x;
  this.y = other.y;
  this.vx = other.vx;
  this.vy = other.vy;
}

State.prototype.set = function(x, y, vx, vy) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
}

// -- State class --------------------------------------------------------------

function Derivative(dx, dy, dvx, dvy) {
  this.dx = dx;
  this.dy = dy;
  this.dvx = dvx;
  this.dvy = dvy;
}

// -- State class --------------------------------------------------------------

function Planet(r, x, y, vx, vy) {
  this.state = new State(x, y, vx, vy);
  this.nextState = new State(x, y, vx, vy);
  this.radius = r;
  this.mass = this.getMassFromRadius(r);
  this.merged = false;
}

Planet.prototype.GRAVITY = 1e-4;
Planet.prototype.DENSITY = 1.0

Planet.prototype.getMassFromRadius = function(r) {
  return this.DENSITY * Math.PI * Math.pow(this.radius, 3.0) * (4.0 / 3.0);
};

Planet.prototype.getRadiusFromMass = function(m) {
  return Math.pow(this.mass * 0.75 / (this.DENSITY * Math.PI), 1.0 / 3.0);
};

Planet.prototype.acceleration = function(out, state, planets) {
  var ax = 0.0;
  var ay = 0.0;

  for (var i = 0; i < planets.length; i++) {
    var p = planets[i];

    if (p == this || p.merged) {
      continue;
    }

    var dx = p.state.x - state.x;
    var dy = p.state.y - state.y;
    var d2 = dx * dx + dy * dy;
    var d = Math.sqrt(d2);

    var force = d2 > 1e-10 ? this.mass * p.mass * this.GRAVITY / d2 : 0;

    ax += (force / this.mass) * dx / d;
    ay += (force / this.mass) * dy / d;
  }

  out.dvx = ax;
  out.dvy = ay;
};

Planet.prototype.initRK4 = function(out, planets) {
  out.dx = this.state.vx;
  out.dy = this.state.vy;
  this.acceleration(out, this.state, planets);
};

Planet.prototype.evalRK4 = function(out, planets, deriv, dt) {
  var st = new State(this.state.x + deriv.dx * dt,
                     this.state.y + deriv.dy * dt,
                     this.state.vx + deriv.dvx * dt,
                     this.state.vy + deriv.dvy * dt);
  out.dx = st.vx;
  out.dy = st.vy;
  this.acceleration(out, st, planets);
};

Planet.prototype.update = function(planets, dt) {
  var a = new Derivative(0.0,0.0,0.0,0.0);
  var b = new Derivative(0.0,0.0,0.0,0.0);
  var c = new Derivative(0.0,0.0,0.0,0.0);
  var d = new Derivative(0.0,0.0,0.0,0.0);

  this.initRK4(a, planets);
  this.evalRK4(b, planets, a, dt * 0.5);
  this.evalRK4(c, planets, b, dt * 0.5);
  this.evalRK4(d, planets, c, dt);

  var dxdt = (a.dx + 2.0 * (b.dx + c.dx) + d.dx) / 6.0;
  var dydt = (a.dy + 2.0 * (b.dy + c.dy) + d.dy) / 6.0;
  var dvxdt = (a.dvx + 2.0 * (b.dvx + c.dvx) + d.dvx) / 6.0;
  var dvydt = (a.dvy + 2.0 * (b.dvy + c.dvy) + d.dvy) / 6.0;

  this.nextState.set(
    this.state.x + dxdt * dt,
    this.state.y + dydt * dt,
    this.state.vx + dvxdt * dt,
    this.state.vy + dvydt * dt
  );
};

Planet.prototype.move = function() {
  this.state.setv(this.nextState);
}

Planet.prototype.colliding = function(p) {
  var dx, dy, d2, d;

  dx = p.state.x - this.state.x;
  dy = p.state.y - this.state.y;
  d2 = dx * dx + dy * dy;
  d = Math.sqrt(d2);

  return d <= this.radius + p.radius;
}