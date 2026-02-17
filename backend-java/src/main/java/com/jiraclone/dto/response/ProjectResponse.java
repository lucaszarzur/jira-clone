package com.jiraclone.dto.response;

import com.jiraclone.domain.entity.Project;
import com.jiraclone.domain.enums.ProjectCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private String id;
    private String key;
    private String name;
    private String url;
    private String description;
    private ProjectCategory category;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
            .id(project.getId())
            .key(project.getKey())
            .name(project.getName())
            .url(project.getUrl())
            .description(project.getDescription())
            .category(project.getCategory())
            .isPublic(project.getIsPublic())
            .createdAt(project.getCreatedAt())
            .updatedAt(project.getUpdatedAt())
            .build();
    }
}
