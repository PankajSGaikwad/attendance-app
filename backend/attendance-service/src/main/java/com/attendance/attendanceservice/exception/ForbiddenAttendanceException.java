package com.attendance.attendanceservice.exception;

public class ForbiddenAttendanceException extends RuntimeException {
    public ForbiddenAttendanceException(String message) {
        super(message);
    }
}
