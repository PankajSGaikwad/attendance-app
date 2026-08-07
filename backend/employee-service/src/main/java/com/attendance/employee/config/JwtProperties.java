package com.attendance.employee.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;


@Getter
@Setter
@ConfigurationProperties(prefix = "app.security.jwt")
public class JwtProperties {

    private String secretBase64;

    private String issuer = "attendance-auth-service";

    private String audience = "attendance-api";
}
