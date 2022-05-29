let capture;

function setup() {
  createCanvas(innerWidth, innerHeight);
  capture = createCapture(VIDEO);
  capture.hide();
}

function draw() {
  image(capture, 0, 0, windowWidth, windowHeight);
  filter(INVERT);
}

function mousePressed() {
  noLoop();
}

function mouseReleased() {
  loop();
}
