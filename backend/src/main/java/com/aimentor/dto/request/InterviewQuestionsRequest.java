package com.aimentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InterviewQuestionsRequest {

    @NotBlank(message = "Technology or role is required")
    private String technology;

    /** Optional: EASY | MEDIUM | HARD | ALL (default ALL) */
    private String difficulty = "ALL";

    /** Number of easy questions (used when difficulty = EASY or ALL) */
    private int easyCount = 3;

    /** Number of medium questions (used when difficulty = MEDIUM or ALL) */
    private int mediumCount = 3;

    /** Number of hard questions (used when difficulty = HARD or ALL) */
    private int hardCount = 3;
}
