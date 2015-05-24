'use strict';

var GravityGui = function (parent) {
  this.parent = parent;
  this.canvas = parent.canvas;
  this.mouse = new Vec2(0, 0);
  this.mustResizeCanvas = false;
};

GravityGui.prototype.init = function () {
  this.resizeCanvas();

  this.canvas.addEventListener('mousemove', (function (e) {
    this.mouse.set(e.pageX, e.pageY);
    // console.log('GravityGui.mouse: ', this.mouse);
  }).bind(this));

  window.addEventListener('resize', (function (e) {
    this.mustResizeCanvas = true;
  }).bind(this));
};

GravityGui.prototype.update = function (deltaTime) {
  if (this.mustResizeCanvas) {
    this.resizeCanvas();
    this.mustResizeCanvas = false;
  }
};

GravityGui.prototype.draw = function (gl) {
  // nothing to draw...
};

GravityGui.prototype.resizeCanvas = function () {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  // console.log('GravityGui.resizeCanvas: ', this.canvas.width, this.canvas.height);
};