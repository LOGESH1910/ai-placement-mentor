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
public class ResumeAnalysisDTO {
    private String id;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingSkills;
    private List<String> recommendedTechnologies;
    private List<String> suggestedProjects;
    private List<String> learningPlan;
    private Instant createdAt;
}
