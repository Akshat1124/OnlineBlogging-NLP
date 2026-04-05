"""
Combined /analyse router — runs all five NLP features in one HTTP call.
Useful for the Spring Boot backend to call a single endpoint when a blog
is submitted for full analysis before publishing.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import TextInput, FullAnalysisResponse
from app import nlp_engine

router = APIRouter(prefix="/analyse", tags=["Full Analysis"])


@router.post(
    "/full",
    response_model=FullAnalysisResponse,
    summary="Run all NLP features at once",
)
async def full_analysis(payload: TextInput):
    """
    **One-shot endpoint** — runs all five NLP features sequentially and returns
    a combined response.  Ideal for the backend to call just before the blog
    publish action so it can display a rich preview to the author.

    Equivalent to calling:
    - POST /grammar/fix
    - POST /keywords/suggest
    - POST /sentiment/analyse
    - POST /summary/generate
    - POST /spam/check
    """
    try:
        clean_text = nlp_engine.sanitize_input(payload.text)
        grammar   = nlp_engine.fix_grammar(clean_text)
        keywords  = nlp_engine.extract_keywords(clean_text)
        sentiment = nlp_engine.analyse_sentiment(clean_text)
        summary   = nlp_engine.summarise(clean_text)
        spam      = nlp_engine.check_spam(clean_text)

        return FullAnalysisResponse(
            grammar=grammar,
            keywords=keywords,
            sentiment=sentiment,
            summary=summary,
            spam=spam,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Full analysis failed: {exc}")
