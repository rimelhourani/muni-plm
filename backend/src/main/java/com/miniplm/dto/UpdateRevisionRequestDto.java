package com.miniplm.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateRevisionRequestDto {
    @NotBlank(message = "Le nom ne peut pas être vide")
    private String name;

    private String description;

    public UpdateRevisionRequestDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
