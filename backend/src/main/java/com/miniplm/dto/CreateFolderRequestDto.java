package com.miniplm.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CreateFolderRequestDto {
    @NotBlank(message = "Le nom du dossier ne peut pas être vide")
    private String name;

    private UUID parentFolderId; // optionnel pour les sous-dossiers

    public CreateFolderRequestDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getParentFolderId() {
        return parentFolderId;
    }

    public void setParentFolderId(UUID parentFolderId) {
        this.parentFolderId = parentFolderId;
    }
}
