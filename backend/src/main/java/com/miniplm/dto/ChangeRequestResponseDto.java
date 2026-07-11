package com.miniplm.dto;

import com.miniplm.model.ChangeRequest;
import com.miniplm.model.ChangeRequestStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ChangeRequestResponseDto {
    private UUID id;
    private String title;
    private String description;
    private ChangeRequestStatus status;
    private UserResponseDto requester;
    private LocalDateTime createdAt;
    private List<ItemRevisionResponseDto> impactedRevisions;

    public ChangeRequestResponseDto() {
    }

    public ChangeRequestResponseDto(ChangeRequest cr) {
        this.id = cr.getId();
        this.title = cr.getTitle();
        this.description = cr.getDescription();
        this.status = cr.getStatus();
        this.requester = new UserResponseDto(cr.getRequester());
        this.createdAt = cr.getCreatedAt();
        this.impactedRevisions = cr.getImpactedRevisions().stream()
                .map(ItemRevisionResponseDto::new)
                .collect(Collectors.toList());
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ChangeRequestStatus getStatus() {
        return status;
    }

    public void setStatus(ChangeRequestStatus status) {
        this.status = status;
    }

    public UserResponseDto getRequester() {
        return requester;
    }

    public void setRequester(UserResponseDto requester) {
        this.requester = requester;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ItemRevisionResponseDto> getImpactedRevisions() {
        return impactedRevisions;
    }

    public void setImpactedRevisions(List<ItemRevisionResponseDto> impactedRevisions) {
        this.impactedRevisions = impactedRevisions;
    }
}
