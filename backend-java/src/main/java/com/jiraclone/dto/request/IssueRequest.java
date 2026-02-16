package com.jiraclone.dto.request;

import com.jiraclone.domain.enums.IssueType;
import com.jiraclone.domain.enums.IssueStatus;
import com.jiraclone.domain.enums.IssuePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class IssueRequest {
    @NotBlank(message = "Título é obrigatório")
    private String title;

    @NotNull(message = "Tipo é obrigatório")
    private IssueType type;

    @NotNull(message = "Status é obrigatório")
    private IssueStatus status;

    @NotNull(message = "Prioridade é obrigatória")
    private IssuePriority priority;

    private Integer listPosition;

    private String description;

    private Integer estimate;

    private Integer timeSpent;

    private Integer timeRemaining;

    @NotBlank(message = "Reporter ID é obrigatório")
    private String reporterId;

    @NotBlank(message = "Project ID é obrigatório")
    private String projectId;

    private String parentIssueId; // For subtasks

    private Set<String> userIds; // Assignees
}
