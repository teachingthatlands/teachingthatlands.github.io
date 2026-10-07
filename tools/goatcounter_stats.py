#!/usr/bin/env -S uv run -q
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Write site/public/stats.json from the GoatCounter API.

The /stats page draws its charts from that file. It holds totals and top-ten
lists only, nothing about any one visitor.

    GOATCOUNTER_TOKEN=... just stats

The token is a read-only GoatCounter API key. In CI it is the repo secret
GOATCOUNTER_TOKEN. Without it (branch builds, forks, local dev) or if the API
is down, this never fails the build: it keeps the last published stats.json
(marked stale) or writes {"available": false}, and the page says so.

Events come from site/src/scripts/analytics.ts: paths starting "download:" are
file downloads and "outbound:" are clicks to other sites.
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

SITE_CODE = os.environ.get("GOATCOUNTER_SITE", "teachingthatlands")
BASE = os.environ.get("GOATCOUNTER_BASE", f"https://{SITE_CODE}.goatcounter.com/api/v0")
LIVE = os.environ.get("STATS_LIVE_URL", "https://teachingthatlands.uk/stats.json")
OUT = Path(__file__).resolve().parent.parent / "site" / "public" / "stats.json"
DAYS = 90
TOP = 10


def api(path: str, token: str, **params) -> dict:
    url = f"{BASE}/{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}", "Accept": "application/json",
        "User-Agent": "teachingthatlands-stats"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    time.sleep(0.3)  # the API allows 4 requests a second
    return data


def day_of(s: str) -> str:
    return str(s)[:10]


def build(token: str) -> dict:
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=DAYS - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    q = {"start": start.strftime("%Y-%m-%dT%H:%M:%SZ"), "end": now.strftime("%Y-%m-%dT%H:%M:%SZ")}

    total = api("stats/total", token, **q)
    by_day = {day_of(d["day"]): int(d.get("daily") or 0) for d in total.get("stats", [])}
    daily = []
    for i in range(DAYS):
        d = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        daily.append({"day": d, "visits": by_day.get(d, 0)})

    hits = api("stats/hits", token, limit=100, **q).get("hits", [])
    pages, downloads, outbound = [], [], []
    for h in hits:
        path, count = str(h.get("path", "")), int(h.get("count") or 0)
        if not count:
            continue
        if path.startswith("download:"):
            downloads.append({"name": path[len("download:"):], "count": count})
        elif path.startswith("outbound:"):
            outbound.append({"name": path[len("outbound:"):], "count": count})
        elif not h.get("event"):
            pages.append({"name": path, "title": str(h.get("title") or ""), "count": count})

    def top(rows):
        return sorted(rows, key=lambda r: -r["count"])[:TOP]

    def ranked(page: str):
        rows = api(f"stats/{page}", token, limit=TOP, **q).get("stats", [])
        return [{"name": str(r.get("name") or "").strip() or "Unknown", "count": int(r.get("count") or 0)}
                for r in rows if r.get("count")]

    first = next((d["day"] for d in daily if d["visits"]), None)
    return {
        "available": True, "stale": False,
        "generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "range": {"start": daily[0]["day"], "end": daily[-1]["day"], "days": DAYS},
        "firstDay": first,
        "totals": {
            "visits": sum(d["visits"] for d in daily),
            "visits30": sum(d["visits"] for d in daily[-30:]),
            "downloads": sum(r["count"] for r in downloads),
            "outbound": sum(r["count"] for r in outbound),
        },
        "daily": daily,
        "pages": top(pages), "downloads": top(downloads), "outbound": top(outbound),
        "referrers": ranked("toprefs"), "countries": ranked("locations"),
        "devices": ranked("sizes"), "languages": ranked("languages"),
    }


def last_published() -> dict | None:
    """The stats.json now live on the site, so an API outage doesn't blank the page."""
    try:
        with urllib.request.urlopen(LIVE, timeout=20) as r:
            data = json.load(r)
        return data if isinstance(data, dict) and data.get("available") else None
    except Exception:
        return None


def main() -> int:
    token = os.environ.get("GOATCOUNTER_TOKEN", "").strip()
    result = None
    if not token:
        print("stats: no GOATCOUNTER_TOKEN; skipping the fetch", file=sys.stderr)
    else:
        try:
            result = build(token)
        except (urllib.error.URLError, ValueError, KeyError, TypeError, OSError) as e:
            # Never print the request URL's headers; the error text is enough.
            print(f"stats: GoatCounter fetch failed: {type(e).__name__}: {e}", file=sys.stderr)
    if result is None:
        result = last_published()
        if result:
            result["stale"] = True
            print("stats: kept the last published stats.json (marked stale)", file=sys.stderr)
        else:
            result = {"available": False}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=1, ensure_ascii=False) + "\n")
    t = result.get("totals", {})
    print(f"stats: wrote {OUT.relative_to(OUT.parent.parent.parent)} "
          f"(available={result['available']}, visits={t.get('visits')})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
