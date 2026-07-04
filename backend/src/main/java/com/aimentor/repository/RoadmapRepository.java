package com.aimentor.repository;

import com.aimentor.model.Roadmap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapRepository extends MongoRepository<Roadmap, String> {
    List<Roadmap> findByUserIdOrderByCreatedAtDesc(String userId);
}
