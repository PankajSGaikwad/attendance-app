package com.attendance.attendanceservice.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
//The Attendance Service must save the resolved shift values. It must not recalculate historical attendance when a department receives a new shift later.
public class ShiftSnapshot {
    private String assignmentId;

    private String shiftId;
    private String shiftCode;
    private String shiftName;

    private String shiftDate;

    private String zoneId;

    private String startTime;
    private String endTime;

    private boolean overnight;

    private long scheduledDurationMinutes;

    private Instant scheduledStartAt;
    private Instant scheduledEndAt;

    private Instant earliestPunchInAt;
    private Instant lateAfterAt;
    private Instant punchOutDeadlineAt;
}
