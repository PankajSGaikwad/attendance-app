package com.attendance.media.client;

import com.attendance.media.dto.response.*;
import com.attendance.media.config.TelegramProperties;
import com.attendance.media.exception.TelegramStorageException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Comparator;

@Component
public class TelegramClient {

    private final TelegramProperties properties;

    private final RestClient telegramApi;

    private final RestClient telegramFileApi;

    public TelegramClient(
            TelegramProperties properties
    ) {

        this.properties = properties;

        this.telegramApi =
                RestClient.builder()
                        .baseUrl(
                                "https://api.telegram.org/bot"
                                        + properties.getBotToken()
                        )
                        .build();

        this.telegramFileApi =
                RestClient.builder()
                        .baseUrl(
                                "https://api.telegram.org/file/bot"
                                        + properties.getBotToken()
                        )
                        .build();
    }

    public StoredTelegramPhoto uploadPhoto(
            byte[] bytes,
            String filename,
            String contentType,
            String caption
    ) {

        try {

            ByteArrayResource resource =
                    new ByteArrayResource(bytes) {

                        @Override
                        public String getFilename() {
                            return filename;
                        }
                    };

            HttpHeaders imageHeaders =
                    new HttpHeaders();

            imageHeaders.setContentType(
                    MediaType.parseMediaType(
                            contentType
                    )
            );

            HttpEntity<ByteArrayResource>
                    imagePart =
                    new HttpEntity<>(
                            resource,
                            imageHeaders
                    );

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            body.add(
                    "chat_id",
                    properties.getChatId()
            );

            body.add(
                    "photo",
                    imagePart
            );

            body.add(
                    "caption",
                    caption
            );

            body.add(
                    "protect_content",
                    "true"
            );

            body.add(
                    "disable_notification",
                    "true"
            );

            TelegramResponse<TelegramMessage>
                    response =
                    telegramApi
                            .post()
                            .uri("/sendPhoto")
                            .contentType(
                                    MediaType.MULTIPART_FORM_DATA
                            )
                            .body(body)
                            .retrieve()
                            .body(
                                    new ParameterizedTypeReference<>() {
                                    }
                            );

            if (response == null
                    || !response.ok()
                    || response.result() == null) {

                throw new TelegramStorageException(
                        response != null
                                ? response.description()
                                : "Telegram returned no response"
                );
            }

            TelegramMessage message =
                    response.result();

            if (message.photo() == null
                    || message.photo().isEmpty()) {

                throw new TelegramStorageException(
                        "Telegram did not return photo metadata"
                );
            }

            TelegramPhotoSize largest =
                    message.photo()
                            .stream()
                            .max(
                                    Comparator.comparingLong(
                                            photo ->
                                                    photo.fileSize() != null
                                                            ? photo.fileSize()
                                                            : (long)
                                                            photo.width()
                                                            * photo.height()
                                    )
                            )
                            .orElseThrow();

            return new StoredTelegramPhoto(
                    message.messageId(),
                    largest.fileId(),
                    largest.fileUniqueId(),
                    largest.width(),
                    largest.height()
            );

        } catch (RestClientException exception) {

            throw new TelegramStorageException(
                    "Could not upload image to Telegram",
                    exception
            );
        }
    }

    public byte[] downloadPhoto(
            String telegramFileId
    ) {

        try {

            TelegramResponse<TelegramFile>
                    response =
                    telegramApi
                            .get()
                            .uri(builder ->
                                    builder
                                            .path("/getFile")
                                            .queryParam(
                                                    "file_id",
                                                    telegramFileId
                                            )
                                            .build()
                            )
                            .retrieve()
                            .body(
                                    new ParameterizedTypeReference<>() {
                                    }
                            );

            if (response == null
                    || !response.ok()
                    || response.result() == null
                    || response.result().filePath() == null) {

                throw new TelegramStorageException(
                        "Telegram could not resolve file"
                );
            }

            byte[] bytes =
                    telegramFileApi
                            .get()
                            .uri(
                                    "/"
                                            + response
                                            .result()
                                            .filePath()
                            )
                            .retrieve()
                            .body(byte[].class);

            if (bytes == null) {

                throw new TelegramStorageException(
                        "Telegram returned empty file"
                );
            }

            return bytes;

        } catch (RestClientException exception) {

            throw new TelegramStorageException(
                    "Could not download image from Telegram",
                    exception
            );
        }
    }

    public record StoredTelegramPhoto(

            Long messageId,

            String fileId,

            String fileUniqueId,

            int width,

            int height

    ) {
    }
}