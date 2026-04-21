package com.blog.insightblog.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Calls the Python NLP FastAPI service running at localhost:8000.
 * All analysis is done via POST /analyse/full which runs all 5 NLP features.
 */
@Service
public class NlpService {

    @Value("${nlp.service.url}")
    private String nlpUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends blog text to the NLP service and returns a map containing:
     *  grammar   → corrected_text, errors_found
     *  keywords  → keywords (list), top_keyword
     *  sentiment → label, score, emoji, summary
     *  summary   → summary text, compression_ratio
     *  spam      → is_spam, confidence, label, reasons
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyseText(String text) {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("text", text);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                nlpUrl + "/analyse/full",
                requestBody,
                Map.class
            );
            return response != null ? response : new HashMap<>();
        } catch (Exception e) {
            // NLP service unreachable — return empty map so blog can still be saved
            System.err.println("NLP service unavailable: " + e.getMessage());
            return new HashMap<>();
        }
    }

    // ── Convenience extractors ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public String extractSummary(Map<String, Object> nlp) {
        try {
            Map<String, Object> summaryBlock = (Map<String, Object>) nlp.get("summary");
            return summaryBlock != null ? (String) summaryBlock.get("summary") : null;
        } catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    public String extractSentiment(Map<String, Object> nlp) {
        try {
            Map<String, Object> sentimentBlock = (Map<String, Object>) nlp.get("sentiment");
            return sentimentBlock != null ? (String) sentimentBlock.get("label") : null;
        } catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    public Boolean extractIsSpam(Map<String, Object> nlp) {
        try {
            Map<String, Object> spamBlock = (Map<String, Object>) nlp.get("spam");
            return spamBlock != null ? (Boolean) spamBlock.get("is_spam") : false;
        } catch (Exception e) { return false; }
    }

    @SuppressWarnings("unchecked")
    public Double extractSpamScore(Map<String, Object> nlp) {
        try {
            Map<String, Object> spamBlock = (Map<String, Object>) nlp.get("spam");
            if (spamBlock == null) return null;
            Object conf = spamBlock.get("confidence");
            return conf instanceof Number ? ((Number) conf).doubleValue() : null;
        } catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    public String extractTags(Map<String, Object> nlp) {
        try {
            Map<String, Object> keywordsBlock = (Map<String, Object>) nlp.get("keywords");
            if (keywordsBlock == null) return null;
            List<Map<String, Object>> keywords = (List<Map<String, Object>>) keywordsBlock.get("keywords");
            if (keywords == null || keywords.isEmpty()) return null;
            // Take top 5 keywords, join as comma-separated string
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(5, keywords.size()); i++) {
                if (i > 0) sb.append(",");
                sb.append(keywords.get(i).get("keyword"));
            }
            return sb.toString();
        } catch (Exception e) { return null; }
    }
}
