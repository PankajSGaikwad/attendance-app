package com.attendance.media.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TelegramResponse<T>(

        boolean ok,

        T result,

        @JsonProperty("error_code")
        Integer errorCode,

        String description

) {
}