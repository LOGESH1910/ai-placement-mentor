package com.aimentor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.List;

/**
 * CORS configuration — allows the React frontend to communicate with the API.
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        // Always allow all localhost origins regardless of env config
        List<String> origins = new ArrayList<>(
                java.util.Arrays.asList(allowedOrigins.split(","))
        );
        origins.add("http://localhost:5173");
        origins.add("http://localhost:3000");
        origins.add("http://localhost");
        origins.add("http://127.0.0.1:5173");
        origins.add("http://127.0.0.1:3000");
        origins.add("http://127.0.0.1");

        config.setAllowedOriginPatterns(origins.stream()
                .map(String::trim).distinct().toList());
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
