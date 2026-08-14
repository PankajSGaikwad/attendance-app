package com.attendance.media.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidMediaException.class)
    public ResponseEntity<ApiError>
    handleInvalidMedia(
            InvalidMediaException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(
            InvalidAttendanceAttemptException.class
    )
    public ResponseEntity<ApiError>
    handleInvalidAttempt(
            InvalidAttendanceAttemptException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(MediaAlreadyExistsException.class)
    public ResponseEntity<ApiError>
    handleAlreadyExists(
            MediaAlreadyExistsException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(MediaNotFoundException.class)
    public ResponseEntity<ApiError>
    handleNotFound(
            MediaNotFoundException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(ForbiddenMediaException.class)
    public ResponseEntity<ApiError>
    handleForbidden(
            ForbiddenMediaException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.FORBIDDEN,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(TelegramStorageException.class)
    public ResponseEntity<ApiError>
    handleTelegram(
            TelegramStorageException exception,
            HttpServletRequest request
    ) {

        log.error(
                "Telegram storage error",
                exception
        );

        return build(
                HttpStatus.BAD_GATEWAY,
                "Media storage provider is unavailable",
                request
        );
    }

    @ExceptionHandler(DownstreamServiceException.class)
    public ResponseEntity<ApiError>
    handleDownstream(
            DownstreamServiceException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.SERVICE_UNAVAILABLE,
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(
            MaxUploadSizeExceededException.class
    )
    public ResponseEntity<ApiError>
    handleMaxUpload(
            MaxUploadSizeExceededException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "Attendance photo is too large",
                request
        );
    }

    @ExceptionHandler({
            DuplicateKeyException.class,
            OptimisticLockingFailureException.class
    })
    public ResponseEntity<ApiError>
    handleConflict(
            RuntimeException exception,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.CONFLICT,
                "Media was modified by another request",
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError>
    handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {

        log.error(
                "Unexpected Media Service error",
                exception
        );

        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected server error",
                request
        );
    }

    private ResponseEntity<ApiError> build(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {

        ApiError error =
                new ApiError(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI(),
                        Map.of()
                );

        return ResponseEntity
                .status(status)
                .body(error);
    }
}