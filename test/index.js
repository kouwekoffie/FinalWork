let capture;
let canvas;

window.onload = init;

function init() {
  let requestFullScreen = document.getElementById("requestFullScreen");
  let exitFullScreen = document.getElementById("exitFullScreen");
  requestFullScreen.addEventListener(
    "click",
    function () {
      document.body.requestFullscreen();
    },
    false
  );
  exitFullScreen.addEventListener(
    "click",
    function () {
      document.exitFullscreen();
    },
    false
  );
}

const constraints = {
  audio: false,
  video: {
    facingMode: "environment",
  },
};

function mousePressed() {
  noLoop();
}

function mouseReleased() {
  loop();
}

function setup() {
  let myCanvas = createCanvas(innerWidth, innerHeight);
  myCanvas.parent("container");
  capture = createCapture(constraints);
  capture.hide();

  canvas = document.getElementById("defaultCanvas0");
}

function draw() {
  let x = innerHeight / capture.height;
  let imageHeight = capture.height * x;
  let imageWidth = capture.width * x;

  let xOffset = (capture.width - innerWidth) / 2;
  image(capture, -xOffset, 0, imageWidth, imageHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
