package com.attendance.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    private Jwt jwt = new Jwt();
    private Refresh refresh = new Refresh();
    private BootstrapAdmin bootstrapAdmin = new BootstrapAdmin();

    @Getter
    @Setter
    public static class Jwt{
        private String secretBase64;
        private String issuer="attendance-auth-service";
        private String audience="attendance-api";
        private Duration accessTokenTtl= Duration.ofMinutes(15);
    }

    @Getter
    @Setter
    public static class Refresh{
        private Duration tokenTtl= Duration.ofDays(7);
    }

    @Getter
    @Setter
    public static class BootstrapAdmin{
        private String email;
        private String password;
    }
}
