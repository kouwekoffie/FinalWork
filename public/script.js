//IDB
let db;
let dbIsPopulated = false;
let openRequest;

// prompt
let writePromptDelay = 3;
let userPrompted = false;

// stories & write navigation
let classifying = true;
let firstResult = true;

// mediastreamrender
let video;
let canvas;
let context;
let constraints = {
  audio: false,
  video: { facingMode: { ideal: "environment" } },
};

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
let header;

// dom-events
let startWritingBtn;
let gotItBtn;
let closeBtn;
let helpBtn;
let toStoriesBtn;

//
// OVERLAYS
//

function init() {
  console.log("window loaded!");

  //
  // IDB
  //

  openRequest = window.indexedDB.open("snaps", 1);
  // open the database, create one when it doesn't exist yet
  openDb();
  //Set up the database tables if this has not already been done
  setupDBTables();

  //
  // DOM
  //

  // grab reference to all elements
  getDomElements();
  //navigation
  handleNavigation();

  console.log(video.readyState, video.HAVE_ENOUGH_DATA);

  //
  // ASYNC STREAM AND CLASSIFIER
  //

  // render stream
  setCanvasSize();
  // getStream();
  const getStream = navigator.mediaDevices.getUserMedia(constraints);
  const getClassifier = ml5.imageClassifier(classifier_URL);

  // wait for both the stream and the classifier to load
  Promise.all([getStream, getClassifier]).then((values) => {
    stream = values[0];
    video.srcObject = stream;

    classifier = values[1];
    console.log("model and stream loaded");
    classifyVideo();
  });

  // render media stream on the canvas
  requestAnimationFrame(renderFrame);

  //
  // stories page navigation (horizontal slide)
  //

  slides.forEach((slide, index) => {
    // Touch events
    slide.addEventListener("touchstart", touchStart(index));
    slide.addEventListener("touchend", touchEnd);
    slide.addEventListener("touchmove", touchMove);
  });

  //
  // TEST
  //
  // testSliderContainer();
}

//
// stories page navigation (horizontal slide)
//

// stories page navigation
let slider;
let slides;

let isDragging = false,
  startPos = 0,
  currentTranslate = 0,
  prevTranslate = 0,
  animationID = 0,
  currentIndex = 0;

function touchStart(index) {
  // TODO: understand this return functino inside
  // takes in de index of the slide as an argument
  // so return another functin that takes in the event object
  return function (event) {
    currentIndex = index;
    startPos = getPositionX(event);
    isDragging = true;

    // tell the browser we want to perform an animation
    // and request a call to a specific f. to update that
    // animation before the next repaint
    // Here the translateX value is animated
    // It returns an animatinoId wchich we can use later on
    // to end the animation frame in touchEnd()
    // - takes in a function and call it inside recursively
    animationID = requestAnimationFrame(animation);
    slider.classList.add("grabbing");
  };
}

function touchEnd() {
  isDragging = false;
  cancelAnimationFrame(animationID);

  const movedBy = currentTranslate - prevTranslate;
  // if slided more then x go to next/prev slide
  if (movedBy < -100 && currentIndex < slides.length - 1) currentIndex += 1;
  if (movedBy > 100 && currentIndex > 0) currentIndex -= 1;

  setPositionByIndex();
  slider.classList.remove("grabbing");
}

function touchMove(event) {
  if (isDragging) {
    const currentPosition = getPositionX(event);
    currentTranslate = prevTranslate + currentPosition - startPos;
  }
}

function getPositionX(event) {
  return event.touches[0].clientX;
}

function animation() {
  setSliderPosition();
  if (isDragging) requestAnimationFrame(animation);
}

function setSliderPosition() {
  slider.style.transform = `translateX(${currentTranslate}px)`;
}

function setPositionByIndex() {
  // shift the entire innerWidth of the window
  currentTranslate =
    // currentIndex * -(window.innerWidth * 0.84 - 0.02 * window.innerWidth);
    currentIndex * (-window.innerWidth * 0.85);
  setSliderPosition;
  prevTranslate = currentTranslate;
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

/*
const captureFrame = new Promise((resolve, reject) => {
  canvas = document.getElementById("canvas");
  canvas.toBlob((blob) => {
    resolve(blob);
  });
});
*/

// is called when user holds his camera still in front of nature
// and the same classification is done over and over
// (long enough for the progress-transition to finish)
function userPrompt() {
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

// TODO: how to get renderFloatingButton() out of checkDB?
function renderFloatingButton() {
  toStoriesBtn.style.display = "flex";
}

function renderIsWriting() {
  // render tooltip
  let text = `Writing...`;
  tooltipText.innerText = text;
  // animation?
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
  // This adds a transition class to tooltips child,
  // when the transition ends userPrompt is called
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

function endLoader() {
  document.getElementById("loader").remove();
  startWritingBtn.style.display = "block";
  firstResult = false;
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

function updateClassificationVariables(results) {
  predictions = results;
  label = results[0].label;
  confidence = results[0].confidence;
}

function classifyVideo() {
  classifier.classify(video, (error, results) => {
    if (!classifying) {
      classifying = true;
      console.log("Stop classifying");
      return;
    }

    // end loader on landing page
    if (firstResult) endLoader();

    if (error) {
      console.error(error);
      return;
    }

    updateClassificationVariables(results);

    // TODO: add some logic so that it doesn't update dom every classification but only when changed
    // if nature is classified update state of UI
    if (isNature() && isConfident()) {
      renderFoundNature();
    } else {
      renderNoNature();
    }

    // recursive
    classifyVideo();
  });
}

//
//
//
// DOM
//
//
//

function getDomElements() {
  landingOverlay = document.getElementById("landing");
  predictionsContainer = document.getElementById("results");
  reticle = document.getElementById("reticle");
  labelContainer = document.getElementById("label-container");
  tooltip = document.getElementById("tooltip");
  tooltipText = document.getElementById("tooltip-text");
  progress = document.getElementById("progress");
  onboarding = document.getElementById("onboarding");
  stories = document.getElementById("stories");
  canvas = document.getElementById("canvas");
  video = document.getElementById("video");
  context = canvas.getContext("2d");
  slider = document.getElementById("slider-container");
  slides = Array.from(document.getElementsByClassName("slide"));
  header = document.getElementById("header");
  shareBtns = Array.from(document.getElementsByClassName("share-button"));

  startWritingBtn = document.getElementById("start-writing");
  closeBtn = document.getElementById("close");
  gotItBtn = document.getElementById("got-it");
  helpBtn = document.getElementById("help");
  toStoriesBtn = document.getElementById("to-stories");
  toWrite = document.getElementById("to-write");
}

//
// DOM USER NAV
//
function handleNavigation() {
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
    header.classList.remove("blurred");
  });

  toWrite.addEventListener("click", () => {
    //start classifying again
    classifyVideo();
    stories.style.display = "none";
    header.classList.add("blurred");
  });

  // user decides to write
  progress.addEventListener("transitionend", () => {
    userPrompt();
  });

  shareBtns.forEach((shareBtn, index) => {
    // get frame + text from IDB (based on index)
    // make a sinlge png format (maybe based on which btn is pressed; -fb -insta)
    // OR make the format when save to db in the first place
    // OR just get the image from the html...
    /*
    const blob = `firstChild.style.background-url`;
    const filesArray = [
      new File([blob], "frame.jpg", {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      }),
    ];
    */
    const shareData = {
      title: "WORDS FOR NATURE",
      text: `firstChild.firstchild.firstchild.innerText`,
      url: "link to the app",
      // files: filesArray,
    };
    shareBtn.addEventListener("click", async () => {
      try {
        await navigator.share(shareData);
        // TODO: show reuslt in app
        // resultPara.textContent = "WORDS FOR NATURE shared succesfully";
      } catch (err) {
        // resultPara.textContent = "Error: " + err;
      }
    });
  });
}

//
// CANVAS & MEDIASTREAM
//

// stretch canvas to windowSize
function setCanvasSize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

// TODO: read about requestanimation frame
function renderFrame() {
  requestAnimationFrame(renderFrame);
  // scale video to window size and position on the canvas
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    let scale = video.videoHeight / innerHeight;
    let sWidth = scale * innerWidth;
    let sHeight = video.videoHeight;
    let sx = 0.5 * (video.videoWidth - sWidth);
    let sy = 0;
    let dWidth = innerWidth;
    let dHeight = innerHeight;
    let dx = 0;
    let dy = 0;

    // draw it to the canvas
    context.drawImage(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
}

//
//
//
// IDB
//
//
//

function openDb() {
  openRequest.addEventListener("error", () =>
    console.error("Database failed to open")
  );

  openRequest.addEventListener("success", () => {
    console.log("Database opened successfully");
    db = openRequest.result;
    // displayData(); // I cant show the old snaps before the new one loads in
    checkDB();
  });
}

//Set up the database tables if this has not already been done
function setupDBTables() {
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
}

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

//
//
//
// START
//
//
//

window.onresize = setCanvasSize;
window.onload = init;

//
//
//
// TEST
//
//
//

function testSliderContainer() {
  stories.style.display = "flex";
  landing.style.display = "none";
  onboarding.style.display = "none";
}
