"""Spam detection router."""

from fastapi import APIRouter, HTTPException
from app.models.schemas import TextInput, SpamResponse
from app import nlp_engine

router = APIRouter(prefix="/spam", tags=["Spam Check"])


@router.post("/check", response_model=SpamResponse, summary="Spam check before publish")
async def check_spam(payload: TextInput):
    """
    Checks whether the blog content looks like spam before it is published.

    Uses a **BERT-tiny** model fine-tuned for spam classification, augmented
    with heuristic pattern matching (excessive URLs, ALL-CAPS text, promotional
    trigger words, etc.) to improve reliability.

    - **is_spam**: `true` → block / warn the author before publishing
    - **confidence**: model confidence score (0 – 1)
    - **reasons**: list of human-readable spam signals detected
    """
    try:
        result = nlp_engine.check_spam(payload.text)
        return SpamResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Spam check failed: {exc}")
