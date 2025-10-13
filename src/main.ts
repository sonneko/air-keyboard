import { log } from "./lib";
import "./style.css";
import { updateChart } from "./graph";
import { DrawingUtils, type Landmark } from "@mediapipe/tasks-vision";
import { video, handLandmarker, canvasCtx, canvasElement, createHandLandmarker } from "./init";

let lastVideoTime = -1;

const frame = () => {
  lastVideoTime = video.currentTime;
  const startTimeMs = performance.now();
  const results = handLandmarker!.detectForVideo(video, startTimeMs);

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.landmarks[1] === undefined) {
    log("missing two hands");
    return;
  }

  const drawingUtils = new DrawingUtils(canvasCtx);
  let leftLandmarks, rightLandmarks;
  let fingersY: number[] = [];
  if (results.handedness[0][0].categoryName === "LEFT") {
    leftLandmarks = results.landmarks[0];
    rightLandmarks = results.landmarks[1];
  } else {
    leftLandmarks = results.landmarks[1];
    rightLandmarks = results.landmarks[0];
  }
  const draw = (landmark: Landmark, index: number) => {
    if (index === 4 || index === 8 || index === 12 || index === 16 || index === 20) {
      drawingUtils.drawLandmarks([landmark], {
        color: "#FF0000",
        lineWidth: 2,
        radius: 5,
      });
      fingersY.push(landmark.y);
    }
  }
  leftLandmarks.forEach(draw);
  rightLandmarks.forEach(draw);

  updateChart(fingersY);
}

await createHandLandmarker();

const loop = () => {
  frame();
  requestAnimationFrame(loop);
}

try {
  loop();
} catch (err) {
  log(err.stack);
}