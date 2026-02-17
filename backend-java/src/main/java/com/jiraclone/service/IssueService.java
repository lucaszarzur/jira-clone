package com.jiraclone.service;

import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.entity.Permission;
import com.jiraclone.domain.entity.Project;
import com.jiraclone.domain.entity.User;
import com.jiraclone.domain.enums.ProjectRole;
import com.jiraclone.domain.enums.UserRole;
import com.jiraclone.domain.repository.IssueRepository;
import com.jiraclone.domain.repository.PermissionRepository;
import com.jiraclone.domain.repository.ProjectRepository;
import com.jiraclone.domain.repository.UserRepository;
import com.jiraclone.dto.request.ConvertToSubtaskRequest;
import com.jiraclone.dto.request.IssueRequest;
import com.jiraclone.dto.response.IssueResponse;
import com.jiraclone.exception.ForbiddenException;
import com.jiraclone.exception.ResourceNotFoundException;
import com.jiraclone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll().stream()
            .map(IssueResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<IssueResponse> getAllIssues(Pageable pageable) {
        return issueRepository.findAll(pageable)
            .map(IssueResponse::from);
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(String id) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));
        return IssueResponse.from(issue);
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> searchIssues(String term, String projectId) {
        return issueRepository.searchByTermAndProjectId(term, projectId).stream()
            .map(IssueResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public IssueResponse createIssue(IssueRequest request, UserPrincipal currentUser) {
        checkProjectPermission(request.getProjectId(), currentUser, ProjectRole.MEMBER);

        // Verify reporter exists
        userRepository.findById(request.getReporterId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReporterId()));

        // Validate subtask rules
        validateSubtaskRules(request);

        // Generate issue key
        String issueKey = generateIssueKey(request.getProjectId());

        Issue issue = Issue.builder()
            .key(issueKey)
            .title(request.getTitle())
            .type(request.getType())
            .status(request.getStatus())
            .priority(request.getPriority())
            .listPosition(request.getListPosition() != null ? request.getListPosition() : 0)
            .description(request.getDescription())
            .estimate(request.getEstimate())
            .timeSpent(request.getTimeSpent())
            .timeRemaining(request.getTimeRemaining())
            .reporterId(request.getReporterId())
            .projectId(request.getProjectId())
            .parentIssueId(request.getParentIssueId())
            .build();

        issue = issueRepository.save(issue);

        // Add assignees if provided
        if (request.getUserIds() != null && !request.getUserIds().isEmpty()) {
            Set<User> assignees = new HashSet<>();
            for (String userId : request.getUserIds()) {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                assignees.add(user);
            }
            issue.setAssignees(assignees);
            issue = issueRepository.save(issue);
        }

        return IssueResponse.from(issue);
    }

    @Transactional
    public IssueResponse updateIssue(String id, IssueRequest request, UserPrincipal currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        checkProjectPermission(issue.getProjectId(), currentUser, ProjectRole.MEMBER);

        // Validate subtask rules
        validateSubtaskRulesForUpdate(id, request);

        issue.setTitle(request.getTitle());
        issue.setType(request.getType());
        issue.setStatus(request.getStatus());
        issue.setPriority(request.getPriority());
        if (request.getListPosition() != null) {
            issue.setListPosition(request.getListPosition());
        }
        issue.setDescription(request.getDescription());
        issue.setEstimate(request.getEstimate());
        issue.setTimeSpent(request.getTimeSpent());
        issue.setTimeRemaining(request.getTimeRemaining());
        issue.setReporterId(request.getReporterId());
        issue.setProjectId(request.getProjectId());
        issue.setParentIssueId(request.getParentIssueId());

        // Update assignees if provided
        if (request.getUserIds() != null) {
            Set<User> assignees = new HashSet<>();
            for (String userId : request.getUserIds()) {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                assignees.add(user);
            }
            issue.setAssignees(assignees);
        }

        issue = issueRepository.save(issue);

        // Reload issue to get updated relationships
        issue = issueRepository.findById(issue.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        return IssueResponse.from(issue);
    }

    @Transactional
    public void deleteIssue(String id, UserPrincipal currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        checkProjectPermission(issue.getProjectId(), currentUser, ProjectRole.ADMIN);

        issueRepository.delete(issue);
    }

    @Transactional
    public IssueResponse convertToSubtask(String id, ConvertToSubtaskRequest request, UserPrincipal currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        checkProjectPermission(issue.getProjectId(), currentUser, ProjectRole.MEMBER);

        // Validate conversion
        validateConvertToSubtask(issue, request.getParentIssueId());

        // Convert to subtask
        issue.setType(com.jiraclone.domain.enums.IssueType.SUBTASK);
        issue.setParentIssueId(request.getParentIssueId());

        issue = issueRepository.save(issue);

        // Reload to get updated relationships
        issue = issueRepository.findById(issue.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        return IssueResponse.from(issue);
    }

    @Transactional
    public IssueResponse convertToIssue(String id, UserPrincipal currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        checkProjectPermission(issue.getProjectId(), currentUser, ProjectRole.MEMBER);

        // Validate: must be a subtask
        if (issue.getType() != com.jiraclone.domain.enums.IssueType.SUBTASK) {
            throw new IllegalArgumentException("Only subtasks can be converted to regular issues");
        }

        // Convert back to Task (default type)
        issue.setType(com.jiraclone.domain.enums.IssueType.TASK);
        issue.setParentIssueId(null);

        issue = issueRepository.save(issue);

        // Reload to get updated relationships
        issue = issueRepository.findById(issue.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        return IssueResponse.from(issue);
    }

    private void checkProjectPermission(String projectId, UserPrincipal currentUser,
                                         ProjectRole requiredRole) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return; // System admin can do anything
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

    private void validateSubtaskRules(IssueRequest request) {
        // Import IssueType for comparison
        com.jiraclone.domain.enums.IssueType requestType = request.getType();
        String parentIssueId = request.getParentIssueId();

        // Rule 1: If type is SUBTASK, must have parentIssueId
        if (requestType == com.jiraclone.domain.enums.IssueType.SUBTASK &&
            (parentIssueId == null || parentIssueId.trim().isEmpty())) {
            throw new IllegalArgumentException("Subtask must have a parent issue");
        }

        // Rule 2: If has parentIssueId, type must be SUBTASK
        if (parentIssueId != null && !parentIssueId.trim().isEmpty() &&
            requestType != com.jiraclone.domain.enums.IssueType.SUBTASK) {
            throw new IllegalArgumentException("Only subtasks can have a parent issue");
        }

        // Rule 3, 4, 5: Validate parent issue if provided
        if (parentIssueId != null && !parentIssueId.trim().isEmpty()) {
            Issue parentIssue = issueRepository.findById(parentIssueId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent issue", "id", parentIssueId));

            // Rule 4: Parent cannot be a SUBTASK (no nested subtasks)
            if (parentIssue.getType() == com.jiraclone.domain.enums.IssueType.SUBTASK) {
                throw new IllegalArgumentException("Subtask cannot have another subtask as parent");
            }

            // Rule 5: Parent must be in the same project
            if (!parentIssue.getProjectId().equals(request.getProjectId())) {
                throw new IllegalArgumentException("Parent issue must be in the same project");
            }
        }
    }

    private void validateSubtaskRulesForUpdate(String issueId, IssueRequest request) {
        // First apply standard validation
        validateSubtaskRules(request);

        // Additional rule for update: Cannot convert to SUBTASK if issue has existing subtasks
        Issue existingIssue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        if (request.getType() == com.jiraclone.domain.enums.IssueType.SUBTASK &&
            existingIssue.getSubtasks() != null && !existingIssue.getSubtasks().isEmpty()) {
            throw new IllegalArgumentException("Cannot convert issue to subtask because it has existing subtasks");
        }

        // Rule: Cannot remove parent if type is still SUBTASK
        if (request.getType() == com.jiraclone.domain.enums.IssueType.SUBTASK &&
            existingIssue.getParentIssueId() != null &&
            (request.getParentIssueId() == null || request.getParentIssueId().trim().isEmpty())) {
            throw new IllegalArgumentException("Cannot remove parent from subtask. Change type first.");
        }
    }

    private void validateConvertToSubtask(Issue issue, String parentIssueId) {
        // Rule 1: Issue cannot already be a subtask
        if (issue.getType() == com.jiraclone.domain.enums.IssueType.SUBTASK) {
            throw new IllegalArgumentException("Issue is already a subtask");
        }

        // Rule 2: Issue cannot have existing subtasks
        if (issue.getSubtasks() != null && !issue.getSubtasks().isEmpty()) {
            throw new IllegalArgumentException("Cannot convert issue with subtasks to subtask");
        }

        // Rule 3: Parent issue must exist
        Issue parentIssue = issueRepository.findById(parentIssueId)
            .orElseThrow(() -> new ResourceNotFoundException("Parent issue", "id", parentIssueId));

        // Rule 4: Parent cannot be a SUBTASK (no nested subtasks)
        if (parentIssue.getType() == com.jiraclone.domain.enums.IssueType.SUBTASK) {
            throw new IllegalArgumentException("Cannot set subtask as parent");
        }

        // Rule 5: Parent must be in the same project
        if (!parentIssue.getProjectId().equals(issue.getProjectId())) {
            throw new IllegalArgumentException("Parent issue must be in the same project");
        }

        // Rule 6: Cannot convert issue to be subtask of itself
        if (parentIssue.getId().equals(issue.getId())) {
            throw new IllegalArgumentException("Issue cannot be its own parent");
        }
    }

    /**
     * Generate unique issue key for a project
     * Format: {PROJECT_KEY}-{COUNTER}
     * Example: "TFP-1", "TFP-2", "MNP-42"
     */
    private String generateIssueKey(String projectId) {
        // Get project
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        // Increment counter atomically
        projectRepository.incrementIssueCounter(projectId);

        // Flush to ensure counter is updated
        projectRepository.flush();

        // Reload project to get updated counter
        project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        // Generate key: PROJECT_KEY-COUNTER
        return project.getKey() + "-" + project.getIssueCounter();
    }
}
