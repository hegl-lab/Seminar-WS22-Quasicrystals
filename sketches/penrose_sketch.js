function genMesh5D(lower, upper, includeNeighbours = false) {
  var mesh = [];
  // indices of neighbors
  var neighbors = [];
  for (x = lower; x <= upper; x++) {
    for (y = lower; y <= upper; y++) {
      for (z = lower; z <= upper; z++) {
        for (v = lower; v <= upper; v++) {
          for (w = lower; w <= upper; w++) {
            mesh.push([x, y, z, v, w]);
          }
        }
      }
    }
  }
  return mesh;
}

// works
function project([_x, _y, _z, _v, _w]) {
  const theta = (2 * PI) / 5.0;
  const x =
    (_x +
      cos(theta) * _y +
      cos(2 * theta) * _z +
      cos(3 * theta) * _v +
      cos(4 * theta) * _w) *
    sqrt(2 / 5);
  const y =
    (sin(theta) * _y +
      sin(2 * theta) * _z +
      sin(3 * theta) * _v +
      sin(4 * theta) * _w) *
    sqrt(2 / 5);
  return [x, y];
}

// works
function projectOrth([_x, _y, _z, _v, _w]) {
  const theta = (2 * PI) / 5.0;
  const x =
    (_x +
      cos(2 * theta) * _y +
      cos(4 * theta) * _z +
      cos(1 * theta) * _v +
      cos(3 * theta) * _w) *
    sqrt(2 / 5);
  const y =
    (sin(2 * theta) * _y +
      sin(4 * theta) * _z +
      sin(1 * theta) * _v +
      sin(3 * theta) * _w) *
    sqrt(2 / 5);
  const z = (_x + _y + _z + _v + _w) * sqrt(1 / 5);
  return [x, y, z];
}

// works
function dotProduct3D([x, y, z], [u, v, w]) {
  return x * u + y * v + z * w;
}

// works
function crossProduct3D([x, y, z], [u, v, w]) {
  return [y * w - z * v, z * u - x * w, x * v - y * u];
}

// works
function norm3D([x, y, z]) {
  return sqrt(x * x + y * y + z * z);
}

// function generateIthEta()

function generateEtas() {
  const etas = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      // unit vector dim 5 with 1 at position i
      let e_r = Array(5).fill(0);
      e_r[i] = 1;
      // unit vector dim 5 with 1 at position j
      let e_s = Array(5).fill(0);
      e_s[j] = 1;

      // projectOrth both
      let e_r_proj = projectOrth(e_r);
      let e_s_proj = projectOrth(e_s);

      // cross product
      let tmp = crossProduct3D(e_r_proj, e_s_proj);

      // normalize
      let tmp_norm = norm3D(tmp);
      if (tmp_norm === 0) {
        continue;
      }

      // divide by norm
      let eta = [tmp[0] / tmp_norm, tmp[1] / tmp_norm, tmp[2] / tmp_norm];
      let etaMinus = [-eta[0], -eta[1], -eta[2]];

      etas.push(eta);
      etas.push(etaMinus);
    }
  }
  return etas;
}

function inCutWindow([x, y, z, v, w]) {
  const WMesh = genMesh5D(-1 / 2, 1 / 2);
  const W = [];
  for (let i = 0; i < WMesh.length; i++) {
    W.push(projectOrth(WMesh[i]));
  }
  const etas = generateEtas();
  // console.log("etas: " + etas.length);
  const projected = projectOrth([x, y, z, v, w]);
  for (let j = 0; j < etas.length; j++) {
    let eta = etas[j];
    // const maxI = W.map(w => dotProduct3D(w, eta)).reduce((a, b) => Math.max(a, b))
    // const I = W.map((w) => dotProduct3D(w, eta));
    const I = [];
    for (let i = 0; i < W.length; i++) {
      I.push(dotProduct3D(eta, W[i]));
    }
    if (I.length === 0) {
      // console.log("I is empty");
    }
    // get max element from I
    let maxI = I[0];
    for (let i = 1; i < I.length; i++) {
      if (I[i] > maxI) {
        maxI = I[i];
      }
    }
    if (isNaN(maxI)) {
      // console.log("I is " + I);
    }
    // console.log("maxI: " + maxI);
    if (dotProduct3D(eta, projected) > maxI) {
      return false;
    }
  }
  return true;
}

const width = 600;
const height = 600;

const maxMesh = 2;
const minMesh = -maxMesh;

function coordsToPixel([x, y]) {}

function setup() {
  createCanvas(width, height);
  background(255);
  noLoop();
}

// Penrose tiling
function draw() {
  translate(width / 2, height / 2);
  const mesh = genMesh5D(minMesh, maxMesh);
  // console.log(mesh.length);
  const accepted = [];
  for (let i = 0; i < mesh.length; i++) {
    if (inCutWindow(mesh[i])) {
      accepted.push(mesh[i]);
    }
  }
  // console.log(accepted.length);
  const acceptedProjected = [];
  for (let i = 0; i < accepted.length; i++) {
    acceptedProjected.push(project(accepted[i]));
  }
  for (let i = 0; i < acceptedProjected.length; i++) {
    const [x, y] = acceptedProjected[i];
    ellipse(x * 50, y * 50, 10, 10);
  }
}
