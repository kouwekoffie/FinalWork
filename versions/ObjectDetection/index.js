let video;
let detector;
let detections = [];

console.log(ml5);

function preload() {
  img = loadImage("./vetkruid.jpg");
  detector = ml5.objectDetector("cocossd");
}

function drawDetections() {
  //draw bounding boxes &labels (this is not where I got the detections but it's better to put this loop in draw then in gotDetections) - the global detections variable links the two loops
  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];
    stroke(0, 255, 0);
    strokeWeight(4);
    noFill();
    rect(object.x, object.y, object.width, object.height);
    noStroke();
    fill(255);
    text(object.label, object.x + 10, object.y + 20);
  }
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  //   console.log(results);
  detections = results;
  detector.detect(video, gotDetections);
}

function detect() {
  detector.detect(video, gotDetections);
}

function setup() {
  createCanvas(640, 480);
  const constraints = {
    audio: false,
    video: {
      facingMode: "environment",
    },
  };
  video = createCapture(constraints, detect);
  video.size(640, 480); // same size as canvas
  video.hide();
}

function draw() {
  image(video, 0, 0);
  drawDetections();
}
