package com.blog.insightblog.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Stores a log of every moderation check performed on blog content.
 * Useful for admin review and audit trails.
 */
@Entity
@Table(name = "moderation_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ModerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(columnDefinition = "TEXT")
    private String contentSnippet;   // first 500 chars of the blog

    private String sentiment;        // POSITIVE | NEUTRAL | NEGATIVE
    private Double toxicityScore;

    private Boolean allowed;         // true = published, false = blocked

    @Column(columnDefinition = "TEXT")
    private String flagCategories;   // comma-separated: "hate,abuse,violence"

    @Column(columnDefinition = "TEXT")
    private String reason;           // block reason (null if allowed)

    private LocalDateTime checkedAt;

    @PrePersist
    public void setCheckedAt() {
        this.checkedAt = LocalDateTime.now();
    }
}
