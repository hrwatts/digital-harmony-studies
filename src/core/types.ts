export interface Vec2 {
  x: number;
  y: number;
}

export interface Viewport {
  width: number;
  height: number;
  min: number;
  max: number;
  center: Vec2;
}

export interface RuntimeControls {
  speed: number;
  density: number;
  trail: number;
  scale: number;
}

export interface PointPrimitive extends Vec2 {
  radius: number;
  color: string;
  alpha?: number;
}

export interface PathPrimitive {
  points: Vec2[];
  width: number;
  color: string;
  alpha?: number;
  closed?: boolean;
}

export interface SceneFrame {
  background: [number, number, number];
  fadeAlpha: number;
  blendMode?: GlobalCompositeOperation;
  points: PointPrimitive[];
  paths: PathPrimitive[];
}

export type Classification =
  | "Historically grounded study"
  | "Whitney-inspired study"
  | "Modern extension";

export interface SketchSpec {
  id: string;
  title: string;
  classification: Classification;
  sourceBasis: string;
  mathematicalIdea: string;
  implementationNote: string;
  outputs: string[];
  validation: string[];
  durationSeconds: number;
  fps: number;
  buildScene: (
    playhead: number,
    viewport: Viewport,
    controls: RuntimeControls
  ) => SceneFrame;
  sampleLoopSignature: (
    playhead: number,
    viewport: Viewport,
    controls: RuntimeControls
  ) => number[];
}

export interface PlaybackSnapshot {
  playhead: number;
  frameIndex: number;
  framesPerLoop: number;
  durationSeconds: number;
  sketchId: string;
}

