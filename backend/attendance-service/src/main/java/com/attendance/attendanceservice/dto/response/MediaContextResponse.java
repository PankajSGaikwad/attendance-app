package com.attendance.attendanceservice.dto.response;
import java.time.Instant;

public record MediaContextResponse(

        String mediaId,

        String attemptId,

        String employeeId,

        String userId,

        String type,

        String status,

        String source,

        Instant uploadedAt

) {
}