package com.blog.insightblog.service;

import com.blog.insightblog.dto.ModerationRequest;
import com.blog.insightblog.dto.ModerationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Calls the Python NLP FastAPI /analyze endpoint with retry logic.
 * Integrated from the new backend repository.
 *
 * Complements NlpService (which calls /analyse/full for full NLP pipeline).
 * This service focuses on content moderation gating (ALLOWED / BLOCKED).
 */
@Slf4j
@Service
public class ModerationService {

    private final RestTemplate restTemplate;

    public ModerationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sends text to the NLP /analyze endpoint with up to 3 retry attempts.
     * Falls back gracefully if the NLP service is unavailable.
     *
     * @param text   the blog/comment content to analyze
     * @param userId the username of the author
     * @return ModerationResponse with status, score, sentiment, keywords
     */
    public ModerationResponse analyze(String text, String userId) {

        String url = "http://127.0.0.1:8000/analyze";

        ModerationRequest req = new ModerationRequest();
        req.setText(text);
        req.setUser_id(userId);

        int attempts = 0;
        int maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                log.info("Calling NLP /analyze service (attempt {}): text length={}", attempts + 1, text.length());

                ModerationResponse response = restTemplate.postForObject(
                        url,
                        req,
                        ModerationResponse.class
                );

                if (response != null) {
                    log.info("NLP moderation result: status={}, score={}", response.getStatus(), response.getScore());
                    return response;
                }

            } catch (Exception ex) {
                attempts++;
                log.error("NLP /analyze call failed (attempt {}): {}", attempts, ex.getMessage());

                if (attempts == maxAttempts) {
                    log.warn("NLP service unreachable after {} attempts → using fallback (ALLOWED)", maxAttempts);

                    // Fallback: allow publish if NLP service is down
                    ModerationResponse fallback = new ModerationResponse();
                    fallback.setStatus("ALLOWED");
                    fallback.setMessage("NLP service unavailable - fallback used");
                    fallback.setCleanedText(text);
                    fallback.setScore(0.0);
                    fallback.setSentiment(0.0);
                    fallback.setKeywords(null);
                    fallback.setStrikes(0);

                    return fallback;
                }

                try {
                    Thread.sleep(500);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
                continue;
            }

            attempts++;
        }

        return null;
    }
}
