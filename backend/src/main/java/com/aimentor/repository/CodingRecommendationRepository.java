package com.aimentor.repository;

import com.aimentor.model.CodingRecommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingRecommendationRepository extends MongoRepository<CodingRecommendation, String> {
    List<CodingRecommendation> findByUserIdOrderByCreatedAtDesc(String userId);
}
