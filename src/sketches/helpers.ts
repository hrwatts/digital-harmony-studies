import { circlePath, finiteVec, rounded } from "../core/math";
import { hsla } from "../core/palette";
import { hashString, mulberry32 } from "../core/prng";
import type {
  PathPrimitive,
  PointPrimitive,
  RuntimeControls,
  SceneFrame,
  Vec2,
  Viewport
} from "../core/types";

export const DEFAULT_CONTROLS: RuntimeControls = {
  speed: 1,
  density: 1,
  trail: 1,
  scale: 1
};

export function makeGuideRings(
  viewport: Viewport,
  radii: number[],
  colorHue: number
): PathPrimitive[] {
  return radii.map((radius, index) => ({
    points: circlePath(radius, 144, viewport.center),
    width: 1,
    color: hsla(colorHue + index * 18, 35, 55, 0.22),
    alpha: 0.8,
    closed: true
  }));
}

export function flattenScene(scene: SceneFrame): number[] {
  const numbers = [
    scene.fadeAlpha,
    scene.points.length,
    scene.paths.length
  ];

  for (const point of scene.points.slice(0, 18)) {
    numbers.push(rounded(point.x), rounded(point.y), rounded(point.radius));
  }

  for (const path of scene.paths.slice(0, 4)) {
    for (const point of path.points.slice(0, 4)) {
      numbers.push(rounded(point.x), rounded(point.y));
    }
  }

  return numbers;
}

export function seededOffsets(seed: string, count: number, amplitude = 1): number[] {
  const random = mulberry32(hashString(seed));
  return Array.from({ length: count }, () => (random() * 2 - 1) * amplitude);
}

export function finiteScene(scene: SceneFrame): boolean {
  return (
    scene.points.every((point) => finiteVec(point)) &&
    scene.paths.every((path) => path.points.every((point) => finiteVec(point)))
  );
}

export function orbitPoint(origin: Vec2, radius: number, angle: number): Vec2 {
  return {
    x: origin.x + Math.cos(angle) * radius,
    y: origin.y + Math.sin(angle) * radius
  };
}

export function point(x: number, y: number, radius: number, color: string, alpha = 1): PointPrimitive {
  return { x, y, radius, color, alpha };
}
