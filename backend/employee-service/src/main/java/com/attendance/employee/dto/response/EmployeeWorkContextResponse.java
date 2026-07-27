package com.attendance.employee.dto.response;

import com.attendance.employee.model.EmployeeStatus;

public record EmployeeWorkContextResponse(

        String employeeId,
        String userId,
        String employeeCode,
        String departmentId,
        String designationId,
        EmployeeStatus status,
        boolean active
) {
}
