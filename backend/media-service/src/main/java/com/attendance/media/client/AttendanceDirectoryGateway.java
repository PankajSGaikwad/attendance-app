package com.attendance.media.client;

import com.attendance.media.dto.request.AttendanceMediaValidationRequest;
import com.attendance.media.dto.response.AttendanceMediaValidationResponse;
import com.attendance.media.exception.DownstreamServiceException;
import com.attendance.media.exception.InvalidAttendanceAttemptException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AttendanceDirectoryGateway {

    private final AttendanceClient attendanceClient;

    public AttendanceMediaValidationResponse validate(
            String attemptId,
            String completionToken
    ) {

        try {

            return attendanceClient
                    .validateMediaUpload(
                            new AttendanceMediaValidationRequest(
                                    attemptId,
                                    completionToken
                            )
                    );

        } catch (FeignException exception) {

            if (exception.status() == 400
                    || exception.status() == 404
                    || exception.status() == 409
                    || exception.status() == 410) {

                throw new InvalidAttendanceAttemptException(
                        "Attendance attempt is invalid or expired"
                );
            }

            throw new DownstreamServiceException(
                    "Attendance Service is unavailable",
                    exception
            );
        }
    }
}