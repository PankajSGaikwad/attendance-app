package com.attendance.attendanceservice.mapper;

import com.attendance.attendanceservice.dto.response.AttendanceResponse;
import com.attendance.attendanceservice.dto.response.PunchResponse;
import com.attendance.attendanceservice.dto.response.WorkIntervalResponse;
import com.attendance.attendanceservice.model.AttendanceRecord;
import com.attendance.attendanceservice.model.PunchSnapshot;
import org.springframework.stereotype.Component;

@Component
public class AttendanceMapper {

    public AttendanceResponse toResponse(
            AttendanceRecord attendance
    ) {
        return new AttendanceResponse(
                attendance.getId(),

                attendance.getEmployeeId(),
                attendance.getEmployeeCode(),
                attendance.getEmployeeName(),

                attendance.getDepartmentId(),
                attendance.getDesignationId(),

                attendance.getAttendanceDate(),

                attendance.getShift().getShiftId(),
                attendance.getShift().getShiftCode(),
                attendance.getShift().getShiftName(),

                attendance.getShift().getZoneId(),

                attendance.getShift().getStartTime(),
                attendance.getShift().getEndTime(),

                attendance
                        .getShift()
                        .getScheduledStartAt(),

                attendance
                        .getShift()
                        .getScheduledEndAt(),

                attendance
                        .getShift()
                        .isOvernight(),

                attendance.isLate(),

                attendance.getStatus(),

                attendance.getWorkedMinutes(),
                attendance.getBreakMinutes(),

                attendance
                        .getIntervals()
                        .stream()
                        .map(interval ->
                                new WorkIntervalResponse(
                                        interval.getId(),
                                        toPunchResponse(
                                                interval.getPunchIn()
                                        ),
                                        toPunchResponse(
                                                interval.getPunchOut()
                                        ),
                                        interval.getWorkedMinutes()
                                )
                        )
                        .toList(),

                attendance.getCreatedAt(),
                attendance.getUpdatedAt(),
                attendance.getFinalizedAt()
        );
    }

    private PunchResponse toPunchResponse(
            PunchSnapshot punch
    ) {
        if (punch == null) {
            return null;
        }

        return new PunchResponse(
                punch.getRecordedAt(),
                punch.getPhotoId(),

                punch.getLocation().getLatitude(),
                punch.getLocation().getLongitude(),
                punch.getLocation().getAccuracyMeters(),

                punch.getSource()
        );
    }
}