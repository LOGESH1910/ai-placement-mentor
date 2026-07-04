package com.aimentor.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger / OpenAPI 3 configuration with JWT bearer auth support.
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "AI Placement Mentor API",
        version = "1.0.0",
        description = "Backend API for the AI-powered campus placement preparation platform",
        contact = @Contact(name = "AI Placement Mentor", email = "support@aimentor.com")
    )
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class SwaggerConfig {
    // Configuration provided via annotations
}
