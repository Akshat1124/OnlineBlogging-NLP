package com.blog.insightblog.controller;

import com.blog.insightblog.service.LikeService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    /** Like a post — toggle (like if not liked, error if already liked) */
    @PostMapping("/{postId}")
    public String likePost(@PathVariable Long postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return likeService.likePost(postId, username);
    }

    /** Unlike a post */
    @DeleteMapping("/{postId}")
    public String unlikePost(@PathVariable Long postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return likeService.unlikePost(postId, username);
    }

    /** Get like count for a post — shown on blog detail page */
    @GetMapping("/{postId}")
    public long countLikes(@PathVariable Long postId) {
        return likeService.countLikes(postId);
    }
}