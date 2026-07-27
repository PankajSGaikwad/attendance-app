package com.attendance.employee.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "employees") //its required for mongoDB
public class Employee {
    @Id
    private String id;

    @Indexed(unique = true)
    private  String userId;

    @Indexed(unique = true)
    private  String email;

    private String firstName;
    private String lastName;
    private String phone;

    @Indexed
    private String departmentId;

    @Indexed
    private String designationId;

    private EmployeeStatus status = EmployeeStatus.DRAFT;

    //False until the administrator/supervisor approves the profile.
    private boolean active;

    private String profilePhotoId;
    private String employeeCode;
    private String qrToken;
    private String rejectionReason;

    private Instant submittedAt;
    private Instant approvedAt;
    private Instant approvedBy;

    private Instant createdAt;
    private Instant updatedAt;
}
