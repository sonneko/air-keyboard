import { DrawingUtils, type HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { canvasCtx } from "./init";
import { add, getDistance, ne, scale, type Vec } from "./vec";
import { updateChart } from "./graph";
import { log } from "./log";

const cursorEle = document.getElementById("cursor") as HTMLDivElement;

let pre_index: Vec = { x: 0, y: 0, z: 0 };

let is_dragging: boolean = false;

export function mouseSystemUpdate(results: HandLandmarkerResult) {
    const landmarks = results.landmarks[0];
    const thumb = landmarks[4];
    const index = landmarks[8];
    const drawingUtils = new DrawingUtils(canvasCtx);
    drawingUtils.drawLandmarks([thumb, index], {
        lineWidth: 2,
        color: "#FF0000",
    })

    const distanceFromCamera = 0.27 / scale(add(landmarks[20], ne(landmarks[0])));

    const distance = getDistance(thumb, index) * distanceFromCamera;

    let isClicked: boolean = false;
    if ((is_dragging && distance < 0.085) || (!is_dragging && distance < 0.068)) {
        isClicked = true;
        is_dragging = true;
        log("yes")
    } else {
        log("no")
        is_dragging = false;
    }

    const mouseX = innerHeight / 0.6 - (index.x / 3 + 2 * thumb.x / 3) * 1900;
    const mouseY = -innerHeight / 1.6 + (index.y / 3 + 2 * thumb.y / 3) * 1900 + window.scrollY;

    cursorEle.style.transform = `translateX(${mouseX}px) translateY(${mouseY}px)`;
    cursorEle.style.backgroundColor = isClicked ? "#00ff00" : "rgba(0,0,0,0)"

    updateChart([distance, is_dragging ? 0.085 : 0.068, distanceFromCamera]);

    pre_index = index;
}