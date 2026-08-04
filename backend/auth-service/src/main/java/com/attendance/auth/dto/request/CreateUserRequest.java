package com.attendance.auth.dto.request;

import com.attendance.auth.model.UserRole;
import jakarta.validation.constraints.*;

import java.util.Set;

public record CreateUserRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72)
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must contain uppercase, lowercase and numeric characters"
        )
        String password,

        @NotBlank(message = "Password confirmation is required")
        String confirmPassword,

        @NotEmpty(message = "At least one role is required")
        Set<UserRole> roles
) {
}
