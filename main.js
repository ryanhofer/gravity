'use strict';

var TIMESTEP = 20;
var CREATE_RADIUS_INIT = 0.5;
var CREATE_RADIUS_INCR = 0.1;
var BOUND_MARGIN = 1000.0;

var KEY_SPACEBAR = 32;

var canvas, ctx;

var createRadius = CREATE_RADIUS_INIT;
var createHolding = false;
var createX, createY;

document.addEventListener('DOMContentLoaded', function(e) {
  canvas = document.getElementById('sol-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');

  var planets = getStartingPlanets();

  window.setInterval(function() {
    tick(planets);
  }, TIMESTEP);

  document.addEventListener('keydown', function(e) {
    if (e.which == KEY_SPACEBAR) {
      planets = getStartingPlanets();
    }
  });

  window.addEventListener('resize', function(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  var createStart = function(e) {
    createHolding = true;
    createRadius = CREATE_RADIUS_INIT;
    createX = e.clientX;
    createY = e.clientY;
  }

  var createMove = function(e) {
    createX = e.clientX;
    createY = e.clientY;
  }

  var createFinish = function(e) {
    planets.push(new Planet(createRadius, createX, createY, 0.0, 0.0));
    createHolding = false;
    createRadius = CREATE_RADIUS_INIT;
  }

  canvas.addEventListener('mousedown', createStart);
  canvas.addEventListener('mousemove', createMove);
  canvas.addEventListener('mouseup', createFinish);
});

function getStartingPlanets() {
  var ASTEROID_RES_X = 150.0;
  var ASTEROID_RES_Y = 150.0;
  var planets = [];
  planets.push(new Planet(10.0, canvas.width/2+100, canvas.height/2-110, -0.05, 0.0));
  planets.push(new Planet(10.0, canvas.width/2-100, canvas.height/2+110, 0.05, 0.0));
  planets.push(new Planet(10.0, canvas.width/2, canvas.height/2, 0, 0));
  for (var x = 0; x < canvas.width / ASTEROID_RES_X; x++) {
    for (var y = 0; y < canvas.height / ASTEROID_RES_Y; y++) {
      planets.push(new Planet(
        0.2,
        x*ASTEROID_RES_X + 0.5*(canvas.width - ASTEROID_RES_X*Math.floor(canvas.width/ASTEROID_RES_X)),
        y*ASTEROID_RES_Y + 0.5*(canvas.height - ASTEROID_RES_Y*Math.floor(canvas.height/ASTEROID_RES_Y)),
        0.0, 0.0));
    }
  }
  return planets;
}

function outOfBounds(p) {
  return p.state.x < -BOUND_MARGIN || p.state.x > canvas.width + BOUND_MARGIN ||
         p.state.y < -BOUND_MARGIN || p.state.y > canvas.height + BOUND_MARGIN;
}

function tick(planets) {
  var vx, vy;

  if (createHolding) {
    createRadius += CREATE_RADIUS_INCR;
  }

  draw(planets);

  for (var p1, i = 0; i < planets.length; i++) {
    p1 = planets[i];

    if (p1.merged) {
      continue;
    }

    for (var p2, j = 0; j < planets.length; j++) {
      p2 = planets[j];

      if (p1 == p2 || p2.merged) {
        continue;
      }

      if (p1.colliding(p2)) {
        if (p2.mass > p1.mass) {
          let pt = p1;
          p1 = p2;
          p2 = pt;
        }
        p2.merged = true;
        vx = (p1.state.vx * p1.mass + p2.state.vx * p2.mass) / (p1.mass + p2.mass);
        vy = (p1.state.vy * p1.mass + p2.state.vy * p2.mass) / (p1.mass + p2.mass);
        p1.mass += p2.mass;
        p1.radius = p1.getRadiusFromMass(p1.mass);
        p1.state.vx = vx;
        p1.state.vy = vy;
      }
    }
  }

  for (var p, i = 0; i < planets.length; i++) {
    p = planets[i];

    if (p.merged || outOfBounds(p)) {
      planets.splice(i, 1);
      continue;
    }

    p.update(planets, TIMESTEP);
  }

  for (var i = 0; i < planets.length; i++) {
    planets[i].move();
  }
}

function draw(planets) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (createHolding) {
    ctx.strokeStyle = 'grey';
    ctx.beginPath();
    ctx.arc(createX, createY, createRadius, 0, 2.0*Math.PI, false);
    ctx.stroke();
  }

  ctx.fillStyle = 'white';
  for (var p, i = 0; i < planets.length; i++) {
    p = planets[i];

    if (p.merged) {
      continue;
    }

    ctx.beginPath();
    ctx.arc(p.state.x, p.state.y, p.radius, 0, 2.0*Math.PI, false);
    ctx.fill();
  }
}