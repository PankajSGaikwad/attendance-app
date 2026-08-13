package com.attendance.attendanceservice.exception;

public class InvalidAttendanceStateException extends RuntimeException {
    public InvalidAttendanceStateException(String message) {
        super(message);
    }
}
