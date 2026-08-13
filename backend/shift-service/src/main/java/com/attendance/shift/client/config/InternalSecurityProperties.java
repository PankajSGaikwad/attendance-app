package com.attendance.shift.client.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.internal")
public class InternalSecurityProperties {
    private String apiKey;
}