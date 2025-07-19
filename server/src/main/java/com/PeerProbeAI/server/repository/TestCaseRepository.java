package com.PeerProbeAI.server.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.PeerProbeAI.server.model.TestCaseEntity;
import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCaseEntity, Long> {
    // Use either:
    List<TestCaseEntity> findByQuestionId(Long questionId);
    // OR if using TestCaseEntity:
    // List<TestCaseEntity> findByQuestionId(Long questionId);
}