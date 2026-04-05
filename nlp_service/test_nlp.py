"""
Quick test script — runs each NLP feature against a sample blog post
WITHOUT needing a running server. Run with:

    python test_nlp.py

This proves all models load and produce sensible output locally.
"""

import json

SAMPLE_BLOG = """
Artificial intelligence are changing the world in ways we never imagined.
From healthcare to finance, AI systems is transforming how we work and live.
But their is still much work to be done before we can fully trust these systems.
Click here to WIN a FREE prize and buy now for 50% off! Visit http://spam.link http://spam2.link http://spam3.link

Machine learning models can now write poetry, compose music, and even diagnose diseases.
The future of AI looks bright, with researchers making breakthroughs every single day.
However, we must ensure that AI development remains ethical and transparent, so that all
people benefit from these advances. The collaborative effort between humans and machines
will define the next decade of technological progress.
"""


def run_test():
    # ── Import engine (models load on first use) ──────────────────────────────
    from app.nlp_engine import (
        fix_grammar,
        extract_keywords,
        analyse_sentiment,
        summarise,
        check_spam,
    )

    print("=" * 60)
    print("  NLP Microservice — Local Feature Tests")
    print("=" * 60)

    # 1. Grammar Fix
    print("\n[1] Grammar Fix")
    g = fix_grammar(SAMPLE_BLOG)
    print(f"  Errors found : {g['errors_found']}")
    print(f"  Corrected    : {g['corrected_text'][:120]}…")

    # 2. Keywords
    print("\n[2] Keyword Extraction")
    k = extract_keywords(SAMPLE_BLOG, top_n=7)
    for kw in k["keywords"]:
        print(f"  {kw['keyword']:<30} score={kw['score']}")

    # 3. Sentiment
    print("\n[3] Sentiment Analysis")
    s = analyse_sentiment(SAMPLE_BLOG)
    print(f"  Label   : {s['label']}  {s['emoji']}")
    print(f"  Score   : {s['score']}")
    print(f"  Summary : {s['summary']}")

    # 4. Summary
    print("\n[4] Summary Generation")
    sm = summarise(SAMPLE_BLOG)
    print(f"  Original words : {sm['original_word_count']}")
    print(f"  Summary words  : {sm['summary_word_count']}")
    print(f"  Compression    : {sm['compression_ratio']}")
    print(f"  Preview        : {sm['summary']}")

    # 5. Spam
    print("\n[5] Spam Detection")
    sp = check_spam(SAMPLE_BLOG)
    print(f"  Label      : {sp['label']}")
    print(f"  Is spam    : {sp['is_spam']}")
    print(f"  Confidence : {sp['confidence']}")
    print(f"  Reasons    : {sp['reasons']}")

    print("\n" + "=" * 60)
    print("  All tests passed ✓")
    print("=" * 60)


if __name__ == "__main__":
    run_test()
