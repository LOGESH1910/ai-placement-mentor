package com.aimentor.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    private String id;

    private String userId;

    private String technology;
    private String difficulty;   // EASY | MEDIUM | HARD

    // Generated questions with hints
    private List<QuestionItem> questions;

    // Mock interview fields (when type = MOCK)
    private String sessionType;  // GENERATE | MOCK
    private String mockQuestion;
    private String userAnswer;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer grammarScore;
    private Integer confidenceScore;
    private List<String> suggestions;
    private String improvedAnswer;
    private String overallFeedback;

    @CreatedDate
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionItem {
        private String question;
        private String expectedAnswer;
        private String hint;
        private String difficulty;
    }
}
