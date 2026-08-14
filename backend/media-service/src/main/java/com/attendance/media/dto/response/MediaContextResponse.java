package com.attendance.media.dto.response;

import com.attendance.media.model.*;

import java.time.Instant;

public record MediaContextResponse(

        String mediaId,

        String attemptId,

        String employeeId,

        String userId,

        MediaType type,

        MediaStatus status,

        MediaSource source,

        Instant uploadedAt

) {
}