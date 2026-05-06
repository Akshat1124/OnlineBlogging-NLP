package com.blog.insightblog.repository;

import com.blog.insightblog.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAll(Pageable pageable);

    // SEARCH by title
    Page<Post> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    // FIND by username
    java.util.List<Post> findByUserUsername(String username);

    // TRENDING POSTS (most likes)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p LEFT JOIN Like l ON l.post = p GROUP BY p ORDER BY COUNT(l) DESC")
    java.util.List<Post> findTrendingPosts(org.springframework.data.domain.Pageable pageable);

    Page<Post> findBySentiment(String sentiment, Pageable pageable);
    
    long countBySentiment(String sentiment);
}
