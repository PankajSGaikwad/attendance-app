package com.attendance.media.client.config;

import com.attendance.media.config.InternalSecurityProperties;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;

public class InternalFeignConfig {

    @Bean
    public RequestInterceptor internalApiKeyInterceptor(
            InternalSecurityProperties properties
    ) {
        return template ->
                template.header(
                        "X-Internal-Api-Key",
                        properties.getApiKey()
                );
    }
}