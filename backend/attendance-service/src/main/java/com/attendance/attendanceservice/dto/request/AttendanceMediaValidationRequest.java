package com.attendance.attendanceservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AttendanceMediaValidationRequest(

        @NotBlank
        String attemptId,

        @NotBlank
        String completionToken

) {
}