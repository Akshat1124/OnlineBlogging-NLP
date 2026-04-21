package com.blog.insightblog.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class PostDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String username;

    private LocalDateTime createdAt;

    // ✅ NLP fields returned to frontend after publish
    private String summary;
    private String sentiment;
    private Boolean isSpam;
    private Double spamScore;
    private String tags;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public Boolean getIsSpam() { return isSpam; }
    public void setIsSpam(Boolean isSpam) { this.isSpam = isSpam; }

    public Double getSpamScore() { return spamScore; }
    public void setSpamScore(Double spamScore) { this.spamScore = spamScore; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}