package com.attendance.shift.dto.response;

public record EmployeeWorkContextResponse(

        String employeeId,
        String userId,
        String employeeCode,
        String departmentId,
        String designationId,
        String status,
        boolean active
) {
}