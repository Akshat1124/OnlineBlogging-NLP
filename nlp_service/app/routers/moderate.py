"""
Content moderation router — pre-publish gating with toxicity analysis.

POST /moderate/check   → Returns toxicity score, flags, and publish decision
POST /moderate/rewrite → AI-powered tone improvement (rewrites negative content)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app import nlp_engine
import re

router = APIRouter(prefix="/moderate", tags=["Content Moderation"])


# ── Config ────────────────────────────────────────────────────────────────────
TOXICITY_THRESHOLD = 0.7   # Configurable: block if toxicity_score > this

# Weighted toxic keyword lists (stronger weight = higher toxicity contribution)
_SEVERE_PATTERNS = [
    (r"\b(idiot|idiots|stupid|dumb|moron|loser)\b", "personal_attack", 0.3),
    (r"\b(hate|hatred|despise)\b", "hate", 0.25),
    (r"\b(kill|murder|destroy|attack|assault|stab|shoot)\b", "violence", 0.35),
    (r"\b(useless|worthless|garbage|trash|pathetic|disgusting)\b", "abuse", 0.2),
    (r"\b(die|death threat|bomb)\b", "threat", 0.4),
    (r"\b(racist|sexist|bigot)\b", "discrimination", 0.3),
]

_MILD_PATTERNS = [
    (r"\b(bad|terrible|awful|horrible|worst)\b", "negativity", 0.08),
    (r"\b(angry|furious|rage|outraged)\b", "hostility", 0.1),
    (r"\b(suck|sucks|crap|damn|hell)\b", "mild_profanity", 0.12),
]


# ── Schemas ───────────────────────────────────────────────────────────────────

class ModerationInput(BaseModel):
    text: str = Field(..., min_length=1, description="Blog content to moderate")
    threshold: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Custom toxicity threshold (default: 0.7)"
    )


class FlagDetail(BaseModel):
    category: str
    severity: str        # "high" | "medium" | "low"
    matched_text: str
    suggestion: Optional[str] = None


class ModerationResult(BaseModel):
    allowed: bool
    sentiment: str                       # POSITIVE | NEUTRAL | NEGATIVE
    sentiment_score: float               # 0-1 confidence
    toxicity_score: float                # 0-1 computed toxicity
    flags: List[FlagDetail]
    flag_categories: List[str]           # simplified list: ["hate", "abuse", ...]
    reason: Optional[str] = None         # human-readable block reason
    suggestion: Optional[str] = None     # tone improvement hint


class RewriteInput(BaseModel):
    text: str = Field(..., min_length=1)


class RewriteResult(BaseModel):
    original: str
    rewritten: str
    tone_before: str
    tone_after: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _compute_toxicity(text: str, sentiment_result: dict) -> tuple:
    """
    Compute a 0-1 toxicity score from:
      1. Sentiment model output (negative = higher base)
      2. Pattern-matched toxic keywords (additive)
    Returns (toxicity_score, flags, categories)
    """
    # Base toxicity from sentiment
    label = sentiment_result.get("label", "NEUTRAL").upper()
    raw_score = sentiment_result.get("score", 0.0)

    if label == "NEGATIVE":
        base = min(0.4 + (raw_score * 0.2), 0.6)  # Negative sentiment → 0.4-0.6 base
    elif label == "NEUTRAL":
        base = 0.1
    else:
        base = 0.0

    flags: List[FlagDetail] = []
    categories: set = set()
    additive = 0.0
    lower_text = text.lower()

    # Severe patterns
    for pattern, category, weight in _SEVERE_PATTERNS:
        matches = re.findall(pattern, lower_text, re.IGNORECASE)
        if matches:
            for match in set(matches):
                flags.append(FlagDetail(
                    category=category,
                    severity="high",
                    matched_text=match,
                    suggestion=_get_suggestion(match, category),
                ))
            categories.add(category)
            additive += weight * len(set(matches))

    # Mild patterns
    for pattern, category, weight in _MILD_PATTERNS:
        matches = re.findall(pattern, lower_text, re.IGNORECASE)
        if matches:
            for match in set(matches):
                flags.append(FlagDetail(
                    category=category,
                    severity="medium" if weight >= 0.1 else "low",
                    matched_text=match,
                    suggestion=_get_suggestion(match, category),
                ))
            categories.add(category)
            additive += weight * min(len(set(matches)), 3)  # Cap at 3 per pattern

    toxicity = min(base + additive, 1.0)
    return round(toxicity, 4), flags, sorted(categories)


def _get_suggestion(word: str, category: str) -> str:
    """Provide alternative phrasing for flagged words."""
    suggestions = {
        "idiot": "consider using 'uninformed' or 'mistaken'",
        "idiots": "consider using 'people who may not understand'",
        "stupid": "try 'poorly designed' or 'ineffective'",
        "dumb": "try 'unintuitive' or 'confusing'",
        "useless": "try 'ineffective' or 'could be improved'",
        "worthless": "try 'of limited value' or 'needs improvement'",
        "terrible": "try 'unsatisfactory' or 'disappointing'",
        "horrible": "try 'very poor' or 'deeply flawed'",
        "garbage": "try 'low quality' or 'poorly executed'",
        "trash": "try 'substandard' or 'below expectations'",
        "hate": "try 'strongly disagree with' or 'am frustrated by'",
        "kill": "try 'eliminate' or 'remove'",
        "destroy": "try 'dismantle' or 'critically examine'",
        "pathetic": "try 'inadequate' or 'underwhelming'",
        "disgusting": "try 'unacceptable' or 'deeply concerning'",
        "suck": "try 'fall short' or 'underperform'",
        "sucks": "try 'falls short' or 'underperforms'",
        "worst": "try 'least effective' or 'most problematic'",
    }
    return suggestions.get(word.lower(), f"consider rephrasing to avoid {category} language")


def _generate_rewrite(text: str) -> str:
    """
    Rewrite negative/toxic text to a neutral/professional tone.
    Uses rule-based substitution (no external API needed).
    """
    replacements = {
        r"\b(idiot|idiots)\b": "person who may be mistaken",
        r"\b(stupid)\b": "ineffective",
        r"\b(dumb)\b": "unintuitive",
        r"\b(useless)\b": "in need of improvement",
        r"\b(worthless)\b": "of limited value",
        r"\b(terrible|horrible|awful)\b": "unsatisfactory",
        r"\b(garbage|trash)\b": "low quality",
        r"\b(hate)\b": "strongly disagree with",
        r"\b(suck|sucks)\b": "falls short",
        r"\b(worst)\b": "most problematic",
        r"\b(pathetic)\b": "underwhelming",
        r"\b(disgusting)\b": "deeply concerning",
        r"\b(kill|destroy)\b": "eliminate",
        r"\b(moron|loser)\b": "individual",
        r"\b(crap|damn)\b": "unfortunate",
    }

    result = text
    for pattern, replacement in replacements.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    return result


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/check",
    response_model=ModerationResult,
    summary="Pre-publish content moderation check",
)
async def moderate_check(payload: ModerationInput):
    """
    **Pre-publish gate** — call this BEFORE saving a blog post.

    Returns:
    - `allowed`: whether the content can be published
    - `toxicity_score`: 0-1 toxicity rating
    - `flags`: list of problematic phrases with categories and suggestions
    - `reason`: human-readable explanation if blocked
    """
    try:
        threshold = payload.threshold or TOXICITY_THRESHOLD
        clean = nlp_engine.sanitize_input(payload.text)

        # Edge case: empty text after sanitisation
        if not clean or len(clean.strip()) < 3:
            return ModerationResult(
                allowed=True,
                sentiment="NEUTRAL",
                sentiment_score=0.0,
                toxicity_score=0.0,
                flags=[],
                flag_categories=[],
            )

        # Run sentiment analysis
        sentiment = nlp_engine.analyse_sentiment(clean)

        # Compute toxicity
        toxicity_score, flags, categories = _compute_toxicity(clean, sentiment)

        # Decision
        blocked_by_score = toxicity_score > threshold
        blocked_by_flags = any(f.severity == "high" for f in flags) and len(
            [f for f in flags if f.severity == "high"]
        ) >= 2
        allowed = not (blocked_by_score or blocked_by_flags)

        reason = None
        suggestion = None
        if not allowed:
            if blocked_by_score:
                reason = f"Content toxicity score ({toxicity_score:.0%}) exceeds the acceptable threshold ({threshold:.0%}). The content contains language that may be harmful or offensive."
            else:
                reason = f"Content contains multiple instances of flagged language in categories: {', '.join(categories)}."
            suggestion = "Consider rephrasing the highlighted sections to adopt a more constructive and professional tone."

        return ModerationResult(
            allowed=allowed,
            sentiment=sentiment.get("label", "NEUTRAL"),
            sentiment_score=round(sentiment.get("score", 0.0), 4),
            toxicity_score=toxicity_score,
            flags=flags,
            flag_categories=categories,
            reason=reason,
            suggestion=suggestion,
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Moderation check failed: {exc}")


@router.post(
    "/rewrite",
    response_model=RewriteResult,
    summary="AI-powered tone improvement",
)
async def moderate_rewrite(payload: RewriteInput):
    """
    Rewrites the given text to a more neutral/professional tone using
    rule-based substitutions. Returns original + rewritten versions.
    """
    try:
        clean = nlp_engine.sanitize_input(payload.text)

        # Analyse tone before
        sentiment_before = nlp_engine.analyse_sentiment(clean)
        tone_before = sentiment_before.get("label", "NEUTRAL")

        # Rewrite
        rewritten = _generate_rewrite(clean)

        # Analyse tone after
        sentiment_after = nlp_engine.analyse_sentiment(rewritten)
        tone_after = sentiment_after.get("label", "NEUTRAL")

        return RewriteResult(
            original=clean,
            rewritten=rewritten,
            tone_before=tone_before,
            tone_after=tone_after,
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Rewrite failed: {exc}")
