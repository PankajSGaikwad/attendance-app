package com.attendance.employee.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDepartmentRequest(
        @NotBlank(message = "Department Name Is Required")
        @Size(
                max = 100,
                message = "Department name cannot exceed 100 characters"
        )String name
) {
}
