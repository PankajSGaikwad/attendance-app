package com.attendance.employee.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateDesignationRequest(
        @NotBlank(message = "Designation Code Is Required")
        @Pattern(
                regexp = "^[A-Za-z][A-Za-z0-9_-]{0,29}$",
                message = "Designation Code contains letter,Number,Underscore and hyphen"
        )String code,

        @NotBlank(message = "Designation Name Is Required")
        @Size(
                max = 100,
                message = "Designation name cannot exceed 100 characters"
        )String name
) {
}
