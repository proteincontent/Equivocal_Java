#!/usr/bin/env python3
"""
Create a labeled thumbnail grid from exported slide images.

Typical usage:
  python tools/pptx_make_grid.py --input thumbs --output thumbs_grid.jpg --cols 5
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def slide_index(p: Path) -> int:
    m = re.search(r"(\d+)$", p.stem)
    return int(m.group(1)) if m else 10**9


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Input directory with slide-XX.jpg files")
    ap.add_argument("--output", required=True, help="Output grid image path (.jpg or .png)")
    ap.add_argument("--cols", type=int, default=5, help="Columns in grid (default: 5)")
    ap.add_argument("--thumb-width", type=int, default=360, help="Thumbnail width in px (default: 360)")
    args = ap.parse_args()

    indir = Path(args.input)
    # On Windows, glob patterns can be effectively case-insensitive, which may duplicate entries
    # if we glob both "*.jpg" and "*.JPG". De-duplicate by normalized filename.
    candidates = [p for p in indir.iterdir() if p.is_file() and p.suffix.lower() == ".jpg"]
    uniq_by_name = {p.name.lower(): p for p in candidates}
    images = sorted(uniq_by_name.values(), key=slide_index)
    if not images:
        raise SystemExit(f"No JPG images found in: {indir}")

    cols = max(1, args.cols)
    thumb_w = max(120, args.thumb_width)
    pad = 16
    label_h = 34

    with Image.open(images[0]) as im0:
        aspect = im0.height / im0.width
    thumb_h = int(thumb_w * aspect)

    rows = (len(images) + cols - 1) // cols
    out_w = cols * thumb_w + (cols + 1) * pad
    out_h = rows * (thumb_h + label_h) + (rows + 1) * pad

    out = Image.new("RGB", (out_w, out_h), "white")
    draw = ImageDraw.Draw(out)

    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        font = ImageFont.load_default()

    for idx, path in enumerate(images, start=1):
        r = (idx - 1) // cols
        c = (idx - 1) % cols
        x0 = pad + c * (thumb_w + pad)
        y0 = pad + r * (thumb_h + label_h + pad)

        label = f"Slide {idx}"
        draw.text((x0, y0), label, fill="black", font=font)

        with Image.open(path) as im:
            im = im.convert("RGB").resize((thumb_w, thumb_h))
            out.paste(im, (x0, y0 + label_h))

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(out_path, quality=92)
    print(str(out_path))


if __name__ == "__main__":
    main()
