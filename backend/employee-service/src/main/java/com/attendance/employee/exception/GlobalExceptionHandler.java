package com.attendance.employee.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<ApiError> handleEmployeeNotFound(
            EmployeeNotFoundException exception,
            HttpServletRequest request
    ){
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ){
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(DuplicateEmployeeException.class)
    public ResponseEntity<ApiError> handleDuplicateEmployee(
            DuplicateEmployeeException exception,
            HttpServletRequest request
    ){
        return  buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler({
            DuplicateResourceException.class,
            InvalidEmployeeStateException.class
    })
    public ResponseEntity<ApiError> handleConflict(
            RuntimeException exception,
            HttpServletRequest request
    ){
        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(InvalidReferenceException.class)
    public ResponseEntity<ApiError> handleInvalidReferance(
        InvalidReferenceException exception,
        HttpServletRequest request
   ){
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    /*@ExceptionHandler(InvalidEmployeeStateException.class)
    public  ResponseEntity<ApiError> handleInvalidEmployeeState(
            InvalidEmployeeStateException exception,
            HttpServletRequest request
    ){
        return  buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }*/

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiError> handleMongoDuplicateKey(
            DuplicateKeyException exception,
            HttpServletRequest request
    ){
        return  buildResponse(
                HttpStatus.CONFLICT,
                "A unique employee field already exists",
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public  ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ){
        Map<String, String> validationErrors = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors().forEach(fieldError ->
                        validationErrors.putIfAbsent(
                                fieldError.getField(),
                                fieldError.getDefaultMessage()
                        ));
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Request Validation Field",
                request.getRequestURI(),
                validationErrors
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ){
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Invalid value for parameter: " + exception.getName(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableMessage(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ){
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "RequestBody is missing",
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexcepted(
            Exception exception,
            HttpServletRequest request
            ){
        log.error(
                "Unexpected Error {}",
                request.getRequestURI(),
                exception
        );

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected Error Occure",
                request.getRequestURI(),
                Map.of()
        );
    }

    private  ResponseEntity<ApiError> buildResponse(
            HttpStatus status,
            String message,
            String path,
            Map<String, String> validationErrors
    ){
        ApiError apiError= new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,validationErrors
        );
        return ResponseEntity.status(status).body(apiError);
    }
}
