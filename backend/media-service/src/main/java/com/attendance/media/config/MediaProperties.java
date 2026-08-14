package com.attendance.media.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.media")
public class MediaProperties {

    private DataSize maxPhotoSize =
            DataSize.ofMegabytes(8);
}