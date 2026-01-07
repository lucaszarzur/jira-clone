package com.jiraclone.dto.response;

import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.entity.Project;
import com.jiraclone.domain.enums.ProjectCategory;
import com.jiraclone.domain.enums.ProjectRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailResponse {
    private String id;
    private String name;
    private String url;
    private String description;
    private ProjectCategory category;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<IssueResponse> issues;
    private ProjectRole userRole;

    public static ProjectDetailResponse from(Project project, ProjectRole userRole, List<Issue> issues) {
        return ProjectDetailResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .url(project.getUrl())
            .description(project.getDescription())
            .category(project.getCategory())
            .isPublic(project.getIsPublic())
            .createdAt(project.getCreatedAt())
            .updatedAt(project.getUpdatedAt())
            .userRole(userRole)
            .issues(issues.stream()
                .map(ProjectDetailResponse::toIssueResponse)
                .collect(Collectors.toList()))
            .build();
    }

    private static IssueResponse toIssueResponse(Issue issue) {
        return IssueResponse.builder()
            .id(issue.getId())
            .title(issue.getTitle())
            .type(issue.getType())
            .status(issue.getStatus())
            .priority(issue.getPriority())
            .listPosition(issue.getListPosition())
            .description(issue.getDescription())
            .estimate(issue.getEstimate())
            .timeSpent(issue.getTimeSpent())
            .timeRemaining(issue.getTimeRemaining())
            .reporterId(issue.getReporterId())
            .projectId(issue.getProjectId())
            .createdAt(issue.getCreatedAt())
            .updatedAt(issue.getUpdatedAt())
            .build();
    }
}
