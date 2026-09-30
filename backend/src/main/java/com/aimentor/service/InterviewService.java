package com.aimentor.service;

import com.aimentor.dto.request.InterviewQuestionsRequest;
import com.aimentor.dto.request.MockInterviewRequest;
import com.aimentor.dto.response.InterviewSessionDTO;
import com.aimentor.exception.GeminiException;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.model.InterviewSession;
import com.aimentor.model.User;
import com.aimentor.repository.InterviewSessionRepository;
import com.aimentor.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final PromptBuilderService promptBuilder;
    private final ObjectMapper objectMapper;

    // ── Generate Questions ────────────────────────────────────────────────────

    public InterviewSessionDTO generateQuestions(String email, InterviewQuestionsRequest request) {
        User user = findUser(email);

        String prompt = promptBuilder.buildInterviewQuestionsPrompt(
                request.getTechnology(), request.getDifficulty(),
                request.getEasyCount(), request.getMediumCount(), request.getHardCount());
        String response = geminiService.generate(prompt);

        InterviewSession session = parseQuestionsAndSave(
                user.getId(), request.getTechnology(), request.getDifficulty(), response);
        return toDTO(session);
    }

    public List<InterviewSessionDTO> getQuestionHistory(String email) {
        User user = findUser(email);
        return sessionRepository
                .findByUserIdAndSessionTypeOrderByCreatedAtDesc(user.getId(), "GENERATE")
                .stream().map(this::toDTO).toList();
    }

    // ── Mock Interview ────────────────────────────────────────────────────────

    public InterviewSessionDTO evaluateMockAnswer(String email, MockInterviewRequest request) {
        User user = findUser(email);

        String prompt = promptBuilder.buildMockInterviewEvaluationPrompt(
                request.getTechnology(), request.getQuestion(), request.getAnswer());
        String response = geminiService.generate(prompt);

        InterviewSession session = parseMockAndSave(
                user.getId(), request, response);
        return toDTO(session);
    }

    public List<InterviewSessionDTO> getMockHistory(String email) {
        User user = findUser(email);
        return sessionRepository
                .findByUserIdAndSessionTypeOrderByCreatedAtDesc(user.getId(), "MOCK")
                .stream().map(this::toDTO).toList();
    }

    // ── Communication Practice Chat ───────────────────────────────────────────

    public String chat(java.util.List<java.util.Map<String, String>> messages) {
        if (messages == null || messages.isEmpty()) {
            return "Hello! I'm ready to help you practice. Let's begin.";
        }
        try {
            // Pass messages directly to the chat-specific Groq call (no JSON-only constraint)
            List<Map<String, String>> groqMessages = new ArrayList<>();
            for (java.util.Map<String, String> msg : messages) {
                String role = msg.getOrDefault("role", "user");
                String content = msg.getOrDefault("content", "");
                // Only pass system, user, assistant roles
                if ("system".equals(role) || "user".equals(role) || "assistant".equals(role)) {
                    groqMessages.add(Map.of("role", role, "content", content));
                }
            }
            return geminiService.generateChat(groqMessages);
        } catch (Exception e) {
            log.warn("Chat AI call failed, using fallback: {}", e.getMessage());
            return "That's an interesting point! Could you elaborate a bit more? " +
                   "I'd love to hear a specific example from your experience.";
        }
    }

    // ── Parsers ───────────────────────────────────────────────────────────────

    private InterviewSession parseQuestionsAndSave(String userId, String tech,
                                                    String difficulty, String json) {
        try {
            JsonNode node = parseJson(json);
            List<InterviewSession.QuestionItem> questions = new ArrayList<>();
            JsonNode questionsNode = node.get("questions");
            if (questionsNode != null && questionsNode.isArray()) {
                questionsNode.forEach(q -> questions.add(
                        InterviewSession.QuestionItem.builder()
                                .question(q.path("question").asText())
                                .expectedAnswer(q.path("expectedAnswer").asText())
                                .hint(q.path("hint").asText())
                                .difficulty(q.path("difficulty").asText())
                                .build()));
            }

            InterviewSession session = InterviewSession.builder()
                    .userId(userId)
                    .technology(tech)
                    .difficulty(difficulty)
                    .sessionType("GENERATE")
                    .questions(questions)
                    .build();

            return sessionRepository.save(session);
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse interview questions: {}", e.getMessage());
            throw new GeminiException("Failed to parse AI response");
        }
    }

    private InterviewSession parseMockAndSave(String userId, MockInterviewRequest req, String json) {
        try {
            JsonNode node = parseJson(json);

            List<String> suggestions = new ArrayList<>();
            JsonNode sugNode = node.get("suggestions");
            if (sugNode != null && sugNode.isArray()) {
                sugNode.forEach(s -> suggestions.add(s.asText()));
            }

            InterviewSession session = InterviewSession.builder()
                    .userId(userId)
                    .technology(req.getTechnology())
                    .sessionType("MOCK")
                    .mockQuestion(req.getQuestion())
                    .userAnswer(req.getAnswer())
                    .technicalScore(node.path("technicalScore").asInt())
                    .communicationScore(node.path("communicationScore").asInt())
                    .grammarScore(node.path("grammarScore").asInt())
                    .confidenceScore(node.path("confidenceScore").asInt())
                    .suggestions(suggestions)
                    .improvedAnswer(node.path("improvedAnswer").asText())
                    .overallFeedback(node.path("overallFeedback").asText())
                    .build();

            return sessionRepository.save(session);
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse mock interview: {}", e.getMessage());
            throw new GeminiException("Failed to parse AI response");
        }
    }

    private JsonNode parseJson(String raw) throws Exception {
        String cleaned = raw.trim()
                .replace("```json", "").replace("```", "").trim();
        return objectMapper.readTree(cleaned);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private InterviewSessionDTO toDTO(InterviewSession s) {
        List<InterviewSessionDTO.QuestionItemDTO> questions = null;
        if (s.getQuestions() != null) {
            questions = s.getQuestions().stream()
                    .map(q -> InterviewSessionDTO.QuestionItemDTO.builder()
                            .question(q.getQuestion())
                            .expectedAnswer(q.getExpectedAnswer())
                            .hint(q.getHint())
                            .difficulty(q.getDifficulty())
                            .build())
                    .toList();
        }

        return InterviewSessionDTO.builder()
                .id(s.getId())
                .technology(s.getTechnology())
                .difficulty(s.getDifficulty())
                .sessionType(s.getSessionType())
                .questions(questions)
                .mockQuestion(s.getMockQuestion())
                .userAnswer(s.getUserAnswer())
                .technicalScore(s.getTechnicalScore())
                .communicationScore(s.getCommunicationScore())
                .grammarScore(s.getGrammarScore())
                .confidenceScore(s.getConfidenceScore())
                .suggestions(s.getSuggestions())
                .improvedAnswer(s.getImprovedAnswer())
                .overallFeedback(s.getOverallFeedback())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
