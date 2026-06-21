# Export Pipeline

## Browser-native outputs

The public site implements two direct outputs:

1. `Download PNG`
2. `Record WebM Loop`

The loop recorder resets the playhead to the start of the selected sketch, records one loop at the sketch's configured FPS, and downloads a `.webm` file.

## Expected outputs

- still frame: `png`
- web preview loop: `webm`
- derived sharing copies: `mp4`, `gif`
- committed documentation previews: `docs/assets/gifs/*.gif`

## Documentation GIF generation

The repository also includes lightweight GIF previews for GitHub README and docs rendering. Generate or refresh them with:

```bash
py -3 scripts/render_gifs.py
```

Current outputs:

- `docs/assets/gifs/catalog-radial-canon.gif`
- `docs/assets/gifs/permutations-lattice.gif`
- `docs/assets/gifs/matrix-polygon-study.gif`
- `docs/assets/gifs/arabesque-counterpoint.gif`
- `docs/assets/gifs/phase-bloom.gif`

These files are deterministic documentation renders derived from the corresponding sketch formulas. They are optimized for Markdown display and do not replace browser-native PNG or WebM export from the app.

## Recommended naming

- `exports/<sketch-id>-frame-0180.png`
- `exports/<sketch-id>-loop.webm`
- `exports/<sketch-id>-loop.mp4`
- `exports/<sketch-id>-loop.gif`

## FFmpeg derivatives

Convert the browser export to MP4:

```bash
ffmpeg -i exports/catalog-radial-canon-loop.webm -c:v libx264 -pix_fmt yuv420p exports/catalog-radial-canon-loop.mp4
```

Convert the browser export to GIF:

```bash
ffmpeg -i exports/catalog-radial-canon-loop.webm -vf "fps=24,scale=960:-1:flags=lanczos" exports/catalog-radial-canon-loop.gif
```

## Performance notes

- Prefer `webm` as the committed preview artifact when file size matters.
- Keep loop durations short and intentional; 6-12 seconds is the baseline range in this repo.
- Avoid committing dozens of redundant renders. Curate the gallery outputs.
