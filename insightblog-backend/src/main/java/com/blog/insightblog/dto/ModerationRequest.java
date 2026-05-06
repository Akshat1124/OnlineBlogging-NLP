package com.blog.insightblog.dto;

import lombok.Data;

/**
 * Request payload sent to the Python NLP /analyze endpoint.
 * Integrated from new backend repository.
 */
@Data
public class ModerationRequest {
    private String text;
    private String user_id;
}
