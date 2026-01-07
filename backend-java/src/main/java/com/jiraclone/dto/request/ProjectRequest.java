package com.jiraclone.dto.request;

import com.jiraclone.domain.enums.ProjectCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank(message = "Nome é obrigatório")
    private String name;

    private String url;

    private String description;

    @NotNull(message = "Categoria é obrigatória")
    private ProjectCategory category;

    private Boolean isPublic;
}
