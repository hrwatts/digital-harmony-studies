import { TAU, goldenAngleSequence } from "../core/math";
import { hsla } from "../core/palette";
import type { SketchSpec } from "../core/types";
import { flattenScene, point } from "./helpers";

const phases = goldenAngleSequence(320);

export const phaseBloom: SketchSpec = {
  id: "phase-bloom",
  title: "Phase Bloom",
  classification: "Modern extension",
  sourceBasis:
    "A contemporary extension that borrows the repo's harmonic vocabulary but does not claim direct historical precedent.",
  mathematicalIdea:
    "Golden-angle phase placement yields an even point distribution, while rational temporal modulation keeps the loop closed and visibly structured.",
  implementationNote:
    "This sketch is intentionally labeled as a modern contrast piece so the public repo does not blur historical and contemporary ideas.",
  outputs: ["Interactive webpage", "PNG still", "WebM loop"],
  validation: ["loop closure", "deterministic phase order", "bounded density"],
  durationSeconds: 7,
  fps: 60,
  buildScene: (playhead, viewport, controls) => {
    const t = TAU * playhead;
    const center = viewport.center;
    const count = Math.max(120, Math.round(220 * controls.density));
    const base = viewport.min * 0.34 * controls.scale;
    const points = Array.from({ length: count }, (_, index) => {
      const phase = phases[index];
      const radialBias = index / Math.max(1, count - 1);
      const radius =
        base * (0.18 + radialBias * 0.92) +
        Math.sin(4 * t + phase * 0.35) * base * 0.06;
      const angle = phase + 5 * t + Math.sin(3 * t + phase) * 0.14;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius * (0.88 + 0.12 * Math.sin(t));
      return point(x, y, 1.2 + radialBias * 3.1, hsla(208 + radialBias * 88, 86, 74, 0.7), 0.84);
    });

    return {
      background: [6, 11, 19],
      fadeAlpha: 0.05 / controls.trail,
      blendMode: "lighter",
      points,
      paths: []
    };
  },
  sampleLoopSignature: (playhead, viewport, controls) =>
    flattenScene(phaseBloom.buildScene(playhead, viewport, controls))
};

