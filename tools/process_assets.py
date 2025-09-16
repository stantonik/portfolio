#! /usr/bin/env python3
# vim:fenc=utf-8
#
# Copyright (C) 2025 Stanley Arnaud <stantonik@stantonik-mba.local>
#
# Distributed under terms of the MIT license.

"""

"""

from pathlib import Path
from PIL import Image, ImageOps
import ffmpeg
import sys
import shutil

MAX_WIDTH = 1920
MAX_HEIGHT = 1080

# Supported extensions
IMAGE_EXTS = ('.png', '.jpg', '.jpeg')
VIDEO_EXTS = ('.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm')

def convert_images_to_webp(image_path: Path, original_dir: Path):
    webp_path = image_path.with_suffix('.webp')
    if webp_path.exists():
        return
    try:
        img = Image.open(image_path)
        img = ImageOps.exif_transpose(img)
        if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
            img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
        img = img.convert("RGBA")
        img.save(webp_path, "WEBP", quality=80, lossless=False)
        shutil.move(image_path, original_dir/image_path.name)
        print(f"Image converted: {image_path} → {webp_path}")
    except Exception as e:
        print(f"Failed to convert image {image_path}: {e}")

def convert_videos_to_mp4(video_path: Path, original_dir: Path, max_height=720):
    mp4_path = video_path.with_suffix('.mp4')
    if mp4_path.exists():
        return

    try:
        # Probe input to get original width/height
        probe = ffmpeg.probe(str(video_path))
        video_stream = next((s for s in probe['streams'] if s['codec_type'] == 'video'), None)
        if not video_stream:
            print(f"No video stream found in {video_path}")
            return
        height = int(video_stream['height'])
        scale_filter = f"scale=-2:{max_height}" if height > max_height else "scale=-2:-2"

        (
            ffmpeg
            .input(str(video_path))
            .output(
                str(mp4_path),
                vcodec='libx264',
                acodec='aac',
                video_bitrate='1000k',    # adjust bitrate for web
                audio_bitrate='128k',
                preset='veryfast',            # faster encoding
                pix_fmt='yuv420p',
                vf=scale_filter,
                r=24,
            )
            .overwrite_output()
            .run(quiet=True)
        )

        # Move original to backup folder
        shutil.move(video_path, original_dir / video_path.name)
        print(f"Video converted: {video_path} → {mp4_path}")

    except ffmpeg.Error as e:
        print(f"Failed to convert video {video_path}: {e}")

# def process_assets(root_dir='.'):
#     root = Path(root_dir)
#     for assets_folder in root.rglob('assets'):
#         if assets_folder.is_dir():
#             print(f"Processing folder: {assets_folder}")
#             for file_path in assets_folder.rglob('*'):
#                 if file_path.is_file():
#                     ext = file_path.suffix.lower()
#                     if ext in IMAGE_EXTS:
#                         convert_images_to_webp(file_path)
#                     elif ext in VIDEO_EXTS:
#                         convert_videos_to_mp4(file_path)

dir = Path(sys.argv[1])
if not dir.exists():
    raise FileNotFoundError(f"{dir} not found.")

ORIGINAL_DIR = dir/"original"
ORIGINAL_DIR.mkdir(exist_ok=True)

for file_path in dir.rglob('*'):
    if "original" in [p.name for p in file_path.parents]:
        continue
    if file_path.is_file():
        ext = file_path.suffix.lower()
        if ext in IMAGE_EXTS:
            convert_images_to_webp(file_path, ORIGINAL_DIR)
        elif ext in VIDEO_EXTS:
            convert_videos_to_mp4(file_path, ORIGINAL_DIR)
