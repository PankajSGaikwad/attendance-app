package com.attendance.employee.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateEmployeeRequest (

        @NotBlank(message = "UserID is Required")
        @Size(max = 100, message = "UserID Cannot exceed 100 character")
        String userId,

        @NotBlank(message = "Name is Required")
        @Size(max = 50, message = "Name Cannot exceed 50 character")
        String firstName,

        @NotBlank(message = "LastName is Required")
        @Size(max = 50, message = "LastName Cannot exceed 50 character")
        String lastName,

        @NotBlank(message = "EmailID is Required")
        @Email(message = "EmailID Must be Valid")
        @Size(max = 150, message = "LastName Cannot exceed 150 character")
        String email,

        @NotBlank(message = "Phone is Required")
        @Pattern(
                regexp = "^[0-9+()\\- ]{7,20}$",
                message = "Phone number format is invalid"
        )
        String phone,

        @NotBlank(message = "Department is Required")
        @Size(max = 100, message = "Department Cannot exceed 100 character")
        String department,

        @NotBlank(message = "Designation is Required")
        @Size(max = 100, message = "Designation Cannot exceed 100 character")
        String designation
){
}
