package com.attendance.media.controller;

import com.attendance.media.dto.response.MediaContextResponse;
import com.attendance.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/media")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INTERNAL_SERVICE')")
public class InternalMediaController {

    private final MediaService mediaService;

    @GetMapping("/{mediaId}")
    public MediaContextResponse getContext(
            @PathVariable String mediaId
    ) {

        return mediaService
                .getInternalContext(
                        mediaId
                );
    }
}