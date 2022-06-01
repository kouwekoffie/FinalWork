window.onload = init;

//
// HANDLE OVERLAY NAVIGATION
//

function init() {
  let tryIt = document.getElementById("tryIt");
  let gotIt = document.getElementById("gotIt");
  let exit = document.getElementById("exit");
  let info = document.getElementById("info");

  tryIt.addEventListener("click", function () {
    //hide landingOverlay
    document.getElementById("landingOverlay").style.display = "none";
    // go full screen
    document.body.requestFullscreen();
  });

  gotIt.addEventListener("click", function () {
    //hide onboarding overlay
    document.getElementById("onboardingOverlay").style.display = "none";
  });

  exit.addEventListener(
    "click",
    function () {
      // exit full screen
      document.exitFullscreen();
      // show landing overlay
      document.getElementById("landingOverlay").style.display = "block";
      window.scrollTo(0, 0);
    },
    false
  );

  info.addEventListener("click", function () {
    //show onboarding overlay
    document.getElementById("onboardingOverlay").style.display = "block";
  });

  // // wrap text with backdrop filter div
  // // element that will be wrapped
  // var el = document.getElementsByClassName("genText");
  // Array.from(el).forEach((el) => {
  //   // create wrapper container
  //   var wrapper = document.createElement("div");

  //   // insert wrapper before el in the DOM tree
  //   el.parentNode.insertBefore(wrapper, el);

  //   // move el into wrapper
  //   wrapper.appendChild(el);

  //   wrapper.classList.add("blured");
  // });
}

//
// P5 GET MEDIASTREAM AND RENDER ON CANVAS
//

let capture;

const constraints = {
  audio: false,
  video: {
    facingMode: "environment",
  },
};

// easy way to show snap
function mousePressed() {
  noLoop();
}
function mouseReleased() {
  loop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  let myCanvas = createCanvas(innerWidth, innerHeight);
  myCanvas.parent("container");
  capture = createCapture(constraints);
  capture.hide();
}

function draw() {
  // calculate render size (render the capture full window on the full window canvas)
  let x = innerHeight / capture.height;
  let imageHeight = capture.height * x;
  let imageWidth = capture.width * x;
  let xOffset = (capture.width - innerWidth) / 2;

  image(capture, -xOffset, 0, imageWidth, imageHeight);
}
