package com.attendance.media.dto.response;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TelegramPhotoSize(

        @JsonProperty("file_id")
        String fileId,

        @JsonProperty("file_unique_id")
        String fileUniqueId,

        Integer width,

        Integer height,

        @JsonProperty("file_size")
        Long fileSize

) {
}