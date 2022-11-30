export function loadSketch(index) {
  switch (index) {
    case 0:
      import("../sketches/cut-and-project1D").then(
        console.log("cut-and-project1D-loaded")
      );
      break;
    case 1:
      import("../sketches/cut-and-project2D").then(
        console.log("cut-and-project2D-loaded")
      );
      break;
    default:
    // nop
  }
}
