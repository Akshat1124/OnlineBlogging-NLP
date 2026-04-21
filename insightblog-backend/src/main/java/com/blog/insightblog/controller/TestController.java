package com.blog.insightblog.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
public class TestController {

    private final JdbcTemplate jdbcTemplate;

    public TestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/test")
    public String test() {
        return "Protected API Working ✅";
    }

    @GetMapping("/api/db-check")
    public String checkDb() {
        try {
            jdbcTemplate.execute("SELECT 1");
            return "Database Connected ✅";
        } catch (Exception e) {
            return "Database Error ❌: " + e.getMessage();
        }
    }
}