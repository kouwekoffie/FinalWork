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
let test = false;
let p;

// STEP1: Load the model!
// "preload" will load any important assets (img's, datafiles, models) before the program starts in setup
function preload() {
  classifier = ml5.imageClassifier(imageModelURL);
  // could say: ml5.imageClassifer(model, video, callback)
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
  button.size(200, 100);
  button.hide();
  button.style("font-size", "30px");

  p = createP("Find some nature!");
  p.style("font-size", "30px");

  // STEP2: Start classifying
  classifyVideo();
}

function draw() {
  background(0);

  // Draw the video
  image(video, 0, 0);
  //   line(15, 25, 70, 90);

  // TODO: check if nature every classify loop or every draw loop?
  // TODO: make a switch so that button innerhtml doesn't need to change everytime
  // TODO: find nature has to be writeen
  if (isNature()) {
    drawBigLabel();
    button.html("write about " + label);
    p.hide();
  } else {
    button.hide();
    p.show();
  }

  drawLabel();
}

function drawBigLabel() {
  textSize(30);
  fill(0);
  rect(5, 30, 150, 50);
  fill(255);
  textAlign(CENTER, CENTER);
  text(label, width / 2, height - 20);

  button.show();
}

function drawLabel() {
  textSize(12);
  fill(0);
  rect(5, 30, 150, 50);
  fill(255);
  textAlign(LEFT, BOTTOM);
  text(label, 10, 50);
  text(confidence, 10, 65);
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

function isNature() {
  if (label == "background" || label == "waiting...") {
    return false;
  } else {
    return true;
  }
}

function isConfident() {
  if (confidence > 0.6) {
    return true;
  } else {
    return false;
  }
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
