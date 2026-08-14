package com.attendance.media.exception;

public class TelegramStorageException extends RuntimeException {
    public TelegramStorageException(String message) {
        super(message);
    }
    public TelegramStorageException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}
