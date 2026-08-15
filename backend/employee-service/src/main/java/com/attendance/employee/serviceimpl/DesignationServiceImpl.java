package com.attendance.employee.serviceimpl;

import com.attendance.employee.dto.request.BulkCreateDesignationRequest;
import com.attendance.employee.dto.request.CreateDesignationRequest;
import com.attendance.employee.dto.request.UpdateDesignationRequest;
import com.attendance.employee.dto.response.DepartmentOptionResponse;
import com.attendance.employee.dto.response.DesignationOptionResponse;
import com.attendance.employee.dto.response.DesignationResponse;
import com.attendance.employee.exception.DuplicateResourceException;
import com.attendance.employee.exception.InvalidReferenceException;
import com.attendance.employee.exception.ResourceNotFoundException;
import com.attendance.employee.model.Department;
import com.attendance.employee.model.Designation;
import com.attendance.employee.repository.DepartmentRepository;
import com.attendance.employee.repository.DesignationRepository;
import com.attendance.employee.service.DesignationService;
import com.attendance.employee.util.TextNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class DesignationServiceImpl implements DesignationService {
    private final DesignationRepository designationRepository;

    private final DepartmentRepository departmentRepository;

    @Override
    public DesignationResponse create(String departmentId, CreateDesignationRequest request) {

        requireActiveDepartment(departmentId);

        String code= TextNormalizer.code(request.code());
        String name= TextNormalizer.displayName(request.name());
        String normalizedName= TextNormalizer.normalizedKey(request.name());

        validateUniqueDesignation(departmentId,code,normalizedName);

        Instant now = Instant.now();
        Designation designation = new Designation();
        designation.setDepartmentId(departmentId);
        designation.setCode(code);
        designation.setName(name);
        designation.setNormalizedName(normalizedName);
        designation.setActive(true);
        designation.setCreatedAt(now);
        designation.setUpdatedAt(now);

        return toResponse(designationRepository.save(designation));
    }

    @Override
    public List<DesignationResponse> createBulk(String departmentId, BulkCreateDesignationRequest request) {

        requireActiveDepartment(departmentId);

        Set<String> requestCodes=new HashSet<>();
        Set<String> requestNames=new HashSet<>();
        List<Designation> designations=new ArrayList<>();
        Instant now=Instant.now();

        for (CreateDesignationRequest items: request.designations()){
            String code= TextNormalizer.code(items.code());
            String name= TextNormalizer.displayName(items.name());
            String normalizedName= TextNormalizer.normalizedKey(items.name());

            if (!requestCodes.add(code)){
                throw new DuplicateResourceException("Duplicate designation code: "+code);
            }

            if (!requestNames.add(normalizedName)){
                throw new DuplicateResourceException("Duplicate designation name: "+name);
            }
            validateUniqueDesignation(departmentId,code,normalizedName);

            Designation designation=new Designation();
            designation.setDepartmentId(departmentId);
            designation.setCode(code);
            designation.setName(name);
            designation.setNormalizedName(normalizedName);
            designation.setActive(true);
            designation.setCreatedAt(now);
            designation.setUpdatedAt(now);

            designations.add(designation);
        }
        return designationRepository.saveAll(designations).stream().map(this::toResponse).toList();
    }

    @Override
    public DesignationResponse getById(String designationId) {
        return toResponse(findDesignation(designationId));
    }

    @Override
    public List<DesignationResponse> getByDepartment(String departmentId, boolean activeOnly) {
        requireDepartment(departmentId);

        List<Designation> designations = activeOnly ? designationRepository.findByDepartmentIdAndActiveTrueOrderByNameAsc(departmentId)
                : designationRepository.findByDepartmentIdOrderByNameAsc(departmentId);

        return designations.stream().map(this::toResponse).toList();
    }

    @Override
    public List<DesignationOptionResponse> getOptions(String departmentId) {
        requireActiveDepartment(departmentId);

        return designationRepository.findByDepartmentIdAndActiveTrueOrderByNameAsc(departmentId)
                .stream().map(designation -> new DesignationOptionResponse(
                        designation.getId(),
                        designation.getCode(),
                        designation.getName()
                )).toList();
    }

    @Override
    public DesignationResponse update(String designationId, UpdateDesignationRequest request) {

        Designation designation = findDesignation(designationId);
        String name = TextNormalizer.displayName(request.name());
        String normalizedName = TextNormalizer.normalizedKey(request.name());
        boolean duplicate = designationRepository.existsByDepartmentIdAndNormalizedNameAndIdNot(designation.getDepartmentId(),
                normalizedName,designationId);

        if (duplicate){
            throw new DuplicateResourceException("Designation name already exists: "+name);
        }

        designation.setName(name);
        designation.setNormalizedName(normalizedName);
        designation.setUpdatedAt(Instant.now());

        return toResponse(designationRepository.save(designation));
    }

    @Override
    public DesignationResponse setActive(String designationId, boolean active) {
        Designation designation= findDesignation(designationId);

        if (active){
            requireActiveDepartment(designation.getDepartmentId());
        }

        designation.setActive(active);
        designation.setUpdatedAt(Instant.now());
        return toResponse(designationRepository.save(designation));
    }

    private void validateUniqueDesignation(String departmentId, String code, String normalizedname){
        if (designationRepository.existsByDepartmentIdAndCode(departmentId, code)){
            throw new DuplicateResourceException("Designation code already exists in this department: " +code);
        }

        if (designationRepository.existsByDepartmentIdAndNormalizedName(departmentId, normalizedname)){
            throw new DuplicateResourceException("Designation code already exists in this department: " +normalizedname);
        }
    }

    private Department requireDepartment(String departmentId){
        return departmentRepository.findById(departmentId).orElseThrow(()->
                new ResourceNotFoundException("Department not found with Id: " +departmentId));
    }

    private Department requireActiveDepartment(String departmentId){
        Department department = requireDepartment(departmentId);
        if (!department.isActive()){
            throw new InvalidReferenceException("Department is InActive: " +departmentId);
        }
        return department;
    }

    private Designation findDesignation(String designationId){
        return designationRepository.findById(designationId).orElseThrow(()->new ResourceNotFoundException("Desifnation not found with Id: "+designationId));
    }

    private DesignationResponse toResponse(
            Designation designation
    ){
        return new DesignationResponse(
                designation.getId(),
                designation.getCode(),
                designation.getName(),
                designation.getDepartmentId(),
                designation.isActive(),
                designation.getCreatedAt(),
                designation.getUpdatedAt()
        );
    }

}
