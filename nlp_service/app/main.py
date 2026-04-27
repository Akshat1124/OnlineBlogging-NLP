"""
FastAPI application entry point.

Startup order:
  1. CORS middleware registered
  2. All routers mounted
  3. Health-check endpoint registered
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import grammar, keywords, sentiment, summary, spam, analyse, moderate

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
