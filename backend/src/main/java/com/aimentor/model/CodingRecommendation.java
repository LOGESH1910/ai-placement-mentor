package com.aimentor.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "coding_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingRecommendation {

    @Id
    private String id;

    private String userId;

    private String topic;       // e.g. "Arrays", "Dynamic Programming"
    private String targetRole;  // e.g. "SDE", "Data Engineer"

    private List<ProblemItem> easyProblems;
    private List<ProblemItem> mediumProblems;
    private List<ProblemItem> hardProblems;

    private List<String> practicePlan;
    private List<String> interviewTips;

    @CreatedDate
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProblemItem {
        private String title;
        private String description;
        private String link;
        private String difficulty;
    }
}
