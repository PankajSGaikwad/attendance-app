package com.attendance.attendanceservice.model;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class PunchSnapshot {

    private Instant recordedAt;

    private String photoId;

    private LocationSnapshot location;

    private AttendanceSource source;

    private String attemptId;

    //null if scan from public
    private String authenticatedUserId;
}
