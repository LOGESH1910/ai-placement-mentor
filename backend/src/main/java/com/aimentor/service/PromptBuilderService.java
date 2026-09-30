package com.aimentor.service;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PromptBuilderService {

    private static final String JSON_ONLY =
            "\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no extra text.";

    public String buildResumeAnalysisPrompt(List<String> skills, String resumeText) {
        return ("You are an expert career counselor. Analyze this student profile.\n"
                + "Skills: " + String.join(", ", skills) + "\n"
                + "Resume: " + (resumeText != null ? resumeText : "Not provided") + "\n\n"
                + "Return JSON: {\"strengths\":[],\"weaknesses\":[],\"missingSkills\":[],"
                + "\"recommendedTechnologies\":[],\"suggestedProjects\":[],\"learningPlan\":[]}")
                + JSON_ONLY;
    }

    public String buildInterviewQuestionsPrompt(String technology, String difficulty,
                                                 int easyCount, int mediumCount, int hardCount) {
        String counts;
        if ("EASY".equals(difficulty))   counts = "exactly " + easyCount + " EASY questions";
        else if ("MEDIUM".equals(difficulty)) counts = "exactly " + mediumCount + " MEDIUM questions";
        else if ("HARD".equals(difficulty))  counts = "exactly " + hardCount + " HARD questions";
        else counts = "exactly " + easyCount + " EASY, " + mediumCount + " MEDIUM, and " + hardCount + " HARD questions";

        return ("You are a senior software engineer. Generate interview questions for: " + technology + "\n"
                + "Generate " + counts + ".\n\n"
                + "Return JSON: {\"questions\":[{\"question\":\"string\","
                + "\"expectedAnswer\":\"string\",\"hint\":\"string\",\"difficulty\":\"EASY|MEDIUM|HARD\"}]}")
                + JSON_ONLY;
    }

    public String buildMockInterviewEvaluationPrompt(String technology, String question, String answer) {
        return ("Evaluate this interview answer.\nTechnology: " + technology
                + "\nQuestion: " + question + "\nAnswer: " + answer + "\n\n"
                + "Return JSON: {\"technicalScore\":0,\"communicationScore\":0,\"grammarScore\":0,"
                + "\"confidenceScore\":0,\"suggestions\":[],\"improvedAnswer\":\"string\","
                + "\"overallFeedback\":\"string\"}")
                + JSON_ONLY;
    }

    public String buildCodingRecommendationPrompt(String topic, String targetRole,
                                                   int easyCount, int mediumCount, int hardCount) {
        return ("You are a DSA expert. Generate " + easyCount + " easy, " + mediumCount
                + " medium, " + hardCount + " hard LeetCode problems.\n"
                + "Topic: " + (topic != null ? topic : "General DSA") + "\n"
                + "Role: " + (targetRole != null ? targetRole : "Software Engineer") + "\n\n"
                + "Use REAL LeetCode problem names and correct URLs like https://leetcode.com/problems/two-sum/\n\n"
                + "Return JSON: {\"easyProblems\":[{\"title\":\"string\",\"description\":\"string\","
                + "\"link\":\"https://leetcode.com/problems/...\",\"difficulty\":\"EASY\"}],"
                + "\"mediumProblems\":[{\"title\":\"string\",\"description\":\"string\","
                + "\"link\":\"https://leetcode.com/problems/...\",\"difficulty\":\"MEDIUM\"}],"
                + "\"hardProblems\":[{\"title\":\"string\",\"description\":\"string\","
                + "\"link\":\"https://leetcode.com/problems/...\",\"difficulty\":\"HARD\"}],"
                + "\"practicePlan\":[],\"interviewTips\":[]}")
                + JSON_ONLY;
    }

    public String buildRoadmapPrompt(String targetRole, List<String> currentSkills) {
        String skills = currentSkills != null && !currentSkills.isEmpty()
                ? String.join(", ", currentSkills) : "None";
        return ("You are an expert career counselor. Create a 90-day placement roadmap.\n"
                + "Target Role: " + targetRole + "\nCurrent Skills: " + skills + "\n\n"
                + "Month 1 = Day 1-30, Month 2 = Day 31-60, Month 3 = Day 61-90.\n"
                + "Generate all 30 days per month. Keep tasks short (under 8 words).\n\n"
                + "Return JSON:\n"
                + "{\"month1\":{\"theme\":\"string\",\"goals\":[],\"topics\":[],\"projects\":[],"
                + "\"dailyPlan\":[{\"day\":1,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":2,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":3,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":4,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":5,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":6,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":7,\"task\":\"string\",\"duration\":\"1 hour\"},"
                + "{\"day\":8,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":9,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":10,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":11,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":12,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":13,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":14,\"task\":\"string\",\"duration\":\"1 hour\"},"
                + "{\"day\":15,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":16,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":17,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":18,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":19,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":20,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":21,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":22,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":23,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":24,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":25,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":26,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":27,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":28,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":29,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":30,\"task\":\"string\",\"duration\":\"2 hours\"}]},"
                + "\"month2\":{\"theme\":\"string\",\"goals\":[],\"topics\":[],\"projects\":[],"
                + "\"dailyPlan\":[{\"day\":31,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":32,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":33,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":34,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":35,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":36,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":37,\"task\":\"string\",\"duration\":\"1 hour\"},"
                + "{\"day\":38,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":39,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":40,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":41,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":42,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":43,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":44,\"task\":\"string\",\"duration\":\"1 hour\"},"
                + "{\"day\":45,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":46,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":47,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":48,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":49,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":50,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":51,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":52,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":53,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":54,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":55,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":56,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":57,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":58,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":59,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":60,\"task\":\"string\",\"duration\":\"2 hours\"}]},"
                + "\"month3\":{\"theme\":\"string\",\"goals\":[],\"topics\":[],\"projects\":[],"
                + "\"dailyPlan\":[{\"day\":61,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":62,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":63,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":64,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":65,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":66,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":67,\"task\":\"string\",\"duration\":\"1 hour\"},"
                + "{\"day\":68,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":69,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":70,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":71,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":72,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":73,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":74,\"task\":\"string\",\"duration\":\"1 hour\"},"
                + "{\"day\":75,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":76,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":77,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":78,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":79,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":80,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":81,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":82,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":83,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":84,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":85,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":86,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":87,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":88,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":89,\"task\":\"string\",\"duration\":\"2 hours\"},"
                + "{\"day\":90,\"task\":\"string\",\"duration\":\"2 hours\"}]},"
                + "\"weeklyTasks\":[],\"resources\":[]}\n\n"
                + "Replace all 'string' values with real tasks for " + targetRole + ".")
                + JSON_ONLY;
    }
}
