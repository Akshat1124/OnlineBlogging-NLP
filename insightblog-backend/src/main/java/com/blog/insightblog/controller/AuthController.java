package com.blog.insightblog.controller;

import com.blog.insightblog.dto.AuthRequest;
import com.blog.insightblog.model.User;
import com.blog.insightblog.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody AuthRequest request) {
        log.info("Register request: {}", request.getUsername());
        return authService.register(request);
    }

    // LOGIN
    @PostMapping("/login")
    public String login(@RequestBody AuthRequest request) {
        log.info("Login request: {}", request.getUsername());
        return authService.login(request);
    }
}