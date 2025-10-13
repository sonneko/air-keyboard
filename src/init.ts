import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export let handLandmarker: HandLandmarker | undefined = undefined;

export const video = document.getElementById("webcam") as HTMLVideoElement;
export const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
export const canvasCtx = canvasElement.getContext("2d")!;

// HandLandmarkerの初期化
export const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `./hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
  console.log("HandLandmarker is ready.");
  await enableCam();
};

// Webカメラの有効化
const enableCam = async () => {
  if (!handLandmarker) {
    throw new Error("ss");
  }
  const constraints = { video: true };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    const promise = new Promise((resolve) => {
      video.addEventListener("playing", () => { predictWebcam(); resolve(undefined); });
    })

    video.addEventListener("loadeddata", () => {
      video.play();
    });

    await promise;
  } catch (err) {
    throw new Error("getUserMedia error: " + err as string);
  }
};

const predictWebcam = () => {
  video.removeEventListener("playing", predictWebcam);

  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  canvasCtx.restore();
};

