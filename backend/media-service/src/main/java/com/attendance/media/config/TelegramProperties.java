package com.attendance.media.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.telegram")
public class TelegramProperties {

    private String botToken;

    private String chatId;
}