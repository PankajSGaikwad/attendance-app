package com.attendance.attendanceservice.dto.response;

import com.attendance.attendanceservice.model.AttendanceAction;

import java.time.Instant;

public record StartAttendanceScanResponse(

        String attemptId,
        String completionToken,

        AttendanceAction action,

        Instant expiresAt,
        long expiresInSeconds,

        String employeeCode,
        String employeeName,

        String attendanceDate,
        String shiftName,

        boolean overnight,

        boolean photoRequired,
        boolean locationRequired
) {
}