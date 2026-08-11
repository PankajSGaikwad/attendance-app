package com.attendance.shift.repository;

import com.attendance.shift.model.ShiftTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ShiftTemplateRepository extends MongoRepository<ShiftTemplate, String> {

    boolean existsByCode(String code);

    Optional<ShiftTemplate> findByIdAndActiveTrue(String id);

    List<ShiftTemplate> findAllByOrderByNameAsc();

    List<ShiftTemplate> findByActiveTrueOrderByNameAsc();
}
