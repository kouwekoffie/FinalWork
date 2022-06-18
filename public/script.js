//IDB
let db;
let openRequest;

//AI PROXY
// let API_endpoint = "/api/test";
let API_endpoint = "/api";

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
let canvasStreamAnimationID;

// ml5
// let classifier_URL = "https://teachablemachine.withgoogle.comn/models/ap4x9W720/";
// classifier
// let classifier_URL = "https://teachablemachine.withgoogle.com/models/foWpFDh0o/";
let classifier_URL = "./src/natureClassifier4/model.json";
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
  // DOM
  //

  // grab reference to all elements
  getDomElements();
  //navigation
  handleNavigation();

  //
  // IDB
  //

  openRequest = window.indexedDB.open("snaps", 1);
  // open the database, create one when it doesn't exist yet

  openDb()
    .then(() => {
      return dbIsPopulated();
    })
    .then((dbIsPopulated) => {
      console.log("Is db populated: ", dbIsPopulated);
      if (dbIsPopulated) {
        renderToStoriesButton();
        //render slides html read from IDB
        return displayStories();
      }
    })
    .then(() => {
      // DOM MANIPULATION:
      // grab reference to the new slides created in displayStories
      // add slider navigation to the slides
      addSlideBehaviour();
      // grab reference to the new share buttons created in displayStories
      // add share behaviour to the buttons in the slides
      addShareBehaviour();
    });

  //Set up the database tables if this has not already been done
  setupDBTables();

  //
  // ASYNC STREAM AND CLASSIFIER
  //

  // render stream
  setCanvasSize();
  const getStream = navigator.mediaDevices.getUserMedia(constraints);
  const getClassifier = ml5.imageClassifier(classifier_URL);

  // wait for both the stream and the classifier to load
  // then classify the stream
  Promise.all([getStream, getClassifier]).then((values) => {
    console.log("model and stream loaded");

    stream = values[0];
    classifier = values[1];

    // once the stream from device camera is loaded start rendering it recursively to the canvas
    video.srcObject = stream;
    // classifyVideo();
    // TODO: renderframe zou op hetzelfde level moeten staan als classifyvideo ipv in classifyvideo te callen

    // show the startButton
    // start button begins the stream render animation and classification
    endLoader();
  });

  // render media stream on the canvas

  //
  // TEST
  //
  // testSliderContainer();
}

// write();

//////////////////
//////////////////
//////////////////
////////////////// DOM
//////////////////
//////////////////
//////////////////

//
//
// STORIES
//
//

// show camera-feed
function renderCameraFeed() {
  // update dom
  stories.style.display = "none";
  header.classList.add("blurred");
  //start rendering the stream again
  renderFrame();
}

// show stories
function renderStoriesPage() {
  stories.style.display = "flex";
  header.classList.remove("blurred");
}

//
//
// stories slider
//
//

let slider;
let slides;

let isDragging = false,
  startPos = 0,
  currentTranslate = 0,
  prevTranslate = 0,
  sliderAnimationID = 0,
  currentIndex = 0;

function addSlideBehaviour() {
  // grab reference to the new slides created in displayStories
  slides = Array.from(document.getElementsByClassName("slide"));
  // add slider navigation to the slides
  slides.forEach((slide, index) => {
    // Touch events
    slide.addEventListener("touchstart", touchStart(index));
    slide.addEventListener("touchend", touchEnd);
    slide.addEventListener("touchmove", touchMove);
  });
}

function addShareBehaviour() {
  // grab reference to the new share buttons created in displayStories
  shareBtns = Array.from(document.getElementsByClassName("share-button"));
  // add share behaviour to the buttons in the slides
  shareBtns.forEach((shareBtn, index) => {
    // get frame + text from IDB (based on index)
    // make a sinlge png format (maybe based on which btn is pressed; -fb -insta)
    // OR make the format when save to db in the first place
    // OR just get the image from the html...

    // const blob = `firstChild.style.background-url`;
    // const filesArray = [
    //   new File([blob], "frame.jpg", {
    //     type: "image/jpeg",
    //     lastModified: new Date().getTime(),
    //   }),
    // ];

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
    sliderAnimationID = requestAnimationFrame(animation);
    slider.classList.add("grabbing");
  };
}

function touchEnd() {
  isDragging = false;
  cancelAnimationFrame(sliderAnimationID);

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

// TODO: how to get renderFloatingButton() out of checkDB?
function renderToStoriesButton() {
  toStoriesBtn.classList.remove("hidden");
}

//
//
// camera-feed/classifier UI states
//
//

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
  html = `<img src="./src/images/ellipsis.svg" alt="">`;
  labelContainer.innerHTML = html;

  //tooltip
  let text = `Point your camera to nature`;
  tooltipText.innerText = text;

  //reticle
  reticle.classList.remove("reticle-close");

  //tooltip-progress
  progress.classList.remove("progress-load");
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

//
//
// GRAB DOM ELEMENTS
//
//
// TODO: declare these at the lines where I'm working with the variables

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
  header = document.getElementById("header");
  slider = document.getElementById("slider-container");

  startWritingBtn = document.getElementById("start-writing");
  closeBtn = document.getElementById("close");
  gotItBtn = document.getElementById("got-it");
  helpBtn = document.getElementById("help");
  toStoriesBtn = document.getElementById("to-stories");
  toWrite = document.getElementById("to-write");
}

//
//
// NAVIGATION
//
//

function handleNavigation() {
  startWritingBtn.addEventListener("click", () => {
    classifyVideo();
    renderCameraFeed();
    landingOverlay.style.display = "none";
    document.body.requestFullscreen();
  });

  gotItBtn.addEventListener("click", () => {
    onboarding.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    classifying = false;
    landing.style.display = "flex";
    window.scrollTo(0, 0);
    document.exitFullscreen();
  });

  helpBtn.addEventListener("click", () => {
    onboarding.style.display = "flex";
  });

  toStoriesBtn.addEventListener("click", () => {
    classifying = false;
    renderStoriesPage();
    // stop animationframe
    // cancelAnimationFrame(canvasStreamAnimationID);
  });

  toWrite.addEventListener("click", () => {
    // render camera-feed/classifier UI noNature state
    renderNoNature();
    //start classifying again
    classifyVideo();
    // if its the first time going out of stories show the button to come back
    if (toStoriesBtn.classList.contains("hidden")) renderToStoriesButton();

    renderCameraFeed();
  });

  // user decides to write
  progress.addEventListener("transitionend", () => {
    userPrompt();
  });
}

//////////////////
//////////////////
//////////////////
////////////////// REQUEST STORY
//////////////////
//////////////////
//////////////////

// So I declare it in a function which executes only when called
// again the solution with returning functions inside function
function captureFrame(canvas) {
  return new Promise((resolve, reject) => {
    // save canvas to a blob file
    canvas.toBlob((blob) => {
      // base 64 encode the blob
      let reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function () {
        let url = reader.result;
        resolve(url);
      };
    });
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
*/

function callAIProxy(label) {
  // TODO: save previous completions in localstorage so that they are taken into
  // acount when the user uses the app the next time

  /*
  const story = [
    "This a dummy completion from the openAI GPT3 model",
    "This is another completion thats different from the previous one",
  ];
  */

  // call api on user input (timer or tap)
  // let data = { label, story };
  let data = { label };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // say that it's json
    },
    body: JSON.stringify(data), // completions as a json string
  };

  return new Promise((resolve) => {
    fetch(API_endpoint, options)
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        resolve(json.choices[0].text);
      });
  });
}

// is called when user holds his camera still in front of nature
// and the same classification is done over and classifyingover
// (long enough for the progress-transition to finish)
async function userPrompt() {
  console.log("user prompt");

  cancelAnimationFrame(canvasStreamAnimationID);
  // TODO: do I have to declarce the functions in these variables?
  let getFrame = captureFrame(canvas);
  let getText = callAIProxy(label);

  // stop classyfing
  classifying = false;

  // stop animationframe

  // renderIsWriting
  renderIsWriting();

  // wait for frame and text load
  // then wait for frame and text to upload to db
  // then wait for db read and html creation
  // then add stories js slider navigation & share button listeners
  // then show the stories page
  Promise.all([getFrame, getText])
    .then((values) => {
      const newSnap = {
        frame: values[0],
        text: values[1],
      };
      console.log("frame and text loaded");
      return newSnap;
    })
    .then((newSnap) => addToDB(newSnap))
    .then(() => {
      // load in the html injected with db data on the story page
      return displayStories();
    })
    .then(() => {
      // grab reference to the new slides created in displayStories
      // add slider navigation to the slides
      addSlideBehaviour();
      // grab reference to the new share buttons created in displayStories
      // add share behaviour to the buttons in the slides
      addShareBehaviour();
      // show storie page
      renderStoriesPage();
    });
}

//////////////////
//////////////////
//////////////////
////////////////// CLASSIFIER LOGIC
//////////////////
//////////////////
//////////////////

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

    // // end loader on landing page
    // if (firstResult) endLoader();

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

//////////////////
//////////////////
//////////////////
////////////////// MEDIASTREAM & CANVAS RENDER
//////////////////
//////////////////
//////////////////

// stretch canvas to windowSize
function setCanvasSize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

// TODO: read about requestanimation frame
function renderFrame() {
  canvasStreamAnimationID = requestAnimationFrame(renderFrame);
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

//////////////////
//////////////////
//////////////////
////////////////// IDB
//////////////////
//////////////////
//////////////////

function openDb() {
  return new Promise((resolve) => {
    openRequest.addEventListener("error", () =>
      console.error("Database failed to open")
    );

    openRequest.addEventListener("success", () => {
      console.log("Database opened successfully");
      db = openRequest.result;
      resolve();
    });
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

function addToDB(newSnap) {
  // const newSnap = {
  //   frame: frame,
  //   text: text,
  // };

  return new Promise((resolve, reject) => {
    // open a read/write db transaction, ready for adding the data
    const transaction = db.transaction(["snaps_os"], "readwrite");

    // call an object store that's already been added to the database
    const objectStore = transaction.objectStore("snaps_os");

    // Make a request to add our newItem object to the object store
    const addRequest = objectStore.add(newSnap);

    transaction.addEventListener("complete", () => {
      console.log("Transaction completed: database modification finished.");
      resolve();
    });

    transaction.addEventListener("error", () =>
      console.log("Transaction not opened due to error")
    );
  });
}

function dbIsPopulated() {
  return new Promise((resolve) => {
    let transaction = db.transaction(["snaps_os"], "readonly");
    let objectStore = transaction.objectStore("snaps_os");

    let countRequest = objectStore.count();

    countRequest.onsuccess = function () {
      if (countRequest.result > 0) resolve(true);
      else resolve(false);
    };
  });
}

// iterate through all the stories in IDB and insert in html stories page
function displayStories() {
  return new Promise((resolve) => {
    // delete previoushtml
    slider.innerHTML = "";

    // Open object store and then get a cursor - which iterates through all the
    // different data items in the store
    const objectStore = db.transaction("snaps_os").objectStore("snaps_os");
    objectStore.openCursor(null, "prev").addEventListener("success", (e) => {
      // Get a reference to the cursor
      const cursor = e.target.result;

      // If there is still another data item to iterate through, keep running this code
      if (cursor) {
        let text = cursor.value.text;
        let url = cursor.value.frame;
        url = url.split(",")[1];

        let htmlString = `
          <div class="slide slide-size" style="background-image: url(data:image/octet-stream;base64,${url});">
                <div class="frame">
                  <div class="text-background">
                    <p class="generated-text">${text}</p>
                  </div>
                  <div type="button" class="share-button">
                    <span class="material-symbols-outlined material-symbols-filled size-36">
                    share
                    </span>
                  </div>
                </div>
              </div>
          `;

        slider.insertAdjacentHTML("beforeend", htmlString);

        cursor.continue(); // Iterate to the next item in the cursor
      } else {
        // if there are no more cursor items to iterate through, say so
        console.log("Read all entries from IDB and inserted html!");
        resolve();
      }
    });
    objectStore
      .openCursor()
      .addEventListener("error", () => console.log("openCursor error"));
  });
}

function displayLastStory() {
  // delete previoushtml
  slider.innerHTML = "";
  console.log("slider innerhtml deleted");

  const objectStore = db.transaction("snaps_os").objectStore("snaps_os");
  objectStore.openCursor(null, "prev").addEventListener("success", (e) => {
    const cursor = e.target.result;

    if (cursor) {
      console.log("read from IDB: ", cursor.value);
      let text = cursor.value.text;
      let url = cursor.value.frame;
      url = url.split(",")[1];

      let htmlString = `
        <div class="slide slide-size" style="background-image: url(data:image/octet-stream;base64,${url});">
              <div class="frame">
                <div class="text-background">
                  <p class="generated-text">${text}</p>
                </div>
                <div type="button" class="share-button">
                  <span class="material-symbols-outlined material-symbols-filled size-36">
                  share
                  </span>
                </div>
              </div>
            </div>
        `;

      slider.insertAdjacentHTML("beforeend", htmlString);
    } else {
    }
  });
  objectStore
    .openCursor()
    .addEventListener("error", () => console.log("openCursor error"));
}

//////////////////
//////////////////
//////////////////
////////////////// START
//////////////////
//////////////////
//////////////////

window.onresize = setCanvasSize;
window.onload = init;

//////////////////
//////////////////
//////////////////
////////////////// TEST
//////////////////
//////////////////
//////////////////

function testSliderContainer() {
  stories.style.display = "flex";
  landing.style.display = "none";
  onboarding.style.display = "none";
}
