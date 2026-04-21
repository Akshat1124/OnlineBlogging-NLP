package com.blog.insightblog.controller;

import com.blog.insightblog.dto.PostDTO;
import com.blog.insightblog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private com.blog.insightblog.service.LikeService likeService;

    // CREATE ✅ FIXED
    @PostMapping
    public PostDTO createPost(@Valid @RequestBody PostDTO postDTO) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName(); // 🔥 FIX

        return postService.createPost(postDTO, username);
    }

    // UPDATE
    @PutMapping("/{id}")
    public PostDTO updatePost(@PathVariable Long id,
                              @Valid @RequestBody PostDTO postDTO) {
        return postService.updatePost(id, postDTO);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deletePost(@PathVariable Long id) {
        return postService.deletePost(id);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public PostDTO getPostById(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    // LIKE TOGGLE
    @PostMapping("/{id}/like")
    public java.util.Map<String, Object> toggleLikePost(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return likeService.toggleLike(id, username);
    }

    // LIKE STATUS
    @GetMapping("/{id}/likeStatus")
    public java.util.Map<String, Object> getLikeStatus(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
             return java.util.Map.of("liked", false, "likesCount", likeService.countLikes(id));
        }
        String username = auth.getName();
        return likeService.getLikeStatus(id, username);
    }

    // Pagination
    @GetMapping
    public Page<PostDTO> getAllPosts(Pageable pageable) {
        return postService.getAllPosts(pageable);
    }

    // Search
    @GetMapping("/search")
    public Page<PostDTO> searchPosts(@RequestParam String keyword, Pageable pageable) {
        return postService.searchPosts(keyword, pageable);
    }

    // TRENDING
    @GetMapping("/trending")
    public java.util.List<PostDTO> getTrending(@RequestParam(defaultValue = "3") int limit) {
        return postService.getTrendingPosts(limit);
    }
}