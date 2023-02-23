const width = 900;
const height = 600;

const RASTER_DEFAULT = 200;
const GRID_DEFAULT = 800;

let maxMesh = 4;
const minMesh = -maxMesh;

let OFF = [0, 0, 0, 0, 0.1];

let settings = Array(3).fill(0);
let xPos, yPos, offset;
let scaleCanvas = 130;

function changeZoom(val) {
  scaleCanvas = parseInt(val);
  document.getElementById("lambdaZ").innerHTML = val;
}
function changeXScroll(val) {
  xPos = (parseFloat(val) * scaleCanvas) / 10;
  document.getElementById("lambdaX").innerHTML = val;
}
function changeYScroll(val) {
  yPos = (parseFloat(val) * scaleCanvas) / 10;
  document.getElementById("lambdaY").innerHTML = val;
}
function changeOffset(val) {
  offset = parseFloat(val);
  document.getElementById("lambdaC").innerHTML = val;
}

let redraw = false;
let button;
async function enlargeFrame() {
  button = document.getElementById("scaleButton");
  button.innerHTML =
    'Generating... \
    <svg \
      aria-hidden="true" \
      class="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-slate-900 fill-slate-100 ml-10" \
      viewBox="0 0 100 101" \
      fill="none" \
      xmlns="http://www.w3.org/2000/svg" \
    > \
      <path \
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" \
        fill="currentColor" \
      /> \
      <path \
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" \
        fill="currentFill" \
      /> \
    </svg>';

  raster *= 1.5;
  gridMax = gridMax * 1.7;
  // continue after 1 second
  await new Promise((r) => setTimeout(r, 1));
  redraw = true;
}

// ------------------ CODE FOR PENROSE TILING ------------------

const UNITY_BASES = [
  [1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1],
];

const u2dir = [0.632456, -0.511667, 0.19544, 0.19544, -0.511667];
const v2dir = [0, 0.371748, -0.601501, 0.601501, -0.371748];

let base1, base2, raster, gridMax;

function sketch_tilings(p) {
  const theta = (2 * p.PI) / 5.0;
  const tau = Math.sqrt(2 / 5);

  const [px1, px2, px3, px4, px5] = [
    tau,
    Math.cos(theta) * tau,
    Math.cos(2 * theta) * tau,
    Math.cos(3 * theta) * tau,
    Math.cos(4 * theta) * tau,
  ];

  const [py1, py2, py3, py4, py5] = [
    0,
    Math.sin(theta) * tau,
    Math.sin(2 * theta) * tau,
    Math.sin(3 * theta) * tau,
    Math.sin(4 * theta) * tau,
  ];

  function project([_x, _y, _z, _v, _w]) {
    const x = px1 * _x + px2 * _y + px3 * _z + px4 * _v + px5 * _w;
    const y = py2 * _y + py3 * _z + py4 * _v + py5 * _w;
    return [x, y];
  }

  function scale5D(scalar, [x, y, z, u, v]) {
    return [scalar * x, scalar * y, scalar * z, scalar * u, scalar * v];
  }

  function add5D([x, y, z, u, v], [x2, y2, z2, u2, v2]) {
    return [x + x2, y + y2, z + z2, u + u2, v + v2];
  }

  p.round5D = function ([x, y, z, v, w]) {
    return [p.round(x), p.round(y), p.round(z), p.round(v), p.round(w)];
  };

  let cache = new Map();
  let scale = -1;
  let kdtree;

  p.setup = function () {
    settings = Array(5).fill(0);
    xPos = 0.25;
    yPos = 0.25;
    l3 = 0.25;
    offset = 0.25;
    l5 = 0.25;
    const theta = (2 * p.PI) / 5.0;
    raster = RASTER_DEFAULT;
    gridMax = GRID_DEFAULT;
    base1 = [
      p.sqrt(2 / 5),
      p.cos(theta) * p.sqrt(2 / 5),
      p.cos(2 * theta) * p.sqrt(2 / 5),
      p.cos(3 * theta) * p.sqrt(2 / 5),
      p.cos(4 * theta) * p.sqrt(2 / 5),
    ];
    base1 = scale5D(1.0 / raster, base1);
    base2 = [
      0,
      p.sin(theta) * p.sqrt(2 / 5),
      p.sin(2 * theta) * p.sqrt(2 / 5),
      p.sin(3 * theta) * p.sqrt(2 / 5),
      p.sin(4 * theta) * p.sqrt(2 / 5),
    ];
    base2 = scale5D(1.0 / raster, base2);

    p.createCanvas(width, height);
    p.stroke(255);
    p.draw();
  };

  p.draw = function () {
    maxMesh = 3;
    startTime = Date.now();
    if (inputsAreSame()) return;
    else p.resetCanvas();

    if (wasCached(offset)) {
      kdtree = cache.get(offset);
    } else {
      kdtree = buildTreeFromAcceptedPoints();
    }

    cache.set(offset, kdtree);
    projectAllPoints(kdtree);

    if (redraw === true) {
      redraw = false;
      button.innerHTML = "Click to get larger frame";
    }
  };

  function projectAllPoints(kdtree) {
    for (const point of kdtree.inOrderTraversal()) {
      // acceptedProjected.push(project(point));
      projectedP = project(point);
      // p.ellipse(projectedP[0] * scale, projectedP[1] * scale, 3, 3);
      for (i = 0; i < 5; i++) {
        neighborI = add5D(point, UNITY_BASES[i]);
        if (kdtree.search(neighborI)) {
          projectedNeighborI = project(neighborI);
          p.line(
            (projectedP[0] - xPos) * scale,
            (projectedP[1] - yPos) * scale,
            (projectedNeighborI[0] - xPos) * scale,
            (projectedNeighborI[1] - yPos) * scale
          );
        }
      }
    }
  }

  function buildTreeFromAcceptedPoints() {
    kdtree = new KDTree([]);
    let vecTmp0, vecTmp1, vecAdded, vecOff, vecRound;
    for (let i = 0; i < 2 * gridMax; i++) {
      vecTmp0 = scale5D(i - gridMax, base1);
      for (let j = 0; j < 2 * gridMax; j++) {
        vecTmp1 = scale5D(j - gridMax, base2);
        vecAdded = add5D(vecTmp0, vecTmp1);
        vecOff = add5D(vecAdded, OFF);
        vecRound = p.round5D(vecOff);
        if (!kdtree.search(vecRound)) {
          kdtree.insert(vecRound);
        }
      }
    }
    return kdtree;
  }

  function wasCached(l4) {
    return cache.has(l4) && !redraw;
  }

  p.resetCanvas = function () {
    if (!redraw) {
      raster = RASTER_DEFAULT;
      gridMax = GRID_DEFAULT;
    } else {
    }
    for (var i = 0; i < 5; i++) {
      OFF[i] = offset * v2dir[i] + offset * u2dir[i];
    }
    scale = scaleCanvas;
    p.clear();
    p.translate(width / 2, height / 2);

    settings = [-xPos, -yPos, -offset];
  };

  function inputsAreSame() {
    return (
      settings[0] === -xPos &&
      settings[1] === -yPos &&
      settings[2] === -offset &&
      scale === scaleCanvas &&
      !redraw
    );
  }
}

new p5(sketch_tilings, "tilings");
