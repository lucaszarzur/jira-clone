package com.jiraclone.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum IssueType {
    STORY("Story"),
    TASK("Task"),
    BUG("Bug");

    private final String value;

    IssueType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
