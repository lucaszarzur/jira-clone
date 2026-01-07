package com.jiraclone.dto.response;

import com.jiraclone.domain.entity.Permission;
import com.jiraclone.domain.enums.ProjectRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {
    private String id;
    private String userId;
    private String projectId;
    private ProjectRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse user;

    public static PermissionResponse from(Permission permission) {
        return PermissionResponse.builder()
            .id(permission.getId())
            .userId(permission.getUserId())
            .projectId(permission.getProjectId())
            .role(permission.getRole())
            .createdAt(permission.getCreatedAt())
            .updatedAt(permission.getUpdatedAt())
            .user(permission.getUser() != null ?
                UserResponse.from(permission.getUser()) : null)
            .build();
    }
}
