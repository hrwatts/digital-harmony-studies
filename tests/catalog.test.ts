import { describe, expect, test } from "vitest";

import { sketches } from "../src/sketches";

describe("catalog integrity", () => {
  test("uses unique sketch ids", () => {
    const ids = sketches.map((sketch) => sketch.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("covers each public provenance class", () => {
    const classes = new Set(sketches.map((sketch) => sketch.classification));
    expect(classes.has("Historically grounded study")).toBe(true);
    expect(classes.has("Whitney-inspired study")).toBe(true);
    expect(classes.has("Modern extension")).toBe(true);
  });

  test("keeps release-critical metadata populated", () => {
    for (const sketch of sketches) {
      expect(sketch.sourceBasis.length).toBeGreaterThan(30);
      expect(sketch.mathematicalIdea.length).toBeGreaterThan(30);
      expect(sketch.outputs.length).toBeGreaterThan(0);
      expect(sketch.validation.length).toBeGreaterThan(0);
      expect(sketch.durationSeconds).toBeGreaterThan(0);
      expect(sketch.fps).toBeGreaterThanOrEqual(24);
    }
  });
});
