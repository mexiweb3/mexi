"""
Resolve monos.sol on Solana Name Service and pull every NFT held by the
resulting wallet via Magic Eden's public API. Writes a clean
{name, image, mint} list to data/monos-sol-nfts.json.

Usage: python3 scripts/fetch_nfts.py
"""
from __future__ import annotations
import json
import sys
import unicodedata
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "monos-sol-nfts.json"
OUT.parent.mkdir(parents=True, exist_ok=True)

SNS_RESOLVE = "https://sns-sdk-proxy.bonfida.workers.dev/resolve/{name}"
ME_TOKENS   = ("https://api-mainnet.magiceden.dev/v2/wallets/"
               "{wallet}/tokens?offset={offset}&limit=100")

UA = "Mozilla/5.0 (compatible; MonosSolCatalog/1.0)"

def resolve_domain(name: str) -> str:
    r = requests.get(SNS_RESOLVE.format(name=name),
                     headers={"User-Agent": UA}, timeout=20)
    r.raise_for_status()
    payload = r.json()
    if payload.get("s") != "ok" or not payload.get("result"):
        raise RuntimeError(f"Could not resolve {name}.sol: {payload}")
    return payload["result"]

def fetch_all_nfts(wallet: str) -> list[dict]:
    out: list[dict] = []
    offset = 0
    while True:
        r = requests.get(ME_TOKENS.format(wallet=wallet, offset=offset),
                         headers={"User-Agent": UA}, timeout=30)
        r.raise_for_status()
        page = r.json()
        if not isinstance(page, list) or not page:
            break
        out.extend(page)
        if len(page) < 100:
            break
        offset += 100
    return out

def fold(s: str) -> str:
    s = (s or "").lower()
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")

def main():
    domain = "monos"
    wallet = resolve_domain(domain)
    print(f"{domain}.sol -> {wallet}")
    raw = fetch_all_nfts(wallet)
    print(f"Found {len(raw)} NFTs")

    catalog = [{
        "name": (n.get("name") or "(sin título)").strip(),
        "image": n.get("image") or "",
        "mint":  n.get("mintAddress") or "",
    } for n in raw if n.get("image")]
    catalog.sort(key=lambda x: fold(x["name"]))

    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2),
                   encoding="utf-8")
    print(f"Wrote {OUT}  ({len(catalog)} entries)")

if __name__ == "__main__":
    main()
