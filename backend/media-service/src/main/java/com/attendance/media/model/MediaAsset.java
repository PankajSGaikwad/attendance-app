package com.attendance.media.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "media_assets")
public class MediaAsset {

    @Id
    private String id;

    @Indexed(unique = true)
    private String attemptId;

    @Indexed
    private String employeeId;

    @Indexed
    private String userId;

    private MediaType type;

    private MediaStatus status;

    private MediaSource source;

    private String attendanceAction;

    private String originalFilename;

    private String contentType;

    private long sizeBytes;

    private String sha256;

    private int width;

    private int height;

    //Telegram storage metadata.

    private String telegramChatId;

    private Long telegramMessageId;

    private String telegramFileId;

    private String telegramFileUniqueId;

    //Null for public scan.

    private String uploadedByUserId;

    private Instant uploadedAt;

    @Version
    private Long version;
}