#!/usr/bin/env python3
"""Generate images via OpenRouter using Gemini image-capable models.

Usage:
    python generate_image.py "A watercolor painting of a cat" -o output.png
    python generate_image.py "Logo design for a coffee shop" -o logo.png -m google/gemini-3-pro-image-preview
    python generate_image.py "A sunset over mountains" -o sunset.png -n 2

Requires:
    - OPENROUTER_API_KEY environment variable
    - requests library
"""

import argparse
import base64
import os
import sys
import time
from pathlib import Path

DEFAULT_MODEL = "google/gemini-3.1-flash-image-preview"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MAX_RETRIES = 3


def generate_image(
    prompt: str,
    output_path: str,
    model: str = DEFAULT_MODEL,
    num_images: int = 1,
    api_key: str | None = None,
) -> list[str]:
    """Generate one or more images from a text prompt via OpenRouter."""
    api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["image", "text"],
    }

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    saved_files: list[str] = []
    for batch_idx in range(num_images):
        response = _request_with_retry(headers, payload)
        data = response.json()

        if "error" in data:
            print(f"API error: {data['error']}", file=sys.stderr)
            sys.exit(1)

        try:
            message = data["choices"][0]["message"]
        except (KeyError, IndexError) as exc:
            raise RuntimeError(f"Unexpected response format: {data}") from exc

        images_saved = _extract_and_save_images(message, output, batch_idx, num_images)
        saved_files.extend(images_saved)

        text_response = _extract_text(message)
        if text_response:
            print(f"Model response: {text_response}")

    if not saved_files:
        print("Warning: No images were returned by the model.", file=sys.stderr)

    return saved_files


def _request_with_retry(headers: dict, payload: dict):
    import requests

    last_response = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
            last_response = response
            if response.status_code == 429:
                wait_seconds = 2 ** (attempt + 1)
                print(f"Rate limited, retrying in {wait_seconds}s...", file=sys.stderr)
                time.sleep(wait_seconds)
                continue
            if response.status_code >= 500:
                wait_seconds = 2 ** (attempt + 1)
                print(
                    f"Server error {response.status_code}, retrying in {wait_seconds}s...",
                    file=sys.stderr,
                )
                time.sleep(wait_seconds)
                continue
            response.raise_for_status()
            return response
        except requests.exceptions.Timeout:
            if attempt < MAX_RETRIES - 1:
                print("Request timed out, retrying...", file=sys.stderr)
                continue
            raise

    if last_response is None:
        raise RuntimeError("Image generation request did not produce a response.")
    return last_response


def _extract_and_save_images(message: dict, output: Path, batch_idx: int, total_batches: int) -> list[str]:
    saved: list[str] = []

    content = message.get("content")
    if isinstance(content, list):
        image_count = 0
        for part in content:
            if isinstance(part, dict) and "inline_data" in part:
                inline = part["inline_data"]
                mime_type = inline.get("mime_type", "image/png")
                extension = "png" if "png" in mime_type else "jpg"
                file_path = _build_path(output, batch_idx, image_count, total_batches, extension)
                _save_base64(inline["data"], file_path)
                saved.append(str(file_path))
                image_count += 1

    images = message.get("images")
    if isinstance(images, list):
        for image_idx, image in enumerate(images):
            image_url = image.get("image_url", {}).get("url", "")
            if image_url.startswith("data:"):
                encoded = image_url.split(",", 1)[1]
                extension = "png" if "png" in image_url else "jpg"
                file_path = _build_path(output, batch_idx, image_idx, total_batches, extension)
                _save_base64(encoded, file_path)
                saved.append(str(file_path))

    return saved


def _extract_text(message: dict) -> str:
    content = message.get("content", "")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = [part.get("text", "") for part in content if isinstance(part, dict) and "text" in part]
        return " ".join(texts).strip()
    return ""


def _build_path(output: Path, batch_idx: int, image_idx: int, total_batches: int, extension: str) -> Path:
    if total_batches == 1 and image_idx == 0:
        return output.with_suffix(f".{extension}") if output.suffix == "" else output
    suffix = f"_{batch_idx * 10 + image_idx + 1}"
    return output.parent / f"{output.stem}{suffix}.{extension}"


def _save_base64(encoded: str, file_path: Path) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(base64.b64decode(encoded))
    print(f"Saved: {file_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate images via OpenRouter")
    parser.add_argument("prompt", help="Text prompt describing the image to generate")
    parser.add_argument(
        "-o",
        "--output",
        default="generated_image.png",
        help="Output file path (default: generated_image.png)",
    )
    parser.add_argument(
        "-m",
        "--model",
        default=DEFAULT_MODEL,
        help=f"Model ID (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "-n",
        "--num-images",
        type=int,
        default=1,
        help="Number of images to generate (default: 1)",
    )
    args = parser.parse_args()

    generate_image(args.prompt, args.output, model=args.model, num_images=args.num_images)


if __name__ == "__main__":
    main()
