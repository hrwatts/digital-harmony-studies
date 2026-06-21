import { createViewport, renderScene } from "./renderer";
import type { PlaybackSnapshot, RuntimeControls, SketchSpec, Viewport } from "./types";

const EXPORT_SPEED = 1;

function preferredMimeType(): string {
  const preferred = "video/webm;codecs=vp9";
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(preferred)) {
    return preferred;
  }
  const fallback = "video/webm";
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(fallback)) {
    return fallback;
  }
  return "";
}

export function supportsWebMRecording(): boolean {
  if (typeof MediaRecorder === "undefined") {
    return false;
  }
  return preferredMimeType().length > 0;
}

export class SketchPlayer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly controls: RuntimeControls = {
    speed: 1,
    density: 1,
    trail: 1,
    scale: 1
  };

  activeSketch: SketchSpec;
  isPlaying = true;
  isRecording = false;
  onFrame?: (snapshot: PlaybackSnapshot) => void;

  private viewport: Viewport;
  private rafId = 0;
  private lastTimestamp = 0;
  private elapsedMs = 0;

  constructor(canvas: HTMLCanvasElement, sketches: SketchSpec[], initialSketchId: string) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context is required.");
    }

    const initialSketch =
      sketches.find((sketch) => sketch.id === initialSketchId) ?? sketches[0];
    if (!initialSketch) {
      throw new Error("At least one sketch is required.");
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.activeSketch = initialSketch;
    this.viewport = createViewport(canvas.width || 1, canvas.height || 1);
    this.resize();
  }

  start(): void {
    this.lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      if (this.isPlaying) {
        this.elapsedMs += timestamp - this.lastTimestamp;
      }
      this.lastTimestamp = timestamp;
      this.render();
      this.rafId = window.requestAnimationFrame(loop);
    };
    this.rafId = window.requestAnimationFrame(loop);
  }

  stop(): void {
    window.cancelAnimationFrame(this.rafId);
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.viewport = createViewport(width, height);
    this.render(true);
  }

  setSketch(sketch: SketchSpec): void {
    this.activeSketch = sketch;
    this.elapsedMs = 0;
    this.render(true);
  }

  setControl(control: keyof RuntimeControls, value: number): void {
    this.controls[control] = value;
    this.render(true);
  }

  togglePlayback(): void {
    this.isPlaying = !this.isPlaying;
    this.lastTimestamp = performance.now();
  }

  resetLoop(): void {
    this.elapsedMs = 0;
    this.lastTimestamp = performance.now();
    this.render(true);
  }

  getSnapshot(): PlaybackSnapshot {
    const framesPerLoop = Math.round(this.activeSketch.durationSeconds * this.activeSketch.fps);
    return {
      playhead: this.computePlayhead(),
      frameIndex: Math.floor(this.computePlayhead() * framesPerLoop),
      framesPerLoop,
      durationSeconds: this.activeSketch.durationSeconds,
      sketchId: this.activeSketch.id
    };
  }

  downloadCurrentFrame(): Promise<void> {
    const snapshot = this.getSnapshot();
    const filename = `${snapshot.sketchId}-frame-${String(snapshot.frameIndex).padStart(4, "0")}.png`;
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG export failed."));
          return;
        }
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    });
  }

  async recordLoop(): Promise<void> {
    if (this.isRecording) {
      return;
    }
    const mimeType = preferredMimeType();
    if (mimeType.length === 0) {
      throw new Error("WebM recording is not supported in this browser.");
    }
    this.isRecording = true;

    const savedState = {
      playing: this.isPlaying,
      speed: this.controls.speed,
      elapsedMs: this.elapsedMs
    };

    this.controls.speed = EXPORT_SPEED;
    this.isPlaying = true;
    this.elapsedMs = 0;
    this.render(true);

    const stream = this.canvas.captureStream(this.activeSketch.fps);
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    const finished = new Promise<void>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${this.activeSketch.id}-loop.webm`;
        anchor.click();
        URL.revokeObjectURL(url);
        resolve();
      };
    });

    recorder.start();
    await new Promise((resolve) =>
      window.setTimeout(resolve, this.activeSketch.durationSeconds * 1000 + 150)
    );
    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    await finished;

    this.controls.speed = savedState.speed;
    this.isPlaying = savedState.playing;
    this.elapsedMs = savedState.elapsedMs;
    this.lastTimestamp = performance.now();
    this.isRecording = false;
    this.render(true);
  }

  private computePlayhead(): number {
    const loopMs = this.activeSketch.durationSeconds * 1000;
    return ((this.elapsedMs * this.controls.speed) / loopMs) % 1;
  }

  private render(hardReset = false): void {
    const playhead = this.computePlayhead();
    const scene = this.activeSketch.buildScene(playhead, this.viewport, this.controls);
    renderScene(this.ctx, scene, this.viewport, hardReset);
    this.onFrame?.(this.getSnapshot());
  }
}
