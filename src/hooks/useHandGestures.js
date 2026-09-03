import { useEffect, useRef } from "react";

const HANDS_CDN =
"https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js";
const CAMERA_CDN =
"https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js";
const HANDS_BASE =
"https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240";

const CONNECTIONS = [
[0, 1], [1, 2], [2, 3], [3, 4],
[0, 5], [5, 6], [6, 7], [7, 8],
[5, 9], [9, 10], [10, 11], [11, 12],
[9, 13], [13, 14], [14, 15], [15, 16],
[13, 17], [17, 18], [18, 19], [19, 20],
[0, 17],
];

let loadPromise = null;

function loadScripts() {
if (loadPromise) return loadPromise;

loadPromise = new Promise((resolve, reject) => {
if (window.Hands && window.Camera) {
resolve();
return;
}

let pending = 2;

const done = () => {
  pending--;
  if (pending === 0) resolve();
};

const s1 = document.createElement("script");
s1.src = HANDS_CDN;
s1.crossOrigin = "anonymous";
s1.onload = done;
s1.onerror = () =>
  reject(new Error("No se pudo cargar MediaPipe Hands"));

const s2 = document.createElement("script");
s2.src = CAMERA_CDN;
s2.crossOrigin = "anonymous";
s2.onload = done;
s2.onerror = () =>
  reject(new Error("No se pudo cargar MediaPipe Camera"));

document.body.appendChild(s1);
document.body.appendChild(s2);


});

return loadPromise;
}

function dist(a, b) {
return Math.hypot(a.x - b.x, a.y - b.y);
}

function fingerExtended(landmarks, tip, pip) {
return landmarks[tip].y < landmarks[pip].y - 0.02;
}

function classify(landmarks) {
if (!landmarks || landmarks.length < 21) return null;

const ref = Math.max(dist(landmarks[0], landmarks[9]), 0.0001);

const fingers = [
dist(landmarks[4], landmarks[17]) > ref * 0.78,
fingerExtended(landmarks, 8, 6),
fingerExtended(landmarks, 12, 10),
fingerExtended(landmarks, 16, 14),
fingerExtended(landmarks, 20, 18),
];

const [thumb, index, middle, ring, pinky] = fingers;

const thumbUp = landmarks[4].y < landmarks[3].y - 0.03;
const count = fingers.filter(Boolean).length;

// Pulgar e índice juntos.
if (dist(landmarks[4], landmarks[8]) < ref * 0.3) {
return "pinza";
}

// Solo pulgar levantado.
if (
thumb &&
!index &&
!middle &&
!ring &&
!pinky &&
thumbUp
) {
return "pulgar";
}

// Puño cerrado.
if (count === 0) {
return "punio";
}

// Solo índice.
if (index && !middle && !ring && !pinky) {
return "indice";
}

// Índice + medio.
if (index && middle && !ring && !pinky) {
return "dos";
}

// Mano abierta.
if (count >= 4) {
return "abierta";
}

return null;
}

function drawHand(ctx, landmarks, width, height) {
ctx.strokeStyle = "rgba(45,212,191,0.95)";
ctx.fillStyle = "rgba(255,255,255,0.95)";
ctx.lineWidth = 2;

for (const [a, b] of CONNECTIONS) {
ctx.beginPath();
ctx.moveTo(landmarks[a].x * width, landmarks[a].y * height);
ctx.lineTo(landmarks[b].x * width, landmarks[b].y * height);
ctx.stroke();
}

for (const point of landmarks) {
ctx.beginPath();
ctx.arc(
point.x * width,
point.y * height,
2.5,
0,
Math.PI * 2
);
ctx.fill();
}
}

export function useHandGestures({
enabled,
videoRef,
canvasRef,
onGesture,
onStatus,
}) {
const onGestureRef = useRef(onGesture);
const onStatusRef = useRef(onStatus);

onGestureRef.current = onGesture;
onStatusRef.current = onStatus;

useEffect(() => {
let cancelled = false;
let hands = null;
let camera = null;

const stable = {
  id: null,
  count: 0,
};

let lastReported = null;

const reportGesture = (gesture) => {
  if (gesture === lastReported) return;

  lastReported = gesture;
  onGestureRef.current?.(gesture);
};

async function start() {
  try {
    onStatusRef.current?.({ state: "loading" });

    await loadScripts();

    if (cancelled) return;

    hands = new window.Hands({
      locateFile: (file) => `${HANDS_BASE}/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (cancelled) return;

      const canvas = canvasRef?.current;
      const ctx = canvas?.getContext("2d");

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      let gesture = null;

      if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
      ) {
        const landmarks = results.multiHandLandmarks[0];

        if (ctx && canvas) {
          drawHand(
            ctx,
            landmarks,
            canvas.width,
            canvas.height
          );
        }

        gesture = classify(landmarks);
      }

      // Estabilización.
      if (gesture === stable.id) {
        stable.count++;
      } else {
        stable.id = gesture;
        stable.count = 1;
      }

      const stableGesture =
        stable.count >= 3 ? gesture : null;

      reportGesture(stableGesture);
    });

    const video = videoRef?.current;

    if (!video) return;

    camera = new window.Camera(video, {
      onFrame: async () => {
        if (!cancelled && hands) {
          await hands.send({ image: video });
        }
      },
      width: 320,
      height: 240,
    });

    await camera.start();

    if (cancelled) {
      try {
        camera.stop();
      } catch {}
      return;
    }

    onStatusRef.current?.({ state: "ready" });
  } catch (error) {
    if (!cancelled) {
      onStatusRef.current?.({
        state: "error",
        message: error?.message || "Error de cámara",
      });
    }
  }
}

if (enabled) {
  start();
}

return () => {
  cancelled = true;

  try {
    camera?.stop();
  } catch {}

  try {
    hands?.close();
  } catch {}

  const video = videoRef?.current;

  if (video?.srcObject) {
    video.srcObject.getTracks?.().forEach((track) => {
      track.stop();
    });

    video.srcObject = null;
  }

  const canvas = canvasRef?.current;
  const ctx = canvas?.getContext("2d");

  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  onGestureRef.current?.(null);
};


}, [enabled, videoRef, canvasRef]);
}
