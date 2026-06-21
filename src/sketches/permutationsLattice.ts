import { TAU, mix } from "../core/math";
import { hsla, tonalShift } from "../core/palette";
import type { SketchSpec } from "../core/types";
import { flattenScene, point, seededOffsets } from "./helpers";

const offsets = seededOffsets("permutations-lattice", 256, 0.12);

export const permutationsLattice: SketchSpec = {
  id: "permutations-lattice",
  title: "Permutations Lattice",
  classification: "Historically grounded study",
  sourceBasis:
    "A structured dot-field study motivated by Whitney's documented interest in permutations, cyclic variation, and matrix-like motion graphics.",
  mathematicalIdea:
    "A fixed lattice anchors local harmonic displacements. Each point follows a small rational orbit whose phase is permuted across the grid.",
  implementationNote:
    "The lattice stays legible on the public site because the displacement radius is small relative to the grid. This avoids turning the study into generic particle noise.",
  outputs: ["Interactive webpage", "PNG still", "WebM loop"],
  validation: ["loop closure", "finite lattice drift", "stable point count"],
  durationSeconds: 10,
  fps: 60,
  buildScene: (playhead, viewport, controls) => {
    const cols = Math.max(10, Math.round(14 * controls.density));
    const rows = Math.max(6, Math.round(9 * controls.density));
    const t = TAU * playhead;
    const points = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const index = row * cols + col;
        const phase = offsets[index % offsets.length] + ((row * 3 + col * 5) % 11) * (TAU / 11);
        const anchorX = mix(viewport.width * 0.16, viewport.width * 0.84, col / (cols - 1));
        const anchorY = mix(viewport.height * 0.18, viewport.height * 0.82, row / (rows - 1));
        const dx = Math.sin(3 * t + phase) * viewport.min * 0.035 * controls.scale;
        const dy = Math.sin(4 * t + phase * 1.4) * viewport.min * 0.035 * controls.scale;
        const hue = tonalShift(190, (row + col) % 6, 17);
        points.push(point(anchorX + dx, anchorY + dy, 2.1, hsla(hue, 80, 72, 0.82), 0.88));
      }
    }

    const columnPaths = Array.from({ length: Math.min(cols, 8) }, (_, columnIndex) => {
      const col = Math.floor((columnIndex / Math.max(1, Math.min(cols, 8) - 1)) * (cols - 1));
      const sampled = [];
      for (let row = 0; row < rows; row += 1) {
        const index = row * cols + col;
        const phase = offsets[index % offsets.length] + ((row * 3 + col * 5) % 11) * (TAU / 11);
        const anchorX = mix(viewport.width * 0.16, viewport.width * 0.84, col / Math.max(1, cols - 1));
        const anchorY = mix(viewport.height * 0.18, viewport.height * 0.82, row / Math.max(1, rows - 1));
        sampled.push({
          x: anchorX + Math.sin(3 * t + phase) * viewport.min * 0.035 * controls.scale,
          y: anchorY + Math.sin(4 * t + phase * 1.4) * viewport.min * 0.035 * controls.scale
        });
      }
      return {
        points: sampled,
        width: 1,
        color: hsla(192 + columnIndex * 8, 60, 60, 0.3),
        alpha: 0.7
      };
    });

    return {
      background: [7, 12, 20],
      fadeAlpha: 0.1 / controls.trail,
      blendMode: "screen",
      points,
      paths: columnPaths
    };
  },
  sampleLoopSignature: (playhead, viewport, controls) =>
    flattenScene(permutationsLattice.buildScene(playhead, viewport, controls))
};

