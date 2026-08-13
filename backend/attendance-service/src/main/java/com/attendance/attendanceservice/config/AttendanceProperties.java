package com.attendance.attendanceservice.config;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.attendance")
public class AttendanceProperties {

    private Duration attemptTtl =
            Duration.ofSeconds(60);

    private double maximumLocationAccuracyMeters =
            500;

    private Duration finalizerDelay =
            Duration.ofSeconds(60);
}
