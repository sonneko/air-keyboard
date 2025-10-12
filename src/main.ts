import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  type Landmark
} from "@mediapipe/tasks-vision";
import { dot, getDeg } from "./lib";
import "./style.css";
import { updateChart } from "./graph";

type number10 = [number, number, number, number, number, number, number, number, number, number,];
type DegreesHistory = [
  number10, number10, number10, number10
]

function log(message: unknown) {
  const e = document.getElementById("console");
  if (e) e.innerText = JSON.stringify(message);
}

// DOM要素の取得
const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d")!;

let handLandmarker: HandLandmarker | undefined = undefined;
let lastVideoTime = -1;

let degrees_history: DegreesHistory = Array(4 as const).fill(null).map(() => Array(10 as const).fill(0)) as DegreesHistory;
let degrees_integral_history: [number10, number10] = Array(2).fill(null).map(() => Array(10 as const).fill(0)) as [number10, number10];


// HandLandmarkerの初期化
const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `./hand_landmarker.task`, // publicフォルダに配置したモデル
      delegate: "GPU",
    },
    runningMode: "VIDEO", // 動画モード
    numHands: 2, // 検出する手の最大数
  });
  console.log("HandLandmarker is ready.");
  enableCam(); // HandLandmarkerの準備ができたらカメラを有効化
};

// Webカメラの有効化
const enableCam = async () => {
  if (!handLandmarker) {
    console.log("Wait! handLandmarker not loaded yet.");
    return;
  }

  // Webカメラのアクセス権限を取得
  const constraints = {
    video: true
  };

  // カメラを有効化
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    video.addEventListener("playing", predictWebcam);

    video.addEventListener("loadeddata", () => {
      video.play();
    });
  } catch (err) {
    console.error("getUserMedia error: ", err);
  }
};

// リアルタイムで手の検出を行う
const predictWebcam = () => {
  // メインループが複数回開始されるのを防ぐ
  video.removeEventListener("playing", predictWebcam);

  // videoのサイズをcanvasに合わせる
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  // 現在のフレームで検出を実行
  const loop = () => {
    lastVideoTime = video.currentTime;
    const startTimeMs = performance.now();
    const results = handLandmarker!.detectForVideo(video, startTimeMs);

    // 描画処理
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // 検出結果があれば描画
    if (results.landmarks) {
      const drawingUtils = new DrawingUtils(canvasCtx);

      degrees_history[3] = [...degrees_history[2]];
      degrees_history[2] = [...degrees_history[1]];
      degrees_history[1] = [...degrees_history[0]];

      for (let i = 0; i < results.landmarks.length; i++) {
        const landmarks = results.landmarks[i];
        // 骨格を描画
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });

        // 指先のみ描画
        landmarks.forEach((landmark, index) => {
          if (index === 4 || index === 8 || index === 12 || index === 16 || index === 20) {
            drawingUtils.drawLandmarks([landmark], {
              color: "#FF0000",
              lineWidth: 2,
              radius: 5,
            });
          } else if (index === 2 || index === 5 || index === 9 || index === 13 || index === 17) {
            drawingUtils.drawLandmarks([landmark], {
              color: "#00FF00",
              lineWidth: 2,
              radius: 5,
            })
          } else if (index === 0) {
            drawingUtils.drawLandmarks([landmark], {
              color: "#0000ff",
              lineWidth: 2,
              radius: 5,
            })
          }
        });

        const handedness = results.handedness[i][0].categoryName;
        const offset = (handedness === "Left") ? 0 : 5;


        degrees_history[0][0 + offset] = getDeg(landmarks[4], landmarks[0], landmarks[2]);
        degrees_history[0][1 + offset] = getDeg(landmarks[8], landmarks[0], landmarks[5]);
        degrees_history[0][2 + offset] = getDeg(landmarks[12], landmarks[0], landmarks[9]);
        degrees_history[0][3 + offset] = getDeg(landmarks[16], landmarks[0], landmarks[13]);
        degrees_history[0][4 + offset] = getDeg(landmarks[20], landmarks[0], landmarks[17]);
      }
    }
    const degrees_integral = (() => {
      const innerLength = degrees_history[0].length;
      let ret: number10 = Array(innerLength).fill(0) as number10;
      for (const innerArray of degrees_history) {
        for (let i = 0; i < innerLength; i++) {
          ret[i] += innerArray[i];
        }
      }
      return ret.map(sum => sum / 4) as number10;
    })();

    degrees_integral_history[1] = [...degrees_integral_history[0]];
    degrees_integral_history[0] = [...degrees_integral];

    const degrees_integral_diff: number10 = degrees_integral_history[0].map((item, i) =>
      item - degrees_integral_history[1][i]
    ) as number10;

    updateChart(degrees_integral_diff);

    canvasCtx.restore();

    // 次のフレームで再度実行
    requestAnimationFrame(loop);
  };

  // 最初のフレームを開始
  try {
    loop();
  } catch (err) {
    alert(err);
  }
};

// 実行開始
createHandLandmarker();


