// utils/measure.ts
import type poseModule from '@mediapipe/pose';
import type { NormalizedLandmark, NormalizedLandmarkList } from '@mediapipe/pose';

/* ---------- helpers ---------- */
const dist = (a: NormalizedLandmark, b: NormalizedLandmark) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/* ---------- core ---------- */
export async function getMeasurementsFromImage(img: HTMLImageElement) {
  // Dynamische ESM-import - voorkomt "Pose is not a constructor"
  const mod: typeof poseModule = await import('@mediapipe/pose');
  const PoseCtor = (mod as any).Pose ?? (mod as any).default?.Pose;
  if (!PoseCtor) throw new Error('Mediapipe Pose class not found');

  const pose = new PoseCtor({
    locateFile: (f: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
  });
  pose.setOptions({ modelComplexity: 0, selfieMode: false });
  await pose.initialize?.();               // no-op voor 0.5.x, vereist voor 0.6.x

  const { landmarks } = await pose.send({ image: img });
  if (!landmarks) throw new Error('No pose detected');

  /* voorbeeld ─ enkel lichaamslengte */
  const height =
    dist(landmarks[31], landmarks[23]) +   // voet – heup links
    dist(landmarks[23], landmarks[11]) +   // heup – schouder links
    dist(landmarks[11], landmarks[0]);     // schouder – oor/kruin

  return { heightCm: Math.round(height * 100) };
}