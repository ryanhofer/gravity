'use strict';

function ParticleState(x, y, vx, vy) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
}

ParticleState.prototype.setv = function(other) {
  this.x = other.x;
  this.y = other.y;
  this.vx = other.vx;
  this.vy = other.vy;
}

ParticleState.prototype.set = function(x, y, vx, vy) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
}