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
public class RoadmapDTO {
    private String id;
    private String targetRole;
    private List<String> currentSkills;
    private MonthPlanDTO month1;
    private MonthPlanDTO month2;
    private MonthPlanDTO month3;
    private List<String> weeklyTasks;
    private List<String> resources;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthPlanDTO {
        private String theme;
        private List<String> goals;
        private List<String> topics;
        private List<String> projects;
        private List<DayTaskDTO> dailyPlan;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayTaskDTO {
        private int day;
        private String task;
        private String duration;
    }
}
