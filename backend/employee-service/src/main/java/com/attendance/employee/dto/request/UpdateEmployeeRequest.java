package com.attendance.employee.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

//use record because it is immutable
public record UpdateEmployeeRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name cannot exceed 50 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name cannot exceed 50 characters")
        String lastName,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^[0-9+()\\- ]{7,20}$",
                message = "Phone number format is invalid"
        )
        String phone,

        @NotBlank(message = "DepartmentID is Required")
        String departmentId,

        @NotBlank(message = "DesignationID is Required")
        String designationId
) {
}
