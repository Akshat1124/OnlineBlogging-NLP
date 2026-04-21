package com.blog.insightblog.repository;

import com.blog.insightblog.model.Like;
import com.blog.insightblog.model.Post;
import com.blog.insightblog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserAndPost(User user, Post post);

    long countByPost(Post post);
}