"""Keyword suggestion router."""

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import TextInput, KeywordsResponse
from app import nlp_engine

router = APIRouter(prefix="/keywords", tags=["Keywords"])


@router.post("/suggest", response_model=KeywordsResponse, summary="Suggest SEO keywords")
async def suggest_keywords(
    payload: TextInput,
    top_n: int = Query(default=10, ge=1, le=20, description="Number of keywords to return"),
):
    """
    Extracts the most relevant keywords and keyphrases from the blog text.

    Uses **KeyBERT** (backed by `all-MiniLM-L6-v2`) with Maximal Marginal
    Relevance to ensure the returned keywords are both relevant AND diverse.
    Great for SEO tag suggestions.
    """
    try:
        result = nlp_engine.extract_keywords(payload.text, top_n=top_n)
        return KeywordsResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Keyword extraction failed: {exc}")
