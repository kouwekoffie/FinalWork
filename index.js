let video;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/vj8tR7OQK/";
let classifier;
let rnn;
let label = "waiting...";
let button;
let confidence;
let seed;
let genText;
let textCounter = 0;

// STEP1: Load the model!
// "preload" will load any important assets (img's, datafiles, models) before the program starts in setup
function preload() {
  classifier = ml5.imageClassifier(imageModelURL);
  rnn = ml5.charRNN(
    "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/charRNN/darwin/",
    modelLoaded
  );
}

function modelLoaded() {
  console.log("Model Loaded!");
}

// connect to the capture device
function setup() {
  createCanvas(displayWidth, (2 * displayHeight) / 3);

  // create a constraints object
  const constraints = {
    audio: false,
    video: {
      facingMode: "environment",
    },
  };
  video = createCapture(constraints);
  video.hide();

  button = createButton("write");
  button.mousePressed(write);
  console.log(button);
  button.size(200, 100);

  // STEP2: Start classifying
  classifyVideo();
  console.log("setup() done");
}

function draw() {
  if (frameCount == 1) {
    console.log("draw() starts");
  }

  background(0);

  // Draw the video
  image(video, 0, 0);
  //   line(15, 25, 70, 90);

  if (confidence > 0.6) {
    drawLabel();
  }

  // To see if github pages updated:
}

function drawLabel() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, width / 2, height - 17);
  text(confidence, width / 2, height - 50);
}

function classifyVideo() {
  classifier.classify(video, gotResults);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  confidence = results[0].confidence;
  classifyVideo();
}

function write() {
  textCounter++;

  seed = label;

  renderLoadingText();

  rnn.generate(
    {
      seed: seed,
      length: 50,
      temperature: 0.5,
    },
    (err, results) => {
      renderGenText(seed, results.sample);
    }
  );
}

function renderLoadingText() {
  let p = createP(seed + " ... ");
  p.id("text" + textCounter);
}

function renderGenText(seed, genText) {
  let p = select(`#text${textCounter}`);
  p.style("font-size", "16px");
  p.html(seed + " " + genText);
}
/*
Todo:
- only show label if sure
- try to deploy for mobile on github pages
*/
