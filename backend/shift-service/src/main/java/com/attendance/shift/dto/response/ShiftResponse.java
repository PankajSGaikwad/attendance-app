package com.attendance.shift.dto.response;

import java.time.Instant;

public record ShiftResponse(

        String id,
        String code,
        String name,

        String startTime,
        String endTime,
        String zoneId,

        boolean overnight,
        int nominalDurationMinutes,

        int earlyPunchInMinutes,
        int lateGraceMinutes,
        int maxPunchOutAfterMinutes,

        boolean active,

        String createdBy,
        String updatedBy,

        Instant createdAt,
        Instant updatedAt
) {
}