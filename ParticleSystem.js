'use strict';

var ParticleSystem = function () {
  this.particles = [];
};

// Number of particles to generate when initialized
ParticleSystem.prototype.N_PARTICLES = 400;

// Generate a random particle field
ParticleSystem.prototype.randomize = function (bounds) {
  this.particles = new Array(this.N_PARTICLES);
  for (var i = 0; i < this.N_PARTICLES; i++) {
    var r = Math.log(1 + Math.random() * 400);
    var x = (Math.random()*2 - 1) * bounds.x;
    var y = (Math.random()*2 - 1) * bounds.y;
    var vel = Math.random() / 5.0;
    var dir = Math.random() * 2*Math.PI;
    var vx = vel * Math.cos(dir);
    var vy = vel * Math.sin(dir);
    this.particles[i] = new Particle(r, x, y, vx, vy);
  }
};

ParticleSystem.prototype.update = function (deltaTime) {
  this.updateParticles(deltaTime);
  this.resolveCollisions();
  this.cleanupMerged();
};

ParticleSystem.prototype.draw = function (gl) {
  gl.save();
  gl.fillStyle = 'black';
  for (var i = 0; i < this.particles.length; i++) {
    var p = this.particles[i];
    gl.beginPath();
    var r = Math.max(p.radius, 1.0);
    gl.arc(p.state.pos.x, p.state.pos.y, r, 0, 2*Math.PI);
    gl.fill();
  }
  gl.restore();
};

ParticleSystem.prototype.updateParticles = function (deltaTime) {
  for (var i = 0; i < this.particles.length; i++) {
    this.particles[i].computeNextState(this.particles, deltaTime);
  }
  for (var i = 0; i < this.particles.length; i++) {
    this.particles[i].move();
  }
};

ParticleSystem.prototype.resolveCollisions = function () {
  for (var i = 0; i < this.particles.length; i++) {
    var p1 = this.particles[i];

    if (p1.merged) continue;

    for (var j = 0; j < this.particles.length; j++) {
      var p2 = this.particles[j];

      if (p1.merged) break;
      if (p2.merged || p1 === p2) continue;

      if (p1.colliding(p2)) {
        var pL = p1.mass > p2.mass ? p1 : p2; // larger
        var pS = p1.mass > p2.mass ? p2 : p1; // smaller
        pS.merged = true;
        var vx = (pL.state.vel.x * pL.mass + pS.state.vel.x * pS.mass) / (pL.mass + pS.mass);
        var vy = (pL.state.vel.y * pL.mass + pS.state.vel.y * pS.mass) / (pL.mass + pS.mass);
        pL.mass += pS.mass;
        pL.radius = pL.getRadiusFromMass(pL.mass);
        pL.state.vel.set(vx, vy);
      }
    }
  }
};

ParticleSystem.prototype.cleanupMerged = function () {
  var i = 0;
  var j = this.particles.length;
  while (i < j) {
    if (this.particles[i].merged) {
      j--;
      this.particles[i] = this.particles[j];
    } else {
      i++;
    }
  }
  this.particles.length = j;
};