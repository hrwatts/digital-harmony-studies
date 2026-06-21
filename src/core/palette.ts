import { clamp } from "./math";

export function hsla(
  hue: number,
  saturation: number,
  lightness: number,
  alpha = 1
): string {
  return `hsla(${hue.toFixed(1)} ${clamp(saturation, 0, 100).toFixed(1)}% ${clamp(
    lightness,
    0,
    100
  ).toFixed(1)}% / ${clamp(alpha, 0, 1).toFixed(3)})`;
}

export function tonalShift(baseHue: number, index: number, spread: number): number {
  return (baseHue + index * spread + 360) % 360;
}

