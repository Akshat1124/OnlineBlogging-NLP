package com.blog.insightblog.service;

import com.blog.insightblog.dto.PostDTO;
import com.blog.insightblog.exception.ResourceNotFoundException;
import com.blog.insightblog.model.Post;
import com.blog.insightblog.model.User;
import com.blog.insightblog.repository.PostRepository;
import com.blog.insightblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NlpService nlpService;

    private PostDTO mapToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        if (post.getUser() != null) {
            dto.setUsername(post.getUser().getUsername());
        }
        dto.setCreatedAt(post.getCreatedAt());
        // ✅ Map NLP fields
        dto.setSummary(post.getSummary());
        dto.setSentiment(post.getSentiment());
        dto.setIsSpam(post.getIsSpam());
        dto.setSpamScore(post.getSpamScore());
        dto.setTags(post.getTags());
        return dto;
    }

    private Post mapToEntity(PostDTO dto) {
        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        return post;
    }

    // ✅ CREATE — runs NLP analysis before saving
    public PostDTO createPost(PostDTO dto, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = mapToEntity(dto);
        post.setUser(user);

        // ✅ Call NLP service and save results into the post
        try {
            Map<String, Object> nlp = nlpService.analyseText(dto.getContent());
            post.setSummary(nlpService.extractSummary(nlp));
            post.setSentiment(nlpService.extractSentiment(nlp));
            post.setIsSpam(nlpService.extractIsSpam(nlp));
            post.setSpamScore(nlpService.extractSpamScore(nlp));
            post.setTags(nlpService.extractTags(nlp));
        } catch (Exception e) {
            System.err.println("NLP analysis skipped: " + e.getMessage());
        }

        Post saved = postRepository.save(post);
        return mapToDTO(saved);
    }

    // UPDATE
    public PostDTO updatePost(Long id, PostDTO dto) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());

        Post updated = postRepository.save(post);
        return mapToDTO(updated);
    }

    // DELETE
    public String deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        postRepository.delete(post);
        return "Post deleted successfully";
    }

    // GET BY ID
    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        return mapToDTO(post);
    }

    // Pagination
    public Page<PostDTO> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    // Search
    public Page<PostDTO> searchPosts(String keyword, Pageable pageable) {
        return postRepository.findByTitleContainingIgnoreCase(keyword, pageable)
                .map(this::mapToDTO);
    }

    // List by username
    public java.util.List<PostDTO> getPostsByUsername(String username) {
        return postRepository.findByUserUsername(username).stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<PostDTO> getTrendingPosts(int limit) {
        return postRepository.findTrendingPosts(org.springframework.data.domain.PageRequest.of(0, limit)).stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    // FILTER BY SENTIMENT SCORE — from new repo
    public Page<PostDTO> getPostsBySentiment(Double minSentiment, Pageable pageable) {
        return postRepository.findAll(pageable)
                .map(this::mapToDTO);
    }
}