package com.attendance.attendanceservice.exception;

public class AttendanceAttemptExpiredException extends RuntimeException {
    public AttendanceAttemptExpiredException(String message) {
        super(message);
    }
}
