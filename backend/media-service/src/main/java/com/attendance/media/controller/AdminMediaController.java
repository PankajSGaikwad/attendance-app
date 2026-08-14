package com.attendance.media.controller;

import com.attendance.media.dto.response.MediaMetadataResponse;
import com.attendance.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('ADMIN', 'SUPERVISOR')"
)
public class AdminMediaController {

    private final MediaService mediaService;

    @GetMapping("/{mediaId}")
    public MediaMetadataResponse metadata(
            @PathVariable String mediaId
    ) {

        return mediaService
                .getAdminMetadata(mediaId);
    }

    @GetMapping("/{mediaId}/content")
    public ResponseEntity<byte[]> content(
            @PathVariable String mediaId
    ) {

        var media =
                mediaService
                        .getAdminContent(
                                mediaId
                        );

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                media.contentType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\""
                                + media.filename()
                                + "\""
                )
                .cacheControl(
                        CacheControl.noStore()
                )
                .body(
                        media.bytes()
                );
    }
}