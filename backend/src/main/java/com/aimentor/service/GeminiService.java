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
 * Calls the Groq API (llama-3.3-70b-versatile).
 * Includes automatic retry with exponential back-off for 429 rate-limit responses.
 */
@Service
@Slf4j
public class GeminiService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final int maxRetries;

    // Back-off delays in ms: 5s, 10s, 20s
    private static final long[] BACKOFF_MS = {5_000, 10_000, 20_000};

    public GeminiService(
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.base-url}") String baseUrl,
            @Value("${app.gemini.model:llama-3.3-70b-versatile}") String model,
            @Value("${app.gemini.max-retries:3}") int maxRetries,
            @Value("${app.gemini.timeout:30}") int timeoutSeconds) {

        this.apiKey     = apiKey;
        this.baseUrl    = baseUrl;
        this.model      = model;
        this.maxRetries = maxRetries;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    // ── JSON-mode call (for all AI features) ─────────────────────────────────

    public String generate(String prompt) {
        log.debug("Groq generate() prompt length={}", prompt.length());
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                               "You are an AI placement mentor. Always respond with valid JSON only. No markdown, no explanation outside JSON."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 4096
        );
        return callWithRetry(body);
    }

    // ── Chat-mode call (for communication practice — plain text) ─────────────

    public String generateChat(List<Map<String, String>> messages) {
        log.debug("Groq generateChat() messages={}", messages.size());
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.8,
                "max_tokens", 512
        );
        return callWithRetry(body);
    }

    // ── Parse + deserialise helper ────────────────────────────────────────────

    public <T> T generateAndParse(String prompt, Class<T> targetClass) {
        String text = generate(prompt);
        try {
            return objectMapper.readValue(stripMarkdownJson(text), targetClass);
        } catch (Exception e) {
            log.error("Failed to parse AI response as {}: {}", targetClass.getSimpleName(), text);
            throw new GeminiException("Failed to parse AI response. Please try again.");
        }
    }

    // ── Core HTTP call with retry ─────────────────────────────────────────────

    private String callWithRetry(Map<String, Object> requestBody) {
        int attempt = 0;
        while (true) {
            try {
                String bodyJson = objectMapper.writeValueAsString(requestBody);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(baseUrl))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                        .timeout(Duration.ofSeconds(60))
                        .build();

                log.debug("Groq API call attempt {}/{}", attempt + 1, maxRetries + 1);
                HttpResponse<String> response =
                        httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 429) {
                    if (attempt < maxRetries) {
                        long wait = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
                        log.warn("Groq 429 rate-limit hit. Waiting {}ms before retry {}/{}",
                                wait, attempt + 1, maxRetries);
                        Thread.sleep(wait);
                        attempt++;
                        continue;
                    }
                    throw new GeminiException(
                            "AI service is busy. Please wait a few seconds and try again. (Rate limit)");
                }

                if (response.statusCode() >= 400) {
                    log.error("Groq API error {}: {}", response.statusCode(), response.body());
                    throw new GeminiException("AI API error " + response.statusCode()
                            + ". Please try again.");
                }

                return extractTextFromResponse(response.body());

            } catch (GeminiException e) {
                throw e;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new GeminiException("AI request interrupted");
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    log.warn("Groq call failed ({}), retrying {}/{}: {}",
                            e.getClass().getSimpleName(), attempt + 1, maxRetries, e.getMessage());
                    attempt++;
                    try { Thread.sleep(BACKOFF_MS[Math.min(attempt - 1, BACKOFF_MS.length - 1)]); }
                    catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    continue;
                }
                log.error("Groq API call failed after {} retries: {}", maxRetries, e.getMessage());
                throw new GeminiException("Failed to reach AI service. Please try again.");
            }
        }
    }

    // ── Response parsers ──────────────────────────────────────────────────────

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
        else if (text.startsWith("```"))  text = text.substring(3);
        if (text.endsWith("```"))         text = text.substring(0, text.length() - 3);
        return text.trim();
    }
}
