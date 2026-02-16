package com.jiraclone.controller;

import com.jiraclone.domain.enums.ProjectRole;
import com.jiraclone.dto.request.PermissionRequest;
import com.jiraclone.dto.response.PermissionResponse;
import com.jiraclone.security.UserPrincipal;
import com.jiraclone.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Tag(name = "Permissions", description = "Project permission management")
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<PermissionResponse>> getProjectPermissions(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PermissionResponse> permissions =
            permissionService.getProjectPermissions(projectId, currentUser);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<PermissionResponse> getUserProjectPermission(
            @PathVariable String projectId,
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PermissionResponse permission =
            permissionService.getUserProjectPermission(projectId, userId, currentUser);
        return ResponseEntity.ok(permission);
    }

    @PostMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<PermissionResponse> addUserToProject(
            @PathVariable String projectId,
            @PathVariable String userId,
            @RequestParam ProjectRole role,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PermissionResponse permission =
            permissionService.addUserToProject(projectId, userId, role, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(permission);
    }

    @PutMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<PermissionResponse> updateUserProjectPermission(
            @PathVariable String projectId,
            @PathVariable String userId,
            @Valid @RequestBody PermissionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PermissionResponse permission =
            permissionService.updateUserProjectPermission(projectId, userId, request, currentUser);
        return ResponseEntity.ok(permission);
    }

    @DeleteMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<Void> removeUserProjectPermission(
            @PathVariable String projectId,
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        permissionService.removeUserProjectPermission(projectId, userId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
