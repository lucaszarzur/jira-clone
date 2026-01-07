package com.jiraclone.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

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

    @JsonValue
    public String getValue() {
        return value;
    }
}
