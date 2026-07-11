package com.miniplm.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateRevisionRequestDto {
    @NotBlank(message = "L'identifiant de révision est requis (ex: B, 02)")
    private String revisionId;

    public CreateRevisionRequestDto() {
    }

    public String getRevisionId() {
        return revisionId;
    }

    public void setRevisionId(String revisionId) {
        this.revisionId = revisionId;
    }
}
