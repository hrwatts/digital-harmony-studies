import { TAU, lissajousPath } from "../core/math";
import { hsla, tonalShift } from "../core/palette";
import type { PathPrimitive, PointPrimitive, SketchSpec } from "../core/types";
import { flattenScene, point } from "./helpers";

export const arabesqueCounterpoint: SketchSpec = {
  id: "arabesque-counterpoint",
  title: "Arabesque Counterpoint",
  classification: "Whitney-inspired study",
  sourceBasis:
    "A modern study inspired by Whitney's later flowing motion graphics and color counterpoint, without a work-specific reconstruction claim.",
  mathematicalIdea:
    "Nested Lissajous-derived paths are phase-shifted against orbiting point canons, creating long-exposure ribbon behavior under a closed loop.",
  implementationNote:
    "The longer trail setting is deliberate here; this sketch is the hero animation for the public site.",
  outputs: ["Interactive webpage", "PNG still", "WebM loop"],
  validation: ["loop closure", "trail readability", "browser smoothness"],
  durationSeconds: 12,
  fps: 60,
  buildScene: (playhead, viewport, controls) => {
    const t = TAU * playhead;
    const center = viewport.center;
    const base = viewport.min * 0.25 * controls.scale;

    const paths: PathPrimitive[] = Array.from({ length: 5 }, (_, index) => {
      const path = lissajousPath({
        amplitudeX: base * (1.2 + index * 0.13),
        amplitudeY: base * (0.6 + index * 0.1),
        a: 2 + index,
        b: 3 + index,
        phaseX: t + index * 0.4,
        phaseY: index * 0.9 - 2 * t,
        samples: 220
      }).map((vertex) => ({
        x: center.x + vertex.x,
        y: center.y + vertex.y
      }));

      return {
        points: path,
        width: 1.2 + index * 0.22,
        color: hsla(tonalShift(32, index, 38), 82, 70, 0.32),
        alpha: 0.72
      };
    });

    const points: PointPrimitive[] = Array.from({ length: Math.max(84, Math.round(120 * controls.density)) }, (_, index) => {
      const phase = (TAU * index) / Math.max(84, Math.round(120 * controls.density));
      const x =
        center.x +
        Math.sin(3 * t + phase) * base * 1.35 +
        Math.sin(9 * t + phase * 0.5) * base * 0.14;
      const y =
        center.y +
        Math.sin(4 * t + phase * 1.2) * base * 0.82 +
        Math.cos(7 * t + phase) * base * 0.18;
      return point(
        x,
        y,
        1.8 + (index % 3),
        hsla(tonalShift(18, index % 7, 22), 88, 76, 0.76),
        0.82
      );
    });

    return {
      background: [10, 8, 18],
      fadeAlpha: 0.038 / controls.trail,
      blendMode: "screen",
      points,
      paths
    };
  },
  sampleLoopSignature: (playhead, viewport, controls) =>
    flattenScene(arabesqueCounterpoint.buildScene(playhead, viewport, controls))
};
