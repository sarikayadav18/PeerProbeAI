package com.PeerProbeAI.server.repository;



import com.PeerProbeAI.server.model.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, Long> {
    // You can define custom query methods here if needed

}
