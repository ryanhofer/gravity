'use strict';

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