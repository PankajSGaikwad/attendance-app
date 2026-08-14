package com.attendance.media.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TelegramMessage(

        @JsonProperty("message_id")
        Long messageId,

        List<TelegramPhotoSize> photo

) {
}