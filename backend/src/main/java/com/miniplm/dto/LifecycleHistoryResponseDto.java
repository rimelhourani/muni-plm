package com.miniplm.dto;

import com.miniplm.model.LifecycleHistory;
import com.miniplm.model.LifecycleState;
import java.time.LocalDateTime;
import java.util.UUID;

public class LifecycleHistoryResponseDto {
    private UUID id;
    private LifecycleState previousState;
    private LifecycleState newState;
    private UserResponseDto changedBy;
    private LocalDateTime changeDate;
    private String comment;

    public LifecycleHistoryResponseDto() {
    }

    public LifecycleHistoryResponseDto(LifecycleHistory history) {
        this.id = history.getId();
        this.previousState = history.getPreviousState();
        this.newState = history.getNewState();
        this.changedBy = new UserResponseDto(history.getChangedBy());
        this.changeDate = history.getChangeDate();
        this.comment = history.getComment();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LifecycleState getPreviousState() {
        return previousState;
    }

    public void setPreviousState(LifecycleState previousState) {
        this.previousState = previousState;
    }

    public LifecycleState getNewState() {
        return newState;
    }

    public void setNewState(LifecycleState newState) {
        this.newState = newState;
    }

    public UserResponseDto getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(UserResponseDto changedBy) {
        this.changedBy = changedBy;
    }

    public LocalDateTime getChangeDate() {
        return changeDate;
    }

    public void setChangeDate(LocalDateTime changeDate) {
        this.changeDate = changeDate;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
