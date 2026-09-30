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
public class InterviewSessionDTO {
    private String id;
    private String technology;
    private String difficulty;
    private String sessionType;
    private List<QuestionItemDTO> questions;

    // Mock interview fields
    private String mockQuestion;
    private String userAnswer;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer grammarScore;
    private Integer confidenceScore;
    private List<String> suggestions;
    private String improvedAnswer;
    private String overallFeedback;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionItemDTO {
        private String question;
        private String expectedAnswer;
        private String hint;
        private String difficulty;
    }
}
