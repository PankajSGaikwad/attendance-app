package com.attendance.attendanceservice.model;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LocationSnapshot {

    private double latitude;
    private double longitude;
    private double accuracyMeters;
    private boolean lowAccuracy;
}
