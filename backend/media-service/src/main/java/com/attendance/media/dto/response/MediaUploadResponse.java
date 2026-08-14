package com.attendance.media.dto.response;

import com.attendance.media.model.MediaSource;

import java.time.Instant;

public record MediaUploadResponse(

        String mediaId,

        String attemptId,

        String employeeId,

        MediaSource source,

        String contentType,

        long sizeBytes,

        String sha256,

        Instant uploadedAt

) {
}