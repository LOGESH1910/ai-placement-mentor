package com.aimentor.service;

import com.aimentor.exception.GeminiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Calls the Groq API using Java's built-in HttpClient (no Netty DNS issues).
 */
@Service
@Slf4j
public class GeminiService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public GeminiService(
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.base-url}") String baseUrl,
            @Value("${app.gemini.model:llama-3.3-70b-versatile}") String model,
            @Value("${app.gemini.max-retries}") int maxRetries,
            @Value("${app.gemini.timeout}") int timeoutSeconds) {

        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public String generate(String prompt) {
        log.debug("Calling Groq API with prompt length: {}", prompt.length());

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content",
                                    "You are an AI placement mentor. Always respond with valid JSON only. No markdown, no explanation outside JSON."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.7,
                    "max_tokens", 4096
            );

            String bodyJson = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .timeout(Duration.ofSeconds(60))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                log.error("Groq API error {}: {}", response.statusCode(), response.body());
                throw new GeminiException("AI API returned error " + response.statusCode());
            }

            return extractTextFromResponse(response.body());

        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Groq API call failed: {}", e.getMessage());
            throw new GeminiException("Failed to call AI API: " + e.getMessage(), e);
        }
    }

    public <T> T generateAndParse(String prompt, Class<T> targetClass) {
        String text = generate(prompt);
        try {
            text = stripMarkdownJson(text);
            return objectMapper.readValue(text, targetClass);
        } catch (Exception e) {
            log.error("Failed to parse AI response as {}: {}", targetClass.getSimpleName(), text);
            throw new GeminiException("Failed to parse AI response. Please try again.");
        }
    }

    private String extractTextFromResponse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode text = root.path("choices").get(0).path("message").path("content");
            if (text.isMissingNode() || text.asText().isBlank()) {
                throw new GeminiException("Empty response from AI");
            }
            return text.asText();
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract text from AI response: {}", rawJson);
            throw new GeminiException("Unexpected AI response format");
        }
    }

    private String stripMarkdownJson(String text) {
        if (text == null) return "{}";
        text = text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        else if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
        return text.trim();
    }
}
