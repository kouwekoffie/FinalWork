let video;
let classifier0_URL =
  "https://teachablemachine.withgoogle.com/models/JFxZNYgsn/";
let classifier1_URL =
  "https://teachablemachine.withgoogle.com/models/tP8OYUiUd/";
let classifier2_URL =
  "https://teachablemachine.withgoogle.com/models/wWMqOuK3t";
let classifier2_1_URL = "";
let classifier;

let resultsDiv;

window.onload = init;

function init() {
  resultsDiv = document.getElementById("results");
  console.log("window loaded!");
}

function modelLoaded(model) {
  console.log(model, "Loaded!");
}

// "preload" will load any important assets (img's, datafiles, models) before the program starts in setup
function preload() {
  classifier = ml5.imageClassifier(classifier1_URL, modelLoaded("classifier"));
  // could say: ml5.imageClassifer(model, video, callback)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function renderResults(results) {
  let html = `
  <p><span>${results[0].label}: ${results[0].confidence}</span></p>
  <p><span>${results[1].label}: ${results[1].confidence}</span></p>
  <p><span>${results[2].label}: ${results[2].confidence}</span></p>
  <p><span>${results[3].label}: ${results[3].confidence}</span></p>
  <p><span>${results[4].label}: ${results[4].confidence}</span></p>
  `;
  resultsDiv.innerHTML = html;
  if (results[0].confidence > 0.7) {
    resultsDiv.firstElementChild.classList.add("highConfidence");
  } else {
    resultsDiv.firstElementChild.classList.remove("highConfidence");
  }
}

function classifyVideo() {
  classifier.classify(video, (error, results) => {
    if (error) {
      console.error(error);
      return;
    }
    renderResults(results);
    classifyVideo();
  });
}

// connect to the capture device
function setup() {
  let canvas = createCanvas(innerWidth, innerHeight);
  let originParent = canvas.parent(); // reference the element thats automatically the canv parent
  canvas.parent(document.getElementById("canvasContainer"));
  originParent.remove(); // delete the original parent

  // create a constraints object
  const constraints = {
    audio: false,
    video: {
      facingMode: "environment",
    },
  };
  video = createCapture(constraints, classifyVideo);
  video.hide();
}

function draw() {
  background(0);

  // Draw the video
  image(video, 0, 0, windowWidth, windowHeight);
}
