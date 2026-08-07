package com.attendance.employee.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateEmployeeRequest (

        @NotBlank(message = "Name is Required")
        @Size(max = 50, message = "Name Cannot exceed 50 character")
        String firstName,

        @NotBlank(message = "LastName is Required")
        @Size(max = 50, message = "LastName Cannot exceed 50 character")
        String lastName,

        @NotBlank(message = "Phone is Required")
        @Pattern(
                regexp = "^[0-9+()\\- ]{7,20}$",
                message = "Phone number format is invalid"
        )
        String phone,

        @NotBlank(message = "DepartmentID is Required")
        String departmentId,

        @NotBlank(message = "DesignationID is Required")
        String designationId
){
}
