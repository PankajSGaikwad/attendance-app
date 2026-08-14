package com.attendance.media.util;

public record ValidatedImage(

        byte[] bytes,

        String filename,

        String contentType,

        long size,

        int width,

        int height,

        String sha256

) {
}