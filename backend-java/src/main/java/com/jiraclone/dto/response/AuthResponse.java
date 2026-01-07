package com.jiraclone.dto.response;

import com.jiraclone.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String name;
    private String email;
    private UserRole role;
    private String avatarUrl;
    private String token;
}
