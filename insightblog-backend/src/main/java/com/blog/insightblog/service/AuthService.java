package com.blog.insightblog.service;

import com.blog.insightblog.config.JwtUtil;
import com.blog.insightblog.dto.AuthRequest;
import com.blog.insightblog.exception.BadRequestException;
import com.blog.insightblog.model.User;
import com.blog.insightblog.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles user registration and JWT-based login.
 * Merged from both backend versions:
 *  - existing: supports email field
 *  - new: uses AuthenticationManager for secure login, BadRequestException for duplicate usernames
 */
@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────

    public User register(AuthRequest request) {

        // Throw a proper 400 instead of a 500 if username already exists
        userRepository.findByUsername(request.getUsername())
                .ifPresent(user -> {
                    throw new BadRequestException("Username already exists");
                });

        User user = new User();
        user.setUsername(request.getUsername());
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");

        log.info("Registering new user: {}", request.getUsername());
        return userRepository.save(user);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    public String login(AuthRequest request) {

        try {
            // Delegates to Spring Security's AuthenticationManager — handles bad credentials correctly
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BadRequestException("Invalid username or password");
        }

        log.info("User logged in: {}", request.getUsername());
        return jwtUtil.generateToken(request.getUsername());
    }
}