"""Summary generation router."""

from fastapi import APIRouter, HTTPException
from app.models.schemas import TextInput, SummaryResponse
from app import nlp_engine

router = APIRouter(prefix="/summary", tags=["Summary"])


@router.post("/generate", response_model=SummaryResponse, summary="Generate blog summary")
async def generate_summary(payload: TextInput):
    """
    Generates an **abstractive summary** of the blog using Facebook's
    `bart-large-cnn` model.  Unlike extractive methods, BART rewrites the
    content in its own words, producing a coherent preview paragraph.

    - Texts shorter than 50 words are returned as-is.
    - The `compression_ratio` tells you how much the text was condensed.
    """
    try:
        result = nlp_engine.summarise(payload.text)
        return SummaryResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Summarisation failed: {exc}")
