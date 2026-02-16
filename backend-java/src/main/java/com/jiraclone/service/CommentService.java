package com.jiraclone.service;

import com.jiraclone.domain.entity.Comment;
import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.entity.Permission;
import com.jiraclone.domain.enums.ProjectRole;
import com.jiraclone.domain.enums.UserRole;
import com.jiraclone.domain.repository.CommentRepository;
import com.jiraclone.domain.repository.IssueRepository;
import com.jiraclone.domain.repository.PermissionRepository;
import com.jiraclone.domain.repository.UserRepository;
import com.jiraclone.dto.request.CommentRequest;
import com.jiraclone.dto.response.CommentResponse;
import com.jiraclone.exception.ForbiddenException;
import com.jiraclone.exception.ResourceNotFoundException;
import com.jiraclone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> getAllComments() {
        return commentRepository.findAll().stream()
            .map(CommentResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByIssueId(String issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
            .map(CommentResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByIssueId(String issueId, Pageable pageable) {
        return commentRepository.findByIssueId(issueId, pageable)
            .map(CommentResponse::from);
    }

    @Transactional(readOnly = true)
    public CommentResponse getCommentById(String id) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        return CommentResponse.from(comment);
    }

    @Transactional
    public CommentResponse createComment(CommentRequest request, UserPrincipal currentUser) {
        // Verify issue exists and get its project
        Issue issue = issueRepository.findById(request.getIssueId())
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", request.getIssueId()));

        // Check MEMBER permission on the issue's project
        checkProjectPermission(issue.getProjectId(), currentUser, ProjectRole.MEMBER);

        // Verify user exists
        userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Comment comment = Comment.builder()
            .body(request.getBody())
            .issueId(request.getIssueId())
            .userId(request.getUserId())
            .build();

        comment = commentRepository.save(comment);
        return CommentResponse.from(comment);
    }

    @Transactional
    public CommentResponse updateComment(String id, CommentRequest request, UserPrincipal currentUser) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));

        // Only comment author or project ADMIN can update
        checkCommentOwnerOrAdmin(comment, currentUser);

        comment.setBody(request.getBody());

        comment = commentRepository.save(comment);
        return CommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(String id, UserPrincipal currentUser) {
        Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));

        // Only comment author or project ADMIN can delete
        checkCommentOwnerOrAdmin(comment, currentUser);

        commentRepository.delete(comment);
    }

    private void checkProjectPermission(String projectId, UserPrincipal currentUser,
                                         ProjectRole requiredRole) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }

        Permission permission = permissionRepository
            .findByUserIdAndProjectId(currentUser.getId(), projectId)
            .orElseThrow(() -> new ForbiddenException(
                "You do not have permission to access this project"));

        if (!permission.getRole().hasPermission(requiredRole)) {
            throw new ForbiddenException(
                "Access denied. Requires " + requiredRole.getValue() + " role or higher.");
        }
    }

    private void checkCommentOwnerOrAdmin(Comment comment, UserPrincipal currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }

        // Comment author can always edit/delete their own comments
        if (comment.getUserId().equals(currentUser.getId())) {
            return;
        }

        // Project ADMIN can edit/delete any comment
        Issue issue = issueRepository.findById(comment.getIssueId())
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", comment.getIssueId()));

        Permission permission = permissionRepository
            .findByUserIdAndProjectId(currentUser.getId(), issue.getProjectId())
            .orElse(null);

        if (permission == null || permission.getRole() != ProjectRole.ADMIN) {
            throw new ForbiddenException("Only comment author or project admin can modify this comment");
        }
    }
}
