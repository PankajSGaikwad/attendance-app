package com.attendance.shift.util;

import java.time.LocalDate;
import java.time.ZonedDateTime;

public record ShiftWindow(

        LocalDate shiftDate,

        ZonedDateTime scheduledStart,
        ZonedDateTime scheduledEnd,

        ZonedDateTime earliestPunchIn,
        ZonedDateTime lateAfter,
        ZonedDateTime punchOutDeadline,

        boolean overnight,
        long scheduledDurationMinutes
) {
}
