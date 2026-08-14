package com.attendance.media.dto.response;

import com.attendance.media.model.*;

import java.time.Instant;

public record MediaMetadataResponse(

        String id,

        String attemptId,

        String employeeId,

        MediaType type,

        MediaStatus status,

        MediaSource source,

        String contentType,

        long sizeBytes,

        int width,

        int height,

        Instant uploadedAt

) {
}