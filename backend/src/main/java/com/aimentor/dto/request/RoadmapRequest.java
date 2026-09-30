package com.aimentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class RoadmapRequest {

    @NotBlank(message = "Target role is required")
    private String targetRole;

    private List<String> currentSkills;
}
