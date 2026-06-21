import { TAU, regularPolygon } from "../core/math";
import { hsla } from "../core/palette";
import type { PathPrimitive, PointPrimitive, SketchSpec } from "../core/types";
import { flattenScene } from "./helpers";

function polygonFamily(
  sides: number,
  radius: number,
  rotation: number,
  color: string,
  center: { x: number; y: number }
): { path: PathPrimitive; vertices: PointPrimitive[] } {
  const vertices = regularPolygon(sides, radius, rotation, center);
  return {
    path: {
      points: vertices,
      width: 1.3,
      color,
      alpha: 0.72,
      closed: true
    },
    vertices: vertices.map((vertex, index) => ({
      ...vertex,
      radius: 3 + (index % 2),
      color,
      alpha: 0.9
    }))
  };
}

export const matrixPolygonStudy: SketchSpec = {
  id: "matrix-polygon-study",
  title: "Matrix Polygon Study",
  classification: "Historically grounded study",
  sourceBasis:
    "A geometric family study motivated by public descriptions of Matrix-period work involving dots and polygonal structures.",
  mathematicalIdea:
    "Triangle, square, and hexagon families rotate under rational angular ratios while their radii breathe with the loop phase.",
  implementationNote:
    "This is intentionally geometric and spare so it reads as a study, not a maximal particle field.",
  outputs: ["Interactive webpage", "PNG still", "WebM loop"],
  validation: ["loop closure", "vertex stability", "finite bounds"],
  durationSeconds: 9,
  fps: 60,
  buildScene: (playhead, viewport, controls) => {
    const t = TAU * playhead;
    const center = viewport.center;
    const base = viewport.min * 0.18 * controls.scale;

    const triangle = polygonFamily(
      3,
      base * (1.25 + 0.08 * Math.sin(2 * t)),
      t * 1,
      hsla(36, 90, 72, 0.76),
      center
    );
    const square = polygonFamily(
      4,
      base * (1.7 + 0.1 * Math.sin(3 * t + 0.4)),
      t + Math.PI / 4,
      hsla(196, 78, 72, 0.74),
      center
    );
    const hexagon = polygonFamily(
      6,
      base * (2.25 + 0.12 * Math.sin(4 * t + 0.8)),
      2 * t,
      hsla(310, 68, 76, 0.66),
      center
    );

    return {
      background: [8, 9, 18],
      fadeAlpha: 0.12 / controls.trail,
      blendMode: "lighter",
      points: [...triangle.vertices, ...square.vertices, ...hexagon.vertices],
      paths: [triangle.path, square.path, hexagon.path]
    };
  },
  sampleLoopSignature: (playhead, viewport, controls) =>
    flattenScene(matrixPolygonStudy.buildScene(playhead, viewport, controls))
};
