var Vec2 = (function(){
  'use strict';

  function Vec2(x, y) {
    this.x = x;
    this.y = y;
  }

  Vec2.prototype.setv = function (v) {
    this.x = v.x;
    this.y = v.y;
  };

  Vec2.prototype.set = function (x, y) {
    this.x = x;
    this.y = y;
  };

  Vec2.prototype.addv = function (v) {
    this.x += v.x;
    this.y += v.y;
  };

  Vec2.prototype.add = function (x, y) {
    this.x += x;
    this.y += y;
  };

  Vec2.prototype.mult = function (s) {
    this.x *= s;
    this.y *= s;
  };

  return Vec2;
})();