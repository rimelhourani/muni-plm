package com.miniplm.dto;

import com.miniplm.model.ItemRevision;
import com.miniplm.model.ItemType;
import com.miniplm.model.LifecycleState;
import java.time.LocalDateTime;
import java.util.UUID;

public class ItemRevisionResponseDto {
    private UUID id;
    private UUID itemId; // Item entity primary key
    private String itemBusinessId; // Item itemId (e.g. "PRT-000001")
    private String itemName;
    private String itemDescription;
    private ItemType itemType;
    private String revisionId;
    private LifecycleState lifecycleState;
    private LocalDateTime createdAt;
    private UserResponseDto createdBy;
    private UserResponseDto checkedOutBy;
    private LocalDateTime checkedOutDate;

    public ItemRevisionResponseDto() {
    }

    public ItemRevisionResponseDto(ItemRevision rev) {
        this.id = rev.getId();
        if (rev.getItem() != null) {
            this.itemId = rev.getItem().getId();
            this.itemBusinessId = rev.getItem().getItemId();
            this.itemName = rev.getItem().getName();
            this.itemDescription = rev.getItem().getDescription();
            this.itemType = rev.getItem().getType();
        }
        this.revisionId = rev.getRevisionId();
        this.lifecycleState = rev.getLifecycleState();
        this.createdAt = rev.getCreatedAt();
        this.createdBy = new UserResponseDto(rev.getCreatedBy());
        this.checkedOutBy = rev.getCheckedOutBy() != null ? new UserResponseDto(rev.getCheckedOutBy()) : null;
        this.checkedOutDate = rev.getCheckedOutDate();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getItemId() {
        return itemId;
    }

    public void setItemId(UUID itemId) {
        this.itemId = itemId;
    }

    public String getItemBusinessId() {
        return itemBusinessId;
    }

    public void setItemBusinessId(String itemBusinessId) {
        this.itemBusinessId = itemBusinessId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemDescription() {
        return itemDescription;
    }

    public void setItemDescription(String itemDescription) {
        this.itemDescription = itemDescription;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public String getRevisionId() {
        return revisionId;
    }

    public void setRevisionId(String revisionId) {
        this.revisionId = revisionId;
    }

    public LifecycleState getLifecycleState() {
        return lifecycleState;
    }

    public void setLifecycleState(LifecycleState lifecycleState) {
        this.lifecycleState = lifecycleState;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UserResponseDto getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserResponseDto createdBy) {
        this.createdBy = createdBy;
    }

    public UserResponseDto getCheckedOutBy() {
        return checkedOutBy;
    }

    public void setCheckedOutBy(UserResponseDto checkedOutBy) {
        this.checkedOutBy = checkedOutBy;
    }

    public LocalDateTime getCheckedOutDate() {
        return checkedOutDate;
    }

    public void setCheckedOutDate(LocalDateTime checkedOutDate) {
        this.checkedOutDate = checkedOutDate;
    }
}
