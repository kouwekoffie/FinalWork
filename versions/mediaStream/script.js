window.onload = init;

function init() {
  var canvas = document.getElementById("canvas");

  canvas.width = innerWidth;
  canvas.height = innerHeight;
  var video = document.getElementById("video");
  var context = canvas.getContext("2d");

  const getStream = navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } }, // prefer rear-facing camera
    })
    .then((stream) => {
      video.srcObject = stream;
      console.dir(video.srcObject);
    });

  Promise.all([getStream]).then((values) => {
    console.log(values);
  });

  function renderFrame() {
    // re-register callback
    requestAnimationFrame(renderFrame);
    // set internal canvas size to match HTML element size
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

      //   context.drawImage(video, 0, 0, innerWidth, innerHeight);
      context.drawImage(
        video,
        sx,
        sy,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight
      );
    }
  }

  requestAnimationFrame(renderFrame);
}
