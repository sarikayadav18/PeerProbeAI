package com.PeerProbeAI.server.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Auto-generated, so no need to set manually

    @Column(name = "question_id")
    private Long questionId;

    private String input;
    private String output;

    // Required by JPA/Hibernate
    public TestCaseEntity() {}

    // Preferred constructor (without id, since it's auto-generated)
    public TestCaseEntity(Long questionId, String input, String output) {
        this.questionId = questionId;
        this.input = input;
        this.output = output;
    }

    // Getters & Setters (omitted for brevity)


    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }
}