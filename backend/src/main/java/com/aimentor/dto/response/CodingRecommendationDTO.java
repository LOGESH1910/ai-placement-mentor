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
public class CodingRecommendationDTO {
    private String id;
    private String topic;
    private String targetRole;
    private List<ProblemItemDTO> easyProblems;
    private List<ProblemItemDTO> mediumProblems;
    private List<ProblemItemDTO> hardProblems;
    private List<String> practicePlan;
    private List<String> interviewTips;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemItemDTO {
        private String title;
        private String description;
        private String link;
        private String difficulty;
    }
}
