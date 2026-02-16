package com.jiraclone.controller;

import com.jiraclone.dto.request.IssueRequest;
import com.jiraclone.dto.response.IssueResponse;
import com.jiraclone.security.UserPrincipal;
import com.jiraclone.service.IssueService;
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
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Tag(name = "Issues", description = "Issue management operations")
public class IssueController {

    private final IssueService issueService;

    @Operation(summary = "Get all issues (non-paginated)")
    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAllIssues() {
        List<IssueResponse> issues = issueService.getAllIssues();
        return ResponseEntity.ok(issues);
    }

    @Operation(summary = "Get all issues (paginated)")
    @GetMapping(params = "page")
    public ResponseEntity<Page<IssueResponse>> getAllIssuesPaginated(
            @PageableDefault(size = 50, sort = "listPosition") Pageable pageable) {
        Page<IssueResponse> issues = issueService.getAllIssues(pageable);
        return ResponseEntity.ok(issues);
    }

    @Operation(summary = "Search issues by title or description")
    @GetMapping("/search")
    public ResponseEntity<List<IssueResponse>> searchIssues(
            @RequestParam String term,
            @RequestParam(required = false) String projectId) {
        List<IssueResponse> issues = issueService.searchIssues(term, projectId);
        return ResponseEntity.ok(issues);
    }

    @Operation(summary = "Get issue by ID")
    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(@PathVariable String id) {
        IssueResponse issue = issueService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }

    @Operation(summary = "Create a new issue")
    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @Valid @RequestBody IssueRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        IssueResponse issue = issueService.createIssue(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(issue);
    }

    @Operation(summary = "Update an existing issue")
    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable String id,
            @Valid @RequestBody IssueRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        IssueResponse issue = issueService.updateIssue(id, request, currentUser);
        return ResponseEntity.ok(issue);
    }

    @Operation(summary = "Delete an issue")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        issueService.deleteIssue(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
