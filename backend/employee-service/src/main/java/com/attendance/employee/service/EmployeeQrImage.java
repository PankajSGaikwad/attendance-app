package com.attendance.employee.service;

public record EmployeeQrImage(
        String fileName,
        byte[] content
) {
}
