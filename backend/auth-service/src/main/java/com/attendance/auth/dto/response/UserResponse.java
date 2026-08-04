package com.attendance.auth.dto.response;

import com.attendance.auth.model.UserRole;
import com.attendance.auth.model.UserStatus;

import java.time.Instant;
import java.util.Set;

public record UserResponse(
        String id,
        String email,
        Set<UserRole> roles,
        UserStatus status,
        Instant lastLoginAt,
        Instant createdAt,
        Instant updatedAt
) {
}
