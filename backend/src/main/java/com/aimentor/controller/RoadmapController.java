package com.aimentor.controller;

import com.aimentor.dto.request.RoadmapRequest;
import com.aimentor.dto.response.ApiResponse;
import com.aimentor.dto.response.RoadmapDTO;
import com.aimentor.service.RoadmapService;
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
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
@Tag(name = "Learning Roadmap", description = "Personalized 3-month placement preparation roadmap")
@SecurityRequirement(name = "bearerAuth")
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping("/generate")
    @Operation(summary = "Generate a personalized learning roadmap")
    public ResponseEntity<ApiResponse<RoadmapDTO>> generateRoadmap(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RoadmapRequest request) {
        RoadmapDTO result = roadmapService.generateRoadmap(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Roadmap generated", result));
    }

    @GetMapping("/history")
    @Operation(summary = "Get roadmap history")
    public ResponseEntity<ApiResponse<List<RoadmapDTO>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                roadmapService.getHistory(userDetails.getUsername())));
    }
}
