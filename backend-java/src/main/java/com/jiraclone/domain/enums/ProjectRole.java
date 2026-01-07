package com.jiraclone.domain.enums;

public enum ProjectRole {
    ADMIN("admin"),
    MEMBER("member"),
    VIEWER("viewer");

    private final String value;

    ProjectRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public int getHierarchyLevel() {
        return switch (this) {
            case VIEWER -> 0;
            case MEMBER -> 1;
            case ADMIN -> 2;
        };
    }

    public boolean hasPermission(ProjectRole requiredRole) {
        return this.getHierarchyLevel() >= requiredRole.getHierarchyLevel();
    }
}
