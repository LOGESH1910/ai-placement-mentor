package com.aimentor.controller;

import com.aimentor.dto.request.InterviewQuestionsRequest;
import com.aimentor.dto.request.MockInterviewRequest;
import com.aimentor.dto.response.ApiResponse;
import com.aimentor.dto.response.InterviewSessionDTO;
import com.aimentor.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
@Tag(name = "Interview", description = "Question generation and mock interview evaluation")
@SecurityRequirement(name = "bearerAuth")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/questions")
    @Operation(summary = "Generate interview questions by technology")
    public ResponseEntity<ApiResponse<InterviewSessionDTO>> generateQuestions(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InterviewQuestionsRequest request) {
        InterviewSessionDTO result = interviewService.generateQuestions(
                userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Questions generated", result));
    }

    @GetMapping("/questions/history")
    @Operation(summary = "Get question generation history")
    public ResponseEntity<ApiResponse<List<InterviewSessionDTO>>> getQuestionHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                interviewService.getQuestionHistory(userDetails.getUsername())));
    }

    @PostMapping("/mock")
    @Operation(summary = "Submit a mock interview answer for AI evaluation")
    public ResponseEntity<ApiResponse<InterviewSessionDTO>> mockInterview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MockInterviewRequest request) {
        InterviewSessionDTO result = interviewService.evaluateMockAnswer(
                userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Evaluation complete", result));
    }

    @GetMapping("/mock/history")
    @Operation(summary = "Get mock interview history")
    public ResponseEntity<ApiResponse<List<InterviewSessionDTO>>> getMockHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                interviewService.getMockHistory(userDetails.getUsername())));
    }

    @PostMapping("/chat")
    @Operation(summary = "Communication practice chat — AI responds to a conversation")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        java.util.List<Map<String, String>> messages =
                (java.util.List<Map<String, String>>) body.get("messages");
        String reply = interviewService.chat(messages);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
