package com.attendance.shift.util;

public record ShiftDefinition(
        boolean overnight,
        int nominalDurationMinutes
) {
}
