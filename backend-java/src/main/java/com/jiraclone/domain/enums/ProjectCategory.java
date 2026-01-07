package com.jiraclone.domain.enums;

public enum ProjectCategory {
    SOFTWARE("Software"),
    MARKETING("Marketing"),
    BUSINESS("Business");

    private final String value;

    ProjectCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
