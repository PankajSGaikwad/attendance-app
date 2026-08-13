package com.attendance.attendanceservice.dto.response;

public record EmployeeQrContextResponse(
        String employeeId,
        String userId,
        String employeeCode,
        String fullName,
        String departmentId,
        String designationId,
        String status,
        boolean active
) {
}
