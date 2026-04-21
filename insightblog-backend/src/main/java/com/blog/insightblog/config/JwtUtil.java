package com.blog.insightblog.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key SECRET_KEY = Keys.hmacShaKeyFor(
            "this_is_a_very_secure_secret_key_1234567890".getBytes()
    );

    // extract username
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // extract expiration
    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    // extract all claims
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // check token expired
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // validate token (FIXED)
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // generate token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(SECRET_KEY)
                .compact();
    }
}