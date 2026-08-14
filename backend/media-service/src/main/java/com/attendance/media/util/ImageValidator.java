package com.attendance.media.util;

import com.attendance.media.config.MediaProperties;
import com.attendance.media.exception.InvalidMediaException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ImageValidator {

    private static final Set<String>
            ALLOWED_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png"
            );

    private final MediaProperties properties;

    private final FileHashUtil fileHashUtil;

    public ValidatedImage validate(
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            throw new InvalidMediaException(
                    "Attendance photo is required"
            );
        }

        if (file.getSize()
                > properties
                .getMaxPhotoSize()
                .toBytes()) {

            throw new InvalidMediaException(
                    "Attendance photo exceeds maximum size"
            );
        }

        String contentType =
                file.getContentType();

        if (!StringUtils.hasText(contentType)
                || !ALLOWED_TYPES.contains(
                contentType.toLowerCase()
        )) {

            throw new InvalidMediaException(
                    "Only JPEG and PNG images are allowed"
            );
        }

        byte[] bytes;

        try {

            bytes = file.getBytes();

        } catch (IOException exception) {

            throw new InvalidMediaException(
                    "Could not read uploaded image"
            );
        }

        BufferedImage image;

        try {

            image =
                    ImageIO.read(
                            new ByteArrayInputStream(
                                    bytes
                            )
                    );

        } catch (IOException exception) {

            throw new InvalidMediaException(
                    "Invalid image"
            );
        }

        if (image == null) {

            throw new InvalidMediaException(
                    "Uploaded file is not a valid image"
            );
        }

        int width =
                image.getWidth();

        int height =
                image.getHeight();

        if (width <= 0 || height <= 0) {

            throw new InvalidMediaException(
                    "Invalid image dimensions"
            );
        }

        /*
         * Telegram sendPhoto limits.
         */
        if ((long) width + height > 10_000) {

            throw new InvalidMediaException(
                    "Image dimensions are too large"
            );
        }

        double ratio =
                Math.max(width, height)
                        / (double)
                        Math.min(width, height);

        if (ratio > 20.0) {

            throw new InvalidMediaException(
                    "Image aspect ratio is too extreme"
            );
        }

        String filename =
                StringUtils.hasText(
                        file.getOriginalFilename()
                )
                        ? file.getOriginalFilename()
                        : "attendance-photo.jpg";

        return new ValidatedImage(
                bytes,
                filename,
                contentType,
                bytes.length,
                width,
                height,
                fileHashUtil.sha256(bytes)
        );
    }
}