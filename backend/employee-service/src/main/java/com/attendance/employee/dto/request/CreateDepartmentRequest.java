package com.attendance.employee.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateDepartmentRequest(
        @NotBlank(message = "Department Code Is Required")
        @Pattern(
                regexp = "^[A-Za-z][A-Za-z0-9_-]{0,29}$",
                message = "Department Code contains letter,Number,Underscore and hyphen"
        )String code,

        @NotBlank(message = "Department Name Is Required")
        @Size(
                max = 100,
                message = "Department name cannot exceed 100 characters"
        )String name
) {
}
