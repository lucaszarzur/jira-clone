package com.jiraclone.service;

import com.jiraclone.domain.entity.Permission;
import com.jiraclone.domain.enums.ProjectRole;
import com.jiraclone.domain.enums.UserRole;
import com.jiraclone.domain.repository.PermissionRepository;
import com.jiraclone.domain.repository.ProjectRepository;
import com.jiraclone.domain.repository.UserRepository;
import com.jiraclone.dto.request.PermissionRequest;
import com.jiraclone.dto.response.PermissionResponse;
import com.jiraclone.exception.ForbiddenException;
import com.jiraclone.exception.ResourceNotFoundException;
import com.jiraclone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public List<PermissionResponse> getProjectPermissions(String projectId, UserPrincipal currentUser) {
        checkProjectAdminPermission(projectId, currentUser);

        return permissionRepository.findByProjectId(projectId).stream()
            .map(PermissionResponse::from)
            .collect(Collectors.toList());
    }

    public PermissionResponse getUserProjectPermission(String projectId, String userId,
                                                      UserPrincipal currentUser) {
        checkProjectAdminPermission(projectId, currentUser);

        Permission permission = permissionRepository
            .findByUserIdAndProjectId(userId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Permission", "userId and projectId", userId + ", " + projectId));

        return PermissionResponse.from(permission);
    }

    @Transactional
    public PermissionResponse updateUserProjectPermission(String projectId, String userId,
                                                         PermissionRequest request,
                                                         UserPrincipal currentUser) {
        checkProjectAdminPermission(projectId, currentUser);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify project exists
        projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        Permission permission = permissionRepository
            .findByUserIdAndProjectId(userId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Permission", "userId and projectId", userId + ", " + projectId));

        permission.setRole(request.getRole());
        permission = permissionRepository.save(permission);

        return PermissionResponse.from(permission);
    }

    @Transactional
    public void removeUserProjectPermission(String projectId, String userId,
                                          UserPrincipal currentUser) {
        checkProjectAdminPermission(projectId, currentUser);

        permissionRepository.deleteByUserIdAndProjectId(userId, projectId);
    }

    @Transactional
    public PermissionResponse addUserToProject(String projectId, String userId,
                                              ProjectRole role,
                                              UserPrincipal currentUser) {
        checkProjectAdminPermission(projectId, currentUser);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify project exists
        projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        Permission permission = Permission.builder()
            .userId(userId)
            .projectId(projectId)
            .role(role)
            .build();

        permission = permissionRepository.save(permission);
        return PermissionResponse.from(permission);
    }

    private void checkProjectAdminPermission(String projectId, UserPrincipal currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return; // System admin can do anything
        }

        Permission permission = permissionRepository
            .findByUserIdAndProjectId(currentUser.getId(), projectId)
            .orElseThrow(() -> new ForbiddenException(
                "Você não tem permissão para acessar este projeto"));

        if (permission.getRole() != ProjectRole.ADMIN) {
            throw new ForbiddenException(
                "Acesso negado. Requer permissão de admin no projeto.");
        }
    }
}
