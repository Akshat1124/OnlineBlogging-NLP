package com.blog.insightblog.controller;

import com.blog.insightblog.model.ModerationLog;
import com.blog.insightblog.repository.ModerationLogRepository;
import com.blog.insightblog.service.NlpService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Exposes NLP endpoints for the React frontend.
 * The frontend calls these → Spring Boot calls the Python NLP service.
 *
 * Endpoints:
 *   POST /api/nlp/analyse      → runs all 5 NLP features at once
 *   POST /api/nlp/moderate     → pre-publish toxicity/sentiment gate
 *   POST /api/nlp/rewrite      → AI tone improvement
 *   GET  /api/nlp/moderation-logs → admin: view all moderation decisions
 */
@Slf4j
@RestController
@RequestMapping("/api/nlp")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3002"})
public class NlpController {

    @Autowired
    private NlpService nlpService;

    @Autowired
    private ModerationLogRepository moderationLogRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${nlp.service.url}")
    private String nlpUrl;

    /**
     * Frontend sends: { "text": "blog content here" }
     * Returns full NLP analysis: grammar + keywords + sentiment + summary + spam
     */
    @PostMapping("/analyse")
    public ResponseEntity<Map<String, Object>> analyse(@RequestBody Map<String, String> body) {
        String text = body.get("text");

        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Map<String, Object> result = nlpService.analyseText(text);
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/nlp/moderate
     * Pre-publish content moderation gate.
     * Calls Python NLP service /moderate/check and logs the result.
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/moderate")
    public ResponseEntity<Map<String, Object>> moderate(@RequestBody Map<String, String> body) {
        String text = body.get("text");

        if (text == null || text.trim().isEmpty()) {
            // Empty text is always allowed
            Map<String, Object> ok = new HashMap<>();
            ok.put("allowed", true);
            ok.put("sentiment", "NEUTRAL");
            ok.put("toxicity_score", 0.0);
            ok.put("flags", List.of());
            ok.put("flag_categories", List.of());
            return ResponseEntity.ok(ok);
        }

        try {
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", text);

            Map<String, Object> result = restTemplate.postForObject(
                    nlpUrl + "/moderate/check",
                    requestBody,
                    Map.class
            );

            if (result == null) {
                result = new HashMap<>();
                result.put("allowed", true);
            }

            // Log the moderation decision
            try {
                String username = "anonymous";
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                    username = auth.getName();
                }

                ModerationLog log = new ModerationLog();
                log.setUsername(username);
                log.setContentSnippet(text.length() > 500 ? text.substring(0, 500) : text);
                log.setSentiment((String) result.get("sentiment"));

                Object toxScore = result.get("toxicity_score");
                log.setToxicityScore(toxScore instanceof Number ? ((Number) toxScore).doubleValue() : 0.0);

                Object allowed = result.get("allowed");
                log.setAllowed(allowed instanceof Boolean ? (Boolean) allowed : true);

                Object cats = result.get("flag_categories");
                if (cats instanceof List) {
                    log.setFlagCategories(String.join(",", (List<String>) cats));
                }

                log.setReason((String) result.get("reason"));
                moderationLogRepository.save(log);

            } catch (Exception logErr) {
                System.err.println("Failed to save moderation log: " + logErr.getMessage());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Moderation service unreachable: {}", e.getMessage());
            // Fallback: allow publish if NLP service is down
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("allowed", true);
            fallback.put("sentiment", "UNKNOWN");
            fallback.put("toxicity_score", 0.0);
            fallback.put("flags", List.of());
            fallback.put("flag_categories", List.of());
            fallback.put("reason", null);
            fallback.put("fallback", true);
            return ResponseEntity.ok(fallback);
        }
    }

    /**
     * POST /api/nlp/rewrite
     * AI tone improvement — rewrites toxic/negative text to neutral.
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/rewrite")
    public ResponseEntity<Map<String, Object>> rewrite(@RequestBody Map<String, String> body) {
        String text = body.get("text");

        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", text);

            Map<String, Object> result = restTemplate.postForObject(
                    nlpUrl + "/moderate/rewrite",
                    requestBody,
                    Map.class
            );

            return ResponseEntity.ok(result != null ? result : new HashMap<>());

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Rewrite service unavailable");
            return ResponseEntity.status(503).body(error);
        }
    }

    /**
     * GET /api/nlp/moderation-logs
     * Admin feature: view all moderation decisions.
     */
    @GetMapping("/moderation-logs")
    public ResponseEntity<List<ModerationLog>> getModerationLogs() {
        return ResponseEntity.ok(moderationLogRepository.findAllByOrderByCheckedAtDesc());
    }

    /**
     * GET /api/nlp/moderation-logs/blocked
     * Admin feature: view only blocked content.
     */
    @GetMapping("/moderation-logs/blocked")
    public ResponseEntity<List<ModerationLog>> getBlockedLogs() {
        return ResponseEntity.ok(moderationLogRepository.findByAllowedFalseOrderByCheckedAtDesc());
    }
}
