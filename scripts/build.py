"""Build script that produces a single standalone dist/index.html.

Inlines all CSS, JS, and Google Fonts (with base64-encoded font files)
so the output can be opened by double-clicking in any browser.

Usage:
    python scripts/build.py
"""

from __future__ import annotations

import base64
import re
import sys
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parent.parent
SRC_HTML = ROOT_DIR / "index.html"
DIST_DIR = ROOT_DIR / "dist"
DIST_HTML = DIST_DIR / "index.html"

GOOGLE_FONTS_CSS_URL = (
    "https://fonts.googleapis.com/css2"
    "?family=BIZ+UDPGothic:wght@400;700&display=swap"
)

# User-Agent that triggers woff2 urls in Google Fonts CSS response
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

HTTP_TIMEOUT_SECONDS = 15

LOCAL_CSS_FILES = ["css/main.css", "css/print.css"]
LOCAL_JS_FILES = ["js/problems.js", "js/renderer.js", "js/app.js"]

# ---------------------------------------------------------------------------
# Network helpers
# ---------------------------------------------------------------------------


def fetch_url(url: str, *, timeout: int = HTTP_TIMEOUT_SECONDS) -> bytes:
    """Fetch *url* and return the raw response body."""
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def fetch_text(url: str, *, timeout: int = HTTP_TIMEOUT_SECONDS) -> str:
    """Fetch *url* and return the decoded text."""
    return fetch_url(url, timeout=timeout).decode("utf-8")


# ---------------------------------------------------------------------------
# Google Fonts inlining
# ---------------------------------------------------------------------------


def _inline_font_urls(css_text: str) -> str:
    """Replace every ``url(...)`` in *css_text* with a base64 data-URI.

    If any individual font file fails to download the ``url()`` is left
    unchanged so the browser can still attempt a network fetch or fall
    back to a system font.
    """

    def _replace_url(match: re.Match[str]) -> str:
        font_url = match.group(1)
        try:
            font_bytes = fetch_url(font_url)
        except (URLError, OSError):
            # Leave original url intact as a fallback
            return match.group(0)

        encoded = base64.b64encode(font_bytes).decode("ascii")

        # Determine MIME type from URL
        if font_url.endswith(".woff2"):
            mime = "font/woff2"
        elif font_url.endswith(".woff"):
            mime = "font/woff"
        elif font_url.endswith(".ttf"):
            mime = "font/ttf"
        else:
            mime = "application/octet-stream"

        return f"url(data:{mime};base64,{encoded})"

    return re.sub(r"url\(([^)]+)\)", _replace_url, css_text)


def build_font_style_block() -> str | None:
    """Download the Google Fonts CSS and inline all font files.

    Returns a ``<style>...</style>`` string on success, or ``None`` if
    the initial CSS fetch fails (silent fallback).
    """
    try:
        css_text = fetch_text(GOOGLE_FONTS_CSS_URL)
    except (URLError, OSError):
        return None

    inlined_css = _inline_font_urls(css_text)
    return f"<style>\n{inlined_css}\n</style>"


# ---------------------------------------------------------------------------
# Local asset inlining
# ---------------------------------------------------------------------------


def read_local_file(relative_path: str) -> str:
    """Read a file relative to the repository root."""
    return (ROOT_DIR / relative_path).read_text(encoding="utf-8")


def inline_css(html: str) -> str:
    """Replace local ``<link rel="stylesheet" ...>`` tags with ``<style>``."""
    for css_path in LOCAL_CSS_FILES:
        pattern = (
            rf'<link\s+rel="stylesheet"\s+href="{re.escape(css_path)}"\s*/?>'
        )
        css_content = read_local_file(css_path)
        replacement = f"<style>\n{css_content}\n</style>"
        html = re.sub(pattern, replacement, html)
    return html


def inline_js(html: str) -> str:
    """Replace local ``<script src="...">`` tags with inline ``<script>``."""
    for js_path in LOCAL_JS_FILES:
        pattern = rf'<script\s+src="{re.escape(js_path)}"\s*>\s*</script>'
        js_content = read_local_file(js_path)
        replacement = f"<script>\n{js_content}\n</script>"
        html = re.sub(pattern, replacement, html)
    return html


# ---------------------------------------------------------------------------
# Google Fonts link removal
# ---------------------------------------------------------------------------


def remove_google_font_links(html: str) -> str:
    """Remove ``<link>`` tags that reference Google Fonts / gstatic."""
    # Remove preconnect links for fonts.googleapis.com and fonts.gstatic.com
    html = re.sub(
        r'<link\s+rel="preconnect"\s+href="https://fonts\.googleapis\.com"\s*/?>\s*\n?',
        "",
        html,
    )
    html = re.sub(
        r'<link\s+rel="preconnect"\s+href="https://fonts\.gstatic\.com"\s+crossorigin\s*/?>\s*\n?',
        "",
        html,
    )
    # Remove the Google Fonts stylesheet link
    html = re.sub(
        r'<link\s+href="https://fonts\.googleapis\.com/[^"]*"\s+rel="stylesheet"\s*/?>\s*\n?',
        "",
        html,
    )
    return html


# ---------------------------------------------------------------------------
# Inject font style block
# ---------------------------------------------------------------------------


def inject_font_style(html: str, style_block: str | None) -> str:
    """Insert the font ``<style>`` block right after the opening ``<head>``."""
    if style_block is None:
        return html
    return html.replace("<head>", f"<head>\n{style_block}", 1)


# ---------------------------------------------------------------------------
# Main build pipeline
# ---------------------------------------------------------------------------


def build() -> None:
    """Execute the full build pipeline."""
    html = SRC_HTML.read_text(encoding="utf-8")

    # 1. Download and inline Google Fonts (may be None on failure)
    font_style = build_font_style_block()

    # 2. Remove external Google Fonts links
    html = remove_google_font_links(html)

    # 3. Inject inlined font CSS at the top of <head>
    html = inject_font_style(html, font_style)

    # 4. Inline local CSS
    html = inline_css(html)

    # 5. Inline local JS
    html = inline_js(html)

    # 6. Write output
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    DIST_HTML.write_text(html, encoding="utf-8")

    # 7. Summary
    size = DIST_HTML.stat().st_size
    print(f"Built: dist/index.html ({size} bytes)")


if __name__ == "__main__":
    try:
        build()
    except Exception as exc:
        print(f"Build failed: {exc}", file=sys.stderr)
        sys.exit(1)
