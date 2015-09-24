var ParticleState = (function(){
  'use strict';

  function ParticleState(px, py, vx, vy) {
    this.pos = new Vec2(px, py);
    this.vel = new Vec2(vx, vy);
  }

  ParticleState.prototype.setv = function (other) {
    this.pos.setv(other.pos);
    this.vel.setv(other.vel);
  };

  ParticleState.prototype.set = function (px, py, vx, vy) {
    this.pos.set(px, py);
    this.vel.set(vx, vy);
  };

  ParticleState.prototype.addv = function (other) {
    this.pos.addv(other.pos);
    this.vel.addv(other.vel);
  };

  ParticleState.prototype.mult = function (s) {
    this.pos.mult(s);
    this.vel.mult(s);
  };

  return ParticleState;
})();