let video;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/AwK6pw9qk/";
let classifier;
let rnn;
let label = "waiting...";
let button;
let confidence;
let seed;
let genText;

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
  video.hide();

  button = createButton("write");
  button.mousePressed(write);

  // STEP2: Start classifying
  classifyVideo();
}

// STEP2: classify!

function draw() {
  background(0);

  // Draw the video
  image(video, 0, 0);
  //   line(15, 25, 70, 90);

  // STEP 4: Draw the label
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, width / 2, height - 17);
  // To see if github pages updated:
}

function classifyVideo() {
  classifier.classify(video, gotResults);
}

function write() {
  seed = label;

  rnn.generate(
    {
      seed: seed,
      length: 50,
      temperature: 0.5,
    },
    (err, results) => {
      renderText(seed, results.sample);
    }
  );
}

function renderText(seed, genText) {
  let p = createP(seed + "" + genText);
  p.style("font-size", "16px");
}

// STEP3: Get the classification!
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  confidence = results[0].confidence;
  classifyVideo();
}

/*
Todo:
- only show label if sure
- try to deploy for mobile on github pages
*/
