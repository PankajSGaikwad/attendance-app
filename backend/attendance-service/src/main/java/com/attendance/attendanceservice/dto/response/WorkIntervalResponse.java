package com.attendance.attendanceservice.dto.response;

public record WorkIntervalResponse(

        String id,

        PunchResponse punchIn,
        PunchResponse punchOut,

        long workedMinutes
) {
}