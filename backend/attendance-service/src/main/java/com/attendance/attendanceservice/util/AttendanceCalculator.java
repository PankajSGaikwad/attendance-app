package com.attendance.attendanceservice.util;

import com.attendance.attendanceservice.model.AttendanceRecord;
import com.attendance.attendanceservice.model.WorkInterval;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
public class AttendanceCalculator {

    public void recalculate(
            AttendanceRecord attendance
    ) {
        List<WorkInterval> intervals =
                attendance.getIntervals();

        long workedMinutes = 0;
        long breakMinutes = 0;

        Instant previousPunchOut = null;

        for (WorkInterval interval : intervals) {

            if (previousPunchOut != null
                    && interval.getPunchIn() != null) {

                Instant nextPunchIn =
                        interval
                                .getPunchIn()
                                .getRecordedAt();

                if (nextPunchIn.isAfter(
                        previousPunchOut
                )) {
                    breakMinutes += Duration
                            .between(
                                    previousPunchOut,
                                    nextPunchIn
                            )
                            .toMinutes();
                }
            }

            if (interval.getPunchIn() != null
                    && interval.getPunchOut() != null) {

                long intervalMinutes = Duration
                        .between(
                                interval
                                        .getPunchIn()
                                        .getRecordedAt(),
                                interval
                                        .getPunchOut()
                                        .getRecordedAt()
                        )
                        .toMinutes();

                interval.setWorkedMinutes(
                        Math.max(0, intervalMinutes)
                );

                workedMinutes +=
                        interval.getWorkedMinutes();

                previousPunchOut =
                        interval
                                .getPunchOut()
                                .getRecordedAt();
            }
        }

        attendance.setWorkedMinutes(
                workedMinutes
        );

        attendance.setBreakMinutes(
                breakMinutes
        );
    }
}