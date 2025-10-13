import { log } from "./lib";
import "./style.css";
import { video, handLandmarker, canvasCtx, canvasElement, createHandLandmarker } from "./init";
import { keyboardSystemUpdate } from "./keyboard";
import { mouseSystemUpdate } from "./mouse";

let lastVideoTime = -1;

const frame = () => {
  lastVideoTime = video.currentTime;
  const startTimeMs = performance.now();
  const results = handLandmarker!.detectForVideo(video, startTimeMs);

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.landmarks.length === 0) {
    log("no hand detected");
    return;
  } else if (results.landmarks.length === 1) {
    mouseSystemUpdate(results);
  } else if (results.landmarks.length === 2 ) {
    keyboardSystemUpdate(results);
  }

}

const main = () => {
  await createHandLandmarker();
  loop();
}

const loop = () => {
  frame();
  requestAnimationFrame(loop);
}

main();