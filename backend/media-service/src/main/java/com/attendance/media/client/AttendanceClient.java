package com.attendance.media.client;
import com.attendance.media.client.config.InternalFeignConfig;
import com.attendance.media.dto.request.AttendanceMediaValidationRequest;
import com.attendance.media.dto.response.AttendanceMediaValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "attendance-service",
        configuration = InternalFeignConfig.class
)
public interface AttendanceClient {

    @PostMapping(
            "/internal/attendance/attempts/media-validation"
    )
    AttendanceMediaValidationResponse validateMediaUpload(
            @RequestBody
            AttendanceMediaValidationRequest request
    );
}