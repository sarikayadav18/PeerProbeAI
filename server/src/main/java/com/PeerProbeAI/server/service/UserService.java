package com.PeerProbeAI.server.service;

import com.PeerProbeAI.server.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse getCurrentUser(String token);
    UserResponse getUserById(Long id);
    List<UserResponse> getAllUsers();
    UserResponse updateUserRating(Long id, Double newRating);
    UserResponse updateUserProfile(Long id, String name, String email);
}