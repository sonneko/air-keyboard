import { log } from "./log";
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

  try {

  const visualFingersNum = results.landmarks.map(
    landmarks => landmarks.map(
      landmark => landmark.visibility ? 1 as number : 0 as number
    ).reduce((pre, curr) => pre + curr, 0))
  .reduce((pre, curr) => pre + curr, 0);

  if (results.landmarks.length === 0) {
    log("no hand detected");
    return;
  } else if (results.landmarks.length === 1 || visualFingersNum < 3) {
    mouseSystemUpdate(results);
  } else if (results.landmarks.length === 2) {
    keyboardSystemUpdate(results);
  }
}catch(e) {
  alert(e)
}

}

const main = async () => {
  await createHandLandmarker();
  loop();
}

const loop = () => {
  frame();
  requestAnimationFrame(loop);
}

try {
  main();
} catch (err) {
  alert(err)
}