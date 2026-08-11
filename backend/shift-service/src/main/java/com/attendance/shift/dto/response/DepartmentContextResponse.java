package com.attendance.shift.dto.response;

public record DepartmentContextResponse(

        String departmentId,
        String code,
        String name,
        boolean active
) {
}