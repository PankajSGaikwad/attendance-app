package com.attendance.shift.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;


@Getter
@Setter
@NoArgsConstructor
@Document(collection = "shift_templates")
public class ShiftTemplate {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private String name;

    private String startTime;
    private String endTime;

    private String zoneId;

    private int earlyPunchInMinutes;
    private int lateGraceMinutes;

    private int maxPunchOutAfterMinutes;

    //shift ust be active
    private boolean active= true;

    private String createdBy;
    private String updatedBy;

    private Instant createdAt;
    private Instant updatedAt;

}
