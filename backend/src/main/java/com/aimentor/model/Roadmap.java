package com.aimentor.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "roadmaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Roadmap {

    @Id
    private String id;

    private String userId;

    private String targetRole;
    private List<String> currentSkills;

    private MonthPlan month1;
    private MonthPlan month2;
    private MonthPlan month3;

    private List<String> weeklyTasks;
    private List<String> resources;

    @CreatedDate
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthPlan {
        private String theme;
        private List<String> goals;
        private List<String> topics;
        private List<String> projects;
        private List<DayTask> dailyPlan;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DayTask {
        private int day;
        private String task;
        private String duration;
    }
}
