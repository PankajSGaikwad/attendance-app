package com.attendance.attendanceservice.client;

import com.attendance.attendanceservice.client.config.InternalFeignConfig;
import com.attendance.attendanceservice.dto.response.MediaContextResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "media-service",
        configuration = InternalFeignConfig.class
)
public interface MediaClient {

    @GetMapping("/internal/media/{mediaId}")
    MediaContextResponse getMedia(
            @PathVariable String mediaId
    );
}