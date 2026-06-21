import type { SceneFrame, Viewport } from "./types";

function rgba([r, g, b]: [number, number, number], alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createViewport(width: number, height: number): Viewport {
  return {
    width,
    height,
    min: Math.min(width, height),
    max: Math.max(width, height),
    center: { x: width / 2, y: height / 2 }
  };
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: SceneFrame,
  viewport: Viewport,
  hardReset = false
): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = rgba(scene.background, hardReset ? 1 : scene.fadeAlpha);
  ctx.fillRect(0, 0, viewport.width, viewport.height);
  ctx.restore();

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const path of scene.paths) {
    if (path.points.length === 0) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let index = 1; index < path.points.length; index += 1) {
      ctx.lineTo(path.points[index].x, path.points[index].y);
    }
    if (path.closed) {
      ctx.closePath();
    }
    ctx.globalAlpha = path.alpha ?? 1;
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.stroke();
  }

  ctx.globalCompositeOperation = scene.blendMode ?? "lighter";
  for (const point of scene.points) {
    ctx.beginPath();
    ctx.globalAlpha = point.alpha ?? 1;
    ctx.fillStyle = point.color;
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

