
package com.blog.insightblog.service;

import com.blog.insightblog.model.Like;
import com.blog.insightblog.model.Post;
import com.blog.insightblog.model.User;
import com.blog.insightblog.repository.LikeRepository;
import com.blog.insightblog.repository.PostRepository;
import com.blog.insightblog.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public LikeService(LikeRepository likeRepository,
                       UserRepository userRepository,
                       PostRepository postRepository) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public String likePost(Long postId, String username) {

        User user = userRepository.findByUsername(username).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        if (likeRepository.findByUserAndPost(user, post).isPresent()) {
            return "Already liked";
        }

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);

        likeRepository.save(like);

        return "Post liked";
    }

    public String unlikePost(Long postId, String username) {

        User user = userRepository.findByUsername(username).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        Like like = likeRepository.findByUserAndPost(user, post).orElseThrow();

        likeRepository.delete(like);

        return "Post unliked";
    }

    public long countLikes(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow();
        return likeRepository.countByPost(post);
    }

    public java.util.Map<String, Object> toggleLike(Long postId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        java.util.Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);
        boolean liked;

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            liked = false;
        } else {
            Like like = new Like();
            like.setUser(user);
            like.setPost(post);
            likeRepository.save(like);
            liked = true;
        }

        long count = likeRepository.countByPost(post);
        return java.util.Map.of("liked", liked, "likesCount", count);
    }
    
    public java.util.Map<String, Object> getLikeStatus(Long postId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();
        boolean liked = likeRepository.findByUserAndPost(user, post).isPresent();
        long count = likeRepository.countByPost(post);
        return java.util.Map.of("liked", liked, "likesCount", count);
    }
}