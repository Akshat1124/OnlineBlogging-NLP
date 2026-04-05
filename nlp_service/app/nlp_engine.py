"""
NLP Engine — loads all pretrained models ONCE at startup and exposes
pure-Python helper functions that the routers call.

Models used (all run locally, no internet needed at inference time):
  • Grammar fix   : language_tool_python  (LanguageTool JVM wrapper)
  • Keywords      : KeyBERT  (sentence-transformers/all-MiniLM-L6-v2)
  • Sentiment     : cardiffnlp/twitter-roberta-base-sentiment-latest (HuggingFace)
  • Summary       : facebook/bart-large-cnn  (HuggingFace)
  • Spam check    : mrm8488/bert-tiny-finetuned-sms-spam-detection (HuggingFace)
"""

import logging
import re
import html
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Lazy singletons — loaded once, reused for every request
# ─────────────────────────────────────────────────────────────────────────────
_grammar_tool = None
_keyword_model = None
_sentiment_pipeline = None
_summary_tokenizer = None
_summary_model = None
_spam_pipeline = None


def sanitize_input(text: str) -> str:
    """Task 1: Pre-processing Layer to strip HTML tags and entities."""
    # Convert &nbsp;, &amp; etc to normal characters
    text = html.unescape(text)
    # Remove HTML tags like <p>, <strong>
    text = re.search(r'<body[^>]*>(.*?)</body>', text, re.IGNORECASE | re.DOTALL).group(1) if '<body' in text else text
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove any lingering "nbsp" or multiple spaces
    text = re.sub(r'\bnbsp\b', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def _get_grammar_tool():
    global _grammar_tool
    if _grammar_tool is None:
        import language_tool_python
        logger.info("Loading LanguageTool …")
        _grammar_tool = language_tool_python.LanguageTool("en-US")
    return _grammar_tool


def _get_keyword_model():
    global _keyword_model
    if _keyword_model is None:
        from keybert import KeyBERT
        logger.info("Loading KeyBERT …")
        _keyword_model = KeyBERT(model="all-MiniLM-L6-v2")
    return _keyword_model


def _get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        from transformers import pipeline
        logger.info("Loading sentiment model …")
        # distilbert-base-uncased-finetuned-sst-2-english is only ~67MB
        # vs the 501MB cardiffnlp RoBERTa model — same quality, much faster download
        _sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            truncation=True,
            max_length=512,
        )
    return _sentiment_pipeline


def _get_summary_model():
    """Load DistilBART tokenizer + model directly (pipeline 'summarization'
    task was removed in transformers 5.x)."""
    global _summary_tokenizer, _summary_model
    if _summary_model is None:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        logger.info("Loading summarisation model …")
        # sshleifer/distilbart-cnn-12-6: ~300MB, distilled BART for summarisation
        _summary_tokenizer = AutoTokenizer.from_pretrained("sshleifer/distilbart-cnn-12-6")
        _summary_model = AutoModelForSeq2SeqLM.from_pretrained("sshleifer/distilbart-cnn-12-6")
    return _summary_tokenizer, _summary_model


def _get_spam_pipeline():
    global _spam_pipeline
    if _spam_pipeline is None:
        from transformers import pipeline
        logger.info("Loading spam-detection model …")
        _spam_pipeline = pipeline(
            "text-classification",
            model="mrm8488/bert-tiny-finetuned-sms-spam-detection",
            tokenizer="mrm8488/bert-tiny-finetuned-sms-spam-detection",
            truncation=True,
            max_length=512,
        )
    return _spam_pipeline


# ─────────────────────────────────────────────────────────────────────────────
# 1. Grammar Fix
# ─────────────────────────────────────────────────────────────────────────────

def fix_grammar(text: str) -> Dict[str, Any]:
    """Return corrected text plus detailed match information.
    
    Compatible with both language-tool-python v2 and v3.
    v3 renamed: errorLength -> error_length, ruleId -> rule_id
    v3 moved:   language_tool_python.utils.correct -> language_tool_python.correct
    """
    tool = _get_grammar_tool()
    matches = tool.check(text)
    corrected = language_tool_python_correct(tool, text, matches)

    match_list = []
    for m in matches:
        # Handle both v2 (camelCase) and v3 (snake_case) attribute names
        error_length = getattr(m, 'error_length', getattr(m, 'errorLength', 0))
        rule_id      = getattr(m, 'rule_id',      getattr(m, 'ruleId',      'unknown'))
        replacements = list(getattr(m, 'replacements', [])[:5])

        match_list.append(
            {
                "offset": m.offset,
                "length": error_length,
                "message": m.message,
                "replacements": replacements,
                "rule_id": rule_id,
            }
        )

    return {
        "original_text": text,
        "corrected_text": corrected,
        "errors_found": len(matches),
        "matches": match_list,
    }


def language_tool_python_correct(tool, text: str, matches) -> str:
    """Apply all corrections — handles both language-tool-python v2 and v3."""
    import language_tool_python
    # v3 moved correct() to the top-level module; v2 had it in utils
    try:
        return language_tool_python.correct(text, matches)          # v3
    except AttributeError:
        return language_tool_python.utils.correct(text, matches)    # v2


# ─────────────────────────────────────────────────────────────────────────────
# 2. Keyword Extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_keywords(text: str, top_n: int = 10) -> Dict[str, Any]:
    """Task 4: Keyword Filtering."""
    model = _get_keyword_model()
    
    # Custom stop words list including technical noise
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
    custom_stop_words = list(ENGLISH_STOP_WORDS) + ["nbsp", "amp", "html", "span", "div"]

    raw = model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 2),   # single words + bigrams
        stop_words=custom_stop_words,
        use_mmr=True,                   # Maximal Marginal Relevance for diversity
        diversity=0.5,
        top_n=top_n,
    )

    keywords = [{"keyword": kw, "score": round(score, 4)} for kw, score in raw]
    top_keyword = keywords[0]["keyword"] if keywords else None

    return {"keywords": keywords, "top_keyword": top_keyword}


# ─────────────────────────────────────────────────────────────────────────────
# 3. Sentiment Analysis
# ─────────────────────────────────────────────────────────────────────────────

_SENTIMENT_META = {
    # distilbert SST-2 returns POSITIVE or NEGATIVE
    "positive": ("POSITIVE", "😊", "The blog has a positive and uplifting tone."),
    "negative": ("NEGATIVE", "😟", "The blog carries a negative or critical tone."),
}


def analyse_sentiment(text: str) -> Dict[str, Any]:
    """Task 2: Sentiment Model Recalibration - Vibe Check."""
    pipe = _get_sentiment_pipeline()
    
    # Split text into sentences/paragraphs to apply Vibe Check
    chunks = [p.strip() for p in re.split(r'[.!?\n]+', text) if p.strip()]
    if not chunks:
        return {"label": "NEUTRAL", "score": 0.0, "emoji": "😐", "summary": "No text."}
        
    scores = []
    for i, chunk in enumerate(chunks):
        res = pipe(chunk)[0]
        val = res["score"] if res["label"].upper() == "POSITIVE" else -res["score"]
        # Double weight for the last 20% of sentences (concluding narrative)
        weight = 2.0 if i >= len(chunks) * 0.8 else 1.0
        scores.append(val * weight)
        
    total_weight = sum([2.0 if i >= len(chunks) * 0.8 else 1.0 for i in range(len(chunks))])
    final_val = sum(scores) / total_weight
    
    score = round(abs(final_val), 4)
    raw_label = "positive" if final_val > 0 else "negative"

    # If confidence is low (<0.20 final averaged magnitude) treat as NEUTRAL
    if score < 0.20:
        label, emoji, summary = "NEUTRAL", "😐", "The blog has a neutral, objective tone."
    else:
        label, emoji, summary = _SENTIMENT_META.get(
            raw_label,
            (raw_label.upper(), "🤔", "Sentiment could not be clearly determined.")
        )

    return {"label": label, "score": score, "emoji": emoji, "summary": summary}


# ─────────────────────────────────────────────────────────────────────────────
# 4. Summarisation
# ─────────────────────────────────────────────────────────────────────────────

def summarise(text: str) -> Dict[str, Any]:
    """Generate an abstractive summary using DistilBART directly."""
    import torch

    word_count = len(text.split())

    # Need at least ~50 words for a meaningful summary
    if word_count < 50:
        return {
            "summary": text,
            "original_word_count": word_count,
            "summary_word_count": word_count,
            "compression_ratio": 1.0,
        }

    tokenizer, model = _get_summary_model()

    # Task 3: Summarization config proportional to input to enforce condensation
    max_length = min(150, max(40, word_count // 3))
    min_length = max(20, word_count // 6)

    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=1024,
        truncation=True,
    )

    with torch.no_grad():
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=max_length,
            min_length=min_length,
            num_beams=4,
            length_penalty=2.0,    # Encourage longer, more coherent summaries within bounds
            early_stopping=True,
        )

    result = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    summary_words = len(result.split())
    ratio = round(summary_words / word_count, 4) if word_count > 0 else 1.0

    return {
        "summary": result,
        "original_word_count": word_count,
        "summary_word_count": summary_words,
        "compression_ratio": ratio,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. Spam Detection
# ─────────────────────────────────────────────────────────────────────────────

# Simple heuristic signal detectors to augment the model
_SPAM_PATTERNS = [
    (r"\b(free|win|winner|prize|click here|buy now|act now)\b", "Contains promotional/spam phrases"),
    (r"(https?://\S+){3,}", "Excessive URLs"),
    (r"[A-Z]{5,}", "Excessive capitalisation"),
    (r"(!{3,}|\?{3,})", "Excessive punctuation"),
    (r"(\$\d+|\d+%\s*off)", "Heavy discount or monetary lure"),
]


def check_spam(text: str) -> Dict[str, Any]:
    pipe = _get_spam_pipeline()
    result = pipe(text)[0]

    raw_label = result["label"].upper()   # "SPAM" or "HAM"
    model_score = round(result["score"], 4)

    # Heuristic reasons
    reasons = []
    for pattern, reason in _SPAM_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            reasons.append(reason)

    # Override model if heuristics are strong:
    # - 3+ signals → always spam (model is clearly wrong)
    # - 2+ signals + model not very confident (< 0.85 for NOT SPAM) → spam
    heuristic_spam = len(reasons) >= 3 or (len(reasons) >= 2 and model_score < 0.85)
    is_spam = raw_label == "SPAM" or heuristic_spam
    confidence = model_score

    return {
        "is_spam": is_spam,
        "confidence": confidence,
        "label": "SPAM" if is_spam else "NOT SPAM",
        "reasons": reasons,
    }
