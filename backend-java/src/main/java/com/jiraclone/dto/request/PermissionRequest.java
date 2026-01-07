package com.jiraclone.dto.request;

import com.jiraclone.domain.enums.ProjectRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PermissionRequest {
    @NotBlank(message = "User ID é obrigatório")
    private String userId;

    @NotBlank(message = "Project ID é obrigatório")
    private String projectId;

    @NotNull(message = "Role é obrigatória")
    private ProjectRole role;
}
