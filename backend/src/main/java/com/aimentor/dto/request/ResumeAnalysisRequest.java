package com.aimentor.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ResumeAnalysisRequest {

    @NotEmpty(message = "At least one skill is required")
    private List<String> skills;

    private String resumeText;  // optional; falls back to profile resume
}
