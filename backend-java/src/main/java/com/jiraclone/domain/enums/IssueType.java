package com.jiraclone.domain.enums;

public enum IssueType {
    STORY("Story"),
    TASK("Task"),
    BUG("Bug");

    private final String value;

    IssueType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
