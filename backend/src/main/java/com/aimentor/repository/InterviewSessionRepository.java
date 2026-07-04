package com.aimentor.repository;

import com.aimentor.model.InterviewSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends MongoRepository<InterviewSession, String> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(String userId);
    List<InterviewSession> findByUserIdAndSessionTypeOrderByCreatedAtDesc(String userId, String sessionType);
}
