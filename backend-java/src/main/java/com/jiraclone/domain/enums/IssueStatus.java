package com.jiraclone.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum IssueStatus {
    BACKLOG("Backlog"),
    SELECTED("Selected"),
    IN_PROGRESS("InProgress"),
    DONE("Done");

    private final String value;

    IssueStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static IssueStatus fromString(String text) {
        for (IssueStatus status : IssueStatus.values()) {
            if (status.value.equalsIgnoreCase(text)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No enum constant for value: " + text);
    }
}
