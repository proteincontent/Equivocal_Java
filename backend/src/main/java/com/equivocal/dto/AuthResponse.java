package com.equivocal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String token;
    private UserInfo user;
    private String error;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String email;
        private Integer role;
        private Boolean emailVerified;
    }
    
    public static AuthResponse success(String token, UserInfo user) {
        return AuthResponse.builder()
                .success(true)
                .token(token)
                .user(user)
                .build();
    }
    
    public static AuthResponse error(String error) {
        return AuthResponse.builder()
                .success(false)
                .error(error)
                .build();
    }
}