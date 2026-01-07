package com.jiraclone.service;

import com.jiraclone.domain.entity.Issue;
import com.jiraclone.domain.entity.User;
import com.jiraclone.domain.repository.IssueRepository;
import com.jiraclone.domain.repository.UserRepository;
import com.jiraclone.dto.request.IssueRequest;
import com.jiraclone.dto.response.IssueResponse;
import com.jiraclone.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
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

    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll().stream()
            .map(IssueResponse::from)
            .collect(Collectors.toList());
    }

    public IssueResponse getIssueById(String id) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));
        return IssueResponse.from(issue);
    }

    @Transactional
    public IssueResponse createIssue(IssueRequest request) {
        // Verify reporter exists
        userRepository.findById(request.getReporterId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getReporterId()));

        Issue issue = Issue.builder()
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
    public IssueResponse updateIssue(String id, IssueRequest request) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

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
        return IssueResponse.from(issue);
    }

    @Transactional
    public void deleteIssue(String id) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        issueRepository.delete(issue);
    }
}
