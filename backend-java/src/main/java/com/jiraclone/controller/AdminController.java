package com.jiraclone.controller;

import com.jiraclone.domain.enums.UserRole;
import com.jiraclone.exception.ForbiddenException;
import com.jiraclone.security.UserPrincipal;
import com.jiraclone.service.ProjectImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrative operations")
public class AdminController {

    private final ProjectImportService projectImportService;

    @Operation(summary = "Import a project from a JSON seed file in classpath data/")
    @PostMapping("/import-project")
    public ResponseEntity<Map<String, Object>> importProject(
            @RequestParam String file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        requireAdmin(currentUser);

        Map<String, Object> result = projectImportService.importProject(file, currentUser.getId());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Delete an imported project and all its issues")
    @DeleteMapping("/import-project/{projectId}")
    public ResponseEntity<Map<String, Object>> deleteProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        requireAdmin(currentUser);

        Map<String, Object> result = projectImportService.deleteProject(projectId);
        return ResponseEntity.ok(result);
    }

    private void requireAdmin(UserPrincipal currentUser) {
        if (currentUser == null || currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
