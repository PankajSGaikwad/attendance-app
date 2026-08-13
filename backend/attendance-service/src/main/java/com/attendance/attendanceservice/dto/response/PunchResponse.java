package com.attendance.attendanceservice.dto.response;

import com.attendance.attendanceservice.model.AttendanceSource;

import java.time.Instant;

public record PunchResponse(

        Instant recordedAt,

        String photoId,

        double latitude,
        double longitude,
        double accuracyMeters,

        AttendanceSource source
) {
}
