package com.jiraclone.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ProjectCategory {
    SOFTWARE("Software"),
    MARKETING("Marketing"),
    BUSINESS("Business");

    private final String value;

    ProjectCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
