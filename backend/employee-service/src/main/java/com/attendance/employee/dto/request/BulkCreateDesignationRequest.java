package com.attendance.employee.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BulkCreateDesignationRequest(
        @NotEmpty(message = "At Least One Designation Is Required")
        @Size(
                max = 50,
                message = "Maximun No OF 50 Designation Created"
        )
        List<@Valid CreateDesignationRequest> designations
) {
}
