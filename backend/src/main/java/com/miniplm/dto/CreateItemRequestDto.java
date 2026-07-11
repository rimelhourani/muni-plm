package com.miniplm.dto;

import com.miniplm.model.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateItemRequestDto {
    private String itemId; // Optionnel (généré si vide)

    @NotBlank(message = "Le nom de l'item est requis")
    private String name;

    private String description;

    @NotNull(message = "Le type de l'item est requis")
    private ItemType type;

    private UUID folderId; // Optionnel (Home par défaut)

    public CreateItemRequestDto() {
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
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

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }

    public UUID getFolderId() {
        return folderId;
    }

    public void setFolderId(UUID folderId) {
        this.folderId = folderId;
    }
}
