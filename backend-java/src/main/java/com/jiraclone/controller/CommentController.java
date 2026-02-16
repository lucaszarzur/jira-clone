package com.jiraclone.controller;

import com.jiraclone.dto.request.CommentRequest;
import com.jiraclone.dto.response.CommentResponse;
import com.jiraclone.security.UserPrincipal;
import com.jiraclone.service.CommentService;
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
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Comment management operations")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "Get all comments")
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getAllComments() {
        List<CommentResponse> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "Get comments by issue ID (non-paginated)")
    @GetMapping("/issue/{issueId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByIssueId(
            @PathVariable String issueId) {
        List<CommentResponse> comments = commentService.getCommentsByIssueId(issueId);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "Get comments by issue ID (paginated)")
    @GetMapping(value = "/issue/{issueId}", params = "page")
    public ResponseEntity<Page<CommentResponse>> getCommentsByIssueIdPaginated(
            @PathVariable String issueId,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        Page<CommentResponse> comments = commentService.getCommentsByIssueId(issueId, pageable);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "Get comment by ID")
    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable String id) {
        CommentResponse comment = commentService.getCommentById(id);
        return ResponseEntity.ok(comment);
    }

    @Operation(summary = "Create a new comment")
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CommentResponse comment = commentService.createComment(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @Operation(summary = "Update a comment")
    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CommentResponse comment = commentService.updateComment(id, request, currentUser);
        return ResponseEntity.ok(comment);
    }

    @Operation(summary = "Delete a comment")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        commentService.deleteComment(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
