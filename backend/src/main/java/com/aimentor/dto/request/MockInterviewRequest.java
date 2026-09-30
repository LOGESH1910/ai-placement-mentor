package com.aimentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MockInterviewRequest {

    @NotBlank(message = "Technology is required")
    private String technology;

    @NotBlank(message = "Question is required")
    private String question;

    @NotBlank(message = "Answer is required")
    private String answer;
}
