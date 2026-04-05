# Online Blogging — NLP Microservice

A **FastAPI** microservice that provides five NLP features for the blogging platform, all running locally using pretrained HuggingFace models.

---

## Features & Models Used

| Feature | Endpoint | Model / Library |
|---|---|---|
| Grammar Auto-Fix | `POST /grammar/fix` | `language-tool-python` (LanguageTool) |
| Keyword Suggestions | `POST /keywords/suggest` | KeyBERT + `all-MiniLM-L6-v2` |
| Sentiment Analysis | `POST /sentiment/analyse` | `cardiffnlp/twitter-roberta-base-sentiment-latest` |
| Summary Generation | `POST /summary/generate` | `facebook/bart-large-cnn` |
| Spam Detection | `POST /spam/check` | `mrm8488/bert-tiny-finetuned-sms-spam-detection` |
| All-in-one | `POST /analyse/full` | All of the above |

---

## Project Structure

```
nlp_service/
├── app/
│   ├── main.py              # FastAPI app, CORS, router registration
│   ├── nlp_engine.py        # All model loading + core NLP logic
│   ├── models/
│   │   └── schemas.py       # Pydantic request/response models
│   └── routers/
│       ├── grammar.py
│       ├── keywords.py
│       ├── sentiment.py
│       ├── summary.py
│       ├── spam.py
│       └── analyse.py       # Combined endpoint
├── test_nlp.py              # Quick local test (no server needed)
└── requirements.txt
```

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Java 8+ installed (required by LanguageTool)

### Step 1 — Create a virtual environment
```powershell
cd d:\OnlineBloggingViaNLP\nlp_service
python -m venv venv
.\venv\Scripts\activate
```

### Step 2 — Install dependencies
```powershell
pip install -r requirements.txt
```

### Step 3 — Download the spaCy English model
```powershell
python -m spacy download en_core_web_sm
```

> **Note:** HuggingFace models (BART, RoBERTa, BERT-tiny, MiniLM) are downloaded
> automatically on first use and cached in `~/.cache/huggingface/`.
> This requires internet on first run only.

---

## Running the Service

```powershell
# From inside nlp_service/
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service starts at **http://localhost:8000**

| URL | Description |
|---|---|
| http://localhost:8000/docs | **Swagger UI** — interactive testing |
| http://localhost:8000/redoc | ReDoc documentation |
| http://localhost:8000/health | Health check |

---

## Quick Local Test (No Server Needed)

```powershell
# From inside nlp_service/
python test_nlp.py
```

This runs all five features against a sample blog post and prints results to the console.

---

## API Usage Examples

### Grammar Fix
```bash
curl -X POST http://localhost:8000/grammar/fix \
  -H "Content-Type: application/json" \
  -d '{"text": "Their are many problem in this sentense."}'
```

**Response:**
```json
{
  "original_text": "Their are many problem in this sentense.",
  "corrected_text": "There are many problems in this sentence.",
  "errors_found": 3,
  "matches": [...]
}
```

---

### Keyword Suggestions
```bash
curl -X POST "http://localhost:8000/keywords/suggest?top_n=5" \
  -H "Content-Type: application/json" \
  -d '{"text": "Machine learning and artificial intelligence are transforming healthcare..."}'
```

**Response:**
```json
{
  "keywords": [
    {"keyword": "machine learning", "score": 0.8821},
    {"keyword": "artificial intelligence", "score": 0.8614},
    ...
  ],
  "top_keyword": "machine learning"
}
```

---

### Sentiment Analysis
```bash
curl -X POST http://localhost:8000/sentiment/analyse \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a wonderful and inspiring journey!"}'
```

**Response:**
```json
{
  "label": "POSITIVE",
  "score": 0.9821,
  "emoji": "😊",
  "summary": "The blog has a positive and uplifting tone."
}
```

---

### Summary Generation
```bash
curl -X POST http://localhost:8000/summary/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Your long blog post text here (at least 50 words)..."}'
```

**Response:**
```json
{
  "summary": "A concise one-paragraph preview...",
  "original_word_count": 320,
  "summary_word_count": 68,
  "compression_ratio": 0.2125
}
```

---

### Spam Check
```bash
curl -X POST http://localhost:8000/spam/check \
  -H "Content-Type: application/json" \
  -d '{"text": "Click here to WIN a FREE prize! Buy now for 50% off!"}'
```

**Response:**
```json
{
  "is_spam": true,
  "confidence": 0.9743,
  "label": "SPAM",
  "reasons": [
    "Contains promotional/spam phrases",
    "Heavy discount or monetary lure"
  ]
}
```

---

### Full Analysis (All Features at Once)
```bash
curl -X POST http://localhost:8000/analyse/full \
  -H "Content-Type: application/json" \
  -d '{"text": "Your full blog post here..."}'
```

Returns all five results combined in one response — ideal for the Spring Boot backend to call before publishing.

---

## Spring Boot Integration

The Spring Boot backend should call this service via HTTP. Example:

```
POST http://localhost:8000/analyse/full
Content-Type: application/json

{ "text": "<blog content from editor>" }
```

Recommended flow:
1. Author writes blog in the editor → frontend sends text to Spring Boot
2. Spring Boot calls `POST /analyse/full` on this NLP service
3. Spring Boot returns the full analysis result to the frontend
4. Frontend shows: grammar corrections, keyword chips, sentiment badge, summary preview, spam warning (if any)
5. Author confirms → Spring Boot saves and publishes

---

## Testing via Swagger UI

1. Start the server: `uvicorn app.main:app --reload`
2. Open **http://localhost:8000/docs** in your browser
3. Click any endpoint → **"Try it out"** → paste text → **"Execute"**
4. View the formatted JSON response directly in the browser

No Postman or curl needed!
