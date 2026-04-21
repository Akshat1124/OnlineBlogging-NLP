package com.blog.insightblog.service;

import com.blog.insightblog.config.JwtUtil;
import com.blog.insightblog.dto.AuthRequest;
import com.blog.insightblog.model.User;
import com.blog.insightblog.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // REGISTER
    public User register(AuthRequest request) {

        userRepository.findByUsername(request.getUsername())
                .ifPresent(user -> {
                    throw new RuntimeException("Username already exists");
                });

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // ✅ ADD ROLE (IMPORTANT)
        user.setRole("ROLE_USER");

        return userRepository.save(user);
    }

    // LOGIN
    public String login(AuthRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getUsername());
    }
}