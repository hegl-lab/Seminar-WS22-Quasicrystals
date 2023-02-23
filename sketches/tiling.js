let sides = 3;

let correctTilings = [3, 4, 6];
const height = 530;
const width = 872;

let shapes = [
  "triangles",
  "squares",
  "pentagons",
  "hexagons",
  "heptagons",
  "octagons",
  "nonagons",
  "decagons",
];

let maximized = false;
function maximize() {
  let maxButton = document.getElementById("maxbtn");
  if (maximized) {
    maximized = false;
    maxButton.innerHTML = '<i class="fa-solid fa-expand"></i>';
  } else {
    maximized = true;
    maxButton.innerHTML = '<i class="fa-solid fa-compress"></i>';
  }
}

function changeSides(val) {
  sides = parseInt(val);
  // update value of input with id sideCounter
  let counter = document.getElementById("counter");
  counter.innerHTML = val;
}

function degreesToRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}
let polygons = 0;
let epsilon;

function sketch_tilings(p) {
  p.setup = function () {
    p.createCanvas(width, height);
  };

  let oldSides = -1;
  p.draw = function () {
    if (oldSides !== sides) {
      oldSides = sides;
      p.update();
    }
  };

  p.update = function () {
    if (correctTilings.includes(sides)) {
      epsilon = 35;
    } else {
      epsilon = 36 * 1.8;
      console.log(sides + " is not in " + correctTilings);
    }
    p.clear();
    p.fill(255);
    p.stroke(255);
    p.translate(height / 2 + 20, height / 2);
    let polygonSize = 80;
    p.polygon(0, 0, polygonSize, sides);
  };

  p.polygon = function (
    x,
    y,
    radius,
    npoints,
    recursion = 20,
    rotation = 0,
    visited = []
  ) {
    polygons++;
    let angle = p.TWO_PI / npoints;
    rotation -= angle / 2;
    p.beginShape();
    visited.push({ x, y });
    for (let a = rotation; a < p.TWO_PI + rotation; a += angle) {
      let sy = y + p.cos(a) * radius;
      let sx = x + p.sin(a) * radius;
      p.vertex(sx, sy);
    }
    p.endShape(p.CLOSE);
    if (recursion > 0) {
      rotation += angle / 2;
      // create a new polygon on each edge
      for (let a = rotation; a < p.TWO_PI + rotation; a += angle) {
        let sx =
          x +
          p.sin(p.TWO_PI - a) *
            radius *
            (0.6 + 0.055 * p.min(sides ** 2, 5 ** 2));
        let sy =
          y + p.cos(a) * radius * (0.6 + 0.055 * p.min(sides ** 2, 5 ** 2));
        if (
          !visited.some(
            (v) =>
              v.x <= sx + epsilon &&
              v.x >= sx - epsilon &&
              v.y <= sy + epsilon &&
              v.y >= sy - epsilon
          )
        ) {
          p.polygon(sx, sy, radius, npoints, recursion - 1, a + p.PI, visited);
        }
      }
    }
  };
}
new p5(sketch_tilings, "tilings");
