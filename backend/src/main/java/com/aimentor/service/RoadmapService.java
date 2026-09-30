package com.aimentor.service;

import com.aimentor.dto.request.RoadmapRequest;
import com.aimentor.dto.response.RoadmapDTO;
import com.aimentor.exception.GeminiException;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.model.Roadmap;
import com.aimentor.model.User;
import com.aimentor.repository.RoadmapRepository;
import com.aimentor.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final PromptBuilderService promptBuilder;
    private final ObjectMapper objectMapper;

    public RoadmapDTO generateRoadmap(String email, RoadmapRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Merge user's existing skills with request
        List<String> skills = (request.getCurrentSkills() != null && !request.getCurrentSkills().isEmpty())
                ? request.getCurrentSkills()
                : user.getSkills();

        String prompt = promptBuilder.buildRoadmapPrompt(request.getTargetRole(), skills);
        String response = geminiService.generate(prompt);

        Roadmap roadmap = parseAndSave(user.getId(), request.getTargetRole(), skills, response);
        return toDTO(roadmap);
    }

    public List<RoadmapDTO> getHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return roadmapRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDTO).toList();
    }

    private Roadmap parseAndSave(String userId, String targetRole,
                                  List<String> skills, String json) {
        try {
            String cleaned = json.trim().replace("```json", "").replace("```", "").trim();
            JsonNode node = objectMapper.readTree(cleaned);

            Roadmap roadmap = Roadmap.builder()
                    .userId(userId)
                    .targetRole(targetRole)
                    .currentSkills(skills)
                    .month1(parseMonth(node.get("month1")))
                    .month2(parseMonth(node.get("month2")))
                    .month3(parseMonth(node.get("month3")))
                    .weeklyTasks(toStringList(node.get("weeklyTasks")))
                    .resources(toStringList(node.get("resources")))
                    .build();

            return roadmapRepository.save(roadmap);
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse roadmap: {}", e.getMessage());
            throw new GeminiException("Failed to parse AI response");
        }
    }

    private Roadmap.MonthPlan parseMonth(JsonNode node) {
        if (node == null) return null;
        List<Roadmap.DayTask> dailyPlan = new ArrayList<>();
        JsonNode dpNode = node.get("dailyPlan");
        if (dpNode != null && dpNode.isArray()) {
            dpNode.forEach(d -> dailyPlan.add(Roadmap.DayTask.builder()
                    .day(d.path("day").asInt())
                    .task(d.path("task").asText())
                    .duration(d.path("duration").asText())
                    .build()));
        }
        return Roadmap.MonthPlan.builder()
                .theme(node.path("theme").asText())
                .goals(toStringList(node.get("goals")))
                .topics(toStringList(node.get("topics")))
                .projects(toStringList(node.get("projects")))
                .dailyPlan(dailyPlan)
                .build();
    }

    private List<String> toStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) node.forEach(n -> list.add(n.asText()));
        return list;
    }

    private RoadmapDTO toDTO(Roadmap r) {
        return RoadmapDTO.builder()
                .id(r.getId())
                .targetRole(r.getTargetRole())
                .currentSkills(r.getCurrentSkills())
                .month1(toMonthDTO(r.getMonth1()))
                .month2(toMonthDTO(r.getMonth2()))
                .month3(toMonthDTO(r.getMonth3()))
                .weeklyTasks(r.getWeeklyTasks())
                .resources(r.getResources())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private RoadmapDTO.MonthPlanDTO toMonthDTO(Roadmap.MonthPlan m) {
        if (m == null) return null;
        List<RoadmapDTO.DayTaskDTO> dailyPlan = new ArrayList<>();
        if (m.getDailyPlan() != null) {
            m.getDailyPlan().forEach(d -> dailyPlan.add(RoadmapDTO.DayTaskDTO.builder()
                    .day(d.getDay())
                    .task(d.getTask())
                    .duration(d.getDuration())
                    .build()));
        }
        return RoadmapDTO.MonthPlanDTO.builder()
                .theme(m.getTheme())
                .goals(m.getGoals())
                .topics(m.getTopics())
                .projects(m.getProjects())
                .dailyPlan(dailyPlan)
                .build();
    }
}
