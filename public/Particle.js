'use strict';

var Particle = function (r, px, py, vx, vy) {
  this.state = new ParticleState(px, py, vx, vy);
  this.nextState = new ParticleState(px, py, vx, vy);
  this.radius = r;
  this.mass = this.getMassFromRadius(r);
  this.merged = false;
};

Particle.prototype.GRAVITY = 1e-4;
Particle.prototype.DENSITY = 1.0

Particle.prototype.getMassFromRadius = function (r) {
  return this.DENSITY * Math.PI * Math.pow(this.radius, 3.0) * (4.0 / 3.0);
};

Particle.prototype.getRadiusFromMass = function (m) {
  return Math.pow(this.mass * 0.75 / (this.DENSITY * Math.PI), 1.0 / 3.0);
};

Particle.prototype.acceleration = function (out, state, particles) {
  var ax = 0.0;
  var ay = 0.0;

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    if (this === p) continue;

    var dx = p.state.pos.x - state.pos.x;
    var dy = p.state.pos.y - state.pos.y;
    var d2 = dx * dx + dy * dy;
    var d = Math.sqrt(d2);

    var force = d2 > 1e-10 ? this.mass * p.mass * this.GRAVITY / d2 : 0;

    ax += (force / this.mass) * dx / d;
    ay += (force / this.mass) * dy / d;
  }

  out.vel.set(ax, ay);
};

Particle.prototype.initRK4 = function (out, particles) {
  out.pos.setv(this.state.vel);
  this.acceleration(out, this.state, particles);
};

Particle.prototype.evalRK4 = function (out, particles, deriv, dt) {
  // var st = new ParticleState(
  // this.nextState.set(
  //   this.state.pos.x + deriv.pos.x * dt,
  //   this.state.pos.y + deriv.pos.y * dt,
  //   this.state.vel.x + deriv.vel.x * dt,
  //   this.state.vel.y + deriv.vel.y * dt
  // );
  this.nextState.setv(deriv);
  this.nextState.mult(dt);
  this.nextState.addv(this.state);
  
  out.pos.setv(this.nextState.vel);
  this.acceleration(out, this.nextState, particles);
};

Particle.prototype.computeNextState = function (particles, dt) {
  var a = new ParticleState(0.0,0.0,0.0,0.0);
  var b = new ParticleState(0.0,0.0,0.0,0.0);
  var c = new ParticleState(0.0,0.0,0.0,0.0);
  var d = new ParticleState(0.0,0.0,0.0,0.0);

  this.initRK4(a, particles);
  this.evalRK4(b, particles, a, dt * 0.5);
  this.evalRK4(c, particles, b, dt * 0.5);
  this.evalRK4(d, particles, c, dt);

  var dpxdt = (a.pos.x + 2.0 * (b.pos.x + c.pos.x) + d.pos.x) / 6.0;
  var dpydt = (a.pos.y + 2.0 * (b.pos.y + c.pos.y) + d.pos.y) / 6.0;
  var dvxdt = (a.vel.x + 2.0 * (b.vel.x + c.vel.x) + d.vel.x) / 6.0;
  var dvydt = (a.vel.y + 2.0 * (b.vel.y + c.vel.y) + d.vel.y) / 6.0;

  this.nextState.set(
    this.state.pos.x + dpxdt * dt,
    this.state.pos.y + dpydt * dt,
    this.state.vel.x + dvxdt * dt,
    this.state.vel.y + dvydt * dt
  );
};

Particle.prototype.move = function () {
  this.state.setv(this.nextState);
};

Particle.prototype.colliding = function (p) {
  var dx, dy, d2, d;

  dx = p.state.pos.x - this.state.pos.x;
  dy = p.state.pos.y - this.state.pos.y;
  d2 = dx * dx + dy * dy;
  d = Math.sqrt(d2);

  return d <= this.radius + p.radius;
};