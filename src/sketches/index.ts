import type { SketchSpec } from "../core/types";
import { arabesqueCounterpoint } from "./arabesqueCounterpoint";
import { catalogRadialCanon } from "./catalogRadialCanon";
import { matrixPolygonStudy } from "./matrixPolygonStudy";
import { permutationsLattice } from "./permutationsLattice";
import { DEFAULT_CONTROLS, finiteScene } from "./helpers";
import { phaseBloom } from "./phaseBloom";

export const sketches: SketchSpec[] = [
  arabesqueCounterpoint,
  catalogRadialCanon,
  permutationsLattice,
  matrixPolygonStudy,
  phaseBloom
];

export const defaultControls = DEFAULT_CONTROLS;

export function sketchById(id: string): SketchSpec | undefined {
  return sketches.find((sketch) => sketch.id === id);
}

export function sceneIsFinite(sketch: SketchSpec): boolean {
  const viewport = {
    width: 1200,
    height: 900,
    min: 900,
    max: 1200,
    center: { x: 600, y: 450 }
  };
  return finiteScene(sketch.buildScene(0.25, viewport, DEFAULT_CONTROLS));
}
