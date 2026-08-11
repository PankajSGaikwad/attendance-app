package com.attendance.shift.client.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.http.HttpHeaders;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration //Shift Service forwards the current user or kiosk bearer token to Employee Service.
public class FeignAuthorizationConfig {

    @Bean
    public RequestInterceptor bearerTokenRequestInterceptor(){

        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null){
                return;
            }

            HttpServletRequest request = attributes.getRequest();

            String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

            if (StringUtils.hasText(authorization)){
                requestTemplate.header(HttpHeaders.AUTHORIZATION, authorization);
            }
        };
    }
}
