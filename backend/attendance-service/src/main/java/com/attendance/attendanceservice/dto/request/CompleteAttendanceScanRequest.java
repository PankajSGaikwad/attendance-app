package com.attendance.attendanceservice.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.Instant;

public record CompleteAttendanceScanRequest(

        @NotBlank(message = "Attempt ID is required")
        String attemptId,

        @NotBlank(message = "Completion token is required")
        String completionToken,

        @NotBlank(message = "Attendance photo ID is required")
        String photoId,

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0")
        @DecimalMax(value = "90.0")
        Double latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0")
        @DecimalMax(value = "180.0")
        Double longitude,

        @NotNull(message = "Location accuracy is required")
        @Positive(message = "Location accuracy must be positive")
        Double accuracyMeters,

        Instant clientCapturedAt
) {
}