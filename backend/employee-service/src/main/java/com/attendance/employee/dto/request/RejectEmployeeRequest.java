package com.attendance.employee.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectEmployeeRequest(
        @NotBlank(message = "Rejection reason is required")
        @Size(
                max = 500,
                message = "Rejection reason cannot exceed 500 characters"
        )
        String reason
) {
}
