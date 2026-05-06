package com.blog.insightblog.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Response payload from the Python NLP /analyze endpoint.
 * Integrated from new backend repository.
 *
 * Fields:
 *  status      — "ALLOWED" or "BLOCKED"
 *  message     — human-readable result message
 *  cleaned_text — content after moderation cleanup
 *  score       — toxicity score (0.0 – 1.0)
 *  strikes     — accumulated user strikes
 *  sentiment   — sentiment score (numeric)
 *  keywords    — extracted keywords list
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ModerationResponse {

    private String status;
    private String message;

    @JsonProperty("cleaned_text")
    private String cleanedText;

    private Double score;
    private Integer strikes;

    private Double sentiment;
    private List<String> keywords;
}
