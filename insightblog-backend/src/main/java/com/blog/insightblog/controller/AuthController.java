package com.blog.insightblog.controller;

import com.blog.insightblog.dto.AuthRequest;
import com.blog.insightblog.model.User;
import com.blog.insightblog.service.AuthService;
import org.springframework.web.bind.annotation.*;

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
        System.out.println("Registering user: " + request.getUsername());
        return authService.register(request);
    }

    // LOGIN
    @PostMapping("/login")
    public String login(@RequestBody AuthRequest request) {
        System.out.println("Login attempt for: " + request.getUsername());
        return authService.login(request);
    }
}