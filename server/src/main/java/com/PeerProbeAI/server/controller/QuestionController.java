package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.model.QuestionEntity;
import com.PeerProbeAI.server.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    // Create a new question
    @PostMapping
    public ResponseEntity<QuestionEntity> createQuestion(@RequestBody QuestionEntity question) {
        QuestionEntity savedQuestion = questionRepository.save(question);
        return ResponseEntity.ok(savedQuestion);
    }

    // Get all questions
    @GetMapping
    public ResponseEntity<List<QuestionEntity>> getAllQuestions() {
        List<QuestionEntity> questions = questionRepository.findAll();
        return ResponseEntity.ok(questions);
    }

    // Get question by ID
    @GetMapping("/{id}")
    public ResponseEntity<QuestionEntity> getQuestionById(@PathVariable Long id) {
        Optional<QuestionEntity> question = questionRepository.findById(id);
        return question.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update question by ID
    @PutMapping("/{id}")
    public ResponseEntity<QuestionEntity> updateQuestion(@PathVariable Long id, @RequestBody QuestionEntity updatedQuestion) {
        return questionRepository.findById(id).map(existing -> {
            existing.setName(updatedQuestion.getName());
            existing.setDescription(updatedQuestion.getDescription());
            QuestionEntity saved = questionRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete question by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        if (questionRepository.existsById(id)) {
            questionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
