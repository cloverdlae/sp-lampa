#!/usr/bin/env python3
"""
Build catalog.json from public metadata pages.

This script collects:
- season number
- episode number
- title
- description
- poster / og:image
- public page URL

It does not extract embedded-player URLs, hidden stream manifests or tokens.
"""

from __future__ import annotations

import concurrent.futures
import datetime as dt
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE = "https://kill-kenny.com"
OUT = Path(__file__).resolve().parents[1] / "catalog.json"

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 Chrome/124 Safari/537.36"
    ),
    "Accept-Language": "ru,en;q=0.8",
})

EPISODE_URL_RE = re.compile(
    r"(?:^|/)(?:\d+-)?(?P<season>\d+)-sezon-(?P<episode>\d+)-ser(?:ija|iya)(?:-|\.|/)",
    re.I,
)

TITLE_RE = re.compile(
    r"(?P<season>\d+)\s*сезон\s*(?P<episode>\d+)\s*сер(?:ия|ии)\s*[:\-–—]?\s*(?P<title>.*)$",
    re.I,
)

DESCRIPTION_SELECTORS = [
    '[itemprop="description"]',
    ".episode-description",
    ".full-text",
    ".fullstory",
    ".full-story",
    ".story-text",
    ".story",
    ".article-text",
    ".post-text",
]


def season_url(number: int) -> str:
    return f"{BASE}/season-{number:02d}/" if number < 10 else f"{BASE}/season-{number}/"


def get(url: str, retries: int = 3) -> str:
    last = None

    for attempt in range(retries):
        try:
            response = SESSION.get(url, timeout=25)
            response.raise_for_status()
            response.encoding = response.apparent_encoding or response.encoding
            return response.text
        except Exception as exc:
            last = exc
            time.sleep(1.5 * (attempt + 1))

    raise RuntimeError(f"GET failed {url}: {last}")


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse_episode_ref(anchor, expected_season: int):
    href = anchor.get("href") or ""
    absolute = urljoin(BASE + "/", href)
    match_url = EPISODE_URL_RE.search(absolute)

    if not match_url:
        return None

    season = int(match_url.group("season"))
    episode = int(match_url.group("episode"))

    if season != expected_season:
        return None

    raw_title = clean_text(anchor.get("title") or anchor.get_text(" ", strip=True))
    match_title = TITLE_RE.search(raw_title)

    title = raw_title
    if match_title:
        title = clean_text(match_title.group("title"))

    if not title:
        title = f"{episode} серия"

    return {
        "season": season,
        "episode": episode,
        "title": title,
        "page_url": absolute,
    }


def parse_season(number: int):
    html = get(season_url(number))
    soup = BeautifulSoup(html, "html.parser")
    by_episode = {}

    for anchor in soup.select("a[href]"):
        item = parse_episode_ref(anchor, number)
        if item:
            by_episode[item["episode"]] = item

    episodes = [by_episode[key] for key in sorted(by_episode)]

    return {
        "season": number,
        "title": f"{number} сезон",
        "episodes": episodes,
    }


def description_from_page(soup: BeautifulSoup) -> str:
    for selector in DESCRIPTION_SELECTORS:
        node = soup.select_one(selector)
        if not node:
            continue

        for junk in node.select("script,style,iframe,form,button,input,textarea,nav"):
            junk.decompose()

        text = clean_text(node.get_text(" ", strip=True))
        if 60 <= len(text) <= 4000:
            return text

    paragraphs = []
    for paragraph in soup.select("p")[:30]:
        text = clean_text(paragraph.get_text(" ", strip=True))

        if not text or len(text) < 45:
            continue

        if re.match(
            r"^(смотреть онлайн|оцени серию|поделись|добавить в закладки|комментарии|плеер)",
            text,
            re.I,
        ):
            break

        paragraphs.append(text)

        if len(paragraphs) >= 4:
            break

    if paragraphs:
        return " ".join(paragraphs)

    meta = (
        soup.select_one('meta[property="og:description"]')
        or soup.select_one('meta[name="description"]')
    )

    if meta:
        return clean_text(meta.get("content") or "")

    return ""


def enrich_episode(item: dict) -> dict:
    try:
        html = get(item["page_url"])
        soup = BeautifulSoup(html, "html.parser")

        title_node = soup.select_one("h1")
        if title_node:
            full = clean_text(title_node.get_text(" ", strip=True))
            match = TITLE_RE.search(full)
            if match and clean_text(match.group("title")):
                item["title"] = clean_text(match.group("title"))

        item["description"] = description_from_page(soup)

        image = soup.select_one('meta[property="og:image"]')
        item["poster"] = urljoin(BASE + "/", image.get("content")) if image and image.get("content") else ""

    except Exception as exc:
        item["description"] = item.get("description", "")
        item["poster"] = item.get("poster", "")
        item["scrape_error"] = str(exc)[:180]

    return item


def main():
    seasons = {}

    for number in range(1, 29):
        print(f"Season {number}: list")
        try:
            season = parse_season(number)
        except Exception as exc:
            print(f"  season error: {exc}")
            season = {
                "season": number,
                "title": f"{number} сезон",
                "episodes": [],
                "scrape_error": str(exc)[:180],
            }

        seasons[str(number)] = season

    jobs = []
    for season in seasons.values():
        jobs.extend(season["episodes"])

    print(f"Episode pages: {len(jobs)}")

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(enrich_episode, item): item for item in jobs}

        done = 0
        for future in concurrent.futures.as_completed(futures):
            future.result()
            done += 1

            if done % 20 == 0 or done == len(jobs):
                print(f"  enriched {done}/{len(jobs)}")

    payload = {
        "version": 1,
        "source": "kill-kenny.com",
        "updated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "seasons": seasons,
    }

    OUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
