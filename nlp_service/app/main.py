"""
FastAPI application entry point.

Startup order:
  1. CORS middleware registered
  2. All routers mounted
  3. Health-check endpoint registered
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from app.routers import grammar, keywords, sentiment, summary, spam, analyse, moderate
from app import nlp_engine

class AnalyzeRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class AnalyzeResponse(BaseModel):
    status: str
    message: str
    cleaned_text: str
    score: float
    strikes: int
    sentiment: float
    keywords: List[str]

app = FastAPI(
    title="Online Blogging — NLP Microservice",
    description=(
        "Pretrained-model-powered NLP service for the Online Blogging platform.\n\n"
        "Features:\n"
        "- **Grammar Auto-Fix** (LanguageTool)\n"
        "- **Keyword Suggestions** (KeyBERT + MiniLM)\n"
        "- **Sentiment Analysis** (RoBERTa)\n"
        "- **Summary Generation** (BART-large-CNN)\n"
        "- **Spam Detection** (BERT-tiny + heuristics)\n"
    ),
    version="1.0.0",
    docs_url="/docs",          # Swagger UI
    redoc_url="/redoc",        # ReDoc UI
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow the Spring Boot backend (and local dev tools) to call this service.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(grammar.router)
app.include_router(keywords.router)
app.include_router(sentiment.router)
app.include_router(summary.router)
app.include_router(spam.router)
app.include_router(analyse.router)
app.include_router(moderate.router)


# ── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Service health check")
async def health():
    """Returns 200 OK when the service is up and accepting requests."""
    return {"status": "ok", "service": "NLP Microservice"}


@app.get("/", tags=["Health"], include_in_schema=False)
async def root():
    return {
        "message": "NLP Microservice is running. Visit /docs for the Swagger UI."
    }

# ── New ModerationService /analyze Endpoint ──────────────────────────────────
@app.post("/analyze", tags=["Moderation"], response_model=AnalyzeResponse)
async def analyze_endpoint(payload: AnalyzeRequest):
    """
    Analyzes content to support the new Spring Boot ModerationService.
    Returns a unified response with status, score, sentiment, and keywords.
    """
    try:
        clean = nlp_engine.sanitize_input(payload.text)
        if not clean or len(clean.strip()) < 3:
            return AnalyzeResponse(
                status="SAFE",
                message="Text too short",
                cleaned_text=clean,
                score=0.0,
                strikes=0,
                sentiment=0.0,
                keywords=[]
            )

        # Run sentiment
        sent_result = nlp_engine.analyse_sentiment(clean)
        # Convert sentiment to a numeric score from -1.0 to 1.0 roughly
        # If it's NEGATIVE, it's negative confidence, else positive
        is_neg = sent_result.get("label", "NEUTRAL").upper() == "NEGATIVE"
        raw_score = sent_result.get("score", 0.0)
        sent_num = -raw_score if is_neg else raw_score

        # Run toxicity logic from moderate router
        from app.routers.moderate import _compute_toxicity
        toxicity_score, flags, _ = _compute_toxicity(clean, sent_result)

        status = "BLOCKED" if toxicity_score > 0.7 or any(f.severity == "high" for f in flags) else "SAFE"
        msg = "Content blocked due to toxicity" if status == "BLOCKED" else "Content is safe"

        # Keywords
        kw_result = nlp_engine.extract_keywords(clean, top_n=5)
        kws = [k["keyword"] for k in kw_result.get("keywords", [])]

        return AnalyzeResponse(
            status=status,
            message=msg,
            cleaned_text=clean,
            score=toxicity_score,
            strikes=0,
            sentiment=sent_num,
            keywords=kws
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analyze failed: {exc}")
