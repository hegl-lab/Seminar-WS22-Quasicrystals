let angle = 31.72;
let thicknessIn = 1.334;
let thickness = 1.334;

let tau = (1 + Math.sqrt(5)) / 2;
let theta = Math.atan(1 / tau);
let epsilon = 0.01;
let delta = Math.sin(theta) + Math.cos(theta);
let shift = 0;

let slope = 0;

function resetVals() {
  changeAngle(radiansToDegrees(theta));
  changeThickness(0.8);
}

resetVals();

function changeAngle(val) {
  document.getElementById("angle").innerHTML = val + "°";
  angle = degreesToRadians(val);
}

function changeThickness(val) {
  document.getElementById("thickness").innerHTML = val;
  thicknessIn = val;
}

function changeShift(val) {
  document.getElementById("shift").innerHTML = val;
  shift = val;
}

function degreesToRadians(degrees) {
  var PI = Math.PI;
  return degrees * (PI / 180);
}

function radiansToDegrees(radians) {
  var PI = Math.PI;
  return radians * (180 / PI);
}

function sketch_tilings(p) {
  let width, height, gradient, offs, scale;
  let gradient2,
    thickness2,
    verticalHeight,
    regionWidth,
    xprojec,
    versch,
    thick,
    gr,
    deltax;

  let yMax, yMin, x_accepted, y_accepted;
  let slider, slider2;

  function linedash(x1, y1, x2, y2, delta, style = "-") {
    let distance = p.dist(x1, y1, x2, y2);
    let dashNumber = distance / delta;
    let xDelta = (x2 - x1) / dashNumber;
    let yDelta = (y2 - y1) / dashNumber;

    for (let i = 0; i < dashNumber; i += 2) {
      let xi1 = i * xDelta + x1;
      let yi1 = i * yDelta + y1;
      let xi2 = (i + 1) * xDelta + x1;
      let yi2 = (i + 1) * yDelta + y1;

      if (style == "-") {
        p.line(xi1, yi1, xi2, yi2);
      } else if (style == ".") {
        p.point(xi1, yi1);
      } else if (style == "o") {
        p.ellipse(xi1, yi1, delta / 2);
      }
    }
  }

  function im(y) {
    return height - y;
  }

  function reim(y) {
    return height - im(y);
  }

  function maxAccepted(x, g) {
    return g * x + verticalHeight / 2;
  }

  function minAccepted(x, g) {
    return g * x - verticalHeight / 2;
  }

  function isWithinRegion(x, y, g) {
    return y > minAccepted(x, g) && y < maxAccepted(x, g);
  }

  function isWithinRegion1(x, y, g, th, v) {
    if (y >= (x - v) * g) {
      return p.cos(p.atan(g)) * (y - (x - v) * g) < th;
    } else {
      return p.cos(p.atan(g)) * ((x - v) * g - y) < th;
    }
  }

  p.setup = function () {
    tau = (1 + p.sqrt(5)) / 2.0;
    gr = 1 / tau;
    theta = p.atan(1 / tau);
    thick = (p.cos(theta) + p.sin(theta)) * gr;
    x_accepted = [];
    y_accepted = [];
    gradient = 2;
    versch = 0;
    (offs = 40 * 1.5), (scale = 40 * 1.5), (width = 480 * 1.5); //Faktor 12!!!
    height = 480 * 1.5;

    // (offs = 40), (scale = 60), (width = 480 * 2); //Faktor 12!!!
    // height = 570;

    regionWidth = 14;
    p.createCanvas(width, height);
    // p.background(255);
    p.background(0, 0, 0, 0);
    p.draw();
  };

  p.draw = function () {
    let val = angle;
    let val2 = thicknessIn;
    let val3 = shift;
    if (val == gradient && val2 == thickness2 && val3 == versch) {
      return;
    }
    // p.background(255);
    p.clear();
    p.background(0, 0, 0, 0);
    p.translate(0, -offs + 5);
    x_accepted = [];
    y_accepted = [];
    thickness2 = val2;
    versch = val3;
    gradient = p.tan(val);
    theta = p.atan(gradient);
    thickness = (p.cos(theta) + p.sin(theta)) * gradient;
    verticalHeight = thickness * p.sqrt(gradient ** 2 + 1);
    xs = offs;
    ys = im(offs);
    yMin = p.floor(minAccepted(0, gradient));
    yMax = p.ceil(maxAccepted(regionWidth, gradient));
    p.fill("#fae");
    // p.fill(249, 168, 212);
    p.noStroke();
    p.quad(
      xs,
      height / 2 -
        (xs - width / 2 - versch * scale) * gradient +
        (thickness2 * scale) / p.cos(val),
      xs + (width - 2 * offs),
      height / 2 -
        (xs + (width - 2 * offs) - width / 2 - versch * scale) * gradient +
        (thickness2 * scale) / p.cos(val),
      xs + (width - 2 * offs),
      height / 2 -
        (xs + (width - 2 * offs) - width / 2 - versch * scale) * gradient -
        (thickness2 * scale) / p.cos(val),
      xs,
      height / 2 -
        (xs - width / 2 - versch * scale) * gradient -
        (thickness2 * scale) / p.cos(val)
    );
    for (x = offs; x < width; x = x + scale) {
      for (y = offs; y < height; y = y + scale) {
        // p.fill(0);
        // p.stroke(0, 0, 0);
        p.fill(255);
        p.stroke(255);
        p.ellipse(x, im(y), 2, 2);
      }
    }
    for (x = -20; x <= 20; x++) {
      for (y = -20; y <= 20; y++) {
        if (isWithinRegion1(x, y, gradient, thickness2, versch)) {
          x_accepted.push(x);
          y_accepted.push(y);
        }
      }
    }
    for (i = 0; i < x_accepted.length; i++) {
      p.fill(255, 0, 0);
      p.stroke(255, 0, 0);
      p.ellipse(
        x_accepted[i] * scale + offs + width / 2 - scale,
        im(y_accepted[i] * scale + offs + height / 2 - scale),
        5,
        5
      );
      xprojec =
        x_accepted[i] +
        p.sin(val) * p.cos(val) * (y_accepted[i] - x_accepted[i] * gradient);
      deltax = p.sin(val) ** 2 * versch;
      linedash(
        x_accepted[i] * scale + offs + width / 2 - scale,
        im(y_accepted[i] * scale + offs + height / 2 - scale),
        (xprojec + deltax) * scale + offs + width / 2 - scale,
        im(
          gradient * (xprojec + deltax - versch) * scale +
            offs +
            height / 2 -
            scale
        ),
        2
      );
      p.ellipse(
        (xprojec + deltax) * scale + offs + width / 2 - scale,
        im(
          gradient * (xprojec + deltax - versch) * scale +
            offs +
            height / 2 -
            scale
        ),
        3,
        3
      );
    }
    p.line(
      xs,
      height / 2 - (xs - width / 2 - versch * scale) * gradient,
      xs + (width - 2 * offs),
      height / 2 -
        (xs + (width - 2 * offs) - width / 2 - versch * scale) * gradient
    );
    // p.fill(255);
    p.fill(30, 41, 59);
    p.noStroke();
    p.quad(0, 0, width, 0, width, offs, 0, offs);
    p.quad(
      0,
      height - offs,
      width,
      height - offs,
      width,
      height + offs,
      0,
      height + offs
    );
    p.quad(0, 0, offs, 0, offs, height, 0, height);
    p.quad(width - offs, 0, width, 0, width, height, width - offs, height);
    p.noFill();
    // p.stroke(0);
    p.stroke(255);
    p.quad(
      offs,
      offs,
      width - offs,
      offs,
      width - offs,
      height - offs,
      offs,
      height - offs
    );
    for (i = 0; i < x_accepted.length; i++) {
      xprojec =
        x_accepted[i] +
        p.sin(val) * p.cos(val) * (y_accepted[i] - x_accepted[i] * gradient);
      deltax = p.sin(val) ** 2 * versch;
      p.fill(255, 0, 0);
      p.stroke(255, 0, 0);
      p.ellipse(
        (xprojec + deltax) * scale + offs + width / 2 - scale,
        height,
        10,
        10
      );
    }
  };
}

new p5(sketch_tilings, "tilings");
