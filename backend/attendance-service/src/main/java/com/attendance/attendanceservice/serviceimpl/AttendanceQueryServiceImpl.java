package com.attendance.attendanceservice.serviceimpl;

import com.attendance.attendanceservice.dto.response.AttendanceResponse;
import com.attendance.attendanceservice.exception.ResourceNotFoundException;
import com.attendance.attendanceservice.mapper.AttendanceMapper;
import com.attendance.attendanceservice.repository.AttendanceRecordRepository;
import com.attendance.attendanceservice.service.AttendanceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceQueryServiceImpl
        implements AttendanceQueryService {

    private final AttendanceRecordRepository
            attendanceRecordRepository;

    private final AttendanceMapper attendanceMapper;

    @Override
    public List<AttendanceResponse> getMyHistory(
            String userId
    ) {
        return attendanceRecordRepository
                .findByUserIdOrderByAttendanceDateDesc(
                        userId
                )
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    @Override
    public AttendanceResponse getById(
            String attendanceId
    ) {
        return attendanceMapper.toResponse(
                attendanceRecordRepository
                        .findById(attendanceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Attendance record not found"
                                )
                        )
        );
    }

    @Override
    public List<AttendanceResponse> getEmployeeHistory(
            String employeeId
    ) {
        return attendanceRecordRepository
                .findByEmployeeIdOrderByAttendanceDateDesc(
                        employeeId
                )
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }
}