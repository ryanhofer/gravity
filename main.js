'use strict';

var CREATE_RADIUS_INIT = 0.5;
var CREATE_RADIUS_INCR = 0.1;

var KEY_SPACEBAR = 32;

var canvas, context;

var prevTime = window.performance.now();

var mouse = new Vec2(0, 0);

var createRadius = CREATE_RADIUS_INIT;
var createHolding = false;

document.addEventListener('DOMContentLoaded', function(e) {
  canvas = document.getElementById('sol-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context = canvas.getContext('2d');

  var particles = getStartingParticles();

  var rafCallback = function(timestamp) {
    var deltaTime = timestamp - prevTime;
    tick(particles, deltaTime);
    prevTime = timestamp;
    window.requestAnimationFrame(rafCallback);
  }

  document.addEventListener('keydown', function(e) {
    if (e.which == KEY_SPACEBAR) {
      particles = getStartingParticles();
    }
  });

  window.addEventListener('resize', function(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  var createStart = function() {
    createHolding = true;
    createRadius = CREATE_RADIUS_INIT;
  }

  var createFinish = function() {
    if (createHolding) {
      particles.push(new Particle(createRadius, mouse.x, mouse.y, 0.0, 0.0));
      createHolding = false;
    }
  }

  var createCancel = function() {
    createHolding = false;
  }

  canvas.addEventListener('mousemove', function(e) {
    mouse.set(e.pageX, e.pageY);
  });

  canvas.addEventListener('mousedown', function(e) {
    createStart();
  });

  canvas.addEventListener('mouseup', function(e) {
    createFinish();
  });

  canvas.addEventListener('mouseleave', function(e) {
    createCancel();
  });
  
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    mouse.set(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
  });

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    mouse.set(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    createStart();
  });

  canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    mouse.set(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    createFinish();
  });

  canvas.addEventListener('touchcancel', function(e) {
    createCancel();
  });

  // begin the gameloop
  window.requestAnimationFrame(rafCallback);
});

function getStartingParticles() {
  var N_PLANETS = 400;
  var particles = new Array(N_PLANETS);
  for (var i = 0; i < N_PLANETS; i++) {
    var r = Math.log(1.0 + Math.random() * 400.0);
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;
    var vel = Math.random() / 5.0;
    var dir = Math.random() * 2 * Math.PI;
    var vx = vel * Math.cos(dir);
    var vy = vel * Math.sin(dir);
    particles[i] = new Particle(r, x, y, vx, vy);
  }
  return particles;
}

function tick(particles, deltaTime) {
  if (createHolding) {
    createRadius += CREATE_RADIUS_INCR;
  }

  draw(particles);

  for (var i = 0; i < particles.length; i++) {
    var p1 = particles[i];

    if (p1.merged) {
      continue;
    }

    for (var j = 0; j < particles.length; j++) {
      var p2 = particles[j];

      if (p1 == p2 || p2.merged) {
        continue;
      }

      if (p1.colliding(p2)) {
        if (p2.mass > p1.mass) {
          var pt = p1;
          p1 = p2;
          p2 = pt;
        }
        p2.merged = true;
        var vx = (p1.state.vx * p1.mass + p2.state.vx * p2.mass) / (p1.mass + p2.mass);
        var vy = (p1.state.vy * p1.mass + p2.state.vy * p2.mass) / (p1.mass + p2.mass);
        p1.mass += p2.mass;
        p1.radius = p1.getRadiusFromMass(p1.mass);
        p1.state.vx = vx;
        p1.state.vy = vy;
      }
    }
  }

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    if (p.merged) {
      particles.splice(i, 1);
      continue;
    }

    p.update(particles, deltaTime);
  }

  for (var i = 0; i < particles.length; i++) {
    particles[i].move();
  }
}

function draw(particles) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // particle creation UI
  if (createHolding) {
    context.strokeStyle = 'rgba(255,0,0,0.5)';
    context.beginPath();
    // vertical lines
    context.moveTo(mouse.x - createRadius, 0);
    context.lineTo(mouse.x - createRadius, canvas.height);
    context.moveTo(mouse.x + createRadius, 0);
    context.lineTo(mouse.x + createRadius, canvas.height);
    // horizontal lines
    context.moveTo(0,            mouse.y - createRadius);
    context.lineTo(canvas.width, mouse.y - createRadius);
    context.moveTo(0,            mouse.y + createRadius);
    context.lineTo(canvas.width, mouse.y + createRadius);
    context.stroke();
  }

  context.fillStyle = 'black';
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    if (p.merged) {
      continue;
    }

    context.beginPath();
    var drawRadius = Math.max(p.radius, 1.0);
    context.arc(p.state.x, p.state.y, drawRadius, 0, 2.0*Math.PI, false);
    context.fill();
  }
}