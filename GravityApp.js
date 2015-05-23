'use strict';

var GravityApp = function (canvas) {
  this.canvas = canvas;
  this.gl = canvas.getContext('2d');
  this.flagResizeCanvas = false;
  this.currentTime = window.performance.now();
  this.mouse = new Vec2(0, 0);
  this.particleSystem = new ParticleSystem();

  this.particleSystem.randomize(new Vec2(1000, 1000));
  this.resizeCanvas();

  window.addEventListener('resize', (function (e) {
    this.flagResizeCanvas = true;
  }).bind(this));

  this.canvas.addEventListener('mousemove', (function (e) {
    this.mouse.set(e.pageX, e.pageY);
    // console.log('Mouse: ', this.mouse);
  }).bind(this));
};

GravityApp.prototype.run = function () {
  this.currentTime = window.performance.now();
  window.requestAnimationFrame(this.prepareFrame.bind(this));
};

GravityApp.prototype.prepareFrame = function (timestamp) {
  var deltaTime = timestamp - this.currentTime;
  this.currentTime = timestamp;

  if (this.flagResizeCanvas) {
    this.flagResizeCanvas = false;
    this.resizeCanvas();
  }

  this.update(deltaTime);
  this.render();
  window.requestAnimationFrame(this.prepareFrame.bind(this));
};

GravityApp.prototype.update = function (deltaTime) {
  this.particleSystem.update(deltaTime);
};

GravityApp.prototype.render = function () {
  var gl = this.gl;
  gl.clearRect(0, 0, this.canvas.width, this.canvas.height);

  gl.save();
  gl.translate(this.canvas.width/2, this.canvas.height/2);
  //TODO: view transformation

  this.particleSystem.draw(gl);

  gl.restore();
};

GravityApp.prototype.resizeCanvas = function () {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  console.log('Resized: ', this.canvas.width, this.canvas.height);
};