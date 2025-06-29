package com.PeerProbeAI.server.dto.response;


import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String name;
    private Double rating;
    private List<String> roles;

    public String getEmail() {
        return email;
    }

    public JwtResponse() {
    }

    public JwtResponse(String email, Long id, String name, Double rating, List<String> roles, String token, String type, String username) {
        this.email = email;
        this.id = id;
        this.name = name;
        this.rating = rating;
        this.roles = roles;
        this.token = token;
        this.type = type;
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // Custom constructor without 'type' parameter
    public JwtResponse(String token, Long id, String username, String email, String name, Double rating, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.rating = rating;
        this.roles = roles;
    }
}