package com.attendance.media.controller;

import com.attendance.media.dto.response.MediaMetadataResponse;
import com.attendance.media.dto.response.MediaUploadResponse;
import com.attendance.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media/employee")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYEE')")
public class EmployeeMediaController {

    private final MediaService mediaService;

    @PostMapping("/attendance-photo")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaUploadResponse upload(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String attemptId,
            @RequestParam String completionToken,
            @RequestPart("photo")
            MultipartFile photo
    ) {

        return mediaService
                .uploadAuthenticatedAttendancePhoto(
                        jwt.getSubject(),
                        attemptId,
                        completionToken,
                        photo
                );
    }

    @GetMapping("/{mediaId}")
    public MediaMetadataResponse metadata(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String mediaId
    ) {

        return mediaService
                .getEmployeeMetadata(
                        jwt.getSubject(),
                        mediaId
                );
    }

    @GetMapping("/{mediaId}/content")
    public ResponseEntity<byte[]> content(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String mediaId
    ) {

        var media =
                mediaService
                        .getEmployeeContent(
                                jwt.getSubject(),
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