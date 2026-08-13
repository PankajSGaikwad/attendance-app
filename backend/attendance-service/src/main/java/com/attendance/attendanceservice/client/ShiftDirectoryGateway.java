package com.attendance.attendanceservice.client;

import com.attendance.attendanceservice.dto.response.EffectiveShiftResponse;
import com.attendance.attendanceservice.exception.DownstreamServiceException;
import com.attendance.attendanceservice.exception.InvalidAttendanceStateException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ShiftDirectoryGateway {

    private final ShiftClient shiftClient;

    public EffectiveShiftResponse resolve(
            String employeeId,
            Instant at
    ) {
        try {
            return shiftClient
                    .resolveEffectiveShift(
                            employeeId,
                            at.toString()
                    );

        } catch (FeignException exception) {

            if (exception.status() == 422
                    || exception.status() == 404) {

                throw new InvalidAttendanceStateException(
                        "No applicable shift is available for this employee"
                );
            }

            throw new DownstreamServiceException(
                    "Shift Service could not resolve employee shift",
                    exception
            );
        }
    }
}