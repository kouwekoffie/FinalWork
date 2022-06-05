window.onload = () => {
  init();
};

let btn;
let canvas;

function init() {
  console.log("window loaded!");

  btn = document.getElementById("btn");
  btn.addEventListener("click", saveFrame);
}

function saveFrame() {
  saveFrames("out", "png", 1, 1, (data) => {
    //save(canvas, "myCanvas.jpg"); // saves it locally

    // save data
    localStorage.setItem("snap", JSON.stringify(data[0].imageData));
    console.log(localStorage);

    // stop stream and classyfying?
    // go to snaps page
    noLoop();
  });
  //OR
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// connect to the capture device
function setup() {
  canvas = createCanvas(innerWidth, innerHeight);
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
  video = createCapture(constraints);
  video.hide();
}

function draw() {
  background(0);

  // Draw the video
  image(video, 0, 0, windowWidth, windowHeight);
}
