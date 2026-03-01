#!/usr/bin/env python3
"""Generate PWA icons for SesomNod Engine."""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size: int, output_path: str):
    # Dark background
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255))  # #0f172a
    draw = ImageDraw.Draw(img)

    # Outer circle (amber/gold)
    margin = size * 0.08
    circle_bbox = [margin, margin, size - margin, size - margin]
    draw.ellipse(circle_bbox, outline=(245, 158, 11, 255), width=max(2, size // 32))

    # Inner filled circle
    inner_margin = size * 0.18
    inner_bbox = [inner_margin, inner_margin, size - inner_margin, size - inner_margin]
    draw.ellipse(inner_bbox, fill=(30, 41, 59, 255))  # #1e293b

    # Letter "S" in center
    font_size = int(size * 0.42)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()

    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) / 2 - bbox[0]
    y = (size - text_h) / 2 - bbox[1]
    draw.text((x, y), text, fill=(245, 158, 11, 255), font=font)

    # Small dot accent
    dot_r = size * 0.04
    dot_x = size * 0.72
    dot_y = size * 0.28
    draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
                 fill=(34, 197, 94, 255))  # green dot

    img.save(output_path, 'PNG')
    print(f"Created {output_path} ({size}x{size})")

os.makedirs('public', exist_ok=True)
create_icon(192, 'public/icon-192x192.png')
create_icon(512, 'public/icon-512x512.png')
print("Icons generated successfully!")
