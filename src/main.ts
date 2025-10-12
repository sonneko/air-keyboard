import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";
import "./style.css";

// DOM要素の取得
const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d")!;

let handLandmarker: HandLandmarker | undefined = undefined;
let lastVideoTime = -1;

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

    // 'playing'イベントは、ビデオの再生が実際に開始されたときに発火します。
    // これにより、SafariやiOSでの自動再生の問題を回避しやすくなります。
    video.addEventListener("playing", predictWebcam);

    // loadeddataイベントも残しておくと、より堅牢になります。
    // playingイベントが何らかの理由で発火しない場合のフォールバックとして機能します。
    video.addEventListener("loadeddata", () => {
      // loadeddataが発火してもまだ再生が始まっていない場合があるため、明示的にplay()を呼び出します。
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
      for (const landmarks of results.landmarks) {
        // 骨格を描画
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });

        // 指先のみ描画
        landmarks.forEach((landmark, index) => {
          if (index === 0 || index === 5 || index === 9 || index === 13 || index === 17) {
            drawingUtils.drawLandmarks([landmark], {
              color: "#FF0000",
              lineWidth: 2,
              radius: 5,
            });
          }
        });
      }
    }
    canvasCtx.restore();

    // 次のフレームで再度実行
    requestAnimationFrame(loop);
  };

  // 最初のフレームを開始
  loop();
};

// 実行開始
createHandLandmarker();
