package com.attendance.shift.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AssignDepartmentShiftRequest(

        @NotBlank(message = "Shift ID is required")
        String shiftId,

        @NotBlank(message = "Effective-from date is required")
        @Pattern(
                regexp = "^\\d{4}-\\d{2}-\\d{2}$",
                message = "Effective-from date must use YYYY-MM-DD format"
        )
        String effectiveFrom
) {
}
