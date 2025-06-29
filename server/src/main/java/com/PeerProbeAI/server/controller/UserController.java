package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.dto.response.UserResponse;
import com.PeerProbeAI.server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public UserResponse getCurrentUser(@RequestHeader("Authorization") String token) {
        return userService.getCurrentUser(token);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}/rating")
    @PreAuthorize("hasRole('USER')")
    public UserResponse updateUserRating(@PathVariable Long id, @RequestParam Double rating) {
        return userService.updateUserRating(id, rating);
    }
}