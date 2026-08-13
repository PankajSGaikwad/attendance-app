package com.attendance.attendanceservice.dto.response;

import java.time.Instant;

public record EffectiveShiftResponse(
        String employeeId,
        String departmentId,

        String assignmentId,
        String shiftId,
        String shiftCode,
        String shiftName,

        String shiftDate,

        String zoneId,
        String startTime,
        String endTime,

        boolean overnight,
        long scheduledDurationMinutes,

        Instant scheduledStartAt,
        Instant scheduledEndAt,

        Instant earliestPunchInAt,
        Instant lateAfterAt,
        Instant punchOutDeadlineAt,

        Instant requestedAt,
        boolean late
) {
}
