package com.attendance.media.dto.request;

public record AttendanceMediaValidationRequest(

        String attemptId,

        String completionToken

) {
}