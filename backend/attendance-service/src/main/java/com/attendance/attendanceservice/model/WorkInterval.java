package com.attendance.attendanceservice.model;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WorkInterval {

    private String id;

    private PunchSnapshot punchIn;
    private PunchSnapshot punchOut;

    private long workedMinutes;
}
