package com.attendance.attendanceservice.client.config;

import com.attendance.attendanceservice.config.InternalSecurityProperties;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;

public class InternalFeignConfig {
    @Bean
    public RequestInterceptor internalApiKeyInterceptor(
            InternalSecurityProperties properties
    ) {
        return requestTemplate ->
                requestTemplate.header(
                        "X-Internal-Api-Key",
                        properties.getApiKey()
                );
    }
}
