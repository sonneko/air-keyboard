import { updateChart } from "./graph";
import { DrawingUtils, type HandLandmarkerResult, type Landmark } from "@mediapipe/tasks-vision";
import { canvasCtx } from "./init";

export function keyboardSystemUpdate(results: HandLandmarkerResult) {
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
            });
            fingersY.push(landmark.y);
        }
    }
    leftLandmarks.forEach(draw);
    rightLandmarks.forEach(draw);

    updateChart(fingersY);
}