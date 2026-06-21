import { describe, expect, test } from "vitest";

import type { RuntimeControls, Viewport } from "../src/core/types";
import { sketches } from "../src/sketches";

const viewport: Viewport = {
  width: 1200,
  height: 900,
  min: 900,
  max: 1200,
  center: { x: 600, y: 450 }
};

const controls: RuntimeControls = {
  speed: 1,
  density: 1,
  trail: 1,
  scale: 1
};

describe("loop closure", () => {
  test.each(sketches)("%s closes at the loop boundary", (sketch) => {
    const start = sketch.sampleLoopSignature(0, viewport, controls);
    const end = sketch.sampleLoopSignature(1, viewport, controls);

    expect(end.length).toBe(start.length);
    for (let index = 0; index < start.length; index += 1) {
      expect(end[index]).toBeCloseTo(start[index], 4);
    }
  });

  test.each(sketches)("%s stays finite and bounded", (sketch) => {
    const scene = sketch.buildScene(0.375, viewport, controls);
    for (const point of scene.points) {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
      expect(point.x).toBeGreaterThanOrEqual(-viewport.width * 0.1);
      expect(point.x).toBeLessThanOrEqual(viewport.width * 1.1);
      expect(point.y).toBeGreaterThanOrEqual(-viewport.height * 0.1);
      expect(point.y).toBeLessThanOrEqual(viewport.height * 1.1);
    }
  });
});

