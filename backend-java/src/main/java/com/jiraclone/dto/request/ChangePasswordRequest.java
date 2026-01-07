package com.jiraclone.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Senha atual é obrigatória")
    private String currentPassword;

    @NotBlank(message = "Nova senha é obrigatória")
    private String newPassword;
}
