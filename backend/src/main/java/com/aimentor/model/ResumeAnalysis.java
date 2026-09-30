package com.aimentor.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "resume_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysis {

    @Id
    private String id;

    private String userId;

    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingSkills;
    private List<String> recommendedTechnologies;
    private List<String> suggestedProjects;
    private List<String> learningPlan;

    /** Raw resume text that was analysed */
    private String resumeText;
    private List<String> inputSkills;

    @CreatedDate
    private Instant createdAt;
}
