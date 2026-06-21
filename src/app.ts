import { SketchPlayer, supportsWebMRecording } from "./core/engine";
import type { PlaybackSnapshot, RuntimeControls, SketchSpec } from "./core/types";
import { defaultControls, sketches } from "./sketches";

const scopeCards = [
  {
    title: "Historically grounded studies",
    text: "Sketches in this group stay close to documented Whitney concepts such as harmonic motion, cyclic point systems, and geometric recurrence."
  },
  {
    title: "Whitney-inspired studies",
    text: "These pieces use the same visual language without implying direct reconstruction of a named work."
  },
  {
    title: "Modern extensions",
    text: "These sketches intentionally introduce contemporary sampling or compositing choices and are labeled that way in the public interface."
  }
];

function metricLabel(snapshot: PlaybackSnapshot): string {
  return `${snapshot.durationSeconds.toFixed(1)}s loop · ${snapshot.framesPerLoop} frames`;
}

function formatMetricLabel(snapshot: PlaybackSnapshot): string {
  return `${snapshot.durationSeconds.toFixed(1)}s loop - ${snapshot.framesPerLoop} frames`;
}

function controlMarkup(id: keyof RuntimeControls, label: string, value: number, min: number, max: number, step: number): string {
  return `
    <label class="control" for="${id}">
      <span>${label}</span>
      <input id="${id}" name="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
      <output data-output="${id}">${value.toFixed(2)}</output>
    </label>
  `;
}

function sketchCard(sketch: SketchSpec, active: boolean): string {
  return `
    <button class="sketch-card${active ? " is-active" : ""}" data-sketch="${sketch.id}" type="button">
      <span class="sketch-card__class">${sketch.classification}</span>
      <strong>${sketch.title}</strong>
      <span>${sketch.mathematicalIdea}</span>
    </button>
  `;
}

function listMarkup(items: string[]): string {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function detailMarkup(sketch: SketchSpec, snapshot: PlaybackSnapshot): string {
  return `
    <div class="detail-header">
      <span class="badge">${sketch.classification}</span>
      <span class="detail-metric">${formatMetricLabel(snapshot)}</span>
    </div>
    <h2>${sketch.title}</h2>
    <p>${sketch.sourceBasis}</p>
    <div class="detail-grid">
      <section>
        <h3>Mathematical idea</h3>
        <p>${sketch.mathematicalIdea}</p>
      </section>
      <section>
        <h3>Implementation note</h3>
        <p>${sketch.implementationNote}</p>
      </section>
      <section>
        <h3>Outputs</h3>
        <ul>${listMarkup(sketch.outputs)}</ul>
      </section>
      <section>
        <h3>Validation</h3>
        <ul>${listMarkup(sketch.validation)}</ul>
      </section>
    </div>
  `;
}

export function boot(root: HTMLDivElement | null): void {
  if (!root) {
    throw new Error("Missing #app root element.");
  }

  const initialSketch = sketches[0];
  if (!initialSketch) {
    throw new Error("No sketches configured.");
  }

  root.innerHTML = `
    <div class="page-shell">
      <header class="hero">
        <div class="hero__copy">
          <p class="eyebrow">Public Generative Motion Repo</p>
          <h1>Digital Harmony Studies</h1>
          <p class="hero__lede">
            A professional, source-aware John Whitney-inspired repository: deterministic browser loops, public-safe provenance labels, and a gallery that ships cleanly on GitHub Pages.
          </p>
          <div class="hero__meta">
            <span>TypeScript + Canvas 2D</span>
            <span>PNG + WebM export</span>
            <span>Loop-closure tests</span>
          </div>
        </div>
        <div class="hero__panel">
          <p class="panel-label">Why this structure</p>
          <p>
            The repo separates historical grounding from modern interpretation, keeps the runtime small enough for fast static hosting, and exposes the mathematical model directly instead of hiding it behind opaque sketch files.
          </p>
        </div>
      </header>

      <main class="layout">
        <section class="stage card">
          <div class="stage__canvas-wrap">
            <canvas id="preview-canvas" aria-label="Animated Whitney-inspired sketch preview"></canvas>
            <div class="stage__overlay">
              <span id="status-sketch">${initialSketch.title}</span>
              <span id="status-metrics"></span>
            </div>
          </div>
          <p id="export-status" class="export-status" aria-live="polite"></p>
          <div class="toolbar">
            <button id="toggle-playback" type="button">Pause</button>
            <button id="reset-loop" type="button">Reset Loop</button>
            <button id="download-frame" type="button">Download PNG</button>
            <button id="record-loop" type="button">Record WebM Loop</button>
          </div>
          <div class="controls">
            ${controlMarkup("speed", "Speed", defaultControls.speed, 0.35, 1.6, 0.05)}
            ${controlMarkup("density", "Density", defaultControls.density, 0.65, 1.5, 0.05)}
            ${controlMarkup("trail", "Trail", defaultControls.trail, 0.45, 1.35, 0.05)}
            ${controlMarkup("scale", "Scale", defaultControls.scale, 0.8, 1.25, 0.05)}
          </div>
        </section>

        <aside class="catalog">
          <section class="card">
            <div class="section-heading">
              <p class="panel-label">Sketch catalog</p>
              <h2>Release studies</h2>
            </div>
            <div class="sketch-list" id="sketch-list">
              ${sketches.map((sketch, index) => sketchCard(sketch, index === 0)).join("")}
            </div>
          </section>

          <section class="card" id="sketch-detail">
            ${detailMarkup(initialSketch, {
              playhead: 0,
              frameIndex: 0,
              framesPerLoop: initialSketch.durationSeconds * initialSketch.fps,
              durationSeconds: initialSketch.durationSeconds,
              sketchId: initialSketch.id
            })}
          </section>
        </aside>
      </main>

      <section class="scope-grid">
        ${scopeCards
          .map(
            (card) => `
              <article class="card scope-card">
                <p class="panel-label">${card.title}</p>
                <p>${card.text}</p>
              </article>
            `
          )
          .join("")}
      </section>

      <section class="info-grid">
        <article class="card">
          <div class="section-heading">
            <p class="panel-label">Technical model</p>
            <h2>Shared harmonic core</h2>
          </div>
          <p>
            Every sketch runs on the same normalized playhead, rational loop durations, shared runtime controls, and a primitive scene model of points plus paths. That keeps testing and export consistent across the catalog.
          </p>
        </article>
        <article class="card">
          <div class="section-heading">
            <p class="panel-label">Public release</p>
            <h2>Repo discipline</h2>
          </div>
          <p>
            The repo includes source-boundary documentation, a local-text leak check, browser-native export, and GitHub Pages deployment so the public artifact matches the implementation.
          </p>
        </article>
      </section>
    </div>
  `;

  const canvas = root.querySelector<HTMLCanvasElement>("#preview-canvas");
  const detail = root.querySelector<HTMLDivElement>("#sketch-detail");
  const sketchList = root.querySelector<HTMLDivElement>("#sketch-list");
  const statusSketch = root.querySelector<HTMLSpanElement>("#status-sketch");
  const statusMetrics = root.querySelector<HTMLSpanElement>("#status-metrics");
  const exportStatus = root.querySelector<HTMLParagraphElement>("#export-status");
  const togglePlaybackButton = root.querySelector<HTMLButtonElement>("#toggle-playback");
  const resetLoopButton = root.querySelector<HTMLButtonElement>("#reset-loop");
  const downloadFrameButton = root.querySelector<HTMLButtonElement>("#download-frame");
  const recordLoopButton = root.querySelector<HTMLButtonElement>("#record-loop");

  if (
    !canvas ||
    !detail ||
    !sketchList ||
    !statusSketch ||
    !statusMetrics ||
    !exportStatus ||
    !togglePlaybackButton ||
    !resetLoopButton ||
    !downloadFrameButton ||
    !recordLoopButton
  ) {
    throw new Error("Application shell did not render correctly.");
  }

  const player = new SketchPlayer(canvas, sketches, initialSketch.id);
  const webmSupported = supportsWebMRecording();
  if (!webmSupported) {
    recordLoopButton.disabled = true;
    exportStatus.textContent =
      "WebM recording is unavailable in this browser. PNG export still works.";
  } else {
    exportStatus.textContent =
      "Browser export is enabled: download the current frame or record one full loop as WebM.";
  }
  player.onFrame = (snapshot) => {
    statusSketch.textContent = player.activeSketch.title;
    statusMetrics.textContent = `${metricLabel(snapshot)} · frame ${snapshot.frameIndex
      .toString()
      .padStart(3, "0")}`;
    statusMetrics.textContent = `${formatMetricLabel(snapshot)} - frame ${snapshot.frameIndex
      .toString()
      .padStart(3, "0")}`;
  };
  player.start();

  const refreshDetail = (sketch: SketchSpec) => {
    detail.innerHTML = detailMarkup(sketch, player.getSnapshot());
    const cards = sketchList.querySelectorAll<HTMLButtonElement>("[data-sketch]");
    cards.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.sketch === sketch.id);
    });
  };

  sketchList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const button = target.closest<HTMLButtonElement>("[data-sketch]");
    if (!button) {
      return;
    }
    const sketch = sketches.find((candidate) => candidate.id === button.dataset.sketch);
    if (!sketch) {
      return;
    }
    player.setSketch(sketch);
    refreshDetail(sketch);
  });

  togglePlaybackButton.addEventListener("click", () => {
    player.togglePlayback();
    togglePlaybackButton.textContent = player.isPlaying ? "Pause" : "Resume";
  });

  resetLoopButton.addEventListener("click", () => {
    player.resetLoop();
    refreshDetail(player.activeSketch);
  });

  downloadFrameButton.addEventListener("click", async () => {
    downloadFrameButton.disabled = true;
    try {
      await player.downloadCurrentFrame();
      exportStatus.textContent = "PNG export started from the current frame.";
    } finally {
      downloadFrameButton.disabled = false;
    }
  });

  recordLoopButton.addEventListener("click", async () => {
    recordLoopButton.disabled = true;
    recordLoopButton.textContent = "Recording...";
    try {
      await player.recordLoop();
      exportStatus.textContent = "WebM loop export finished.";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "WebM recording failed in this browser.";
      exportStatus.textContent = message;
    } finally {
      recordLoopButton.disabled = !webmSupported;
      recordLoopButton.textContent = "Record WebM Loop";
      refreshDetail(player.activeSketch);
    }
  });

  const bindControl = (control: keyof RuntimeControls) => {
    const input = root.querySelector<HTMLInputElement>(`#${control}`);
    const output = root.querySelector<HTMLOutputElement>(`[data-output="${control}"]`);
    if (!input || !output) {
      return;
    }
    input.addEventListener("input", () => {
      const value = Number(input.value);
      output.value = value.toFixed(2);
      output.textContent = value.toFixed(2);
      player.setControl(control, value);
      refreshDetail(player.activeSketch);
    });
  };

  bindControl("speed");
  bindControl("density");
  bindControl("trail");
  bindControl("scale");

  const resize = () => player.resize();
  window.addEventListener("resize", resize);
}
