package com.attendance.attendanceservice.client.config;

import com.attendance.attendanceservice.client.MediaClient;
import com.attendance.attendanceservice.dto.response.MediaContextResponse;
import com.attendance.attendanceservice.exception.DownstreamServiceException;
import com.attendance.attendanceservice.exception.InvalidAttendanceStateException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MediaDirectoryGateway {

    private final MediaClient mediaClient;

    public MediaContextResponse requireAttendancePhoto(
            String mediaId,
            String attemptId,
            String employeeId,
            String expectedSource
    ) {

        try {

            MediaContextResponse media =
                    mediaClient.getMedia(
                            mediaId
                    );

            if (!attemptId.equals(
                    media.attemptId()
            )) {

                throw new InvalidAttendanceStateException(
                        "Photo does not belong to this attendance attempt"
                );
            }

            if (!employeeId.equals(
                    media.employeeId()
            )) {

                throw new InvalidAttendanceStateException(
                        "Photo does not belong to this employee"
                );
            }

            if (!"ATTENDANCE_PHOTO".equals(
                    media.type()
            )) {

                throw new InvalidAttendanceStateException(
                        "Media is not an attendance photo"
                );
            }

            if (!"STORED".equals(
                    media.status()
            )) {

                throw new InvalidAttendanceStateException(
                        "Attendance photo is unavailable"
                );
            }

            if (!expectedSource.equals(
                    media.source()
            )) {

                throw new InvalidAttendanceStateException(
                        "Photo source does not match attendance source"
                );
            }

            return media;

        } catch (InvalidAttendanceStateException exception) {

            throw exception;

        } catch (FeignException.NotFound exception) {

            throw new InvalidAttendanceStateException(
                    "Attendance photo does not exist"
            );

        } catch (FeignException exception) {

            throw new DownstreamServiceException(
                    "Media Service is unavailable",
                    exception
            );
        }
    }
}