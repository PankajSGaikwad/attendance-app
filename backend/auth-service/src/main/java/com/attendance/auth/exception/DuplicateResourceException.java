package com.attendance.auth.exception;

public class DuplicateResourceException extends RuntimeException{
    public DuplicateResourceException(
            String message
    ) {
        super(message);
    }
}
