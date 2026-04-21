"""Named Entity Recognition router."""

from fastapi import APIRouter, HTTPException
from app.models.schemas import TextInput, NERResponse
from app import nlp_engine

router = APIRouter(prefix="/ner", tags=["NER"])


@router.post("/extract", response_model=NERResponse, summary="Extract named entities")
async def extract_entities(payload: TextInput):
    """
    Extracts named entities from the blog text using **spaCy en_core_web_sm**.

    Returns:
    - **entities**: list of `{text, label, description}` objects
    - **entity_count**: total unique entities found
    - **grouped**: entities grouped by label (e.g. PERSON, ORG, GPE)
    """
    try:
        clean_text = nlp_engine.sanitize_input(payload.text)
        result = nlp_engine.extract_entities(clean_text)
        return NERResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"NER extraction failed: {exc}")
