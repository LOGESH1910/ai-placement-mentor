package com.aimentor.dto.request;

import lombok.Data;

@Data
public class CodingRecommendationRequest {

    private String topic;
    private String targetRole;
    private int easyCount = 3;
    private int mediumCount = 3;
    private int hardCount = 3;
}
