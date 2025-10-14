import { DrawingUtils, type HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { canvasCtx } from "./init";
import { add, getDeg, getDistance, ne, scalar_multi, scale, type Vec, getDegXY } from "./vec";
import { updateChart } from "./graph";
import { log } from "./log";

const cursorEle = document.getElementById("cursor") as HTMLDivElement;
const POS_INTEGRAL_RANGE = 8;
const DISTANCE_INTEGRAL_RANGE = 5;

let is_dragging: boolean = false;

let distance_history: number[] = Array(DISTANCE_INTEGRAL_RANGE).fill(null).map(() => 0);

let relativePos_history: Vec[] = Array(POS_INTEGRAL_RANGE).fill(null).map(() => {return{x: 0, y: 0, z: 0}});
let relativeBasePos_history: Vec[] = Array(POS_INTEGRAL_RANGE).fill(null).map(() => {return{x: 0, y: 0, z: 0}});

let pre_mousePosSrc: {x: number, y: number} = {x: 0, y: 0};

export function mouseSystemUpdate(results: HandLandmarkerResult) {
    const landmarks = results.landmarks[0];
    const thumb = landmarks[4];
    const index = landmarks[8];
    const base = landmarks[0];
    const isLeft = results.handedness[0][0].categoryName === "LEFT";
    const drawingUtils = new DrawingUtils(canvasCtx);
    drawingUtils.drawLandmarks([thumb, index, base], {
        lineWidth: 2,
        color: "#FF0000",
    })

    const distanceFromCamera = 0.27 / scale(add(landmarks[20], ne(landmarks[0])));

    const distance = getDistance(thumb, index) * distanceFromCamera;
    distance_history.shift();
    distance_history.push(distance);
    const integraled_distance = distance_history.reduce((pre, curr) => pre + curr) / DISTANCE_INTEGRAL_RANGE;

    let isClicked: boolean = false;
    if ((is_dragging && integraled_distance < 0.085) || (!is_dragging && integraled_distance < 0.068)) {
        isClicked = true;
        is_dragging = true;
        log("yes")
    } else {
        log("no")
        is_dragging = false;
    }

    const relativePos = add(scalar_multi(index, 2/7), scalar_multi(thumb, 5/7))
    relativePos_history.shift();
    relativePos_history.push(relativePos);

    const relativeBasePos = base;
    relativeBasePos_history.shift();
    relativeBasePos_history.push(relativeBasePos);

    const integraledRelativePos = scalar_multi(relativePos_history.reduce((pre, curr) => add(pre, curr)), 1/POS_INTEGRAL_RANGE);
    const integraledRelativeBasePos = scalar_multi(relativeBasePos_history.reduce((pre, curr) => add(pre, curr)), 1/POS_INTEGRAL_RANGE);

    const mousePosSrc = add(integraledRelativePos, ne(integraledRelativeBasePos));
    const mousePosSrc_velocity = {
        x: mousePosSrc.x - pre_mousePosSrc.x,
        y: mousePosSrc.y - pre_mousePosSrc.y,
    }
    const mousePosSrcSpeedxx2 = mousePosSrc_velocity.x**2 + mousePosSrc_velocity.y**2;
    pre_mousePosSrc = {
        x: mousePosSrc.x,
        y: mousePosSrc.y,
    }

    const mouseX = innerWidth / 2 - mousePosSrc.x * (0.004 > mousePosSrcSpeedxx2 ? 4000 : 3000);
    const mouseY = innerHeight / 2 + mousePosSrc.y * (0.004 > mousePosSrcSpeedxx2 ? 2400 : 1400) + window.scrollY;

    let modifiedMouseX, modifiedMouseY;
    if (0 < mouseX && mouseX < innerWidth) {
        modifiedMouseX = mouseX;
    } else {
        modifiedMouseX = mouseX < 0 ? 0 : innerWidth - 40;
    }
    if (0< mouseY && mouseY < innerHeight) {
        modifiedMouseY = mouseY;
    } else {
        modifiedMouseY = mouseY < 0 ? -30 : innerHeight - 80;
    }

    cursorEle.style.transform = `translateX(${modifiedMouseX}px) translateY(${modifiedMouseY}px)`;
    cursorEle.style.backgroundColor = isClicked ? "#00ff00" : "rgba(0,0,0,0)";

    updateChart([mousePosSrcSpeedxx2]);

}