package com.attendance.shift.dto.request;

import jakarta.validation.constraints.*;

public record CreateShiftRequest(

        @NotBlank(message = "Shift Code is Required")
        @Pattern(
                regexp = "^[A-Za-z][A-Za-z0-9_-]{0,29}$",
                message = "Shift code may contain letters, numbers, underscore and hyphen"
        )
        String code,

        @NotBlank(message = "Shift Name Is Required")
        @Size(
                max = 100,
                message = "Shift name cannot exceed 100 characters"
        )
        String name,

        @NotBlank(message = "Start time is required")
        @Pattern(
                regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
                message = "Start time must use HH:mm format"
        )
        String startTime,

        @NotBlank(message = "End time is required")
        @Pattern(
                regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
                message = "End time must use HH:mm format"
        )
        String endTime,

        @NotBlank(message = "Time zone is required")
        String zoneId,

        @Min(value = 0, message = "Early punch in cannot be negative")
        @Max(value = 180, message = "Early punch in cannot exceed 180 minutes")
        int earlyPunchInMinutes,

        @Min(value = 0, message = "Late punch in cannot be negative")
        @Max(value = 180, message = "Late punch in cannot exceed 180 minutes")
        int lateGraceMinutes,

        @Min(value = 0, message = "Punch-out allowance cannot be negative")
        @Max(value = 720, message = "Punch-out allowance cannot exceed 720 minutes")
        int maxPunchOutAfterMinutes
) {
}
