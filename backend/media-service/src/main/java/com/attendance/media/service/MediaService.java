package com.attendance.media.service;

import com.attendance.media.dto.response.MediaContextResponse;
import com.attendance.media.dto.response.MediaMetadataResponse;
import com.attendance.media.dto.response.MediaUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MediaService {

    MediaUploadResponse uploadPublicAttendancePhoto(
            String attemptId,
            String completionToken,
            MultipartFile photo
    );

    MediaUploadResponse uploadAuthenticatedAttendancePhoto(
            String authenticatedUserId,
            String attemptId,
            String completionToken,
            MultipartFile photo
    );

    MediaMetadataResponse getEmployeeMetadata(
            String userId,
            String mediaId
    );

    MediaDownload getEmployeeContent(
            String userId,
            String mediaId
    );

    MediaMetadataResponse getAdminMetadata(
            String mediaId
    );

    MediaDownload getAdminContent(
            String mediaId
    );

    MediaContextResponse getInternalContext(
            String mediaId
    );

    record MediaDownload(
            String filename,
            String contentType,
            byte[] bytes
    ) {
    }
}