package com.attendance.attendanceservice.scheduler;

import com.attendance.attendanceservice.model.AttendanceRecordStatus;
import com.attendance.attendanceservice.repository.AttendanceRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceFinalizer {

    private final AttendanceRecordRepository
            attendanceRecordRepository;

    @Scheduled(
            fixedDelayString =
                    "${app.attendance.finalizer-delay:60s}"
    )
    public void finalizeExpiredAttendance() {
        Instant now = Instant.now();

        attendanceRecordRepository
                .findPastDeadline(
                        AttendanceRecordStatus.ACTIVE,
                        now
                )
                .forEach(attendance -> {

                    boolean hasOpenInterval =
                            attendance
                                    .getIntervals()
                                    .stream()
                                    .anyMatch(interval ->
                                            interval
                                                    .getPunchIn()
                                                    != null
                                                    &&
                                                    interval
                                                            .getPunchOut()
                                                            == null
                                    );

                    if (hasOpenInterval) {
                        attendance.setStatus(
                                AttendanceRecordStatus
                                        .MISSED_PUNCH_OUT
                        );
                    } else {
                        attendance.setStatus(
                                AttendanceRecordStatus
                                        .FINALIZED
                        );

                        attendance.setFinalizedAt(
                                now
                        );
                    }

                    attendance.setUpdatedAt(now);

                    attendanceRecordRepository.save(
                            attendance
                    );
                });
    }
}