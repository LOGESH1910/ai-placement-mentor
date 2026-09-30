package com.aimentor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String college;
    private String department;
    private String targetRole;
    private List<String> skills;
    private int placementReadinessScore;
    private String resumeFileName;
    private Instant createdAt;
}
