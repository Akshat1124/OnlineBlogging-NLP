package com.blog.insightblog.controller;

import com.blog.insightblog.model.Comment;
import com.blog.insightblog.service.CommentService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * Post a comment on a blog.
     * NLP analyses the comment sentiment before saving.
     * Body: { "content": "Great post!" }
     */
    @PostMapping("/{postId}")
    public Comment createComment(@PathVariable Long postId,
                                 @RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        String content = body.get("content");
        return commentService.createComment(postId, username, content);
    }

    /**
     * Get all comments for a blog post.
     * Each comment includes: content, username, sentimentLabel, createdAt
     */
    @GetMapping("/{postId}")
    public List<Comment> getComments(@PathVariable Long postId) {
        return commentService.getCommentsByPost(postId);
    }
}