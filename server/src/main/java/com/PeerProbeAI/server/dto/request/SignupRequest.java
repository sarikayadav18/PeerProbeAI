package com.PeerProbeAI.server.dto.request;

import jakarta.validation.constraints.*;

public class SignupRequest {
    @NotBlank(message = "Name cannot be blank")
    @Size(max = 50, message = "Name must be less than 50 characters")
    private String name;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 20, message = "Username must be between 3-20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    public @NotBlank(message = "Email cannot be blank") @Email(message = "Email should be valid") @Size(max = 50, message = "Email must be less than 50 characters") String getEmail() {
        return email;
    }

    public void setEmail(@NotBlank(message = "Email cannot be blank") @Email(message = "Email should be valid") @Size(max = 50, message = "Email must be less than 50 characters") String email) {
        this.email = email;
    }

    public @NotBlank(message = "Name cannot be blank") @Size(max = 50, message = "Name must be less than 50 characters") String getName() {
        return name;
    }

    public void setName(@NotBlank(message = "Name cannot be blank") @Size(max = 50, message = "Name must be less than 50 characters") String name) {
        this.name = name;
    }

    public @NotBlank(message = "Password cannot be blank") @Size(min = 8, max = 40, message = "Password must be between 8-40 characters") @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Password must contain at least 1 digit, 1 lowercase, 1 uppercase, 1 special character"
    ) String getPassword() {
        return password;
    }

    public void setPassword(@NotBlank(message = "Password cannot be blank") @Size(min = 8, max = 40, message = "Password must be between 8-40 characters") @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Password must contain at least 1 digit, 1 lowercase, 1 uppercase, 1 special character"
    ) String password) {
        this.password = password;
    }

    public @NotBlank(message = "Username cannot be blank") @Size(min = 3, max = 20, message = "Username must be between 3-20 characters") @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores") String getUsername() {
        return username;
    }

    public void setUsername(@NotBlank(message = "Username cannot be blank") @Size(min = 3, max = 20, message = "Username must be between 3-20 characters") @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores") String username) {
        this.username = username;
    }

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    @Size(max = 50, message = "Email must be less than 50 characters")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 40, message = "Password must be between 8-40 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Password must contain at least 1 digit, 1 lowercase, 1 uppercase, 1 special character"
    )
    private String password;
}