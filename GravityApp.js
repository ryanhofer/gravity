'use strict';

var GravityApp = function (canvas) {
  this.canvas = canvas;
  this.gl = canvas.getContext('2d');
  this.currentTime = window.performance.now();

  this.particleSystem = new ParticleSystem(this);
  this.gui = new GravityGui(this);
};

GravityApp.prototype.run = function () {
  this.currentTime = window.performance.now();

  // Initialize components
  this.particleSystem.init();
  this.gui.init();

  window.requestAnimationFrame(this.prepareFrame.bind(this));
};

GravityApp.prototype.prepareFrame = function (timestamp) {
  var deltaTime = timestamp - this.currentTime;
  this.currentTime = timestamp;

  this.update(deltaTime);
  this.render();
  window.requestAnimationFrame(this.prepareFrame.bind(this));
};

GravityApp.prototype.update = function (deltaTime) {
  // Update components
  this.particleSystem.update(deltaTime);
  this.gui.update(deltaTime);
};

GravityApp.prototype.render = function () {
  var gl = this.gl;
  gl.clearRect(0, 0, this.canvas.width, this.canvas.height);

  gl.save();
  gl.translate(this.canvas.width/2, this.canvas.height/2);
  //TODO: view transformation

  // Draw components
  this.particleSystem.draw(gl);
  this.gui.draw(gl);

  gl.restore();
};