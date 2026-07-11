package com.miniplm.dto;

import com.miniplm.model.Item;
import com.miniplm.model.ItemType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ItemResponseDto {
    private UUID id;
    private String itemId;
    private String name;
    private String description;
    private ItemType type;
    private UserResponseDto owner;
    private LocalDateTime createdAt;
    private UUID folderId;
    private List<ItemRevisionResponseDto> revisions;

    public ItemResponseDto() {
    }

    public ItemResponseDto(Item item) {
        this.id = item.getId();
        this.itemId = item.getItemId();
        this.name = item.getName();
        this.description = item.getDescription();
        this.type = item.getType();
        this.owner = new UserResponseDto(item.getOwner());
        this.createdAt = item.getCreatedAt();
        this.folderId = item.getFolder() != null ? item.getFolder().getId() : null;
        this.revisions = item.getRevisions().stream()
                .map(ItemRevisionResponseDto::new)
                .collect(Collectors.toList());
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public UserResponseDto getOwner() {
        return owner;
    }

    public void setOwner(UserResponseDto owner) {
        this.owner = owner;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UUID getFolderId() {
        return folderId;
    }

    public void setFolderId(UUID folderId) {
        this.folderId = folderId;
    }

    public List<ItemRevisionResponseDto> getRevisions() {
        return revisions;
    }

    public void setRevisions(List<ItemRevisionResponseDto> revisions) {
        this.revisions = revisions;
    }
}
