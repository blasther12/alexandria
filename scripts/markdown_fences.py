"""Shared CommonMark-style fenced block recognition for documentation checks."""

from __future__ import annotations

import re
from dataclasses import dataclass


OPENING_RE = re.compile(
    r"^(?P<indent> {0,3})(?P<fence>`{3,}|~{3,})(?P<info>.*)$"
)


@dataclass(frozen=True)
class Fence:
    marker: str
    length: int
    info: str


def opening_fence(line: str) -> Fence | None:
    """Return an opening fence, rejecting invalid backticks in its info string."""
    match = OPENING_RE.match(line)
    if not match:
        return None
    marker = match.group("fence")
    info = match.group("info").strip()
    if marker[0] == "`" and "`" in info:
        return None
    return Fence(marker=marker[0], length=len(marker), info=info)


def closes_fence(line: str, opened: Fence) -> bool:
    """Check a closing fence of the same marker and at least the opening length."""
    stripped = line.lstrip(" ")
    if len(line) - len(stripped) > 3 or not stripped.startswith(opened.marker):
        return False
    marker_length = len(stripped) - len(stripped.lstrip(opened.marker))
    if marker_length < opened.length:
        return False
    return not stripped[marker_length:].strip()
