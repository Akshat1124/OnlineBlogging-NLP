package com.blog.insightblog.controller;

import com.blog.insightblog.service.NlpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Exposes NLP endpoints for the React frontend.
 * The frontend calls these → Spring Boot calls the Python NLP service.
 *
 * Endpoints:
 *   POST /api/nlp/analyse      → runs all 5 NLP features at once
 */
@RestController
@RequestMapping("/api/nlp")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NlpController {

    @Autowired
    private NlpService nlpService;

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
}
