package com.blog.insightblog.service;

import com.blog.insightblog.model.Comment;
import com.blog.insightblog.model.Post;
import com.blog.insightblog.model.User;
import com.blog.insightblog.repository.CommentRepository;
import com.blog.insightblog.repository.PostRepository;
import com.blog.insightblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.blog.insightblog.dto.CommentDTO;
import com.blog.insightblog.dto.UserDTO;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    private NlpService nlpService;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a comment after analysing its sentiment via NLP.
     * Saves sentimentLabel (POSITIVE / NEGATIVE / NEUTRAL) to the comment.
     */
    public CommentDTO createComment(Long postId, String username, String content) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Run NLP sentiment analysis on the comment before saving
        String sentimentLabel = null;
        try {
            Map<String, Object> nlp = nlpService.analyseText(content);
            sentimentLabel = nlpService.extractSentiment(nlp);
        } catch (Exception e) {
            System.err.println("Comment sentiment analysis skipped: " + e.getMessage());
        }

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .user(user)
                .sentimentLabel(sentimentLabel)
                .build();

        Comment saved = commentRepository.save(comment);
        return mapToDTO(saved);
    }

    public List<CommentDTO> getCommentsByPost(Long postId) {
        return commentRepository.findByPostId(postId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<CommentDTO> getCommentsByUsername(String username) {
        return commentRepository.findByUserUsername(username).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private CommentDTO mapToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setSentimentLabel(comment.getSentimentLabel());
        dto.setCreatedAt(comment.getCreatedAt());
        
        if (comment.getUser() != null) {
            UserDTO userDto = new UserDTO();
            userDto.setId(comment.getUser().getId());
            userDto.setUsername(comment.getUser().getUsername());
            dto.setUser(userDto);
        }
        return dto;
    }
}