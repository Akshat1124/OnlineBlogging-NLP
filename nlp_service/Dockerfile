# ── Base image ────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# ── Java (required by LanguageTool grammar checker) ───────────────────────────
RUN apt-get update && \
    apt-get install -y --no-install-recommends default-jre-headless && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ── Working directory ─────────────────────────────────────────────────────────
WORKDIR /app

# ── Install Python dependencies ───────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Download spaCy English model ──────────────────────────────────────────────
RUN python -m spacy download en_core_web_sm

# ── Pre-download HuggingFace models into the image ────────────────────────────
# Updated to match the actual models used in nlp_engine.py
RUN python -c "\
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM; \
from sentence_transformers import SentenceTransformer; \
SentenceTransformer('all-MiniLM-L6-v2'); \
pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english'); \
AutoTokenizer.from_pretrained('sshleifer/distilbart-cnn-12-6'); \
AutoModelForSeq2SeqLM.from_pretrained('sshleifer/distilbart-cnn-12-6'); \
pipeline('text-classification', model='mrm8488/bert-tiny-finetuned-sms-spam-detection'); \
print('All models downloaded.')"

# ── Copy application source ───────────────────────────────────────────────────
COPY app/ ./app/

# ── Port ──────────────────────────────────────────────────────────────────────
# HuggingFace Spaces requires port 7860
# Local / EC2 Docker usage can override with: docker run -p 8000:7860
ENV PORT=7860
EXPOSE 7860

# ── Start the server ──────────────────────────────────────────────────────────
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
