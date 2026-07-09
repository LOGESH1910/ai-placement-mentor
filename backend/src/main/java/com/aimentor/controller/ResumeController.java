package com.aimentor.controller;

import com.aimentor.dto.request.ResumeAnalysisRequest;
import com.aimentor.dto.response.ApiResponse;
import com.aimentor.dto.response.ResumeAnalysisDTO;
import com.aimentor.service.ResumeService;
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

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
@Tag(name = "Resume Analysis", description = "AI-powered resume and skill analysis")
@SecurityRequirement(name = "bearerAuth")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyze skills and resume with AI")
    public ResponseEntity<ApiResponse<ResumeAnalysisDTO>> analyze(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResumeAnalysisRequest request) {
        ResumeAnalysisDTO result = resumeService.analyzeResume(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Analysis complete", result));
    }

    @GetMapping("/history")
    @Operation(summary = "Get resume analysis history")
    public ResponseEntity<ApiResponse<List<ResumeAnalysisDTO>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ResumeAnalysisDTO> history = resumeService.getHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
