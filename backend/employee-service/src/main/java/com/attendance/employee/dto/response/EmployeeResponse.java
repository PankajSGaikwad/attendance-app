package com.attendance.employee.dto.response;

import com.attendance.employee.model.EmployeeStatus;

import java.time.Instant;

public record EmployeeResponse(

        String id,
        String userId,

        String firstName,
        String lastName,
        String email,
        String phone,

        String departmentId,
        String departmentName,

        String designationId,
        String designationName,

        EmployeeStatus status,
        boolean active,

        String profilePhotoId,

        String employeeCode,
        boolean qrAvailable,

        String rejectionReason,

        Instant submittedAt,

        Instant approvedAt,
        String approvedBy,

        Instant rejectedAt,
        String rejectedBy,

        Instant createdAt,
        Instant updatedAt
) {
}