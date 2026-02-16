package com.jiraclone.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConvertToSubtaskRequest {
    @NotBlank(message = "Parent Issue ID is required")
    private String parentIssueId;
}
