package com.blog.insightblog.controller;

import com.blog.insightblog.dto.PostDTO;
import com.blog.insightblog.model.User;
import com.blog.insightblog.repository.UserRepository;
import com.blog.insightblog.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostService postService;

    @Autowired
    private com.blog.insightblog.service.CommentService commentService;

    /**
     * GET /api/users/me
     * Returns the logged-in user's profile info.
     * Requires JWT token in Authorization header.
     */
    @GetMapping("/me")
    public Map<String, Object> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("bio", user.getBio());
        response.put("profilePicture", user.getProfilePicture());
        return response;
    }

    /**
     * PUT /api/users/profile
     * Updates the logged-in user's profile info.
     */
    @PutMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, String> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("username") && !request.get("username").trim().isEmpty()) {
            user.setUsername(request.get("username").trim());
        }
        if (request.containsKey("email") && !request.get("email").trim().isEmpty()) {
            user.setEmail(request.get("email").trim());
        }
        if (request.containsKey("bio")) {
            user.setBio(request.get("bio"));
        }
        if (request.containsKey("profilePicture")) {
            user.setProfilePicture(request.get("profilePicture"));
        }

        userRepository.save(user);

        return getMyProfile();
    }

    /**
     * GET /api/users/me/posts
     * Returns all posts published by the logged-in user.
     */
    @GetMapping("/me/posts")
    public List<PostDTO> getMyPosts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return postService.getPostsByUsername(username);
    }

    /**
     * GET /api/users/me/comments
     * Returns all comments made by the logged-in user.
     */
    @GetMapping("/me/comments")
    public List<com.blog.insightblog.dto.CommentDTO> getMyComments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return commentService.getCommentsByUsername(username);
    }

    /**
     * GET /api/users/profile/{username}
     * Returns public profile info.
     */
    @GetMapping("/profile/{username}")
    public Map<String, Object> getUserProfile(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("username", user.getUsername());
        response.put("bio", user.getBio());
        response.put("profilePicture", user.getProfilePicture());
        return response;
    }

    /**
     * GET /api/users/posts/{username}
     * Returns posts by username.
     */
    @GetMapping("/posts/{username}")
    public List<PostDTO> getUserPosts(@PathVariable String username) {
        return postService.getPostsByUsername(username);
    }

    /**
     * GET /api/users/search
     * Search users by partial username.
     */
    @GetMapping("/search")
    public List<Map<String, Object>> searchUsers(@RequestParam String query) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);
        return users.stream().map(user -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("username", user.getUsername());
            map.put("profilePicture", user.getProfilePicture());
            return map;
        }).toList();
    }
}