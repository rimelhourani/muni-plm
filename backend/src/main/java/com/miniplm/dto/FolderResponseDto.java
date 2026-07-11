package com.miniplm.dto;

import com.miniplm.model.Folder;
import com.miniplm.model.Item;
import com.miniplm.model.ItemType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class FolderResponseDto {
    private UUID id;
    private String name;
    private UUID parentFolderId;
    private UserResponseDto owner;
    private LocalDateTime createdAt;
    private List<ChildFolderDto> subFolders;
    private List<ChildItemDto> items;

    public FolderResponseDto() {
    }

    public FolderResponseDto(Folder folder) {
        this.id = folder.getId();
        this.name = folder.getName();
        this.parentFolderId = folder.getParentFolder() != null ? folder.getParentFolder().getId() : null;
        this.owner = new UserResponseDto(folder.getOwner());
        this.createdAt = folder.getCreatedAt();
        this.subFolders = folder.getSubFolders().stream()
                .map(ChildFolderDto::new)
                .collect(Collectors.toList());
        this.items = folder.getContainsItems().stream()
                .map(ChildItemDto::new)
                .collect(Collectors.toList());
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public List<ChildFolderDto> getSubFolders() {
        return subFolders;
    }

    public void setSubFolders(List<ChildFolderDto> subFolders) {
        this.subFolders = subFolders;
    }

    public List<ChildItemDto> getItems() {
        return items;
    }

    public void setItems(List<ChildItemDto> items) {
        this.items = items;
    }

    public static class ChildFolderDto {
        private UUID id;
        private String name;

        public ChildFolderDto() {}

        public ChildFolderDto(Folder folder) {
            this.id = folder.getId();
            this.name = folder.getName();
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class ChildItemDto {
        private UUID id;
        private String itemId;
        private String name;
        private ItemType type;

        public ChildItemDto() {}

        public ChildItemDto(Item item) {
            this.id = item.getId();
            this.itemId = item.getItemId();
            this.name = item.getName();
            this.type = item.getType();
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

        public ItemType getType() {
            return type;
        }

        public void setType(ItemType type) {
            this.type = type;
        }
    }
}
