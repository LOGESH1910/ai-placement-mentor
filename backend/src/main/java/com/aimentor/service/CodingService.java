package com.aimentor.service;

import com.aimentor.dto.request.CodingRecommendationRequest;
import com.aimentor.dto.response.CodingRecommendationDTO;
import com.aimentor.exception.GeminiException;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.model.CodingRecommendation;
import com.aimentor.model.User;
import com.aimentor.repository.CodingRecommendationRepository;
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
public class CodingService {

    private final CodingRecommendationRepository codingRepo;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final PromptBuilderService promptBuilder;
    private final ObjectMapper objectMapper;

    public CodingRecommendationDTO getRecommendations(String email, CodingRecommendationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String prompt = promptBuilder.buildCodingRecommendationPrompt(
                request.getTopic(), request.getTargetRole(),
                request.getEasyCount(), request.getMediumCount(), request.getHardCount());
        String response = geminiService.generate(prompt);

        CodingRecommendation rec = parseAndSave(user.getId(), request, response);
        return toDTO(rec);
    }

    public List<CodingRecommendationDTO> getHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return codingRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDTO).toList();
    }

    private CodingRecommendation parseAndSave(String userId,
                                               CodingRecommendationRequest req, String json) {
        try {
            String cleaned = json.trim().replace("```json", "").replace("```", "").trim();
            JsonNode node = objectMapper.readTree(cleaned);

            CodingRecommendation rec = CodingRecommendation.builder()
                    .userId(userId)
                    .topic(req.getTopic())
                    .targetRole(req.getTargetRole())
                    .easyProblems(parseProblems(node.get("easyProblems")))
                    .mediumProblems(parseProblems(node.get("mediumProblems")))
                    .hardProblems(parseProblems(node.get("hardProblems")))
                    .practicePlan(toStringList(node.get("practicePlan")))
                    .interviewTips(toStringList(node.get("interviewTips")))
                    .build();

            return codingRepo.save(rec);
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse coding recommendation: {}", e.getMessage());
            throw new GeminiException("Failed to parse AI response");
        }
    }

    private List<CodingRecommendation.ProblemItem> parseProblems(JsonNode node) {
        List<CodingRecommendation.ProblemItem> items = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(p -> items.add(CodingRecommendation.ProblemItem.builder()
                    .title(p.path("title").asText())
                    .description(p.path("description").asText())
                    .link(p.path("link").asText())
                    .difficulty(p.path("difficulty").asText())
                    .build()));
        }
        return items;
    }

    private List<String> toStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) node.forEach(n -> list.add(n.asText()));
        return list;
    }

    private CodingRecommendationDTO toDTO(CodingRecommendation r) {
        return CodingRecommendationDTO.builder()
                .id(r.getId())
                .topic(r.getTopic())
                .targetRole(r.getTargetRole())
                .easyProblems(toProblemsDTO(r.getEasyProblems()))
                .mediumProblems(toProblemsDTO(r.getMediumProblems()))
                .hardProblems(toProblemsDTO(r.getHardProblems()))
                .practicePlan(r.getPracticePlan())
                .interviewTips(r.getInterviewTips())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private List<CodingRecommendationDTO.ProblemItemDTO> toProblemsDTO(
            List<CodingRecommendation.ProblemItem> items) {
        if (items == null) return List.of();
        return items.stream()
                .map(p -> CodingRecommendationDTO.ProblemItemDTO.builder()
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .link(p.getLink())
                        .difficulty(p.getDifficulty())
                        .build())
                .toList();
    }
}
