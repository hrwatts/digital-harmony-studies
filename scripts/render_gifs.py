from __future__ import annotations

import colorsys
import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageColor, ImageDraw


TAU = math.tau
WIDTH = 360
HEIGHT = 360
FRAME_COUNT = 28
TRAIL_SAMPLE_STEPS = 7
OUTPUT_DIR = Path("docs/assets/gifs")


@dataclass(frozen=True)
class Viewport:
    width: int = WIDTH
    height: int = HEIGHT

    @property
    def center(self) -> tuple[float, float]:
        return (self.width / 2, self.height / 2)

    @property
    def min_dim(self) -> int:
        return min(self.width, self.height)


VIEWPORT = Viewport()


def hsla(hue: float, saturation: float, lightness: float, alpha: float = 1.0) -> tuple[int, int, int, int]:
    r, g, b = colorsys.hls_to_rgb((hue % 360) / 360.0, lightness / 100.0, saturation / 100.0)
    return (
        int(round(r * 255)),
        int(round(g * 255)),
        int(round(b * 255)),
        int(round(max(0.0, min(1.0, alpha)) * 255)),
    )


def tonal_shift(base_hue: float, index: int, spread: float) -> float:
    return (base_hue + index * spread + 360) % 360


def hash_string(value: str) -> int:
    hash_value = 1779033703 ^ len(value)
    for char in value:
        hash_value = ((hash_value ^ ord(char)) * 3432918353) & 0xFFFFFFFF
        hash_value = ((hash_value << 13) | (hash_value >> 19)) & 0xFFFFFFFF
    return hash_value or 1


def mulberry32(seed: int):
    state = seed & 0xFFFFFFFF

    def random() -> float:
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        temp = state
        temp = (temp ^ (temp >> 15)) * (1 | temp)
        temp &= 0xFFFFFFFF
        temp ^= temp + (((temp ^ (temp >> 7)) * (61 | temp)) & 0xFFFFFFFF)
        temp &= 0xFFFFFFFF
        return ((temp ^ (temp >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return random


def seeded_offsets(seed: str, count: int, amplitude: float) -> list[float]:
    random = mulberry32(hash_string(seed))
    return [(random() * 2.0 - 1.0) * amplitude for _ in range(count)]


def golden_angle_sequence(count: int, offset: float = 0.0) -> list[float]:
    golden_angle = math.pi * (3 - math.sqrt(5))
    return [offset + golden_angle * index for index in range(count)]


def orbit_point(origin: tuple[float, float], radius: float, angle: float) -> tuple[float, float]:
    return origin[0] + math.cos(angle) * radius, origin[1] + math.sin(angle) * radius


def circle_points(radius: float, samples: int, center: tuple[float, float]) -> list[tuple[float, float]]:
    return [
        (center[0] + math.cos(TAU * index / samples) * radius, center[1] + math.sin(TAU * index / samples) * radius)
        for index in range(samples)
    ]


def regular_polygon(sides: int, radius: float, rotation: float, center: tuple[float, float]) -> list[tuple[float, float]]:
    return [
        (
            center[0] + math.cos(rotation + TAU * index / sides) * radius,
            center[1] + math.sin(rotation + TAU * index / sides) * radius,
        )
        for index in range(sides)
    ]


def lissajous_path(
    amplitude_x: float,
    amplitude_y: float,
    a: int,
    b: int,
    phase_x: float,
    phase_y: float,
    samples: int,
) -> list[tuple[float, float]]:
    return [
        (
            math.sin(a * (TAU * index / samples) + phase_x) * amplitude_x,
            math.sin(b * (TAU * index / samples) + phase_y) * amplitude_y,
        )
        for index in range(samples)
    ]


def fade_canvas(canvas: Image.Image, background_hex: str, fade_alpha: float) -> None:
    overlay = Image.new("RGBA", canvas.size, ImageColor.getrgb(background_hex) + (int(round(max(0.0, min(1.0, fade_alpha)) * 255)),))
    canvas.alpha_composite(overlay)


def draw_point(draw: ImageDraw.ImageDraw, x: float, y: float, radius: float, color: tuple[int, int, int, int]) -> None:
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)


def quantize_frames(frames: list[Image.Image]) -> list[Image.Image]:
    palette_frames = []
    for frame in frames:
      palette_frames.append(frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=96))
    return palette_frames


def save_gif(filename: str, frames: list[Image.Image]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    palette_frames = quantize_frames(frames)
    palette_frames[0].save(
        OUTPUT_DIR / filename,
        save_all=True,
        append_images=palette_frames[1:],
        optimize=True,
        duration=95,
        loop=0,
        disposal=2,
    )


def render_catalog_radial_canon() -> list[Image.Image]:
    offsets = seeded_offsets("catalog-radial-canon", 192, 0.08)
    frames: list[Image.Image] = []
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), "#090d18")

    for frame_index in range(FRAME_COUNT):
        fade_canvas(canvas, "#090d18", 0.13)
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        t = TAU * (frame_index / FRAME_COUNT)
        base = VIEWPORT.min_dim * 0.34

        for ring_index, ring_radius in enumerate((base * 0.65, base, base * 1.32)):
            draw.line(
                circle_points(ring_radius, 96, VIEWPORT.center) + [circle_points(ring_radius, 96, VIEWPORT.center)[0]],
                fill=hsla(42 + ring_index * 18, 35, 55, 0.28),
                width=1,
            )

        count = 110
        for index in range(count):
            phase = TAU * index / count + offsets[index % len(offsets)]
            radius = base * (0.72 + 0.28 * math.sin(3 * t + phase * 1.5))
            angle = 2 * t + phase
            x, y = orbit_point(VIEWPORT.center, radius, angle)
            y += math.sin(5 * t + phase * 0.75) * base * 0.18
            color = hsla(tonal_shift(28, index % 5, 28), 82, 70, 0.74)
            draw_point(draw, x, y, 1.8 + (index % 3), color)

        canvas.alpha_composite(layer)
        frames.append(canvas.copy())

    return frames


def render_permutations_lattice() -> list[Image.Image]:
    offsets = seeded_offsets("permutations-lattice", 256, 0.12)
    frames: list[Image.Image] = []
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), "#070c14")

    for frame_index in range(FRAME_COUNT):
        fade_canvas(canvas, "#070c14", 0.18)
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        t = TAU * (frame_index / FRAME_COUNT)
        cols = 14
        rows = 9

        for column_index in range(0, cols, 2):
            sampled = []
            for row in range(rows):
                index = row * cols + column_index
                phase = offsets[index % len(offsets)] + ((row * 3 + column_index * 5) % 11) * (TAU / 11)
                anchor_x = WIDTH * 0.16 + (WIDTH * 0.68) * (column_index / (cols - 1))
                anchor_y = HEIGHT * 0.18 + (HEIGHT * 0.64) * (row / (rows - 1))
                sampled.append(
                    (
                        anchor_x + math.sin(3 * t + phase) * VIEWPORT.min_dim * 0.035,
                        anchor_y + math.sin(4 * t + phase * 1.4) * VIEWPORT.min_dim * 0.035,
                    )
                )
            draw.line(sampled, fill=hsla(192 + column_index * 4, 60, 60, 0.34), width=1)

        for row in range(rows):
            for col in range(cols):
                index = row * cols + col
                phase = offsets[index % len(offsets)] + ((row * 3 + col * 5) % 11) * (TAU / 11)
                anchor_x = WIDTH * 0.16 + (WIDTH * 0.68) * (col / (cols - 1))
                anchor_y = HEIGHT * 0.18 + (HEIGHT * 0.64) * (row / (rows - 1))
                x = anchor_x + math.sin(3 * t + phase) * VIEWPORT.min_dim * 0.035
                y = anchor_y + math.sin(4 * t + phase * 1.4) * VIEWPORT.min_dim * 0.035
                color = hsla(tonal_shift(190, (row + col) % 6, 17), 80, 72, 0.82)
                draw_point(draw, x, y, 2.1, color)

        canvas.alpha_composite(layer)
        frames.append(canvas.copy())

    return frames


def render_matrix_polygon_study() -> list[Image.Image]:
    frames: list[Image.Image] = []
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), "#080912")

    for frame_index in range(FRAME_COUNT):
        fade_canvas(canvas, "#080912", 0.2)
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        t = TAU * (frame_index / FRAME_COUNT)
        center = VIEWPORT.center
        base = VIEWPORT.min_dim * 0.18

        families = [
            (3, base * (1.25 + 0.08 * math.sin(2 * t)), t, hsla(36, 90, 72, 0.76)),
            (4, base * (1.7 + 0.1 * math.sin(3 * t + 0.4)), t + math.pi / 4, hsla(196, 78, 72, 0.74)),
            (6, base * (2.25 + 0.12 * math.sin(4 * t + 0.8)), 2 * t, hsla(310, 68, 76, 0.66)),
        ]

        for sides, radius, rotation, color in families:
            polygon = regular_polygon(sides, radius, rotation, center)
            draw.line(polygon + [polygon[0]], fill=color, width=2)
            for index, vertex in enumerate(polygon):
                draw_point(draw, vertex[0], vertex[1], 3 + (index % 2), color)

        canvas.alpha_composite(layer)
        frames.append(canvas.copy())

    return frames


def render_arabesque_counterpoint() -> list[Image.Image]:
    frames: list[Image.Image] = []
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), "#0a0812")

    for frame_index in range(FRAME_COUNT):
        fade_canvas(canvas, "#0a0812", 0.1)
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        t = TAU * (frame_index / FRAME_COUNT)
        center = VIEWPORT.center
        base = VIEWPORT.min_dim * 0.25

        for index in range(5):
            path = lissajous_path(
                amplitude_x=base * (1.2 + index * 0.13),
                amplitude_y=base * (0.6 + index * 0.1),
                a=2 + index,
                b=3 + index,
                phase_x=t + index * 0.4,
                phase_y=index * 0.9 - 2 * t,
                samples=120,
            )
            shifted = [(center[0] + x, center[1] + y) for x, y in path]
            draw.line(shifted, fill=hsla(tonal_shift(32, index, 38), 82, 70, 0.24), width=2 + index // 2)

        count = 116
        for index in range(count):
            phase = TAU * index / count
            x = center[0] + math.sin(3 * t + phase) * base * 1.35 + math.sin(9 * t + phase * 0.5) * base * 0.14
            y = center[1] + math.sin(4 * t + phase * 1.2) * base * 0.82 + math.cos(7 * t + phase) * base * 0.18
            color = hsla(tonal_shift(18, index % 7, 22), 88, 76, 0.74)
            draw_point(draw, x, y, 1.8 + (index % 3), color)

        canvas.alpha_composite(layer)
        frames.append(canvas.copy())

    return frames


def render_phase_bloom() -> list[Image.Image]:
    phases = golden_angle_sequence(220)
    frames: list[Image.Image] = []
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), "#060b13")

    for frame_index in range(FRAME_COUNT):
        fade_canvas(canvas, "#060b13", 0.12)
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        t = TAU * (frame_index / FRAME_COUNT)
        center = VIEWPORT.center
        base = VIEWPORT.min_dim * 0.34

        for index, phase in enumerate(phases):
            radial_bias = index / (len(phases) - 1)
            radius = base * (0.18 + radial_bias * 0.92) + math.sin(4 * t + phase * 0.35) * base * 0.06
            angle = phase + 5 * t + math.sin(3 * t + phase) * 0.14
            x = center[0] + math.cos(angle) * radius
            y = center[1] + math.sin(angle) * radius * (0.88 + 0.12 * math.sin(t))
            color = hsla(208 + radial_bias * 88, 86, 74, 0.7)
            draw_point(draw, x, y, 1.2 + radial_bias * 3.1, color)

        canvas.alpha_composite(layer)
        frames.append(canvas.copy())

    return frames


def main() -> None:
    renders = {
        "catalog-radial-canon.gif": render_catalog_radial_canon(),
        "permutations-lattice.gif": render_permutations_lattice(),
        "matrix-polygon-study.gif": render_matrix_polygon_study(),
        "arabesque-counterpoint.gif": render_arabesque_counterpoint(),
        "phase-bloom.gif": render_phase_bloom(),
    }

    for filename, frames in renders.items():
        save_gif(filename, frames)
        size_kb = (OUTPUT_DIR / filename).stat().st_size / 1024
        print(f"{filename}\t{size_kb:.1f} KB")


if __name__ == "__main__":
    main()
