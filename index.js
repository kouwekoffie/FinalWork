let video;
let flippedVideo;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/AwK6pw9qk/";

let classifier;

let label = "waiting...";

// STEP1: Load the model!
// "preload" will load any important assets (img's, datafiles, models) before the program starts in setup
function preload() {
  classifier = ml5.imageClassifier(imageModelURL);
}

// connect to the capture device
function setup() {
  let myCanvas = createCanvas(640, 480);
  myCanvas.parent("myContainer");
  // create a constraints object
  const constraints = {
    audio: false,
    video: {
      facingMode: "environment",
    },
  };
  video = createCapture(constraints);
  video.size(320, 240); // WHY DOES THIS LINE MATTER?
  video.hide();

  flippedVideo = ml5.flipImage(video);
  // STEP2: Start classifying
  classifyVideo();
}

// STEP2: classify!

function draw() {
  background(0);

  // Draw the video
  image(flippedVideo, 0, 0);
  //   line(15, 25, 70, 90);

  // STEP 4: Draw the label
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, width / 2, height - 17);
}

function classifyVideo() {
  flippedVideo = ml5.flipImage(video);
  classifier.classify(flippedVideo, gotResults);
  flippedVideo.remove();
}

// STEP3: Get the classification!
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  classifyVideo();
}

/*
Todo:
- only show label if sure
- try to deploy for mobile on github pages
*/
