package com.attendance.shift.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateShiftRequest(

        @NotBlank(message = "Shift name is required")
        @Size(max = 100)
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

        @Min(0)
        @Max(180)
        int earlyPunchInMinutes,

        @Min(0)
        @Max(180)
        int lateGraceMinutes,

        @Min(0)
        @Max(720)
        int maxPunchOutAfterMinutes
) {
}