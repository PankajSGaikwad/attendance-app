package com.attendance.employee.dto.response;

import java.time.Instant;

public record DepartmentResponse(
        String id,
        String name,
        String code,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
