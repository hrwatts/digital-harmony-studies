import type { Vec2 } from "./types";

export const TAU = Math.PI * 2;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function polar(radius: number, angle: number): Vec2 {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

export function regularPolygon(
  sides: number,
  radius: number,
  rotation = 0,
  center: Vec2 = { x: 0, y: 0 }
): Vec2[] {
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (TAU * index) / sides;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    };
  });
}

export function circlePath(
  radius: number,
  samples: number,
  center: Vec2 = { x: 0, y: 0 }
): Vec2[] {
  return Array.from({ length: samples }, (_, index) => {
    const angle = (TAU * index) / samples;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    };
  });
}

export function lissajousPath(options: {
  amplitudeX: number;
  amplitudeY: number;
  a: number;
  b: number;
  phaseX?: number;
  phaseY?: number;
  samples: number;
}): Vec2[] {
  const {
    amplitudeX,
    amplitudeY,
    a,
    b,
    phaseX = 0,
    phaseY = 0,
    samples
  } = options;

  return Array.from({ length: samples }, (_, index) => {
    const t = (TAU * index) / samples;
    return {
      x: Math.sin(a * t + phaseX) * amplitudeX,
      y: Math.sin(b * t + phaseY) * amplitudeY
    };
  });
}

export function rounded(value: number, digits = 4): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

export function goldenAngleSequence(count: number, offset = 0): number[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => offset + goldenAngle * index);
}

export function finiteVec(vec: Vec2): boolean {
  return Number.isFinite(vec.x) && Number.isFinite(vec.y);
}

