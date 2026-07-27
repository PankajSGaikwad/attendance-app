package com.attendance.employee.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDesignationRequest(
        @NotBlank(message = "Designation Name Is Required")
        @Size(
                max = 100,
                message = "Designation name cannot exceed 100 characters"
        )String name
) {
}
