package com.PeerProbeAI.server.repository;



import com.PeerProbeAI.server.model.TestCaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCaseEntity, Long> {
    // You can add custom query methods here if needed
}

