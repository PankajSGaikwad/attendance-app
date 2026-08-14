package com.attendance.media.controller;

import com.attendance.media.dto.response.MediaUploadResponse;
import com.attendance.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media/public")
@RequiredArgsConstructor
public class PublicMediaController {

    private final MediaService mediaService;

    @PostMapping("/attendance-photo")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaUploadResponse upload(
            @RequestParam String attemptId,
            @RequestParam String completionToken,
            @RequestPart("photo")
            MultipartFile photo
    ) {

        return mediaService
                .uploadPublicAttendancePhoto(
                        attemptId,
                        completionToken,
                        photo
                );
    }
}