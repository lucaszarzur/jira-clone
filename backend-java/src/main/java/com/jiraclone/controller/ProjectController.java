package com.jiraclone.controller;

import com.jiraclone.dto.request.ProjectRequest;
import com.jiraclone.dto.response.ProjectDetailResponse;
import com.jiraclone.dto.response.ProjectResponse;
import com.jiraclone.security.UserPrincipal;
import com.jiraclone.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management operations")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "Get all accessible projects (non-paginated)")
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectResponse> projects = projectService.getAllProjects(currentUser);
        return ResponseEntity.ok(projects);
    }

    @Operation(summary = "Get all accessible projects (paginated)")
    @GetMapping(params = "page")
    public ResponseEntity<Page<ProjectResponse>> getAllProjectsPaginated(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<ProjectResponse> projects = projectService.getAllProjects(currentUser, pageable);
        return ResponseEntity.ok(projects);
    }

    @Operation(summary = "Get project details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailResponse> getProjectById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectDetailResponse project = projectService.getProjectById(id, currentUser);
        return ResponseEntity.ok(project);
    }

    @Operation(summary = "Create a new project")
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectResponse project = projectService.createProject(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @Operation(summary = "Update an existing project")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectResponse project = projectService.updateProject(id, request, currentUser);
        return ResponseEntity.ok(project);
    }

    @Operation(summary = "Delete a project")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
