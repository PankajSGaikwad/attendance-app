package com.attendance.shift.util;

import com.attendance.shift.exception.InvalidShiftException;
import com.attendance.shift.model.ShiftTemplate;
import org.springframework.stereotype.Component;

import java.time.*;

@Component
public class ShiftWindowFactory {
    private static final int MAX_SHIFT_MINUTES = 18 * 60;

    public ShiftDefinition validateDefinition(
            String startTimeValue,
            String endTimeValue,
            String zoneIdValue
    ){
        LocalTime startTime = parseTime(startTimeValue, "start time");
        LocalTime endTime = parseTime(endTimeValue, "end time");

        validateZone(zoneIdValue);

        if (startTime.equals(endTime)){
            throw new InvalidShiftException(
                    "Shift start time and end time cannot be equal"
            );
        }

        int startMinutes= startTime.getHour()*60 + startTime.getMinute();
        int endMinutes= endTime.getHour()*60 + endTime.getMinute();

        int durationMinutes = endMinutes - startMinutes;

        if (durationMinutes<=0){
            durationMinutes += 24 * 60;
        }

        if (durationMinutes > MAX_SHIFT_MINUTES){
            throw new InvalidShiftException(
                    "Shift duration cannot exceed 18 hours"
            );
        }

        return new ShiftDefinition(endTime.isBefore(startTime), durationMinutes);
    }

    public ShiftWindow create(LocalDate shiftDate, ShiftTemplate shift){

        ShiftDefinition definition = validateDefinition(shift.getStartTime(),shift.getEndTime(),shift.getZoneId());

        LocalTime startTime = LocalTime.parse(shift.getStartTime());
        LocalTime endTime = LocalTime.parse(shift.getEndTime());
        ZoneId zoneId = ZoneId.of(shift.getZoneId());

        LocalDate scheduledEndDate = definition.overnight() ? shiftDate.plusDays(1) : shiftDate;

        ZonedDateTime scheduledStart = shiftDate.atTime(startTime).atZone(zoneId);
        ZonedDateTime scheduledEnd = shiftDate.atTime(endTime).atZone(zoneId);
        ZonedDateTime earliestPunchIn = scheduledStart.minusMinutes(shift.getEarlyPunchInMinutes());
        ZonedDateTime lateAfter = scheduledEnd.plusMinutes(shift.getLateGraceMinutes());

        ZonedDateTime punchOutDeadline = scheduledEnd.plusMinutes(shift.getMaxPunchOutAfterMinutes());

        long scheduledDurationMinutes = Duration.between(scheduledStart, scheduledEnd).toMinutes();

        return new ShiftWindow(
                shiftDate,
                scheduledStart,
                scheduledEnd,
                earliestPunchIn,
                lateAfter,
                punchOutDeadline,
                definition.overnight(),
                scheduledDurationMinutes
        );
    }

    private LocalTime parseTime(String value, String field){
        try {
            return LocalTime.parse(value);
        }catch (DateTimeException exception){
            throw new InvalidShiftException("Invalid " + field + ": " + value);
        }
    }

    private void validateZone(String zoneId){
        try{
            ZoneId.of(zoneId);
        }catch (DateTimeException exception){
            throw new InvalidShiftException("Invalid time zone" + zoneId);
        }
    }
}
