"""
Pydantic schemas — request/response models for all NLP endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ── Shared ────────────────────────────────────────────────────────────────────

class TextInput(BaseModel):
    text: str = Field(..., min_length=1, description="Raw blog text to analyse")


# ── Grammar Fix ───────────────────────────────────────────────────────────────

class GrammarMatch(BaseModel):
    offset: int
    length: int
    message: str
    replacements: List[str]
    rule_id: str


class GrammarResponse(BaseModel):
    original_text: str
    corrected_text: str
    errors_found: int
    matches: List[GrammarMatch]


# ── Keywords ──────────────────────────────────────────────────────────────────

class Keyword(BaseModel):
    keyword: str
    score: float


class KeywordsResponse(BaseModel):
    keywords: List[Keyword]
    top_keyword: Optional[str]


# ── Sentiment ─────────────────────────────────────────────────────────────────

class SentimentResponse(BaseModel):
    label: str           # POSITIVE | NEGATIVE | NEUTRAL
    score: float         # confidence 0-1
    emoji: str
    summary: str


# ── Summary ───────────────────────────────────────────────────────────────────

class SummaryResponse(BaseModel):
    summary: str
    original_word_count: int
    summary_word_count: int
    compression_ratio: float


# ── Spam Check ───────────────────────────────────────────────────────────────

class SpamResponse(BaseModel):
    is_spam: bool
    confidence: float        # 0-1
    label: str               # SPAM | NOT SPAM
    reasons: List[str]       # human-readable triggers


# ── Combined (all-at-once) ───────────────────────────────────────────────────

class FullAnalysisResponse(BaseModel):
    grammar: GrammarResponse
    keywords: KeywordsResponse
    sentiment: SentimentResponse
    summary: SummaryResponse
    spam: SpamResponse
