package com.jiraclone.controller;

import com.jiraclone.domain.enums.UserRole;
import com.jiraclone.exception.ForbiddenException;
import com.jiraclone.security.UserPrincipal;
import com.jiraclone.service.TestPlanImportService;
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

    private final TestPlanImportService testPlanImportService;

    @Operation(summary = "Import MeuNutria test plan from JSON seed file")
    @PostMapping("/import-test-plan")
    public ResponseEntity<Map<String, Object>> importTestPlan(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        requireAdmin(currentUser);

        Map<String, Object> result = testPlanImportService.importTestPlan(currentUser.getId());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Delete MeuNutria test plan project and all its issues")
    @DeleteMapping("/import-test-plan")
    public ResponseEntity<Map<String, Object>> deleteTestPlan(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        requireAdmin(currentUser);

        Map<String, Object> result = testPlanImportService.deleteTestPlan();
        return ResponseEntity.ok(result);
    }

    private void requireAdmin(UserPrincipal currentUser) {
        if (currentUser == null || currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
