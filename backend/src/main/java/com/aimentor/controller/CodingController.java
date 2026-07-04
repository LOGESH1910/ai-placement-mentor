package com.aimentor.controller;

import com.aimentor.dto.request.CodingRecommendationRequest;
import com.aimentor.dto.response.ApiResponse;
import com.aimentor.dto.response.CodingRecommendationDTO;
import com.aimentor.service.CodingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coding")
@RequiredArgsConstructor
@Tag(name = "Coding Recommendations", description = "DSA problem recommendations and practice plans")
@SecurityRequirement(name = "bearerAuth")
public class CodingController {

    private final CodingService codingService;

    @PostMapping("/recommend")
    @Operation(summary = "Get coding problem recommendations by topic or role")
    public ResponseEntity<ApiResponse<CodingRecommendationDTO>> recommend(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CodingRecommendationRequest request) {
        CodingRecommendationDTO result = codingService.getRecommendations(
                userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Recommendations generated", result));
    }

    @GetMapping("/history")
    @Operation(summary = "Get coding recommendation history")
    public ResponseEntity<ApiResponse<List<CodingRecommendationDTO>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                codingService.getHistory(userDetails.getUsername())));
    }
}
