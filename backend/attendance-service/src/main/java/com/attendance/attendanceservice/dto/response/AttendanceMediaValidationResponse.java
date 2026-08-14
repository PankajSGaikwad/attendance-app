package com.attendance.attendanceservice.dto.response;

import java.time.Instant;

public record AttendanceMediaValidationResponse(

        String attemptId,

        String employeeId,

        String userId,

        String action,

        String source,

        String authenticatedUserId,

        Instant expiresAt

) {
}