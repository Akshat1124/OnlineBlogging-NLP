package com.blog.insightblog.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    // ✅ USER RELATION
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ NLP FIELDS — populated at publish time
    @Column(columnDefinition = "TEXT")
    private String summary;

    private String sentiment;       // POSITIVE / NEGATIVE / NEUTRAL

    private Boolean isSpam = false;

    private Double spamScore;

    @Column(columnDefinition = "TEXT")
    private String tags;            // stored as comma-separated string e.g. "ai,healthcare,ml"

    // ✅ AUTO SET TIME
    @PrePersist
    public void setCreatedAt() {
        this.createdAt = LocalDateTime.now();
    }
}