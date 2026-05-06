package com.blog.insightblog.exception;

/**
 * Thrown when a client sends an invalid or duplicate request.
 * E.g. registering with an existing username.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
