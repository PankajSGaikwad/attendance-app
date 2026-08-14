package com.attendance.media.serviceimpl;

import com.attendance.media.client.AttendanceDirectoryGateway;
import com.attendance.media.client.TelegramClient;
import com.attendance.media.dto.response.AttendanceMediaValidationResponse;
import com.attendance.media.dto.response.MediaContextResponse;
import com.attendance.media.dto.response.MediaMetadataResponse;
import com.attendance.media.dto.response.MediaUploadResponse;
import com.attendance.media.exception.ForbiddenMediaException;
import com.attendance.media.exception.InvalidAttendanceAttemptException;
import com.attendance.media.exception.MediaAlreadyExistsException;
import com.attendance.media.exception.MediaNotFoundException;
import com.attendance.media.model.MediaAsset;
import com.attendance.media.model.MediaSource;
import com.attendance.media.model.MediaStatus;
import com.attendance.media.model.MediaType;
import com.attendance.media.repository.MediaAssetRepository;
import com.attendance.media.service.MediaService;
import com.attendance.media.util.ImageValidator;
import com.attendance.media.util.ValidatedImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final MediaAssetRepository repository;

    private final AttendanceDirectoryGateway attendanceGateway;

    private final TelegramClient telegramClient;

    private final ImageValidator imageValidator;

//PUBLIC ATTENDANCE PHOTO UPLOAD
    @Override
    public MediaUploadResponse uploadPublicAttendancePhoto(
            String attemptId,
            String completionToken,
            MultipartFile photo
    ) {

        return upload(
                attemptId,
                completionToken,
                photo,
                MediaSource.PUBLIC_SCAN,
                null
        );
    }

//AUTHENTICATED EMPLOYEE ATTENDANCE PHOTO UPLOAD
    @Override
    public MediaUploadResponse uploadAuthenticatedAttendancePhoto(
            String authenticatedUserId,
            String attemptId,
            String completionToken,
            MultipartFile photo
    ) {

        return upload(
                attemptId,
                completionToken,
                photo,
                MediaSource.AUTHENTICATED_SCAN,
                authenticatedUserId
        );
    }

//COMMON UPLOAD LOGIC
    private MediaUploadResponse upload(
            String attemptId,
            String completionToken,
            MultipartFile photo,
            MediaSource expectedSource,
            String authenticatedUserId
    ) {


        if (!StringUtils.hasText(attemptId)
                || !StringUtils.hasText(completionToken)) {

            throw new InvalidAttendanceAttemptException(
                    "Attendance attempt credentials are required"
            );
        }

        AttendanceMediaValidationResponse attempt =
                attendanceGateway.validate(
                        attemptId,
                        completionToken
                );

        MediaSource actualSource;

        try {

            actualSource = MediaSource.valueOf(
                    attempt.source()
            );

        } catch (IllegalArgumentException | NullPointerException exception) {

            throw new InvalidAttendanceAttemptException(
                    "Attendance attempt source is invalid"
            );
        }


        if (actualSource != expectedSource) {

            throw new InvalidAttendanceAttemptException(
                    "Attendance attempt does not belong to this scan flow"
            );
        }

        if (expectedSource == MediaSource.AUTHENTICATED_SCAN) {

            if (!StringUtils.hasText(authenticatedUserId)) {

                throw new ForbiddenMediaException(
                        "Authenticated employee is required"
                );
            }

            if (!authenticatedUserId.equals(
                    attempt.authenticatedUserId()
            )) {

                throw new ForbiddenMediaException(
                        "Attendance attempt belongs to another employee"
                );
            }
        }

        ValidatedImage validated =
                imageValidator.validate(photo);


        var existing =
                repository.findByAttemptId(attemptId);

        if (existing.isPresent()) {

            MediaAsset existingAsset =
                    existing.get();

            if (existingAsset.getStatus() == MediaStatus.STORED
                    && existingAsset.getSha256() != null
                    && existingAsset.getSha256().equals(
                    validated.sha256()
            )) {

                return toUploadResponse(
                        existingAsset
                );
            }

            throw new MediaAlreadyExistsException(
                    "A different attendance photo was already uploaded for this attempt"
            );
        }

        String caption =
                "Attendance "
                        + attempt.action()
                        + " | Employee "
                        + attempt.employeeId()
                        + " | Attempt "
                        + attempt.attemptId();


        TelegramClient.StoredTelegramPhoto telegram =
                telegramClient.uploadPhoto(
                        validated.bytes(),
                        validated.filename(),
                        validated.contentType(),
                        caption
                );

        MediaAsset asset =
                new MediaAsset();

        asset.setAttemptId(
                attempt.attemptId()
        );

        asset.setEmployeeId(
                attempt.employeeId()
        );

        asset.setUserId(
                attempt.userId()
        );

        asset.setType(
                MediaType.ATTENDANCE_PHOTO
        );

        asset.setStatus(
                MediaStatus.STORED
        );

        asset.setSource(
                actualSource
        );

        asset.setAttendanceAction(
                attempt.action()
        );

        asset.setOriginalFilename(
                validated.filename()
        );

        asset.setContentType(
                validated.contentType()
        );

        asset.setSizeBytes(
                validated.size()
        );

        asset.setSha256(
                validated.sha256()
        );


        // Use the dimensions returned by Telegram.
        asset.setWidth(
                telegram.width()
        );

        asset.setHeight(
                telegram.height()
        );

        asset.setTelegramChatId(null);


        asset.setTelegramMessageId(
                telegram.messageId()
        );

        asset.setTelegramFileId(
                telegram.fileId()
        );

        asset.setTelegramFileUniqueId(
                telegram.fileUniqueId()
        );

        asset.setUploadedByUserId(
                authenticatedUserId
        );

        asset.setUploadedAt(
                Instant.now()
        );



        MediaAsset saved =
                repository.save(asset);



        return toUploadResponse(saved);
    }


    @Override
    public MediaMetadataResponse getEmployeeMetadata(
            String userId,
            String mediaId
    ) {

        MediaAsset asset =
                getStored(mediaId);

        requireOwner(
                asset,
                userId
        );

        return toMetadata(asset);
    }

//EMPLOYEE - GET PHOTO CONTENT
    @Override
    public MediaDownload getEmployeeContent(
            String userId,
            String mediaId
    ) {

        MediaAsset asset =
                getStored(mediaId);

        requireOwner(
                asset,
                userId
        );

        return download(asset);
    }

//ADMIN / SUPERVISOR - GET METADATA
    @Override
    public MediaMetadataResponse getAdminMetadata(
            String mediaId
    ) {

        MediaAsset asset =
                getStored(mediaId);

        return toMetadata(asset);
    }

//ADMIN / SUPERVISOR - GET PHOTO CONTENT
    @Override
    public MediaDownload getAdminContent(
            String mediaId
    ) {

        MediaAsset asset =
                getStored(mediaId);

        return download(asset);
    }

//INTERNAL SERVICE - MEDIA VALIDATION
    @Override
    public MediaContextResponse getInternalContext(
            String mediaId
    ) {

        MediaAsset asset =
                getStored(mediaId);

        return new MediaContextResponse(
                asset.getId(),
                asset.getAttemptId(),
                asset.getEmployeeId(),
                asset.getUserId(),
                asset.getType(),
                asset.getStatus(),
                asset.getSource(),
                asset.getUploadedAt()
        );
    }

//DOWNLOAD FROM TELEGRAM
    private MediaDownload download(
            MediaAsset asset
    ) {

        byte[] bytes =
                telegramClient.downloadPhoto(
                        asset.getTelegramFileId()
                );

        return new MediaDownload(
                asset.getOriginalFilename(),

                // IMPORTANT:
                // Content type is now simply a String.
                asset.getContentType(),

                bytes
        );
    }


    // =========================================================
    // FIND STORED MEDIA
    // =========================================================

    private MediaAsset getStored(
            String mediaId
    ) {

        if (!StringUtils.hasText(mediaId)) {

            throw new MediaNotFoundException(
                    "Media ID is required"
            );
        }

        MediaAsset asset =
                repository.findById(mediaId)
                        .orElseThrow(() ->
                                new MediaNotFoundException(
                                        "Media not found"
                                )
                        );

        if (asset.getStatus() != MediaStatus.STORED) {

            throw new MediaNotFoundException(
                    "Media is no longer available"
            );
        }

        return asset;
    }


    // =========================================================
    // EMPLOYEE OWNERSHIP CHECK
    // =========================================================

    private void requireOwner(
            MediaAsset asset,
            String userId
    ) {

        if (!StringUtils.hasText(userId)) {

            throw new ForbiddenMediaException(
                    "Authenticated employee is required"
            );
        }

        if (!userId.equals(
                asset.getUserId()
        )) {

            throw new ForbiddenMediaException(
                    "Media does not belong to logged-in employee"
            );
        }
    }


    // =========================================================
    // ENTITY -> UPLOAD RESPONSE
    // =========================================================

    private MediaUploadResponse toUploadResponse(
            MediaAsset asset
    ) {

        return new MediaUploadResponse(
                asset.getId(),
                asset.getAttemptId(),
                asset.getEmployeeId(),
                asset.getSource(),
                asset.getContentType(),
                asset.getSizeBytes(),
                asset.getSha256(),
                asset.getUploadedAt()
        );
    }


    // =========================================================
    // ENTITY -> METADATA RESPONSE
    // =========================================================

    private MediaMetadataResponse toMetadata(
            MediaAsset asset
    ) {

        return new MediaMetadataResponse(
                asset.getId(),
                asset.getAttemptId(),
                asset.getEmployeeId(),
                asset.getType(),
                asset.getStatus(),
                asset.getSource(),
                asset.getContentType(),
                asset.getSizeBytes(),
                asset.getWidth(),
                asset.getHeight(),
                asset.getUploadedAt()
        );
    }
}