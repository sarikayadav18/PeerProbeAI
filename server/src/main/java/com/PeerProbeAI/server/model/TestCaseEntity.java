package com.PeerProbeAI.server.model;



import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String input;

    private String output;

    // Constructors
    public TestCaseEntity() {}

    public TestCaseEntity(String input, String output) {
        this.input = input;
        this.output = output;
    }

    public TestCaseEntity(Long id, String input, String output) {
        this.id = id;
        this.input = input;
        this.output = output;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

