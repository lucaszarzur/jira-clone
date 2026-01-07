package com.jiraclone.domain.enums;

public enum IssueStatus {
    BACKLOG("Backlog"),
    SELECTED("Selected"),
    IN_PROGRESS("InProgress"),
    DONE("Done");

    private final String value;

    IssueStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
