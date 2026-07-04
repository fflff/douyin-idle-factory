#!/usr/bin/env python3
"""Fetch GitHub Trending (weekly) and generate a Chinese Markdown report."""

from __future__ import annotations

import base64
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

TOP_N = 25
TRENDING_URL = "https://github.com/trending?since=weekly"
GITHUB_API = "https://api.github.com"
README_EXCERPT_LEN = 800
ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "docs" / "github-trending"
INDEX_FILE = OUTPUT_DIR / "README.md"

TOPIC_LABELS: dict[str, str] = {
    "ai": "人工智能",
    "machine-learning": "机器学习",
    "llm": "大语言模型",
    "agent": "智能体",
    "cli": "命令行工具",
    "web": "Web 开发",
    "mobile": "移动开发",
    "game": "游戏",
    "devops": "DevOps",
    "security": "安全",
    "database": "数据库",
    "rust": "Rust 生态",
    "python": "Python 生态",
    "javascript": "JavaScript 生态",
    "typescript": "TypeScript 生态",
    "go": "Go 生态",
}


@dataclass
class TrendingRepo:
    rank: int
    full_name: str
    url: str
    description: str = ""
    language: str = ""
    stars_today: str = ""
    stars_total: str = ""
    topics: list[str] = field(default_factory=list)
    license_name: str = ""
    homepage: str = ""
    created_at: str = ""
    pushed_at: str = ""
    forks: int = 0
    open_issues: int = 0
    readme_excerpt: str = ""


def _session() -> requests.Session:
    s = requests.Session()
    s.headers.update(
        {
            "User-Agent": "douyin-idle-factory-github-trending-bot/1.0",
            "Accept": "text/html,application/json",
        }
    )
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        s.headers["Authorization"] = f"Bearer {token}"
    return s


def _parse_star_count(text: str) -> str:
    m = re.search(r"([\d,]+)", text.replace(",", ""))
    if m:
        return m.group(1)
    return text.strip()


def scrape_trending(session: requests.Session) -> list[TrendingRepo]:
    resp = session.get(TRENDING_URL, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    articles = soup.select("article.Box-row")
    repos: list[TrendingRepo] = []

    for idx, article in enumerate(articles[:TOP_N], start=1):
        link = article.select_one("h2 a")
        if not link:
            continue

        href = link.get("href", "").strip("/")
        full_name = href if "/" in href else ""
        if not full_name:
            continue

        desc_el = article.select_one("p.col-9")
        description = desc_el.get_text(strip=True) if desc_el else ""

        lang_el = article.select_one('[itemprop="programmingLanguage"]')
        language = lang_el.get_text(strip=True) if lang_el else ""

        stars_today = ""
        stars_total = ""

        for link in article.select('a[href$="/stargazers"]'):
            stars_total = _parse_star_count(link.get_text(strip=True))
            break

        for el in article.select("span.d-inline-block, a.Link--muted"):
            text = el.get_text(strip=True)
            lower = text.lower()
            if "star" in lower and any(kw in lower for kw in ("today", "this week", "this month")):
                stars_today = _parse_star_count(text)
                break

        repos.append(
            TrendingRepo(
                rank=idx,
                full_name=full_name,
                url=f"https://github.com/{full_name}",
                description=description,
                language=language,
                stars_today=stars_today,
                stars_total=stars_total,
            )
        )

    return repos


def _api_get(session: requests.Session, path: str) -> dict | None:
    try:
        resp = session.get(f"{GITHUB_API}{path}", timeout=20)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


def enrich_repo(session: requests.Session, repo: TrendingRepo) -> None:
    data = _api_get(session, f"/repos/{repo.full_name}")
    if not data:
        return

    if data.get("description"):
        repo.description = data["description"]
    repo.topics = data.get("topics") or []
    repo.forks = data.get("forks_count") or 0
    repo.open_issues = data.get("open_issues_count") or 0
    repo.homepage = data.get("homepage") or ""
    repo.created_at = (data.get("created_at") or "")[:10]
    repo.pushed_at = (data.get("pushed_at") or "")[:10]
    license_info = data.get("license")
    if license_info:
        repo.license_name = license_info.get("spdx_id") or license_info.get("name") or ""

    readme = _api_get(session, f"/repos/{repo.full_name}/readme")
    if readme and readme.get("content"):
        try:
            raw = base64.b64decode(readme["content"]).decode("utf-8", errors="replace")
            raw = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", raw)
            raw = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", raw)
            raw = re.sub(r"#{1,6}\s*", "", raw)
            raw = re.sub(r"[`_*~>|]", "", raw)
            raw = re.sub(r"\s+", " ", raw).strip()
            repo.readme_excerpt = raw[:README_EXCERPT_LEN]
            if len(raw) > README_EXCERPT_LEN:
                repo.readme_excerpt += "…"
        except (ValueError, UnicodeDecodeError):
            pass


def _format_topics(topics: list[str]) -> str:
    if not topics:
        return "—"
    parts = []
    for t in topics[:8]:
        label = TOPIC_LABELS.get(t.lower(), t)
        parts.append(f"{t} ({label})" if label != t else t)
    return "、".join(parts)


def _why_trending(repo: TrendingRepo) -> str:
    parts: list[str] = []

    if repo.stars_today:
        parts.append(
            f"本周 GitHub Trending 显示约 **+{repo.stars_today}** star 增速，说明社区关注度正在快速上升。"
        )
    else:
        parts.append("该项目出现在 GitHub 周榜 Trending 中，表明近期获得较多开发者关注。")

    if repo.topics:
        topic_hints = [_ for t in repo.topics[:3] if (_ := TOPIC_LABELS.get(t.lower()))]
        if topic_hints:
            parts.append(f"标签指向 **{' / '.join(topic_hints)}** 方向，符合当前技术热点。")
        else:
            parts.append(f"主要标签：{', '.join(repo.topics[:5])}。")

    if repo.pushed_at:
        parts.append(f"最近代码推送时间为 {repo.pushed_at}，项目仍在活跃维护。")

    if repo.forks > 100:
        parts.append(f"已有 {repo.forks:,} 个 Fork，社区参与度和二次开发意愿较高。")

    return " ".join(parts)


def _escape_table_cell(text: str) -> str:
    return text.replace("|", "\\|").replace("\n", " ")


def generate_report(repos: list[TrendingRepo], report_date: str) -> str:
    lines: list[str] = [
        f"# GitHub 周榜热门项目 — {report_date}",
        "",
        f"> 数据来源：[GitHub Trending](https://github.com/trending?since=weekly)（weekly）",
        f"> 生成时间：{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        f"本周收录 Top **{len(repos)}** 个全球热门开源项目，按 Trending 排名整理。",
        "",
        "## 概览",
        "",
        "| 排名 | 项目 | 语言 | 本周 Star | 总 Star |",
        "| --- | --- | --- | --- | --- |",
    ]

    for repo in repos:
        lines.append(
            f"| {repo.rank} | [{repo.full_name}]({repo.url}) | "
            f"{repo.language or '—'} | +{repo.stars_today or '?'} | {repo.stars_total or '?'} |"
        )

    lines.extend(["", "---", ""])

    for repo in repos:
        lines.extend(
            [
                f"## {repo.rank}. {repo.full_name}",
                "",
                "| 字段 | 内容 |",
                "| --- | --- |",
                f"| 语言 | {repo.language or '—'} |",
                f"| 总 Star | {repo.stars_total or '—'} |",
                f"| 本周新增 | +{repo.stars_today or '—'} |",
                f"| License | {repo.license_name or '—'} |",
                f"| Fork | {repo.forks:,} |" if repo.forks else "| Fork | — |",
                f"| Open Issues | {repo.open_issues:,} |" if repo.open_issues else "| Open Issues | — |",
                f"| 创建时间 | {repo.created_at or '—'} |",
                f"| 最近更新 | {repo.pushed_at or '—'} |",
                "",
                f"**一句话介绍**：{_escape_table_cell(repo.description or '暂无描述')}",
                "",
                f"**Topics**：{_format_topics(repo.topics)}",
                "",
            ]
        )

        if repo.readme_excerpt:
            lines.extend(
                [
                    "**README 摘要**：",
                    "",
                    f"> {_escape_table_cell(repo.readme_excerpt)}",
                    "",
                ]
            )

        lines.extend(
            [
                f"**为什么本周火热**：{_why_trending(repo)}",
                "",
            ]
        )

        link_parts = [f"[仓库]({repo.url})"]
        if repo.homepage:
            link_parts.append(f"[Homepage]({repo.homepage})")
        lines.extend([f"**链接**：{' · '.join(link_parts)}", "", "---", ""])

    return "\n".join(lines)


def update_index(report_date: str) -> None:
    reports = sorted(
        (p.stem for p in OUTPUT_DIR.glob("????-??-??.md")),
        reverse=True,
    )
    if report_date not in reports:
        reports.insert(0, report_date)

    lines = [
        "# GitHub 周榜热门项目报告",
        "",
        "每周日自动抓取 [GitHub Trending 周榜](https://github.com/trending?since=weekly)，",
        "生成中文详细介绍，帮助你了解最新火热的开源项目。",
        "",
        "## 报告列表",
        "",
    ]

    if reports:
        for date in reports:
            lines.append(f"- [{date}](./{date}.md)")
    else:
        lines.extend(["", "_首份报告将在 workflow 首次运行后出现在上方列表。_"])

    lines.append("")
    INDEX_FILE.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report_date = datetime.now().strftime("%Y-%m-%d")
    report_path = OUTPUT_DIR / f"{report_date}.md"

    session = _session()
    print(f"Fetching GitHub Trending (weekly), top {TOP_N}...")
    repos = scrape_trending(session)
    if not repos:
        print("ERROR: No repositories found. GitHub page structure may have changed.", file=sys.stderr)
        return 1

    print(f"Found {len(repos)} repos. Enriching via GitHub API...")
    for repo in repos:
        enrich_repo(session, repo)
        print(f"  [{repo.rank}] {repo.full_name}")

    content = generate_report(repos, report_date)
    report_path.write_text(content, encoding="utf-8")
    print(f"Report written to {report_path}")

    update_index(report_date)
    print(f"Index updated at {INDEX_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
