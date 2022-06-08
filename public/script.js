// p5
let video;

// ml5
let classifier_URL =
  "https://teachablemachine.withgoogle.com/models/wWMqOuK3t/";

// dom
let landingOverlay;
let onboarding;
let resultsDiv;

// dom-events
let startWritingBtn;
let gotItBtn;
let closeBtn;
let helpBtn;

window.onload = init;

//
// OVERLAYS
//

function init() {
  console.log("window loaded!");

  startWritingBtn = document.getElementById("start-writing");
  landingOverlay = document.getElementById("landing");
  closeBtn = document.getElementById("close");
  resultsDiv = document.getElementById("results");

  gotItBtn = document.getElementById("got-it");
  onboarding = document.getElementById("onboarding");
  helpBtn = document.getElementById("help");

  startWritingBtn.addEventListener("click", () => {
    landingOverlay.style.display = "none";
    document.body.requestFullscreen();
  });

  gotItBtn.addEventListener("click", () => {
    onboarding.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    landing.style.display = "flex";
    window.scrollTo(0, 0);
    document.exitFullscreen();
  });

  helpBtn.addEventListener("click", () => {
    onboarding.style.display = "flex";
  });
}

//
// OPEN AI
//

// dummy data for api call
const completions = [
  "This a dummy completion from the openAI GPT3 model",
  "This is another completion thats different from the previous one",
];
let label = "tree";

// call api on user input (timer or tap)
let data = { label, completions };
const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json", // say that it's json
  },
  body: JSON.stringify(data), // completions as a json string
};

async function write() {
  const res = await fetch("/api/test", options);
  const json = await res.json();
  console.log(json);
}

// write();

//
// CLASSIFIER (ml5)
//

// just for testing
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

function modelLoaded() {
  console.log("model loaded!");
}

function preload() {
  classifier = ml5.imageClassifier(classifier_URL, modelLoaded());
}

//
// CANVAS & MEDIASTREAM (p5)
//

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function videoReady() {
  // end loader (or inside classify)
  document.getElementById("loader").remove();
  startWritingBtn.style.display = "block";

  // start classyfing
  classifyVideo();
}

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
  video = createCapture(constraints, videoReady);
  video.hide();
}

function draw() {
  background(0);

  let x = innerHeight / video.height;
  let imageHeight = video.height * x;
  let imageWidth = video.width * x;
  let xOffset = (video.width - innerWidth) / 2;
  image(video, -xOffset, 0, imageWidth, imageHeight);
}
