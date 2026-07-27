package com.attendance.employee.dto.response;

public record DepartmentContextResponse(
        String departmentId,
        String code,
        String name,
        boolean active
) {
}
