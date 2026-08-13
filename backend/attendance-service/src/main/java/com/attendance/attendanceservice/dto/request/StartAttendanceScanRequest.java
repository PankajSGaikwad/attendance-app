package com.attendance.attendanceservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record StartAttendanceScanRequest(

        @NotBlank(message = "QR value is required")
        String qrValue
) {
}