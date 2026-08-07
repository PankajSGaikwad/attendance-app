package com.attendance.employee.dto.response;

import com.attendance.employee.model.EmployeeStatus;

public record EmployeeQrContextResponse(
        String employeeId,
        String employeeCode,
        String fullName,
        String departmentId,
        String designationId,
        EmployeeStatus status,
        boolean active
) {
}
