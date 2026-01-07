package com.jiraclone.domain.enums;

public enum IssuePriority {
    LOWEST("Lowest"),
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    HIGHEST("Highest");

    private final String value;

    IssuePriority(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
