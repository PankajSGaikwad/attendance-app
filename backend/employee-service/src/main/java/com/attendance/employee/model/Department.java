package com.attendance.employee.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "departments")
public class Department {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private String name;

    @Indexed(unique = true)
    private String normalizedName;

    private Set<String> supervisorUserIds = new HashSet<>();

    private boolean active=true;

    private Instant createdAt;

    private Instant updatedAt;
}
