let video;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/JFxZNYgsn/";
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

function modelLoaded(model) {
  console.log(model, "Loaded!");
}

// "preload" will load any important assets (img's, datafiles, models) before the program starts in setup
async function preload() {
  classifier = ml5.imageClassifier(imageModelURL, modelLoaded("classifier"));
  console.log(classifier);
  // could say: ml5.imageClassifer(model, video, callback)
  rnn = ml5.charRNN(
    "https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/charRNN/darwin/",
    modelLoaded("rnn")
  );
}

// connect to the capture device
function setup() {
  createCanvas(windowWidth, windowHeight);

  // create a constraints object
  const constraints = {
    audio: false,
    video: {
      facingMode: "environment",
    },
  };
  video = createCapture(constraints, classifyVideo);
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

// let lastClassifyTime;

function classifyVideo() {
  // console.log("classify_start", millis() * 0.001);
  classifier.classify(video, gotResults);
  // console.log("classifyTime (s): ", 0.001 * (millis() - lastClassifyTime));
  // lastClassifyTime = millis();
}

function gotResults(error, results) {
  // console.log("classify_end", millis() * 0.001);

  if (error) {
    console.error(error);
    return;
  }

  label = results[0].label;
  confidence = results[0].confidence;

  classifyVideo();
}

// async attempt 2
/*
let lastClassifyTime;

function classifyVideo() {
  return new Promise((resolve) => {
    classifier.classify(video, (error, results) => {
      if (error) {
        console.error(error);
        return;
      }
      resolve(results);
    });
  });
}

async function classifyLoop() {
  while (true) {
    //classify
    console.log("start class");
    const results = await classifyVideo();
    console.log("end class");
  }
}

*/

// try with async await to see if it doesn't stop the draw block
/*
function classifyVideo() {
  return new Promise((resolve) => {
    classifier.classify(video, (error, results) => {
      if (error) {
        console.error(error);
        return;
      }
      resolve(results);
    });
  });
}

async function callClassifier() {
  console.log("test");
  const results = await classifyVideo();
  console.log(results);
  label = results[0].label;
  confidence = results[0].confidence;
  callClassifier();
}
*/

// tf lite
/*
function classifyVideo() {
  const inputTensor = tf.image
    // Resize.
    .resizeBilinear(
      tf.browser.fromPixels(document.querySelector("img")),
      [224, 224]
    )
    // Normalize.
    .expandDims()
    .div(127.5)
    .sub(1);

  console.log(inputTensor);
}

*/

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

// let lastRenderTime;

function draw() {
  console.log("render_start", millis() * 0.001);
  // console.log("renderTime (s): ", 0.001 * (millis() - lastRenderTime));
  // lastRenderTime = millis();

  background(0);

  // Draw the video
  image(video, 0, 0, windowWidth, windowHeight);
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
  console.log("render_end", millis() * 0.001);
}
