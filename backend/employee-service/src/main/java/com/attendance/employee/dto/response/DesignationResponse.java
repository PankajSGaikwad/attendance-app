package com.attendance.employee.dto.response;

import java.time.Instant;

public record DesignationResponse(
        String id,
        String code,
        String name,
        String departmentId,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
