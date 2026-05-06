"""
Download every NFT image listed in data/monos-sol-nfts.json into
build/images/<mint>.jpg, normalising to JPEG and resizing to a long edge of
900 px. Falls back across multiple IPFS gateways.

Usage: python3 scripts/fetch_images.py
"""
from __future__ import annotations
import io
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "monos-sol-nfts.json"
OUT  = ROOT / "build" / "images"
OUT.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
TIMEOUT = 45
MAX_LONG_EDGE = 900

def variants(url: str) -> list[str]:
    """Alternate gateways for the same content."""
    out = [url]
    if "ipfs.dweb.link" in url:
        host = url.split("//", 1)[1].split("/", 1)[0]
        cid = host.split(".ipfs.dweb.link")[0]
        qs = "?" + url.split("?", 1)[1] if "?" in url else ""
        for g in ("ipfs.io", "cloudflare-ipfs.com",
                  "nftstorage.link", "w3s.link", "gateway.pinata.cloud"):
            out.append(f"https://{g}/ipfs/{cid}{qs}")
    if "arweave.net" in url:
        out.append(url.replace("www.arweave.net", "arweave.net"))
    # de-dup, keep order
    return list(dict.fromkeys(out))

def normalise(im: Image.Image) -> Image.Image:
    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        if im.mode == "P":
            im = im.convert("RGBA")
        mask = im.split()[-1] if im.mode in ("RGBA", "LA") else None
        bg.paste(im, mask=mask)
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")
    w, h = im.size
    m = max(w, h)
    if m > MAX_LONG_EDGE:
        s = MAX_LONG_EDGE / m
        im = im.resize((int(w * s), int(h * s)), Image.LANCZOS)
    return im

def fetch_one(item: dict) -> tuple[str, str | None, str | None]:
    mint = item["mint"]
    url = item["image"]
    target = OUT / f"{mint}.jpg"
    if target.exists() and target.stat().st_size > 1000:
        return mint, str(target), None

    last_err: str | None = None
    for u in variants(url):
        try:
            r = requests.get(u, headers={"User-Agent": UA}, timeout=TIMEOUT)
            if not r.ok or len(r.content) < 500:
                last_err = f"HTTP {r.status_code}"; continue
            im = Image.open(io.BytesIO(r.content)); im.load()
            normalise(im).save(target, "JPEG", quality=82, optimize=True)
            return mint, str(target), None
        except Exception as e:  # noqa: BLE001
            last_err = str(e)[:120]; continue
    return mint, None, last_err

def main():
    items = json.loads(DATA.read_text(encoding="utf-8"))
    ok, fail = 0, []
    with ThreadPoolExecutor(max_workers=12) as ex:
        for f in as_completed(ex.submit(fetch_one, it) for it in items):
            mint, path, err = f.result()
            if path:
                ok += 1
            else:
                fail.append((mint, err))
            sys.stdout.write(f"\rok={ok}  failed={len(fail)}"); sys.stdout.flush()
    print()
    print(f"Downloaded {ok}/{len(items)}")
    if fail:
        print("Failures (token, error):")
        for m, e in fail[:30]:
            print(f"  - {m}  {e}")

if __name__ == "__main__":
    main()
