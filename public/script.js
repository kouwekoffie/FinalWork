//IDB
let db;
let dbIsPopulated = false;

// prompt
let writePromptDelay = 3;
let userPrompted = false;

// stories & write navigation
let classifying = true;

// p5
let video;
let canvas;

// ml5
let classifier_URL =
  "https://teachablemachine.withgoogle.com/models/wWMqOuK3t/";
let predictions;
let label;
let confidence;
let confidenceTreshold = 0.9;

// dom
let landingOverlay;
let onboarding;
let predictionsContainer;
let reticle;
let labelContainer;
let tooltip;
let tooltipText;
let progress;
let stories;

// dom-events
let startWritingBtn;
let gotItBtn;
let closeBtn;
let helpBtn;
let toStoriesBtn;

window.onload = init;

function addSnap(frame, text) {
  const newSnap = {
    frame: frame,
    text: text,
  };

  console.log(newSnap);

  // open a read/write db transaction, ready for adding the data
  const transaction = db.transaction(["snaps_os"], "readwrite");

  // call an object store that's already been added to the database
  const objectStore = transaction.objectStore("snaps_os");

  // Make a request to add our newItem object to the object store
  const addRequest = objectStore.add(newSnap);

  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");

    // TODO: show stories
  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
}

//
// OVERLAYS
//

function checkDB() {
  let transaction = db.transaction(["snaps_os"], "readonly");
  let objectStore = transaction.objectStore("snaps_os");

  let countRequest = objectStore.count();
  // TODO promisify (https://stackoverflow.com/questions/22519784/how-do-i-convert-an-existing-callback-api-to-promises);
  countRequest.onsuccess = function () {
    console.log("countRequest: ", countRequest.result);
    if (countRequest.result > 0) renderFloatingButton();
  };
}

function init() {
  console.log("window loaded!");

  //
  // IDB
  //
  // open the database, create one when it doesn't exist yet
  const openRequest = window.indexedDB.open("snaps", 1);

  openRequest.addEventListener("error", () =>
    console.error("Database failed to open")
  );

  openRequest.addEventListener("success", () => {
    console.log("Database opened successfully");
    db = openRequest.result;
    // displayData(); // I cant show the old snaps before the new one loads in
    checkDB();
  });

  //Set up the database tables if this has not already been done
  openRequest.addEventListener("upgradeneeded", (e) => {
    db = e.target.result; // seperate bc this event runs faster then succes

    //create an objectStore (like a table)
    //with an id keyfield
    const objectStore = db.createObjectStore("snaps_os", {
      keyPath: "id",
      autoIncrement: true,
    });

    /* Define the db scheme: each record will hold:
  {
    frame: "base64string",
    text: "openai generated text",
    id: 8
  }
  */
    objectStore.createIndex("frame", "frame", { unique: false });
    objectStore.createIndex("text", "text", { unique: false });

    console.log("Database setup complete");
  });

  landingOverlay = document.getElementById("landing");
  predictionsContainer = document.getElementById("results");
  reticle = document.getElementById("reticle");
  labelContainer = document.getElementById("label-container");
  tooltip = document.getElementById("tooltip");
  tooltipText = document.getElementById("tooltip-text");
  progress = document.getElementById("progress");
  onboarding = document.getElementById("onboarding");
  stories = document.getElementById("stories");

  startWritingBtn = document.getElementById("start-writing");
  closeBtn = document.getElementById("close");
  gotItBtn = document.getElementById("got-it");
  helpBtn = document.getElementById("help");
  toStoriesBtn = document.getElementById("to-stories");
  toWrite = document.getElementById("to-write");

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

  toStoriesBtn.addEventListener("click", () => {
    classifying = false;
    stories.style.display = "flex";
  });

  toWrite.addEventListener("click", () => {
    //start classifying again
    classifyVideo();
    stories.style.display = "none";
  });

  // user decides to write
  progress.addEventListener("transitionend", () => {
    userPrompt();
  });
}

//
// OPEN AI
//

/*
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

*/

//
// UPDATE DOM
//

function renderFloatingButton() {
  toStoriesBtn.style.display = "flex";
}

// loader
let firstResult = true;

function endLoader() {
  document.getElementById("loader").remove();
  startWritingBtn.style.display = "block";
}

function renderIsWriting() {
  // render tooltip
  let text = `Writing...`;
  tooltipText.innerText = text;
  // animation?
}
/*
scope problem with p5 saveFrames is not defined in the promise block
const captureFrame = new Promise((resolve, reject) => {
  saveFrames("out", "png", 1, 1, (data) => {
    // async call language model
    text = "dummy text";
    addSnap();

    frame = data[0].imageData;
    // frame = JSON.stringify(data[0].imageData);
    resolve(frame);
  });
});
*/
/*
also scope problem
function captureFrame(myCallback) {
  saveFrames("out", "png", 1, 1, (data) => {
    frame = data[0].imageData;
    // frame = JSON.stringify(data[0].imageData);
    myCallback(frame);
  });
}
*/

const captureFrame = new Promise((resolve, reject) => {
  canvas = document.getElementById("canvas");
  canvas.toBlob((blob) => {
    resolve(blob);
  });
});

async function userPrompt() {
  let frame;
  let text;

  console.log("user prompt");
  // stop classyfing
  classifying = false;
  // save frame
  // TODO: show the snap already like in the stories page?
  captureFrame.then(console.log(blob));
  // stop p5 write
  noLoop();
  // renderIsWriting
  renderIsWriting();

  //TODO: async call language model

  //TODO: make promises or callback so capturing frame and calling proxyserver and adding snap can be nicely handled before navigating to other page
  // addSnap() should be here in the code on this level and not in the captureFrame() function
}

function renderFoundNature() {
  let html;

  // label
  html = `<span>${label}</span>`;
  labelContainer.innerHTML = html;

  //tooltip
  let text = `Hold still to write`;
  tooltipText.innerText = text;

  //reticle
  reticle.classList.add("reticle-close");

  //if class is not added yet
  //tooltip-progress
  if (!progress.classList.contains("progress-load")) {
    progress.classList.add("progress-load");
  }
}

// TODO: make a lookup tables for elements and their states so this can be a cleaner function (if both were with innerhtml)
function renderNoNature() {
  let html;

  // label
  html = `<img src="./images/ellipsis.svg" alt="">`;
  labelContainer.innerHTML = html;

  //tooltip
  let text = `Point your camera to nature`;
  tooltipText.innerText = text;

  //reticle
  reticle.classList.remove("reticle-close");

  //tooltip-progress
  progress.classList.remove("progress-load");
}

function isNature() {
  if (label !== "background" && label !== null) {
    return true;
  } else {
    return false;
  }
}

function isConfident() {
  if (confidence > confidenceTreshold) {
    return true;
  } else {
    return false;
  }
}

// for testing
function renderResults() {
  let html = `
  <p><span>${predictions[0].label}: ${predictions[0].confidence}</span></p>
  <p><span>${predictions[1].label}: ${predictions[1].confidence}</span></p>
  <p><span>${predictions[2].label}: ${predictions[2].confidence}</span></p>
  <p><span>${predictions[3].label}: ${predictions[3].confidence}</span></p>
  <p><span>${predictions[4].label}: ${predictions[4].confidence}</span></p>
  `;
  predictionsContainer.innerHTML = html;
  if (predictions[0].confidence > 0.7) {
    predictionsContainer.firstElementChild.classList.add("highConfidence");
  } else {
    predictionsContainer.firstElementChild.classList.remove("highConfidence");
  }
}

//
// CLASSIFIER (ml5)
//

function classifyVideo() {
  classifier.classify(video, (error, results) => {
    if (!classifying) {
      classifying = true;
      console.log("stop classifying");
      return;
    }

    // end loader on landing page
    if (firstResult) endLoader();
    firstResult = false;

    if (error) {
      console.error(error);
      return;
    }

    // update classificatino variables
    predictions = results;
    label = results[0].label;
    confidence = results[0].confidence;

    // if changed change dom
    // TODO: add some logic so that it doesn't update dom every classification but only when changed
    if (isNature() && isConfident()) {
      renderFoundNature();
    } else {
      renderNoNature();
    }

    // renderResults();
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

function setup() {
  canvas = createCanvas(innerWidth, innerHeight);
  canvas.id("canvas");
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
  console.log("setup completed");
}

function draw() {
  background(0);

  let x = innerHeight / video.height;
  let imageHeight = video.height * x;
  let imageWidth = video.width * x;
  let xOffset = (video.width - innerWidth) / 2;
  image(video, -xOffset, 0, imageWidth, imageHeight);
}
