"""Sentiment analysis router."""

from fastapi import APIRouter, HTTPException
from app.models.schemas import TextInput, SentimentResponse
from app import nlp_engine

router = APIRouter(prefix="/sentiment", tags=["Sentiment"])


@router.post("/analyse", response_model=SentimentResponse, summary="Analyse blog sentiment")
async def analyse_sentiment(payload: TextInput):
    """
    Runs sentiment analysis on the blog text using **RoBERTa** fine-tuned on
    social media text (cardiffnlp/twitter-roberta-base-sentiment-latest).

    Returns:
    - **label**: `POSITIVE`, `NEGATIVE`, or `NEUTRAL`
    - **score**: model confidence (0 – 1)
    - **emoji**: a quick visual indicator
    - **summary**: a human-readable one-liner about the tone
    """
    try:
        result = nlp_engine.analyse_sentiment(payload.text)
        return SentimentResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {exc}")
