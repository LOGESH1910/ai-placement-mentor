package com.aimentor.service;

import com.aimentor.dto.request.LoginRequest;
import com.aimentor.dto.request.RegisterRequest;
import com.aimentor.dto.response.AuthResponse;
import com.aimentor.dto.response.UserDTO;
import com.aimentor.exception.EmailAlreadyExistsException;
import com.aimentor.model.User;
import com.aimentor.repository.UserRepository;
import com.aimentor.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .college(request.getCollege())
                .department(request.getDepartment())
                .skills(List.of())
                .placementReadinessScore(0)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        var springUser = toSpringUser(user);
        String token = jwtUtil.generateToken(springUser);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(toDTO(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        var springUser = toSpringUser(user);
        String token = jwtUtil.generateToken(springUser);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(toDTO(user))
                .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private org.springframework.security.core.userdetails.User toSpringUser(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), List.of());
    }

    public static UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .department(user.getDepartment())
                .targetRole(user.getTargetRole())
                .skills(user.getSkills())
                .placementReadinessScore(user.getPlacementReadinessScore())
                .resumeFileName(user.getResumeFileName())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
