import { TAU } from "../core/math";
import { hsla, tonalShift } from "../core/palette";
import type { SketchSpec } from "../core/types";
import { flattenScene, makeGuideRings, orbitPoint, point, seededOffsets } from "./helpers";

const offsets = seededOffsets("catalog-radial-canon", 192, 0.08);

export const catalogRadialCanon: SketchSpec = {
  id: "catalog-radial-canon",
  title: "Catalog Radial Canon",
  classification: "Historically grounded study",
  sourceBasis:
    "A point-based harmonic motion study grounded in Whitney's early cyclic graphics language, without claiming exact reconstruction.",
  mathematicalIdea:
    "Rational angular frequencies with sinusoidal radius modulation, phase-offset point families, and optical accumulation through controlled trail fade.",
  implementationNote:
    "Rendered as additive point canons over guide rings in Canvas 2D. Loop closure is guaranteed by the shared normalized playhead and rational frequency ratios.",
  outputs: ["Interactive webpage", "PNG still", "WebM loop"],
  validation: ["loop closure", "finite point bounds", "readable trail layering"],
  durationSeconds: 8,
  fps: 60,
  buildScene: (playhead, viewport, controls) => {
    const base = viewport.min * 0.34 * controls.scale;
    const count = Math.max(48, Math.round(110 * controls.density));
    const t = TAU * playhead;
    const guideRings = makeGuideRings(viewport, [base * 0.65, base, base * 1.32], 42);

    const points = Array.from({ length: count }, (_, index) => {
      const phase = (TAU * index) / count + offsets[index % offsets.length];
      const radius = base * (0.72 + 0.28 * Math.sin(3 * t + phase * 1.5));
      const angle = 2 * t + phase;
      const lifted = orbitPoint(viewport.center, radius, angle);
      const sway = Math.sin(5 * t + phase * 0.75) * base * 0.18;
      const color = hsla(tonalShift(28, index % 5, 28), 82, 70, 0.74);
      return point(lifted.x, lifted.y + sway, 1.8 + (index % 3), color, 0.86);
    });

    return {
      background: [9, 13, 24],
      fadeAlpha: 0.06 / controls.trail,
      blendMode: "lighter",
      points,
      paths: guideRings
    };
  },
  sampleLoopSignature: (playhead, viewport, controls) =>
    flattenScene(catalogRadialCanon.buildScene(playhead, viewport, controls))
};

