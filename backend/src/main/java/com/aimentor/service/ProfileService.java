package com.aimentor.service;

import com.aimentor.dto.request.UpdateProfileRequest;
import com.aimentor.dto.response.UserDTO;
import com.aimentor.exception.ResourceNotFoundException;
import com.aimentor.model.User;
import com.aimentor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;

    public UserDTO getProfile(String email) {
        User user = findByEmail(email);
        return AuthService.toDTO(user);
    }

    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);

        user.setName(request.getName());
        user.setCollege(request.getCollege());
        user.setDepartment(request.getDepartment());
        user.setTargetRole(request.getTargetRole());
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }

        user.setPlacementReadinessScore(calculateReadiness(user));
        user = userRepository.save(user);

        log.info("Profile updated for user: {}", email);
        return AuthService.toDTO(user);
    }

    public UserDTO uploadResume(String email, MultipartFile file) throws IOException {
        User user = findByEmail(email);

        String content = extractText(file);
        user.setResumeText(content);
        user.setResumeFileName(file.getOriginalFilename());
        user.setPlacementReadinessScore(calculateReadiness(user));
        user = userRepository.save(user);

        log.info("Resume uploaded for user: {} (file: {}, chars: {})",
                email, file.getOriginalFilename(), content.length());
        return AuthService.toDTO(user);
    }

    /**
     * Extract plain text from uploaded file.
     * Supports: .pdf, .docx, .doc, .txt and any plain-text file.
     */
    private String extractText(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase() : "";

        try {
            if (filename.endsWith(".pdf")) {
                try (PDDocument pdf = Loader.loadPDF(file.getBytes())) {
                    return new PDFTextStripper().getText(pdf);
                }
            } else if (filename.endsWith(".docx")) {
                try (InputStream is = file.getInputStream(); XWPFDocument docx = new XWPFDocument(is)) {
                    return new XWPFWordExtractor(docx).getText();
                }
            } else if (filename.endsWith(".doc")) {
                try (InputStream is = file.getInputStream(); HWPFDocument doc = new HWPFDocument(is)) {
                    return new WordExtractor(doc).getText();
                }
            } else {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract text from resume: {}", e.getMessage());
            throw new IOException("Could not read resume file: " + e.getMessage(), e);
        }
    }

    private int calculateReadiness(User user) {
        int score = 0;
        if (user.getName() != null && !user.getName().isBlank()) score += 10;
        if (user.getCollege() != null && !user.getCollege().isBlank()) score += 10;
        if (user.getDepartment() != null && !user.getDepartment().isBlank()) score += 10;
        if (user.getTargetRole() != null && !user.getTargetRole().isBlank()) score += 15;
        if (user.getSkills() != null) score += Math.min(user.getSkills().size() * 5, 30);
        if (user.getResumeText() != null && !user.getResumeText().isBlank()) score += 25;
        return Math.min(score, 100);
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
