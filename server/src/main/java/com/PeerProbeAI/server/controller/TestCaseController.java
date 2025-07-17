package com.PeerProbeAI.server.controller;



import com.PeerProbeAI.server.model.TestCaseEntity;
import com.PeerProbeAI.server.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/test-cases")
@CrossOrigin(origins = "http://localhost:3000") // Enable frontend access (React)
public class TestCaseController {

    @Autowired
    private TestCaseRepository testCaseRepository;

    // Create a new test case
    @PostMapping
    public ResponseEntity<TestCaseEntity> createTestCase(@RequestBody TestCaseEntity testCase) {
        TestCaseEntity saved = testCaseRepository.save(testCase);
        return ResponseEntity.ok(saved);
    }

    // Get all test cases
    @GetMapping
    public ResponseEntity<List<TestCaseEntity>> getAllTestCases() {
        List<TestCaseEntity> all = testCaseRepository.findAll();
        return ResponseEntity.ok(all);
    }

    // Get test case by ID
    @GetMapping("/{id}")
    public ResponseEntity<TestCaseEntity> getTestCaseById(@PathVariable Long id) {
        Optional<TestCaseEntity> optional = testCaseRepository.findById(id);
        return optional.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update test case by ID
    @PutMapping("/{id}")
    public ResponseEntity<TestCaseEntity> updateTestCase(@PathVariable Long id,
                                                         @RequestBody TestCaseEntity updatedTestCase) {
        return testCaseRepository.findById(id).map(existing -> {
            existing.setInput(updatedTestCase.getInput());
            existing.setOutput(updatedTestCase.getOutput());
            TestCaseEntity saved = testCaseRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete test case by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable Long id) {
        if (testCaseRepository.existsById(id)) {
            testCaseRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

