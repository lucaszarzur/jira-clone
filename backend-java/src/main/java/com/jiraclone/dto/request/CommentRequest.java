package com.jiraclone.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Corpo do comentário é obrigatório")
    private String body;

    @NotBlank(message = "Issue ID é obrigatório")
    private String issueId;

    @NotBlank(message = "User ID é obrigatório")
    private String userId;
}
