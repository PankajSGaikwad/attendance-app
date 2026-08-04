package com.attendance.auth.dto.request;

import com.attendance.auth.model.UserRole;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record UpdateUserRolesRequest(
        @NotEmpty(message = "At least one role is required")
        Set<@NotNull UserRole> roles) {
}
