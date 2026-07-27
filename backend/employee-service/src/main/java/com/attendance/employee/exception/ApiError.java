package com.attendance.employee.exception;

import java.time.Instant;
import java.util.Map;
//with ApiError we will get the error message in structured manner with consistent and clear structure
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors
) {
}
