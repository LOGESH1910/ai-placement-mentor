package com.aimentor.service;

import com.aimentor.dto.request.ResumeAnalysisRequest;
import com.aimentor.dto.response.ResumeAnalysisDTO;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.model.ResumeAnalysis;
import com.aimentor.model.User;
import com.aimentor.repository.ResumeAnalysisRepository;
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
public class ResumeService {

    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final PromptBuilderService promptBuilder;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisDTO analyzeResume(String email, ResumeAnalysisRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Use provided resumeText or fall back to stored resume
        String resumeText = (request.getResumeText() != null && !request.getResumeText().isBlank())
                ? request.getResumeText()
                : user.getResumeText();

        String prompt = promptBuilder.buildResumeAnalysisPrompt(request.getSkills(), resumeText);
        String response = geminiService.generate(prompt);

        ResumeAnalysis analysis = parseAndSave(user.getId(), request.getSkills(), resumeText, response);
        return toDTO(analysis);
    }

    public List<ResumeAnalysisDTO> getHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDTO).toList();
    }

    private ResumeAnalysis parseAndSave(String userId, List<String> skills,
                                        String resumeText, String jsonResponse) {
        try {
            JsonNode node = objectMapper.readTree(jsonResponse.trim()
                    .replace("```json", "").replace("```", ""));

            ResumeAnalysis analysis = ResumeAnalysis.builder()
                    .userId(userId)
                    .inputSkills(skills)
                    .resumeText(resumeText)
                    .strengths(toList(node.get("strengths")))
                    .weaknesses(toList(node.get("weaknesses")))
                    .missingSkills(toList(node.get("missingSkills")))
                    .recommendedTechnologies(toList(node.get("recommendedTechnologies")))
                    .suggestedProjects(toList(node.get("suggestedProjects")))
                    .learningPlan(toList(node.get("learningPlan")))
                    .build();

            return resumeAnalysisRepository.save(analysis);
        } catch (Exception e) {
            log.error("Failed to parse resume analysis: {}", e.getMessage());
            throw new com.aimentor.exception.GeminiException("Failed to parse AI response");
        }
    }

    private List<String> toList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(n -> result.add(n.asText()));
        }
        return result;
    }

    private ResumeAnalysisDTO toDTO(ResumeAnalysis a) {
        return ResumeAnalysisDTO.builder()
                .id(a.getId())
                .strengths(a.getStrengths())
                .weaknesses(a.getWeaknesses())
                .missingSkills(a.getMissingSkills())
                .recommendedTechnologies(a.getRecommendedTechnologies())
                .suggestedProjects(a.getSuggestedProjects())
                .learningPlan(a.getLearningPlan())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
