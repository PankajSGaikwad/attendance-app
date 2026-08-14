package com.attendance.media.repository;

import com.attendance.media.model.MediaAsset;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MediaAssetRepository
        extends MongoRepository<MediaAsset, String> {

    Optional<MediaAsset> findByAttemptId(
            String attemptId
    );
}