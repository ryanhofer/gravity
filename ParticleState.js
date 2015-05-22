'use strict';

var ParticleState = function(px, py, vx, vy) {
  this.pos = new Vec2(px, py);
  this.vel = new Vec2(vx, vy);
};

ParticleState.prototype.setv = function(other) {
  this.pos.setv(other.pos);
  this.vel.setv(other.vel);
};

ParticleState.prototype.set = function(px, py, vx, vy) {
  this.pos.set(px, py);
  this.vel.set(vx, vy);
};