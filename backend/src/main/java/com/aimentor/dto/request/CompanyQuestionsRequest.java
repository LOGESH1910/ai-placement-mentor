package com.aimentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyQuestionsRequest {

    @NotBlank(message = "Company name is required")
    private String company;

    private int hrCount = 5;
    private int techCount = 5;
}
