package com.attendance.shift.dto.response;

import java.time.Instant;

public record DepartmentShiftAssignmentResponse(

        String id,
        String departmentId,

        String effectiveFrom,
        String effectiveTo,

        String assignedBy,

        ShiftResponse shift,

        Instant createdAt,
        Instant updatedAt
) {
}