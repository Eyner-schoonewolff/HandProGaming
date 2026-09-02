import { useEffect, useRef } from "react";

// Reconocimiento real de gestos con la cámara usando MediaPipe Hands.
// Todo el procesamiento ocurre en el navegador; el vídeo nunca se envía a un servidor.

const HANDS_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js";
const CAMERA_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js";
const HANDS_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240";

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],[0,17],
];

let loadPromise = null;
function loadScripts() {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (window.Hands && window.Camera) return resolve();
    let pending = 2;
    const done = () => { if (--pending === 0) resolve(); };
    const s1 = document.createElement("script");
    s1.src = HANDS_CDN; s1.crossOrigin = "anonymous"; s1.onload = done;
    s1.onerror = () => reject(new Error("No se pudo cargar MediaPipe Hands"));
    const s2 = document.createElement("script");
    s2.src = CAMERA_CDN; s2.crossOrigin = "anonymous"; s2.onload = done;
    s2.onerror = () => reject(new Error("No se pudo cargar MediaPipe Camera"));
    document.body.appendChild(s1);
    document.body.appendChild(s2);
  });
  return loadPromise;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Clasifica la pose de la mano en uno de los gestos soportados.
// Devuelve: "abierta" | "pinza" | "punio" | "indice" | "dos" | "pulgar" | null
function classify(landmarks) {
  const ref = dist(landmarks[0], landmarks[9]) || 0.0001;
  const tips = [4, 8, 12, 16, 20];
  const pips = [3, 6, 10, 14, 18];
  const fingers = [false, false, false, false, false];

  // Índice a meñique: la punta está por encima del nudillo (coordenada y menor).
  for (let i = 1; i < 5; i++) {
    fingers[i] = landmarks[tips[i]].y < landmarks[pips[i]].y - 0.02;
  }
  // Pulgar extendido: la punta está lejos de la base del meñique.
  fingers[0] = dist(landmarks[4], landmarks[17]) > ref * 0.78;
  // Pulgar apuntando hacia arriba (para "pulgar arriba").
  const thumbUp = landmarks[4].y < landmarks[3].y - 0.03;

  const count = fingers.filter(Boolean).length;

  // Pinza: pulgar e índice muy juntos.
  if (dist(landmarks[4], landmarks[8]) < ref * 0.3) return "pinza";

  // Pulgar arriba: solo el pulgar extendido y apuntando arriba.
  if (fingers[0] && !fingers[1] && !fingers[2] && !fingers[3] && !fingers[4] && thumbUp) return "pulgar";

  // Puño: ningún dedo extendido.
  if (count === 0) return "punio";

  // Solo índice.
  if (fingers[1] && !fingers[2] && !fingers[3] && !fingers[4]) return "indice";

  // Índice y medio (dos dedos / victoria).
  if (fingers[1] && fingers[2] && !fingers[3] && !fingers[4]) return "dos";

  // Mano abierta: 4 o 5 dedos extendidos.
  if (count >= 4) return "abierta";

  return null;
}

function drawHand(ctx, lm, w, h) {
  ctx.strokeStyle = "rgba(45,212,191,0.95)";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 2;
  for (const [a, b] of CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(lm[a].x * w, lm[a].y * h);
    ctx.lineTo(lm[b].x * w, lm[b].y * h);
    ctx.stroke();
  }
  for (const p of lm) {
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Hook de reconocimiento de gestos con la cámara.
 * @param {boolean} enabled  - si la cámara está activada
 * @param {Ref} videoRef     - <video> donde se muestra el stream
 * @param {Ref} canvasRef    - <canvas> overlay para dibujar la mano (opcional)
 * @param {(id|null)} onGesture  - se llama cuando el gesto estable cambia
 * @param {(status)} onStatus   - cambios de estado: loading | ready | error
 */
export function useHandGestures({ enabled, videoRef, canvasRef, onGesture, onStatus }) {
  const onGestureRef = useRef(onGesture);
  const onStatusRef = useRef(onStatus);
  onGestureRef.current = onGesture;
  onStatusRef.current = onStatus;

  useEffect(() => {
    let cancelled = false;
    let hands = null;
    let camera = null;
    const stable = { id: null, count: 0 };
    let lastReported = null;

    async function start() {
      try {
        onStatusRef.current?.({ state: "loading" });
        await loadScripts();
        if (cancelled) return;

        hands = new window.Hands({ locateFile: (f) => `${HANDS_BASE}/${f}` });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });
        hands.onResults((results) => {
          const canvas = canvasRef?.current;
          const ctx = canvas?.getContext("2d");
          if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);

          let id = null;
          if (results.multiHandLandmarks && results.multiHandLandmarks.length) {
            const lm = results.multiHandLandmarks[0];
            if (ctx && canvas) drawHand(ctx, lm, canvas.width, canvas.height);
            id = classify(lm);
          }

          // Estabilizar: mismo gesto 3 frames seguidos antes de reportarlo.
          if (id === stable.id) stable.count++;
          else { stable.id = id; stable.count = 1; }
          const stableId = stable.count >= 3 ? id : null;

          if (stableId !== lastReported) {
            lastReported = stableId;
            onGestureRef.current?.(stableId);
          }
        });

        const video = videoRef.current;
        if (!video) return;

        camera = new window.Camera(video, {
          onFrame: async () => {
            if (!cancelled && hands) await hands.send({ image: video });
          },
          width: 320,
          height: 240,
        });
        await camera.start();
        if (cancelled) { try { camera.stop(); } catch {} return; }
        onStatusRef.current?.({ state: "ready" });
      } catch (e) {
        if (!cancelled) onStatusRef.current?.({ state: "error", message: e?.message || "Error de cámara" });
      }
    }

    if (enabled) start();

    return () => {
      cancelled = true;
      try { camera?.stop(); } catch {}
      try { hands?.close(); } catch {}
      // Detener tracks del stream por si quedaron abiertos.
      const video = videoRef?.current;
      if (video?.srcObject) {
        video.srcObject.getTracks?.().forEach((t) => t.stop());
        video.srcObject = null;
      }
      const canvas = canvasRef?.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      onGestureRef.current?.(null);
    };
  }, [enabled, videoRef, canvasRef]);
}