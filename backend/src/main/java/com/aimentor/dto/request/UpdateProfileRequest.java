package com.aimentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String college;
    private String department;
    private String targetRole;
    private List<String> skills;
}
