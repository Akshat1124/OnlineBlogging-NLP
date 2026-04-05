"""Grammar auto-fix router."""

from fastapi import APIRouter, HTTPException
from app.models.schemas import TextInput, GrammarResponse
from app import nlp_engine

router = APIRouter(prefix="/grammar", tags=["Grammar Fix"])


@router.post("/fix", response_model=GrammarResponse, summary="Auto-fix grammar errors")
async def fix_grammar(payload: TextInput):
    """
    Detects and corrects grammar, spelling, and style issues in the provided text.

    - **text**: The raw blog content to check (plain text, not HTML).

    Returns the corrected text plus a list of individual error matches with
    suggested replacements and rule IDs so the frontend can highlight them.
    """
    try:
        result = nlp_engine.fix_grammar(payload.text)
        return GrammarResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Grammar fix failed: {exc}")
