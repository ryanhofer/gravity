'use strict';

// -- State class --------------------------------------------------------------

function State(x, y, vx, vy) {
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

Planet.prototype.acceleration = function(state, planets) {
  var ax = 0.0, ay = 0.0;
  var dx, dy, d, d2;

  for (var p, i = 0; i < planets.length; i++) {
    p = planets[i];

    if (p == this || p.merged) {
      continue;
    }

    dx = p.state.x - state.x;
    dy = p.state.y - state.y;
    d2 = dx * dx + dy * dy;
    d = Math.sqrt(d2);

    let force = d2 > 1e-10 ? this.mass * p.mass * this.GRAVITY / d2 : 0;

    ax += (force / this.mass) * dx / d;
    ay += (force / this.mass) * dy / d;
  }

  return {x: ax, y: ay};
};

Planet.prototype.initRK4 = function(planets) {
  var acc = this.acceleration(this.state, planets);
  return new Derivative(this.state.vx, this.state.vy, acc.x, acc.y);
};

Planet.prototype.evalRK4 = function(planets, deriv, dt) {
  var st, acc;
  st = new State(this.state.x + deriv.dx * dt,
                 this.state.y + deriv.dy * dt,
                 this.state.vx + deriv.dvx * dt,
                 this.state.vy + deriv.dvy * dt);
  acc = this.acceleration(st, planets);
  return new Derivative(st.vx, st.vy, acc.x, acc.y);
};

Planet.prototype.update = function(planets, dt) {
  var a, b, c, d, dxdt, dydt, dvxdt, dvydt;
  
  a = this.initRK4(planets);
  b = this.evalRK4(planets, a, dt * 0.5);
  c = this.evalRK4(planets, b, dt * 0.5);
  d = this.evalRK4(planets, c, dt);

  dxdt = (a.dx + 2.0 * (b.dx + c.dx) + d.dx) / 6.0;
  dydt = (a.dy + 2.0 * (b.dy + c.dy) + d.dy) / 6.0;
  dvxdt = (a.dvx + 2.0 * (b.dvx + c.dvx) + d.dvx) / 6.0;
  dvydt = (a.dvy + 2.0 * (b.dvy + c.dvy) + d.dvy) / 6.0;

  this.nextState = new State(this.state.x + dxdt * dt,
                             this.state.y + dydt * dt,
                             this.state.vx + dvxdt * dt,
                             this.state.vy + dvydt * dt);
};

Planet.prototype.move = function() {
  this.state = this.nextState;
}

Planet.prototype.colliding = function(p) {
  var dx, dy, d2, d;

  dx = p.state.x - this.state.x;
  dy = p.state.y - this.state.y;
  d2 = dx * dx + dy * dy;
  d = Math.sqrt(d2);

  return d <= this.radius + p.radius;
}