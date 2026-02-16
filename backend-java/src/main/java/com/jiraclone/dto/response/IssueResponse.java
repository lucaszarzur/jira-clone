package com.jiraclone.dto.response;

import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.entity.User;
import com.jiraclone.domain.enums.IssueType;
import com.jiraclone.domain.enums.IssueStatus;
import com.jiraclone.domain.enums.IssuePriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueResponse {
    private String id;
    private String title;
    private IssueType type;
    private IssueStatus status;
    private IssuePriority priority;
    private Integer listPosition;
    private String description;
    private Integer estimate;
    private Integer timeSpent;
    private Integer timeRemaining;
    private String reporterId;
    private String projectId;
    private String parentIssueId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UserResponse reporter;
    private List<UserResponse> assignees;
    private Set<String> userIds; // For compatibility with frontend
    private List<CommentResponse> comments;

    // Subtask relationships
    private IssueResponse parentIssue;
    private List<SubtaskSummary> subtasks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubtaskSummary {
        private String id;
        private String title;
        private IssueType type;
        private IssueStatus status;
        private IssuePriority priority;

        public static SubtaskSummary from(Issue issue) {
            return SubtaskSummary.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .type(issue.getType())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .build();
        }
    }

    public static IssueResponse from(Issue issue) {
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
            .parentIssueId(issue.getParentIssueId())
            .createdAt(issue.getCreatedAt())
            .updatedAt(issue.getUpdatedAt())
            .reporter(issue.getReporter() != null ?
                UserResponse.from(issue.getReporter()) : null)
            .assignees(issue.getAssignees().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList()))
            .userIds(issue.getAssignees().stream()
                .map(User::getId)
                .collect(Collectors.toSet()))
            .comments(issue.getComments().stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList()))
            .parentIssue(issue.getParentIssue() != null ?
                fromParent(issue.getParentIssue()) : null)
            .subtasks(issue.getSubtasks().stream()
                .map(SubtaskSummary::from)
                .collect(Collectors.toList()))
            .build();
    }

    // Helper method to avoid infinite recursion when loading parent
    private static IssueResponse fromParent(Issue issue) {
        return IssueResponse.builder()
            .id(issue.getId())
            .title(issue.getTitle())
            .type(issue.getType())
            .status(issue.getStatus())
            .priority(issue.getPriority())
            .projectId(issue.getProjectId())
            .build();
    }
}
